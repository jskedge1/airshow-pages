#!/usr/bin/env python3
"""Builds the preview of The Big Guide to RIAT: a small section of pages with its own home page.

    previews/big-guide-to-riat/index.html            home page, links to every page below
    previews/big-guide-to-riat/what-we-know.html     what is confirmed about the move
    previews/big-guide-to-riat/still-to-come.html    what the organisers have not announced yet
    previews/big-guide-to-riat/already-booked.html   refunds, parking, campsites and enclosures
    previews/big-guide-to-riat/camping/index.html    the RIAT camping home page (copied from riat-camping/)
    previews/big-guide-to-riat/camping/<page>.html   one page per campsite (copied from riat-camping/)

The words come from the live RIAT page, camping-layout/riat.html (checked 15 November 2026). Nothing is
added that is not on that page. The look is the camping pages' design: this script borrows the styles,
icons and motion from riat-camping-src/build.py, so the two always match.

Run:  python3 previews/big-guide-to-riat-src/build.py
Run riat-camping-src/build.py first if the camping pages have changed.

This is a preview. Links between the pages are relative so it works anywhere. To go live each page needs
its own Wix page: set PAGES_BASE to the https://www.ukairshowguide.co.uk address and LINK_TARGET to "_top",
and IMG to the full https://jskedge1.github.io/airshow-pages/... address.
"""
import importlib.util
import pathlib
import re
import shutil

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "previews" / "big-guide-to-riat"

spec = importlib.util.spec_from_file_location("camp", ROOT / "riat-camping-src" / "build.py")
camp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(camp)
e, icon = camp.e, camp.icon

SITE = "https://www.ukairshowguide.co.uk"
RIAT = "https://www.airtattoo.com/"
IMG = "img/"            # photos, copied into the preview folder by this script
LINK_TARGET = "_self"
CHECKED = "15 November 2026"

# Jack's own photos (alt text as on the live pages)
PHOTOS = {
    "f16": ("camping-layout/img/riat-f16-danish.webp", "A Royal Danish Air Force F-16 turning hard in full afterburner"),
    "c17": ("camping-layout/img/88b504a8957bc276.webp", "RAF C-17 Globemaster ZZ177 on a flypast"),
    "hornet": ("camping-layout/img/riat-hornet-finnish.webp", "Finnish Air Force F/A-18C Hornet on a banking pass"),
    "f16flag": ("home-img/v2/type-military-riat25.jpg", "A Danish F-16 in red and white flag colours, seen from below at RIAT 2025"),
    "reds18": ("home-img/v2/hero-arrows-riat18.jpg", "Three Red Arrows Hawks trailing red and white smoke at RIAT 2018"),
    "reds23": ("home-img/v2/hero-arrows-riat23.jpg", "The Red Arrows breaking apart with red, white and blue smoke at RIAT 2023"),
    "camp": ("camping-hub-img/hero-flyby.jpg", "Aircraft flying over an airshow campsite"),
    "tents": ("camping-hub-img/tents-night.jpg", "Tents on an airshow campsite at night"),
    "logo": ("brand/ukag-header-logo.png", "UK Airshow Guide, by The Big Guide to UK Airshows"),
}

PAGES = [  # key, file, name in the menu, one line
    ("home", "index.html", "Home", "Start here"),
    ("know", "what-we-know.html", "What we know", "Six things confirmed about the move to Boscombe Down."),
    ("come", "still-to-come.html", "Still to come", "Eight things the organisers have not announced yet."),
    ("booked", "already-booked.html", "Already booked?", "Refunds, parking, campsites and enclosures."),
    ("camping", "camping/index.html", "Camping", "Campsites near Boscombe Down and around Fairford."),
]

KEY = [("When", "Friday 16 to Sunday 18 July 2027"), ("Where", "MOD Boscombe Down, Wiltshire"),
       ("Children", "Under 18s free with an adult"), ("Tickets", "On sale now, advance only"),
       ("Park & View", "Wed 14, Thu 15 and Mon 19 July"), ("Travel", "Plans still to be announced")]

KNOW = [
    ("Wiltshire", "pin", "A new, permanent home", "The flying and the showground move to MOD Boscombe Down, a military test airfield just south east of Amesbury, with the A303 alongside and Stonehenge a few miles north west. RIAT’s office stays in Fairford, but the show itself won’t be going back there."),
    ("Tickets", "tag", "Your tickets still stand", "Bookings, including RIAT26 tickets rolled over to 2027, stay valid for Boscombe Down. Under 18s still go free with a ticket holding adult, and Friday Futures and FRIAT are both carrying on. Discounted passes for local residents are coming too, with details due in early 2027."),
    ("At the show", "plane", "The same show you know", "The flying display, the big static park and the chance to meet crews from around the world are all staying. So are the Techno Zone and the RAF Experience, with refreshed enclosures on the way."),
    ("Camping", "tent", "A campsite next to the airfield", "RIAT has secured a campsite beside the airfield, big enough for everyone from the official Fairford site and the campsites around it. Rollover bookings get first pick, then the waitlist, then general sale."),
    ("Where to stay", "sign", "Hotels with event rates", "Hotels from 2 star to 5 star around Boscombe Down have been signed up, with a booking tool for ticket holders due in the coming weeks. Some will run a free shuttle to the showground."),
    ("Getting there", "bus", "Better public transport", "The organisers say the new site has better public transport links, and they plan to run free rail shuttles from Salisbury, Andover and Swindon stations, plus Park & Ride. No routes or times are out yet."),
]

