#!/usr/bin/env python3
"""Poster 03, The UK Airshow Chart.

Writes posters/03-airshow-chart.html. Re-run with:  python3 -I build/gen_03.py

Shows, show types and colours, towns, motorways, railways and the projection are read
straight from the site's own map page (airshow-map.html). The coastline is the finer
1:10m cut of the same Natural Earth data the site map uses at 1:50m, kept in
build/data/chart_land.json (made by build/extract_chart_land.js).
Standard library only.
"""
import base64, json, math, os, random, re, struct, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
POSTERS = os.path.dirname(HERE)
SITE = os.path.dirname(POSTERS)
OUT = os.path.join(POSTERS, '03-airshow-chart.html')

# ------------------------------------------------------------------ site data
src = open(os.path.join(SITE, 'airshow-map.html'), encoding='utf-8').read()
lines = src.split('\n')


def js_obj(name):
    line = [l for l in lines if l.strip().startswith('var %s=' % name)][0].strip()
    return json.loads(re.search(r'var %s=(\{.*\});?\s*$' % name, line).group(1))


GEO = js_obj('GEO')
NET = js_obj('NET')
m = re.search(r'var K=Math\.cos\(([\d.]+)\*Math\.PI/180\),L0=(-?[\d.]+),T=([\d.]+),GW=([\d.]+)\*K,GH=([\d.]+);', src)
STD_PAR, S_L0, S_T, S_GW, S_GH = map(float, m.groups())
K = math.cos(math.radians(STD_PAR))
TYPES = {k: (n, c) for k, n, c in re.findall(r"(\w+):\['([^']*)','(#[0-9A-Fa-f]{6})'\]", re.search(r'var TYPES=\{(.*?)\};', src).group(1))}
feat_src = re.search(r'var FEAT=\[(.*?)\];\s*\n', src, re.S).group(1)
SHOWS = []
for nm, pl, la, lo, ty in re.findall(r"\['((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)',(-?[\d.]+),(-?[\d.]+),'(\w+)'\]", feat_src):
    SHOWS.append({'name': nm.replace("\\'", "’"), 'place': pl.replace("\\'", "’"), 'lat': float(la), 'lon': float(lo), 'type': ty})
assert len(SHOWS) == 30, len(SHOWS)
TOWNS = {t[0]: (t[1], t[2]) for t in GEO['towns']}
LAND = json.load(open(os.path.join(HERE, 'data', 'chart_land.json')))

# ------------------------------------------------------------------ geometry
CW, CH = 1240, 1754
FX0, FY0, FX1, FY1 = 70, 70, 1170, 1510          # neatline, outer
BAND = 11
MX0, MY0, MX1, MY1 = FX0 + BAND, FY0 + BAND, FX1 - BAND, FY1 - BAND
NORTH, SOUTH, WEST = 59.42, 49.0, -9.0
PY = (MY1 - MY0) / (NORTH - SOUTH)                # px per degree of latitude
PXL = PY * K                                      # px per degree of longitude
EAST = WEST + (MX1 - MX0) / PXL


def P(lon, lat):
    return (MX0 + (lon - WEST) * PXL, MY0 + (NORTH - lat) * PY)


def f(v):
    s = '%.1f' % v
    return s[:-2] if s.endswith('.0') else s


def ring_path(r):
    pts = [P(lo, la) for lo, la in r]
    return 'M' + 'L'.join('%s %s' % (f(x), f(y)) for x, y in pts) + 'Z'


def site_path(d):
    """A path in the site map's 400 x 645 space, redrawn in poster space."""
    out = []
    for cmd, x, y in re.findall(r'([ML])\s*(-?[\d.]+)[ ,]+(-?[\d.]+)', d):
        lon = float(x) / 400 * S_GW + S_L0
        lat = S_T - float(y) / 592 * S_GH
        X, Y = P(lon, lat)
        out.append('%s%s %s' % (cmd, f(X), f(Y)))
    return ''.join(out)


def mix(a, b, t):
    a = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return '#%02X%02X%02X' % tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


# rough advance widths (em) for the collision checks and label boxes
NARROW = {'I': .27, 'J': .40, 'L': .42, 'T': .45, 'F': .44, 'E': .46, ' ': .21, ',': .2, '.': .2, '1': .36, "'": .18, '’': .18}
WIDE = {'M': .66, 'W': .70, 'O': .52, 'Q': .52, 'G': .51, 'D': .51, 'N': .55, 'H': .55, 'U': .53}


def w_cond(s, size, ls=0.0, weight=700):
    em = sum(NARROW.get(ch, WIDE.get(ch, .49)) for ch in s.upper())
    return em * size * (1.03 if weight >= 800 else 1.0) + ls * len(s)


def w_text(s, size):
    return sum(.24 if ch in 'ijl.,’\' ' else .33 if ch in 'ftr' else .78 if ch in 'mwMW' else .62 if ch.isupper() else .50 for ch in s) * size


# ------------------------------------------------------------------ palette
NAVY, RED, TEAL, TEAL_D = '#13293C', '#D74949', '#32B4AF', '#0E7C78'
PAPER = '#F7F2E6'
LANDC = '#F4EBD6'
LAND_EDGE = '#DCCFAE'
CTX = '#EAE7DA'
SEA = '#CDE5E3'
SEA_HI = '#E4F2F0'
TYPE_INK = {'feat': '#D74949', 'mil': '#32B4AF', 'hist': '#B9A3EE', 'sea': '#00A6E2', 'gen': '#F2C14E'}
for k in TYPE_INK:
    assert TYPES[k][1].upper() == TYPE_INK[k].upper(), (k, TYPES[k])
TYPE_EDGE = {'feat': '#A32B2B', 'mil': TEAL_D, 'hist': '#6950A1', 'sea': '#00709A', 'gen': '#9A7410'}

svg = []
A = svg.append

