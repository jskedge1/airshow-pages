"""Round 2 (Jack, 22 Nov 2026): the Headcorn page built IN the Duxford template.

Headcorn's own page (live-source.html) already uses the Duxford page skeleton, with Headcorn's content in it.
This step makes the rest match Duxford, and adds nothing of its own:
  1. the shared styles and scripts that differ from Duxford's are replaced by Duxford's,
  2. the last layer of style and script blocks (the go live look) is Duxford's, in Duxford's order,
     with Headcorn's own data put back in where a block carries show facts,
  3. a few blocks inside sections are put in Duxford's layout,
  4. sections and blocks Duxford doesn't have are taken out (listed in LEFT_OUT).
Only Headcorn's own words, facts and photos are used. See NEW-DESIGN-ROLLOUT-2.md.
"""
import re

BLOCK = re.compile(r"<(script|style|template)\b([^>]*)>(.*?)</\1>", re.S)

# Things on the old Headcorn page that the Duxford page does not have. Left out, for Jack to ask back.
LEFT_OUT = [
    "The Ground Show section (the old page's section in Duxford's Flightline walk place). Headcorn has no flightline "
    "walk, so the Flightline walk section is left out too.",
    "Fares board (Getting there): the More fares tabs (train, bus, coach, town parking, taxi), as Headcorn's page has "
    "no prices for them. The board shows Headcorn's own ticket, parking and camping prices.",
    "On the day and getting home jump button (Getting there): the page has no block for it to go to.",
    "Compare driving options (#cdo, Getting there): Headcorn has one car park price (free general parking), so "
    "there is nothing to compare.",
]


# Fares and save money board: Headcorn's own prices, each one checked against the page's own words (FARES_FACTS).
FARES = """
<div class="nss tp-fares" id="tpFares"><div class="nss-in" style="background:#E3F1F8;padding:0"><div class="nss-scr">
<div class="nss-low">
<div>
<div class="nss-hd"><span class="nss-sq"><svg viewBox="0 0 24 24" fill="none" stroke="#13293C" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/></svg></span><div class="nss-bar"><b>Fares</b><span>Every price for the show, tickets, parking and camping, in one place.</span></div></div>
<div class="nss-fares">
<a class="nss-pen" href="https://www.ukairshowguide.co.uk/airshow-public-transport" target="_top"><b>Plan my<br>journey</b><small>All transport options</small></a>
<div>
<p class="nss-sub">Show tickets <em>2027 prices</em></p>
<div class="nss-tiles">
<div class="nss-tile" style="--c:#E0592A"><i>Adult</i><span>General Admission<b>From £30</b></span></div>
<div class="nss-tile" style="--c:#6950A1"><i>Child</i><span>Aged 5 and under<b>Free</b></span></div>
<div class="nss-tile" style="--c:#C2255C"><i>Seat</i><span>Fighter Row<b>From £75</b></span></div>
<div class="nss-tile" style="--c:#13293C"><i>VIP</i><span>Mustang Lounge<b>From £140</b></span></div>
</div>
<p class="nss-sub">Friday and parking</p>
<div class="nss-tiles">
<div class="nss-tile" style="--c:#44AED6;--i:#13293C"><i>Fri</i><span>Futures and Arrivals Day<b>£7.50</b></span></div>
<div class="nss-tile" style="--c:#2BA84A"><i>Car</i><span>General parking<b>Free</b></span></div>
</div>
<p class="nss-sub">Camping on the airfield <em>2027 early bird</em></p>
<div class="nss-tiles">
<div class="nss-tile" style="--c:#2BA84A"><i>Tent</i><span>Up to two people<b>£149</b></span></div>
<div class="nss-tile" style="--c:#2BA84A"><i>Tent</i><span>Up to four people<b>£240</b></span></div>
</div>
<p class="nss-small">Every ticket is booked in advance as an e-ticket, and there are no sales on the gate.</p>
</div>
</div>
</div>
<div class="nss-disc">
<div class="nss-hd"><span class="nss-sq" style="background:#6950A1;color:#fff">%</span><div class="nss-bar"><b>Save money</b></div></div>
<div class="nss-dl">
<div class="nss-dr"><b>Aged 5 and under <span>| Free</span></b><p>Children aged 5 and under go free with an adult booking.</p></div>
<div class="nss-dr"><b>Parking <span>| Free</span></b><p>Parking is free on grass fields beside the site, first come first served, with no booking.</p></div>
<div class="nss-dr"><b>Friday arrivals day</b><p>The Futures and Arrivals Day on Friday 25 June costs £7.50 and is free for schoolchildren and veterans.</p></div>
<div class="nss-dr"><b>Camp for the weekend</b><p>The camping price includes entry to both show days for everyone on the booking.</p></div>
</div>
</div>
</div>
</div></div></div>
"""
FARES_FACTS = [
    "For 2027, General Admission starts at &pound;30 per adult, Fighter Row seats on the flightline start at &pound;75 and the Mustang Lounge VIP experience starts at &pound;140.",
    "Children aged 5 and under go free with an adult booking.",
    "The Futures and Arrivals Day on Friday 25 June costs &pound;7.50 and is free for schoolchildren and veterans.",
    "Parking is free on grass fields beside the site, first come first served, with no booking.",
    "<span>Parking</span><b>Free, no booking needed</b>",
    "the price includes entry to both show days for everyone on the booking. For 2027 the early bird price is &pound;149 for up to two people or &pound;240 for up to four, booked in advance.",
    "Every ticket is booked in advance as an e-ticket, and there are no sales on the gate.",
]


