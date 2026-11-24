
// ================================================================ shared pieces
// Section header bar: coloured block + tag + title. Lands on beat b.
function header(ctx, u, b, tag, title, bg, fg, tagBg = '#FFFFFF', tagFg = C.navy) {
  const k = springU(u, b - 0.6, SPRING.snappy);
  const y = pick({ '16x9': 60, '9x16': 250 }), h = pick({ '16x9': 120, '9x16': 190 });
  ctx.save(); ctx.translate(0, -(1 - k) * (h + y + 20));
  ctx.fillStyle = bg; ctx.fillRect(0, y, W, h);
  const ty = P ? y + 64 : y + h / 2;
  const pw = T.pill(ctx, tag, S.x, ty, pick({ '16x9': 30, '9x16': 32 }), tagBg, tagFg);
  if (P) T.lines(ctx, title, S.x, y + 150, fd(58), fg, S.w, 60);
  else M.text(ctx, title, S.x + pw + 28, ty + 24, fd(title.length > 40 ? 58 : 68), fg);
  ctx.restore();
}
function caption(ctx, u, b, num, title, body, edge, x, y, w, h) {
  T.card(ctx, x, y, w, h, { edge, edgeH: 12 });
  const tk = E.outCubic(prog(u, b, b + 0.6));
  ctx.save(); ctx.beginPath(); ctx.rect(x, y + 12, w, h - 12); ctx.clip();
  ctx.globalAlpha = tk; ctx.translate(0, (1 - tk) * 50);
  let tx = x + 36;
  if (num) { T.sq(ctx, x + 70, y + h / 2, 34, C.navy); M.text(ctx, String(num), x + 70, y + h / 2 + 15, fd(46), '#FFF', 'center'); tx = x + 130; }
  const tw = w - (tx - x) - 30;
  const tf = fd(pick({ '16x9': 60, '9x16': 54 })), bf = fu(pick({ '16x9': 36, '9x16': 34 }), 600);
  const nt = T.wrap(ctx, title, tf, tw).length, nb = T.wrap(ctx, body, bf, tw).length;
  const lh1 = pick({ '16x9': 62, '9x16': 56 }), lh2 = pick({ '16x9': 46, '9x16': 44 });
  const total = nt * lh1 + nb * lh2 + 8;
  const top = y + 12 + (h - 12 - total) / 2 + lh1 * 0.78;
  T.lines(ctx, title, tx, top, tf, C.navy, tw, lh1);
  T.lines(ctx, body, tx, top + nt * lh1 + 4, bf, C.body, tw, lh2);
  ctx.restore();
}
function tickBox(ctx, x, y, r, col, good = true) { T.sq(ctx, x, y, r, col); (good ? T.tick : T.cross)(ctx, x, y, r); }

// ================================================================ 1. the map
// A simplified outline of England and Wales (lon, lat), drawn as land on a sea background.
const GB = [[1.33, 51.13], [0.97, 50.92], [0.58, 50.85], [0.29, 50.76], [-0.14, 50.82], [-0.79, 50.73], [-1.09, 50.78], [-1.4, 50.82], [-1.88, 50.71],
  [-2.45, 50.58], [-2.94, 50.72], [-3.4, 50.62], [-3.64, 50.22], [-4.14, 50.36], [-5.2, 49.96], [-5.71, 50.07], [-5.48, 50.21], [-5.08, 50.42],
  [-4.53, 51.02], [-3.47, 51.21], [-2.98, 51.35], [-2.7, 51.5], [-2.45, 51.7], [-2.67, 51.64], [-2.98, 51.55], [-3.17, 51.46], [-3.27, 51.39],
  [-3.7, 51.48], [-3.94, 51.6], [-4.0, 51.56], [-4.3, 51.56], [-4.16, 51.68], [-4.7, 51.67], [-5.3, 51.88], [-4.98, 52.0], [-4.66, 52.12],
  [-4.08, 52.41], [-4.05, 52.72], [-4.41, 52.89], [-4.79, 52.78], [-4.62, 52.94], [-4.3, 53.12], [-4.63, 53.3], [-4.34, 53.42], [-3.83, 53.33],
  [-3.49, 53.32], [-3.1, 53.25], [-3.12, 53.4], [-3.0, 53.45], [-3.05, 53.65], [-2.96, 53.74], [-3.06, 53.82], [-3.03, 53.93], [-2.87, 54.07],
  [-3.23, 54.11], [-3.64, 54.49], [-3.55, 54.66], [-3.1, 54.95], [-3.6, 54.98], [-4.86, 54.64], [-5.15, 55.0], [-5.3, 55.8], [-2.0, 55.77],
  [-1.6, 55.6], [-1.43, 55.0], [-1.2, 54.69], [-0.61, 54.49], [-0.4, 54.28], [-0.08, 54.12], [-0.19, 54.08], [0.11, 53.58], [-0.33, 53.72],
  [-0.07, 53.57], [0.34, 53.14], [-0.02, 52.97], [0.4, 52.78], [0.49, 52.94], [1.3, 52.93], [1.73, 52.6], [1.75, 52.47], [1.68, 52.32],
  [1.35, 51.96], [1.29, 51.88], [1.18, 51.8], [1.0, 51.78], [0.95, 51.62], [0.71, 51.53], [0.36, 51.47], [0.6, 51.45], [0.76, 51.44],
  [1.02, 51.36], [1.38, 51.39], [1.45, 51.37], [1.42, 51.33], [1.4, 51.22]];
