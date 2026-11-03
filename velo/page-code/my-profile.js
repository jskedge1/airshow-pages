// Page code for /my-profile (My Profile: one profile with a tab for every part of the site the member has signed up to).
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/my-profile.html
// Its ID must be html1. Change PROFILE_BOX below if it is different.
// The backend web module is backend/profile.web.js (velo/backend/profile.web.js in the repository).
import { getMyProfile, saveProfile, uploadPhoto, savePrivacy } from 'backend/profile.web';
import { authentication } from 'wix-members-frontend';
import wixLocation from 'wix-location';

const PROFILE_BOX = '#html1';
const SOURCE = 'ukag-profile';

$w.onReady(function () {
  const box = $w(PROFILE_BOX);

  authentication.onLogin(() => box.postMessage({ source: SOURCE, event: 'refresh' }));
  authentication.onLogout(() => box.postMessage({ source: SOURCE, event: 'refresh' }));

  box.onMessage(async (event) => {
    const m = event.data;
    if (!m || m.source !== SOURCE) return;
    const reply = { source: SOURCE, id: m.id, ok: true };
    try {
      const p = m.payload || {};
      let res;
      switch (m.action) {
        case 'me': res = await getMyProfile(); break;
        case 'login':
          await authentication.promptLogin({ mode: p.mode === 'signup' ? 'signup' : 'login' });
          res = await getMyProfile();
          break;
        case 'logout':
          await authentication.logout();
          res = { ok: true, data: { loggedIn: false } };
          break;
        case 'save': res = await saveProfile(p); break;
        case 'photo': res = await uploadPhoto(p); break;
        case 'privacy': res = await savePrivacy(p); break;
        case 'go':
          wixLocation.to(String(p.url || '/'));
          res = { ok: true, data: {} };
          break;
        default: throw new Error('Unknown request.');
      }
      if (!res.ok) throw new Error(res.error);
      reply.data = res.data;
    } catch (err) {
      reply.ok = false;
      const msg = (err && err.message) || '';
      reply.error = m.action === 'login' && /cancel|closed/i.test(msg)
        ? 'The log in window was closed. Tap log in to try again.'
        : (msg || 'Something went wrong.');
    }
    box.postMessage(reply);
  });
});
