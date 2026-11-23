#!/usr/bin/env python3
"""Poster 05, "Show day, by the instruments".
Writes posters/05-six-pack.html. Re-run with:  python3 -I build/gen_05.py   (from posters/)
The six instruments are drawn from scratch as SVG so every tick, numeral and needle is exact.
Angles are in degrees, clockwise from 12 o'clock."""
import math, os, random

W, H = 1240, 1754
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '05-six-pack.html')

WHITE = '#F2F5F7'
DIM = '#AEB9C2'
RED = '#D74949'
AMBER = '#F5B942'
GREEN = '#2BA84A'
MINT = '#5FE3D6'

R = 158          # bezel radius
RF = 140         # dial face radius
CX = [258, 620, 982]
ROW = [702, 1178]
PL_H = 112       # placard height
PL_W = 318


def n(v):
    s = '%.2f' % v
    return s.rstrip('0').rstrip('.') if '.' in s else s


def P(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.sin(a), cy - r * math.cos(a)


def arc(cx, cy, r, a1, a2):
    """clockwise arc path from a1 to a2"""
    x1, y1 = P(cx, cy, r, a1)
    x2, y2 = P(cx, cy, r, a2)
    large = 1 if (a2 - a1) % 360 > 180 else 0
    return 'M%s %sA%s %s 0 %d 1 %s %s' % (n(x1), n(y1), n(r), n(r), large, n(x2), n(y2))


def tick(cx, cy, r1, r2, deg, w, col=WHITE, cap='butt'):
    x1, y1 = P(cx, cy, r1, deg)
    x2, y2 = P(cx, cy, r2, deg)
    return '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%s" stroke-linecap="%s"/>' % (
        n(x1), n(y1), n(x2), n(y2), col, n(w), cap)


def T(x, y, s, size, weight=600, fill=WHITE, anchor='middle', ls=0, cls='', rot=None, extra=''):
    tr = ' transform="rotate(%s %s %s)"' % (n(rot), n(x), n(y)) if rot is not None else ''
    c = ' class="%s"' % cls if cls else ''
    lsp = ' letter-spacing="%s"' % n(ls) if ls else ''
    return '<text x="%s" y="%s" font-size="%s" font-weight="%d" fill="%s" text-anchor="%s" dominant-baseline="central"%s%s%s%s>%s</text>' % (
        n(x), n(y), n(size), weight, fill, anchor, lsp, c, tr, extra, s)


def screw(x, y, r=6.5, rot=30):
    a = math.radians(rot)
    dx, dy = (r - 1.6) * math.cos(a), (r - 1.6) * math.sin(a)
    return ('<circle cx="%s" cy="%s" r="%s" fill="url(#gScrew)" stroke="#04070A" stroke-width="1"/>'
            '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="#04070A" stroke-width="1.7" stroke-linecap="round"/>'
            '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="#6A7884" stroke-width=".6" stroke-linecap="round" opacity=".7"/>') % (
        n(x), n(y), n(r), n(x - dx), n(y - dy), n(x + dx), n(y + dy),
        n(x - dx), n(y - dy + 1.1), n(x + dx), n(y + dy + 1.1))


def needle(cx, cy, deg, length, base=9, tail=26, tip=0.26, tipcol=RED, col=WHITE, tipw=2.2):
    """tapered pointer with a coloured tip and a counterweight tail, pointing up then rotated"""
    L = length
    t0 = L * (1 - tip)
    # body taper
    wb, wt = base / 2.0, tipw / 2.0
    wm = wb + (wt - wb) * (t0 / L)   # half width where the red tip starts
    g = ['<g transform="rotate(%s %s %s)">' % (n(deg), n(cx), n(cy))]
    g.append('<path d="M%s %s L%s %s L%s %s L%s %s Z" fill="#000" opacity=".45" transform="translate(2.5 3.5)"/>' % (
        n(cx - wb), n(cy + tail), n(cx - wt), n(cy - L), n(cx + wt), n(cy - L), n(cx + wb), n(cy + tail)))
    g.append('<path d="M%s %s L%s %s L%s %s L%s %s Z" fill="%s"/>' % (
        n(cx - wb), n(cy), n(cx - wm), n(cy - t0), n(cx + wm), n(cy - t0), n(cx + wb), n(cy), col))
    g.append('<path d="M%s %s L%s %s L%s %s L%s %s Z" fill="%s"/>' % (
        n(cx - wm), n(cy - t0), n(cx - wt), n(cy - L), n(cx + wt), n(cy - L), n(cx + wm), n(cy - t0), tipcol))
    # tail / counterweight
    g.append('<path d="M%s %s L%s %s L%s %s L%s %s Z" fill="#DADFE3"/>' % (
        n(cx - wb), n(cy), n(cx - wb * 1.25), n(cy + tail), n(cx + wb * 1.25), n(cy + tail), n(cx + wb), n(cy)))
    g.append('</g>')
    return ''.join(g)


def hub(cx, cy, r=12):
    return ('<circle cx="%s" cy="%s" r="%s" fill="#000" opacity=".5" transform="translate(1.5 2.5)"/>'
            '<circle cx="%s" cy="%s" r="%s" fill="url(#gHub)" stroke="#020304" stroke-width="1"/>'
            '<circle cx="%s" cy="%s" r="%s" fill="#0A0D10"/>') % (
        n(cx), n(cy), n(r), n(cx), n(cy), n(r), n(cx), n(cy), n(r * 0.36))


def knob(x, y, r=17):
    s = ['<circle cx="%s" cy="%s" r="%s" fill="#000" opacity=".55" transform="translate(2 3)"/>' % (n(x), n(y), n(r + 1))]
    s.append('<circle cx="%s" cy="%s" r="%s" fill="url(#gKnob)" stroke="#030506" stroke-width="1.2"/>' % (n(x), n(y), n(r)))
    s.append('<circle cx="%s" cy="%s" r="%s" fill="none" stroke="#05080A" stroke-width="3.2" stroke-dasharray="2.1 2.1" opacity=".85"/>' % (n(x), n(y), n(r - 2)))
    s.append('<circle cx="%s" cy="%s" r="%s" fill="url(#gKnobTop)" stroke="#020304" stroke-width=".8"/>' % (n(x), n(y), n(r - 5.5)))
    return ''.join(s)


def case(cx, cy, knobs=()):
    """mounting screws, bezel and empty face"""
    s = []
    for k, (sx, sy) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
        if (sx, sy) in knobs:
            continue
        d = (R + 12) * 0.70711
        s.append(screw(cx + sx * d, cy + sy * d, 6.5, rot=[28, 112, 64, 151][k] + cx % 37))
    s.append('<circle cx="%s" cy="%s" r="%s" fill="#000" opacity=".55" filter="url(#fSoft)"/>' % (n(cx + 2), n(cy + 6), n(R + 3)))
    s.append('<circle cx="%s" cy="%s" r="%s" fill="url(#gBezel)" stroke="#030506" stroke-width="1.5"/>' % (n(cx), n(cy), n(R)))
    s.append('<circle cx="%s" cy="%s" r="%s" fill="none" stroke="#7E8C97" stroke-width="1" opacity=".35"/>' % (n(cx), n(cy), n(R - 1.6)))
    s.append('<circle cx="%s" cy="%s" r="%s" fill="url(#gBezelIn)" stroke="#020304" stroke-width="1"/>' % (n(cx), n(cy), n(R - 9)))
    s.append('<circle cx="%s" cy="%s" r="%s" fill="url(#gFace)" stroke="#000" stroke-width="2"/>' % (n(cx), n(cy), n(RF)))
    return ''.join(s)


def glass(cx, cy):
    s = ['<g pointer-events="none">']
    s.append('<circle cx="%s" cy="%s" r="%s" fill="url(#gGlass)"/>' % (n(cx), n(cy), n(RF)))
    s.append('<circle cx="%s" cy="%s" r="%s" fill="none" stroke="#000" stroke-width="7" opacity=".35"/>' % (n(cx), n(cy), n(RF - 3)))
    s.append('</g>')
    return ''.join(s)


# ----------------------------------------------------------------------------- instruments

def inst_arrive(cx, cy):
    """airspeed style dial: minutes before the gates open, 120 down to 0 over 240 degrees"""
    def ang(v):
        return -120 + (120 - v) / 120.0 * 240
    s = [case(cx, cy)]
    ra = 130.5
    s.append('<path d="%s" fill="none" stroke="%s" stroke-width="9"/>' % (arc(cx, cy, ra, ang(120), ang(90)), WHITE))
    s.append('<path d="%s" fill="none" stroke="#35C46A" stroke-width="9"/>' % arc(cx, cy, ra, ang(90), ang(50)))
    s.append('<path d="%s" fill="none" stroke="%s" stroke-width="9"/>' % (arc(cx, cy, ra, ang(30), ang(0)), AMBER))
    s.append('<path d="%s" fill="none" stroke="%s" stroke-width="9"/>' % (arc(cx, cy, ra, ang(0), ang(-12)), RED))
    for v in range(0, 121, 5):
        a = ang(v)
        if v % 30 == 0:
            s.append(tick(cx, cy, 124.5, 101, a, 4))
        elif v % 10 == 0:
            s.append(tick(cx, cy, 124.5, 109, a, 2.4))
        else:
            s.append(tick(cx, cy, 124.5, 115, a, 1.5, DIM))
    # red radial line at gates open
    s.append(tick(cx, cy, 136, 103, ang(0), 4.5, RED))
    for v in (120, 90, 60, 30, 0):
        x, y = P(cx, cy, 80, ang(v))
        s.append(T(x, y, str(v), 31, 700))
    s.append(T(cx, cy + 71, 'ARRIVE', 19, 700, ls=3.2))
    s.append(T(cx, cy + 92, 'MINUTES BEFORE', 9.6, 600, DIM, ls=2.1))
    s.append(T(cx, cy + 106, 'THE GATES OPEN', 9.6, 600, DIM, ls=2.1))
    s.append(needle(cx, cy, ang(60), 118, base=10, tail=30))
    s.append(hub(cx, cy))
    s.append(glass(cx, cy))
    return ''.join(s)


def inst_attitude(cx, cy):
    bank = -9.0      # horizon rolled a few degrees
    pitch = 2.5      # nose a touch above the horizon
    ppd = 3.7        # px per degree of pitch
    rb = 101         # ball radius
    rr = RF - 4      # outer edge of the bank ring
    cid = 'clipAtt'
    s = [case(cx, cy, knobs=())]
    s.append('<clipPath id="%s"><circle cx="%s" cy="%s" r="%s"/></clipPath>' % (cid, n(cx), n(cy), n(rb)))
    s.append('<clipPath id="%sR"><path d="M%s %s m-%s 0 a%s %s 0 1 0 %s 0 a%s %s 0 1 0 -%s 0 M%s %s m-%s 0 a%s %s 0 1 1 %s 0 a%s %s 0 1 1 -%s 0" clip-rule="evenodd"/></clipPath>' % (
        cid, n(cx), n(cy), n(rr), n(rr), n(rr), n(2 * rr), n(rr), n(rr), n(2 * rr),
        n(cx), n(cy), n(rb), n(rb), n(rb), n(2 * rb), n(rb), n(rb), n(2 * rb)))
    # bank ring: sky above, ground below, rolls with the horizon
    s.append('<g clip-path="url(#%sR)"><g transform="rotate(%s %s %s)">' % (cid, n(bank), n(cx), n(cy)))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" fill="#1273B4"/>' % (n(cx - 160), n(cy - 160), 320, 160))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" fill="#6B4020"/>' % (n(cx - 160), n(cy), 320, 160))
    s.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="2.4"/>' % (n(cx - 160), n(cy), n(cx + 160), n(cy), WHITE))
    for a in (-60, -30, -20, -10, 10, 20, 30, 60):
        ln = 30 if abs(a) in (30, 60) else 16
        s.append(tick(cx, cy, rr, rr - ln, a, 3.2 if abs(a) in (30, 60) else 2.2))
    for a in (-45, 45):
        x, y = P(cx, cy, rr - 12, a)
        s.append('<circle cx="%s" cy="%s" r="3.4" fill="%s"/>' % (n(x), n(y), WHITE))
    # zero index triangle on the ring
    x0, y0 = P(cx, cy, rb + 3, 0)
    s.append('<path d="M%s %s L%s %s L%s %s Z" fill="%s"/>' % (n(x0), n(y0), n(x0 - 10), n(cy - rr + 2), n(x0 + 10), n(cy - rr + 2), WHITE))
    s.append('</g></g>')
    # ball
    s.append('<g clip-path="url(#%s)"><g transform="rotate(%s %s %s) translate(0 %s)">' % (cid, n(bank), n(cx), n(cy), n(pitch * ppd)))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" fill="url(#gSky)"/>' % (n(cx - 180), n(cy - 260), 360, 260))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" fill="url(#gGround)"/>' % (n(cx - 180), n(cy), 360, 260))
    s.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="2.6"/>' % (n(cx - 180), n(cy), n(cx + 180), n(cy), WHITE))
    for d in (5, 10, 15, 20):
        for sg in (-1, 1):
            yy = cy - sg * d * ppd
            half = (34 if d == 10 else 28) if d % 10 == 0 else 15
            s.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="2.2"/>' % (n(cx - half), n(yy), n(cx + half), n(yy), WHITE))
            if d % 10 == 0:
                s.append(T(cx - half - 12, yy, str(d), 13, 700))
                s.append(T(cx + half + 12, yy, str(d), 13, 700))
    s.append('</g>')
    s.append('<circle cx="%s" cy="%s" r="%s" fill="url(#gBall)"/>' % (n(cx), n(cy), n(rb)))
    s.append('</g>')
    s.append('<circle cx="%s" cy="%s" r="%s" fill="none" stroke="#000" stroke-width="2.5" opacity=".8"/>' % (n(cx), n(cy), n(rb)))
    # fixed sky pointer
    xt, yt = P(cx, cy, rb - 2, 0)
    s.append('<path d="M%s %s L%s %s L%s %s Z" fill="%s" stroke="#1A1206" stroke-width="1.2" stroke-linejoin="round"/>' % (
        n(xt), n(yt + 1), n(xt - 9.5), n(yt + 19), n(xt + 9.5), n(yt + 19), AMBER))
    # fixed aircraft symbol
    wing = ('M%s %s h%s v%s h%s v%s h%s Z' % (n(cx - 76), n(cy - 3.6), 46, 14, -7.2, -6.8, -38.8))
    wing2 = ('M%s %s h%s v%s h%s v%s h%s Z' % (n(cx + 76), n(cy - 3.6), -46, 14, 7.2, -6.8, 38.8))
    for d in (wing, wing2):
        s.append('<path d="%s" fill="%s" stroke="#1A1206" stroke-width="1.6" stroke-linejoin="round"/>' % (d, AMBER))
    s.append('<circle cx="%s" cy="%s" r="5.4" fill="%s" stroke="#1A1206" stroke-width="1.6"/>' % (n(cx), n(cy), AMBER))
    # caging knob at the bottom of the bezel
    s.append(knob(cx, cy + R - 4, 15))
    s.append(glass(cx, cy))
    return ''.join(s)


def inst_altimeter(cx, cy):
    alt = 5500
    s = [case(cx, cy, knobs=((-1, 1),))]
    for i in range(50):
        a = i * 7.2
        if i % 5 == 0:
            s.append(tick(cx, cy, 134, 113, a, 3.8))
        else:
            s.append(tick(cx, cy, 134, 123, a, 1.8))
    for k in range(10):
        x, y = P(cx, cy, 93, k * 36)
        s.append(T(x, y, str(k), 35, 700))
    s.append(T(cx, cy - 64, 'CLOUD BASE', 10.2, 600, DIM, ls=2.2))
    s.append(T(cx, cy - 47, 'ALT', 19, 700, ls=3.4))
    s.append(T(cx - 44, cy + 3, '100', 12.5, 700, ls=.6))
    s.append(T(cx - 44, cy + 17, 'FEET', 8.6, 600, DIM, ls=1.8))
    # pressure window between 2 and 3
    wx, wy, ww, wh = cx + 33, cy - 12.5, 44, 25
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="3" fill="#D9DED6" stroke="#000" stroke-width="2"/>' % (n(wx), n(wy), ww, wh))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="3" fill="url(#gWin)"/>' % (n(wx), n(wy), ww, wh))
    s.append(T(wx + ww / 2.0, wy + wh / 2.0 + .5, '1013', 14.5, 600, '#11161B', cls='mono', ls=.4))
    s.append('<path d="M%s %s l-7 -4.5 v9 Z" fill="%s"/>' % (n(wx - 3), n(cy), WHITE))
    # ten thousand foot pointer: thin, with a triangle at the scale
    a3 = alt / 100000.0 * 360
    s.append('<g transform="rotate(%s %s %s)">' % (n(a3), n(cx), n(cy)))
    s.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="2.2"/>' % (n(cx), n(cy), n(cx), n(cy - 120), WHITE))
    s.append('<path d="M%s %s l-8 -15 h16 Z" fill="%s"/>' % (n(cx), n(cy - 111), WHITE))
    s.append('</g>')
    # thousands pointer: short and broad
    a2 = alt / 10000.0 * 360
    s.append('<g transform="rotate(%s %s %s)">' % (n(a2), n(cx), n(cy)))
    s.append('<path d="M%s %s L%s %s L%s %s L%s %s L%s %s Z" fill="#000" opacity=".45" transform="translate(2.5 3.5)"/>' % (
        n(cx - 5), n(cy), n(cx - 11), n(cy - 44), n(cx), n(cy - 70), n(cx + 11), n(cy - 44), n(cx + 5), n(cy)))
    s.append('<path d="M%s %s L%s %s L%s %s L%s %s L%s %s Z" fill="%s"/>' % (
        n(cx - 5), n(cy), n(cx - 11), n(cy - 44), n(cx), n(cy - 70), n(cx + 11), n(cy - 44), n(cx + 5), n(cy), WHITE))
    s.append('</g>')
    # hundreds pointer: long and slim
    a1 = (alt % 1000) / 1000.0 * 360
    s.append(needle(cx, cy, a1, 121, base=8.5, tail=30, tip=0.2))
    s.append(hub(cx, cy))
    d = (R - 1) * 0.70711
    s.append(knob(cx - d, cy + d, 17))
    s.append(glass(cx, cy))
    return ''.join(s)


def inst_turn(cx, cy):
    bank = 20.0
    s = [case(cx, cy)]
    # wing level and standard rate index marks
    for a in (-90, 90):
        s.append(tick(cx, cy, 132, 103, a, 7))
    for a in (-110, 110):
        s.append(tick(cx, cy, 132, 107, a, 7))
    xl, yl = P(cx, cy, 91, -112)
    xr, yr = P(cx, cy, 91, 112)
    s.append(T(xl + 3, yl + 6, 'L', 24, 700))
    s.append(T(xr - 3, yr + 6, 'R', 24, 700))
    s.append(T(cx, cy - 96, 'TURN FOR HOME', 12.6, 700, ls=2.6))
    s.append(T(cx, cy - 78, 'COORDINATOR', 8.6, 600, DIM, ls=2.4))
    # inclinometer: curved glass tube, ball centred
    rc, yc0 = 190.0, cy + 66 - 190.0
    half = 15.5
    x1 = cx - rc * math.sin(math.radians(half)); y1 = yc0 + rc * math.cos(math.radians(half))
    x2 = cx + rc * math.sin(math.radians(half))
    tube = 'M%s %s A%s %s 0 0 0 %s %s' % (n(x1), n(y1), n(rc), n(rc), n(x2), n(y1))
    s.append('<path d="%s" fill="none" stroke="#000" stroke-width="31" stroke-linecap="round"/>' % tube)
    s.append('<path d="%s" fill="none" stroke="#DCE2D6" stroke-width="25" stroke-linecap="round"/>' % tube)
    s.append('<path d="%s" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" transform="translate(0 -6)"/>' % tube)
    for dx in (-14, 14):
        s.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="#0A0D10" stroke-width="2.2"/>' % (n(cx + dx), n(cy + 53.5), n(cx + dx), n(cy + 78.5)))
    s.append('<circle cx="%s" cy="%s" r="11.4" fill="url(#gBallBk)"/>' % (n(cx), n(cy + 66)))
    s.append('<circle cx="%s" cy="%s" r="2.6" fill="#fff" opacity=".5"/>' % (n(cx - 3.6), n(cy + 62)))
    s.append(T(cx, cy + 101, '1 HR TURN', 15.5, 700, ls=2.6))
    s.append(T(cx, cy + 119, 'NO PITCH INFORMATION', 7.6, 600, DIM, ls=1.6))
    # miniature aircraft seen from behind, banked into a right turn
    s.append('<g transform="rotate(%s %s %s)">' % (n(bank), n(cx), n(cy)))
    sh = 'M%s %s L%s %s L%s %s L%s %s L%s %s L%s %s Z' % (
        n(cx - 98), n(cy - 1.6), n(cx - 16), n(cy - 5.5), n(cx + 16), n(cy - 5.5), n(cx + 98), n(cy - 1.6),
        n(cx + 98), n(cy + 2.4), n(cx - 98), n(cy + 2.4))
    s.append('<path d="%s" fill="#000" opacity=".5" transform="translate(2 4)"/>' % sh)
    s.append('<path d="%s" fill="%s"/>' % (sh, WHITE))
    s.append('<rect x="%s" y="%s" width="62" height="5" rx="2.5" fill="%s"/>' % (n(cx - 31), n(cy - 19), WHITE))
    s.append('<rect x="%s" y="%s" width="5.4" height="34" rx="2.4" fill="%s"/>' % (n(cx - 2.7), n(cy - 43), WHITE))
    s.append('<circle cx="%s" cy="%s" r="15" fill="%s" stroke="#0A0D10" stroke-width="1.5"/>' % (n(cx), n(cy), WHITE))
    s.append('<circle cx="%s" cy="%s" r="5" fill="#0A0D10"/>' % (n(cx), n(cy)))
    s.append('</g>')
    s.append(glass(cx, cy))
    return ''.join(s)


def inst_heading(cx, cy):
    hdg = 270
    rc = 128
    s = [case(cx, cy, knobs=((-1, 1), (1, 1)))]
    names = {0: 'N', 30: '3', 60: '6', 90: 'E', 120: '12', 150: '15', 180: 'S', 210: '21', 240: '24', 270: 'W', 300: '30', 330: '33'}
    s.append('<circle cx="%s" cy="%s" r="%s" fill="#0C1115" stroke="#000" stroke-width="1"/>' % (n(cx), n(cy), n(rc)))
    s.append('<g transform="rotate(%s %s %s)">' % (n(-hdg), n(cx), n(cy)))
    for d in range(0, 360, 5):
        if d % 10 == 0:
            s.append(tick(cx, cy, rc - 2, rc - 20, d, 2.6))
        else:
            s.append(tick(cx, cy, rc - 2, rc - 11, d, 1.6))
    for d, lab in names.items():
        x, y = P(cx, cy, rc - 39, d)
        card = lab in 'NESW'
        s.append(T(x, y, lab, 30 if card else 25, 700, WHITE, rot=d))
    # heading bug, set on the heading being flown
    xb, yb = P(cx, cy, rc + 1, hdg)
    s.append('<g transform="rotate(%s %s %s)"><path d="M%s %s h-13 v-11 h7 l6 8 l6 -8 h7 v11 Z" fill="%s" stroke="#1A1206" stroke-width="1"/></g>' % (
        n(hdg), n(xb), n(yb), n(xb), n(yb + 11), AMBER))
    s.append('</g>')
    # fixed marks round the card
    for a in (45, 90, 135, 180, 225, 270, 315):
        x, y = P(cx, cy, rc + 3, a)
        s.append('<g transform="rotate(%s %s %s)"><path d="M%s %s l-4.6 -8 h9.2 Z" fill="%s"/></g>' % (n(a), n(x), n(y), n(x), n(y + 8), WHITE))
    # lubber line
    s.append('<path d="M%s %s l-7 -12 h14 Z" fill="%s"/>' % (n(cx), n(cy - rc + 9), WHITE))
    s.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="2.2"/>' % (n(cx), n(cy - rc + 6), n(cx), n(cy - 52), WHITE))
    # fixed aircraft outline, nose up
    pts = [(0, -50), (4.6, -40), (5.8, -17), (46, -10), (48, -1.5), (5.8, 3), (4.4, 27), (18, 32.5), (18, 38.5), (0, 41.5)]
    full = pts + [(-x, y) for x, y in reversed(pts[1:-1])]
    d = 'M' + ' L'.join('%s %s' % (n(cx + x), n(cy + y)) for x, y in full) + ' Z'
    s.append('<path d="%s" fill="#0C1115" stroke="%s" stroke-width="2.6" stroke-linejoin="round"/>' % (d, WHITE))
    s.append(T(cx, cy + 66, 'HEADING', 10.4, 600, DIM, ls=2.6))
    dk = (R - 1) * 0.70711
    s.append(knob(cx - dk, cy + dk, 17))
    s.append(knob(cx + dk, cy + dk, 17))
    s.append(glass(cx, cy))
    return ''.join(s)


def inst_water(cx, cy):
    """vertical speed style dial: zero at nine o'clock, litres per person, needle on 2, up"""
    per = 80.0   # degrees per litre
    def ang(v, up=True):
        return -90 + (v * per if up else -v * per)
    s = [case(cx, cy, knobs=())]
    for up in (True, False):
        for i in range(0, 21):
            v = i / 10.0
            if i == 0 and not up:
                continue
            a = ang(v, up)
            if i % 5 == 0:
                s.append(tick(cx, cy, 134, 111, a, 3.8))
            else:
                s.append(tick(cx, cy, 134, 122, a, 1.8))
    lab = {0.5: '.5', 1: '1', 1.5: '1.5', 2: '2'}
    for up in (True, False):
        for v, t in lab.items():
            x, y = P(cx, cy, 91, ang(v, up))
            s.append(T(x, y, t, 29 if len(t) < 3 else 26, 700))
    x, y = P(cx, cy, 91, -90)
    s.append(T(x, y, '0', 31, 700))
    # stop peg between the two ends of the scale
    xs, ys = P(cx, cy, 124, 90)
    s.append('<circle cx="%s" cy="%s" r="4.2" fill="#C9D0D6" stroke="#000" stroke-width="1"/>' % (n(xs), n(ys)))
    # UP and DN with their arrows
    s.append(T(cx - 37, cy - 24, 'UP', 14.5, 700, ls=1.6))
    s.append('<path d="%s" fill="none" stroke="%s" stroke-width="2.2"/>' % (arc(cx, cy, 67, -80, -61), WHITE))
    xa, ya = P(cx, cy, 67, -57)
    s.append('<g transform="rotate(%s %s %s)"><path d="M%s %s l-5.5 0 l5.5 -10 l5.5 10 Z" fill="%s"/></g>' % (n(33), n(xa), n(ya), n(xa), n(ya + 4), WHITE))
    s.append(T(cx - 37, cy + 24, 'DN', 14.5, 700, DIM, ls=1.6))
    x1, y1 = P(cx, cy, 67, -100); x2, y2 = P(cx, cy, 67, -119)
    s.append('<path d="M%s %s A67 67 0 0 0 %s %s" fill="none" stroke="%s" stroke-width="2.2"/>' % (n(x1), n(y1), n(x2), n(y2), DIM))
    xa, ya = P(cx, cy, 67, -123)
    s.append('<g transform="rotate(%s %s %s)"><path d="M%s %s l-5.5 0 l5.5 -10 l5.5 10 Z" fill="%s"/></g>' % (n(147), n(xa), n(ya), n(xa), n(ya + 4), DIM))
    s.append(T(cx + 8, cy - 55, 'WATER', 17, 700, ls=3))
    s.append(T(cx + 10, cy + 50, 'LITRES', 9.6, 600, DIM, ls=2.2))
    s.append(T(cx + 10, cy + 64, 'PER PERSON', 9.6, 600, DIM, ls=2.2))
    s.append(needle(cx, cy, ang(2, True), 119, base=10, tail=30))
    s.append(hub(cx, cy))
    s.append(glass(cx, cy))
    return ''.join(s)


# ----------------------------------------------------------------------------- panel

def grain():
    random.seed(5)
    out = []
    for _ in range(420):
        x, y = random.uniform(0, 200), random.uniform(0, 200)
        c = '#fff' if random.random() < .55 else '#000'
        o = random.uniform(.025, .075)
        s = random.choice((1, 1, 1, 1.5))
        out.append('<rect x="%s" y="%s" width="%s" height="%s" fill="%s" opacity="%.3f"/>' % (n(x), n(y), s, s, c, o))
    return ''.join(out)


ANN = [('TICKETS', 'g'), ('PARKING', 'g'), ('EAR DEFENDERS', 'a'), ('SUN CREAM', 'a'), ('POWER BANK', 'g'), ('LAST TRAIN', 'r')]
ANN_COL = {'g': ('#59E08C', '#1E8F45'), 'a': ('#FFCB55', '#B8791A'), 'r': ('#FF7A72', '#B32A2A')}
ANN_Y, ANN_H = 432, 54
PLATE_Y0 = ROW[0] - R - 36
PLATE_Y1 = ROW[1] + R + 14 + PL_H + 28


def annunciators():
    s = []
    x0, x1 = 70, 1170
    gap = 10
    w = (x1 - x0 - gap * 5 - 28) / 6.0
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="7" fill="#04080C" stroke="#1B2833" stroke-width="1"/>' % (x0, ANN_Y, x1 - x0, ANN_H))
    s.append('<rect x="%s" y="%s" width="%s" height="1.2" fill="#000" opacity=".8"/>' % (x0 + 6, ANN_Y + 1, x1 - x0 - 12))
    for i, (lab, k) in enumerate(ANN):
        bright, deep = ANN_COL[k]
        x = x0 + 14 + i * (w + gap)
        y = ANN_Y + 9
        h = ANN_H - 18
        s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="3.5" fill="%s" opacity=".5" filter="url(#fGlow)"/>' % (n(x), n(y), n(w), n(h), deep))
        s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="3.5" fill="#080C10" stroke="#000" stroke-width="1.4"/>' % (n(x), n(y), n(w), n(h)))
        s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="3.5" fill="%s" opacity=".30"/>' % (n(x), n(y), n(w), n(h), deep))
        s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="2.5" fill="none" stroke="%s" stroke-width="1" opacity=".55"/>' % (n(x + 3), n(y + 3), n(w - 6), n(h - 6), bright))
        s.append(T(x + w / 2.0, y + h / 2.0 + .5, lab, 15.5, 700, bright, ls=2.4, extra=' filter="url(#fText)"'))
        s.append(T(x + w / 2.0, y + h / 2.0 + .5, lab, 15.5, 700, bright, ls=2.4))
    return ''.join(s)


def plate():
    s = []
    x0, x1 = 70, 1170
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="16" fill="#000" opacity=".5" filter="url(#fSoft)"/>' % (x0 + 2, PLATE_Y0 + 7, x1 - x0, PLATE_Y1 - PLATE_Y0))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="16" fill="url(#gPlate)" stroke="#02060A" stroke-width="1.5"/>' % (x0, PLATE_Y0, x1 - x0, PLATE_Y1 - PLATE_Y0))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="15" fill="none" stroke="#3A5266" stroke-width="1" opacity=".45"/>' % (x0 + 1.5, PLATE_Y0 + 1.5, x1 - x0 - 3, PLATE_Y1 - PLATE_Y0 - 3))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="16" fill="url(#pGrain)" opacity=".8"/>' % (x0, PLATE_Y0, x1 - x0, PLATE_Y1 - PLATE_Y0))
    for k, (sx, sy) in enumerate(((x0 + 21, PLATE_Y0 + 21), (x1 - 21, PLATE_Y0 + 21), (x1 - 21, PLATE_Y1 - 21), (x0 + 21, PLATE_Y1 - 21))):
        s.append(screw(sx, sy, 7.5, rot=[20, 75, 140, 105][k]))
    return ''.join(s)


