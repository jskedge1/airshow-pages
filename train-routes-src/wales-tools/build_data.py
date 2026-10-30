"""hubjourneys.json + geo.json -> wales-data.json for the train route template."""
import json,re
from names import nice as NICE
J=json.load(open('hubjourneys.json')); G=json.load(open('geo.json'))
DEST='Swansea'
HUBS=[('PAD','London Paddington','London'),('RDG','Reading','Reading'),('SWI','Swindon (Wilts)','Swindon'),('BPW','Bristol Parkway','Bristol Parkway'),
      ('BRI','Bristol Temple Meads','Bristol'),('NWP','Newport (South Wales)','Newport'),('CDF','Cardiff Central','Cardiff'),('BGN','Bridgend','Bridgend'),
      ('LLE','Llanelli','Llanelli'),('CMN','Carmarthen','Carmarthen'),('MAN','Manchester Piccadilly','Manchester'),('BHM','Birmingham New Street','Birmingham')]
SHORT={'London Paddington':'Paddington','Birmingham New Street':'Birmingham','Manchester Piccadilly':'Manchester','Cardiff Central':'Cardiff','Bristol Temple Meads':'Temple Meads','Port Talbot Parkway':'Port Talbot','Worcester Foregate Street':'Worcester Foregate St','Worcester Shrub Hill':'Worcester','Pembrey and Burry Port':'Pembrey'}
BIG={'London Paddington','Reading','Didcot Parkway','Swindon (Wilts)','Bristol Parkway','Bristol Temple Meads','Bath Spa','Chippenham','Severn Tunnel Junction','Newport (South Wales)','Cardiff Central','Bridgend','Port Talbot Parkway','Neath','Swansea','Llanelli','Carmarthen','Manchester Piccadilly','Stockport','Crewe','Shrewsbury','Hereford','Abergavenny','Birmingham New Street','Cheltenham Spa','Gloucester','Worcester Shrub Hill','Great Malvern','Ludlow','Chepstow','Wolverhampton','Stafford'}
DAYS=[('sat','Saturday'),('sun','Sunday')]
stops=[];SI={}
def si(n):
    if n not in SI:
        SI[n]=len(stops); p=G['snap'][n]; nice=NICE(n); stops.append([nice,p[0],p[1],SHORT.get(nice,nice),n])
    return SI[n]
def mm(t): return int(t[:2])*60+int(t[3:])
def gap(a,b):
    d=mm(b)-mm(a); return d+1440 if d<0 else d
def tdest(info):
    d=re.sub(r'.* to ','',info); d=d
    return d
def torig(info):
    m=re.search(r' from (.+) to ',info); return m.group(1).replace('Portsmouth And Southsea','Portsmouth & Southsea') if m else ''
KEY,OFF,LABEL,CHG=1,2,4,8
def trip(x,toshow,hubname):
    d,a,tot,legs=x
    s=[];changes=[]
    for li,lg in enumerate(legs):
        cs=lg['calls']
        for ci,c in enumerate(cs):
            last=(li==len(legs)-1 and ci==len(cs)-1)
            if li>0 and ci==0:
                prev=s[-1]; arr=prev[0]; prev[0]=c[2] or c[1]; prev[2]|=CHG|KEY|LABEL; prev.append(arr)
                changes.append({'at':NICE(c[0]),'arr':arr,'dep':c[2] or c[1],'ap':legs[li-1]['calls'][-1][3],'dp':c[3],'wait':gap(arr,c[2] or c[1]),'to':tdest(lg['info'])})
                continue
            t=c[1] if (last or ci==len(cs)-1) else (c[2] or c[1])
            f=(KEY|LABEL if c[0] in BIG or ci==0 and li==0 or last else 0)|(OFF|KEY|LABEL if c[0]==DEST else 0)
            s.append([t,si(c[0]),f])
    l0=legs[0]; first=l0['calls'][0]
    return {'big':s[0][0],'plat':first[3],'ride':tot,'dest':tdest(l0['info']),
        'calls':[SHORT.get(NICE(c[0]),NICE(c[0])) for c in l0['calls'][1:]],
        'small':('Gets to Swansea at ' if toshow else 'Back in '+hubname+' at ')+s[-1][0],
        'title':'The '+s[0][0]+' from '+stops[s[0][1]][0],'s':s,'changes':changes,'lorig':torig(legs[-1]['info'])}
