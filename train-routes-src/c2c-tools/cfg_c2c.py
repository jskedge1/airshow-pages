"""Adds the c2c wording, colours, live board codes and ways across London to each show's cfg (6 Nov 2026).
Reads ways_used.json from build_c2c.py. Safe to run again.
Run: python3 cfg_c2c.py [show ...]"""
import json, os, sys, glob, statistics
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
sys.path.insert(0, here)
from build_c2c import WAYS, way  # noqa: E402

C2C_COL = {'op1': '#6A2C91', 'navy': '#2E1245', 'onui': '#D6B8EE', 'opink': '#FFFFFF', 'opd': '#4E1F6C', 'tint': '#F3EDF8', 'tintln': '#DCC9EC', 'accink': '#FFFFFF'}
CRS = {'Shoeburyness': 'SRY', 'Southend Central': 'SOC', 'Leigh-on-Sea': 'LES', 'Benfleet': 'BEF', 'Basildon': 'BSO', 'Grays': 'GRY',
       'Upminster': 'UPM', 'Barking': 'BKG', 'West Ham': 'WEH', 'London Fenchurch Street': 'FST', 'Pitsea': 'PSE', 'Laindon': 'LAI', 'Chafford Hundred': 'CFH'}
NAME_CRS = {'London Fenchurch Street': 'FST', 'London Liverpool Street': 'LST', 'West Ham': 'WEH', 'Stratford': 'SRA', 'London Euston': 'EUS', 'London Kings Cross': 'KGX',
            'London St Pancras': 'STP', 'London Victoria': 'VIC', 'London Bridge': 'LBG', 'London Blackfriars': 'BFR', 'Glasgow Queen Street': 'GLQ', 'Glasgow Central': 'GLC',
            'Birmingham New Street': 'BHM', 'Birmingham Moor Street': 'BMO',
            'Wigan North Western': 'WGN', 'Wigan Wallgate': 'WGW', 'Liverpool Lime Street': 'LIV', 'Liverpool Central': 'LVC', 'London Paddington': 'PAD', 'Whitechapel': 'ZLW'}
LEAD = ' If you’re starting on the c2c line, from Shoeburyness, Southend, Basildon, Grays or anywhere along to Barking, I’ve added those stations too, with the change in London.'
GAONLY = ' I’ve also added eight c2c stations, with the c2c train into London and the connection on from there.'

# how long traintimes allows for each way across, from the journeys downloaded
ALLOW = {}
for f in glob.glob('raw/*.json'):
    r = json.load(open(f))
    for k in ('there', 'back'):
        for j in r[k]:
            for g in j:
                if not g['op']:
                    m = lambda s: int(s[11:13]) * 60 + int(s[14:16])
                    ALLOW.setdefault(frozenset((g['from'], g['to'])), []).append((m(g['arr']) - m(g['dep'])) % 1440)
def allow(a, b):
    v = ALLOW.get(frozenset((NAME_CRS.get(a), NAME_CRS.get(b))))
    if not v: return 'About 10 minutes' if way(a, b)[0] == 'Walk' else 'About 20 minutes'
    return 'About ' + str(int(round(statistics.median(v) / 5.0) * 5) or 5) + ' minutes'

USED = json.load(open('ways_used.json'))
for show in sys.argv[1:] or list(USED):
    f = os.path.join('..', show + '-cfg.json')
    if not os.path.exists(f): print('no cfg for', show, '(edit the page directly)'); continue
    c = json.load(open(f)); x = c.setdefault('x', {})
    wp = [w for w in x.get('walkPairs', []) if len(w) < 3]  # keep Wigan and other plain walks, replace any c2c ones
    for a, b in USED[show]:
        if any({w[0], w[1]} == {a, b} for w in wp): continue
        for p, q in ((a, b), (b, a)):
            w = way(p, q); wp.append([p, q, w[0], w[1], allow(p, q)])
    if wp: x['walkPairs'] = wp
    if c.get('opColors') is not None: c['opColors']['c2c'] = C2C_COL
    if 'opCodes' in x and 'CC' not in x['opCodes']: x['opCodes'].append('CC')
    x.setdefault('crs', {}).update(CRS)
    LTS = ['London Fenchurch Street', 'Limehouse', 'West Ham', 'Barking', 'Upminster', 'West Horndon', 'Laindon', 'Basildon', 'Pitsea', 'Benfleet', 'Leigh-on-Sea', 'Chalkwell',
           'Westcliff', 'Southend Central', 'Southend East', 'Thorpe Bay', 'Shoeburyness', 'Dagenham Dock', 'Rainham', 'Purfleet', 'Grays', 'Chafford Hundred', 'Ockendon',
           'Tilbury Town', 'East Tilbury', 'Stanford-le-Hope']
    if 'lines' in c:
        g = [q for q in c['lines']['groups'] if q[1] != 'London, Tilbury and Southend line']
        g.append([[n for n in LTS if n not in {m for q in g for m in q[0]}], 'London, Tilbury and Southend line'])
        c['lines']['groups'] = g
    if 'c2c line' not in c['lead']:
        k = c['lead'].find(' Pick your station')
        c['lead'] = c['lead'][:k] + LEAD + c['lead'][k:] if k > 0 else c['lead'] + LEAD
    if 'c2c stations' not in c.get('gaOnly', ''): c['gaOnly'] = c.get('gaOnly', '') + GAONLY
    json.dump(c, open(f, 'w'), ensure_ascii=False, indent=1)
    print(show, 'walkPairs', [w[:3] + [w[4]] for w in wp if len(w) > 2])