def placard(cx, cy):
    x = cx - PL_W / 2.0
    y = cy + R + 14
    s = []
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="5" fill="#000" opacity=".5" transform="translate(1.5 3)"/>' % (n(x), n(y), PL_W, PL_H))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="5" fill="url(#gPlacard)" stroke="#000" stroke-width="1.2"/>' % (n(x), n(y), PL_W, PL_H))
    s.append('<rect x="%s" y="%s" width="%s" height="%s" rx="3" fill="none" stroke="#C9D6E0" stroke-width=".9" opacity=".30"/>' % (n(x + 5), n(y + 5), PL_W - 10, PL_H - 10))
    s.append(screw(x + 17, y + PL_H / 2.0, 3.6, rot=35 + cx % 50))
    s.append(screw(x + PL_W - 17, y + PL_H / 2.0, 3.6, rot=120 + cy % 50))
    return ''.join(s)


INST = [inst_arrive, inst_attitude, inst_altimeter, inst_turn, inst_heading, inst_water]
PLAC = [
    ('Arrive', ['About an hour before', 'the gates open.']),
    ('Attitude', ['Stay positive. Airshows are very', 'rarely cancelled for rain.']),
    ('Cloud base', ['Above 5,500 ft for a full', 'Red Arrows show.']),
    ('Turn for home', ['Stay an hour, or go early.', 'The worst time is the ten', 'minutes after the finale.']),
    ('Heading', ['Follow the marshals,', 'not your sat nav.']),
    ('Drink up', ['Two litres per person', 'on a hot day.']),
]

