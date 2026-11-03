"""Build public-transport.html: the Getting there section of every featured show page,
public transport topics only, one show at a time, in the Clacton transport design.

Run from the repo root:  python3 public-transport-src/build.py
It reads the topics straight out of camping-layout/<show>.html (via extract.js, needs node),
the train boxes from the same pages, and the bus route list from bus-routes/*.html.
The look comes from the Clacton page's styles plus explore-designs.js ('mix'), loaded live.
"""
import json, os, re, subprocess, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = 'https://www.ukairshowguide.co.uk/'
os.chdir(ROOT)

SHOWS = [
    ('riat', 'RIAT', 'Royal International Air Tattoo', 'RAF Fairford, Gloucestershire', 'riat',
     'Fairford is out in the Cotswolds, so this one takes a bit of planning. I would look at the train to Swindon and the free Swindon Shuttle first, which you book with your ticket. The Park and Ride buses work well too.'),
    ('cosford', 'Cosford', 'RAF Cosford Air Show', 'RAF Cosford, Shropshire', 'cosfordairshow',
     'Cosford is the easy one for the train. The station is under 300 metres from the entrance, with a train an hour each way on the Birmingham to Shrewsbury line. There are no Sunday buses, so the train really is the way in.'),
    ('midlands', 'Midlands', 'Midlands Air Festival', 'Ragley Hall, Alcester', 'midlandsairfestival',
     'Redditch is the station I would use, then the Diamond 247 bus, which stops right by the Ragley Hall main entrance. Please check the bus times first, as there is no Sunday service.'),
    ('eastbourne', 'Eastbourne', 'Eastbourne Airshow', 'Western Lawns, Eastbourne', 'eastbourneairshow',
     'This is one of the easiest shows to get to without a car. The train drops you in the town centre, and buses come in from Brighton, Lewes and Hastings. If you want the shortest walk, the 3 takes you right down to Meads.'),
    ('clacton', 'Clacton', 'Clacton Air Show', 'West Greensward, Clacton', 'clactonairshow',
     'Clacton has a direct train from London every hour, Central Connect buses from all round Tendring and Colchester, and National Express coaches into Colchester. Pick the one from your nearest town and you won’t need to worry about seafront parking.'),
    ('wales', 'Wales', 'Wales Airshow', 'Swansea Bay', 'walesairshow',
     'Please read this one before you travel. The seafront roads close on Airshow weekend, so the buses don’t always stop where they normally would. The train to Swansea and the Park and Ride from Fabian Way are the ones I would look at first.'),
    ('duxford', 'Duxford', 'Duxford Air Shows', 'IWM Duxford, Cambridgeshire', 'duxfordairshows',
     'For the big Air Shows there is a free shuttle bus from Cambridge station, and that is the one I would use. Whittlesford Parkway and Royston are closer stations, and the 132 bus runs from Cambridge too.'),
    ('shuttleworth', 'Shuttleworth', 'Shuttleworth Air Shows', 'Old Warden, Bedfordshire', 'shuttleworthairshows',
     'Old Warden is a small village. On show days a shuttle bus runs from Biggleswade station, which I would suggest over the 74 bus, as that stops about 25 minutes’ walk away and doesn’t run on Sundays.'),
    ('gransden', 'Little Gransden', 'Little Gransden Air & Car Show', 'Little Gransden Airfield', 'little-gransden-air-and-car-show',
     'The airfield is out in the countryside. St Neots is the nearest station and the Whippet 18 runs on weekdays and Saturdays, so for a Sunday show I would think about a taxi from the station or sharing a lift.'),
    ('headcorn', 'Headcorn', 'Headcorn Airshow', 'Headcorn Aerodrome, Kent', 'headcorn-air-show',
     'Headcorn station is about a mile and a half from the aerodrome, with Southeastern trains from London and across Kent. I would think about how you will do that last stretch before you go, as it is a fair walk along country lanes.'),
    ('southport', 'Southport', 'Southport Air Show', 'Southport beach and pier', 'southport-air-show',
     'Merseyrail from Liverpool is the easy way in, about 10 minutes’ walk from the seafront. Lots of buses come in from Liverpool, Preston, Wigan and St Helens too.'),
    ('blackpool', 'Blackpool', 'Blackpool Air Show', 'Central Pier, Blackpool', 'blackpool-air-show',
     'Blackpool North is the station I would use, about 15 minutes from the Tower. The trams run along the front, and most buses finish in the town centre, between 5 and 15 minutes from Central Pier.'),
    ('ayr', 'Ayr', 'International Ayr Show', 'Low Green, Ayr', 'international-ayr-show',
     'The train to Ayr leaves you about 15 to 20 minutes’ walk from the Low Green. In 2026 there were park and ride shuttles too, and buses come in from Glasgow and round Ayrshire.'),
]
GROUP_ORDER = ['By train', 'By bus', 'By coach', 'Park and Ride']

