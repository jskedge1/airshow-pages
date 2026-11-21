// Renders poster HTML to a 2480 x 3508 PNG and an A2 vector PDF.
// usage: node build/render.js 01-runway-27.html [more.html ...] [--png-only] [--scale=2]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const args = process.argv.slice(2);
  const files = args.filter(a => !a.startsWith('--'));
  const pngOnly = args.includes('--png-only');
  const scaleArg = args.find(a => a.startsWith('--scale='));
  const dsf = scaleArg ? +scaleArg.split('=')[1] : 2;
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  for (const f of files) {
    const file = path.resolve(f);
    const name = path.basename(file, '.html');
    const ctx = await browser.newContext({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: dsf });
    const page = await ctx.newPage();
    page.on('requestfailed', r => console.log('  request failed:', r.url().slice(0, 90)));
    page.on('console', m => { if (m.type() === 'error') console.log('  console error:', m.text().slice(0, 160)); });
    await page.goto('file://' + file, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const missing = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('.slide *').forEach(el => {
        const cs = getComputedStyle(el);
        const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        const spec = `${cs.fontStyle} ${cs.fontWeight} 20px "${fam}"`;
        if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !document.fonts.check(spec)) bad.push(spec);
      });
      return [...new Set(bad)];
    });
    if (missing.length) console.log('  fonts not loaded:', missing.join(' | '));
    const png = path.join(root, 'png', name + '.png');
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 1240, height: 1754 } });
    console.log('png', png, (fs.statSync(png).size / 1e6).toFixed(2) + ' MB');
    if (!pngOnly) {
      const pdf = path.join(root, 'pdf', name + '.pdf');
      await page.emulateMedia({ media: 'screen' });
      await page.pdf({ path: pdf, width: '420mm', height: '594.1mm', scale: 420 / (1240 * 25.4 / 96), printBackground: true, pageRanges: '1', margin: { top: 0, right: 0, bottom: 0, left: 0 } });
      console.log('pdf', pdf, (fs.statSync(pdf).size / 1e6).toFixed(2) + ' MB');
    }
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
