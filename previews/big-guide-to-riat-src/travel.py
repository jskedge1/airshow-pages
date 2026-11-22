"""Getting there and parking for The Big Guide to RIAT, in the same design as every feature page (Jack, 22 Nov 2026).

Clacton's Getting there is the model: heading and intro with the Key places board, the Coming by train banner,
the plan note, the numbered step tabs (Ways in, Fares, On the day and getting home, Questions), Compare driving
options, Car parks, the Choose a topic explorer, Fares, the On the day and Getting home boxes, and Questions.
The parts that are plain markup on the feature pages (Compare driving options, Car parks, Fares, the On the day
boxes) use the same files as tools-getting-there.py (getting-there-src/parts/). The parts that the feature pages
draw with their own scripts (Key places, the banner, the step tabs and the explorer) are written out here in the
markup those scripts produce, with the styles taken from Clacton's page (travel.css, made by
make_travel_css.js; run it again if Clacton's Getting there look changes).

Every fact comes from this guide's own pages (build.py: KNOW, COME, BOOKED, KEY) or airtattoo.com, checked on
22 November 2026. RIAT hasn't published its RIAT27 transport plan yet, so most figures say so.
"""
import html
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
PARTS = ROOT / "getting-there-src" / "parts"
ICONS = json.loads((HERE / "travel-icons.json").read_text(encoding="utf8"))
e = html.escape

NAME = "RIAT, the Royal International Air Tattoo"
FAQ_URL = "https://www.airtattoo.com/faqs/boscombe-down/"
HOW_URL = "https://www.airtattoo.com/the-airshow/plan-your-visit/how-to-get-here/"

INTRO = ("RIAT moves to MOD Boscombe Down, just south east of Amesbury in Wiltshire, with the A303 alongside. "
         "RIAT says the new site has better public transport links, with free rail shuttles from Salisbury, Andover and Swindon "
         "stations and Park and Ride planned. The routes, times and parking details aren’t out yet, so I would hold off on "
         "anything you can’t cancel until they are.")

KEY_PLACES = [  # label, value, colour, icon number (from Clacton's Key places icons)
    ("Showground", "MOD Boscombe Down", "#F2B233", 0),
    ("Park and Ride", "Sites to follow", "#2BA84A", 1),
    ("Car parks", "Open 06:00 each show day", "#2B5DA8", 2),
    ("Rail shuttles", "Salisbury, Andover, Swindon", "#D74949", 3),
    ("Main road", "A303, by Amesbury", "#C2255C", 4),
]

PLAN = ("2027 plan", "<b>RIAT27 is at MOD Boscombe Down from 16 to 18 July 2027, but when I last checked the transport plan "
        "hadn’t been published yet.</b> What’s below is what RIAT has said so far. Prices aren’t out yet, and I’ll add the routes, "
        "times and prices when they are. I would suggest checking everything again once the 2027 details are released.")

