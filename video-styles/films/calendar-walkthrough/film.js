// Find your airshow: calendar walkthrough. Pure function of time; window.seek(t) paints frame t.
// Plan: docs/shotlist.md. Every screen is a real capture of uk-airshow-calendar.html (assets/shots).
import * as M from './lib/motion.js';
import { C, fD, fU, lz, photo, riseText, slideLine, pill, logoBadge, drawBox, pointer } from './lib/brand.js';

const { W, H, E, prog, lerp, clamp, springU, springKeys, SPRING, kf, text, rrect, cover } = M;

// ------------------------------------------------------------------ hits
const HITS = [
  [0, 'open', 'impact'],
  [0.5, 'every', 'pop', { pitch: 'F5' }], [1, 'uk', 'pop', { pitch: 'A5' }], [1.5, 'airshow', 'pop', { pitch: 'C6' }],
  [3, 'one calendar', 'thud'],
  [6.5, 'into window', 'whoosh', { len: 0.6 }],
  [8, 'step 1', 'click'],
  [10, 'push season', 'whoosh', { len: 0.5, from: 500, to: 1800 }],
  [13, 'box season', 'tick'],
  [15, 'caption', 'blip', { pitch: 'F6' }],
  [20, 'pan new', 'whoosh', { len: 0.5, from: 1800, to: 700 }],
  [22, 'caption new', 'blip', { pitch: 'A6' }],
  [28, 'step 2 scroll', 'whoosh', { len: 0.5 }],
  [33, 'tap june', 'click'],
  [36, 'push list', 'whoosh', { len: 0.4, from: 600, to: 1600 }],
  [40, 'box showing', 'tick'],
  [41, 'caption june', 'blip', { pitch: 'C7' }],
  [48, 'step 3', 'click'],
  [51, 'typing', 'type', { len: 2.0, n: 8 }],
  [56, 'results', 'pop', { pitch: 'F5' }],
  [58, 'box results', 'tick'],
  [59, 'caption search', 'blip', { pitch: 'F6' }],
  [68, 'step 4', 'click'],
  [72, 'tap free', 'click'],
  [75, 'box free', 'tick'],
  [76, 'caption free', 'blip', { pitch: 'A6' }],
  [84, 'step 5 scroll', 'whoosh', { len: 0.5 }],
  [90, 'tap going', 'click'],
  [90.5, 'going', 'bell', { pitch: 'F6' }],
  [93, 'toast', 'blip', { pitch: 'C7' }],
  [104, 'step 6', 'click'],
  [108, 'tap calendar', 'click'],
  [108.5, 'saved', 'bell', { pitch: 'A6' }],
  [111, 'toast 2', 'blip', { pitch: 'C7' }],
  [120, 'recap', 'impact'],
  [122, 'r1', 'tick'], [124, 'r2', 'tick'], [126, 'r3', 'tick'], [128, 'r4', 'tick'], [130, 'r5', 'tick'], [132, 'r6', 'tick'],
  [140, 'end card', 'impact'],
  [140.5, 'logo', 'bell', { pitch: 'F6' }],
  [143, '46 shows', 'pop', { pitch: 'C6' }],
  [146, 'url', 'tick'],
];

// ------------------------------------------------------------------ geometry
const K0 = 0.92, OX = (W - 1440 * K0) / 2, OY = 214, BAR = 44;   // page origin + scale in base canvas coords
const PW = 1440 * K0, PH = 900 * K0;
const CX = W / 2, CY = 600;
const pg = (x, y) => [OX + x * K0, OY + y * K0];                 // page css px -> base canvas
const R = {
  panel: [956, 72, 340, 524], neww: [0, 660, 1440, 175], june: [330, 231, 75, 44], search: [184, 176, 338, 44],
  free: [1166, 177, 130, 44], showJ: [1043, 244, 154, 18], showS: [1040, 244, 158, 18], showF: [1043, 244, 154, 18],
  row: [392, 176, 904, 147], going: [523, 265, 93, 44], cal: [624, 265, 181, 44], toast: [550, 828, 340, 52],
};
const ctr = (r) => pg(r[0] + r[2] / 2, r[1] + r[3] / 2);

