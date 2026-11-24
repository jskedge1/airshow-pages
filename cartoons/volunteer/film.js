// Join the team: a 90 s cartoon for The Big Guide to UK Airshows' volunteer pages.
// Pure function of time. Beats on the 96 bpm grid (1 beat = 0.625 s). Plan: docs/shotlist.md.
// Every line of copy comes from join-the-team.html / volunteer-hub.html.
import * as M from './lib/motion.js';
import * as T from './lib/toon.js';

const { W, H, FORMAT, E, prog, clamp, lerp, springU, SPRING, fill, rrect, bump, hash01 } = M;
const { C, fd, fu } = T;
const P = FORMAT.portrait;
const S = FORMAT.safe;
const pick = FORMAT.pick;

const HITS = [
  [0, 'jets in', 'whoosh', { len: 0.8, from: 500, to: 2600 }],
  [0.3, 'title', 'impact'],
  [2, 'pill', 'pop', { pitch: 'A5' }],
  [3, 'Sam pops up', 'boing', { pitch: 'C5', to: 'G5' }],
  [4.5, 'tagline', 'tick'],
  [7.5, 'promise', 'tick'],
  [11.1, 'push to what', 'whoosh', { len: 0.5 }],
  [12.3, 'what heading', 'thud'],
  [14, 'photos', 'pop', { pitch: 'C6' }],
  [14.05, 'flash', 'click'],
  [19, 'video', 'pop', { pitch: 'D6' }],
  [24, 'reviews', 'pop', { pitch: 'E6' }],
  [24.5, 'writing', 'type', { len: 1.2 }],
  [29, 'tips', 'pop', { pitch: 'G6' }],
  [34, 'arrivals', 'pop', { pitch: 'A6' }],
  [34.2, 'jet lands', 'whoosh', { len: 0.6, from: 2000, to: 500 }],
  [38, 'no pro needed', 'bell', { pitch: 'E6' }],
  [43.1, 'push to why', 'whoosh', { len: 0.5 }],
  [44.3, 'why heading', 'thud'],
  [46, 'photo frame', 'pop', { pitch: 'C6' }],
  [48, 'reason 1', 'bell', { pitch: 'C6' }],
  [53, 'reason 2', 'bell', { pitch: 'D6' }],
  [58, 'reason 3', 'bell', { pitch: 'E6' }],
  [63, 'reason 4', 'bell', { pitch: 'G6' }],
  [71.1, 'push to how', 'whoosh', { len: 0.5 }],
  [72.3, 'how heading', 'thud'],
  [74, 'step 1', 'tok', { pitch: 'C5' }],
  [75, 'envelope', 'whoosh', { len: 0.4, from: 900, to: 3000 }],
  [83, 'step 2', 'tok', { pitch: 'D5' }],
  [84.5, 'bubble', 'blip', { pitch: 'A5' }],
  [86.5, 'bubble', 'blip', { pitch: 'E6' }],
  [92, 'step 3', 'tok', { pitch: 'E5' }],
  [93, 'chips', 'tick'],
  [94, 'chips', 'tick'],
  [101, 'step 4', 'tok', { pitch: 'G5' }],
  [102.5, 'upload', 'riser', { len: 0.6 }],
  [110, 'step 5', 'tok', { pitch: 'A5' }],
  [112, 'live', 'bell', { pitch: 'A6' }],
  [119.1, 'push to rules', 'whoosh', { len: 0.5 }],
  [120.3, 'rules heading', 'thud'],
  [121, 'do', 'pop', { pitch: 'C6' }],
  [124, 'check', 'pop', { pitch: 'E6' }],
  [127, 'dont', 'pop', { pitch: 'G6' }],
  [133.1, 'push to end', 'whoosh', { len: 0.5 }],
  [134, 'end card', 'impact'],
  [135, 'url', 'bell', { pitch: 'D6' }],
];

// Sam's blinks: seeded, short.
const blinkAt = (u) => { const k = Math.floor(u / 3.3); const c = k * 3.3 + 1 + hash01(k, 11) * 1.5; return bump(u, c, 0.12); };
const walkPhase = (u) => u * Math.PI;   // one stride per beat

// ---------------------------------------------------------------- shared ground
function field(ctx, u, horizon) {
  T.sky(ctx, C.skyTop, C.skyLow, 0, horizon);
  T.clouds(ctx, u, 6, 3, horizon * 0.12, horizon * 0.55, 10, 0.9);
  T.hills(ctx, horizon + 10, 30, 2.2, 1.3, '#A8D98A', 2);
  ctx.fillStyle = C.grass; ctx.fillRect(0, horizon + 30, W, H);
  T.hills(ctx, horizon + 60, 12, 4, 0.2, C.grassDark, 4);
  ctx.fillStyle = C.grass; ctx.fillRect(0, horizon + 70, W, H);
}

