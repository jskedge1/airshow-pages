// node shoot3.mjs m|d page... : scroll a normal window down the page, one screenful at a time, and stitch
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { execFileSync } from 'child_process';
import fs from 'fs';
const [tag, ...PAGES] = process.argv.slice(2);
const [w, h, dpr] = tag === 'm' ? [430, 900, 2] : [1440, 900, 1];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
for (const pg of PAGES) {
  const p = await ctx.newPage();
  try { await p.goto('https://jskedge1.github.io/airshow-pages/' + pg + '.html', { waitUntil: 'networkidle', timeout: 45000 }); } catch (e) {}
  // hide the height helper and any fixed or sticky bars so they don't repeat in every screenful
  await p.addStyleTag({ content: '#pageHeight{display:none!important}' });
  await p.waitForTimeout(1500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const parts = [];
  for (let y = 0, k = 0; y < H; y += h, k++) {
    await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(1100);
    if (k === 1) await p.evaluate(() => document.querySelectorAll('*').forEach(e => { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; }));
    const real = await p.evaluate(() => scrollY);
    const f = `shots/_v${k}.png`; await p.screenshot({ path: f });
    parts.push([f, y - real]); // when the last screenful can't scroll fully, crop its top
  }
  const ins = parts.flatMap(([f]) => ['-i', f]);
  const crops = parts.map(([, off], i) => `[${i}]crop=iw:ih-${(off) * dpr}:0:${off * dpr}[c${i}]`).join(';');
  if (parts.length === 1) fs.copyFileSync(parts[0][0], `shots/${tag}-${pg}.png`); else execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', crops + ';' + parts.map((_, i) => `[c${i}]`).join('') + `vstack=inputs=${parts.length}`, `shots/${tag}-${pg}.png`]);
  parts.forEach(([f]) => fs.unlinkSync(f));
  console.log(tag, pg, H, parts.length);
  await p.close();
}
await b.close();
