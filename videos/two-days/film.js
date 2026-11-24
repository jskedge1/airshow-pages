// Two Days, Same Airshow: the same family at the same show, twice. Left half without a plan,
// right half with one. A clock in the divider steps through the day and each half carries a
// battery for Charlie's energy. 140 beats at 80 bpm (105 s). Pure function of time.
import * as K from '../shared/kit.js';
const { M, C, F } = K;
const { W, H, TAU, clamp, lerp, prog, E, springU, SPRING, kf, hash01, bump } = M;

const HW = 960;                     // each half is its own little stage, 960 wide
const GY = 520, FEET = 700;         // horizon and feet inside a half (the caption card sits below)
const SOFT = '#F7CDAE';             // a loud sound once it has been turned down
const HUM = '#C9A27A';
const CHAT = [C.grey, C.lilac, C.blue];

// The six moments: [start beat, clock]. Each one is 12 beats: one half plays, the other answers,
// then the tip card comes up.
const MO = [14, 26, 38, 50, 62, 74];
const JET_L = 40;
const NB = 86, T3 = 106, PAY = 124;   // people nearby, the third day, the payoff                   // the one loud moment (the warning chip counts down to it)

// Soft, low sounds only: this film is meant to be calm to watch.
const HITS = [
  [0.3, 'caption 1', 'tok', { pitch: 'D4', gain: 0.2 }],
  [8, 'labels', 'tok', { pitch: 'F#4', gain: 0.2 }], [8.5, 'label 2', 'blip', { pitch: 'A4', gain: 0.1 }],
  [10, 'battery left', 'blip', { pitch: 'D5', gain: 0.1 }], [10.5, 'battery right', 'blip', { pitch: 'F#5', gain: 0.1 }],
  ...[[14, '09:00'], [17.6, '11:00'], [26, '11:30'], [38, '12:00'], [50, '13:00'], [62, '14:30'], [74, '16:00']].map(([b, n]) => [b, `clock ${n}`, 'tick', { gain: 0.16 }]),
  // without a plan: a small falling note each time the battery drains
  ...[[20, 'queue'], [29, 'boxed in'], [41.2, 'surprise'], [53, 'generator'], [64.5, 'too much'], [77, 'stuck']].map(([b, n], i) => [b, `drain: ${n}`, 'pop', { pitch: ['A4', 'G4', 'F#4', 'E4', 'D4', 'B3'][i], gain: 0.14 }]),
  // with a plan: a small bell each time the plan works
  ...[[16, 'room to walk'], [30.5, 'end of line'], [44.4, 'programme'], [56, 'picnic'], [66.4, 'signal card'], [69.6, 'quiet space'], [79.4, 'route home']].map(([b, n], i) => [b, `plan: ${n}`, 'bell', { pitch: ['D5', 'F#5', 'A5', 'D5', 'E5', 'A5', 'F#5'][i], gain: 0.09 }]),
  [36, 'loud warning', 'tok', { pitch: 'A3', gain: 0.22 }],
  [JET_L + 0.9, 'the jet', 'whoosh', { len: 3.0, from: 140, to: 400, gain: 0.14, peak: 0.5 }],
  ...MO.map((a, i) => [a + (i === 0 ? 8 : 7.6), `tip ${i + 1}`, 'tok', { pitch: ['D4', 'E4', 'F#4', 'D4', 'E4', 'F#4'][i], gain: 0.22 }]),
  [70.2, 'beth', 'blip', { pitch: 'A4', gain: 0.1 }],
  [NB, 'clock back to 14:30', 'tick', { gain: 0.16 }], [NB + 0.3, 'people nearby', 'tok', { pitch: 'D4', gain: 0.22 }],
  [NB + 2.6, 'drain: stares', 'pop', { pitch: 'B3', gain: 0.14 }], [NB + 4.4, 'space', 'bell', { pitch: 'D5', gain: 0.09 }],
  ...[0, 1, 2, 3, 4].map((i) => [NB + 3.4 + i * 2.8, `nearby point ${i + 1}`, 'tok', { pitch: ['E4', 'F#4', 'A4', 'F#4', 'A4'][i], gain: 0.18 }]),
  [NB + 12.5, 'can I help', 'blip', { pitch: 'A4', gain: 0.1 }], [NB + 16, 'defenders on', 'pop', { pitch: 'C5', to: 'F4', gain: 0.14 }],
  [NB + 17.4, 'kindness', 'bell', { pitch: 'A5', gain: 0.1 }],
  [T3 + 0.6, 'third day', 'tok', { pitch: 'D4', gain: 0.24 }],
  ...[0, 1, 2, 3, 4, 5].map((i) => [T3 + 1.8 + i * 2, `tile ${i + 1}`, 'tok', { pitch: ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5'][i], gain: 0.16 }]),
  [T3 + 15, 'small changes', 'bell', { pitch: 'A5', gain: 0.1 }],
  [PAY, 'payoff', 'tok', { pitch: 'D4', gain: 0.22 }], [PAY + 2.2, 'battery full', 'bell', { pitch: 'D5', gain: 0.1 }],
  [PAY + 10, 'end card', 'bell', { pitch: 'A5', gain: 0.12 }],
];

// ---------------------------------------------------------------- small helpers
const armMix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const step = (u, on) => (on ? Math.sin(u * TAU * 1.5) : 0);
const hopBob = (u, on, ph = 0) => (on ? Math.abs(Math.sin(u * TAU * 1.5 + ph)) * -5 : 0);
function walkTo(u, a, b, x0, x1) { const p = K.ease(u, a, b); return { x: lerp(x0, x1, p), mv: p > 0 && p < 1, p }; }

// how grey the no-plan half is (it starts identical, then drains of colour)
const greyAt = (u) => K.ease(u, 4.6, 8.6);
function bg(ctx, u, plan, o = {}) {
  const g = plan ? 0 : greyAt(u);
  K.sky(ctx, M.mix(C.skyTop, '#D6DDE1', g), M.mix(C.skyLow, '#EBE9E4', g));
  K.clouds(ctx, u, 250, 5);
  K.horizon(ctx, GY, M.mix('#B9CBD3', '#C2C9CD', g));
  K.ground(ctx, GY, M.mix(C.grass, '#B5C5B0', g), M.mix(C.grass2, '#A0B39D', g));
  if (o.fence) K.fence(ctx, GY + 50, 0, HW);
}
// a label that pops in at a and tucks away at b. align: center | left | right
function tag(ctx, u, a, b, x, y, str, o = {}) {
  if (u < a || u > b) return;
  const k = Math.min(K.pop(u, a), 1 - E.inCubic(prog(u, b - 0.4, b)));
  if (k <= 0.01) return;
  const size = o.size || 46;
  ctx.font = F(size, 700); const w = ctx.measureText(str).width + 56;
  const cx = o.align === 'left' ? x + w / 2 : o.align === 'right' ? x - w / 2 : x;
  ctx.save(); ctx.translate(cx, y); ctx.scale(k, k); K.pill(ctx, 0, 0, str, { align: 'center', size, bg: o.bg || C.ink, fg: o.fg || C.paper }); ctx.restore();
}
function gate(ctx, x, y, s = 1) {
  K.at(ctx, x, y, s, 0, () => {
    K.rr(ctx, -166, -330, 24, 330, 0, C.wood); K.rr(ctx, 142, -330, 24, 330, 0, C.wood);
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-138 + i * 46, -262); ctx.lineTo(-92 + i * 46, -262); ctx.lineTo(-115 + i * 46, -222); ctx.closePath(); ctx.fillStyle = [C.yellow, C.red, C.paper][i % 3]; ctx.fill(); }
    K.rr(ctx, -190, -356, 380, 98, 0, C.teal);
    M.text(ctx, 'AIRSHOW', 0, -286, F(60, 800), C.white, 'center', 3);
  });
}
function wayOut(ctx, x, y, k = 1) {
  if (k <= 0) return;
  K.at(ctx, x, y, 1, 0, () => {
    K.rr(ctx, -6, -250 * k, 12, 250 * k, 0, C.greyDark);
    ctx.save(); ctx.translate(0, -250 * k); ctx.scale(k, k); K.rr(ctx, -112, -80, 224, 84, 0, C.sun); M.text(ctx, 'Way out', 0, -22, F(46, 800), C.white, 'center'); ctx.restore();
  });
}
function generator(ctx, x, y, u) {
  const j = Math.sin(u * 19) * 1.5;
  K.at(ctx, x, y + j, 1, 0, () => {
    K.rr(ctx, 40, -150, 16, 60, 0, C.greyDark);
    K.rr(ctx, -80, -104, 160, 92, 0, '#8793A1'); K.rr(ctx, -62, -86, 70, 40, 0, '#6B7786');
    for (let i = 0; i < 3; i++) K.rr(ctx, 22 + i * 16, -84, 8, 52, 0, '#6B7786');
    K.circ(ctx, -48, -10, 16, C.ink); K.circ(ctx, 48, -10, 16, C.ink);
  });
}
function rug(ctx, x, y, rx) {
  const quad = (w, h, col) => { ctx.beginPath(); ctx.moveTo(x - w + 40, y - h); ctx.lineTo(x + w - 40, y - h); ctx.lineTo(x + w, y + h); ctx.lineTo(x - w, y + h); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  quad(rx, rx * 0.15, C.pink); quad(rx * 0.86, rx * 0.105, '#F7D5CF');
}
// a figure in the crowd who walks to its place (so crowds gather rather than appear)
function gather(ctx, u, a, x, y, s, i, from = -1) {
  const p = K.ease(u, a, a + 1.6, E.outCubic);
  if (p <= 0) return;
  K.crowdPerson(ctx, x + from * (1 - p) * 700, y + (p < 1 ? Math.abs(Math.sin(u * TAU * 1.5 + i)) * -4 : Math.sin(u + i) * 1.5), s, i);
}

// ---------------------------------------------------------------- 0-14: the gate, twice
function hook(ctx, u, plan) {
  bg(ctx, u, plan);
  gate(ctx, 730, 706, 1);
  // one aeroplane crosses both halves: it is the same sky on both days
  const gx = lerp(-260, 2300, prog(u, -2.4, 9.5)) - plan * HW, gy = 318 + Math.sin(u * 0.8) * 16;
  K.rings(ctx, gx - 50, gy, 140, C.teal, u, 3, 9);
  K.propPlane(ctx, gx, gy, 0.72, -0.05, u);
  const exc = u < 3.4 || (u > 5 && u < 7.2);
  const fl = exc ? K.flap(u, 3) : { armL: K.POSE.relaxed, armR: K.POSE.relaxed };
  const look = [clamp((gx - 300) / 400, -1, 1), -1];
  K.dad(ctx, 480, FEET + 6, 1.1, { mood: 'happy', look, blinkU: u, blinkOff: 1.7, armL: K.POSE.relaxed, armR: u > 0.8 && u < 4.6 ? [2.2 + Math.sin(u * 3) * 0.08, 0.4] : K.POSE.relaxed });
  K.kid(ctx, 290, FEET + (exc ? Math.abs(Math.sin(u * TAU * 1.5)) * -14 : 0), 1.25, { mood: exc ? 'grin' : 'happy', look, blinkU: u, ...fl });
}

// ---------------------------------------------------------------- 14-26: 1 arriving
function m1(ctx, u, plan) {
  const a = MO[0];
  bg(ctx, u, plan);
  if (plan) {       // 09:00, the gates have just opened: room to walk
    gate(ctx, 240, 706, 1);
    const wk = walkTo(u, a + 0.3, a + 3.4, 240, 520), wd = walkTo(u, a + 0.3, a + 3.6, 90, 690);
    const zk = K.pop(u, a + 2.2, SPRING.gentle);
    if (zk > 0) { ctx.save(); ctx.globalAlpha = 0.5 * Math.min(1, zk); ctx.beginPath(); ctx.ellipse(590, 716, 300 * zk, 50 * zk, 0, 0, TAU); ctx.fillStyle = C.tealSoft; ctx.fill(); ctx.restore(); }
    K.staff(ctx, 860, FEET + 4, 1.0, { mood: 'happy', blinkU: u, blinkOff: 3, look: [-1, 0], armL: K.POSE.relaxed, armR: u < a + 4 ? [2.5 + Math.sin(u * TAU * 0.75) * 0.22, -0.25] : K.POSE.relaxed });
    K.dad(ctx, wd.x, FEET + 6, 1.1, { mood: 'happy', blinkU: u, blinkOff: 2, walk: step(u, wd.mv), bob: hopBob(u, wd.mv), armL: K.POSE.relaxed, armR: K.POSE.relaxed });
    const done = wk.p >= 1, flp = done && u < a + 6.4;
    K.kid(ctx, wk.x, FEET + (flp ? Math.abs(Math.sin(u * TAU * 1.5)) * -10 : 0), 1.25, { mood: flp ? 'grin' : 'happy', blinkU: u, walk: step(u + 0.3, wk.mv), bob: hopBob(u, wk.mv, 1), ...(flp ? K.flap(u, 3) : { armL: K.POSE.relaxed, armR: K.POSE.relaxed }) });
    tag(ctx, u, a + 2, a + 11.4, 500, 222, 'Gates open: lots of room', { bg: C.teal, fg: C.white });
  } else {          // the queue builds while the clock runs on to 11:00
    gate(ctx, 745, 706, 1);
    const q = K.ease(u, a + 0.6, a + 4);
    K.pebbles(ctx, 200, 275, 640, 170, 34, u, CHAT, { amt: q, size: 16 });
    for (let i = 0; i < 6; i++) gather(ctx, u, a + 0.5 + i * 0.42, 650 - i * 58 - 20, 676, 0.84, i + 3);
    const wd = walkTo(u, a + 4.3, a + 6.2, -140, 250), wk = walkTo(u, a + 4.3, a + 6, -260, 110);
    K.dad(ctx, wd.x, FEET + 6, 1.1, { mood: u > a + 6.6 ? 'worried' : 'neutral', look: [1, 0], blinkU: u, blinkOff: 2, walk: step(u, wd.mv), bob: hopBob(u, wd.mv), armL: K.POSE.relaxed, armR: K.POSE.relaxed });
    for (let i = 0; i < 6; i++) gather(ctx, u, a + 0.7 + i * 0.42, 662 - i * 58, 712, 0.9, i + 11);
    K.kid(ctx, wk.x, FEET + 4, 1.25, { mood: u > a + 6.4 ? 'worried' : 'neutral', look: [1, -0.3], blinkU: u, walk: step(u + 0.3, wk.mv), bob: hopBob(u, wk.mv, 1), armL: K.POSE.relaxed, armR: K.POSE.relaxed });
    tag(ctx, u, a + 4.8, a + 11.4, 480, 222, 'Two hours later: a long queue');
  }
}

// ---------------------------------------------------------------- 26-38: 2 choosing a spot
function m2(ctx, u, plan) {
  const a = MO[1];
  bg(ctx, u, plan, { fence: true });
  if (!plan) {      // boxed in, in the middle, under a loudspeaker
    const cl = K.ease(u, a + 0.4, a + 2.6, E.outCubic);
    K.crowd(ctx, 10, 950, 640, 9, 0.8, 4, 1, u);
    K.speakerPole(ctx, 790, 672, 0.96);
    const za = K.pop(u, a + 2.2, SPRING.gentle);
    if (za > 0) for (let i = 0; i < 3; i++) K.zig(ctx, 722, 372, -za * 360, 30, C.yellow, { u: u + i, rot: [0.2, 0.02, -0.16][i], n: 8, lw: 11 });
    K.pebbles(ctx, 20, 262, 560, 120, 26, u, CHAT, { amt: cl, size: 16 });
    K.dad(ctx, 500, FEET + 6, 1.1, { mood: u > a + 2.6 ? 'worried' : 'neutral', look: [1, -0.6], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.relaxed });
    const ears = springU(u, a + 2.7, SPRING.gentle);
    K.kid(ctx, 360, FEET + 4, 1.25 * (1 - 0.04 * ears), { mood: u > a + 2.5 ? 'worried' : 'neutral', look: [1, -0.5], blinkU: u, armL: armMix(K.POSE.relaxed, K.POSE.ears, ears), armR: armMix(K.POSE.relaxed, K.POSE.ears, ears) });
    K.crowd(ctx, lerp(-380, -40, cl), lerp(-100, 240, cl), 714, 4, 1.0, 2, 1, u);
    K.crowd(ctx, lerp(960, 620, cl), lerp(1340, 1000, cl), 714, 5, 1.0, 7, 1, u + 2);
    tag(ctx, u, a + 1.2, a + 9.4, 440, 222, 'Boxed in, under a loudspeaker');
  } else {          // the end of the line: space, and a clear way out
    K.speakerPole(ctx, 60, 660, 0.7);
    K.zig(ctx, 104, 440, 120, 14, C.yellow, { u, n: 5, lw: 7 });
    K.crowd(ctx, -70, 240, 708, 4, 0.95, 5, 1, u);
    const zk = K.pop(u, a + 4.4, SPRING.gentle);
    if (zk > 0) { ctx.save(); ctx.globalAlpha = 0.55 * Math.min(1, zk); ctx.beginPath(); ctx.ellipse(540, 716, 250 * zk, 48 * zk, 0, 0, TAU); ctx.fillStyle = C.tealSoft; ctx.fill(); ctx.restore(); }
    const rp = K.ease(u, a + 5.4, a + 6.6);
    K.route(ctx, [[690, 752], [770, 764], [850, 748]], rp, C.teal, 9);
    wayOut(ctx, 880, 708, K.pop(u, a + 6.2));
    K.dad(ctx, 610, FEET + 6, 1.1, { mood: 'happy', look: [0, -0.6], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: u > a + 5.6 && u < a + 8 ? K.POSE.point : K.POSE.relaxed });
    const hi = u > a + 4.6 && u < a + 6.4;
    K.kid(ctx, 460, FEET + 4, 1.25, { mood: 'happy', look: [0, -0.8], blinkU: u, armL: K.POSE.relaxed, armR: hi ? [2.5 + Math.sin(u * 5) * 0.2, -0.2] : K.POSE.relaxed });
    tag(ctx, u, a + 4.8, a + 9.4, 540, 222, 'Space, and a clear way out', { bg: C.teal, fg: C.white });
  }
}

// ---------------------------------------------------------------- 38-50: 3 the fast jet
function m3(ctx, u, plan) {
  const a = MO[2];
  bg(ctx, u, plan, { fence: true });
  if (!plan) {      // a surprise: the sound swells into one huge spiky shape
    K.crowd(ctx, -60, 190, 708, 3, 0.95, 2, 1, u); K.crowd(ctx, 730, 1000, 708, 3, 0.95, 7, 1, u + 2);
    const jx = lerp(-340, 1320, prog(u, a + 1.4, a + 4.8));
    const br = kf(u, [[a + 1.5, 0], [a + 3.1, 285], [a + 4.8, 300], [a + 6.6, 0]]);
    if (br > 0) { ctx.save(); ctx.globalAlpha = 0.93; K.burst(ctx, clamp(jx - 110, 330, 600), 318, br, C.orange, { n: 16, u: u * 2, seed: 3 }); ctx.restore(); }
    K.jet(ctx, jx, 300, 0.74, -0.04, { burn: true, u });
    const ears = springU(u, a + 2.2, SPRING.gentle);
    K.dad(ctx, 560, FEET + 6, 1.1, { mood: ears > 0.3 ? 'worried' : 'neutral', look: ears > 0.3 ? [-1, 0.6] : [0, -1], blinkU: u, blinkOff: 2, armL: armMix(K.POSE.relaxed, K.POSE.reach, ears), armR: K.POSE.relaxed });
    K.kid(ctx, 390, FEET + 4, 1.25 * (1 - 0.07 * ears), { mood: u < a + 1.7 ? 'neutral' : u < a + 2.3 ? 'worried' : u < a + 7 ? 'overwhelm' : 'worried', blinkU: u, tilt: -0.05 * ears, armL: armMix(K.POSE.relaxed, K.POSE.ears, ears), armR: armMix(K.POSE.relaxed, K.POSE.ears, ears) });
    tag(ctx, u, a + 2.8, a + 11.4, 40, 222, 'No warning: a big surprise', { align: 'left' });
  } else {          // Dad checked the programme: defenders on, the same jet is a soft shape
    const jx = lerp(-340, 1320, prog(u, a + 4.9, a + 8.6));
    const br = kf(u, [[a + 5, 0], [a + 6.3, 150], [a + 8.2, 150], [a + 9.2, 0]]);
    if (br > 0) K.burst(ctx, clamp(jx - 110, 190, 330), 372, br, SOFT, { n: 14, jag: 0.08, u });
    K.jet(ctx, jx, 352, 0.74, -0.04, { burn: true, u });
    const pt = springU(u, a + 4.4, SPRING.gentle) * (1 - K.ease(u, a + 7.4, a + 8.2));
    K.dad(ctx, 770, FEET + 6, 1.1, { mood: 'happy', look: [clamp((jx - 770) / 400, -1, 1), -1], blinkU: u, blinkOff: 2, armL: armMix(K.POSE.relaxed, [2.3, 0.3], pt), armR: K.POSE.hold, hold: 'checklist', ticks: u < a + 4.4 ? 2 : 3 });
    const up = u > a + 6.4 && u < a + 9.6;
    K.kid(ctx, 590, FEET + 4 + (up ? Math.abs(Math.sin(u * TAU * 1.5)) * -8 : 0), 1.25, { mood: u < a + 5.6 ? 'happy' : u < a + 6.4 ? 'wow' : 'grin', defenders: K.DEF, look: [clamp((jx - 590) / 400, -1, 1), -1], blinkU: u, ...(up ? K.flap(u, 3) : { armL: K.POSE.relaxed, armR: K.POSE.relaxed }) });
    tag(ctx, u, a + 4.5, a + 11.4, 924, 222, 'Dad checked the programme', { align: 'right', bg: C.teal, fg: C.white });
  }
}

// ---------------------------------------------------------------- 50-62: 4 lunch
function m4(ctx, u, plan) {
  const a = MO[3];
  bg(ctx, u, plan);
  if (!plan) {      // the food queue, right beside a generator
    K.foodVan(ctx, 770, 706, 0.98);
    generator(ctx, 96, 706, u);
    const ha = K.ease(u, a + 0.6, a + 2.6, E.outCubic);
    if (ha > 0) { K.hum(ctx, 150, 590, ha * 470, 15, HUM, u, 15); K.hum(ctx, 150, 640, ha * 380, 12, HUM, u + 1, 11); }
    K.pebbles(ctx, 400, 300, 500, 150, 20, u, CHAT, { size: 15 });
    K.crowd(ctx, 430, 590, 708, 2, 0.95, 3, 1, u);
    const ears = springU(u, a + 2.4, SPRING.gentle);
    K.dad(ctx, 345, FEET + 6, 1.1, { mood: u > a + 2.8 ? 'worried' : 'neutral', look: u > a + 2.8 ? [-1, 0.6] : [1, 0], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.relaxed });
    K.kid(ctx, 222, FEET + 4, 1.2 * (1 - 0.05 * ears), { mood: u > a + 2 ? 'worried' : 'neutral', blinkU: u, tilt: 0.05 * ears, armL: armMix(K.POSE.relaxed, K.POSE.ears, ears), armR: armMix(K.POSE.relaxed, K.POSE.ears, ears) });
    tag(ctx, u, a + 1.2, a + 11.4, 480, 222, 'A long queue by a generator');
  } else {          // a picnic on a rug, back from the crowd
    K.fence(ctx, GY + 30, 0, HW);
    K.crowd(ctx, 30, 930, 560, 15, 0.34, 5, 1, u);
    rug(ctx, 470, 720, 350);
    K.dad(ctx, 650, 716, 1.05, { sit: 1, flip: true, mood: 'happy', blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.hold });
    K.kid(ctx, 320, 714, 1.22, { sit: 1, mood: u > a + 5.6 ? 'grin' : 'happy', defenders: K.DEF, blinkU: u, look: [0.6, 0.2], armL: K.POSE.hold, armR: K.POSE.hold });
    const sk = K.pop(u, a + 4.5), bk = K.pop(u, a + 5.1);
    if (sk > 0) K.snack(ctx, 486, 700, 0.66 * sk);
    if (bk > 0) K.bottle(ctx, 196, 694, 0.62 * bk);
    tag(ctx, u, a + 4.8, a + 11.4, 480, 222, 'A picnic, back from the crowd', { bg: C.teal, fg: C.white });
  }
}

// ---------------------------------------------------------------- 62-74: 5 too much
function m5(ctx, u, plan) {
  const a = MO[4];
  bg(ctx, u, plan);
  if (!plan) {      // nowhere to go. Shown gently: small, hands over ears, Dad close by
    const cl = K.ease(u, a + 0.3, a + 3.2);
    K.crowd(ctx, 0, 950, 636, 10, 0.84, 4, 1, u);
    K.pebbles(ctx, 10, 250, 900, 190, 44, u, CHAT, { amt: lerp(0.45, 1, cl), size: lerp(15, 21, cl) });
    K.zig(ctx, 960, 420, -lerp(120, 300, cl), 24, C.yellow, { u, n: 7, lw: 10 });
    K.crowd(ctx, lerp(-90, -30, cl), lerp(190, 250, cl), 712, 4, 1.04, 2, 1, u);
    K.crowd(ctx, lerp(760, 700, cl), lerp(1060, 1000, cl), 712, 4, 1.04, 7, 1, u + 2);
    const ears = springU(u, a + 1.2, SPRING.gentle), near = K.ease(u, a + 2, a + 3.4);
    K.dad(ctx, lerp(585, 555, near), 712, 1.0, { sit: 1, mood: 'worried', look: [-1, 0.4], blinkU: u, blinkOff: 2, tilt: -0.06 * near, armL: armMix(K.POSE.relaxed, [1.25, 0.25], near), armR: K.POSE.relaxed });
    K.kid(ctx, 400, 710, 1.08, { sit: 1, mood: ears > 0.5 ? 'overwhelm' : 'worried', blinkU: u, tilt: 0.1 * ears, lean: 0.06 * ears, armL: armMix(K.POSE.relaxed, K.POSE.ears, ears), armR: armMix(K.POSE.relaxed, K.POSE.ears, ears) });
    tag(ctx, u, a + 1.6, a + 11.4, 480, 222, 'Too much, and nowhere to go');
  } else {          // the signal card, then the quiet space. Beth is there too
    K.tent(ctx, 640, 706, 1.0, C.tealSoft, C.teal, 'Quiet space');
    const calm = K.ease(u, a + 7.4, a + 8.6);
    if (calm > 0) K.rings(ctx, 640, 330, 110 * calm, C.teal, u * 0.6, 2, 6);
    K.beth(ctx, 888, FEET + 6, 1.0, { mood: 'calm', headphones: '#3A3F4B', hold: 'camera', armL: K.POSE.hold, armR: K.POSE.hold });
    const up = springU(u, a + 4.3, SPRING.gentle) * (1 - K.ease(u, a + 6.2, a + 7));
    const wk = walkTo(u, a + 5.9, a + 7.6, 170, 395), wd = walkTo(u, a + 6.1, a + 7.6, 320, 250);
    K.dad(ctx, wd.x, FEET + 6, 1.1, { mood: 'happy', look: [u < a + 5.9 ? -1 : 1, 0.3], blinkU: u, blinkOff: 2, walk: step(u, wd.mv), bob: hopBob(u, wd.mv), armL: K.POSE.relaxed, armR: u > a + 5 && u < a + 6.4 ? K.POSE.point : K.POSE.relaxed });
    K.kid(ctx, wk.x, FEET + 4, lerp(1.25, 1.08, wk.p), { mood: wk.p >= 1 ? 'calm' : u < a + 4.3 ? 'neutral' : 'worried', defenders: K.DEF, blinkU: u, walk: step(u + 0.3, wk.mv), bob: hopBob(u, wk.mv, 1), armL: K.POSE.relaxed, armR: armMix(K.POSE.relaxed, [2.0, 0.5], up), hold: 'card', cardCol: C.red });
    tag(ctx, u, a + 4.6, a + 6.6, 190, 268, 'I need a break', { bg: C.red, fg: C.white, size: 40 });
    tag(ctx, u, a + 8.2, a + 11.4, 730, 222, 'Beth is autistic too', { bg: '#6E5AA8', fg: C.white });
  }
}

// ---------------------------------------------------------------- 74-86: 6 going home
function m6(ctx, u, plan) {
  const a = MO[5];
  bg(ctx, u, plan);
  if (!plan) {      // stayed to the very end: stuck in the crowd, both worn out
    const dr = (u - a) * 7;
    K.crowd(ctx, -40 + dr, 960 + dr, 632, 11, 0.84, 4, 1, u * 2);
    K.pebbles(ctx, 10, 250, 900, 170, 40, u, CHAT, { size: 18 });
    K.crowd(ctx, -120 + dr, 250 + dr, 706, 4, 1.0, 2, 1, u * 2);
    K.crowd(ctx, 650 + dr, 1010 + dr, 706, 4, 1.0, 7, 1, u * 2 + 2);
    const sl = Math.sin(u * TAU * 0.5);
    K.dad(ctx, 545 + dr * 0.5, FEET + 6, 1.1, { mood: 'worried', look: [-1, 0.6], blinkU: u, blinkOff: 2, tilt: 0.05, walk: sl * 0.5, armL: K.POSE.relaxed, armR: K.POSE.relaxed });
    K.kid(ctx, 400 + dr * 0.5, FEET + 4, 1.15, { mood: 'overwhelm', blinkU: u, tilt: 0.12, lean: 0.05, walk: -sl * 0.5, armL: K.POSE.ears, armR: K.POSE.ears });
    K.crowdPerson(ctx, 150 + dr, 760, 1.15, 5); K.crowdPerson(ctx, 800 + dr, 764, 1.15, 8);
    tag(ctx, u, a + 1.2, a + 11.4, 480, 222, 'Stayed late. Stuck in the crowd');
  } else {          // a little early, by the route they planned, still on a high
    K.car(ctx, 770, 708, 0.8, C.blue);
    const rp = K.ease(u, a + 4.2, a + 5.6);
    K.route(ctx, [[30, 748], [220, 764], [420, 756], [590, 742]], rp, C.teal, 9);
    const pk = K.pop(u, a + 5.6); if (pk > 0) K.pin(ctx, 770, 540 - (1 - Math.min(1, pk)) * 60, 0.9 * Math.min(1.1, pk), C.red);
    const wk = walkTo(u, a + 4.6, a + 7, 130, 360), wd = walkTo(u, a + 4.6, a + 7.1, 280, 520);
    const hi = wk.p >= 1;
    K.dad(ctx, wd.x, FEET + 6, 1.1, { mood: 'happy', blinkU: u, blinkOff: 2, look: [-0.6, 0.3], walk: step(u, wd.mv), bob: hopBob(u, wd.mv), armL: K.POSE.relaxed, armR: K.POSE.relaxed });
    K.kid(ctx, wk.x, FEET + 4 + (hi ? Math.abs(Math.sin(u * TAU * 1.5)) * -12 : 0), 1.25, { mood: hi ? 'grin' : 'happy', defenders: K.DEF, blinkU: u, walk: step(u + 0.3, wk.mv), bob: hopBob(u, wk.mv, 1), ...(hi ? K.flap(u, 3) : { armL: K.POSE.relaxed, armR: K.POSE.relaxed }) });
    tag(ctx, u, a + 5, a + 11.4, 480, 222, 'Left a little early, still smiling', { bg: C.teal, fg: C.white });
  }
}

// ---------------------------------------------------------------- 86-106: the people nearby
// The hard moment again, on both sides. This time the only difference is the people around them.
const BY = [
  { adult: true, skin: '#E6B892', hair: '#8A6A48', hairStyle: 'bob', top: '#8C7FA8', bottom: '#4A5568', shoe: '#2B2B33' },
  { adult: true, skin: '#C99672', hair: '#2B2622', hairStyle: 'short', top: '#5F8F9E', bottom: '#3E4756', shoe: '#2B2B33' },
];
function phone(ctx, x, y) { K.rr(ctx, x - 20, y - 36, 40, 72, 0, C.ink); K.rr(ctx, x - 15, y - 30, 30, 54, 0, C.greyDark); K.circ(ctx, x, y - 18, 6, C.ink); }
function nb(ctx, u, plan) {
  const a = NB;
  bg(ctx, u, plan);
  K.crowd(ctx, 0, 950, 636, 10, 0.84, 4, 1, u);
  if (!plan) {      // staring, comments, phones out
    const cl = K.ease(u, a + 0.4, a + 2.6);
    [[345, 348, 'Tut!'], [565, 346, 'Look!']].forEach(([x, y, w], i) => {
      const k = K.ease(u, a + 1.6 + i * 0.7, a + 2.6 + i * 0.7, E.outCubic);
      if (k > 0) { K.burst(ctx, x, y, 84 * k, C.greyDark, { n: 9, u, seed: 5 + i, squash: 0.72 }); if (k > 0.6) M.text(ctx, w, x, y + 14, F(40 * k, 800), C.paper, 'center'); }
    });
    const ax = lerp(60, 170, cl), bx = lerp(920, 815, cl);
    K.person(ctx, ax, FEET + 6, 1.0, { ...BY[0], mood: 'neutral', look: [1, 0.7], blinkU: u, blinkOff: 3, armL: K.POSE.hip, armR: armMix(K.POSE.relaxed, [1.35, 0.1], cl) });
    K.person(ctx, bx, FEET + 6, 1.0, { ...BY[1], flip: true, mood: 'neutral', look: [1, 0.7], blinkU: u, blinkOff: 1, armL: K.POSE.relaxed, armR: armMix(K.POSE.relaxed, [1.9, 0.9], cl) });
    if (cl > 0.85) phone(ctx, bx - 125, FEET + 6 - 372);
    K.dad(ctx, 570, 712, 1.0, { sit: 1, mood: 'worried', look: [-1, 0.4], blinkU: u, blinkOff: 2, tilt: -0.06, armL: [1.25, 0.25], armR: K.POSE.relaxed });
    K.kid(ctx, 415, 710, 1.08, { sit: 1, mood: 'overwhelm', tilt: 0.1, lean: 0.06, armL: K.POSE.ears, armR: K.POSE.ears });
    tag(ctx, u, a + 1.4, a + 19, 480, 222, 'Staring, comments, phones out');
  } else {          // space, patience, a kind word
    const back = K.ease(u, a + 3.6, a + 5.2), near = K.ease(u, a + 11.8, a + 13), calm = K.ease(u, a + 15, a + 16.6);
    const zk = K.pop(u, a + 4.4, SPRING.gentle);
    if (zk > 0) { ctx.save(); ctx.globalAlpha = 0.55 * Math.min(1, zk); ctx.beginPath(); ctx.ellipse(495, 722, 300 * zk, 52 * zk, 0, 0, TAU); ctx.fillStyle = C.tealSoft; ctx.fill(); ctx.restore(); }
    const ax = lerp(170, 70, back), bx = lerp(815, 895, back) - near * 150;
    const mvA = back > 0 && back < 1, mvB = mvA || (near > 0 && near < 1);
    const smile = u > a + 9;
    K.person(ctx, ax, FEET + 6, 1.0, { ...BY[0], mood: smile ? 'happy' : 'calm', look: [1, 0.5], blinkU: u, blinkOff: 3, walk: step(u, mvA), bob: hopBob(u, mvA), armL: K.POSE.relaxed, armR: smile && u < a + 11.4 ? [2.4 + Math.sin(u * TAU * 0.75) * 0.18, -0.2] : K.POSE.relaxed });
    K.person(ctx, bx, FEET + 6, 1.0, { ...BY[1], flip: true, mood: near > 0.5 ? 'happy' : 'calm', look: [1, 0.4], blinkU: u, blinkOff: 1, walk: step(u, mvB), bob: hopBob(u, mvB), armL: K.POSE.relaxed, armR: K.POSE.relaxed });
    K.dad(ctx, 570, 712, 1.0, { sit: 1, mood: near > 0.9 ? 'happy' : 'worried', look: near > 0.5 ? [1, -0.6] : [-1, 0.4], blinkU: u, blinkOff: 2, tilt: -0.06, armL: [1.25, 0.25], armR: K.POSE.relaxed });
    const on = u > a + 16, hy = 710 - 153 * 1.08;
    K.kid(ctx, 415, 710, 1.08, { sit: 1, mood: calm > 0.7 ? 'calm' : u > a + 6 ? 'worried' : 'overwhelm', defenders: on ? K.DEF : null, tilt: 0.1 * (1 - calm) + Math.sin(u * TAU * 0.5) * 0.05 * calm, lean: 0.06 * (1 - calm), armL: armMix(K.POSE.ears, K.POSE.hold, calm), armR: armMix(K.POSE.ears, K.POSE.hold, calm) });
    if (!on && u > a + 14.6) { const dk = K.ease(u, a + 14.6, a + 16); K.defendersIcon(ctx, lerp(545, 415, dk), lerp(505, hy, dk) - Math.sin(dk * Math.PI) * 70, lerp(0.7, 1.02, dk), K.DEF, lerp(0.4, 0, dk)); }
    tag(ctx, u, a + 12.5, a + 15.2, 730, 300, 'Can I help?', { bg: BY[1].top, fg: C.white });
    tag(ctx, u, a + 4.6, a + 19, 480, 222, 'Space, patience, a kind word', { bg: C.teal, fg: C.white });
  }
}
function kickCard(ctx, u, a, b, kick, str) {
  if (u < a - 0.1 || u > b) return;
  const k = springU(u, a, SPRING.gentle), out = E.inCubic(prog(u, b - 0.5, b));
  const w = 1500, h = 212, x = (W - w) / 2, y = H - 70 - h + (1 - k) * (h + 140) + out * (h + 140);
  ctx.save(); ctx.globalAlpha *= 0.16; K.rr(ctx, x + 6, y + 12, w, h, 0, '#000'); ctx.restore();
  K.rr(ctx, x, y, w, h, 0, C.paper);
  M.text(ctx, kick, x + 48, y + 70, F(38, 800), C.teal, 'left', 2.5);
  M.text(ctx, str, x + 46, y + 158, F(70, 700), C.ink);
}
const POINTS = ['It is overload, not bad behaviour', 'Give space. Please do not stare or film', 'Skip the advice. A kind smile helps', 'Ask the grown-up: can I help?', 'Flapping, rocking and ear defenders are all fine'];

// ---------------------------------------------------------------- the split screen
const HALF = [[0, hook], [MO[0], m1], [MO[1], m2], [MO[2], m3], [MO[3], m4], [MO[4], m5], [MO[5], m6], [NB, nb]];
const PUSH = 0.9;
// how much a half is veiled while the other half is the one to watch (0..1)
function veil(u, plan) {
  let v = 0;
  MO.forEach((a, i) => {
    const first = i === 0 ? 1 : 0;      // which half plays first (moment 1 runs in clock order)
    const end = a + (i === 0 ? 8.2 : 7.8);
    const w = plan === first ? K.ease(u, a + 3.9, a + 4.5) * (1 - K.ease(u, end - 0.6, end)) : K.ease(u, a - 0.7, a - 0.1) * (1 - K.ease(u, a + 3.7, a + 4.3));
    v = Math.max(v, w);
  });
  // the people nearby: left plays, then the right answers and carries the five points
  const n = plan ? K.ease(u, NB - 0.7, NB - 0.1) * (1 - K.ease(u, NB + 3, NB + 3.6)) : 0.8 * K.ease(u, NB + 3.3, NB + 3.9) * (1 - K.ease(u, T3 - 1.6, T3 - 1));
  return Math.max(v, n);
}
const BATT = [
  [[0, 1], [20, 0.8], [29, 0.62], [41.2, 0.38], [53, 0.24], [64.5, 0.08], [77, 0.02], [NB - 0.3, 0.1], [NB + 2.6, 0.02]],
  [[0, 1], [17, 0.97], [30.5, 0.93], [45, 0.86], [56, 0.94], [66.4, 0.72], [69.6, 0.9], [79.4, 0.82], [NB - 0.3, 0.1], [NB + 4.6, 0.16], [NB + 9.2, 0.22], [NB + 13, 0.3], [NB + 16.2, 0.4]],
];
const battV = (u, plan) => M.springKeys(u, BATT[plan], SPRING.gentle);
function batteryCard(ctx, x, y, v, k, pulse = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x + 150, y + 62); ctx.scale(k * (1 + 0.06 * pulse), k * (1 + 0.06 * pulse)); ctx.translate(-(x + 150), -(y + 62));
  ctx.save(); ctx.globalAlpha *= 0.14; K.rr(ctx, x - 12, y - 4, 344, 148, 0, '#000'); ctx.restore();
  K.rr(ctx, x - 18, y - 12, 344, 148, 0, C.paper);
  K.battery(ctx, x, y, 290, 76, v);
  M.text(ctx, "Charlie's energy", x + 152, y + 119, F(40, 700), C.ink, 'center');
  ctx.restore();
}
function halfScene(ctx, u, plan, shift) {
  ctx.save(); ctx.translate(plan ? HW + shift : -shift, 0); ctx.beginPath(); ctx.rect(0, 0, HW, H); ctx.clip();
  let i = 0; while (i + 1 < HALF.length && u >= HALF[i + 1][0] - PUSH) i++;
  const [a, fn] = HALF[i];
  const one = (f, dx) => { ctx.save(); ctx.translate(dx, 0); ctx.beginPath(); ctx.rect(0, 0, HW, H); ctx.clip(); f(ctx, u, plan); ctx.restore(); };
  if (i > 0 && u < a) { const p = E.inOutCubic(prog(u, a - PUSH, a)); one(HALF[i - 1][1], -p * HW); one(fn, (1 - p) * HW); } else one(fn, 0);
  // the no-plan day is a little greyer
  const g = plan ? 0 : greyAt(u);
  if (g > 0) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.42 * g; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, HW, H); ctx.restore(); }
  const v = veil(u, plan);
  if (v > 0) { ctx.save(); ctx.globalAlpha = 0.42 * v; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, HW, H); ctx.restore(); }
  ctx.restore();
}
function halfHeader(ctx, u, plan, shift) {
  ctx.save(); ctx.translate(plan ? HW + shift : -shift, 0); ctx.beginPath(); ctx.rect(0, 0, HW, H); ctx.clip();
  // the divider belongs to both halves, so it parts with them
  ctx.fillStyle = C.paper; ctx.fillRect(plan ? 0 : HW - 6, 0, 6, H);
  const swap = u > NB - 0.4;
  const lk = swap ? springU(u, NB + (plan ? 0.5 : 0.1), SPRING.gentle) : springU(u, plan ? 8.5 : 8, SPRING.gentle) * (1 - K.ease(u, NB - 1, NB - 0.4));
  if (lk > 0) {
    const str = swap ? (plan ? 'People are kind' : 'People stare') : plan ? 'With a plan' : 'Without a plan';
    ctx.font = F(40, 700); const w = ctx.measureText(str).width + 56;
    ctx.save(); ctx.translate(0, -(1 - lk) * 160); K.pill(ctx, plan ? HW - 28 - w : 28, 62, str, { size: 40, bg: plan ? C.teal : C.greyDark, fg: C.white }); ctx.restore();
  }
  const keys = BATT[plan]; let pulse = 0;
  for (let i = 1; i < keys.length; i++) pulse = Math.max(pulse, bump(u, keys[i][0] + 0.3, 0.7));
  batteryCard(ctx, plan ? 246 : 400, 26, battV(u, plan), K.pop(u, plan ? 10.5 : 10), pulse);
  ctx.restore();
}
const CLOCK = [[9.4, '08:45'], [14, '09:00'], [16.3, '09:30'], [16.7, '10:00'], [17.1, '10:30'], [17.5, '11:00'], [26, '11:30'], [38, '12:00'], [50, '13:00'], [62, '14:30'], [74, '16:00'], [NB, '14:30']];
function clock(ctx, u) {
  const k = Math.min(K.pop(u, 9.4), 1 - E.inCubic(prog(u, T3 - 1.3, T3 - 0.8)));
  if (k <= 0.01) return;
  let i = 0; while (i + 1 < CLOCK.length && u >= CLOCK[i + 1][0] - 0.15) i++;
  const roll = i > 0 ? E.outCubic(prog(u, CLOCK[i][0] - 0.15, CLOCK[i][0] + 0.25)) : 1;
  const w = 236, h = 92, x = W / 2, y = 62;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  K.rr(ctx, -w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 0, C.paper);
  K.rr(ctx, -w / 2, -h / 2, w, h, 0, C.ink);
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2 + 6, w, h - 12); ctx.clip();
  const f = F(64, 800);
  if (roll < 1) M.text(ctx, CLOCK[i - 1][1], 0, 22 - roll * 90, f, C.paper, 'center', 1);
  M.text(ctx, CLOCK[i][1], 0, 22 + (1 - roll) * 90, f, C.paper, 'center', 1);
  ctx.restore(); ctx.restore();
}
const NAMES = ['Arriving', 'Choosing a spot', 'The fast jet', 'Lunch', 'Too much', 'Going home'];
const TIPS = [
  ['Arrive when the gates open', 'The first hour is the calmest.'],
  ['Sit at the end of the crowd line', 'Fewer people, and away from the loudspeakers.'],
  ['Ear defenders on before the loud bits', 'Check the flying programme so nothing is a surprise.'],
  ['Take breaks before they are needed', 'Bring food you know. Eat away from the queues and generators.'],
  ['Agree a signal and find the quiet space', 'Quiet spaces are for adults too.'],
  ['Leave while it is still a good day', 'Leaving early is not failing. It is the plan working.'],
];
function sceneSplit(ctx, u) {
  const open = E.inOutCubic(prog(u, T3 - 0.8, T3 + 0.9)), shift = open * HW;
  if (open > 0) sceneShows(ctx, u);
  if (open >= 1) return;
  halfScene(ctx, u, 0, shift); halfScene(ctx, u, 1, shift);
  K.loudChip(ctx, u, JET_L, { x: 710, y: 168, hold: 5.6 });
  halfHeader(ctx, u, 0, shift); halfHeader(ctx, u, 1, shift);
  clock(ctx, u);
  // a promise to the viewer, right at the start
  const ck = Math.min(springU(u, 0.5, SPRING.gentle), 1 - E.inCubic(prog(u, 4.4, 5)));
  if (ck > 0.01) { ctx.save(); ctx.translate(60, 76 - (1 - ck) * 200); K.pill(ctx, 0, 0, 'A calm video: no sudden sounds, no flashing', { size: 40, bg: C.teal, fg: C.white }); ctx.restore(); }
  K.caption(ctx, u, 0.2, 7.7, 'Same family. Same airshow. Two very different days.', { w: 1010, size: 70 });
  K.caption(ctx, u, 8.3, 13.5, 'Charlie is autistic. Noise and crowds use up energy fast.', { w: 1120, size: 66 });
  kickCard(ctx, u, NB + 0.3, NB + 3.3, 'IF YOU ARE STANDING NEARBY', 'The people around you change the day too');
  POINTS.forEach((str, i) => K.caption(ctx, u, NB + 3.4 + i * 2.8, NB + 6.2 + i * 2.8, str, { w: i === 4 ? 1640 : 1400, size: 68 }));
  K.caption(ctx, u, NB + 17.4, T3 - 0.7, 'Kindness costs nothing.', { w: 1120, size: 84, dark: true });
  NAMES.forEach((str, i) => K.caption(ctx, u, MO[i] + 0.15, MO[i] + (i === 0 ? 8 : 7.6), str, { num: i + 1, w: 300 + str.length * 38, size: 70 }));
  TIPS.forEach(([str, sub], i) => { const a = MO[i] + (i === 0 ? 8 : 7.6); K.caption(ctx, u, a, MO[i] + 11.3, str, { num: i + 1, sub, w: 1560 }); });
}

