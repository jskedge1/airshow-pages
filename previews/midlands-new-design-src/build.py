#!/usr/bin/env python3
"""Builds previews/midlands-new-design.html: the Midlands Air Festival feature page in the new design
(the layout made for the RIAT camping pages, in the site's brand colours).

It does not retype the page. It reads the live page, camping-layout/midlands.html, and
  1. keeps the site font (Barlow) and takes out capitals and wide letter spacing,
  2. adds the new top bar, photo header, intro, section heading and footer (chrome.html),
  3. adds the new look on top of the page's own styles (new-design.css),
  4. adds a small script that fills the new parts from the page's own content (new-design.js).
Every section, script and data block of the live page is carried over untouched, so the
line-up, topic explorer, planner, train and bus times and the rest keep working.

Run:  python3 previews/midlands-new-design-src/build.py
Made from the Duxford template (previews/duxford-new-design-src/), which Jack signed off on 22 Nov 2026.
The live page is never changed. Rebuild after the live page changes to pick the changes up.
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SRC = HERE / "live-source.html"   # the page as it was before the new design (see README)
OUT = ROOT / "camping-layout" / "midlands.html"   # the live page

FONT_LINK = ('<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800'
             '&family=Caveat:wght@600;700&display=swap" rel="stylesheet">')
LOGO = ROOT / "brand" / "ukag-header-logo.png"   # the white UK Airshow Guide logo, as on the camping pages

# How it compares (Jack, 22 Nov 2026): the same card design as the 2027 calendar, one card per show,
# with the show this guide is about picked out in green.
FRAME_CMP = (
    'html body .cmp-wrap{display:none!important}'
    'html body .cmp-cards{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:20px!important;background:none!important;padding:0!important}'
    'html body .cmp-cards article{background:#fff!important;border:1px solid #DCE3E8!important;border-top:5px solid #6950A1!important;padding:0!important;box-shadow:0 20px 32px -26px rgba(11,26,39,.5)!important;display:flex!important;flex-direction:column!important;transition:transform .4s cubic-bezier(.22,.61,.36,1),box-shadow .4s!important}'
    'html body .cmp-cards article:nth-child(3){border-top-color:#00A6E2!important}'
    'html body .cmp-cards article:nth-child(4){border-top-color:#D74949!important}'
    'html body .cmp-cards article:hover{transform:translateY(-6px)!important;box-shadow:0 30px 40px -24px rgba(11,26,39,.55)!important}'
    'html body .cmp-cards h3{background:#13293C!important;color:#fff!important;font:700 22px/1.2 "Barlow",sans-serif!important;text-transform:none!important;margin:0!important;padding:20px 20px 18px!important;min-height:92px!important;display:flex!important;flex-direction:column!important;justify-content:flex-end!important}'
    'html body .cmp-cards dl{padding:6px 20px 14px!important;margin:0!important}'
    'html body .cmp-cards dl div{display:block!important;padding:12px 0 11px!important;border-top:0!important;border-bottom:1px solid #DCE3E8!important;font-size:16px!important;line-height:1.4!important}'
    'html body .cmp-cards dl div:last-child{border-bottom:0!important}'
    'html body .cmp-cards dt{color:#0E5F5B!important;font:700 15.5px/1.3 "Barlow",sans-serif!important}'
    'html body .cmp-cards dd{color:#13293C!important;font:600 16.5px/1.4 "Barlow",sans-serif!important;margin:3px 0 0!important}'
    # the chosen show: green
    'html body .cmp-cards article.me{background:#EDF7F0!important;border-color:#1C7332!important;border-top-color:#1C7332!important;box-shadow:0 0 0 2px #1C7332,0 24px 36px -24px rgba(28,115,50,.55)!important}'
    'html body .cmp-cards article.me h3:not(#nz0):not(#nz1){background:#1C7332!important;color:#fff!important}'
    'html body .cmp-cards article.me h3::before{content:"This guide";align-self:flex-start;background:#fff;color:#1C7332;font:700 15px/1 "Barlow",sans-serif;padding:7px 10px 6px;margin-bottom:10px}'
    'html body .cmp-cards article.me dl div{border-bottom-color:#BFDCC8!important}'
    'html body .cmp-cards article.me dt{color:#1C7332!important}'
    'html body .cmp-cards article.me dd{font-weight:700!important}'
    '@media (max-width:1000px){html body .cmp-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}}'
    '@media (max-width:560px){html body .cmp-cards{grid-template-columns:1fr!important}html body .cmp-cards h3{min-height:0!important}}'
    '@media (prefers-reduced-motion:reduce){html body .cmp-cards article{transition:none!important;transform:none!important}}'
)
# Quick checker (Jack, 22 Nov 2026): the clean look, same layout. Question boxes with a coloured top edge,
# borderless rounded answer buttons that turn navy when picked, and a smooth hover.
FRAME_CHECK = (
    'html body .qs li{background:#F3F6F8!important;border:0!important;border-top:5px solid var(--sc,#32B4AF)!important;border-left:0!important;box-shadow:none!important;border-radius:0!important;transition:transform .45s cubic-bezier(.22,.61,.36,1),box-shadow .45s,background .35s!important}'
    'html body .qs li:hover{background:#fff!important;transform:translateY(-4px);box-shadow:0 22px 34px -24px rgba(11,26,39,.5)!important}'
    'html body .qs li .sn{display:none!important}'
    # with the number hidden, the question must span the whole box (on phones it was squeezed into the 44px number column)
    'html body .qs li .q{grid-column:1/-1!important}'
    'html body .qs li::before{display:none!important}html body .qs li .q{border-left:0!important;padding-left:20px!important}'
    'html body .qs .q legend{font:700 21px/1.25 "Barlow",sans-serif!important;color:#13293C!important}'
    'html body .qs .q legend span{display:block!important;font:700 15.5px/1.2 "Barlow",sans-serif!important;color:var(--sc,#0E5F5B)!important;margin-bottom:5px!important;text-transform:none!important;letter-spacing:0!important;filter:brightness(.8)}'
    'html body .qs .q legend small{display:block!important;font:400 15.5px/1.45 "Barlow",sans-serif!important;color:#4A5A66!important;margin-top:4px!important}'
    'html body .qs .opts{gap:8px!important}'
    'html body .qs .opts button{background:#E4EBF0!important;color:#13293C!important;border:0!important;border-left:0!important;border-radius:10px!important;box-shadow:none!important;font:600 16px/1.25 "Barlow",sans-serif!important;padding:13px 16px!important;transition:background .45s cubic-bezier(.22,.61,.36,1),color .45s,transform .45s cubic-bezier(.22,.61,.36,1),box-shadow .45s!important}'
    'html body .qs .opts button::before,html body .qs .opts button::after{display:none!important}'
    'html body .qs .opts button:hover{background:#fff!important;transform:translateY(-3px)!important;box-shadow:0 0 0 2px #13293C,0 16px 24px -16px rgba(11,26,39,.55)!important}'
    'html body .qs .opts button[aria-pressed="true"]{background:#13293C!important;color:#fff!important;box-shadow:inset 0 -4px 0 var(--sc,#32B4AF),0 12px 20px -14px rgba(11,26,39,.8)!important;transform:none!important}'
    'html body aside.result{border-radius:6px!important;overflow:hidden!important;box-shadow:0 30px 50px -30px rgba(11,26,39,.85)!important;border:0!important}'
    'html body aside.result .board-h{border-bottom:0!important}'
    'html body aside.result .board-rows > div{border-bottom:1px solid rgba(255,255,255,.12)!important;border-top:0!important}'
    'html body aside.result .board-rows dt{color:#8FE0DC!important;font:600 15.5px/1.3 "Barlow",sans-serif!important}'
    'html body aside.result .bar i{border-radius:2px!important}'
    '@media (prefers-reduced-motion:reduce){html body .qs li,html body .qs .opts button{transition:none!important;transform:none!important}}'
)
# What you'll see, and the headings of every framed part (Jack, 22 Nov 2026): a clean look.
FRAME_SEE = (
    'html body .panel-head h2{color:#13293C!important;border-left:0!important;padding-left:0!important;font:700 clamp(30px,4.2vw,46px)/1.12 "Barlow",sans-serif!important;text-transform:capitalize!important}'
    'html body .panel-head h2::before{display:none!important}'
    'html body .panel-head p{font:400 17px/1.65 "Barlow",sans-serif!important;color:#4A5A66!important}'
    'html body .filters{gap:14px!important;margin-bottom:22px!important}'
    'html body .filters button{background:#F3F6F8!important;border:0!important;border-top:5px solid var(--fc,#32B4AF)!important;border-radius:0!important;padding:16px 18px 14px!important;font:700 17.5px/1.2 "Barlow",sans-serif!important;color:#13293C!important;transition:transform .35s cubic-bezier(.22,.61,.36,1),box-shadow .35s,background .3s!important}'
    'html body .filters button:hover{transform:translateY(-4px);background:#fff!important;box-shadow:0 20px 30px -22px rgba(11,26,39,.5)}'
    'html body .filters button span{border-radius:0!important;background:#fff!important;font:700 15px/1 "Barlow",sans-serif!important;min-width:32px!important;height:28px!important}'
    'html body .filters button[aria-pressed="true"]{background:#13293C!important;color:#fff!important}'
    'html body .filters button[aria-pressed="true"] span{background:var(--fc,#32B4AF)!important;color:#fff!important}'
    'html body .see{background:none!important;padding:0!important;gap:14px!important}'
    'html body .see-r{border:1px solid #DCE3E8!important;box-shadow:0 16px 26px -24px rgba(11,26,39,.5)!important;padding:20px 24px 20px 0!important;gap:0 26px!important;transition:transform .35s cubic-bezier(.22,.61,.36,1),box-shadow .35s!important}'
    'html body .see-r:hover{transform:translateY(-4px);box-shadow:0 24px 34px -22px rgba(11,26,39,.5)!important}'
    'html body .see-r h3{font:700 22px/1.2 "Barlow",sans-serif!important;color:#13293C!important;text-transform:none!important}'
    'html body .see-r h3 .tag{font:700 14.5px/1 "Barlow",sans-serif!important;padding:6px 9px 5px!important;border-radius:0!important}'
    'html body .see-r p{font:400 16.5px/1.6 "Barlow",sans-serif!important;color:#4A5A66!important;margin-top:6px!important}'
    'html body .see-r p b{color:#13293C!important}'
    'html body .meter{font:700 15px/1.2 "Barlow",sans-serif!important;color:#13293C!important}'
    'html body .meter span{gap:4px!important;margin-top:8px!important}'
    'html body .meter span i{height:10px!important;background:#DCE3E8}'
    '@media (prefers-reduced-motion:reduce){html body .filters button,html body .see-r{transition:none!important;transform:none!important}}'
)


BLOB = re.compile(r"data:(?:image|application|font)/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+")


def restyle_text(s):
    """Font, capitals and letter spacing, changed in the page's own styles and scripts."""
    # font: Barlow throughout, as on the camping pages and the rest of the site (no condensed headings)
    s = s.replace("Barlow Condensed", "Barlow")
    # Jack's rule: no capitals with wide letter spacing. Capitals go, so labels read as they were typed
    # (sentence case). Headings keep the page's own title case rule.
    s = re.sub(r"text-transform:\s*uppercase", "text-transform:none", s)
    s = re.sub(r"letter-spacing:\s*-?\.?[\d.]+(?:em|px)", "letter-spacing:0", s)
    return s



