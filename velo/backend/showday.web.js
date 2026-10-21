// Show Day Live: backend for the Show Day board.
// Wix editor: Code (the {} icon) > Backend & Public > Backend > + > New Web Module, name it showday.web.js, paste this file.
//
// FlyingProgrammes  : live running orders, one item per show day (read by anyone, written by Jack or Claude).
// ProgrammeUploads  : member photos of the flying display page. Since 21 Oct 2026 each upload is checked automatically
//                     (airshow, date, location and that it is a flying display page). Passes go live on the board
//                     straight away with status "Live"; anything that fails is kept with status "Held" for Jack.
// MemberTrips       : the member's saved shows, used for the My Airshow Hub board.

import { Permissions, webMethod } from 'wix-web-module';
import wixData from 'wix-data';
import { currentMember } from 'wix-members-backend';
import { mediaManager } from 'wix-media-backend';

const SHOWS = {
  'riat': 'Royal International Air Tattoo',
  'cosford': 'RAF Cosford Air Show',
  'duxford': 'IWM Duxford Air Shows',
  'eastbourne': 'Airbourne, Eastbourne International Airshow',
  'clacton': 'Clacton Airshow',
  'wales': 'Wales Airshow',
  'midlands': 'Midlands Air Festival',
  'shuttleworth': 'Shuttleworth Air Shows',
  'little-gransden': 'Little Gransden Air and Car Show',
  'southport': 'Southport Air Show',
  'blackpool': 'Blackpool Air Show',
  'ayr': 'The International Ayr Show',
  'headcorn': 'Headcorn Air Show'
};
const MAX_PAGES = 3;
const MAX_PAGE_BYTES = 3 * 1024 * 1024;

// Running orders for one show, or every show when showId is empty.
export const getProgrammes = webMethod(Permissions.Anyone, async (showId) => {
  let q = wixData.query('FlyingProgrammes').eq('live', true).ascending('sortOrder').limit(200);
  if (showId && SHOWS[showId]) q = q.eq('showId', showId);
  const res = await q.find();
  const out = res.items.map((i) => ({
    showId: i.showId,
    showName: i.showName,
    day: i.dayLabel,
    date: i.showDate ? new Date(i.showDate).toISOString().slice(0, 10) : '',
    acts: (i.running && Array.isArray(i.running.acts)) ? i.running.acts : []
  }));
  // Checked flying display photos from members at the show today.
  let pq = wixData.query('ProgrammeUploads').eq('status', 'Live').eq('showDay', ukDay(new Date())).descending('_createdDate').limit(20);
  if (showId && SHOWS[showId]) pq = pq.eq('showId', showId);
  const photos = await pq.find({ suppressAuth: true });
  photos.items.forEach((i) => out.push({
    showId: i.showId, showName: i.showName, day: i.dayLabel, date: i.showDay, acts: [],
    photo: { id: i._id, url: imageUrl(i.photo), by: i.firstName || 'A member', at: i._createdDate, place: i.placeNote || '' }
  }));
  return out;
});

// Who is looking: logged in or not, a first name, and the shows saved in My Trips.
export const getShowDayMember = webMethod(Permissions.Anyone, async () => {
  let member = null;
  try { member = await currentMember.getMember({ fieldsets: ['FULL'] }); } catch (e) { member = null; }
  if (!member) return { loggedIn: false, saved: [] };
  const name = (member.contactDetails && member.contactDetails.firstName) || (member.profile && member.profile.nickname) || 'Member';
  let saved = [];
  try {
    const trips = await wixData.query('MemberTrips').eq('memberId', member._id).limit(100).find({ suppressAuth: true });
    saved = [...new Set(trips.items.filter((t) => !t.archived).map((t) => t.showSlug).filter(Boolean))];
  } catch (e) { saved = []; }
  return { loggedIn: true, name, saved };
});

// Crowd reports: what members on site say about car parks, toilets and queues. Only the last 45 minutes show.
const PLACES = ['Car parks', 'Entry gates', 'Toilets', 'Food and drink', 'Shuttle bus', 'Crowd line', 'Other'];
const STATUSES = ['Quiet', 'Short queue', 'Running', 'Busy', 'Long queue', 'Delayed', 'Full or closed'];

export const getCrowdReports = webMethod(Permissions.Anyone, async (showId) => {
  if (!SHOWS[showId]) return [];
  const since = new Date(Date.now() - 45 * 60 * 1000);
  const res = await wixData.query('CrowdReports').eq('showId', showId).ge('_createdDate', since)
    .descending('_createdDate').limit(30).find();
  return res.items.map((i) => ({ id: i._id, place: i.place, status: i.status, note: i.note || '', confirms: i.confirms || 0, at: i._createdDate }));
});