def group_of(tid):
    if tid.startswith('rail') or tid == 'kemble': return 'By train'
    if tid in ('pr', 'chelt'): return 'Park and Ride'
    if tid == 'nx-coach': return 'By coach'
    if tid.startswith('bus') or tid in ('tram', 'shuttle', 'beachy-bus'): return 'By bus'
    return None

FAQ = [
    ['Do bus passes work on show days?', 'In England the free bus pass usually works after 09:30 on weekdays and all day at weekends and on bank holidays. Airshow shuttles and Park and Ride buses are often run separately, and some don’t take passes at all, so I would check the rules for your show before you rely on it. Scotland and Wales have their own pass rules.'],
    ['Can I take a camping chair on the bus?', 'Folding chairs are usually fine, but it’s down to the driver, and space goes quickly on show days. I would keep it folded and small, and leave the big cool box at home if you’re coming by bus.'],
    ['What if I miss the last bus or train?', 'This is the one I see catch people out. Take a screenshot of the last times before you leave home, and have a local taxi number saved. Each option above has the times for the way home where I have them.'],
    ['Are these the 2027 times?', 'Not yet. They are this winter’s timetables. Train and bus companies change their timetables twice a year, and the summer one is not the same as the winter one. Some services run at different times, and a few get added or taken away. When I last checked, the summer 2027 times had not been published. They usually come out in the spring, and I will update the pages then. Until then, please treat the times as a guide to how often things run, and check again with the company about a week before you go.'],
    ['Is there a train route page for my show?', 'Yes. Every show with a train option now has its own train route page, and you can open it from the Train route details button on the show page. The times on those pages are winter times too, so the same advice applies.'],
]

COL = {
    'Stagecoach': ('#1D4F91', '#F58025', '#FFFFFF'), 'Arriva': ('#00A5A3', '#003B5C', '#FFFFFF'),
    'First': ('#4B2E83', '#E6007E', '#FFFFFF'), 'Brighton and Hove': ('#C8102E', '#F3E8CF', '#FFFFFF'),
    'Blackpool Transport': ('#1A1A1A', '#FFD100', '#FFD100'), 'Central Connect': ('#00843D', '#7AC143', '#FFFFFF'),
    'A2B Bus and Coach': ('#1E5AA8', '#8CC63F', '#FFFFFF'), 'Cuckmere Buses': ('#2E6B30', '#F2E6B8', '#FFFFFF'),
    'Diamond Bus': ('#004B93', '#E30613', '#FFFFFF'), 'Grant Palmer': ('#0B3D91', '#FFC20E', '#FFFFFF'),
    'Vision Bus': ('#D71920', '#1A1A1A', '#FFFFFF'),
}
def col(op):
    for k, v in COL.items():
        if op.startswith(k): return v
    return ('#13293C', '#32B4AF', '#FFFFFF')

# ---- topics, straight from the show pages
topics = json.loads(subprocess.check_output(['node', os.path.join(HERE, 'extract.js'), ROOT]).decode())

# ---- bus route buttons per show (counts) and the town search list
brjs = open('bus-routes.js', encoding='utf8').read()
BR = json.loads(re.search(r'var MAP = (\{.*?\});\n', brjs, re.S).group(1))
SHOWNAME = {s[0]: s[1] for s in SHOWS}
find = []
for f in sorted(glob.glob('bus-routes/*.html')):
    rid = os.path.basename(f)[:-5]
    if rid == 'index': continue
    show = rid.split('-', 1)[1]
    if show not in SHOWNAME: continue
    h = open(f, encoding='utf8').read()
    g = lambda k: (re.search(r'"%s"\s*:\s*"((?:[^"\\]|\\.)*)"' % k, h) or [None, ''])[1]
    title = re.search(r'<title>([^<|]*)', h).group(1).strip()
    m = re.match(r'Bus \S+, (.+?) for the', title) or re.match(r'Bus \S+ (to .+?) for the', title)
    ft = m.group(1) if m else ''
    ft = ft[0].upper() + ft[1:] if ft else ''
    lead = g('lead')
    sm = re.search(r'closest stop is (.+?), about', lead) or re.search(r'get off at (.+?), which', lead)
    op = g('operator'); c = col(op)
    find.append(dict(id=rid, num=g('num'), ft=ft, op=op, stop=sm.group(1) if sm else '', show=SHOWNAME[show], c1=c[0], c2=c[1], ink=c[2]))

