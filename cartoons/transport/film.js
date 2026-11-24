// transport: house style cartoon motion design. pure function of time. window.seek(t) paints frame t.
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
const INTRO = 8, STEP = 12, NSTEP = 9, OUTRO = INTRO + STEP * NSTEP; // 116
const st = (i) => INTRO + STEP * i;  // start beat of step i (0-based)

// ---------------------------------------------------------------- copy
// Facts from the site's own data: train-routes-src/eastbourne-cfg.json, clacton-cfg.json, clacton-data.json,
// journey-planner.js (Victoria to Eastbourne) and london-links.js (Victoria to Liverpool Street, Circle line).
const STEPS = [
  { title: 'Plan the trip', q: 'Eastbourne to Clacton by train', b: ['Train to London Victoria', 'Tube to Liverpool Street', 'Train to Clacton, then walk'] },
  { title: 'Buy your ticket', q: 'Eastbourne to Clacton-on-Sea', b: ['One ticket, routed via London', 'It usually covers the Tube', 'A Railcard saves a third'] },
  { title: 'Train to London', q: 'Southern, from Eastbourne', b: ['About 1 hour 25 minutes', 'Every 30 minutes (hourly Sundays)', 'Get off at London Victoria'] },
  { title: 'Follow the signs', q: 'For the Underground', b: ['They start on the platform', 'Then through the ticket gates', 'Use your ticket or contactless'] },
  { title: 'Circle line', q: 'Eastbound, towards Tower Hill', b: ['Not the District line', '11 stops, about 20 minutes', 'Get off at Liverpool Street'] },
  { title: 'Liverpool Street', q: 'Follow the National Rail signs', b: ['Find Clacton-on-Sea on the board', 'Allow 45 minutes for the change', 'Grab a drink for the train'] },
  { title: 'Train to Clacton', q: 'Greater Anglia, direct', b: ['A train every hour', 'About 1 hour 26 minutes', 'Check the summer 2027 times'] },
  { title: 'Walk to the show', q: '10 to 15 minutes on foot', b: ['Down through the town centre', 'Turn right at the seafront', 'On to the West Greensward'] },
  { title: 'Going home', q: 'The trains fill up fast', b: ['Busiest straight after the flying', 'Leave a little early', 'Or eat in town and go later'] },
];
const INTRO_WORDS = ['EASTBOURNE TO', 'CLACTON', 'BY TRAIN'], INTRO_TAG = 'CHANGING IN LONDON', INTRO_SUB = 'Train, Tube, train and a short walk';
const OUTRO_LINE = 'Enjoy the Clacton Air Show!', OUTRO_LINES = ['Enjoy the', 'Clacton Air Show!'];
const URL = 'ukairshowguide.co.uk/train-to-clacton';
const COL = { southern: '#7AB929', circle: '#FFD329', district: '#00782A', ga: '#D2232A', walk: C.teal };

// ---------------------------------------------------------------- hits (picture accents -> sfx)
const HITS = [
  [0, 'jet on frame 0', 'whoosh', { len: 1.2, from: 300, to: 1400, gain: 0.22 }],
  [0.05, 'HOW AIRSHOW', 'pop', { pitch: 'F5', gain: 0.25 }],
  [1, 'SECURITY', 'pop', { pitch: 'A5', gain: 0.25 }],
  [2, 'WORKS', 'pop', { pitch: 'C6', gain: 0.25 }],
  [3.5, 'tag', 'pop', { pitch: 'F5', to: 'C6', gain: 0.2 }],
  [4.5, 'subtitle', 'bell', { pitch: 'F6', gain: 0.18 }],
];
const PITCH = ['F5', 'A5', 'C6'];

for (let i = 0; i < NSTEP; i++) {
  const s = st(i);
  HITS.push([s, `step ${i + 1} wipe`, 'whoosh', { len: 0.9, from: 500, to: 2200, gain: 0.2, pan: i % 2 ? -0.3 : 0.3 }]);
  HITS.push([s + 0.5, `step ${i + 1} card`, 'pop', { pitch: 'C5', to: 'F5', gain: 0.22 }]);
  STEPS[i].b.forEach((_, j) => HITS.push([s + 2.5 + j * 2, `step ${i + 1} tick ${j + 1}`, 'blip', { pitch: PITCH[j % 3], gain: 0.16 }]));
}
// scene-specific accents
for (const d of [2.5, 4.5, 6.5]) HITS.push([st(0) + d - 0.1, 'route draws', 'whoosh', { len: 0.5, from: 600, to: 2000, gain: 0.08 }]);
HITS.push([st(2) + 0.5, 'train arrives', 'whoosh', { len: 1.4, from: 300, to: 900, gain: 0.14 }], [st(2) + 7.4, 'train leaves', 'whoosh', { len: 1.6, from: 400, to: 1200, gain: 0.14 }]);
HITS.push([st(3) + 3.6, 'gates open', 'click', { gain: 0.14 }], [st(3) + 6.6, 'tap', 'blip', { pitch: 'E6', gain: 0.14 }]);
HITS.push([st(4) + 2.6, 'not district', 'thud', { gain: 0.18 }], [st(4) + 5, 'tube arrives', 'whoosh', { len: 1.2, from: 300, to: 1000, gain: 0.14 }]);
HITS.push([st(5) + 0.6, 'board', 'thud', { gain: 0.16 }]);
HITS.push([st(6) + 0.3, 'train passes', 'whoosh', { len: 2.4, from: 300, to: 1100, gain: 0.14 }]);
HITS.push([st(7) + 6.6, 'red arrows', 'whoosh', { len: 1.4, from: 300, to: 1600, gain: 0.18 }]);
HITS.push([st(8) + 2.6, 'busy', 'thud', { gain: 0.16 }]);

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
  jetY: 150, jetS: 0.95, tag: [1540, 440], x0: 120,
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
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-330 + 10, -50 + 10, 660, 96);
    box(ctx, -330, -50, 660, 96, 0, C.red);
    text(ctx, INTRO_TAG, 0, 18, font(56, 800, DISPLAY), C.white, 'center');
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
  person(ctx, 'A', { x: LAY.ppl[1][0], y: LAY.ppl[1][1], scale: LAY.ppl[1][2], look, lookY: -0.8, aL: [-0.3 - 2.4 * pop(u, 1.2), -0.2], aR: [0.2, 0.3], blink: blinkAt(u, 5), mouth: 0.5 });
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

