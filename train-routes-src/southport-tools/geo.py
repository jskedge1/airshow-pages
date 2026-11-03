import json,math,heapq,glob,sys,xml.etree.ElementTree as ET
from names import osmname,EXTRA
ST_OSM=json.load(open('stops_osm.json')); NAMES=json.load(open('allnames.json'))
# python3 geo.py --keep : keep every line already in geo.json and only draw the stretches and stations that are new
KEEP='--keep' in sys.argv
OLD=json.load(open('geo.json')) if KEEP else {'snap':{},'seg':{}}
# a short walk between two stations as part of a change, drawn as a straight line
# (both ends doubled, and the train lines into those stations finish on the station itself, so the drawn line meets the walk)
STRAIGHT={frozenset(('Wigan North Western','Wigan Wallgate'))}
WALKST=set().union(*STRAIGHT)
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
snap={};pos={};FAR=set()
for n in NAMES:
    o=osmname(n); p=ST_OSM.get(o) or EXTRA.get(n) or EXTRA.get(o)
    if not p: print('NO POS',n); continue
    pos[n]=p
    k=min(cands,key=lambda c:dist(nodes[c],p)); snap[n]=k
    d=dist(nodes[k],p)
    if d>0.4: print('far snap',n,round(d,2))
    if d>1.5: FAR.add(n)
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
    if a+'|'+b in OLD['seg'] or b+'|'+a in OLD['seg']: continue
    if frozenset((a,b)) in STRAIGHT:
        SEG[a+'|'+b]=[[round(x,5),round(y,5)] for x,y in (nodes[snap[a]],nodes[snap[a]],nodes[snap[b]],nodes[snap[b]])]; continue
    straight=dist(pos[a],pos[b])
    p,d=(None,None) if (a in FAR or b in FAR) else sp(near[a],near[b])
    if p is None or d>straight*1.7+2:
        print('fallback',a,b,None if d is None else round(d,1),round(straight,1)); pts=[tuple(pos[a]),tuple(pos[b])]
    else: pts=[nodes[k] for k in p]
    if a in WALKST and pts[0]!=nodes[snap[a]]: pts=[nodes[snap[a]]]+pts
    if b in WALKST and pts[-1]!=nodes[snap[b]]: pts=pts+[nodes[snap[b]]]
    simp=[pts[0]]
    for q in pts[1:-1]:
        if dist(simp[-1],q)>0.06: simp.append(q)
    simp.append(pts[-1])
    SEG[a+'|'+b]=[[round(x,5),round(y,5)] for x,y in simp]
SNAP={n:[round(nodes[k][0],5),round(nodes[k][1],5)] for n,k in snap.items()}
if KEEP: SNAP={**SNAP,**OLD['snap']}; SEG={**OLD['seg'],**SEG}
json.dump({'snap':SNAP,'seg':SEG},open('geo.json','w'))
print('segs',len(SEG),sum(len(v) for v in SEG.values()))
