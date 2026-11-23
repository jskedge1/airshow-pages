#!/usr/bin/env python3
"""Poster 08, Don't freeze the prop: writes posters/08-prop-blur.html.

Every propeller disc is drawn from real numbers. A four blade propeller turning at
RPM sweeps  360 x (RPM / 60) x exposure  degrees while the shutter is open. The blur is
made by stacking many faint copies of one blade across that sweep, so a slow shutter
smears into a disc and a fast one leaves four sharp blades.

Run:  python3 -I build/gen_08.py   (from posters/)
"""
import math
import os

W, H = 1240, 1754
RPM = 1200.0
BLADES = 4
REF_W = 13.1          # angular width of one blade, in degrees, at 62 per cent of the radius

WARM = "#F6F0E2"
AMBER = "#F5B942"
RED = "#D74949"
MINT = "#5FE3D6"
SKY = "#00A6E2"
GREY = "#8FA9BB"


def sweep(den):
    return 360.0 * (RPM / 60.0) / den


def fmt_deg(a):
    return ("%.1f" % a).rstrip("0").rstrip(".") + "&deg;"


def polar(cx, cy, r, a):
    """a in degrees, clockwise from twelve o'clock."""
    t = math.radians(a)
    return cx + r * math.sin(t), cy - r * math.cos(t)


def arc(cx, cy, r, a0, a1):
    x0, y0 = polar(cx, cy, r, a0)
    x1, y1 = polar(cx, cy, r, a1)
    large = 1 if (a1 - a0) % 360 > 180 else 0
    return "M%.1f %.1f A%.1f %.1f 0 %d 1 %.1f %.1f" % (x0, y0, r, r, large, x1, y1)


def prop(cx, cy, R, den, n, tip_boost=2.2, phase=45.0):
    """One propeller: n faint copies of each blade spread over the sweep angle."""
    th = sweep(den)
    cover = min(1.0, REF_W / th)                    # share of the exposure a point sees a blade
    target = 0.95 * cover ** 0.72                   # displayed peak opacity (gamma lifted)
    k_ref = max(1.0, n * cover)                     # copies stacked over that point
    alpha = 1 - (1 - target) ** (1 / k_ref)
    a_tip = min(0.9, alpha * tip_boost)
    blades, tips = [], []
    for b in range(BLADES):
        c = phase + b * 360.0 / BLADES
        for i in range(n):
            a = c + (th * (i / (n - 1) - 0.5) if n > 1 else 0.0)
            tr = 'transform="translate(%.1f %.1f) rotate(%.2f) scale(%.2f)"' % (cx, cy, a, R)
            blades.append('<use href="#bl" %s/>' % tr)
            tips.append('<use href="#tp" %s/>' % tr)
    return ('<g fill="%s" opacity="%.4f">%s</g><g fill="%s" opacity="%.4f">%s</g>'
            % (WARM, 1.0, "".join(b.replace("/>", ' opacity="%.4f"/>' % alpha) for b in blades),
               AMBER, 1.0, "".join(t.replace("/>", ' opacity="%.4f"/>' % a_tip) for t in tips)))


# ------------------------------------------------------------------ hero: the viewfinder
FX0, FY0, FX1, FY1 = 70, 496, 1170, 1012          # frame
HX, HY = 620.0, 730.0                             # propeller hub
R_HERO = 200.0
K = R_HERO / 1.64                                 # px per metre (3.28 m propeller)
HERO_DEN = 160


def px(x, y):
    return HX + x * K, HY - y * K


def smooth_closed(pts):
    """Closed Catmull-Rom spline through pts (metres) as cubic Beziers in px."""
    p = [px(x, y) for x, y in pts]
    n = len(p)
    d = "M%.1f %.1f" % p[0]
    for i in range(n):
        p0, p1, p2, p3 = p[(i - 1) % n], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        d += "C%.1f %.1f %.1f %.1f %.1f %.1f" % (c1[0], c1[1], c2[0], c2[1], p2[0], p2[1])
    return d + "Z"


def mirror(half):
    """half: points down the right side from top centre to bottom centre."""
    return half + [(-x, y) for x, y in reversed(half[1:-1])]


