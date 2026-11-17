// Kinetic typography engine. Every frame is a pure function of t (window.setT), smooth motion at 24 fps.
const stage = document.getElementById('stage');
// format: ?fmt=land gives 1920 x 1080, otherwise portrait 1080 x 1920
const LAND = new URLSearchParams(location.search).get('fmt') === 'land';
const SW = LAND ? 1920 : 1080, SH = LAND ? 1080 : 1920;
stage.style.width = SW + 'px'; stage.style.height = SH + 'px';
{ const g = document.getElementById('grain'); g.width = SW / 2; g.height = SH / 2; g.style.width = SW + 'px'; g.style.height = SH + 'px'; }
const world = document.createElement('div');
world.style.cssText = `position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;transform-origin:${SW / 2}px ${SH / 2}px`;
stage.appendChild(world);
const IT = [], HL = [], FILL = [], CLIPS = [], CAM = [];
const CUES = { drops: [], stamps: [], pops: [], types: [], scenes: [], cines: [] };
let DUR = 60;
const BPM = 104, B = 60 / BPM;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo3 = p => 1 - Math.pow(1 - p, 3), eo5 = p => 1 - Math.pow(1 - p, 5), ei3 = p => p * p * p;
const ebk = p => { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

function div(parent, css, html) { const d = document.createElement('div'); d.style.cssText = 'position:absolute;' + css; if (html != null) d.innerHTML = html; parent.appendChild(d); return d; }
// item: wrapper (optional mask) + inner. o: {t0, t1, enter, exit, ed, xd, mask, origin, drift}
function item(parent, x, y, html, o) {
  const w = div(parent, `left:${x}px;top:${y}px;${o.mask ? 'overflow:hidden;' : ''}${o.z ? 'z-index:' + o.z + ';' : ''}visibility:hidden;transform-origin:${o.origin || '0 50%'}`);
  const inner = div(w, 'position:relative;' + (o.innerCss || ''), html);
  const it = { w, inner, ...o, ed: o.ed ?? .42, xd: o.xd ?? .38 };
  IT.push(it);
  if (o.enter === 'slam' || o.enter === 'drop') CUES.stamps.push(o.t0 + (o.enter === 'drop' ? .25 : .08));
  else if (o.enter && o.enter !== 'none' && o.enter !== 'fade') CUES.pops.push(o.t0);
  return it;
}
function setT(t) {
  for (const it of IT) {
    const end = it.t1 + (it.exit === 'cut' ? 0 : it.xd);
    if (t < it.t0 || t >= end) { it.w.style.visibility = 'hidden'; continue; }
    it.w.style.visibility = 'visible';
    const p = clamp((t - it.t0) / it.ed), q = clamp((t - it.t1) / it.xd);
    let wx = 0, wy = 0, ws = 1, wr = 0, op = 1, ix = 0, iy = 0, sx = 1, clip = null;
    switch (it.enter) {
      case 'up': iy = 115 * (1 - eo5(p)); break;
      case 'down': iy = -115 * (1 - eo5(p)); break;
      case 'slam': ws = 1 + 1.8 * (1 - eo5(p)); op = clamp(p * 4); break;
      case 'left': wx = -1300 * (1 - eo5(p)); break;
      case 'right': wx = 1300 * (1 - eo5(p)); break;
      case 'pop': ws = Math.max(0, ebk(p)); break;
      case 'stretch': sx = eo5(p); break;
      case 'wipe': clip = `inset(-20% ${(100 * (1 - eo5(p))).toFixed(2)}% -20% 0)`; break;
      case 'fade': op = p; break;
      case 'drop': { const b = p < 1 ? ebk(p) : 1; wy = -1500 * (1 - b); wr = 6 * (1 - p); break; }
      case 'zoomin': ws = .2 + .8 * eo5(p); op = clamp(p * 3); break;
    }
    if (t >= it.t1) switch (it.exit) {
      case 'up': iy -= 115 * ei3(q); break;
      case 'down': iy += 115 * ei3(q); break;
      case 'zoom': ws *= 1 + 5 * ei3(q); op *= 1 - q; break;
      case 'left': wx -= 1400 * ei3(q); break;
      case 'right': wx += 1400 * ei3(q); break;
      case 'fade': op *= 1 - q; break;
      case 'fall': wy += 2200 * q * q; wr += 12 * q; break;
      case 'shrink': ws *= 1 - ei3(q); break;
    }
    if (it.drift) { wx += it.drift[0] * (t - it.t0); wy += it.drift[1] * (t - it.t0); ws *= 1 + (it.drift[2] || 0) * (t - it.t0); }
    it.w.style.transform = `translate(${wx.toFixed(1)}px,${wy.toFixed(1)}px) scale(${ws.toFixed(4)}) rotate(${wr.toFixed(2)}deg)`;
    it.w.style.opacity = op.toFixed(3);
    it.inner.style.transform = `translateY(${iy.toFixed(2)}%) scaleX(${sx.toFixed(4)})`;
    it.inner.style.transformOrigin = '0 50%';
    if (clip) it.inner.style.clipPath = clip; else if (it.enter === 'wipe') it.inner.style.clipPath = 'none';
  }
  for (const h of HL) { const p = eo5(clamp((t - h.t) / .35)); h.el.style.backgroundSize = `${(p * 100).toFixed(1)}% 100%`; }
  for (const f of FILL) { f.el.style.backgroundPosition = `${(50 + 18 * Math.sin((t - f.t) * .35)).toFixed(2)}% 50%`; }
  for (const c of CLIPS) {
    const f = clamp((t - c.start) / c.dur), k = Math.min(c.frames.length - 1, Math.floor(f * (c.frames.length - 1) + 1e-6));
    if (k !== c.last) { const im = c.frames[k], s = Math.max(c.c.width / im.width, c.c.height / im.height), w = im.width * s, h = im.height * s; c.x.drawImage(im, (c.c.width - w) / 2, (c.c.height - h) / 2, w, h); c.last = k; }
  }
  // camera: list of [t0, t1, fromTransform, toTransform] numbers {s, r, x, y}
  let cam = { s: 1, r: 0, x: 0, y: 0 };
  for (const c of CAM) if (t >= c[0]) { const f = eio(clamp((t - c[0]) / (c[1] - c[0]))); cam = { s: c[2].s + (c[3].s - c[2].s) * f, r: c[2].r + (c[3].r - c[2].r) * f, x: c[2].x + (c[3].x - c[2].x) * f, y: c[2].y + (c[3].y - c[2].y) * f }; }
  world.style.transform = `translate(${cam.x}px,${cam.y}px) rotate(${cam.r}deg) scale(${cam.s})`;
  if (window.UPD) window.UPD(t);
  grain(Math.floor(t * 12));
}
const gc = document.getElementById('grain'), gx = gc.getContext('2d'), GR = [];
(function () {
  let sd = 12345; const rnd = () => (sd = Math.imul(sd ^ (sd >>> 15), 2246822507) + 1 >>> 0) / 4294967296;
  for (let k = 0; k < 4; k++) { const im = gx.createImageData(gc.width, gc.height); for (let i = 0; i < im.data.length; i += 4) { const v = rnd() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } GR.push(im); }
})();
let lastG = -1; function grain(h) { const k = h % 4; if (k !== lastG) { gx.putImageData(GR[k], 0, 0); lastG = k; } }
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

// text measuring for fitting lines to the width
const mc = document.createElement('canvas').getContext('2d');
function textW(txt, size, weight = 800, fam = 'Barlow') { mc.font = `${weight} ${size}px ${fam}`; return mc.measureText(txt).width; }

window.ready = async function () {
  const faces = ['500 20px Barlow', '600 20px Barlow', '700 20px Barlow', '800 20px Barlow', '400 20px Assistant', '600 20px Assistant', '700 20px Assistant'];
  await Promise.all(faces.map(f => document.fonts.load(f)));
  await document.fonts.ready;
  window.BUILD();
  await Promise.all([...document.images].map(i => i.decode().catch(() => 0)));
  const urls = new Set(FILL.map(f => f.url));
  await Promise.all([...urls].map(u => loadImg(u).catch(() => 0)));
  if (window.PRELOAD) await window.PRELOAD();
  window.CUES = CUES;
  return 'ok';
};
