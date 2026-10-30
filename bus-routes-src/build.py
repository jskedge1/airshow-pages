"""Build bus route pages from raw/<id>.json into out/<id>.html, plus routes-index.json."""
import json, math, os, re, statistics, glob

os.makedirs('out', exist_ok=True)
TPL = open('template.html').read()
OPS = json.load(open('operators.json'))
ENDS = json.load(open('ends.json'))
DAYNAME = {'thu': 'Thursday', 'fri': 'Friday', 'sat': 'Saturday', 'sun': 'Sunday'}
SITE = 'https://www.ukairshowguide.co.uk/'
# bus company colours: [main, second, text on main]. Colours only, no logos.
OPCOL = {
 'Stagecoach': ['#1D4F91', '#F58025', '#FFFFFF', '#E31B23'],
 'Arriva': ['#00A5A3', '#003B5C', '#FFFFFF', '#00A5A3'],
 'First': ['#4B2E83', '#E6007E', '#FFFFFF', '#E6007E'],
 'Brighton and Hove': ['#C8102E', '#F3E8CF', '#FFFFFF', '#1A1A1A'],
 'Blackpool Transport': ['#1A1A1A', '#FFD100', '#FFD100', '#FFD100'],
 'Central Connect': ['#00843D', '#7AC143', '#FFFFFF', '#00843D'],
 'A2B Bus and Coach': ['#1E5AA8', '#8CC63F', '#FFFFFF', '#1E5AA8'],
 'Cuckmere Buses': ['#2E6B30', '#F2E6B8', '#FFFFFF', '#2E6B30'],
 'Diamond Bus': ['#004B93', '#E30613', '#FFFFFF', '#E30613'],
 'Grant Palmer': ['#0B3D91', '#FFC20E', '#FFFFFF', '#FFC20E'],
 'Vision Bus': ['#D71920', '#1A1A1A', '#FFFFFF', '#D71920'],
}
def opcol(name):
    for k, v in OPCOL.items():
        if name.startswith(k): return v
    return ['#13293C', '#F2B233', '#FFFFFF', '#F2B233']


def vias(seq, locs, exclude, n=6, keep=()):
    """Main towns a direction passes, in order, for the destination blind."""
    count = {}
    for a in seq:
        t = locs.get(a, '')
        if t: count[t] = count.get(t, 0) + 1
    ex = [w.lower() for x in exclude for w in x.replace(',', ' ').split() if len(w) >= 3]
    order = []
    for a in seq:
        t = locs.get(a, '')
        if t and t not in order and not any(w in t.lower() for w in ex) and not re.search(r'promenade|interchange|bus station|station', t, re.I): order.append(t)
    top = sorted(order, key=lambda t: -count[t])[:n]
    for k in keep:
        hit = next((t for t in order if k.lower() in t.lower() or t.lower() in k.lower()), None)
        if hit and hit not in top: top = top[:n - 1] + [hit]
    return [t for t in order if t in top]


def blindlines(towns):
    if not towns: return []
    out, i = [], 0
    while i < len(towns):
        pair = towns[i:i + 2]
        out.append('via ' + ' and '.join(pair) if len(pair) == 2 else 'via ' + pair[0])
        i += 2
    return out

