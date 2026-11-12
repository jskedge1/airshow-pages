"""Applies station_fixes.py to the DATA inside built train pages, without a full
rebuild (some pages carry later edits that their cfg files do not have).
Run from anywhere: python3 train-routes-src/fix_stations.py
build.py also applies the fixes, so a full rebuild keeps them."""
import json, os, sys
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
import station_fixes
pages = sys.argv[1:] or ['ayr', 'blackpool', 'clacton', 'cosford', 'duxford', 'eastbourne', 'gransden',
                         'midlands', 'southport', 'wales', 'shuttleworth', 'headcorn']
for show in pages:
    p = os.path.join(here, '..', 'train-routes', show + '.html')
    s = open(p).read()
    i = s.index('var DATA=') + len('var DATA=')
    d, n = json.JSONDecoder().raw_decode(s[i:])
    # St Neots to Bedford is a bus, not a train: drop journeys that show it as one
    names = [x[0] for x in d['stops']]
    def bus_hop(t):
        q = [names[x[1]] for x in t['s']]
        return any({q[k], q[k + 1]} == {'St Neots', 'Bedford'} for k in range(len(q) - 1))
    def strip(o):
        if isinstance(o, dict):
            for v in o.values():
                strip(v)
        elif isinstance(o, list):
            o[:] = [v for v in o if not (isinstance(v, dict) and 's' in v and 'changes' in v and bus_hop(v))]
            for v in o:
                strip(v)
    strip(d)
    notes = station_fixes.fix(d)
    s = s[:i] + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + s[i + n:]
    open(p, 'w').write(s)
    print(show + ': ' + (', '.join(notes) or 'nothing to fix'))
