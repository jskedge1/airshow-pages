// The Big Guide to UK Airshows: launch video. A pure function of time: window.seek(t) paints frame t.
// Timing comes from timeline.json (written by audio/vo.py from the voice-over), so every card,
// caption and cut lands on the voice. docs/shotlist.md is the plan.
//
// VARIANT (?variant= or window.VARIANT): 'standalone' (default) fills the talking slots with
// photos and story cards; 'presenter' shows a slate there for Jack's own pieces to camera.
import * as M from './lib/motion.js';

const { W, H, E, clamp, lerp, prog, font, text, fill, rrect, cover, noise1 } = M;

const TL = await fetch('timeline.json').then((r) => r.json());
const VARIANT = new URLSearchParams(location.search).get('variant') || window.VARIANT || 'standalone';
const SEC = Object.fromEntries(TL.sections.map((s) => [s.id, s]));
const LINES = TL.lines;
const DUR = TL.duration;

// Brand: the site's navy, one accent (teal), white. Barlow Condensed + Barlow, as on the site.
const C = { navy: '#0E2131', navy2: '#13293C', teal: '#32B4AF', white: '#FFFFFF', light: '#F4F7F9', mute: '#A9BCCB', ink: '#13293C' };
const D = 'Display', U = 'UI';

// what the viewer reads, where it differs from what the voice says
const SHOW = [
  ['two thousand and six', '2006'], ['U K airshow guide dot co dot U K', 'ukairshowguide.co.uk'],
  ['Every U K', 'Every UK'], ['three D', '3D'], ['Fifty four', '54'], ['Thirteen of them', '13 of them'],
];
const disp = (s) => SHOW.reduce((a, [x, y]) => a.split(x).join(y), s);
const ACCENT = ['2006', 'train driver.', 'a website.', 'Bring a chair.', 'room for you.'];

const sp = (t, t0, cfg = M.SPRING.gentle) => M.spring(t - t0, cfg);
const linesIn = (id) => LINES.filter((l) => l.section === id);
const L = (id, i) => linesIn(id)[i];

// ------------------------------------------------------------------ helpers

