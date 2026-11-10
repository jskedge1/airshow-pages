/* Public transport page, sign style layout. Moves the page's own sections into four tabs (nothing is copied, so the
   planner, the show board, the options, the travel plan and the map all keep working) and adds three sign pieces:
   a zone line map of the shows, a show name band, and a Ways in screen. */
(function(){
  var $ = function(i){ return document.getElementById(i); };
  var hero = document.querySelector('header.hero'), board = document.querySelector('section.board'), res = $('results'), faq = document.querySelector('section.faq'), jpEl = document.querySelector('.ukag-jp');
  var jp = jpEl ? jpEl.closest('section') : null, foot = document.querySelector('body > footer');
  if (!board || !res) return;
  document.body.classList.add('px');
  var ZONES = [['Scotland and North West', ['ayr', 'blackpool', 'southport']], ['Midlands and Wales', ['cosford', 'midlands', 'wales']], ['East of England', ['shuttleworth', 'gransden', 'duxford', 'clacton']], ['The South', ['riat', 'headcorn', 'eastbourne']]];
  var MODE = { 'By train': ['Train', '#D74949'], 'By bus': ['Bus', '#00A6E2'], 'By coach': ['Coach', '#C2255C'], 'Park and Ride': ['P+R', '#2BA84A'] };
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rows(){ return [].slice.call(document.querySelectorAll('#lines .line[data-show]')); }
  function rowOf(k){ return document.querySelector('#lines .line[data-show="' + k + '"]'); }
  function curKey(){ var r = document.querySelector('#lines .line[aria-pressed="true"]'); return r ? r.getAttribute('data-show') : ($('fShow') || {}).value; }
  function zoneOf(k){ for (var i = 0; i < ZONES.length; i++) if (ZONES[i][1].indexOf(k) >= 0) return ZONES[i][0]; return ''; }

  /* ---------- groups ---------- */
  var G = [
    { k: 'show', sh: 'Show', t: 'Your show', s: 'Thirteen shows on the map', els: [] },
    { k: 'ways', sh: 'Ways in', t: 'Ways in', s: 'Train, bus and coach', els: [] },
    { k: 'door', sh: 'Door', t: 'From your door', s: 'Trains from your town', els: [] },
    { k: 'know', sh: 'Help', t: 'Good to know', s: 'Quick answers before you go', els: [] }
  ];
  var bar = document.createElement('div'); bar.className = 'px-bar';
  bar.innerHTML = '<div class="px-tabs" role="tablist" aria-label="Plan your trip by public transport">' + G.map(function(g, i){
    return '<button class="px-tab" role="tab" id="px-t' + i + '" aria-controls="px-g' + i + '" aria-selected="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? -1 : 0) + '"><span class="n">' + (i + 1) + '</span><b><span class="lg">' + g.t + '</span><span class="sm" aria-hidden="true">' + g.sh + '</span></b><small>' + g.s + '</small></button>';
  }).join('') + '</div><div class="px-led"><div><span>Your show</span><em id="px-led"></em></div></div>';
  hero.parentNode.insertBefore(bar, hero.nextSibling);
  var at = bar;
  G.forEach(function(g, i){ g.box = document.createElement('div'); g.box.className = 'px-panel'; g.box.id = 'px-g' + i; g.box.setAttribute('role', 'tabpanel'); g.box.setAttribute('aria-labelledby', 'px-t' + i); at.parentNode.insertBefore(g.box, at.nextSibling); at = g.box; g.i = i; });

  /* ---------- sign pieces ---------- */
  var signA = document.createElement('div'); signA.className = 'px-sign';
  signA.innerHTML = '<div class="px-band"><h2>Airshows by public transport</h2><span>All zones</span></div><div class="px-mapwrap"><div class="px-mapbox"><div class="px-map" id="px-map"></div></div><aside class="px-side" id="px-side"></aside></div>';
  var KEY = '<div class="px-key"><b>Key</b><span class="ln"><u></u>The line links every show</span><span class="st"><u></u>Tap a show</span><span class="ys"><u></u>Your show</span><span class="ap"><u></u>Airport</span><span class="sn"><u></u>Feature page coming soon</span></div>';
  var signB = document.createElement('div'); signB.className = 'px-sign';
  signB.innerHTML = '<div class="px-band"><h2 id="px-name"></h2><span id="px-zone"></span></div><div class="px-screen" id="px-screen"></div>';
  G[0].box.appendChild(signA); G[0].box.appendChild(board);
  G[1].box.appendChild(signB); G[1].box.appendChild(res);
  var other = document.createElement('div'); other.className = 'px-other';
  other.innerHTML = '<div><b>Looking at another way in?</b><span>Compare every option for getting to the show side by side</span></div><button type="button" class="px-other-go">See all ways in</button>';
  G[1].box.appendChild(other);
  other.querySelector('button').addEventListener('click', function(){ show(1, $('px-screen').parentNode); });
  if (jp) G[2].box.appendChild(jp);
  if (faq) G[3].box.appendChild(faq);
  if (!jp) { G[2].box.remove(); }

  /* the UK map: land shaded by zone like the pier sign, one line linking every show, and a stop for each show */
  var GEO = /*UKGEO*/;
  var VB = [40, 12, 400, 580], KC = Math.cos(54.5 * Math.PI / 180);
  function proj(la, lo){ return [(lo + 8.7) * KC / (10.7 * KC) * 400, (59 - la) / 9.2 * 592]; }
  /* where each show sits (nudged a touch where three shows sit close together), and which side its name goes */
  var SPOT = { ayr: [55.462, -4.635, 'l'], blackpool: [53.86, -3.055, 'r'], southport: [53.6, -3.007, 'r'], cosford: [52.640, -2.306, 'l'], midlands: [52.198, -1.900, 'l'],
    wales: [51.615, -3.955, 'l'], riat: [51.152, -1.747, 'dn'], eastbourne: [50.766, 0.287, 'dn'], headcorn: [51.157, 0.643, 'r'], clacton: [51.787, 1.155, 'r'],
    duxford: [52.06, 0.22, 'r'], gransden: [52.25, -0.12, 'up'], shuttleworth: [52.06, -0.44, 'dn'] };
  var ORDER = ['ayr', 'blackpool', 'southport', 'cosford', 'midlands', 'wales', 'riat', 'eastbourne', 'headcorn', 'clacton', 'duxford', 'gransden', 'shuttleworth'];
  var ZPOLY = [
    ['#CBD1D7', 'M-100 -100H520V372L330 372L-100 372Z'],
    ['#E6E9EC', 'M-100 372H286V492H-100Z'],
    ['#CBD1D7', 'M286 372H520V482H286Z'],
    ['#E6E9EC', 'M-100 492H286V482H520V700H-100Z']
  ];
  var ZLAB = [['Scotland and North West', 232, 268, 'start'], ['Midlands and Wales', 196, 392, 'end'], ['East of England', 404, 392, 'end'], ['The South', 196, 552, 'start']];
  /* flights: the airports for each show and the way from the airport to the show */
  var AIR = /*AIRDATA*/, AP = AIR.airports, AIRC = '#6950A1', airOnly = false;
  var IC = {
    plane: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>',
    train: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 10h14M8 20l2-4M16 20l-2-4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg>',
    bus: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 11h16M7 17v3M17 17v3" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/></svg>',
    coach: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 11h20M7 5v6M12 5v6M17 5v6" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="7" cy="18.5" r="1.8" fill="currentColor"/><circle cx="17" cy="18.5" r="1.8" fill="currentColor"/></svg>',
    walk: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="13" cy="4.5" r="2" fill="currentColor"/><path d="M13 8l-3 2v4M13 8l2 4 3 1M12 13l1 4-1 5M11 14l-2 3-2 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    taxi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11l1.6-4.2A2 2 0 0 1 8.5 5.5h7a2 2 0 0 1 1.9 1.3L19 11" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="11" width="18" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 3h4v2.5h-4zM6.5 17v2.5M17.5 17v2.5" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.6 6-10.5a6 6 0 0 0-12 0C6 15.4 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10.5" r="2" fill="currentColor"/></svg>'
  };
  IC.shuttle = IC.bus;
  var STEP = { train: ['Train', '#D74949'], bus: ['Bus', '#00A6E2'], coach: ['Coach', '#C2255C'], walk: ['Walk', '#6B7C89'], taxi: ['Taxi', '#13293C'], shuttle: ['Shuttle', '#00A6E2'], stop: ['To be confirmed', '#13293C'] };
  Object.keys(AP).forEach(function(c){ var a = AP[c], p = a.at || proj(a.lat, a.lon); a.x = Math.round(p[0] * 10) / 10; a.y = Math.round(p[1] * 10) / 10; });
  function airFor(k){ return AIR.shows[k] || []; }
  function airNames(k){ return airFor(k).map(function(o){ return AP[o.a].name; }); }
  var map = $('px-map'), P = {};
  ORDER.forEach(function(k){ var p = proj(SPOT[k][0], SPOT[k][1]); P[k] = [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]; });
  /* the line runs straight or at 45 degrees, the way a transport map does */
  var d = '';
  ORDER.forEach(function(k, i){
    var p = P[k]; if (!i) { d = 'M' + p[0] + ' ' + p[1]; return; }
    var q = P[ORDER[i - 1]], dx = p[0] - q[0], dy = p[1] - q[1], m = Math.min(Math.abs(dx), Math.abs(dy));
    var cx = q[0] + Math.sign(dx) * m, cy = q[1] + Math.sign(dy) * m;
    d += ' L' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' L' + p[0] + ' ' + p[1];
  });
  var html = '<svg viewBox="' + VB.join(' ') + '" aria-hidden="true"><defs><clipPath id="px-land"><path d="' + GEO.uk + '"/></clipPath></defs>' +
    '<rect x="-100" y="-100" width="700" height="900" fill="#DCEEF5"/><path d="' + GEO.ie + '" fill="#EEF1F3"/>' +
    '<g clip-path="url(#px-land)">' + ZPOLY.map(function(z){ return '<path d="' + z[1] + '" fill="' + z[0] + '"/>'; }).join('') + '</g>' +
    '<g clip-path="url(#px-land)"><path d="M-100 372H520M286 372V492M-100 492H286M286 482H520" stroke="#fff" stroke-width="2.2" fill="none"/></g><path d="' + GEO.uk + '" fill="none" stroke="#fff" stroke-width="1.2"/>' +
    ZLAB.map(function(z){ return '<text x="' + z[1] + '" y="' + z[2] + '" text-anchor="' + z[3] + '" class="px-zl">' + z[0] + '</text>'; }).join('') +
    '<path d="' + d + '" fill="none" stroke="#8FD0E4" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="' + d + '" fill="none" stroke="#13293C" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><g id="px-airlinks"></g></svg>';
  Object.keys(AP).forEach(function(c){ var a = AP[c]; html += '<span class="px-ap" data-a="' + c + '" title="' + esc(a.name) + ' Airport" style="left:' + ((a.x - VB[0]) / VB[2] * 100).toFixed(2) + '%;top:' + ((a.y - VB[1]) / VB[3] * 100).toFixed(2) + '%">' + IC.plane + '<em>' + esc(a.name.replace(/^London /, '')) + '</em></span>'; });
  ORDER.forEach(function(k){ var p = P[k]; html += '<button type="button" class="px-stop ' + SPOT[k][2] + '" data-k="' + k + '" style="left:' + ((p[0] - VB[0]) / VB[2] * 100).toFixed(2) + '%;top:' + ((p[1] - VB[1]) / VB[3] * 100).toFixed(2) + '%" aria-pressed="false"><i></i><span></span></button>'; });
  /* other big shows that don't have a feature page yet: a quiet dot, and a box on hover or tap */
  var SOON = [['English Riviera Airshow', 'Paignton, Devon', 50.435, -3.56], ['Farnborough International Airshow', 'Farnborough, Hampshire', 51.279, -0.777], ['Old Buckenham Air Show', 'Old Buckenham, Norfolk', 52.497, 1.052],
    ['East Kirkby Air Show', 'East Kirkby, Lincolnshire', 53.142, -0.005], ['Abingdon Air and Country Show', 'Abingdon, Oxfordshire', 51.69, -1.317], ['Sywell Classic Pistons and Props', 'Sywell, Northamptonshire', 52.305, -0.793, [288, 435]],
    ['Armed Forces Weekend', 'Cleethorpes seafront', 53.56, -0.025], ['Armed Forces Day', 'Scarborough seafront', 54.283, -0.397]];
  SOON.forEach(function(q){ var p = q[4] || proj(q[2], q[3]), lx = (p[0] - VB[0]) / VB[2] * 100;
    html += '<button type="button" class="px-soon' + (lx > 68 ? ' rt' : lx < 32 ? ' lf' : '') + '" style="left:' + lx.toFixed(2) + '%;top:' + ((p[1] - VB[1]) / VB[3] * 100).toFixed(2) + '%" aria-label="' + esc(q[0]) + ', ' + esc(q[1]) + '. Feature page coming soon"><i></i><span><b>' + esc(q[0]) + '</b><small>' + esc(q[1]) + '</small><em>Feature page coming soon</em></span></button>'; });
  map.innerHTML = html;

  /* the panel beside the map: the show you picked, the zones, and the key */
  function side(){
    var el = $('px-side'), k = curKey(), r = k && rowOf(k); if (!el) return;
    var h = '';
    if (r) {
      var nm = r.querySelector('.dest').firstChild.textContent, pl = (r.querySelector('.dest small') || {}).textContent || '', n = +(r.querySelector('.plat b') || {}).textContent || 0;
      var modes = [].map.call(r.querySelectorAll('.via > *'), function(v){ var t = v.getAttribute('title') || '', c = v.style.getPropertyValue('--mc'); return '<li style="--mc:' + c + '"><u></u>' + esc(t) + '</li>'; }).join('');
      h += '<div class="px-here"><div class="px-here-h"><span>You are looking at</span><em>' + esc(zoneOf(k)) + '</em></div><div class="px-here-b"><b>' + esc(nm) + '</b><small>' + esc(pl) + '</small>' +
        (airFor(k).length ? '<small class="px-here-air">' + IC.plane + 'Nearest airport, ' + esc(airNames(k)[0]) + '</small>' : '') + '<div class="px-here-n"><strong>' + n + '</strong><span>' + (n === 1 ? 'way in' : 'ways in') + '</span></div>'  +
        '<button type="button" class="px-here-go" data-go="1"><span>See the ways in<small>Trains, buses and coaches</small></span><i aria-hidden="true">→</i></button></div></div>';
    }
    var have = {}; if (r) [].forEach.call(r.querySelectorAll('.via > *'), function(v){ have[v.getAttribute('title')] = 1; });
    var cnt = {}; [].forEach.call(document.querySelectorAll('#wim .xflag'), function(f){ cnt[f.getAttribute('data-fm')] = ((f.querySelector('small') || {}).textContent || '').trim(); });
    h += '<div class="px-status"><div class="px-status-h"><span class="px-status-ic" aria-hidden="true"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6.5" fill="none" stroke="#13293C" stroke-width="2.4"/><path d="M10 6.5v4l2.6 1.6" stroke="#13293C" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span><b>Status for this show</b></div>' +
      [['Train', 'By train', '#D74949', 'sec-train'], ['Bus', 'By bus', '#00A6E2', 'sec-bus'], ['Coach', 'By coach', '#C2255C', 'sec-coach'], ['Park and Ride', 'Park and Ride', '#2BA84A', 'sec-pr']].map(function(m){
        var on = have[m[0]], c = cnt[m[1]];
        return '<button type="button" class="px-st' + (on ? '' : ' off') + '" data-sec="' + m[3] + '"' + (on ? '' : ' disabled') + ' style="--mc:' + m[2] + '"><span class="ln">' + m[0] + '</span><span class="sv">' + (on ? '<b>' + esc(c || 'Running') + '</b><small>Ready to plan</small>' : '<b>No service</b><small>Not mapped for this show</small>') + '</span>' + (on ? '<i aria-hidden="true">›</i>' : '') + '</button>';
      }).join('') + (airFor(k).length ? '<button type="button" class="px-st" data-sec="sec-air" style="--mc:' + AIRC + '"><span class="ln">Flights</span><span class="sv"><b>' + airFor(k).length + (airFor(k).length === 1 ? ' airport' : ' airports') + '</b><small>' + esc(airNames(k).join(' and ')) + '</small></span><i aria-hidden="true">\u203A</i></button>' : '') + '</div>' + KEY;
    var lk = $('px-airlinks'), mine = {}; airFor(k).forEach(function(o){ mine[o.a] = 1; });
    if (lk) lk.innerHTML = P[k] ? airFor(k).map(function(o){ var a = AP[o.a]; return '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + P[k][0] + '" y2="' + P[k][1] + '" stroke="' + AIRC + '" stroke-width="2.2" stroke-dasharray="1 5" stroke-linecap="round"/>'; }).join('') : '';
    [].forEach.call(map.querySelectorAll('.px-ap'), function(e){ e.classList.toggle('on', !!mine[e.getAttribute('data-a')]); });
    el.innerHTML = h;
  }
  $('px-side').addEventListener('click', function(e){
    var st = e.target.closest('.px-st'); if (st && !st.disabled) { if (st.getAttribute('data-sec') === 'sec-air') { airOnly = false; airSync(); } var sc = $(st.getAttribute('data-sec')); show(1, sc || null); return; }
    var g = e.target.closest('.px-here-go'); if (g) show(1);
  });
  function fillStops(){
    [].forEach.call(map.querySelectorAll('.px-stop'), function(b){
      var r = rowOf(b.getAttribute('data-k')), sp = b.querySelector('span'); if (!r) { b.hidden = true; return; }
      var name = r.querySelector('.dest').firstChild.textContent, n = +(r.querySelector('.plat b') || {}).textContent || 0;
      var dots = [].map.call(r.querySelectorAll('.via > *'), function(v){ var c = v.style.getPropertyValue('--c') || v.style.background || getComputedStyle(v).backgroundColor; return '<u style="--mc:' + c + '"></u>'; }).join('');
      sp.innerHTML = esc(name.replace(/^Royal International Air Tattoo$/, 'RIAT').replace(/^International Ayr Show$/, 'Ayr').replace(/ (Air Show|Airshow|Air Shows|Air Festival|Air & Car Show)$/, '')) + '<strong>Your show</strong>';
      b.setAttribute('aria-label', name + ', ' + n + (n === 1 ? ' way in' : ' ways in'));
    });
  }
  map.addEventListener('click', function(e){ var b = e.target.closest('.px-stop'); if (!b) return; var r = rowOf(b.getAttribute('data-k')); if (r) r.click(); });

  /* the Ways in screen for the picked show */
  function screen(){
    var k = curKey(), r = rowOf(k), name = ($('rTitle') || {}).textContent || '', place = (($('rKick') || {}).textContent || '').trim();
    $('px-name').textContent = name; $('px-zone').textContent = zoneOf(k);
    var flags = [].slice.call(document.querySelectorAll('#wim .xflag')), n = 0;
    var body = flags.map(function(f, i){
      var fm = f.getAttribute('data-fm'), m = MODE[fm] || [fm, '#13293C'], cnt = (f.querySelector('small') || {}).textContent || '', id = { 'By train': 'sec-train', 'By bus': 'sec-bus', 'By coach': 'sec-coach', 'Park and Ride': 'sec-pr' }[fm];
      var sec = id && $(id), lab = fm === 'By train' && sec && sec.querySelector('.sg-l'), short = String(name).replace(/ (Air Show|Airshow|Air Shows|Air Festival|Air & Car Show)$/, '');
      var tx = lab ? lab.textContent.replace(/\s+/g, ' ').trim().replace(/^(\S+ to)(\S)/, '$1 $2') : fm === 'By train' ? 'Trains to ' + short: fm === 'By bus' ? 'Buses to ' + short : fm === 'By coach' ? 'Coaches for ' + short : fm === 'Park and Ride' ? 'Park and Ride, leave the car and ride in' : fm;
      n += parseInt(cnt, 10) || 0;
      var row = '<button type="button" class="px-row' + (f.getAttribute('aria-selected') === 'true' ? ' on' : '') + '" data-fm="' + esc(fm) + '" style="--mc:' + m[1] + '"><span class="no">' + (i + 1) + '</span><span class="ch">' + m[0] + '</span><span class="tx">' + esc(tx) + '</span><span class="op">' + esc(cnt) + '</span></button>';
      if (i === 0) row += '<div class="px-call"><b>For</b>' + esc(place || name) + '</div>';
      return row;
    }).join('');
    var av = airFor(k);
    if (av.length) body += '<button type="button" class="px-row px-row-air' + (airOnly ? ' on' : '') + '" data-air="1" style="--mc:' + AIRC + '"><span class="no">' + (flags.length + 1) + '</span><span class="ch">Fly</span><span class="tx">Flights to ' + esc(airNames(k).join(' or ')) + '</span><span class="op">' + av.length + (av.length === 1 ? ' airport' : ' airports') + '</span></button>';
    $('px-screen').innerHTML = '<div class="px-s-top"><b>Airshow Travel</b><time id="px-clock"></time></div><div class="px-s-head">Ways in</div>' + (body || '<div class="px-none">I haven’t mapped any ways in for this show yet. I will add them as soon as the organisers publish their travel details.</div>');
    $('px-led').textContent = name + (place ? ', ' + place : '') + '. ' + (flags.length ? n + (n === 1 ? ' way in' : ' ways in') + ' by ' + flags.map(function(f){ return (MODE[f.getAttribute('data-fm')] || [''])[0].toLowerCase().replace('p+r', 'Park and Ride'); }).join(', ') + '.' : 'No ways in mapped yet.');
    clock();
    [].forEach.call(map.querySelectorAll('.px-stop'), function(b){ var on = b.getAttribute('data-k') === k; b.setAttribute('aria-pressed', on); if (on) { var w = map.parentNode; if (w.scrollWidth > w.clientWidth) w.scrollTo({ left: b.offsetLeft - w.clientWidth / 2, behavior: 'smooth' }); } });
  }
  function clock(){ var c = $('px-clock'); if (!c) return; var t = new Date(); c.textContent = ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2); }
  setInterval(clock, 20000);
  $('px-screen').addEventListener('click', function(e){ var b = e.target.closest('.px-row'); if (!b) return;
    if (b.getAttribute('data-air')) { var sel = document.querySelector('#wim .xflag[aria-selected="true"]'); airOnly = !airOnly; if (sel) { airOnly = true; sel.click(); } airSync(); screen(); setTimeout(function(){ var sa = $('sec-air'); if (sa && !sa.hidden) scrollTo({ top: Math.max(0, sa.getBoundingClientRect().top + scrollY - bar.offsetHeight - 20), behavior: 'smooth' }); }, 120); return; }
    if (airOnly) { airOnly = false; airSync(); } var f = document.querySelector('#wim .xflag[data-fm="' + b.getAttribute('data-fm') + '"]'); if (f) { f.click(); setTimeout(function(){ var sec = $('opts'); if (!sec) return; scrollTo({ top: Math.max(0, sec.getBoundingClientRect().top + scrollY - bar.offsetHeight - 20), behavior: 'smooth' }); }, 80); } });

  /* ---------- tabs ---------- */
  var tabs = [].slice.call(bar.querySelectorAll('.px-tab')), cur = 0;
  if (!jp) { tabs[2].remove(); }
  G.forEach(function(g, i){
    if (!g.box.parentNode) return;
    var live = G.filter(function(x){ return x.box.parentNode; }), li = live.indexOf(g), nx = live[li + 1], pv = live[li - 1], f = document.createElement('div'); f.className = 'px-next';
    f.innerHTML = (pv ? '<button type="button" class="back" data-go="' + pv.i + '"><i aria-hidden="true">←</i><span>Back<small>' + pv.t + '</small></span></button>' : '') +
      (nx ? '<button type="button" class="go" data-go="' + nx.i + '"><span>Next, ' + nx.t.charAt(0).toLowerCase() + nx.t.slice(1) + '<small>' + nx.s + '</small></span><i aria-hidden="true">→</i></button>' : '<button type="button" class="go" data-go="0"><span>Pick a different show<small>Back to the start</small></span><i aria-hidden="true">→</i></button>');
    g.box.appendChild(f);
  });
  if (foot) at.parentNode.insertBefore(foot, at.nextSibling);
  var realSIV = Element.prototype.scrollIntoView;
  function groupOf(el){ for (var i = 0; i < G.length; i++) if (G[i].box.contains(el)) return G[i]; return null; }
  function show(i, target, quiet){
    cur = i;
    G.forEach(function(g, k){ g.box.hidden = k !== i; if (tabs[k]) { tabs[k].setAttribute('aria-selected', k === i ? 'true' : 'false'); tabs[k].tabIndex = k === i ? 0 : -1; tabs[k].classList.toggle('done', k < i); } });
    window.dispatchEvent(new Event('resize'));
    [].forEach.call(G[i].box.querySelectorAll('.msec:not(.in)'), function(el){ el.classList.add('in'); });
    if (quiet) return;
    var y = target ? target.getBoundingClientRect().top + scrollY - bar.offsetHeight - 20 : bar.getBoundingClientRect().top + scrollY;
    scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }
  /* the page scrolls to its own parts in places (Show my options, a picked show, the map): open the right tab first */
  Element.prototype.scrollIntoView = function(o){ var g = groupOf(this); if (g && g.i !== cur) { show(g.i, this === res ? null : this); return; } if (g && this === res) { show(g.i); return; } return realSIV.call(this, o); };
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ show(+t.id.slice(4)); });
    t.addEventListener('keydown', function(e){ var dlt = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!dlt) return; var live = tabs.filter(function(x){ return x.parentNode; }), n = live[(live.indexOf(t) + dlt + live.length) % live.length]; n.focus(); show(+n.id.slice(4)); });
  });
  document.addEventListener('click', function(e){
    var b = e.target.closest('.px-next button'); if (b) { show(+b.getAttribute('data-go')); return; }
    var a = e.target.closest('a[href^="#"]'); if (a) { var el; try { el = document.getElementById(a.getAttribute('href').slice(1)); } catch (x) {} var g = el && groupOf(el); if (g) { e.preventDefault(); show(g.i, el); } }
  });
  /* follow the picked show */
  var PLAN = [
    ['Plan your train', 'Start here', 'Pick the station you are setting off from and the day you are going. I show the train I would catch to be there for around 10am, with the later ones underneath.', ['Your station', 'Your day', 'Live times']],
    ['Your journey', 'Follow the line', 'See the line your train takes and every place you change, including the Tube across London if you need it. This is the part I would screenshot before you leave.', ['Every change', 'Which train', 'Time to connect']],
    ['Your station', 'When you arrive', 'What to expect when you step off the train at STN, and how to get from there to the show.', ['The way out', 'The walk', 'Bus from the station']],
    ['Tickets and tips', 'Before you pay', 'Where I would buy the ticket, how a railcard can take money off, and the last train home so you are not caught out.', ['Buying tickets', 'Railcards', 'Last train home']]
  ];
  function planner(){
    var b = document.querySelector('#sec-train .feature.f-train .tr-box'); if (!b || b.getAttribute('data-px')) return;
    var a = b.querySelector('a.tr-btn'), p = b.querySelector('p'), h = b.querySelector('h4'); if (!a || !h) return;
    var nb = document.querySelector('#sec-train .stn .nameboard b'), m = p && p.textContent.match(/takes to ([^.]+)\./), stn = nb ? nb.textContent.trim() : m ? m[1] : 'the show', sm = a.querySelector('small');
    b.setAttribute('data-px', '1'); b.classList.add('px-plan');
    h.textContent = 'Plan your train to ' + stn;
    var top = document.createElement('div'); top.className = 'px-plan-top';
    top.innerHTML = '<span class="px-plan-ic" aria-hidden="true"><svg viewBox="0 0 20 20"><rect x="4" y="2" width="12" height="12" rx="2.5" fill="#13293C"/><rect x="5.6" y="3.6" width="8.8" height="4.4" fill="#44AED6"/><rect x="5.4" y="10" width="9.2" height="2.2" fill="#fff"/><path d="M7 15l-2 3M13 15l2 3" stroke="#13293C" stroke-width="1.6"/></svg></span><b>Train planner</b><em>' + esc(sm ? sm.textContent : '') + '</em>';
    b.insertBefore(top, b.firstChild);
    var facts = [].slice.call(document.querySelectorAll('#sec-train .stn .tile')).map(function(t){ var l = t.querySelector('small'), v = t.querySelector('b'); return l && v ? '<div><span>' + esc(l.textContent) + '</span><b>' + esc(v.textContent) + '</b></div>' : ''; }).join('');
    var box = document.createElement('div'); box.className = 'px-plan-body';
    box.innerHTML = (facts ? '<div class="px-plan-facts">' + facts + '</div>' : '') +
      '<div class="px-plan-tabs" role="tablist" aria-label="What the train planner covers">' + PLAN.map(function(x, i){ return '<button type="button" role="tab" aria-selected="' + (i ? 'false' : 'true') + '" data-i="' + i + '"><i>' + (i + 1) + '</i><span>' + x[0] + '</span></button>'; }).join('') + '</div>' +
      PLAN.map(function(x, i){ return '<div class="px-plan-pane" role="tabpanel"' + (i ? ' hidden' : '') + '><div class="px-plan-txt"><b>' + x[1] + '</b><p>' + esc(x[2].replace('STN', stn)) + '</p></div><ul>' + x[3].map(function(y){ return '<li>' + y + '</li>'; }).join('') + '</ul></div>'; }).join('');
    b.insertBefore(box, p || a);
    box.addEventListener('click', function(e){ var t = e.target.closest('.px-plan-tabs button'); if (!t) return; var n = +t.getAttribute('data-i');
      [].forEach.call(box.querySelectorAll('.px-plan-tabs button'), function(q, k){ q.setAttribute('aria-selected', k === n ? 'true' : 'false'); });
      [].forEach.call(box.querySelectorAll('.px-plan-pane'), function(q, k){ q.hidden = k !== n; }); });
    if (p) { p.className = 'px-plan-note'; p.textContent = 'These times are from the winter timetable, and the summer one will be different, so please check before you travel.'; }
    a.innerHTML = '<span class="px-plan-go">Open the train planner<small>Start with your station</small></span><i aria-hidden="true">→</i>';
  }
  /* By air: its own section under the other ways in, one card for each airport */
  var airKey = null;
  function airSync(){
    var sa = $('sec-air'), op = $('opts'), sel = document.querySelector('#wim .xflag[aria-selected="true"]');
    if (sel && airOnly && airSync.seen !== sel) airOnly = false;
    airSync.seen = sel;
    if (op) op.classList.toggle('px-hide', airOnly);
    if (sa) sa.hidden = !!sel && !airOnly;
  }
  function air(){
    var k = curKey(), op = $('opts'); if (!op) return;
    var sa = $('sec-air'), list = airFor(k);
    if (!list.length) { if (sa) sa.remove(); airKey = null; return; }
    if (!sa) { sa = document.createElement('section'); sa.id = 'sec-air'; sa.className = 'msec m-air in'; sa.style.setProperty('--m', AIRC); op.parentNode.insertBefore(sa, op.nextSibling); }
    if (airKey !== k) {
      airKey = k;
      var r = rowOf(k), show = r ? r.querySelector('.dest').firstChild.textContent : 'the show';
      sa.innerHTML = '<div class="sg sg-air"><div class="sg-l"><span class="sg-ic">' + IC.plane + '</span><div><small>Flights to</small><b>' + esc(airNames(k).join(' or ')) + '</b></div></div><div class="sg-r"><span class="sg-dep">Arrivals</span><span class="sg-clock">' + list.length + (list.length === 1 ? ' airport' : ' airports') + '</span></div></div>' +
        '<div class="opts">' + list.map(function(o){
          var a = AP[o.a], legs = o.steps.filter(function(s, i){ return !/^Or /.test(s[1]); });
          return '<article class="opt open px-fly" style="--m:' + AIRC + '">' +
            '<div class="oh"><span class="mode-r">' + IC.plane + '</span><span class="t">Fly to ' + esc(a.name) + '</span><span class="s">' + esc(o.sub) + '</span>' +
            '<span class="legs"><span class="leg" style="--lg:' + AIRC + '">' + IC.plane + 'Fly</span>' + legs.map(function(s){ var m = STEP[s[0]] || STEP.stop; return '<span class="ar" aria-hidden="true">›</span><span class="leg' + (s[0] === 'walk' ? ' walk' : '') + '" style="--lg:' + m[1] + '">' + IC[s[0]] + (s[0] === 'stop' ? 'Last leg' : m[0]) + '</span>'; }).join('') + '</span>' +
            '<span class="key"><b>' + esc(o.time) + '</b><small>From the airport, ' + esc(o.by) + '</small></span></div>' +
            '<div class="nxt"><div class="dcard" style="--lc:' + AIRC + ';--oc:' + AIRC + '"><div class="dc-strip"></div><div class="dc-title"><b>' + esc(a.name) + ' Airport</b><span class="dc-i">' + IC.plane + '</span></div>' +
            '<div class="px-fly-b"><div class="px-fly-code"><b>' + o.a + '</b><small>Airport code</small></div><div class="px-fly-code"><b>' + esc(o.time.replace(/^About /, '')) + '</b><small>Airport to ' + (o.a === 'SOU' && k === 'riat' ? 'Salisbury' : 'the show') + '</small></div></div>' +
            '<p class="px-fly-t"><b>Who flies here</b>' + esc(a.fly) + '</p><p class="px-fly-n">Routes change every season, so please check with the airport before you book.</p></div></div>' +
            '<div class="ob"><div class="px-ob-h"><span class="ring">' + IC.stop + '</span><b>From the airport to ' + esc(show) + '</b></div><div class="pane"><ol class="steps">' + o.steps.map(function(s){ var m = STEP[s[0]] || STEP.stop; return '<li class="' + (s[0] === 'walk' ? 'walk' : '') + '" style="--sc:' + m[1] + '"><span class="sn">' + IC[s[0]] + '</span><div class="sx"><span>' + m[0] + '</span><b>' + esc(s[1]) + '</b><p>' + esc(s[2]) + '</p></div></li>'; }).join('') + '</ol>' +
            '<div class="sheet sb"><div class="sb-h"><span class="sb-i" aria-hidden="true">i</span><b>Check before you go</b></div><dl class="sb-rows"><div><dt>Lines</dt><dd>' + legs.filter(function(s, i, arr){ return s[0] !== 'stop' && arr.findIndex(function(z){ return (STEP[z[0]] || [])[0] === (STEP[s[0]] || [])[0]; }) === i; }).map(function(s){ var m = STEP[s[0]]; return '<span class="sb-line" style="--lc:' + m[1] + '">' + m[0] + '</span>'; }).join('') + '</dd></div><div><dt>Journey legs</dt><dd><b>' + legs.length + '</b></dd></div><div><dt>From the airport</dt><dd><b>' + esc(o.time) + '</b></dd></div></dl></div></div></div></article>';
        }).join('') + '</div>' +
        '<div class="px-air-tip"><b>Flying in for the show?</b> I would land the day before if you can. A delayed flight on the morning can cost you the first displays, and the trains are quieter the evening before.</div>';
    }
    airSync();
  }
  var pend = 0; function refresh(){ clearTimeout(pend); pend = setTimeout(function(){ fillStops(); air(); screen(); planner(); side(); }, 60); }
  ['rTitle', 'wim', 'lines', 'results'].forEach(function(i){ var e = $(i); if (e) new MutationObserver(refresh).observe(e, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-selected'] }); });
  [].forEach.call(document.querySelectorAll('#faq details'), function(x){ x.open = true; });
  var fq = $('faq'); if (fq) new MutationObserver(function(){ [].forEach.call(fq.querySelectorAll('details:not([open])'), function(x){ x.open = true; }); }).observe(fq, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  refresh(); show(0, null, true);
})();
