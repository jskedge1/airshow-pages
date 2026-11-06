"""For any c2c station and day where the timetable came back thin (engineering work on that weekend, usually),
tries the same day a week later and keeps whichever gives more journeys. Then fetches the calling points it needs."""
import json, os, sys, datetime, shutil
sys.argv = ['x']
import scrape
from concurrent.futures import ThreadPoolExecutor
SH = json.load(open('shows.json'))
def kept(r): return min(len(scrape.keep(r['there'], 'there', h)), len(scrape.keep(r['back'], 'back', h)))
todo = []
for s in SH:
    for date in sorted(set(SH[s]['days'].values())):
        for h in scrape.HUBS:
            f = f'raw/{s}_{h}_{date}.json'; r = json.load(open(f))
            if kept(r) < 6: todo.append((s, h, date))
print(len(todo), 'to retry', flush=True)
def run(a):
    s, h, date = a; global_h = h
    d2 = str(datetime.date.fromisoformat(date) + datetime.timedelta(days=7))
    crs = SH[s]['crs']
    r2 = {'there': scrape.journeys(h, crs, d2), 'back': scrape.journeys(crs, h, d2)}
    f = f'raw/{s}_{h}_{date}.json'; r1 = json.load(open(f))
    k1 = min(len(scrape.keep(r1['there'], 'there', h)), len(scrape.keep(r1['back'], 'back', h)))
    k2 = min(len(scrape.keep(r2['there'], 'there', h)), len(scrape.keep(r2['back'], 'back', h)))
    if k2 > k1:
        shutil.copy(f, f + '.orig'); r2['altDate'] = d2; json.dump(r2, open(f, 'w'))
    print(s, h, date, k1, '->', k2, d2 if k2 > k1 else 'kept', flush=True)
    return (s, h, date)
with ThreadPoolExecutor(4) as ex: done = list(ex.map(run, todo))
legs = {}
for s, h, date in done:
    r = json.load(open(f'raw/{s}_{h}_{date}.json'))
    for k in ['there', 'back']:
        for j in scrape.keep(r[k], k, h):
            for g in j:
                if g['op']: legs[scrape.leg_url(g)] = g
print('legs', len(legs), flush=True)
with ThreadPoolExecutor(4) as ex: list(ex.map(scrape.cache_leg, legs.values()))
print('DONE', flush=True)
