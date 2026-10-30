"""Reads raw/h_<hub>_<date>.json, keeps the sensible journeys for each hub, day and direction,
and writes hubjourneys.json, allnames.json and pairs.json (station pairs for the map lines)."""
import json,os
from parse2 import parse
HUBS='PAD RDG SWI BPW BRI NWP CDF BGN LLE CMN MAN BHM'.split()
DAYS=[tuple(x) for x in json.load(open('dates.json'))]
def mm(t): return int(t[:2])*60+int(t[3:])
def gap(a,b):
    d=mm(b)-mm(a); return d+1440 if d<0 else d
def clean(js):
    out=[]
    for legs in js:
        legs=[l for l in legs if l['calls']]
        if not legs: continue
        dep=legs[0]['calls'][0]; arr=legs[-1]['calls'][-1]
        d=dep[2] or dep[1]; a=arr[1]; tot=gap(d,a)
        if tot>300 or len(legs)>3: continue
        if any(gap(legs[i]['calls'][-1][1], legs[i+1]['calls'][0][2] or legs[i+1]['calls'][0][1])>60 for i in range(len(legs)-1)): continue
        out.append((d,a,tot,legs))
    keep=[]
    for x in out:
        pen=lambda z:(len(z[3])-1)*12
        beaten=any((y is not x) and mm(y[0])>=mm(x[0])-0 and y[2]+(mm(y[0])-mm(x[0]))+pen(y)<=x[2]+pen(x) and (y[0],y[1])!=(x[0],x[1]) and len(y[3])<=len(x[3])+0 for y in out) or \
               any((y is not x) and len(y[3])<len(x[3]) and abs(mm(y[0])-mm(x[0]))<=15 and gap(x[1],y[1])<=12 for y in out)
        if not beaten and not any(k[0]==x[0] and k[1]==x[1] for k in keep): keep.append(x)
    best={}
    for x in keep:
        k=x[0]; v=mm(x[1]) if mm(x[1])>=240 else mm(x[1])+1440
        sc=v+12*(len(x[3])-1)
        if k not in best or sc<best[k][0]: best[k]=(sc,x)
    keep=[v[1] for v in best.values()]
    return sorted(keep,key=lambda x:mm(x[0]) if mm(x[0])>=240 else mm(x[0])+1440)
J={}
for h in HUBS:
    for dk,date in DAYS:
        f=f'raw/h_{h}_{date}.json'
        if not os.path.exists(f): continue
        R=parse(f)
        J.setdefault(h,{})[dk]={'there':clean(R.get(f'{h}_SWA',[])),'back':clean(R.get(f'SWA_{h}',[]))}
json.dump(J,open('hubjourneys.json','w'))
names=set();pairs=set()
for h in J:
    for dk in J[h]:
        for k in J[h][dk]:
            for x in J[h][dk][k]:
                for lg in x[3]:
                    cs=[c[0] for c in lg['calls']]
                    names.update(cs); pairs.update(zip(cs,cs[1:]))
json.dump(sorted(names),open('allnames.json','w')); json.dump(sorted(pairs),open('pairs.json','w'))
for h in J:
    print(h,{dk:(len(v['there']),len(v['back'])) for dk,v in J[h].items()})
