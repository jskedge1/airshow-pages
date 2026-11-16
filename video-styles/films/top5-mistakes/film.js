// 5 mistakes at your first airshow. Pure function of time; window.seek(t) paints frame t.
// Plan: docs/shotlist.md. Advice from the site's first airshow guides (on the day, what to pack,
// getting there, getting home). Guide photos are the site's AI images and carry a note, as on the site.
import * as M from './lib/motion.js';
import { C, fD, fU, lz, photo, riseText, slideLine, pill, logoBadge, aiNote } from './lib/brand.js';

const { W, H, E, prog, lerp, clamp, springU, SPRING, wobble, text, cover } = M;

const ITEMS = [
  { n: 5, img: 'pack', title: ['PACKING ONLY', 'FOR SUNSHINE'],
    say: ['Pack for sun and rain on the same day:', 'water, sun cream and a waterproof.'],
    tip: ['Two litres of water each on a hot day.', 'Freeze a bottle overnight.'], fx: 0.5, fy: 0.5 },
  { n: 4, img: 'kids', title: ['NO EAR DEFENDERS', 'FOR THE CHILDREN'],
    say: ['Ear defenders are the best buy', 'for children at an airshow.'],
    tip: ['Pack a pair for every child. Fast jets', 'are loud, even from the crowd line.'], fx: 0.35, fy: 0.45 },
  { n: 3, img: 'home', title: ['LEAVING WITH', 'EVERYONE ELSE'],
    say: ['The first hour after the finale is the', 'busiest. Stay an hour, or go early.'],
    tip: ['Screenshot your last train in the morning,', 'and keep 30% battery for the trip home.'], fx: 0.45, fy: 0.5 },
  { n: 2, img: 'pitch', title: ['NOT SAVING', 'YOUR PITCH FIRST'],
    say: ['Head straight to the crowd line and save', 'your pitch with chairs and a blanket.'],
    tip: ['Then agree a meeting point everyone can', 'find, like a large static aircraft.'], fx: 0.4, fy: 0.55 },
  { n: 1, img: 'gate', title: ['TURNING UP AS', 'THE GATES OPEN'],
    say: ['Arrive about an hour before the gates', 'open. Always check before you travel.'],
    tip: ['Park and ride at the bigger shows is quick', 'on the way in, as arrivals spread out.'], fx: 0.35, fy: 0.5 },
];
const B0 = 16, SPAN = 32;                       // mistake i runs B0 + i*SPAN .. +SPAN
const base = (i) => B0 + i * SPAN;

const HITS = [
  [0, 'open', 'impact'],
  [2, 'subtitle', 'thud'],
  [5, 'how to avoid', 'pop', { pitch: 'G5' }],
  [8, 'pips', 'tick'], [8.5, 'pip', 'tick'], [9, 'pip', 'tick'], [9.5, 'pip', 'tick'], [10, 'pip', 'tick'],
  [16, 'panel in', 'swell', { len: 0.8 }],
];
ITEMS.forEach((it, i) => {
  const b = base(i), last = it.n === 1;
  HITS.push(
    [b, `#${it.n}`, last ? 'impact' : 'thud', { pitch: ['G2', 'A2', 'B2', 'D3', 'E3'][i] }],
    [b + 2, 'title', 'pop', { pitch: 'D6' }],
    [b + 6, 'advice', 'tick'],
    [b + 11, 'punch in', 'whoosh', { len: 0.4, from: 700, to: 2200 }],
    [b + 16, 'tip', 'pop', { pitch: 'G5' }],
    [b + 22, 'marker', 'whoosh', { len: 0.35, from: 1500, to: 4000 }],
    [b + 24, 'done', 'blip', { pitch: 'G6' }],
    [b + 26, 'pan', 'whoosh', { len: 0.8, from: 400, to: 900 }],
  );
  if (i < 4) HITS.push([b + 32, 'next', 'swell', { len: 0.7 }]);
});
HITS.push([176, 'end card', 'impact'], [176.5, 'logo', 'bell', { pitch: 'G6' }], [179, 'url', 'tick'], [182, 'line', 'tick'], [186, 'underline', 'whoosh', { len: 0.3, from: 2000, to: 5000 }]);

