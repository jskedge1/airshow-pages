import json,math,heapq,glob,sys,xml.etree.ElementTree as ET
from names import osmname,EXTRA
ST_OSM=json.load(open('stops_osm.json')); NAMES=json.load(open('allnames.json'))
nodes={};adj={}
for f in glob.glob('osm/r*.xml'):
    r=ET.parse(f).getroot()
    for n in r.findall('node'): nodes[n.get('id')]=(float(n.get('lat')),float(n.get('lon')))
    for w in r.findall('way'):
        t={x.get('k'):x.get('v') for x in w.findall('tag')}
        if t.get('railway')!='rail': continue
        nd=[x.get('ref') for x in w.findall('nd')]
        for a,b in zip(nd,nd[1:]):
            adj.setdefault(a,set()).add(b);adj.setdefault(b,set()).add(a)
def dist(a,b):
    la=math.radians((a[0]+b[0])/2);return math.hypot((a[0]-b[0])*111.32,(a[1]-b[1])*111.32*math.cos(la))
cands=[k for k in adj if k in nodes]
snap={};pos={}
for n in NAMES:
    o=osmname(n); p=ST_OSM.get(o) or EXTRA.get(n) or EXTRA.get(o)
    if not p: print('NO POS',n); continue
    pos[n]=p
    k=min(cands,key=lambda c:dist(nodes[c],p)); snap[n]=k
    d=dist(nodes[k],p)
    if d>0.4: print('far snap',n,round(d,2))
near={}
for n,p in pos.items():
    near[n]=[c for c in cands if dist(nodes[c],p)<0.35] or [snap[n]]
def sp(A,B):
    B=set(B); D={a:0 for a in A};P={};h=[(0,a) for a in A]; b=None
    while h:
        d,u=heapq.heappop(h)
        if u in B: b=u; break
        if d>D[u]: continue
        for v in adj.get(u,()):
            if v not in nodes: continue
            nd=d+dist(nodes[u],nodes[v])
            if nd<D.get(v,1e18): D[v]=nd;P[v]=u;heapq.heappush(h,(nd,v))
    if b is None: return None,None
    path=[b]
    while path[-1] in P: path.append(P[path[-1]])
    return path[::-1],D[b]
pairs=set(tuple(x) for x in json.load(open('pairs.json')))
SEG={}
for a,b in sorted(pairs):
    if (b,a) in SEG or a not in snap or b not in snap: continue
    p,d=sp(near[a],near[b]); straight=dist(pos[a],pos[b])
    if p is None or d>straight*1.45+1.5:
        print('fallback',a,b,None if d is None else round(d,1),round(straight,1)); pts=[tuple(pos[a]),tuple(pos[b])]
    else: pts=[nodes[k] for k in p]
    simp=[pts[0]]
    for q in pts[1:-1]:
        if dist(simp[-1],q)>0.06: simp.append(q)
    simp.append(pts[-1])
    SEG[a+'|'+b]=[[round(x,5),round(y,5)] for x,y in simp]
json.dump({'snap':{n:[round(nodes[k][0],5),round(nodes[k][1],5)] for n,k in snap.items()},'seg':SEG},open('geo.json','w'))
print('segs',len(SEG),sum(len(v) for v in SEG.values()))
