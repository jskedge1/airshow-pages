// Your first airshow photos: pure function of time. window.seek(t) paints frame t.
// Timing is in beats (u) on the measured grid (84 bpm). docs/shotlist.md is the plan.
import * as M from './lib/motion.js';

const { W, H, E, prog, lerp, clamp, springU, SPRING, wobble, font, layout, text, fill, rrect, hash01, TAU, bump, kf } = M;

// ---------------------------------------------------------------- palette (UK Airshow Guide)
const C = {
  navy: '#13293C', blue: '#1D63B7', teal: '#32B4AF', tealD: '#1A8580', red: '#D7263D',
  sky: '#DCE6EE', sky2: '#C9D6E0', white: '#FFFFFF', off: '#F3F6F8',
  grass: '#9BCF86', grass2: '#7DBA6A', sand: '#F1DCAE', sea: '#5AA9CF', sea2: '#3E8DB5',
  gold: '#F5B942', grey: '#A9B6C1', grey2: '#7F93A3', pink: '#F4A9BC',
  skin1: '#F3C9A8', skin2: '#D39B72', skin3: '#8F5C3E',
};
const DISPLAY = 'Display', UI = 'UI';
const LW = 6;               // cartoon outline width
const GY = 905;             // ground line (stage)
// Scenes are drawn on a 1920x1080 stage. 16:9 shows the stage as is; 9:16 crops the art half of
// the stage into the lower part of the frame and lays the text box out natively above it.
const SW = 1920, SH = 1080;
const PORTRAIT = M.FORMAT.portrait;
const STAGE = { w: SW, h: SH, gy: GY }, PSURF = { w: W, h: H, gy: 1537 };
let G = STAGE;              // the surface currently being drawn (helpers read it)
function sfill(ctx, color) { ctx.fillStyle = color; ctx.fillRect(0, 0, G.w, G.h); }

// ---------------------------------------------------------------- timeline (beats)
const INTRO = 8, STEP = 12, NSTEP = 8, OUTRO = INTRO + STEP * NSTEP; // 104
const st = (i) => INTRO + STEP * i;  // start beat of step i (0-based)

// ---------------------------------------------------------------- copy
const STEPS = [
  { title: 'Use the camera you own', q: 'No need for pro kit to start', b: ['Any camera from the last ten years', 'Crop sensors add extra reach', 'Spend on the lens before the body'] },
  { title: 'Get a long lens', q: 'Aircraft are a long way off', b: ['Start with a 70 to 300mm zoom', 'Then 150 to 600mm once hooked', 'Turn image stabilisation on'] },
  { title: 'Set up before the flying', q: 'Practise on the arrivals', b: ['Shutter priority: S or Tv', 'Continuous focus: AF-C or AI Servo', 'Burst mode on, short bursts'] },
  { title: 'Fast jets', q: 'Freeze the action', b: ['Start at 1/1000 second or faster', 'Pan smoothly with the aircraft', 'Keep following after the burst'] },
  { title: 'Propeller aircraft', q: 'Keep the blades turning', b: ['Start around 1/320 second', 'Slower gives more prop blur', 'Get the safe shot, then go slower'] },
  { title: 'Static aircraft', q: 'Take your time on the ground', b: ['Aperture priority, f/7.1 to f/11', 'Try the nose, engines and wheels', 'A wide lens tells the whole story'] },
  { title: 'Pack for a photo day', q: 'Small bag, fast cards', b: ['Two fast memory cards', 'A spare battery, fully charged', "Check the show's lens and bag rules"] },
  { title: 'Review and repeat', q: 'Learn from every show', b: ['Check a few shots between passes', 'Edit your best ten, not a hundred', 'Practise on cars, trains and gulls'] },
];
const LAW_ROWS = [];
const INTRO_WORDS = ['YOUR FIRST', 'AIRSHOW', 'PHOTOS'], INTRO_TAG = 'NEW TO AVIATION PHOTOGRAPHY?', INTRO_SUB = 'Settings, kit and confidence';
const OUTRO_LINE = 'Get the safe shot, then experiment!', OUTRO_LINES = ['Get the safe shot,', 'then experiment!'];

// ---------------------------------------------------------------- hits (picture accents -> sfx)
const HITS = [
  [0, 'jet on frame 0', 'whoosh', { len: 1.2, from: 300, to: 1400, gain: 0.22 }],
  [0.05, 'YOUR FIRST', 'pop', { pitch: 'F5', gain: 0.25 }],
  [1, 'AIRSHOW', 'pop', { pitch: 'A5', gain: 0.25 }],
  [2, 'PHOTOS', 'pop', { pitch: 'C6', gain: 0.25 }],
  [3.5, 'tag', 'pop', { pitch: 'F5', to: 'C6', gain: 0.2 }],
  [4.5, 'subtitle', 'bell', { pitch: 'F6', gain: 0.18 }],
];
const PITCH = ['F5', 'A5', 'C6'];

for (let i = 0; i < NSTEP; i++) {
  const s = st(i);
  HITS.push([s, `step ${i + 1} shutter`, 'whoosh', { len: 0.6, from: 400, to: 1600, gain: 0.12, pan: i % 2 ? -0.3 : 0.3 }], [s, `step ${i + 1} shutter click`, 'click', { gain: 0.2 }]);
  if (i < NSTEP - 1) HITS.push([s + 9.5, `step ${i + 1} snap`, 'click', { gain: 0.22 }], [s + 9.7, `step ${i + 1} print`, 'pop', { pitch: 'G5', to: 'C6', gain: 0.14 }]);
  HITS.push([s + 0.5, `step ${i + 1} card`, 'pop', { pitch: 'C5', to: 'F5', gain: 0.22 }]);
  STEPS[i].b.forEach((_, j) => HITS.push([s + 2.5 + j * 2, `step ${i + 1} tick ${j + 1}`, 'blip', { pitch: PITCH[j % 3], gain: 0.16 }]));
}
// scene-specific accents
for (const d of [2.4, 2.8, 3.2]) HITS.push([d, 'intro camera', 'click', { gain: 0.12 }]);
HITS.push([st(1) + 4.6, 'zoomed view', 'pop', { pitch: 'E5', to: 'A5', gain: 0.14 }]);
HITS.push([st(2) + 2.6, 'dial to S', 'tick', { gain: 0.2 }]);
for (const p of [1.6, 5.8]) for (const d of [0, 0.25, 0.5, 0.75]) HITS.push([st(3) + p + 0.9 + d, 'burst', 'click', { gain: 0.1 }]);
HITS.push([st(3) + 1, 'jet pass 1', 'whoosh', { len: 1.2, from: 300, to: 2400, gain: 0.2 }], [st(3) + 5, 'jet pass 2', 'whoosh', { len: 1.2, from: 2400, to: 300, gain: 0.2 }]);
for (const d of [3, 4.5, 6]) HITS.push([st(4) + d, 'shutter speed step', 'tick', { gain: 0.18 }]);
for (let k = 0; k < 7; k++) HITS.push([st(6) + 1.4 + k * 0.7, `kit ${k + 1}`, 'pop', { pitch: ['F5', 'G5', 'A5', 'C6', 'D6'][k % 5], gain: 0.12 }]);
for (let k = 0; k < 6; k++) HITS.push([st(7) + 1 + k * 0.45, `print ${k + 1}`, 'tick', { gain: 0.14 }]);
HITS.push([OUTRO, 'outro jets', 'whoosh', { len: 1.4, from: 300, to: 1800, gain: 0.25 }]);
HITS.push([OUTRO + 3, 'logo lands', 'bell', { pitch: 'F6', gain: 0.22 }]);
HITS.push([OUTRO + 5, 'sign-off', 'pop', { pitch: 'C6', gain: 0.18 }]);

