// How airshow security works: pure function of time. window.seek(t) paints frame t.
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
const STEPS = [
  { title: 'Which shows search bags?', q: 'Base and ticketed shows', b: ['Base shows: every bag searched', 'Museum shows may check bags', 'Free seafront shows: walk in'] },
  { title: 'Join the queue', q: 'Look for the right lane', b: ['Bag and no-bag lanes at big shows', 'Unzip your bag before the table', 'Queues peak at opening time'] },
  { title: 'Get your bag ready', q: 'Pack it in layers', b: ['Top: camera, batteries and meds', 'Middle: food in clear boxes', 'Bottom: coats and jumpers'] },
  { title: "What's in the bag?", q: "Check your show's own list", b: ['Fine: picnics, chairs, cameras', 'Check: alcohol, gazebos, ladders', 'Not allowed: knives, drones, BBQs'] },
  { title: 'Into the search tent', q: 'X-ray scanner or hand search', b: ['Some big shows use X-ray scanners', 'Or a steward checks by hand', 'Chairs and cool boxes get checked'] },
  { title: 'Personal check', q: 'At some gates: arch or hand wand', b: ['More likely at military bases', 'Pockets into your bag first', 'You can ask for a same-sex search'] },
  { title: 'Ticket check', q: 'Once you are through the tents', b: ['Ticket ready on your phone', 'Screenshot it in case of no signal', 'Turn the screen brightness up'] },
  { title: "You're in!", q: 'Head for the crowd line', b: ['Save your front row pitch first', 'Then explore the static park', 'Agree a meet-up point'] },
  { title: "Martyn's Law", q: 'Expected from spring 2027', b: ['A new UK law for venues and events', 'Big ticketed events: more checks', 'Expect bag checks at more shows'] },
];
// rows on the Martyn's Law board: [badge, line]
const LAW_ROWS = [['200+', 'Standard tier: safety plans'], ['800+', 'Enhanced tier: extra checks'], ['2027', 'Expected from spring']];
const INTRO_WORDS = ['HOW AIRSHOW', 'SECURITY', 'WORKS'], INTRO_TAG = 'BASE AND TICKETED SHOWS', INTRO_SUB = 'From the queue to the crowd line';
const OUTRO_LINE = 'Pack light and arrive early!', OUTRO_LINES = ['Pack light and', 'arrive early!'];

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
HITS.push([st(2) + 0.4, 'flap opens', 'whoosh', { len: 0.3, from: 900, to: 2600, gain: 0.1 }]);
for (let k = 0; k < 3; k++) HITS.push([st(3) + 2.5 + k * 2, `tray ${k + 1} lands`, 'thud', { pitch: 220, gain: 0.14 }]);
HITS.push([st(3) + 8, 'not allowed', 'thud', { gain: 0.22 }]);
HITS.push([st(4) + 2.8, 'scan on screen', 'blip', { pitch: 'E6', gain: 0.14 }]);
HITS.push([st(5) + 2.6, 'arch clear', 'bell', { pitch: 'C6', gain: 0.14 }]);
for (const d of [5.6, 7.1, 8.6]) HITS.push([st(5) + d, 'wand beep', 'blip', { pitch: 'A6', gain: 0.12 }]);
HITS.push([st(6) + 3.2, 'ticket scanned', 'blip', { pitch: 'E6', gain: 0.16 }], [st(6) + 3.6, 'ticket ok', 'bell', { pitch: 'G6', gain: 0.16 }]);
HITS.push([st(6) + 4.4, 'barrier lifts', 'whoosh', { len: 0.4, from: 600, to: 1800, gain: 0.1 }]);
HITS.push([st(7) + 1, 'red arrows', 'whoosh', { len: 1.2, from: 300, to: 1400, gain: 0.18 }], [st(7) + 4, "you're in", 'pop', { pitch: 'C6', gain: 0.2 }]);
HITS.push([st(8) + 0.4, 'board', 'thud', { gain: 0.2 }]);
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

