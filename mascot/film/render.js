// Renders the cartoon to video. From the repo root:
//   node mascot/film/render.js 16x9 promo     (wide, for YouTube)
//   node mascot/film/render.js 9x16 promo     (tall, for Shorts, Reels and stories)
//   node mascot/film/render.js 9x16 teaser    (the 16 second teaser; 16x9 works too)
//   node mascot/film/render.js 9x16 mystery   (the 'Who is Pip?' pre-launch teaser, tall only: mystery.html)
// Needs the music first: node mascot/film/render.js 16x9 promo hits, then python3 mascot/film/music.py promo
const fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const fmt = process.argv[2] || '16x9', filmName = ['teaser', 'mystery'].includes(process.argv[3]) ? process.argv[3] : 'promo', dir = __dirname;
const name = filmName === 'mystery' ? 'who-is-pip-teaser-tall' : (filmName === 'teaser' ? 'pip-airshow-season-teaser-' : 'meet-pip-') + (fmt === '9x16' ? 'tall' : 'wide');
(async () => {
  const [w, h] = fmt === '9x16' ? [1080, 1920] : [1920, 1080];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('file://' + path.join(dir, filmName === 'mystery' ? 'mystery.html' : 'index.html') + '?render=1&film=' + filmName + '&format=' + fmt);
  await p.waitForFunction('window.READY === true');
  const film = await p.evaluate('window.FILM');
  fs.writeFileSync(path.join(dir, 'hits-' + filmName + '.json'), JSON.stringify(await p.evaluate('window.HITS')));
  if (process.argv[4] === 'hits') { await b.close(); return; }
  fs.mkdirSync(path.join(dir, 'final'), { recursive: true });
  const silent = path.join(dir, 'final', '.silent-' + name + '.mp4'), out = path.join(dir, 'final', name + '.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(film.fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = film.duration * film.fps;
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.seek(t), i / film.fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(name, 'frame', i, 'of', n);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await p.evaluate(t => window.seek(t), filmName === 'mystery' ? 5.5 : filmName === 'teaser' ? 7 : 4.5);
  await p.screenshot({ path: path.join(dir, 'final', name + '-cover.png') });
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', path.join(dir, 'music-' + filmName + '.wav'), '-c:v', 'copy',
    '-af', 'loudnorm=I=-16:TP=-2:LRA=11,alimiter=limit=0.84:level=false', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  fs.unlinkSync(silent);
  console.log('written', out);
})();