// ================================================================ drawing kit
function ink(ctx, w = LW) { ctx.strokeStyle = C.navy; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
function fs(ctx, color, w = LW) { ctx.fillStyle = color; ctx.fill(); if (w) { ink(ctx, w); ctx.stroke(); } }
function circ(ctx, x, y, r, color, w = LW) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); fs(ctx, color, w); }
function ell(ctx, x, y, rx, ry, color, w = LW, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); fs(ctx, color, w); }
function box(ctx, x, y, w, h, r, color, lw = LW) { rrect(ctx, x, y, w, h, r); fs(ctx, color, lw); }
// thick outlined limb
function limb(ctx, pts, w, color) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = C.navy; ctx.lineWidth = w + LW * 2; ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
}
function withT(ctx, x, y, s, rot, fn) { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (s !== 1) ctx.scale(s, s); fn(); ctx.restore(); }
function wrap(ctx, str, f, maxW) {
  ctx.font = f; const words = str.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
const pop = (u, u0, cfg = SPRING.bouncy) => Math.max(0, springU(u, u0, cfg));

// ---------------------------------------------------------------- cartoon person
// origin at the feet, facing the viewer. Arm angles: 0 = hanging down, +PI/2 = out to the right, PI = up.
const PEOPLE = {
  A: { skin: C.skin1, hair: '#6B4226', style: 'cap', cap: C.red, shirt: C.teal, pants: '#2C4760' },
  B: { skin: C.skin2, hair: '#23202B', style: 'long', shirt: C.red, pants: '#33465A' },
  K: { skin: C.skin3, hair: '#2A1A12', style: 'short', shirt: C.gold, pants: C.blue, s: 0.68 },
  S: { skin: '#E9B98F', hair: '#8A8A8A', style: 'short', shirt: C.navy, pants: '#2C3A47', vest: true },
  T: { skin: C.skin3, hair: '#1E1E28', style: 'cap', cap: C.navy, shirt: C.navy, pants: '#2C3A47', vest: true },
  S2: { skin: C.skin2, hair: '#5B3A29', style: 'short', shirt: '#7FC4E8', pants: '#33465A' },
};
function person(ctx, who, o) {
  const P = { ...PEOPLE[who], ...o };
  const s = (P.s ?? 1) * (o.scale ?? 1) * 1.12;
  const aL = P.aL ?? [-0.18, -0.15], aR = P.aR ?? [0.18, 0.15];
  const walk = P.walk;                       // phase in radians, or undefined
  const bob = walk != null ? -Math.abs(Math.sin(walk)) * 10 : 0;
  const hop = P.hop ?? 0;
  ctx.save(); ctx.translate(P.x, P.y - hop); ctx.scale(s * (P.flip ? -1 : 1), s * (1 + (P.squash ?? 0))); ctx.rotate(P.lean ?? 0);
  const hipY = -150 + bob, shY = -272 + bob, hdY = -338 + bob, hr = 58;
  // legs
  if (P.sit) {
    limb(ctx, [[-22, hipY + 10], [-90, hipY + 20], [-96, -40]], 34, P.pants);
    limb(ctx, [[22, hipY + 10], [-50, hipY + 26], [-56, -40]], 34, P.pants);
    ell(ctx, -110, -26, 30, 16, C.navy, 0); ell(ctx, -70, -26, 30, 16, C.navy, 0);
  } else {
    const la = walk != null ? Math.sin(walk) * 0.42 : (P.legs ?? 0.06);
    const lb = walk != null ? -Math.sin(walk) * 0.42 : -(P.legs ?? 0.06);
    const legL = [-24 + Math.sin(la) * 150, hipY + Math.cos(la) * 150 - bob], legR = [24 + Math.sin(lb) * 150, hipY + Math.cos(lb) * 150 - bob];
    limb(ctx, [[-24, hipY], legL], 36, P.pants); limb(ctx, [[24, hipY], legR], 36, P.pants);
    ell(ctx, legL[0] - 8, legL[1] + 2, 30, 15, C.navy, 0); ell(ctx, legR[0] + 8, legR[1] + 2, 30, 15, C.navy, 0);
  }
  // long hair sits behind the body
  if (P.style === 'long') { rrect(ctx, -hr - 8, hdY - 30, hr * 2 + 16, 128, 40); fs(ctx, P.hair); }
  // torso
  box(ctx, -58, shY - 14, 116, hipY - shY + 34, 34, P.shirt);
  if (P.vest) {
    ctx.beginPath(); ctx.moveTo(-50, shY - 4); ctx.lineTo(-14, shY - 4); ctx.lineTo(0, shY + 40); ctx.lineTo(14, shY - 4); ctx.lineTo(50, shY - 4); ctx.lineTo(54, hipY + 12); ctx.lineTo(-54, hipY + 12); ctx.closePath(); fs(ctx, '#D9F03A', 4);
    ctx.fillStyle = '#C9D3DA'; ctx.fillRect(-52, hipY - 46, 104, 12); ctx.fillRect(-52, hipY - 16, 104, 12);
  }
  // arms
  const arm = (side, [a1, a2], hold) => {
    const sx = side * 52, sy = shY + 18;
    const ex = sx + Math.sin(a1) * 72, ey = sy + Math.cos(a1) * 72;
    const hx = ex + Math.sin(a1 + a2) * 66, hy = ey + Math.cos(a1 + a2) * 66;
    limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 26, P.shirt);
    circ(ctx, hx, hy, 15, P.skin, 5);
    if (hold) { ctx.save(); ctx.translate(hx, hy); hold(ctx, a1 + a2); ctx.restore(); }
  };
  arm(-1, aL, P.holdL); arm(1, aR, P.holdR);
  // head
  ctx.save(); ctx.translate(0, hdY); ctx.rotate(P.tilt ?? 0);
  circ(ctx, 0, 0, hr, P.skin);
  const lx = (P.look ?? 0) * 10, ly = (P.lookY ?? 0) * 8;
  // hair / cap
  if (P.style === 'short' || P.style === 'long') {
    ctx.beginPath(); ctx.arc(0, 0, hr + 3, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(20, -hr * 0.35, -hr - 2, -6); ctx.closePath(); fs(ctx, P.hair);
  }
  if (P.style === 'cap') {
    ctx.beginPath(); ctx.arc(0, -4, hr + 4, Math.PI, TAU); ctx.closePath(); fs(ctx, P.cap);
    ctx.beginPath(); ctx.ellipse(28, -8, 52, 13, 0, 0, TAU); fs(ctx, P.cap);
    ctx.beginPath(); ctx.arc(-hr + 6, 6, 12, 0, TAU); ctx.fillStyle = P.hair; ctx.fill();
  }
  // face
  const blink = P.blink ? 0.12 : 1;
  ell(ctx, -20 + lx, 6 + ly, 6.5, 9 * blink, C.navy, 0); ell(ctx, 20 + lx, 6 + ly, 6.5, 9 * blink, C.navy, 0);
  if (P.shades) { ctx.beginPath(); rrect(ctx, -38 + lx, -4, 32, 20, 8); fs(ctx, C.navy, 3); rrect(ctx, 6 + lx, -4, 32, 20, 8); fs(ctx, C.navy, 3); limb(ctx, [[-6 + lx, 4], [6 + lx, 4]], 1, C.navy); }
  ctx.globalAlpha = 0.35; circ(ctx, -34 + lx, 26, 9, C.red, 0); circ(ctx, 34 + lx, 26, 9, C.red, 0); ctx.globalAlpha = 1;
  const m = P.mouth ?? 0;
  if (m > 0.05) { ctx.beginPath(); ctx.ellipse(lx, 30 + ly, 13, 6 + 10 * m, 0, 0, Math.PI); ctx.closePath(); fs(ctx, '#8A2232', 4); }
  else { ctx.beginPath(); ctx.arc(lx, 22 + ly, 16, 0.2 * Math.PI, 0.8 * Math.PI); ink(ctx, 5); ctx.stroke(); }
  if (P.earDef) { limb(ctx, [[-hr - 6, 0], [-hr + 4, -hr + 4], [hr - 4, -hr + 4], [hr + 6, 0]], 8, C.red); ell(ctx, -hr - 6, 6, 16, 24, C.red, 5); ell(ctx, hr + 6, 6, 16, 24, C.red, 5); }
  ctx.restore();
  ctx.restore();
}
// seeded blinking: true for a short moment every few beats
const blinkAt = (u, seed) => { const per = 3 + hash01(seed) * 2, ph = ((u + hash01(seed + 9) * per) % per); return ph < 0.12; };

// ---------------------------------------------------------------- props
// Real aircraft cut-outs from the site: Red Arrows Hawk (body C.red), Typhoon (C.blue), A400M ('a400').
let AC = {};
function jet(ctx, x, y, s, rot, body = C.red, flip = false) {
  const img = body === C.red ? AC.hawk : body === 'a400' ? AC.a400 : AC.typhoon;
  if (!img) return;
  const w = 320 * s, h = w * img.height / img.width;
  withT(ctx, x, y, 1, rot, () => { if (flip) ctx.scale(-1, 1); ctx.drawImage(img, -w / 2, -h / 2, w, h); });
}
// top view, nose along heading (radians, canvas angle)
function topJet(ctx, img, x, y, w, heading) {
  if (!img) return; const h = w * img.height / img.width;
  withT(ctx, x, y, 1, heading + Math.PI / 2, () => ctx.drawImage(img, -w / 2, -h / 2, w, h));
}
// Red Arrows smoke: a ribbon of puffs behind a point, coloured
function smoke(ctx, pts, color, r0 = 10, grow = 1.2, a0 = 0.85) {
  pts.forEach(([x, y], k) => { ctx.globalAlpha = Math.max(0, a0 * (1 - k / pts.length * 0.8)); ctx.beginPath(); ctx.arc(x, y, r0 + k * grow, 0, TAU); ctx.fillStyle = color; ctx.fill(); });
  ctx.globalAlpha = 1;
}
function mixc(a, b, t) { return M.mix(a, b, t); }
function puff(ctx, x, y, r, color = C.white, a = 1) { ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1; }
function cloud(ctx, x, y, s, color = C.white, outline = false) {
  withT(ctx, x, y, s, 0, () => {
    const blob = () => { ctx.beginPath(); for (const [cx, cy, r] of [[-60, 10, 42], [-10, -14, 58], [52, 4, 46], [10, 22, 44]]) { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, TAU); } };
    if (outline) { blob(); ink(ctx, LW * 2); ctx.stroke(); }
    blob(); ctx.fillStyle = color; ctx.fill();
  });
}
function sun(ctx, x, y, r, u, face = true) {
  withT(ctx, x, y, 1, u * 0.08, () => {
    for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; limb(ctx, [[Math.cos(a) * (r + 18), Math.sin(a) * (r + 18)], [Math.cos(a) * (r + 46), Math.sin(a) * (r + 46)]], 10, C.gold); }
  });
  circ(ctx, x, y, r, C.gold);
  if (face) { ell(ctx, x - 22, y - 8, 6, 9, C.navy, 0); ell(ctx, x + 22, y - 8, 6, 9, C.navy, 0); ctx.beginPath(); ctx.arc(x, y + 8, 22, 0.2 * Math.PI, 0.8 * Math.PI); ink(ctx, 5); ctx.stroke(); }
}
function sky(ctx, u, top = C.sky, tint = null) {
  sfill(ctx, top);
  // slow drifting background clouds (seeded)
  for (let k = 0; k < 5; k++) {
    const sp = 6 + hash01(k, 3) * 8, x = ((hash01(k, 5) * (G.w + 600) + u * sp) % (G.w + 600)) - 300;
    cloud(ctx, x, 120 + hash01(k, 7) * 300, 0.6 + hash01(k, 11) * 0.5, tint || C.white);
  }
}
function ground(ctx, col = C.grass, col2 = C.grass2) {
  const gy = G.gy;
  ctx.fillStyle = col; ctx.fillRect(0, gy, G.w, G.h - gy);
  ctx.fillStyle = col2; ctx.fillRect(0, gy, G.w, 10);
  ink(ctx); ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(G.w, gy); ctx.stroke();
}
function hills(ctx, col = '#B6DAA6') {
  const gy = G.gy; ctx.beginPath(); ctx.moveTo(0, gy);
  for (let x = 0; x <= G.w; x += 40) ctx.lineTo(x, gy - 90 - Math.sin(x / 260) * 40 - Math.sin(x / 97 + 1) * 14);
  ctx.lineTo(G.w, gy); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
function signText(ctx, str, x, y, size, color = C.white, weight = 800) { text(ctx, str, x, y, font(size, weight, DISPLAY), color, 'center'); }

// ================================================================ text card
function card(ctx, u, s, i) {
  const S = STEPS[i], side = i % 2 === 0 ? 'R' : 'L';
  const cw = PORTRAIT ? 936 : 880, pad = 50, x0 = PORTRAIT ? 72 : side === 'R' ? SW - 90 - cw : 90;
  // measure
  const fTitle = font(Math.min(96, M.fitSize(ctx, S.title, 800, DISPLAY, cw - pad * 2 - 124, 96)), 800, DISPLAY);
  const fQ = font(46, 700, UI), fB = font(44, 600, UI);
  const bl = S.b.map((b) => wrap(ctx, b, fB, cw - pad * 2 - 76));
  const hB = bl.reduce((a, l) => a + l.length * 54 + 28, 0);
  const ch = pad + 96 + 62 + 30 + hB + pad - 28;
  const y0 = PORTRAIT ? 250 : Math.round((GY - 40 - ch) / 2 + 10);
  // entrance: slide in from its side with a little rotation, settle
  const k = pop(u, s + 0.25, SPRING.bouncy);
  if (k <= 0) return;
  const dx = (1 - k) * (side === 'R' ? 900 : -900), rot = (1 - k) * (side === 'R' ? 0.12 : -0.12);
  ctx.save();
  ctx.translate(x0 + cw / 2 + dx, y0 + ch / 2); ctx.rotate(rot); ctx.translate(-(x0 + cw / 2), -(y0 + ch / 2));
  // hard cartoon shadow + card
  ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(x0 + 12, y0 + 14, cw, ch);
  box(ctx, x0, y0, cw, ch, 0, C.white);
  ctx.fillStyle = C.teal; ctx.fillRect(x0 + LW / 2, y0 + LW / 2, cw - LW, 12);
  // number badge
  const bk = pop(u, s + 0.6, SPRING.wobbly);
  const bx = x0 + pad + 46, by = y0 + pad + 44;
  withT(ctx, bx, by, Math.max(0.01, bk), (1 - bk) * -0.8, () => {
    box(ctx, -46, -46, 92, 92, 0, C.navy);
    text(ctx, String(i + 1), 0, 22, font(64, 800, DISPLAY), C.white, 'center');
  });
  // title + question
  text(ctx, S.title, x0 + pad + 118, y0 + pad + 74, fTitle, C.navy);
  const qk = E.outQuint(prog(u, s + 1, s + 1.8));
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, pad + (cw - pad) * qk, ch); ctx.clip();
  text(ctx, S.q, x0 + pad, y0 + pad + 96 + 50, fQ, C.tealD);
  ctx.restore();
  // divider draws across
  const dk = E.outCubic(prog(u, s + 1.2, s + 2.2));
  ink(ctx, 4); ctx.strokeStyle = C.sky2; ctx.beginPath(); ctx.moveTo(x0 + pad, y0 + pad + 96 + 78); ctx.lineTo(x0 + pad + (cw - pad * 2) * dk, y0 + pad + 96 + 78); ctx.stroke();
  // bullets
  let y = y0 + pad + 96 + 62 + 30 + 36;
  bl.forEach((lines, j) => {
    const ub = s + 2.5 + j * 2;
    const tk = pop(u, ub, SPRING.bouncy);
    if (tk > 0) {
      withT(ctx, x0 + pad + 24, y - 15, Math.max(0.01, tk), 0, () => {
        box(ctx, -23, -23, 46, 46, 0, C.teal, 4);
        const ck = E.outCubic(prog(u, ub + 0.1, ub + 0.5));
        ctx.beginPath(); ctx.moveTo(-10, 0); const p1 = [-3, 8], p2 = [11, -8];
        if (ck < 0.4) ctx.lineTo(lerp(-10, p1[0], ck / 0.4), lerp(0, p1[1], ck / 0.4));
        else { ctx.lineTo(p1[0], p1[1]); ctx.lineTo(lerp(p1[0], p2[0], (ck - 0.4) / 0.6), lerp(p1[1], p2[1], (ck - 0.4) / 0.6)); }
        ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
      });
      const rk = E.outQuint(prog(u, ub + 0.05, ub + 0.75));
      const yo = (1 - pop(u, ub, SPRING.snappy)) * 22;
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + pad + 54, y - 60, (cw - pad - 54) * rk, lines.length * 54 + 40); ctx.clip();
      lines.forEach((ln, li) => text(ctx, ln, x0 + pad + 70, y + li * 54 + yo, fB, C.navy));
      ctx.restore();
    }
    y += lines.length * 54 + 28;
  });
  ctx.restore();
}
// art sits on the side opposite the card
const artX = (i) => (i % 2 === 0 ? 0 : SW - 980);

