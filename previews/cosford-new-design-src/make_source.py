#!/usr/bin/env python3
"""Round 2 (Jack, 22 Nov 2026): the RAF Cosford page built IN the Duxford template.

Writes live-source.html: the Cosford page laid out section by section like the Duxford page
(previews/duxford-new-design-src/live-source.html), with only Cosford's own content in it.
build.py then adds the new design on top, exactly as it does for Duxford.

Content comes only from old-page.html (the Cosford page as it was before the new design), and the
parking block (#cpk) from the current live page, camping-layout/cosford.html. Nothing is retyped from
memory and no Duxford fact is copied in. Sections and blocks Duxford does not have are taken out, and
Duxford blocks Cosford has no facts for are left out. Both lists are in LEFT_OUT at the bottom and in
the README.

Run:  python3 previews/cosford-new-design-src/make_source.py   (build.py runs it first anyway)
"""
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OLD = HERE / "old-page.html"                          # Cosford's page before the new design (content source)
LIVE = ROOT / "camping-layout" / "cosford.html"       # for the parking block, exactly as it is live
DUX = ROOT / "previews" / "duxford-new-design-src" / "live-source.html"   # the template
OUT = HERE / "live-source.html"

BLOB = re.compile(r"data:(?:image|application|font)/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+")


class Page:
    def __init__(self, text):
        self.blobs = []
        self.s = BLOB.sub(self._keep, text)
        self.orig = self.s   # the page as read, for checking that every reused line is really on it

    def _keep(self, m):
        self.blobs.append(m.group(0))
        return "@@B%d@@" % (len(self.blobs) - 1)

    def add_blob(self, data):
        self.blobs.append(data)
        return "@@B%d@@" % (len(self.blobs) - 1)

    def text(self):
        return re.sub(r"@@B(\d+)@@", lambda m: self.blobs[int(m.group(1))], self.s)

    def rep(self, old, new, count=1):
        n = self.s.count(old)
        assert n == count, "expected %d, found %d: %s" % (count, n, old[:120])
        self.s = self.s.replace(old, new)

    def cut(self, start, end, new="", inclusive_end=True):
        """Replace from the unique marker start up to and including the first end after it."""
        assert self.s.count(start) == 1, "start not unique: " + start[:100]
        i = self.s.index(start)
        j = self.s.index(end, i) + (len(end) if inclusive_end else 0)
        self.s = self.s[:i] + new + self.s[j:]

    def block(self, start, end):
        i = self.s.index(start)
        return self.s[i:self.s.index(end, i) + len(end)]

    def panel(self, pid):
        """The whole <section class="panel" id=pid> ... </section>, nested sections included."""
        m = re.search(r'<section class="panel[^"]*" id="%s"' % pid, self.s)
        assert m, pid
        depth = 0
        for t in re.finditer(r"<(/?)section\b", self.s[m.start():]):
            depth += -1 if t.group(1) else 1
            if depth == 0:
                return self.s[m.start():m.start() + t.end() + 1]
        raise AssertionError(pid)

    def set_panel(self, pid, new):
        old = self.panel(pid)
        self.s = self.s.replace(old, new, 1)


def script_by_id(p, sid):
    return p.block('<script id="%s">' % sid, "</script>")


def style_by_id(p, sid):
    return p.block('<style id="%s">' % sid, "</style>")


def main():
    p = Page(OLD.read_text(encoding="utf8"))
    dux = Page(DUX.read_text(encoding="utf8"))
    live = Page(LIVE.read_text(encoding="utf8"))

    sections(p, dux)
    tabs(p)
    index_words(p, dux)
    travel(p, dux, live)
    stay(p)
    overview(p)
    port_design(p, dux)
    lineup(p)
    watch(p, dux)
    facilities(p, dux)
    train_header(p)
    photo(p)

    OUT.write_text(p.text(), encoding="utf8")
    print("wrote", OUT.relative_to(ROOT))


# ---------------------------------------------------------------------------------------------
# 1. Sections Duxford does not have: Ticket day countdown, RAF Museum Midlands, The ground show.
def sections(p, dux):
    for pid in ("ready", "museum", "ground"):
        p.set_panel(pid, "")
        p.rep('<button class="tab" role="tab" id="t-%s"' % pid,
              '<button class="tab" role="tab" id="t-%s"' % pid)   # checked below, removed in tabs()
    # photo helper: no photo for a key it doesn't know (Duxford's helper does the same), so no broken image
    p.rep("window.photoImg=function(k,cls){return '<img'", "window.photoImg=function(k,cls){if(!PHOTO[k])return '';return '<img'")
    # links to them from the other sections
    p.rep(' See <button type="button" class="inlink" data-goto="museum">RAF Museum Midlands</button>.', "")
    p.rep(' See <button type="button" class="inlink" data-goto="ready">Ticket Day Countdown</button>.', "", count=2)
    # their scripts (they only drive the removed sections)
    p.cut('<script id="museum-js">', "</script>")
    p.cut('<script id="ready-js">', "</script>")
    # Ticket day checklist groups (ck-groups) belonged to the countdown section
    p.cut('<style id="ck-groups">', "</style>")
    p.cut('<script id="ck-groups-js">', "</script>")