// 1. which shows search bags: base gate vs seafront
function sceneWhich(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(0);
  ctx.save(); ctx.translate(ax, 0);
  // seafront side (right)
  ctx.fillStyle = C.sea; ctx.fillRect(500, GY - 130, 480, 130);
  for (let k = 0; k < 7; k++) { const wx = 500 + ((k * 80 + L * 30) % 480); ctx.beginPath(); ctx.arc(wx, GY - 90 + (k % 2) * 40, 16, Math.PI, TAU); ink(ctx, 4); ctx.strokeStyle = C.white; ctx.stroke(); }
  ctx.fillStyle = '#D9D4C7'; ctx.fillRect(500, GY - 14, 480, 200);
  limb(ctx, [[500, GY - 60], [980, GY - 60]], 4, C.white); for (let x = 520; x < 980; x += 60) limb(ctx, [[x, GY - 60], [x, GY - 10]], 4, C.white);
  // base side (left): search tent behind a fence and gate
  ctx.fillStyle = C.grass; ctx.fillRect(0, GY, 490, SH - GY);
  tent(ctx, 120, 440, GY - 380, [230, 330]);
  for (let x = 14; x < 480; x += 38) limb(ctx, [[x, GY - 130], [x, GY]], 2, C.grey2);
  limb(ctx, [[10, GY - 130], [480, GY - 130]], 3, C.grey2); limb(ctx, [[10, GY - 66], [480, GY - 66]], 2, C.grey2);
  box(ctx, 196, GY - 250, 16, 250, 0, C.navy, 0); box(ctx, 350, GY - 250, 16, 250, 0, C.navy, 0);
  box(ctx, 170, GY - 300, 220, 64, 0, C.navy); text(ctx, 'MAIN GATE', 280, GY - 254, font(40, 800, DISPLAY), C.white, 'center');
  ctx.fillStyle = C.grass; ctx.fillRect(212, GY - 130, 138, 132);
  ink(ctx, 4); ctx.setLineDash([16, 14]); ctx.beginPath(); ctx.moveTo(492, 150); ctx.lineTo(492, SH); ctx.stroke(); ctx.setLineDash([]);
  // people: queue at the gate, and walkers on the prom
  person(ctx, 'T', { x: 130, y: GY + 80, scale: 0.95, look: 0.6, aR: [1.2, 0.6], blink: blinkAt(L, 2) });
  person(ctx, 'A', { x: 310, y: GY + 100, scale: 0.95, look: -0.4, blink: blinkAt(L, 3) });
  const wk = (L * 60) % 700;
  person(ctx, 'B', { x: 560 + wk * 0.55, y: GY + 100, scale: 0.95, walk: L * 6, look: 0.5, aL: [-Math.sin(L * 6) * 0.5, -0.3], aR: [Math.sin(L * 6) * 0.5, 0.3] });
  person(ctx, 'K', { x: 500 + wk * 0.55, y: GY + 110, scale: 0.95, walk: L * 6 + 1, look: 0.5 });
  // labels
  label(ctx, 'BAG SEARCH', 260, 330, 58, C.navy, C.white, pop(L, 2.5));
  tickSq(ctx, 260, 440, Math.max(0, pop(L, 2.9)) * 1.3, true);
  label(ctx, 'NO GATE CHECKS', 740, 330, 58, C.teal, C.white, pop(L, 6.5));
  ctx.restore();
}

// 2. join the queue: lanes with belt barriers
function sceneQueue(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(1);
  ctx.save(); ctx.translate(ax, 0);
  tent(ctx, 640, 1100, GY - 420, [700, 820]);
  // back lane barrier (bag lane) and front lane (no bag)
  for (let x = 40; x <= 640; x += 120) stanchion(ctx, x, GY - 10);
  belt(ctx, 40, 640, GY - 10);
  // signs on poles
  box(ctx, 66, GY - 470, 14, 470, 0, C.grey2, 0);
  label(ctx, 'BAG LANE', 230, GY - 430, 52, C.navy, C.white, pop(L, 1));
  label(ctx, 'NO BAG', 200, GY - 340, 52, C.teal, C.white, pop(L, 1.4));
  // queue inches forward
  const inch = Math.floor(L / 2) * 28 + E.inOutCubic(clamp((L % 2) / 0.6)) * 28;
  const Q = [['K', 360], ['B', 470], ['A', 580]];
  for (const [w, x0] of Q) {
    const moving = (L % 2) < 0.6;
    person(ctx, w, { x: x0 - 260 + inch, y: GY + 30, scale: 0.78, walk: moving ? L * 9 : undefined, look: 0.6, blink: blinkAt(L, x0), holdR: w === 'A' ? (c) => rucksack(c, 0, 40, 0.5) : undefined });
  }
  // no-bag visitor walks straight through the front lane
  const nb = prog(L, 2.5, 8);
  if (nb > 0 && nb < 1) person(ctx, 'S2', { x: lerp(-120, 760, nb), y: GY + 140, scale: 0.82, walk: L * 7, look: 0.6, aL: [-Math.sin(L * 7) * 0.6, -0.3], aR: [Math.sin(L * 7) * 0.6, 0.3] });
  for (let x = 40; x <= 640; x += 120) stanchion(ctx, x, GY + 160);
  belt(ctx, 40, 640, GY + 160);
  ctx.restore();
}

