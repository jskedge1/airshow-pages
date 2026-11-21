#!/usr/bin/env python3
"""Poster 10, LOOK UP. Writes posters/10-look-up.html.

The logo's swooshes become three ribbons of display smoke: they underline UP., turn
and climb behind the K to three jets in a vic. Everything that needs geometry (the
tapered ribbons, the sun rays, the big wheel, the pier, the crowd) is computed here,
so the poster can be re-run after any change:

    python3 -I build/gen_10.py            (from posters/)
    python3 -I build/gen_10.py --debug    (overlays guides for the type and the smoke)
"""
import math
import os
import random
import sys

DEBUG = "--debug" in sys.argv
W, H = 1240, 1754
FR = 34                                   # paper border outside the keyline frame
NAVY, PAPER, CREAM = "#13293C", "#F6F1E6", "#F6F1E6"
SKY_TOP, SKY_LOW = "#F2E7CE", "#F7EFDD"   # the printed panel, a touch warmer than the border

# ribbons, in the swoosh logo's own colours: (base, light, dark)
TEAL = ("#07B1BA", "#63D2D5", "#0A8B95")
BLUE = ("#0C7FE8", "#5DAEF4", "#0A61BA")
RED = ("#E6212F", "#F5696A", "#BE1429")
COLS = (TEAL, BLUE, RED)

# ---------------------------------------------------------------- headline metrics
# Barlow Condensed Black Italic, measured in Chromium: cap height .703 em; with
# line-height .8 the first cap top sits .114 em below the top of the box.
S = 540                                   # headline size
CAP_TOP = 250
HEAD_TOP = CAP_TOP - 0.114 * S
BASE1 = CAP_TOP + 0.703 * S               # baseline of LOOK
BASE2 = BASE1 + 0.8 * S                   # baseline of UP.
HEAD_LEFT = 72

# ---------------------------------------------------------------- scene levels
HORIZON = 1440
BAND_TOP = 1502                           # top of the navy crowd band


def f1(v):
    s = "%.1f" % v
    return s[:-2] if s.endswith(".0") else s


def pts(seq):
    return " ".join(f1(x) + "," + f1(y) for x, y in seq)


def poly(seq, fill, extra=""):
    return '<polygon points="%s" fill="%s"%s/>' % (pts(seq), fill, extra)


def pathd(seq, close=True):
    return "M" + " L".join(f1(x) + " " + f1(y) for x, y in seq) + ("Z" if close else "")


def smooth(a, b, x):
    x = max(0.0, min(1.0, (x - a) / (b - a)))
    return x * x * (3 - 2 * x)


def ease(x, p=2.0):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** p


# ---------------------------------------------------------------- the smoke
# The reference line is the upper edge of the whole band. It runs level under UP.
# like an underline, turns through about 80 degrees and climbs straight to the jets.
REF_X0, REF_Y0 = -190.0, BASE2 + 34.0
TH0, TH1 = math.radians(0.5), math.radians(79.0)   # the climb runs parallel to the italic stems
LT = 650.0                                # length of the turn
END = (986.0, 158.0)                      # where the upper edge of the band ends, abeam the leader's tail
DS = 6.0


def _turn(n=2000):
    x = y = 0.0
    for k in range(n):
        s = (k + 0.5) / n
        th = TH0 + (TH1 - TH0) * (s * s * s * (s * (6 * s - 15) + 10))
        x += math.cos(th) * LT / n
        y += math.sin(th) * LT / n
    return x, y


_TX, _TY = _turn()
# two straight runs either side of the turn: solve their lengths so the line hits END
_det = math.cos(TH0) * math.sin(TH1) - math.sin(TH0) * math.cos(TH1)
_dx, _dy = END[0] - REF_X0 - _TX, REF_Y0 - END[1] - _TY
LA = (_dx * math.sin(TH1) - _dy * math.cos(TH1)) / _det
LF = (_dy * math.cos(TH0) - _dx * math.sin(TH0)) / _det
S0, S1 = 129.0, 54.0                      # lane spacing at the near end and at the jets
FMIN, FMAX, FDIST = 0.12, 0.93, 880.0     # smoke width as a share of its lane, and how fast it fills out
STAGGER = 54.0                            # the wingmen sit this far behind the leader
NOISE_AMP = 0.042                         # billow on the ribbon edges, as a share of the lane


