// By train to the Clacton Air Show: Eastbourne -> London Victoria -> (Circle line) -> Liverpool Street -> Clacton-on-Sea -> walk.
// A 90 s cartoon for The Big Guide to UK Airshows. Pure function of time; beats on the 120 bpm grid (1 beat = 0.5 s).
// Facts from the site's own data: train-routes-src/eastbourne-cfg.json + clacton-cfg.json + clacton-data.json,
// journey-planner.js (Victoria to Eastbourne line) and london-links.js (Victoria to Liverpool Street: Circle line).
import * as M from './lib/motion.js';
import * as T from './lib/toon.js';

const { W, H, FORMAT, E, prog, clamp, lerp, springU, SPRING, fill, rrect, bump, hash01, noise1 } = M;
const { C, fd, fu } = T;
const P = FORMAT.portrait;
const S = FORMAT.safe;
const pick = FORMAT.pick;

const OP = {
  southern: { c: '#7AB929', d: '#23412E', name: 'Southern' },
  circle: { c: '#FFD329', d: '#13293C', name: 'Circle line' },
  district: { c: '#00782A' },
  ga: { c: '#D2232A', d: '#9E1A20', name: 'Greater Anglia' },
  walk: { c: C.teal },
};

const HITS = [
  [0, 'title', 'impact'],
  [1.5, 'pill', 'pop', { pitch: 'A5' }],
  [3, 'leg 1 draws', 'whoosh', { len: 0.5, from: 600, to: 2000 }],
  [5, 'tube', 'blip', { pitch: 'E6' }],
  [6, 'leg 2 draws', 'whoosh', { len: 0.5, from: 600, to: 2400 }],
  [8.5, 'walk', 'pop', { pitch: 'C6' }],
  [10, 'chip', 'tick'], [10.5, 'chip', 'tick'], [11, 'chip', 'tick'], [11.5, 'chip', 'tick'],
  [15.1, 'push', 'whoosh', { len: 0.4 }],
  [16, 'ticket', 'thud'],
  [18, 'tip 1', 'bell', { pitch: 'C6' }],
  [22, 'tip 2', 'bell', { pitch: 'E6' }],
  [26, 'tip 3', 'bell', { pitch: 'G6' }],
  [31.1, 'push', 'whoosh', { len: 0.4 }],
  [32, 'leg 1', 'impact'],
  [33, 'train arrives', 'whoosh', { len: 1.2, from: 300, to: 900 }],
  [36.5, 'doors', 'boing', { pitch: 'G5', to: 'C6' }],
  [38, 'depart', 'riser', { len: 1 }],
  [40, 'chips', 'tick'], [40.5, 'chips', 'tick'], [41, 'chips', 'tick'],
  [61.1, 'push', 'whoosh', { len: 0.4 }],
  [62, 'the change', 'impact'],
  [64, 'sign', 'pop', { pitch: 'C6' }],
  [72, 'gates step', 'tok', { pitch: 'D5' }],
  [75.5, 'gates open', 'click'],
  [80, 'circle step', 'tok', { pitch: 'E5' }],
  [82, 'circle sign', 'bell', { pitch: 'E6' }],
  [84, 'not district', 'thud'],
  [90, 'ride step', 'tok', { pitch: 'G5' }],
  [104, 'arrive LST', 'bell', { pitch: 'G6' }],
  [106, 'board step', 'tok', { pitch: 'A5' }],
  [108, 'clock', 'tick'],
  [113.1, 'push', 'whoosh', { len: 0.4 }],
  [114, 'leg 2', 'impact'],
  [116, 'depart', 'riser', { len: 1 }],
  [118, 'chips', 'tick'], [118.5, 'chips', 'tick'], [119, 'chips', 'tick'],
  [136, 'summer note', 'blip', { pitch: 'A5' }],
  [145.1, 'push', 'whoosh', { len: 0.4 }],
  [146, 'last leg', 'impact'],
  [150, 'step', 'tick'], [154, 'step', 'tick'], [158, 'step', 'tick'],
  [161, 'arrive', 'bell', { pitch: 'C6' }],
  [161.5, 'jets', 'whoosh', { len: 1, from: 400, to: 3000 }],
  [163.1, 'push', 'whoosh', { len: 0.4 }],
  [164, 'home tip', 'thud'],
  [173.1, 'push', 'whoosh', { len: 0.4 }],
  [174, 'end card', 'impact'],
  [175, 'url', 'bell', { pitch: 'D6' }],
];

const blinkAt = (u) => { const k = Math.floor(u / 3.1); const c = k * 3.1 + 1 + hash01(k, 5) * 1.4; return bump(u, c, 0.14); };

