// See the Sound: an airshow drawn the way Charlie hears it. Every noise is a shape; every tip
// visibly calms the picture. 140 beats at 80 bpm (105 s). Pure function of time.
import * as K from '../shared/kit.js';
const { M, C, F } = K;
const { W, H, TAU, clamp, lerp, prog, E, springU, SPRING, kf, hash01 } = M;

const GY = 560, FEET = 750;         // horizon and where feet stand (the caption card sits below)
const SOFT = '#F7CDAE';             // a loud sound once it has been turned down

// Soft, low sounds only: this film is meant to be calm to watch.
const HITS = [
  [0.3, 'caption 1', 'tok', { pitch: 'F4', gain: 0.2 }],
  [5.2, 'sounds appear', 'tok', { pitch: 'A4', gain: 0.2 }],
  [6, 'crowd label', 'blip', { pitch: 'C5', gain: 0.1 }], [8, 'speaker label', 'blip', { pitch: 'D5', gain: 0.1 }], [10, 'hum label', 'blip', { pitch: 'E5', gain: 0.1 }],
  [14, 'loud warning', 'tok', { pitch: 'C4', gain: 0.22 }],
  [18, 'the jet', 'whoosh', { len: 3.2, from: 140, to: 420, gain: 0.16, peak: 0.5 }],
  [22, 'turn it down', 'tok', { pitch: 'F4', gain: 0.25 }],
  ...[0, 1, 2, 3, 4, 5].map((i) => [24 + i * 0.5, `dot ${i + 1}`, 'blip', { pitch: ['F5', 'G5', 'A5', 'C6', 'D6', 'F6'][i], gain: 0.1 }]),
  [28, 'tip 1', 'tok', { pitch: 'F4', gain: 0.22 }], [31, 'volume 1', 'tick', { gain: 0.14 }], [33.5, 'volume 2', 'tick', { gain: 0.14 }], [36, 'volume 3', 'tick', { gain: 0.14 }],
  [38, 'tip 2', 'tok', { pitch: 'G4', gain: 0.22 }], [41.3, 'defenders on', 'pop', { pitch: 'C5', to: 'F4', gain: 0.2 }],
  [48, 'tip 3', 'tok', { pitch: 'A4', gain: 0.22 }], [54.6, 'quieter here', 'bell', { pitch: 'C6', gain: 0.1 }],
  [58, 'tip 4', 'tok', { pitch: 'F4', gain: 0.22 }], [62.5, 'loud row', 'tick', { gain: 0.14 }], [63.6, 'break tag', 'pop', { pitch: 'A4', gain: 0.16 }],
  [68, 'tip 5', 'tok', { pitch: 'G4', gain: 0.22 }], [72.6, 'inside', 'bell', { pitch: 'A5', gain: 0.1 }], [74.5, 'adults too', 'blip', { pitch: 'C5', gain: 0.1 }],
  [78, 'tip 6', 'tok', { pitch: 'A4', gain: 0.22 }], [81, 'card flips', 'tick', { gain: 0.16 }], [84.6, 'exit pin', 'pop', { pitch: 'F4', gain: 0.16 }],
  [88, 'airshows too', 'tok', { pitch: 'F4', gain: 0.25 }],
  ...[0, 1, 2, 3, 4, 5].map((i) => [90 + i * 2, `tile ${i + 1}`, 'tok', { pitch: ['F4', 'G4', 'A4', 'C5', 'D5', 'F5'][i], gain: 0.16 }]),
  [104, 'mustang', 'tok', { pitch: 'F4', gain: 0.22 }], [106.5, 'happy flapping', 'bell', { pitch: 'F5', gain: 0.1 }],
  [114, 'end card', 'bell', { pitch: 'C6', gain: 0.12 }],
];

const NEARBY_HITS = [[88, 'nearby', 'tok', { pitch: 'F4', gain: 0.22 }], ...[0, 1, 2, 3, 4].map((i) => [90 + i * 3, `nearby ${i + 1}`, 'tick', { gain: 0.14 }]), [99, 'can I help', 'blip', { pitch: 'C5', gain: 0.1 }], [104, 'kindness', 'bell', { pitch: 'F5', gain: 0.1 }]];

function showground(ctx, u, o = {}) {
  K.sky(ctx); K.clouds(ctx, u, 150, 5); K.horizon(ctx, GY); K.ground(ctx, GY);
  if (o.fence !== false) K.fence(ctx, GY + 54);
}
const armMix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const walk = (u, on) => (on ? Math.sin(u * TAU * 1.5) : 0);