def table(trips,toshow,hubfull):
    direct=trips and all(not t['changes'] for t in trips)
    if direct:
        longest=max(trips,key=lambda t:len(t['s']))
        rows=[stops[p[1]][4] for p in longest['s'] if stops[p[1]][4] in BIG or p is longest['s'][0] or p is longest['s'][-1]]
        cols=[]
        for t in trips:
            m={stops[p[1]][4]:p[0] for p in t['s']}; cols.append([m.get(r,'') for r in rows])
        return {'rows':[SHORT.get(NICE(r),NICE(r)) for r in rows],'off':rows.index(DEST),'cols':cols}
    o=NICE(hubfull) if toshow else DEST; e=DEST if toshow else NICE(hubfull)
    rows=['Leave '+SHORT.get(o,o),'Change at','Change time','Arrive '+SHORT.get(e,e)]
    cols=[[t['big'],', '.join(c['at'] for c in t['changes']) or 'Direct',', '.join(c['dep'] for c in t['changes']) or '',t['s'][-1][0]] for t in trips]
    return {'rows':rows,'off':3 if toshow else 0,'cols':cols,'wide':1}
def dirs(code,full,short,dk):
    nice=NICE(full)
    there=[trip(x,True,short) for x in J[code][dk]['there']]; back=[trip(x,False,short) for x in J[code][dk]['back']]
    return [{'label':'To Swansea','trips':there,'tt':table(there,True,full),'from':nice,'note':'Times from '+nice+'. Tap one to see every station on the way.'},
            {'label':'Back to '+short,'trips':back,'tt':table(back,False,full),'from':DEST,'note':'Times from Swansea. If you’re staying for Afterburn on the Saturday evening, look at the last trains before you settle in.'}]
hubs=[]
for code,full,short in HUBS:
    base=dirs(code,full,short,'sat'); days={}
    sig=lambda D:json.dumps([[t['big'],t['s'][-1][0],len(t['changes'])] for d in D for t in d['trips']])
    for dk,_ in DAYS[1:]:
        if dk not in J[code]: continue
        D=dirs(code,full,short,dk)
        if sig(D)!=sig(base): days[dk]=D
    h={'code':code,'name':NICE(full),'short':short,'dirs':base}
    if days: h['days']=days
    hubs.append(h)
segs={}
for h in hubs:
    for D in [h['dirs']]+list(h.get('days',{}).values()):
        for d in D:
            for t in d['trips']:
                for p,q in zip(t['s'],t['s'][1:]):
                    a,b=stops[p[1]][4],stops[q[1]][4]
                    if a+'|'+b in G['seg']: segs[str(SI[a])+'|'+str(SI[b])]=G['seg'][a+'|'+b]
                    elif b+'|'+a in G['seg']: segs[str(SI[b])+'|'+str(SI[a])]=G['seg'][b+'|'+a]
DATA={'stops':[s[:4] for s in stops],'seg':segs,'hubs':hubs,'days':[{'key':k,'label':l} for k,l in DAYS]}
json.dump(DATA,open('wales-data.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(json.dumps(DATA,ensure_ascii=False))//1024,'KB',len(stops),'stations',len(segs),'segs')
for h in hubs:
    tr=h['dirs'][0]['trips']; print(h['short'],len(tr),'days:',list(h.get('days',{})),[(t['big'],t['s'][-1][0],[c['at']+' '+str(c['wait']) for c in t['changes']]) for t in tr[8:11]])
