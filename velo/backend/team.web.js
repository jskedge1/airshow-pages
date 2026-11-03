// backend/team.web.js
// The Big Guide to UK Airshows: the volunteer team. The Volunteer Hub (/volunteer-hub) and Jack's Team Admin (/team-admin)
// make every read and write through these web methods, by way of their page code.
// The Team collections only let admins read or write directly, so volunteers only ever see and change their own work,
// and only an account with the Admin role can see the queue, switch people on or put work live.
// Made 3 Nov 2026. Answers use the same shapes as the example data in team-api.js.

import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { currentMember } from "wix-members-backend";
import { mediaManager } from "wix-media-backend";

const C = { vols: "TeamVolunteers", work: "TeamWork", requests: "TeamRequests", notes: "TeamNotes", log: "TeamLog" };
const OPTS = { suppressAuth: true };
const ADMIN_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const MAX_SENDS_PER_DAY = 40;

const SHOWS = ["Royal International Air Tattoo", "RAF Cosford Air Show", "IWM Duxford Air Shows", "Shuttleworth Air Shows", "Little Gransden Air and Car Show", "Eastbourne Airshow", "Clacton Air Show", "Wales Air Show", "Midlands Air Festival", "Blackpool Air Show", "Southport Air Show", "International Ayr Show", "Headcorn Airshow"];
const ROLES = ["Airshow expert", "Photographer", "Videographer", "Blogger or reviewer", "Social media helper", "YouTuber, vlogger or TikToker", "Plane spotting lead", "Organiser liaison"];
const KINDS = { photo: "photos", video: "a video", review: "a review", tips: "show tips", arrivals: "an arrivals report", social: "a post idea" };
const VOL_STATUS = ["waiting", "active", "paused"];

/* ---------- helpers ---------- */

function fail(message) {
  throw { teamMessage: message };
}