SHOWS = {
 'ayr': dict(name='International Ayr Show', slug='international-ayr-show', target=[55.45787, -4.64049], label='Low Green', town='Ayr',
   tip='Roads along the seafront close on show days, so I would get off in the town centre and walk down to the Low Green. Buses get busy after the flying, so you could leave a little early or grab some food in town first.'),
 'blackpool': dict(name='Blackpool Air Show', slug='blackpool-air-show', target=[53.81005, -3.05572], label='Central Pier', town='Blackpool',
   tip='Buses are moved away from the promenade on show days, so I would get off in the town centre and walk down to the front. Allow extra time to get home, as everyone leaves at once.'),
 'clacton': dict(name='Clacton Air Show', slug='clactonairshow', target=[51.7848, 1.1480], label='West Greensward', town='Clacton',
   tip='Roads around the seafront close for the show, so I would check where your stop is on the day. Leave plenty of time for the journey home, as buses fill up straight after the flying.'),
 'cosford': dict(name='RAF Cosford Air Show', slug='cosfordairshow', target=[52.6395, -2.31012], label='RAF Cosford', town='Cosford',
   tip='The show is on a Sunday, so this bus won’t help on the day. I would take the train to Cosford station instead, which is right by the showground.'),
 'duxford': dict(name='Duxford Air Shows', slug='duxfordairshows', target=[52.0965, 0.1350], label='IWM Duxford', town='IWM Duxford',
   tip='Local buses are few and far between, so I would check the times before you travel and plan how you’re getting home.'),
 'eastbourne': dict(name='Eastbourne Airshow', slug='eastbourneairshow', target=[50.76006, 0.284433], label='Western Lawns', town='Eastbourne',
   tip='The seafront roads close during the show and buses are diverted, so I would check where your stop is before you set off. Buses back fill up quickly after the flying.'),
 'gransden': dict(name='Little Gransden Air and Car Show', slug='little-gransden-air-and-car-show', target=[52.18031, -0.11265], label='The airfield', town='Gransden',
   tip='There’s no Sunday bus and none stops at the airfield, so on show day I would take a taxi from St Neots station instead.'),
 'headcorn': dict(name='Headcorn Airshow', slug='headcorn-air-show', target=[51.15559, 0.635093], label='Headcorn Aerodrome', town='Headcorn',
   tip='The Aerodrome stop is on the A274, a short walk from the entrance. I would check the times before you go, as the buses are roughly hourly.'),
 'midlands': dict(name='Midlands Air Festival', slug='midlandsairfestival', target=[52.19803, -1.89610], label='Ragley Hall', town='Ragley',
   tip='The 247 stops by the Ragley Hall main entrance, which makes it handy. I would check the last bus back before the evening displays start.'),
 'riat': dict(name='Royal International Air Tattoo', slug='riat', target=[51.68514, -1.78647], label='RAF Fairford', town='Fairford',
   tip='These local buses don’t run on Sundays and don’t reach the show entrances, so on show days I would use the Swindon Shuttle or a Park and Ride instead.'),
 'shuttleworth': dict(name='Shuttleworth Air Shows', slug='shuttleworthairshows', target=[52.08544, -0.31984], label='Old Warden Aerodrome', town='Old Warden',
   tip='There’s no bus to the aerodrome itself, and the nearest stops are a fair walk away. I would use the shuttle bus from Biggleswade station instead if you can.'),
 'southport': dict(name='Southport Air Show', slug='southport-air-show', target=[53.65326, -3.01540], label='Southport Pier', town='Southport',
   tip='The town centre stops on Lord Street are the closest. From there it’s a walk through town to the Promenade and Marine Drive. Buses fill up after the flying, so allow extra time.'),
}

OVERRIDE = {
 'x77-ayr': dict(dirvia={'Ayr': ['via Newton Mearns', 'via Prestwick Airport', 'via Prestwick'], 'Glasgow': ['via Prestwick', 'via Prestwick Airport', 'via Newton Mearns']}),
 '132-duxford': dict(
   title='Bus 132 to IWM Duxford',
   dirvia={'Saffron Walden': ['via Addenbrooke’s and Trumpington', 'via IWM Duxford', 'via Ickleton and Great Chesterford'], 'Cambridge': ['via Great Chesterford and Ickleton', 'via IWM Duxford', 'via Trumpington and Addenbrooke’s']},
   lead='This is the bus I would look at if you’re heading to Duxford on a Sunday without a car. It picks up in Cambridge city centre and outside the railway station, then drops you right by Hangar 1.',
   offTag='Get off here for the museum',
   alt=['On Air Show weekends', 'IWM usually runs its own free shuttle from Cambridge station and Trumpington Park and Ride. That is the easier choice on a big show day, so I would suggest using that instead.'],
   legs=[[['A1307'], 'Cambridge city centre', 'Out of Drummer Street bus station, down Regent Street and Hills Road, stopping right outside the railway station.'],
         [['A1134'], 'Addenbrooke’s', 'Along Long Road to the hospital bus station, then Robinson Way and through Trumpington.'],
         [['A1309'], 'Trumpington Park and Ride', 'Hauxton Road to the Park and Ride. Handy if you’d rather leave the car here.'],
         [['M11', 'A505'], 'Down to Duxford', 'South on the M11 to junction 10, then the A505 to the museum stop by Hangar 1.'],
         [['B1383'], 'On to Saffron Walden', 'After the museum it carries on through Duxford, Ickleton and Great Chesterford to Saffron Walden.']]),
}


