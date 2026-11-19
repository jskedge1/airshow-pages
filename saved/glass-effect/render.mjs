// node render.mjs frames            -> out/frames/f00000.jpg at 12 steps a second, plus out/cues.json
// node render.mjs stills 1,5.5,20   -> out/stills/t001.0.jpg ...
// node render.mjs sheet [every]     -> out/sheet_pN.jpg contact sheets (one still every N seconds)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
const DIR = path.dirname(fileURLToPath(import.meta.url));   // works in folders with spaces
const URL_ = pathToFileURL(DIR + '/').href + (process.env.PAGE || 'index.html');
const FPS = +(process.env.FPS || 12);
const mode = process.argv[2] || 'stills';
const OUT = DIR + '/' + (process.env.OUT || 'out');
fs.mkdirSync(OUT, { recursive: true });

async function page(browser) {
  const p = await browser.newPage({ viewport: { width: +(process.env.VW || 1080), height: +(process.env.VH || 1920) }, deviceScaleFactor: 1 });
  if (!browser._warned) { browser._warned = 1; const seen = new Set(); p.on('console', m => { if (m.type() === 'warning' && !seen.has(m.text())) { seen.add(m.text()); console.log('PAGE WARN', m.text()); } }); }
  await p.goto(URL_);
  await p.waitForFunction(() => typeof window.ready === 'function');
  await p.evaluate(() => window.ready());
  return p;
}
async function shot(p, t, file, q = 90) {
  // SETTLE (cine.js) waits for video clip frames to load
  await p.evaluate(async t => { setT(t); if (window.SETTLE) await window.SETTLE(); }, t);
  await p.screenshot({ path: file, type: 'jpeg', quality: q });
}
// CHROME=<path> uses an installed Chrome instead of Playwright's own (on Jack's Mac: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome)
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
try {
  const p0 = await page(browser);
  const DUR = await p0.evaluate(() => DUR);
  fs.writeFileSync(OUT + '/cues.json', JSON.stringify(await p0.evaluate(() => ({ ...window.CUES, dur: DUR }))));
  if (mode === 'frames') {
    const fd = OUT + '/frames'; fs.rmSync(fd, { recursive: true, force: true }); fs.mkdirSync(fd, { recursive: true });
    const N = Math.ceil(DUR * FPS), W = 6;
    const pages = [p0]; for (let k = 1; k < W; k++) pages.push(await page(browser));
    let done = 0;
    await Promise.all(pages.map(async (p, w) => {
      for (let n = w; n < N; n += W) {
        await shot(p, n / FPS, `${fd}/f${String(n).padStart(5, '0')}.jpg`, +(process.env.JPGQ || 93));
        if (++done % 120 === 0) console.log('frames', done, '/', N);
      }
    }));
    console.log('DUR', DUR, 'frames', N);
  } else if (mode === 'sheet') {
    const every = parseFloat(process.argv[3] || '1');
    const sd = OUT + '/sheet'; fs.rmSync(sd, { recursive: true, force: true }); fs.mkdirSync(sd, { recursive: true });
    const ts = []; for (let t = 0.5; t < DUR; t += every) ts.push(+t.toFixed(2));
    for (const t of ts) await shot(p0, t, `${sd}/t${String(t.toFixed(1)).padStart(5, '0')}.jpg`, 80);
    const files = fs.readdirSync(sd).filter(f => !f.startsWith('.')).sort();   // skip ._ files on exFAT drives
    const per = 30;
    for (let i = 0; i * per < files.length; i++) {
      const list = files.slice(i * per, (i + 1) * per);
      const args = [];
      list.forEach(f => args.push('-i', `${sd}/${f}`));
      const cols = process.env.VW === '1920' ? 6 : 10, rows = Math.ceil(list.length / cols);
      const lbl = list.map((f, k) => `[${k}:v]scale=${process.env.VW === '1920' ? '384:216' : '216:384'},drawtext=text='${f.slice(1, 6)}':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.6[v${k}]`).join(';');
      const stack = list.map((_, k) => `[v${k}]`).join('') + `xstack=inputs=${list.length}:layout=` + list.map((_, k) => `${(k % cols) * (process.env.VW === '1920' ? 384 : 216)}_${Math.floor(k / cols) * (process.env.VW === '1920' ? 216 : 384)}`).join('|') + `:fill=black[o]`;
      execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, '-filter_complex', lbl + ';' + stack, '-map', '[o]', '-frames:v', '1', `${OUT}/sheet_p${i + 1}.jpg`]);
    }
    console.log('sheets', Math.ceil(files.length / per), 'DUR', DUR);
  } else {
    const sd = OUT + '/stills'; fs.mkdirSync(sd, { recursive: true });
    for (const t of (process.argv[3] || '1').split(',').map(Number)) await shot(p0, t, `${sd}/t${t.toFixed(2)}.jpg`, 85);
    console.log('stills done');
  }
} finally { await browser.close(); }
