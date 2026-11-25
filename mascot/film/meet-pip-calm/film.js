// Meet Pip: Pip introduces themselves in speech bubbles: who I am, who I'm for, how I can help, and where you'll
// see me. Same look as "Plan it with Pip" (version 2): the calm cartoon kit from "The Captain's Checklist"
// (videos/ on claude/quirky-fermi-uygguc), square corners, Charlie and Dad, the swoosh badge end card.
// Wording from the Pip brand book (mascot/brand.html). 96 beats at 80 bpm (72 s), 16x9. Pure function of time.
import * as K from './shared/kit.js';
const { M, C, F } = K;
const { W, H, TAU, clamp, lerp, prog, E, springU, SPRING, hash01 } = M;

const GY = 560, FEET = 750;
const WALL = '#EFE6D6', FLOOR = '#E3D6C0';
const PLAN = '#23908C', INFORM = '#1F4E8C', PREPARE = '#D74949';
const ITEMS = ['Who I am', "Who I'm for", 'How I help', "Where you'll see me"];
const S0 = 8, STEP = 16;
const at0 = (i) => S0 + i * STEP;
const TICKS = ITEMS.map((_, i) => at0(i) + STEP - 1.4);
const PAY = at0(4), END = PAY + 8;                 // 72, 80

const HITS = [
  [0.3, 'caption', 'tok', { pitch: 'G4', gain: 0.2 }], [2.0, 'Pip lands', 'pop', { pitch: 'D5', to: 'G4', gain: 0.14 }],
  ...ITEMS.map((_, i) => [at0(i) + 0.3, `part ${i + 1}`, 'tok', { pitch: ['G4', 'A4', 'B4', 'D5'][i], gain: 0.22 }]),
  ...TICKS.map((b, i) => [b, `tick ${i + 1}`, 'bell', { pitch: ['G5', 'A5', 'B5', 'D6'][i], gain: 0.09 }]),
  ...[0, 1, 2].map((i) => [at0(0) + 6 + i * 0.9, `letter ${i + 1}`, 'pop', { pitch: ['G4', 'B4', 'D5'][i], gain: 0.16 }]),
  ...[0, 1, 2].map((i) => [at0(1) + 2.4 + i * 3.6, `who ${i + 1}`, 'blip', { pitch: ['G5', 'A5', 'B5'][i], gain: 0.1 }]),
  ...[0, 1, 2].map((i) => [at0(2) + 1.6 + i * 4.4, `help ${i + 1}`, 'pop', { pitch: ['G4', 'B4', 'D5'][i], gain: 0.15 }]),
  ...[0, 1, 2, 3].map((i) => [at0(3) + 1.6 + i * 3.3, `where ${i + 1}`, 'blip', { pitch: ['G5', 'A5', 'B5', 'D6'][i], gain: 0.1 }]),
  [PAY + 1.2, 'airshow season', 'bell', { pitch: 'G5', gain: 0.1 }],
  [END, 'end card', 'bell', { pitch: 'D6', gain: 0.12 }], [END + 2.4, 'Pip waves', 'pop', { pitch: 'D5', gain: 0.12 }],
];

