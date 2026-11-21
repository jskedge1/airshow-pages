#!/usr/bin/env python3
"""Poster 01, Runway 27: writes posters/01-runway-27.html.

The runway is drawn with a real pinhole camera: principal point at the middle of the
sheet, focal length F, pitched down just enough to put the horizon at HY. Everything on
the ground (markings, numerals, lights) is defined in ground units and projected, so it
all foreshortens together. Scale on the ground is artistic: the numerals are far bigger
than real ones so that 27 reads from across a room.

Run:  python3 -I build/gen_01.py   (from posters/)
"""
import math
import os
import random

W, H = 1240, 1754
CX, CY = 620.0, 877.0          # principal point: centre of the sheet
F = 1800.0                     # focal length in px (about a 38 degree lens)
HY = 668.0                     # horizon line, 38 per cent down
TH = math.atan((CY - HY) / F)  # pitch down, about 6.6 degrees
S, C = math.sin(TH), math.cos(TH)
CAM_H = 50.0                   # eye height in ground units


def depth_at(sy):
    """Distance along the ground from the camera to the point seen at screen row sy."""
    t = (CY - sy) / F
    return CAM_H * (C + t * S) / (S - t * C)


Y_THR = 1492.0                 # screen row of the runway threshold
CAM_BACK = depth_at(Y_THR)     # camera sits this far before the threshold


def proj(X, Z, Y=0.0):
    D = Z + CAM_BACK
    yc = (Y - CAM_H) * C + D * S
    zc = -(Y - CAM_H) * S + D * C
    return CX + F * X / zc, CY - F * yc / zc, zc


def z_at(sy):
    return depth_at(sy) - CAM_BACK


ZC_THR = proj(0, 0)[2]
RW = 505.0 * ZC_THR / F        # runway half width: 505 px either side at the threshold
Z_END = 3000.0                 # far end of the runway


def P(X, Z, Y=0.0):
    x, y, _ = proj(X, Z, Y)
    return "%.1f %.1f" % (x, y)


def poly(points):
    return "M" + "L".join(P(x, z) for x, z in points) + "Z"


def quad(x0, x1, z0, z1):
    return poly([(x0, z0), (x1, z0), (x1, z1), (x0, z1)])


# ---------------------------------------------------------------- painted markings
marks = []

# threshold "piano keys": eight stripes each side of the centre line
Z_K0, Z_K1 = z_at(1470), z_at(1394)
sw, sg, cg = 0.062 * RW, 0.050 * RW, 0.12 * RW
for side in (-1, 1):
    for i in range(8):
        a = cg / 2 + i * (sw + sg)
        x0, x1 = side * a, side * (a + sw)
        marks.append(quad(min(x0, x1), max(x0, x1), Z_K0, Z_K1))

# runway designator 27: blocky digits built on a unit box and laid on the ground
Z_N0, Z_N1 = z_at(1352), z_at(1030)
NUM_W = 0.72 * 2 * RW
DIG_W = 0.43 * NUM_W
tw, th, chu, chv = 0.25, 0.15, 0.15, 0.085


def digit(polys, x_left):
    out = []
    for pts in polys:
        out.append(poly([(x_left + u * DIG_W, Z_N0 + v * (Z_N1 - Z_N0)) for u, v in pts]))
    return out


dq, vm, hk = 0.34, 0.60, 0.17
TWO = [
    [(0, 0), (1, 0), (1, th), (0, th)],                                         # base
    [(0, th), (dq, th), (1, vm), (1 - dq, vm)],                                 # diagonal
    [(1 - tw, vm), (1, vm), (1, 1 - chv), (1 - chu, 1), (1 - tw, 1)],           # right upright
    [(0, 1 - th), (0, 1 - chv), (chu, 1), (1 - chu, 1), (1, 1 - chv), (1, 1 - th)],  # top bar
    [(0, 1 - th - hk), (tw, 1 - th - hk), (tw, 1 - th), (0, 1 - th)],           # left hook
]
d7 = 0.33
SEVEN = [
    [(0, 1 - th), (0, 1 - chv), (chu, 1), (1, 1), (1, 1 - th)],                 # top bar
    [(1 - d7, 1 - th), (1, 1 - th), (0.26 + d7, 0), (0.26, 0)],                 # diagonal
    [(0, 1 - th - hk), (tw * 0.9, 1 - th - hk), (tw * 0.9, 1 - th), (0, 1 - th)],  # left tick
]
marks += digit(TWO, -NUM_W / 2)
marks += digit(SEVEN, NUM_W / 2 - DIG_W)

