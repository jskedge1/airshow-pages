// Duxford Air Shows 2027 trailer: a pure function of time. window.seek(t) paints frame t (lib/motion.js).
// Timing is in beats (u) on the measured grid (120 bpm, so 2 beats = 1 s); docs/shotlist.md is the plan.
// Every photo, date, price and line of copy comes from duxford.html.
import * as M from './lib/motion.js';

const { W, H, FORMAT, E, TAU, prog, lerp, springU, SPRING, wobble, font, layout, glyph, text, fill, cover, rrect, fitSize } = M;

const C = { navy: '#13293C', red: '#D74949', teal: '#32B4AF', cream: '#F8F4EA', white: '#FFFFFF', yellow: '#FFC23A' };
const D = 'Display', UI = 'UI';
const P = FORMAT.portrait, S = FORMAT.safe;

// The lower band every photo shot shares: navy, with the logo's red and teal swooshes on its top edge.
const BAND = P ? { l: 1215, r: 1160 } : { l: 800, r: 752 };
const PHOTO = P ? { x: 0, y: 0, w: W, h: 1262 } : { x: 0, y: 0, w: W, h: H };

const HITS = [
  [0, 'D lands', 'impact'],
  [0.5, 'U', 'thud'], [1, 'X', 'thud'], [1.5, 'F', 'thud'], [2, 'O', 'thud'], [2.5, 'R', 'thud'], [3, 'D', 'thud'],
  [4, 'whip to formation', 'whoosh', { len: 0.5 }],
  [4.5, 'AIR SHOWS', 'thud'],
  [6, '2027', 'bell', { pitch: 'D6' }],
  [8, 'seven events', 'impact'],
  [8.5, 'chip 1', 'blip', { pitch: 'D5' }], [9, 'chip 2', 'blip', { pitch: 'E5' }], [9.5, 'chip 3', 'blip', { pitch: 'F#5' }],
  [10, 'chip 4', 'blip', { pitch: 'G5' }], [10.5, 'chip 5', 'blip', { pitch: 'A5' }], [11, 'chip 6', 'blip', { pitch: 'B5' }],
  [11.5, 'chip 7', 'blip', { pitch: 'D6' }],
  [12, 'big two pulse', 'bell', { pitch: 'A5' }],
  [14, 'Wildcat', 'thud'], [16, 'P-40', 'thud'], [18, 'Chipmunk', 'thud'], [20, 'Spitfire', 'thud'],
  [22, 'Summer Air Show card', 'impact'],
  [26, 'Battle of Britain card', 'thud'],
  [26.5, 'date lands', 'bell', { pitch: 'D6' }],
  [30, 'doors part', 'whoosh', { len: 0.5 }],
  [34, 'hangar', 'thud'],
  [38, 'need to know', 'sub', { len: 0.6 }],
  [38.5, 'no gate tickets', 'pop'],
  [40, 'under 15s', 'pop'],
  [42, 'end card', 'impact'],
  [43, 'Pip', 'boing'],
  [44, 'address', 'bell', { pitch: 'D6' }],
];

// ---------------------------------------------------------------- helpers
const fit = (ctx, str, max, width = S.w) => Math.min(max, fitSize(ctx, str, 800, D, width, max, -0.01));

// A line of display type that springs up glyph by glyph. segs: [[text, colour], ...]
function rise(ctx, segs, x, base, size, u, u0, { stagger = 0.022, out = null, align = 'left' } = {}) {
  if (u < u0) return;
  const str = segs.map((s) => s[0]).join('');
  const f = font(size, 800, D), L = layout(ctx, str, f, -0.01 * size);
  const x0 = align === 'center' ? x - L.width / 2 : align === 'right' ? x - L.width : x;
  const cols = [];
  segs.forEach(([t, c]) => { for (const _ of t) cols.push(c); });
  const kOut = out == null ? 1 : 1 - E.inCubic(prog(u, out - 0.4, out));
  if (kOut <= 0) return;
  L.glyphs.forEach((g, j) => {
    if (u < u0 + j * stagger) return;
    const k = springU(u, u0 + j * stagger, SPRING.snappy), sc = lerp(0.74, 1, k) * kOut;
    glyph(ctx, g.ch, x0 + g.cx, base + (1 - k) * size * 0.3, f, cols[j], sc, sc);
  });
}

