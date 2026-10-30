// Page code for /advertise-with-us (trader plans, trader sign up form and advert packages).
// The page's HTML box loads https://jskedge1.github.io/airshow-pages/advertise-with-us.html
// and the header element (#airshowAuto) shows it as part of the page, so messages
// go through that element instead of the box.
import { getDirectory, submitListing } from 'backend/traders.web';
import { authentication } from 'wix-members-frontend';

const AUTO = '#airshowAuto';
const SOURCE = 'ukag-traders';

async function answer(m) {
  const reply = { source: SOURCE, id: m.id, ok: true };
  try {
    const p = m.payload || {};
    let res;
    if (m.action === 'directory') res = await getDirectory();
    else if (m.action === 'submit') res = await submitListing(p);
    else if (m.action === 'login') {
      await authentication.promptLogin({ mode: 'login' });
      res = { ok: true, data: { loggedIn: true } };
    } else throw new Error('Unknown request.');
    if (!res.ok) throw new Error(res.error);
    reply.data = res.data;
  } catch (err) {
    reply.ok = false;
    reply.error = (err && err.message) || 'Something went wrong.';
  }
  return reply;
}

$w.onReady(function () {
  try {
    $w(AUTO).on('pagemessage', async (event) => {
      const m = event.detail;
      if (!m || m.source !== SOURCE) return;
      const reply = await answer(m);
      $w(AUTO).setAttribute('message', JSON.stringify(reply));
    });
  } catch (err) {
    console.log('Advertise page: header element not found', err);
  }
});
