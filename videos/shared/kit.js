// Shared cartoon kit for the calm airshow films: palette, people, aircraft, scenery,
// sound shapes and captions. Everything is a pure function of its arguments (no state, no
// Math.random), so every frame can be drawn out of order.
import * as M from './motion.js';
const { TAU, clamp, lerp, prog, E, springU, SPRING, hash01, noise1, W, H } = M;

export const C = {
  ink: '#22344A', paper: '#FBF6EC', white: '#FFFFFF',
  skyTop: '#CFE4EE', skyLow: '#F3EEE2', night: '#1D2B3F', night2: '#2B3F5A',
  grass: '#A9CFA3', grass2: '#8DBB8C', path: '#E8DDC6',
  teal: '#2F8F8A', tealSoft: '#BFE3DF', orange: '#F08A4B', yellow: '#F6C453',
  red: '#D74949', pink: '#F2B8B0', lilac: '#C9BDE6', blue: '#6FA8DC', grey: '#9AA8B5',
  greyDark: '#5E6E80', wood: '#B98B5E', sun: '#3F9B4B',
};
export const FF = 'Barlow';
export const F = (size, w = 700) => M.font(size, w, FF);
export const FONTS = [F(100, 800), F(60, 700), F(40, 600), F(40, 500)];

// ---------------------------------------------------------------- helpers
export function at(ctx, x, y, s, rot, fn) {
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(s, Math.abs(s)); fn(); ctx.restore();
}
export function at2(ctx, x, y, sx, sy, rot, fn) {
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(sx, sy); fn(); ctx.restore();
}
const circ = (ctx, x, y, r, col) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); ctx.fillStyle = col; ctx.fill(); };
export { circ };
export const rr = (ctx, x, y, w, h, r, col) => { M.rrect(ctx, x, y, w, h, r); ctx.fillStyle = col; ctx.fill(); };
const line = (ctx, pts, col, lw, cap = 'round') => {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = cap; ctx.lineJoin = 'round'; ctx.stroke();
};
export { line };
// pop-in scale: 0 before u0, springs to 1
export const pop = (u, u0, cfg = SPRING.bouncy) => Math.max(0, springU(u, u0, cfg));
// eased 0..1 window
export const ease = (u, a, b, e = E.inOutCubic) => e(prog(u, a, b));
// in-and-out presence: slides in at a, out at b
export const pres = (u, a, b, d = 0.6) => Math.min(springU(u, a, SPRING.gentle), 1 - E.inCubic(prog(u, b - d, b)));

// ---------------------------------------------------------------- scenery
export function sky(ctx, top = C.skyTop, low = C.skyLow) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(0.75, low);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
export function cloud(ctx, x, y, s = 1, col = '#FFFFFF', a = 0.85) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(x - 70 * s, y, 42 * s, 0, TAU); ctx.arc(x - 20 * s, y - 28 * s, 56 * s, 0, TAU);
  ctx.arc(x + 45 * s, y - 8 * s, 46 * s, 0, TAU); ctx.arc(x + 95 * s, y + 4 * s, 32 * s, 0, TAU);
  ctx.rect(x - 70 * s, y, 165 * s, 38 * s); ctx.fill();
  M.rrect(ctx, x - 112 * s, y, 240 * s, 40 * s, 20 * s); ctx.fill();
  ctx.restore();
}
export function clouds(ctx, u, y = 190, speed = 6) {
  for (let i = 0; i < 4; i++) {
    const x = ((i * 560 + 200 + u * speed * (0.6 + 0.3 * i)) % (W + 500)) - 250;
    cloud(ctx, x, y + (i % 2) * 90 - 20, 0.8 + 0.25 * (i % 3));
  }
}
export function ground(ctx, y = 780, col = C.grass, col2 = C.grass2) {
  ctx.fillStyle = col; ctx.fillRect(0, y, W, H - y);
  ctx.fillStyle = col2;
  for (let i = 0; i < 26; i++) {
    const x = hash01(i, 11) * W, yy = y + 30 + hash01(i, 12) * (H - y - 50);
    ctx.beginPath(); ctx.ellipse(x, yy, 46, 5, 0, 0, TAU); ctx.fill();
  }
}
// far side of the airfield: hangars, a tower and a windsock on the horizon
export function horizon(ctx, y = 780, col = '#B9CBD3') {
  ctx.fillStyle = col;
  M.rrect(ctx, 180, y - 70, 260, 70, 8); ctx.fill();
  ctx.beginPath(); ctx.ellipse(310, y - 70, 130, 34, 0, Math.PI, TAU); ctx.fill();
  M.rrect(ctx, 1380, y - 60, 220, 60, 8); ctx.fill();
  ctx.fillRect(1180, y - 150, 26, 150); M.rrect(ctx, 1150, y - 190, 86, 50, 8); ctx.fill();
  ctx.fillRect(760, y - 96, 6, 96);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(766, y - 96); ctx.lineTo(820, y - 86); ctx.lineTo(766, y - 74); ctx.fill();
}
export function fence(ctx, y, x0 = 0, x1 = W, col = '#FFFFFF') {
  for (let x = x0 + 20; x < x1; x += 120) { ctx.fillStyle = col; M.rrect(ctx, x - 5, y - 46, 10, 50, 0); ctx.fill(); }
  line(ctx, [[x0, y - 36], [x1, y - 36]], col, 5); line(ctx, [[x0, y - 16], [x1, y - 16]], col, 5);
}
export function speakerPole(ctx, x, y, s = 1) {
  at(ctx, x, y, s, 0, () => {
    rr(ctx, -7, -330, 14, 330, 0, C.greyDark);
    for (const sg of [-1, 1]) {
      ctx.save(); ctx.scale(sg, 1);
      ctx.beginPath(); ctx.moveTo(8, -322); ctx.lineTo(70, -346); ctx.lineTo(70, -268); ctx.lineTo(8, -292); ctx.closePath();
      ctx.fillStyle = C.grey; ctx.fill(); rr(ctx, 66, -350, 12, 86, 0, C.greyDark);
      ctx.restore();
    }
  });
}
export function tent(ctx, x, y, s = 1, col = C.tealSoft, trim = C.teal, label) {
  at(ctx, x, y, s, 0, () => {
    ctx.beginPath(); ctx.moveTo(-220, -150); ctx.lineTo(0, -300); ctx.lineTo(220, -150); ctx.closePath(); ctx.fillStyle = trim; ctx.fill();
    rr(ctx, -200, -150, 400, 150, 0, col);
    rr(ctx, -60, -120, 120, 120, 0, C.paper);
    ctx.beginPath(); ctx.moveTo(-60, -120); ctx.quadraticCurveTo(-10, -60, -60, 0); ctx.lineTo(-60, -120); ctx.fillStyle = trim; ctx.fill();
    for (let i = -4; i < 4; i++) { ctx.beginPath(); ctx.arc(i * 50 + 25, -150, 25, 0, Math.PI); ctx.fillStyle = trim; ctx.fill(); }
    if (label) { M.text(ctx, label, 0, -196, F(40, 800), C.white, 'center'); }
  });
}
export function foodVan(ctx, x, y, s = 1) {
  at(ctx, x, y, s, 0, () => {
    rr(ctx, -190, -210, 380, 190, 0, C.pink);
    rr(ctx, -150, -170, 200, 90, 0, C.night2);
    rr(ctx, -170, -196, 240, 30, 0, C.red);
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-150 + i * 40, -166, 20, 0, Math.PI); ctx.fillStyle = i % 2 ? C.white : C.red; ctx.fill(); }
    circ(ctx, -110, -14, 34, C.ink); circ(ctx, 110, -14, 34, C.ink); circ(ctx, -110, -14, 14, C.grey); circ(ctx, 110, -14, 14, C.grey);
    rr(ctx, 80, -160, 80, 60, 0, C.skyTop);
  });
}
export function car(ctx, x, y, s = 1, col = C.blue) {
  at(ctx, x, y, s, 0, () => {
    ctx.beginPath(); ctx.moveTo(-130, -90); ctx.quadraticCurveTo(-100, -170, -40, -170); ctx.lineTo(70, -170);
    ctx.quadraticCurveTo(120, -165, 150, -90); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    rr(ctx, -210, -100, 420, 80, 30, col);
    ctx.beginPath(); ctx.moveTo(-100, -96); ctx.quadraticCurveTo(-84, -150, -40, -152); ctx.lineTo(-8, -152); ctx.lineTo(-8, -96); ctx.closePath(); ctx.fillStyle = C.skyTop; ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -96); ctx.lineTo(10, -152); ctx.lineTo(66, -152); ctx.quadraticCurveTo(104, -146, 124, -96); ctx.closePath(); ctx.fill();
    circ(ctx, -120, -22, 40, C.ink); circ(ctx, 120, -22, 40, C.ink); circ(ctx, -120, -22, 17, C.grey); circ(ctx, 120, -22, 17, C.grey);
  });
}
export function house(ctx) {   // a calm living room wall
  M.fill(ctx, '#EFE6D6');
  ctx.fillStyle = '#E3D6C0'; ctx.fillRect(0, 800, W, 280);
  rr(ctx, 1300, 150, 380, 330, 0, C.white); rr(ctx, 1322, 172, 336, 286, 0, C.skyTop);
  cloud(ctx, 1480, 330, 0.6); ctx.fillStyle = C.white; ctx.fillRect(1484, 172, 12, 286);
}
export function sofa(ctx, x, y, s = 1) {
  at(ctx, x, y, s, 0, () => {
    rr(ctx, -330, -290, 660, 240, 0, '#8FB8B4'); rr(ctx, -370, -200, 100, 200, 0, '#7AA7A3'); rr(ctx, 270, -200, 100, 200, 0, '#7AA7A3');
    rr(ctx, -300, -150, 600, 110, 0, '#A7CBC7'); rr(ctx, -300, -50, 600, 50, 0, '#7AA7A3');
  });
}