// 3. get your bag ready: packed in layers
function sceneBag(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(2), bx = 420, top = 250, bw = 560, bh = 600;
  ctx.save(); ctx.translate(ax, 0);
  // bag body (cut-away)
  box(ctx, bx - bw / 2, top, bw, bh, 60, C.blue);
  box(ctx, bx - bw / 2 + 30, top + 40, bw - 60, bh - 80, 0, '#EAF1F6', 5);
  const lay = [[top + 40, 'TOP'], [top + 213, 'MIDDLE'], [top + 386, 'BOTTOM']];
  lay.forEach(([y, nm], k) => {
    if (k) limb(ctx, [[bx - bw / 2 + 34, y], [bx + bw / 2 - 34, y]], 1, C.grey);
    const lk = pop(L, 2.4 + k * 2, SPRING.bouncy);
    if (lk > 0) withT(ctx, bx - bw / 2 - 10, y + 86, lk, 0, () => { box(ctx, -36, -36, 72, 72, 0, C.navy); text(ctx, String(k + 1), 0, 22, font(56, 800, DISPLAY), C.white, 'center'); });
  });
  const items = [[['camera', -150, 125], ['bank', 0, 125], ['meds', 150, 125]], [['box', -110, 300], ['water', 60, 300], ['sandwich2', 170, 310]], [['jumper', -90, 470], ['coat', 90, 470]]];
  items.forEach((row, k) => row.forEach(([nm, dx, y], j) => {
    const q = pop(L, 2.5 + k * 2 + j * 0.2, SPRING.bouncy); if (q <= 0) return;
    icon(ctx, nm, bx + dx, top + y - 40 + (1 - q) * -160, 1.05);
  }));
  // flap unzips open
  const fo = E.outBack(prog(L, 0.4, 1.4), 1.6);
  withT(ctx, bx - bw / 2 + 20, top + 10, 1, -fo * 0.32, () => { box(ctx, 0, -40, bw - 40, 60, 24, C.navy); });
  // A gives a thumbs-up beside it
  person(ctx, 'A', { x: 830, y: GY + 60, look: -0.6, aL: [-0.6 - 1.4 * pop(L, 7), -1.2], blink: blinkAt(L, 9), mouth: 0.4 * bump(L, 7.5, 1.5) });
  ctx.restore();
}

// 4. what's in the bag: three trays
function sceneTrays(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(3);
  ctx.save(); ctx.translate(ax, 0);
  const T = [['USUALLY FINE', '#2E9E5B', ['sandwich', 'chair', 'camera']], ['CHECK FIRST', '#E39A2D', ['wine', 'gazebo', 'ladder']], ['NOT ALLOWED', C.red, ['knife', 'drone', 'bbq']]];
  T.forEach(([nm, col, its], k) => {
    const cx = 165 + k * 325, ty = GY - 90;
    const tk = pop(L, 0.6 + k * 0.25, SPRING.bouncy);
    if (tk <= 0) return;
    withT(ctx, cx, ty, tk * 1.08, 0, () => {
      // tray (square sides)
      ctx.beginPath(); ctx.moveTo(-140, -60); ctx.lineTo(140, -60); ctx.lineTo(118, 70); ctx.lineTo(-118, 70); ctx.closePath(); fs(ctx, col);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-128, -52, 256, 16);
    });
    label(ctx, nm, cx, ty - 470, 46, col, C.white, tk);
    // items drop in on that tray's bullet
    its.forEach((it, j) => {
      const d = 2.5 + k * 2 + j * 0.3, q = prog(L, d - 0.5, d);
      if (q <= 0) return;
      const yy = lerp(ty - 400, ty - 120 + (j % 2) * -36, E.outBounce(q));
      icon(ctx, it, cx - 86 + j * 86, yy, 1.25, (1 - q) * (j - 1) * 0.6);
    });
  });
  // big red cross stamped over the not-allowed tray
  const xk = pop(L, 8, SPRING.wobbly);
  if (xk > 0) withT(ctx, 165 + 650, GY - 220, xk * 1.9, 0.1, () => { ctx.globalAlpha = 0.9; tickSq(ctx, 0, 0, 1, false); ctx.globalAlpha = 1; });
  const ok = pop(L, 3.4, SPRING.wobbly); if (ok > 0) tickSq(ctx, 165, GY - 300, ok * 1.2, true);
  ctx.restore();
}

