#!/usr/bin/env python3
"""Poster 02, Every way in: a transit style network map whose lines draw an aircraft.
Six ways to travel are six lines. Each line is the leading edge of a wing, canard or
tailplane, they bundle up the fuselage and all terminate at the nose, THE SHOW.
Every stop is a piece of advice taken from the guide's own travel pages.
Run:  python3 -I build/gen_02.py   (writes 02-every-way-in.html)"""
import math, os

W, H = 1240, 1754
CX = 620
TAN = math.tan(math.radians(30))
LW = 13            # line width
PITCH = 18         # distance between parallel lines in the fuselage bundle

COL = {
    'train': '#D74949', 'car': '#13293C', 'bus': '#00A6E2',
    'coach': '#C2255C', 'pr': '#2BA84A', 'taxi': '#F5B942',
    'walk': '#6B7C89',
}
INK = '#14212C'
PAPER = '#FBF9F4'
SHADE = '#ECE6D9'   # the pale aircraft silhouette
GRID = '#E9E4D8'

# vertical landmarks
Y_HEAD = 300        # bottom of the header band
Y_CROWD = 352       # crowd line marker
Y_TIP = 414         # nose tip
Y_BASE = 566        # nose base, where the lines terminate
Y_ALL = 634         # all lines interchange
Y_C = 700           # canard root
Y_W = 905           # wing root
Y_T = 1150          # tailplane root
Y_MAP_END = 1462
Y_LED_END = 1572

# x of each line inside the bundle (inner pair joins first, at the tail)
X = {'bus': CX - 9, 'coach': CX + 9, 'train': CX - 27, 'car': CX + 27, 'pr': CX - 45, 'taxi': CX + 45}

# name, side (-1 left, +1 right), root y, station offsets along x, tip offset, pill text, stations tip -> root
LINES = [
    ('pr', -1, Y_C, [168, 110, 52], 212, 'PARK AND RIDE',
     ['Book it with your ticket', 'Buses run in a loop all day', 'Ask when the last bus back leaves']),
    ('taxi', 1, Y_C, [168, 110, 52], 212, 'TAXI',
     ['Book the return the day before', 'Agree a pick up point', 'Ask for an hour after the finale']),
    ('train', -1, Y_W, [316, 252, 188, 124, 60], 366, 'TRAIN',
     ['Check the train app', 'Find the last train home', 'Screenshot the last two departures',
      'Check the app again in the morning', 'Follow the stewards out of the station']),
    ('car', 1, Y_W, [316, 252, 188, 124, 60], 366, 'CAR',
     ['Pre-book parking', "Print the show's route", 'Fuel in the tank, or the car charged',
      'Follow the marshals, not your sat nav', 'Park facing out, photograph a landmark']),
    ('bus', -1, Y_T, [168, 110, 52], 212, 'BUS',
     ['Buses are often diverted on show days', "Some shuttles don't take passes", 'Buses fill up after the flying']),
    ('coach', 1, Y_T, [150, 72], 212, 'COACH',
     ['Book in advance', 'Book your seat back too']),
]

def f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

out = []
A = out.append

# ---------------------------------------------------------------- defs and paper
A('<svg class="art" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg">' % (W, H))
A('<defs>'
  '<linearGradient id="hd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1A27"/><stop offset="1" stop-color="#13293C"/></linearGradient>'
  '<linearGradient id="ft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#13293C"/><stop offset="1" stop-color="#0B1A27"/></linearGradient>'
  '<radialGradient id="lit" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFD36A"/><stop offset=".55" stop-color="#FFB21A"/><stop offset="1" stop-color="#E08A00"/></radialGradient>'
  '</defs>')
A('<rect x="0" y="0" width="%d" height="%d" fill="%s"/>' % (W, H, PAPER))

# map grid with index letters, like a printed network map
gx0, gx1, gy0, gy1 = 70, 1170, 322, 1444
cols, rows = 8, 8
A('<g stroke="%s" stroke-width="1">' % GRID)
for i in range(cols + 1):
    x = gx0 + (gx1 - gx0) * i / cols
    A('<line x1="%s" y1="%s" x2="%s" y2="%s"/>' % (f(x), gy0, f(x), gy1))