# ---- Round 2 (Jack, 22 Nov 2026): the page is built IN the Duxford template, not the old Midlands page with the new
# look on top. See previews/NEW-DESIGN-ROLLOUT-2.md. The Midlands page was first made from the Duxford page, so its
# sections already use Duxford's markup. This step takes out everything the Duxford page does not have, and lines the
# rest up with Duxford (section names, ids). Only Midlands' own words are kept. Nothing is added. Every edit is checked.
# Left out (listed for Jack in the README): The balloons, Camping at Ragley and The ground show sections; the Jack's tip
# boxes in Overview and Where to watch; the Friday Nightfire evening block in Plan your day; the camping line in
# Where to stay. Duxford blocks with no Midlands facts (not added): Flightline walk, the photographers' map, the
# shuttle bus band in Food and facilities.

def cut_block(html, start):
    """Remove the element that starts with the exact text `start`, up to its matching closing tag."""
    i = html.find(start)
    assert i >= 0 and html.count(start) == 1, start
    tag = re.match(r"<([a-z0-9]+)", start).group(1)
    depth, j = 0, i
    pat = re.compile(r"<(/?)%s\b[^>]*>" % tag)
    for m in pat.finditer(html, i):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            j = m.end()
            break
    else:
        raise AssertionError("no end for " + start)
    # take the line break after it too
    if html[j:j + 1] == "\n":
        j += 1
    return html[:i] + html[j:]