# 2. The tab strip: Duxford's names and order, without the sections Cosford has no facts for.
TABS = [("overview", "Overview"), ("matchcheck", "Quick checker"), ("travel", "Getting there &amp; parking"),
        ("scores", "How it scores"), ("compare", "How it compares"), ("lineup", "Aircraft line-up"),
        ("whatyousee", "What you'll see"), ("stay", "Where to stay"), ("timeline", "Plan your day"),
        ("dayruns", "How the day runs"), ("help", "Help On Show Days"), ("watch", "Where to watch"),
        ("photo", "Photography"), ("kids", "Kids' Corner"), ("postcard", "Make A Postcard"),
        ("facilities", "Food &amp; facilities")]


def tabs(p):
    i = p.s.index('<div class="tablist" role="tablist">')
    j = p.s.index("</div>", i)
    rows = []
    for n, (tid, name) in enumerate(TABS):
        rows.append('      <button class="tab" role="tab" id="t-%s" aria-controls="%s" aria-selected="%s"%s>%s</button>'
                    % (tid, tid, "true" if n == 0 else "false", "" if n == 0 else ' tabindex="-1"', name))
    p.s = p.s[:i] + '<div class="tablist" role="tablist">\n' + "\n".join(rows) + "\n    " + p.s[j:]


# 3. The words under each name in the guide index. Cosford's copy still had Clacton's words in it,
#    so this takes Duxford's script and puts in Cosford's own wording.
def index_words(p, dux):
    d = script_by_id(dux, "ind-js")
    D = ("var D={overview:'The show at a glance',matchcheck:'Six quick questions to see if it suits you',"
         "travel:'Trains, roads, parking and road closures',scores:'How Cosford rates for families and enthusiasts',"
         "compare:'How it stacks up against other UK shows',lineup:'Confirmed aircraft and display teams',"
         "whatyousee:'What the flying looks like from the crowd line',stay:'Hotels and campsites nearby',"
         "timeline:'Your day planner and the weather',dayruns:'How a show day runs, hour by hour',"
         "help:'First aid, lost children and stewards',watch:'The best spots along the crowd line',"
         "photo:'Sun guide and camera settings',kids:'Things the children will love',"
         "postcard:'Make a postcard from your day',facilities:'Food, toilets and access'};")
    d = re.sub(r"var D=\{.*?\};", lambda m: D, d, count=1, flags=re.S)
    old = script_by_id(p, "ind-js")
    p.rep(old, d)


