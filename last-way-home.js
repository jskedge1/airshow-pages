/* "Last way home" board for the feature show pages (camping-layout/<show>.html), from the
   Bus station design on the Public Transport page designs canvas (10 Nov 2026).
   It sits in Getting there, just above the questions, and shows the latest train, bus, coach or
   Park and Ride home for each way in. The times come from transport-times.js (UKAG_TT), so when
   the weekly checker updates that file, this board updates with it. Tapping a card opens that
   way in on the page.
   Add to a page with: <script src="https://jskedge1.github.io/airshow-pages/last-way-home.js" data-show="clacton" defer></script>
   after the transport-times.js line. Text rules: no dashes, 24 hour times. */
(function () {
  var me = document.currentScript;
  var show = (me && me.getAttribute('data-show')) || ((location.pathname.match(/([a-z-]+)\.html$/) || [])[1] || '');
  var NAMES = {cosford: 'Cosford', midlands: 'Midlands Air Festival', eastbourne: 'Eastbourne', clacton: 'Clacton', wales: 'Swansea', duxford: 'Duxford', shuttleworth: 'Shuttleworth', gransden: 'Little Gransden', headcorn: 'Headcorn', southport: 'Southport', blackpool: 'Blackpool', ayr: 'Ayr'};
  /* a row counts as a way home when its table is a home table, or the service starts at the show end */
  var FROM = {cosford: 'Cosford', midlands: 'Ragley|Alcester|Arrow', duxford: 'Duxford|IWM|Cambridge to|Whittlesford|Royston to', shuttleworth: 'Shuttleworth|Old Warden|Biggleswade to|Bedford to|Ickwell', gransden: 'Gransden|St Neots to|Sandy to|Cambridge to', eastbourne: 'Eastbourne|Beachy|Winter Garden', clacton: 'Clacton', southport: 'Southport', blackpool: 'Blackpool', ayr: 'Ayr to|Ayr Racecourse|Low Green', wales: 'Swansea|Fabian', headcorn: 'Headcorn'};
  var MODE = [[/^(rail|train)/, '#D74949', 'Train', 'train'], [/^(pr|shuttle)|-pr$/, '#2BA84A', 'Park and Ride', 'pr'], [/coach/, '#C2255C', 'Coach', 'coach'], [/^tram/, '#6950A1', 'Tram', 'tram'], [/./, '#00A6E2', 'Bus', 'bus']];
  var ICON = {
    train: '<rect x="5" y="3" width="14" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 10h14M8 20l2-4M16 20l-2-4" stroke="currentColor" stroke-width="2" fill="none"/>',
    bus: '<rect x="4" y="3" width="16" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 11h16M7 17v3M17 17v3" stroke="currentColor" stroke-width="2" fill="none"/>',
    coach: '<rect x="2" y="5" width="20" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 11h20M7 5v6M12 5v6M17 5v6" stroke="currentColor" stroke-width="1.6" fill="none"/>',
    pr: '<path d="M9 17V7h4a3 3 0 0 1 0 6H9" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>',
    tram: '<rect x="6" y="5" width="12" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 2h6M12 2v3M6 11h12" stroke="currentColor" stroke-width="2" fill="none"/>',
    home: '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="2"/>'
  };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function svg(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICON[k] || ICON.bus) + '</svg>'; }
  function hm(s) { var m = /^(\d\d):(\d\d)$/.exec(s || ''); if (!m) return null; var v = +m[1] * 60 + +m[2]; return v < 240 ? v + 1440 : v; }
  function ukDate(s) { var p = (s || '').split('-'); return p.length === 3 ? (+p[2]) + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0] : ''; }

  var CSS = '.lwhb{margin:8px 0 34px;font-family:Barlow,"Helvetica Neue",Arial,sans-serif}'
    + '.lwhb *{box-sizing:border-box}'
    + '.lwhb-sign{display:flex;align-items:center;gap:16px;background:#D74949;color:#fff;padding:16px 20px}'
    + '.lwhb-hi{width:52px;height:52px;background:#fff;color:#D74949;display:grid;place-items:center;flex:none}'
    + '.lwhb-hi svg{width:30px;height:30px}'
    + '.lwhb .lwhb-sign h3{margin:0!important;padding:0!important;font-family:"Barlow Condensed",Barlow,sans-serif!important;font-weight:800!important;font-size:clamp(26px,3.4vw,40px)!important;line-height:1!important;letter-spacing:.005em!important;text-transform:uppercase!important;color:#fff!important}'
    + '.lwhb-sign p{margin:3px 0 0;font-weight:500;font-size:15.5px;line-height:1.4;color:#FFE3E3}'
    + '.lwhb-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;margin-top:12px}'
    + '.lwhb-card{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:auto minmax(0,1fr);gap:3px 16px;align-items:center;background:#fff;box-shadow:0 6px 18px rgba(19,41,60,.10);padding:16px;border-top:6px solid var(--c);transition:transform .3s ease,box-shadow .3s ease;font-family:inherit}'
    + '.lwhb-card:hover,.lwhb-card:focus-visible{transform:translateY(-2px);box-shadow:0 12px 28px rgba(19,41,60,.18)}'
    + '.lwhb-card:focus-visible{outline:3px solid #00A6E2;outline-offset:2px}'
    + '.lwhb-t{grid-row:1/4;background:#0B0F14;color:#F4C542;font-weight:800;font-size:26px;line-height:1.2;padding:6px 12px;font-variant-numeric:tabular-nums;letter-spacing:.04em}'
    + '.lwhb-m{display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:13.5px;color:var(--k)}'
    + '.lwhb-m svg{width:16px;height:16px}'
    + '.lwhb-card b{font-weight:700;font-size:16.5px;line-height:1.25;color:#13293C}'
    + '.lwhb-card small{font-size:14px;line-height:1.35;color:#4A5A66}'
    + '.lwhb-card .lwhb-go{grid-column:2;font-weight:600;font-size:14px;color:#13293C;margin-top:4px}'
    + '.lwhb-card .lwhb-go:after{content:"\\2192";display:inline-block;padding-left:6px;transition:transform .25s ease}'
    + '.lwhb-card:hover .lwhb-go:after{transform:translateX(3px)}'
    + '.lwhb-note{margin:12px 0 0;font-size:14.5px;line-height:1.5;color:#33444F;background:#F2F4F5;padding:12px 16px}'
    + '@media(max-width:640px){.lwhb-sign{padding:14px;gap:12px}.lwhb-hi{width:44px;height:44px}.lwhb-list{grid-template-columns:minmax(0,1fr)}}'
    + '@media(prefers-reduced-motion:reduce){.lwhb-card,.lwhb-card .lwhb-go:after{transition:none}.lwhb-card:hover{transform:none}}';

  function build() {
    var D = window.UKAG_TT && window.UKAG_TT.data && window.UKAG_TT.data[show];
    var travel = document.getElementById('travel');
    if (!D || !travel || travel.querySelector('.lwhb')) return !!(travel && travel.querySelector('.lwhb'));
    var rx = FROM[show] ? new RegExp('^\\s*(' + FROM[show] + ')', 'i') : null;
    var cards = [];
    Object.keys(D).forEach(function (id) {
      if (id === 'checked' || !D[id] || !D[id].forEach) return;
      var best = null;
      D[id].forEach(function (tb) {
        var homeTable = /home|last/i.test(tb.title || '');
        (tb.rows || []).forEach(function (r) {
          var v = hm(r[0]); if (v === null) return;
          if (/opens/i.test(r[1] || '')) return;
          var isHome = homeTable || (rx && rx.test(r[1] || '') && v >= 900);
          if (isHome && (!best || v > best.v)) best = {v: v, t: r[0], s: r[1], d: r[2]};
        });
      });
      if (!best) return;
      var m = MODE.filter(function (x) { return x[0].test(id); })[0];
      var btn = document.querySelector('#parkList button[data-id="' + id + '"]');
      var name = btn && btn.querySelector('span') ? (btn.querySelector('span').firstChild || {}).textContent : '';
      cards.push({id: id, v: best.v, t: best.t, s: best.s, d: best.d, c: m[1], lb: m[2], ic: m[3], name: (name || '').trim() || m[2], open: !!btn});
    });
    if (!cards.length) return true;
    cards.sort(function (a, b) { return a.v - b.v; });
    var acc = travel.querySelector('.acc'), host = acc ? (acc.closest('.wrap') || acc.parentNode) : null;
    if (!host) return true;
    var box = document.createElement('div');
    box.className = 'wrap';
    box.innerHTML = '<style>' + CSS + '</style><section class="lwhb" aria-label="Last way home">'
      + '<div class="lwhb-sign"><span class="lwhb-hi">' + svg('home') + '</span><div><h3>Last way home from ' + esc(NAMES[show] || 'the show') + '</h3><p>The latest train, bus, coach or Park and Ride I have found for each way in</p></div></div>'
      + '<div class="lwhb-list">' + cards.map(function (c) {
        return '<button type="button" class="lwhb-card" data-id="' + esc(c.id) + '" style="--c:' + c.c + ';--k:' + (c.ic === 'bus' ? '#006F99' : c.ic === 'pr' ? '#1C7332' : c.c) + '">'
          + '<span class="lwhb-t">' + esc(c.t) + '</span>'
          + '<span class="lwhb-m">' + svg(c.ic) + esc(c.lb) + '</span>'
          + '<b>' + esc(c.name) + '</b>'
          + '<small>' + esc(c.s) + (c.d ? '. ' + esc(c.d) : '') + '</small>'
          + (c.open ? '<span class="lwhb-go">See this way in</span>' : '')
          + '</button>';
      }).join('') + '</div>'
      + '<p class="lwhb-note">Phone signal can be poor in big crowds, so I would take a screenshot of these before you leave home. Times last checked ' + esc(ukDate(D.checked)) + '. These are this winter’s times, so please check with the operator before you travel.</p>'
      + '</section>';
    host.parentNode.insertBefore(box, host);
    box.addEventListener('click', function (e) {
      var c = e.target.closest('.lwhb-card'); if (!c) return;
      var b = document.querySelector('#parkList button[data-id="' + c.getAttribute('data-id') + '"]');
      if (b) { if (b.getAttribute('aria-pressed') !== 'true') b.click(); }
      var to = document.getElementById('explore') || travel;
      var slow = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(function () { to.scrollIntoView({behavior: slow ? 'auto' : 'smooth', block: 'start'}); }, 120);
    });
    return true;
  }
  /* the ways in list is drawn by the page's own script, so wait for it before reading the names */
  var tries = 0;
  (function wait() {
    var ready = document.querySelector('#parkList button[data-id]');
    if ((ready || tries > 40) && build()) return;
    if (++tries < 80) setTimeout(wait, 250);
  })();
})();
