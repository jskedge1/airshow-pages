// Page code for /trader-admin (Jack's trader admin: approval queue and all traders).
// Set this page to Members only in the editor (Page settings, Permissions), so it is never shown to visitors.
// The backend also checks the Admin role on every request, so nobody else can approve or change anything.
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/traders/admin.html
// Its ID must be html1 (click the embed, Properties panel). Change ADMIN_BOX below if it is different.
import { getAdmin, approveTrader, sendBackTrader, setTraderStatus, markChecked } from 'backend/traders.web';
import { authentication } from 'wix-members-frontend';

const ADMIN_BOX = '#html1';
const SOURCE = 'ukag-traders';

$w.onReady(function () {
  const box = $w(ADMIN_BOX);
  authentication.onLogin(() => box.postMessage({ source: SOURCE, event: 'refresh' }));

  box.onMessage(async (event) => {
    const m = event.data;
    if (!m || m.source !== SOURCE) return;
    const reply = { source: SOURCE, id: m.id, ok: true };
    try {
      const p = m.payload || {};
      let res;
      switch (m.action) {
        case 'admin': res = await getAdmin(); break;
        case 'approve': res = await approveTrader(p); break;
        case 'sendBack': res = await sendBackTrader(p); break;
        case 'status': res = await setTraderStatus(p); break;
        case 'checked': res = await markChecked(p); break;
        case 'login': await authentication.promptLogin({ mode: 'login' }); res = await getAdmin(); break;
        default: throw new Error('Unknown request.');
      }
      if (!res.ok) throw new Error(res.error);
      reply.data = res.data;
    } catch (err) {
      reply.ok = false;
      reply.error = (err && err.message) || 'Something went wrong.';
    }
    box.postMessage(reply);
  });
});