# Choose a topic: (group, colour, [(id, name, sub, title, lead, stats, tips, good)])
TOPICS = [
    ("By train", "#D74949", [
        ("rail", "Free rail shuttles", "Salisbury, Andover and Swindon",
         "Free rail shuttles to the showground",
         "RIAT plans to run free rail shuttles from Salisbury, Andover and Swindon stations to MOD Boscombe Down. You’ll need a general admission ticket to board.",
         [("Stations", "Salisbury, Andover, Swindon"), ("Cost", "Free with your ticket")],
         [("Arriving & planning", "The shuttle routes and times aren’t out yet, I’ll add them when they are. I would hold off on Advance train tickets until they are, as you can’t change those."),
          ("Walking & leaving", "When the times are out I’ll add the last shuttle back to each station, so you can plan your train home.")],
         "RIAT says the new site has better public transport links than Fairford. I’ll build the full train guide once the shuttle plan is published."),
    ]),
    ("Park and Ride", "#2BA84A", [
        ("pr", "Park and Ride", "Sites and times to follow",
         "Park and Ride for RIAT27",
         "RIAT plans to run free Park and Ride services for RIAT27. The sites and times haven’t been announced yet.",
         [("Cost", "Free, planned"), ("Sites", "Not out yet")],
         [("Arriving & planning", "I’ll add each Park and Ride site, its postcode and the bus times as soon as RIAT publishes them."),
          ("Walking & leaving", "I would expect queues for the buses back after the flying, so I’ll add the last bus times when they’re out.")],
         "You’ll need a general admission ticket to board the free shuttles, so I would keep it on your phone or printed out."),
    ]),
    ("By road", "#F2B233", [
        ("car", "Driving to Boscombe Down", "The A303, by Amesbury",
         "Driving to MOD Boscombe Down",
         "MOD Boscombe Down is a military test airfield just south east of Amesbury, with the A303 alongside and Stonehenge a few miles north west. RIAT says the car parks will open at 06:00 each show day.",
         [("Car parks open", "06:00"), ("Parking price", "Not out yet")],
         [("Arriving & planning", "There’s no parking to book yet, as the transport plan is still being worked out. I would check when the car parks open and try to arrive about an hour before you want to be on the crowd line."),
          ("Walking & leaving", "I’ll add the routes in, the signs to follow and any road closures once RIAT publishes them.")],
         "RIAT puts Swindon and Fairford at about an hour’s drive from Boscombe Down."),
        ("booked", "Booked parking for Fairford?", "Refunded automatically",
         "Pre paid parking from the Fairford show",
         "If you pre paid for parking, RIAT will refund it automatically to your card, £15 a car and £7.50 a motorbike, by the end of December 2026.",
         [("Car", "£15 refunded"), ("Motorbike", "£7.50 refunded")],
         [("Arriving & planning", "If parking is offered at Boscombe Down, people who pre paid will get priority booking."),
          ("Walking & leaving", "RIAT asks you to wait for the transport details before deciding on a refund for your tickets.")],
         "For anything about your own booking, I would go straight to RIAT Customer Services on 01285 713456."),
    ]),
    ("By coach", "#C2255C", [
        ("swindon", "Swindon Shuttle", "From Swindon to Boscombe Down",
         "The Swindon Shuttle",
         "RIAT says it will run a Swindon Shuttle to Boscombe Down. Nothing is confirmed from Fairford itself yet, and the details will come with the transport plan.",
         [("From", "Swindon"), ("Times", "Not out yet")],
         [("Arriving & planning", "I’ll add the pick up point, the times and whether you need to book once RIAT publishes them."),
          ("Walking & leaving", "When the times are out I’ll add the last shuttle back to Swindon.")],
         "Some hotels signed up with RIAT will also run a free shuttle to the showground."),
    ]),
    ("Access & taxis", "#6950A1", [
        ("access", "Accessible parking and viewing", "Details to follow",
         "Accessible parking and viewing",
         "RIAT hasn’t published the Boscombe Down details for accessible parking and viewing yet. I’ll add them, including whether you need to book or bring a Blue Badge, when they’re out.",
         [("Details", "Not out yet"), ("Phone", "01285 713456")],
         [("Arriving & planning", "If you need to plan ahead now, RIAT Customer Services is on 01285 713456."),
          ("Walking & leaving", "I’ll add the drop off points and the accessible routes once the showground layout is out.")],
         "Accessible parking, drop off and taxis will all go here once the transport plan is published."),
    ]),
]

