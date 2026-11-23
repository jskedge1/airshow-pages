#!/usr/bin/env python3
"""Poster 07, Read the cloud. Writes posters/07-read-the-cloud.html.
Run from anywhere:  python3 -I posters/build/gen_07.py
The altitude scale is true: 7,000 ft over 880 px, ground at y = 1290."""
import math
import os
import random

W, H = 1240, 1754
G = 1290.0                      # ground line
S = 880.0 / 7000.0              # px per foot


def Y(ft):
    return G - ft * S


def f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


NAVY, DEEP, RED, AMBER = '#13293C', '#0B1A27', '#D74949', '#F5B942'
JET = '#D0202E'

# ---------------------------------------------------------------- cloud
Y1, Y2, Y3 = Y(6300), Y(4000), Y(1750)      # cloud base of the three decks
X1, X2 = 566.0, 892.0                        # where the deck steps down


def layer(d, seed, rmin, rmax):
    """One paper cut cloud layer whose lower edge sits d px inside the cloud."""
    pts = [(-90, Y1 - d), (X1 + .55 * d, Y1 - d), (X1 + .55 * d + 16, Y2 - d),
           (X2 + .55 * d, Y2 - d), (X2 + .55 * d + 16, Y3 - d), (1330, Y3 - d)]
    rnd = random.Random(seed)
    circ = []
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        length = math.hypot(bx - ax, by - ay)
        t = rnd.uniform(0, 18)
        while t < length:
            r = rnd.uniform(rmin, rmax)
            cx = ax + (bx - ax) * t / length
            cy = ay + (by - ay) * t / length
            # sit most puffs a little inside the cloud so the edge stays calm
            circ.append((cx, cy - r * rnd.uniform(.18, .42), r))
            t += r * rnd.uniform(1.0, 1.5)
    poly = pts + [(1330, -90), (-90, -90)]
    return poly, circ


def layer_shapes(poly, circ, dy=0.0):
    s = '<path d="M' + ' L'.join('%s %s' % (f(x), f(y + dy)) for x, y in poly) + ' Z"/>'
    s += ''.join('<circle cx="%s" cy="%s" r="%s"/>' % (f(x), f(y + dy), f(r)) for x, y, r in circ)
    return s


LAYERS = [  # back (lowest fringe) to front; light tone, mid tone, storm tone
    (0, 11, 20, 40, '#B4C4D1', '#93A6B7', '#70859A'),
    (30, 23, 26, 48, '#CBD7E1', '#A9B9C7', '#8396A8'),
    (62, 37, 30, 56, '#E2E9EF', '#C0CCD7', '#99AAB9'),
    (98, 51, 36, 66, '#F6F8FA', '#D9E1E8', '#B1BECA'),
]


def clouds():
    out = []
    for i, (d, seed, rmin, rmax, c0, c1, c2) in enumerate(LAYERS):
        poly, circ = layer(d, seed, rmin, rmax)
        out.append('<radialGradient id="cl%d" gradientUnits="userSpaceOnUse" cx="1250" cy="1190" r="1080">'
                   '<stop offset="0" stop-color="%s"/><stop offset=".5" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
                   '</radialGradient>' % (i, c2, c1, c0))
        # soft vector shadow thrown on whatever is behind
        for k, dy in enumerate((5, 10, 16)):
            out.append('<g fill="%s" fill-opacity="%s">%s</g>' % (NAVY, ('.07', '.05', '.035')[k], layer_shapes(poly, circ, dy)))
        out.append('<g fill="url(#cl%d)">%s</g>' % (i, layer_shapes(poly, circ)))
    return ''.join(out)


def billows():
    """Very quiet modelling inside the big cloud mass, behind the headline."""
    out = []
    for x, y, r in ((170, 120, 250), (520, 40, 280), (900, 110, 300), (1180, 300, 240), (330, 330, 170), (720, 330, 210)):
        out.append('<circle cx="%d" cy="%d" r="%d" fill="url(#bw)"/>' % (x, y, r))
    for x, y, r in ((1010, 372, 250), (650, 452, 170), (1215, 150, 210), (40, 350, 190), (1130, 905, 190)):
        out.append('<circle cx="%d" cy="%d" r="%d" fill="url(#bs)"/>' % (x, y, r))
    out.append('<rect x="936" y="620" width="46" height="4" fill="%s"/>' % RED)
    return ''.join(out)


