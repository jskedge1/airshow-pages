// The Captain's Checklist: Charlie plans the airshow day the way a display pilot plans a
// flight, and is the captain of the day. 140 beats at 80 bpm (105 s). Pure function of time.
import * as K from '../shared/kit.js';
const { M, C, F } = K;
const { W, H, TAU, clamp, lerp, prog, E, springU, SPRING, kf, hash01 } = M;

const GY = 560, FEET = 750;         // horizon and where feet stand (the caption card sits below)
const SOFT = '#F7CDAE';             // a loud sound once it has been turned down
const CARD = '#D9B382', CARD2 = '#EBD9B8', CARD3 = '#C39A6B';   // cardboard
const WALL = '#EFE6D6', FLOOR = '#E3D6C0';
const ITEMS = ['Briefing', 'Kit check', 'Flight plan', 'Holding pattern', 'Radio calls', 'Return to base'];
const TICKS = [24.6, 36.6, 48.6, 60.6, 72.6, 84.6];   // when each box on the progress strip is ticked

// Soft, low sounds only: this film is meant to be calm to watch.
const HITS = [
  [0.3, 'caption 1', 'tok', { pitch: 'G4', gain: 0.2 }],
  [2.4, 'checklist up', 'blip', { pitch: 'D5', gain: 0.1 }],
  [4.4, 'caption 2', 'tok', { pitch: 'B4', gain: 0.2 }],
  [5, "Charlie's plan", 'pop', { pitch: 'D5', to: 'G4', gain: 0.14 }],
  [8, 'title', 'tok', { pitch: 'G4', gain: 0.25 }],
  ...[0, 1, 2, 3, 4, 5].map((i) => [9.5 + i * 0.4, `row ${i + 1}`, 'blip', { pitch: ['G5', 'A5', 'B5', 'D6', 'E6', 'G6'][i], gain: 0.1 }]),
  [14.3, 'item 1', 'tok', { pitch: 'G4', gain: 0.22 }], [17.6, 'next video', 'tick', { gain: 0.14 }], [20.6, 'show map', 'tick', { gain: 0.14 }],
  [22.2, 'photo 1', 'pop', { pitch: 'B4', gain: 0.14 }], [23.2, 'photo 2', 'pop', { pitch: 'D5', gain: 0.14 }],
  [26.3, 'item 2', 'tok', { pitch: 'A4', gain: 0.22 }], [28.5, 'defenders on', 'pop', { pitch: 'D5', to: 'G4', gain: 0.18 }],
  ...[0, 1, 2, 3, 4, 5].map((i) => [29.9 + i * 1.15, `packed ${i + 1}`, 'blip', { pitch: ['G5', 'A5', 'B5', 'D6', 'E6', 'G6'][i], gain: 0.1 }]),
  [38.3, 'item 3', 'tok', { pitch: 'B4', gain: 0.22 }], [41.8, 'arrive early', 'blip', { pitch: 'D5', gain: 0.1 }],
  [45.6, 'our spot', 'pop', { pitch: 'G4', gain: 0.16 }],
  [50.3, 'item 4', 'tok', { pitch: 'G4', gain: 0.22 }], [56.6, 'calm here', 'bell', { pitch: 'D6', gain: 0.09 }], [57.6, 'Beth', 'blip', { pitch: 'D5', gain: 0.1 }],
  [62.3, 'item 5', 'tok', { pitch: 'A4', gain: 0.22 }], [64.4, 'card to red', 'tick', { gain: 0.16 }], [66, 'loud warning', 'tok', { pitch: 'D4', gain: 0.2 }],
  [66.8, 'card to green', 'tick', { gain: 0.16 }], [70, 'the jet', 'whoosh', { len: 3.2, from: 140, to: 380, gain: 0.12, peak: 0.5 }],
  [74.3, 'item 6', 'tok', { pitch: 'B4', gain: 0.22 }], [75.4, "captain's call", 'blip', { pitch: 'D5', gain: 0.1 }], [83.2, 'leaving happy', 'pop', { pitch: 'G4', gain: 0.16 }],
  ...TICKS.map((b, i) => [b, `tick ${i + 1}`, 'bell', { pitch: ['G5', 'A5', 'B5', 'D6', 'E6', 'G6'][i], gain: 0.09 }]),
  [86, 'nearby', 'tok', { pitch: 'G4', gain: 0.25 }],
  ...[0, 1, 2, 3, 4].map((i) => [88 + i * 2.5, `point ${i + 1}`, 'tok', { pitch: ['G4', 'A4', 'B4', 'D5', 'E5'][i], gain: 0.16 }]),
  [95.8, 'can I help', 'blip', { pitch: 'D5', gain: 0.1 }], [101.5, 'kindness', 'bell', { pitch: 'D6', gain: 0.09 }],
  [106, 'ground crew', 'tok', { pitch: 'G4', gain: 0.25 }],
  ...[0, 1, 2, 3, 4, 5].map((i) => [108 + i * 2, `tile ${i + 1}`, 'tok', { pitch: ['G4', 'A4', 'B4', 'D5', 'E5', 'G5'][i], gain: 0.16 }]),
  [120.5, 'bigger welcome', 'blip', { pitch: 'D5', gain: 0.1 }],
  [124, 'spitfire', 'tok', { pitch: 'G4', gain: 0.22 }], [126.5, 'happy flapping', 'bell', { pitch: 'G5', gain: 0.1 }],
  [134, 'end card', 'bell', { pitch: 'D6', gain: 0.12 }],
];

