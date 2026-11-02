import os,json,collections,sys
import json,collections,sys
SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
cache={tuple(k.split('|')):v for k,v in json.load(open('/tmp/live_cache.json')).items()}
pages=['clacton','eastbourne','cosford','wales','riat','riat-cheltenham','riat-kemble','ayr','duxford','blackpool','southport','midlands','gransden']
toolsdir={'riat-cheltenham':'cheltenham','riat-kemble':'kemble'}
def dates_for(p):
    if p=='clacton':return {'thu':'2026-11-05','fri':'2026-11-06'}
    return {k:v for k,v in json.load(open(f'{SRC}{toolsdir.get(p,p)}-tools/dates.json'))}