// Section header bar: coloured block + pill + title. Lands on beat b.
function header(ctx, u, b, tag, title, bg, fg, tagBg = '#FFFFFF', tagFg = C.navy) {
  const k = springU(u, b - 0.6, SPRING.snappy);
  const y = pick({ '16x9': 60, '9x16': 250 }), h = pick({ '16x9': 120, '9x16': 190 });
  ctx.save(); ctx.translate(0, -(1 - k) * (h + y + 20));
  ctx.fillStyle = bg; ctx.fillRect(0, y, W, h);
  const ty = P ? y + 64 : y + h / 2;
  const pw = T.pill(ctx, tag, S.x, ty, pick({ '16x9': 30, '9x16': 32 }), tagBg, tagFg);
  if (P) T.lines(ctx, title, S.x, y + 150, fd(58), fg, S.w, 60);
  else M.text(ctx, title, S.x + pw + 28, ty + 24, fd(68), fg);
  ctx.restore();
}
// Caption card used in the steps. Returns nothing.
function caption(ctx, u, b, num, title, body, edge, x, y, w, h) {
  T.card(ctx, x, y, w, h, { edge, r: 20, edgeH: 12 });
  const tk = E.outCubic(prog(u, b, b + 0.6));
  ctx.save(); ctx.beginPath(); ctx.rect(x, y + 12, w, h - 12); ctx.clip();
  ctx.globalAlpha = tk; ctx.translate(0, (1 - tk) * 50);
  let tx = x + 36;
  if (num) {
    T.badge(ctx, x + 36 + 34, y + h / 2, 34, C.navy);
    M.text(ctx, String(num), x + 70, y + h / 2 + 15, fd(46), '#FFF', 'center');
    tx = x + 130;
  }
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

// ---------------------------------------------------------------- T1 map (0-16)
const MAPPTS = { EBN: [0.47, 0.86], VIC: [0.355, 0.445], LST: [0.405, 0.405], COL: [0.71, 0.24], CLT: [0.79, 0.31], SEA: [0.805, 0.345] };
const SEA = [[1, 0], [0.86, 0], [0.84, 0.16], [0.83, 0.3], [0.8, 0.38], [0.7, 0.42], [0.6, 0.46], [0.66, 0.5], [0.78, 0.52], [0.86, 0.56],
  [0.9, 0.64], [0.88, 0.74], [0.76, 0.82], [0.62, 0.86], [0.52, 0.895], [0.36, 0.9], [0.2, 0.92], [0, 0.93], [0, 1], [1, 1]];
function mapScene(ctx, u) {
  fill(ctx, C.light);
  const R = pick({ '16x9': [860, 110, 964, 900], '9x16': [40, 950, 1000, 560] });
  const [rx, ry, rw, rh] = R;
  const mp = (k) => [rx + MAPPTS[k][0] * rw, ry + MAPPTS[k][1] * rh];
  const mk = springU(u, -1.2, SPRING.gentle);
  ctx.save(); ctx.translate(0, (1 - mk) * 80);
  ctx.save(); rrect(ctx, rx, ry, rw, rh, 28); ctx.clip();
  ctx.fillStyle = '#CFE8B8'; ctx.fillRect(rx, ry, rw, rh);
  ctx.fillStyle = '#9FD3EA'; ctx.beginPath(); SEA.forEach(([x, y], i) => (i ? ctx.lineTo(rx + x * rw, ry + y * rh) : ctx.moveTo(rx + x * rw, ry + y * rh))); ctx.closePath(); ctx.fill();
  // soft waves
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4;
  for (let i = 0; i < 6; i++) { const x = rx + rw * (0.12 + i * 0.15), y = ry + rh * 0.96 + Math.sin(u + i) * 4; ctx.beginPath(); ctx.arc(x, y, 18, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  // London blob
  const [lx, ly] = mp('VIC');
  ctx.fillStyle = 'rgba(19,41,60,0.12)'; ctx.beginPath(); ctx.ellipse(lx + rw * 0.03, ly - rh * 0.01, rw * 0.09, rh * 0.06, 0, 0, M.TAU); ctx.fill();
  ctx.restore();
  // route, drawn leg by leg
  const legs = [
    [['EBN', 'VIC'], OP.southern.c, 2, 4.4, false],
    [['VIC', 'LST'], OP.circle.c, 4.6, 5.4, false],
    [['LST', 'COL', 'CLT'], OP.ga.c, 5.6, 8.2, false],
    [['CLT', 'SEA'], C.teal, 8.4, 9.2, true],
  ];
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  legs.forEach(([pts, col, a, b, dash]) => {
    const p = E.inOutCubic(prog(u, a, b));
    if (p <= 0) return;
    const xy = pts.map(mp);
    const segL = xy.slice(1).map((q, i) => Math.hypot(q[0] - xy[i][0], q[1] - xy[i][1]));
    const tot = segL.reduce((s, v) => s + v, 0);
    let left = tot * p;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = pick({ '16x9': 16, '9x16': 14 }); if (dash) ctx.setLineDash([4, 22]);
    ctx.beginPath(); ctx.moveTo(xy[0][0], xy[0][1]);
    for (let i = 0; i < segL.length && left > 0; i++) {
      const f = Math.min(1, left / segL[i]);
      ctx.lineTo(lerp(xy[i][0], xy[i + 1][0], f), lerp(xy[i][1], xy[i + 1][1], f));
      left -= segL[i];
    }
    ctx.stroke(); ctx.restore();
  });
  // places
  const fs = pick({ '16x9': 34, '9x16': 32 });
  [['EBN', 'Eastbourne', 0.4, 'right'], ['VIC', 'London', 2.2, 'left'], ['CLT', 'Clacton-on-Sea', 7.6, 'left']].forEach(([k, name, b, side]) => {
    const kk = T.pop(u, b);
    const [x, y] = mp(k);
    T.scaled(ctx, kk, x, y, () => {
      T.badge(ctx, x, y, 16, '#FFF'); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 16, 0, M.TAU); ctx.stroke();
      T.pill(ctx, name, side === 'right' ? x + 30 : x - 30, y - (k === 'CLT' ? 50 : 0), fs, C.navy, '#FFF', side);
    });
  });
  // the show: a little jet over the sea off Clacton
  const jk = T.pop(u, 9);
  if (jk > 0) {
    const [sx, sy] = mp('SEA');
    T.scaled(ctx, jk, sx, sy, () => {
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(sx, sy, 22, 0, M.TAU); ctx.fill();
      T.jet(ctx, sx + 60 + Math.sin(u * 1.5) * 8, sy + 40, 0.22, -0.3 + Math.sin(u) * 0.1, { stripe: C.red, flame: 0.6 });
    });
  }
  ctx.restore();
  // title block
  const tx = S.x + 10, ty = pick({ '16x9': 330, '9x16': 470 });
  const pk = T.pop(u, 1.5);
  T.scaled(ctx, pk, tx + 100, ty - 170, () => T.pill(ctx, 'Plan your airshow trip', tx, ty - pick({ '16x9': 190, '9x16': 175 }), pick({ '16x9': 32, '9x16': 34 }), C.purple, '#FFF'));
  T.heading(ctx, u, -1.1, 'EASTBOURNE', tx, ty, pick({ '16x9': 150, '9x16': 150 }), C.navy);
  T.heading(ctx, u, -0.8, 'TO CLACTON', tx, ty + pick({ '16x9': 140, '9x16': 140 }), pick({ '16x9': 150, '9x16': 150 }), C.navy, C.red, 1);
  const lk = E.outCubic(prog(u, 2, 2.8));
  if (lk > 0) { ctx.save(); ctx.globalAlpha = lk; T.lines(ctx, 'The Clacton Air Show by train, changing in London.', tx, ty + pick({ '16x9': 225, '9x16': 225 }) + (1 - lk) * 20, fu(pick({ '16x9': 40, '9x16': 40 }), 600), C.body, pick({ '16x9': 700, '9x16': 900 }), 52); ctx.restore(); }
  // legend chips
  const chips = [['Train', OP.southern.c, '#13210F'], ['Tube', OP.circle.c, C.navy], ['Train', OP.ga.c, '#FFF'], ['Walk', C.teal, '#FFF']];
  let cx = tx;
  const cy = ty + pick({ '16x9': 380, '9x16': 320 });
  chips.forEach(([s, bg, fg], i) => {
    const k = T.pop(u, 10 + i * 0.5);
    ctx.font = fu(34, 700); const w = ctx.measureText(s).width + 34 * 1.1;
    const x0 = cx;
    T.scaled(ctx, k, x0 + w / 2, cy, () => T.pill(ctx, s, x0, cy, 34, bg, fg));
    if (i < 3 && k > 0) { ctx.save(); ctx.globalAlpha = clamp(k); T.arrow(ctx, x0 + w + 22, cy, 26, 0, C.navy); ctx.restore(); }
    cx += w + 44;
  });
  const sk = E.outCubic(prog(u, 12.5, 13.3));
  if (sk > 0 && !P) { ctx.save(); ctx.globalAlpha = sk; T.lines(ctx, 'Around 3 hours 30 on the move, plus your changes.', tx, cy + 90, fu(36, 700), C.navy, 520, 46); ctx.restore(); }
  if (sk > 0 && P) { ctx.save(); ctx.globalAlpha = sk; T.lines(ctx, 'Around 3 hours 30 on the move, plus your changes.', tx, cy + 80, fu(36, 700), C.navy, 900, 46); ctx.restore(); }
  // Sam ready to go (landscape)
  if (!P) {
    const k = springU(u, 1, SPRING.bouncy);
    T.person(ctx, 720, 1020 + (1 - k) * 300, 0.62, { face: 1, pack: true, hold: 'ticket', armUp: 0.7, blink: blinkAt(u), mouth: u < 4 ? 'open' : 'smile' });
  }
}

// ---------------------------------------------------------------- T2 before you go (16-32)
const TIPS = [
  [18, 'Buy one ticket all the way', 'A through ticket via London usually covers the Tube between the stations.', C.teal],
  [22, 'Check the times for your day', 'Look up your trains, and any weekend Tube closures, before you set off.', C.amber],
  [26, 'Got a Railcard?', 'It takes a third off most fares. Under 5s travel free.', C.purple],
];
function ticket(ctx, x, y, w, h) {
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.15)'; rrect(ctx, x + 8, y + 12, w, h, 18); ctx.fill(); ctx.restore();
  rrect(ctx, x, y, w, h, 18); ctx.fillStyle = '#FFF6DE'; ctx.fill();
  ctx.save(); rrect(ctx, x, y, w, h, 18); ctx.clip(); ctx.fillStyle = C.amber; ctx.fillRect(x, y, w, h * 0.22); ctx.restore();
  M.text(ctx, 'TRAIN TICKET', x + 34, y + h * 0.15, fd(h * 0.1), C.navy);
  M.text(ctx, 'FROM', x + 34, y + h * 0.36, fu(h * 0.06, 700), C.body);
  M.text(ctx, 'EASTBOURNE', x + 34, y + h * 0.48, fd(h * 0.12), C.navy);
  M.text(ctx, 'TO', x + 34, y + h * 0.62, fu(h * 0.06, 700), C.body);
  M.text(ctx, 'CLACTON-ON-SEA', x + 34, y + h * 0.74, fd(h * 0.12), C.navy);
  M.text(ctx, 'ROUTE: VIA LONDON', x + 34, y + h * 0.9, fu(h * 0.065, 700), C.red);
  ctx.setLineDash([10, 10]); ctx.strokeStyle = C.soft; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x + w * 0.78, y + h * 0.28); ctx.lineTo(x + w * 0.78, y + h - 20); ctx.stroke(); ctx.setLineDash([]);
  T.jet(ctx, x + w * 0.89, y + h * 0.6, h / 1300, -1.2, { stripe: C.red, flame: 0 });
}
function before(ctx, u) {
  fill(ctx, C.light);
  T.heading(ctx, u, 15.4, 'BEFORE YOU GO', S.x, pick({ '16x9': 170, '9x16': 360 }), pick({ '16x9': 130, '9x16': 130 }), C.navy);
  const k = springU(u, 15.4, SPRING.bouncy);
  const tw = pick({ '16x9': 640, '9x16': 720 }), th = pick({ '16x9': 400, '9x16': 400 });
  const tx = pick({ '16x9': S.x, '9x16': (W - 720) / 2 }), ty = pick({ '16x9': 270, '9x16': 430 });
  ctx.save(); ctx.translate(tx + tw / 2, ty + th / 2); ctx.rotate(-0.04 + (1 - k) * 0.3); ctx.scale(Math.max(0.01, k), Math.max(0.01, k)); ctx.translate(-(tx + tw / 2), -(ty + th / 2));
  ticket(ctx, tx, ty, tw, th);
  ctx.restore();
  if (!P) T.person(ctx, 420, 1010, 0.62, { face: 1, pack: true, hold: 'phone', armUp: 1, blink: blinkAt(u) });
  TIPS.forEach(([b, title, body, col], i) => {
    const kk = springU(u, b, SPRING.bouncy);
    if (kk <= 0.001) return;
    const x = pick({ '16x9': 820, '9x16': S.x }), w = pick({ '16x9': 1004, '9x16': S.w }), h = pick({ '16x9': 230, '9x16': 210 });
    const y = pick({ '16x9': 250 + i * 250, '9x16': 870 + i * 225 });
    ctx.save(); ctx.translate((1 - kk) * 400, 0); ctx.globalAlpha = clamp(kk * 1.5);
    T.card(ctx, x, y, w, h, { edge: null, r: 18 });
    ctx.fillStyle = col; rrect(ctx, x, y, 16, h, 8); ctx.fill();
    T.badge(ctx, x + 76, y + 70, 36, col, (X, Y, R) => T.tick(ctx, X, Y, R));
    M.text(ctx, title, x + 136, y + 88, fd(pick({ '16x9': 56, '9x16': 52 })), C.navy);
    T.lines(ctx, body, x + 136, y + 145, fu(pick({ '16x9': 34, '9x16': 32 }), 600), C.body, w - 170, pick({ '16x9': 44, '9x16': 42 }));
    ctx.restore();
  });
}