QUESTIONS = [
    ("Do I need to book parking?", "Not yet, as there’s no parking to book. The transport plan is still being worked out. If you pre paid for parking for the Fairford show, it will be refunded automatically to your card, £15 a car or £7.50 a motorbike, by the end of December 2026, and you’ll get priority booking if parking is offered at Boscombe Down."),
    ("When do the car parks open?", "RIAT says the car parks will open at 06:00 each show day. I would check when they open nearer the show and try to arrive about an hour before you want to be on the crowd line."),
    ("Is there a shuttle from Fairford?", "Nothing is confirmed from Fairford itself yet. RIAT says it will run a Swindon Shuttle to Boscombe Down, with the details coming with the transport plan. RIAT puts Swindon and Fairford at about an hour’s drive from Boscombe Down."),
    ("Should I book my train now?", "I would hold off on anything you can’t cancel, like Advance train tickets, until the shuttle plans are out. Free rail shuttles are planned from Salisbury, Andover and Swindon stations."),
    ("Who do I ask about my own booking?", "RIAT Customer Services is on 01285 713456, and RIAT’s Boscombe Down questions page answers the common ones."),
]


def part(name):
    return (PARTS / name).read_text(encoding="utf8")


def hero(banner):
    rows = "".join(
        f'<div style="--rc:{c};--rs:{c}24;min-width:0"><span class="xd-ri" aria-hidden="true">{ICONS["_kp"][i]}</span><dt>{e(k)}</dt><dd>{e(v)}</dd></div>'
        for k, v, c, i in KEY_PLACES)
    return (f'<div class="wrap">\n<figure class="rail-banner"><img src="{banner}" '
            f'alt="Coming by train? A regional train running past a dry stone wall through green countryside" draggable="false"></figure>'
            f'<div class="gt-hero in"><div><h2><small>{e(NAME)}</small>Parking &amp; arrival guide</h2><p class="lead">{e(INTRO)}</p></div>'
            f'<div class="gt-facts"><div class="xd-kp-h"><span style="background:none;color:inherit;padding:0;font-size:inherit;font-family:inherit">Key places</span><span>Boscombe Down</span></div>'
            f'<dl>{rows}</dl></div></div></div>')


def plan_note():
    return f'<div class="notice gt-status"><div class="wrap"><span class="tag">{PLAN[0]}</span><span>{PLAN[1]}</span></div></div>'


def jump():
    names = ["Ways in", "Fares", "On the day and getting home", "Questions"]
    return ('<nav class="tp-jump" aria-label="Jump to"><div class="wrap">'
            + "".join(f'<button type="button" data-j="{i}"><i>{i + 1}</i>{n}</button>' for i, n in enumerate(names)) + '</div></nav>')


CDO = """<h3 id="cdoTitle">Compare Driving Options</h3>
<p class="cdo-intro">Prices aren’t out yet, I’ll add them when they are. What RIAT has said so far is that the Park and Ride and the rail shuttles will be free, so for most people that’s the one I would look at first.</p>
<div class="cdo-row"><span class="cdo-name">Park and Ride<small>Sites to follow, free with your ticket</small></span><span class="cdo-track"><i style="--c:#2BA84A;--w:0%"></i></span><span class="cdo-cost">Free</span></div>
<div class="cdo-row"><span class="cdo-name">Rail shuttles<small>Salisbury, Andover and Swindon</small></span><span class="cdo-track"><i style="--c:#D74949;--w:0%"></i></span><span class="cdo-cost">Free</span></div>
<div class="cdo-row"><span class="cdo-name">Show car parks<small>MOD Boscombe Down, open 06:00</small></span><span class="cdo-track"><i style="--c:#13293C;--w:0%"></i></span><span class="cdo-cost">Not out yet</span></div>
<p class="cdo-note">The bars will fill in once RIAT publishes the RIAT27 prices. For the last show at Fairford, pre paid parking was £15 a car and £7.50 a motorbike, and that is being refunded. These are the 2027 plans as of November 2026, so I would check them again before you go.</p>"""

