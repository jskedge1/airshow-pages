"""Get on and Get off signs on the road strip become drop down menus listing every stop on the picked bus, with its time
(10 Nov 2026, Jack's comment). Picking a stop shows it on the sign and on the map. Needs add_stopnames.py first. Safe to repeat.
run: python3 bus-routes-src/add_stoppicker.py"""
import glob, os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
CSS = '''<style id="rs-pick">
.rs-name{cursor:pointer}
.rs-name b{padding-right:30px;position:relative}
.rs-name b::after{content:"";position:absolute;right:11px;top:50%;width:7px;height:7px;margin-top:-6px;border-right:2.5px solid #15181B;border-bottom:2.5px solid #15181B;transform:rotate(45deg)}
.rs-name select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:16px;border:0}
.rs-name:focus-within{outline:3px solid #F2B233;outline-offset:2px}
.rs-name:hover b{background:#F1F4F6}
</style>
'''
FN = r'''  /* the Get on and Get off signs are drop down menus of every stop on this bus */
  function rsPick(sel, lab, s, cur){
    if (!sel) return;
    sel.innerHTML = s.map(function(p, i){ return '<option value="' + i + '"' + (p === cur ? ' selected' : '') + '>' + p[0] + '  ' + String(p[1]).replace(/</g, '&lt;') + '</option>'; }).join('');
    sel.onchange = function(){
      var p = s[+sel.value]; if (!p) return;
      lab.textContent = p[5] || p[1]; lab.title = p[1];
      try { map.setView([p[2], p[3]], 15, { animate: !reduce }); } catch (e) {}
      var li = document.querySelectorAll('#stops li.stop')[+sel.value];
      if (li) { [].forEach.call(document.querySelectorAll('#stops .active'), function(x){ x.classList.remove('active'); }); li.classList.add('active'); }
    };
  }
'''
A = '  /* road strip: the stop you get on at and the stop you get off at, for the bus you picked */\n  function stripStops(trip, s, oi){'
B = "a.textContent = on[5] || on[1]; a.title = on[1]; b.textContent = off[5] || off[1]; b.title = off[1];\n"
C = '<div class="rs-name on" id="rsOn"><span>Get on</span><b id="rsOnN"></b></div><div class="rs-name off" id="rsOff"><span>Get off</span><b id="rsOffN"></b></div>'
D = ('<label class="rs-name on" id="rsOn"><span>Get on</span><b id="rsOnN"></b><select id="rsOnS" aria-label="Every stop on this bus, pick where you get on"></select></label>'
     '<label class="rs-name off" id="rsOff"><span>Get off</span><b id="rsOffN"></b><select id="rsOffS" aria-label="Every stop on this bus, pick where you get off"></select></label>')
n = 0
for f in sorted(glob.glob('bus-routes/*.html')):
    s = open(f).read()
    if 'id="rs-names"' not in s or 'id="rs-pick"' in s: continue
    if s.count(A) != 1 or s.count(B) != 1 or s.count(C) != 1: print('SKIP', f); continue
    s = s.replace(A, FN + A).replace(C, D)
    s = s.replace(B, B + "    rsPick(document.getElementById('rsOnS'), a, s, on); rsPick(document.getElementById('rsOffS'), b, s, off);\n")
    s = s.replace('</head>', CSS + '</head>', 1)
    open(f, 'w').write(s); n += 1
print(n, 'pages')