# 4. Getting there and parking.
def travel(p, dux, live):
    # the parking block exactly as it is on the live page
    lv = live.block('<div class="wrap"><section class="cpk', "</section></div>")
    old = p.block('<div class="wrap"><section class="cpk', "</section></div>")
    p.rep(old, lv)
    # the images inside it, if any, come from the live page's blobs
    for k in re.findall(r"@@B(\d+)@@", lv):
        pass
    assert "@@B" not in lv, "parking block has images: carry them over"

    # Key places heading: plain, as on Duxford (Duxford has no CG_PLACE, so its heading has no place tag)
    p.rep("'<div class=\"xd-kp-h\"><span style=\"background:none;color:inherit;padding:0;font-size:inherit;font-family:inherit\">Key places</span>' + (place ? '<span>' + esc(place) + '</span>' : '') + '</div>'",
          "'<div class=\"xd-kp-h\"><span style=\"background:none;color:inherit;padding:0;font-size:inherit;font-family:inherit\">Key places</span></div>'")

    # How arrival works: Duxford's three steps (the middle one a photo), with Cosford's own arrival advice
    lines = ["Just follow the yellow air show signs along the A41. Parking is included and it is on grass.",
             "Once you see the air show signs, I would follow them rather than your satnav.",
             "Give yourself 10 to 20 minutes from the car parks to the showground.",
             "I would advise arriving as the gates open, as this has worked for me in the past.",
             "If you want a front row seat, I would head to the crowd line first and set up your chairs or blanket before doing anything else.",
             "In 2026 Gate 4 was open for arrivals from about 08:00 to 10:30 and for departures from about 18:00, and the one way system usually reverses around 13:00 so you can leave through Gate 2."]
    for t in lines:
        assert t in p.orig, t
    arrive = """
  <section class="arrive" aria-label="How arrival works">
    <div class="wrap">
      <div class="arrive-head reveal">
        <h2>How arrival works</h2>
        <p>Everyone arrives on the same morning, so the A41 and the M54 queue and the station gets very busy. Here&rsquo;s what I would expect, so a short wait in the queue doesn&rsquo;t catch you out.</p>
      </div>
      <div class="arrive-grid reveal">
        <div class="arrive-step"><span class="arrive-n">1</span><h3>Follow the air show signs</h3><p>Leave the M54 at junction 3. %s %s</p></div>
        <figure class="arrive-step arrive-photo"><img class="photo" data-k="chinook" alt=""><figcaption><span class="arrive-n">2</span><b>Park up and walk in.</b> %s</figcaption></figure>
        <div class="arrive-step"><span class="arrive-n">3</span><h3>Gates open at 08:00</h3><p>%s %s</p></div>
      </div>
      <p class="note arrive-note">%s</p>
    </div>
  </section>
""" % tuple(lines)
    assert "The catch is that everyone arrives on the same morning, so the A41 and the M54 queue and the station gets very busy." in p.orig
    anchor = '\n  <div class="ukag-jp" data-show="cosford"></div>\n'
    p.rep(anchor, "\n" + arrive + anchor)

    # the topic explorer in Duxford's markup: the heading above, the options and the note in the side bar
    old = re.search(r'  <section class="explore" id="explore" aria-label="Arrival map and information">\n    <div class="wrap explore-grid">\n      <aside class="explore-side">\n        <h2>Choose a topic</h2>\n        <p>(.*?)</p>\n', p.s, re.S)
    assert old
    p.rep(old.group(0), '  <section class="explore" id="explore" aria-label="Arrival map and information">\n    <div class="wrap">\n'
          '      <div class="explore-head reveal">\n        <h2>Choose your topic</h2>\n        <p>' + old.group(1) + '</p>\n      </div>\n'
          '      <div class="explore-grid">\n        <aside class="explore-side">\n')
    i = p.s.index('<section class="explore" id="explore"')
    j = p.s.index("</section>", i)
    seg = p.s[i:j]
    k = seg.rindex("    </div>\n  ")
    p.s = p.s[:i] + seg[:k] + "    </div>\n    </div>\n  " + p.s[i + k + len("    </div>\n  "):]


# 5. Where to stay: Duxford's layout (search box, then the groups in Duxford's order and names),
#    with Cosford's own places, links and notes.
STAY_SEARCH = """    <div class="stay-search reveal">
      <div><h3>Search everything nearby</h3><p>Homes and rooms around Shifnal, Albrighton and Telford, hotels, guest houses and apartments near RAF Museum Midlands, and the county&rsquo;s official accommodation listings.</p></div>
      <div class="stay-links">
        <a class="btn" href="https://www.booking.com/landmark/gb/raf-museum-cosford.html" target="_blank" rel="noopener">Booking.com ↗</a>
        <a class="btn ghost-n" href="https://www.airbnb.co.uk/s/Shifnal--United-Kingdom/homes" target="_blank" rel="noopener">Airbnb ↗</a>
        <a class="btn ghost-n" href="https://www.visitshropshire.co.uk" target="_blank" rel="noopener">Visit Shropshire ↗</a>
      </div>
    </div>
"""


def stay(p):
    old = p.panel("stay")
    li = {}
    for m in re.finditer(r"<li><b>(.*?)</b>.*?</li>", old, re.S):
        li[m.group(1)] = m.group(0)
    for k in ("Booking.com", "Airbnb", "Visit Shropshire"):   # these three are the search box now
        assert k in li, k
    head = old[:old.index('<div class="stay-group')]
    note = old[old.index('<p class="stay-note">'):]

    def group(name, keys):
        return ('      <div class="stay-group"><h3>%s</h3><ul class="stay-list">\n' % name
                + "".join("        " + li[k] + "\n" for k in keys) + "      </ul></div>\n")
    groups = ('    <div id="stayGroups">\n'
              + group("Campsites and caravan sites", ["Severn Gorge Caravan Park", "Stanmore Hall Touring Park",
                      "Pitchup.com near Telford and Bridgnorth", "Albrighton Trust Moat and Gardens"])
              + group("B&amp;Bs, inns and local hotels", ["Park House Hotel", "Haughton Hall Hotel &amp; Leisure Club",
                      "Days Inn Telford Ironbridge", "Bed and breakfasts in Albrighton and Shifnal"])
              + group("Premier Inn", ["Premier Inn Telford Central", "Premier Inn Telford International Centre",
                      "Premier Inn Wolverhampton North"])
              + group("Travelodge", ["Travelodge Telford Central", "Travelodge Wolverhampton Central"])
              + group("Holiday Inn and Holiday Inn Express", ["Holiday Inn Telford Ironbridge"])
              + "    </div>\n    ")
    p.set_panel("stay", head + STAY_SEARCH + groups + note)


