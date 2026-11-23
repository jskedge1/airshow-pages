// One-off helper for poster 03 (the UK Airshow Chart).
// Pulls detailed coastlines from Natural Earth 1:10m (public domain), as packaged in the
// npm module world-atlas, for the lands the chart shows: the UK, Ireland, the Isle of Man,
// Jersey, Guernsey, and the nearby coasts of France, Belgium and the Netherlands.
// The site's own map (airshow-map.html) uses the 1:50m version of the same data; the
// poster is printed much larger, so it uses the finer one.
// usage (in a folder where `npm install world-atlas topojson-client` has been run):
//   node extract_chart_land.js > data/chart_land.json
const t = require('topojson-client');
const w = require('world-atlas/countries-10m.json');
const fc = t.feature(w, w.objects.countries);
const BOX = { w: -10.6, e: 6.2, s: 48.2, n: 60.2 };
const K = Math.cos(54.5 * Math.PI / 180);
const groups = { uk: ['United Kingdom'], ie: ['Ireland'], dep: ['Isle of Man', 'Jersey', 'Guernsey'], ctx: ['France', 'Belgium', 'Netherlands'] };
function clip(ring) { // Sutherland-Hodgman against BOX
  const edges = [
    [p => p[0] >= BOX.w, (a, b) => [BOX.w, a[1] + (b[1] - a[1]) * (BOX.w - a[0]) / (b[0] - a[0])]],
    [p => p[0] <= BOX.e, (a, b) => [BOX.e, a[1] + (b[1] - a[1]) * (BOX.e - a[0]) / (b[0] - a[0])]],
    [p => p[1] >= BOX.s, (a, b) => [a[0] + (b[0] - a[0]) * (BOX.s - a[1]) / (b[1] - a[1]), BOX.s]],
    [p => p[1] <= BOX.n, (a, b) => [a[0] + (b[0] - a[0]) * (BOX.n - a[1]) / (b[1] - a[1]), BOX.n]],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length];
      const ia = inside(a), ib = inside(b);
      if (ia && ib) out.push(b);
      else if (ia && !ib) out.push(cut(a, b));
      else if (!ia && ib) { out.push(cut(a, b)); out.push(b); }
    }
    if (!out.length) return [];
  }
  return out;
}
function simplify(pts, tol) { // Douglas-Peucker in chart space (degrees of latitude)
  if (pts.length < 5) return pts;
  const P = pts.map(p => [p[0] * K, p[1]]);
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let md = 0, mi = -1;
    const ax = P[a][0], ay = P[a][1], bx = P[b][0], by = P[b][1];
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      let d;
      if (L === 0) d = Math.hypot(P[i][0] - ax, P[i][1] - ay);
      else { const u = Math.max(0, Math.min(1, ((P[i][0] - ax) * dx + (P[i][1] - ay) * dy) / L)); d = Math.hypot(P[i][0] - ax - u * dx, P[i][1] - ay - u * dy); }
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol && mi > 0) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const out = {};
for (const [key, names] of Object.entries(groups)) {
  out[key] = [];
  for (const n of names) {
    const g = fc.features.find(f => f.properties.name === n);
    const polys = g.geometry.type === 'Polygon' ? [g.geometry.coordinates] : g.geometry.coordinates;
    for (const poly of polys) {
      const ring = poly[0];
      const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
      if (Math.max(...xs) < BOX.w || Math.min(...xs) > BOX.e || Math.max(...ys) < BOX.s || Math.min(...ys) > BOX.n) continue;
      let r = clip(ring.slice(0, -1));
      if (r.length < 3) continue;
      r = simplify(r.concat([r[0]]), 0.0009).slice(0, -1);
      if (r.length < 3) continue;
      out[key].push(r.map(p => [Math.round(p[0] * 1e4) / 1e4, Math.round(p[1] * 1e4) / 1e4]));
    }
  }
}
process.stdout.write(JSON.stringify(out));