DEFS = '''
<defs>
  <linearGradient id="gBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1824"/><stop offset=".45" stop-color="#08141E"/><stop offset="1" stop-color="#050D15"/></linearGradient>
  <radialGradient id="gVig" cx=".5" cy=".42" r=".8"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  <linearGradient id="gPlate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12283A"/><stop offset=".5" stop-color="#0E2030"/><stop offset="1" stop-color="#0A1926"/></linearGradient>
  <linearGradient id="gBezel" x1=".15" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#4A5661"/><stop offset=".45" stop-color="#1D252C"/><stop offset="1" stop-color="#07090B"/></linearGradient>
  <linearGradient id="gBezelIn" x1=".15" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#06080A"/><stop offset=".6" stop-color="#151B20"/><stop offset="1" stop-color="#39434C"/></linearGradient>
  <radialGradient id="gFace" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#11161B"/><stop offset="1" stop-color="#040608"/></radialGradient>
  <radialGradient id="gGlass" cx=".32" cy=".2" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".13"/><stop offset=".45" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="gHub" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#5A6670"/><stop offset=".6" stop-color="#1B2228"/><stop offset="1" stop-color="#07090B"/></radialGradient>
  <radialGradient id="gScrew" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8B98A3"/><stop offset=".55" stop-color="#3A454E"/><stop offset="1" stop-color="#12171B"/></radialGradient>
  <radialGradient id="gKnob" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#3B454D"/><stop offset=".6" stop-color="#151A1F"/><stop offset="1" stop-color="#050709"/></radialGradient>
  <radialGradient id="gKnobTop" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#58646E"/><stop offset=".7" stop-color="#1A2026"/><stop offset="1" stop-color="#0A0D10"/></radialGradient>
  <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A5E9E"/><stop offset=".72" stop-color="#1583C8"/><stop offset="1" stop-color="#3FA9E3"/></linearGradient>
  <linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5A2E"/><stop offset=".3" stop-color="#6E4321"/><stop offset="1" stop-color="#4A2B13"/></linearGradient>
  <radialGradient id="gBall" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>
  <radialGradient id="gBallBk" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#4A535B"/><stop offset=".5" stop-color="#101418"/><stop offset="1" stop-color="#000"/></radialGradient>
  <linearGradient id="gWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
  <linearGradient id="gPlacard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1118"/><stop offset="1" stop-color="#04070B"/></linearGradient>
  <filter id="fSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="fGlow" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="fText" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation="3.2"/></filter>
  <pattern id="pGrain" width="200" height="200" patternUnits="userSpaceOnUse">__GRAIN__</pattern>
</defs>
'''