def swap(html, old, new):
    assert html.count(old) == 1, old
    return html.replace(old, new, 1)


def align_to_duxford(html):
    # sections Duxford does not have
    for sec in ("balloons", "camping", "ground"):
        html = cut_block(html, '<section class="panel" id="%s"' % sec)
        html = re.sub(r'\s*<button class="tab" role="tab" id="t-%s"[^>]*>[^<]*</button>' % sec, "", html, count=1)
        assert 'id="t-%s"' % sec not in html, sec
    html = cut_block(html, '<script id="balloons-js">')
    # section names in the bars and the tab strip, as on Duxford
    html = swap(html, 'aria-controls="days" aria-selected="false" tabindex="-1">Pick Your Day</button>',
                'aria-controls="days" aria-selected="false" tabindex="-1">Pick Your Show</button>')
    html = swap(html, 'aria-controls="flights" aria-selected="false" tabindex="-1">Balloon Flights</button>',
                'aria-controls="flights" aria-selected="false" tabindex="-1">Experience Flights</button>')
    # old header button (hidden in the new design) pointed at The balloons: as on Duxford
    html = swap(html, '<button type="button" class="cg-go" data-goto="balloons">The balloons</button>',
                '<button type="button" class="cg-go" data-goto="lineup">Aircraft line-up</button>')
    # Overview: Duxford has no tip box in My view, and its box at the foot has no link
    html = cut_block(html, '<div class="ns-note"><b>Jack&rsquo;s tip</b>Tickets are advance only, with none sold on the gate.')
    html = swap(html, ' <button type="button" class="inline-link" data-goto="balloons">When and where to see them</button>', '')
    # Pick your show tip: its links went to the removed sections. The camping line is Jack's own, from Camping at Ragley.
    html = swap(html, 'Camping is only for 3 day ticket holders, so take a look at <button type="button" class="inlink" data-goto="camping">Camping At Ragley</button> before you book, and <button type="button" class="inlink" data-goto="balloons">The Balloons</button> for when they fly.',
                'Camping is only for 3 day ticket holders, so I&rsquo;d book both together.')
    # Where to stay: the line pointing to Camping at Ragley
    html = cut_block(html, '<p class="vl-intro">Camping on the estate is covered in')
    # Plan your day: the Friday Nightfire evening block is not on Duxford
    html = cut_block(html, '<div class="wk-eve reveal"')
    # Help on show days: drop the pointer to the removed section
    html = swap(html, 'The balloons are weather permitting. Take a look at <button type="button" class="inlink" data-goto="balloons">The Balloons</button> for what happens if it&rsquo;s too windy.</p>',
                'The balloons are weather permitting.</p>')
    # Where to watch: no tip box on Duxford
    html = cut_block(html, '<div class="ns-note"><b>Jack&rsquo;s tip</b>There&rsquo;s no seating, so I would bring a low chair or a blanket.')
    # Story: Duxford's story tip is a line inside the card
    html = swap(html, '<div class="ns-note"><b>Jack&rsquo;s tip</b>The house itself is now kept for events and filming rather than everyday visits, so I would suggest enjoying the view of it across Capability Brown&rsquo;s parkland while you wait for the balloons.</div>',
                '<p class="st-tip">The house itself is now kept for events and filming rather than everyday visits, so I would suggest enjoying the view of it across Capability Brown&rsquo;s parkland while you wait for the balloons.</p>')
    # Photography: Duxford's ids, so the same styles and links apply (sun guide #phSun, sun at each show #phShows)
    html = swap(html, '<a href="#phGuide">Sun guide</a><a href="#phSun">Sun each day</a>', '<a href="#phSun">Sun guide</a><a href="#phShows">Sun each day</a>')
    html = swap(html, '<section class="ph-sec" id="phSun"', '<section class="ph-sec" id="phShows"')
    html = swap(html, '<div class="sun-embed reveal" id="phGuide">', '<div class="sun-embed reveal" id="phSun">')
    # the page's own styles for its sun table follow it to its new id
    for sel in ("#phSun .sun-table{", "#phSun .sun-card li{", "#phSun .sun-card li span{", "#phSun .sun-card li b{"):
        html = swap(html, sel, sel.replace("#phSun", "#phShows"))
    # Pick your show: Duxford ends the section with its "Official site" box. Midlands' own official site link and label.
    html = swap(html, '<p class="note sf-src">Opening times are for 2027. Flying and balloon times haven&rsquo;t been published yet',
                '<div class="sp-links"><a href="https://www.midlandsairfestival.com/" target="_blank" rel="noopener"><b>Official site</b><span>Midlands Air Festival</span></a></div><p class="note sf-src">Opening times are for 2027. Flying and balloon times haven&rsquo;t been published yet')
    # Food and facilities: Duxford's boxes all have a photo. These two text only cards are not in Duxford's set, and their
    # facts are already on the page (re-entry with a hand stamp in Good to know and Pick your show; layers and a torch in
    # Plan your day's Bring list), so they are left out.
    html = cut_block(html, '<div><h3>Leaving and coming back</h3>')
    html = cut_block(html, '<div><h3>What to wear</h3>')
    # Quick checker: "read next" only lists sections the page has
    for old, new in ((",r:['kids','balloons','timeline','facilities']", ",r:['kids','timeline','facilities']"),
                     (",r:['photo','balloons','watch','camping']", ",r:['photo','watch']"),
                     (",r:['balloons','camping','timeline','flights']", ",r:['timeline','flights']")):
        html = swap(html, old, new)
    # ---- Getting there, added 22 Nov 2026 20:15 and 20:30 (round 2 brief: Jack's comments on the Wales and Clacton previews) ----
    # Compare driving options (#cdo) and Car parks at Ragley Hall (#cpk) stay exactly as on the live page (untouched here).
    # 1. The train topic gets Duxford's train route header (trlStyle and its script), as on the Wales page, filled with the
    #    Midlands page's own train facts: the Train to Redditch topic and the first Saturday train in its train times data.
    dux = (ROOT / "previews" / "duxford-new-design-src" / "live-source.html").read_text(encoding="utf8")
    ta = dux.index('<style id="trlStyle">')
    tz = dux.index("</style>", ta) + len("</style>")
    sa = dux.index('<script id="trlScript-dux">')
    sz = dux.index("</script>", sa) + len("</script>")
    trl = dux[sa:sz]
    h0, h1 = trl.index("  var H={"), trl.index("  function cur()")
    for fact in ("id:'rail-red'", '"08:15",\n      "Birmingham New Street to Redditch",\n      "Arrives 08:53, in time for the 09:30 bus"',
                 '"Every 30 minutes",\n      "West Midlands Railway, about 40 minutes"', "I would suggest Redditch as the most suitable station for the festival. From there, the Diamond 247 bus between Redditch and Evesham stops right by the Ragley Hall main entrance.",
                 '"title": "Saturday, linking with the 247 bus"', "train-to-midlands"):
        assert fact in html, fact
    mid_h = ("  var H={\n"
             "    'rail-red':hero({to:'Redditch',board:'REDDITCH',dep:'08:15',arr:'08:53',via:'From Birmingham New Street',\n"
             "      p:'I would suggest Redditch as the most suitable station for the festival. From there, the Diamond 247 bus between Redditch and Evesham stops right by the Ragley Hall main entrance.',\n"
             "      kd:[['How often','Every 30 minutes'],['Get off at','Redditch',1],['Then','Diamond 247 bus'],['From Birmingham','About 40 minutes'],['Run by','West Midlands Railway']],\n"
             "      jr:'Birmingham New Street to Redditch, in time for the 09:30 bus. These are Saturday times from the 2026 timetable, so check again nearer the show.',\n"
             "      from:'Birmingham New Street',at:'Redditch',mid:'West Midlands Railway<br>38 min'})\n"
             "  };\n")
    trl = trl[:h0] + mid_h + trl[h1:]
    trl = trl.replace('<script id="trlScript-dux">', '<script id="trlScript-midlands">', 1)
    trl = trl.replace("/* Train route header on the Duxford train topics, the same design as the Clacton train topic (9 Nov) */",
                      "/* Train route header on the train topic, the Duxford design, with the Midlands train facts */", 1)
    trl = swap(trl, "https://www.ukairshowguide.co.uk/train-to-duxford", "https://www.ukairshowguide.co.uk/train-to-midlands")
    html = swap(html, '<style id="jx-css-dux">', dux[ta:tz] + "\n" + trl + "\n" + '<style id="jx-css-dux">')
    # 2. The Fares and Save money board, as on the Clacton round 2 page (fares.html, from the Wales version), with the hidden
    #    Ways in board its script needs. Midlands' only travel prices are its 2027 parking prices, so there are no More fares tabs.
    for fact in ('<span class="cdo-cost">&pound;9.97</span>', "Premium and disabled parking are both chosen when you book your tickets. Premium is a price per day. These are the 2027 prices, so I would check them again before you go.",
                 "Standard parking is free and included with your ticket.", "For 2027, children 12 and under go free."):
        assert fact in html or fact.replace("&pound;", "£") in html, fact
    html = swap(html, '\n  <div class="wrap"><section class="cdo reveal" id="cdo"',
                "\n" + (HERE / "fares.html").read_text(encoding="utf8") + '\n  <div class="wrap"><section class="cdo reveal" id="cdo"')
    # 3. The jump strip: the "On the day and getting home" button pointed at a .pbx box this page does not have.
    html = swap(html, "var JUMPS = [['Ways in', '#explore'], ['Fares', '#tpFares'], ['On the day and getting home', '.pbx'], ['Questions', '#travel .acc']];",
                "var JUMPS = [['Ways in', '#explore'], ['Fares', '#tpFares'], ['Questions', '#travel .acc']];")
    left = re.findall(r'data-goto="(balloons|camping|ground)"', html)
    assert not left, left
    return html


