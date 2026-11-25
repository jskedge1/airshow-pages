// Renders "Plan it with Pip" to MP4, from the repo root:
//   node mascot/film/plan-with-pip-calm/render.js 16x9      (wide only, like the calm cartoons)
//   node mascot/film/plan-with-pip/render.js 9x16      (tall)
// Writes hits.json first, then needs music.wav from: python3 mascot/film/plan-with-pip-calm/music.py
const fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const fmt = process.argv[2] || '16x9', dir = __dirname, FPS = 30;
const name = 'plan-it-with-pip-calm-style-wide';
(async () => {
  const [w, h] = fmt === '9x16' ? [1080, 1920] : [1920, 1080];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.route('http://film.test/**', (r) => r.fulfill({ path: path.join(dir, decodeURIComponent(new URL(r.request().url()).pathname)) }));
  await p.goto('http://film.test/index.html?render=1&fps=' + FPS + '&format=' + fmt);
  await p.waitForFunction('window.filmReady === true', null, { timeout: 30000 });
  const dur = await p.evaluate('window.DURATION');
  fs.writeFileSync(path.join(dir, 'hits.json'), JSON.stringify(await p.evaluate('window.HITS')));
  if (process.argv[3] === 'hits') { await b.close(); return; }
  fs.mkdirSync(path.join(dir, 'final'), { recursive: true });
  const silent = path.join(dir, 'final', '.silent-' + name + '.mp4'), out = path.join(dir, 'final', name + '.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(dur * FPS);
  for (let i = 0; i < n; i++) {
    const d = await p.evaluate((t) => { window.seek(t); return document.getElementById('film').toDataURL('image/jpeg', 0.93); }, i / FPS);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(name, 'frame', i, 'of', n);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  await p.evaluate((t) => window.seek(t), 45); await (await p.$('#film')).screenshot({ path: path.join(dir, 'final', name + '-cover.png') });
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', path.join(dir, 'music.wav'), '-c:v', 'copy',
    '-af', 'loudnorm=I=-17:TP=-2:LRA=11,alimiter=limit=0.84:level=false', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  fs.unlinkSync(silent); console.log('written', out);
})();