# 6. Overview: Duxford has a photo under the intro and the four jump boxes below the grid (after its
#    2027 calendar, which Cosford, with one show, does not have).
def overview(p):
    ov = p.panel("overview")
    jump = re.search(r'\n      <div class="jump boxes">.*?\n      </div>', ov, re.S).group(0)
    new = ov.replace(jump, "", 1)
    # the photo: Jack's Chinook on the static park, with a line from Cosford's own overview
    fig = ('\n        <figure class="pic reveal"><img class="photo" data-k="chinookstatic" alt=""><figcaption>'
           'The static display sits on the airfield in front of the crowd line.</figcaption></figure>')
    assert "The static display sits on the airfield in front of the crowd line" in ov
    i = new.index('<div class="ov-intro reveal">')
    j = new.index("\n      </div>", i)
    new = new[:j] + fig + new[j:]
    # jump boxes after the grid, at the panel's own level, as on Duxford
    k = new.index('<aside class="ov-side')
    k = new.index("</aside>", k)
    k = new.index("</div>", k) + len("</div>")
    jb = jump.replace('\n      <div class="jump boxes">', '\n\n    <div class="jump boxes reveal">').replace("\n        <button", "\n      <button").replace("\n      </div>", "\n    </div>")
    new = new[:k] + jb + new[k:]
    p.set_panel("overview", new)


# 7. Duxford's own design blocks (styles and small scripts with no Duxford facts in them) that the old
#    Cosford page did not have. Each goes in after the nearest block the two pages share, so the styles
#    apply in the same order as on Duxford.
PORT = [
    ("style", "/* Duxford extras: season calendar, show picker"),
    ("style", "/* header image style and glass Key details box"),
    ("style", "glass-effect"),
    ("script", "glass-effect-js"),
    ("style", ".xd-lane{display:none!important}"),
    ("script", "(function(){\n  function syncPick(){"),
    ("style", "ww-css"),
    ("script", "(function(){\n  function show(box, i){"),
    ("style", "txtidx-css"), ("style", "txtidx2-css"), ("style", "txtidx3-css"), ("script", "txtidx-js"),
    ("style", "dux-ovj-fix"),
    ("style", "trlStyle"),
]
# Duxford photo keys in the ported scripts, swapped for Jack's Cosford photos
PORT_KEYS = {"glass-effect-js": [("lineup:'buchon_front',travel:'parking1',stay:'wildcat_side'",
                                  "lineup:'rafale',travel:'c17',stay:'b17'")]}


def _blocks(s):
    out = []
    for m in re.finditer(r"<(script|style)([^>]*)>(.*?)</\1>", s, re.S):
        idm = re.search(r'id="([^"]+)"', m.group(2))
        out.append((m.group(1), idm.group(1) if idm else None, m.group(3), m.start(), m.end()))
    return out


def port_design(p, dux):
    for kind, key in PORT:
        db = _blocks(dux.s)
        hit = [b for b in db if b[0] == kind and (b[1] == key or (b[1] is None and b[2].lstrip().startswith(key.lstrip())))]
        assert len(hit) == 1, (key, len(hit))
        b = hit[0]
        whole = dux.s[b[3]:b[4]]
        assert "@@B" not in whole, key
        for a, c in PORT_KEYS.get(b[1] or "", []):
            assert whole.count(a) == 1, a
            whole = whole.replace(a, c)
        # the nearest earlier Duxford block that the Cosford page has, unchanged
        cb = _blocks(p.s)
        sig = lambda x: (x[0], x[1] or re.sub(r"\s+", " ", x[2].strip())[:70])
        have = {}
        for x in cb:
            have.setdefault(sig(x), x)
        at = None
        for x in reversed([y for y in db if y[3] < b[3]]):
            if sig(x) in have and len(x[2]) > 200:
                at = have[sig(x)][4]
                break
        assert at is not None, key
        p.s = p.s[:at] + "\n" + whole + p.s[at:]