// photo with a log-space camera move: a/b = [fx, fy, zoom]
function photo(ctx, img, p, a, b) {
  if (!img) return;
  const z = a[2] * (b[2] / a[2]) ** p;
  cover(ctx, img, 0, 0, W, H, { fx: lerp(a[0], b[0], p), fy: lerp(a[1], b[1], p), zoom: z });
}
// a track of photos cut hard on their start times: [{t0, img, a, b}], each moving until the next
function track(ctx, t, IMG, shots, end) {
  let i = shots.length - 1;
  while (i > 0 && t < shots[i].t0) i--;
  const s = shots[i], t1 = i + 1 < shots.length ? shots[i + 1].t0 : end;
  photo(ctx, IMG[s.img], E.inOutSine(clamp((t - s.t0) / (t1 - s.t0))), s.a, s.b);
  if (s.grade) { ctx.fillStyle = s.grade; ctx.fillRect(0, 0, W, H); }
}
// legibility: navy from the lower left
function shade(ctx, k = 1) {
  const g = ctx.createLinearGradient(0, H, W * 0.75, H * 0.2);
  g.addColorStop(0, `rgba(14,33,49,${0.88 * k})`); g.addColorStop(0.55, `rgba(14,33,49,${0.45 * k})`); g.addColorStop(1, 'rgba(14,33,49,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
const wrapCache = new Map();
function wrap(ctx, str, f, maxW) {
  const key = `${f}|${maxW}|${str}`;
  if (wrapCache.has(key)) return wrapCache.get(key);
  ctx.font = f;
  const words = str.split(' '), rows = [];
  let row = [];
  for (const w of words) {
    const tryRow = [...row, w].join(' ');
    if (row.length && ctx.measureText(tryRow).width > maxW) { rows.push(row); row = [w]; } else row.push(w);
  }
  if (row.length) rows.push(row);
  // per word x positions
  const out = rows.map((r) => {
    let x = 0;
    return r.map((w) => { const o = { w, x }; x += ctx.measureText(w + ' ').width; return o; });
  });
  wrapCache.set(key, out);
  return out;
}

// A story card: the words rise row by row out of a mask, timed to the voice. Exits up at tExit.
function card(ctx, t, str, tIn, tExit, { x = 120, bottom = 900, size = 92, maxW = 1180, color = C.white, top = null } = {}) {
  if (t < tIn - 0.1 || t > tExit + 0.3) return;
  const f = font(size, 800, D);
  const rows = wrap(ctx, str, f, maxW);
  const lh = size * 1.02;
  const y0 = top !== null ? top + size : bottom - (rows.length - 1) * lh;
  const ex = E.inCubic(prog(t, tExit, tExit + 0.28));
  ctx.save();
  ctx.globalAlpha = 1 - ex;
  let n = 0;
  rows.forEach((r, ri) => {
    const y = y0 + ri * lh - ex * 50;
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 1.05, W, size * 1.32); ctx.clip();
    for (const o of r) {
      const k = sp(t, tIn - 0.06 + n * 0.035, { stiffness: 230, damping: 24 });
      n++;
      if (k <= 0) continue;
      const bare = (x) => x.replace(/[.,!?]/g, '');
      const accent = ACCENT.some((a) => str.includes(a) && bare(a).split(' ').includes(bare(o.w)));
      text(ctx, o.w, x + o.x, y + (1 - k) * size * 1.1, f, accent ? C.teal : color);
    }
    ctx.restore();
  });
  ctx.restore();
}
// small caps chapter tag above the cards
function tag(ctx, t, str, t0, t1, x = 120, y = 150) {
  const k = sp(t, t0, M.SPRING.snappy), out = E.inCubic(prog(t, t1 - 0.25, t1));
  if (k <= 0 || out >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - out;
  ctx.fillStyle = C.teal; ctx.fillRect(x, y - 26, 6, 34);
  ctx.beginPath(); ctx.rect(x + 18, y - 40, 900, 60); ctx.clip();
  text(ctx, str, x + 22, y + (1 - k) * 40, font(28, 700, U), C.white, 'left', 4);
  ctx.restore();
}
// subtitles (tour and end): the voice, word for word, in a navy band at the bottom
function subtitles(ctx, t, ids) {
  const l = LINES.find((x) => ids.includes(x.section) && t >= x.start - 0.06 && t < x.end + 0.3);
  if (!l) return;
  const a = Math.min(clamp((t - l.start + 0.06) / 0.1), clamp((l.end + 0.3 - t) / 0.12));
  const f = font(36, 600, U);
  if (l.section === 'end' && t >= SEC.end.start + 4) {
    const rows = wrap(ctx, disp(l.text), f, 900);
    ctx.save(); ctx.globalAlpha = a;
    rows.forEach((r, i) => text(ctx, r.map((o) => o.w).join(' '), 118, 900 + i * 48, f, C.ink));
    ctx.restore(); return;
  }
  const rows = wrap(ctx, disp(l.text), f, 1300);
  ctx.save(); ctx.globalAlpha = a;
  rows.forEach((r, i) => {
    const s = r.map((o) => o.w).join(' ');
    ctx.font = f; const w = ctx.measureText(s).width;
    const y = H - 70 - (rows.length - 1 - i) * 52;
    ctx.fillStyle = 'rgba(14,33,49,0.86)'; ctx.fillRect(W / 2 - w / 2 - 20, y - 38, w + 40, 52);
    text(ctx, s, W / 2, y, f, C.white, 'center');
  });
  ctx.restore();
}

// A plain browser window holding a real screenshot. scroll: pixels of page scrolled (in window units).
function padlock(ctx, x, y) {
  ctx.strokeStyle = '#5A6B78'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(x, y - 4, 5, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#5A6B78'; ctx.fillRect(x - 7, y - 4, 14, 11);
}
function browser(ctx, img, x, y, w, h, url, { scroll = 0, zoom = 1, fx = 0.5, fy = 0, dim = 0 } = {}) {
  const bar = 46;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  rrect(ctx, x, y, w, h, 14); ctx.fillStyle = '#E8EDF1'; ctx.fill();
  ctx.restore();
  ctx.save(); rrect(ctx, x, y, w, h, 14); ctx.clip();
  ctx.fillStyle = '#E8EDF1'; ctx.fillRect(x, y, w, bar);
  ['#D74949', '#F5B942', '#2BA84A'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 26 + i * 22, y + bar / 2, 6.5, 0, M.TAU); ctx.fillStyle = c; ctx.fill(); });
  const ux = x + 110, uw = Math.min(w - 140, 620);
  rrect(ctx, ux, y + 9, uw, bar - 18, 14); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  padlock(ctx, ux + 20, y + bar / 2 + 1);
  text(ctx, url, ux + 38, y + bar / 2 + 7, font(19, 500, U), '#33444F');
  // page
  const cy = y + bar, ch = h - bar;
  ctx.beginPath(); ctx.rect(x, cy, w, ch); ctx.clip();
  if (img) {
    const s = (w / img.width) * zoom;
    const dw = img.width * s, dh = img.height * s;
    const maxScroll = Math.max(0, dh - ch);
    const ox = x + (w - dw) * fx, oy = cy - Math.min(scroll, maxScroll) + (zoom > 1 ? (ch - dh) * fy : 0);
    ctx.drawImage(img, ox, oy, dw, dh);
  }
  if (dim) { ctx.fillStyle = `rgba(14,33,49,${dim})`; ctx.fillRect(x, cy, w, ch); }
  ctx.restore();
}
// page scroll in window pixels for an image shown at width w
const pageH = (img, w) => (img ? img.height * (w / img.width) : 0);

// ------------------------------------------------------------------ backgrounds (pre-blurred once)
const BLUR = {};
function makeBlurs(IMG) {
  for (const k of ['blenheim', 'arrows_band', 'train_platform', 'kit', 'campsite', 'seafront', 'hornet', 'typhoon_photo']) {
    const cv = document.createElement('canvas'); cv.width = W / 2; cv.height = H / 2;
    const c = cv.getContext('2d');
    c.filter = 'blur(18px) saturate(0.8)';
    const im = IMG[k], s = Math.max(cv.width / im.width, cv.height / im.height) * 1.15;
    c.drawImage(im, (cv.width - im.width * s) / 2, (cv.height - im.height * s) / 2, im.width * s, im.height * s);
    c.filter = 'none';
    c.fillStyle = 'rgba(14,33,49,0.72)'; c.fillRect(0, 0, cv.width, cv.height);
    BLUR[k] = cv;
  }
}
function bg(ctx, t, key, t0) {
  const cv = BLUR[key];
  const z = 1.06 + 0.04 * clamp((t - t0) / 10);
  ctx.drawImage(cv, -W * (z - 1) / 2 - 20 * clamp((t - t0) / 10), -H * (z - 1) / 2, W * z, H * z);
  // a faint grid, like the site's HUD panels
  ctx.save(); ctx.globalAlpha = 0.06; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 80) { ctx.beginPath(); ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, H); ctx.stroke(); }
  for (let gy = 0; gy < H; gy += 80) { ctx.beginPath(); ctx.moveTo(0, gy + 0.5); ctx.lineTo(W, gy + 0.5); ctx.stroke(); }
  ctx.restore();
}