def main():
    html = SRC.read_text(encoding="utf8")
    blobs = []

    def keep(m):
        blobs.append(m.group(0))
        return "@@BLOB%d@@" % (len(blobs) - 1)

    html = BLOB.sub(keep, html)          # keep the embedded photos out of the text edits
    html = align_to_duxford(html)
    html = restyle_text(html)

    # head: fonts, and keep the preview out of search results
    html = html.replace("</head>", FONT_LINK + "\n</head>", 1)
    html = html.replace('<meta name="viewport"', '<!-- New design. Built by previews/midlands-new-design-src/build.py from live-source.html. Edit the source files, then rebuild. -->\n<meta name="viewport"', 1)

    # Some of the page's scripts work out which show they are on from the file name (midlands.html).
    # This preview has a different name, so tell them the live page's path.
    n = html.count("location.pathname")
    html = html.replace("location.pathname", "(window.NZ_PATH||location.pathname)")
    html = html.replace("<head>", '<head>\n<script>window.NZ_PATH="/airshow-pages/camping-layout/midlands.html";</script>', 1)
    print("file name lookups pointed at the live page:", n)

    # The quick checker, scores, compare and the other framed parts are drawn from one template.
    # Jack, 22 Nov 2026: no patterned background behind them, plain white like the rest of the page.
    tpl = '<template id="rfySrc">'
    assert tpl in html
    html = html.replace(tpl, tpl + '<style id="nz-frame">html body div.panel{background:#fff!important;background-image:none!important}' + FRAME_CMP + FRAME_SEE + FRAME_CHECK + '</style>', 1)

    chrome = (HERE / "chrome.html").read_text(encoding="utf8")
    import base64
    chrome = chrome.replace("@@LOGO@@", "data:image/png;base64," + base64.b64encode(LOGO.read_bytes()).decode("ascii"))
    top, bottom = chrome.split("<!-- SPLIT -->")
    css = (HERE / "new-design.css").read_text(encoding="utf8")
    js = (HERE / "new-design.js").read_text(encoding="utf8")

    m = re.search(r"<body[^>]*>", html)
    if not m:
        sys.exit("no <body> found")
    html = html[:m.end()] + "\n" + top + html[m.end():]
    # the live page has no closing body tag of its own (the ones in the file sit inside scripts), so add to the very end
    end = len(html.rstrip())
    if html.rstrip().endswith("</html>"):
        end = html.rstrip().rfind("</html>")
    tail = bottom + '\n<style id="nz-css">\n' + css + '\n</style>\n<script id="nz-js">\n' + js + "\n</script>\n"
    html = html[:end] + tail + html[end:]

    html = re.sub(r"@@BLOB(\d+)@@", lambda mm: blobs[int(mm.group(1))], html)
    import sys as _ws_sys; _ws_sys.path.insert(0, str(ROOT / 'previews')); from wixsafe import wix_safe; html = wix_safe(html)   # so the styles also work inside the live site (see previews/wixsafe.py)
    OUT.write_text(html, encoding="utf8")
    print("wrote", OUT.relative_to(ROOT), "%.1f MB" % (len(html.encode("utf8")) / 1e6), "with", len(blobs), "embedded images")


if __name__ == "__main__":
    main()
