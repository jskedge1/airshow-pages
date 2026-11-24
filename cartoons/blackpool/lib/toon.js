// toon.js: shared cartoon kit for the guide's explainer films. Every function draws from its
// arguments alone (pure, seeded), so frames can be rendered in any order.
import * as M from './motion.js';

const { W, H, TAU, clamp, lerp, E, hash01, noise1, font, rrect } = M;

// Brand palette (home.html :root) + the two faces the site uses.
export const C = {
  navy: '#13293C', deep: '#0E2131', teal: '#32B4AF', tealText: '#1F7F7B', mint: '#5FE3D6',
  sky: '#00A6E2', red: '#D74949', amber: '#F5B942', purple: '#6950A1', green: '#2BA84A',
  light: '#F4F7F9', line: '#E2E8ED', body: '#4A5A66', white: '#FFFFFF', soft: '#C9D6E0',
  skin: '#F2C29B', skinShade: '#DFA57A', hair: '#3B2A20', grass: '#8CCB6A', grassDark: '#6FB24F',
  skyTop: '#9ED8F0', skyLow: '#E6F6FB',
};
export const DISPLAY = 'Display', UI = 'UI';
export const fd = (size) => font(size, 800, DISPLAY);
export const fu = (size, w = 700) => font(size, w, UI);

// ------------------------------------------------------------------ text helpers
export function wrap(ctx, str, f, maxW) {
  ctx.font = f;
  const out = [];
  for (const para of str.split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  return out;
}
export function lines(ctx, str, x, y, f, color, maxW, lh, align = 'left') {
  const L = wrap(ctx, str, f, maxW);
  ctx.font = f; ctx.fillStyle = color; ctx.textAlign = align;
  L.forEach((s, i) => ctx.fillText(s, x, y + i * lh));
  return L.length;
}
// Big heading: per-glyph spring entrance from below, optional second colour from index `split`.
export function heading(ctx, u, u0, str, x, y, size, color, color2 = null, split = 99, align = 'left') {
  const f = fd(size);
  const L = M.layout(ctx, str, f, -0.01 * size);
  const ox = align === 'center' ? x - L.width / 2 : align === 'right' ? x - L.width : x;
  const words = str.split(' ');
  let wi = 0;
  L.glyphs.forEach((g, j) => {
    if (g.ch === ' ') { wi++; return; }
    const k = M.springU(u, u0 + j * 0.035, M.SPRING.bouncy);
    if (k <= 0) return;
    M.glyph(ctx, g.ch, ox + g.cx, y + (1 - k) * size * 0.6, f, wi >= split && color2 ? color2 : color, 1, clamp(k, 0, 1.3));
  });
  return L.width;
}

// A rounded card with a coloured top edge (the site's box style).
export function card(ctx, x, y, w, h, { fill = C.white, edge = C.teal, r = 0, shadow = true, edgeH = 10 } = {}) {
  if (shadow) { ctx.save(); ctx.fillStyle = 'rgba(14,33,49,0.16)'; rrect(ctx, x + 6, y + 10, w, h, r); ctx.fill(); ctx.restore(); }
  ctx.save(); rrect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.clip();
  if (edge) { ctx.fillStyle = edge; ctx.fillRect(x, y, w, edgeH); }
  ctx.restore();
}
// A pill label.
export function pill(ctx, str, x, y, size, bg, fg, align = 'left') {
  const f = fu(size, 700); ctx.font = f;
  const w = ctx.measureText(str).width + size * 1.1, h = size * 1.7;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = bg; ctx.fillRect(x0, y - h / 2, w, h);
  ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.fillText(str, x0 + size * 0.55, y + size * 0.36);
  return w;
}
// Pop scale for an element born at u0: 0 before, spring to 1 with overshoot.
export const pop = (u, u0, cfg = M.SPRING.bouncy) => Math.max(0, M.springU(u, u0, cfg));
export function scaled(ctx, k, cx, cy, fn) {
  if (k <= 0.001) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy); fn(); ctx.restore();
}

