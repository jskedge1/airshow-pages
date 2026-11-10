"""Downloads every journey between the main UK stations and each show's station from traintimes.org.uk.
Writes raw/<show>_<hub>_<date>.json (journey lists) and fills cache/ with the calling points of every rail leg.
Run: python3 scrape.py [show ...]   (about 15 to 25 minutes for every show, 4 workers)"""
import re, json, time, subprocess, html, sys, os, hashlib
from concurrent.futures import ThreadPoolExecutor
BASE = 'https://traintimes.org.uk'
HUBS = ['STP','PAD','LST','WAT','VIC','LBG','MYB','BHM','BRI','CDF','EDB','GLQ','NCL','SHF','NOT','LEI','DBY','CRE','SOT','RDG','SOU','BTN','NRW','CBG','PBO','DON','HUL','CAR','MCV','BHI','NWP','SWA','PLY','EXD','IPS','COV','WVH','OXF','MKC','SAL']
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
os.makedirs('raw', exist_ok=True); os.makedirs('cache', exist_ok=True)
SH = json.load(open('shows.json'))

def get(u):
    for k in range(4):
        r = subprocess.run(['curl', '-s', '--max-time', '40', '-A', 'Mozilla/5.0 (planning preview)', BASE + u], capture_output=True, text=True)
        if r.stdout and len(r.stdout) > 500: return r.stdout
        time.sleep(2 + k * 2)
    return ''

def parse_key(l):
    q = l.split('?', 1)[1]
    legs = []; cur = None
    for part in q.split('&'):
        if part.startswith('legs[]='):
            a, b, d, e = html.unescape(part[7:]).split('|'); cur = {'from': a, 'to': b, 'dep': d, 'arr': e, 'info': '', 'op': ''}; legs.append(cur)
        elif part.startswith('info[]=') and cur: cur['info'] = html.unescape(part[7:]).replace('+', ' ').replace('%26', '&')
        elif part.startswith('ops[]=') and cur: cur['op'] = html.unescape(part[6:]).replace('+', ' ').replace('%26', '&')
    return legs

def journeys(frm, to, date):
    out = {}; t = '04:30'
    for _ in range(16):
        s = get(f'/{frm}/{to}/{t}/{date}'); new = 0
        for l in re.findall(r'class="calling_link(?:_inner)?" href="([^"]+)"', s):
            l = html.unescape(l)
            if date not in l: continue
            key = re.sub(r'&stage=\d+', '', l)
            if key not in out: out[key] = parse_key(key); new += 1
        later = re.search(r"href=\"(/[A-Z]{3}/[A-Z]{3}/(\d\d:\d\d)/(\S+?))\">Later", s)
        if not later or later.group(3) != date or new == 0: break
        t = later.group(2); time.sleep(.3)
    return list(out.values())

def leg_url(g):
    return ('/ajax-stoppingpoints.php?&legs[]=' + '|'.join([g['from'], g['to'], g['dep'], g['arr']]) +
            '&info[]=' + g['info'].replace('&', '%26').replace(' ', '+') + '&ops[]=' + g['op'].replace('&', '%26').replace(' ', '+') + '&stage=1')

def cache_leg(g):
    u = leg_url(g); f = 'cache/' + hashlib.md5(u.encode()).hexdigest() + '.html'
    if os.path.exists(f) and os.path.getsize(f) > 500: return
    s = get(u)
    if s: open(f, 'w').write(s)