COME = [
    ("Car parking", "The transport plan is still being worked out, so there’s no parking to book yet. RIAT says the car parks will open at 06:00 each show day."),
    ("Park & Ride and rail shuttles", "Free rail shuttles are planned from Salisbury, Andover and Swindon stations, with Park & Ride sites and times to follow. You’ll need a general admission ticket to board."),
    ("Gate and flying times", "Friday is a four hour plus display, Saturday and Sunday seven hours plus. Exact times come nearer the show."),
    ("Showground layout and the crowd line", "Where you’ll watch from, and so where the sun will sit through the day."),
    ("Enclosures and the grandstand", "Packages and upgrades are paused while the new options are worked out."),
    ("Park & View enclosures", "Locations to be revealed in the coming months."),
    ("Accessible parking and viewing", "No Boscombe Down details yet. Customer Services is on 01285 713456."),
    ("Aircraft line-up", "Weekly updates usually start in February, with the Tiger Gathering as the headline theme."),
]

BOOKED = [
    ("Thinking about a refund?", "RIAT asks you to wait for the transport, Park & Ride, hotel and camping details first. If you still want one, use the refund form with your original booking reference."),
    ("Pre-paid parking", "This will be refunded automatically to your card (£15 a car, £7.50 a motorbike) by the end of December 2026. If parking is offered at Boscombe Down, you’ll get priority booking."),
    ("Booked a campsite near Fairford?", "If it was a non-refundable booking at an unofficial site, you can claim a free standard plot at the official campsite. How to claim is still to come."),
    ("Enclosure bookings", "You’ll be contacted about the changes and your options to switch or cancel."),
    ("Shuttles from the Fairford area", "RIAT says it will run a Swindon Shuttle to Boscombe Down. Nothing is confirmed from Fairford itself yet, and details will come with the transport plan. RIAT puts Swindon and Fairford at about an hour’s drive from Boscombe Down."),
]

ADDING = ["Getting there and parking", "Trains and buses", "Where to stay", "Camping", "Aircraft line-up", "Where to watch",
          "Sun guide for photographers", "Plan your day", "Accessibility", "Food and facilities"]

ADVICE = ("If you’re travelling a long way, hotels round Salisbury and Amesbury will go fast once people start planning, so a room you can "
          "cancel for free might work well for you. Hold off on anything non-refundable, like Advance train tickets, until the shuttle plans are out.")

LOOP = [("RIAT Boscombe Down FAQs", "Questions about the move, answered by RIAT", "https://www.airtattoo.com/faqs/boscombe-down/", "ask"),
        ("Our Facebook page", "Guide updates as they happen", "https://www.facebook.com/share/19Ywfe4EcE/", "share"),
        ("@theukairshowguide", "Planning cards and photos on Instagram", "https://www.instagram.com/theukairshowguide/", "link")]

USEFUL = [("Royal International Air Tattoo", RIAT), ("RIAT27 tickets", "https://www.airtattoo.com/tickets"),
          ("The move announcement", "https://www.airtattoo.com/news/riat-to-relocate-to-mod-boscombe-down-for-riat27-and-beyond/"),
          ("The 2027 Tiger Gathering theme", "https://www.airtattoo.com/the-airshow/aircraft-and-pilots/2027-theme/")]

