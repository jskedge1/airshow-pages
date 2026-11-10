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
  signA.innerHTML = '<div class="px-band"><h2>Airshows by public transport</h2><span>All zones</span></div><div class="px-mapwrap"><div class="px-map" id="px-map"></div></div>' +
    '<div class="px-key"><b>Key</b><span class="ln"><u></u>Tap a show on the line</span><span class="st"><u></u>Show</span><span style="--mc:#D74949"><u></u>Train</span><span style="--mc:#00A6E2"><u></u>Bus</span><span style="--mc:#C2255C"><u></u>Coach</span><span style="--mc:#2BA84A"><u></u>Park and Ride</span></div>';
  var signB = document.createElement('div'); signB.className = 'px-sign';
  signB.innerHTML = '<div class="px-band"><h2 id="px-name"></h2><span id="px-zone"></span></div><div class="px-screen" id="px-screen"></div>';
  G[0].box.appendChild(signA); G[0].box.appendChild(board);
  G[1].box.appendChild(signB); G[1].box.appendChild(res);
  if (jp) G[2].box.appendChild(jp);
  if (faq) G[3].box.appendChild(faq);
  if (!jp) { G[2].box.remove(); }

  /* the line map: four zones, the shows as stops on one line, and a marker on the show you picked */
  var map = $('px-map'), total = 0; ZONES.forEach(function(z){ total += z[1].length; });
  var pts = [], zx = 0, html = '';
  ZONES.forEach(function(z, zi){
    var w = z[1].length / total * 100, y = zi % 2 ? 64 : 50;
    html += '<div class="px-zone" style="left:' + zx + '%;width:' + w + '%"><b>' + z[0] + '</b></div>';
    z[1].forEach(function(k, i){ pts.push({ k: k, x: 3 + (zx + w * (i + .5) / z[1].length) * .94, y: y }); });
    zx += w;
  });
  var d = '', prev = null;
  pts.forEach(function(p){ if (!prev) d = 'M0 ' + p.y + ' L' + p.x + ' ' + p.y; else if (prev.y === p.y) d += ' L' + p.x + ' ' + p.y; else { var m = (prev.x + p.x) / 2; d += ' L' + (m - 2.2) + ' ' + prev.y + ' L' + (m + 2.2) + ' ' + p.y + ' L' + p.x + ' ' + p.y; } prev = p; });
  d += ' L100 ' + prev.y;
  html += '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" fill="none" stroke="#8FD0E4" stroke-width="22" vector-effect="non-scaling-stroke" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#13293C" stroke-width="7" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>';
  pts.forEach(function(p, i){ html += '<button type="button" class="px-stop ' + (i % 2 ? 'dn' : 'up') + '" data-k="' + p.k + '" style="left:' + p.x + '%;top:' + p.y + '%" aria-pressed="false"><i></i><span></span></button>'; });
  map.innerHTML = html;
  function fillStops(){
    [].forEach.call(map.querySelectorAll('.px-stop'), function(b){
      var r = rowOf(b.getAttribute('data-k')), sp = b.querySelector('span'); if (!r) { b.hidden = true; return; }
      var name = r.querySelector('.dest').firstChild.textContent, n = +(r.querySelector('.plat b') || {}).textContent || 0;
      var dots = [].map.call(r.querySelectorAll('.via > *'), function(v){ var c = v.style.getPropertyValue('--c') || v.style.background || getComputedStyle(v).backgroundColor; return '<u style="--mc:' + c + '"></u>'; }).join('');
      sp.innerHTML = esc(name.replace(/^Royal International Air Tattoo$/, 'RIAT').replace(/^International Ayr Show$/, 'Ayr').replace(/ (Air Show|Airshow|Air Shows|Air Festival|Air & Car Show)$/, '')) + (dots ? '<em>' + dots + '</em>' : '') + '<strong>Your show</strong>';
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
      var tx = lab ? lab.textContent.replace(/\s+/g, ' ').trim().replace(/^(\S+ to)(\S)/, '$1 $2') : fm === 'By bus' ? 'Buses to ' + short : fm === 'By coach' ? 'Coaches for ' + short : fm === 'Park and Ride' ? 'Park and Ride, leave the car and ride in' : fm;
      n += parseInt(cnt, 10) || 0;
      var row = '<button type="button" class="px-row" data-fm="' + esc(fm) + '" style="--mc:' + m[1] + '"><span class="no">' + (i + 1) + '</span><span class="ch">' + m[0] + '</span><span class="tx">' + esc(tx) + '</span><span class="op">' + esc(cnt) + '</span></button>';
      if (i === 0) row += '<div class="px-call"><b>For</b>' + esc(place || name) + '</div>';
      return row;
    }).join('');
    $('px-screen').innerHTML = '<div class="px-s-top"><b>Airshow Travel</b><time id="px-clock"></time></div><div class="px-s-head">Ways in</div>' + (body || '<div class="px-none">I haven’t mapped any ways in for this show yet. I will add them as soon as the organisers publish their travel details.</div>');
    $('px-led').textContent = name + (place ? ', ' + place : '') + '. ' + (flags.length ? n + (n === 1 ? ' way in' : ' ways in') + ' by ' + flags.map(function(f){ return (MODE[f.getAttribute('data-fm')] || [''])[0].toLowerCase().replace('p+r', 'Park and Ride'); }).join(', ') + '.' : 'No ways in mapped yet.');
    clock();
    [].forEach.call(map.querySelectorAll('.px-stop'), function(b){ var on = b.getAttribute('data-k') === k; b.setAttribute('aria-pressed', on); if (on) { var w = map.parentNode; if (w.scrollWidth > w.clientWidth) w.scrollTo({ left: b.offsetLeft - w.clientWidth / 2, behavior: 'smooth' }); } });
  }
  function clock(){ var c = $('px-clock'); if (!c) return; var t = new Date(); c.textContent = ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2); }
  setInterval(clock, 20000);
  $('px-screen').addEventListener('click', function(e){ var b = e.target.closest('.px-row'); if (!b) return; var f = document.querySelector('#wim .xflag[data-fm="' + b.getAttribute('data-fm') + '"]'); if (f) { f.click(); var sec = $('wim'); setTimeout(function(){ realSIV.call(sec, { behavior: 'smooth', block: 'start' }); }, 60); } });

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
    var y = target ? target.getBoundingClientRect().top + scrollY - bar.offsetHeight - 8 : bar.getBoundingClientRect().top + scrollY;
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
  var pend = 0; function refresh(){ clearTimeout(pend); pend = setTimeout(function(){ fillStops(); screen(); }, 60); }
  ['rTitle', 'wim', 'lines'].forEach(function(i){ var e = $(i); if (e) new MutationObserver(refresh).observe(e, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-pressed'] }); });
  [].forEach.call(document.querySelectorAll('#faq details'), function(x){ x.open = true; });
  var fq = $('faq'); if (fq) new MutationObserver(function(){ [].forEach.call(fq.querySelectorAll('details:not([open])'), function(x){ x.open = true; }); }).observe(fq, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  refresh(); show(0, null, true);
})();
