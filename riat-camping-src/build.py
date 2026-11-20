#!/usr/bin/env python3
"""Build the RIAT camping pages.

Reads one JSON file per campsite from riat-camping-src/sites/ and writes:
  riat-camping/index.html     the RIAT camping home page (campsite tabs, map, list your site)
  riat-camping/<slug>.html    one information page per campsite

Run from anywhere:  python3 riat-camping-src/build.py
Only sites with "live": true go on the home page and in the campsite tabs.
The sample (sites/_sample.json) always builds to riat-camping/sample.html so owners can see a page.
"""
import html
import json
import math
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "riat-camping-src" / "sites"
OUT = ROOT / "riat-camping"

SITE = "https://www.ukairshowguide.co.uk"
GH = "https://jskedge1.github.io/airshow-pages/riat-camping/"
HOME_WIX = ""            # set to "/riat-camping" once the Wix page exists
RIAT_WIX = "/riat"
CAMPING_HUB_WIX = "/camping-at-airshows"
CONTACT = "contactus@ukairshowguide.co.uk"
OFFICIAL_CAMPING = "https://www.airtattoo.com/camping/"

AREAS = {
    "boscombe": {
        "name": "Boscombe Down", "long": "Near MOD Boscombe Down",
        "centre": (51.1525, -1.7478), "label": "MOD Boscombe Down", "runway": 50, "ghosts": [(-120, -110), (150, 60), (60, 170)],
        "blurb": "RIAT's new home from 2027, just south east of Amesbury in Wiltshire.",
        "towns": [("Amesbury", 51.1730, -1.7800, "start", -12), ("Salisbury", 51.0688, -1.7945), ("Stonehenge", 51.1789, -1.8262),
                  ("Tidworth", 51.2383, -1.6639), ("Wilton", 51.0790, -1.8590),
                  ],
        "roads": [("A303", [(51.150, -2.05), (51.165, -1.95), (51.170, -1.88), (51.176, -1.83), (51.170, -1.77),
                            (51.185, -1.70), (51.200, -1.62), (51.205, -1.55), (51.210, -1.46)]),
                  ("A345", [(51.069, -1.795), (51.100, -1.775), (51.140, -1.765), (51.172, -1.780), (51.200, -1.775), (51.240, -1.770)]),
                  ("A338", [(51.069, -1.795), (51.130, -1.700), (51.200, -1.680), (51.238, -1.664)])],
    },
    "fairford": {
        "name": "Around Fairford", "long": "Around RAF Fairford",
        "centre": (51.6822, -1.7900), "label": "RAF Fairford", "runway": 90, "ghosts": [(-120, -110), (-100, 130), (160, -90)],
        "blurb": "RIAT's home until 2026, on the edge of the Cotswolds.",
        "towns": [("Fairford", 51.7080, -1.7820), ("Lechlade", 51.6930, -1.6920), ("Kempsford", 51.6720, -1.7700),
                  ("Cirencester", 51.7190, -1.9680), ("Swindon", 51.5590, -1.7810), ("Highworth", 51.6300, -1.7120),
                  ("South Cerney", 51.6740, -1.9280), ("Cricklade", 51.6410, -1.8560)],
        "roads": [("A417", [(51.719, -1.968), (51.705, -1.860), (51.708, -1.782), (51.693, -1.692), (51.690, -1.600)]),
                  ("A419", [(51.719, -1.968), (51.660, -1.890), (51.620, -1.820), (51.560, -1.760)])],
    },
}

KINDS = {"tent": "Tents", "van": "Campervans", "caravan": "Caravans and tourers", "glamping": "Glamping"}

FAC_GROUPS = [
    ("Toilets and washing", [
        ("flush-toilets", "Flush toilets"), ("portaloos", "Portable toilets"), ("hot-showers", "Hot showers"),
        ("accessible-toilet", "Accessible toilet"), ("accessible-shower", "Accessible shower"), ("washing-up", "Washing up area")]),
    ("Power and water", [
        ("drinking-water", "Drinking water"), ("electric-hookup", "Electric hook up"), ("charging", "Phone charging"),
        ("wifi", "Wi-Fi"), ("chemical-disposal", "Chemical toilet disposal"), ("grey-waste", "Grey water disposal"),
        ("ice-packs", "Ice pack freezing")]),
    ("Food and drink", [("food-van", "Food vans"), ("shop", "Shop or essentials"), ("bar", "Bar")]),
    ("On the field", [
        ("car-by-tent", "Car by your tent"), ("hardstanding", "Hardstanding"), ("lighting", "Lighting at night"),
        ("security", "Overnight security"), ("bbq", "Barbecues"), ("campfires", "Campfires"), ("dogs", "Dogs welcome"),
        ("generators", "Generators"), ("late-arrival", "Late arrivals")]),
]
FAC_SHORT = ["hot-showers", "flush-toilets", "electric-hookup", "hardstanding", "food-van", "dogs", "car-by-tent"]

# "availability" in a campsite file: available, filling or full (blank shows no badge)
AVAIL = {"available": ("Spaces available", "av-ok"), "filling": ("Filling up", "av-mid"), "full": ("Fully booked", "av-full")}

# What visitors can filter the campsites by on the home page
FILTERS = [("tent", "Tents"), ("van", "Campervans"), ("caravan", "Caravans and tourers"), ("hookup", "Electric hook up"),
           ("glamping", "Glamping"), ("dogs", "Dogs welcome"), ("shuttle", "Shuttle to the show")]

GUIDES = [
    ("/camping-at-airshows", "tent", "Camping at Airshows", "What to pack, pitching up and staying comfortable"),
    ("/build-your-kit-calculator?list=camping", "list", "Camping kit calculator", "Tick your tent, beds and cooking kit and see the cost"),
    ("/riat", "plane", "RIAT 2027 guide", "What we know about Boscombe Down so far"),
    ("/airshow-questions", "ask", "Questions and answers", "Camping and places to stay, answered"),
]


def e(s):
    return html.escape(str(s or ""), quote=True)