// ---------------------------------------------------------------- the ride (legs 1 and 2)
// zones: [fractionStart, kind] where kind = 'sea' | 'country' | 'river' | 'city'
function zoneAt(f, zones) { let z = zones[0][1]; zones.forEach(([a, k]) => { if (f >= a) z = k; }); return z; }
function ride(ctx, u, R) {
  const { a, b, dep, arr, look, zones, stations, op } = R;
  // distance travelled: smooth start and stop
  const f = E.inOutSine(prog(u, dep, arr));
  const DIST = 26000;
  const d = f * DIST;
  const top = pick({ '16x9': 180, '9x16': 440 }), railY = pick({ '16x9': 820, '9x16': 1240 });
  T.sky(ctx, C.skyTop, C.skyLow, top, railY);
  T.clouds(ctx, u - d / 400, 6, 9, top + 60, top + 260, 6, 0.95);
  // far layer: downs / skyline by zone
  const zFar = zoneAt(f, zones);
  const farY = railY - pick({ '16x9': 170, '9x16': 230 });
  const cityK = zones.reduce((acc, [st, k], i) => {
    const en = zones[i + 1] ? zones[i + 1][0] : 1;
    return k === 'city' ? Math.max(acc, clamp(1 - Math.max(st - f, f - en) / 0.06)) : acc;
  }, 0);
  ctx.save(); ctx.globalAlpha = 1 - cityK * 0.9;
  T.hills(ctx, farY, 50, 1.6, d / 2600, '#A8D98A', 3);
  ctx.restore();
  if (cityK > 0) {
    ctx.save(); ctx.globalAlpha = cityK;
    for (let i = -2; i < 24; i++) {
      const wx = Math.floor(d * 0.25 / 120) + i;
      const x = wx * 120 - d * 0.25;
      const h = 90 + hash01(wx, 4) * 190;
      ctx.fillStyle = hash01(wx, 6) > 0.5 ? '#B9C7D3' : '#A3B4C3';
      ctx.fillRect(x, farY + 60 - h, 104, h + 200);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let r = 0; r < h / 40 - 1; r++) for (let c = 0; c < 3; c++) ctx.fillRect(x + 14 + c * 30, farY + 80 - h + r * 40, 16, 20);
    }
    ctx.restore();
  }
  // sea / river strip behind
  const seaK = zones.reduce((acc, [st, k], i) => {
    const en = zones[i + 1] ? zones[i + 1][0] : 1;
    return k === 'sea' || k === 'river' ? Math.max(acc, clamp(1 - Math.max(st - f, f - en) / 0.05)) : acc;
  }, 0);
  if (seaK > 0) {
    ctx.save(); ctx.globalAlpha = seaK; ctx.fillStyle = '#7FC7E3'; ctx.fillRect(0, farY + 10, W, 70);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4;
    for (let i = 0; i < 14; i++) { const x = ((i * 160 - d * 0.4) % (W + 160) + W + 160) % (W + 160) - 80; ctx.beginPath(); ctx.moveTo(x, farY + 40); ctx.lineTo(x + 40, farY + 40); ctx.stroke(); }
    ctx.restore();
  }
  // ground
  ctx.fillStyle = C.grass; ctx.fillRect(0, farY + 70, W, railY - farY);
  // near layer: trees / fences / buildings
  for (let i = -2; i < 14; i++) {
    const wx = Math.floor(d / 260) + i;
    const x = wx * 260 - d + 60 * hash01(wx, 2);
    const z = zoneAt(clamp(wx * 260 / DIST), zones);
    const y = railY - 40;
    if (z === 'city') {
      const h = 140 + hash01(wx, 8) * 120;
      ctx.fillStyle = ['#C96A4A', '#D9B38C', '#8C9BAA'][Math.floor(hash01(wx, 9) * 3)];
      ctx.fillRect(x, y - h, 200, h);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.fillRect(x + 22 + c * 60, y - h + 24 + r * 50, 34, 30);
    } else if (z === 'sea' || z === 'river') {
      ctx.fillStyle = '#E9D8A6'; ctx.fillRect(x, y - 6, 260, 10);
      if (hash01(wx, 3) > 0.5) { ctx.fillStyle = '#7A5B3A'; ctx.fillRect(x + 80, y - 60, 8, 60); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(x + 88, y - 60); ctx.lineTo(x + 130, y - 48); ctx.lineTo(x + 88, y - 36); ctx.fill(); }
    } else {
      if (hash01(wx, 3) > 0.35) {
        ctx.fillStyle = '#6B4E35'; ctx.fillRect(x + 40, y - 70, 18, 70);
        ctx.fillStyle = hash01(wx, 5) > 0.5 ? '#4E9A3A' : '#5FB046';
        ctx.beginPath(); ctx.arc(x + 49, y - 100, 58, 0, M.TAU); ctx.arc(x + 20, y - 78, 40, 0, M.TAU); ctx.arc(x + 80, y - 76, 42, 0, M.TAU); ctx.fill();
      } else { ctx.strokeStyle = '#B08A5E'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + 240, y - 30); ctx.stroke(); }
    }
  }
  // Gatwick: a plane climbing out mid-journey (leg 1 only)
  if (R.plane) {
    const pp = prog(f, R.plane - 0.08, R.plane + 0.08);
    if (pp > 0 && pp < 1) T.jet(ctx, lerp(W * 0.1, W * 0.9, pp), lerp(farY - 20, top + 80, pp), 0.45, -0.22, { body: '#FFFFFF', stripe: C.sky, belly: '#E7EDF2', flame: 0 });
  }
  // platform at the start and end
  const platK = 1 - clamp(d / 1800) + clamp((d - (DIST - 1800)) / 1800);
  ctx.fillStyle = '#9AA6B0'; ctx.fillRect(0, railY + 8, W, H - railY);
  if (platK > 0) {
    const off = d < DIST / 2 ? -d : DIST - d;
    ctx.fillStyle = '#D5DCE2'; ctx.fillRect(off - 200, railY - 60, W + 400, 60 + 4);
    ctx.fillStyle = C.amber; ctx.fillRect(off - 200, railY - 60, W + 400, 8);
    // canopy posts + name board
    ctx.fillStyle = op.d;
    for (let i = 0; i < 6; i++) ctx.fillRect(off + 100 + i * 360, top + 40, 14, railY - top - 100);
    ctx.fillRect(off, top + 30, W + 200, 30);
    const name = d < DIST / 2 ? R.from : R.to;
    const nbX = off + W * 0.5;
    ctx.fillStyle = op.c; rrect(ctx, nbX - 280, top + 110, 560, 90, 14); ctx.fill();
    M.text(ctx, name, nbX, top + 172, fd(54), op.ink || '#FFFFFF', 'center');
  }
  T.rails(ctx, railY + 4, '#5A6670', '#7C6A56', d, 1);
  // Sam on the platform boards the train (leg 1), else rides
  const tS = pick({ '16x9': 0.62, '9x16': 0.5 }), cars = pick({ '16x9': 3, '9x16': 2 });
  const frontX = pick({ '16x9': 1580, '9x16': 980 });
  const arriveK = R.arrive ? E.outCubic(prog(u, R.arrive[0], R.arrive[1])) : 1;
  const tx = frontX + (1 - arriveK) * 2600;
  if (R.board) {
    const [bA, bB] = R.board;
    const walkP = prog(u, bA, bB);
    if (walkP < 1) {
      const sx = lerp(pick({ '16x9': 400, '9x16': 220 }), tx - 444 * tS * 0.2 - 40, E.inOutCubic(walkP)) - d;
      T.person(ctx, sx, railY - 58, pick({ '16x9': 0.75, '9x16': 0.6 }), { face: 1, pack: true, walk: walkP > 0 ? 1 : 0, phase: u * Math.PI * 1.5, blink: blinkAt(u), wave: walkP <= 0 ? prog(u, a, a + 0.5) : 0, waveT: u * 0.5 });
    }
  }
  T.train(ctx, tx, railY, tS, cars, look, d / 60);
  // Sam in the window once on board
  if (!R.board || u >= R.board[1]) {
    const wx = tx - 430 * tS + 50 * tS + 92 * tS + 32 * tS, wy = railY - 170 * tS + 58 * tS;
    ctx.save(); rrect(ctx, wx - 32 * tS, wy - 24 * tS, 64 * tS, 48 * tS, 10 * tS); ctx.clip();
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(wx, wy + 8 * tS, 20 * tS, 0, M.TAU); ctx.fill();
    ctx.fillStyle = C.hair; ctx.beginPath(); ctx.arc(wx, wy + 2 * tS, 21 * tS, Math.PI, M.TAU); ctx.fill();
    ctx.restore();
  }
  // progress strip
  const py = pick({ '16x9': 960, '9x16': 1400 }), px0 = S.x + 20, px1 = W - S.x - 20;
  ctx.fillStyle = C.navy; rrect(ctx, S.x - 20, py - pick({ '16x9': 70, '9x16': 110 }), S.w + 40, pick({ '16x9': 130, '9x16': 180 }), 22); ctx.fill();
  ctx.strokeStyle = op.c; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px0, py); ctx.lineTo(px1, py); ctx.stroke();
  const n = stations.length;
  const pos = f * (n - 1);
  stations.forEach((s, i) => {
    const x = lerp(px0, px1, i / (n - 1));
    const past = pos >= i - 0.02;
    ctx.fillStyle = past ? op.c : C.navy; ctx.strokeStyle = op.c; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x, py, 14, 0, M.TAU); ctx.fill(); ctx.stroke();
  });
  const cxp = lerp(px0, px1, f);
  T.badge(ctx, cxp, py, 22, '#FFF'); T.badge(ctx, cxp, py, 12, op.c);
  const near = Math.round(pos);
  const nameK = bump(pos, near, 0.45);
  const lab = Math.abs(pos - near) < 0.45 ? stations[near] : '';
  if (lab) {
    ctx.save(); ctx.globalAlpha = clamp(nameK * 2);
    const lx = clamp(cxp, px0 + 140, px1 - 140);
    T.pill(ctx, lab, lx, py - pick({ '16x9': 0, '9x16': 0 }) - pick({ '16x9': 44, '9x16': 62 }), pick({ '16x9': 30, '9x16': 32 }), '#FFF', C.navy, 'center');
    ctx.restore();
  }
  M.text(ctx, stations[0], px0, py + pick({ '16x9': 48, '9x16': 60 }), fu(pick({ '16x9': 26, '9x16': 28 }), 700), C.soft, 'left');
  M.text(ctx, stations[n - 1], px1, py + pick({ '16x9': 48, '9x16': 60 }), fu(pick({ '16x9': 26, '9x16': 28 }), 700), C.soft, 'right');
  // fact chips
  R.chips.forEach((s, i) => {
    const k = T.pop(u, R.chipAt + i * 0.5);
    const cy = pick({ '16x9': 240 + i * 70, '9x16': 500 + i * 72 });
    T.scaled(ctx, k, S.x + 150, cy, () => T.pill(ctx, s, S.x, cy, pick({ '16x9': 34, '9x16': 34 }), i === 0 ? op.c : '#FFFFFF', i === 0 ? (op.ink || '#FFF') : C.navy));
  });
  if (R.note) {
    const k = springU(u, R.note[0], SPRING.snappy);
    if (k > 0) {
      ctx.save(); ctx.globalAlpha = clamp(k * 1.3);
      const cy = pick({ '16x9': 240 + 3 * 70, '9x16': 500 + 3 * 72 });
      T.pill(ctx, R.note[1], S.x, cy, pick({ '16x9': 34, '9x16': 30 }), C.amber, C.navy);
      ctx.restore();
    }
  }
}
const LOOK_SOUTHERN = { body: '#FFFFFF', stripe: OP.southern.c, door: OP.southern.c, roof: '#2E5E12', nose: OP.southern.c, window: '#24323E' };
const LOOK_GA = { body: '#FFFFFF', stripe: OP.ga.c, door: OP.ga.c, roof: '#8A8C8E', nose: OP.ga.c, window: '#24323E' };
const LEG1 = {
  a: 32, b: 62, arrive: [32, 35], board: [35.2, 37.4], dep: 38.2, arr: 58.5, look: LOOK_SOUTHERN, op: { ...OP.southern, ink: '#13210F' },
  from: 'Eastbourne', to: 'London Victoria', plane: 0.55,
  zones: [[0, 'sea'], [0.12, 'country'], [0.78, 'city']],
  stations: ['Eastbourne', 'Lewes', 'Haywards Heath', 'Gatwick Airport', 'East Croydon', 'Clapham Junction', 'London Victoria'],
  chips: ['Southern', 'About 1 hr 25 min', 'Every 30 min (hourly on Sundays)'], chipAt: 39.5,
};
const LEG2 = {
  a: 114, b: 146, dep: 115.5, arr: 143, look: LOOK_GA, op: OP.ga,
  from: 'London Liverpool Street', to: 'Clacton-on-Sea',
  zones: [[0, 'city'], [0.2, 'country'], [0.7, 'river'], [0.8, 'country'], [0.93, 'sea']],
  stations: ['Liverpool Street', 'Stratford', 'Shenfield', 'Chelmsford', 'Colchester', 'Thorpe-le-Soken', 'Clacton-on-Sea'],
  chips: ['Greater Anglia', 'Direct, every hour', 'About 1 hr 26 min'], chipAt: 117.5,
  note: [134, 'Check the summer 2027 times before you go'],
};
function leg1(ctx, u) { ride(ctx, u, LEG1); header(ctx, u, 31.6, 'LEG 1', 'Train to London Victoria', OP.southern.c, '#13210F', '#13210F', '#FFFFFF'); }
function leg2(ctx, u) { ride(ctx, u, LEG2); header(ctx, u, 113.6, 'LEG 2', 'Liverpool Street to Clacton-on-Sea', OP.ga.c, '#FFFFFF'); }