// ---------------------------------------------------------------- 0-22: everything at once
function scenePile(ctx, u) {
  const z = kf(u, [[8, 1], [21, 1.16]]);
  ctx.save(); M.zoomAbout(ctx, z, 720, 470);
  showground(ctx, u);
  // the things that make noise
  K.speakerPole(ctx, 1330, 668, 1);
  K.foodVan(ctx, 1690, 720, 0.82);
  K.crowd(ctx, 40, 470, 735, 6, 0.95, 4, 1, u);
  // sound shapes arrive one by one, then crowd in on Charlie
  const press = K.ease(u, 10, 19);
  const pa = K.ease(u, 5, 7, E.outCubic);
  if (pa > 0) K.pebbles(ctx, lerp(20, 60, press), lerp(250, 200, press), lerp(470, 640, press), 330, 46, u, [C.grey, C.lilac, C.blue], { amt: pa, size: lerp(15, 27, press) });
  const za = K.pop(u, 7, SPRING.gentle);
  if (za > 0) for (let i = 0; i < 3; i++) K.zig(ctx, 1262, 348, -za * lerp(250, 500, press), lerp(22, 52, press), C.yellow, { u: u + i, rot: [0.24, -0.02, -0.26][i], n: 9, lw: lerp(9, 15, press) });
  const ha = K.ease(u, 9, 11, E.outCubic);
  if (ha > 0) K.hum(ctx, 1560 - ha * lerp(360, 760, press), 596, ha * lerp(360, 760, press), lerp(10, 24, press), '#C9A27A', u, lerp(12, 24, press));
  // the fast jet: one huge spiky shape that grows over everything (no flash, it swells)
  const jx = lerp(-500, 2500, prog(u, 16.8, 21.8));
  const br = kf(u, [[17, 0], [18, 300], [20, 540], [22, 560]], E.outCubic);
  if (br > 0) { ctx.save(); ctx.globalAlpha = 0.93; K.burst(ctx, clamp(jx - 120, 500, 1300), 230, br, C.orange, { n: 16, u: u * 2, seed: 3 }); ctx.restore(); }
  K.jet(ctx, jx, 205, 0.95, -0.05, { burn: true, u });
  const hp = prog(u, -1.2, 6.5); if (hp < 1) { const hx = lerp(-200, 2300, hp), hy = 200 + Math.sin(u * 0.8) * 20; K.rings(ctx, hx - 60, hy, 170, C.teal, u, 3, 10); K.propPlane(ctx, hx, hy, 0.8, -0.05, u); }
  // Charlie and Dad
  const ears = springU(u, 17.7, SPRING.snappy);
  const mood = u < 8 ? 'happy' : u < 13.5 ? 'neutral' : u < 17.7 ? 'worried' : 'overwhelm';
  const shrink = 1 - 0.06 * ears;
  K.dad(ctx, 930, FEET + 8, 1.2, { mood: u < 17.7 ? 'happy' : 'worried', look: u < 17.7 ? [0, -1] : [-1, 0.6], blinkU: u, blinkOff: 1.7, armL: armMix(K.POSE.relaxed, K.POSE.reach, ears), armR: K.POSE.relaxed });
  K.kid(ctx, 720, FEET, 1.35 * shrink, { mood, look: u < 6 ? [lerp(-1, 1, prog(u, 0, 6)), -1] : [0, 0], blinkU: u, armL: armMix(u < 4 ? [1.3 + Math.sin(u * 4) * 0.1, 1.2] : K.POSE.relaxed, K.POSE.ears, ears), armR: armMix(K.POSE.relaxed, K.POSE.ears, ears), tilt: -0.05 * ears });
  ctx.restore();
  // labels on the sounds
  const lab = (str, x, y, a, bg) => { const k = K.pop(u, a); const o = E.inCubic(prog(u, 20.6, 21.2)); if (k > 0 && o < 1) { ctx.save(); ctx.translate(x, y); ctx.scale(k * (1 - o), k * (1 - o)); K.pill(ctx, 0, 0, str, { align: 'center', bg }); ctx.restore(); } };
  lab('Crowd chatter', 300, 190, 6);
  lab('Loudspeakers', 1160, 470, 8);
  lab('Generator hum', 1560, 520, 10);
  lab('Fast jet', 960, 110, 18.4, C.red);
  // how loud it feels
  const mk = K.pop(u, 5.4, SPRING.gentle);
  if (mk > 0) { ctx.save(); ctx.translate(-(1 - mk) * 300, 0); K.meter(ctx, 110, 330, 300, kf(u, [[5, 0.12], [7, 0.3], [11, 0.5], [16, 0.62], [19, 1]]), { w: 50 }); K.rr(ctx, 178, 404, 176, 104, 0, C.paper); M.text(ctx, 'How loud', 196, 448, F(34, 700), C.ink); M.text(ctx, 'it feels', 196, 490, F(34, 700), C.ink); ctx.restore(); }
  // a promise to the viewer, right at the start
  const ck = Math.min(springU(u, 0.5, SPRING.gentle), 1 - E.inCubic(prog(u, 4.4, 5)));
  if (ck > 0.01) { ctx.save(); ctx.translate(70, 86 - (1 - ck) * 200); K.pill(ctx, 0, 0, 'A calm video: no sudden sounds, no flashing', { size: 34, bg: C.teal, fg: C.white }); ctx.restore(); }
  K.loudChip(ctx, u, 18, { hold: 2.6 });
  K.caption(ctx, u, 0.2, 5, 'Charlie loves aeroplanes.', { w: 1000, size: 76 });
  K.caption(ctx, u, 5.2, 13.6, 'Charlie is autistic. Every sound arrives at full volume.', { w: 1240 });
  K.caption(ctx, u, 14, 21.3, 'So an airshow can feel like this.', { w: 1150, size: 72 });
}