async function wrap(fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error("Team error", e);
    return { ok: false, error: e.teamMessage || "Something went wrong. Please try again in a moment." };
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

function cleanLink(value) {
  let v = clean(value, 300);
  if (!v) return "";
  if (v.startsWith("@")) return v.slice(0, 60);
  v = v.replace(/^https?:\/\//i, "");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}(\/[^\s<>"']*)?$/i.test(v)) return "";
  return v;
}

function pick(list, allowed, max) {
  return (Array.isArray(list) ? list : []).filter((x) => allowed.includes(x)).slice(0, max || 20);
}

function day(value) {
  const v = clean(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
}

function ymd(d) {
  const x = d ? new Date(d) : new Date();
  return isNaN(x) ? "" : x.toISOString().slice(0, 10);
}

// wix:image://v1/<id>/<name>#... into an address the hub pages can show
function imageUrl(u) {
  const m = /^wix:image:\/\/v1\/([^/]+)\//.exec(String(u || ""));
  if (m) return `https://static.wixstatic.com/media/${m[1]}`;
  return /^https:\/\/static\.wixstatic\.com\//.test(String(u || "")) ? u : "";
}

async function findOne(collection, field, value) {
  const res = await wixData.query(collection).eq(field, value).limit(1).find(OPTS);
  return res.items[0] || null;
}

async function getMemberOrNull() {
  try {
    return await currentMember.getMember({ fieldsets: ["FULL"] });
  } catch (e) {
    return null;
  }
}

async function isAdmin() {
  try {
    const roles = await currentMember.getRoles();
    return roles.some((r) => r._id === ADMIN_ROLE_ID || r.title === "Admin" || r["name"] === "Admin");
  } catch (e) {
    return false;
  }
}

async function requireAdmin() {
  if (!(await isAdmin())) fail("This page is for the site admin only.");
}

function memberName(member) {
  const c = (member && member.contactDetails) || {};
  const full = [c.firstName, c.lastName].filter(Boolean).join(" ");
  return clean(full || (member && member.profile && member.profile.nickname) || "", 60);
}

async function requireMember() {
  const member = await getMemberOrNull();
  if (!member) fail("Please log in first.");
  return member;
}

async function myRecord(member) {
  return findOne(C.vols, "memberId", member._id);
}

async function requireActive() {
  const member = await requireMember();
  const vol = await myRecord(member);
  if (!vol || vol.status === "waiting") fail("Your account isn't switched on yet. Jack will be in touch.");
  if (vol.status === "paused") fail("Your account is paused at the moment, so sending is switched off.");
  return { member, vol };
}

async function addLog(text) {
  try {
    await wixData.insert(C.log, { text: clean(text, 300), at: new Date() }, OPTS);
  } catch (e) {
    console.error("Team log", e);
  }
}

// Jack's decisions also go into Flight Records on the admin board
async function adminLog(title, type) {
  try {
    await wixData.insert("AdminLog", { title: clean(title, 200), logDate: ymd(), type: type || "Changed", area: "Volunteers", source: "Team admin" }, OPTS);
  } catch (e) {
    console.error("AdminLog", e);
  }
}

/* ---------- views, the same shapes as team-api.js ---------- */

function volView(v) {
  return {
    id: v.memberId, name: v.name || "", first: v.first || String(v.name || "").split(" ")[0] || "there",
    link: v.link || "", bio: v.bio || "", roles: v.roles || [], shows: v.shows || [], status: v.status || "waiting",
    team: v.team !== false, applied: v.applied || "", joined: ymd(v.joined || v._createdDate)
  };
}

function workView(w) {
  return {
    id: w._id, v: w.memberId, k: w.kind, title: w.title || "", show: w.show || "", day: w.day || "", st: w.status || "sent",
    page: w.page || "", msg: w.msg || "", imgs: (w.imgs || []).map(imageUrl).filter(Boolean), n: w.n || 0,
    text: w.text || "", link: w.link || "", where: w.where || "", at: (w.sentDate || w._createdDate || new Date()).toISOString()
  };
}

async function allItems(collection, sortField, desc) {
  let q = wixData.query(collection).limit(1000);
  q = desc ? q.descending(sortField) : q.ascending(sortField);
  let res = await q.find(OPTS);
  let items = res.items;
  while (res.hasNext()) {
    res = await res.next();
    items = items.concat(res.items);
  }
  return items;
}

async function requestsView() {
  const items = await allItems(C.requests, "sort", false);
  return items.map((r) => ({ id: r._id, t: r.title || "", show: r.show || "", k: r.kind || "photo", s: r.detail || "" }));
}

async function notesFor(ids) {
  const res = await wixData.query(C.notes).hasSome("who", ids).limit(100).find(OPTS);
  const out = {};
  res.items.forEach((n) => { if (n.text) out[n.who] = n.text; });
  return out;
}

async function meView(member) {
  if (!member) return { loggedIn: false };
  const vol = await myRecord(member);
  const vols = {};
  vols[member._id] = vol ? volView(vol) : { id: member._id, name: memberName(member), first: memberName(member).split(" ")[0] || "there", link: "", bio: "", roles: [], shows: [], status: "none", team: true };
  const active = vol && (vol.status === "active" || vol.status === "paused");
  let work = [];
  if (active) {
    const res = await wixData.query(C.work).eq("memberId", member._id).descending("_createdDate").limit(300).find(OPTS);
    work = res.items.filter((w) => w.status !== "gone" && w.status !== "no").map(workView);
  }
  const notes = active ? await notesFor(["all", member._id]) : {};
  return {
    loggedIn: true, isAdmin: await isAdmin(), status: vol ? vol.status : "none", meId: member._id, vols, work,
    requests: active ? await requestsView() : [], notes: { all: notes.all || "", [member._id]: notes[member._id] || "" }
  };
}

async function adminView() {
  const [vols, work, requests, notesRes, log] = await Promise.all([
    allItems(C.vols, "_createdDate", false),
    allItems(C.work, "_createdDate", true),
    requestsView(),
    wixData.query(C.notes).limit(1000).find(OPTS),
    wixData.query(C.log).descending("at").limit(60).find(OPTS)
  ]);
  const v = {};
  vols.forEach((x) => { v[x.memberId] = volView(x); });
  const notes = {};
  notesRes.items.forEach((n) => { if (n.text) notes[n.who] = n.text; });
  return {
    isAdmin: true, vols: v, work: work.filter((w) => w.status !== "gone").map(workView), requests, notes,
    log: log.items.map((l) => ({ at: (l.at || l._createdDate).toISOString(), t: l.text || "" }))
  };
}

/* ---------- the volunteer's own hub ---------- */

export const getMe = webMethod(Permissions.Anyone, () => wrap(async () => meView(await getMemberOrNull())));

// Someone logged in who isn't on the team yet asks to join. Never lowers an active volunteer back to waiting.
export const applyToJoin = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const member = await requireMember();
  const i = input || {};
  const name = clean(i.name, 60) || memberName(member);
  if (!name) fail("Please add your name.");
  const roles = pick(i.roles, ROLES);
  if (!roles.length) fail("Please pick at least one role.");
  const rec = await myRecord(member);
  const data = {
    memberId: member._id, email: clean((member.loginEmail || ""), 120).toLowerCase(), name, first: name.split(" ")[0],
    roles, shows: pick(i.shows, SHOWS), applied: clean(i.message, 1200)
  };
  if (rec) {
    if (rec.status === "active" || rec.status === "paused") return meView(member);
    await wixData.update(C.vols, Object.assign(rec, data, { status: "waiting" }), OPTS);
  } else {
    await wixData.insert(C.vols, Object.assign(data, { status: "waiting", team: true, link: "", bio: "", joined: new Date() }), OPTS);
  }
  await addLog(`${name} asked to join the team`);
  await adminLog(`${name} asked to join the volunteer team`, "Added");
  return meView(member);
}));