// camera keys: [beat, [log zoom, focus x, focus y]] (focus = base point brought to CX,CY)
const cam0 = [0, CX, CY];
const camK = (s, p) => [Math.log(s), p[0], p[1]];
const CAM = [
  [0, cam0],
  [10, camK(1.65, ctr(R.panel))],
  [20, camK(1.55, pg(720, 760))],
  [26, cam0],
  [29.5, camK(1.7, pg(560, 250))],
  [34.5, camK(1.45, pg(700, 330))],
  [39, camK(2.2, ctr(R.showJ))],
  [45, cam0],
  [49.5, camK(2.0, pg(400, 198))],
  [56.5, camK(2.2, ctr(R.showS))],
  [64, cam0],
  [69.5, camK(1.7, pg(1010, 230))],
  [72.8, camK(2.2, ctr(R.showF))],
  [81, cam0],
  [85.5, camK(1.75, ctr(R.row))],
  [92, camK(1.5, pg(720, 700))],
  [100, cam0],
  [104.5, camK(1.75, ctr(R.row))],
  [110, camK(1.5, pg(720, 700))],
  [117, cam0],
];
function camera(u) {
  const v = springKeys(u, CAM, SPRING.gentle);
  return { s: Math.exp(v[0]), fx: v[1], fy: v[2] };
}
const toScreen = (cam, p) => [(p[0] - cam.fx) * cam.s + CX, (p[1] - cam.fy) * cam.s + CY];

// which capture is on the page at beat u
function shotAt(u) {
  if (u < 28) return 'hero';
  if (u < 33) return 'filters';
  if (u < 48) return 'june';
  if (u < 56) return 'filters';
  if (u < 68) return 'search';
  if (u < 72) return 'filters';
  if (u < 84) return 'free';
  if (u < 90) return 'row';
  if (u < 108) return 'going';
  return 'addcal';
}

// pointer path: [beat, [css x, css y]] per step; pressed at the click beat
const PTR = [
  { from: 29, to: 35, keys: [[29, [1100, 760]], [32, [367, 253]]], click: 33 },
  { from: 69, to: 74, keys: [[69, [800, 600]], [71.5, [1231, 199]]], click: 72 },
  { from: 86, to: 92, keys: [[86, [900, 420]], [89, [569, 287]]], click: 90 },
  { from: 105, to: 110, keys: [[105, [480, 380]], [107.5, [714, 287]]], click: 108 },
];

// captions: [from, to, text]
const CAPS = [
  [15, 20, 'How many shows, and which months are busiest'],
  [22, 27, 'New dates, as soon as they are confirmed'],
  [41, 46, 'Tap a month: 12 shows in June'],
  [59, 65, 'Search "Spitfire": 20 of the 46 shows'],
  [76, 82, 'Free to watch: 12 shows'],
  [93, 101, 'Saved to your list in My Airshow Hub'],
  [111, 118, 'A calendar file for your phone or computer'],
];
const STEPS = [
  [8, 28, 1, 'See the whole season'],
  [28, 48, 2, 'Pick a month'],
  [48, 68, 3, 'Search a show, place or aircraft'],
  [68, 84, 4, 'Find shows free to watch'],
  [84, 104, 5, "Tap I'm going"],
  [104, 120, 6, 'Add it to your calendar'],
];

