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
CSS = r"""
:root{--navy:#13293C;--navy-deep:#0E2131;--teal:#32B4AF;--teal-ink:#0E5F5B;--purple:#6950A1;--red:#D74949;
--mist:#F2F4F5;--ice:#E6F2F3;--line:#DDE3E8;--ink:#1B1B1B;--muted:#55626D;--ease:cubic-bezier(.22,.61,.36,1)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{scrollbar-width:none;-ms-overflow-style:none}
html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;width:0;height:0}
body{font:400 17px/1.6 "Barlow",system-ui,sans-serif;color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:1200px;margin:0 auto;padding:0 24px}
img{display:block;max-width:100%}
h1,h2,.cond{font-family:"Barlow Condensed","Barlow",sans-serif;text-transform:uppercase}
.tag{display:inline-block;background:var(--purple);color:#fff;font:600 15px/1 "Barlow",sans-serif;padding:8px 12px}
.crumb{font:500 15px/1.4 "Barlow",sans-serif;color:#C9D6E0;margin-bottom:14px}
.crumb a{color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.35)}
.crumb a:hover{border-color:var(--teal)}
.crumb span{margin:0 8px;color:var(--teal)}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.btn{display:inline-flex;align-items:center;gap:8px;font:600 16px/1 "Barlow",sans-serif;padding:14px 20px;text-decoration:none;border:2px solid transparent;cursor:pointer;transition:transform .3s var(--ease),background .3s var(--ease),color .3s var(--ease)}
.btn svg{width:18px;height:18px}
.btn:hover{transform:translateY(-2px)}
.btn.teal{background:var(--teal);color:var(--navy)}
.btn.navy{background:var(--navy);color:#fff}
.btn.red{background:var(--red);color:#fff}
.btn.outline{border-color:#fff;color:#fff}
.btn.outline:hover{background:#fff;color:var(--navy)}
.btn.line{border-color:var(--navy);color:var(--navy)}
.btn.line:hover{background:var(--navy);color:#fff}
.btn:focus-visible,a:focus-visible,button:focus-visible{outline:3px solid var(--teal);outline-offset:3px}

/* campsite tabs: one tab per campsite page */
.tabs{position:sticky;top:0;z-index:20;background:var(--navy-deep);border-bottom:4px solid var(--teal)}
.tabs .wrap{display:flex;align-items:stretch;gap:0;overflow-x:auto;scrollbar-width:none}
.tabs .wrap::-webkit-scrollbar{display:none}
.tab{flex:none;display:flex;align-items:center;gap:8px;padding:14px 18px;color:#C9D6E0;text-decoration:none;font:600 15px/1.2 "Barlow",sans-serif;border-right:1px solid rgba(255,255,255,.08);white-space:nowrap;transition:background .25s var(--ease),color .25s var(--ease)}
.tab svg{width:17px;height:17px;color:var(--teal)}
.tab:hover{background:rgba(50,180,175,.14);color:#fff}
.tab.on{background:var(--teal);color:var(--navy)}
.tab.on svg{color:var(--navy)}
.tab small{font-weight:500;opacity:.75}
.tab.add{color:#fff;background:var(--purple)}
.tab.add svg{color:#fff}
.tab.add:hover{background:#7a62b5}

.sec{padding:72px 0}
.sec.mist{background:var(--mist)}
.sec.ice{background:var(--ice)}
.sec-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:16px 48px;align-items:end;margin-bottom:32px}
.sec-head h2{font-weight:800;font-size:clamp(30px,4vw,44px);line-height:1;color:var(--red);padding-left:16px;border-left:5px solid var(--red)}
.sec-head p{max-width:58ch}

/* ring map */
.rmap{width:100%;height:auto;display:block;overflow:visible}
.rmap .ring{fill:none;stroke:var(--teal);stroke-opacity:.55;stroke-width:1.5;stroke-dasharray:5 7}
.rmap .rl{fill:var(--teal);font:500 13px "Barlow",sans-serif;text-anchor:middle}
.rmap .road{fill:none;stroke:#8C9DAD;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;opacity:.55}
.rmap .rdl{fill:#B9CAD8;font:600 12px "Barlow",sans-serif;text-anchor:middle}
.rmap .town{fill:#9FD9D6}
.rmap .tl{fill:#D6E2EA;font:500 14px "Barlow",sans-serif}
.rmap .runway{stroke:var(--teal);stroke-width:9;stroke-linecap:round}
.rmap .ctr{fill:none;stroke:#fff;stroke-width:3}
.rmap .ctr-dot{fill:#fff}
.rmap .cl{fill:#fff;font:700 15px "Barlow",sans-serif}
.rmap .mk circle{fill:var(--navy-deep);stroke:#fff;stroke-width:2.5;transition:fill .25s}
.rmap .mk path{fill:none;stroke:#fff;stroke-width:2;stroke-linejoin:round}
.rmap a.mk:hover circle,.rmap .mk.on circle{fill:var(--red)}
.rmap .mk.ghost circle{fill:none;stroke-dasharray:4 4;stroke:#9FD9D6}
.rmap .mk.ghost path{stroke:#9FD9D6}
.rmap .ghost-l{fill:#9FD9D6;font:600 14px "Barlow",sans-serif}
.light .rmap .tl{fill:var(--navy)}
.light .rmap .cl{fill:var(--navy)}
.light .rmap .ctr{stroke:var(--navy)}
.light .rmap .ctr-dot{fill:var(--navy)}
.light .rmap .town{fill:var(--teal-ink)}
.light .rmap .rdl{fill:var(--muted)}
.light .rmap .mk circle{fill:var(--navy)}

.reveal{opacity:0;transform:translateY(16px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
.reveal.in{opacity:1;transform:none}
.small{background:var(--navy-deep);color:#AFC0CD;font-size:14px;line-height:22px;padding:24px 0}
.small p+p{margin-top:8px}
.small a{color:#fff}
.sample-bar{background:#FFE9A8;color:#4A3B00;font:600 15px/1.4 "Barlow",sans-serif;text-align:center;padding:10px 18px;border-bottom:2px solid #E2C35A}
@media (max-width:720px){
  .wrap{padding:0 18px}
  .sec{padding:52px 0}
  .sec-head{grid-template-columns:1fr}
  .btn{flex:1 1 auto;justify-content:center}
}
@media (prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .btn,.tab{transition:none}
}
"""

