import re
NICE_FIX={'Prestwick (Strathclyde)':'Prestwick Town','Edinburgh':'Edinburgh Waverley','Preston (Lancs)':'Preston','London St Pancras International':'London St Pancras','Earlswood Surrey':'Earlswood','Seaford Sussex':'Seaford'}
def nice(n):
    n=NICE_FIX.get(n,n)
    return re.sub(r'\s*\((Sussex|Kent|Surrey|Brighton|Strathclyde|Lancs)\)','',n) if '(Brighton)' not in n else n
OSM_FIX={'Prestwick (Strathclyde)':'Prestwick Town','Edinburgh':'Edinburgh Waverley','Preston (Lancs)':'Preston','London St Pancras International':'London St Pancras','Portsmouth & Southsea':'Portsmouth and Southsea','Pevensey & Westham':'Pevensey and Westham',
 'Goring by Sea':'Goring-by-Sea','Shoreham by Sea':'Shoreham-by-Sea','Durrington':'Durrington-on-Sea','Earlswood Surrey':'Earlswood'}
EXTRA={'Cambuslang':(55.8195,-4.1729),'Cardonald':(55.8526,-4.3405),'Crossmyloof':(55.8340,-4.2846),'Hillington East':(55.8545,-4.3550),'Hillington West':(55.8561,-4.3714),'Kennishead':(55.8132,-4.3253),'Nitshill':(55.8125,-4.3605),'Pollokshaws West':(55.8238,-4.3015),'Priesthill & Darnley':(55.8121,-4.3428),'Penrith':(54.6619,-2.7584),'Coulsdon South':(51.3157,-0.1378),'Merstham':(51.2642,-0.1501),'Selhurst':(51.3919,-0.0882),'Littlehampton':(50.8106,-0.5463),
 'Pevensey Bay':(50.8178,0.3434),'Doleham':(50.9186,0.6098),'Bedhampton':(50.8540,-0.9958),'Seaford Sussex':(50.7727,0.1006),'Newhaven Harbour':(50.7894,0.0549)}
def osmname(n):
    return OSM_FIX.get(n, re.sub(r'\s*\((Sussex|Kent|Surrey|Strathclyde|Lancs)\)','',n))