CPK = """<div class="cpk-head"><h3 id="cpkTitle">Car Parks at Boscombe Down</h3><p>The transport plan is still being worked out, so there’s no parking to book yet. I’ll add every car park, its postcode and its price when RIAT publishes them.</p></div>
<div class="cpk-board" role="table" aria-label="Car parks and costs">
<div class="cpk-th" role="row"><span></span><span role="columnheader">Car park</span><span role="columnheader">Cost in 2027</span></div>
<div class="cpk-r" role="row" style="--c:#13293C"><i></i><span class="cpk-n" role="cell">Show car parks, MOD Boscombe Down</span><span class="cpk-v" role="cell">Prices aren’t out yet</span></div>
<div class="cpk-r" role="row" style="--c:#2BA84A"><i></i><span class="cpk-n" role="cell">Park and Ride</span><span class="cpk-v" role="cell">Free, sites to follow</span></div>
<div class="cpk-r" role="row" style="--c:#D74949"><i></i><span class="cpk-n" role="cell">Rail shuttles from Salisbury, Andover and Swindon</span><span class="cpk-v" role="cell">Free with a general admission ticket</span></div>
<div class="cpk-r" role="row" style="--c:#6950A1;--bg:#FBF5E4"><i></i><span class="cpk-n" role="cell">Accessible parking</span><span class="cpk-v" role="cell">Details to follow</span></div>
<div class="cpk-r" role="row" style="--c:#6950A1;--bg:#FBF5E4"><i></i><span class="cpk-n" role="cell">Pre paid parking for the Fairford show</span><span class="cpk-v" role="cell">Refunded, £15 a car, £7.50 a motorbike</span></div>
</div>
<div class="cpk-grid">
<div class="cpk-box"><h4>Opening Times</h4><p>What RIAT has said so far.</p><div class="cpk-t"><div><span>Car parks open</span><b>06:00 each show day</b></div><div><span>Gates and flying</span><b>Nearer the show</b></div></div><small>I would try to arrive about an hour before you want to be on the crowd line.</small></div>
<div class="cpk-box"><h4>Park and Ride</h4><p>Planned for RIAT27.</p><div class="cpk-t"><div><span>Cost</span><b>Free</b></div><div><span>Sites</span><b>Not out yet</b></div><div><span>Times</span><b>Not out yet</b></div></div><small>You’ll need a general admission ticket to board.</small></div>
<div class="cpk-box"><h4>Already Booked?</h4><p>Pre paid Fairford parking.</p><div class="cpk-t"><div><span>Refund</span><b>Automatic, by end of December 2026</b></div><div><span>Boscombe Down</span><b>Priority booking if offered</b></div></div><small>Cream rows on the board are the ones I would check before you set off.</small></div>
</div>"""

