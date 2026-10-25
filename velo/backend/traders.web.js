// backend/traders.web.js
// The Big Guide to UK Airshows: airshow traders directory, Trader Hub and Jack's trader admin.
// Every read and write the three trader pages make goes through these web methods.
// The Traders and TraderShows collections only let admins read or write directly, so visitors only
// ever see approved listings, and traders can only change their own listing through the checks below.
// Phase 1 (25 Oct 2026): directory, sign up, approval queue, trader log in, editing a listing, photos, shows.
// Phase 2 adds paid plans (Wix Pricing Plans), show day updates, offers, messages and emails.

import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { currentMember } from "wix-members-backend";
import { mediaManager } from "wix-media-backend";

const C = { traders: "Traders", shows: "TraderShows" };
const OPTS = { suppressAuth: true };
const ADMIN_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const FOUNDING_PLACES = 25;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const MAX_SIGNUPS_PER_EMAIL = 3;

const SHOWS = {
  duxford: "IWM Duxford Air Shows",
  shuttleworth: "Shuttleworth Air Shows (Old Warden)",
  midlands: "Midlands Air Festival",
  cosford: "RAF Cosford Air Show",
  wales: "Wales Airshow",
  riat: "Royal International Air Tattoo",
  "little-gransden": "Little Gransden Air & Car Show",
  blackpool: "Blackpool Air Show",
  eastbourne: "Airbourne: Eastbourne International Airshow",
  clacton: "Clacton Airshow",
  southport: "Southport Air Show",
  ayr: "The International Ayr Show, Festival of Flight"
};
const CATEGORIES = ["food", "art", "models", "clothing", "kit", "family"];
const PLANS = {
  free: { name: "Static Display", photos: 2, shows: 3, offers: false },
  flypast: { name: "Flypast", photos: 6, shows: 999, offers: true },
  headliner: { name: "Headliner", photos: 6, shows: 999, offers: true }
};
const SHOW_STATUS = ["booked", "applied", "hoping", "cancelled"];
const TAGS = {
  pay: ["Cash", "Card", "Contactless", "Apple Pay and Google Pay"],
  diet: ["Vegetarian", "Vegan", "Gluten free", "Dairy free", "Halal"],
  about: ["Independent", "Family run", "Local to the show", "Dog friendly", "Step free counter"]
};
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const EDITABLE = ["title", "town", "category", "about", "website", "instagram", "facebook", "tiktok", "tags", "logo", "photos", "offer"];

/* ---------- helpers ---------- */

function fail(message) {
  throw { traderMessage: message };
}