// ================================================================ scenes
// Each scene paints the full frame for local beat L (0..12+) of its step.

// per-format layout for the intro and end card (they are drawn natively, not cropped)
const LAY = PORTRAIT ? {
  jetY: 330, jetS: 0.85, tag: [540, 500], x0: 72,
  words: [[140, 700], [250, 930], [250, 1160]], ul: 1200, sub: 1270, subW: 940,
  ppl: [[300, 1600, 0.8], [560, 1610, 0.8], [800, 1620, 0.8]],
} : {
  jetY: 150, jetS: 0.95, tag: [1450, 340], x0: 120,
  words: [[140, 440], [230, 650], [230, 860]], ul: 902, sub: 1020, subW: 1000,
  ppl: [[1290, GY + 40, 1], [1560, GY + 50, 1], [1760, GY + 60, 1]],
};
function sceneIntro(ctx, u) {
  sky(ctx, u);
  hills(ctx); ground(ctx);
  // Red Arrows trio, already mid-pass on frame 0, trailing red / white / blue smoke
  const jp = prog(u, -2.2, 7.5);
  const P = (q, k) => [lerp(-300, G.w + 600, q) - k * 70, LAY.jetY + k * 46 - Math.sin(q * Math.PI) * 60];
  const SM = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  [1, 0, 2].forEach((k) => {
    const pts = []; for (let n = 1; n < 110; n++) { const q = jp - n * 0.0035; if (q < 0) break; const p = P(q, k); pts.push([p[0] - 140, p[1] + 14]); }
    if (k === 0) smoke(ctx, pts, '#B9C7D3', 13, 0.3, 0.6);
    smoke(ctx, pts, SM[k], 10, 0.3);
  });
  [1, 0, 2].forEach((k) => { const p = P(jp, k), p2 = P(jp + 0.01, k); jet(ctx, p[0], p[1], LAY.jetS, Math.atan2(p2[1] - p[1], p2[0] - p[0])); });
  // season tag (square corners)
  const tg = pop(u, 3.5, SPRING.bouncy);
  if (tg > 0) withT(ctx, LAY.tag[0], LAY.tag[1], tg, (1 - tg) * 0.3, () => {
    ctx.font = font(PORTRAIT ? 52 : 50, 800, DISPLAY); const tw = ctx.measureText(INTRO_TAG).width + 70;
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-tw / 2 + 10, -50 + 10, tw, 96);
    box(ctx, -tw / 2, -50, tw, 96, 0, C.red);
    text(ctx, INTRO_TAG, 0, 18, font(PORTRAIT ? 52 : 50, 800, DISPLAY), C.white, 'center');
  });
  // title, left side
  const x0 = LAY.x0, words = [[INTRO_WORDS[0], 0, C.navy], [INTRO_WORDS[1], 1, C.navy], [INTRO_WORDS[2], 2, C.teal]].map((w, i) => [...w, ...LAY.words[i]]);
  for (const [w, ub, col, size, yb] of words) {
    const f = font(size, 800, DISPLAY), L = layout(ctx, w, f, 2);
    L.glyphs.forEach((g, j) => {
      const k = pop(u, ub - 0.45 + j * 0.04, SPRING.bouncy);
      if (k <= 0) return;
      ctx.save(); ctx.beginPath(); ctx.rect(0, yb - size, G.w, size * 1.08); ctx.clip();
      M.glyph(ctx, g.ch, x0 + g.cx, yb + (1 - k) * size * 0.9, f, col, 1, 1);
      ctx.restore();
    });
  }
  // underline swoosh in logo colours
  const sk = E.outCubic(prog(u, 2.8, 3.8));
  [[C.red, 0], [C.navy, 16], [C.teal, 32]].forEach(([col, o]) => {
    const uy = LAY.ul; ctx.beginPath(); ctx.moveTo(x0, uy + o * 0.5);
    ctx.quadraticCurveTo(x0 + 400, uy + 20 + o, x0 + 820 * sk, uy - 34 + o * 0.6);
    ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineCap = 'round'; if (sk > 0) ctx.stroke();
  });
  const tk = E.outQuint(prog(u, 4.5, 5.3));
  ctx.save(); ctx.beginPath(); ctx.rect(x0, LAY.sub - 80, LAY.subW * tk, 120); ctx.clip();
  text(ctx, INTRO_SUB, x0 + 4, LAY.sub, font(58, 700, UI), C.navy);
  ctx.restore();
  // characters looking up at the jet, pointing
  const look = clamp((lerp(-300, G.w + 600, jp) - LAY.ppl[1][0]) / 600, -1, 1);
  const pt = pop(u, 0.5, SPRING.bouncy);
  person(ctx, 'B', { x: LAY.ppl[0][0], y: LAY.ppl[0][1], scale: LAY.ppl[0][2], look, lookY: -0.8, aR: [0.3 + 2.2 * pt, 0.1], aL: [-0.2, -0.2], blink: blinkAt(u, 2), mouth: 0.6 * bump(u, 1.5, 1.2) });
  person(ctx, 'A', { x: LAY.ppl[1][0], y: LAY.ppl[1][1], scale: LAY.ppl[1][2], look: -0.5, lookY: -0.8, aR: [-1.9, -1.0].map((v) => -v), aL: [-0.5, 2.1], blink: false });
  { const sc = LAY.ppl[1][2] * 1.12; withT(ctx, LAY.ppl[1][0] + 30 * sc, LAY.ppl[1][1] - 330 * sc, sc, -1.05, () => { camBody(ctx, 110);
    for (const d of [2.4, 2.8, 3.2]) { const f = bump(u, d + 0.05, 0.12); if (f > 0) { ctx.globalAlpha = f; for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; limb(ctx, [[-40 + Math.cos(a) * 14, -70 + Math.sin(a) * 14], [-40 + Math.cos(a) * 36, -70 + Math.sin(a) * 36]], 4, C.gold); } ctx.globalAlpha = 1; } } }); }
  const hop = Math.max(0, Math.sin(u * Math.PI)) * 40;
  person(ctx, 'K', { x: LAY.ppl[2][0], y: LAY.ppl[2][1], scale: LAY.ppl[2][2], hop, look: -0.4, lookY: -0.8, aL: [-2.6, 0], aR: [2.6, 0], squash: -0.04 * Math.sin(u * TAU), mouth: 0.7 });
}