FARES = """<div class="nss tp-fares" id="tpFares"><div class="nss-in" style="background:#E3F1F8;padding:0"><div class="nss-scr">
<div class="nss-low">
<div>
<div class="nss-hd"><span class="nss-sq"><svg viewBox="0 0 24 24" fill="none" stroke="#13293C" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/></svg></span><div class="nss-bar"><b>Fares</b><span>Every price for getting to and parking at the show, in one place.</span></div></div>
<div class="nss-fares">
<a class="nss-pen" href="https://www.ukairshowguide.co.uk/airshow-public-transport" target="_top"><b>Plan my<br>journey</b><small>All transport options</small></a>
<div>
<p class="nss-sub">Shuttles <em>Free with your ticket</em></p>
<div class="nss-tiles">
<div class="nss-tile" style="--c:#2BA84A"><i>P+R</i><span>Park and Ride<b>Free</b></span></div>
<div class="nss-tile" style="--c:#D74949"><i>Rail</i><span>Rail shuttles<b>Free</b></span></div>
</div>
<p class="nss-sub">Tickets and parking</p>
<div class="nss-tiles">
<div class="nss-tile" style="--c:#6950A1"><i>U18</i><span>Under 18s with an adult<b>Free</b></span></div>
<div class="nss-tile" style="--c:#13293C"><i>Car</i><span>Show car parks<b>Not out yet</b></span></div>
</div>
<p class="nss-small">Tickets are on sale now, in advance only. Prices aren’t out yet for parking, I’ll add them when they are.</p>
</div>
</div>
</div>
<div class="nss-disc">
<div class="nss-hd"><span class="nss-sq" style="background:#6950A1;color:#fff">%</span><div class="nss-bar"><b>Save money</b></div></div>
<div class="nss-dl">
<div class="nss-dr"><b>Under 18s <span>| Free</span></b><p>Children under 18 go free with an adult holding a ticket.</p></div>
<div class="nss-dr"><b>Shuttles <span>| Free</span></b><p>RIAT plans free Park and Ride and rail shuttles. You’ll need a general admission ticket to board.</p></div>
<div class="nss-dr"><b>Local residents <span>| Discount</span></b><p>Discounted passes for local residents are coming, with details due in early 2027.</p></div>
</div>
</div>
</div>
<div class="mf" id="mfBox">
<div class="mf-tabs" role="tablist" aria-label="More fares">
<button type="button" role="tab" aria-selected="true" data-p="train"><i style="--c:#D70428">Rail</i>Train</button>
<button type="button" role="tab" aria-selected="false" data-p="park"><i style="--c:#13293C">P</i>Parking</button>
</div>
<div class="mf-p" data-p="train">
<div class="mf-grid">
<div class="mf-t"><small>Rail shuttles</small><b>Free</b><span>With a general admission ticket</span></div>
<div class="mf-t"><small>Train fares</small><b>Not out yet</b><span>Depends where you start</span></div>
</div>
<ul class="mf-l"><li>Free rail shuttles are planned from Salisbury, Andover and Swindon stations. The times aren’t out yet.</li><li>I would hold off on Advance train tickets until the shuttle plans are out.</li><li>A Family &amp; Friends Railcard takes a third off adult rail fares and 60% off children’s, and under 5s travel free.</li></ul>
</div>
<div class="mf-p" data-p="park" hidden>
<div class="mf-grid">
<div class="mf-t"><small>Show car parks</small><b>Not out yet</b><span>RIAT27</span></div>
<div class="mf-t"><small>Fairford car, refunded</small><b>£15</b><span>Pre paid, 2026</span></div>
<div class="mf-t"><small>Fairford motorbike, refunded</small><b>£7.50</b><span>Pre paid, 2026</span></div>
</div>
<ul class="mf-l"><li>Prices aren’t out yet, I’ll add them when they are.</li><li>If parking is offered at Boscombe Down, people who pre paid for Fairford get priority booking.</li></ul>
</div>
</div>
</div></div></div>"""