export const uploadTeamPhoto = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const { member } = await requireActive();
  const i = input || {};
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(i.dataUrl || ""));
  if (!m) fail("Please choose a JPG or PNG photo.");
  const buffer = Buffer.from(m[2], "base64");
  if (buffer.length > MAX_PHOTO_BYTES) fail("That photo is too large. Please try a smaller one, or add it as a link.");
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const folder = `/team/${member._id.slice(0, 8)}`;
  const upload = await mediaManager.upload(folder, buffer, `team-${Date.now()}.${ext}`, {
    mediaOptions: { mimeType: `image/${m[1]}`, mediaType: "image" },
    metadataOptions: { isPrivate: false, isVisitorUpload: true }
  });
  return { url: upload.fileUrl };
}));

export const sendTeamWork = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const { member, vol } = await requireActive();
  const i = input || {};
  const kind = Object.keys(KINDS).includes(i.kind) ? i.kind : "";
  if (!kind) fail("Please pick what you are sending.");
  const title = clean(i.title, 90);
  const show = SHOWS.includes(i.show) ? i.show : "";
  if (!title || !show) fail("Please pick the show and give it a title.");
  const imgs = (Array.isArray(i.imgs) ? i.imgs : []).map((u) => clean(u, 400)).filter((u) => /^(wix:image:\/\/|https:\/\/static\.wixstatic\.com\/)/.test(u)).slice(0, 10);
  const link = cleanLink(i.link);
  const text = clean(i.text, 6000);
  if (kind === "photo" && !imgs.length && !link) fail("Please add a photo or a link.");
  if (kind === "video" && !link) fail("Please paste the link to your video.");
  if (["review", "tips", "arrivals", "social"].includes(kind) && text.length < 10) fail("Please write a few words.");
  const since = new Date(Date.now() - 864e5);
  const today = await wixData.query(C.work).eq("memberId", member._id).gt("_createdDate", since).count(OPTS);
  if (today >= MAX_SENDS_PER_DAY) fail("That is a lot for one day. Please send the rest tomorrow.");
  await wixData.insert(C.work, {
    memberId: member._id, kind, title, show, day: day(i.day), status: "sent", imgs, n: Math.min(Number(i.n) || imgs.length, 99),
    text, link, where: clean(i.where, 120), sentDate: new Date()
  }, OPTS);
  await addLog(`${vol.name} sent ${KINDS[kind]}, ${title}`);
  return meView(member);
}));

