"""Change counts that include the Tube, Elizabeth line and walking changes, the same everywhere on a train page,
and station tiles that show the changes of the train the page opens on. Run after patch_strip_ways.py. Safe to repeat."""
import glob, os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
R = [
 # station tiles: the train that opens when you tap the tile
 ("      var fewest = +Object.keys(count).sort(function(p, q){ return count[q] - count[p] || p - q; })[0];\n      var best = Math.min.apply(null, tr.filter(function(x){ return x.changes.length === fewest; }).map(function(x){ return x.ride; }));",
  "      var fewest = +Object.keys(count).sort(function(p, q){ return count[q] - count[p] || p - q; })[0];\n      var best = Math.min.apply(null, tr.filter(function(x){ return x.changes.length === fewest; }).map(function(x){ return x.ride; }));\n"
  "      /* show the changes of the train this tile opens on, Tube and walking changes included, so it matches the page */\n"
  "      try { var keepHub = hub, keepIdx = idx; hub = i; var dt = DIR().trips[pickDefault()]; hub = keepHub; idx = keepIdx; if (dt) { fewest = chgN(dt); var same = tr.filter(function(x){ return chgN(x) === fewest; }).map(function(x){ return x.ride; }); best = same.length ? Math.min.apply(null, same) : dt.ride; } } catch (e) { hub = keepHub; }"),
 ("(t.changes.length ? '<span class=\"cg\">Change at ' + names(t.changes.map(function(c){ return c.at; })) + '</span>'",
  "(chgN(t) ? '<span class=\"cg\">Change at ' + names(chgList(t)) + '</span>'"),
 ("(ch.length ? ch.length + ', at ' + chn : 'None, it’s direct')", "(chgN(trip) ? chgN(trip) + ', at ' + names(chgList(trip)) : 'None, it’s direct')"),
 ("var how = t.changes.length ? 'change at ' + names(t.changes.map(function(c){ return c.at; })) : 'direct';", "var how = chgN(t) ? 'change at ' + names(chgList(t)) : 'direct';"),
]
RX = re.compile(r"\(ch\.length \? ch\.length \+ \(ch\.length === 1 \? ' change' : ' changes'\) : ")
for f in ['train-routes-src/template-v2.html'] + sorted(glob.glob('train-routes/*.html')):
    s = open(f).read()
    if 'function chgN(' not in s: continue
    n = 0
    for a, b in R:
        if b in s: continue
        if a in s: s = s.replace(a, b); n += 1
    s, k = RX.subn("(chgN(trip) ? chgN(trip) + (chgN(trip) === 1 ? ' change' : ' changes') : ", s)
    open(f, 'w').write(s); print(os.path.basename(f), n, k)