# ------------------------------------------------------------------ defs
all_land = ''.join(ring_path(r) for k in ('uk', 'dep', 'ie', 'ctx') for r in LAND[k])
home_land = ''.join(ring_path(r) for k in ('uk', 'dep') for r in LAND[k])
ctx_land = ''.join(ring_path(r) for k in ('ie', 'ctx') for r in LAND[k])
A('<defs>')
A('<clipPath id="mapclip"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath>' % (MX0, MY0, MX1 - MX0, MY1 - MY0))
A('<path id="coast" d="%s"/>' % all_land)
A('<path id="home" d="%s"/>' % home_land)
A('<path id="ctx" d="%s"/>' % ctx_land)
A('<clipPath id="homeclip"><use href="#home"/></clipPath>')
A('<clipPath id="ctxclip"><use href="#ctx"/></clipPath>')
A('<filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3.2"/></filter>')
A('<filter id="pshadow" x="-10%" y="-5%" width="120%" height="112%"><feGaussianBlur in="SourceAlpha" stdDeviation="7"/><feOffset dy="5"/><feComponentTransfer><feFuncA type="linear" slope=".22"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>')
A('<radialGradient id="seag" cx="46%%" cy="52%%" r="75%%"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></radialGradient>' % (SEA, mix(SEA, '#9CCFCB', .55)))
A('</defs>')

# ------------------------------------------------------------------ paper
A('<rect width="%d" height="%d" fill="%s"/>' % (CW, CH, PAPER))

# ------------------------------------------------------------------ map
A('<g clip-path="url(#mapclip)">')
A('<rect x="%d" y="%d" width="%d" height="%d" fill="url(#seag)"/>' % (MX0, MY0, MX1 - MX0, MY1 - MY0))
# water lining: stacked strokes of the whole coastline, widest first
rings = [70, 57, 45, 34, 24.5, 16, 9, 4]
A('<g fill="none" stroke-linejoin="round" stroke-linecap="round">')
for i, wd in enumerate(rings):
    t = i / (len(rings) - 1)
    band = mix(SEA, SEA_HI, t ** 1.15)                 # shallower water is paler
    line = mix(band, TEAL_D, .16 + .30 * t)
    A('<use href="#coast" stroke="%s" stroke-width="%s"/>' % (line, f(wd)))
    A('<use href="#coast" stroke="%s" stroke-width="%s"/>' % (band, f(wd - 1.5)))
A('</g>')

# graticule
A('<g stroke="%s" stroke-opacity=".16" stroke-width=".6" fill="none">' % NAVY)
for lat in range(int(math.ceil(SOUTH)), int(NORTH) + 1):
    y = P(0, lat)[1]
    A('<path d="M%d %sH%d"/>' % (MX0, f(y), MX1))
for lon in range(int(math.ceil(WEST)), int(EAST) + 1):
    x = P(lon, 0)[0]
    A('<path d="M%s %dV%d"/>' % (f(x), MY0, MY1))
A('</g>')

# context land: Ireland and the near continent
A('<use href="#ctx" fill="%s"/>' % CTX)
A('<g clip-path="url(#ctxclip)"><use href="#ctx" fill="none" stroke="%s" stroke-width="12" filter="url(#soft)" opacity=".55"/></g>' % mix(CTX, '#B9C3BD', .8))
A('<use href="#ctx" fill="none" stroke="%s" stroke-width=".8" stroke-linejoin="round"/>' % mix(CTX, NAVY, .5))
# home land
A('<use href="#home" fill="%s"/>' % LANDC)
A('<g clip-path="url(#homeclip)"><use href="#home" fill="none" stroke="%s" stroke-width="15" filter="url(#soft)" opacity=".85"/></g>' % LAND_EDGE)
# graticule again, very faint, over the land
A('<g stroke="%s" stroke-opacity=".07" stroke-width=".6" fill="none" clip-path="url(#homeclip)">' % NAVY)
for lat in range(int(math.ceil(SOUTH)), int(NORTH) + 1):
    A('<path d="M%d %sH%d"/>' % (MX0, f(P(0, lat)[1]), MX1))
for lon in range(int(math.ceil(WEST)), int(EAST) + 1):
    A('<path d="M%s %dV%d"/>' % (f(P(lon, 0)[0]), MY0, MY1))
A('</g>')
# railways and motorways, as chart landmarks
A('<g fill="none" stroke-linejoin="round" stroke-linecap="round">')
A('<path d="%s" stroke="%s" stroke-width=".85" stroke-opacity=".42"/>' % (site_path(NET['rail']), '#5B6B76'))
A('<path d="%s" stroke="%s" stroke-width="2.3" stroke-dasharray=".7 5.2" stroke-opacity=".5" stroke-linecap="butt"/>' % (site_path(NET['rail']), '#5B6B76'))
A('<path d="%s" stroke="%s" stroke-width="2.6"/>' % (site_path(NET['mway']), LANDC))
A('<path d="%s" stroke="%s" stroke-width="1.25" stroke-opacity=".8"/>' % (site_path(NET['mway']), '#5E8FC2'))
A('</g>')
A('<use href="#home" fill="none" stroke="%s" stroke-width="1" stroke-linejoin="round"/>' % NAVY)

# ------------------------------------------------------------------ show positions
for s in SHOWS:
    s['x'], s['y'] = P(s['lon'], s['lat'])
order = ['mil', 'hist', 'sea', 'gen']
n = 0
for ty in order:
    for s in sorted([s for s in SHOWS if s['type'] == ty], key=lambda s: -s['lat']):
        n += 1
        s['num'] = n
FEATURED = sorted([s for s in SHOWS if s['type'] == 'feat'], key=lambda s: -s['lat'])
OTHERS = sorted([s for s in SHOWS if s['type'] != 'feat'], key=lambda s: s['num'])
assert len(FEATURED) == 13 and len(OTHERS) == 17

boxes = []        # (x0, y0, x1, y1, what) used for collision checks