for j in range(rows + 1):
    y = gy0 + (gy1 - gy0) * j / rows
    A('<line x1="%s" y1="%s" x2="%s" y2="%s"/>' % (gx0, f(y), gx1, f(y)))
A('</g>')
A('<g font-family="ibm-plex-mono,IBM Plex Mono,monospace" font-size="10" font-weight="500" fill="#B4AC9A" text-anchor="middle">')
for i in range(cols):
    x = gx0 + (gx1 - gx0) * (i + .5) / cols
    A('<text x="%s" y="%s">%s</text>' % (f(x), gy1 + 13, 'ABCDEFGH'[i]))
for j in range(rows):
    y = gy0 + (gy1 - gy0) * (j + .5) / rows
    A('<text x="%s" y="%s">%d</text>' % (gx0 - 12, f(y + 3.5), j + 1))
    A('<text x="%s" y="%s">%d</text>' % (gx1 + 12, f(y + 3.5), j + 1))
A('</g>')

# ---------------------------------------------------------------- pale aircraft silhouette
def diag_y(root_x, root_y, x):
    """y of a 30 degree leading edge that reaches the bundle at (root_x, root_y)."""
    return root_y + abs(root_x - x) * TAN

FUS = 64   # half width of the pale fuselage
sil = []
# fuselage with a tapered tail cone
sil.append('M%d %d L%d %d L%d %d L%d %d L%d %d L%d %d Z' % (
    CX - FUS, Y_BASE, CX - FUS, Y_T + 8, CX - 30, Y_T + 76, CX + 30, Y_T + 76, CX + FUS, Y_T + 8, CX + FUS, Y_BASE))
def surface(key, side, root_y, tip_dx, root_chord, tip_chord, te_rise):
    rx = X[key]
    xs = CX + side * (FUS - 2)                     # where the surface meets the fuselage side
    y_le_root = diag_y(rx, root_y, xs)
    xt = rx + side * tip_dx
    y_tip = diag_y(rx, root_y, xt)
    return 'M%s %s L%s %s L%s %s L%s %s Z' % (
        f(xs), f(y_le_root), f(xt), f(y_tip),
        f(xt - side * 16), f(y_tip + tip_chord), f(xs), f(y_le_root + root_chord - te_rise))
for side in (-1, 1):
    sil.append(surface('pr' if side < 0 else 'taxi', side, Y_C, 212, 118, 30, 0))
    sil.append(surface('train' if side < 0 else 'car', side, Y_W, 366, 236, 44, 26))
    sil.append(surface('bus' if side < 0 else 'coach', side, Y_T, 212, 96, 28, 0))
A('<path d="%s" fill="%s"/>' % (' '.join(sil), SHADE))
# two engine nozzles for a little character
A('<rect x="%d" y="%d" width="22" height="16" rx="4" fill="#DDD5C4"/><rect x="%d" y="%d" width="22" height="16" rx="4" fill="#DDD5C4"/>' % (CX - 27, Y_T + 70, CX + 5, Y_T + 70))

# ---------------------------------------------------------------- the lines
R = 30
def line_path(key, side, root_y, tip_dx):
    rx = X[key]
    xt = rx + side * tip_dx
    yt = root_y + tip_dx * TAN
    # rounded corner where the diagonal turns north into the bundle
    ax = rx + side * R * math.cos(math.radians(30))
    ay = root_y + R * math.sin(math.radians(30))
    return 'M%s %s L%s %s Q%s %s %s %s L%s %s' % (f(xt), f(yt), f(ax), f(ay), f(rx), f(root_y), f(rx), f(root_y - R), f(rx), Y_BASE - 4), (xt, yt)

