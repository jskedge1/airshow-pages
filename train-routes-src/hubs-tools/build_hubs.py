"""Adds the main UK stations (10 Nov 2026), based on build_c2c.py. Adds the c2c stations to each show's train page data (6 Nov 2026).
Reads raw/ and cache/ from scrape.py, then for each show adds eight c2c starting stations to <show>-data.json
(or the DATA block inside train-routes/<show>.html for Headcorn and Shuttleworth, which are built differently).
Any c2c hubs already there are replaced, so it is safe to run again after a fresh scrape.
Run: python3 build_c2c.py [show ...]   then   cd .. && python3 build.py <show>"""
import json, re, os, sys, glob, math, heapq, hashlib, statistics
import xml.etree.ElementTree as ET
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
sys.path.append(os.path.join(here, '..', 'duxford-tools'))
sys.path.insert(0, here)
from parse2 import calls as parse_calls
from scrape import leg_url  # noqa: E402  (scrape.py only runs its jobs when called directly)

SH = json.load(open('shows.json'))
HUBN = [('STP','London St Pancras','St Pancras'),('PAD','London Paddington','Paddington'),('LST','London Liverpool Street','Liverpool Street'),('WAT','London Waterloo','Waterloo'),
 ('VIC','London Victoria','Victoria'),('LBG','London Bridge','London Bridge'),('MYB','London Marylebone','Marylebone'),('BHM','Birmingham New Street','Birmingham'),('BHI','Birmingham International','Birmingham Intl'),
 ('COV','Coventry','Coventry'),('WVH','Wolverhampton','Wolverhampton'),('MKC','Milton Keynes Central','Milton Keynes'),('CRE','Crewe','Crewe'),('SOT','Stoke-on-Trent','Stoke'),('DBY','Derby','Derby'),
 ('NOT','Nottingham','Nottingham'),('LEI','Leicester','Leicester'),('SHF','Sheffield','Sheffield'),('DON','Doncaster','Doncaster'),('HUL','Hull','Hull'),('MCV','Manchester Victoria','Man Victoria'),
 ('NCL','Newcastle','Newcastle'),('CAR','Carlisle','Carlisle'),('EDB','Edinburgh Waverley','Edinburgh'),('GLQ','Glasgow Queen Street','Glasgow QS'),
 ('BRI','Bristol Temple Meads','Bristol'),('CDF','Cardiff Central','Cardiff'),('NWP','Newport','Newport'),('SWA','Swansea','Swansea'),('EXD','Exeter St Davids','Exeter'),('PLY','Plymouth','Plymouth'),
 ('RDG','Reading','Reading'),('OXF','Oxford','Oxford'),('SOU','Southampton Central','Southampton'),('SAL','Salisbury','Salisbury'),('BTN','Brighton','Brighton'),
 ('CBG','Cambridge','Cambridge'),('PBO','Peterborough','Peterborough'),('NRW','Norwich','Norwich'),('IPS','Ipswich','Ipswich')]
C2C = HUBN
GROUP_SUB = 'Starting further away? These are the big stations and city termini around the UK, with the changes that work well on the way to Blackpool North.'
C2C_BIG = {n for _,n,_ in HUBN} | {'Preston','Crewe','Wigan North Western','Warrington Bank Quay','Manchester Piccadilly','Manchester Oxford Road','Leeds','York','Lancaster','Carlisle','Birmingham New Street','Stafford','Stockport','Wolverhampton','Huddersfield','Sheffield','Doncaster','Bristol Temple Meads','Cheltenham Spa','Newport','Reading','Oxford','Milton Keynes Central','Peterborough','Ely','Nottingham','Derby','Edinburgh Waverley','Motherwell','Oxenholme Lake District','Glasgow Central','Blackburn','Bolton','Chorley','Kirkham & Wesham','Poulton-le-Fylde','Salford Crescent'} | {'Shoeburyness', 'Southend Central', 'Leigh-on-Sea', 'Benfleet', 'Pitsea', 'Basildon', 'Grays', 'Upminster', 'Barking', 'West Ham',
           'London Fenchurch Street', 'Stratford', 'London Liverpool Street', 'London Euston', 'London Kings Cross', 'London St Pancras', 'Chafford Hundred', 'Laindon'}