// 5. into the search tent: X-ray scanner
function sceneXray(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(4);
  ctx.save(); ctx.translate(ax, 0);
  tent(ctx, 20, 960, GY - 640);
  // conveyor
  const by = GY - 200;
  box(ctx, 80, by, 760, 34, 0, '#5B6B78');
  for (let x = 120; x < 840; x += 60) circ(ctx, x, by + 17, 9, C.grey, 3);
  for (const x of [120, 800]) box(ctx, x - 10, by + 34, 20, GY - by - 34, 0, C.grey2, 4);
  // the bag rides the belt, pausing inside the tunnel
  const bx = kf(L, [[0.8, 120], [2.6, 450], [5.4, 470], [7.4, 780]], E.inOutSine);
  rucksack(ctx, bx, by, 0.9);
  // tunnel (drawn over the bag)
  box(ctx, 330, by - 260, 280, 262, 0, '#C9D3DA');
  ctx.fillStyle = '#5B6B78'; ctx.fillRect(342, by - 200, 256, 200);
  for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#3E4C57' : '#465663'; ctx.fillRect(342 + k * 3, by - 198, 10, 196); ctx.fillRect(586 - k * 3, by - 198, 10, 196); }
  box(ctx, 330, by - 260, 280, 50, 0, C.navy); text(ctx, 'X-RAY', 470, by - 222, font(38, 800, DISPLAY), C.white, 'center');
  // monitor showing the scan
  box(ctx, 690, by - 470, 14, 270, 0, C.grey2, 0);
  box(ctx, 600, by - 560, 200, 140, 0, '#1C2A36');
  const sc = clamp(prog(L, 2.8, 3.4)) * (1 - prog(L, 6, 6.4));
  if (sc > 0) { ctx.globalAlpha = sc; box(ctx, 650, by - 540, 100, 100, 14, '#3C7DDB', 3); circ(ctx, 680, by - 500, 16, '#F38B2A', 0); box(ctx, 700, by - 480, 34, 18, 0, '#2E9E5B', 0); ctx.globalAlpha = 1; }
  // steward watching the screen
  person(ctx, 'S', { x: 870, y: GY + 60, scale: 0.92, look: -0.5, lookY: -0.4, aL: [-0.5, -1.2], blink: blinkAt(L, 12), mouth: 0.3 * bump(L, 6.5, 1) });
  ctx.restore();
}

// 6. personal check: arch and wand
function sceneWand(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(5);
  ctx.save(); ctx.translate(ax, 0);
  tent(ctx, -60, 1040, GY - 640);
  // tray of pocket items
  box(ctx, 40, GY - 150, 150, 18, 0, C.grey2); box(ctx, 106, GY - 132, 18, 132, 0, C.grey2, 4);
  box(ctx, 52, GY - 186, 126, 36, 0, '#5B6B78', 4);
  const pk = pop(L, 1, SPRING.bouncy); if (pk > 0) { icon(ctx, 'keys', 80, GY - 196 - (1 - pk) * 80, 0.8); icon(ctx, 'phone', 120, GY - 204 - (1 - pk) * 90, 0.7); icon(ctx, 'coins', 155, GY - 196 - (1 - pk) * 70, 0.7); }
  // walk-through arch
  const archX = 300;
  const ar = (x) => { box(ctx, x - 16, GY - 470, 32, 470, 0, '#C9D3DA'); };
  ar(archX - 110);
  // A walks through
  const wp = lerp(40, 1200, prog(L, 1.2, 5.2)), walking = L > 1.2 && L < 5.2;
  if (L < 5.2) person(ctx, 'A', { x: wp, y: GY + 50, scale: 0.9, walk: walking ? L * 7 : undefined, look: 0.6, blink: blinkAt(L, 14), aL: [-Math.sin(L * 7) * 0.5, -0.3], aR: [Math.sin(L * 7) * 0.5, 0.3] });
  ar(archX + 110);
  box(ctx, archX - 130, GY - 520, 260, 60, 0, '#C9D3DA');
  const pass = bump(L, (300 - 40) / 1160 * 4 + 1.2, 0.5);
  box(ctx, archX - 40, GY - 506, 80, 32, 0, mixc('#5B6B78', '#2EC26A', pass), 4);
  // steward with a hand wand checks B
  const wy = Math.sin(clamp(prog(L, 5.5, 10)) * Math.PI * 3) * 120;
  const bIn = E.outCubic(prog(L, 4, 5.4)); // B enters after A has walked off
  if (L > 4) person(ctx, 'B', { x: lerp(-80, 560, bIn), y: GY + 50, scale: 0.9, walk: bIn > 0 && bIn < 1 ? L * 7 : undefined, look: 0.4, aL: [-1.45 * prog(L, 5.2, 5.6), 0], aR: [1.45 * prog(L, 5.2, 5.6), 0], blink: blinkAt(L, 15), mouth: 0.2 });
  const wave = prog(L, 5.5, 10);
  person(ctx, 'T', { x: 850, y: GY + 50, scale: 0.9, look: -0.6, aL: [-1.3 + (wave > 0 && wave < 1 ? wy / 260 : 0), -0.15], blink: blinkAt(L, 16),
    holdL: (c, a) => withT(c, 0, 0, 1, 0, () => { box(c, -90, -9, 90, 18, 4, '#2B3237', 4); box(c, -150, -24, 66, 48, 14, '#2B3237', 4); if (bump(L, 5.6, 0.3) + bump(L, 7.1, 0.3) + bump(L, 8.6, 0.3) > 0.2) box(c, -40, -26, 14, 10, 0, '#2EC26A', 0); }) });
  ctx.restore();
}

