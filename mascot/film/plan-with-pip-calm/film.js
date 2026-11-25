// Plan it with Pip, in the look of "The Captain's Checklist" (videos/ on claude/quirky-fermi-uygguc, whose shared
// kit this uses): soft colours, cream caption cards, a six-box progress strip, Charlie and Dad. Pip, the site's
// mascot, plans the day and talks the family through it in speech bubbles. 118 beats at 80 bpm (88.5 s), 16x9.
// Every planning tip comes from plan-your-2027-airshow.html. Pure function of time: window.seek(t) paints frame t.
import * as K from './shared/kit.js';
const { M, C, F } = K;
const { W, H, TAU, clamp, lerp, prog, E, springU, SPRING, hash01 } = M;

const GY = 560, FEET = 750;
const WALL = '#EFE6D6', FLOOR = '#E3D6C0';
const ITEMS = ['Pick your shows', 'Budget and book', 'Plan the journey', 'Pack the kit', 'Final checks', 'Show day'];
const S0 = 16, STEP = 14;                          // item i runs from S0 + i * STEP for STEP beats
const at0 = (i) => S0 + i * STEP;
const TICKS = ITEMS.map((_, i) => at0(i) + STEP - 1.4);
const PAY = at0(6), END = PAY + 8;                 // 100, 108

// Soft, low sounds only, as in the calm films.
const HITS = [
  [0.3, 'caption 1', 'tok', { pitch: 'G4', gain: 0.2 }], [2.0, 'Pip lands', 'pop', { pitch: 'D5', to: 'G4', gain: 0.14 }],
  [4.6, 'caption 2', 'tok', { pitch: 'B4', gain: 0.2 }],
  [9, 'title', 'tok', { pitch: 'G4', gain: 0.25 }],
  ...ITEMS.map((_, i) => [10.6 + i * 0.45, `row ${i + 1}`, 'blip', { pitch: ['G5', 'A5', 'B5', 'D6', 'E6', 'G6'][i], gain: 0.1 }]),
  ...ITEMS.map((_, i) => [at0(i) + 0.3, `item ${i + 1}`, 'tok', { pitch: ['G4', 'A4', 'B4', 'G4', 'A4', 'B4'][i], gain: 0.22 }]),
  ...TICKS.map((b, i) => [b, `tick ${i + 1}`, 'bell', { pitch: ['G5', 'A5', 'B5', 'D6', 'E6', 'G6'][i], gain: 0.09 }]),
  [at0(0) + 5, 'main show', 'pop', { pitch: 'G4', gain: 0.16 }], [at0(0) + 6.4, 'backup', 'pop', { pitch: 'B4', gain: 0.16 }], [at0(0) + 9, 'reminder', 'blip', { pitch: 'D5', gain: 0.1 }],
  ...[0, 1, 2].map((i) => [at0(1) + 2.6 + i * 1.2, `cost ${i + 1}`, 'blip', { pitch: ['G5', 'A5', 'B5'][i], gain: 0.1 }]),
  [at0(1) + 7, 'early bird', 'pop', { pitch: 'D5', gain: 0.16 }], [at0(1) + 9.4, 'bed', 'pop', { pitch: 'G4', gain: 0.14 }],
  [at0(2) + 7.6, 'arrived', 'pop', { pitch: 'G4', gain: 0.16 }],
  ...[0, 1, 2, 3, 4].map((i) => [at0(3) + 3.4 + i * 1.15, `packed ${i + 1}`, 'blip', { pitch: ['G5', 'A5', 'B5', 'D6', 'E6'][i], gain: 0.1 }]),
  [at0(4) + 3, 'forecast', 'tick', { gain: 0.14 }], [at0(4) + 6, 'tickets', 'tick', { gain: 0.14 }], [at0(4) + 8.6, 'bag down', 'pop', { pitch: 'G4', gain: 0.16 }],
  [at0(5) + 8, 'the jet', 'whoosh', { len: 3.2, from: 140, to: 380, gain: 0.12, peak: 0.5 }],
  [PAY, 'mustang', 'tok', { pitch: 'G4', gain: 0.22 }], [PAY + 2.4, 'happy', 'bell', { pitch: 'G5', gain: 0.1 }],
  [END, 'end card', 'bell', { pitch: 'D6', gain: 0.12 }], [END + 2.4, 'Pip waves', 'pop', { pitch: 'D5', gain: 0.12 }],
];

