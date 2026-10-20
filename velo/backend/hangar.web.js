// backend/hangar.web.js
// The Big Guide to UK Airshows: My Hangar in My Airshow Hub.
// Members log the aircraft they have seen. The list of aircraft to collect comes from the
// show line-ups (AircraftParticipation), and how rare each one is comes from how many shows list it.
// MemberHangar only lets admins write directly, so members change their own records through these checks.

import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { currentMember } from "wix-members-backend";

const OPTS = { suppressAuth: true };
const HANGAR = "MemberHangar";
const AIRCRAFT = "AircraftParticipation";
const MAX_SEEN = 600;

function fail(message) {
  throw { hubMessage: message };
}

async function wrap(fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error("Hangar error", e);
    return { ok: false, error: e.hubMessage || "Something went wrong. Please try again in a moment." };
  }
}

function clean(value, max) {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code >= 32 && code !== 127) out += ch;
  }
  return out.trim().slice(0, max);
}

function keyOf(name) {
  return clean(name, 80).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function memberId() {
  const m = await currentMember.getMember().catch(() => null);
  if (!m) fail("Please log in to use your hangar.");
  return m._id;
}

async function allItems(query) {
  let res = await query.limit(1000).find(OPTS);
  const items = res.items.slice();
  while (res.hasNext() && items.length < 5000) {
    res = await res.next();
    items.push(...res.items);
  }
  return items;
}

function shapeSeen(h) {
  return { id: h._id, key: h.aircraftKey, name: h.aircraftName, showName: h.showName || "", year: h.year || null, created: h._createdDate };
}

export const getHangar = webMethod(Permissions.Anyone, () => wrap(async () => {
  const me = await memberId();
  const [lineups, everyone] = await Promise.all([
    allItems(wixData.query(AIRCRAFT)),
    allItems(wixData.query(HANGAR))
  ]);
  const catalog = {};
  lineups.forEach((a) => {
    const name = a.aircraftName || a.title;
    const key = keyOf(name || "");
    if (!key) return;
    const c = catalog[key] || (catalog[key] = { key, name, airArm: a.airArm || a.category || "", shows: new Set() });
    if (a.showSlug) c.shows.add(a.showSlug);
  });
  const owners = {};
  const members = new Set();
  everyone.forEach((h) => {
    members.add(h.memberId);
    (owners[h.aircraftKey] = owners[h.aircraftKey] || new Set()).add(h.memberId);
    if (!catalog[h.aircraftKey]) catalog[h.aircraftKey] = { key: h.aircraftKey, name: h.aircraftName, airArm: "", shows: new Set() };
  });
  return {
    catalog: Object.values(catalog).map((c) => ({ key: c.key, name: c.name, airArm: c.airArm, shows: c.shows.size, members: (owners[c.key] || new Set()).size })),
    seen: everyone.filter((h) => h.memberId === me).map(shapeSeen),
    totalMembers: members.size
  };
}));

export const addSeen = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await memberId();
  const name = clean(input && input.name, 80);
  const key = keyOf(name);
  if (key.length < 2) fail("Add the name of the aircraft.");
  const showName = clean(input && input.showName, 80);
  const year = Math.round(Number(input && input.year)) || new Date().getFullYear();
  if (year < 1950 || year > new Date().getFullYear() + 1) fail("That year doesn't look right.");
  const mine = await wixData.query(HANGAR).eq("memberId", me).limit(1000).find(OPTS);
  if (mine.items.length >= MAX_SEEN) fail("Your hangar is full. Remove one before adding another.");
  const dup = mine.items.find((h) => h.aircraftKey === key && (h.showName || "") === showName && h.year === year);
  if (dup) return shapeSeen(dup);
  const saved = await wixData.insert(HANGAR, { title: name, memberId: me, aircraftKey: key, aircraftName: name, showName, year }, OPTS);
  return shapeSeen(saved);
}));

export const removeSeen = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  const me = await memberId();
  const id = clean(input && input.id, 60);
  const item = id ? await wixData.get(HANGAR, id, OPTS) : null;
  if (!item || item.memberId !== me) fail("That sighting couldn't be found.");
  await wixData.remove(HANGAR, id, OPTS);
  return { removed: true };
}));
