"""Round 2 (Jack, 22 Nov 2026): the Blackpool page built in the Duxford template, and nothing else.

See previews/NEW-DESIGN-ROLLOUT-2.md. build.py calls restructure() on the Blackpool page (live-source.html,
with its photos swapped for placeholders) before the new design goes on top. Every change here moves Blackpool's
own words into the block Duxford uses for the same job, or leaves out a section or block Duxford does not have.
Nothing is written here that is not already on the Blackpool page, apart from block labels Duxford uses.

LEFT_OUT lists everything taken out, for the summary to Jack.
"""
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent

LEFT_OUT = [
    # old Blackpool sections Duxford does not have
    ("section", "The Ground Show (old Blackpool section, not on Duxford)"),
    ("section", "Seafront Information (old Blackpool section, not on Duxford): the seafront map, tide chart, beach and sea wall boxes and seafront guide"),
    # old Blackpool blocks Duxford does not have
    ("block", "Food and facilities: the packing list boxes (Comfort, Family, Camera)"),
    ("block", "Pick your day: the four Away from the show cards are kept, but as a second list in Duxford's list style"),
    ("block", "Help on show days: the closing link \"More in Seafront Information\", as that section has gone"),
    ("block", "Where to stay: the one line descriptions of the Booking.com, Airbnb and Visit Blackpool links (the links are now buttons in Duxford's search block)"),
    # Duxford sections and blocks Blackpool has no facts for
    ("duxford", "Flightline walk (Blackpool has no flightline walk)"),
    ("duxford", "Duxford's story, as a Blackpool's story section (no history section on the Blackpool page)"),
    ("duxford", "Experience flights (none on the Blackpool page)"),
    ("duxford", "Overview: The 2027 calendar (Blackpool is one weekend, dates not yet announced)"),
    ("duxford", "Getting there: How arrival works (no arrival steps on the Blackpool page)"),
    ("duxford", "Aircraft line-up: the Choose a show picker (one show)"),
    ("duxford", "Photography: Sun at each show table (one show)"),
    ("duxford", "Where to watch: the Photographers' map (no photographers' spots on the Blackpool page)"),
    ("duxford", "Food and facilities: Duxford's own shuttle band, the What to expect on the day photos, and the Paying and Banned items boxes"),
    ("duxford", "Plan your day: Top ten things to take (no top ten list on the Blackpool page)"),
]


def panel(html, pid):
    """Start and end of a whole section panel, from <section ... id="pid"> to its closing </section>."""
    m = re.search(r'<section class="panel[^"]*" id="%s"' % pid, html)
    assert m, "panel %s not found" % pid
    depth, pos = 0, m.start()
    tag = re.compile(r"<section\b|</section>")
    while True:
        t = tag.search(html, pos)
        assert t, "no end for panel " + pid
        depth += 1 if t.group(0) == "<section" else -1
        pos = t.end()
        if depth == 0:
            return m.start(), pos


def edit(html, pid, fn):
    a, b = panel(html, pid)
    return html[:a] + fn(html[a:b]) + html[b:]


def rep(s, old, new, count=1):
    assert s.count(old) == count, "expected %d of: %s" % (count, old[:90])
    return s.replace(old, new)


def cut(s, start, end_marker, keep_end=False):
    """Remove from start up to and including end_marker (both must be present once)."""
    a = s.find(start)
    assert a >= 0 and s.count(start) == 1, "cut start: " + start[:80]
    b = s.find(end_marker, a)
    assert b >= 0, "cut end: " + end_marker[:80]
    return s[:a] + (s[b:] if keep_end else s[b + len(end_marker):])


