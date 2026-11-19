// UK Airshow Guide: Partner With Us. A pure function of time: window.seek(t) paints frame t.
// Timing is in beats (u) on the measured 96 bpm grid; docs/shotlist.md is the plan this follows.
// Look: frosted-glass panels over the guide's own airshow photos. Every glass panel shows a
// pre-blurred copy of the exact photo behind it, under the same camera, so the glass reads as real.
import * as M from './lib/motion.js';

const { W, H, E, prog, lerp, clamp, springU, springKeys, SPRING, wobble, font, layout, glyph, text,
  cover, crop, zoomAbout, mulberry32, noise1 } = M;

// Brand tokens (advertise-with-us.html / home.html): navy, one accent teal, white type.
const C = { navy: '#26343E', navy2: '#33424D', teal: '#32B4AF', tealSoft: '#9FD8D5', white: '#FFFFFF' };
const D = 'Display', UI = 'UI';
// Square corners everywhere (client request): every panel, tab and pill is a plain rectangle.
const rrect = (ctx, x, y, w, h) => { ctx.beginPath(); ctx.rect(x, y, w, h); };

// Every visual accent: [beat, label, sfx, opts]. sfx.mjs voices them.
const HITS = [
  [0, 'slab lands', 'thud'],
  [0.5, "LET'S", 'pop', { pitch: 'A4' }],
  [1, 'WORK', 'pop', { pitch: 'D5' }],
  [1.5, 'TOGETHER', 'pop', { pitch: 'F5' }],
  [3, 'subline', 'tick'],
  [6, 'light sweep', 'whoosh', { len: 0.5, from: 2500, to: 7000 }],
  [7.6, 'slab opens', 'whoosh', { len: 0.6, from: 500, to: 2500 }],
  [8, 'home page lands', 'thud'],
  [8.5, 'EVERY UK AIRSHOW', 'pop', { pitch: 'D5' }],
  [9.5, 'ONE GUIDE', 'pop', { pitch: 'A5' }],
  [11, 'subline', 'tick'],
  [12, 'push in', 'tick'],
  [13, '13 shows tag', 'blip', { pitch: 'A5' }],
  [15.7, 'whip', 'whoosh', { len: 0.5, from: 2400, to: 500, pan: -0.3 }],
  [16, 'chip park', 'pop', { pitch: 'D5' }],
  [18, 'chip arrive', 'pop', { pitch: 'F5' }],
  [20, 'chip bring', 'pop', { pitch: 'A5' }],
  [22, 'calmer gates', 'bell', { pitch: 'D6' }],
  [23.7, 'glass wipe', 'whoosh', { len: 0.5, from: 600, to: 3000, pan: 0.3 }],
  [24, 'how it works', 'thud'],
  [28, 'step 2', 'click'],
  [32, 'step 3', 'click'],
  [36, 'step 4', 'click'],
  [39.6, 'push through', 'whoosh', { len: 0.6, from: 400, to: 4000 }],
  [40, 'what you get', 'thud'],
  [42, 'tile 2', 'pop', { pitch: 'C5' }],
  [44, 'tile 3', 'pop', { pitch: 'D5' }],
  [46, 'tile 4', 'pop', { pitch: 'F5' }],
  [48, 'tile 5', 'pop', { pitch: 'G5' }],
  [50, 'tile 6', 'pop', { pitch: 'A5' }],
  [52, 'free promotion opens', 'whoosh', { len: 0.5, from: 800, to: 3500 }],
  [53, 'YouTube', 'blip', { pitch: 'F5' }],
  [53.5, 'Facebook', 'blip', { pitch: 'A5' }],
  [54, 'Instagram', 'blip', { pitch: 'C6' }],
  [55.7, 'whip up', 'whoosh', { len: 0.5, from: 3000, to: 600 }],
  [56, 'join together', 'thud'],
  [57, 'show pills', 'tick'],
  [60, 'your show here', 'bell', { pitch: 'F5' }],
  [62, 'permission line', 'tick'],
  [63.1, 'slot opens', 'whoosh', { len: 0.5, from: 600, to: 3000 }],
  [65, 'talk to me', 'bell', { pitch: 'C6' }],
  [66, 'url types', 'type', { len: 1.1 }],
  [68, 'free line', 'tick'],
  [69, 'light sweep', 'whoosh', { len: 0.5, from: 2500, to: 7000 }],
];

// ------------------------------------------------------------------ shared kit
const IMGS = ['arrows23', 'arrows18', 'family', 'typhoon', 'crowd', 'cosford23'];
const BL = {};         // pre-blurred copies, built in init()
let NOISE = [];        // grain tiles
let IM = {};