function overline(ctx, str, x, base, size, u, u0, color = C.teal, out = null) {
  if (u < u0) return;
  const k = springU(u, u0, SPRING.snappy);
  ctx.save();
  ctx.globalAlpha = (out == null ? 1 : 1 - prog(u, out - 0.3, out));
  text(ctx, str.toUpperCase(), x - (1 - k) * 40, base, font(size, 600, UI), color, 'left', size * 0.1);
  ctx.restore();
}

function band(ctx, lift = 0) {
  const yl = lerp(BAND.l, -150, lift), yr = lerp(BAND.r, -210, lift);
  const quad = (o, th, col) => {
    ctx.beginPath(); ctx.moveTo(0, yl + o); ctx.lineTo(W, yr + o); ctx.lineTo(W, yr + o + th); ctx.lineTo(0, yl + o + th); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
  };
  quad(-40, 16, C.teal); quad(-20, 16, C.red);
  ctx.beginPath(); ctx.moveTo(0, yl); ctx.lineTo(W, yr); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.fillStyle = C.navy; ctx.fill();
}

// A real photo, cover-fit, drifting from a to b ([fx, fy, zoom]) with a small settle on the cut.
function photo(ctx, img, a, b, p, age = 9, R = PHOTO) {
  if (!img) return;
  const z = a[2] * (b[2] / a[2]) ** p * (1 + 0.05 * Math.exp(-2.5 * Math.max(0, age)));
  cover(ctx, img, R.x, R.y, R.w, R.h, { fx: lerp(a[0], b[0], p), fy: lerp(a[1], b[1], p), zoom: z });
}

// ---------------------------------------------------------------- S1 hook + S2 title   (u 0..8)
const LETTERS = [...'DUXFORD'];
function hookPhoto(ctx, u, IMG) { photo(ctx, IMG.headon, [0.5, 0.42, 1.04], [0.5, 0.42, 1.2], prog(u, 0, 4)); }
function titlePhoto(ctx, u, IMG) { photo(ctx, IMG.formation, [0.12, 0.5, 1.22], [0.88, 0.5, 1.22], E.outCubic(prog(u, 3.6, 8.4))); }

function sceneOpen(ctx, u, IMG) {
  if (u < 3.6) hookPhoto(ctx, u, IMG);
  else if (u < 4) {                       // whip pan: A leaves left as B arrives from the right
    const p = E.inOutCubic(prog(u, 3.6, 4));
    ctx.save(); ctx.translate(-p * W, 0); hookPhoto(ctx, u, IMG); ctx.restore();
    ctx.save(); ctx.translate((1 - p) * W, 0); titlePhoto(ctx, u, IMG); ctx.restore();
  } else titlePhoto(ctx, u, IMG);

  band(ctx, E.inOutCubic(prog(u, 7.35, 8)));

  // DUXFORD: one letter per half beat, dropped with weight
  const size = fit(ctx, 'DUXFORD', P ? 210 : 218), f = font(size, 800, D);
  const L = layout(ctx, 'DUXFORD', f, 0.01 * size), base = P ? 1432 : 1008;
  LETTERS.forEach((ch, i) => {
    const u0 = i * 0.5 - (i === 0 ? 0.32 : 0.12);
    const k = springU(u, u0, SPRING.bouncy);
    if (k <= 0) return;
    const sq = 0.16 * wobble(u - (u0 + 0.12), 1.6, 4.5);
    const out = E.inBack(prog(u, 3.5 + i * 0.04, 3.95 + i * 0.01), 1.2);
    if (out >= 1) return;
    glyph(ctx, ch, S.x + L.glyphs[i].cx, base - (1 - k) * 420 + out * 420, f, C.cream, 1 + sq, 1 - sq);
  });

  // AIR SHOWS 2027
  if (u >= 4) {
    const s2 = fit(ctx, 'AIR SHOWS 2027', P ? 150 : 200);
    const kOut = 7.5;
    rise(ctx, [['AIR SHOWS ', C.cream]], S.x, P ? 1418 : 1002, s2, u, 4.35, { out: kOut });
    const w = layout(ctx, 'AIR SHOWS ', font(s2, 800, D), -0.01 * s2).width;
    rise(ctx, [['2027', C.teal]], S.x + w, P ? 1418 : 1002, s2, u, 5.9, { stagger: 0.05, out: kOut });
  }
}

