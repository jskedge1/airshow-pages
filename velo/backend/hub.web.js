// backend/hub.web.js
// The Big Guide to UK Airshows: My Airshow Hub (member profile and trip planner).
// Every read and write the hub page makes goes through these web methods.
// The hub collections only let admins write directly, so members can only change their own
// records through the checks below (same approach as backend/forum.web.js).

import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { currentMember } from "wix-members-backend";
import { fetch } from "wix-fetch";

const C = {
  trips: "MemberTrips",
  mustSee: "MemberMustSee",
  updates: "MemberUpdates",
  settings: "MemberSettings",
  groups: "TripGroups",
  messages: "GroupMessages",
  past: "PastShows",
  follows: "ForumFollows",
  profiles: "ForumProfiles",
  threads: "ForumThreads",
  comments: "ForumComments",
  likes: "ForumLikes",
  photos: "ForumPhotos",
  aircraft: "AircraftParticipation",
  showInfo: "ShowInfo",
  featured: "FeaturedAirshows",
  news: "AirshowNews"
};

const OPTS = { suppressAuth: true };
const COLOURS = ["#32B4AF", "#6950A1", "#13293C", "#0E5F5B", "#D74949", "#2F6F9F"];
const MAX_TRIPS = 12;
const MAX_MUST_SEE = 60;
const MAX_PAST = 200;
const MAX_LIST = 40;
const WAIT_MESSAGE_MS = 3000;

// Weather points for the featured shows (crowd area, roughly).
const SHOW_POINTS = {
  riat: [51.682, -1.790], cosford: [52.640, -2.306], midlands: [52.203, -1.888], eastbourne: [50.763, 0.285],
  clacton: [51.788, 1.155], wales: [51.615, -3.944], duxford: [52.090, 0.132], shuttleworth: [52.088, -0.320],
  "little-gransden": [52.167, -0.149], southport: [53.648, -3.010], blackpool: [53.810, -3.055], ayr: [55.462, -4.640]
};

// Featured show list names map to the Show Info slugs.
const SHORT_TO_SLUG = {
  "RIAT": "riat", "RAF Cosford": "cosford", "Midlands": "midlands", "Eastbourne": "eastbourne", "Clacton": "clacton",
  "Wales": "wales", "Duxford": "duxford", "Shuttleworth": "shuttleworth", "Little Gransden": "little-gransden",
  "Southport": "southport", "Blackpool": "blackpool", "Ayr": "ayr"
};

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/* ---------- helpers ---------- */

function fail(message) {
  throw { hubMessage: message };
}

async function wrap(fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error("Hub error", e);
    return { ok: false, error: e.hubMessage || "Something went wrong. Please try again in a moment." };
  }
}

function clean(value, max) {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    const control = (code < 32 && code !== 9 && code !== 10) || code === 127;
    if (!control) out += ch;
  }
  return out.trim().slice(0, max);
}

function num(value, min, max) {
  const n = Number(value);
  if (!isFinite(n)) return 0;
  return Math.min(max, Math.max(min, Math.round(n * 100) / 100));
}

function iso(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value.$date || value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function toDate(value) {
  const s = iso(value);
  return s ? new Date(s) : null;
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

async function findOne(collection, field, value) {
  const res = await wixData.query(collection).eq(field, value).limit(1).find(OPTS);
  return res.items[0] || null;
}

async function requireMember() {
  let m = null;
  try {
    m = await currentMember.getMember({ fieldsets: ["PUBLIC"] });
  } catch (e) {
    m = null;
  }
  if (!m || !m._id) fail("Please log in to use your hub.");
  const profile = await findOne(C.profiles, "memberId", m._id);
  const name = (profile && profile.title) || clean((m.profile && m.profile.nickname) || "", 40) || "Airshow fan";
  const colour = (profile && profile.colour) || COLOURS[0];
  return { id: m._id, name, colour, profile };
}

async function ownTrip(memberId, tripId) {
  const trip = await findOne(C.trips, "_id", clean(tripId, 60));
  if (!trip || trip.memberId !== memberId) fail("That trip couldn't be found.");
  return trip;
}

// Pull the first full date out of text such as "Fri 16 – Sun 18 July 2027" or "Sunday 13 June 2027".
function parseShowDates(text, year) {
  const t = (text || "").toLowerCase();
  const re = /(\d{1,2})(?:st|nd|rd|th)?\s*(?:[–\-to ]+\s*(?:[a-z]+\s+)?(\d{1,2})(?:st|nd|rd|th)?)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/;
  const m = re.exec(t);
  if (!m) return { start: null, end: null };
  const y = Number(m[4] || year || new Date().getFullYear());
  const mon = MONTHS.indexOf(m[3]);
  const start = new Date(Date.UTC(y, mon, Number(m[1]), 7, 0));
  const end = m[2] ? new Date(Date.UTC(y, mon, Number(m[2]), 18, 0)) : new Date(Date.UTC(y, mon, Number(m[1]), 18, 0));
  return { start, end: end < start ? start : end };
}

/* ---------- default plan content ---------- */

function defaultTodo() {
  return [
    { id: makeId(), t: "Book tickets", d: "Early tickets are usually cheaper, when I last checked", tag: "Do First", done: false },
    { id: makeId(), t: "Print tickets", d: "Phone screens can struggle in sunlight at the gate", tag: "", done: false },
    { id: makeId(), t: "Plan travel", d: "Train, coach or car park. Book trains early for the best fares", tag: "", done: false },
    { id: makeId(), t: "Check the last train or bus home", d: "Shows usually finish late afternoon", tag: "", done: false },
    { id: makeId(), t: "Read the show rules", d: "Chairs, drones and bag rules change from show to show", tag: "", done: false }
  ];
}

function defaultTimeline(gatesOpen) {
  const gates = /\d{1,2}:\d{2}/.exec(gatesOpen || "");
  return [
    { id: makeId(), time: gates ? gates[0] : "08:00", text: "Gates open. Head to the crowd line first and save your spot", key: true },
    { id: makeId(), time: "09:30", text: "Static park, trade stalls and a chat with the crews", key: false },
    { id: makeId(), time: "11:30", text: "Toilet and food before the flying starts", key: false },
    { id: makeId(), time: "12:00", text: "Flying display begins", key: true },
    { id: makeId(), time: "17:00", text: "Head for the exit or station early to beat the queue", key: false }
  ];
}

function defaultBudget() {
  return [
    { id: makeId(), label: "Tickets", amount: 0 },
    { id: makeId(), label: "Travel", amount: 0 },
    { id: makeId(), label: "Food and drink", amount: 0 },
    { id: makeId(), label: "Merchandise", amount: 0 }
  ];
}

/* ---------- cleaning what members send ---------- */

function cleanTodo(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_LIST).map((x) => ({
    id: clean(x && x.id, 20) || makeId(), t: clean(x && x.t, 80), d: clean(x && x.d, 160),
    tag: clean(x && x.tag, 20), done: !!(x && x.done)
  })).filter((x) => x.t);
}

function cleanTimeline(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_LIST).map((x) => ({
    id: clean(x && x.id, 20) || makeId(), time: /^\d{1,2}:\d{2}$/.test((x && x.time) || "") ? x.time : "",
    text: clean(x && x.text, 140), key: !!(x && x.key)
  })).filter((x) => x.text).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
}