# ways across between two stations at a change: label, words for the page, time (traintimes allowance is added when known)
WAYS = {
    ('London Fenchurch Street', 'London Liverpool Street'): ['Walk', 'Fenchurch Street to Liverpool Street is about a 10 minute walk, and the station signs point the way. I would allow a bit longer with children or bags.', 'Liverpool Street to Fenchurch Street is about a 10 minute walk, and the station signs point the way. I would allow a bit longer with children or bags.'],
    ('West Ham', 'Stratford'): ['Underground', 'Take the Jubilee line one stop from West Ham to Stratford. The DLR runs between the two as well.', 'Take the Jubilee line one stop from Stratford to West Ham. The DLR runs between the two as well.'],
    ('London Fenchurch Street', 'London Euston'): ['Underground', 'Walk to Aldgate, about 5 minutes from Fenchurch Street, and take the Circle or Metropolitan line to Euston Square. Euston is a short walk from there.', 'Walk to Euston Square, a short walk from Euston, and take the Circle or Metropolitan line to Aldgate. Fenchurch Street is about 5 minutes from there.'],
    ('London Fenchurch Street', 'London Kings Cross'): ['Underground', 'Walk to Aldgate, about 5 minutes from Fenchurch Street, and take the Circle or Metropolitan line to Kings Cross St Pancras.', 'Take the Circle or Metropolitan line from Kings Cross St Pancras to Aldgate. Fenchurch Street is about 5 minutes from there.'],
    ('London Fenchurch Street', 'London St Pancras'): ['Underground', 'Walk to Aldgate, about 5 minutes from Fenchurch Street, and take the Circle or Metropolitan line to Kings Cross St Pancras.', 'Take the Circle or Metropolitan line from Kings Cross St Pancras to Aldgate. Fenchurch Street is about 5 minutes from there.'],
    ('London Fenchurch Street', 'London Victoria'): ['Underground', 'Walk to Tower Hill, a couple of minutes from Fenchurch Street, and take the District or Circle line to Victoria.', 'Take the District or Circle line from Victoria to Tower Hill. Fenchurch Street is a couple of minutes from there.'],
    ('West Ham', 'London Bridge'): ['Underground', 'Take the Jubilee line from West Ham to London Bridge.', 'Take the Jubilee line from London Bridge to West Ham.'],
    ('London Fenchurch Street', 'London Blackfriars'): ['Underground', 'Walk to Tower Hill, a couple of minutes from Fenchurch Street, and take the District or Circle line to Blackfriars.', 'Take the District or Circle line from Blackfriars to Tower Hill. Fenchurch Street is a couple of minutes from there.'],
    ('Wigan North Western', 'Wigan Wallgate'): ['Walk', 'Wigan North Western and Wigan Wallgate are just across the road from each other, about a 5 minute walk.', 'Wigan Wallgate and Wigan North Western are just across the road from each other, about a 5 minute walk.'],
    ('Liverpool Lime Street', 'Liverpool Central'): ['Walk', 'Liverpool Lime Street to Liverpool Central is about a 5 minute walk.', 'Liverpool Central to Liverpool Lime Street is about a 5 minute walk.'],
    ('London Fenchurch Street', 'London Paddington'): ['Underground', 'Walk to Liverpool Street, about 10 minutes from Fenchurch Street, and take the Elizabeth line to Paddington.', 'Take the Elizabeth line from Paddington to Liverpool Street, then it is about a 10 minute walk to Fenchurch Street.'],
    ('London Paddington', 'West Ham'): ['Underground', 'Take the Elizabeth line from Paddington to Whitechapel, then the District or Hammersmith & City line to West Ham.', 'Take the District or Hammersmith & City line from West Ham to Whitechapel, then the Elizabeth line to Paddington.'],
    ('Whitechapel', 'London Fenchurch Street'): ['Underground', 'Take the District line from Whitechapel to Tower Hill, then it is a couple of minutes on foot to Fenchurch Street.', 'Walk to Tower Hill, a couple of minutes from Fenchurch Street, and take the District line to Whitechapel.'],
    ('Glasgow Queen Street', 'Glasgow Central'): ['Walk', 'Glasgow Queen Street to Glasgow Central is about a 10 minute walk through the city centre.', 'Glasgow Central to Glasgow Queen Street is about a 10 minute walk through the city centre.'],
    ('Birmingham New Street', 'Birmingham Moor Street'): ['Walk', 'Birmingham New Street to Moor Street is about a 5 to 10 minute walk through the Bullring.', 'Birmingham Moor Street to New Street is about a 5 to 10 minute walk through the Bullring.'],
    ('London St Pancras', 'London Euston'): ['Walk', 'St Pancras to Euston is about a 10 minute walk along the Euston Road. I would allow a bit longer with children or bags.', 'Euston to St Pancras is about a 10 minute walk along the Euston Road. I would allow a bit longer with children or bags.'],
    ('London Kings Cross', 'London Euston'): ['Walk', 'Kings Cross to Euston is about a 10 minute walk along the Euston Road. I would allow a bit longer with children or bags.', 'Euston to Kings Cross is about a 10 minute walk along the Euston Road. I would allow a bit longer with children or bags.'],
    ('London Paddington', 'London Euston'): ['Underground', 'Take the Circle or Hammersmith & City line from Paddington to Euston Square, then it is a short walk to Euston.', 'Walk to Euston Square, a short walk from Euston, and take the Circle or Hammersmith & City line to Paddington.'],
    ('London Liverpool Street', 'London Euston'): ['Underground', 'Take the Circle, Hammersmith & City or Metropolitan line from Liverpool Street to Euston Square, then it is a short walk to Euston.', 'Walk to Euston Square, a short walk from Euston, and take the Circle, Hammersmith & City or Metropolitan line to Liverpool Street.'],
    ('London Waterloo', 'London Euston'): ['Underground', 'Take the Northern line (Charing Cross branch) from Waterloo to Euston.', 'Take the Northern line (Charing Cross branch) from Euston to Waterloo.'],
    ('London Victoria', 'London Euston'): ['Underground', 'Take the Victoria line from Victoria to Euston.', 'Take the Victoria line from Euston to Victoria.'],
    ('London Bridge', 'London Euston'): ['Underground', 'Take the Northern line (Bank branch) from London Bridge to Euston.', 'Take the Northern line (Bank branch) from Euston to London Bridge.'],
    ('London Marylebone', 'London Euston'): ['Underground', 'Take the Bakerloo line one stop from Marylebone to Baker Street, then the Circle, Hammersmith & City or Metropolitan line to Euston Square. Euston is a short walk from there.', 'Walk to Euston Square, take the Circle, Hammersmith & City or Metropolitan line to Baker Street, then the Bakerloo line one stop to Marylebone.'],
    ('London Paddington', 'London Kings Cross'): ['Underground', 'Take the Circle or Hammersmith & City line from Paddington to Kings Cross St Pancras.', 'Take the Circle or Hammersmith & City line from Kings Cross St Pancras to Paddington.'],
    ('London Liverpool Street', 'London Kings Cross'): ['Underground', 'Take the Circle, Hammersmith & City or Metropolitan line from Liverpool Street to Kings Cross St Pancras.', 'Take the Circle, Hammersmith & City or Metropolitan line from Kings Cross St Pancras to Liverpool Street.'],
    ('London Waterloo', 'London Kings Cross'): ['Underground', 'Take the Northern line from Waterloo to Kings Cross St Pancras, changing to the Bank branch if needed, or the Jubilee then Victoria line.', 'Take the Northern or Victoria line from Kings Cross St Pancras towards Waterloo.'],
    ('London Victoria', 'London Kings Cross'): ['Underground', 'Take the Victoria line from Victoria to Kings Cross St Pancras.', 'Take the Victoria line from Kings Cross St Pancras to Victoria.'],
    ('London Bridge', 'London Kings Cross'): ['Underground', 'Take the Northern line (Bank branch) from London Bridge to Kings Cross St Pancras.', 'Take the Northern line (Bank branch) from Kings Cross St Pancras to London Bridge.'],
    ('London St Pancras', 'London Kings Cross'): ['Walk', 'Kings Cross and St Pancras are just across the road from each other, about a 5 minute walk.', 'St Pancras and Kings Cross are just across the road from each other, about a 5 minute walk.'],
    ('London Marylebone', 'London Kings Cross'): ['Underground', 'Take the Bakerloo line one stop to Baker Street, then the Circle, Hammersmith & City or Metropolitan line to Kings Cross St Pancras.', 'Take the Circle, Hammersmith & City or Metropolitan line to Baker Street, then the Bakerloo line one stop to Marylebone.'],
    ('London Liverpool Street', 'London Victoria'): ['Underground', 'Take the Circle line from Liverpool Street to Victoria.', 'Take the Circle line from Victoria to Liverpool Street.'],
    ('London Liverpool Street', 'London Waterloo'): ['Underground', 'Take the Central line from Liverpool Street to Bank, then the Waterloo & City line to Waterloo.', 'Take the Waterloo & City line from Waterloo to Bank, then the Central line one stop to Liverpool Street.'],
    ('London Liverpool Street', 'London Bridge'): ['Underground', 'Walk to Moorgate, a few minutes from Liverpool Street, and take the Northern line (Bank branch) to London Bridge.', 'Take the Northern line (Bank branch) from London Bridge to Moorgate, then it is a few minutes on foot to Liverpool Street.'],
    ('London Liverpool Street', 'London Paddington'): ['Underground', 'Take the Elizabeth line from Liverpool Street straight to Paddington.', 'Take the Elizabeth line from Paddington straight to Liverpool Street.'],
    ('London Liverpool Street', 'London St Pancras'): ['Underground', 'Take the Circle, Hammersmith & City or Metropolitan line from Liverpool Street to Kings Cross St Pancras.', 'Take the Circle, Hammersmith & City or Metropolitan line from Kings Cross St Pancras to Liverpool Street.'],
    ('London Liverpool Street', 'London Marylebone'): ['Underground', 'Take the Circle, Hammersmith & City or Metropolitan line to Baker Street, then the Bakerloo line one stop to Marylebone.', 'Take the Bakerloo line one stop to Baker Street, then the Circle, Hammersmith & City or Metropolitan line to Liverpool Street.'],
    ('London Victoria', 'London Waterloo'): ['Underground', 'Take the Victoria line from Victoria to Green Park, then the Jubilee line to Waterloo.', 'Take the Jubilee line from Waterloo to Green Park, then the Victoria line to Victoria.'],
    ('London Victoria', 'London Paddington'): ['Underground', 'Take the Circle or District line from Victoria to Paddington.', 'Take the Circle or District line from Paddington to Victoria.'],
    ('London Victoria', 'London Bridge'): ['Underground', 'Take the Victoria line from Victoria to Green Park, then the Jubilee line to London Bridge.', 'Take the Jubilee line from London Bridge to Green Park, then the Victoria line to Victoria.'],
    ('London Victoria', 'London St Pancras'): ['Underground', 'Take the Victoria line from Victoria to Kings Cross St Pancras.', 'Take the Victoria line from Kings Cross St Pancras to Victoria.'],
    ('London Victoria', 'London Marylebone'): ['Underground', 'Take the Victoria line to Oxford Circus, then the Bakerloo line to Marylebone.', 'Take the Bakerloo line from Marylebone to Oxford Circus, then the Victoria line to Victoria.'],
    ('London Waterloo', 'London Bridge'): ['Underground', 'Take the Jubilee line from Waterloo to London Bridge.', 'Take the Jubilee line from London Bridge to Waterloo.'],
    ('London Waterloo', 'London Paddington'): ['Underground', 'Take the Bakerloo line from Waterloo straight to Paddington.', 'Take the Bakerloo line from Paddington straight to Waterloo.'],
    ('London Waterloo', 'London St Pancras'): ['Underground', 'Take the Northern line (Charing Cross branch) to Euston, then it is a 10 minute walk to St Pancras.', 'Walk to Euston, about 10 minutes, and take the Northern line (Charing Cross branch) to Waterloo.'],
    ('London Waterloo', 'London Marylebone'): ['Underground', 'Take the Bakerloo line from Waterloo straight to Marylebone.', 'Take the Bakerloo line from Marylebone straight to Waterloo.'],
    ('London Paddington', 'London Bridge'): ['Underground', 'Take the Bakerloo line from Paddington to Waterloo, then the Jubilee line one stop to London Bridge.', 'Take the Jubilee line one stop from London Bridge to Waterloo, then the Bakerloo line to Paddington.'],
    ('London Paddington', 'London St Pancras'): ['Underground', 'Take the Circle or Hammersmith & City line from Paddington to Kings Cross St Pancras.', 'Take the Circle or Hammersmith & City line from Kings Cross St Pancras to Paddington.'],
    ('London Paddington', 'London Marylebone'): ['Underground', 'Take the Bakerloo line one stop from Paddington to Marylebone, or it is about a 15 minute walk.', 'Take the Bakerloo line one stop from Marylebone to Paddington, or it is about a 15 minute walk.'],
    ('London Bridge', 'London St Pancras'): ['Underground', 'Take the Northern line (Bank branch) from London Bridge to Kings Cross St Pancras.', 'Take the Northern line (Bank branch) from Kings Cross St Pancras to London Bridge.'],
    ('London Bridge', 'London Marylebone'): ['Underground', 'Take the Jubilee line from London Bridge to Baker Street, then the Bakerloo line one stop to Marylebone.', 'Take the Bakerloo line one stop to Baker Street, then the Jubilee line to London Bridge.'],
    ('London Bridge', 'London Fenchurch Street'): ['Walk', 'London Bridge to Fenchurch Street is about a 15 minute walk over London Bridge.', 'Fenchurch Street to London Bridge is about a 15 minute walk over London Bridge.'],
    ('London St Pancras', 'London Marylebone'): ['Underground', 'Take the Circle, Hammersmith & City or Metropolitan line to Baker Street, then the Bakerloo line one stop to Marylebone.', 'Take the Bakerloo line one stop to Baker Street, then the Circle, Hammersmith & City or Metropolitan line to Kings Cross St Pancras.'],
    ('London Liverpool Street', 'London Charing Cross'): ['Underground', 'Take the Central line to Tottenham Court Road, then the Northern line (Charing Cross branch) to Charing Cross.', 'Take the Northern line (Charing Cross branch) to Tottenham Court Road, then the Central line to Liverpool Street.'],
    ('London Kings Cross', 'London Charing Cross'): ['Underground', 'Take the Victoria line one stop to Euston, then the Northern line (Charing Cross branch) to Charing Cross.', 'Take the Northern line (Charing Cross branch) to Euston, then the Victoria line one stop to Kings Cross St Pancras.'],
    ('London St Pancras', 'London Charing Cross'): ['Underground', 'Take the Victoria line one stop to Euston, then the Northern line (Charing Cross branch) to Charing Cross.', 'Take the Northern line (Charing Cross branch) to Euston, then the Victoria line one stop to Kings Cross St Pancras.'],
    ('London Paddington', 'London Charing Cross'): ['Underground', 'Take the Bakerloo line from Paddington to Charing Cross.', 'Take the Bakerloo line from Charing Cross to Paddington.'],
    ('London Victoria', 'London Charing Cross'): ['Underground', 'Take the Circle or District line from Victoria to Embankment, then it is a short walk to Charing Cross.', 'Walk to Embankment, a short walk from Charing Cross, and take the Circle or District line to Victoria.'],
    ('London Waterloo', 'London Charing Cross'): ['Walk', 'Waterloo to Charing Cross is about a 15 minute walk over the Golden Jubilee Bridges, or one stop on the Bakerloo line.', 'Charing Cross to Waterloo is about a 15 minute walk over the Golden Jubilee Bridges, or one stop on the Bakerloo line.'],
    ('Manchester Victoria', 'Manchester Piccadilly'): ['Walk', 'Manchester Victoria to Piccadilly is about a 15 minute walk, or take the Metrolink tram between the two.', 'Manchester Piccadilly to Victoria is about a 15 minute walk, or take the Metrolink tram between the two.'],
}
OPCODE = {'c2c': 'CC', 'Southeastern': 'SE', 'Thameslink': 'TL', 'Great Northern': 'GN', 'Greater Anglia': 'LE', 'Southern': 'SN', 'Elizabeth line': 'XR',
          'London Overground': 'LO', 'London North Eastern Railway': 'GR', 'Gatwick Express': 'GX'}
