"""Collect stops, timetables and a road-following line for each bus route.
Usage: python3 collect.py  (writes raw/<slug>.json, skips ones already done)"""
import json, os, re, subprocess, sys, time, math
from bs4 import BeautifulSoup

os.makedirs('raw', exist_ok=True)
ROUTES = json.load(open('routes.json'))
DATES = {'thu': '2026-11-05', 'fri': '2026-11-06', 'sat': '2026-11-07', 'sun': '2026-11-08'}


def get(url, tries=3):
    for n in range(tries):
        r = subprocess.run(['curl', '-s', '-m', '60', '-A', 'Mozilla/5.0 (UKAirshowGuide route builder)', url],
                           capture_output=True, text=True)
        if r.stdout and 'Page not found' not in r.stdout[:2000]:
            return r.stdout
        time.sleep(2 + n * 3)
    return ''


def grid(table):
    """Expand a timetable table into rows of (atco, name, minor, [cells])."""
    rows, pending = [], {}
    for tr in table.find_all('tr'):
        th = tr.find('th')
        cells, col = [], 0
        tds = tr.find_all('td')
        it = iter(tds)
        out = []
        while True:
            if col in pending:
                txt, left = pending[col]
                out.append(txt)
                if left > 1: pending[col] = (txt, left - 1)
                else: del pending[col]
                col += 1
                continue
            td = next(it, None)
            if td is None:
                if any(c >= col for c in pending):
                    col += 1
                    continue
                break
            span = int(td.get('colspan', 1)); rs = int(td.get('rowspan', 1))
            txt = td.get_text(' ', strip=True)
            for k in range(span):
                out.append(txt)
                if rs > 1: pending[col] = (txt, rs - 1)
                col += 1
        a = th.find('a') if th else None
        atco = a['href'].split('/stops/')[1] if a and '/stops/' in a.get('href', '') else None
        name = th.get_text(' ', strip=True) if th else ''
        minor = 'minor' in (tr.get('class') or [])
        rows.append((atco, name, minor, out))
    return rows


def trips_from(rows):
    """Turn a grid into trips: list of [(time, atco, name, minor)] per column. Arr/dep rows keep the later time."""
    ncol = max((len(r[3]) for r in rows), default=0)
    trips = []
    for c in range(ncol):
        t, last = [], None
        for atco, name, minor, cells in rows:
            v = cells[c] if c < len(cells) else ''
            if not atco or not re.fullmatch(r'\d\d:\d\d', v):
                continue
            if last and last[1] == atco:
                t[-1] = (v, atco, name, minor)
            else:
                t.append((v, atco, name, minor))
            last = t[-1]
        if len(t) >= 2:
            trips.append(t)
    return trips


def osrm(points):
    """Road line through points (lat, lon). Falls back to straight lines where routing goes wild."""
    line, steps = [], []
    CH = 60
    i = 0
    while i < len(points) - 1:
        seg = points[i:i + CH + 1]
        coords = ';'.join(f'{p[1]:.6f},{p[0]:.6f}' for p in seg)
        url = f'https://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson&steps=true&continue_straight=true'
        d = None
        for n in range(4):
            raw = get(url)
            try:
                d = json.loads(raw)
                if d.get('code') == 'Ok': break
            except Exception:
                pass
            time.sleep(3 + n * 3)
        if not d or d.get('code') != 'Ok':
            for p in seg: line.append([p[0], p[1]])
        else:
            r = d['routes'][0]
            for li, leg in enumerate(r['legs']):
                a, b = seg[li], seg[li + 1]
                straight = hav(a, b)
                pts = []
                for st in leg['steps']:
                    g = [[c[1], c[0]] for c in st['geometry']['coordinates']]
                    pts += g
                    steps.append({'name': st.get('name', ''), 'ref': st.get('ref', ''), 'd': st['distance'], 'leg': i + li})
                if leg['distance'] > max(3 * straight, straight + 1500):
                    pts = [[a[0], a[1]], [b[0], b[1]]]
                line += pts
        i += CH
        time.sleep(1.1)
    # thin duplicate points
    out = []
    for p in line:
        q = [round(p[0], 5), round(p[1], 5)]
        if not out or out[-1] != q: out.append(q)
    return out, steps


def hav(a, b):
    R = 6371000
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    x = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(x))


def collect(r):
    slug = r['slug']
    fn = f'raw/{r["id"]}.json'
    if os.path.exists(fn): return 'skip'
    page = get(f'https://bustimes.org/services/{slug}')
    m = re.search(r'SERVICE_ID = (\d+)', page)
    if not m: return 'no service id'
    sid = m.group(1)
    sj = json.loads(get(f'https://bustimes.org/services/{sid}.json') or '{}')
    loc = {}
    for f in sj.get('stops', {}).get('features', []):
        a = f['properties']['url'].split('/stops/')[1]
        loc[a] = [f['geometry']['coordinates'][1], f['geometry']['coordinates'][0]]
    soup = BeautifulSoup(page, 'lxml')
    title = soup.find('h1').get_text(' ', strip=True) if soup.find('h1') else ''
    opname = ''
    oa = soup.find('a', href=re.compile(r'^/operators/[^/]+$'))
    if oa: opname = oa.get_text(' ', strip=True)
    days = {}
    for day in r['days']:
        html = get(f'https://bustimes.org/services/{slug}?date={DATES[day]}')
        s2 = BeautifulSoup(html, 'lxml')
        dirs = []
        for tb in s2.find_all('table', class_='timetable'):
            h = tb.find_previous('h2')
            head = h.get_text(' ', strip=True) if h else ''
            trips = trips_from(grid(tb))
            dirs.append({'head': head, 'trips': trips})
        days[day] = dirs
        time.sleep(1)
    # stop sequence per direction: longest trip seen on any day
    lines = []
    ndir = max((len(v) for v in days.values()), default=0)
    for di in range(ndir):
        best = []
        for v in days.values():
            if di < len(v):
                for t in v[di]['trips']:
                    if len(t) > len(best): best = t
        pts = [loc[s[1]] for s in best if s[1] in loc]
        line, steps = osrm(pts) if len(pts) >= 2 else ([], [])
        lines.append({'stops': [s[1] for s in best], 'line': line, 'steps': steps})
    out = {'route': r, 'sid': sid, 'title': title, 'operator': opname, 'loc': loc, 'days': days, 'lines': lines}
    json.dump(out, open(fn, 'w'))
    return f'ok {ndir} dirs, ' + ', '.join(f'{d}:{[len(x["trips"]) for x in v]}' for d, v in days.items())


if __name__ == '__main__':
    only = sys.argv[1:]
    for r in ROUTES:
        if only and r['id'] not in only: continue
        try:
            print(r['id'], collect(r), flush=True)
        except Exception as e:
            print(r['id'], 'ERROR', repr(e)[:200], flush=True)