function cleanBudget(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 20).map((x) => ({
    id: clean(x && x.id, 20) || makeId(), label: clean(x && x.label, 40), amount: num(x && x.amount, 0, 100000)
  })).filter((x) => x.label);
}

function cleanPacking(p) {
  const modes = ["day", "photo", "camp"];
  const mode = modes.includes(p && p.mode) ? p.mode : "day";
  const checked = Array.isArray(p && p.checked) ? p.checked.map((x) => clean(x, 20)).filter(Boolean).slice(0, 100) : [];
  const extra = Array.isArray(p && p.extra) ? p.extra.slice(0, 30).map((x) => ({
    id: clean(x && x.id, 20) || makeId(), t: clean(x && x.t, 60), price: num(x && x.price, 0, 10000)
  })).filter((x) => x.t) : [];
  return { mode, checked, extra };
}

/* ---------- shaping ---------- */

function shapeTrip(t) {
  return {
    id: t._id, showSlug: t.showSlug, showName: t.showName, start: iso(t.startDate), end: iso(t.endDate),
    travel: t.travel || "", gatesOpen: t.gatesOpen || "", budgetLimit: t.budgetLimit || 0,
    budget: t.budget || [], timeline: t.timeline || [], todo: t.todo || [],
    packing: t.packing || { mode: "day", checked: [], extra: [] }, groupCode: t.groupCode || ""
  };
}

function shapeUpdate(u) {
  return {
    id: u._id, kind: u.kind, heading: u.heading || "", body: u.body || "", showSlug: u.showSlug || "",
    link: u.link || "", read: !!u.read, created: iso(u._createdDate)
  };
}

/* ---------- show list ---------- */