export const addCrowdReport = webMethod(Permissions.SiteMember, async (payload) => {
  const p = payload || {};
  if (!SHOWS[p.showId]) throw new Error('Please choose a show first.');
  if (!PLACES.includes(p.place) || !STATUSES.includes(p.status)) throw new Error('Please pick where and how it is.');
  const member = await currentMember.getMember();
  const recent = await wixData.query('CrowdReports').eq('memberId', member._id)
    .ge('_createdDate', new Date(Date.now() - 2 * 60 * 1000)).count({ suppressAuth: true });
  if (recent >= 3) throw new Error('Thanks, give it a couple of minutes before posting again.');
  await wixData.insert('CrowdReports', {
    title: `${SHOWS[p.showId]}: ${p.place}, ${p.status}`,
    showId: p.showId,
    place: p.place,
    status: p.status,
    note: String(p.note || '').slice(0, 80),
    confirms: 0,
    memberId: member._id
  }, { suppressAuth: true });
  return { ok: true };
});

export const confirmCrowdReport = webMethod(Permissions.SiteMember, async (id) => {
  const item = await wixData.get('CrowdReports', String(id), { suppressAuth: true });
  if (!item) return { ok: false };
  item.confirms = (item.confirms || 0) + 1;
  await wixData.update('CrowdReports', item, { suppressAuth: true });
  return { ok: true, confirms: item.confirms };
});

// The crowd area of each show, roughly, and how far away (km) a member can be and still count as at the show.
// Seafront shows get more room because the crowd line runs along the front.
const SHOW_POINTS = {
  'riat': [51.682, -1.790, 5], 'cosford': [52.640, -2.306, 4], 'midlands': [52.203, -1.888, 4],
  'eastbourne': [50.763, 0.285, 8], 'clacton': [51.788, 1.155, 8], 'wales': [51.615, -3.944, 9],
  'duxford': [52.090, 0.132, 4], 'shuttleworth': [52.088, -0.320, 4], 'little-gransden': [52.167, -0.149, 4],
  'southport': [53.648, -3.010, 8], 'blackpool': [53.810, -3.055, 8], 'ayr': [55.462, -4.640, 8],
  'headcorn': [51.157, 0.642, 4]
};
// Extra show days for venues with several events a year (Duxford, Shuttleworth). Add each date as YYYY-MM-DD.
const EXTRA_SHOW_DAYS = {
  'duxford': [],
  'shuttleworth': []
};
// Words on a programme page that name a show, used to spot a page from a different show.
const SHOW_WORDS = {
  'riat': ['air tattoo', 'riat', 'fairford'], 'cosford': ['cosford'], 'midlands': ['midlands air festival', 'ragley'],
  'eastbourne': ['eastbourne', 'airbourne'], 'clacton': ['clacton'], 'wales': ['wales airshow', 'swansea'],
  'duxford': ['duxford'], 'shuttleworth': ['shuttleworth', 'old warden'], 'little-gransden': ['gransden'],
  'southport': ['southport'], 'blackpool': ['blackpool'], 'ayr': ['ayr show', 'international ayr'], 'headcorn': ['headcorn', 'lashenden']
};
const FEATURED_SLUGS = {
  'RIAT': 'riat', 'RAF Cosford': 'cosford', 'Midlands': 'midlands', 'Eastbourne': 'eastbourne', 'Clacton': 'clacton',
  'Wales': 'wales', 'Duxford': 'duxford', 'Shuttleworth': 'shuttleworth', 'Little Gransden': 'little-gransden',
  'Southport': 'southport', 'Blackpool': 'blackpool', 'Ayr': 'ayr', 'Headcorn': 'headcorn'
};
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MAX_UPLOADS_A_DAY = 3;

