"""Build the public transport hub preview from the bus/train route pages already made."""
import json, re, html

ROUTES = {r['id']: r for r in json.load(open('routes_extract.json'))}
SITE = 'https://www.ukairshowguide.co.uk/'

COL = {  # op1 (badge), op2 (stripe), ink on op1. Same livery colours as the route pages.
    'Stagecoach': ('#1D4F91', '#F58025', '#FFFFFF'),
    'Arriva': ('#00A5A3', '#003B5C', '#FFFFFF'),
    'First': ('#4B2E83', '#E6007E', '#FFFFFF'),
    'Brighton and Hove': ('#C8102E', '#F3E8CF', '#FFFFFF'),
    'Blackpool Transport': ('#1A1A1A', '#FFD100', '#FFD100'),
    'Central Connect': ('#00843D', '#7AC143', '#FFFFFF'),
    'A2B Bus and Coach': ('#1E5AA8', '#8CC63F', '#FFFFFF'),
    'Cuckmere Buses': ('#2E6B30', '#F2E6B8', '#FFFFFF'),
    'Diamond Bus': ('#004B93', '#E30613', '#FFFFFF'),
    'Grant Palmer': ('#0B3D91', '#FFC20E', '#FFFFFF'),
    'Vision Bus': ('#D71920', '#1A1A1A', '#FFFFFF'),
}
def col(op):
    for k, v in COL.items():
        if op.startswith(k): return v
    return ('#13293C', '#32B4AF', '#FFFFFF')

SHOWS = [
    dict(k='riat', name='RIAT', full='Royal International Air Tattoo', place='RAF Fairford, Gloucestershire', url='riat',
         intro='Fairford is out in the Cotswolds, so getting here by bus takes a bit of planning. Both buses run between Highworth and Cirencester, and neither drops you at the gate. I would check the last bus back before you commit to it.',
         buses=['76-riat', '77-riat']),
    dict(k='cosford', name='Cosford', full='RAF Cosford Air Show', place='RAF Cosford, Shropshire', url='cosfordairshow',
         intro='Cosford is the easy one for the train. The station sits right next to the airfield, about 300 metres from the show, and there are no show day buses to worry about. Just plan around the one train an hour each way.',
         trains=[('Train to Cosford', 'West Midlands Railway', 'train-to-cosford', 'Birmingham to Shrewsbury trains stop at Cosford once an hour each way. About 18 minutes from Wolverhampton, with connections from London, Leeds, Cardiff and Manchester.', 'Cosford', 'About 5 to 10 minutes')],
         buses=[]),
    dict(k='midlands', name='Midlands', full='Midlands Air Festival', place='Ragley Hall, Warwickshire', url='midlandsairfestival',
         intro='Ragley Hall is between Redditch and Evesham, which is exactly where the 247 runs. You get off by the estate and it’s about 15 minutes on foot from there.',
         buses=['247-midlands']),
    dict(k='eastbourne', name='Eastbourne', full='Eastbourne Airshow', place='Western Lawns, Eastbourne', url='eastbourneairshow',
         intro='This is one of the easiest shows to get to without a car. The train drops you in the town centre, and buses come in from Brighton, Lewes and Hastings. If you want the shortest walk, the 3 takes you right down to Meads.',
         trains=[('Trains to Eastbourne', 'Southern', 'train-to-eastbourne', 'From London Victoria every 30 minutes, about 1 hour 25 minutes. Coast trains come in from Brighton and Hastings too.', 'Eastbourne', '10 to 15 minutes')],
         buses=['3-eastbourne', '12-eastbourne', '12x-eastbourne', '13x-eastbourne', '28-eastbourne', '25-eastbourne', '99-eastbourne']),
    dict(k='clacton', name='Clacton', full='Clacton Air Show', place='West Greensward, Clacton', url='clactonairshow',
         intro='Clacton has a direct train from London every hour, and Central Connect buses come in from all round Tendring and Colchester. Pick the bus from your nearest town and you won’t need to worry about parking on the seafront.',
         trains=[('Train to Clacton', 'Greater Anglia', 'train-to-clacton', 'Direct from London Liverpool Street every hour, about 1 hour 26 minutes. Change at Colchester or Shenfield from other stations.', 'Clacton-on-Sea', '10 to 15 minutes')],
         buses=['74-clacton', '74b-clacton', '76-clacton', '78-clacton', '2-clacton', '2a-clacton', '3-clacton', '4-clacton', '6-clacton', '6a-clacton', '7-clacton', '9-clacton', '9a-clacton', '98a-clacton']),
    dict(k='wales', name='Wales', full='Wales Airshow', place='Swansea Bay', url='walesairshow',
         intro='Please read this one before you travel. The seafront roads close on Airshow weekend, so these buses don’t always stop where they normally would. Each route page has my note on where to get off instead.',
         buses=['1-wales', '2-wales', '2a-wales', '3a-wales', 'x1-wales']),
    dict(k='duxford', name='Duxford', full='Duxford Air Shows', place='IWM Duxford, Cambridgeshire', url='duxfordairshows',
         intro='The 132 is the one I would look at if you’re coming without a car. It picks up in Cambridge city centre and outside the railway station, then drops you right by Hangar 1.',
         buses=['132-duxford']),
    dict(k='headcorn', name='Headcorn', full='Headcorn Air Show', place='Headcorn Aerodrome, Kent', url='headcorn-air-show',
         intro='Nice and simple. The 12 stops at the aerodrome itself, so you’re right by the show when you get off.',
         buses=['12-headcorn']),
    dict(k='shuttleworth', name='Shuttleworth', full='Shuttleworth Air Shows', place='Old Warden, Bedfordshire', url='shuttleworthairshows',
         intro='Old Warden is a small village and no bus goes to the door. The 74 gets you closest, but it’s still about a 25 minute walk along country roads. That might work for you, but I would think about it with young children.',
         buses=['74-shuttleworth']),
    dict(k='gransden', name='Little Gransden', full='Little Gransden Air & Car Show', place='Little Gransden, Cambridgeshire', url='little-gransden-air-and-car-show',
         intro='No route pages for this one. The airfield is out in the countryside with very few buses, so I would suggest driving or sharing a lift with others going. The forum is a good place to ask.',
         buses=[]),
    dict(k='southport', name='Southport', full='Southport Air Show', place='Southport beach and pier', url='southport-air-show',
         intro='Lots of buses come into Southport from Liverpool, Preston, Wigan and St Helens. Most finish in the town centre, about 15 minutes on foot from the pier.',
         buses=['47-southport', '300-southport', '44-southport', 'x2-southport', '2-southport', '347-southport', '375-southport', '385-southport', 'x37-southport', '37a-southport']),
    dict(k='blackpool', name='Blackpool', full='Blackpool Air Show', place='Central Pier, Blackpool', url='blackpool-air-show',
         intro='Most buses finish in the town centre, somewhere between 5 and 15 minutes from Central Pier. The 10 gets you closest, from the Central coach station.',
         buses=['10-blackpool', '11-blackpool', '14-blackpool', '5c-blackpool', '61-blackpool', '68-blackpool', '42-blackpool']),
    dict(k='ayr', name='Ayr', full='International Ayr Show', place='Low Green, Ayr', url='international-ayr-show',
         intro='Buses come in from Glasgow and from round Ayrshire. The 9, 42 and X42 stop closest, about 6 minutes from Low Green.',
         buses=['x77-ayr', '4-ayr', '9-ayr', '42-ayr', 'x42-ayr']),
]

