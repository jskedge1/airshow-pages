// How to plan your airshow season: pure function of time. window.seek(t) paints frame t.
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
const GY = 905;             // ground line

// ---------------------------------------------------------------- timeline (beats)
const INTRO = 8, STEP = 12, NSTEP = 12, OUTRO = INTRO + STEP * NSTEP; // 152
const st = (i) => INTRO + STEP * i;  // start beat of step i (0-based)

// ---------------------------------------------------------------- copy
const STEPS = [
  { title: 'Pick your shows', q: 'On base or on the seafront?', b: ['Base: hangars and static aircraft', 'Seafront: watch from the beach', 'Mix both for a full season'] },
  { title: 'Set your budget', q: 'Free, or buying tickets?', b: ['Seafront shows are usually free', 'Base shows: book early-bird tickets', 'Add parking, food and a programme'] },
  { title: 'Book early', q: 'Lock in your dates', b: ['Check for clashes between shows', 'Book the time off work', 'Early-bird deals sell out fast'] },
  { title: 'Getting there', q: 'Car, train or shuttle bus?', b: ['Pre-book your parking', 'Check trains and shuttle buses', 'Allow extra time for the queues'] },
  { title: 'Where to stay', q: 'Staying for the weekend?', b: ['Camp on site or nearby', 'Book rooms months ahead', 'Two-day show? Plan both days'] },
  { title: 'Food plan', q: 'Picnic or food stalls?', b: ['Pack a picnic to save money', 'Stalls get long queues at lunch', 'Bring plenty of water'] },
  { title: 'Camera or just watching?', q: 'Decide what kind of day it is', b: ['Charge batteries, clear your cards', "Check the show's lens rules", 'Watching? Binoculars and a chair'] },
  { title: 'Pick your spot', q: 'Want the front row?', b: ['Arrive early, when the gates open', 'Keep the sun behind you for photos', 'Near toilets and food is a bonus'] },
  { title: 'Check the weather', q: 'Sun, rain or both?', b: ['Sun cream, hat and sunglasses', 'Pack a waterproof, just in case', 'Airfields get windy: bring layers'] },
  { title: 'Pack the essentials', q: 'Your airshow bag checklist', b: ['Ear defenders for little ones', 'Power bank and some cash', 'Sun cream, water and snacks', 'Show map or app downloaded'] },
  { title: 'Know the flying times', q: "Don't miss the big displays", b: ['Get the programme or the app', 'Star your must-see displays', 'Times can change: keep checking'] },
  { title: 'Plan your exit', q: 'Beat the traffic home', b: ['Leave early, or wait out the rush', 'Know your route home', 'Agree a meet-up point'] },
];

// ---------------------------------------------------------------- hits (picture accents -> sfx)
const HITS = [
  [0, 'jet on frame 0', 'whoosh', { len: 1.2, from: 300, to: 1400, gain: 0.22 }],
  [0.05, 'PLAN YOUR', 'pop', { pitch: 'F5', gain: 0.25 }],
  [1, 'AIRSHOW', 'pop', { pitch: 'A5', gain: 0.25 }],
  [2, 'SEASON', 'pop', { pitch: 'C6', gain: 0.25 }],
  [3.5, 'season tag', 'pop', { pitch: 'F5', to: 'C6', gain: 0.2 }],
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
HITS.push([st(1) + 1.5, 'coin 1', 'coins', { n: 3, gain: 0.16 }], [st(1) + 3, 'coin 2', 'coins', { n: 3, gain: 0.16 }], [st(1) + 4.5, 'coin 3', 'coins', { n: 3, gain: 0.16 }]);
HITS.push([st(1) + 7, 'ticket flip', 'boing', { pitch: 'C5', to: 'G5', gain: 0.18 }]);
HITS.push([st(2) + 1, 'page flip', 'whoosh', { len: 0.35, from: 1500, to: 4000, gain: 0.12 }]);
HITS.push([st(4) + 1.5, 'tent pops', 'boing', { pitch: 'G4', to: 'D5', gain: 0.2 }]);
for (const d of [2, 2.35, 2.7, 6.5, 6.85]) HITS.push([st(6) + d, 'shutter', 'click', { gain: 0.14 }]);
HITS.push([st(7) + 3, 'chair down', 'thud', { gain: 0.25 }]);
HITS.push([st(8) + 6, 'umbrella', 'boing', { pitch: 'E5', to: 'A5', gain: 0.18 }]);
for (let k = 0; k < 10; k++) HITS.push([st(9) + 1 + k * 0.55, `item ${k + 1}`, 'pop', { pitch: ['F5', 'G5', 'A5', 'C6', 'D6'][k % 5], gain: 0.12 }]);
HITS.push([st(10) + 3, 'clock settles', 'bell', { pitch: 'C6', gain: 0.14 }]);
HITS.push([st(11) + 7, 'flag planted', 'thud', { gain: 0.25 }]);
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
  fill(ctx, top);
  // slow drifting background clouds (seeded)
  for (let k = 0; k < 5; k++) {
    const sp = 6 + hash01(k, 3) * 8, x = ((hash01(k, 5) * (W + 600) + u * sp) % (W + 600)) - 300;
    cloud(ctx, x, 120 + hash01(k, 7) * 300, 0.6 + hash01(k, 11) * 0.5, tint || C.white);
  }
}
function ground(ctx, col = C.grass, col2 = C.grass2) {
  ctx.fillStyle = col; ctx.fillRect(0, GY, W, H - GY);
  ctx.fillStyle = col2; ctx.fillRect(0, GY, W, 10);
  ink(ctx); ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(W, GY); ctx.stroke();
}
function hills(ctx, col = '#B6DAA6') {
  ctx.beginPath(); ctx.moveTo(0, GY);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, GY - 90 - Math.sin(x / 260) * 40 - Math.sin(x / 97 + 1) * 14);
  ctx.lineTo(W, GY); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
function signText(ctx, str, x, y, size, color = C.white, weight = 800) { text(ctx, str, x, y, font(size, weight, DISPLAY), color, 'center'); }