# side stripes
for side in (-1, 1):
    x0, x1 = side * 0.945 * RW, side * 0.965 * RW
    marks.append(quad(min(x0, x1), max(x0, x1), 0, Z_END))

# centre line dashes
z = Z_N1 + 26
while z < Z_END - 40:
    marks.append(quad(-0.016 * RW, 0.016 * RW, z, z + 30))
    z += 52

# touchdown zone bars and the aiming point blocks
inner = 0.30 * RW
for z0, n in ((Z_N1 + 62, 3), (Z_N1 + 362, 2), (Z_N1 + 542, 2), (Z_N1 + 722, 1), (Z_N1 + 902, 1)):
    for side in (-1, 1):
        for i in range(n):
            a = inner + i * 0.11 * RW
            x0, x1 = side * a, side * (a + 0.06 * RW)
            marks.append(quad(min(x0, x1), max(x0, x1), z0, z0 + 32))
Z_AIM = Z_N1 + 190
for side in (-1, 1):
    x0, x1 = side * inner, side * (inner + 0.21 * RW)
    marks.append(quad(min(x0, x1), max(x0, x1), Z_AIM, Z_AIM + 62))

MARKS = "".join(marks)

# rubber left by landing wheels, either side of the centre line (deliberately uneven)
rubber = []
for side, streaks in ((-1, ((0.165, 0.050, 20, 250), (0.235, 0.026, 70, 150), (0.118, 0.020, 90, 120), (0.205, 0.016, -20, 320))),
                      (1, ((0.150, 0.046, 40, 290), (0.228, 0.030, 30, 190), (0.110, 0.018, 60, 90), (0.262, 0.014, 110, 240)))):
    for off, wd, a0, a1 in streaks:
        x0, x1 = side * off * RW, side * (off + wd) * RW
        rubber.append(quad(min(x0, x1), max(x0, x1), Z_N1 + a0, Z_AIM + a1))
RUBBER = "".join(rubber)

# ---------------------------------------------------------------- surface texture (all vector)
trnd = random.Random(2027)
# tarmac speckle: aggregate showing through, spread evenly over the sheet then laid on the ground
specks = []
for _ in range(1500):
    zz = z_at(trnd.uniform(HY + 46, H + 4))
    x, y, zc = proj(trnd.uniform(-RW, RW), zz)
    if not (0 <= x <= W):
        continue
    r = trnd.uniform(0.018, 0.060) * F / zc
    if r < 0.28:
        continue
    if trnd.random() < 0.55:
        specks.append('<ellipse cx="%.1f" cy="%.1f" rx="%.2f" ry="%.2f" fill="#B4C2CB" opacity="%.2f"/>' % (x, y, r, r * 0.6, trnd.uniform(0.07, 0.19)))
    else:
        specks.append('<ellipse cx="%.1f" cy="%.1f" rx="%.2f" ry="%.2f" fill="#04070A" opacity="%.2f"/>' % (x, y, r * 1.2, r * 0.7, trnd.uniform(0.16, 0.34)))
SPECKS = "".join(specks)

# paint wear: thin scuffs running along the runway (so they converge with it) and pin holes
wear = {0.07: [], 0.12: [], 0.18: []}
for _ in range(230):
    X = trnd.uniform(-0.93 * RW, 0.93 * RW)
    z0 = trnd.uniform(Z_K0 - 2, Z_N1)
    wd = trnd.uniform(0.03, 0.15)
    wear[trnd.choice((0.07, 0.07, 0.12, 0.12, 0.18))].append(quad(X, X + wd, z0, z0 + trnd.uniform(3, 20)))
WEAR = "".join('<path d="%s" opacity="%.2f"/>' % ("".join(v), k) for k, v in wear.items())
pins = []
for _ in range(620):
    x, y, zc = proj(trnd.uniform(-0.93 * RW, 0.93 * RW), trnd.uniform(Z_K0, Z_N1))
    r = trnd.uniform(0.02, 0.055) * F / zc
    pins.append('<ellipse cx="%.1f" cy="%.1f" rx="%.2f" ry="%.2f"/>' % (x, y, r, r * 0.6))