labels = []
order = ['bus', 'coach', 'train', 'car', 'pr', 'taxi']          # inner lines first so outer corners sit on top
bykey = {l[0]: l for l in LINES}
tips = {}
for key in order:
    _, side, root_y, sts, tip_dx, pill, names = bykey[key]
    d, tip = line_path(key, side, root_y, tip_dx)
    tips[key] = tip
    A('<path d="%s" fill="none" stroke="%s" stroke-width="%d" stroke-linejoin="round"/>' % (d, COL[key], LW))
    # terminus bar across the tip
    nx, ny = side * 0.5, -math.cos(math.radians(30))             # unit normal pointing forward and outward
    A('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%d"/>' % (
        f(tip[0] - nx * 17), f(tip[1] - ny * 17), f(tip[0] + nx * 17), f(tip[1] + ny * 17), COL[key], LW))
    # stations: a tick towards the label, tip -> root
    rx = X[key]
    for dx, name in zip(sts, names):
        sx = rx + side * dx
        sy = root_y + dx * TAN
        A('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="7"/>' % (
            f(sx), f(sy), f(sx + nx * 18), f(sy + ny * 18), COL[key]))
        labels.append((sx + nx * 27, sy + ny * 27 + 7, 'end' if side < 0 else 'start', name))

# nose cone on top of the line ends
A('<path d="M%d %d C%d %d %d %d %d %d C%d %d %d %d %d %d Z" fill="#13293C"/>' % (
    CX - FUS, Y_BASE, CX - FUS, Y_BASE - 86, CX - 26, Y_TIP + 34, CX, Y_TIP,
    CX + 26, Y_TIP + 34, CX + FUS, Y_BASE - 86, CX + FUS, Y_BASE))
A('<rect x="%d" y="%d" width="%d" height="9" fill="#0B1A27"/>' % (CX - FUS, Y_BASE - 9, 2 * FUS))
# a small canopy glint and a star for the destination
A('<path d="M%d %d C%d %d %d %d %d %d C%d %d %d %d %d %d Z" fill="#1C3850"/>' % (
    CX - 20, Y_BASE - 78, CX - 20, Y_BASE - 112, CX - 9, Y_BASE - 130, CX, Y_BASE - 136,
    CX + 9, Y_BASE - 130, CX + 20, Y_BASE - 112, CX + 20, Y_BASE - 78))
def star(cx, cy, r, fill):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.42
        pts.append('%s,%s' % (f(cx + rr * math.cos(a)), f(cy + rr * math.sin(a))))
    return '<polygon points="%s" fill="%s"/>' % (' '.join(pts), fill)
A(star(CX, Y_BASE - 44, 15, '#F5B942'))

# the walk to the crowd line: a dotted link out of the nose
A('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="6" stroke-linecap="round" stroke-dasharray="0.1 11"/>' % (CX, Y_TIP - 6, CX, Y_CROWD + 16, COL['walk']))
A('<circle cx="%d" cy="%d" r="11" fill="%s" stroke="%s" stroke-width="5"/>' % (CX, Y_CROWD, PAPER, INK))

# all lines interchange across the full bundle
A('<rect x="%d" y="%d" width="%d" height="24" rx="12" fill="#fff" stroke="%s" stroke-width="4"/>' % (X['pr'] - 13, Y_ALL - 12, (X['taxi'] - X['pr']) + 26, INK))

# ---------------------------------------------------------------- station names
A('<g font-family="barlow,Barlow,Arial,sans-serif" font-weight="600" font-size="18" fill="%s">' % INK)
for x, y, anchor, name in labels:
    A('<text x="%s" y="%s" text-anchor="%s">%s</text>' % (f(x), f(y), anchor, esc(name)))
A('</g>')

# line name pills at each terminus
def pill(cx, cy, text, fill, ink='#fff'):
    w = len(text) * 9.6 + 26
    return ('<rect x="%s" y="%s" width="%s" height="26" rx="13" fill="%s"/>'
            '<text x="%s" y="%s" text-anchor="middle" font-family="barlow-condensed,Barlow Condensed,sans-serif" font-weight="700" font-size="17" letter-spacing="1.4" fill="%s">%s</text>') % (
        f(cx - w / 2), f(cy - 13), f(w), fill, f(cx), f(cy + 6), ink, text)
for key in order:
    _, side, root_y, sts, tip_dx, ptxt, names = bykey[key]
    tx, ty = tips[key]
    pw = len(ptxt) * 9.6 + 26                      # keep the pill clear of the pale wing: its inner end lines up with the tip
    A(pill(tx + side * (pw / 2 - 12), ty + 38, ptxt, COL[key], '#13293C' if key == 'taxi' else '#fff'))