function itemChair(c) { limb(c, [[-40, 40], [40, -40]], 8, C.navy); limb(c, [[40, 40], [-40, -40]], 8, C.navy); box(c, -54, -56, 108, 34, 8, C.teal); }
function itemEar(c) { limb(c, [[-36, 10], [-30, -36], [30, -36], [36, 10]], 10, C.red); ell(c, -38, 16, 18, 28, C.red); ell(c, 38, 16, 18, 28, C.red); }
function itemBank(c) { box(c, -30, -50, 60, 100, 12, C.navy); c.beginPath(); c.moveTo(6, -30); c.lineTo(-12, 4); c.lineTo(4, 4); c.lineTo(-6, 32); c.lineTo(14, -6); c.lineTo(-2, -6); c.closePath(); c.fillStyle = C.gold; c.fill(); }
function itemCash(c) { box(c, -60, -32, 120, 64, 8, '#9BD08A'); circ(c, 0, 0, 20, '#7DBA6A', 4); signText(c, '£', 0, 12, 34, C.navy); }
function itemMap(c) { c.beginPath(); c.moveTo(-60, -40); c.lineTo(-20, -30); c.lineTo(20, -40); c.lineTo(60, -30); c.lineTo(60, 40); c.lineTo(20, 30); c.lineTo(-20, 40); c.lineTo(-60, 30); c.closePath(); fs(c, C.off); circ(c, 8, -4, 12, C.red, 4); limb(c, [[-40, 16], [-10, 0], [8, -4]], 2, C.blue); }
function itemCream(c) { box(c, -26, -56, 52, 104, 8, '#F38B2A'); box(c, -16, -76, 32, 22, 0, C.navy); signText(c, 'SPF', 0, 8, 26, C.white); }
function itemWater(c) { box(c, -24, -60, 48, 116, 10, '#9FD3EE'); box(c, -14, -80, 28, 22, 0, C.blue); limb(c, [[-24, -10], [24, -10]], 2, C.blue); }
function itemHat(c) { ell(c, 0, 20, 86, 20, C.gold); c.beginPath(); c.moveTo(-50, 18); c.lineTo(-38, -36); c.lineTo(38, -36); c.lineTo(50, 18); c.closePath(); fs(c, C.gold); c.fillStyle = C.red; c.fillRect(-44, -2, 88, 12); }
function itemBinos(c) { box(c, -46, -40, 38, 80, 10, '#2B3237'); box(c, 8, -40, 38, 80, 10, '#2B3237'); box(c, -12, -20, 24, 24, 0, C.grey2, 4); circ(c, -27, 40, 14, '#BFE6F2', 4); circ(c, 27, 40, 14, '#BFE6F2', 4); }
function itemSnacks(c) { c.beginPath(); c.moveTo(-44, -60); c.lineTo(44, -60); c.lineTo(36, 60); c.lineTo(-36, 60); c.closePath(); fs(c, C.red); circ(c, 0, 0, 22, C.gold, 4); }

