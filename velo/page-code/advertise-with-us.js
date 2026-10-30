// Page code for /advertise-with-us (trader plans, trader sign up form and advert packages).
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/advertise-with-us.html
// Its ID must be html1 (click the embed, Properties panel). Change TRADERS_BOX below if it is different.
import { getDirectory, submitListing } from 'backend/traders.web';
import { authentication } from 'wix-members-frontend';

const TRADERS_BOX = '#html1';
const SOURCE = 'ukag-traders';

$w.onReady(function () {
  const box = $w(TRADERS_BOX);
  box.onMessage(async (event) => {
    const m = event.data;
    if (!m || m.source !== SOURCE) return;
    const reply = { source: SOURCE, id: m.id, ok: true };
    try {
      const p = m.payload || {};
      let res;
      if (m.action === 'directory') res = await getDirectory();
      else if (m.action === 'submit') res = await submitListing(p);
      else if (m.action === 'login') { await authentication.promptLogin({ mode: 'login' }); res = { ok: true, data: { loggedIn: true } }; }
      else throw new Error('Unknown request.');
      if (!res.ok) throw new Error(res.error);
      reply.data = res.data;
    } catch (err) {
      reply.ok = false;
      reply.error = (err && err.message) || 'Something went wrong.';
    }
    box.postMessage(reply);
  });
});