def box(x0, y0, x1, y1, what):
    boxes.append((min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1), what))


def hits(b, pad=1.5, skip=()):
    return [o[4] for o in boxes if o[4] not in skip and not (b[2] + pad < o[0] or b[0] - pad > o[2] or b[3] + pad < o[1] or b[1] - pad > o[3])]


# panel and other reserved areas (kept clear of map lettering)
PNL = (806, 96, 1146, 928)
box(*PNL, 'panel')
ROSE = (200, 1304, 84)
box(ROSE[0] - ROSE[2] - 8, ROSE[1] - ROSE[2] - 22, ROSE[0] + ROSE[2] + 8, ROSE[1] + ROSE[2] + 10, 'rose')

for s in SHOWS:
    r = 8 if s['type'] == 'feat' else 6.2
    box(s['x'] - r, s['y'] - r, s['x'] + r, s['y'] + r, 'sym:' + s['name'])

# ------------------------------------------------------------------ featured labels (hand placed)
# name: (anchor x offset, anchor y offset, align, lines of the name, elbow)
FL = {
    'The International Ayr Show': (15, 1, 'l', None),
    'Blackpool Air Show': (-15, -13, 'r', None),
    'Southport Air Show': (-15, 14, 'r', None),
    'RAF Cosford Air Show': (-15, 2, 'r', None),
    'Midlands Air Festival': (-15, 3, 'r', None),
    'Little Gransden': (18, -27, 'l', None),
    'IWM Duxford': (15, 4, 'l', None),
    'Shuttleworth, Old Warden': (-12, 24, 'r', None),
    'Clacton Airshow': (15, -1, 'l', None),
    'Wales National Airshow': (-14, 22, 'r', None),
    'Royal International Air Tattoo': (-52, 108, 'c', None),
    'Headcorn International Airshow': (58, -58, 'l', ['Headcorn', 'International Airshow']),
    'Airbourne Eastbourne': (2, 34, 'c', None),
}
NAME_SIZE, PLACE_SIZE = 15.5, 10.2
labels = []
for s in FEATURED:
    dx, dy, al, wrap = FL[s['name']]
    nl = wrap or [s['name']]
    wn = max(w_cond(t, NAME_SIZE, .7, 800) for t in nl)
    wp = w_text(s['place'], PLACE_SIZE)
    wbox = max(wn, wp)
    hbox = 15.5 * len(nl) + 12.5
    ax, ay = s['x'] + dx, s['y'] + dy
    if al == 'l':
        x0 = ax
    elif al == 'r':
        x0 = ax - wbox
    else:
        x0 = ax - wbox / 2
    y0 = ay - hbox / 2
    b = (x0, y0, x0 + wbox, y0 + hbox)
    labels.append((s, nl, al, ax, ay, b))
    h = hits(b, skip=('sym:' + s['name'],))
    if h:
        print('WARN featured label', s['name'], 'hits', h)
    box(*b, 'lab:' + s['name'])

# ------------------------------------------------------------------ numbers for the other shows
NUM_OFF = {  # name: (dx, dy) of the numeral centre from the symbol centre
    'Whitby Regatta': (12, -8), 'Armed Forces Day': (13, 6), 'Armed Forces Weekend': (13, -3),
    'East Kirkby Air Show': (-13, -4), 'The Victory Show': (-12, -9), 'Sywell Classic Pistons And Props': (-13, -6),
    'Old Buckenham Air Show': (13, -5), 'Stow Maries Air Show': (-12, 9), 'SleapKosh': (-12, -8),
    'Abingdon Air And Country Show': (13, 6), 'Hampshire Air Festival': (5, -12), 'Wallop Wheels And Wings': (13, 7),
    'Aero Legends Battle Of Britain Airshow': (13, 7), 'Goodwood Revival': (-2, -13), 'English Riviera Airshow': (13, -6),
    'Guernsey Air Display': (-13, -4), 'Jersey International Air Display': (-13, 5),
}
nums = []
for s in OTHERS:
    dx, dy = NUM_OFF[s['name']]
    cx, cy = s['x'] + dx, s['y'] + dy
    wn = 6.2 * len(str(s['num'])) + 1
    b = (cx - wn / 2, cy - 6, cx + wn / 2, cy + 6)
    h = hits(b, pad=.3, skip=('sym:' + s['name'],))
    if h:
        print('WARN number', s['num'], s['name'], 'hits', h)
    box(*b, 'num:%d' % s['num'])
    nums.append((s, cx, cy))

# ------------------------------------------------------------------ sea and country lettering
SEAS = [('NORTH SEA', 1040, 1008, 15, 7, 0), ('IRISH', 368, 918, 13, 5.5, 0), ('SEA', 368, 936, 13, 5.5, 0),
        ('ENGLISH CHANNEL', 722, 1372, 14.5, 7, 0), ('CELTIC SEA', 200, 1432, 14, 6.5, 0), ('ATLANTIC', 118, 430, 12, 6, -90),
        ('NORTH SEA', 742, 608, 12.5, 6, -68)]
LANDS = [('SCOTLAND', 452, 452, 21, 9), ('ENGLAND', 706, 968, 21, 9), ('WALES', 498, 1052, 16, 7),
         ('NORTHERN', 247, 728, 10, 3.6), ('IRELAND', 247, 741, 10, 3.6), ('IRELAND', 168, 972, 16, 8), ('FRANCE', 1048, 1404, 16, 8)]
for t, x, y, size, ls, rot in SEAS:
    w = (size * .56 + ls) * len(t)
    if rot == 0:
        box(x - w / 2, y - size, x + w / 2, y + 4, 'sea:' + t)
for t, x, y, size, ls in LANDS:
    w = (size * .5 + ls) * len(t)
    box(x - w / 2, y - size, x + w / 2, y + 3, 'land:' + t)