CSS = '''
@page{size:420mm 594.1mm;margin:0} /* A2 paper for build/render.js, so the PDF fills the sheet */
.slide{background:#07121C;color:#fff}
.art text{font-family:var(--c)}
.art text.mono{font-family:var(--m)}
.eyebrow{font-family:var(--m);font-weight:500;font-size:14px;line-height:1;letter-spacing:4.2px;text-transform:uppercase;color:var(--mint)}
.h1{font-family:var(--c);font-weight:900;font-style:italic;font-size:125px;line-height:.98;letter-spacing:-.6px;text-transform:uppercase;color:#fff}
.h1 span{color:var(--red)}
.sub{font-family:var(--f);font-weight:500;font-size:29px;line-height:1.2;color:var(--soft)}
.pt{font-family:var(--c);font-weight:700;font-size:20px;line-height:1;letter-spacing:3px;text-transform:uppercase;color:#fff;text-align:center;margin:0 auto;width:fit-content}
.pb{font-family:var(--f);font-weight:500;font-size:15.5px;line-height:19.5px;color:#C2CFD9;text-align:center;margin:0 auto;width:fit-content}
.so-url{color:#fff}
.so-tag{color:var(--mint)}
.foot{font-family:var(--f);font-weight:500;font-size:17px;line-height:1.38;color:#9FB0BD;text-align:right}
'''