REVEAL_JS = """<script>
(function(){var els=document.querySelectorAll('.reveal');
if(!('IntersectionObserver' in window)){els.forEach(function(x){x.classList.add('in')});return}
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -40px 0px'});
els.forEach(function(x){io.observe(x)});setTimeout(function(){els.forEach(function(x){x.classList.add('in')})},2500)})();
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


def tabs(live, current=None):
    h, t = home_href()
    on = " on" if current == "home" else ""
    out = ['<nav class="tabs" aria-label="RIAT campsites"><div class="wrap">',
           f'<a class="tab{on}" href="{e(h)}" target="{t}"{" aria-current=page" if on else ""}>{icon("tent")}RIAT camping</a>']
    for s in live:
        href, tgt = page_href(s)
        on = " on" if current == s["slug"] else ""
        cur = ' aria-current="page"' if on else ""
        out.append(f'<a class="tab{on}" href="{e(href)}" target="{tgt}"{cur} data-area="{e(s["area"])}">{e(s["name"])} '
                   f'<small>{e(dist_text(s))}</small></a>')
    out.append(f'<a class="tab add" href="{e(home_href()[0])}#list" target="{home_href()[1]}">{icon("plus")}List your campsite</a>')
    out.append('</div></nav>')
    return "".join(out)


def small_print(extra=""):
    return f"""<footer class="small"><div class="wrap">
