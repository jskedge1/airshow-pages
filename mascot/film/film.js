// "Meet Pip": a cartoon that is a pure function of time. window.seek(t) paints second t.
// Every line of copy comes from the Pip brand book (mascot/brand.html). Scenes change on the
// bar lines of the 120 bpm music (every 2 seconds). node render.js makes the video files.
(function () {
  var q = new URLSearchParams(location.search);
  var PORT = q.get('format') === '9x16', RENDER = q.get('render') === '1';
  var W = PORT ? 1080 : 1920, H = PORT ? 1920 : 1080, FPS = 30, DUR = 66;
  var M = UKAGMascot, TAU = Math.PI * 2;
  var C = { cream: '#F8F4EA', navy: '#13293C', plan: '#23908C', inform: '#1F4E8C', prepare: '#D74949', yellow: '#FFC23A' };
  var stage = document.getElementById('stage');
  stage.style.setProperty('--W', W + 'px'); stage.style.setProperty('--H', H + 'px');
  document.body.classList.add(PORT ? 'port' : 'land'); if (RENDER) document.body.classList.add('render');

  var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
  var ease = function (t) { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var out3 = function (t) { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
  function spring(t, k, c) {
    if (t <= 0) return 0; k = k || 260; c = c || 15;
    var w0 = Math.sqrt(k), z = c / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }
  var PIPBOX = '<div class="pipwrap"><div class="disc"></div><div class="pipbox"></div></div>';
  var strap = '<i style="color:#23908C">Plan.</i> <i style="color:#1F4E8C">Inform.</i> <i style="color:#D74949">Prepare.</i>';
  var wave = function (lt) { return -46 + 13 * Math.sin(lt * TAU * 2); };

  // Each scene: start second, background, markup, and Pip's acting as a function of local time.
  // data-at = seconds after the scene starts that an element arrives. data-fx = how it arrives.
  var SCENES = [
    { t0: 0, bg: C.cream, html: PIPBOX + '<div class="copy"><h1 data-at="1.7">Meet Pip</h1><p data-at="2.5" data-fx="up">Your airshow guide</p><img class="logo" data-at="3.5" data-fx="up" src="../../brand/UK-Airshow-Guide-logo-transparent.png" style="width:480px;margin-top:34px"></div>',
      pip: function (lt) {
        var box = '-40 0 480 400';
        if (lt < 1.5) { var p = out3(lt / 1.5); return { o: { pose: 'fly', box: box }, x: -(1 - p) * W * 1.1, y: -Math.sin(p * Math.PI) * 160 + (1 - p) * 120, rot: (1 - p) * -8 }; }
        var s = lt - 1.5, sq = Math.exp(-7 * s) * Math.cos(TAU * 3 * s) * .16;
        return { o: { pose: 'hello', box: box, right: wave(lt) }, sx: 1 + sq, sy: 1 - sq };
      } },
    { t0: 6, bg: C.navy, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Who is Pip?</h2><p data-at="1" data-fx="up">A small, round propeller plane.</p><div class="chips"><span class="chip c1" data-at="1.9">Curious</span><span class="chip c2" data-at="2.5">Helpful</span><span class="chip c3" data-at="3.1">Calm</span><span class="chip c4" data-at="3.7">Cheerful</span></div><p data-at="4.5" data-fx="up">Pip watches from the crowd line, just like you.</p></div>',
      pip: function (lt) {
        if (lt < 1.9) return { o: { pose: 'rest' } };
        if (lt < 2.5) return { o: { eyes: 'wide', look: [6, -7], mouth: 'o', left: 4, right: -14 }, pop: 1.9 };
        if (lt < 3.1) return { o: { pose: 'point' }, pop: 2.5 };
        if (lt < 3.7) return { o: { eyes: 'happy', left: 22, right: 22 }, pop: 3.1 };
        if (lt < 4.5) return { o: { pose: 'cheer' }, pop: 3.7 };
        return { o: { pose: 'hello', right: wave(lt) }, pop: 4.5 };
      } },
    { t0: 12, bg: C.cream, id: 's3', html: '<h2 data-at=".3" style="text-align:center;margin:0">What does PIP stand for?</h2><div class="row"><div class="letters"><div><b data-at="1" data-fx="drop" style="color:#23908C">P</b><span data-at="2.5" style="color:#23908C">Plan.</span></div><div><b data-at="1.5" data-fx="drop" style="color:#1F4E8C">I</b><span data-at="2.8" style="color:#1F4E8C">Inform.</span></div><div><b data-at="2" data-fx="drop" style="color:#D74949">P</b><span data-at="3.1" style="color:#D74949">Prepare.</span></div></div>' + PIPBOX + '</div>',
      pip: function (lt) { return lt < 2.5 ? { o: { eyes: 'wide', look: PORT ? [0, -8] : [-8, -3], mouth: 'o', left: 10, right: 10 } } : { o: { pose: 'cheer' }, pop: 2.5 }; } },
    { t0: 16, bg: C.plan, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4"><span class="big">P</span>is for Plan</h2><p data-at="1.2" data-fx="up">Picking your show, booking tickets and parking, and working out your day.</p><span class="pill" data-at="3">Plan it with Pip</span></div>',
      pip: function (lt) { var k = Math.sin(lt * TAU / 3); return { o: { pose: 'map', look: k > 0 ? [-7, -3] : [3, 2], left: -24 + 4 * Math.sin(lt * TAU / 1.5) } }; } },
    { t0: 22, bg: C.inform, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4"><span class="big">I</span>is for Inform</h2><p data-at="1.2" data-fx="up">The facts you need: dates, the line-up, getting there and the rules on site.</p><span class="pill" data-at="3">Pip explains</span></div>',
      pip: function (lt) { return { o: { pose: 'point', right: -8 + 7 * Math.sin(lt * TAU), look: [7, Math.sin(lt * TAU / 2) * 2] } }; } },
    { t0: 28, bg: C.prepare, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4"><span class="big">P</span>is for Prepare</h2><p data-at="1.2" data-fx="up">What to pack, protecting little ears, the weather and getting home.</p><span class="pill" data-at="3">Pack it, Pip!</span></div>',
      pip: function (lt) {
        var box = '-35 -80 470 440';
        if (lt < 2.6) return { o: { pose: 'sun', box: box } };
        if (lt < 5.2) return { o: { pose: 'rain', box: box }, pop: 2.6 };
        return { o: { pose: 'loud', box: box }, pop: 5.2 };
      } },
    { t0: 36, bg: C.cream, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Who is Pip for?</h2><div class="cards"><div class="card" style="--c:#23908C" data-at="1.1" data-fx="left"><b>Families with young children</b><span>A long, loud day made friendly</span></div><div class="card" style="--c:#1F4E8C" data-at="1.9" data-fx="left"><b>First timers</b><span>Your first airshow, step by step</span></div><div class="card" style="--c:#D74949" data-at="2.7" data-fx="left"><b>Regulars and enthusiasts</b><span>A lighter touch, with the facts up front</span></div></div></div>',
      pip: function (lt) { return lt < 3.4 ? { o: { pose: 'hello', right: wave(lt) } } : { o: { pose: 'cheer' }, pop: 3.4 }; } },
    { t0: 42, bg: C.navy, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4">How does Pip work?</h2><p data-at="1.2" data-fx="up">Jack writes every tip and every fact.</p><p data-at="2.6" data-fx="up">Pip is the friendly face who helps you find them.</p><span class="pill" data-at="4" style="background:#FFC23A">Friendly face, trusted voice</span></div>',
      pip: function (lt) { return { o: { pose: 'tip', right: -28 + 5 * Math.sin(lt * TAU / 1.2) } }; } },
    { t0: 48, bg: C.cream, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Where will you see Pip?</h2><div class="chips"><span class="chip c1" data-at="1.1">Cartoons and trailers</span><span class="chip c2" data-at="1.6">Social posts</span><span class="chip c3" data-at="2.1">Kids’ Corner</span><span class="chip c4" data-at="2.6">Spotter missions</span><span class="chip" data-at="3.1">Checklists to print</span></div><p data-at="4" data-fx="up">Pip appears where a smile helps.</p></div>',
      pip: function (lt) { return { o: { pose: 'photo', eyes: (lt % 2) > 1.7 ? 'happy' : 'wink' }, pop: lt > 1.7 ? Math.floor((lt - 1.7) / 2) * 2 + 1.7 : null, popAmp: .05 }; } },
    { t0: 54, bg: C.yellow, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Pip’s ear defender promise</h2><p class="quote" data-at="1.4">“When it gets loud, my ear defenders go on.”</p><p data-at="3.2" data-fx="up">Little ears need looking after.</p></div>',
      pip: function (lt) { return { o: { pose: 'loud' } }; } },
    { t0: 60, bg: C.cream, html: PIPBOX + '<div class="copy"><img class="logo" data-at=".4" src="../../brand/UK-Airshow-Guide-logo-transparent.png"><div class="strap" data-at="1.1">' + strap + '</div><p class="url" data-at="2" data-fx="up">ukairshowguide.co.uk</p></div>',
      pip: function (lt) { return { o: { pose: 'hello', right: wave(lt) } }; } }
  ];

  var hits = [];
  SCENES.forEach(function (s, i) {
    var el = document.createElement('div');
    el.className = 'scene' + (s.dark ? ' dark' : ''); el.id = s.id || 's' + (i + 1);
    el.style.background = s.bg; el.style.zIndex = i + 1; el.innerHTML = '<div class="sky"><i class="cloud"></i><i class="cloud"></i><i class="cloud"></i></div>' + s.html;
    s.clouds = [].slice.call(el.querySelectorAll('.cloud'));
    stage.appendChild(el);
    s.el = el; s.box = el.querySelector('.pipbox'); s.wrap = el.querySelector('.pipwrap');
    s.items = [].slice.call(el.querySelectorAll('[data-at]')).map(function (e) { return { e: e, at: +e.dataset.at, fx: e.dataset.fx || 'pop' }; });
    s.t1 = i + 1 < SCENES.length ? SCENES[i + 1].t0 : DUR;
    if (i) hits.push([s.t0, 'whoosh']);
    s.items.forEach(function (it) { hits.push([+(s.t0 + it.at).toFixed(2), it.fx === 'drop' ? 'thud' : it.fx === 'pop' ? 'pop' : 'tick']); });
  });
  hits.push([0, 'fly'], [1.5, 'boing']);
  window.HITS = hits.sort(function (a, b) { return a[0] - b[0]; });
  window.FILM = { w: W, h: H, fps: FPS, duration: DUR };

  var WIPE = 0.6, DIAG = Math.sqrt(W * W + H * H);
  window.seek = function (t) {
    SCENES.forEach(function (s, i) {
      var lt = t - s.t0, on = lt >= 0 && t < s.t1 + WIPE;
      s.el.style.visibility = on ? 'visible' : 'hidden';
      if (!on) return;
      // a circle opens from the middle of the frame to bring each new scene in
      s.el.style.clipPath = i && lt < WIPE ? 'circle(' + (ease(lt / WIPE) * DIAG * .56).toFixed(1) + 'px at 50% 50%)' : 'none';
      s.items.forEach(function (it) {
        var d = lt - it.at, st = it.e.style;
        if (d <= 0) { st.opacity = 0; return; }
        st.opacity = Math.min(1, d / .12).toFixed(3);
        var k = spring(d, it.fx === 'drop' ? 200 : 260, it.fx === 'drop' ? 11 : 16);
        st.transform = it.fx === 'drop' ? 'translateY(' + (-(1 - k) * 520).toFixed(1) + 'px)'
          : it.fx === 'up' ? 'translateY(' + ((1 - k) * 46).toFixed(1) + 'px)'
          : it.fx === 'left' ? 'translateX(' + ((1 - k) * 160).toFixed(1) + 'px)'
          : 'scale(' + (.6 + .4 * k).toFixed(4) + ')';
      });
      // three clouds drift slowly across every scene so the frame is never still
      s.clouds.forEach(function (c, j) {
        var sp = [38, 24, 52][j], y = [.07, .78, .5][j] * H, sc = [1, .7, .5][j], span = W + 700;
        var x = ((([.15, .6, .9][j] * span + i * 310 + t * sp) % span) + span) % span - 400;
        c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(0) + 'px) scale(' + sc + ')';
      });
      var a = s.pip(lt), o = a.o, bob = Math.sin(lt * TAU / 2) * 9;
      o.title = '';
      // blink every few seconds unless the pose already has closed, happy eyes
      var base = M.svg({ pose: o.pose }), happy = o.eyes === 'happy' || (!o.eyes && /hello|cheer|loud|sun|fly/.test(o.pose || ''));
      if (!happy && !o.eyes && (lt % 3.4) > 3.22) o.eyes = 'happy';
      if (o.prop == null && !/loud|loading|fly/.test(o.pose || '')) o.prop = -10 + 5 * Math.sin(lt * TAU / 1.3);
      s.box.innerHTML = M.svg(o);
      var sx = a.sx || 1, sy = a.sy || 1;
      if (a.pop != null) { var pd = lt - a.pop, w = Math.exp(-8 * pd) * Math.cos(TAU * 3.2 * pd) * (a.popAmp || .12); if (pd >= 0) { sx += w; sy -= w; } }
      s.box.style.transformOrigin = '50% 92%';
      s.box.style.transform = 'translate(' + (a.x || 0).toFixed(1) + 'px,' + ((a.y || 0) + (a.x ? 0 : bob)).toFixed(1) + 'px) rotate(' + (a.rot || 0).toFixed(2) + 'deg) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
    });
  };

  document.fonts.ready.then(function () {
    var imgs = [].slice.call(document.images);
    Promise.all(imgs.map(function (im) { return im.decode().catch(function () {}); })).then(function () {
      seek(0); window.READY = true;
      if (RENDER) return;
      var fit = function () { stage.style.transform = 'scale(' + Math.min(innerWidth / W, innerHeight / H) + ')'; };
      fit(); addEventListener('resize', fit);
      var t = +(q.get('t') || 0), play = !q.get('t'), last = performance.now();
      (function loop(now) { if (play) { t = (t + (now - last) / 1000) % DUR; seek(t); } last = now; requestAnimationFrame(loop); })(last);
      addEventListener('keydown', function (e) {
        if (e.key === ' ') play = !play;
        if (e.key === 'ArrowRight') { t = Math.min(DUR, t + .5); seek(t); }
        if (e.key === 'ArrowLeft') { t = Math.max(0, t - .5); seek(t); }
      });
    });
  });
})();