function mapFit(rx, ry, rw, rh) {
  const K = Math.cos(52.5 * Math.PI / 180);
  const xs = R.map.fit.map(([lo]) => lo * K), ys = R.map.fit.map(([, la]) => -la);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const minSpan = R.map.minSpan || 1.2;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let sw = Math.max(x1 - x0, minSpan) * 1.45, sh = Math.max(y1 - y0, minSpan) * 1.45;
  if (sw / sh > rw / rh) sh = sw * rh / rw; else sw = sh * rw / rh;
  return ([lo, la]) => [rx + ((lo * K - cx) / sw + 0.5) * rw, ry + ((-la - cy) / sh + 0.5) * rh];
}
function mapScene(ctx, u) {
  fill(ctx, C.light);
  const [rx, ry, rw, rh] = pick({ '16x9': [860, 110, 964, 900], '9x16': [40, 950, 1000, 560] });
  const mp = mapFit(rx, ry, rw, rh);
  const mk = springU(u, -1.2, SPRING.gentle);
  ctx.save(); ctx.translate(0, (1 - mk) * 80);
  ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip();
  ctx.fillStyle = '#9FD3EA'; ctx.fillRect(rx, ry, rw, rh);
  ctx.fillStyle = '#CFE8B8'; ctx.beginPath(); GB.forEach((p, i) => { const [x, y] = mp(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(19,41,60,0.25)'; ctx.lineWidth = 3; ctx.stroke();
  (R.map.cities || []).forEach((c) => { const [x, y] = mp(c); ctx.fillStyle = 'rgba(19,41,60,0.12)'; ctx.fillRect(x - 28, y - 20, 56, 40); });
  ctx.restore();
  ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(rx, ry, rw, rh);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  R.map.legs.forEach(({ pts, op, a, b, dash }) => {
    const p = E.inOutCubic(prog(u, a, b)); if (p <= 0) return;
    const xy = pts.map(mp);
    const segL = xy.slice(1).map((q, i) => Math.hypot(q[0] - xy[i][0], q[1] - xy[i][1]));
    let left = segL.reduce((s, v) => s + v, 0) * p;
    ctx.save(); ctx.beginPath(); ctx.moveTo(xy[0][0], xy[0][1]);
    for (let i = 0; i < segL.length && left > 0; i++) { const f = Math.min(1, left / segL[i]); ctx.lineTo(lerp(xy[i][0], xy[i + 1][0], f), lerp(xy[i][1], xy[i + 1][1], f)); left -= segL[i]; }
    if (!dash) { ctx.strokeStyle = C.navy; ctx.lineWidth = pick({ '16x9': 24, '9x16': 22 }); ctx.stroke(); }
    ctx.strokeStyle = OPS[op].line || OPS[op].c; ctx.lineWidth = pick({ '16x9': 14, '9x16': 12 }); if (dash) ctx.setLineDash([4, 22]); ctx.stroke(); ctx.restore();
  });
  const fs = pick({ '16x9': 32, '9x16': 30 });
  R.map.places.forEach(({ name, at, b, side = 'right', dy = 0 }) => {
    const kk = T.pop(u, b); const [x, y] = mp(at);
    T.scaled(ctx, kk, x, y, () => {
      ctx.fillStyle = '#FFF'; ctx.fillRect(x - 14, y - 14, 28, 28); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.strokeRect(x - 14, y - 14, 28, 28);
      T.pill(ctx, name, side === 'right' ? x + 28 : x - 28, y + dy, fs, C.navy, '#FFF', side === 'right' ? 'left' : 'right');
    });
  });
  const jk = T.pop(u, R.map.showAt || 9);
  if (jk > 0) {
    const [sx, sy] = mp(R.map.show);
    T.scaled(ctx, jk, sx, sy, () => {
      ctx.fillStyle = C.red; ctx.fillRect(sx - 18, sy - 18, 36, 36); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(sx - 18, sy - 18, 36, 36);
      T.jet(ctx, sx + (R.map.jetSide || 1) * 90 + Math.sin(u * 1.5) * 8, sy + 46, 0.36, (R.map.jetSide || 1) > 0 ? -0.2 + Math.sin(u) * 0.08 : Math.PI + 0.2, { kind: 'hawk' });
    });
  }
  ctx.restore();
  // title block
  const tx = S.x + 10, ty = pick({ '16x9': 330, '9x16': 470 });
  const pk = T.pop(u, 1.5);
  T.scaled(ctx, pk, tx + 100, ty - 170, () => T.pill(ctx, R.pill || 'Plan your airshow trip', tx, ty - pick({ '16x9': 190, '9x16': 175 }), pick({ '16x9': 32, '9x16': 34 }), C.purple, '#FFF'));
  const hs = R.titleSize || 150;
  T.heading(ctx, u, -1.1, R.title[0], tx, ty, hs, C.navy);
  T.heading(ctx, u, -0.8, R.title[1], tx, ty + hs * 0.93, hs, C.navy, C.red, R.accentFrom ?? 1);
  const lk = E.outCubic(prog(u, 2, 2.8));
  if (lk > 0) { ctx.save(); ctx.globalAlpha = lk; T.lines(ctx, R.sub, tx, ty + hs * 1.5 + (1 - lk) * 20, fu(40, 600), C.body, pick({ '16x9': 700, '9x16': 900 }), 52); ctx.restore(); }
  let cx = tx;
  const cy = ty + pick({ '16x9': 380, '9x16': 320 });
  R.chips.forEach(([s, op], i) => {
    const k = T.pop(u, 10 + i * 0.5);
    ctx.font = fu(34, 700); const w = ctx.measureText(s).width + 34 * 1.1;
    const x0 = cx;
    T.scaled(ctx, k, x0 + w / 2, cy, () => T.pill(ctx, s, x0, cy, 34, OPS[op].c, OPS[op].ink || '#FFF'));
    if (i < R.chips.length - 1 && k > 0) { ctx.save(); ctx.globalAlpha = clamp(k); T.arrow(ctx, x0 + w + 22, cy, 26, 0, C.navy); ctx.restore(); }
    cx += w + 44;
  });
  const sk = E.outCubic(prog(u, 12.5, 13.3));
  if (sk > 0) { ctx.save(); ctx.globalAlpha = sk; T.lines(ctx, R.summary, tx, cy + pick({ '16x9': 90, '9x16': 80 }), fu(36, 700), C.navy, pick({ '16x9': 520, '9x16': 900 }), 46); ctx.restore(); }
  if (!P) { const k = springU(u, 1, SPRING.bouncy); T.person(ctx, 720, 1020 + (1 - k) * 300, 0.62, { face: 1, pack: true, hold: 'ticket', armUp: 0.7, blink: blinkAt(u), mouth: u < 4 ? 'open' : 'smile' }); }
}

// ================================================================ 2. before you go
function ticket(ctx, x, y, w, h) {
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x + 8, y + 12, w, h); ctx.restore();
  ctx.fillStyle = '#FFF6DE'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.amber; ctx.fillRect(x, y, w, h * 0.22);
  ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(x, y, w, h);
  M.text(ctx, 'TRAIN TICKET', x + 34, y + h * 0.15, fd(h * 0.1), C.navy);
  const big = (str) => { let s = h * 0.12; ctx.font = fd(s); while (ctx.measureText(str).width > w * 0.7 && s > 20) { s -= 2; ctx.font = fd(s); } return fd(s); };
  M.text(ctx, 'FROM', x + 34, y + h * 0.36, fu(h * 0.06, 700), C.body);
  M.text(ctx, R.ticket.from, x + 34, y + h * 0.48, big(R.ticket.from), C.navy);
  M.text(ctx, 'TO', x + 34, y + h * 0.62, fu(h * 0.06, 700), C.body);
  M.text(ctx, R.ticket.to, x + 34, y + h * 0.74, big(R.ticket.to), C.navy);
  M.text(ctx, R.ticket.route, x + 34, y + h * 0.9, fu(h * 0.065, 700), C.red);
  ctx.setLineDash([10, 10]); ctx.strokeStyle = C.soft; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x + w * 0.78, y + h * 0.28); ctx.lineTo(x + w * 0.78, y + h - 20); ctx.stroke(); ctx.setLineDash([]);
  T.jet(ctx, x + w * 0.89, y + h * 0.62, h / 1100, -1.25, { kind: 'hawk' });
}
function before(ctx, u, sc) {
  fill(ctx, C.light);
  T.heading(ctx, u, sc.a - 0.6, 'BEFORE YOU GO', S.x, pick({ '16x9': 170, '9x16': 360 }), 130, C.navy);
  const k = springU(u, sc.a - 0.6, SPRING.bouncy);
  const tw = pick({ '16x9': 640, '9x16': 720 }), th = 400;
  const tx = pick({ '16x9': S.x, '9x16': (W - 720) / 2 }), ty = pick({ '16x9': 270, '9x16': 430 });
  ctx.save(); ctx.translate(tx + tw / 2, ty + th / 2); ctx.rotate(-0.04 + (1 - k) * 0.3); ctx.scale(Math.max(0.01, k), Math.max(0.01, k)); ctx.translate(-(tx + tw / 2), -(ty + th / 2));
  ticket(ctx, tx, ty, tw, th);
  ctx.restore();
  if (!P) T.person(ctx, 420, 1010, 0.62, { face: 1, pack: true, hold: 'phone', armUp: 1, blink: blinkAt(u) });
  const cols = [C.teal, C.amber, C.purple];
  R.tips.forEach(([title, body], i) => {
    const kk = springU(u, sc.a + 2 + i * 4, SPRING.bouncy);
    if (kk <= 0.001) return;
    const x = pick({ '16x9': 820, '9x16': S.x }), w = pick({ '16x9': 1004, '9x16': S.w }), h = pick({ '16x9': 230, '9x16': 210 });
    const y = pick({ '16x9': 250 + i * 250, '9x16': 870 + i * 225 });
    ctx.save(); ctx.translate((1 - kk) * 400, 0); ctx.globalAlpha = clamp(kk * 1.5);
    T.card(ctx, x, y, w, h, { edge: null });
    ctx.fillStyle = cols[i]; ctx.fillRect(x, y, 16, h);
    tickBox(ctx, x + 76, y + 70, 36, cols[i]);
    M.text(ctx, title, x + 136, y + 88, fd(pick({ '16x9': 56, '9x16': 52 })), C.navy);
    T.lines(ctx, body, x + 136, y + 145, fu(pick({ '16x9': 34, '9x16': 32 }), 600), C.body, w - 170, pick({ '16x9': 44, '9x16': 42 }));
    ctx.restore();
  });
}

// ================================================================ 3. a train leg
function leg(ctx, u, sc) {
  const L = { ...sc.leg, look: OPS[sc.leg.op].look, op: OPS[sc.leg.op] };
  ride(ctx, u, L);
  header(ctx, u, sc.a - 0.4, sc.tag, sc.title, OPS[sc.leg.op].c, OPS[sc.leg.op].ink, OPS[sc.leg.op].ink === '#FFFFFF' ? '#FFFFFF' : OPS[sc.leg.op].ink, OPS[sc.leg.op].ink === '#FFFFFF' ? C.navy : '#FFFFFF');
}

// ================================================================ 4. a change (Tube, platforms, shuttle)
function stationBox(ctx, x, y, w, h) {
  const floorY = y + h * 0.84;
  ctx.fillStyle = '#EEF2F5'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#DCE3E9'; ctx.lineWidth = 2;
  for (let yy = y; yy < floorY; yy += 40) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
  ctx.fillStyle = '#B9C4CD'; ctx.fillRect(x, floorY, w, h);
  return floorY;
}
function changeArt(ctx, u, st, b, x, y, w, h, block) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const floorY = st.kind === 'bus' ? y + h * 0.84 : stationBox(ctx, x, y, w, h);
  const sS = pick({ '16x9': 0.8, '9x16': 0.75 });
  const op = OPS[block.op];
  if (st.kind === 'signs') {
    const k = T.pop(u, b + 1.5);
    ctx.font = fd(64); const sw = Math.min(w * 0.8, ctx.measureText(st.sign).width + 200), sx = x + w * 0.55 - sw / 2, sy = y + 50;
    ctx.fillStyle = '#5C6873'; ctx.fillRect(sx + 40, y, 8, sy - y); ctx.fillRect(sx + sw - 48, y, 8, sy - y);
    T.scaled(ctx, k, sx + sw / 2, sy + 60, () => {
      ctx.fillStyle = C.navy; ctx.fillRect(sx, sy, sw, 120);
      M.text(ctx, st.sign, sx + 40, sy + 82, fd(64), '#FFF');
      T.arrow(ctx, sx + sw - 70, sy + 60, 60, 0, st.arrow || op.c);
    });
    const p = E.inOutSine(prog(u, b + 0.5, b + (st.len || 9)));
    T.person(ctx, lerp(x + 80, x + w - 120, p), floorY + 10, sS, { face: 1, pack: true, walk: 1, phase: u * Math.PI * 1.4, blink: blinkAt(u) });
  }
  if (st.kind === 'gates') {
    const gx = x + w * 0.55;
    const open = E.outBack(prog(u, b + 3.5, b + 4.3));
    for (let g = -1; g <= 1; g++) {
      const cx = gx + g * 230;
      ctx.fillStyle = '#4A5A66'; ctx.fillRect(cx - 120, floorY - 150, 40, 150); ctx.fillRect(cx + 80, floorY - 150, 40, 150);
      ctx.fillStyle = g === 0 ? C.green : '#4A5A66'; ctx.fillRect(cx - 112, floorY - 140, 24, 10);
      ctx.fillStyle = C.red;
      const pw = 70 * (1 - (g === 0 ? open : 0));
      if (pw > 2) { ctx.fillRect(cx - 80, floorY - 110, pw, 60); ctx.fillRect(cx + 80 - pw, floorY - 110, pw, 60); }
    }
    const p = E.inOutCubic(prog(u, b + 0.5, b + 3.3)), p2 = E.inOutCubic(prog(u, b + 4.2, b + 7));
    const sx = lerp(x + 100, gx - 170, p) + p2 * (w * 0.6);
    const walking = (p > 0 && p < 1) || (p2 > 0 && p2 < 1);
    T.person(ctx, sx, floorY + 10, sS, { face: 1, pack: true, walk: walking ? 1 : 0, phase: u * Math.PI * 1.4, hold: 'ticket', armUp: p >= 1 && p2 <= 0 ? 0.8 : 0, blink: blinkAt(u) });
    const bk = bump(u, b + 3.6, 0.6);
    if (bk > 0) { ctx.save(); ctx.globalAlpha = bk; tickBox(ctx, gx - 100, floorY - 200, 34, C.green); ctx.restore(); }
  }
  if (st.kind === 'lines') {
    const k1 = springU(u, b + 2, SPRING.bouncy), k2 = springU(u, b + 4, SPRING.bouncy);
    const sw = Math.min(w - 80, pick({ '16x9': 900, '9x16': 820 })), sx = x + (w - sw) / 2;
    T.scaled(ctx, k1, sx + sw / 2, y + 120, () => {
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx, y + 50, sw, 150); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(sx, y + 50, sw, 150);
      ctx.fillStyle = st.yes.color; ctx.fillRect(sx, y + 50, 40, 150);
      M.text(ctx, st.yes.name, sx + 70, y + 125, fd(70), C.navy);
      M.text(ctx, st.yes.sub, sx + 70, y + 175, fu(32, 700), C.body);
      tickBox(ctx, sx + sw - 70, y + 125, 44, C.green);
    });
    T.scaled(ctx, k2, sx + sw / 2, y + 290, () => {
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx + 60, y + 230, sw - 120, 110); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(sx + 60, y + 230, sw - 120, 110);
      ctx.fillStyle = st.no.color; ctx.fillRect(sx + 60, y + 230, 30, 110);
      M.text(ctx, st.no.name, sx + 115, y + 302, fd(52), C.body);
      tickBox(ctx, sx + sw - 120, y + 285, 36, C.red, false);
    });
    T.person(ctx, x + w * 0.12, floorY + 10, sS * 0.85, { face: 1, pack: true, armUp: prog(u, b + 2.4, b + 3), blink: blinkAt(u) });
  }
  if (st.kind === 'schematic') {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h);
    const stops = st.stops, n = stops.length;
    const hop = (u - (b + 0.5)) / ((st.until - 1.2 - (b + 0.5)) / (n - 1));
    const at = clamp(hop, 0, n - 1);
    const kInt = Math.floor(at), frac = at - kInt;
    const pos = kInt + E.inOutCubic(clamp(frac * 1.6));
    const gap = pick({ '16x9': 260, '9x16': 230 });
    const ly = y + h * 0.58;
    const camX = x + w * 0.42 - pos * gap;
    ctx.strokeStyle = st.color || op.c; ctx.lineWidth = 26; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(camX - 200, ly); ctx.lineTo(camX + (n - 1) * gap + 200, ly); ctx.stroke();
    stops.forEach((s, j) => {
      const sx = camX + j * gap;
      if (sx < x - 300 || sx > x + w + 300) return;
      const end = j === 0 || j === n - 1;
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = C.navy; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(sx, ly, end ? 26 : 16, 0, M.TAU); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(sx, ly + 56); ctx.rotate(0.45);
      M.text(ctx, s, 0, 0, fu(j === n - 1 ? 40 : 32, 700), j === n - 1 ? C.navy : C.body, 'left');
      ctx.restore();
    });
    T.train(ctx, x + w * 0.42 + 190, ly - 34, 0.42, 2, st.train || { body: '#FFFFFF', stripe: '#1D63B7', door: C.red, roof: '#5C6873', tube: true }, u * 2);
    const done = Math.min(n - 1, Math.round(pos));
    T.pill(ctx, done ? `Stop ${done} of ${n - 1}` : `Leaving ${stops[0]}`, x + 30, y + 60, 34, C.navy, '#FFF');
    if (pos >= n - 1.05) { const k = T.pop(u, st.until - 2); T.scaled(ctx, k, x + w - 200, y + 60, () => T.pill(ctx, 'Off here!', x + w - 30, y + 60, 34, C.green, '#FFF', 'right')); }
  }
  if (st.kind === 'board') {
    const bw = Math.min(w - 80, pick({ '16x9': 900, '9x16': 820 })), bx = x + (w - bw) / 2, by = y + 50;
    const k = springU(u, b + 0.6, SPRING.bouncy);
    T.scaled(ctx, k, bx + bw / 2, by + 140, () => {
      ctx.fillStyle = '#111'; ctx.fillRect(bx, by, bw, 270);
      ctx.fillStyle = '#2B2B2B'; ctx.fillRect(bx + 20, by + 20, bw - 40, 4);
      const amber = '#FFB400';
      M.text(ctx, 'Departures', bx + 30, by + 70, fd(44), amber);
      let fsz = 66; ctx.font = fd(fsz); while (ctx.measureText(st.dest + '   ' + st.right).width > bw - 80 && fsz > 40) { fsz -= 2; ctx.font = fd(fsz); }
      M.text(ctx, st.dest, bx + 30, by + 150, fd(fsz), amber);
      M.text(ctx, st.right, bx + bw - 30, by + 150, fd(fsz), amber, 'right');
      M.text(ctx, st.calling, bx + 30, by + 220, fu(30, 600), '#E6A500');
    });
    if (st.clock) { const ck = T.pop(u, b + 2); T.scaled(ctx, ck, x + w * 0.16, floorY - 60, () => { T.clock(ctx, x + w * 0.16, floorY - 60, 64, (u * 12) % 60, C.navy); T.pill(ctx, st.clock, x + w * 0.16, floorY + 44, 32, C.navy, '#FFF', 'center'); }); }
    T.person(ctx, x + w * 0.82, floorY + 10, sS * 0.85, { face: -1, pack: true, armUp: 0.7, blink: blinkAt(u), mouth: 'open' });
  }
  if (st.kind === 'clock') {
    const ck = T.pop(u, b + 0.8);
    T.scaled(ctx, ck, x + w * 0.3, y + h * 0.42, () => T.clock(ctx, x + w * 0.3, y + h * 0.42, pick({ '16x9': 130, '9x16': 120 }), (u * 20) % 60, C.navy));
    (st.labels || []).forEach((t, j) => { const k = T.pop(u, b + 2 + j * 2); T.scaled(ctx, k, x + w * 0.62, y + 110 + j * 100, () => T.pill(ctx, t, x + w * 0.5, y + 110 + j * 100, pick({ '16x9': 40, '9x16': 34 }), [C.navy, op.c, C.red][j % 3], j === 1 ? (op.ink || '#FFF') : '#FFF')); });
    T.person(ctx, x + w * 0.88, floorY + 10, sS * 0.85, { face: -1, pack: true, hold: 'phone', armUp: 1, blink: blinkAt(u) });
  }
  if (st.kind === 'bus') {
    T.sky(ctx, C.skyTop, C.skyLow, y, floorY);
    ctx.fillStyle = '#9AA6B0'; ctx.fillRect(x, floorY, w, h);
    ctx.fillStyle = '#C9D3DA'; ctx.fillRect(x, floorY - 8, w, 16);
    // stop flag
    const fx = x + w * 0.18;
    ctx.fillStyle = '#5C6873'; ctx.fillRect(fx - 5, floorY - 300, 10, 300);
    ctx.fillStyle = C.navy; ctx.fillRect(fx - 90, floorY - 330, 180, 110);
    M.text(ctx, st.stand, fx, floorY - 260, fd(50), '#FFF', 'center');
    // the shuttle pulls in
    const p = E.outCubic(prog(u, b + 1, b + 4)), q = E.inCubic(prog(u, b + (st.leave || 8), b + (st.leave || 8) + 3));
    const bx = lerp(x + w + 700, x + w * 0.88, p) - q * (w + 1200);
    const bw2 = 660, bh = 230, by = floorY - bh - 20;
    ctx.fillStyle = op.c; ctx.fillRect(bx - bw2, by, bw2, bh); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(bx - bw2, by, bw2, bh);
    ctx.fillStyle = '#BFE6F2'; for (let i = 0; i < 5; i++) ctx.fillRect(bx - bw2 + 30 + i * 118, by + 30, 96, 70);
    ctx.fillRect(bx - 70, by + 30, 50, 110);
    ctx.fillStyle = C.navy; ctx.fillRect(bx - bw2, by + 116, bw2, 52);
    M.text(ctx, st.bus, bx - bw2 / 2, by + 154, fd(40), '#FFF', 'center');
    [bx - bw2 + 110, bx - 120].forEach((wx) => { ctx.fillStyle = '#20272E'; ctx.beginPath(); ctx.arc(wx, floorY - 20, 34, 0, M.TAU); ctx.fill(); ctx.fillStyle = '#9AA6B0'; ctx.beginPath(); ctx.arc(wx, floorY - 20, 12, 0, M.TAU); ctx.fill(); });
    if (q <= 0) T.person(ctx, fx + 140, floorY + 10, sS * 0.85, { face: 1, pack: true, armUp: prog(u, b + 4, b + 4.6) * 0.8, blink: blinkAt(u), mouth: u > b + 4 ? 'open' : 'smile' });
    if (st.tag) { const k = T.pop(u, b + 4.5); T.scaled(ctx, k, x + w * 0.62, y + 70, () => T.pill(ctx, st.tag, x + w * 0.62, y + 70, 40, C.green, '#FFF', 'center')); }
  }
  ctx.restore();
}
function change(ctx, u, sc) {
  fill(ctx, C.light);
  const steps = sc.steps, n = steps.length;
  const cur = steps.reduce((a, s, i) => (u >= s.at - (i ? 0.4 : 0) ? i : a), 0);
  const st = steps[cur];
  const ax = S.x, ay = pick({ '16x9': 210, '9x16': 470 }), aw = S.w, ah = pick({ '16x9': 520, '9x16': 620 });
  changeArt(ctx, u, st, st.at, ax, ay, aw, ah, sc);
  ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(ax, ay, aw, ah);
  const dk = pick({ '16x9': [W - S.x - n * 54, 760], '9x16': [S.x, 1125] });
  for (let i = 0; i < n; i++) T.sq(ctx, dk[0] + i * 54 + 18, dk[1] + 18, 15, i <= cur ? C.navy : C.soft);
  const cy = pick({ '16x9': 800, '9x16': 1170 }), ch = pick({ '16x9': 215, '9x16': 300 });
  caption(ctx, u, st.at - (cur ? 0.4 : -0.4), cur + 1, st.title, st.body, OPS[sc.op].c, S.x, cy, S.w, ch);
  header(ctx, u, sc.a - 0.4, sc.tag, sc.title, OPS[sc.op].c, OPS[sc.op].ink, OPS[sc.op].ink === '#FFFFFF' ? '#FFFFFF' : C.navy, OPS[sc.op].ink === '#FFFFFF' ? C.navy : '#FFFFFF');
}