async function wrap(fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error("Traders error", e);
    return { ok: false, error: e.traderMessage || "Something went wrong. Please try again in a moment." };
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

function cleanUrl(value) {
  let v = clean(value, 200);
  if (!v) return "";
  if (v.startsWith("@")) return v;
  v = v.replace(/^https?:\/\//i, "");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}(\/[^\s<>"']*)?$/i.test(v)) return "";
  return v;
}

function cleanEmail(value) {
  const v = clean(value, 120).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : "";
}

function cleanTags(tags) {
  const t = tags || {};
  const out = {};
  for (const k of Object.keys(TAGS)) {
    out[k] = (Array.isArray(t[k]) ? t[k] : []).filter((x) => TAGS[k].includes(x));
  }
  return out;
}

function slugify(name) {
  return clean(name, 60).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "trader";
}

// "Sat 22 to Sun 23 May" or "Sun 6 Jun" to a date in the coming season, for sorting.
function firstDay(text) {
  const t = String(text || "").toLowerCase();
  const d = /(\d{1,2})/.exec(t);
  const m = MONTHS.findIndex((mon) => t.includes(mon));
  if (!d || m < 0) return null;
  const now = new Date();
  let year = now.getFullYear();
  const guess = new Date(Date.UTC(year, m, Number(d[1])));
  if (guess < new Date(now.getTime() - 30 * 864e5)) year += 1;
  return new Date(Date.UTC(year, m, Number(d[1])));
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
    return roles.some((r) => r._id === ADMIN_ROLE_ID || r.title === "Admin" || r.name === "Admin");
  } catch (e) {
    return false;
  }
}

async function requireAdmin() {
  if (!(await isAdmin())) fail("This page is for the site admin only.");
}

function memberEmail(m) {
  return ((m && (m.loginEmail || (m.contactDetails && m.contactDetails.emails && m.contactDetails.emails[0]))) || "").toLowerCase();
}

// Finds the trader for the logged in member. A listing sent before the member made their account is
// linked the first time they log in with the same email.
async function myTrader(m) {
  let t = await findOne(C.traders, "memberId", m._id);
  if (t) return t;
  const email = memberEmail(m);
  if (!email) return null;
  t = await findOne(C.traders, "contactEmail", email);
  if (t && !t.memberId) {
    t.memberId = m._id;
    t = await wixData.update(C.traders, t, OPTS);
    return t;
  }
  return null;
}

async function requireTrader() {
  const m = await getMemberOrNull();
  if (!m) fail("Please log in to your Trader Hub.");
  const t = await myTrader(m);
  if (!t) fail("There is no trader listing for this account yet. Send your listing from the traders directory first, using the same email.");
  return { member: m, trader: t };
}

async function foundingTaken() {
  return wixData.query(C.traders).eq("founding", true).count(OPTS);
}

async function showsFor(traderIds) {
  if (!traderIds.length) return [];
  const res = await wixData.query(C.shows).hasSome("traderId", traderIds).ascending("sortDate").limit(1000).find(OPTS);
  return res.items;
}

function planOf(t) {
  return PLANS[t.plan] || PLANS.free;
}

// What visitors see: only approved fields, trimmed to what the trader's plan allows.
function publicCard(t, shows) {
  const plan = planOf(t);
  const photos = (Array.isArray(t.photos) ? t.photos : []).slice(0, plan.photos);
  return {
    id: t._id,
    slug: t.slug,
    name: t.title,
    town: t.town || "",
    cat: CATEGORIES.includes(t.category) ? t.category : "food",
    about: t.about || "",
    web: t.website || "",
    instagram: t.instagram || "",
    facebook: t.facebook || "",
    tiktok: t.tiktok || "",
    tags: cleanTags(t.tags),
    logo: t.logo || "",
    photos,
    offer: plan.offers ? t.offer || "" : "",
    plan: t.plan || "free",
    headliner: t.plan === "headliner",
    founding: !!t.founding,
    shows: shows
      .filter((s) => s.traderId === t._id && (s.status === "booked" || s.status === "cancelled"))
      .slice(0, plan.shows)
      .map((s) => ({ showId: s.showId, name: SHOWS[s.showId] || s.title, dates: s.dates, pitch: plan.offers ? s.pitch || "" : "", cancelled: s.status === "cancelled" }))
  };
}

// What the trader edits: their approved listing with any changes still waiting to be checked laid over it.
function editView(t, shows) {
  const pending = t.pending && Object.keys(t.pending).length ? t.pending : null;
  const merged = Object.assign({}, t, pending || {});
  const plan = planOf(t);
  return {
    id: t._id,
    status: t.status,
    waiting: !!pending || t.status === "pending",
    adminNote: t.adminNote || "",
    lastChecked: t.lastChecked || null,
    plan: t.plan || "free",
    planName: plan.name,
    limits: { photos: plan.photos, shows: plan.shows === 999 ? null : plan.shows, offers: plan.offers },
    requestedPlan: t.requestedPlan || "",
    founding: !!t.founding,
    contactName: t.contactName || "",
    contactEmail: t.contactEmail || "",
    listing: {
      name: merged.title || "",
      town: merged.town || "",
      cat: merged.category || "food",
      about: merged.about || "",
      web: merged.website || "",
      instagram: merged.instagram || "",
      facebook: merged.facebook || "",
      tiktok: merged.tiktok || "",
      tags: cleanTags(merged.tags),
      logo: merged.logo || "",
      photos: Array.isArray(merged.photos) ? merged.photos : [],
      offer: merged.offer || ""
    },
    shows: shows.map((s) => ({ id: s._id, showId: s.showId, name: SHOWS[s.showId] || s.title, dates: s.dates, pitch: s.pitch || "", status: s.status }))
  };
}

function listingFromInput(input) {
  const i = input || {};
  const out = {
    title: clean(i.name, 60),
    town: clean(i.town, 60),
    category: CATEGORIES.includes(i.cat) ? i.cat : "food",
    about: clean(i.about, 240),
    website: cleanUrl(i.web),
    instagram: clean(i.instagram, 60),
    facebook: cleanUrl(i.facebook) || clean(i.facebook, 80),
    tiktok: clean(i.tiktok, 60),
    tags: cleanTags(i.tags),
    offer: clean(i.offer, 80)
  };
  if (!out.title) fail("Please add your business name.");
  if (!out.about) fail("Please add a line about your stall.");
  return out;
}

function showFromInput(s) {
  const showId = clean(s && s.showId, 40);
  if (!SHOWS[showId]) fail("Please choose an airshow from the list.");
  const dates = clean(s.dates, 60);
  if (!dates) fail(`Please add the dates you will trade at ${SHOWS[showId]}.`);
  const status = SHOW_STATUS.includes(s.status) ? s.status : "booked";
  return { title: SHOWS[showId], showId, dates, sortDate: firstDay(dates), pitch: clean(s.pitch, 80), status };
}

/* ---------- visitors: the directory and the sign up form ---------- */

export const getDirectory = webMethod(Permissions.Anyone, () => wrap(async () => {
  const res = await wixData.query(C.traders).eq("status", "live").limit(500).find(OPTS);
  const shows = await showsFor(res.items.map((t) => t._id));
  const cards = res.items.map((t) => publicCard(t, shows));
  cards.sort((a, b) => (b.headliner - a.headliner) || a.name.localeCompare(b.name));
  const taken = await foundingTaken();
  const m = await getMemberOrNull();
  return { traders: cards, shows: SHOWS, founding: { taken, total: FOUNDING_PLACES }, loggedIn: !!m };
}));

export const submitListing = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const i = input || {};
  const listing = listingFromInput(i);
  const email = cleanEmail(i.email);
  if (!email) fail("Please add a contact email so I can let you know when you are live.");
  const shows = (Array.isArray(i.shows) ? i.shows : []).filter((s) => s && s.showId).slice(0, 20).map(showFromInput);
  if (!shows.length) fail("Please add at least one airshow you will be at.");
  const plan = ["founding", "free", "flypast", "headliner"].includes(i.plan) ? i.plan : "free";

  const already = await wixData.query(C.traders).eq("contactEmail", email).count(OPTS);
  if (already >= MAX_SIGNUPS_PER_EMAIL) fail("You have already sent a listing with this email. Log in to your Trader Hub to change it, or message me.");

  const m = await getMemberOrNull();
  let slug = slugify(listing.title);
  if (await findOne(C.traders, "slug", slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const trader = await wixData.insert(C.traders, Object.assign(listing, {
    slug,
    memberId: m ? m._id : "",
    contactName: clean(i.contactName, 60),
    contactEmail: email,
    photos: [],
    logo: "",
    plan: "free",
    requestedPlan: plan,
    founding: false,
    status: "pending",
    pending: {},
    submittedDate: new Date()
  }), OPTS);
  for (const s of shows) await wixData.insert(C.shows, Object.assign(s, { traderId: trader._id }), OPTS);
  return { sent: true, name: trader.title, founding: plan === "founding" };
}));