// ---------------------------------------------------------------- extra props (house style: navy outlines, square corners)
const LIVERY = {
  southern: { body: C.white, stripe: '#7AB929', door: '#7AB929', nose: '#7AB929' },
  ga: { body: C.white, stripe: '#D2232A', door: '#D2232A', nose: '#D2232A' },
  tube: { body: C.white, stripe: C.blue, door: C.red, nose: C.red, tube: true },
};
// side-view train; front at x, wheels on y; cars to the left (or right when flip)
function trainH(ctx, x, y, s, cars, lk, spin = 0, flip = false) {
  withT(ctx, x, y, s, 0, () => {
    if (flip) ctx.scale(-1, 1);
    for (let c = cars - 1; c >= 0; c--) {
      const x1 = -c * 436, x0 = x1 - 420, lead = c === 0;
      const body = () => {
        ctx.beginPath();
        if (lk.tube) { rrect(ctx, x0, -196, 420, 168, 46); return; }
        ctx.moveTo(x0, -28); ctx.lineTo(x0, -206);
        if (lead) { ctx.lineTo(x1 - 80, -206); ctx.lineTo(x1 + 14, -116); ctx.lineTo(x1 + 14, -28); }
        else { ctx.lineTo(x1, -206); ctx.lineTo(x1, -28); }
        ctx.closePath();
      };
      body(); ctx.fillStyle = lk.body; ctx.fill();
      ctx.save(); body(); ctx.clip();
      ctx.fillStyle = lk.stripe; ctx.fillRect(x0 - 10, -84, 460, 24);
      if (lead && lk.nose) { ctx.fillStyle = lk.nose; ctx.fillRect(x1 - 40, -120, 80, 92); }
      ctx.fillStyle = C.navy; ctx.fillRect(x0 - 10, -206, 460, 12);
      ctx.restore();
      body(); ink(ctx); ctx.stroke();
      for (let i = 0; i < (lead && !lk.tube ? 3 : 4); i++) box(ctx, x0 + 70 + i * 82, -176, 56, 50, 0, '#BFE6F2', 4);
      if (lead && !lk.tube) { ctx.beginPath(); ctx.moveTo(x1 - 76, -186); ctx.lineTo(x1 - 6, -126); ctx.lineTo(x1 - 76, -126); ctx.closePath(); fs(ctx, '#BFE6F2', 4); }
      [x0 + 18, x1 - 56 - (lead && !lk.tube ? 60 : 0)].forEach((dx) => { box(ctx, dx, -184, 40, 148, 0, lk.door, 4); ctx.fillStyle = '#BFE6F2'; ctx.fillRect(dx + 8, -170, 24, 44); });
      [x0 + 70, x0 + 130, x1 - 130, x1 - 70].forEach((wx) => { circ(ctx, wx, -18, 22, '#2B3237', 4); withT(ctx, wx, -18, 1, spin, () => { limb(ctx, [[-12, 0], [12, 0]], 2, C.grey); }); });
    }
  });
}
function rails(ctx, y, x0 = -100, x1 = 2100, off = 0) {
  for (let x = x0 - ((off % 60) + 60) % 60; x < x1; x += 60) { ctx.fillStyle = '#8C6E54'; ctx.fillRect(x, y + 2, 34, 12); }
  ctx.fillStyle = '#5B6B78'; ctx.fillRect(x0, y - 4, x1 - x0, 8);
}
// station platform: grey floor with a yellow line; sky above stays
function platform(ctx, edgeY = GY - 10) {
  ctx.fillStyle = '#C9D3DA'; ctx.fillRect(-1000, edgeY, 4000, G.h);
  ctx.fillStyle = C.gold; ctx.fillRect(-1000, edgeY + 8, 4000, 10);
  ink(ctx); ctx.beginPath(); ctx.moveTo(-1000, edgeY); ctx.lineTo(3000, edgeY); ctx.stroke();
}
// indoor tiles (stations, concourses)
function tiles(ctx, col = '#EEF2F5') {
  sfill(ctx, col);
  ctx.strokeStyle = '#DCE3E9'; ctx.lineWidth = 3;
  for (let y = 0; y < G.h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(G.w, y); ctx.stroke(); }
  ctx.fillStyle = '#C9D3DA'; ctx.fillRect(0, G.gy, G.w, G.h); ink(ctx); ctx.beginPath(); ctx.moveTo(0, G.gy); ctx.lineTo(G.w, G.gy); ctx.stroke();
}
// a straight-edged sign: bg box with an optional coloured bar on the left
function sign(ctx, str, x, y, size, bg, fg, bar = null, k = 1, sub = null) {
  if (k <= 0) return;
  const f = font(size, 800, DISPLAY); ctx.font = f;
  let w = ctx.measureText(str).width + size * 1.1 + (bar ? 40 : 0);
  const fs2 = font(size * 0.45, 700, UI);
  if (sub) { ctx.font = fs2; w = Math.max(w, ctx.measureText(sub).width + size * 1.1 + (bar ? 40 : 0)); }
  const h = size * (sub ? 1.9 : 1.4);
  withT(ctx, x, y, k, (1 - k) * 0.2, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-w / 2 + 10, -h / 2 + 10, w, h);
    box(ctx, -w / 2, -h / 2, w, h, 0, bg, 5);
    if (bar) { ctx.fillStyle = bar; ctx.fillRect(-w / 2 + 3, -h / 2 + 3, 34, h - 6); }
    const tx = -w / 2 + size * 0.55 + (bar ? 40 : 0);
    text(ctx, str, tx, sub ? -h / 2 + size * 1.05 : size * 0.36, f, fg);
    if (sub) text(ctx, sub, tx, h / 2 - size * 0.3, fs2, fg === C.white ? C.white : C.tealD);
  });
}
function arrowR(ctx, x, y, s, col = C.white) {
  withT(ctx, x, y, s, 0, () => { ctx.beginPath(); ctx.moveTo(-30, -10); ctx.lineTo(4, -10); ctx.lineTo(4, -26); ctx.lineTo(32, 0); ctx.lineTo(4, 26); ctx.lineTo(4, 10); ctx.lineTo(-30, 10); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); });
}
function wallClock(ctx, x, y, r, mins) {
  circ(ctx, x, y, r, C.white);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; limb(ctx, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86]], 1, C.navy); }
  const a = mins / 60 * TAU - Math.PI / 2, b = mins / 720 * TAU - Math.PI / 2;
  limb(ctx, [[x, y], [x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7]], 4, C.navy);
  limb(ctx, [[x, y], [x + Math.cos(b) * r * 0.45, y + Math.sin(b) * r * 0.45]], 6, C.navy);
  circ(ctx, x, y, 8, C.red, 0);
}
function bubbleSq(ctx, x, y, w, h, bg, str, k, tailLeft = true, fg = C.white) {
  if (k <= 0) return;
  withT(ctx, x + w / 2, y + h / 2, k, (1 - k) * (tailLeft ? -0.2 : 0.2), () => {
    ctx.beginPath(); const tx = tailLeft ? -w / 2 + 40 : w / 2 - 40;
    ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(tx + (tailLeft ? 50 : 0), h / 2); ctx.lineTo(tx, h / 2 + 40); ctx.lineTo(tx - (tailLeft ? 0 : 50), h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath();
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.save(); ctx.translate(10, 10); ctx.fill(); ctx.restore();
    fs(ctx, bg);
    text(ctx, str, 0, 18, font(50, 800, DISPLAY), fg, 'center');
  });
}
function envelope(ctx, x, y, s, rot = 0) {
  withT(ctx, x, y, s, rot, () => { box(ctx, -70, -46, 140, 92, 0, C.white); limb(ctx, [[-66, -42], [0, 10], [66, -42]], 1, C.navy); });
}
function phoneH(ctx, x, y, s, scr = '#BFE6F2') {
  withT(ctx, x, y, s, 0, () => { box(ctx, -40, -72, 80, 144, 10, '#2B3237'); ctx.fillStyle = scr; ctx.fillRect(-30, -58, 60, 112); });
}
// a photo print with a real aircraft cut-out in it
function print(ctx, x, y, w, h, rot, body, caption) {
  withT(ctx, x, y, 1, rot, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-w / 2 + 12, -h / 2 + 14, w, h);
    box(ctx, -w / 2, -h / 2, w, h, 0, C.white);
    const iw = w - 40, ih = h - (caption ? 110 : 40);
    ctx.save(); ctx.beginPath(); ctx.rect(-iw / 2, -h / 2 + 20, iw, ih); ctx.clip();
    ctx.fillStyle = '#9FD3EE'; ctx.fillRect(-iw / 2, -h / 2 + 20, iw, ih);
    cloud(ctx, -iw * 0.25, -h / 2 + 20 + ih * 0.3, iw / 900); cloud(ctx, iw * 0.3, -h / 2 + 20 + ih * 0.7, iw / 1200);
    jet(ctx, 0, -h / 2 + 20 + ih * 0.5, iw / 420, -0.08, body);
    ctx.restore();
    ink(ctx, 4); ctx.strokeRect(-iw / 2, -h / 2 + 20, iw, ih);
    if (caption) text(ctx, caption, -iw / 2, h / 2 - 34, font(Math.round(w / 17), 700, UI), C.navy);
  });
}
// Red Arrows trio across a span, with smoke; q = 0..1 progress
function redArrows(ctx, q, x0, x1, y, s = 0.7, dir = 1) {
  if (q <= 0 || q >= 1) return;
  const P = (qq, k) => [lerp(x0, x1, qq) - dir * k * 70 * s / 0.7, y + k * 40 * s / 0.7 - Math.sin(qq * Math.PI) * 40];
  const SM = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  [1, 0, 2].forEach((k) => { const pts = []; for (let n = 1; n < 70; n++) { const qq = q - n * 0.005; if (qq < 0) break; const p = P(qq, k); pts.push([p[0] - dir * 120 * s / 0.7, p[1] + 12]); } if (k === 0) smoke(ctx, pts, '#B9C7D3', 12, 0.25, 0.6); smoke(ctx, pts, SM[k], 9, 0.25); });
  [1, 0, 2].forEach((k) => { const p = P(q, k); jet(ctx, p[0], p[1], s, 0, C.red, dir < 0); });
}

