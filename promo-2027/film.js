// Plan your 2027 airshow season: pure function of time. window.seek(t) paints frame t (see lib/motion.js).
// Timing is in beats (u) on the measured grid (132 bpm, 44 beats); docs/shotlist.md is the plan.
import * as M from './lib/motion.js';

const { W, H, FORMAT, E, prog, lerp, clamp, springU, springKeys, SPRING, wobble, font, layout, glyph, text, fill, rrect, fitSize } = M;

// Brand tokens from assets/brand.json (the site's own CSS variables). Mint is the one accent;
// red and teal only appear inside the brand's own art (Red Hawk, logo swoosh, the red CTA button).
const C = { navy: '#13293C', deep: '#0E2131', mint: '#5FE3D6', white: '#FFFFFF', soft: '#C9D6E0', red: '#D74949', teal: '#32B4AF' };
const DISPLAY = 'Display', UI = 'UI';
const s = FORMAT.safe;
const P = FORMAT.portrait, SQ = FORMAT.square, L = FORMAT.landscape;

// Source rects (2x screenshot pixels) of the real pages, checked against the gathered shots.
const R = {
  cal: [1906, 170, 684, 1020],          // "The season at a glance" panel, uk-airshow-calendar.html
  map: [272, 600, 1348, 1200],          // UK airshow map, airshow-map.html
  dot: [983, 1631],                     // the red featured-show dots (Midlands / Cosford cluster)
  travel: [1683, 232, 921, 1030],       // "Plan your journey" card, public-transport.html
  camp: [740, 190, 1400, 680],          // camping-hub.html hero headline
  photo: [800, 140, 1300, 1220],        // photography-hub.html hero (Tornado + headline + settings bar)
  runway: [0, 960, 2880, 840],          // find-your-airshow.html May -> October runway
};

// Every visual accent: [beat, label, sfx, opts]. sfx.mjs voices each one.
const HITS = [
  [0, 'hook: EVERY UK AIRSHOW', 'impact'],
  [2, 'ONE EASY GUIDE lands', 'thud'],
  [7, 'Red Hawk crosses', 'whoosh', { len: 1.1, from: 300, to: 2600 }],
  [8, 'smoke wipe completes, the drop', 'impact'],
  [8.5, 'counter', 'tick'], [9, 'counter', 'tick'], [9.5, 'counter', 'tick'],
  [10, '46 shows confirmed', 'bell', { pitch: 'D6' }],
  [12, 'whip to the map', 'whoosh', { len: 0.4, from: 600, to: 2400 }],
  [14, 'ring on the featured shows', 'pop', { pitch: 'A5' }],
  [16, 'whip up to travel', 'whoosh', { len: 0.4, from: 2400, to: 600, pan: 0.2 }],
  [17, 'journey card lands', 'thud'],
  [20, 'cut to camping', 'thud'],
  [20.25, 'mint bar', 'click'],
  [24, 'split to photography', 'whoosh', { len: 0.5, from: 500, to: 2000 }],
  [26, 'zoom to the settings bar', 'click'],
  [28, 'push through to the season', 'whoosh', { len: 0.5, from: 600, to: 3000 }],
  [32, 'MAY', 'thud'], [33, 'TO', 'thud'], [34, 'OCTOBER', 'thud'], [35, '2027', 'thud'],
  [36, 'end card', 'impact'],
  [36, 'logo', 'bell', { pitch: 'D6' }],
  [36.6, 'Red Hawk passes', 'whoosh', { len: 0.8, from: 400, to: 2800 }],
  [38, 'stop by stop', 'pop', { pitch: 'A5' }],
  [39, 'start planning', 'pop', { pitch: 'D6' }],
];

// ---------------------------------------------------------------- helpers