/* ---------- traders: the Trader Hub ---------- */

export const getMyTrader = webMethod(Permissions.Anyone, () => wrap(async () => {
  const m = await getMemberOrNull();
  if (!m) return { loggedIn: false };
  const t = await myTrader(m);
  const firstName = (m.contactDetails && m.contactDetails.firstName) || (m.profile && m.profile.nickname) || "";
  if (!t) return { loggedIn: true, trader: null, firstName, email: memberEmail(m) };
  const shows = await showsFor([t._id]);
  const taken = await foundingTaken();
  return { loggedIn: true, firstName, email: memberEmail(m), trader: editView(t, shows), founding: { taken, total: FOUNDING_PLACES } };
}));

// Listing changes wait for Jack. A listing that has never been approved is changed directly.
export const saveMyListing = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const { trader } = await requireTrader();
  const listing = listingFromInput(input);
  if (trader.status === "pending" || trader.status === "sentBack") {
    Object.assign(trader, listing, { status: "pending", adminNote: "", submittedDate: new Date() });
  } else {
    trader.pending = Object.assign({}, trader.pending || {}, listing);
    trader.submittedDate = new Date();
  }
  const saved = await wixData.update(C.traders, trader, OPTS);
  return editView(saved, await showsFor([saved._id]));
}));