// ================================================================ text card
function card(ctx, u, s, i) {
  const S = STEPS[i], side = i % 2 === 0 ? 'R' : 'L';
  const cw = 880, pad = 50, x0 = side === 'R' ? W - 90 - cw : 90;
  // measure
  const fTitle = font(Math.min(96, M.fitSize(ctx, S.title, 800, DISPLAY, cw - pad * 2 - 124, 96)), 800, DISPLAY);
  const fQ = font(46, 700, UI), fB = font(44, 600, UI);
  const bl = S.b.map((b) => wrap(ctx, b, fB, cw - pad * 2 - 76));
  const hB = bl.reduce((a, l) => a + l.length * 54 + 28, 0);
  const ch = pad + 96 + 62 + 30 + hB + pad - 28;
  const y0 = Math.round((GY - 40 - ch) / 2 + 10);
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
const artX = (i) => (i % 2 === 0 ? 0 : W - 980);

// ================================================================ scenes
// Each scene paints the full frame for local beat L (0..12+) of its step.

function sceneIntro(ctx, u) {
  sky(ctx, u);
  hills(ctx); ground(ctx);
  // Red Arrows trio, already mid-pass on frame 0, trailing red / white / blue smoke
  const jp = prog(u, -2.2, 7.5);
  const P = (q, k) => [lerp(-300, W + 600, q) - k * 70, 150 + k * 46 - Math.sin(q * Math.PI) * 60];
  const SM = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  [1, 0, 2].forEach((k) => {
    const pts = []; for (let n = 1; n < 110; n++) { const q = jp - n * 0.0035; if (q < 0) break; const p = P(q, k); pts.push([p[0] - 140, p[1] + 14]); }
    if (k === 0) smoke(ctx, pts, '#B9C7D3', 13, 0.3, 0.6);
    smoke(ctx, pts, SM[k], 10, 0.3);
  });
  [1, 0, 2].forEach((k) => { const p = P(jp, k), p2 = P(jp + 0.01, k); jet(ctx, p[0], p[1], 0.95, Math.atan2(p2[1] - p[1], p2[0] - p[0])); });
  // season tag (square corners)
  const tg = pop(u, 3.5, SPRING.bouncy);
  if (tg > 0) withT(ctx, 1540, 440, tg, (1 - tg) * 0.3, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-330 + 10, -50 + 10, 660, 96);
    box(ctx, -330, -50, 660, 96, 0, C.red);
    text(ctx, 'THE 2027 SEASON IS COMING!', 0, 18, font(56, 800, DISPLAY), C.white, 'center');
  });
  // title, left side
  const x0 = 120, words = [['PLAN YOUR', 0, C.navy, 140, 440], ['AIRSHOW', 1, C.navy, 230, 650], ['SEASON', 2, C.teal, 230, 860]];
  for (const [w, ub, col, size, yb] of words) {
    const f = font(size, 800, DISPLAY), L = layout(ctx, w, f, 2);
    L.glyphs.forEach((g, j) => {
      const k = pop(u, ub - 0.45 + j * 0.04, SPRING.bouncy);
      if (k <= 0) return;
      ctx.save(); ctx.beginPath(); ctx.rect(0, yb - size, W, size * 1.08); ctx.clip();
      M.glyph(ctx, g.ch, x0 + g.cx, yb + (1 - k) * size * 0.9, f, col, 1, 1);
      ctx.restore();
    });
  }
  // underline swoosh in logo colours
  const sk = E.outCubic(prog(u, 2.8, 3.8));
  [[C.red, 0], [C.navy, 16], [C.teal, 32]].forEach(([col, o]) => {
    ctx.beginPath(); ctx.moveTo(x0, 902 + o * 0.5);
    ctx.quadraticCurveTo(x0 + 400, 922 + o, x0 + 820 * sk, 868 + o * 0.6);
    ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineCap = 'round'; if (sk > 0) ctx.stroke();
  });
  const tk = E.outQuint(prog(u, 4.5, 5.3));
  ctx.save(); ctx.beginPath(); ctx.rect(x0, 940, 1000 * tk, 120); ctx.clip();
  text(ctx, '12 steps to a brilliant day out', x0 + 4, 1020, font(58, 700, UI), C.navy);
  ctx.restore();
  // characters looking up at the jet, pointing
  const look = clamp((lerp(-300, W + 600, jp) - 1400) / 600, -1, 1);
  const pt = pop(u, 0.5, SPRING.bouncy);
  person(ctx, 'B', { x: 1290, y: GY + 40, look, lookY: -0.8, aR: [0.3 + 2.2 * pt, 0.1], aL: [-0.2, -0.2], blink: blinkAt(u, 2), mouth: 0.6 * bump(u, 1.5, 1.2) });
  person(ctx, 'A', { x: 1560, y: GY + 50, look, lookY: -0.8, aL: [-0.3 - 2.4 * pop(u, 1.2), -0.2], aR: [0.2, 0.3], blink: blinkAt(u, 5), mouth: 0.5 });
  const hop = Math.max(0, Math.sin(u * Math.PI)) * 40;
  person(ctx, 'K', { x: 1760, y: GY + 60, hop, look: -0.4, lookY: -0.8, aL: [-2.6, 0], aR: [2.6, 0], squash: -0.04 * Math.sin(u * TAU), mouth: 0.7 });
}

// 1. base or seafront
function scenePick(ctx, u, L) {
  sky(ctx, u);
  // seafront on the right half of the art area
  ctx.fillStyle = C.sea; ctx.fillRect(470, GY - 120, 520, 120);
  for (let k = 0; k < 8; k++) { const wx = 470 + ((k * 80 + L * 30) % 560); ctx.beginPath(); ctx.arc(wx, GY - 80 + (k % 2) * 40, 18, Math.PI, TAU); ink(ctx, 4); ctx.strokeStyle = C.white; ctx.stroke(); }
  ctx.fillStyle = C.sand; ctx.fillRect(470, GY - 20, 520, 20);
  // pier
  box(ctx, 600, GY - 160, 380, 20, 4, '#B07A4E', 5);
  for (let k = 0; k < 6; k++) box(ctx, 620 + k * 66, GY - 140, 12, 120, 3, '#8C5D3A', 4);
  // beach huts
  ['#F28C9B', C.gold, '#7FC4E8'].forEach((col, k) => {
    const hx = 600 + k * 110, hy = GY - 10;
    ctx.beginPath(); ctx.moveTo(hx, hy - 110); ctx.lineTo(hx + 40, hy - 150); ctx.lineTo(hx + 80, hy - 110); ctx.closePath(); fs(ctx, C.white);
    box(ctx, hx + 4, hy - 110, 72, 100, 4, col);
  });
  // base: hangar + tower + fence on the left
  ctx.fillStyle = C.grass; ctx.fillRect(0, GY, W, H - GY);
  ctx.beginPath(); ctx.moveTo(60, GY); ctx.lineTo(60, GY - 170); ctx.quadraticCurveTo(220, GY - 330, 380, GY - 170); ctx.lineTo(380, GY); ctx.closePath(); fs(ctx, C.grey);
  box(ctx, 140, GY - 140, 160, 140, 6, C.grey2);
  for (let k = 1; k < 4; k++) limb(ctx, [[140 + k * 40, GY - 136], [140 + k * 40, GY - 4]], 1, C.navy);
  box(ctx, 410, GY - 300, 54, 300, 6, C.off); box(ctx, 392, GY - 340, 90, 52, 10, '#BFE6F2');
  for (let k = 0; k < 12; k++) limb(ctx, [[40 + k * 36, GY - 50], [40 + k * 36, GY + 4]], 2, C.grey2);
  limb(ctx, [[30, GY - 50], [440, GY - 50]], 2, C.grey2);
  ground(ctx); ctx.fillStyle = C.sand; ctx.fillRect(470, GY + 4, 520, 30);
  // signpost
  box(ctx, 470, GY - 540, 20, 540, 4, '#8C5D3A');
  const sw = wobble(L - 1.2, 1.6, 2.5) * 0.12;
  withT(ctx, 480, GY - 500, 1, sw, () => {
    ctx.beginPath(); ctx.moveTo(-10, -32); ctx.lineTo(-200, -32); ctx.lineTo(-236, 0); ctx.lineTo(-200, 32); ctx.lineTo(-10, 32); ctx.closePath(); fs(ctx, C.blue);
    signText(ctx, 'BASE', -110, 18, 50);
  });
  withT(ctx, 480, GY - 410, 1, -sw, () => {
    ctx.beginPath(); ctx.moveTo(10, -32); ctx.lineTo(240, -32); ctx.lineTo(276, 0); ctx.lineTo(240, 32); ctx.lineTo(10, 32); ctx.closePath(); fs(ctx, C.teal);
    signText(ctx, 'SEAFRONT', 136, 18, 50);
  });
  // parked jet on the base apron
  jet(ctx, 240, GY - 22, 0.95, 0, C.blue);
  // character choosing: looks left, then right
  const look = kf(L, [[1, 0], [2, -1], [4.5, -1], [5.5, 1], [8, 1], [9, 0]]);
  const pl = bump(L, 3.3, 1.6), pr = bump(L, 6.8, 1.6);
  person(ctx, 'A', { x: 620, y: GY + 60, look, aL: [-0.2 - 1.6 * pl, -0.1], aR: [0.2 + 1.6 * pr, 0.1], tilt: look * 0.08, blink: blinkAt(L, 3), mouth: 0.4 * (pl + pr) });
}