def e(s): return html.escape(s, quote=True)

def stop_of(r):
    lead = r['lead']
    m = re.search(r'closest stop is (.+?), about', lead) or re.search(r'get off at (.+?), which', lead)
    if r['id'].endswith('-wales'): return 'Check my note first'
    if r['id'] == '132-duxford': return 'Right by Hangar 1'
    return m.group(1) if m else r['targetLabel']

def walk_of(r):
    m = re.search(r'about (\d+) minutes', r['walk'])
    return f'About {m.group(1)} minutes' if m else 'Right by the show'

def from_to(r):
    t = r['title']
    m = re.match(r'Bus \S+, (.+?) for the', t)
    if m: return m.group(1)
    m = re.match(r'Bus \S+ (to .+?) for the', t)
    return m.group(1)[0].upper() + m.group(1)[1:] if m else ''

data = []
for s in SHOWS:
    buses = []
    for bid in s['buses']:
        r = ROUTES[bid]
        c = col(r['op'])
        buses.append(dict(id=bid, num=r['num'], ft=from_to(r), op=r['op'], stop=stop_of(r), walk=walk_of(r),
                          to=r['targetLabel'], c1=c[0], c2=c[1], ink=c[2]))
    trains = [dict(t=t[0], op=t[1], url=SITE + t[2], blurb=t[3], st=t[4], walk=t[5]) for t in s.get('trains', [])]
    data.append(dict(k=s['k'], name=s['name'], full=s['full'], place=s['place'], url=SITE + s['url'],
                     intro=s['intro'], buses=buses, trains=trains))

nb = sum(len(s['buses']) for s in data)
nt = sum(len(s['trains']) for s in data)
nshow = sum(1 for s in data if s['buses'] or s['trains'])
ops = sorted({b['op'] for s in data for b in s['buses']})

import sys
OUT = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
tpl = open('template.html').read()
out = (tpl.replace('__DATA__', json.dumps(data, ensure_ascii=False))
          .replace('__NB__', str(nb)).replace('__NT__', str(nt)).replace('__NSHOW__', str(nshow))
          .replace('__NOPS__', str(len(ops)))
          .replace('__IMG__', sys.argv[2] if len(sys.argv) > 2 else 'img/seafront-crowd.webp'))
open(OUT, 'w').write(out)
print(nb, nt, nshow, len(ops))