WEAR += '<g opacity=".24">' + "".join(pins) + '</g>'

# ---------------------------------------------------------------- pavement shapes
RUNWAY = poly([(-RW, -60), (RW, -60), (RW, Z_END), (-RW, Z_END)])          # runs off the bottom edge
PRE = poly([(-RW, -60), (RW, -60), (RW, 0), (-RW, 0)])                     # paved area before the threshold
# a rapid exit taxiway peeling off to the right, with blue edge and green centre line lights
TZ0, TW_ = Z_N1 + 70, 26.0


def taxi_pt(k, off):
    """k is distance along the taxiway centre line, off is sideways offset from it."""
    ang = math.radians(32)
    x = RW + k * math.sin(ang) + off * math.cos(ang)
    z = TZ0 + TW_ / 2 + k * math.cos(ang) - off * math.sin(ang)
    return x, z


TAXI = poly([(RW - 0.5, TZ0 - 14), taxi_pt(40, -TW_ / 2), taxi_pt(620, -TW_ / 2), taxi_pt(620, TW_ / 2),
             taxi_pt(30, TW_ / 2), (RW - 0.5, TZ0 + TW_ + 22)])

# ---------------------------------------------------------------- lights
lights = {"w": [], "g": [], "r": [], "a": [], "b": [], "p": [], "t": []}


def light(kind, X, Z, size=1.0, Y=0.0):
    x, y, zc = proj(X, Z, Y)
    core = max(0.9, min(9.5, size * 0.27 * F / zc))
    lights[kind].append((x, y, core))


# edge lights: white, amber for the last 600 units
z = 0.0
while z <= Z_END:
    for side in (-1, 1):
        light("a" if z > Z_END - 600 else "w", side * (RW + 1.4), z, 1.0)
    z += 60 if z < 900 else 120
# centre line lights run between the two digits all the way down the runway
z = 6.0
while z < Z_END:
    light("r" if z > Z_END - 300 else "w", 0, z, 0.36)
    z += 15 if z < 360 else (30 if z < 900 else 90)
# green threshold bar, with a short wing bar outside each edge
n = 21
for i in range(n):
    light("g", -RW + 2 * RW * i / (n - 1), -1.6, 0.86)
# red runway end lights
for i in range(9):
    light("r", -RW + 2 * RW * i / 8, Z_END + 2, 5.0)
# PAPI on the left: white, white, red, red means on the glide path
Z_PAPI = Z_N1 + 95
PAPI_X = [-(RW + 12 + (3 - i) * 8.2) for i in range(4)]
for X, kind in zip(PAPI_X, ("p", "p", "r", "r")):
    light(kind, X, Z_PAPI, 4.4, Y=1.2)
# approach lights before the threshold: centre barrettes and crossbars
for row, sy in enumerate((1548, 1622, 1706)):
    zr = z_at(sy)
    for k in range(-2, 3):
        light("w", k * 0.026 * RW, zr, 0.92)
    for side in (-1, 1):
        for k in range(5):
            light("w", side * (0.125 + 0.165 * k / 4) * RW, zr, 0.86)
# taxiway lights: blue edges, green centre line
for i in range(22):
    k = 40 + i * 27
    for off in (-TW_ / 2 - 1.2, TW_ / 2 + 1.2):
        x, zz = taxi_pt(k, off)
        light("b", x, zz, 0.9)
for i in range(44):
    x, zz = taxi_pt(26 + i * 13.5, 0)
    light("t", x, zz, 0.42)

# kind: (core colour, gradient id, glow radius as a multiple of the core)
GLOW = {"w": ("#FFF8E8", "gW", 6.4), "g": ("#D9FFE7", "gG", 6.4), "r": ("#FF7A6B", "gR", 7.4),
        "a": ("#FFEFC8", "gA", 6.4), "b": ("#D6E6FF", "gB", 6.2), "p": ("#FFFFFF", "gP", 6.6),
        "t": ("#C8FFD9", "gG", 5.2)}


def light_svg():
    glows, cores = [], []
    for kind, items in lights.items():
        col, gid, k = GLOW[kind]
        for x, y, c in items:
            if not (-40 < x < W + 40):
                continue
            glows.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="url(#%s)"/>' % (x, y, c * k, gid))
            cores.append('<circle cx="%.1f" cy="%.1f" r="%.2f" fill="%s"/>' % (x, y, c * 0.78, col))
    return "".join(glows), "".join(cores)


