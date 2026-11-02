// Page code for /command-centre (Jack's Command Centre).
// Set this page to Members only in the editor (Page settings, Permissions) and hide it from the menu.
// Every backend method checks the Admin role, so nobody else sees or changes anything.
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/admin/command.html
// Its ID must be html1 (click the embed, Properties panel). Change BOX below if it is different.
import { getCommand, hideForumItem, clearForumReports, sendMemberNotice } from 'backend/command.web';
import { setPlanStatus, addLogEntry, setCheck, voteIdea, scheduleIdea, publishSite, unpublishSite } from 'backend/admin.web';
import { approveTrader, sendBackTrader, setTraderStatus } from 'backend/traders.web';
import { authentication } from 'wix-members-frontend';

const BOX = '#html1';
const SOURCE = 'ukag-command';

const ACTIONS = {
  command: () => getCommand(),
  planStatus: (p) => setPlanStatus(p),
  log: (p) => addLogEntry(p),
  check: (p) => setCheck(p),
  vote: (p) => voteIdea(p),
  schedule: (p) => scheduleIdea(p),
  publish: () => publishSite(),
  unpublish: () => unpublishSite(),
  approveTrader: (p) => approveTrader(p),
  sendBackTrader: (p) => sendBackTrader(p),
  traderStatus: (p) => setTraderStatus(p),
  hideItem: (p) => hideForumItem(p),
  clearReports: (p) => clearForumReports(p),
  notice: (p) => sendMemberNotice(p)
};

$w.onReady(function () {
  const box = $w(BOX);
  authentication.onLogin(() => box.postMessage({ source: SOURCE, event: 'refresh' }));

  box.onMessage(async (event) => {
    const m = event.data;
    if (!m || m.source !== SOURCE) return;
    const reply = { source: SOURCE, id: m.id, ok: true };
    try {
      let res;
      if (m.action === 'login') {
        await authentication.promptLogin({ mode: 'login' });
        res = await getCommand();
      } else if (ACTIONS[m.action]) {
        res = await ACTIONS[m.action](m.payload || {});
      } else {
        throw new Error('Unknown request.');
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
