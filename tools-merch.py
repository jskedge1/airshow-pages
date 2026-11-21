#!/usr/bin/env python3
"""Builds brand/merch-concepts.html: merch mock-ups drawn around the UK Airshow Guide logo.

Run:  python3 tools-merch.py
The logo PNGs in brand/ are embedded so the page works as one file.
"""
import base64, io, math, pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).parent
NAVY, RED, TEAL, WHITE = "#003262", "#dd001f", "#00bac5", "#ffffff"
DEEP, GOLD, SAND = "#061a33", "#d8b45a", "#d9cdb4"
HF = "'Barlow Condensed','Arial Narrow',Arial,sans-serif"
LW, LH = 300, 99.6          # logo drawn at this size, then scaled per item
_n = [0]


def uid(p="i"):
    _n[0] += 1
    return f"{p}{_n[0]}"


def b64(name, width):
    im = Image.open(ROOT / "brand" / name).convert("RGBA")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


# ---------- shared pieces ----------
def logo(x, y, w, dark=False, rot=0):
    """Full logo, top-left at x,y, w wide. dark=True is the white-text version for dark cloth."""
    s = w / LW
    r = f" rotate({rot})" if rot else ""
    return f'<use href="#{"logoD" if dark else "logoL"}" transform="translate({x},{y}){r} scale({s:.4f})"/>'


def mono(x, y, w, dark=False):
    """The 'UK' flag monogram cut from the logo, w wide (about 0.6 as tall)."""
    s = w / 88
    return f'<use href="#{"monoD" if dark else "monoL"}" transform="translate({x},{y}) scale({s:.4f})"/>'


JET = ("M50,0 C54,10 56,22 57,40 L96,88 L96,97 L60,93 L61,108 L79,126 L79,133 L56,129 "
       "L54,139 L46,139 L44,129 L21,133 L21,126 L39,108 L40,93 L4,97 L4,88 L43,40 C44,22 46,10 50,0Z")


def jet(cx, cy, size, rot=0, fill=WHITE, stroke="none"):
    s = size / 140
    return (f'<path d="{JET}" fill="{fill}" stroke="{stroke}" stroke-width="3" '
            f'transform="translate({cx},{cy}) rotate({rot}) scale({s:.4f}) translate(-50,-70)"/>')


def arc_text(txt, cx, cy, r, top=True, size=24, fill=WHITE, span=None, ls=2):
    i = uid("a")
    sweep = 1 if top else 0
    d = f"M{cx - r},{cy} A{r},{r} 0 0 {sweep} {cx + r},{cy}"
    tl = f' textLength="{span}" lengthAdjust="spacingAndGlyphs"' if span else ""
    return (f'<path id="{i}" d="{d}" fill="none"/>'
            f'<text font-family="{HF}" font-weight="700" font-size="{size}" fill="{fill}" '
            f'letter-spacing="{ls}" text-anchor="middle"{tl}>'
            f'<textPath href="#{i}" startOffset="50%">{txt}</textPath></text>')


def text(txt, x, y, size, fill=WHITE, anchor="middle", ls=1, weight=700, extra="", span=None):
    if span:
        extra += f' textLength="{span}" lengthAdjust="spacingAndGlyphs"'
    return (f'<text x="{x}" y="{y}" font-family="{HF}" font-weight="{weight}" font-size="{size}" '
            f'fill="{fill}" text-anchor="{anchor}" letter-spacing="{ls}" {extra}>{txt}</text>')


def star(cx, cy, r, fill=WHITE):
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.42
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def merrow(shape, colour, width=14):
    """Overlocked patch edge: solid thread colour with a lighter stitch running over it."""
    return (shape.format(extra=f'fill="none" stroke="{colour}" stroke-width="{width}" stroke-linejoin="round"')
            + shape.format(extra=f'fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="{width}" '
                                 f'stroke-dasharray="1.6 2.6" stroke-linejoin="round"'))


def trails(x1, y1, x2, y2, bend=60, w=7):
    """Red, white and teal display smoke from x1,y1 sweeping up to x2,y2."""
    out = ""
    for k, c in enumerate((RED, WHITE, TEAL)):
        o = (k - 1) * (w + 3)
        out += (f'<path d="M{x1},{y1 + o * 1.6} Q{(x1 + x2) / 2 + bend * .2},{y1 + bend * .35 + o} {x2 + o * .5},{y2 + o * .5}" '
                f'fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round"/>')
    return out


# ---------- patch artwork (each drawn in a 300 x 300 box) ----------
def art_round():
    c = '<circle cx="150" cy="150" r="{r}" {extra}/>'
    return (f'<circle cx="150" cy="150" r="136" fill="{NAVY}"/>'
            f'<circle cx="150" cy="150" r="90" fill="{DEEP}"/>'
            f'<g clip-path="url(#clipR)">{trails(48, 196, 176, 128, 60, 9)}</g>'
            + jet(186, 118, 78, 52)
            + f'<circle cx="150" cy="150" r="90" fill="none" stroke="{WHITE}" stroke-width="3"/>'
            + arc_text("UK AIRSHOW GUIDE", 150, 150, 102, True, 30, WHITE, 230)
            + arc_text("FLIGHTLINE CREW", 150, 150, 124, False, 27, TEAL, 190)
            + star(34, 150, 9, RED) + star(266, 150, 9, RED)
            + merrow(c.replace("{r}", "138"), TEAL, 13))


