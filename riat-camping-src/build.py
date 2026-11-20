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
# Look: borrowed from the Public transport page (numbered colour tabs, black ticker, sign headers,
# board tables, coloured mode rows) and the Duxford page (coloured tiles with round icon badges).
KIND_COL = {"tent": "k-tent", "van": "k-van", "caravan": "k-caravan", "glamping": "k-glamping"}


def camp_scene(mode="colour"):
    """A flat campsite skyline: pines, tents, windbreaks, a campervan and a caravan. Ground is the bottom edge.
    mode "light" draws it in one colour (the tab strip colour) for the bottom of the photo header."""
    one = "#DDD8CC" if mode == "light" else None
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
:root{--navy:#13293C;--navy2:#1C3850;--deep:#0B1A27;--black:#0B0D0F;--teal:#32B4AF;--teal-ink:#0E5F5B;--purple:#6950A1;
--red:#D74949;--sky:#00A6E2;--sky-ink:#006F99;--green:#2BA84A;--green-d:#1E8540;--amber:#F2B233;--orange:#E07A1F;--pink:#C2255C;
--mist:#F3F6F8;--line:#DCE4EA;--ink:#14212C;--soft:#4A5C6B;--canvas:#F4F1EA;--canvas-d:#DDD8CC;--wood:#8C6B3F}
*{box-sizing:border-box;margin:0;padding:0}
html,body{scrollbar-width:none;-ms-overflow-style:none}
html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;width:0;height:0}
body{font:400 17px/1.55 "Barlow",system-ui,sans-serif;color:var(--ink);background:var(--canvas) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Cg fill='none' stroke='%2313293C' stroke-opacity='.055' stroke-width='1.6'%3E%3Cpath d='M0 60C110 20 210 110 320 60S530 10 640 60'/%3E%3Cpath d='M0 96C120 60 200 150 320 100S520 52 640 96'/%3E%3Cpath d='M0 236C90 190 230 280 320 236S550 192 640 236'/%3E%3Cpath d='M0 276C100 236 220 326 320 280S540 236 640 276'/%3E%3Cpath d='M0 390C130 350 190 430 320 390S510 350 640 390'/%3E%3Cpath d='M150 168c40-26 96-22 120 6s4 60-40 66-86-8-98-30 0-30 18-42z'/%3E%3Cpath d='M176 184c24-14 54-12 68 4s2 32-22 36-46-4-54-16 0-18 8-24z'/%3E%3Cpath d='M452 322c30-20 80-14 96 10s-6 46-44 48-66-10-72-28 6-22 20-30z'/%3E%3C/g%3E%3C/svg%3E");-webkit-font-smoothing:antialiased}
a{color:inherit}
img{display:block;max-width:100%;pointer-events:none;user-select:none}
[hidden]{display:none!important}
.wrap{max-width:1212px;margin:0 auto;padding:0 24px}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.cond{font-family:"Barlow Condensed","Barlow",sans-serif}
a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--amber);outline-offset:2px}