// 2. budget
function sceneBudget(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(1);
  // piggy bank
  const pk = pop(L, 0.4) ; const sq = 0.06 * (wobble(L - 1.6, 2.5, 4) + wobble(L - 3.1, 2.5, 4) + wobble(L - 4.6, 2.5, 4));
  withT(ctx, ax + 380, GY - 150, Math.max(0.01, pk), 0, () => {
    ctx.scale(1 + sq, 1 - sq);
    ell(ctx, -90, 120, 22, 40, C.pink); ell(ctx, 90, 120, 22, 40, C.pink);
    ell(ctx, 0, 0, 210, 150, C.pink);
    ell(ctx, 200, 10, 46, 52, C.pink);
    ell(ctx, 212, 10, 10, 14, '#C9657F', 0); ell(ctx, 194, 10, 10, 14, '#C9657F', 0);
    ell(ctx, 120, -40, 8, 11, C.navy, 0);
    ctx.beginPath(); ctx.moveTo(60, -130); ctx.lineTo(110, -190); ctx.lineTo(130, -120); ctx.closePath(); fs(ctx, C.pink);
    box(ctx, -60, -148, 110, 16, 8, '#C9657F', 4);
  });
  // coins drop into the slot
  [1.5, 3, 4.5].forEach((d, k) => {
    const q = prog(L, d - 1, d); if (q <= 0 || q >= 1) return;
    const cy = lerp(-100, GY - 300, E.inQuad(q));
    withT(ctx, ax + 375, cy, 1, q * 6, () => { ctx.scale(Math.cos(q * 9) * 0.8 + 0.2, 1); circ(ctx, 0, 0, 34, C.gold); signText(ctx, '£', 0, 16, 44, C.navy); });
  });
  // FREE bubble
  const fk = pop(L, 5.5, SPRING.wobbly);
  if (fk > 0) withT(ctx, ax + 230, GY - 470, fk, 0, () => {
    ctx.beginPath(); ctx.moveTo(-120, -60); ctx.lineTo(120, -60); ctx.lineTo(120, 50); ctx.lineTo(40, 50); ctx.lineTo(70, 100); ctx.lineTo(-10, 50); ctx.lineTo(-120, 50); ctx.closePath(); fs(ctx, C.white); signText(ctx, 'FREE!', 0, 20, 64, C.tealD);
  });
  // person with ticket
  const tf = pop(L, 7, SPRING.bouncy);
  person(ctx, 'B', { x: ax + 760, y: GY + 60, look: -0.6, aL: [-0.3 - 2.2 * tf, -0.6 * tf], blink: blinkAt(L, 4), mouth: 0.5 * bump(L, 7.5, 1.5),
    holdL: (c) => { if (tf <= 0) return; withT(c, -10, -60 * tf, tf, -0.2 + ring(L - 7) * 0.3, () => {
      box(c, -100, -50, 200, 100, 0, C.gold); limb(c, [[40, -46], [40, 46]], 1, C.navy);
      text(c, 'TICKET', -30, 14, font(38, 800, DISPLAY), C.navy, 'center'); }); } });
}
const ring = M.ring;

// 3. book early: calendar
function sceneBook(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const cx = 110, cy = 210, cw = 560, chh = 620;
  // wall board
  box(ctx, cx, cy, cw, chh, 0, C.white);
  box(ctx, cx, cy, cw, 120, 0, C.red);
  ctx.fillStyle = C.red; ctx.fillRect(cx + 3, cy + 80, cw - 6, 40);
  ink(ctx); ctx.beginPath(); ctx.moveTo(cx, cy + 120); ctx.lineTo(cx + cw, cy + 120); ctx.stroke();
  const fp = prog(L, 0.6, 1.4);
  signText(ctx, fp < 0.5 ? 'MAY' : 'JULY', cx + cw / 2, cy + 90, 80);
  for (const rx of [cx + 120, cx + cw - 120]) { box(ctx, rx - 10, cy - 30, 20, 60, 10, C.grey); }
  // day grid
  const cell = 70, gx = cx + 35, gy = cy + 150;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
    const n = r * 7 + c + 1; if (n > 31) continue;
    const x = gx + c * (cell + 4), y = gy + r * (cell + 18);
    ctx.fillStyle = C.off; ctx.fillRect(x, y, cell, cell + 8);
    text(ctx, String(n), x + 10, y + 34, font(28, 700, UI), C.grey2);
  }
  // page flip (old page lifts away)
  if (fp > 0 && fp < 1) {
    ctx.save(); ctx.translate(cx + cw / 2, cy + 120); ctx.scale(1, Math.cos(fp * Math.PI)); ctx.translate(-(cx + cw / 2), -(cy + 120));
    box(ctx, cx, cy + 120, cw, chh - 120, 12, fp < 0.5 ? C.white : C.off, 4);
    ctx.restore();
  }
  // circled show dates
  [[2, 3, 2], [5, 1, 3.5], [2, 3, 5], [6, 3, 7]].slice(0, 4).forEach(([c, r, d], k) => {
    const q = E.outCubic(prog(L, d, d + 0.8)); if (q <= 0) return;
    const x = gx + c * (cell + 4) + cell / 2, y = gy + r * (cell + 18) + cell / 2 + 4;
    if (k === 2) return;
    ctx.beginPath(); ctx.ellipse(x, y, 46, 44, -0.3, -1.4, -1.4 + TAU * 1.08 * q); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke();
    const jk = pop(L, d + 0.6, SPRING.bouncy); if (jk > 0) jet(ctx, x + 6, y - 2, 0.26 * jk, -0.15, C.red);
  });
  // person with a marker pointing at the dates
  const reach = kf(L, [[1.5, 0], [2.2, 1], [3, 0.7], [3.7, 1], [6.5, 1], [7.2, 1], [9, 0]]);
  person(ctx, 'A', { x: 800, y: GY + 60, look: -0.8, aL: [-0.3 - 1.8 * reach, -0.4 * reach], blink: blinkAt(L, 6), mouth: 0.3 * bump(L, 4, 2),
    holdL: (c, a) => { withT(c, 0, 0, 1, -a + Math.PI, () => { box(c, -8, -10, 16, 70, 5, C.red, 4); }); } });
}

