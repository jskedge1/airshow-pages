"""Road strip on every bus route page (10 Nov 2026, Jack's comment): a slower bus drawn in the company's colours with its name
on the side, single or double deck. It waits at the Get on stop with its doors open, closes them, drives to the Get off stop
and opens them again under an "Alight here for <show>" sign. Needs add_stopnames.py first. Safe to run again.
run: python3 bus-routes-src/add_busstrip.py"""
import glob, os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
CSS = '''<style id="rs-bus">
.roadstrip{height:118px}.roadstrip.dd{height:134px}
.roadstrip .rbus{left:0;top:auto;bottom:11px;width:auto;height:auto;transition:none!important;will-change:transform;overflow:visible;z-index:1}
.roadstrip .rbus .dl,.roadstrip .rbus .dr{transition:transform .7s cubic-bezier(.4,0,.2,1)}
.roadstrip .rbus.open .dl{transform:translateX(-5.5px)}.roadstrip .rbus.open .dr{transform:translateX(5.5px)}
.roadstrip .rstop.on{left:calc(max(16px,50% - 574px) + 104px)}
.rs-btag{position:absolute;bottom:54px;z-index:3;transform:translateX(-50%);background:#050607;border:2px solid #23292E;padding:4px 9px 3px;font:700 13px/1 var(--c,var(--f));letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;color:#3CFF7A;text-shadow:0 0 8px rgba(60,255,122,.6);opacity:0;transition:opacity .3s}
.rs-btag.on{opacity:1}.rs-btag.amber{color:#FFC21A;text-shadow:0 0 8px rgba(255,194,26,.6)}
.roadstrip.dd .rs-btag{bottom:76px}
@media(max-width:700px){
  .roadstrip{height:140px}.roadstrip.dd{height:156px}
  .roadstrip .rstop.on{left:calc(max(16px,50% - 574px) + 80px)}
  .rs-btag{bottom:48px;font-size:12px;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis}
  .roadstrip.dd .rs-btag{bottom:64px}
}
</style>
'''
FN = r'''  /* road strip bus: the kind of bus the company usually runs on this route, in its colours, with the doors working */
  var RB_DOUBLE = { 'Blackpool Transport': 1, 'Brighton and Hove': 1 }, RB_DD_ROUTES = { 'Stagecoach': /^(X\d+|99|68)$/i, 'Stagecoach West Scotland': /^X\d+$/i }, RB_MINI = { 'Cuckmere Buses': 1 };
  var rbRaf = 0, rbSeen = false, rbLast = null;
  function rbKind(){ var o = CFG.operator, n = String(CFG.num || ''); return RB_MINI[o] ? 'mini' : (RB_DOUBLE[o] || (RB_DD_ROUTES[o] && RB_DD_ROUTES[o].test(n))) ? 'double' : 'single'; }
  function rbSvg(kind){
    var th = CFG.theme || {}, c1 = th.op1 || '#13293C', c2 = th.op2 || '#F2B233', c3 = th.op3 || c2, ink = th.opink || '#fff';
    var L = kind === 'mini' ? 78 : kind === 'double' ? 112 : 118, H = kind === 'double' ? 52 : 34, top = 2, fl = top + H;   /* floor line */
    var name = String(CFG.operator || '').replace(/ and Adventure Travel| West Scotland| Bus and Coach/, ''), o = '';
    var glass = '#9FD8EE', dark = '#16242E';
    o += '<path d="M2 ' + fl + ' V' + (top + 5) + ' Q2 ' + top + ' 8 ' + top + ' H' + (L - 9) + ' Q' + (L - 1) + ' ' + top + ' ' + L + ' ' + (top + 9) + ' V' + fl + ' Z" fill="' + c1 + '"/>';
    o += '<path d="M' + (L * .36) + ' ' + fl + ' L' + (L * .52) + ' ' + top + ' H' + (L * .6) + ' L' + (L * .44) + ' ' + fl + ' Z" fill="' + c3 + '" opacity=".9"/>';
    o += '<rect x="2" y="' + (fl - 8) + '" width="' + (L - 2) + '" height="3.4" fill="' + c2 + '"/>';
    o += '<rect x="2" y="' + top + '" width="' + (L - 11) + '" height="2.2" fill="rgba(255,255,255,.2)"/><rect x="2" y="' + (fl - 4.6) + '" width="' + (L - 2) + '" height="4.6" fill="rgba(0,0,0,.2)"/>';
    function row(y, h, x0, x1, n){ var w = (x1 - x0 - (n - 1) * 1.6) / n, s = ''; for (var i = 0; i < n; i++) { var x = x0 + i * (w + 1.6); s += '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + h + '" rx="1.2" fill="' + glass + '"/><rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + (h * .3).toFixed(1) + '" rx="1.2" fill="rgba(255,255,255,.35)"/>'; } return s; }
    var dx = L - 30;   /* door, just behind the front wheel */
    if (kind === 'double') {
      o += row(top + 5, 12, 6, L - 20, 6);
      o += '<path d="M' + (L - 18) + ' ' + (top + 5) + ' H' + (L - 7) + ' Q' + (L - 2.5) + ' ' + (top + 6) + ' ' + (L - 2) + ' ' + (top + 17) + ' H' + (L - 18) + ' Z" fill="' + glass + '"/>';
      o += '<rect x="2" y="' + (top + 20.5) + '" width="' + (L - 2) + '" height="1" fill="rgba(0,0,0,.25)"/>';
      o += row(top + 26, 11, 6, dx - 3, 5);
      o += '<path d="M' + (L - 17) + ' ' + (top + 25) + ' H' + (L - 2) + ' V' + (top + 39) + ' H' + (L - 17) + ' Z" fill="' + glass + '"/>';
      o += '<rect x="' + (L - 20) + '" y="' + (top + 1.2) + '" width="15" height="3.4" rx="1" fill="#101214"/><text x="' + (L - 12.5) + '" y="' + (top + 4) + '" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="700" font-size="3.4" fill="#FFB000">' + (CFG.num || '') + '</text>';
      o += '<text x="' + (L * .22) + '" y="' + (top + 24.6) + '" font-family="Barlow,sans-serif" font-weight="700" font-size="4.6" letter-spacing=".25" fill="' + ink + '">' + name + '</text>';
    } else {
      o += row(top + 7, 12, 6, dx - 3, kind === 'mini' ? 3 : 5);
      o += '<path d="M' + (L - 17) + ' ' + (top + 6) + ' H' + (L - 6) + ' Q' + (L - 2.5) + ' ' + (top + 7) + ' ' + (L - 2) + ' ' + (top + 21) + ' H' + (L - 17) + ' Z" fill="' + glass + '"/>';
      o += '<rect x="' + (L - 26) + '" y="' + (top + 1.4) + '" width="21" height="4" rx="1" fill="#101214"/><text x="' + (L - 15.5) + '" y="' + (top + 4.7) + '" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="700" font-size="3.8" fill="#FFB000">' + (CFG.num || '') + '</text>';
      o += '<text x="8" y="' + (fl - 9.6) + '" font-family="Barlow,sans-serif" font-weight="700" font-size="' + (kind === 'mini' ? 4 : 4.8) + '" letter-spacing=".25" fill="' + ink + '">' + name + '</text>';
    }
    /* doors: two leaves that slide apart, with the lit doorway behind */
    var dy = kind === 'double' ? top + 25 : top + 6, dh = fl - dy - 1;
    o += '<rect x="' + dx + '" y="' + dy + '" width="11" height="' + dh + '" fill="#FFE9A8"/><rect x="' + (dx + 1.5) + '" y="' + (dy + 2) + '" width="8" height="' + (dh - 2) + '" fill="#3A4046"/>';
    ['dl', 'dr'].forEach(function(c, i){ var x = dx + i * 5.5; o += '<g class="' + c + '"><rect x="' + x + '" y="' + dy + '" width="5.5" height="' + dh + '" fill="' + dark + '"/><rect x="' + (x + .9) + '" y="' + (dy + 1.2) + '" width="3.7" height="' + (dh - 5) + '" rx=".7" fill="' + glass + '"/></g>'; });
    o += '<rect x="' + (dx - .5) + '" y="' + (dy - .8) + '" width="12" height=".9" fill="rgba(0,0,0,.4)"/>';
    /* wheels, lights, mirror */
    [16, L - 20].forEach(function(cx){ o += '<path d="M' + (cx - 7.5) + ' ' + fl + ' A7.5 7.5 0 0 1 ' + (cx + 7.5) + ' ' + fl + ' Z" fill="#0B0B0B"/><circle cx="' + cx + '" cy="' + fl + '" r="5.6" fill="#0B0B0B"/><circle cx="' + cx + '" cy="' + fl + '" r="3" fill="none" stroke="#5B636A" stroke-width=".8"/><circle cx="' + cx + '" cy="' + fl + '" r="1.3" fill="#9AA5AE"/>'; });
    o += '<circle cx="' + (L - 1) + '" cy="' + (fl - 6) + '" r="4.5" fill="rgba(255,250,210,.25)"/><rect x="' + (L - 3.2) + '" y="' + (fl - 7.2) + '" width="3.2" height="2.6" rx=".8" fill="#FFF7D6"/><rect x="2" y="' + (fl - 7.2) + '" width="2" height="3" fill="#E5484D"/>';
    o += '<rect x="' + (L - .5) + '" y="' + (top + (kind === 'double' ? 24 : 6)) + '" width="3" height="1" fill="#16242E"/><rect x="' + (L + 1.5) + '" y="' + (top + (kind === 'double' ? 24 : 6)) + '" width="1.6" height="5" rx=".6" fill="#16242E"/>';
    return { svg: o, w: L + 4, h: fl + 6, door: dx + 5.5 };
  }
  function rbRun(home){
    var strip = document.querySelector('.roadstrip'), bus = strip && strip.querySelector('.rbus'); if (!bus) return;
    var kind = rbKind(), b = rbSvg(kind), sc = innerWidth <= 700 ? .82 : 1.04;
    strip.classList.toggle('dd', kind === 'double');
    bus.setAttribute('viewBox', '0 0 ' + b.w + ' ' + b.h); bus.style.width = (b.w * sc) + 'px'; bus.style.height = (b.h * sc) + 'px'; bus.innerHTML = b.svg;
    var tag = strip.querySelector('.rs-btag'); if (!tag) { tag = document.createElement('div'); tag.className = 'rs-btag'; strip.appendChild(tag); }
    var sr = strip.getBoundingClientRect(), pOn = strip.querySelector('.rstop.on'), pOff = strip.querySelector('.rstop:not(.on)');
    var xa = pOn ? pOn.getBoundingClientRect().left - sr.left + 13 : 30, xb = pOff ? pOff.getBoundingClientRect().left - sr.left + 13 : sr.width - 30, door = b.door * sc;
    /* the door stops just past each stop pole */
    var from = xa + 10 - door, to = xb - 14 - door;
    function place(x){ bus.style.transform = 'translateX(' + x + 'px)'; }
    function say(t, cls, x){ tag.textContent = t || ''; tag.className = 'rs-btag' + (t ? ' on' : '') + (cls ? ' ' + cls : ''); if (x != null) tag.style.left = Math.min(sr.width - 12 - tag.offsetWidth / 2, Math.max(12 + tag.offsetWidth / 2, x + door)) + 'px'; }
    var end = home ? 'Alight here' : 'Alight here for ' + (CFG.showName || 'the show');
    cancelAnimationFrame(rbRaf);
    if (reduce || !rbSeen) { place(reduce ? to : from); bus.classList.toggle('open', true); say(reduce ? end : 'Doors open', '', reduce ? to : from); return; }
    var steps = [
      { d: 2200, fn: function(){ bus.classList.add('open'); say('Doors open', '', from); } },
      { d: 1300, fn: function(){ bus.classList.remove('open'); say('Doors closing', 'amber', from); } },
      { d: 500, fn: function(){ say(''); } },
      { d: Math.max(9000, Math.abs(to - from) / 85 * 1000), a: from, b: to },
      { d: 700, fn: function(){ bus.classList.add('open'); say(end, '', to); } }
    ], si = 0, t0 = null, fired = false;
    place(from);
    function tick(ts){
      var st = steps[si]; if (!st) return;
      if (t0 === null) { t0 = ts; fired = false; }
      if (st.fn && !fired) { st.fn(); fired = true; }
      var p = Math.min((ts - t0) / st.d, 1);
      if (st.a != null) { var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; place(st.a + (st.b - st.a) * e); }
      if (p >= 1) { si++; t0 = null; }
      rbRaf = requestAnimationFrame(tick);
    }
    rbRaf = requestAnimationFrame(tick);
  }
  function rbStart(home){
    rbLast = !!home; rbRun(rbLast);
    if (rbSeen) return;
    var strip = document.querySelector('.roadstrip'); if (!strip) return;
    if (!('IntersectionObserver' in window)) { rbSeen = true; rbRun(rbLast); return; }
    if (rbStart.io) return;
    rbStart.io = new IntersectionObserver(function(es, ob){ es.forEach(function(e){ if (e.isIntersecting) { ob.disconnect(); rbSeen = true; setTimeout(function(){ rbRun(rbLast); }, 400); } }); }, { threshold: .6 });
    rbStart.io.observe(strip);
  }
  (function(){ var w = -1; addEventListener('resize', function(){ var s = document.querySelector('.roadstrip'), n = s ? s.clientWidth : 0; if (!n || n === w) return; w = n; if (rbLast !== null) rbRun(rbLast); }); })();
'''
A = '  /* road strip: the stop you get on at and the stop you get off at, for the bus you picked */\n  function stripStops(trip, s, oi){'
B = "b.textContent = off[5] || off[1]; b.title = off[1];\n"
for f in sorted(glob.glob('bus-routes/*.html')):
    s = open(f).read()
    if 'id="rs-names"' not in s: continue
    s = re.sub(r'<style id="rs-bus">.*?</style>\n', '', s, flags=re.S)
    i = s.find('  /* road strip bus:')
    if i >= 0: s = s[:i] + s[s.index(A):]
    if s.count(A) != 1 or s.count(B) != 1: print('SKIP', f); continue
    s = s.replace(A, FN + A)
    if 'try { rbStart(home)' not in s: s = s.replace(B, B + '    try { rbStart(home); } catch (e) {}\n')
    s = s.replace('</head>', CSS + '</head>', 1)
    open(f, 'w').write(s)
print('done')