def restructure(html):
    # ---- 1. sections: drop the two old Blackpool sections Duxford does not have --------------------------------
    for pid, label in (("ground", "The Ground Show"), ("seafront", "Seafront Information")):
        a, b = panel(html, pid)
        html = html[:a] + html[b:]
        html = re.sub(r'\s*<button class="tab" role="tab" id="t-%s"[^>]*>[^<]*</button>' % pid, "", html, count=1)
        assert 'id="t-%s"' % pid not in html
    # the one in-page link that pointed at Seafront Information
    html = rep(html, ' More in <button type="button" class="inlink" data-goto="seafront">Seafront Information</button>.', "")

    # ---- 2. Pick your day becomes the Duxford "Pick your show" section (id days), in Duxford's block order --------
    html = rep(html, '<button class="tab" role="tab" id="t-weekend" aria-controls="weekend" aria-selected="false" tabindex="-1">Pick Your Day</button>',
               '<button class="tab" role="tab" id="t-days" aria-controls="days" aria-selected="false" tabindex="-1">Pick Your Show</button>')

    def days(s):
        s = rep(s, '<section class="panel" id="weekend" role="tabpanel" aria-labelledby="t-weekend" hidden>',
                '<section class="panel" id="days" role="tabpanel" aria-labelledby="t-days" hidden data-sx="1">')
        tool = re.search(r'\n    <div class="wk-tool">.*?\n    </div>\n', s, re.S).group(0)
        s = s.replace(tool, "\n", 1)
        # the picker tool, with Duxford's tab look (its own questions, answers and script are unchanged)
        tool = tool.replace('<div class="wk-tool">', '<div class="wk-tool sw-tabs sw-pick">', 1)
        tool = tool.replace('<div class="pp-opts" data-wk=', '<div class="pp-opts xd-tt-tabs" data-wk=')
        # Duxford opens with four fact boxes. These are the Blackpool page's own key details.
        facts = ('<div class="fl-facts"><div><span>Show days</span><b>Two, a weekend in August</b></div>'
                 '<div class="pu"><span>2027 dates</span><b>To be confirmed</b></div>'
                 '<div><span>Flying</span><b>About 14:00 to 17:40 (2026)</b></div>'
                 '<div class="pu"><span>Entry</span><b>Free, no tickets</b></div></div>')
        s = rep(s, '\n    <h3 class="fl-h">Which Day To Pick</h3>', '\n    ' + facts + '\n    <h3 class="fl-h">Which Day To Pick</h3>')
        # Away from the show: Duxford's second list, in the same list style as the first
        cards = re.search(r'<div class="sf-cards">(.*?)\n    </div>', s, re.S)
        items = re.findall(r'<div><b>(.*?)</b><p>(.*?)</p></div>', cards.group(1))
        assert len(items) == 4
        lst = '<div class="wk-days">' + "".join(
            '<div%s><b>%s</b><span>%s</span></div>' % (' class="pu"' if i % 2 else "", b, p) for i, (b, p) in enumerate(items)) + '</div>'
        s = s.replace(cards.group(0), lst, 1)
        # then the tool, the tip, the official site and the source note, as on Duxford
        s = rep(s, '\n    <div class="ns-note">', tool + '\n    <div class="ns-note">')
        tip_end = s.find('</div>', s.find('<div class="ns-note">')) + len('</div>')
        s = (s[:tip_end] +
             '<div class="sp-links"><a href="https://www.visitblackpool.com/airshow" target="_blank" rel="noopener"><b>Official site</b>'
             '<span>Blackpool Air Show official page</span></a></div>'
             '<p class="note sf-src">Where a time or price says 2026, it&rsquo;s from last year&rsquo;s show until the 2027 details are out.</p>'
             + s[tip_end:])
        return s
    html = edit(html, "weekend", days)
    # the section bar's one line description goes with the new id
    html = rep(html, "var DESC={weekend:'Which day suits you, and what happens on each one',",
               "var DESC={days:'Which day suits you, and what happens on each one',")

    # ---- 3. Overview: the jump boxes sit under the intro grid, as on Duxford ----------------------------------------
    def overview(s):
        m = re.search(r'\n      <div class="jump boxes">.*?\n      </div>\n    </div>\n', s, re.S)
        assert m
        block = m.group(0)
        jump = block[:block.rfind("\n    </div>\n")]
        s = s.replace(block, "\n    </div>\n" + jump.replace('<div class="jump boxes">', '<div class="jump boxes reveal">', 1) + "\n", 1)
        return s
    html = edit(html, "overview", overview)

    # ---- 4. Getting there: the topic explorer heading sits above the grid, as on Duxford -----------------------------
    def travel(s):
        old = re.search(r'<div class="wrap explore-grid">\n      <aside class="explore-side">\n        (<h2>.*?</h2>)\n        (<p>.*?</p>)\n', s, re.S)
        assert old
        s = s.replace(old.group(0),
                      '<div class="wrap">\n      <div class="explore-head reveal">\n        %s\n        %s\n      </div>\n'
                      '      <div class="explore-grid">\n      <aside class="explore-side">\n' % (old.group(1), old.group(2)), 1)
        # close the extra wrapper at the end of the explore section
        a = s.find('<section class="explore" id="explore"')
        b = s.find("\n  </section>", a)
        assert a > 0 and b > 0
        s = s[:b] + "\n    </div>" + s[b:]
        return s
    html = edit(html, "travel", travel)

    # ---- 5. Where to watch: Duxford's closing photo is hidden on Duxford too (Jack, 22 Nov 2026), so none is added.

    # ---- 6. Food and facilities: Duxford's food block, then the boxes, traders and answers -------------------------
    def facilities(s):
        m = re.search(r'\n      <div class="reveal"><figure class="fimg"><img src="(@@BLOB\d+@@)" alt="([^"]*)" loading="lazy"><figcaption>(.*?)</figcaption></figure><h3>Food &amp; drink</h3><p>(.*?)</p></div>', s)
        assert m, "food box"
        s = s.replace(m.group(0), "", 1)
        food = ('<div class="food reveal">\n      <figure class="food-main"><img class="photo" src="%s" alt="%s"><figcaption>%s</figcaption></figure>\n'
                '      <div class="food-text">\n        <h3>Food &amp; drink</h3>\n        <p>%s</p>\n      </div>\n    </div>\n\n    '
                % (m.group(1), m.group(2), m.group(3), m.group(4)))
        s = rep(s, '<div class="fac boxes">', food + '<div class="fac boxes reveal">')
        # Duxford's boxes are Toilets and Shade first; Blackpool's Kids' activities box follows them
        kids = re.search(r'\n      <div class="reveal"><h3>Kids&rsquo; activities</h3>.*?</div>', s).group(0)
        s = s.replace(kids, "", 1)
        shade_end = s.find("</div>", s.find("<h3>Shade and seating</h3>")) + len("</div>")
        s = s[:shade_end] + kids + s[shade_end:]
        s = s.replace('<div class="fac boxes reveal">\n      <div class="reveal">', '<div class="fac boxes reveal">\n      <div>')
        s = re.sub(r'(<div class="fac boxes reveal">.*?)(\n    </div>)', lambda mm: mm.group(1).replace('\n      <div class="reveal">', '\n      <div>') + mm.group(2), s, count=1, flags=re.S)
        # the packing list boxes: Duxford has none here
        s = cut(s, '\n    <div class="pack boxes reveal">', '\n    </div>')
        return s
    html = edit(html, "facilities", facilities)

    # ---- 7. Plan your day: the timeline carries Duxford's ids, so the same styles apply -----------------------------
    def timeline(s):
        s = rep(s, '<div><h3>A family arriving by train</h3></div>\n      <p class="note" style="max-width:46ch">',
                '<div><h3 id="tlTitle">A family arriving by train</h3></div>\n      <p class="note" style="max-width:46ch" id="tlNote">')
        s = rep(s, '\n    <div class="tl">\n', '\n    <div class="tl" id="tlList">\n')
        return s
    html = edit(html, "timeline", timeline)

    # ---- 8. Where to stay: Duxford's search block on top, then the groups ----------------------------------------
    def stay(s):
        m = re.search(r'\n    <div class="stay-group reveal">\n      <h3>Search for more places to stay</h3>.*?\n    </div>\n', s, re.S)
        assert m
        s = s.replace(m.group(0), "\n", 1)
        search = ('\n    <div class="stay-search reveal">\n'
                  '      <div><h3>Search for more places to stay</h3><p>Hotels, guest houses and apartments in Blackpool.</p></div>\n'
                  '      <div class="stay-links">\n'
                  '        <a class="btn" href="https://www.booking.com/city/gb/blackpool.html" target="_blank" rel="noopener">Booking.com ↗</a>\n'
                  '        <a class="btn ghost-n" href="https://www.airbnb.co.uk/s/Blackpool--United-Kingdom/homes" target="_blank" rel="noopener">Airbnb ↗</a>\n'
                  '        <a class="btn ghost-n" href="https://www.visitblackpool.com" target="_blank" rel="noopener">Visit Blackpool ↗</a>\n'
                  '      </div>\n    </div>\n    <div id="stayGroups">')
        first = s.find('\n\n    <div class="stay-group reveal">')
        assert first > 0
        s = s[:first] + "\n" + search + s[first + 1:]
        note = s.find('\n    <p class="stay-note">')
        assert note > 0
        s = s[:note] + "\n    </div>" + s[note:]
        return s
    html = edit(html, "stay", stay)

    # ---- 9. Overview jump boxes as Duxford's faded photo tiles (Duxford's own tile styles and script, carried over
    #         word for word from previews/duxford-new-design-src/live-source.html, with Blackpool photo keys).
    #         As on Duxford, the first and third tiles have no photo; Blackpool's photos are Chris Murgatroyd's
    #         and the page's own credit code labels them. ----------------------------------------------------------
    dux = (HERE / ".." / "duxford-new-design-src" / "live-source.html").read_text(encoding="utf8")
    i = dux.find("/* faded photo tiles for the overview jump boxes */")
    j = min(dux.find("/*", i + 10), dux.find("</style>", i))   # the tile rules only, up to the next comment or the end of the style block
    assert i > 0 and j > i
    tile_css = dux[i:j]
    a = dux.find('<script id="glass-effect-js">')
    b = dux.find("</script>", a) + len("</script>")
    assert a > 0
    tile_js = dux[a:b]
    old_pics = "var PICS={matchcheck:'Six questions, a match score and what to read next',scores:'Crowds, food, facilities and value for money, rated',compare:'This show next to three others, and my view',whatyousee:'The flying and ground displays, and how loud they are',dayruns:'From the gates opening to the drive home',lineup:'buchon_front',travel:'parking1',stay:'wildcat_side'};"
    assert old_pics in tile_js
    # Blackpool's photoImg() makes an image for any key, so only keys with a photo are listed, and the rest get none
    tile_js = tile_js.replace(old_pics, "var PICS={lineup:'typhoon',timeline:'spitfire'};")
    tile_js = tile_js.replace("img=window.photoImg?window.photoImg(PICS[k]||'formation'):'';",
                              "img=(window.photoImg&&PICS[k]&&window.PHOTO&&window.PHOTO[PICS[k]])?window.photoImg(PICS[k]):'';")
    assert "PICS[k]&&window.PHOTO" in tile_js
    tile_js = tile_js.replace("var GO={right:'Read the guide',lineup:'See the line-up',travel:'Plan your journey',stay:'Find somewhere to stay'};",
                              "var GO={right:'Read the guide',lineup:'See the line-up',travel:'Plan your journey',stay:'Find somewhere to stay'};", 1)
    html = html.replace("</head>", "<style id=\"gl-tiles\">\n" + tile_css + "</style>\n</head>", 1)   # the first one, as build.py does
    m = re.search(r"<script id=\"weekend-js\">", html)
    assert m
    html = html[:m.start()] + tile_js + "\n" + html[m.start():]

    # ---- 10. Photography: Duxford's photo beside the intro panel. Blackpool has none there, so one of the page's
    #          own photos goes in, captioned with the page's own description of it. ------------------------------
    def photo(s):
        m = re.search(r'(<section class="panel" id="photo"[^>]*>\n  <div class="wrap">\n    <div class="panel-head reveal">.*?\n    </div>\n)', s, re.S)
        assert m
        fig = '    <figure class="pic wide reveal"><img class="photo" data-k="pitts" alt=""><figcaption>The Jet Pitts trailing smoke.</figcaption></figure>\n'
        return s.replace(m.group(1), m.group(1) + fig, 1)
    html = edit(html, "photo", photo)
    return html
