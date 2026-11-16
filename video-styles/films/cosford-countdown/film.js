// RAF Cosford countdown: pure function of time. window.seek(t) paints frame t.
// Plan: docs/shotlist.md. Facts: raf-cosford.html Key details + uk-airshow-calendar.html (as of 16 Nov 2026).
import * as M from './lib/motion.js';
import { C, fD, fU, lz, photo, riseText, slideLine, pill, logoBadge, drawBox } from './lib/brand.js';

const { W, H, E, prog, lerp, clamp, springU, SPRING, wobble, text, rrect, cover, shake } = M;

const HITS = [
  [0, 'open', 'impact'],
  [1, 'digit 2 lands', 'thud', { pitch: 'D3' }],
  [2, 'digit 0 lands', 'thud', { pitch: 'F3' }],
  [3, 'digit 9 lands', 'thud', { pitch: 'A3' }],
  [4, 'days to go', 'whoosh', { len: 0.35, from: 900, to: 3000 }],
  [8, 'whip to typhoon', 'whoosh', { len: 0.5 }],
  [8.5, 'title', 'impact'],
  [10, 'date', 'pop', { pitch: 'A5' }],
  [11, 'tbc', 'tick'],
  [16, 'calendar card', 'thud'],
  [18, 'box', 'tick'],
  [22, 'zoom in', 'riser', { len: 0.9 }],
  [24, 'times', 'impact'],
  [24.5, 'tile 1', 'thud', { pitch: 'D3' }],
  [26.5, 'tile 2', 'thud', { pitch: 'F3' }],
  [28.5, 'tile 3', 'thud', { pitch: 'A3' }],
  [36, 'tickets', 'impact'],
  [38, 'sold out', 'pop', { pitch: 'D5' }],
  [40, 'under 16s', 'pop', { pitch: 'A5' }],
  [44, 'whip to guide', 'whoosh', { len: 0.45 }],
  [45, 'chip 1', 'blip', { pitch: 'D6' }],
  [46, 'chip 2', 'blip', { pitch: 'F6' }],
  [47, 'chip 3', 'blip', { pitch: 'A6' }],
  [48, 'chip 4', 'blip', { pitch: 'D7' }],
  [52, 'end card', 'impact'],
  [52, 'logo', 'bell', { pitch: 'D6' }],
  [55, 'tiles', 'tick'],
  [57, 'underline', 'whoosh', { len: 0.3, from: 2000, to: 5000 }],
  [59, 'tbc line', 'tick'],
];

// --------------------------------------------------------------- odometer tiles
const TILE = { w: 238, h: 372, gap: 22 };
function tiles(ctx, u, x, y, s, { roll = true, digits = '209', alpha = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  const f = fD(400);
  [...digits].forEach((d, i) => {
    const tx = i * (TILE.w + TILE.gap);
    const land = 1 + i;                         // beat this tile settles
    const k = springU(u, -0.6 + i * 0.12, SPRING.snappy); // tile body springs in
    const sq = 0.06 * wobble(u - land, 2.2, 5);
    ctx.save(); ctx.translate(tx + TILE.w / 2, TILE.h); ctx.scale(1 + sq, (1 - sq) * k); ctx.translate(-TILE.w / 2, -TILE.h);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, 0, TILE.w, TILE.h);
    ctx.strokeStyle = 'rgba(95,227,214,0.55)'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, TILE.w - 3, TILE.h - 3);
    ctx.beginPath(); ctx.rect(0, 0, TILE.w, TILE.h); ctx.clip();
    const target = Number(d);
    // the strip runs down through 2 full turns and lands on the digit
    const p = roll ? E.outCubic(prog(u, -1.2, land)) : 1;
    const pos = target + 20 * (1 - p);          // in digit units
    const base = Math.floor(pos), fr = pos - base;
    for (let k2 = -1; k2 <= 1; k2++) {
      const dv = ((base + k2) % 10 + 10) % 10;
      const yy = TILE.h * 0.82 + (k2 - fr) * TILE.h * -1;
      text(ctx, String(dv), TILE.w / 2, yy, f, '#fff', 'center');
    }
    ctx.restore();
  });
  ctx.restore();
}

