// Makes an MP4 from Pip Studio with the best quality, from the repo root:
//   node mascot/studio/render.js <out.mp4> '<settings as JSON>'
// Settings are the same as the studio's: format, pose, colour, headline, sub, ticks, label.
const fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const [,, out, json] = process.argv;
(async () => {
  const cfg = JSON.parse(json), root = __dirname;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await p.route('http://studio.test/**', (r) => r.fulfill({ path: path.join(root, decodeURIComponent(new URL(r.request().url()).pathname)) }));
  await p.goto('http://studio.test/index.html?render=1');
  await p.waitForFunction('window.READY === true');
  await p.evaluate((c) => window.studio(c), cfg);
  const { DUR, FPS } = await p.evaluate('window.STUDIO');
  const silent = out + '.silent.mp4';
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < DUR * FPS; i++) {
    const d = await p.evaluate((t) => { window.seek(t); return document.getElementById('cv').toDataURL('image/jpeg', 0.95); }, i / FPS);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', path.join(root, 'assets', 'music.mp3'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  fs.unlinkSync(silent); console.log('written', out);
})();