EXTRA_CSS = r"""
/* The Big Guide to RIAT: the few parts the camping pages do not have */
/* Jack, 21 Nov 2026: the menu links in the photo header sit in boxes */
.nav ul{align-items:center;gap:8px}
.nav li a{padding:11px 14px 10px;border:1px solid rgba(255,255,255,.45);border-bottom-width:1px;margin:0;background:rgba(11,26,39,.42);transition:background .25s,color .25s,border-color .25s,transform .25s}
.nav li a:hover{background:var(--teal);border-color:var(--teal);color:var(--navy);transform:translateY(-2px)}
.bgr-mark{display:flex;flex-direction:column;justify-content:center;border-left:2px solid rgba(255,255,255,.35);padding-left:16px;margin:0 auto 0 4px;color:#fff;white-space:nowrap;line-height:1}
.bgr-mark b{font:600 15.5px/1 "Barlow",sans-serif}
.bgr-mark em{font:800 30px/1 "Barlow",sans-serif;font-style:normal;color:var(--teal);margin-top:3px}
.nav .logo{margin-right:0}
.bgr-key{background:var(--navy);color:#fff;border-top:5px solid var(--or);margin:30px 0 34px;box-shadow:0 26px 40px -28px rgba(11,26,39,.7)}
.bgr-key h3{display:flex;align-items:center;gap:12px;color:#fff;font-size:23px;font-weight:700;padding:20px 24px 18px;background:var(--deep)}
.bgr-key h3 svg{width:22px;height:22px;color:var(--teal)}
.bgr-key dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.bgr-key dl>div{display:grid;grid-template-columns:44px minmax(0,1fr);gap:0 14px;align-items:center;padding:17px 22px;border-top:1px solid rgba(255,255,255,.14);transition:background .3s}
.bgr-key dl>div:nth-child(odd){border-right:1px solid rgba(255,255,255,.14)}
.bgr-key dl>div:hover{background:#1C3850}
.bgr-key i{grid-row:1/3;width:44px;height:44px;display:grid;place-items:center;background:rgba(50,180,175,.18);color:var(--teal);transition:transform .35s,background .3s,color .3s}
.bgr-key i svg{width:22px;height:22px}
.bgr-key dl>div:hover i{background:var(--teal);color:var(--navy);transform:rotate(-6deg) scale(1.08)}
.bgr-key dt{font-weight:700;font-size:16px;color:var(--teal);line-height:1.2}
.bgr-key dd{font-weight:600;font-size:17.5px;line-height:1.35;color:#fff;margin:2px 0 0}
.bgr-story{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:64px;align-items:center}
.bgr-story .lede+.lede{margin-top:14px}
.bgr-story .ph{position:relative}
.bgr-story .ph img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.bgr-story .ph span{position:absolute;left:0;bottom:0;background:var(--or);color:#fff;font-weight:700;font-size:17px;padding:11px 16px 10px}
.bgr-story .bgr-grid{grid-template-columns:1fr;gap:14px;margin-top:18px}
.bgr-story .bgr-box{padding:18px 20px 16px}
.bgr-story .bgr-box h3{font-size:20px}
.bgr-story .bgr-box p{margin-top:5px;font-size:16px}
@media (max-width:1100px){.bgr-story{grid-template-columns:1fr;gap:40px}.bgr-mark{display:none}}
@media (max-width:700px){.bgr-key dl{grid-template-columns:1fr}.bgr-key dl>div:nth-child(odd){border-right:0}}
.strip .lab{color:#fff}
.bgr-pages{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
.bgr-pg{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:420px;padding:26px;color:#fff;background:var(--navy);overflow:hidden;text-decoration:none;transition:transform .45s cubic-bezier(.22,.61,.36,1),box-shadow .45s}
.bgr-pg>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.22,.61,.36,1)}
.bgr-pg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(19,41,60,.1) 15%,rgba(19,41,60,.84) 58%,rgba(11,26,39,.97))}
.bgr-pg>*:not(img){position:relative;z-index:1}
.bgr-pg .n{position:absolute;top:0;left:0;background:var(--or);color:#fff;font:800 22px/1 "Barlow",sans-serif;padding:13px 16px}
.bgr-pg h3{color:#fff;font-size:25px;font-weight:700}
.bgr-pg p{margin-top:8px;color:#E6EDF1;font-size:16.5px;line-height:1.5}
.bgr-pg .more{margin-top:16px;color:var(--teal);align-self:flex-start}
.bgr-pg:hover{transform:translateY(-8px);box-shadow:0 26px 40px -24px rgba(11,26,39,.7)}
.bgr-pg:hover>img{transform:scale(1.08)}
.bgr-pg .sub{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.bgr-pg .sub span{background:rgba(255,255,255,.16);font-weight:600;font-size:14.5px;padding:6px 9px 5px}

.bgr-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.bgr-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}
.bgr-box{background:var(--soft);border-top:5px solid var(--teal);padding:24px 24px 22px;transition:transform .35s cubic-bezier(.22,.61,.36,1),box-shadow .35s,background .35s}
.sec.tint .bgr-box{background:#fff}
.bgr-box:nth-child(4n+2){border-top-color:var(--purple)}
.bgr-box:nth-child(4n+3){border-top-color:var(--sky)}
.bgr-box:nth-child(4n+4){border-top-color:var(--or)}
.bgr-box:hover{transform:translateY(-6px);background:#fff;box-shadow:0 22px 34px -22px rgba(11,26,39,.5)}
.bgr-box .tg{display:inline-flex;align-items:center;gap:8px;font:700 16px/1 "Barlow",sans-serif;color:#fff;background:var(--purple);padding:8px 11px 7px;margin-bottom:14px}
.bgr-box .tg svg{width:15px;height:15px}
.bgr-box .tg.wait{background:var(--amber);color:var(--navy)}
.bgr-box h3{font-size:22px;font-weight:700}
.bgr-box p{margin-top:9px;font-size:16.5px;line-height:1.6}
.bgr-box .more{margin-top:14px}
.bgr-chips{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-top:8px}
.bgr-chips div{background:#fff;border-top:4px solid var(--teal);padding:16px 16px 14px;font-weight:700;font-size:17px;line-height:1.3;color:var(--ink);transition:transform .3s,box-shadow .3s}
.bgr-chips div:nth-child(3n+2){border-top-color:var(--purple)}
.bgr-chips div:nth-child(3n+3){border-top-color:var(--sky)}
.bgr-chips div:hover{transform:translateY(-5px);box-shadow:0 18px 28px -20px rgba(11,26,39,.5)}
.bgr-advice{margin-top:44px;background:var(--navy);color:#fff;border-top:5px solid var(--or);padding:34px 38px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:26px;align-items:center}
.bgr-advice h3{color:#fff;font-size:26px;font-weight:700;white-space:nowrap}
.bgr-advice p{color:#E6EDF1;font-size:17.5px;line-height:1.6}
.bgr-next{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}
.bgr-next a{display:block;background:var(--navy);color:#fff;text-decoration:none;padding:28px 30px;border-top:5px solid var(--teal);transition:transform .35s cubic-bezier(.22,.61,.36,1),background .3s}
.bgr-next a.r{text-align:right;border-top-color:var(--or)}
.bgr-next a:hover{transform:translateY(-6px);background:#1C3850}
.bgr-next small{display:block;font-weight:700;font-size:16px;color:var(--teal)}
.bgr-next b{display:block;font:700 26px/1.2 "Barlow",sans-serif;margin-top:6px}
.bgr-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.bgr-links a{display:block;background:var(--soft);border-top:5px solid var(--teal);padding:20px 20px 18px;font-weight:700;font-size:17.5px;line-height:1.3;color:var(--ink);text-decoration:none;transition:transform .35s cubic-bezier(.22,.61,.36,1),box-shadow .35s,background .35s}
.bgr-links a:nth-child(4n+2){border-top-color:var(--purple)}.bgr-links a:nth-child(4n+3){border-top-color:var(--sky)}.bgr-links a:nth-child(4n+4){border-top-color:var(--or)}
.bgr-links a:hover{transform:translateY(-6px);background:#fff;box-shadow:0 22px 34px -22px rgba(11,26,39,.5)}
.bgr-links a small{display:block;font-weight:500;font-size:15px;color:var(--body);margin-top:4px}
a.step{text-decoration:none;color:inherit;display:block}
.qband.bgr-q .btns{margin-bottom:150px}
.feat.six{grid-template-columns:repeat(2,minmax(0,1fr))}
.feat .v{margin-top:8px;font-weight:600;font-size:17px;color:var(--ink);line-height:1.4}
@media (max-width:1100px){.bgr-pages{grid-template-columns:repeat(2,minmax(0,1fr))}.bgr-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bgr-chips{grid-template-columns:repeat(3,minmax(0,1fr))}.bgr-links{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:700px){.bgr-pages,.bgr-grid,.bgr-grid.two,.bgr-next,.bgr-links{grid-template-columns:1fr}.bgr-chips{grid-template-columns:repeat(2,minmax(0,1fr))}.bgr-pg{min-height:320px}.bgr-advice{grid-template-columns:1fr;padding:26px 22px}.bgr-advice h3{white-space:normal}.bgr-next a.r{text-align:left}}
@media (prefers-reduced-motion:reduce){.bgr-pg,.bgr-pg>img,.bgr-box,.bgr-chips div,.bgr-next a,.bgr-links a{transition:none!important;transform:none!important}}
"""