// 7. ticket check after the tents
function sceneTicket(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(6);
  ctx.save(); ctx.translate(ax, 0);
  tent(ctx, -200, 260, GY - 520, [120, 230]);
  // barrier arm lifts after the scan
  box(ctx, 760, GY - 230, 40, 230, 0, C.grey2);
  const arm = E.outBack(prog(L, 4.4, 5.2), 1.4) * 1.4;
  withT(ctx, 780, GY - 200, 1, -arm, () => { for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? C.white : C.red; ctx.fillRect(-6 - (k + 1) * 46, -12, 46, 24); } ink(ctx, 4); ctx.strokeRect(-282, -12, 276, 24); });
  // A shows a phone ticket, steward scans it
  person(ctx, 'A', { x: 380, y: GY + 50, look: 0.6, aR: [1.6, 0.3], blink: blinkAt(L, 18), mouth: 0.4 * bump(L, 4, 1.4),
    holdR: (c, a) => withT(c, 0, 0, 1, -a + Math.PI / 2 * 0, () => { box(c, -16, -30, 32, 56, 5, '#2B3237', 4); }) });
  person(ctx, 'T', { x: 640, y: GY + 50, look: -0.6, aL: [-1.4, -0.3], blink: blinkAt(L, 19),
    holdL: (c) => { box(c, -36, -16, 40, 30, 4, '#2B3237', 4); } });
  // the ticket, shown big
  const tk = pop(L, 1.2, SPRING.bouncy);
  if (tk > 0) withT(ctx, 150, 470, tk * 0.9, (1 - tk) * -0.2, () => {
    box(ctx, -120, -200, 240, 400, 24, '#2B3237'); ctx.fillStyle = C.white; ctx.fillRect(-100, -170, 200, 330);
    ctx.fillStyle = C.navy; ctx.fillRect(-100, -170, 200, 52); text(ctx, 'E-TICKET', 0, -132, font(34, 800, DISPLAY), C.white, 'center');
    qr(ctx, -66, -90, 132, 5);
    text(ctx, 'SHOW DAY', 0, 120, font(28, 700, UI), C.navy, 'center');
  });
  // scanner beam
  const beam = bump(L, 3.2, 0.5);
  if (beam > 0) { ctx.globalAlpha = beam; limb(ctx, [[560, GY - 300], [250, 470]], 3, C.red); ctx.globalAlpha = 1; }
  label(ctx, 'TICKET OK', 560, 350, 52, '#2E9E5B', C.white, pop(L, 3.6, SPRING.bouncy));
  ctx.restore();
}