# ------------------------------------------------------------------ towns (site coordinates), greedy placement
TOWN_PICK = ['London', 'Edinburgh', 'Cardiff', 'Belfast', 'Glasgow', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool',
             'Newcastle upon Tyne', 'Bristol', 'Aberdeen', 'Inverness', 'Norwich', 'Plymouth', 'Southampton', 'Sheffield',
             'Nottingham', 'Carlisle', 'York', 'Cambridge', 'Oxford', 'Dundee', 'Brighton', 'Exeter', 'Penzance', 'Dover',
             'Lincoln', 'Aberystwyth', 'Derry', 'Dumfries', 'Berwick-Upon-Tweed', 'Middlesbrough', 'Lancaster', 'Leicester',
             'Stoke-on-Trent', 'Peterborough', 'Ipswich', 'Gloucester', 'Bournemouth', 'Portsmouth', 'Truro', 'Perth',
             'Stirling', 'Kendal', 'Shrewsbury', 'Hereford', 'Canterbury', 'Reading', 'Northampton', 'Great Yarmouth',
             "King's Lynn", 'Barnstaple', 'Bangor', 'Taunton', 'Salisbury', 'Chester', 'Preston', 'Coventry', 'Derby',
             'Swindon', 'Luton', 'Colchester', 'Hastings', 'Weymouth', 'Newquay', 'Harrogate', 'Durham', 'Sunderland']
CAPITALS = {'London', 'Edinburgh', 'Cardiff', 'Belfast'}
towns = []
for name in TOWN_PICK:
    if name not in TOWNS:
        continue
    la, lo = TOWNS[name]
    x, y = P(lo, la)
    if not (MX0 + 8 < x < MX1 - 8 and MY0 + 8 < y < MY1 - 8):
        continue
    cap = name in CAPITALS
    size = 10.6 if cap else 9.4
    label = name.replace('-Upon-', '-upon-')
    wl = w_text(label, size) + 2
    dot = (x - 3, y - 3, x + 3, y + 3)
    if hits(dot, pad=1):
        continue
    for dx, dy, anchor in ((6, 3.2, 'start'), (-6, 3.2, 'end'), (0, -6, 'middle'), (0, 12.5, 'middle'), (6, -4, 'start'), (-6, -4, 'end'), (6, 10, 'start'), (-6, 10, 'end')):
        tx, ty = x + dx, y + dy
        x0 = tx if anchor == 'start' else tx - wl if anchor == 'end' else tx - wl / 2
        b = (x0, ty - size * .78, x0 + wl, ty + size * .22)
        if not hits(b, pad=2.2) and MX0 + 6 < b[0] and b[2] < MX1 - 6 and b[1] > MY0 + 16 and b[3] < MY1 - 16:
            box(*dot, 'town:' + name)
            box(*b, 'townlab:' + name)
            towns.append((label, x, y, tx, ty, anchor, cap, size))
            break

# motorway numbers, lowest priority
mlabs = []
for name, sx, sy in NET.get('mlab', []):
    lon = sx / 400 * S_GW + S_L0
    lat = S_T - sy / 592 * S_GH
    x, y = P(lon, lat)
    wl = 5.0 * len(name) + 5
    b = (x - wl / 2, y - 5, x + wl / 2, y + 5)
    if hits(b, pad=2.5) or not (MX0 + 10 < x < MX1 - 10):
        continue
    box(*b, 'mway:' + name)
    mlabs.append((name, x, y, wl))

# ------------------------------------------------------------------ draw lettering under the symbols
A('<g font-family="var(--f)" font-style="italic" font-weight="500" fill="%s" fill-opacity=".72" text-anchor="middle">' % TEAL_D)
for t, x, y, size, ls, rot in SEAS:
    tr = ' transform="rotate(%d %s %s)"' % (rot, f(x), f(y)) if rot else ''
    A('<text x="%s" y="%s" font-size="%s" letter-spacing="%s"%s>%s</text>' % (f(x), f(y), size, ls, tr, t))
A('</g>')
A('<g font-family="var(--c)" font-weight="600" fill="%s" text-anchor="middle">' % NAVY)
for t, x, y, size, ls in LANDS:
    op = '.2' if t in ('IRELAND', 'FRANCE') and size > 12 else '.26'
    A('<text x="%s" y="%s" font-size="%s" letter-spacing="%s" fill-opacity="%s">%s</text>' % (f(x), f(y), size, ls, op, t))
A('</g>')

# motorway numbers
A('<g font-family="var(--m)" font-weight="600" font-size="6.6" text-anchor="middle">')
for name, x, y, wl in mlabs:
    A('<rect x="%s" y="%s" width="%s" height="8.6" rx="1.6" fill="#5E8FC2"/>' % (f(x - wl / 2), f(y - 4.3), f(wl)))
    A('<text x="%s" y="%s" fill="#fff">%s</text>' % (f(x), f(y + 2.4), name))
A('</g>')

# towns
A('<g font-family="var(--f)" font-weight="500" fill="#3F5160" stroke="%s" stroke-width="2.4" stroke-linejoin="round" paint-order="stroke">' % LANDC)
for label, x, y, tx, ty, anchor, cap, size in towns:
    if cap:
        A('<rect x="%s" y="%s" width="5" height="5" fill="%s" stroke="%s" stroke-width="1"/>' % (f(x - 2.5), f(y - 2.5), NAVY, LANDC))
    else:
        A('<circle cx="%s" cy="%s" r="1.9" fill="%s" stroke="%s" stroke-width="1.1"/>' % (f(x), f(y), LANDC, '#3F5160'))
    A('<text x="%s" y="%s" font-size="%s" text-anchor="%s"%s>%s</text>' % (f(tx), f(ty), size, anchor, ' font-weight="700" letter-spacing=".3"' if cap else '', label.replace("'", '’')))
A('</g>')