// ---------------------------------------------------------------- helpers
const rr = (ctx, x, y, w, h, r, col) => K.rr(ctx, x, y, w, h, 0, col);   // house rule: square corners
const armMix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const popAt = (ctx, x, y, k, fn, rot = 0) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(k, k); fn(); ctx.restore(); };
const pillPop = (ctx, u, a, x, y, str, o = {}) => popAt(ctx, x, y, K.pop(u, a), () => K.pill(ctx, 0, 0, str, { align: 'center', size: 36, ...o }));
function room(ctx, wall = WALL, floorY = 800) { M.fill(ctx, wall); ctx.fillStyle = FLOOR; ctx.fillRect(0, floorY, W, H - floorY); ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, floorY, W, 10); }
function showground(ctx, u) { K.sky(ctx); K.clouds(ctx, u, 150, 5); K.horizon(ctx, GY); K.ground(ctx, GY); K.fence(ctx, GY + 54); }
function along(pts, p) {
  let total = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let left = total * clamp(p);
  for (let i = 1; i < pts.length; i++) {
    if (left <= seg[i - 1] || i === pts.length - 1) { const k = clamp(left / seg[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; }
    left -= seg[i - 1];
  }
  return pts[0];
}
const charlie = (ctx, x, y, s, o = {}) => K.kid(ctx, x, y, s, o);

// ---------------------------------------------------------------- Pip (the site's mascot, from mascot/mascot.js)
let IMGS = {};
// size = Pip's height from tail to wheels; (x, y) = where the wheels touch the ground
function pip(ctx, pose, x, y, size, u, o = {}) {
  let im = IMGS['pip_' + pose];
  if (pose === 'hello') im = IMGS['pip_hello' + (Math.floor(((u * 1.2) % 1) * 6) % 6)];
  if (pose === 'rest' && ((u + (o.seed || 0)) % 3.6) > 3.45) im = IMGS.pip_blink;
  if (!im) return;
  const s = size / 0.62, bob = o.still ? 0 : Math.sin(u * 1.6) * size * 0.015;
  ctx.save(); ctx.translate(x, y + bob);
  if (o.flip) ctx.scale(-1, 1);
  if (o.squash) ctx.scale(1 + o.squash, 1 - o.squash);
  ctx.drawImage(im, -s / 2, -s * 0.936, s, s);
  ctx.restore();
}
function pipFly(ctx, x, y, w, rot) { const im = IMGS.pip_fly; if (!im) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(im, -w / 2, -w / 2, w, w); ctx.restore(); }

// Pip's speech bubble: a square box with a straight tail. (x, y) = top left; (tx, ty) = the tip of the tail, by Pip.
function say(ctx, u, a, b, str, x, y, tx, ty, o = {}) {
  if (u < a || u > b) return;
  const k = K.pop(u, a, SPRING.bouncy), out = E.inCubic(prog(u, b - 0.35, b));
  const sc = Math.max(0.01, k * (1 - out));
  const size = o.size || 46, f = F(size, 700), w = o.w || 560, pad = 30;
  const lines = K.wrap(ctx, str, f, w - pad * 2);
  const h = pad * 2 + 30 + lines.length * size * 1.18;
  const cx = clamp(tx, x + 60, x + w - 60);
  ctx.save(); ctx.translate(tx, ty); ctx.scale(sc, sc); ctx.translate(-tx, -ty);
  ctx.save(); ctx.globalAlpha *= 0.14; rr(ctx, x + 6, y + 10, w, h, 0, '#000'); ctx.restore();
  ctx.beginPath(); ctx.moveTo(cx - 34, y + h - 2); ctx.lineTo(tx, ty); ctx.lineTo(cx + 34, y + h - 2); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill();
  rr(ctx, x, y, w, h, 0, C.white); rr(ctx, x, y, w, 10, 0, '#23908C');
  M.text(ctx, 'Pip', x + pad, y + pad + 22, F(30, 800), '#23908C');
  lines.forEach((l, i) => M.text(ctx, l, x + pad, y + pad + 30 + (i + 0.85) * size * 1.18, f, C.ink));
  ctx.restore();
}

// The progress strip: four boxes, one for each part.
function strip(ctx, u) {
  const k = K.pop(u, S0 - 0.4, SPRING.gentle);
  if (k <= 0 || u > END + 0.4) return;
  const big = K.ease(u, PAY + 0.3, PAY + 1.6), sc = lerp(1, 1.5, big);
  const bw = 52, gap = 14, pad = 20, n = ITEMS.length, w = pad * 2 + n * bw + (n - 1) * gap, h = 88;
  const x = lerp(60, (W - w * 1.5) / 2, big), y = lerp(36, 40, big) - (1 - k) * 180;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.save(); ctx.globalAlpha = 0.14; rr(ctx, 4, 8, w, h, 0, '#000'); ctx.restore();
  rr(ctx, 0, 0, w, h, 0, C.white);
  const cur = TICKS.findIndex((b) => u < b);
  for (let i = 0; i < n; i++) {
    const cx = pad + i * (bw + gap) + bw / 2, cy = h / 2;
    const tk = K.pop(u, TICKS[i], SPRING.bouncy), done = u >= TICKS[i];
    const s = done ? 0.85 + 0.15 * Math.min(1.15, tk) : 1;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    if (done) { rr(ctx, -bw / 2, -bw / 2, bw, bw, 0, C.teal); K.tick(ctx, -1, 1, 0.82, clamp(tk * 1.2), C.white, 9); }
    else {
      const on = i === cur && u >= S0;
      rr(ctx, -bw / 2, -bw / 2, bw, bw, 0, on ? C.teal : '#C9D2DA'); rr(ctx, -bw / 2 + 5, -bw / 2 + 5, bw - 10, bw - 10, 0, on ? C.tealSoft : C.white);
      M.text(ctx, String(i + 1), 0, 12, F(34, 800), on ? C.ink : C.greyDark, 'center');
    }
    ctx.restore();
  }
  ctx.restore();
}

// a fan with a camera, for the regulars and enthusiasts (no lanyard)
const FAN = { adult: true, skin: '#C99672', hair: '#2B2B33', hairStyle: 'short', top: '#3F7FBF', bottom: '#2E3B4E', shoe: '#2B2B33' };
const fan = (ctx, x, y, s, o = {}) => K.person(ctx, x, y, s, { ...FAN, ...o });
// a square card with a coloured top band
function card(ctx, x, y, w, h, k, band, title, draw, rot = 0) {
  popAt(ctx, x + w / 2, y + h / 2, k, () => {
    ctx.save(); ctx.globalAlpha *= 0.14; rr(ctx, -w / 2 + 8, -h / 2 + 12, w, h, 0, '#000'); ctx.restore();
    rr(ctx, -w / 2, -h / 2, w, h, 0, C.white); rr(ctx, -w / 2, -h / 2, w, 76, 0, band);
    M.text(ctx, title, 0, -h / 2 + 52, F(40, 800), C.white, 'center');
    if (draw) draw(-w / 2, -h / 2 + 76, w, h - 76);
  }, rot);
}

// ---------------------------------------------------------------- 0-8: hello
function sceneHook(ctx, u) {
  showground(ctx, u);
  K.crowd(ctx, 1200, 1900, GY + 120, 8, 0.85, 3, 1, u);
  const fl = prog(u, -0.4, 2.0);
  if (fl < 1) { const q = E.outCubic(fl); pipFly(ctx, lerp(-260, 760, q), lerp(200, 520, q) - Math.sin(q * Math.PI) * 160, 380, (1 - q) * 0.3); }
  else pip(ctx, 'hello', 760, FEET + 20, 380, u, { squash: Math.exp(-6 * (u - 2)) * Math.cos((u - 2) * 9) * 0.12 });
  say(ctx, u, 2.3, 7.7, "Hello! I'm Pip. Let me tell you all about me.", 980, 170, 830, 400, { w: 640, size: 52 });
  K.caption(ctx, u, -0.9, 7.6, 'Meet Pip.', { w: 700, size: 80 });
}

// ---------------------------------------------------------------- 1: who I am
function part1(ctx, u) {
  const a = at0(0);
  M.fill(ctx, C.paper);
  pip(ctx, u < a + 5.6 ? 'point' : 'cheer', 360, 900, 420, u);
  say(ctx, u, a + 0.9, a + 5.4, "I'm a little round propeller plane.", 600, 160, 470, 470, { w: 600, size: 50 });
  say(ctx, u, a + 5.6, a + 10.4, 'My name stands for three things...', 600, 160, 470, 470, { w: 600, size: 50 });
  say(ctx, u, a + 10.6, a + 15.3, "...everything The Big Guide to UK Airshows helps you do!", 600, 160, 470, 470, { w: 600, size: 50 });
  // the three letters
  [['P', 'Plan', PLAN], ['I', 'Inform', INFORM], ['P', 'Prepare', PREPARE]].forEach(([L, word, col], i) => {
    const k = K.pop(u, a + 6 + i * 0.9, SPRING.bouncy), x = 1290 + i * 200;
    popAt(ctx, x, 420, k, () => { rr(ctx, -82, -110, 164, 200, 0, col); M.text(ctx, L, 0, 50, F(170, 800), C.white, 'center'); });
    const wk = K.pop(u, a + 8 + i * 0.5, SPRING.gentle);
    if (wk > 0) M.text(ctx, word, x, 600 + (1 - wk) * 30, F(50, 800), col, 'center');
  });
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, "Who I am: Pip, the UK Airshow Guide's mascot.", { num: 1, sub: 'PIP stands for Plan. Inform. Prepare.', x: 760, w: 1100 });
}

// ---------------------------------------------------------------- 2: who I'm for
function part2(ctx, u) {
  const a = at0(1);
  showground(ctx, u);
  const W3 = 380, Y = 180, Hh = 470;
  const people = [
    ['Families', PLAN, a + 2.4, (x, y, w, h) => { K.dad(ctx, x + w / 2 + 70, y + h + 40, 0.95, { mood: 'happy', blinkU: u, armL: K.POSE.relaxed, armR: K.POSE.relaxed }); charlie(ctx, x + w / 2 - 70, y + h + 40, 1.05, { mood: 'grin', blinkU: u, blinkOff: 1, armR: [2.5 + Math.sin(u * 4) * 0.2, -0.25], armL: K.POSE.relaxed }); }],
    ['First timers', INFORM, a + 6, (x, y, w, h) => { K.beth(ctx, x + w / 2, y + h + 40, 1.0, { lanyard: false, mood: 'wow', blinkU: u, look: [0.4, -0.8], armL: K.POSE.relaxed, armR: [1.5, 0.1] }); }],
    ['Airshow fans', PREPARE, a + 9.6, (x, y, w, h) => { fan(ctx, x + w / 2, y + h + 40, 1.0, { mood: 'happy', blinkU: u, look: [0, -0.8], hold: 'camera', armL: [1.7, 1.2], armR: [1.7, 1.2] }); }],
  ];
  people.forEach(([t, col, b, draw], i) => {
    const x = 70 + i * (W3 + 30);
    card(ctx, x, Y, W3, Hh, K.pop(u, b, SPRING.bouncy), col, t, (cx, cy, cw, ch) => { ctx.save(); ctx.beginPath(); ctx.rect(cx, cy, cw, ch); ctx.clip(); ctx.fillStyle = C.skyTop; ctx.fillRect(cx, cy, cw, ch); ctx.fillStyle = C.grass; ctx.fillRect(cx, cy + ch - 70, cw, 70); draw(cx, cy, cw, ch - 70); ctx.restore(); });
  });
  pip(ctx, 'point', 1700, FEET, 300, u);
  say(ctx, u, a + 0.9, a + 5.8, "I'm for everyone going to an airshow.", 1360, 130, 1680, 430, { w: 520 });
  say(ctx, u, a + 6, a + 9.4, 'Your very first airshow? I can help.', 1360, 130, 1680, 430, { w: 520 });
  say(ctx, u, a + 9.6, a + 15.3, 'And I love a fan with a big camera!', 1360, 130, 1680, 430, { w: 520 });
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, "Who I'm for: families, first timers and fans.", { num: 2, sub: 'Little ones love spotting me. Grown-ups get the plan.' });
}