def hav(a, b):
    R = 6371000
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    x = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(x))


def clean(n):
    n = re.sub(r'\s+[a-z]$', '', n.strip())
    n = re.sub(r'\s*\((?:[NSEW]{1,2}-?bound|[NSEW]{1,2})\)', '', n, flags=re.I)
    n = re.sub(r'\s*\((at|near|opp|adj|o/s|on|before|after|in|by|corner|outside)\)', '', n, flags=re.I)
    n = re.sub(r'\b(opp|adj|o/s|nr)\.?\s+', '', n, flags=re.I)
    n = n.replace(' - ', ', ').replace('–', ',').replace('—', ',').replace(' -', ',').replace('- ', ', ')
    return re.sub(r'\s{2,}', ' ', n).strip(' ,')


def short(n):
    n = clean(n)
    n = re.sub(r'\s*\((Stand|Stop|Bay|Stance)[^)]*\)', '', n, flags=re.I)
    return n if len(n) <= 30 else n[:29].rsplit(' ', 1)[0]


def mins(t):
    h, m = t.split(':')
    return int(h) * 60 + int(m)


def ends(head):
    h = head.replace('–', '-')
    parts = re.split(r'\s+to\s+|\s*-\s*', h, maxsplit=1)
    return (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else (h, '')


def andlist(xs):
    xs = [x for x in xs if x]
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1] if xs else ''


def walkfact(m):
    if m < 250: return 'Right by the show'
    if m <= 3000:
        return f'About {max(2, round(m * 1.3 / 80 / 5) * 5 if m * 1.3 / 80 > 7 else round(m * 1.3 / 80))} minutes'
    return f'About {round(m * 1.3 / 1609)} miles'


def pick(trips, offi, mode):
    def ot(t): return mins(t[offi[id(t)]][0])
    if mode == 'arrive': lo, hi = 8 * 60, 13 * 60 + 30
    elif mode == 'leave': lo, hi = 13 * 60 + 30, 21 * 60
    else: lo, hi = 7 * 60, 21 * 60
    sel = sorted([t for t in trips if lo <= ot(t) <= hi] or trips, key=ot)
    sampled = False
    if len(sel) > 10:
        step = (len(sel) - 1) / 9
        sel = [sel[round(i * step)] for i in range(10)]
        sampled = True
    return sel, sampled


