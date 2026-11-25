// Makes the print file and a picture of the poster:  node mascot/poster/build.js
const path = require('path'), { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1123, height: 1588 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'poster.html'));
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.pdf({ path: path.join(__dirname, 'meet-pip-poster-A3.pdf'), width: '297mm', height: '420mm', printBackground: true });
  await (await p.$('.poster')).screenshot({ path: path.join(__dirname, 'meet-pip-poster.png') });
  await b.close(); console.log('poster written');
})();