// ---------------------------------------------------------------- helpers
const rr = (ctx, x, y, w, h, r, col) => K.rr(ctx, x, y, w, h, 0, col);   // house rule: square corners
const armMix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const popAt = (ctx, x, y, k, fn, rot = 0) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(k, k); fn(); ctx.restore(); };
const pillPop = (ctx, u, a, x, y, str, o = {}) => popAt(ctx, x, y, K.pop(u, a), () => K.pill(ctx, 0, 0, str, { align: 'center', size: 36, ...o }));
function room(ctx, wall = WALL, floorY = 800) { M.fill(ctx, wall); ctx.fillStyle = FLOOR; ctx.fillRect(0, floorY, W, H - floorY); ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, floorY, W, 10); }
function showground(ctx, u) { K.sky(ctx); K.clouds(ctx, u, 150, 5); K.horizon(ctx, GY); K.ground(ctx, GY); K.fence(ctx, GY + 54); }
function along(pts, p) {
  let total = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let left = total * clamp(p);
  for (let i = 1; i < pts.length; i++) {
    if (left <= seg[i - 1] || i === pts.length - 1) { const k = clamp(left / seg[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; }
    left -= seg[i - 1];
  }
  return pts[0];
}
const charlie = (ctx, x, y, s, o = {}) => K.kid(ctx, x, y, s, o);

// ---------------------------------------------------------------- Pip (the site's mascot, from mascot/mascot.js)
let IMGS = {};
// size = Pip's height from tail to wheels; (x, y) = where the wheels touch the ground
function pip(ctx, pose, x, y, size, u, o = {}) {
  let im = IMGS['pip_' + pose];
  if (pose === 'hello') im = IMGS['pip_hello' + (Math.floor(((u * 1.2) % 1) * 6) % 6)];
  if (pose === 'rest' && ((u + (o.seed || 0)) % 3.6) > 3.45) im = IMGS.pip_blink;
  if (!im) return;
  const s = size / 0.62, bob = o.still ? 0 : Math.sin(u * 1.6) * size * 0.015;
  ctx.save(); ctx.translate(x, y + bob);
  if (o.flip) ctx.scale(-1, 1);
  if (o.squash) ctx.scale(1 + o.squash, 1 - o.squash);
  ctx.drawImage(im, -s / 2, -s * 0.936, s, s);
  ctx.restore();
}
function pipFly(ctx, x, y, w, rot) { const im = IMGS.pip_fly; if (!im) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(im, -w / 2, -w / 2, w, w); ctx.restore(); }

// Pip's speech bubble: a square box with a straight tail. (x, y) = top left; (tx, ty) = the tip of the tail, by Pip.
function say(ctx, u, a, b, str, x, y, tx, ty, o = {}) {
  if (u < a || u > b) return;
  const k = K.pop(u, a, SPRING.bouncy), out = E.inCubic(prog(u, b - 0.35, b));
  const sc = Math.max(0.01, k * (1 - out));
  const size = o.size || 46, f = F(size, 700), w = o.w || 560, pad = 30;
  const lines = K.wrap(ctx, str, f, w - pad * 2);
  const h = pad * 2 + 30 + lines.length * size * 1.18;
  const cx = clamp(tx, x + 60, x + w - 60);
  ctx.save(); ctx.translate(tx, ty); ctx.scale(sc, sc); ctx.translate(-tx, -ty);
  ctx.save(); ctx.globalAlpha *= 0.14; rr(ctx, x + 6, y + 10, w, h, 0, '#000'); ctx.restore();
  ctx.beginPath(); ctx.moveTo(cx - 34, y + h - 2); ctx.lineTo(tx, ty); ctx.lineTo(cx + 34, y + h - 2); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill();
  rr(ctx, x, y, w, h, 0, C.white); rr(ctx, x, y, w, 10, 0, '#23908C');
  M.text(ctx, 'Pip', x + pad, y + pad + 22, F(30, 800), '#23908C');
  lines.forEach((l, i) => M.text(ctx, l, x + pad, y + pad + 30 + (i + 0.85) * size * 1.18, f, C.ink));
  ctx.restore();
}

// The progress strip: six boxes, always in the same place, so you always know how much is left.
function strip(ctx, u) {
  const k = K.pop(u, 14.6, SPRING.gentle);
  if (k <= 0 || u > END + 0.4) return;
  const big = K.ease(u, PAY + 0.3, PAY + 1.6), sc = lerp(1, 1.5, big);
  const bw = 52, gap = 14, pad = 20, w = pad * 2 + 6 * bw + 5 * gap, h = 88;
  const x = lerp(60, (W - w * 1.5) / 2, big), y = lerp(36, 40, big) - (1 - k) * 180;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.save(); ctx.globalAlpha = 0.14; rr(ctx, 4, 8, w, h, 0, '#000'); ctx.restore();
  rr(ctx, 0, 0, w, h, 0, C.white);
  const cur = TICKS.findIndex((b) => u < b);
  for (let i = 0; i < 6; i++) {
    const cx = pad + i * (bw + gap) + bw / 2, cy = h / 2;
    const tk = K.pop(u, TICKS[i], SPRING.bouncy), done = u >= TICKS[i];
    const wave = big > 0 ? 1 + 0.12 * M.bump(u, PAY + 2 + i * 0.3, 0.6) : 1;
    const s = (done ? 0.85 + 0.15 * Math.min(1.15, tk) : 1) * wave;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    if (done) { rr(ctx, -bw / 2, -bw / 2, bw, bw, 0, C.teal); K.tick(ctx, -1, 1, 0.82, clamp(tk * 1.2), C.white, 9); }
    else {
      const on = i === cur && u >= S0;
      rr(ctx, -bw / 2, -bw / 2, bw, bw, 0, on ? C.teal : '#C9D2DA'); rr(ctx, -bw / 2 + 5, -bw / 2 + 5, bw - 10, bw - 10, 0, on ? C.tealSoft : C.white);
      M.text(ctx, String(i + 1), 0, 12, F(34, 800), on ? C.ink : C.greyDark, 'center');
    }
    ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- 0-9: the hook
function sceneHook(ctx, u) {
  room(ctx);
  // a 2027 calendar on the wall, and a window
  rr(ctx, 1300, 150, 380, 330, 0, C.white); rr(ctx, 1322, 172, 336, 286, 0, C.skyTop); K.cloud(ctx, 1480, 330, 0.6); ctx.fillStyle = C.white; ctx.fillRect(1484, 172, 12, 286);
  rr(ctx, 260, 170, 420, 330, 0, C.white); rr(ctx, 260, 170, 420, 70, 0, C.teal); M.text(ctx, '2027', 470, 222, F(52, 800), C.white, 'center');
  for (let i = 0; i < 20; i++) rr(ctx, 290 + (i % 5) * 76, 266 + Math.floor(i / 5) * 54, 56, 38, 0, i === 13 ? C.pink : '#EEF1F4');
  K.sofa(ctx, 900, 800, 1);
  K.dad(ctx, 720, 716, 1.12, { sit: 1, mood: 'happy', look: [1, -0.4], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.hug });
  const wow = u > 1.4 && u < 3.4;
  charlie(ctx, 960, 712, 1.3, { sit: 1, mood: wow ? 'wow' : 'happy', look: u < 2.6 ? [-1, -0.6] : [1, -0.2], blinkU: u, armL: K.POSE.relaxed, armR: u > 2.4 ? [2.5 + Math.sin(u * 5) * 0.2, -0.25] : K.POSE.relaxed });
  // Pip flies in through the room and lands on the floor beside the sofa
  const fl = prog(u, -0.4, 2.0);
  if (fl < 1) { const q = E.outCubic(fl); pipFly(ctx, lerp(-200, 1320, q), lerp(260, 640, q) - Math.sin(q * Math.PI) * 160, 300, (1 - q) * 0.3); }
  else pip(ctx, u < 5 ? 'hello' : 'point', 1380, 800, 300, u, { squash: Math.exp(-6 * (u - 2)) * Math.cos((u - 2) * 9) * 0.12 });
  say(ctx, u, 2.4, 5.4, "Hello! I'm Pip.", 1180, 150, 1380, 470);
  say(ctx, u, 5.6, 8.7, "Let's plan your airshow day together!", 1180, 150, 1380, 470);
  K.caption(ctx, u, -0.9, 4.4, 'A new airshow season is on its way.', { w: 1260, size: 72 });
  K.caption(ctx, u, 4.5, 8.7, 'Meet Pip, your airshow planner.', { w: 1240 });
}

// ---------------------------------------------------------------- 9-16: the title and the list
function sceneTitle(ctx, u) {
  M.fill(ctx, C.paper);
  const f = F(132, 800);
  [['Plan it', 8.6, 112, 262], ['with', 8.85, 0, 262], ['Pip', 9.2, 112, 408]].forEach(([w, a, x, y], i) => {
    ctx.font = f; if (i === 1) x = 112 + ctx.measureText('Plan it').width + 38;
    const k = K.pop(u, a, SPRING.bouncy);
    if (k > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, y - 150, W, 180); ctx.clip(); M.text(ctx, w, x, y + (1 - k) * 190, f, i === 2 ? C.teal : C.ink); ctx.restore(); }
  });
  const sk = K.pop(u, 9.8, SPRING.gentle);
  if (sk > 0) M.text(ctx, 'Six steps to a brilliant airshow day', 116 - (1 - sk) * 60, 520, F(58, 700), C.ink);
  const lk = K.pop(u, 12.4, SPRING.gentle);
  if (lk > 0) {
    ctx.font = F(52, 800); let x = 116 - (1 - lk) * 60;
    [['Plan. ', '#23908C'], ['Inform. ', '#1F4E8C'], ['Prepare.', '#D74949']].forEach(([w, c]) => { M.text(ctx, w, x, 600, F(52, 800), c); x += ctx.measureText(w).width; });
  }
  const ck = K.pop(u, 8.3, SPRING.gentle);
  ctx.save(); ctx.translate(1450, 550 + (1 - ck) * 700); ctx.rotate(0.025 - (1 - ck) * 0.1);
  ctx.save(); ctx.globalAlpha = 0.14; rr(ctx, -352, -458, 720, 950, 0, '#000'); ctx.restore();
  rr(ctx, -360, -470, 720, 950, 0, C.wood); rr(ctx, -326, -420, 652, 866, 0, C.white);
  rr(ctx, -120, -500, 240, 84, 0, C.greyDark); rr(ctx, -70, -486, 140, 30, 0, '#8494A6');
  ITEMS.forEach((label, i) => {
    const k = K.pop(u, 10.6 + i * 0.45), y = -330 + i * 134;
    if (k <= 0) return;
    ctx.save(); ctx.translate(-250, y); ctx.scale(k, k); rr(ctx, -40, -40, 80, 80, 0, C.teal); rr(ctx, -31, -31, 62, 62, 0, C.white); M.text(ctx, String(i + 1), 0, 16, F(46, 800), C.greyDark, 'center'); ctx.restore();
    M.text(ctx, label, -180 + (1 - Math.min(1, k)) * 60, y + 19, F(56, 700), C.ink);
    if (i < 5) rr(ctx, -290, y + 64, 580, 4, 0, '#E6EAEE');
  });
  ctx.restore();
  const pk = K.pop(u, 9.6, SPRING.gentle);
  if (pk > 0) pip(ctx, u < 12.8 ? 'cheer' : 'tip', 360, 1020 + (1 - pk) * 400, 320, u);
  say(ctx, u, 11.2, 15.4, 'Six steps. Let me show you!', 560, 660, 470, 820, { w: 520 });
}

// ---------------------------------------------------------------- 1: pick your shows
function item1(ctx, u) {
  const a = at0(0); room(ctx);
  // the season on a big wall calendar
  const ck = K.pop(u, a + 0.2, SPRING.gentle);
  ctx.save(); ctx.translate(0, (1 - ck) * -80);
  const bx = 700, by = 120, bw = 1120, bh = 560;
  ctx.save(); ctx.globalAlpha = 0.14; rr(ctx, bx + 8, by + 14, bw, bh, 0, '#000'); ctx.restore();
  rr(ctx, bx, by, bw, bh, 0, C.white); rr(ctx, bx, by, bw, 90, 0, C.ink); M.text(ctx, 'The 2027 season', bx + 40, by + 62, F(52, 800), C.paper);
  const MO = ['May', 'June', 'July', 'August', 'September', 'October'];
  MO.forEach((m, i) => {
    const x = bx + 40 + (i % 3) * 356, y = by + 120 + Math.floor(i / 3) * 210;
    rr(ctx, x, y, 324, 186, 0, '#F4F6F8'); M.text(ctx, m, x + 24, y + 52, F(44, 700), C.ink);
    for (let d = 0; d < 14; d++) rr(ctx, x + 24 + (d % 7) * 42, y + 82 + Math.floor(d / 7) * 42, 30, 30, 0, '#E1E6EB');
  });
  const ring = (i, k, col) => { if (k <= 0) return; const x = bx + 40 + (i % 3) * 356, y = by + 120 + Math.floor(i / 3) * 210; ctx.save(); ctx.translate(x + 162, y + 93); ctx.scale(k, k); ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.strokeRect(-172, -103, 344, 206); ctx.restore(); };
  ring(2, K.pop(u, a + 5, SPRING.bouncy), C.red);
  ring(4, K.pop(u, a + 6.4, SPRING.bouncy), C.teal);
  ctx.restore();
  pillPop(ctx, u, a + 5.2, bx + 40 + 2 * 356 + 162, by + 104, 'Main show', { bg: C.red });
  pillPop(ctx, u, a + 6.6, bx + 40 + 1 * 356 + 162, by + 314, 'Backup', { bg: C.teal });
  // a reminder on the phone: when the tickets go on sale
  const pt = springU(u, a + 4.6, SPRING.gentle);
  charlie(ctx, 220, FEET, 1.4, { mood: u > a + 5.2 ? 'grin' : 'happy', blinkU: u, look: [1, -0.5], armL: K.POSE.relaxed, armR: armMix(K.POSE.relaxed, [1.75, 0.1], pt) });
  pip(ctx, u < a + 9 ? 'point' : 'tip', 520, FEET, 270, u);
  say(ctx, u, a + 1.2, a + 4.8, "First, let's pick a main show.", 60, 160, 500, 470);
  say(ctx, u, a + 5, a + 8.6, '...and a backup, just in case!', 60, 160, 500, 470);
  say(ctx, u, a + 8.8, a + 13.3, 'Pop the ticket sale dates in your calendar.', 60, 160, 500, 470);
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, 'Pick your shows: a main show and a backup.', { num: 1, sub: 'Put the dates the tickets go on sale in your calendar.' });
}

// ---------------------------------------------------------------- 2: budget and book
function item2(ctx, u) {
  const a = at0(1); room(ctx, '#E4EDE6', 800);
  K.sofa(ctx, 470, 800, 1);
  K.dad(ctx, 360, 716, 1.12, { sit: 1, mood: 'happy', look: [1, -0.4], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.hug });
  charlie(ctx, 590, 712, 1.3, { sit: 1, mood: u > a + 7.2 ? 'grin' : 'happy', look: [1, -0.5], blinkU: u, armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  const tk = K.pop(u, a + 0.2, SPRING.gentle);
  K.tablet(ctx, 1180, 390 + (1 - tk) * 60, 1.25, 0.015, () => {
    ctx.fillStyle = C.paper; ctx.fillRect(-240, -150, 480, 300);
    M.text(ctx, 'The whole day', -210, -100, F(40, 800), C.ink);
    [['Tickets', 0.45, C.teal], ['Travel', 0.3, C.blue], ['Food', 0.25, C.orange]].forEach(([l, v, col], i) => {
      const k = K.ease(u, a + 2.6 + i * 1.2, a + 3.4 + i * 1.2);
      M.text(ctx, l, -210, -36 + i * 64, F(34, 700), C.ink);
      rr(ctx, -60, -64 + i * 64, 270, 36, 0, '#E1E6EB'); if (k > 0) rr(ctx, -60, -64 + i * 64, 270 * v / 0.45 * k, 36, 0, col);
    });
  });
  // an early bird ticket, and somewhere to sleep
  const ek = K.pop(u, a + 7, SPRING.bouncy);
  popAt(ctx, 1700, 520, ek, () => {
    rr(ctx, -160, -86, 320, 172, 0, C.yellow); ctx.setLineDash([10, 10]); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(70, -86); ctx.lineTo(70, 86); ctx.stroke(); ctx.setLineDash([]);
    M.text(ctx, 'Early', -45, -8, F(48, 800), C.ink, 'center'); M.text(ctx, 'bird', -45, 44, F(48, 800), C.ink, 'center'); M.text(ctx, '2027', 116, 16, F(30, 800), C.ink, 'center');
  }, -0.06);
  const bk = K.pop(u, a + 9.4, SPRING.gentle);
  popAt(ctx, 1700, 300, bk, () => { rr(ctx, -150, -100, 300, 220, 0, C.white); K.tent(ctx, 0, 70, 0.5, C.tealSoft, C.teal); M.text(ctx, 'Book the bed early', 0, 106, F(30, 700), C.ink, 'center'); }, 0.04);
  pip(ctx, u < a + 7 ? 'point' : 'cheer', 150, 800, 260, u, { seed: 1 });
  say(ctx, u, a + 1.2, a + 6.6, "Let's add up the whole day: tickets, travel and food.", 60, 160, 170, 520, { w: 600 });
  say(ctx, u, a + 6.8, a + 9.6, 'Early bird tickets save the most!', 60, 160, 170, 520, { w: 600 });
  say(ctx, u, a + 9.8, a + 13.3, 'Staying over? Book the bed early.', 60, 160, 170, 520, { w: 600 });
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, 'Budget and book: work out the whole day cost.', { num: 2, sub: 'Early bird tickets save the most. Book the bed before the ticket rush.' });
}

// ---------------------------------------------------------------- 3: plan the journey
function item3(ctx, u) {
  const a = at0(2); room(ctx, WALL, 756);
  const bk = K.pop(u, a + 0.05, SPRING.gentle);
  ctx.save(); ctx.translate(0, (1 - bk) * -70);
  const bx = 640, by = 136, bw = 1224, bh = 574;
  ctx.save(); ctx.globalAlpha = 0.14; rr(ctx, bx + 8, by + 14, bw, bh, 0, '#000'); ctx.restore();
  rr(ctx, bx, by, bw, bh, 0, C.white);
  ctx.save(); ctx.beginPath(); ctx.rect(bx + 14, by + 14, bw - 28, bh - 28); ctx.clip();
  ctx.fillStyle = '#DCEBD2'; ctx.fillRect(bx, by, bw, bh);
  // the road, with a queue of cars
  K.line(ctx, [[bx, 600], [1400, 600], [1640, 520], [bx + bw, 520]], '#C9CFD3', 46);
  for (let i = 0; i < 7; i++) { const x = 900 + i * 70 + Math.sin(u * 0.8 + i) * 2; rr(ctx, x - 24, 586, 48, 28, 0, [C.red, C.blue, C.yellow, C.teal, C.grey, C.red, C.blue][i]); }
  // the railway, and the shuttle bus road to the gate
  K.line(ctx, [[bx, 300], [1500, 300]], C.greyDark, 10); for (let x = bx + 20; x < 1500; x += 40) rr(ctx, x, 292, 8, 16, 0, C.greyDark);
  K.line(ctx, [[1500, 300], [1660, 300], [1700, 420]], '#EFE6D0', 30);
  // home, station, show
  rr(ctx, 700, 250, 90, 90, 0, C.orange); K.line(ctx, [[690, 254], [745, 210], [800, 254]], C.red, 14);
  rr(ctx, 1450, 236, 100, 40, 0, C.ink); M.text(ctx, 'Station', 1500, 228, F(30, 800), C.ink, 'center');
  rr(ctx, 1640, 410, 130, 90, 0, C.tealSoft); rr(ctx, 1640, 410, 130, 22, 0, C.teal);
  const R = [[790, 300], [1500, 300], [1660, 300], [1700, 420]];
  const rp = K.ease(u, a + 2.4, a + 7.4);
  K.route(ctx, R, rp, C.teal, 9, [4, 24]);
  if (rp > 0 && rp < 1) { const [ex, ey] = along(R, rp); K.circ(ctx, ex, ey, 19, C.teal); K.circ(ctx, ex, ey, 12, '#F2B441'); }
  ctx.restore();
  const pk = K.pop(u, a + 7.6); if (pk > 0) K.pin(ctx, 1705, 410 - (1 - pk) * 60, 0.9 * Math.min(1.1, pk), C.red);
  pillPop(ctx, u, a + 2.6, 1100, 250, 'Train', { size: 34, bg: C.teal });
  pillPop(ctx, u, a + 5.6, 1540, 400, 'Shuttle bus', { size: 34, bg: C.teal });
  pillPop(ctx, u, a + 4.2, 1060, 666, 'Car queue', { size: 34, bg: C.red });
  pillPop(ctx, u, a + 8.6, 1705, 230, 'The show', { size: 38, bg: C.ink });
  ctx.restore();
  const pt = springU(u, a + 2.2, SPRING.gentle);
  charlie(ctx, 200, FEET, 1.4, { mood: u > a + 7.8 ? 'grin' : 'happy', blinkU: u, look: [1, -0.4], armL: K.POSE.relaxed, armR: armMix(K.POSE.relaxed, [1.75, 0.1], pt) });
  pip(ctx, 'map', 470, FEET, 260, u);
  say(ctx, u, a + 1.2, a + 4.6, 'How are we getting there?', 40, 160, 450, 480, { w: 560 });
  say(ctx, u, a + 4.8, a + 9.4, 'The train and shuttle can beat the car queue.', 40, 160, 450, 480, { w: 560 });
  say(ctx, u, a + 9.6, a + 13.3, 'Driving? Pre-book your parking.', 40, 160, 450, 480, { w: 560 });
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, 'Plan the journey: choose how you travel first.', { num: 3, sub: 'Train and shuttle can beat the car queue. Driving? Pre-book your parking.', size: 60, x: 440, w: 1400 });
}

// ---------------------------------------------------------------- 4: pack the kit
const KIT = [
  ['Ear defenders', (ctx) => K.defendersIcon(ctx, 0, 10, 0.86)],
  ['Sunglasses', (ctx) => K.sunglasses(ctx, 0, 0, 1.25)],
  ['Water', (ctx) => K.bottle(ctx, 0, 20, 0.86)],
  ['Snacks', (ctx) => K.snack(ctx, 0, 6, 1.0)],
];
function item4(ctx, u) {
  const a = at0(3); room(ctx, '#E4EDE6', 756);
  const PX = 1150;
  rr(ctx, 420, 306, 900, 16, 0, '#C8B595'); rr(ctx, 420, 322, 900, 8, 0, 'rgba(0,0,0,0.08)');
  const st = (i) => a + 2.4 + i * 1.15;
  KIT.forEach(([label, draw], i) => {
    const x0 = 520 + i * 230, y0 = 232, b = st(i), d = 0.95, p = K.ease(u, b, b + d, E.inOutCubic);
    const k = K.pop(u, a + 0.4 + i * 0.12, SPRING.gentle);
    M.text(ctx, label, x0, 380, F(34, 700), p >= 1 ? C.teal : C.ink, 'center');
    if (p >= 1) { K.circ(ctx, x0, y0, 44 * K.pop(u, b + d), C.tealSoft); K.tick(ctx, x0, y0, 1.1, prog(u, b + d, b + d + 0.4), C.teal, 11); }
    if (p >= 1 || k <= 0) return;
    const x = lerp(x0, PX, p), y = lerp(y0, 500, p) - Math.sin(p * Math.PI) * 130;
    ctx.save(); ctx.translate(x, y); ctx.scale(lerp(1, 0.6, p) * Math.min(1, k * 1.2), lerp(1, 0.6, p) * Math.min(1, k * 1.2)); draw(ctx); ctx.restore();
  });
  let sq = 0; for (let i = 0; i < 4; i++) sq += M.bump(u, st(i) + 1.0, 0.35);
  ctx.save(); ctx.translate(PX, 756); ctx.scale(1 + 0.04 * sq, 1 - 0.05 * sq); K.backpack(ctx, 0, 0, 1.3, C.red); ctx.restore();
  const bt = K.pop(u, a + 9.6);
  if (bt > 0) { K.circ(ctx, PX, 560, 62 * bt, C.white); K.tick(ctx, PX, 560, 1.6, prog(u, a + 9.6, a + 10.1), C.teal, 12); }
  pillPop(ctx, u, a + 1.2, 250, 230, 'Your packing list', { size: 38, bg: C.teal });
  const n = KIT.filter((_, i) => u >= st(i) + 1).length;
  charlie(ctx, 250, FEET, 1.4, { mood: u > a + 9.6 ? 'grin' : 'happy', blinkU: u, look: [1, -0.3], hold: 'checklist', ticks: n, armL: K.POSE.relaxed, armR: [0.8, 1.4] });
  pip(ctx, 'sun', 1640, FEET, 270, u);
  say(ctx, u, a + 1.2, a + 4.6, 'Ear defenders go in first!', 1330, 150, 1620, 470, { w: 540 });
  say(ctx, u, a + 4.8, a + 9.4, 'Then sunglasses, water and snacks.', 1330, 150, 1620, 470, { w: 540 });
  say(ctx, u, a + 9.6, a + 13.3, 'Anything missing? Buy it in good time.', 1330, 150, 1620, 470, { w: 540 });
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, 'Pack the kit: ear defenders first.', { num: 4, sub: 'Make a packing list, and buy anything missing in good time.' });
}

// ---------------------------------------------------------------- 5: final checks, the night before
function item5(ctx, u) {
  const a = at0(4);
  room(ctx, '#D9DEE8', 800);
  // the window: a dark sky with a few stars
  rr(ctx, 200, 150, 420, 330, 0, C.white); rr(ctx, 222, 172, 376, 286, 0, C.night);
  for (let i = 0; i < 12; i++) { const x = 240 + hash01(i, 4) * 340, y = 190 + hash01(i, 5) * 240; ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(u * 0.8 + i)); rr(ctx, x, y, 6, 6, 0, C.white); ctx.globalAlpha = 1; }
  K.circ(ctx, 520, 240, 40, '#F3EEE2'); K.circ(ctx, 540, 228, 36, C.night);
  // the front door, where the bag will wait
  rr(ctx, 1480, 260, 300, 540, 0, '#C96B6B'); rr(ctx, 1500, 280, 260, 520, 0, '#D98080'); K.circ(ctx, 1720, 560, 12, C.yellow);
  const bk = K.pop(u, a + 8.6, SPRING.bouncy);
  if (bk > 0) { ctx.save(); ctx.translate(1560, 800); ctx.scale(Math.min(1.08, bk), Math.min(1.08, bk)); K.backpack(ctx, 0, 0, 1.1, C.red); ctx.restore(); }
  pillPop(ctx, u, a + 8.9, 1630, 700, 'Bag by the door', { size: 36, bg: C.teal });
  // the tablet: the forecast, then the tickets saved
  const tk = K.pop(u, a + 0.2, SPRING.gentle);
  const sx = M.springKeys(u, [[a, 0], [a + 6, 1]], SPRING.gentle);
  K.tablet(ctx, 960, 380 + (1 - tk) * 60, 1.0, -0.02, () => {
    ctx.save(); ctx.translate(-sx * 480, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(-240, -150, 480, 300);
    M.text(ctx, 'Forecast and show news', -210, -100, F(32, 800), C.ink);
    K.circ(ctx, -110, 10, 50, C.yellow); K.cloud(ctx, -50, 40, 0.55); M.text(ctx, 'Dry, some sun', 30, 30, F(34, 700), C.ink);
    ctx.restore();
    ctx.save(); ctx.translate((1 - sx) * 480, 0);
    ctx.fillStyle = C.white; ctx.fillRect(-240, -150, 480, 300);
    M.text(ctx, 'Tickets saved', -210, -100, F(32, 800), C.teal);
    for (let i = 0; i < 49; i++) if (hash01(i, 8) > 0.45) rr(ctx, -200 + (i % 7) * 22, -60 + Math.floor(i / 7) * 22, 20, 20, 0, C.ink);
    rr(ctx, 20, -50, 180, 26, 0, '#E1E6EB'); rr(ctx, 20, -6, 140, 26, 0, '#E1E6EB');
    ctx.restore();
  });
  pillPop(ctx, u, a + 3, 960, 150, 'Check before bed', { size: 36 });
  K.dad(ctx, 700, FEET + 50, 1.2, { mood: 'calm', blinkU: u, blinkOff: 2, look: [1, -0.3], armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  charlie(ctx, 460, FEET + 50, 1.4, { mood: 'calm', blinkU: u, look: [1, -0.3], armL: K.POSE.relaxed, armR: u > a + 8.6 ? [1.4, 0.2] : K.POSE.relaxed });
  pip(ctx, u < a + 8.6 ? 'point' : 'cheer', 1290, 800, 240, u, { seed: 2 });
  say(ctx, u, a + 1.2, a + 5.6, 'Forecast and show news: checked.', 1250, 250, 1300, 560, { w: 600 });
  say(ctx, u, a + 5.8, a + 8.4, 'Tickets saved on the phone.', 1250, 250, 1300, 560, { w: 600 });
  say(ctx, u, a + 8.6, a + 13.3, "Bag by the door. We're ready!", 1250, 250, 1300, 560, { w: 600 });
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, 'Final checks, the night before.', { num: 5, sub: 'Check the forecast and the show news, save the tickets, and leave the bag by the door.' });
}

// ---------------------------------------------------------------- 6: show day
function item6(ctx, u) {
  const a = at0(5); showground(ctx, u);
  K.speakerPole(ctx, 1240, GY + 40, 1);
  K.crowd(ctx, 900, 1600, GY + 120, 9, 0.85, 5, 1, u);
  // a Typhoon passes once, after a warning
  const jp = prog(u, a + 7.4, a + 10.4);
  if (jp > 0 && jp < 1) { K.burst(ctx, lerp(-400, 2300, jp) - 140, 230, 70, '#F7CDAE', { n: 12, jag: 0.08, u }); K.jet(ctx, lerp(-400, 2300, jp), 230, 0.6, -0.04, { burn: true, u }); }
  // arrive early
  const ak = K.pop(u, a + 1.2, SPRING.gentle);
  if (ak > 0) {
    ctx.save(); ctx.translate(60 - (1 - ak) * 600, 190);
    rr(ctx, 0, 0, 520, 132, 0, C.white);
    K.circ(ctx, 66, 66, 46, C.teal); K.circ(ctx, 66, 66, 36, C.white);
    K.line(ctx, [[66, 66], [66, 42]], C.ink, 7); K.line(ctx, [[66, 66], [47, 68]], C.ink, 7);
    M.text(ctx, 'Arrive early, when', 134, 58, F(40, 700), C.ink); M.text(ctx, 'the gates open', 134, 106, F(40, 700), C.ink);
    ctx.restore();
  }
  pillPop(ctx, u, a + 3.4, 880, 470, 'Our spot', { size: 38, bg: C.teal });
  pillPop(ctx, u, a + 10.6, 1060, 400, 'Plan the way home', { size: 36 });
  const ears = u > a + 5;
  K.dad(ctx, 640, FEET, 1.2, { mood: 'happy', blinkU: u, blinkOff: 2, look: [1, -0.6], armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  charlie(ctx, 400, FEET, 1.5, { mood: jp > 0.2 && jp < 0.8 ? 'wow' : 'happy', defenders: ears ? K.DEF : null, blinkU: u, look: [1, -0.7], armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  pip(ctx, ears ? 'loud' : 'point', 1720, FEET, 260, u, { seed: 3 });
  say(ctx, u, a + 1.2, a + 4.8, "We're here early. Let's find our spot!", 1290, 120, 1700, 480, { w: 580 });
  say(ctx, u, a + 5, a + 9.2, 'Ear defenders on. Here comes a fast jet!', 1290, 120, 1700, 480, { w: 580 });
  say(ctx, u, a + 9.4, a + 13.3, 'Now, when shall we head home?', 1290, 120, 1700, 480, { w: 580 });
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, 'Show day: arrive early, and find your spot.', { num: 6, sub: 'Then plan when you will leave for home.' });
}

// ---------------------------------------------------------------- payoff
function scenePayoff(ctx, u) {
  showground(ctx, u);
  K.crowd(ctx, 20, 380, 735, 5, 0.9, 9, 1, u);
  const px = lerp(-350, 2300, prog(u, PAY - 1.8, PAY + 7.5)), py = 232 + Math.sin(u * 0.7) * 12;
  K.rings(ctx, px - 50, py, 135, C.teal, u, 3, 10);
  K.propPlane(ctx, px, py, 0.82, -0.05 + Math.cos(u * 0.7) * 0.03, u);
  K.dad(ctx, 1100, FEET + 8, 1.2, { mood: 'happy', look: [0, -1], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.relaxed, tilt: -0.04 });
  const on = u > PAY + 2.4;
  const fl = on ? { armL: K.POSE.up, armR: K.POSE.up } : { armL: K.POSE.relaxed, armR: K.POSE.relaxed };
  const hop = on ? Math.abs(Math.sin(u * TAU * 1.5)) * -14 : 0;
  charlie(ctx, 840, FEET + hop, 1.55, { mood: on ? 'grin' : 'happy', look: [0.3, -1], blinkU: u, ...fl });
  pip(ctx, on ? 'cheer' : 'hello', 1460, FEET + 10, 270, u);
  say(ctx, u, PAY + 0.8, PAY + 7.6, 'We planned it together. Have a brilliant day!', 1270, 150, 1450, 470, { w: 580 });
  K.caption(ctx, u, PAY + 1.2, PAY + 7.8, 'Planned with Pip. Ready for a great day.', { w: 1200, size: 76 });
}

// ---------------------------------------------------------------- end card: the swoosh badge logo (the video end logo)
function endCard(ctx, u, IMG) {
  const p = E.inOutCubic(prog(u, END - 0.9, END));
  if (p <= 0) return;
  // a slanted straight edge sweeps the card in (no circles: square edges only)
  ctx.save(); const sl = 300, x = p * (W + sl); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, 0); ctx.lineTo(x - sl, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
  M.fill(ctx, C.paper);
  // three jets draw red, white and blue trails, as on the TikTok videos, then the badge lands
  const cols = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  const path = (q, k) => [lerp(-200, W + 300, q), 120 + k * 26 - Math.sin(q * Math.PI) * 70];
  cols.forEach((col, k) => {
    const q = E.inOutSine(prog(u, END - 0.4 + k * 0.1, END + 2.6 + k * 0.1));
    if (q <= 0) return;
    ctx.beginPath(); for (let s = 0; s <= 60; s++) { const pp = path((s / 60) * q, k); s ? ctx.lineTo(pp[0], pp[1]) : ctx.moveTo(pp[0], pp[1]); }
    ctx.lineCap = 'round'; if (k === 1) { ctx.strokeStyle = '#C9D6E0'; ctx.lineWidth = 24; ctx.stroke(); } ctx.strokeStyle = col; ctx.lineWidth = 18; ctx.stroke();
    if (q < 1) { const pp = path(q, k), p2 = path(Math.min(1, q + 0.01), k); K.redJet(ctx, pp[0] + 60, pp[1], 0.5, Math.atan2(p2[1] - pp[1], p2[0] - pp[0])); }
  });
  const lk = K.pop(u, END + 1.6, SPRING.bouncy);
  if (lk > 0 && IMG.logo) { const lw = 600, lh = lw * IMG.logo.height / IMG.logo.width; ctx.save(); ctx.translate(450, 380); ctx.scale(lk, lk); ctx.rotate((1 - lk) * 0.2); ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh); ctx.restore(); }
  const tk = K.pop(u, END + 2.4, SPRING.gentle);
  if (tk > 0) M.text(ctx, 'Plan it with Pip', 150 - (1 - tk) * 80, 720, F(104, 800), C.ink);
  const sk = K.pop(u, END + 3, SPRING.gentle);
  if (sk > 0) { ctx.font = F(56, 800); let x = 154 - (1 - sk) * 80; [['Plan. ', '#23908C'], ['Inform. ', '#1F4E8C'], ['Prepare.', '#D74949']].forEach(([w, c]) => { M.text(ctx, w, x, 800, F(56, 800), c); x += ctx.measureText(w).width; }); }
  const pk = K.pop(u, END + 3.6, SPRING.bouncy);
  if (pk > 0) { ctx.save(); ctx.translate(150, 900); ctx.scale(pk, pk); K.pill(ctx, 0, 0, 'ukairshowguide.co.uk', { size: 50, bg: C.teal, fg: C.white }); ctx.restore(); }
  const ck = K.pop(u, END + 1.0, SPRING.gentle), wv = Math.sin(u * TAU * 0.75) * 0.25;
  K.dad(ctx, 1640, 980 + (1 - ck) * 500, 1.5, { mood: 'happy', blinkU: u, armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  charlie(ctx, 1380, 990 + (1 - ck) * 500, 1.75, { mood: 'happy', blinkU: u, blinkOff: 2, armR: [2.5 + wv, -0.25], armL: K.POSE.relaxed });
  const pq = K.pop(u, END + 2.4, SPRING.bouncy);
  if (pq > 0) pip(ctx, 'hello', 1080, 990, 280 * Math.min(1, pq), u);
  ctx.restore();
}

// ---------------------------------------------------------------- the cut
const SCENES = [[0, sceneHook], [9, sceneTitle], [at0(0), item1], [at0(1), item2], [at0(2), item3], [at0(3), item4], [at0(4), item5], [at0(5), item6], [PAY, scenePayoff]];
const PUSH = 0.9;
M.film({
  fonts: K.FONTS,
  images: Object.assign({ logo: 'assets/logo.png' },
    Object.fromEntries(['rest', 'blink', 'point', 'tip', 'map', 'sun', 'loud', 'cheer', 'fly', 'hello0', 'hello1', 'hello2', 'hello3', 'hello4', 'hello5'].map((k) => ['pip_' + k, 'assets/pip/' + k + '.png']))),
  hits: HITS,
  samples: 6,
  draw(ctx, u, t, IMG) {
    IMGS = IMG;
    let i = 0; while (i + 1 < SCENES.length && u >= SCENES[i + 1][0] - PUSH) i++;
    const [a, fn] = SCENES[i];
    if (i > 0 && u < a) {            // arriving: a page push, both shots on screen
      const p = E.inOutCubic(prog(u, a - PUSH, a));
      ctx.save(); ctx.translate(-p * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); SCENES[i - 1][1](ctx, u); ctx.restore();
      ctx.save(); ctx.translate((1 - p) * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); fn(ctx, u); ctx.restore();
    } else fn(ctx, u);
    strip(ctx, u);
    endCard(ctx, u, IMG);
  },
});