def way(a, b):
    """[label, words for going from a to b]"""
    if (a, b) in WAYS: return WAYS[(a, b)][:2]
    if (b, a) in WAYS: w = WAYS[(b, a)]; return [w[0], w[2] if len(w) > 2 else w[1]]
    return None

NICE_FIX = {'Prestwick (Strathclyde)': 'Prestwick Town', 'Edinburgh': 'Edinburgh Waverley', 'Preston (Lancs)': 'Preston', 'London St Pancras International': 'London St Pancras',
            'Earlswood Surrey': 'Earlswood', 'Seaford Sussex': 'Seaford', 'Elsenham Essex': 'Elsenham', 'Roydon Essex': 'Roydon',
            'Poulton Le Fylde': 'Poulton-le-Fylde', 'Liverpool Lime St': 'Liverpool Lime Street', 'Telford': 'Telford Central', 'Bootle Oriel Rd': 'Bootle Oriel Road',
            'Burnley Manchester Rd': 'Burnley Manchester Road', 'James St': 'James Street', 'Moreton in Marsh': 'Moreton-in-Marsh',
            'Newton Le Willows': 'Newton-le-Willows'}
def NICE(n):
    n = NICE_FIX.get(n, n)
    return re.sub(r'\s*\([^)]*\)', '', n) if '(Brighton)' not in n else n
