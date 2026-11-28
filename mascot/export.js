// Writes every pose as mascot/svg/pip-<pose>.svg and a 800 px transparent mascot/png/pip-<pose>.png.
// Run from the repo root after changing mascot.js:  node mascot/export.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pip = require('./mascot.js');

(async () => {
  const dir = __dirname;
  for (const d of ['svg', 'png']) fs.mkdirSync(path.join(dir, d), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  for (const pose of pip.poses) {
    const svg = pip.svg({ pose });
    fs.writeFileSync(path.join(dir, 'svg', `pip-${pose}.svg`), svg + '\n');
    await page.setContent(`<body style="margin:0;background:transparent">${svg.replace('<svg ', '<svg id="m" style="display:block;width:800px" ')}</body>`);
    await (await page.$('#m')).screenshot({ path: path.join(dir, 'png', `pip-${pose}.png`), omitBackground: true });
  }
  await browser.close();
  console.log(`${pip.poses.length} poses written`);
})();