def miles(a, b):
    (la1, lo1), (la2, lo2) = a, b
    r = 3958.8
    p1, p2 = math.radians(la1), math.radians(la2)
    dp, dl = p2 - p1, math.radians(lo2 - lo1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def has_pos(s):
    return bool(s.get("lat")) and bool(s.get("lng"))


def dist(s):
    if not has_pos(s):
        return None
    return miles(AREAS[s["area"]]["centre"], (s["lat"], s["lng"]))


def dist_text(s):
    d = dist(s)
    if d is None:
        return ""
    return f"{d:.1f} miles" if d < 10 else f"{round(d)} miles"


def page_href(s):
    """Link to a campsite page: its Wix page if it has one, otherwise the GitHub page in a new tab."""
    if s.get("wixPath"):
        return SITE + s["wixPath"], "_top"
    return GH + s["slug"] + ".html", "_blank"


def home_href():
    if HOME_WIX:
        return SITE + HOME_WIX, "_top"
    return GH + "index.html", "_top"


def fac_state(v):
    v = (v or "").strip()
    if not v:
        return None, ""
    if v.lower() == "no":
        return False, ""
    if v.lower() == "yes":
        return True, ""
    return True, v


def avail(s):
    return AVAIL.get((s.get("availability") or "").strip().lower())


def avail_badge(s):
    a = avail(s)
    return f'<span class="av {a[1]}">{a[0]}</span>' if a else ""


def site_tags(s):
    tags = {p.get("kind") for p in s.get("pitches", []) if p.get("kind") in KINDS}
    fac = s.get("facilities", {})
    if fac_state(fac.get("electric-hookup"))[0]:
        tags.add("hookup")
    if fac_state(fac.get("dogs"))[0]:
        tags.add("dogs")
    if (s.get("toShow", {}).get("shuttle") or "").strip():
        tags.add("shuttle")
    return tags


def from_price(s):
    best = None
    for p in s.get("pitches", []):
        txt = (p.get("price") or "").replace(",", "")
        num = "".join(ch for ch in txt if ch.isdigit() or ch == ".")
        try:
            val = float(num)
        except ValueError:
            continue
        if best is None or val < best[0]:
            best = (val, p.get("price"), p.get("per", ""))
    return best


# ---------------------------------------------------------------- icons
ICON = {
    "tent": '<path d="M3 20l9-15 9 15z"/><path d="M12 5v15M9 20l3-5 3 5"/>',
    "pin": '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "cal": '<rect x="4" y="5" width="16" height="15"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    "car": '<path d="M3 16v-4l2-5h14l2 5v4z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/><path d="M3 12h18"/>',
    "bus": '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4"/>',
    "walk": '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6-3-3 1-5 4 3 3 1M12 15l3 6"/>',
    "taxi": '<path d="M3 16v-4l2-5h14l2 5v4z"/><path d="M9 7l1-3h4l1 3"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    "park": '<rect x="4" y="4" width="16" height="16"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
    "tick": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "cross": '<path d="M7 7l10 10M17 7L7 17"/>',
    "phone": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    "mail": '<rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/>',
    "link": '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    "share": '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v8h14v-8"/>',
    "sign": '<path d="M12 3v18M6 6h11l2 2.5-2 2.5H6zM18 13H7l-2 2.5L7 18h11"/>',
    "fire": '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1.5 1 2 2 2 3 1-2 1-5 1-7z"/><path d="M4 21h16"/>',
    "van": '<path d="M2 17V7h12l4 4h4v6z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/><path d="M14 7v4h4"/>',
    "caravan": '<path d="M3 16V8a2 2 0 0 1 2-2h11a4 4 0 0 1 4 4v6zM20 16h2"/><circle cx="9" cy="17" r="1.8"/><rect x="6" y="9" width="5" height="3"/>',
    "glamping": '<path d="M12 3L3 20h18z"/><path d="M12 3v3M9 20l3-6 3 6"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "back": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "chev": '<path d="M9 5l7 7-7 7"/>',
    "list": '<rect x="5" y="3" width="14" height="18"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    "tag": '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    "drop": '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    "cols": '<rect x="3" y="4" width="18" height="16"/><path d="M9 4v16M15 4v16M3 10h18"/>',
    "plane": '<path d="M2 14l9-3 3-7 2 1-1 6 6 2v2l-6-1-3 6h-2l1-6-8 1z"/>',
    "ask": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h0"/>',
}


def icon(name, cls=""):
    c = f' class="{cls}"' if cls else ""
    return (f'<svg{c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[name]}</svg>')


# ---------------------------------------------------------------- map
SCALE = 20  # px per mile


def proj(area, lat, lng):
    c_lat, c_lng = AREAS[area]["centre"]
    x = (lng - c_lng) * math.cos(math.radians(c_lat)) * 69.17
    y = -(lat - c_lat) * 69.17
    return x * SCALE, y * SCALE


def ring_map(area, sites, highlight=None, cls="rmap"):
    a = AREAS[area]
    out = [f'<svg class="{cls}" viewBox="-250 -250 500 500" role="img" '
           f'aria-label="Map of campsites within 10 miles of {e(a["label"])}">']
    out.append('<defs><clipPath id="clip-' + area + '"><circle r="248"/></clipPath></defs>')
    out.append(f'<g clip-path="url(#clip-{area})">')
    for name, pts in a["roads"]:
        d = " ".join(("M" if i == 0 else "L") + "%.1f %.1f" % proj(area, la, lo) for i, (la, lo) in enumerate(pts))
        out.append(f'<path class="road" d="{d}"/>')
        lx, ly = proj(area, *pts[-2])
        out.append(f'<text class="rdl" x="{lx:.0f}" y="{ly - 8:.0f}">{e(name)}</text>')
    out.append('</g>')
    for r, lab in ((5, "5 miles"), (10, "10 miles")):
        out.append(f'<circle class="ring" r="{r * SCALE}"/>')
        out.append(f'<text class="rl" x="0" y="{-r * SCALE - 8}">{lab}</text>')
    for name, la, lo, *opt in a["towns"]:
        x, y = proj(area, la, lo)
        if math.hypot(x, y) > 245:
            continue
        anchor = opt[0] if opt else ("end" if x < -10 else "start")
        dy = opt[1] if len(opt) > 1 else 0
        dx = -9 if anchor == "end" else 9
        out.append(f'<circle class="town" cx="{x:.1f}" cy="{y:.1f}" r="4"/>'
                   f'<text class="tl" x="{x + dx:.1f}" y="{y + 4 + dy:.1f}" text-anchor="{anchor}">{e(name)}</text>')
    ang = math.radians(a["runway"])
    dx, dy = math.sin(ang) * 26, -math.cos(ang) * 26
    out.append(f'<path class="runway" d="M{-dx:.1f} {-dy:.1f}L{dx:.1f} {dy:.1f}"/>')
    out.append('<circle class="ctr" r="13"/><circle class="ctr-dot" r="6"/>')
    out.append(f'<text class="cl" x="0" y="40" text-anchor="middle">{e(a["label"])}</text>')
    n = 0
    for s in sites:
        if s["area"] != area or not has_pos(s):
            continue
        n += 1
        x, y = proj(area, s["lat"], s["lng"])
        x, y = max(-235, min(235, x)), max(-235, min(235, y))
        href, tgt = page_href(s)
        on = " on" if highlight == s["slug"] else ""
        out.append(f'<a href="{e(href)}" target="{tgt}" class="mk{on}"><title>{e(s["name"])}, {e(dist_text(s))}</title>'
                   f'<g transform="translate({x:.1f} {y:.1f})"><circle r="15"/>'
                   f'<path d="M-7 5L0 -7L7 5Z M0 -7V5"/></g></a>')
    if n == 0 and not highlight:
        for (tx, ty) in a["ghosts"]:
            out.append(f'<g class="mk ghost" transform="translate({tx} {ty})"><circle r="15"/><path d="M-7 5L0 -7L7 5Z M0 -7V5"/></g>')
        out.append(f'<text class="ghost-l" x="{a["ghosts"][0][0]}" y="{a["ghosts"][0][1] - 24}" text-anchor="middle">Your site here?</text>')
    out.append('</svg>')
    return "".join(out)


# ---------------------------------------------------------------- shared bits
# Layout: photo led, in the style of a charter site "about" page. Photo header with the menu on it, an offset
# photo with a dark stat box, small orange kickers over big headings, numbered step cards on a photo band,
# a dark form between two photos, photo cards with the text over them, and a dark footer with link columns.
# All photos are Jack's own from camping-hub-img/ (or the campsite's own).
KIND_COL = {"tent": "k-tent", "van": "k-van", "caravan": "k-caravan", "glamping": "k-glamping"}
IMG = "https://jskedge1.github.io/airshow-pages/camping-hub-img/"

def camp_scene(mode="colour"):
    """A flat campsite skyline: pines, tents, windbreaks, a campervan and a caravan. Ground is the bottom edge.
    Pass a colour such as "#0B1A27" as mode to draw it as a one colour silhouette."""
    one = mode if mode.startswith("#") else None
    G = 120

    def c(col):
        return one or col

    out = []

    def pine(x, h=78, w=40, col="#0E5F5B"):
        out.append(f'<path fill="{c(col)}" d="M{x} {G - h}L{x + w * .34:.0f} {G - h * .52:.0f}H{x + w * .16:.0f}L{x + w * .5:.0f} {G - 12}H{x + 4}V{G}H{x - 4}V{G - 12}H{x - w * .5:.0f}L{x - w * .16:.0f} {G - h * .52:.0f}H{x - w * .34:.0f}Z"/>')

    def tent(x, w=96, h=54, col="#2BA84A"):
        out.append(f'<path fill="{c(col)}" d="M{x - w / 2:.0f} {G}L{x} {G - h}L{x + w / 2:.0f} {G}Z"/>')
        if not one:
            out.append(f'<path fill="#13293C" d="M{x - 11} {G}L{x} {G - h * .62:.0f}L{x + 11} {G}Z"/>')
            out.append(f'<path stroke="#13293C" stroke-width="2" d="M{x} {G - h}V{G - h - 9}M{x - w / 2 - 14:.0f} {G}L{x - w * .3:.0f} {G - h * .42:.0f}M{x + w / 2 + 14:.0f} {G}L{x + w * .3:.0f} {G - h * .42:.0f}"/>')

    def dome(x, w=104, h=46, col="#E07A1F"):
        out.append(f'<path fill="{c(col)}" d="M{x - w / 2:.0f} {G}A{w / 2:.0f} {h} 0 0 1 {x + w / 2:.0f} {G}Z"/>')
        if not one:
            out.append(f'<path fill="#13293C" d="M{x - 12} {G}A12 {h * .6:.0f} 0 0 1 {x + 12} {G}Z"/>')

    def windbreak(x, n=6, pw=18, h=26):
        cols = ["#D74949", "#F2B233", "#00A6E2", "#2BA84A"]
        for i in range(n):
            col = c(cols[i % 4])
            op = ' opacity=".72"' if one and i % 2 else ""
            out.append(f'<rect x="{x + i * pw}" y="{G - h}" width="{pw - 2}" height="{h - 3}" fill="{col}"{op}/>')
        for i in range(n + 1):
            out.append(f'<rect x="{x + i * pw - 2}" y="{G - h - 5}" width="3" height="{h + 5}" fill="{c("#13293C")}"/>')

    def van(x, col="#00A6E2"):
        out.append(f'<path fill="{c("#13293C")}" d="M{x} {G - 8}V{G - 46}H{x + 62}L{x + 84} {G - 26}V{G - 8}Z"/>')
        if not one:
            out.append(f'<rect x="{x}" y="{G - 30}" width="84" height="6" fill="{col}"/>')
            out.append(f'<path fill="#F4F1EA" d="M{x + 8} {G - 40}H{x + 30}V{G - 32}H{x + 8}ZM{x + 38} {G - 40}H{x + 60}L{x + 68} {G - 32}H{x + 38}Z"/>')
        for wx in (x + 18, x + 66):
            out.append(f'<circle cx="{wx}" cy="{G - 8}" r="8" fill="{c("#13293C")}"/>')
            if not one:
                out.append(f'<circle cx="{wx}" cy="{G - 8}" r="3" fill="#F4F1EA"/>')

    def caravan(x):
        body = "#FFFFFF" if not one else one
        st = ' stroke="#13293C" stroke-width="3"' if not one else ""
        out.append(f'<rect x="{x}" y="{G - 50}" width="92" height="40" rx="8" fill="{body}"{st}/>')
        out.append(f'<path stroke="{c("#13293C")}" stroke-width="3" d="M{x + 92} {G - 16}H{x + 112}"/>')
        if not one:
            out.append(f'<rect x="{x + 2}" y="{G - 30}" width="88" height="5" fill="#6950A1"/>')
            out.append(f'<rect x="{x + 12}" y="{G - 43}" width="24" height="10" fill="#13293C"/><rect x="{x + 62}" y="{G - 43}" width="16" height="30" fill="#13293C"/>')
        out.append(f'<circle cx="{x + 40}" cy="{G - 8}" r="8" fill="{c("#13293C")}"/>')

    def flag(x, col="#D74949"):
        out.append(f'<rect x="{x}" y="{G - 84}" width="3" height="84" fill="{c("#13293C")}"/>')
        out.append(f'<path fill="{c(col)}" d="M{x + 3} {G - 84}L{x + 30} {G - 76}L{x + 3} {G - 68}Z"/>')

    def fire(x):
        if one:
            return
        out.append(f'<path fill="#F2B233" d="M{x - 9} {G - 4}Q{x - 12} {G - 18} {x} {G - 30}Q{x + 12} {G - 16} {x + 9} {G - 4}Z"/>')
        out.append(f'<path fill="#D74949" d="M{x - 4} {G - 4}Q{x - 6} {G - 12} {x} {G - 18}Q{x + 6} {G - 12} {x + 4} {G - 4}Z"/>')
        out.append(f'<path stroke="#8C6B3F" stroke-width="5" stroke-linecap="round" d="M{x - 13} {G - 3}H{x + 13}"/>')

    def lights(x1, y1, x2, y2, sag=26, n=13):
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + sag * 2
        out.append(f'<path fill="none" stroke="{c("#13293C")}" stroke-width="1.5" d="M{x1} {y1}Q{mx:.0f} {my:.0f} {x2} {y2}"/>')
        cols = ["#F2B233", "#D74949", "#00A6E2", "#2BA84A"]
        for i in range(1, n):
            k = i / n
            bx = (1 - k) ** 2 * x1 + 2 * (1 - k) * k * mx + k ** 2 * x2
            by = (1 - k) ** 2 * y1 + 2 * (1 - k) * k * my + k ** 2 * y2
            out.append(f'<circle cx="{bx:.0f}" cy="{by + 3:.0f}" r="4" fill="{c(cols[i % 4])}"/>')

    lights(559, 38, 1092, 53, 22, 15)
    lights(1092, 53, 1587, 38, 22, 15)
    for x, h, w, col in ((36, 84, 42, "#0E5F5B"), (76, 62, 34, "#13293C"), (428, 80, 42, "#13293C"), (466, 96, 46, "#0E5F5B"),
                         (896, 74, 38, "#0E5F5B"), (1378, 90, 44, "#0E5F5B"), (1418, 66, 36, "#13293C"), (1458, 82, 40, "#0E5F5B"),
                         (1896, 78, 40, "#13293C"), (1936, 94, 46, "#0E5F5B"), (2326, 70, 36, "#0E5F5B"), (2366, 88, 44, "#13293C")):
        pine(x, h, w, col)
    tent(196, col="#2BA84A"); windbreak(262, 6)
    flag(556); dome(628, col="#E07A1F"); van(724)
    fire(1012); tent(1092, 104, 58, "#00A6E2"); windbreak(1160, 7)
    flag(1584, "#F2B233"); tent(1652, 92, 52, "#6950A1"); caravan(1736)
    dome(2084, col="#2BA84A"); van(2176, "#D74949")
    return (f'<svg viewBox="0 0 2400 {G}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">'
            + "".join(out) + '</svg>')


CSS = r"""
:root{--navy:#13293C;--deep:#0B1A27;--or:#D74949;--or-ink:#BF3636;--or-l:#32B4AF;--teal:#32B4AF;--teal-ink:#0E5F5B;--purple:#6950A1;--ink:#13293C;--body:#4F5D68;--line:#DDE3E8;--soft:#F2F4F5;
--green:#1E8540;--amber:#F2B233;--red:#C93A3A}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
html,body{scrollbar-width:none;-ms-overflow-style:none}
html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;width:0;height:0}
body{font:400 17px/1.6 "Barlow",system-ui,sans-serif;color:var(--body);background:#fff;-webkit-font-smoothing:antialiased}
a{color:inherit}
img{display:block;max-width:100%;pointer-events:none;user-select:none}
[hidden]{display:none!important}
.wrap{max-width:1188px;margin:0 auto;padding:0 24px}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
h1,h2,h3{color:var(--ink);font-weight:700;line-height:1.1}
a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--or-l);outline-offset:2px}
section[id]{scroll-margin-top:20px}

.kick{display:block;font:700 21px/1.25 "Barlow",sans-serif;color:var(--or-ink)}
.h{font-size:clamp(31px,4.3vw,46px);margin-top:8px}
.band .kick,.mapband .kick{color:var(--or-l)}
.lede{margin-top:18px;max-width:62ch}
.sec{padding:96px 0}
.sec.tint{background:var(--soft)}
.sec-head{max-width:720px;margin-bottom:44px}
.sec-head.mid{margin-left:auto;margin-right:auto;text-align:center}
.sec-head.mid .lede{margin-left:auto;margin-right:auto}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;font:700 17px/1 "Barlow",sans-serif;padding:17px 28px;text-decoration:none;border:0;cursor:pointer;transition:background .2s,color .2s}
.btn svg{width:16px;height:16px;flex:none}
.btn.or{background:var(--or);color:#fff}.btn.or:hover{background:var(--navy)}
.btn.nv{background:var(--navy);color:#fff}.btn.nv:hover{background:var(--or)}
.on-dark .btn.or:hover,.btn.or.inv:hover{background:#fff;color:var(--navy)}
.btn.wh{background:#fff;color:var(--navy)}.btn.wh:hover{background:var(--or);color:#fff}
.btns{display:flex;flex-wrap:wrap;gap:14px}
.more{display:inline-block;font:700 17px/1.2 "Barlow",sans-serif;color:var(--or-ink);text-decoration:none;padding-bottom:3px;border-bottom:2px solid transparent}
.more:hover{border-bottom-color:var(--or-ink)}

/* top bar and photo header */
.top{background:var(--deep);color:#fff;font-size:14px}
.top .wrap{display:flex;justify-content:space-between;align-items:center;gap:8px 26px;flex-wrap:wrap;min-height:50px;padding-top:8px;padding-bottom:8px}
.top span,.top a{display:inline-flex;align-items:center;gap:9px;text-decoration:none}
.top svg{width:16px;height:16px;color:var(--or-l)}
.top .l{display:flex;gap:8px 26px;flex-wrap:wrap}
.top a:hover{color:var(--or-l)}
.hd{position:relative;color:#fff;background:var(--navy) center/cover no-repeat}
.hd::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,27,39,.72),rgba(14,36,51,.62) 60%,rgba(14,36,51,.8))}
.hd .wrap{position:relative}
.nav{display:flex;align-items:center;gap:20px;min-height:92px;border-bottom:1px solid rgba(255,255,255,.22)}
.logo{display:flex;align-items:center;text-decoration:none;margin-right:auto;flex:none}
.logo img{height:64px;width:auto;transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.logo:hover img{transform:scale(1.04)}
.ft .logo img{height:78px}
.nav ul{list-style:none;display:flex;gap:4px;align-self:stretch}
.nav li{display:flex}
.nav li a{display:flex;align-items:center;padding:0 14px;font-weight:500;font-size:15px;text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
.nav li a:hover{border-bottom-color:var(--or-l)}
.ttl{padding:78px 0 96px}
.ttl h1{color:#fff;font-size:clamp(38px,5.6vw,58px)}
.crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-top:16px;font-size:17px}
.crumbs a{text-decoration:none}
.crumbs a:hover{color:var(--or-l)}
.crumbs svg{width:14px;height:14px;color:var(--or-l)}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.tagp{display:inline-flex;align-items:center;font:700 16px/1 "Barlow",sans-serif;padding:8px 12px;background:var(--purple);color:#fff}

/* the campsite strip: one link per campsite page */
.strip{border-bottom:1px solid var(--line);background:#fff}
.strip .wrap{display:flex;align-items:center;gap:6px 28px;overflow-x:auto;scrollbar-width:none}
.strip .wrap::-webkit-scrollbar{display:none}
.strip .lab{flex:none;font:700 17px/1 "Barlow",sans-serif;color:var(--purple)}
.st{position:relative;flex:none;display:inline-flex;align-items:center;gap:8px;padding:18px 0 15px;font-weight:600;color:var(--ink);text-decoration:none;border-bottom:3px solid transparent;white-space:nowrap}
.st:hover,.st.on{border-bottom-color:var(--teal)}
.st small{font-weight:400;font-size:14px;color:var(--body)}
.dot{width:9px;height:9px;border-radius:50%;flex:none;display:inline-block}
.dot.av-ok{background:var(--green)}.dot.av-mid{background:var(--amber)}.dot.av-full{background:var(--red)}

/* availability */
.av{display:inline-flex;align-items:center;gap:8px;font:700 16px/1 "Barlow",sans-serif;padding:8px 12px}
.av::before{content:"";width:9px;height:9px;border-radius:50%;background:currentColor;flex:none}
.av-ok{background:var(--green);color:#fff}.av-mid{background:var(--amber);color:var(--ink)}.av-full{background:var(--red);color:#fff}

/* offset photo with the dark stat box, and the text beside it */
.about{display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1fr);gap:64px;align-items:center}
.ab-ph{position:relative;padding:46px 0 0 86px}
.ab-ph img{width:100%;aspect-ratio:4/5;object-fit:cover}
.statbox{position:absolute;left:0;top:0;width:208px;background:var(--navy);color:#fff;text-align:center;padding:30px 16px 26px}
.statbox svg{width:52px;height:52px;color:var(--or-l);margin:0 auto 12px;display:block}
.statbox b{display:block;font:800 46px/1 "Barlow",sans-serif}
.statbox b sup{font-size:22px;color:var(--or-l);margin-left:6px}
.statbox span{display:block;margin-top:10px;font-size:16px;line-height:1.3}
.feat{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:30px 0 36px}
.feat>div{background:var(--soft);border-top:5px solid var(--teal);padding:20px 20px 18px;transition:transform .35s cubic-bezier(.22,.61,.36,1),box-shadow .35s,background .35s}
.feat>div:hover{transform:translateY(-6px);background:#fff;box-shadow:0 22px 34px -22px rgba(10,27,39,.5)}
.feat h3{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:600}
.feat h3 i,.ticks2 li i{flex:none;width:20px;height:20px;border-radius:50%;background:var(--teal);color:var(--navy);display:grid;place-items:center}
.feat h3 i svg,.ticks2 li i svg{width:11px;height:11px}
.feat p{margin-top:10px;font-size:15.5px}
.quote{margin-top:34px;border-left:4px solid var(--teal);padding:4px 0 4px 20px;color:var(--ink);font-size:19px;line-height:1.5;font-weight:500}
.quote cite{display:block;margin-top:8px;font-style:normal;font-size:15px;font-weight:600;color:var(--or-ink)}

/* photo band with numbered step cards */
.band{position:relative;color:#fff;background:var(--navy) center/cover no-repeat;padding:100px 0 110px;text-align:center}
.band::before{content:"";position:absolute;inset:0;background:rgba(12,40,56,.86)}
.band .wrap{position:relative}
.band .h{color:#fff}
.band .lede{color:#E6EDF1;margin-left:auto;margin-right:auto}
.steps{display:grid;grid-template-columns:repeat(var(--n,4),minmax(0,1fr));gap:36px;margin-top:76px}
.step{position:relative;background:rgba(255,255,255,.1);padding:46px 18px 32px}
.step .no{position:absolute;top:-30px;left:18px;width:60px;height:60px;border-radius:50%;background:var(--or);color:#fff;font:700 25px/1 "Barlow",sans-serif;display:grid;place-items:center;box-shadow:0 0 0 5px rgba(215,73,73,.32)}
.step>svg{width:46px;height:46px;margin:0 auto 16px;display:block;stroke-width:1.4}
.step h3{color:#fff;font-size:21px;font-weight:600}
.step p{margin-top:8px;color:#E6EDF1;font-size:15.5px}

/* photo cards with the text over them */
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
.cc{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:452px;padding:28px;color:#fff;background:var(--navy);overflow:hidden}
.cc>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cc::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,36,51,.05) 20%,rgba(14,36,51,.82) 62%,rgba(10,27,39,.97))}
.cc>*:not(img){position:relative;z-index:1}
.cc .av{position:absolute;top:0;left:0}
.cc h3{color:#fff;font-size:23px;font-weight:600}
.cc h3 a{text-decoration:none}
.cc h3 a:hover{color:var(--or-l)}
.cc p{margin-top:8px;color:#E6EDF1;font-size:15.5px;line-height:1.55}
.cc .meta{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:12px;font-weight:600;color:#fff;font-size:15px}
.cc .meta span{display:inline-flex;align-items:center;gap:7px}
.cc .meta svg{width:16px;height:16px;color:var(--or-l)}
.cc .more{margin-top:18px;color:var(--or-l);align-self:flex-start}
.cc .more:hover{border-bottom-color:var(--or-l)}
.cc.plain{min-height:0;justify-content:flex-start;background:var(--soft);color:var(--body);border:2px dashed #C6D0D7;padding:30px}
.cc.plain::after{display:none}
.cc.plain h3{color:var(--ink)}
.cc.plain p{color:var(--body)}
.none{grid-column:1/-1;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:22px;align-items:center;background:var(--soft);padding:28px 30px}
.none>svg{width:46px;height:46px;color:var(--purple)}
.none h3{font-size:21px;font-weight:600}
.none p{margin-top:4px}
.nomatch{display:none;grid-column:1/-1;background:var(--soft);padding:24px 28px;color:var(--ink)}
.nomatch button,.shown button{font:700 16px/1.2 "Barlow",sans-serif;color:var(--or-ink);background:none;border:0;border-bottom:2px solid var(--or);padding:0 0 3px;cursor:pointer;margin-left:10px}

/* finder: a plain row of fields above the cards */
.finder{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px 34px;align-items:end;padding:26px 30px 28px;background:var(--soft);margin-bottom:26px}
.ff label,.ff .lg{display:block;font:700 18px/1.2 "Barlow",sans-serif;color:var(--ink);margin-bottom:6px}
.ff select{width:100%;font:500 17px/1.3 "Barlow",sans-serif;color:var(--ink);padding:10px 2px 8px;background:transparent;border:0;border-bottom:1px solid #AEBBC4;border-radius:0}
.fc-row{display:flex;flex-wrap:wrap;gap:8px}
.fchk{display:inline-flex;align-items:center;gap:9px;padding:10px 14px;background:#fff;border:1px solid #C6D0D7;cursor:pointer;font:500 15px/1 "Barlow",sans-serif;color:var(--ink)}
.fchk::before{content:"";width:14px;height:14px;border:2px solid #8FA1AF;flex:none}
.fchk[aria-pressed=true]{background:var(--navy);border-color:var(--navy);color:#fff}
.fchk[aria-pressed=true]::before{border-color:#fff;background:var(--teal)}
.shown{margin:0 0 22px;font-weight:600;color:var(--ink)}

/* compare table */
.swipe{display:none}
.board-scroll{overflow-x:auto;border:1px solid var(--line)}
.board{border-collapse:collapse;width:100%;min-width:940px;font-size:15.5px;line-height:1.4;color:var(--ink)}
.board th,.board td{padding:14px 8px;text-align:center;border-top:1px solid var(--line);white-space:nowrap}
.board thead th{position:relative;background:var(--navy);color:#fff;font:700 15px/1.3 "Barlow",sans-serif;border-top:0;white-space:normal;vertical-align:middle}
.board .no{font:700 20px/1 "Barlow",sans-serif;color:var(--or-ink);width:56px}
.board tbody th{text-align:left;font-weight:600;white-space:normal;min-width:200px;position:sticky;left:0;background:#fff;box-shadow:1px 0 0 var(--line)}
.board thead th:nth-child(2){text-align:left;position:sticky;left:0;z-index:1}
.board tbody th a{text-decoration:none}
.board tbody th a:hover{color:var(--or-ink)}
.board tbody th small{display:block;font:400 14px/1.3 "Barlow",sans-serif;color:var(--body)}
.board tbody tr:nth-child(even) td,.board tbody tr:nth-child(even) th{background:var(--soft)}
.board .y,.board .n{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;position:relative}
.board .y{background:var(--teal);color:var(--navy)}
.board .n{color:#B4BEC6}
.board .y svg{width:13px;height:13px;stroke-width:3}.board .n svg{width:15px;height:15px}
.board .pr{font-weight:700;font-size:18px}
.board td.sp .av{white-space:nowrap;background:none;padding:0;color:var(--ink);font-weight:600}
.board td.sp .av-ok::before{background:var(--green)}.board td.sp .av-mid::before{background:var(--amber)}.board td.sp .av-full::before{background:var(--red)}

/* show map on a dark band */
.mapband{background:var(--navy);color:#fff;padding:96px 0}
.mapband .h{color:#fff}
.mapband .lede{color:#D5DEE4}
.maps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px;margin-top:20px}
.mapbox h3{color:#fff;font-size:22px;font-weight:600;text-align:center}
.mapbox p{color:#D5DEE4;text-align:center;font-size:15.5px;margin-top:4px}
.rmap{width:100%;height:auto;display:block;overflow:visible;max-width:520px;margin:0 auto}
.rmap .ring{fill:none;stroke:#fff;stroke-opacity:.35;stroke-width:1.5;stroke-dasharray:5 7}
.rmap .rl{fill:#C2CED6;font:500 13px "Barlow",sans-serif;text-anchor:middle}
.rmap .road{fill:none;stroke:#8C9DAD;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;opacity:.5}
.rmap .rdl{fill:#B9CAD8;font:600 12px "Barlow",sans-serif;text-anchor:middle}
.rmap .town{fill:#fff}
.rmap .tl{fill:#E3EAF0;font:500 14px "Barlow",sans-serif}
.rmap .runway{stroke:#fff;stroke-width:9;stroke-linecap:round}
.rmap .ctr{fill:var(--navy);stroke:#fff;stroke-width:3}
.rmap .ctr-dot{fill:#fff}
.rmap .cl{fill:#fff;font:700 15px "Barlow",sans-serif}
.rmap .mk circle{fill:var(--or);stroke:#fff;stroke-width:2.5}
.rmap .mk path{fill:none;stroke:#fff;stroke-width:2;stroke-linejoin:round}
.rmap a.mk:hover circle,.rmap .mk.on circle{fill:#fff}
.rmap a.mk:hover path,.rmap .mk.on path{stroke:var(--or)}
.rmap .mk.ghost circle{fill:none;stroke-dasharray:4 4;stroke:#C2CED6}
.rmap .mk.ghost path{stroke:#C2CED6}
.rmap .ghost-l{fill:#C2CED6;font:600 14px "Barlow",sans-serif}

/* text on the left, dark card and photo on the right */
.offer{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.25fr);gap:56px;align-items:center}
.minis{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:30px;padding-top:30px;border-top:1px solid var(--line)}
.mini>svg{width:42px;height:42px;color:var(--purple);stroke-width:1.4}
.mini h3{font-size:20px;font-weight:600;margin-top:12px}
.mini p{margin:6px 0 12px;font-size:15.5px}
.pc{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);align-items:center}
.pc-card{position:relative;z-index:1;background:var(--navy);color:#fff;padding:42px 38px 38px;margin:-12px 0}
.pc-card .flag{position:absolute;top:22px;right:38px;background:var(--purple);color:#fff;font:700 16px/1 "Barlow",sans-serif;padding:7px 12px}
.pc-card h3{color:#fff;font-size:22px;font-weight:600;max-width:10ch}
.pc-card .big{font:700 40px/1 "Barlow",sans-serif;margin-top:14px;padding-bottom:22px;border-bottom:1px solid rgba(255,255,255,.2)}
.pc-card .big small{font-size:15px;font-weight:400;color:var(--or-l);margin-left:4px}
.chev{list-style:none;margin:20px 0 24px;display:grid;gap:9px}
.chev li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px;align-items:start}
.chev li svg{width:14px;height:14px;color:var(--or-l);margin-top:5px;stroke-width:3}
.pc-card .btn{width:100%}
.pc-card .fine{margin-top:16px;font-size:14px;text-align:center;color:#D5DEE4}
.pc img{width:100%;height:100%;min-height:420px;object-fit:cover}

/* dark form between two photos */
.formrow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr) minmax(0,1fr)}
.formrow>img{width:100%;height:100%;min-height:560px;object-fit:cover}
.fpanel{background:var(--navy);color:#fff;padding:54px clamp(22px,4vw,60px) 56px}
.fpanel h2{color:#fff;font-size:30px;font-weight:600}
.fpanel>p{margin-top:8px;color:#D5DEE4;font-size:15.5px}
.fpanel form{margin-top:22px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 26px}
.fld{display:grid;gap:2px;align-content:start}
.fld.wide{grid-column:1/-1}
.fld label,.fld legend{font-size:14.5px;color:#B8C6CF}
.fld label i{font-style:normal;color:var(--or-l)}
.fld input[type=text],.fld input[type=email],.fld input[type=tel],.fld select,.fld textarea{font:400 16px/1.4 "Barlow",sans-serif;color:#fff;padding:8px 0 8px;border:0;border-bottom:1px solid rgba(255,255,255,.3);background:transparent;width:100%;border-radius:0}
.fld select option{color:var(--ink);background:#fff}
.fld textarea{min-height:76px;resize:vertical}
.fld input::placeholder{color:#8FA1AF}
.fld .bad{border-bottom-color:var(--or-l)}
fieldset.fld{border:0}
.ticks{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:8px}
.ticks label{display:inline-flex;align-items:center;gap:8px;color:#fff;font-size:15.5px;cursor:pointer}
.ticks input{width:17px;height:17px;accent-color:var(--teal)}
.fpanel .go{grid-column:1/-1;display:grid;gap:12px}
.fpanel .go .btn{width:100%}
.fpanel .go small{color:#B8C6CF;font-size:14.5px;line-height:1.5}
.fpanel .err{grid-column:1/-1;color:#FFB8B8;font-weight:600;display:none}
.made{display:none;margin-top:22px;border-top:1px solid rgba(255,255,255,.2);padding-top:20px}
.made b{color:#fff;font-size:19px}
.made p{margin-top:4px;color:#D5DEE4;font-size:15.5px}
.made textarea{margin-top:12px;width:100%;min-height:190px;font:400 14px/1.5 ui-monospace,Menlo,Consolas,monospace;padding:12px;border:0;background:#fff;color:var(--ink)}
.made .btns{margin-top:12px}

/* footer */
.sky{position:relative;height:92px;overflow:hidden;pointer-events:none;background:#fff}
.sky.tint{background:var(--soft)}
.sky svg{position:absolute;bottom:-1px;left:50%;height:100%;width:auto;min-width:100%;transform:translateX(-50%)}
.ft{background:var(--deep);color:#fff;padding:76px 0 64px}
.ft .cols{display:grid;grid-template-columns:1.25fr .9fr .9fr 1.3fr;gap:40px}
.ft .logo{margin-bottom:22px}
.ft h3{color:#fff;font-size:22px;font-weight:600;margin-bottom:18px}
.ft p{color:#D5DEE4;font-size:15px}
.ft .ct{display:grid;gap:12px;font-size:15px}
.ft .ct span,.ft .ct a{display:flex;gap:11px;align-items:center;text-decoration:none}
.ft .ct svg{width:17px;height:17px;color:var(--or-l);flex:none}
.ft ul{list-style:none;display:grid;gap:13px;font-size:15px}
.ft li a{display:inline-flex;gap:9px;align-items:center;text-decoration:none}
.ft li a:hover,.ft .ct a:hover{color:var(--or-l)}
.ft li svg{width:13px;height:13px;color:var(--or-l);stroke-width:3;flex:none}
.ft .btn{margin-top:18px}
.fbar{background:#07121B;color:#C2CED6;font-size:14px;line-height:1.6;padding:22px 0}
.fbar p+p{margin-top:6px}
.fbar a{color:#fff}
.sample-bar{background:var(--amber);color:var(--ink);font:600 15px/1.4 "Barlow",sans-serif;text-align:center;padding:9px 18px}

@media (max-width:1000px){
  .sec,.mapband{padding:72px 0}
  .about,.offer{grid-template-columns:1fr;gap:44px}
  .cards{grid-template-columns:repeat(2,minmax(0,1fr))}
  .steps{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:62px}
  .formrow{grid-template-columns:1fr 1fr}
  .formrow>img{min-height:300px;height:300px}
  .fpanel{grid-column:1/-1;order:-1}
  .ft .cols{grid-template-columns:1fr 1fr}
  .finder{grid-template-columns:1fr 1fr}
  .ff.need{grid-column:1/-1;margin-top:12px}
  .swipe{display:inline}
  .nav{flex-wrap:wrap;row-gap:0;padding-top:14px}
  .nav ul{order:3;flex-basis:100%;overflow-x:auto;scrollbar-width:none;height:48px;margin-top:12px;border-top:1px solid rgba(255,255,255,.22)}
  .nav ul::-webkit-scrollbar{display:none}
  .nav li:first-child a{padding-left:0}
}
@media (max-width:720px){
  .wrap{padding:0 18px}
  .sec,.mapband,.band{padding:60px 0}
  .band{padding-bottom:70px}
  .top .r{display:none}
  .logo img{height:50px}
  .ft .logo img{height:66px}
  .nav{min-height:72px}
  .nav .btn{padding:11px 11px;font-size:15px}
  .ttl{padding:54px 0 66px}
  .ab-ph{padding:34px 0 0 34px}
  .statbox{width:164px;padding:22px 12px 18px}
  .statbox b{font-size:34px}
  .statbox svg{width:40px;height:40px}
  .feat,.minis,.cards,.maps,.steps,.finder,.pc{grid-template-columns:1fr}
  .steps{row-gap:56px}
  .pc-card{margin:0}
  .pc img{min-height:240px;height:240px}
  .none{grid-template-columns:1fr}
  .formrow{grid-template-columns:1fr}
  .formrow>img:last-child{display:none}
  .fpanel form{grid-template-columns:1fr}
  .ft .cols{grid-template-columns:1fr}
  .cc{min-height:400px}
  .sky{height:66px}
}
/* ---- motion: things rise into place as you scroll, and respond when you point at them ---- */
.rv{opacity:0;transform:translateY(28px);transition:opacity .75s cubic-bezier(.22,.61,.36,1),transform .75s cubic-bezier(.22,.61,.36,1)}
.rv.in{opacity:1;transform:none}
@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes drift{from{background-position:50% 44%}to{background-position:50% 56%}}
@keyframes pop{0%{transform:scale(0)}70%{transform:scale(1.14)}100%{transform:scale(1)}}
@keyframes ring{0%{box-shadow:0 0 0 5px rgba(215,73,73,.32),0 0 0 5px rgba(255,130,130,.5)}100%{box-shadow:0 0 0 5px rgba(215,73,73,.32),0 0 0 22px rgba(255,130,130,0)}}
.hd{animation:drift 26s ease-in-out infinite alternate}
.ttl .tags{animation:rise .7s .05s both}
.ttl h1{animation:rise .8s .15s both}
.ttl .crumbs{animation:rise .8s .3s both}
.nav li a{transition:border-color .25s,color .25s}
.nav li a:hover{color:var(--or-l)}
.btn{transition:background .25s,color .25s,transform .25s,box-shadow .25s}
.btn:hover{transform:translateY(-3px);box-shadow:0 12px 22px -12px rgba(10,27,39,.55)}
.btn:active{transform:translateY(0);box-shadow:none}
.more{border-bottom:0;background:linear-gradient(currentColor,currentColor) 0 100%/0 2px no-repeat;transition:background-size .3s}
.more:hover{background-size:100% 2px}
.more::after{content:"";display:inline-block;width:7px;height:7px;border:solid currentColor;border-width:2px 2px 0 0;transform:rotate(45deg);margin-left:8px;position:relative;top:-2px;transition:margin .3s}
.more:hover::after{margin-left:14px}
.st{transition:border-color .25s,color .25s}
.st:hover{color:var(--or-ink)}
.statbox{transition:transform .4s cubic-bezier(.22,.61,.36,1),box-shadow .4s}
.ab-ph:hover .statbox{transform:translate(-6px,-6px);box-shadow:14px 14px 0 var(--teal)}
.ab-ph{overflow:visible}
.ab-ph img{transition:filter .5s}
.ab-ph:hover img{filter:saturate(1.15)}
.feat h3 i{transition:transform .3s}
.feat>div:hover h3 i{transform:translateX(5px) scale(1.12)}
.feat>div:hover h3{color:var(--or-ink)}
.feat h3{transition:color .25s}

.step{transition:transform .4s cubic-bezier(.22,.61,.36,1),background .35s,box-shadow .4s,opacity .75s cubic-bezier(.22,.61,.36,1)}
.step .no{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.step>svg{transition:transform .35s,color .35s}
.step:hover{transform:translateY(-10px);background:rgba(255,255,255,.2);box-shadow:0 24px 34px -22px rgba(0,0,0,.7)}
.step:hover .no{transform:scale(1.14) rotate(-8deg);animation:ring 1.1s ease-out infinite}
.step:hover>svg{color:var(--or-l);transform:scale(1.12)}
.step.rv .no{transform:scale(0)}
.step.rv.in .no{animation:pop .6s .25s cubic-bezier(.34,1.56,.64,1) both}
.step.rv.in:hover .no{animation:ring 1.1s ease-out infinite;transform:scale(1.14) rotate(-8deg)}

.cc{transition:box-shadow .4s,transform .4s cubic-bezier(.22,.61,.36,1),opacity .75s cubic-bezier(.22,.61,.36,1)}
.cc>img{transition:transform 1s cubic-bezier(.22,.61,.36,1)}
.cc:hover{transform:translateY(-6px);box-shadow:0 26px 40px -24px rgba(10,27,39,.7)}
.cc:hover>img{transform:scale(1.08)}
.cc.plain:hover{transform:none;box-shadow:none}
.gal img{transition:transform 1s cubic-bezier(.22,.61,.36,1)}
.gal figure:hover img{transform:scale(1.07)}
.gal figcaption{transition:padding .35s}
.gal figure:hover figcaption{padding-bottom:22px}
.fchk{transition:background .2s,color .2s,border-color .2s}
.fchk:hover{border-color:var(--navy)}
.board tbody td,.board tbody th{transition:background .2s}
.board tbody tr:hover td,.board tbody tr:hover th{background:#E4F4F3}
.rmap a.mk circle,.rmap a.mk path{transition:fill .25s,stroke .25s}
.mini>svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.mini:hover>svg{transform:translateY(-6px) rotate(-6deg)}
.pc-card,.price{transition:transform .4s cubic-bezier(.22,.61,.36,1),box-shadow .4s,opacity .75s cubic-bezier(.22,.61,.36,1)}
.price:hover{transform:translateY(-8px);box-shadow:0 26px 36px -24px rgba(10,27,39,.8)}
.price .flag{transition:padding .3s}
.price:hover .flag{padding-right:20px}
.pc img,.formrow>img{transition:filter .6s}
.pc:hover img,.formrow>img:hover{filter:saturate(1.2) brightness(1.04)}
.fg li{transition:transform .25s}
.fg li.y:hover{transform:translateX(5px)}
.fld input,.fld select,.fld textarea{transition:border-color .25s}
.fld input:hover,.fld select:hover,.fld textarea:hover{border-bottom-color:var(--or-l)}
.ft li a,.ft .ct a{transition:transform .25s,color .25s}
.ft li a:hover{transform:translateX(5px)}
.top a svg{transition:transform .25s}
.top a:hover svg{transform:translateX(4px)}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation:none!important;transition:none!important}
  .rv{opacity:1;transform:none}
  .step.rv .no{transform:none}
}
"""


# Scroll reveal: marks the blocks below, then fades each one in as it comes into view.
MOTION_JS = r"""<script>
(function(){
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
var sel='.sec-head,.about>*,.finder,.shown,.cc,.none,.board-scroll,.mapbox,.offer>*,.band .kick,.band .h,.band .lede,.step,.price,.dates,.fg,.rules-h,.rules>div,.where>*,.formrow>*,.gal figure,.ft .cols>div';
var els=[].slice.call(document.querySelectorAll(sel));
if(!els.length||!('IntersectionObserver' in window))return;
els.forEach(function(el){var sibs=[].filter.call(el.parentNode.children,function(x){return els.indexOf(x)>-1});
  var d=Math.min(sibs.indexOf(el),5)*110;el.classList.add('rv');if(d)el.style.transitionDelay=d+'ms'});
function show(el){el.classList.add('in');setTimeout(function(){el.style.transitionDelay=''},1100)}
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){show(x.target);io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
els.forEach(function(el){io.observe(el)});
/* never leave anything hidden: if a block has not been seen after a while but is on screen, show it */
setTimeout(function(){els.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight&&r.bottom>0)show(el)})},1800);
})();
</script>"""


def head(title, desc, extra_css="", canonical=""):
    can = f'<link rel="canonical" href="{e(canonical)}">\n' if canonical else ""
    return f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<!-- Built by riat-camping-src/build.py from riat-camping-src/sites/*.json. Edit the JSON and rebuild, not this file. -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
{can}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>{CSS}{extra_css}</style>
</head>
<body>
"""


LOGO = "https://jskedge1.github.io/airshow-pages/brand/ukag-header-logo.png"   # white version, for dark backgrounds


def logo():
    """The UK Airshow Guide logo, linking to the site's home page."""
    return (f'<a class="logo" href="{SITE}/" target="_top"><img src="{LOGO}" width="750" height="249" '
            f'alt="UK Airshow Guide, by The Big Guide to UK Airshows" decoding="async"></a>')


def top_bar():
    return (f'<div class="top"><div class="wrap"><div class="l"><span>{icon("pin")}MOD Boscombe Down, Wiltshire</span>'
            f'<span>{icon("cal")}16 to 18 July 2027</span>'
            f'<a href="mailto:{CONTACT}?subject=RIAT%20campsite%20listing">{icon("mail")}{CONTACT}</a></div>'
            f'<div class="r"><a href="{SITE}{RIAT_WIX}" target="_top">Back to the RIAT guide {icon("arrow")}</a></div></div></div>')


def header(photo, nav_items, title, crumbs, tags="", button=None):
    """Photo header: logo and menu on the photo, then the page title and breadcrumb."""
    nav = "".join(f'<li><a href="{e(href)}">{e(lab)}</a></li>' for href, lab in nav_items)
    btn = f'<a class="btn or inv" href="{e(button[0])}"{button[2] if len(button) > 2 else ""}>{e(button[1])}</a>' if button else ""
    cr = f'{icon("chev")}'.join(f'<a href="{e(h)}" target="{t}">{e(l)}</a>' if h else f'<span>{e(l)}</span>' for l, h, t in crumbs)
    bg = f" style=\"background-image:url('{e(photo)}')\"" if photo else ""
    return (f'<header class="hd"{bg}><div class="wrap"><nav class="nav" aria-label="On this page">{logo()}<ul>{nav}</ul>{btn}</nav>'
            f'<div class="ttl">{tags}<h1>{e(title)}</h1><p class="crumbs">{cr}</p></div></div></header>')


def site_strip(live, current=None):
    """The campsite links: home first, then one per campsite page."""
    h, t = home_href()
    on = " on" if current == "home" else ""
    out = ['<nav class="strip" aria-label="RIAT campsites"><div class="wrap"><span class="lab">Campsites</span>',
           f'<a class="st{on}" href="{e(h)}" target="{t}"{" aria-current=page" if on else ""}>All campsites</a>']
    for s in live:
        href, tgt = page_href(s)
        on = " on" if current == s["slug"] else ""
        cur = ' aria-current="page"' if on else ""
        a = avail(s)
        dot = f'<i class="dot {a[1]}"></i><span class="vh">{a[0]}: </span>' if a else ""
        out.append(f'<a class="st{on}" href="{e(href)}" target="{tgt}"{cur}>{dot}{e(s["name"])} <small>{e(dist_text(s))}</small></a>')
    out.append('</div></nav>')
    return "".join(out)


def sec_head(kick, title, lede="", mid=False):
    return (f'<div class="sec-head{" mid" if mid else ""}"><span class="kick">{e(kick)}</span><h2 class="h">{e(title)}</h2>'
            f'{"<p class=lede>" + e(lede) + "</p>" if lede else ""}</div>')


def chev_list(items):
    return '<ul class="chev">' + "".join(f'<li>{icon("chev")}<span>{e(x)}</span></li>' for x in items if x) + '</ul>'


def footer(live, extra=""):
    h, t = home_href()
    camps = "".join(f'<li><a href="{e(page_href(s)[0])}" target="{page_href(s)[1]}">{icon("chev")}{e(s["name"])}</a></li>' for s in live[:6])
    if not camps:
        camps = f'<li><a href="{e(h)}#list" target="{t}">{icon("chev")}Campsites are being added</a></li>'
    guides = "".join(f'<li><a href="{SITE}{path}" target="_top">{icon("chev")}{e(name)}</a></li>' for path, ic, name, sub in GUIDES)
    return f"""<div class="sky{extra}">{camp_scene("#0B1A27")}</div>
<footer class="ft"><div class="wrap cols">
  <div>{logo()}<div class="ct"><span>{icon("pin")}MOD Boscombe Down, Wiltshire</span><span>{icon("cal")}RIAT, 16 to 18 July 2027</span>
    <a href="mailto:{CONTACT}?subject=RIAT%20campsite%20listing">{icon("mail")}{CONTACT}</a></div></div>
  <div><h3>Campsites</h3><ul>{camps}</ul></div>
  <div><h3>Plan your trip</h3><ul>{guides}</ul></div>
  <div><h3>Running a campsite?</h3><p>If you run a campsite near Boscombe Down or Fairford, I would love to add it to these pages. It is free.</p>
    <a class="btn or inv" href="{e(h)}#list" target="{t}">List your campsite</a></div>
</div></footer>
<div class="fbar"><div class="wrap"><p>The Big Guide to UK Airshows is independent and not part of the Royal International Air Tattoo. Campsite details come from the owners. Please check prices, dates and rules with the campsite before you book.</p></div></div>"""


def mailto(subject="RIAT campsite listing"):
    return f"mailto:{CONTACT}?subject=" + subject.replace(" ", "%20")


# ---------------------------------------------------------------- home page
HOME_JS = r"""<script>
(function(){
/* finder: one area, any number of needs. Works on the cards and the compare board. */
var area='all',kind='',need=[];
var sel=document.getElementById('fArea'),ksel=document.getElementById('fKind'),needBtns=document.querySelectorAll('.finder [data-n]'),goBtn=document.getElementById('fGo');
var cards=document.querySelectorAll('.cards .cc'),rows=document.querySelectorAll('.board tbody tr'),
    empties=document.querySelectorAll('.cards .none'),nomatch=document.querySelector('.nomatch'),
    shown=document.getElementById('shownText'),clr=document.getElementById('shownClear'),lab=document.getElementById('areaLab');
var AREA={all:'All areas',boscombe:'Near Boscombe Down',fairford:'Around Fairford'},total=cards.length;
function ok(el){
  if(area!=='all'&&el.getAttribute('data-area')!==area)return false;
  var tags=' '+(el.getAttribute('data-tags')||'')+' ',all=need.concat(kind?[kind]:[]);
  for(var i=0;i<all.length;i++){if(tags.indexOf(' '+all[i]+' ')<0)return false}
  return true}
function plural(n){return n+' campsite'+(n===1?'':'s')}
function apply(){
  var n=0,inArea=0;
  cards.forEach(function(c){var a=area==='all'||c.getAttribute('data-area')===area;if(a)inArea++;var v=ok(c);c.style.display=v?'':'none';if(v)n++});
  rows.forEach(function(r){r.style.display=ok(r)?'':'none'});
  empties.forEach(function(x){x.style.display=(area==='all'||x.getAttribute('data-area')===area)?'':'none'});
  if(nomatch)nomatch.style.display=(inArea>0&&n===0)?'block':'none';
  if(!total)return;
  var filtered=area!=='all'||kind!==''||need.length>0;
  if(goBtn)goBtn.firstChild.nodeValue='Show '+plural(n)+' ';
  if(lab)lab.textContent=AREA[area];
  if(shown){var names=[];if(kind)names.push(ksel.options[ksel.selectedIndex].text);
    needBtns.forEach(function(b){if(b.getAttribute('aria-pressed')==='true')names.push(b.getAttribute('data-l'))});
    shown.textContent=filtered?('Showing '+n+' of '+plural(total)+(names.length?', with '+names.join(', ').toLowerCase():'')+'.'):('Showing all '+plural(total)+'.')}
  if(clr)clr.hidden=!filtered}
if(sel)sel.addEventListener('change',function(){area=sel.value;apply()});
if(ksel)ksel.addEventListener('change',function(){kind=ksel.value;apply()});
needBtns.forEach(function(b){b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';
  b.setAttribute('aria-pressed',on?'true':'false');var k=b.getAttribute('data-n');
  need=need.filter(function(x){return x!==k});if(on)need.push(k);apply()})});