// ---------------------------------------------------------------- 106-124: the third day
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
  const tk = K.pop(u, T3 + 0.6, SPRING.gentle);
  if (tk > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, tk * 2.5);
    M.text(ctx, 'FOR SHOW ORGANISERS', 112 - (1 - tk) * 80, 92, F(36, 800), C.yellow, 'left', 3);
    M.text(ctx, 'A third day: when the airshow plans too', 110 - (1 - tk) * 120, 186, F(86, 800), C.paper);
    ctx.restore();
  }
  TILES.forEach(([label, kind], i) => {
    const a = T3 + 1.8 + i * 2, k = K.pop(u, a, SPRING.bouncy);
    if (k <= 0) return;
    const col = i % 3, row = Math.floor(i / 3), w = 540, h = 290, x = 110 + col * 580, y = 250 + row * 320 + (1 - k) * 120;
    K.rr(ctx, x, y, w, h, 0, C.paper);
    K.rr(ctx, x + 22, y + h / 2 - 80, 160, 160, 0, '#EFE7D6');
    ctx.save(); ctx.translate(x + 102, y + h / 2); const s = 0.72 + 0.14 * Math.min(1.1, k); ctx.scale(s, s); tileIcon(ctx, kind, u); ctx.restore();
    const f = F(50, 700), lines = K.wrap(ctx, label, f, w - 226);
    lines.forEach((l, j) => M.text(ctx, l, x + 204, y + h / 2 + 17 - (lines.length - 1) * 29 + j * 58, f, C.ink));
  });
  const bk = K.pop(u, T3 + 15, SPRING.gentle);
  if (bk > 0) M.text(ctx, 'Small changes. A bigger welcome.', 112 - (1 - bk) * 80, 990, F(62, 700), C.tealSoft);
}

