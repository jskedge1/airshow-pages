/* Back to Transport tab for every bus and train route page (bus-routes/<id>.html, train-routes/<show>.html).
   Adds the tab at the top and the bottom of the page, in the "transport tabs op1" look:
   a grey bar with a line in the mode colour, a white tab with a rounded top and a ring around a bus or train.

   Where it goes:
   1. The visitor came from a show page: back to that show page, Getting there opened, with the same topic picked.
   2. They came from the Public transport page: back there, with the same show picked.
   3. Anything else (a search, a shared link, a bookmark): the Getting there section of the show this route serves,
      on the topic that lists this bus or train.

   How it knows: the show pages and the Public transport page add ?from=show&t=<topic> or ?from=hub to a route
   link when it is tapped (bus-routes.js), and also note it in the browser (key ukagTransportFrom).
   The tab sends ?tb=<topic>&tr=<route>&tm=<bus or train> back to the show page, and bus-routes.js on the show
   page opens Getting there and the right topic. Bus pages sit in their own box on /bus-route, so they only see
   ?from= once the /bus-route page code passes it on (velo/page-code/bus-route.js, 3 Nov 2026).

   Load it at the end of a route page, after a line saying which page it is:
   <script>window.UKAG_ROUTE={mode:'bus',id:'74-clacton'};</script>
   <script src="https://jskedge1.github.io/airshow-pages/transport-back.js" defer></script> */