// 4. getting there
function car(ctx, x, y, col) {
  box(ctx, x - 130, y - 70, 260, 60, 20, col);
  ctx.beginPath(); ctx.moveTo(x - 80, y - 68); ctx.lineTo(x - 50, y - 120); ctx.lineTo(x + 50, y - 120); ctx.lineTo(x + 90, y - 68); ctx.closePath(); fs(ctx, col);
  box(ctx, x - 40, y - 110, 40, 36, 6, '#BFE6F2', 4); box(ctx, x + 8, y - 110, 44, 36, 6, '#BFE6F2', 4);
  circ(ctx, x - 75, y - 8, 28, C.navy, 0); circ(ctx, x + 75, y - 8, 28, C.navy, 0); circ(ctx, x - 75, y - 8, 10, C.grey, 0); circ(ctx, x + 75, y - 8, 10, C.grey, 0);
}
function bus(ctx, x, y) {
  box(ctx, x - 230, y - 190, 460, 170, 24, C.teal);
  for (let k = 0; k < 5; k++) box(ctx, x - 200 + k * 80, y - 166, 60, 54, 8, '#BFE6F2', 4);
  box(ctx, x - 230, y - 96, 460, 26, 0, C.white, 0);
  text(ctx, 'AIRSHOW SHUTTLE', x, y - 76, font(26, 800, DISPLAY), C.navy, 'center');
  circ(ctx, x - 140, y - 16, 30, C.navy, 0); circ(ctx, x + 140, y - 16, 30, C.navy, 0); circ(ctx, x - 140, y - 16, 11, C.grey, 0); circ(ctx, x + 140, y - 16, 11, C.grey, 0);
}
function train(ctx, x, y) {
  for (let k = 0; k < 3; k++) {
    const tx = x + k * 250;
    if (k === 0) { ctx.beginPath(); ctx.moveTo(tx - 120, y - 20); ctx.lineTo(tx - 120, y - 110); ctx.quadraticCurveTo(tx - 120, y - 150, tx - 60, y - 150); ctx.lineTo(tx + 115, y - 150); ctx.lineTo(tx + 115, y - 20); ctx.closePath(); fs(ctx, C.blue); }
    else box(ctx, tx - 115, y - 150, 230, 130, 14, C.blue);
    for (let w = 0; w < 3; w++) box(ctx, tx - 85 + w * 64, y - 130, 44, 44, 6, '#BFE6F2', 4);
    ctx.fillStyle = C.gold; ctx.fillRect(tx - 112, y - 66, 224, 10);
    circ(ctx, tx - 60, y - 14, 18, C.navy, 0); circ(ctx, tx + 60, y - 14, 18, C.navy, 0);
  }
}
function sceneTravel(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  // railway on the hill line, road at the bottom
  const ry = GY - 20;
  ctx.fillStyle = '#6E7F8D'; ctx.fillRect(0, ry, W, 8);
  for (let x = 0; x < W; x += 40) { ctx.fillStyle = '#8C5D3A'; ctx.fillRect(x, ry + 6, 22, 10); }
  ctx.fillStyle = '#5B6B78'; ctx.fillRect(0, GY + 40, W, 120);
  for (let x = -((L * 80) % 160); x < W; x += 160) { ctx.fillStyle = C.white; ctx.fillRect(x, GY + 96, 80, 8); }
  // parking sign
  box(ctx, 1840, GY - 200, 14, 240, 4, C.grey2);
  box(ctx, 1790, GY - 300, 110, 110, 0, C.blue); signText(ctx, 'P', 1845, GY - 210, 90);
  // vehicles pass in turn
  const tx = lerp(W + 200, -1100, E.inOutSine(prog(L, 2.5, 8.5)));
  train(ctx, tx, ry);
  const cxp = lerp(W + 300, -400, E.inOutSine(prog(L, 0.5, 5.5)));
  car(ctx, cxp, GY + 150, C.red);
  const bxp = lerp(W + 400, -500, E.inOutSine(prog(L, 5, 11.5)));
  bus(ctx, bxp, GY + 160);
}

// 5. where to stay
function sceneStay(ctx, u, L) {
  fill(ctx, '#C7D5EA');
  for (let k = 0; k < 18; k++) { const sx = hash01(k, 21) * 960, sy = 60 + hash01(k, 22) * 360; const tw = 0.5 + 0.5 * Math.sin(u * 2 + k); puff(ctx, sx, sy, 3 + tw * 2, C.white, 0.9); }
  // moon
  circ(ctx, 820, 150, 60, '#FFF4C9', 5); circ(ctx, 846, 136, 50, '#C7D5EA', 0);
  hills(ctx, '#A9CE98'); ground(ctx);
  // hotel with windows lighting up
  box(ctx, 600, GY - 470, 300, 470, 10, C.blue);
  box(ctx, 600, GY - 520, 300, 60, 0, C.navy, 0); signText(ctx, 'HOTEL', 750, GY - 474, 46, C.gold);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
    const on = prog(L, 2 + (r * 3 + c) * 0.35, 2.2 + (r * 3 + c) * 0.35);
    box(ctx, 630 + c * 92, GY - 430 + r * 84, 62, 56, 6, mixc('#5E7FA8', C.gold, on), 4);
  }
  // tent springs up
  const tk = pop(L, 1.5, SPRING.wobbly);
  withT(ctx, 300, GY + 10, 1, 0, () => {
    ctx.scale(1, Math.max(0.01, tk));
    ctx.beginPath(); ctx.moveTo(-200, 0); ctx.lineTo(0, -280); ctx.lineTo(200, 0); ctx.closePath(); fs(ctx, C.teal);
    ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(0, -200); ctx.lineTo(60, 0); ctx.closePath(); fs(ctx, C.tealD);
  });
  // kid peeks out of the tent
  const kp = pop(L, 5, SPRING.bouncy);
  if (kp > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, GY + 10); ctx.clip();
    person(ctx, 'K', { x: 300, y: GY + 10 + (1 - kp) * 200, look: 0.6, aR: [1.8 + 0.6 * Math.sin(L * 5), 0.4], blink: blinkAt(L, 8), mouth: 0.6 });
    ctx.restore();
  }
  // campfire
  const fx = 470, fyy = GY + 40;
  limb(ctx, [[fx - 40, fyy], [fx + 40, fyy - 12]], 14, '#8C5D3A'); limb(ctx, [[fx - 40, fyy - 12], [fx + 40, fyy]], 14, '#8C5D3A');
  const fl = 1 + 0.12 * Math.sin(u * 9) + 0.08 * Math.sin(u * 13);
  withT(ctx, fx, fyy - 14, 1, 0, () => { ctx.scale(1, fl); ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-30, -50, 0, -80); ctx.quadraticCurveTo(30, -50, 30, 0); ctx.closePath(); fs(ctx, '#F38B2A', 4);
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-14, -26, 0, -44); ctx.quadraticCurveTo(14, -26, 14, 0); ctx.closePath(); fs(ctx, C.gold, 0); });
}

