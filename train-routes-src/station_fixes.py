"""Puts stations the scraped data places wrongly back where they belong.

Some station names belong to more than one place (Reedham is in Norfolk and
Surrey) and the geocoding picked the wrong one, and a few stations were left on
a stand in point in central London (51.5, -0.1). For each use of these stations
in a journey, the place nearest the stops either side of it is picked. When one
page uses both places of a name, the second gets its own stop. Line shapes that
do not end near the right place are dropped, so the map draws that stretch
straight instead of across the country.

Used by build.py (every train page built from train-routes-src) and by
train-map-src/build.py. fix(data) changes the data in place and returns a list
of what it changed.
"""
import math

PLACES = {
    'Reedham': [(52.5643, 1.5597), (51.3311, -0.1234)],
    'Brampton': [(52.3953, 1.5434), (54.9322, -2.7039)],
    'Whitchurch': [(51.2378, -1.3377), (52.9684, -2.6717), (51.5205, -3.2235)],
    'Bramley': [(51.3300, -1.0608), (53.8053, -1.6371)],
    'Millbrook': [(52.0542, -0.5324), (50.9114, -1.4338)],
    'Swinton': [(53.5147, -2.3361), (53.4870, -1.3080)],
    'Radcliffe-on-Trent': [(52.9473, -1.0379)],
    'James St': [(53.4048, -2.9918)],
    'Moreton in Marsh': [(51.9922, -1.7004)],
    'Newton Le Willows': [(53.4532, -2.6204)],
}


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def trips(o):
    if isinstance(o, dict):
        if 's' in o and isinstance(o.get('s'), list) and 'changes' in o:
            yield o
        else:
            for v in o.values():
                yield from trips(v)
    elif isinstance(o, list):
        for v in o:
            yield from trips(v)


def fix(d):
    stops = d['stops']
    names = [s[0] for s in stops]
    bad = {i for i, n in enumerate(names) if n in PLACES}
    if not bad:
        return []
    done = []
    place_idx = {}  # (name, place number) -> stop index

    def pick(name, nb):
        cands = PLACES[name]
        if not nb:
            return 0
        return min(range(len(cands)), key=lambda c: sum(km(cands[c], x) for x in nb))

    # which place each journey use means
    uses = []
    for t in trips(d):
        s = t['s']
        for j, x in enumerate(s):
            if x[1] in bad:
                nb = [(stops[s[q][1]][1], stops[s[q][1]][2]) for q in (j - 1, j + 1)
                      if 0 <= q < len(s) and s[q][1] not in bad]
                uses.append((x, pick(names[x[1]], nb)))
    # the stop keeps the place most of its uses mean; other places get new stops
    count = {}
    for x, c in uses:
        count.setdefault(x[1], {}).setdefault(c, 0)
        count[x[1]][c] += 1
    for i in bad:
        nm = names[i]
        c = max(count.get(i, {0: 1}).items(), key=lambda kv: kv[1])[0]
        ll = PLACES[nm][c]
        if km(ll, (stops[i][1], stops[i][2])) > 1:
            done.append('%s moved to %.4f, %.4f' % (nm, ll[0], ll[1]))
        stops[i][1], stops[i][2] = ll
        place_idx[(nm, c)] = i
    for x, c in uses:
        nm = names[x[1]] if x[1] < len(names) else stops[x[1]][0]
        if (nm, c) not in place_idx:
            ll = PLACES[nm][c]
            place_idx[(nm, c)] = len(stops)
            stops.append([nm, ll[0], ll[1], stops[x[1]][3]])
            done.append('%s added at %.4f, %.4f' % (nm, ll[0], ll[1]))
        x[1] = place_idx[(nm, c)]
    # drop line shapes that do not reach the right place
    for k in list(d['seg']):
        a, b = map(int, k.split('|'))
        if a not in bad and b not in bad:
            continue
        g = d['seg'][k]
        if not g or km(g[0], stops[a][1:3]) > 3 or km(g[-1], stops[b][1:3]) > 3:
            del d['seg'][k]
            done.append('line shape %s to %s dropped' % (stops[a][0], stops[b][0]))
    return done