async function loadShows() {
  const [info, featured] = await Promise.all([
    wixData.query(C.showInfo).limit(100).find(OPTS),
    wixData.query(C.featured).eq("showOnSite", true).ascending("sortOrder").limit(100).find(OPTS)
  ]);
  const bySlug = {};
  info.items.forEach((s) => { bySlug[s.slug] = s; });
  return featured.items.map((f) => {
    const slug = SHORT_TO_SLUG[f.shortName] || clean((f.shortName || f.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"), 40);
    const s = bySlug[slug] || {};
    const dates = parseShowDates(s.dateText || f.dates, s.year);
    return {
      slug, name: f.title, shortName: f.shortName || f.title, link: f.pageLink || "",
      dateText: s.dateText || f.dates || "Date to be confirmed", dateStatus: s.dateStatus || "",
      gatesOpen: s.gatesOpen || "", start: iso(dates.start), end: iso(dates.end)
    };
  });
}

/* ---------- live extras for the dashboard ---------- */

function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function buildReminders(trips) {
  const out = [];
  trips.forEach((t) => {
    const d = daysUntil(t.start);
    if (d === null || d < 0) return;
    const open = (word) => (t.todo || []).some((x) => !x.done && x.t.toLowerCase().includes(word));
    if (open("book tickets")) out.push({ tripId: t.id, heading: "Book tickets for " + t.showName, body: d + " days to go. Early tickets are usually cheaper." });
    if (d <= 90 && open("travel")) out.push({ tripId: t.id, heading: "Plan travel for " + t.showName, body: "Advance train fares usually open around 12 weeks before." });
    if (d <= 14 && open("print")) out.push({ tripId: t.id, heading: "Print your tickets", body: t.showName + " is " + d + " days away." });
    if (d <= 7) out.push({ tripId: t.id, heading: "Show week", body: "The weather for " + t.showName + " is now on your trip." });
  });
  return out.slice(0, 6);
}

async function forecast(slug, start) {
  const pt = SHOW_POINTS[slug];
  const d = daysUntil(start);
  if (!pt || d === null || d > 7 || d < -3) return null;
  const day = new Date(start).toISOString().slice(0, 10);
  const url = "https://api.open-meteo.com/v1/forecast?latitude=" + pt[0] + "&longitude=" + pt[1] +
    "&daily=temperature_2m_max,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant" +
    "&wind_speed_unit=mph&timezone=Europe%2FLondon&start_date=" + day + "&end_date=" + day;
  try {
    const res = await fetch(url, { method: "get" });
    if (!res.ok) return null;
    const j = await res.json();
    const dd = j.daily || {};
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const deg = (dd.wind_direction_10m_dominant || [0])[0];
    return {
      high: Math.round((dd.temperature_2m_max || [0])[0]),
      rain: (dd.precipitation_probability_max || [0])[0],
      wind: Math.round((dd.wind_speed_10m_max || [0])[0]),
      windDir: dirs[Math.round(deg / 45) % 8]
    };
  } catch (e) {
    return null;
  }
}

async function socialUpdates(memberId) {
  const [threads, photos] = await Promise.all([
    wixData.query(C.threads).eq("authorId", memberId).limit(100).find(OPTS),
    wixData.query(C.photos).eq("authorId", memberId).limit(100).find(OPTS)
  ]);
  const titles = {};
  threads.items.forEach((t) => { titles[t._id] = t.title; });
  photos.items.forEach((p) => { titles[p._id] = p.title; });
  const ids = Object.keys(titles);
  if (!ids.length) return [];
  const [comments, likes] = await Promise.all([
    wixData.query(C.comments).hasSome("threadId", ids).ne("authorId", memberId).descending("_createdDate").limit(15).find(OPTS),
    wixData.query(C.likes).hasSome("targetId", ids).ne("memberId", memberId).descending("_createdDate").limit(15).find(OPTS)
  ]);
  const out = [];
  comments.items.forEach((c) => out.push({
    id: "c" + c._id, kind: "social", heading: c.authorName + " commented",
    body: "On “" + (titles[c.threadId] || "your post") + "”: " + (c.body || "").slice(0, 120),
    created: iso(c._createdDate), read: true
  }));
  likes.items.forEach((l) => out.push({
    id: "l" + l._id, kind: "social", heading: "Someone liked your post",
    body: "“" + (titles[l.targetId] || "Your post") + "”", created: iso(l._createdDate), read: true
  }));
  return out;
}

function badgesFor(pastCount, riatCount, photoCount, threadCount) {
  const out = [];
  if (pastCount > 0) out.push({ icon: String(pastCount), label: pastCount === 1 ? "Show Attended" : "Shows Attended" });
  if (riatCount >= 2) out.push({ icon: "★", label: "RIAT Regular", gold: true });
  if (photoCount >= 5) out.push({ icon: "◎", label: "Photographer" });
  if (threadCount >= 10) out.push({ icon: "✎", label: "Storyteller" });
  return out;
}

/* ---------- reading ---------- */

export const getHub = webMethod(Permissions.Anyone, () => wrap(async () => {
  let me = null;
  try {
    me = await requireMember();
  } catch (e) {
    const shows = await loadShows();
    return { member: null, shows };
  }

  const [shows, tripsRes, mustRes, updRes, settings, pastRes, threadsRes, photosRes, followRes] = await Promise.all([
    loadShows(),
    wixData.query(C.trips).eq("memberId", me.id).ne("archived", true).ascending("startDate").limit(MAX_TRIPS).find(OPTS),
    wixData.query(C.mustSee).eq("memberId", me.id).limit(MAX_MUST_SEE).find(OPTS),
    wixData.query(C.updates).eq("memberId", me.id).descending("_createdDate").limit(40).find(OPTS),
    findOne(C.settings, "memberId", me.id),
    wixData.query(C.past).eq("memberId", me.id).descending("year").limit(MAX_PAST).find(OPTS),
    wixData.query(C.threads).eq("authorId", me.id).eq("hidden", false).descending("_createdDate").limit(20).find(OPTS),
    wixData.query(C.photos).eq("authorId", me.id).eq("hidden", false).descending("_createdDate").limit(40).find(OPTS),
    wixData.query(C.follows).eq("followerId", me.id).limit(100).find(OPTS)
  ]);

  const now = Date.now();
  const allTrips = tripsRes.items.map(shapeTrip);
  const upcoming = allTrips.filter((t) => !t.end || new Date(t.end).getTime() > now - 86400000);
  const finished = allTrips.filter((t) => t.end && new Date(t.end).getTime() <= now - 86400000);

  // Trips that have finished move into the member's history automatically.
  for (const t of finished) {
    const year = new Date(t.start || t.end).getFullYear();
    const exists = pastRes.items.some((p) => p.showName === t.showName && p.year === year);
    if (!exists) {
      const p = await wixData.insert(C.past, { title: t.showName + " " + year, memberId: me.id, showName: t.showName, year, note: "", rareAircraft: "" }, OPTS);
      pastRes.items.unshift(p);
    }
    await wixData.update(C.trips, Object.assign({}, tripsRes.items.find((x) => x._id === t.id), { archived: true }), OPTS);
  }

  // Line-up for the shows the member is going to, so they can add must-see aircraft.
  const slugs = Array.from(new Set(upcoming.map((t) => t.showSlug).filter(Boolean)));
  let lineup = [];
  if (slugs.length) {
    const res = await wixData.query(C.aircraft).hasSome("showSlug", slugs).eq("active", true).ascending("displayOrder").limit(400).find(OPTS);
    lineup = res.items.map((a) => ({
      id: a._id, showSlug: a.showSlug, name: a.aircraftName || a.title, operator: a.operator || "", airArm: a.airArm || a.category || "",
      squadron: a.squadron || "", status: a.status || "", flying: !!a.flying, staticDisplay: !!a.staticDisplay, days: a.days || "",
      isNew: a.newUntil ? toDate(a.newUntil).getTime() > now : false
    }));
  }
  const statusById = {};
  lineup.forEach((a) => { statusById[a.id] = a.status; });

  const weather = {};
  for (const t of upcoming.slice(0, 3)) {
    const w = await forecast(t.showSlug, t.start);
    if (w) weather[t.id] = w;
  }

  const following = followRes.items.map((f) => f.followingId);
  let followingProfiles = [];
  if (following.length) {
    const res = await wixData.query(C.profiles).hasSome("memberId", following).limit(100).find(OPTS);
    followingProfiles = res.items.map((p) => ({ memberId: p.memberId, name: p.title, colour: p.colour || COLOURS[0], area: p.area || "", into: p.into || [] }));
  }

  const groupCodes = upcoming.map((t) => t.groupCode).filter(Boolean);
  let groups = [];
  if (groupCodes.length) {
    const res = await wixData.query(C.groups).hasSome("code", groupCodes).limit(20).find(OPTS);
    groups = res.items.map((g) => ({ code: g.code, showName: g.showName, meetingPoint: g.meetingPoint || "", members: g.members || [], bringing: g.bringing || [], isOwner: g.ownerId === me.id }));
  }

  const social = await socialUpdates(me.id);
  const stored = updRes.items.map(shapeUpdate);
  const updates = stored.concat(social).sort((a, b) => (b.created || "").localeCompare(a.created || "")).slice(0, 50);

  const past = pastRes.items.map((p) => ({ id: p._id, showName: p.showName, year: p.year, note: p.note || "", rareAircraft: p.rareAircraft || "" }));
  const riatCount = past.filter((p) => /tattoo|riat|fairford/i.test(p.showName)).length;

  const extras = await hubExtras(me, upcoming);

  return {
    member: {
      id: me.id, name: me.name, colour: me.colour,
      bio: (me.profile && me.profile.bio) || "", area: (me.profile && me.profile.area) || "",
      joined: iso(me.profile && me.profile._createdDate),
      badges: badgesFor(past.length, riatCount, photosRes.items.length, threadsRes.items.length)
    },
    shows,
    trips: upcoming,
    mustSee: mustRes.items.map((m) => ({
      id: m._id, aircraftId: m.aircraftId, showSlug: m.showSlug, showName: m.showName, name: m.aircraftName,
      status: statusById[m.aircraftId] || m.status || "Waiting"
    })),
    lineup,
    updates,
    unread: stored.filter((u) => !u.read).length,
    reminders: buildReminders(upcoming),
    weather,
    notify: Object.assign({ lineup: true, mustSeeOnly: false, news: true, travel: true, social: true }, (settings && settings.notify) || {}),
    past,
    posts: threadsRes.items.map((t) => ({ id: t._id, title: t.title, body: (t.body || "").slice(0, 400), groupSlug: t.groupSlug, likes: t.likeCount || 0, comments: t.commentCount || 0, created: iso(t._createdDate) })),
    photos: photosRes.items.map((p) => ({ id: p._id, title: p.title, image: p.image || "", showName: p.showName || "", aircraft: p.aircraft || "", shutter: p.shutter || "", aperture: p.aperture || "", iso: p.iso || "", focal: p.focal || "", likes: p.likeCount || 0, comments: p.commentCount || 0, created: iso(p._createdDate) })),
    following: followingProfiles,
    groups,
    going: extras.going,
    saved: extras.saved,
    photoOfWeek: extras.photoOfWeek
  };
}));

/* ---------- trips ---------- */

export const addTrip = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const slug = clean(input && input.showSlug, 40);
  const shows = await loadShows();
  const show = shows.find((s) => s.slug === slug);
  if (!show) fail("Choose one of the shows in the list.");
  const count = await wixData.query(C.trips).eq("memberId", me.id).ne("archived", true).count(OPTS);
  if (count >= MAX_TRIPS) fail("You can plan up to " + MAX_TRIPS + " shows at once.");
  const start = toDate(input && input.start) || toDate(show.start);
  const end = toDate(input && input.end) || toDate(show.end) || start;
  const trip = await wixData.insert(C.trips, {
    title: show.name, memberId: me.id, showSlug: show.slug, showName: show.name, startDate: start, endDate: end,
    travel: "", gatesOpen: show.gatesOpen.replace(/\s*\(\d{4}\)/, ""), budgetLimit: 0, budget: defaultBudget(),
    timeline: defaultTimeline(show.gatesOpen), todo: defaultTodo(), packMode: "day",
    packing: { mode: "day", checked: [], extra: [] }, groupCode: "", archived: false
  }, OPTS);
  return shapeTrip(trip);
}));