// ---------------------------------------------------------------- V1 hook (0-12)
function hook(ctx, u) {
  const hz = pick({ '16x9': 800, '9x16': 1450 });
  field(ctx, u, hz);
  T.crowd(ctx, hz + 64, pick({ '16x9': 1, '9x16': 0.9 }), u, 8);
  // two jets in formation, already crossing on frame 0, trailing smoke
  const pos = (k) => (t) => {
    const p = (t + 1.2) / 6.5;
    return [lerp(-400, W + 500, p) - k * 210, pick({ '16x9': 250, '9x16': 330 }) + k * 70 - Math.sin(p * Math.PI) * 80];
  };
  [[0, C.teal], [1, C.red]].forEach(([k, col]) => {
    const f = pos(k);
    T.trail(ctx, f, u, 3, pick({ '16x9': 26, '9x16': 22 }), col, 36, 0.7);
    const [x, y] = f(u), [x2, y2] = f(u + 0.05);
    T.jet(ctx, x, y, pick({ '16x9': 0.75, '9x16': 0.6 }), Math.atan2(y2 - y, x2 - x), { stripe: col, flame: 0.6 + 0.3 * Math.sin(u * 20) });
  });
  // purple pill like the page's
  const pk = T.pop(u, 2);
  const tx = S.x + 10, ty = pick({ '16x9': 400, '9x16': 560 });
  T.scaled(ctx, pk, tx + 120, ty - 150, () => T.pill(ctx, 'Volunteer with the guide', tx, ty - pick({ '16x9': 200, '9x16': 230 }), pick({ '16x9': 34, '9x16': 38 }), C.purple, '#FFF'));
  if (P) {
    T.heading(ctx, u, -1.0, 'JOIN THE', tx, ty, 210, C.navy);
    T.heading(ctx, u, -0.6, 'TEAM', tx, ty + 210, 270, C.teal);
  } else {
    T.heading(ctx, u, -1.0, 'JOIN THE TEAM', tx, ty, 240, C.navy, C.teal, 2);
  }
  const lk = E.outCubic(prog(u, 4.5, 5.3));
  if (lk > 0) {
    ctx.save(); ctx.globalAlpha = lk;
    T.lines(ctx, 'Contribute when you can. Cover what you know.', tx, ty + pick({ '16x9': 90, '9x16': 330 }) + (1 - lk) * 30, fd(pick({ '16x9': 60, '9x16': 64 })), C.tealText, pick({ '16x9': 1300, '9x16': 900 }), 70);
    ctx.restore();
  }
  const ok = E.outCubic(prog(u, 7.5, 8.3));
  if (ok > 0) {
    ctx.save(); ctx.globalAlpha = ok;
    const y = ty + pick({ '16x9': 170, '9x16': 500 });
    T.lines(ctx, 'What you can send, why join, and how it works.', tx, y + (1 - ok) * 30, fu(pick({ '16x9': 44, '9x16': 46 }), 600), C.navy, pick({ '16x9': 1300, '9x16': 900 }), 58);
    ctx.restore();
  }
  // Sam pops up from the crowd and waves
  const sk = springU(u, 3, SPRING.bouncy);
  const sx = pick({ '16x9': 1560, '9x16': 780 }), sy = hz + pick({ '16x9': 210, '9x16': 230 });
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, sy + 4); ctx.clip();
  T.person(ctx, sx, sy + (1 - sk) * 420, pick({ '16x9': 1.15, '9x16': 1.05 }), { face: -1, wave: clamp(prog(u, 3.5, 4.2)) * (1 - prog(u, 10, 11)), waveT: u, blink: blinkAt(u), mouth: u > 3.5 && u < 6 ? 'open' : 'smile', hold: 'none' });
  ctx.restore();
}

