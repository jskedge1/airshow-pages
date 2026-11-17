// Fill the working hub demo like a member (save RIAT and Eastbourne), show it as the example member Alex,
// hide the preview banner, then capture each tab in a tall window. node hubcap.mjs
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 3300 } });
await p.goto('https://jskedge1.github.io/airshow-pages/previews/hub-login-demo.html?start=in', { waitUntil: 'networkidle', timeout: 60000 }).catch(e => 0);
await p.waitForTimeout(2500);
const tidy = async () => p.evaluate(() => {
  const s = document.getElementById('demoBar'); if (s) s.style.display = 'none';
  document.querySelectorAll('[class*=toast],[id*=toast]').forEach(e => e.style.display = 'none');
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) { const v = n.nodeValue; const r = v.replace(/Jack Skedge/g, 'Alex').replace(/\s*\bSKEDGE\b/g, '').replace(/\s*\bSkedge\b/g, '').replace(/\bJACK SKEDGE\b/g, 'ALEX').replace(/\bJack\b/g, 'Alex').replace(/\bJACK\b/g, 'ALEX').replace(/^\s*JS\s*$/, 'A'); if (r !== v) n.nodeValue = r; }
  // keep Southport out of shot (labels on the radar, runway and lists)
  document.querySelectorAll('body *').forEach(e => { if (e.children.length === 0 && /^\s*Southport\s*$/.test(e.textContent)) e.style.visibility = 'hidden'; });
  document.querySelectorAll('input').forEach(i => { if (/Jack/.test(i.value)) i.value = i.value.replace(/Jack Skedge|Jack/g, 'Alex'); });
});
const tab = async t => { await p.getByRole('button', { name: new RegExp('^\s*' + t) }).first().click(); await p.waitForTimeout(3500); await tidy(); await p.waitForTimeout(300); };
await tab('My Trips');
for (const v of ['riat', 'eastbourne']) { await p.selectOption('#addShow', v); await p.waitForTimeout(300); await p.getByRole('button', { name: /Add to my trips/i }).first().click(); await p.waitForTimeout(1200); }
await tab('My Trips');
// tick a couple of to dos, pick a packing list and tick some items, log two past shows, start a group
const tickIn = async n => p.evaluate(n => { const bx = [...document.querySelectorAll('input[type=checkbox],[role=checkbox]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top > 450; }); bx.slice(0, n).forEach(e => e.click()); return bx.length; }, n);
console.log('trip boxes', await tickIn(2));
await tab('Kit And Packing'); await p.getByRole('button', { name: /^\s*Day Visitor/ }).first().click().catch(() => 0); await p.waitForTimeout(600); console.log('kit boxes', await tickIn(5));
await tab('My Airshow History');
for (const [show, yr] of [['Duxford', '2026'], ['RIAT Fairford', '2025']]) { await p.fill('#pShow', show); await p.fill('#pYear', yr); await p.getByRole('button', { name: /Log show/i }).first().click(); await p.waitForTimeout(700); }
await tab('My Group'); await p.click('#gCreate').catch(() => 0); await p.waitForTimeout(900);
const tabs = ['Overview', 'Flight Briefing', 'My Trips', 'Show Day', 'Updates', 'Community', 'Kit And Packing', 'My Group', 'My Hangar', 'Saved Tools', 'My Airshow History', 'My Airshow Year', 'My Posts'];
for (const [i, t] of tabs.entries()) {
  await tab(t);
  const H = await p.evaluate(() => Math.max(...[...document.querySelectorAll('body *')].map(e => e.getBoundingClientRect().bottom + scrollY)));
  await p.screenshot({ path: `hub/full${String(i).padStart(2, '0')}.png` });
  console.log(i, t, Math.round(H));
}
// the logged out welcome screen, for the joining chapter
const q = await b.newPage({ viewport: { width: 1440, height: 1500 } });
await q.goto('https://jskedge1.github.io/airshow-pages/previews/hub-login-demo.html?start=out', { waitUntil: 'networkidle', timeout: 60000 }).catch(e => 0);
await q.waitForTimeout(9000); await q.evaluate(() => { const s = document.getElementById('demoBar'); if (s) s.style.display = 'none'; });
await q.screenshot({ path: 'hub/loggedout.png' });
await b.close();
