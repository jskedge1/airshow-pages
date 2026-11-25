// Writes the hint posts (1080 px squares) and the transparent hint stickers:  node mascot/hints/build.js
const path = require('path'), fs = require('fs'), { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  await p.goto('file://' + path.join(__dirname, 'hints.html')); await p.waitForFunction('window.READY === true'); await p.evaluate(() => document.fonts.ready);
  const posts = { h0: '0-something-new', h0t: '0-something-new-story', h1: '1-something-is-coming', h2: '2-can-you-hear-it', h3: '3-what-could-pip-stand-for', h4: '4-who-is-pip', h5: '5-countdown-3', h6: '6-countdown-2', h7: '7-countdown-1' };
  fs.mkdirSync(path.join(__dirname, 'posts'), { recursive: true }); fs.mkdirSync(path.join(__dirname, 'stickers'), { recursive: true });
  for (const id in posts) await (await p.$('#' + id)).screenshot({ path: path.join(__dirname, 'posts', 'pip-hint-' + posts[id] + '.png') });
  await p.evaluate(() => { document.body.style.background = 'transparent'; document.getElementById('stickers').style.background = 'transparent'; });
  for (const id of ['wingtip', 'tail', 'peek', 'flyer', 'shadow']) await (await p.$('#k-' + id + ' .pip')).screenshot({ path: path.join(__dirname, 'stickers', 'pip-sticker-' + id + '.png'), omitBackground: true });
  await b.close(); console.log('hint posts and stickers written');
})();