export const uploadMyPhoto = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const { trader } = await requireTrader();
  const i = input || {};
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(i.dataUrl || ""));
  if (!m) fail("Please choose a JPG or PNG photo.");
  const buffer = Buffer.from(m[2], "base64");
  if (buffer.length > MAX_PHOTO_BYTES) fail("That photo is too large. Please try a smaller one.");
  const kind = i.kind === "logo" ? "logo" : "photo";
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const fileName = `${trader.slug}-${kind}-${Date.now()}.${ext}`;
  const upload = await mediaManager.upload(`/traders/${trader.slug}`, buffer, fileName, {
    mediaOptions: { mimeType: `image/${m[1]}`, mediaType: "image" },
    metadataOptions: { isPrivate: false, isVisitorUpload: true }
  });
  return { url: upload.fileUrl, kind };
}));

// Photos and logo go through the same check as the rest of the listing.
export const saveMyPhotos = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const { trader } = await requireTrader();
  const i = input || {};
  const photos = (Array.isArray(i.photos) ? i.photos : []).map((u) => clean(u, 400)).filter((u) => /^(wix:image:\/\/|https:\/\/static\.wixstatic\.com\/)/.test(u)).slice(0, 6);
  const logo = clean(i.logo || "", 400);
  const logoOk = !logo || /^(wix:image:\/\/|https:\/\/static\.wixstatic\.com\/)/.test(logo);
  if (!logoOk) fail("That logo could not be used. Please upload it again.");
  if (trader.status === "pending" || trader.status === "sentBack") {
    trader.photos = photos;
    trader.logo = logo;
    if (trader.status === "sentBack") Object.assign(trader, { status: "pending", adminNote: "", submittedDate: new Date() });
  } else {
    trader.pending = Object.assign({}, trader.pending || {}, { photos, logo });
    trader.submittedDate = new Date();
  }
  const saved = await wixData.update(C.traders, trader, OPTS);
  return editView(saved, await showsFor([saved._id]));
}));

// Shows change straight away: they are dates and places, not wording, and traders need them right.
export const saveMyShow = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const { trader } = await requireTrader();
  const i = input || {};
  const s = showFromInput(i);
  if (i.id) {
    const row = await findOne(C.shows, "_id", clean(i.id, 60));
    if (!row || row.traderId !== trader._id) fail("That show could not be found.");
    await wixData.update(C.shows, Object.assign(row, s), OPTS);
  } else {
    const active = await wixData.query(C.shows).eq("traderId", trader._id).ne("status", "cancelled").count(OPTS);
    if (active >= planOf(trader).shows) fail(`Your plan shows up to ${planOf(trader).shows} airshows. Remove one first, or move to Flypast for unlimited shows.`);
    await wixData.insert(C.shows, Object.assign(s, { traderId: trader._id }), OPTS);
  }
  return editView(trader, await showsFor([trader._id]));
}));

export const removeMyShow = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const { trader } = await requireTrader();
  const row = await findOne(C.shows, "_id", clean(input && input.id, 60));
  if (!row || row.traderId !== trader._id) fail("That show could not be found.");
  await wixData.remove(C.shows, row._id, OPTS);
  return editView(trader, await showsFor([trader._id]));
}));

export const setMyPause = webMethod(Permissions.SiteMember, (input) => wrap(async () => {
  const { trader } = await requireTrader();
  const pause = !!(input && input.pause);
  if (pause && trader.status === "live") trader.status = "paused";
  else if (!pause && trader.status === "paused") trader.status = "live";
  const saved = await wixData.update(C.traders, trader, OPTS);
  return editView(saved, await showsFor([saved._id]));
}));