def build_ref():
    x, y, l = REF_X0, REF_Y0, 0.0
    out = [(x, y, TH0)]
    total = LA + LT + LF
    while l < total - 1e-6:
        mid = l + DS / 2
        if mid < LA:
            th = TH0
        elif mid < LA + LT:
            s = (mid - LA) / LT
            th = TH0 + (TH1 - TH0) * (s * s * s * (s * (6 * s - 15) + 10))
        else:
            th = TH1
        x += math.cos(th) * DS
        y -= math.sin(th) * DS
        l += DS
        out.append((x, y, th))
    return out, total


REF, LTOT = build_ref()
M = len(REF) - 1


def lane_s(i):
    return S1 + (S0 - S1) * (1 - i / M) ** 1.08


def normal(i):
    th = REF[i][2]
    return (math.sin(th), math.cos(th))   # on the right of the flight path


def at(i, off):
    n = normal(i)
    return (REF[i][0] + n[0] * off, REF[i][1] + n[1] * off)


# perspective corrected distance, so the billows shrink as the smoke gets further away
Q = [0.0]
for _i in range(1, M + 1):
    Q.append(Q[-1] + DS / lane_s(_i))

random.seed(27)
PHASES = [[random.uniform(0, 6.283) for _ in range(3)] for _ in range(4)]


def noise(j, q):
    p = PHASES[j]
    return 0.58 * math.sin(6.283 * q / 1.9 + p[0]) + 0.3 * math.sin(6.283 * q / 1.07 + p[1]) + 0.12 * math.sin(6.283 * q / 0.53 + p[2])


def lane_end(idx):
    return LTOT if idx == 1 else LTOT - STAGGER


def lane_edges(idx):
    """Upper and lower edge of one ribbon as offsets from the reference line."""
    rows = []
    lend = lane_end(idx)
    for i in range(M + 1):
        d = lend - i * DS
        if d < 0:
            break
        s = lane_s(i)
        f = FMIN + (FMAX - FMIN) * ease(d / FDIST, 2.1)
        amp = NOISE_AMP * s * smooth(300, 1150, d)
        c = (idx + 0.5) * s
        rows.append((i, c - 0.5 * f * s + noise(idx, Q[i]) * amp, c + 0.5 * f * s + noise(idx + 1, Q[i]) * amp, d))
    return rows


def band(rows, a, b, dmin=0.0, fade=1.0):
    """A sub band of a ribbon between the fractions a and b of its width (0 = upper edge)."""
    top, bot = [], []
    for i, up, lo, d in rows:
        if d < dmin:
            continue
        r = smooth(dmin, dmin + fade, d) if fade > 1 else 1.0
        mid = (a + b) / 2.0
        aa, bb = mid + (a - mid) * r, mid + (b - mid) * r
        top.append(at(i, up + (lo - up) * aa))
        bot.append(at(i, up + (lo - up) * bb))
    return top + bot[::-1]


def ribbon_svg(idx):
    rows = lane_edges(idx)
    base, light, dark = COLS[idx]
    o = ['<g id="smoke%d">' % idx]
    o.append('<path d="%s" fill="%s" stroke="%s" stroke-width="2.2" stroke-opacity=".3" stroke-linejoin="round"/>' % (pathd(band(rows, 0, 1)), base, base))
    # a lit shoulder, a bright core streak and a shaded underside: three flat tones, like a litho print
    o.append('<path d="%s" fill="%s" fill-opacity=".9"/>' % (pathd(band(rows, 0.085, 0.30, 150, 520)), light))
    o.append('<path d="%s" fill="#fff" fill-opacity=".36"/>' % pathd(band(rows, 0.125, 0.165, 330, 700)))
    o.append('<path d="%s" fill="%s" fill-opacity=".92"/>' % (pathd(band(rows, 0.73, 0.965, 210, 620)), dark))
    o.append('<path d="%s" fill="%s" fill-opacity=".5"/>' % (pathd(band(rows, 0.52, 0.555, 420, 800)), dark))
    o.append("</g>")
    return "\n".join(o)


