"""Round 2 (Jack, 22 Nov 2026): the Southport page in the Duxford template, and nothing else.

build.py calls duxford_layout() first, on the Southport page (live-source.html) with its embedded photos already
swapped for @@BLOBn@@ markers. It keeps Southport's own words, facts, data and working scripts, and:
  1. takes out every section and block the Duxford page does not have (see LEFT_OUT in build.py),
  2. rewrites the parts whose markup differs from Duxford into Duxford's markup (same classes, so the same CSS
     and the same new design apply), filled with Southport's own content,
  3. brings over the few Duxford template parts Southport is missing (styles and the scripts that drive the
     Duxford markup), read from previews/duxford-new-design-src/live-source.html so they stay in step.
Nothing here writes a new fact: every word put into the page is moved from elsewhere on the Southport page.
Every edit is asserted, so if the live page changes the build stops instead of silently doing something else.
"""
import re


def span_of(t, start, tag):
    """(i, j) of the element that starts at index start, matching nested <tag> and </tag>."""
    depth = 0
    for m in re.finditer(r"<(/?)%s\b[^>]*>" % tag, t[start:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return start, start + m.end()
    raise AssertionError("no end for <%s> at %d" % (tag, start))


def block(t, opening, tag):
    """(i, j) of the one element whose opening tag text is `opening` (must be unique)."""
    assert t.count(opening) == 1, ("not exactly once", opening[:90], t.count(opening))
    return span_of(t, t.index(opening), tag)


def cut(t, opening, tag):
    i, j = block(t, opening, tag)
    return t[:i] + t[j:].lstrip("\n"), t[i:j]


def chunk(t, opening, closing):
    """A whole <script> or <style> chunk, from its opening text to its first closing tag."""
    assert t.count(opening) == 1, ("chunk not exactly once", opening[:90], t.count(opening))
    i = t.index(opening)
    j = t.index(closing, i) + len(closing)
    return i, j


def drop_chunk(t, opening, closing):
    i, j = chunk(t, opening, closing)
    return t[:i] + t[j:].lstrip("\n")


def sub1(t, old, new):
    assert t.count(old) == 1, ("not exactly once", old[:120], t.count(old))
    return t.replace(old, new, 1)


def dx_chunk(dx, opening, closing):
    i, j = chunk(dx, opening, closing)
    return dx[i:j]


SEC = '<section class="panel%s" id="%s" role="tabpanel"'


def section_opening(t, sid):
    m = re.search(r'<section class="panel[^"]*" id="%s"[^>]*>' % sid, t)
    assert m, sid
    return m.group(0)


# ---------------------------------------------------------------------------------------------------------------
def remove_old_sections(t):
    """The Ground Show and Seafront Information: Duxford has neither. The tide tool and seafront cards go with them."""
    for sid in ("ground", "seafront"):
        t, _ = cut(t, section_opening(t, sid), "section")
        t = re.sub(r'\s*<button class="tab" role="tab" id="t-%s"[^>]*>[^<]*</button>' % sid, "", t, count=1)
        assert 'id="t-%s"' % sid not in t
    t = drop_chunk(t, '<script id="seafront-js">', "</script>")
    t = drop_chunk(t, '<style id="sf-cards-box-css">', "</style>")
    # the Seafront Command tide tool (only used in the Seafront section)
    t = drop_chunk(t, '<script>\n(function(){\nvar SF={', "</script>")
    assert "<sf-command" not in t
    return t


def tab_names(t):
    """The tab strip and section bars use Duxford's names (Jack's acceptance test)."""
    t = sub1(t, 'aria-controls="days" aria-selected="false" tabindex="-1">Pick Your Day</button>',
             'aria-controls="days" aria-selected="false" tabindex="-1">Pick Your Show</button>')
    return t


# ---------------------------------------------------------------------------------------------------------------
def overview(t):
    """Duxford: two intro paragraphs then a photo, the key details beside them, and the four jump tiles under the
    grid (not inside it). Southport keeps its three paragraphs and its own key details."""
    i, j = block(t, section_opening(t, "overview"), "section")
    s = t[i:j]
    s, jump = cut(s, '<div class="jump boxes">', "div")
    jump = jump.replace('<div class="jump boxes">', '<div class="jump boxes reveal">', 1)
    # Jack's own photo under the intro, captioned with its own description from the page's photo list
    fig = ('\n        <figure class="pic reveal"><img loading="lazy" decoding="async" class="photo" data-k="stearman" alt="">'
           '<figcaption>An AeroSuperBatics Stearman with a wingwalker standing on the top wing.</figcaption></figure>')
    a, b = block(s, '<div class="ov-intro reveal">', "div")
    intro = s[a:b]
    intro = intro[: intro.rindex("</div>")].rstrip() + fig + "\n      </div>"
    s = s[:a] + intro + s[b:]
    a, b = block(s, '<div class="ov-grid">', "div")
    s = s[:b] + "\n\n    " + jump.strip() + s[b:]
    return t[:i] + s + t[j:]


def travel(t):
    """Duxford's topic explorer markup: a wrap holding the heading block, then the grid (the explorer script
    builds the same layout from either, but the wrapper decides where it sits)."""
    old_open = '<div class="wrap explore-grid">\n      <aside class="explore-side">\n        <h2>Choose a topic</h2>\n'
    m = re.search(re.escape(old_open) + r'        <p>(.*?)</p>\n', t)
    assert m, "travel explorer"
    lede = m.group(1)
    new_open = ('<div class="wrap">\n      <div class="explore-head reveal">\n        <h2>Choose a topic</h2>\n'
                '        <p>' + lede + '</p>\n      </div>\n      <div class="explore-grid">\n'
                '      <aside class="explore-side">\n')
    t = t[:m.start()] + new_open + t[m.end():]
    # close the extra div: the explore grid ends where the explore section ends
    i, j = block(t, '<section class="explore" id="explore" aria-label="Arrival map and information">', "section")
    s = t[i:j]
    k = s.rindex("</section>")
    s = s[:k].rstrip() + "\n    </div>\n  </section>"
    t = t[:i] + s + t[j:]
    # Duxford's Key places heading has no place name beside it (Duxford sets no CG_PLACE), so none here either
    t = sub1(t, "'<div class=\"xd-kp-h\"><span style=\"background:none;color:inherit;padding:0;font-size:inherit;font-family:inherit\">Key places</span>' + (place ? '<span>' + esc(place) + '</span>' : '') + '</div>'",
             "'<div class=\"xd-kp-h\"><span style=\"background:none;color:inherit;padding:0;font-size:inherit;font-family:inherit\">Key places</span></div>'")
    return t


def photo(t):
    """Duxford opens Photography with a wide photo beside the intro, and its Get creative photos are not buttons."""
    i, j = block(t, section_opening(t, "photo"), "section")
    s = t[i:j]
    a, b = block(s, '<div class="panel-head reveal">', "div")
    fig = ('\n    <figure class="pic wide reveal"><img loading="lazy" decoding="async" class="photo" data-k="typhoon" alt="">'
           '<figcaption>RAF Typhoon climbing away in full afterburner.</figcaption></figure>')
    s = s[:b] + fig + s[b:]
    n = len(re.findall(r'<button type="button" class="photo-btn" data-photo="[a-z]+" aria-label="[^"]*">', s))
    assert n == 2, n
    s = re.sub(r'<button type="button" class="photo-btn" data-photo="[a-z]+" aria-label="[^"]*">(<img [^>]*>)</button>',
               r'<span class="photo-btn">\1</span>', s)
    return t[:i] + s + t[j:]


# ---------------------------------------------------------------------------------------------------------------
PIN = ('<span class="xd-tt-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c-3.7 0-6.6 2.9-6.6 6.5 '
       '0 4.9 6.6 12.5 6.6 12.5s6.6-7.6 6.6-12.5c0-3.6-2.9-6.5-6.6-6.5z" fill="currentColor"/><circle cx="12" cy="9" '
       'r="2.5"/></svg></span>')


def watch(t, dx):
    """Where to watch in Duxford's markup: tabs, then one ww-panel per spot (text card beside its Google map).
    Southport's six spots, words and map pins as they are. Southport's note under each map (where the pin is)
    becomes the short location line Duxford shows under each spot's name. The seafront is all public, so every
    tab is an 'inside' (teal family) tab."""
    i, j = block(t, '<section class="ww reveal" id="wwMaps" aria-label="Where to watch, on the map">', "section")
    s = t[i:j]
    head = re.search(r'<div class="ww-head"><div><h3>Where to watch, <em>on the map</em></h3></div><p>(.*?)</p></div>', s)
    tabs = re.findall(r'<button type="button" role="tab" id="ww-t(\d)" aria-controls="ww-p\1" data-i="\1" aria-selected="(?:true|false)"(?: tabindex="-1")?>'
                      r'<span class="xd-tt-ic"><svg.*?</svg></span>([^<]+)</button>', s)
    boards = re.findall(r'<div class="xd-tt-board ww-board" role="tabpanel" id="ww-p(\d)" aria-labelledby="ww-t\1"(?: hidden)?>'
                        r'<div class="ww-grid"><div class="ww-txt"><h4>(.*?)</h4>((?:<p>.*?</p>)+)<ul class="ww-pc">(.*?)</ul>'
                        r'<a class="ww-open" href="([^"]+)" target="_blank" rel="noopener">Open in Google Maps<i aria-hidden="true">&rarr;</i></a></div>'
                        r'<figure class="ww-map">(<iframe [^>]*></iframe>)<figcaption>(.*?)</figcaption></figure></div></div>', s)
    note = re.search(r'<p class="ww-note">.*?</p>', s, re.S)
    assert head and len(tabs) == 6 and len(boards) == 6 and note, (bool(head), len(tabs), len(boards), bool(note))
    out = ['<section class="ww reveal" id="wwMap" aria-label="Where to watch, on the map">',
           '      <div class="ww-head"><div><h3>Where to watch, <em>on the map</em></h3></div><p class="note">%s</p></div>' % head.group(1)]
    bt = []
    for k, label in tabs:
        k = int(k)
        bt.append('<button type="button" role="tab" class="ww-in" id="ww-southport-t%d" aria-controls="ww-southport-p%d" '
                  'aria-selected="%s" tabindex="%d">%s%s</button>' % (k, k, "true" if k == 0 else "false", 0 if k == 0 else -1, PIN, label))
    pn = []
    for k, h4, ps, lis, href, iframe, cap in boards:
        k = int(k)
        lis = lis.replace('<li class="con">', "<li>")
        pn.append('<div class="ww-panel ww-in" role="tabpanel" id="ww-southport-p%d" aria-labelledby="ww-southport-t%d"%s>'
                  '<div class="ww-txt"><h4>%s</h4><p class="ww-where">%s</p>%s<ul class="ww-facts">%s</ul>'
                  '<a class="ww-go" href="%s" target="_blank" rel="noopener">%s<span>Open in Google Maps</span><i aria-hidden="true">&rarr;</i></a></div>'
                  '<div class="ww-map">%s</div></div>' % (k, k, "" if k == 0 else " hidden", h4, cap, ps, lis, href, PIN, iframe))
    out.append('      <div class="sw-tabs ww-tabs"><div class="xd-tt-tabs" role="tablist" aria-label="Viewing spots">'
               + "".join(bt) + "</div>" + "".join(pn) + "</div>")
    out.append("      " + note.group(0))
    out.append("    </section>")
    t = t[:i] + "\n".join(out) + t[j:]
    # the old board styles and tab script out, Duxford's panel styles and tab script in
    i, j = chunk(t, '<style id="ww-maps">', "</style>")
    t = t[:i] + dx_chunk(dx, '<style id="ww-css">', "</style>") + t[j:]
    old = "<script>\n(function(){\n  function pickSpot(box, i){"
    i, j = chunk(t, old, "</script>")
    t = t[:i] + dx_chunk(dx, "<script>\n(function(){\n  function show(box, i){", "</script>") + t[j:]
    return t


# ---------------------------------------------------------------------------------------------------------------
def facilities(t):
    """Duxford's order: Good to know, the food block (photo beside the Food and drink text), the boxes, the traders,
    the questions. Southport's Food and drink box becomes the food block; its other boxes stay as boxes.
    Southport's packing boxes are not on Duxford's page, so they come out (Jack can ask for them back)."""
    i, j = block(t, section_opening(t, "facilities"), "section")
    s = t[i:j]
    m = re.search(r'<div class="reveal"><figure class="fimg">(<img [^>]*>)<figcaption>(.*?)</figcaption></figure>'
                  r'<h3>Food &amp; drink</h3><p>(.*?)</p></div>\n', s)
    assert m, "food box"
    s = s[:m.start()] + s[m.end():].lstrip()
    img = m.group(1).replace("<img ", '<img class="photo" ', 1)
    food = ('<div class="food reveal">\n      <figure class="food-main">%s<figcaption>%s</figcaption></figure>\n'
            '      <div class="food-text">\n        <h3>Food &amp; drink</h3>\n        <p>%s</p>\n      </div>\n    </div>\n\n    '
            % (img, m.group(2), m.group(3)))
    s = sub1(s, '<div class="fac boxes">', food + '<div class="fac boxes reveal">')
    s = s.replace('<div class="reveal"><figure class="fimg">', '<div><figure class="fimg">').replace('<div class="reveal"><h3>', "<div><h3>")
    # Toilets first, as on Duxford
    m = re.search(r'<div><figure class="fimg">.*?<h3>Toilets</h3>.*?</div>\n\s*', s, re.S)
    assert m, "toilets box"
    box = m.group(0)
    s = s[:m.start()] + s[m.end():]
    s = sub1(s, '<div class="fac boxes reveal">\n      ', '<div class="fac boxes reveal">\n      ' + box)
    # Duxford puts the traders block straight after the boxes, then the questions: same order already
    s, _ = cut(s, '<div class="pack boxes reveal">', "div")
    return t[:i] + s + t[j:]


def postcard(t, dx):
    """Duxford's postcard markup and maker (ids, data-k photos, the show list from SW_SHOWS), with Southport's
    words and Southport's four postcard photos (the same photos and labels the live page offers)."""
    i, j = block(t, section_opening(t, "postcard"), "section")
    s = t[i:j]
    btns = re.findall(r'<button type="button" aria-label="([^"]+)"><img src="@@BLOB\d+@@" alt="[^"]*" crossorigin="anonymous" loading="lazy" decoding="async"></button>', s)
    assert len(btns) == 4, len(btns)
    key = {"Battle of Britain Memorial Flight Dakota flanked by two Spitfires": "formation",
           "RAF Typhoon climbing away in full afterburner": "typhoon",
           "Battle of Britain Memorial Flight Spitfire banking overhead": "spitfire",
           "Battle of Britain Memorial Flight Dakota ZA947 passing the crowd": "dakota"}
    pics = "".join('<button type="button" aria-label="%s"><img crossorigin="anonymous" data-k="%s" alt=""></button>' % (b, key[b]) for b in btns)
    s = re.sub(r'<div class="pc-pics">.*?</div>', '<div class="pc-pics" id="pcPics">' + pics + "</div>", s, count=1, flags=re.S)
    s = sub1(s, ' data-sx-postcard role="tabpanel"', ' role="tabpanel"')
    s = sub1(s, ' hidden data-sx="1">', " hidden>")
    s = sub1(s, '<input type="text" class="pc-name"', '<input type="text" id="pcName"')
    s = sub1(s, '<input type="text" class="pc-text"', '<input type="text" id="pcText"')
    s = sub1(s, '<select class="pc-show"></select>', '<select id="pcShow"></select>')
    s = sub1(s, '<canvas width="1500"', '<canvas id="pcCanvas" width="1500"')
    s = sub1(s, '<button type="button" class="pc-save">', '<button type="button" id="pcSave">')
    s = sub1(s, '<button type="button" class="alt pc-share">', '<button type="button" class="alt" id="pcShare">')
    s = sub1(s, '<p class="pc-msg" aria-live="polite">', '<p class="pc-msg" id="pcNote" aria-live="polite">')
    s = sub1(s, '  <div class="wrap">\n<div class="panel-head reveal">', '  <div class="wrap">\n    <div class="panel-head reveal">')
    t = t[:i] + s + t[j:]
    # Duxford's maker, set up with the greeting the Southport page already uses
    conf = "<script>window.PC_CONF={place:'Southport',greet:'Greetings From Southport',msg:'Wish you were here!',slug:'southport',year:'2027'};</script>\n"
    fx = dx_chunk(dx, '<script id="fx-js">', "</script>")
    t = sub1(t, '<script id="kids-js">', conf + fx + '\n<script id="kids-js">')
    return t


def duxford_styles(t, dx):
    """Small Duxford template styles the Southport page never got (tab hover, the start here picker, the header glass)."""
    add = []
    for opening in ("<style>\n/* menu tabs: visitors guide animation.", "<style>\n/* start here picker: visitors guide design */",
                    "<style>body #phCalc .sw-calc .pl-q legend{text-transform:none!important}</style>",
                    "<style>/* header image style and glass Key details box (design updates, 16 Oct 2026) */"):
        c = dx_chunk(dx, opening, "</style>")
        if c not in t:
            add.append(c)
    return sub1(t, '<script id="camping-layout-js">', "\n".join(add) + '\n<script id="camping-layout-js">')


def duxford_glass(t, dx):
    """Duxford's glass effect: its styles and the script that turns the overview jump buttons into tiles. Southport
    never had it. The tile photo keys point at Southport's own photos (the overview hides tile photos anyway)."""
    css = dx_chunk(dx, '<style id="glass-effect">', "</style>")
    js = dx_chunk(dx, '<script id="glass-effect-js">', "</script>")
    js = sub1(js, "lineup:'buchon_front',travel:'parking1',stay:'wildcat_side'}", "lineup:'typhoon',travel:'dakota',stay:'spitfire'}")
    # Southport's photoImg gives a broken image for a key it has not got (Duxford's gives nothing), so ask first
    js = sub1(js, "img=window.photoImg?window.photoImg(PICS[k]||'formation'):''",
              "pk=PICS[k]||'formation', img=(window.photoImg&&window.PHOTO&&window.PHOTO[pk])?window.photoImg(pk):''")
    return sub1(t, '<script id="camping-layout-js">', css + "\n" + js + '\n<script id="camping-layout-js">')


def train_header(t, dx):
    """Jack, 22 Nov 2026 ("add these to all pages"): the dark train route header on the train topics, Duxford's trlStyle
    and trlScript, as on the Wales page. Only the route data (H) and the link change, filled from the Southport page's
    own train facts: its two train topics and the 2026 Saturday times in its train times data."""
    for fact in ('"08:02",\n      "Liverpool Central to Southport",\n      "Arrives 08:49"',
                 '"09:02",\n      "Liverpool Central to Southport",\n      "Arrives 09:49"',
                 "Merseyrail, at 02, 17, 32 and 47 past the hour on Saturdays, about 47 minutes",
                 '"08:09",\n      "Manchester Victoria to Southport",\n      "Via Atherton and Wigan Wallgate, arrives 09:25"',
                 '"Two trains an hour",\n      "One via Atherton and one via Bolton, about 1 hour 15 minutes"',
                 "Southport is the end of the Merseyrail Northern line, with trains from Liverpool Central every 15 minutes through the day.",
                 "Formby, Ainsdale, Birkdale and Hillside are on the same line.",
                 "Northern runs from Manchester Victoria, via Atherton, and Manchester Oxford Road, via Bolton, to Southport through Wigan Wallgate.",
                 "Trains arrive at the same station as Merseyrail, so you have the same walk to the seafront",
                 "meta:[['Walk','About 10 min'],['Frequency','Every 15 min, Sunday times to be confirmed'],['Operator','Merseyrail']]",
                 "meta:[['From','Manchester and Wigan'],['Operator','Northern']]",
                 "From the Merseytravel Northern Line booklet valid from 17 May 2026.",
                 "From the Northern timetable valid 17 May to 12 December 2026.",
                 "https://www.ukairshowguide.co.uk/train-to-southport"):
        assert fact in t, fact
    css = dx_chunk(dx, '<style id="trlStyle">', "</style>")
    js = dx_chunk(dx, '<script id="trlScript-dux">', "</script>")
    h0, h1 = js.index("  var H={"), js.index("  function cur()")
    h = ("  var H={\n"
         "    'rail':hero({to:'Southport',board:'SOUTHPORT',dep:'09:02',arr:'09:49',via:'From Liverpool Central',\n"
         "      p:'Southport is the end of the Merseyrail Northern line, with trains from Liverpool Central every 15 minutes through the day. Formby, Ainsdale, Birkdale and Hillside are on the same line.',\n"
         "      kd:[['How often','Every 15 minutes on Saturdays'],['Get off at','Southport',1],['Then','Walk to the seafront, about 10 min'],['From Liverpool','About 47 minutes'],['Run by','Merseyrail']],\n"
         "      jr:'Liverpool Central to Southport, direct. These are 2026 Saturday times from the Merseytravel Northern Line booklet, so check again nearer the show.',\n"
         "      from:'Liverpool Central',at:'Southport',mid:'Merseyrail, direct<br>47 min'}),\n"
         "    'rail-manc':hero({to:'Southport',board:'SOUTHPORT',dep:'08:09',arr:'09:25',via:'From Manchester Victoria',\n"
         "      p:'Northern runs from Manchester Victoria, via Atherton, and Manchester Oxford Road, via Bolton, to Southport through Wigan Wallgate. Trains arrive at the same station as Merseyrail, so you have the same walk to the seafront.',\n"
         "      kd:[['How often','Two trains an hour'],['Get off at','Southport',1],['Then','Walk to the seafront, about 10 min'],['From Manchester','About 1 hour 15 minutes'],['Run by','Northern']],\n"
         "      jr:'Manchester Victoria to Southport, via Atherton and Wigan Wallgate. These are 2026 Saturday times from the Northern timetable, so check again nearer the show.',\n"
         "      from:'Manchester Victoria',at:'Southport',mid:'Northern, via Wigan Wallgate<br>1h 16m'})\n"
         "  };\n")
    js = js[:h0] + h + js[h1:]
    js = sub1(js, '<script id="trlScript-dux">', '<script id="trlScript-southport">')
    js = sub1(js, "/* Train route header on the Duxford train topics, the same design as the Clacton train topic (9 Nov) */",
              "/* Train route header on the train topics, the Duxford design, with the Southport train facts */")
    js = sub1(js, "https://www.ukairshowguide.co.uk/train-to-duxford", "https://www.ukairshowguide.co.uk/train-to-southport")
    bad = re.findall(r".{60}(?:uxford|Cambridge).{40}", js)
    assert not bad, bad
    return sub1(t, '<style id="jx-css-dux">', css + "\n" + js + "\n" + '<style id="jx-css-dux">')


def duxford_layout(t, dx):
    t = remove_old_sections(t)
    t = tab_names(t)
    t = overview(t)
    t = travel(t)
    t = photo(t)
    t = watch(t, dx)
    t = facilities(t)
    t = postcard(t, dx)
    t = duxford_styles(t, dx)
    t = duxford_glass(t, dx)
    t = train_header(t, dx)
    return t
