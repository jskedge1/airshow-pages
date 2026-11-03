// backend/profile.web.js
// The Big Guide to UK Airshows: My Profile, the one place a member sees everything they have signed up to.
// Every part of the site uses the same Wix member account, so this module reads what that one account
// has in each area (My Airshow Hub, the Airshow Forum, the Volunteer Hub and the Trader Hub) and hands
// the page one summary. It only reads, apart from saveProfile and uploadPhoto, which go through the
// forum's own checks so the forum profile and this profile are always the same record.

import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { currentMember } from "wix-members-backend";
import { getSession, getProfile, saveMyProfile, uploadMyPhoto } from "backend/forum.web";
import { getMe } from "backend/team.web";
import { getMyTrader } from "backend/traders.web";

const OPTS = { suppressAuth: true };
const C = {
  trips: "MemberTrips",
  mustSee: "MemberMustSee",
  updates: "MemberUpdates",
  past: "PastShows",
  settings: "MemberSettings",
  follows: "ForumFollows",
  profiles: "ForumProfiles",
  threads: "ForumThreads",
  comments: "ForumComments",
  likes: "ForumLikes",
  photos: "ForumPhotos"
};

// What other members can see. Everything is shown unless the member turns it off in Settings.
const PRIVACY_KEYS = ["area", "going", "followers", "passport"];
function privacyOf(settings) {
  const p = (settings && settings.privacy) || {};
  const out = {};
  PRIVACY_KEYS.forEach((k) => { out[k] = p[k] !== false; });
  return out;
}

function iso(d) {
  if (!d) return null;
  const x = d instanceof Date ? d : new Date(d);
  return isNaN(x.getTime()) ? null : x.toISOString();
}

async function wrap(fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error("Profile error", e);
    return { ok: false, error: e.profileMessage || "Something went wrong. Please try again in a moment." };
  }
}

function fail(message) {
  const e = new Error(message);
  e.profileMessage = message;
  throw e;
}

async function memberOrNull() {
  try {
    const m = await currentMember.getMember({ fieldsets: ["FULL"] });
    return m && m._id ? m : null;
  } catch (e) {
    return null;
  }
}

// A part that fails should never break the whole profile, so each one is read on its own.
async function safe(fn, fallback) {
  try {
    return await fn();
  } catch (e) {
    console.error("Profile part failed", e);
    return fallback;
  }
}

async function hubPart(memberId) {
  const now = Date.now();
  const [trips, must, unread, past] = await Promise.all([
    wixData.query(C.trips).eq("memberId", memberId).ne("archived", true).ascending("startDate").limit(12).find(OPTS),
    wixData.query(C.mustSee).eq("memberId", memberId).count(OPTS),
    wixData.query(C.updates).eq("memberId", memberId).ne("read", true).count(OPTS),
    wixData.query(C.past).eq("memberId", memberId).descending("year").limit(200).find(OPTS)
  ]);
  const riatCount = past.items.filter((p) => /air tattoo|riat/i.test(p.showName || p.title || "")).length;
  const upcoming = trips.items
    .filter((t) => !t.endDate || new Date(t.endDate).getTime() > now - 86400000)
    .map((t) => ({ id: t._id, showName: t.showName || "Airshow", showSlug: t.showSlug || "", start: iso(t.startDate), end: iso(t.endDate) }));
  return {
    joined: upcoming.length > 0 || must > 0 || past.items.length > 0,
    trips: upcoming,
    mustSee: must,
    unread,
    pastCount: past.items.length,
    riatCount,
    past: past.items.map((p) => ({ showName: p.showName || p.title || "", year: p.year || null, note: p.note || "", rare: p.rareAircraft || "" }))
  };
}

async function forumPart(memberId) {
  const session = await getSession();
  if (!session.ok || !session.data.member) return { joined: false };
  const res = await getProfile({ memberId });
  const prof = res.ok ? res.data : null;
  const [followers, following, photoCount] = await Promise.all([
    wixData.query(C.follows).eq("followingId", memberId).count(OPTS),
    wixData.query(C.follows).eq("followerId", memberId).count(OPTS),
    wixData.query(C.photos).eq("authorId", memberId).eq("hidden", false).count(OPTS)
  ]);
  const p = prof ? prof.profile : {};
  return {
    joined: true,
    profile: p,
    isAdmin: !!session.data.member.isAdmin,
    groups: session.data.member.groups || [],
    threads: prof ? prof.threads.slice(0, 5).map((t) => ({ id: t.id, title: t.title, group: t.groupSlug || "", created: t.created || null, replies: t.commentCount || 0, likes: t.likeCount || 0 })) : [],
    gallery: prof ? prof.gallery.slice(0, 6).map((g) => ({ id: g.id, title: g.title || "", url: g.image || "", show: g.showName || "" })) : [],
    threadCount: p.threadCount || 0,
    commentCount: p.commentCount || 0,
    photoCount,
    followers,
    following
  };
}