PBX = """<div class="pbx">
<div class="pbx-in">
<div class="pbx-band"><b>RIAT</b><span id="pbxBandLabel">On the day</span></div>
<div class="pbx-tabs" role="tablist" aria-label="Travel information">
<button type="button" class="pbx-tab" role="tab" aria-selected="true" data-pane="day" style="--c:#6950A1"><i aria-hidden="true"></i><span><b>On the day</b><small>Show times, facilities and tips</small></span></button>
<button type="button" class="pbx-tab" role="tab" aria-selected="false" data-pane="home" style="--c:#D74949"><i aria-hidden="true"></i><span><b>Getting home</b><small>Last shuttles, taxis and traffic</small></span></button>
</div>
<div class="pbx-pane pbx-grid pbx-3" data-pane="day" data-label="On the day" role="tabpanel">
<section class="pbx-box"><h4>Times</h4><p>What RIAT has said for RIAT27 so far.</p>
<div class="pbx-th"><span>What</span><span>Time</span></div>
<div class="pbx-row"><span>Car parks open</span><b>06:00</b></div><div class="pbx-row"><span>Friday display</span><b>Four hours plus</b></div><div class="pbx-row"><span>Saturday and Sunday</span><b>Seven hours plus</b></div>
<p class="pbx-note">Exact gate and flying times come nearer the show, I’ll add them when they’re out.</p></section>
<section class="pbx-box"><h4>Facilities</h4><p>The showground layout isn’t out yet.</p>
<div class="pbx-way" style="--c:#13293C"><em>Map</em><div><b>Showground layout</b><span>Where you’ll watch from, to follow.</span></div></div>
<div class="pbx-way" style="--c:#6950A1"><em>Seats</em><div><b>Enclosures and grandstand</b><span>Packages are paused while the new options are worked out.</span></div></div>
<div class="pbx-way" style="--c:#32B4AF;--i:#13293C"><em>Help</em><div><b>RIAT Customer Services</b><span>01285 713456</span></div></div></section>
<section class="pbx-box"><h4>Good to know</h4><p>How I would plan the day.</p>
<ul class="pbx-tips"><li>If you want a front row seat, head to the crowd line first and save your pitch, then look round the static park.</li><li>Visit the toilet before the flying starts. Use a display you aren’t fussed about as your break.</li><li>Your child’s ears are delicate, so try to protect them as much as possible with ear defenders.</li><li>Keep your ticket handy, as you’ll need it to board the free shuttles.</li></ul></section>
</div>
<div class="pbx-pane pbx-grid" data-pane="home" data-label="Getting home" role="tabpanel" hidden>
<section class="pbx-box"><h4>Last services</h4><p>When the last shuttles leave.</p>
<div class="pbx-th"><span>Service</span><span>Last</span></div>
<div class="pbx-row"><span>Rail shuttles</span><b>Not out yet</b></div><div class="pbx-row"><span>Park and Ride</span><b>Not out yet</b></div><div class="pbx-row"><span>Swindon Shuttle</span><b>Not out yet</b></div>
<p class="pbx-note">I’ll add the last times as soon as RIAT publishes them.</p></section>
<section class="pbx-box"><h4>Taxis</h4><p>Local firms near Amesbury and Salisbury.</p>
<p class="pbx-note">I’ll add local firms and wheelchair accessible taxis once the drop off points are out.</p></section>
<section class="pbx-box"><h4>Ways home</h4><p>What RIAT has planned so far.</p>
<div class="pbx-way" style="--c:#D74949"><em>Train</em><div><b>Rail shuttle back</b><span>To Salisbury, Andover or Swindon station.</span></div></div>
<div class="pbx-way" style="--c:#2BA84A"><em>P+R</em><div><b>Park and Ride</b><span>Back to your car, sites to follow.</span></div></div>
<div class="pbx-way" style="--c:#C2255C"><em>Coach</em><div><b>Swindon Shuttle</b><span>Times to follow.</span></div></div>
<div class="pbx-way" style="--c:#13293C"><em>Car</em><div><b>Show car parks</b><span>I would expect a slow exit after a big show.</span></div></div></section>
<section class="pbx-box"><h4>Good to know</h4><p>Before the last display ends.</p>
<ul class="pbx-tips"><li>Agree a pick up time and place in advance, as phone signal can be poor in big crowds.</li><li>Look at the last shuttle back to your station before you set off.</li><li>Staying on for the static park can let the queues go down.</li><li>Hotels round Salisbury and Amesbury will go fast, so a room you can cancel for free might work well.</li></ul></section>
</div>
</div>
</div>"""


SIDE = ('<aside class="xd-side" style="min-width:0"><div class="ft-nav"><h4>In this topic</h4><ul>'
        '<li><button type="button" data-go=".xd-sec">Planning tips<i aria-hidden="true">→</i></button></li>'
        '<li><button type="button" data-go=".xd-good">Good to know<i aria-hidden="true">→</i></button></li></ul></div>'
        '<div class="ft-help"><h4>Need a hand on the day?</h4><p>If you use a wheelchair, a mobility scooter or just need step free routes, '
        'I’ll put the accessible ways in all in one place once RIAT publishes them.</p><button type="button" data-flag="4">Accessible arrival <span aria-hidden="true">→</span></button></div></aside>')