// --------------------------------------------------------------- A: the number (0..8)
function sceneNumber(ctx, u, IMG, off = 0) {
  ctx.save(); ctx.translate(off, 0);
  photo(ctx, IMG.cos, { zoom: lz(1.06, 1.2, prog(u, 0, 9)), fx: 0.6, fy: 0.4, shade: 1 });
  ctx.restore();
}
function numberGroup(ctx, u) {
  // group shrinks to the top left from beat 7.4 and stays there through scene B
  const g = springU(u, 7.4, SPRING.gentle);
  const s = lerp(1, 0.3, g), x = lerp(120, 96, g), y = lerp(196, 70, g);
  tiles(ctx, u, x, y, s);
  const dsz = lerp(110, 40, g);
  const dy = y + (TILE.h + 30) * s + dsz;
  if (g < 0.98) pill(ctx, 'COUNTDOWN', 120, 128 - g * 200, 28, C.teal, C.deep, springU(u, 0.2, SPRING.snappy) * (1 - g));
  riseText(ctx, 'DAYS TO GO', x, dy, dsz, C.mint, u, 4, { stagger: 0.05 });
}

// --------------------------------------------------------------- B: the show (8..16)
function sceneShow(ctx, u, IMG, off = 0) {
  ctx.save(); ctx.translate(off, 0);
  photo(ctx, IMG.typhoon, { zoom: lz(1.04, 1.16, prog(u, 7.5, 16.5)), fx: 0.65, fy: 0.45, shade: 1 });
  ctx.restore();
  if (off > W * 0.6) return;
  const x = 120 + off;
  riseText(ctx, 'RAF COSFORD', x, 480, 210, '#fff', u, 8.5, { stagger: 0.04 });
  riseText(ctx, 'AIR SHOW', x, 690, 210, C.mint, u, 8.9, { stagger: 0.04 });
  slideLine(ctx, 'Sunday 13 June 2027', x + 4, 800, fU(64, 700), '#fff', u, 10);
  const k = springU(u, 11, SPRING.bouncy);
  pill(ctx, 'DATE TO BE CONFIRMED', x + 4, 838, 34, null, C.amber, k, { stroke: C.amber });
}

// --------------------------------------------------------------- C: from the calendar (16..24)
function sceneCalendar(ctx, u, IMG) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  const img = IMG.row; if (!img) return;
  const cw = 1760, ch = cw * img.height / img.width;          // 1760 x 288
  const k = springU(u, 15.25, SPRING.snappy);
  const cx = (W - cw) / 2, cy = lerp(H + 40, 420, k);
  // camera: push in on the date panel (17-21), then zoom through it (22-24)
  const p1 = E.inOutCubic(prog(u, 17, 21)), zp = E.inCubic(prog(u, 22, 24));
  const s = lz(1, 1.9, p1) * lz(1, 6, zp);
  const px = cx + cw * 0.0625, py = cy + ch * 0.5;              // date panel centre
  // focus = the page point brought to screen centre
  const fx = lerp(W / 2, px + 330, p1), fy = lerp(H / 2, py + 15, p1);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-lerp(fx, px, zp), -lerp(fy, py, zp));
  slideLine(ctx, 'ON THE UK AIRSHOW DATES 2027 CALENDAR', cx, cy - 50, fU(38, 700), C.soft, u, 15.8);
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#fff'; ctx.fillRect(cx, cy, cw, ch);
  ctx.shadowColor = 'transparent';
  ctx.drawImage(img, cx, cy, cw, ch);
  drawBox(ctx, cx - 10, cy - 10, cw * 0.125 + 20, ch + 20, E.inOutCubic(prog(u, 18, 19.4)), { lw: 6 });
  slideLine(ctx, 'Counting down every day on the site', cx, cy + ch + 70, fU(40, 500), '#fff', u, 19.5);
  ctx.restore();
}