// ================================================================ 5. the last leg on foot
function walk(ctx, u, sc) {
  fill(ctx, C.light);
  const Wm = sc.map;
  const [rx, ry, rw, rh] = pick({ '16x9': [860, 210, 964, 800], '9x16': [72, 470, 936, 640] });
  const X = (fx) => rx + fx * rw, Y = (fy) => ry + fy * rh;
  ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip();
  ctx.fillStyle = '#E4EADF'; ctx.fillRect(rx, ry, rw, rh);
  if (Wm.blocks) {
    const [bx0, by0, bx1, by1] = Wm.blocks;
    for (let gx = 0; gx < 8; gx++) for (let gy = 0; gy < 6; gy++) {
      const x0 = lerp(bx0, bx1, gx / 8), y0 = lerp(by0, by1, gy / 6);
      ctx.fillStyle = hash01(gx * 7 + gy, 3) > 0.5 ? '#D3DCCB' : '#C9D3C0';
      ctx.fillRect(X(x0) + 10, Y(y0) + 10, (bx1 - bx0) * rw / 8 - 20, (by1 - by0) * rh / 6 - 20);
    }
  }
  if (Wm.airfield) {
    const [ax0, ay0, aw0, ah0] = Wm.airfield;
    ctx.fillStyle = '#A8D98A'; ctx.fillRect(X(ax0), Y(ay0), aw0 * rw, ah0 * rh);
    ctx.fillStyle = '#7F8C96'; ctx.fillRect(X(ax0) + 30, Y(ay0 + ah0 * 0.45), aw0 * rw - 60, 46);
    ctx.fillStyle = '#FFFFFF'; for (let x = X(ax0) + 60; x < X(ax0 + aw0) - 60; x += 70) ctx.fillRect(x, Y(ay0 + ah0 * 0.45) + 20, 36, 6);
  }
  if (Wm.green) { const [gx0, gy0, gw, gh] = Wm.green; ctx.fillStyle = '#9ED67F'; ctx.fillRect(X(gx0), Y(gy0), gw * rw, gh * rh); }
  if (Wm.sea === 'bottom') { ctx.fillStyle = '#EED9A4'; ctx.fillRect(rx, Y(Wm.seaAt - 0.05), rw, rh); ctx.fillStyle = '#8FCBE6'; ctx.fillRect(rx, Y(Wm.seaAt), rw, rh); }
  if (Wm.sea === 'left') { ctx.fillStyle = '#EED9A4'; ctx.fillRect(rx, ry, (Wm.seaAt + 0.04) * rw, rh); ctx.fillStyle = '#8FCBE6'; ctx.fillRect(rx, ry, Wm.seaAt * rw, rh); }
  if (Wm.sea) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      if (Wm.sea === 'bottom') { const x = rx + ((i * 140 + u * 10) % rw), yy = Y((Wm.seaAt + 1) / 2); ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + 40, yy); ctx.stroke(); }
      else { const yy = ry + ((i * 120 + u * 10) % rh), xx = X(Wm.seaAt / 2); ctx.beginPath(); ctx.moveTo(xx - 20, yy); ctx.lineTo(xx + 20, yy); ctx.stroke(); }
    }
  }
  (Wm.piers || []).forEach(([px, py, pw, ph]) => { ctx.fillStyle = '#B08A5E'; ctx.fillRect(X(px), Y(py), pw * rw, ph * rh); });
  (Wm.labels || []).forEach(({ t, at, kind }) => {
    if (kind === 'box') { ctx.font = fd(36); const tw = ctx.measureText(t).width + 40; ctx.fillStyle = C.navy; ctx.fillRect(X(at[0]) - tw / 2, Y(at[1]) - 34, tw, 52); M.text(ctx, t, X(at[0]), Y(at[1]) + 6, fd(36), '#FFF', 'center'); }
    else M.text(ctx, t, X(at[0]), Y(at[1]), fu(28, 700), C.body, 'center');
  });
  const stn = Wm.station, sop = OPS[stn.op];
  ctx.font = fd(34); const sw = ctx.measureText(stn.label).width + 40;
  ctx.fillStyle = sop.c; ctx.fillRect(X(stn.at[0]) - sw / 2, Y(stn.at[1]) - 30, sw, 56);
  M.text(ctx, stn.label, X(stn.at[0]), Y(stn.at[1]) + 10, fd(34), sop.ink || '#FFF', 'center');
  const path = Wm.path.map(([a, b]) => [X(a), Y(b)]);
  const lens = path.slice(1).map((q, i) => Math.hypot(q[0] - path[i][0], q[1] - path[i][1]));
  const tot = lens.reduce((s, v) => s + v, 0);
  const p = E.inOutSine(prog(u, sc.walk[0], sc.walk[1]));
  const at = (q) => { let left = tot * q; for (let i = 0; i < lens.length; i++) { if (left <= lens[i]) { const f = left / lens[i]; return [lerp(path[i][0], path[i + 1][0], f), lerp(path[i][1], path[i + 1][1], f)]; } left -= lens[i]; } return path[path.length - 1]; };
  ctx.save(); ctx.strokeStyle = C.teal; ctx.lineWidth = 12; ctx.setLineDash([2, 22]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(path[0][0], path[0][1]);
  for (let q = 0; q <= p; q += 0.01) { const [a, b] = at(q); ctx.lineTo(a, b); }
  ctx.stroke(); ctx.restore();
  if (Wm.crowd && u > sc.walk[1] - 0.5) {
    const [cx0, cy0, cw] = Wm.crowd;
    for (let i = 0; i < 26; i++) { ctx.fillStyle = [C.red, C.teal, C.amber, C.purple][i % 4]; ctx.beginPath(); ctx.arc(X(cx0 + (i % 13) * cw / 13), Y(cy0 + Math.floor(i / 13) * 0.02), 7, 0, M.TAU); ctx.fill(); }
  }
  if (Wm.jets) { const [jy, jx0, jx1] = Wm.jets; T.redArrows(ctx, prog(u, sc.walk[1] + 1, sc.b + 0.5), X(jx0), X(jx1), Y(jy), 0.32); }
  const [mx, my] = at(p);
  ctx.save(); ctx.translate(mx, my - 8 - Math.abs(Math.sin(u * Math.PI)) * 6 * (p < 1 ? 1 : 0));
  ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(0, -44, 30, 0, M.TAU); ctx.moveTo(-18, -24); ctx.lineTo(0, 0); ctx.lineTo(18, -24); ctx.fill();
  ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, -44, 20, 0, M.TAU); ctx.fill();
  ctx.fillStyle = C.hair; ctx.beginPath(); ctx.arc(0, -48, 20, Math.PI, M.TAU); ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(rx, ry, rw, rh);
  const lx = S.x, ly = pick({ '16x9': 280, '9x16': 1160 }), lh = pick({ '16x9': 150, '9x16': 82 });
  sc.steps.forEach(([b, s], i) => {
    const k = springU(u, b - 0.4, SPRING.bouncy);
    if (k <= 0.001) return;
    const last = i === sc.steps.length - 1;
    const done = last ? u > sc.walk[1] : u >= sc.steps[i + 1][0] - 0.4;
    ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate((1 - k) * -200, 0);
    T.sq(ctx, lx + 34, ly + i * lh, 30, done ? C.green : C.teal);
    if (done) T.tick(ctx, lx + 34, ly + i * lh, 30); else M.text(ctx, String(i + 1), lx + 34, ly + i * lh + 13, fd(38), '#FFF', 'center');
    T.lines(ctx, s, lx + 86, ly + i * lh + 14, fd(pick({ '16x9': 52, '9x16': 46 })), C.navy, pick({ '16x9': 640, '9x16': 840 }), 54);
    ctx.restore();
  });
  header(ctx, u, sc.a - 0.4, sc.tag, sc.title, C.teal, '#FFFFFF', C.navy, '#FFFFFF');
}

