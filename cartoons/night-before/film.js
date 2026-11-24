// night-before: house style cartoon motion design. pure function of time. window.seek(t) paints frame t.
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
// Copy from night-before.html (The Night Before An Airshow).
const STEPS = [
  { title: 'Tickets and passes', q: 'Get them on your phone tonight', b: ['Save every ticket to your phone', 'Take a screenshot of each one', 'Fold a printed copy in the bag'] },
  { title: 'Travel checks', q: 'Ten minutes now saves an hour', b: ["Check the show's travel page", 'Save the car park gate postcode', 'Fuel up or charge the car'] },
  { title: 'Weather and layers', q: 'Pack for a bit worse than it says', b: ['Check the forecast and warnings', 'Lay out layers for everyone', 'Sun cream, even if it is cloudy'] },
  { title: 'Charge everything', q: 'Straight after tea', b: ['Phones, tablets and power bank', 'Camera batteries and spares', 'Pack the cables in the bag now'] },
  { title: 'Pack the bag', q: 'Lay it all out on the floor first', b: ['Things to check go on the top', 'Cash and a card for the stalls', 'Meds, plasters and a bin bag'] },
  { title: 'Food and water', q: 'Made tonight, packed in the morning', b: ['Water bottles in the fridge', 'Sandwiches and snacks made', 'Ice packs in the freezer'] },
  { title: "Kids' kit", q: 'Try it all on tonight', b: ['Ear defenders, one pair each', 'A spare set of clothes', 'Your phone number on each child'] },
  { title: 'Camera kit', q: 'Ready for the first display', b: ['Give each lens a clean', 'Reset your settings for the show', 'Rain cover and a cloth packed'] },
  { title: 'Before bed', q: 'Bag by the front door', b: ['Set two alarms', 'Agree the out of the door time', 'Take out any banned items'] },
];
const INTRO_WORDS = ['THE NIGHT BEFORE', 'YOUR', 'AIRSHOW'], INTRO_TAG = 'MY EVENING CHECKLIST', INTRO_SUB = 'So the morning is calm';
const OUTRO_LINE = 'Bag by the door, then bed!', OUTRO_LINES = ['Bag by the door,', 'then bed!'];
// the full path is too wide for the 9:16 URL bar, so the vertical cut shows the home address
const URL = 'ukairshowguide.co.uk/night-before-an-airshow';

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
HITS.push([st(0) + 4.6, 'screenshot', 'click', { gain: 0.14 }]);
HITS.push([st(1) + 4.6, 'pin drops', 'thud', { gain: 0.14 }]);
HITS.push([st(2) + 4.5, 'clothes land', 'thud', { pitch: 200, gain: 0.12 }]);
HITS.push([st(4) + 2.5, 'into the bag', 'whoosh', { len: 0.4, from: 900, to: 2400, gain: 0.08 }], [st(4) + 4.5, 'into the bag', 'whoosh', { len: 0.4, from: 900, to: 2400, gain: 0.08 }]);
HITS.push([st(5) + 0.5, 'fridge opens', 'whoosh', { len: 0.3, from: 600, to: 1600, gain: 0.08 }]);
HITS.push([st(6) + 2.6, 'ear defenders on', 'pop', { pitch: 'C6', gain: 0.14 }]);
HITS.push([st(7) + 4.6, 'settings', 'blip', { pitch: 'E6', gain: 0.12 }]);
for (const d of [2.5, 3.0, 3.5]) HITS.push([st(8) + d, 'alarm ring', 'blip', { pitch: 'A6', gain: 0.1 }]);
HITS.push([st(8) + 6.8, 'banned out', 'thud', { gain: 0.16 }]);

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
// ---- night-before helpers (nb_)
// an evening room: warm wall, skirting board, floorboards, a window with the evening sky
function nb_room(ctx, u, win = [120, 160]) {
  sfill(ctx, '#EFE6D6');
  ctx.fillStyle = '#E4D8C2'; for (let x = 0; x < G.w; x += 120) ctx.fillRect(x, 0, 60, G.gy);
  ctx.fillStyle = '#C79A6B'; ctx.fillRect(0, G.gy, G.w, G.h - G.gy);
  ctx.strokeStyle = '#B0855A'; ctx.lineWidth = 3; for (let y = G.gy + 40; y < G.h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(G.w, y); ctx.stroke(); }
  box(ctx, -10, G.gy - 30, G.w + 20, 30, 0, C.white, 4);
  ink(ctx); ctx.beginPath(); ctx.moveTo(0, G.gy); ctx.lineTo(G.w, G.gy); ctx.stroke();
  if (win) nb_window(ctx, u, win[0], win[1]);
}
function nb_window(ctx, u, x, y, w = 240, h = 220) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2B3F6B'); g.addColorStop(1, '#E59A6B');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  circ(ctx, x + w * 0.7, y + h * 0.3, 26, '#FFF3C4', 0);
  for (let k = 0; k < 5; k++) puff(ctx, x + hash01(k, 3) * w, y + hash01(k, 5) * h * 0.5, 2.5, C.white, 0.9);
  ctx.restore();
  box(ctx, x, y, w, h, 0, 'rgba(0,0,0,0)', LW); limb(ctx, [[x + w / 2, y], [x + w / 2, y + h]], 2, C.white); limb(ctx, [[x, y + h / 2], [x + w, y + h / 2]], 2, C.white);
}
function nb_table(ctx, x0, x1, top) {
  box(ctx, x0, top, x1 - x0, 30, 0, '#9C6B43'); box(ctx, x0 + 20, top + 30, 22, G.gy - top - 30, 0, '#9C6B43'); box(ctx, x1 - 42, top + 30, 22, G.gy - top - 30, 0, '#9C6B43');
}
function nb_paper(ctx, x, y, w, h, rot, fn) {
  withT(ctx, x, y, 1, rot, () => { ctx.fillStyle = 'rgba(19,41,60,0.18)'; ctx.fillRect(-w / 2 + 8, -h / 2 + 10, w, h); box(ctx, -w / 2, -h / 2, w, h, 0, C.white, 5); if (fn) fn(); });
}
function nb_bigPhone(ctx, x, y, s, fn) {
  withT(ctx, x, y, s, 0, () => { box(ctx, -110, -200, 220, 400, 22, '#2B3237'); ctx.fillStyle = C.white; ctx.fillRect(-92, -170, 184, 330); if (fn) fn(); });
}
function nb_battery(ctx, x, y, w, h, level, col = '#2E9E5B') {
  box(ctx, x, y, w, h, 0, C.white, 5); box(ctx, x + w, y + h * 0.3, 10, h * 0.4, 0, C.navy, 0);
  ctx.fillStyle = col; ctx.fillRect(x + 7, y + 7, Math.max(0, (w - 14) * level), h - 14);
}
function nb_tee(ctx, x, y, s, col) {
  withT(ctx, x, y, s, 0, () => { ctx.beginPath(); ctx.moveTo(-50, -40); ctx.lineTo(-20, -50); ctx.lineTo(20, -50); ctx.lineTo(50, -40); ctx.lineTo(62, -10); ctx.lineTo(38, -4); ctx.lineTo(38, 44); ctx.lineTo(-38, 44); ctx.lineTo(-38, -4); ctx.lineTo(-62, -10); ctx.closePath(); fs(ctx, col, 5); });
}
function nb_fold(ctx, x, y, w, col) { box(ctx, x - w / 2, y - 20, w, 40, 6, col, 5); }
function nb_coolbox(ctx, x, y, s) { withT(ctx, x, y, s, 0, () => { box(ctx, -90, -90, 180, 90, 8, C.blue); box(ctx, -96, -110, 192, 28, 6, C.white, 5); box(ctx, -30, -60, 60, 14, 0, C.white, 4); }); }
function nb_door(ctx, x) {
  box(ctx, x, GY - 520, 230, 520, 0, '#3E6E8E'); box(ctx, x + 30, GY - 480, 170, 180, 0, '#4C7FA2', 4); box(ctx, x + 30, GY - 270, 170, 200, 0, '#4C7FA2', 4);
  circ(ctx, x + 196, GY - 260, 12, C.gold, 4);
}