GLOWS, CORES = light_svg()

# bloom strips: one green line along the threshold lights, warm lines under the approach rows
bloom = []
x0, y0, _ = proj(-RW, -1.6)
x1, y1, _ = proj(RW, -1.6)
bloom.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#2BE07C" stroke-width="5"/>' % (x0, y0, x1, y1))
for sy in (1548, 1622, 1706):
    zr = z_at(sy)
    xa, ya, _ = proj(-0.29 * RW, zr)
    xb, yb, _ = proj(0.29 * RW, zr)
    bloom.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#FFD98E" stroke-width="5"/>' % (xa, ya, xb, yb))
BLOOM = "".join(bloom)


# PAPI housings: four low boxes on short legs under the lights
papi_boxes = []
for X in PAPI_X:
    x, y, zc = proj(X, Z_PAPI, 0)
    sc = F / zc
    papi_boxes.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1.2" fill="#03070B"/>'
                      % (x - 1.7 * sc, y - 2.0 * sc, 3.4 * sc, 2.0 * sc))
PAPI_BOXES = "".join(papi_boxes)

# ---------------------------------------------------------------- sky furniture
rnd = random.Random(27)
TEXT_BOXES = [(50, 60, 1190, 380), (50, 380, 640, 560), (840, 60, 1190, 120), (975, 450, 1050, 522)]
stars = []
while len(stars) < 150:
    x, y = rnd.uniform(18, W - 18), rnd.uniform(16, 590) ** 1.0
    if any(a <= x <= c and b <= y <= d for a, b, c, d in TEXT_BOXES):
        continue
    fade = max(0.0, 1 - y / 610.0)
    r = rnd.choice((0.55, 0.6, 0.7, 0.8, 0.95, 1.25)) * (0.75 + 0.5 * fade)
    o = (0.25 + 0.7 * rnd.random()) * (0.25 + 0.75 * fade)
    stars.append('<circle cx="%.1f" cy="%.1f" r="%.2f" opacity="%.2f"/>' % (x, y, r, o))
STARS = "".join(stars)

# horizon silhouette: tree line, hangars, control tower, windsock
sil = []
x, pts = -4.0, [(-4, HY + 3)]
while x < W + 4:
    in_gap = 566 < x < 674          # keep the far end of the runway open
    hgt = 1.5 if in_gap else rnd.uniform(5.0, 11.5) * (0.6 + 0.4 * math.sin(x / 71.0) ** 2)
    pts.append((x, HY - hgt))
    x += rnd.uniform(5, 13)
pts.append((W + 4, HY + 3))
sil.append("M" + "L".join("%.1f %.1f" % p for p in pts) + "Z")


def box(x0, x1, h, roof=0.0):
    if roof:
        return "M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" % (
            x0, HY + 2, x0, HY - h, (x0 + x1) / 2, HY - h - roof, x1, HY - h, x1, HY + 2)
    return "M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" % (x0, HY + 2, x0, HY - h, x1, HY - h, x1, HY + 2)


for x0, x1, h, roof in ((118, 196, 17, 6), (202, 300, 21, 7.5), (306, 372, 15, 5), (1006, 1088, 16, 5.5),
                        (1094, 1150, 12, 0)):
    sil.append(box(x0, x1, h, roof))
# control tower: shaft, flared cab, roof slab, mast
TX = 872.0


def rect(x0, y0, x1, y1):
    return "M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" % (x0, y0, x1, y0, x1, y1, x0, y1)


sil.append(rect(TX - 5, HY - 38, TX + 5, HY + 2))
sil.append("M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" % (TX - 12, HY - 37, TX - 16, HY - 49, TX + 16, HY - 49, TX + 12, HY - 37))
sil.append(rect(TX - 17.5, HY - 52, TX + 17.5, HY - 49))
sil.append(rect(TX - 0.8, HY - 68, TX + 0.8, HY - 52))
# windsock on its pole, wind from the left
SX = 438.0
sil.append(rect(SX, HY - 25, SX + 1.5, HY + 1))
sil.append("M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" % (SX + 1.5, HY - 25.2, SX + 23, HY - 21.6, SX + 23, HY - 18.6, SX + 1.5, HY - 15.6))
SIL = "".join(sil)

