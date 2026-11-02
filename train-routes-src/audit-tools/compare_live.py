import os
import json,collections
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'common.py')).read())
out={};notfound=collections.defaultdict(list)
for p in pages:
    d=json.load(open(f'{SRC}{p}-data.json'));c=json.load(open(f'{SRC}{p}-cfg.json'))
    dest='CLT' if p=='clacton' else c['x']['destCrs'];dts=dates_for(p);first=d['days'][0]['key']
    tot=ok=0;bydep=collections.Counter();byday=collections.Counter();grp=collections.Counter()
    for h in d['hubs']:
        for di,(fr,to) in enumerate(((h['code'],dest),(dest,h['code']))):
            for dk in d['days']:
                k=dk['key']
                dirs=h['dirs'] if k==first else h.get('days',{}).get(k)
                if dirs is None:continue
                live=cache.get((fr,to,dts[k]))
                if live is None:continue
                L={(j['dep'],j['arr']) for j in live};LD={j['dep'] for j in live}
                for t in dirs[di]['trips']:
                    tot+=1;pr=(t['s'][0][0],t['s'][-1][0])
                    if pr in L:ok+=1
                    else:
                        kind='dep missing' if pr[0] not in LD else 'arr differs'
                        grp[(kind,k)]+=1;bydep[(h['name'],dirs[di]['label'],k)]+=1
                        if len(notfound[p])<400:notfound[p].append((kind,h['name'],dirs[di]['label'],k,pr))
    out[p]=(tot,ok,dict(grp),bydep.most_common(6))
for p,(t,o,g,b) in out.items():print(p,f'{o}/{t} exact match ({100*o/t:.1f}%)',g);print('   worst:',b)
json.dump({p:v for p,v in notfound.items()},open('/tmp/notfound.json','w'))