def wing_lower(x):
    return -0.60 + math.tan(math.radians(6.2)) * (x - 0.40)


def wing_thick(x):
    u = max(0.0, 1 - ((x - 0.2) / 5.45) ** 2)
    return 0.33 * u ** 0.8


def wing(sign):
    xs = [0.36 + i * (5.64 - 0.36) / 44 for i in range(45)]
    top = [px(sign * x, wing_lower(x) + wing_thick(x)) for x in xs]
    bot = [px(sign * x, wing_lower(x)) for x in reversed(xs)]
    d = "M" + "L".join("%.1f %.1f" % q for q in top + bot) + "Z"
    edge = "M" + "L".join("%.1f %.1f" % q for q in top)
    return d, edge


WING_R, EDGE_R = wing(1)
WING_L, EDGE_L = wing(-1)

COWL = smooth_closed(mirror([(0, 0.50), (0.22, 0.46), (0.38, 0.27), (0.44, -0.05), (0.41, -0.38), (0.27, -0.62), (0, -0.70)]))
HOOD = smooth_closed(mirror([(0, 0.95), (0.17, 0.90), (0.28, 0.72), (0.27, 0.44), (0, 0.40)]))
SCREEN = smooth_closed(mirror([(0, 0.86), (0.11, 0.83), (0.18, 0.70), (0.17, 0.47), (0, 0.45)]))
FIN = smooth_closed(mirror([(0, 1.50), (0.035, 1.38), (0.045, 1.05), (0.04, 0.80), (0, 0.78)]))
TAIL = smooth_closed([(-1.64, 0.34), (-0.9, 0.385), (0, 0.39), (0.9, 0.385), (1.64, 0.34), (0.9, 0.315), (0, 0.31), (-0.9, 0.315)])
INTAKE = smooth_closed(mirror([(0, -0.68), (0.10, -0.70), (0.115, -0.80), (0.07, -0.87), (0, -0.88)]))


def radiator(sign):
    x0, x1 = 0.98, 1.52
    a = px(sign * x0, wing_lower(x0) + 0.03)
    b = px(sign * x1, wing_lower(x1) + 0.03)
    c = px(sign * x1, -0.90)
    d = px(sign * x0, -0.90)
    shell = "M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" % (a + b + c + d)
    ia = px(sign * (x0 + 0.05), wing_lower(x0) - 0.02)
    ib = px(sign * (x1 - 0.05), wing_lower(x1) - 0.02)
    ic = px(sign * (x1 - 0.05), -0.85)
    idd = px(sign * (x0 + 0.05), -0.85)
    hole = "M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" % (ia + ib + ic + idd)
    return shell, hole


RAD_R, RADH_R = radiator(1)
RAD_L, RADH_L = radiator(-1)

guns = []
for sign in (-1, 1):
    for gx, r_out, r_in in ((1.93, 0.075, 0.03), (2.20, 0.045, 0.018)):
        gy = wing_lower(gx) + wing_thick(gx) * 0.52
        cx, cy = px(sign * gx, gy)
        guns.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#254559"/><circle cx="%.1f" cy="%.1f" r="%.1f" fill="#050B11"/>'
                    % (cx, cy, r_out * K, cx, cy, r_in * K))
GUNS = "".join(guns)

exh = []
for sign in (-1, 1):
    cx, cy = px(sign * 0.455, 0.10)
    exh.append('<circle cx="%.1f" cy="%.1f" r="20" fill="url(#exglow)"/><ellipse cx="%.1f" cy="%.1f" rx="4.2" ry="7.5" fill="#0A1118"/>'
               '<ellipse cx="%.1f" cy="%.1f" rx="2" ry="4.4" fill="#FFB65A" opacity=".85"/>' % (cx, cy, cx, cy, cx, cy))
EXH = "".join(exh)

SPIN_R = 0.355 * K
HERO_PROP = prop(HX, HY, R_HERO, HERO_DEN, 110)
HERO_SWEEP = sweep(HERO_DEN)