def jets_svg():
    """The site's own top view Hawk (forum-planes.js), in navy, nose along the flight path."""
    wings = ("M58 46.4 L43 17 L36.5 17 L41 46.4 Z M58 53.6 L43 83 L36.5 83 L41 53.6 Z "
             "M15 47.2 L7.5 36 L3.8 36 L6.5 47.2 Z M15 52.8 L7.5 64 L3.8 64 L6.5 52.8 Z")
    body = ("M100 50 C97 46.96 90 45.22 82 44.64 L22 44.78 L7 45.94 L3 48.55 L3 51.45 L7 54.06 "
            "L22 55.22 L82 55.37 C90 54.79 97 53.05 100 50 Z")
    out = []
    sc = 0.88
    for idx in range(3):
        i = min(M, int(round(lane_end(idx) / DS)))
        x, y = at(i, (idx + 0.5) * lane_s(i))
        ang = -math.degrees(REF[i][2])
        out.append('<g transform="translate(%s %s) rotate(%s) scale(%s) translate(-4 -50)">' % (f1(x), f1(y), f1(ang), sc))
        out.append('<path d="%s" fill="%s"/><path d="%s" fill="%s"/>' % (wings, NAVY, body, NAVY))
        out.append('<path d="M43 17 L36.5 17 L37.4 22 L45.4 22 Z M43 83 L36.5 83 L37.4 78 L45.4 78 Z" fill="%s" fill-opacity=".92"/>' % CREAM)
        out.append('<path d="M66 47.3 L30 48.3 L30 51.7 L66 52.7 Z" fill="%s" fill-opacity=".2"/>' % CREAM)
        out.append('<ellipse cx="77" cy="50" rx="8.6" ry="2.7" fill="#0A1824"/><ellipse cx="79.2" cy="49.2" rx="3.9" ry="0.95" fill="#fff" fill-opacity=".6"/>')
        out.append("</g>")
    return "\n".join(out)


# ---------------------------------------------------------------- sky
SUN = (1078.0, 204.0)
SUN_R = 236.0


def rays_svg():
    out = []
    n = 46
    step = 360.0 / n
    for j in range(n):
        a0 = math.radians(j * step + 2.0 - step * 0.2)
        a1 = math.radians(j * step + 2.0 + step * 0.2)
        r0, r1 = SUN_R + 44, 2600
        out.append(pts([(SUN[0] + r0 * math.cos(a0), SUN[1] + r0 * math.sin(a0)), (SUN[0] + r1 * math.cos(a0), SUN[1] + r1 * math.sin(a0)),
                        (SUN[0] + r1 * math.cos(a1), SUN[1] + r1 * math.sin(a1)), (SUN[0] + r0 * math.cos(a1), SUN[1] + r0 * math.sin(a1))]))
    return '<g fill="#fff" fill-opacity=".36">' + "".join('<polygon points="%s"/>' % p for p in out) + "</g>"


