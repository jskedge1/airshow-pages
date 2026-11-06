// Page code for /site-admin (Jack's Command Centre, with the Departures Board one tap away).
// The site is at the Wix 100 page limit, so both admin screens share this one hidden, members only page.
//   /site-admin              opens the Command Centre  (admin/command.html, messages source 'ukag-command')
//   /site-admin?view=board   opens the Departures Board (admin/board.html,   messages source 'ukag-admin')
// The backend web modules check the Admin role on every request, so nobody else sees or changes anything.
// The page has ONE HTML embed with the ID html1, set to Website address. This code points it at the right screen.
import { getCommand, hideForumItem, clearForumReports, sendMemberNotice, markReplied } from 'backend/command.web';
import { getBoard, setPlanStatus, addPlan, addIdea, voteIdea, scheduleIdea, addLogEntry, setCheck, publishSite, unpublishSite } from 'backend/admin.web';
import { approveTrader, sendBackTrader, setTraderStatus } from 'backend/traders.web';
import { authentication } from 'wix-members-frontend';
import wixLocation from 'wix-location-frontend';

const BOX = '#html1';
const BASE = 'https://jskedge1.github.io/airshow-pages/admin/';
const SCREENS = {
  command: { url: BASE + 'command.html', source: 'ukag-command' },
  board: { url: BASE + 'board.html', source: 'ukag-admin' }
};

const COMMAND = {
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
  notice: (p) => sendMemberNotice(p),
  replied: (p) => markReplied(p),
  login: async () => { await authentication.promptLogin({ mode: 'login' }); return getCommand(); }
};

const BOARD = {
  board: () => getBoard(),
  planStatus: (p) => setPlanStatus(p),
  addPlan: (p) => addPlan(p),
  addIdea: (p) => addIdea(p),
  vote: (p) => voteIdea(p),
  schedule: (p) => scheduleIdea(p),
  log: (p) => addLogEntry(p),
  check: (p) => setCheck(p),
  publish: () => publishSite(),
  unpublish: () => unpublishSite(),
  login: async () => { await authentication.promptLogin({ mode: 'login' }); return getBoard(); }
};

$w.onReady(function () {
  const box = $w(BOX);
  const which = wixLocation.query.view === 'board' ? 'board' : 'command';
  const screen = SCREENS[which];
  const actions = which === 'board' ? BOARD : COMMAND;
  if (box.src !== screen.url) box.src = screen.url;

  authentication.onLogin(() => box.postMessage({ source: screen.source, event: 'refresh' }));

  box.onMessage(async (event) => {
    const m = event.data;
    if (!m || m.source !== screen.source) return;
    const reply = { source: screen.source, id: m.id, ok: true };
    try {
      const run = actions[m.action];
      if (!run) throw new Error('Unknown request.');
      const res = await run(m.payload || {});
      if (!res.ok) throw new Error(res.error);
      reply.data = res.data;
    } catch (err) {
      reply.ok = false;
      reply.error = (err && err.message) || 'Something went wrong.';
    }
    box.postMessage(reply);
  });
});