SHIELD = "M150,14 L276,40 L276,150 C276,224 216,266 150,290 C84,266 24,224 24,150 L24,40 Z"


def art_shield():
    s = f'<path d="{SHIELD}" {{extra}}/>'
    out = f'<path d="{SHIELD}" fill="{NAVY}"/>'
    out += f'<path d="M24,40 L150,14 L276,40 L276,84 L24,84 Z" fill="{RED}"/>'
    out += text("DISPLAY SEASON", 150, 70, 30, WHITE, ls=2.5)
    for dx, dy in ((0, 0), (-52, 34), (52, 34)):
        for k, col in enumerate((RED, WHITE, TEAL)):
            out += (f'<line x1="{150 + dx + (k - 1) * 5}" y1="{150 + dy}" x2="{150 + dx + (k - 1) * 5}" '
                    f'y2="{214 + dy * .2}" stroke="{col}" stroke-width="3.2" stroke-linecap="round" opacity=".9"/>')
        out += jet(150 + dx, 128 + dy, 52)
    out += text("2027", 150, 250, 46, TEAL, ls=3)
    return out + merrow(s, RED, 13)


def art_hex():
    pts = " ".join(f"{150 + 136 * math.cos(math.radians(a)):.1f},{150 + 136 * math.sin(math.radians(a)):.1f}"
                   for a in range(0, 360, 60))
    h = f'<polygon points="{pts}" {{extra}}/>'
    return (f'<polygon points="{pts}" fill="{TEAL}"/>'
            f'<circle cx="150" cy="148" r="56" fill="{WHITE}"/>'
            f'<g clip-path="url(#clipH)">{trails(92, 182, 166, 128, 46, 8)}</g>'
            + jet(172, 122, 66, 48, NAVY)
            + text("MY FIRST", 150, 78, 30, NAVY, ls=3, span=118)
            + text("AIRSHOW", 150, 247, 36, NAVY, ls=3, span=124)
            + star(50, 150, 9, WHITE) + star(250, 150, 9, WHITE)
            + merrow(h, NAVY, 13))


def sector(cx, cy, r1, r2, a1, a2):
    def p(r, a):
        return f"{cx + r * math.cos(math.radians(a)):.1f},{cy + r * math.sin(math.radians(a)):.1f}"
    return (f"M{p(r2, a1)} A{r2},{r2} 0 0 1 {p(r2, a2)} L{p(r1, a2)} A{r1},{r1} 0 0 0 {p(r1, a1)} Z")


# ---------- garment shapes ----------
TEE = ("M132,36 C150,58 250,58 268,36 L338,64 L392,148 L338,182 L312,150 L312,372 L88,372 "
       "L88,150 L62,182 L8,148 L62,64 Z")


def tee(colour, inner, trim=None, shade="#000"):
    trim = trim or colour
    return (f'<path d="{TEE}" fill="{colour}" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>'
            f'<path d="M132,36 C150,58 250,58 268,36 C250,78 150,78 132,36Z" fill="{trim}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>'
            f'<path d="M88,150 L88,372 M312,150 L312,372" stroke="{shade}" stroke-opacity=".12" stroke-width="5" fill="none"/>'
            f'<path d="M62,182 L88,150 M338,182 L312,150" stroke="{shade}" stroke-opacity=".25" stroke-width="2" fill="none"/>'
            + inner)


def hoodie(colour, cord, inner):
    body = ("M140,58 L60,84 L6,250 L52,270 L84,196 L84,376 L316,376 L316,196 L348,270 L394,250 L340,84 L260,58 Z")
    return (f'<path d="{body}" fill="{colour}" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>'
            f'<path d="M140,58 C120,10 280,10 260,58 C240,96 160,96 140,58Z" fill="{colour}" stroke="rgba(0,0,0,.35)" stroke-width="2"/>'
            f'<path d="M158,60 C150,30 250,30 242,60 C226,82 174,82 158,60Z" fill="rgba(0,0,0,.35)"/>'
            f'<path d="M120,290 L280,290 L296,350 L104,350 Z" fill="rgba(0,0,0,.14)" stroke="rgba(0,0,0,.25)"/>'
            f'<rect x="84" y="356" width="232" height="20" fill="rgba(0,0,0,.16)"/>'
            f'<path d="M180,84 L176,150 M220,84 L224,150" stroke="{cord}" stroke-width="4" stroke-linecap="round"/>'
            + inner)


def cap(crown, brim, inner, front=None):
    out = f'<path d="M88,226 C78,48 322,48 312,226 Z" fill="{crown}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>'
    if front:
        out += f'<path d="M128,226 C124,120 160,96 200,94 C240,96 276,120 272,226 Z" fill="{front}"/>'
    out += ('<path d="M200,94 L200,226 M128,226 C124,120 160,96 200,94 M272,226 C276,120 240,96 200,94" '
            'fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>')
    out += f'<ellipse cx="200" cy="93" rx="11" ry="5" fill="{brim}"/>'
    out += (f'<path d="M82,222 C140,236 260,236 318,222 C330,246 286,272 200,272 C114,272 70,246 82,222Z" '
            f'fill="{brim}" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>'
            '<path d="M92,240 C140,260 260,260 308,240" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.5" stroke-dasharray="4 4"/>')
    return out + inner


