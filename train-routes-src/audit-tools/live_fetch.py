import json,re,subprocess,html,time,sys,collections,threading
from concurrent.futures import ThreadPoolExecutor
import os
SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
BASE='https://traintimes.org.uk'
def get(u):
    for k in range(3):
        r=subprocess.run(['curl','-s','--max-time','30','-A','Mozilla/5.0 (planning preview)',BASE+u],capture_output=True,text=True)
        if r.stdout and len(r.stdout)>500:return r.stdout
        time.sleep(2)
    return ''
def hm(iso):return iso[11:16]
def live(frm,to,date):
    out={};t='04:30'
    for _ in range(18):
        s=get(f'/{frm}/{to}/{t}/{date}');new=0
        for l in re.findall(r'class="calling_link(?:_inner)?" href="([^"]+)"',s):
            l=html.unescape(l)
            key=re.sub(r'&stage=\d+','',l)
            if key in out:continue
            legs=re.findall(r'legs\[\]=([A-Z]+)\|([A-Z]+)\|(\d{4}-\d\d-\d\dT\d\d:\d\d)[^|&]*\|(\d{4}-\d\d-\d\dT\d\d:\d\d)',l)
            if not legs:
                m=re.search(r'from=([A-Z]+)&to=([A-Z]+)&depart=(\d{4}-\d\d-\d\dT\d\d:\d\d)[^&]*&arrive=(\d{4}-\d\d-\d\dT\d\d:\d\d)',l)
                if m:legs=[m.groups()]
            if not legs or not legs[0][2].startswith(date):continue
            ops=re.findall(r'ops\[\]=([^&]*)',l)
            out[key]={'dep':hm(legs[0][2]),'arr':hm(legs[-1][3]),'legs':[(a,b,hm(c),hm(d)) for a,b,c,d in legs],'ops':[o.replace('+',' ') for o in ops if o]}
            new+=1
        later=re.search(r'href="(/[A-Z]{3}/[A-Z]{3}/(\d\d:\d\d)/(\S+?))">Later',s)
        if not later or later.group(3)!=date or new==0:break
        t=later.group(2);time.sleep(.3)
    return list(out.values())
pages={'clacton':('CLT',{'thu':'2026-11-05','fri':'2026-11-06'}),'eastbourne':None,'cosford':None,'wales':None,'riat':None,'riat-cheltenham':None,'riat-kemble':None,'ayr':None,'duxford':None,'blackpool':None,'southport':None,'midlands':None,'gransden':None}
toolsdir={'riat-cheltenham':'cheltenham','riat-kemble':'kemble'}
def dates_for(p,d):
    if p=='clacton':return {'thu':'2026-11-05','fri':'2026-11-06'}
    td=toolsdir.get(p,p)
    return {k:v for k,v in json.load(open(f'{SRC}{td}-tools/dates.json'))}
tasks=[];meta={}
for p in pages:
    d=json.load(open(f'{SRC}{p}-data.json'));c=json.load(open(f'{SRC}{p}-cfg.json'))
    dest='CLT' if p=='clacton' else c['x']['destCrs']
    dts=dates_for(p,d);meta[p]=(d,dest,dts)
    seen=set()
    for h in d['hubs']:
        for fr,to in ((h['code'],dest),(dest,h['code'])):
            for k in d['days']:
                dt=dts[k['key']]
                if (fr,to,dt) not in seen:seen.add((fr,to,dt));tasks.append((fr,to,dt))
print('tasks',len(tasks),flush=True)
import os
cache={tuple(k.split('|')):v for k,v in json.load(open('/tmp/live_cache.json')).items()} if os.path.exists('/tmp/live_cache.json') else {}
lock=threading.Lock();done=[0]
tasks=[t for t in tasks if t not in cache]
print('remaining',len(tasks),flush=True)
def run(t):
    r=live(*t)
    with lock:
        cache[t]=r;done[0]+=1
        if done[0]%20==0:
            print('done',done[0],flush=True);json.dump({'|'.join(k):v for k,v in cache.items()},open('/tmp/live_cache.json','w'))
with ThreadPoolExecutor(3) as ex:list(ex.map(run,tasks))
json.dump({'|'.join(k):v for k,v in cache.items()},open('/tmp/live_cache.json','w'))
print('FETCHED',flush=True)