// --------------------------------------------------------------- D: key times (24..36)
const STATS = [['08:00', 'Gates open'], ['11:30', 'Flying from about'], ['300 m', 'Station to gate']];
function sceneTimes(ctx, u, IMG) {
  photo(ctx, IMG.hero, { zoom: lz(1.15, 1.04, prog(u, 24, 36)), fx: 0.6, fy: 0.5, tint: 0.78 });
  riseText(ctx, 'ON THE DAY', 120, 220, 96, C.mint, u, 24, { stagger: 0.04, exit: 35.3 });
  const tw = 520, gap = 40, x0 = (W - (3 * tw + 2 * gap)) / 2;
  STATS.forEach(([big, small], i) => {
    const u0 = 24.5 + i * 2;
    const k = springU(u, u0, SPRING.bouncy);
    if (k <= 0) return;
    const out = E.inBack(prog(u, 35.2 + i * 0.12, 35.9 + i * 0.12), 1.6);
    const x = x0 + i * (tw + gap), y = 330 + out * (H + 200);
    ctx.save(); ctx.translate(x + tw / 2, y + 260); ctx.scale(k, k); ctx.translate(-tw / 2, -260);
    ctx.fillStyle = C.navy; ctx.fillRect(0, 0, tw, 420);
    ctx.fillStyle = C.teal; ctx.fillRect(0, 0, tw, 10);
    text(ctx, big, tw / 2, 250, fD(200), '#fff', 'center');
    text(ctx, small.toUpperCase(), tw / 2, 340, fU(40, 700), C.mint, 'center', 2);
    ctx.restore();
  });
  slideLine(ctx, 'Times from the 2026 show. 2027 times to be confirmed.', W / 2, 870, fU(34, 500), C.soft, u, 31, { align: 'center' });
}

// --------------------------------------------------------------- E: tickets (36..44)
function sceneTickets(ctx, u, IMG, off = 0) {
  ctx.save(); ctx.translate(off, 0);
  photo(ctx, IMG.riat, { zoom: lz(1.12, 1.02, prog(u, 36, 45)), fx: 0.5, fy: 0.35, shade: 1 });
  shake(ctx, u, 36, 14);
  const x = 120;
  const k = springU(u, 35.7, SPRING.bouncy);
  ctx.save(); ctx.translate(x, 330); ctx.rotate(-0.035 * (1 - k));
  pill(ctx, 'TICKET ONLY, IN ADVANCE', 0, 0, 58, C.red, '#fff', k, { pad: 0.45, track: 0.03 });
  ctx.restore();
  riseText(ctx, 'NOTHING IS SOLD', x, 560, 130, '#fff', u, 36.2, { stagger: 0.03 });
  riseText(ctx, 'AT THE GATE', x, 690, 130, '#fff', u, 36.6, { stagger: 0.03 });
  slideLine(ctx, 'The 2026 show sold out in advance.', x, 800, fU(46, 700), C.mint, u, 38);
  slideLine(ctx, 'Under 16s go free with a paying adult.', x, 868, fU(46, 500), '#fff', u, 40);
  ctx.restore();
}

// --------------------------------------------------------------- F: in the guide (44..52)
const TOPICS = ['Ways to arrive', 'Where to stay', 'Plan your day', 'Pick your spot'];
function sceneGuide(ctx, u, IMG, off = 0) {
  ctx.save(); ctx.translate(off, 0);
  photo(ctx, IMG.reds, { zoom: lz(1.1, 1.2, prog(u, 43, 53)), fx: 0.5, fy: 0.5, tint: 0.55, blur: 6 });
  const x = 160;
  riseText(ctx, 'IN THE COSFORD GUIDE', x, 280, 110, '#fff', u, 44.2, { stagger: 0.025 });
  TOPICS.forEach((t, i) => {
    const u0 = 45 + i;
    const k = springU(u, u0, SPRING.bouncy);
    const exit = E.inBack(prog(u, 51.1 + i * 0.08, 51.8 + i * 0.08), 1.5);
    ctx.save(); ctx.translate(-exit * (W + 400), 0);
    pill(ctx, t.toUpperCase(), x + i * 70, 360 + i * 130, 56, i === 3 ? C.amber : C.teal, C.deep, k, { pad: 0.5, track: 0.03 });
    ctx.restore();
  });
  ctx.restore();
}