def mug(colour, inner, rim=None, handle=None):
    handle = handle or colour
    out = (f'<path d="M292,140 C372,134 372,270 292,262" fill="none" stroke="{handle}" stroke-width="24" stroke-linecap="round"/>'
           f'<path d="M292,140 C372,134 372,270 292,262" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="24" stroke-linecap="round" stroke-dasharray="0 60 200"/>'
           f'<path d="M70,92 L300,92 L292,316 C290,332 80,332 78,316 Z" fill="{colour}" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>'
           f'<ellipse cx="185" cy="92" rx="115" ry="15" fill="{colour}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>'
           f'<ellipse cx="185" cy="94" rx="106" ry="11" fill="#5a3a22"/>'
           f'<path d="M262,104 L256,318" stroke="rgba(255,255,255,.22)" stroke-width="14" stroke-linecap="round"/>')
    if rim:
        out += f'<ellipse cx="185" cy="92" rx="115" ry="15" fill="none" stroke="{rim}" stroke-width="6"/>'
    return out + inner


# ---------- page parts ----------
def svg(inner, vb="0 0 400 400"):
    return f'<svg viewBox="{vb}" role="img" xmlns="http://www.w3.org/2000/svg">{inner}</svg>'


def patch(art, x=50, y=50, w=300):
    """Place 300-box patch artwork with a soft shadow and thread texture."""
    s = w / 300
    return f'<g transform="translate({x},{y}) scale({s:.4f})" filter="url(#sh)">{art}</g>'


def card(name, blurb, chips, art, bg="paper"):
    c = "".join(f"<span>{t}</span>" for t in chips)
    return (f'<article class="card"><div class="mock {bg}">{art}</div>'
            f'<h3>{name}</h3><p>{blurb}</p><div class="chips">{c}</div></article>')


def section(num, title, lead, cards):
    return (f'<section><div class="sechead"><span class="num">{num}</span><div><h2>{title}</h2><p>{lead}</p></div></div>'
            f'<div class="grid">{"".join(cards)}</div></section>')