// ================================================================ security scenes
// Each scene paints the full stage for local beat L (0..12+) of its step; art sits at artX(i).
const VEST = '#D9F03A';
function qr(ctx, x, y, size, seed = 7) {
  const n = 11, c = size / n;
  ctx.fillStyle = C.white; ctx.fillRect(x - c, y - c, size + 2 * c, size + 2 * c);
  ctx.fillStyle = C.navy;
  for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) {
    const finder = (r < 3 && q < 3) || (r < 3 && q > n - 4) || (r > n - 4 && q < 3);
    if (finder ? !((r % (n - 3) === 1 || r === n - 2) && (q % (n - 3) === 1 || q === n - 2)) : hash01(r * 31 + q, seed) > 0.5) ctx.fillRect(x + q * c, y + r * c, c, c);
  }
}
function label(ctx, str, x, y, size, bg, fg = C.white, k = 1) {
  if (k <= 0) return;
  const f = font(size, 800, DISPLAY); ctx.font = f; const w = ctx.measureText(str).width + size * 0.9, h = size * 1.35;
  withT(ctx, x, y, k, (1 - k) * 0.25, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w, h);
    box(ctx, -w / 2, -h / 2, w, h, 0, bg, 5); text(ctx, str, 0, size * 0.36, f, fg, 'center');
  });
}
function tickSq(ctx, x, y, s, good = true) {
  withT(ctx, x, y, s, 0, () => {
    box(ctx, -30, -30, 60, 60, 0, good ? '#2E9E5B' : C.red, 5);
    ctx.strokeStyle = C.white; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath();
    if (good) { ctx.moveTo(-14, 0); ctx.lineTo(-4, 11); ctx.lineTo(15, -12); } else { ctx.moveTo(-12, -12); ctx.lineTo(12, 12); ctx.moveTo(12, -12); ctx.lineTo(-12, 12); }
    ctx.stroke();
  });
}
function tent(ctx, x0, x1, top, open = null) {
  // a white marquee with straight panels; open = [a, b] leaves a doorway between x a..b
  const y0 = GY, eave = top + 120;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, eave); ctx.lineTo((x0 + x1) / 2, top); ctx.lineTo(x1, eave); ctx.lineTo(x1, y0); ctx.closePath(); fs(ctx, C.white);
  for (let x = x0 + 80; x < x1 - 20; x += 80) limb(ctx, [[x, eave + 4], [x, y0 - 4]], 1, '#C9D6E0');
  limb(ctx, [[x0 + 4, eave], [x1 - 4, eave]], 2, C.grey);
  if (open) { ctx.fillStyle = '#E9EEF2'; ctx.fillRect(open[0], eave + 40, open[1] - open[0], y0 - eave - 40); ink(ctx); ctx.strokeRect(open[0], eave + 40, open[1] - open[0], y0 - eave - 40); }
}
function stanchion(ctx, x, y) { box(ctx, x - 7, y - 110, 14, 110, 0, C.navy, 3); ell(ctx, x, y, 26, 8, C.navy, 0); circ(ctx, x, y - 112, 10, C.grey2, 3); }
function belt(ctx, x0, x1, y) { ctx.beginPath(); ctx.moveTo(x0, y - 96); ctx.lineTo(x1, y - 96); ctx.strokeStyle = C.navy; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.stroke(); }
function rucksack(ctx, x, y, s = 1, col = C.blue) {
  withT(ctx, x, y, s, 0, () => { box(ctx, -60, -120, 120, 120, 24, col); box(ctx, -40, -66, 80, 46, 8, C.teal, 4); box(ctx, -20, -136, 40, 22, 10, C.navy, 4); });
}
// small item icons, about 100 px, origin at centre
const ICON = {
  sandwich: (c) => { c.beginPath(); c.moveTo(-46, 30); c.lineTo(46, 30); c.lineTo(0, -40); c.closePath(); fs(c, '#F4D9A0'); c.fillStyle = C.grass2; c.fillRect(-30, 12, 60, 8); },
  chair: (c) => { c.save(); c.scale(0.8, 0.8); itemChair(c); c.restore(); },
  camera: (c) => { box(c, -50, -30, 100, 64, 10, '#2B3237'); circ(c, 4, 2, 22, '#4A5A66', 5); circ(c, 4, 2, 10, '#9FD3EE', 0); box(c, -38, -44, 30, 16, 4, '#2B3237', 4); },
  wine: (c) => { box(c, -16, -20, 32, 74, 8, '#6B1F3A'); box(c, -8, -56, 16, 40, 3, '#6B1F3A'); box(c, -14, 4, 28, 26, 0, C.off, 3); },
  bbq: (c) => { box(c, -50, -16, 100, 34, 0, '#B8C2CA'); for (let k = -36; k <= 36; k += 12) limb(c, [[k, -16], [k, 18]], 1, '#5B6B78'); limb(c, [[-40, 18], [-46, 44]], 3, C.navy); limb(c, [[40, 18], [46, 44]], 3, C.navy); },
  gazebo: (c) => { c.beginPath(); c.moveTo(-56, -6); c.lineTo(0, -46); c.lineTo(56, -6); c.closePath(); fs(c, C.teal); limb(c, [[-48, -6], [-48, 44]], 3, C.navy); limb(c, [[48, -6], [48, 44]], 3, C.navy); },
  knife: (c) => { c.save(); c.rotate(-0.5); box(c, -50, -10, 46, 20, 6, C.red); c.beginPath(); c.moveTo(-4, -9); c.lineTo(56, -3); c.lineTo(52, 6); c.lineTo(-4, 9); c.closePath(); fs(c, '#C9D3DA'); c.restore(); },
  drone: (c) => { box(c, -24, -12, 48, 24, 6, '#2B3237'); for (const [x, y] of [[-44, -24], [44, -24], [-44, 22], [44, 22]]) { limb(c, [[0, 0], [x, y]], 4, '#2B3237'); ell(c, x, y, 22, 6, '#9AA9B5', 3); } },
  rocket: (c) => { c.save(); c.rotate(0.35); box(c, -12, -30, 24, 60, 0, C.red); c.beginPath(); c.moveTo(-12, -30); c.lineTo(0, -54); c.lineTo(12, -30); c.closePath(); fs(c, C.gold); limb(c, [[0, 30], [0, 58]], 2, '#8C5D3A'); c.restore(); },
  ladder: (c) => { limb(c, [[-26, 50], [-14, -50]], 5, '#B8C2CA'); limb(c, [[26, 50], [14, -50]], 5, '#B8C2CA'); for (let y = -30; y <= 40; y += 22) limb(c, [[-22 + (40 - y) * 0.0, y], [22, y]], 4, '#B8C2CA'); },
  meds: (c) => { box(c, -34, -24, 68, 48, 0, C.white); c.fillStyle = C.red; c.fillRect(-6, -16, 12, 32); c.fillRect(-16, -6, 32, 12); },
  bank: (c) => { c.save(); c.scale(0.7, 0.7); itemBank(c); c.restore(); },
  water: (c) => { c.save(); c.scale(0.7, 0.7); itemWater(c); c.restore(); },
  box: (c) => { box(c, -50, -30, 100, 60, 6, 'rgba(191,230,242,0.9)'); ICON.sandwich2(c); },
  sandwich2: (c) => { c.save(); c.scale(0.55, 0.55); c.beginPath(); c.moveTo(-46, 30); c.lineTo(46, 30); c.lineTo(0, -40); c.closePath(); fs(c, '#F4D9A0', 5); c.restore(); },
  jumper: (c) => { box(c, -56, -22, 112, 44, 6, C.red); limb(c, [[-56, 0], [56, 0]], 1, '#9E1C2D'); },
  coat: (c) => { box(c, -56, -18, 112, 36, 6, C.teal); },
  keys: (c) => { circ(c, -14, 0, 14, C.gold, 4); limb(c, [[0, 0], [30, 0], [30, 10]], 4, C.gold); },
  phone: (c) => { box(c, -18, -32, 36, 64, 6, '#2B3237', 4); },
  coins: (c) => { circ(c, -10, 4, 14, C.gold, 4); circ(c, 10, -4, 14, C.gold, 4); },
};
function icon(ctx, name, x, y, s = 1, rot = 0) { withT(ctx, x, y, s, rot, () => ICON[name](ctx)); }


// ================================================================ photography scenes
// Each scene paints the full stage for local beat L (0..12+) of its step; art sits at artX(i).
function camBody(ctx, lens = 90, col = '#2B3237') {
  // side view camera, lens pointing +x; origin at the body centre
  box(ctx, -60, -44, 110, 88, 10, col);
  box(ctx, -60, -60, 44, 22, 4, col, 4);
  box(ctx, 50, -34, lens, 68, 6, '#3A4650');
  for (let x = 70; x < 50 + lens - 10; x += 34) limb(ctx, [[x, -30], [x, 30]], 1, '#55636E');
  box(ctx, 50 + lens - 6, -42, 40, 84, 6, '#2B3237');
  ctx.fillStyle = C.red; ctx.fillRect(60, -33, 6, 66);
}
function readout(ctx, str, x, y, k = 1) {
  if (!str || k <= 0) return;
  const f = font(40, 700, UI); ctx.font = f; const w = ctx.measureText(str).width + 60;
  withT(ctx, x, y, k, 0, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-w / 2 + 8, -28 + 8, w, 60);
    box(ctx, -w / 2, -28, w, 60, 0, C.navy, 4);
    ctx.fillStyle = C.red; ctx.fillRect(-w / 2 + 18, -6, 12, 12);
    text(ctx, str, 12, 14, f, C.white, 'center');
  });
}
function propDisc(ctx, x, y, r, blur, L) {
  // blur 0 = frozen blades (from the photo), 1 = full disc
  if (blur <= 0) return;
  ctx.save();
  ctx.globalAlpha = 0.85 * blur; ctx.beginPath(); ctx.ellipse(x, y, r * 0.14, r, 0, 0, TAU); ctx.fillStyle = '#C8D2DA'; ctx.fill();
  ctx.globalAlpha = 0.6 * blur; ctx.strokeStyle = '#6B7883'; ctx.lineWidth = 3;
  for (let k = 0; k < 4; k++) { const a = L * 9 + k * 1.6; ctx.beginPath(); ctx.ellipse(x, y, r * 0.12, r * (0.45 + 0.13 * k), 0, a, a + 1.2); ctx.stroke(); }
  ctx.restore();
}
function lensCap(ctx) { circ(ctx, 0, 0, 26, '#2B3237', 4); circ(ctx, 0, 0, 12, '#55636E', 0); }
const PICON = {
  card: (c) => { box(c, -34, -44, 68, 88, 4, C.navy); c.fillStyle = C.gold; c.fillRect(-24, -34, 48, 18); text(c, '64GB', 0, 26, font(22, 800, DISPLAY), C.white, 'center'); },
  battery: (c) => { box(c, -40, -26, 80, 52, 4, '#2B3237'); box(c, 40, -10, 10, 20, 0, '#2B3237', 4); c.fillStyle = '#2EC26A'; c.fillRect(-30, -16, 60, 32); },
  cloth: (c) => { box(c, -40, -40, 80, 80, 0, '#7FC4E8'); limb(c, [[-40, 0], [40, 0]], 1, '#5AA9CF'); limb(c, [[0, -40], [0, 40]], 1, '#5AA9CF'); },
  rain: (c) => { box(c, -50, -30, 100, 60, 0, C.gold); for (let k = -30; k <= 30; k += 20) limb(c, [[k, -18], [k - 6, 0]], 2, C.blue); },
  ear: (c) => { c.save(); c.scale(0.8, 0.8); itemEar(c); c.restore(); },
  lens: (c) => { box(c, -60, -22, 120, 44, 6, '#3A4650'); box(c, 54, -28, 20, 56, 4, '#2B3237', 4); },
};