# ---------------------------------------------------------------- the seafront
def wheel_svg(cx, cy, r):
    o = ['<g fill="none" stroke="%s" stroke-linecap="round">' % NAVY]
    o.append('<circle cx="%s" cy="%s" r="%s" stroke-width="5.5"/>' % (cx, cy, r))
    o.append('<circle cx="%s" cy="%s" r="%s" stroke-width="2"/>' % (cx, cy, f1(r * 0.84)))
    o.append('<circle cx="%s" cy="%s" r="%s" stroke-width="1.6"/>' % (cx, cy, f1(r * 0.36)))
    n = 20
    for j in range(n):
        a = math.radians(j * 360.0 / n + 9)
        o.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke-width="1.7"/>' % (cx, cy, f1(cx + r * math.cos(a)), f1(cy + r * math.sin(a))))
    o.append("</g>")
    o.append('<g fill="%s">' % NAVY)
    for j in range(n):
        a = math.radians(j * 360.0 / n + 9)
        gx, gy = cx + (r + 1) * math.cos(a), cy + (r + 1) * math.sin(a)
        o.append('<path d="M%s %s h13 v9 a4 4 0 0 1 -4 4 h-5 a4 4 0 0 1 -4 -4 z"/>' % (f1(gx - 6.5), f1(gy + 3)))
        o.append('<rect x="%s" y="%s" width="1.6" height="5"/>' % (f1(gx - 0.8), f1(gy - 1)))
    o.append(poly([(cx - 5, cy), (cx + 5, cy), (cx + 62, BAND_TOP + 8), (cx + 50, BAND_TOP + 8), (cx, cy + 22), (cx - 50, BAND_TOP + 8), (cx - 62, BAND_TOP + 8)], NAVY))
    o.append('<circle cx="%s" cy="%s" r="11"/>' % (cx, cy))
    o.append("</g>")
    o.append('<circle cx="%s" cy="%s" r="3.6" fill="%s"/>' % (cx, cy, CREAM))
    return "\n".join(o)


def pier_svg(x0, x1):
    deck = HORIZON - 30
    o = ['<g fill="%s">' % NAVY]
    o.append('<rect x="%s" y="%s" width="%s" height="6"/>' % (x0, deck, x1 - x0))
    o.append('<rect x="%s" y="%s" width="%s" height="1.6"/>' % (x0, deck - 9, x1 - x0 - 4))          # hand rail
    x = x0 + 5
    while x < x1 - 2:
        o.append('<rect x="%s" y="%s" width="1.2" height="9"/>' % (f1(x), deck - 9))
        x += 9
    x, j = x0 + 12, 0
    while x < x1 - 6:                                                                                # piles and bracing
        o.append('<rect x="%s" y="%s" width="3" height="%s"/>' % (f1(x), deck + 6, HORIZON - deck + 8))
        if j % 2 == 0 and x + 22 < x1 - 6:
            o.append('<path d="M%s %s L%s %s M%s %s L%s %s" stroke="%s" stroke-width="1.3" fill="none"/>' % (
                f1(x + 1.5), deck + 7, f1(x + 23.5), HORIZON + 2, f1(x + 23.5), deck + 7, f1(x + 1.5), HORIZON + 2, NAVY))
        x += 22
        j += 1
    for lx in range(int(x0 + 46), int(x1 - 150), 74):                                               # lamp standards
        o.append('<rect x="%s" y="%s" width="1.8" height="26"/>' % (lx, deck - 35))
        o.append('<circle cx="%s" cy="%s" r="2.6"/><circle cx="%s" cy="%s" r="2.6"/>' % (lx - 3.4, deck - 35, lx + 5.2, deck - 35))
    for kx in (x0 + 118, x0 + 236):                                                                 # two kiosks part way along
        o.append('<rect x="%s" y="%s" width="30" height="17"/>' % (kx, deck - 17))
        o.append(poly([(kx - 4, deck - 17), (kx + 15, deck - 31), (kx + 34, deck - 17)], NAVY))
        o.append('<rect x="%s" y="%s" width="1.4" height="9"/>' % (kx + 14.3, deck - 40))
    px, pw = x1 - 132, 118                                                                          # the pavilion at the seaward end
    o.append('<rect x="%s" y="%s" width="%s" height="34"/>' % (px, deck - 34, pw))
    o.append('<rect x="%s" y="%s" width="%s" height="5"/>' % (px - 5, deck - 38, pw + 10))
    o.append('<path d="M%s %s a34 27 0 0 1 68 0 z"/>' % (px + pw / 2 - 34, deck - 38))
    o.append('<rect x="%s" y="%s" width="2.2" height="24"/>' % (px + pw / 2 - 1.1, deck - 88))
    o.append(poly([(px + pw / 2 + 1.1, deck - 88), (px + pw / 2 + 17, deck - 83.5), (px + pw / 2 + 1.1, deck - 79)], NAVY))
    for tx in (px - 2, px + pw - 16):
        o.append('<rect x="%s" y="%s" width="18" height="52"/>' % (tx, deck - 52))
        o.append('<path d="M%s %s a11 12 0 0 1 22 0 z"/>' % (tx - 2, deck - 52))
        o.append('<rect x="%s" y="%s" width="1.6" height="12"/>' % (tx + 8.2, deck - 75))
    o.append("</g>")
    o.append('<g fill="%s">' % SKY_LOW)                                                             # lit arches
    for ax in range(7):
        o.append('<path d="M%s %s v-11 a3.4 3.4 0 0 1 6.8 0 v11 z"/>' % (f1(px + 19 + ax * 12.6), deck - 8))
    o.append("</g>")
    return "\n".join(o)