def build():
    LOGO_L = b64("UK-Airshow-Guide-logo-transparent.png", 900)
    LOGO_D = b64("ukag-header-logo.png", 750)
    R, S, H = art_round(), art_shield(), art_hex()

    # ----- patches -----
    logo_patch = ('<g filter="url(#sh)"><rect x="34" y="118" width="332" height="164" rx="20" fill="#f6f4ee"/>'
                  + logo(64, 152, 272)
                  + merrow('<rect x="34" y="118" width="332" height="164" rx="20" {extra}/>', NAVY, 12) + "</g>")
    rocker = sector(200, 420, 250, 312, -124, -56)
    tabs = ('<g filter="url(#sh)">'
            f'<path d="{rocker}" fill="{NAVY}"/>'
            + arc_text("AIRSHOW PHOTO CREW", 200, 420, 270, True, 34, WHITE, 300, 3)
            + merrow(f'<path d="{rocker}" {{extra}}/>', TEAL, 10)
            + f'<rect x="84" y="226" width="232" height="58" rx="10" fill="{RED}"/>'
            + text("SPOTTER", 200, 268, 38, WHITE, ls=7, span=170)
            + merrow('<rect x="84" y="226" width="232" height="58" rx="10" {extra}/>', NAVY, 9)
            + f'<rect x="104" y="306" width="192" height="50" rx="10" fill="{TEAL}"/>'
            + text("CAMPSITE CREW", 200, 341, 27, NAVY, ls=3, span=160)
            + merrow('<rect x="104" y="306" width="192" height="50" rx="10" {extra}/>', NAVY, 9)
            + "</g>")
    velcro = ('<g filter="url(#sh)">'
              f'<rect x="30" y="92" width="340" height="92" rx="6" fill="{DEEP}"/>'
              f'<rect x="38" y="100" width="324" height="76" rx="3" fill="none" stroke="{TEAL}" stroke-width="2" stroke-dasharray="6 4"/>'
              + mono(52, 112, 82, True) + text("AIRSHOW CREW", 248, 151, 36, WHITE, ls=3, span=196)
              + f'<rect x="72" y="222" width="256" height="92" rx="6" fill="{RED}"/>'
              f'<rect x="80" y="230" width="240" height="76" rx="3" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/>'
              + text("CHOCKS AWAY", 200, 266, 34, WHITE, ls=4, span=190) + text("UKAIRSHOWGUIDE.CO.UK", 200, 293, 17, WHITE, ls=3, weight=600)
              + "</g>")
    patches = [
        card("Flightline Crew round", "The hero patch. A jet climbing out on red, white and teal smoke, in the logo colours.",
             ["90 mm", "Embroidered", "Iron-on or hook back"], svg(patch(R))),
        card("Display Season 2027 shield", "A dated shield with a three-ship formation. Re-issue it each year as a collectable.",
             ["85 mm tall", "Embroidered", "Yearly edition"], svg(patch(S))),
        card("Logo patch", "The full logo on white twill with a navy edge, for jackets, camera bags and rucksacks.",
             ["100 x 50 mm", "Woven for fine detail"], svg(logo_patch)),
        card("My First Airshow hexagon", "A keepsake for first-timers, tied to the first airshow guides on the site.",
             ["80 mm", "Embroidered", "Kids and adults"], svg(patch(H))),
        card("Rocker and tab set", "Add-on tabs that sit above or below the round patch: photographers, spotters, campers.",
             ["Rocker 100 mm", "Tabs 70 mm", "Sold as a set"], svg(tabs)),
        card("Hook-and-loop strips", "Flight-suit style name tapes for camera bags and caps with a loop panel.",
             ["100 x 28 mm", "PVC or woven", "Hook backed"], svg(velcro)),
    ]

    # ----- pins and badges -----
    def feather(side):
        out = ""
        for k in range(5):
            y = 168 + k * 13
            x2 = 200 + side * (176 - k * 26)
            x1 = 200 + side * 44
            m = (x1 + x2) / 2
            out += (f'<path d="M{x1},{y} Q{m},{y - 20} {x2},{y - 8} Q{m},{y + 8} {x1},{y + 12} Z" '
                    f'fill="{GOLD}" stroke="#8a6d24" stroke-width="1.5"/>')
        return out
    wings = ('<g filter="url(#sh)">' + feather(-1) + feather(1)
             + f'<circle cx="200" cy="196" r="56" fill="{GOLD}" stroke="#8a6d24" stroke-width="1.5"/>'
             f'<circle cx="200" cy="196" r="48" fill="{NAVY}"/>' + mono(162, 172, 80, True)
             + f'<path d="M168,262 L232,262 L222,284 L178,284 Z" fill="{GOLD}" stroke="#8a6d24" stroke-width="1.5"/>'
             + text("CREW", 200, 279, 15, NAVY, ls=3) + "</g>")
    enamel = ('<g filter="url(#sh)">'
              f'<circle cx="200" cy="200" r="120" fill="{GOLD}"/><circle cx="200" cy="200" r="111" fill="{NAVY}"/>'
              f'<g clip-path="url(#clipE)">{trails(96, 250, 226, 160, 70, 12)}</g>' + jet(238, 148, 104, 52)
              + '<ellipse cx="160" cy="130" rx="46" ry="20" fill="#fff" opacity=".12" transform="rotate(-30 160 130)"/></g>')
    diecut = ('<g filter="url(#sh)" transform="rotate(-8 200 200)">'
              f'<path d="M60,280 Q200,300 318,128" fill="none" stroke="{GOLD}" stroke-width="40" stroke-linecap="round"/>'
              f'<path d="M62,268 Q196,282 308,122" fill="none" stroke="{RED}" stroke-width="10" stroke-linecap="round"/>'
              f'<path d="M62,280 Q200,296 318,128" fill="none" stroke="{WHITE}" stroke-width="10" stroke-linecap="round"/>'
              f'<path d="M62,292 Q204,310 328,134" fill="none" stroke="{TEAL}" stroke-width="10" stroke-linecap="round"/>'
              + jet(322, 108, 150, 36, NAVY, GOLD) + "</g>")

    def button(cx, cy, fill, inner):
        return (f'<g filter="url(#sh)"><circle cx="{cx}" cy="{cy}" r="74" fill="{fill}" stroke="rgba(0,0,0,.2)"/>{inner}'
                f'<ellipse cx="{cx - 24}" cy="{cy - 50}" rx="30" ry="9" fill="#fff" opacity=".22" transform="rotate(-24 {cx - 24} {cy - 50})"/></g>')
    buttons = (button(112, 128, "#fff", logo(52, 110, 120))
               + button(288, 128, RED, text("POWERED BY", 288, 118, 22, WHITE, ls=2) + text("JET NOISE", 288, 152, 34, WHITE, ls=2, span=112))
               + button(200, 278, TEAL, text("EYES TO", 200, 266, 26, NAVY, ls=2) + text("THE SKIES", 200, 298, 30, NAVY, ls=2, span=108)))
    pins = [
        card("Crew wings", "Aircrew-style wings with the UK monogram at the centre. One for the team and volunteers.",
             ["55 mm", "Die-struck, gold plate", "Butterfly clutch"], svg(wings), "navy"),
        card("Round enamel pin", "The jet and smoke from the Flightline Crew patch at lapel size, with raised gold lines.",
             ["30 mm", "Hard enamel"], svg(enamel), "navy"),
        card("Jet and smoke pin", "A cut-out jet riding the logo swoosh. Looks good on a lanyard or camera strap.",
             ["38 mm", "Soft enamel, cut to shape"], svg(diecut), "navy"),
        card("Button badge trio", "Cheap, cheerful and good as giveaways at shows or in orders.",
             ["38 mm", "Pin back", "Pack of 3"], svg(buttons)),
    ]

    # ----- apparel -----
    apparel = [
        card("Classic logo tee, navy", "The logo across the chest in its white-text version so it reads on dark cloth.",
             ["Screen print, 4 colour", "Unisex S to 3XL"], svg(tee(NAVY, logo(104, 112, 192, True)))),
        card("Classic logo tee, white", "Same layout on white using the standard navy logo.",
             ["Screen print, 4 colour", "Unisex S to 3XL"],
             svg(tee("#fbfbf9", logo(104, 112, 192), "#e9e9e4")), "sky"),
        card("Crew tee", "Small monogram on the chest, round patch art on the sleeve. Smart enough for show-day staff.",
             ["Left-chest print", "Sleeve print"],
             svg(tee(NAVY, mono(236, 108, 54, True) + f'<g transform="translate(22,96) rotate(-32) scale(.19)">{R}</g>', TEAL))),
        card("Display Season back print", "A tour-style back: the shield up top, then the season's shows listed underneath.",
             ["Back print", "Yearly edition"],
             svg(tee(DEEP, f'<g transform="translate(128,78) scale(.48)">{S}</g>'
                     + "".join(text(t, 200, 248 + i * 21, 16, WHITE if i % 2 == 0 else TEAL, ls=3, weight=600)
                               for i, t in enumerate(["SHOW ONE &#183; JUNE", "SHOW TWO &#183; JULY", "SHOW THREE &#183; JULY",
                                                      "SHOW FOUR &#183; AUGUST", "SHOW FIVE &#183; SEPTEMBER"]))
                     + f'<path d="M132,36 C150,44 250,44 268,36" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="2"/>'))),
        card("Pullover hoodie", "For cold flightlines and early gate queues. Teal cords pick up the logo colour.",
             ["Chest print", "Heavyweight fleece"],
             svg(hoodie(NAVY, TEAL, logo(110, 160, 180, True)))),
        card("My First Airshow kids' tee", "The hexagon badge as a chest print on teal.",
             ["Ages 3 to 12", "Screen print"],
             svg(tee(TEAL, f'<g transform="translate(128,96) scale(.48)">{H}</g>', NAVY)), "sky"),
    ]

    # ----- headwear -----
    beanie = (f'<path d="M92,268 C80,60 320,60 308,268 Z" fill="{NAVY}" stroke="rgba(0,0,0,.25)"/>'
              + "".join(f'<path d="M{112 + k * 22},262 C{112 + k * 22 - (4 - k) * 3},160 {180 + k * 5},92 200,84" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="5"/>' for k in range(9))
              + f'<rect x="82" y="250" width="236" height="76" rx="12" fill="{DEEP}" stroke="rgba(0,0,0,.3)"/>'
              + "".join(f'<line x1="{90 + k * 9}" y1="254" x2="{90 + k * 9}" y2="322" stroke="rgba(255,255,255,.06)" stroke-width="3"/>' for k in range(26))
              + '<g filter="url(#sh)"><rect x="136" y="262" width="128" height="52" rx="6" fill="#f6f4ee"/>'
              + logo(146, 270, 108) + merrow('<rect x="136" y="262" width="128" height="52" rx="6" {extra}/>', TEAL, 5) + "</g>"
              + f'<circle cx="200" cy="72" r="26" fill="{TEAL}"/>')
    bucket = (f'<path d="M110,236 C112,96 288,96 290,236 Z" fill="{SAND}" stroke="rgba(0,0,0,.2)"/>'
              f'<path d="M40,262 C90,214 310,214 360,262 C330,306 70,306 40,262Z" fill="{SAND}" stroke="rgba(0,0,0,.25)"/>'
              f'<path d="M110,236 C150,252 250,252 290,236" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/>'
              f'<path d="M66,262 C110,236 290,236 334,262" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5" stroke-dasharray="4 4"/>'
              f'<g filter="url(#sh)"><rect x="160" y="150" width="80" height="62" rx="6" fill="{NAVY}"/>' + mono(170, 162, 60, True)
              + merrow('<rect x="160" y="150" width="80" height="62" rx="6" {extra}/>', TEAL, 5) + "</g>")
    headwear = [
        card("Patch cap", "Navy six-panel with the Flightline Crew patch sewn on the front.",
             ["Sewn patch, 65 mm", "Adjustable strap"], svg(cap(NAVY, DEEP, patch(R, 148, 108, 104)))),
        card("Logo trucker", "White front panel so the full-colour logo prints true. Teal peak, navy mesh.",
             ["Embroidered or transfer", "Mesh back"],
             svg(cap(NAVY, TEAL, logo(136, 142, 128), "#fbfbf9")), "sky"),
        card("Cuffed beanie", "A woven logo label on the cuff. The off-season seller.",
             ["Woven label", "One size"], svg(beanie), "sky"),
        card("Sun bucket hat", "Proper shade for a full day on the crowdline, with a small monogram patch.",
             ["Sand cotton", "Monogram patch"], svg(bucket), "sky"),
    ]

    # ----- drinkware -----
    flask = (f'<rect x="150" y="54" width="100" height="42" rx="10" fill="{DEEP}"/>'
             '<rect x="140" y="92" width="120" height="270" rx="26" fill="#c9ced3" stroke="rgba(0,0,0,.25)"/>'
             f'<rect x="140" y="170" width="120" height="96" fill="{NAVY}"/>'
             + mono(160, 190, 80, True)
             + f'<rect x="140" y="266" width="120" height="8" fill="{TEAL}"/><rect x="140" y="162" width="120" height="8" fill="{RED}"/>'
             '<rect x="228" y="100" width="12" height="252" rx="6" fill="#fff" opacity=".35"/>')
    drink = [
        card("Classic mug", "White ceramic with the full logo on both sides.",
             ["11 oz", "Dishwasher-safe print"], svg(mug("#fbfbf9", logo(84, 160, 196), None, "#fbfbf9")), "sky"),
        card("Campsite enamel mug", "Navy enamel with a white rim. One for the airshow campers.",
             ["12 oz steel enamel", "White-text logo"], svg(mug(NAVY, logo(86, 164, 190, True), "#f6f4ee"))),
        card("Flightline flask", "Brushed steel with a colour band and the monogram. Keeps a brew hot through the flying display.",
             ["500 ml", "Wrap print"], svg(flask), "sky"),
    ]

    # ----- flightline extras -----
    tag = ('<g filter="url(#sh)" transform="rotate(-14 200 200)">'
           '<circle cx="64" cy="200" r="30" fill="none" stroke="#b9bec4" stroke-width="7"/>'
           f'<rect x="84" y="154" width="280" height="92" rx="12" fill="{RED}"/>'
           '<rect x="92" y="162" width="264" height="76" rx="7" fill="none" stroke="#fff" stroke-width="2"/>'
           f'<circle cx="112" cy="200" r="10" fill="#b9bec4" stroke="#8d939a" stroke-width="2"/><circle cx="112" cy="200" r="5" fill="{RED}"/>'
           + text("FOLLOW ME", 240, 196, 34, WHITE, ls=3, span=170) + text("TO THE AIRSHOW", 240, 226, 23, WHITE, ls=3, span=190) + "</g>")
    lanyard = (f'<path d="M150,10 C120,120 160,200 196,238 M250,10 C280,120 240,200 204,238" fill="none" stroke="{NAVY}" stroke-width="20"/>'
               + "".join(f'<circle cx="{x}" cy="{y}" r="3.2" fill="{c}"/>' for x, y, c in
                         ((146, 60, TEAL), (148, 100, WHITE), (156, 140, RED), (170, 180, TEAL),
                          (254, 60, TEAL), (252, 100, WHITE), (244, 140, RED), (230, 180, TEAL)))
               + '<rect x="190" y="232" width="20" height="26" rx="4" fill="#b9bec4"/>'
               '<g filter="url(#sh)"><rect x="118" y="254" width="164" height="132" rx="10" fill="#fbfbf9" stroke="rgba(0,0,0,.2)"/>'
               f'<rect x="118" y="254" width="164" height="30" rx="10" fill="{TEAL}"/><rect x="118" y="272" width="164" height="12" fill="{TEAL}"/>'
               + text("SHOW DAY PASS", 200, 276, 17, NAVY, ls=2.5) + logo(134, 296, 132)
               + text("NAME", 134, 362, 11, "#6b7785", "start", 2, 600)
               + '<line x1="134" y1="372" x2="266" y2="372" stroke="#c4cad1" stroke-width="1.5"/></g>')

    def sticker(inner, d, rot=0, cx=0, cy=0):
        return (f'<g filter="url(#sh)" transform="rotate({rot} {cx} {cy})">'
                f'<path d="{d}" fill="#fff" stroke="#fff" stroke-width="12" stroke-linejoin="round"/>{inner}</g>')
    stickers = ('<rect x="24" y="24" width="352" height="352" rx="14" fill="#eef1f4" stroke="#d3d9df"/>'
                + sticker(logo(52, 50, 190), "M48,46 h198 v72 h-198 Z", -4, 150, 80)
                + sticker(f'<g transform="translate(262,44) scale(.33)">{R}</g>', "M266,94 a45,45 0 1 0 90,0 a45,45 0 1 0 -90,0", 0)
                + sticker(f'<rect x="48" y="158" width="150" height="50" rx="8" fill="{RED}"/>' + text("POWERED BY JET NOISE", 123, 189, 17, WHITE, ls=1.5, span=128),
                          "M48,158 h150 v50 h-150 Z", 3, 120, 180)
                + sticker(f'<g transform="translate(222,150) scale(.38)">{H}</g>', "M228,207 a50,50 0 1 0 100,0 a50,50 0 1 0 -100,0")
                + sticker(f'<rect x="46" y="244" width="120" height="76" rx="8" fill="{NAVY}"/>' + mono(66, 256, 82, True),
                          "M46,244 h120 v76 h-120 Z", -5, 106, 282)
                + sticker(f'<g transform="translate(196,262) scale(.32)">{S}</g>', "M204,270 h80 v60 l-40,26 l-40,-26 Z")
                + sticker(f'<rect x="300" y="286" width="62" height="62" rx="31" fill="{TEAL}"/>' + jet(331, 317, 40, 40, NAVY),
                          "M300,317 a31,31 0 1 0 62,0 a31,31 0 1 0 -62,0"))
    tote = (f'<path d="M140,120 C140,20 260,20 260,120" fill="none" stroke="{NAVY}" stroke-width="14"/>'
            '<path d="M76,112 L324,112 L340,378 L60,378 Z" fill="#efe9da" stroke="rgba(0,0,0,.2)"/>'
            + logo(98, 176, 204) + text("UKAIRSHOWGUIDE.CO.UK", 200, 300, 15, NAVY, ls=4, weight=600))
    cloth = ('<g filter="url(#sh)" transform="rotate(5 200 200)">'
             f'<path d="M62,74 L338,62 L346,326 L186,340 L58,330 Z" fill="{DEEP}"/>'
             f'<path d="M186,340 L346,326 L300,300 Z" fill="#0d2a4d"/>'
             f'<g opacity=".18">{jet(280, 130, 150, 40)}</g>'
             + logo(92, 150, 210, True) + text("LENS CLOTH", 200, 268, 17, TEAL, ls=6, weight=600) + "</g>")
    chair = (f'<path d="M92,120 L308,120 L296,236 L104,236 Z" fill="{NAVY}" stroke="rgba(0,0,0,.3)"/>'
             + logo(128, 146, 144, True)
             + f'<path d="M84,250 L316,250 L330,286 L70,286 Z" fill="{DEEP}" stroke="rgba(0,0,0,.3)"/>'
             '<path d="M92,120 L84,250 M308,120 L316,250 M78,286 L62,374 M322,286 L338,374 M96,290 L300,374 M304,290 L100,374" '
             'fill="none" stroke="#8d939a" stroke-width="7" stroke-linecap="round"/>'
             f'<rect x="60" y="238" width="44" height="16" rx="6" fill="{TEAL}"/><rect x="296" y="238" width="44" height="16" rx="6" fill="{TEAL}"/>')
    extras = [
        card("Follow Me key tag", "A woven streamer tag in the style of the red flags that hang off parked aircraft.",
             ["130 x 30 mm", "Woven, both sides"], svg(tag), "sky"),
        card("Lanyard and pass holder", "For tickets, camping passes and press passes. The dots repeat the logo colours.",
             ["20 mm strap", "Safety breakaway"], svg(lanyard), "sky"),
        card("Sticker sheet", "Every design on one sheet, for flight cases, laptops and cool boxes.",
             ["A5 sheet", "Weatherproof vinyl"], svg(stickers)),
        card("Tote bag", "Carries the programme, the flask and the sun cream.",
             ["Natural cotton", "1 colour or full colour"], svg(tote), "sky"),
        card("Lens cloth", "One for the Photography Hub crowd. Light to post, so it works as an add-on.",
             ["18 x 15 cm microfibre", "Full print"], svg(cloth), "sky"),
        card("Crowdline folding chair", "The big-ticket item: a camping chair with the logo on the backrest.",
             ["Printed backrest", "Carry bag"], svg(chair), "sky"),
    ]

    sw = "".join(f'<div class="sw"><i style="background:{c}"></i><b>{n}</b><span>{c.upper()}</span></div>'
                 for n, c in (("Navy", NAVY), ("Red", RED), ("Teal", TEAL), ("Night", DEEP), ("Twill white", "#f6f4ee"), ("Wing gold", GOLD)))

    html = f"""<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>UK Airshow Guide merch concepts</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet">
<style>
:root{{--navy:{NAVY};--red:{RED};--teal:{TEAL};--deep:{DEEP};--ink:#12233a;--mute:#56657a;--line:#dfe5ec;
--hf:{HF};--bf:'Barlow',Arial,sans-serif}}
*{{box-sizing:border-box}}
body{{margin:0;font-family:var(--bf);color:var(--ink);background:#f3f5f8;line-height:1.5}}
header{{background:var(--deep);color:#fff;padding:44px 24px 40px;text-align:center;position:relative;overflow:hidden}}
header:after{{content:"";position:absolute;left:0;right:0;bottom:0;height:6px;background:linear-gradient(90deg,var(--red) 0 33.3%,#fff 33.3% 66.6%,var(--teal) 66.6%)}}
header svg{{width:min(440px,82vw);height:auto;display:block;margin:0 auto 18px}}
header h1{{font-family:var(--hf);font-size:clamp(30px,5vw,46px);letter-spacing:.06em;margin:0;text-transform:uppercase;line-height:1.1}}
header p{{max-width:640px;margin:12px auto 0;color:#c5d2e2;font-size:17px}}
main{{max-width:1180px;margin:0 auto;padding:8px 20px 60px}}
section{{margin-top:44px}}
.sechead{{display:flex;gap:16px;align-items:center;margin-bottom:18px}}
.num{{font-family:var(--hf);font-weight:700;font-size:26px;color:#fff;background:var(--navy);width:52px;height:52px;border-radius:50%;
display:grid;place-items:center;flex:none;border:3px solid var(--teal)}}
h2{{font-family:var(--hf);font-size:32px;letter-spacing:.05em;text-transform:uppercase;margin:0;line-height:1.1;color:var(--navy)}}
.sechead p{{margin:2px 0 0;color:var(--mute)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}}
.card{{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 14px 16px;display:flex;flex-direction:column}}
.mock{{border-radius:10px;aspect-ratio:1;display:grid;place-items:center;overflow:hidden}}
.mock svg{{width:100%;height:100%;display:block}}
.paper{{background:radial-gradient(circle at 50% 40%,#fff,#e6ebf1)}}
.sky{{background:linear-gradient(180deg,#cfe6f3,#eef5f9)}}
.navy{{background:radial-gradient(circle at 50% 40%,#12406f,var(--deep))}}
h3{{font-family:var(--hf);font-size:22px;letter-spacing:.03em;margin:14px 0 4px;color:var(--navy);line-height:1.15}}
.card p{{margin:0 0 12px;color:var(--mute);font-size:15px;flex:1}}
.chips{{display:flex;flex-wrap:wrap;gap:6px}}
.chips span{{font-size:12.5px;font-weight:600;background:#eef2f6;color:#33445a;border-radius:99px;padding:3px 10px}}
.two{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px}}
.panel{{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px 22px}}
.panel h3{{margin-top:0}}
.panel ul{{margin:8px 0 0;padding-left:20px;color:var(--mute)}}
.panel li{{margin:6px 0}}
.panel li b{{color:var(--ink)}}
.sws{{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;margin-top:12px}}
.sw i{{display:block;height:54px;border-radius:8px;border:1px solid var(--line)}}
.sw b{{display:block;font-size:14px;margin-top:6px}}
.sw span{{font-size:12.5px;color:var(--mute);font-family:ui-monospace,Menlo,monospace}}
footer{{text-align:center;color:var(--mute);font-size:13.5px;padding:0 20px 40px}}
</style></head><body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<image id="logoL" width="{LW}" height="{LH}" href="{LOGO_L}"/>
<image id="logoD" width="{LW}" height="{LH}" href="{LOGO_D}"/>
<clipPath id="monoClip"><polygon points="0,0 88.5,0 84.5,22 86,33 81,52 0,52"/></clipPath>
<g id="monoL"><use href="#logoL" clip-path="url(#monoClip)"/></g>
<g id="monoD"><use href="#logoD" clip-path="url(#monoClip)"/></g>
<clipPath id="clipR"><circle cx="150" cy="150" r="90"/></clipPath>
<clipPath id="clipH"><circle cx="150" cy="148" r="56"/></clipPath>
<clipPath id="clipE"><circle cx="200" cy="200" r="111"/></clipPath>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#00142b" flood-opacity=".3"/></filter>
</defs></svg>

<header>
<svg viewBox="0 0 300 100" role="img" aria-label="UK Airshow Guide logo"><use href="#logoD"/></svg>
<h1>Merch concepts</h1>
<p>Patches, badges, clothing and show-day kit built around the new logo and its navy, red and teal. These are drawn mock-ups to choose from, not finished print files.</p>
</header>

<main>
{section("01", "Patches", "Squadron-style embroidered patches. The strongest fit for an airshow crowd, and cheap to post.", patches)}
{section("02", "Pins and badges", "Small collectables for lanyards, caps and camera straps.", pins)}
{section("03", "T-shirts and hoodies", "Both logo versions in use: white text for dark cloth, navy text for light.", apparel)}
{section("04", "Caps and hats", "Sun and cold both covered, since the season runs from spring to autumn.", headwear)}
{section("05", "Mugs and flasks", "For the campsite, the car boot and the desk.", drink)}
{section("06", "Flightline extras", "Useful things people carry to a show anyway.", extras)}

<section><div class="sechead"><span class="num">07</span><div><h2>Making it real</h2><p>What to start with and what a supplier will ask for.</p></div></div>
<div class="two">
<div class="panel"><h3>Suggested first range</h3>
<ul>
<li><b>Flightline Crew round patch.</b> Low cost per unit, fits an envelope, and is the item airshow people collect.</li>
<li><b>Sticker sheet and button badges.</b> Pennies each, so they work as giveaways and order extras.</li>
<li><b>Navy logo tee and patch cap.</b> Print on demand first, so there is no stock to hold.</li>
<li><b>Classic mug.</b> The easy gift item, also print on demand.</li>
<li><b>Display Season shield.</b> Bring it out each spring as that year's edition.</li>
</ul></div>
<div class="panel"><h3>Before ordering</h3>
<ul>
<li><b>The logo needs a vector version.</b> The current file is a 1497 pixel PNG, which prints cleanly up to about 12 cm wide. Embroidery, enamel and large back prints need it redrawn as SVG or AI.</li>
<li><b>Patches drop the strapline.</b> The small &ldquo;by The Big Guide to UK Airshows&rdquo; line is too fine to stitch below about 12 cm, so the patch designs here leave it out or use woven instead.</li>
<li><b>Two logo versions.</b> Navy text for white and pale items, white text for navy and dark items.</li>
<li><b>Show and team names.</b> These designs use only your own name and artwork. Naming a specific show or display team on a product would need their permission.</li>
</ul></div>
<div class="panel" style="grid-column:1/-1"><h3>Colours used</h3>
<div class="sws">{sw}</div></div>
</div></section>
</main>
<footer>UK Airshow Guide by The Big Guide to UK Airshows. Concept sheet for internal use.</footer>
</body></html>
"""
    out = ROOT / "brand" / "merch-concepts.html"
    out.write_text(html, encoding="utf-8")
    print(f"wrote {out} ({len(html) // 1024} KB)")


if __name__ == "__main__":
    build()