function clear(){need=[];area='all';kind='';if(sel)sel.value='all';if(ksel)ksel.value='';needBtns.forEach(function(x){x.setAttribute('aria-pressed','false')});apply()}
if(clr)clr.addEventListener('click',clear);
var c2=document.getElementById('noClear');if(c2)c2.addEventListener('click',clear);
if(goBtn)goBtn.addEventListener('click',function(){var el=document.getElementById('campsites');if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth',block:'start'})});
apply();

/* list your campsite form: writes an email for the owner to send. Nothing is sent from this page. */
var form=document.getElementById('listForm');if(!form)return;
var TO='__CONTACT__',made=document.getElementById('made'),out=document.getElementById('madeText'),
    open=document.getElementById('madeOpen'),copy=document.getElementById('madeCopy'),err=form.querySelector('.err');
function val(n){var el=form.elements[n];return el?(el.value||'').trim():''}
form.addEventListener('submit',function(ev){ev.preventDefault();
  var bad=null;['campsite','owner','email'].forEach(function(n){var el=form.elements[n],b=!el.value.trim()||(n==='email'&&!/^\S+@\S+\.\S+$/.test(el.value.trim()));
    el.classList.toggle('bad',b);el.setAttribute('aria-invalid',b?'true':'false');if(b&&!bad)bad=el});
  if(bad){err.style.display='block';bad.focus();return}
  err.style.display='none';
  var pitches=[].filter.call(form.querySelectorAll('input[name=pitch]'),function(x){return x.checked}).map(function(x){return x.value});
  var lines=['Hello Jack,','','I would like to add my campsite to the RIAT camping pages.','',
    'Campsite name: '+val('campsite'),'My name: '+val('owner'),'Email: '+val('email'),'Phone: '+(val('phone')||'Not given'),
    'Nearest to: '+val('area'),'Type of site: '+val('kind'),'Pitches: '+(pitches.join(', ')||'Not given'),
    'Dates open for show week: '+(val('dates')||'Not decided yet'),'Website or Facebook: '+(val('web')||'Not given'),
    '','Anything else:',val('more')||'Nothing to add yet.','','Thanks,',val('owner')];
  var body=lines.join('\n'),subject='RIAT campsite listing: '+val('campsite');
  out.value='To: '+TO+'\nSubject: '+subject+'\n\n'+body;
  open.href='mailto:'+TO+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  made.style.display='block';made.scrollIntoView({behavior:'smooth',block:'nearest'});
  try{open.click()}catch(x){}});
copy.addEventListener('click',function(){var done=function(){copy.textContent='Copied';setTimeout(function(){copy.textContent='Copy the email'},1800)};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(out.value).then(done,function(){out.select()})}else{out.select()}});
})();
</script>"""

FAC_LABEL = dict(sum((g[1] for g in FAC_GROUPS), []))


def site_card(s):
    href, tgt = page_href(s)
    ph = s["photos"][0] if s.get("photos") else None
    img = f'<img src="{e(ph["src"])}" alt="{e(ph.get("alt"))}" loading="lazy" decoding="async">' if ph else ""
    d = dist_text(s)
    tags = site_tags(s)
    takes = ", ".join(KINDS[k] for k in KINDS if k in tags)
    fp = from_price(s)
    meta = ""
    if d:
        meta += f'<span>{icon("pin")}{e(d)} from {e(AREAS[s["area"]]["label"])}</span>'
    if fp:
        meta += f'<span>{icon("tag")}From {e(fp[1])} {e(fp[2])}</span>'
    return (f'<article class="cc" data-area="{e(s["area"])}" data-tags="{" ".join(sorted(tags))}">{img}{avail_badge(s)}'
            f'<h3><a href="{e(href)}" target="{tgt}">{e(s["name"])}</a></h3>'
            f'<p>{e(s.get("kind"))}{". " + e(takes) + "." if takes else ""}</p>'
            f'<div class="meta">{meta}</div>'
            f'<a class="more" href="{e(href)}" target="{tgt}">View campsite</a></article>')


def empty_card(area_key):
    where = {"boscombe": "near Boscombe Down", "fairford": "around Fairford"}[area_key]
    return (f'<div class="none" data-area="{area_key}">{icon("tent")}<div>'
            f'<h3>No campsites listed {e(where)} yet</h3>'
            f'<p>I am adding campsites as owners get in touch. If you run one, I would love to hear from you.</p></div>'
            f'<a class="btn nv" href="#list">List your campsite</a></div>')


def compare_board(live):
    yes = f'<span class="y">{icon("tick")}<span class="vh">Yes</span></span>'
    no = f'<span class="n">{icon("cross")}<span class="vh">No</span></span>'
    rows = []
    for i, s in enumerate(live):
        href, tgt = page_href(s)
        tags = site_tags(s)
        fp = from_price(s)
        showers = fac_state(s.get("facilities", {}).get("hot-showers"))[0]
        cells = [yes if k in tags else no for k in ("tent", "van", "caravan", "glamping", "hookup")]
        cells += [yes if showers else no] + [yes if k in tags else no for k in ("dogs", "shuttle")]
        price = f'<span class="pr">{e(fp[1])}</span>' if fp else "Ask"
        rows.append(f'<tr data-area="{e(s["area"])}" data-tags="{" ".join(sorted(tags))}"><td class="no">{i + 1:02d}</td>'
                    f'<th scope="row"><a href="{e(href)}" target="{tgt}">{e(s["name"])}</a>'
                    f'<small>{e(AREAS[s["area"]]["long"])}</small></th>'
                    f'<td>{e(dist_text(s)) or "Ask"}</td><td>{price}</td>'
                    + "".join(f"<td>{c}</td>" for c in cells)
                    + f'<td class="sp">{avail_badge(s) or "Ask"}</td></tr>')
    heads = "".join(f'<th scope="col">{h}</th>' for h in (
        "No.", "Campsite", "Distance", "From, per night", "Tents", "Campervans", "Caravans and tourers", "Glamping",
        "Electric hook up", "Hot showers", "Dogs", "Shuttle", "Spaces"))
    return (f'<div class="board-scroll" tabindex="0" role="region" aria-label="Campsite comparison table">'
            f'<table class="board"><thead><tr>{heads}</tr></thead><tbody>{"".join(rows)}</tbody></table></div>')


def build_home(live):
    cards = []
    for key in AREAS:
        group = sorted([s for s in live if s["area"] == key], key=lambda s: dist(s) or 99)
        cards += [site_card(s) for s in group] or [empty_card(key)]
    h_title = "RIAT camping: campsites near Boscombe Down and Fairford | The Big Guide to UK Airshows"
    desc = ("Campsites near MOD Boscombe Down for the Royal International Air Tattoo 2027, and campsites around Fairford. "
            "Pitches, prices, facilities and how to get to the show.")
    n = len(live)
    sample_href = GH + "sample.html"

    nav = [("#campsites", "Campsites")]
    if n >= 2:
        nav.append(("#compare", "Compare"))
    nav += [("#map", "Show map"), ("#new", "New to camping"), ("#owners", "For owners")]

    if n:
        stat = f'<b>{n}</b><span>Campsite{"s" if n != 1 else ""} listed for RIAT 2027</span>'
        chks = "".join(f'<button type="button" class="fchk" data-n="{k}" data-l="{e(lab)}" aria-pressed="false">{e(lab)}</button>'
                       for k, lab in (("hookup", "Electric hook up"), ("dogs", "Dogs welcome"), ("shuttle", "Shuttle to the show")))
        finder = f"""<div class="finder" role="group" aria-label="Find your campsite">
      <div class="ff"><label for="fArea">Where to stay</label>
        <select id="fArea"><option value="all">All areas</option><option value="boscombe">Near MOD Boscombe Down</option><option value="fairford">Around Fairford</option></select></div>
      <div class="ff"><label for="fKind">What you are bringing</label>
        <select id="fKind"><option value="">Anything</option><option value="tent">Tent</option><option value="van">Campervan</option><option value="caravan">Caravan or tourer</option><option value="glamping">Glamping, ready pitched</option></select></div>
      <div class="ff need"><span class="lg">I also need</span><div class="fc-row">{chks}</div></div>
    </div>
    <p class="shown" aria-live="polite"><span id="shownText"></span><button type="button" id="shownClear" hidden>Clear my choices</button></p>"""
    else:
        stat = '<b>2027</b><span>The first Air Tattoo at Boscombe Down</span>'
        finder = ""

    compare = ""
    if n >= 2:
        compare = f"""<section class="sec tint" id="compare" aria-label="Compare the campsites">
  <div class="wrap">
    {sec_head("Side by side", "Compare The Campsites", "Every campsite in one table, so you can see what each one has. Your choices above work here too.")}
    <p class="swipe" style="margin:-24px 0 16px">Swipe sideways to see it all.</p>
    {compare_board(live)}
  </div>
