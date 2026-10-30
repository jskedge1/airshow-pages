"""Write bus-routes.js (buttons on the show pages) and out/index.html (every route, by show)."""
import json, html
from build import opcol, OPS
built = json.load(open('index.json'))['built']
ids = {b['id'] for b in built}
T = {'ayr': {'bus': ['X77', '4', '42', 'X42', '9']},
     'blackpool': {'bus': ['61', '68', '11', '10', '14', '5C', '42']},
     'clacton': {'bus-colchester': ['74', '74B', '76'], 'bus-local': ['7', '9', '9A', '98A', '3', '2', '2A', '6', '6A', '4', '78', '74', '74B', '76']},
     'duxford': {'bus-local': ['132']},
     'eastbourne': {'bus-station': ['3'], 'bus-brighton': ['12', '12X', '13X'], 'bus-beachy': ['13X'], 'bus-east': ['99', '25', '28', '12', '12X', '13X'], 'beachy-bus': ['13X']},
     'headcorn': {'bus-local': ['12']},
     'midlands': {'bus-247': ['247']},
     'riat': {'bus': ['76', '77']},
     'shuttleworth': {'bus-74': ['74']},
     'southport': {'bus-liverpool': ['47', '300', 'X2'], 'bus-preston': ['X2', '2', '347'], 'bus-other': ['375', '385', 'X37', '37A', '44']}}
M = {}
for sh, tp in T.items():
    for t, nums in tp.items():
        lst = []
        for n in nums:
            i = f'{n.lower()}-{sh}'
            if i in ids and not any(x[1] == i for x in lst):
                th = opcol(OPS.get(i, '')) or {}
                lst.append([n, i, {k: th[k] for k in ('op1', 'op2', 'opink') if k in th}, OPS.get(i, '')])
        if lst: M.setdefault(sh, {})[t] = lst
js = json.dumps(M, separators=(',', ':')).replace('},"', '},\n    "')
open('bus-routes.js', 'w').write(open('bus-routes.tpl.js').read().replace('/*MAP*/', js))

SHOWN = {'ayr': 'International Ayr Show', 'blackpool': 'Blackpool Air Show', 'clacton': 'Clacton Air Show', 'duxford': 'Duxford Air Shows',
         'eastbourne': 'Eastbourne Airshow', 'headcorn': 'Headcorn Airshow', 'midlands': 'Midlands Air Festival', 'riat': 'Royal International Air Tattoo',
         'shuttleworth': 'Shuttleworth Air Shows', 'southport': 'Southport Air Show'}
groups = ''
for sh in SHOWN:
    rs = sorted([b for b in built if b['show'] == sh], key=lambda b: (len(b['num']), b['num']))
    if not rs: continue
    groups += f'<section class="show"><h2>{SHOWN[sh]}</h2><div class="list">' + ''.join(
        f'<a href="{b["id"]}.html"><span class="n">{b["num"]}</span><span class="t">{html.escape(b["title"].split(", ", 1)[-1] if ", " in b["title"] else b["title"])}</span><i aria-hidden="true">→</i></a>'
        for b in rs) + '</div></section>'
import datetime, glob, os
_f = [f for f in glob.glob('raw/*.json')]
_d = datetime.date.fromtimestamp(max(os.path.getmtime(f) for f in _f)) if _f else datetime.date.today()
page = open('index.tpl.html').read().replace('<!--GROUPS-->', groups).replace('<!--COUNT-->', str(len(built))).replace('30 October 2026', f'{_d.day} {_d.strftime("%B %Y")}')
open('out/index.html', 'w').write(page)
print(len(built), 'routes')