// ================================================================ 6. going home
function home(ctx, u, sc) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#F7B267'); g.addColorStop(0.6, '#F4845F'); g.addColorStop(1, '#6950A1');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,240,200,0.9)'; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.62, pick({ '16x9': 130, '9x16': 120 }), 0, M.TAU); ctx.fill();
  T.hills(ctx, H * 0.78, 20, 2, 0.5, '#3C2E5C', 2);
  ctx.fillStyle = '#2E2448'; ctx.fillRect(0, H * 0.8, W, H);
  const tx = lerp(-200, W + 1700, prog(u, sc.a - 0.5, sc.b));
  T.train(ctx, tx, H * 0.8, pick({ '16x9': 0.6, '9x16': 0.5 }), 4, { ...OPS[sc.op].look, window: '#FFE9B0' }, u * 2);
  const k = springU(u, sc.a - 0.3, SPRING.bouncy);
  const cx = S.x, cy = pick({ '16x9': 150, '9x16': 330 }), cw = pick({ '16x9': 1100, '9x16': S.w }), chh = pick({ '16x9': 430, '9x16': 560 });
  T.scaled(ctx, k, cx + cw / 2, cy + chh / 2, () => {
    T.card(ctx, cx, cy, cw, chh, { edge: C.purple, edgeH: 14 });
    ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(cx, cy, cw, chh);
    M.text(ctx, 'GOING HOME?', cx + 44, cy + 130, fd(100), C.navy);
    T.lines(ctx, sc.text, cx + 44, cy + 210, fu(42, 600), C.body, cw - 88, 56);
  });
}