// ------------------------------------------------------------------ presenter slates
function slate(ctx, t, n, sec) {
  fill(ctx, C.navy2);
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.setLineDash([14, 10]); ctx.lineWidth = 3;
  ctx.strokeRect(96, 80, W - 192, H - 160); ctx.restore();
  text(ctx, `YOUR CLIP ${n}`, W / 2, H / 2 - 40, font(120, 800, D), C.white, 'center');
  const mm = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  text(ctx, `${mm(sec.start)} to ${mm(sec.end)}  ·  ${Math.round(sec.end - sec.start)} seconds`, W / 2, H / 2 + 30, font(40, 600, U), C.teal, 'center');
  const first = linesIn(sec.id)[0];
  if (first) text(ctx, `"${disp(first.text)}"`, W / 2, H / 2 + 100, font(34, 500, U), C.mute, 'center');
}

// ------------------------------------------------------------------ scenes

function sceneOpen(ctx, t, IMG) {
  const s = SEC.open, here = L('open', 2), saying = L('open', 3);
  const jetIn = here.end - 0.25, jetOut = saying.start - 0.35;
  if (VARIANT === 'presenter') {
    slate(ctx, t, 1, s);
  } else if (t >= jetIn && t < jetOut) {
    // the jet: a fast pan with the Typhoon, shaking the frame
    const p = (t - jetIn) / (jetOut - jetIn);
    ctx.save(); M.shake(ctx, t, jetIn, 18, 5, 0.9);
    photo(ctx, IMG.typhoon_pan, E.inOutSine(p), [0.1, 0.5, 1.5], [0.85, 0.45, 1.35]);
    ctx.restore();
  } else {
    photo(ctx, IMG.seafront, E.linear(clamp(t / s.end)), [0.5, 0.55, 1.04], [0.42, 0.62, 1.2]);
    shade(ctx, 0.95);
  }
  if (VARIANT !== 'presenter') {
    card(ctx, t, disp(L('open', 0).text), L('open', 0).start, L('open', 1).start - 0.2, { size: 120 });
    card(ctx, t, disp(L('open', 1).text), L('open', 1).start, here.start - 0.2, { size: 92 });
    // the jet blows this card away
    if (t < jetIn + 0.2) card(ctx, t, disp(here.text), here.start, 1e9, { size: 92 });
    else if (t < jetIn + 1.2) {
      const k = E.inCubic(prog(t, jetIn + 0.2, jetIn + 0.75));
      ctx.save(); ctx.translate(k * 1600, -k * 60); ctx.transform(1, 0, -0.25 * k, 1, 0, 0);
      card(ctx, 1e3, disp(here.text), 0, 2e3, { size: 92 }); ctx.restore();
    }
    card(ctx, t, '...As I was saying.', saying.start, s.end + 1, { size: 72 });
  }
  // open from black
  const fi = 1 - clamp(t / 0.7);
  if (fi > 0) { ctx.fillStyle = `rgba(0,0,0,${fi})`; ctx.fillRect(0, 0, W, H); }
}