// ---------------------------------------------------------------- 124-133: one day, full width
function scenePayoff(ctx, u) {
  const gy = 560, feet = 750;
  K.sky(ctx); K.clouds(ctx, u, 190, 5); K.horizon(ctx, gy); K.ground(ctx, gy); K.fence(ctx, gy + 54);
  K.crowd(ctx, 1560, 1900, 735, 5, 0.9, 9, 1, u);
  const px = lerp(420, 2250, prog(u, PAY - 0.4, PAY + 9.5)), py = 180 + Math.sin(u * 0.7) * 12;
  K.rings(ctx, px - 40, py, 180, C.teal, u, 3, 11);
  K.propPlane(ctx, px, py, 0.8, -0.05 + Math.cos(u * 0.7) * 0.03, u);
  const look = [clamp((px - 900) / 500, -1, 1), -1];
  K.beth(ctx, 1290, feet + 12, 1.18, { mood: 'happy', headphones: '#3A3F4B', hold: 'camera', armL: [1.7, 1.2], armR: [1.7, 1.2], look, tilt: -0.06 });
  K.dad(ctx, 900, feet + 8, 1.2, { mood: 'happy', look, blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.relaxed, tilt: -0.04 });
  const on = u > PAY + 2.2;
  K.kid(ctx, 670, feet + (on ? Math.abs(Math.sin(u * TAU * 1.5)) * -14 : 0), 1.5, { mood: on ? 'grin' : 'happy', defenders: K.DEF, look, blinkU: u, ...(on ? K.flap(u, 3) : { armL: K.POSE.relaxed, armR: K.POSE.relaxed }) });
  const v = M.springKeys(u, [[PAY, 0.82], [PAY + 2.2, 1]], SPRING.gentle);
  ctx.save(); ctx.translate(60, 40); ctx.scale(1.15, 1.15); batteryCard(ctx, 18, 12, v, K.pop(u, PAY + 0.3, SPRING.gentle), bump(u, PAY + 2.5, 0.7)); ctx.restore();
  K.caption(ctx, u, PAY + 1, PAY + 9.2, 'Same airshow. A day worth remembering.', { w: 1330, size: 74 });
}

