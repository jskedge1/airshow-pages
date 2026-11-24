// The Pip cartoons (the full promo and a 16 second teaser, ?film=teaser): pure functions of time. window.seek(t) paints second t.
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
  var FILMNAME = q.get('film') === 'teaser' ? 'teaser' : 'promo';
  var PIPBOX = '<div class="pipwrap"><div class="panel"></div><div class="pipbox"></div></div>';
  var LOGO = '../../brand/uk-airshow-guide-swoosh-badge.png'; // the video end logo (see CLAUDE.md)
  var strap = '<i style="color:#23908C">Plan.</i> <i style="color:#1F4E8C">Inform.</i> <i style="color:#D74949">Prepare.</i>';
  var wave = function (lt) { return -46 + 13 * Math.sin(lt * TAU * 2); };
  // a square tick box, drawn with straight lines only
  var TICK = '<svg viewBox="0 0 70 70"><rect x="4" y="4" width="62" height="62" fill="#fff"/><path d="M16 36l13 13 26-30" fill="none" stroke="#13293C" stroke-width="9" stroke-linecap="square" stroke-linejoin="miter"/></svg>';
  var ticks = function (items, t0) { return '<ul class="ticks">' + items.map(function (x, i) { return '<li data-at="' + (t0 + i * .7).toFixed(1) + '" data-fx="left">' + TICK + '<span>' + x + '</span></li>'; }).join('') + '</ul>'; };
  var flyIn = function (lt, then) {
    var box = '-40 0 480 400';
    if (lt < 1.5) { var p = out3(lt / 1.5); return { o: { pose: 'fly', box: box }, x: -(1 - p) * W * 1.1, y: -Math.sin(p * Math.PI) * 160 + (1 - p) * 120, rot: (1 - p) * -8 }; }
    var s = lt - 1.5, sq = Math.exp(-7 * s) * Math.cos(TAU * 3 * s) * .16;
    return { o: { pose: 'hello', box: box, right: wave(lt) }, sx: 1 + sq, sy: 1 - sq };
  };
  var END = function (t0) { return { t0: t0, bg: C.cream, id: 'send', html: PIPBOX + '<div class="copy"><img class="logo" data-at=".4" src="' + LOGO + '"><div class="strap" data-at="1.1">' + strap + '</div><p class="handles" data-at="1.9" data-fx="up">Find Pip on Instagram, Facebook and YouTube</p><p class="url" data-at="2.6" data-fx="up">ukairshowguide.co.uk</p></div>',
    pip: function (lt) { return { o: { pose: 'hello', right: wave(lt) } }; } }; };

  // Each scene: start second, background, markup, and Pip's acting as a function of local time.
  // data-at = seconds after the scene starts that an element arrives. data-fx = how it arrives.
  var PROMO = [
    { t0: 0, bg: C.cream, id: 's1', html: PIPBOX + '<div class="copy"><h1 data-at="1.7">See Pip?</h1><p class="sub2" data-at="2.9">It must be airshow season.</p></div>', pip: flyIn },
    { t0: 6, bg: C.navy, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Meet Pip</h2><p data-at="1" data-fx="up">The mascot of The Big Guide to UK Airshows.</p><div class="chips"><span class="chip c1" data-at="1.9">Curious</span><span class="chip c2" data-at="2.5">Helpful</span><span class="chip c3" data-at="3.1">Calm</span><span class="chip c4" data-at="3.7">Cheerful</span></div><p data-at="4.5" data-fx="up">Every UK airshow, one easy guide. Now with a friendly face.</p></div>',
      pip: function (lt) {
        if (lt < 1.9) return { o: { pose: 'rest' } };
        if (lt < 2.5) return { o: { eyes: 'wide', look: [6, -7], mouth: 'o', left: 4, right: -14 }, pop: 1.9 };
        if (lt < 3.1) return { o: { pose: 'point' }, pop: 2.5 };
        if (lt < 3.7) return { o: { eyes: 'happy', left: 22, right: 22 }, pop: 3.1 };
        if (lt < 4.5) return { o: { pose: 'cheer' }, pop: 3.7 };
        return { o: { pose: 'hello', right: wave(lt) }, pop: 4.5 };
      } },
    { t0: 12, bg: C.cream, id: 'sletters', html: '<h2 data-at=".3" style="text-align:center;margin:0">PIP stands for</h2><div class="row"><div class="letters"><div><b data-at="1" data-fx="drop" style="color:#23908C">P</b><span data-at="2.5" style="color:#23908C">Plan.</span></div><div><b data-at="1.5" data-fx="drop" style="color:#1F4E8C">I</b><span data-at="2.8" style="color:#1F4E8C">Inform.</span></div><div><b data-at="2" data-fx="drop" style="color:#D74949">P</b><span data-at="3.1" style="color:#D74949">Prepare.</span></div></div>' + PIPBOX + '</div>',
      pip: function (lt) { return lt < 2.5 ? { o: { eyes: 'wide', look: PORT ? [0, -8] : [-8, -3], mouth: 'o', left: 10, right: 10 } } : { o: { pose: 'cheer' }, pop: 2.5 }; } },
    { t0: 16, bg: C.plan, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Pip helps you plan</h2>' + ticks(['Pick the right show for you', 'Sort your tickets and parking', 'Work out your day'], 1.2) + '<span class="pill" data-at="3.6">Plan it with Pip</span></div>',
      pip: function (lt) { var k = Math.sin(lt * TAU / 3); return { o: { pose: 'map', look: k > 0 ? [-7, -3] : [3, 2], left: -24 + 4 * Math.sin(lt * TAU / 1.5) } }; } },
    { t0: 22, bg: C.inform, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Pip keeps you informed</h2>' + ticks(['The dates and the line-up', 'How to get there', 'The rules on site'], 1.2) + '<span class="pill" data-at="3.6">Pip explains</span></div>',
      pip: function (lt) { return { o: { pose: 'point', right: -8 + 7 * Math.sin(lt * TAU), look: [7, Math.sin(lt * TAU / 2) * 2] } }; } },
    { t0: 28, bg: C.prepare, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Pip gets you ready</h2>' + ticks(['What to pack', 'Little ears protected', 'The weather and getting home'], 1.2) + '<span class="pill" data-at="3.6">Pack it, Pip!</span></div>',
      pip: function (lt) {
        var box = '-35 -80 470 440';
        if (lt < 2) return { o: { pose: 'sun', box: box } };
        if (lt < 4) return { o: { pose: 'rain', box: box }, pop: 2 };
        return { o: { pose: 'loud', box: box }, pop: 4 };
      } },
    { t0: 34, bg: C.cream, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Who is Pip for?</h2><div class="cards"><div class="card" style="--c:#23908C" data-at="1.1" data-fx="left"><b>Families with young children</b><span>A long, loud day made friendly</span></div><div class="card" style="--c:#1F4E8C" data-at="1.9" data-fx="left"><b>First timers</b><span>Your first airshow, step by step</span></div><div class="card" style="--c:#D74949" data-at="2.7" data-fx="left"><b>Regulars and enthusiasts</b><span>A lighter touch, with the facts up front</span></div></div></div>',
      pip: function (lt) { return lt < 3.4 ? { o: { pose: 'hello', right: wave(lt) } } : { o: { pose: 'cheer' }, pop: 3.4 }; } },
    { t0: 40, bg: C.navy, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Where will you see Pip?</h2><div class="where"><span class="chip first" data-at="1.2">Mostly on social media</span><span class="chip" data-at="2.4">In videos like this one</span><span class="chip" data-at="3.2">On posters</span><span class="chip" data-at="4">In a few spots on the website</span></div></div>',
      pip: function (lt) { return { o: { pose: 'photo', eyes: (lt % 2) > 1.7 ? 'happy' : 'wink' }, pop: lt > 1.7 ? Math.floor((lt - 1.7) / 2) * 2 + 1.7 : null, popAmp: .05 }; } },
    { t0: 48, bg: '#6950A1', dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".4">Noise and crowds a bit much?</h2><p data-at="1.6" data-fx="up">Pip will be with you in the calm airshow visit guide.</p><span class="pill" data-at="3.2">A calm airshow visit</span></div>',
      pip: function (lt) { return { o: { ears: true, eyes: 'happy', mouth: 'smile', left: 16 + 3 * Math.sin(lt * TAU / 4), right: 16 + 3 * Math.sin(lt * TAU / 4) } }; } },
    { t0: 54, bg: C.yellow, html: PIPBOX + '<div class="copy"><h2 data-at=".4">When your child spots Pip,</h2><p class="sub2" style="color:#13293C" data-at="1.8">they know it must be airshow season.</p></div>',
      pip: function (lt) { return lt < 1.8 ? { o: { pose: 'hello', right: wave(lt) } } : { o: { pose: 'cheer', left: -58 + 6 * Math.sin(lt * TAU * 2), right: -58 - 6 * Math.sin(lt * TAU * 2) }, pop: 1.8 }; } },
    END(60)
  ];
  var TEASER = [
    { t0: 0, bg: C.cream, id: 's1', html: PIPBOX + '<div class="copy"><h1 data-at="1.7">See Pip?</h1></div>', pip: flyIn },
    { t0: 4, bg: C.yellow, html: PIPBOX + '<div class="copy"><h2 data-at=".4">It must be airshow season.</h2></div>',
      pip: function (lt) { return { o: { pose: 'cheer', left: -58 + 6 * Math.sin(lt * TAU * 2), right: -58 - 6 * Math.sin(lt * TAU * 2) }, pop: .4 }; } },
    { t0: 8, bg: C.navy, dark: 1, html: PIPBOX + '<div class="copy"><h2 data-at=".3">Meet Pip, your airshow guide</h2><div class="chips"><span class="chip c1" data-at="1">Plan.</span><span class="chip c2" data-at="1.5">Inform.</span><span class="chip c3" data-at="2">Prepare.</span></div></div>',
      pip: function (lt) { return { o: { pose: 'tip', right: -28 + 5 * Math.sin(lt * TAU / 1.2) } }; } },
    END(12)
  ];
  var SCENES = FILMNAME === 'teaser' ? TEASER : PROMO;
  DUR = FILMNAME === 'teaser' ? 16 : 66;

  var hits = [];
  SCENES.forEach(function (s, i) {
    var el = document.createElement('div');
    el.className = 'scene' + (s.dark ? ' dark' : ''); el.id = s.id || 's' + (i + 1);
    el.style.background = s.bg; el.style.zIndex = i + 1; el.innerHTML = '<div class="sky"><i class="streak"></i><i class="streak"></i><i class="streak"></i></div>' + s.html;
    s.clouds = [].slice.call(el.querySelectorAll('.streak'));
    stage.appendChild(el);
    s.el = el; s.box = el.querySelector('.pipbox'); s.wrap = el.querySelector('.pipwrap');
    s.items = [].slice.call(el.querySelectorAll('[data-at]')).map(function (e) { return { e: e, at: +e.dataset.at, fx: e.dataset.fx || 'pop' }; });
    s.t1 = i + 1 < SCENES.length ? SCENES[i + 1].t0 : DUR;
    if (i) hits.push([s.t0, 'whoosh']);
    s.items.forEach(function (it) { hits.push([+(s.t0 + it.at).toFixed(2), it.fx === 'drop' ? 'thud' : it.fx === 'pop' ? 'pop' : 'tick']); });
  });
  hits.push([0, 'fly'], [1.5, 'boing']);
  window.HITS = hits.sort(function (a, b) { return a[0] - b[0]; });
  window.FILM = { w: W, h: H, fps: FPS, duration: DUR, name: FILMNAME };

  var WIPE = 0.6;
  window.seek = function (t) {
    SCENES.forEach(function (s, i) {
      var lt = t - s.t0, on = lt >= 0 && t < s.t1 + WIPE;
      s.el.style.visibility = on ? 'visible' : 'hidden';
      if (!on) return;
      // a slanted straight edge sweeps across to bring each new scene in
      if (i && lt < WIPE) { var sl = H * .3, x = ease(lt / WIPE) * (W + sl); s.el.style.clipPath = 'polygon(0 0,' + x.toFixed(1) + 'px 0,' + (x - sl).toFixed(1) + 'px 100%,0 100%)'; }
      else s.el.style.clipPath = 'none';
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
      // three straight speed lines cross every scene so the frame is never still
      s.clouds.forEach(function (c, j) {
        var sp = [150, 95, 210][j], y = [.10, .86, .93][j] * H, span = W + 1400;
        var x = W + 300 - ((([.2, .55, .85][j] * span + i * 310 + t * sp) % span) + span) % span;
        c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(0) + 'px) rotate(-12deg) scaleX(' + [1, .7, 1.3][j] + ')';
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