# ---------------------------------------------------------------- aircraft
HAWK = (
    '<symbol id="hawk" viewBox="0 0 100 100" overflow="visible">'
    '<path d="M58 46.4 L43 17 L36.5 17 L41 46.4 Z M58 53.6 L43 83 L36.5 83 L41 53.6 Z" fill="%(j)s"/>'
    '<path d="M43 17 L36.5 17 L37.4 22 L45.4 22 Z M43 83 L36.5 83 L37.4 78 L45.4 78 Z" fill="#F4F4F4"/>'
    '<path d="M15 47.2 L7.5 36 L3.8 36 L6.5 47.2 Z M15 52.8 L7.5 64 L3.8 64 L6.5 52.8 Z" fill="%(j)s"/>'
    '<path d="M100 50 C97 47 90 45.2 82 44.6 L22 44.8 L7 45.9 L3 48.5 L3 51.5 L7 54.1 L22 55.2 L82 55.4 C90 54.8 97 53 100 50 Z" fill="%(j)s"/>'
    '<path d="M66 45.6 L26 46.8 L26 53.2 L66 54.4 Z" fill="#F4F4F4"/>'
    '<ellipse cx="77" cy="50" rx="9" ry="3" fill="#1B2A36"/>'
    '</symbol>' % {'j': JET})


def jet(x, y, size, ang=0.0):
    """Hawk with its nose at (x, y), flying along ang degrees (0 = to the right)."""
    return ('<g transform="translate(%s %s) rotate(%s)"><use href="#hawk" x="%s" y="%s" width="%s" height="%s"/></g>'
            % (f(x), f(y), f(ang), f(-size), f(-size / 2), f(size), f(size)))