data = []
for k, name, full, place, slug, intro in SHOWS:
    page = open('camping-layout/%s.html' % k, encoding='utf8').read()
    tb = re.search(r"\(?t\.id==='([a-z-]+)'(?:\|\|t\.id==='[a-z-]+')*\)?\?'(<div class=\"tr-box\">.*?</a></div>)':''", page)
    train_page = ''
    if tb:
        train_page = re.search(r'ukairshowguide\.co\.uk/([a-z-]+)', tb.group(2)).group(1)
    items = []
    for t in topics.get(k, []):
        if not t.get('id'): continue
        g = group_of(t['id'])
        if not g: continue
        it = {x: t[x] for x in ('id', 'name', 'sub', 'title', 'text', 'place', 'route', 'areas', 'areasTitle', 'warn', 'arrive', 'walk', 'meta', 'off', 'opt') if t.get(x)}
        it['g'] = g
        if tb and t['id'] == tb.group(1):
            it['train'] = tb.group(2).replace("\\'", "'")
        items.append(it)
    items.sort(key=lambda t: GROUP_ORDER.index(t['g']))
    groups = []
    for gname in GROUP_ORDER:
        gi = [{'id': t['id']} for t in items if t['g'] == gname]
        if gi: groups.append({'name': gname, 'items': [t for t in items if t['g'] == gname]})
    buses = sorted({b[1] for lst in BR.get(k, {}).values() for b in lst})
    ops = sorted({b[3] for lst in BR.get(k, {}).values() for b in lst})
    station = ''
    for t in items:
        if t['g'] == 'By train':
            station = next((m[1] for m in t.get('meta', []) if m[0].lower() == 'station'), '') or (re.search(r'(?i)trains? to ([^,]+)', t['title']) or re.search(r'(?i)trains? to ([^,]+)', t['name']) or [None, t['name']])[1].strip()
            break
    facts = [['Showground', place, 'By road']]
    if station: facts.append(['Nearest station', station, 'By train'])
    facts.append(['Bus route pages', ('%d buses' % len(buses)) if buses else 'None for this show', 'By bus'])
    if ops: facts.append(['Bus companies', ', '.join(ops) if len(ops) < 3 else '%d companies' % len(ops), 'By bus'])
    facts.append(['Train route page', 'Yes, with live times' if train_page else 'Not yet', 'By train'])
    if any(t['g'] == 'Park and Ride' for t in items):
        pr = [t for t in items if t['g'] == 'Park and Ride'][0]
        facts.append(['Park and Ride', pr['sub'], 'Park and Ride'])
    data.append(dict(k=k, name=name, full=full, place=place, url=SITE + slug, intro=intro, trainPage=train_page,
                     count=len(items), items=items,
                     groups=groups, facts=facts[:5],
                     tag='Before you go',
                     status='<b>I would always check the last bus or train home before you set off.</b> Roads near the show can close on the day, so stops may move. Each option below says where I would get off, and the route pages show every stop.',
                     note='I have only listed trains, buses and coaches here. Driving, parking and taxis are on the full show guide.'))

# ---- page
LINE = ['#D74949', '#00A6E2', '#2BA84A', '#F2B233', '#6950A1', '#32B4AF', '#C2255C', '#1D4F91', '#E07A1F', '#0E5F5B', '#8A6D3B', '#13293C']
for i, s in enumerate(data): s['lc'] = LINE[i % len(LINE)]
SVG = lambda d: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' + d + '</svg>'
tpl = open(os.path.join(HERE, 'template.html'), encoding='utf8').read()
nb = len(find)
nt = sum(1 for s in data if s['trainPage'])
out = (tpl.replace('__SHOWS__', json.dumps(data, ensure_ascii=False).replace('</', '<\\/'))
          .replace('__FIND__', json.dumps(find, ensure_ascii=False))
          .replace('__FAQ__', json.dumps(FAQ, ensure_ascii=False))
          .replace('__NSHOW__', str(len(data))).replace('__NB__', str(nb)).replace('__NT__', str(nt))
          .replace('__ICON_PLAN__', SVG('<circle cx="6" cy="6" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="2.5" fill="#D74949"/><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/>'))
          .replace('__ICON_TICKET__', SVG('<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 5v14" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"/>'))
          .replace('__ICON_PIN__', SVG('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/>'))
          .replace('__IMG__', 'public-transport-img/seafront-crowd.webp'))
mf = re.search(r'<!-- mobile-fit.*?<!-- /mobile-fit -->', open('airshow-security.html', encoding='utf8').read(), re.S)
if mf: out = out.replace('</body>', mf.group(0) + '\n</body>')
open('public-transport.html', 'w', encoding='utf8').write(out)
print('shows', len(data), 'topics', sum(s['count'] for s in data), 'buses', nb, 'train pages', nt)