# labels around the nose
A('<g fill="%s">' % INK)
A('<text x="%d" y="%d" font-family="barlow-condensed,Barlow Condensed,sans-serif" font-weight="800" font-size="46" letter-spacing=".5">THE SHOW</text>' % (CX + FUS + 26, Y_BASE - 62))
A('<text x="%d" y="%d" font-family="barlow,Barlow,sans-serif" font-weight="500" font-size="18" fill="#4A5C6B">All lines terminate here.</text>' % (CX + FUS + 27, Y_BASE - 34))
A('<text x="%d" y="%d" font-family="barlow-condensed,Barlow Condensed,sans-serif" font-weight="700" font-size="22" letter-spacing="1.2">THE CROWD LINE</text>' % (CX + 30, Y_CROWD - 2))
A('<text x="%d" y="%d" font-family="barlow,Barlow,sans-serif" font-weight="500" font-size="17" fill="#4A5C6B">Five minutes to half an hour on foot.</text>' % (CX + 30, Y_CROWD + 21))
A('<text x="%d" y="%d" text-anchor="end" font-family="ibm-plex-mono,IBM Plex Mono,monospace" font-weight="600" font-size="12" letter-spacing="2.2" fill="%s">ALL LINES CALL HERE</text>' % (X['pr'] - 30, Y_ALL - 6, '#D74949'))
A('<text x="%d" y="%d" text-anchor="end" font-family="barlow,Barlow,sans-serif" font-weight="600" font-size="18">Arrive about an hour before the gates</text>' % (X['pr'] - 30, Y_ALL + 16))
A('</g>')

# ---------------------------------------------------------------- map notices
def notice(x, y, w, h, title, lines, accent):
    s = '<rect x="%d" y="%d" width="%d" height="%d" rx="10" fill="#fff" stroke="%s" stroke-width="2"/>' % (x, y, w, h, INK)
    s += '<rect x="%d" y="%d" width="8" height="%d" rx="4" fill="%s"/>' % (x + 14, y + 14, h - 28, accent)
    s += '<text x="%d" y="%d" font-family="ibm-plex-mono,IBM Plex Mono,monospace" font-weight="600" font-size="12" letter-spacing="2.4" fill="%s">%s</text>' % (x + 36, y + 30, INK, title)
    for i, t in enumerate(lines):
        s += '<text x="%d" y="%d" font-family="barlow,Barlow,sans-serif" font-weight="500" font-size="16.5" fill="%s">%s</text>' % (x + 36, y + 54 + i * 22, INK, esc(t))
    return s
A(notice(70, 340, 318, 92, 'HOW TO READ THIS MAP',
         ['Each line is a way to the show.', 'Each stop is a job to do first.'], '#32B4AF'))
A(notice(790, 1334, 380, 114, 'GOING HOME',
         ['The worst time is the ten minutes after', 'the finale. Stay an hour, or go early.', 'Keep 30% of your phone for the trip home.'], '#F5B942'))

# key to lines, bottom left corner of the map
A('<text x="70" y="1318" font-family="ibm-plex-mono,IBM Plex Mono,monospace" font-weight="600" font-size="12" letter-spacing="2.4" fill="%s">KEY TO LINES</text>' % INK)
KEY = [[('train', 'Train'), ('car', 'Car'), ('bus', 'Bus'), ('coach', 'Coach')],
       [('pr', 'Park and Ride'), ('taxi', 'Taxi'), ('walk', 'On foot'), ('all', 'All lines call')]]
for ci, col in enumerate(KEY):
    kx = 70 + ci * 142
    for ri, (key, name) in enumerate(col):
        ky = 1346 + ri * 28
        if key == 'walk':
            A('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="6" stroke-linecap="round" stroke-dasharray="0.1 11"/>' % (kx + 4, ky, kx + 30, ky, COL['walk']))
        elif key == 'all':
            A('<rect x="%d" y="%d" width="30" height="16" rx="8" fill="#fff" stroke="%s" stroke-width="3"/>' % (kx, ky - 8, INK))
        else:
            A('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="%d"/>' % (kx, ky, kx + 30, ky, COL[key], LW))
        A('<text x="%d" y="%d" font-family="barlow,Barlow,sans-serif" font-weight="600" font-size="16.5" fill="%s">%s</text>' % (kx + 40, ky + 6, INK, name))