<p>The Big Guide to UK Airshows is independent and not part of the Royal International Air Tattoo. Campsite details come from the owners. Please check prices, dates and rules with the campsite before you book.</p>
{extra}<p>Running a campsite near Boscombe Down or Fairford? Email <a href="mailto:{CONTACT}?subject=RIAT%20campsite%20listing">{CONTACT}</a>.</p>
</div></footer>"""


def mailto(subject="RIAT campsite listing"):
    return f"mailto:{CONTACT}?subject=" + subject.replace(" ", "%20")


# ---------------------------------------------------------------- home page
HOME_CSS = r"""
.hero{background:var(--navy);color:#fff;overflow:hidden;position:relative}
.hero::before{content:"";position:absolute;inset:auto -10% -40% auto;width:60%;height:80%;background:radial-gradient(closest-side,rgba(50,180,175,.10),transparent);pointer-events:none}
.hero-in{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr);gap:40px;align-items:center;padding:56px 0 64px}
.hero h1{font-weight:800;font-size:clamp(44px,7vw,86px);line-height:.95;margin-top:18px}
.hero h1 em{font-style:normal;color:var(--teal);display:block}
.hero .lead{margin-top:20px;max-width:58ch;color:#E3EAF0;font-size:18px;line-height:28px}
.hero .lead b{color:#fff}
.hero-map{position:relative}
.hero-map .rmap{max-width:480px;margin-left:auto}
.yr{display:flex;align-items:center;gap:18px;margin-top:26px;background:var(--teal);color:var(--navy);padding:16px 20px;max-width:520px}
.yr b{font:800 44px/1 "Barlow Condensed",sans-serif}
.yr span{font:600 16px/1.35 "Barlow",sans-serif}

.filter{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
.filter button{font:600 15px/1 "Barlow",sans-serif;padding:11px 16px;border:2px solid var(--navy);background:#fff;color:var(--navy);cursor:pointer}
.filter button[aria-pressed=true]{background:var(--navy);color:#fff}
.sites{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.site{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);text-decoration:none;color:inherit;transition:transform .35s var(--ease),box-shadow .35s var(--ease)}
.site:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(11,26,39,.12)}
.site .ph{position:relative;aspect-ratio:16/10;overflow:hidden;background:var(--navy)}
.site .ph img{width:100%;height:100%;object-fit:cover}
.site .dist{position:absolute;left:0;bottom:0;background:var(--teal);color:var(--navy);font:700 15px/1 "Barlow",sans-serif;padding:9px 12px}
.site .bd{padding:18px 20px 20px;display:flex;flex-direction:column;gap:8px;flex:1}
.site .kd{font:600 14px/1 "Barlow",sans-serif;color:var(--purple);text-transform:uppercase;letter-spacing:.04em}
.site h3{font:700 22px/1.2 "Barlow",sans-serif;color:var(--navy)}
.site p{font-size:16px;line-height:24px}
.site ul{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.site li{background:var(--mist);font:600 13px/1 "Barlow",sans-serif;padding:7px 9px;color:var(--navy)}
.site .ft{margin-top:auto;padding-top:12px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);font-weight:700;color:var(--navy)}
.site .ft svg{width:20px;height:20px;color:var(--red)}
.empty{grid-column:1/-1;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:20px;align-items:center;background:#fff;border:2px dashed #B9CAD8;padding:24px}
.empty .ic{width:56px;height:56px;border-radius:50%;background:var(--navy);color:var(--teal);display:grid;place-items:center}
.empty .ic svg{width:26px;height:26px}
.empty h3{font:700 21px/1.2 "Barlow",sans-serif;color:var(--navy)}
.empty p{font-size:16px;line-height:24px;margin-top:4px}

.official{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;margin-top:28px;background:var(--navy);color:#fff;padding:22px 24px;border-left:6px solid var(--teal)}
.official b{color:var(--teal)}
.official p{font-size:16px;line-height:25px;color:#E3EAF0}

.maps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.mapbox{background:var(--navy);color:#fff;padding:22px}
.mapbox h3{font:800 26px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;color:var(--teal)}
.mapbox p{font-size:15px;line-height:22px;color:#C9D6E0;margin:6px 0 10px}

.get{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px;margin-top:8px}
.get div{display:grid;grid-template-columns:60px minmax(0,1fr);gap:16px;align-items:center;padding:18px 0;border-bottom:1px solid #C9D6E0}
.get i{width:56px;height:56px;border-radius:50%;background:var(--navy);color:var(--teal);display:grid;place-items:center}
.get i svg{width:24px;height:24px}
.get b{display:block;font:700 19px/1.2 "Barlow",sans-serif;color:var(--navy)}
.get span{color:var(--muted);font-size:16px}
.who{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:36px}
.who article{background:#fff;padding:22px;border-top:6px solid var(--navy)}
.who article:nth-child(2){border-top-color:var(--purple)}
.who article:nth-child(3){border-top-color:var(--red)}
.who h3{display:flex;gap:10px;align-items:center;font:800 24px/1.05 "Barlow Condensed",sans-serif;text-transform:uppercase;color:var(--navy)}
.who h3 svg{width:28px;height:28px;flex:none;color:var(--navy)}
.who article:nth-child(2) h3 svg{color:var(--purple)}
.who article:nth-child(3) h3 svg{color:var(--red)}
.who p{margin-top:10px;font-size:16px;line-height:25px}
.quote{margin-top:36px;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:28px;align-items:stretch}
.quote blockquote{background:var(--navy);color:#fff;padding:28px;font:600 22px/1.35 "Barlow",sans-serif}
.quote blockquote::before{content:"";display:block;width:44px;height:5px;background:var(--teal);margin-bottom:16px}
.quote blockquote cite{display:block;margin-top:14px;font:600 15px/1.3 "Barlow",sans-serif;font-style:normal;color:var(--teal)}
.quote .ask{background:#fff;padding:24px;border:1px solid var(--line)}
.quote .ask b{display:block;font:700 19px/1.2 "Barlow",sans-serif;color:var(--navy);margin-bottom:8px}
.quote .ask p{font-size:16px;line-height:25px}
.quote .ask .btns{margin-top:16px}

@media (max-width:1000px){
  .hero-in{grid-template-columns:1fr}
  .hero-map .rmap{margin:0 auto;max-width:420px}
  .sites,.who{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:720px){
  .sites,.who,.maps,.get,.quote{grid-template-columns:1fr}
  .empty,.official{grid-template-columns:1fr}
  .hero-in{padding:40px 0 48px}
}
"""


def site_card(s):
    href, tgt = page_href(s)
    ph = s["photos"][0] if s.get("photos") else None
    img = f'<img src="{e(ph["src"])}" alt="{e(ph.get("alt"))}" loading="lazy" decoding="async">' if ph else ""
    d = dist_text(s)
    dist_html = f'<span class="dist">{e(d)} from {e(AREAS[s["area"]]["label"])}</span>' if d else ""
    chips = []
    for k in FAC_SHORT:
        ok, _ = fac_state(s.get("facilities", {}).get(k))
        if ok:
            chips.append(dict(sum((g[1] for g in FAC_GROUPS), []))[k])
    kinds = sorted({p.get("kind") for p in s.get("pitches", []) if p.get("kind") in KINDS}, key=list(KINDS).index)
    chips = [KINDS[k] for k in kinds] + chips
    fp = from_price(s)
    price = f'From {e(fp[1])} {e(fp[2])}' if fp else "See prices"
    return (f'<a class="site reveal" href="{e(href)}" target="{tgt}" data-area="{e(s["area"])}">'
            f'<div class="ph">{img}{dist_html}</div><div class="bd">'
            f'<span class="kd">{e(s.get("kind"))}</span><h3>{e(s["name"])}</h3><p>{e(s.get("tagline"))}</p>'
            f'<ul>{"".join("<li>" + e(c) + "</li>" for c in chips[:6])}</ul>'
            f'<div class="ft"><span>{price}</span><span>View campsite {icon("arrow")}</span></div></div></a>')


def empty_card(area_key=None):
    where = {"boscombe": "near Boscombe Down", "fairford": "around Fairford"}.get(area_key, "near the show")
    return (f'<div class="empty reveal" data-area="{area_key or "all"}"><span class="ic">{icon("tent")}</span><div>'
            f'<h3>No campsites listed {e(where)} yet</h3>'
            f'<p>I am adding campsites as owners get in touch. If you run one, I would love to hear from you.</p></div>'
            f'<a class="btn navy" href="#list">List your campsite</a></div>')


def build_home(live):
    cards = []
    for key in AREAS:
        group = sorted([s for s in live if s["area"] == key], key=lambda s: dist(s) or 99)
        cards += [site_card(s) for s in group] or [empty_card(key)]
    h_title = "RIAT camping: campsites near Boscombe Down and Fairford | The Big Guide to UK Airshows"
    desc = ("Campsites near MOD Boscombe Down for the Royal International Air Tattoo 2027, and campsites around Fairford. "
            "Pitches, prices, facilities and how to get to the show.")
    n = len(live)
    count = f"{n} campsite{'s' if n != 1 else ''} listed" if n else "Listings opening now"
    sample_href = GH + "sample.html"
    body = f"""{head(h_title, desc, HOME_CSS, SITE + HOME_WIX if HOME_WIX else "")}
<header class="hero">
  <div class="wrap hero-in">
    <div>
      <p class="crumb"><a href="{SITE}{RIAT_WIX}" target="_top">Royal International Air Tattoo</a><span>/</span>Camping</p>
      <span class="tag">Campsites near the show</span>
      <h1>RIAT camping <em>near Boscombe Down</em></h1>
      <p class="lead">From 2027 the Air Tattoo moves to <b>MOD Boscombe Down</b>, and a lot of visitors will be looking for somewhere to pitch up nearby. This is where I list the campsites around the new showground, plus the ones still running <b>around Fairford</b>. Pick a campsite tab for its pitches, prices, facilities and how to get to the show.</p>
      <div class="btns">
        <a class="btn teal" href="#sites">See the campsites</a>
        <a class="btn outline" href="#list">List your campsite</a>
      </div>
      <div class="yr"><b>2027</b><span>The Royal International Air Tattoo, 16 to 18 July, at MOD Boscombe Down. {e(count)}.</span></div>
    </div>
    <div class="hero-map">{ring_map("boscombe", live)}</div>
  </div>
</header>
{tabs(live, "home")}
<main>
<section class="sec" id="sites" aria-labelledby="sites-h">
  <div class="wrap">
    <div class="sec-head reveal">
      <h2 id="sites-h">Campsites</h2>
      <p>Every campsite has its own page with pitch sizes and prices, facilities, rules and the best way to the showground. Distances are as the crow flies from the airfield.</p>
    </div>
    <div class="filter" role="group" aria-label="Show campsites">
      <button type="button" data-f="all" aria-pressed="true">All campsites</button>
      <button type="button" data-f="boscombe" aria-pressed="false">Near Boscombe Down</button>
      <button type="button" data-f="fairford" aria-pressed="false">Around Fairford</button>
    </div>
    <div class="sites">{"".join(cards)}</div>
    <div class="official reveal">
      <p><b>The official RIAT campsite.</b> RIAT has its own campsite beside the airfield at Boscombe Down, and rollover bookings get first pick. Its details are on the Air Tattoo website. The campsites on this page are run independently by local owners.</p>
      <a class="btn teal" href="{OFFICIAL_CAMPING}" target="_blank" rel="noopener">Official camping</a>
    </div>
  </div>
</section>

<section class="sec mist" id="map" aria-labelledby="map-h">
  <div class="wrap">
    <div class="sec-head reveal">
      <h2 id="map-h">On the show map</h2>
      <p>Tap a tent to open that campsite. The rings are 5 and 10 miles from the airfield.</p>
    </div>
    <div class="maps">
      <div class="mapbox reveal"><h3>Near Boscombe Down</h3><p>{e(AREAS["boscombe"]["blurb"])}</p>{ring_map("boscombe", live)}</div>
      <div class="mapbox reveal"><h3>Around Fairford</h3><p>{e(AREAS["fairford"]["blurb"])}</p>{ring_map("fairford", live)}</div>
    </div>
  </div>
</section>

<section class="sec ice" id="list" aria-labelledby="list-h">
  <div class="wrap">
    <div class="sec-head reveal">
      <h2 id="list-h">Running a campsite near Boscombe Down?</h2>
      <p>If you are opening a campsite for the show, or you already run one in the area, I would love to hear from you. Still running a campsite around Fairford? I want to work with you too. Get in touch and I will add you to these pages.</p>
    </div>
    <div class="get">
      <div class="reveal"><i>{icon("tent")}</i><p><b>A listing on the guide</b><span>Your own page on the RIAT camping pages</span></p></div>
      <div class="reveal"><i>{icon("sign")}</i><p><b>On the show map</b><span>Distance to the show and how to get in</span></p></div>
      <div class="reveal"><i>{icon("fire")}</i><p><b>Seen by people planning</b><span>Families, photographers and first timers</span></p></div>
      <div class="reveal"><i>{icon("share")}</i><p><b>Shared on our socials</b><span>Over 12,000 airshow followers</span></p></div>
    </div>
    <div class="who">
      <article class="reveal"><h3>{icon("tent")}Opening a new site</h3><p>Setting up a field for show week? Tell me early, so visitors can find you when they plan their trip.</p></article>
      <article class="reveal"><h3>{icon("caravan")}Already running one</h3><p>Caravan park, farm site or glamping nearby. Show week is a big week for you too.</p></article>
      <article class="reveal"><h3>{icon("van")}Campervans and tourers</h3><p>Hardstanding or hook ups? Visitors ask for these, so make sure they are on your page.</p></article>
    </div>
    <div class="quote">
      <blockquote class="reveal">I would like to work with you and add your site to the website.<cite>Jack Skedge, Founder and Managing Editor</cite></blockquote>
      <div class="ask reveal">
        <b>What happens next</b>
        <p>Email me and I will send over a short list of questions: your pitches and prices, facilities, dates and how visitors get to the show. Send a few photos and I will build your page and check it with you before it goes live.</p>
        <div class="btns">
          <a class="btn red" href="{mailto()}">{icon("mail")}Email me</a>
          <a class="btn line" href="{sample_href}" target="_blank" rel="noopener">See a sample page</a>
        </div>
      </div>
    </div>
  </div>
</section>
</main>
{small_print()}
<script>
(function(){{var bs=document.querySelectorAll('.filter button'),items=document.querySelectorAll('.sites [data-area]');
bs.forEach(function(b){{b.addEventListener('click',function(){{var f=b.getAttribute('data-f');
bs.forEach(function(x){{x.setAttribute('aria-pressed',x===b?'true':'false')}});
items.forEach(function(it){{it.style.display=(f==='all'||it.getAttribute('data-area')===f)?'':'none'}})}})}})}})();
</script>
{REVEAL_JS}
</body>
</html>
"""
    (OUT / "index.html").write_text(body, encoding="utf-8")


# ---------------------------------------------------------------- campsite page
SITE_CSS = r"""
.hero{position:relative;background:var(--navy);color:#fff;overflow:hidden}
.hero-photo{position:relative;height:clamp(240px,46vh,460px);overflow:hidden}
.hero-photo img{width:100%;height:100%;object-fit:cover;object-position:50% 50%}
.hero-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(19,41,60,0) 35%,rgba(19,41,60,.65) 75%,var(--navy) 100%),linear-gradient(90deg,rgba(19,41,60,.55),rgba(19,41,60,0) 60%)}
.hero-body{position:relative;margin-top:-110px;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(300px,1fr);gap:40px;align-items:end;padding-bottom:48px}
.hero h1{font-weight:800;font-size:clamp(38px,6vw,68px);line-height:.98;margin-top:14px}
.kind{font:700 16px/1.4 "Barlow",sans-serif;color:var(--teal);text-transform:uppercase;letter-spacing:.04em;margin-top:12px}
.lead{margin-top:14px;max-width:60ch;color:#E3EAF0;font-size:18px;line-height:28px}
.glass{background:rgba(14,33,49,.92);border-top:4px solid var(--teal);box-shadow:0 20px 40px rgba(0,0,0,.28)}
.glass h2{font:700 20px/1 "Barlow",sans-serif;text-transform:uppercase;letter-spacing:.03em;color:var(--teal);padding:18px 20px 12px}
.rows{padding:0 20px 20px;display:grid;gap:4px}
.row{display:grid;grid-template-columns:110px minmax(0,1fr);gap:12px;padding:10px 12px;background:rgba(255,255,255,.04)}
.row dt{color:#9FD9D6;font-weight:500}
.row dd{color:#fff;font-weight:700}
.row.hl{background:var(--red)}
.row.hl dt{color:#fff}

.sub{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:53px;z-index:15}
.sub .wrap{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}
.sub .wrap::-webkit-scrollbar{display:none}
.sub a{flex:none;padding:14px 14px;font:600 15px/1 "Barlow",sans-serif;color:var(--navy);text-decoration:none;border-bottom:3px solid transparent}
.sub a:hover,.sub a.on{border-bottom-color:var(--red);color:var(--red)}

.about{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;align-items:start}
.about .txt p+p{margin-top:14px}
.owner{margin-top:22px;background:var(--navy);color:#fff;padding:22px 24px;font:600 19px/1.4 "Barlow",sans-serif}
.owner::before{content:"";display:block;width:40px;height:5px;background:var(--teal);margin-bottom:12px}
.owner cite{display:block;margin-top:10px;font:600 15px/1.3 "Barlow",sans-serif;font-style:normal;color:var(--teal)}
.gal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gal figure:first-child{grid-column:1/-1}
.gal img{width:100%;aspect-ratio:4/3;object-fit:cover}
.gal figure:first-child img{aspect-ratio:16/9}
.gal figcaption{font:500 13px/1.35 "Barlow",sans-serif;color:var(--muted);margin-top:4px}

.pitches{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.pitch{background:#fff;border:1px solid var(--line);border-top:5px solid var(--teal);padding:20px;display:flex;flex-direction:column;gap:6px}
.pitch.k-van{border-top-color:var(--purple)}
.pitch.k-caravan{border-top-color:var(--navy)}
.pitch.k-glamping{border-top-color:var(--red)}
.pitch .pi{width:44px;height:44px;border-radius:50%;background:var(--navy);color:var(--teal);display:grid;place-items:center;margin-bottom:6px}
.pitch .pi svg{width:22px;height:22px}
.pitch h3{font:700 20px/1.2 "Barlow",sans-serif;color:var(--navy)}
.pitch .pr{font:800 34px/1 "Barlow Condensed",sans-serif;color:var(--navy)}
.pitch .pr small{font:600 15px/1 "Barlow",sans-serif;color:var(--muted);margin-left:6px}
.pitch dl{display:grid;gap:4px;font-size:15px;line-height:22px;margin-top:6px}
.pitch dl div{display:grid;grid-template-columns:72px minmax(0,1fr);gap:8px;border-top:1px solid var(--line);padding-top:6px}
.pitch dt{color:var(--muted)}
.pitch dd{font-weight:600}
.dates{margin-top:20px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;background:var(--line);border:1px solid var(--line)}
.dates div{background:#fff;padding:14px 16px}
.dates dt{font:600 13px/1 "Barlow",sans-serif;text-transform:uppercase;letter-spacing:.04em;color:var(--purple)}
.dates dd{font-weight:700;color:var(--navy);margin-top:6px}

.facs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.fg{background:#fff;border:1px solid var(--line)}
.fg h3{background:var(--navy);color:#fff;font:700 16px/1.2 "Barlow",sans-serif;text-transform:uppercase;letter-spacing:.03em;padding:12px 16px}
.fg ul{list-style:none}
.fg li{display:grid;grid-template-columns:24px minmax(0,1fr);gap:10px;padding:10px 16px;border-top:1px solid var(--line);font-size:15px;line-height:21px}
.fg li:first-child{border-top:0}
.fg li svg{width:20px;height:20px;margin-top:1px}
.fg li.y svg{color:var(--teal-ink)}
.fg li.n{color:#8A96A0}
.fg li.n svg{color:#B3BDC5}
.fg li b{display:block;font-weight:600}
.fg li small{display:block;color:var(--muted);font-size:14px}

.getto{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.9fr);gap:28px;align-items:start}
.ways{display:grid;gap:10px}
.way{display:grid;grid-template-columns:52px minmax(0,1fr);background:#fff;border:1px solid var(--line)}
.way i{background:var(--teal);color:#fff;display:grid;place-items:center}
.way i svg{width:24px;height:24px}
.way div{padding:14px 16px}
.way b{display:block;color:var(--navy);font-weight:700}
.way p{font-size:16px;line-height:24px}
.where{background:var(--navy);color:#fff;padding:20px}
.where .big{display:flex;align-items:baseline;gap:10px;font:800 46px/1 "Barlow Condensed",sans-serif;color:var(--teal)}
.where .big span{font:600 16px/1.2 "Barlow",sans-serif;color:#C9D6E0}
.where address{font-style:normal;color:#E3EAF0;margin:8px 0 6px;font-size:16px;line-height:24px}
.where .lk{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 12px}
.where .lk a{font:600 14px/1 "Barlow",sans-serif;padding:9px 11px;background:rgba(255,255,255,.08);text-decoration:none}
.where .lk a:hover{background:rgba(50,180,175,.25)}

.gtk{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 32px}
.gtk div{padding:16px 0;border-bottom:1px solid var(--line)}
.gtk dt{font:700 17px/1.2 "Barlow",sans-serif;color:var(--navy)}
.gtk dd{margin-top:4px;font-size:16px;line-height:24px}

.book{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:28px;align-items:start}
.book .acts{display:grid;gap:10px}
.book .acts .btn{justify-content:flex-start}
.offer{background:var(--red);color:#fff;padding:20px 22px;font-weight:600}
.offer b{display:block;font:800 24px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin-bottom:6px}
.terms{margin-top:14px;background:#fff;border:1px solid var(--line)}
.terms div{display:grid;grid-template-columns:120px minmax(0,1fr);gap:12px;padding:12px 16px;border-top:1px solid var(--line)}
.terms div:first-child{border-top:0}
.terms dt{color:var(--muted)}
.terms dd{font-weight:600}
.others{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:8px}
.others a{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;background:var(--navy);color:#fff;text-decoration:none;padding:14px 16px;border-bottom:4px solid var(--teal);font-weight:700}
.others a span{display:block;font:500 14px/1.3 "Barlow",sans-serif;color:#B9CAD8}
.others a svg{width:20px;height:20px}
.others a:hover{border-bottom-color:var(--red)}

@media (max-width:1000px){
  .hero-body{grid-template-columns:1fr;gap:28px;margin-top:-80px}
  .facs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .dates{grid-template-columns:repeat(3,minmax(0,1fr))}
  .about,.getto,.book{grid-template-columns:1fr}
}
@media (max-width:720px){
  .hero-photo{height:clamp(240px,60vw,340px)}
  .hero-body{margin-top:-24px;padding-bottom:36px}
  .facs,.gtk{grid-template-columns:1fr}
  .dates{grid-template-columns:repeat(2,minmax(0,1fr))}
  .row{grid-template-columns:96px minmax(0,1fr)}
  .sub{top:49px}
}
"""


def build_site(s, live):
    a = AREAS[s["area"]]
    photos = s.get("photos") or []
    hero_img = (f'<div class="hero-photo"><img src="{e(photos[0]["src"])}" alt="{e(photos[0].get("alt"))}" decoding="async"></div>'
                if photos else '<div class="hero-photo" style="height:160px"></div>')
    d = dist_text(s)
    fp = from_price(s)
    ts = s.get("toShow", {})
    dates = s.get("dates", {})
    bk = s.get("booking", {})

    rows = []
    if d:
        rows.append(("Distance", f"{d} from {a['label']}", True))
    if ts.get("driveMins"):
        rows.append(("Drive", ts["driveMins"], False))
    if dates.get("open") or dates.get("close"):
        rows.append(("Open", " to ".join(x for x in (dates.get("open"), dates.get("close")) if x), False))
    if fp:
        rows.append(("Pitches", f"From {fp[1]} {fp[2]}", False))
    if ts.get("shuttle"):
        rows.append(("Shuttle", "Yes, see Getting to the show", False))
    if bk.get("opens"):
        rows.append(("Booking", bk["opens"], False))
    rows_html = "".join(f'<div class="row{" hl" if hl else ""}"><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v, hl in rows)

    # about + gallery
    about = "".join(f"<p>{e(p)}</p>" for p in s.get("about", []) if p)
    ow = s.get("owner", {})
    owner = (f'<blockquote class="owner">{e(ow["quote"])}<cite>{e(ow.get("name"))}{", " + e(ow.get("role")) if ow.get("role") else ""}</cite></blockquote>'
             if ow.get("quote") else "")
    gal = "".join(f'<figure><img src="{e(p["src"])}" alt="{e(p.get("alt"))}" loading="lazy" decoding="async">'
                  f'{"<figcaption>" + e(p["caption"]) + "</figcaption>" if p.get("caption") else ""}</figure>'
                  for p in photos[:6])

    # pitches
    kind_icon = {"tent": "tent", "van": "van", "caravan": "caravan", "glamping": "glamping"}
    pitch_html = []
    for p in s.get("pitches", []):
        k = p.get("kind") if p.get("kind") in kind_icon else "tent"
        dl = "".join(f"<div><dt>{lab}</dt><dd>{e(p.get(key))}</dd></div>"
                     for lab, key in (("Size", "size"), ("Includes", "includes"), ("Note", "note")) if p.get(key))
        price = f'<span class="pr">{e(p.get("price"))}<small>{e(p.get("per"))}</small></span>' if p.get("price") else ""
        pitch_html.append(f'<article class="pitch k-{k} reveal"><span class="pi">{icon(kind_icon[k])}</span>'
                          f'<h3>{e(p.get("name"))}</h3>{price}<dl>{dl}</dl></article>')
    date_rows = [("Opens", dates.get("open")), ("Closes", dates.get("close")), ("Minimum stay", dates.get("minNights")),
                 ("Arrive", dates.get("arrive")), ("Leave", dates.get("leave"))]
    dates_html = "".join(f"<div><dt>{k}</dt><dd>{e(v)}</dd></div>" for k, v in date_rows if v)
    dates_html = f'<dl class="dates reveal">{dates_html}</dl>' if dates_html else ""

    # facilities
    fac = s.get("facilities", {})
    groups = []
    for title, items in FAC_GROUPS:
        lis = []
        for key, label in items:
            ok, note = fac_state(fac.get(key))
            if ok is None:
                continue
            ic = icon("tick") if ok else icon("cross")
            nt = f"<small>{e(note)}</small>" if note else ("<small>Not available</small>" if not ok else "")
            lis.append(f'<li class="{"y" if ok else "n"}">{ic}<span><b>{e(label)}</b>{nt}</span></li>')
        if lis:
            groups.append(f'<div class="fg reveal"><h3>{e(title)}</h3><ul>{"".join(lis)}</ul></div>')

    # getting to the show
    way_defs = [("driveMins", "car", "Driving"), ("shuttle", "bus", "Shuttle"), ("walk", "walk", "Walking"),
                ("taxi", "taxi", "Taxi"), ("parking", "park", "Your car")]
    ways = "".join(f'<div class="way reveal"><i>{icon(ic)}</i><div><b>{lab}</b><p>{e(ts[key])}</p></div></div>'
                   for key, ic, lab in way_defs if ts.get(key))
    lk = []
    if has_pos(s):
        lk.append(f'<a href="https://www.google.com/maps/dir/?api=1&amp;destination={s["lat"]},{s["lng"]}" target="_blank" rel="noopener">Directions</a>')
    if s.get("what3words"):
        lk.append(f'<a href="https://what3words.com/{e(s["what3words"].lstrip("/"))}" target="_blank" rel="noopener">///{e(s["what3words"].lstrip("/"))}</a>')
    addr = ", ".join(x for x in (s.get("address"), s.get("postcode")) if x)
    big = f'<p class="big">{e(d)}<span>from {e(a["label"])}, as the crow flies</span></p>' if d else ""
    where = (f'<div class="where reveal">{big}<address>{e(addr)}</address>'
             f'<div class="lk">{"".join(lk)}</div>{ring_map(s["area"], [s], s["slug"])}</div>')

    # good to know
    gtk = "".join(f"<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k, v in s.get("goodToKnow", []) if v)

    # booking
    acts = []
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
    if not acts:
        acts.append('<p>Booking details coming soon.</p>')
    offer = (f'<div class="offer reveal"><b>Guide reader offer</b>{e(bk["offer"])}</div>' if bk.get("offer") else "")
    terms = "".join(f"<div><dt>{k}</dt><dd>{e(bk.get(key))}</dd></div>"
                    for k, key in (("Booking", "opens"), ("Payment", "deposit"), ("Cancellation", "cancellation")) if bk.get(key))
    terms = f'<dl class="terms reveal">{terms}</dl>' if terms else ""

    others = [o for o in live if o["slug"] != s["slug"]]
    others_html = ""
    if others:
        links = []
        for o in sorted(others, key=lambda o: (o["area"] != s["area"], dist(o) or 99))[:6]:
            href, tgt = page_href(o)
            links.append(f'<a href="{e(href)}" target="{tgt}"><p>{e(o["name"])}<span>{e(dist_text(o))} from {e(AREAS[o["area"]]["label"])}</span></p>{icon("arrow")}</a>')
        others_html = f'<h3 class="cond" style="font-size:26px;color:var(--navy);margin:36px 0 4px">More campsites</h3><div class="others">{"".join(links)}</div>'

    sub = [("about", "About"), ("pitches", "Pitches and prices"), ("facilities", "Facilities"),
           ("getting-there", "Getting to the show"), ("good-to-know", "Good to know"), ("book", "Book")]
    if not gtk:
        sub = [x for x in sub if x[0] != "good-to-know"]
    sub_html = "".join(f'<a href="#{k}">{v}</a>' for k, v in sub)

    title = f'{s["name"]}: camping for RIAT 2027 | The Big Guide to UK Airshows'
    if s["area"] == "fairford":
        title = f'{s["name"]}: camping around Fairford | The Big Guide to UK Airshows'
    desc = s.get("tagline") or f'{s["name"]}, a campsite {d} from {a["label"]}.'
    sample_bar = ('<div class="sample-bar">Sample page. This is not a real campsite: it shows owners what their listing will look like.</div>'
                  if s.get("sample") else "")
    h, t = home_href()
    checked = f'<p>Details from {e(s["name"])}, last checked {e(s.get("checked"))}.</p>' if s.get("checked") else ""

    body = f"""{head(title, desc, SITE_CSS, SITE + s["wixPath"] if s.get("wixPath") else "")}
{sample_bar}
<header class="hero">
  {hero_img}
  <div class="wrap hero-body">
    <div>
      <p class="crumb"><a href="{SITE}{RIAT_WIX}" target="_top">RIAT</a><span>/</span><a href="{e(h)}" target="{t}">RIAT camping</a><span>/</span>{e(a["name"])}</p>
      <span class="tag">{e(a["long"])}</span>
      <h1>{e(s["name"])}</h1>
      <p class="kind">{e(s.get("kind"))}</p>
      <p class="lead">{e(s.get("tagline"))}</p>
      <div class="btns">
        <a class="btn teal" href="#book">How to book</a>
        <a class="btn outline" href="#getting-there">Getting to the show</a>
      </div>
    </div>
    <aside class="glass" aria-labelledby="kd"><h2 id="kd">Key details</h2><dl class="rows">{rows_html}</dl></aside>
  </div>
</header>
{tabs(live if s in live else live + [s], s["slug"])}
<nav class="sub" aria-label="On this page"><div class="wrap">{sub_html}</div></nav>
<main>
<section class="sec" id="about" aria-labelledby="about-h">
  <div class="wrap">
    <div class="sec-head reveal"><h2 id="about-h">About the site</h2><p>{e(s.get("kind"))}, {e(d + " from " + a["label"]) if d else e(a["long"])}.</p></div>
    <div class="about"><div class="txt reveal">{about}{owner}</div><div class="gal reveal">{gal}</div></div>
  </div>
</section>
<section class="sec mist" id="pitches" aria-labelledby="pitches-h">
  <div class="wrap">
    <div class="sec-head reveal"><h2 id="pitches-h">Pitches and prices</h2><p>Prices are for show week 2027, as given by the campsite. Check the latest when you book.</p></div>
    <div class="pitches">{"".join(pitch_html) or "<p>Pitch details coming soon.</p>"}</div>
    {dates_html}
  </div>
</section>
<section class="sec" id="facilities" aria-labelledby="fac-h">
  <div class="wrap">
    <div class="sec-head reveal"><h2 id="fac-h">Facilities</h2><p>What is on site during show week.</p></div>
    <div class="facs">{"".join(groups) or "<p>Facility details coming soon.</p>"}</div>
  </div>
</section>
<section class="sec ice" id="getting-there" aria-labelledby="gt-h">
  <div class="wrap">
    <div class="sec-head reveal"><h2 id="gt-h">Getting to the show</h2><p>How to get from your pitch to the showground at {e(a["label"])}. RIAT's own travel plan for 2027 is still to be announced.</p></div>
    <div class="getto"><div class="ways">{ways or "<p>Travel details coming soon.</p>"}</div>{where}</div>
  </div>
</section>
{f'''<section class="sec" id="good-to-know" aria-labelledby="gtk-h">
  <div class="wrap">
    <div class="sec-head reveal"><h2 id="gtk-h">Good to know</h2><p>Site rules and the things visitors usually ask.</p></div>
    <dl class="gtk reveal">{gtk}</dl>
  </div>
</section>''' if gtk else ""}
<section class="sec mist" id="book" aria-labelledby="book-h">
  <div class="wrap">
    <div class="sec-head reveal"><h2 id="book-h">Book</h2><p>You book directly with the campsite. The guide does not take bookings or payments.</p></div>
    <div class="book"><div class="acts reveal">{"".join(acts)}</div><div>{offer}{terms}</div></div>
    {others_html}
  </div>
</section>
</main>
{small_print(checked)}
<script>
(function(){{var ls=document.querySelectorAll('.sub a'),ids=[].map.call(ls,function(a){{return a.getAttribute('href').slice(1)}});
function f(){{var y=window.scrollY+140,cur=ids[0];ids.forEach(function(id){{var el=document.getElementById(id);if(el&&el.offsetTop<=y)cur=id}});
ls.forEach(function(a){{a.classList.toggle('on',a.getAttribute('href')==='#'+cur)}})}}
window.addEventListener('scroll',f,{{passive:true}});f()}})();
</script>
{REVEAL_JS}
</body>
</html>
"""
    (OUT / f'{s["slug"]}.html').write_text(body, encoding="utf-8")


def load_sites():
    sites = []
    for p in sorted(SRC.glob("*.json")):
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
    sites = load_sites()
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
