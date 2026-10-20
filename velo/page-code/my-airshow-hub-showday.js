// My Airshow Hub: extra page code for the new Show Day tab.
// The hub page already has page code for the hub itself. Keep all of it, and add this:
//   1. Add this import line at the top of the hub's page code, under the existing imports:
import { getProgrammes, getShowDayMember, submitProgramme, getCrowdReports, addCrowdReport, confirmCrowdReport } from 'backend/showday.web';
import { authentication } from 'wix-members-frontend';

//   2. Paste the block below inside the hub's existing $w.onReady(function () { ... }).
//      HUB_BOX is the ID of the HTML embed that shows the hub (click it in the editor, the ID is in the Properties panel).
//      The Show Day tab inside the hub sends its requests through that same box.

// START Show Day tab
const HUB_BOX = '#html1';
const hubBox = $w(HUB_BOX);
hubBox.onMessage(async (event) => {
  const m = event.data;
  if (!m || m.source !== 'ukag-showday') return;
  const reply = { source: 'ukag-showday', id: m.id, ok: true };
  try {
    const p = m.payload || {};
    if (m.action === 'load') reply.data = { programmes: await getProgrammes(p.show || null), member: await getShowDayMember() };
    else if (m.action === 'reports') reply.data = await getCrowdReports(p.showId);
    else if (m.action === 'report') reply.data = await addCrowdReport(p);
    else if (m.action === 'confirm') reply.data = await confirmCrowdReport(p.id);
    else if (m.action === 'upload') reply.data = await submitProgramme(p);
    else if (m.action === 'login') { await authentication.promptLogin({ mode: 'login' }); reply.data = { ok: true }; }
    else throw new Error('Unknown request.');
  } catch (err) {
    reply.ok = false;
    reply.error = (err && err.message) || 'Something went wrong.';
  }
  hubBox.postMessage(reply);
});
// END Show Day tab