// ---------------------------------------------------------------- S3 seven events   (u 8..14)
const EVENTS = [
  ['8 May', 'VE Day Flying Day', 0], ['5 June', 'D-Day Flying Day', 0], ['19 & 20 June', 'Summer Air Show', 1],
  ['30 July', 'The Americans Flying Day', 0], ['14 August', 'Flying Evening', 0], ['11 & 12 Sept', 'Battle of Britain Air Show', 1],
  ['2 October', 'Flying Finale', 0],
];
function sceneSeven(ctx, u) {
  fill(ctx, C.navy);
  // the logo's swooshes, running off the top right corner
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 16;
  const sw = E.outCubic(prog(u, 7.6, 9.5));
  [[C.teal, 0], [C.red, 34]].forEach(([col, o]) => {
    ctx.strokeStyle = col; ctx.beginPath();
    const x0 = W * (P ? 0.2 : 0.55), y0 = (P ? 250 : 150) + o;
    ctx.moveTo(x0, y0); ctx.quadraticCurveTo(lerp(x0, W * 0.9, 0.6), y0 + 20, lerp(x0, W + 60, sw), lerp(y0, o - 90 + (P ? 120 : 20), sw));
    ctx.stroke();
  });
  ctx.restore();

  const u0 = 7.75;
  let top;
  if (P) {
    const s1 = fit(ctx, 'Seven flying events.', 104);
    rise(ctx, [['Seven flying events.', C.cream]], S.x, S.y + 150, s1, u, u0);
    rise(ctx, [['May to October.', C.teal]], S.x, S.y + 150 + s1 * 1.05, s1, u, u0 + 0.5);
    top = S.y + 150 + s1 * 1.05 + 62;
  } else {
    const str = 'Seven flying events. May to October.', s1 = fit(ctx, str, 104);
    rise(ctx, [['Seven flying events. ', C.cream], ['May to October.', C.teal]], S.x, 240, s1, u, u0, { stagger: 0.008 });
    top = 340;
  }

  const gap = P ? 18 : 28;
  EVENTS.forEach(([date, name, big], i) => {
    let x, y, w, h;
    if (P) { w = S.w; h = 118; x = S.x; y = top + i * (h + gap); }
    else {
      w = (S.w - 3 * gap) / 4; h = 300;
      const row = i < 4 ? 0 : 1, col = i < 4 ? i : i - 4;
      x = S.x + (row ? (w + gap) / 2 : 0) + col * (w + gap); y = top + row * (h + gap + 12);
    }
    const k = springU(u, 8.42 + i * 0.5, SPRING.bouncy);
    if (k <= 0) return;
    const pulse = big ? 0.07 * wobble(u - 12, 1.4, 2.6) : 0;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + (1 - k) * 90); ctx.scale(lerp(0.7, 1, k) + pulse, lerp(0.7, 1, k) + pulse);
    ctx.globalAlpha = Math.min(1, k * 1.6);
    rrect(ctx, -w / 2, -h / 2, w, h, 24); ctx.fillStyle = big ? C.red : C.cream; ctx.fill();
    const ink = big ? C.white : C.navy;
    if (P) {
      text(ctx, date, -w / 2 + 30, 22, font(Math.min(62, fit(ctx, date, 62, 330)), 800, D), ink);
      const ls = Math.min(36, Math.floor(36 * (w - 430) / Math.max(w - 430, layout(ctx, name, font(36, 600, UI)).width)));
      text(ctx, name, w / 2 - 30, 14, font(ls, 600, UI), ink, 'right');
    } else {
      const ds = fit(ctx, date, 84, w - 56);
      text(ctx, date, 0, 6, font(ds, 800, D), ink, 'center');
      const lw = layout(ctx, name, font(36, 600, UI)).width, ls = Math.min(36, Math.floor(36 * (w - 48) / lw));
      text(ctx, name, 0, 84, font(ls, 600, UI), ink, 'center');
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- S4 aircraft   (u 14..22)
const PLANES = [
  ['wildcat', 'Grumman Wildcat', [0.4, 0.5, 1.1], [0.6, 0.5, 1.16]],
  ['p40', 'Curtiss P-40 Warhawk', [0.75, 0.45, 1.12], [0.55, 0.45, 1.2]],
  ['chipmunk', 'de Havilland Chipmunk', [0.4, 0.55, 1.1], [0.6, 0.55, 1.16]],
  ['cockpit', 'Supermarine Spitfire', [0.75, 0.4, 1.1], [0.55, 0.4, 1.2]],
];
function sceneAircraft(ctx, u, IMG) {
  const i = Math.min(3, Math.floor((u - 14) / 2)), u0 = 14 + i * 2;
  const [key, name, a, b] = PLANES[i];
  photo(ctx, IMG[key], a, b, prog(u, u0, u0 + 2), u - u0);
  band(ctx);
  overline(ctx, 'Seen at Duxford', S.x, P ? 1296 : 880, P ? 38 : 42, u, 14);
  rise(ctx, [[name, C.cream]], S.x, P ? 1420 : 1008, fit(ctx, name, P ? 120 : 132), u, u0, { stagger: 0.003 });
}

// ---------------------------------------------------------------- S5 the two big Air Shows   (u 22..30)
const BIG = [
  [['Summer', 'Air Show'], '19 & 20 June', 21.72, -1],
  [['Battle of Britain', 'Air Show'], '11 & 12 Sept', 25.7, 1],
];
function sceneBig(ctx, u, IMG) {
  photo(ctx, IMG.taxi, [0.35, 0.5, 1.1], [0.65, 0.5, 1.2], prog(u, 22, 30), u - 22, { x: 0, y: 0, w: W, h: H });
  ctx.fillStyle = 'rgba(19,41,60,0.66)'; ctx.fillRect(0, 0, W, H);
  const gap = 40, w = P ? S.w : (S.w - gap) / 2, h = P ? 500 : 560;
  BIG.forEach(([name, date, u0, dir], i) => {
    const k = springU(u, u0, SPRING.snappy);
    if (k <= 0) return;
    const x = (P ? S.x : S.x + i * (w + gap)) + (1 - k) * dir * (W * 0.9);
    const y = P ? S.y + 50 + i * (h + gap) : (H - h) / 2;
    const q = 0.025 * wobble(u - (u0 + 0.15), 1.5, 4);
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(1 + q, 1 - q); ctx.translate(-w / 2, -h / 2);
    rrect(ctx, 0, 0, w, h, 30); ctx.fillStyle = C.cream; ctx.fill();
    ctx.save(); rrect(ctx, 0, 0, w, h, 30); ctx.clip(); ctx.fillStyle = C.red; ctx.fillRect(0, 0, w, 18); ctx.restore();
    const pad = P ? 44 : 52, ns = P ? 84 : 92;
    text(ctx, 'TWO DAY AIR SHOW', pad, pad + 54, font(P ? 34 : 38, 600, UI), '#1E8480', 'left', 3.6);
    name.forEach((ln, j) => text(ctx, ln, pad, pad + 54 + (j + 1) * ns * 1.02 + 16, font(ns, 800, D), C.navy));
    const ds = fit(ctx, date, P ? 132 : 138, w - pad * 2);
    const dk = springU(u, u0 + 0.6, SPRING.bouncy);
    if (dk > 0) {
      ctx.save(); ctx.translate(pad, h - pad - 6); ctx.scale(dk, dk);
      text(ctx, date, 0, 0, font(ds, 800, D), C.red); ctx.restore();
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- S6 the place   (u 30..38)
function sceneAirfield(ctx, u, IMG) {
  if (u < 34) photo(ctx, IMG.arrive, [0.5, 0.35, 1.06], [0.62, 0.35, 1.16], prog(u, 30, 34), u - 30);
  else photo(ctx, IMG.hangar, [0.25, 0.55, 1.08], [0.45, 0.55, 1.18], prog(u, 34, 38), u - 34);
  band(ctx, E.inOutCubic(prog(u, 37.35, 38)));
  const second = u >= 34, u0 = second ? 34 : 30.15, out = second ? 37.5 : null;
  overline(ctx, second ? 'Every show ticket' : 'IWM Duxford', S.x, P ? 1290 : 880, P ? 38 : 42, u, u0, C.teal, out);
  const lines = second
    ? (P ? ['Your ticket also covers', 'the museum hangars'] : ['Your ticket also covers the museum hangars'])
    : (P ? ['A real Battle of', 'Britain airfield'] : ['A real Battle of Britain airfield']);
  const size = Math.min(...lines.map((l) => fit(ctx, l, P ? 96 : 124)));
  lines.forEach((ln, j) => rise(ctx, [[ln, C.cream]], S.x, (P ? 1385 : 1008) + j * size * 1.04, size, u, u0 + j * 0.1, { stagger: 0.003, out }));
}

// ---------------------------------------------------------------- S7 need to know   (u 38..42)
function sceneNeed(ctx, u) {
  fill(ctx, C.navy);
  const x = S.x, y0 = P ? S.y + 190 : 250;
  overline(ctx, 'Need to know', x, y0, P ? 40 : 44, u, 37.8);
  const s1 = fit(ctx, 'Advance tickets only', P ? 110 : 120);
  rise(ctx, [['Advance tickets only', C.cream]], x, y0 + s1 * 1.15, s1, u, 37.8, { stagger: 0.006 });
  const s2 = fit(ctx, 'No tickets on the gate', P ? 150 : 150, P ? S.w : 1180);
  rise(ctx, [['No tickets on the gate', C.yellow]], x, y0 + s1 * 1.15 + s2 * 1.12, s2, u, 38.4, { stagger: 0.02 });
  const yb = y0 + s1 * 1.15 + s2 * 1.12 + (P ? 150 : 160);
  const lines = P ? ['15 and under free', 'at the Big Air Shows'] : ['15 and under free at the Big Air Shows'];
  const s3 = Math.min(...lines.map((l) => fit(ctx, l, P ? 84 : 92, P ? S.w : 1160)));
  lines.forEach((ln, j) => rise(ctx, [[ln, C.cream]], x, yb + j * s3 * 1.08, s3, u, 39.9 + j * 0.2, { stagger: 0.012 }));
  const lw = Math.max(...lines.map((l) => layout(ctx, l, font(s3, 800, D), -0.01 * s3).width));
  const k = E.outCubic(prog(u, 40.2, 41.2));
  if (k > 0) { ctx.fillStyle = C.teal; rrect(ctx, x, yb + (lines.length - 1) * s3 * 1.08 + 26, lw * k, 12, 6); ctx.fill(); }
  // Pip leans in with the tip
  const pk = springU(u, 38.45, SPRING.bouncy);
  if (pk > 0 && PIPS.tip) {
    const ps = P ? 400 : 480, px = P ? S.x + S.w - ps / 2 + 20 : W - S.x - ps / 2 + 10, py = P ? 1500 : 800;
    const q = 0.06 * wobble(u - 38.6, 1.5, 3.5);
    ctx.save(); ctx.translate(px, py + (1 - pk) * 600); ctx.scale(1 + q, 1 - q);
    rrect(ctx, -ps / 2 + 10, -ps + 10, ps - 20, ps - 20, ps); ctx.fillStyle = C.cream; ctx.fill();
    ctx.drawImage(PIPS.tip, -ps / 2, -ps, ps, ps); ctx.restore();
  }
}

// ---------------------------------------------------------------- S8 end card   (u 42..48)
const PIP = [], PIPS = {};
function sceneEnd(ctx, u, IMG) {
  fill(ctx, C.cream);
  const lk = springU(u, 41.85, SPRING.gentle);
  const lw = P ? S.w : 1020, lh = IMG.logo ? lw * IMG.logo.height / IMG.logo.width : 300;
  const lx = S.x, ly = P ? S.y + 60 : 150;
  if (IMG.logo && lk > 0) {
    const s = lerp(0.82, 1, lk);
    ctx.save();
    ctx.translate(lx + lw / 2, ly + lh / 2); ctx.scale(s, s);
    ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh); ctx.restore();
  }
  const ty = P ? 1300 : ly + lh + 150;
  const str = 'Plan your day at Duxford', ts = fit(ctx, str, P ? 96 : 92, P ? S.w : 980);
  rise(ctx, [[str, C.navy]], lx, ty, ts, u, 42.6, { stagger: 0.014 });
  const uk = springU(u, 43.9, SPRING.snappy);
  if (uk > 0) {
    const us = P ? 62 : 64, f = font(us, 600, UI);
    const tw = layout(ctx, 'ukairshowguide.co.uk', f).width;
    ctx.save(); ctx.globalAlpha = Math.min(1, uk * 2);
    rrect(ctx, lx, ty + 44 + (1 - uk) * 30, tw + 64, us + 44, (us + 44) / 2); ctx.fillStyle = C.red; ctx.fill();
    text(ctx, 'ukairshowguide.co.uk', lx + 32, ty + 44 + us + 12 + (1 - uk) * 30, f, C.white);
    ctx.restore();
  }
  // Pip pops up and waves
  const pk = springU(u, 42.9, SPRING.bouncy);
  if (pk > 0 && PIP.length) {
    const ang = -47 + 15 * Math.sin(TAU * (u - 43) / 2);
    const img = PIP[Math.max(0, Math.min(PIP.length - 1, Math.round((ang + 64) / 2)))];
    const ps = P ? 560 : 680, px = P ? S.x + S.w / 2 : 1470, py = P ? 1110 : 940;
    const q = 0.06 * wobble(u - 43.05, 1.5, 3.5);
    ctx.save(); ctx.translate(px, py + (1 - pk) * 500 - 6 * Math.sin(TAU * (u - 43) / 4)); ctx.scale(1 + q, 1 - q);
    ctx.drawImage(img, -ps / 2, -ps, ps, ps); ctx.restore();
  }
}

M.film({
  fonts: [font(100, 800, D), font(40, 600, UI)],
  images: {
    headon: 'assets/7378279430ba2c6a.webp', formation: 'assets/e0c95ed4bee341b0.webp', wildcat: 'assets/dad2833f2d0b3b20.webp',
    p40: 'assets/4f099e30236ceb55.webp', chipmunk: 'assets/8827e3da8254277e.webp', arrive: 'assets/duxford-shuttle-minibus.webp',
    cockpit: 'assets/520fad291ea86b89.webp', taxi: 'assets/a2a74bf44a5af95d.webp', hangar: 'assets/3b6f5a5a788398aa.webp',
    logo: 'assets/logo.png',
  },
  hits: HITS,
  async init() {
    // Pip's wave: the mascot drawn once per wing angle, picked by time (no state between frames)
    for (let a = -64; a <= -30; a += 2) {
      const svg = window.UKAGMascot.svg({ pose: 'hello', right: a, size: 800, box: '0 0 400 400', title: '' });
      const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await im.decode(); PIP.push(im);
    }
    const tip = new Image();
    tip.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(window.UKAGMascot.svg({ pose: 'tip', left: -28, right: 20, look: [-5, -2], size: 800, box: '-10 -5 420 420', ground: false, title: '' }));
    await tip.decode(); PIPS.tip = tip;
  },
  draw(ctx, u, t, IMG) {
    fill(ctx, C.navy);
    if (u < 8) sceneOpen(ctx, u, IMG);
    else if (u < 14) sceneSeven(ctx, u);
    else if (u < 22) sceneAircraft(ctx, u, IMG);
    else if (u < 29.4) sceneBig(ctx, u, IMG);
    else if (u < 30) {
      // hangar doors: the card shot splits in two and slides apart over the next shot
      sceneAirfield(ctx, 30, IMG);
      const p = E.inCubic(prog(u, 29.4, 30));
      const cut = P ? S.y + 50 + 500 + 20 : W / 2;
      [-1, 1].forEach((dir) => {
        ctx.save();
        const off = dir * p * (P ? H * 0.62 : W * 0.52);
        ctx.beginPath();
        if (P) ctx.rect(0, dir < 0 ? off : cut + off, W, dir < 0 ? cut : H - cut);
        else ctx.rect(dir < 0 ? off : cut + off, 0, dir < 0 ? cut : W - cut, H);
        ctx.clip();
        ctx.translate(P ? 0 : off, P ? off : 0);
        sceneBig(ctx, u, IMG);
        ctx.restore();
      });
    } else if (u < 38) sceneAirfield(ctx, u, IMG);
    else if (u < 41.5) sceneNeed(ctx, u);
    else if (u < 42) {
      // the end card sweeps in from the left behind the red and teal swooshes
      sceneNeed(ctx, u);
      const p = E.inOutCubic(prog(u, 41.5, 42)), x = p * (W + 260) - 130;
      ctx.save(); ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(x + 60, -10); ctx.lineTo(x - 60, H + 10); ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip();
      sceneEnd(ctx, u, IMG); ctx.restore();
      [[C.red, 0], [C.teal, 34]].forEach(([col, o]) => {
        ctx.beginPath(); ctx.moveTo(x + 60 + o, -10); ctx.lineTo(x + 60 + o + 24, -10); ctx.lineTo(x - 60 + o + 24, H + 10); ctx.lineTo(x - 60 + o, H + 10); ctx.closePath();
        ctx.fillStyle = col; ctx.fill();
      });
    } else sceneEnd(ctx, u, IMG);
  },
});