// ---------------------------------------------------------------- V2 what (12-44)
const WHAT = [
  [14, 'Photos', 'From the crowd line, the car park, the queues', C.teal, 'camera'],
  [19, 'Video', 'Sent as a YouTube, Drive or WeTransfer link', C.red, 'play'],
  [24, 'Reviews', 'An honest write up of your day', C.amber, 'lines'],
  [29, 'Show tips', 'Local know-how: where to park, where to stand', C.purple, 'bulb'],
  [34, 'Arrivals reports', 'What flew in for the show, and when', C.sky, 'jet'],
];
function icon(ctx, kind, x, y, r) {
  ctx.save(); ctx.fillStyle = '#FFF'; ctx.strokeStyle = '#FFF'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'camera') { rrect(ctx, x - r * 0.55, y - r * 0.35, r * 1.1, r * 0.75, r * 0.12); ctx.fill(); ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(x, y + r * 0.02, r * 0.24, 0, M.TAU); ctx.fill(); ctx.fillStyle = '#FFF'; rrect(ctx, x - r * 0.2, y - r * 0.48, r * 0.4, r * 0.2, 3); ctx.fill(); }
  if (kind === 'play') { ctx.beginPath(); ctx.moveTo(x - r * 0.28, y - r * 0.4); ctx.lineTo(x + r * 0.45, y); ctx.lineTo(x - r * 0.28, y + r * 0.4); ctx.closePath(); ctx.fill(); }
  if (kind === 'lines') { ctx.lineWidth = r * 0.14; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - r * 0.42, y - r * 0.3 + i * r * 0.3); ctx.lineTo(x + r * (i === 2 ? 0.1 : 0.42), y - r * 0.3 + i * r * 0.3); ctx.stroke(); } }
  if (kind === 'bulb') { ctx.beginPath(); ctx.arc(x, y - r * 0.1, r * 0.36, 0, M.TAU); ctx.fill(); rrect(ctx, x - r * 0.18, y + r * 0.22, r * 0.36, r * 0.26, 3); ctx.fill(); }
  if (kind === 'jet') { ctx.restore(); T.jet(ctx, x, y, r / 230, -0.2, { body: '#FFF', stripe: C.navy, belly: '#FFF', flame: 0 }); return; }
  ctx.restore();
}
function what(ctx, u) {
  const hz = pick({ '16x9': 760, '9x16': 1360 });
  field(ctx, u, hz);
  T.crowd(ctx, hz + 64, 0.9, u, 21);
  T.heading(ctx, u, 11.5, 'WHAT YOU CAN SEND', S.x, pick({ '16x9': 160, '9x16': 360 }), pick({ '16x9': 120, '9x16': 106 }), C.navy);
  const cx = pick({ '16x9': 760, '9x16': S.x }), cw = pick({ '16x9': 1064, '9x16': S.w });
  const ch = pick({ '16x9': 128, '9x16': 150 }), gap = pick({ '16x9': 18, '9x16': 14 }), y0 = pick({ '16x9': 205, '9x16': 410 });
  // Sam on the left (landscape) / bottom (portrait), the prop changes with the card
  const cur = WHAT.reduce((a, w, i) => (u >= w[0] ? i : a), -1);
  const hold = ['camera', 'phone', 'notepad', 'none', 'none'][Math.max(0, cur)];
  const sx = pick({ '16x9': 380, '9x16': 860 }), sy = pick({ '16x9': 1000, '9x16': 1490 }), ss = pick({ '16x9': 1.5, '9x16': 0.62 });
  const ent = springU(u, 10.9, SPRING.gentle);
  T.person(ctx, sx - (1 - ent) * 500, sy, ss, { face: 1, hold, armUp: hold !== 'none' ? 1 : cur === 4 ? 0.9 : 0, wave: cur === 3 ? 1 : 0, waveT: u * 0.25,
    blink: blinkAt(u), walk: 1 - ent, phase: walkPhase(u), mouth: cur === 3 ? 'open' : 'smile', pack: true });
  if (cur === 3) {   // light bulb above Sam's head
    const k = T.pop(u, 29.2);
    T.scaled(ctx, k, sx + 20 * ss, sy - 380 * ss, () => { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(sx + 20 * ss, sy - 380 * ss, 38 * ss, 0, M.TAU); ctx.fill(); ctx.fillStyle = '#8A6A1E'; ctx.fillRect(sx + 4 * ss, sy - 344 * ss, 32 * ss, 16 * ss); });
  }
  // camera flash: a starburst at the lens, not the whole frame
  const fl = bump(u, 14.1, 0.35);
  if (fl > 0 && !P) {
    ctx.save(); ctx.globalAlpha = fl; ctx.fillStyle = '#FFFFFF'; ctx.translate(sx + 210 * ss * 0.75, sy - 205 * ss);
    for (let i = 0; i < 8; i++) { ctx.rotate(M.TAU / 8); ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(120 * fl, 0); ctx.lineTo(0, 12); ctx.fill(); }
    ctx.restore();
  }
  WHAT.forEach(([b, title, line, col, ic], i) => {
    const k = springU(u, b, SPRING.bouncy);
    if (k <= 0.001) return;
    const y = y0 + i * (ch + gap), x = cx + (1 - k) * 300;
    ctx.save(); ctx.globalAlpha = clamp(k * 1.5);
    T.card(ctx, x, y, cw, ch, { edge: null, r: 20 });
    ctx.fillStyle = col; rrect(ctx, x, y, 16, ch, 8); ctx.fill();
    const r = ch * 0.34;
    T.badge(ctx, x + 40 + r, y + ch / 2, r, col);
    icon(ctx, ic, x + 40 + r, y + ch / 2, r);
    const tx = x + 70 + 2 * r;
    M.text(ctx, title, tx, y + ch * 0.47, fd(pick({ '16x9': 54, '9x16': 60 })), C.navy);
    M.text(ctx, line, tx, y + ch * 0.8, fu(pick({ '16x9': 32, '9x16': 31 }), 600), C.body);
    ctx.restore();
  });
  // "you don't need to be a pro"
  const nk = springU(u, 38, SPRING.snappy);
  if (nk > 0) {
    const bx = pick({ '16x9': 760, '9x16': S.x }), by = pick({ '16x9': 900, '9x16': 1250 }), bw = pick({ '16x9': 1064, '9x16': 690 }), bh = pick({ '16x9': 100, '9x16': 170 });
    ctx.save(); ctx.translate(0, (1 - nk) * 160); ctx.globalAlpha = clamp(nk * 1.4);
    rrect(ctx, bx, by, bw, bh, 18); ctx.fillStyle = C.navy; ctx.fill();
    T.lines(ctx, 'You don\'t need to be a pro. Keen and honest goes a long way.', bx + 34, by + pick({ '16x9': 62, '9x16': 70 }), fu(pick({ '16x9': 36, '9x16': 38 }), 700), '#FFF', bw - 60, 50);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- V3 why (44-72)
const WHY = [
  [48, 'Your name, every time', 'Credit on the site, and on our social posts too.', C.teal],
  [53, 'Your work stays yours', 'You keep the copyright. Ask, and it comes off the site.', C.amber],
  [58, 'No minimum, no rota', 'Send things in when you can. Nobody will chase you.', C.mint],
  [63, 'Honest about it', 'There\'s no pay: it\'s voluntary, and you can stop any time.', C.red],
];
function photoFrame(ctx, u, x, y, w, h) {
  T.card(ctx, x, y, w, h + 70, { edge: null, r: 16 });
  ctx.save(); rrect(ctx, x + 16, y + 16, w - 32, h - 16, 10); ctx.clip();
  T.sky(ctx, '#7CC6E6', '#D8F0F8', y, y + h);
  T.cloud(ctx, x + w * 0.25, y + h * 0.35, 0.7);
  T.cloud(ctx, x + w * 0.8, y + h * 0.6, 0.5);
  ctx.fillStyle = C.grass; ctx.fillRect(x, y + h * 0.82, w, h);
  T.jet(ctx, x + w * 0.55 + Math.sin(u * 0.8) * 6, y + h * 0.48, w / 900, -0.12, { stripe: C.red, flame: 0.6 });
  ctx.restore();
  M.text(ctx, 'Photo by', x + 24, y + h + 46, fu(30, 600), C.body);
  M.text(ctx, 'Sam Carter', x + 150, y + h + 46, fu(30, 700), C.tealText);
}
function why(ctx, u) {
  fill(ctx, C.navy);
  // soft radar rings behind (the site's radar motif)
  ctx.save(); ctx.strokeStyle = 'rgba(95,227,214,0.08)'; ctx.lineWidth = 3;
  for (let i = 1; i < 7; i++) { ctx.beginPath(); ctx.arc(W * 0.25, H * 0.6, i * 160 + (u * 20) % 160, 0, M.TAU); ctx.stroke(); }
  ctx.restore();
  T.heading(ctx, u, 43.5, 'WHY JOIN?', S.x, pick({ '16x9': 165, '9x16': 360 }), pick({ '16x9': 130, '9x16': 140 }), '#FFF', C.teal, 1);
  const fk = springU(u, 43.6, SPRING.bouncy);
  const fx = pick({ '16x9': 130, '9x16': 150 }), fy = pick({ '16x9': 250, '9x16': 410 }), fw = pick({ '16x9': 600, '9x16': 780 }), fh = pick({ '16x9': 400, '9x16': 430 });
  T.scaled(ctx, fk, fx + fw / 2, fy + fh / 2, () => { ctx.save(); ctx.translate(fx + fw / 2, fy + fh / 2); ctx.rotate(-0.035 * (1 - fk) - 0.02); ctx.translate(-(fx + fw / 2), -(fy + fh / 2)); photoFrame(ctx, u, fx, fy, fw, fh); ctx.restore(); });
  // Sam, proud, beside the photo
  const sk = springU(u, 43.4, SPRING.gentle);
  if (!P) T.person(ctx, 430 + (1 - sk) * -600, 1010, 0.95, { face: 1, armUp: 0.55, blink: blinkAt(u), walk: 1 - sk, phase: walkPhase(u), pack: true });
  else T.person(ctx, 900, 905, 0.5, { face: -1, wave: prog(u, 47, 47.6), waveT: u * 0.5, blink: blinkAt(u) });
  WHY.forEach(([b, title, line, col], i) => {
    const k = springU(u, b, SPRING.bouncy);
    if (k <= 0.001) return;
    if (P) {
      const x = S.x, w = S.w, h = 124, y = 945 + i * 136;
      T.scaled(ctx, k, x + w / 2, y + h / 2, () => {
        T.card(ctx, x, y, w, h, { fill: '#1C3A52', edge: null, shadow: false, r: 18 });
        ctx.fillStyle = col; rrect(ctx, x, y, 14, h, 7); ctx.fill();
        T.badge(ctx, x + 70, y + h / 2, 36, col, (bx, by, r) => T.tick(ctx, bx, by, r, C.navy));
        M.text(ctx, title, x + 130, y + 56, fd(50), '#FFF');
        M.text(ctx, line, x + 130, y + 100, fu(30, 600), C.soft);
      });
      return;
    }
    const cw = 470, chh = 340, gap = 24;
    const x = 860 + (i % 2) * (cw + gap), y = 250 + Math.floor(i / 2) * (chh + gap);
    T.scaled(ctx, k, x + cw / 2, y + chh / 2, () => {
      T.card(ctx, x, y, cw, chh, { fill: '#1C3A52', edge: col, shadow: false, r: 18 });
      T.badge(ctx, x + 64, y + 82, 36, col, (bx, by, r) => T.tick(ctx, bx, by, r, C.navy));
      const n = T.lines(ctx, title, x + 30, y + 168, fd(52), '#FFF', cw - 60, 54);
      T.lines(ctx, line, x + 30, y + 168 + (n - 1) * 54 + 56, fu(31, 600), C.soft, cw - 60, 41);
    });
  });
}

// ---------------------------------------------------------------- V4 how (72-120)
const STEPS = [
  [74, 'Send me a message', 'Tell me which shows you go to and what you\'d like to help with.'],
  [83, 'We have a quick chat', 'Usually by email. No forms to fill in, and no interview.'],
  [92, 'Pick your role and your shows', 'One role or a few. Local knowledge is the good stuff.'],
  [101, 'Send your work in', 'Through the Volunteer Hub. Big files can go in as a link.'],
  [110, 'It goes live with your name', 'Jack checks it and adds it to the guide, with your name on it.'],
];
function nodePos(i) {
  if (P) return [140 + i * 200, 760 + (i % 2 ? -50 : 0)];
  return [230 + i * 365, 560 + (i % 2 ? -60 : 0)];
}
function samOnPath(u) {
  // walks to node i over the 2.5 beats after its step starts
  let x, y, walking = 0;
  const [x0, y0] = nodePos(0);
  x = x0 - 300; y = y0;
  for (let i = 0; i < STEPS.length; i++) {
    const b = STEPS[i][0] - 1.2;
    const p = prog(u, b, b + 2.2);
    if (u < b) break;
    const [ax, ay] = i === 0 ? [x0 - 300, y0] : nodePos(i - 1), [bx, by] = nodePos(i);
    const e = E.inOutCubic(p);
    x = lerp(ax, bx, e); y = lerp(ay, by, e) - Math.sin(e * Math.PI) * 30;
    walking = p > 0 && p < 1 ? 1 : 0;
  }
  return [x, y, walking];
}
function stepArt(ctx, u, i, x, y, w, h) {
  const b = STEPS[i][0];
  ctx.save(); rrect(ctx, x, y, w, h, 16); ctx.clip();
  ctx.fillStyle = '#E6F4F3'; ctx.fillRect(x, y, w, h);
  const cx = x + w / 2, cy = y + h / 2, s = Math.min(w, h) / 300;
  if (i === 0) {
    const p = E.inOutCubic(prog(u, b + 0.6, b + 3));
    const ex = lerp(x - 80, x + w * 0.62, p), ey = cy + 20 - Math.sin(p * Math.PI) * 90 * s;
    T.trail(ctx, (t) => { const q = E.inOutCubic(prog(t, b + 0.6, b + 3)); return [lerp(x - 80, x + w * 0.62, q), cy + 20 - Math.sin(q * Math.PI) * 90 * s]; }, u, 1.2, 10 * s, C.mint, 20, 0.8);
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(Math.sin(u * 4) * 0.08); T.envelope(ctx, 0, 0, 150 * s, '#FFF', C.teal); ctx.restore();
    T.person(ctx, x + w * 0.86, y + h - 10 * s, 0.5 * s, { face: -1, wave: prog(u, b + 3, b + 3.4), waveT: u * 0.5, hair: '#2A2A2A', shirt: C.red, lanyard: false, blink: blinkAt(u + 1) });
  }
  if (i === 1) {
    const k1 = T.pop(u, b + 1.5), k2 = T.pop(u, b + 3.5), k3 = T.pop(u, b + 5.5);
    T.person(ctx, x + w * 0.2, y + h - 10 * s, 0.55 * s, { face: 1, blink: blinkAt(u), mouth: bump(u, b + 1.6, 0.8) > 0.2 || bump(u, b + 5.6, 0.8) > 0.2 ? 'open' : 'smile' });
    T.person(ctx, x + w * 0.8, y + h - 10 * s, 0.55 * s, { face: -1, hair: '#2A2A2A', shirt: C.red, lanyard: false, blink: blinkAt(u + 1), mouth: bump(u, b + 3.6, 0.8) > 0.2 ? 'open' : 'smile' });
    T.scaled(ctx, k1, x + w * 0.28, y + h * 0.3, () => T.bubble(ctx, x + w * 0.14, y + h * 0.12, 190 * s, 80 * s, C.teal, true));
    T.scaled(ctx, k2, x + w * 0.7, y + h * 0.22, () => T.bubble(ctx, x + w * 0.52, y + h * 0.05, 190 * s, 80 * s, C.purple, false));
    T.scaled(ctx, k3, x + w * 0.28, y + h * 0.5, () => T.bubble(ctx, x + w * 0.2, y + h * 0.36, 150 * s, 66 * s, C.teal, true));
  }
  if (i === 2) {
    const roles = [['Photos', C.teal], ['Reviews', C.teal], ['Show tips', C.teal]], shows = ['Clacton', 'Duxford', 'Eastbourne'];
    const fs = Math.round(30 * s);
    roles.forEach(([r, c], j) => { const k = T.pop(u, b + 1 + j * 0.5); T.scaled(ctx, k, x + w * 0.5, y + h * 0.3, () => T.pill(ctx, r, x + 30 * s + j * w * 0.31, y + h * 0.3, fs, c, '#FFF')); });
    shows.forEach((r, j) => { const k = T.pop(u, b + 2 + j * 0.5); T.scaled(ctx, k, x + w * 0.5, y + h * 0.62, () => T.pill(ctx, r, x + 30 * s + j * w * 0.31, y + h * 0.62, fs, C.navy, '#FFF')); });
    const tk = T.pop(u, b + 4);
    T.scaled(ctx, tk, x + w * 0.5, y + h * 0.85, () => { M.text(ctx, 'Pick any', x + w * 0.5, y + h * 0.88, fu(28 * s, 700), C.tealText, 'center'); });
  }
  if (i === 3) {
    // phone -> arrow -> hub box
    const ph = [x + w * 0.22, cy + 10 * s];
    ctx.fillStyle = '#1B2530'; rrect(ctx, ph[0] - 50 * s, ph[1] - 90 * s, 100 * s, 180 * s, 16 * s); ctx.fill();
    ctx.fillStyle = '#9ED8F0'; rrect(ctx, ph[0] - 40 * s, ph[1] - 78 * s, 80 * s, 150 * s, 8 * s); ctx.fill();
    T.jet(ctx, ph[0], ph[1] - 10 * s, 0.18 * s, -0.2, { stripe: C.red, flame: 0 });
    const hb = [x + w * 0.72, cy];
    T.card(ctx, hb[0] - 120 * s, hb[1] - 80 * s, 240 * s, 160 * s, { edge: C.teal, r: 14 * s, edgeH: 14 * s });
    M.text(ctx, 'Volunteer', hb[0], hb[1] + 4 * s, fd(40 * s), C.navy, 'center');
    M.text(ctx, 'Hub', hb[0], hb[1] + 46 * s, fd(40 * s), C.teal, 'center');
    for (let j = 0; j < 3; j++) {
      const p = prog(u, b + 1.5 + j * 1.3, b + 2.7 + j * 1.3);
      if (p <= 0 || p >= 1) continue;
      const e = E.inOutCubic(p);
      const px = lerp(ph[0] + 40 * s, hb[0] - 110 * s, e), py = ph[1] - 40 * s - Math.sin(e * Math.PI) * 80 * s;
      ctx.fillStyle = C.amber; rrect(ctx, px - 26 * s, py - 20 * s, 52 * s, 40 * s, 6 * s); ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(px, py, 9 * s, 0, M.TAU); ctx.fill();
    }
  }
  if (i === 4) {
    const k = T.pop(u, b + 0.8, SPRING.gentle);
    T.scaled(ctx, k, cx, cy, () => {
      const pw = 360 * s, phh = 230 * s, px = cx - pw / 2 - 20 * s, py = cy - phh / 2 - 10 * s;
      T.card(ctx, px, py, pw, phh, { edge: C.navy, r: 12 * s, edgeH: 22 * s });
      ctx.save(); rrect(ctx, px + 16 * s, py + 36 * s, pw - 32 * s, phh * 0.55, 6 * s); ctx.clip();
      T.sky(ctx, '#7CC6E6', '#D8F0F8', py, py + phh); T.jet(ctx, px + pw * 0.5, py + phh * 0.4, 0.32 * s, -0.1, { stripe: C.red, flame: 0.5 }); ctx.restore();
      M.text(ctx, 'Photo by Sam Carter', px + 18 * s, py + phh - 22 * s, fu(24 * s, 700), C.tealText);
    });
    const lk = T.pop(u, b + 2, SPRING.bouncy);
    T.scaled(ctx, lk, cx + 150 * s, cy - 90 * s, () => { T.badge(ctx, cx + 150 * s, cy - 90 * s, 50 * s, C.green, (bx, by, r) => T.tick(ctx, bx, by, r)); });
    const lt = T.pop(u, b + 2.5);
    T.scaled(ctx, lt, cx + 150 * s, cy - 10 * s, () => T.pill(ctx, 'LIVE', cx + 150 * s, cy - 10 * s, 26 * s, C.green, '#FFF', 'center'));
  }
  ctx.restore();
}
function how(ctx, u) {
  fill(ctx, C.light);
  ctx.strokeStyle = C.line; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  T.heading(ctx, u, 71.5, 'HOW IT WORKS', S.x, pick({ '16x9': 165, '9x16': 360 }), pick({ '16x9': 130, '9x16': 140 }), C.red);
  const cur = STEPS.reduce((a, st, i) => (u >= st[0] - 1.2 ? i : a), -1);
  // the path, drawn up to the next node as Sam walks
  ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = pick({ '16x9': 8, '9x16': 6 }); ctx.setLineDash([18, 16]); ctx.lineCap = 'round';
  const [px0, py0] = nodePos(0);
  ctx.beginPath(); ctx.moveTo(px0 - 300, py0);
  for (let i = 0; i < 5; i++) {
    const [ax, ay] = i ? nodePos(i - 1) : [px0 - 300, py0], [bx, by] = nodePos(i);
    const p = E.inOutCubic(prog(u, STEPS[i][0] - 1.2, STEPS[i][0] + 1));
    if (p <= 0) break;
    ctx.lineTo(lerp(ax, bx, p), lerp(ay, by, p) - Math.sin(p * Math.PI) * 0);
  }
  ctx.stroke(); ctx.restore();
  const nr = pick({ '16x9': 48, '9x16': 40 });
  for (let i = 0; i < 5; i++) {
    const [x, y] = nodePos(i);
    const k = T.pop(u, 71.6 + i * 0.25);
    const done = cur >= i;
    T.scaled(ctx, k, x, y, () => {
      ctx.fillStyle = 'rgba(19,41,60,0.12)'; ctx.beginPath(); ctx.ellipse(x, y + 4, nr * 1.4, nr * 0.45, 0, 0, M.TAU); ctx.fill();
      T.badge(ctx, x, y + nr * 1.6, nr * 0.75, done ? C.red : C.soft);
      M.text(ctx, String(i + 1), x, y + nr * 1.6 + nr * 0.28, fd(nr * 0.95), '#FFF', 'center');
    });
  }
  const [sx, sy, walking] = samOnPath(u);
  if (u > 71) T.person(ctx, sx, sy, pick({ '16x9': 0.8, '9x16': 0.6 }), { face: 1, walk: walking, phase: walkPhase(u) * 1.4, blink: blinkAt(u), pack: true, wave: cur === 4 ? prog(u, 111, 111.5) : 0, waveT: u * 0.5, mouth: cur === 4 && u > 111 ? 'open' : 'smile' });
  // caption card for the current step
  if (cur < 0) return;
  const cx = S.x, cy = pick({ '16x9': 700, '9x16': 920 }), cw = S.w, ch = pick({ '16x9': 310, '9x16': 560 });
  const ck = springU(u, 73.6, SPRING.snappy);
  ctx.save(); ctx.translate(0, (1 - ck) * 400);
  T.card(ctx, cx, cy, cw, ch, { edge: C.red, r: 20 });
  const st = STEPS[cur];
  const tk = E.outCubic(prog(u, st[0] - 1.2, st[0] - 0.6));
  const artW = pick({ '16x9': 600, '9x16': cw - 60 }), artH = pick({ '16x9': ch - 50, '9x16': 290 });
  const ax = pick({ '16x9': cx + cw - artW - 25, '9x16': cx + 30 }), ay = cy + 30;
  stepArt(ctx, u, cur, ax, ay, artW, artH);
  const tx = cx + 40, ty = pick({ '16x9': cy + 80, '9x16': cy + 390 }), tw = pick({ '16x9': cw - artW - 110, '9x16': cw - 80 });
  ctx.save(); ctx.beginPath(); ctx.rect(cx, cy + 12, pick({ '16x9': cw - artW - 40, '9x16': cw }), ch); ctx.clip();
  ctx.translate(0, (1 - tk) * 60); ctx.globalAlpha = tk;
  T.pill(ctx, `STEP ${cur + 1} OF 5`, tx, ty - 12, 26, C.red, '#FFF');
  M.text(ctx, st[1], tx, ty + pick({ '16x9': 78, '9x16': 72 }), fd(pick({ '16x9': 72, '9x16': 62 })), C.navy);
  T.lines(ctx, st[2], tx, ty + pick({ '16x9': 140, '9x16': 126 }), fu(pick({ '16x9': 38, '9x16': 36 }), 600), C.body, tw, pick({ '16x9': 50, '9x16': 46 }));
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- V5 rules (120-134)
const RULES = [
  [120.2, 'PLEASE DO', C.green, 'tick', ['Send work that\'s your own', 'Be honest: readers trust that']],
  [124, 'CHECK WITH ME FIRST', C.amber, 'bang', ['Close ups of people, especially children', 'Anything from behind the barriers']],
  [127, 'PLEASE DON\'T', C.red, 'cross', ['Fly drones at a show', 'Send other people\'s photos']],
];
function rules(ctx, u) {
  fill(ctx, '#FFFFFF');
  T.heading(ctx, u, 119.5, 'A FEW THINGS I ASK', S.x, pick({ '16x9': 165, '9x16': 360 }), pick({ '16x9': 120, '9x16': 108 }), C.navy);
  RULES.forEach(([b, title, col, ic, items], i) => {
    const k = springU(u, b, SPRING.bouncy);
    if (k <= 0.001) return;
    const w = pick({ '16x9': 560, '9x16': S.w }), h = pick({ '16x9': 640, '9x16': 330 });
    const x = pick({ '16x9': S.x + i * (w + 24), '9x16': S.x }), y = pick({ '16x9': 260, '9x16': 420 + i * (h + 24) });
    ctx.save(); ctx.translate(0, (1 - k) * 200); ctx.globalAlpha = clamp(k * 1.4);
    T.card(ctx, x, y, w, h, { fill: C.light, edge: col, r: 20, edgeH: 14 });
    const r = pick({ '16x9': 52, '9x16': 40 });
    const bx = x + 40 + r, by = y + pick({ '16x9': 50, '9x16': 40 }) + r;
    T.badge(ctx, bx, by, r, col, (X, Y, R) => (ic === 'tick' ? T.tick(ctx, X, Y, R) : ic === 'bang' ? T.bang(ctx, X, Y, R) : T.cross(ctx, X, Y, R)));
    T.lines(ctx, title, pick({ '16x9': x + 40, '9x16': bx + r + 30 }), pick({ '16x9': y + 230, '9x16': by + 20 }), fd(pick({ '16x9': 56, '9x16': 54 })), C.navy, w - pick({ '16x9': 80, '9x16': 200 }), 58);
    items.forEach((s, j) => {
      const yy = pick({ '16x9': y + 330 + j * 140, '9x16': y + 170 + j * 76 });
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 52, yy - 12, 9, 0, M.TAU); ctx.fill();
      T.lines(ctx, s, x + 80, yy, fu(pick({ '16x9': 38, '9x16': 36 }), 600), C.body, w - 120, 48);
    });
    ctx.restore();
  });
}

// ---------------------------------------------------------------- V6 end card (134-144)
function end(ctx, u, IMG) {
  fill(ctx, C.navy);
  const pos = (t) => { const p = (t - 133.6) / 5; return [lerp(-300, W + 400, p), pick({ '16x9': 150, '9x16': 300 }) - Math.sin(p * Math.PI) * 40]; };
  T.trail(ctx, pos, u, 2.5, 22, C.teal, 30, 0.6);
  const [jx, jy] = pos(u);
  T.jet(ctx, jx, jy, 0.55, -0.05, { body: '#E7EDF2', stripe: C.teal, belly: '#FFF', flame: 0.7 });
  const lx = S.x + 10, ly = pick({ '16x9': 470, '9x16': 560 });
  if (P) { T.heading(ctx, u, 134, 'JOIN THE', lx, ly, 170, '#FFF'); T.heading(ctx, u, 134.3, 'TEAM', lx + 640, ly, 170, C.teal); }
  else { T.heading(ctx, u, 134, 'JOIN THE', lx, ly, 170, '#FFF'); T.heading(ctx, u, 134.3, 'TEAM', lx, ly + 160, 170, C.teal); }
  const k = E.outCubic(prog(u, 135, 135.8));
  if (k > 0) {
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 30);
    const y = ly + pick({ '16x9': 260, '9x16': 95 });
    M.text(ctx, 'ukairshowguide.co.uk/join-the-team', lx, y, fu(pick({ '16x9': 44, '9x16': 46 }), 700), C.mint);
    T.lines(ctx, 'Already on the team? Log in to the Volunteer Hub.', lx, y + 70, fu(pick({ '16x9': 34, '9x16': 34 }), 600), C.soft, pick({ '16x9': 720, '9x16': 930 }), 44);
    ctx.restore();
  }
  const bk = springU(u, 134.6, SPRING.gentle);
  const bw = pick({ '16x9': 900, '9x16': 640 }), bh = pick({ '16x9': 570, '9x16': 760 });
  const bx = pick({ '16x9': 900, '9x16': (W - 640) / 2 }), by = pick({ '16x9': 250, '9x16': 760 });
  ctx.save(); ctx.translate(0, (1 - bk) * (H - by)); ctx.translate(bx + bw / 2, by + bh / 2); ctx.rotate(0.02 * (1 - bk)); ctx.translate(-(bx + bw / 2), -(by + bh / 2));
  T.browser(ctx, P ? IMG.joinM : IMG.join, bx, by, bw, bh, { fy: 0, zoom: 1 + 0.03 * prog(u, 134.6, 144) });
  ctx.restore();
  const tk = E.outCubic(prog(u, 136, 137));
  if (tk > 0) { ctx.save(); ctx.globalAlpha = tk; M.text(ctx, 'THE BIG GUIDE TO UK AIRSHOWS', lx, pick({ '16x9': 960, '9x16': 1580 }), fd(pick({ '16x9': 44, '9x16': 44 })), '#FFF'); ctx.restore(); }
}

const SCENES = (IMG) => [
  { a: -10, b: 12, draw: hook },
  { a: 12, b: 44, draw: what, push: 'left' },
  { a: 44, b: 72, draw: why, push: 'left' },
  { a: 72, b: 120, draw: how, push: 'up' },
  { a: 120, b: 134, draw: rules, push: 'left' },
  { a: 134, b: 999, draw: (c, u) => end(c, u, IMG), push: 'up' },
];

let SC = null;
M.film({
  fonts: [fd(100), fu(40, 700), fu(40, 600)],
  images: { join: 'assets/shots/join_desktop.png', joinM: 'assets/shots/join_mobile.png' },
  hits: HITS,
  samples: 6,
  draw(ctx, u, t, IMG) {
    if (!SC) SC = SCENES(IMG);
    ctx.textBaseline = 'alphabetic';
    T.sequence(ctx, u, SC, 0.9);
  },
});