// a photo, cover-fit under a camera {z, fx, fy}; blurred = the frosted copy
function photo(ctx, key, cam, blurred = false) {
  const img = blurred ? BL[key] : IM[key];
  if (!img) return;
  cover(ctx, img, -2, -2, W + 4, H + 4, { fx: cam.fx, fy: cam.fy, zoom: cam.z });
}
// a shading wash over a photo: navy at alpha a, optionally graded from a side
function wash(ctx, a, dir = null, a2 = 0) {
  if (!dir) { ctx.fillStyle = `rgba(20,30,38,${a})`; ctx.fillRect(0, 0, W, H); return; }
  const g = dir === 'left' ? ctx.createLinearGradient(0, 0, W, 0) : dir === 'top' ? ctx.createLinearGradient(0, 0, 0, H) : ctx.createLinearGradient(0, H, 0, 0);
  g.addColorStop(0, `rgba(20,30,38,${a})`); g.addColorStop(1, `rgba(20,30,38,${a2})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// Frosted glass. back(ctx) paints the blurred scene behind the panel in scene coordinates.
function glass(ctx, x, y, w, h, r, back, o = {}) {
  if (w < 2 || h < 2) return;
  const alpha = o.alpha ?? 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(5,12,18,0.45)'; ctx.shadowBlur = o.shadow ?? 46; ctx.shadowOffsetY = 18;
  rrect(ctx, x, y, w, h, r); ctx.fillStyle = 'rgba(10,18,24,0.35)'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save();
  rrect(ctx, x, y, w, h, r); ctx.clip();
  back(ctx);
  ctx.fillStyle = o.tint ?? 'rgba(22,34,44,0.42)'; ctx.fillRect(x, y, w, h);
  const g = ctx.createLinearGradient(x, y, x + w * 0.55, y + h);
  g.addColorStop(0, `rgba(255,255,255,${o.sheen ?? 0.2})`); g.addColorStop(0.55, 'rgba(255,255,255,0.03)'); g.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  if (o.sweep > 0 && o.sweep < 1) {           // a diagonal band of light crossing the glass
    const sx = x - 300 + (w + 600) * E.inOutSine(o.sweep);
    ctx.save(); ctx.translate(sx, y); ctx.transform(1, 0, -0.45, 1, 0, 0);
    const sg = ctx.createLinearGradient(-140, 0, 140, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.28)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg; ctx.fillRect(-140, 0, 280, h);
    ctx.restore();
  }
  ctx.restore();
  rrect(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r);
  const rg = ctx.createLinearGradient(x, y, x + w, y + h);
  rg.addColorStop(0, 'rgba(255,255,255,0.85)'); rg.addColorStop(0.35, 'rgba(255,255,255,0.18)');
  rg.addColorStop(0.7, 'rgba(255,255,255,0.10)'); rg.addColorStop(1, 'rgba(255,255,255,0.5)');
  ctx.strokeStyle = o.rim ?? rg; ctx.lineWidth = o.rimW ?? 1.6; ctx.stroke();
  ctx.restore();
}
// the backdrop painter for glass in the current scene: same photo, same camera, blurred
function backOf(ctx, key, cam, washA = 0) {
  const M0 = ctx.getTransform();
  return (c) => { c.save(); c.setTransform(M0); photo(c, key, cam, true); if (washA) wash(c, washA); c.restore(); };
}

// per-glyph spring rise; returns the layout
function rise(ctx, str, x, y, size, weight, fam, color, u, u0, o = {}) {
  const f = font(size, weight, fam), track = (o.track ?? 0) * size;
  const L = layout(ctx, str, f, track);
  const st = o.stagger ?? 0.03, cfg = o.spring ?? SPRING.snappy;
  const ex = o.exit != null ? E.inBack(prog(u, o.exit, o.exit + 0.45), 1.4) : 0;
  if (ex >= 1) return L;
  const ox = o.align === 'center' ? -L.width / 2 : o.align === 'right' ? -L.width : 0;
  L.glyphs.forEach((g, j) => {
    const k = springU(u, u0 + j * st, cfg);
    if (k <= 0.002) return;
    ctx.globalAlpha = clamp(k * 1.3) * (1 - ex);
    glyph(ctx, g.ch, x + ox + g.cx, y + (1 - k) * size * 0.6 - ex * size * 0.9, f, color, 1, 1);
  });
  ctx.globalAlpha = 1;
  return L;
}
// a whole line rising as one piece (body copy)
function line(ctx, str, x, y, size, weight, fam, color, u, u0, o = {}) {
  const k = springU(u, u0, o.spring ?? SPRING.gentle);
  if (k <= 0.002) return;
  const ex = o.exit != null ? E.inCubic(prog(u, o.exit, o.exit + 0.4)) : 0;
  ctx.globalAlpha = clamp(k * 1.2) * (1 - ex) * (o.alpha ?? 1);
  text(ctx, str, x, y + (1 - k) * 40 - ex * 30, font(size, weight, fam), color, o.align ?? 'left', (o.track ?? 0) * size);
  ctx.globalAlpha = 1;
}
function wrap(ctx, str, f, maxW) {
  ctx.font = f;
  const out = []; let cur = '';
  for (const w of str.split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}
// kicker: short teal bar + spaced caps
function kicker(ctx, str, x, y, u, u0, o = {}) {
  const k = springU(u, u0, SPRING.snappy);
  if (k <= 0.002) return;
  const ex = o.exit != null ? E.inCubic(prog(u, o.exit, o.exit + 0.4)) : 0;
  ctx.globalAlpha = clamp(k) * (1 - ex);
  ctx.fillStyle = o.color ?? C.teal;
  ctx.fillRect(x, y - 15, 46 * k, 5);
  text(ctx, str, x + 62 - (1 - k) * 30, y, font(o.size ?? 28, 600, UI), o.color ?? C.teal, 'left', 0.16 * (o.size ?? 28));
  ctx.globalAlpha = 1;
}
const logzoom = (a, b, p) => a * (b / a) ** clamp(p);

// ------------------------------------------------------------------ S1 hook (u 0..8)
function camS1(u) { return { z: logzoom(1.04, 1.16, (u + 1) / 9), fx: 0.5 + 0.06 * (u / 8), fy: 0.45 }; }
const SLAB = { x: 96, y: 250, w: 900, h: 560 };
function slabRect(u) {
  const k = springU(u, -1.25, SPRING.gentle);                 // already travelling on frame 0
  const open = E.inOutCubic(prog(u, 7.4, 8));
  const x0 = lerp(-SLAB.w - 80, SLAB.x, k);
  return {
    x: lerp(x0, 0, open), y: lerp(SLAB.y, 0, open), w: lerp(SLAB.w, W, open), h: lerp(SLAB.h, H, open),
    r: lerp(34, 0, open), open,
  };
}
function sceneHook(ctx, u) {
  const cam = camS1(u);
  photo(ctx, 'arrows23', cam);
  wash(ctx, 0.35, 'left', 0.0);
  const s = slabRect(u);
  glass(ctx, s.x, s.y, s.w, s.h, s.r, backOf(ctx, 'arrows23', cam), { sweep: prog(u, 5.4, 6.8), tint: `rgba(22,34,44,${lerp(0.55, 0.5, s.open)})` });
  const x = s.x + 70, ex = 7.0;
  kicker(ctx, 'FOR AIRSHOW ORGANISERS', x, s.y + 118, u, -0.6, { exit: ex, color: C.tealSoft, size: 30 });
  rise(ctx, "LET'S WORK", x - 4, s.y + 280, 158, 800, D, C.white, u, -0.25, { stagger: 0.035, exit: ex + 0.05 });
  rise(ctx, 'TOGETHER.', x - 4, s.y + 420, 158, 800, D, C.teal, u, 1.3, { stagger: 0.035, exit: ex + 0.1 });
  line(ctx, 'Free promotion and accurate visitor information', x, s.y + 488, 32, 500, UI, 'rgba(255,255,255,0.92)', u, 2.9, { exit: ex });
  // the slab opening is the hand-off: as it fills the frame it becomes shot 2's backdrop
}

// ------------------------------------------------------------------ S2 one guide (u 8..16)
function camS2(u) { return { z: logzoom(1.16, 1.24, (u - 8) / 8), fx: 0.56, fy: 0.45 }; }
function sceneGuide(ctx, u) {
  const cam = camS2(u);
  photo(ctx, 'arrows23', cam, true);
  wash(ctx, 0.5);
  // left column copy
  const x = 96;
  kicker(ctx, 'THE BIG GUIDE TO UK AIRSHOWS', x, 255, u, 7.85, { color: C.tealSoft });
  rise(ctx, 'EVERY UK', x - 3, 390, 124, 800, D, C.white, u, 8.0, { stagger: 0.03 });
  rise(ctx, 'AIRSHOW.', x - 3, 508, 124, 800, D, C.white, u, 8.55, { stagger: 0.03 });
  rise(ctx, 'ONE GUIDE.', x - 3, 626, 124, 800, D, C.teal, u, 9.3, { stagger: 0.03 });
  line(ctx, 'The guide sends well prepared', x, 716, 38, 500, UI, C.white, u, 10.8);
  line(ctx, 'visitors to your show.', x, 766, 38, 500, UI, C.white, u, 10.95);
  // browser panel with the real home page
  const k = springU(u, 7.7, SPRING.gentle);
  const push = springU(u, 12, SPRING.gentle);
  const pw = 960 + 50 * push, ph = 600 + 46 + 31 * push;
  const px = 840 - 40 * push, py = lerp(H + 60, 205 - 20 * push, k);
  const back = backOf(ctx, 'arrows23', cam, 0.5);
  glass(ctx, px - 18, py - 18, pw + 36, ph + 36, 30, back, { sweep: prog(u, 13.2, 14.6) });
  ctx.save();
  rrect(ctx, px, py, pw, ph, 16); ctx.clip();
  ctx.fillStyle = 'rgba(244,247,250,0.94)'; ctx.fillRect(px, py, pw, 46);
  ['#D7E3EA', '#D7E3EA', '#D7E3EA'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(px + 20 + i * 22, py + 17, 12, 12); });
  rrect(ctx, px + 110, py + 10, 420, 26, 13); ctx.fillStyle = '#E8EEF2'; ctx.fill();
  text(ctx, 'ukairshowguide.co.uk', px + 128, py + 30, font(17, 500, UI), '#4E5D68');
  if (IM.home) cover(ctx, IM.home, px, py + 46, pw, ph - 46, { fx: 0.15, fy: 0.45, zoom: logzoom(1, 1.12, prog(u, 12, 16)) });
  ctx.restore();
  // a real fact from the Find Your Airshow page
  const tk = springU(u, 12.8, SPRING.bouncy);
  if (tk > 0.002) {
    const tw = 430, th = 92, tx = px + pw - tw + 40, ty = py + ph - 40;
    ctx.save(); ctx.translate(tx + tw / 2, ty + th / 2); ctx.scale(lerp(0.6, 1, tk), lerp(0.6, 1, tk)); ctx.translate(-(tx + tw / 2), -(ty + th / 2));
    ctx.globalAlpha = clamp(tk * 1.5);
    glass(ctx, tx, ty, tw, th, 46, back, { tint: 'rgba(22,34,44,0.62)' });
    text(ctx, '13', tx + 36, ty + 66, font(58, 800, D), C.teal);
    text(ctx, 'featured shows for 2027', tx + 108, ty + 58, font(30, 600, UI), C.white);
    ctx.restore();
  }
}

// ------------------------------------------------------------------ S3 prepared visitors (u 16..24)
function camS3(u) { return { z: logzoom(1.05, 1.16, (u - 15) / 9), fx: 0.25, fy: 0.5 }; }
function icon(ctx, kind, cx, cy, s, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = s * 0.09; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
  if (kind === 'park') {
    rrect(ctx, cx - s / 2, cy - s / 2, s, s, s * 0.22); ctx.stroke();
    ctx.font = font(s * 0.72, 800, D); ctx.textAlign = 'center'; ctx.fillText('P', cx, cy + s * 0.25);
  } else if (kind === 'clock') {
    ctx.beginPath(); ctx.arc(cx, cy, s / 2, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.3); ctx.lineTo(cx, cy); ctx.lineTo(cx + s * 0.22, cy + s * 0.12); ctx.stroke();
  } else {
    rrect(ctx, cx - s / 2, cy - s * 0.28, s, s * 0.78, s * 0.14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s * 0.2, cy - s * 0.28); ctx.lineTo(cx - s * 0.2, cy - s * 0.46); ctx.lineTo(cx + s * 0.2, cy - s * 0.46); ctx.lineTo(cx + s * 0.2, cy - s * 0.28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s / 2, cy + s * 0.06); ctx.lineTo(cx + s / 2, cy + s * 0.06); ctx.stroke();
  }
  ctx.restore();
}
const CHIPS = [['park', 'Where to park', 16], ['clock', 'What time to arrive', 18], ['bag', 'What to bring', 20]];
function sceneVisitors(ctx, u) {
  const cam = camS3(u);
  photo(ctx, 'family', cam);
  wash(ctx, 0.0, 'left', 0.55);
  wash(ctx, 0.55, 'bottom', 0);
  const back = backOf(ctx, 'family', cam);
  const lift = E.inBack(prog(u, 22.6, 23.4), 1.3);
  kicker(ctx, 'VISITORS WHO KNOW', 1150, 180, u, 15.9, { exit: 22.6, color: C.tealSoft, size: 30 });
  CHIPS.forEach(([ic, label, b], i) => {
    const k = springU(u, b - 0.25, SPRING.bouncy);
    if (k <= 0.002) return;
    const w = 640, h = 118, x = 1150 + (1 - k) * 700, y = 222 + i * 146 - lift * (700 + i * 120);
    glass(ctx, x, y, w, h, 28, back, { tint: 'rgba(22,34,44,0.5)', sweep: prog(u, b + 0.1, b + 1.2) });
    icon(ctx, ic, x + 70, y + h / 2, 52, C.teal);
    text(ctx, label, x + 128, y + 76, font(50, 600, UI), C.white);
  });
  rise(ctx, 'CALMER GATES.', 96, 860, 122, 800, D, C.white, u, 21.75, { stagger: 0.025 });
  rise(ctx, 'HAPPIER CROWDS.', 96, 975, 122, 800, D, C.teal, u, 22.1, { stagger: 0.025 });
}

// ------------------------------------------------------------------ S4 how it works (u 24..40)
const STEPS = [
  { n: '01', t: 'GET IN TOUCH', b: 'Send me the name of your show and the best person to speak to.', img: 'org', src: [120, 380, 900, 440] },
  { n: '02', t: 'I CHECK THE DETAILS', b: 'We go through your visitor information so it is all correct.', img: 'cosford', src: [800, 240, 600, 294] },
  { n: '03', t: 'YOUR PAGE GOES LIVE', b: 'A full planning page in the same style as the rest of the guide.', img: 'eastbourne', fy: 0.25 },
  { n: '04', t: 'I KEEP IT UPDATED', b: 'New aircraft, timings and travel news through the season.', img: 'calendar', fy: 0.5 },
];
const CARD = { w: 720, h: 640, gap: 70 };
function camS4(u) { return { z: 1.18, fx: clamp(0.15 + 0.7 * (u - 23) / 17), fy: 0.4 }; }
function trackPos(u) {     // which card is centred, as a continuous index
  return springKeys(u, [[0, -1.6], [23.55, 0], [27.75, 1], [31.75, 2], [35.75, 3]], SPRING.gentle);
}
function sceneSteps(ctx, u) {
  const cam = camS4(u);
  ctx.save();
  // push-through into the next scene
  const pt = E.inExpo(prog(u, 39.1, 40));
  zoomAbout(ctx, logzoom(1, 3.2, pt), W / 2, 560);
  photo(ctx, 'arrows18', cam);
  wash(ctx, 0.5);
  wash(ctx, 0.35, 'top', 0);
  const back = backOf(ctx, 'arrows18', cam, 0.5);
  kicker(ctx, 'FOUR SIMPLE STEPS, ALL FREE', 96, 110, u, 23.9, { color: C.tealSoft });
  rise(ctx, 'HOW IT WORKS', 93, 200, 100, 800, D, C.white, u, 24.05, { stagger: 0.025 });
  const pos = trackPos(u);
  const pitch = CARD.w + CARD.gap;
  // progress rail with numbered nodes
  const railY = 975;
  const x0 = W / 2 - pos * pitch;
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(x0, railY - 2, pitch * 3, 4);
  ctx.fillStyle = C.teal;
  ctx.fillRect(x0, railY - 3, pitch * clamp(pos, 0, 3), 6);
  STEPS.forEach((s, i) => {
    const cx = x0 + i * pitch;
    const on = clamp(1 - Math.abs(pos - i));
    { const r = lerp(9, 14, on); ctx.fillStyle = pos >= i - 0.05 ? C.teal : 'rgba(255,255,255,0.5)'; ctx.fillRect(cx - r, railY - r, 2 * r, 2 * r); }
    // card
    const sc = lerp(0.86, 1, on);
    const w = CARD.w * sc, h = CARD.h * sc, x = cx - w / 2, y = 560 - h / 2 + 30;
    glass(ctx, x, y, w, h, 30 * sc, back, { tint: `rgba(22,34,44,${lerp(0.62, 0.45, on)})`, sweep: prog(u, 24.6 + i * 4, 25.9 + i * 4) });
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    const iw = CARD.w - 48, ih = 330;
    ctx.save(); rrect(ctx, 24, 24, iw, ih, 18); ctx.clip();
    const img = IM[s.img];
    if (img) { if (s.src) crop(ctx, img, s.src, 24, 24, iw, ih); else cover(ctx, img, 24, 24, iw, ih, { fx: 0.3, fy: s.fy, zoom: logzoom(1, 1.1, prog(u, 23 + i * 4, 31 + i * 4)) }); }
    ctx.restore();
    rrect(ctx, 24, 24, iw, ih, 18); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    text(ctx, s.n, 40, 450, font(84, 800, D), C.teal);
    text(ctx, s.t, 150, 446, font(56, 800, D), C.white);
    wrap(ctx, s.b, font(34, 500, UI), CARD.w - 70).forEach((l, j) => text(ctx, l, 42, 514 + j * 44, font(34, 500, UI), 'rgba(255,255,255,0.95)'));
    ctx.fillStyle = `rgba(16,24,30,${0.45 * (1 - on)})`; rrect(ctx, 0, 0, CARD.w, CARD.h, 30); ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

// ------------------------------------------------------------------ S5 what you get (u 40..56)
const TILES = [
  ['FREE PROMOTION', 'Your show on the guide and across my YouTube, Facebook and Instagram, at no cost.'],
  ['ACCURATE VISITOR INFO', 'Parking, transport, accessibility and timings checked against your official site.'],
  ['LINE UP UPDATES', 'Confirmed aircraft added with a clear Updated tag.'],
  ['PHOTO AND VIDEO COVERAGE', 'Volunteer photographers cover your show, and you keep full use with credit.'],
  ['LOCAL BUSINESSES', 'Visitors pointed to nearby food, campsites and places to stay.'],
  ['FEWER REPEAT QUESTIONS', 'Visitors who have planned ask your team a lot less on the day.'],
];
function camS5(u) { return { z: logzoom(1.32, 1.08, springU(u, 39.8, SPRING.gentle)) * logzoom(1, 1.05, (u - 41) / 15), fx: 0.35, fy: 0.42 }; }
const GRID = { x: 548, y: 270, w: 404, h: 330, gx: 22, gy: 22 };
function sceneBenefits(ctx, u) {
  const cam = camS5(u);
  photo(ctx, 'typhoon', cam);
  wash(ctx, 0.6, 'left', 0.25);
  const back = backOf(ctx, 'typhoon', cam, 0.25);
  const open = springU(u, 51.85, SPRING.gentle);           // Free Promotion opens up
  const others = E.inCubic(prog(u, 51.8, 52.4));
  const ex = 52;
  kicker(ctx, 'ALL FREE', 96, 330, u, 39.9, { exit: ex, color: C.tealSoft, size: 30 });
  rise(ctx, 'WHAT', 93, 470, 140, 800, D, C.white, u, 40.1, { exit: ex });
  rise(ctx, 'YOU GET', 93, 600, 140, 800, D, C.teal, u, 40.35, { exit: ex + 0.05 });
  TILES.forEach(([t, b], i) => {
    const k = springU(u, 40 + i * 2 - 0.25, SPRING.bouncy);
    if (k <= 0.002) return;
    const col = i % 3, row = (i / 3) | 0;
    let x = GRID.x + col * (GRID.w + GRID.gx), y = GRID.y + row * (GRID.h + GRID.gy), w = GRID.w, h = GRID.h;
    y += (1 - k) * 160;
    let a = clamp(k * 1.4);
    if (i === 0) {          // opens into the big Free Promotion panel
      x = lerp(x, 260, open); y = lerp(y, 230, open); w = lerp(w, 1400, open); h = lerp(h, 640, open);
    } else {
      a *= 1 - others;
      const sc = 1 - 0.15 * others;
      x += (w * (1 - sc)) / 2; y += (h * (1 - sc)) / 2 + others * 60; w *= sc; h *= sc;
    }
    if (a <= 0.002) return;
    ctx.save(); ctx.globalAlpha = a;
    glass(ctx, x, y, w, h, 26, back, { tint: 'rgba(22,34,44,0.55)', sweep: prog(u, 40 + i * 2, 41.2 + i * 2) });
    ctx.globalAlpha = a * (i === 0 ? 1 - clamp(open * 3) : 1);
    ctx.fillStyle = C.teal; ctx.fillRect(x + 30, y + 30, 54, 6);
    const tl = wrap(ctx, t, font(46, 800, D), w - 60);
    tl.forEach((l, j) => text(ctx, l, x + 30, y + 92 + j * 46, font(46, 800, D), C.white));
    const by = y + 142 + (tl.length - 1) * 46;
    wrap(ctx, b, font(30, 500, UI), w - 56).forEach((l, j) => text(ctx, l, x + 30, by + j * 38, font(30, 500, UI), 'rgba(255,255,255,0.95)'));
    ctx.restore();
  });
  if (open > 0.05) {
    const px = 260, py = 230;
    kicker(ctx, 'FREE PROMOTION', px + 80, py + 120, u, 52.2, { color: C.tealSoft, size: 30 });
    rise(ctx, 'YOUR SHOW, SHARED WITH', px + 76, py + 245, 104, 800, D, C.white, u, 52.3, { stagger: 0.015 });
    rise(ctx, 'EVERY VISITOR I REACH', px + 76, py + 350, 104, 800, D, C.white, u, 52.5, { stagger: 0.015 });
    [['YouTube', 53], ['Facebook', 53.5], ['Instagram', 54]].forEach(([nm, b], j) => {
      const k = springU(u, b - 0.2, SPRING.bouncy);
      if (k <= 0.002) return;
      const pw = 300, ph = 92, x = px + 80 + j * (pw + 28), y = py + 420 + (1 - k) * 60;
      ctx.save(); ctx.globalAlpha = clamp(k * 1.4);
      glass(ctx, x, y, pw, ph, 46, back, { tint: 'rgba(50,180,175,0.28)', rim: 'rgba(159,216,213,0.9)', rimW: 2 });
      text(ctx, nm, x + pw / 2, y + 61, font(42, 600, UI), C.white, 'center');
      ctx.restore();
    });
    line(ctx, 'And on the guide itself, at no cost.', px + 80, py + 590, 34, 500, UI, C.tealSoft, u, 54.5);
  }
}

// ------------------------------------------------------------------ S6 join together (u 56..64)
const ROW1 = ['RIAT', 'RAF Cosford', 'Eastbourne', '*', 'Duxford', 'Shuttleworth', 'Blackpool'];
const ROW2 = ['Southport', 'Ayr', 'Little Gransden', 'Headcorn', 'Clacton', 'Wales', 'Midlands'];
function camS6(u) { return { z: logzoom(1.08, 1.2, (u - 55) / 9), fx: 0.5, fy: 0.55 }; }
let PILLS = null;
function pillLayout(ctx) {
  if (PILLS) return PILLS;
  const f = font(33, 600, UI), pad = 28, gap = 16, h = 78;
  const rows = [ROW1, ROW2].map((row, r) => {
    const ws = row.map((n) => (n === '*' ? 360 : (ctx.font = f, ctx.measureText(n).width + pad * 2)));
    const total = ws.reduce((a, b) => a + b, 0) + gap * (row.length - 1);
    let x = (W - total) / 2;
    return row.map((n, i) => { const p = { n, x, w: ws[i], y: r === 0 ? 520 : 630, h, r, i }; x += ws[i] + gap; return p; });
  });
  PILLS = rows.flat();
  return PILLS;
}
const END = { x: 340, y: 150, w: 1240, h: 780 };
function slotRect(p, u) {
  const m = springU(u, 63.1, SPRING.snappy);
  return { x: lerp(p.x, END.x, m), y: lerp(p.y, END.y, m), w: lerp(p.w, END.w, m), h: lerp(p.h, END.h, m), r: lerp(41, 40, m), m };
}
function sceneJoin(ctx, u) {
  const cam = camS6(u);
  photo(ctx, 'crowd', cam);
  wash(ctx, 0.75, 'top', 0.25);
  wash(ctx, 0.45, 'bottom', 0);
  const back = backOf(ctx, 'crowd', cam, 0.3);
  const ex = 63.3;
  kicker(ctx, 'JOIN TOGETHER', 96, 130, u, 55.55, { exit: ex, color: C.tealSoft, size: 30 });
  rise(ctx, 'SHARE EVERYTHING YOUR', 93, 250, 104, 800, D, C.white, u, 55.7, { stagger: 0.015, exit: ex });
  rise(ctx, 'VISITORS NEED.', 93, 360, 104, 800, D, C.teal, u, 56.15, { stagger: 0.02, exit: ex + 0.05 });
  line(ctx, 'ALREADY ON THE GUIDE', W / 2, 488, 26, 600, UI, 'rgba(255,255,255,0.85)', u, 57, { align: 'center', track: 0.18, exit: ex });
  const pills = pillLayout(ctx);
  const gone = E.inCubic(prog(u, 63.2, 63.8));
  let slot = null;
  pills.forEach((p) => {
    if (p.n === '*') { slot = p; return; }
    const dir = p.r === 0 ? -1 : 1;
    const k = springU(u, 56.6 + p.i * 0.18 + p.r * 0.3, SPRING.snappy);
    if (k <= 0.002) return;
    const drift = 22 * Math.sin((u - 56) * 0.35) * dir;
    const x = p.x + (1 - k) * dir * 1100 + drift;
    ctx.save(); ctx.globalAlpha = clamp(k * 1.5) * (1 - gone);
    glass(ctx, x, p.y + gone * 40, p.w, p.h, 41, back, { tint: 'rgba(22,34,44,0.55)', shadow: 24 });
    text(ctx, p.n, x + p.w / 2, p.y + gone * 40 + 51, font(33, 600, UI), C.white, 'center');
    ctx.restore();
  });
  // the empty slot: dashed outline from b58, filled glass "YOUR SHOW HERE" on b60
  const sdrift = 22 * Math.sin((u - 56) * 0.35) * -1;
  slot = { ...slot, x: slot.x + sdrift };
  const sk = springU(u, 59.75, SPRING.bouncy);
  const dk = clamp(prog(u, 57.6, 58.4));
  if (dk > 0 && sk < 0.5) {
    ctx.save(); ctx.globalAlpha = dk * (1 - sk * 2); ctx.setLineDash([10, 9]); ctx.lineWidth = 2.5; ctx.strokeStyle = C.tealSoft;
    rrect(ctx, slot.x, slot.y, slot.w, slot.h, 41); ctx.stroke(); ctx.restore();
  }
  if (sk > 0.002) {
    const s = slotRect(slot, u);
    const sc = s.m > 0.01 ? 1 : lerp(0.5, 1, sk);
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    const mt = E.inOutCubic(clamp(s.m));
    const tint = s.m > 0.01 ? `rgba(${Math.round(lerp(50, 250, mt))},${Math.round(lerp(180, 251, mt))},${Math.round(lerp(175, 251, mt))},${lerp(0.35, 0.62, mt)})` : 'rgba(50,180,175,0.35)';
    glass(ctx, s.x, s.y, s.w, s.h, s.r, back, { tint, sheen: lerp(0.2, 0.35, mt), rim: s.m > 0.5 ? undefined : C.tealSoft, rimW: 2.5, sweep: prog(u, 60.2, 61.4) });
    ctx.globalAlpha = 1 - clamp(s.m * 4);
    text(ctx, 'YOUR SHOW HERE', cx, s.y + 54, font(38, 800, D), C.white, 'center', 1);
    ctx.restore();
  }
  const tk = springU(u, 61.75, SPRING.snappy) * (1 - E.inCubic(prog(u, ex, ex + 0.4)));
  if (tk > 0.002) {
    ctx.save(); ctx.globalAlpha = clamp(tk * 1.4);
    const ty = 800 + (1 - tk) * 40;
    glass(ctx, 300, ty, W - 600, 96, 48, back, { tint: 'rgba(22,34,44,0.7)', shadow: 24 });
    text(ctx, 'Your logos, photos and videos are only used with your permission.', W / 2, ty + 60, font(36, 500, UI), C.white, 'center');
    ctx.restore();
  }
}

// ------------------------------------------------------------------ S7 end card (u 64..72)
function camS7(u) { return { z: logzoom(1.06, 1.18, (u - 63) / 9), fx: 0.5, fy: 0.45 }; }
function sceneEnd(ctx, u) {
  const cam = camS7(u);
  photo(ctx, 'cosford23', cam);
  wash(ctx, 0.15);
  const back = backOf(ctx, 'cosford23', cam);
  const { x, y, w, h } = END;
  glass(ctx, x, y, w, h, 40, back, { tint: 'rgba(250,251,251,0.62)', sheen: 0.35, sweep: prog(u, 68.8, 70.4) });
  const cx = x + w / 2;
  // logo lands with weight
  const lk = springU(u, 63.85, SPRING.bouncy);
  if (lk > 0.002 && IM.logo) {
    const lw = 760, lh = lw * IM.logo.height / IM.logo.width;
    const q = 0.03 * wobble(u - 64, 2.2, 4);
    ctx.save(); ctx.globalAlpha = clamp(lk * 1.4);
    ctx.translate(cx, y + 70 + lh); ctx.scale((0.86 + 0.14 * lk) * (1 + q), (0.86 + 0.14 * lk) * (1 - q)); ctx.translate(-cx, -(y + 70 + lh));
    ctx.drawImage(IM.logo, cx - lw / 2, y + 70 - (1 - lk) * 60, lw, lh);
    ctx.restore();
  }
  rise(ctx, 'TALK TO ME ABOUT YOUR SHOW', cx, y + 420, 74, 800, D, C.navy, u, 64.75, { align: 'center', stagger: 0.018 });
  // URL types on inside a navy pill
  const pk = springU(u, 65.75, SPRING.snappy);
  if (pk > 0.002) {
    const url = 'ukairshowguide.co.uk';
    const n = Math.floor(clamp(prog(u, 66, 67.7)) * url.length + 0.0001);
    const f = font(64, 800, D);
    const full = layout(ctx, url, f).width;
    const pw = full + 110, ph = 108, px = cx - pw / 2, py = y + 470;
    ctx.save(); ctx.globalAlpha = clamp(pk * 1.3);
    rrect(ctx, px, py + (1 - pk) * 30, pw * lerp(0.3, 1, pk) , ph, 54);
    ctx.fillStyle = C.navy; ctx.fill();
    text(ctx, url.slice(0, n), px + 55, py + 77, f, C.white);
    if (u < 68.5 && Math.floor(u * 2) % 2 === 0) { const cw = layout(ctx, url.slice(0, n) || ' ', f).width; ctx.fillStyle = C.teal; ctx.fillRect(px + 58 + (n ? cw : 0), py + 26, 5, 58); }
    ctx.restore();
  }
  line(ctx, 'Free to join  ·  Free promotion  ·  Accurate visitor info', cx, y + 680, 36, 600, UI, C.navy2, u, 67.8, { align: 'center' });
  ctx.fillStyle = C.teal;
  const bar = E.outCubic(prog(u, 67.9, 68.8));
  ctx.fillRect(cx - 120 * bar, y + 712, 240 * bar, 5);
}

// ------------------------------------------------------------------ edit
function whipX(ctx, u, a, b, drawA, drawB, dir = -1) {
  const p = E.inOutCubic(prog(u, a, b));
  ctx.save(); ctx.translate(dir * W * p, 0); drawA(ctx, u); ctx.restore();
  ctx.save(); ctx.translate(dir * W * (p - 1), 0); drawB(ctx, u); ctx.restore();
}
function whipY(ctx, u, a, b, drawA, drawB) {
  const p = E.inOutCubic(prog(u, a, b));
  ctx.save(); ctx.translate(0, -H * p); drawA(ctx, u); ctx.restore();
  ctx.save(); ctx.translate(0, H * (1 - p)); drawB(ctx, u); ctx.restore();
}

M.film({
  fonts: [font(100, 800, D), font(100, 700, D), font(40, 500, UI), font(40, 600, UI)],
  images: {
    arrows23: 'assets/img/arrows23.jpg', arrows18: 'assets/img/arrows18.jpg', family: 'assets/img/family.jpg',
    typhoon: 'assets/img/typhoon.jpg', crowd: 'assets/img/crowd.jpg', cosford23: 'assets/img/cosford23.jpg',
    home: 'assets/shots/home_top.png', org: 'assets/shots/home_organisers.png', cosford: 'assets/shots/cosford_top.png',
    eastbourne: 'assets/shots/eastbourne_top.png', calendar: 'assets/shots/calendar_top.png', logo: 'assets/logo.png',
  },
  hits: HITS,
  samples: 8,
  init(ctx, IMG) {
    IM = IMG;
    for (const k of IMGS) {      // frosted copies: quarter size, blurred, edges padded
      const img = IMG[k]; if (!img) continue;
      const w = Math.round(img.width / 4), h = Math.round(img.height / 4), p = 24;
      const a = document.createElement('canvas'); a.width = w; a.height = h;
      a.getContext('2d').drawImage(img, 0, 0, w, h);
      const b = document.createElement('canvas'); b.width = w; b.height = h;
      const bc = b.getContext('2d'); bc.filter = 'blur(9px) saturate(1.15)';
      bc.drawImage(a, -p, -p, w + 2 * p, h + 2 * p);
      BL[k] = b;
    }
    const rnd = mulberry32(77);
    NOISE = [0, 1, 2, 3].map(() => {
      const c = document.createElement('canvas'); c.width = 960; c.height = 540;
      const g = c.getContext('2d'); const id = g.createImageData(960, 540);
      for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (rnd() - 0.5) * 180; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
      g.putImageData(id, 0, 0); return c;
    });
  },
  draw(ctx, u) {
    if (u < 8) sceneHook(ctx, u);
    else if (u < 15.5) sceneGuide(ctx, u);
    else if (u < 16.15) whipX(ctx, u, 15.5, 16.1, sceneGuide, sceneVisitors);
    else if (u < 23.5) sceneVisitors(ctx, u);
    else if (u < 24) {                 // a glass bar wipes left to right, revealing the steps
      const p = E.inOutCubic(prog(u, 23.5, 24));
      const bx = lerp(-260, W + 40, p);
      sceneVisitors(ctx, u);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, bx, H); ctx.clip(); sceneSteps(ctx, u); ctx.restore();
      const cam = camS3(u);
      glass(ctx, bx - 110, -40, 220, H + 80, 0, backOf(ctx, 'family', cam), { tint: 'rgba(50,180,175,0.22)', shadow: 30 });
    }
    else if (u < 40) sceneSteps(ctx, u);
    else if (u < 55.6) sceneBenefits(ctx, u);
    else if (u < 56.15) whipY(ctx, u, 55.6, 56.1, sceneBenefits, sceneJoin);
    else if (u < 64) sceneJoin(ctx, u);
    else sceneEnd(ctx, u);
  },
  post(ctx, u, t) {
    // vignette + film grain (after the motion-blur average, so the grain stays crisp)
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(4,10,16,0.42)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (NOISE.length) {
      const i = Math.floor(t * 24) % 4;
      ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.09;
      ctx.drawImage(NOISE[i], 0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
  },
});