def mm(t): return int(t[:2]) * 60 + int(t[3:])
def gap(a, b):
    d = mm(b) - mm(a); return d + 1440 if d < 0 else d
def hm_utc(iso):  # traintimes leg times are local times written with a Z
    return iso[11:16]
KEY, OFF, LABEL, CHG = 1, 2, 4, 8

# ---------- where stations are: every show's stops, then the c2c OSM nodes, then the tools' station lists
POS = {}
for f in glob.glob('../*-data.json'):
    for s in json.load(open(f))['stops']: POS.setdefault(s[0], (s[1], s[2]))
for f in ['../../train-routes/headcorn.html', '../../train-routes/shuttleworth.html']:
    t = open(f).read(); i = t.index('var DATA=') + 9
    for s in json.JSONDecoder().raw_decode(t[i:])[0]['stops']: POS.setdefault(s[0], (s[1], s[2]))
nodes = {}; adj = {}; OSMST = {}
for f in glob.glob('osm/r*.xml'):
    r = ET.parse(f).getroot()
    for n in r.findall('node'):
        nodes[n.get('id')] = (float(n.get('lat')), float(n.get('lon')))
        tg = {x.get('k'): x.get('v') for x in n.findall('tag')}
        if tg.get('name') and (tg.get('railway') in ('station', 'stop', 'halt') or tg.get('public_transport') in ('stop_position', 'station')):
            OSMST.setdefault(tg['name'], nodes[n.get('id')])
    for w in r.findall('way'):
        tg = {x.get('k'): x.get('v') for x in w.findall('tag')}
        if tg.get('railway') != 'rail': continue
        nd = [x.get('ref') for x in w.findall('nd')]
        for a, b in zip(nd, nd[1:]): adj.setdefault(a, set()).add(b); adj.setdefault(b, set()).add(a)