function ukDay(d) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
function ukDayName(d) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'long' }).format(d).toLowerCase();
}
function imageUrl(u) {
  const m = /^wix:image:\/\/v1\/([^/#]+)/.exec(String(u || ''));
  return m ? 'https://static.wixstatic.com/media/' + m[1] : String(u || '');
}
function km(a, b) {
  const r = (x) => x * Math.PI / 180;
  const dLat = r(b[0] - a[0]), dLng = r(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
function okNumber(n, lo, hi) { return typeof n === 'number' && isFinite(n) && n >= lo && n <= hi; }

// First full date in text such as "Fri 16 – Sun 18 July 2027" or "Sunday 13 June 2027".
function parseShowDates(text, year) {
  const t = String(text || '').toLowerCase();
  const re = /(\d{1,2})(?:st|nd|rd|th)?\s*(?:[–\-to ]+\s*(?:[a-z]+\s+)?(\d{1,2})(?:st|nd|rd|th)?)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/;
  const m = re.exec(t);
  if (!m) return null;
  const y = Number(m[4] || year || new Date().getFullYear());
  const mon = MONTHS.indexOf(m[3]);
  const a = Number(m[1]), b = m[2] ? Number(m[2]) : a;
  const days = [];
  for (let d = a; d <= Math.max(a, b); d += 1) days.push(`${y}-${String(mon + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  return days;
}

// The days a show is on, from Show Info, then the featured show list, plus any extra days above.
async function showDays(showId) {
  let days = null;
  const info = await wixData.query('ShowInfo').eq('slug', showId).limit(1).find({ suppressAuth: true });
  if (info.items[0]) days = parseShowDates(info.items[0].dateText, info.items[0].year);
  if (!days) {
    const featured = await wixData.query('FeaturedAirshows').limit(100).find({ suppressAuth: true });
    const f = featured.items.find((x) => FEATURED_SLUGS[x.shortName] === showId);
    if (f) days = parseShowDates(f.dates, null);
  }
  return (days || []).concat(EXTRA_SHOW_DAYS[showId] || []);
}

// The four checks. Every one has to pass before a photo goes live.
async function runChecks(showId, p, now) {
  const today = ukDay(now), todayName = ukDayName(now);
  const text = String((p.scan && p.scan.text) || '').toLowerCase().slice(0, 6000);
  const checks = [];

  // 1. Airshow: the page must not name a different show.
  const has = (w) => new RegExp('\\b' + w.replace(/ /g, '\\s+') + '\\b').test(text);
  const others = Object.keys(SHOW_WORDS).filter((k) => k !== showId && SHOW_WORDS[k].some(has));
  const named = SHOW_WORDS[showId].some(has);
  checks.push(others.length && !named
    ? { key: 'airshow', ok: false, detail: `The page looks like it is from ${SHOWS[others[0]]}, not ${SHOWS[showId]}.` }
    : { key: 'airshow', ok: true, detail: named ? `${SHOWS[showId]} is named on the page.` : `Nothing on the page points to a different show.` });

  // 2. Date: the show is on today, the photo was taken today, and any day named on the page is today.
  const days = await showDays(showId);
  const taken = /^\d{4}-\d{2}-\d{2}$/.test(String(p.taken || '')) ? p.taken : '';
  const dayWords = DAY_NAMES.filter((d) => new RegExp('\\b' + d + '\\b').test(text));
  let dateCheck;
  if (!days.length) dateCheck = { ok: false, detail: `I do not have the ${SHOWS[showId]} dates yet, so I cannot confirm it is on today.` };
  else if (!days.includes(today)) dateCheck = { ok: false, detail: `${SHOWS[showId]} is not on today.` };
  else if (taken && taken !== today) dateCheck = { ok: false, detail: 'The photo was taken on a different day. Please take a new photo of today’s page.' };
  else if (dayWords.length && !dayWords.includes(todayName)) dateCheck = { ok: false, detail: `The page is for ${dayWords[0][0].toUpperCase() + dayWords[0].slice(1)}, and today is ${todayName[0].toUpperCase() + todayName.slice(1)}.` };
  else dateCheck = { ok: true, detail: `${SHOWS[showId]} is on today${taken ? ' and the photo was taken today' : ''}.` };
  checks.push(Object.assign({ key: 'date' }, dateCheck));

  // 3. Location: the phone, or the photo, is at the show.
  const pt = SHOW_POINTS[showId];
  const spots = [];
  if (p.here && okNumber(p.here.lat, -90, 90) && okNumber(p.here.lng, -180, 180)) spots.push({ from: 'phone', d: km([p.here.lat, p.here.lng], pt), acc: okNumber(p.here.acc, 0, 1e6) ? p.here.acc / 1000 : 0 });
  if (p.gps && okNumber(p.gps.lat, -90, 90) && okNumber(p.gps.lng, -180, 180)) spots.push({ from: 'photo', d: km([p.gps.lat, p.gps.lng], pt), acc: 0 });
  const near = spots.find((s) => s.d - Math.min(s.acc, 2) <= pt[2]);
  let placeCheck;
  if (near) placeCheck = { ok: true, detail: `Your ${near.from} is at the show, about ${near.d < 1 ? 'under 1' : Math.round(near.d)} km from the crowd line.` };
  else if (spots.length) placeCheck = { ok: false, detail: `Your ${spots[0].from} is about ${Math.round(spots[0].d)} km from ${SHOWS[showId]}.` };
  else placeCheck = { ok: false, detail: 'I could not see where you are. Please allow location when your phone asks, then send it again.' };
  checks.push(Object.assign({ key: 'location' }, placeCheck));

  // 4. Flying display page: enough display times on it.
  const times = Math.min(99, Math.max(0, Number(p.scan && p.scan.times) || 0));
  checks.push(times >= 4
    ? { key: 'page', ok: true, detail: `I can read ${times} display times on the page.` }
    : { key: 'page', ok: false, detail: times ? `I can only read ${times} display time${times > 1 ? 's' : ''}. Please take a closer, sharper photo of the times page.` : 'I cannot read any display times. Please take a clear photo of the flying display times page.' });

  return { checks, near };
}

// A member sends a photo of the flying display page. It is checked, then goes live or is held for Jack.
export const submitProgramme = webMethod(Permissions.SiteMember, async (payload) => {
  const p = payload || {};
  const showId = String(p.showId || '');
  if (!SHOWS[showId]) throw new Error('Please choose which show this is for.');
  const pages = Array.isArray(p.pages) ? p.pages.slice(0, MAX_PAGES) : [];
  if (!pages.length) throw new Error('Please add a photo of the flying display page.');

  const now = new Date();
  const today = ukDay(now);
  const member = await currentMember.getMember({ fieldsets: ['FULL'] });
  const sent = await wixData.query('ProgrammeUploads').eq('memberId', member._id).eq('showDay', today).count({ suppressAuth: true });
  if (sent >= MAX_UPLOADS_A_DAY * MAX_PAGES) throw new Error('Thank you, you have sent plenty today. The board already has your photos.');

  const firstName = (member.contactDetails && member.contactDetails.firstName) || (member.profile && member.profile.nickname) || 'A member';
  const memberName = (member.contactDetails && [member.contactDetails.firstName, member.contactDetails.lastName].filter(Boolean).join(' ')) || firstName;
  const note = String(p.note || '').slice(0, 140);
  const { checks, near } = await runChecks(showId, p, now);
  const passed = checks.every((c) => c.ok);
  const status = passed ? 'Live' : 'Held';
  const dayLabel = ukDayName(now)[0].toUpperCase() + ukDayName(now).slice(1);
  const stamp = now.toISOString().slice(0, 16).replace(/[-:T]/g, '');

  let n = 0;
  for (const dataUrl of pages) {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl));
    if (!m) throw new Error('One of the pages is not a photo I can read. Please use a JPEG or PNG.');
    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > MAX_PAGE_BYTES) throw new Error('One of the photos is too large. Please try a smaller photo.');
    n += 1;
    const fileName = `${showId}-${stamp}-${n}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
    const upload = await mediaManager.upload('/programme-uploads', buffer, fileName, {
      mediaOptions: { mimeType: `image/${m[1]}`, mediaType: 'image' },
      metadataOptions: { isPrivate: false, isVisitorUpload: true }
    });
    await wixData.insert('ProgrammeUploads', {
      title: `${SHOWS[showId]}, ${dayLabel} ${today} (page ${n} of ${pages.length})`,
      showId,
      showName: SHOWS[showId],
      dayLabel,
      showDay: today,
      photo: upload.fileUrl,
      note,
      memberId: member._id,
      memberName,
      firstName,
      status,
      checks: checks.map((c) => `${c.ok ? 'PASS' : 'FAIL'} ${c.key}: ${c.detail}`).join('\n'),
      placeNote: near ? `${near.d < 1 ? 'under 1' : Math.round(near.d)} km from the crowd line` : '',
      reports: 0
    }, { suppressAuth: true });
  }
  return { ok: true, pages: n, live: passed, checks };
});

// Members can flag a photo that looks wrong. Two flags take it off the board until Jack looks at it.
export const reportProgrammePhoto = webMethod(Permissions.SiteMember, async (id) => {
  const item = await wixData.get('ProgrammeUploads', String(id || ''), { suppressAuth: true });
  if (!item || item.status !== 'Live') return { ok: true, hidden: true };
  const member = await currentMember.getMember();
  const by = Array.isArray(item.reportedBy) ? item.reportedBy : [];
  if (by.includes(member._id) || item.memberId === member._id) {
    if (item.memberId !== member._id) return { ok: true, hidden: false };
  } else by.push(member._id);
  item.reportedBy = by;
  item.reports = by.length;
  if (item.memberId === member._id || by.length >= 2) item.status = 'Reported';
  await wixData.update('ProgrammeUploads', item, { suppressAuth: true });
  return { ok: true, hidden: item.status === 'Reported' };
});
