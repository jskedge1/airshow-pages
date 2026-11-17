// The glass effect: kinetic typography explainer engine (saved design, 17 Nov 2026).
// One script, two formats: portrait 1080 x 1920 (default) and landscape 1920 x 1080 (?fmt=land). 24 fps, 104 bpm grid.
// Line markup: [WORD|p:name] fills the word with a photo, *WORD* gets a mint highlight bar, _WORD_ is red.
// Each point can have photo panels (pics) and a background (bg) photo or clip.
const NAVY = '#0E2131', RED = '#D74949', MINT = '#5FE3D6', PURPLE = '#6950A1';
const bgLayer = div(stage, `left:0;top:0;width:${SW}px;height:${SH}px`);
stage.insertBefore(bgLayer, world);
const topLayer = div(stage, `left:0;top:0;width:${SW}px;height:${SH}px;z-index:40;pointer-events:none`);
const CLIPDEFS = [];
const imgUrl = k => k.startsWith('c:') ? `cine/${k.slice(2)}.jpg` : k.startsWith('l:') ? `photos/l-${k.slice(2)}.jpg` : `photos/p-${k.slice(2)}.jpg`;
// layout per format
const F = LAND ? {
  x: 120, maxW: 1600, cy: 545, maxH: 860, kind: { huge: 250, big: 185, mid: 84, small: 52 }, center: true,
  panel: { x: 1080, maxW: 760, cy: 545 }, textWithPanel: { maxW: 840, cy: 545, maxH: 840, center: false },
  title: { lbl: [120, 330], y0: 430, step: 205, size: 190, maxW: 1680, when: [120, 690] }, bar: { x: 110, y: 70, w: 205, gap: 8 },
} : {
  x: 90, maxW: 900, cy: 960, maxH: 1340, kind: { huge: 300, big: 210, mid: 96, small: 60 },
  panel: { x: 90, maxW: 900, cy: 1460 }, textWithPanel: { maxW: 900, cy: 680, maxH: 840 },
  title: { lbl: [90, 500], y0: 640, step: 250, size: 230, maxW: 900, when: [90, 1190] }, bar: { x: 80, y: 110, w: 107, gap: 10 },
};
// slides with a website screen: text above a phone (portrait) or beside a browser window (landscape)
const SCR = LAND ? { x: 960, y: 140, w: 840, h: 800, bar: 46, pad: 12, text: { x: 120, maxW: 760, cy: 545, maxH: 860, center: false } }
                 : { x: 290, y: 820, w: 500, h: 1000, bar: 0, pad: 20, text: { maxW: 900, cy: 485, maxH: 640 } };
