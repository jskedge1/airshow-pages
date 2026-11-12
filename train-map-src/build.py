#!/usr/bin/env python3
"""Build train-map.html: every train company on the train route pages, with
their stops and real track, plus the planner's national lines that lead to
every UK airshow, terminal stations and major hubs.

Reads:
  train-routes-src/<show>-data.json      (v2 route pages)
  train-routes/shuttleworth.html, headcorn.html  (var DATA= inside the page)
  journey-planner.js                     (STA, LINES, SHOWS)
Writes:
  train-map.html (template.html with the data put in)

Run from anywhere: python3 train-map-src/build.py
"""
import heapq, json, math, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'train-map-src')

PAGES = [  # show key, data file, train route page
    ('ayr', 'train-routes-src/ayr-data.json', 'ayr'),
    ('blackpool', 'train-routes-src/blackpool-data.json', 'blackpool'),
    ('clacton', 'train-routes-src/clacton-data.json', 'clacton'),
    ('cosford', 'train-routes-src/cosford-data.json', 'cosford'),
    ('duxford', 'train-routes-src/duxford-data.json', 'duxford'),
    ('eastbourne', 'train-routes-src/eastbourne-data.json', 'eastbourne'),
    ('gransden', 'train-routes-src/gransden-data.json', 'gransden'),
    ('midlands', 'train-routes-src/midlands-data.json', 'midlands'),
    ('southport', 'train-routes-src/southport-data.json', 'southport'),
    ('wales', 'train-routes-src/wales-data.json', 'wales'),
    ('shuttleworth', 'train-routes/shuttleworth.html', 'shuttleworth'),
    ('headcorn', 'train-routes/headcorn.html', 'headcorn'),
]

CODE_OP = {  # two letter codes used by the Shuttleworth and Headcorn pages
    'AW': 'Transport for Wales', 'CC': 'c2c', 'CH': 'Chiltern Railways',
    'EM': 'East Midlands Railway', 'GC': 'Grand Central Railway', 'GN': 'Great Northern',
    'GR': 'London North Eastern Railway', 'GW': 'Great Western Railway', 'GX': 'Gatwick Express',
    'HT': 'Hull Trains', 'LD': 'Lumo', 'LE': 'Greater Anglia', 'LM': 'West Midlands Railway',
    'NT': 'Northern', 'SR': 'ScotRail', 'SW': 'South Western Railway', 'TL': 'Thameslink',
    'TP': 'TransPennine Express', 'VT': 'Avanti West Coast', 'XC': 'CrossCountry',
    'XR': 'Elizabeth line', 'SE': 'Southeastern', 'SN': 'Southern', 'ME': 'Merseyrail',
}
PLANNER_OP = {  # journey planner company names to the route page names
    'GWR': 'Great Western Railway', 'LNER': 'London North Eastern Railway',
    'London Northwestern Railway': 'West Midlands Railway',
}
SKIP_PLANNER = {'Tube', 'Walk'}

# Colours only (no logos), close to each company's own colours.
COLOURS = {
    'Avanti West Coast': '#004354', 'c2c': '#B7007C', 'Chiltern Railways': '#00BFFF',
    'CrossCountry': '#660F21', 'East Midlands Railway': '#713563', 'Elizabeth line': '#6950A1',
    'Gatwick Express': '#EB1E2D', 'Grand Central Railway': '#1D1D1B', 'Great Northern': '#0099FF',
    'Great Western Railway': '#0A493E', 'Greater Anglia': '#D2232A', 'Hull Trains': '#DE005C',
    'London North Eastern Railway': '#CE0E2D', 'Lumo': '#2B6EF2', 'Merseyrail': '#FFD200',
    'Northern': '#262262', 'ScotRail': '#1E467D', 'South Western Railway': '#24398C',
    'Southeastern': '#389CFF', 'Southern': '#7AB929', 'Stansted Express': '#6B717B',
    'Thameslink': '#E9438D', 'TransPennine Express': '#09A4EC', 'Transport for Wales': '#FF0000',
    'West Midlands Railway': '#E8891C',
}

# Stations some route pages place on a namesake elsewhere, or on a stand in
# point in London. Each use picks the place nearest its neighbours on the trip.
PLACES = {
    'Reedham': [(52.5643, 1.5597), (51.3311, -0.1234)],
    'Brampton': [(52.3953, 1.5434), (54.9322, -2.7039)],
    'Whitchurch': [(51.2378, -1.3377), (52.9684, -2.6717), (51.5205, -3.2235)],
    'Bramley': [(51.3300, -1.0608), (53.8053, -1.6371)],
    'Millbrook': [(52.0542, -0.5324), (50.9114, -1.4338)],
    'Swinton': [(53.5147, -2.3361), (53.4870, -1.3080)],
    'Radcliffe-on-Trent': [(52.9473, -1.0379)],
    'James St': [(53.4048, -2.9918)],
    'Moreton in Marsh': [(51.9922, -1.7004)],
    'Newton Le Willows': [(53.4532, -2.6204)],
}