// ---------------------------------------------------------------- people
// A flat cartoon person. Origin = between the feet. s = 1 is a child about 260 px tall.
// o: { adult, skin, hair, hairStyle, top, bottom, shoe, defenders, headphones, lanyard, cap,
//      mood: happy|calm|neutral|worried|overwhelm|wow, armL:[a,b], armR:[a,b], look:[dx,dy],
//      tilt, sit, flip, blinkU, bob, hold: 'card'|'tablet'|'camera'|'checklist', cardCol }
export const POSE = {
  down: [0.12, 0.1], relaxed: [0.3, 0.25], wave: [2.5, -0.25], up: [2.75, 0], ears: [2.1, 1.5],
  hold: [0.5, 1.35], point: [1.5, 0.1], hip: [0.9, 1.9], reach: [1.2, 0.2], hug: [0.9, 0.9],
};
export function person(ctx, x, y, s, o = {}) {
  const adult = !!o.adult;
  const leg = adult ? 150 : 72, bodyH = adult ? 150 : 96, bodyW = adult ? 100 : 80, headR = adult ? 46 : 50;
  const skin = o.skin || '#F2C9A5', hair = o.hair || '#6B4A32', top = o.top || C.teal, bottom = o.bottom || C.ink;
  const mood = o.mood || 'happy', look = o.look || [0, 0];
  const sit = o.sit || 0;
  const bob = o.bob || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(o.flip ? -s : s, s);
  // soft ground shadow
  ctx.save(); ctx.globalAlpha *= 0.14; ctx.beginPath(); ctx.ellipse(0, 4, bodyW * 0.8, 12, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  const hipY = -leg * (1 - sit) - (sit ? 18 : 0) + bob;
  // legs
  ctx.lineCap = 'round';
  for (const sg of [-1, 1]) {
    const hx = sg * bodyW * 0.24;
    if (sit) { line(ctx, [[hx, hipY], [hx + leg * 0.9, hipY + 6]], bottom, adult ? 34 : 30); rr(ctx, hx + leg * 0.9 - 6, hipY - 22, 26, 34, 10, o.shoe || C.ink); }
    else {
      const st = (o.walk || 0) * sg * 26;
      line(ctx, [[hx, hipY], [hx + st, -8]], bottom, adult ? 34 : 30);
      rr(ctx, hx + st - 20, -18, 46, 22, 10, o.shoe || C.ink);
    }
  }
  // body
  const bTop = hipY - bodyH;
  ctx.save(); ctx.translate(0, hipY); ctx.rotate((o.lean || 0)); ctx.translate(0, -hipY);
  rr(ctx, -bodyW / 2, bTop, bodyW, bodyH + 14, bodyW * 0.42, top);
  if (o.stripe) { rr(ctx, -bodyW / 2, bTop + bodyH * 0.42, bodyW, 16, 0, o.stripe); }
  // lanyard
  if (o.lanyard) {
    line(ctx, [[-bodyW * 0.22, bTop + 6], [0, bTop + bodyH * 0.5], [bodyW * 0.22, bTop + 6]], o.lanyard === true ? C.sun : o.lanyard, 7);
    for (let i = 0; i < 3; i++) { circ(ctx, -bodyW * 0.16 + i * bodyW * 0.03, bTop + 22 + i * 22, 5, C.yellow); circ(ctx, bodyW * 0.16 - i * bodyW * 0.03, bTop + 22 + i * 22, 5, C.yellow); }
    rr(ctx, -15, bTop + bodyH * 0.5 - 2, 30, 38, 5, C.white);
    circ(ctx, 0, bTop + bodyH * 0.5 + 16, 8, C.yellow);
  }
  // arms
  const L1 = adult ? 66 : 44, L2 = adult ? 62 : 42, aw = adult ? 26 : 24;
  const shY = bTop + 20;
  const hands = [];
  for (const sg of [-1, 1]) {
    const [a, b] = (sg < 0 ? o.armL : o.armR) || POSE.down;
    const sx = sg * bodyW * 0.42;
    const ex = sx + sg * Math.sin(a) * L1, ey = shY + Math.cos(a) * L1;
    const hx = ex + sg * Math.sin(a + b) * L2, hy = ey + Math.cos(a + b) * L2;
    line(ctx, [[sx, shY], [ex, ey], [hx, hy]], o.sleeve || top, aw);
    circ(ctx, hx, hy, aw * 0.56, skin);
    hands.push([hx, hy]);
  }
  // head
  const hy0 = bTop - headR * 0.78;
  ctx.save(); ctx.translate(0, hy0 + headR * 0.7); ctx.rotate(o.tilt || 0); ctx.translate(0, -headR * 0.7);
  rr(ctx, -11, -headR * 0.2 + headR * 0.7, 22, 30, 8, skin);   // neck
  const hs = o.hairStyle || 'short';
  if (hs === 'long' || hs === 'bob') rr(ctx, -headR * 1.08, -headR * 0.5, headR * 2.16, headR * (hs === 'long' ? 2.1 : 1.55), headR * 0.7, hair);
  if (hs === 'bun') circ(ctx, 0, -headR * 1.15, headR * 0.42, hair);
  if (hs === 'curly') for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; circ(ctx, Math.cos(a) * headR * 0.95, Math.sin(a) * headR * 0.9 - 4, headR * 0.36, hair); }
  circ(ctx, 0, 0, headR, skin);
  circ(ctx, -headR * 0.98, 4, headR * 0.17, skin); circ(ctx, headR * 0.98, 4, headR * 0.17, skin);
  // hair cap
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, headR + 1, 0, TAU); ctx.clip();
  ctx.fillStyle = hair;
  if (hs === 'short') { ctx.beginPath(); ctx.ellipse(headR * 0.1, -headR * 0.92, headR * 1.2, headR * 0.62, -0.12, 0, TAU); ctx.fill(); }
  else if (hs === 'tuft') { ctx.beginPath(); ctx.ellipse(-headR * 0.1, -headR * 0.95, headR * 1.25, headR * 0.6, 0.15, 0, TAU); ctx.fill(); }
  else if (hs === 'bald') { /* none */ }
  else { ctx.beginPath(); ctx.ellipse(0, -headR * 0.9, headR * 1.25, headR * 0.62, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
  if (hs === 'tuft') { ctx.beginPath(); ctx.moveTo(-6, -headR * 0.96); ctx.quadraticCurveTo(8, -headR * 1.42, 26, -headR * 1.2); ctx.quadraticCurveTo(14, -headR * 1.12, 16, -headR * 0.94); ctx.fillStyle = hair; ctx.fill(); }
  if (o.cap) { ctx.beginPath(); ctx.arc(0, -headR * 0.22, headR * 1.04, Math.PI, TAU); ctx.fillStyle = o.cap; ctx.fill(); rr(ctx, 0, -headR * 0.36, headR * 1.5, 16, 8, o.cap); }
  if (o.beard) { ctx.beginPath(); ctx.arc(0, headR * 0.1, headR * 0.98, 0.15, Math.PI - 0.15); ctx.quadraticCurveTo(0, headR * 0.2, headR * 0.96, headR * 0.25); ctx.fillStyle = o.beard; ctx.fill(); }
  // face
  const ex = headR * 0.36, eyY = headR * 0.06, lx = look[0] * 5, ly = look[1] * 4;
  const blink = o.blinkU !== undefined && ((o.blinkU + (o.blinkOff || 0)) % 5.3) < 0.14;
  const ink = '#2A2A33';
  ctx.lineCap = 'round';
  if (mood === 'overwhelm') {
    for (const sg of [-1, 1]) { line(ctx, [[sg * ex - sg * 9, eyY - 8], [sg * ex + sg * 7, eyY], [sg * ex - sg * 9, eyY + 8]], ink, 5); }
  } else if (blink || mood === 'calm') {
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(sg * ex, eyY - 2, 8, 0.15, Math.PI - 0.15); ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.stroke(); }
  } else {
    const r = mood === 'wow' ? 9 : 7;
    circ(ctx, -ex + lx, eyY + ly, r, ink); circ(ctx, ex + lx, eyY + ly, r, ink);
  }
  if (mood === 'worried' || mood === 'overwhelm') {
    line(ctx, [[-ex - 12, eyY - 24], [-ex + 10, eyY - 30]], ink, 4.5); line(ctx, [[ex + 12, eyY - 24], [ex - 10, eyY - 30]], ink, 4.5);
  }
  circ(ctx, -headR * 0.56, headR * 0.34, headR * 0.15, 'rgba(235,120,110,0.28)'); circ(ctx, headR * 0.56, headR * 0.34, headR * 0.15, 'rgba(235,120,110,0.28)');
  const my = headR * 0.46;
  ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.beginPath();
  if (mood === 'happy') { ctx.arc(0, my - 10, 17, 0.25, Math.PI - 0.25); ctx.stroke(); }
  else if (mood === 'calm') { ctx.arc(0, my - 8, 13, 0.3, Math.PI - 0.3); ctx.stroke(); }
  else if (mood === 'neutral') { ctx.moveTo(-10, my); ctx.lineTo(10, my); ctx.stroke(); }
  else if (mood === 'worried') { ctx.arc(0, my + 14, 13, Math.PI + 0.45, TAU - 0.45); ctx.stroke(); }
  else if (mood === 'overwhelm') { ctx.moveTo(-15, my + 2); ctx.quadraticCurveTo(-8, my - 7, 0, my + 2); ctx.quadraticCurveTo(8, my + 11, 15, my + 2); ctx.stroke(); }
  else if (mood === 'wow') { ctx.ellipse(0, my + 2, 9, 12, 0, 0, TAU); ctx.fillStyle = ink; ctx.fill(); }
  else if (mood === 'grin') { ctx.arc(0, my - 14, 20, 0.1, Math.PI - 0.1); ctx.closePath(); ctx.fillStyle = ink; ctx.fill(); }
  // ear defenders / headphones
  const dcol = o.defenders || o.headphones;
  if (dcol) {
    ctx.beginPath(); ctx.arc(0, 0, headR + 9, Math.PI + 0.12, TAU - 0.12); ctx.strokeStyle = o.headphones ? C.ink : dcol; ctx.lineWidth = o.headphones ? 9 : 12; ctx.stroke();
    for (const sg of [-1, 1]) { rr(ctx, sg * (headR + 3) - 15, -24, 30, 56, 13, dcol); rr(ctx, sg * (headR + 3) - (sg > 0 ? -9 : 15), -16, 6, 40, 3, 'rgba(0,0,0,0.16)'); }
  }
  ctx.restore();
  // things held (in the right hand unless both)
  if (o.hold) {
    const [hx, hy] = hands[1];
    if (o.hold === 'card') { at(ctx, hx + 6, hy - 40, 1, 0.08, () => { rr(ctx, -38, -52, 76, 104, 0, C.white); rr(ctx, -30, -44, 60, 88, 0, o.cardCol || C.teal); }); circ(ctx, hx, hy, aw * 0.56, skin); }
    if (o.hold === 'camera') { const mx = (hands[0][0] + hx) / 2, myy = (hands[0][1] + hy) / 2; rr(ctx, mx - 42, myy - 30, 84, 56, 0, C.ink); circ(ctx, mx, myy, 20, C.greyDark); circ(ctx, mx, myy, 10, C.skyTop); rr(ctx, mx - 30, myy - 40, 26, 14, 0, C.ink); }
    if (o.hold === 'tablet') { const mx = (hands[0][0] + hx) / 2, myy = (hands[0][1] + hy) / 2; rr(ctx, mx - 70, myy - 50, 140, 96, 0, C.ink); rr(ctx, mx - 60, myy - 40, 120, 76, 0, C.skyTop); }
    if (o.hold === 'checklist') { at(ctx, hx + 4, hy - 34, 1, 0.1, () => { rr(ctx, -40, -56, 80, 112, 0, C.wood); rr(ctx, -32, -44, 64, 94, 0, C.white); rr(ctx, -14, -62, 28, 16, 0, C.greyDark); for (let i = 0; i < 4; i++) rr(ctx, -22, -32 + i * 20, 44, 7, 0, i < (o.ticks ?? 4) ? C.teal : '#D9DEE3'); }); circ(ctx, hx, hy, aw * 0.56, skin); }
  }
  ctx.restore();
  ctx.restore();
}
// the cast: Charlie (autistic, about 8), Dad, Beth (an autistic adult), show staff
export const KID = { skin: '#F2C9A5', hair: '#7A4F2E', hairStyle: 'tuft', top: '#F2B441', bottom: '#3A5A80', shoe: C.red, stripe: '#FBF6EC' };
export const DAD = { adult: true, skin: '#EDBE96', hair: '#5A3B26', hairStyle: 'short', beard: '#5A3B26', top: '#C96B6B', bottom: '#3D4A63', shoe: '#2B2B33' };
export const BETH = { adult: true, skin: '#B9805A', hair: '#1F1A1C', hairStyle: 'bun', top: '#6E5AA8', bottom: '#2E3B4E', shoe: '#2B2B33', lanyard: true };
export const STAFF = { adult: true, skin: '#8E5E3F', hair: '#1D1715', hairStyle: 'short', top: '#F6C453', bottom: '#2E3B4E', shoe: '#2B2B33', stripe: '#C9D4DC' };
export const DEF = '#2F8F8A';     // Charlie's ear defenders
export const kid = (ctx, x, y, s, o = {}) => person(ctx, x, y, s, { ...KID, ...o });
export const dad = (ctx, x, y, s, o = {}) => person(ctx, x, y, s, { ...DAD, ...o });
export const beth = (ctx, x, y, s, o = {}) => person(ctx, x, y, s, { ...BETH, ...o });
export const staff = (ctx, x, y, s, o = {}) => person(ctx, x, y, s, { ...STAFF, ...o });
// happy hand flapping (a stim): arms out, forearms fluttering
export const flap = (u, sp = 4.5) => { const k = Math.sin(u * TAU * sp) * 0.45; return { armL: [1.25, 0.9 + k], armR: [1.25, 0.9 - k] }; };