def build(fn):
    raw = json.load(open(fn))
    locs = json.load(open(fn[:-5] + '.loc.json')) if os.path.exists(fn[:-5] + '.loc.json') else {}
    r = raw['route']; rid = r['id']; show = SHOWS[r['show']]; ov = OVERRIDE.get(rid, {})
    loc = raw['loc']; target = show['target']
    lines = raw['lines']
    if not lines: return None, 'no timetable'
    # off stop: nearest stop to the show on direction 0's line (any stop seen)
    cover, total = {}, 0
    for v in raw['days'].values():
        for d in v:
            for t in d['trips']:
                total += 1
                for a in {s[1] for s in t}: cover[a] = cover.get(a, 0) + 1
    allstops = {a for a in cover if a in loc}
    near = sorted(allstops, key=lambda a: hav(loc[a], target))
    pool = [a for a in near if hav(loc[a], target) <= hav(loc[near[0]], target) + 900]
    best = max(cover[a] for a in pool)
    off = next(a for a in pool if cover[a] >= .75 * best)
    poolset = set(a for a in pool if hav(loc[a], target) <= max(1200, hav(loc[off], target) + 400))
    offd = hav(loc[off], target)
    names = {}
    for v in raw['days'].values():
        for d in v:
            for t in d['trips']:
                for s in t: names[s[1]] = clean(s[2])
    offname = names.get(off, '')
    days = []; served = []; heads = []; headways = []; usedoff = {}
    for dk in r['days']:
        dirs = []
        for di, d in enumerate(raw['days'].get(dk, [])):
            if di >= len(lines): continue
            trips = [t for t in d['trips'] if any(s[1] in poolset for s in t)]
            heads.append(d['head'])
            offi = {id(t): min((i for i, s in enumerate(t) if s[1] in poolset), key=lambda i: (t[i][1] != off, hav(loc[t[i][1]], target))) for t in trips}
            if not trips:
                dirs.append(dict(label=dlabel(d, rid), li=di, trips=[], tt=fulltable(d, lines[di]['stops'], names, off)))
                continue
            fr = statistics.median(offi[id(t)] / max(1, len(t) - 1) for t in trips)
            mode = 'arrive' if fr >= .6 else 'leave' if fr <= .4 else 'both'
            ts = sorted(mins(t[offi[id(t)]][0]) for t in trips)
            day_ts = [x for x in ts if 9 * 60 <= x <= 17 * 60]
            if len(day_ts) >= 3: headways.append(statistics.median(b - a for a, b in zip(day_ts, day_ts[1:])))
            elif len(ts) >= 2: headways.append(statistics.median(b - a for a, b in zip(ts, ts[1:])))
            sel, sampled = pick(trips, offi, mode)
            seq = lines[di]['stops']
            out = []
            for t in sel:
                oi = offi[id(t)]
                usedoff[t[oi][1]] = usedoff.get(t[oi][1], 0) + 1
                stops = []
                keyix = [i for i, s in enumerate(t) if not s[3]]
                lab = set([0, len(t) - 1, oi])
                inner = [i for i in keyix if i not in lab]
                for k in range(1, 4):
                    if inner: lab.add(inner[min(len(inner) - 1, round(k * len(inner) / 4))])
                for i, s in enumerate(t):
                    if s[1] not in loc: continue
                    f = (1 if not s[3] else 0) | (2 if i == oi else 0) | (4 if i in lab else 0)
                    stops.append([s[0], names[s[1]], round(loc[s[1]][0], 5), round(loc[s[1]][1], 5), f, short(s[2])])
                first, last = t[0], t[-1]
                if mode == 'arrive':
                    big, small = first[0], f'At {short(t[oi][2])} {t[oi][0]}'
                    title = f'The {first[0]} from {short(first[2])}'
                elif mode == 'leave':
                    big, small = t[oi][0], f'From {short(t[oi][2])}, at {short(last[2])} {last[0]}'
                    title = f'The {t[oi][0]} from {short(t[oi][2])}'
                else:
                    big, small = t[oi][0], f'At {short(t[oi][2])}, from {short(first[2])} {first[0]}'
                    title = f'The {first[0]} from {short(first[2])}'
                out.append(dict(big=big, small=small, title=title, s=stops))
            note = ''
            if sampled:
                hw = statistics.median(b - a for a, b in zip(ts, ts[1:])) if len(ts) > 2 else 0
                note = f'Buses run about every {int(round(hw / 5) * 5) or hw} minutes, so these are a few of them spread through the {"morning" if mode == "arrive" else "afternoon and evening" if mode == "leave" else "day"}.'
            dirs.append(dict(label=dlabel(d, rid), li=di, trips=out, note=note, fr=fr, tt=fulltable(d, lines[di]['stops'], names, off)))
        dirs.sort(key=lambda x: -x.get('fr', -1))
        for x in dirs: x['fr0'] = x.pop('fr', -1)
        has = any(x['trips'] for x in dirs)
        if has: served.append(dk)
        if not dirs:
            dirs = []
        days.append(dict(key=dk, label=DAYNAME[dk], dirs=dirs,
                         none=f'In the current timetable there are no {r["num"]} buses on {DAYNAME[dk]}s, so I would look at the other ways to get there on the {show["name"]} page.'))
    if not served: return None, 'no buses on show days'
    if usedoff:
        off = max(usedoff, key=usedoff.get); offd = hav(loc[off], target); offname = names.get(off, offname)
    # a, b from first heading
    a, b = ENDS[rid]; A, B = a, b
    # facts
    if len(served) == len(r['days']): runs = andlist([DAYNAME[d] + 's' for d in served])
    else: runs = andlist([DAYNAME[d] + 's' for d in served]) + ' only'
    hw = min(headways) if headways else None
    ntr = max(len(x['trips']) for dd in days for x in dd['dirs']) if days else 0
    if hw is None or hw > 150: often = 'A few buses a day'
    elif hw >= 100: often = 'About every 2 hours'
    elif hw >= 50: often = 'About hourly'
    else: often = f'About every {max(5, int(round(hw / 5) * 5))} minutes'
    facts = [['Runs on', runs], ['How often', often], ['Get off at', short(offname), 'hl'], ['Then walk', walkfact(offd)]]
    if offd > 3000: facts[3] = ['To the show', walkfact(offd)]
    # legs from road steps, direction 0
    legs = ov.get('legs') or makelegs(lines[0], names, off)
    towns = [x for x in dict.fromkeys(short(names[s]).split(',')[0] for s in lines[0]['stops'][1:-1] if s in names)]
    via = []
    for leg in legs[:-1]:
        via.append('via ' + leg[1].split(' to ')[-1])
    bad = [w.lower() for x in (a, b, show['town']) for w in x.split() if len(w) >= 3]
    via = [re.sub(r'\s*\(.*?\)', '', v) for v in dict.fromkeys(via)]
    via = [v for v in via if len(v) < 28 and not any(w in v.lower() for w in bad)][:3] or ['from ' + a]
    walkp = 'which is right by' if offd < 250 else f'about {walkfact(offd).split("About ")[-1]} from' if offd <= 3000 else f'about {round(offd * 1.3 / 1609)} miles from'
    lead = ov.get('lead') or ((f'The {r["num"]} runs between {a} and {b}. For the {show["name"]}, the closest stop is {offname}, {walkp} {show["label"]}.' if offd >= 250 else f'The {r["num"]} runs between {a} and {b}. For the {show["name"]}, I would get off at {offname}, which is right by the show.')
                              + (' That’s a long way to walk, so I would add a taxi for the last part.' if offd > 3000 else ''))
    lead += ' Pick a day and a time below and the map shows every stop.'
    tip = show['tip']
    missing = [DAYNAME[d] + 's' for d in r['days'] if d not in served]
    if missing and r['show'] not in ('cosford', 'gransden', 'riat'):
        tip = f'In the current timetable the {r["num"]} doesn’t run on {andlist(missing)}. ' + tip
    cfg = dict(num=r['num'], operator=OPS.get(rid, ''), showName=show['name'], showUrl=SITE + show['slug'],
               title=ov.get('title') or f'Bus {r["num"]}, {a} to {b}',
               blindDest=(show['town'] if offd <= 3000 else b or show['town']), blindVia=ov.get('blindVia') or via,
               lead=lead, facts=facts, legs=legs, tipHead='Before you travel', tip=tip,
               tipBtn=f'Back to getting to {show["town"]}', alt=ov.get('alt'), theme=opcol(OPS.get(rid, '')),
               walkLine=('You’re right by the show when you get off.' if offd < 250 else
                         f'From here it’s {walkfact(offd).lower()} on foot to {show["label"]}.' if offd <= 3000 else
                         f'It’s about {round(offd * 1.3 / 1609)} miles from here to {show["label"]}, so I would book a taxi for that last part.'),
               walkBack=('The stop is right by the show, so there’s no long walk back.' if offd < 250 else
                         f'Allow {walkfact(offd).lower()} to walk back here from {show["label"]}, and a bit more when the crowds leave.' if offd <= 3000 else
                         f'It’s about {round(offd * 1.3 / 1609)} miles back to this stop from {show["label"]}, so book your taxi before the day.'),
               target=target, targetLabel=show['label'], offTag=ov.get('offTag', 'Closest stop to the show'),
               note=f'Stops and times are from {OPS.get(rid, "the bus company")}’s timetable on the DfT <a href="https://data.bus-data.dft.gov.uk/" target="_blank" rel="noopener">Bus Open Data Service</a>, through <a href="https://bustimes.org/" target="_blank" rel="noopener">bustimes.org</a>, checked on 30 October 2026. Times for summer 2027 usually come out in the spring, so please check with {OPS.get(rid, "the operator")} before you travel. The line is drawn along the roads between the stops, so treat it as a guide. Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors.')
    stab, sidx = [], {}
    for dd in days:
        for x in dd['dirs']:
            for t in x['trips']:
                packed = []
                for p in t['s']:
                    k = (p[1], p[2], p[3], p[5])
                    if k not in sidx: sidx[k] = len(stab); stab.append(list(k))
                    packed.append([p[0], sidx[k], p[4]])
                t['s'] = packed
    # each direction's destination blind: towards the show keeps the show town, the other way shows where it goes
    for dd in days:
        for x in dd['dirs']:
            dest = x['label'][3:]
            seq = lines[x['li']]['stops']
            toshow = x.get('fr0', 0) >= .5 and dest.split()[0].lower() in cfg['blindDest'].lower()
            showtown = show['town'].replace('IWM ', '')
            towns = vias(seq, locs, [dest, A, B] + ([cfg['blindDest']] if toshow else []), keep=() if toshow else (showtown,))
            x['blind'] = None if toshow else dest
            x['via'] = (ov.get('dirvia') or {}).get(dest) or blindlines(towns[:6]) or ['from ' + (A if dest != A else B)]
            x.pop('fr0', None)
    data = dict(stops=stab, lines=[thin(L['line']) for L in lines], days=days, start=next(i for i, d in enumerate(days) if d['key'] in served))
    html = TPL.replace('/*DATA*/', 'var CFG=' + json.dumps(cfg, ensure_ascii=False) + ';\nvar DATA=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';')
    html = re.sub(r'<title>.*?</title>', f'<title>{cfg["title"]} | The Big Guide to UK Airshows</title>', html, count=1)
    open(f'out/{rid}.html', 'w').write(html)
    return dict(id=rid, show=r['show'], num=r['num'], title=cfg['title'], off=offname, offd=round(offd), served=served, days=r['days']), 'ok'


def thin(line, tol=0.00004):
    # drop points that sit on a straight run (Douglas Peucker style, iterative)
    if len(line) < 3: return line
    keep = [False] * len(line); keep[0] = keep[-1] = True
    stack = [(0, len(line) - 1)]
    while stack:
        a, b = stack.pop()
        (y1, x1), (y2, x2) = line[a], line[b]
        dx, dy = x2 - x1, y2 - y1; L2 = dx * dx + dy * dy or 1e-12
        best, bi = 0, None
        for i in range(a + 1, b):
            y, x = line[i]
            t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / L2))
            d = (x1 + t * dx - x) ** 2 + (y1 + t * dy - y) ** 2
            if d > best: best, bi = d, i
        if bi is not None and best > tol * tol:
            keep[bi] = True; stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(line, keep) if k]


