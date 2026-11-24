// Pip Studio: draws a Pip poster or an 8 second Pip video on a canvas, as a pure function of time.
// draw(t) paints second t; the same code makes the live preview, the saved video and the offline render.
{
  const M = UKAGMascot, TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);
  const FORMATS = {
    square: { w: 1080, h: 1080, name: 'Square post', video: true },
    tall: { w: 1080, h: 1920, name: 'Tall video or story', video: true },
    wide: { w: 1920, h: 1080, name: 'Wide (YouTube)', video: true },
    poster: { w: 2480, h: 3508, name: 'A3 poster', video: false }
  };
  const COLOURS = {
    plan: { bg: '#23908C', ink: '#FFFFFF', name: 'Plan teal', dark: true },
    inform: { bg: '#1F4E8C', ink: '#FFFFFF', name: 'Inform blue', dark: true },
    prepare: { bg: '#D74949', ink: '#FFFFFF', name: 'Prepare red', dark: true },
    navy: { bg: '#13293C', ink: '#FFFFFF', name: 'Navy', dark: true },
    calm: { bg: '#6950A1', ink: '#FFFFFF', name: 'Calm purple', dark: true },
    cream: { bg: '#F8F4EA', ink: '#13293C', name: 'Cream', dark: false },
    yellow: { bg: '#FFC23A', ink: '#13293C', name: 'Yellow', dark: false }
  };
  const STARTERS = {
    season: { name: 'Airshow season', pose: 'cheer', colour: 'yellow', headline: 'See Pip?', sub: 'It must be airshow season.', ticks: '', label: '' },
    plan: { name: 'Plan it with Pip', pose: 'map', colour: 'plan', headline: 'Pip helps you plan', sub: '', ticks: 'Pick the right show for you\nSort your tickets and parking\nWork out your day', label: 'Plan it with Pip' },
    inform: { name: 'Pip explains', pose: 'point', colour: 'inform', headline: 'Pip keeps you informed', sub: '', ticks: 'The dates and the line-up\nHow to get there\nThe rules on site', label: 'Pip explains' },
    prepare: { name: 'Pack it, Pip!', pose: 'sun', colour: 'prepare', headline: 'Pip gets you ready', sub: '', ticks: 'What to pack\nLittle ears protected\nThe weather and getting home', label: 'Pack it, Pip!' },
    ears: { name: 'Ear defenders', pose: 'loud', colour: 'cream', headline: 'Got your ear defenders?', sub: 'Little ears need looking after.', ticks: '', label: "Pip's ear defender promise" },
    word: { name: 'Word of the week', pose: 'point', colour: 'navy', headline: 'Flypast', sub: 'An aircraft flying past the crowd.', ticks: '', label: "Pip's word of the week" },
    calm: { name: 'Calm visit', pose: 'loud', colour: 'calm', headline: 'Noise and crowds a bit much?', sub: 'Pip will be with you in the calm airshow visit guide.', ticks: '', label: 'A calm airshow visit' },
    week: { name: 'Show week', pose: 'hello', colour: 'navy', headline: "It's show week!", sub: 'Type the show name and date here.', ticks: '', label: 'Plan it with Pip' }
  };
  const POSES = { rest: 'Rest', hello: 'Hello', tip: 'Tip', point: 'Point', headsup: 'Heads up', marshal: 'Marshal', loud: 'Ear defenders', sun: 'Sun hat', rain: 'Rain', photo: 'Camera', map: 'Map', cheer: 'Cheer', loading: 'Spinning', oops: 'Oops', fly: 'Flying' };
  const HAPPY = /^(hello|cheer|loud|sun|fly)$/;
  const DUR = 8, FPS = 30, PHASES = 12;

  const q = new URLSearchParams(location.search);
  const RENDER = q.get('render') === '1';
  let S = Object.assign({ format: 'square', sound: true }, STARTERS.season);
  try { const saved = JSON.parse(localStorage.getItem('pip-studio') || 'null'); if (saved && !RENDER) Object.assign(S, saved); } catch (e) {}

  const cv = $('cv'), ctx = cv.getContext('2d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const out3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
  function spring(t, k = 260, c = 16) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = c / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }

  // ---------------------------------------------------------------- pictures of Pip
  const loadImg = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  const pipImg = (o) => loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(M.svg(Object.assign({ size: 800, title: '' }, o))));
  function poseFrames(pose) {
    const list = [];
    for (let k = 0; k < PHASES; k++) {
      const s = Math.sin(TAU * k / PHASES), o = { pose };
      if (!/loud|loading|fly/.test(pose)) o.prop = -10 + 5 * s;
      if (pose === 'hello') o.right = -46 + 13 * s;
      if (pose === 'cheer') { o.left = -58 + 6 * s; o.right = -58 - 6 * s; }
      list.push(o);
    }
    const blink = Object.assign({}, list[0], { eyes: 'happy' });
    return Promise.all(list.concat([blink]).map(pipImg)).then((imgs) => ({ frames: imgs.slice(0, PHASES), blink: imgs[PHASES], happy: HAPPY.test(pose) }));
  }
  const cache = {};
  const getPose = (p) => cache[p] || (cache[p] = poseFrames(p));
  let A = { logo: null, pose: null, hello: null, fly: null };

  // ---------------------------------------------------------------- text helpers
  const FD = 'PipDisplay, Barlow, sans-serif', FU = 'PipUI, Barlow, sans-serif';
  function wrap(text, size, font, width) {
    ctx.font = font.replace('$', size);
    const words = text.split(/\s+/).filter(Boolean), lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > width && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  const ticksOf = () => (S.ticks || '').split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 3);

  // Work out sizes and positions for the current format and words.
  function layout() {
    const F = FORMATS[S.format], W = F.w, H = F.h, k = W / 1080;
    const L = { W, H, k, align: 'center' };
    let region, base, pipMax, order;
    if (S.format === 'wide') { region = { x: 930, y: 100, w: 900, h: 880 }; base = 150; pipMax = 760; L.align = 'left'; }
    else if (S.format === 'square') { region = { x: 70, y: 70, w: 940, h: 940 }; base = 116; pipMax = 520; }
    else if (S.format === 'tall') { region = { x: 70, y: 230, w: 940, h: 1340 }; base = 156; pipMax = 720; }
    else { region = { x: 180, y: 480, w: 2120, h: 2520 }; base = 260; pipMax = 1500; }
    L.region = region;
    const ticks = ticksOf();
    for (let scale = 1; scale > .4; scale -= .05) {
      const hs = base * scale, ss = hs * .5, ts = hs * .44, ls = hs * .4;
      const head = wrap(S.headline || '', hs, '800 $px ' + FD, region.w);
      const sub = S.sub ? wrap(S.sub, ss, '600 $px ' + FU, region.w) : [];
      const tk = ticks.map((t) => wrap(t, ts, '800 $px ' + FD, region.w - ts * 1.6));
      const textH = head.length * hs * 1.02 + (sub.length ? hs * .22 + sub.length * ss * 1.22 : 0)
        + (tk.length ? hs * .3 + tk.reduce((a, l) => a + l.length * ts * 1.16 + ts * .36, 0) : 0)
        + (S.label ? hs * .34 + ls * 1.9 : 0);
      const gap = hs * .45;
      let pip = S.format === 'wide' ? pipMax : Math.min(pipMax, region.h - textH - gap);
      if (head.length <= 3 && textH <= region.h && pip >= pipMax * .55) {
        Object.assign(L, { hs, ss, ts, ls, head, sub, tk, textH, gap, pip });
        break;
      }
    }
    if (!L.head) Object.assign(L, { hs: base * .4, ss: base * .2, ts: base * .18, ls: base * .16, head: [S.headline], sub: [], tk: [], textH: base * .4, gap: 20, pip: pipMax * .5 });
    if (S.format === 'wide') {
      L.pipBox = { x: 110 + (760 - L.pip) / 2, y: (H - L.pip) / 2, s: L.pip };
      L.textY = region.y + (region.h - L.textH) / 2;
    } else if (S.format === 'poster') {
      // poster: words on top, Pip in the middle, ticks and label under Pip
      L.textY = region.y;
      L.split = true;
    } else {
      const total = L.pip + L.gap + L.textH, y0 = region.y + (region.h - total) / 2;
      L.pipBox = { x: (W - L.pip) / 2, y: y0, s: L.pip };
      L.textY = y0 + L.pip + L.gap;
    }
    if (L.split) {
      const headH = L.head.length * L.hs * 1.02 + (L.sub.length ? L.hs * .22 + L.sub.length * L.ss * 1.22 : 0);
      const restH = L.textH - headH;
      const pip = Math.min(1500, region.h - L.textH - L.gap * 2);
      L.pip = pip;
      L.pipBox = { x: (W - pip) / 2, y: region.y + headH + L.gap, s: pip };
      L.restY = L.pipBox.y + pip + L.gap;
      L.restH = restH;
    }
    return L;
  }

  // ---------------------------------------------------------------- drawing
  function arrive(t, at) { const d = t - at; return d <= 0 ? null : { a: Math.min(1, d / .12), k: spring(d) }; }
  function slantBox(x, y, w, h, fill) {
    const s = h * .3;
    ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - s, y + h); ctx.lineTo(x, y + h); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
  }
  function streaks(t, C, W, H) {
    const cols = C.dark ? ['rgba(255,255,255,.13)', 'rgba(255,255,255,.09)', 'rgba(255,255,255,.07)'] : ['rgba(50,180,175,.35)', 'rgba(215,73,73,.28)', 'rgba(19,41,60,.10)'];
    const ys = [.1, .86, .93], sp = [150, 95, 210], len = [620, 430, 800];
    ctx.save();
    for (let j = 0; j < 3; j++) {
      const span = W + 1600, x = W + 400 - ((([.2, .55, .85][j] * span + t * sp[j] * W / 1080) % span) + span) % span;
      ctx.save(); ctx.translate(x, ys[j] * H); ctx.rotate(-12 * Math.PI / 180);
      ctx.fillStyle = cols[j]; ctx.fillRect(0, 0, len[j] * W / 1080, 16 * W / 1080); ctx.restore();
    }
    ctx.restore();
  }
  function drawPip(set, t, x, y, s, extra) {
    if (!set) return;
    const ph = Math.floor(((t / .6) % 1) * PHASES) % PHASES;
    let img = set.frames[ph];
    if (!set.happy && (t % 3.4) > 3.22) img = set.blink || img;
    if (!img) return;
    const bob = Math.sin(t * Math.PI) * s * .012;
    ctx.save();
    ctx.translate(x + s / 2, y + s * .92 + bob);
    const sq = extra || 0;
    ctx.scale(1 + sq, 1 - sq);
    ctx.drawImage(img, -s / 2, -s * .92, s, s);
    ctx.restore();
  }
  function textLines(lines, x, y, size, font, colour, align, t, at, step) {
    lines.forEach((ln, i) => {
      const r = arrive(t, at + i * (step || 0));
      if (!r) return;
      ctx.save(); ctx.globalAlpha = r.a; ctx.font = font.replace('$', size); ctx.fillStyle = colour; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
      ctx.fillText(ln, x, y + i * size * (font.startsWith('800') ? 1.02 : 1.22) + size * .85 + (1 - r.k) * size * .4);
      ctx.restore();
    });
  }

  function drawMain(t, L, C) {
    const W = L.W, H = L.H, ink = C.ink, accent = C.dark ? '#FFFFFF' : '#23908C';
    const xText = L.align === 'left' ? L.region.x : W / 2;
    // Pip: flies in, lands at 1.5 s with a squash, then acts in the chosen pose
    const P = L.pipBox, land = 1.5;
    if (C.dark) {
      const r = arrive(t, 1.2);
      if (r) {
        ctx.save(); ctx.translate(P.x + P.s / 2, P.y + P.s / 2); ctx.rotate(-3 * Math.PI / 180); ctx.scale(r.k, r.k);
        const fs = P.s * 1.02, off = P.s * .045;
        ctx.fillStyle = 'rgba(16,32,47,.32)'; ctx.fillRect(-fs / 2 + off, -fs / 2 + off, fs, fs);
        ctx.fillStyle = '#F8F4EA'; ctx.fillRect(-fs / 2, -fs / 2, fs, fs);
        ctx.restore();
      }
    }
    if (t < land) {
      const p = out3(t / land), x = P.x - (1 - p) * (P.x + P.s * 1.3), y = P.y - Math.sin(p * Math.PI) * P.s * .25 + (1 - p) * P.s * .15;
      if (A.fly) { ctx.save(); ctx.translate(x + P.s / 2, y + P.s / 2); ctx.rotate((1 - p) * -8 * Math.PI / 180); ctx.drawImage(A.fly, -P.s / 2, -P.s / 2, P.s, P.s); ctx.restore(); }
    } else {
      const d = t - land, sq = Math.exp(-7 * d) * Math.cos(TAU * 3 * d) * .14;
      drawPip(A.pose, t, P.x, P.y, P.s, sq);
    }
    // words
    let y = L.split ? L.textY : L.textY;
    const align = L.align === 'left' ? 'left' : 'center';
    textLines(L.head, xText, y, L.hs, '800 $px ' + FD, ink, align, t, 1.7, .12);
    y += L.head.length * L.hs * 1.02;
    if (L.sub.length) { y += L.hs * .22; textLines(L.sub, xText, y, L.ss, '600 $px ' + FU, C.dark ? ink : '#23908C', align, t, 2.4, .1); y += L.sub.length * L.ss * 1.22; }
    if (L.split) y = L.restY;
    if (L.tk.length) {
      y += L.split ? 0 : L.hs * .3;
      const widest = Math.max(...L.tk.map((lines) => Math.max(...lines.map((ln) => { ctx.font = '800 ' + L.ts + 'px ' + FD; return ctx.measureText(ln).width; }))));
      const bx = align === 'left' ? xText : W / 2 - (widest + L.ts * 1.3) / 2;
      L.tk.forEach((lines, i) => {
        const r = arrive(t, 3 + i * .5);
        const h = lines.length * L.ts * 1.16;
        if (r) {
          ctx.save(); ctx.globalAlpha = r.a; ctx.translate((1 - r.k) * L.ts * 2, 0);
          const b = L.ts * .9, by = y + (L.ts * 1.16 - b) / 2;
          ctx.fillStyle = C.dark ? '#FFFFFF' : '#13293C'; ctx.fillRect(bx, by, b, b);
          ctx.strokeStyle = C.dark ? '#13293C' : '#FFFFFF'; ctx.lineWidth = b * .14; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
          ctx.beginPath(); ctx.moveTo(bx + b * .2, by + b * .52); ctx.lineTo(bx + b * .42, by + b * .74); ctx.lineTo(bx + b * .8, by + b * .27); ctx.stroke();
          ctx.font = '800 ' + L.ts + 'px ' + FD; ctx.fillStyle = ink; ctx.textAlign = 'left';
          lines.forEach((ln, j) => ctx.fillText(ln, bx + L.ts * 1.3, y + j * L.ts * 1.16 + L.ts * .88));
          ctx.restore();
        }
        y += h + L.ts * .36;
      });
    }
    if (S.label) {
      y += L.hs * .34;
      const r = arrive(t, S.format === 'poster' ? 3 : 4.4);
      if (r) {
        ctx.save(); ctx.globalAlpha = r.a;
        ctx.font = '800 ' + L.ls + 'px ' + FD;
        const tw = ctx.measureText(S.label).width, bw = tw + L.ls * 1.6, bh = L.ls * 1.75;
        const bx = align === 'left' ? xText : W / 2 - bw / 2;
        ctx.translate(bx + bw / 2, y + bh / 2); ctx.scale(.6 + .4 * r.k, .6 + .4 * r.k); ctx.translate(-(bx + bw / 2), -(y + bh / 2));
        slantBox(bx, y, bw, bh, C.dark ? '#FFFFFF' : (S.colour === 'yellow' ? '#13293C' : '#FFC23A'));
        ctx.fillStyle = (!C.dark && S.colour === 'yellow') ? '#FFFFFF' : '#13293C';
        ctx.textAlign = 'center'; ctx.fillText(S.label, bx + bw / 2, y + bh * .7);
        ctx.restore();
      }
    }
    // poster: logo at the top and a navy band with the web address at the bottom
    if (S.format === 'poster') {
      if (A.logo) { const lw = 820, lh = lw * A.logo.height / A.logo.width; ctx.drawImage(A.logo, 180, 130, lw, lh); }
      ctx.fillStyle = '#13293C'; ctx.fillRect(0, H - 420, W, 420);
      ctx.fillStyle = '#FFFFFF'; ctx.font = '800 120px ' + FD; ctx.textAlign = 'left'; ctx.fillText('Every UK airshow, one easy guide', 180, H - 255);
      ctx.fillStyle = '#FFC23A'; ctx.font = '800 96px ' + FD; ctx.fillText('ukairshowguide.co.uk', 180, H - 120);
    }
  }

  function drawEnd(t, L) {
    const W = L.W, H = L.H, k = L.k;
    ctx.fillStyle = '#F8F4EA'; ctx.fillRect(0, 0, W, H);
    streaks(t, { dark: false }, W, H);
    const wide = S.format === 'wide';
    const ps = wide ? 600 : S.format === 'tall' ? 600 : 400;
    const px = wide ? 160 : (W - ps) / 2, py = wide ? (H - ps) / 2 : S.format === 'tall' ? 330 : 90;
    drawPip(A.hello, t, px, py, ps, 0);
    const cx = wide ? 860 : 80, cw = wide ? 960 : W - 160, align = wide ? 'left' : 'center', tx = wide ? cx : W / 2;
    let y = wide ? 300 : py + ps + 40;
    const r1 = arrive(t, 5.9);
    if (r1 && A.logo) {
      const lw = wide ? 700 : 680, lh = lw * A.logo.height / A.logo.width, lx = wide ? cx : (W - lw) / 2;
      ctx.save(); ctx.globalAlpha = r1.a; ctx.drawImage(A.logo, lx, y + (1 - r1.k) * 40, lw, lh); ctx.restore();
      y += lh + 40;
    } else y += (wide ? 700 : 680) * .33 + 40;
    const r2 = arrive(t, 6.4);
    if (r2) {
      ctx.save(); ctx.globalAlpha = r2.a; ctx.font = '800 ' + (wide ? 86 : 78) + 'px ' + FD; ctx.textBaseline = 'alphabetic';
      const parts = [['Plan. ', '#23908C'], ['Inform. ', '#1F4E8C'], ['Prepare.', '#D74949']];
      const total = parts.reduce((a, p) => a + ctx.measureText(p[0]).width, 0);
      let x = align === 'left' ? tx : tx - total / 2;
      parts.forEach((p) => { ctx.fillStyle = p[1]; ctx.textAlign = 'left'; ctx.fillText(p[0], x, y + 70 + (1 - r2.k) * 30); x += ctx.measureText(p[0]).width; });
      ctx.restore();
    }
    y += 110;
    textLines(['ukairshowguide.co.uk'], tx, y, wide ? 62 : 58, '800 $px ' + FD, '#13293C', align, t, 6.9, 0);
  }

  function draw(t, still) {
    const F = FORMATS[S.format];
    if (cv.width !== F.w || cv.height !== F.h) { cv.width = F.w; cv.height = F.h; }
    const L = layout(), C = COLOURS[S.colour] || COLOURS.navy;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, L.W, L.H);
    streaks(t, C, L.W, L.H);
    drawMain(t, L, C);
    if (!still && F.video && t > 5.5) {
      // a slanted straight edge sweeps the end card in
      const p = ease((t - 5.5) / .6), sl = L.H * .3, x = p * (L.W + sl);
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, 0); ctx.lineTo(x - sl, L.H); ctx.lineTo(0, L.H); ctx.closePath(); ctx.clip();
      drawEnd(t, L); ctx.restore();
    }
  }
  const STILL_T = 5.2;
  const drawStill = () => draw(STILL_T, true);

  // ---------------------------------------------------------------- the form
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function buttons(el, obj, key, label, extra) {
    el.innerHTML = Object.keys(obj).map((id) => '<button type="button" class="' + (extra ? extra(id).cls : 'opt') + '" data-v="' + id + '" aria-pressed="false"' + (extra ? extra(id).attr : '') + '>' + label(id) + '</button>').join('');
    el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; S[key] = b.dataset.v; changed(key); });
  }
  function syncPressed() {
    [['formats', 'format'], ['poses', 'pose'], ['colours', 'colour']].forEach(([id, key]) => {
      $(id).querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === S[key])));
    });
    $('saveVid').disabled = !FORMATS[S.format].video;
    $('play').disabled = !FORMATS[S.format].video;
  }
  function fillInputs() { ['headline', 'sub', 'ticks', 'label'].forEach((k) => { $(k).value = S[k] || ''; }); $('sound').checked = S.sound !== false; }
  function remember() { try { localStorage.setItem('pip-studio', JSON.stringify(S)); } catch (e) {} }
  async function changed(key) {
    if (key === 'pose') A.pose = await getPose(S.pose);
    syncPressed(); remember(); stopPlay(); drawStill();
    status('');
  }
  function status(msg) { $('status').textContent = msg; }

  // ---------------------------------------------------------------- play, save picture, save video
  let raf = 0, audioCtx = null, musicBuf = null, playing = null;
  async function music() {
    if (musicBuf) return musicBuf;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const r = await fetch('assets/music.mp3'); musicBuf = await audioCtx.decodeAudioData(await r.arrayBuffer());
    } catch (e) { musicBuf = null; }
    return musicBuf;
  }
  function stopPlay() { cancelAnimationFrame(raf); raf = 0; if (playing) { try { playing.stop(); } catch (e) {} playing = null; } }
  async function play(dest) {
    stopPlay();
    let src = null;
    if (S.sound !== false) {
      const buf = await music();
      if (buf && audioCtx) {
        await audioCtx.resume();
        src = audioCtx.createBufferSource(); src.buffer = buf; src.connect(audioCtx.destination); if (dest) src.connect(dest);
        playing = src;
      }
    }
    return new Promise((done) => {
      const t0 = performance.now();
      if (src) src.start();
      const loop = (now) => {
        const t = (now - t0) / 1000;
        if (t >= DUR) { draw(DUR - .001); raf = 0; done(); return; }
        draw(t); raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
  }
  let downloads = null;
  if (window.claude && typeof window.claude.use === 'function') window.claude.use('downloads').then((d) => { downloads = d; }).catch(() => {});
  async function saveFile(name, blob) {
    if (downloads) {
      try { await downloads.save({ filename: name, data: blob }); status('Saved: ' + name); }
      catch (e) { status(e && e.code === 'declined' ? 'Not saved.' : 'Could not save here (' + (e && e.message || 'unknown') + ').'); }
      return;
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    status('Saved: ' + name);
  }
  const slug = () => ('pip-' + (S.headline || 'design')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '-' + S.format;
  async function savePicture() {
    stopPlay(); drawStill();
    const blob = await new Promise((ok) => cv.toBlob(ok, 'image/png'));
    if (blob) saveFile(slug() + '.png', blob);
  }
  async function saveVideo() {
    if (!window.MediaRecorder || !cv.captureStream) { status('This browser cannot make videos. Try Chrome on a computer.'); return; }
    const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
    const type = types.find((x) => MediaRecorder.isTypeSupported(x));
    if (!type) { status('This browser cannot make videos. Try Chrome on a computer.'); return; }
    $('saveVid').disabled = true; $('play').disabled = true;
    status('Making your video. It takes 8 seconds, so keep this tab open.');
    const stream = cv.captureStream(FPS);
    let dest = null;
    if (S.sound !== false && await music() && audioCtx) { dest = audioCtx.createMediaStreamDestination(); dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr)); }
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8e6 });
    const chunks = []; rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise((ok) => { rec.onstop = ok; });
    rec.start(250);
    await play(dest);
    await new Promise((ok) => setTimeout(ok, 120));
    rec.stop(); await stopped;
    stream.getTracks().forEach((tr) => tr.stop());
    const ext = type.startsWith('video/mp4') ? 'mp4' : 'webm';
    await saveFile(slug() + '.' + ext, new Blob(chunks, { type: type.split(';')[0] }));
    if (ext === 'webm') status($('status').textContent + ' This browser made a WebM file; Instagram needs MP4, so use Chrome or Safari for Instagram.');
    syncPressed();
  }

  // ---------------------------------------------------------------- start up
  async function boot() {
    $('hpip').innerHTML = M.svg({ pose: 'hello', title: '' });
    $('hpip').firstChild.setAttribute('width', '64');
    buttons($('starters'), STARTERS, '_starter', (id) => esc(STARTERS[id].name));
    $('starters').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const st = STARTERS[b.dataset.v]; ['pose', 'colour', 'headline', 'sub', 'ticks', 'label'].forEach((k) => { S[k] = st[k]; });
      fillInputs(); changed('pose');
    });
    buttons($('formats'), FORMATS, 'format', (id) => esc(FORMATS[id].name));
    buttons($('poses'), POSES, 'pose', (id) => M.svg({ pose: id, title: '' }) + esc(POSES[id]));
    buttons($('colours'), COLOURS, 'colour', () => '', (id) => ({ cls: 'sw', attr: ' style="background:' + COLOURS[id].bg + '" aria-label="' + esc(COLOURS[id].name) + '" title="' + esc(COLOURS[id].name) + '"' }));
    ['headline', 'sub', 'ticks', 'label'].forEach((k) => $(k).addEventListener('input', () => { S[k] = $(k).value; changed(k); }));
    $('sound').addEventListener('change', () => { S.sound = $('sound').checked; remember(); });
    $('play').addEventListener('click', () => { status('Playing'); play().then(() => { status(''); setTimeout(drawStill, 900); }); });
    $('savePic').addEventListener('click', savePicture);
    $('saveVid').addEventListener('click', saveVideo);
    fillInputs();
    await Promise.all([document.fonts.load('800 40px PipDisplay'), document.fonts.load('600 40px PipUI')]).catch(() => {});
    const [logo, hello, fly, pose] = await Promise.all([loadImg('assets/logo.png'), getPose('hello'), pipImg({ pose: 'fly', spin: true }), getPose(S.pose)]);
    A = { logo, hello, fly, pose };
    syncPressed(); drawStill();
    window.READY = true;
  }
  // for the offline renderer: window.studio({...settings}) then window.seek(t)
  window.studio = async (cfg) => { Object.assign(S, cfg); A.pose = await getPose(S.pose); fillInputs(); syncPressed(); drawStill(); };
  window.seek = (t) => draw(t);
  window.STUDIO = { DUR, FPS, FORMATS };
  boot();
}