HORIZON_LIGHTS = "".join(
    '<circle cx="%.1f" cy="%.1f" r="%.2f" fill="%s" opacity="%.2f"/>' % (
        rnd.uniform(20, W - 20), HY - rnd.uniform(0.5, 4.5), rnd.choice((0.7, 0.8, 1.0)),
        rnd.choice(("#FFD98A", "#FFE9BF", "#FFC860")), rnd.uniform(0.45, 0.95))
    for _ in range(46))

# ---------------------------------------------------------------- assemble
x_vp, y_vp = CX, HY
svg = f'''<svg class="art" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="{HY}">
<stop offset="0" stop-color="#03080F"/><stop offset=".30" stop-color="#07121C"/><stop offset=".56" stop-color="#0B1A27"/>
<stop offset=".76" stop-color="#11293A"/><stop offset=".88" stop-color="#184554"/><stop offset=".945" stop-color="#2C7C7B"/>
<stop offset=".978" stop-color="#B9A662"/><stop offset="1" stop-color="#F5B942"/></linearGradient>
<radialGradient id="sun" gradientUnits="userSpaceOnUse" cx="{x_vp}" cy="{y_vp + 6}" r="560" gradientTransform="translate(0 {y_vp + 6}) scale(1 .42) translate(0 {-(y_vp + 6)})">
<stop offset="0" stop-color="#FFD27A" stop-opacity=".95"/><stop offset=".16" stop-color="#F5B942" stop-opacity=".62"/>
<stop offset=".42" stop-color="#E0803C" stop-opacity=".22"/><stop offset="1" stop-color="#D74949" stop-opacity="0"/></radialGradient>
<radialGradient id="tealglow" gradientUnits="userSpaceOnUse" cx="{x_vp}" cy="{y_vp}" r="900" gradientTransform="translate(0 {y_vp}) scale(1 .5) translate(0 {-y_vp})">
<stop offset="0" stop-color="#32B4AF" stop-opacity=".34"/><stop offset=".5" stop-color="#0E7C78" stop-opacity=".14"/><stop offset="1" stop-color="#0E7C78" stop-opacity="0"/></radialGradient>
<linearGradient id="land" gradientUnits="userSpaceOnUse" x1="0" y1="{HY}" x2="0" y2="{H}">
<stop offset="0" stop-color="#16303A"/><stop offset=".05" stop-color="#0E1F28"/><stop offset=".3" stop-color="#09151C"/><stop offset="1" stop-color="#050B10"/></linearGradient>
<linearGradient id="tarmac" gradientUnits="userSpaceOnUse" x1="0" y1="{HY}" x2="0" y2="{H}">
<stop offset="0" stop-color="#9C8A58"/><stop offset=".012" stop-color="#4A6468"/><stop offset=".05" stop-color="#27383F"/><stop offset=".16" stop-color="#1B252C"/><stop offset=".6" stop-color="#171D23"/><stop offset="1" stop-color="#0E1216"/></linearGradient>
<linearGradient id="paint" gradientUnits="userSpaceOnUse" x1="0" y1="{H}" x2="0" y2="{HY}">
<stop offset="0" stop-color="#F4F6F7"/><stop offset=".45" stop-color="#EDF1F3"/><stop offset=".72" stop-color="#C6D2D9"/><stop offset=".93" stop-color="#8FA7B3"/><stop offset="1" stop-color="#7C97A4"/></linearGradient>
<radialGradient id="pool" gradientUnits="userSpaceOnUse" cx="620" cy="1330" r="640" gradientTransform="translate(0 1330) scale(1 .62) translate(0 -1330)">
<stop offset="0" stop-color="#DCE9F2" stop-opacity=".20"/><stop offset=".55" stop-color="#9FB6C4" stop-opacity=".07"/><stop offset="1" stop-color="#9FB6C4" stop-opacity="0"/></radialGradient>
<linearGradient id="foot" gradientUnits="userSpaceOnUse" x1="0" y1="1470" x2="0" y2="{H}">
<stop offset="0" stop-color="#04080C" stop-opacity="0"/><stop offset=".45" stop-color="#04080C" stop-opacity=".55"/><stop offset="1" stop-color="#04080C" stop-opacity=".9"/></linearGradient>
<linearGradient id="haze" gradientUnits="userSpaceOnUse" x1="0" y1="{HY - 2}" x2="0" y2="{HY + 150}">
<stop offset="0" stop-color="#F5B942" stop-opacity=".34"/><stop offset=".12" stop-color="#5FA7A0" stop-opacity=".2"/><stop offset="1" stop-color="#32B4AF" stop-opacity="0"/></linearGradient>
<radialGradient id="gW"><stop offset="0" stop-color="#FFF1CF" stop-opacity=".95"/><stop offset=".12" stop-color="#FFE3A8" stop-opacity=".62"/><stop offset=".3" stop-color="#FFD98E" stop-opacity=".26"/><stop offset=".58" stop-color="#FFD98E" stop-opacity=".08"/><stop offset="1" stop-color="#FFD98E" stop-opacity="0"/></radialGradient>
<radialGradient id="gG"><stop offset="0" stop-color="#7DFFB2" stop-opacity=".95"/><stop offset=".12" stop-color="#2BE07C" stop-opacity=".62"/><stop offset=".3" stop-color="#1FC46A" stop-opacity=".26"/><stop offset=".58" stop-color="#1FC46A" stop-opacity=".08"/><stop offset="1" stop-color="#1FC46A" stop-opacity="0"/></radialGradient>
<radialGradient id="gR"><stop offset="0" stop-color="#FF6A5A" stop-opacity="1"/><stop offset=".14" stop-color="#F0362E" stop-opacity=".78"/><stop offset=".32" stop-color="#E0302B" stop-opacity=".34"/><stop offset=".6" stop-color="#D74949" stop-opacity=".1"/><stop offset="1" stop-color="#D74949" stop-opacity="0"/></radialGradient>
<radialGradient id="gA"><stop offset="0" stop-color="#FFE2A0" stop-opacity=".95"/><stop offset=".12" stop-color="#F5B942" stop-opacity=".62"/><stop offset=".3" stop-color="#F5B942" stop-opacity=".26"/><stop offset=".58" stop-color="#F5B942" stop-opacity=".08"/><stop offset="1" stop-color="#F5B942" stop-opacity="0"/></radialGradient>
<radialGradient id="gB"><stop offset="0" stop-color="#A9CCFF" stop-opacity=".95"/><stop offset=".12" stop-color="#3D82FF" stop-opacity=".62"/><stop offset=".3" stop-color="#2A6BFF" stop-opacity=".26"/><stop offset=".58" stop-color="#2A6BFF" stop-opacity=".08"/><stop offset="1" stop-color="#2A6BFF" stop-opacity="0"/></radialGradient>
<radialGradient id="gP"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".98"/><stop offset=".2" stop-color="#EAF4FF" stop-opacity=".55"/><stop offset=".55" stop-color="#CFE4FF" stop-opacity=".15"/><stop offset="1" stop-color="#CFE4FF" stop-opacity="0"/></radialGradient>
<radialGradient id="moonglow"><stop offset="0" stop-color="#DCEBFF" stop-opacity=".30"/><stop offset=".4" stop-color="#DCEBFF" stop-opacity=".08"/><stop offset="1" stop-color="#DCEBFF" stop-opacity="0"/></radialGradient>
<mask id="crescent"><rect x="900" y="380" width="220" height="220" fill="#000"/><circle cx="1012" cy="486" r="19" fill="#fff"/><circle cx="1019.5" cy="479.5" r="18.2" fill="#000"/></mask>
<clipPath id="rw"><path d="{RUNWAY}"/></clipPath>
<clipPath id="paintclip"><path d="{MARKS}"/></clipPath>
<filter id="bloom" x="-10%" y="-400%" width="120%" height="900%"><feGaussianBlur stdDeviation="9 6"/></filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
</defs>

<rect width="{W}" height="{HY + 2}" fill="url(#sky)"/>
<rect width="{W}" height="{HY + 2}" fill="url(#tealglow)"/>
<rect width="{W}" height="{HY + 2}" fill="url(#sun)"/>
<g fill="#EAF2FF">{STARS}</g>
<circle cx="1012" cy="486" r="70" fill="url(#moonglow)"/>
<rect x="900" y="380" width="220" height="220" fill="#F1F6FF" mask="url(#crescent)"/>

<rect y="{HY}" width="{W}" height="{H - HY}" fill="url(#land)"/>
<path d="{TAXI}" fill="#121c23"/>
<path d="{RUNWAY}" fill="url(#tarmac)"/>
<path d="{PRE}" fill="#0b0f13" opacity=".55"/>
<g clip-path="url(#rw)">
<rect y="{HY}" width="{W}" height="{H - HY}" fill="url(#pool)"/>
<path d="{RUBBER}" fill="#06090c" opacity=".3" filter="url(#soft)"/>
<g>{SPECKS}</g>
<path d="{MARKS}" fill="url(#paint)"/>
<g clip-path="url(#paintclip)" fill="#1B242B">{WEAR}</g>
</g>
<rect y="{HY - 2}" width="{W}" height="152" fill="url(#haze)"/>
<path d="{SIL}" fill="#04090E"/>
<g>{HORIZON_LIGHTS}</g>
<circle cx="{TX}" cy="{HY - 69}" r="9" fill="url(#gR)"/><circle cx="{TX}" cy="{HY - 69}" r="1.5" fill="#FFB4A6"/>
<circle cx="{TX}" cy="{HY - 54}" r="15" fill="url(#gG)"/><circle cx="{TX}" cy="{HY - 54}" r="2.1" fill="#D8FFE6"/>
<rect x="{TX - 12}" y="{HY - 46.5}" width="24" height="6" fill="#FFD98A" opacity=".55"/>
<rect y="1470" width="{W}" height="{H - 1470}" fill="url(#foot)"/>
<g filter="url(#bloom)" opacity=".5">{BLOOM}</g>
<g>{PAPI_BOXES}</g>
<g>{GLOWS}</g>
<g>{CORES}</g>
</svg>'''