def headland_svg():
    o = []
    top = HORIZON - 96
    p = "M%s %s L%s %s C%s %s %s %s %s %s C%s %s %s %s %s %s L%s %s Z" % (
        W, HORIZON + 4, W, top - 8, 1170, top - 6, 1132, top + 4, 1100, top + 26,
        1066, top + 50, 1046, top + 78, 1010, HORIZON + 1, W, HORIZON + 4)
    o.append('<path d="%s" fill="%s"/>' % (p, NAVY))
    # the lighthouse stands in the sea off the point
    lx, base, ht = 944.0, HORIZON + 3.0, 104.0
    o.append('<path d="M%s %s h34 l-4 -8 h-26 z" fill="%s"/>' % (lx - 17, base, NAVY))
    o.append(poly([(lx - 11, base - 8), (lx + 11, base - 8), (lx + 6.6, base - ht), (lx - 6.6, base - ht)], NAVY))
    for a, b in ((0.26, 0.44), (0.62, 0.80)):                                                       # two pale hoops
        wa, wb = 11 - 4.4 * a, 11 - 4.4 * b
        ya, yb = base - 8 - (ht - 8) * a, base - 8 - (ht - 8) * b
        o.append(poly([(lx - wa, ya), (lx + wa, ya), (lx + wb, yb), (lx - wb, yb)], SKY_LOW))
    o.append('<rect x="%s" y="%s" width="21" height="3.4" fill="%s"/>' % (lx - 10.5, base - ht - 3.2, NAVY))
    o.append('<rect x="%s" y="%s" width="11" height="12" fill="%s"/>' % (lx - 5.5, base - ht - 15, NAVY))
    o.append('<rect x="%s" y="%s" width="6.6" height="7" fill="#F5B942"/>' % (lx - 3.3, base - ht - 13))
    o.append('<path d="M%s %s a7.2 6.4 0 0 1 14.4 0 z" fill="%s"/>' % (lx - 7.2, base - ht - 15, NAVY))
    o.append('<rect x="%s" y="%s" width="1.4" height="8" fill="%s"/>' % (lx - 0.7, base - ht - 28, NAVY))
    return "\n".join(o)


def gulls_svg():
    o = ['<g fill="none" stroke="%s" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' % NAVY]
    for gx, gy, sc in ((1066, 1248, 1.0), (1118, 1216, 0.78), (1022, 1282, 0.62)):
        o.append('<path d="M%s %s q%s %s %s %s q%s %s %s %s"/>' % (f1(gx - 13 * sc), f1(gy - 2 * sc), f1(7 * sc), f1(-6 * sc), f1(13 * sc), f1(2 * sc), f1(6 * sc), f1(-8 * sc), f1(13 * sc), f1(-2 * sc)))
    o.append("</g>")
    return "\n".join(o)


