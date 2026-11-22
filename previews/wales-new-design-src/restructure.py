"""Round 2 (Jack, 22 Nov 2026): the Wales page built IN the Duxford template, not the old Wales page with the new
look on top. Brief: previews/NEW-DESIGN-ROLLOUT-2.md.

build.py calls restructure() on the Wales page (live-source.html, photos already swapped for @@BLOBn@@ markers)
before it adds the new design. Every section keeps the Wales page's own words, facts, data and photos; what
changes is the structure, so each section has the same blocks, in the same order and with the same markup as
the Duxford page (previews/duxford-new-design-src/live-source.html).

Left out (see LEFT_OUT and the README): Wales sections and blocks the Duxford page does not have, and Duxford
blocks the Wales page has no facts for. Nothing here is made up: every sentence comes from the Wales page.
"""
import html as H
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
DUX = HERE.parent / "duxford-new-design-src" / "live-source.html"

PIN = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c-3.7 0-6.6 2.9-6.6 6.5 0 4.9 6.6 12.5 6.6 12.5s6.6-7.6 '
       '6.6-12.5c0-3.6-2.9-6.5-6.6-6.5z" fill="currentColor"/><circle cx="12" cy="9" r="2.5"/></svg>')

LEFT_OUT = [
    "The Ground Show section (Wales only). Its four ground display items now sit in Food and facilities under What to expect on the day, as on Duxford.",
    "Seafront information section (Wales only): the seafront map, Pick your pitch, sea mist and wind, from Mumbles and the water, the seafront kit list, and the show day tides board.",
    "Help on show days: the 'More in Seafront information' link in the boat answer (that section is left out).",
    "Where to watch: the 'Plan my day here' buttons on each spot (Duxford's spot tabs do not have them).",
    "Food and facilities: the Comfort, Family and Camera packing boxes at the end (Duxford has none there; the same items are in Photography and Plan your day).",
    "Duxford blocks with no Wales facts: the 2027 calendar in Overview, Sun at each show in Photography, the Pick your spot filter cards and the outside the fence note in Where to watch, the site shuttle box in Food and facilities, Top ten things to take in Plan your day.",
    "Duxford sections with no Wales facts: Flightline walk, Duxford's story (no Wales story), Experience flights.",
]


