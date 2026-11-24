// Stills and contact sheets for a film: node _tools/shots.mjs <film> <format> <t1,t2,...|every:N> [--sheet cols]
// Writes out/<film>/shots/<format>-<t>.jpg and, with --sheet, out/<film>/sheet-<format>-<n>.jpg
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const [film, format, spec] = process.argv.slice(2);
const sheetI = process.argv.indexOf('--sheet'); const cols = sheetI > 0 ? Number(process.argv[sheetI + 1]) : 0;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.wav': 'audio/wav' };
export function serve() { return new Promise((res) => { const s = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); } }); }); s.listen(0, () => res(s)); }); }
const s = await serve(); const port = s.address().port;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: format === '9x16' ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
pg.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); }); pg.on('pageerror', (e) => console.log('pageerror:', e.message));
await pg.goto(`http://localhost:${port}/${film}/index.html?render=1&format=${format}&blur=0`);
await pg.waitForFunction('window.filmReady', null, { timeout: 20000 });
const dur = await pg.evaluate('window.DURATION');
let ts = spec.startsWith('every:') ? Array.from({ length: Math.floor(dur / Number(spec.slice(6))) }, (_, i) => (i + 0.5) * Number(spec.slice(6))) : spec.split(',').map(Number);
const out = path.join(root, 'out', film, 'shots'); fs.mkdirSync(out, { recursive: true });
const files = [];
for (const t of ts) { await pg.evaluate((t) => window.seek(t), t); const url = await pg.evaluate(() => document.getElementById('film').toDataURL('image/jpeg', 0.9)); const f = path.join(out, `${format}-${t.toFixed(2).padStart(7, '0')}.jpg`); fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); files.push(f); }
await b.close(); s.close();
if (cols) {
  const per = cols * (format === '9x16' ? 2 : 4); const w = format === '9x16' ? 360 : 640;
  for (let i = 0, n = 1; i < files.length; i += per, n++) {
    const chunk = files.slice(i, i + per); const list = path.join(out, 'list.txt'); fs.writeFileSync(list, chunk.map((f) => `file '${f}'\nduration 1`).join('\n'));
    const o = path.join(root, 'out', film, `sheet-${format}-${n}.jpg`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `scale=${w}:-1,tile=${cols}x${Math.ceil(chunk.length / cols)}:padding=6:color=white`, '-frames:v', '1', '-q:v', '3', o]);
    console.log(o);
  }
} else console.log(files.join('\n'));