function sceneTitle(ctx, t, IMG) {
  const s = SEC.title, t0 = s.start;
  const shots = [
    { t0, img: 'arrows23', a: [0.3, 0.5, 1.05], b: [0.55, 0.45, 1.2] },
    { t0: t0 + 1.5, img: 'f16_burner', a: [0.6, 0.5, 1.15], b: [0.4, 0.5, 1.3] },
    { t0: t0 + 3.0, img: 'apache', a: [0.5, 0.4, 1.05], b: [0.5, 0.35, 1.22] },
    { t0: t0 + 4.5, img: 'hornet', a: [0.3, 0.45, 1.1], b: [0.6, 0.5, 1.3] },
  ];
  track(ctx, t, IMG, shots, s.end);
  shade(ctx, 0.9);
  const big = (str, y, tIn, col) => {
    const f = font(190, 800, D);
    const words = str.split(' ');
    let x = 110;
    words.forEach((w, i) => {
      const k = sp(t, tIn + i * 0.5, { stiffness: 300, damping: 20 });
      ctx.font = f; const ww = ctx.measureText(w + ' ').width;
      if (k > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, y - 190, W, 230); ctx.clip();
        text(ctx, w, x, y + (1 - k) * 220 - E.inBack(prog(t, s.end - 0.35, s.end)) * 260, f, col);
        ctx.restore();
      }
      x += ww;
    });
  };
  big('Every UK airshow.', 560, t0, C.white);
  big('One easy guide.', 760, t0 + 3.0, C.teal);
}

const STORY2 = () => {
  const l = linesIn('slot2');
  return [
    { t0: SEC.slot2.start, img: 'crowdline', a: [0.5, 0.5, 1.05], b: [0.6, 0.45, 1.18] },
    { t0: l[1].start - 0.1, img: 'static', a: [0.4, 0.5, 1.08], b: [0.55, 0.5, 1.2] },
    { t0: l[2].start - 0.1, img: 'carpark', a: [0.6, 0.5, 1.05], b: [0.7, 0.4, 1.25] },
    { t0: l[3].start - 0.1, img: 'leaving', a: [0.5, 0.3, 1.1], b: [0.65, 0.25, 1.25] },
    { t0: l[4].start - 0.1, img: 'train_platform', a: [0.4, 0.5, 1.05], b: [0.6, 0.45, 1.2] },
    { t0: l[5].start - 0.1, img: 'train_platform', a: [0.6, 0.45, 1.2], b: [0.85, 0.4, 1.55], grade: 'rgba(10,20,45,0.45)' },
  ];
};
function sceneSlot2(ctx, t, IMG) {
  const s = SEC.slot2;
  if (VARIANT === 'presenter') return slate(ctx, t, 2, s);
  track(ctx, t, IMG, STORY2(), s.end); shade(ctx);
  tag(ctx, t, 'HOW NOT TO DO AN AIRSHOW', s.start + 0.2, s.end);
  const l = linesIn('slot2');
  l.forEach((x, i) => card(ctx, t, disp(x.text), x.start, i + 1 < l.length ? l[i + 1].start - 0.2 : s.end + 1));
}

