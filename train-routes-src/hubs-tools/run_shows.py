"""Scrapes the main UK stations show by show (skipping stations a page already has), fetching each show's calling points before moving on.
Run: python3 run_shows.py show [show ...]   Prints 'SHOW DONE <show>' as each one finishes."""
import json, sys, glob
sys.argv, shows = ['x'], sys.argv[1:]
import scrape
from concurrent.futures import ThreadPoolExecutor
SKIP = json.load(open('skip_existing.json'))
for s in shows:
    days = sorted(set(scrape.SH[s]['days'].values()))
    jobs = [(s, h, d) for d in days for h in scrape.HUBS if h not in SKIP.get(s, [])]
    with ThreadPoolExecutor(6) as ex: files = list(ex.map(scrape.job, jobs))
    legs = {}
    for f in files:
        r = json.load(open(f)); hub = f.split('_')[1]
        for k in r:
            for j in scrape.keep(r[k], k, hub):
                for g in j:
                    if g['op']: legs[scrape.leg_url(g)] = g
    print(s, 'rail legs', len(legs), flush=True)
    with ThreadPoolExecutor(4) as ex: list(ex.map(scrape.cache_leg, legs.values()))
    print('SHOW DONE', s, flush=True)