def crowd_svg():
    """Backs of heads along the top of the navy band, a few arms pointing at the jets."""
    rnd = random.Random(2027)
    o = ['<g fill="%s" stroke="%s" stroke-linecap="round" stroke-width="0">' % (NAVY, NAVY)]
    o.append('<rect x="0" y="%s" width="%s" height="%s"/>' % (BAND_TOP, W, H - BAND_TOP))
    people, x = [], FR - 4.0
    while x < W - FR + 12:
        kid = rnd.random() < 0.15
        r = rnd.uniform(7.2, 8.4) if kid else rnd.uniform(10.4, 13.8)
        people.append([x, r, kid])
        x += r * rnd.uniform(2.5, 3.5)
    pointers = set()
    for want in (334.0, 548.0, 716.0, 898.0, 1108.0):
        pointers.add(min(range(len(people)), key=lambda j: abs(people[j][0] - want) + (99 if people[j][2] else 0)))
    for j, (x, r, kid) in enumerate(people):
        sink = rnd.uniform(0, 7) + (9 if kid else 0)                 # some stand a little lower
        sh = BAND_TOP + sink                                          # shoulder line
        hy = sh - r * 1.5                                             # head centre
        o.append('<ellipse cx="%s" cy="%s" rx="%s" ry="%s"/>' % (f1(x), f1(sh + r * 0.35), f1(r * 2.0), f1(r * 0.92)))
        o.append('<rect x="%s" y="%s" width="%s" height="%s"/>' % (f1(x - r * 0.42), f1(hy), f1(r * 0.84), f1(r * 1.3)))
        o.append('<circle cx="%s" cy="%s" r="%s"/>' % (f1(x), f1(hy), f1(r)))
        hat = rnd.random()
        if hat < 0.11 and not kid:                                    # sun hat
            o.append('<ellipse cx="%s" cy="%s" rx="%s" ry="%s"/>' % (f1(x), f1(hy - r * 0.3), f1(r * 1.55), f1(r * 0.3)))
        elif hat < 0.2:                                               # cap peak
            o.append('<rect x="%s" y="%s" width="%s" height="%s" rx="1.6"/>' % (f1(x + r * 0.5), f1(hy - r * 0.55), f1(r * 1.0), f1(r * 0.3)))
        if j in pointers:
            a1 = math.radians(rnd.uniform(24, 40))                    # upper arm, from vertical
            a2 = a1 - math.radians(rnd.uniform(4, 13))                # forearm straightens towards the jets
            l1, l2 = r * 2.0, r * 1.9
            sx, sy = x + r * 1.45, sh - r * 0.15
            ex, ey = sx + l1 * math.sin(a1), sy - l1 * math.cos(a1)
            hx, hy2 = ex + l2 * math.sin(a2), ey - l2 * math.cos(a2)
            o.append('<path d="M%s %s L%s %s" stroke-width="%s" fill="none"/>' % (f1(sx), f1(sy), f1(ex), f1(ey), f1(r * 0.62)))
            o.append('<path d="M%s %s L%s %s" stroke-width="%s" fill="none"/>' % (f1(ex), f1(ey), f1(hx), f1(hy2), f1(r * 0.5)))
            o.append('<path d="M%s %s L%s %s" stroke-width="%s" fill="none"/>' % (f1(hx), f1(hy2), f1(hx + r * 0.75 * math.sin(a2)), f1(hy2 - r * 0.75 * math.cos(a2)), f1(r * 0.3)))
    o.append("</g>")
    return "\n".join(o)