// ================================================================ scenes
// 1. plan the trip: the route map
const MP = { EBN: [0.47, 0.86], VIC: [0.35, 0.44], LST: [0.41, 0.4], COL: [0.71, 0.25], CLT: [0.79, 0.31], SEA: [0.81, 0.35] };
const SEAPOLY = [[1, 0], [0.86, 0], [0.84, 0.16], [0.83, 0.3], [0.8, 0.38], [0.7, 0.42], [0.6, 0.46], [0.66, 0.5], [0.78, 0.52], [0.86, 0.56],
  [0.9, 0.64], [0.88, 0.74], [0.76, 0.82], [0.62, 0.86], [0.52, 0.895], [0.36, 0.9], [0.2, 0.92], [0, 0.93], [0, 1], [1, 1]];
function scenePlan(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(0); ctx.save(); ctx.translate(ax, 0);
  const bx = 70, by = 130, bw = 700, bh = 720;
  const bk = pop(L, 0.3, SPRING.bouncy);
  withT(ctx, bx + bw / 2, by + bh / 2, bk, (1 - bk) * -0.1, () => {
    ctx.translate(-(bx + bw / 2), -(by + bh / 2));
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(bx + 12, by + 14, bw, bh);
    box(ctx, bx, by, bw, bh, 0, '#CFE8B8');
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    ctx.beginPath(); SEAPOLY.forEach(([x, y], i) => (i ? ctx.lineTo(bx + x * bw, by + y * bh) : ctx.moveTo(bx + x * bw, by + y * bh))); ctx.closePath(); ctx.fillStyle = '#9FD3EE'; ctx.fill();
    ctx.restore(); ink(ctx); ctx.strokeRect(bx, by, bw, bh);
    const mp = (k) => [bx + MP[k][0] * bw, by + MP[k][1] * bh];
    const legs = [[['EBN', 'VIC'], COL.southern, 2.0, 3.2, 0], [['VIC', 'LST'], COL.circle, 4.0, 4.8, 0], [['LST', 'COL', 'CLT'], COL.ga, 6.0, 7.4, 0], [['CLT', 'SEA'], COL.walk, 7.4, 8.0, 1]];
    legs.forEach(([pts, col, a, b, dash]) => {
      const p = E.inOutCubic(prog(L, a, b)); if (p <= 0) return;
      const xy = pts.map(mp); const seg = xy.slice(1).map((q, i) => Math.hypot(q[0] - xy[i][0], q[1] - xy[i][1])); let left = seg.reduce((s, v) => s + v, 0) * p;
      ctx.beginPath(); ctx.moveTo(xy[0][0], xy[0][1]);
      for (let i = 0; i < seg.length && left > 0; i++) { const f = Math.min(1, left / seg[i]); ctx.lineTo(lerp(xy[i][0], xy[i + 1][0], f), lerp(xy[i][1], xy[i + 1][1], f)); left -= seg[i]; }
      ctx.lineCap = 'round'; ctx.strokeStyle = C.navy; ctx.lineWidth = 26; if (!dash) ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 16; if (dash) ctx.setLineDash([4, 24]); ctx.stroke(); ctx.setLineDash([]);
    });
    [['EBN', 'EASTBOURNE', 0.8, 0, 70], ['VIC', 'LONDON', 2.6, -40, -60], ['CLT', 'CLACTON', 6.8, -40, -70]].forEach(([k, nm, b, dx, dy]) => {
      const q = pop(L, b); if (q <= 0) return; const [x, y] = mp(k);
      withT(ctx, x, y, q, 0, () => box(ctx, -16, -16, 32, 32, 0, C.white, 5));
      label(ctx, nm, x + dx, y + dy, 40, C.navy, C.white, q);
    });
  });
  person(ctx, 'A', { x: 870, y: GY + 70, scale: 0.85, look: -0.6, aL: [-1.9, -0.3], blink: blinkAt(L, 3), holdR: (c) => rucksack(c, 0, 50, 0.4) });
  ctx.restore();
}
// 2. buy your ticket
function sceneTicket(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(1); ctx.save(); ctx.translate(ax, 0);
  const tk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 440, 380, tk, -0.05 + (1 - tk) * 0.3, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-340 + 12, -200 + 14, 680, 400);
    box(ctx, -340, -200, 680, 400, 0, '#FFF6DE');
    ctx.fillStyle = C.gold; ctx.fillRect(-337, -197, 674, 72); text(ctx, 'TRAIN TICKET', -310, -144, font(46, 800, DISPLAY), C.navy);
    text(ctx, 'FROM', -310, -70, font(28, 700, UI), C.grey2); text(ctx, 'EASTBOURNE', -310, -20, font(62, 800, DISPLAY), C.navy);
    text(ctx, 'TO', -310, 46, font(28, 700, UI), C.grey2); text(ctx, 'CLACTON-ON-SEA', -310, 96, font(62, 800, DISPLAY), C.navy);
    text(ctx, 'ROUTE: VIA LONDON', -310, 160, font(32, 800, DISPLAY), C.red);
    ink(ctx, 4); ctx.setLineDash([12, 12]); ctx.beginPath(); ctx.moveTo(190, -110); ctx.lineTo(190, 180); ctx.stroke(); ctx.setLineDash([]);
    jet(ctx, 265, 40, 0.5, -1.3, C.red);
  });
  label(ctx, 'TUBE ACROSS LONDON', 440, 680, 44, C.navy, C.white, pop(L, 4.5));
  const rk = pop(L, 6.5, SPRING.bouncy);
  if (rk > 0) withT(ctx, 230, 800, rk, 0.06, () => { box(ctx, -150, -60, 300, 120, 0, C.teal); text(ctx, 'RAILCARD', 0, -6, font(44, 800, DISPLAY), C.white, 'center'); text(ctx, 'A THIRD OFF', 0, 40, font(30, 800, DISPLAY), C.navy, 'center'); });
  person(ctx, 'B', { x: 820, y: GY + 70, scale: 0.9, look: -0.6, aL: [-1.4, -0.6], blink: blinkAt(L, 5), mouth: 0.3 * bump(L, 4.5, 1.5), holdL: (c) => phoneH(c, 0, -20, 0.55) });
  ctx.restore();
}
// 3. Southern train to Victoria
function sceneSouthern(ctx, u, L) {
  sky(ctx, u); hills(ctx);
  const ax = artX(2); ctx.save(); ctx.translate(ax, 0);
  // canopy
  for (const x of [80, 480, 880]) box(ctx, x - 9, 130, 18, GY - 140, 0, '#2E5E12', 0);
  box(ctx, -40, 100, 1060, 46, 0, '#2E5E12');
  sign(ctx, 'EASTBOURNE', 480, 220, 60, C.white, C.navy, COL.southern, 1);
  rails(ctx, GY - 22, -100, 1100);
  // arrives (decelerating), waits, leaves
  const arr = E.outCubic(prog(L, 0.3, 3)), dep = E.inCubic(prog(L, 7.4, 11));
  const tx = lerp(-80, 900, arr) + dep * 1900;
  trainH(ctx, tx, GY - 22, 0.95, 2, LIVERY.southern, (1 - arr + dep) * 20);
  platform(ctx, GY + 30);
  // A walks to the door and steps on
  const wp = prog(L, 3.4, 5.4);
  if (L < 5.6) person(ctx, 'A', { x: lerp(60, 520, E.inOutSine(wp)), y: GY + 110 - (L > 5.2 ? (L - 5.2) * 150 : 0), scale: 0.85, walk: wp > 0 && wp < 1 ? L * 7 : undefined, look: 0.6, blink: blinkAt(L, 7), holdR: (c) => rucksack(c, 0, 50, 0.4), aL: [-Math.sin(L * 7) * 0.4 * (wp > 0 && wp < 1 ? 1 : 0), -0.3] });
  label(ctx, 'SOUTHERN', 220, 360, 48, COL.southern, '#13210F', pop(L, 2.5) * (1 - prog(L, 10.5, 11)));
  label(ctx, '1 HR 25 MIN', 480, 360, 48, C.navy, C.white, pop(L, 4.5) * (1 - prog(L, 10.5, 11)));
  label(ctx, 'TO LONDON VICTORIA', 520, 460, 48, C.white, C.navy, pop(L, 6.5) * (1 - prog(L, 10.5, 11)));
  ctx.restore();
}
// 4. follow the signs: Underground, gates
function sceneGates(ctx, u, L) {
  tiles(ctx);
  const ax = artX(3); ctx.save(); ctx.translate(ax, 0);
  // hanging sign
  limb(ctx, [[260, 0], [260, 250]], 2, C.grey2); limb(ctx, [[700, 0], [700, 250]], 2, C.grey2);
  const sk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 480, 310, sk, 0, () => { box(ctx, -300, -64, 600, 128, 0, C.navy); text(ctx, 'UNDERGROUND', -260, 24, font(66, 800, DISPLAY), C.white); arrowR(ctx, 230, 0, 1.4, COL.circle); });
  // gates
  const open = E.outBack(prog(L, 3.6, 4.2), 1.4) * (1 - prog(L, 6.8, 7.2)) + E.outBack(prog(L, 7.2, 7.8)) * (1 - prog(L, 10, 10.5));
  for (let g = 0; g < 3; g++) {
    const gx = 400 + g * 220;
    box(ctx, gx - 110, GY - 170, 44, 170, 0, '#5B6B78'); box(ctx, gx + 66, GY - 170, 44, 170, 0, '#5B6B78');
    ctx.fillStyle = g === 1 ? '#2EC26A' : C.grey; ctx.fillRect(gx - 102, GY - 160, 28, 10);
    const pw = 62 * (1 - (g === 1 ? clamp(open) : 0));
    if (pw > 2) { box(ctx, gx - 66, GY - 120, pw, 56, 0, C.red, 4); box(ctx, gx + 66 - pw, GY - 120, pw, 56, 0, C.red, 4); }
  }
  // A walks up, through; B follows and taps a card
  const a1 = prog(L, 0.8, 3.2), a2 = prog(L, 4, 6.6);
  const axp = lerp(-60, 520, E.inOutSine(a1)) + E.inOutSine(a2) * 600;
  const aw = (a1 > 0 && a1 < 1) || (a2 > 0 && a2 < 1);
  person(ctx, 'A', { x: axp, y: GY + 80, scale: 0.85, walk: aw ? L * 7 : undefined, look: 0.6, blink: blinkAt(L, 9), aR: a1 >= 1 && a2 <= 0 ? [1.5, 0.3] : [0.2, 0.2], holdR: a1 >= 1 && a2 <= 0 ? (c) => { box(c, -30, -20, 60, 40, 0, '#FFF6DE', 4); } : undefined, holdL: (c) => rucksack(c, 0, 50, 0.4) });
  const b1 = prog(L, 5, 7), b2 = prog(L, 7.6, 10);
  const bxp = lerp(-160, 520, E.inOutSine(b1)) + E.inOutSine(b2) * 600;
  const bw = (b1 > 0 && b1 < 1) || (b2 > 0 && b2 < 1);
  if (L > 5) person(ctx, 'B', { x: bxp, y: GY + 90, scale: 0.85, walk: bw ? L * 7 : undefined, look: 0.6, blink: blinkAt(L, 10), aR: b1 >= 1 && b2 <= 0 ? [1.5, 0.3] : [0.2, 0.2], holdR: b1 >= 1 && b2 <= 0 ? (c) => { box(c, -30, -20, 60, 40, 0, C.blue, 4); } : undefined });
  label(ctx, 'TICKET OR CONTACTLESS', 480, 500, 44, C.teal, C.white, pop(L, 6.6) * (1 - prog(L, 11, 11.5)));
  ctx.restore();
}
// 5. Circle line, not the District line
function sceneCircle(ctx, u, L) {
  tiles(ctx, '#F1EFE6');
  const ax = artX(4); ctx.save(); ctx.translate(ax, 0);
  // tunnel mouth
  ctx.fillStyle = '#2B3237'; ctx.fillRect(-100, 480, 1200, GY - 480);
  sign(ctx, 'CIRCLE LINE', 380, 250, 70, C.white, C.navy, COL.circle, pop(L, 0.5), 'EASTBOUND TO TOWER HILL');
  tickSq(ctx, 800, 250, pop(L, 1.2, SPRING.wobbly) * 1.2, true);
  ctx.save(); ctx.globalAlpha = 0.95; sign(ctx, 'DISTRICT LINE', 380, 400, 50, C.white, C.grey2, COL.district, pop(L, 2.5)); ctx.restore();
  tickSq(ctx, 720, 400, pop(L, 2.7, SPRING.wobbly), false);
  rails(ctx, GY - 22, -100, 1100);
  const arr = E.outCubic(prog(L, 4.6, 6.6)), dep = E.inCubic(prog(L, 9, 11.5));
  trainH(ctx, lerp(-60, 1000, arr) + dep * 1900, GY - 22, 0.9, 2, LIVERY.tube, (1 - arr + dep) * 20);
  platform(ctx, GY + 30);
  person(ctx, 'A', { x: 180, y: GY + 110, scale: 0.85, look: 0.4, lookY: -0.5, aR: [2.2 * pop(L, 1), 0.2], blink: blinkAt(L, 12), holdL: (c) => rucksack(c, 0, 50, 0.4), mouth: 0.4 * bump(L, 1.5, 1) });
  label(ctx, '11 STOPS', 620, 560, 50, C.navy, C.white, pop(L, 4.5) * (1 - prog(L, 8.6, 9)));
  label(ctx, 'OFF AT LIVERPOOL STREET', 560, 560, 44, C.red, C.white, pop(L, 9) * 1);
  ctx.restore();
}
// 6. Liverpool Street: the departure board
function sceneLST(ctx, u, L) {
  tiles(ctx);
  const ax = artX(5); ctx.save(); ctx.translate(ax, 0);
  const bk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 480, 370, bk, 0, () => {
    box(ctx, -400, -170, 800, 340, 0, '#111518');
    const amber = '#FFB400';
    text(ctx, 'DEPARTURES', -360, -100, font(40, 800, DISPLAY), '#C98F00');
    const rk = E.outQuint(prog(L, 2.4, 3.2));
    ctx.save(); ctx.beginPath(); ctx.rect(-380, -70, 760 * rk, 220); ctx.clip();
    text(ctx, '10:18', -360, -6, font(66, 800, DISPLAY), amber); text(ctx, 'CLACTON-ON-SEA', -190, -6, font(66, 800, DISPLAY), amber);
    text(ctx, 'Stratford, Shenfield, Chelmsford, Colchester', -360, 54, font(32, 600, UI), '#E6A500');
    text(ctx, 'On time', -360, 120, font(36, 700, UI), '#7CD67C');
    ctx.restore();
  });
  const ck = pop(L, 4.5, SPRING.bouncy);
  if (ck > 0) withT(ctx, 180, 680, ck, 0, () => wallClock(ctx, 0, 0, 80, (L * 3) % 60 + 20));
  label(ctx, '45 MIN', 180, 805, 50, C.navy, C.white, pop(L, 4.8));
  const wp = prog(L, 6.4, 11);
  person(ctx, 'A', { x: lerp(400, 1100, E.inOutSine(wp)), y: GY + 80, scale: 0.85, walk: wp > 0 && wp < 1 ? L * 7 : undefined, look: 0.6, blink: blinkAt(L, 14), aR: [1.1, 0.8], holdR: (c) => { box(c, -18, -40, 36, 50, 4, C.white, 4); c.fillStyle = C.red; c.fillRect(-15, -20, 30, 12); }, holdL: (c) => rucksack(c, 0, 50, 0.4) });
  person(ctx, 'B', { x: lerp(560, 1260, E.inOutSine(wp)), y: GY + 90, scale: 0.85, walk: wp > 0 && wp < 1 ? L * 7 + 1 : undefined, look: 0.6, blink: blinkAt(L, 15), mouth: 0.4 * bump(L, 7, 1) });
  ctx.restore();
}
// 7. Greater Anglia to Clacton, through Essex
function sceneGA(ctx, u, L) {
  sky(ctx, u);
  const ax = artX(6); ctx.save(); ctx.translate(ax, 0);
  ctx.fillStyle = C.sea; ctx.fillRect(-100, GY - 200, 1200, 90);
  for (let k = 0; k < 8; k++) { const wx = ((k * 150 + L * 40) % 1100) - 60; limb(ctx, [[wx, GY - 160], [wx + 40, GY - 160]], 2, '#8CC8E6'); }
  ctx.fillStyle = '#B6DAA6'; ctx.fillRect(-100, GY - 110, 1200, 120);
  for (let k = 0; k < 7; k++) { const tx = ((k * 190 - L * 60) % 1330 + 1330) % 1330 - 160; box(ctx, tx - 8, GY - 150, 16, 50, 0, '#8C6E54', 3); circ(ctx, tx, GY - 170, 44, C.grass2); }
  ground(ctx);
  rails(ctx, GY + 60, -100, 1100);
  const p = prog(L, 0.2, 11.6);
  trainH(ctx, lerp(-150, 2300, p), GY + 60, 0.85, 3, LIVERY.ga, L * 3);
  label(ctx, 'GREATER ANGLIA', 480, 300, 52, COL.ga, C.white, pop(L, 0.8));
  label(ctx, 'EVERY HOUR', 300, 410, 48, C.white, C.navy, pop(L, 2.5));
  label(ctx, '1 HR 26 MIN', 660, 410, 48, C.navy, C.white, pop(L, 4.5));
  label(ctx, 'CHECK 2027 TIMES', 480, 520, 48, C.gold, C.navy, pop(L, 6.5));
  ctx.restore();
}
// 8. walk to the seafront and the West Greensward
function sceneWalk(ctx, u, L) {
  sky(ctx, u);
  const ax = artX(7); ctx.save(); ctx.translate(ax, 0);
  ctx.fillStyle = C.sea; ctx.fillRect(-100, GY - 260, 1200, 200);
  for (let k = 0; k < 9; k++) { const wx = ((k * 130 + L * 30) % 1100) - 60; ctx.beginPath(); ctx.arc(wx, GY - 200 + (k % 2) * 60, 14, Math.PI, TAU); ink(ctx, 4); ctx.strokeStyle = C.white; ctx.stroke(); }
  ctx.fillStyle = C.sand; ctx.fillRect(-100, GY - 60, 1200, 60);
  // the pier, off to the east (left of frame when facing the sea we turn right, so the pier is behind us)
  ground(ctx);
  // crowd line along the Greensward once there
  if (L > 6.4) for (let k = 0; k < 9; k++) { const bx = 560 + k * 52; box(ctx, bx - 6, GY - 10, 12, 60, 0, k % 2 ? C.red : C.white, 3); }
  redArrows(ctx, prog(L, 6.6, 12), -260, 1200, 230, 0.6);
  // fingerpost
  box(ctx, 470, 300, 18, GY - 300, 0, '#7A5B3A');
  const fp = [['TOWN CENTRE', 360, 2.4, -1], ['SEAFRONT', 450, 4.4, 1], ['WEST GREENSWARD', 540, 6.4, 1]];
  fp.forEach(([nm, y, b, dir]) => {
    const q = pop(L, b, SPRING.bouncy); if (q <= 0) return;
    ctx.font = font(40, 800, DISPLAY); const w = ctx.measureText(nm).width + 80;
    withT(ctx, 479, y, 1, (1 - q) * dir * 0.6, () => {
      ctx.beginPath(); if (dir > 0) { ctx.moveTo(0, -32); ctx.lineTo(w, -32); ctx.lineTo(w + 34, 0); ctx.lineTo(w, 32); ctx.lineTo(0, 32); } else { ctx.moveTo(0, -32); ctx.lineTo(-w, -32); ctx.lineTo(-w - 34, 0); ctx.lineTo(-w, 32); ctx.lineTo(0, 32); }
      ctx.closePath(); fs(ctx, dir > 0 ? C.teal : C.navy, 5);
      text(ctx, nm, dir > 0 ? 24 : -w + 18, 14, font(40, 800, DISPLAY), C.white);
    });
  });
  const wp = prog(L, 0.8, 6);
  ['K', 'B', 'A'].forEach((w, k) => person(ctx, w, { x: lerp(-180 - k * 140, 520 + k * 140, E.inOutSine(wp)) + (L > 6 ? 0 : 0), y: GY + 110, scale: 0.8, walk: wp > 0 && wp < 1 ? L * 7 + k : undefined,
    look: wp < 1 ? 0.6 : -0.3, lookY: L > 6.6 ? -0.7 : 0, aL: L > 7 ? [-2.4 + Math.sin(L * 5 + k) * 0.3, 0] : [-0.2, -0.2], mouth: L > 7 ? 0.6 : 0.2, blink: blinkAt(L, 20 + k) }));
  ctx.restore();
}
// 9. going home: a busy platform at sunset
function sceneHome(ctx, u, L) {
  sky(ctx, u, '#F6C9A0', '#FBE3CE');
  const ax = artX(8); ctx.save(); ctx.translate(ax, 0);
  sun(ctx, 820, 260, 70, u, false);
  for (const x of [80, 480, 880]) box(ctx, x - 9, 130, 18, GY - 140, 0, '#9E1A20', 0);
  box(ctx, -40, 100, 1060, 46, 0, '#9E1A20');
  sign(ctx, 'CLACTON-ON-SEA', 480, 220, 56, C.white, C.navy, COL.ga, 1);
  rails(ctx, GY - 22, -100, 1100);
  trainH(ctx, 960, GY - 22, 0.95, 2, LIVERY.ga, 0);
  // faces at every window: a full train
  for (let c = 0; c < 2; c++) for (let i = 0; i < (c === 0 ? 3 : 4); i++) { const wx = 960 + (-c * 436 - 420 + 70 + i * 82 + 28) * 0.95, wy = GY - 22 - 150 * 0.95; circ(ctx, wx, wy + 6, 15, [C.skin1, C.skin2, C.skin3][(c + i) % 3], 3); }
  platform(ctx, GY + 30);
  const Q = [['S2', 80], ['B', 230], ['A', 380], ['K', 500], ['S', 640]];
  Q.forEach(([w, x], k) => person(ctx, w, { x, y: GY + 110, scale: 0.72, look: 0.6, blink: blinkAt(L, 30 + k), mouth: 0.15 }));
  label(ctx, 'BUSY!', 300, 380, 60, C.red, C.white, pop(L, 2.5));
  const ck = pop(L, 4.5);
  if (ck > 0) withT(ctx, 640, 400, ck, 0, () => { wallClock(ctx, 0, 0, 70, 40); });
  label(ctx, 'LEAVE EARLY', 640, 520, 44, C.navy, C.white, pop(L, 4.7));
  label(ctx, 'OR EAT IN TOWN', 340, 520, 44, C.teal, C.white, pop(L, 6.5));
  ctx.restore();
}
const SCENES = [scenePlan, sceneTicket, sceneSouthern, sceneGates, sceneCircle, sceneLST, sceneGA, sceneWalk, sceneHome];

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
  if (uk > 0) withT(ctx, G.w / 2, PORTRAIT ? 1220 : 790, uk, 0, () => { ctx.font = font(50, 700, UI); const uw = ctx.measureText(URL).width + 90; box(ctx, -uw / 2, -52, uw, 84, 0, C.teal); text(ctx, URL, 0, 10, font(50, 700, UI), C.white, 'center'); });
  // friends waving
  const wv = Math.sin(L * 5);
  person(ctx, 'A', { x: PORTRAIT ? 230 : 190, y: PORTRAIT ? 1640 : GY + 80, scale: PORTRAIT ? 0.85 : 1, aR: [2.5 + wv * 0.3, 0.3], blink: blinkAt(L, 30), mouth: 0.6, look: 0.4 });
  person(ctx, 'K', { x: PORTRAIT ? 610 : 1580, y: PORTRAIT ? 1650 : GY + 90, scale: PORTRAIT ? 0.85 : 1, hop: Math.max(0, Math.sin(L * Math.PI)) * 30, aL: [-2.6, 0], aR: [2.6, 0], mouth: 0.8, look: 0.3 });
  person(ctx, 'B', { x: PORTRAIT ? 840 : 1790, y: PORTRAIT ? 1640 : GY + 80, scale: PORTRAIT ? 0.85 : 1, aL: [-2.5 - wv * 0.3, -0.3], blink: blinkAt(L, 31), mouth: 0.6, look: -0.4 });
}