// 8. you're in
function sceneIn(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(7);
  ctx.save(); ctx.translate(ax, 0);
  // runway and a Typhoon on static display
  ctx.fillStyle = '#8D9CA8'; ctx.fillRect(-ax, GY - 70, SW, 46); for (let x = -ax; x < SW; x += 120) { ctx.fillStyle = C.white; ctx.fillRect(x, GY - 50, 60, 6); }
  jet(ctx, 330, GY - 130, 1.4, 0, C.blue);
  // Red Arrows pass overhead
  const jp = prog(L, 1, 9);
  if (jp > 0 && jp < 1) {
    const P = (q, k) => [lerp(-200, 1200, q) - k * 70, 150 + k * 40 - Math.sin(q * Math.PI) * 40];
    const SM = ['#E8202A', '#FFFFFF', '#1D4FB7'];
    [1, 0, 2].forEach((k) => { const pts = []; for (let n = 1; n < 70; n++) { const q = jp - n * 0.005; if (q < 0) break; const p = P(q, k); pts.push([p[0] - 120, p[1] + 12]); } if (k === 0) smoke(ctx, pts, '#B9C7D3', 12, 0.25, 0.6); smoke(ctx, pts, SM[k], 9, 0.25); });
    [1, 0, 2].forEach((k) => { const p = P(jp, k); jet(ctx, p[0], p[1], 0.7, 0); });
  }
  // family arrives at the front
  const rp = E.outCubic(prog(L, 0.6, 4)), walking = L > 0.6 && L < 4;
  ['K', 'B', 'A'].forEach((w, k) => person(ctx, w, { x: lerp(-200 - k * 150, 520 + k * 150, rp), y: GY + 110, walk: walking ? L * 8 + k : undefined, look: walking ? 0.6 : -0.2, lookY: walking ? 0 : -0.6,
    aL: walking ? [-Math.sin(L * 8 + k) * 0.6, -0.3] : [-0.3 - 2.2 * pop(L, 4.4 + k * 0.2), -0.2], aR: walking ? [Math.sin(L * 8 + k) * 0.6, 0.3] : [0.3, 0.2], mouth: walking ? 0.3 : 0.6, blink: blinkAt(L, 20 + k) }));
  for (let k = 0; k < 11; k++) { const bx = 20 + k * 92; box(ctx, bx - 8, GY + 130, 16, 120, 0, k % 2 ? C.red : C.white, 4); }
  limb(ctx, [[20, GY + 150], [940, GY + 150]], 3, C.navy);
  label(ctx, "YOU'RE IN!", 780, 330, 64, C.red, C.white, pop(L, 4, SPRING.bouncy));
  ctx.restore();
}

// 9. Martyn's Law
function sceneLaw(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(8);
  ctx.save(); ctx.translate(ax, 0);
  // the notice board
  const bk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 330, 520, bk, 0, () => {
    box(ctx, -300, -330, 600, 640, 0, C.white);
    ctx.fillStyle = C.navy; ctx.fillRect(-297, -327, 594, 120);
    text(ctx, "MARTYN'S LAW", 0, -250, font(64, 800, DISPLAY), C.white, 'center');
    text(ctx, 'Terrorism (Protection of', 0, -150, font(34, 700, UI), C.navy, 'center');
    text(ctx, 'Premises) Act 2025', 0, -108, font(34, 700, UI), C.navy, 'center');
    const rows = LAW_ROWS;
    rows.forEach(([a, b], k) => {
      const rk = pop(L, 2.5 + k * 2, SPRING.snappy); if (rk <= 0) return;
      const y = -30 + k * 110;
      withT(ctx, 0, y, 1, 0, () => { ctx.globalAlpha = Math.min(1, rk); box(ctx, -270, -40, 124, 80, 0, k === 2 ? C.red : C.teal, 4); text(ctx, a, -208, 14, font(k === 2 ? 40 : 44, 800, DISPLAY), C.white, 'center'); text(ctx, b, -126, 13, font(33, 700, UI), C.navy); ctx.globalAlpha = 1; });
    });
  });
  // CCTV camera on a pole, panning
  box(ctx, 900, GY - 560, 16, 560, 0, C.grey2, 0);
  withT(ctx, 908, GY - 560, 1, -0.4 + Math.sin(L * 0.9) * 0.35, () => { box(ctx, -110, -30, 110, 56, 0, C.off); box(ctx, -130, -20, 24, 36, 0, '#2B3237', 4); });
  // steward with a clipboard
  person(ctx, 'S', { x: 800, y: GY + 60, look: -0.6, aL: [-0.9, -1.3], blink: blinkAt(L, 24),
    holdL: (c) => { box(c, -50, -70, 90, 120, 0, '#C99A5E', 4); c.fillStyle = C.white; c.fillRect(-40, -56, 70, 94); } });
  ctx.restore();
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

const SCENES = [sceneWhich, sceneQueue, sceneBag, sceneTrays, sceneXray, sceneWand, sceneTicket, sceneIn, sceneLaw];

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