MOTION_MORE = r"""<script>
(function(){
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
if(!('IntersectionObserver' in window))return;
var els=[].slice.call(document.querySelectorAll('.bgr-pg,.bgr-box,.bgr-chips div,.bgr-advice,.bgr-next a,.bgr-links a'));
els.forEach(function(el){if(el.classList.contains('rv'))return;var sibs=[].slice.call(el.parentNode.children);el.classList.add('rv');var d=Math.min(sibs.indexOf(el),5)*90;if(d)el.style.transitionDelay=d+'ms'});
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);setTimeout(function(){x.target.style.transitionDelay=''},1100)}})},{rootMargin:'0px 0px -6% 0px',threshold:.06});
els.forEach(function(el){io.observe(el)});
setTimeout(function(){els.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight&&r.bottom>0)el.classList.add('in')})},1800);
})();
</script>"""


def img(key, depth=""):
    return depth + IMG + pathlib.Path(PHOTOS[key][0]).name


def href(key, depth=""):
    return depth + dict((k, f) for k, f, n, s in PAGES)[key]


def logo(depth=""):
    return (f'<a class="logo" href="{SITE}/" target="_top"><img src="{img("logo", depth)}" width="750" height="249" '
            f'alt="{e(PHOTOS["logo"][1])}" decoding="async"></a>'
            f'<a class="bgr-mark" href="{href("home", depth)}" target="{LINK_TARGET}" style="text-decoration:none"><b>The Big Guide to</b><em>RIAT</em></a>')


def top_bar():
    return (f'<div class="top"><div class="wrap"><div class="l"><span>{icon("pin")}MOD Boscombe Down, Wiltshire</span>'
            f'<span>{icon("cal")}16 to 18 July 2027</span><span>{icon("tick")}Checked {CHECKED}</span></div>'
            f'<div class="r"><a href="{SITE}/air-shows-guides" target="_top">Back to Find your airshow {icon("arrow")}</a></div></div></div>')


def nav_list(depth=""):
    return "".join(f'<li><a href="{href(k, depth)}" target="{LINK_TARGET}">{e(n)}</a></li>' for k, f, n, s in PAGES if k != "home")


def strip(current, depth=""):
    out = ['<nav class="strip" aria-label="The Big Guide to RIAT"><div class="wrap"><span class="lab">The Big Guide to RIAT</span>']
    for k, f, n, s in PAGES:
        on = ' on" aria-current="page' if k == current else ""
        out.append(f'<a class="st{on}" href="{href(k, depth)}" target="{LINK_TARGET}">{e(n)}</a>')
    out.append("</div></nav>")
    return "".join(out)


def sub_header(key, title, photo, tag):
    name = dict((k, n) for k, f, n, s in PAGES)[key]
    crumbs = (f'<a href="{href("home")}" target="{LINK_TARGET}">The Big Guide to RIAT</a>{icon("chev")}<span>{e(name)}</span>')
    return (f'<header class="hd" style="background-image:url(\'{img(photo)}\')"><div class="wrap"><nav class="nav" aria-label="The Big Guide to RIAT">'
            f'{logo()}<ul>{nav_list()}</ul><a class="btn or inv" href="{RIAT}tickets" target="_blank" rel="noopener">RIAT27 tickets</a></nav>'
            f'<div class="ttl"><div class="tags"><span class="tagp">{e(tag)}</span></div><h1>{e(title)}</h1><p class="crumbs">{crumbs}</p></div></div></header>')