def build():
    art = []
    art.append('<rect width="%d" height="%d" fill="url(#gBg)"/>' % (W, H))
    art.append('<rect width="%d" height="%d" fill="url(#pGrain)"/>' % (W, H))
    art.append('<rect width="%d" height="%d" fill="url(#gVig)"/>' % (W, H))
    # outer panel fasteners
    for k, (sx, sy) in enumerate(((34, 34), (W - 34, 34), (W - 34, H - 34), (34, H - 34))):
        art.append(screw(sx, sy, 7, rot=[40, 95, 15, 130][k]))
    art.append(annunciators())
    art.append(plate())
    idx = 0
    for cy in ROW:
        for cx in CX:
            art.append(placard(cx, cy))
            art.append(INST[idx](cx, cy))
            idx += 1
    live = []
    live.append('<div data-live class="eyebrow" style="left:72px;top:76px">The six pack</div>')
    live.append('<div data-live class="h1" style="left:68px;top:100px">Show day,<br>by the instruments<span>.</span></div>')
    live.append('<div data-live class="sub" style="left:72px;top:356px">Six dials to check before you fly the day.</div>')
    idx = 0
    for cy in ROW:
        for cx in CX:
            title, lines = PLAC[idx]
            idx += 1
            y = cy + R + 14
            block = 20 + 9 + len(lines) * 19.5
            top = y + (PL_H - block) / 2.0 + 1
            x0 = cx - PL_W / 2.0 + 30
            x1 = W - (cx + PL_W / 2.0 - 30)
            live.append('<div data-live class="pt" style="left:%spx;right:%spx;top:%spx">%s</div>' % (n(x0), n(x1), n(top), title))
            live.append('<div data-live class="pb" style="left:%spx;right:%spx;top:%spx">%s</div>' % (n(x0), n(x1), n(top + 29), '<br>'.join(lines)))
    live.append('<img class="logo" src="img/uk-airshow-guide-logo.png" alt="UK Airshow Guide" style="left:70px;top:1536px;width:290px">')
    live.append('<div data-live class="so-tag" style="right:70px;top:1614px">Plan your airshow series 05 / 10</div>')
    live.append('<div data-live class="so-url" style="right:70px;top:1642px">ukairshowguide.co.uk</div>')

    html = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Show day, by the instruments | UK Airshow Guide poster 05</title>
<link rel="stylesheet" href="https://use.typekit.net/vyp4rci.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500;1,700&family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="kit.css">
<style>__CSS__</style>
</head>
<body>
<!-- Generated by build/gen_05.py. Edit the generator, not this file. -->
<div class="slide">
<svg class="art" viewBox="0 0 1240 1754" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">__DEFS__
__ART__
</svg>
__LIVE__
</div>
</body>
</html>
'''
    html = html.replace('__CSS__', CSS).replace('__DEFS__', DEFS.replace('__GRAIN__', grain()))
    html = html.replace('__ART__', '\n'.join(art)).replace('__LIVE__', '\n'.join(live))
    with open(OUT, 'w') as fh:
        fh.write(html)
    print('wrote', os.path.normpath(OUT), len(html), 'bytes')


if __name__ == '__main__':
    build()