# sweep call-out on the upper right wedge
ARC_R = R_HERO + 20
CALL_ARC = arc(HX, HY, ARC_R, 45 - HERO_SWEEP / 2, 45 + HERO_SWEEP / 2)
ta = polar(HX, HY, ARC_R, 45 - HERO_SWEEP / 2)
tb = polar(HX, HY, ARC_R, 45 + HERO_SWEEP / 2)
tick = lambda a: "M%.1f %.1f L%.1f %.1f" % (polar(HX, HY, ARC_R - 7, a) + polar(HX, HY, ARC_R + 7, a))
CALL_TICKS = tick(45 - HERO_SWEEP / 2) + tick(45 + HERO_SWEEP / 2)
lead0 = polar(HX, HY, ARC_R + 2, 45)
LEAD = "M%.1f %.1f L%.1f %.1f L%.1f %.1f" % (lead0[0], lead0[1], lead0[0] + 44, lead0[1] - 44, lead0[0] + 92, lead0[1] - 44)
CALL_X, CALL_Y = lead0[0] + 102, lead0[1] - 44

# viewfinder furniture
def bracket(x, y, sx, sy, n=34):
    return "M%.1f %.1f L%.1f %.1f L%.1f %.1f" % (x + sx * n, y, x, y, x, y + sy * n)


M_ = 22
BRACKETS = (bracket(FX0 + M_, FY0 + M_, 1, 1) + bracket(FX1 - M_, FY0 + M_, -1, 1)
            + bracket(FX0 + M_, FY1 - 72, 1, -1) + bracket(FX1 - M_, FY1 - 72, -1, -1))
AF = 54
AF_BOX = ("M%.1f %.1f h14 M%.1f %.1f v14 M%.1f %.1f h-14 M%.1f %.1f v14 M%.1f %.1f h14 M%.1f %.1f v-14 M%.1f %.1f h-14 M%.1f %.1f v-14"
          % (HX - AF, HY - AF, HX - AF, HY - AF, HX + AF, HY - AF, HX + AF, HY - AF,
             HX - AF, HY + AF, HX - AF, HY + AF, HX + AF, HY + AF, HX + AF, HY + AF))
BAR_Y = FY1 - 50
scale_ticks = "".join('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (942 + i * 13, BAR_Y + (20 if i % 3 == 0 else 24), 942 + i * 13, BAR_Y + 32)
                      for i in range(13))

# ------------------------------------------------------------------ comparison row
ROW_Y = 1166.0
R_ROW = 62.0
SPEEDS = [  # denominator, copies, accent, chip text
    (1600, 9, RED, "FROZEN"),
    (800, 16, "#B98A8A", "NEARLY FROZEN"),
    (320, 34, MINT, "SAFE START"),
    (250, 40, AMBER, "MORE BLUR"),
    (160, 52, AMBER, "MORE AGAIN"),
    (60, 110, SKY, "ROTOR SPEEDS"),
]
PITCH = 1100.0 / len(SPEEDS)
row = []
for i, (den, n, col, chip) in enumerate(SPEEDS):
    cx = 70 + PITCH * (i + 0.5)
    th = sweep(den)
    ring = R_ROW + 14
    ticks = "".join('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (polar(cx, ROW_Y, ring, a) + polar(cx, ROW_Y, ring + (7 if a % 90 == 0 else 4), a))
                    for a in range(0, 360, 15))
    hero = den == HERO_DEN
    row.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#0B1A27" stroke="%s" stroke-width="%s"/>'
               % (cx, ROW_Y, ring, col if hero else "#27425A", "2" if hero else "1.4"))
    row.append('<g stroke="#3A566E" stroke-width="1.2">%s</g>' % ticks)
    row.append(prop(cx, ROW_Y, R_ROW, den, n))
    row.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="url(#spin)"/><circle cx="%.1f" cy="%.1f" r="1.6" fill="#8FA9BB"/>'
               % (cx, ROW_Y, R_ROW * 0.215, cx, ROW_Y))
    row.append('<path d="%s" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round"/>' % (arc(cx, ROW_Y, ring - 6, 45 - th / 2, 45 + th / 2), col))
    row.append('<text class="sp" x="%.1f" y="%.1f" fill="%s">1/%d</text>' % (cx, ROW_Y + 118, "#FFFFFF" if col not in (RED,) else RED, den))
    row.append('<text class="chip" x="%.1f" y="%.1f" fill="%s">%s</text>' % (cx, ROW_Y + 142, col, chip))
    row.append('<text class="sw" x="%.1f" y="%.1f">%s OF TURN</text>' % (cx, ROW_Y + 162, fmt_deg(th)))