/* brand bar and the campsite strip: one tab per campsite page */
.bar{background:var(--navy);color:#fff}
.bar .wrap{display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:52px}
.brand{text-decoration:none;display:flex;align-items:baseline;gap:10px;white-space:nowrap}
.brand b{font:800 22px/1 "Barlow Condensed",sans-serif;letter-spacing:.01em}
.brand span{font-size:15px;color:#C9D6E0}
.bar .back{font:600 15px/1 "Barlow",sans-serif;color:#fff;text-decoration:none;border-bottom:2px solid var(--teal);padding-bottom:2px;white-space:nowrap}
.bar .back:hover{border-color:#fff}
.strip{background:var(--navy2);position:relative}
.strip .wrap{display:flex;align-items:stretch;overflow-x:auto;scrollbar-width:none}
.strip .wrap::-webkit-scrollbar{display:none}
.strip .lab{flex:none;align-self:center;font:600 14px/1 "Barlow",sans-serif;color:#9FB6C8;margin-right:12px}
.st{position:relative;flex:none;display:flex;align-items:center;gap:8px;padding:13px 16px;color:#E3EAF0;text-decoration:none;font:600 15px/1.2 "Barlow",sans-serif;white-space:nowrap;border-left:1px solid rgba(255,255,255,.09)}
.st:hover{background:rgba(255,255,255,.08);color:#fff}
.st.on{background:#fff;color:var(--navy)}
.st svg{width:17px;height:17px}
.st small{font:500 13px/1 "Barlow",sans-serif;opacity:.75}
.st .dot{width:10px;height:10px;border-radius:50%;flex:none}
.dot.av-ok{background:#4FD39A}.dot.av-mid{background:var(--amber)}.dot.av-full{background:#E87070}
.st.on .dot.av-ok{background:var(--green-d)}.st.on .dot.av-full{background:var(--red)}
.st.add{background:var(--purple);color:#fff;border-left:0;margin-left:auto}
.st.add:hover{background:#7A62B5}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font:700 16px/1 "Barlow",sans-serif;padding:15px 20px;text-decoration:none;border:2px solid transparent;cursor:pointer;background:none}
.btn svg{width:18px;height:18px;flex:none}
.btn.purple{background:var(--purple);color:#fff}.btn.purple:hover{background:#584190}
.btn.navy{background:var(--navy);color:#fff}.btn.navy:hover{background:var(--deep)}
.btn.red{background:var(--red);color:#fff}.btn.red:hover{background:#BD3A3A}
.btn.teal{background:var(--teal);color:var(--navy)}.btn.teal:hover{background:#4CC6C1}
.btn.sky{background:var(--sky);color:var(--navy)}.btn.sky:hover{background:#33B8EA}
.btn.line{border-color:var(--navy);color:var(--navy);background:#fff}.btn.line:hover{background:var(--navy);color:#fff}
.btn.ghost{border-color:#fff;color:#fff}.btn.ghost:hover{background:#fff;color:var(--navy)}

/* numbered section tabs with a coloured top edge, then the black ticker */
.stabs{position:sticky;top:0;z-index:30;background:var(--canvas-d);box-shadow:0 10px 22px -14px rgba(11,26,39,.45)}
.stabs .row{display:flex;gap:0;padding-top:10px}
.stab{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:12px;text-align:left;background:#fff;color:var(--navy);border:0;border-top:5px solid var(--c,var(--sky));border-right:1px solid var(--line);padding:11px 14px 12px;cursor:pointer;font:inherit}
.stab:last-child{border-right:0}
.stab .n{flex:none;width:30px;height:30px;display:grid;place-items:center;background:var(--navy);color:#fff;font:700 16px/1 "Barlow",sans-serif}
.stab b{display:block;font:700 17px/1.15 "Barlow",sans-serif}
.stab span span{display:block;font-size:14px;line-height:1.2;color:var(--soft);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stab>span:last-child{min-width:0}
.stab:hover{background:#F3F6F8}
.stab.on{background:var(--navy);color:#fff}
.stab.on .n{background:var(--c,var(--sky));color:var(--navy)}
.stab.on span span{color:#C9D6E0}
.c-sky{--c:var(--sky)}.c-red{--c:var(--red)}.c-green{--c:var(--green)}.c-purple{--c:var(--purple)}.c-amber{--c:var(--amber)}.c-teal{--c:var(--teal)}
.stab.c-red.on .n,.stab.c-purple.on .n{color:#fff}
.ticker{background:var(--black);color:var(--amber);font:600 15px/1.35 "Barlow",sans-serif}
.ticker .wrap{display:flex;gap:14px;align-items:center;min-height:36px;padding-top:6px;padding-bottom:6px}
.ticker b{color:#fff;flex:none}
.ticker button{margin-left:auto;flex:none;font:600 14px/1 "Barlow",sans-serif;color:#fff;background:none;border:1px solid rgba(255,255,255,.5);padding:6px 10px;cursor:pointer}
.ticker button:hover{background:#fff;color:var(--black)}

/* panels and sign headers */
.panel{padding:30px 0 56px}
.sheet{background:#fff;border-top:8px solid var(--navy);box-shadow:0 1px 2px rgba(19,41,60,.05),0 10px 28px -14px rgba(19,41,60,.16)}
.sheet+.sheet{margin-top:28px}
.sign-h{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:6px 18px;padding:14px 24px 14px 14px;background:var(--c,var(--purple));color:#fff}
.sign-h i{width:54px;height:54px;background:#fff;color:var(--navy);display:grid;place-items:center}
.sign-h i svg{width:28px;height:28px}
.sign-h h2{font:800 clamp(27px,3.6vw,38px)/1.05 "Barlow",sans-serif;letter-spacing:-.005em}
.sign-h span{font:400 clamp(18px,2.2vw,26px)/1.1 "Barlow",sans-serif;opacity:.9}
.sign-h.c-sky,.sign-h.c-amber,.sign-h.c-teal{color:var(--navy)}
.sign-h.c-green{background:var(--green-d)}
.sheet-in{padding:24px}
.intro{max-width:74ch;margin-bottom:20px}

/* camping skyline: sits on the bottom edge of the photo header and above the guide links */
.scene{position:absolute;left:0;right:0;bottom:-1px;height:74px;overflow:hidden;pointer-events:none}
.scene svg,.camp svg{position:absolute;bottom:0;left:50%;height:100%;width:auto;min-width:100%;transform:translateX(-50%)}
.camp{position:relative;height:104px;overflow:hidden;pointer-events:none}
@media (max-width:720px){.scene{height:52px}.camp{height:78px}}

/* availability */
.av{display:inline-flex;align-items:center;gap:8px;font:700 15px/1 "Barlow",sans-serif;padding:8px 11px}
.av::before{content:"";width:10px;height:10px;border-radius:50%;background:currentColor;flex:none}
.av-ok{background:var(--green-d);color:#fff}
.av-mid{background:var(--amber);color:var(--navy)}
.av-full{background:var(--red);color:#fff}

/* pitch type colours, used like the train, bus and coach colours on the transport page */
.kd{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;color:#fff;flex:none;position:relative}
.kd svg{width:17px;height:17px}
.k-tent{background:var(--green)}.k-van{background:var(--sky)}.k-caravan{background:var(--purple)}.k-glamping{background:var(--orange)}

/* notice box */
.notice{display:grid;grid-template-columns:minmax(220px,300px) minmax(0,1fr);background:#fff;border:1px solid var(--line);margin-top:24px}
.notice .nh{background:var(--navy);color:#fff;padding:20px 22px;display:flex;flex-direction:column;justify-content:center}
.notice .nh span{color:var(--teal);font-weight:600;font-size:15px}
.notice .nh b{font:800 26px/1.05 "Barlow Condensed",sans-serif;margin-top:4px}
.notice .nb{padding:18px 22px;display:flex;gap:16px 24px;align-items:center;flex-wrap:wrap}
.notice .nb p{flex:1 1 320px;font-size:16px;line-height:25px}

/* ring map */
.rmap{width:100%;height:auto;display:block;overflow:visible}
.rmap .ring{fill:none;stroke:var(--teal);stroke-opacity:.6;stroke-width:1.5;stroke-dasharray:5 7}
.rmap .rl{fill:var(--teal);font:500 13px "Barlow",sans-serif;text-anchor:middle}
.rmap .road{fill:none;stroke:#8C9DAD;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;opacity:.55}
.rmap .rdl{fill:#B9CAD8;font:600 12px "Barlow",sans-serif;text-anchor:middle}
.rmap .town{fill:#9FD9D6}
.rmap .tl{fill:#D6E2EA;font:500 14px "Barlow",sans-serif}
.rmap .runway{stroke:var(--amber);stroke-width:9;stroke-linecap:round}
.rmap .ctr{fill:var(--navy);stroke:#fff;stroke-width:3}
.rmap .ctr-dot{fill:#fff}
.rmap .cl{fill:#fff;font:700 15px "Barlow",sans-serif}
.rmap .mk circle{fill:var(--sky);stroke:#fff;stroke-width:2.5}
.rmap .mk path{fill:none;stroke:var(--navy);stroke-width:2;stroke-linejoin:round}
.rmap a.mk:hover circle,.rmap .mk.on circle{fill:var(--amber)}
.rmap .mk.ghost circle{fill:none;stroke-dasharray:4 4;stroke:#9FD9D6}
.rmap .mk.ghost path{stroke:#9FD9D6}
.rmap .ghost-l{fill:#9FD9D6;font:600 14px "Barlow",sans-serif}

/* links to the other guides: coloured tiles with a round icon badge */
.guides{background:var(--navy);color:#fff;padding:40px 0 48px;border-top:6px solid var(--wood)}
.guides h2{font:800 clamp(27px,3.6vw,36px)/1.05 "Barlow",sans-serif}
.guides>.wrap>p{color:#C9D6E0;margin-top:6px;max-width:70ch}
.gt{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-top:52px}
.g{position:relative;display:block;text-decoration:none;text-align:center;padding:44px 16px 20px;background:var(--c);color:#fff;border-bottom:6px solid rgba(0,0,0,.22)}
.g i{position:absolute;top:-32px;left:50%;margin-left:-32px;width:64px;height:64px;border-radius:50%;background:#fff;border:7px solid var(--c);display:grid;place-items:center;color:var(--navy)}
.g i svg{width:26px;height:26px}
.g b{display:block;font:800 23px/1.1 "Barlow Condensed",sans-serif}
.g span{display:block;font-size:15px;line-height:21px;margin-top:5px}
.g.dark{color:var(--navy)}
.g:hover{filter:brightness(1.08)}

.small{background:var(--deep);color:#AFC0CD;font-size:14px;line-height:22px;padding:22px 0}
.small p+p{margin-top:8px}
.small a{color:#fff}
.sample-bar{background:var(--amber);color:var(--navy);font:600 15px/1.4 "Barlow",sans-serif;text-align:center;padding:9px 18px}

@media (max-width:1000px){
  .gt{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:50px}
  .stab span span{display:none}
}
@media (max-width:720px){
  .wrap{padding:0 16px}
  .brand span,.strip .lab{display:none}
  .stabs .row{overflow-x:auto;scrollbar-width:none;padding-top:8px}
  .stabs .row::-webkit-scrollbar{display:none}
  .stab{flex:1 0 auto;padding:10px 12px 11px;gap:8px}
  .stab .n{width:26px;height:26px;font-size:14px}
  .stab b{font-size:15px;white-space:nowrap}
  .panel{padding:20px 0 40px}
  .sheet-in{padding:18px 16px}
  .sign-h{grid-template-columns:auto minmax(0,1fr);padding:12px 16px 12px 12px;gap:2px 12px}
  .sign-h i{width:44px;height:44px;grid-row:span 2}
  .sign-h i svg{width:23px;height:23px}
  .sign-h span{grid-column:2}
  .notice{grid-template-columns:1fr}
  .gt{grid-template-columns:1fr}
  .ticker button{margin-left:0}
  .ticker .wrap{flex-wrap:wrap;gap:6px 12px}
}
"""

# Tabs: shared by the home page and the campsite pages. #name in the address opens that tab.
TABS_JS = r"""<script>
(function(){
var tabs=[].slice.call(document.querySelectorAll('.stab')),panels=[].slice.call(document.querySelectorAll('.panel')),top=document.getElementById('tabsTop');
function show(id,jump){
  if(!tabs.some(function(t){return t.getAttribute('data-p')===id}))return false;
  tabs.forEach(function(t){var on=t.getAttribute('data-p')===id;t.classList.toggle('on',on);t.setAttribute('aria-selected',on?'true':'false');t.tabIndex=on?0:-1;
    if(on&&t.scrollIntoView&&t.parentNode.scrollWidth>t.parentNode.clientWidth){t.parentNode.scrollLeft=Math.max(0,t.offsetLeft-40)}});
  panels.forEach(function(p){p.hidden=p.id!==id});
  if(jump&&top){var r=top.getBoundingClientRect();if(r.top<0||r.top>window.innerHeight*0.7)window.scrollTo(0,r.top+(window.pageYOffset||document.documentElement.scrollTop))}
  return true}
tabs.forEach(function(t,i){
  t.addEventListener('click',function(){show(t.getAttribute('data-p'),true)});
  t.addEventListener('keydown',function(ev){var d=ev.key==='ArrowRight'?1:ev.key==='ArrowLeft'?-1:0;if(!d)return;ev.preventDefault();
    var n=tabs[(i+d+tabs.length)%tabs.length];show(n.getAttribute('data-p'),false);n.focus()})});
document.addEventListener('click',function(ev){var a=ev.target.closest?ev.target.closest('[data-go]'):null;if(!a)return;
  if(show(a.getAttribute('data-go'),true))ev.preventDefault()});
function fromHash(){var h=(location.hash||'').replace('#','');if(h)show(h,true)}
window.addEventListener('hashchange',fromHash);fromHash();
window.ukagTab=show;
})();
</script>"""


def head(title, desc, extra_css, canonical=""):
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
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;800&display=swap" rel="stylesheet">
<style>{CSS}{extra_css}</style>
</head>
<body>
"""


def top_bar():
    h, t = home_href()
    return (f'<div class="bar"><div class="wrap"><a class="brand" href="{e(h)}" target="{t}"><b>Airshow Camping</b>'
            f'<span>by The Big Guide to UK Airshows</span></a>'
            f'<a class="back" href="{SITE}{RIAT_WIX}" target="_top">Back to the RIAT guide</a></div></div>')


def site_strip(live, current=None):
    """The campsite tabs: home first, then one tab per campsite page."""
    h, t = home_href()
    on = " on" if current == "home" else ""
    out = ['<nav class="strip" aria-label="RIAT campsites"><div class="wrap">',
           f'<a class="st{on}" href="{e(h)}" target="{t}"{" aria-current=page" if on else ""}>{icon("tent")}RIAT camping</a>']
    for s in live:
        href, tgt = page_href(s)
        on = " on" if current == s["slug"] else ""
        cur = ' aria-current="page"' if on else ""
        a = avail(s)
        dot = f'<i class="dot {a[1]}"></i><span class="vh">{a[0]}: </span>' if a else ""
        out.append(f'<a class="st{on}" href="{e(href)}" target="{tgt}"{cur}>{dot}{e(s["name"])} <small>{e(dist_text(s))}</small></a>')
    if current == "home":
        out.append(f'<a class="st add" href="#list" data-go="list">{icon("plus")}List your campsite</a>')
    else:
        out.append(f'<a class="st add" href="{e(h)}#list" target="{t}">{icon("plus")}List your campsite</a>')
    out.append('</div></nav>')
    return "".join(out)


def section_tabs(items):
    """items: (panel id, colour class, title, sub)."""
    out = ['<div id="tabsTop"></div><div class="stabs"><div class="wrap"><div class="row" role="tablist" aria-label="Sections">']
    for i, (pid, col, title, sub) in enumerate(items):
        on = i == 0
        out.append(f'<button type="button" role="tab" class="stab {col}{" on" if on else ""}" data-p="{pid}" id="tab-{pid}" '
                   f'aria-controls="{pid}" aria-selected="{"true" if on else "false"}" tabindex="{0 if on else -1}">'
                   f'<span class="n">{i + 1}</span><span><b>{e(title)}</b><span>{e(sub)}</span></span></button>')
    out.append('</div></div></div>')
    return "".join(out)


def sign(col, ic, title, right, right_id=""):
    rid = f' id="{right_id}"' if right_id else ""
    return f'<div class="sign-h {col}"><i>{icon(ic)}</i><h2>{e(title)}</h2><span{rid}>{e(right)}</span></div>'


def kind_dots(kinds, labels=False):
    out = []
    for k in KINDS:
        if k in kinds:
            lab = f'<span>{KINDS[k]}</span>' if labels else f'<span class="vh">{KINDS[k]}</span>'
            out.append(f'<span class="kp"><i class="kd {KIND_COL[k]}">{icon(k if k != "tent" else "tent")}</i>{lab}</span>')
    return "".join(out)


def guides():
    cols = ["var(--purple)", "var(--sky)", "var(--teal)", "var(--red)"]
    out = []
    for (path, ic, name, sub), c in zip(GUIDES, cols):
        dark = " dark" if c in ("var(--sky)", "var(--teal)") else ""
        out.append(f'<a class="g{dark}" style="--c:{c}" href="{SITE}{path}" target="_top"><i>{icon(ic)}</i>'
                   f'<b>{e(name)}</b><span>{e(sub)}</span></a>')
    return (f'<div class="camp">{camp_scene()}</div><section class="guides" aria-labelledby="plan-h"><div class="wrap"><h2 id="plan-h">Plan your camping trip</h2>'
            f'<p>More from the guide, for working out what to bring and what the weekend will cost.</p>'
            f'<div class="gt">{"".join(out)}</div></div></section>')


def small_print(extra=""):
    return f"""<footer class="small"><div class="wrap">
<p>The Big Guide to UK Airshows is independent and not part of the Royal International Air Tattoo. Campsite details come from the owners. Please check prices, dates and rules with the campsite before you book.</p>
{extra}<p>Running a campsite near Boscombe Down or Fairford? Email <a href="mailto:{CONTACT}?subject=RIAT%20campsite%20listing">{CONTACT}</a>.</p>
</div></footer>"""


def mailto(subject="RIAT campsite listing"):
    return f"mailto:{CONTACT}?subject=" + subject.replace(" ", "%20")


# ---------------------------------------------------------------- home page
HOME_CSS = r"""
.hero{position:relative;color:#fff;background:var(--navy) center/cover no-repeat}
.hero::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,26,39,.93) 0%,rgba(19,41,60,.82) 45%,rgba(19,41,60,.45) 100%)}
.hero-in{position:relative;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(340px,.85fr);gap:48px;align-items:center;padding-top:56px;padding-bottom:118px}
.crumb{font:500 15px/1.4 "Barlow",sans-serif;color:#C9D6E0;margin-bottom:16px}
.crumb a{color:#fff;text-decoration:none;border-bottom:2px solid var(--teal)}
.crumb i{font-style:normal;margin:0 8px;color:var(--teal)}
.hero h1{font:800 clamp(42px,6.4vw,78px)/.98 "Barlow Condensed","Barlow",sans-serif;letter-spacing:.005em}
.hero h1 em{font-style:normal;color:var(--teal);display:block}
.hero .lead{margin-top:18px;max-width:56ch;color:#E9EFF4;font-size:19px;line-height:29px}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:26px;max-width:640px}
.stat{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;padding:10px 14px 10px 12px;background:rgba(19,41,60,.6);border:1px solid rgba(255,255,255,.28);text-decoration:none;color:#fff;font:600 16px/1.25 "Barlow",sans-serif}
.stat i{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--c);color:#fff}
.stat i svg{width:19px;height:19px}
.stat b{font:800 23px/1 "Barlow Condensed",sans-serif;margin-right:6px}
a.stat:hover{background:rgba(19,41,60,.85);border-color:#fff}

/* the finder box, like the journey planner */
.finder{background:#fff;color:var(--ink);box-shadow:0 24px 50px -18px rgba(0,0,0,.55)}
.fh{display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px;align-items:center;background:var(--purple);color:#fff;padding:18px 22px}
.fh i{width:42px;height:42px;border-radius:50%;background:#fff;color:var(--purple);display:grid;place-items:center}
.fh i svg{width:22px;height:22px}
.fh b{display:block;font:700 22px/1.1 "Barlow",sans-serif}
.fh span{display:block;font-size:15px;margin-top:2px}
.fb{padding:20px 22px 22px;display:grid;gap:16px}
.fb label,.fb .lg{display:block;font:600 15px/1.3 "Barlow",sans-serif;color:var(--navy);margin-bottom:8px}
.fb select{width:100%;font:600 17px/1.3 "Barlow",sans-serif;color:var(--navy);padding:13px 12px;background:var(--mist);border:0;border-bottom:2px solid #C3D1DB;border-radius:0}
.ft-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.ftile{display:flex;flex-direction:column;align-items:center;gap:7px;padding:11px 4px 10px;background:var(--mist);border:0;border-bottom:3px solid transparent;cursor:pointer;font:600 14px/1.15 "Barlow",sans-serif;color:var(--navy);text-align:center}
.ftile:hover{background:#E6ECF1}
.ftile[aria-pressed=true]{background:#fff;border-bottom-color:var(--purple);box-shadow:0 0 0 2px var(--purple) inset}
.fc-row{display:flex;flex-wrap:wrap;gap:6px}
.fchk{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;background:var(--mist);border:0;cursor:pointer;font:600 15px/1 "Barlow",sans-serif;color:var(--navy)}
.fchk::before{content:"";width:14px;height:14px;border:2px solid #8FA1AF;background:#fff;flex:none}
.fchk[aria-pressed=true]{background:var(--navy);color:#fff}
.fchk[aria-pressed=true]::before{border-color:#fff;background:var(--teal)}
.fb .btn{width:100%;font-size:18px;padding:17px 20px}
.fb p{font-size:16px;line-height:25px}

/* campsite cards */
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.cc{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line)}
.cc .ph{position:relative;aspect-ratio:16/10;background:var(--navy);overflow:hidden}
.cc .ph img{width:100%;height:100%;object-fit:cover}
.cc .flag{position:absolute;left:0;bottom:0;background:var(--navy);color:#fff;font:700 15px/1 "Barlow",sans-serif;padding:9px 12px;border-left:6px solid var(--amber)}
.cc .bd{padding:16px 18px 18px;display:flex;flex-direction:column;gap:10px;flex:1}
.cc h3{font:700 23px/1.15 "Barlow",sans-serif;color:var(--navy)}
.cc h3 a{text-decoration:none}
.cc h3 a:hover{text-decoration:underline;text-decoration-color:var(--teal);text-decoration-thickness:3px}
.cc .kind{color:var(--soft);font-size:16px;margin-top:-6px}
.kps{display:flex;flex-wrap:wrap;gap:6px 14px}
.kp{display:inline-flex;align-items:center;gap:7px;font:600 15px/1 "Barlow",sans-serif;color:var(--navy);position:relative}
.cc .has{font-size:16px;line-height:23px}
.cc .ft{margin-top:auto;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding-top:12px;border-top:1px solid var(--line)}
.cc .pr{font:600 15px/1.2 "Barlow",sans-serif;color:var(--soft)}
.cc .pr b{display:block;font:800 30px/1 "Barlow Condensed",sans-serif;color:var(--navy)}
.cc .ft .btn{padding:12px 15px;font-size:15px}
.cc .av{width:100%;padding:11px 18px}
.none{grid-column:1/-1;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:18px;align-items:center;background:#fff;border:2px dashed #B3C3CF;padding:22px}
.none i{width:54px;height:54px;border-radius:50%;background:var(--navy);color:var(--amber);display:grid;place-items:center}
.none i svg{width:26px;height:26px}
.none h3{font:700 21px/1.2 "Barlow",sans-serif;color:var(--navy)}
.none p{font-size:16px;line-height:24px;margin-top:3px}
.nomatch{display:none;grid-column:1/-1;background:#fff;border:2px dashed #B3C3CF;padding:20px 22px}

/* compare board */
.swipe{display:none}
.board-scroll{overflow-x:auto}
.board{border-collapse:collapse;width:100%;min-width:940px;font-size:16px;line-height:22px}
.board th,.board td{padding:13px 10px;text-align:center;border-top:1px solid var(--line);white-space:nowrap}
.board thead th{background:var(--navy);color:#fff;font:600 14px/1.2 "Barlow",sans-serif;border-top:0;vertical-align:middle;white-space:normal}
.board thead .kd{width:28px;height:28px}
.board .no{width:60px;padding-top:9px;padding-bottom:17px}
.board .no b{position:relative;display:inline-grid;place-items:center;width:40px;height:30px;background:var(--navy);color:#fff;font:800 20px/1 "Barlow Condensed",sans-serif;border-bottom:4px solid var(--amber)}
.board .no b::after{content:"";position:absolute;left:50%;top:calc(100% + 4px);width:4px;height:9px;margin-left:-2px;background:var(--wood)}
.board tbody th{text-align:left;font-weight:700;color:var(--navy);white-space:normal;min-width:190px;position:sticky;left:0;background:#fff;box-shadow:1px 0 0 var(--line)}
.board thead th:nth-child(2){text-align:left;position:sticky;left:0;z-index:1}
.board tbody th a{text-decoration:none}
.board tbody th a:hover{text-decoration:underline;text-decoration-color:var(--teal);text-decoration-thickness:3px}
.board tbody th small{display:block;font:500 14px/1.3 "Barlow",sans-serif;color:var(--soft)}
.board tbody tr:hover td,.board tbody tr:hover th{background:#F1EDF8}
.board .y,.board .n{display:inline-grid;place-items:center;width:26px;height:26px;position:relative}
.board .y{background:var(--green-d);color:#fff}
.board .n{color:#A9B6C0}
.board .y svg,.board .n svg{width:17px;height:17px}
.board .pr{font:800 22px/1 "Barlow Condensed",sans-serif;color:var(--navy)}
.board td.sp{padding:0;width:150px}
.board td.sp .av{width:100%;height:100%;min-height:52px;justify-content:center;white-space:nowrap}
.key{display:flex;flex-wrap:wrap;gap:10px 22px;background:var(--purple);color:#fff;padding:12px 20px;font:600 15px/1 "Barlow",sans-serif}
.key .kp{color:#fff}
.key .kd{box-shadow:0 0 0 2px #fff}

/* maps */
.maps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.mapbox{background:var(--navy);color:#fff}
.mapbox header{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:14px 18px;background:var(--deep);border-bottom:4px solid var(--c,var(--sky))}
.mapbox h3{font:700 21px/1.1 "Barlow",sans-serif}
.mapbox header span{font-size:15px;color:#C9D6E0}
.mapbox .mb{padding:10px 18px 18px}
.mapbox p{font-size:15px;line-height:22px;color:#C9D6E0;margin:6px 0 4px}

/* owners */
.own{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:28px;align-items:start}
.own h3.big{font:800 clamp(30px,4vw,44px)/1 "Barlow Condensed",sans-serif;color:var(--navy)}
.own h3.big em{font-style:normal;color:var(--purple)}
.own .txt p{margin-top:12px;max-width:56ch}
.gets{margin-top:20px;border:1px solid var(--line)}
.get{display:grid;grid-template-columns:56px minmax(0,1fr);border-top:1px solid var(--line);background:#fff}
.get:first-child{border-top:0}
.get i{background:var(--c);color:#fff;display:grid;place-items:center}
.get i svg{width:24px;height:24px}
.get div{padding:12px 16px}
.get b{display:block;font:700 18px/1.2 "Barlow",sans-serif;color:var(--navy)}
.get span{font-size:16px;color:var(--soft)}
.who{display:grid;gap:8px;margin-top:20px}
.who div{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:start;padding:12px 14px;background:var(--mist);border-left:6px solid var(--c)}
.who svg{width:26px;height:26px;color:var(--c);margin-top:2px}
.who b{display:block;font:700 17px/1.2 "Barlow",sans-serif;color:var(--navy)}
.who span{font-size:16px;line-height:23px}
.say{margin-top:20px;background:var(--navy);color:#fff;padding:20px 22px;font:600 20px/1.35 "Barlow",sans-serif;border-left:6px solid var(--teal)}
.say cite{display:block;margin-top:8px;font:600 15px/1.3 "Barlow",sans-serif;font-style:normal;color:var(--teal)}
.form{background:#fff;border:1px solid var(--line);box-shadow:0 14px 34px -20px rgba(19,41,60,.4)}
.form form{padding:20px 22px 22px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 16px}
.fld{display:grid;gap:6px;align-content:start}
.fld.wide{grid-column:1/-1}
.fld label,.fld legend{font:600 15px/1.3 "Barlow",sans-serif;color:var(--navy)}
.fld label i{font-style:normal;color:var(--red)}
.fld input[type=text],.fld input[type=email],.fld input[type=tel],.fld select,.fld textarea{font:400 16px/1.4 "Barlow",sans-serif;color:var(--ink);padding:12px;border:0;border-bottom:2px solid #C3D1DB;background:var(--mist);width:100%;border-radius:0}
.fld textarea{min-height:84px;resize:vertical}
.fld .bad{border-bottom-color:var(--red);background:#FBEDED}
fieldset.fld{border:0}
.ticks{display:flex;flex-wrap:wrap;gap:6px}
.ticks label{display:inline-flex;align-items:center;gap:8px;font-weight:500;color:var(--ink);background:var(--mist);padding:9px 12px;cursor:pointer}
.ticks input{width:18px;height:18px;accent-color:var(--purple)}
.form .go{grid-column:1/-1;display:grid;gap:10px}
.form .go .btn{width:100%;font-size:18px;padding:17px 20px}
.form .go small{color:var(--soft);font-size:15px;line-height:22px}
.form .err{grid-column:1/-1;color:#A32424;font-weight:600;display:none}
.made{display:none;margin:0 22px 22px;background:#EAF6F5;border-left:6px solid var(--teal);padding:18px}
.made b{color:var(--navy);font-size:18px}
.made p{margin-top:6px;font-size:16px;line-height:25px}
.made textarea{margin-top:12px;width:100%;min-height:200px;font:400 15px/1.5 ui-monospace,Menlo,Consolas,monospace;padding:12px;border:1px solid #B9C6D1;background:#fff;color:var(--ink)}
.made .acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}

@media (max-width:1000px){
  .hero-in{grid-template-columns:1fr;gap:28px;padding-top:40px;padding-bottom:104px}
  .cards{grid-template-columns:repeat(2,minmax(0,1fr))}
  .own{grid-template-columns:1fr}
  .swipe{display:inline}
}
@media (max-width:720px){
  .cards,.maps{grid-template-columns:1fr}
  .stats{grid-template-columns:1fr}
  .none{grid-template-columns:1fr}
  .form form{grid-template-columns:1fr;padding:16px}
  .made{margin:0 16px 16px}
  .fb,.fh{padding-left:16px;padding-right:16px}
}
"""

HOME_JS = r"""<script>
(function(){
/* finder: one area, any number of needs. Works on the cards and the compare board. */
var area='all',need=[];
var sel=document.getElementById('fArea'),needBtns=document.querySelectorAll('.finder [data-n]'),goBtn=document.getElementById('fGo');
var cards=document.querySelectorAll('.cards .cc'),rows=document.querySelectorAll('.board tbody tr'),
    empties=document.querySelectorAll('.cards .none'),nomatch=document.querySelector('.nomatch'),
    tick=document.getElementById('tickText'),clr=document.getElementById('tickClear'),lab=document.getElementById('areaLab');
var AREA={all:'All areas',boscombe:'Near Boscombe Down',fairford:'Around Fairford'},total=cards.length;
function ok(el){
  if(area!=='all'&&el.getAttribute('data-area')!==area)return false;
  var tags=' '+(el.getAttribute('data-tags')||'')+' ';
  for(var i=0;i<need.length;i++){if(tags.indexOf(' '+need[i]+' ')<0)return false}
  return true}
function plural(n){return n+' campsite'+(n===1?'':'s')}
function apply(){
  var shown=0,inArea=0;
  cards.forEach(function(c){var a=area==='all'||c.getAttribute('data-area')===area;if(a)inArea++;var v=ok(c);c.style.display=v?'':'none';if(v)shown++});
  rows.forEach(function(r){r.style.display=ok(r)?'':'none'});
  empties.forEach(function(x){x.style.display=(area==='all'||x.getAttribute('data-area')===area)?'':'none'});
  if(nomatch)nomatch.style.display=(inArea>0&&shown===0)?'block':'none';
  if(!total)return;
  var filtered=area!=='all'||need.length>0;
  if(goBtn)goBtn.firstChild.nodeValue='Show '+plural(shown)+' ';
  if(lab)lab.textContent=AREA[area];
  if(tick){var names=[];needBtns.forEach(function(b){if(b.getAttribute('aria-pressed')==='true')names.push(b.getAttribute('data-l'))});
    tick.textContent=filtered?(shown+' of '+plural(total)+'. '+AREA[area]+(names.length?'. With '+names.join(', ').toLowerCase():'')+'.'):('All '+plural(total)+', near Boscombe Down and around Fairford.')}
  if(clr)clr.hidden=!filtered}
if(sel)sel.addEventListener('change',function(){area=sel.value;apply()});
needBtns.forEach(function(b){b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';
  b.setAttribute('aria-pressed',on?'true':'false');var k=b.getAttribute('data-n');
  need=need.filter(function(x){return x!==k});if(on)need.push(k);apply()})});
function clear(){need=[];area='all';if(sel)sel.value='all';needBtns.forEach(function(x){x.setAttribute('aria-pressed','false')});apply()}
if(clr)clr.addEventListener('click',clear);
var c2=document.getElementById('noClear');if(c2)c2.addEventListener('click',clear);
if(goBtn)goBtn.addEventListener('click',function(){if(window.ukagTab)window.ukagTab('campsites',true)});
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
    flag = f'<span class="flag">{e(d)} from {e(AREAS[s["area"]]["label"])}</span>' if d else ""
    tags = site_tags(s)
    has = [FAC_LABEL[k] for k in ("hot-showers", "electric-hookup", "hardstanding", "food-van", "dogs")
           if fac_state(s.get("facilities", {}).get(k))[0]]
    if "shuttle" in tags:
        has.append("Shuttle to the show")
    has_txt = (has[0] + "".join(", " + h.lower() for h in has[1:4]) + ".") if has else ""
    fp = from_price(s)
    price = f'<span class="pr">From<b>{e(fp[1])}</b>{e(fp[2])}</span>' if fp else '<span class="pr">Ask for prices</span>'
    return (f'<article class="cc" data-area="{e(s["area"])}" data-tags="{" ".join(sorted(tags))}">'
            f'<div class="ph">{img}{flag}</div><div class="bd">'
            f'<h3><a href="{e(href)}" target="{tgt}">{e(s["name"])}</a></h3><p class="kind">{e(s.get("kind"))}</p>'
            f'<div class="kps">{kind_dots(tags, labels=True)}</div>'
            f'{"<p class=has>" + e(has_txt) + "</p>" if has_txt else ""}'
            f'<div class="ft">{price}<a class="btn navy" href="{e(href)}" target="{tgt}">View campsite {icon("arrow")}</a></div></div>'
            f'{avail_badge(s)}</article>')


def empty_card(area_key):
    where = {"boscombe": "near Boscombe Down", "fairford": "around Fairford"}[area_key]
    return (f'<div class="none" data-area="{area_key}"><i>{icon("tent")}</i><div>'
            f'<h3>No campsites listed {e(where)} yet</h3>'
            f'<p>I am adding campsites as owners get in touch. If you run one, I would love to hear from you.</p></div>'
            f'<a class="btn purple" href="#list" data-go="list">List your campsite</a></div>')


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
        rows.append(f'<tr data-area="{e(s["area"])}" data-tags="{" ".join(sorted(tags))}"><td class="no"><b>{i + 1:02d}</b></td>'
                    f'<th scope="row"><a href="{e(href)}" target="{tgt}">{e(s["name"])}</a>'
                    f'<small>{e(AREAS[s["area"]]["long"])}</small></th>'
                    f'<td>{e(dist_text(s)) or "Ask"}</td><td>{price}</td>'
                    + "".join(f"<td>{c}</td>" for c in cells)
                    + f'<td class="sp">{avail_badge(s) or "Ask"}</td></tr>')
    kh = "".join(f'<th scope="col"><i class="kd {KIND_COL[k]}">{icon(k)}</i><span class="vh">{KINDS[k]}</span></th>' for k in KINDS)
    heads = ('<th scope="col">Pitch</th><th scope="col">Campsite</th><th scope="col">Distance</th><th scope="col">From, per night</th>'
             + kh + '<th scope="col">Electric hook up</th><th scope="col">Hot showers</th><th scope="col">Dogs</th>'
             '<th scope="col">Shuttle</th><th scope="col">Spaces</th>')
    return (f'<div class="board-scroll" tabindex="0" role="region" aria-label="Campsite comparison board">'
            f'<table class="board"><thead><tr>{heads}</tr></thead><tbody>{"".join(rows)}</tbody></table></div>'
            f'<div class="key">{kind_dots(set(KINDS), labels=True)}</div>')


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
    hero_img = "https://jskedge1.github.io/airshow-pages/camping-hub-img/hero-flyby.jpg"

    if live:
        tiles = "".join(f'<button type="button" class="ftile" data-n="{k}" data-l="{e(KINDS[k])}" aria-pressed="false">'
                        f'<i class="kd {KIND_COL[k]}">{icon(k)}</i>{e(lab)}</button>'
                        for k, lab in (("tent", "Tent"), ("van", "Campervan"), ("caravan", "Caravan or tourer"), ("glamping", "Glamping")))
        chks = "".join(f'<button type="button" class="fchk" data-n="{k}" data-l="{e(lab)}" aria-pressed="false">{e(lab)}</button>'
                       for k, lab in (("hookup", "Electric hook up"), ("dogs", "Dogs welcome"), ("shuttle", "Shuttle to the show")))
        finder = f"""<aside class="finder" aria-label="Find your campsite">
      <div class="fh"><i>{icon("tent")}</i><div><b>Find your campsite</b><span>Tick what you need and I will narrow it down</span></div></div>
      <div class="fb">
        <div><label for="fArea">Where would you like to stay?</label>
          <select id="fArea"><option value="all">All areas</option><option value="boscombe">Near MOD Boscombe Down</option><option value="fairford">Around Fairford</option></select></div>
        <div><span class="lg">What are you bringing?</span><div class="ft-row">{tiles}</div></div>
        <div><span class="lg">I also need</span><div class="fc-row">{chks}</div></div>
        <button type="button" class="btn purple" id="fGo">Show {n} campsite{"s" if n != 1 else ""} {icon("arrow")}</button>
      </div>
    </aside>"""
        ticker = (f'<div class="ticker"><div class="wrap"><b>Showing</b><span id="tickText">All {n} campsite{"s" if n != 1 else ""}.</span>'
                  f'<button type="button" id="tickClear" hidden>Clear my choices</button></div></div>')
    else:
        finder = f"""<aside class="finder" aria-label="Campsites are being added">
      <div class="fh"><i>{icon("tent")}</i><div><b>Campsites are being added</b><span>Listings are opening now for RIAT 2027</span></div></div>
      <div class="fb">
        <p>I am adding campsites as owners get in touch, so check back as the list grows. RIAT also has its own official campsite beside the airfield.</p>
        <a class="btn purple" href="#list" data-go="list">List your campsite {icon("arrow")}</a>
        <a class="btn line" href="{OFFICIAL_CAMPING}" target="_blank" rel="noopener">Official RIAT camping</a>
      </div>
    </aside>"""
        ticker = ('<div class="ticker"><div class="wrap"><b>Latest</b><span>Listings are opening now. '
                  'Campsite owners near Boscombe Down and Fairford can add their site in the last tab.</span></div></div>')

    stats = (f'<a class="stat" style="--c:var(--green)" href="#campsites" data-go="campsites"><i>{icon("tent")}</i><span><b>{n}</b>campsite{"s" if n != 1 else ""} listed</span></a>'
             if n else f'<a class="stat" style="--c:var(--green)" href="#campsites" data-go="campsites"><i>{icon("tent")}</i><span>Listings opening now</span></a>')
    stats += (f'<a class="stat" style="--c:var(--sky)" href="#map" data-go="map"><i>{icon("pin")}</i><span><b>2</b>areas on the show map</span></a>'
              f'<span class="stat" style="--c:var(--red)"><i>{icon("cal")}</i><span><b>16 to 18</b>July 2027</span></span>'
              f'<a class="stat" style="--c:var(--orange)" href="#list" data-go="list"><i>{icon("plus")}</i><span>List your campsite</span></a>')

    tab_items = [("campsites", "c-sky", "Campsites", "Pitches, prices and spaces")]
    if n >= 2:
        tab_items.append(("compare", "c-red", "Compare", "Every campsite side by side"))
    tab_items += [("map", "c-green", "Show map", "How far from the airfield"),
                  ("list", "c-purple", "List your campsite", "For campsite owners")]

    compare_panel = ""
    if n >= 2:
        compare_panel = f"""<section class="panel" id="compare" role="tabpanel" aria-labelledby="tab-compare" hidden>
  <div class="wrap"><div class="sheet">
    {sign("c-red", "cols", "Compare the campsites", "Side by side")}
    <div class="sheet-in"><p class="intro">Every campsite on one board, so you can see what each one has. Your choices in the finder work here too.<span class="swipe"> Swipe sideways to see it all.</span></p></div>
    {compare_board(live)}
  </div></div>
</section>"""

    body = f"""{head(h_title, desc, HOME_CSS, SITE + HOME_WIX if HOME_WIX else "")}
{top_bar()}
{site_strip(live, "home")}
<header class="hero" style="background-image:url('{hero_img}')">
  <div class="wrap hero-in">
    <div>
      <p class="crumb"><a href="{SITE}{RIAT_WIX}" target="_top">Royal International Air Tattoo</a><i>/</i>Camping</p>
      <h1>Camping for the Air Tattoo <em>near Boscombe Down</em></h1>
      <p class="lead">From 2027 the Air Tattoo moves to MOD Boscombe Down, and a lot of visitors will be looking for somewhere to pitch up nearby. I list the campsites around the new showground here, plus the ones still running around Fairford.</p>
      <div class="stats">{stats}</div>
    </div>
    {finder}
  </div>
  <div class="scene">{camp_scene("light")}</div>
</header>
{section_tabs(tab_items)}
{ticker}
<main>
<section class="panel" id="campsites" role="tabpanel" aria-labelledby="tab-campsites">
  <div class="wrap">
    <div class="sheet">
      {sign("c-sky", "tent", "Campsites for RIAT 2027", "All areas", "areaLab")}
      <div class="sheet-in">
        <p class="intro">Every campsite has its own page with pitch sizes and prices, facilities, rules and the best way to the showground. Distances are as the crow flies from the airfield.</p>
        <div class="cards">{"".join(cards)}<p class="nomatch"><b>No campsites match all of those yet.</b> Try taking one off, or <button type="button" class="btn line" id="noClear" style="padding:8px 12px;margin-left:6px">clear my choices</button></p></div>
      </div>
    </div>
    <div class="notice">
      <div class="nh"><span>Good to know</span><b>The official RIAT campsite</b></div>
      <div class="nb"><p>RIAT has its own campsite beside the airfield at Boscombe Down, and rollover bookings get first pick. The campsites on this page are run independently by local owners.</p>
      <a class="btn teal" href="{OFFICIAL_CAMPING}" target="_blank" rel="noopener">Official camping {icon("arrow")}</a></div>
    </div>
  </div>
</section>
{compare_panel}
<section class="panel" id="map" role="tabpanel" aria-labelledby="tab-map" hidden>
  <div class="wrap"><div class="sheet">
    {sign("c-green", "sign", "On the show map", "5 and 10 mile rings")}
    <div class="sheet-in">
      <p class="intro">Each tent is a campsite. Tap one to open its page. The rings are 5 and 10 miles from the airfield, as the crow flies.</p>
      <div class="maps">
        <div class="mapbox" style="--c:var(--sky)"><header><h3>Near Boscombe Down</h3><span>RIAT from 2027</span></header><div class="mb"><p>{e(AREAS["boscombe"]["blurb"])}</p>{ring_map("boscombe", live)}</div></div>
        <div class="mapbox" style="--c:var(--purple)"><header><h3>Around Fairford</h3><span>RIAT until 2026</span></header><div class="mb"><p>{e(AREAS["fairford"]["blurb"])}</p>{ring_map("fairford", live)}</div></div>
      </div>
    </div>
  </div></div>
</section>
<section class="panel" id="list" role="tabpanel" aria-labelledby="tab-list" hidden>
  <div class="wrap"><div class="sheet">
    {sign("c-purple", "plus", "List your campsite", "Free for campsite owners")}
    <div class="sheet-in own">
      <div class="txt">
        <h3 class="big">Running a campsite near <em>Boscombe Down?</em></h3>
        <p>If you are opening a campsite for the show, or you already run one in the area, I would love to hear from you. Still running a campsite around Fairford? I want to work with you too.</p>
        <div class="gets">
          <div class="get" style="--c:var(--green)"><i>{icon("tent")}</i><div><b>A listing on the guide</b><span>Your own page on the RIAT camping pages</span></div></div>
          <div class="get" style="--c:var(--sky)"><i>{icon("sign")}</i><div><b>On the show map</b><span>Distance to the show and how to get in</span></div></div>
          <div class="get" style="--c:var(--orange)"><i>{icon("fire")}</i><div><b>Seen by people planning</b><span>Families, photographers and first timers</span></div></div>
          <div class="get" style="--c:var(--pink)"><i>{icon("share")}</i><div><b>Shared on our socials</b><span>Over 12,000 airshow followers</span></div></div>
        </div>
        <div class="who">
          <div style="--c:var(--navy)">{icon("tent")}<p><b>Opening a new site</b><span>Setting up a field for show week? Tell me early.</span></p></div>
          <div style="--c:var(--purple)">{icon("caravan")}<p><b>Already running one</b><span>Caravan park, farm site or glamping nearby.</span></p></div>
          <div style="--c:var(--red)">{icon("van")}<p><b>Campervans and tourers</b><span>Hardstanding or hook ups? Visitors ask for these.</span></p></div>
        </div>
        <blockquote class="say">I would like to work with you and add your site to the website.<cite>Jack Skedge, Founder and Managing Editor</cite></blockquote>
      </div>
      <div class="form">
        <div class="fh"><i>{icon("list")}</i><div><b>Tell me about your campsite</b><span>This writes an email to me. Nothing is sent until you press send.</span></div></div>
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
          <div class="fld"><label for="lf-dates">Dates open for show week</label><input type="text" id="lf-dates" name="dates" placeholder="For example 14 to 19 July 2027"></div>
          <div class="fld"><label for="lf-web">Website or Facebook page</label><input type="text" id="lf-web" name="web" autocomplete="url"></div>
          <div class="fld wide"><label for="lf-more">Anything else you would like to tell me</label><textarea id="lf-more" name="more"></textarea></div>
          <p class="err" role="alert">Please add your campsite name, your name and an email address I can reply to.</p>
          <div class="go"><button class="btn purple" type="submit">Write my email {icon("arrow")}</button>
          <small>Prefer to email? I am at <a href="{mailto()}">{CONTACT}</a>. You can also <a href="{sample_href}" target="_blank" rel="noopener">see a sample campsite page</a> first.</small></div>
        </form>
        <div class="made" id="made" aria-live="polite">
          <b>Your email is ready</b>
          <p>Your email app should open with this filled in. If it doesn't, copy it and send it to {CONTACT}.</p>
          <textarea id="madeText" readonly aria-label="Your email, ready to copy"></textarea>
          <div class="acts"><a class="btn navy" id="madeOpen" href="{mailto()}">{icon("mail")}Open in my email</a><button class="btn line" type="button" id="madeCopy">Copy the email</button></div>
        </div>
      </div>
    </div>
  </div></div>
</section>
</main>
{guides()}
{small_print()}
{TABS_JS}
{HOME_JS.replace("__CONTACT__", CONTACT)}
</body>
</html>
"""
    (OUT / "index.html").write_text(body, encoding="utf-8")


# ---------------------------------------------------------------- campsite page
SITE_CSS = r"""
.hero{position:relative;background:var(--navy) center/cover no-repeat;color:#fff}
.hero::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,26,39,.94) 0%,rgba(19,41,60,.8) 48%,rgba(19,41,60,.28) 100%)}
.hero-in{position:relative;padding-top:44px}
.crumb{font:500 15px/1.4 "Barlow",sans-serif;color:#C9D6E0;margin-bottom:14px}
.crumb a{color:#fff;text-decoration:none;border-bottom:2px solid var(--teal)}
.crumb i{font-style:normal;margin:0 8px;color:var(--teal)}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.tagp{display:inline-flex;align-items:center;font:700 15px/1 "Barlow",sans-serif;padding:8px 11px;background:var(--purple);color:#fff}
.hero h1{font:800 clamp(40px,6.2vw,74px)/.98 "Barlow Condensed","Barlow",sans-serif;max-width:16ch}
.hero .kindl{font:700 clamp(18px,2.2vw,22px)/1.3 "Barlow",sans-serif;color:var(--teal);margin-top:10px}
.hero .lead{margin-top:12px;max-width:58ch;color:#E9EFF4;font-size:18px;line-height:28px}
.tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-top:64px;position:relative;top:44px}
.tile{position:relative;text-align:center;padding:42px 16px 20px;background:var(--c);color:#fff;border-bottom:6px solid rgba(0,0,0,.24);box-shadow:0 16px 30px -18px rgba(11,26,39,.6)}
.tile i{position:absolute;top:-32px;left:50%;margin-left:-32px;width:64px;height:64px;border-radius:50%;background:#fff;border:7px solid var(--c);display:grid;place-items:center;color:var(--navy)}
.tile i svg{width:26px;height:26px}
.tile b{display:block;font:800 25px/1.1 "Barlow Condensed",sans-serif}
.tile span{display:block;font:600 17px/1.3 "Barlow",sans-serif;margin-top:4px}
.tile.dark{color:var(--navy)}
.under{padding:64px 0 16px;font-size:16px}
.under b{color:var(--teal-ink)}

.about{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:32px;align-items:start}
.about .txt p+p{margin-top:14px}
.owner{margin-top:22px;background:var(--navy);color:#fff;padding:20px 22px;font:600 19px/1.4 "Barlow",sans-serif;border-left:6px solid var(--teal)}
.owner cite{display:block;margin-top:8px;font:600 15px/1.3 "Barlow",sans-serif;font-style:normal;color:var(--teal)}
.facts{margin-top:22px;border:1px solid var(--line)}
.facts div{display:grid;grid-template-columns:130px minmax(0,1fr);gap:12px;padding:11px 14px;border-top:1px solid var(--line)}
.facts div:first-child{border-top:0}
.facts dt{color:var(--soft)}
.facts dd{font-weight:600;color:var(--navy)}
.gal{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
.gal figure{grid-column:span 3}
.gal figure:first-child{grid-column:1/-1}
.gal.odd figure:nth-last-child(-n+3){grid-column:span 2}
.gal img{width:100%;aspect-ratio:4/3;object-fit:cover}
.gal figure:first-child img{aspect-ratio:16/9}
.gal figcaption{font:500 14px/1.35 "Barlow",sans-serif;color:var(--soft);margin-top:4px}

.pitches{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}
.pitch{border:1px solid var(--line);background:#fff;display:flex;flex-direction:column}
.pitch header{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;padding:12px 14px;color:#fff;background:var(--c)}
.pitch header i{width:40px;height:40px;border-radius:50%;background:#fff;color:var(--navy);display:grid;place-items:center}
.pitch header i svg{width:21px;height:21px}
.pitch h3{font:700 19px/1.15 "Barlow",sans-serif}
.pitch.k-tent{--c:var(--green-d)}.pitch.k-van{--c:var(--sky)}.pitch.k-caravan{--c:var(--purple)}.pitch.k-glamping{--c:var(--orange)}
.pitch.k-tent,.pitch.k-van,.pitch.k-caravan,.pitch.k-glamping{background:#fff}
.pitch.k-van header,.pitch.k-glamping header{color:var(--navy)}
.pitch .pp{padding:14px 16px 4px;font:800 44px/1 "Barlow Condensed",sans-serif;color:var(--navy)}
.pitch .pp small{font:600 16px/1 "Barlow",sans-serif;color:var(--soft);margin-left:8px}
.pitch dl{padding:8px 16px 16px;display:grid;gap:0;font-size:16px;line-height:23px}
.pitch dl div{display:grid;grid-template-columns:76px minmax(0,1fr);gap:8px;border-top:1px solid var(--line);padding:7px 0}
.pitch dt{color:var(--soft)}
.pitch dd{font-weight:600}
.dates{margin-top:24px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));background:var(--navy);color:#fff}
.dates div{padding:14px 16px;border-left:1px solid rgba(255,255,255,.14)}
.dates div:first-child{border-left:0}
.dates dt{font:600 15px/1.2 "Barlow",sans-serif;color:var(--amber)}
.dates dd{font:700 18px/1.25 "Barlow",sans-serif;margin-top:4px}

.facs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.fg{background:#fff;border:1px solid var(--line);border-top:6px solid var(--c)}
.fg h3{font:700 19px/1.2 "Barlow",sans-serif;color:var(--navy);padding:13px 16px 11px}
.fg ul{list-style:none}
.fg li{display:grid;grid-template-columns:26px minmax(0,1fr);gap:10px;padding:9px 16px;border-top:1px solid var(--line);font-size:16px;line-height:22px}
.fg li>svg{width:22px;height:22px;padding:3px}
.fg li.y>svg{background:var(--green-d);color:#fff}
.fg li.n{color:#7E8C97}
.fg li.n>svg{color:#A9B6C0}
.fg li b{display:block;font-weight:600}
.fg li small{display:block;color:var(--soft);font-size:15px}
.rules{margin-top:24px;border:1px solid var(--line)}
.rules h3{background:var(--navy);color:#fff;font:700 19px/1.2 "Barlow",sans-serif;padding:13px 16px}
.rules dl div{display:grid;grid-template-columns:170px minmax(0,1fr);gap:16px;padding:13px 16px;border-top:1px solid var(--line)}
.rules dt{font-weight:700;color:var(--navy)}

.getto{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr);gap:24px;align-items:start}
.ways{border:1px solid var(--line)}
.ways h3,.where h3{background:var(--black);color:#fff;font:700 18px/1.2 "Barlow",sans-serif;padding:13px 16px}
.way{display:grid;grid-template-columns:132px minmax(0,1fr);border-top:1px solid var(--line);background:#fff}
.way .wl{background:var(--c);color:#fff;font:700 16px/1.2 "Barlow",sans-serif;padding:14px 12px;display:flex;align-items:center;gap:8px}
.way .wl svg{width:20px;height:20px;flex:none}
.way.dark .wl{color:var(--navy)}
.way p{padding:13px 16px;font-size:16px;line-height:24px}
.where{background:var(--navy);color:#fff}
.where .wb{padding:16px 18px 18px}
.where .big{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 10px;font:800 50px/1 "Barlow Condensed",sans-serif;color:var(--amber)}
.where .big span{font:600 16px/1.2 "Barlow",sans-serif;color:#C9D6E0}
.where address{font-style:normal;color:#E9EFF4;margin:8px 0 12px;font-size:16px;line-height:24px}
.where .lk{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}

.book{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:24px;align-items:start}
.bookbox{border:1px solid var(--line)}
.bookbox .fh{display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px;align-items:center;background:var(--purple);color:#fff;padding:16px 20px}
.bookbox .fh i{width:42px;height:42px;border-radius:50%;background:#fff;color:var(--purple);display:grid;place-items:center}
.bookbox .fh i svg{width:22px;height:22px}
.bookbox .fh b{display:block;font:700 21px/1.1 "Barlow",sans-serif}
.bookbox .fh span{display:block;font-size:15px;margin-top:2px}
.acts{padding:18px 20px 20px;display:grid;gap:10px}
.acts .btn{justify-content:flex-start}
.offer{background:var(--red);color:#fff;padding:18px 20px;font-weight:600}
.offer b{display:block;font:800 26px/1 "Barlow Condensed",sans-serif;margin-bottom:6px}
.terms{border:1px solid var(--line);margin-top:16px}
.terms div{display:grid;grid-template-columns:120px minmax(0,1fr);gap:12px;padding:12px 16px;border-top:1px solid var(--line)}
.terms div:first-child{border-top:0}
.terms dt{color:var(--soft)}
.terms dd{font-weight:600;color:var(--navy)}
.more{padding:0 0 48px}
.more h2{font:800 28px/1.1 "Barlow",sans-serif;color:var(--navy);margin-bottom:14px}
.more .ml{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.more a{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;background:#fff;border:1px solid var(--line);border-left:6px solid var(--sky);padding:14px 16px;text-decoration:none;font-weight:700;color:var(--navy)}
.more a span{display:block;font:500 15px/1.3 "Barlow",sans-serif;color:var(--soft)}
.more a svg{width:20px;height:20px}
.more a:hover{border-left-color:var(--purple);background:#F7F5FB}

@media (max-width:1000px){
  .facs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .dates{grid-template-columns:repeat(3,minmax(0,1fr))}
  .about,.getto,.book{grid-template-columns:1fr}
}
@media (max-width:720px){
  .hero-in{padding-top:30px}
  .tiles{grid-template-columns:1fr;gap:46px;margin-top:56px;top:0;padding-bottom:28px}
  .under{padding-top:16px}
  .facs{grid-template-columns:1fr}
  .dates{grid-template-columns:repeat(2,minmax(0,1fr))}
  .way{grid-template-columns:104px minmax(0,1fr)}
  .rules dl div{grid-template-columns:1fr;gap:2px}
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
    hero_bg = f" style=\"background-image:url('{e(photos[0]['src'])}')\"" if photos else ""

    # tiles under the heading
    open_txt = " to ".join(x for x in (dates.get("open"), dates.get("close")) if x) or "Ask the campsite"
    t1 = (f'<div class="tile" style="--c:var(--purple)"><i>{icon("pin")}</i><b>How far</b>'
          f'<span>{e(d + " from " + a["label"]) if d else e(a["long"])}</span></div>')
    t2 = f'<div class="tile" style="--c:var(--navy2)"><i>{icon("cal")}</i><b>When it is open</b><span>{e(open_txt)}</span></div>'
    t3 = (f'<div class="tile dark" style="--c:var(--sky)"><i>{icon("tent")}</i><b>Pitches</b>'
          f'<span>{"From " + e(fp[1]) + " " + e(fp[2]) if fp else "Ask the campsite for prices"}</span></div>')

    # about
    about = "".join(f"<p>{e(p)}</p>" for p in s.get("about", []) if p)
    ow = s.get("owner", {})
    owner = (f'<blockquote class="owner">{e(ow["quote"])}<cite>{e(ow.get("name"))}{", " + e(ow.get("role")) if ow.get("role") else ""}</cite></blockquote>'
             if ow.get("quote") else "")
    facts = []
    if d:
        facts.append(("Distance", f"{d} from {a['label']}"))
    if ts.get("driveMins"):
        facts.append(("Drive", ts["driveMins"]))
    if tags & set(KINDS):
        facts.append(("Takes", ", ".join(KINDS[k] for k in KINDS if k in tags)))
    if ts.get("shuttle"):
        facts.append(("Shuttle", "Yes, see Getting to the show"))
    if av:
        facts.append(("Spaces", av[0]))
    facts_html = ('<dl class="facts">' + "".join(f"<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k, v in facts) + "</dl>") if facts else ""
    gal = "".join(f'<figure><img src="{e(p["src"])}" alt="{e(p.get("alt"))}" loading="lazy" decoding="async">'
                  f'{"<figcaption>" + e(p["caption"]) + "</figcaption>" if p.get("caption") else ""}</figure>'
                  for p in photos[:6])

    # pitches
    pitch_html = []
    for p in s.get("pitches", []):
        k = p.get("kind") if p.get("kind") in KINDS else "tent"
        dl = "".join(f"<div><dt>{lab}</dt><dd>{e(p.get(key))}</dd></div>"
                     for lab, key in (("Size", "size"), ("Includes", "includes"), ("Note", "note")) if p.get(key))
        price = f'<p class="pp">{e(p.get("price"))}<small>{e(p.get("per"))}</small></p>' if p.get("price") else ""
        pitch_html.append(f'<article class="pitch k-{k}"><header><i>{icon(k)}</i><h3>{e(p.get("name"))}</h3></header>'
                          f'{price}<dl>{dl}</dl></article>')
    date_rows = [("Opens", dates.get("open")), ("Closes", dates.get("close")), ("Minimum stay", dates.get("minNights")),
                 ("Arrive", dates.get("arrive")), ("Leave", dates.get("leave"))]
    dates_html = "".join(f"<div><dt>{k}</dt><dd>{e(v)}</dd></div>" for k, v in date_rows if v)
    dates_html = f'<dl class="dates">{dates_html}</dl>' if dates_html else ""

    # facilities and rules
    fac = s.get("facilities", {})
    fcols = ["var(--sky)", "var(--green)", "var(--orange)", "var(--purple)"]
    groups = []
    for (title, items), col in zip(FAC_GROUPS, fcols):
        lis = []
        for key, label in items:
            ok, note = fac_state(fac.get(key))
            if ok is None:
                continue
            nt = f"<small>{e(note)}</small>" if note else ("<small>Not available</small>" if not ok else "")
            lis.append(f'<li class="{"y" if ok else "n"}">{icon("tick" if ok else "cross")}<span><b>{e(label)}</b>{nt}</span></li>')
        if lis:
            groups.append(f'<div class="fg" style="--c:{col}"><h3>{e(title)}</h3><ul>{"".join(lis)}</ul></div>')
    gtk = "".join(f"<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k, v in s.get("goodToKnow", []) if v)
    rules = f'<div class="rules"><h3>Good to know</h3><dl>{gtk}</dl></div>' if gtk else ""

    # getting to the show: coloured rows like the transport status list
    way_defs = [("driveMins", "car", "Driving", "var(--navy)", ""), ("shuttle", "bus", "Shuttle", "var(--sky)", " dark"),
                ("walk", "walk", "Walking", "var(--green-d)", ""), ("taxi", "taxi", "Taxi", "var(--amber)", " dark"),
                ("parking", "park", "Your car", "var(--purple)", "")]
    ways = "".join(f'<div class="way{dk}" style="--c:{col}"><span class="wl">{icon(ic)}{lab}</span><p>{e(ts[key])}</p></div>'
                   for key, ic, lab, col, dk in way_defs if ts.get(key))
    ways = f'<div class="ways"><h3>Ways to the showground</h3>{ways}</div>' if ways else "<p>Travel details coming soon.</p>"
    lk = []
    if has_pos(s):
        lk.append(f'<a class="btn sky" href="https://www.google.com/maps/dir/?api=1&amp;destination={s["lat"]},{s["lng"]}" target="_blank" rel="noopener">{icon("pin")}Directions</a>')
    if s.get("what3words"):
        w3 = e(s["what3words"].lstrip("/"))
        lk.append(f'<a class="btn ghost" href="https://what3words.com/{w3}" target="_blank" rel="noopener">///{w3}</a>')
    addr = ", ".join(x for x in (s.get("address"), s.get("postcode")) if x)
    big = f'<p class="big">{e(d)}<span>from {e(a["label"])}, as the crow flies</span></p>' if d else ""
    where = (f'<div class="where"><h3>Where it is</h3><div class="wb">{big}<address>{e(addr)}</address>'
             f'<div class="lk">{"".join(lk)}</div>{ring_map(s["area"], [s], s["slug"])}</div></div>')

    # booking
    acts = []
    if av and av[1] == "av-full":
        acts.append('<p><b>Fully booked for show week.</b> It is still worth asking the campsite about cancellations.</p>')
    if bk.get("url"):
        acts.append(f'<a class="btn red" href="{e(bk["url"])}" target="_blank" rel="noopener">{icon("link")}Book on the campsite website</a>')
    if bk.get("phone"):
        tel = "".join(ch for ch in bk["phone"] if ch.isdigit() or ch == "+")
        acts.append(f'<a class="btn navy" href="tel:{e(tel)}">{icon("phone")}Call {e(bk["phone"])}</a>')
    if bk.get("email"):
        acts.append(f'<a class="btn navy" href="mailto:{e(bk["email"])}?subject=RIAT%20camping%20booking">{icon("mail")}Email {e(bk["email"])}</a>')
    if s.get("website") and s.get("website") != bk.get("url"):
        acts.append(f'<a class="btn line" href="{e(s["website"])}" target="_blank" rel="noopener">{icon("link")}Campsite website</a>')
    for net in ("facebook", "instagram"):
        if s.get("socials", {}).get(net):
            acts.append(f'<a class="btn line" href="{e(s["socials"][net])}" target="_blank" rel="noopener">{net.title()}</a>')
    if not any("<a " in x for x in acts):
        acts.append('<p>Booking details coming soon.</p>')
    offer = f'<div class="offer"><b>Guide reader offer</b>{e(bk["offer"])}</div>' if bk.get("offer") else ""
    terms = "".join(f"<div><dt>{k}</dt><dd>{e(bk.get(key))}</dd></div>"
                    for k, key in (("Booking", "opens"), ("Payment", "deposit"), ("Cancellation", "cancellation")) if bk.get(key))
    terms = f'<dl class="terms"{" style=margin-top:0" if not offer else ""}>{terms}</dl>' if terms else ""

    others = [o for o in live if o["slug"] != s["slug"]]
    more = ""
    if others:
        links = []
        for o in sorted(others, key=lambda o: (o["area"] != s["area"], dist(o) or 99))[:6]:
            href, tgt = page_href(o)
            links.append(f'<a href="{e(href)}" target="{tgt}"><p>{e(o["name"])}<span>{e(dist_text(o))} from {e(AREAS[o["area"]]["label"])}</span></p>{icon("arrow")}</a>')
        more = f'<section class="more"><div class="wrap"><h2>More campsites</h2><div class="ml">{"".join(links)}</div></div></section>'

    title = f'{s["name"]}: camping for RIAT 2027 | The Big Guide to UK Airshows'
    if s["area"] == "fairford":
        title = f'{s["name"]}: camping around Fairford | The Big Guide to UK Airshows'
    desc = s.get("tagline") or f'{s["name"]}, a campsite {d} from {a["label"]}.'
    sample_bar = ('<div class="sample-bar">Sample page. This is not a real campsite: it shows owners what their listing will look like.</div>'
                  if s.get("sample") else "")
    h, t = home_href()
    checked = f'<b>Last checked</b> {e(s.get("checked"))}. ' if s.get("checked") else ""
    tick_bits = [x for x in (s["name"], f'{d} from {a["label"]}' if d else "", av[0] if av else "",
                             f"From {fp[1]} {fp[2]}" if fp else "") if x]
    tab_items = [("about", "c-sky", "About", "The site and photos"),
                 ("pitches", "c-green", "Pitches and prices", "Sizes, prices and dates"),
                 ("facilities", "c-purple", "Facilities", "On site, and the rules"),
                 ("getting-there", "c-red", "Getting to the show", "Pitch to the gate"),
                 ("book", "c-amber", "Book", "Direct with the site")]

    body = f"""{head(title, desc, SITE_CSS, SITE + s["wixPath"] if s.get("wixPath") else "")}
{sample_bar}
{top_bar()}
{site_strip(live if s in live else live + [s], s["slug"])}
<header class="hero"{hero_bg}>
  <div class="wrap hero-in">
    <p class="crumb"><a href="{SITE}{RIAT_WIX}" target="_top">RIAT</a><i>/</i><a href="{e(h)}" target="{t}">RIAT camping</a><i>/</i>{e(a["name"])}</p>
    <div class="tags"><span class="tagp">{e(a["long"])}</span>{avail_badge(s)}</div>
    <h1>{e(s["name"])}</h1>
    <p class="kindl">{e(s.get("kind"))}</p>
    <p class="lead">{e(s.get("tagline"))}</p>
    <div class="tiles">{t1}{t2}{t3}</div>
  </div>
</header>
<div class="under"><div class="wrap"><p>{checked}Details come from the campsite, so please check prices and dates with them before you book.</p></div></div>
{section_tabs(tab_items)}
<div class="ticker"><div class="wrap"><b>This campsite</b><span>{e(". ".join(tick_bits))}.</span></div></div>
<main>
<section class="panel" id="about" role="tabpanel" aria-labelledby="tab-about">
  <div class="wrap"><div class="sheet">
    {sign("c-sky", "tent", "About the site", a["long"])}
    <div class="sheet-in about"><div class="txt">{about}{owner}{facts_html}</div><div class="gal{" odd" if len(photos[:6]) >= 4 and len(photos[:6]) % 2 == 0 else ""}">{gal}</div></div>
  </div></div>
</section>
<section class="panel" id="pitches" role="tabpanel" aria-labelledby="tab-pitches" hidden>
  <div class="wrap"><div class="sheet">
    {sign("c-green", "tag", "Pitches and prices", "Show week 2027")}
    <div class="sheet-in">
      <p class="intro">Prices are for show week 2027, as given by the campsite. I would check the latest when you book.</p>
      <div class="pitches">{"".join(pitch_html) or "<p>Pitch details coming soon.</p>"}</div>
      {dates_html}
    </div>
  </div></div>
</section>
<section class="panel" id="facilities" role="tabpanel" aria-labelledby="tab-facilities" hidden>
  <div class="wrap"><div class="sheet">
    {sign("c-purple", "drop", "Facilities", "On site in show week")}
    <div class="sheet-in">
      <div class="facs">{"".join(groups) or "<p>Facility details coming soon.</p>"}</div>
      {rules}
    </div>
  </div></div>
</section>
<section class="panel" id="getting-there" role="tabpanel" aria-labelledby="tab-getting-there" hidden>
  <div class="wrap"><div class="sheet">
    {sign("c-red", "sign", "Getting to the show", a["label"])}
    <div class="sheet-in">
      <p class="intro">How to get from your pitch to the showground. RIAT's own travel plan for 2027 is still to be announced, so I would check back nearer the show.</p>
      <div class="getto">{ways}{where}</div>
    </div>
  </div></div>
</section>
<section class="panel" id="book" role="tabpanel" aria-labelledby="tab-book" hidden>
  <div class="wrap"><div class="sheet">
    {sign("c-amber", "cal", "Book your pitch", av[0] if av else "Direct with the campsite")}
    <div class="sheet-in book">
      <div class="bookbox"><div class="fh"><i>{icon("tent")}</i><div><b>Book with {e(s["name"])}</b><span>You book direct. The guide does not take bookings or payments.</span></div></div>
      <div class="acts">{"".join(acts)}</div></div>
      <div>{offer}{terms}</div>
    </div>
  </div></div>
</section>
</main>
{more}
{guides()}
{small_print()}
{TABS_JS}
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
