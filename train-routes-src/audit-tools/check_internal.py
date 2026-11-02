import os
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import json,re,sys,collections
def m(t):
    h,mi=t.split(':');return int(h)*60+int(mi)
def diff(a,b):
    d=m(b)-m(a)
    return d+1440 if d<0 else d
pages=['clacton','eastbourne','cosford','wales','riat','riat-cheltenham','riat-kemble','ayr','duxford','blackpool','southport','midlands','gransden']
tot=collections.Counter();ex=collections.defaultdict(list);per={}
for p in pages:
    try:d=json.load(open(f'{HERE}/{p}-data.json'))
    except Exception as e: print(p,'no data',e);continue
    ns=len(d['stops']);seg=d['seg'];c=collections.Counter();n=0
    def bad(k,msg):
        c[k]+=1
        if len(ex[(p,k)])<3:ex[(p,k)].append(msg)
    for h in d['hubs']:
      for dr in h['dirs']:
        prev=None;seen=set()
        for t in dr['trips']:
            n+=1;s=t['s'];lab=f"{h['name']}|{dr['label']}|{t['big']}"
            key=(t['big'],t.get('plat'),t['dest'],t['small'])
            if key in seen:bad('duplicate',lab)
            seen.add(key)
            if t['big']!=s[0][0]:bad('big!=first time',lab)
            if not t['title'].startswith('The '+t['big']):bad('title time',lab+' '+t['title'])
            # monotonic
            tt=[x[0] for x in s];tot_m=0
            for a,b in zip(tt,tt[1:]):
                dd=diff(a,b)
                if dd>600:bad('jump>10h',lab)
                tot_m+=dd
            if tot_m!=t['ride']:bad('ride!=sum',f"{lab} ride {t['ride']} vs {tot_m}")
            if t['ride']>420:bad('ride>7h',f"{lab} {t['ride']}m")
            if t['ride']<3:bad('ride<3m',lab)
            mm=re.search(r'at (\d\d:\d\d)',t['small'])
            if not mm or mm.group(1)!=s[-1][0]:bad('small!=last',f"{lab} {t['small']} vs {s[-1][0]}")
            for x in s:
                if x[1]>=ns:bad('bad stop idx',lab)
            ch=t.get('changes',[])
            if len(t.get('ops',[]))<len(ch)+1 and len(t.get('ops',[]))!=1:bad('ops<legs',f"{lab} {t.get('ops')} changes {len(ch)}")
            for c_ in ch:
                w=diff(c_['arr'],c_['dep'])
                if w!=c_['wait']:bad('wait!=dep-arr',f"{lab} {c_}")
                if c_['wait']<3:bad('change<3min',f"{lab} {c_['at']} {c_['wait']}m")
                elif c_['wait']<5:bad('change<5min',f"{lab} {c_['at']} {c_['wait']}m")
                if c_['wait']>60:bad('change>60min',f"{lab} {c_['at']} {c_['wait']}m")
                ok=any(len(x)>3 and x[3]==c_['arr'] and x[0]==c_['dep'] for x in s)
                if not ok:bad('change not in s',f"{lab} {c_['at']}")
            # seg continuity
            for a,b in zip(s,s[1:]):
                k=f"{a[1]}|{b[1]}";k2=f"{b[1]}|{a[1]}"
                if k not in seg and k2 not in seg:bad('no map seg',f"{lab} {k}")
            # sorted by dep
            if prev and diff(prev,t['big'])>1000:pass
            prev=t['big']
        # ordering
        times=[m(t['big']) for t in dr['trips']]
        if any(b<a for a,b in zip(times,times[1:])) and not (max(times)>1380):bad('unsorted',f"{h['name']}|{dr['label']}")
    per[p]=(n,c)
    for k,v in c.items():tot[k]+=v
print('TRIPS',{p:v[0] for p,v in per.items()})
print('TOTAL ISSUES',dict(tot))
for p,(n,c) in per.items():print(p,n,dict(c))
for k,v in ex.items():print(k,v)