// --------------------------------------------------------------- G: end card (52..64)
function sceneEnd(ctx, u, IMG) {
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, W, H);
  // a slow drift of the cosford photo, heavily tinted, keeps the end card alive
  ctx.globalAlpha = 0.22; photo(ctx, IMG.cos, { zoom: lz(1.2, 1.32, prog(u, 52, 64)), fx: 0.6 }); ctx.globalAlpha = 1;
  logoBadge(ctx, IMG.logo, W / 2, 250, 180, springU(u, 51.75, SPRING.bouncy));
  riseText(ctx, 'PLAN YOUR COSFORD DAY', W / 2, 560, 130, '#fff', u, 52.5, { align: 'center', stagger: 0.025 });
  slideLine(ctx, 'ukairshowguide.co.uk/cosfordairshow', W / 2, 655, fU(60, 700), C.mint, u, 54, { align: 'center' });
  // small tiles + days to go
  const k = springU(u, 55, SPRING.snappy);
  if (k > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, k);
    const s = 0.32, tw = 3 * TILE.w * s + 2 * TILE.gap * s;
    const label = 'DAYS TO GO';
    ctx.font = fD(90); const lw = ctx.measureText(label).width;
    const x0 = W / 2 - (tw + 24 + lw) / 2;
    tiles(ctx, 100, x0, 745 + (1 - k) * 30, s, { roll: false });
    text(ctx, label, x0 + tw + 24, 745 + TILE.h * s * 0.74 + (1 - k) * 30, fD(90), C.mint);
    ctx.restore();
  }
  // underline draws under the address, then the tbc note: the card keeps evolving while it holds
  const ul = E.inOutCubic(prog(u, 57, 58.5));
  if (ul > 0) { ctx.font = fU(60, 700); const w = ctx.measureText('ukairshowguide.co.uk/cosfordairshow').width; ctx.fillStyle = C.teal; ctx.fillRect(W / 2 - w / 2, 680, w * ul, 6); }
  slideLine(ctx, 'Sunday 13 June 2027, date to be confirmed', W / 2, 1000, fU(42, 500), C.soft, u, 59, { align: 'center' });
}

M.film({
  fonts: [fD(100), fU(40, 500), fU(40, 700)],
  images: {
    cos: 'assets/photos/hero-arrows-cosford23.jpg', typhoon: 'assets/photos/ac-typhoon-pull.jpg',
    hero: 'assets/photos/hero.jpg', riat: 'assets/photos/hero-arrows-riat23.jpg', reds: 'assets/photos/ac-redarrows.jpg',
    row: 'assets/photos/05-cosford-row.png', logo: 'assets/logo.png',
  },
  hits: HITS,
  draw(ctx, u, t, IMG) {
    if (u < 16) {
      // whip A -> B: both on screen, A slides out left as B pushes in from the right
      const w = E.inOutCubic(prog(u, 7.55, 8.15));
      if (w < 1) sceneNumber(ctx, u, IMG, -w * W);
      if (w > 0) sceneShow(ctx, u, IMG, (1 - w) * W);
      numberGroup(ctx, u);
      // navy panel rises to carry us into the calendar card
      const r = E.inCubic(prog(u, 15.3, 16));
      if (r > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, H * (1 - r), W, H * r + 2); ctx.clip(); sceneCalendar(ctx, u, IMG); ctx.restore(); }
    } else if (u < 24) sceneCalendar(ctx, u, IMG);
    else if (u < 36) sceneTimes(ctx, u, IMG);
    else if (u < 52) {
      const w = E.inOutCubic(prog(u, 43.6, 44.2));
      if (w < 1) sceneTickets(ctx, u, IMG, -w * W);
      if (w > 0) sceneGuide(ctx, u, IMG, (1 - w) * W);
    } else sceneEnd(ctx, u, IMG);
  },
});