def explorer():
    flags, panes = [], []
    n = sum(len(t) for g, c, t in TOPICS)
    k = 0
    for gi, (g, c, items) in enumerate(TOPICS):
        flags.append(f'<button type="button" class="xd-flag" role="tab" data-g="{gi}" style="--c:{c};min-width:0" aria-selected="{str(gi == 0).lower()}">'
                     f'<span class="xd-ring">{ICONS[g]}</span><b>{e(g)}</b><small>{len(items)} option{"s" if len(items) > 1 else ""}</small></button>')
        stops = "".join(f'<li><button type="button" class="xd-hstop" data-id="{i[0]}" aria-current="{str(j == 0).lower()}"><span class="xd-sl" aria-hidden="true">Option {"ABCDEF"[j]}</span>'
                        f'<b>{e(i[1])}</b><small>{e(i[2])}</small></button></li>' for j, i in enumerate(items))
        cards = ""
        for j, (tid, name, sub, title, lead, stats, tips, good) in enumerate(items):
            k += 1
            st = "".join(f'<div class="ft-stat">{ICONS[g]}<div><small>{e(a)}</small><b>{e(b)}</b></div></div>' for a, b in stats)
            cols = "".join(f'<div><h4>{e(h)}</h4><p>{e(p)}</p></div>' for h, p in tips)
            cards += (f'<div class="xd-content" data-id="{tid}"{"" if j == 0 else " hidden"}>'
                      f'<div class="xd-blindbar"><b>{e(name)}</b><span>{e(g.replace("By ", "").capitalize())}, stop {k} of {n}</span></div>'
                      f'<div class="xd-title"><h3>{e(title)}</h3><p class="lead">{e(lead)}</p></div>'
                      f'<div class="ft-stats">{st}</div>'
                      f'<section class="xd-sec"><h4>Planning tips</h4><div class="cols">{cols}</div></section>'
                      f'<div class="xd-good"><h4>Good to know</h4><p class="xd-note">{e(good)}</p>'
                      f'<p class="update">I would check the official sources just before you travel. I’ll update this guide when RIAT publishes the transport plan.</p>'
                      f'<div class="btns"><a class="btn small ghost" target="_blank" rel="noopener" href="{FAQ_URL}">Official: RIAT Boscombe Down questions ↗</a></div></div></div>')
        panes.append(f'<div class="xd-page" data-g="{gi}" role="dialog" aria-modal="false" aria-label="{e(g)}"{"" if gi == 0 else " hidden"}>'
                     f'<div class="xd-page-bar"><button type="button" class="xd-back">&lsaquo; Back</button><b class="xd-page-t">{e(g)}</b></div>'
                     f'<div class="xd-line-box" style="--c:{c};--cs:{c}24;--cm:{c}48;--cb:{c}99"><div class="xd-line-h"><span class="xd-roundel">{ICONS["_roundel"]}</span>{e(g)}</div><ol class="xd-hline">{stops}</ol></div>'
                     f'<div class="xd-body"><div class="xd-card" style="--c:{c};--cs:{c}24;--cm:{c}48;--cb:{c}99;min-width:0">{cards}</div>{SIDE}</div></div>')
    return (f'<section class="explore xd-on" id="explore" aria-label="Arrival information"><div class="xd xd-mix">'
            f'<div class="xd-top"><div class="xd-wrap"><div class="xd-head"><h2>Choose a topic</h2>'
            f'<p>Pick a train, Park and Ride, road or access option and I’ll show you what RIAT has said so far. I’ll add the maps, routes and times as soon as they’re out.</p></div></div></div>'
            f'<div class="xd-wrap"><div class="xd-flags" role="tablist" aria-label="Ways to get there" style="--n:{len(TOPICS)}">{"".join(flags)}</div>{"".join(panes)}</div></div></section>')


def questions():
    rows = "".join(f'<details{" open" if i == 0 else ""}><summary>{e(q)}</summary><div class="body">{e(a)}</div></details>' for i, (q, a) in enumerate(QUESTIONS))
    return f'<div class="wrap"><div class="acc">{rows}</div></div>'


