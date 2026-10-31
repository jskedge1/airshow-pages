/* Reads the Getting there topics out of every featured show page (camping-layout/<show>.html)
   and prints them as JSON. Used by build.py. Usage: node extract.js <repo root> */
const fs = require('fs');
const path = require('path');
const root = process.argv[2] || '.';
const shows = ['riat', 'cosford', 'midlands', 'eastbourne', 'clacton', 'wales', 'duxford', 'shuttleworth', 'gransden', 'southport', 'blackpool', 'ayr'];

function matchEnd(h, i) {
  let depth = 0, inStr = null, esc = false;
  for (let j = i; j < h.length; j++) {
    const c = h[j];
    if (inStr) { if (esc) { esc = false; continue; } if (c === '\\') { esc = true; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { depth--; if (depth === 0) return j; }
  }
  return -1;
}
/* anything the topic list refers to that isn't defined in the page's getting there block reads as blank */
const blanks = new Proxy({}, {
  has: (t, k) => typeof k === 'string' && !(k in globalThis),
  get: (t, k) => { if (k === Symbol.unscopables) return undefined; const f = function () { return ''; }; f[0] = ''; f[1] = ''; return f; }
});

const out = {};
for (const s of shows) {
  const h = fs.readFileSync(path.join(root, 'camping-layout', s + '.html'), 'utf8');
  const at = h.search(/var topics\s*=\s*\[/);
  if (at < 0) continue;
  const i = h.indexOf('[', at), j = matchEnd(h, i);
  let pre = h.slice(Math.max(0, at - 8000), at);
  const k = pre.search(/getting there/i);
  if (k >= 0) pre = pre.slice(k);
  pre = pre.replace(/^[^\n]*\n/, '');
  const list = h.slice(i, j + 1);
  try { out[s] = new Function('P', 'with(P){' + pre + '\nreturn ' + list + ';}')(blanks); }
  catch (e) {
    try { out[s] = new Function('P', 'with(P){return ' + list + ';}')(blanks); }
    catch (e2) { process.stderr.write('Could not read ' + s + ': ' + e2.message + '\n'); }
  }
}
process.stdout.write(JSON.stringify(out));