ROW = "".join(row)

# ------------------------------------------------------------------ assemble
svg = f'''<svg class="art" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
<defs>
<path id="bl" d="M-0.030 -0.19C-0.046 -0.31 -0.082 -0.45 -0.080 -0.62C-0.077 -0.80 -0.060 -0.93 -0.021 -0.988C-0.006 -1.004 0.006 -1.004 0.020 -0.988C0.054 -0.93 0.066 -0.80 0.063 -0.62C0.060 -0.45 0.044 -0.31 0.030 -0.19Z"/>
<path id="tp" d="M-0.0585 -0.925C-0.050 -0.957 -0.036 -0.978 -0.021 -0.988C-0.006 -1.004 0.006 -1.004 0.020 -0.988C0.038 -0.975 0.051 -0.955 0.0595 -0.925Z"/>
<clipPath id="frame"><rect x="{FX0}" y="{FY0}" width="{FX1 - FX0}" height="{FY1 - FY0}" rx="16"/></clipPath>
<linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D2334"/><stop offset=".55" stop-color="#123347"/><stop offset=".86" stop-color="#1B4A58"/><stop offset="1" stop-color="#2A5C60"/></linearGradient>
<radialGradient id="vglow" gradientUnits="userSpaceOnUse" cx="{HX}" cy="{HY + 40}" r="560"><stop offset="0" stop-color="#3C7A86" stop-opacity=".42"/><stop offset=".5" stop-color="#1D4A5C" stop-opacity=".18"/><stop offset="1" stop-color="#0B1A27" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" gradientUnits="userSpaceOnUse" cx="{HX}" cy="{(FY0 + FY1) / 2}" r="700"><stop offset=".55" stop-color="#04090E" stop-opacity="0"/><stop offset="1" stop-color="#04090E" stop-opacity=".72"/></radialGradient>
<radialGradient id="cloud"><stop offset="0" stop-color="#7FA9B5" stop-opacity=".2"/><stop offset=".6" stop-color="#5F8E9C" stop-opacity=".07"/><stop offset="1" stop-color="#5F8E9C" stop-opacity="0"/></radialGradient>
<linearGradient id="wingfill" gradientUnits="userSpaceOnUse" x1="0" y1="{HY + 0.0 * K}" x2="0" y2="{HY + 0.75 * K}"><stop offset="0" stop-color="#28485E"/><stop offset=".5" stop-color="#16303F"/><stop offset="1" stop-color="#0B1A25"/></linearGradient>
<linearGradient id="cowlfill" gradientUnits="userSpaceOnUse" x1="0" y1="{HY - 0.5 * K}" x2="0" y2="{HY + 0.7 * K}"><stop offset="0" stop-color="#35586E"/><stop offset=".35" stop-color="#1C3A4D"/><stop offset="1" stop-color="#0A1822"/></linearGradient>
<linearGradient id="glass" gradientUnits="userSpaceOnUse" x1="{HX - 30}" y1="{HY - 0.9 * K}" x2="{HX + 30}" y2="{HY - 0.42 * K}"><stop offset="0" stop-color="#8FC2CF"/><stop offset=".45" stop-color="#3F6F82"/><stop offset="1" stop-color="#173545"/></linearGradient>
<radialGradient id="spin" cx=".36" cy=".3" r=".9"><stop offset="0" stop-color="#5A7F98"/><stop offset=".35" stop-color="#27465B"/><stop offset="1" stop-color="#0A1822"/></radialGradient>
<radialGradient id="exglow"><stop offset="0" stop-color="#FFB65A" stop-opacity=".55"/><stop offset=".45" stop-color="#F5B942" stop-opacity=".14"/><stop offset="1" stop-color="#F5B942" stop-opacity="0"/></radialGradient>
<radialGradient id="disc" gradientUnits="userSpaceOnUse" cx="{HX}" cy="{HY}" r="{R_HERO}"><stop offset=".2" stop-color="#F6F0E2" stop-opacity=".0"/><stop offset=".9" stop-color="#F6F0E2" stop-opacity=".05"/><stop offset="1" stop-color="#F6F0E2" stop-opacity="0"/></radialGradient>
</defs>

<rect width="{W}" height="{H}" fill="#07121C"/>

<!-- hero: one frame through the viewfinder at 1/{HERO_DEN} -->
<g clip-path="url(#frame)">
<rect x="{FX0}" y="{FY0}" width="{FX1 - FX0}" height="{FY1 - FY0}" fill="url(#vsky)"/>
<ellipse cx="330" cy="{FY0 + 150}" rx="380" ry="46" fill="url(#cloud)"/>
<ellipse cx="930" cy="{FY0 + 96}" rx="330" ry="38" fill="url(#cloud)"/>
<ellipse cx="820" cy="{FY0 + 372}" rx="460" ry="50" fill="url(#cloud)"/>
<ellipse cx="250" cy="{FY0 + 420}" rx="300" ry="34" fill="url(#cloud)"/>
<rect x="{FX0}" y="{FY0}" width="{FX1 - FX0}" height="{FY1 - FY0}" fill="url(#vglow)"/>
<path d="{TAIL}" fill="#10283A"/>
<path d="{FIN}" fill="#132D40"/>
<path d="{WING_L}" fill="url(#wingfill)"/><path d="{WING_R}" fill="url(#wingfill)"/>
<path d="{EDGE_L}" fill="none" stroke="#7FA6B8" stroke-width="1.6" opacity=".75"/><path d="{EDGE_R}" fill="none" stroke="#7FA6B8" stroke-width="1.6" opacity=".75"/>
<path d="{RAD_L}" fill="#122A3A"/><path d="{RAD_R}" fill="#122A3A"/><path d="{RADH_L}" fill="#050B11"/><path d="{RADH_R}" fill="#050B11"/>
{GUNS}
<path d="{HOOD}" fill="#1A3A4E"/>
<path d="{SCREEN}" fill="url(#glass)" opacity=".9"/>
<path d="{COWL}" fill="url(#cowlfill)"/>
<path d="{INTAKE}" fill="#07101A"/>
{EXH}
<circle cx="{HX}" cy="{HY}" r="{R_HERO}" fill="url(#disc)"/>
{HERO_PROP}
<circle cx="{HX}" cy="{HY}" r="{SPIN_R:.1f}" fill="url(#spin)"/>
<circle cx="{HX}" cy="{HY}" r="{SPIN_R:.1f}" fill="none" stroke="#86AEC2" stroke-width="1.2" opacity=".55"/>
<circle cx="{HX}" cy="{HY}" r="3" fill="#9FC1D2"/>
<rect x="{FX0}" y="{FY0}" width="{FX1 - FX0}" height="{FY1 - FY0}" fill="url(#vig)"/>
<rect x="{FX0}" y="{BAR_Y}" width="{FX1 - FX0}" height="50" fill="#04090E" opacity=".86"/>
</g>
<rect x="{FX0}" y="{FY0}" width="{FX1 - FX0}" height="{FY1 - FY0}" rx="16" fill="none" stroke="#2F4C63" stroke-width="1.6"/>
<path d="{BRACKETS}" fill="none" stroke="#DCE8F0" stroke-width="2.2" opacity=".85"/>
<path d="{AF_BOX}" fill="none" stroke="{MINT}" stroke-width="2"/>
<path d="{CALL_ARC}" fill="none" stroke="{AMBER}" stroke-width="3.2" stroke-linecap="round"/>
<path d="{CALL_TICKS}" fill="none" stroke="{AMBER}" stroke-width="2.2"/>
<path d="{LEAD}" fill="none" stroke="{AMBER}" stroke-width="1.4"/>
<text class="call1" x="{CALL_X:.1f}" y="{CALL_Y - 5:.1f}">{fmt_deg(HERO_SWEEP)} OF TURN</text>
<text class="call2" x="{CALL_X:.1f}" y="{CALL_Y + 15:.1f}">WHILE THE SHUTTER IS OPEN</text>
<text class="vf" x="{FX0 + 30}" y="{BAR_Y + 33}" fill="#DCE8F0">S / Tv</text>
<text class="vfbig" x="{FX0 + 150}" y="{BAR_Y + 36}" fill="{AMBER}">1/{HERO_DEN}</text>
<text class="vf" x="{FX0 + 300}" y="{BAR_Y + 33}" fill="#DCE8F0">AF-C</text>
<circle cx="{FX0 + 392}" cy="{BAR_Y + 25}" r="6" fill="{MINT}"/>
<g stroke="#DCE8F0" stroke-width="1.6" opacity=".8">{scale_ticks}</g>
<path d="M{942 + 6 * 13 - 5} {BAR_Y + 12} h10 l-5 6 Z" fill="{AMBER}"/>

<!-- one propeller, six shutter speeds -->
<line x1="70" y1="1062" x2="1170" y2="1062" stroke="#1C3345" stroke-width="1.2"/>
{ROW}
<path d="M96 1347 H1144" stroke="#27425A" stroke-width="1.4" fill="none"/>
<path d="M96 1347 l12 -5 v10 Z M1144 1347 l-12 -5 v10 Z" fill="#5E7C93"/>

<!-- reference blocks: coloured rules -->
<rect x="70" y="1384" width="330" height="4" fill="{AMBER}"/>
<rect x="455" y="1384" width="330" height="4" fill="{MINT}"/>
<rect x="840" y="1384" width="330" height="4" fill="{SKY}"/>
</svg>'''