function sceneReveal(ctx, t, IMG) {
  const s = SEC.reveal, l = linesIn('reveal');
  fill(ctx, C.navy); bg(ctx, t, 'hornet', s.start);
  card(ctx, t, disp(l[0].text), l[0].start, s.end + 1, { size: 104, maxW: 560, top: 300 });
  card(ctx, t, disp(l[1].text), l[1].start, s.end + 1, { size: 46, maxW: 560, top: 545, color: C.mute });
  const tw = l[1].start + 0.35;
  const k = sp(t, tw, { stiffness: 140, damping: 19 });
  if (k > 0) {
    const w = 1120, h = 700, x = 720, y = 190 + (1 - k) * 900;
    const img = IMG.home_full;
    const scr = E.inOutCubic(prog(t, tw + 1.6, s.end + 0.2)) * (pageH(img, w) * 0.42);
    browser(ctx, img, x, y, w, h, 'ukairshowguide.co.uk', { scroll: scr });
  }
}

function sceneJet(ctx, t, IMG, key, a, b, sec) {
  const p = clamp((t - sec.start) / (sec.end - sec.start));
  ctx.save(); M.shake(ctx, t, sec.start, 10, 7, 0.35);
  photo(ctx, IMG[key], E.outCubic(p), a, b); ctx.restore();
}

// ---- the tour: one window per page, the label on the left
const FEAT = {
  map: { n: '01', title: 'Find your\nairshow', sub: 'Every UK airshow on one map', bg: 'blenheim', wins: [
    { at: 0, img: 'find_full', url: 'ukairshowguide.co.uk/air-shows-guides', scroll: [0, 0.32] },
    { at: 3.4, img: 'map', url: 'ukairshowguide.co.uk/air-shows-guides', zoom: [1.0, 1.55], fx: 0.42, fy: 0.62 }] },
  guide: { n: '02', title: 'Every show,\nin depth', sub: '13 full show guides', bg: 'arrows_band', wins: [
    { at: 0, img: 'show_full', url: 'ukairshowguide.co.uk/eastbourneairshow', scroll: [0, 0.55] }] },
  buses: { n: '03', title: 'Getting there,\nsorted', sub: '54 bus routes, mapped stop by stop', bg: 'train_platform', wins: [
    { at: 0, img: 'train', url: 'ukairshowguide.co.uk/train-to-eastbourne', scroll: [0, 0.4] },
    { at: 4.6, img: 'busidx', url: 'ukairshowguide.co.uk/bus-route', zoom: [1.0, 1.3], fx: 0.5, fy: 0.15 }] },
  cams: { n: '04', title: 'Photography,\nmade simple', sub: '3D guides to 11 cameras', bg: 'kit', wins: [
    { at: 0, img: 'photo_full', url: 'ukairshowguide.co.uk/airshow-photography-hub', scroll: [0, 0.45] },
    { at: 4.2, img: 'cams', url: 'ukairshowguide.co.uk/airshow-photography-hub', zoom: [1.0, 1.4], fx: 0.42, fy: 0.55 }] },
  plan: { n: '05', title: 'Plan the\nwhole day', sub: 'Camping, first timers, rainy days, budgets', bg: 'campsite', wins: [
    { at: 0, img: 'camping_full', url: 'ukairshowguide.co.uk/camping-at-airshows', scroll: [0, 0.35] },
    { at: 3.6, img: 'guides_full', url: 'ukairshowguide.co.uk/visitorplanningguides', scroll: [0.05, 0.4] }] },
  forum: { n: '06', title: 'Join the\ncommunity', sub: 'Airshow Forum and My Airshow Hub', bg: 'seafront', wins: [
    { at: 0, img: 'forum_full', url: 'ukairshowguide.co.uk/community-forum', scroll: [0, 0.3] },
    { at: 3.8, img: 'hub_full', url: 'ukairshowguide.co.uk/how-my-airshow-hub-works', scroll: [0, 0.3] }] },
};
const WX = 700, WY = 130, WW = 1124, WH = 760;