</section>"""

    body = f"""{head(h_title, desc, "", SITE + HOME_WIX if HOME_WIX else "")}
{top_bar()}
{header(IMG + "hero-flyby.jpg", nav, "RIAT Camping", [("RIAT", SITE + RIAT_WIX, "_top"), ("Camping", "", "")], button=("#list", "List your campsite"))}
{site_strip(live, "home")}
<main>
<section class="sec" id="about" aria-label="Camping for the Air Tattoo">
  <div class="wrap about">
    <div class="ab-ph"><img src="{IMG}pitch-spot.jpg" alt="A pitch on flat grass with a tent, flag pole, solar panel and camera tripods inside striped windbreaks" decoding="async">
      <div class="statbox">{icon("tent")}{stat}</div></div>
    <div>
      <span class="kick">RIAT 2027</span>
      <h2 class="h">Camping For The Air Tattoo Near Boscombe Down</h2>
      <p class="lede">From 2027 the Air Tattoo moves to MOD Boscombe Down, and a lot of visitors will be looking for somewhere to pitch up nearby. I list the campsites around the new showground here, plus the ones still running around Fairford.</p>
      <div class="feat">
        <div><h3><i>{icon("chev")}</i>Pitches and prices</h3><p>Pitch sizes and what a night costs, for tents, campervans, tourers and glamping.</p></div>
        <div><h3><i>{icon("chev")}</i>Facilities</h3><p>Showers, hook ups, food and the site rules, so there are no surprises.</p></div>
        <div><h3><i>{icon("chev")}</i>Getting to the show</h3><p>How far each site is from the airfield, and the best way in.</p></div>
        <div><h3><i>{icon("chev")}</i>Spaces</h3><p>See which sites have space, which are filling up and which are full.</p></div>
      </div>
      <div class="btns"><a class="btn or" href="#campsites">See the campsites</a><a class="btn nv" href="#list">List your campsite</a></div>
    </div>
  </div>