// ---------------------------------------------------------------- 22-28: turn it down
function sceneTurn(ctx, u) {
  M.fill(ctx, C.paper);
  const words = [['It', 21.3], ['does', 21.5], ['not', 21.7], ['have', 21.9], ['to.', 22.2]];
  let x = 130;
  words.forEach(([w, a]) => {
    const k = K.pop(u, a, SPRING.bouncy), f = F(128, 800);
    ctx.font = f; const ww = ctx.measureText(w).width;
    if (k > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 350); ctx.clip(); M.text(ctx, w, x, 330 + (1 - k) * 190, f, w === 'to.' ? C.teal : C.ink); ctx.restore(); }
    x += ww + 38;
  });
  const sk = K.pop(u, 23.2, SPRING.gentle);
  if (sk > 0) M.text(ctx, 'Six things that turn it down', 136 - (1 - sk) * 60, 470, F(72, 700), C.ink);
  for (let i = 0; i < 6; i++) {
    const k = K.pop(u, 24 + i * 0.5);
    if (k > 0) { K.rr(ctx, 186 + i * 150 - 54 * k, 640 - 54 * k, 108 * k, 108 * k, 0, i % 2 ? C.tealSoft : C.teal); M.text(ctx, String(i + 1), 186 + i * 150, 640 + 22 * k, F(62 * k, 800), i % 2 ? C.ink : C.white, 'center'); }
  }
  const lk = K.pop(u, 26, SPRING.gentle);
  if (lk > 0) M.text(ctx, 'for families, and for autistic adults', 136 - (1 - lk) * 60, 800, F(48, 500), C.greyDark);
  // the meter comes down while Charlie's shoulders drop
  const v = kf(u, [[22.4, 1], [26, 0.22]]);
  K.meter(ctx, 1730, 330, 420, v, { w: 60 });
  const rel = K.ease(u, 22.6, 25.5);
  K.burst(ctx, 1500, 270, lerp(170, 70, rel), M.mix(C.orange, SOFT, rel), { n: 14, jag: 1 - rel * 0.92, u });
  K.kid(ctx, 1500, 960, 2.0, { mood: rel < 0.35 ? 'overwhelm' : rel < 0.8 ? 'worried' : 'calm', armL: armMix(K.POSE.ears, K.POSE.relaxed, rel), armR: armMix(K.POSE.ears, K.POSE.relaxed, rel), blinkU: u });
}

// ---------------------------------------------------------------- 28-38: tip 1, practise at home
function tip1(ctx, u) {
  K.house(ctx);
  K.sofa(ctx, 520, 800, 1);
  K.dad(ctx, 330, 716, 1.12, { sit: 1, mood: 'happy', look: [1, -0.4], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.hug });
  const vol = M.springKeys(u, [[28, 0.2], [31, 0.4], [33.5, 0.62], [36, 0.85]], SPRING.snappy);
  K.kid(ctx, 560, 712, 1.3, { sit: 1, mood: u > 36.2 ? 'grin' : u > 33.6 ? 'wow' : 'happy', look: [1, -0.5], blinkU: u, armL: K.POSE.relaxed, armR: u > 30.6 ? K.POSE.point : K.POSE.relaxed });
  // the tablet, held up big so we can see what Charlie is watching
  const tk = K.pop(u, 28.1, SPRING.gentle);
  K.tablet(ctx, 1230, 400 + (1 - tk) * 60, 1.28, 0.02, () => {
    ctx.fillStyle = C.grass; ctx.fillRect(-240, 90, 480, 60);
    const jx = ((u * 150) % 760) - 380;
    K.burst(ctx, jx - 60, -20, 30 + vol * 110, C.orange, { n: 12, u });
    K.jet(ctx, jx, -24, 0.42, -0.04, { burn: true, u });
  });
  // volume slider
  const sx = 960, sw = 540, sy = 690;
  K.rr(ctx, sx, sy - 9, sw, 18, 0, '#D7CCB6'); K.rr(ctx, sx, sy - 9, sw * vol, 18, 0, C.teal); K.circ(ctx, sx + sw * vol, sy, 30, C.teal); K.circ(ctx, sx + sw * vol, sy, 12, C.white);
  M.text(ctx, 'Volume', sx - 150, sy + 13, F(36, 700), C.ink);
  K.caption(ctx, u, 28.3, 37.5, 'Watch and listen at home first', { num: 1, sub: 'Start quiet. Turn it up a little each time, so there are no surprises.' });
}