// slanted photo panel: top edge starts at x0+180, bottom at x0
const PX = 900;
function slant(ctx, x0) { ctx.beginPath(); ctx.moveTo(x0 + 180, 0); ctx.lineTo(W + 10, 0); ctx.lineTo(W + 10, H); ctx.lineTo(x0, H); ctx.closePath(); }
function photoPanel(ctx, img, x0, zoom, fx, fy) {
  if (!img) return;
  ctx.save(); slant(ctx, x0); ctx.clip();
  cover(ctx, img, x0, 0, W - x0, H, { zoom, fx, fy });
  ctx.restore();
}

function pips(ctx, u, x, y, cur, k = 1) {
  for (let j = 0; j < 5; j++) {
    const kk = clamp(springU(u, 8 + j * 0.5, SPRING.snappy)) * k;
    if (kk <= 0) continue;
    let col = C.soft;
    if (j < cur) col = C.teal;
    else if (j === cur) col = u > base(cur) + 24 ? C.teal : C.red;
    ctx.fillStyle = col; ctx.fillRect(x + j * 92, y, 76 * kk, 12);
  }
}

// ------------------------------------------------------------------ intro (0..16)
function sceneIntro(ctx, u, IMG) {
  photo(ctx, IMG.reds, { zoom: lz(1.18, 1.04, E.outCubic(prog(u, 0, 16))), fx: 0.6, fy: 0.4, shade: 1 });
  riseText(ctx, '5 MISTAKES', 110, 420, 300, '#fff', u, -0.6, { stagger: 0.03 });
  riseText(ctx, 'AT YOUR FIRST AIRSHOW', 116, 570, 120, C.mint, u, 2, { stagger: 0.02 });
  slideLine(ctx, 'and how to avoid them', 120, 660, fU(56, 500), '#fff', u, 5);
  pips(ctx, u, 120, 730, -1);
  slideLine(ctx, 'From the UK Airshow Guide first airshow planning guides', 120, 990, fU(34, 500), C.soft, u, 11);
}

// ------------------------------------------------------------------ one mistake
function sceneItem(ctx, u, IMG, i) {
  const it = ITEMS[i], b = base(i), last = it.n === 1;
  ctx.fillStyle = C.light; ctx.fillRect(0, 0, W, H);
  // photo: previous one underneath while the new slant wipes in from the right
  const wipe = E.inOutCubic(prog(u, b - 0.8, b));
  const z = lz(1.05, 1.1, prog(u, b, b + 11)) * lz(1, 1.08, E.outCubic(prog(u, b + 11, b + 12.5))) * lz(1, 1.04, prog(u, b + 12.5, b + 32));
  if (i > 0 && wipe < 1) photoPanel(ctx, IMG[ITEMS[i - 1].img], PX, 1.22, ITEMS[i - 1].fx, ITEMS[i - 1].fy);
  const pan = 0.1 * E.inOutCubic(prog(u, b + 26, b + 29.5));
  photoPanel(ctx, IMG[it.img], lerp(W, PX, wipe), z, clamp(it.fx + pan), it.fy);
  aiNote(ctx, W - 40, 70, prog(u, b + 0.5, b + 1.5));

  // label + number
  text(ctx, '5 MISTAKES AT YOUR FIRST AIRSHOW', 110, 100, fU(36, 700), C.body, 'left', 3);
  const nk = springU(u, b - 0.15, SPRING.bouncy);
  const out = E.inBack(prog(u, b + 30.3, b + 31.1), 1.6);
  if (nk > 0) {
    const size = last ? 520 : 470;
    const sq = 0.05 * wobble(u - b, 2.2, 4);
    ctx.save(); ctx.translate(100, 560 - out * 900); ctx.scale(1 + sq, (1 - sq) * Math.min(nk, 1.2));
    ctx.beginPath(); ctx.rect(-20, -size, 900, size * 1.05); ctx.clip();
    text(ctx, `#${it.n}`, 0, (1 - Math.min(1, nk)) * size * 0.4, fD(size), last ? C.red : C.teal);
    ctx.restore();
  }
  pips(ctx, u, 112, 600, i);

  // title, advice
  const ex = b + 30.4;
  // amber marker sweeps behind the second title line
  const mk = E.inOutCubic(prog(u, b + 22, b + 23)) * (1 - prog(u, ex, ex + 0.5));
  if (mk > 0) { ctx.font = fD(104); const mw = ctx.measureText(it.title[1]).width + 24; ctx.fillStyle = C.amber; ctx.fillRect(98, 835 - 44, mw * mk, 54); }
  riseText(ctx, it.title[0], 110, 730, 104, C.navy, u, b + 2, { stagger: 0.02, exit: ex });
  riseText(ctx, it.title[1], 110, 835, 104, C.navy, u, b + 2.4, { stagger: 0.02, exit: ex + 0.1 });
  const ao = 1 - prog(u, ex, ex + 0.6);
  ctx.save(); ctx.globalAlpha = ao;
  slideLine(ctx, it.say[0], 112, 920, fU(40, 500), C.body, u, b + 6);
  slideLine(ctx, it.say[1], 112, 972, fU(40, 500), C.body, u, b + 7);
  ctx.restore();

  // TIP card on the photo
  const tk = springU(u, b + 16, SPRING.snappy);
  if (tk > 0) {
    const cw = 860, ch = 210, cx = W - cw - 60, cy = H - ch - 60 + (1 - tk) * 300 + E.inBack(prog(u, b + 30.2, b + 31), 1.5) * 400;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    ctx.fillStyle = C.navy; ctx.fillRect(cx, cy, cw, ch); ctx.shadowColor = 'transparent';
    ctx.fillStyle = C.amber; ctx.fillRect(cx, cy, 12, ch);
    pill(ctx, 'TIP', cx + 44, cy + 26, 30, C.amber, C.deep, springU(u, b + 16.4, SPRING.bouncy), { track: 0.1 });
    slideLine(ctx, it.tip[0], cx + 44, cy + 130, fU(40, 700), '#fff', u, b + 17);
    slideLine(ctx, it.tip[1], cx + 44, cy + 182, fU(40, 700), '#fff', u, b + 18);
    ctx.restore();
  }
}