# 8. Aircraft line-up: the What you'll see panel sat inside the line-up's markup on the old page; on
#    Duxford it follows the line-up. The hidden "design preview" note is not on Duxford.
def lineup(p):
    see = p.panel("whatyousee")
    p.rep("\n" + see, "")
    p.rep('      <p class="lu-preview" id="luPreview" hidden><b>Design preview</b>Example aircraft only, not a real line-up.</p>\n', "")
    p.rep('$("luPreview").hidden=!d.preview;', 'var pv=$("luPreview"); if(pv)pv.hidden=!d.preview;')
    lu = p.panel("lineup")
    p.rep(lu, lu + "\n\n" + see)


# 9. Where to watch: Duxford's tab and map layout (ww-panel, ww-where, ww-facts, ww-go), with Cosford's
#    five spots. Duxford has no "Plan my day here" buttons and no line under each map, so those go.
WW_WHERE = ["Inside the show, by the enclosures", "Inside the show, towards the 06 end",
            "Inside the show, nearest the station", "Outside the airfield, on Blue House Lane",
            "Outside the airfield, off Shackerley Lane"]
WW_PIN = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c-3.7 0-6.6 2.9-6.6 6.5 0 4.9 6.6 12.5 6.6 12.5s6.6-7.6 6.6-12.5c0-3.6-2.9-6.5-6.6-6.5z" fill="currentColor"/><circle cx="12" cy="9" r="2.5"/></svg>')


def watch(p, dux):
    w = p.panel("watch")
    sec = re.search(r'<section class="ww reveal" id="wwMaps".*?</section>', w, re.S).group(0)
    head = re.search(r'<div class="ww-head">.*?</div></div>', sec, re.S) or re.search(r'<div class="ww-head">.*?</p></div>', sec, re.S)
    note = re.search(r'<p class="ww-note">.*?</p>', sec, re.S).group(0)
    tabs = re.findall(r'<button type="button" role="tab" id="ww-t(\d)".*?(<span class="xd-tt-ic">.*?</span>)(.*?)</button>', sec, re.S)
    boards = re.findall(r'<div class="xd-tt-board ww-board" role="tabpanel" id="ww-p(\d)".*?<div class="ww-txt">(.*?)</div><figure class="ww-map">(<iframe.*?</iframe>)<figcaption>(.*?)</figcaption></figure></div></div>', sec, re.S)
    assert len(tabs) == 5 and len(boards) == 5, (len(tabs), len(boards))
    tb, pn = [], []
    for i, ((n, ic, name), (n2, txt, frame, cap)) in enumerate(zip(tabs, boards)):
        side = "ww-in" if i < 3 else "ww-out"
        tb.append('<button type="button" role="tab" class="%s" id="ww-cosford-t%d" aria-controls="ww-cosford-p%d" aria-selected="%s" tabindex="%s">%s%s</button>'
                  % (side, i, i, "true" if i == 0 else "false", "0" if i == 0 else "-1", ic, name))
        h4 = re.search(r"<h4>.*?</h4>", txt).group(0)
        paras = "".join(re.findall(r"<p>.*?</p>", txt, re.S))
        facts = re.search(r'<ul class="ww-pc">(.*?)</ul>', txt, re.S).group(1).replace('<li class="con">', "<li>")
        href = re.search(r'<a class="ww-open" href="([^"]+)"', txt).group(1)
        pn.append('<div class="ww-panel %s" role="tabpanel" id="ww-cosford-p%d" aria-labelledby="ww-cosford-t%d"%s><div class="ww-txt">%s<p class="ww-where">%s</p>%s<ul class="ww-facts">%s</ul>'
                  '<a class="ww-go" href="%s" target="_blank" rel="noopener"><span class="xd-tt-ic">%s</span><span>Open in Google Maps</span><i aria-hidden="true">&rarr;</i></a></div><div class="ww-map">%s</div></div>'
                  % (side, i, i, "" if i == 0 else " hidden", h4, WW_WHERE[i], paras, facts, href, WW_PIN, frame))
        LEFT_OUT.append("Where to watch, " + re.sub(r"<[^>]+>", "", h4) + ": the line under its map (" + re.sub(r"<[^>]+>", "", cap) + ")")
    new = ('<section class="ww reveal" id="wwMap" aria-label="Where to watch, on the map">\n'
           '      <div class="ww-head"><div><h3>Where to watch, <em>on the map</em></h3></div><p class="note">Pick a spot and the map will show you where it is. Teal tabs are inside the show, and the purple ones are outside the airfield.</p></div>\n'
           '      <div class="sw-tabs ww-tabs"><div class="xd-tt-tabs" role="tablist" aria-label="Viewing spots">' + "".join(tb) + "</div>"
           + "".join(pn) + "</div>\n      " + note + "\n    </section>")
    p.rep(sec, new)
    LEFT_OUT.append("Where to watch: the Plan my day here buttons on three of the spots")
    # the old tab script (Duxford's own ww tab script is ported in port_design), and the old ww styles
    p.cut("<script>\n(function(){\n  function pickSpot(box, i){", "</script>")
    p.cut('<style id="ww-maps">', "</style>")
    # the colour script: Cosford has two spots outside, so the note it writes says so
    old = script_by_id(p, "wwmap-dux-js")
    new_js = script_by_id(dux, "wwmap-dux-js").replace(
        "if(note) note.textContent='Pick a spot and the map will show you where it is. The purple tab is outside the fence, where some people watch for free.';",
        "if(note) note.textContent='Pick a spot and the map will show you where it is. Teal tabs are inside the show, and the purple ones are outside the airfield.';")
    assert new_js != script_by_id(dux, "wwmap-dux-js")
    p.rep(old, new_js)


