/* Makes travel.css for the RIAT Getting there section (Jack, 22 Nov 2026).

   The feature pages draw their Getting there look with many shared scripts. The RIAT page is built
   differently, so this takes the look straight from Clacton: it opens camping-layout/clacton.html, clicks
   through every topic and tab, keeps every style rule that Clacton's Getting there uses, scopes each rule to
   #travel, then opens the built RIAT page and keeps only the rules RIAT's section uses.

   Run from the repo root, after build.py:  node previews/big-guide-to-riat-src/make_travel_css.js
   then run build.py again (and golive.py). Needs Playwright (pre-installed here). */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'travel.css');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/airshow-pages\//, '/'));
      fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
    }).listen(0, () => res(s));
  });
}

/* in the page: every style rule (with its @media) whose selector matches something inside #travel */
function collect(onlyId) {
  const root = document.getElementById('travel');
  const strip = s => s.replace(/::?(hover|focus-visible|focus-within|focus|active|before|after|placeholder|first-letter|first-line|marker|-webkit-[a-z-]+)\b/g, '');
  const test = sel => sel.split(/,(?![^(]*\))/).some(p => {
    const q = strip(p).trim(); if (!q) return false;
    if (/^(html|body|:root|\*)$/.test(q)) return true;
    try { return root.matches(q) || !!root.querySelector(q); } catch (e) { return false; }
  });
  window.__used = window.__used || new Map();
  let order = 0;
  function walk(rules, wrap) {
    for (const r of rules) {
      order++;
      if (r.type === 1) { if (test(r.selectorText)) window.__used.set(wrap + r.cssText, order); }
      else if (r.type === 4) walk(r.cssRules, wrap + '@media ' + r.conditionText + '{');
      else if (r.type === 12) walk(r.cssRules, wrap + '@supports ' + r.conditionText + '{');
      else if (r.type === 7 && !onlyId) window.__used.set(r.cssText, order);
    }
  }
  for (const ss of document.styleSheets) {
    if (onlyId && !(ss.ownerNode && ss.ownerNode.id === onlyId)) continue;
    try { walk(ss.cssRules, ''); } catch (e) {}
  }
  return window.__used.size;
}

function finish() {
  return [...window.__used.entries()].sort((a, b) => a[1] - b[1]).map(([t]) => t + '}'.repeat((t.match(/^(@(media|supports)[^{]*\{)+/) || [''])[0].split('{').length - 1)).join('\n');
}

/* scope a rule to #travel: html, body and :root become #travel, other selectors are put inside it */
function scope(rule) {
  const m = rule.match(/^((?:@(?:media|supports)[^{]*\{)*)(.*)$/s);
  const wrap = m[1], rest = m[2];
  if (/^@keyframes/.test(rest)) return rule;
  const i = rest.indexOf('{');
  const sel = rest.slice(0, i), body = rest.slice(i);
  const parts = sel.split(/,(?![^(]*\))/).map(p => {
    p = p.trim();
    if (/^(html|body|:root)$/.test(p)) return '#travel';
    const lead = (p.match(/^((?:html|body)\s+)+/) || [''])[0];  // keep html and body, so the rule keeps its weight
    const rest = p.slice(lead.length);
    if (/#travel\b/.test(rest)) return lead + rest.replace(/^.*?(#travel)/, '$1');
    return lead + '#travel ' + rest;
  });
  return wrap + [...new Set(parts)].join(',') + body;
}

(async () => {
  const srv = await serve();
  const base = 'http://localhost:' + srv.address().port + '/airshow-pages/';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(base + 'camping-layout/clacton.html#travel', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(5000);
  await p.evaluate(collect, null);
  const ids = await p.$$eval('#parkList button', bs => bs.map(x => x.dataset.id));
  for (const id of ids) {
    await p.evaluate(id => document.querySelector('#parkList button[data-id="' + id + '"]').click(), id);
    await p.waitForTimeout(600);
    await p.evaluate(collect, null);
  }
  for (const w of [900, 640, 390]) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(300); await p.evaluate(collect, null); }
  /* phones: a way in opens as its own page */
  await p.evaluate(() => document.querySelector('#explore .xd-flag').click()); await p.waitForTimeout(500); await p.evaluate(collect, null);
  await p.evaluate(() => { const b = document.querySelector('#explore .xd-back'); if (b) b.click(); });
  await p.evaluate(() => document.querySelectorAll('.pbx-tab,#mfBox .mf-tabs button').forEach(x => x.click()));
  await p.evaluate(collect, null);
  const all = (await p.evaluate(finish)).split('\n').map(scope).join('\n');

  /* keep only what RIAT's section uses */
  const r = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await r.route('**/travel-full.css', rt => rt.fulfill({ contentType: 'text/css', body: all }));
  await r.goto(base + 'previews/big-guide-to-riat/getting-there.html', { waitUntil: 'load' });
  await r.evaluate(() => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'travel-full.css'; l.id = 'tf'; document.head.appendChild(l); });
  await r.waitForTimeout(800);
  await r.evaluate(() => { const s = document.createElement('style'); s.id = 'tf2'; s.textContent = [...document.getElementById('tf').sheet.cssRules].map(x => x.cssText).join('\n'); document.head.appendChild(s); document.getElementById('tf').remove(); });
  const states = async () => {
    await r.evaluate(collect, 'tf2');
    const n = await r.$$eval('#explore .xd-flag', f => f.length);
    for (let i = 0; i < n; i++) {
      await r.evaluate(i => document.querySelectorAll('#explore .xd-flag')[i].click(), i);
      await r.waitForTimeout(100); await r.evaluate(collect, 'tf2');
      const stops = await r.$$eval('#explore .xd-page:not([hidden]) .xd-hstop', s => s.length);
      for (let j = 0; j < stops; j++) { await r.evaluate(j => document.querySelectorAll('#explore .xd-page:not([hidden]) .xd-hstop')[j].click(), j); await r.evaluate(collect, 'tf2'); }
    }
    await r.evaluate(() => { const b = document.querySelector('#explore .xd-page:not([hidden]) .xd-back'); if (b) b.click(); });
    await r.evaluate(() => document.querySelectorAll('.pbx-tab,#mfBox .mf-tabs button').forEach(x => x.click()));
    await r.evaluate(collect, 'tf2');
  };
  for (const w of [1280, 900, 640, 390]) { await r.setViewportSize({ width: w, height: 900 }); await r.waitForTimeout(200); await states(); }
  const used = await r.evaluate(finish);
  const keys = (await p.evaluate(finish)).split('\n').filter(x => /^@keyframes/.test(x)).join('\n');
  fs.writeFileSync(OUT, '/* Made by make_travel_css.js from Clacton\'s Getting there. Do not edit by hand. */\n' + used + '\n' + keys + '\n');
  console.log('travel.css written,', used.split('\n').length, 'rules');
  await b.close(); srv.close();
})();
