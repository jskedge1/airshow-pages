#!/usr/bin/env python3
"""Builds brand/merch-concepts.html: merch mock-ups drawn around the UK Airshow Guide swoosh logo.

Run:  python3 tools-merch.py
Reads the transparent logo masters in brand/ (uk-airshow-guide-swoosh-*.png) and embeds
everything, so the page works as one file.
"""
import base64, io, math, pathlib
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).parent
NAVY, RED, BLUE, TEAL, WHITE = "#04204b", "#f5121b", "#0f74fd", "#05ac95", "#ffffff"
DEEP, INK, GOLD, SAND, HIVIS, ORANGE = "#020d24", "#071a3c", "#e2b13c", "#d9cdb4", "#d8f21c", "#ff6a13"
HF = "'Barlow Condensed','Arial Narrow',Arial,sans-serif"
ST = "'Saira Stencil One','Barlow Condensed','Arial Narrow',sans-serif"
_n = [0]
SIZE = {}       # symbol id -> (width, height) it is defined at


def uid(p="i"):
    _n[0] += 1
    return f"{p}{_n[0]}"


# ---------- logo assets ----------
def _uri(im, q=90):
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=q, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def _grow(mask, r):
    """Round-cornered dilation of an L mask by about r pixels."""
    k = max(3, int(r) * 2 + 1)
    m = mask.filter(ImageFilter.MaxFilter(k))
    return m.filter(ImageFilter.GaussianBlur(r * 0.6)).point(lambda v: 255 if v > 110 else 0)


def _fill_holes(mask):
    m = mask.copy()
    ImageDraw.floodfill(m, (0, 0), 128)
    return m.point(lambda v: 0 if v == 128 else 255)


def _flat(colour, size, mask):
    out = Image.new("RGBA", size, colour)
    out.putalpha(mask.filter(ImageFilter.GaussianBlur(0.8)))
    return out


def variants(master, width):
    """L = as drawn (light cloth), D = navy turned white (dark cloth),
    S = white die-cut backing (sticker), P = backing plus a navy stitched edge (patch)."""
    im = Image.open(ROOT / "brand" / master).convert("RGBA")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    r, g, b, a = im.split()
    mx = ImageChops.lighter(ImageChops.lighter(r, g), b)
    navy = mx.point(lambda v: 255 if v < 95 else (0 if v > 150 else int((150 - v) * 255 / 55)))
    dark = Image.composite(Image.new("RGBA", im.size, (255, 255, 255, 255)), im, navy)
    dark.putalpha(a)
    pad = round(width * 0.075)
    big = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    big.alpha_composite(im, (pad, pad))
    back = _fill_holes(_grow(big.split()[3].point(lambda v: 255 if v > 60 else 0), width * 0.017))
    edge = _grow(back, width * 0.011)
    sticker = _flat((255, 255, 255, 255), big.size, back)
    sticker.alpha_composite(big)
    patchv = _flat((4, 32, 75, 255), big.size, edge)
    patchv.alpha_composite(_flat((250, 248, 242, 255), big.size, back))
    patchv.alpha_composite(big)
    return {"L": im, "D": dark, "S": sticker, "P": patchv}


def mono_from(square_master, width):
    im = Image.open(ROOT / "brand" / square_master).convert("RGBA")
    k = 4
    mask = Image.new("L", (im.width * k, im.height * k), 0)
    poly = [(0, 0), (600, 0), (600, 20), (506, 150), (510, 222), (0, 261)]
    ImageDraw.Draw(mask).polygon([(x * k, y * k) for x, y in poly], fill=255)
    mask = mask.resize(im.size, Image.LANCZOS)
    im.putalpha(ImageChops.multiply(im.split()[3], mask))
    im = im.crop(im.getbbox())
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    r, g, b, a = im.split()
    mx = ImageChops.lighter(ImageChops.lighter(r, g), b)
    navy = mx.point(lambda v: 255 if v < 95 else (0 if v > 150 else int((150 - v) * 255 / 55)))
    dark = Image.composite(Image.new("RGBA", im.size, (255, 255, 255, 255)), im, navy)
    dark.putalpha(a)
    return {"L": im, "D": dark}


def symbols():
    out = ""
    for key, master, w in (("sq", "uk-airshow-guide-swoosh-square.png", 760),
                           ("wd", "uk-airshow-guide-swoosh-wide.png", 900)):
        for v, im in variants(master, w).items():
            h = round(300 * im.height / im.width, 2)
            SIZE[key + v] = (300, h)
            out += f'<image id="{key + v}" width="300" height="{h}" href="{_uri(im)}"/>\n'
    for v, im in mono_from("uk-airshow-guide-swoosh-square.png", 420).items():
        h = round(300 * im.height / im.width, 2)
        SIZE["mo" + v] = (300, h)
        out += f'<image id="mo{v}" width="300" height="{h}" href="{_uri(im)}"/>\n'
    return out


def logo(cx, cy, w, kind="sqL", rot=0, extra=""):
    """Place a logo symbol centred on cx,cy at width w."""
    sw, sh = SIZE[kind]
    s = w / sw
    return (f'<use href="#{kind}" transform="translate({cx},{cy}) rotate({rot}) scale({s:.4f}) '
            f'translate({-sw / 2},{-sh / 2})" {extra}/>')


# ---------- drawing helpers ----------
JET = ("M50,0 C54,10 56,22 57,40 L96,88 L96,97 L60,93 L61,108 L79,126 L79,133 L56,129 "
       "L54,139 L46,139 L44,129 L21,133 L21,126 L39,108 L40,93 L4,97 L4,88 L43,40 C44,22 46,10 50,0Z")


def jet(cx, cy, size, rot=0, fill=WHITE, extra=""):
    s = size / 140
    return (f'<path d="{JET}" fill="{fill}" {extra} '
            f'transform="translate({cx},{cy}) rotate({rot}) scale({s:.4f}) translate(-50,-70)"/>')


def cres(cx, cy, rx, ry, a0, a1, th, colour, rot=0, extra=""):
    """A tapered swoosh: part of an ellipse from angle a0 to a1 (degrees), th thick in the middle."""
    n, outer, inner = 28, [], []
    for i in range(n + 1):
        t = i / n
        a = math.radians(a0 + (a1 - a0) * t)
        k = th * math.sin(math.pi * t) ** 0.8
        outer.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
        inner.append((cx + (rx - k) * math.cos(a), cy + (ry - k) * math.sin(a)))
    pts = outer + inner[::-1]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z"
    return f'<path d="{d}" fill="{colour}" transform="rotate({rot} {cx} {cy})" {extra}/>'


def orbit(cx, cy, rx, ry, th=10, rot=-8, c1=RED, c2=BLUE):
    """The logo's wrap-round swooshes: a red and blue pair over the top, another pair underneath."""
    return (cres(cx, cy, rx, ry, 205, 372, th, c1, rot) + cres(cx, cy, rx * .93, ry * .8, 212, 380, th, c2, rot)
            + cres(cx, cy, rx * .98, ry * .96, 28, 172, th * .9, c1, rot) + cres(cx, cy, rx * 1.06, ry * 1.12, 40, 196, th * .9, c2, rot))


def arc_text(txt, cx, cy, r, top=True, size=24, fill=WHITE, span=None, ls=2, font=HF, extra=""):
    i = uid("a")
    d = f"M{cx - r},{cy} A{r},{r} 0 0 {1 if top else 0} {cx + r},{cy}"
    tl = f' textLength="{span}" lengthAdjust="spacingAndGlyphs"' if span else ""
    return (f'<path id="{i}" d="{d}" fill="none"/>'
            f'<text font-family="{font}" font-weight="700" font-size="{size}" fill="{fill}" '
            f'letter-spacing="{ls}" text-anchor="middle"{tl} {extra}>'
            f'<textPath href="#{i}" startOffset="50%">{txt}</textPath></text>')


def text(txt, x, y, size, fill=WHITE, anchor="middle", ls=1, weight=700, extra="", span=None, font=HF, italic=False):
    if span:
        extra += f' textLength="{span}" lengthAdjust="spacingAndGlyphs"'
    if italic:
        extra += ' font-style="italic"'
    return (f'<text x="{x}" y="{y}" font-family="{font}" font-weight="{weight}" font-size="{size}" '
            f'fill="{fill}" text-anchor="{anchor}" letter-spacing="{ls}" {extra}>{txt}</text>')


def star(cx, cy, r, fill=WHITE):
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.42
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def merrow(shape, colour, width=14):
    """Overlocked patch edge: thread colour with a stitch pattern, raised by the embroidery filter."""
    return ('<g filter="url(#emb)">'
            + shape.format(extra=f'fill="none" stroke="{colour}" stroke-width="{width}" stroke-linejoin="round"')
            + shape.format(extra=f'fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="{width}" '
                                 f'stroke-dasharray="1.5 2.4" stroke-linejoin="round"') + "</g>")


def emb(inner, v=False):
    return f'<g filter="url(#{"embV" if v else "emb"})">{inner}</g>'


def twill(shape, colour):
    return shape.format(extra=f'fill="{colour}"') + shape.format(extra='fill="url(#twill)"')


def shadow(inner, big=False):
    return f'<g filter="url(#{"shBig" if big else "sh"})">{inner}</g>'