# a quiet pointer under the tail
A('<text x="574" y="1408" text-anchor="middle" font-family="barlow,Barlow,sans-serif" font-weight="500" font-size="16.5" fill="#4A5C6B">Every show is different. Find the bus and train</text>')
A('<text x="574" y="1430" text-anchor="middle" font-family="barlow,Barlow,sans-serif" font-weight="500" font-size="16.5" fill="#4A5C6B">pages for your show in the guide.</text>')

# ---------------------------------------------------------------- header and footer bands
A('<rect x="0" y="0" width="%d" height="%d" fill="url(#hd)"/>' % (W, Y_HEAD))
A('<rect x="0" y="%d" width="%d" height="6" fill="#D74949"/>' % (Y_HEAD - 6, W))
A('<rect x="0" y="%d" width="%d" height="%d" fill="url(#ft)"/>' % (Y_LED_END, W, H - Y_LED_END))
# six line colour chips in the header, a nod to a line diagram
hx = 1170
for key in ('taxi', 'pr', 'coach', 'bus', 'car', 'train'):
    hx -= 30
    fill = '#FFFFFF' if key == 'car' else COL[key]
    A('<rect x="%d" y="72" width="22" height="22" rx="11" fill="%s"/>' % (hx, fill))

# ---------------------------------------------------------------- amber dot matrix board
FONT = {
 'A':'01110 10001 10001 11111 10001 10001 10001','B':'11110 10001 10001 11110 10001 10001 11110',
 'C':'01110 10001 10000 10000 10000 10001 01110','D':'11110 10001 10001 10001 10001 10001 11110',
 'E':'11111 10000 10000 11110 10000 10000 11111','F':'11111 10000 10000 11110 10000 10000 10000',
 'G':'01110 10001 10000 10111 10001 10001 01111','H':'10001 10001 10001 11111 10001 10001 10001',
 'I':'01110 00100 00100 00100 00100 00100 01110','J':'00111 00010 00010 00010 00010 10010 01100',
 'K':'10001 10010 10100 11000 10100 10010 10001','L':'10000 10000 10000 10000 10000 10000 11111',
 'M':'10001 11011 10101 10101 10001 10001 10001','N':'10001 11001 10101 10011 10001 10001 10001',
 'O':'01110 10001 10001 10001 10001 10001 01110','P':'11110 10001 10001 11110 10000 10000 10000',
 'Q':'01110 10001 10001 10001 10101 10010 01101','R':'11110 10001 10001 11110 10100 10010 10001',
 'S':'01111 10000 10000 01110 00001 00001 11110','T':'11111 00100 00100 00100 00100 00100 00100',
 'U':'10001 10001 10001 10001 10001 10001 01110','V':'10001 10001 10001 10001 10001 01010 00100',
 'W':'10001 10001 10001 10101 10101 11011 10001','X':'10001 10001 01010 00100 01010 10001 10001',
 'Y':'10001 10001 01010 00100 00100 00100 00100','Z':'11111 00001 00010 00100 01000 10000 11111',
 '0':'01110 10001 10011 10101 11001 10001 01110','1':'00100 01100 00100 00100 00100 00100 01110',
 '2':'01110 10001 00001 00010 00100 01000 11111','3':'11110 00001 00001 01110 00001 00001 11110',
 '4':'00010 00110 01010 10010 11111 00010 00010','5':'11111 10000 11110 00001 00001 10001 01110',
 '6':'00110 01000 10000 11110 10001 10001 01110','7':'11111 00001 00010 00100 01000 01000 01000',
 '8':'01110 10001 10001 01110 10001 10001 01110','9':'01110 10001 10001 01111 00001 00010 01100',
 '.':'00000 00000 00000 00000 00000 01100 01100',',':'00000 00000 00000 00000 01100 00100 01000',
 ':':'00000 01100 01100 00000 01100 01100 00000','?':'01110 10001 00001 00010 00100 00000 00100',
 ' ':'00000 00000 00000 00000 00000 00000 00000',
}
def led(text, x0, y0, pitch, r):
    lit, dim = [], []
    for i, ch in enumerate(text):
        rows_ = FONT[ch].split()
        for ry, row in enumerate(rows_):
            for rxi, bit in enumerate(row):
                cx_ = x0 + (i * 6 + rxi) * pitch
                cy_ = y0 + ry * pitch
                (lit if bit == '1' else dim).append('<circle cx="%s" cy="%s" r="%s"/>' % (f(cx_), f(cy_), f(r)))
    return '<g fill="#3A2A08">%s</g><g fill="url(#lit)">%s</g>' % (''.join(dim), ''.join(lit))