// ================================================================ 7. end card: logo, line and web address
function end(ctx, u, sc, IMG) {
  T.sky(ctx);
  T.clouds(ctx, u, 5, 4, 80, 420, 8, 0.9);
  ctx.fillStyle = C.grass; ctx.fillRect(0, H * 0.86, W, H);
  T.redArrows(ctx, prog(u, sc.a - 1, sc.a + 3.5), -300, W + 400, pick({ '16x9': 130, '9x16': 300 }), 0.6);
  const lk = T.pop(u, sc.a + 0.6);
  if (lk > 0 && IMG.logo) { const lw = pick({ '16x9': 640, '9x16': 780 }), lh = lw * IMG.logo.height / IMG.logo.width; T.scaled(ctx, lk, W / 2, pick({ '16x9': 360, '9x16': 640 }), () => ctx.drawImage(IMG.logo, W / 2 - lw / 2, pick({ '16x9': 360, '9x16': 640 }) - lh / 2, lw, lh)); }
  const tk = E.outQuint(prog(u, sc.a + 1.4, sc.a + 2.2));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * tk, H);
  ctx.clip();
  T.lines(ctx, R.end.line, W / 2, pick({ '16x9': 690, '9x16': 1000 }), fd(pick({ '16x9': 84, '9x16': 96 })), C.navy, pick({ '16x9': 1600, '9x16': 900 }), pick({ '16x9': 90, '9x16': 104 }), 'center');
  ctx.restore();
  const uk = T.pop(u, sc.a + 2.4, SPRING.snappy);
  if (uk > 0) {
    let us = 50; ctx.font = fu(us, 700); while (ctx.measureText(R.end.url).width + 90 > W - 80 && us > 28) { us -= 2; ctx.font = fu(us, 700); }
    const uw = ctx.measureText(R.end.url).width + 90, uy = pick({ '16x9': 800, '9x16': 1250 });
    T.scaled(ctx, uk, W / 2, uy, () => { ctx.fillStyle = C.teal; ctx.fillRect(W / 2 - uw / 2, uy - 52, uw, 84); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.strokeRect(W / 2 - uw / 2, uy - 52, uw, 84); M.text(ctx, R.end.url, W / 2, uy + 6, fu(us, 700), '#FFF', 'center'); });
  }
  const wv = Math.sin(u * 5);
  T.person(ctx, pick({ '16x9': 230, '9x16': 230 }), pick({ '16x9': 1040, '9x16': 1700 }), pick({ '16x9': 0.75, '9x16': 0.8 }), { face: 1, pack: true, wave: 1, waveT: u * 0.4, blink: blinkAt(u), mouth: 'open' });
  void wv;
}

