// backend/admin.web.js
// The Big Guide to UK Airshows: Jack's admin board (Wix page /site-admin, page code velo/page-code/site-admin.js).
// Every request checks the Admin role first. Nobody else gets any data back, and nothing can be changed by anyone else.
//
// Live figures come from the site's own collections (members, forum, traders, contact messages, crowd reports).
// The admin collections AdminPlans, AdminIdeas, AdminLog and AdminChecks are admin only (read and write).
// Scheduled tasks and Claude add rows to AdminLog and AdminChecks over the Wix API, so the board fills itself in.
//
// Optional, for site status, form sign ups and the Publish and Unpublish buttons:
// add a Wix API key in the Secrets Manager named "ukagApiKey" (Wix dashboard, Developer Tools, Secrets Manager),
// and the account ID as a secret named "ukagAccountId". Without them the board still works and says what is missing.

import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { currentMember } from "wix-members-backend";
import { getSecret } from "wix-secrets-backend";
import { fetch } from "wix-fetch";

const SITE_ID = "073f6961-6a1c-4313-a30e-a850cc8c3512";
const ADMIN_ROLE_ID = "00000000-0000-0000-0000-000000000001";
const OPTS = { suppressAuth: true };
const C = {
  plans: "AdminPlans",
  ideas: "AdminIdeas",
  log: "AdminLog",
  checks: "AdminChecks",
  members: "Members/PrivateMembersData",
  profiles: "ForumProfiles",
  threads: "ForumThreads",
  photos: "ForumPhotos",
  comments: "ForumComments",
  traders: "Traders",
  contact: "ContactMessages",
  contactForm: "contactForm",
  trips: "MemberTrips",
  crowd: "CrowdReports",
  uploads: "ProgrammeUploads"
};
const FOUNDING_PLACES = 25;
const PLAN_STATUS = ["Scheduled", "Boarding", "Delayed", "Departed"];
const LOG_TYPES = ["Updated", "Changed", "Added", "Searched", "Published", "Fixed"];
const DUE = ["NOV", "DEC", "JAN", "FEB", "MAR", "SPRING", "WINTER", "LATER"];
const WEEKS_SHOWN = 8;
const LOG_DAYS = 42;

/* ---------- helpers ---------- */

function fail(message) {
  throw { adminMessage: message };
}

async function wrap(fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error("Admin board error", e);
    return { ok: false, error: e.adminMessage || "Something went wrong. Please try again in a moment." };
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

async function safeCount(query) {
  try {
    return await query.count(OPTS);
  } catch (e) {
    return null;
  }
}

async function safeFind(query) {
  try {
    const res = await query.find(OPTS);
    return res.items;
  } catch (e) {
    return [];
  }
}

// ISO week number, used for the "w44" labels on the chart.
function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

/* ---------- Wix REST, only when the API key secret is there ---------- */

async function apiKey() {
  try {
    return await getSecret("ukagApiKey");
  } catch (e) {
    return "";
  }
}

async function accountId() {
  try {
    return await getSecret("ukagAccountId");
  } catch (e) {
    return "";
  }
}

async function wixApi(method, url, body, scope) {
  const key = await apiKey();
  if (!key) return { missingKey: true };
  const headers = { Authorization: key, "Content-Type": "application/json" };
  if (scope === "account") {
    const acc = await accountId();
    if (!acc) return { missingAccount: true };
    headers["wix-account-id"] = acc;
  } else {
    headers["wix-site-id"] = SITE_ID;
  }
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    json = { raw: text.slice(0, 200) };
  }
  if (!res.ok) return { error: (json && json.message) || ("Wix said " + res.status) };
  return json;
}

async function siteStatus() {
  const r = await wixApi("GET", "https://www.wixapis.com/urls-server/v2/published-site-urls");
  if (r.missingKey) return { known: false, note: "Add the ukagApiKey secret to see this" };
  if (r.error) return { known: false, note: r.error };
  const urls = r.urls || r.publishedSiteUrls || [];
  return { known: true, live: urls.length > 0 };
}