export const saveTrip = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const trip = await ownTrip(me.id, input && input.id);
  const p = (input && input.changes) || {};
  const next = Object.assign({}, trip);
  if ("travel" in p) next.travel = clean(p.travel, 80);
  if ("gatesOpen" in p) next.gatesOpen = clean(p.gatesOpen, 40);
  if ("start" in p) next.startDate = toDate(p.start) || trip.startDate;
  if ("end" in p) next.endDate = toDate(p.end) || trip.endDate;
  if ("budgetLimit" in p) next.budgetLimit = num(p.budgetLimit, 0, 100000);
  if ("budget" in p) next.budget = cleanBudget(p.budget);
  if ("timeline" in p) next.timeline = cleanTimeline(p.timeline);
  if ("todo" in p) next.todo = cleanTodo(p.todo);
  if ("packing" in p) { next.packing = cleanPacking(p.packing); next.packMode = next.packing.mode; }
  const saved = await wixData.update(C.trips, next, OPTS);
  return shapeTrip(saved);
}));

export const removeTrip = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const trip = await ownTrip(me.id, input && input.id);
  await wixData.remove(C.trips, trip._id, OPTS);
  return { removed: true };
}));

/* ---------- must see aircraft ---------- */

export const toggleMustSee = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const aircraftId = clean(input && input.aircraftId, 60);
  const plane = await findOne(C.aircraft, "_id", aircraftId);
  if (!plane) fail("That aircraft isn't on a line-up any more.");
  const existing = await wixData.query(C.mustSee).eq("memberId", me.id).eq("aircraftId", aircraftId).limit(1).find(OPTS);
  if (existing.items[0]) {
    await wixData.remove(C.mustSee, existing.items[0]._id, OPTS);
    return { added: false };
  }
  const count = await wixData.query(C.mustSee).eq("memberId", me.id).count(OPTS);
  if (count >= MAX_MUST_SEE) fail("Your must see list is full. Remove one first.");
  const item = await wixData.insert(C.mustSee, {
    title: (plane.aircraftName || plane.title) + " at " + plane.showName, memberId: me.id, showSlug: plane.showSlug,
    showName: plane.showName, aircraftId, aircraftName: plane.aircraftName || plane.title, status: plane.status || "Confirmed"
  }, OPTS);
  return { added: true, id: item._id };
}));

/* ---------- updates and settings ---------- */

export const markUpdatesRead = webMethod(Permissions.Anyone, () => wrap(async () => {
  const me = await requireMember();
  const res = await wixData.query(C.updates).eq("memberId", me.id).eq("read", false).limit(100).find(OPTS);
  if (res.items.length) await wixData.bulkUpdate(C.updates, res.items.map((u) => Object.assign({}, u, { read: true })), OPTS);
  return { marked: res.items.length };
}));

export const saveNotify = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const n = (input && input.notify) || {};
  const notify = { lineup: !!n.lineup, mustSeeOnly: !!n.mustSeeOnly, news: !!n.news, travel: !!n.travel, social: !!n.social };
  const existing = await findOne(C.settings, "memberId", me.id);
  if (existing) await wixData.update(C.settings, Object.assign({}, existing, { notify }), OPTS);
  else await wixData.insert(C.settings, { title: me.name, memberId: me.id, notify, following: [] }, OPTS);
  return notify;
}));

/* ---------- airshow history ---------- */

export const addPastShow = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const showName = clean(input && input.showName, 80);
  const year = Math.round(num(input && input.year, 1950, new Date().getFullYear()));
  if (showName.length < 3) fail("Add the name of the show.");
  if (year < 1950) fail("Add the year you went.");
  const p = await wixData.insert(C.past, {
    title: showName + " " + year, memberId: me.id, showName, year,
    note: clean(input && input.note, 140), rareAircraft: clean(input && input.rareAircraft, 80)
  }, OPTS);
  return { id: p._id, showName, year, note: p.note, rareAircraft: p.rareAircraft };
}));

