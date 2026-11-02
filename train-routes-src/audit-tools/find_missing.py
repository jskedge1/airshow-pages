import os
import json,collections
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'common.py')).read())
def mm(t):
    h,m=t.split(':');return int(h)*60+int(m)
def absarr(dep,arr):
    a=mm(arr);d=mm(dep)
    return a+1440 if a<d else a
res={}
for p in pages:
    d=json.load(open(f'{SRC}{p}-data.json'));c=json.load(open(f'{SRC}{p}-cfg.json'))
    dest='CLT' if p=='clacton' else c['x']['destCrs'];dts=dates_for(p);first=d['days'][0]['key']
    tot=0;nd=collections.Counter();ex=[]
    for h in d['hubs']:
        for di,(fr,to) in enumerate(((h['code'],dest),(dest,h['code']))):
            for dk in d['days']:
                k=dk['key'];dirs=h['dirs'] if k==first else h.get('days',{}).get(k)
                if dirs is None:continue
                live=cache.get((fr,to,dts[k]))
                if live is None:continue
                P=[(mm(t['s'][0][0]),absarr(t['s'][0][0],t['s'][-1][0])) for t in dirs[di]['trips']]
                PD={t['s'][0][0] for t in dirs[di]['trips']}
                for j in live:
                    if j['dep'] in PD:continue
                    ncg=len(j['legs'])-1
                    if ncg>1:continue
                    dep=mm(j['dep']);arr=absarr(j['dep'],j['arr'])
                    dom=any(pd>=dep and pa<=arr for pd,pa in P)
                    tot+=1
                    if not dom:
                        nd[(tuple(sorted(set(j['ops']))),ncg)]+=1
                        if len(ex)<5:ex.append(f"{h['name']}|{dirs[di]['label']}|{k}|{j['dep']}-{j['arr']} {j['ops']} chg={ncg}")
    res[p]=(tot,sum(nd.values()),nd.most_common(4),ex)
for p,(t,n,top,ex) in res.items():
    print(p,f'live trains with 0-1 change not on page: {t}; NOT dominated: {n}');
    if n:print('   top:',top);[print('   e.g.',e) for e in ex[:4]]