# the changes the pages can show: the same station, or one of these ways across (build_c2c.py has the words for each)
WAYS_CRS = {frozenset(p) for p in [('FST', 'LST'), ('WEH', 'SRA'), ('FST', 'EUS'), ('FST', 'KGX'), ('FST', 'STP'), ('GLQ', 'GLC'), ('BHM', 'BMO'), ('FST', 'VIC'), ('WEH', 'LBG'), ('FST', 'BFR'), ('WGN', 'WGW'), ('LIV', 'LVC'), ('FST', 'PAD'), ('PAD', 'WEH'), ('ZLW', 'FST'),('STP','EUS'),('KGX','EUS'),('PAD','EUS'),('LST','EUS'),('WAT','EUS'),('VIC','EUS'),('LBG','EUS'),('MYB','EUS'),('CHX','EUS'),('CST','EUS'),('BFR','EUS'),('FST','EUS'),('MCV','MAN'),('PAD','KGX'),('LST','KGX'),('WAT','KGX'),('VIC','KGX'),('LBG','KGX'),('STP','KGX'),('MYB','KGX'),('GLQ','GLC'),('BHM','BMO'),('EDB','HYM'),('LST','VIC'),('LST','WAT'),('LST','LBG'),('LST','PAD'),('LST','STP'),('LST','MYB'),('VIC','WAT'),('VIC','PAD'),('VIC','LBG'),('VIC','STP'),('VIC','MYB'),('WAT','LBG'),('WAT','PAD'),('WAT','STP'),('WAT','MYB'),('PAD','LBG'),('PAD','STP'),('PAD','MYB'),('LBG','STP'),('LBG','MYB'),('LBG','FST'),('STP','MYB'),('LST','CHX'),('KGX','CHX'),('STP','CHX'),('PAD','CHX'),('VIC','CHX'),('WAT','CHX')]}
def keep(js, key, hub):
    """picks the journeys worth fetching calling points for, from the leg times alone (same rules as build_c2c.clean)"""
    def mins(iso): return int(iso[11:13]) * 60 + int(iso[14:16])
    out = []
    for j in js:
        if any('bus' in (g['op'] + g['info']).lower() for g in j): continue
        rail = [g for g in j if g['op']]
        if not rail or len(rail) > 4: continue
        ok_end = lambda st: st == hub or frozenset((st, hub)) in WAYS_CRS
        if key == 'there' and not ok_end(rail[0]['from']): continue
        if key == 'back' and not ok_end(rail[-1]['to']): continue
        if any(a['to'] != b['from'] and frozenset((a['to'], b['from'])) not in WAYS_CRS for a, b in zip(rail, rail[1:])): continue
        d = mins(rail[0]['dep']); a = mins(rail[-1]['arr']); tot = (a - d) % 1440
        out.append((d, a, tot, len(rail), j))
    if not out: return []
    fast = min(x[2] for x in out); out = [x for x in out if x[2] <= fast + 100]
    res = []
    for x in out:
        beaten = any(y is not x and y[0] >= x[0] and y[2] + (y[0] - x[0]) + (y[3] - 1) * 12 <= x[2] + (x[3] - 1) * 12 and (y[0], y[1]) != (x[0], x[1]) and y[3] <= x[3] for y in out)
        if not beaten: res.append(x[4])
    return res

def job(a):
    show, hub, date = a
    f = f'raw/{show}_{hub}_{date}.json'
    if os.path.exists(f): return f
    crs = SH[show]['crs']
    res = {'there': journeys(hub, crs, date), 'back': journeys(crs, hub, date)}
    json.dump(res, open(f, 'w'))
    print(show, hub, date, len(res['there']), len(res['back']), flush=True)
    return f

if __name__ == '__main__':
    shows = sys.argv[1:] or list(SH)
    jobs = [(s, h, d) for s in shows for d in sorted(set(SH[s]['days'].values())) for h in HUBS]
    with ThreadPoolExecutor(6) as ex: files = list(ex.map(job, jobs))
    legs = {}
    for f in files:
        r = json.load(open(f))
        hub = f.split('_')[1]
        for k in r:
            for j in keep(r[k], k, hub):
                for g in j:
                    if g['op']: legs[leg_url(g)] = g
    print('rail legs to fetch', len(legs), flush=True)
    with ThreadPoolExecutor(4) as ex: list(ex.map(cache_leg, legs.values()))
    print('DONE', flush=True)