(function () {
  if (window.UKAG_TB) return;
  window.UKAG_TB = true;

  var SITE = 'https://www.ukairshowguide.co.uk/';
  var HUB = SITE + 'airshow-public-transport';
  var FROM_KEY = 'ukagTransportFrom';
  var BACK_KEY = 'ukagTransportBack';
  var FRESH_MS = 12 * 60 * 60 * 1000;

  /* show key, as used by the show pages and the Public transport page: [name, address] */
  var SHOWS = {
    riat: ['Royal International Air Tattoo', SITE + 'riat'],
    cosford: ['RAF Cosford Air Show', SITE + 'cosfordairshow'],
    midlands: ['Midlands Air Festival', SITE + 'midlandsairfestival'],
    eastbourne: ['Eastbourne Airshow', SITE + 'eastbourneairshow'],
    clacton: ['Clacton Air Show', SITE + 'clactonairshow'],
    wales: ['Wales National Airshow', SITE + 'walesairshow'],
    duxford: ['IWM Duxford Air Shows', SITE + 'duxfordairshows'],
    shuttleworth: ['Shuttleworth Air Shows', SITE + 'shuttleworthairshows'],
    gransden: ['Little Gransden Air and Car Show', SITE + 'little-gransden-air-and-car-show'],
    southport: ['Southport Air Show', SITE + 'southport-air-show'],
    blackpool: ['Blackpool Air Show', SITE + 'blackpool-air-show'],
    ayr: ['International Ayr Show', SITE + 'international-ayr-show'],
    /* no Wix page yet, so the tab opens the show page itself */
    headcorn: ['Headcorn Airshow', 'https://jskedge1.github.io/airshow-pages/camping-layout/headcorn.html']
  };
  /* shows the Public transport page covers */
  var ON_HUB = { riat: 1, cosford: 1, midlands: 1, eastbourne: 1, clacton: 1, wales: 1, duxford: 1, shuttleworth: 1, gransden: 1, southport: 1, blackpool: 1, ayr: 1 };

  var COLOUR = { bus: '#00A6E2', train: '#D74949' };
  var ICON = {
    bus: '<rect x="4" y="3.5" width="16" height="14" rx="2.5"/><path d="M4 10.5h16M8 21v-3.5M16 21v-3.5"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
    train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10.5h14M8.5 21l2-4M15.5 21l-2-4"/><circle cx="9" cy="13.5" r="1"/><circle cx="15" cy="13.5" r="1"/>'
  };

  /* which page is this? The line before the script says so; the file name is the spare check
     (pages shown inside the site keep the site's address, so the file name is not always there) */
  var me = window.UKAG_ROUTE || {};
  var mode = String(me.mode || '').toLowerCase();
  var page = String(me.id || '').toLowerCase();
  if (!mode || !page) {
    var m = location.pathname.match(/\/(bus|train)-routes\/([a-z0-9-]+)\.html$/i);
    if (!m) return;
    mode = m[1].toLowerCase();
    page = m[2].toLowerCase();
  }
  if (!ICON[mode] || page === 'index') return;

  var show = mode === 'bus' ? page.split('-').pop() : (page.indexOf('riat') === 0 ? 'riat' : page);
  if (!SHOWS[show]) return;

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage blocked: the tab still opens the show page */ }
  }

  function param(name) {
    var q = location.search.match(new RegExp('[?&]' + name + '=([^&#]*)'));
    return q ? decodeURIComponent(q[1].replace(/\+/g, ' ')) : '';
  }
  function clean(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40); }

  /* where did the visitor come from? The link address first, then the note in the browser */
  var kind = clean(param('from'));
  var topic = clean(param('t'));
  if (kind !== 'show' && kind !== 'hub') {
    kind = '';
    var note = read(FROM_KEY);
    if (note && note.show === show && (Date.now() - (note.at || 0)) < FRESH_MS) {
      kind = note.kind === 'hub' ? 'hub' : 'show';
      topic = clean(note.topic);
    }
  }
  var toHub = kind === 'hub' && ON_HUB[show];
  if (toHub) topic = '';

  var name = SHOWS[show][0];
  var dest = toHub
    ? { title: 'Back to Transport', sub: 'Public transport, ' + name, url: HUB + '#' + show }
    : { title: 'Back to Transport', sub: name + ', Getting there',
        url: SHOWS[show][1] + '?tb=' + (topic || 'auto') + '&tr=' + page + '&tm=' + mode };

  function leaveNote() {
    if (toHub) {
      /* the Public transport page opens on the show saved here */
      var keep = read('ptPlanner') || {};
      keep.show = show;
      write('ptPlanner', keep);
    } else {
      write(BACK_KEY, { show: show, topic: topic, route: page, mode: mode, at: Date.now() });
    }
  }

  var css = ''
    + '.tb-bar{--tb:' + COLOUR[mode] + ';background:#F1F4F6;border-bottom:3px solid var(--tb);font-family:"Barlow",Arial,sans-serif;position:relative;z-index:2}'
    + '.tb-bar.tb-end{border-bottom:0;border-top:3px solid var(--tb)}'
    + '.tb-in{max-width:1200px;margin:0 auto;padding:12px 24px 0;display:flex;align-items:flex-end;gap:16px}'
    + '.tb-end .tb-in{padding:0 24px 14px;align-items:flex-start}'
    + '.tb-tab{display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:#13293C;background:#fff;border:1px solid #D7DEE3;border-bottom:0;border-radius:12px 12px 0 0;padding:10px 20px 10px 10px;position:relative;top:3px;transition:background .25s ease,color .25s ease,box-shadow .25s ease}'
    + '.tb-end .tb-tab{border-bottom:1px solid #D7DEE3;border-top:0;border-radius:0 0 12px 12px;top:-3px}'
    + '.tb-ring{width:36px;height:36px;border-radius:50%;border:3px solid var(--tb);display:grid;place-items:center;flex:none;background:#fff;transition:background .25s ease,box-shadow .25s ease}'
    + '.tb-ring svg{width:18px;height:18px;fill:none;stroke:var(--tb);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:stroke .25s ease,transform .25s ease}'
    + '.tb-txt{display:flex;flex-direction:column;line-height:1.2}'
    + '.tb-txt b{font-weight:700;font-size:17px;display:flex;align-items:center;gap:8px}'
    + '.tb-txt b i{font-style:normal;display:inline-block;transition:transform .25s ease}'
    + '.tb-txt span{font-weight:500;font-size:14px;color:#4A5B68;transition:color .25s ease}'
    + '.tb-tab:hover .tb-ring,.tb-tab:focus-visible .tb-ring{background:var(--tb);box-shadow:0 0 12px color-mix(in srgb,var(--tb) 55%,transparent)}'
    + '.tb-tab:hover .tb-ring svg,.tb-tab:focus-visible .tb-ring svg{stroke:#fff}'
    + '.tb-tab:hover .tb-txt b i,.tb-tab:focus-visible .tb-txt b i{transform:translateX(-3px)}'
    + '.tb-tab:active{background:var(--tb);color:#fff}'
    + '.tb-tab:active .tb-txt span{color:#fff}'
    + '.tb-tab:focus-visible{outline:2px solid #13293C;outline-offset:2px}'
    + '.tb-where{margin-left:auto;padding-bottom:12px;font-size:15px;color:#4A5B68}'
    + '.tb-where b{color:#13293C;font-weight:600}'
    + '@media (max-width:640px){.tb-in{padding:10px 16px 0}.tb-end .tb-in{padding:0 16px 12px}.tb-tab{flex:1;min-width:0}.tb-txt span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tb-where{display:none}}'
    + '@media (prefers-reduced-motion:reduce){.tb-tab,.tb-ring,.tb-ring svg,.tb-txt b i,.tb-txt span{transition:none}}';

  function bar(end) {
    var el = document.createElement('div');
    el.className = 'tb-bar' + (end ? ' tb-end' : '');
    el.setAttribute('role', 'navigation');
    el.setAttribute('aria-label', end ? 'Back to transport, end of page' : 'Back to transport');
    el.innerHTML = '<style>' + css + '</style><div class="tb-in">'
      + '<a class="tb-tab" href="' + dest.url + '" target="_top">'
      + '<span class="tb-ring" aria-hidden="true"><svg viewBox="0 0 24 24">' + ICON[mode] + '</svg></span>'
      + '<span class="tb-txt"><b><i aria-hidden="true">&larr;</i>' + dest.title + '</b><span>' + dest.sub + '</span></span>'
      + '</a>'
      + (end ? '' : '<span class="tb-where">' + name + ' <b>/ ' + (mode === 'bus' ? 'Bus route' : 'Train route') + '</b></span>')
      + '</div>';
    el.querySelector('.tb-tab').addEventListener('click', leaveNote);
    return el;
  }

  function place() {
    if (document.querySelector('.tb-bar')) return;
    if (!document.getElementById('tb-style')) {
      var st = document.createElement('style');
      st.id = 'tb-style';
      st.textContent = css;
      (document.head || document.body).appendChild(st);
    }
    /* top: just above the page's own cover. Bottom: the end of the same block, after Keep planning,
       so nobody has to scroll back up after the timetable (and never under the site footer) */
    var cover = document.querySelector('header.hero, header.cover');
    if (!cover || !cover.parentNode) return;
    var box = cover.parentNode;
    box.insertBefore(bar(false), cover);
    /* the page's small print footer stays last, so the end tab goes just above it */
    var foot = null;
    for (var el = box.lastElementChild; el; el = el.previousElementSibling) {
      if (el.tagName === 'FOOTER') { foot = el; break; }
      if (el.tagName === 'SECTION' || el.tagName === 'DIV' && el.id === 'folds') break;
    }
    if (!foot && box.tagName === 'MAIN' && box.nextElementSibling && box.nextElementSibling.tagName === 'FOOTER') foot = box.nextElementSibling;
    if (foot) foot.parentNode.insertBefore(bar(true), foot);
    else box.appendChild(bar(true));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place);
  else place();
})();