def blocks(html):
    return list(BLOCK.finditer(html))


def head_of(m, n=60):
    return re.sub(r"\s+", " ", m.group(3).strip()[:n])


def swap_block_body(html, m, new_body):
    return html[:m.start(3)] + new_body + html[m.end(3):]


def one(html, old, new, what):
    assert html.count(old) == 1, what + ": found %d times" % html.count(old)
    return html.replace(old, new, 1)


# Duxford's train route header (block "Train route header on the Duxford train topics"), with Headcorn's own
# train facts from its timetable data (TT "headcorn", checked 15 Nov 2026) and its own topic text.
HC_TRAIN_H = r"""  var H={
    'rail-headcorn':hero({to:'Headcorn',board:'HEADCORN',dep:'07:04',arr:'08:11',via:'From London Charing Cross',
      p:'Headcorn station is on the Southeastern line between London Charing Cross and Ashford International, about an hour from London. The aerodrome is about 1.5 miles away, so roughly a 5 minute taxi ride, about a 30 minute walk, or a short hop on the number 12 bus.',
      kd:[['How often','Every 30 minutes from Charing Cross'],['Get off at','Headcorn',1],['Then','Taxi, about 5 minutes'],['From London','About 1 hour 7 minutes'],['Run by','Southeastern']],
      jr:'London Charing Cross to Headcorn, via London Bridge, Sevenoaks and Tonbridge. These are Saturday times from the winter timetable, so check again nearer the show.',
      from:'London Charing Cross',at:'Headcorn',mid:'Southeastern<br>1h 7m'}),
    'rail-ashford':hero({to:'Ashford',board:'ASHFORD INTL',dep:'07:40',arr:'08:18',via:'From London St Pancras',
      p:'Ashford International has high speed Southeastern trains from London St Pancras and the line from London Charing Cross, which also calls at Headcorn.',
      kd:[['How often','Every 30 minutes, Ashford to Headcorn'],['Get off at','Ashford International',1],['Then','08:30 train to Headcorn, or a taxi'],['Run by','Southeastern']],
      jr:'London St Pancras to Ashford International on the high speed line, then the 08:30 to Headcorn, arriving 08:43. These are Saturday times from the winter timetable, so check again nearer the show.',
      from:'London St Pancras',at:'Ashford International',mid:'Southeastern high speed<br>38 min'})
  };"""