// ---------------------------------------------------------------- 3: how I help
function part3(ctx, u) {
  const a = at0(2);
  room(ctx, '#E4EDE6', 800);
  const cols = [
    ['Plan', PLAN, a + 1.6, 'map', ['Pick your show', 'Tickets and parking', 'Work out your day']],
    ['Inform', INFORM, a + 6, 'point', ['The dates and line-up', 'How to get there', 'The rules on site']],
    ['Prepare', PREPARE, a + 10.4, 'sun', ['What to pack', 'Little ears protected', 'The weather and home']],
  ];
  cols.forEach(([t, col, b, pose, lines], i) => {
    const x = 60 + i * 455, k = K.pop(u, b, SPRING.bouncy);
    card(ctx, x, 140, 440, 420, k, col, t, (cx, cy, cw, ch) => {
      lines.forEach((l, j) => { const tk = prog(u, b + 0.8 + j * 0.6, b + 1.2 + j * 0.6); rr(ctx, cx + 30, cy + 40 + j * 96, 44, 44, 0, col); if (tk > 0) K.tick(ctx, cx + 52, cy + 62 + j * 96, 0.75, tk, C.white, 8); M.text(ctx, l, cx + 92, cy + 76 + j * 96, F(33, 700), C.ink); });
    });
  });
  const cur = u < a + 6 ? 'map' : u < a + 10.4 ? 'point' : 'sun';
  pip(ctx, cur, 1650, 800, 320, u);
  say(ctx, u, a + 1.2, a + 5.8, 'I help you plan: pick, book and work out your day.', 1440, 140, 1640, 470, { w: 440, size: 40 });
  say(ctx, u, a + 6, a + 10.2, 'I keep you informed with the facts you need.', 1440, 140, 1640, 470, { w: 440, size: 40 });
  say(ctx, u, a + 10.4, a + 15.3, 'And I help you prepare, right down to the sun cream!', 1440, 140, 1640, 470, { w: 440, size: 40 });
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, 'How I help: Plan. Inform. Prepare.', { num: 3, sub: 'Every tip and every fact comes straight from the guide.' });
}