// 6. food plan
function sceneFood(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(5);
  // food van
  box(ctx, ax + 420, GY - 330, 460, 300, 30, C.teal);
  box(ctx, ax + 470, GY - 290, 300, 140, 10, C.navy);
  ctx.beginPath(); ctx.moveTo(ax + 450, GY - 296); ctx.lineTo(ax + 790, GY - 296); ctx.lineTo(ax + 810, GY - 250); ctx.lineTo(ax + 430, GY - 250); ctx.closePath(); fs(ctx, C.red);
  for (let k = 0; k < 6; k++) { ctx.fillStyle = C.white; ctx.fillRect(ax + 445 + k * 60, GY - 294, 28, 42); }
  box(ctx, ax + 520, GY - 400, 200, 70, 0, C.gold); signText(ctx, 'FOOD', ax + 620, GY - 346, 56, C.navy);
  circ(ctx, ax + 520, GY - 30, 36, C.navy, 0); circ(ctx, ax + 800, GY - 30, 36, C.navy, 0);
  // steam
  for (let k = 0; k < 4; k++) { const q = ((L * 0.5 + k * 0.25) % 1); puff(ctx, ax + 600 + Math.sin(q * 8 + k) * 20, GY - 410 - q * 160, 20 + q * 20, C.white, 0.8 * (1 - q)); }
  // queue (simple people) grows
  const qn = [0, 1, 2].map((k) => pop(L, 3.5 + k * 0.7));
  qn.forEach((k, j) => { if (k <= 0) return; const qx = ax + 360 - j * 70, cols = ['#7FC4E8', '#F28C9B', C.gold];
    withT(ctx, qx, GY + 20, 0.55 * k, 0, () => { box(ctx, -40, -170, 80, 150, 30, cols[j]); circ(ctx, 0, -210, 38, [C.skin1, C.skin3, C.skin2][j]); }); });
  // picnic blanket + basket + bouncing sandwich
  ctx.beginPath(); ctx.moveTo(ax + 60, GY + 120); ctx.lineTo(ax + 380, GY + 120); ctx.lineTo(ax + 320, GY + 40); ctx.lineTo(ax + 120, GY + 40); ctx.closePath(); fs(ctx, C.white);
  ctx.save(); ctx.clip(); ctx.fillStyle = C.red; for (let k = 0; k < 8; k++) { ctx.fillRect(ax + 60 + k * 44, GY + 30, 22, 100); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(ax + 60, GY + 120); ctx.lineTo(ax + 380, GY + 120); ctx.lineTo(ax + 320, GY + 40); ctx.lineTo(ax + 120, GY + 40); ctx.closePath(); ink(ctx); ctx.stroke();
  box(ctx, ax + 150, GY - 20, 140, 90, 16, '#C99A5E'); ctx.beginPath(); ctx.arc(ax + 220, GY - 20, 56, Math.PI, TAU); ink(ctx, 10); ctx.stroke();
  const hop = Math.abs(Math.sin(L * Math.PI * 0.5)) * 50 * prog(L, 1, 1.5);
  withT(ctx, ax + 300, GY + 40 - hop, 1, Math.sin(L * 1.6) * 0.15, () => {
    ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(50, 0); ctx.lineTo(0, -60); ctx.closePath(); fs(ctx, '#F4D9A0');
    ctx.fillStyle = C.grass2; ctx.fillRect(-36, -14, 72, 8);
  });
  // B with a bottle of water
  const dr = bump(L, 8, 2.2);
  person(ctx, 'B', { x: ax + 100, y: GY + 60, look: 0.6, aR: [0.3 + 2.0 * dr, 0.6 + 0.6 * dr], blink: blinkAt(L, 11), tilt: -0.1 * dr,
    holdR: (c, a) => withT(c, 0, 0, 1, -a + Math.PI, () => { box(c, -16, -30, 32, 80, 10, '#7FC4E8', 4); box(c, -10, -44, 20, 16, 4, C.blue, 4); }) });
}

// 7. camera or watching
function sceneCamera(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  // a jet crosses overhead for them to follow
  const jp = prog(L, 1, 9), jx = lerp(-200, 1100, jp), jy = 250 - Math.sin(jp * Math.PI) * 60;
  if (jp > 0 && jp < 1) jet(ctx, jx, jy, 1.0, -Math.cos(jp * Math.PI) * 0.1, C.blue);
  const aim = Math.atan2(jy - (GY - 360), jx - 300);
  // A: camera to the eye, lens tracking the jet
  person(ctx, 'A', { x: 300, y: GY + 60, look: 0.6, lookY: -0.5, aR: [1.9, 1.0], aL: [-0.5, 2.1], blink: false });
  withT(ctx, 330, GY - 300, 1, clamp(aim, -1.2, 0.2) * 0.6, () => {
    box(ctx, -30, -40, 90, 70, 12, '#2B3237');
    box(ctx, 60, -28, 150, 46, 10, '#3A4650'); box(ctx, 196, -34, 40, 58, 8, '#2B3237');
    ctx.fillStyle = C.red; ctx.fillRect(110, -27, 8, 44);
    // shutter flashes
    for (const d of [2, 2.35, 2.7, 6.5, 6.85]) { const f = bump(L, d + 0.05, 0.12); if (f > 0) { ctx.globalAlpha = f; for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; limb(ctx, [[-30 + Math.cos(a) * 14, -50 + Math.sin(a) * 14], [-30 + Math.cos(a) * 34, -50 + Math.sin(a) * 34]], 4, C.gold); } ctx.globalAlpha = 1; } }
  });
  // B: deckchair with binoculars
  const dx = 700;
  limb(ctx, [[dx - 120, GY + 60], [dx + 60, GY - 200]], 10, '#8C5D3A'); limb(ctx, [[dx + 60, GY + 60], [dx - 80, GY - 60]], 10, '#8C5D3A');
  ctx.beginPath(); ctx.moveTo(dx - 90, GY - 40); ctx.lineTo(dx + 40, GY - 230); ctx.lineTo(dx + 110, GY - 180); ctx.lineTo(dx - 20, GY + 10); ctx.closePath(); fs(ctx, C.white);
  ctx.save(); ctx.clip(); for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? C.white : C.red; ctx.beginPath(); ctx.moveTo(dx - 90 + k * 22, GY - 40 - k * 32); ctx.lineTo(dx + 40 + k * 14, GY - 230 + k * 10 + 400); ctx.lineTo(dx + 70, GY + 60); ctx.closePath(); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(dx - 90, GY - 40); ctx.lineTo(dx + 40, GY - 230); ctx.lineTo(dx + 110, GY - 180); ctx.lineTo(dx - 20, GY + 10); ctx.closePath(); ink(ctx); ctx.stroke();
  const bn = clamp((jx - dx) / 500, -1, 1);
  person(ctx, 'B', { x: dx + 60, y: GY + 20, sit: true, lean: -0.25, look: bn * 0.4, lookY: -0.5, aL: [-2.3, -0.9], aR: [2.3, 0.9], tilt: bn * 0.1, blink: blinkAt(L, 13),
    holdL: () => {}, holdR: () => {} });
  withT(ctx, dx + 60 + 52 * Math.sin(-0.25) - 40, GY + 20 - 338 + 6, 1, -0.25 + bn * 0.1, () => { box(ctx, -12, -18, 40, 36, 10, '#2B3237', 4); box(ctx, 32, -18, 40, 36, 10, '#2B3237', 4); });
}

