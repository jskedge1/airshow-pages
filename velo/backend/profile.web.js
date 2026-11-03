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
  follows: "ForumFollows",
  photos: "ForumPhotos"
};

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
  const upcoming = trips.items
    .filter((t) => !t.endDate || new Date(t.endDate).getTime() > now - 86400000)
    .map((t) => ({ id: t._id, showName: t.showName || "Airshow", showSlug: t.showSlug || "", start: iso(t.startDate), end: iso(t.endDate) }));
  return {
    joined: upcoming.length > 0 || must > 0 || past.items.length > 0,
    trips: upcoming,
    mustSee: must,
    unread,
    pastCount: past.items.length,
    past: past.items.slice(0, 12).map((p) => ({ showName: p.showName || p.title || "", year: p.year || null }))
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