// ---------------------------------------------------------------- 38-48: tip 2, ear defenders
function tip2(ctx, u) {
  showground(ctx, u);
  const on = springU(u, 41.3, SPRING.snappy), soft = K.ease(u, 41.3, 42.6, E.outCubic);
  const jx = lerp(1050, 1640, prog(u, 37, 48));
  K.burst(ctx, jx - 140, 215, lerp(330, 150, soft), M.mix(C.orange, SOFT, soft), { n: 16, jag: 1 - soft * 0.93, u: u * (2 - soft), seed: 3 });
  K.jet(ctx, jx, 200, 0.8, -0.04, { burn: true, u });
  K.meter(ctx, 110, 280, 300, lerp(0.95, 0.3, soft), { w: 50 });
  K.dad(ctx, 1010, FEET + 8, 1.2, { mood: 'happy', look: [-1, 0.5], blinkU: u, blinkOff: 1, armL: on > 0.5 ? K.POSE.relaxed : K.POSE.reach, armR: u > 43.5 ? [2.3, 0.4] : K.POSE.relaxed });
  const s = 1.6, hy = FEET - s * 207;
  const done = u > 41.95;
  K.kid(ctx, 760, FEET, s, { mood: u < 41.3 ? 'worried' : u < 43.5 ? 'calm' : 'happy', look: [0.6, -1], blinkU: u, defenders: done ? K.DEF : null, armL: armMix(K.POSE.ears, K.POSE.relaxed, soft), armR: armMix(K.POSE.ears, K.POSE.relaxed, soft) });
  if (!done && u > 39.4) { const dk = K.ease(u, 39.4, 41.3, E.inOutCubic); K.defendersIcon(ctx, lerp(1010, 760, dk), lerp(250, hy, dk) - Math.sin(dk * Math.PI) * 120 + (on > 0 ? (1 - on) * -10 : 0), lerp(1.1, 1.52, dk), K.DEF, lerp(0.5, 0, dk)); }
  K.caption(ctx, u, 38.3, 47.5, 'Ear defenders on before the flying starts', { num: 2, sub: 'Wear them at home for a few days first, so they feel normal.' });
}

// ---------------------------------------------------------------- 48-58: tip 3, the ends of the line
function tip3(ctx, u) {
  showground(ctx, u);
  const sc = 0.62;
  for (const px of [640, 1080]) {
    K.speakerPole(ctx, px, 676, 0.8);
    for (const sg of [-1, 1]) K.zig(ctx, px + sg * 56, 418, sg * 190, 26, C.yellow, { u: u + px, n: 7, lw: 9 });
  }
  K.pebbles(ctx, 330, 440, 1000, 180, 70, u, [C.grey, C.lilac, C.blue], { size: 15 });
  K.crowd(ctx, 330, 1320, 700, 17, sc, 2, 1, u); K.crowd(ctx, 350, 1300, 742, 15, sc * 1.06, 6, 1, u + 2);
  // the calm end
  const zk = K.pop(u, 54.4, SPRING.gentle);
  if (zk > 0) { ctx.save(); ctx.globalAlpha = 0.5 * Math.min(1, zk); ctx.beginPath(); ctx.ellipse(1640, 745, 230 * zk, 54 * zk, 0, 0, TAU); ctx.fillStyle = C.tealSoft; ctx.fill(); ctx.restore(); }
  const wp = K.ease(u, 49.5, 54.3), x = lerp(860, 1600, wp), moving = wp > 0 && wp < 1;
  K.route(ctx, [[860, 770], [1100, 782], [1400, 780], [1600, 770]], wp, C.teal, 8);
  K.dad(ctx, x + 96, 752, 0.74, { mood: 'happy', blinkU: u, walk: walk(u, moving), armL: K.POSE.relaxed, armR: K.POSE.relaxed, bob: moving ? Math.abs(Math.sin(u * TAU * 1.5)) * -5 : 0 });
  K.kid(ctx, x, 748, 0.84, { mood: wp > 0.95 ? 'happy' : 'neutral', defenders: K.DEF, blinkU: u, walk: walk(u + 0.3, moving), armL: K.POSE.relaxed, armR: wp > 0.98 && u < 57 ? [2.5 + Math.sin(u * 5) * 0.2, -0.2] : K.POSE.relaxed, bob: moving ? Math.abs(Math.sin(u * TAU * 1.5 + 1)) * -5 : 0 });
  const lk = K.pop(u, 54.6);
  if (lk > 0) { ctx.save(); ctx.translate(1640, 500); ctx.scale(lk, lk); K.pill(ctx, 0, 0, 'Quieter here', { align: 'center', bg: C.teal, fg: C.white, size: 40 }); ctx.restore(); }
  const bk = K.pop(u, 49);
  if (bk > 0) { ctx.save(); ctx.translate(830, 330); ctx.scale(bk, bk); K.pill(ctx, 0, 0, 'Busiest and loudest in the middle', { align: 'center', size: 36 }); ctx.restore(); }
  K.caption(ctx, u, 48.3, 57.5, 'Sit towards the end of the crowd line', { num: 3, sub: 'Fewer people, further from the loudspeakers, and an easy way out.' });
}