// a simple figure for crowds
const CROWD = ['#9FB3C8', '#C7B5A6', '#B7C9B0', '#C9B3C9', '#D6C59A', '#A8BFC0', '#BFA9A0'];
export function crowdPerson(ctx, x, y, s, i = 0, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s, s);
  const col = CROWD[i % CROWD.length], tall = 0.85 + hash01(i, 5) * 0.45;
  rr(ctx, -34, -150 * tall, 68, 150 * tall, 28, col);
  circ(ctx, 0, -150 * tall - 26, 34, ['#EBC7A6', '#C99672', '#8E5E3F', '#F3D5BA'][i % 4]);
  ctx.beginPath(); ctx.arc(0, -150 * tall - 30, 35, Math.PI, TAU); ctx.fillStyle = ['#4A3A32', '#2B2622', '#8A6A48', '#B9B2A8'][(i * 3) % 4]; ctx.fill();
  ctx.restore();
}
export function crowd(ctx, x0, x1, y, n, s = 1, seed = 1, alpha = 1, sway = 0) {
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, (i + hash01(i, seed) * 0.8) / n), yy = y + (hash01(i, seed + 3) - 0.5) * 30 * s;
    crowdPerson(ctx, x, yy + Math.sin(sway + i) * 2, s * (0.9 + hash01(i, seed + 7) * 0.2), i + seed, alpha);
  }
}