# Hops the route pages list as a train leg where there is no railway.
NOT_RAIL = {frozenset(('Bedford', 'St Neots'))}

LONDON_TERMINI = {
    'London Kings Cross', 'London St Pancras', 'London St Pancras International', 'London Euston',
    'London Paddington', 'London Liverpool Street', 'London Fenchurch Street', 'London Victoria',
    'London Waterloo', 'London Bridge', 'London Charing Cross', 'London Marylebone',
    'London Cannon Street', 'London Blackfriars', 'Moorgate',
}
CITY_TERMINI = {
    'Glasgow Central', 'Glasgow Queen Street', 'Liverpool Lime Street', 'Liverpool Central',
    'Manchester Piccadilly', 'Manchester Victoria', 'Leeds', 'Edinburgh Waverley', 'Aberdeen',
    'Inverness', 'Penzance', 'Norwich', 'Cardiff Central', 'Swansea', 'Hull', 'Blackpool North',
    'Southport', 'Clacton-on-Sea', 'Brighton', 'Hastings', 'Plymouth', 'Bristol Temple Meads',
    'Felixstowe', 'Lowestoft', 'Great Yarmouth', 'Sheringham', 'Harwich Town', 'Weymouth', 'Cleethorpes',
    'Redditch', 'Dover Priory', 'Ore', 'Seaford', 'Skegness', 'Llandudno', 'Pwllheli', 'Carmarthen',
    'Stranraer', 'Largs', 'Ardrossan Harbour', 'Lichfield Trent Valley', 'Bedford',
}


def load(path):
    p = os.path.join(ROOT, path)
    if p.endswith('.json'):
        return json.load(open(p))
    s = open(p).read()
    i = s.index('var DATA=') + len('var DATA=')
    return json.JSONDecoder().raw_decode(s[i:])[0]


def planner():
    js = os.path.join(ROOT, 'journey-planner.js')
    code = (
        "const fs=require('fs');const js=fs.readFileSync(process.argv[1],'utf8');"
        "function grab(n,o,c){const h='var '+n+' = ';let j=js.indexOf(h)+h.length,d=0,k=j;"
        "for(;k<js.length;k++){if(js[k]==o)d++;else if(js[k]==c){d--;if(!d)break}}"
        "return eval('('+js.slice(j,k+1)+')')}"
        "process.stdout.write(JSON.stringify({STA:grab('STA','{','}'),LINES:grab('LINES','[',']'),SHOWS:grab('SHOWS','{','}')}))"
    )
    return json.loads(subprocess.check_output(['node', '-e', code, js]))


def hav(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def plen(pts):
    return sum(hav(pts[i], pts[i + 1]) for i in range(len(pts) - 1))


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    n = math.hypot(dx, dy) or 1e-12
    best, bi = -1, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * (pts[i][0] - a[0]) - dx * (pts[i][1] - a[1])) / n
        if d > best:
            best, bi = d, i
    if best <= eps:
        return [a, b]
    return rdp(pts[:bi + 1], eps)[:-1] + rdp(pts[bi:], eps)


def trips(o):
    if isinstance(o, dict):
        if 's' in o and 'changes' in o and isinstance(o['s'], list):
            yield o
        else:
            for v in o.values():
                yield from trips(v)
    elif isinstance(o, list):
        for v in o:
            yield from trips(v)