function feature(ctx, t, IMG, id, dx = 0, enterFromBelow = false) {
  const f = FEAT[id], s = SEC[id], lt = t - s.start;
  ctx.save(); ctx.translate(dx, 0);
  // label
  const k = sp(t, s.start + 0.05, M.SPRING.snappy);
  text(ctx, f.n, 96, 300, font(30, 700, U), C.teal, 'left', 3);
  ctx.fillStyle = C.teal; ctx.fillRect(96, 316, 48 * k, 4);
  const tf = font(92, 800, D);
  const rows = f.title.split('\n').map((r) => r.split(' ').map((w) => ({ w })));
  rows.forEach((r, i) => {
    const kk = sp(t, s.start + 0.08 + i * 0.07, { stiffness: 240, damping: 24 });
    const y = 420 + i * 92;
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - 92, 660, 112); ctx.clip();
    text(ctx, r.map((o) => o.w).join(' '), 96, y + (1 - kk) * 110, tf, C.white);
    ctx.restore();
  });
  const sy = 420 + rows.length * 92 + 10;
  const ks = sp(t, s.start + 0.3, M.SPRING.snappy);
  ctx.save(); ctx.globalAlpha = clamp(ks);
  const sf = font(34, 500, U);
  wrap(ctx, f.sub, sf, 520).forEach((r, i) => text(ctx, r.map((o) => o.w).join(' '), 96, sy + i * 46 + (1 - ks) * 20, sf, C.teal));
  ctx.restore();
  // windows: each new one rises over the last
  const live = f.wins.filter((w) => lt >= w.at - 0.001);
  live.slice(-2).forEach((wd, i, arr) => {
    const next = f.wins[f.wins.indexOf(wd) + 1];
    const wEnd = next ? next.at : s.end - s.start;
    const p = clamp((lt - wd.at) / (wEnd - wd.at));
    const kin = wd.at === 0 ? (enterFromBelow ? sp(t, s.start, { stiffness: 150, damping: 20 }) : 1) : sp(t, s.start + wd.at, { stiffness: 160, damping: 21 });
    const covered = i < arr.length - 1 ? sp(t, s.start + arr[arr.length - 1].at, M.SPRING.gentle) : 0;
    const sc = 1 - 0.06 * covered;
    const img = IMG[wd.img];
    ctx.save();
    ctx.translate(WX + WW / 2, WY + WH / 2); ctx.scale(sc, sc); ctx.translate(-(WX + WW / 2), -(WY + WH / 2));
    const y = WY + (1 - kin) * 950;
    const opt = { dim: 0.55 * covered };
    if (wd.scroll) opt.scroll = lerp(wd.scroll[0], wd.scroll[1], E.inOutSine(p)) * pageH(img, WW);
    if (wd.zoom) { opt.zoom = wd.zoom[0] * (wd.zoom[1] / wd.zoom[0]) ** E.inOutSine(p); opt.fx = wd.fx; opt.fy = wd.fy; }
    browser(ctx, img, WX, y, WW, WH, wd.url, opt);
    ctx.restore();
  });
  ctx.restore();
}
const ORDER = ['map', 'guide', 'buses', 'cams', 'plan', 'forum'];
function sceneTour(ctx, t, IMG, id) {
  const s = SEC[id];
  fill(ctx, C.navy); bg(ctx, t, FEAT[id].bg, s.start);
  const prevId = ORDER[ORDER.indexOf(id) - 1];
  const prevSec = prevId && SEC[prevId];
  const whip = prevSec && prevSec.end === s.start;          // straight from another page: a whip pan
  if (whip && t < s.start + 0.7) {
    const k = sp(t, s.start, { stiffness: 170, damping: 22 });
    feature(ctx, Math.min(t, prevSec.end - 1e-3), IMG, prevId, -k * W);
    feature(ctx, t, IMG, id, (1 - k) * W);
  } else feature(ctx, t, IMG, id, 0, !whip);
}

const STORY3 = () => {
  const l = linesIn('slot3');
  return [
    { t0: SEC.slot3.start, img: 'tornado_taxi', a: [0.5, 0.5, 1.05], b: [0.4, 0.5, 1.15] },
    { t0: l[1].start - 0.1, img: 'hub_ready', a: [0.5, 0.5, 1.05], b: [0.5, 0.6, 1.18] },
    { t0: l[2].start - 0.1, img: 'crowdline', a: [0.55, 0.5, 1.08], b: [0.62, 0.45, 1.3] },
    { t0: l[3].start - 0.1, img: 'family', a: [0.5, 0.5, 1.05], b: [0.45, 0.55, 1.15] },
  ];
};
function sceneSlot3(ctx, t, IMG) {
  const s = SEC.slot3, l = linesIn('slot3'), chair = l[4];
  if (VARIANT === 'presenter') { if (t < chair.start - 0.3) return slate(ctx, t, 3, s); }
  if (t >= chair.start - 0.3) {
    // the punchline, in the silence: push in on the folding chairs
    photo(ctx, IMG.front_row, E.outCubic(clamp((t - chair.start + 0.3) / 3.5)), [0.38, 0.75, 1.6], [0.36, 0.8, 1.9]);
    shade(ctx, 0.7);
    card(ctx, t, disp(chair.text), chair.start, s.end + 1, { size: 130 });
    return;
  }
  track(ctx, t, IMG, STORY3(), chair.start - 0.3); shade(ctx);
  l.slice(0, 4).forEach((x, i) => card(ctx, t, disp(x.text), x.start, i < 3 ? l[i + 1].start - 0.2 : chair.start - 0.3));
}