const KIND = {
  huge: { f: 'Barlow', w: 800, max: F.kind.huge, lh: 1.0, col: '#fff', up: true },
  big: { f: 'Barlow', w: 800, max: F.kind.big, lh: 1.0, col: '#fff', up: true },
  mid: { f: 'Barlow', w: 700, max: F.kind.mid, lh: 1.18, col: MINT, up: false },
  small: { f: 'Assistant', w: 600, max: F.kind.small, lh: 1.35, col: '#C9D6E0', up: false },
};
function plain(m) { return m.replace(/\[([^|\]]+)\|[^\]]+\]/g, '$1').replace(/[*_~]/g, ''); }
function render(m, t) {
  return m.replace(/\[([^|\]]+)\|([^\]]+)\]/g, (_, w, k) => `<span class="fill" data-t="${t}" style="background-image:url(${imgUrl(k)})">${w}</span>`)
    .replace(/\*([^*]+)\*/g, `<span class="hl" data-t="${t}">$1</span>`)
    .replace(/_([^_]+)_/g, `<span style="color:${RED}">$1</span>`)
    // ~word~: a purple highlight bar, the transport page colour, for travel and getting there
    .replace(/~([^~]+)~/g, `<span class="hl" data-t="${t}" style="color:#fff;background-image:linear-gradient(${PURPLE},${PURPLE})">$1</span>`);
}
function register(node) {
  node.querySelectorAll('.hl').forEach(e => HL.push({ el: e, t: +e.dataset.t }));
  node.querySelectorAll('.fill').forEach(e => FILL.push({ el: e, t: +e.dataset.t, url: e.style.backgroundImage.slice(5, -2) }));
}
// lines: [kind, markup, opts]
// Fixed type scale (FILM.typeScale): one large, one medium and one small size for the whole film.
// huge and big are the same large size; a line too wide for the slide wraps onto the next line
// instead of shrinking. Hero words with an explicit size (the photo filled intro and outro words) keep it.
const TS = LAND ? { big: 138, mid: 62, small: 44 } : { big: 148, mid: 70, small: 50 };
function tokens(m) { return m.match(/\[[^\]]+\]|\*[^*]+\*|_[^_]+_|~[^~]+~|\S+/g) || []; }
function phrase(t0, t1, lines, o = {}) {
  const maxW = o.maxW || F.maxW, x = o.x ?? F.x, maxH = o.maxH || F.maxH;
  const fixed = window.FILM && window.FILM.typeScale;
  if (fixed) {
    const out = [];
    for (const [k0, m, lo = {}] of lines) {
      const k = k0 === 'huge' && !lo.size ? 'big' : k0, K = KIND[k], s = lo.size ? null : TS[k] || TS.big;
      if (!s) { out.push([k, m, lo]); continue; }
      const wOf = mm => { const tt = K.up ? plain(mm).toUpperCase() : plain(mm); return textW(tt, s, K.w, K.f) + (mm.match(/[*~]/g) || []).length / 2 * .24 * s; };
      let cur = '';
      // a highlighted or red phrase that is too wide on its own is split word by word, keeping its colour
      const tks = []; for (const tk of tokens(m)) { const mk = /^[*_~]/.test(tk) ? tk[0] : ''; if (mk && tk.includes(' ') && wOf(tk) > maxW) tk.slice(1, -1).split(' ').forEach(w => tks.push(mk + w + mk)); else tks.push(tk); }
      for (const tk of tks) { const nx = cur ? cur + ' ' + tk : tk; if (cur && wOf(nx) > maxW) { out.push([k, cur, Object.assign({}, lo, { _fix: s })]); cur = tk; } else cur = nx; }
      if (cur) out.push([k, cur, Object.assign({}, lo, { _fix: s })]);
    }
    lines = out;
  }
  let L = lines.map(([k, m, lo = {}]) => {
    const K = KIND[k], txt = K.up ? plain(m).toUpperCase() : plain(m);
    const hlPad = (m.match(/[*~]/g) || []).length / 2 * .24;
    let s = lo._fix || Math.min((lo.size || K.max) * (lo.size && LAND ? .75 : 1), K.max);
    const w = textW(txt, s, K.w, K.f) + hlPad * s;
    if (w > maxW) { if (lo._fix) console.warn('type scale: line too wide, shrinking', txt); s = Math.floor(s * maxW / w); }
    return { k, K, m, s, lo, txt, hlPad };
  });
  // uniform: every line of the same kind on this slide gets the same (smallest fitting) size, for lists
  if (o.uniform) for (const k of Object.keys(KIND)) { const m = Math.min(...L.filter(l => l.k === k).map(l => l.s)); L.forEach(l => { if (l.k === k) l.s = m; }); }
  const gap = o.gap ?? (LAND ? 28 : 30);
  let H = L.reduce((a, l) => a + l.s * l.K.lh, 0) + gap * (L.length - 1);
  if (H > maxH) { if (fixed) console.warn('type scale: slide too tall', H | 0, '>', maxH); else { const f = maxH / H; L.forEach(l => l.s = Math.floor(l.s * f)); H = maxH; } }
  let y = (o.cy ?? F.cy) - H / 2;
  const out = [];
  L.forEach((l, i) => {
    const te = t0 + (o.stagger ?? B * .4) * i + (l.lo.delay || 0);
    const enter = l.lo.enter || o.enter || (l.K.up ? 'up' : 'wipe');
    const html = `<div style="font-family:${l.K.f};font-weight:${l.K.w};font-size:${l.s}px;line-height:${l.K.lh};color:${l.lo.col || l.K.col};white-space:nowrap;${l.K.up ? 'text-transform:uppercase;' : ''}padding:${(l.s * .1).toFixed(0)}px 0">${render(l.m, te + .15)}</div>`;
    const center = o.center ?? F.center;
    const lx = center && o.x == null ? Math.round((SW - (textW(l.txt, l.s, l.K.w, l.K.f) + l.hlPad * l.s)) / 2) : x;
    const it = item(world, lx, y - l.s * .1, html, { t0: te, t1: t1 + i * .03, enter, exit: o.exit || 'up', mask: enter === 'up' || enter === 'down', ed: l.lo.ed, z: 5 });
    register(it.inner);
    out.push(it); y += l.s * l.K.lh + gap;
  });
  return out;
}
// photo panels: one or two prints (white border, shadow) beside or under the words
function panels(t0, t1, pics, exit) {
  const P = F.panel, n = pics.length;
  const w = n === 1 ? P.maxW : Math.round(P.maxW * .62), h = Math.round(w * 9 / 16);
  pics.forEach((pc, k) => {
    // 'name|caption': the caption names what is in the photo, under the picture
    const [p, cap] = pc.split('|');
    const capHtml = cap ? `<div style="font-family:Barlow;font-weight:700;font-size:${n === 1 ? (LAND ? 26 : 30) : (LAND ? 20 : 24)}px;color:#13293C;padding:${LAND ? 8 : 10}px 2px 0;line-height:1.1;width:${w}px">${cap}</div>` : '';
    const html = `<div style="background:#fff;padding:${LAND ? 12 : 14}px;box-shadow:12px 14px 0 rgba(0,0,0,.4)"><img src="photos/p-${p}.jpg" style="display:block;width:${w}px;height:${h}px;object-fit:cover">${capHtml}</div>`;
    let px = P.x, py = P.cy - h / 2;
    if (n === 2) { px = P.x + (k ? P.maxW - w - 10 : 0); py = P.cy - h * .78 + k * h * .62; }
    const rot = n === 1 ? (LAND ? 1.5 : -1.5) : (k ? 3 : -3);
    const it = item(world, px, py, html, { t0: t0 + .35 + k * B * .8, t1: t1 + k * .04, enter: LAND ? 'right' : (k ? 'right' : 'left'), exit: exit === 'up' ? 'fall' : exit, z: 3 + k, origin: '50% 50%' });
    it.w.style.rotate = rot + 'deg';
  });
}
function background(t0, t1, bg) {
  let inner;
  if (bg.clip) { const id = 'k' + CLIPDEFS.length; CLIPDEFS.push({ id, dir: LAND ? bg.clipL : bg.clip, n: bg.n, start: t0, dur: t1 - t0 }); inner = `<canvas id="${id}" width="${SW}" height="${SH}" style="display:block"></canvas>`; }
  else inner = `<img src="${imgUrl(LAND ? bg.imgL : bg.img)}" style="display:block;width:${SW}px;height:${SH}px;object-fit:cover">`;
  item(bgLayer, 0, 0, `<div style="width:${SW}px;height:${SH}px;filter:saturate(.9) brightness(${bg.bright || .5})">${inner}</div><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,33,49,.55),rgba(14,33,49,.2) 40%,rgba(14,33,49,.7))"></div>`,
    { t0, t1, enter: 'fade', exit: 'fade', ed: .3, xd: .3, drift: [0, 0, .015], origin: '50% 50%' });
}
// a real website screen in a device frame: it tilts in, then the page scrolls to the part being described
const SCREENS = [];
function screenPanel(t0, t1, sc) {
  const [pg, y0, y1] = LAND ? sc.d : sc.m, iw = SCR.w - 2 * SCR.pad, ih = SCR.h - SCR.bar - 2 * SCR.pad;
  const k = iw / (LAND ? 1440 : 430), src = sc.z ? `screens/${pg}-full-${LAND ? 'd' : 'm'}.jpg` : `screens/${pg}-${y0}-${y1}-${LAND ? 'd' : 'm'}.jpg`;
  const bar = LAND ? `<div style="height:${SCR.bar}px;display:flex;align-items:center;gap:9px;padding:0 16px"><i style="width:12px;height:12px;border-radius:50%;background:#D74949"></i><i style="width:12px;height:12px;border-radius:50%;background:#F2B233"></i><i style="width:12px;height:12px;border-radius:50%;background:#5FE3D6"></i><span style="margin-left:14px;flex:1;height:28px;border-radius:14px;background:#14283A;color:#C9D6E0;font-family:Assistant;font-weight:600;font-size:17px;line-height:28px;padding-left:16px">ukairshowguide.co.uk</span></div>` : '';
  const html = `<div class="scr" style="width:${SCR.w}px;height:${SCR.h}px;border-radius:${LAND ? 18 : 64}px;background:${LAND ? '#0B1A27' : '#04101A'};padding:${LAND ? `0 ${SCR.pad}px ${SCR.pad}px` : SCR.pad + 'px'};box-shadow:0 34px 70px rgba(0,0,0,.55),0 0 0 2px rgba(95,227,214,.22);transform-origin:50% 60%">${bar}<div style="width:${iw}px;height:${ih}px;border-radius:${LAND ? 6 : 46}px;overflow:hidden;position:relative;background:#fff"><img src="${src}" style="position:absolute;left:0;top:0;width:${iw}px;will-change:transform"></div></div>`;
  const it = item(world, SCR.x, SCR.y, html, { t0: t0 + .2, t1, enter: 'fade', exit: 'fade', ed: .5, xd: .35, z: 4, origin: '50% 50%' });
  // zoom mode (sc.z): the whole page is loaded, the view opens on the full width and pushes in on the panel at (cx, y)
  SCREENS.push({ el: it.inner.querySelector('.scr'), img: it.inner.querySelector('img'), t0: t0 + .2, t1, y0, y1, k, z: sc.z, cx: sc.cx, iw, ih });
  CUES.pops.push(t0 + .2);
}
function updScreens(t) {
  for (const s of SCREENS) {
    if (t < s.t0 || t > s.t1 + .4) continue;
    const p = eo5(clamp((t - s.t0) / .9)), q = eio(clamp((t - s.t0 - .7) / (s.t1 - s.t0 - 1.0)));
    // tilt in from the side (landscape) or from below (portrait), then a slow drift for depth
    const drift = Math.sin((t - s.t0) * .8) * 1.2;
    s.el.style.transform = LAND ? `perspective(1800px) translateX(${(90 * (1 - p)).toFixed(1)}px) rotateY(${(-16 * (1 - p) - 4 + drift).toFixed(2)}deg) scale(${(.94 + .06 * p).toFixed(4)})`
                                : `perspective(1800px) translateY(${(120 * (1 - p)).toFixed(1)}px) rotateX(${(14 * (1 - p) + 3 + drift * .6).toFixed(2)}deg) scale(${(.94 + .06 * p).toFixed(4)})`;
    if (!s.z) { s.img.style.transform = `translateY(${(-(s.y1 - s.y0) * q * s.k).toFixed(1)}px)`; continue; }
    const W = LAND ? 1440 : 430, H = s.img.naturalHeight / (LAND ? 1 : 2) || 3000;
    const sz = 1 + (s.z - 1) * eio(clamp((t - s.t0 - .35) / 1.6)), sc2 = s.k * sz;
    const cy = s.y0 + (s.y1 - s.y0) * q;
    const left = clamp(s.iw / 2 - s.cx * sc2, s.iw - W * sc2, 0), top = clamp(s.ih / 2 - cy * sc2, Math.min(0, s.ih - H * sc2), 0);
    s.img.style.width = (W * sc2).toFixed(1) + 'px';
    s.img.style.transform = `translate(${left.toFixed(1)}px,${top.toFixed(1)}px)`;
  }
}
// one point: words, optional photo panels, optional website screen, optional background
function point(t0, t1, pt, exit) {
  const hasPics = pt.pics && pt.pics.length;
  phrase(t0, t1, pt.lines, Object.assign({ exit }, hasPics ? F.textWithPanel : {}, pt.screen ? SCR.text : {}, pt.o || {}));
  if (pt.screen) screenPanel(t0, t1, pt.screen);
  if (hasPics) panels(t0, t1, pt.pics, exit);
  if (pt.bg) background(t0 - .1, t1 + .3, pt.bg);
}

