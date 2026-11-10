"""Road strip on every bus route page: names the stop you get on at (left) and the stop you get off at (right),
following the bus you pick (10 Nov 2026, Jack's comment). Safe to run again.
run: python3 bus-routes-src/add_stopnames.py"""
import glob, os
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
CSS = '''<style id="rs-names">
.roadstrip{height:86px}
.roadstrip::before{top:auto;bottom:24px;margin-top:0}
.roadstrip .rbus{top:auto;bottom:10px}
.roadstrip .rstop{top:auto;bottom:10px;right:max(16px,calc(50% - 574px))}
.roadstrip .rstop.on{right:auto;left:max(16px,calc(50% - 574px))}
.roadstrip .lane{left:50%;transform:translateX(-50%);top:9px;color:rgba(255,255,255,.55)}
.rs-name{position:absolute;top:7px;z-index:2;display:flex;align-items:stretch;max-width:min(44vw,420px);background:#fff;box-shadow:0 4px 10px -4px rgba(0,0,0,.6)}
.rs-name.on{left:max(16px,calc(50% - 574px))}
.rs-name.off{right:max(16px,calc(50% - 574px))}
.rs-name span{flex:none;display:flex;align-items:center;padding:0 9px;font:700 14px/1 var(--f);color:#fff;background:#1F7F7B;white-space:nowrap}
.rs-name.off span{background:#D74949}
.rs-name b{padding:6px 10px 5px;font:800 17px/1.1 var(--c,var(--f));text-transform:uppercase;letter-spacing:.01em;color:#15181B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:700px){
  .roadstrip{height:104px}
  .roadstrip .lane{display:none}
  .rs-name{max-width:calc(100% - 32px);top:6px}
  .rs-name.off{top:36px;right:auto;left:max(16px,calc(50% - 574px))}
  .rs-name span{font-size:13px;min-width:62px;justify-content:center}.rs-name b{font-size:15.5px}
}
</style>
'''
HTML = ('<div class="rs-name on" id="rsOn"><span>Get on</span><b id="rsOnN"></b></div><div class="rs-name off" id="rsOff"><span>Get off</span><b id="rsOffN"></b></div>'
        '<svg class="rstop on" viewBox="0 0 26 46"><rect x="12" y="14" width="2.5" height="32" fill="#cfd6dc"/><rect x="2" y="1" width="22" height="15" rx="2.5" fill="#fff" stroke="#1F7F7B" stroke-width="2.2"/><rect x="6.5" y="4.5" width="13" height="8" rx="1.2" fill="#1F7F7B"/><rect x="8" y="5.6" width="10" height="2.8" rx=".5" fill="#fff"/></svg>')
FN = '''  /* road strip: the stop you get on at and the stop you get off at, for the bus you picked */
  function stripStops(trip, s, oi){
    var a = document.getElementById('rsOnN'), b = document.getElementById('rsOffN'); if (!a || !b) return;
    var home = trip.big !== s[0][0] && oi >= 0;
    var on = home ? s[oi] : s[0], off = home ? s[s.length - 1] : (oi > 0 ? s[oi] : s[s.length - 1]);
    a.textContent = on[5] || on[1]; a.title = on[1]; b.textContent = off[5] || off[1]; b.title = off[1];
  }
'''
A1 = '  function draw(){'
A2 = '    var oi = -1; s.forEach(function(p, i){ if (p[4] & OFF) oi = i; });'
A3 = '<span class="lane">BUS LANE</span>'
for f in sorted(glob.glob('bus-routes/*.html')):
    s = open(f).read()
    if 'class="roadstrip"' not in s: continue
    if 'id="rs-names"' in s: print('done already', f); continue
    if s.count(A1) != 1 or A3 not in s: print('SKIP', f); continue
    i = s.index(A1); j = s.find(A2, i)
    if j < 0 or j - i > 600: print('SKIP no oi', f); continue
    s = s[:j + len(A2)] + '\n    try { stripStops(trip, s, oi); } catch (e) {}' + s[j + len(A2):]
    s = s[:i] + FN + s[i:]
    s = s.replace(A3, A3 + HTML, 1)
    s = s.replace('</head>', CSS + '</head>', 1)
    open(f, 'w').write(s); print('ok', f)
