"""Adds the c2c parts to template-v2.html (6 Nov 2026). Safe to run more than once.
1. x.walkPairs entries can carry a way across: [a, b, label, text, time], e.g. the Jubilee line from West Ham to Stratford.
   The line list and the Change step then say how to get across instead of "a short walk away".
2. Hubs with group "c2c" sit under their own small heading in the station picker ("From the c2c line")."""
import os
here = os.path.dirname(os.path.abspath(__file__)); f = os.path.join(here, '..', 'template-v2.html')
t = open(f).read()
def R(a, b):
    global t
    if b in t: return  # already done
    assert t.count(a) == 1, (t.count(a), a[:90]); t = t.replace(a, b)
# helper next to isWalkPair
R("  function isWalkPair(a, b){", "  /* c2c-parts: the walkPairs entry for two stations, with any way across London */\n  function walkOf(a, b){ var W = X.walkPairs || []; return W.filter(function(w){ return w[0] === a && w[1] === b; })[0] || W.filter(function(w){ return w[1] === a && w[0] === b; })[0]; }\n  function isWalkPair(a, b){")
# the line it takes
R("      out.push(wk ? { line: 'Walk', title: 'Walk from ' + a + ' to ' + b, miles: 'A few minutes', change: false, text: about, t: '' }",
  "      var WP = (X && X.walkPairs) || [], wo = wk ? (WP.filter(function(w){ return w[0] === a && w[1] === b; })[0] || WP.filter(function(w){ return w[1] === a && w[0] === b; })[0]) : null;\n      out.push(wk ? (wo[2] ? { line: wo[2], title: (wo[2] === 'Walk' ? 'Walk from ' : 'Across London from ') + a + ' to ' + b, miles: wo[4] || 'A few minutes', change: false, text: wo[3] || about, t: '' } : { line: 'Walk', title: 'Walk from ' + a + ' to ' + b, miles: 'A few minutes', change: false, text: about, t: '' })")
# the Change step in Your way in
R("(legsOf[i + 1] && legsOf[i + 1].walkedFrom ? ' It leaves from ' + esc(legsOf[i + 1].from) + ', a short walk away.' : '')",
  "(legsOf[i + 1] && legsOf[i + 1].walkedFrom ? (function(w){ return w && w[3] ? ' It leaves from ' + esc(legsOf[i + 1].from) + '. ' + esc(w[3]) : ' It leaves from ' + esc(legsOf[i + 1].from) + ', a short walk away.'; })(walkOf(legsOf[i + 1].walkedFrom, legsOf[i + 1].from)) : '')")
# station picker groups
R("      return '<button type=\"button\" data-i=\"' + i + '\"' + opStyle(hubOp(h))",
  "      var gh = h.group && h.group !== 'c2c' && (i === 0 || DATA.hubs[i - 1].group !== h.group) ? '<div class=\"hubgrp\"><b>' + (h.groupTitle || 'From the <i>c2c</i> line') + '</b>' + (h.groupSub ? '<span>' + h.groupSub + '</span>' : '') + '</div>' : '';\n      return gh + '<button type=\"button\" data-i=\"' + i + '\"' + opStyle(hubOp(h))")
R("    each($('hub').children, function(b){ b.addEventListener('click', function(){ hub = +b.getAttribute('data-i');",
  "    each($('hub').querySelectorAll('button'), function(b){ b.addEventListener('click', function(){ hub = +b.getAttribute('data-i');")
R(".hubs button{position:relative;", ".hubgrp{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;margin:14px 0 0;padding-top:12px;border-top:2px solid var(--line)}\n.hubgrp b{font:800 19px/1.1 var(--c);text-transform:uppercase;color:#23272B}\n.hubgrp span{font-size:14px;color:var(--muted)}\n.hubgrp b i{font-style:normal;text-transform:none}\n.hubs button{position:relative;")
# 3. the line list splits at the second station of a way across too, so the Underground hop gets its own row
R("      if ((s[i][4] & CHG) || BREAK[s[i][1]]) cuts.push(i);",
  "      if ((s[i][4] & CHG) || BREAK[s[i][1]] || ((X && X.walkPairs) || []).some(function(w){ return (w[0] === s[i - 1][1] && w[1] === s[i][1]) || (w[1] === s[i - 1][1] && w[0] === s[i][1]); })) cuts.push(i);")
R("  LN.groups.forEach(function(g){ g[0].forEach(function(n){ LINE[n] = g[1]; }); });\n", "  LN.groups.forEach(function(g){ g[0].forEach(function(n){ LINE[n] = g[1]; }); });\n" + "  /* c2c-parts: the c2c stations are on the London, Tilbury and Southend line */\n  ['London Fenchurch Street', 'Limehouse', 'West Ham', 'Barking', 'Upminster', 'West Horndon', 'Laindon', 'Basildon', 'Pitsea', 'Benfleet', 'Leigh-on-Sea', 'Chalkwell', 'Westcliff', 'Southend Central', 'Southend East', 'Thorpe Bay', 'Shoeburyness', 'Dagenham Dock', 'Rainham', 'Purfleet', 'Grays', 'Chafford Hundred', 'Ockendon', 'Tilbury Town', 'East Tilbury', 'Stanford-le-Hope'].forEach(function(n){ if (!LINE[n]) LINE[n] = 'London, Tilbury and Southend line'; });\n")
# 5. the journey strip under the header shrinks to fit when a c2c journey has three changes (tablet widths)
R(".jl-hint{display:flex;", "@media (min-width:681px){.jl-node{flex:0 1 150px;min-width:86px}.jl-node b{overflow-wrap:anywhere}.jl-leg{min-width:28px}}\n.jl-hint{display:flex;")
# 6. the journey strip names both stations when a change crosses London (West Ham to Stratford)
R("    ch.forEach(function(c){ nodes.push({ n: c.at, t: 'Arrive ' + c.arr + (c.ap ? ', platform ' + c.ap : '') + '<br>Leave ' + c.dep + (c.dp ? ', platform ' + c.dp : ''), chg: c.wait }); });",
  "    var ci = []; s.forEach(function(p, i){ if (i && i < s.length - 1 && (p[4] & CHG)) ci.push(i); });\n    ch.forEach(function(c, k){ var nx = ci[k] != null && s[ci[k] + 1] ? s[ci[k] + 1][1] : '', wk = nx && ((X && X.walkPairs) || []).some(function(w){ return w[0] === c.at && w[1] === nx; }); nodes.push({ n: wk ? c.at + ' to ' + nx : c.at, t: 'Arrive ' + c.arr + (c.ap ? ', platform ' + c.ap : '') + '<br>Leave ' + (wk ? nx + ' ' : '') + c.dep + (c.dp ? ', platform ' + c.dp : ''), chg: c.wait }); });")
open(f, 'w').write(t); print('patched')