// ------------------------------------------------------------------ drawing the browser
function drawPage(ctx, IMG, key, dy = 0) {
  const img = IMG[key]; if (!img) return;
  ctx.drawImage(img, OX, OY + dy, PW, PH);
}
function browser(ctx, u, IMG) {
  // chrome
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  rrect(ctx, OX, OY - BAR, PW, PH + BAR, 14); ctx.fillStyle = '#E2E8ED'; ctx.fill();
  ctx.restore();
  [0, 1, 2].forEach((i) => { ctx.fillStyle = '#C9D6E0'; ctx.beginPath(); ctx.arc(OX + 24 + i * 22, OY - BAR / 2, 7, 0, M.TAU); ctx.fill(); });
  rrect(ctx, OX + 100, OY - BAR + 8, PW - 120, BAR - 16, 6); ctx.fillStyle = '#fff'; ctx.fill();
  text(ctx, 'ukairshowguide.co.uk  ·  UK Airshow Dates 2027', OX + 118, OY - 15, fU(17, 500), C.body);
  // page, clipped, with scroll transitions
  ctx.save();
  ctx.beginPath(); ctx.rect(OX, OY, PW, PH); ctx.clip();
  const sc1 = E.inOutCubic(prog(u, 27.5, 28.6)), sc2 = E.inOutCubic(prog(u, 83.5, 84.6));
  if (u >= 27.5 && u < 28.6) { drawPage(ctx, IMG, 'hero', -sc1 * PH); drawPage(ctx, IMG, 'filters', (1 - sc1) * PH); }
  else if (u >= 83.5 && u < 84.6) { drawPage(ctx, IMG, 'free', -sc2 * PH); drawPage(ctx, IMG, 'row', (1 - sc2) * PH); }
  else drawPage(ctx, IMG, shotAt(u));
  // step 3: "Spitfire" types into the search box (mask over the real after-capture)
  if (u >= 50.5 && u < 56) {
    const p = prog(u, 51, 55.2);
    const [sx, sy, sw, sh] = R.search, img = IMG.search;
    const tx = sx + 1, tw = 2 + 66 * p;
    if (img && p > 0) {
      ctx.fillStyle = '#fff'; ctx.fillRect(...pg(tx, sy + 4), (sw - 6) * K0, (sh - 8) * K0);
      ctx.drawImage(img, tx * 2, sy * 2, tw * 2, sh * 2, ...pg(tx, sy), tw * K0, sh * K0);
      const blink = Math.floor(u * 2) % 2 === 0 || p < 1;
      if (blink) { ctx.fillStyle = C.navy; ctx.fillRect(...pg(tx + tw + 1, sy + 12), 2, 20 * K0); }
    }
  }
  ctx.restore();
}

function header(ctx, u) {
  const st = STEPS.find((s) => u >= s[0] - 0.4 && u < s[1] - 0.4);
  if (!st) return;
  const [a, , n, title] = st;
  const k = springU(u, a - 0.4, SPRING.bouncy);
  ctx.save();
  ctx.translate(96 + 40, 92); ctx.scale(k, k);
  ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(0, 0, 40, 0, M.TAU); ctx.fill();
  text(ctx, String(n), 0, 22, fD(62), C.deep, 'center');
  ctx.restore();
  riseText(ctx, title.toUpperCase(), 200, 118, 76, '#fff', u, a - 0.2, { stagger: 0.02 });
}

function caption(ctx, u) {
  for (const [a, b, str] of CAPS) {
    if (u < a || u > b + 0.6) continue;
    const p = E.outQuint(prog(u, a, a + 0.7)), q = E.inCubic(prog(u, b, b + 0.6));
    ctx.font = fU(46, 700); const tw = ctx.measureText(str).width;
    const bw = tw + 90, x = 140 - q * 60, y = 930 + (1 - p) * 60;
    ctx.save(); ctx.globalAlpha = Math.min(1, p * 1.5) * (1 - q);
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = C.navy; ctx.fillRect(x, y - 52, bw, 96);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = C.teal; ctx.fillRect(x, y - 52, 10, 96);
    text(ctx, str, x + 48, y + 12, fU(46, 700), '#fff');
    ctx.restore();
  }
}

// amber boxes on the page, drawn in page space under the camera
const BOXES = [
  [13, 19.6, R.panel], [40, 46, R.showJ, 10], [58, 64.5, R.showS, 10], [75, 81.5, R.showF, 10],
  [93, 100, R.toast, 6], [111, 117.5, R.toast, 6],
];
function boxes(ctx, u) {
  for (const [a, b, r, pad = 8] of BOXES) {
    if (u < a || u > b) continue;
    const p = E.inOutCubic(prog(u, a, a + 1.2)) * (1 - prog(u, b - 0.5, b));
    const [x, y] = pg(r[0] - pad, r[1] - pad);
    drawBox(ctx, x, y, (r[2] + pad * 2) * K0, (r[3] + pad * 2) * K0, p, { lw: 5, r: 8 });
  }
}