</section>

<section class="sec tint" id="campsites" aria-label="Campsites">
  <div class="wrap">
    {sec_head("Where to stay", "Campsites For RIAT 2027", "Every campsite has its own page. Distances are as the crow flies from the airfield.")}
    {finder}
    <div class="cards">{"".join(cards)}<p class="nomatch"><b>No campsites match all of those yet.</b> Try taking one off.<button type="button" id="noClear">Clear my choices</button></p></div>
  </div>
</section>
{compare}
<section class="mapband" id="map" aria-label="Show map">
  <div class="wrap">
    {sec_head("On the show map", "How Far From The Airfield", "Each tent is a campsite. Tap one to open its page. The rings are 5 and 10 miles from the airfield, as the crow flies.", mid=True)}
    <div class="maps">
      <div class="mapbox"><h3>Near Boscombe Down</h3><p>RIAT from 2027, just south east of Amesbury.</p>{ring_map("boscombe", live)}</div>
      <div class="mapbox"><h3>Around Fairford</h3><p>RIAT until 2026, on the edge of the Cotswolds.</p>{ring_map("fairford", live)}</div>
    </div>
  </div>
</section>

<section class="sec" id="new" aria-label="New to camping">
  <div class="wrap offer">
    <div>
      <span class="kick">Plan your trip</span>
      <h2 class="h">New To Camping At An Airshow?</h2>
      <p class="lede">My first airshow camping trip was RIAT in 2014, and I got plenty wrong. My camping guides are everything I wish someone had told me, from where to pitch to what to pack.</p>
      <div class="minis">
        <div class="mini">{icon("tent")}<h3>Camping guides</h3><p>Where to camp, pitching up and staying comfortable.</p><a class="more" href="{SITE}{CAMPING_HUB_WIX}" target="_top">Read the guides</a></div>
        <div class="mini">{icon("list")}<h3>Kit calculator</h3><p>Tick your tent, beds and cooking kit and see the cost.</p><a class="more" href="{SITE}/build-your-kit-calculator?list=camping" target="_top">Open the calculator</a></div>
      </div>
    </div>
    <div class="pc">
      <div class="pc-card"><span class="flag">Official</span><h3>The RIAT campsite</h3>
        <p class="big">2027<small>at Boscombe Down</small></p>
        {chev_list(["Beside the airfield", "Run by RIAT, not by local owners", "Rollover bookings get first pick", "Then the waitlist, then general sale", "Details on the Air Tattoo website"])}
        <a class="btn or inv" href="{OFFICIAL_CAMPING}" target="_blank" rel="noopener">Official camping</a>
        <p class="fine">The campsites on this page are run independently.</p>
      </div>
      <img src="{IMG}field-sunny.jpg" alt="Pitches along the edge of a sunny camping field" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="band" id="owners" aria-label="For campsite owners" style="background-image:url('{IMG}tents-night.jpg')">
  <div class="wrap">
    <span class="kick">Campsite owners</span>
    <h2 class="h">Running A Campsite Near Boscombe Down?</h2>
    <p class="lede">If you are opening a campsite for the show, or you already run one in the area, I would love to hear from you. Still running a campsite around Fairford? I want to work with you too. This is what you get, free of charge.</p>
    <div class="steps">
      <div class="step"><span class="no">01</span>{icon("tent")}<h3>A listing on the guide</h3><p>Your own page on the RIAT camping pages.</p></div>
      <div class="step"><span class="no">02</span>{icon("sign")}<h3>On the show map</h3><p>Distance to the show and how to get in.</p></div>
      <div class="step"><span class="no">03</span>{icon("fire")}<h3>Seen by people planning</h3><p>Families, photographers and first timers.</p></div>
      <div class="step"><span class="no">04</span>{icon("share")}<h3>Shared on our socials</h3><p>Over 12,000 airshow followers.</p></div>
    </div>
  </div>