# 10. Food and facilities: Duxford's order. Food block (photo, heading, words), What to expect on the
#     day (four photos with a line each), four fact boxes (toilets, shade, paying, banned items), the
#     traders, then the questions. All the words are Cosford's own, several from its old Ground show
#     section. Duxford's shuttle bar (its own site shuttle) has no Cosford equivalent.
def facilities(p, dux):
    f = p.panel("facilities")
    boxes = dict()
    for m in re.finditer(r'<div class="reveal">(<figure class="fimg">.*?</figure>)<h3>(.*?)</h3>(<p>.*?</p>)</div>', f, re.S):
        boxes[m.group(2)] = (m.group(1), m.group(3))
    assert set(boxes) == {"Food &amp; drink", "Kids&rsquo; activities", "Toilets", "Shade and seating"}, boxes.keys()
    food_fig, food_p = boxes["Food &amp; drink"]
    kid_fig, kid_p = boxes["Kids&rsquo; activities"]
    kid_img = re.search(r"<img [^>]*>", kid_fig).group(0)

    # Duxford's two illustration images for the Paying and Banned items boxes (AI made, no place in them)
    def dimg(alt):
        m = re.search(r'<figure class="fimg"><img src="(@@B\d+@@)" alt="%s"' % re.escape(alt), dux.s)
        return p.add_blob(dux.blobs[int(m.group(1)[3:-2])])
    pay = dimg("A visitor paying by card at a trader stall selling aviation books and model aircraft, with a Spitfire parked behind")
    ban = dimg("A steward at the gate explaining to a family that their gazebo and stepladder need to go back to the car")

    food = ('    <div class="food reveal">\n      ' + food_fig.replace('class="fimg"', 'class="food-main"').replace("<img ", '<img class="photo" ') + '\n'
            '      <div class="food-text">\n        <h3>Food &amp; drink</h3>\n        ' + food_p + '\n'
            '        <ul class="food-list">\n'
            '          <li><b>Bringing your own food.</b> Picnics are welcome, but cooking equipment and barbecues aren’t allowed. The rules I read don’t say either way about alcohol, so I would check with the show before you pack any.</li>\n'
            '          <li><b>Water.</b> I haven’t seen free water points confirmed for Cosford. I would bring plenty of your own, as there is very little shade on the crowd line.</li>\n'
            '        </ul>\n'
            '        <p><b>My advice:</b> Everything is on the airfield, so I would plan to eat, drink and rest on site. '
            'There is no town to pop out to and the queues peak at lunchtime.</p>\n      </div>\n    </div>\n\n')
    expect = ('    <h3 class="sub-h reveal">What to expect on the day</h3>\n    <div class="expect reveal">\n'
              '      <figure><img class="photo" data-k="jaguar" alt=""><figcaption><b>The static park.</b> Cosford&rsquo;s static park is a bit special, because a lot of it comes from the station itself. You get the training airframes the RAF engineers learn on, aircraft from the museum and visitors from other air forces, all on one airfield.</figcaption></figure>\n'
              '      <figure>' + kid_img.replace("<img ", '<img class="photo" ') + '<figcaption><b>Take a look inside.</b> Some aircraft are opened up for you to take a look inside, and children love sitting where a fast jet pilot would. You can also buy exclusive merch in or outside some of the aircraft.</figcaption></figure>\n'
              '      <figure><img class="photo" data-k="apacheground" alt=""><figcaption><b>The STEM hangars.</b> Hands on activities and technology stands, all about the engineering that keeps the RAF flying. This may work for you if you have a teenager thinking about what to do after school.</figcaption></figure>\n'
              '      <figure><img class="photo" data-k="typhoon" alt=""><figcaption><b>The RAF stands.</b> The RAF&rsquo;s own engagement areas, where you can talk to the people who do the jobs.</figcaption></figure>\n'
              '    </div>\n\n')
    fac = ('    <div class="fac boxes reveal">\n'
           '      <div>' + boxes["Toilets"][0] + '<h3>Toilets</h3>' + boxes["Toilets"][1] + '</div>\n'
           '      <div>' + boxes["Shade and seating"][0] + '<h3>Shade &amp; seating</h3>' + boxes["Shade and seating"][1] + '</div>\n'
           '      <div><figure class="fimg"><img src="' + pay + '" alt="A visitor paying by card at a trader stall selling aviation books and model aircraft" loading="lazy"><figcaption>Card machines can lose signal on an airfield, so I would bring some cash. AI generated for a visual look.</figcaption></figure><h3>Paying</h3><p>Trade stalls and a catering village sit on the showground. Card machines can lose signal on an airfield, so I would bring some cash. There are cash machines, but they charge a fee.</p></div>\n'
           '      <div><figure class="fimg"><img src="' + ban + '" alt="A steward at the gate explaining to a family that their gazebo and stepladder need to go back to the car" loading="lazy"><figcaption>Anything on the banned list goes back to the car, so I would check it before you leave home. AI generated for a visual look.</figcaption></figure><h3>Banned items</h3><p>No cooking equipment, no gazebos on the crowd line, no drones within six miles of the airfield and no pets other than assistance dogs. Smoking and vaping aren&rsquo;t allowed on the showground.</p></div>\n'
           '    </div>\n')
    for t in ("Card machines can lose signal on an airfield, so I would bring some cash. There are cash machines, but they charge a fee.",
              "Hands on activities and technology stands, all about the engineering that keeps the RAF flying.",
              "Smoking and vaping aren&rsquo;t allowed on the showground."):
        assert t in p.orig, t
    i = f.index('    <div class="fac boxes">')
    j = f.index("    <ukag-show-traders")
    f = f[:i] + food + expect + fac + f[j:]
    # the packing boxes are not on Duxford (the same list is in Plan your day)
    f = re.sub(r'\n    <div class="pack boxes reveal">.*?\n    </div>', "", f, count=1, flags=re.S)
    p.set_panel("facilities", f)
    LEFT_OUT.append("Food and facilities: the three packing list boxes at the bottom (the same list is in Plan your day)")