# ---------- patch artwork (300 x 300 box) ----------
def art_round():
    c = '<circle cx="150" cy="150" r="{r}" {extra}/>'
    return (twill(c.replace("{r}", "138"), NAVY)
            + emb(f'<circle cx="150" cy="150" r="88" fill="{DEEP}"/>')
            + emb(orbit(150, 152, 82, 46, 11, -14) + jet(150, 150, 96, 38))
            + emb(f'<circle cx="150" cy="150" r="88" fill="none" stroke="{WHITE}" stroke-width="3"/>'
                  + arc_text("UK AIRSHOW GUIDE", 150, 150, 101, True, 30, WHITE, 230)
                  + arc_text("FLIGHTLINE CREW", 150, 150, 123, False, 27, "#6fd3ff", 190)
                  + star(34, 150, 9, RED) + star(266, 150, 9, RED), True)
            + merrow(c.replace("{r}", "138"), BLUE, 13))


FIN = "M96,20 L214,20 L282,236 Q286,262 258,262 L42,262 Q14,262 30,238 Z"


def art_fin():
    s = f'<path d="{FIN}" {{extra}}/>'
    i = uid("c")
    return (f'<clipPath id="{i}"><path d="{FIN}"/></clipPath>' + twill(s, NAVY)
            + f'<g clip-path="url(#{i})">'
            + emb(cres(150, 300, 250, 190, 200, 330, 26, RED) + cres(150, 318, 250, 190, 204, 334, 22, WHITE)
                  + cres(150, 334, 250, 190, 208, 338, 22, BLUE))
            + "</g>"
            + emb(jet(160, 92, 84, 24) + text("DISPLAY SEASON", 150, 226, 25, WHITE, ls=2.5, span=178)
                  + text("2027", 150, 194, 50, WHITE, ls=2, font=ST, weight=400), True)
            + merrow(s, RED, 13))


def art_hex():
    pts = " ".join(f"{150 + 136 * math.cos(math.radians(a)):.1f},{150 + 136 * math.sin(math.radians(a)):.1f}"
                   for a in range(0, 360, 60))
    h = f'<polygon points="{pts}" {{extra}}/>'
    return (twill(h, TEAL)
            + emb(f'<circle cx="150" cy="148" r="58" fill="{WHITE}"/>')
            + emb(orbit(150, 150, 54, 30, 8, -14) + jet(150, 148, 62, 38, NAVY))
            + emb(text("MY FIRST", 150, 76, 30, NAVY, ls=3, span=118) + text("AIRSHOW", 150, 250, 36, NAVY, ls=3, span=124)
                  + star(46, 150, 9, WHITE) + star(254, 150, 9, WHITE), True)
            + merrow(h, NAVY, 13))


# ---------- garments ----------
TEE = ("M132,36 C150,58 250,58 268,36 L338,64 L392,148 L338,182 L312,150 L312,372 L88,372 "
       "L88,150 L62,182 L8,148 L62,64 Z")


def cloth(path, colour, inner, over="", folds=True):
    """A garment body: colour, printed artwork clipped to it, then weave grain and soft folds."""
    i = uid("g")
    f = ""
    if folds:
        f = (f'<g clip-path="url(#{i})"><rect width="400" height="400" fill="url(#sideShade)"/>'
             '<g filter="url(#blur6)" fill="none" stroke-linecap="round">'
             '<path d="M120,150 C150,210 130,300 150,380" stroke="#000" stroke-opacity=".16" stroke-width="16"/>'
             '<path d="M286,140 C262,220 284,300 262,384" stroke="#000" stroke-opacity=".14" stroke-width="18"/>'
             '<path d="M170,96 C210,150 190,260 214,380" stroke="#fff" stroke-opacity=".10" stroke-width="20"/>'
             '</g></g>')
    return (f'<clipPath id="{i}"><path d="{path}"/></clipPath>'
            f'<g filter="url(#sh)"><g filter="url(#grain)"><path d="{path}" fill="{colour}"/>'
            f'<g clip-path="url(#{i})">{inner}</g></g>{f}'
            f'<path d="{path}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.2"/>{over}</g>')


def tee(colour, inner, trim=None, over=""):
    trim = trim or colour
    neck = (f'<path d="M132,36 C150,58 250,58 268,36 C250,80 150,80 132,36Z" fill="{trim}" stroke="rgba(0,0,0,.3)" stroke-width="1.2"/>'
            '<path d="M140,42 C160,70 240,70 260,42" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1" stroke-dasharray="3 2"/>'
            '<path d="M62,182 L88,150 M338,182 L312,150" stroke="rgba(0,0,0,.3)" stroke-width="2" fill="none"/>'
            '<path d="M88,364 L312,364" stroke="rgba(255,255,255,.2)" stroke-width="1" stroke-dasharray="3 2"/>')
    return cloth(TEE, colour, inner, neck + over)


HOOD = "M140,58 L60,84 L6,250 L52,270 L84,196 L84,376 L316,376 L316,196 L348,270 L394,250 L340,84 L260,58 Z"


def hoodie(colour, cord, inner):
    over = (f'<g filter="url(#grain)"><path d="M140,58 C120,8 280,8 260,58 C240,98 160,98 140,58Z" fill="{colour}" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/></g>'
            f'<path d="M158,60 C150,28 250,28 242,60 C226,84 174,84 158,60Z" fill="rgba(0,0,0,.45)"/>'
            f'<path d="M120,290 L280,290 L296,350 L104,350 Z" fill="rgba(0,0,0,.16)" stroke="rgba(0,0,0,.3)"/>'
            f'<rect x="84" y="356" width="232" height="20" fill="rgba(0,0,0,.2)"/>'
            f'<path d="M180,84 L176,156 M220,84 L224,156" stroke="{cord}" stroke-width="4.5" stroke-linecap="round"/>'
            f'<circle cx="176" cy="160" r="4" fill="#cfd5dc"/><circle cx="224" cy="160" r="4" fill="#cfd5dc"/>')
    return cloth(HOOD, colour, inner, over)


CROWN = "M88,226 C78,48 322,48 312,226 Z"
BRIM = "M82,222 C140,236 260,236 318,222 C330,246 286,272 200,272 C114,272 70,246 82,222Z"


def cap(crown, brim, inner, front=None, brim_art=""):
    i = uid("b")
    out = f'<clipPath id="{i}"><path d="{BRIM}"/></clipPath><g filter="url(#sh)"><g filter="url(#grain)"><path d="{CROWN}" fill="{crown}"/>'
    if front:
        out += f'<path d="M128,226 C124,120 160,96 200,94 C240,96 276,120 272,226 Z" fill="{front}"/>'
    out += '</g><rect x="80" y="60" width="240" height="170" fill="url(#sideShade)" clip-path="url(#capClip)"/>'
    out += ('<path d="M200,94 L200,226 M128,226 C124,120 160,96 200,94 M272,226 C276,120 240,96 200,94" '
            'fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>')
    out += f'<ellipse cx="200" cy="93" rx="11" ry="5" fill="{brim}"/>'
    out += (f'<g filter="url(#grain)"><path d="{BRIM}" fill="{brim}"/><g clip-path="url(#{i})">{brim_art}</g></g>'
            f'<path d="{BRIM}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>'
            '<path d="M92,240 C140,260 260,260 308,240" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-dasharray="4 4"/>')
    return out + inner + "</g>"


MUG = "M70,92 L300,92 L292,316 C290,332 80,332 78,316 Z"


def mug(colour, inner, rim=None, handle=None, wrap=""):
    handle = handle or colour
    i = uid("m")
    out = (f'<clipPath id="{i}"><path d="{MUG}"/></clipPath><g filter="url(#sh)">'
           f'<path d="M292,140 C372,134 372,270 292,262" fill="none" stroke="{handle}" stroke-width="24" stroke-linecap="round"/>'
           '<path d="M298,150 C356,150 356,254 298,252" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="4" stroke-linecap="round"/>'
           f'<path d="{MUG}" fill="{colour}"/><g clip-path="url(#{i})">{wrap}{inner}'
           '<rect x="70" y="92" width="232" height="240" fill="url(#cyl)"/></g>'
           f'<path d="{MUG}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/>'
           f'<ellipse cx="185" cy="92" rx="115" ry="15" fill="{colour}" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>'
           '<ellipse cx="185" cy="94" rx="106" ry="11" fill="#3d2414"/><ellipse cx="170" cy="92" rx="50" ry="4" fill="#fff" opacity=".18"/>')
    if rim:
        out += f'<ellipse cx="185" cy="92" rx="115" ry="15" fill="none" stroke="{rim}" stroke-width="6"/>'
    return out + "</g>"


# ---------- page parts ----------
def svg(inner, vb="0 0 400 400"):
    return f'<svg viewBox="{vb}" role="img" xmlns="http://www.w3.org/2000/svg">{inner}</svg>'


def patch(art, x=50, y=50, w=300, rot=0):
    s = w / 300
    return f'<g transform="translate({x},{y}) rotate({rot} {w / 2} {w / 2}) scale({s:.4f})" filter="url(#sh)">{art}</g>'


def card(code, name, blurb, chips, art, bg="studio", wide=False, wild=False):
    c = "".join(f"<span>{t}</span>" for t in chips)
    w = '<b class="wild">Wild card</b>' if wild else ""
    return (f'<article class="card{" wide" if wide else ""}"><div class="mock {bg}">{art}<i class="code">{code}</i>{w}</div>'
            f'<h3>{name}</h3><p>{blurb}</p><div class="chips">{c}</div></article>')


def section(num, title, lead, cards, four=False):
    return (f'<section><div class="sechead"><span class="num">{num}</span><div><h2>{title}</h2><p>{lead}</p></div></div>'
            f'<div class="grid{" four" if four else ""}">{"".join(cards)}</div></section>')