// sound cues from the scene list, when a route does not list its own
function autoHits() {
  const H2 = [[0, 'title', 'impact'], [1.5, 'pill', 'pop', { pitch: 'A5' }]];
  R.map.legs.forEach((l, i) => H2.push([l.a + 0.5, 'route ' + i, l.op === 'walk' || l.op === 'shuttle' ? 'pop' : 'whoosh', l.op === 'walk' || l.op === 'shuttle' ? { pitch: 'C6' } : { len: 0.5, from: 600, to: 2000 + i * 200 }]));
  R.chips.forEach((c, i) => H2.push([10 + i * 0.5, 'chip', 'tick']));
  R.scenes.forEach((s, i) => {
    if (i) { H2.push([s.a - 0.9, 'push', 'whoosh', { len: 0.4 }]); H2.push([s.a, s.type, s.type === 'home' ? 'thud' : 'impact']); }
    if (s.type === 'before') [0, 1, 2].forEach((j) => H2.push([s.a + 2 + j * 4, 'tip', 'bell', { pitch: ['C6', 'E6', 'G6'][j] }]));
    if (s.type === 'leg') { const L = s.leg; if (L.arrive) H2.push([L.arrive[0] + 1, 'train arrives', 'whoosh', { len: 1.2, from: 300, to: 900 }]); if (L.board) H2.push([L.board[1] - 0.9, 'doors', 'boing', { pitch: 'G5', to: 'C6' }]);
      H2.push([L.dep - 0.2, 'depart', 'riser', { len: 1 }]); L.chips.forEach((c, j) => H2.push([L.chipAt + j * 0.5, 'chip', 'tick'])); if (L.note) H2.push([L.note[0], 'note', 'blip', { pitch: 'A5' }]); }
    if (s.type === 'change') s.steps.forEach((st, j) => { if (j) H2.push([st.at, 'step', 'tok', { pitch: ['C5', 'D5', 'E5', 'G5', 'A5'][j % 5] }]); H2.push([st.at + 1.5, 'art', st.kind === 'board' || st.kind === 'clock' ? 'tick' : 'pop', { pitch: 'C6' }]); });
    if (s.type === 'walk') { s.steps.slice(1).forEach(([b]) => H2.push([b, 'step', 'tick'])); H2.push([s.walk[1], 'arrive', 'bell', { pitch: 'C6' }]); if (s.map.jets) H2.push([s.walk[1] + 1, 'jets', 'whoosh', { len: 1, from: 400, to: 3000 }]); }
    if (s.type === 'end') { H2.push([s.a + 0.6, 'logo', 'bell', { pitch: 'F6' }]); H2.push([s.a + 2.4, 'url', 'pop', { pitch: 'C6' }]); }
  });
  return H2.sort((a, b) => a[0] - b[0]);
}

// ================================================================ assembly
const DRAW = { map: (c, u) => mapScene(c, u), before, leg, change, walk, home };
const SC = R.scenes.map((s, i) => ({ a: i ? s.a : -10, b: s.b, push: s.push, draw: null, s }));
M.film({
  fonts: [fd(100), fu(40, 700), fu(40, 600)],
  images: { logo: 'assets/logo.png', hawk: 'assets/aircraft/hawk-side.webp', typhoon: 'assets/aircraft/typhoon-side.webp', a400: 'assets/aircraft/a400m-side.webp' },
  hits: R.hits || autoHits(),
  samples: 6,
  draw(ctx, u, t, IMG) {
    T.setAircraft(IMG);
    SC.forEach((x) => { if (!x.draw) x.draw = x.s.type === 'end' ? (c, uu) => end(c, uu, x.s, IMG) : (c, uu) => DRAW[x.s.type](c, uu, x.s); });
    T.sequence(ctx, u, SC, 0.9);
  },
});
