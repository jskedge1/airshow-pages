/* Train page layouts A (tabs) and B (long page). The page's own sections are moved, never copied,
   so every button, board, map and live feed keeps working. window.LX_MODE is 'a' or 'b'. */
(function(){
  var MODE = window.LX_MODE || 'a', $ = function(i){ return document.getElementById(i); };
  var main = document.querySelector('main'), times = $('times'); if (!main || !times) return;
  var tw = times.querySelector('.wrap');
  function sec(nodes, id){
    var s = document.createElement('section'); s.className = 's lx-wrapsec'; if (id) s.id = id;
    var w = document.createElement('div'); w.className = 'wrap'; s.appendChild(w);
    nodes.forEach(function(n){ if (n) w.appendChild(n); }); return s;
  }
  /* 1. inside Pick your train: station, then day, direction and time, then the timetable */
  var pick = tw.querySelector('.pickcard'), ctl = tw.querySelector('.pickctl'), route = $('route'), strip = $('railstrip'), jl = tw.querySelector('.jline'), note = $('tnotice');
  var ttbar = tw.querySelector('.ttbar');
  if (pick && ctl) tw.insertBefore(ctl, pick.nextSibling);
  if (ctl) { var pin = ctl.querySelector('.pin'); if (pin) pin.style.counterReset = 'pk 1'; }
  if (route) { var rp = route.querySelector('.pin'); if (rp) rp.style.counterReset = 'pk 4'; }
  var journey = sec([strip, jl, route], 'lx-journey');
  var winter = note ? sec([note], 'lx-winter') : null;
  /* 2. four groups */
  var last = main.querySelector('section.s:not([id])');
  var G = [
    { k: 'plan', sh: 'Plan', t: 'Plan your train', s: 'Station, day and time', p: 'Pick where you’re starting from, the day and a train. Everything else on the page follows the train you pick.', els: [times] },
    { k: 'journey', sh: 'Journey', t: 'Your journey', s: 'Step by step, with the map', p: 'The train you picked, every station and change on the way, and how the day runs around it.', els: [journey, $('way'), $('roads'), $('bus')] },
    { k: 'station', sh: 'Station', t: 'Your station', s: 'Where to get off and the walk', p: 'Where I would get off for the show, what’s at the station and how to walk in.', els: [$('stop'), $('station-guide')] },
    { k: 'tips', sh: 'Tips', t: 'Tickets and tips', s: 'Costs, access and questions', p: 'My advice on tickets and paying less, plus quick answers to the things people ask me.', els: [$('travel'), $('pay'), $('know'), winter, last] }
  ];
  G.forEach(function(g, i){
    g.box = document.createElement('div'); g.box.className = 'lx-group'; g.box.id = 'lx-' + g.k + '-group';
    g.els.forEach(function(e){ if (e) g.box.appendChild(e); });
    main.appendChild(g.box); g.i = i;
  });
  function groupOf(el){ for (var i = 0; i < G.length; i++) if (G[i].box.contains(el)) return G[i]; return null; }
  function kick(){ window.dispatchEvent(new Event('resize')); }
  function sumText(){ var j = $('jlsum'); return j ? j.textContent : ''; }
  function watch(fn){ ['jlsum', 'sumbig', 'sumper', 'sumkv', 'buybtn'].forEach(function(i){ var e = $(i); if (e) new MutationObserver(fn).observe(e, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href'] }); }); fn(); }
  document.body.classList.add('lx-' + MODE);
  /* tall blocks (the station picker has 60 to 70 tiles) never get 15 per cent of themselves on a phone screen, so the page's
     own fade in never fires and they stay invisible. Show anything as soon as any part of it is on screen. */
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { threshold: 0 });
    [].forEach.call(document.querySelectorAll('.rise'), function(el){ rio.observe(el); });
  }

  if (MODE === 'a') {
    var bar = document.createElement('div'); bar.className = 'la-bar';
    bar.innerHTML = '<div class="la-tabs" role="tablist" aria-label="Plan your trip by train">' + G.map(function(g, i){
      return '<button class="la-tab" role="tab" id="la-t' + i + '" aria-controls="lx-' + g.k + '-group" aria-selected="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? -1 : 0) + '"><span class="n">' + (i + 1) + '</span><b><span class="lg">' + g.t + '</span><span class="sm" aria-hidden="true">' + g.sh + '</span></b><small>' + g.s + '</small></button>';
    }).join('') + '</div><div class="la-led"><div><span>Your train</span><em id="la-led"></em></div></div>';
    main.parentNode.insertBefore(bar, main);
    var tabs = [].slice.call(bar.querySelectorAll('.la-tab')), cur = 0;
    G.forEach(function(g, i){
      g.box.classList.add('la-panel'); g.box.setAttribute('role', 'tabpanel'); g.box.setAttribute('aria-labelledby', 'la-t' + i);
      var nx = G[i + 1], pv = G[i - 1], f = document.createElement('div'); f.className = 'la-next';
      f.innerHTML = (pv ? '<button type="button" class="back" data-go="' + (i - 1) + '"><i aria-hidden="true">←</i><span>Back<small>' + pv.t + '</small></span></button>' : '') +
        (nx ? '<button type="button" class="go" data-go="' + (i + 1) + '"><span>Next, ' + nx.t.charAt(0).toLowerCase() + nx.t.slice(1) + '<small>' + nx.s + '</small></span><i aria-hidden="true">→</i></button>' : '<button type="button" class="go" data-go="0"><span>Pick a different train<small>Back to the start</small></span><i aria-hidden="true">→</i></button>');
      g.box.appendChild(f);
    });
    /* the rail strip and Your journey line show on Plan your train as well as Your journey, so the changes are in view
       while you pick: the one strip moves to whichever of the two tabs is open */
    var jw = journey.querySelector('.wrap');
    function seat(i){
      if (!strip && !jl) return;
      if (i === 0) { /* just above step 1, Your station (Jack, 10 Nov 2026) */ var before = pick && pick.parentNode === tw ? pick : ctl && ctl.parentNode === tw ? ctl.nextSibling : null; [strip, jl].forEach(function(n){ if (n) tw.insertBefore(n, before); }); }
      else if (i === 1) { var first = jw.firstChild; [strip, jl].forEach(function(n){ if (n) jw.insertBefore(n, first); }); }
    }
    function show(i, target, quiet){
      cur = i; seat(i);
      G.forEach(function(g, k){ g.box.hidden = k !== i; tabs[k].setAttribute('aria-selected', k === i ? 'true' : 'false'); tabs[k].tabIndex = k === i ? 0 : -1; tabs[k].classList.toggle('done', k < i); });
      kick(); setTimeout(kick, 350);
      if (quiet) return;
      var y = target ? target.getBoundingClientRect().top + scrollY - bar.offsetHeight - 8 : bar.getBoundingClientRect().top + scrollY;
      scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ show(i); });
      t.addEventListener('keydown', function(e){ var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; var n = (i + d + tabs.length) % tabs.length; tabs[n].focus(); show(n); });
    });
    main.addEventListener('click', function(e){ var b = e.target.closest('.la-next button'); if (b) show(+b.getAttribute('data-go')); });
    /* links to a part of the page that sits in another tab open that tab first */
    function toHash(h, ev){
      if (!h || h.length < 2) return; var el; try { el = document.getElementById(decodeURIComponent(h.slice(1))); } catch (x) {} if (!el) return;
      var g = groupOf(el); if (!g) return; if (ev) ev.preventDefault();
      show(g.i, el === g.box ? null : el);
    }
    document.addEventListener('click', function(e){ var a = e.target.closest('a[href^="#"]'); if (a) toHash(a.getAttribute('href'), e); });
    /* the page scrolls to the route map itself in places: follow it into the journey tab */
    if (route) { var osi = route.scrollIntoView; route.scrollIntoView = function(o){ if (cur !== 1) show(1, route); else osi.call(route, o); }; }
    watch(function(){ $('la-led').textContent = sumText(); });
    /* phones: picking a station takes you up to the train strip, so you see that journey straight away */
    document.addEventListener('click', function(e){
      var hb = e.target.closest && e.target.closest('#hub button'); if (!hb || !strip || innerWidth > 860) return;
      function up(how){ if (!strip.clientWidth) return; var gap = strip.getBoundingClientRect().top - bar.getBoundingClientRect().bottom; if (Math.abs(gap) > 3) scrollBy({ top: gap, behavior: how }); }
      setTimeout(function(){ up('smooth'); }, 120); setTimeout(function(){ up('auto'); }, 1100);
    }, true);   /* capture: the page redraws the tiles on the tap, so the tapped tile is gone by the time the tap bubbles */
    show(0, null, true);
    if (location.hash) setTimeout(function(){ toHash(location.hash); }, 400);
  }

  if (MODE === 'b') {
    var stops = [];
    G.forEach(function(g, i){
      var h = document.createElement('div'); h.className = 'lb-chap'; h.id = 'lx-' + g.k;
      h.innerHTML = '<div class="wrap"><span class="n" aria-hidden="true">' + (i + 1) + '</span><h2>' + g.t + '</h2><p>' + g.p + '</p></div>';
      g.box.insertBefore(h, g.box.firstChild);
      stops.push({ id: h.id, t: g.t, big: 1 });
      ({ journey: [['way', 'Step by step'], ['roads', 'The line it takes']], station: [['station-guide', 'Station guide']], tips: [['pay', 'Pay less'], ['know', 'Good to know']] }[g.k] || []).forEach(function(x){ if ($(x[0])) stops.push({ id: x[0], t: x[1] }); });
    });
    var nav = document.createElement('nav'); nav.className = 'lb-line'; nav.setAttribute('aria-label', 'On this page');
    nav.innerHTML = '<ol>' + stops.map(function(s){ return '<li class="' + (s.big ? 'big' : '') + '"><a href="#' + s.id + '">' + s.t + '</a></li>'; }).join('') + '</ol>';
    main.parentNode.insertBefore(nav, main);
    var lis = [].slice.call(nav.querySelectorAll('li')), ol = nav.querySelector('ol'), was = -1;
    function spy(){
      var at = 0, line = nav.offsetHeight + 70;
      stops.forEach(function(s, i){ var e = $(s.id); if (e && e.getBoundingClientRect().top <= line) at = i; });
      if (at === was) return; was = at;
      lis.forEach(function(li, i){ li.classList.toggle('on', i === at); li.classList.toggle('past', i < at); });
      var li = lis[at]; ol.scrollTo({ left: li.offsetLeft - ol.clientWidth / 2 + li.offsetWidth / 2, behavior: 'smooth' });
    }
    var tick = 0; addEventListener('scroll', function(){ if (tick) return; tick = requestAnimationFrame(function(){ tick = 0; spy(); }); }, { passive: true }); spy();
    /* your ticket: follows the train you pick */
    var tk = document.createElement('aside'); tk.className = 'lb-ticket'; tk.setAttribute('aria-label', 'Your train');
    tk.innerHTML = '<div class="lb-tin"><h3>Your train<span id="lb-day"></span></h3><div class="lb-big" id="lb-big"></div><p class="lb-per" id="lb-per"></p><div class="lb-kv" id="lb-kv"></div><div class="lb-btns"><a href="#" id="lb-buy" target="_blank" rel="noopener"><span>Buy tickets</span><i aria-hidden="true">↗</i></a><a class="alt" href="#hubrow"><span>Change train</span><i aria-hidden="true">↑</i></a></div></div>';
    document.body.appendChild(tk);
    watch(function(){
      var b = $('sumbig'), p = $('sumper'), k = $('sumkv'), buy = $('buybtn'), d = (sumText().match(/^\S+\s+(\w+day)/) || [])[1] || '';
      if (b) $('lb-big').innerHTML = b.innerHTML; if (p) $('lb-per').innerHTML = p.innerHTML; if (k) $('lb-kv').innerHTML = k.innerHTML;
      $('lb-day').textContent = d; if (buy) $('lb-buy').href = buy.href;
    });
    function widen(){ kick(); } addEventListener('load', widen); setTimeout(widen, 600);
  }
})();
