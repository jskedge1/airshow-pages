// Show Day Live: page code. The same code goes on every page that shows the board:
//   the Show Day page, the Show Day section of each feature show page, and My Airshow Hub.
// Wix editor: open the page, add an Embed HTML box, set it to Website address and give it the ID showDayBoard
// (Properties panel). Then open Page Code at the bottom of the editor and paste this in.
// If the page already has page code (My Airshow Hub does), paste only the part between the two START and END lines
// inside its existing $w.onReady, and keep the import line at the top of the file.

import { getProgrammes, getShowDayMember, submitProgramme, getCrowdReports, addCrowdReport, confirmCrowdReport } from 'backend/showday.web';
import { authentication } from 'wix-members-frontend';
import wixLocationFrontend from 'wix-location-frontend';

// START Show Day Live
$w.onReady(function () {
  const board = $w('#showDayBoard');

  board.onMessage(async (event) => {
    const m = event.data;
    if (!m || m.source !== 'ukag-showday') return;
    const reply = { source: 'ukag-showday', id: m.id, ok: true };
    try {
      if (m.action === 'load') {
        const p = m.payload || {};
        const [programmes, member] = await Promise.all([getProgrammes(p.show || null), getShowDayMember()]);
        // A feature show page links here with ?show=eastbourne so the board opens on that show.
        const focus = (wixLocationFrontend.query && wixLocationFrontend.query.show) || '';
        reply.data = { programmes, member, focus };
      } else if (m.action === 'reports') {
        reply.data = await getCrowdReports((m.payload || {}).showId);
      } else if (m.action === 'report') {
        reply.data = await addCrowdReport(m.payload);
      } else if (m.action === 'confirm') {
        reply.data = await confirmCrowdReport((m.payload || {}).id);
      } else if (m.action === 'upload') {
        reply.data = await submitProgramme(m.payload);
      } else if (m.action === 'login') {
        await authentication.promptLogin({ mode: 'login' });
        reply.data = { ok: true };
      } else {
        throw new Error('Unknown request.');
      }
    } catch (err) {
      reply.ok = false;
      reply.error = (err && err.message) || 'Something went wrong.';
    }
    board.postMessage(reply);
  });

  // Reload the board when someone logs in or out on this page.
  authentication.onLogin(() => board.postMessage({ source: 'ukag-showday', event: 'refresh' }));
});
// END Show Day Live