// ------------------------------------------------------------------ scenes
function sceneHook(ctx, u, IMG) {
  // full-frame hero, which shrinks into the browser page rect from beat 6
  const g = E.inOutCubic(prog(u, 6, 7.9));
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, W, H);
  const fw = lerp(W, PW, g), fh = lerp(H, PH, g), fx = lerp(0, OX, g), fy = lerp(0, OY, g);
  if (g > 0) {
    ctx.save(); ctx.globalAlpha = g;
    rrect(ctx, fx, fy - BAR * g, fw, fh + BAR * g, 14 * g); ctx.fillStyle = '#E2E8ED'; ctx.fill();
    ctx.restore();
  }
  cover(ctx, IMG.hero, fx, fy, fw, fh, { zoom: lz(1.25, 1.0, E.outCubic(prog(u, 0, 7.9))), fx: 0.5, fy: 0.45 });
  const sh = ctx.createLinearGradient(fx, 0, fx + fw, 0);
  sh.addColorStop(0, `rgba(14,33,49,${0.97 * (1 - g)})`); sh.addColorStop(0.55, `rgba(14,33,49,${0.9 * (1 - g)})`); sh.addColorStop(1, `rgba(14,33,49,${0.45 * (1 - g)})`);
  ctx.fillStyle = sh; ctx.fillRect(fx, fy, fw, fh);
  const out = 5.6;
  riseText(ctx, 'EVERY UK AIRSHOW.', 120, 470, 170, '#fff', u, -0.5, { stagger: 0.03, exit: out });
  riseText(ctx, 'ONE CALENDAR.', 120, 650, 170, C.mint, u, 2.6, { stagger: 0.03, exit: out + 0.15 });
  slideLine(ctx, '46 shows confirmed for 2027 so far', 126, 760, fU(48, 500), C.soft, u, 4);
  if (u > 5.6) { ctx.save(); ctx.globalAlpha = 1 - prog(u, 5.6, 6); ctx.fillStyle = C.deep; ctx.restore(); }
}

function sceneWalk(ctx, u, IMG) {
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, W, H);
  const cam = camera(u);
  ctx.save();
  ctx.translate(CX, CY); ctx.scale(cam.s, cam.s); ctx.translate(-cam.fx, -cam.fy);
  browser(ctx, u, IMG);
  boxes(ctx, u);
  ctx.restore();
  // pointer, in screen space so it keeps its size
  for (const P of PTR) {
    if (u < P.from || u > P.to) continue;
    const css = kf(u, P.keys, E.inOutCubic);
    const [x, y] = toScreen(cam, pg(css[0], css[1]));
    const press = M.bump(u, P.click, 0.35);
    const ap = E.outQuint(prog(u, P.from, P.from + 0.6)) * (1 - prog(u, P.to - 0.5, P.to));
    ctx.save(); ctx.globalAlpha = ap; pointer(ctx, x, y, press, prog(u, P.click, P.click + 1.2)); ctx.restore();
  }
  // header band over the top
  const g = E.outQuint(prog(u, 7.2, 8.2));
  const hg = ctx.createLinearGradient(0, 0, 0, 190);
  hg.addColorStop(0, `rgba(14,33,49,${0.96 * g})`); hg.addColorStop(0.75, `rgba(14,33,49,${0.85 * g})`); hg.addColorStop(1, 'rgba(14,33,49,0)');
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 190);
  header(ctx, u);
  logoBadge(ctx, IMG.logo, W - 96 - 120, 88, 64, springU(u, 7.6, SPRING.snappy));
  caption(ctx, u);
}