// ---------------------------------------------------------------- T4 the Tube change (62-114)
const CHANGE = [
  [62, 'Follow the signs for the Underground', 'They start on the platform at London Victoria.'],
  [72, 'Through the ticket gates', 'Use your through ticket, or tap in with contactless.'],
  [80, 'Circle line, eastbound', 'Not the District line: it doesn\'t go to Liverpool Street.'],
  [90, '11 stops, about 20 minutes', 'Stay on until Liverpool Street.'],
  [106, 'Follow the National Rail signs', 'Allow about 45 minutes for the whole change with bags.'],
];
const CIRCLE = ['Victoria', 'St James\'s Park', 'Westminster', 'Embankment', 'Temple', 'Blackfriars', 'Mansion House', 'Cannon Street', 'Monument', 'Tower Hill', 'Aldgate', 'Liverpool Street'];
function changeArt(ctx, u, i, x, y, w, h) {
  const b = CHANGE[i][0];
  ctx.save(); rrect(ctx, x, y, w, h, 20); ctx.clip();
  const floorY = y + h * 0.84;
  // station interior: tiles + floor
  ctx.fillStyle = '#EEF2F5'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#DCE3E9'; ctx.lineWidth = 2;
  for (let yy = y; yy < floorY; yy += 40) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
  ctx.fillStyle = '#B9C4CD'; ctx.fillRect(x, floorY, w, h);
  const sS = pick({ '16x9': 0.8, '9x16': 0.75 });
  if (i === 0) {
    // hanging sign: navy board, white text, arrow
    const k = T.pop(u, b + 2);
    const sw = Math.min(w * 0.6, 620), sx = x + w * 0.55 - sw / 2, sy = y + 50;
    ctx.fillStyle = '#5C6873'; ctx.fillRect(sx + 40, y, 8, sy - y); ctx.fillRect(sx + sw - 48, y, 8, sy - y);
    T.scaled(ctx, k, sx + sw / 2, sy + 60, () => {
      ctx.fillStyle = C.navy; rrect(ctx, sx, sy, sw, 120, 14); ctx.fill();
      M.text(ctx, 'Underground', sx + 40, sy + 78, fd(64), '#FFF');
      T.arrow(ctx, sx + sw - 70, sy + 60, 60, 0, OP.circle.c);
    });
    const p = E.inOutSine(prog(u, b + 0.5, b + 9));
    T.person(ctx, lerp(x + 80, x + w - 120, p), floorY + 10, sS, { face: 1, pack: true, walk: 1, phase: u * Math.PI * 1.4, blink: blinkAt(u) });
  }
  if (i === 1) {
    const gx = x + w * 0.55;
    const open = E.outBack(prog(u, b + 3.5, b + 4.3));
    for (let g = -1; g <= 1; g++) {
      const cx = gx + g * 230;
      ctx.fillStyle = '#4A5A66'; rrect(ctx, cx - 120, floorY - 150, 40, 150, 8); ctx.fill(); rrect(ctx, cx + 80, floorY - 150, 40, 150, 8); ctx.fill();
      ctx.fillStyle = g === 0 ? C.green : '#4A5A66'; ctx.fillRect(cx - 112, floorY - 140, 24, 10);
      ctx.fillStyle = C.red;
      const pw = 70 * (1 - (g === 0 ? open : 0));
      if (pw > 2) { rrect(ctx, cx - 80, floorY - 110, pw, 60, 10); ctx.fill(); rrect(ctx, cx + 80 - pw, floorY - 110, pw, 60, 10); ctx.fill(); }
    }
    const p = E.inOutCubic(prog(u, b + 0.5, b + 3.3)), p2 = E.inOutCubic(prog(u, b + 4.2, b + 7));
    const sx = lerp(x + 100, gx - 170, p) + p2 * (w * 0.6);
    const walking = (p > 0 && p < 1) || (p2 > 0 && p2 < 1);
    T.person(ctx, sx, floorY + 10, sS, { face: 1, pack: true, walk: walking ? 1 : 0, phase: u * Math.PI * 1.4, hold: 'ticket', armUp: p >= 1 && p2 <= 0 ? 0.8 : 0, blink: blinkAt(u) });
    const bk = bump(u, b + 3.6, 0.6);
    if (bk > 0) { ctx.save(); ctx.globalAlpha = bk; T.badge(ctx, gx - 100, floorY - 200, 34, C.green, (X, Y, R) => T.tick(ctx, X, Y, R)); ctx.restore(); }
  }
  if (i === 2) {
    // platform signs: Circle (yes) and District (no)
    const k1 = springU(u, b + 2, SPRING.bouncy), k2 = springU(u, b + 4, SPRING.bouncy);
    const sw = Math.min(w - 80, pick({ '16x9': 900, '9x16': 820 })), sx = x + (w - sw) / 2;
    T.scaled(ctx, k1, sx + sw / 2, y + 120, () => {
      ctx.fillStyle = '#FFFFFF'; rrect(ctx, sx, y + 50, sw, 150, 14); ctx.fill();
      ctx.fillStyle = OP.circle.c; ctx.fillRect(sx, y + 50, 40, 150);
      M.text(ctx, 'Circle line', sx + 70, y + 125, fd(70), C.navy);
      M.text(ctx, 'Eastbound to Tower Hill and Aldgate', sx + 70, y + 175, fu(32, 700), C.body);
      T.badge(ctx, sx + sw - 70, y + 125, 44, C.green, (X, Y, R) => T.tick(ctx, X, Y, R));
    });
    T.scaled(ctx, k2, sx + sw / 2, y + 290, () => {
      ctx.save(); ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#FFFFFF'; rrect(ctx, sx + 60, y + 230, sw - 120, 110, 14); ctx.fill();
      ctx.fillStyle = OP.district.c; ctx.fillRect(sx + 60, y + 230, 30, 110);
      M.text(ctx, 'District line', sx + 115, y + 302, fd(52), C.body);
      T.badge(ctx, sx + sw - 120, y + 285, 36, C.red, (X, Y, R) => T.cross(ctx, X, Y, R));
      ctx.restore();
    });
    T.person(ctx, x + w * 0.12, floorY + 10, sS * 0.85, { face: 1, pack: true, armUp: prog(u, b + 2.4, b + 3), blink: blinkAt(u) });
  }
  if (i === 3) {
    // schematic: yellow line, station ticks, the train dot hops stop by stop
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h);
    const n = CIRCLE.length;
    const hop = (u - (b + 0.5)) / ((106 - 1.2 - (b + 0.5)) / (n - 1));
    const at = clamp(hop, 0, n - 1);
    const kInt = Math.floor(at), frac = at - kInt;
    const pos = kInt + E.inOutCubic(clamp(frac * 1.6));
    const gap = pick({ '16x9': 260, '9x16': 230 });
    const ly = y + h * 0.58;
    const camX = x + w * 0.42 - pos * gap;
    ctx.strokeStyle = OP.circle.c; ctx.lineWidth = 26; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(camX - 200, ly); ctx.lineTo(camX + (n - 1) * gap + 200, ly); ctx.stroke();
    CIRCLE.forEach((s, j) => {
      const sx = camX + j * gap;
      if (sx < x - 300 || sx > x + w + 300) return;
      const end = j === 0 || j === n - 1;
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = C.navy; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(sx, ly, end ? 26 : 16, 0, M.TAU); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(sx, ly + 56); ctx.rotate(0.45);
      M.text(ctx, s, 0, 0, fu(j === n - 1 ? 40 : 32, 700), j === n - 1 ? C.navy : C.body, 'left');
      ctx.restore();
    });
    // the tube train above the line
    const tx = x + w * 0.42 + 190;
    T.train(ctx, tx, ly - 34, 0.42, 2, { body: '#FFFFFF', stripe: '#1D63B7', door: C.red, roof: '#5C6873', tube: true }, u * 2);
    // stop counter
    const stops = Math.min(11, Math.round(pos));
    T.pill(ctx, stops ? `Stop ${stops} of 11` : 'Leaving Victoria', x + 30, y + 60, 34, C.navy, '#FFF');
    if (pos >= n - 1.05) { const k = T.pop(u, 104); T.scaled(ctx, k, x + w - 200, y + 60, () => T.pill(ctx, 'Off here!', x + w - 30, y + 60, 34, C.green, '#FFF', 'right')); }
  }
  if (i === 4) {
    // departure board
    const bw = Math.min(w - 80, pick({ '16x9': 900, '9x16': 820 })), bx = x + (w - bw) / 2, by = y + 50;
    const k = springU(u, b + 0.6, SPRING.bouncy);
    T.scaled(ctx, k, bx + bw / 2, by + 140, () => {
      ctx.fillStyle = '#111'; rrect(ctx, bx, by, bw, 270, 16); ctx.fill();
      ctx.fillStyle = '#2B2B2B'; ctx.fillRect(bx + 20, by + 20, bw - 40, 4);
      const amber = '#FFB400';
      M.text(ctx, 'Departures', bx + 30, by + 70, fd(44), amber);
      M.text(ctx, 'Clacton-on-Sea', bx + 30, by + 150, fd(66), amber);
      M.text(ctx, 'Hourly', bx + bw - 30, by + 150, fd(66), amber, 'right');
      M.text(ctx, 'Calling at Stratford, Shenfield, Chelmsford, Colchester...', bx + 30, by + 220, fu(30, 600), '#E6A500');
    });
    const ck = T.pop(u, b + 2);
    T.scaled(ctx, ck, x + w * 0.16, floorY - 60, () => clockLabel(ctx, x + w * 0.16, floorY - 60, 64, u));
    T.person(ctx, x + w * 0.82, floorY + 10, sS * 0.85, { face: -1, pack: true, armUp: 0.7, blink: blinkAt(u), mouth: 'open' });
  }
  ctx.restore();
}
function clockLabel(ctx, x, y, r, u) {
  T.clock(ctx, x, y, r, (u * 12) % 60, C.navy);
  T.pill(ctx, '45 min', x, y + r + 40, 32, C.navy, '#FFF', 'center');
}
function change(ctx, u) {
  fill(ctx, C.light);
  const cur = CHANGE.reduce((a, s, i) => (u >= s[0] - (i ? 0.4 : 0) ? i : a), 0);
  const st = CHANGE[cur];
  const ax = S.x, ay = pick({ '16x9': 210, '9x16': 470 }), aw = S.w, ah = pick({ '16x9': 520, '9x16': 620 });
  changeArt(ctx, u, cur, ax, ay, aw, ah);
  // step dots
  const dk = pick({ '16x9': [W - S.x - 5 * 54, 760], '9x16': [S.x, 1125] });
  for (let i = 0; i < 5; i++) { T.badge(ctx, dk[0] + i * 54 + 18, dk[1] + 18, 16, i <= cur ? C.navy : C.soft); }
  const cy = pick({ '16x9': 800, '9x16': 1170 }), ch = pick({ '16x9': 215, '9x16': 300 });
  caption(ctx, u, st[0] - (cur ? 0.4 : -0.4), cur + 1, st[1], st[2], OP.circle.c, S.x, cy, S.w, ch);
  header(ctx, u, 61.6, 'THE CHANGE', 'Tube from Victoria to Liverpool Street', OP.circle.c, C.navy, C.navy, '#FFFFFF');
}