// ------------------------------------------------------------------ backgrounds
export function sky(ctx, top = C.skyTop, low = C.skyLow, y0 = 0, y1 = H) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, top); g.addColorStop(1, low);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
export function cloud(ctx, x, y, s, color = '#FFFFFF', alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color;
  ctx.beginPath();
  [[0, 0, 60], [55, -20, 48], [100, 5, 42], [-50, 8, 40], [30, 18, 50]].forEach(([dx, dy, r]) => {
    ctx.moveTo(x + dx * s + r * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU);
  });
  ctx.fill(); ctx.restore();
}
// Seeded drifting clouds across the frame.
export function clouds(ctx, u, n, seed, yMin, yMax, speed = 6, alpha = 0.9, sMin = 0.6, sMax = 1.2) {
  for (let i = 0; i < n; i++) {
    const r1 = hash01(i, seed), r2 = hash01(i, seed + 1), r3 = hash01(i, seed + 2);
    const s = lerp(sMin, sMax, r3);
    const span = W + 500 * s;
    const x = ((r1 * span + u * speed * (0.6 + r3)) % span) - 250 * s;
    cloud(ctx, x, lerp(yMin, yMax, r2), s, '#FFFFFF', alpha);
  }
}
export function hills(ctx, yBase, amp, freq, phase, color, seed = 1) {
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W + 20; x += 20) {
    const y = yBase - amp * (0.6 * Math.sin((x * freq) / 1000 + phase) + 0.4 * noise1(x * freq / 700 + phase, seed));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
// Crowd line: rows of little heads behind a barrier.
export function crowd(ctx, y, s, u, seed = 5, colors = [C.red, C.teal, C.amber, C.purple, C.sky, C.navy]) {
  const n = Math.ceil(W / (34 * s)) + 2;
  for (let i = 0; i < n; i++) {
    const x = i * 34 * s - 10 + hash01(i, seed) * 10;
    const bob = Math.sin(u * 3 + i) * 2 * s;
    const c = colors[Math.floor(hash01(i, seed + 3) * colors.length)];
    ctx.fillStyle = c; rrect(ctx, x - 13 * s, y - 30 * s + bob, 26 * s, 34 * s, 10 * s); ctx.fill();
    ctx.fillStyle = hash01(i, seed + 7) > 0.5 ? C.skin : C.skinShade;
    ctx.beginPath(); ctx.arc(x, y - 40 * s + bob, 10 * s, 0, TAU); ctx.fill();
  }
  // barrier
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, y - 6 * s, W, 8 * s);
  ctx.fillStyle = C.navy;
  for (let x = 0; x < W; x += 90 * s) ctx.fillRect(x, y - 10 * s, 6 * s, 30 * s);
}

