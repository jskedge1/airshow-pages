"""Adds train-classes (v2-parts/train-classes.js) to the template and the built train pages: the rail strip
draws the class of train that usually works each leg, and swaps it at each change. Safe to run again."""
import glob, sys
JS = open('train-routes-src/v2-parts/train-classes.js').read()
CSS = ('.rs-cls{position:absolute;left:16px;bottom:9px;z-index:4;display:flex;align-items:center;gap:8px;font:700 14px/1.2 var(--f);color:#fff;'
       'background:rgba(5,6,7,.55);padding:6px 10px;border-radius:4px;white-space:nowrap}.rs-cls span{color:#F4C21B}.rs-cls i{font-style:normal;color:#C9CED2}'
       '@media(max-width:640px){.rs-cls{left:8px;bottom:6px;font-size:12.5px;padding:4px 8px}}\n')
def patch(f):
    s = open(f).read()
    if 'class="rtrain"' not in s or 'function railRun' not in s: return 'skip'
    if 'train-classes:' in s: return 'done already'
    a = '.railstrip .rtrain{position:absolute'
    assert s.count(a) == 1; s = s.replace(a, CSS + a)
    a = '<div class="rs-tag" id="rsTag"></div>'
    assert s.count(a) == 1; s = s.replace(a, a + '<div class="rs-cls" id="rsCls" aria-live="polite"></div>')
    a = '  function railRun(resized){'
    assert s.count(a) == 1; s = s.replace(a, JS + a)
    a = "    var starterClear = false;\n"
    assert s.count(a) == 1; s = s.replace(a, a + "    var TCL = tcLegs(trip);\n")
    a = "    if (reduce || !railGo) { starterClear = !!reduce;"
    assert s.count(a) == 1; s = s.replace(a, "    tcDraw(tr, TCL, reduce ? TCL.length - 1 : 0);\n" + a)
    a = "      if (k < stopsAt.length - 1) { wait(1600, function(){ doors('open', to); });"
    assert s.count(a) == 1; s = s.replace(a, "      if (k < stopsAt.length - 1) { wait(1600, function(){ doors('open', to); }); wait(900, function(){ tcDraw(tr, TCL, k + 1, true); });")
    open(f, 'w').write(s); return 'ok'
for f in ['train-routes-src/template-v2.html'] + sorted(glob.glob('train-routes/*.html')):
    print(f, patch(f))