export const removePastShow = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const p = await findOne(C.past, "_id", clean(input && input.id, 60));
  if (!p || p.memberId !== me.id) fail("That show couldn't be found.");
  await wixData.remove(C.past, p._id, OPTS);
  return { removed: true };
}));

/* ---------- trip groups ---------- */

function groupCodeFor(showSlug) {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += letters[Math.floor(Math.random() * letters.length)];
  return (showSlug || "SHOW").slice(0, 3).toUpperCase() + "-" + s;
}

async function memberGroup(me, code) {
  const g = await findOne(C.groups, "code", clean(code, 20).toUpperCase());
  if (!g) fail("That group code wasn't found. Check it with whoever sent it.");
  if (!(g.members || []).some((m) => m.memberId === me.id)) fail("You're not in that group.");
  return g;
}

export const createGroup = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const trip = await ownTrip(me.id, input && input.tripId);
  if (trip.groupCode) fail("This trip already has a group.");
  const code = groupCodeFor(trip.showSlug);
  await wixData.insert(C.groups, {
    title: trip.showName + " group", code, showSlug: trip.showSlug, showName: trip.showName, ownerId: me.id,
    meetingPoint: "", members: [{ memberId: me.id, name: me.name, colour: me.colour, role: "Organiser", status: "going" }], bringing: []
  }, OPTS);
  await wixData.update(C.trips, Object.assign({}, trip, { groupCode: code }), OPTS);
  return { code };
}));

export const joinGroup = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const code = clean(input && input.code, 20).toUpperCase();
  const g = await findOne(C.groups, "code", code);
  if (!g) fail("That group code wasn't found. Check it with whoever sent it.");
  const members = g.members || [];
  if (members.length >= 20) fail("This group is full.");
  if (!members.some((m) => m.memberId === me.id)) {
    members.push({ memberId: me.id, name: me.name, colour: me.colour, role: "", status: "going" });
    await wixData.update(C.groups, Object.assign({}, g, { members }), OPTS);
  }
  const found = await wixData.query(C.trips).eq("memberId", me.id).eq("showSlug", g.showSlug).ne("archived", true).limit(1).find(OPTS);
  let trip = found.items[0];
  if (!trip) {
    const shows = await loadShows();
    const show = shows.find((s) => s.slug === g.showSlug) || { name: g.showName, gatesOpen: "", start: null, end: null };
    trip = await wixData.insert(C.trips, {
      title: g.showName, memberId: me.id, showSlug: g.showSlug, showName: g.showName,
      startDate: toDate(show.start), endDate: toDate(show.end), travel: "", gatesOpen: show.gatesOpen || "",
      budgetLimit: 0, budget: defaultBudget(), timeline: defaultTimeline(show.gatesOpen), todo: defaultTodo(),
      packMode: "day", packing: { mode: "day", checked: [], extra: [] }, groupCode: code, archived: false
    }, OPTS);
  } else if (trip.groupCode !== code) {
    await wixData.update(C.trips, Object.assign({}, trip, { groupCode: code }), OPTS);
  }
  return { code, showName: g.showName };
}));

export const leaveGroup = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const g = await memberGroup(me, input && input.code);
  const members = (g.members || []).filter((m) => m.memberId !== me.id);
  if (!members.length) await wixData.remove(C.groups, g._id, OPTS);
  else await wixData.update(C.groups, Object.assign({}, g, { members, ownerId: g.ownerId === me.id ? members[0].memberId : g.ownerId }), OPTS);
  const trips = await wixData.query(C.trips).eq("memberId", me.id).eq("groupCode", g.code).limit(5).find(OPTS);
  for (const t of trips.items) await wixData.update(C.trips, Object.assign({}, t, { groupCode: "" }), OPTS);
  return { left: true };
}));

export const saveGroup = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const g = await memberGroup(me, input && input.code);
  const p = (input && input.changes) || {};
  const next = Object.assign({}, g);
  if ("meetingPoint" in p) next.meetingPoint = clean(p.meetingPoint, 140);
  if ("bringing" in p && Array.isArray(p.bringing)) {
    next.bringing = p.bringing.slice(0, 30).map((b) => ({ id: clean(b && b.id, 20) || makeId(), item: clean(b && b.item, 60), who: clean(b && b.who, 40) })).filter((b) => b.item);
  }
  if ("myRole" in p || "myStatus" in p) {
    next.members = (g.members || []).map((m) => m.memberId !== me.id ? m : Object.assign({}, m, {
      role: "myRole" in p ? clean(p.myRole, 20) : m.role,
      status: ["going", "maybe"].includes(p.myStatus) ? p.myStatus : m.status
    }));
  }
  const saved = await wixData.update(C.groups, next, OPTS);
  return { code: saved.code, meetingPoint: saved.meetingPoint, members: saved.members, bringing: saved.bringing };
}));

export const listGroupMessages = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const g = await memberGroup(me, input && input.code);
  const res = await wixData.query(C.messages).eq("groupCode", g.code).descending("_createdDate").limit(50).find(OPTS);
  return res.items.reverse().map((m) => ({ id: m._id, authorId: m.authorId, authorName: m.authorName, colour: m.authorColour, body: m.body, created: iso(m._createdDate), mine: m.authorId === me.id }));
}));

export const sendGroupMessage = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const g = await memberGroup(me, input && input.code);
  const body = clean(input && input.body, 600);
  if (!body) fail("Write a message first.");
  const last = await wixData.query(C.messages).eq("authorId", me.id).descending("_createdDate").limit(1).find(OPTS);
  if (last.items[0] && Date.now() - new Date(last.items[0]._createdDate).getTime() < WAIT_MESSAGE_MS) fail("Slow down a little, then send again.");
  const m = await wixData.insert(C.messages, { title: g.code, groupCode: g.code, authorId: me.id, authorName: me.name, authorColour: me.colour, body }, OPTS);
  return { id: m._id, authorName: me.name, colour: me.colour, body, created: iso(m._createdDate), mine: true };
}));

/* ---------- following members ---------- */

export const findMembers = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const q = clean(input && input.query, 40);
  if (q.length < 2) return [];
  const res = await wixData.query(C.profiles).contains("title", q).ne("blocked", true).limit(12).find(OPTS);
  const follows = await wixData.query(C.follows).eq("followerId", me.id).limit(200).find(OPTS);
  const set = new Set(follows.items.map((f) => f.followingId));
  return res.items.filter((p) => p.memberId !== me.id).map((p) => ({ memberId: p.memberId, name: p.title, colour: p.colour || COLOURS[0], area: p.area || "", following: set.has(p.memberId) }));
}));