// ---------------------------------------------------------------- helpers for this film
function showground(ctx, u, o = {}) {
  K.sky(ctx); K.clouds(ctx, u, 150, 5); K.horizon(ctx, GY); K.ground(ctx, GY);
  if (o.fence !== false) K.fence(ctx, GY + 54);
}
function room(ctx, wall = WALL, floorY = 800) {
  M.fill(ctx, wall); ctx.fillStyle = FLOOR; ctx.fillRect(0, floorY, W, H - floorY);
  ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, floorY, W, 10);
}
// house rule: flat things have square corners
const rr = (ctx, x, y, w, h, r, col) => K.rr(ctx, x, y, w, h, 0, col);
const armMix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const walk = (u, on) => (on ? Math.sin(u * TAU * 1.5) : 0);
const popAt = (ctx, x, y, k, fn, rot = 0) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(k, k); fn(); ctx.restore(); };
const pillPop = (ctx, u, a, x, y, str, o = {}, b = 1e9) => {
  const k = K.pop(u, a) * (1 - E.inCubic(prog(u, b - 0.4, b)));
  popAt(ctx, x, y, k, () => K.pill(ctx, 0, 0, str, { align: 'center', size: 36, ...o }));
};
const poly = (ctx, pts, col) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
// a point and heading part-way along a polyline
function along(pts, p) {
  let total = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let left = total * clamp(p);
  for (let i = 1; i < pts.length; i++) {
    if (left <= seg[i - 1] || i === pts.length - 1) { const k = clamp(left / seg[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; }
    left -= seg[i - 1];
  }
  return [...pts[0], 0];
}
// Captain Charlie: the kit's kid, plus flying goggles pushed up on the forehead
function goggles(ctx, x, y, s, o = {}) {
  const sit = o.sit || 0, R = 50;
  const hy0 = -72 * (1 - sit) - (sit ? 18 : 0) + (o.bob || 0) - 96 - R * 0.78;
  ctx.save(); ctx.translate(x, y); ctx.scale(o.flip ? -s : s, s);
  ctx.translate(0, hy0 + R * 0.7); ctx.rotate(o.tilt || 0); ctx.translate(0, -R * 0.7);
  rr(ctx, -R * 0.94, -R * 0.7, R * 1.88, 13, 6, '#7A5A3A');
  for (const sg of [-1, 1]) { K.circ(ctx, sg * R * 0.37, -R * 0.6, R * 0.33, C.orange); K.circ(ctx, sg * R * 0.37, -R * 0.6, R * 0.21, C.skyTop); K.circ(ctx, sg * R * 0.37 - 4, -R * 0.6 - 4, R * 0.07, C.white); }
  rr(ctx, -8, -R * 0.66, 16, 8, 4, C.orange);
  ctx.restore();
}
const captain = (ctx, x, y, s, o = {}) => { K.kid(ctx, x, y, s, o); goggles(ctx, x, y, s, o); };

// The progress strip: six boxes, always in the same place, so you always know how much is left.
function strip(ctx, u) {
  const k = K.pop(u, 12.6, SPRING.gentle);
  if (k <= 0) return;
  const big = K.ease(u, 124.3, 125.6), sc = lerp(1, 1.5, big);
  const bw = 52, gap = 14, pad = 20, w = pad * 2 + 6 * bw + 5 * gap, h = 88;
  const x = lerp(60, (W - w * 1.5) / 2, big), y = lerp(36, 40, big) - (1 - k) * 180;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.save(); ctx.globalAlpha = 0.14; rr(ctx, 4, 8, w, h, 26, '#000'); ctx.restore();
  rr(ctx, 0, 0, w, h, 26, C.white);
  const cur = TICKS.findIndex((b) => u < b);
  for (let i = 0; i < 6; i++) {
    const cx = pad + i * (bw + gap) + bw / 2, cy = h / 2;
    const tk = K.pop(u, TICKS[i], SPRING.bouncy), done = u >= TICKS[i];
    const wave = big > 0 ? 1 + 0.12 * M.bump(u, 126 + i * 0.3, 0.6) : 1;
    const s = (done ? 0.85 + 0.15 * Math.min(1.15, tk) : 1) * wave;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    if (done) { rr(ctx, -bw / 2, -bw / 2, bw, bw, 14, C.teal); K.tick(ctx, -1, 1, 0.82, clamp(tk * 1.2), C.white, 9); }
    else {
      const on = i === cur && u >= 14;
      rr(ctx, -bw / 2, -bw / 2, bw, bw, 14, on ? C.teal : '#C9D2DA'); rr(ctx, -bw / 2 + 5, -bw / 2 + 5, bw - 10, bw - 10, 10, on ? C.tealSoft : C.white);
      M.text(ctx, String(i + 1), 0, 12, F(34, 800), on ? C.ink : C.greyDark, 'center');
    }
    ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- 0-8: the hook
const LOOP = (() => { const p = [[40, 270], [130, 270], [220, 270]]; for (let i = 1; i <= 24; i++) { const a = (i / 24) * TAU; p.push([220 + Math.sin(a) * 80, 190 + Math.cos(a) * 80]); } p.push([300, 262], [350, 225], [405, 150]); return p; })();
function poster(ctx, x, y, rot, title, fn) {
  ctx.save(); ctx.translate(x + 220, y + 165); ctx.rotate(rot); ctx.translate(-220, -165);
  ctx.save(); ctx.globalAlpha = 0.12; rr(ctx, 5, 9, 440, 330, 14, '#000'); ctx.restore();
  rr(ctx, 0, 0, 440, 330, 14, C.white);
  rr(ctx, 180, -14, 80, 28, 5, 'rgba(246,196,83,0.85)');
  M.text(ctx, title, 26, 62, F(40, 800), C.ink);
  fn(); ctx.restore();
}
function boxBack(ctx) { poly(ctx, [[-170, -150], [-250, -150], [-300, -300], [-228, -300]], CARD3); }
function boxFront(ctx, u) {
  rr(ctx, -240, -170, 480, 170, 14, CARD);
  poly(ctx, [[-240, -168], [-296, -212], [-282, -226], [-224, -170]], CARD3); poly(ctx, [[240, -168], [296, -212], [282, -226], [224, -170]], CARD3);
  rr(ctx, -240, -100, 480, 12, 0, 'rgba(255,255,255,0.22)');
  K.circ(ctx, -150, -112, 36, '#3D6AA8'); K.circ(ctx, -150, -112, 23, C.white); K.circ(ctx, -150, -112, 11, C.red);
  M.text(ctx, 'CAPTAIN', -96, -112 + 16, F(46, 800), '#7A5A3A', 'left', 2);
  poly(ctx, [[-150, -70], [180, -70], [136, -14], [-196, -14]], CARD2); rr(ctx, -196, -18, 334, 8, 4, 'rgba(0,0,0,0.1)');
  K.circ(ctx, 250, -92, 58, CARD2); K.circ(ctx, 250, -92, 58 - 10, '#F3E6CC');
  ctx.save(); ctx.translate(262, -92); ctx.rotate(u * 2.4);
  rr(ctx, -13, -112, 26, 224, 13, C.wood); ctx.restore();
  K.circ(ctx, 262, -92, 17, C.ink);
}
function sceneHook(ctx, u) {
  room(ctx);
  // on the wall: a display pilot's plan, and (soon) Charlie's
  const lp = K.ease(u, -2.5, 3.6, E.inOutSine);
  poster(ctx, 120, 170, -0.03, "A pilot's plan", () => {
    K.route(ctx, LOOP, lp, C.red, 7, [3, 17]);
    const [jx, jy, ja] = along(LOOP, lp); K.redJet(ctx, jx, jy, 0.62, ja);
  });
  const p2 = K.pop(u, 5, SPRING.gentle);
  if (p2 > 0) {
    ctx.save(); ctx.translate(0, (1 - p2) * -90); ctx.globalAlpha = Math.min(1, p2 * 1.4);
    poster(ctx, 1380, 170, 0.03, "Charlie's plan", () => {
      const R2 = [[50, 280], [130, 235], [215, 278], [300, 215], [385, 165]];
      K.route(ctx, R2, K.ease(u, 5.3, 7.2), C.teal, 8, [3, 19]);
      rr(ctx, 30, 262, 40, 34, 6, C.orange); poly(ctx, [[22, 266], [50, 238], [78, 266]], C.red);
      const pk = K.pop(u, 7.1); if (pk > 0) K.pin(ctx, 385, 165, 0.5 * Math.min(1.1, pk), C.teal);
      [[130, 205], [215, 246], [300, 184]].forEach(([tx, ty], i) => K.tick(ctx, tx, ty - 6, 0.6, prog(u, 5.9 + i * 0.4, 6.3 + i * 0.4), C.teal, 9));
    });
    ctx.restore();
  }
  // Charlie in the cardboard-box aeroplane
  const sway = Math.sin(u * 0.85 + 0.6) * 0.035;
  ctx.save(); ctx.translate(1000, 806); ctx.rotate(sway); ctx.scale(1.15, 1.15);
  ctx.save(); ctx.globalAlpha = 0.1; ctx.beginPath(); ctx.ellipse(0, 4, 300, 16, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  boxBack(ctx);
  const up = springU(u, 2.2, SPRING.gentle);
  const ticks = u < 5.6 ? 0 : Math.min(4, 1 + Math.floor((u - 5.6) / 0.45));
  captain(ctx, -30, -64, 1.3, { mood: u > 6 ? 'grin' : 'happy', look: u < 4.2 ? [-1, -0.5] : u < 5.2 ? [0, 0] : [1, -0.5], blinkU: u + 1,
    armL: [1.0 + Math.sin(u * 1.7) * 0.08, 0.5], armR: armMix([0.9, 1.3], [1.45, 1.55], up), hold: 'checklist', ticks });
  boxFront(ctx, u);
  ctx.restore();
  // a promise to the viewer, right at the start
  const ck = Math.min(springU(u, -0.3, SPRING.gentle), 1 - E.inCubic(prog(u, 4.2, 4.8)));
  if (ck > 0.01) { ctx.save(); ctx.translate(70, 86 - (1 - ck) * 200); K.pill(ctx, 0, 0, 'A calm video: no sudden sounds, no flashing', { size: 34, bg: C.teal, fg: C.white }); ctx.restore(); }
  K.caption(ctx, u, -0.9, 4.3, 'Every display pilot plans the flight.', { w: 1260, size: 72 });
  K.caption(ctx, u, 4.4, 7.7, 'Charlie is autistic. Charlie plans the airshow the same way.', { w: 1240 });
}

// ---------------------------------------------------------------- 8-14: the title and the list
function sceneTitle(ctx, u) {
  M.fill(ctx, C.paper);
  const f = F(132, 800);
  [['The', 8.0, 112, 262], ["Captain's", 8.25, 0, 262], ['Checklist', 8.6, 112, 408]].forEach(([w, a, x, y], i) => {
    ctx.font = f; if (i === 1) x = 112 + ctx.measureText('The').width + 38;
    const k = K.pop(u, a, SPRING.bouncy);
    if (k > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, y - 150, W, 180); ctx.clip(); M.text(ctx, w, x, y + (1 - k) * 190, f, i === 2 ? C.teal : C.ink); ctx.restore(); }
  });
  const sk = K.pop(u, 9.2, SPRING.gentle);
  if (sk > 0) M.text(ctx, 'Six checks for a calm airshow day', 116 - (1 - sk) * 60, 520, F(58, 700), C.ink);
  const lk = K.pop(u, 11.4, SPRING.gentle);
  if (lk > 0) M.text(ctx, 'for families, and for autistic adults', 116 - (1 - lk) * 60, 596, F(46, 500), C.greyDark);
  // the big clipboard
  const ck = K.pop(u, 8.1, SPRING.gentle);
  ctx.save(); ctx.translate(1450, 550 + (1 - ck) * 700); ctx.rotate(0.025 - (1 - ck) * 0.1);
  ctx.save(); ctx.globalAlpha = 0.14; rr(ctx, -352, -458, 720, 950, 40, '#000'); ctx.restore();
  rr(ctx, -360, -470, 720, 950, 40, C.wood); rr(ctx, -326, -420, 652, 866, 16, C.white);
  rr(ctx, -120, -500, 240, 84, 22, C.greyDark); rr(ctx, -70, -486, 140, 30, 12, '#8494A6');
  ITEMS.forEach((label, i) => {
    const k = K.pop(u, 9.5 + i * 0.4), y = -330 + i * 134;
    if (k <= 0) return;
    ctx.save(); ctx.translate(-250, y); ctx.scale(k, k); rr(ctx, -40, -40, 80, 80, 18, C.teal); rr(ctx, -31, -31, 62, 62, 12, C.white); M.text(ctx, String(i + 1), 0, 16, F(46, 800), C.greyDark, 'center'); ctx.restore();
    M.text(ctx, label, -180 + (1 - Math.min(1, k)) * 60, y + 19, F(56, 700), C.ink);
    if (i < 5) rr(ctx, -290, y + 64, 580, 4, 2, '#E6EAEE');
  });
  ctx.restore();
  const sal = springU(u, 10.4, SPRING.snappy);
  captain(ctx, 330, 1066, 1.42, { mood: 'happy', blinkU: u, armL: K.POSE.relaxed, armR: armMix(K.POSE.relaxed, [2.05, 1.25], sal), look: [1, -0.3] });
}

// ---------------------------------------------------------------- 14-26: 1 briefing
function polaroid(ctx, x, y, k, rot, label, fn) {
  popAt(ctx, x, y, k, () => {
    ctx.save(); ctx.globalAlpha = 0.12; rr(ctx, -125, -112, 258, 250, 12, '#000'); ctx.restore();
    rr(ctx, -130, -122, 260, 250, 12, C.white);
    ctx.save(); M.rrect(ctx, -112, -106, 224, 160, 0); ctx.clip(); ctx.fillStyle = C.skyTop; ctx.fillRect(-112, -106, 224, 160); ctx.fillStyle = C.grass; ctx.fillRect(-112, 14, 224, 40); fn(); ctx.restore();
    M.text(ctx, label, 0, 104, F(34, 700), C.ink, 'center');
  }, rot);
}
function item1(ctx, u) {
  room(ctx);
  K.sofa(ctx, 470, 800, 1);
  K.dad(ctx, 280, 716, 1.12, { sit: 1, mood: 'happy', look: [1, -0.4], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.hug });
  const pt = springU(u, 20.8, SPRING.gentle);
  const ko = { sit: 1, mood: u > 23.4 ? 'grin' : u > 17.8 && u < 20 ? 'wow' : 'happy', look: [1, -0.5], blinkU: u, armL: K.POSE.relaxed, armR: armMix(K.POSE.relaxed, K.POSE.point, pt) };
  captain(ctx, 510, 712, 1.3, ko);
  const tk = K.pop(u, 14.1, SPRING.gentle);
  const sx = M.springKeys(u, [[14, 0], [17.6, 1], [20.6, 2]], SPRING.gentle);
  K.tablet(ctx, 1140, 400 + (1 - tk) * 60, 1.25, 0.015, () => {
    // screen 0: the Spitfire video
    ctx.save(); ctx.translate((0 - sx) * 480, 0);
    ctx.fillStyle = C.grass; ctx.fillRect(-240, 90, 480, 60); K.cloud(ctx, -120, -70, 0.45); K.cloud(ctx, 150, -20, 0.35);
    const px = ((u * 110 + 200) % 760) - 380; K.rings(ctx, px - 20, -10, 80, C.teal, u, 2, 6); K.propPlane(ctx, px, -10, 0.5, -0.05, u);
    ctx.restore();
    // screen 1: the fast jet video
    ctx.save(); ctx.translate((1 - sx) * 480, 0);
    ctx.fillStyle = C.skyTop; ctx.fillRect(-240, -150, 480, 300); ctx.fillStyle = C.grass; ctx.fillRect(-240, 90, 480, 60); K.cloud(ctx, 110, -80, 0.4);
    const jx = (((u - 17.2) * 150) % 820) - 380; K.burst(ctx, jx - 70, -6, 58, SOFT, { n: 12, jag: 0.08, u }); K.jet(ctx, jx, -10, 0.46, -0.04, { burn: true, u });
    ctx.restore();
    // screen 2: the show map
    ctx.save(); ctx.translate((2 - sx) * 480, 0);
    ctx.fillStyle = '#DCEBD2'; ctx.fillRect(-240, -150, 480, 300);
    rr(ctx, -240, -132, 480, 40, 0, '#C9CFD3'); for (let i = 0; i < 6; i++) rr(ctx, -210 + i * 76, -115, 40, 6, 3, C.white);
    K.line(ctx, [[-190, -60], [200, -60]], C.white, 6);
    for (let i = 0; i < 26; i++) K.circ(ctx, -110 + hash01(i, 3) * 290, -44 + hash01(i, 4) * 36, 7, ['#9FB3C8', '#C7B5A6', '#C9B3C9', '#D6C59A'][i % 4]);
    rr(ctx, 20, 30, 50, 40, 8, C.pink); rr(ctx, 82, 30, 50, 40, 8, C.pink);
    const R = [[150, 120], [20, 100], [-110, 60], [-170, -30]];
    const rp = K.ease(u, 21.2, 23.4); K.route(ctx, R, rp, C.teal, 7, [3, 17]);
    const pk = K.pop(u, 23.4); if (pk > 0) K.pin(ctx, -170, -30, 0.6 * Math.min(1.1, pk), C.red);
    ctx.restore();
  });
  // what is on the screen
  const lab = u < 17.6 ? 'Video: the Spitfire' : u < 20.6 ? 'Video: the fast jet' : 'The show map';
  const la = u < 17.6 ? 14.6 : u < 20.6 ? 17.6 : 20.6;
  popAt(ctx, 1140, 122, K.pop(u, la), () => K.pill(ctx, 0, 0, lab, { align: 'center', size: 38 }));
  // photos of the site
  polaroid(ctx, 1700, 300, K.pop(u, 22.2), 0.05, 'The gate', () => { rr(ctx, -70, -50, 14, 86, 5, C.greyDark); rr(ctx, 56, -50, 14, 86, 5, C.greyDark); rr(ctx, -78, -66, 156, 34, 10, C.teal); });
  polaroid(ctx, 1690, 572, K.pop(u, 23.2), -0.04, 'The quiet space', () => K.tent(ctx, 0, 40, 0.36, C.tealSoft, C.teal));
  K.caption(ctx, u, 14.3, 25.5, 'Briefing: know what is coming.', { num: 1, sub: 'Watch the aircraft on video and look at the show map before the day.' });
}

// ---------------------------------------------------------------- 26-38: 2 kit check
const KIT = [
  ['Defenders', (ctx, u) => K.defendersIcon(ctx, 0, 10, 0.86)],
  ['Spare', (ctx, u) => K.defendersIcon(ctx, 0, 10, 0.8, C.orange)],
  ['Sunglasses', (ctx, u) => K.sunglasses(ctx, 0, 0, 1.25)],
  ['Fidget', (ctx, u) => K.fidget(ctx, 0, 0, 0.92, u * 0.5)],
  ['Snack', (ctx, u) => K.snack(ctx, 0, 6, 1.0)],
  ['Water', (ctx, u) => K.bottle(ctx, 0, 20, 0.86)],
  ['Teddy', (ctx, u) => K.teddy(ctx, 0, 36, 0.92)],
];
function item2(ctx, u) {
  room(ctx, '#E4EDE6', 756);
  const KX = 230, s = 1.55, PX = 1175;
  // a shelf to lay the kit out on
  rr(ctx, 450, 306, 1470, 16, 8, '#C8B595'); rr(ctx, 450, 322, 1470, 8, 4, 'rgba(0,0,0,0.08)');
  const headY = FEET - s * 207;
  const st = (i) => (i === 0 ? 27.4 : 29 + (i - 1) * 1.15);
  let lookX = 1;
  // items leave the shelf one at a time; they dip behind the bag as they drop in
  KIT.forEach(([label, draw], i) => {
    const x0 = 560 + i * 207, y0 = 232, a = st(i), d = i === 0 ? 1.2 : 0.95, p = K.ease(u, a, a + d, E.inOutCubic);
    const k = K.pop(u, 26.2 + i * 0.12, SPRING.gentle);
    M.text(ctx, label, x0, 380, F(40, 700), p >= 1 ? C.teal : C.ink, 'center');
    if (p >= 1) { K.circ(ctx, x0, y0, 44 * K.pop(u, a + d), C.tealSoft); K.tick(ctx, x0, y0, 1.1, prog(u, a + d, a + d + 0.4), C.teal, 11); }
    if (p > 0 && p < 1) lookX = (lerp(x0, PX, p) - KX) / 600;
    if (p >= 1 || k <= 0) return;
    const [tx, ty, ts] = i === 0 ? [KX, headY + 6, s * 0.8 / 0.86] : [PX, 500, 0.6];
    const x = lerp(x0, tx, p), y = lerp(y0, ty, p) - Math.sin(p * Math.PI) * (i === 0 ? 60 : 130) + (1 - k) * -40;
    ctx.save(); ctx.translate(x, y); ctx.scale(lerp(1, ts, p) * Math.min(1, k * 1.2), lerp(1, ts, p) * Math.min(1, k * 1.2)); ctx.rotate(Math.sin(p * Math.PI) * (i % 2 ? 0.25 : -0.25)); draw(ctx, u); ctx.restore();
  });
  // the backpack, with a little squash each time something lands
  let sq = 0; for (let i = 1; i < 7; i++) sq += M.bump(u, st(i) + 1.0, 0.35);
  ctx.save(); ctx.translate(PX, 756); ctx.scale(1 + 0.04 * sq, 1 - 0.05 * sq); K.backpack(ctx, 0, 0, 1.3, C.red); ctx.restore();
  const bt = K.pop(u, 36.1);
  if (bt > 0) { K.circ(ctx, PX, 560, 62 * bt, C.white); K.tick(ctx, PX, 560, 1.6, prog(u, 36.1, 36.6), C.teal, 12); }
  const on = u >= st(0) + 1.2;
  const n = KIT.filter((_, i) => u >= st(i) + 1).length;
  captain(ctx, KX, FEET, s, { mood: u > 36 ? 'grin' : 'happy', defenders: on ? K.DEF : null, blinkU: u, look: [clamp(lookX, -1, 1), -0.3], hold: 'checklist', ticks: Math.min(4, Math.floor(n * 4 / 7 + 0.01)),
    armL: K.POSE.relaxed, armR: [0.8, 1.4], bob: on ? -8 * M.bump(u, st(0) + 1.35, 0.3) : 0 });
  K.caption(ctx, u, 26.3, 37.5, 'Kit check: ear defenders first.', { num: 2, sub: 'Then a spare pair, sunglasses, a fidget, a snack, water and a comfort item.' });
}

// ---------------------------------------------------------------- 38-50: 3 flight plan
function item3(ctx, u) {
  room(ctx, WALL, 756);
  // the map of the showground, seen from above
  const bk = K.pop(u, 38.05, SPRING.gentle);
  ctx.save(); ctx.translate(0, (1 - bk) * -70);
  const bx = 640, by = 136, bw = 1224, bh = 574;
  ctx.save(); ctx.globalAlpha = 0.14; rr(ctx, bx + 8, by + 14, bw, bh, 30, '#000'); ctx.restore();
  rr(ctx, bx, by, bw, bh, 30, C.white);
  ctx.save(); M.rrect(ctx, bx + 14, by + 14, bw - 28, bh - 28, 0); ctx.clip();
  M.fill(ctx, '#DCEBD2');
  ctx.fillStyle = '#C9CFD3'; ctx.fillRect(bx, by + 14, bw, 52);
  for (let i = 0; i < 12; i++) rr(ctx, bx + 50 + i * 104, by + 37, 54, 7, 3, C.white);
  const tx = bx + 120 + ((u - 38) * 26) % 1000; K.propPlane(ctx, tx, by + 40, 0.2, 0, u);
  // path from the gate
  K.line(ctx, [[1250, 720], [1250, 648], [1080, 615], [900, 570], [790, 470], [752, 372]], '#EFE6D0', 34);
  // the crowd: busy in the middle, thin at the ends
  for (let i = 0; i < 74; i++) { const h = hash01(i, 21); const x = i < 66 ? 900 + h * 880 : 720 + h * 170; K.circ(ctx, x, 322 + hash01(i, 22) * 70, 12, ['#9FB3C8', '#C7B5A6', '#B7C9B0', '#C9B3C9', '#D6C59A'][i % 5]); }
  K.line(ctx, [[700, 292], [1830, 292]], C.white, 8);
  // loudspeakers on the fence
  const sk = K.pop(u, 40.4, SPRING.gentle);
  for (const px of [1060, 1310, 1560]) {
    if (sk > 0) for (const sg of [-1, 1]) K.zig(ctx, px + sg * 16, 318, sg * 78 * sk, 13, C.yellow, { u: u + px, n: 6, lw: 6, rot: sg * 0.5 });
    K.circ(ctx, px, 292, 19, C.greyDark); K.circ(ctx, px, 292, 8, C.grey);
  }
  // food court and gate
  for (let i = 0; i < 3; i++) { rr(ctx, 1130 + i * 92, 462, 74, 56, 12, C.pink); rr(ctx, 1130 + i * 92, 462, 74, 16, 8, C.red); }
  rr(ctx, 1196, 648, 16, 40, 6, C.ink); rr(ctx, 1288, 648, 16, 40, 6, C.ink); rr(ctx, 1196, 644, 108, 12, 6, C.teal);
  // the calm end, and the way to it
  const zk = K.pop(u, 45.6, SPRING.gentle);
  if (zk > 0) { ctx.save(); ctx.globalAlpha = 0.75 * Math.min(1, zk); K.circ(ctx, 752, 362, 78 * zk, C.tealSoft); ctx.restore(); }
  const R = [[1250, 640], [1080, 615], [900, 570], [790, 470], [752, 372]];
  const rp = K.ease(u, 42.6, 45.5);
  K.route(ctx, R, rp, C.teal, 9, [4, 24]);
  if (rp > 0 && rp < 1) { const [ex, ey] = along(R, rp); K.circ(ctx, ex + 16, ey + 12, 17, '#C96B6B'); K.circ(ctx, ex, ey, 19, C.teal); K.circ(ctx, ex, ey, 13, '#F2B441'); }
  ctx.restore();
  const pk = K.pop(u, 45.6); if (pk > 0) K.pin(ctx, 752, 366 - (1 - pk) * 60, 0.95 * Math.min(1.1, pk), C.red);
  pillPop(ctx, u, 38.8, 1384, 668, 'Gate', { size: 34 });
  pillPop(ctx, u, 39.6, 1600, 440, 'Crowd line', { size: 34 });
  pillPop(ctx, u, 40.4, 1310, 236, 'Loudspeakers', { size: 34, bg: C.yellow, fg: C.ink });
  pillPop(ctx, u, 41.2, 1268, 566, 'Food court', { size: 34, bg: C.pink, fg: C.ink });
  pillPop(ctx, u, 45.9, 800, 236, 'Our spot', { size: 38, bg: C.teal, fg: C.white });
  ctx.restore();
  // arrive when the gates open
  const ak = K.pop(u, 41.8, SPRING.gentle);
  if (ak > 0) {
    ctx.save(); ctx.translate(60 - (1 - ak) * 500, 190);
    rr(ctx, 0, 0, 520, 132, 30, C.white);
    K.circ(ctx, 66, 66, 46, C.teal); K.circ(ctx, 66, 66, 36, C.white);
    const hr = lerp(-0.5, 0, K.ease(u, 42, 43.2)); K.line(ctx, [[66, 66], [66 + Math.sin(hr) * 24, 66 - Math.cos(hr) * 24]], C.ink, 7); K.line(ctx, [[66, 66], [66 - 19, 66 + 2]], C.ink, 7);
    M.text(ctx, 'Arrive when the', 134, 58, F(40, 700), C.ink); M.text(ctx, 'gates open', 134, 106, F(40, 700), C.ink);
    ctx.restore();
  }
  const pt = springU(u, 42.4, SPRING.gentle);
  captain(ctx, 330, FEET, 1.5, { mood: u > 45.8 ? 'grin' : 'happy', defenders: K.DEF, blinkU: u, look: [1, -0.4], armL: K.POSE.relaxed, armR: armMix(K.POSE.relaxed, [1.75, 0.1], pt), hold: null });
  K.caption(ctx, u, 38.3, 49.5, 'Flight plan: arrive early, sit at the end of the line.', { num: 3, sub: 'The first hour is the calmest of the day.', size: 60, x: 440, w: 1400 });
}

// ---------------------------------------------------------------- 50-62: 4 holding pattern
const OVAL = (() => { const p = []; for (let i = 0; i <= 48; i++) { const a = (i / 48) * TAU; p.push([720 + Math.sin(a) * 310, 275 - Math.cos(a) * 112]); } return p; })();
function item4(ctx, u) {
  showground(ctx, u, { fence: false });
  // a holding pattern in the sky
  const op = K.ease(u, 50.2, 54.2, E.inOutSine);
  K.route(ctx, OVAL, op, C.teal, 8, [4, 24]);
  const lap = op < 1 ? op : 1 + (u - 54.2) / 7;
  const a = lap * TAU, px = 720 + Math.sin(a) * 310, py = 275 - Math.cos(a) * 112;
  const dir = Math.cos(a), far = (1 - Math.cos(a)) / 2;     // top of the oval = far side, flying right
  pillPop(ctx, u, 51.6, 720, 275, 'Pilots circle while they wait', { size: 36, bg: C.paper, fg: C.ink });
  ctx.save(); ctx.translate(px, py); ctx.scale((dir >= 0 ? 1 : -1) * Math.max(0.18, Math.abs(dir)), 1); K.propPlane(ctx, 0, 0, lerp(0.42, 0.52, far), 0, u); ctx.restore();
  // the busy end of the show, left behind
  const wp = K.ease(u, 52.6, 56.4), moving = wp > 0 && wp < 1;
  K.pebbles(ctx, -30, 400, 330, 250, 34, u, [C.grey, C.lilac, C.blue], { amt: lerp(1, 0.35, wp), size: lerp(20, 12, wp) });
  K.zig(ctx, 0, 470, lerp(300, 120, wp), lerp(30, 12, wp), C.yellow, { u, n: 7, lw: lerp(12, 7, wp) });
  // base: the quiet space
  K.tent(ctx, 1370, 772, 1.34, C.tealSoft, C.teal, 'Quiet space');
  const calm = K.ease(u, 56.2, 57.4);
  if (calm > 0) K.rings(ctx, 1370, 600, 170 * calm, C.teal, u * 0.6, 2, 6);
  const gp = K.ease(u, 52.2, 56.2);
  K.route(ctx, [[330, 778], [540, 792], [760, 784], [900, 772]], gp, C.teal, 9);
  const x = lerp(330, 1000, wp);
  K.dad(ctx, x - 200, FEET + 10, 1.16, { mood: 'happy', look: [1, 0], blinkU: u, blinkOff: 2, walk: walk(u + 0.4, moving), armL: K.POSE.relaxed, armR: K.POSE.relaxed, bob: moving ? Math.abs(Math.sin(u * TAU * 1.5 + 1)) * -5 : 0 });
  captain(ctx, x, FEET + 6, 1.42, { mood: wp < 0.15 ? 'worried' : wp < 0.95 ? 'neutral' : u > 58 ? 'happy' : 'calm', defenders: K.DEF, blinkU: u, walk: walk(u, moving), armL: K.POSE.relaxed, armR: K.POSE.relaxed, bob: moving ? Math.abs(Math.sin(u * TAU * 1.5)) * -6 : 0 });
  // Beth has her own base here
  K.beth(ctx, 1770, FEET + 14, 1.14, { mood: u > 57.6 ? 'happy' : 'calm', headphones: '#3A3F4B', hold: 'camera', armL: K.POSE.hold, armR: K.POSE.hold, blinkU: u, blinkOff: 3 });
  pillPop(ctx, u, 57.6, 1640, 180, 'Beth is autistic too', { size: 40, bg: '#6E5AA8', fg: C.white });
  pillPop(ctx, u, 58.6, 1545, 262, 'Quiet spaces are for adults as well', { size: 34, bg: C.paper, fg: C.ink });
  K.caption(ctx, u, 50.3, 61.5, 'Holding pattern: a quiet place to circle back to.', { num: 4, sub: 'No quiet space? Use the car, or a rug at the edge.', size: 60, w: 1560 });
}

// ---------------------------------------------------------------- 62-74: 5 radio calls
function item5(ctx, u) {
  showground(ctx, u);
  K.crowd(ctx, 1500, 1900, 735, 5, 0.9, 5, 1, u);
  // the loud bit: warned about, and soft and round with ear defenders on
  const jx = lerp(-500, 2500, prog(u, 69.2, 73.9));
  const br = kf(u, [[69.2, 0], [70.4, 180], [72.4, 200], [73.9, 120]], E.outCubic);
  if (br > 0) K.burst(ctx, clamp(jx - 120, 300, 1650), 226, br, SOFT, { n: 14, jag: 0.08, u });
  K.jet(ctx, jx, 212, 0.85, -0.04, { burn: true, u });
  const fl = K.ease(u, 64.2, 65.0) - K.ease(u, 66.6, 67.4), red = fl > 0.5;
  const up = springU(u, 66.2, SPRING.gentle) - springU(u, 68.6, SPRING.gentle);
  const loud = u > 69.6 && u < 73.6;
  K.dad(ctx, 1060, FEET + 8, 1.2, { mood: 'happy', look: loud ? [0, -1] : [-1, 0.2], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: armMix(K.POSE.relaxed, [2.5, 0.2], clamp(up)) });
  captain(ctx, 560, FEET, 1.5, { mood: red ? 'neutral' : loud ? 'grin' : 'happy', defenders: K.DEF, look: loud ? [0.4, -1] : [0.5, 0], blinkU: u, armL: K.POSE.relaxed, armR: [2.0, 0.5] });
  K.signalCard(ctx, 800, 350 + Math.sin(u * 1.2) * 6, 0.78, 0.05, fl);
  const lk = red ? K.pop(u, 64.7) : u < 66 ? K.pop(u, 62.9) : K.pop(u, 67.1);
  popAt(ctx, 800, 600, lk, () => K.pill(ctx, 0, 0, red ? 'I need a break' : 'I am OK', { align: 'center', bg: red ? C.red : C.sun, fg: C.white, size: 44 }));
  pillPop(ctx, u, 65.1, 1180, 232, 'Message received', { size: 38, bg: C.paper, fg: C.ink }, 66.6);
  K.loudChip(ctx, u, 70, { hold: 2.6 });
  K.caption(ctx, u, 62.3, 73.5, 'Radio calls: a signal that means I need a break.', { num: 5, sub: 'And a warning before every loud bit.', size: 60, w: 1560 });
}

// ---------------------------------------------------------------- 74-86: 6 return to base
function item6(ctx, u) {
  showground(ctx, u, { fence: false });
  K.crowd(ctx, 10, 300, 735, 5, 0.9, 7, 1, u);
  // the show is still on
  const px = lerp(-260, 1240, prog(u, 77.6, 87)), py = 236 + Math.sin(u * 0.7) * 20;
  K.rings(ctx, px - 50, py, 150, C.teal, u, 3, 9); K.propPlane(ctx, px, py, 0.7, -0.04 + Math.cos(u * 0.7) * 0.03, u);
  // the way out and the car
  rr(ctx, 1694, 430, 12, 250, 6, C.greyDark); rr(ctx, 1582, 400, 236, 92, 18, C.sun); M.text(ctx, 'Way out', 1700, 464, F(48, 800), C.white, 'center');
  K.car(ctx, 1700, 744, 0.62, C.blue);
  const rp = K.ease(u, 76.2, 78.6);
  K.route(ctx, [[700, 778], [940, 792], [1200, 786], [1450, 772]], rp, C.teal, 10);
  const wp = K.ease(u, 78, 83), moving = wp > 0 && wp < 1;
  const pt = springU(u, 75.2, SPRING.gentle) * (1 - K.ease(u, 77.4, 78.2));
  const x = lerp(520, 1260, wp);
  const done = wp >= 1;
  K.dad(ctx, x - 200 + 440 * K.ease(u, 78, 83), FEET + 8, 1.18, { mood: 'happy', look: [1, 0], blinkU: u, blinkOff: 2, walk: walk(u + 0.4, moving), armL: K.POSE.relaxed, armR: K.POSE.relaxed, bob: moving ? Math.abs(Math.sin(u * TAU * 1.5 + 1)) * -5 : 0 });
  captain(ctx, x, FEET, 1.45, { mood: done ? 'grin' : 'happy', defenders: K.DEF, blinkU: u, flip: done, look: done ? [0.6, -1] : [1, 0], walk: walk(u, moving), bob: moving ? Math.abs(Math.sin(u * TAU * 1.5)) * -6 : 0,
    armL: K.POSE.relaxed, armR: done ? [2.5 + Math.sin(u * 5) * 0.22, -0.2] : armMix(K.POSE.relaxed, [1.6, 0.1], pt) });
  pillPop(ctx, u, 75.4, 600, 262, "Captain's call: time to go", { size: 40, bg: C.paper, fg: C.ink }, 79.4);
  pillPop(ctx, u, 83.2, 1300, 250, 'Leaving happy', { size: 42, bg: C.teal, fg: C.white });
  K.caption(ctx, u, 74.3, 85.5, 'Return to base: the captain decides when.', { num: 6, sub: 'Leaving early is not failing. It is the plan working.', size: 60 });
}

// ---------------------------------------------------------------- 86-106: everyone nearby
const NEARBY = ['It is overload, not bad behaviour', 'Give space. Please do not stare or film', 'Skip the advice. A kind smile helps', 'Ask the grown-up: can I help?', 'Flapping, rocking and ear defenders are all fine'];
function sceneNearby(ctx, u) {
  K.sky(ctx); K.horizon(ctx, GY); K.ground(ctx, GY);
  const tk = K.pop(u, 86, SPRING.gentle);
  M.text(ctx, 'IF YOU ARE STANDING NEARBY', 520 - (1 - tk) * 80, 96, F(36, 800), C.teal, 'left', 3);
  M.text(ctx, 'Everyone nearby is part of the crew', 110 - (1 - tk) * 120, 226, F(84, 800), C.ink);
  // a hard moment, shown gently: too much noise, getting smaller as people help
  const calm = K.ease(u, 94, 100.5);
  K.pebbles(ctx, 170, 330, 330, 150, 26, u * 0.6, [C.grey, C.lilac, C.blue], { amt: lerp(1, 0.12, calm), size: lerp(17, 10, calm) });
  // two people nearby: they step back, look away, smile, and ask the grown-up
  const step = K.ease(u, 90.4, 91.8);
  K.person(ctx, 120 - 50 * step, FEET + 12, 1.02, { adult: true, skin: '#EBC7A6', hair: '#B9B2A8', hairStyle: 'bob', top: '#7FA6C9', bottom: '#4A5568', shoe: '#2B2B33',
    mood: step > 0.5 ? 'calm' : 'neutral', look: step > 0.5 ? [-1, 0] : [1, 0.4], blinkU: u, blinkOff: 1, armL: K.POSE.relaxed, armR: K.POSE.relaxed, tilt: -0.05 * step });
  const ask = springU(u, 95.6, SPRING.gentle) - springU(u, 98.6, SPRING.gentle);
  K.person(ctx, 700 + 50 * step, FEET + 12, 1.04, { adult: true, flip: true, skin: '#8E5E3F', hair: '#2B2622', hairStyle: 'curly', top: '#8DBB8C', bottom: '#3D4A63', shoe: '#2B2B33',
    mood: u > 93 ? 'happy' : 'neutral', look: [1, 0.2], blinkU: u, blinkOff: 3, armL: K.POSE.relaxed, armR: armMix(K.POSE.relaxed, [1.5, 1.2], clamp(ask)) });
  pillPop(ctx, u, 95.8, 690, 306, 'Can I help?', { size: 40, bg: C.paper, fg: C.ink }, 98.8);
  // Dad stays close; Charlie covers both ears, then slowly comes back
  const nod = M.bump(u, 96.6, 0.7);
  K.dad(ctx, 490, FEET + 8, 1.14, { flip: true, mood: 'calm', look: [1, 0.6], armL: K.POSE.relaxed, armR: K.POSE.relaxed, lean: -0.05, tilt: 0.06 * nod });
  const rel = K.ease(u, 99, 100.6);
  captain(ctx, 330, FEET, 1.18, { mood: u < 94 ? 'overwhelm' : u < 99.4 ? 'worried' : 'calm', defenders: K.DEF, blinkU: u, tilt: Math.sin(u * 1.9) * 0.05,
    armL: armMix(K.POSE.ears, K.POSE.relaxed, rel), armR: armMix(K.POSE.ears, K.POSE.relaxed, rel) });
  // the five points, one at a time
  const pk = K.pop(u, 87.2, SPRING.gentle);
  ctx.save(); ctx.translate((1 - pk) * 1100, 0);
  ctx.save(); ctx.globalAlpha = 0.14; rr(ctx, 868, 284, 1000, 566, 0, '#000'); ctx.restore();
  rr(ctx, 860, 270, 1000, 566, 0, C.paper);
  NEARBY.forEach((str, i) => {
    const a = 88 + i * 2.5, k = K.pop(u, a), y = 328 + i * 110;
    if (k <= 0) return;
    if (i) rr(ctx, 896, y - 55, 928, 3, 0, '#E3DAC6');
    K.circ(ctx, 928, y, 32 * Math.min(1.1, k), C.teal); K.tick(ctx, 928, y, 0.8, prog(u, a + 0.1, a + 0.6), C.white, 10);
    const f = F(52, 700), lines = K.wrap(ctx, str, f, 850);
    lines.forEach((l, j) => M.text(ctx, l, 984 + (1 - Math.min(1, k)) * 50, y + 18 - (lines.length - 1) * 27 + j * 54, f, C.ink));
  });
  ctx.restore();
  K.caption(ctx, u, 101.5, 105.5, 'Kindness costs nothing.', { w: 1000, size: 80 });
}

// ---------------------------------------------------------------- 106-124: the ground crew
const TILES = [
  ['A signposted quiet space', 'tent'], ['A warning before the loud bits', 'chip'], ['A sensory map and photo guide online', 'map'],
  ['Ear defenders to borrow or buy', 'def'], ['Staff who know the Sunflower lanyard', 'sun'], ['A quieter first hour', 'clock'],
];
function tileIcon(ctx, kind, u) {
  if (kind === 'tent') K.tent(ctx, 0, 56, 0.34, C.tealSoft, C.teal);
  if (kind === 'chip') { rr(ctx, -66, -30, 132, 60, 30, C.ink); for (let i = 0; i < 3; i++) K.circ(ctx, -34 + i * 34, 0, 11, ((u * 0.8) % 3) >= i ? C.orange : '#4B5E76'); }
  if (kind === 'map') { rr(ctx, -62, -50, 124, 100, 14, C.tealSoft); K.line(ctx, [[-62, 10], [-10, -8], [20, 20], [62, -6]], C.white, 8); K.pin(ctx, 18, 14, 0.62, C.red); }
  if (kind === 'def') K.defendersIcon(ctx, 0, 4, 0.82);
  if (kind === 'sun') K.sunflower(ctx, 0, 0, 1.05, u * 0.15);
  if (kind === 'clock') { K.circ(ctx, 0, 0, 58, C.teal); K.circ(ctx, 0, 0, 46, C.white); K.line(ctx, [[0, 0], [0, -30]], C.ink, 8); K.line(ctx, [[0, 0], [22, 10]], C.ink, 8); }
}
function sceneCrew(ctx, u) {
  M.fill(ctx, C.night);
  const tk = K.pop(u, 86, SPRING.gentle);
  M.text(ctx, 'FOR SHOW ORGANISERS', 520 - (1 - tk) * 80, 96, F(36, 800), C.yellow, 'left', 3);
  M.text(ctx, 'Every captain needs a ground crew', 110 - (1 - tk) * 120, 226, F(88, 800), C.paper);
  // one of the crew, waving from behind the tiles
  const sk = K.pop(u, 86.8, SPRING.gentle), wv = Math.sin(u * TAU * 0.75) * 0.22;
  ctx.save(); ctx.beginPath(); ctx.rect(1500, 0, 420, 300); ctx.clip();
  K.staff(ctx, 1740, 596 + (1 - sk) * 300, 1.12, { mood: 'happy', blinkU: u, lanyard: true, armL: K.POSE.relaxed, armR: [2.5 + wv, -0.25] });
  ctx.restore();
  TILES.forEach(([label, kind], i) => {
    const a = 88 + i * 2, k = K.pop(u, a, SPRING.bouncy);
    if (k <= 0) return;
    const col = i % 3, row = Math.floor(i / 3), w = 540, h = 270, x = 110 + col * 580, y = 290 + row * 296 + (1 - k) * 120;
    rr(ctx, x, y, w, h, 34, C.paper);
    K.circ(ctx, x + 116, y + h / 2, 90, '#EFE7D6');
    ctx.save(); ctx.translate(x + 116, y + h / 2); const s = 0.85 + 0.15 * Math.min(1.1, k); ctx.scale(s, s); tileIcon(ctx, kind, u); ctx.restore();
    const f = F(46, 700), lines = K.wrap(ctx, label, f, w - 250);
    lines.forEach((l, j) => M.text(ctx, l, x + 232, y + h / 2 + 16 - (lines.length - 1) * 27 + j * 54, f, C.ink));
  });
  const bk = K.pop(u, 100.5, SPRING.gentle);
  if (bk > 0) M.text(ctx, 'Small changes. A bigger welcome.', 112 - (1 - bk) * 80, 990, F(64, 700), C.tealSoft);
}

// ---------------------------------------------------------------- 124-133: cleared for a great day
function scenePayoff(ctx, u) {
  showground(ctx, u);
  K.crowd(ctx, 20, 380, 735, 5, 0.9, 9, 1, u);
  const px = lerp(-350, 2300, prog(u, 104.2, 113.5)), py = 232 + Math.sin(u * 0.7) * 12;
  K.rings(ctx, px - 50, py, 125, C.teal, u, 3, 10);
  K.propPlane(ctx, px, py, 0.7, -0.05 + Math.cos(u * 0.7) * 0.03, u);
  K.beth(ctx, 1400, FEET + 12, 1.18, { mood: 'happy', headphones: '#3A3F4B', hold: 'camera', armL: [1.7, 1.2], armR: [1.7, 1.2], look: [0, -1], tilt: -0.06 });
  K.dad(ctx, 920, FEET + 8, 1.2, { mood: 'happy', look: [0, -1], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.relaxed, tilt: -0.04 });
  const on = u > 106.5;
  const fl = on ? K.flap(u, 3) : { armL: K.POSE.relaxed, armR: K.POSE.relaxed };
  const hop = on ? Math.abs(Math.sin(u * TAU * 1.5)) * -14 : 0;
  captain(ctx, 660, FEET + hop, 1.55, { mood: on ? 'grin' : 'happy', defenders: K.DEF, look: [0.3, -1], blinkU: u, ...fl });
  pillPop(ctx, u, 107.4, 300, 430, 'Happy flapping welcome', { size: 36, bg: C.paper, fg: C.ink });
  K.caption(ctx, u, 105.2, 113.2, 'Cleared for a great day.', { w: 1000, size: 80 });
}

// ---------------------------------------------------------------- the cut
const SCENES = [[0, sceneHook], [8, sceneTitle, 'circle'], [14, item1], [26, item2], [38, item3], [50, item4], [62, item5], [74, item6], [86, sceneNearby], [106, (ctx, u) => sceneCrew(ctx, u - 20)], [124, (ctx, u) => scenePayoff(ctx, u - 20)]];
const PUSH = 0.9;
M.film({
  fonts: K.FONTS,
  images: { logo: '../shared/logo.png' },
  hits: HITS,
  samples: 6,
  draw(ctx, u, t, IMG) {
    let i = 0; while (i + 1 < SCENES.length && u >= SCENES[i + 1][0] - PUSH) i++;
    const [a, fn, kind] = SCENES[i];
    if (i > 0 && u < a) {            // arriving: a page push, both shots on screen
      const p = E.inOutCubic(prog(u, a - PUSH, a));
      if (kind === 'circle') {
        SCENES[i - 1][1](ctx, u);
        ctx.save(); ctx.beginPath(); ctx.arc(1000, 520, p * 1700, 0, TAU); ctx.clip(); fn(ctx, u); ctx.restore();
      } else {
        ctx.save(); ctx.translate(-p * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); SCENES[i - 1][1](ctx, u); ctx.restore();
        ctx.save(); ctx.translate((1 - p) * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); fn(ctx, u); ctx.restore();
      }
    } else fn(ctx, u);
    strip(ctx, u);
    K.endCard(ctx, u, 132.9, IMG, { cx: 650, cy: 500 });
  },
});