// ---------------------------------------------------------------- 58-68: tip 4, know the loud bits
function tip4(ctx, u) {
  showground(ctx, u, { fence: false });
  // programme card
  const ck = K.pop(u, 58.1, SPRING.gentle);
  ctx.save(); ctx.translate(0, (1 - ck) * -60);
  const cx = 120, cy = 70, cw = 800, chh = 640;
  ctx.save(); ctx.globalAlpha = 0.14; K.rr(ctx, cx + 8, cy + 14, cw, chh, 0, '#000'); ctx.restore();
  K.rr(ctx, cx, cy, cw, chh, 0, C.paper);
  M.text(ctx, 'Flying programme', cx + 48, cy + 92, F(62, 800), C.ink);
  const rows = [['12:00', 'Vintage trainers', 0], ['12:30', 'Mustang', 0], ['13:00', 'Fast jet', 1], ['13:30', 'Wing walkers', 0]];
  const hi = M.springKeys(u, [[58, 0], [61, 1], [62.5, 2]], SPRING.snappy);
  K.rr(ctx, cx + 24, cy + 132 + hi * 122, cw - 48, 108, 0, hi > 1.5 ? '#FBE3D1' : C.tealSoft);
  rows.forEach(([t, n, loud], i) => {
    const y = cy + 204 + i * 122;
    M.text(ctx, t, cx + 52, y, F(50, 700), C.greyDark); M.text(ctx, n, cx + 232, y, F(54, 700), C.ink);
    if (loud) { K.burst(ctx, cx + 500, y - 18, 30 + 3 * Math.sin(u * 4), C.orange, { n: 11, u }); const k = K.pop(u, 62.5); if (k > 0) { ctx.save(); ctx.translate(cx + 630, y - 18); ctx.scale(k, k); K.pill(ctx, 0, 0, 'LOUD', { align: 'center', bg: C.orange, fg: C.ink, size: 34 }); ctx.restore(); } }
    else K.circ(ctx, cx + 730, y - 18, 13, C.teal);
  });
  const tk = K.pop(u, 63.6);
  if (tk > 0) { ctx.save(); ctx.translate(cx + 640, cy + 440); ctx.rotate(-0.07); ctx.scale(tk, tk); K.pill(ctx, 0, 0, 'Our snack break', { align: 'center', bg: C.teal, fg: C.white, size: 44 }); ctx.restore(); }
  ctx.restore();
  // the break itself, well back from the crowd line
  ctx.beginPath(); ctx.ellipse(1420, 772, 330, 50, 0, 0, TAU); ctx.fillStyle = C.pink; ctx.fill();
  ctx.beginPath(); ctx.ellipse(1420, 772, 250, 34, 0, 0, TAU); ctx.fillStyle = '#F7D5CF'; ctx.fill();
  const jp = prog(u, 63.5, 68.5);
  if (jp > 0) { const jx = lerp(1000, 2050, jp); K.burst(ctx, jx - 40, 196, 62, SOFT, { n: 12, jag: 0.08, u }); K.jet(ctx, jx, 190, 0.3, -0.05, { burn: true, u }); }
  K.dad(ctx, 1560, 772, 1.1, { sit: 1, flip: true, mood: 'happy', blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.hold });
  K.kid(ctx, 1290, 770, 1.25, { sit: 1, mood: u > 64 ? 'grin' : 'happy', defenders: K.DEF, blinkU: u, look: [0.6, -0.6], armL: K.POSE.hold, armR: K.POSE.hold });
  K.snack(ctx, 1440, 750, 0.62); K.bottle(ctx, 1180, 742, 0.6);
  K.loudChip(ctx, u, 64, { hold: 2.5 });
  K.caption(ctx, u, 58.3, 67.5, 'Check the flying programme', { num: 4, sub: 'Plan your breaks for when the fast jets are on.' });
}