// 1. use the camera you own
function sceneKit(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(0);
  ctx.save(); ctx.translate(ax, 0);
  // table
  box(ctx, 60, GY - 230, 660, 30, 0, '#B07A4E'); box(ctx, 90, GY - 200, 22, 200, 0, '#8C5D3A', 4); box(ctx, 668, GY - 200, 22, 200, 0, '#8C5D3A', 4);
  // camera body on the table
  const ck = pop(L, 2.5, SPRING.bouncy);
  if (ck > 0) withT(ctx, 170, GY - 290, ck * 1.15, 0, () => camBody(ctx, 70));
  label(ctx, 'ANY CAMERA', 190, GY - 430, 44, C.navy, C.white, pop(L, 2.7, SPRING.bouncy));
  // crop sensor: 300mm frames like 450mm
  const sk = pop(L, 4.5, SPRING.bouncy);
  if (sk > 0) withT(ctx, 430, GY - 300, sk, 0, () => { box(ctx, -70, -50, 140, 100, 0, '#2B3237'); box(ctx, -46, -32, 92, 64, 0, '#C08A2E', 4); text(ctx, 'APS-C', 0, 12, font(30, 800, DISPLAY), C.white, 'center'); });
  label(ctx, '300mm = 450mm', 430, GY - 560, 40, C.teal, C.white, pop(L, 4.8, SPRING.bouncy));
  // the long lens gets the budget
  const lk = pop(L, 6.5, SPRING.bouncy);
  if (lk > 0) withT(ctx, 630, GY - 270, lk * 1.3, 0, () => PICON.lens(ctx));
  label(ctx, 'LENS FIRST', 640, GY - 430, 44, C.red, C.white, pop(L, 6.8, SPRING.bouncy));
  person(ctx, 'A', { x: 850, y: GY + 60, look: -0.6, aL: [-0.6 - 1.4 * pop(L, 7.5), -1.2], blink: blinkAt(L, 3), mouth: 0.4 * bump(L, 8, 1.5) });
  ctx.restore();
}

// 2. get a long lens: zoom in on a distant Typhoon
function sceneLens(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(1);
  ctx.save(); ctx.translate(ax, 0);
  const z = E.inOutCubic(prog(L, 1, 4.5));
  const jx = 380 + L * 22, jy = 300 + Math.sin(L * 0.8) * 20;
  jet(ctx, jx, jy, 0.32, 0, C.blue);
  // the zoomed view: a square viewfinder inset
  const vk = pop(L, 4.6, SPRING.snappy);
  if (vk > 0) withT(ctx, 680, 430, vk, 0, () => {
    box(ctx, -250, -170, 500, 340, 0, C.sky);
    ctx.save(); ctx.beginPath(); ctx.rect(-247, -167, 494, 334); ctx.clip();
    cloud(ctx, -120 - L * 8, -60, 0.9); jet(ctx, -10 + Math.sin(L) * 8, 10, 1.25, 0, C.blue); ctx.restore();
    ink(ctx); ctx.strokeRect(-250, -170, 500, 340);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) limb(ctx, [[sx * 200, sy * 150 - sy * 0], [sx * 230, sy * 150], [sx * 230, sy * 120]], 3, C.white);
  });
  // photographer with a zooming lens
  person(ctx, 'A', { x: 150, y: GY + 60, look: 0.6, lookY: -0.5, aR: [1.9, 1.0], aL: [-0.5, 2.1], blink: false });
  withT(ctx, 185, GY - 300, 1, -0.35, () => camBody(ctx, lerp(80, 230, z)));
  label(ctx, 'STABILISER ON', 260, 560, 40, C.teal, C.white, pop(L, 6.6, SPRING.bouncy));
  ctx.restore();
}
const zoomMM = (L) => Math.round(lerp(70, 300, E.inOutCubic(prog(L, 1, 4.5))) / 10) * 10;

// 3. set up before the flying
function sceneSetup(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(2);
  ctx.save(); ctx.translate(ax, 0);
  // an A400M arrives in the background: practise on it
  const aq = prog(L, 0.5, 11);
  if (aq > 0 && aq < 1) jet(ctx, lerp(-300, 1300, aq), 170 + aq * 110, 1.0, 0.07, 'a400');
  // the back of a big camera
  const bk = pop(L, 0.3, SPRING.bouncy);
  withT(ctx, 400, 600, bk, 0, () => {
    box(ctx, -330, -210, 660, 400, 30, '#2B3237');
    box(ctx, -300, -170, 380, 290, 0, '#0F1E2A', 5);
    const rows = [['MODE', 'S'], ['FOCUS', 'AF-C'], ['DRIVE', 'BURST']];
    rows.forEach(([a, b], k) => {
      const rk = pop(L, 2.5 + k * 2, SPRING.snappy); if (rk <= 0) return;
      const y = -110 + k * 84;
      ctx.globalAlpha = Math.min(1, rk);
      text(ctx, a, -276, y + 14, font(34, 700, UI), '#9FB3C2');
      box(ctx, -100, y - 28, 160, 56, 0, C.teal, 3); text(ctx, b, -20, y + 14, font(40, 800, DISPLAY), C.white, 'center');
      ctx.globalAlpha = 1;
    });
    // mode dial turns to S
    const dial = kf(L, [[1.8, 0], [2.6, 1]], E.outBack);
    withT(ctx, 210, -60, 1, -dial * 1.57, () => {
      circ(ctx, 0, 0, 86, '#3A4650');
      ['M', 'A', 'S', 'P'].forEach((ch, k) => { const a = -Math.PI / 2 + (k - 2) * 1.57 + 0; withT(ctx, Math.cos(a + 1.57 * 0) * 56, Math.sin(a) * 56, 1, 0, () => text(ctx, ch, 0, 12, font(36, 800, DISPLAY), ch === 'S' ? C.gold : C.white, 'center')); });
    });
    limb(ctx, [[210, -160], [210, -150]], 4, C.gold);
    circ(ctx, 210, 110, 46, '#3A4650'); circ(ctx, 210, 110, 18, '#55636E', 4);
  });
  ctx.restore();
}

// 4. fast jets: freeze the action
function sceneJets(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(3);
  ctx.save(); ctx.translate(ax, 0);
  const passes = [[1, 4.2, C.blue], [5, 8.2, C.red]];
  let aim = -0.3;
  for (const [a, b, body] of passes) {
    const q = prog(L, a, b); if (q <= 0 || q >= 1) continue;
    const x = lerp(-300, 1300, E.inOutSine(q)), y = 260 + Math.sin(q * Math.PI) * -40;
    for (let k = 1; k < 6; k++) { ctx.globalAlpha = 0.5 - k * 0.08; limb(ctx, [[x - 160 - k * 40, y - 30 + k * 12], [x - 260 - k * 70, y - 30 + k * 12]], 3, C.white); }
    ctx.globalAlpha = 1;
    jet(ctx, x, y, 1.1, 0, body);
    aim = Math.atan2(y - (GY - 300), x - 520);
  }
  // photographer panning
  person(ctx, 'A', { x: 520, y: GY + 60, look: 0.4, lookY: -0.5, aR: [1.9, 1.0], aL: [-0.5, 2.1], blink: false });
  withT(ctx, 555, GY - 300, 1, clamp(aim, -1.4, -0.1) * 0.7 + 0.05, () => camBody(ctx, 200));
  ctx.restore();
}

// 5. propeller aircraft: keep the blades turning
const PROP_SPEEDS = [[0, '1/1000', 0], [3, '1/500', 0.35], [4.5, '1/320', 0.7], [6, '1/250', 1]];
function propState(L) { let r = PROP_SPEEDS[0]; for (const p of PROP_SPEEDS) if (L >= p[0]) r = p; return r; }
function sceneProp(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(4);
  ctx.save(); ctx.translate(ax, 0);
  const img = AC.mustang;
  if (img) {
    const w = 640, h = w * img.height / img.width, x = 420 + Math.sin(L * 0.7) * 20, y = 330 + Math.sin(L * 1.1) * 12;
    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
    const st0 = propState(L), blur = st0[2] * E.outCubic(clamp((L - st0[0]) / 0.5)) + (PROP_SPEEDS[Math.max(0, PROP_SPEEDS.indexOf(st0) - 1)][2]) * (1 - E.outCubic(clamp((L - st0[0]) / 0.5)));
    propDisc(ctx, x - w / 2 + (480 / 511) * w, y - h / 2 + (90 / 181) * h, (88 / 181) * h, blur, L);
  }
  label(ctx, propState(L)[2] < 0.5 ? 'FROZEN' : 'PROP BLUR', 300, 540, 48, propState(L)[2] < 0.5 ? C.grey2 : C.teal, C.white, 1);
  person(ctx, 'B', { x: 780, y: GY + 60, look: -0.5, lookY: -0.5, aL: [-1.9, -1.0], aR: [0.5, -2.1], blink: false });
  withT(ctx, 745, GY - 300, 1, Math.PI + 0.45, () => { ctx.scale(1, -1); camBody(ctx, 160); });
  ctx.restore();
}