// ---------------------------------------------------------------- the cut
const ST = K.stretch([0, 14, 26, 38, 50, 62, 74, 86, 106, 124, 144, 152.9], 4);
M.film({
  fonts: K.FONTS,
  images: { logo: '../shared/logo.png' },
  hits: K.hitsWithFacts(HITS, 124).map((h) => [ST.out(h[0]), ...h.slice(1)]),
  samples: 6,
  // every scene runs 4 beats (3 s) longer than it was written, and the awareness section sits before the last scene
  draw(ctx, U, t, IMG) { K.drawWithFacts(ctx, ST.src(U), IMG, base, 124); },
});
// the film as it was written, before the stretch and the awareness section
function base(ctx, u, IMG) {
    if (u < PAY - PUSH) sceneSplit(ctx, u);
    else if (u < PAY) {              // a page push, both shots on screen
      const p = E.inOutCubic(prog(u, PAY - PUSH, PAY));
      ctx.save(); ctx.translate(-p * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); sceneShows(ctx, u); ctx.restore();
      ctx.save(); ctx.translate((1 - p) * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); scenePayoff(ctx, u); ctx.restore();
    } else scenePayoff(ctx, u);
    K.endCard(ctx, u, PAY + 8.9, IMG, { cx: 650, cy: 500 });
}
