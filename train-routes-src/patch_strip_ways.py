"""Every station on the way in the rail strip (10 Nov 2026): Tube, Elizabeth line and walk changes get their own stations
and vehicle. Run after patch_train_classes.py; it refreshes the train-classes block too. Safe to run again."""
import glob, os
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
JS = open('train-routes-src/v2-parts/train-classes.js').read()
CSS = ('.rs-cls .rs-live{font-weight:700;color:#7CF0A6;margin-left:4px}.railstrip .lane{left:auto;right:16px;transform:none}@media(max-width:640px){.rs-cls{display:block!important;white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis;max-width:calc(100% - 16px);font-size:12px!important}.rs-cls span{margin-right:6px}.rs-cls i{display:none}.rs-cls .rs-live{display:none}.rs-st.tube b{padding-left:16px}.rs-st.tube b::before{left:2px;width:6px;height:6px;border-width:2px}.rs-st.tube b::after{left:1px;width:12px;height:2px}}.rs-st.tube b{box-shadow:inset 0 -3px 0 #0019A8;padding-left:22px;position:relative;max-width:150px}'
       '.rs-st.tube b::before{content:"";position:absolute;left:4px;top:50%;width:8px;height:8px;margin-top:-6px;border:2.5px solid #DC241F;border-radius:50%}'
       '.rs-st.tube b::after{content:"";position:absolute;left:2px;top:50%;width:17px;height:3px;margin-top:-1.5px;background:#0019A8}\n')
R = [
 ("    $('lanelbl').textContent = up ? 'UP LINE' : 'DOWN LINE';", "    $('lanelbl').textContent = up ? 'UP LINE' : 'DOWN LINE';\n    var SP = shown.length > 1 ? (x1 - x0) / (shown.length - 1) : 999;"),
 ('\'" style="left:\' + xs[k] + \'px"><b>\' + p[5] + \'</b>\' + ((p[4] & CHG) ? \'<em>Change</em>\' : \'\')', '\'" style="left:\' + xs[k] + \'px\' + (SP < 100 ? \';width:\' + (SP - 4) + \'px;margin-left:-\' + (SP - 4) / 2 + \'px\' : \'\') + \'"><b\' + (SP < 100 ? \' style="max-width:100%"\' : \'\') + \'>\' + p[5] + \'</b>\' + ((p[4] & CHG) && SP >= 70 ? \'<em>Change</em>\' : \'\')'),
 ("    var stops = [s[0]].concat(s.filter(function(p){ return p[4] & CHG; })).concat([s[s.length - 1]]);",
  "    var SEGS = tcSegs(trip), stops = SEGS.pts;"),
 ("      return '<div class=\"rs-st' + (k === shown.length - 1 ? ' end' : '') + '\"",
  "      return '<div class=\"rs-st' + (k === shown.length - 1 ? ' end' : '') + (p[6] ? ' tube' : '') + '\""),
 ("    tcDraw(tr, TCL, reduce ? TCL.length - 1 : 0);", "    tcDrawSeg(tr, SEGS.segs, reduce ? SEGS.segs.length - 1 : 0);"),
 ("      if (k < stopsAt.length - 1) { wait(1600, function(){ doors('open', to); }); wait(900, function(){ tcDraw(tr, TCL, k + 1, true); }); wait(900, function(){ doors('closing', to); }); wait(400, function(){ doors(null); }); }\n      else wait(1, function(){ doors('end', to); });",
  "      var walked = SEGS.segs[k] && SEGS.segs[k].kind === 'walk', walkNext = SEGS.segs[k + 1] && SEGS.segs[k + 1].kind === 'walk';\n"
  "      if (k < stopsAt.length - 1) {\n"
  "        if (walked) { wait(900, function(){ tcDrawSeg(tr, SEGS.segs, k + 1, true); }); wait(walkNext ? 400 : 1200, function(){ if (!walkNext) doors('open', to); }); if (!walkNext) { wait(900, function(){ doors('closing', to); }); wait(400, function(){ doors(null); }); } }\n"
  "        else { wait(1600, function(){ doors('open', to); }); wait(900, function(){ doors(null); tcDrawSeg(tr, SEGS.segs, k + 1, true); }); if (!walkNext) { wait(900, function(){ doors('open', to); }); wait(900, function(){ doors('closing', to); }); wait(400, function(){ doors(null); }); } }\n"
  "      }\n"
  "      else wait(1, function(){ if (walked) doors(null); else doors('end', to); });"),
]
for f in ['train-routes-src/template-v2.html'] + sorted(glob.glob('train-routes/*.html')):
    s = open(f).read()
    if 'train-classes:' not in s: continue
    i = s.index('  /* train-classes:'); j = s.index('  function railRun(resized){')
    s = s[:i] + JS + s[j:]
    if '.rs-st.tube b' not in s:
        a = '.rs-cls{position'; assert s.count(a) == 1, f; s = s.replace(a, CSS + a)
    for a, b in R:
        if b in s: continue
        assert s.count(a) == 1, (f, a[:60]); s = s.replace(a, b)
    open(f, 'w').write(s); print(f, 'ok')