# ------------------------------------------------------------------ symbols
def symbol(ty, x, y, k=1.0, ring=True):
    c, e = TYPE_INK[ty], TYPE_EDGE[ty]
    o = []
    if ty == 'feat':
        if ring:
            o.append('<circle cx="%s" cy="%s" r="%s" fill="%s" fill-opacity=".1" stroke="%s" stroke-width="1" stroke-dasharray="3.2 2.5"/>' % (f(x), f(y), f(15.5 * k), c, e))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="#fff"/>' % (f(x), f(y), f(8.2 * k)))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width=".8"/>' % (f(x), f(y), f(6.4 * k), c, e))
        o.append('<rect x="%s" y="%s" width="%s" height="%s" rx=".6" fill="#fff" transform="rotate(-38 %s %s)"/>' % (f(x - 4.4 * k), f(y - 1.15 * k), f(8.8 * k), f(2.3 * k), f(x), f(y)))
    elif ty == 'mil':
        o.append('<circle cx="%s" cy="%s" r="%s" fill="#fff"/>' % (f(x), f(y), f(7.2 * k)))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="#fff" stroke="%s" stroke-width="%s"/>' % (f(x), f(y), f(5 * k), e, f(2 * k)))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (f(x), f(y), f(2.1 * k), c))
    elif ty == 'hist':
        o.append('<circle cx="%s" cy="%s" r="%s" fill="#fff"/>' % (f(x), f(y), f(7 * k)))
        o.append('<path d="M%s %sV%sM%s %sH%s" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (f(x), f(y - 8 * k), f(y + 8 * k), f(x - 8 * k), f(y), f(x + 8 * k), e, f(1.5 * k)))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width="1"/>' % (f(x), f(y), f(4.8 * k), c, e))
    elif ty == 'sea':
        d = 6.4 * k
        o.append('<path d="M%s %sL%s %sL%s %sL%sZ" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>' % (f(x), f(y - d), f(x + d), f(y), f(x), f(y + d), '%s %s' % (f(x - d), f(y))))
        o.append('<path d="M%s %sL%s %sL%s %sL%sZ" fill="%s" stroke="%s" stroke-width=".9" stroke-linejoin="round"/>' % (f(x), f(y - d), f(x + d), f(y), f(x), f(y + d), '%s %s' % (f(x - d), f(y)), c, e))
    else:
        h = 4.9 * k
        o.append('<rect x="%s" y="%s" width="%s" height="%s" rx="1.6" fill="#fff"/>' % (f(x - h - 2), f(y - h - 2), f(2 * h + 4), f(2 * h + 4)))
        o.append('<rect x="%s" y="%s" width="%s" height="%s" rx="1" fill="%s" stroke="%s" stroke-width="1"/>' % (f(x - h), f(y - h), f(2 * h), f(2 * h), c, e))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (f(x), f(y), f(1.5 * k), NAVY))
    return ''.join(o)


# leaders for the featured labels
A('<g fill="none" stroke="%s" stroke-width=".9" stroke-linecap="round">' % NAVY)
for s, nl, al, ax, ay, b in labels:
    x, y = s['x'], s['y']
    if al == 'l':
        tx, ty = b[0] - 4, ay
    elif al == 'r':
        tx, ty = b[2] + 4, ay
    else:
        tx, ty = ax, (b[1] - 3 if ay > y else b[3] + 3)
    d = math.hypot(tx - x, ty - y)
    if d > 13:
        ux, uy = (tx - x) / d, (ty - y) / d
        A('<path d="M%s %sL%s %s" stroke="%s" stroke-width="3.2"/>' % (f(x + ux * 9), f(y + uy * 9), f(tx), f(ty), LANDC))
        A('<path d="M%s %sL%s %s"/>' % (f(x + ux * 9), f(y + uy * 9), f(tx), f(ty)))
A('</g>')

for s in sorted(SHOWS, key=lambda s: (s['type'] == 'feat', -s['lat'])):
    A(symbol(s['type'], s['x'], s['y']))

# numerals
A('<g font-family="var(--c)" font-weight="800" font-size="13" fill="%s" text-anchor="middle" stroke="#FBF8F0" stroke-width="3" stroke-linejoin="round" paint-order="stroke">' % NAVY)
for s, cx, cy in nums:
    A('<text x="%s" y="%s">%d</text>' % (f(cx), f(cy + 4.5), s['num']))
A('</g>')

# featured labels
A('<g paint-order="stroke" stroke-linejoin="round">')
for s, nl, al, ax, ay, b in labels:
    anchor = {'l': 'start', 'r': 'end', 'c': 'middle'}[al]
    tx = b[0] if al == 'l' else b[2] if al == 'r' else ax
    y = b[1] + 12.6
    for t in nl:
        A('<text x="%s" y="%s" text-anchor="%s" font-family="var(--c)" font-weight="800" font-size="%s" letter-spacing=".7" fill="%s" stroke="#FBF8F0" stroke-width="3.4">%s</text>' % (f(tx), f(y), anchor, NAME_SIZE, NAVY, t.upper()))
        y += 15.5
    A('<text x="%s" y="%s" text-anchor="%s" font-family="var(--f)" font-weight="600" font-size="%s" fill="#8E2A2A" stroke="#FBF8F0" stroke-width="2.8">%s</text>' % (f(tx), f(y - 3.2), anchor, PLACE_SIZE, s['place']))
A('</g>')

# ------------------------------------------------------------------ compass rose
cx, cy, R = ROSE
A('<g>')
A('<circle cx="%d" cy="%d" r="%d" fill="%s" fill-opacity=".5"/>' % (cx, cy, R + 3, SEA_HI))
A('<circle cx="%d" cy="%d" r="%d" fill="none" stroke="%s" stroke-width="1.1"/>' % (cx, cy, R, NAVY))
A('<circle cx="%d" cy="%d" r="%s" fill="none" stroke="%s" stroke-width=".6"/>' % (cx, cy, f(R - 9), NAVY))
tk = []
for d in range(0, 360, 5):
    a = math.radians(d)
    r0 = R - (9 if d % 30 == 0 else 6 if d % 10 == 0 else 3.5)
    tk.append('M%s %sL%s %s' % (f(cx + math.sin(a) * r0), f(cy - math.cos(a) * r0), f(cx + math.sin(a) * R), f(cy - math.cos(a) * R)))