// ------------------------------------------------------------------ end card (176..192)
function sceneEnd(ctx, u, IMG) {
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.22;
  cover(ctx, IMG.reds, 0, 0, W, H, { zoom: lz(1.1, 1.22, prog(u, 176, 192)), fx: 0.6, fy: 0.4 });
  ctx.restore();
  logoBadge(ctx, IMG.logo, W / 2, 250, 170, springU(u, 175.75, SPRING.bouncy));
  riseText(ctx, 'PLANNING YOUR FIRST AIRSHOW', W / 2, 560, 130, '#fff', u, 176.4, { align: 'center', stagger: 0.02 });
  const url = 'ukairshowguide.co.uk/planning-your-first-airshow';
  slideLine(ctx, url, W / 2, 670, fU(58, 700), C.mint, u, 179, { align: 'center' });
  slideLine(ctx, 'Four stops to your first show, from ticket to getting home', W / 2, 790, fU(48, 500), C.soft, u, 182, { align: 'center' });
  const ul = E.inOutCubic(prog(u, 186, 187.5));
  if (ul > 0) { ctx.font = fU(58, 700); const w = ctx.measureText(url).width; ctx.fillStyle = C.teal; ctx.fillRect(W / 2 - w / 2, 694, w * ul, 6); }
  pips(ctx, 200, W / 2 - 226, 880, 5);
}

M.film({
  fonts: [fD(100), fU(40, 500), fU(40, 700)],
  images: {
    reds: 'assets/photos/hero-arrows-riat23.jpg', pack: 'assets/photos/day-pack-flatlay.jpg', kids: 'assets/photos/young-children.jpg',
    home: 'assets/photos/getting-home.jpg', pitch: 'assets/photos/front-row.jpg', gate: 'assets/photos/gate-queue.jpg', logo: 'assets/logo.png',
  },
  hits: HITS,
  draw(ctx, u, t, IMG) {
    if (u < B0) {
      sceneIntro(ctx, u, IMG);
      // the light panel slides in from the left, carrying the first mistake
      const p = E.inOutCubic(prog(u, 15.2, 16));
      if (p > 0) { ctx.save(); ctx.translate(-(1 - p) * W, 0); sceneItem(ctx, u, IMG, 0); ctx.restore(); }
    } else if (u < 176) sceneItem(ctx, u, IMG, Math.min(4, Math.floor((u - B0 + 0.8) / SPAN)));
    else sceneEnd(ctx, u, IMG);
  },
});
