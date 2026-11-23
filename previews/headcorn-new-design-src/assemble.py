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
    "Fares and save money board (Getting there): Headcorn's page has no travel fares (no train, bus, coach, taxi or "
    "Park and Ride prices, and parking is free), so the board and its Fares jump button are left out.",
    "On the day and getting home jump button (Getting there): the page has no block for it to go to.",
    "Compare driving options (#cdo, Getting there): Headcorn has one car park price (free general parking), so "
    "there is nothing to compare.",
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
    db = blocks(dx)
    hb = blocks(hc)
    assert len(db) == 160 and len(hb) == 153, (len(db), len(hb))

    # 1. shared styles and scripts: Duxford's (they hold no show facts). Same place on both pages.
    for i, expect in [(0, ":root{"), (2, "/* "), (38, "/* ===== new sections"), (59, "/* Three trial"), (67, "/* transport tabs")]:
        assert head_of(hb[i]).startswith(expect) and head_of(db[i]).startswith(expect), i
    for i in (67, 59, 38, 2, 0):           # from the end, so earlier positions stay right
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

    # Getting there jump strip (round 2 brief, 20:30): no Fares board (Headcorn has no travel fares) and no On the day
    # and getting home box, so only the buttons that go somewhere stay, in a strip of two.
    hc = one(hc, "var JUMPS = [['Ways in', '#explore'], ['Fares', '#tpFares'], ['On the day and getting home', '.pbx'], ['Questions', '#travel .acc']];",
             "var JUMPS = [['Ways in', '#explore'], ['Questions', '#travel .acc']];", "jump strip")
    hc = one(hc, '<style id="tpJump4">', '<style id="tpJump4">\nbody #travel .tp-jump .wrap{grid-template-columns:repeat(2,minmax(0,1fr))!important}', "jump strip style")
    hc = one(hc, "@media (max-width:640px){body #travel .tp-jump .wrap{grid-template-columns:minmax(0,1fr)}}",
             "@media (max-width:640px){body #travel .tp-jump .wrap{grid-template-columns:minmax(0,1fr)!important}}", "jump strip phone")

    # 4. left out: The Ground Show (no Flightline walk at Headcorn)
    hc = re.sub(r'\s*<button class="tab" role="tab" id="t-flightline"[^>]*>The Ground Show</button>', "", hc, count=1)
    m = re.search(r'<section class="panel" id="flightline".*?</section>\s*', hc, re.S)
    assert m and "The Ground <span" in m.group(0)
    hc = hc[:m.start()] + hc[m.end():]
    assert 'id="t-flightline"' not in hc
    return hc