export const toggleFollow = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const target = clean(input && input.memberId, 60);
  if (!target || target === me.id) fail("You can't follow that member.");
  const profile = await findOne(C.profiles, "memberId", target);
  if (!profile) fail("That member couldn't be found.");
  const existing = await wixData.query(C.follows).eq("followerId", me.id).eq("followingId", target).limit(1).find(OPTS);
  if (existing.items[0]) {
    await wixData.remove(C.follows, existing.items[0]._id, OPTS);
    return { following: false };
  }
  await wixData.insert(C.follows, { title: me.name + " follows " + profile.title, followerId: me.id, followingId: target }, OPTS);
  await wixData.insert(C.updates, { title: "follow:" + me.id + ":" + target, memberId: target, kind: "social", heading: me.name + " followed you", body: "They'll see your new posts and photos.", showSlug: "", link: "", read: false }, OPTS);
  return { following: true };
}));

/* ---------- community feed, who's going, photo of the week and saved tools ---------- */
// Feed posts and polls are forum threads, so they also appear in the forum groups and in the
// forum admin page. Likes, comments, votes and reports use the same forum collections.

const FEED_PAGE = 10;
const WAIT_FEED_POST_MS = 30000;
const WAIT_FEED_COMMENT_MS = 8000;
const FEED_GROUP_SHOW = "show-reports-and-reviews";
const FEED_GROUP_CHAT = "meet-ups-and-site-feedback";
const NEWS_GROUP = "airshow-news-and-rumours";
const PHOTO_COMMENT_SLUG = "__photo";
const SAVED = "SavedTools";
const MAX_SAVED = 40;
const TOOL_KINDS = ["settings", "propblur", "kit", "sun"];

function staticPhoto(url) {
  const s = String(url || "");
  const m = /^wix:image:\/\/v1\/([^/#]+)/.exec(s);
  if (m) return "https://static.wixstatic.com/media/" + m[1];
  return /^https:\/\/static\.wixstatic\.com\/media\/[A-Za-z0-9_~.-]+$/.test(s) ? s : "";
}

async function blockedCheck(me) {
  if (me.profile && me.profile.blocked) fail("Your account can't post in the community. Contact the guide team if you think this is a mistake.");
}

async function lastBy(collection, memberId) {
  const res = await wixData.query(collection).eq("authorId", memberId).descending("_createdDate").limit(1).find(OPTS);
  return res.items[0] || null;
}

function shapePoll(poll, votes, memberId) {
  const options = ((poll && poll.options) || []).map((o) => ({
    id: o.id, label: o.label, votes: votes.filter((v) => v.optionId === o.id).length
  }));
  const mine = votes.find((v) => v.memberId === memberId);
  return { options, myVote: mine ? mine.optionId : "" };
}

async function feedDetails(rows, me) {
  const ids = rows.map((r) => r._id);
  if (!ids.length) return [];
  const [likes, comments, votes] = await Promise.all([
    me ? wixData.query(C.likes).eq("title", "like").eq("memberId", me.id).hasSome("targetId", ids).limit(100).find(OPTS) : { items: [] },
    wixData.query(C.comments).hasSome("threadId", ids).eq("hidden", false).descending("_createdDate").limit(200).find(OPTS),
    wixData.query(C.likes).eq("title", "vote").hasSome("targetId", ids).limit(1000).find(OPTS)
  ]);
  const liked = new Set(likes.items.map((l) => l.targetId));
  return rows.map((r) => {
    const isPhoto = r.__kind === "photo";
    const own = comments.items.filter((c) => c.threadId === r._id).slice(0, 3).reverse();
    const out = {
      id: r._id, kind: isPhoto ? "photo" : (r.poll ? "poll" : "thread"),
      authorName: r.authorName || "Airshow fan", colour: r.authorColour || COLOURS[0],
      mine: !!(me && r.authorId === me.id), pinned: !!r.pinned && !isPhoto,
      label: r.pinned && !isPhoto ? (r.groupSlug === NEWS_GROUP ? "Show News" : "From Jack") : "",
      showName: r.showName || "", title: isPhoto ? r.title : (r.poll ? "" : (r.fromHub ? "" : r.title)),
      body: isPhoto ? (r.description || "") : (r.poll ? (r.poll.question || r.title) : (r.body || "")),
      created: iso(r._createdDate), likes: r.likeCount || 0, liked: liked.has(r._id), comments: r.commentCount || 0,
      commentList: own.map((c) => ({ authorName: c.authorName, colour: c.authorColour || COLOURS[0], body: c.body }))
    };
    if (isPhoto) {
      Object.assign(out, {
        image: staticPhoto(r.image), shutter: r.shutter || "", aperture: r.aperture || "", iso: r.iso || "", focal: r.focal || "",
        tags: [r.aircraft, r.category].filter(Boolean)
      });
    }
    if (r.poll) {
      out.poll = shapePoll(r.poll, votes.items.filter((v) => v.targetId === r._id), me && me.id);
      if (r.body && r.body !== r.poll.question) out.title = r.poll.question;
      if (r.body && r.body !== r.poll.question) out.body = r.body;
    }
    return out;
  });
}

export const getFeed = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  let me = null;
  try { me = await requireMember(); } catch (e) { me = null; }
  const scope = ["shows", "following", "all", "photos"].includes(input && input.scope) ? input.scope : "all";
  const skip = Math.max(0, Math.min(400, Number(input && input.cursor) || 0));

  let threadQ = wixData.query(C.threads).eq("hidden", false);
  let photoQ = wixData.query(C.photos).eq("hidden", false);
  let noThreads = scope === "photos";
  let noPhotos = false;

  if (scope === "shows" && me) {
    const trips = await wixData.query(C.trips).eq("memberId", me.id).ne("archived", true).limit(MAX_TRIPS).find(OPTS);
    const slugs = Array.from(new Set(trips.items.map((t) => t.showSlug).filter(Boolean)));
    const shows = await loadShows();
    const names = [];
    shows.filter((s) => slugs.includes(s.slug)).forEach((s) => { names.push(s.name, s.shortName); });
    if (!slugs.length) { noThreads = true; noPhotos = true; }
    else { threadQ = threadQ.hasSome("showSlug", slugs); photoQ = photoQ.hasSome("showName", names); }
  }
  if (scope === "following") {
    if (!me) { noThreads = true; noPhotos = true; }
    else {
      const f = await wixData.query(C.follows).eq("followerId", me.id).limit(200).find(OPTS);
      const ids = f.items.map((x) => x.followingId);
      if (!ids.length) { noThreads = true; noPhotos = true; }
      else { threadQ = threadQ.hasSome("authorId", ids); photoQ = photoQ.hasSome("authorId", ids); }
    }
  }

  const take = skip + FEED_PAGE;
  const [threads, photos, pinned] = await Promise.all([
    noThreads ? { items: [] } : threadQ.ne("pinned", true).descending("_createdDate").limit(take).find(OPTS),
    noPhotos ? { items: [] } : photoQ.descending("_createdDate").limit(take).find(OPTS),
    skip ? { items: [] } : wixData.query(C.threads).eq("hidden", false).eq("pinned", true).descending("_createdDate").limit(2).find(OPTS)
  ]);
  const merged = threads.items.map((t) => Object.assign({ __kind: "thread" }, t))
    .concat(photos.items.map((p) => Object.assign({ __kind: "photo" }, p)))
    .sort((a, b) => new Date(b._createdDate) - new Date(a._createdDate));
  const page = merged.slice(skip, skip + FEED_PAGE);
  const more = threads.items.length === take || photos.items.length === take || merged.length > skip + FEED_PAGE;

  const shaped = await feedDetails(pinned.items.map((t) => Object.assign({ __kind: "thread" }, t)).concat(page), me);
  return {
    pinned: shaped.slice(0, pinned.items.length),
    items: shaped.slice(pinned.items.length),
    cursor: more ? String(skip + FEED_PAGE) : ""
  };
}));

