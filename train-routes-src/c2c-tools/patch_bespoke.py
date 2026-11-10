"""Adds the c2c parts to the two train pages built on their own (Headcorn and Shuttleworth), 6 Nov 2026. Safe to run again.
Run after build_c2c.py headcorn shuttleworth. Changes the page script so that:
- a change with a way across London (change.way) gets its own row in The line it takes and says how to get across,
- the c2c stations sit under their own heading in the station picker, in c2c colours,
- c2c is named with its website, and the lead and note mention the c2c stations."""
import json, os, sys
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
sys.path.insert(0, here)
from build_c2c import WAYS  # noqa: E402
from cfg_c2c import LEAD  # noqa: E402

WAYJS = ('  /* c2c-parts: ways across London at a change, from the c2c stations (6 Nov 2026) */\n  var C2CWAYS = ' +
         json.dumps([[a, b, w[0], w[1]] for (a, b), w in WAYS.items()] + [[b, a, w[0], w[2]] for (a, b), w in WAYS.items()], ensure_ascii=False) +
         ';\n  function c2cWay(a, b){ return C2CWAYS.filter(function(w){ return w[0] === a && w[1] === b; })[0] || C2CWAYS.filter(function(w){ return w[1] === a && w[0] === b; })[0]; }\n')

for show in ['headcorn', 'shuttleworth']:
    f = os.path.join('..', '..', 'train-routes', show + '.html'); t = open(f).read()
    def R(a, b, n=1, opt=False):
        global t
        if b in t or (opt and a not in t): return
        assert t.count(a) == n, (show, t.count(a), a[:80]); t = t.replace(a, b)
    R('  function legs(trip){\n', WAYJS + '  function legs(trip){\n')
    R("      if ((s[i][4] & CHG) || BREAK[s[i][1]]) cuts.push(i);", "      if ((s[i][4] & CHG) || BREAK[s[i][1]] || c2cWay(s[i - 1][1], s[i][1])) cuts.push(i);")
    R("      out.push({ line: line, title: a + ' to ' + b, miles: segMiles(s, i0, i1),",
      "      var cw = c2cWay(a, b);\n      if (cw) { out.push({ line: cw[2], title: (cw[2] === 'Walk' ? 'Walk from ' : 'Across London from ') + a + ' to ' + b, miles: 'At the change', change: false, text: cw[3], t: '' }); continue; }\n      out.push({ line: line, title: a + ' to ' + b, miles: segMiles(s, i0, i1),")
    # legList: the train after a way across really starts at the second station
    a = "      out.push({ from: a[1], to: b[1], dep: a[0], arr: b[7] || b[0], op: OPNAME[trip.ops[c - 1]] || trip.opLabel, stops: s.slice(cut[c - 1] + 1, cut[c]).map(function(p){ return p[1]; }) });"
    b = "      var lg = { from: a[1], to: b[1], dep: a[0], arr: b[7] || b[0], op: OPNAME[(trip.legops || trip.ops)[c - 1]] || trip.opLabel, stops: s.slice(cut[c - 1] + 1, cut[c]).map(function(p){ return p[1]; }) };\n      if (lg.stops.length && c2cWay(lg.from, lg.stops[0])) lg.from = lg.stops.shift();\n      out.push(lg);"
    a2 = "      var pc = trip.changes[c - 2]; out.push({ from: (pc && pc.walkTo) || a[1], to: b[1], dep: a[0], arr: b[7] || b[0], op: OPNAME[(trip.legops || trip.ops)[c - 1]] || trip.opLabel, ga: (trip.legops || [])[c - 1] === 'LE', stops: s.slice(cut[c - 1] + 1, cut[c]).map(function(p){ return p[1]; }) });"
    b2 = "      var pc = trip.changes[c - 2], lg = { from: (pc && pc.walkTo) || a[1], to: b[1], dep: a[0], arr: b[7] || b[0], op: OPNAME[(trip.legops || trip.ops)[c - 1]] || trip.opLabel, ga: (trip.legops || [])[c - 1] === 'LE', stops: s.slice(cut[c - 1] + 1, cut[c]).map(function(p){ return p[1]; }) };\n      if (lg.stops.length && c2cWay(lg.from, lg.stops[0])) lg.from = lg.stops.shift();\n      out.push(lg);"
    if a in t or b in t: R(a, b)
    else: R(a2, b2)
    # the Change step says how to get across
    R("'You get in at ' + ch[i].arr + ' and the ' + ch[i].dep", "'You get in at ' + ch[i].arr + (ch[i].way ? '. ' + esc(ch[i].way) + ' The ' : ' and the ') + ch[i].dep", opt=True)
    R("(ch[i].walkTo ? ', walk across the road to ' + esc(ch[i].walkTo) + ', which takes about 5 minutes,' : '') + ' and the ' + ch[i].dep",
      "(ch[i].walkTo ? ', walk across the road to ' + esc(ch[i].walkTo) + ', which takes about 5 minutes,' : '') + (ch[i].way ? '. ' + esc(ch[i].way) + ' The ' : ' and the ') + ch[i].dep", opt=True)
    # operator names
    R("  var OPNAME = { SE: 'Southeastern' };", "  var OPNAME = { SE: 'Southeastern', CC: 'c2c', SN: 'Southern', TL: 'Thameslink', XR: 'Elizabeth line' };", opt=True)
    R("  var OPSITE = { SE: 'https://www.southeasternrailway.co.uk/' };", "  var OPSITE = { SE: 'https://www.southeasternrailway.co.uk/', CC: 'https://www.c2c-online.co.uk/' };", opt=True)
    R("  var OPNAME = { TL: 'Thameslink', GN: 'Great Northern', LE: 'Greater Anglia' };", "  var OPNAME = { TL: 'Thameslink', GN: 'Great Northern', LE: 'Greater Anglia', CC: 'c2c' };", opt=True)
    R("  var OPSITE = { TL: 'https://www.thameslinkrailway.com/', GN: 'https://www.greatnorthernrail.com/', LE: 'https://www.greateranglia.co.uk/' };",
      "  var OPSITE = { TL: 'https://www.thameslinkrailway.com/', GN: 'https://www.greatnorthernrail.com/', LE: 'https://www.greateranglia.co.uk/', CC: 'https://www.c2c-online.co.uk/' };", opt=True)
    R("onui: 'rgb(247,168,206)' } };", "onui: 'rgb(247,168,206)' }, CC: { op1: '#B5177C', navy: '#3A1A5E', onui: '#F2A6D2' } };", opt=True)
    # station picker: c2c heading, and the c2c colour on Headcorn's buttons
    R("      return '<button type=\"button\" data-i=\"' + i + '\" aria-pressed=\"' + (i === hub) + '\">",
      "      var gh = h.group && h.group !== 'c2c' && h.group !== 'uk' && (i === 0 || DATA.hubs[i - 1].group !== h.group) ? '<div class=\"hubgrp\"><b>' + (h.groupTitle || 'From the <i>c2c</i> line') + '</b>' + (h.groupSub ? '<span>' + h.groupSub + '</span>' : '') + '</div>' : '';\n      return gh + '<button type=\"button\" data-i=\"' + i + '\"' + (h.group ? ' style=\"--op1:#B5177C\"' : '') + ' aria-pressed=\"' + (i === hub) + '\">", opt=True)
    R("      return '<button type=\"button\" data-i=\"' + i + '\" data-op=\"' + hubOp(h) + '\"",
      "      var gh = h.group && h.group !== 'c2c' && h.group !== 'uk' && (i === 0 || DATA.hubs[i - 1].group !== h.group) ? '<div class=\"hubgrp\"><b>' + (h.groupTitle || 'From the <i>c2c</i> line') + '</b>' + (h.groupSub ? '<span>' + h.groupSub + '</span>' : '') + '</div>' : '';\n      return gh + '<button type=\"button\" data-i=\"' + i + '\" data-op=\"' + hubOp(h) + '\"", opt=True)
    R("    each($('hub').children, function(b){", "    each($('hub').querySelectorAll('button'), function(b){")
    R(".hubs{display:grid;", ".hubgrp{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;margin:14px 0 0;padding-top:12px;border-top:2px solid var(--line)}\n.hubgrp b{font:800 19px/1.1 var(--c);text-transform:uppercase;color:#23272B}\n.hubgrp b i{font-style:normal;text-transform:none}\n.hubgrp span{font-size:14px;color:var(--muted)}\n.hubs{display:grid;")
    k = t.index('  var LINE = {}'); k = t.index('\n', k) + 1
    if 'c2c-parts: the c2c stations' not in t: t = t[:k] + "  /* c2c-parts: the c2c stations are on the London, Tilbury and Southend line */\n  ['London Fenchurch Street', 'Limehouse', 'West Ham', 'Barking', 'Upminster', 'West Horndon', 'Laindon', 'Basildon', 'Pitsea', 'Benfleet', 'Leigh-on-Sea', 'Chalkwell', 'Westcliff', 'Southend Central', 'Southend East', 'Thorpe Bay', 'Shoeburyness', 'Dagenham Dock', 'Rainham', 'Purfleet', 'Grays', 'Chafford Hundred', 'Ockendon', 'Tilbury Town', 'East Tilbury', 'Stanford-le-Hope'].forEach(function(n){ if (!LINE[n]) LINE[n] = 'London, Tilbury and Southend line'; });\n" + t[k:]
    # wording in the page's CFG
    i = t.index('var CFG=') + 8; cfg, n = json.JSONDecoder().raw_decode(t[i:])
    if 'c2c line' not in cfg['lead']:
        k = cfg['lead'].find(' Pick your station'); cfg['lead'] = cfg['lead'][:k] + LEAD + cfg['lead'][k:]
    if 'c2c' not in cfg['note']:
        cfg['note'] = cfg['note'].replace('Times are from', 'It also covers c2c from eight of its stations, with the connection through London. Times are from', 1)
    t = t[:i] + json.dumps(cfg, ensure_ascii=False) + t[i + n:]
    open(f, 'w').write(t); print('patched', show)
