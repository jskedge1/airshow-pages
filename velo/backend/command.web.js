// backend/command.web.js
// The Big Guide to UK Airshows: Jack's Command Centre (Wix page /site-admin, page code velo/page-code/site-admin.js).
// One read that gathers the whole site: traffic, Airshow Hub, traders, forum, content, pages and the admin board,
// plus the moderation and member notice actions that only the command centre has.
// Every request checks the Admin role first. Plans, log, checks and publishing reuse backend/admin.web.js,
// and trader approvals reuse backend/traders.web.js, so there is one set of rules for each job.
//
// Traffic figures need the same "ukagApiKey" secret as the admin board (Site Analytics read permission).
// Without it the traffic panel says what is missing and everything else still works.

import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { currentMember } from "wix-members-backend";
import { getSecret } from "wix-secrets-backend";
import { fetch } from "wix-fetch";

const SITE_ID = "073f6961-6a1c-4313-a30e-a850cc8c3512";
const ADMIN_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const OPTS = { suppressAuth: true };
const FOUNDING_PLACES = 25;
const TRAFFIC_DAYS = 30;
const WEEKS_SHOWN = 8;

const C = {
  members: "Members/PrivateMembersData",
  trips: "MemberTrips",
  mustSee: "MemberMustSee",
  updates: "MemberUpdates",
  settings: "MemberSettings",
  hangar: "MemberHangar",
  tripGroups: "TripGroups",
  groupMessages: "GroupMessages",
  past: "PastShows",
  saved: "SavedTools",
  checklist: "ShowChecklist",
  profiles: "ForumProfiles",
  threads: "ForumThreads",
  comments: "ForumComments",
  photos: "ForumPhotos",
  likes: "ForumLikes",
  follows: "ForumFollows",
  forumGroups: "ForumGroups",
  traders: "Traders",
  traderShows: "TraderShows",
  news: "AirshowNews",
  featured: "FeaturedAirshows",
  aircraft: "AircraftParticipation",
  crowd: "CrowdReports",
  uploads: "ProgrammeUploads",
  contact: "ContactMessages",
  contactForm: "contactForm",
  plans: "AdminPlans",
  ideas: "AdminIdeas",
  log: "AdminLog",
  checks: "AdminChecks"
};

const TRADER_SHOWS = {
  duxford: "Duxford", shuttleworth: "Shuttleworth", midlands: "Midlands", cosford: "Cosford", wales: "Wales",
  riat: "RIAT", "little-gransden": "Little Gransden", blackpool: "Blackpool", eastbourne: "Eastbourne",
  clacton: "Clacton", southport: "Southport", ayr: "Ayr"
};
const PLAN_NAMES = { free: "Static Display", flypast: "Flypast", headliner: "Headliner" };

/* ---------- helpers ---------- */

function fail(message) {
  throw { commandMessage: message };
}

async function wrap(fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error("Command centre error", e);
    return { ok: false, error: e.commandMessage || "Something went wrong. Please try again in a moment." };
  }
}

async function isAdmin() {
  try {
    const roles = await currentMember.getRoles();
    return roles.some((r) => r._id === ADMIN_ROLE_ID || r._id === "2162459d-8a75-4c73-9f2f-0f821a5e21a2" || r.title === "Admin" || r["name"] === "Admin" || r.title === "Guide Admin" || r["name"] === "Guide Admin");
  } catch (e) {
    return false;
  }
}

async function requireAdmin() {
  if (!(await isAdmin())) fail("This page is for the site admin only.");
}

function clean(value, max) {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if ((code >= 32 && code !== 127) || code === 10) out += ch;
  }
  return out.trim().slice(0, max);
}