for f in glob.glob('../*-tools/stops_osm.json'):
    for k, v in json.load(open(f)).items(): OSMST.setdefault(k, tuple(v))
def dist(a, b):
    la = math.radians((a[0] + b[0]) / 2); return math.hypot((a[0] - b[0]) * 111.32, (a[1] - b[1]) * 111.32 * math.cos(la))
cands = [k for k in adj if k in nodes]
def snapnode(p): return min(cands, key=lambda c: dist(nodes[c], p))
C2CPOS = {}
for n, p in OSMST.items():
    if n in {'Barking', 'Basildon', 'Benfleet', 'Chafford Hundred', 'Chalkwell', 'Dagenham Dock', 'East Tilbury', 'Grays', 'Laindon', 'Leigh-on-Sea', 'Limehouse',
             'London Fenchurch Street', 'Ockendon', 'Pitsea', 'Purfleet', 'Rainham', 'Shoeburyness', 'Southend Central', 'Southend East', 'Stanford-le-Hope',
             'Thorpe Bay', 'Tilbury Town', 'Upminster', 'West Ham', 'West Horndon', 'Westcliff'}:
        k = snapnode(p); C2CPOS[n] = (round(nodes[k][0], 5), round(nodes[k][1], 5), k)
STL = {}
for _s in json.load(open('stations.json')): STL[_s['stationName']] = (_s['lat'], _s['long'])
STFIX = {'Hull': 'Hull Paragon', 'Hope Derbyshire': 'Hope (Derbyshire)', 'Burnham': 'Burnham (Bucks)', 'Brampton': 'Brampton (Cumbria)', 'Longton': 'Longton', 'Croy': 'Croy', 'Belle Vue': 'Belle Vue', 'Fleet': 'Fleet', 'Bentley': 'Bentley (South Yorkshire)', 'Chester-le-Street': 'Chester-Le-Street', 'Rugeley': 'Rugeley Trent Valley'}
STL["Hall-i'-Th'-Wood"] = (53.5974, -2.4140)
def where(nice):
    if nice in C2CPOS: return C2CPOS[nice][:2]
    if nice in POS: return POS[nice]
    for k in (nice, nice.replace('London ', '')):
        if k in OSMST: return OSMST[k]
    for k in (STFIX.get(nice, nice), nice, nice + ' Central'):
        if k in STL: return STL[k]
    norm = lambda n: re.sub(r'[^a-z]', '', re.sub(r'\s*\(.*?\)', '', n.lower().replace(' st ', ' street ').replace('-on-trent', '')))
    for k in STL:
        if norm(k) == norm(nice) or norm(k) == norm(nice).replace('ontrent', ''): return STL[k]
    return None
def c2cpath(a, b):
    """the railway between two c2c stations, along the OSM c2c routes"""
    A, B = C2CPOS[a][2], C2CPOS[b][2]
    D = {A: 0}; P = {}; h = [(0, A)]
    while h:
        d, u = heapq.heappop(h)
        if u == B: break
        if d > D[u]: continue
        for v in adj.get(u, ()):
            if v not in nodes: continue
            nd = d + dist(nodes[u], nodes[v])
            if nd < D.get(v, 1e18): D[v] = nd; P[v] = u; heapq.heappush(h, (nd, v))
    if B not in D or D[B] > dist(nodes[A], nodes[B]) * 1.7 + 2: return None
    path = [B]
    while path[-1] in P: path.append(P[path[-1]])
    pts = [nodes[k] for k in path[::-1]]; simp = [pts[0]]
    for q in pts[1:-1]:
        if dist(simp[-1], q) > 0.06: simp.append(q)
    simp.append(pts[-1])
    return [[round(x, 5), round(y, 5)] for x, y in simp]