// ---------------------------------------------------------------- aircraft
// Real cut-outs, never drawn planes (house rule, same files as the other UK Airshow Guide cartoons):
// Red Arrows Hawk, Typhoon, A400M and a Mustang, side on with the nose to the right.
const PLANE = {};
await Promise.all(['typhoon-side', 'hawk-side', 'a400m-side', 'mustang-side', 'hawk-top', 'typhoon-top'].map(async (k) => {
  const im = new Image(); im.src = new URL(`./aircraft/${k}.webp`, import.meta.url).href;
  await im.decode(); PLANE[k] = im;
}));
const plane = (ctx, k, w) => { const im = PLANE[k], h = w * im.height / im.width; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, -w / 2, -h / 2, w, h); };
// the fast jet: a Typhoon
export function jet(ctx, x, y, s, rot = 0, o = {}) {
  at(ctx, x, y, s, rot, () => {
    if (o.burn) {
      const f = 0.85 + 0.15 * Math.sin((o.u || 0) * 40);
      ctx.beginPath(); ctx.moveTo(-178, 4); ctx.quadraticCurveTo(-250 * f, 12, -310 * f, 12); ctx.quadraticCurveTo(-250 * f, 14, -178, 22); ctx.fillStyle = C.orange; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-178, 8); ctx.quadraticCurveTo(-220, 12, -250 * f, 13); ctx.quadraticCurveTo(-220, 14, -178, 18); ctx.fillStyle = C.yellow; ctx.fill();
    }
    plane(ctx, 'typhoon-side', 440);
  });
}
// a Red Arrows Hawk, with a smoke trail if a colour is given (red '#D7263D', white, blue '#1D63B7')
export function redJet(ctx, x, y, s, rot = 0, smoke = null, len = 300) {
  if (smoke) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const white = /^#f{3,6}$/i.test(smoke) || smoke === 'white';
    for (const [col, h] of white ? [['#9FB0BF', 18], ['#FFFFFF', 12]] : [[smoke, 14]]) {
      const g = ctx.createLinearGradient(-len * s - 90 * s, 0, -90 * s, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, col); g.addColorStop(1, col);
      ctx.fillStyle = g; ctx.fillRect(-len * s - 90 * s, -h * s / 2 + 6 * s, len * s, h * s);
    }
    ctx.restore();
  }
  at(ctx, x, y, s, rot, () => plane(ctx, 'hawk-side', 210));
}
// the gentle vintage aircraft: a Mustang
export function propPlane(ctx, x, y, s, rot = 0, u = 0, o = {}) {
  at(ctx, x, y, s, rot, () => plane(ctx, 'mustang-side', 400));
}
// the big transport: an A400M
export function a400(ctx, x, y, s, rot = 0) { at(ctx, x, y, s, rot, () => plane(ctx, 'a400m-side', 520)); }
// seen from above (nose up in the file): kind 'hawk-top' or 'typhoon-top', heading in radians (0 = up)
export function topPlane(ctx, kind, x, y, w, heading = 0) { at(ctx, x, y, 1, heading, () => { const im = PLANE[kind]; ctx.drawImage(im, -w / 2, -w * im.height / im.width / 2, w, w * im.height / im.width); }); }