// 8. your spot: crowd line
function sceneSpot(ctx, u, L) {
  sky(ctx, u); sun(ctx, 1700, 170, 70, u, true);
  hills(ctx); ground(ctx);
  const ax = artX(7);
  // runway strip behind
  ctx.fillStyle = '#8D9CA8'; ctx.fillRect(0, GY - 70, W, 46); for (let x = 0; x < W; x += 120) { ctx.fillStyle = C.white; ctx.fillRect(x, GY - 50, 60, 6); }
  // A400M lumbering across the background
  const aq = prog(L, 1, 13);
  if (aq > 0 && aq < 1) jet(ctx, lerp(W + 300, -300, aq), 118 - aq * 20, 1.25, 0.03, 'a400', true);
  // gates-open clock
  const ck = pop(L, 0.3, SPRING.wobbly);
  withT(ctx, ax + 820, 400, Math.max(0.01, ck), 0, () => {
    circ(ctx, 0, 0, 90, C.white); box(ctx, -110, 104, 220, 52, 0, C.navy, 0); text(ctx, 'GATES OPEN', 0, 142, font(38, 800, DISPLAY), C.white, 'center');
    const hr = -Math.PI / 2 + (8 / 12) * TAU, mn = -Math.PI / 2 + prog(L, 0.3, 3) * TAU * 0;
    limb(ctx, [[0, 0], [Math.cos(hr) * 48, Math.sin(hr) * 48]], 6, C.navy); limb(ctx, [[0, 0], [Math.cos(mn) * 70, Math.sin(mn) * 70]], 4, C.navy);
    circ(ctx, 0, 0, 8, C.red, 0);
  });
  // crowd fills in behind later (simple heads)
  for (let k = 0; k < 9; k++) {
    const hk = pop(L, 5 + k * 0.25); if (hk <= 0) continue;
    const hx = ax + 80 + k * 100 + (k % 2) * 20, hy = GY + 70 + (k % 2) * 10;
    withT(ctx, hx, hy + (1 - hk) * 80, 0.7, 0, () => { box(ctx, -42, -60, 84, 120, 30, ['#7FC4E8', '#F28C9B', C.gold, C.grass2][k % 4]); circ(ctx, 0, -100, 40, [C.skin1, C.skin2, C.skin3][k % 3]); });
  }
  // A sprints in from the right, plants a chair at the front
  const rp = E.outCubic(prog(L, 0.4, 3));
  const px = lerp(W + 150, ax + 420, rp), running = L < 3;
  // chair
  const chk = pop(L, 3, SPRING.bouncy);
  if (chk > 0) withT(ctx, ax + 560, GY + 110, 1, 0, () => { ctx.scale(1, chk); limb(ctx, [[-40, 0], [40, -130]], 8, C.navy); limb(ctx, [[40, 0], [-40, -130]], 8, C.navy); box(ctx, -60, -150, 120, 40, 10, C.teal); });
  person(ctx, 'A', { x: px, y: GY + 120, flip: running, walk: running ? L * 9 : undefined, lean: running ? -0.12 : 0, look: running ? 0 : -0.3,
    aL: running ? [-Math.sin(L * 9) * 0.9, -0.8] : [-0.2 - 2.4 * pop(L, 3.4), -0.2], aR: running ? [Math.sin(L * 9) * 0.9, 0.8] : [0.3, 0.2],
    blink: blinkAt(L, 15), mouth: running ? 0.6 : 0.4 * bump(L, 4, 1.5) });
  // crowd barrier in front
  for (let k = 0; k < 11; k++) { const bx = ax + 20 + k * 92; box(ctx, bx - 8, GY + 130, 16, 120, 4, k % 2 ? C.red : C.white, 4); }
  for (let k = 0; k < 10; k++) { const bx = ax + 20 + k * 92; ctx.beginPath(); ctx.moveTo(bx, GY + 150); ctx.quadraticCurveTo(bx + 46, GY + 175, bx + 92, GY + 150); ink(ctx, 5); ctx.stroke(); }
}

