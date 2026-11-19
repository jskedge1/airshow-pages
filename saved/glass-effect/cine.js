// Cinematic cut of the glass effect: a trailer style advert built on the same engine (kinetic.js + film4.js).
// Load after film4.js and the content file (window.CINE). It replaces BUILD with a timeline of
// full screen shots (real show photos, slow big push ins, filmic grade, letterbox bars), huge trailer titles with
// impact flashes, then the glass effect words landing over the footage, and the same end card as every film.
// Times are in beats (104 bpm, B seconds) so the score lines up. Cues for score-cine.py: CUES.impacts, CUES.hits.
CUES.impacts = []; CUES.hits = [];
const SHOTS = [], TITLES = [], FLASH = [];
const BAR = LAND ? 132 : 230;          // letterbox bar height
const GRADE = 'contrast(1.14) saturate(.82) brightness(.92) sepia(.12)';
const shotLayer = div(stage, `left:0;top:0;width:${SW}px;height:${SH}px;overflow:hidden`);
stage.insertBefore(shotLayer, bgLayer);
// a full screen graded photo with a slow push. s = [scale from, to], x/y = pan in % of the frame
function shot(b0, b1, sh) {
  const t0 = b0 * B, t1 = b1 * B;
  if (sh.black) { const w = div(shotLayer, `left:0;top:0;width:${SW}px;height:${SH}px;background:#05090D;visibility:hidden`); SHOTS.push({ w, img: null, t0, t1, s: [1, 1], x: [0, 0], y: [0, 0] }); return; }
  const src = LAND ? `photos/f-${sh.img}.jpg` : `photos/fp-${sh.imgP || sh.img}.jpg`;
  const w = div(shotLayer, `left:0;top:0;width:${SW}px;height:${SH}px;overflow:hidden;visibility:hidden`,
    `<img src="${src}" style="position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;object-fit:cover;filter:${GRADE};transform-origin:${sh.o || '50% 50%'};will-change:transform">
     <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,40,60,.35),rgba(0,0,0,0) 45%,rgba(60,30,0,.18));mix-blend-mode:soft-light"></div>
     <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 100%)"></div>
     <div class="dim" style="position:absolute;inset:0;background:${sh.dim ? `rgba(8,20,32,${sh.dim})` : 'transparent'}"></div>`);
  let cap = null;
  if (sh.cap) {
    const c = LAND ? sh.cap : (sh.capP || sh.cap);
    cap = div(stage, `left:${LAND ? 120 : 70}px;top:${SH - BAR - (LAND ? 64 : 84)}px;z-index:46;visibility:hidden;display:flex;align-items:center;gap:14px`,
      `<i style="width:6px;height:${LAND ? 30 : 36}px;background:#5FE3D6;display:block"></i><span style="font-family:Assistant;font-weight:600;font-size:${LAND ? 28 : 34}px;color:#E6EEF4;text-shadow:0 2px 8px rgba(0,0,0,.6);white-space:nowrap">${c}</span>`);
  }
  SHOTS.push({ w, img: w.querySelector('img'), t0, t1, s: sh.s || [1.02, 1.16], x: sh.x || [0, 0], y: sh.y || [0, 0], cap, fade: sh.fade || 0 });
  if (!sh.soft) { CUES.impacts.push(t0); FLASH.push(t0); }
}
// a huge trailer title: tracks in from wide letter spacing and settles while the shot pushes
function title(b0, b1, text, o = {}) {
  const t0 = b0 * B, t1 = b1 * B, sp = o.small ? [.9, .5] : [.22, .06], maxW = SW - (LAND ? 240 : 120);
  // fit the title to the frame at its widest letter spacing, so it never runs off the edge
  let size = o.size || (LAND ? 210 : 180);
  if (!o.small) { const n = text.length, w = textW(text.toUpperCase(), size, 800) + n * sp[0] * size * 1.12; if (w > maxW) size = Math.floor(size * maxW / w); }
  const el = div(stage, `left:0;top:0;width:${SW}px;height:${SH}px;z-index:44;display:flex;flex-direction:column;align-items:center;justify-content:center;visibility:hidden;pointer-events:none`,
    `<div class="tt" style="font-family:Barlow;font-weight:${o.small ? 600 : 800};font-size:${o.small ? (LAND ? 58 : 52) : size}px;line-height:1;color:#fff;text-transform:uppercase;white-space:nowrap;text-shadow:0 0 40px rgba(0,0,0,.45),0 6px 24px rgba(0,0,0,.5)">${text}</div>`);
  TITLES.push({ el, tt: el.firstChild, t0, t1, small: !!o.small, sp });
  if (!o.small) CUES.hits.push(t0);
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
    s.w.style.opacity = s.fade ? Math.min(1, (t - s.t0) / s.fade, (s.t1 - t) / s.fade).toFixed(3) : 1;
    if (s.cap) s.cap.style.opacity = Math.min(1, (t - s.t0 - .25) / .3, (s.t1 - .1 - t) / .2).toFixed(3);
  }
  for (const T of TITLES) {
    const on = t >= T.t0 && t < T.t1;
    T.el.style.visibility = on ? 'visible' : 'hidden';
    if (!on) continue;
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
  g2.style.opacity = endOn ? 0 : .045;
}
const flash = div(stage, `left:0;top:0;width:${SW}px;height:${SH}px;background:#fff;z-index:45;opacity:0;pointer-events:none`);
const bars = [div(stage, `left:0;top:0;width:${SW}px;height:${BAR}px;background:#000;z-index:47`), div(stage, `left:0;top:${SH - BAR}px;width:${SW}px;height:${BAR}px;background:#000;z-index:47`)];
const g2 = document.createElement('canvas'); g2.width = SW / 2; g2.height = SH / 2;
g2.style.cssText = `position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;z-index:48;pointer-events:none;mix-blend-mode:overlay`;
stage.appendChild(g2); const gx2 = g2.getContext('2d');
let T_BARS = 0, T_END = 1e9;

window.BUILD = function () {
  const C = window.CINE;
  T_BARS = (C.barsAt || 0) * B;
  C.shots.forEach(([b0, b1, sh]) => shot(b0, b1, sh));
  C.titles.forEach(([b0, b1, text, o]) => title(b0, b1, text, o));
  // the glass effect words over the footage
  C.glass.forEach(([b0, b1, lines, o = {}]) => {
    phrase(b0 * B, b1 * B - .5, lines, Object.assign({ exit: 'up', cy: SH / 2 + (LAND ? 0 : -20), maxW: LAND ? 1500 : 880 }, o));
    if (o.hit !== false) CUES.hits.push(b0 * B);
  });
  T_END = C.endAt * B;
  CUES.scenes.push(T_END);
  endCard(T_END, C);
  window.UPD = t => { updScreens(t); updCine(t); };
};
const _pre = window.PRELOAD;
window.PRELOAD = async function () {
  await Promise.all([...shotLayer.querySelectorAll('img')].map(i => i.decode().catch(() => 0)));
  if (_pre) await _pre();
};