def _section(s, pid):
    """Start and end of <section ... id="pid"> ... </section>, nested sections counted."""
    a = s.index('id="%s"' % pid)
    a = s.rfind("<section", 0, a)
    depth = 0
    for m in re.finditer(r"<(/?)section\b", s[a:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            z = a + m.end() + 1
            return a, z
    raise ValueError(pid)


def _one(s, old, new):
    assert s.count(old) == 1, ("not found once", old[:120])
    return s.replace(old, new, 1)


def _cut(s, start, end_after):
    a = s.index(start)
    z = s.index(end_after, a) + len(end_after)
    return s[:a] + s[z:]


def _js_str(v):
    return v.strip()[1:-1]


def spots(s):
    """The Wales spots, read from the page's own where to watch data (its old tab builder)."""
    i = s.index("/* ===== where to watch: one transport tab per spot")
    j = s.index("];", i)
    out = []
    for m in re.finditer(r"\{id:'([a-z]+)',short:'([^']*)',name:'([^']*)',tag:'([^']*)',ll:\[([-\d.,]+)\].*?"
                         r"text:'([^']*)',\s*rows:\[(.*?)\]\],\s*more:'([^']*)'\}", s[i:j], re.S):
        rows = re.findall(r"\['([^']*)','([^']*)'\]", m.group(7) + "]")
        out.append(dict(id=m.group(1), short=m.group(2), name=m.group(3), tag=m.group(4), ll=m.group(5),
                        text=m.group(6), rows=rows, more=m.group(8)))
    assert [x["id"] for x in out] == ["cenotaph", "civic", "brynmill", "mumbles", "kilvey"], [x["id"] for x in out]
    return out


def ww_map(sp):
    """Where to watch, on the map: the Duxford block (tabs, text, facts, Google map), filled with the Wales spots."""
    e = H.escape
    tabs = "".join(
        '<button type="button" role="tab" class="ww-in" id="ww-wales-t%d" aria-controls="ww-wales-p%d" aria-selected="%s" tabindex="%d">'
        '<span class="xd-tt-ic">%s</span>%s</button>' % (i, i, "true" if i == 0 else "false", 0 if i == 0 else -1, PIN, e(x["short"]))
        for i, x in enumerate(sp))
    panels = "".join(
        '<div class="ww-panel ww-in" role="tabpanel" id="ww-wales-p%d" aria-labelledby="ww-wales-t%d"%s><div class="ww-txt">'
        '<h4>%s</h4><p class="ww-where">%s</p><p>%s</p><p>%s</p><ul class="ww-facts">%s</ul>'
        '<a class="ww-go" href="https://www.google.com/maps/search/?api=1&amp;query=%s" target="_blank" rel="noopener">'
        '<span class="xd-tt-ic">%s</span><span>Open in Google Maps</span><i aria-hidden="true">&rarr;</i></a></div>'
        '<div class="ww-map"><iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map of %s" '
        'src="https://www.google.com/maps?q=%s&amp;z=16&amp;output=embed" style="border:0;width:100%%;aspect-ratio:16/10"></iframe></div></div>'
        % (i, i, "" if i == 0 else " hidden", e(x["name"]), e(x["tag"]), x["text"], x["more"],
           "".join("<li><b>%s</b>%s</li>" % (e(a), e(b)) for a, b in x["rows"]),
           x["ll"], PIN, e(x["name"]), x["ll"])
        for i, x in enumerate(sp))
    return ('<section class="ww reveal" id="wwMap" aria-label="Where to watch, on the map">\n'
            '      <div class="ww-head"><div><h3>Where to watch, <em>on the map</em></h3></div>'
            '<p class="note">Pick a spot and the map will show you where it is.</p></div>\n'
            '      <div class="sw-tabs ww-tabs"><div class="xd-tt-tabs" role="tablist" aria-label="Viewing spots">'
            + tabs + "</div>" + panels + "</div>\n    </section>")


def restructure(s):
    dux = DUX.read_text(encoding="utf8")

    # ---- sections the Duxford page does not have: The Ground Show and Seafront information ----
    a, z = _section(s, "ground")
    ground = s[a:z]
    s = s[:a] + s[z:]
    a, z = _section(s, "seafront")
    s = s[:a] + s[z:]
    for t in ("ground", "seafront"):
        s = re.sub(r'\n\s*<button class="tab" role="tab" id="t-%s"[^\n]*</button>' % t, "", s, count=1)
        assert 'id="t-%s"' % t not in s
    s = _cut(s, '<script id="seafront-js">', "</script>")
    s = _cut(s, "<!-- seafront-command start", "<!-- seafront-command end -->")
    s = _cut(s, '<style id="sf-cards-box-css">', "</style>")
    s = re.sub(r' More in <button type="button" class="inlink" data-goto="seafront">[^<]*</button>\.', "", s, count=1)
    assert 'data-goto="seafront"' not in s

    # ---- Overview: Key details beside the intro with one of Jack's photos, then the jump boxes, as on Duxford ----
    a, z = _section(s, "overview")
    ov = s[a:z]
    jm = re.search(r'\n      <div class="jump boxes">\n(.*?)\n      </div>', ov, re.S)
    ov = ov.replace(jm.group(0), "", 1)
    btns = "\n".join("      " + l.strip() for l in jm.group(1).split("\n"))
    ov = _one(ov, "    </div>\n    <div class=\"band reveal\">",
              "    </div>\n\n    <div class=\"jump boxes reveal\">\n" + btns + "\n    </div>\n    <div class=\"band reveal\">")
    ov = _one(ov, "That has worked for me in the past.</p>\n      </div>",
              "That has worked for me in the past.</p>\n"
              '        <figure class="pic reveal"><img loading="lazy" decoding="async" class="photo" data-k="formation" alt="Battle of Britain Memorial Flight Dakota flanked by two Spitfires">'
              "<figcaption>The Battle of Britain Memorial Flight Dakota flanked by two Spitfires.</figcaption></figure>\n      </div>")
    s = s[:a] + ov + s[z:]

    # ---- Where to watch: Duxford's map tabs, filled with the Wales spots, and a photo to close ----
    sp = spots(s)
    s = _one(s, '<div class="ww sw-tabs reveal" id="wwTabs"></div>', ww_map(sp))
    a, z = _section(s, "watch")
    w = s[a:z]
    w = _one(w, "  </div>\n</section>",
             '    <figure class="pic wide reveal"><img loading="lazy" decoding="async" class="photo" data-k="typhoon" alt="RAF Typhoon climbing away in full afterburner">'
             "<figcaption>An RAF Typhoon climbing away in full afterburner.</figcaption></figure>\n  </div>\n</section>")
    s = s[:a] + w + s[z:]
    # the Duxford template's spot tab styles and switching (the Wales page only had its older tab builder)
    da = dux.index('<style id="sw-transport-tabs">')
    dz = dux.index("</script>", dux.index('<style id="ww-css">')) + len("</script>")
    wa = s.index('<style id="sw-transport-tabs">')
    wz = s.index("</script>", s.index("function syncPick", wa)) + len("</script>")
    s = s[:wa] + dux[da:dz] + s[wz:]

    # ---- the Duxford template's own stylesheet for its blocks (photos with captions, food, what to expect, stay search,
    #      topic list and the rest), which the Wales page never had ----
    xa = dux.rfind("<style>", 0, dux.index("/* Duxford extras:"))
    xz = dux.index("</style>", xa) + len("</style>")
    assert "data:" not in dux[xa:xz]
    s = _one(s, '<style id="hdr-tweak">', dux[xa:xz] + '\n<style id="hdr-tweak">')

    # ---- Overview jump boxes become tiles, as on Duxford (its glass-effect add-on; the photos in them are hidden by
    #      the page's own show-fix rules, and use Wales photo keys so nothing points at a Duxford photo) ----
    ga = dux.index('<style id="glass-effect">')
    gz = dux.index("</script>", dux.index('<script id="glass-effect-js">')) + len("</script>")
    glass = dux[ga:gz]
    glass = re.sub(r"var PICS=\{[^}]*\};", "var PICS={matchcheck:'spitfire',lineup:'typhoon',travel:'formation',timeline:'dakota'};", glass, count=1)
    glass = _one(glass, "var GO={right:'Read the guide',", "var GO={timeline:'Plan your day',right:'Read the guide',")
    s = _one(s, "<!-- mobile-fit:", glass + "\n<!-- mobile-fit:")

    # ---- Getting there: the train topic gets Duxford's train route header (trlStyle and its script), filled with the
    #      Wales page's own train facts (the Train to Swansea topic and the Saturday times in its train times data) ----
    ta = dux.index('<style id="trlStyle">')
    tz = dux.index("</style>", ta) + len("</style>")
    sa = dux.index('<script id="trlScript-dux">')
    sz = dux.index("</script>", sa) + len("</script>")
    trl = dux[sa:sz]
    h0 = trl.index("  var H={")
    h1 = trl.index("  function cur()")
    for fact in ("06:48", "London Paddington to Swansea", "GWR, arrives 09:31, via Reading, Bristol Parkway and Cardiff",
                 "Swansea station is right in the city centre.", "London about 2 hours 45 minutes, hourly",
                 "Around three trains an hour from Cardiff", "train-to-swansea"):
        assert fact in s, fact
    wales_h = ("  var H={\n"
               "    'rail':hero({to:'Swansea',board:'SWANSEA',dep:'06:48',arr:'09:31',via:'From London Paddington',\n"
               "      p:'Swansea station is right in the city centre. GWR runs direct trains from London Paddington via Reading, Bristol Parkway, Newport and Cardiff, and Transport for Wales runs services along the South Wales main line and west to Llanelli and Carmarthen.',\n"
               "      kd:[['How often','Hourly from London, around three an hour from Cardiff'],['Get off at','Swansea',1],['Then','Walk to the seafront'],['From London','About 2 hours 45 minutes'],['Run by','GWR, Transport for Wales']],\n"
               "      jr:'London Paddington to Swansea, direct, via Reading, Bristol Parkway and Cardiff. These are Saturday times from the autumn 2026 timetable, so check again nearer the show.',\n"
               "      from:'London Paddington',at:'Swansea',mid:'GWR, direct<br>2h 43m'})\n"
               "  };\n")
    trl = trl[:h0] + wales_h + trl[h1:]
    trl = trl.replace('<script id="trlScript-dux">', '<script id="trlScript-wales">', 1)
    trl = trl.replace("/* Train route header on the Duxford train topics, the same design as the Clacton train topic (9 Nov) */",
                      "/* Train route header on the train topic, the Duxford design, with the Wales train facts */", 1)
    trl = _one(trl, "https://www.ukairshowguide.co.uk/train-to-duxford", "https://www.ukairshowguide.co.uk/train-to-swansea")
    s = _one(s, '<style id="jx-css-dux">', dux[ta:tz] + "\n" + trl + "\n" + '<style id="jx-css-dux">')

    # ---- Food and facilities: Duxford's blocks (food, what to expect, boxes, traders, accessibility) ----
    a, z = _section(s, "facilities")
    f = s[a:z]
    fm = re.search(r'\n    <div class="fac boxes">\n(.*?)\n    </div>\n', f, re.S)
    boxes = re.findall(r'      <div class="reveal">(.*?)</div>\n', fm.group(1) + "\n", re.S)
    assert len(boxes) == 4 and "<h3>Food &amp; drink</h3>" in boxes[0] and "Kids&rsquo; activities" in boxes[1]
    food_fig = re.search(r'<figure class="fimg"><img (src="@@BLOB\d+@@") alt="([^"]*)" loading="lazy"><figcaption>(.*?)</figcaption></figure>', boxes[0])
    food = ('\n    <div class="food reveal">\n'
            '      <figure class="food-main"><img class="photo" %s alt="%s"><figcaption>%s</figcaption></figure>\n'
            '      <div class="food-text">\n        <h3>Food &amp; drink</h3>\n'
            "        <p>Food and drink trucks and market stalls along the promenade, plus the caf&eacute;s, pubs and restaurants in the city and the Marina.</p>\n"
            "        <p><b>My advice:</b> queues peak around lunchtime, so I would eat a little earlier or later.</p>\n"
            "      </div>\n    </div>\n" % (food_fig.group(1), food_fig.group(2), food_fig.group(3)))
    assert "Queues peak around lunchtime, so I would eat a little earlier or later." in boxes[0]
    # what to expect: the ground displays from the Wales page's own Ground Show section (2026)
    def card(title):
        m = re.search(r"<h4>%s</h4><p>(.*?)</p>" % re.escape(title), ground)
        assert m, title
        return m.group(1)
    exp = [("The Military Village", "chinook", "Chinook helicopter approaching head on", "The Military Village."),
           ("Simulators And VR", "typhoon2", "RAF Typhoon banking with its afterburners lit", "Simulators and VR."),
           ("Meet The Display Teams", "spitfire", "Battle of Britain Memorial Flight Spitfire banking overhead", "Meet the display teams."),
           ("Funfair And Amusements", "tracker", "French Securite Civile Tracker trailing smoke", "Funfair and amusements.")]
    expect = ('    <h3 class="sub-h reveal">What to expect on the day</h3>\n    <div class="expect reveal">\n'
              + "".join('      <figure><img class="photo" data-k="%s" alt="%s"><figcaption><b>%s</b> %s</figcaption></figure>\n'
                        % (k, alt, b, card(t)) for t, k, alt, b in exp)
              + "    </div>\n")
    facboxes = '\n    <div class="fac boxes reveal">\n' + "".join("      <div>%s</div>\n" % b for b in boxes[1:]) + "    </div>\n"
    f = f.replace(fm.group(0), food + "\n" + expect + facboxes, 1)
    f = _cut(f, '\n    <div class="pack boxes reveal">', "\n    </div>")
    s = s[:a] + f + s[z:]

    # ---- Pick your day: facts, the days, the picker, tip, official links, as on Duxford ----
    a, z = _section(s, "days")
    d = s[a:z]
    t0 = d.index('<div class="wk-tool sx-pick sw-tabs sw-pick">')
    t1 = d.index('<h3 class="fl-h">The Two Days In 2026</h3>')
    t2 = d.index('<div class="ns-note">', t1)
    tool, days = d[t0:t1], d[t1:t2]
    d = d.replace(tool, "", 1).replace(days, "", 1)
    d = _one(d, '</div></div><div class="ns-note">', '</div></div>' + days + tool + '<div class="ns-note">')
    d = _one(d, '</div><p class="note sf-src">',
             '</div><div class="sp-links"><a href="https://www.walesnationalairshow.com/" target="_blank" rel="noopener"><b>Official site</b>'
             '<span>The 2027 show, news and the flying timetable</span></a><a href="https://www.walesnationalairshow.com/wales-airshow-timetable/" '
             'target="_blank" rel="noopener"><b>Flying timetable</b><span>Display times for each day</span></a></div><p class="note sf-src">')
    s = s[:a] + d + s[z:]

    # ---- Plan your day: the sample day carries Duxford's ids ----
    s = _one(s, '<div><h3>A family on the Park and Ride on the Saturday</h3></div>\n      <p class="note" style="max-width:46ch">',
             '<div><h3 id="tlTitle">A family on the Park and Ride on the Saturday</h3></div>\n      <p class="note" style="max-width:46ch" id="tlNote">')
    s = _one(s, '\n    <div class="tl">\n      <div class="tl-item reveal"><span class="tl-time">09:00</span>',
             '\n    <div class="tl" id="tlList">\n      <div class="tl-item reveal"><span class="tl-time">09:00</span>')

    # ---- Where to stay: the search box, then the groups, as on Duxford ----
    a, z = _section(s, "stay")
    st = s[a:z]
    srch = re.search(r'\n    <div class="stay-group reveal">\n      <h3>Search for more places to stay</h3>.*?\n    </div>\n', st, re.S).group(0)
    links = re.findall(r'<li><b>([^<]*)</b><span>([^<]*)</span><a href="([^"]*)"', srch)
    assert [l[0] for l in links] == ["Booking.com", "Airbnb", "Visit Swansea Bay"]
    st = st.replace(srch, "\n", 1)
    first = st.index('\n    <div class="stay-group reveal">')
    last = st.index('\n    <p class="stay-note">')
    groups = st[first:last]
    st = (st[:first] + '\n    <div class="stay-search reveal">\n'
          "      <div><h3>Search everything nearby</h3><p>%s, %s, and %s.</p></div>\n"
          '      <div class="stay-links">\n'
          '        <a class="btn" href="%s" target="_blank" rel="noopener">Booking.com ↗</a>\n'
          '        <a class="btn ghost-n" href="%s" target="_blank" rel="noopener">Airbnb ↗</a>\n'
          '        <a class="btn ghost-n" href="%s" target="_blank" rel="noopener">Visit Swansea Bay ↗</a>\n'
          "      </div>\n    </div>\n" % (links[0][1], links[1][1][0].lower() + links[1][1][1:], links[2][1][0].lower() + links[2][1][1:], links[0][2], links[1][2], links[2][2])
          + '    <div id="stayGroups">' + groups.rstrip() + "\n    </div>\n" + st[last:])
    s = s[:a] + st + s[z:]

    # ---- Photography: the jump links carry the photographers' map, as on Duxford ----
    s = _one(s, '<nav class="ph-jump reveal" aria-label="In this section"><a href="#phSun">Sun guide</a>',
             '<nav class="ph-jump reveal" aria-label="In this section"><a href="#phSun">Sun guide</a><a href="#photoMap">Photographers&rsquo; map</a>')

    # ---- "Every part of this guide" card lines: the Wales page had some left from Clacton. Use the Wales page's
    #      own section lines instead (from its section bars). ----
    s = _one(s, "scores:'How Clacton rates for families and enthusiasts'", "scores:'Crowds, food, facilities and value for money, rated'")
    s = _one(s, "compare:'How it stacks up against other seaside shows'", "compare:'This show next to three others, and my view'")
    s = _one(s, "whatyousee:'What the flying looks like from the beach'", "whatyousee:'The flying and ground displays, and how loud they are'")
    s = _one(s, "days:'Thursday or Friday, which suits you'", "days:'Which day suits you, and what happens on each one'")
    return s