async function myWork(member, id) {
  const w = await wixData.get(C.work, clean(String(id || ""), 60), OPTS);
  if (!w || w.memberId !== member._id) fail("That could not be found.");
  return w;
}

export const cancelTeamWork = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const member = await requireMember();
  const w = await myWork(member, (input || {}).id);
  if (w.status === "live" || w.status === "removal") fail("This is live on the guide. Ask for it to come down instead.");
  await wixData.remove(C.work, w._id, OPTS);
  const vol = await myRecord(member);
  await addLog(`${vol ? vol.name : "A volunteer"} cancelled ${w.title}`);
  return meView(member);
}));

export const askTakeDown = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const member = await requireMember();
  const w = await myWork(member, (input || {}).id);
  if (w.status !== "live") fail("Only live work can be taken down.");
  w.status = "removal";
  await wixData.update(C.work, w, OPTS);
  const vol = await myRecord(member);
  await addLog(`${vol ? vol.name : "A volunteer"} asked for ${w.title} to come down`);
  await adminLog(`Volunteer asked for ${w.title} to come down`, "Changed");
  return meView(member);
}));

export const markChangeMade = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const member = await requireMember();
  const w = await myWork(member, (input || {}).id);
  if (w.status !== "change") fail("There is no change waiting on this one.");
  Object.assign(w, { status: "checking", msg: "" });
  await wixData.update(C.work, w, OPTS);
  const vol = await myRecord(member);
  await addLog(`${vol ? vol.name : "A volunteer"} made the change on ${w.title}`);
  return meView(member);
}));

export const saveTeamProfile = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const member = await requireMember();
  const vol = await myRecord(member);
  if (!vol || vol.status === "waiting") fail("Your account isn't switched on yet.");
  const i = input || {};
  const name = clean(i.name, 60);
  if (!name) fail("Please add the name you would like on your work.");
  Object.assign(vol, { name, first: name.split(" ")[0], link: cleanLink(i.link), bio: clean(i.bio, 240), team: i.team !== false, roles: pick(i.roles, ROLES), shows: pick(i.shows, SHOWS) });
  await wixData.update(C.vols, vol, OPTS);
  await addLog(`${name} updated their profile`);
  return meView(member);
}));

/* ---------- Jack's Team Admin ---------- */

export const getTeamAdmin = webMethod(Permissions.SiteMember, () => wrap(async () => {
  await requireAdmin();
  return adminView();
}));

export const decideTeamWork = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  await requireAdmin();
  const i = input || {};
  const w = await wixData.get(C.work, clean(String(i.id || ""), 60), OPTS);
  if (!w) fail("That could not be found. It may have been cancelled.");
  const vol = await findOne(C.vols, "memberId", w.memberId);
  const who = vol ? vol.name : "a volunteer";
  const a = i.a;
  if (a === "check") { w.status = "checking"; await addLog(`Checking ${w.title} from ${who}`); }
  else if (a === "live") {
    w.status = "live"; w.page = clean(i.page, 120) || "the guide"; w.msg = "";
    await addLog(`Put live: ${w.title} from ${who}, on ${w.page}`);
    await adminLog(`Volunteer work live: ${w.title} from ${who}, on ${w.page}`, "Added");
  } else if (a === "change") {
    const note = clean(i.note, 420);
    if (note.length < 4) fail("Please write a short note.");
    w.status = "change"; w.msg = note;
    await addLog(`Asked ${who} for a change on ${w.title}`);
  } else if (a === "no") { w.status = "no"; await addLog(`Not this time: ${w.title} from ${who}`); }
  else if (a === "gone") {
    w.status = "gone";
    await addLog(`Taken down: ${w.title} from ${who}`);
    await adminLog(`Volunteer work taken down: ${w.title} from ${who}`, "Changed");
  } else if (a === "keep") { w.status = "live"; await addLog(`Kept ${w.title} live for now, talking to ${who}`); }
  else fail("Unknown choice.");
  w.decidedDate = new Date();
  await wixData.update(C.work, w, OPTS);
  return adminView();
}));