# every drawn stretch of line on any page, by station names, so a stretch drawn for one show can be used on another
SEGN = {}
def load_segs(D):
    for k, v in D['seg'].items():
        i, j = map(int, k.split('|')); SEGN.setdefault((D['stops'][i][0], D['stops'][j][0]), v)
for f in glob.glob('../*-data.json'): load_segs(json.load(open(f)))
for f in ['../../train-routes/headcorn.html', '../../train-routes/shuttleworth.html']:
    t = open(f).read(); i = t.index('var DATA=') + 9; load_segs(json.JSONDecoder().raw_decode(t[i:])[0])

# ---------- journeys
def leg_calls(g):
    f = 'cache/' + hashlib.md5(leg_url(g).encode()).hexdigest() + '.html'
    if not os.path.exists(f): return None
    c = parse_calls(open(f).read())
    return c if len(c) >= 2 else None

def journeys(raw, key, hubname):
    """turns the traintimes legs into rail legs with calling points, keeping only journeys with a c2c leg at the hub end
    and changes that are the same station or a known way across"""
    out = []
    for j in raw[key]:
        if any('bus' in (g['op'] + g['info']).lower() for g in j): continue
        rail = [g for g in j if g['op']]
        # an Elizabeth line hop between two London stations counts as part of the way across (the words say so)
        rail = [g for i, g in enumerate(rail) if not (g['op'] == 'Elizabeth line' and 0 < i < len(rail) - 1)]
        if not rail or len(rail) > 4: continue
        legs = []; ok = True
        for g in rail:
            c = leg_calls(g)
            if not c: ok = False; break
            legs.append({'info': g['info'], 'calls': c, 'op': g['op']})
        if not ok: continue
        for a, b in zip(legs, legs[1:]):
            x, y = NICE(a['calls'][-1][0]), NICE(b['calls'][0][0])
            if x != y and not way(x, y): ok = False
        if not ok: continue
        # only journeys the map can draw along the railway (a line drawn on another page, or the c2c routes)
        if key == 'there' and NICE(legs[0]['calls'][0][0]) != hubname:
            st = NICE(legs[0]['calls'][0][0])
            if not way(hubname, st) or j[0]['op']: continue
            t0 = j[0]['dep'][11:16]
            legs.insert(0, {'info': '', 'calls': [[hubname, t0, t0, '']], 'op': ''})
        if key == 'back' and NICE(legs[-1]['calls'][-1][0]) != hubname:
            st = NICE(legs[-1]['calls'][-1][0])
            if not way(st, hubname) or j[-1]['op']: continue
            t1 = j[-1]['arr'][11:16]
            legs.append({'info': '', 'calls': [[hubname, t1, t1, '']], 'op': ''})
        if NICE(legs[0 if key == 'there' else -1]['calls'][0 if key == 'there' else -1][0]) != hubname: continue
        out.append(legs)
    return out

SKIP = {}
def via(js, key, name):
    """the same journeys, starting (or finishing) at a station the first (or last) c2c train calls at"""
    out = []
    for legs in js:
        legs = [dict(l) for l in legs]; k = 0 if key == 'there' else -1; cs = legs[k]['calls']
        idx = [i for i, c in enumerate(cs) if NICE(c[0]) == name]
        if not idx: continue
        i = idx[0]
        if key == 'there':
            if i >= len(cs) - 1: continue
            c0 = list(cs[i]); c0[1] = c0[2] or c0[1]; legs[0]['calls'] = [c0] + cs[i + 1:]
        else:
            if i == 0: continue
            legs[-1]['calls'] = cs[:i] + [list(cs[i])]
        out.append(legs)
    return out

def clean(js):
    out = []
    for legs in js:
        dep = legs[0]['calls'][0]; arr = legs[-1]['calls'][-1]
        d = dep[2] or dep[1]; a = arr[1]; tot = gap(d, a)
        if any(gap(legs[i]['calls'][-1][1], legs[i + 1]['calls'][0][2] or legs[i + 1]['calls'][0][1]) > (95 if NICE(legs[i]['calls'][-1][0]) != NICE(legs[i + 1]['calls'][0][0]) else 75) for i in range(len(legs) - 1)): continue
        out.append((d, a, tot, legs))
    if not out: return []
    fastest = min(x[2] for x in out)
    out = [x for x in out if x[2] <= fastest + 100]
    keep = []
    for x in out:
        pen = lambda z: (len(z[3]) - 1) * 12
        beaten = any((y is not x) and mm(y[0]) >= mm(x[0]) and y[2] + (mm(y[0]) - mm(x[0])) + pen(y) <= x[2] + pen(x) and (y[0], y[1]) != (x[0], x[1]) and len(y[3]) <= len(x[3]) for y in out) or \
                 any((y is not x) and len(y[3]) < len(x[3]) and abs(mm(y[0]) - mm(x[0])) <= 15 and gap(x[1], y[1]) <= 12 for y in out)
        if not beaten and not any(k[0] == x[0] and k[1] == x[1] for k in keep): keep.append(x)
    best = {}
    for x in keep:
        k = x[0]; v = mm(x[1]) if mm(x[1]) >= 240 else mm(x[1]) + 1440
        sc = v + 12 * (len(x[3]) - 1)
        if k not in best or sc < best[k][0]: best[k] = (sc, x)
    keep = [v[1] for v in best.values()]
    return sorted(keep, key=lambda x: mm(x[0]) if mm(x[0]) >= 240 else mm(x[0]) + 1440)

def tdest(info):
    d = re.sub(r'.* to ', '', info).replace('Newport (South Wales)', 'Newport')
    return NICE(d.replace('Portsmouth And Southsea', 'Portsmouth & Southsea').replace('Seaford Sussex', 'Seaford'))
