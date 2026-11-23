// Builds the Adobe Express edition of the posters.
// Each poster becomes one flattened artwork image (everything not marked data-live) with the
// data-live text laid over it as plain, absolutely positioned text. Text styles are written as
// class rules with longhand font properties, which is what the Express HTML importer reads.
// Output canvas is 2480 x 3508 (the 1240 x 1754 master x 2).
//
// usage: node build/flatten.js 01-runway-27.html [more.html ...] [--out=dir] [--combine=name] [--ghost] [--jpeg] [--max-png=3.5]
//   --combine=name  also writes one multi page file name.express.html holding every poster as a page
//   --ghost         calibration: leaves a magenta copy of the live text in the artwork
//
// Calibration (measured against Express renditions, Nov 2026): glyph widths and alignment match
// Chromium exactly; Express does not add half leading above the first line, so each block is moved
// down by (0.5 x line-height - 0.458) x font-size. IBM Plex Mono weights map one step light, so they
// are sent one step heavier.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const K = 2;
(async () => {
  const args = process.argv.slice(2);
  const files = args.filter(a => !a.startsWith('--'));
  const opt = n => { const a = args.find(a => a.startsWith('--' + n + '=')); return a ? a.split('=')[1] : null; };
  const outDir = path.resolve(opt('out') || path.join(__dirname, '..', 'express'));
  const combine = opt('combine');
  const ghost = args.includes('--ghost');
  const jpeg = args.includes('--jpeg');
  const maxPng = +(opt('max-png') || 3.5);
  fs.mkdirSync(outDir, { recursive: true });
  const W = 1240 * K, H = 1754 * K;
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const pages = [];
  for (const f of files) {
    const file = path.resolve(f);
    const name = path.basename(file, '.html');
    const prefix = 'p' + name.slice(0, 2).replace(/\W/g, 'x');
    const ctx = await browser.newContext({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: K });
    const page = await ctx.newPage();
    await page.goto('file://' + file, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const data = await page.evaluate(({ K, prefix }) => {
      const slide = document.querySelector('.slide');
      const fontLinks = [...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.href).filter(h => /typekit/.test(h));
      const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const px = v => Math.round(v * K * 100) / 100;
      const hex = c => { const m = c.match(/[\d.]+/g).map(Number); return '#' + m.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(); };
      const fam = f => f.split(',')[0].replace(/["']/g, '').trim();
      const weight = (family, w) => (family === 'ibm-plex-mono' && +w >= 500 && +w < 900) ? String(+w + 100) : w;
      const items = [], css = [];
      let spanCount = 0;
      slide.querySelectorAll('[data-live]').forEach(el => {
        const cs = getComputedStyle(el);
        const id = prefix + 't' + (items.length + 1);
        // layout box, without the element's own transform
        let x = 0, y = 0, n = el;
        while (n && n !== slide) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
        let rot = 0;
        if (cs.transform && cs.transform !== 'none') {
          const m = cs.transform.match(/matrix\(([^)]+)\)/);
          if (m) { const p = m[1].split(',').map(Number); rot = Math.round(Math.atan2(p[1], p[0]) * 18000 / Math.PI) / 100; }
        }
        const base = { color: cs.color, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle, fontFamily: fam(cs.fontFamily), fontSize: cs.fontSize };
        const walk = (node, inherited) => {
          let out = '';
          node.childNodes.forEach(ch => {
            if (ch.nodeType === 3) {
              let t = ch.textContent.replace(/\s+/g, ' ');
              if (getComputedStyle(ch.parentElement).textTransform === 'uppercase') t = t.toUpperCase();
              out += esc(t);
            } else if (ch.nodeType === 1) {
              if (ch.tagName === 'BR') { out += '<br>'; return; }
              const c = getComputedStyle(ch);
              const st = [];
              if (c.color !== inherited.color) st.push('color:' + hex(c.color));
              if (c.fontWeight !== inherited.fontWeight) st.push('font-weight:' + weight(fam(c.fontFamily), c.fontWeight));
              if (c.fontStyle !== inherited.fontStyle) st.push('font-style:' + c.fontStyle);
              if (fam(c.fontFamily) !== inherited.fontFamily) st.push('font-family:"' + fam(c.fontFamily) + '",sans-serif');
              if (c.fontSize !== inherited.fontSize) st.push('font-size:' + px(parseFloat(c.fontSize)) + 'px');
              const inner = walk(ch, { color: c.color, fontWeight: c.fontWeight, fontStyle: c.fontStyle, fontFamily: fam(c.fontFamily), fontSize: c.fontSize });
              if (st.length) { const sid = id + 's' + (++spanCount); css.push('.' + sid + '{' + st.join(';') + '}'); out += '<span class="' + sid + '">' + inner + '</span>'; }
              else out += inner;
            }
          });
          return out;
        };
        const html = walk(el, base).replace(/^\s+|\s+$/g, '').replace(/\s*<br>\s*/g, '<br>');
        const size = parseFloat(cs.fontSize);
        const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / size;
        const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
        // explicit box: Express anchors text by its box, so right and centred text need the measured width;
        // a little slack on the free side keeps Express from wrapping if a line comes out a hair wider
        const ta = cs.textAlign === 'start' ? 'left' : cs.textAlign;
        const w = el.offsetWidth, slack = Math.ceil(w * 0.03) + 4;
        const bx = ta === 'right' ? x - slack : ta === 'center' ? x - slack / 2 : x;
        const by = y + (rot ? 0 : (0.5 * lh - 0.458) * size);       // first line calibration, see header
        const st = [
          'position:absolute', 'left:' + px(bx) + 'px', 'top:' + px(by) + 'px', 'width:' + px(w + slack) + 'px', 'margin:0', 'white-space:nowrap',
          'font-family:"' + base.fontFamily + '",sans-serif', 'font-size:' + px(size) + 'px', 'font-weight:' + weight(base.fontFamily, cs.fontWeight),
          'font-style:' + cs.fontStyle, 'line-height:' + (Math.round(lh * 1000) / 1000),
          'letter-spacing:' + px(ls) + 'px', 'color:' + hex(cs.color), 'text-align:' + ta,
        ];
        if (parseFloat(cs.opacity) < 1) st.push('opacity:' + cs.opacity);
        if (rot) st.push('transform:rotate(' + rot + 'deg)', 'transform-origin:' + cs.transformOrigin.split(' ').map(v => px(parseFloat(v)) + 'px').join(' '));
        css.push('.' + id + '{' + st.join(';') + '}');
        items.push('<div class="' + id + '">' + html + '</div>');
      });
      return { items, css, fontLinks, title: document.title };
    }, { K, prefix });
    // artwork layer: live text hidden (or left as a magenta ghost for calibration)
    await page.addStyleTag({ content: ghost ? '[data-live],[data-live] *{color:rgba(255,0,200,.55)!important}' : '[data-live]{visibility:hidden!important}' });
    // PNG keeps flat colour crisp; artwork with grain or soft shading makes a very large PNG, so above
    // maxPng megabytes (default 3.5) it is saved as a high quality JPEG instead
    const clip = { x: 0, y: 0, width: 1240, height: 1754 };
    let artPath = path.join(outDir, name + '-art.png'), asJpeg = jpeg;
    if (!asJpeg) { await page.screenshot({ path: artPath, clip }); asJpeg = fs.statSync(artPath).size > maxPng * 1e6; }
    if (asJpeg) { artPath = path.join(outDir, name + '-art.jpg'); await page.screenshot({ path: artPath, clip, type: 'jpeg', quality: 94 }); }
    const b64 = fs.readFileSync(artPath).toString('base64');
    const body = '<div class="slide" data-canvas-width="' + W + '" data-canvas-height="' + H + '">\n' +
      '<img alt="" class="artwork" src="data:image/' + (asJpeg ? 'jpeg' : 'png') + ';base64,' + b64 + '">\n' + data.items.join('\n') + '\n</div>';
    pages.push({ name, data, body });
    const out = path.join(outDir, name + '.express.html');
    fs.writeFileSync(out, doc(data.title, data.fontLinks, data.css, [body]));
    console.log(name, '| live text blocks:', data.items.length, '| art', (fs.statSync(artPath).size / 1e6).toFixed(2), 'MB | html', (fs.statSync(out).size / 1e6).toFixed(2), 'MB');
    await ctx.close();
  }
  if (combine && pages.length) {
    const links = [...new Set(pages.flatMap(p => p.data.fontLinks))];
    const out = path.join(outDir, combine + '.express.html');
    fs.writeFileSync(out, doc('UK Airshow Guide poster series', links, pages.flatMap(p => p.data.css), pages.map(p => p.body)));
    console.log('combined', pages.length, 'pages ->', out, (fs.statSync(out).size / 1e6).toFixed(2), 'MB');
  }
  await browser.close();

  function doc(title, links, css, bodies) {
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n' +
      '<meta name="hz:slide-selector" content=".slide">\n<meta name="hz:canvas-width" content="' + W + '">\n<meta name="hz:canvas-height" content="' + H + '">\n' +
      '<title>' + title.replace(/</g, '&lt;') + '</title>\n' + links.map(h => '<link rel="stylesheet" href="' + h + '">').join('\n') + '\n<style>\n' +
      'html,body{margin:0;padding:0}\n.slide{position:relative;width:' + W + 'px;height:' + H + 'px;overflow:hidden;background:#ffffff}\n' +
      '.artwork{position:absolute;left:0px;top:0px;width:' + W + 'px;height:' + H + 'px}\n' + css.join('\n') + '\n</style>\n</head>\n<body>\n' + bodies.join('\n') + '\n</body></html>\n';
  }
})().catch(e => { console.error(e); process.exit(1); });