// 6. static aircraft: take your time
function sceneStatic(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(5);
  ctx.save(); ctx.translate(ax, 0);
  ctx.fillStyle = '#B9C3CB'; ctx.fillRect(-ax, GY - 10, SW, 80);
  jet(ctx, 470, GY - 120, 2.6, 0, C.blue);
  // detail callouts
  [['NOSE', 820, GY - 330, 4.5], ['ENGINE', 150, GY - 330, 4.9], ['WHEELS', 520, GY + 70, 5.3]].forEach(([t, x, y, d]) => label(ctx, t, x, y, 38, C.teal, C.white, pop(L, d, SPRING.bouncy)));
  // a framing square moves between the details
  const fx = kf(L, [[2, 470], [4.6, 820], [5.4, 150], [6.2, 520], [8, 470]]), fy = kf(L, [[2, GY - 140], [4.6, GY - 170], [5.4, GY - 150], [6.2, GY - 40], [8, GY - 140]]);
  const fw = kf(L, [[2, 560], [4.6, 220], [6.2, 220], [8, 560]]);
  ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.strokeRect(fx - fw / 2, fy - fw * 0.33, fw, fw * 0.66);
  person(ctx, 'K', { x: 900, y: GY + 120, look: -0.6, aL: [-2.5, 0], blink: blinkAt(L, 30), mouth: 0.6 });
  ctx.restore();
}

// 7. pack for a photo day
function scenePack(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(6), bx = 420, by = GY + 40;
  ctx.save(); ctx.translate(ax, 0);
  const items = [['card', -330, -300], ['card', -220, -380], ['battery', -60, -520], ['lens', 150, -540], ['cloth', 330, -420], ['rain', 360, -240], ['ear', -360, -120]];
  items.forEach(([nm, dx, dy], k) => {
    const d = 1.4 + k * 0.7, q = prog(L, d, d + 0.9); if (q <= 0) return;
    const e = E.outCubic(q), x = lerp(bx, bx + dx, e), y = lerp(by - 160, by + dy, e) - Math.sin(q * Math.PI) * 150;
    withT(ctx, x, y, 0.6 + 0.7 * Math.min(1, q * 2), (1 - e) * (k % 2 ? 1 : -1) * 1.2, () => PICON[nm](ctx));
  });
  // camera bag (straight-sided)
  box(ctx, bx - 200, by - 230, 400, 230, 16, '#2B3237');
  box(ctx, bx - 200, by - 270, 400, 60, 10, '#3A4650');
  box(ctx, bx - 60, by - 150, 120, 70, 0, C.teal, 4);
  label(ctx, 'CHECK THE RULES', 430, 200, 44, C.red, C.white, pop(L, 6.6, SPRING.bouncy));
  ctx.restore();
}

// 8. review and repeat: the prints come home
function sceneReview(ctx, u, L) {
  sfill(ctx, '#EEE6D8');
  const ax = artX(7);
  ctx.fillStyle = '#D9CBB3'; ctx.fillRect(0, GY - 10, SW, SH);
  ink(ctx); ctx.beginPath(); ctx.moveTo(0, GY - 10); ctx.lineTo(SW, GY - 10); ctx.stroke();
  ctx.save(); ctx.translate(ax, 0);
  // window with sky
  box(ctx, 60, 120, 260, 260, 0, C.sky); limb(ctx, [[190, 120], [190, 380]], 2, C.navy); limb(ctx, [[60, 250], [320, 250]], 2, C.navy);
  // desk + monitor showing the prints
  box(ctx, 120, GY - 250, 760, 30, 0, '#B07A4E');
  box(ctx, 260, 210, 600, 400, 0, '#2B3237');
  box(ctx, 275, 225, 570, 370, 0, '#EAF1F6', 0);
  box(ctx, 520, 610, 80, 60, 0, '#3A4650'); box(ctx, 440, 665, 240, 20, 0, '#3A4650');
  for (let k = 0; k < 6; k++) {
    const pk = pop(L, 1 + k * 0.45, SPRING.snappy); if (pk <= 0) continue;
    const c = k % 3, r = Math.floor(k / 3), x = 300 + c * 182, y = 240 + r * 176;
    withT(ctx, x + 80, y + 80, pk, 0, () => { const p = printOf(k); if (p) ctx.drawImage(p, -78, -78, 156, 156 * 432 / 392 * 0.92); ink(ctx, 3); ctx.strokeRect(-78, -78, 156, 156 * 432 / 392 * 0.92); });
    // the best ones get a star
    if ((k === 1 || k === 3 || k === 4) && L > 4.4) withT(ctx, x + 140, y + 20, pop(L, 4.4 + k * 0.15, SPRING.wobbly), 0, () => { ctx.beginPath(); for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + (j / 10) * TAU, rr = j % 2 ? 12 : 26; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); fs(ctx, C.gold, 3); });
  }
  person(ctx, 'A', { x: 150, y: GY + 60, look: 0.7, lookY: -0.2, aR: [1.2, 0.6], blink: blinkAt(L, 33), mouth: 0.4 * bump(L, 5, 1.5) });
  ctx.restore();
}

// per-step viewfinder readout (frame coordinates are handled by overlay())
function readoutFor(n, L) {
  if (n === 1) return `ZOOM ${zoomMM(L)}mm`;
  if (n === 2) return ['AUTO', 'S', 'S  AF-C', 'S  AF-C  BURST'][L < 2.5 ? 0 : L < 4.5 ? 1 : L < 6.5 ? 2 : 3];
  if (n === 3) return 'S  1/1000  AUTO ISO';
  if (n === 4) return `S  ${propState(L)[1]}`;
  if (n === 5) return 'A  f/8  ISO 100';
  return null;
}

// outro
function sceneOutro(ctx, u, L, IMG) {
  sky(ctx, u); hills(ctx); ground(ctx);
  // three jets draw the logo swoosh: red, navy, teal
  const cols = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  const path = (q, k) => { const x = lerp(-200, G.w + 300, q); return [x, (PORTRAIT ? 330 : 150) + k * 30 - Math.sin(q * Math.PI) * 110 + (q - 0.5) * -60]; };
  cols.forEach((col, k) => {
    const q = E.inOutSine(prog(L, -0.6 + k * 0.12, 4.2 + k * 0.12));
    ctx.beginPath(); for (let s = 0; s <= 60; s++) { const p = path((s / 60) * q, k); s ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.lineCap = 'round'; if (q > 0) { if (k === 1) { ctx.strokeStyle = '#C9D6E0'; ctx.lineWidth = 28; ctx.stroke(); } ctx.strokeStyle = col; ctx.lineWidth = 22; ctx.stroke(); }
    if (q > 0 && q < 1) { const p = path(q, k), p2 = path(Math.min(1, q + 0.01), k); jet(ctx, p[0] + 120, p[1] - 10, 0.8, Math.atan2(p2[1] - p[1], p2[0] - p[0])); }
  });
  // logo lands
  const lk = pop(L, 3, SPRING.bouncy);
  if (lk > 0 && IMG.logo) { const lw = PORTRAIT ? 780 : 700, lh = lw * IMG.logo.height / IMG.logo.width; withT(ctx, G.w / 2, PORTRAIT ? 640 : 335, lk, (1 - lk) * 0.2, () => { ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh); }); }
  const tk = E.outQuint(prog(L, 5, 5.8));
  ctx.save(); ctx.beginPath(); ctx.rect(0, PORTRAIT ? 880 : 580, G.w * tk, PORTRAIT ? 280 : 300); ctx.clip();
  if (PORTRAIT) { text(ctx, OUTRO_LINES[0], G.w / 2, 990, font(104, 800, DISPLAY), C.navy, 'center'); text(ctx, OUTRO_LINES[1], G.w / 2, 1100, font(104, 800, DISPLAY), C.navy, 'center'); }
  else text(ctx, OUTRO_LINE, G.w / 2, 680, font(84, 800, DISPLAY), C.navy, 'center');
  ctx.restore();
  const uk = pop(L, 6.2, SPRING.snappy);
  if (uk > 0) withT(ctx, G.w / 2, PORTRAIT ? 1220 : 790, uk, 0, () => { box(ctx, -330, -52, 660, 84, 0, C.teal); text(ctx, 'ukairshowguide.co.uk', 0, 10, font(50, 700, UI), C.white, 'center'); });
  // friends waving
  const wv = Math.sin(L * 5);
  person(ctx, 'A', { x: PORTRAIT ? 230 : 190, y: PORTRAIT ? 1640 : GY + 80, scale: PORTRAIT ? 0.85 : 1, aR: [2.5 + wv * 0.3, 0.3], blink: blinkAt(L, 30), mouth: 0.6, look: 0.4 });
  person(ctx, 'K', { x: PORTRAIT ? 610 : 1580, y: PORTRAIT ? 1650 : GY + 90, scale: PORTRAIT ? 0.85 : 1, hop: Math.max(0, Math.sin(L * Math.PI)) * 30, aL: [-2.6, 0], aR: [2.6, 0], mouth: 0.8, look: 0.3 });
  person(ctx, 'B', { x: PORTRAIT ? 840 : 1790, y: PORTRAIT ? 1640 : GY + 80, scale: PORTRAIT ? 0.85 : 1, aL: [-2.5 - wv * 0.3, -0.3], blink: blinkAt(L, 31), mouth: 0.6, look: -0.4 });
}

