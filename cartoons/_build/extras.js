// ---------------------------------------------------------------- extra props (house style: navy outlines, square corners)
const LIVERY = {
  southern: { body: C.white, stripe: '#7AB929', door: '#7AB929', nose: '#7AB929' },
  ga: { body: C.white, stripe: '#D2232A', door: '#D2232A', nose: '#D2232A' },
  tube: { body: C.white, stripe: C.blue, door: C.red, nose: C.red, tube: true },
};
// side-view train; front at x, wheels on y; cars to the left (or right when flip)
function trainH(ctx, x, y, s, cars, lk, spin = 0, flip = false) {
  withT(ctx, x, y, s, 0, () => {
    if (flip) ctx.scale(-1, 1);
    for (let c = cars - 1; c >= 0; c--) {
      const x1 = -c * 436, x0 = x1 - 420, lead = c === 0;
      const body = () => {
        ctx.beginPath();
        if (lk.tube) { rrect(ctx, x0, -196, 420, 168, 46); return; }
        ctx.moveTo(x0, -28); ctx.lineTo(x0, -206);
        if (lead) { ctx.lineTo(x1 - 80, -206); ctx.lineTo(x1 + 14, -116); ctx.lineTo(x1 + 14, -28); }
        else { ctx.lineTo(x1, -206); ctx.lineTo(x1, -28); }
        ctx.closePath();
      };
      body(); ctx.fillStyle = lk.body; ctx.fill();
      ctx.save(); body(); ctx.clip();
      ctx.fillStyle = lk.stripe; ctx.fillRect(x0 - 10, -84, 460, 24);
      if (lead && lk.nose) { ctx.fillStyle = lk.nose; ctx.fillRect(x1 - 40, -120, 80, 92); }
      ctx.fillStyle = C.navy; ctx.fillRect(x0 - 10, -206, 460, 12);
      ctx.restore();
      body(); ink(ctx); ctx.stroke();
      for (let i = 0; i < (lead && !lk.tube ? 3 : 4); i++) box(ctx, x0 + 70 + i * 82, -176, 56, 50, 0, '#BFE6F2', 4);
      if (lead && !lk.tube) { ctx.beginPath(); ctx.moveTo(x1 - 76, -186); ctx.lineTo(x1 - 6, -126); ctx.lineTo(x1 - 76, -126); ctx.closePath(); fs(ctx, '#BFE6F2', 4); }
      [x0 + 18, x1 - 56 - (lead && !lk.tube ? 60 : 0)].forEach((dx) => { box(ctx, dx, -184, 40, 148, 0, lk.door, 4); ctx.fillStyle = '#BFE6F2'; ctx.fillRect(dx + 8, -170, 24, 44); });
      [x0 + 70, x0 + 130, x1 - 130, x1 - 70].forEach((wx) => { circ(ctx, wx, -18, 22, '#2B3237', 4); withT(ctx, wx, -18, 1, spin, () => { limb(ctx, [[-12, 0], [12, 0]], 2, C.grey); }); });
    }
  });
}
function rails(ctx, y, x0 = -100, x1 = 2100, off = 0) {
  for (let x = x0 - ((off % 60) + 60) % 60; x < x1; x += 60) { ctx.fillStyle = '#8C6E54'; ctx.fillRect(x, y + 2, 34, 12); }
  ctx.fillStyle = '#5B6B78'; ctx.fillRect(x0, y - 4, x1 - x0, 8);
}
// station platform: grey floor with a yellow line; sky above stays
function platform(ctx, edgeY = GY - 10) {
  ctx.fillStyle = '#C9D3DA'; ctx.fillRect(-1000, edgeY, 4000, G.h);
  ctx.fillStyle = C.gold; ctx.fillRect(-1000, edgeY + 8, 4000, 10);
  ink(ctx); ctx.beginPath(); ctx.moveTo(-1000, edgeY); ctx.lineTo(3000, edgeY); ctx.stroke();
}
// indoor tiles (stations, concourses)
function tiles(ctx, col = '#EEF2F5') {
  sfill(ctx, col);
  ctx.strokeStyle = '#DCE3E9'; ctx.lineWidth = 3;
  for (let y = 0; y < G.h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(G.w, y); ctx.stroke(); }
  ctx.fillStyle = '#C9D3DA'; ctx.fillRect(0, G.gy, G.w, G.h); ink(ctx); ctx.beginPath(); ctx.moveTo(0, G.gy); ctx.lineTo(G.w, G.gy); ctx.stroke();
}
// a straight-edged sign: bg box with an optional coloured bar on the left
function sign(ctx, str, x, y, size, bg, fg, bar = null, k = 1, sub = null) {
  if (k <= 0) return;
  const f = font(size, 800, DISPLAY); ctx.font = f;
  let w = ctx.measureText(str).width + size * 1.1 + (bar ? 40 : 0);
  const fs2 = font(size * 0.45, 700, UI);
  if (sub) { ctx.font = fs2; w = Math.max(w, ctx.measureText(sub).width + size * 1.1 + (bar ? 40 : 0)); }
  const h = size * (sub ? 1.9 : 1.4);
  withT(ctx, x, y, k, (1 - k) * 0.2, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-w / 2 + 10, -h / 2 + 10, w, h);
    box(ctx, -w / 2, -h / 2, w, h, 0, bg, 5);
    if (bar) { ctx.fillStyle = bar; ctx.fillRect(-w / 2 + 3, -h / 2 + 3, 34, h - 6); }
    const tx = -w / 2 + size * 0.55 + (bar ? 40 : 0);
    text(ctx, str, tx, sub ? -h / 2 + size * 1.05 : size * 0.36, f, fg);
    if (sub) text(ctx, sub, tx, h / 2 - size * 0.3, fs2, fg === C.white ? C.white : C.tealD);
  });
}
function arrowR(ctx, x, y, s, col = C.white) {
  withT(ctx, x, y, s, 0, () => { ctx.beginPath(); ctx.moveTo(-30, -10); ctx.lineTo(4, -10); ctx.lineTo(4, -26); ctx.lineTo(32, 0); ctx.lineTo(4, 26); ctx.lineTo(4, 10); ctx.lineTo(-30, 10); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); });
}
function wallClock(ctx, x, y, r, mins) {
  circ(ctx, x, y, r, C.white);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; limb(ctx, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86]], 1, C.navy); }
  const a = mins / 60 * TAU - Math.PI / 2, b = mins / 720 * TAU - Math.PI / 2;
  limb(ctx, [[x, y], [x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7]], 4, C.navy);
  limb(ctx, [[x, y], [x + Math.cos(b) * r * 0.45, y + Math.sin(b) * r * 0.45]], 6, C.navy);
  circ(ctx, x, y, 8, C.red, 0);
}
function bubbleSq(ctx, x, y, w, h, bg, str, k, tailLeft = true, fg = C.white) {
  if (k <= 0) return;
  withT(ctx, x + w / 2, y + h / 2, k, (1 - k) * (tailLeft ? -0.2 : 0.2), () => {
    ctx.beginPath(); const tx = tailLeft ? -w / 2 + 40 : w / 2 - 40;
    ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(tx + (tailLeft ? 50 : 0), h / 2); ctx.lineTo(tx, h / 2 + 40); ctx.lineTo(tx - (tailLeft ? 0 : 50), h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath();
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.save(); ctx.translate(10, 10); ctx.fill(); ctx.restore();
    fs(ctx, bg);
    text(ctx, str, 0, 18, font(50, 800, DISPLAY), fg, 'center');
  });
}
function envelope(ctx, x, y, s, rot = 0) {
  withT(ctx, x, y, s, rot, () => { box(ctx, -70, -46, 140, 92, 0, C.white); limb(ctx, [[-66, -42], [0, 10], [66, -42]], 1, C.navy); });
}
function phoneH(ctx, x, y, s, scr = '#BFE6F2') {
  withT(ctx, x, y, s, 0, () => { box(ctx, -40, -72, 80, 144, 10, '#2B3237'); ctx.fillStyle = scr; ctx.fillRect(-30, -58, 60, 112); });
}
// a photo print with a real aircraft cut-out in it
function print(ctx, x, y, w, h, rot, body, caption) {
  withT(ctx, x, y, 1, rot, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-w / 2 + 12, -h / 2 + 14, w, h);
    box(ctx, -w / 2, -h / 2, w, h, 0, C.white);
    const iw = w - 40, ih = h - (caption ? 110 : 40);
    ctx.save(); ctx.beginPath(); ctx.rect(-iw / 2, -h / 2 + 20, iw, ih); ctx.clip();
    ctx.fillStyle = '#9FD3EE'; ctx.fillRect(-iw / 2, -h / 2 + 20, iw, ih);
    cloud(ctx, -iw * 0.25, -h / 2 + 20 + ih * 0.3, iw / 900); cloud(ctx, iw * 0.3, -h / 2 + 20 + ih * 0.7, iw / 1200);
    jet(ctx, 0, -h / 2 + 20 + ih * 0.5, iw / 420, -0.08, body);
    ctx.restore();
    ink(ctx, 4); ctx.strokeRect(-iw / 2, -h / 2 + 20, iw, ih);
    if (caption) text(ctx, caption, -iw / 2, h / 2 - 34, font(Math.round(w / 17), 700, UI), C.navy);
  });
}
// Red Arrows trio across a span, with smoke; q = 0..1 progress
function redArrows(ctx, q, x0, x1, y, s = 0.7, dir = 1) {
  if (q <= 0 || q >= 1) return;
  const P = (qq, k) => [lerp(x0, x1, qq) - dir * k * 70 * s / 0.7, y + k * 40 * s / 0.7 - Math.sin(qq * Math.PI) * 40];
  const SM = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  [1, 0, 2].forEach((k) => { const pts = []; for (let n = 1; n < 70; n++) { const qq = q - n * 0.005; if (qq < 0) break; const p = P(qq, k); pts.push([p[0] - dir * 120 * s / 0.7, p[1] + 12]); } if (k === 0) smoke(ctx, pts, '#B9C7D3', 12, 0.25, 0.6); smoke(ctx, pts, SM[k], 9, 0.25); });
  [1, 0, 2].forEach((k) => { const p = P(q, k); jet(ctx, p[0], p[1], s, 0, C.red, dir < 0); });
}