def torig(info):
    m = re.search(r' from (.+) to ', info); return m.group(1).replace('Portsmouth And Southsea', 'Portsmouth & Southsea') if m else ''
def opname(info, op):
    m = re.match(r'(.+?) from ', info)
    return (m.group(1) if m else op).replace('%26', '&').replace('LNR & WMR', 'West Midlands Railway')

def build(show):
    cfg = SH[show]; embedded = show in ('headcorn', 'shuttleworth')
    if embedded:
        page = open(f'../../train-routes/{show}.html').read(); i0 = page.index('var DATA=') + 9
        D, n = json.JSONDecoder().raw_decode(page[i0:]); i1 = i0 + n
    else:
        D = json.load(open(f'../{show}-data.json'))
    D['hubs'] = [h for h in D['hubs'] if h.get('group') != 'uk']
    if 'byDay' in D: D['byDay'] = [[h for h in hs if h.get('group') != 'uk'] for hs in D['byDay']]
    stops = D['stops']; SI = {s[0]: i for i, s in enumerate(stops)}
    first = D['hubs'][0]['dirs'][0]['trips'][0]['s']; DEST = stops[first[-1][1]][0]
    BIG = set(C2C_BIG) | {DEST}
    for h in D['hubs']:
        for d in h['dirs']:
            for t in d['trips']:
                for p in t['s']:
                    if p[2] & LABEL: BIG.add(stops[p[1]][0])
    missing = set()
    def si(raw):
        nice = NICE(raw)
        if nice not in SI:
            p = where(nice)
            if not p: missing.add(nice); p = (51.5, -0.1)
            SI[nice] = len(stops); stops.append([nice, p[0], p[1], nice.replace('London ', '') if nice.startswith('London ') else nice])
        return SI[nice]
    def trip(x, toshow, hubname):
        d, a, tot, legs = x; s = []; changes = []
        for li, lg in enumerate(legs):
            cs = lg['calls']
            for ci, c in enumerate(cs):
                last = (li == len(legs) - 1 and ci == len(cs) - 1)
                if li > 0 and ci == 0:
                    pe = legs[li - 1]['calls'][-1]; dep = c[2] or c[1]; prev = s[-1]; arr = prev[0]
                    if NICE(pe[0]) != NICE(c[0]):
                        prev[0] = dep; prev[2] |= CHG | KEY | LABEL; prev.append(arr); s.append([dep, si(c[0]), KEY | LABEL])
                        ap = pe[3]; dp = (c[3] + ' at ' + NICE(c[0])) if c[3] else ''
                    else:
                        prev[0] = dep; prev[2] |= CHG | KEY | LABEL; prev.append(arr); ap = pe[3]; dp = c[3]
                    ch = {'at': NICE(pe[0]), 'arr': arr, 'dep': dep, 'ap': ap, 'dp': dp, 'wait': gap(arr, dep), 'to': tdest(lg['info'])}
                    if NICE(pe[0]) != NICE(c[0]): ch['way'] = way(NICE(pe[0]), NICE(c[0]))[1]; ch['wayTo'] = NICE(c[0])
                    changes.append(ch)
                    continue
                t = c[1] if (last or ci == len(cs) - 1) else (c[2] or c[1])
                nice = NICE(c[0])
                f = (KEY | LABEL if nice in BIG or (ci == 0 and li == 0) or last else 0) | (OFF | KEY | LABEL if nice == DEST else 0)
                s.append([t, si(c[0]), f])
        ws = we = None
        if not legs[0]['op'] and len(legs[0]['calls']) == 1 and changes:  # leave the London terminus (or Glasgow Queen Street) and go across on foot or by Underground
            c0 = changes.pop(0); s[0] = [legs[0]['calls'][0][2], s[0][1], KEY | LABEL]
            ws = {'to': c0['wayTo'], 'dep': c0['dep'], 'dp': re.sub(r' at .*', '', c0['dp']), 'way': c0['way']}
        if not legs[-1]['op'] and len(legs[-1]['calls']) == 1 and changes:  # across from Euston (or Glasgow Central) to the terminus at the end
            c1 = changes.pop(); p = s[-2]; s[-2] = [p[3] if len(p) > 3 else p[0], p[1], KEY | LABEL]
            we = {'from': c1['at'], 'arr': c1['arr'], 'ap': c1['ap'], 'way': c1['way']}
        l0 = legs[0] if legs[0]['op'] or len(legs) == 1 else legs[1]; first = legs[0]['calls'][0]
        sh = lambda n: stops[SI[n]][3] if n in SI else n
        names_ = [opname(lg['info'], lg['op']) for lg in legs]
        if names_ and not names_[0] and len(names_) > 1: names_[0] = names_[1]
        if names_ and not names_[-1] and len(names_) > 1: names_[-1] = names_[-2]
        if embedded:
            codes = [OPCODE.get(n, n) for n in names_]; uniq = list(dict.fromkeys(codes)); un = list(dict.fromkeys(names_))
            extra = {'orig': torig(l0['info']), 'ops': uniq, 'legops': codes, 'opLabel': ' and '.join(un)}
        else: extra = {'ops': names_}
        r = {'big': s[0][0], 'plat': first[3], 'ride': tot, 'dest': tdest(l0['info']),
                'calls': [sh(NICE(c[0])) for c in l0['calls'][1:]],
                'small': ('Gets to ' + DEST + ' at ' if toshow else 'Back in ' + hubname + ' at ') + s[-1][0],
                'title': 'The ' + s[0][0] + ' from ' + stops[s[0][1]][0], 's': s, 'changes': changes, 'lorig': torig(legs[-1]['info'])}
        if ws: r['walkStart'] = ws; r['plat'] = ''
        if we: r['walkEnd'] = we
        r.update(extra); return r
    def table(trips, toshow, hubname):
        o = hubname if toshow else DEST; e = DEST if toshow else hubname
        sh = lambda n: stops[SI[n]][3] if n in SI else n
        rows = ['Leave ' + sh(o), 'Change at', 'Change time', 'Arrive ' + sh(e)]
        cols = [[t['big'], ', '.join(c['at'].replace('London ', '') for c in t['changes']) or 'Direct', ', '.join(c['dep'] for c in t['changes']) or '', t['s'][-1][0]] for t in trips]
        return {'rows': rows, 'off': 3 if toshow else 0, 'cols': cols, 'wide': 1}
    ref = D['hubs'][0]['dirs']; backnote = ref[1].get('note', '')
    def dirs(J, short, name):
        there = [trip(x, True, short) for x in J['there']]; back = [trip(x, False, short) for x in J['back']]
        return [{'label': ref[0]['label'], 'trips': there, 'tt': table(there, True, name), 'from': name, 'note': 'Times from ' + name + '. Tap one to see every station on the way.'},
                {'label': 'Back to ' + short, 'trips': back, 'tt': table(back, False, name), 'from': DEST, 'note': backnote}]
    daykeys = [d['key'] for d in D['days']]
    report = {}; newhubs = []
    pairs_used = set()
    for code, name, short in C2C:
        if code in SKIP.get(show, ()): report[code] = 'left out on purpose'; continue
        J = {}
        for dk in daykeys:
            date = cfg['days'].get(dk)
            f = f'raw/{show}_{code}_{date}.json'
            if not date or not os.path.exists(f): continue
            raw = json.load(open(f))
            th, bk = journeys(raw, 'there', name), journeys(raw, 'back', name)
            if code == 'SOC':  # traintimes sends most Southend journeys via Southend Victoria, so take the same c2c trains from the Shoeburyness list too
                rs = json.load(open(f'raw/{show}_SRY_{date}.json'))
                th += via(journeys(rs, 'there', 'Shoeburyness'), 'there', name); bk += via(journeys(rs, 'back', 'Shoeburyness'), 'back', name)
            J[dk] = {'there': clean(th), 'back': clean(bk)}
        if not J or not J.get(daykeys[0]) or len(J[daykeys[0]]['there']) < 3 or len(J[daykeys[0]]['back']) < 3:
            report[code] = 'skipped, no journeys'; continue
        base = dirs(J[daykeys[0]], short, name); days = {}
        sig = lambda DD: json.dumps([[t['big'], t['s'][-1][0], len(t['changes'])] for d in DD for t in d['trips']])
        for dk in daykeys[1:]:
            if dk in J and J[dk]['there'] and J[dk]['back']:
                DD = dirs(J[dk], short, name)
                if sig(DD) != sig(base): days[dk] = DD
        h = {'code': code, 'name': name, 'short': short, 'dirs': base, 'group': 'uk'}
        if not newhubs: h['groupTitle'] = 'From across the UK'; h['groupSub'] = GROUP_SUB
        if days: h['days'] = days
        newhubs.append(h)
        report[code] = {dk: (len(J[dk]['there']), len(J[dk]['back'])) for dk in J}
    ci = next((i for i, h in enumerate(D['hubs']) if h.get('group') == 'c2c'), len(D['hubs']))
    D['hubs'][ci:ci] = newhubs
    if 'byDay' in D:
        for k, dk in enumerate(daykeys):
            for h in newhubs:
                hh = {kk: v for kk, v in h.items() if kk != 'days'}; hh['dirs'] = h.get('days', {}).get(dk, h['dirs'])
                D['byDay'][k].append(hh)
    # map lines for every pair of stations next to each other on a c2c journey
    seg = D['seg']; nostraight = 0; straight = []
    for h in newhubs:
        for DD in [h['dirs']] + list(h.get('days', {}).values()):
            for d in DD:
                for t in d['trips']:
                    for p, q in zip(t['s'], t['s'][1:]):
                        i, j = p[1], q[1]
                        if f'{i}|{j}' in seg or f'{j}|{i}' in seg: continue
                        a, b = stops[i][0], stops[j][0]
                        if way(a, b): pairs_used.add(tuple(sorted((a, b)))); continue  # across London: a straight dashed hop
                        if (a, b) in SEGN: seg[f'{i}|{j}'] = SEGN[(a, b)]
                        elif (b, a) in SEGN: seg[f'{j}|{i}'] = SEGN[(b, a)]
                        elif a in C2CPOS and b in C2CPOS and c2cpath(a, b): seg[f'{i}|{j}'] = c2cpath(a, b)
                        else: straight.append((a, b))
    # trips keep the stop list positions the template expects
    if embedded:
        page = page[:i0] + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + page[i1:]
        open(f'../../train-routes/{show}.html', 'w').write(page)
    else:
        json.dump(D, open(f'../{show}-data.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    return report, sorted(missing), sorted(set(straight)), sorted(pairs_used)

if __name__ == '__main__':
    allpairs = json.load(open('ways_used.json')) if os.path.exists('ways_used.json') else {}
    for show in sys.argv[1:] or list(SH):
        rep, miss, st, pu = build(show)
        print(show, rep); print('   missing positions:', miss); print('   straight lines:', len(st), st[:12]); print('   ways across:', pu)
        allpairs[show] = pu
    json.dump(allpairs, open('ways_used.json', 'w'), indent=1)
