// Show Day Live: backend for the Show Day board.
// Wix editor: Code (the {} icon) > Backend & Public > Backend > + > New Web Module, name it showday.web.js, paste this file.
//
// FlyingProgrammes  : live running orders, one item per show day (read by anyone, written by Jack or Claude).
// ProgrammeUploads  : member photos of the flying programme, waiting for Jack to check.
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
  return res.items.map((i) => ({
    showId: i.showId,
    showName: i.showName,
    day: i.dayLabel,
    date: i.showDate ? new Date(i.showDate).toISOString().slice(0, 10) : '',
    acts: (i.running && Array.isArray(i.running.acts)) ? i.running.acts : []
  }));
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

// A member sends photos of the flying programme. They land in ProgrammeUploads with status "Waiting".
export const submitProgramme = webMethod(Permissions.SiteMember, async (payload) => {
  const p = payload || {};
  const showId = String(p.showId || '');
  if (!SHOWS[showId]) throw new Error('Please choose which show this programme is for.');
  const pages = Array.isArray(p.pages) ? p.pages.slice(0, MAX_PAGES) : [];
  if (!pages.length) throw new Error('Please add a photo of the flying display page.');

  const member = await currentMember.getMember({ fieldsets: ['FULL'] });
  const memberName = (member.contactDetails && [member.contactDetails.firstName, member.contactDetails.lastName].filter(Boolean).join(' ')) || (member.profile && member.profile.nickname) || 'Member';
  const day = String(p.day || '').slice(0, 40);
  const note = String(p.note || '').slice(0, 140);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

  let n = 0;
  for (const dataUrl of pages) {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl));
    if (!m) throw new Error('One of the pages is not a photo we can read. Please use a JPEG or PNG.');
    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > MAX_PAGE_BYTES) throw new Error('One of the photos is too large. Please try a smaller photo.');
    n += 1;
    const fileName = `${showId}-${stamp}-${n}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
    const upload = await mediaManager.upload('/programme-uploads', buffer, fileName, {
      mediaOptions: { mimeType: `image/${m[1]}`, mediaType: 'image' },
      metadataOptions: { isPrivate: false, isVisitorUpload: true }
    });
    await wixData.insert('ProgrammeUploads', {
      title: `${SHOWS[showId]}${day ? ', ' + day : ''} (page ${n} of ${pages.length})`,
      showId,
      showName: SHOWS[showId],
      dayLabel: day,
      photo: upload.fileUrl,
      note,
      memberName,
      status: 'Waiting'
    }, { suppressAuth: true });
  }
  return { ok: true, pages: n };
});