A('<path d="%s" stroke="%s" stroke-width=".7" fill="none"/>' % (''.join(tk), NAVY))
A('<g font-family="var(--m)" font-weight="500" font-size="7.2" fill="%s" text-anchor="middle">' % NAVY)
for d in range(30, 360, 30):
    if d % 90 == 0:
        continue
    a = math.radians(d)
    r1 = R - 15.5
    A('<text x="%s" y="%s">%03d</text>' % (f(cx + math.sin(a) * r1), f(cy - math.cos(a) * r1 + 2.6), d))
A('</g>')


def star_point(ang, rlong, rshort, c1, c2):
    a = math.radians(ang)
    tip = (cx + math.sin(a) * rlong, cy - math.cos(a) * rlong)
    l = (cx + math.sin(a - math.pi / 4) * rshort, cy - math.cos(a - math.pi / 4) * rshort)
    r = (cx + math.sin(a + math.pi / 4) * rshort, cy - math.cos(a + math.pi / 4) * rshort)
    return ('<path d="M%s %sL%s %sL%d %dZ" fill="%s"/>' % (f(tip[0]), f(tip[1]), f(l[0]), f(l[1]), cx, cy, c1) +
            '<path d="M%s %sL%s %sL%d %dZ" fill="%s"/>' % (f(tip[0]), f(tip[1]), f(r[0]), f(r[1]), cx, cy, c2))


for ang in (45, 135, 225, 315):
    A(star_point(ang, R - 30, 8.5, mix(SEA_HI, TEAL, .9), '#FBF8F0'))
for ang in (90, 180, 270):
    A(star_point(ang, R - 12, 11.5, NAVY, '#FBF8F0'))
A(star_point(0, R - 12, 11.5, RED, '#FBF8F0'))
pts = []
for i in range(16):
    a = math.radians(i * 22.5)
    rr = R - 12 if i % 4 == 0 else R - 30 if i % 2 == 0 else 0
    if rr:
        pts.append((cx + math.sin(a) * rr, cy - math.cos(a) * rr))
outline = []
for ang, rl, rs in [(0, R - 12, 11.5), (90, R - 12, 11.5), (180, R - 12, 11.5), (270, R - 12, 11.5)] + [(a, R - 30, 8.5) for a in (45, 135, 225, 315)]:
    a = math.radians(ang)
    tip = (cx + math.sin(a) * rl, cy - math.cos(a) * rl)
    l = (cx + math.sin(a - math.pi / 4) * rs, cy - math.cos(a - math.pi / 4) * rs)
    r = (cx + math.sin(a + math.pi / 4) * rs, cy - math.cos(a + math.pi / 4) * rs)
    outline.append('M%s %sL%s %sL%s %sZ' % (f(l[0]), f(l[1]), f(tip[0]), f(tip[1]), f(r[0]), f(r[1])))
A('<path d="%s" fill="none" stroke="%s" stroke-width=".7" stroke-linejoin="round"/>' % (''.join(outline), NAVY))
A('<circle cx="%d" cy="%d" r="3.2" fill="#FBF8F0" stroke="%s" stroke-width=".9"/>' % (cx, cy, NAVY))
A('<text x="%d" y="%s" font-family="var(--c)" font-weight="800" font-size="17" fill="%s" text-anchor="middle">N</text>' % (cx, f(cy - R - 7), NAVY))
A('</g>')

# degree labels just inside the frame
A('<g font-family="var(--m)" font-weight="500" font-size="8.6" fill="%s" stroke="%s" stroke-width="2.6" paint-order="stroke" stroke-linejoin="round">' % (NAVY, SEA_HI))
for lat in range(int(math.ceil(SOUTH)) + 1, int(NORTH) + 1):
    y = P(0, lat)[1]
    A('<text x="%s" y="%s">%d°N</text>' % (MX0 + 5, f(y - 3.2), lat))
    if not (PNL[1] < y < PNL[3]):
        A('<text x="%s" y="%s" text-anchor="end">%d°N</text>' % (MX1 - 5, f(y - 3.2), lat))
for lon in range(int(math.ceil(WEST)) + 1, int(EAST) + 1):
    x = P(lon, 0)[0]
    t = '0°' if lon == 0 else '%d°%s' % (abs(lon), 'W' if lon < 0 else 'E')
    if not (PNL[0] - 20 < x < PNL[2] + 20):
        A('<text x="%s" y="%s">%s</text>' % (f(x + 4), MY0 + 12, t))
    A('<text x="%s" y="%s">%s</text>' % (f(x + 4), MY1 - 6, t))
A('</g>')
A('</g>')  # end of clipped map

# ------------------------------------------------------------------ neatline
A('<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>' % (FX0, FY0, FX1 - FX0, BAND, PAPER))
A('<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>' % (FX0, FY1 - BAND, FX1 - FX0, BAND, PAPER))
A('<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>' % (FX0, FY0, BAND, FY1 - FY0, PAPER))
A('<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>' % (FX1 - BAND, FY0, BAND, FY1 - FY0, PAPER))
bars = []
step = 0.5
lon = math.floor(WEST / step) * step
while lon < EAST:
    a, b = max(lon, WEST), min(lon + step, EAST)
    if int(round(lon / step)) % 2 == 0 and b > a:
        xa, xb = P(a, 0)[0], P(b, 0)[0]
        bars.append('<rect x="%s" y="%s" width="%s" height="%s"/>' % (f(xa), f(FY0 + 3), f(xb - xa), f(BAND - 6)))
        bars.append('<rect x="%s" y="%s" width="%s" height="%s"/>' % (f(xa), f(FY1 - BAND + 3), f(xb - xa), f(BAND - 6)))
    lon += step
