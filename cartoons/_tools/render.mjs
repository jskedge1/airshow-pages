// Stand-in for the motion-reel render step (that skill was not installed when the train map was made).
//   node _tools/render.mjs --film <film> --format 16x9|9x16 [--fps 60] [--workers 4] [--from s --to s]
// Renders every frame with window.seek(t) in headless Chromium (motion blur on), in parallel chunks,
// and writes out/<film>/<film>-<format>-video.mp4 plus out/<film>/hits.json (the film's sound cues).
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { spawn, execFileSync } from 'node:child_process';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const film = arg('film'), format = arg('format', '16x9'), fps = Number(arg('fps', 60)), workers = Number(arg('workers', 4));
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); } }); });
await new Promise((res) => srv.listen(0, res)); const port = srv.address().port;
const [w, h] = format === '9x16' ? [1080, 1920] : [1920, 1080];
const out = path.join(root, 'out', film); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const url = `http://localhost:${port}/${film}/index.html?render=1&format=${format}&fps=${fps}`;
const open = async () => { const pg = await browser.newPage({ viewport: { width: w, height: h } }); pg.on('pageerror', (e) => { console.error('pageerror', e.message); process.exit(1); }); await pg.goto(url); await pg.waitForFunction('window.filmReady', null, { timeout: 30000 }); return pg; };
const first = await open();
const dur = await first.evaluate('window.DURATION');
fs.writeFileSync(path.join(out, 'hits.json'), JSON.stringify(await first.evaluate('window.HITS')));
const f0 = Math.round(Number(arg('from', 0)) * fps), f1 = Math.round(Number(arg('to', dur)) * fps), n = f1 - f0;
const per = Math.ceil(n / workers); const parts = [];
let done = 0; const t0 = Date.now();
await Promise.all(Array.from({ length: workers }, async (_, k) => {
  const a = f0 + k * per, b = Math.min(f1, a + per); if (a >= b) return;
  const pg = k ? await open() : first; const part = path.join(out, `part-${format}-${k}.mp4`); parts[k] = part;
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps), part]);
  ff.stderr.on('data', (d) => process.stderr.write(d));
  for (let f = a; f < b; f++) {
    const b64 = await pg.evaluate((t) => { window.seek(t); return document.getElementById('film').toDataURL('image/jpeg', 0.94).slice(23); }, f / fps);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (++done % 600 === 0) console.log(`${done}/${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
}));
await browser.close(); srv.close();
const list = path.join(out, `parts-${format}.txt`); fs.writeFileSync(list, parts.filter(Boolean).map((p) => `file '${p}'`).join('\n'));
const video = path.join(out, `${film}-${format}-video.mp4`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video]);
parts.filter(Boolean).forEach((p) => fs.unlinkSync(p)); fs.unlinkSync(list);
console.log('wrote', video, `${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