// ---------------------------------------------------------------- T6 the walk (146-164)
const WALK = [
  [148, 'Out of Clacton-on-Sea station'],
  [151.5, 'Down through the town centre'],
  [155, 'At the seafront, turn right'],
  [158.5, 'The West Greensward: you\'re there!'],
];
function walk(ctx, u) {
  fill(ctx, C.light);
  const R = pick({ '16x9': [860, 210, 964, 800], '9x16': [72, 470, 936, 640] });
  const [rx, ry, rw, rh] = R;
  ctx.save(); rrect(ctx, rx, ry, rw, rh, 26); ctx.clip();
  ctx.fillStyle = '#E4EADF'; ctx.fillRect(rx, ry, rw, rh);
  // town blocks
  for (let gx = 0; gx < 8; gx++) for (let gy = 0; gy < 5; gy++) {
    const bx = rx + 20 + gx * rw / 8, by = ry + 20 + gy * rh * 0.62 / 5;
    if (Math.abs(gx - 4.4) < 0.9) continue;
    ctx.fillStyle = hash01(gx * 7 + gy, 3) > 0.5 ? '#D3DCCB' : '#C9D3C0';
    rrect(ctx, bx, by, rw / 8 - 24, rh * 0.62 / 5 - 22, 8); ctx.fill();
  }
  // green + beach + sea
  ctx.fillStyle = '#9ED67F'; ctx.fillRect(rx, ry + rh * 0.66, rw, rh * 0.1);
  ctx.fillStyle = '#EED9A4'; ctx.fillRect(rx, ry + rh * 0.76, rw, rh * 0.06);
  ctx.fillStyle = '#8FCBE6'; ctx.fillRect(rx, ry + rh * 0.82, rw, rh);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) { const x = rx + ((i * 140 + u * 10) % rw), yy = ry + rh * 0.9; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + 40, yy); ctx.stroke(); }
  // pier on the right (the pier is east of the Greensward)
  ctx.fillStyle = '#B08A5E'; ctx.fillRect(rx + rw * 0.78, ry + rh * 0.7, rw * 0.04, rh * 0.3);
  M.text(ctx, 'Pier', rx + rw * 0.84, ry + rh * 0.95, fu(28, 700), C.navy);
  // labels
  M.text(ctx, 'Town centre', rx + rw * 0.2, ry + rh * 0.36, fu(30, 700), C.body, 'center');
  ctx.fillStyle = C.navy; rrect(ctx, rx + rw * 0.06, ry + rh * 0.67, rw * 0.36, rh * 0.08, 10); ctx.fill();
  M.text(ctx, 'West Greensward', rx + rw * 0.24, ry + rh * 0.725, fd(38), '#FFF', 'center');
  // station
  const st = [rx + rw * 0.56, ry + rh * 0.06];
  ctx.fillStyle = OP.ga.c; rrect(ctx, st[0] - 80, st[1] - 10, 160, 60, 10); ctx.fill();
  M.text(ctx, 'Station', st[0], st[1] + 32, fd(34), '#FFF', 'center');
  // route path
  const path = [[0.56, 0.12], [0.56, 0.4], [0.58, 0.64], [0.56, 0.72], [0.36, 0.72], [0.24, 0.7]].map(([a, b]) => [rx + a * rw, ry + b * rh]);
  const lens = path.slice(1).map((q, i) => Math.hypot(q[0] - path[i][0], q[1] - path[i][1]));
  const tot = lens.reduce((s, v) => s + v, 0);
  const p = E.inOutSine(prog(u, 147, 159));
  const at = (q) => { let left = tot * q; for (let i = 0; i < lens.length; i++) { if (left <= lens[i]) { const f = left / lens[i]; return [lerp(path[i][0], path[i + 1][0], f), lerp(path[i][1], path[i + 1][1], f)]; } left -= lens[i]; } return path[path.length - 1]; };
  ctx.save(); ctx.strokeStyle = C.teal; ctx.lineWidth = 12; ctx.setLineDash([2, 22]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(path[0][0], path[0][1]);
  for (let q = 0; q <= p; q += 0.01) { const [a, b] = at(q); ctx.lineTo(a, b); }
  ctx.stroke(); ctx.restore();
  // crowd + display over the sea once there
  const arrive = prog(u, 158.5, 160);
  if (arrive > 0) {
    for (let i = 0; i < 26; i++) { ctx.fillStyle = [C.red, C.teal, C.amber, C.purple][i % 4]; ctx.beginPath(); ctx.arc(rx + rw * (0.08 + (i % 13) * 0.026), ry + rh * (0.765 + Math.floor(i / 13) * 0.018), 7, 0, M.TAU); ctx.fill(); }
  }
  const jp = prog(u, 160.5, 166);
  if (jp > 0 && jp < 1) {
    [[0, C.red], [1, '#FFFFFF'], [2, '#1D63B7']].forEach(([k, col]) => {
      const pos = (t) => { const q = prog(t, 160.5, 166); return [lerp(rx + rw + 100, rx - 200, q) + k * 60, ry + rh * 0.88 - Math.sin(q * Math.PI) * rh * 0.06 + k * 26]; };
      T.trail(ctx, pos, u, 2, 14, col, 24, 0.8);
      const [x, y] = pos(u);
      T.jet(ctx, x, y, 0.2, Math.PI, { stripe: col === '#FFFFFF' ? C.navy : col, flame: 0.5 });
    });
  }
  // the walker pin
  const [mx, my] = at(p);
  ctx.save(); ctx.translate(mx, my - 8 - Math.abs(Math.sin(u * Math.PI)) * 6 * (p < 1 ? 1 : 0));
  ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(0, -44, 30, 0, M.TAU); ctx.moveTo(-18, -24); ctx.lineTo(0, 0); ctx.lineTo(18, -24); ctx.fill();
  ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, -44, 20, 0, M.TAU); ctx.fill();
  ctx.fillStyle = C.hair; ctx.beginPath(); ctx.arc(0, -48, 20, Math.PI, M.TAU); ctx.fill();
  ctx.restore();
  ctx.restore();
  // step list
  const lx = S.x, ly = pick({ '16x9': 280, '9x16': 1160 }), lh = pick({ '16x9': 150, '9x16': 82 });
  WALK.forEach(([b, s], i) => {
    const k = springU(u, b - 0.4, SPRING.bouncy);
    if (k <= 0.001) return;
    const done = u >= (WALK[i + 1] ? WALK[i + 1][0] - 0.4 : 160);
    ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate((1 - k) * -200, 0);
    T.badge(ctx, lx + 34, ly + i * lh, 30, done || i === 3 && u > 159 ? C.green : C.teal, (X, Y, R) => (done || (i === 3 && u > 159) ? T.tick(ctx, X, Y, R) : M.text(ctx, String(i + 1), X, Y + 13, fd(38), '#FFF', 'center')));
    T.lines(ctx, s, lx + 86, ly + i * lh + 14, fd(pick({ '16x9': 52, '9x16': 46 })), C.navy, pick({ '16x9': 640, '9x16': 840 }), 54);
    ctx.restore();
  });
  header(ctx, u, 145.6, 'LAST LEG', 'Walk to the seafront: 10 to 15 minutes', C.teal, '#FFFFFF', C.navy, '#FFFFFF');
}