def sea_svg():
    o = ['<rect x="0" y="%s" width="%s" height="%s" fill="#BFE2DD"/>' % (HORIZON, W, BAND_TOP - HORIZON + 8)]
    o.append('<rect x="0" y="%s" width="%s" height="2.2" fill="#fff" fill-opacity=".7"/>' % (HORIZON, W))
    rnd = random.Random(5)
    for yy in (HORIZON + 14, HORIZON + 27, HORIZON + 41):
        x = FR + rnd.uniform(0, 60)
        while x < W - FR:
            ln = rnd.uniform(26, 90)
            o.append('<rect x="%s" y="%s" width="%s" height="1.7" rx=".8" fill="#fff" fill-opacity=".72"/>' % (f1(x), yy, f1(ln)))
            x += ln + rnd.uniform(40, 150)
    return "\n".join(o)


def report():
    """Where the top of the smoke runs under the type, for tuning."""
    rows = lane_edges(0)
    top = [at(i, up) for i, up, lo, d in rows]
    msg = []
    for want in (72, 200, 340, 430, 540, 600, 657, 760, 880):
        best = min(top, key=lambda p: abs(p[0] - want))
        msg.append("x%d:y%.0f" % (want, best[1]))
    print("smoke top edge", " ".join(msg), "| baseline UP %.0f, baseline LOOK %.0f" % (BASE2, BASE1))
    print("reference ends at (%.0f, %.0f), heading %.1f deg, length %.0f" % (REF[-1][0], REF[-1][1], math.degrees(REF[-1][2]), LTOT))
    for i in (0, M // 4, M // 2, 3 * M // 4, M):
        print("  outer edge of band at sample %d: (%.0f, %.0f)" % ((i,) + at(i, 3 * lane_s(i))))


# ---------------------------------------------------------------- assemble
def build():
    clip = '<clipPath id="panel"><rect x="%s" y="%s" width="%s" height="%s"/></clipPath>' % (FR, FR, W - 2 * FR, H - 2 * FR)
    art = []
    art.append('<svg class="art" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg">' % (W, H))
    art.append("<defs>" + clip)
    art.append('<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset=".8" stop-color="%s"/></linearGradient>' % (SKY_TOP, SKY_LOW))
    art.append('<radialGradient id="glow" cx="%s" cy="%s" r="%s" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FBE3A2" stop-opacity=".9"/><stop offset=".5" stop-color="#FBE3A2" stop-opacity=".32"/><stop offset="1" stop-color="#FBE3A2" stop-opacity="0"/></radialGradient>' % (SUN[0], SUN[1], SUN_R * 3.2))
    art.append("\n".join(ribbon_svg(i) for i in range(3)))
    art.append("</defs>")
    art.append('<rect width="%d" height="%d" fill="%s"/>' % (W, H, PAPER))
    art.append('<g clip-path="url(#panel)">')
    art.append('<rect width="%d" height="%d" fill="url(#sky)"/>' % (W, H))
    art.append('<rect width="%d" height="%d" fill="url(#glow)"/>' % (W, H))
    art.append(rays_svg())
    art.append('<circle cx="%s" cy="%s" r="%s" fill="#FBE0A0" fill-opacity=".55"/>' % (SUN[0], SUN[1], SUN_R + 20))
    art.append('<circle cx="%s" cy="%s" r="%s" fill="#FCE3A6"/>' % (SUN[0], SUN[1], SUN_R))
    art.append('<use href="#smoke0"/><use href="#smoke1"/><use href="#smoke2"/>')
    art.append(jets_svg())
    art.append(sea_svg())
    art.append(headland_svg())
    art.append(gulls_svg())
    art.append(pier_svg(418, 808))
    art.append(wheel_svg(196, 1352, 106))
    art.append(crowd_svg())
    for j, c in enumerate((TEAL[0], BLUE[0], RED[0])):                # the ribbons in miniature, in the band
        art.append('<rect x="%s" y="1611" width="30" height="4.5" fill="%s"/>' % (W - 70 - 30 * (3 - j) - 5 * (2 - j), c))
    art.append("</g>")
    art.append("</svg>")

    front = ['<svg class="art weave" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg">' % (W, H)]
    if DEBUG:
        for yy in (CAP_TOP, BASE1, BASE2 - 0.703 * S, BASE2, HORIZON, BAND_TOP):
            front.append('<line x1="0" x2="%d" y1="%s" y2="%s" stroke="#f0f" stroke-width="1"/>' % (W, f1(yy), f1(yy)))
        front.append('<path d="%s" fill="none" stroke="#000" stroke-width="1.5" stroke-dasharray="6 6"/>' % pathd([(p[0], p[1]) for p in REF], False))
        for xx in (70, W - 70):
            front.append('<line y1="0" y2="%d" x1="%s" x2="%s" stroke="#0a0" stroke-width="1"/>' % (H, xx, xx))
    front.append("</svg>")

    grain = []
    grain.append('<svg class="art grain" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg">' % (W, H))
    grain.append('<defs><filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">'
                 '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="11" stitchTiles="stitch"/>'
                 '<feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 7 -4.35"/></filter>'
                 '<filter id="mottle" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">'
                 '<feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves="3" seed="4"/>'
                 '<feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.16  0 0 0 1.5 -0.62"/></filter></defs>')
    grain.append('<rect width="%d" height="%d" filter="url(#mottle)" opacity=".1"/>' % (W, H))
    grain.append('<rect width="%d" height="%d" filter="url(#grain)" opacity=".42"/>' % (W, H))
    grain.append("</svg>")

    frame = ('<svg class="art keyline" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg">'
             '<rect x="%s" y="%s" width="%s" height="%s" fill="none" stroke="%s" stroke-width="2.4"/></svg>') % (
        W, H, FR, FR, W - 2 * FR, H - 2 * FR, NAVY)

    css = """
.slide{background:%(paper)s;color:var(--navy)}
.weave,.grain,.keyline{pointer-events:none}
.grain{mix-blend-mode:multiply}
.head{left:%(hl)spx;top:%(ht)spx;font-family:var(--c);font-weight:900;font-style:italic;font-size:%(S)spx;line-height:.8;
  letter-spacing:0;color:var(--navy);text-transform:uppercase}
.strap{right:70px;top:1520px;font-family:var(--c);font-weight:700;font-size:46px;line-height:1;letter-spacing:.2px;color:%(cream)s;text-align:right}
.support{right:70px;top:1576px;font-family:var(--f);font-weight:500;font-size:21px;line-height:1;letter-spacing:.2px;color:var(--soft);text-align:right}
.so-url{right:70px;top:1629px;font-size:38px;color:#fff;text-align:right}
.so-tag{right:70px;top:1680px;color:var(--mint);text-align:right}
""" % {"paper": PAPER, "hl": HEAD_LEFT, "ht": f1(HEAD_TOP), "S": S, "cream": CREAM}

    html = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Look up. UK Airshow Guide poster 10 of 10</title>
<link rel="stylesheet" href="https://use.typekit.net/vyp4rci.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500;1,700&family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="kit.css">
<style>%(css)s</style>
</head>
<body>
<!-- Generated by build/gen_10.py. Edit the generator, not this file. -->
<div class="slide">
%(art)s
<div data-live class="head">Look<br>up.</div>
%(front)s
<div data-live class="strap">Every UK airshow, one easy guide.</div>
<div data-live class="support">Find your show, plan the day, enjoy the flying.</div>
<div data-live class="so-url">ukairshowguide.co.uk</div>
<div data-live class="so-tag">Plan your airshow series 10 / 10</div>
%(grain)s
<img class="logo" src="img/uk-airshow-guide-logo.png" alt="UK Airshow Guide" style="left:66px;top:1527px;width:330px">
%(frame)s
</div>
</body>
</html>
""" % {"css": css, "art": "\n".join(art), "front": "\n".join(front), "grain": "\n".join(grain), "frame": frame}
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "10-look-up.html")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(html)
    print("wrote", os.path.normpath(out), "%.0f KB" % (len(html) / 1024.0))
    report()


if __name__ == "__main__":
    build()