def footer():
    pages = "".join(f'<li><a href="{href(k)}" target="{LINK_TARGET}">{icon("chev")}{e(n)}</a></li>' for k, f, n, s in PAGES)
    offi = "".join(f'<li><a href="{e(u)}" target="_blank" rel="noopener">{icon("chev")}{e(n)}</a></li>' for n, u in USEFUL)
    return f"""<footer class="ft"><div class="wrap cols">
  <div>{logo()}<div class="ct"><span>{icon("pin")}MOD Boscombe Down, Wiltshire</span><span>{icon("cal")}RIAT, 16 to 18 July 2027</span>
    <span>{icon("phone")}RIAT Customer Services: 01285 713456</span></div></div>
  <div><h3>The Big Guide to RIAT</h3><ul>{pages}</ul></div>
  <div><h3>Official RIAT</h3><ul>{offi}</ul></div>
  <div><h3>Looking for another show?</h3><p>I have a guide for every featured show, so you can compare them before you book.</p>
    <a class="btn or inv" href="{SITE}/air-shows-guides" target="_top">Find your airshow</a></div>
</div></footer>
<div class="fbar"><div class="wrap"><p>The Big Guide to UK Airshows is an independent visitor guide and isn’t affiliated with the Royal International Air Tattoo, RAF Charitable Trust Enterprises or the Ministry of Defence. Details were checked on {CHECKED} and will change as plans for RIAT27 are confirmed.</p>
<p>Always check the <a href="{RIAT}" target="_blank" rel="noopener">official RIAT website</a> before you book or travel. RIAT Customer Services: 01285 713456.</p></div></div>
{camp.MOTION_JS}{camp.COUNT_JS}{MOTION_MORE}
</body>
</html>"""


def page(title, desc, body):
    h = camp.head(title, desc, EXTRA_CSS)
    h = h.replace("<title>", '<!-- PREVIEW: The Big Guide to RIAT. Built by previews/big-guide-to-riat-src/build.py. Not live. -->\n<meta name="robots" content="noindex">\n<title>', 1)
    return h + top_bar() + body + footer()


def next_prev(key):
    keys = [k for k, f, n, s in PAGES]
    names = dict((k, n) for k, f, n, s in PAGES)
    i = keys.index(key)
    prev, nxt = keys[i - 1], keys[(i + 1) % len(keys)]
    return (f'<section class="sec" aria-label="More pages" style="padding-top:0"><div class="wrap bgr-next">'
            f'<a href="{href(prev)}" target="{LINK_TARGET}"><small>Back</small><b>{e(names[prev])}</b></a>'
            f'<a class="r" href="{href(nxt)}" target="{LINK_TARGET}"><small>Next page</small><b>{e(names[nxt])}</b></a></div></section>')


KEY_ICON = {"When": "cal", "Where": "pin", "Children": "tick", "Tickets": "tag", "Park & View": "park", "Travel": "bus"}