// ---------------------------------------------------------------- 4: where you'll see me
function phone(ctx, x, y, k, rot, draw) { popAt(ctx, x, y, k, () => { rr(ctx, -110, -200, 220, 400, 0, C.ink); ctx.save(); ctx.beginPath(); ctx.rect(-96, -170, 192, 340); ctx.clip(); ctx.fillStyle = C.paper; ctx.fillRect(-96, -170, 192, 340); draw(); ctx.restore(); }, rot); }
function pipMini(ctx, pose, x, y, size, u) { pip(ctx, pose, x, y, size, u, { still: true }); }
function part4(ctx, u) {
  const a = at0(3);
  room(ctx, WALL, 800);
  // social media, most of all: a phone with a post of Pip and some hearts
  const pk = K.pop(u, a + 1.6, SPRING.bouncy);
  phone(ctx, 230, 420, pk, -0.05, () => {
    rr(ctx, -96, -170, 192, 40, 0, '#E1E6EB'); K.circ(ctx, -70, -150, 12, C.teal); rr(ctx, -50, -156, 90, 12, 0, C.greyDark);
    rr(ctx, -96, -126, 192, 192, 0, '#FFC23A'); pipMini(ctx, 'cheer', 0, 50, 140, u);
    for (let i = 0; i < 3; i++) { const hk = K.pop(u, a + 2.6 + i * 0.5); if (hk > 0) M.text(ctx, '♥', -60 + i * 40, 120 - hk * 20, F(40, 800), C.red, 'center'); }
  });
  // videos like this one
  const vk = K.pop(u, a + 4.9, SPRING.bouncy);
  popAt(ctx, 640, 420, vk, () => { rr(ctx, -200, -130, 400, 260, 0, C.ink); rr(ctx, -186, -116, 372, 210, 0, C.skyTop); pipMini(ctx, 'fly', 0, 60, 150, u); ctx.beginPath(); ctx.moveTo(-20, 110); ctx.lineTo(24, 130); ctx.lineTo(-20, 150); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill(); }, 0.03);
  // posters
  const ok = K.pop(u, a + 8.2, SPRING.bouncy);
  popAt(ctx, 1040, 440, ok, () => { rr(ctx, -150, -210, 300, 420, 0, C.paper); rr(ctx, -150, -210, 300, 420, 0, C.paper); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.strokeRect(-150, -210, 300, 420); M.text(ctx, 'See Pip?', 0, -140, F(46, 800), C.ink, 'center'); pipMini(ctx, 'hello', 0, 120, 200, u); rr(ctx, -150, 150, 300, 60, 0, C.ink); }, -0.04);
  // a few spots on the website
  const wk = K.pop(u, a + 11.5, SPRING.bouncy);
  popAt(ctx, 1405, 520, wk, () => { rr(ctx, -200, -150, 400, 300, 0, C.white); rr(ctx, -200, -150, 400, 46, 0, '#C9D2DA'); for (let i = 0; i < 3; i++) K.circ(ctx, -176 + i * 22, -127, 7, C.greyDark); rr(ctx, -170, -80, 220, 18, 0, '#E1E6EB'); rr(ctx, -170, -50, 180, 18, 0, '#E1E6EB'); rr(ctx, -170, -20, 200, 18, 0, '#E1E6EB'); pipMini(ctx, 'tip', 120, 120, 130, u); }, 0.03);
  pillPop(ctx, u, a + 2, 230, 690, 'Mostly social media', { bg: C.red });
  pillPop(ctx, u, a + 5.2, 640, 620, 'Videos like this one', { bg: PLAN });
  pillPop(ctx, u, a + 8.5, 1040, 690, 'Posters', { bg: INFORM });
  pillPop(ctx, u, a + 11.8, 1400, 700, 'A few spots on the website', { bg: C.ink });
  pip(ctx, 'photo', 1790, 800, 220, u);
  say(ctx, u, a + 1.2, a + 4.6, "You'll see me mostly on social media.", 1340, 110, 1790, 560, { w: 540, size: 40 });
  say(ctx, u, a + 4.8, a + 8, 'In videos, just like this one!', 1340, 110, 1790, 560, { w: 540, size: 40 });
  say(ctx, u, a + 8.2, a + 11.3, 'On posters at airshow time...', 1340, 110, 1790, 560, { w: 540, size: 40 });
  say(ctx, u, a + 11.5, a + 15.3, '...and in a few spots on the website.', 1340, 110, 1790, 560, { w: 540, size: 40 });
  K.caption(ctx, u, a + 0.3, a + STEP - 0.5, "Where you'll see me", { num: 4, sub: 'Mostly on social media. Also in videos, on posters and a few spots on the website.' });
}

