"""Fetches the calling points for the kept journeys of the shows named (for testing one show before the full run)."""
import json, glob, sys
shows = sys.argv[1:]; sys.argv = ['x']
import scrape
from concurrent.futures import ThreadPoolExecutor
legs = {}
for s in shows:
    for f in glob.glob(f'raw/{s}_*.json'):
        r = json.load(open(f)); hub = f.split('_')[1]
        for k in r:
            for j in scrape.keep(r[k], k, hub):
                for g in j:
                    if g['op']: legs[scrape.leg_url(g)] = g
print(len(legs), flush=True)
with ThreadPoolExecutor(2) as ex: list(ex.map(scrape.cache_leg, legs.values()))
print('ok', flush=True)
