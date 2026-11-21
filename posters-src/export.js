// Turns every poster in posters/ into an image beside it, at double size (2160 x 2700).
// Run from the repo root:  node posters-src/export.js            (all posters)
//                          node posters-src/export.js season-2027 (just one)
// Needs Playwright with Chromium. It also warns when text has run out of its space on a poster.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'posters');
const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
const scale = process.argv.includes('--draft') ? 1 : 2;
const outDir = process.argv.includes('--draft') ? path.join(dir, '.draft') : dir;

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const jobs = [];
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort()) {
    const slug = f.replace(/\.html$/, '');
    if (only.length && !only.includes(slug)) continue;
    if (slug === 'now-on-x') {
      // hand written, kept as PNG, with a square version
      jobs.push([f, '', 1080, 1350, slug + '.png']);
      jobs.push([f, '?size=square', 1080, 1080, slug + '-square.png']);
    } else if (/data-w="\d+" data-h="\d+"/.test(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      // banners, profile pictures and covers are exported at their own size, the one each platform asks for
      const m = fs.readFileSync(path.join(dir, f), 'utf8').match(/data-w="(\d+)" data-h="(\d+)"/);
      jobs.push([f, '', Number(m[1]), Number(m[2]), slug + '.jpg', 1]);
    } else {
      jobs.push([f, '', 1080, 1350, slug + '.jpg']);
    }
  }
  const browser = await chromium.launch();
  for (const [file, query, w, h, out, fixed] of jobs) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: fixed || scale });
    const page = await ctx.newPage();
    page.on('requestfailed', r => console.log('  COULD NOT LOAD', r.url()));
    await page.goto('file://' + path.join(dir, file) + query, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const problems = await page.evaluate(() => {
      const out = [];
      const p = document.getElementById('poster').getBoundingClientRect();
      const body = document.querySelector('.body');
      if (body && body.scrollHeight > body.clientHeight + 1) out.push('content is ' + (body.scrollHeight - body.clientHeight) + 'px too tall');
      document.querySelectorAll('.body *').forEach(el => {
        if (el.closest('svg') || el.closest('.photo') || el.children.length) return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const label = (el.className || el.tagName) + ' "' + el.textContent.trim().slice(0, 30) + '"';
        if (!el.classList.contains('pad') && (r.right > p.right - 60 || r.left < p.left + 60)) out.push('too close to the edge: ' + label);
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== 'inline') out.push('overflows: ' + label);
      });
      document.querySelectorAll('img').forEach(i => { if (!i.naturalWidth) out.push('missing image ' + i.getAttribute('src')); });
      return [...new Set(out)];
    });
    const opts = { path: path.join(outDir, out) };
    if (out.endsWith('.jpg')) { opts.type = 'jpeg'; opts.quality = 92; }
    await page.locator('#poster').screenshot(opts);
    console.log(out + (problems.length ? '\n  ' + problems.join('\n  ') : ''));
    await ctx.close();
  }
  await browser.close();
})();