function sceneEnd(ctx, t, IMG) {
  const s = SEC.end, burst = s.start + 4;
  if (t < burst) {
    const shots = [
      { t0: s.start, img: 'jet_vapour', a: [0.5, 0.5, 1.1], b: [0.5, 0.45, 1.3] },
      { t0: s.start + 1, img: 'phantom', a: [0.6, 0.5, 1.15], b: [0.4, 0.5, 1.3] },
      { t0: s.start + 2, img: 'arrows18', a: [0.3, 0.5, 1.1], b: [0.5, 0.5, 1.25] },
      { t0: s.start + 3, img: 'typhoon_pull', a: [0.6, 0.5, 1.1], b: [0.45, 0.5, 1.3] },
    ];
    track(ctx, t, IMG, shots, burst);
    return;
  }
  // end card on the site's light ground; the right side is a photo panel YouTube's end screen sits on
  fill(ctx, C.light);
  const kp = sp(t, burst, { stiffness: 120, damping: 20 });
  ctx.save();
  const px = lerp(W, W * 0.56, kp);
  ctx.beginPath(); ctx.moveTo(px + 140, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(px, H); ctx.closePath(); ctx.clip();
  photo(ctx, IMG.arrows_band, clamp((t - burst) / 12), [0.6, 0.5, 1.1], [0.5, 0.5, 1.2]);
  ctx.fillStyle = 'rgba(14,33,49,0.25)'; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  ctx.fillStyle = C.teal; ctx.save(); ctx.beginPath(); ctx.moveTo(px + 140, 0); ctx.lineTo(px + 152, 0); ctx.lineTo(px + 12, H); ctx.lineTo(px, H); ctx.closePath(); ctx.fill(); ctx.restore();
  // logo lands
  const kl = sp(t, burst + 0.15, { stiffness: 200, damping: 16 });
  if (kl > 0) {
    const lw = 760, lh = lw * IMG.logo.height / IMG.logo.width;
    ctx.save(); ctx.translate(110 + lw / 2, 200 + lh / 2); ctx.scale(0.85 + 0.15 * kl, 0.85 + 0.15 * kl); ctx.globalAlpha = clamp(kl * 1.4);
    ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh); ctx.restore();
  }
  // the address types on as it is said
  const urlLine = L('end', 0);
  const url = 'ukairshowguide.co.uk';
  const n = Math.round(clamp((t - (urlLine.end - 2.0)) / 1.3) * url.length);
  const uf = font(78, 800, D);
  text(ctx, url.slice(0, n), 118, 610, uf, C.ink);
  if (n > 0 && n < url.length) { ctx.font = uf; ctx.fillStyle = C.teal; ctx.fillRect(118 + ctx.measureText(url.slice(0, n)).width + 6, 548, 6, 70); }
  const kf = sp(t, burst + 0.5, M.SPRING.snappy);
  ctx.save(); ctx.globalAlpha = clamp(kf);
  rrect(ctx, 118, 660 + (1 - kf) * 20, 300, 56, 4); ctx.fillStyle = C.teal; ctx.fill();
  text(ctx, 'FREE. ALWAYS.', 268, 698 + (1 - kf) * 20, font(30, 700, U), C.white, 'center', 3);
  ctx.restore();
  const ks = sp(t, L('end', 1).start, M.SPRING.snappy);
  if (ks > 0) { ctx.save(); ctx.globalAlpha = clamp(ks); text(ctx, 'Subscribe for show guides all season', 118, 790, font(34, 500, U), '#4A5A66'); ctx.restore(); }
  // final fade to black over the last half second
  const fo = clamp((t - (DUR - 0.6)) / 0.6);
  if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}

// ------------------------------------------------------------------ the film