A('<rect x="0" y="%d" width="%d" height="%d" fill="#0A0A0C"/>' % (Y_MAP_END, W, Y_LED_END - Y_MAP_END))
A('<rect x="0" y="%d" width="%d" height="3" fill="#000"/>' % (Y_MAP_END, W))
P = 4.7
row1 = 'CHECK YOUR LAST BUS OR TRAIN HOME'
row2 = 'BEFORE YOU SET OFF, THEN SCREENSHOT IT'
for k, row in enumerate((row1, row2)):
    wpx = (len(row) * 6 - 1) * P
    A(led(row, (W - wpx) / 2, Y_MAP_END + 20 + k * (7 * P + 11), P, 1.72))
A('</svg>')

# ---------------------------------------------------------------- page
css = """
.slide{background:%(paper)s;color:#fff}
.eyebrow{left:70px;top:70px;font-family:var(--m);font-weight:600;font-size:15px;line-height:1;letter-spacing:4.2px;color:var(--mint)}
.h1{left:66px;top:98px;font-family:var(--c);font-weight:900;font-style:italic;font-size:142px;line-height:.88;letter-spacing:-.5px;text-transform:uppercase;color:#fff}
.h1 span{color:var(--amber)}
.sub{left:70px;top:232px;font-family:var(--f);font-weight:500;font-size:22px;line-height:1.32;color:var(--soft)}
.stats{right:70px;top:108px;text-align:right;font-family:var(--c);font-weight:700;font-size:25px;line-height:1.34;letter-spacing:.4px;color:#fff}
.stats span{color:var(--mint)}
.so-tag{right:70px;top:1606px;color:var(--mint)}
.so-url{right:70px;top:1630px;color:#fff}
.note{right:70px;top:1684px;text-align:right;font-family:var(--f);font-weight:500;font-size:15px;line-height:1.36;color:var(--soft)}
""" % {'paper': PAPER}

html = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Every way in. Plan your transport options | UK Airshow Guide poster 02</title>
<link rel="stylesheet" href="https://use.typekit.net/vyp4rci.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500;1,700&family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="kit.css">
<style>%s</style></head>
<body>
<div class="slide">
%s
<div data-live class="eyebrow">PLAN YOUR TRANSPORT OPTIONS</div>
<div data-live class="h1">Every way <span>in.</span></div>
<div data-live class="sub">Train, bus, coach, park and ride, taxi or car.<br>Pick how you travel before you pick what time to leave.</div>
<div data-live class="stats"><span>13</span> shows to pick from<br><span>54</span> bus routes mapped<br><span>12</span> train route pages</div>
<img class="logo" src="img/uk-airshow-guide-logo.png" alt="UK Airshow Guide" style="left:70px;top:1592px;width:278px">
<div data-live class="so-tag">Plan your airshow series 02 / 10</div>
<div data-live class="so-url">ukairshowguide.co.uk</div>
<div data-live class="note">Bus and train times change, so please check with<br>the bus or train company before you travel.</div>
</div>
</body></html>
""" % (css, '\n'.join(out))

dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '02-every-way-in.html')
with open(dst, 'w') as fh:
    fh.write(html)
print('wrote', os.path.normpath(dst), len(html), 'bytes')