async function formSignups() {
  const q = { query: { filter: { namespace: { $eq: "wix.form_app.form" } }, cursorPaging: { limit: 50 } } };
  const forms = await wixApi("POST", "https://www.wixapis.com/form-schema-service/v4/forms/query", q);
  if (forms.missingKey) return { known: false, forms: [] };
  if (forms.error || !forms.forms) return { known: false, forms: [], note: forms.error };
  const list = forms.forms.map((f) => ({ id: f.id, name: f.name }));
  if (!list.length) return { known: true, forms: [] };
  const counts = await wixApi("POST", "https://www.wixapis.com/form-submission-service/v4/submissions/count", {
    formIds: list.map((f) => f.id),
    namespace: "wix.form_app.form"
  });
  const byId = {};
  (counts.formsSubmissionsCount || []).forEach((c) => { byId[c.formId] = c; });
  return {
    known: true,
    forms: list.map((f) => ({ name: f.name, total: (byId[f.id] && byId[f.id].totalCount) || 0, unseen: (byId[f.id] && byId[f.id].unseenCount) || 0 }))
  };
}

/* ---------- the board ---------- */

async function memberWeeks() {
  const since = startOfWeek(new Date(Date.now() - (WEEKS_SHOWN - 1) * 7 * 86400000));
  const items = await safeFind(wixData.query(C.members).ge("_createdDate", since).limit(1000));
  const weeks = [];
  for (let i = 0; i < WEEKS_SHOWN; i++) {
    const start = new Date(since.getTime() + i * 7 * 86400000);
    weeks.push({ start, label: "w" + isoWeek(start), count: 0 });
  }
  items.forEach((m) => {
    const t = new Date(m._createdDate).getTime();
    for (let i = weeks.length - 1; i >= 0; i--) {
      if (t >= weeks[i].start.getTime()) {
        weeks[i].count++;
        break;
      }
    }
  });
  return weeks.map((w) => ({ label: w.label, count: w.count }));
}

async function reported() {
  const out = [];
  for (const [coll, kind] of [[C.threads, "Post"], [C.photos, "Photo"], [C.comments, "Comment"]]) {
    const items = await safeFind(wixData.query(coll).gt("reportCount", 0).ne("hidden", true).descending("_updatedDate").limit(20));
    items.forEach((i) => out.push({ kind, title: clean(i.title || i.body || "", 80), by: i.authorName || "", reports: i.reportCount || 0, reasons: (i.reportReasons || []).slice(-2) }));
  }
  return out;
}

async function readerQuestions() {
  const a = await safeFind(wixData.query(C.contact).descending("_createdDate").limit(10));
  const b = await safeFind(wixData.query(C.contactForm).descending("_createdDate").limit(10));
  return a.concat(b)
    .sort((x, y) => new Date(y._createdDate) - new Date(x._createdDate))
    .slice(0, 10)
    .map((m) => ({
      when: m._createdDate,
      name: clean(m.name || m.firstName || m.title || "", 60),
      email: clean(m.email || "", 120),
      message: clean(m.message || m.body || m.text || "", 400)
    }));
}