CSS = '''
@page{size:420mm 594.1mm;margin:0}
.slide{background:#03080F;color:#fff}
.eyebrow{left:72px;top:82px;font-family:var(--m);font-weight:500;font-size:15px;line-height:1;letter-spacing:4.4px;color:var(--mint)}
.rwy{right:70px;top:82px;font-family:var(--m);font-weight:500;font-size:15px;line-height:1;letter-spacing:3.2px;color:#8FA9BB;text-align:right}
.h1a,.h1b{left:66px;font-family:var(--c);font-weight:900;font-style:italic;text-transform:uppercase;line-height:1;color:#fff}
.h1a{top:106px;font-size:146px;letter-spacing:-.6px}
.h1b{top:238px;font-size:128px;letter-spacing:-.5px}
.h1b span{color:var(--amber)}
.lede{left:72px;top:398px;font-family:var(--f);font-weight:500;font-size:25px;line-height:1.42;color:#C9D6E0}
.strap{left:72px;top:518px;font-family:var(--f);font-weight:700;font-size:25px;line-height:1.2;color:#fff}
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
<title>Runway two seven, cleared for take-off | UK Airshow Guide poster 01</title>
<link rel="stylesheet" href="https://use.typekit.net/vyp4rci.css">
<link rel="stylesheet" href="{GF}">
<link rel="stylesheet" href="kit.css">
<style>{CSS}</style>
</head>
<body>
<div class="slide">
{svg}
<div data-live class="eyebrow">THE 2027 AIRSHOW SEASON</div>
<div data-live class="rwy">RWY 27 / HDG 270&deg;</div>
<div data-live class="h1a">Runway two seven,</div>
<div data-live class="h1b">Cleared for <span>take-off.</span></div>
<div data-live class="lede">Pick your shows, set a budget and book early.<br>Plan the journey, pack for sun and rain,<br>and beat the rush home.</div>
<div data-live class="strap">Every UK airshow, one easy guide.</div>
<img class="logo" src="img/uk-airshow-guide-logo.png" alt="UK Airshow Guide" style="left:70px;top:1536px;width:290px">
<div data-live class="so-tag">Plan your airshow series 01 / 10</div>
<div data-live class="cta">Plan your 2027 airshow</div>
<div data-live class="so-url">ukairshowguide.co.uk</div>
</div>
</body>
</html>
'''

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "01-runway-27.html")
with open(out, "w", encoding="utf-8") as fh:
    fh.write(html)
print("wrote", os.path.normpath(out), len(html), "bytes")
print("camera: pitch %.2f deg, %.1f units before the threshold, runway half width %.1f" % (math.degrees(TH), CAM_BACK, RW))
print("numerals Z %.1f to %.1f, PAPI at Z %.1f, aiming point Z %.1f" % (Z_N0, Z_N1, Z_PAPI, Z_AIM))