/* ---------- Jack: the trader admin ---------- */

function adminRow(t, shows) {
  const pending = t.pending && Object.keys(t.pending).length ? t.pending : null;
  const changes = pending ? Object.keys(pending).filter((k) => EDITABLE.includes(k)).map((k) => ({ field: k, was: t[k], now: pending[k] })) : [];
  return {
    id: t._id,
    name: t.title,
    town: t.town || "",
    cat: t.category || "food",
    about: t.about || "",
    web: t.website || "",
    instagram: t.instagram || "",
    facebook: t.facebook || "",
    tiktok: t.tiktok || "",
    tags: cleanTags(t.tags),
    logo: t.logo || "",
    photos: Array.isArray(t.photos) ? t.photos : [],
    contactName: t.contactName || "",
    contactEmail: t.contactEmail || "",
    hasAccount: !!t.memberId,
    plan: t.plan || "free",
    requestedPlan: t.requestedPlan || "",
    founding: !!t.founding,
    status: t.status,
    isNew: t.status === "pending",
    changes,
    adminNote: t.adminNote || "",
    submittedDate: t.submittedDate || t._createdDate,
    lastChecked: t.lastChecked || null,
    shows: shows.filter((s) => s.traderId === t._id).map((s) => ({ name: SHOWS[s.showId] || s.title, dates: s.dates, status: s.status, pitch: s.pitch || "" }))
  };
}

export const getAdmin = webMethod(Permissions.Anyone, () => wrap(async () => {
  if (!(await isAdmin())) return { admin: false };
  const res = await wixData.query(C.traders).descending("_createdDate").limit(1000).find(OPTS);
  const shows = await showsFor(res.items.map((t) => t._id));
  const rows = res.items.map((t) => adminRow(t, shows));
  const queue = rows.filter((r) => r.isNew || r.changes.length).sort((a, b) => new Date(a.submittedDate) - new Date(b.submittedDate));
  return { admin: true, queue, traders: rows, founding: { taken: rows.filter((r) => r.founding).length, total: FOUNDING_PLACES } };
}));

export const approveTrader = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const t = await findOne(C.traders, "_id", clean(input && input.id, 60));
  if (!t) fail("That trader could not be found.");
  let founding = false;
  if (t.status === "pending") {
    t.status = "live";
    if (t.requestedPlan === "founding" && !t.founding) {
      if ((await foundingTaken()) < FOUNDING_PLACES) {
        t.founding = true;
        t.plan = "flypast";
        founding = true;
      }
    }
  }
  if (t.pending && Object.keys(t.pending).length) {
    for (const k of Object.keys(t.pending)) if (EDITABLE.includes(k)) t[k] = t.pending[k];
    t.pending = {};
  }
  t.adminNote = "";
  t.lastChecked = new Date();
  await wixData.update(C.traders, t, OPTS);
  return { approved: true, name: t.title, founding, foundingTaken: await foundingTaken() };
}));

export const sendBackTrader = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const i = input || {};
  const note = clean(i.note, 500);
  if (!note) fail("Please write a short note to say what to change.");
  const t = await findOne(C.traders, "_id", clean(i.id, 60));
  if (!t) fail("That trader could not be found.");
  if (t.status === "pending") t.status = "sentBack";
  t.pending = {};
  t.adminNote = note;
  t.lastChecked = new Date();
  await wixData.update(C.traders, t, OPTS);
  return { sentBack: true, name: t.title };
}));

export const setTraderStatus = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const i = input || {};
  const status = ["live", "paused"].includes(i.status) ? i.status : null;
  if (!status) fail("Unknown status.");
  const t = await findOne(C.traders, "_id", clean(i.id, 60));
  if (!t) fail("That trader could not be found.");
  t.status = status;
  await wixData.update(C.traders, t, OPTS);
  return { status };
}));

export const markChecked = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const t = await findOne(C.traders, "_id", clean(input && input.id, 60));
  if (!t) fail("That trader could not be found.");
  t.lastChecked = new Date();
  await wixData.update(C.traders, t, OPTS);
  return { checked: true };
}));