// ---------------------------------------------------------------- sound shapes
// Loud, sharp sound: a spiky burst. jag 0..1 = how sharp (0 = soft round blob).
export function burst(ctx, x, y, r, col, o = {}) {
  const n = o.n || 14, jag = o.jag ?? 1, u = o.u || 0, seed = o.seed || 1;
  ctx.beginPath();
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * TAU + (o.rot || 0);
    const k = i % 2 ? 1 - 0.42 * jag * (0.7 + 0.3 * hash01(i, seed)) : 1 + 0.16 * jag * hash01(i, seed + 4);
    const wob = 1 + 0.035 * Math.sin(u * 3 + i * 1.7);
    const px = x + Math.cos(a) * r * k * wob, py = y + Math.sin(a) * r * k * wob * (o.squash || 1);
    if (jag < 0.25) { if (i === 0) ctx.moveTo(px, py); else { const a0 = ((i - 0.5) / (n * 2)) * TAU + (o.rot || 0); ctx.quadraticCurveTo(x + Math.cos(a0) * r * 1.02, y + Math.sin(a0) * r * 1.02 * (o.squash || 1), px, py); } }
    else if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
// Gentle sound: soft rings
export function rings(ctx, x, y, r, col, u = 0, n = 3, lw = 10) {
  for (let i = 0; i < n; i++) {
    const p = ((u * 0.5 + i / n) % 1);
    ctx.save(); ctx.globalAlpha *= (1 - p) * 0.9; ctx.beginPath(); ctx.arc(x, y, r * (0.35 + p * 0.75), 0, TAU); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); ctx.restore();
  }
}
// Harsh speaker sound: a zigzag ribbon. amp 0 -> smooth wave when soft=1
export function zig(ctx, x, y, len, amp, col, o = {}) {
  const n = o.n || 9, lw = o.lw || 12, u = o.u || 0, soft = o.soft || 0, rot = o.rot || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(0, 0);
  for (let i = 1; i <= n; i++) {
    const px = (i / n) * len, py = (i % 2 ? -1 : 1) * amp * (0.55 + 0.45 * Math.sin(u * 5 + i)) * Math.min(1, i / 2);
    if (soft > 0.5) ctx.quadraticCurveTo(px - len / n / 2, py * 1.6, px, 0); else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = soft > 0.5 ? 'round' : 'miter'; ctx.stroke(); ctx.restore();
}
// Crowd chatter: lots of small pebbles drifting about a box
export function pebbles(ctx, x, y, w, h, n, u, col = C.grey, o = {}) {
  const sz = o.size || 16, seed = o.seed || 2, amt = o.amt ?? 1;
  for (let i = 0; i < n; i++) {
    if (hash01(i, seed + 9) > amt) continue;
    const px = x + hash01(i, seed) * w + Math.sin(u * 0.9 + i * 2.1) * 14, py = y + hash01(i, seed + 1) * h + Math.cos(u * 1.1 + i * 1.3) * 12;
    const r = sz * (0.5 + hash01(i, seed + 2));
    ctx.save(); ctx.globalAlpha *= 0.55 + 0.4 * hash01(i, seed + 5); M.rrect(ctx, px - r, py - r * 0.6, r * 2, r * 1.2, r * 0.6); ctx.fillStyle = Array.isArray(col) ? col[i % col.length] : col; ctx.fill(); ctx.restore();
  }
}
// Steady drone (generator): a wavy stripe
export function hum(ctx, x, y, len, amp, col, u = 0, lw = 16) {
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) { const px = x + (i / 60) * len, py = y + Math.sin(i * 0.55 + u * 4) * amp; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}

// ---------------------------------------------------------------- props and icons
export function defendersIcon(ctx, x, y, s, col = DEF, rot = 0) {
  at(ctx, x, y, s, rot, () => {
    ctx.beginPath(); ctx.arc(0, 0, 62, Math.PI + 0.1, TAU - 0.1); ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();
    for (const sg of [-1, 1]) { rr(ctx, sg * 60 - 20, -16, 40, 72, 17, col); rr(ctx, sg * 60 - (sg > 0 ? -10 : 18), -6, 8, 52, 4, 'rgba(0,0,0,0.16)'); }
  });
}
export function backpack(ctx, x, y, s, col = C.red) {
  at(ctx, x, y, s, 0, () => {
    ctx.beginPath(); ctx.arc(0, -210, 46, Math.PI, TAU); ctx.strokeStyle = C.ink; ctx.lineWidth = 14; ctx.stroke();
    rr(ctx, -120, -220, 240, 220, 0, col); rr(ctx, -86, -110, 172, 96, 0, 'rgba(0,0,0,0.14)'); rr(ctx, -20, -124, 40, 22, 0, C.yellow);
  });
}
export function tick(ctx, x, y, s, p = 1, col = C.teal, lw = 12) {
  if (p <= 0) return;
  const pts = [[-22, 2], [-6, 18], [26, -20]];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  const p1 = Math.min(1, p * 2.5), p2 = clamp((p - 0.4) / 0.6);
  ctx.lineTo(lerp(pts[0][0], pts[1][0], p1), lerp(pts[0][1], pts[1][1], p1));
  if (p2 > 0) ctx.lineTo(lerp(pts[1][0], pts[2][0], p2), lerp(pts[1][1], pts[2][1], p2));
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
export function sunflower(ctx, x, y, s, rot = 0) {
  at(ctx, x, y, s, rot, () => { for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate((i / 12) * TAU); ctx.beginPath(); ctx.ellipse(0, -34, 11, 22, 0, 0, TAU); ctx.fillStyle = C.yellow; ctx.fill(); ctx.restore(); } circ(ctx, 0, 0, 20, '#7A4F2E'); });
}
export function snack(ctx, x, y, s) { at(ctx, x, y, s, 0, () => { rr(ctx, -50, -40, 100, 80, 0, C.blue); rr(ctx, -50, -52, 100, 30, 0, '#8FC0EA'); circ(ctx, 0, 6, 18, C.red); rr(ctx, -2, -20, 4, 12, 0, C.sun); }); }
export function bottle(ctx, x, y, s) { at(ctx, x, y, s, 0, () => { rr(ctx, -22, -70, 44, 120, 0, C.tealSoft); rr(ctx, -12, -96, 24, 30, 0, C.teal); rr(ctx, -22, -20, 44, 26, 0, C.white); }); }
export function sunglasses(ctx, x, y, s) { at(ctx, x, y, s, 0, () => { rr(ctx, -66, -22, 58, 44, 0, C.ink); rr(ctx, 8, -22, 58, 44, 0, C.ink); rr(ctx, -10, -14, 20, 8, 0, C.ink); }); }
export function fidget(ctx, x, y, s, u = 0) { at(ctx, x, y, s, u * 1.5, () => { for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; circ(ctx, Math.cos(a) * 40, Math.sin(a) * 40, 28, C.lilac); circ(ctx, Math.cos(a) * 40, Math.sin(a) * 40, 12, C.white); } circ(ctx, 0, 0, 24, '#8E7CC3'); }); }
export function teddy(ctx, x, y, s) { at(ctx, x, y, s, 0, () => { circ(ctx, -34, -78, 20, C.wood); circ(ctx, 34, -78, 20, C.wood); circ(ctx, 0, -48, 46, C.wood); rr(ctx, -40, -20, 80, 84, 34, C.wood); circ(ctx, 0, -38, 18, '#E3C6A4'); circ(ctx, -15, -56, 5, C.ink); circ(ctx, 15, -56, 5, C.ink); circ(ctx, 0, -42, 6, C.ink); }); }
export function tablet(ctx, x, y, s, rot, screen) {
  at(ctx, x, y, s, rot, () => { rr(ctx, -260, -170, 520, 340, 0, C.ink); ctx.save(); M.rrect(ctx, -240, -150, 480, 300, 0); ctx.clip(); ctx.fillStyle = C.skyTop; ctx.fillRect(-240, -150, 480, 300); if (screen) screen(); ctx.restore(); });
}
// two-sided signal card: green = I am OK, red = I need a break
export function signalCard(ctx, x, y, s, rot, flipP = 0) {
  const sx = Math.cos(flipP * Math.PI), red = flipP > 0.5;
  at2(ctx, x, y, s * Math.max(0.04, Math.abs(sx)), s, rot, () => {
    rr(ctx, -110, -150, 220, 300, 0, C.white); rr(ctx, -94, -134, 188, 268, 0, red ? C.red : C.sun);
    if (red) { rr(ctx, -50, -16, 100, 32, 0, C.white); } else tick(ctx, 0, 0, 2.2, 1, C.white, 12);
  });
}
// a map pin
export function pin(ctx, x, y, s, col = C.red) { at(ctx, x, y, s, 0, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-46, -50, -40, -100, 0, -100); ctx.bezierCurveTo(40, -100, 46, -50, 0, 0); ctx.fillStyle = col; ctx.fill(); circ(ctx, 0, -64, 15, C.white); }); }
// dotted route, drawn on from 0..1
export function route(ctx, pts, p, col = C.teal, lw = 9, dash = [4, 26]) {
  if (p <= 0) return;
  let total = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let left = total * clamp(p);
  ctx.save(); ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let end = pts[0];
  for (let i = 1; i < pts.length && left > 0; i++) { const k = Math.min(1, left / seg[i - 1]); end = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; ctx.lineTo(end[0], end[1]); left -= seg[i - 1]; }
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
  return end;
}