def fulltable(d, seq, names, off):
    """Every journey that day at the timing points, like the timetable at a bus stop."""
    if not d['trips']: return None
    tp = {s[1] for t in d['trips'] for s in t if not s[3]}
    tp.add(off)
    # start from the journey with most main stops, then slot each other stop in after the stop before it
    seqs = [[x[1] for x in t if x[1] in tp] for t in d['trips']]
    seqs.sort(key=len, reverse=True)
    rows = []
    for q in seqs:
        for i, a in enumerate(q):
            if a in rows: continue
            prev = next((q[j] for j in range(i - 1, -1, -1) if q[j] in rows), None)
            nxt = next((q[j] for j in range(i + 1, len(q)) if q[j] in rows), None)
            if prev is not None: rows.insert(rows.index(prev) + 1, a)
            elif nxt is not None: rows.insert(rows.index(nxt), a)
            else: rows.append(a)
    if len(rows) > 14:
        must = {rows[0], rows[-1], off}
        rest = [a for a in rows if a not in must]
        pick = set(rest[round(i * (len(rest) - 1) / 10)] for i in range(11)) if rest else set()
        rows = [a for a in rows if a in must or a in pick]
    cols = []
    for t in sorted(d['trips'], key=lambda t: mins(t[0][0])):
        m = {}
        for s in t: m[s[1]] = s[0]
        col = [m.get(a, '') for a in rows]
        if sum(1 for c in col if c) >= 2: cols.append(col)
    if not cols: return None
    keep = [i for i in range(len(rows)) if any(c[i] for c in cols)]
    rows = [rows[i] for i in keep]; cols = [[c[i] for i in keep] for c in cols]
    labels = [short(names.get(a, a)) for a in rows]
    offi = rows.index(off) if off in rows else -1
    i = 1
    while i < len(labels):
        if labels[i] == labels[i - 1]:
            for c in cols:
                c[i - 1] = c[i - 1] or c[i]; del c[i]
            if offi == i: offi = i - 1
            elif offi > i: offi -= 1
            del labels[i]
        else: i += 1
    return dict(rows=labels, off=offi, cols=cols)