SCRIPT = """<script>
(function(){
  var tr=document.getElementById('travel'); if(!tr) return;
  /* step tabs, as on every feature page */
  var J=['#explore','#tpFares','.pbx','#travel .acc'];
  tr.querySelector('.tp-jump').addEventListener('click',function(ev){var b=ev.target.closest('button');if(!b)return;var el=document.querySelector(J[+b.dataset.j]);if(el)window.scrollTo({top:el.getBoundingClientRect().top+pageYOffset-70,behavior:'smooth'});});
  /* Choose a topic: the flags pick a group, the line picks an option */
  var ex=document.getElementById('explore'), xd=ex.querySelector('.xd'), last=null;
  var phone=window.matchMedia?window.matchMedia('(max-width:640px)'):{matches:false};
  function shut(){xd.classList.remove('xd-open');document.documentElement.style.overflow='';if(last)last.focus();}
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&xd.classList.contains('xd-open'))shut();});
  if(phone.addEventListener)phone.addEventListener('change',function(){if(!phone.matches)shut();});
  ex.addEventListener('click',function(ev){
    var f=ev.target.closest('.xd-flag');
    if(f){ex.querySelectorAll('.xd-flag').forEach(function(x){x.setAttribute('aria-selected',String(x===f));});
      ex.querySelectorAll('.xd-page').forEach(function(p){p.hidden=p.dataset.g!==f.dataset.g;});
      /* on phones each way in opens as its own page, with Back to return to the list, as on every feature page */
      if(phone.matches){last=f;xd.classList.add('xd-open');document.documentElement.style.overflow='hidden';var pg=ex.querySelector('.xd-page:not([hidden])');pg.scrollTop=0;setTimeout(function(){var bk=pg.querySelector('.xd-back');if(bk)bk.focus();},60);}
      return;}
    if(ev.target.closest('.xd-back')){shut();return;}
    var go=ev.target.closest('[data-go]');
    if(go){var c=go.closest('.xd-body').querySelector('.xd-content:not([hidden]) '+go.dataset.go);if(c)window.scrollTo({top:c.getBoundingClientRect().top+pageYOffset-70,behavior:'smooth'});return;}
    var fl=ev.target.closest('[data-flag]');
    if(fl){var t=ex.querySelectorAll('.xd-flag')[+fl.dataset.flag];if(t)t.click();return;}
    var s=ev.target.closest('.xd-hstop');
    if(s){var pg=s.closest('.xd-page');pg.querySelectorAll('.xd-hstop').forEach(function(x){x.setAttribute('aria-current',String(x===s));});
      pg.querySelectorAll('.xd-content').forEach(function(c){c.hidden=c.dataset.id!==s.dataset.id;});}
  });
})();
</script>"""


def section(banner):
    css = (HERE / "travel.css").read_text(encoding="utf8")
    return (f'<section class="panel flush" id="travel" aria-label="Getting there and parking">\n<style id="riat-travel-css">{css}</style>\n'
            f'{hero(banner)}\n{plan_note()}\n{jump()}\n'
            f'<div class="wrap"><section class="cdo in" id="cdo" aria-labelledby="cdoTitle">\n{part("cdo-style.html")}\n{CDO}\n</section></div>\n'
            f'<div class="wrap"><section class="cpk" id="cpk" aria-labelledby="cpkTitle">\n{part("cpk-style.html")}\n{CPK}\n</section></div>\n'
            f'{explorer()}\n{part("pbx-style.html")}{part("nss-style.html")}{FARES}\n{PBX}\n'
            f'{re.sub(r"/[*] move the planner.*?}[)][(][)];", "", part("pbx-script.html"), flags=re.S)}\n'
            f'{part("nss-script.html")}\n{questions()}\n<div style="height:88px"></div>\n{SCRIPT}\n</section>')