function londonDate(d) {
  return new Date(d).toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

async function count(collection, build) {
  try {
    let q = wixData.query(collection);
    if (build) q = build(q);
    return await q.count(OPTS);
  } catch (e) {
    return null;
  }
}

async function find(collection, build, limit) {
  try {
    let q = wixData.query(collection);
    if (build) q = build(q);
    const res = await q.limit(limit || 100).find(OPTS);
    return res.items;
  } catch (e) {
    return [];
  }
}

function tally(items, keyOf) {
  const out = {};
  items.forEach((i) => {
    const k = keyOf(i);
    if (!k) return;
    out[k] = (out[k] || 0) + 1;
  });
  return Object.keys(out).map((k) => ({ name: k, count: out[k] })).sort((a, b) => b.count - a.count);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function byWeek(items) {
  const since = startOfWeek(new Date(Date.now() - (WEEKS_SHOWN - 1) * 7 * 86400000));
  const weeks = [];
  for (let i = 0; i < WEEKS_SHOWN; i++) {
    const start = new Date(since.getTime() + i * 7 * 86400000);
    weeks.push({ start: londonDate(start), count: 0, t: start.getTime() });
  }
  items.forEach((m) => {
    const t = new Date(m._createdDate).getTime();
    for (let i = weeks.length - 1; i >= 0; i--) {
      if (t >= weeks[i].t) {
        weeks[i].count++;
        break;
      }
    }
  });
  return weeks.map((w) => ({ start: w.start, count: w.count }));
}

/* ---------- Wix REST, with the API key secret ---------- */

async function secret(name) {
  try {
    return await getSecret(name);
  } catch (e) {
    return "";
  }
}

async function wixApi(method, url) {
  const key = await secret("ukagApiKey");
  if (!key) return { missingKey: true };
  const res = await fetch(url, { method, headers: { Authorization: key, "wix-site-id": SITE_ID, "Content-Type": "application/json" } });
  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    json = {};
  }
  if (!res.ok) return { error: (json && json.message) || ("Wix said " + res.status) };
  return json;
}

async function traffic() {
  const end = londonDate(Date.now());
  const start = londonDate(Date.now() - (TRAFFIC_DAYS - 1) * 86400000);
  const types = ["TOTAL_SESSIONS", "TOTAL_UNIQUE_VISITORS", "TOTAL_FORMS_SUBMITTED", "CLICKS_TO_CONTACT"];
  const url = "https://www.wixapis.com/analytics/v2/site-analytics/data?dateRange.startDate=" + start +
    "&dateRange.endDate=" + end + types.map((t) => "&measurementTypes=" + t).join("");
  const r = await wixApi("GET", url);
  if (r.missingKey) return { known: false, note: "Add the ukagApiKey secret to see visits" };
  if (r.error) return { known: false, note: r.error };
  const out = { known: true, from: start, to: end };
  (r.data || []).forEach((m) => {
    out[m.type] = { total: m.total || 0, days: (m.values || []).map((v) => ({ date: v.date, value: v.value || 0 })) };
  });
  return out;
}

async function siteStatus() {
  const r = await wixApi("GET", "https://www.wixapis.com/urls-server/v2/published-site-urls");
  if (r.missingKey) return { known: false, note: "Add the ukagApiKey secret to see this" };
  if (r.error) return { known: false, note: r.error };
  const urls = r.urls || r.publishedSiteUrls || [];
  return { known: true, live: urls.length > 0 };
}

/* ---------- each part of the site ---------- */

async function hub() {
  const weekStart = startOfWeek(new Date());
  const [members, membersWeek, joined, trips, tripsAll, mustSee, updates, unread, settings, hangar, groups, groupMessages, past, saved, checklist] = await Promise.all([
    count(C.members),
    count(C.members, (q) => q.ge("_createdDate", weekStart)),
    find(C.members, (q) => q.descending("_createdDate"), 1000),
    count(C.trips, (q) => q.ne("archived", true)),
    find(C.trips, (q) => q.ne("archived", true), 1000),
    count(C.mustSee),
    count(C.updates),
    count(C.updates, (q) => q.eq("read", false)),
    count(C.settings),
    count(C.hangar),
    count(C.tripGroups),
    count(C.groupMessages),
    count(C.past),
    count(C.saved),
    count(C.checklist)
  ]);
  return {
    members, membersWeek, trips, mustSee, updates, unread, settings, hangar, groups, groupMessages, past, saved, checklist,
    weeks: byWeek(joined),
    newest: joined.slice(0, 6).map((m) => ({ name: clean(m.name || m.nickname || m.slug || "Member", 60), joined: m._createdDate })),
    tripsByShow: tally(tripsAll, (t) => t.showName || t.showSlug)
  };
}

async function traders() {
  const [all, shows] = await Promise.all([
    find(C.traders, (q) => q.descending("_createdDate"), 1000),
    find(C.traderShows, null, 1000)
  ]);
  const queue = all.filter((t) => t.status === "pending" || (t.pending && Object.keys(t.pending).length));
  return {
    total: all.length,
    live: all.filter((t) => t.status === "live").length,
    pending: all.filter((t) => t.status === "pending").length,
    paused: all.filter((t) => t.status === "paused").length,
    sentBack: all.filter((t) => t.status === "sentBack").length,
    founding: { taken: all.filter((t) => t.founding).length, total: FOUNDING_PLACES },
    byPlan: tally(all.filter((t) => t.status === "live"), (t) => PLAN_NAMES[t.plan] || PLAN_NAMES.free),
    byCategory: tally(all, (t) => t.category),
    byShow: tally(shows.filter((s) => s.status !== "cancelled"), (s) => TRADER_SHOWS[s.showId] || s.title),
    weeks: byWeek(all),
    queue: queue.slice(0, 20).map((t) => ({
      id: t._id,
      name: clean(t.title || "", 80),
      town: clean(t.town || "", 60),
      category: t.category || "",
      requestedPlan: t.requestedPlan || "",
      isNew: t.status === "pending",
      submitted: t.submittedDate || t._createdDate
    })),
    list: all.slice(0, 60).map((t) => ({ id: t._id, name: clean(t.title || "", 80), status: t.status || "", plan: PLAN_NAMES[t.plan] || PLAN_NAMES.free, founding: !!t.founding, town: clean(t.town || "", 60) }))
  };
}

async function forum() {
  const [profiles, threads, photos, comments, likes, follows, groups, recentThreads, recentPhotos, reportedThreads, reportedPhotos, reportedComments, allThreads] = await Promise.all([
    count(C.profiles),
    count(C.threads, (q) => q.ne("hidden", true)),
    count(C.photos, (q) => q.ne("hidden", true)),
    count(C.comments, (q) => q.ne("hidden", true)),
    count(C.likes, (q) => q.eq("title", "like")),
    count(C.follows),
    find(C.forumGroups, (q) => q.ascending("sortOrder"), 100),
    find(C.threads, (q) => q.ne("hidden", true).descending("_createdDate"), 8),
    find(C.photos, (q) => q.ne("hidden", true).descending("_createdDate"), 4),
    find(C.threads, (q) => q.gt("reportCount", 0).ne("hidden", true).descending("_updatedDate"), 20),
    find(C.photos, (q) => q.gt("reportCount", 0).ne("hidden", true).descending("_updatedDate"), 20),
    find(C.comments, (q) => q.gt("reportCount", 0).ne("hidden", true).descending("_updatedDate"), 20),
    find(C.threads, (q) => q.ne("hidden", true), 1000)
  ]);
  const reported = []
    .concat(reportedThreads.map((i) => ({ kind: "thread", item: i })))
    .concat(reportedPhotos.map((i) => ({ kind: "photo", item: i })))
    .concat(reportedComments.map((i) => ({ kind: "comment", item: i })))
    .map((r) => ({
      kind: r.kind,
      id: r.item._id,
      title: clean(r.item.title || r.item.caption || r.item.body || "", 90),
      by: clean(r.item.authorName || "", 60),
      reports: r.item.reportCount || 0,
      reasons: (r.item.reportReasons || []).slice(-2)
    }));
  const activity = recentThreads.map((t) => ({ kind: "Post", title: clean(t.title || "", 90), by: clean(t.authorName || "", 60), when: t._createdDate, likes: t.likeCount || 0, comments: t.commentCount || 0 }))
    .concat(recentPhotos.map((p) => ({ kind: "Photo", title: clean(p.caption || p.title || "", 90), by: clean(p.authorName || "", 60), when: p._createdDate, likes: p.likeCount || 0, comments: p.commentCount || 0 })))
    .sort((a, b) => new Date(b.when) - new Date(a.when))
    .slice(0, 10);
  return {
    profiles, threads, photos, comments, likes, follows,
    groups: groups.map((g) => ({ name: g.title, slug: g.slug, status: g.status || "active", threads: g.threadCount || 0 })),
    pendingGroups: groups.filter((g) => g.status === "suggested" || g.status === "pending").length,
    weeks: byWeek(allThreads),
    reported,
    activity
  };
}

async function content() {
  const [news, newsLatest, featured, aircraft, crowd, uploadsHeld, contactA, contactB] = await Promise.all([
    count(C.news, (q) => q.ne("showSlug", "_meta")),
    find(C.news, (q) => q.ne("showSlug", "_meta").descending("_createdDate"), 6),
    find(C.featured, (q) => q.ascending("sortOrder"), 50),
    count(C.aircraft),
    count(C.crowd),
    count(C.uploads, (q) => q.eq("status", "Held")),
    find(C.contact, (q) => q.descending("_createdDate"), 10),
    find(C.contactForm, (q) => q.descending("_createdDate"), 10)
  ]);
  const questions = contactA.concat(contactB)
    .sort((x, y) => new Date(y._createdDate) - new Date(x._createdDate))
    .slice(0, 8)
    .map((m) => ({
      id: m._id,
      box: contactA.indexOf(m) > -1 ? "contact" : "contactForm",
      when: m._createdDate,
      name: clean(m.name || m.firstName || m.title || "", 60),
      email: clean(m.email || "", 120),
      topic: clean(m.topic || m.show || "", 80),
      message: clean(m.message || m.body || m.text || "", 1200),
      repliedOn: m.repliedOn || null
    }));
  return {
    news,
    newsLatest: newsLatest.map((n) => ({ title: clean(n.title || "", 100), show: n.showName || "", when: n._createdDate })),
    shows: featured.filter((f) => f.title).map((f) => ({ name: f.title, dates: f.dates || "" })),
    aircraft, crowd, uploadsHeld, questions
  };
}

async function board() {
  const since = londonDate(Date.now() - 42 * 86400000);
  const [plans, ideas, log, checks] = await Promise.all([
    find(C.plans, (q) => q.ascending("sort"), 200),
    find(C.ideas, (q) => q.descending("votes"), 200),
    find(C.log, (q) => q.ge("logDate", since).descending("logDate").descending("_createdDate"), 200),
    find(C.checks, (q) => q.ascending("sort"), 200)
  ]);
  return {
    plans: plans.map((p) => ({ id: p._id, title: p.title, due: p.due || "", gate: p.gate || "", status: p.status || "Scheduled" })),
    ideas: ideas.map((i) => ({ id: i._id, title: i.title, area: i.area || "", status: i.status || "standby", votes: i.votes || 0 })),
    log: log.map((l) => ({ date: l.logDate, type: l.type || "Updated", what: l.title, area: l.area || "" })),
    pages: checks.map((c) => ({ id: c._id, page: c.title, wixPath: c.wixPath || "", file: c.pageUrl || "", desktop: c.desktop || "Not checked", mobile: c.mobile || "Not checked", tablet: c.tablet || "Not checked", lastChecked: c.lastChecked || "" }))
  };
}

/* ---------- the one read ---------- */

export const getCommand = webMethod(Permissions.Anyone, () => wrap(async () => {
  if (!(await isAdmin())) return { admin: false };
  const [site, visits, hubData, traderData, forumData, contentData, boardData] = await Promise.all([
    siteStatus(), traffic(), hub(), traders(), forum(), content(), board()
  ]);
  return { admin: true, now: new Date().toISOString(), site, traffic: visits, hub: hubData, traders: traderData, forum: forumData, content: contentData, board: boardData };
}));

/* ---------- forum moderation ---------- */

const MOD_COLLECTIONS = { thread: C.threads, photo: C.photos, comment: C.comments };

async function addLog(type, what, area) {
  await wixData.insert(C.log, { logDate: londonDate(Date.now()), type, title: what, area, source: "Command centre", link: "" }, OPTS);
}

// Hides a reported post, photo or comment from the forum. It stays in the collection so it can be brought back.
export const hideForumItem = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const coll = MOD_COLLECTIONS[input && input.kind] || fail("Pick a post, photo or comment.");
  const item = await wixData.get(coll, String(input.id || ""), OPTS);
  if (!item) fail("That item has already gone.");
  await wixData.update(coll, Object.assign({}, item, { hidden: true, hiddenBy: "Admin", hiddenOn: new Date() }), OPTS);
  await addLog("Changed", "Forum " + input.kind + " hidden after reports: " + clean(item.title || item.caption || item.body || "", 60), "Community");
  return { hidden: true };
}));