def main():
    P = planner()
    STA, LINES, SHOWS = P['STA'], P['LINES'], P['SHOWS']

    st = {}      # name -> {ll, ops:set, shows:set, hub:bool, code}
    edges = {}   # (a,b) sorted -> {g:[...], ops:set, shows:set, real:bool}

    def station(name, ll):
        # same name, different place (Reedham, Bramley, Millbrook...) stays apart
        key, n = name, 1
        while key in st and hav(st[key]['ll'], ll) > 3:
            n += 1
            key = '%s|%d' % (name, n)
        if key not in st:
            st[key] = {'name': name, 'll': [round(ll[0], 5), round(ll[1], 5)], 'ops': set(), 'shows': set(), 'hub': False, 'code': ''}
        return key

    def edge(a, b, geom, real):
        k = tuple(sorted((a, b)))
        e = edges.get(k)
        if e is None:
            if k[0] != a:
                geom = geom[::-1]
            e = edges[k] = {'g': geom, 'ops': set(), 'shows': set(), 'real': real}
        elif real and not e['real']:
            e['g'] = geom if k[0] == a else geom[::-1]
            e['real'] = True
        return e

    bad = 0
    for show, path, _ in PAGES:
        d = load(path)
        names = [s[0] for s in d['stops']]
        keys = [station(s[0], (s[1], s[2]) if s[0] not in PLACES else PLACES[s[0]][0]) for s in d['stops']]
        for h in d['hubs'] if isinstance(d['hubs'], list) else []:
            if h.get('name') in names:
                st[keys[names.index(h['name'])]]['hub'] = True
        seen = set()
        for t in trips(d):
            seq = list(t['s'])
            ops = [CODE_OP.get(o, o) for o in (t.get('legops') or t.get('ops') or [])]
            if not ops:
                continue
            # a Tube or walk between London stations at the start or end
            if t.get('walkStart') and len(seq) > 2:
                seq = seq[1:]
                if len(ops) > 1:
                    ops = ops[1:]
            if t.get('walkEnd') and len(seq) > 2:
                seq = seq[:-1]
                if len(ops) > 1:
                    ops = ops[:-1]
            walkat = {c.get('at') for c in t.get('changes', []) if c.get('wayTo') and c.get('wayTo') != c.get('at')}
            key = (tuple(x[1] for x in seq), tuple(ops))
            if key in seen:
                continue
            seen.add(key)
            # split at change stations (type 13)
            legs, cur = [], []
            for i, x in enumerate(seq):
                if cur and cur[-1] == x[1]:
                    continue
                cur.append(x[1])
                if x[2] == 13 and len(cur) > 1:
                    legs.append(cur)
                    nxt = seq[i + 1][1] if i + 1 < len(seq) else x[1]
                    # a walk to another station: the next train starts there
                    cur = [x[1]] if nxt == x[1] or names[x[1]] not in walkat else []
            legs.append(cur)
            legs = [l for l in legs if len(l) > 1]
            if len(legs) != len(ops):
                if len(ops) == 1:
                    legs = [[x[1] for x in seq]]
                else:
                    bad += 1
                    continue
            for leg, op in zip(legs, ops):
                if all(frozenset((names[leg[q]], names[leg[q + 1]])) in NOT_RAIL for q in range(len(leg) - 1)):
                    continue
                lk = [keys[si] for si in leg]
                for j, si in enumerate(leg):
                    nm = names[si]
                    if nm in PLACES:
                        nb = [d['stops'][leg[q]] for q in (j - 1, j + 1) if 0 <= q < len(leg) and names[leg[q]] not in PLACES]
                        ll = min(PLACES[nm], key=lambda c: sum(hav(c, (x[1], x[2])) for x in nb))
                        lk[j] = station(nm, ll)
                for j, si in enumerate(leg):
                    S = st[lk[j]]
                    S['ops'].add(op)
                    S['shows'].add(show)
                for j in range(len(leg) - 1):
                    a, b = leg[j], leg[j + 1]
                    if frozenset((names[a], names[b])) in NOT_RAIL:
                        continue
                    g = d['seg'].get('%d|%d' % (a, b))
                    if g is None:
                        r = d['seg'].get('%d|%d' % (b, a))
                        g = r[::-1] if r else None
                    if g and (lk[j] != keys[a] or lk[j + 1] != keys[b]):
                        g = None  # the page drew it to the wrong place
                    real = g is not None
                    if g is None:
                        g = [st[lk[j]]['ll'], st[lk[j + 1]]['ll']]
                    e = edge(lk[j], lk[j + 1], g, real)
                    e['ops'].add(op)
                    e['shows'].add(show)
    print('route page trips skipped (legs did not match):', bad, file=sys.stderr)

    # tie planner codes to names (by name, else nearest within 400 m)
    code_name = {}
    for c, (nm, la, lo) in STA.items():
        same = [k for k in st if st[k]['name'] == nm and hav(st[k]['ll'], (la, lo)) < 3]
        if same:
            code_name[c] = same[0]
        else:
            best = min(st, key=lambda n: hav(st[n]['ll'], (la, lo)))
            if hav(st[best]['ll'], (la, lo)) < 0.4:
                code_name[c] = best
            else:
                code_name[c] = station(nm, (la, lo))
        st[code_name[c]]['code'] = c

    # graph over real track for routing the planner's express lines
    adj = {}
    for (a, b), e in edges.items():
        if e['real']:
            w = plen(e['g'])
            adj.setdefault(a, []).append((b, w))
            adj.setdefault(b, []).append((a, w))

    def route(a, b):
        if a not in adj or b not in adj:
            return None
        dist, prev, q = {a: 0}, {}, [(0, a)]
        lim = hav(st[a]['ll'], st[b]['ll']) * 1.4 + 8
        while q:
            dd, u = heapq.heappop(q)
            if u == b:
                break
            if dd > dist.get(u, 1e9) or dd > lim:
                continue
            for v, w in adj[u]:
                nd = dd + w
                if nd < dist.get(v, 1e9):
                    dist[v], prev[v] = nd, u
                    heapq.heappush(q, (nd, v))
        if b not in dist or dist[b] > lim:
            return None
        p = [b]
        while p[-1] != a:
            p.append(prev[p[-1]])
        return p[::-1]

    # express runs the route pages draw straight: send them along the real track
    moved = 0
    for k in [k for k, e in edges.items() if not e['real']]:
        p = route(*k)
        if p and len(p) > 2:
            e = edges.pop(k)
            for i in range(len(p) - 1):
                f = edges[tuple(sorted((p[i], p[i + 1])))]
                f['ops'] |= e['ops']
                f['shows'] |= e['shows']
            moved += 1
    print('straight stretches moved onto the track:', moved, file=sys.stderr)

    lines_out = []
    for comp, title, calls in LINES:
        if comp in SKIP_PLANNER:
            continue
        op = PLANNER_OP.get(comp, comp)
        names = [code_name[c] for c, _ in calls if c in code_name]
        lines_out.append([op, title, names])
        for n in names:
            st[n]['ops'].add(op)
        for j in range(len(names) - 1):
            a, b = names[j], names[j + 1]
            p = route(a, b)
            if p:
                for k in range(len(p) - 1):
                    edges[tuple(sorted((p[k], p[k + 1])))]['ops'].add(op)
            else:
                edge(a, b, [st[a]['ll'], st[b]['ll']], False)['ops'].add(op)

    # shows: the stations the last leg leaves from
    shows_out = {}
    for k, s in SHOWS.items():
        arr = []
        for a in s['arr']:
            nm = code_name.get(a['c'])
            if nm:
                arr.append([nm, a['how'], a['m'], a['t']])
                st[nm]['shows'].add(k)
                st[nm]['showStation'] = True
        shows_out[k] = {'name': s['name'], 'll': s['dest'], 'page': s['page'], 'arr': arr,
                        'route': next((r for sk, _, r in PAGES if sk == k), '')}

    # kinds of station
    deg = {}
    for a, b in edges:
        deg[a] = deg.get(a, 0) + 1
        deg[b] = deg.get(b, 0) + 1
    ends = set()
    for _, _, names in lines_out:
        if names:
            ends.update((names[0], names[-1]))
    stations = []
    idx = {}
    for nm, S in sorted(st.items()):
        if not S['ops'] and not S.get('showStation'):
            continue
        if nm in LONDON_TERMINI or nm in CITY_TERMINI or deg.get(nm, 0) == 1:
            kind = 't'
        elif S['hub'] or len(S['ops']) >= 4 or S['code']:
            kind = 'h'
        else:
            kind = 's'
        if S.get('showStation'):
            kind += 'a'
        idx[nm] = len(stations)
        stations.append([S['name'], S['ll'][0], S['ll'][1], kind, sorted(S['ops']), sorted(S['shows']), S['code']])

    ops = sorted({o for e in edges.values() for o in e['ops']})
    opi = {o: i for i, o in enumerate(ops)}
    shk = list(shows_out)
    shi = {k: i for i, k in enumerate(shk)}
    out_edges = []
    for (a, b), e in edges.items():
        if not e['ops'] or a not in idx or b not in idx:
            continue
        g = rdp([[round(p[0], 5), round(p[1], 5)] for p in e['g']], 0.00025)
        g = [[round(p[0], 4), round(p[1], 4)] for p in g]
        out_edges.append([idx[a], idx[b], [opi[o] for o in sorted(e['ops'])],
                          [shi[s] for s in sorted(e['shows']) if s in shi], 1 if e['real'] else 0, g])
    for s in stations:
        s[4] = [opi[o] for o in s[4] if o in opi]
        s[5] = [shi[x] for x in s[5] if x in shi]

    data = {
        'ops': [[o, COLOURS.get(o, '#555')] for o in ops],
        'shows': [dict(shows_out[k], key=k) for k in shk],
        'st': stations,
        'ed': out_edges,
        'lines': [[opi[o], t, [idx[n] for n in ns if n in idx]] for o, t, ns in lines_out if o in opi],
    }
    js = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
    tpl = open(os.path.join(SRC, 'template.html')).read()
    html = tpl.replace('/*DATA*/null', js)
    open(os.path.join(ROOT, 'train-map.html'), 'w').write(html)
    kinds = {}
    for s in stations:
        kinds[s[3]] = kinds.get(s[3], 0) + 1
    print('companies %d, stations %d %s, stretches %d, lines %d, data %d KB' % (
        len(ops), len(stations), kinds, len(out_edges), len(data['lines']), len(js) // 1024), file=sys.stderr)


if __name__ == '__main__':
    main()