async function feedTarget(input) {
  const id = clean(input && input.id, 60);
  const isPhoto = input && input.kind === "photo";
  const collection = isPhoto ? C.photos : C.threads;
  const item = await findOne(collection, "_id", id);
  if (!item || item.hidden) fail("That post has been removed.");
  return { item, collection, isPhoto };
}

export const feedLike = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const { item, collection } = await feedTarget(input);
  const existing = await wixData.query(C.likes).eq("title", "like").eq("targetId", item._id).eq("memberId", me.id).limit(1).find(OPTS);
  let liked;
  if (existing.items.length) { await wixData.remove(C.likes, existing.items[0]._id, OPTS); liked = false; }
  else { await wixData.insert(C.likes, { title: "like", targetId: item._id, memberId: me.id }, OPTS); liked = true; }
  const likes = Math.max(0, (item.likeCount || 0) + (liked ? 1 : -1));
  await wixData.update(collection, Object.assign({}, item, { likeCount: likes }), OPTS);
  return { liked, likes };
}));

export const feedComment = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  await blockedCheck(me);
  const { item, collection, isPhoto } = await feedTarget(input);
  if (item.locked && !isPhoto) fail("Comments are turned off on this post.");
  const body = clean(input && input.body, 2000);
  if (!body) fail("Write something before you reply.");
  const last = await lastBy(C.comments, me.id);
  if (last && Date.now() - new Date(last._createdDate).getTime() < WAIT_FEED_COMMENT_MS) fail("You've just commented. Please wait a few seconds.");
  await wixData.insert(C.comments, {
    title: body.slice(0, 60), threadId: item._id, groupSlug: isPhoto ? PHOTO_COMMENT_SLUG : item.groupSlug, body,
    authorId: me.id, authorName: me.name, authorColour: me.colour, hidden: false, reportCount: 0, reportReasons: []
  }, OPTS);
  await wixData.update(collection, Object.assign({}, item, { commentCount: (item.commentCount || 0) + 1, lastActivity: new Date() }), OPTS);
  if (me.profile) await wixData.update(C.profiles, Object.assign({}, me.profile, { commentCount: (me.profile.commentCount || 0) + 1 }), OPTS);
  return { authorName: me.name, colour: me.colour, body };
}));

export const feedReport = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const { item, collection } = await feedTarget(input);
  const already = await wixData.query(C.likes).eq("title", "flag").eq("targetId", item._id).eq("memberId", me.id).limit(1).find(OPTS);
  if (already.items.length) return { reported: true };
  await wixData.insert(C.likes, { title: "flag", targetId: item._id, memberId: me.id }, OPTS);
  await wixData.update(collection, Object.assign({}, item, {
    reportCount: (item.reportCount || 0) + 1,
    reportReasons: (item.reportReasons || []).concat(["Reported from the hub feed"]).slice(-10)
  }), OPTS);
  return { reported: true };
}));

async function newFeedThread(me, fields) {
  await blockedCheck(me);
  const last = await lastBy(C.threads, me.id);
  if (last && Date.now() - new Date(last._createdDate).getTime() < WAIT_FEED_POST_MS) fail("You've just posted. Please wait a few seconds before posting again.");
  const shows = await loadShows();
  const show = shows.find((s) => s.slug === clean(fields.showSlug, 40));
  const groupSlug = show ? FEED_GROUP_SHOW : FEED_GROUP_CHAT;
  const group = await findOne("ForumGroups", "slug", groupSlug);
  const now = new Date();
  const t = await wixData.insert(C.threads, Object.assign({
    groupSlug, authorId: me.id, authorName: me.name, authorColour: me.colour,
    showSlug: show ? show.slug : "", showName: show ? show.shortName : "", fromHub: true,
    pinned: false, locked: false, hidden: false, likeCount: 0, commentCount: 0, reportCount: 0, reportReasons: [], lastActivity: now
  }, fields.data), OPTS);
  if (group) await wixData.update("ForumGroups", Object.assign({}, group, { threadCount: (group.threadCount || 0) + 1, lastActivity: now }), OPTS);
  if (me.profile) await wixData.update(C.profiles, Object.assign({}, me.profile, { threadCount: (me.profile.threadCount || 0) + 1 }), OPTS);
  const [shaped] = await feedDetails([Object.assign({ __kind: "thread" }, t)], me);
  return shaped;
}

function threadTitle(text) {
  const first = text.split("\n")[0].slice(0, 80);
  return first.length >= 4 ? first : (first + " from the hub").slice(0, 80);
}