// ---------------------------------------------------------------- payoff
function scenePayoff(ctx, u) {
  showground(ctx, u);
  K.crowd(ctx, 20, 380, 735, 5, 0.9, 9, 1, u);
  const px = lerp(-350, 2300, prog(u, PAY - 1.8, PAY + 7.5)), py = 232 + Math.sin(u * 0.7) * 12;
  K.rings(ctx, px - 50, py, 135, C.teal, u, 3, 10);
  K.propPlane(ctx, px, py, 0.82, -0.05 + Math.cos(u * 0.7) * 0.03, u);
  K.dad(ctx, 1100, FEET + 8, 1.2, { mood: 'happy', look: [0.6, -0.6], blinkU: u, blinkOff: 2, armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  const on = u > PAY + 1.2;
  charlie(ctx, 840, FEET + (on ? Math.abs(Math.sin(u * TAU * 1.5)) * -14 : 0), 1.55, { mood: on ? 'grin' : 'wow', look: [1, -0.3], blinkU: u, armL: on ? K.POSE.up : K.POSE.relaxed, armR: on ? K.POSE.up : [1.5, 0.1] });
  pip(ctx, on ? 'cheer' : 'hello', 1460, FEET + 10, 300, u);
  say(ctx, u, PAY + 0.8, PAY + 7.6, 'See Pip? It must be airshow season!', 1250, 140, 1450, 440, { w: 600, size: 52 });
  K.caption(ctx, u, PAY + 1.2, PAY + 7.8, 'When your child spots Pip, the fun is about to start.', { w: 1100, size: 60 });
}

// ---------------------------------------------------------------- end card: the swoosh badge logo (the video end logo)
function endCard(ctx, u, IMG) {
  const p = E.inOutCubic(prog(u, END - 0.9, END));
  if (p <= 0) return;
  // a slanted straight edge sweeps the card in (no circles: square edges only)
  ctx.save(); const sl = 300, x = p * (W + sl); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, 0); ctx.lineTo(x - sl, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
  M.fill(ctx, C.paper);
  // three jets draw red, white and blue trails, as on the TikTok videos, then the badge lands
  const cols = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  const path = (q, k) => [lerp(-200, W + 300, q), 120 + k * 26 - Math.sin(q * Math.PI) * 70];
  cols.forEach((col, k) => {
    const q = E.inOutSine(prog(u, END - 0.4 + k * 0.1, END + 2.6 + k * 0.1));
    if (q <= 0) return;
    ctx.beginPath(); for (let s = 0; s <= 60; s++) { const pp = path((s / 60) * q, k); s ? ctx.lineTo(pp[0], pp[1]) : ctx.moveTo(pp[0], pp[1]); }
    ctx.lineCap = 'round'; if (k === 1) { ctx.strokeStyle = '#C9D6E0'; ctx.lineWidth = 24; ctx.stroke(); } ctx.strokeStyle = col; ctx.lineWidth = 18; ctx.stroke();
    if (q < 1) { const pp = path(q, k), p2 = path(Math.min(1, q + 0.01), k); K.redJet(ctx, pp[0] + 60, pp[1], 0.5, Math.atan2(p2[1] - pp[1], p2[0] - pp[0])); }
  });
  const lk = K.pop(u, END + 1.6, SPRING.bouncy);
  if (lk > 0 && IMG.logo) { const lw = 600, lh = lw * IMG.logo.height / IMG.logo.width; ctx.save(); ctx.translate(450, 380); ctx.scale(lk, lk); ctx.rotate((1 - lk) * 0.2); ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh); ctx.restore(); }
  const tk = K.pop(u, END + 2.4, SPRING.gentle);
  if (tk > 0) M.text(ctx, 'Meet Pip', 150 - (1 - tk) * 80, 720, F(104, 800), C.ink);
  const sk = K.pop(u, END + 3, SPRING.gentle);
  if (sk > 0) { ctx.font = F(56, 800); let x = 154 - (1 - sk) * 80; [['Plan. ', '#23908C'], ['Inform. ', '#1F4E8C'], ['Prepare.', '#D74949']].forEach(([w, c]) => { M.text(ctx, w, x, 800, F(56, 800), c); x += ctx.measureText(w).width; }); }
  const pk = K.pop(u, END + 3.6, SPRING.bouncy);
  if (pk > 0) { ctx.save(); ctx.translate(150, 900); ctx.scale(pk, pk); K.pill(ctx, 0, 0, 'ukairshowguide.co.uk', { size: 50, bg: C.teal, fg: C.white }); ctx.restore(); }
  const ck = K.pop(u, END + 1.0, SPRING.gentle), wv = Math.sin(u * TAU * 0.75) * 0.25;
  K.dad(ctx, 1640, 980 + (1 - ck) * 500, 1.5, { mood: 'happy', blinkU: u, armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  charlie(ctx, 1380, 990 + (1 - ck) * 500, 1.75, { mood: 'happy', blinkU: u, blinkOff: 2, armR: [2.5 + wv, -0.25], armL: K.POSE.relaxed });
  const pq = K.pop(u, END + 2.4, SPRING.bouncy);
  if (pq > 0) pip(ctx, 'hello', 1080, 990, 280 * Math.min(1, pq), u);
  ctx.restore();
}

// ---------------------------------------------------------------- the cut
const SCENES = [[0, sceneHook], [at0(0), part1], [at0(1), part2], [at0(2), part3], [at0(3), part4], [PAY, scenePayoff]];
const PUSH = 0.9;
M.film({
  fonts: K.FONTS,
  images: Object.assign({ logo: 'assets/logo.png' },
    Object.fromEntries(['rest', 'blink', 'point', 'tip', 'map', 'sun', 'loud', 'cheer', 'fly', 'photo', 'hello0', 'hello1', 'hello2', 'hello3', 'hello4', 'hello5'].map((k) => ['pip_' + k, 'assets/pip/' + k + '.png']))),
  hits: HITS,
  samples: 6,
  draw(ctx, u, t, IMG) {
    IMGS = IMG;
    let i = 0; while (i + 1 < SCENES.length && u >= SCENES[i + 1][0] - PUSH) i++;
    const [a, fn] = SCENES[i];
    if (i > 0 && u < a) {
      const p = E.inOutCubic(prog(u, a - PUSH, a));
      ctx.save(); ctx.translate(-p * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); SCENES[i - 1][1](ctx, u); ctx.restore();
      ctx.save(); ctx.translate((1 - p) * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); fn(ctx, u); ctx.restore();
    } else fn(ctx, u);
    strip(ctx, u);
    endCard(ctx, u, IMG);
  },
});
