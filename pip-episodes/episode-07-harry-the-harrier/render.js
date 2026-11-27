// Renders Pip Episode 7 (Harry the Harrier), from this folder's parent or anywhere:
//   node render.js timing          writes film.json (the length comes from the script in film.js) and cues.json
//   node render.js stills 12 95 …  writes stills/<t>.png at those seconds, to check the picture
//   node render.js film [jobs]     renders final/pip-episode-07-harry-the-harrier.mp4 in parallel chunks
// music.py reads cues.json and writes music.wav; the film step mixes it in.
const fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const dir = __dirname, FPS = 30, NAME = 'pip-episode-07-harry-the-harrier';
async function open(b) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', (m) => { if (m.type() === 'error') console.error('page:', m.text()); });
  p.on('pageerror', (e) => console.error('page error:', e.message));
  await p.route('http://film.test/**', (r) => r.fulfill({ path: path.join(dir, decodeURIComponent(new URL(r.request().url()).pathname)) }));
  await p.goto('http://film.test/index.html?render=1&fps=' + FPS + '&format=16x9');
  await p.waitForFunction('window.filmReady === true', null, { timeout: 60000 });
  return p;
}
async function frames(from, to, out) {
  const b = await chromium.launch(); const p = await open(b);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = from; i < to; i++) {
    const d = await p.evaluate((t) => { window.seek(t); return document.getElementById('film').toDataURL('image/jpeg', 0.92); }, i / FPS);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if ((i - from) % 600 === 0) console.log(path.basename(out), 'frame', i - from, 'of', to - from);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close();
}
(async () => {
  const mode = process.argv[2] || 'film';
  if (mode === 'timing') {
    fs.writeFileSync(path.join(dir, 'film.json'), JSON.stringify({ title: 'Pip, Episode 7: Harry the Harrier', duration: 30, formats: ['16x9'] }));
    const b = await chromium.launch(); const p = await open(b);
    const dur = await p.evaluate('window.FILM_DURATION');
    fs.writeFileSync(path.join(dir, 'film.json'), JSON.stringify({ title: 'Pip, Episode 7: Harry the Harrier', duration: +dur.toFixed(2), formats: ['16x9'] }, null, 1));
    fs.writeFileSync(path.join(dir, 'cues.json'), JSON.stringify(await p.evaluate('window.HITS')));
    fs.writeFileSync(path.join(dir, 'script-times.json'), JSON.stringify(await p.evaluate('window.SCRIPT_TIMES'), null, 1));
    console.log('duration', dur.toFixed(1), 's =', Math.floor(dur / 60) + ':' + String(Math.round(dur % 60)).padStart(2, '0'));
    await b.close(); return;
  }
  if (mode === 'stills') {
    fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
    const b = await chromium.launch(); const p = await open(b);
    for (const s of process.argv.slice(3)) { await p.evaluate((t) => window.seek(t), +s); await (await p.$('#film')).screenshot({ path: path.join(dir, 'stills', s.padStart(6, '0') + '.png') }); }
    await b.close(); return;
  }
  const jobs = +(process.argv[3] || 4), dur = JSON.parse(fs.readFileSync(path.join(dir, 'film.json'))).duration;
  const n = Math.round(dur * FPS), per = Math.ceil(n / jobs), tmp = path.join(dir, 'final', 'parts');
  fs.mkdirSync(tmp, { recursive: true });
  await Promise.all(Array.from({ length: jobs }, (_, j) => frames(j * per, Math.min(n, (j + 1) * per), path.join(tmp, `part${j}.mp4`))));
  fs.writeFileSync(path.join(tmp, 'list.txt'), Array.from({ length: jobs }, (_, j) => `file 'part${j}.mp4'`).join('\n'));
  const silent = path.join(tmp, 'silent.mp4'), out = path.join(dir, 'final', NAME + '.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c', 'copy', silent]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', path.join(dir, 'music.wav'), '-c:v', 'copy',
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  const b = await chromium.launch(); const p = await open(b);
  await p.evaluate((t) => window.seek(t), 150); await (await p.$('#film')).screenshot({ path: path.join(dir, 'final', NAME + '-cover.png') });
  await b.close();
  fs.rmSync(tmp, { recursive: true });
  console.log('written', out);
})();
