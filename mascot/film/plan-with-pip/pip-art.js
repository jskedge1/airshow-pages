// Draws Pip's poses for the "Plan it with Pip" cartoon as transparent PNGs in assets/pip/.
// Run from the repo root after changing mascot/mascot.js:  node mascot/film/plan-with-pip/pip-art.js
const path = require('path'), { chromium } = require('playwright');
const pip = require('../../mascot.js');
const OUT = path.join(__dirname, 'assets', 'pip');
const S = (k) => Math.sin(k * Math.PI * 2 / 6);
const ART = {
  rest: { pose: 'rest' }, blink: { pose: 'rest', eyes: 'happy' }, point: { pose: 'point' }, tip: { pose: 'tip' }, map: { pose: 'map' },
  sun: { pose: 'sun' }, loud: { pose: 'loud' }, cheer: { pose: 'cheer' }, marshal: { pose: 'marshal' }, photo: { pose: 'photo' },
  fly: { pose: 'fly', eyes: 'happy', mouth: 'grin' },
};
for (let k = 0; k < 6; k++) ART['hello' + k] = { pose: 'hello', right: -46 + 13 * S(k) };   // a wave, six frames
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 900, height: 900 } });
  for (const [name, o] of Object.entries(ART)) {
    // every pose on the same square, so Pip keeps the same size and the same feet line when the pose changes
    const svg = pip.svg(Object.assign({ title: '', size: 800, box: o.pose === 'fly' ? '-40 0 480 400' : '-40 -60 480 440' }, o));
    await p.setContent(`<body style="margin:0;background:transparent">${svg.replace('<svg ', '<svg id="m" ')}</body>`);
    await (await p.$('#m')).screenshot({ path: path.join(OUT, name + '.png'), omitBackground: true });
  }
  await b.close(); console.log(Object.keys(ART).length + ' Pip pictures written');
})();