</section>

<section id="list" aria-label="List your campsite">
  <div class="formrow">
    <img src="{IMG}pitch-windbreaks.jpg" alt="A pitch circled by striped windbreaks with a flag" loading="lazy" decoding="async">
    <div class="fpanel">
      <h2>Tell Me About Your Campsite</h2>
      <p>This writes an email to me with your answers filled in. Nothing is sent until you press send in your own email.</p>
      <form id="listForm" novalidate>
        <div class="fld"><label for="lf-campsite">Campsite name <i>*</i></label><input type="text" id="lf-campsite" name="campsite" autocomplete="organization" required></div>
        <div class="fld"><label for="lf-owner">Your name <i>*</i></label><input type="text" id="lf-owner" name="owner" autocomplete="name" required></div>
        <div class="fld"><label for="lf-email">Your email <i>*</i></label><input type="email" id="lf-email" name="email" autocomplete="email" required></div>
        <div class="fld"><label for="lf-phone">Phone</label><input type="tel" id="lf-phone" name="phone" autocomplete="tel"></div>
        <div class="fld"><label for="lf-area">Nearest to</label><select id="lf-area" name="area"><option>MOD Boscombe Down</option><option>Fairford</option></select></div>
        <div class="fld"><label for="lf-kind">Type of site</label><select id="lf-kind" name="kind"><option>New site for show week</option><option>Caravan park</option><option>Farm site</option><option>Glamping</option><option>Campervans and tourers</option><option>Something else</option></select></div>
        <fieldset class="fld wide"><legend>Pitches you offer</legend><div class="ticks">
          <label><input type="checkbox" name="pitch" value="Tents">Tents</label>
          <label><input type="checkbox" name="pitch" value="Campervans">Campervans</label>
          <label><input type="checkbox" name="pitch" value="Caravans and tourers">Caravans and tourers</label>
          <label><input type="checkbox" name="pitch" value="Electric hook up">Electric hook up</label>
          <label><input type="checkbox" name="pitch" value="Hardstanding">Hardstanding</label>
          <label><input type="checkbox" name="pitch" value="Glamping">Glamping</label>
        </div></fieldset>
        <div class="fld"><label for="lf-dates">Dates open for show week</label><input type="text" id="lf-dates" name="dates" placeholder="14 to 19 July 2027"></div>
        <div class="fld"><label for="lf-web">Website or Facebook page</label><input type="text" id="lf-web" name="web" autocomplete="url"></div>
        <div class="fld wide"><label for="lf-more">Anything else you would like to tell me</label><textarea id="lf-more" name="more"></textarea></div>
        <p class="err" role="alert">Please add your campsite name, your name and an email address I can reply to.</p>
        <div class="go"><button class="btn or inv" type="submit">Write my email</button>
        <small>Prefer to email? I am at <a href="{mailto()}">{CONTACT}</a>. You can also <a href="{sample_href}" target="_blank" rel="noopener">see a sample campsite page</a> first.</small></div>
      </form>
      <div class="made" id="made" aria-live="polite">
        <b>Your email is ready</b>
        <p>Your email app should open with this filled in. If it doesn't, copy it and send it to {CONTACT}.</p>
        <textarea id="madeText" readonly aria-label="Your email, ready to copy"></textarea>
        <div class="btns"><a class="btn or inv" id="madeOpen" href="{mailto()}">Open in my email</a><button class="btn wh" type="button" id="madeCopy">Copy the email</button></div>
      </div>
    </div>
    <img src="{IMG}group-basecamp.jpg" alt="A big group base camp with windbreaks all the way along" loading="lazy" decoding="async">
  </div>