// Draw source rect r of img cover-fitted into a box; returns a mapper from source px to screen.
function place(ctx, img, r, x, y, w, h, { fx = 0.5, fy = 0.5, zoom = 1, radius = 0 } = {}) {
  const [rx, ry, rw, rh] = r || [0, 0, img.width, img.height];
  const k = Math.max(w / rw, h / rh) * zoom;
  const dw = rw * k, dh = rh * k;
  const ox = x + (w - dw) * fx, oy = y + (h - dh) * fy;
  ctx.save();
  if (radius) rrect(ctx, x, y, w, h, radius); else { ctx.beginPath(); ctx.rect(x, y, w, h); }
  ctx.clip();
  ctx.drawImage(img, rx, ry, rw, rh, ox, oy, dw, dh);
  ctx.restore();
  return (px, py) => [ox + (px - rx) * k, oy + (py - ry) * k];
}
// A screenshot card: soft drop shadow, rounded, real pixels only.
function card(ctx, img, r, x, y, w, h, opts = {}) {
  const rad = opts.radius ?? 18;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  rrect(ctx, x, y, w, h, rad); ctx.fillStyle = C.deep; ctx.fill();
  ctx.restore();
  return place(ctx, img, r, x, y, w, h, { ...opts, radius: rad });
}
// Photo full-bleed (or in a box) with a log push from z0 to z1 over beats a..b.
function photo(ctx, img, a, b, u, z0, z1, { x = 0, y = 0, w = W, h = H, fx = 0.5, fy = 0.5 } = {}) {
  const p = clamp((u - a) / (b - a), 0, 1);
  return place(ctx, img, null, x, y, w, h, { fx, fy, zoom: z0 * (z1 / z0) ** p });
}
function shade(ctx, x0, y0, x1, y1, a0, a1, hold = 0, col = '14,33,49') {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, `rgba(${col},${a0})`); if (hold) g.addColorStop(hold, `rgba(${col},${a0})`); g.addColorStop(1, `rgba(${col},${a1})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// Headline: per-glyph drop with a heavy spring, one line per entry {t, c, u0}.
function headline(ctx, u, lines, x, top, size, { lh = 0.9, cfg = SPRING.bouncy, align = 'left' } = {}) {
  const f = font(size, 700, DISPLAY), track = -0.005 * size;
  lines.forEach((ln, i) => {
    const Lt = layout(ctx, ln.t, f, track);
    const base = top + size * 0.78 + i * size * lh;
    const x0 = align === 'center' ? x - Lt.width / 2 : x;
    Lt.glyphs.forEach((g, j) => {
      const k = springU(u, ln.u0 + j * 0.03, cfg);
      if (k <= 0) return;
      ctx.globalAlpha = clamp(k * 4);
      glyph(ctx, g.ch, x0 + g.cx, base - (1 - k) * size * 0.7, f, ln.c || C.white, 1, lerp(1.25, 1, clamp(k)));
      ctx.globalAlpha = 1;
    });
  });
  return top + size * 0.78 + (lines.length - 1) * size * lh;   // last baseline
}
// Kicker: a mint bar wipes in, then the label sits on it in navy.
function kicker(ctx, u, str, x, y, u0, size = FORMAT.pick({ '16x9': 30, '9x16': 34, '1x1': 30 })) {
  const f = font(size, 600, UI), track = size * 0.16;
  const Lt = layout(ctx, str, f, track);
  const pad = size * 0.55, bw = Lt.width + pad * 2, bh = size * 1.7;
  const k = E.outExpo(prog(u, u0, u0 + 0.6));
  if (k <= 0) return;
  ctx.fillStyle = C.mint; ctx.fillRect(x, y, bw * k, bh);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, bw * k, bh); ctx.clip();
  text(ctx, str, x + pad, y + bh * 0.5 + size * 0.36, f, C.deep, 'left', track);
  ctx.restore();
}
// The site's own arrow, drawn (the brand faces have no arrow glyph).
function arrow(ctx, x, y, len, col, lw) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y);
  ctx.moveTo(x + len - len * 0.42, y - len * 0.42); ctx.lineTo(x + len, y); ctx.lineTo(x + len - len * 0.42, y + len * 0.42);
  ctx.stroke(); ctx.restore();
}
function hawk(ctx, IMG, x, y, w, rot = 0) {
  const h = w * (116 / 400);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.drawImage(IMG.hawk, -w, -h / 2, w, h);   // (x, y) is the nose
  ctx.restore();
}

// ---------------------------------------------------------------- S1 hook   (u 0..8)
function sHook(ctx, u, IMG) {
  photo(ctx, IMG.hero, -0.5, 8, u, 1.06, 1.22, { fx: lerp(0.42, 0.58, prog(u, 0, 8)), fy: 0.45 });
  if (P) shade(ctx, 0, 0, 0, H * 0.72, 0.94, 0, 0.5);
  else shade(ctx, 0, H, 0, H * 0.25, 0.94, 0, 0.42);
  const lines = P
    ? [{ t: 'EVERY UK', u0: -0.3 }, { t: 'AIRSHOW,', u0: -0.15 }, { t: 'ONE EASY', u0: 2, c: C.mint }, { t: 'GUIDE', u0: 2.15, c: C.mint }]
    : [{ t: 'EVERY UK AIRSHOW,', u0: -0.3 }, { t: 'ONE EASY GUIDE', u0: 2, c: C.mint }];
  const size = P ? fitSize(ctx, 'AIRSHOW,', 700, DISPLAY, s.w, 280)
    : fitSize(ctx, 'EVERY UK AIRSHOW,', 700, DISPLAY, SQ ? s.w : s.w * 0.72, 260);
  const top = P ? s.y + 10 : s.y + s.h - size * 1.72;
  headline(ctx, u, lines, s.x, top, size, { lh: 0.88 });
}

// ---------------------------------------------------------------- S2 Red Hawk smoke wipe (u 5.6..8)
// The jet leads a bow-shaped edge; everything behind it (left) is already the next shot.
const WIPE = { a: 5.6, b: 8.0 };
function wipeEdge(u) {
  const p = prog(u, WIPE.a, WIPE.b);
  const tail = u < 7.3 ? lerp(-0.4 * W, 1.0 * W, prog(u, WIPE.a, 7.3))
    : lerp(1.0 * W, 2.8 * W, E.inQuad(prog(u, 7.3, WIPE.b)));
  const hy = H * lerp(0.5, 0.4, p);
  return { tail, hy, p, x: (y) => tail - 3 * W * ((y - hy) / H) ** 2 };
}
function sWipe(ctx, u, IMG) {
  const e = wipeEdge(u);
  // next shot inside the bow
  ctx.save(); ctx.beginPath(); ctx.moveTo(-10, -10);
  for (let y = -10; y <= H + 10; y += 24) ctx.lineTo(Math.max(-10, e.x(y)), y);
  ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip();
  sDates(ctx, u, IMG);
  ctx.restore();
  // smoke: the logo's red and teal swoosh colours, trailing along the bow
  for (const [off, col, lw] of [[0, C.red, P ? 30 : 34], [-(P ? 46 : 54), C.teal, P ? 22 : 26]]) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
    ctx.beginPath();
    let first = true;
    for (let y = -40; y <= H + 40; y += 16) {
      const x = e.x(y) + off;
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.restore();
  }
  const hw = FORMAT.pick({ '16x9': 560, '9x16': 430, '1x1': 440 });
  if (e.tail < W + hw * 1.2) hawk(ctx, IMG, e.tail + hw * 0.98, e.hy, hw, -0.06);
}

// ---------------------------------------------------------------- S3 the dates   (u 7..12.3)
function sDates(ctx, u, IMG) {
  fill(ctx, C.deep);
  const big = FORMAT.pick({ '16x9': 400, '9x16': 380, '1x1': 300 });
  const kx = s.x, ky = P ? s.y + 10 : SQ ? s.y + 10 : s.y + 150;
  kicker(ctx, u, 'UK AIRSHOW DATES 2027', kx, ky, 8.1);
  // counter 0 -> 46, the hero stat
  const n = Math.round(46 * E.outCubic(prog(u, 7.85, 10)));
  const ck = springU(u, 7.8, SPRING.snappy);
  if (ck > 0) {
    const f = font(big, 700, DISPLAY);
    const pulse = 1 + 0.08 * wobble(u - 10, 1.6, 4) * (u >= 10 ? 1 : 0);
    ctx.save(); ctx.translate(kx, ky + 70 + big * 0.8); ctx.scale(pulse, pulse);
    ctx.globalAlpha = clamp(ck * 3);
    text(ctx, String(n), 0, (1 - ck) * 120, f, u >= 10 ? C.mint : C.white, 'left', -0.01 * big);
    ctx.restore();
  }
  const lsz = big * 0.3;
  if (P) headline(ctx, u, [{ t: 'SHOWS CONFIRMED', u0: 8.5 }], kx, ky + 70 + big * 0.86, 104);
  else headline(ctx, u, [{ t: 'SHOWS', u0: 8.5 }, { t: 'CONFIRMED', u0: 8.7 }], kx, ky + 70 + big * 0.95, lsz, { lh: 0.95 });
  // the real season panel swings up under the smoke and settles
  const k = springU(u, 7.4, SPRING.gentle);
  const [cw, chh, cx, cy] = P ? [640, 954, (W - 640) / 2 + 60, s.y + 540]
    : SQ ? [560, 835, s.x + s.w - 560, s.y + 60] : [600, 895, W * 0.6, (H - 895) / 2 + 10];
  const rot = 0.09 * (1 - k) + 0.012 * wobble(u - 7.4, 1.4, 3.5);
  ctx.save();
  ctx.translate(cx + cw / 2, cy + chh + (1 - k) * (H * 0.75)); ctx.rotate(rot); ctx.translate(-(cx + cw / 2), -(cy + chh));
  card(ctx, IMG.cal, R.cal, cx, cy, cw, chh);
  ctx.restore();
}

// ---------------------------------------------------------------- S4 the map   (u 11.7..16.3)
function sMap(ctx, u, IMG) {
  fill(ctx, C.deep);
  const size = FORMAT.pick({ '16x9': 140, '9x16': fitSize(ctx, 'FIND THE SHOWS', 700, DISPLAY, s.w, 200), '1x1': 128 });
  headline(ctx, u, [{ t: 'FIND THE SHOWS', u0: 11.8 }, { t: 'NEAR YOU', u0: 12.2, c: C.mint }],
    s.x, L ? s.y + 260 : s.y + (P ? 10 : 0), size);
  const [x, y, w, h] = P ? [s.x, s.y + 400, s.w, 960] : SQ ? [s.x, s.y + 250, s.w, 680] : [W * 0.53, s.y + 20, W * 0.47 - s.x, s.h - 40];
  const p = E.inOutSine(prog(u, 12, 16));
  const fx = (R.dot[0] - R.map[0]) / R.map[2], fy = (R.dot[1] - R.map[1]) / R.map[3];
  const map = card(ctx, IMG.map, R.map, x, y, w, h, { zoom: 1.5 ** p, fx: lerp(0.5, fx, p), fy: lerp(0.45, fy, p) });
  // a mint ring on the real featured-show dots
  const [dx, dy] = map(...R.dot);
  for (const [u0, rmax] of [[14, 150], [14.35, 95]]) {
    const q = prog(u, u0, u0 + 1.4);
    if (q <= 0 || q >= 1) continue;
    ctx.save(); ctx.beginPath(); rrect(ctx, x, y, w, h, 18); ctx.clip();
    ctx.strokeStyle = C.mint; ctx.lineWidth = 7 * (1 - q) + 1; ctx.globalAlpha = 1 - q;
    ctx.beginPath(); ctx.arc(dx, dy, 18 + rmax * E.outCubic(q), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

// ---------------------------------------------------------------- S5 travel   (u 15.7..20)
function sTravel(ctx, u, IMG) {
  photo(ctx, IMG.train, 15.7, 20, u, 1.04, 1.14, { fx: 0.4 });
  shade(ctx, 0, 0, P || SQ ? 0 : W, P || SQ ? H : 0, 0.88, 0.55);
  const size = FORMAT.pick({ '16x9': 180, '9x16': fitSize(ctx, 'LEAVE THE CAR', 700, DISPLAY, s.w, 180), '1x1': 132 });
  headline(ctx, u, [{ t: 'LEAVE THE CAR', u0: 15.9 }, { t: 'AT HOME', u0: 16.25, c: C.mint }],
    s.x, L ? s.y + 300 : s.y + (P ? 10 : 0), size);
  const k = springU(u, 17, SPRING.bouncy);
  if (k <= 0) return;
  const [cw, ch, cx, cy] = P ? [760, 850, W - s.x - 760 + 30, s.y + 420]
    : SQ ? [520, 582, s.x + s.w - 520, s.y + s.h - 582] : [740, 828, W - s.x - 740, (H - 828) / 2];
  const q = 0.05 * wobble(u - 17.35, 2.2, 6) * (u > 17.35 ? 1 : 0);
  ctx.save();
  ctx.translate((1 - k) * (W * 0.9), 0);
  ctx.translate(cx + cw / 2, cy + ch); ctx.scale(1 + q, 1 - q); ctx.rotate(-0.025 * (1 - k)); ctx.translate(-(cx + cw / 2), -(cy + ch));
  card(ctx, IMG.travel, R.travel, cx, cy, cw, ch);
  ctx.restore();
}

// ---------------------------------------------------------------- S6 camping   (u 20..24.4)
function sCamp(ctx, u, IMG) {
  photo(ctx, IMG.camp, 20, 24.4, u, 1.05, 1.18, { fy: 0.6 });
  shade(ctx, 0, 0, 0, H, 0.55, 0.75);
  kicker(ctx, u, 'CAMPING HUB', s.x, P ? s.y + 30 : s.y + 10, 19.9);
  const k = springU(u, 19.8, SPRING.snappy);
  const [cw, cx, cy] = P ? [s.w + 60, s.x - 30, H * 0.36] : SQ ? [s.w, s.x, s.y + 250] : [s.w * 0.78, s.x, s.y + 170];
  const ch = cw * (R.camp[3] / R.camp[2]);
  ctx.save(); ctx.translate(0, (1 - k) * 220); ctx.globalAlpha = clamp(k * 3);
  card(ctx, IMG.campPage, R.camp, cx, cy, cw, ch, { zoom: 1 + 0.06 * prog(u, 20.3, 24.4) });
  ctx.restore();
  // the site's own subline, set in the UI face under the card
  const sub = 'From your first tent to a full base camp';
  const fs = FORMAT.pick({ '16x9': 46, '9x16': 44, '1x1': 40 });
  const tp = E.outQuint(prog(u, 21, 21.8));
  if (tp > 0) {
    ctx.globalAlpha = tp;
    text(ctx, sub, cx + (P ? 30 : 0), cy + ch + 80 + (1 - tp) * 30, font(fs, 600, UI), C.white);
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- S7 photography   (u 23.7..28)
function sPhoto(ctx, u, IMG) {
  photo(ctx, IMG.typhoon, 23.7, 28, u, 1.05, 1.2, { fx: 0.6 });
  shade(ctx, 0, 0, 0, H, 0.6, 0.8);
  kicker(ctx, u, 'PHOTOGRAPHY HUB', s.x, P ? s.y + 10 : s.y + 10, 24.0);
  const [cw, cx, cy] = P ? [s.w + 40, s.x - 20, s.y + 400] : SQ ? [600, s.x + s.w - 600, s.y + s.h - 563] : [860, W - s.x - 860, (H - 807) / 2 + 20];
  const ch = cw * (R.photo[3] / R.photo[2]);
  const k = springU(u, 23.8, SPRING.gentle);
  const z = springKeys(u, [[24, 1], [26, 1.08]], SPRING.bouncy);   // a shutter-like nudge on 26
  const fy = 0.5;
  ctx.save(); ctx.translate(cx + cw / 2, cy + ch / 2); const sc = lerp(0.88, 1, k); ctx.scale(sc, sc); ctx.translate(-(cx + cw / 2), -(cy + ch / 2));
  card(ctx, IMG.photoPage, R.photo, cx, cy, cw, ch, { zoom: z, fy });
  ctx.restore();
  const size = FORMAT.pick({ '16x9': 150, '9x16': 130, '1x1': 104 });
  headline(ctx, u, [{ t: 'SETTINGS BY', u0: 25.6 }, { t: 'AIRCRAFT', u0: 25.85, c: C.mint }],
    s.x, P ? s.y + 120 : SQ ? s.y + 90 : s.y + 300, size);
}

// ---------------------------------------------------------------- S8 boarding pass   (u 28..32)
function sRunway(ctx, u, IMG) {
  fill(ctx, C.deep);
  const size = FORMAT.pick({ '16x9': 150, '9x16': fitSize(ctx, 'YOUR BOARDING', 700, DISPLAY, s.w, 190), '1x1': 110 });
  const lines = P ? [{ t: 'YOUR BOARDING', u0: 28 }, { t: 'PASS TO THE', u0: 28.25 }, { t: 'WHOLE SEASON', u0: 28.5, c: C.mint }]
    : [{ t: 'YOUR BOARDING PASS', u0: 28 }, { t: 'TO THE WHOLE SEASON', u0: 28.4, c: C.mint }];
  headline(ctx, u, lines, s.x, s.y + (P ? 10 : 0), size);
  const pull = 1.35 ** (1 - E.outCubic(prog(u, 28, 28.8)));
  const [y, h] = P ? [s.y + 560, 760] : SQ ? [s.y + 330, 560] : [s.y + 380, s.h - 380];
  const p = E.inOutSine(prog(u, 28, 32));
  ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.scale(pull, pull); ctx.translate(-W / 2, -(y + h / 2));
  place(ctx, IMG.find, R.runway, 0, y, W, h, { fx: lerp(0.0, 1.0, p), zoom: L ? 1.25 : 1 });
  ctx.restore();
}

// ---------------------------------------------------------------- S9 montage, one per beat (u 32..36)
const MONT = [
  { k: 'ac1', w: 'MAY', fx: [0.4, 0.62] },
  { k: 'ac2', w: 'TO', fx: [0.55, 0.42] },
  { k: 'ac3', w: 'OCTOBER', fx: [0.62, 0.48] },
  { k: 'ac4', w: '2027', fx: [0.5, 0.5], c: C.mint },
];
function sMontage(ctx, u, IMG) {
  const i = clamp(Math.floor(u - 32), 0, 3), m = MONT[i], lu = u - 32 - i;
  fill(ctx, C.deep);
  const z = 1.0 * 1.1 ** clamp(lu / 1.2);
  const fxx = lerp(m.fx[0], m.fx[1], clamp(lu / 1.2));
  if (P) place(ctx, IMG[m.k], null, 0, s.y + 330, W, H - s.y - 330, { zoom: z, fx: fxx });
  else { place(ctx, IMG[m.k], null, 0, 0, W, H, { zoom: z, fx: fxx }); shade(ctx, 0, H * 0.45, 0, H, 0, 0.85); }
  const size = Math.min(FORMAT.pick({ '16x9': 300, '9x16': 300, '1x1': 250 }), Math.floor(fitSize(ctx, 'OCTOBER', 700, DISPLAY, s.w, 400) * 0.94));
  const k = springU(u, 32 + i, SPRING.snappy);
  const f = font(size, 700, DISPLAY);
  const by = P ? s.y + size * 0.85 : H - (SQ ? 110 : 90);
  ctx.save(); ctx.translate(s.x, by); const sc = lerp(1.15, 1, k); ctx.scale(sc, sc);
  text(ctx, m.w, 0, 0, f, m.c || C.white, 'left', -0.005 * size);
  ctx.restore();
}

// ---------------------------------------------------------------- S10 end card   (u 36..44)
function sEnd(ctx, u, IMG) {
  fill(ctx, C.deep);
  // the Red Hawk passes once more; its red and teal trail retracts into the logo's swoosh
  const lw = FORMAT.pick({ '16x9': 900, '9x16': W - 80, '1x1': 760 });
  const lh = lw * (249 / 750);
  const lx = L ? s.x : (W - lw) / 2;
  const ly = P ? s.y + 90 : SQ ? s.y + 10 : (H - lh) / 2 - 20;
  const hp = prog(u, 36, 37.5);
  const hx = lerp(0.35 * W, 1.4 * W, E.outQuad(hp));
  const tailStart = lerp(-0.2 * W, W * 1.2, E.inCubic(prog(u, 37.2, 38.2)));
  const curve = (x, off) => ly + lh * 1.05 + off - lh * 0.75 * clamp(x / W, -0.3, 1.4) ** 2;   // rises to the right, like the logo's swoosh
  for (const [off, col, lwid] of [[0, C.red, 16], [26, C.teal, 12]]) {
    if (tailStart >= hx) continue;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lwid; ctx.lineCap = 'round'; ctx.beginPath();
    for (let x = tailStart, first = true; x <= Math.min(hx - 40, W + 60); x += 12) {
      const y = curve(x, off);
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.restore();
  }
  if (hp > 0 && hp < 1) hawk(ctx, IMG, hx, curve(hx, 0) - 10, FORMAT.pick({ '16x9': 360, '9x16': 300, '1x1': 300 }), -0.1);
  // logo
  const k = springU(u, 35.85, SPRING.bouncy);
  if (k > 0) {
    ctx.save(); ctx.globalAlpha = clamp(k * 3);
    ctx.translate(lx + lw / 2, ly + lh / 2); const sc = lerp(0.82, 1, k); ctx.scale(sc, sc);
    ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh);
    ctx.restore();
  }
  // the line, in the site's words
  const tx = L ? W * 0.57 : s.x + (SQ ? 30 : 0);
  const size = FORMAT.pick({ '16x9': fitSize(ctx, 'PLAN YOUR 2027', 700, DISPLAY, W - s.x - tx, 150), '9x16': fitSize(ctx, 'PLAN YOUR 2027', 700, DISPLAY, s.w, 170), '1x1': 96 });
  const ty = L ? H * 0.2 : P ? ly + lh + 110 : ly + lh + 60;
  const lines = (P || L) ? [{ t: 'PLAN YOUR 2027', u0: 37.9 }, { t: 'AIRSHOW,', u0: 38.0 }, { t: 'STOP BY STOP', u0: 38.2, c: C.mint }]
    : [{ t: 'PLAN YOUR 2027 AIRSHOW,', u0: 37.9 }, { t: 'STOP BY STOP', u0: 38.2, c: C.mint }];
  const last = headline(ctx, u, lines, tx, ty, size, { cfg: SPRING.snappy });
  // the site's red button + address
  const bk = springU(u, 39, SPRING.bouncy);
  if (bk > 0) {
    const fs = FORMAT.pick({ '16x9': 46, '9x16': 58, '1x1': 42 });
    const f = font(fs, 600, UI);
    const Lb = layout(ctx, 'Start planning', f, 0);
    const bh = fs * 2.1, bw = Lb.width + fs * 2.9;
    const bx = tx, by = last + size * 0.55;
    ctx.save(); ctx.translate(bx, by + bh / 2); const sc = lerp(0.6, 1, bk); ctx.scale(sc, sc); ctx.translate(-bx, -(by + bh / 2));
    ctx.globalAlpha = clamp(bk * 3);
    rrect(ctx, bx, by, bw, bh, 6); ctx.fillStyle = C.red; ctx.fill();
    text(ctx, 'Start planning', bx + fs * 0.9, by + bh / 2 + fs * 0.36, f, C.white);
    arrow(ctx, bx + fs * 1.1 + Lb.width, by + bh / 2, fs * 0.6, C.white, fs * 0.11);
    ctx.restore();
    const uk = E.outQuint(prog(u, 39.3, 40));
    if (uk > 0) {
      ctx.globalAlpha = uk;
      const ufs = FORMAT.pick({ '16x9': 52, '9x16': 66, '1x1': 48 });
      text(ctx, 'ukairshowguide.co.uk', bx, by + bh + ufs * 1.75 + (1 - uk) * 20, font(ufs, 600, UI), C.white, 'left', 0.02 * ufs);
      ctx.globalAlpha = 1;
    }
  }
}

M.film({
  fonts: [font(100, 700, DISPLAY), font(40, 600, UI)],
  images: {
    hero: 'assets/art/hero-arrows-riat23.jpg',
    hawk: 'assets/art/red-hawk.webp',
    logo: 'assets/art/ukag-header-logo.png',
    cal: 'assets/shots/page_uk-airshow-calendar-html_viewport.png',
    map: 'assets/shots/page_airshow-map-html_viewport.png',
    travel: 'assets/shots/page_public-transport-html_viewport.png',
    train: 'assets/art/fact-train.jpg',
    camp: 'assets/art/guide-camping.jpg',
    campPage: 'assets/shots/page_camping-hub-html_viewport.png',
    typhoon: 'assets/art/guide-photo-typhoon.jpg',
    photoPage: 'assets/shots/page_photography-hub-html_viewport.png',
    find: 'assets/shots/page_find-your-airshow-html_viewport.png',
    ac1: 'assets/art/ac-typhoon-pull.jpg',
    ac2: 'assets/art/about-hurricanes.webp',
    ac3: 'assets/art/merlin-cloud.jpg',
    ac4: 'assets/art/jet-vapour.jpg',
  },
  hits: HITS,
  samples: (t) => 12,
  draw(ctx, u, t, IMG) {
    if (u < WIPE.a) return sHook(ctx, u, IMG);
    if (u < WIPE.b) { sHook(ctx, u, IMG); return sWipe(ctx, u, IMG); }
    if (u < 11.55) return sDates(ctx, u, IMG);
    if (u < 12.05) { // whip left: both shots on screen, the map is home on the beat
      const e = E.inOutCubic(prog(u, 11.55, 12.05));
      ctx.save(); ctx.translate(-e * W, 0); sDates(ctx, u, IMG); ctx.restore();
      ctx.save(); ctx.translate((1 - e) * W, 0); sMap(ctx, u, IMG); ctx.restore();
      return;
    }
    if (u < 15.55) return sMap(ctx, u, IMG);
    if (u < 16.05) { // whip up
      const e = E.inOutCubic(prog(u, 15.55, 16.05));
      ctx.save(); ctx.translate(0, -e * H); sMap(ctx, u, IMG); ctx.restore();
      ctx.save(); ctx.translate(0, (1 - e) * H); sTravel(ctx, u, IMG); ctx.restore();
      return;
    }
    if (u < 20) return sTravel(ctx, u, IMG);
    if (u < 23.55) return sCamp(ctx, u, IMG);
    if (u < 24.05) { // split: the camping frame parts down the middle onto photography
      const e = E.inOutCubic(prog(u, 23.55, 24.05));
      sPhoto(ctx, u, IMG);
      for (const side of [-1, 1]) {
        ctx.save(); ctx.translate(side * e * W * 0.55, 0);
        ctx.beginPath(); ctx.rect(side < 0 ? 0 : W / 2, 0, W / 2, H); ctx.clip();
        sCamp(ctx, u, IMG); ctx.restore();
      }
      return;
    }
    if (u < 28) { // push-through at the end
      const z = 2.6 ** E.inCubic(prog(u, 27.6, 28));
      ctx.save(); M.zoomAbout(ctx, z, W / 2, H * 0.55); sPhoto(ctx, u, IMG); ctx.restore();
      return;
    }
    if (u < 32) return sRunway(ctx, u, IMG);
    if (u < 36) return sMontage(ctx, u, IMG);
    return sEnd(ctx, u, IMG);
  },
});
