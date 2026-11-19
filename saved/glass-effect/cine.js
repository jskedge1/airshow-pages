// Cinematic cut of the glass effect: a trailer style advert built on the same engine (kinetic.js + film4.js).
// Load after film4.js and the content file (window.CINE). It replaces BUILD with a timeline of
// full screen shots (real show photos, slow big push ins, filmic grade, letterbox bars), huge trailer titles with
// impact flashes, then the glass effect words landing over the footage, and the same end card as every film.
// Times are in beats (104 bpm, B seconds) so the score lines up. Cues for score-cine.py: CUES.impacts, CUES.hits.
CUES.impacts = []; CUES.hits = [];
const SHOTS = [], TITLES = [], FLASH = [];
// snapBpm in the content file: every cut, title and slide time snaps to that tempo's beat grid, so the cuts land on the
// beats of a real music track (The Battlefield, 140 bpm) while the content keeps its beat numbers at 104 bpm
const SN = x => { const g = window.CINE && window.CINE.snapBpm; return g ? Math.round(x / (60 / g) + 1e-6) * (60 / g) : x; };
let GLASS_SEQ = 0;
const BAR = LAND ? 132 : 230;          // letterbox bar height
const GRADE = 'contrast(1.14) saturate(.82) brightness(.92) sepia(.12)';
const shotLayer = div(stage, `left:0;top:0;width:${SW}px;height:${SH}px;overflow:hidden`);
stage.insertBefore(shotLayer, bgLayer);
// a full screen graded photo with a slow push. s = [scale from, to], x/y = pan in % of the frame
function shot(b0, b1, sh) {
  const t0 = SN(b0 * B), t1 = SN(b1 * B);
  if (sh.black) { const w = div(shotLayer, `left:0;top:0;width:${SW}px;height:${SH}px;background:#05090D;visibility:hidden`); SHOTS.push({ w, img: null, t0, t1, s: [1, 1], x: [0, 0], y: [0, 0] }); return; }
  // src / srcP give any image path (a show photo or a real site screen), otherwise photos/f-<img>.jpg and fp-<img>.jpg.
  // clip / clipP give a video clip as a folder of 60 fps frames (cine/<name>L/0001.jpg landscape, cine/<name>/ portrait,
  // built by make-clip-frames.py); n = frames in the folder. The frame for the current time is shown, with the same grade and push.
  const clip = sh.clip ? (LAND ? sh.clip : (sh.clipP || sh.clip)) : null;
  const src = clip ? `${clip}/0001.jpg` : LAND ? (sh.src || `photos/f-${sh.img}.jpg`) : (sh.srcP || sh.src || `photos/fp-${sh.imgP || sh.img}.jpg`);
  const w = div(shotLayer, `left:0;top:0;width:${SW}px;height:${SH}px;overflow:hidden;visibility:hidden`,
    `<img src="${src}" style="position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;object-fit:cover;object-position:${sh.pos || '50% 50%'};filter:${sh.screen ? 'blur(3px) saturate(.9)' : GRADE};transform-origin:${sh.o || '50% 50%'};will-change:transform">
     <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,40,60,.35),rgba(0,0,0,0) 45%,rgba(60,30,0,.18));mix-blend-mode:soft-light"></div>
     <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 100%)"></div>
     <div class="dim" style="position:absolute;inset:0;background:${sh.dim ? `rgba(8,20,32,${sh.dim})` : 'transparent'}"></div>`);
  let cap = null;
  if (sh.cap) {
    const c = LAND ? sh.cap : (sh.capP || sh.cap);
    cap = div(stage, `left:${LAND ? 120 : 70}px;top:${SH - BAR - (LAND ? 64 : 84)}px;z-index:46;visibility:hidden;display:flex;align-items:center;gap:14px`,
      `<i style="width:6px;height:${LAND ? 30 : 36}px;background:#5FE3D6;display:block"></i><span style="font-family:Assistant;font-weight:600;font-size:${LAND ? 28 : 34}px;color:#E6EEF4;text-shadow:0 2px 8px rgba(0,0,0,.6);white-space:nowrap">${c}</span>`);
  }
  SHOTS.push({ w, img: w.querySelector('img'), t0, t1, s: sh.s || [1.02, 1.16], x: sh.x || [0, 0], y: sh.y || [0, 0], cap, fade: sh.fade || 0,
    clip, n: sh.n || 1, from: sh.from || 0, frame: 1 });
  if (!sh.soft) { CUES.impacts.push(t0); if (window.CINE.flash !== false) FLASH.push(t0); }
}
// a huge trailer title: tracks in from wide letter spacing and settles while the shot pushes
function title(b0, b1, text, o = {}) {
  if (window.CINE.titleStyle === 'glass' && !o.small) return glassTitle(SN(b0 * B), SN(b1 * B), text, o);
  const t0 = SN(b0 * B), t1 = SN(b1 * B), sp = o.small ? [.9, .5] : [.22, .06], maxW = SW - (LAND ? 240 : 120);
  // fit the title to the frame at its widest letter spacing, so it never runs off the edge
  let size = o.size || (LAND ? 210 : 180);
  if (!o.small) { const n = text.length, w = textW(text.toUpperCase(), size, 800) + n * sp[0] * size * 1.12; if (w > maxW) size = Math.floor(size * maxW / w); }
  const el = div(stage, `left:0;top:0;width:${SW}px;height:${SH}px;z-index:44;display:flex;flex-direction:column;align-items:center;justify-content:center;visibility:hidden;pointer-events:none`,
    `<div class="tt" style="font-family:Barlow;font-weight:${o.small ? (window.CINE.titleStyle === 'glass' ? 700 : 600) : 800};font-size:${o.small ? (LAND ? 58 : 52) : size}px;line-height:1;color:#fff;text-transform:uppercase;white-space:nowrap;text-shadow:0 0 40px rgba(0,0,0,.45),0 6px 24px rgba(0,0,0,.5)">${text}</div>`);
  TITLES.push({ el, tt: el.firstChild, t0, t1, small: !!o.small, sp });
  if (!o.small) CUES.hits.push(t0);
}
// The Cosford trailer title (titleStyle: 'glass', from the RAF Cosford Hollywood trailer v5, 18 Nov 2026):
// Barlow 700 capitals cut out of black, so the footage shows through the letters, frosted (blur, colour lift) with a
// faint top lit body, a thin bright edge and one slow light sweep. The footage dims over about 0.75 s (o.black sets how
// dark, 1 = full black card), the letters fade in over about 1 s, the whole lockup pushes in 4.5 %. No glow.
// 'Line one|line two' gives the two line lockup: a big first line (212 px, 22 px tracking at 1920 wide) over a smaller,
// wide tracked second line (124 px, 64 px tracking), scaled down together to fit the frame.
function glassTitle(t0, t1, text, o) {
  const id = 'gt' + (GLASS_SEQ++), L = text.toUpperCase().split('|');
  const maxW = SW - (LAND ? 260 : 110);
  const ls = (sz, two) => sz * (two ? (LAND ? 64 : 34) / 124 : 22 / 212);   // portrait: tighter second line so the lockup stays big
  const wOf = (str, sz, two) => textW(str, sz, 700) + (str.length - 1) * ls(sz, two);
  // big lines (first line, split at its middle space in portrait when it would have to shrink) and the small second line
  const lay = big => {
    let s1 = o.size || (LAND ? 212 : 230), s2 = s1 * 124 / 212;
    const wmax = Math.max(...big.map(b => wOf(b, s1, false)), L[1] ? wOf(L[1], s2, true) : 0);
    if (wmax > maxW) { s1 *= maxW / wmax; s2 *= maxW / wmax; }
    return { big, s1, s2 };
  };
  let P = lay([L[0]]);
  if (!LAND && L[0].includes(' ')) {
    const w = L[0].split(' '), half = Math.ceil(w.length / 2), Q = lay([w.slice(0, half).join(' '), w.slice(half).join(' ')]);
    if (Q.s1 > P.s1 * 1.15) P = Q;
  }
  const { big, s1, s2 } = P, gap = s1 * 40 / 212, lh = s1 * .72;
  const h = big.length * lh + (big.length - 1) * gap * .8 + (L[1] ? gap + s2 * .72 : 0);
  const cy = SH / 2 + (o.dy || 0), rows = [];
  let y = L.length === 1 && big.length === 1 ? cy + s1 * .36 : cy - h / 2 + lh;
  big.forEach((b, k) => { rows.push([b, y, s1, ls(s1, false)]); y += lh + gap * .8; });
  if (L[1]) rows.push([L[1], y - lh - gap * .8 + gap + s2 * .72, s2, ls(s2, true)]);
  const tx = (fill, extra = '') => rows.map(r => `<text x="${SW / 2 + r[3] / 2}" y="${r[1].toFixed(1)}" text-anchor="middle" font-family="Barlow" font-weight="700" font-size="${r[2].toFixed(1)}" letter-spacing="${r[3].toFixed(1)}" fill="${fill}" ${extra}>${r[0]}</text>`).join('');
  const sw = Math.max(1.4, rows[0][2] / 70);
  const el = div(stage, `left:0;top:0;width:${SW}px;height:${SH}px;z-index:44;visibility:hidden;pointer-events:none;transform-origin:50% 50%`,
    `<svg width="${SW}" height="${SH}" style="position:absolute;left:0;top:0;overflow:visible">
       <defs>
         <clipPath id="${id}c">${tx('#fff')}</clipPath>
         <mask id="${id}m" maskUnits="userSpaceOnUse" x="${-SW}" y="${-SH}" width="${3 * SW}" height="${3 * SH}"><rect x="${-SW}" y="${-SH}" width="${3 * SW}" height="${3 * SH}" fill="#fff"/>${tx('#000')}</mask>
         <linearGradient id="${id}b" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset=".5" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
         <linearGradient id="${id}s" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="360" y2="${SH * .35}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
       </defs>
       <rect class="blk" x="${-SW}" y="${-SH}" width="${3 * SW}" height="${3 * SH}" fill="#000" mask="url(#${id}m)" opacity="0"/>
     </svg>
     <div class="frost" style="position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;backdrop-filter:blur(${LAND ? 5 : 4}px) saturate(1.45) brightness(1.14) contrast(1.06);-webkit-backdrop-filter:blur(5px) saturate(1.45) brightness(1.14);clip-path:url(#${id}c);opacity:0"></div>
     <svg class="ltr" width="${SW}" height="${SH}" style="position:absolute;left:0;top:0;opacity:0">
       ${tx(`url(#${id}b)`)}
       <g class="sw" opacity="0">${tx(`url(#${id}s)`)}</g>
       ${tx('none', `stroke="#fff" stroke-opacity=".9" stroke-width="${sw.toFixed(2)}"`)}
     </svg>`);
  TITLES.push({ el, glass: true, t0, t1, blackMax: o.black == null ? .55 : o.black, blk: el.querySelector('.blk'), frost: el.querySelector('.frost'),
    ltr: el.querySelector('.ltr'), sw: el.querySelector('.sw'), grad: el.querySelector(`#${id}s`) });
  CUES.hits.push(t0);
}
const ease = v => v * v * (3 - 2 * v);
function updGlassTitle(T, t) {
  const seg = (a, b) => clamp((t - a) / (b - a));
  const out = 1 - ease(seg(T.t1 - .45, T.t1 - .05));
  const bk = ease(seg(T.t0 + .08, T.t0 + .83)) * T.blackMax * out;
  const al = ease(seg(T.t0 + .33, T.t0 + 1.3)) * out;
  T.el.style.transform = `scale(${(1 + .045 * ease(seg(T.t0, T.t1))).toFixed(4)})`;
  T.blk.setAttribute('opacity', bk.toFixed(3));
  T.frost.style.opacity = al.toFixed(3);
  T.ltr.style.opacity = al.toFixed(3);
  const sp = seg(T.t0 + 1.4, T.t0 + 1.4 + Math.min(1.8, (T.t1 - T.t0) * .5));
  T.sw.setAttribute('opacity', sp > 0 && sp < 1 ? '0.6' : '0');
  const cx = -300 + sp * (SW + 600);
  T.grad.setAttribute('x1', cx - 180); T.grad.setAttribute('x2', cx + 180);
}
function updCine(t) {
  for (const s of SHOTS) {
    const on = t >= s.t0 && t < s.t1 + .02;
    s.w.style.visibility = on ? 'visible' : 'hidden';
    if (s.cap) s.cap.style.visibility = on && t > s.t0 + .25 && t < s.t1 - .1 ? 'visible' : 'hidden';
    if (!on || !s.img) continue;
    const f = clamp((t - s.t0) / (s.t1 - s.t0)), e = f * (2 - f) * .35 + f * .65;
    const sc = s.s[0] + (s.s[1] - s.s[0]) * e, x = s.x[0] + (s.x[1] - s.x[0]) * e, y = s.y[0] + (s.y[1] - s.y[0]) * e;
    // a small kick on the cut, then the slow push
    const kick = 1 + .05 * Math.exp(-(t - s.t0) * 9);
    s.img.style.transform = `translate(${x}%,${y}%) scale(${(sc * kick).toFixed(4)})`;
    if (s.clip) {
      const k = Math.max(1, Math.min(s.n, s.from + 1 + Math.floor((t - s.t0) * 60 + 1e-6)));
      if (k !== s.frame) { s.frame = k; s.img.src = `${s.clip}/${String(k).padStart(4, '0')}.jpg`; }
    }
    s.w.style.opacity = s.fade ? Math.min(1, (t - s.t0) / s.fade, (s.t1 - t) / s.fade).toFixed(3) : 1;
    if (s.cap) s.cap.style.opacity = Math.min(1, (t - s.t0 - .25) / .3, (s.t1 - .1 - t) / .2).toFixed(3);
  }
  for (const T of TITLES) {
    const on = t >= T.t0 && t < T.t1;
    T.el.style.visibility = on ? 'visible' : 'hidden';
    if (!on) continue;
    if (T.glass) { updGlassTitle(T, t); continue; }
    const f = clamp((t - T.t0) / (T.t1 - T.t0)), a = Math.min(1, (t - T.t0) / (T.small ? .6 : .18), (T.t1 - t) / .3);
    const sp = T.sp[0] + (T.sp[1] - T.sp[0]) * eo3(f);
    T.tt.style.letterSpacing = sp.toFixed(3) + 'em';
    T.tt.style.transform = `scale(${(T.small ? 1 : 1.12 - .12 * eo3(f)).toFixed(4)})`;
    T.tt.style.opacity = a.toFixed(3);
    T.tt.style.filter = T.small ? 'none' : `blur(${(Math.max(0, 1 - (t - T.t0) / .2) * 8).toFixed(1)}px)`;
  }
  let fl = 0; for (const x of FLASH) if (t >= x && t < x + .3) fl = Math.max(fl, .55 * (1 - (t - x) / .3));
  flash.style.opacity = fl.toFixed(3);
  if (t >= T_BARS) {
    const p = eo3(clamp((t - T_BARS) / .8));
    bars[0].style.transform = `translateY(${(-BAR * (1 - p)).toFixed(1)}px)`;
    bars[1].style.transform = `translateY(${(BAR * (1 - p)).toFixed(1)}px)`;
  }
  const endOn = t >= T_END;
  bars.forEach(b => b.style.visibility = endOn ? 'hidden' : 'visible');
  gx2.putImageData(GR[Math.floor(t * 24) % 4], 0, 0);
  g2.style.opacity = endOn ? 0 : (window.CINE.grain ?? .045);   // grain: 0 in the content file for clean video footage
}
const flash = div(stage, `left:0;top:0;width:${SW}px;height:${SH}px;background:#fff;z-index:45;opacity:0;pointer-events:none`);
const bars = [div(stage, `left:0;top:0;width:${SW}px;height:${BAR}px;background:#000;z-index:47`), div(stage, `left:0;top:${SH - BAR}px;width:${SW}px;height:${BAR}px;background:#000;z-index:47`)];
const g2 = document.createElement('canvas'); g2.width = SW / 2; g2.height = SH / 2;
g2.style.cssText = `position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;z-index:48;pointer-events:none;mix-blend-mode:overlay`;
stage.appendChild(g2); const gx2 = g2.getContext('2d');
let T_BARS = 0, T_END = 1e9;

window.BUILD = function () {
  const C = window.CINE;
  T_BARS = SN((C.barsAt || 0) * B);
  C.shots.forEach(([b0, b1, sh]) => shot(b0, b1, sh));
  C.titles.forEach(([b0, b1, text, o]) => title(b0, b1, text, o));
  // the glass effect words over the footage
  C.glass.forEach(([b0, b1, lines, o = {}]) => {
    phrase(SN(b0 * B), SN(b1 * B) - .5, lines, Object.assign({ exit: 'up', cy: SH / 2 + (LAND ? 0 : -20), maxW: LAND ? 1500 : 880 }, o));
    if (o.hit !== false) CUES.hits.push(SN(b0 * B));
  });
  T_END = SN(C.endAt * B);
  // the score script reads the shots (clip sources for the engine sound) and the tempo
  CUES.cine = { snapBpm: C.snapBpm || 0, shots: SHOTS.map(s => ({ t0: s.t0, t1: s.t1, clip: s.clip || null, black: !s.img })), end: T_END };
  CUES.scenes.push(T_END);
  endCard(T_END, C);
  window.UPD = t => { updScreens(t); updCine(t); };
};
// the renderer waits for this after each setT, so a clip frame has finished loading before the screenshot
window.SETTLE = () => Promise.all(SHOTS.filter(s => s.clip && s.w.style.visibility === 'visible').map(s => s.img.decode().catch(() => 0)));
const _pre = window.PRELOAD;
window.PRELOAD = async function () {
  await Promise.all([...shotLayer.querySelectorAll('img')].map(i => i.decode().catch(() => 0)));
  if (_pre) await _pre();
};
