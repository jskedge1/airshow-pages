// Page code for /airshow-traders (the traders directory: finder, tips and the link to the trader plans).
// The page has ONE HTML embed (#html1), set to Website address:
//   https://jskedge1.github.io/airshow-pages/traders/directory.html
// Since 30 Oct 2026 the header element (#airshowAuto) shows that page as part of the page,
// so it grows with the content. Messages come through that element; the box listener stays
// in case the page is ever shown in the box again.
import { getDirectory, submitListing } from 'backend/traders.web';
import { authentication } from 'wix-members-frontend';

const TRADERS_BOX = '#html1';
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
  } catch (err) {}
  try {
    const box = $w(TRADERS_BOX);
    box.onMessage(async (event) => {
      const m = event.data;
      if (!m || m.source !== SOURCE) return;
      box.postMessage(await answer(m));
    });
  } catch (err) {}
});
