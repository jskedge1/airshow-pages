// Renders slides.html into PNGs and MP4s.
//   node social/plan-2027/render.js
// Output:
//   social/plan-2027/landscape/*.png   1920x1080 (YouTube, Facebook, X, website)
//   social/plan-2027/tiktok/*.png      1080x1920 (TikTok photo mode, Reels, Shorts, Stories)
//   social/plan-2027/plan-2027-landscape.mp4 and plan-2027-tiktok.mp4 (silent slideshows, add a sound in the app)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const FORMATS = { land: { dir: 'landscape', w: 1920, h: 1080 }, tok: { dir: 'tiktok', w: 1080, h: 1920 } };
// seconds on screen for each slide (cover, steps 1 to 7, end); list heavy slides stay up longer
const HOLD = [3.5, 5, 5, 5.5, 5.5, 6.5, 5, 5, 4];
const FADE = 0.5;

(async () => {
  const browser = await chromium.launch();
  for (const [f, cfg] of Object.entries(FORMATS)) {
    const out = path.join(DIR, cfg.dir);
    fs.mkdirSync(out, { recursive: true });
    const page = await browser.newPage({ viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(DIR, 'slides.html') + '?f=' + f + '&s=0');
    const files = await page.evaluate(() => window.SLIDE_FILES);
    const pngs = [];
    for (let i = 0; i < files.length; i++) {
      await page.goto('file://' + path.join(DIR, 'slides.html') + '?f=' + f + '&s=' + i, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      const p = path.join(out, files[i] + '.png');
      await page.locator('.slide').screenshot({ path: p });
      pngs.push(p);
      console.log(p);
    }
    await page.close();

    // silent slideshow with crossfades
    const args = ['-y', '-loglevel', 'error'];
    pngs.forEach((p, i) => args.push('-loop', '1', '-t', String(HOLD[i] + FADE), '-i', p));
    let chain = '', last = '[0:v]', offset = 0;
    for (let i = 1; i < pngs.length; i++) {
      offset += HOLD[i - 1];
      const lbl = '[x' + i + ']';
      chain += last + '[' + i + ':v]xfade=transition=fade:duration=' + FADE + ':offset=' + offset.toFixed(2) + lbl + ';';
      last = lbl;
    }
    chain += last + 'format=yuv420p[v]';
    const mp4 = path.join(DIR, 'plan-2027-' + (f === 'tok' ? 'tiktok' : 'landscape') + '.mp4');
    args.push('-filter_complex', chain, '-map', '[v]', '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-movflags', '+faststart', mp4);
    execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'inherit'] });
    console.log(mp4);
  }
  await browser.close();
})();