export const feedPost = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const body = clean(input && input.body, 5000);
  if (body.length < 2) fail("Add a few words to your post.");
  return newFeedThread(me, { showSlug: input && input.showSlug, data: { title: threadTitle(body), body } });
}));

export const createPoll = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const question = clean(input && input.question, 120);
  if (question.length < 4) fail("Write a question of at least 4 characters.");
  const labels = (Array.isArray(input && input.options) ? input.options : []).map((o) => clean(o, 60)).filter(Boolean).slice(0, 4);
  if (labels.length < 2) fail("Add at least two options.");
  const body = clean(input && input.body, 2000) || question;
  const poll = { question, options: labels.map((label) => ({ id: makeId(), label })) };
  return newFeedThread(me, { showSlug: input && input.showSlug, data: { title: question, body, poll } });
}));

export const votePoll = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const t = await findOne(C.threads, "_id", clean(input && input.id, 60));
  if (!t || t.hidden || !t.poll) fail("That poll has been removed.");
  const optionId = clean(input && input.optionId, 20);
  if (!(t.poll.options || []).some((o) => o.id === optionId)) fail("Choose one of the poll's answers.");
  const mine = await wixData.query(C.likes).eq("title", "vote").eq("targetId", t._id).eq("memberId", me.id).limit(1).find(OPTS);
  if (!mine.items.length) await wixData.insert(C.likes, { title: "vote", targetId: t._id, memberId: me.id, optionId }, OPTS);
  const votes = await wixData.query(C.likes).eq("title", "vote").eq("targetId", t._id).limit(1000).find(OPTS);
  return shapePoll(t.poll, votes.items, me.id);
}));

/* who's going */

async function goingFor(me, trips) {
  const out = {};
  const slugs = Array.from(new Set(trips.map((t) => t.showSlug).filter(Boolean)));
  if (!slugs.length) return out;
  const others = await wixData.query(C.trips).hasSome("showSlug", slugs).eq("shareGoing", true).ne("archived", true).limit(300).find(OPTS);
  const ids = Array.from(new Set(others.items.map((x) => x.memberId)));
  const profs = ids.length ? await wixData.query(C.profiles).hasSome("memberId", ids).ne("blocked", true).limit(300).find(OPTS) : { items: [] };
  const byId = {};
  profs.items.forEach((p) => { byId[p.memberId] = p; });
  const raw = await wixData.query(C.trips).eq("memberId", me.id).hasSome("showSlug", slugs).ne("archived", true).limit(MAX_TRIPS).find(OPTS);
  raw.items.forEach((mine) => {
    const people = others.items.filter((x) => x.showSlug === mine.showSlug && byId[x.memberId]).map((x) => ({
      name: x.memberId === me.id ? byId[x.memberId].title + " (you)" : byId[x.memberId].title,
      colour: byId[x.memberId].colour || COLOURS[0], note: x.goingNote || "", me: x.memberId === me.id
    })).sort((a, b) => (b.me ? 1 : 0) - (a.me ? 1 : 0)).slice(0, 30);
    out[mine._id] = { sharing: !!mine.shareGoing, note: mine.goingNote || "", people };
  });
  return out;
}

export const setGoing = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const trip = await ownTrip(me.id, input && input.tripId);
  const saved = await wixData.update(C.trips, Object.assign({}, trip, { shareGoing: !!(input && input.sharing), goingNote: clean(input && input.note, 60) }), OPTS);
  const g = await goingFor(me, [{ showSlug: saved.showSlug }]);
  return g[saved._id] || { sharing: !!saved.shareGoing, note: saved.goingNote || "", people: [] };
}));

/* photo of the week */

async function photoOfWeek() {
  const since = new Date(Date.now() - 7 * 86400000);
  let res = await wixData.query(C.photos).eq("hidden", false).ge("_createdDate", since).gt("likeCount", 0).descending("likeCount").limit(1).find(OPTS);
  if (!res.items.length) res = await wixData.query(C.photos).eq("hidden", false).eq("featured", true).limit(1).find(OPTS);
  const p = res.items[0];
  if (!p) return null;
  return { title: p.title, authorName: p.authorName || "", likes: p.likeCount || 0, image: staticPhoto(p.image) };
}

/* saved tools */

function shapeSaved(s) {
  return {
    id: s._id, tool: s.tool, title: s.title, subtitle: s.subtitle || "", rows: s.rows || [],
    link: s.link || "", linkLabel: s.linkLabel || "", saved: iso(s._createdDate)
  };
}

async function savedFor(memberId) {
  const res = await wixData.query(SAVED).eq("memberId", memberId).descending("_createdDate").limit(MAX_SAVED).find(OPTS);
  return res.items.map(shapeSaved);
}

// Called from the settings finder, kit calculator and sun guide pages ("Save to my hub").
export const saveToolResult = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const tool = TOOL_KINDS.includes(input && input.tool) ? input.tool : "settings";
  const title = clean(input && input.title, 60);
  if (title.length < 2) fail("Give this result a name.");
  const rows = (Array.isArray(input && input.rows) ? input.rows : []).slice(0, 8)
    .map((r) => [clean(r && r[0], 30), clean(r && r[1], 40)]).filter((r) => r[0] && r[1]);
  const link = clean(input && input.link, 300);
  const count = await wixData.query(SAVED).eq("memberId", me.id).count(OPTS);
  if (count >= MAX_SAVED) fail("You've saved the most results allowed. Remove one in your hub first.");
  const s = await wixData.insert(SAVED, {
    memberId: me.id, tool, title, subtitle: clean(input && input.subtitle, 80), rows,
    link: /^\/[A-Za-z0-9\-/#?=&_.]*$/.test(link) ? link : "", linkLabel: clean(input && input.linkLabel, 40)
  }, OPTS);
  return shapeSaved(s);
}));

export const removeSaved = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await requireMember();
  const s = await findOne(SAVED, "_id", clean(input && input.id, 60));
  if (!s || s.memberId !== me.id) fail("That saved result couldn't be found.");
  await wixData.remove(SAVED, s._id, OPTS);
  return { removed: true };
}));

async function hubExtras(me, upcoming) {
  const [going, saved, potw] = await Promise.all([
    goingFor(me, upcoming).catch(() => ({})),
    savedFor(me.id).catch(() => []),
    photoOfWeek().catch(() => null)
  ]);
  return { going, saved, photoOfWeek: potw };
}