def dlabel(d, rid):
    A, B = ENDS[rid]
    lasts = [t[-1][2] for t in d['trips']]
    firsts = [t[0][2] for t in d['trips']]
    def hits(names, place): return sum(place.split()[0].lower() in n.lower() for n in names)
    if hits(lasts, B) >= hits(lasts, A) and hits(lasts, B) > 0: return 'To ' + B
    if hits(lasts, A) > 0: return 'To ' + A
    return 'To ' + (A if hits(firsts, B) >= hits(firsts, A) else B)


def makelegs(L, names, off):
    seq = [s for s in L['stops']]
    n = len(seq)
    if n < 2: return []
    oi = seq.index(off) if off in seq else n - 1
    cand = sorted(set([0, n - 1, oi] + [round(k * (n - 1) / 4) for k in range(1, 4)]))
    # drop milestones too close together
    ms = [cand[0]]
    for c in cand[1:]:
        if c - ms[-1] >= 2 or c in (oi, n - 1): ms.append(c)
    legs = []
    for x, y in zip(ms, ms[1:]):
        if y <= x: continue
        st = [s for s in L['steps'] if x <= s['leg'] < y]
        dist = sum(s['d'] for s in st)
        refs, nm = {}, {}
        for s in st:
            for rf in (s['ref'] or '').split(';'):
                rf = rf.strip()
                if re.fullmatch(r'[MAB]\d+[MA]?(\(M\))?', rf): refs[rf] = refs.get(rf, 0) + s['d']
            if s['name']: nm[s['name']] = nm.get(s['name'], 0) + s['d']
        r2 = [k for k, v in sorted(refs.items(), key=lambda kv: -kv[1]) if v > 500][:3]
        n2 = [k for k, v in sorted(nm.items(), key=lambda kv: -kv[1]) if v > 300][:3]
        A, B = short(names.get(seq[x], '')).split(',')[0], short(names.get(seq[y], '')).split(',')[0]
        miles = dist / 1609
        txt = (f'Mostly along {andlist(n2)}' if n2 else 'Through local streets') + (f', about {round(miles)} miles.' if miles >= 1.5 else ', under a couple of miles.' if miles >= .6 else ', a short hop.')
        legs.append([r2, f'{A} to {B}', txt])
    return legs


if __name__ == '__main__':
    idx, skipped = [], []
    for fn in sorted(f for f in glob.glob('raw/*.json') if not f.endswith('.loc.json')):
        try:
            res, msg = build(fn)
        except Exception as e:
            import traceback; traceback.print_exc()
            res, msg = None, 'ERROR ' + repr(e)[:120]
        if res: idx.append(res)
        else: skipped.append((os.path.basename(fn)[:-5], msg))
        print(os.path.basename(fn), msg)
    json.dump(dict(built=idx, skipped=skipped), open('index.json', 'w'), indent=1)
