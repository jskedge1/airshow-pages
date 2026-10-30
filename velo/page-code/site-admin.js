// Page code for /site-admin (Jack's admin board).
// Set this page to Members only in the editor (Page settings, Permissions) and hide it from the menu.
// The backend (backend/admin.web.js) checks the Admin role on every request, so nobody else sees or changes anything.
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/admin/board.html
// Its ID must be html1 (click the embed, Properties panel). Change BOARD_BOX below if it is different.
import { getBoard, setPlanStatus, addPlan, addIdea, voteIdea, scheduleIdea, addLogEntry, setCheck, publishSite, unpublishSite } from 'backend/admin.web';
import { authentication } from 'wix-members-frontend';

const BOARD_BOX = '#html1';
const SOURCE = 'ukag-admin';

$w.onReady(function () {
  const box = $w(BOARD_BOX);
  authentication.onLogin(() => box.postMessage({ source: SOURCE, event: 'refresh' }));

  box.onMessage(async (event) => {
    const m = event.data;
    if (!m || m.source !== SOURCE) return;
    const reply = { source: SOURCE, id: m.id, ok: true };
    try {
      const p = m.payload || {};
      let res;
      switch (m.action) {
        case 'board': res = await getBoard(); break;
        case 'planStatus': res = await setPlanStatus(p); break;
        case 'addPlan': res = await addPlan(p); break;
        case 'addIdea': res = await addIdea(p); break;
        case 'vote': res = await voteIdea(p); break;
        case 'schedule': res = await scheduleIdea(p); break;
        case 'log': res = await addLogEntry(p); break;
        case 'check': res = await setCheck(p); break;
        case 'publish': res = await publishSite(); break;
        case 'unpublish': res = await unpublishSite(); break;
        case 'login': await authentication.promptLogin({ mode: 'login' }); res = await getBoard(); break;
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