// 9. weather
function sceneWeather(ctx, u, L) {
  const rain = E.inOutSine(prog(L, 3.8, 5.2));
  fill(ctx, mixc(C.sky, '#AFC0CF', rain));
  for (let k = 0; k < 5; k++) { const sp = 6 + hash01(k, 3) * 8, x = ((hash01(k, 5) * (W + 600) + u * sp) % (W + 600)) - 300; cloud(ctx, x, 120 + hash01(k, 7) * 300, 0.6 + hash01(k, 11) * 0.5, mixc(C.white, '#DCE3EA', rain)); }
  sun(ctx, 300, 230 - 0 * rain, 80, u, true);
  hills(ctx); ground(ctx);
  // rain cloud slides over the sun
  const cxp = lerp(-400, 360, E.outBack(prog(L, 3.6, 5.2), 1.2));
  cloud(ctx, cxp, 250, 1.6, '#8FA1B2', true);
  if (rain > 0.3) for (let k = 0; k < 26; k++) {
    const q = ((L * 1.4 + hash01(k, 31)) % 1), rx = cxp - 140 + hash01(k, 32) * 300 - q * 40, ry = 320 + q * 560;
    ctx.globalAlpha = clamp((rain - 0.3) * 2); limb(ctx, [[rx, ry], [rx - 8, ry + 26]], 3, '#5AA9CF'); ctx.globalAlpha = 1;
  }
  // wind streaks late on
  const wk = prog(L, 8, 9);
  if (wk > 0) for (let k = 0; k < 4; k++) { const q = ((L * 0.8 + k * 0.27) % 1); ctx.globalAlpha = Math.sin(q * Math.PI) * wk; ctx.beginPath(); const y = 500 + k * 70; ctx.moveTo(q * 1100 - 200, y); ctx.quadraticCurveTo(q * 1100, y - 30, q * 1100 + 160, y); ink(ctx, 5); ctx.strokeStyle = C.white; ctx.stroke(); ctx.globalAlpha = 1; }
  // A in shades (sun), B opens an umbrella when the rain comes
  person(ctx, 'A', { x: 260, y: GY + 60, shades: L < 4.5, look: 0.3, aL: [-0.4, -0.6], aR: [0.4, 0.6], tilt: wk * -0.12 * Math.sin(L * 4), blink: blinkAt(L, 17), mouth: rain > 0.5 ? 0.5 : 0 });
  const uk = pop(L, 6, SPRING.wobbly);
  person(ctx, 'B', { x: 640, y: GY + 60, look: -0.3, lookY: -0.5 * rain, aR: [2.6, 0.2], blink: blinkAt(L, 19), mouth: 0.3,
    holdR: (c) => { limb(c, [[0, 30], [0, -190]], 4, C.navy);
      withT(c, 0, -190, 1, 0, () => { c.scale(Math.max(0.05, uk), Math.max(0.3, uk)); c.beginPath(); c.arc(0, 0, 170, Math.PI, TAU); for (let k = 0; k < 4; k++) c.quadraticCurveTo(170 - k * 85 - 42, -24, 170 - (k + 1) * 85, 0); c.closePath(); fs(c, C.teal); }); } });
}

// 10. essentials: backpack and items popping out
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
function sceneEssentials(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(9), bx = ax + 470, by = GY + 40;
  const ITD = (k) => 1 + k * 0.55;
  const squ = 0.05 * [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((a, k) => a + wobble(L - ITD(k), 3, 6), 0);
  // items: arc out of the bag to a landing spot
  const items = [itemChair, itemEar, itemBank, itemCash, itemCream, itemWater, itemHat, itemBinos, itemSnacks, itemMap];
  const land = [[-360, -40], [-330, -330], [-170, -500], [10, -570], [190, -500], [340, -380], [-400, -560], [400, -600], [-250, -180], [410, -90]].map(([x, y]) => [bx + x, by + y]);
  items.forEach((fn, k) => {
    const d = ITD(k), q = prog(L, d, d + 0.9); if (q <= 0) return;
    const e = E.outCubic(q), x = lerp(bx, land[k][0], e), y = lerp(by - 160, land[k][1], e) - Math.sin(q * Math.PI) * 160;
    withT(ctx, x, y, 0.6 + 0.6 * Math.min(1, q * 2), (1 - e) * (k % 2 ? 1 : -1) * 1.5 + Math.sin(L * 2 + k) * 0.05, () => fn(ctx));
  });
  // backpack
  withT(ctx, bx, by, 1, 0, () => {
    ctx.scale(1 - squ, 1 + squ);
    box(ctx, -150, -300, 300, 300, 70, C.blue);
    ctx.beginPath(); ctx.moveTo(-150, -200); ctx.quadraticCurveTo(0, -330, 150, -200); ctx.lineTo(150, -240); ctx.quadraticCurveTo(0, -360, -150, -240); ctx.closePath(); fs(ctx, C.navy);
    box(ctx, -90, -150, 180, 110, 24, C.teal);
    box(ctx, -40, -340, 80, 40, 20, C.navy);
  });
  // kid tries the ear defenders at the end
  const kk = pop(L, 8, SPRING.bouncy);
  if (kk > 0) person(ctx, 'K', { x: lerp(W + 120, bx + 250, kk), y: GY + 70, earDef: true, look: -0.6, aL: [-2.6, -0.2 + 0.4 * Math.sin(L * 6)], mouth: 0.7, blink: blinkAt(L, 21) });
}

// 11. flying times
function sceneTimes(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const cx = 430, cy = 470, r = 250;
  // clock
  const ck = pop(L, 0.3, SPRING.bouncy);
  withT(ctx, cx, cy, Math.max(0.01, ck), 0, () => {
    circ(ctx, 0, 0, r + 24, C.navy, 0); circ(ctx, 0, 0, r, C.white);
    for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; limb(ctx, [[Math.sin(a) * (r - 36), -Math.cos(a) * (r - 36)], [Math.sin(a) * (r - 14), -Math.cos(a) * (r - 14)]], k % 3 ? 3 : 8, C.navy); }
    // hands spin then settle at 2 o'clock
    const spin = 1 - E.outCubic(prog(L, 0.5, 3));
    const mn = spin * TAU * 4, hrA = (2 / 12) * TAU + spin * TAU * 0.6;
    limb(ctx, [[0, 0], [Math.sin(hrA) * 140, -Math.cos(hrA) * 140]], 14, C.navy);
    limb(ctx, [[0, 0], [Math.sin(mn) * 200, -Math.cos(mn) * 200]], 8, C.teal);
    circ(ctx, 0, 0, 18, C.red, 4);
  });
  // little jets orbit the clock
  for (let k = 0; k < 3; k++) { const a = L * 0.9 + (k / 3) * TAU; const jx = cx + Math.cos(a) * (r + 90), jy = cy + Math.sin(a) * (r + 70); if (L > 3.2) topJet(ctx, k === 1 ? AC.typhoonTop : AC.hawkTop, jx, jy, 110 * pop(L, 3.2 + k * 0.3), a + Math.PI / 2); }
  // programme with a star
  const st2 = pop(L, 6.5, SPRING.wobbly);
  person(ctx, 'B', { x: 800, y: GY + 60, look: -0.4, aL: [-0.6, -1.4], aR: [0.6, 1.4], blink: blinkAt(L, 23), mouth: 0.4 * bump(L, 7, 1.5),
    holdL: (c) => { withT(c, 34, -40, 1, 0, () => { box(c, -60, -80, 120, 150, 0, C.off); limb(c, [[-34, -40], [34, -40]], 2, C.grey2); limb(c, [[-34, -10], [34, -10]], 2, C.grey2); limb(c, [[-34, 20], [20, 20]], 2, C.grey2);
      if (st2 > 0) withT(c, 30, -60, st2, 0, () => { c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k / 10) * TAU, rr = k % 2 ? 14 : 32; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); fs(c, C.gold, 4); }); }); } });
}