# 11. The train route header on the train topics, as on Duxford's (same markup and styles), with Cosford's
#     own facts. Cosford's page gives no example departure times, so the board and the journey line show
#     the station and the leg without times, rather than made up ones.
TRL_JS = r"""<script id="trlScript-cos">
/* Train route header on the Cosford train topics, the same design as Duxford's (Jack, 22 Nov 2026).
   Every fact is from the Cosford topics themselves. No example times: Cosford's page doesn't give any. */
(function(){
  var GO='<a class="trl-go" href="https://www.ukairshowguide.co.uk/train-to-cosford" target="_top"><span><b>See every train and live times</b><small>Your station, platforms, changes and the way home</small></span><i aria-hidden="true">→</i></a>';
  function kd(rows){return '<div class="trl-kd"><h4>Key details</h4>'+rows.map(function(r){return '<div'+(r[2]?' class="hl"':'')+'><span>'+r[0]+'</span><b>'+r[1]+'</b></div>';}).join('')+'</div>';}
  function hero(o){
    return '<div class="trl-top"><div class="trl-hero"><div><span class="trl-tag">Train route</span><h3>Trains to <span>'+o.to+'</span></h3><p>'+o.p+'</p></div>'
      +'<div><div class="trl-board" aria-label="Destination board"><b><span>'+o.board+'</span></b><small>'+o.via+'</small></div>'+kd(o.kd)+'</div></div>'
      +'<div class="trl-jr"><div class="trl-jr-h"><b>Your journey</b><span>'+o.jr+'</span></div>'
      +'<div class="trl-line"><div class="trl-stop"><i></i><b>'+o.from+'</b><small>'+o.fromNote+'</small></div><div class="trl-mid">'+o.mid+'</div><div class="trl-stop"><i></i><b>'+o.at+'</b><small>'+o.atNote+'</small></div></div></div>'
      +GO+'</div>';
  }
  var H={
    'rail':hero({to:'Cosford',board:'COSFORD',via:'From Wolverhampton and Birmingham New Street',
      p:'Cosford station sits right beside the airfield on the Wolverhampton to Shrewsbury line, under 300 metres from the entrance. West Midlands Railway runs the service between Birmingham New Street, Wolverhampton, Cosford, Telford Central and Shrewsbury, with extra trains laid on for the show in past years.',
      kd:[['How often','Hourly on a Sunday'],['Get off at','Cosford',1],['Then','Walk, a few minutes'],['Step-free','No step-free access'],['Run by','West Midlands Railway']],
      jr:'Change at Wolverhampton or Birmingham New Street from most of the country. Trains normally run hourly on a Sunday, so I would check the times before you travel.',
      from:'Wolverhampton',fromNote:'Change here from most of the country',at:'Cosford',atNote:'Under 300 m from the entrance',mid:'West Midlands Railway<br>about 15 minutes'}),
    'rail-change':hero({to:'Wolverhampton',board:'WOLVERHAMPTON',via:'Then West Midlands Railway to Cosford',
      p:'Most visitors change at Wolverhampton or Birmingham New Street. Both have frequent trains from London, Manchester, Liverpool, the North West, the South West and Wales, and West Midlands Railway runs the last leg to Cosford.',
      kd:[['From London','Avanti West Coast, about 2 hours'],['Change at','Wolverhampton or Birmingham',1],['Then','About 15 minutes to Cosford'],['Step-free','Telford Central, Wolverhampton']],
      jr:'Avanti West Coast to Wolverhampton, about 2 hours on a Sunday morning, a bit longer if there’s engineering work, then about 15 minutes to Cosford.',
      from:'London',fromNote:'Avanti West Coast',at:'Wolverhampton',atNote:'Change for Cosford',mid:'Avanti West Coast<br>about 2 hours'})
  };
  function cur(){var b=document.querySelector('#parkList button[aria-pressed="true"]');return b?b.dataset.id:'';}
  function apply(){
    var c=document.querySelector('#explore .xd-content'); if(!c) return;
    var id=cur(), h=H[id], t=c.querySelector(':scope > .trl-top');
    if(h){
      c.classList.add('trl');
      if(!t||t.getAttribute('data-id')!==id){
        if(t) t.remove();
        var w=document.createElement('div'); w.innerHTML=h; var top=w.firstChild; top.setAttribute('data-id',id);
        var tabs=c.querySelector(':scope > .ft-tabs');
        if(tabs) c.insertBefore(top,tabs); else c.insertBefore(top,c.firstChild);
        if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){c.classList.add('in-view');io.disconnect();}});},{threshold:.2});io.observe(top);} else c.classList.add('in-view');
      }
    } else { c.classList.remove('trl','in-view'); if(t) t.remove(); }
  }
  var busy=false;
  function sched(){ if(busy) return; busy=true; setTimeout(function(){busy=false;apply();},60); }
  var tries=0;(function wait(){var ex=document.getElementById('explore');if(ex){new MutationObserver(sched).observe(ex,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-pressed']});apply();return;} if(++tries<80) setTimeout(wait,150);})();
})();
</script>"""
TRL_FACTS = ["Cosford station sits right beside the airfield on the Wolverhampton to Shrewsbury line, under 300 metres from the entrance. West Midlands Railway runs the service between Birmingham New Street, Wolverhampton, Cosford, Telford Central and Shrewsbury, with extra trains laid on for the show in past years.",
             "Change at Wolverhampton or Birmingham New Street from most of the country.", "Trains normally run hourly on a Sunday",
             "The station has no step-free access", "Most visitors change at Wolverhampton or Birmingham New Street. Both have frequent trains from London, Manchester, Liverpool, the North West, the South West and Wales, and West Midlands Railway runs the last leg to Cosford.",
             "Avanti West Coast to Wolverhampton, about 2 hours on a Sunday morning, a bit longer if there’s engineering work, then about 15 minutes to Cosford",
             "['Step-free','Telford Central, Wolverhampton']", "The entrance is a few minutes on foot."]


def train_header(p):
    for t in TRL_FACTS:
        assert t in p.orig, t
    for tid in ("{id:'rail',", "{id:'rail-change',"):
        assert tid in p.orig, tid
    st = style_by_id(p, "trlStyle")
    p.rep(st, st + "\n" + TRL_JS)
    LEFT_OUT.append("Getting there, train topics: the example departure time on the route board and the leave and arrive times on the journey line (Cosford's page has no example train times)")


# 12. Photography: Duxford has one of Jack's photos under the heading, so Cosford gets one of his too.
def photo(p):
    head = re.search(r'(<section class="panel" id="photo".*?\n    </div>\n)(    <nav class="ph-jump)', p.s, re.S)
    assert head
    p.rep(head.group(1) + head.group(2), head.group(1)
          + '    <figure class="pic wide reveal"><img class="photo" data-k="p47" alt=""><figcaption>P-47 Thunderbolt on a fast pass.</figcaption></figure>\n'
          + head.group(2))
    assert '"p47": "P-47 Thunderbolt on a fast pass"' in p.orig


LEFT_OUT = []

if __name__ == "__main__":
    main()