const IMAGES = {
  logo: 'assets/logo.png',
  home_full: 'assets/web/home_full.jpg', find_full: 'assets/web/find_full.jpg', map: 'assets/web/map.jpg',
  show_full: 'assets/web/show_full.jpg', train: 'assets/web/train.jpg', busidx: 'assets/web/busidx.jpg',
  photo_full: 'assets/web/photo_full.jpg', cams: 'assets/web/cams.jpg', camping_full: 'assets/web/camping_full.jpg',
  guides_full: 'assets/web/guides_full.jpg', forum_full: 'assets/web/forum_full.jpg', hub_full: 'assets/web/hub_full.jpg',
};
for (const k of ['typhoon_pull', 'arrows23', 'arrows18', 'arrows_band', 'f16_burner', 'f16_spray', 'apache', 'typhoon_photo', 'a400m',
  'hornet', 'blenheim', 'typhoon_pan', 'phantom', 'jet_vapour', 'crowdline', 'family', 'carpark', 'train_platform', 'front_row',
  'seafront', 'static', 'hub_ready', 'tornado_taxi', 'leaving', 'campsite', 'kit']) IMAGES[k] = `assets/photos/${k}.jpg`;

// hits for sfx.mjs (in beats on the 120 BPM grid: seconds x 2)
const b = (s) => +(s * 2).toFixed(2);
const HITS = [];
for (const s of TL.sections) {
  if (['map', 'guide', 'buses', 'cams', 'plan', 'forum'].includes(s.id)) {
    HITS.push([b(s.start), `${s.id} in`, 'whoosh', { len: 0.45, from: 500, to: 2200 }]);
    for (const w of FEAT[s.id].wins.slice(1)) HITS.push([b(s.start + w.at), `${s.id} next page`, 'whoosh', { len: 0.35, from: 2400, to: 700, pan: 0.3 }]);
  }
}
for (const id of ['open', 'slot2', 'slot3']) for (const l of linesIn(id)) HITS.push([b(l.start - 0.05), 'card', 'tick']);
HITS.push([b(SEC.title.start), 'title', 'impact'], [b(SEC.title.start + 3), 'one easy guide', 'thud']);
HITS.push([b(SEC.reveal.start + 3.0), 'site rises', 'whoosh', { len: 0.6, from: 400, to: 1800 }]);
HITS.push([b(SEC.end.start + 4), 'end card', 'impact'], [b(SEC.end.start + 4.2), 'logo', 'bell', { pitch: 'D6' }]);
const urlEnd = L('end', 0).end;
HITS.push([b(urlEnd - 2.0), 'url types', 'type', { len: 1.3, n: 20 }]);
HITS.sort((x, y) => x[0] - y[0]);

M.film({
  fonts: [font(100, 800, D), font(100, 700, D), font(40, 500, U), font(40, 600, U), font(40, 700, U)],
  images: IMAGES,
  hits: HITS,
  samples: (t) => {
    const fast = (a, w) => Math.abs(t - a) < w;
    const jet = TL.sections.some((s) => s.kind === 'jet' && t >= s.start && t < s.end);
    const here = L('open', 2);
    if (jet || (t > here.end - 0.3 && t < L('open', 3).start)) return 8;
    if (TL.sections.some((s) => fast(s.start, 0.8))) return 6;
    return 3;
  },
  init(ctx, IMG) { makeBlurs(IMG); },
  draw(ctx, u, t, IMG) {
    const s = TL.sections.find((x) => t >= x.start && t < x.end) || TL.sections[TL.sections.length - 1];
    switch (s.id) {
      case 'open': sceneOpen(ctx, t, IMG); break;
      case 'title': sceneTitle(ctx, t, IMG); break;
      case 'slot2': sceneSlot2(ctx, t, IMG); break;
      case 'reveal': sceneReveal(ctx, t, IMG); break;
      case 'drop': sceneJet(ctx, t, IMG, 'typhoon_photo', [0.5, 0.5, 1.0], [0.55, 0.45, 1.3], s); break;
      case 'jet1': sceneJet(ctx, t, IMG, 'arrows18', [0.2, 0.5, 1.1], [0.6, 0.5, 1.25], s); break;
      case 'jet2': sceneJet(ctx, t, IMG, 'f16_spray', [0.3, 0.5, 1.15], [0.6, 0.5, 1.3], s); break;
      case 'jet3': sceneJet(ctx, t, IMG, 'a400m', [0.5, 0.5, 1.05], [0.45, 0.4, 1.35], s); break;
      case 'slot3': sceneSlot3(ctx, t, IMG); break;
      case 'end': sceneEnd(ctx, t, IMG); break;
      default: sceneTour(ctx, t, IMG, s.id);
    }
    if (['map', 'guide', 'buses', 'cams', 'plan', 'forum', 'end', 'drop', 'jet1', 'jet2', 'jet3'].includes(s.id) && VARIANT === 'standalone') {
      subtitles(ctx, t, ['map', 'guide', 'buses', 'cams', 'plan', 'forum', 'end']);
    }
  },
});