async function teamPart() {
  const res = await getMe();
  if (!res.ok || !res.data.loggedIn) return { joined: false, status: "none" };
  const d = res.data;
  const v = d.vols && d.vols[d.meId];
  const work = d.work || [];
  return {
    joined: d.status !== "none",
    status: d.status,
    isAdmin: !!d.isAdmin,
    roles: (v && v.roles) || [],
    shows: (v && v.shows) || [],
    workCount: work.length,
    liveCount: work.filter((w) => w.st === "live" || w.status === "live").length
  };
}

async function traderPart() {
  const res = await getMyTrader();
  if (!res.ok || !res.data.loggedIn || !res.data.trader) return { joined: false };
  const t = res.data.trader;
  return {
    joined: true,
    status: t.status,
    waiting: !!t.waiting,
    planName: t.planName || "",
    name: (t.listing && t.listing.name) || "",
    showCount: (t.shows || []).length
  };
}


function badgesFor(hub, forum, team) {
  const out = [];
  const past = hub.pastCount || 0;
  if (past > 0) out.push({ k: "shows", label: past + (past === 1 ? " Show Attended" : " Shows Attended") });
  if ((hub.riatCount || 0) >= 2) out.push({ k: "riat", label: "RIAT Regular", gold: true });
  if ((forum.photoCount || 0) >= 5) out.push({ k: "photo", label: "Photographer" });
  if ((forum.threadCount || 0) >= 10) out.push({ k: "story", label: "Storyteller" });
  if ((hub.trips || []).length >= 3) out.push({ k: "season", label: "Busy Season" });
  if (team.status === "active" || team.status === "paused") out.push({ k: "team", label: "Guide Team", gold: true });
  return out;
}

// Members this person follows who have saved one of the same shows.
async function whosGoing(memberId, trips) {
  const slugs = Array.from(new Set(trips.map((t) => t.showSlug).filter(Boolean)));
  if (!slugs.length) return [];
  const follows = await wixData.query(C.follows).eq("followerId", memberId).limit(200).find(OPTS);
  const ids = follows.items.map((f) => f.followingId).filter(Boolean);
  if (!ids.length) return [];
  const [theirTrips, settings, profiles] = await Promise.all([
    wixData.query(C.trips).hasSome("memberId", ids).hasSome("showSlug", slugs).ne("archived", true).limit(200).find(OPTS),
    wixData.query(C.settings).hasSome("memberId", ids).limit(200).find(OPTS),
    wixData.query(C.profiles).hasSome("memberId", ids).limit(200).find(OPTS)
  ]);
  const hidden = {};
  settings.items.forEach((x) => { if (!privacyOf(x).going) hidden[x.memberId] = true; });
  const prof = {};
  profiles.items.forEach((p) => { prof[p.memberId] = p; });
  const byShow = {};
  theirTrips.items.forEach((t) => {
    if (hidden[t.memberId] || !prof[t.memberId]) return;
    const key = t.showSlug;
    byShow[key] = byShow[key] || { showSlug: key, showName: t.showName || "", people: [] };
    if (!byShow[key].people.some((x) => x.memberId === t.memberId)) {
      const p = prof[t.memberId];
      byShow[key].people.push({ memberId: t.memberId, name: p.title || "Airshow fan", colour: p.colour || "#32B4AF", photo: p.photo || "" });
    }
  });
  return Object.keys(byShow).map((k) => byShow[k]);
}