// ---------- build from the content file (window.FILM) ----------
window.BUILD = function () {
  const C = window.FILM;
  // intro: a list of phrases, each [startBeat, endBeat, lines, opts]
  item(world, F.x, LAND ? 120 : 300, `<img src="photos/logo-new.png" style="width:${LAND ? 280 : 300}px;display:block">`, { t0: .1, t1: 4 * B, enter: 'wipe', exit: 'up', mask: true });
  C.intro.forEach(([b0, b1, lines, o = {}]) => {
    if (o.boom) CUES.cines.push([b0 * B, b1 * B]);
    phrase(b0 * B + (b0 ? 0 : .2), b1 * B, lines, Object.assign({ cy: LAND ? 560 : 900 }, o));
  });
  const t = C.introBeats * B;
  const TITLE = 4 * B, PT = (C.pointBeats || 4.5) * B, N = C.stops.length;
  // each step lasts its title card plus one slot per point, so a step can hold any number of points
  const SL = C.stops.map(st => TITLE + st[2].length * PT), S0 = SL.map((_, i) => t + SL.slice(0, i).reduce((a, b) => a + b, 0));
  const EXITS = ['up', 'zoom', 'left'], T = F.title;
  C.stops.forEach(([title, when, pts], i) => {
    const s = S0[i];
    CUES.scenes.push(s);
    item(world, -40, -40, `<div style="width:${SW + 80}px;height:${SH + 80}px;background:${C.cardColour || RED}"></div>`, { t0: s, t1: s + TITLE - .25, enter: 'left', exit: 'left', ed: .35, xd: .3 });
    item(world, T.lbl[0], T.lbl[1], `<div class="b" style="font-weight:700;font-size:${LAND ? 70 : 84}px;line-height:1.1;color:#fff;padding:6px 0">${C.stepLabel === false ? '' : (C.stepLabel || 'Step') + ' ' + (i + 1)}</div>`, { t0: s + .2, t1: s + TITLE - .25, enter: 'up', exit: 'left', mask: true, xd: .3 });
    const words = LAND ? [title.replace('|', ' ')] : title.split('|');
    words.forEach((w, k) => {
      const size = Math.min(T.size, Math.floor(T.size * T.maxW / textW(w.toUpperCase(), T.size)));
      item(world, T.lbl[0], T.y0 + k * T.step, `<div class="b" style="font-weight:800;font-size:${size}px;line-height:1.05;color:#fff;text-transform:uppercase;white-space:nowrap">${w}</div>`, { t0: s + .35 + k * B / 2, t1: s + TITLE - .25, enter: 'slam', exit: 'left', xd: .3, z: 3 });
    });
    item(world, T.when[0], T.when[1], `<div style="background:${NAVY};color:#fff;font-family:Assistant;font-weight:700;font-size:${LAND ? 50 : 44}px;padding:10px 22px;white-space:nowrap">${when}</div>`, { t0: s + .35 + 1.5 * B, t1: s + TITLE - .25, enter: 'wipe', exit: 'left', xd: .3 });
    CAM.push([s, s + .7, { s: 1.06, r: -2.5, x: 0, y: 0 }, { s: 1, r: 0, x: 0, y: 0 }]);
    pts.forEach((pt, k) => { const a = s + TITLE + k * PT; point(a + .05, a + PT - .3, pt, EXITS[k % 3]); });
  });
  // outro
  const o = S0[N - 1] + SL[N - 1];
  CUES.scenes.push(o); CUES.cines.push([o, o + 4 * B]);
  phrase(o, o + 4 * B, C.outro, { stagger: B / 2, exit: 'zoom' });
  // end card: the swish logo from the airshow trailers in the centre, the guide link under it, socials along the bottom
  const e = o + 4 * B, CX = SW / 2;
  const L0 = LAND ? { logoW: 740, logo: 105, read: 565, btn: 612, line: 770, lbl: 798, ico: 855, icoS: 106, gap: 340 }
                  : { logoW: 860, logo: 420, read: 960, btn: 1020, line: 1430, lbl: 1470, ico: 1545, icoS: 140, gap: 330 };
  const logoH = L0.logoW * 711 / 1409;
  const centred = (html, y, o2) => item(world, 0, y, `<div style="width:${SW}px;display:flex;justify-content:center">${html}</div>`, Object.assign({ t1: 99, origin: '50% 50%' }, o2));
  // soft glow behind the logo
  centred(`<div style="width:${LAND ? 1500 : 1000}px;height:${LAND ? 700 : 800}px;background:radial-gradient(closest-side,rgba(95,227,214,.13),rgba(95,227,214,0))"></div>`, L0.logo + logoH / 2 - (LAND ? 350 : 400), { t0: e, enter: 'fade', ed: .8, z: 1 });
  CUES.cines.push([e + .25, e + 1]);
  centred(`<img src="photos/logo-swish.png" style="width:${L0.logoW}px;display:block;filter:drop-shadow(0 14px 0 rgba(0,0,0,.3))">`, L0.logo, { t0: e + .25, enter: 'zoomin', ed: .6, drift: [0, 0, .006], z: 4 });
  phrase(e + .7, 99, [['small', C.readLine || 'Read the full guide at']], { cy: L0.read, center: true });
  centred(`<div class="btn" style="font-size:${LAND ? 46 : 48}px;padding:18px 44px">${C.url}</div>`, L0.btn, { t0: e + 1.0, enter: 'pop', z: 4 });
  // socials
  centred(`<div style="width:${LAND ? 900 : 760}px;height:3px;background:linear-gradient(90deg,rgba(95,227,214,0),${MINT},rgba(95,227,214,0))"></div>`, L0.line, { t0: e + 1.3, enter: 'stretch', ed: .6 });
  centred(`<div class="b" style="font-weight:700;font-size:${LAND ? 34 : 38}px;letter-spacing:6px;color:${MINT}">FOLLOW FOR MORE TIPS</div>`, L0.lbl, { t0: e + 1.4, enter: 'up', mask: true });
  const ICON = {
    Instagram: 'M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm4.9-9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM21 7.6a5.3 5.3 0 0 0-1.4-3.8A5.4 5.4 0 0 0 15.8 2.4C14.3 2.3 9.7 2.3 8.2 2.4a5.4 5.4 0 0 0-3.8 1.4A5.3 5.3 0 0 0 3 7.6c-.1 1.5-.1 6.1 0 7.6a5.3 5.3 0 0 0 1.4 3.8 5.4 5.4 0 0 0 3.8 1.4c1.5.1 6.1.1 7.6 0a5.3 5.3 0 0 0 3.8-1.4 5.3 5.3 0 0 0 1.4-3.8c.1-1.5.1-6.1 0-7.6zm-2 9.2a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.3.4s-4.1.1-5.3-.4A3 3 0 0 1 5 16.8c-.5-1.2-.4-4-.4-5.3s-.1-4.1.4-5.3A3 3 0 0 1 6.7 4.5C7.9 4 10.7 4.1 12 4.1s4.1-.1 5.3.4A3 3 0 0 1 19 6.2c.5 1.2.4 4 .4 5.3s.1 4.1-.4 5.3z',
    Facebook: 'M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z',
    YouTube: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z',
  };
  (C.socials || ['Instagram', 'Facebook', 'YouTube']).forEach((s, k, all) => {
    const S = L0.icoS, x = CX + (k - (all.length - 1) / 2) * L0.gap - 150;
    item(world, x, L0.ico, `<div style="width:300px;display:flex;flex-direction:column;align-items:center;gap:${LAND ? 14 : 18}px">
      <div style="width:${S}px;height:${S}px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 0 rgba(0,0,0,.3)"><svg viewBox="0 0 24 24" style="width:${S * .56}px;height:${S * .56}px"><path fill="${NAVY}" d="${ICON[s]}"/></svg></div>
      <div class="b" style="font-weight:700;font-size:${LAND ? 36 : 44}px;color:#fff">${s}</div></div>`, { t0: e + 1.6 + k * B / 2, t1: 99, enter: 'pop', origin: '50% 30%', z: 4 });
  });
  DUR = e + 5.5;
  // progress bar, one segment per stop
  const segs = [], BR = F.bar, span = LAND ? 1700 : 920, sw = (span - (N - 1) * BR.gap) / N;
  for (let k = 0; k < N; k++) segs.push(div(topLayer, `left:${BR.x + k * (sw + BR.gap)}px;top:${BR.y}px;width:${sw}px;height:8px;background:rgba(255,255,255,.22);overflow:hidden`, `<div style="width:0;height:100%;background:${MINT}"></div>`));
  window.UPD = function (tt) {
    updScreens(tt);
    const on = tt >= t && tt < o;
    topLayer.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    segs.forEach((sg, k) => { sg.firstChild.style.width = (clamp((tt - S0[k]) / SL[k]) * 100).toFixed(1) + '%'; });
  };
};

window.PRELOAD = async function () {
  for (const c of CLIPDEFS) {
    // clip frames are built by make-frames.sh; if they are missing the words still play over the dark background
    const frames = await Promise.all(Array.from({ length: c.n }, (_, k) => loadImg(`${c.dir}/${String(k + 1).padStart(3, '0')}.jpg`))).catch(() => null);
    if (!frames) continue;
    CLIPS.push({ c: document.getElementById(c.id), x: document.getElementById(c.id).getContext('2d'), frames, start: c.start, dur: c.dur, last: -1 });
  }
};