const TILES = [
  ['hero', [800, 60, 560, 350], 'Season'],
  ['june', [140, 120, 720, 450], 'Month'],
  ['search', [140, 120, 720, 450], 'Search'],
  ['free', [820, 150, 560, 350], 'Free'],
  ['going', [392, 150, 720, 450], 'Going'],
  ['addcal', [380, 450, 720, 450], 'Calendar'],
];
function sceneRecap(ctx, u, IMG) {
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, W, H);
  riseText(ctx, 'THE WHOLE SEASON ON ONE PAGE', 96, 140, 96, '#fff', u, 119.6, { stagger: 0.015, exit: 139.2 });
  const tw = 480, th = 300, gx = 48, gy = 100, x0 = (W - (3 * tw + 2 * gx)) / 2, y0 = 210;
  TILES.forEach(([key, [sx, sy, sw, sh], label], i) => {
    const lit = 122 + i * 2;
    const k = springU(u, 119.6 + i * 0.12, SPRING.snappy);
    if (k <= 0) return;
    const out = E.inBack(prog(u, 138.8 + i * 0.06, 139.6 + i * 0.06), 1.4);
    const x = x0 + (i % 3) * (tw + gx), y = y0 + Math.floor(i / 3) * (th + gy) + (1 - k) * 80 - out * (H + 300);
    const on = prog(u, lit, lit + 0.6);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, tw, th); ctx.shadowColor = 'transparent';
    const img = IMG[key];
    if (img) { const a = sw / sh, b = tw / th; const cw = a > b ? sh * b : sw, ch = a > b ? sh : sw / b; ctx.drawImage(img, sx * 2, sy * 2, cw * 2, ch * 2, x, y, tw, th); }
    ctx.fillStyle = `rgba(14,33,49,${0.62 * (1 - on)})`; ctx.fillRect(x, y, tw, th);
    if (on > 0) { ctx.strokeStyle = C.amber; ctx.lineWidth = 6; ctx.globalAlpha = on; ctx.strokeRect(x - 3, y - 3, tw + 6, th + 6); ctx.globalAlpha = 1; }
    // number + label
    const ky = springU(u, lit, SPRING.bouncy);
    ctx.fillStyle = on > 0 ? C.amber : C.soft; ctx.beginPath(); ctx.arc(x + 34, y + th + 44, 26, 0, M.TAU); ctx.fill();
    text(ctx, String(i + 1), x + 34, y + th + 59, fD(40), C.deep, 'center');
    text(ctx, label.toUpperCase(), x + 76, y + th + 62 + (1 - Math.min(1, ky)) * 10, fD(52), on > 0 ? '#fff' : C.soft);
    ctx.restore();
  });
}

function sceneEnd(ctx, u, IMG) {
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.25;
  cover(ctx, IMG.reds, 0, 0, W, H, { zoom: lz(1.1, 1.22, prog(u, 140, 160)), fx: 0.5, fy: 0.4 });
  ctx.restore();
  logoBadge(ctx, IMG.logo, W / 2, 250, 170, springU(u, 139.75, SPRING.bouncy));
  riseText(ctx, 'UK AIRSHOW DATES 2027', W / 2, 560, 140, '#fff', u, 140.6, { align: 'center', stagger: 0.02 });
  const k = springU(u, 143, SPRING.bouncy);
  if (k > 0) {
    ctx.save(); ctx.translate(W / 2, 640); ctx.scale(k, k);
    ctx.font = fD(70); const w = ctx.measureText('46 SHOWS CONFIRMED').width + 70;
    ctx.fillStyle = C.teal; ctx.fillRect(-w / 2, 0, w, 96);
    text(ctx, '46 SHOWS CONFIRMED', 0, 74, fD(70), C.deep, 'center');
    ctx.restore();
  }
  slideLine(ctx, 'ukairshowguide.co.uk', W / 2, 860, fU(66, 700), C.mint, u, 146, { align: 'center' });
  slideLine(ctx, 'Tap I’m going on the shows you are planning', W / 2, 950, fU(42, 500), C.soft, u, 150, { align: 'center' });
}

M.film({
  fonts: [fD(100), fU(40, 500), fU(40, 700)],
  images: {
    hero: 'assets/shots/01-hero.png', filters: 'assets/shots/02-filters.png', june: 'assets/shots/03-june.png',
    search: 'assets/shots/04-search.png', row: 'assets/shots/05-cosford-view.png', going: 'assets/shots/06-cosford-going-view.png',
    addcal: 'assets/shots/07-addcal-view.png', reds: 'assets/photos/hero-arrows-riat23.jpg', free: 'assets/shots/08-free.png', logo: 'assets/logo.png',
  },
  hits: HITS,
  draw(ctx, u, t, IMG) {
    if (u < 8) sceneHook(ctx, u, IMG);
    else if (u < 120) sceneWalk(ctx, u, IMG);
    else if (u < 140) sceneRecap(ctx, u, IMG);
    else sceneEnd(ctx, u, IMG);
  },
});