// One list of everything new: show updates from the hub, replies and likes on forum posts, team and trader news.
async function notificationsFor(memberId, team, trader) {
  const [updates, threads] = await Promise.all([
    wixData.query(C.updates).eq("memberId", memberId).descending("_createdDate").limit(20).find(OPTS),
    wixData.query(C.threads).eq("authorId", memberId).limit(50).find(OPTS)
  ]);
  const out = updates.items.map((u) => ({
    id: "u" + u._id, kind: u.kind === "social" ? "forum" : "hub", heading: u.heading || "Show update", body: u.body || "",
    link: u.link || "", read: !!u.read, created: iso(u._createdDate)
  }));
  const titles = {};
  threads.items.forEach((t) => { titles[t._id] = t.title; });
  const ids = Object.keys(titles);
  if (ids.length) {
    const [comments, likes] = await Promise.all([
      wixData.query(C.comments).hasSome("threadId", ids).ne("authorId", memberId).descending("_createdDate").limit(15).find(OPTS),
      wixData.query(C.likes).hasSome("targetId", ids).ne("memberId", memberId).descending("_createdDate").limit(15).find(OPTS)
    ]);
    comments.items.forEach((c) => out.push({
      id: "c" + c._id, kind: "forum", heading: (c.authorName || "A member") + " replied",
      body: "On \u201c" + (titles[c.threadId] || "your post") + "\u201d: " + (c.body || "").slice(0, 120),
      link: "/community-forum", read: true, created: iso(c._createdDate)
    }));
    likes.items.forEach((l) => out.push({
      id: "l" + l._id, kind: "forum", heading: "Someone liked your post", body: "\u201c" + (titles[l.targetId] || "Your post") + "\u201d",
      link: "/community-forum", read: true, created: iso(l._createdDate)
    }));
  }
  if (team.status === "waiting") out.push({ id: "team", kind: "team", heading: "Your request to join the team", body: "Thanks for asking. I read every request myself and will be in touch.", link: "/volunteer-hub", read: true, created: null });
  if (trader.joined && trader.waiting) out.push({ id: "trader", kind: "trader", heading: "Your stall listing", body: "Your listing is waiting for a check before it goes live.", link: "/trader-hub", read: true, created: null });
  out.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
  return out.slice(0, 30);
}

export const getMyProfile = webMethod(Permissions.Anyone, () => wrap(async () => {
  const m = await memberOrNull();
  if (!m) return { loggedIn: false };
  const first = (m.contactDetails && m.contactDetails.firstName) || "";
  const last = (m.contactDetails && m.contactDetails.lastName) || "";
  const nick = (m.profile && m.profile.nickname) || "";
  const [hub, forum, team, trader] = await Promise.all([
    safe(() => hubPart(m._id), { joined: false, trips: [], mustSee: 0, unread: 0, pastCount: 0, past: [] }),
    safe(() => forumPart(m._id), { joined: false }),
    safe(() => teamPart(), { joined: false, status: "none" }),
    safe(() => traderPart(), { joined: false })
  ]);
  const fp = forum.profile || {};
  const [settings, going, notes] = await Promise.all([
    safe(() => wixData.query(C.settings).eq("memberId", m._id).limit(1).find(OPTS).then((r) => r.items[0] || null), null),
    safe(() => whosGoing(m._id, hub.trips || []), []),
    safe(() => notificationsFor(m._id, team, trader), [])
  ]);
  return {
    loggedIn: true,
    account: {
      id: m._id,
      name: fp.name || nick || (first + " " + last).trim() || "Airshow fan",
      first: first || (fp.name || nick || "there").split(" ")[0],
      email: m.loginEmail || "",
      created: iso(m._createdDate),
      photo: fp.photo || "",
      colour: fp.colour || "#32B4AF",
      bio: fp.bio || "",
      area: fp.area || "",
      into: fp.into || [],
      going: fp.going || []
    },
    // The hub is part of every account, so it always counts as signed up.
    privacy: privacyOf(settings),
    badges: badgesFor(hub, forum, team),
    whosGoing: going,
    notifications: notes,
    hub: Object.assign({}, hub, { joined: true }),
    forum,
    team,
    trader
  };
}));

export const saveProfile = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const res = await saveMyProfile(input || {});
  if (!res.ok) fail(res.error);
  return res.data;
}));

export const uploadPhoto = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const res = await uploadMyPhoto(input || {});
  if (!res.ok) fail(res.error);
  return res.data;
}));

export const savePrivacy = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const m = await memberOrNull();
  if (!m) fail("Please log in first.");
  const privacy = {};
  PRIVACY_KEYS.forEach((k) => { privacy[k] = !(input && input[k] === false); });
  const res = await wixData.query(C.settings).eq("memberId", m._id).limit(1).find(OPTS);
  const existing = res.items[0];
  if (existing) await wixData.update(C.settings, Object.assign({}, existing, { privacy }), OPTS);
  else await wixData.insert(C.settings, { title: (m.profile && m.profile.nickname) || "Member", memberId: m._id, privacy, following: [] }, OPTS);
  return privacy;
}));

// Read by forum.web.js getProfile, so other members only see what this member has chosen to show.
export async function privacyFor(memberId) {
  const res = await wixData.query(C.settings).eq("memberId", memberId).limit(1).find(OPTS);
  return privacyOf(res.items[0]);
}