lat = math.floor(SOUTH / step) * step
while lat < NORTH:
    a, b = max(lat, SOUTH), min(lat + step, NORTH)
    if int(round(lat / step)) % 2 == 0 and b > a:
        ya, yb = P(0, b)[1], P(0, a)[1]
        bars.append('<rect x="%s" y="%s" width="%s" height="%s"/>' % (f(FX0 + 3), f(ya), f(BAND - 6), f(yb - ya)))
        bars.append('<rect x="%s" y="%s" width="%s" height="%s"/>' % (f(FX1 - BAND + 3), f(ya), f(BAND - 6), f(yb - ya)))
    lat += step
A('<g fill="%s">%s</g>' % (NAVY, ''.join(bars)))
A('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="%s" stroke-width="1.6"/>' % (FX0, FY0, FX1 - FX0, FY1 - FY0, NAVY))
A('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="%s" stroke-width=".8"/>' % (MX0, MY0, MX1 - MX0, MY1 - MY0, NAVY))
for (x, y) in ((FX0, FY0), (FX1 - BAND, FY0), (FX0, FY1 - BAND), (FX1 - BAND, FY1 - BAND)):
    A('<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width=".8"/>' % (x, y, BAND, BAND, PAPER, NAVY))

# ------------------------------------------------------------------ title and key panel
px0, py0, px1, py1 = PNL
A('<g filter="url(#pshadow)"><rect x="%d" y="%d" width="%d" height="%d" fill="#FBF8F0"/></g>' % (px0, py0, px1 - px0, py1 - py0))
A('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="%s" stroke-width="1.2"/>' % (px0, py0, px1 - px0, py1 - py0, NAVY))
A('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="%s" stroke-width=".6"/>' % (px0 + 5, py0 + 5, px1 - px0 - 10, py1 - py0 - 10, NAVY))
ix0, ix1 = px0 + 22, px1 - 22
A('<text x="%d" y="%d" font-family="var(--m)" font-weight="600" font-size="9.6" letter-spacing="2.4" fill="%s">PLANNING CHART</text>' % (ix0, py0 + 31, NAVY))
A('<path d="M%d %dH%d" stroke="%s" stroke-width="3"/>' % (ix0, py0 + 262, ix0 + 46, RED))
KEY_TOP = py0 + 338
A('<path d="M%d %dH%d" stroke="%s" stroke-width=".8"/>' % (ix0, KEY_TOP - 14, ix1, NAVY))
A('<text x="%d" y="%d" font-family="var(--m)" font-weight="600" font-size="9.6" letter-spacing="2.4" fill="%s">KEY TO SHOWS</text>' % (ix0, KEY_TOP + 8, NAVY))
y = KEY_TOP + 36
A(symbol('feat', ix0 + 11, y - 3, 1.0, ring=True))
A('<text x="%d" y="%s" font-family="var(--c)" font-weight="800" font-size="14" letter-spacing=".9" fill="%s">%s</text>' % (ix0 + 34, f(y - 4.5), NAVY, TYPES['feat'][0].upper()))
A('<text x="%d" y="%s" font-family="var(--f)" font-weight="500" font-size="10" fill="#4A5C6B">Thirteen shows, named on the chart</text>' % (ix0 + 34, f(y + 8)))
y += 26
ROW = 23.4
for ty in order:
    y += 9
    A('<path d="M%d %sH%d" stroke="%s" stroke-opacity=".28" stroke-width=".7"/>' % (ix0, f(y - 11.5), ix1, NAVY))
    A(symbol(ty, ix0 + 11, y + 3.5, 1.0))
    A('<text x="%d" y="%s" font-family="var(--c)" font-weight="800" font-size="14" letter-spacing=".9" fill="%s">%s</text>' % (ix0 + 34, f(y + 8.4), NAVY, TYPES[ty][0].upper()))
    y += 27
    for s in [s for s in OTHERS if s['type'] == ty]:
        A('<text x="%d" y="%s" font-family="var(--c)" font-weight="800" font-size="13.5" fill="%s" text-anchor="middle">%d</text>' % (ix0 + 11, f(y + 2), TYPE_EDGE[ty], s['num']))
        A('<text x="%d" y="%s" font-family="var(--c)" font-weight="700" font-size="12.6" letter-spacing=".45" fill="%s">%s</text>' % (ix0 + 34, f(y - 2.6), NAVY, s['name'].upper()))
        A('<text x="%d" y="%s" font-family="var(--f)" font-weight="500" font-size="9.6" fill="#4A5C6B">%s</text>' % (ix0 + 34, f(y + 8.2), s['place']))
        y += ROW
KEY_END = y
A('<path d="M%d %sH%d" stroke="%s" stroke-opacity=".28" stroke-width=".7"/>' % (ix0, f(y - 5), ix1, NAVY))
# line key
ly = y + 9
A('<path d="M%d %sH%d" stroke="#5E8FC2" stroke-width="1.6"/>' % (ix0, f(ly), ix0 + 24))
A('<text x="%d" y="%s" font-family="var(--f)" font-weight="500" font-size="9.6" fill="#4A5C6B">Motorway</text>' % (ix0 + 30, f(ly + 3.3)))
A('<path d="M%d %sH%d" stroke="#5B6B76" stroke-width=".9"/><path d="M%d %sH%d" stroke="#5B6B76" stroke-width="2.6" stroke-dasharray=".8 5.2"/>' % (ix0 + 98, f(ly), ix0 + 122, ix0 + 98, f(ly), ix0 + 122))
A('<text x="%d" y="%s" font-family="var(--f)" font-weight="500" font-size="9.6" fill="#4A5C6B">Main railway</text>' % (ix0 + 128, f(ly + 3.3)))
A('<rect x="%d" y="%s" width="5" height="5" fill="%s"/>' % (ix0 + 210, f(ly - 2.5), NAVY))
A('<text x="%d" y="%s" font-family="var(--f)" font-weight="500" font-size="9.6" fill="#4A5C6B">Capital</text>' % (ix0 + 220, f(ly + 3.3)))
print('key ends at y=%.1f, panel bottom %d' % (ly + 8, py1))