// Keeps a reported item and clears its reports, for when the report was not fair.
export const clearForumReports = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const coll = MOD_COLLECTIONS[input && input.kind] || fail("Pick a post, photo or comment.");
  const item = await wixData.get(coll, String(input.id || ""), OPTS);
  if (!item) fail("That item has already gone.");
  await wixData.update(coll, Object.assign({}, item, { reportCount: 0, reportReasons: [] }), OPTS);
  return { cleared: true };
}));

/* ---------- a notice to every Airshow Hub member ---------- */

// Drops an on-site notification into every member's hub (the bell in My Airshow Hub).
export const sendMemberNotice = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const heading = clean(input && input.heading, 80);
  const body = clean(input && input.body, 300);
  const link = clean(input && input.link, 200);
  if (!heading) fail("Give the notice a heading.");
  const members = await find(C.members, null, 1000);
  const stamp = Date.now();
  const rows = members.map((m) => ({ title: "notice:" + stamp + ":" + m._id, memberId: m._id, kind: "site", heading, body, showSlug: "", link, read: false }));
  for (let i = 0; i < rows.length; i += 50) await wixData.bulkInsert(C.updates, rows.slice(i, i + 50), OPTS);
  await addLog("Added", "Notice sent to " + rows.length + " hub members: " + heading, "My Airshow Hub");
  return { sent: rows.length };
}));

/* ---------- contact form replies (6 Nov 2026) ---------- */

const REPLY_BOXES = { contact: C.contact, contactForm: C.contactForm };

// The reply itself goes from Jack's own email app (the command centre opens it ready written).
// This marks the message as replied, so the command centre shows it, and adds a line to the log.
export const markReplied = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const coll = REPLY_BOXES[input && input.box] || fail("That message could not be found.");
  const item = await wixData.get(coll, String(input.id || ""), OPTS);
  if (!item) fail("That message has gone.");
  await wixData.update(coll, Object.assign({}, item, { repliedOn: new Date() }), OPTS);
  await addLog("Replied", "Replied to " + clean(item.name || "a visitor", 60) + " from the contact form", "Contact");
  return { id: item._id };
}));