export const setVolunteer = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  await requireAdmin();
  const i = input || {};
  const vol = await findOne(C.vols, "memberId", clean(String(i.id || ""), 60));
  if (!vol) fail("That volunteer could not be found.");
  if (i.a === "on") { vol.status = "active"; await addLog(`${vol.name} switched on as a volunteer`); await adminLog(`${vol.name} switched on as a volunteer`, "Added"); }
  else if (i.a === "pause") { vol.status = "paused"; await addLog(`${vol.name} paused`); }
  else if (i.a === "later") {
    await wixData.remove(C.vols, vol._id, OPTS);
    await addLog(`${vol.name} not added for now`);
    return adminView();
  } else fail("Unknown choice.");
  if (!VOL_STATUS.includes(vol.status)) vol.status = "waiting";
  await wixData.update(C.vols, vol, OPTS);
  return adminView();
}));

export const addTeamRequest = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  await requireAdmin();
  const i = input || {};
  const title = clean(i.t, 70);
  const show = SHOWS.includes(i.show) ? i.show : "";
  if (!title || !show) fail("Please say what you need and pick the show.");
  const last = await wixData.query(C.requests).descending("sort").limit(1).find(OPTS);
  const sort = last.items.length ? (last.items[0].sort || 0) + 10 : 10;
  await wixData.insert(C.requests, { title, show, kind: Object.keys(KINDS).includes(i.k) ? i.k : "photo", detail: clean(i.s, 140) || "Anything you have.", sort }, OPTS);
  await addLog(`New request: ${title}`);
  return adminView();
}));

export const finishTeamRequest = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  await requireAdmin();
  const r = await wixData.get(C.requests, clean(String((input || {}).id || ""), 60), OPTS);
  if (r) {
    await wixData.remove(C.requests, r._id, OPTS);
    await addLog(`Request done: ${r.title}`);
  }
  return adminView();
}));

export const moveTeamRequestUp = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  await requireAdmin();
  const items = await allItems(C.requests, "sort", false);
  const i = items.findIndex((r) => r._id === String((input || {}).id || ""));
  if (i > 0) {
    const a = items[i - 1], b = items[i];
    const sa = a.sort || i * 10, sb = b.sort || (i + 1) * 10;
    a.sort = sb === sa ? sa + 1 : sb;
    b.sort = sa;
    await wixData.bulkUpdate(C.requests, [a, b], OPTS);
  }
  return adminView();
}));

export const saveTeamNote = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  await requireAdmin();
  const i = input || {};
  const who = clean(String(i.who || ""), 60);
  if (!who) fail("Please pick who the note is for.");
  if (who !== "all" && !(await findOne(C.vols, "memberId", who))) fail("That volunteer could not be found.");
  const text = clean(i.text, 600);
  const rec = await findOne(C.notes, "who", who);
  if (!text) { if (rec) await wixData.remove(C.notes, rec._id, OPTS); }
  else if (rec) { rec.text = text; await wixData.update(C.notes, rec, OPTS); }
  else await wixData.insert(C.notes, { who, text }, OPTS);
  const vol = who === "all" ? null : await findOne(C.vols, "memberId", who);
  await addLog(`${text ? "Note saved for" : "Note cleared for"} ${who === "all" ? "everyone" : (vol ? vol.name : "a volunteer")}`);
  return adminView();
}));