</section>
</main>
{footer(live)}
{HOME_JS.replace("__CONTACT__", CONTACT)}
{MOTION_JS}
</body>
</html>
"""
    (OUT / "index.html").write_text(body, encoding="utf-8")


# ---------------------------------------------------------------- campsite page
SITE_CSS = r"""
.prices{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:28px}
.price{position:relative;background:var(--navy);color:#fff;padding:38px 32px 30px}
.price .flag{position:absolute;top:0;right:0;background:var(--purple);color:#fff;font:700 16px/1 "Barlow",sans-serif;padding:7px 12px}
.price h3{color:#fff;font-size:21px;font-weight:600;margin-top:18px}
.price .big{font:700 42px/1 "Barlow",sans-serif;margin-top:14px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.2)}
.price .big small{font-size:15px;font-weight:400;color:var(--or-l);margin-left:5px}
.price .chev{margin-bottom:0}
.dates{margin-top:34px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border:1px solid var(--line);background:#fff}
.dates div{padding:20px 20px 16px;border-left:1px solid var(--line)}
.dates div:first-child{border-left:0}
.dates dt{font:700 17px/1.2 "Barlow",sans-serif;color:var(--purple)}
.dates dd{font-weight:600;font-size:18px;line-height:1.3;color:var(--ink);margin-top:8px}

.facs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:36px}
.fg h3{font-size:20px;font-weight:600;padding-bottom:12px;border-bottom:2px solid var(--ink);margin-bottom:6px}
.fg ul{list-style:none}
.fg li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:10px;padding:9px 0;color:var(--ink);align-items:start}
.fg li>svg{width:14px;height:14px;margin-top:6px;color:var(--teal-ink);stroke-width:3}
.fg li.n{color:#93A0AA}
.fg li.n>svg{color:#B4BEC6}
.fg li b{display:block;font-weight:500}
.fg li small{display:block;color:var(--body);font-size:14.5px;line-height:1.4}
.rules-h{font-size:26px;margin-top:60px}
.rules{margin-top:22px;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px}
.rules div{background:var(--soft);border-top:5px solid var(--teal);padding:24px 24px 22px;transition:transform .35s cubic-bezier(.22,.61,.36,1),box-shadow .35s,background .35s,opacity .75s cubic-bezier(.22,.61,.36,1)}
.rules div:hover{transform:translateY(-6px);background:#fff;box-shadow:0 22px 34px -22px rgba(10,27,39,.5)}
.rules dt{display:flex;align-items:center;gap:12px;font-weight:700;font-size:20px;line-height:1.2;color:var(--ink)}
.rules dt i{flex:none;width:22px;height:22px;border-radius:50%;background:var(--teal);color:var(--navy);display:grid;place-items:center;transition:transform .3s}
.rules dt i svg{width:12px;height:12px;stroke-width:3}
.rules div:hover dt i{transform:scale(1.15)}
.rules dd{margin-top:10px}

.where{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:center}
.where .mapcard{background:var(--navy);padding:26px}
.where .bigd{font:700 clamp(44px,6vw,64px)/1 "Barlow",sans-serif;color:var(--ink);margin-top:14px}
.where .bigd small{display:block;font-size:17px;font-weight:400;color:var(--body);margin-top:10px;line-height:1.4}
.where address{font-style:normal;margin:20px 0 26px;color:var(--ink);font-size:17px}

.bookpanel{background:var(--navy);color:#fff;padding:54px clamp(22px,4vw,56px) 56px;display:flex;flex-direction:column;justify-content:center}
.bookpanel h2{color:#fff;font-size:30px;font-weight:600}
.bookpanel>p{margin-top:8px;color:#D5DEE4}
.bookpanel .acts{display:grid;gap:12px;margin-top:24px}
.bookpanel .offerline{margin-top:24px;border-left:4px solid var(--teal);padding-left:16px}
.bookpanel .offerline b{display:block;color:var(--or-l);font:700 19px/1.2 "Barlow",sans-serif;margin-bottom:4px}
.terms{margin-top:24px;border-top:1px solid rgba(255,255,255,.2)}
.terms div{display:grid;grid-template-columns:120px minmax(0,1fr);gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.2)}
.terms dt{color:#B8C6CF}
.terms dd{font-weight:500}

.gal{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
.gal figure{position:relative;overflow:hidden;background:var(--navy)}
.gal img{width:100%;aspect-ratio:4/3;object-fit:cover}
.gal figcaption{position:absolute;left:0;right:0;bottom:0;padding:44px 20px 16px;color:#fff;font-weight:500;background:linear-gradient(180deg,rgba(10,27,39,0),rgba(10,27,39,.9))}

@media (max-width:1000px){
  .facs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .dates{grid-template-columns:repeat(3,minmax(0,1fr))}
  .dates div:nth-child(4){border-left:0}
  .dates div:nth-child(n+4){border-top:1px solid var(--line)}
  .where{grid-template-columns:1fr}
  .gal{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:720px){
  .facs,.rules,.gal{grid-template-columns:1fr}
  .dates{grid-template-columns:1fr 1fr}
  .dates div{border-left:0;border-top:1px solid var(--line)}
  .dates div:nth-child(-n+2){border-top:0}
  .dates div:nth-child(even){border-left:1px solid var(--line)}
}
"""


def build_site(s, live):
    a = AREAS[s["area"]]
    photos = s.get("photos") or []
    d = dist_text(s)
    fp = from_price(s)
    ts = s.get("toShow", {})
    dates = s.get("dates", {})
    bk = s.get("booking", {})
    av = avail(s)
    tags = site_tags(s)
    h, t = home_href()

    def ph(i, fallback):
        p = photos[i] if len(photos) > i else None
        return (p["src"], p.get("alt", "")) if p else (IMG + fallback[0], fallback[1])

    # about
    about = "".join(f'<p class="lede">{e(p)}</p>' for p in s.get("about", []) if p)
    ow = s.get("owner", {})
    owner = (f'<blockquote class="quote">{e(ow["quote"])}<cite>{e(ow.get("name"))}{", " + e(ow.get("role")) if ow.get("role") else ""}</cite></blockquote>'
             if ow.get("quote") else "")
    open_txt = " to ".join(x for x in (dates.get("open"), dates.get("close")) if x)
    feats = []
    if open_txt:
        feats.append(("Open", open_txt))
    if ts.get("driveMins"):
        feats.append(("Drive to the show", ts["driveMins"]))
    if tags & set(KINDS):
        feats.append(("Takes", ", ".join(KINDS[k] for k in KINDS if k in tags)))
    if av:
        feats.append(("Spaces", av[0]))
    elif fp:
        feats.append(("Pitches", f"From {fp[1]} {fp[2]}"))
    feat_html = "".join(f'<div><h3><i>{icon("chev")}</i>{e(k)}</h3><p>{e(v)}</p></div>' for k, v in feats[:4])
    p0 = ph(0, ("field-sunny.jpg", "Pitches along the edge of a sunny camping field"))
    if d:
        num, unit = d.split(" ", 1)
        stat = f'<b>{e(num)}</b><span>{e(unit)} from {e(a["label"])}</span>'
    else:
        stat = f'<b>2027</b><span>{e(a["long"])}</span>'

    # pitches
    price_html = []
    for p in s.get("pitches", []):
        k = p.get("kind") if p.get("kind") in KINDS else "tent"
        price = f'<p class="big">{e(p.get("price"))}<small>{e(p.get("per"))}</small></p>' if p.get("price") else ""
        price_html.append(f'<article class="price"><span class="flag">{e(KINDS[k])}</span><h3>{e(p.get("name"))}</h3>{price}'
                          f'{chev_list([p.get("size"), p.get("includes"), p.get("note")])}</article>')
    date_rows = [("Opens", dates.get("open")), ("Closes", dates.get("close")), ("Minimum stay", dates.get("minNights")),
                 ("Arrive", dates.get("arrive")), ("Leave", dates.get("leave"))]
    dates_html = "".join(f"<div><dt>{k}</dt><dd>{e(v)}</dd></div>" for k, v in date_rows if v)
    dates_html = f'<dl class="dates">{dates_html}</dl>' if dates_html else ""

    # facilities and rules
    fac = s.get("facilities", {})
    groups = []
    for title, items in FAC_GROUPS:
        lis = []
        for key, label in items:
            ok, note = fac_state(fac.get(key))
            if ok is None:
                continue
            nt = f"<small>{e(note)}</small>" if note else ("<small>Not available</small>" if not ok else "")
            lis.append(f'<li class="{"y" if ok else "n"}">{icon("chev" if ok else "cross")}<span><b>{e(label)}</b>{nt}</span></li>')
        if lis:
            groups.append(f'<div class="fg"><h3>{e(title)}</h3><ul>{"".join(lis)}</ul></div>')
    gtk = "".join(f'<div><dt><i>{icon("chev")}</i>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in s.get("goodToKnow", []) if v)
    rules = f'<h3 class="rules-h">Good to know</h3><dl class="rules">{gtk}</dl>' if gtk else ""

    # getting to the show: numbered cards on a photo band
    way_defs = [("driveMins", "car", "Driving"), ("shuttle", "bus", "Shuttle"), ("walk", "walk", "Walking"),
                ("taxi", "taxi", "Taxi"), ("parking", "park", "Your car")]
    ways = [(ic, lab, ts[key]) for key, ic, lab in way_defs if ts.get(key)]
    steps = "".join(f'<div class="step"><span class="no">{i + 1:02d}</span>{icon(ic)}<h3>{lab}</h3><p>{e(txt)}</p></div>'
                    for i, (ic, lab, txt) in enumerate(ways))
    p1 = ph(1, ("car-pitches.jpg", ""))
    band = (f'<div class="steps" style="--n:{min(len(ways), 5)}">{steps}</div>' if ways
            else '<p class="lede">Travel details coming soon.</p>')
    lk = []
    if has_pos(s):
        lk.append(f'<a class="btn or" href="https://www.google.com/maps/dir/?api=1&amp;destination={s["lat"]},{s["lng"]}" target="_blank" rel="noopener">Get directions</a>')
    if s.get("what3words"):
        w3 = e(s["what3words"].lstrip("/"))
        lk.append(f'<a class="btn nv" href="https://what3words.com/{w3}" target="_blank" rel="noopener">///{w3}</a>')
    addr = ", ".join(x for x in (s.get("address"), s.get("postcode")) if x)
    bigd = f'<p class="bigd">{e(d)}<small>from {e(a["label"])}, as the crow flies</small></p>' if d else ""

    # booking
    acts = []
    if bk.get("url"):
        acts.append(f'<a class="btn or inv" href="{e(bk["url"])}" target="_blank" rel="noopener">Book on the campsite website</a>')
    if bk.get("phone"):
        tel = "".join(ch for ch in bk["phone"] if ch.isdigit() or ch == "+")
        acts.append(f'<a class="btn wh" href="tel:{e(tel)}">Call {e(bk["phone"])}</a>')
    if bk.get("email"):
        acts.append(f'<a class="btn wh" href="mailto:{e(bk["email"])}?subject=RIAT%20camping%20booking">Email {e(bk["email"])}</a>')
    if s.get("website") and s.get("website") != bk.get("url"):
        acts.append(f'<a class="btn wh" href="{e(s["website"])}" target="_blank" rel="noopener">Campsite website</a>')
    for net in ("facebook", "instagram"):
        if s.get("socials", {}).get(net):
            acts.append(f'<a class="btn wh" href="{e(s["socials"][net])}" target="_blank" rel="noopener">{net.title()}</a>')
    acts_html = f'<div class="acts">{"".join(acts)}</div>' if acts else '<p>Booking details coming soon.</p>'
    full = '<p><b>Fully booked for show week.</b> It is still worth asking the campsite about cancellations.</p>' if av and av[1] == "av-full" else ""
    offer = f'<p class="offerline"><b>Guide reader offer</b>{e(bk["offer"])}</p>' if bk.get("offer") else ""
    terms = "".join(f"<div><dt>{k}</dt><dd>{e(bk.get(key))}</dd></div>"
                    for k, key in (("Booking", "opens"), ("Payment", "deposit"), ("Cancellation", "cancellation")) if bk.get(key))
    terms = f'<dl class="terms">{terms}</dl>' if terms else ""
    p2 = ph(2, ("bell-tents.jpg", "A row of white bell tents along a campsite track"))
    p3 = ph(3, ("lit-pitches.jpg", "Pitches lit up with coloured light poles at dusk"))

    # photos
    gal = "".join(f'<figure><img src="{e(p["src"])}" alt="{e(p.get("alt"))}" loading="lazy" decoding="async">'
                  f'{"<figcaption>" + e(p["caption"]) + "</figcaption>" if p.get("caption") else ""}</figure>'
                  for p in photos[:6])
    gallery = (f'<section class="sec" id="photos" aria-label="Photos"><div class="wrap">{sec_head("Photos", "Around The Site")}'
               f'<div class="gal">{gal}</div></div></section>') if len(photos) > 1 else ""

    others = [o for o in live if o["slug"] != s["slug"]]
    more = ""
    if others:
        cards = "".join(site_card(o) for o in sorted(others, key=lambda o: (o["area"] != s["area"], dist(o) or 99))[:3])
        more = (f'<section class="sec tint" aria-label="More campsites"><div class="wrap">{sec_head("Keep looking", "More Campsites")}'
                f'<div class="cards">{cards}</div></div></section>')

    title = f'{s["name"]}: camping for RIAT 2027 | The Big Guide to UK Airshows'
    if s["area"] == "fairford":
        title = f'{s["name"]}: camping around Fairford | The Big Guide to UK Airshows'
    desc = s.get("tagline") or f'{s["name"]}, a campsite {d} from {a["label"]}.'
    sample_bar = ('<div class="sample-bar">Sample page. This is not a real campsite: it shows owners what their listing will look like.</div>'
                  if s.get("sample") else "")
    checked = f'Last checked {e(s.get("checked"))}. ' if s.get("checked") else ""
    nav = [("#about", "About"), ("#pitches", "Pitches and prices"), ("#facilities", "Facilities"), ("#getting-there", "Getting to the show")]
    tagrow = f'<div class="tags"><span class="tagp">{e(a["long"])}</span>{avail_badge(s)}</div>'
    last_tint = " tint" if others else ""

    body = f"""{head(title, desc, SITE_CSS, SITE + s["wixPath"] if s.get("wixPath") else "")}
{sample_bar}
{top_bar()}
{header(p0[0] if photos else IMG + "hero-flyby.jpg", nav, s["name"], [("RIAT", SITE + RIAT_WIX, "_top"), ("Camping", h, t), (s["name"], "", "")], tags=tagrow, button=("#book", "Book"))}
{site_strip(live if s in live else live + [s], s["slug"])}
<main>
<section class="sec" id="about" aria-label="About the site">
  <div class="wrap about">
    <div class="ab-ph"><img src="{e(p0[0])}" alt="{e(p0[1])}" decoding="async"><div class="statbox">{icon("pin")}{stat}</div></div>
    <div>
      <span class="kick">{e(s.get("kind"))}</span>
      <h2 class="h">About {e(s["name"])}</h2>
      {"<p class=lede style=color:var(--ink);font-weight:500>" + e(s["tagline"]) + "</p>" if s.get("tagline") else ""}
      {about}
      <div class="feat">{feat_html}</div>
      <div class="btns"><a class="btn or" href="#book">How to book</a><a class="btn nv" href="#getting-there">Getting to the show</a></div>
      {owner}
    </div>
  </div>
</section>

<section class="sec tint" id="pitches" aria-label="Pitches and prices">
  <div class="wrap">
    {sec_head("Show week 2027", "Pitches And Prices", "Prices are as given by the campsite. I would check the latest when you book.")}
    <div class="prices">{"".join(price_html) or "<p>Pitch details coming soon.</p>"}</div>
    {dates_html}
  </div>
</section>

<section class="sec" id="facilities" aria-label="Facilities">
  <div class="wrap">
    {sec_head("On site in show week", "Facilities And Good To Know")}
    <div class="facs">{"".join(groups) or "<p>Facility details coming soon.</p>"}</div>
    {rules}
  </div>
</section>

<section class="band" id="getting-there" aria-label="Getting to the show" style="background-image:url('{e(p1[0])}')">
  <div class="wrap">
    <span class="kick">From your pitch to the gate</span>
    <h2 class="h">Getting To The Show</h2>
    <p class="lede">How to get from your pitch to the showground at {e(a["label"])}. RIAT's own travel plan for 2027 is still to be announced, so I would check back nearer the show.</p>
    {band}
  </div>
</section>

<section class="sec" id="where" aria-label="Where it is">
  <div class="wrap where">
    <div class="mapcard">{ring_map(s["area"], [s], s["slug"])}</div>
    <div><span class="kick">Where it is</span>{bigd}<address>{e(addr)}</address><div class="btns">{"".join(lk)}</div></div>
  </div>
</section>

<section id="book" aria-label="Book">
  <div class="formrow">
    <img src="{e(p2[0])}" alt="{e(p2[1])}" loading="lazy" decoding="async">
    <div class="bookpanel">
      <h2>Book With {e(s["name"])}</h2>
      <p>You book direct with the campsite. The guide does not take bookings or payments.</p>
      {full}{acts_html}{offer}{terms}
    </div>
    <img src="{e(p3[0])}" alt="{e(p3[1])}" loading="lazy" decoding="async">
  </div>
</section>
{gallery}
{more}
</main>
{footer(live, last_tint)}
<div class="fbar" style="padding-top:0"><div class="wrap"><p>{checked}Details on this page come from {e(s["name"])}.</p></div></div>
{MOTION_JS}
</body>
</html>
"""
    (OUT / f'{s["slug"]}.html').write_text(body, encoding="utf-8")


def load_sites(extra=None):
    sites = []
    for p in sorted(SRC.glob("*.json")) + (sorted(extra.glob("*.json")) if extra else []):
        s = json.loads(p.read_text(encoding="utf-8"))
        if not s.get("slug"):
            print(f"skip {p.name}: no slug")
            continue
        if s.get("area") not in AREAS:
            raise SystemExit(f"{p.name}: area must be one of {', '.join(AREAS)}")
        sites.append(s)
    return sites


def main():
    global OUT, GH
    import sys
    preview = "--preview" in sys.argv
    if preview:
        # Preview: treat every site (sample and drafts too) as live and write to a separate folder.
        OUT = pathlib.Path(sys.argv[sys.argv.index("--preview") + 1]).resolve()
        GH = OUT.as_uri() + "/"
    OUT.mkdir(parents=True, exist_ok=True)
    # preview-sites/ holds extra made-up campsites, only ever used by --preview
    sites = load_sites(SRC.parent / "preview-sites" if preview else None)
    live = [s for s in sites if preview or (s.get("live") and not s.get("sample"))]
    live.sort(key=lambda s: (list(AREAS).index(s["area"]), dist(s) or 99))
    build_home(live)
    print(f"index.html ({len(live)} live campsite{'s' if len(live) != 1 else ''})")
    for s in sites:
        build_site(s, live)
        state = "sample" if s.get("sample") else ("live" if s.get("live") else "draft, not in the tabs yet")
        print(f'{s["slug"]}.html ({state})')


if __name__ == "__main__":
    main()