// ---------------------------------------------------------------- words on screen
// Wraps text to a width. Returns lines.
export function wrap(ctx, str, f, maxW) {
  ctx.font = f; const out = []; let cur = '';
  for (const w of str.split(' ')) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}
// The caption card: every tip is carried by one of these, so the film works with the sound off.
// o: { num, kicker, sub, y, w, dark, x, align }
export function caption(ctx, u, a, b, str, o = {}) {
  if (u < a - 0.1 || u > b) return;
  const k = springU(u, a, SPRING.gentle), out = E.inCubic(prog(u, b - 0.5, b));
  const size = o.size || 66, f = F(size, 700), w = o.w || 1400, pad = 46;
  const lines = wrap(ctx, str, f, w - pad * 2 - (o.num ? 120 : 0));
  const subLines = o.sub ? wrap(ctx, o.sub, F(44, 500), w - pad * 2 - (o.num ? 120 : 0)) : [];
  const h = pad * 1.5 + lines.length * size * 1.16 + subLines.length * 54 + (o.kicker ? 44 : 0) + (subLines.length ? 10 : 0);
  const x = o.x ?? (W - w) / 2, y0 = (o.y ?? H - 70) - h;
  const y = y0 + (1 - k) * (h + 140) + out * (h + 140);
  ctx.save(); ctx.globalAlpha *= 0.16; rr(ctx, x + 6, y + 12, w, h, 0, '#000'); ctx.restore();
  rr(ctx, x, y, w, h, 0, o.dark ? C.ink : C.paper);
  const fg = o.dark ? C.paper : C.ink;
  let tx = x + pad, ty = y + pad * 0.75;
  if (o.num) {
    rr(ctx, x + pad, y + h / 2 - 46, 92, 92, 0, o.numCol || C.teal);
    M.text(ctx, String(o.num), x + pad + 46, y + h / 2 + 20, F(58, 800), C.white, 'center');
    tx += 120;
  }
  if (o.kicker) { M.text(ctx, o.kicker.toUpperCase(), tx, ty + 30, F(30, 800), o.kickCol || C.teal, 'left', 2.5); ty += 44; }
  lines.forEach((l, i) => M.text(ctx, l, tx, ty + size * 0.92 + i * size * 1.16, f, fg));
  ty += lines.length * size * 1.16 + 10;
  subLines.forEach((l, i) => M.text(ctx, l, tx, ty + 42 + i * 54, F(44, 500), o.dark ? '#C9D4DC' : C.greyDark));
}
// A gentle heads-up before every loud moment in the film: three dots count down to uLoud.
export function loudChip(ctx, u, uLoud, o = {}) {
  const a = uLoud - 4, b = uLoud + (o.hold ?? 1.5);
  if (u < a || u > b) return;
  const k = springU(u, a, SPRING.snappy), out = E.inCubic(prog(u, b - 0.4, b));
  const w = 500, h = 92, x = o.x ?? W - w - 70, y = (o.y ?? 60) - (1 - k) * 200 - out * 200;
  rr(ctx, x, y, w, h, 0, C.ink);
  M.text(ctx, u < uLoud ? 'Loud bit coming' : 'Loud bit now', x + 40, y + 59, F(38, 700), C.paper);
  for (let i = 0; i < 3; i++) { const on = u < uLoud - (2 - i) - 1 ? 0 : 1; circ(ctx, x + w - 126 + i * 38, y + h / 2, 12, on ? C.orange : '#4B5E76'); }
}
// How loud does it feel? A vertical meter, 0..1
export function meter(ctx, x, y, h, v, o = {}) {
  const w = o.w || 46; rr(ctx, x - 8, y - 8, w + 16, h + 16, 0, C.white); rr(ctx, x, y, w, h, 0, '#E4E9EE');
  const vv = clamp(v), col = vv > 0.7 ? C.orange : vv > 0.4 ? C.yellow : C.teal;
  ctx.save(); M.rrect(ctx, x, y, w, h, 0); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(x, y + h * (1 - vv), w, h * vv); ctx.restore();
  if (o.label) M.text(ctx, o.label, x + w / 2, y + h + 50, F(28, 700), o.labelCol || C.ink, 'center');
}
// A battery that shows how much energy someone has left, 0..1
export function battery(ctx, x, y, w, h, v, o = {}) {
  rr(ctx, x + w, y + h * 0.3, 14, h * 0.4, 0, C.ink); rr(ctx, x, y, w, h, 0, C.ink); rr(ctx, x + 8, y + 8, w - 16, h - 16, 0, C.white);
  const vv = clamp(v), col = vv > 0.55 ? C.sun : vv > 0.28 ? C.yellow : C.red;
  if (vv > 0.02) rr(ctx, x + 14, y + 14, (w - 28) * vv, h - 28, 0, col);
  if (o.label) M.text(ctx, o.label, x, y - 16, F(30, 700), o.labelCol || C.ink);
}
// small label pill
export function pill(ctx, x, y, str, o = {}) {
  const f = F(o.size || 34, 700); ctx.font = f; const w = ctx.measureText(str).width + 56, h = (o.size || 34) + 34;
  const xx = o.align === 'center' ? x - w / 2 : x;
  rr(ctx, xx, y - h / 2, w, h, 0, o.bg || C.ink); M.text(ctx, str, xx + 28, y + (o.size || 34) * 0.34, f, o.fg || C.paper);
  return w;
}
// The end card, shared by all three films.
export function endCard(ctx, u, u0, IMG, o = {}) {
  const k = ease(u, u0, u0 + 1.2, E.outCubic);
  if (k <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.arc(o.cx ?? W / 2, o.cy ?? H * 0.6, k * 1400, 0, TAU); ctx.clip();
  M.fill(ctx, C.paper);
  const lk = pop(u, u0 + 0.6, SPRING.gentle);
  if (IMG.logo) { const lw = 640, lh = lw * IMG.logo.height / IMG.logo.width; ctx.drawImage(IMG.logo, 120, 150 - (1 - lk) * 60, lw, lh); }
  const tk = pop(u, u0 + 1.2, SPRING.gentle);
  M.text(ctx, o.line1 || 'A calm airshow visit', 150 - (1 - tk) * 80, 600, F(104, 800), C.ink);
  const sk = pop(u, u0 + 1.8, SPRING.gentle);
  M.text(ctx, o.line2 || 'The full guide, with quiet spaces show by show', 154 - (1 - sk) * 80, 684, F(52, 500), C.greyDark);
  const pk = pop(u, u0 + 2.4, SPRING.bouncy);
  if (pk > 0) { ctx.save(); ctx.translate(150, 800); ctx.scale(pk, pk); const w = pill(ctx, 0, 0, 'ukairshowguide.co.uk', { size: 50, bg: C.teal, fg: C.white }); ctx.restore(); }
  // Charlie waving, defenders on
  const ck = pop(u, u0 + 1.0, SPRING.gentle);
  const wv = Math.sin(u * TAU * 0.75) * 0.25;
  dad(ctx, 1640, 980 + (1 - ck) * 500, 1.5, { mood: 'happy', blinkU: u, armL: POSE.relaxed, armR: POSE.relaxed });
  kid(ctx, 1380, 990 + (1 - ck) * 500, 1.75, { mood: 'happy', defenders: DEF, blinkU: u, blinkOff: 2, armR: [2.5 + wv, -0.25], armL: POSE.relaxed });
  ctx.restore();
}
// Gives every scene more time on screen. cuts = the beats where scenes start and end; each scene
// gets `extra` beats longer, with its first and last beat left at full speed so the transitions
// keep their pace. src(U) turns a beat of the finished film into the beat the scenes were written
// to; out(u) goes the other way (for the sound hits). total = how many beats were added.
export function stretch(cuts, extra = 4) {
  const seg = [];   // [srcStart, srcEnd, outStart, outEnd]
  let o = 0;
  for (let i = 0; i + 1 < cuts.length; i++) {
    const a = cuts[i], b = cuts[i + 1], e = Math.min(1, (b - a) / 4);
    seg.push([a, a + e, a + o, a + e + o]);
    seg.push([a + e, b - e, a + e + o, b - e + o + extra]); o += extra;
    seg.push([b - e, b, b - e + o, b + o]);
  }
  const map = (x, i0, i1) => {
    if (x <= seg[0][i0]) return x;
    for (const s of seg) if (x <= s[i0 + 1]) return s[i1] + (x - s[i0]) * (s[i1 + 1] - s[i1]) / (s[i0 + 1] - s[i0]);
    const l = seg[seg.length - 1]; return l[i1 + 1] + (x - l[i0 + 1]);
  };
  return { src: (U) => map(U, 2, 0), out: (u) => map(u, 0, 2), total: o };
}
// ---------------------------------------------------------------- good to know about autism
// A short, polite awareness section for visitors who are not autistic. 20 beats, starting at u0.
// It sits before the last scene of every film (see drawWithFacts).
const FACTS = [
  ['1 in 100', 'More than 1 in 100 people in the UK are autistic'],
  ['For life', 'Autism is lifelong. It is a different way of experiencing the world, not an illness'],
  ['All different', 'Every autistic person is different. If you are not sure, just ask'],
  ['Not always seen', 'You often cannot tell by looking. Many autistic people are adults'],
];
export const FACTS_LEN = 20;
export function factsScene(ctx, u, u0) {
  const r = u - u0;
  M.fill(ctx, C.paper);
  const tk = pop(r, 0, SPRING.gentle);
  M.text(ctx, 'FOR EVERYONE AT THE SHOW', 112 - (1 - tk) * 80, 96, F(34, 800), C.teal, 'left', 3);
  M.text(ctx, 'Good to know about autism', 110 - (1 - tk) * 120, 196, F(96, 800), C.ink);
  FACTS.forEach(([big, str], i) => {
    const a = 2 + i * 3.6, k = pop(r, a, SPRING.gentle);
    if (k <= 0) return;
    const col = i % 2, row = Math.floor(i / 2), w = 640, h = 290, x = 110 + col * 670, y = 260 + row * 320 + (1 - k) * 90;
    ctx.save(); ctx.globalAlpha *= Math.min(1, k * 1.4);
    rr(ctx, x + 8, y + 10, w, h, 0, 'rgba(34,52,74,0.14)');
    rr(ctx, x, y, w, h, 0, C.white);
    rr(ctx, x, y, w, 78, 0, i % 2 ? C.ink : C.teal);
    M.text(ctx, big, x + 30, y + 56, F(52, 800), C.white);
    const f = F(44, 600), lines = wrap(ctx, str, f, w - 60);
    lines.forEach((l, j) => M.text(ctx, l, x + 30, y + 136 + j * 54, f, C.ink));
    ctx.restore();
  });
  const ck = pop(r, 1, SPRING.gentle);
  const wv = Math.sin(r * TAU * 0.5) * 0.2;
  beth(ctx, 1790, 1000 + (1 - ck) * 500, 1.35, { mood: 'happy', headphones: '#3A3F4B', blinkU: r, blinkOff: 2, armL: POSE.relaxed, armR: POSE.relaxed });
  kid(ctx, 1540, 1010 + (1 - ck) * 500, 1.6, { mood: 'happy', defenders: DEF, blinkU: r, armL: POSE.relaxed, armR: r > 16.4 ? [2.5 + wv, -0.25] : POSE.relaxed });
  const bk = pop(r, 16.4, SPRING.gentle);
  if (bk > 0) M.text(ctx, 'Thank you for making room for everyone.', 112 - (1 - bk) * 80, 990, F(60, 700), C.teal);
}
export const factsHits = (u0) => [[u0, 'good to know', 'tok', { pitch: 'F4', gain: 0.22 }], ...FACTS.map((f, i) => [u0 + 2 + i * 3.6, `fact ${i + 1}`, 'tok', { pitch: ['A4', 'C5', 'D5', 'F5'][i], gain: 0.15 }]), [u0 + 16.4, 'thank you', 'bell', { pitch: 'C6', gain: 0.1 }]];
// Fits the section into a finished film at beat `at`: everything the film drew from `at` onwards
// now happens FACTS_LEN beats later. base(ctx, u, IMG) is the film as it was written.
export function drawWithFacts(ctx, u, IMG, base, at) {
  const P = 0.9, end = at + FACTS_LEN;
  const push = (fa, fb, p) => {
    ctx.save(); ctx.translate(-p * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); fa(); ctx.restore();
    ctx.save(); ctx.translate((1 - p) * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); fb(); ctx.restore();
  };
  if (u < at - P) base(ctx, u, IMG);
  else if (u < at) push(() => base(ctx, at - P - 0.001, IMG), () => factsScene(ctx, u, at), E.inOutCubic(prog(u, at - P, at)));
  else if (u < end - P) factsScene(ctx, u, at);
  else if (u < end) push(() => factsScene(ctx, u, at), () => base(ctx, at, IMG), E.inOutCubic(prog(u, end - P, end)));
  else base(ctx, u - FACTS_LEN, IMG);
}
export const hitsWithFacts = (hits, at) => hits.map((h) => (h[0] >= at ? [h[0] + FACTS_LEN, ...h.slice(1)] : h)).concat(factsHits(at)).sort((a, b) => a[0] - b[0]);
export { M };