// ---------------------------------------------------------------- T7 going home (164-174)
function home(ctx, u) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#F7B267'); g.addColorStop(0.6, '#F4845F'); g.addColorStop(1, '#6950A1');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,240,200,0.9)'; ctx.beginPath(); ctx.arc(W * 0.78, H * pick({ '16x9': 0.62, '9x16': 0.62 }), pick({ '16x9': 130, '9x16': 120 }), 0, M.TAU); ctx.fill();
  T.hills(ctx, H * 0.78, 20, 2, 0.5, '#3C2E5C', 2);
  ctx.fillStyle = '#2E2448'; ctx.fillRect(0, H * 0.8, W, H);
  // a busy train going by, people in every window
  const tx = lerp(-200, W + 1700, prog(u, 163.5, 174));
  T.train(ctx, tx, H * 0.8, pick({ '16x9': 0.6, '9x16': 0.5 }), 4, { ...LOOK_GA, window: '#FFE9B0' }, u * 2);
  const k = springU(u, 163.7, SPRING.bouncy);
  const cx = S.x, cy = pick({ '16x9': 150, '9x16': 330 }), cw = pick({ '16x9': 1100, '9x16': S.w }), chh = pick({ '16x9': 430, '9x16': 560 });
  T.scaled(ctx, k, cx + cw / 2, cy + chh / 2, () => {
    T.card(ctx, cx, cy, cw, chh, { edge: C.purple, r: 22, edgeH: 14 });
    M.text(ctx, 'GOING HOME?', cx + 44, cy + 130, fd(pick({ '16x9': 100, '9x16': 100 })), C.navy);
    T.lines(ctx, 'Trains are very busy straight after the flying. Leave a little early, or stay in town for something to eat and catch a later train.', cx + 44, cy + 210, fu(pick({ '16x9': 42, '9x16': 42 }), 600), C.body, cw - 88, pick({ '16x9': 56, '9x16': 56 }));
  });
}