export const getBoard = webMethod(Permissions.Anyone, () => wrap(async () => {
  if (!(await isAdmin())) return { admin: false };
  const weekStart = startOfWeek(new Date());
  const logSince = londonDate(Date.now() - LOG_DAYS * 86400000);

  const [
    members, membersWeek, profiles, threads, photos, trips, crowd, uploadsHeld,
    tradersAll, tradersLive, tradersPending, founding, weeks, reports, questions,
    plans, ideas, log, checks, status, forms
  ] = await Promise.all([
    safeCount(wixData.query(C.members)),
    safeCount(wixData.query(C.members).ge("_createdDate", weekStart)),
    safeCount(wixData.query(C.profiles)),
    safeCount(wixData.query(C.threads)),
    safeCount(wixData.query(C.photos)),
    safeCount(wixData.query(C.trips)),
    safeCount(wixData.query(C.crowd)),
    safeCount(wixData.query(C.uploads).eq("status", "Held")),
    safeCount(wixData.query(C.traders)),
    safeCount(wixData.query(C.traders).eq("status", "live")),
    safeCount(wixData.query(C.traders).eq("status", "pending")),
    safeCount(wixData.query(C.traders).eq("founding", true)),
    memberWeeks(),
    reported(),
    readerQuestions(),
    safeFind(wixData.query(C.plans).ascending("sort").limit(200)),
    safeFind(wixData.query(C.ideas).descending("votes").ascending("_createdDate").limit(200)),
    safeFind(wixData.query(C.log).ge("logDate", logSince).descending("logDate").descending("_createdDate").limit(400)),
    safeFind(wixData.query(C.checks).ascending("sort").limit(200)),
    siteStatus(),
    formSignups()
  ]);

  return {
    admin: true,
    now: new Date().toISOString(),
    site: status,
    signups: {
      members, membersWeek, profiles, threads, photos, trips, crowd, uploadsHeld,
      traders: { all: tradersAll, live: tradersLive, pending: tradersPending, founding, foundingTotal: FOUNDING_PLACES },
      forms,
      weeks
    },
    reports,
    questions,
    plans: plans.map((p) => ({ id: p._id, title: p.title, detail: p.detail || "", due: p.due || "", gate: p.gate || "", status: p.status || "Scheduled", doneOn: p.doneOn || "", sort: p.sort || 0 })),
    ideas: ideas.map((i) => ({ id: i._id, title: i.title, detail: i.detail || "", area: i.area || "", status: i.status || "standby", votes: i.votes || 0 })),
    log: log.map((l) => ({ id: l._id, date: l.logDate, type: l.type || "Updated", what: l.title, area: l.area || "", source: l.source || "", link: l.link || "" })),
    checks: checks.map((c) => ({ id: c._id, page: c.title, wixPath: c.wixPath || "", file: c.pageUrl || "", desktop: c.desktop || "Not checked", mobile: c.mobile || "Not checked", tablet: c.tablet || "Not checked", links: c.links || "", photos: c.photos || "", lastChecked: c.lastChecked || "", nextCheck: c.nextCheck || "", notes: c.notes || "" }))
  };
}));

/* ---------- changes from the board ---------- */

async function addLogRow(type, what, area) {
  await wixData.insert(C.log, { logDate: londonDate(Date.now()), type, title: what, area, source: "Admin board", link: "" }, OPTS);
}

export const setPlanStatus = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const status = PLAN_STATUS.includes(input && input.status) ? input.status : fail("Pick a status.");
  const item = await wixData.get(C.plans, String((input && input.id) || ""), OPTS);
  if (!item) fail("That job is not on the board any more.");
  const doneOn = status === "Departed" ? londonDate(Date.now()) : "";
  await wixData.update(C.plans, Object.assign({}, item, { status, doneOn }), OPTS);
  if (status === "Departed") await addLogRow("Updated", "Finished: " + item.title, item.gate || "Plans");
  return { id: item._id, status, doneOn };
}));

export const addPlan = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const title = clean(input && input.title, 90);
  if (!title) fail("Give the job a name.");
  const last = await safeFind(wixData.query(C.plans).descending("sort").limit(1));
  const plan = await wixData.insert(C.plans, {
    title,
    detail: clean(input.detail, 200),
    due: DUE.includes(input.due) ? input.due : "LATER",
    gate: clean(input.gate, 40),
    status: "Scheduled",
    sort: ((last[0] && last[0].sort) || 0) + 10
  }, OPTS);
  return { id: plan._id };
}));