CSS = '''
@page{size:420mm 594.1mm;margin:0}
.slide{background:#07121C;color:#fff}
.art text{font-family:var(--m)}
.art .sp{font-weight:600;font-size:27px;text-anchor:middle;letter-spacing:.5px}
.art .chip{font-family:var(--c);font-weight:700;font-size:15px;text-anchor:middle;letter-spacing:2px}
.art .sw{font-weight:500;font-size:11.5px;text-anchor:middle;letter-spacing:1.4px;fill:#8FA9BB}
.art .call1{font-weight:600;font-size:17px;letter-spacing:1.6px;fill:#F5B942}
.art .call2{font-weight:500;font-size:11.5px;letter-spacing:1.8px;fill:#DCE8F0}
.art .vf{font-weight:500;font-size:19px;letter-spacing:1.5px}
.art .vfbig{font-weight:600;font-size:30px;letter-spacing:.5px}
.eyebrow{left:72px;top:82px;font-family:var(--m);font-weight:500;font-size:15px;line-height:1;letter-spacing:4.4px;color:var(--mint)}
.mode{right:70px;top:82px;font-family:var(--m);font-weight:500;font-size:15px;line-height:1;letter-spacing:3.2px;color:#8FA9BB;text-align:right}
.h1a,.h1b{left:64px;font-family:var(--c);font-weight:900;font-style:italic;text-transform:uppercase;line-height:1;font-size:206px;letter-spacing:-1px}
.h1a{top:100px;color:#fff}
.h1b{top:274px;color:var(--amber)}
.sub{left:842px;top:322px;font-family:var(--f);font-weight:500;font-size:21.5px;line-height:1.42;color:#C9D6E0}
.cap{left:72px;top:1024px;font-family:var(--f);font-weight:500;font-size:15.5px;line-height:1.2;color:#8FA9BB}
.rowlab{left:72px;top:1080px;font-family:var(--m);font-weight:500;font-size:13px;line-height:1;letter-spacing:3px;color:var(--mint)}
.note{right:70px;top:1079px;font-family:var(--f);font-weight:500;font-style:italic;font-size:14.5px;line-height:1;color:#8FA9BB;text-align:right}
.fast{left:72px;top:1356px;font-family:var(--m);font-weight:500;font-size:11.5px;line-height:1;letter-spacing:2.6px;color:#8FA9BB}
.slow{right:70px;top:1356px;font-family:var(--m);font-weight:500;font-size:11.5px;line-height:1;letter-spacing:2.6px;color:#8FA9BB;text-align:right}
.bh{top:1400px;font-family:var(--c);font-weight:800;font-size:25px;line-height:1;letter-spacing:1.6px;text-transform:uppercase;color:#fff}
.bn{top:1430px;font-family:var(--m);font-weight:600;font-size:40px;line-height:1;letter-spacing:-.5px}
.bl{top:1447px;font-family:var(--c);font-weight:700;font-size:15px;line-height:1;letter-spacing:2px;text-transform:uppercase;color:#8FA9BB}
.bt{top:1479px;font-family:var(--f);font-weight:500;font-size:16.5px;line-height:1.36;color:#C9D6E0}
.cta{right:70px;top:1599px;font-family:var(--c);font-weight:700;font-size:27px;line-height:1;letter-spacing:1.9px;text-transform:uppercase;color:var(--amber);text-align:right}
.so-url{right:70px;top:1640px;font-size:42px;color:#fff;text-align:right}
.so-tag{right:70px;top:1569px;color:var(--mint);text-align:right}
'''

