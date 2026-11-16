// UK Airshow Guide brand helpers shared by the films. Pure functions of their arguments.
import * as M from './motion.js';
const { W, H, E, prog, lerp, clamp, font, layout, glyph, text, rrect, cover, springU, SPRING } = M;

export const C = {
  navy: '#13293C', deep: '#0E2131', teal: '#32B4AF', mint: '#5FE3D6', amber: '#F5B942',
  red: '#D74949', light: '#F4F7F9', soft: '#C9D6E0', body: '#4A5A66', white: '#FFFFFF',
};
export const D = 'Display', UI = 'UI';
export const fD = (s) => font(s, 800, D);
export const fU = (s, w = 500) => font(s, w, UI);

// log-space zoom between a and b over p (constant-rate dolly)
export const lz = (a, b, p) => a * (b / a) ** clamp(p);

// full-frame photo with a log zoom and optional navy shade from the left
export function photo(ctx, img, { zoom = 1, fx = 0.5, fy = 0.5, x = 0, y = 0, w = W, h = H, shade = 0, tint = 0, blur = 0 } = {}) {
  if (!img) return;
  if (blur) ctx.filter = `blur(${blur}px)`;
  cover(ctx, img, x, y, w, h, { zoom, fx, fy });
  ctx.filter = 'none';
  if (tint) { ctx.fillStyle = `rgba(14,33,49,${tint})`; ctx.fillRect(x, y, w, h); }
  if (shade) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, `rgba(14,33,49,${0.96 * shade})`);
    g.addColorStop(0.45, `rgba(14,33,49,${0.78 * shade})`);
    g.addColorStop(0.85, `rgba(14,33,49,${0.08 * shade})`);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
}

// a word or line whose glyphs spring up from a baseline mask, one after another
export function riseText(ctx, str, x, y, size, color, u, u0, { stagger = 0.035, track = 0, f = null, exit = null, align = 'left' } = {}) {
  const ff = f || fD(size);
  const L = layout(ctx, str, ff, track);
  const ox = align === 'center' ? x - L.width / 2 : align === 'right' ? x - L.width : x;
  ctx.save();
  ctx.beginPath(); ctx.rect(ox - 40, y - size * 1.3, L.width + 80, size * 1.3 + size * 0.28); ctx.clip();
  L.glyphs.forEach((g, j) => {
    let k = springU(u, u0 + j * stagger, SPRING.snappy);
    if (k <= 0) return;
    let dy = (1 - k) * size * 1.15;
    if (exit) dy -= E.inCubic(prog(u, exit + j * stagger * 0.5, exit + 0.6 + j * stagger * 0.5)) * size * 1.3;
    glyph(ctx, g.ch, ox + g.cx, y + dy, ff, color);
  });
  ctx.restore();
  return L.width;
}

// UI line that slides up 30px and unmasks
export function slideLine(ctx, str, x, y, f, color, u, u0, { align = 'left', dur = 0.8 } = {}) {
  const p = E.outQuint(prog(u, u0, u0 + dur));
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= Math.min(1, p * 1.6);
  text(ctx, str, x, y + (1 - p) * 34, f, color, align);
  ctx.restore();
}

export function pill(ctx, str, x, y, size, bg, fg, k = 1, { pad = 0.55, weight = 700, track = 0.06, stroke = null, h = null } = {}) {
  if (k <= 0) return 0;
  ctx.font = fU(size, weight); ctx.letterSpacing = `${size * track}px`;
  const tw = ctx.measureText(str).width; ctx.letterSpacing = '0px';
  const bw = tw + size * pad * 2, bh = h || size * 1.75;
  ctx.save();
  ctx.translate(x, y + bh / 2); ctx.scale(k, k); ctx.translate(0, -bh / 2);
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, bw, bh); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, bw - 3, bh - 3); }
  text(ctx, str, size * pad, bh / 2 + size * 0.36, fU(size, weight), fg, 'left', size * track);
  ctx.restore();
  return bw;
}

// the logo on a white badge (the logo is navy/blue and needs a light ground)
export function logoBadge(ctx, img, cx, cy, h, k = 1) {
  if (!img || k <= 0) return;
  const lw = h * img.width / img.height, pad = h * 0.16;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
  rrect(ctx, -lw / 2 - pad * 1.4, -h / 2 - pad, lw + pad * 2.8, h + pad * 2, h * 0.14); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.drawImage(img, -lw / 2, -h / 2, lw, h);
  ctx.restore();
}

// an amber box that draws itself round a rect (p 0..1), optional dim outside
export function drawBox(ctx, x, y, w, h, p, { color = C.amber, lw = 7, r = 10 } = {}) {
  if (p <= 0) return;
  const per = 2 * (w + h);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  rrect(ctx, x, y, w, h, r);
  ctx.setLineDash([per * clamp(p), per]); ctx.lineDashOffset = 0; ctx.stroke();
  ctx.restore();
}

// mouse pointer; press 0..1 squashes it and throws a ring
export function pointer(ctx, x, y, press = 0, ringP = 0) {
  if (ringP > 0 && ringP < 1) {
    ctx.save(); ctx.strokeStyle = C.amber; ctx.globalAlpha = 1 - ringP; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x, y, 18 + 60 * E.outCubic(ringP), 0, M.TAU); ctx.stroke(); ctx.restore();
  }
  const s = 1.7 * (1 - 0.15 * press);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.lineTo(7, 20); ctx.lineTo(12, 31); ctx.lineTo(16, 29); ctx.lineTo(11, 18.5); ctx.lineTo(20, 18.5); ctx.closePath();
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = C.deep; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

export function aiNote(ctx, x, y, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = fU(22, 500); const w = ctx.measureText('AI generated image').width + 28;
  ctx.fillStyle = 'rgba(14,33,49,.72)'; ctx.fillRect(x - w, y - 38, w, 38);
  text(ctx, 'AI generated image', x - 14, y - 12, fU(22, 500), '#fff', 'right');
  ctx.restore();
}