// 1. tickets and passes
function sceneTickets(ctx, u, L) {
  nb_room(ctx, u, [700, 140]);
  const ax = artX(0); ctx.save(); ctx.translate(ax, 0);
  const pk = pop(L, 0.5, SPRING.bouncy);
  if (pk > 0) withT(ctx, 470, 470, pk, 0, () => nb_bigPhone(ctx, 0, 0, 1, () => {
    ctx.fillStyle = C.navy; ctx.fillRect(-92, -170, 184, 50); text(ctx, 'E-TICKET', 0, -134, font(32, 800, DISPLAY), C.white, 'center');
    qr(ctx, -60, -100, 120, 9); text(ctx, 'SHOW DAY', 0, 100, font(28, 700, UI), C.navy, 'center');
    const fl = bump(L, 4.6, 0.35); if (fl > 0) { ctx.globalAlpha = fl; ctx.fillStyle = C.white; ctx.fillRect(-92, -170, 184, 330); ctx.globalAlpha = 1; }
  }));
  label(ctx, 'SAVED', 300, 260, 46, '#2E9E5B', C.white, pop(L, 2.5));
  // screenshot thumbnail pops off the phone
  const sk = pop(L, 4.8, SPRING.bouncy);
  if (sk > 0) withT(ctx, 700, 380, sk * 0.55, 0.12, () => nb_bigPhone(ctx, 0, 0, 1, () => { qr(ctx, -60, -100, 120, 9); }));
  label(ctx, 'SCREENSHOT', 740, 560, 42, C.teal, C.white, pop(L, 4.6));
  // the printed copy folds into the bag
  const pr = prog(L, 6.6, 8.2);
  rucksack(ctx, 760, GY + 40, 1, C.blue);
  if (L > 6.3) {
    const e = E.inOutCubic(pr);
    nb_paper(ctx, lerp(260, 760, e), lerp(300, GY - 80, e) - Math.sin(e * Math.PI) * 120, 150 * (1 - 0.4 * e), 190 * (1 - 0.6 * e), (1 - e) * -0.3 + e * 0.2, () => { if (e < 0.7) qr(ctx, -40, -50, 80, 9); });
  }
  label(ctx, 'PRINTED COPY', 760, 720, 42, C.navy, C.white, pop(L, 8.3));
  person(ctx, 'A', { x: 170, y: GY + 70, scale: 0.9, look: 0.6, aR: [1.3, 0.6], blink: blinkAt(L, 3), holdR: (c) => phoneH(c, 0, -20, 0.55) });
  ctx.restore();
}
// 2. travel checks
function sceneTravel(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(1); ctx.save(); ctx.translate(ax, 0);
  // map pinned to the wall
  const mk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 400, 420, mk, -0.02, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.18)'; ctx.fillRect(-300 + 10, -230 + 12, 600, 460);
    box(ctx, -300, -230, 600, 460, 0, '#CFE8B8');
    ctx.fillStyle = '#9FD3EE'; ctx.fillRect(-297, 150, 594, 77);
    limb(ctx, [[-240, 170], [-120, 60], [20, 40], [150, -60], [210, -150]], 10, C.gold);
    limb(ctx, [[-260, -200], [-60, -20], [150, -60]], 6, C.white);
    text(ctx, 'AIRFIELD', 120, -170, font(34, 800, DISPLAY), C.navy);
    box(ctx, 120, -160, 120, 70, 0, '#B6C4CE', 4);
    box(ctx, 60, -40, 54, 54, 0, C.blue, 4); text(ctx, 'P', 87, 0, font(40, 800, DISPLAY), C.white, 'center');
  });
  label(ctx, 'TRAVEL PAGE', 420, 720, 44, C.navy, C.white, pop(L, 2.5));
  // pin on the car park gate, not the airfield
  const pk = prog(L, 4.3, 4.6);
  if (pk > 0) { const py = lerp(150, 378, E.outBounce(pk)); withT(ctx, 487, py, 1, 0, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-20, -40); ctx.arc(0, -50, 24, Math.PI * 0.8, Math.PI * 2.2); ctx.closePath(); fs(ctx, C.red); circ(ctx, 0, -50, 9, C.white, 0); }); }
  label(ctx, 'CAR PARK GATE', 590, 815, 42, C.red, C.white, pop(L, 4.8));
  // fuel pump
  const fk = pop(L, 6.5, SPRING.bouncy);
  if (fk > 0) withT(ctx, 840, GY - 140, fk, 0, () => {
    box(ctx, -60, -150, 120, 290, 0, C.red); box(ctx, -40, -120, 80, 60, 0, '#BFE6F2', 4);
    text(ctx, 'FUEL', 0, 10, font(36, 800, DISPLAY), C.white, 'center');
    limb(ctx, [[60, -60], [90, -40], [90, 60]], 5, C.navy);
  });
  person(ctx, 'A', { x: 120, y: GY + 70, scale: 0.85, look: 0.6, aR: [2.2, 0.2], blink: blinkAt(L, 5), mouth: 0.3 * bump(L, 4.7, 1.2) });
  ctx.restore();
}
// 3. weather and layers
function sceneWeather(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(2); ctx.save(); ctx.translate(ax, 0);
  // TV with the forecast
  const tk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 300, 340, tk, 0, () => {
    box(ctx, -240, -150, 480, 300, 0, '#1C2A36'); ctx.fillStyle = '#7CC6E6'; ctx.fillRect(-222, -132, 444, 264);
    sun(ctx, -80, -20, 46, u, false); cloud(ctx, 30, 10, 0.9);
    box(ctx, 90, 70, 120, 46, 0, C.gold, 4); text(ctx, 'YELLOW', 150, 104, font(30, 800, DISPLAY), C.navy, 'center');
    box(ctx, -20, 150, 40, 40, 0, '#2B3237', 0); box(ctx, -100, 186, 200, 16, 0, '#2B3237', 0);
  });
  label(ctx, 'FORECAST', 300, 540, 44, C.navy, C.white, pop(L, 2.5));
  // sofa with three piles: T shirt, fleece, waterproof each
  box(ctx, 80, GY - 230, 780, 90, 20, '#6B8FB0'); box(ctx, 60, GY - 150, 820, 120, 20, '#7FA3C3'); box(ctx, 60, GY - 30, 40, 30, 0, C.navy, 4); box(ctx, 840, GY - 30, 40, 30, 0, C.navy, 4);
  const piles = [[220, [C.teal, C.navy, C.red]], [470, [C.red, C.grey2, C.blue]], [720, [C.gold, C.teal, C.navy]]];
  piles.forEach(([px, cols], k) => {
    const d = prog(L, 4.3 + k * 0.3, 4.9 + k * 0.3); if (d <= 0) return;
    const yy = lerp(GY - 500, 0, E.outBounce(d));
    nb_fold(ctx, px, GY - 166 + yy, 170, cols[2]); nb_fold(ctx, px, GY - 206 + yy, 150, cols[1]); nb_tee(ctx, px, GY - 262 + yy, 0.8, cols[0]);
  });
  label(ctx, 'LAYERS', 640, 560, 44, C.teal, C.white, pop(L, 4.7));
  const ck = pop(L, 6.5, SPRING.bouncy);
  if (ck > 0) withT(ctx, 760, 300, ck * 1.3, 0.15, () => itemCream(ctx));
  label(ctx, 'EVEN IF CLOUDY', 740, 440, 40, '#F38B2A', C.white, pop(L, 6.7));
  ctx.restore();
}
// 4. charge everything
function sceneCharge(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(3); ctx.save(); ctx.translate(ax, 0);
  nb_table(ctx, 60, 920, GY - 300);
  // socket strip on the wall
  box(ctx, 380, GY - 120, 260, 50, 0, C.white); for (let k = 0; k < 4; k++) box(ctx, 400 + k * 60, GY - 110, 36, 30, 0, C.off, 3);
  const items = [
    [2.5, 140, (c, lv) => { phoneH(c, 0, -40, 0.7); nb_battery(c, -40, -150, 80, 34, lv); }],
    [2.5, 310, (c, lv) => { box(c, -60, -70, 120, 70, 10, '#2B3237'); nb_battery(c, -40, -150, 80, 34, lv); }],
    [4.5, 480, (c, lv) => { box(c, -36, -90, 72, 90, 6, '#2B3237'); box(c, -24, -110, 48, 22, 0, C.grey2, 4); nb_battery(c, -40, -170, 80, 34, lv); }],
    [4.5, 640, (c, lv) => { box(c, -36, -90, 72, 90, 6, '#2B3237'); box(c, -24, -110, 48, 22, 0, C.grey2, 4); nb_battery(c, -40, -170, 80, 34, lv); }],
  ];
  items.forEach(([b, x, fn], k) => {
    const q = pop(L, b + (k % 2) * 0.3, SPRING.bouncy); if (q <= 0) return;
    const lv = clamp(prog(L, b + 0.5, b + 6));
    limb(ctx, [[x, GY - 310], [x + 20, GY - 200], [420 + k * 60, GY - 110]], 3, C.navy);
    withT(ctx, x, GY - 300, q * 1.3, 0, () => fn(ctx, lv));
  });
  label(ctx, 'STRAIGHT AFTER TEA', 470, 330, 46, C.navy, C.white, pop(L, 1));
  // cables go into the bag
  rucksack(ctx, 820, GY - 300, 0.9, C.red);
  const cp = prog(L, 6.6, 7.8);
  if (cp > 0 && cp < 1) { const e = E.inOutCubic(cp); withT(ctx, lerp(560, 820, e), lerp(GY - 520, GY - 380, e) - Math.sin(e * Math.PI) * 120, 1, e * 3, () => { ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.arc(0, 0, 18, 0, TAU); ink(ctx, 8); ctx.stroke(); }); }
  label(ctx, 'CABLES IN THE BAG', 700, 430, 40, C.teal, C.white, pop(L, 7.6));
  ctx.restore();
}
// 5. pack the bag
function scenePack(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(4); ctx.save(); ctx.translate(ax, 0);
  // laid out on the floor
  withT(ctx, 140, GY + 60, 1.8, 0, () => itemChair(ctx));
  box(ctx, 250, GY + 30, 200, 60, 0, C.red, 5); for (let k = 0; k < 4; k++) { ctx.fillStyle = C.white; ctx.fillRect(262 + k * 48, GY + 36, 22, 48); }
  nb_coolbox(ctx, 850, GY + 110, 1.3);
  // the bag in the middle, things fly in on top
  rucksack(ctx, 600, GY + 110, 1.6, C.blue);
  const fly = [[2.5, 'camera', 330, 620, GY - 160], [4.5, 'cash', 420, 560, GY - 150], [6.5, 'meds', 760, 650, GY - 140]];
  fly.forEach(([b, it, x0, x1, y1], k) => {
    const p = prog(L, b - 0.2, b + 0.8); if (p <= 0) return;
    const e = E.inOutCubic(p);
    const x = lerp(x0, x1, e), y = lerp(560, y1, e) - Math.sin(e * Math.PI) * 140;
    if (it === 'cash') withT(ctx, x, y, 1, 0, () => itemCash(ctx)); else icon(ctx, it, x, y, 1.3);
  });
  label(ctx, 'ON TOP FOR THE SEARCH', 560, 260, 42, C.navy, C.white, pop(L, 2.7));
  label(ctx, 'CASH AND A CARD', 560, 360, 42, '#2E9E5B', C.white, pop(L, 4.7));
  label(ctx, 'MEDS AND PLASTERS', 560, 460, 42, C.red, C.white, pop(L, 6.7));
  ctx.restore();
}
// 6. food and water
function sceneFood(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(5); ctx.save(); ctx.translate(ax, 0);
  // fridge freezer
  const fx = 120, fw = 300;
  box(ctx, fx, GY - 700, fw, 700, 0, C.white);
  limb(ctx, [[fx, GY - 480], [fx + fw, GY - 480]], 1, C.navy);
  ctx.fillStyle = '#E3F3FA'; ctx.fillRect(fx + 20, GY - 680, fw - 40, 180); ctx.fillRect(fx + 20, GY - 460, fw - 40, 440);
  limb(ctx, [[fx + 20, GY - 240], [fx + fw - 20, GY - 240]], 1, C.grey);
  // bottles on the fridge shelf
  for (let k = 0; k < 3; k++) { const q = pop(L, 2.5 + k * 0.25); if (q > 0) withT(ctx, fx + 70 + k * 80, GY - 320, q * 0.8, 0, () => itemWater(ctx)); }
  // ice packs in the freezer
  for (let k = 0; k < 3; k++) { const q = pop(L, 6.5 + k * 0.25); if (q > 0) withT(ctx, fx + 70 + k * 80, GY - 600, q, 0, () => box(ctx, -32, -40, 64, 80, 6, '#7FC4E8', 4)); }
  // door swings open
  const op = E.outBack(prog(L, 0.4, 1.2)) * (1 - E.inCubic(prog(L, 10.5, 11.4)));
  const dw = fw * (1 - op * 0.85);
  box(ctx, fx + fw - dw, GY - 700, dw, 700, 0, C.off); if (dw > 40) box(ctx, fx + fw - dw + 16, GY - 560, 14, 140, 0, C.grey2, 3);
  // sandwiches and snacks on the side
  nb_table(ctx, 500, 920, GY - 260);
  for (let k = 0; k < 3; k++) { const q = pop(L, 4.5 + k * 0.25); if (q > 0) icon(ctx, k === 2 ? 'box' : 'sandwich', 580 + k * 130, GY - 310 - (k % 2) * 10, q * 1.3); }
  nb_coolbox(ctx, 760, GY + 90, 1.1);
  const nk = pop(L, 7.2, SPRING.wobbly);
  if (nk > 0) nb_paper(ctx, 760, GY - 40, 200 * nk, 70 * nk, -0.08, () => { if (nk > 0.6) text(ctx, 'ICE PACKS!', 0, 12, font(36, 800, DISPLAY), C.red, 'center'); });
  label(ctx, 'IN THE FRIDGE', 690, 330, 44, C.navy, C.white, pop(L, 2.7));
  ctx.restore();
}
// 7. kids' kit
function sceneKids(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(6); ctx.save(); ctx.translate(ax, 0);
  const on = L > 2.6;
  const ek = pop(L, 2.2, SPRING.bouncy);
  if (!on && ek > 0) withT(ctx, 400, 360 - ek * 60, ek, 0, () => itemEar(ctx));
  person(ctx, 'K', { x: 400, y: GY + 90, scale: 1.05, earDef: on, look: 0.2, aL: on ? [-2.4, -0.6] : [-0.2, -0.2], aR: on ? [2.4, 0.6] : [0.2, 0.2], mouth: on ? 0.6 : 0.2, blink: blinkAt(L, 8), hop: on ? Math.max(0, Math.sin((L - 2.6) * Math.PI)) * 20 * (L < 5 ? 1 : 0) : 0 });
  person(ctx, 'B', { x: 160, y: GY + 70, scale: 0.92, look: 0.6, aR: [1.2, 0.5], blink: blinkAt(L, 9), mouth: 0.3 * bump(L, 3, 1) });
  label(ctx, 'ONE PAIR EACH', 400, 270, 44, C.red, C.white, pop(L, 2.8));
  // spare clothes rolled in a carrier bag
  const ck = pop(L, 4.5, SPRING.bouncy);
  if (ck > 0) withT(ctx, 780, GY - 40, ck, 0, () => { ctx.beginPath(); ctx.moveTo(-80, -100); ctx.lineTo(80, -100); ctx.lineTo(70, 60); ctx.lineTo(-70, 60); ctx.closePath(); fs(ctx, C.white); limb(ctx, [[-50, -100], [-30, -150], [30, -150], [50, -100]], 4, C.white); nb_fold(ctx, -20, -40, 90, C.teal); nb_fold(ctx, 20, 0, 90, C.gold); });
  label(ctx, 'SPARE CLOTHES', 780, GY - 230, 40, C.teal, C.white, pop(L, 4.7));
  // phone number wristband
  const wk = pop(L, 6.5, SPRING.bouncy);
  if (wk > 0) withT(ctx, 640, 400, wk, -0.06, () => { box(ctx, -190, -40, 380, 80, 0, C.gold); text(ctx, 'MUM: 07700 900123', 0, 14, font(36, 800, DISPLAY), C.navy, 'center'); circ(ctx, -160, 0, 10, C.white, 3); circ(ctx, 160, 0, 10, C.white, 3); });
  label(ctx, 'YOUR NUMBER ON EACH CHILD', 600, 520, 38, C.navy, C.white, pop(L, 6.9));
  ctx.restore();
}
// 8. camera kit
function sceneCamera(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(7); ctx.save(); ctx.translate(ax, 0);
  nb_table(ctx, 60, 920, GY - 260);
  const ck = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 330, GY - 440, ck * 3.2, 0, () => ICON.camera(ctx));
  // a cloth wipes the lens
  if (L > 2.3 && L < 4.3) { const wx = Math.sin((L - 2.3) * Math.PI * 3) * 40; withT(ctx, 340 + wx, GY - 410, 1, 0.2, () => box(ctx, -40, -30, 80, 60, 6, C.gold, 4)); }
  const sh = bump(L, 4.2, 0.4); if (sh > 0) { ctx.globalAlpha = sh; puff(ctx, 370, GY - 450, 30, C.white); ctx.globalAlpha = 1; }
  label(ctx, 'CLEAN LENS', 330, 290, 44, C.navy, C.white, pop(L, 2.5));
  // settings card
  const sk = pop(L, 4.5, SPRING.bouncy);
  if (sk > 0) withT(ctx, 720, 330, sk, 0.03, () => {
    box(ctx, -170, -150, 340, 300, 0, '#1C2A36');
    [['SHUTTER', '1/1000'], ['FOCUS', 'AF-C'], ['BURST', 'HIGH']].forEach(([a, b], k) => {
      const rk = E.outQuint(prog(L, 4.6 + k * 0.3, 5.2 + k * 0.3));
      ctx.globalAlpha = rk; text(ctx, a, -140, -70 + k * 80, font(34, 800, DISPLAY), C.white); text(ctx, b, 140, -70 + k * 80, font(34, 800, DISPLAY), C.gold, 'right'); ctx.globalAlpha = 1;
    });
  });
  const rk = pop(L, 6.5, SPRING.bouncy);
  if (rk > 0) withT(ctx, 720, GY - 340, rk * 1.4, 0, () => { ctx.beginPath(); ctx.moveTo(-110, 30); ctx.quadraticCurveTo(-90, -70, 0, -70); ctx.quadraticCurveTo(90, -70, 110, 30); ctx.closePath(); fs(ctx, '#9FD3EE'); limb(ctx, [[-60, 0], [-60, -40]], 1, C.white); });
  label(ctx, 'RAIN COVER', 720, 610, 42, C.teal, C.white, pop(L, 6.8));
  ctx.restore();
}
// 9. before bed
function sceneBed(ctx, u, L) {
  nb_room(ctx, u, [80, 120]);
  const ax = artX(8); ctx.save(); ctx.translate(ax, 0);
  // the front door with the bag and keys by it
  nb_door(ctx, 680);
  // two alarms: phone and a clock
  nb_table(ctx, 80, 440, GY - 260);
  const ring = (L > 2.4 && L < 3.8) ? Math.sin(L * 60) * 0.12 : 0;
  const a1 = pop(L, 2.4, SPRING.bouncy), a2 = pop(L, 2.8, SPRING.bouncy);
  if (a1 > 0) withT(ctx, 180, GY - 320, a1, ring, () => { wallClock(ctx, 0, 0, 52, 30); circ(ctx, -40, -46, 16, C.red, 4); circ(ctx, 40, -46, 16, C.red, 4); });
  if (a2 > 0) withT(ctx, 340, GY - 330, a2, -ring, () => phoneH(ctx, 0, 0, 0.6, C.gold));
  label(ctx, 'TWO ALARMS', 260, 440, 44, C.red, C.white, pop(L, 2.6));
  // the leave time on a note
  const nk = pop(L, 4.5, SPRING.wobbly);
  if (nk > 0) nb_paper(ctx, 440, 330, 300 * nk, 150 * nk, 0.05, () => { if (nk > 0.6) { text(ctx, 'OUT OF THE DOOR', 0, -14, font(32, 800, DISPLAY), C.navy, 'center'); text(ctx, '06:30', 0, 42, font(52, 800, DISPLAY), C.red, 'center'); } });
  // banned items come out of the bag
  rucksack(ctx, 600, GY + 70, 1.1, C.blue);
  [['knife', 6.6, -1], ['drone', 6.9, 1]].forEach(([it, b, dir]) => {
    const p = prog(L, b, b + 0.9); if (p <= 0) return;
    const x = 600 + dir * p * 160, y = GY - 120 - Math.sin(p * Math.PI) * 220 + p * 40;
    icon(ctx, it, x, y, 0.9, p * dir);
    if (p >= 1) tickSq(ctx, x, y - 60, pop(L, b + 0.9, SPRING.wobbly) * 0.8, false);
  });
  icon(ctx, 'keys', 800, GY + 40, 1.2);
  person(ctx, 'A', { x: 470, y: GY + 80, scale: 0.85, look: 0.4, aL: [-2.6 * bump(L, 9.5, 1.5), -0.3], blink: blinkAt(L, 12) || (L > 9 && L < 10.6), mouth: 0.8 * bump(L, 9.8, 0.8) });
  label(ctx, 'BAG BY THE DOOR', 790, 330, 40, C.teal, C.white, pop(L, 8.6));
  ctx.restore();
}
const SCENES = [sceneTickets, sceneTravel, sceneWeather, sceneCharge, scenePack, sceneFood, sceneKids, sceneCamera, sceneBed];

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
  if (uk > 0) withT(ctx, G.w / 2, PORTRAIT ? 1220 : 790, uk, 0, () => { let us = 50; ctx.font = font(us, 700, UI); while (ctx.measureText(URL).width + 90 > G.w - 80 && us > 28) { us -= 2; ctx.font = font(us, 700, UI); } const uw = ctx.measureText(URL).width + 90; box(ctx, -uw / 2, -52, uw, 84, 0, C.teal); text(ctx, URL, 0, 10 - (50 - us) * 0.35, font(us, 700, UI), C.white, 'center'); });
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