// 12. exit plan
function sceneExit(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(11);
  // road with queue of cars inching along
  ctx.fillStyle = '#5B6B78'; ctx.fillRect(0, GY + 10, W, 90);
  const inch = Math.floor(L * 1.5) * 10 + E.inOutCubic((L * 1.5) % 1) * 10;
  ctx.save(); ctx.translate(ax + 0, 0);
  ['#F28C9B', C.gold, C.blue, C.red, '#7FC4E8'].forEach((col, k) => { withT(ctx, 100 + k * 300 - 80 + inch, GY + 100, 0.7, 0, () => car(ctx, 0, 0, col)); });
  ctx.restore();
  // exit sign
  box(ctx, ax + 820, GY - 460, 16, 470, 4, C.grey2);
  const sk = pop(L, 0.5, SPRING.wobbly);
  withT(ctx, ax + 828, GY - 470, Math.max(0.01, sk), 0, () => {
    box(ctx, -130, -70, 260, 120, 0, '#1F8A4C'); signText(ctx, 'EXIT', -26, 22, 70);
    ctx.beginPath(); ctx.moveTo(60, -24); ctx.lineTo(96, -2); ctx.lineTo(60, 20); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill(); limb(ctx, [[40, -2], [70, -2]], 10, C.white);
  });
  // characters walk toward the meet-up flag
  const wp = E.inOutSine(prog(L, 1.5, 7.2)), walking = L > 1.5 && L < 7.2;
  ['B', 'A', 'K'].forEach((w, k) => {
    const x = lerp(ax + 20 + k * 165, ax + 330 + k * 165, wp);
    person(ctx, w, { x, y: GY - 10 + (w === 'K' ? 10 : 0), walk: walking ? L * 6 + k : undefined, look: 0.5, aL: walking ? [-Math.sin(L * 6 + k) * 0.5, -0.3] : [-0.2, -0.2], aR: walking ? [Math.sin(L * 6 + k) * 0.5, 0.3] : (w === 'A' ? [0.3 + 2.2 * pop(L, 8), 0.1] : [0.2, 0.2]), blink: blinkAt(L, 25 + k) });
  });
  // meet-up flag lands
  const fk = pop(L, 7, SPRING.bouncy);
  if (fk > 0) withT(ctx, ax + 720, lerp(-300, GY - 10, Math.min(1, fk)), 1, ring(L - 7, 2, 3) * 0.15, () => {
    limb(ctx, [[0, 0], [0, -330]], 6, C.navy);
    ctx.beginPath(); ctx.moveTo(0, -330); ctx.quadraticCurveTo(80, -350 + Math.sin(L * 6) * 10, 170, -320); ctx.lineTo(170, -230); ctx.quadraticCurveTo(80, -260 + Math.sin(L * 6) * 10, 0, -240); ctx.closePath(); fs(ctx, C.teal);
    text(ctx, 'MEET', 80, -296, font(32, 800, DISPLAY), C.white, 'center'); text(ctx, 'HERE', 80, -262, font(32, 800, DISPLAY), C.white, 'center');
  });
}

// outro
function sceneOutro(ctx, u, L, IMG) {
  sky(ctx, u); hills(ctx); ground(ctx);
  // three jets draw the logo swoosh: red, navy, teal
  const cols = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  const path = (q, k) => { const x = lerp(-200, W + 300, q); return [x, 150 + k * 30 - Math.sin(q * Math.PI) * 110 + (q - 0.5) * -60]; };
  cols.forEach((col, k) => {
    const q = E.inOutSine(prog(L, -0.6 + k * 0.12, 4.2 + k * 0.12));
    ctx.beginPath(); for (let s = 0; s <= 60; s++) { const p = path((s / 60) * q, k); s ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.lineCap = 'round'; if (q > 0) { if (k === 1) { ctx.strokeStyle = '#C9D6E0'; ctx.lineWidth = 28; ctx.stroke(); } ctx.strokeStyle = col; ctx.lineWidth = 22; ctx.stroke(); }
    if (q > 0 && q < 1) { const p = path(q, k), p2 = path(Math.min(1, q + 0.01), k); jet(ctx, p[0] + 120, p[1] - 10, 0.8, Math.atan2(p2[1] - p[1], p2[0] - p[0])); }
  });
  // logo lands
  const lk = pop(L, 3, SPRING.bouncy);
  if (lk > 0 && IMG.logo) { const lw = 700, lh = lw * IMG.logo.height / IMG.logo.width; withT(ctx, W / 2, 335, lk, (1 - lk) * 0.2, () => { ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh); }); }
  const tk = E.outQuint(prog(L, 5, 5.8));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 580, W * tk, 300); ctx.clip();
  text(ctx, 'Have a brilliant airshow season!', W / 2, 680, font(84, 800, DISPLAY), C.navy, 'center');
  ctx.restore();
  const uk = pop(L, 6.2, SPRING.snappy);
  if (uk > 0) withT(ctx, W / 2, 790, uk, 0, () => { box(ctx, -330, -52, 660, 84, 0, C.teal); text(ctx, 'ukairshowguide.co.uk', 0, 10, font(50, 700, UI), C.white, 'center'); });
  // friends waving
  const wv = Math.sin(L * 5);
  person(ctx, 'A', { x: 190, y: GY + 80, aR: [2.5 + wv * 0.3, 0.3], blink: blinkAt(L, 30), mouth: 0.6, look: 0.4 });
  person(ctx, 'K', { x: 1580, y: GY + 90, hop: Math.max(0, Math.sin(L * Math.PI)) * 30, aL: [-2.6, 0], aR: [2.6, 0], mouth: 0.8, look: 0.3 });
  person(ctx, 'B', { x: 1790, y: GY + 80, aL: [-2.5 - wv * 0.3, -0.3], blink: blinkAt(L, 31), mouth: 0.6, look: -0.4 });
}

const SCENES = [scenePick, sceneBudget, sceneBook, sceneTravel, sceneStay, sceneFood, sceneCamera, sceneSpot, sceneWeather, sceneEssentials, sceneTimes, sceneExit];

// paint scene n (−1 = intro, 0..11 steps, 12 = outro) at beat u
function paint(ctx, n, u, IMG) {
  if (n < 0) return sceneIntro(ctx, u);
  if (n >= NSTEP) return sceneOutro(ctx, u, u - OUTRO, IMG);
  const s = st(n);
  SCENES[n](ctx, u, u - s);
  card(ctx, u, s, n);
}
const sceneAt = (u) => (u < INTRO ? -1 : u >= OUTRO ? NSTEP : Math.floor((u - INTRO) / STEP));

// ---------------------------------------------------------------- jet wipe transition
// A jet flies left to right towing a cloud curtain: the next scene is behind it, the old one ahead.
const WIPE_A = 0.9, WIPE_B = 0.9;
function wipe(ctx, u, nNext, IMG) {
  const s = nNext >= NSTEP ? OUTRO : st(nNext);
  const p = E.inOutSine(prog(u, s - WIPE_A, s + WIPE_B));
  const edge = lerp(-260, W + 260, p);
  paint(ctx, nNext - 1, u, IMG);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-10, -10);
  for (let y = -10; y <= H + 10; y += 30) ctx.lineTo(edge + Math.sin(y / 90 + u * 4) * 36, y);
  ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip();
  paint(ctx, nNext, u, IMG);
  ctx.restore();
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
    paint(ctx, sceneAt(u), u, IMG);
  },
});