// ---------------------------------------------------------------- 68-78: tip 5, a quiet space
function tip5(ctx, u) {
  showground(ctx, u, { fence: false });
  const inside = K.ease(u, 72, 73.5);
  K.pebbles(ctx, -20, 250, 430, 300, 40, u, [C.grey, C.lilac, C.blue], { amt: lerp(1, 0.3, inside), size: lerp(22, 13, inside) });
  K.zig(ctx, 0, 420, lerp(360, 150, inside), lerp(36, 14, inside), C.yellow, { u, n: 8, lw: lerp(13, 7, inside) });
  K.car(ctx, 1730, 720, 0.52, C.blue);
  K.tent(ctx, 1040, 772, 1.5, C.tealSoft, C.teal, 'Quiet space');
  K.dad(ctx, 700, FEET + 14, 1.15, { mood: 'happy', look: [1, 0], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  const wp = K.ease(u, 69.3, 72.4), x = lerp(430, 1040, wp), moving = wp > 0 && wp < 1;
  K.kid(ctx, x, 766, lerp(1.25, 1.02, wp), { mood: wp < 0.9 ? 'worried' : 'calm', defenders: K.DEF, blinkU: u, walk: walk(u, moving), armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  if (inside > 0) K.rings(ctx, 1040, 560, 150 * inside, C.teal, u * 0.6, 2, 6);
  K.beth(ctx, 1470, FEET + 14, 1.15, { mood: 'calm', headphones: '#3A3F4B', hold: 'camera', armL: K.POSE.hold, armR: K.POSE.hold });
  const bk = K.pop(u, 74.5);
  if (bk > 0) { ctx.save(); ctx.translate(1560, 250); ctx.scale(bk, bk); K.pill(ctx, 0, 0, 'Beth is autistic too', { align: 'center', size: 38, bg: '#6E5AA8', fg: C.white }); ctx.restore(); ctx.save(); ctx.translate(1560, 326); ctx.scale(bk, bk); K.pill(ctx, 0, 0, 'Quiet spaces are for adults as well', { align: 'center', size: 32, bg: C.paper, fg: C.ink }); ctx.restore(); }
  K.caption(ctx, u, 68.3, 77.5, 'Find the quiet space', { num: 5, sub: 'No quiet space? Make a base: the car, a tent or a rug.' });
}

// ---------------------------------------------------------------- 78-88: tip 6, a signal and a way out
function tip6(ctx, u) {
  showground(ctx, u, { fence: false });
  // the exit and the car
  K.rr(ctx, 1672, 430, 12, 250, 0, C.greyDark); K.rr(ctx, 1560, 400, 236, 92, 0, C.sun); M.text(ctx, 'Way out', 1678, 464, F(48, 800), C.white, 'center');
  K.car(ctx, 1690, 742, 0.6, C.blue);
  const rp = K.ease(u, 82.4, 84.6);
  K.route(ctx, [[1100, 790], [1260, 812], [1420, 800], [1560, 772]], rp, C.teal, 10);
  const pk = K.pop(u, 84.6); if (pk > 0) K.pin(ctx, 1690, 610 - (1 - pk) * 80, 1.0 * Math.min(1.1, pk), C.red);
  const fl = K.ease(u, 80.6, 81.4), red = fl > 0.5;
  K.dad(ctx, 1010, FEET + 8, 1.2, { mood: 'happy', look: [-1, 0.2], blinkU: u, blinkOff: 2, tilt: red ? 0.05 * Math.sin((u - 81.4) * 4) * Math.exp(-(u - 81.4)) : 0, armL: K.POSE.relaxed, armR: u > 81.8 ? [2.3, 0.5] : K.POSE.relaxed });
  K.kid(ctx, 600, FEET, 1.5, { mood: red ? 'neutral' : 'happy', defenders: K.DEF, blinkU: u, armL: K.POSE.relaxed, armR: [2.0, 0.5] });
  K.signalCard(ctx, 850, 330 + Math.sin(u * 1.2) * 6, 0.82, 0.05, fl);
  const lk = K.pop(u, 79), l2 = K.pop(u, 81.2);
  ctx.save(); ctx.translate(850, 560); const sc = red ? l2 : lk; ctx.scale(sc, sc); K.pill(ctx, 0, 0, red ? 'I need a break' : 'I am OK', { align: 'center', bg: red ? C.red : C.sun, fg: C.white, size: 44 }); ctx.restore();
  K.caption(ctx, u, 78.3, 87.5, 'Agree a signal, and a way out', { num: 6, sub: 'Leaving early is not failing. It is the plan working.' });
}

// ---------------------------------------------------------------- 88-108: if you are standing nearby
const NEARBY = ['It is overload, not bad behaviour', 'Give space. Please do not stare or film', 'Skip the advice. A kind smile helps', 'Ask the grown-up: "Can I help?"', 'Flapping, rocking and ear defenders are all fine'];
const BY1 = { adult: true, skin: '#F3D5BA', hair: '#B9B2A8', hairStyle: 'bob', top: '#7FA5C9', bottom: '#4A4A58', shoe: '#2B2B33' };
const BY2 = { adult: true, skin: '#C99672', hair: '#2B2622', hairStyle: 'short', top: '#9BB58E', bottom: '#3D4A63', shoe: '#2B2B33', cap: '#5E6E80' };
function sceneNearby(ctx, u) {
  showground(ctx, u, { fence: false });
  const back = K.ease(u, 93, 94.6), better = K.ease(u, 99.5, 103.5);
  // the space people leave
  if (back > 0) { ctx.save(); ctx.globalAlpha = 0.5 * back; ctx.beginPath(); ctx.ellipse(360, 760, 330 * back, 60 * back, 0, 0, TAU); ctx.fillStyle = C.tealSoft; ctx.fill(); ctx.restore(); }
  // what Charlie is hearing: it eases as people give room
  K.pebbles(ctx, 60, 250, 520, 200, 34, u, [C.grey, C.lilac, C.blue], { amt: lerp(1, 0.2, Math.max(back * 0.6, better)), size: lerp(22, 13, better) });
  K.burst(ctx, 280, 290, lerp(120, 50, better), M.mix(C.orange, SOFT, better), { n: 13, jag: 1 - better * 0.92, u });
  // two people nearby: staring and filming at first, then stepping back
  const bx = lerp(0, 60, back);
  K.person(ctx, 830 + bx, FEET + 14, 1.12, { ...BY2, mood: back > 0.5 ? 'happy' : 'neutral', look: back > 0.5 ? [1, -0.6] : [-1, 0.4], blinkU: u, blinkOff: 3, armL: K.POSE.relaxed, armR: back > 0.5 ? K.POSE.relaxed : [1.6, 1.1], hold: back > 0.5 ? null : 'camera', flip: false });
  const ask = K.pop(u, 99);
  K.person(ctx, 670 + bx * 0.6, FEET + 10, 1.12, { ...BY1, mood: back > 0.5 ? 'happy' : 'worried', look: [-1, 0.3], blinkU: u, blinkOff: 1, armL: ask > 0 ? [2.3, 0.3] : K.POSE.relaxed, armR: K.POSE.relaxed });
  if (ask > 0 && u < 104) { ctx.save(); ctx.translate(680, 240); ctx.scale(ask, ask); K.pill(ctx, 0, 0, 'Can I help?', { align: 'center', size: 44, bg: C.paper, fg: C.ink }); ctx.restore(); }
  // Charlie and Dad
  K.dad(ctx, 450, FEET + 10, 1.18, { mood: better > 0.6 ? 'happy' : 'worried', look: [-1, 0.6], lean: -0.06, blinkU: u, blinkOff: 2, armL: K.POSE.reach, armR: ask > 0 && u < 103 ? [2.2, 0.4] : K.POSE.relaxed });
  const up = better;
  K.kid(ctx, 280, FEET, 1.3 * (0.93 + 0.07 * up), { mood: better < 0.3 ? 'overwhelm' : better < 0.8 ? 'worried' : 'calm', defenders: K.DEF, blinkU: u, tilt: -0.06 * (1 - up), armL: armMix(K.POSE.ears, K.POSE.relaxed, up), armR: armMix(K.POSE.ears, K.POSE.relaxed, up) });
  // the list
  const px = 1030, pw = 830, pk = K.pop(u, 88.2, SPRING.gentle);
  ctx.save(); ctx.translate((1 - pk) * 900, 0);
  K.rr(ctx, px, 50, pw, 700, 0, C.paper);
  K.rr(ctx, px, 50, pw, 84, 0, C.ink);
  M.text(ctx, 'IF YOU ARE STANDING NEARBY', px + 36, 106, F(36, 800), C.yellow, 'left', 2);
  NEARBY.forEach((str, i) => {
    const a = 90 + i * 3, k = K.pop(u, a, SPRING.snappy);
    if (k <= 0) return;
    const y = 150 + i * 120, f = F(46, 700), lines = K.wrap(ctx, str, f, pw - 150);
    K.rr(ctx, px + 36, y + 22, 56 * Math.min(1, k), 56, 0, C.teal); K.tick(ctx, px + 64, y + 50, 0.9, prog(u, a + 0.15, a + 0.7), C.white, 9);
    lines.forEach((l, j) => M.text(ctx, l, px + 118 + (1 - Math.min(1, k)) * 60, y + (lines.length > 1 ? 44 : 68) + j * 52, f, C.ink));
  });
  ctx.restore();
  K.caption(ctx, u, 88.4, 103.6, 'Someone near you is having a hard time?', { w: 1500, size: 64 });
  K.caption(ctx, u, 104, 107.4, 'Kindness costs nothing.', { w: 1150, size: 84 });
}

// ---------------------------------------------------------------- 108-124 (drawn as 88-104): what airshows can do
const TILES = [
  ['A signposted quiet space', 'tent'], ['A warning before the loud bits', 'chip'], ['A sensory map and photo guide online', 'map'],
  ['Ear defenders to borrow or buy', 'def'], ['Staff who know the Sunflower lanyard', 'sun'], ['A quieter first hour', 'clock'],
];
function tileIcon(ctx, kind, u) {
  if (kind === 'tent') K.tent(ctx, 0, 56, 0.34, C.tealSoft, C.teal);
  if (kind === 'chip') { K.rr(ctx, -66, -30, 132, 60, 0, C.ink); for (let i = 0; i < 3; i++) K.circ(ctx, -34 + i * 34, 0, 11, ((u * 1.2) % 3) >= i ? C.orange : '#4B5E76'); }
  if (kind === 'map') { K.rr(ctx, -62, -50, 124, 100, 0, C.tealSoft); K.line(ctx, [[-62, 10], [-10, -8], [20, 20], [62, -6]], C.white, 8); K.pin(ctx, 18, 14, 0.62, C.red); }
  if (kind === 'def') K.defendersIcon(ctx, 0, 4, 0.82);
  if (kind === 'sun') K.sunflower(ctx, 0, 0, 1.05, u * 0.15);
  if (kind === 'clock') { K.circ(ctx, 0, 0, 58, C.teal); K.circ(ctx, 0, 0, 46, C.white); K.line(ctx, [[0, 0], [0, -30]], C.ink, 8); K.line(ctx, [[0, 0], [22, 10]], C.ink, 8); }
}
function sceneShows(ctx, u) {
  M.fill(ctx, C.night);
  const tk = K.pop(u, 88, SPRING.gentle);
  M.text(ctx, 'FOR SHOW ORGANISERS', 112 - (1 - tk) * 80, 92, F(34, 800), C.yellow, 'left', 3);
  M.text(ctx, 'Airshows can turn it down too', 110 - (1 - tk) * 120, 186, F(92, 800), C.paper);
  TILES.forEach(([label, kind], i) => {
    const a = 90 + i * 2, k = K.pop(u, a, SPRING.bouncy);
    if (k <= 0) return;
    const col = i % 3, row = Math.floor(i / 3), w = 540, h = 290, x = 110 + col * 580, y = 250 + row * 320 + (1 - k) * 120;
    K.rr(ctx, x, y, w, h, 0, C.paper);
    K.rr(ctx, x + 28, y + 28, 176, h - 56, 0, '#EFE7D6');
    ctx.save(); ctx.translate(x + 116, y + h / 2); const s = 0.85 + 0.15 * Math.min(1.1, k); ctx.scale(s, s); tileIcon(ctx, kind, u); ctx.restore();
    const f = F(46, 700), lines = K.wrap(ctx, label, f, w - 250);
    lines.forEach((l, j) => M.text(ctx, l, x + 232, y + h / 2 + 16 - (lines.length - 1) * 27 + j * 54, f, C.ink));
  });
  const bk = K.pop(u, 101.5, SPRING.gentle);
  if (bk > 0) M.text(ctx, 'Small changes. A bigger welcome.', 112 - (1 - bk) * 80, 990, F(60, 700), C.tealSoft);
}

// ---------------------------------------------------------------- 124-134 (drawn as 104-114): same sky
function scenePayoff(ctx, u) {
  showground(ctx, u);
  K.crowd(ctx, 20, 380, 735, 5, 0.9, 9, 1, u);
  const px = lerp(-350, 2300, prog(u, 104.2, 113.5)), py = 215 + Math.sin(u * 0.7) * 26;
  K.rings(ctx, px - 60, py, 210, C.teal, u, 3, 12);
  K.propPlane(ctx, px, py, 0.9, -0.05 + Math.cos(u * 0.7) * 0.03, u);
  K.beth(ctx, 1380, FEET + 12, 1.18, { mood: 'happy', headphones: '#3A3F4B', hold: 'camera', armL: [1.7, 1.2], armR: [1.7, 1.2], look: [0, -1], tilt: -0.06 });
  K.dad(ctx, 880, FEET + 8, 1.2, { mood: 'happy', look: [0, -1], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.relaxed, tilt: -0.04 });
  const fl = u > 106.5 ? K.flap(u, 3) : { armL: K.POSE.relaxed, armR: K.POSE.relaxed };
  const hop = u > 106.5 ? Math.abs(Math.sin(u * TAU * 1.5)) * -14 : 0;
  K.kid(ctx, 650, FEET + hop, 1.5, { mood: u > 106.5 ? 'grin' : 'happy', defenders: K.DEF, look: [0.3, -1], blinkU: u, ...fl });
  const lk = K.pop(u, 107.4);
  if (lk > 0) { ctx.save(); ctx.translate(360, 330); ctx.scale(lk, lk); K.pill(ctx, 0, 0, 'Happy flapping welcome', { align: 'center', size: 36, bg: C.paper, fg: C.ink }); ctx.restore(); }
  K.caption(ctx, u, 105.2, 113.2, 'Same sky. Room for everyone.', { w: 1300, size: 80 });
}

// ---------------------------------------------------------------- the cut
const SCENES = [[0, scenePile], [22, sceneTurn, 'circle'], [28, tip1], [38, tip2], [48, tip3], [58, tip4], [68, tip5], [78, tip6], [88, sceneNearby], [108, (ctx, u) => sceneShows(ctx, u - 20)], [124, (ctx, u) => scenePayoff(ctx, u - 20)]];
const PUSH = 0.9;
const ST = K.stretch([0, 22, 28, 38, 48, 58, 68, 78, 88, 108, 124, 132.9], 4);
M.film({
  fonts: K.FONTS,
  images: { logo: '../shared/logo.png' },
  hits: (HITS.map((h) => (h[0] >= 88 ? [h[0] + 20, ...h.slice(1)] : h)).concat(NEARBY_HITS).sort((a, b) => a[0] - b[0])).map((h) => [ST.out(h[0]), ...h.slice(1)]),
  samples: 6,
  draw(ctx, U, t, IMG) {
    const u = ST.src(U);   // every scene runs 4 beats (3 s) longer than it was written
    let i = 0; while (i + 1 < SCENES.length && u >= SCENES[i + 1][0] - PUSH) i++;
    const [a, fn, kind] = SCENES[i];
    if (i > 0 && u < a) {            // arriving: a page push, both shots on screen
      const p = E.inOutCubic(prog(u, a - PUSH, a));
      if (kind === 'circle') {
        SCENES[i - 1][1](ctx, u);
        ctx.save(); ctx.beginPath(); ctx.arc(720, 430, p * 1900, 0, TAU); ctx.clip(); fn(ctx, u); ctx.restore();
      } else {
        ctx.save(); ctx.translate(-p * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); SCENES[i - 1][1](ctx, u); ctx.restore();
        ctx.save(); ctx.translate((1 - p) * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); fn(ctx, u); ctx.restore();
      }
    } else fn(ctx, u);
    K.endCard(ctx, u - 20, 112.9, IMG, { cx: 650, cy: 500 });
  },
});
