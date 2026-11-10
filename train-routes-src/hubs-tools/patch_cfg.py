"""After build_hubs.py: brings a show's cfg in step with its new UK stations (station codes for live times, train company colours,
codes and websites, the ways across London, the station count and the timetable note). Blackpool was done this way by hand.
Run: python3 patch_cfg.py show [show ...]"""
import json, os, sys, glob, re
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
sys.argv, shows = ['x'], sys.argv[1:]
from build_hubs import HUBN, WAYS
SH = json.load(open('shows.json'))
cfgs = {os.path.basename(f)[:-9]: json.load(open(f)) for f in glob.glob('../*-cfg.json')}
BP = cfgs['blackpool']
COLORS, SITES = {}, {}
for c in cfgs.values():
    COLORS.update({k: v for k, v in c.get('opColors', {}).items() if k not in COLORS})
    SITES.update({k: v for k, v in c['x'].get('opSites', {}).items() if k not in SITES})
COLORS.setdefault('Grand Central Railway', {'op1': '#E8731C', 'navy': '#1B1B1D', 'onui': '#F7B98A', 'opink': '#FFFFFF', 'opd': '#A85212', 'tint': '#FDF3EC', 'tintln': '#F5CDB0'})
COLORS.setdefault('Hull Trains', {'op1': '#1F4E9C', 'navy': '#0E2348', 'onui': '#9FB9E6', 'opink': '#FFFFFF', 'opd': '#163A74', 'tint': '#EEF2F9', 'tintln': '#C3D1EA'})
CODES = ['NT', 'VT', 'TP', 'LD', 'SR', 'GR', 'CC', 'XC', 'GW', 'EM', 'SW', 'SN', 'TL', 'CH', 'LM', 'GC', 'HT', 'AW', 'LE', 'GN', 'GX', 'SE', 'ME', 'XR', 'LO']
BPW = {(w[0], w[1]): w for w in BP['x'].get('walkPairs', []) if len(w) > 2}
WORDS = 'Zero One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen'.split()
TENS = {2: 'Twenty', 3: 'Thirty', 4: 'Forty', 5: 'Fifty', 6: 'Sixty', 7: 'Seventy', 8: 'Eighty', 9: 'Ninety'}
def word(n): return WORDS[n] if n < 20 else TENS[n // 10] + ('' if n % 10 == 0 else ' ' + WORDS[n % 10].lower())
DAYN = {'mon': 'Monday', 'tue': 'Tuesday', 'wed': 'Wednesday', 'thu': 'Thursday', 'fri': 'Friday', 'sat': 'Saturday', 'sun': 'Sunday'}
def when(days):
    by = {}
    for k, d in days.items(): by.setdefault(d, []).append(k)
    parts = []
    for d in sorted(by):
        day = int(d[8:]); parts.append(DAYN[by[d][-1]] + ' ' + str(day))
    return (', '.join(parts[:-1]) + ' and ' + parts[-1] if len(parts) > 1 else parts[0]) + ' November 2026'
ways = json.load(open('ways_used.json')) if os.path.exists('ways_used.json') else {}
for show in shows:
    f = f'../{show}-cfg.json'; c = json.load(open(f)); x = c['x']
    D = json.load(open(f'../{show}-data.json'))
    names = [h['name'] for h in D['hubs']]; uk = [h for h in D['hubs'] if h.get('group') == 'uk']
    for code, name, _ in HUBN:
        if name in names: x.setdefault('crs', {})[name] = code
    ops = set()
    for h in uk:
        for d in h['dirs']:
            for t in d['trips']: ops.update(o for o in t.get('ops', []) if o)
    for o in sorted(ops):
        if o not in c.setdefault('opColors', {}) and o in COLORS: c['opColors'][o] = COLORS[o]
        if o not in x.setdefault('opSites', {}) and o in SITES: x['opSites'][o] = SITES[o]
    x['opCodes'] = x.get('opCodes', []) + [k for k in CODES if k not in x.get('opCodes', [])]
    wp = x.setdefault('walkPairs', []); have = {(w[0], w[1]) for w in wp}
    for a, b in ways.get(show, []):
        for p, q in ((a, b), (b, a)):
            if (p, q) in have: continue
            if (p, q) in BPW: wp.append(BPW[(p, q)])
            else:
                w = WAYS.get((p, q)) or WAYS.get((q, p)); txt = (WAYS[(p, q)][1] if (p, q) in WAYS else (w[2] if len(w) > 2 else w[1]))
                wp.append([p, q, w[0], txt, 'About 20 minutes' if w[0] == 'Underground' else 'About 10 minutes'])
            have.add((p, q))
    n = len(D['hubs'])
    for row in c.get('facts', []):
        if row[0] == 'Stations covered': row[1] = f'{n} stations across the UK'
    dest = x.get('destShort') or c.get('to')
    x['hubSub'] = f'{word(n)} stations with a good way into {dest}, from {names[0]} to the big stations and city termini across the UK, with any changes on the way. Pick the one you’re starting from, or heading home to.'
    add = f' The big stations and city termini further from {dest} use the times for {when(SH[show]["days"])}, checked on 10 November 2026.'
    if 'city termini further from' not in c['note']:
        c['note'] = re.sub(r'(checked on [^.]*\.)', r'\1' + add.replace('\\', r'\\'), c['note'], count=1) if 'checked on' in c['note'] else c['note'] + add
    c['note'] = re.sub(r'only shows journeys from [a-z ]+? (main )?stations( and [a-z ]+)? to ', 'only shows journeys from the main stations and city termini around the UK to ', c['note'], count=1)
    miss = sorted(o for o in ops if o not in c['opColors'])
    if miss: print('   no colours for', miss)
    json.dump(c, open(f, 'w'), ensure_ascii=False, indent=1)
    print(show, n, 'stations;', len(uk), 'new; ops', sorted(ops))