// ---------------------------------------------------------------- T8 end card (174-180)
function end(ctx, u, IMG) {
  fill(ctx, C.navy);
  const pos = (t) => { const p = (t - 173.4) / 4; return [lerp(-300, W + 400, p), pick({ '16x9': 140, '9x16': 300 }) - Math.sin(p * Math.PI) * 40]; };
  T.trail(ctx, pos, u, 2.2, 22, C.red, 30, 0.6);
  const [jx, jy] = pos(u);
  T.jet(ctx, jx, jy, 0.55, -0.05, { body: '#E7EDF2', stripe: C.red, belly: '#FFF', flame: 0.7 });
  const lx = S.x + 10, ly = pick({ '16x9': 430, '9x16': 560 });
  T.heading(ctx, u, 173.8, 'PLAN YOUR', lx, ly, pick({ '16x9': 160, '9x16': 150 }), '#FFF');
  T.heading(ctx, u, 174.1, 'TRIP', lx, ly + pick({ '16x9': 150, '9x16': 140 }), pick({ '16x9': 160, '9x16': 150 }), '#FF8C92');
  const k = E.outCubic(prog(u, 174.8, 175.6));
  if (k > 0) {
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 30);
    const y = ly + pick({ '16x9': 250, '9x16': 235 });
    M.text(ctx, 'ukairshowguide.co.uk/train-to-clacton', lx, y, fu(pick({ '16x9': 40, '9x16': 42 }), 700), C.mint);
    T.lines(ctx, 'Every train, every change and the walk, step by step.', lx, y + 64, fu(34, 600), C.soft, pick({ '16x9': 720, '9x16': 930 }), 44);
    M.text(ctx, 'THE BIG GUIDE TO UK AIRSHOWS', lx, pick({ '16x9': 960, '9x16': 1620 }), fd(44), '#FFF');
    ctx.restore();
  }
  const bk = springU(u, 174.3, SPRING.gentle);
  const bw = pick({ '16x9': 900, '9x16': 640 }), bh = pick({ '16x9': 570, '9x16': 640 });
  const bx = pick({ '16x9': 900, '9x16': (W - 640) / 2 }), by = pick({ '16x9': 250, '9x16': 900 });
  ctx.save(); ctx.translate(0, (1 - bk) * (H - by));
  T.browser(ctx, P ? IMG.trainM : IMG.train, bx, by, bw, bh, { fy: P ? 0.1 : 0.2, zoom: 1 + 0.03 * prog(u, 174, 180) });
  ctx.restore();
}

const SCENES = (IMG) => [
  { a: -10, b: 16, draw: mapScene },
  { a: 16, b: 32, draw: before, push: 'left' },
  { a: 32, b: 62, draw: leg1, push: 'left' },
  { a: 62, b: 114, draw: change, push: 'up' },
  { a: 114, b: 146, draw: leg2, push: 'down' },
  { a: 146, b: 164, draw: walk, push: 'left' },
  { a: 164, b: 174, draw: home, push: 'left' },
  { a: 174, b: 999, draw: (c, u) => end(c, u, IMG), push: 'up' },
];
let SC = null;
M.film({
  fonts: [fd(100), fu(40, 700), fu(40, 600)],
  images: { train: 'assets/shots/train_desktop.png', trainM: 'assets/shots/train_mobile.png' },
  hits: HITS,
  samples: 6,
  draw(ctx, u, t, IMG) {
    if (!SC) SC = SCENES(IMG);
    T.sequence(ctx, u, SC, 0.9);
  },
});