// paint scene n (−1 = intro, 0..11 steps, 12 = outro) at beat u
function paint(ctx, n, u, IMG) {
  if (n < 0) return sceneIntro(ctx, u);
  if (n >= NSTEP) return sceneOutro(ctx, u, u - OUTRO, IMG);
  const s = st(n);
  SCENES[n](ctx, u, u - s);
  card(ctx, u, s, n);
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
  card(ctx, u, st(n), n);
}
const sceneAt = (u) => (u < INTRO ? -1 : u >= OUTRO ? NSTEP : Math.floor((u - INTRO) / STEP));

// ---------------------------------------------------------------- jet wipe transition
// A jet flies left to right towing a cloud curtain: the next scene is behind it, the old one ahead.
const WIPE_A = 0.9, WIPE_B = 0.9;
function wipe(ctx, u, nNext, IMG) {
  const s = nNext >= NSTEP ? OUTRO : st(nNext);
  const p = E.inOutSine(prog(u, s - WIPE_A, s + WIPE_B));
  const edge = lerp(-260, W + 260, p);
  frameAt(ctx, nNext - 1, u, IMG);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-10, -10);
  for (let y = -10; y <= H + 10; y += 30) ctx.lineTo(edge + Math.sin(y / 90 + u * 4) * 36, y);
  ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip();
  frameAt(ctx, nNext, u, IMG);
  ctx.restore();
  G = PORTRAIT ? PSURF : STAGE;
  // cloud curtain along the edge
  for (let k = 0; k < 14; k++) {
    const y = k * 84, x = edge + Math.sin(y / 90 + u * 4) * 36;
    puff(ctx, x, y, 70 + hash01(k, 41) * 40, C.white, 1);
    puff(ctx, x + 30, y + 30, 40 + hash01(k, 43) * 24, '#EEF3F7', 1);
  }
  const jy = H * 0.4 + Math.sin(p * TAU) * 60;
  jet(ctx, edge + 200, jy, 1.25, Math.cos(p * TAU) * 0.08, nNext % 2 ? C.blue : C.red);
}

M.film({
  fonts: [font(100, 800, DISPLAY), font(100, 700, DISPLAY), font(40, 600, UI), font(40, 700, UI)],
  images: { logo: 'assets/logo.png', hawk: 'assets/aircraft/hawk-side.webp', typhoon: 'assets/aircraft/typhoon-side.webp', a400: 'assets/aircraft/a400m-side.webp', hawkTop: 'assets/aircraft/hawk-top.webp', typhoonTop: 'assets/aircraft/typhoon-top.webp' },
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