GF = ("https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500;1,700"
      "&family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900"
      "&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap")

html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Don't freeze the prop | UK Airshow Guide poster 08</title>
<link rel="stylesheet" href="https://use.typekit.net/vyp4rci.css">
<link rel="stylesheet" href="{GF}">
<link rel="stylesheet" href="kit.css">
<style>{CSS}</style>
</head>
<body>
<div class="slide">
{svg}
<div data-live class="eyebrow">AIRSHOW PHOTOGRAPHY / SHUTTER SPEED CHART</div>
<div data-live class="mode">SHUTTER PRIORITY</div>
<div data-live class="h1a">Don&rsquo;t freeze</div>
<div data-live class="h1b">the prop.</div>
<div data-live class="sub">Freeze a propeller and a Spitfire<br>looks like a model hanging<br>from the ceiling. Slow the shutter<br>and let it spin.</div>
<div data-live class="cap">Camera mode: Shutter Priority (S on Nikon and Sony, or Tv on Canon). Focus mode: AF-C, AI Servo or Continuous AF.</div>
<div data-live class="rowlab">ONE PROPELLER, SIX SHUTTER SPEEDS</div>
<div data-live class="note">Blur drawn for a four blade propeller turning about 1,200 times a minute. Real propellers vary.</div>
<div data-live class="fast">FASTER SHUTTER</div>
<div data-live class="slow">SLOWER SHUTTER</div>
<div data-live class="bh" style="left:70px">Propellers</div>
<div data-live class="bn" style="left:70px;color:var(--amber)">1/320</div>
<div data-live class="bl" style="left:206px">Safe starting point</div>
<div data-live class="bt" style="left:70px">More propeller blur at 1/250,<br>then 1/200 or 1/160.</div>
<div data-live class="bh" style="left:455px">Jets</div>
<div data-live class="bn" style="left:455px;color:var(--mint)">1/1000</div>
<div data-live class="bl" style="left:615px">Safe starting speed</div>
<div data-live class="bt" style="left:455px">Keep speeds like this for jets.<br>At 1/1600 a propeller can look stopped.</div>
<div data-live class="bh" style="left:840px">Helicopters</div>
<div data-live class="bn" style="left:840px;color:var(--sky)">1/125</div>
<div data-live class="bl" style="left:976px">Safe starting point</div>
<div data-live class="bt" style="left:840px">More rotor blur at 1/60 to 1/100.<br>At 1/200 the blades look frozen.</div>
<img class="logo" src="img/uk-airshow-guide-logo.png" alt="UK Airshow Guide" style="left:70px;top:1536px;width:290px">
<div data-live class="so-tag">Plan your airshow series 08 / 10</div>
<div data-live class="cta">More in the Airshow Photography Hub</div>
<div data-live class="so-url">ukairshowguide.co.uk</div>
</div>
</body>
</html>
'''

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "08-prop-blur.html")
with open(out, "w", encoding="utf-8") as fh:
    fh.write(html)
print("wrote", os.path.normpath(out), len(html), "bytes")
for den, n, col, chip in SPEEDS:
    print("1/%-5d sweep %6.2f deg" % (den, sweep(den)))