def key_boxes(six=True):
    rows = "".join(f'<div><i>{icon(KEY_ICON.get(k, "tick"))}</i><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in KEY)
    return f'<div class="bgr-key"><h3>{icon("list")}Key details</h3><dl>{rows}</dl></div>'


def build_home():
    nav = nav_list()
    pg = [("know", "f16", "1"), ("come", "hornet", "2"), ("booked", "c17", "3"), ("camping", "camp", "4")]
    names = dict((k, (n, s)) for k, f, n, s in PAGES)
    cards = ""
    for k, ph, no in pg:
        sub = ""
        if k == "camping":
            sub = '<div class="sub"><span>All campsites</span><span>Show map</span><span>Sample campsite page</span></div>'
        cards += (f'<a class="bgr-pg" href="{href(k)}" target="{LINK_TARGET}"><img src="{img(ph)}" alt="{e(PHOTOS[ph][1])}" loading="lazy" decoding="async">'
                  f'<span class="n">{no}</span><h3>{e(names[k][0])}</h3><p>{e(names[k][1])}</p>{sub}<span class="more">Open this page</span></a>')
    loop = "".join(f'<a class="step" href="{e(u)}" target="_blank" rel="noopener">{icon(ic)}<h3>{e(t)}</h3><p>{e(s)}</p></a>' for t, s, u, ic in LOOP)
    useful = "".join(f'<a href="{e(u)}" target="_blank" rel="noopener">{e(n)}<small>airtattoo.com</small></a>' for n, u in USEFUL)
    body = f"""<header class="hd home"><div class="hd-bg" style="background-image:url('{img("f16")}');background-position:30% 40%"></div>
  <div class="wrap"><nav class="nav" aria-label="The Big Guide to RIAT">{logo()}<ul>{nav}</ul><a class="btn or inv" href="{RIAT}tickets" target="_blank" rel="noopener">RIAT27 tickets</a></nav>
    <div class="hero-in">
      <span class="hero-kick">{icon("cal")}New home for 2027</span>
      <h1>The Big Guide To RIAT <em>Royal International Air Tattoo</em></h1>
      <p class="hero-lead">Moving to MOD Boscombe Down, 16 to 18 July 2027. RIAT27 will be the first Air Tattoo at its new home, and I’m rebuilding my full guide around it.</p>
      <div class="btns"><a class="btn or inv" href="{href("know")}" target="{LINK_TARGET}">What we know {icon("arrow")}</a><a class="btn ghost" href="{href("booked")}" target="{LINK_TARGET}">Already booked?</a></div>
    </div>
    <div class="hx-row">
      <div class="hx count" style="background-image:url('{img("tents")}')"><b id="countDays">2027</b><span id="countLab">The first Air Tattoo at MOD Boscombe Down</span></div>
      <a class="hx" href="{href("know")}" target="{LINK_TARGET}"><h3>What we know</h3><p>Six things confirmed about the move so far.</p><span class="go">Read what is confirmed{icon("arrow")}</span></a>
      <a class="hx" href="{href("come")}" target="{LINK_TARGET}"><h3>Still to come</h3><p>Parking, shuttles, times and the line-up.</p><span class="go">See what is missing{icon("arrow")}</span></a>
      <a class="hx" href="{href("camping")}" target="{LINK_TARGET}"><h3>Camping</h3><p>Campsites near Boscombe Down and around Fairford.</p><span class="go">Open the camping pages{icon("arrow")}</span></a>
    </div>
  </div>
</header>
{strip("home")}
<main>
<section class="sec" id="about" aria-label="The Big Guide to RIAT">
  <div class="wrap about">
    <div><div class="ab-ph"><img class="p1" src="{img("hornet")}" alt="{e(PHOTOS["hornet"][1])}" decoding="async">
      <img class="p2" src="{img("reds18")}" alt="{e(PHOTOS["reds18"][1])}" loading="lazy" decoding="async">
      <div class="statbox"><b>2027</b><span>The first Air Tattoo at Boscombe Down</span></div></div>
      </div>
    <div>
      <span class="kick">Welcome</span>
      <h2 class="h">Your Guide To The Air Tattoo’s New Home</h2>
      <p class="lede">After more than forty years at RAF Fairford, RIAT is moving to MOD Boscombe Down, near Amesbury and Salisbury in Wiltshire. Most of the visitor details, like parking, shuttles and camping, haven’t been announced yet, so for now these pages set out what we do know.</p>
      {key_boxes()}
      <div class="btns"><a class="btn or" href="{href("know")}" target="{LINK_TARGET}">What we know</a><a class="btn nv" href="{RIAT}" target="_blank" rel="noopener">Official RIAT website</a></div>
    </div>
  </div>
</section>

<section class="sec tint" id="story" aria-label="Where it all started">
  <div class="wrap bgr-story">
    <div>
      <span class="kick">Where it all started</span>
      <h2 class="h">The Big Guide To RIAT Has A New Home</h2>
      <p class="lede">The Big Guide to RIAT is the website where it all started. I built it to help people plan their days at the Air Tattoo, and The Big Guide to UK Airshows grew out of it.</p>
      <p class="lede">Now that RIAT is moving to MOD Boscombe Down, I have decided to merge the two into one website. <b>Everything for RIAT now lives here</b>, next to my guides for airshows right across the UK, which should make it easier to plan your trip.</p>
      <p class="lede">Of course, it is not as big as it was when the show was at RAF Fairford. Most of what I had written was about Fairford, and it doesn’t help you any more. Over the next few years my aim is to grow these pages again for you all, adding each part as the organisers release the details.</p>
      <p class="lede">Thank you to everyone who visited The Big Guide to RIAT over the years. I really hope it helped you plan your days at the show.</p>
      <div class="btns" style="margin-top:26px"><a class="btn or" href="{href("come")}" target="{LINK_TARGET}">What I’ll be adding</a><a class="btn nv" href="{SITE}/air-shows-guides" target="_top">My other airshow guides</a></div>
    </div>
    <div>
      <div class="ph"><img src="{img("reds23")}" alt="{e(PHOTOS["reds23"][1])}" loading="lazy" decoding="async"><span>The Big Guide to RIAT</span></div>
      <div class="bgr-grid">
        <div class="bgr-box"><h3>One website</h3><p>RIAT and my other airshow guides, all in one place.</p></div>
        <div class="bgr-box"><h3>Easier to plan</h3><p>The show, the camping and the travel, a click apart.</p></div>
        <div class="bgr-box"><h3>Growing with the show</h3><p>New pages as each part of RIAT27 is confirmed.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="pages" aria-label="Inside the guide">
  <div class="wrap">
    {camp.sec_head("Inside the guide", "Four Parts, One Guide", "Each part has its own page, and the camping part has a page for every campsite. Pick the one you need.", mid=True)}
    <div class="bgr-pages">{cards}</div>
  </div>
</section>

<section class="qband bgr-q" id="coming" aria-label="My full guide is on its way" style="background-image:url('{img("f16")}')">
  <div class="wrap">
    <div>
      <span class="kick">Coming next</span>
      <h2 class="h">My Full Guide Is On Its Way</h2>
      <p class="lede">My Fairford guide doesn’t help you any more, so these pages take its place for now. Boscombe Down is a whole new airfield to plan for, with different roads, stations, campsites and views.</p>
      <p class="lede">As the organisers release each piece, I’ll build it into a full guide like the rest of the shows on this site. <b>Think about how you’d like to get there and who’s coming with you</b>, and the guide will help you plan the rest.</p>
      <div class="btns"><a class="btn or inv" href="{href("come")}" target="{LINK_TARGET}">See what is still to come</a></div>
    </div>
    <div class="qp"><img src="{img("f16flag")}" alt="{e(PHOTOS["f16flag"][1])}" loading="lazy" decoding="async"></div>
    <blockquote class="qcard"><i>{icon("quote")}</i><p>I’ve been going to RIAT since 2006, so this move is a big one for me too.</p><b>Jack Skedge</b><span>Founder and Managing Editor</span></blockquote>
  </div>
</section>

<section class="band" id="loop" aria-label="Stay in the loop" style="background-image:url('{img("tents")}')">
  <div class="wrap">
    <span class="kick">Stay in the loop</span>
    <h2 class="h">Hear When Each Part Goes Live</h2>
    <p class="lede">Follow along and you’ll hear when each part of the guide goes live. For anything about your own booking, go straight to RIAT.</p>
    <div class="steps" style="--n:3">{loop}</div>
  </div>
</section>

<section class="sec" id="links" aria-label="Useful links">
  <div class="wrap">
    {camp.sec_head("Official sources", "Useful Links")}
    <div class="bgr-links">{useful}</div>
  </div>
</section>
</main>
"""
    return page("The Big Guide to RIAT: Royal International Air Tattoo at MOD Boscombe Down | The Big Guide to UK Airshows",
                "RIAT is moving to MOD Boscombe Down for 16 to 18 July 2027. What is confirmed, what is still to come, what to do if you have already booked, and where to camp.", body)


def build_know():
    boxes = ""
    for tag, ic, h, p in KNOW:
        more = f'<a class="more" href="{href("camping")}" target="{LINK_TARGET}">Open the camping pages</a>' if tag == "Camping" else ""
        boxes += f'<div class="bgr-box"><span class="tg">{icon(ic)}{e(tag)}</span><h3>{e(h)}</h3><p>{e(p)}</p>{more}</div>'
    body = f"""{sub_header("know", "What We Know So Far", "f16", "Confirmed")}
{strip("know")}
<main>
<section class="sec" aria-label="What we know so far">
  <div class="wrap">
    {camp.sec_head("Confirmed so far", "Six Things We Know", "The move was announced on 4 November 2026. This is what’s been confirmed, and I’ll add to it as the organisers release more.")}
    <div class="bgr-grid">{boxes}</div>
  </div>
</section>
<section class="sec tint" aria-label="Key details">
  <div class="wrap about" style="align-items:start">
    <div>{camp.sec_head("At a glance", "Key Details", "The dates and the basics for RIAT27, as they stand today.")}
      <div class="btns"><a class="btn or" href="{RIAT}tickets" target="_blank" rel="noopener">RIAT27 tickets</a><a class="btn nv" href="{href("come")}" target="{LINK_TARGET}">Still to come</a></div></div>
    <div>{key_boxes().replace('class="bgr-key"', 'class="bgr-key" style="margin:0"')}</div>
  </div>
</section>
{next_prev("know")}
</main>
"""
    return page("RIAT 2027 at Boscombe Down: what we know so far | The Big Guide to RIAT",
                "Six things confirmed about the Royal International Air Tattoo's move to MOD Boscombe Down for July 2027.", body)


def build_come():
    boxes = "".join(f'<div class="bgr-box"><span class="tg wait">{icon("cal")}Still to come</span><h3>{e(h)}</h3><p>{e(p)}</p></div>' for h, p in COME)
    chips = "".join(f"<div>{e(x)}</div>" for x in ADDING)
    body = f"""{sub_header("come", "Still To Be Announced", "hornet", "Waiting on the organisers")}
{strip("come")}
<main>
<section class="sec" aria-label="Still to be announced">
  <div class="wrap">
    {camp.sec_head("Waiting on the organisers", "Eight Things Still To Come", "Quite a lot of the planning detail isn’t out yet. That’s normal for a move this big, and I would advise not booking anything you can’t change until the transport plan is published.")}
    <div class="bgr-grid two">{boxes}</div>
    <div class="bgr-advice"><h3>My advice for now</h3><p>{e(ADVICE)}</p></div>
  </div>
</section>
<section class="sec tint" aria-label="What I will be adding">
  <div class="wrap">
    {camp.sec_head("Coming to this guide", "What I’ll Be Adding", "This is what I’ll be adding as soon as there’s real information behind it.")}
    <div class="bgr-chips">{chips}</div>
  </div>
</section>
{next_prev("come")}
</main>
"""
    return page("RIAT 2027 at Boscombe Down: still to be announced | The Big Guide to RIAT",
                "Parking, Park and Ride, rail shuttles, flying times and the line-up: what has not been announced yet for RIAT at MOD Boscombe Down.", body)


def build_booked():
    boxes = "".join(f'<div class="bgr-box"><h3>{e(h)}</h3><p>{e(p)}</p></div>' for h, p in BOOKED)
    body = f"""{sub_header("booked", "If You’ve Already Booked", "c17", "Good to know")}
{strip("booked")}
<main>
<section class="sec" aria-label="If you have already booked">
  <div class="wrap">
    {camp.sec_head("Good to know", "Your Booking And The Move", "Bookings, including RIAT26 tickets rolled over to 2027, stay valid for Boscombe Down. This is what RIAT has said about refunds, parking, campsites and enclosures.")}
    <div class="bgr-grid">{boxes}<div class="bgr-box"><span class="tg">{icon("phone")}RIAT Customer Services</span><h3>01285 713456</h3><p>For anything about your own booking, go straight to RIAT.</p><a class="more" href="https://www.airtattoo.com/faqs/boscombe-down/" target="_blank" rel="noopener">RIAT Boscombe Down FAQs</a></div></div>
    <div class="bgr-advice"><h3>My advice for now</h3><p>{e(ADVICE)}</p></div>
  </div>
</section>
{next_prev("booked")}
</main>
"""
    return page("RIAT 2027: if you have already booked | The Big Guide to RIAT",
                "What RIAT has said about refunds, pre-paid parking, campsites near Fairford and enclosure bookings now the show is moving to MOD Boscombe Down.", body)


CAMPING_OVER = r"""<style id="bgr-over">
/* Jack, 21 Nov 2026: the menu links in the photo header sit in boxes */
.nav ul{align-items:center;gap:8px}
.nav li a{padding:11px 14px 10px;border:1px solid rgba(255,255,255,.45);border-bottom-width:1px;margin:0;background:rgba(11,26,39,.42);transition:background .25s,color .25s,border-color .25s,transform .25s}
.nav li a:hover{background:var(--teal);border-color:var(--teal);color:var(--navy);transform:translateY(-2px)}
/* Jack, 21 Nov 2026: the links under the guide cards are red buttons */
.gc .more{display:inline-flex;align-items:center;background:var(--or);color:#fff;font-weight:700;font-size:17px;padding:14px 20px 13px;border:0;background-image:none;transition:background .2s,transform .3s}
.gc:hover .more{background:var(--navy);transform:translateY(-2px)}
.gc .more::after{border-color:#fff}
</style>"""


def copy_camping():
    """The camping pages, copied from riat-camping/ with their links pointed inside this section."""
    src = ROOT / "riat-camping"
    dst = OUT / "camping"
    dst.mkdir(parents=True, exist_ok=True)
    gh = "https://jskedge1.github.io/airshow-pages/"
    n = 0
    for f in sorted(src.glob("*.html")):
        h = f.read_text(encoding="utf8")
        for u in set(re.findall(re.escape(gh) + r"(?:camping-hub-img|brand)/[A-Za-z0-9._-]+", h)):
            name = u.rsplit("/", 1)[1]
            s = ROOT / u[len(gh):]
            if s.exists():
                shutil.copyfile(s, OUT / "img" / name)
                h = h.replace(u, "../img/" + name)
        h = re.sub(re.escape(gh) + r'riat-camping/([a-z0-9-]+\.html(?:#[a-z]+)?)" target="_(?:top|blank)"', r'\1" target="_self"', h)
        h = h.replace(gh + "riat-camping/", "")
        h = re.sub(r'<a href="https://www\.ukairshowguide\.co\.uk/riat" target="_top">Back to the RIAT guide', '<a href="../index.html" target="_self">Back to The Big Guide to RIAT', h)
        h = h.replace('href="https://www.ukairshowguide.co.uk/riat" target="_top"', 'href="../index.html" target="_self"')
        # Jack, 20 Nov 2026: a different tent in the main photo of the camping home page's intro
        old = re.search(r'<img class="p1" src="\.\./img/tent-and-kit\.jpg" alt="[^"]*"( style="[^"]*")?', h)
        if old:
            shutil.copyfile(ROOT / "camping-hub-img" / "shelter-day.jpg", OUT / "img" / "shelter-day.jpg")
            h = h.replace(old.group(0), '<img class="p1" src="../img/shelter-day.jpg" alt="A grey dome tent on a camping pitch with a folding table outside" style="object-position:30% 50%"', 1)
        # Jack, 21 Nov 2026: a different photo beside "Everything I wish someone had told me"
        old = re.search(r'<div class="qp"><img src="\.\./img/group-pitch\.jpg" alt="[^"]*"', h)
        if old:
            shutil.copyfile(ROOT / "camping-hub-img" / "bell-tents.jpg", OUT / "img" / "bell-tents.jpg")
            h = h.replace(old.group(0), '<div class="qp"><img src="../img/bell-tents.jpg" alt="Bell tents and cars on a camping field, with bunting along the track"', 1)
        h = h.replace("</head>", CAMPING_OVER + "\n</head>", 1)
        # Jack, 21 Nov 2026: his own words for the light poles tip
        h = h.replace("Light poles make finding your pitch at night so much easier.", "Making it bright and loud can make your pitch stand out, and it is fun too.")
        # the section's own strip of pages goes above the campsite strip
        s = strip("camping", "../")
        if '<nav class="strip"' in h:
            h = h.replace('<nav class="strip"', s + '<nav class="strip"', 1)
        else:
            h = h.replace("<main>", s + "<main>", 1)
        h = h.replace("<title>", '<meta name="robots" content="noindex">\n<title>', 1)
        (dst / f.name).write_text(h, encoding="utf8")
        n += 1
    return n


def main():
    (OUT / "img").mkdir(parents=True, exist_ok=True)
    for key, (path, alt) in PHOTOS.items():
        shutil.copyfile(ROOT / path, OUT / "img" / pathlib.Path(path).name)
    for name, fn in (("index.html", build_home), ("what-we-know.html", build_know), ("still-to-come.html", build_come), ("already-booked.html", build_booked)):
        (OUT / name).write_text(fn(), encoding="utf8")
        print("wrote", (OUT / name).relative_to(ROOT))
    print("camping pages copied:", copy_camping())


if __name__ == "__main__":
    main()
