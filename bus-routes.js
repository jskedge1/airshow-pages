/* Bus route maps for the feature show pages (camping-layout/<show>.html).
   Each page's "Getting there" bus topics call UKAG_BR.render(show, topicId), which adds a
   "Route maps" box with a "Show route details" button for every bus in that topic.
   The route pages themselves are bus-routes/<id>.html, built from templates/bus-route-template.html.

   WIX_PAGE: while it is null, buttons open the route page in a new tab.
   Once the Wix page /bus-route exists (HTML box loading the page named in ?r=, page code
   velo/page-code/bus-route.js), set WIX_PAGE to 'bus-route' and every button opens it on the site. */
(function(){
  var BASE = 'https://jskedge1.github.io/airshow-pages/bus-routes/';
  var SITE = 'https://www.ukairshowguide.co.uk/';
  var WIX_PAGE = 'bus-route';

  /* show -> topic id -> list of [bus number, route page id, bus company colours, bus company] */
  var MAP = {"ayr":{"bus":[["X77","x77-ayr",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach West Scotland"],["4","4-ayr",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach West Scotland"],["42","42-ayr",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach West Scotland"],["X42","x42-ayr",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach West Scotland"],["9","9-ayr",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach West Scotland"]]},
    "blackpool":{"bus":[["61","61-blackpool",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"],["68","68-blackpool",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"],["11","11-blackpool",{"op1":"#1A1A1A","op2":"#FFD100","opink":"#FFD100"},
    "Blackpool Transport"],["10","10-blackpool",{"op1":"#1A1A1A","op2":"#FFD100","opink":"#FFD100"},
    "Blackpool Transport"],["14","14-blackpool",{"op1":"#1A1A1A","op2":"#FFD100","opink":"#FFD100"},
    "Blackpool Transport"],["5C","5c-blackpool",{"op1":"#1A1A1A","op2":"#FFD100","opink":"#FFD100"},
    "Blackpool Transport"],["42","42-blackpool",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"]]},
    "clacton":{"bus-colchester":[["74","74-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["74B","74b-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["76","76-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"]],"bus-local":[["7","7-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["9","9-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["9A","9a-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["98A","98a-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["3","3-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["2","2-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["2A","2a-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["6","6-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["6A","6a-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["4","4-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["78","78-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["74","74-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["74B","74b-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"],["76","76-clacton",{"op1":"#00843D","op2":"#7AC143","opink":"#FFFFFF"},
    "Central Connect"]]},
    "duxford":{"bus-local":[["132","132-duxford",{"op1":"#1E5AA8","op2":"#8CC63F","opink":"#FFFFFF"},
    "A2B Bus and Coach"]]},
    "eastbourne":{"bus-station":[["3","3-eastbourne",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"]],"bus-brighton":[["12","12-eastbourne",{"op1":"#C8102E","op2":"#F3E8CF","opink":"#FFFFFF"},
    "Brighton and Hove"],["12X","12x-eastbourne",{"op1":"#C8102E","op2":"#F3E8CF","opink":"#FFFFFF"},
    "Brighton and Hove"],["13X","13x-eastbourne",{"op1":"#C8102E","op2":"#F3E8CF","opink":"#FFFFFF"},
    "Brighton and Hove"]],"bus-beachy":[["13X","13x-eastbourne",{"op1":"#C8102E","op2":"#F3E8CF","opink":"#FFFFFF"},
    "Brighton and Hove"]],"bus-east":[["99","99-eastbourne",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"],["25","25-eastbourne",{"op1":"#2E6B30","op2":"#F2E6B8","opink":"#FFFFFF"},
    "Cuckmere Buses"],["28","28-eastbourne",{"op1":"#C8102E","op2":"#F3E8CF","opink":"#FFFFFF"},
    "Brighton and Hove"],["12","12-eastbourne",{"op1":"#C8102E","op2":"#F3E8CF","opink":"#FFFFFF"},
    "Brighton and Hove"],["12X","12x-eastbourne",{"op1":"#C8102E","op2":"#F3E8CF","opink":"#FFFFFF"},
    "Brighton and Hove"],["13X","13x-eastbourne",{"op1":"#C8102E","op2":"#F3E8CF","opink":"#FFFFFF"},
    "Brighton and Hove"]],"beachy-bus":[["13X","13x-eastbourne",{"op1":"#C8102E","op2":"#F3E8CF","opink":"#FFFFFF"},
    "Brighton and Hove"]]},
    "headcorn":{"bus-local":[["12","12-headcorn",{"op1":"#00A5A3","op2":"#003B5C","opink":"#FFFFFF"},
    "Arriva"]]},
    "midlands":{"bus-247":[["247","247-midlands",{"op1":"#004B93","op2":"#E30613","opink":"#FFFFFF"},
    "Diamond Bus"]]},
    "shuttleworth":{"bus-74":[["74","74-shuttleworth",{"op1":"#0B3D91","op2":"#FFC20E","opink":"#FFFFFF"},
    "Grant Palmer"]]},
    "southport":{"bus-liverpool":[["47","47-southport",{"op1":"#00A5A3","op2":"#003B5C","opink":"#FFFFFF"},
    "Arriva"],["300","300-southport",{"op1":"#00A5A3","op2":"#003B5C","opink":"#FFFFFF"},
    "Arriva"],["X2","x2-southport",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"]],"bus-preston":[["X2","x2-southport",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"],["2","2-southport",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"],["347","347-southport",{"op1":"#D71920","op2":"#1A1A1A","opink":"#FFFFFF"},
    "Vision Bus"]],"bus-other":[["375","375-southport",{"op1":"#00A5A3","op2":"#003B5C","opink":"#FFFFFF"},
    "Arriva"],["385","385-southport",{"op1":"#00A5A3","op2":"#003B5C","opink":"#FFFFFF"},
    "Arriva"],["X37","x37-southport",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"],["37A","37a-southport",{"op1":"#1D4F91","op2":"#F58025","opink":"#FFFFFF"},
    "Stagecoach"],["44","44-southport",{"op1":"#00A5A3","op2":"#003B5C","opink":"#FFFFFF"},
    "Arriva"]]},
    "wales":{"bus":[["3A","3a-wales",{"op1":"#4B2E83","op2":"#E6007E","opink":"#FFFFFF"},"First Cymru and Adventure Travel"],["2A","2a-wales",{"op1":"#4B2E83","op2":"#E6007E","opink":"#FFFFFF"},"First Cymru"],["2","2-wales",{"op1":"#4B2E83","op2":"#E6007E","opink":"#FFFFFF"},"First Cymru"],["1","1-wales",{"op1":"#4B2E83","op2":"#E6007E","opink":"#FFFFFF"},"First Cymru"],["X1","x1-wales",{"op1":"#4B2E83","op2":"#E6007E","opink":"#FFFFFF"},"First Cymru"]]}};

  function href(id){ return WIX_PAGE ? SITE + WIX_PAGE + '?r=' + id : BASE + id + '.html'; }

  /* The styles go in the page head and inside each route box too, because the feature pages run inside
     the site's page element, where styles in the head do not reach the buttons. */
  var CSS =
      '.br-box{margin:18px 0 8px;background:#fff;color:#13293C;border-left:5px solid #F2B233;padding:16px 18px 18px;border-radius:0}' +
      '.br-box h4.br-h{margin:0!important;padding:0!important;font-family:Barlow,sans-serif!important;font-weight:700!important;font-size:24px!important;line-height:26px!important;text-transform:uppercase!important;letter-spacing:0!important;color:#13293C!important}' +
      '.br-box p.br-p{margin:6px 0 12px!important;font-family:Barlow,sans-serif!important;font-weight:500!important;font-size:15px!important;line-height:22px!important;color:#4E5D68!important;text-transform:none!important}' +
      '.br-list{display:flex;flex-wrap:wrap;gap:8px}' +
      'a.br-btn{display:inline-flex;align-items:stretch;background:var(--b1,#13293C);color:var(--bi,#fff)!important;text-decoration:none!important;border-radius:0;font-family:Barlow,sans-serif;font-weight:700;font-size:15px;line-height:20px;text-transform:none;letter-spacing:0;transition:transform .3s cubic-bezier(.22,.61,.36,1),filter .3s cubic-bezier(.22,.61,.36,1)}' +
      'a.br-btn:hover,a.br-btn:focus-visible{transform:translateY(-2px);filter:brightness(1.08)}' +
      '.br-num{display:inline-flex;align-items:center;justify-content:center;min-width:52px;padding:0 10px;background:#050607;color:#F2B233;font-family:Barlow,sans-serif;font-weight:700;font-size:22px;letter-spacing:.01em;text-shadow:0 0 8px rgba(242,178,51,.45)}' +
      '.br-txt{display:flex;flex-direction:column;justify-content:center;padding:7px 12px;border-bottom:4px solid var(--b2,#F2B233)}' +
      '.br-txt small{font-weight:500;font-size:12.5px;line-height:15px;opacity:.85}' +
      'a.br-btn i{font-style:normal;display:flex;align-items:center;padding:0 12px 0 2px;border-bottom:4px solid var(--b2,#F2B233);transition:transform .3s cubic-bezier(.22,.61,.36,1)}' +
      'a.br-btn:hover i{transform:translateX(3px)}' +
      '@media(max-width:420px){a.br-btn{flex:1 1 100%}.br-txt{flex:1}}';
  function css(){
    if (document.getElementById('ukag-br-css')) return;
    var s = document.createElement('style'); s.id = 'ukag-br-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function render(show, topic){
    var list = (MAP[show] || {})[topic];
    if (!list || !list.length) return '';
    css();
    var tgt = WIX_PAGE ? ' target="_top"' : ' target="_blank" rel="noopener"';
    var one = list.length === 1;
    return '<div class="br-box"><style>' + CSS + '</style><h4 class="br-h">' + (one ? 'Route map for the ' + list[0][0] : 'Route maps for these buses') + '</h4>' +
      '<p class="br-p">' + (one ? 'See the roads it takes, every stop and the times, with the stop closest to the show marked.'
                   : 'Pick a bus to see the roads it takes, every stop and the times, with the stop closest to the show marked.') + '</p>' +
      '<div class="br-list">' + list.map(function(r){
        var c = r[2] || {};
        var style = ' style="--b1:' + (c.op1 || '#13293C') + ';--bi:' + (c.opink || '#fff') + ';--b2:' + (c.op2 || '#F2B233') + '"';
        return '<a class="br-btn" href="' + href(r[1]) + '"' + tgt + style + '><span class="br-num">' + r[0] + '</span><span class="br-txt">Show route details' + (r[3] ? '<small>Run by ' + r[3] + '</small>' : '') + '</span><i aria-hidden="true">→</i></a>';
      }).join('') + '</div></div>';
  }

  window.UKAG_BR = { render: render, href: href, map: MAP };
})();

/* Back to Transport (3 Nov 2026), the show page and Public transport page half. The route pages' half is transport-back.js.
   1. When a bus or train route button is tapped, the link gets ?from=show&t=<topic> (show page) or ?from=hub
      (Public transport page), so the route page's Back to Transport tab knows where to send the visitor.
   2. When a visitor comes back from a route page (?tb=<topic>&tr=<route>&tm=<bus or train>), the show page
      opens Getting there, picks the topic they were on and scrolls to it. */
(function(){
  if (window.UKAG_TB_SHOW) return;
  window.UKAG_TB_SHOW = true;

  var FROM_KEY = 'ukagTransportFrom', BACK_KEY = 'ukagTransportBack';
  var ROUTE_LINK = /bus-route\?r=|bus-routes\/[a-z0-9-]+\.html|train-to-|train-routes\/[a-z0-9-]+\.html/i;
  /* show key from the page address, on the site (Wix address) or on GitHub (camping-layout/<show>.html) */
  var SLUGS = {riat:'riat',cosfordairshow:'cosford',midlandsairfestival:'midlands',eastbourneairshow:'eastbourne',
    clactonairshow:'clacton',walesairshow:'wales',duxfordairshows:'duxford',shuttleworthairshows:'shuttleworth',
    'little-gransden-air-and-car-show':'gransden','southport-air-show':'southport','blackpool-air-show':'blackpool',
    'international-ayr-show':'ayr','headcorn-air-show':'headcorn'};
  var TRAIN_SLUG = {riat:'riat',cosford:'cosford',midlands:'midlands',eastbourne:'eastbourne',clacton:'clacton',
    swansea:'wales',duxford:'duxford',shuttleworth:'shuttleworth','little-gransden':'gransden',southport:'southport',
    blackpool:'blackpool',ayr:'ayr',headcorn:'headcorn'};

  function clean(t){ return String(t || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40); }
  function param(name){
    var q = location.search.match(new RegExp('[?&]' + name + '=([^&#]*)'));
    return q ? clean(decodeURIComponent(q[1])) : '';
  }
  function read(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){ return null; } }
  function write(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  function hereShow(){
    var p = location.pathname.replace(/\/+$/, '');
    var g = p.match(/camping-layout\/([a-z0-9-]+)\.html$/i);
    if (g) return g[1].replace(/-v\d+$/, '');
    return SLUGS[p.split('/').pop()] || '';
  }
  function linkShow(h){
    var b = h.match(/(?:\?r=|bus-routes\/)([a-z0-9-]+)/i);
    if (b) return b[1].split('-').pop().toLowerCase();
    var t = h.match(/train-to-([a-z0-9-]+)/i);
    if (t) return TRAIN_SLUG[t[1].toLowerCase()] || '';
    var f = h.match(/train-routes\/([a-z0-9-]+)\.html/i);
    if (f) return f[1].indexOf('riat') === 0 ? 'riat' : f[1].toLowerCase();
    return '';
  }

  /* 1. note where the visitor is coming from */
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (!ROUTE_LINK.test(h) || /[?&]from=/.test(h)) return;
    var hub = !!document.getElementById('fShow') && !document.getElementById('parkList');
    var list = document.getElementById('parkList');
    /* on a show page only the route buttons inside Getting there count, not the menus */
    if (!hub && (!list || !a.closest('#parkDetail, .tr-box, .br-box, #travel'))) return;
    var on = list && list.querySelector('[aria-pressed="true"]');
    var topic = !hub && on ? clean(on.getAttribute('data-id')) : '';
    write(FROM_KEY, {kind: hub ? 'hub' : 'show', show: linkShow(h), topic: topic, at: Date.now()});
    var add = 'from=' + (hub ? 'hub' : 'show') + (topic ? '&t=' + topic : '');
    var cut = h.indexOf('#');
    var base = cut < 0 ? h : h.slice(0, cut), tail = cut < 0 ? '' : h.slice(cut);
    a.setAttribute('href', base + (base.indexOf('?') < 0 ? '?' : '&') + add + tail);
  }, true);

  /* 2. back from a route page: open Getting there on the right topic */
  var topic = param('tb'), route = param('tr'), mode = param('tm');
  if (!topic && !route) {
    var n = read(BACK_KEY), me = hereShow();
    if (n && me && n.show === me && (Date.now() - (n.at || 0)) < 120000) { topic = clean(n.topic); route = clean(n.route); mode = clean(n.mode); }
  }
  if (!topic && !route) return;
  try { localStorage.removeItem(BACK_KEY); } catch(e){}

  function pick(list){
    var ids = [].map.call(list.querySelectorAll('button[data-id]'), function(b){ return b.getAttribute('data-id'); });
    if (topic && topic !== 'auto' && ids.indexOf(topic) >= 0) return topic;
    if (mode === 'bus' && route && window.UKAG_BR) {
      var M = UKAG_BR.map[route.split('-').pop()] || {};
      for (var i = 0; i < ids.length; i++) {
        var l = M[ids[i]] || [];
        for (var j = 0; j < l.length; j++) if (l[j][1] === route) return ids[i];
      }
    }
    var want = mode === 'bus' ? /^bus/ : /^rail/;
    for (var k = 0; k < ids.length; k++) if (want.test(ids[k])) return ids[k];
    return '';
  }
  function openTravel(){
    var t = document.getElementById('travel');
    if (!t) return;
    if (typeof window.secOpen === 'function') { window.secOpen('travel'); return; }
    var f = t.closest ? t.closest('.fold') : null;
    if (f && !f.classList.contains('open')) { var b = f.querySelector('.fold-btn'); if (b) b.click(); }
  }
  var tries = 0;
  (function wait(){
    var list = document.getElementById('parkList');
    if (!list || !list.querySelector('button[data-id]')) { if (++tries < 60) setTimeout(wait, 250); return; }
    setTimeout(function(){
      openTravel();
      var id = pick(list);
      var btn = id && list.querySelector('button[data-id="' + id + '"]');
      if (btn && btn.getAttribute('aria-pressed') !== 'true') btn.click();
      var to = document.getElementById('explore') || document.getElementById('travel');
      var slow = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(function(){ if (to) to.scrollIntoView({behavior: slow ? 'auto' : 'smooth', block: 'start'}); }, 650);
    }, 400);
  })();
})();