# ------------------------------------------------------------------ foot of the sheet: scale bars
SX, SY = 372, 1548
nm = PY / 60.0
km = PY / 111.195
A('<g font-family="var(--m)" font-weight="500" font-size="8.4" fill="%s">' % NAVY)
A('<text x="%d" y="%d" font-weight="600" letter-spacing="2.2" font-size="8.8">SCALE</text>' % (SX, SY - 8))
for i, (a, b) in enumerate(((0, 25), (25, 50), (50, 100))):
    A('<rect x="%s" y="%d" width="%s" height="5" fill="%s" stroke="%s" stroke-width=".8"/>' % (f(SX + a * nm), SY + 10, f((b - a) * nm), NAVY if i % 2 == 0 else PAPER, NAVY))
for v in (0, 25, 50, 100):
    A('<text x="%s" y="%d" text-anchor="middle">%d</text>' % (f(SX + v * nm), SY + 7, v))
A('<text x="%s" y="%d">NAUTICAL MILES</text>' % (f(SX + 100 * nm + 12), SY + 16))
for i, (a, b) in enumerate(((0, 50), (50, 100), (100, 200))):
    A('<rect x="%s" y="%d" width="%s" height="5" fill="%s" stroke="%s" stroke-width=".8"/>' % (f(SX + a * km), SY + 15, f((b - a) * km), PAPER if i % 2 == 0 else NAVY, NAVY))
for v in (0, 50, 100, 200):
    A('<text x="%s" y="%d" text-anchor="middle">%d</text>' % (f(SX + v * km), SY + 30, v))
A('<text x="%s" y="%d">KILOMETRES</text>' % (f(SX + 200 * km + 12), SY + 30))
A('</g>')
A('<path d="M372 1602H800" stroke="%s" stroke-width=".8"/>' % NAVY)
A('<text x="372" y="1690" font-family="var(--m)" font-weight="500" font-size="7.6" letter-spacing=".6" fill="#6B7C89">Coastline, railways and motorways from Natural Earth open data. Drawn for The Big Guide to UK Airshows.</text>')

art = '\n'.join(svg)


# ------------------------------------------------------------------ paper grain (a small tiled PNG)
def noise_png(n=220, seed=3):
    rnd = random.Random(seed)
    raw = bytearray()
    for _ in range(n):
        raw.append(0)
        for _ in range(n):
            v = rnd.random()
            g = 90 if v < .5 else 255
            a = int(22 * rnd.random() ** 2)
            raw += bytes((g, a))

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', n, n, 8, 4, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b'')


GRAIN = base64.b64encode(noise_png()).decode()

html = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>The UK Airshow Chart | UK Airshow Guide poster 03</title>
<link rel="stylesheet" href="https://use.typekit.net/vyp4rci.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500;1,700&family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="kit.css">
<style>
/* generated by build/gen_03.py, edit that file rather than this one */
.slide{background:%(paper)s;color:var(--navy)}
.grain{position:absolute;left:0;top:0;width:1240px;height:1754px;background-image:url(data:image/png;base64,%(grain)s);background-size:110px 110px;mix-blend-mode:multiply;pointer-events:none}
.edition{right:116px;top:118.5px;font-family:var(--m);font-weight:600;font-size:9.6px;line-height:1;letter-spacing:2.4px;color:var(--red)}
.title{left:827px;top:147px;font-family:var(--c);font-weight:900;font-size:80px;line-height:.865;letter-spacing:-.4px;text-transform:uppercase;color:var(--navy)}
.title span{color:var(--red)}
.sub{left:828px;top:372px;font-family:var(--f);font-weight:500;font-size:13.8px;line-height:1.42;color:#33444F}
.note1{left:372px;top:1616px;font-family:var(--c);font-weight:800;font-size:22px;line-height:1;letter-spacing:.3px;color:var(--navy)}
.note1 span{color:var(--red)}
.note2{left:372px;top:1646px;font-family:var(--f);font-weight:500;font-size:12.6px;line-height:1.4;color:#33444F}
.so-url{right:70px;top:1650px;color:var(--navy)}
.so-tag{right:70px;top:1627px;color:var(--teal-d)}
</style>
</head>
<body>
<div class="slide">
<svg class="art" viewBox="0 0 1240 1754" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
%(art)s
</svg>
<div class="grain"></div>
<div data-live class="edition">EDITION 2027</div>
<div data-live class="title">The UK<br><span>Airshow</span><br>Chart</div>
<div data-live class="sub">Thirty shows from the UK Airshow Guide map.<br>Find yours, then plan the day.</div>
<img class="logo" src="img/uk-airshow-guide-logo.png" alt="UK Airshow Guide" style="left:70px;top:1549px;width:266px">
<div data-live class="note1">Not for navigation. <span>For planning brilliant days out.</span></div>
<div data-live class="note2">Dates can change. Please check the official airshow website before you book.</div>
<div data-live class="so-tag">Plan your airshow series 03 / 10</div>
<div data-live class="so-url">ukairshowguide.co.uk</div>
</div>
</body>
</html>
''' % {'paper': PAPER, 'grain': GRAIN, 'art': art}
open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', OUT, '%.0f KB' % (len(html) / 1024), '| shows', len(SHOWS), '| towns', len(towns), '| motorway tags', len(mlabs))
print('extent: %.2fW to %.2fE, %.2fN to %.2fN; %.1f px per degree of latitude' % (-WEST, EAST, SOUTH, NORTH, PY))
