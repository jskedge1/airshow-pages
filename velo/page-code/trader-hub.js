// Page code for /trader-hub (trader log in and the Trader Hub dashboard).
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/traders/trader-hub.html
// Its ID must be html1 (click the embed, Properties panel). Change HUB_BOX below if it is different.
import { getMyTrader, saveMyListing, uploadMyPhoto, saveMyPhotos, saveMyShow, removeMyShow, setMyPause } from 'backend/traders.web';
import { authentication } from 'wix-members-frontend';

const HUB_BOX = '#html1';
const SOURCE = 'ukag-traders';

$w.onReady(function () {
  const box = $w(HUB_BOX);

  // Tell the page when someone logs in or out, so it swaps between the log in screen and the dashboard.
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
        case 'me': res = await getMyTrader(); break;
        case 'login':
          await authentication.login(String(p.email || ''), String(p.password || ''));
          res = await getMyTrader();
          break;
        case 'prompt':
          await authentication.promptLogin({ mode: p.mode === 'signup' ? 'signup' : 'login' });
          res = await getMyTrader();
          break;
        case 'reset':
          await authentication.sendResetPasswordEmail(String(p.email || ''));
          res = { ok: true, data: { sent: true } };
          break;
        case 'logout':
          await authentication.logout();
          res = { ok: true, data: { loggedIn: false } };
          break;
        case 'saveListing': res = await saveMyListing(p); break;
        case 'upload': res = await uploadMyPhoto(p); break;
        case 'savePhotos': res = await saveMyPhotos(p); break;
        case 'saveShow': res = await saveMyShow(p); break;
        case 'removeShow': res = await removeMyShow(p); break;
        case 'pause': res = await setMyPause(p); break;
        default: throw new Error('Unknown request.');
      }
      if (!res.ok) throw new Error(res.error);
      reply.data = res.data;
    } catch (err) {
      reply.ok = false;
      const msg = (err && err.message) || '';
      reply.error = m.action === 'login'
        ? 'That email and password did not match. Please try again, or reset your password.'
        : (msg || 'Something went wrong.');
    }
    box.postMessage(reply);
  });
});