def build():
    SYM = symbols()
    R, F, H = art_round(), art_fin(), art_hex()

    # ================= 01 patches =================
    diecut = shadow(emb(logo(200, 200, 372, "sqP")), True)
    m1 = '<rect x="36" y="40" width="328" height="92" rx="12" {extra}/>'
    m3 = '<rect x="50" y="296" width="300" height="66" rx="33" {extra}/>'
    morale = (shadow(twill(m1, RED) + emb(text("POWERED BY", 200, 78, 27, WHITE, ls=5, span=200)
                                           + text("JET NOISE", 200, 118, 44, WHITE, ls=3, span=250, font=ST, weight=400), True)
                     + merrow(m1, NAVY, 10))
              + shadow('<g transform="rotate(-4 200 214)">' + twill('<ellipse cx="200" cy="214" rx="150" ry="62" {extra}/>', "#f6f2e6")
                       + emb(text("SUNBURNT. DEAFENED.", 200, 206, 25, NAVY, ls=2, span=226)
                             + text("HAPPY.", 200, 244, 36, RED, ls=4, span=120, italic=True, weight=800), True)
                       + merrow('<ellipse cx="200" cy="214" rx="150" ry="62" {extra}/>', BLUE, 10) + "</g>")
              + shadow(twill(m3, NAVY) + emb(text("CROWDLINE REGULAR", 200, 327, 24, WHITE, ls=3, span=236)
                                             + text("ROW ONE SINCE GATES OPEN", 200, 348, 13, "#6fd3ff", ls=3, span=210, weight=600), True)
                       + merrow(m3, TEAL, 9)))
    neon = (f'<g filter="url(#shBig)"><rect x="46" y="60" width="308" height="280" rx="34" fill="#05070c" stroke="#1b2333" stroke-width="5"/>'
            '<rect x="58" y="72" width="284" height="256" rx="24" fill="none" stroke="#111a2a" stroke-width="2" stroke-dasharray="5 4"/></g>'
            + '<g filter="url(#neon)">' + orbit(200, 176, 104, 56, 9, -12, "#7dffb2", "#4dfff0")
            + jet(200, 172, 108, 38, "#c8ffe0")
            + text("NIGHT SHOW", 200, 286, 40, "#7dffb2", ls=4, span=230, font=ST, weight=400)
            + text("GLOWS AFTER DARK", 200, 312, 15, "#4dfff0", ls=5, span=190, weight=600) + "</g>")
    patches = [
        card("P-01", "Die-cut swoosh patch", "The whole logo as the patch, cut to its own outline so the swooshes break the edge.",
             ["110 mm", "Embroidered, 6 thread colours", "Iron-on back"], svg(diecut), "bp"),
        card("P-02", "Flightline Crew roundel", "Squadron-style round patch with the logo's swooshes orbiting a jet.",
             ["90 mm", "Embroidered", "Hook back option"], svg(patch(R)), "tarmac"),
        card("P-03", "Tail fin, Display Season 2027", "A patch shaped like an aircraft tail fin, with the season painted on it. New fin each year.",
             ["95 mm tall", "Embroidered", "Yearly edition"], svg(patch(F, 50, 56)), "sky", wild=True),
        card("P-04", "Morale patch trio", "Crew-room humour for camera bags. Swap them on a hook-and-loop panel.",
             ["80 to 100 mm", "Hook backed", "Set of 3"], svg(morale), "bp"),
        card("P-05", "Night Show glow patch", "Black rubber with glow-in-the-dark swooshes that charge in daylight and light up at dusk.",
             ["75 mm", "Glow PVC", "Hook backed"], svg(neon), "night", wild=True),
        card("P-06", "My First Airshow", "A keepsake for first-timers, tied to the first airshow guides on the site.",
             ["80 mm", "Embroidered", "Kids and adults"], svg(patch(H)), "sky"),
    ]

    # ================= 02 pins, coins and metal =================
    def coin(cx, face):
        rim = "".join(f'<line x1="{cx + 168 * math.cos(a):.1f}" y1="{200 + 168 * math.sin(a):.1f}" '
                      f'x2="{cx + 176 * math.cos(a):.1f}" y2="{200 + 176 * math.sin(a):.1f}" stroke="#6b4c10" stroke-width="1.6"/>'
                      for a in [math.radians(k * 3) for k in range(120)])
        return (f'<g filter="url(#shBig)"><circle cx="{cx}" cy="200" r="178" fill="url(#gold)"/>{rim}'
                f'<circle cx="{cx}" cy="200" r="164" fill="url(#gold2)" stroke="#7a5a14" stroke-width="2"/>'
                f'<circle cx="{cx}" cy="200" r="118" fill="{INK}" stroke="#7a5a14" stroke-width="3"/>{face}'
                f'<ellipse cx="{cx - 60}" cy="96" rx="92" ry="30" fill="#fff" opacity=".16" transform="rotate(-28 {cx - 60} 96)"/></g>')
    relief = 'filter="url(#relief)"'
    c1 = coin(205, logo(205, 200, 208, "sqS")
              + f'<g {relief}>' + arc_text("EYES TO THE SKIES", 205, 200, 127, True, 30, "#fff1b8", 250, 3)
              + arc_text("&#9733; UKAIRSHOWGUIDE.CO.UK &#9733;", 205, 200, 153, False, 22, "#fff1b8", 280, 2) + "</g>")
    c2 = coin(615, f'<g filter="url(#gloss)">{orbit(615, 204, 100, 54, 13, -14)}</g>'
              + f'<g {relief}>' + jet(615, 200, 132, 38, "#f4d77a")
              + arc_text("FLIGHTLINE CREW", 615, 200, 127, True, 32, "#fff1b8", 240, 3)
              + arc_text("DISPLAY SEASON 2027", 615, 200, 153, False, 24, "#fff1b8", 250, 2.5)
              + star(458, 200, 10, "#fff1b8") + star(772, 200, 10, "#fff1b8") + "</g>")

    def feather(side):
        out = ""
        for k in range(6):
            y = 162 + k * 12
            x1, x2 = 200 + side * 46, 200 + side * (186 - k * 25)
            m = (x1 + x2) / 2
            out += f'<path d="M{x1},{y} Q{m},{y - 22} {x2},{y - 8} Q{m},{y + 8} {x1},{y + 12} Z" fill="url(#gold)" stroke="#7a5a14" stroke-width="1.2"/>'
        return out
    wings = ('<g filter="url(#shBig)"><g filter="url(#reliefSoft)">' + feather(-1) + feather(1) + "</g>"
             + '<circle cx="200" cy="196" r="60" fill="url(#gold)" stroke="#7a5a14" stroke-width="1.5"/>'
             f'<g filter="url(#gloss)"><circle cx="200" cy="196" r="51" fill="{NAVY}"/>' + logo(200, 196, 84, "moD") + "</g>"
             + '<path d="M160,268 L240,268 L228,294 L172,294 Z" fill="url(#gold)" stroke="#7a5a14" stroke-width="1.5"/>'
             + text("CREW", 200, 288, 17, NAVY, ls=4) + "</g>")
    blade = '<path d="M0,-12 C26,-70 22,-128 0,-150 C-22,-128 -26,-70 0,-12Z" fill="url(#gold)" stroke="#7a5a14" stroke-width="1.5"/>'
    spinner = ('<g filter="url(#shBig)"><circle cx="200" cy="200" r="150" fill="url(#gold)"/>'
               f'<g filter="url(#gloss)"><circle cx="200" cy="200" r="138" fill="{NAVY}"/>'
               + cres(200, 200, 126, 126, 150, 300, 16, RED) + cres(200, 200, 126, 126, 330, 480, 16, BLUE) + "</g>"
               + star(200, 96, 9, "#fff1b8") + star(110, 252, 9, "#fff1b8") + star(290, 252, 9, "#fff1b8")
               + '<g transform="translate(200,200)"><g>'
               '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.4s" repeatCount="indefinite"/>'
               + blade + f'<g transform="rotate(120)">{blade}</g><g transform="rotate(240)">{blade}</g></g>'
               '<circle r="20" fill="url(#gold)" stroke="#7a5a14" stroke-width="1.5"/><circle r="6" fill="#7a5a14"/></g></g>')
    pinlogo = ('<g filter="url(#shBig)" transform="rotate(-6 200 200)">'
               + logo(200, 200, 372, "sqS", extra='filter="url(#goldEdge)"')
               + '<g filter="url(#gloss)">' + logo(200, 200, 372, "sqS") + "</g></g>")
    tags = ('<g filter="url(#shBig)" transform="rotate(-12 200 150)">'
            '<circle cx="50" cy="150" r="28" fill="none" stroke="url(#steel)" stroke-width="7"/>'
            f'<g filter="url(#grain)"><rect x="70" y="106" width="296" height="88" rx="10" fill="{RED}"/></g>'
            '<rect x="78" y="114" width="280" height="72" rx="6" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 3"/>'
            f'<circle cx="98" cy="150" r="10" fill="url(#steel)"/><circle cx="98" cy="150" r="5" fill="{RED}"/>'
            + text("FOLLOW ME", 232, 150, 36, WHITE, ls=3, span=180, font=ST, weight=400)
            + text("TO THE AIRSHOW", 232, 176, 20, WHITE, ls=3, span=180) + "</g>"
            + '<g filter="url(#shBig)" transform="rotate(8 220 300)">'
            '<path d="M150,236 C130,196 250,186 276,226" fill="none" stroke="url(#steel)" stroke-width="3" stroke-dasharray="2 4" stroke-linecap="round"/>'
            '<rect x="118" y="244" width="204" height="118" rx="26" fill="url(#steel)" stroke="#6d747d" stroke-width="1.5"/>'
            '<rect x="126" y="252" width="188" height="102" rx="20" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>'
            '<circle cx="144" cy="270" r="7" fill="#27303c"/>'
            + f'<g filter="url(#reliefSoft)">' + text("CALLSIGN:", 220, 286, 15, "#39424d", ls=4, weight=600)
            + text("YOUR NAME", 220, 318, 30, "#27303c", ls=3, span=150, font=ST, weight=400)
            + text("UK AIRSHOW GUIDE CREW", 220, 342, 13, "#39424d", ls=3, span=160, weight=600) + "</g></g>")
    pins = [
        card("M-01", "Challenge coin", "A heavy two-sided coin in the military tradition: logo in enamel on one face, jet and swooshes on the other. Hand them to team members, volunteers and competition winners.",
             ["45 mm, 3 mm thick", "Antique gold with enamel", "Numbered edge option"],
             svg(c1 + c2, "0 0 820 400"), "tarmac", wide=True, wild=True),
        card("M-02", "Spinner pin", "A lapel pin with a propeller that turns when you flick it.",
             ["32 mm", "Hard enamel, moving part"], svg(spinner), "bp", wild=True),
        card("M-03", "Crew wings", "Aircrew-style wings with the UK flag monogram at the centre.",
             ["60 mm", "Die-struck, gold plate"], svg(wings), "red"),
        card("M-04", "Logo enamel pin", "The swoosh logo cut to shape with a polished gold edge.",
             ["35 mm", "Hard enamel"], svg(pinlogo), "bp"),
        card("M-05", "Follow Me tag and callsign dog tag", "A woven streamer in the style of the red flags on parked aircraft, and a steel tag stamped with the buyer's own callsign.",
             ["Tag 130 x 30 mm", "Dog tag, stamped to order"], svg(tags), "sky"),
    ]

    # ================= 03 clothing =================
    JKT = "M150,52 L96,70 L40,150 L20,300 L70,312 L96,190 L90,318 L104,340 L296,340 L310,318 L304,190 L330,312 L380,300 L360,150 L304,70 L250,52 C230,74 170,74 150,52Z"
    olive = "#0b2a57"

    def jacket(dx, inner, over):
        rib = "".join(f'<line x1="{104 + k * 7}" y1="322" x2="{104 + k * 7}" y2="346" stroke="rgba(0,0,0,.35)" stroke-width="2"/>' for k in range(28))
        trims = ('<g filter="url(#grain)">'
                 f'<rect x="100" y="320" width="200" height="28" rx="4" fill="{DEEP}"/>{rib}'
                 f'<path d="M16,290 L72,303 L67,326 L11,313Z" fill="{DEEP}"/><path d="M384,290 L328,303 L333,326 L389,313Z" fill="{DEEP}"/>'
                 f'<path d="M150,52 C170,76 230,76 250,52 L262,58 C234,96 166,96 138,58Z" fill="{DEEP}"/></g>'
                 '<path d="M96,190 L104,90 M304,190 L296,90" stroke="rgba(0,0,0,.3)" stroke-width="1.5" fill="none"/>')
        return f'<g transform="translate({dx},18)">' + cloth(JKT, olive, inner, trims + over) + "</g>"
    front = jacket(0, "",
                   f'<path d="M150,56 C170,84 230,84 250,56" fill="none" stroke="{ORANGE}" stroke-width="5"/>'
                   '<rect x="197" y="80" width="6" height="242" fill="url(#steel)"/>'
                   '<line x1="200" y1="80" x2="200" y2="322" stroke="#39424d" stroke-width="1.2" stroke-dasharray="2 2"/>'
                   '<rect x="195" y="92" width="10" height="16" rx="3" fill="url(#gold)"/>'
                   '<path d="M126,252 L156,292 M274,252 L244,292" stroke="rgba(0,0,0,.45)" stroke-width="5" stroke-linecap="round"/>'
                   '<circle cx="128" cy="250" r="3.5" fill="url(#steel)"/><circle cx="272" cy="250" r="3.5" fill="url(#steel)"/>'
                   + f'<g transform="translate(118,112) scale(.22)">{R}</g>'
                   + emb(logo(256, 146, 86, "sqP"))
                   + f'<rect x="232" y="196" width="48" height="16" rx="3" fill="{RED}"/>' + text("CREW", 256, 208, 11, WHITE, ls=3)
                   + f'<rect x="46" y="176" width="34" height="46" rx="3" fill="rgba(0,0,0,.25)" transform="rotate(14 63 199)"/>'
                   f'<rect x="56" y="170" width="6" height="22" fill="{ORANGE}" transform="rotate(14 63 199)"/>'
                   + f'<g transform="translate(318,170) rotate(-14) scale(.14)">{F}</g>')
    back = jacket(410, "",
                  emb(logo(200, 150, 196, "sqP"))
                  + emb(arc_text("FLIGHTLINE CREW", 200, 60, 190, False, 24, WHITE, 170, 4), True)
                  + f'<rect x="150" y="278" width="100" height="22" rx="4" fill="{ORANGE}"/>'
                  + text("EYES TO THE SKIES", 200, 293, 11, DEEP, ls=2, span=86))
    lbl = (text("FRONT", 200, 394, 13, "#9fb4d6", ls=5, weight=600) + text("BACK", 610, 394, 13, "#9fb4d6", ls=5, weight=600))

    allover = (cres(150, 120, 214, 250, -30, 118, 44, RED) + cres(150, 120, 176, 214, -22, 124, 32, BLUE)
               + cres(150, 120, 148, 186, -8, 112, 12, RED))
    tour = (logo(200, 126, 150, "sqS")
            + text("DISPLAY SEASON 2027", 200, 196, 19, WHITE, ls=3, span=168, font=ST, weight=400)
            + "".join(text(t, 200, 222 + i * 20, 14.5, WHITE if i % 2 == 0 else "#6fd3ff", ls=3, weight=600, span=150)
                      for i, t in enumerate(["SHOW ONE &#183; JUNE", "SHOW TWO &#183; JULY", "SHOW THREE &#183; JULY",
                                             "SHOW FOUR &#183; AUGUST", "SHOW FIVE &#183; SEPT"]))
            + text("I WAS ON THE CROWDLINE", 200, 338, 11, RED, ls=3, weight=700, span=150))
    VEST = "M150,50 L112,62 L98,130 C114,150 114,172 100,192 L100,356 L300,356 L300,192 C286,172 286,150 302,130 L288,62 L250,50 C236,92 164,92 150,50Z"
    vest = cloth(VEST, HIVIS,
                 '<rect x="96" y="238" width="208" height="24" fill="url(#steel)"/><rect x="96" y="296" width="208" height="24" fill="url(#steel)"/>'
                 '<path d="M118,56 L138,238 L160,238 L142,56Z M282,56 L262,238 L240,238 L258,56Z" fill="url(#steel)"/>'
                 + text("FOLLOW ME", 200, 150, 44, DEEP, ls=2, span=120, font=ST, weight=400)
                 + text("TO THE AIRSHOW", 200, 176, 17, DEEP, ls=3, span=120)
                 + logo(200, 210, 78, "sqS"),
                 '<path d="M150,50 C164,92 236,92 250,50" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="6"/>', folds=False)
    sleeve = (f'<g transform="translate(58,186) rotate(-80)">' + text("UKAIRSHOWGUIDE.CO.UK", 0, 0, 14, WHITE, "middle", 3, 700, span=132) + "</g>"
              + cres(350, 300, 120, 220, 150, 250, 22, RED) + cres(362, 300, 120, 220, 150, 250, 18, BLUE))
    SOCK = "M150,40 L232,40 L234,214 C236,246 292,268 312,298 C332,330 302,354 264,348 L192,332 C162,324 150,300 150,270 Z"

    def sock1(base, heel, a, b):
        return cloth(SOCK, base,
                     f'<rect x="140" y="40" width="100" height="34" fill="{heel}"/><rect x="140" y="80" width="100" height="7" fill="{a}"/><rect x="140" y="92" width="100" height="7" fill="{b}"/>'
                     + cres(250, 150, 110, 150, 100, 200, 22, a) + cres(250, 150, 88, 124, 104, 204, 15, b)
                     + f'<path d="M268,300 C300,290 330,320 310,350 L262,348Z" fill="{heel}"/><path d="M150,262 C150,300 162,324 192,332 L196,300Z" fill="{heel}"/>'
                     + jet(196, 252, 34, 20, WHITE if base != "#fbfbf9" else NAVY), folds=False)
    socks = (f'<g transform="translate(-74,6) rotate(-6 200 200)">{sock1("#fbfbf9", NAVY, RED, BLUE)}</g>'
             + f'<g transform="translate(46,10) rotate(5 200 200)">{sock1(NAVY, RED, RED, "#6fd3ff")}</g>')
    clothing = [
        card("C-01", "Flightline bomber jacket", "The statement piece. A navy flight jacket with an orange lining, three patches on the front and the die-cut logo across the back.",
             ["MA-1 style", "Sewn patches", "Orange lining"], svg(front + back + lbl, "0 0 820 400"), "bp", wide=True, wild=True),
        card("C-02", "Smoke Trail tee", "The swooshes leave the logo and run right round the shirt, hem to shoulder.",
             ["All-over print", "White base"], svg(tee("#fbfbf9", allover + logo(182, 140, 150, "sqL"), "#ececE6")), "sky", wild=True),
        card("C-03", "Sticker logo tee", "Navy tee with the logo on its white cut-out backing, so the colours stay true on dark cloth.",
             ["Screen print", "Unisex S to 3XL"], svg(tee(NAVY, logo(200, 144, 186, "sqS"))), "tarmac"),
        card("C-04", "Tour back tee", "A gig-style back print listing the season's shows.",
             ["Back print", "Yearly edition"], svg(tee(DEEP, tour, DEEP)), "red"),
        card("C-05", "Marshaller hi-vis", "A hi-vis vest that reads FOLLOW ME, like the airfield marshalling trucks. Easy to spot your group in a crowd.",
             ["Class 2 hi-vis", "Back print", "Kids' sizes too"], svg(vest), "tarmac", wild=True),
        card("C-06", "Sleeve-print hoodie", "Logo on the chest, web address down one arm and swooshes round the other.",
             ["Chest and sleeve print", "Heavyweight fleece"], svg(hoodie(NAVY, "#6fd3ff", sleeve + logo(200, 196, 150, "sqS"))), "bp"),
        card("C-07", "Contrail socks", "Odd on purpose: one navy, one white, with swooshes round the ankle and a jet on each.",
             ["Sizes 4 to 12", "Knitted-in design", "Sold as an odd pair"], svg(socks), "red", wild=True),
        card("C-08", "My First Airshow kids' tee", "The hexagon badge as a chest print on teal.",
             ["Ages 3 to 12", "Screen print"], svg(tee(TEAL, f'<g transform="translate(110,84) scale(.6)">{H}</g>', NAVY)), "sky"),
    ]

    # ================= 04 headwear =================
    eggs = (cres(200, 150, 150, 110, 30, 150, 16, GOLD) + cres(200, 160, 150, 110, 36, 144, 9, RED)
            + cres(200, 136, 150, 110, 24, 156, 9, BLUE))
    beanie = ('<g filter="url(#sh)"><g filter="url(#grain)">'
              f'<path d="M92,268 C80,60 320,60 308,268 Z" fill="{NAVY}"/>'
              + "".join(f'<path d="M{112 + k * 22},262 C{112 + k * 22 - (4 - k) * 3},160 {180 + k * 5},92 200,84" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/>' for k in range(9))
              + f'<rect x="82" y="250" width="236" height="78" rx="12" fill="{DEEP}"/>'
              + "".join(f'<line x1="{90 + k * 9}" y1="254" x2="{90 + k * 9}" y2="324" stroke="rgba(255,255,255,.08)" stroke-width="3"/>' for k in range(26))
              + f'<circle cx="200" cy="66" r="30" fill="{RED}"/></g>'
              + "".join(f'<line x1="200" y1="66" x2="{200 + 30 * math.cos(k):.0f}" y2="{66 + 30 * math.sin(k):.0f}" stroke="rgba(0,0,0,.18)" stroke-width="2"/>' for k in [i * .52 for i in range(12)])
              + emb(logo(200, 289, 132, "wdP")) + "</g>")
    BK = "M110,236 C112,96 288,96 290,236 Z"
    BB = "M40,262 C90,214 310,214 360,262 C330,306 70,306 40,262Z"
    bi = uid("k")
    bucket = (f'<clipPath id="{bi}"><path d="{BK}"/><path d="{BB}"/></clipPath><g filter="url(#sh)"><g filter="url(#grain)">'
              f'<path d="{BB}" fill="{WHITE}"/><path d="{BK}" fill="{WHITE}"/>'
              f'<g clip-path="url(#{bi})">' + cres(200, 256, 156, 44, 8, 172, 15, RED) + cres(200, 252, 128, 30, 4, 176, 11, BLUE)
              + cres(200, 240, 88, 138, 196, 344, 13, BLUE) + cres(200, 240, 70, 116, 200, 340, 9, RED) + "</g></g>"
              f'<path d="{BK}" fill="none" stroke="rgba(0,0,0,.3)"/><path d="{BB}" fill="none" stroke="rgba(0,0,0,.3)"/>'
              '<path d="M110,236 C150,252 250,252 290,236" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="2"/>'
              + logo(200, 190, 84, "sqS") + "</g>")
    headwear = [
        card("H-01", "Scrambled-egg cap", "Senior officers get gold braid on the peak. Ours has gold, red and blue swooshes instead, with the roundel patch up front.",
             ["Sewn patch, 65 mm", "Embroidered peak"], svg(cap(NAVY, DEEP, patch(R, 148, 108, 104), None, eggs)), "tarmac", wild=True),
        card("H-02", "Logo trucker", "White front panel so the full-colour logo prints true. Blue peak, navy mesh.",
             ["Embroidered or transfer", "Mesh back"], svg(cap(NAVY, BLUE, logo(200, 166, 136, "sqL"), "#fbfbf9")), "sky"),
        card("H-03", "Bobble beanie", "The wide logo as a woven label on the cuff, with a red bobble.",
             ["Woven label", "One size"], svg(beanie), "night"),
        card("H-04", "Swoosh bucket hat", "All-over swooshes on white. Shade for a full day on the crowdline, and easy to spot from the back of the field.",
             ["All-over print", "Reversible to navy"], svg(bucket), "sky", wild=True),
    ]

    # ================= 05 drinkware =================
    wrap = (cres(185, 196, 190, 124, 14, 166, 26, RED) + cres(185, 196, 190, 96, 10, 170, 16, BLUE)
            + cres(185, 214, 190, 100, 196, 344, 14, BLUE) + cres(185, 214, 190, 82, 200, 340, 9, RED))
    gi = uid("p")
    GL = "M112,60 L288,60 L262,350 L138,350 Z"
    marks = "".join(f'<line x1="{x1}" y1="{y}" x2="{x1 + 26}" y2="{y}" stroke="{c}" stroke-width="3"/>'
                    + text(t, x1 + 34, y + 5, 15, c, "start", 2, 700, font=ST)
                    for y, t, c, x1 in ((140, "FULL TANKS", WHITE, 124), (200, "CRUISE", WHITE, 129), (268, "BINGO FUEL", "#ffd23c", 136), (322, "MAYDAY", "#ff6a6a", 141)))
    pint = (f'<clipPath id="{gi}"><path d="{GL}"/></clipPath><g filter="url(#sh)">'
            f'<path d="{GL}" fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.8)" stroke-width="2"/>'
            f'<g clip-path="url(#{gi})"><rect x="100" y="96" width="200" height="258" fill="url(#beer)"/>'
            '<rect x="100" y="78" width="200" height="22" fill="#fff8e6"/>'
            '<circle cx="150" cy="98" r="9" fill="#fff8e6"/><circle cx="200" cy="100" r="10" fill="#fff8e6"/><circle cx="246" cy="98" r="8" fill="#fff8e6"/>'
            '<rect x="100" y="60" width="200" height="300" fill="url(#cyl)"/></g>'
            + marks + logo(236, 234, 58, "sqS") + "</g>")
    flask = ('<g filter="url(#sh)">'
             f'<rect x="150" y="40" width="100" height="46" rx="10" fill="{DEEP}"/>'
             '<rect x="140" y="82" width="120" height="288" rx="26" fill="url(#steel)" stroke="rgba(0,0,0,.3)"/>'
             f'<rect x="140" y="150" width="120" height="150" fill="{NAVY}"/>'
             + f'<g transform="translate(200,225) rotate(-90)">' + logo(0, 0, 138, "wdS") + "</g>"
             + f'<rect x="140" y="300" width="120" height="7" fill="{BLUE}"/><rect x="140" y="143" width="120" height="7" fill="{RED}"/>'
             '<rect x="140" y="82" width="120" height="288" rx="26" fill="url(#cyl)"/></g>')
    drink = [
        card("D-01", "Wrap-round swoosh mug", "The swooshes carry on round the back of the mug and meet at the handle.",
             ["11 oz ceramic", "Full wrap print"], svg(mug("#fbfbf9", logo(185, 204, 150, "sqL"), None, RED, wrap)), "sky", wild=True),
        card("D-02", "Bingo Fuel pint glass", "Fuel-gauge markings down the side, from Full Tanks to Mayday. Bingo fuel is the pilot's call for just enough to get home.",
             ["Pint, toughened", "2 colour print"], svg(pint), "tarmac", wild=True),
        card("D-03", "Campsite enamel mug", "Navy enamel with a white rim, for the airshow campers.",
             ["12 oz steel enamel", "Sticker logo"], svg(mug(NAVY, logo(185, 206, 180, "sqS"), "#f6f4ee")), "bp"),
        card("D-04", "Flightline flask", "Brushed steel with the wide logo running up the side.",
             ["500 ml", "Wrap print"], svg(flask), "sky"),
    ]

    # ================= 06 show-day kit =================
    ears = ('<g filter="url(#shBig)">'
            f'<path d="M92,214 C80,40 320,40 308,214" fill="none" stroke="{NAVY}" stroke-width="20" stroke-linecap="round"/>'
            '<path d="M104,170 C104,70 296,70 296,170" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="3"/>'
            f'<rect x="44" y="176" width="96" height="150" rx="40" fill="{RED}"/><rect x="260" y="176" width="96" height="150" rx="40" fill="{BLUE}"/>'
            '<rect x="36" y="196" width="22" height="110" rx="11" fill="#12151b"/><rect x="342" y="196" width="22" height="110" rx="11" fill="#12151b"/>'
            '<rect x="44" y="176" width="96" height="150" rx="40" fill="url(#cyl)"/><rect x="260" y="176" width="96" height="150" rx="40" fill="url(#cyl)"/>'
            + f'<circle cx="92" cy="251" r="34" fill="{WHITE}"/><circle cx="308" cy="251" r="34" fill="{WHITE}"/>'
            + logo(92, 251, 52, "moL") + jet(308, 251, 46, 38, NAVY) + "</g>")
    sock = ('<g filter="url(#sh)"><rect x="92" y="50" width="9" height="320" rx="4" fill="url(#steel)"/>'
            '<circle cx="96" cy="48" r="9" fill="url(#gold)"/>'
            + "".join(f'<path d="M{100 + k * 50},{74 + k * 6} L{150 + k * 50},{80 + k * 6} L{150 + k * 50},{154 - k * 6} L{100 + k * 50},{160 - k * 6}Z" fill="{c}"/>'
                      for k, c in enumerate((RED, WHITE, BLUE, WHITE, NAVY)))
            + '<path d="M100,74 L350,104 L350,130 L100,160Z" fill="url(#sockShade)"/>'
            f'<path d="M100,196 L300,196 L270,236 L300,276 L100,276 Z" fill="{WHITE}" stroke="rgba(0,0,0,.2)"/>'
            + logo(184, 236, 140, "sqL")
            + text("PITCH 42 &#183; FIND US HERE", 200, 330, 16, WHITE, ls=3, span=170, weight=600) + "</g>")
    ribs = {30: "110,84 40,150", 115: "160,84 122,150", 200: "200,84 200,150", 285: "240,84 278,150", 370: "290,84 360,150"}
    panels, xs = "", [30, 115, 200, 285, 370]
    for k, col in enumerate((NAVY, RED, BLUE, NAVY)):
        a, b = xs[k], xs[k + 1]
        c1, c2 = ribs[b].split(" ")
        panels += (f'<path d="M200,84 C{ribs[a]} {a},236 Q{(a + b) / 2},206 {b},236 C{c2} {c1} 200,84Z" '
                   f'fill="{col}" stroke="rgba(0,0,0,.3)" stroke-width="1.2"/>')
    brolly = ('<g filter="url(#shBig)">'
              '<path d="M200,84 L200,330 C200,366 246,366 246,334" fill="none" stroke="url(#steel)" stroke-width="7" stroke-linecap="round"/>'
              + f'<g filter="url(#grain)">{panels}</g>'
              '<path d="M200,84 C110,84 40,150 30,236 Q72,206 115,236 Q158,206 200,236 Q242,206 285,236 Q328,206 370,236 C360,150 290,84 200,84Z" fill="url(#sideShade)" opacity=".7"/>'
              f'<rect x="196" y="66" width="8" height="20" rx="3" fill="{DEEP}"/>' + logo(200, 164, 110, "sqS") + "</g>")

    def sticker(inner, rot=0, cx=0, cy=0):
        return f'<g filter="url(#sh)" transform="rotate({rot} {cx} {cy})">{inner}</g>'

    def ring(cx, cy, r, inner):
        return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff"/>{inner}'
    zaps = ('<g filter="url(#shBig)"><rect x="20" y="20" width="360" height="360" rx="16" fill="url(#holo)"/>'
            '<rect x="20" y="20" width="360" height="360" rx="16" fill="url(#holo2)" style="mix-blend-mode:overlay"/></g>'
            + sticker(logo(138, 92, 210, "sqS"), -5, 138, 92)
            + sticker(ring(312, 86, 52, f'<g transform="translate(264,38) scale(.32)">{R}</g>'))
            + sticker(f'<rect x="38" y="170" width="170" height="54" rx="10" fill="#fff"/><rect x="43" y="175" width="160" height="44" rx="7" fill="{RED}"/>'
                      + text("POWERED BY JET NOISE", 123, 204, 17, WHITE, ls=1.5, span=140, font=ST, weight=400), 4, 123, 197)
            + sticker(ring(296, 204, 54, f'<g transform="translate(246,154) scale(.335)">{H}</g>'))
            + sticker(f'<rect x="36" y="250" width="124" height="96" rx="12" fill="#fff"/><rect x="41" y="255" width="114" height="86" rx="8" fill="{NAVY}"/>' + logo(98, 298, 92, "moD"), -6, 98, 298)
            + sticker(f'<path d="M184,262 h96 v52 l-48,34 l-48,-34 Z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/><g transform="translate(184,252) scale(.32)">{F}</g>')
            + sticker(ring(332, 318, 34, f'<circle cx="332" cy="318" r="29" fill="{BLUE}"/>' + jet(332, 318, 40, 40, WHITE))))
    bp = ('<path d="M150,6 C120,116 160,196 196,234 M250,6 C280,116 240,196 204,234" fill="none" stroke="' + NAVY + '" stroke-width="20"/>'
          + "".join(f'<circle cx="{x}" cy="{y}" r="3.4" fill="{c}"/>' for x, y, c in
                    ((146, 56, RED), (148, 96, WHITE), (156, 136, BLUE), (170, 176, RED), (254, 56, RED), (252, 96, WHITE), (244, 136, BLUE), (230, 176, RED)))
          + '<rect x="190" y="228" width="20" height="24" rx="4" fill="url(#steel)"/>'
          '<g filter="url(#shBig)"><rect x="74" y="248" width="252" height="134" rx="12" fill="#fbfbf9"/>'
          f'<path d="M74,260 a12,12 0 0 1 12,-12 h228 a12,12 0 0 1 12,12 v22 h-252Z" fill="{NAVY}"/>'
          + text("BOARDING PASS &#183; SHOW DAY", 200, 272, 15, WHITE, ls=3, span=200, font=ST, weight=400)
          + logo(124, 330, 84, "sqL")
          + '<line x1="248" y1="290" x2="248" y2="374" stroke="#9aa5b3" stroke-width="1.5" stroke-dasharray="4 4"/>'
          + text("GATE", 174, 304, 9, "#6b7785", "start", 2, 600) + text("CROWDLINE", 174, 320, 14, NAVY, "start", 1, span=62)
          + text("SEAT", 174, 340, 9, "#6b7785", "start", 2, 600) + text("BYO CHAIR", 174, 356, 14, NAVY, "start", 1, span=62)
          + "".join(f'<rect x="{258 + k * 4.6:.1f}" y="296" width="{2 if k % 3 else 3.5}" height="56" fill="{NAVY}"/>' for k in range(13))
          + text("UKAG 2027", 287, 368, 9, NAVY, "middle", 2, 600) + "</g>")
    chair = ('<g filter="url(#shBig)">'
             f'<g filter="url(#grain)"><path d="M92,112 L308,112 L296,232 L104,232 Z" fill="{NAVY}"/></g>'
             + logo(200, 172, 150, "sqS")
             + f'<g filter="url(#grain)"><path d="M84,250 L316,250 L330,286 L70,286 Z" fill="{DEEP}"/></g>'
             '<path d="M92,112 L84,250 M308,112 L316,250 M78,286 L62,374 M322,286 L338,374 M96,290 L300,374 M304,290 L100,374" '
             'fill="none" stroke="url(#steel)" stroke-width="7" stroke-linecap="round"/>'
             f'<rect x="56" y="238" width="48" height="16" rx="6" fill="{RED}"/><rect x="296" y="238" width="48" height="16" rx="6" fill="{BLUE}"/>'
             f'<circle cx="80" cy="246" r="9" fill="{DEEP}"/>' + text("YOUR NAME HERE", 200, 274, 13, "#6fd3ff", ls=4, span=150, font=ST, weight=400) + "</g>")
    kit = [
        card("K-01", "Junior ear defenders", "Every family needs them at a jet display and nobody sells good-looking ones. One red cup, one blue.",
             ["Kids' size, SNR 27", "Printed cups"], svg(ears), "sky", wild=True),
        card("K-02", "Campsite windsock and pitch flag", "A red, white and blue windsock with a logo flag underneath, so friends can find your pitch across the field.",
             ["60 cm sock", "Telescopic pole", "Write-on pitch tag"], svg(sock), "skyrays", wild=True),
        card("K-03", "Crowdline umbrella", "It will rain at one show a year. Panels in the logo colours, logo on the front.",
             ["Vented golf size", "Printed panel"], svg(brolly), "night"),
        card("K-04", "Holographic zap stickers", "Aircrew leave 'zap' stickers wherever they visit. A foil sheet of every design here.",
             ["A5 sheet", "Holographic vinyl", "Weatherproof"], svg(zaps), "bp", wild=True),
        card("K-05", "Boarding pass lanyard", "A pass holder printed like an airline boarding pass, for tickets and camping passes.",
             ["20 mm strap", "Safety breakaway"], svg(bp), "sky"),
        card("K-06", "Personalised crowdline chair", "A camping chair with the logo on the backrest and the buyer's name on the seat edge, directors'-chair style.",
             ["Printed backrest", "Name to order", "Carry bag"], svg(chair), "tarmac"),
    ]

    sw = "".join(f'<div class="sw"><i style="background:{c}"></i><b>{n}</b><span>{c.upper()}</span></div>'
                 for n, c in (("Navy", NAVY), ("Signal red", RED), ("Swoosh blue", BLUE), ("Guide teal", TEAL),
                              ("Night", DEEP), ("Wing gold", GOLD), ("Lining orange", ORANGE), ("Hi-vis", HIVIS)))
    n_items = sum(len(x) for x in (patches, pins, clothing, headwear, drink, kit))

    html = f"""<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>UK Airshow Guide merch concepts</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:ital,wght@0,600;0,700;1,800&family=Saira+Stencil+One&display=swap" rel="stylesheet">
<style>
:root{{--navy:{NAVY};--red:{RED};--blue:{BLUE};--teal:{TEAL};--deep:{DEEP};--ink:{INK};--line:rgba(140,175,235,.2);
--txt:#e9f0fb;--mute:#9fb4d6;--hf:{HF};--st:{ST};--bf:'Barlow',Arial,sans-serif}}
*{{box-sizing:border-box}}
body{{margin:0;font-family:var(--bf);color:var(--txt);background:var(--deep);line-height:1.5}}
.stripe{{height:10px;background:repeating-linear-gradient(-45deg,#ffd23c 0 16px,#12151b 16px 32px)}}
header{{position:relative;overflow:hidden;padding:54px 24px 70px;text-align:center;
background:radial-gradient(ellipse at 50% 0%,#17479a 0%,#082457 45%,var(--deep) 100%)}}
header .rays{{position:absolute;inset:-40% -20% auto;height:180%;opacity:.5;pointer-events:none;
background:repeating-conic-gradient(from 0deg at 50% 62%,rgba(255,255,255,.07) 0 5deg,transparent 5deg 10deg)}}
header svg.sw1{{position:absolute;left:0;right:0;bottom:-2px;width:100%;height:150px}}
header .hl{{position:relative;width:min(560px,88vw);height:auto;display:block;margin:0 auto 8px;filter:drop-shadow(0 14px 26px rgba(0,0,0,.5))}}
header h1{{position:relative;font-family:var(--hf);font-style:italic;font-weight:800;font-size:clamp(40px,8vw,84px);letter-spacing:.02em;margin:0;
text-transform:uppercase;line-height:.95}}
header h1 em{{font-style:italic;color:#6fd3ff}}
header p{{position:relative;max-width:660px;margin:16px auto 0;color:#cfe0f7;font-size:18px}}
.tally{{position:relative;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px}}
.tally span{{font-family:var(--st);font-size:14px;letter-spacing:.14em;text-transform:uppercase;border:1.5px solid rgba(255,255,255,.4);
border-radius:4px;padding:5px 12px;background:rgba(2,13,36,.45)}}
.tally span b{{color:#ffd23c;font-weight:400}}
main{{max-width:1240px;margin:0 auto;padding:6px 20px 70px}}
section{{margin-top:58px}}
.sechead{{display:flex;gap:18px;align-items:flex-end;margin-bottom:22px;border-bottom:2px solid var(--line);padding-bottom:14px}}
.num{{font-family:var(--st);font-size:66px;line-height:.8;color:transparent;-webkit-text-stroke:2px var(--red);flex:none}}
h2{{font-family:var(--hf);font-style:italic;font-weight:800;font-size:clamp(34px,5vw,52px);letter-spacing:.02em;text-transform:uppercase;margin:0;line-height:1}}
.sechead p{{margin:6px 0 0;color:var(--mute);font-size:17px}}
.grid{{display:grid;grid-template-columns:repeat(12,1fr);gap:20px}}
.card{{grid-column:span 4;background:linear-gradient(180deg,#0c2452,#071a3c);border:1px solid var(--line);border-radius:18px;padding:12px 12px 18px;
display:flex;flex-direction:column;box-shadow:0 18px 40px rgba(0,0,0,.35)}}
.card.wide{{grid-column:span 8}}
.four .card{{grid-column:span 3}}
.four h3{{font-size:23px}}
.mock{{position:relative;border-radius:12px;aspect-ratio:1;overflow:hidden}}
.wide .mock{{aspect-ratio:2.05}}
.mock svg{{position:absolute;inset:0;width:100%;height:100%;display:block}}
.code{{position:absolute;left:10px;top:10px;font:400 13px var(--st);letter-spacing:.12em;color:#fff;background:rgba(2,13,36,.72);
border:1px solid rgba(255,255,255,.35);border-radius:4px;padding:2px 8px;font-style:normal}}
.wild{{position:absolute;right:-38px;top:18px;transform:rotate(38deg);background:#ffd23c;color:#12151b;font:400 12.5px var(--st);
letter-spacing:.14em;text-transform:uppercase;padding:4px 44px;box-shadow:0 3px 8px rgba(0,0,0,.4)}}
.studio{{background:radial-gradient(circle at 50% 38%,#fff,#cfd8e4)}}
.bp{{background-color:#0a3276;background-image:linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px),
linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px),radial-gradient(circle at 50% 40%,#1553b8,#061f4e);
background-size:80px 80px,80px 80px,16px 16px,16px 16px,100% 100%}}
.sky{{background:radial-gradient(ellipse at 50% 115%,#fff 0,rgba(255,255,255,0) 60%),repeating-conic-gradient(from 0deg at 50% 115%,rgba(255,255,255,.22) 0 6deg,transparent 6deg 12deg),
linear-gradient(180deg,#2f8fe6,#9fd6f7 70%,#e9f6fd)}}
.skyrays{{background:repeating-conic-gradient(from 0deg at 50% 115%,rgba(255,255,255,.14) 0 6deg,transparent 6deg 12deg),linear-gradient(180deg,#0b4fae,#1f86e0 60%,#58b4f2)}}
.tarmac{{background:linear-gradient(180deg,transparent 0 86%,#ffd23c 86% 88.5%,transparent 88.5%),
repeating-linear-gradient(-45deg,transparent 0 18px,rgba(255,255,255,.025) 18px 36px),radial-gradient(circle at 50% 35%,#4a525e,#1b1f26)}}
.night{{background:radial-gradient(1.5px 1.5px at 12% 18%,#fff 50%,transparent 51%),radial-gradient(1.5px 1.5px at 82% 12%,#fff 50%,transparent 51%),
radial-gradient(1px 1px at 64% 30%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 30% 8%,#fff 50%,transparent 51%),radial-gradient(1.5px 1.5px at 90% 44%,#fff 50%,transparent 51%),
radial-gradient(1px 1px at 8% 52%,#fff 50%,transparent 51%),radial-gradient(circle at 50% 110%,#253a7a,#04060f 70%)}}
.red{{background:radial-gradient(rgba(0,0,0,.16) 22%,transparent 23%) 0 0/14px 14px,radial-gradient(circle at 50% 35%,#ff4a50,#b00009)}}
h3{{font-family:var(--hf);font-style:italic;font-weight:800;font-size:27px;letter-spacing:.02em;text-transform:uppercase;margin:16px 4px 4px;line-height:1.05}}
.card p{{margin:0 4px 14px;color:var(--mute);font-size:15.5px;flex:1}}
.chips{{display:flex;flex-wrap:wrap;gap:6px;margin:0 4px}}
.chips span{{font-size:12.5px;font-weight:600;color:#cfe0f7;border:1px solid rgba(140,175,235,.4);border-radius:99px;padding:3px 10px}}
.two{{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}}
@media (max-width:700px){{.two{{grid-template-columns:1fr}}}}
.panel{{background:linear-gradient(180deg,#0c2452,#071a3c);border:1px solid var(--line);border-radius:18px;padding:20px 24px}}
.panel h3{{margin:0 0 6px}}
.panel ul{{margin:8px 0 0;padding-left:20px;color:var(--mute)}}
.panel li{{margin:7px 0}}
.panel li b{{color:var(--txt)}}
.sws{{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin-top:12px}}
.sw i{{display:block;height:56px;border-radius:8px;border:1px solid var(--line)}}
.sw b{{display:block;font-size:14px;margin-top:6px}}
.sw span{{font-size:12.5px;color:var(--mute);font-family:ui-monospace,Menlo,monospace}}
footer{{text-align:center;color:var(--mute);font-size:13.5px;padding:0 20px 40px}}
@media (max-width:980px){{.card,.four .card{{grid-column:span 6}}.card.wide{{grid-column:span 12}}}}
@media (max-width:620px){{.card,.card.wide,.four .card{{grid-column:span 12}}.num{{font-size:48px}}}}
@media (prefers-reduced-motion:reduce){{animateTransform{{display:none}}}}
</style></head><body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
{SYM}
<pattern id="twill" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="2" fill="#000" opacity=".12"/><rect y="2.4" width="5" height=".8" fill="#fff" opacity=".1"/></pattern>
<linearGradient id="sideShade" x1="0" x2="1" y1="0" y2="0"><stop offset=".2" stop-color="#000" stop-opacity=".24"/><stop offset=".36" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset=".66" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".24"/></linearGradient>
<linearGradient id="cyl" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".18" stop-color="#000" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".28"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".36"/></linearGradient>
<linearGradient id="gold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".28" stop-color="#e2b13c"/><stop offset=".52" stop-color="#8f6a17"/><stop offset=".74" stop-color="#f6d77a"/><stop offset="1" stop-color="#a87a1c"/></linearGradient>
<linearGradient id="gold2" x1="1" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6d77a"/><stop offset=".4" stop-color="#b98a24"/><stop offset=".7" stop-color="#e9c35a"/><stop offset="1" stop-color="#8f6a17"/></linearGradient>
<linearGradient id="steel" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".3" stop-color="#aab2bb"/><stop offset=".55" stop-color="#e3e7eb"/><stop offset=".8" stop-color="#8d959f"/><stop offset="1" stop-color="#cfd5db"/></linearGradient>
<linearGradient id="beer" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f2b21c"/><stop offset="1" stop-color="#b9660a"/></linearGradient>
<linearGradient id="sockShade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
<linearGradient id="holo" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ff9ad5"/><stop offset=".2" stop-color="#ffe98a"/><stop offset=".4" stop-color="#8dffcf"/><stop offset=".6" stop-color="#7ec8ff"/><stop offset=".8" stop-color="#c79bff"/><stop offset="1" stop-color="#ff9ad5"/></linearGradient>
<linearGradient id="holo2" x1="1" x2="0" y1="0" y2="1" spreadMethod="repeat" gradientTransform="scale(.25)"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".5" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></linearGradient>
<clipPath id="capClip"><path d="{CROWN}"/></clipPath>
<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000814" flood-opacity=".45"/></filter>
<filter id="shBig" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000814" flood-opacity=".55"/></filter>
<filter id="blur6"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 -.19" result="s"/><feComposite in="s" in2="SourceAlpha" operator="in" result="sc"/>
<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sc"/></feMerge></filter>
<filter id="emb" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency=".05 1.1" numOctaves="1" seed="4" result="n"/>
<feDiffuseLighting in="n" surfaceScale="1.5" diffuseConstant="1.25" lighting-color="#fff" result="lit"><feDistantLight azimuth="250" elevation="52"/></feDiffuseLighting>
<feComposite in="lit" in2="SourceAlpha" operator="in" result="litc"/><feBlend in="SourceGraphic" in2="litc" mode="multiply" result="thr"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="b"/>
<feSpecularLighting in="b" surfaceScale="3.2" specularConstant=".9" specularExponent="46" lighting-color="#fff" result="sp"><feDistantLight azimuth="235" elevation="48"/></feSpecularLighting>
<feComposite in="sp" in2="SourceAlpha" operator="in" result="spc"/>
<feDiffuseLighting in="b" surfaceScale="3" diffuseConstant="1" lighting-color="#fff" result="dl"><feDistantLight azimuth="235" elevation="62"/></feDiffuseLighting>
<feComposite in="dl" in2="SourceAlpha" operator="in" result="dlc"/><feBlend in="thr" in2="dlc" mode="multiply" result="sh1"/>
<feComposite in="sh1" in2="spc" operator="arithmetic" k1="0" k2="1.06" k3=".5" k4="0"/></filter>
<filter id="embV" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="1.1 .05" numOctaves="1" seed="9" result="n"/>
<feDiffuseLighting in="n" surfaceScale="1.5" diffuseConstant="1.25" lighting-color="#fff" result="lit"><feDistantLight azimuth="200" elevation="52"/></feDiffuseLighting>
<feComposite in="lit" in2="SourceAlpha" operator="in" result="litc"/><feBlend in="SourceGraphic" in2="litc" mode="multiply" result="thr"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="1" result="b"/>
<feSpecularLighting in="b" surfaceScale="3" specularConstant=".9" specularExponent="46" lighting-color="#fff" result="sp"><feDistantLight azimuth="235" elevation="48"/></feSpecularLighting>
<feComposite in="sp" in2="SourceAlpha" operator="in" result="spc"/><feComposite in="thr" in2="spc" operator="arithmetic" k1="0" k2="1.06" k3=".5" k4="0"/></filter>
<filter id="relief" x="-5%" y="-5%" width="110%" height="110%"><feFlood flood-color="#e2b13c" result="f"/><feComposite in="f" in2="SourceAlpha" operator="in" result="g"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b"/>
<feSpecularLighting in="b" surfaceScale="5" specularConstant="1.1" specularExponent="12" lighting-color="#fff6cc" result="sp"><feDistantLight azimuth="225" elevation="42"/></feSpecularLighting>
<feComposite in="sp" in2="SourceAlpha" operator="in" result="spc"/>
<feDiffuseLighting in="b" surfaceScale="5" diffuseConstant="1.1" lighting-color="#fff" result="dl"><feDistantLight azimuth="225" elevation="55"/></feDiffuseLighting>
<feComposite in="dl" in2="SourceAlpha" operator="in" result="dlc"/><feBlend in="g" in2="dlc" mode="multiply" result="m"/>
<feComposite in="m" in2="spc" operator="arithmetic" k1="0" k2="1" k3=".8" k4="0" result="top"/>
<feDropShadow in="SourceAlpha" dx="1.5" dy="2" stdDeviation="1.2" flood-color="#000" flood-opacity=".6" result="ds"/><feMerge><feMergeNode in="ds"/><feMergeNode in="top"/></feMerge></filter>
<filter id="reliefSoft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b"/>
<feSpecularLighting in="b" surfaceScale="4" specularConstant="1" specularExponent="46" lighting-color="#fff" result="sp"><feDistantLight azimuth="225" elevation="45"/></feSpecularLighting>
<feComposite in="sp" in2="SourceAlpha" operator="in" result="spc"/><feComposite in="SourceGraphic" in2="spc" operator="arithmetic" k1="0" k2="1" k3=".7" k4="0"/></filter>
<filter id="gloss" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b"/>
<feSpecularLighting in="b" surfaceScale="7" specularConstant=".7" specularExponent="60" lighting-color="#fff" result="sp"><fePointLight x="120" y="60" z="220"/></feSpecularLighting>
<feComposite in="sp" in2="SourceAlpha" operator="in" result="spc"/><feComposite in="SourceGraphic" in2="spc" operator="arithmetic" k1="0" k2="1" k3=".4" k4="0"/></filter>
<filter id="goldEdge" x="-6%" y="-6%" width="112%" height="112%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/>
<feFlood flood-color="#e2b13c"/><feComposite in2="d" operator="in" result="g"/><feGaussianBlur in="d" stdDeviation="1.4" result="b"/>
<feSpecularLighting in="b" surfaceScale="5" specularConstant="1.2" specularExponent="10" lighting-color="#fff6cc" result="sp"><feDistantLight azimuth="225" elevation="40"/></feSpecularLighting>
<feComposite in="sp" in2="d" operator="in" result="spc"/><feComposite in="g" in2="spc" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0"/></filter>
<filter id="neon" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b2"/>
<feMerge><feMergeNode in="b1"/><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs></svg>

<div class="stripe"></div>
<header>
<div class="rays"></div>
<svg class="hl" viewBox="0 0 {SIZE['sqS'][0]} {SIZE['sqS'][1]}" role="img" aria-label="UK Airshow Guide logo"><use href="#sqS"/></svg>
<h1>The merch <em>hangar</em></h1>
<p>{n_items} concepts built around the swoosh logo from the video end cards. Patches, coins, a flight jacket and kit for the crowdline. These are drawn mock-ups to choose from, not finished print files.</p>
<div class="tally"><span><b>{len(patches)}</b> patches</span><span><b>{len(pins)}</b> pins and coins</span><span><b>{len(clothing)}</b> clothing</span><span><b>{len(headwear)}</b> hats</span><span><b>{len(drink)}</b> drinkware</span><span><b>{len(kit)}</b> show-day kit</span></div>
</header>
<div class="stripe"></div>

<main>
{section("01", "Patches", "Embroidered, squadron-style. Cheap to post and the thing airshow people collect.", patches)}
{section("02", "Pins, coins and metal", "Small, heavy and collectable.", pins)}
{section("03", "Clothing", "From a plain logo tee to a full flight jacket.", clothing)}
{section("04", "Hats", "Sun and cold both covered, since the season runs from spring to autumn.", headwear, True)}
{section("05", "Drinkware", "For the campsite, the car boot and the desk.", drink, True)}
{section("06", "Show-day kit", "Useful things people carry to a show anyway.", kit)}

<section><div class="sechead"><span class="num">07</span><div><h2>Making it real</h2><p>What to start with and what a supplier will ask for.</p></div></div>
<div class="two">
<div class="panel"><h3>Suggested first drop</h3>
<ul>
<li><b>Die-cut swoosh patch and the roundel.</b> Low cost per unit, they fit an envelope, and patches are what this crowd collects.</li>
<li><b>Holographic zap stickers.</b> Pennies each, so they double as giveaways and order extras.</li>
<li><b>Sticker logo tee and scrambled-egg cap.</b> Print on demand first, so there is no stock to hold.</li>
<li><b>Bingo Fuel pint glass.</b> The gift item with a joke only aviation people get.</li>
<li><b>Challenge coin.</b> A short numbered run for the team, volunteers and competition prizes.</li>
</ul></div>
<div class="panel"><h3>Before ordering</h3>
<ul>
<li><b>The logo needs a vector version.</b> The files in Drive are PNGs about 1,200 to 1,700 pixels wide, fine for print up to roughly 14 cm. Embroidery, enamel, coins and all-over prints need it redrawn as SVG or AI.</li>
<li><b>Dark items use the white backing.</b> The navy lettering disappears on navy cloth, so dark products carry the logo on its white cut-out shape, as on your square badge.</li>
<li><b>Wild cards need specialist makers.</b> The spinner pin, glow patch, ear defenders and all-over prints are made to order with minimum runs, usually 50 to 100.</li>
<li><b>Show and team names.</b> Everything here uses only your own name and artwork. Naming a real show or display team on a product would need their permission.</li>
</ul></div>
<div class="panel" style="grid-column:1/-1"><h3>Colours: four from the logo, four accents</h3>
<div class="sws">{sw}</div></div>
</div></section>
</main>
<footer>UK Airshow Guide by The Big Guide to UK Airshows. Concept sheet for internal use.</footer>
</body></html>
"""
    out = ROOT / "brand" / "merch-concepts.html"
    out.write_text(html, encoding="utf-8")
    print(f"wrote {out} ({len(html) // 1024} KB), {n_items} items")


if __name__ == "__main__":
    build()