export const addIdea = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const title = clean(input && input.title, 90);
  if (!title) fail("Give the idea a name.");
  const idea = await wixData.insert(C.ideas, { title, detail: clean(input.detail, 200), area: clean(input.area, 40), status: "standby", votes: 0, addedBy: "Jack" }, OPTS);
  return { id: idea._id };
}));

export const voteIdea = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const idea = await wixData.get(C.ideas, String((input && input.id) || ""), OPTS);
  if (!idea) fail("That idea is not in the hangar any more.");
  const votes = (idea.votes || 0) + 1;
  await wixData.update(C.ideas, Object.assign({}, idea, { votes }), OPTS);
  return { id: idea._id, votes };
}));

// Moves an idea out of the hangar and onto Departures as a Scheduled job.
export const scheduleIdea = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const idea = await wixData.get(C.ideas, String((input && input.id) || ""), OPTS);
  if (!idea) fail("That idea is not in the hangar any more.");
  const last = await safeFind(wixData.query(C.plans).descending("sort").limit(1));
  const plan = await wixData.insert(C.plans, {
    title: idea.title,
    detail: idea.detail || "",
    due: DUE.includes(input.due) ? input.due : "WINTER",
    gate: idea.area || "",
    status: "Scheduled",
    sort: ((last[0] && last[0].sort) || 0) + 10,
    fromIdea: idea._id
  }, OPTS);
  await wixData.update(C.ideas, Object.assign({}, idea, { status: "scheduled" }), OPTS);
  await addLogRow("Added", "Idea moved to the plans: " + idea.title, idea.area || "Ideas");
  return { planId: plan._id };
}));

export const addLogEntry = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const what = clean(input && input.what, 200);
  if (!what) fail("Say what changed.");
  const type = LOG_TYPES.includes(input.type) ? input.type : "Updated";
  await addLogRow(type, what, clean(input.area, 40));
  return { added: true };
}));

const CHECK_VALUES = ["Clear", "Check", "Not checked"];
export const setCheck = webMethod(Permissions.Anyone, (input) => wrap(async () => {
  await requireAdmin();
  const item = await wixData.get(C.checks, String((input && input.id) || ""), OPTS);
  if (!item) fail("That page is not on the list any more.");
  const field = ["desktop", "mobile", "tablet"].includes(input.field) ? input.field : fail("Pick desktop, mobile or tablet.");
  const value = CHECK_VALUES.includes(input.value) ? input.value : fail("Pick Clear or Check.");
  const update = Object.assign({}, item, { [field]: value, lastChecked: londonDate(Date.now()) });
  await wixData.update(C.checks, update, OPTS);
  return { id: item._id, field, value, lastChecked: update.lastChecked };
}));

/* ---------- publish and unpublish, with the API key secret ---------- */

export const publishSite = webMethod(Permissions.Anyone, () => wrap(async () => {
  await requireAdmin();
  const r = await wixApi("POST", "https://www.wixapis.com/site-publisher/v1/site/publish", {});
  if (r.missingKey) fail("Add the ukagApiKey secret first, or ask Claude to publish.");
  if (r.error) fail("Publish did not work: " + r.error);
  await addLogRow("Published", "Site published from the admin board", "Whole site");
  return { live: true };
}));

export const unpublishSite = webMethod(Permissions.Anyone, () => wrap(async () => {
  await requireAdmin();
  const r = await wixApi("POST", "https://www.wixapis.com/enterprise-public-proxy/v1/sites/unpublish", { metaSiteId: SITE_ID }, "account");
  if (r.missingKey) fail("Add the ukagApiKey secret first, or ask Claude to take the site offline.");
  if (r.missingAccount) fail("Add the ukagAccountId secret first, or ask Claude to take the site offline.");
  if (r.error) fail("Taking the site offline did not work: " + r.error);
  await addLogRow("Published", "Site taken offline from the admin board", "Whole site");
  return { live: false };
}));