def assemble(hc, dx):
    # Duxford's Fares board (added on main, 23 Nov 2026): its styles and its board come out of the template here, so
    # the two pages' blocks line up; Headcorn's own board goes in at the same place further down (with the same styles).
    c = dx.index('<style id="fares-board-css">')
    fb_css = dx[c:dx.index("</style>", c) + len("</style>")]
    s0 = dx.index('<div class="nss tp-fares" id="tpFares">')
    s1 = dx.index("</div></div></div>", s0) + len("</div></div></div>")
    assert dx[c + len(fb_css):s0].strip() == "" and dx[s1:].lstrip().startswith('<div class="wrap">')
    dx = dx[:c] + dx[s1:]

    db = blocks(dx)
    hb = blocks(hc)
    assert len(db) == 160 and len(hb) == 153, (len(db), len(hb))

    # 1. shared styles and scripts: Duxford's (they hold no show facts). Same place on both pages.
    #    71 and 78 are the Getting there layout script (jump list: Ways in, Fares, Questions) and the jump strip style.
    for i, expect in [(0, ":root{"), (2, "/* "), (38, "/* ===== new sections"), (59, "/* Three trial"), (67, "/* transport tabs"),
                      (71, "/* Transport section, pier poster"), (78, "body #travel .tp-jump .wrap")]:
        assert head_of(hb[i]).startswith(expect) and head_of(db[i]).startswith(expect), i
    for i in (78, 71, 67, 59, 38, 2, 0):           # from the end, so earlier positions stay right
        body = db[i].group(3).replace("IWM Duxford sun path guide", "sun path guide").replace("Duxford extras:", "show page extras:")
        hc = swap_block_body(hc, blocks(hc)[i], body)
    hb = blocks(hc)

    # 2. the last layer (blocks 91 on, nothing but style and script): Duxford's, with Headcorn's data blocks
    assert hc[hb[90].end():hb[91].start()].strip() == "" and dx[db[90].end():db[91].start()].strip() == ""
    hcb = {i: hb[i].group(0) for i in range(len(hb))}
    tail = []
    for i in range(91, len(db)):
        b = db[i].group(0)
        h = head_of(db[i], 90)
        if h.startswith("(function(){ var D={overview:"):                         # fold bar subtitles
            b = hcb[116].replace("How Clacton rates", "How Headcorn rates")
            assert "Clacton" not in b
        elif h.startswith("(function(){ function go(){ var hero=document.querySelector('header.cg"):
            b = hcb[118]                                                         # header: Headcorn's key details have no "when" row
        elif h.startswith("(function(){ var IN=[['#32B4AF'"):
            b = hcb[128]                                                         # map tab note only when there's an outside spot
        elif h.startswith("/* Train route header on the Duxford train topics"):
            body = db[i].group(3)
            a, z = body.index("  var H={"), body.index("  function cur()")
            body = body[:a] + HC_TRAIN_H + "\n" + body[z:]
            body = body.replace("train-to-duxford", "train-to-headcorn").replace("on the Duxford train topics", "on the Headcorn train topics")
            b = b.replace(db[i].group(3), body)
        elif h.startswith('body #explore .trl-top[data-id="rail-whit"]'):
            continue                                                             # a Duxford station only
        elif h.startswith("/* parts taken off the Clacton page, kept off Duxford too */"):
            b = b.replace("kept off Duxford too", "kept off Headcorn too")
        tail.append(b)
    hc = hc[:hb[91].start()] + "\n".join(tail) + hc[hb[-1].end():]

    # 3. blocks inside sections, in Duxford's layout
    # Getting there: the photo beside the text fills its box, as Duxford's busbar photo does
    hc = one(hc, '<div class="busbar reveal">\n      <figure><img', '<div class="busbar reveal">\n      <figure class="busfig"><img', "busbar figure")
    # Experience flights: Duxford's big card is the sixth of the eight; Headcorn's moves to the sixth of seven
    m = re.search(r'\s*<article class="xf-card xf-hero".*?</article>', hc, re.S)
    hero = m.group(0)
    hc = hc[:m.start()] + hc[m.end():]
    m2 = re.search(r'\s*<article class="xf-card" data-tags="learn">', hc)
    assert m2
    hc = hc[:m2.start()] + hero + hc[m2.start():]

    # Jack's comment on the preview (22 Nov 2026), How arrival works: "remove the pic". The entry queue photo goes and
    # step 2 reads as text like steps 1 and 3. The photo stays in the page, hidden, as other parts of the page use it.
    m = re.search(r'<figure class="arrive-step arrive-photo">(<img class="photo" data-pic="queue_grass"[^>]*>)<figcaption><span class="arrive-n">2</span><b>The entry queue\.</b> (.*?)</figcaption></figure>', hc)
    assert m, "entry queue photo"
    img = m.group(1).replace("<img ", "<img hidden ", 1)
    hc = hc[:m.start()] + '<div class="arrive-step"><span class="arrive-n">2</span><h3>The entry queue</h3><p>' + m.group(2) + '</p></div><div hidden style="display:none!important">' + img + '</div>' + hc[m.end():]

    # Fares and save money board (Jack, 22 Nov 2026, "add back the fare section on all pages"): Duxford's board styles
    # and place (straight after Choose a topic), with Headcorn's own prices only, each checked against the page.
    for t in FARES_FACTS:
        assert t in hc, "fares fact not on the page: " + t
    i = hc.index('<section class="explore" id="explore"')
    j = hc.index("</section>", i) + len("</section>")
    hc = hc[:j] + "\n" + fb_css + FARES + hc[j:]
    assert "['Fares', '#tpFares']" in hc and "'.pbx'" not in hc.split("var JUMPS", 1)[1][:200]

    # 4. left out: The Ground Show (no Flightline walk at Headcorn)
    hc = re.sub(r'\s*<button class="tab" role="tab" id="t-flightline"[^>]*>The Ground Show</button>', "", hc, count=1)
    m = re.search(r'<section class="panel" id="flightline".*?</section>\s*', hc, re.S)
    assert m and "The Ground <span" in m.group(0)
    hc = hc[:m.start()] + hc[m.end():]
    assert 'id="t-flightline"' not in hc
    return hc
