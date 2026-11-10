"""Headcorn and Shuttleworth keep their settings inside the page. After build_hubs.py, this adds the new stations' train company colours (OPCOL),
live board companies (OPS), tile colour per station (CFG.hubOps), station codes for live times (CRS) and the wording.
Run: python3 patch_embedded.py headcorn shuttleworth"""
import json, re, sys, os
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
sys.argv, shows = ['x'], sys.argv[1:]
from build_hubs import HUBN, OPCODE
import patch_cfg  # noqa: colours (runs nothing for no shows)
COLORS = patch_cfg.COLORS; word = patch_cfg.word; when = patch_cfg.when
SH = json.load(open('shows.json'))
for show in shows:
    f = f'../../train-routes/{show}.html'; s = open(f).read()
    i0 = s.index('var DATA=') + 9; D, n = json.JSONDecoder().raw_decode(s[i0:])
    uk = [h for h in D['hubs'] if h.get('group') == 'uk']
    m = re.search(r"var OPCOL = (\{.*?\});\n", s); opcol = m.group(1)
    have = set(re.findall(r'\b([A-Z]{2}): \{', opcol))
    add = []
    for name, code in OPCODE.items():
        if code in have or name not in COLORS: continue
        c = COLORS[name]; add.append(f"{code}: {{ op1: '{c['op1']}', navy: '{c['navy']}', onui: '{c['onui']}' }}"); have.add(code)
    if add: s = s.replace(opcol, opcol[:-1].rstrip() + ', ' + ', '.join(add) + ' }', 1)
    m = re.search(r"var OPS = \[(.*?)\];", s); ops = re.findall(r"'([A-Z]{2})'", m.group(1))
    allc = sorted({c for c in OPCODE.values()} | set(ops), key=lambda c: (c not in ops, c))
    s = s.replace(m.group(0), 'var OPS = [' + ', '.join(f"'{c}'" for c in allc) + '];', 1)
    j0 = s.index('var CFG=') + 8; C, cn = json.JSONDecoder().raw_decode(s[j0:])
    C.setdefault('hubOps', {})
    for h in uk:
        lo = h['dirs'][0]['trips'][0].get('legops') or ['TL']
        C['hubOps'][h['code']] = next((c for c in lo if c not in ('CC',)), lo[0])
    for row in C.get('facts', []):
        if row[0] == 'Stations covered': row[1] = f"{len(D['hubs'])} stations across the UK"
    if 'city termini' not in C['note']:
        C['note'] = C['note'].replace(' It also covers c2c', f' It also covers the big stations and city termini across the UK, using the times for {when(SH[show]["days"])}, checked on 10 November 2026. It also covers c2c', 1)
    s = s[:j0] + json.dumps(C, ensure_ascii=False) + s[j0 + cn:]
    m = re.search(r"var CRS = \{(.*?)\};", s)
    crs = m.group(1); names = set(re.findall(r"'([^']+)':", crs))
    extra = [f"'{nm}': '{cd}'" for cd, nm, _ in HUBN if nm not in names and any(h['name'] == nm for h in uk)]
    if extra: s = s.replace(m.group(0), 'var CRS = {' + crs.rstrip() + ', ' + ', '.join(extra) + ' };', 1)
    open(f, 'w').write(s)
    print(show, len(D['hubs']), 'stations,', len(uk), 'new; colours added', len(add))