def formation(x, y, ang, n, size=24, lat=11.5, back=11.0):
    """n ship vic, leader's nose at (x, y). Lateral spacing matches the smoke lines."""
    out = []
    ranks = [(0, 0)]
    for k in range(1, (n - 1) // 2 + 1):
        ranks += [(k, -k), (k, k)]
    a = math.radians(ang)
    for b, l in sorted(ranks, reverse=True):
        dx, dy = -b * back, l * lat
        out.append(jet(x + dx * math.cos(a) - dy * math.sin(a), y + dx * math.sin(a) + dy * math.cos(a), size, ang))
    return ''.join(out)


def rings(d, uid, n, paint_red, paint_white, lat=11.5, w=3.6):
    """Parallel smoke lines along path d: n = 3 or 5 lines, alternating red and white."""
    out = []
    order = list(range((n - 1) // 2, 0, -1))
    for k in order:
        paint = paint_red if (k % 2 == 0) == ((n - 1) // 2 % 2 == 0) else paint_white
        outer, inner = 2 * k * lat + w, 2 * k * lat - w
        out.append('<mask id="m%s%d" maskUnits="userSpaceOnUse" x="0" y="0" width="%d" height="%d">'
                   '<rect width="%d" height="%d" fill="#fff"/><path d="%s" fill="none" stroke="#000" stroke-width="%s" stroke-linejoin="round"/></mask>'
                   % (uid, k, W, H, W, H, d, f(inner)))
        out.append('<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linejoin="round" mask="url(#m%s%d)"/>'
                   % (d, paint, f(outer), uid, k))
    centre = paint_red if ((n - 1) // 2 % 2 == 0) else paint_white
    out.append('<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linejoin="round"/>' % (d, centre, f(w)))
    return ''.join(out)


def fade(uid, x1, x2, colour):
    return ('<linearGradient id="%s" gradientUnits="userSpaceOnUse" x1="%s" y1="0" x2="%s" y2="0">'
            '<stop offset="0" stop-color="%s" stop-opacity="0"/><stop offset="1" stop-color="%s"/></linearGradient>'
            % (uid, f(x1), f(x2), colour, colour))


def lerp(p, q, t):
    return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)


def split(p0, p1, p2, p3, t):
    """First part of a cubic up to t, plus the direction of travel at that point."""
    q0, q1, q2 = lerp(p0, p1, t), lerp(p1, p2, t), lerp(p2, p3, t)
    r0, r1 = lerp(q0, q1, t), lerp(q1, q2, t)
    s_ = lerp(r0, r1, t)
    return (q0, r0, s_), math.degrees(math.atan2(r1[1] - r0[1], r1[0] - r0[0]))


LAT = 11.5


def scenes():
    o = []
    # ---- 1 full show: a loop that tops out just under 5,500 ft, the team coming down the back of it
    LB = Y(560)
    LT = Y(5060)
    cx, rx, lx = 352, 514, 190
    (c1, c2, end), ang = split((lx, LB - 222), (lx, LB - 84), (cx - 110, LB), (cx, LB), .40)
    loop = ('M%d %s C%d %s %d %s %d %s C%d %s %d %s %d %s C%d %s %d %s %d %s C%s %s %s %s %s %s'
            % (cx, f(LB), cx + 110, f(LB), rx, f(LB - 84), rx, f(LB - 222),
               rx, f(LB - 384), cx + 100, f(LT), cx, f(LT),
               cx - 100, f(LT), lx, f(LB - 384), lx, f(LB - 222),
               f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(end[0]), f(end[1])))
    o.append(fade('f1r', 160, 270, RED) + fade('f1w', 160, 270, '#FFFFFF'))
    for k, paint in ((-2, 'url(#f1r)'), (-1, 'url(#f1w)'), (0, 'url(#f1r)'), (1, 'url(#f1w)'), (2, 'url(#f1r)')):
        o.append('<path d="M160 %s L%s %s" fill="none" stroke="%s" stroke-width="3.6"/>' % (f(LB + k * LAT), f(cx + .5), f(LB + k * LAT), paint))
    o.append(rings(loop, 'lp', 5, RED, '#FFFFFF'))
    a = math.radians(ang)
    o.append(formation(end[0] + 25 * math.cos(a), end[1] + 25 * math.sin(a), ang, 5))

    # ---- 2 rolling show: a wingover over the top and a roll along the bottom
    hump = 'M592 %s C646 %s 672 %s 732 %s C790 %s 818 %s 860 %s' % (f(Y(1500)), f(Y(1560)), f(Y(3180)), f(Y(3180)), f(Y(3180)), f(Y(2150)), f(Y(1380)))
    o.append(fade('f2r', 592, 674, RED) + fade('f2w', 592, 674, '#FFFFFF'))
    o.append(rings(hump, 'hp', 3, 'url(#f2r)', 'url(#f2w)'))
    ex, ey = 860, Y(1380)
    ang = math.degrees(math.atan2(Y(1380) - Y(2150), 860 - 818))
    a = math.radians(ang)
    o.append(formation(ex + 25 * math.cos(a), ey + 25 * math.sin(a), ang, 3))
    # the roll, drawn as a corkscrew
    y0, r, c = Y(600), 17.0, 7.4
    pts = []
    t = 0.0
    x0 = 652
    while t <= 6 * math.pi + 1e-6:
        pts.append((x0 + c * t + r * math.sin(t) * .95, y0 - r * .9 + r * .9 * math.cos(t)))
        t += math.pi / 18
    cork = 'M598 %s L%s %s ' % (f(y0), f(pts[0][0]), f(pts[0][1])) + ' '.join('L%s %s' % (f(x), f(y)) for x, y in pts[1:]) + ' L838 %s' % f(y0)
    o.append(fade('f3w', 598, 654, '#FFFFFF'))
    o.append('<path d="%s" fill="none" stroke="url(#f3w)" stroke-width="3.6" stroke-linejoin="round"/>' % cork)
    o.append(jet(863, y0, 24, 0))

    # ---- 3 flat show: a level pass and a crossover, all under 1,000 ft
    yp = Y(700)
    o.append(fade('f4r', 914, 1000, RED) + fade('f4w', 914, 1000, '#FFFFFF'))
    for k, paint in ((-2, 'url(#f4r)'), (-1, 'url(#f4w)'), (0, 'url(#f4r)'), (1, 'url(#f4w)'), (2, 'url(#f4r)')):
        o.append('<path d="M914 %s L%s %s" fill="none" stroke="%s" stroke-width="3.6"/>' % (f(yp + k * LAT), f(1124 - abs(k) * 11), f(yp + k * LAT), paint))
    o.append(formation(1149, yp, 0, 5))
    yc = Y(310)
    o.append(fade('f5r', 914, 968, RED))
    o.append('<linearGradient id="f5w" gradientUnits="userSpaceOnUse" x1="1240" y1="0" x2="1188" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>')
    o.append('<path d="M914 %s L1000 %s" fill="none" stroke="url(#f5r)" stroke-width="3.6"/>' % (f(yc - 6), f(yc - 6)))
    o.append('<path d="M1240 %s L1092 %s" fill="none" stroke="url(#f5w)" stroke-width="3.6"/>' % (f(yc + 6), f(yc + 6)))
    o.append(jet(1025, yc - 6, 24, 0))
    o.append(jet(1067, yc + 6, 24, 180))
    return ''.join(o)


# ---------------------------------------------------------------- scale, lines, labels
def tape():
    o = ['<rect x="70" y="%s" width="80" height="%s" fill="%s" fill-opacity=".88"/>' % (f(Y(7000) - 30), f(G - Y(7000) + 30), DEEP)]
    o.append('<rect x="70" y="%s" width="80" height="26" fill="%s"/>' % (f(Y(7000) - 30), NAVY))
    o.append('<text x="110" y="%s" class="m" font-size="11" font-weight="600" fill="#fff" text-anchor="middle" letter-spacing="2.4">FEET</text>' % f(Y(7000) - 12.5))
    for ft in range(0, 7001, 500):
        y = Y(ft)
        big = ft % 1000 == 0
        o.append('<path d="M%d %s H150" stroke="#fff" stroke-opacity="%s" stroke-width="%s"/>' % (138 if big else 143, f(y), '1' if big else '.6', '1.4' if big else '1'))
        if big and ft not in (0, 1000):
            o.append('<text x="133" y="%s" class="m" font-size="12.5" font-weight="500" fill="#fff" text-anchor="end">%s</text>' % (f(y + 4.3), '{:,}'.format(ft)))
    for ft in range(100, 7000, 100):
        if ft % 500:
            o.append('<path d="M147 %s H150" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>' % f(Y(ft)))
    o.append('<text transform="translate(86 %s) rotate(-90)" class="m" font-size="9.5" font-weight="500" fill="#8FA3B5" text-anchor="middle" letter-spacing="2.6">HEIGHT ABOVE THE AIRFIELD</text>' % f(Y(3900)))
    for ft in (5500, 2500, 1000):
        y = Y(ft)
        o.append('<path d="M97 %s H150 L159 %s L150 %s H97 Z" fill="%s"/>' % (f(y - 10.5), f(y), f(y + 10.5), AMBER))
        o.append('<text x="146" y="%s" class="m" font-size="12.5" font-weight="700" fill="%s" text-anchor="end">%s</text>' % (f(y + 4.4), DEEP, '{:,}'.format(ft)))
    return ''.join(o)


def thresholds():
    return ''.join('<path d="M159 %s H1240" stroke="#fff" stroke-opacity=".85" stroke-width="1.3" stroke-dasharray="7 6"/>' % f(Y(ft)) for ft in (5500, 2500, 1000))


def labels():
    o = []
    # the site's own words for each line, set where the line meets the next deck
    o.append('<text x="610" y="%s" class="m" font-size="11" font-weight="600" fill="%s" letter-spacing="1.7">LOOPS NEED CLEAR AIR ABOVE 5,500 FT</text>' % (f(Y(5500) + 4), NAVY))
    o.append('<text x="934" y="%s" class="m" font-size="11" font-weight="600" fill="%s" letter-spacing="1.7">ROLLING SHOW FROM 2,500 FT</text>' % (f(Y(2500) + 4), NAVY))
    o.append('<text x="604" y="%s" class="m" font-size="11" font-weight="600" fill="#fff" letter-spacing="1.7">FLAT SHOW DOWN TO 1,000 FT</text>' % f(Y(1000) - 8))
    # numbered scenes
    for n, x, y, name in ((1, 186, Y1 + 62, 'FULL SHOW'), (2, 616, Y2 + 62, 'ROLLING SHOW'), (3, 944, Y3 + 56, 'FLAT SHOW')):
        o.append('<circle cx="%s" cy="%s" r="15" fill="%s"/>' % (f(x), f(y), AMBER))
        o.append('<text x="%s" y="%s" class="c" font-size="21" font-weight="800" fill="%s" text-anchor="middle">%d</text>' % (f(x), f(y + 7.2), DEEP, n))
        o.append('<text x="%s" y="%s" class="c" font-size="25" font-weight="800" font-style="italic" fill="#fff" letter-spacing=".6">%s</text>' % (f(x + 25), f(y + 8.6), name))
    return ''.join(o)


def weather():
    rnd = random.Random(8)
    o = []
    # light breaking through under the high deck
    for x, w, dx, op in ((250, 70, -150, .11), (390, 46, -120, .08), (120, 40, -90, .07), (500, 30, -100, .06)):
        o.append('<path d="M%d %s L%d %s L%d %s L%d %s Z" fill="url(#shaft)" fill-opacity="%s"/>' % (x, f(Y1), x + w, f(Y1), x + w + dx + 30, f(G), x + dx, f(G), op * 3.6))
    # rain under the low deck
    for _ in range(120):
        x = rnd.uniform(912, 1262)
        y = rnd.uniform(Y3 + 20, G - 22)
        ln = rnd.uniform(14, 30)
        o.append('<path d="M%s %s l%s %s" stroke="#fff" stroke-opacity="%s" stroke-width="1" stroke-linecap="round"/>' % (f(x), f(y), f(-ln * .26), f(ln), f(rnd.uniform(.10, .22))))
    for _ in range(26):                           # a little drizzle under the middle deck
        x = rnd.uniform(600, 900)
        y = rnd.uniform(Y2 + 40, G - 220)
        ln = rnd.uniform(10, 18)
        o.append('<path d="M%s %s l%s %s" stroke="#fff" stroke-opacity=".08" stroke-width="1" stroke-linecap="round"/>' % (f(x), f(y), f(-ln * .26), f(ln)))
    return ''.join(o)


def ground():
    rnd = random.Random(3)
    o = ['<rect x="0" y="%s" width="%d" height="%s" fill="%s"/>' % (f(G), W, f(H - G), DEEP)]
    sil = []
    # hangars
    sil.append('M188 %s V1275 Q232 1259 276 1275 V%s Z' % (f(G), f(G)))
    sil.append('M282 %s V1277 Q320 1264 358 1277 V%s Z' % (f(G), f(G)))
    # control tower
    sil.append('M571 %s V1266 H565 L563 1258 H587 L585 1266 H579 V%s Z' % (f(G), f(G)))
    sil.append('M566 1258 V1255.5 H584 V1258 Z')
    # parked tails and a tree line
    for x in (640, 662, 684):
        sil.append('M%d %s L%d 1277 L%d 1273 L%d 1277 L%d %s Z' % (x, f(G), x, x + 11, x + 22, x + 22, f(G)))
    tx = 930.0
    tree = 'M%s %s' % (f(tx), f(G))
    while tx < 1250:
        w = rnd.uniform(16, 30)
        tree += ' Q%s %s %s %s' % (f(tx + w / 2), f(G - rnd.uniform(12, 24)), f(tx + w), f(G - rnd.uniform(1, 4)))
        tx += w
    sil.append(tree + ' V%s Z' % f(G))
    o.append('<path d="%s" fill="%s"/>' % (' '.join(sil), DEEP))
    o.append('<path d="M565.5 1260 H584.5" stroke="#5FE3D6" stroke-opacity=".8" stroke-width="2"/>')
    o.append('<circle cx="575" cy="1253" r="1.8" fill="%s"/>' % AMBER)
    # windsock
    o.append('<path d="M436 %s V1256" stroke="%s" stroke-width="1.8"/>' % (f(G), DEEP))
    for i in range(5):
        x0, x1 = 437 + i * 5.2, 437 + (i + 1) * 5.2
        h0, h1 = 4.6 - i * .55, 4.6 - (i + 1) * .55
        o.append('<path d="M%s %s L%s %s L%s %s L%s %s Z" fill="%s"/>' % (f(x0), f(1259 - h0 + i * .5), f(x1), f(1259 - h1 + (i + 1) * .5), f(x1), f(1259 + h1 + (i + 1) * .5), f(x0), f(1259 + h0 + i * .5), RED if i % 2 == 0 else '#fff'))
    # the crowd line: a long row of tiny heads and shoulders
    x = -2.0
    while x < W + 4:
        r = rnd.uniform(2.2, 2.9)
        yy = G - 1.2 - rnd.uniform(0, 2.6)
        tone = rnd.choice(('#2B4963', '#34566F', '#27425A', '#3B607A'))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/><path d="M%s %s q%s %s %s 0 v4 h%s Z" fill="%s"/>'
                 % (f(x), f(yy - r * .9), f(r), tone, f(x - r * 1.5), f(yy + r * 1.6), f(r * 1.5), f(-r * 1.5), f(r * 3), f(-r * 3), tone))
        x += rnd.uniform(6.4, 9.2)
    o.append('<rect x="0" y="%s" width="%d" height="14" fill="%s"/>' % (f(G + 4.5), W, DEEP))
    return ''.join(o)


def band():
    o = []
    for n, x in ((1, 70), (2, 565), (3, 895)):
        o.append('<circle cx="%d" cy="1361" r="17" fill="%s"/>' % (x + 17, AMBER))
        o.append('<text x="%d" y="1369.2" class="c" font-size="24" font-weight="800" fill="%s" text-anchor="middle">%d</text>' % (x + 17, DEEP, n))
    o.append('<path d="M70 1533 H1170" stroke="#27425A" stroke-width="1"/>')
    return ''.join(o)


def svg():
    return ('<svg class="art" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg">'
            '<defs>'
            '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset=".2" stop-color="#48657F"/><stop offset=".55" stop-color="#6E8DA6"/><stop offset=".735" stop-color="#A5BFD0"/></linearGradient>'
            '<radialGradient id="gloom" gradientUnits="userSpaceOnUse" cx="1260" cy="1120" r="820"><stop offset="0" stop-color="%s" stop-opacity=".62"/><stop offset=".55" stop-color="%s" stop-opacity=".3"/><stop offset="1" stop-color="%s" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="glow" gradientUnits="userSpaceOnUse" cx="300" cy="1296" r="430"><stop offset="0" stop-color="%s" stop-opacity=".5"/><stop offset=".45" stop-color="#F7D9A0" stop-opacity=".2"/><stop offset="1" stop-color="#F7D9A0" stop-opacity="0"/></radialGradient>'
            '<linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
            '<radialGradient id="bw"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="bs"><stop offset="0" stop-color="#8FA3B5" stop-opacity=".2"/><stop offset=".6" stop-color="#8FA3B5" stop-opacity=".07"/><stop offset="1" stop-color="#8FA3B5" stop-opacity="0"/></radialGradient>'
            '%s</defs>'
            '<rect width="%d" height="%d" fill="url(#sky)"/>'
            '<rect width="%d" height="%d" fill="url(#glow)"/>'
            '<rect width="%d" height="%d" fill="url(#gloom)"/>'
            '%s%s%s%s%s%s%s%s%s</svg>'
            % (W, H, NAVY, NAVY, NAVY, AMBER, HAWK, W, H, W, H, W, H,
               weather(), thresholds(), clouds(), billows(), scenes(), labels(), ground(), tape(), band()))


HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Read the cloud | UK Airshow Guide poster 07</title>
<link rel="stylesheet" href="https://use.typekit.net/vyp4rci.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500;1,700&family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="kit.css">
<style>
.slide{background:#48657F;color:#fff}
.art text.m{font-family:var(--m)}
.art text.c{font-family:var(--c)}
.eyebrow{font-family:var(--m);font-weight:600;font-size:14px;line-height:1;letter-spacing:3.4px;text-transform:uppercase;color:var(--red)}
.head{font-family:var(--c);font-weight:900;font-style:italic;font-size:176px;line-height:.9;letter-spacing:-1.5px;text-transform:uppercase;color:var(--navy)}
.sub{font-family:var(--f);font-weight:600;font-size:31px;line-height:1.2;color:var(--navy2)}
.quote{font-family:var(--c);font-weight:700;font-style:italic;font-size:33px;line-height:1.1;color:var(--navy)}
.p-t{font-family:var(--c);font-weight:800;font-style:italic;font-size:40px;line-height:1;letter-spacing:.5px;text-transform:uppercase;color:#fff}
.p-h{font-family:var(--m);font-weight:600;font-size:13px;line-height:1;letter-spacing:2.2px;text-transform:uppercase;color:var(--amber)}
.p-d{font-family:var(--f);font-weight:500;font-size:17px;line-height:1.42;color:var(--soft)}
.p-n{font-family:var(--f);font-weight:500;font-style:italic;font-size:15px;line-height:1.42;color:#8FA3B5}
.n-l{font-family:var(--m);font-weight:600;font-size:11px;line-height:1;letter-spacing:2.4px;text-transform:uppercase;color:var(--amber)}
.n-d{font-family:var(--f);font-weight:500;font-size:14.5px;line-height:1.4;color:var(--soft)}
</style>
</head>
<body>
<div class="slide">
'''

LIVE = '''
<div data-live class="eyebrow" style="left:72px;top:82px">What to expect when the weather is poor</div>
<div data-live class="head" style="left:64px;top:106px">Read the cloud.</div>
<div data-live class="sub" style="left:72px;top:274px">Rain rarely cancels a show, but cloud changes the flying.</div>

<div data-live class="quote" style="left:934px;top:640px">Low cloud does not<br>stop the flying.<br>It brings it down<br>to where you<br>can see it.</div>

<div data-live class="p-t" style="left:116px;top:1341px">Full show</div>
<div data-live class="p-h" style="left:72px;top:1396px">Cloud above 5,500 ft</div>
<div data-live class="p-d" style="left:70px;top:1420px">Loops, vertical breaks and the big formation shapes.<br>This is the day everyone hopes for.</div>
<div data-live class="p-n" style="left:70px;top:1482px">These heights are the ones the Red Arrows use,<br>and most display teams work in a similar way.</div>

<div data-live class="p-t" style="left:611px;top:1341px">Rolling show</div>
<div data-live class="p-h" style="left:567px;top:1396px">Cloud from 2,500 to 5,500 ft</div>
<div data-live class="p-d" style="left:565px;top:1420px">The loops come out and wingovers<br>and rolls go in. Still a full length<br>display, just a lower one.</div>

<div data-live class="p-t" style="left:941px;top:1341px">Flat show</div>
<div data-live class="p-h" style="left:897px;top:1396px">Cloud from 1,000 to 2,500 ft</div>
<div data-live class="p-d" style="left:895px;top:1420px">Fast passes, crossovers and<br>formation changes along the<br>display line. Loud, close and<br>great for photos.</div>

<img class="logo" src="img/uk-airshow-guide-logo.png" alt="UK Airshow Guide" style="left:70px;top:1549px;width:266px">
<div data-live class="n-l" style="left:374px;top:1553px">Cloud base</div>
<div data-live class="n-d" style="left:372px;top:1571px">The height above the airfield of the lowest cloud<br>covering more than half of the sky.</div>
<div data-live class="n-l" style="left:374px;top:1625px">On the day</div>
<div data-live class="n-d" style="left:372px;top:1643px">I would check the show's own social pages from about 09:00.<br>That is where changes to the programme are posted first.</div>
<div data-live class="so-tag" style="right:70px;top:1622px;color:var(--mint)">Plan your airshow series 07 / 10</div>
<div data-live class="so-url" style="right:70px;top:1650px;color:#fff">ukairshowguide.co.uk</div>
</div>
</body>
</html>
'''

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '07-read-the-cloud.html')
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write(HEAD + svg() + LIVE)
    print('wrote', os.path.normpath(out))
