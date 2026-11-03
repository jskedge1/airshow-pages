// Page code for /volunteer-hub (volunteer log in and the Volunteer Hub).
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/volunteer-hub.html
// Its ID must be html1 (click the embed, Properties panel). Change HUB_BOX below if it is different.
// The backend web module is backend/team.web.js (velo/backend/team.web.js in the repository).
import { getMe, applyToJoin, uploadTeamPhoto, sendTeamWork, cancelTeamWork, askTakeDown, markChangeMade, saveTeamProfile } from 'backend/team.web';
import { authentication } from 'wix-members-frontend';

const HUB_BOX = '#html1';
const SOURCE = 'ukag-team';

$w.onReady(function () {
  const box = $w(HUB_BOX);

  // Tell the page when someone logs in or out, so it swaps between the log in screen and the hub.
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
        case 'me': res = await getMe(); break;
        case 'prompt':
        case 'login':
          await authentication.promptLogin({ mode: p.mode === 'signup' ? 'signup' : 'login' });
          res = await getMe();
          break;
        case 'logout':
          await authentication.logout();
          res = { ok: true, data: { loggedIn: false } };
          break;
        case 'apply': res = await applyToJoin(p); break;
        case 'upload': res = await uploadTeamPhoto(p); break;
        case 'send': res = await sendTeamWork(p); break;
        case 'cancel': res = await cancelTeamWork(p); break;
        case 'takeDown': res = await askTakeDown(p); break;
        case 'fixed': res = await markChangeMade(p); break;
        case 'profile': res = await saveTeamProfile(p); break;
        default: throw new Error('Unknown request.');
      }
      if (!res.ok) throw new Error(res.error);
      reply.data = res.data;
    } catch (err) {
      reply.ok = false;
      const msg = (err && err.message) || '';
      reply.error = (m.action === 'prompt' || m.action === 'login') && /cancel|closed/i.test(msg)
        ? 'The log in window was closed. Tap log in to try again.'
        : (msg || 'Something went wrong.');
    }
    box.postMessage(reply);
  });
});