const SCENES = [sceneKit, sceneLens, sceneSetup, sceneJets, sceneProp, sceneStatic, scenePack, sceneReview];

// paint scene n (−1 = intro, 0..11 steps, 12 = outro) at beat u
function paint(ctx, n, u, IMG) {
  if (n < 0) return sceneIntro(ctx, u);
  if (n >= NSTEP) return sceneOutro(ctx, u, u - OUTRO, IMG);
  const s = st(n);
  SCENES[n](ctx, u, u - s);
  overlay(ctx, n, u, { x: artX(n), y: 0, w: 980, h: SH, k: 1 });
  card(ctx, u, s, n);
}
// ---------------------------------------------------------------- viewfinder overlay + snap
// prints are a deterministic render of the step at its snap moment, memoised per step
const PRINTS = {};
function printOf(n) {
  if (PRINTS[n]) return PRINTS[n];
  const cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
  const c = cv.getContext('2d'), g = G; G = STAGE; c.lineCap = 'round';
  SCENES[n](c, st(n) + 9.4, 9.4); G = g;
  const t = document.createElement('canvas'); t.width = 392; t.height = 432;
  t.getContext('2d').drawImage(cv, artX(n), 0, 980, SH, 0, 0, 392, 432);
  return (PRINTS[n] = t);
}
function overlay(ctx, n, u, Rr) {
  const L = u - st(n), k = Rr.k;
  // viewfinder brackets
  const bk = E.outCubic(prog(L, 0.6, 1.3));
  if (bk > 0) {
    const x0 = Rr.x + 70 * k, x1 = Rr.x + Rr.w - 70 * k, y0 = Rr.y + 120 * k, y1 = Rr.y + (GY + 40) * k, len = 70 * k * bk;
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      for (const [col, o] of [[C.navy, 3], [C.white, 0]]) { ctx.beginPath(); ctx.moveTo(x + o, y + sy * len + o); ctx.lineTo(x + o, y + o); ctx.lineTo(x + sx * len + o, y + o); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.stroke(); }
    }
    // focus point in the middle
    ctx.globalAlpha = 0.9 * bk; ctx.strokeStyle = C.white; ctx.lineWidth = 4; const cx = Rr.x + Rr.w / 2, cy = Rr.y + 420 * k; ctx.strokeRect(cx - 34 * k, cy - 24 * k, 68 * k, 48 * k); ctx.globalAlpha = 1;
  }
  // settings readout
  const str = readoutFor(n, L);
  if (str) readout(ctx, str, PORTRAIT ? W / 2 : Rr.x + Rr.w / 2, PORTRAIT ? 860 : Rr.y + 1010 * k, pop(L, 0.9, SPRING.snappy));
  // snap: flash, then a square print drops out and slides away
  if (n >= NSTEP - 1) return;
  const fl = bump(L, 9.55, 0.22);
  if (fl > 0) { ctx.globalAlpha = 0.8 * fl; ctx.fillStyle = C.white; ctx.fillRect(Rr.x, Rr.y, Rr.w, Rr.h); ctx.globalAlpha = 1; }
  const pk = pop(L, 9.65, SPRING.bouncy);
  if (pk > 0) {
    const pw = (PORTRAIT ? 360 : 300), ph = pw * 1.18, out = E.inCubic(prog(L, 10.7, 11.5)) * (H * 0.8);
    withT(ctx, Rr.x + Rr.w * (n % 2 ? 0.28 : 0.72), Rr.y + Rr.h * 0.6 + out, pk, -0.07 + (1 - pk) * 0.5, () => {
      ctx.fillStyle = 'rgba(19,41,60,0.25)'; ctx.fillRect(-pw / 2 + 12, -ph / 2 + 14, pw, ph);
      box(ctx, -pw / 2, -ph / 2, pw, ph, 0, C.white, 5);
      const p = printOf(n); const iw = pw - 36, ih = iw * 432 / 392 * 0.9;
      ctx.drawImage(p, 0, 0, 392, 392 * 0.9 * 432 / 392, -iw / 2, -ph / 2 + 18, iw, ih);
      ink(ctx, 3); ctx.strokeRect(-iw / 2, -ph / 2 + 18, iw, ih);
    });
  }
}
let STAGE_CV = null;
function frameAt(ctx, n, u, IMG) {
  if (!PORTRAIT) { G = STAGE; return paint(ctx, n, u, IMG); }
  if (n < 0 || n >= NSTEP) { G = PSURF; return paint(ctx, n, u, IMG); }
  if (!STAGE_CV) { STAGE_CV = document.createElement('canvas'); STAGE_CV.width = SW; STAGE_CV.height = SH; }
  const sc = STAGE_CV.getContext('2d');
  G = STAGE; sc.save(); sc.setTransform(1, 0, 0, 1, 0, 0); sc.lineCap = 'round'; SCENES[n](sc, u, u - st(n)); sc.restore();
  G = PSURF;
  const ax = artX(n), k = W / 980, dy = PSURF.gy - GY * k;
  ctx.drawImage(STAGE_CV, ax, 0, 980, 3, 0, 0, W, dy + 2);          // sky above the art: stretch its top rows
  ctx.drawImage(STAGE_CV, ax, 0, 980, SH, 0, dy, W, SH * k);
  ctx.drawImage(STAGE_CV, ax, SH - 3, 980, 3, 0, dy + SH * k - 1, W, H);  // ground below
  overlay(ctx, n, u, { x: 0, y: dy, w: W, h: SH * k, k });
  card(ctx, u, st(n), n);
}
const sceneAt = (u) => (u < INTRO ? -1 : u >= OUTRO ? NSTEP : Math.floor((u - INTRO) / STEP));

// ---------------------------------------------------------------- shutter transition
// A focal-plane shutter curtain runs top to bottom: the next scene is above it, the old one below.
const WIPE_A = 0.8, WIPE_B = 0.8;
function wipe(ctx, u, nNext, IMG) {
  const s = nNext >= NSTEP ? OUTRO : st(nNext);
  const p = E.inOutCubic(prog(u, s - WIPE_A, s + WIPE_B));
  const bh = 170, edge = lerp(-bh, H + bh, p);
  frameAt(ctx, nNext - 1, u, IMG);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, edge); ctx.clip();
  frameAt(ctx, nNext, u, IMG);
  ctx.restore();
  G = PORTRAIT ? PSURF : STAGE;
  // the curtain: four straight slats
  for (let k = 0; k < 4; k++) {
    const y = edge - bh / 2 + k * (bh / 4);
    ctx.fillStyle = k % 2 ? '#24323E' : '#1C2A36'; ctx.fillRect(0, y, W, bh / 4);
    ctx.fillStyle = '#3A4A57'; ctx.fillRect(0, y, W, 3);
  }
  ctx.fillStyle = C.teal; ctx.fillRect(0, edge + bh / 2 - 8, W, 8);
  ink(ctx, 4); ctx.beginPath(); ctx.moveTo(0, edge - bh / 2); ctx.lineTo(W, edge - bh / 2); ctx.moveTo(0, edge + bh / 2); ctx.lineTo(W, edge + bh / 2); ctx.stroke();
}

M.film({
  fonts: [font(100, 800, DISPLAY), font(100, 700, DISPLAY), font(40, 600, UI), font(40, 700, UI)],
  images: { logo: 'assets/logo.png', hawk: 'assets/aircraft/hawk-side.webp', typhoon: 'assets/aircraft/typhoon-side.webp', a400: 'assets/aircraft/a400m-side.webp', hawkTop: 'assets/aircraft/hawk-top.webp', typhoonTop: 'assets/aircraft/typhoon-top.webp', mustang: 'assets/aircraft/mustang-side.webp' },
  hits: HITS,
  samples: 8,
  draw(ctx, u, t, IMG) {
    AC = IMG;
    ctx.lineCap = 'round';
    // in a wipe window?
    for (let n = 0; n <= NSTEP; n++) {
      const s = n >= NSTEP ? OUTRO : st(n);
      if (u >= s - WIPE_A && u < s + WIPE_B) return wipe(ctx, u, n, IMG);
    }
    frameAt(ctx, sceneAt(u), u, IMG);
  },
});