// ------------------------------------------------------------------ people
// Feet at (x, y). s = scale (s=1 is ~290 px tall). pose:
//   walk (0..1 amount), phase (radians), face (1 right / -1 left), wave (0..1), hold: 'camera' | 'phone' |
//   'notepad' | 'none', armUp (0..1 front arm raised to point/hold up), blink (0..1), shirt, pack (bool),
//   mouth: 'smile' | 'open', hat (colour or null).
export function person(ctx, x, y, s, p = {}) {
  const { walk = 0, phase = 0, face = 1, wave = 0, waveT = 0, hold = 'none', armUp = 0, blink = 0,
    shirt = C.teal, trousers = '#3F5B75', pack = false, mouth = 'smile', hat = null, hair = C.hair, skin = C.skin, lanyard = true } = p;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * face, s);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const bob = -Math.abs(Math.sin(phase)) * 6 * walk;
  ctx.translate(0, bob);
  // backpack behind
  if (pack) { ctx.fillStyle = C.red; rrect(ctx, -66, -200, 38, 86, 14); ctx.fill(); ctx.fillStyle = '#B73A3A'; rrect(ctx, -70, -150, 20, 30, 8); ctx.fill(); }
  // legs
  const leg = (side) => {
    const ph = phase + (side > 0 ? 0 : Math.PI);
    const fx = Math.sin(ph) * 30 * walk + side * 12;
    const lift = Math.max(0, Math.cos(ph)) * 16 * walk;
    ctx.strokeStyle = trousers; ctx.lineWidth = 28;
    ctx.beginPath(); ctx.moveTo(side * 16, -112); ctx.lineTo(fx, -14 - lift); ctx.stroke();
    ctx.fillStyle = C.deep; rrect(ctx, fx - 14, -22 - lift, 36, 20, 9); ctx.fill();
  };
  leg(-1); leg(1);
  // back arm
  const shY = -190;
  const backSwing = -Math.sin(phase) * 0.5 * walk;
  ctx.strokeStyle = shirt; ctx.lineWidth = 22;
  const bax = -30 + Math.sin(backSwing) * 90, bay = shY + Math.cos(backSwing) * 88;
  ctx.beginPath(); ctx.moveTo(-28, shY); ctx.lineTo(bax, bay); ctx.stroke();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(bax, bay, 12, 0, TAU); ctx.fill();
  // body
  ctx.fillStyle = shirt; rrect(ctx, -44, -214, 88, 116, 30); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; rrect(ctx, -44, -120, 88, 22, 10); ctx.fill();
  if (pack) { ctx.strokeStyle = '#B73A3A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-26, -208); ctx.lineTo(-10, -130); ctx.stroke(); }
  if (lanyard) {
    ctx.strokeStyle = C.amber; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-16, -212); ctx.lineTo(4, -168); ctx.lineTo(20, -212); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; rrect(ctx, -8, -172, 24, 30, 4); ctx.fill(); ctx.fillStyle = C.teal; ctx.fillRect(-8, -172, 24, 8);
  }
  // head
  ctx.fillStyle = skin; ctx.fillRect(-10, -232, 20, 22);
  ctx.beginPath(); ctx.arc(0, -262, 44, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(-40, -258, 10, 0, TAU); ctx.fill();
  // hair / hat
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.arc(0, -268, 46, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-30, -276, 18, 26, -0.3, 0, TAU); ctx.fill();
  if (hat) {
    ctx.fillStyle = hat; ctx.beginPath(); ctx.arc(0, -272, 47, Math.PI, TAU); ctx.closePath(); ctx.fill();
    rrect(ctx, 0, -278, 66, 14, 7); ctx.fill();
  }
  // face
  const by = Math.max(0.08, 1 - blink);
  ctx.fillStyle = C.deep;
  ctx.beginPath(); ctx.ellipse(12, -262, 5.5, 7.5 * by, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(32, -262, 5.5, 7.5 * by, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(215,73,73,0.25)'; ctx.beginPath(); ctx.arc(36, -244, 7, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.deep; ctx.lineWidth = 4.5;
  if (mouth === 'open') { ctx.fillStyle = '#7A2E2E'; ctx.beginPath(); ctx.ellipse(24, -240, 9, 8, 0, 0, TAU); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(24, -248, 11, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  // front arm
  let fa;
  if (wave > 0) fa = lerp(Math.sin(phase) * 0.5 * walk, -2.5 + 0.35 * Math.sin(waveT * TAU * 2), wave);
  else fa = lerp(Math.sin(phase) * 0.5 * walk, -1.55, armUp);
  const handX = 28 - Math.sin(fa) * 90, handY = shY + Math.cos(fa) * 88;
  ctx.strokeStyle = shirt; ctx.lineWidth = 22;
  ctx.beginPath(); ctx.moveTo(28, shY); ctx.lineTo(handX, handY); ctx.stroke();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(handX, handY, 12, 0, TAU); ctx.fill();
  // prop in front hand
  if (hold === 'camera') {
    ctx.save(); ctx.translate(handX + 8, handY - 4);
    ctx.fillStyle = '#222B33'; rrect(ctx, -6, -26, 64, 44, 8); ctx.fill();
    ctx.fillStyle = '#3B4A57'; ctx.beginPath(); ctx.arc(30, -4, 17, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7FD4F0'; ctx.beginPath(); ctx.arc(30, -4, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = '#222B33'; rrect(ctx, 4, -34, 18, 10, 3); ctx.fill();
    ctx.restore();
  } else if (hold === 'phone') {
    ctx.save(); ctx.translate(handX + 4, handY - 30);
    ctx.fillStyle = '#1B2530'; rrect(ctx, -4, -32, 34, 62, 7); ctx.fill();
    ctx.fillStyle = '#9ED8F0'; rrect(ctx, 0, -27, 26, 50, 4); ctx.fill();
    ctx.restore();
  } else if (hold === 'notepad') {
    ctx.save(); ctx.translate(handX + 2, handY - 20);
    ctx.fillStyle = '#FFFFFF'; rrect(ctx, -4, -36, 50, 64, 5); ctx.fill();
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(4, -22 + i * 12); ctx.lineTo(38, -22 + i * 12); ctx.stroke(); }
    ctx.fillStyle = C.amber; ctx.fillRect(-4, -36, 50, 8);
    ctx.restore();
  } else if (hold === 'ticket') {
    ctx.save(); ctx.translate(handX + 4, handY - 16); ctx.rotate(-0.15);
    ctx.fillStyle = '#FFF3D6'; rrect(ctx, -6, -24, 64, 38, 5); ctx.fill();
    ctx.fillStyle = C.amber; ctx.fillRect(-6, -24, 12, 38);
    ctx.restore();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ aircraft
// A display jet in side view, nose at +x. (x,y) = centre, s scale (~320 px long), rot radians.
// Real aircraft cut-outs from the site (set by the film): Red Arrows Hawk, Typhoon, A400M.
let AC = {};
export function setAircraft(imgs) { AC = imgs || {}; }
// (x,y) = centre, s scale (~320 px long at s=1), rot radians. kind: 'hawk' | 'typhoon' | 'a400';
// without kind a red stripe means a Hawk, a white body an A400M, anything else a Typhoon.
export function jet(ctx, x, y, s, rot = 0, { stripe = C.red, body = null, kind = null } = {}) {
  const k = kind || (body === '#FFFFFF' ? 'a400' : (stripe === C.red || stripe === '#E8202A') ? 'hawk' : 'typhoon');
  const img = AC[k]; if (!img) return;
  let r = rot, flip = false;
  if (Math.cos(rot) < 0) { flip = true; r = rot - Math.PI; }
  const w = 320 * s * (k === 'a400' ? 1.5 : 1), h = w * img.height / img.width;
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); if (flip) ctx.scale(-1, 1); ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
}
// Red Arrows trio with red, white and blue smoke. q 0..1 along x0 -> x1 at height y.
export function redArrows(ctx, q, x0, x1, y, s = 0.6) {
  if (q <= 0 || q >= 1) return;
  const dir = x1 > x0 ? 1 : -1;
  const P = (qq, k) => [lerp(x0, x1, qq) - dir * k * 70 * s / 0.6, y + k * 40 * s / 0.6 - Math.sin(qq * Math.PI) * 40];
  const SM = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  ctx.save();
  [1, 0, 2].forEach((k) => {
    for (let n = 70; n >= 1; n--) { const qq = q - n * 0.005; if (qq < 0) continue; const p = P(qq, k);
      ctx.globalAlpha = 0.85 * (1 - n / 70 * 0.8); ctx.fillStyle = k === 0 ? '#C9D6E0' : SM[k]; ctx.beginPath(); ctx.arc(p[0] - dir * 110 * s / 0.6, p[1] + 10, 9 + n * 0.25 + (k === 0 ? 2 : 0), 0, TAU); ctx.fill();
      if (k === 0) { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(p[0] - dir * 110 * s / 0.6, p[1] + 10, 8 + n * 0.25, 0, TAU); ctx.fill(); } }
  });
  ctx.restore();
  [1, 0, 2].forEach((k) => { const p = P(q, k); jet(ctx, p[0], p[1], s, dir > 0 ? 0 : Math.PI, { kind: 'hawk' }); });
}
// A square badge (step numbers, ticks)
export function sq(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
// Contrail behind a path: pos(t) -> [x, y]; draws from t-len to t.
export function trail(ctx, pos, t, len, width, color = '#FFFFFF', steps = 40, alpha = 0.85) {
  ctx.save(); ctx.lineCap = 'round';
  for (let i = steps; i > 0; i--) {
    const a = pos(t - (len * i) / steps), b = pos(t - (len * (i - 1)) / steps);
    const k = 1 - i / steps;
    ctx.strokeStyle = color; ctx.globalAlpha = alpha * (0.15 + 0.85 * k);
    ctx.lineWidth = width * (0.35 + 0.65 * (1 - k * 0.6));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ trains
// Side-view train, front (nose) at x, rails at y. cars, s scale (car 430 px long at s=1).
// look: { body, stripe, door, roof, nose, tube (rounded tube profile) }
export function train(ctx, x, y, s, cars, look, u = 0) {
  const { body = '#FFFFFF', stripe = C.red, door = C.red, roof = '#8A8C8E', nose = null, tube = false, window: win = '#24323E' } = look;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round';
  const CL = 430, CH = tube ? 150 : 170, gap = 14;
  for (let c = 0; c < cars; c++) {
    const x1 = -c * (CL + gap), x0 = x1 - CL;
    const lead = c === 0;
    // body
    ctx.fillStyle = body;
    ctx.beginPath();
    if (tube) {
      ctx.moveTo(x0 + 20, -28); ctx.lineTo(x0 + 20, -CH + 40); ctx.quadraticCurveTo(x0 + 20, -CH, x0 + 70, -CH);
      ctx.lineTo(x1 - 60, -CH); ctx.quadraticCurveTo(x1 - (lead ? 0 : 20), -CH, x1 - (lead ? 0 : 20), -CH + 50); ctx.lineTo(x1 - (lead ? 0 : 20), -28);
    } else {
      ctx.moveTo(x0, -28); ctx.lineTo(x0, -CH + 14); ctx.quadraticCurveTo(x0, -CH, x0 + 14, -CH);
      if (lead) { ctx.lineTo(x1 - 70, -CH); ctx.quadraticCurveTo(x1 + 10, -CH + 10, x1 + 20, -60); ctx.lineTo(x1 + 20, -28); }
      else { ctx.lineTo(x1 - 14, -CH); ctx.quadraticCurveTo(x1, -CH, x1, -CH + 14); ctx.lineTo(x1, -28); }
    }
    ctx.closePath(); ctx.fill();
    // roof band
    ctx.fillStyle = roof; ctx.fillRect(x0 + (tube ? 60 : 14), -CH, CL - (tube ? 120 : 28) - (lead && !tube ? 50 : 0), 12);
    // stripe
    ctx.fillStyle = stripe; ctx.fillRect(x0 + (tube ? 20 : 0), -60, CL - (tube ? 40 : 0) + (lead && !tube ? 18 : 0), 18);
    // windows
    ctx.fillStyle = win;
    for (let i = 0; i < 4; i++) { rrect(ctx, x0 + 50 + i * 92, -CH + 34, 64, 48, 10); ctx.fill(); }
    // doors
    ctx.fillStyle = door;
    [x0 + 18 + (tube ? 30 : 0), x1 - 64 - (lead ? 40 : 0)].forEach((dx) => { rrect(ctx, dx, -CH + 24, 40, CH - 54, 6); ctx.fill(); });
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    [x0 + 18 + (tube ? 30 : 0), x1 - 64 - (lead ? 40 : 0)].forEach((dx) => { rrect(ctx, dx + 8, -CH + 36, 24, 36, 4); ctx.fill(); });
    // cab window + nose
    if (lead) {
      ctx.fillStyle = win;
      if (tube) { rrect(ctx, x1 - 58, -CH + 30, 30, 60, 8); ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(x1 - 44, -CH + 26); ctx.quadraticCurveTo(x1 + 2, -CH + 30, x1 + 12, -96); ctx.lineTo(x1 - 44, -96); ctx.closePath(); ctx.fill(); }
      if (nose) { ctx.fillStyle = nose; ctx.beginPath(); ctx.moveTo(x1 + 20, -60); ctx.lineTo(x1 + 20, -28); ctx.lineTo(x1 - 30, -28); ctx.lineTo(x1 - 10, -60); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#FFF4C2'; ctx.beginPath(); ctx.arc(x1 + 8, -40, 6, 0, TAU); ctx.fill();
    }
    // bogies + wheels
    ctx.fillStyle = '#2B333B';
    [x0 + 80, x1 - 80].forEach((bx) => {
      rrect(ctx, bx - 56, -32, 112, 18, 6); ctx.fill();
      [-30, 30].forEach((wx) => {
        ctx.save(); ctx.translate(bx + wx, -12); ctx.rotate(u * 6);
        ctx.fillStyle = '#20272E'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill();
        ctx.fillStyle = '#5C6873'; ctx.fillRect(-2, -14, 4, 28); ctx.restore();
      });
    });
  }
  ctx.restore();
}
export function rails(ctx, y, color = '#5A6670', sleeper = '#8C7A66', offset = 0, s = 1) {
  ctx.fillStyle = sleeper;
  const step = 46 * s;
  for (let x = -(offset % step) - step; x < W + step; x += step) ctx.fillRect(x, y + 2 * s, 26 * s, 10 * s);
  ctx.fillStyle = color; ctx.fillRect(0, y - 2 * s, W, 6 * s);
}

// ------------------------------------------------------------------ icons (shapes only: no font glyph fallbacks)
export function tick(ctx, x, y, r, color = '#FFFFFF', lw = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw || r * 0.32; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - r * 0.5, y + r * 0.02); ctx.lineTo(x - r * 0.12, y + r * 0.4); ctx.lineTo(x + r * 0.55, y - r * 0.38); ctx.stroke(); ctx.restore();
}
export function cross(ctx, x, y, r, color = '#FFFFFF') {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = r * 0.3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - r * 0.4, y - r * 0.4); ctx.lineTo(x + r * 0.4, y + r * 0.4); ctx.moveTo(x + r * 0.4, y - r * 0.4); ctx.lineTo(x - r * 0.4, y + r * 0.4); ctx.stroke(); ctx.restore();
}
export function bang(ctx, x, y, r, color = '#FFFFFF') {
  ctx.save(); ctx.fillStyle = color;
  rrect(ctx, x - r * 0.12, y - r * 0.55, r * 0.24, r * 0.7, r * 0.12); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + r * 0.42, r * 0.14, 0, TAU); ctx.fill(); ctx.restore();
}
export function arrow(ctx, x, y, r, dir = 0, color = '#FFFFFF') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(dir); ctx.strokeStyle = color; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.55, 0); ctx.lineTo(r * 0.5, 0); ctx.moveTo(r * 0.1, -r * 0.42); ctx.lineTo(r * 0.55, 0); ctx.lineTo(r * 0.1, r * 0.42); ctx.stroke(); ctx.restore();
}
export function badge(ctx, x, y, r, bg, draw) {
  ctx.fillStyle = bg; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  draw && draw(x, y, r);
}
export function clock(ctx, x, y, r, mins = 0, color = C.navy, face = '#FFFFFF') {
  ctx.fillStyle = face; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = r * 0.14; ctx.stroke();
  ctx.lineCap = 'round';
  const a = (mins / 60) * TAU - Math.PI / 2, b = (mins / 720) * TAU - Math.PI / 2;
  ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72); ctx.stroke();
  ctx.lineWidth = r * 0.15; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(b) * r * 0.48, y + Math.sin(b) * r * 0.48); ctx.stroke();
}
export function envelope(ctx, x, y, w, color = '#FFFFFF', line = C.navy) {
  const h = w * 0.66;
  ctx.fillStyle = color; rrect(ctx, x - w / 2, y - h / 2, w, h, w * 0.06); ctx.fill();
  ctx.strokeStyle = line; ctx.lineWidth = w * 0.05; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - w / 2 + 4, y - h / 2 + 4); ctx.lineTo(x, y + h * 0.08); ctx.lineTo(x + w / 2 - 4, y - h / 2 + 4); ctx.stroke();
}
export function bubble(ctx, x, y, w, h, color, tailLeft = true) {
  ctx.fillStyle = color; rrect(ctx, x, y, w, h, h * 0.4); ctx.fill();
  ctx.beginPath();
  if (tailLeft) { ctx.moveTo(x + w * 0.18, y + h - 2); ctx.lineTo(x + w * 0.1, y + h + h * 0.4); ctx.lineTo(x + w * 0.34, y + h - 2); }
  else { ctx.moveTo(x + w * 0.82, y + h - 2); ctx.lineTo(x + w * 0.9, y + h + h * 0.4); ctx.lineTo(x + w * 0.66, y + h - 2); }
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + w * (0.3 + i * 0.2), y + h / 2, h * 0.09, 0, TAU); ctx.fill(); }
}
// A browser card holding a real screenshot.
export function browser(ctx, img, x, y, w, h, { fy = 0, zoom = 1 } = {}) {
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; rrect(ctx, x + 10, y + 16, w, h, 18); ctx.fill(); ctx.restore();
  rrect(ctx, x, y, w, h, 18); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.fillStyle = '#E7EDF2'; ctx.save(); rrect(ctx, x, y, w, 44, 18); ctx.clip(); ctx.fillRect(x, y, w, 44); ctx.restore();
  ['#D74949', '#F5B942', '#2BA84A'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 26 + i * 22, y + 22, 7, 0, TAU); ctx.fill(); });
  if (img) M.cover(ctx, img, x + 8, y + 44, w - 16, h - 52, { fx: 0.5, fy, zoom, radius: 10 });
}

// ------------------------------------------------------------------ transitions
// Scenes: [{ a, b, draw(ctx,u), push: 'left'|'up'|null }]. A push slides the outgoing scene out while the
// incoming one slides in, both on screen, landing exactly on the incoming scene's first beat.
export function sequence(ctx, u, scenes, len = 0.9) {
  for (let i = 0; i < scenes.length; i++) {
    const S = scenes[i], N = scenes[i + 1];
    if (u < S.a || u >= S.b) continue;
    if (N && N.push && u >= N.a - len) {
      const p = E.inOutCubic(clamp((u - (N.a - len)) / len));
      const [dx, dy] = N.push === 'up' ? [0, -H] : N.push === 'down' ? [0, H] : N.push === 'right' ? [W, 0] : [-W, 0];
      ctx.save(); ctx.translate(dx * p, dy * p); S.draw(ctx, u); ctx.restore();
      ctx.save(); ctx.translate(-dx * (1 - p), -dy * (1 - p)); N.draw(ctx, u); ctx.restore();
    } else S.draw(ctx, u);
    return;
  }
}
