#!/usr/bin/env python3
"""Builds previews/shuttleworth-new-design.html: the Shuttleworth (Old Warden) feature page in the new design
(the layout made for the RIAT camping pages, in the site's brand colours).

It does not retype the page. It reads the live page, camping-layout/shuttleworth.html, and
  1. keeps the site font (Barlow) and takes out capitals and wide letter spacing,
  2. adds the new top bar, photo header, intro, section heading and footer (chrome.html),
  3. adds the new look on top of the page's own styles (new-design.css),
  4. adds a small script that fills the new parts from the page's own content (new-design.js).
Every section, script and data block of the live page is carried over untouched, so the
line-up, topic explorer, planner, train and bus times and the rest keep working.

Run:  python3 previews/shuttleworth-new-design-src/build.py
The layout is the Duxford new design Jack signed off on 22 Nov 2026 (previews/duxford-new-design-src/).
The live page is never changed. Rebuild after the live page changes to pick the changes up.
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SRC = HERE / "live-source.html"   # the page as it was before the new design (see README)
OUT = ROOT / "previews" / "shuttleworth-new-design.html"   # round 2 preview (the parent session puts it live)

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


DUX_SRC = HERE.parent / "duxford-new-design-src" / "live-source.html"   # the Duxford page: the template


def one(html, old, new, what):
    """Replace exactly one copy, or stop the build: a template step must never silently miss."""
    assert html.count(old) == 1, "%s: found %d times" % (what, html.count(old))
    return html.replace(old, new, 1)


def block(src, start_marker, end_marker, what):
    i = src.find(start_marker)
    assert i >= 0, what
    j = src.find(end_marker, i)
    assert j > i, what
    return src[i:j + len(end_marker)]


def in_duxford_template(html):
    """Round 2 (Jack, 22 Nov 2026): the page built IN the Duxford template, not the old Shuttleworth page with
    the new look on top. The two live pages came from the same template, so most sections already have the same
    blocks in the same order. These steps change the places where they did not, using Duxford's own markup,
    styles and scripts (read from the Duxford page) and only Shuttleworth's own words, facts and photos.
    Left out, because the Duxford page has no such block: the Chris Murgatroyd photo gallery in the line-up
    (also not Jack's photos), the separate "The airfield layout" block (its drawing and notes now make the map
    in Where to watch, as on Duxford) and the different style of the "Fancy a Spitfire?" flights card."""
    dux = restyle_text(BLOB.sub("", DUX_SRC.read_text(encoding="utf8")))

    # 1. Where to watch: Duxford's spot tabs (#wwMap) and map with numbered spots (#photoMap), in place of
    #    Shuttleworth's own airfield layout block and differently built spot tabs.
    i = html.find('<section class="layout reveal"')
    j = html.find('<p class="ww-note">', i)
    k = html.find("</section>", j)
    assert 0 < i < j < k, "where to watch blocks"
    tabs = block(dux, '<section class="ww reveal" id="wwMap"', "</section>", "duxford spot tabs")
    icon = re.search(r'<span class="xd-tt-ic">(<svg.*?</svg>)</span>', tabs, re.S).group(1)
    goicon = re.search(r'<a class="ww-go"[^>]*><span class="xd-tt-ic">(<svg.*?</svg>)</span>', tabs, re.S).group(1)
    pstyle = dux.rfind("<style>", 0, dux.find('id="photoMap"'))
    pmap_style = dux[pstyle:dux.find("</style>", pstyle) + 8]
    assert ".pmap-head" in pmap_style, "duxford map styles"
    watch = (HERE / "watch.html").read_text(encoding="utf8")
    watch = watch[watch.find("-->") + 3:].strip()
    watch = watch.replace("@@ICON@@", icon).replace("@@GOICON@@", goicon).replace("@@PMAPSTYLE@@", pmap_style)
    html = html[:i] + watch + html[k + len("</section>"):]
    # Duxford's styles and tab script for those spot tabs, in place of the ones for the old ones
    old_css = block(html, '<style id="ww-maps">', "</style>", "old spot tab styles")
    html = one(html, old_css, block(dux, '<style id="ww-css">', "</style>", "duxford spot tab styles"), "spot tab styles")
    m = re.search(r"<script>(?:(?!</script>).)*?pickSpot\(.*?</script>", html, re.S)
    assert m, "old spot tab script"
    dm = re.search(r"<script>(?:(?!</script>).)*?querySelectorAll\('\.ww-panel'\).*?</script>", dux, re.S)
    assert dm, "duxford spot tab script"
    html = html[:m.start()] + dm.group(0) + html[m.end():]
    # Photography: the "In this section" strip links to the map, as on Duxford
    html = one(html, '<a href="#phShows">Sun at each show</a><a href="#phCreative">',
               '<a href="#phShows">Sun at each show</a><a href="#photoMap">Airfield map</a><a href="#phCreative">', "photo jump link")

    # 2. Aircraft line-up: no photo gallery (Duxford has none, and the photos are credited to someone else)
    g = html.find('<section class="cmg reveal" id="cmGallery"')
    if g < 0:
        g = html.find('id="cmGallery"'); g = html.rfind("<section", 0, g)
    ge = html.find("</section>", g)
    assert 0 < g < ge and html[g:ge].count("<section") == 1, "line-up gallery"
    html = html[:g] + html[ge + len("</section>"):]

    # 3. Photography: the photo at the top is one of Jack's own, with no credit, as on Duxford
    m = re.search(r'<figure class="pic wide reveal" style="position:relative"><img loading="lazy" decoding="async" class="photo" src="(@@BLOB\d+@@)" alt="The dark blue Miles Hawk Speed Six racer flying low past the trees at Old Warden, panned"><span class="cm-credit">[^<]*</span><figcaption>[^<]*</figcaption></figure>', html)
    h = re.search(r'<img[^>]*data-pic="harvard_static"[^>]*src="(@@BLOB\d+@@)"', html) or re.search(r'<img[^>]*src="(@@BLOB\d+@@)"[^>]*data-pic="harvard_static"', html)
    assert m and h, "photography opening photo"
    html = html[:m.start()] + ('<figure class="pic wide reveal"><img loading="lazy" decoding="async" class="photo" data-pic="harvard_static" data-dup="1" src="%s" alt="A silver Harvard in RAF markings on the grass"><figcaption>A silver Harvard in RAF markings on the grass.</figcaption></figure>' % h.group(1)) + html[m.end():]

    # 4. Food and facilities: the photo beside the band has Duxford's caption style
    html = one(html, '<figure><img loading="lazy" decoding="async" class="photo" data-pic="bus_bar"',
               '<figure class="busfig"><img loading="lazy" decoding="async" class="photo" data-pic="bus_bar"', "bus bar photo")
    m = re.search(r'(<figure class="busfig"><img[^>]*data-pic="bus_bar"[^>]*>)(</figure>)', html)
    assert m, "bus bar caption"
    html = html[:m.end(1)] + "<figcaption>The Route 47 Events bar, built into a green and cream double decker bus.</figcaption>" + html[m.end(1):]

    bi = dux.find(".busbar figure.busfig{"); be = dux.find("@media(max-width:600px){.busbar figure.busfig figcaption{", bi)
    be = dux.find("}}", be) + 2
    assert 0 < bi < be, "duxford photo caption styles"
    html = one(html, '<style id="op-colours">', '<style id="busfig-css">' + dux[bi:be] + '</style>\n<style id="op-colours">', "photo caption styles")

    # 5. Section bars: the same short descriptions as Duxford (Duxford's bars for these five have none)
    html = one(html, "matchcheck:'Six questions, a match score and what to read next',scores:'Crowds, food, facilities and value for money, rated',compare:'This show next to three others, and my view',whatyousee:'The flying and ground displays, and how loud they are',dayruns:'From the gates opening to the drive home',",
               "right:'Who the show suits, and a quick checker for your group',", "section bar descriptions")

    # 6. Experience flights: every card in Duxford's card styles
    html = one(html, 'class="xf-card xf-hero xf-alt"', 'class="xf-card xf-hero"', "flights card")
    #    and, as on Duxford, one wide card in the last row: the Dragon Rapide is a normal card
    m = re.search(r'<article class="xf-card xf-hero"( data-tags="group">\s*<header><span class="xf-op">Scillonia Airways</span>)', html)
    assert m and html.count("Scillonia Airways</span>") == 1, "dragon rapide card"
    html = html[:m.start()] + '<article class="xf-card"' + m.group(1) + html[m.end():]

    # 7. Shuttleworth's story: a photo of Jack's on the last card, as on Duxford
    html = one(html, "and I always feel that the moment I walk in.</p>",
               'and I always feel that the moment I walk in.</p><figure class="pic st-pic"><img class="photo" data-k="invader" alt="A silver Douglas A-26 Invader in US Air Force markings banking overhead"></figure>', "story photo")

    # 8. Overview: the Where next boxes as Duxford's tiles (Duxford's own styles and script, Shuttleworth's photos)
    ge_css = block(dux, '<style id="glass-effect">', "</style>", "duxford tile styles")
    ge_js = block(dux, '<script id="glass-effect-js">', "</script>", "duxford tile script")
    ge_js = one(ge_js, "lineup:'buchon_front',travel:'parking1',stay:'wildcat_side'", "lineup:'beech18',travel:'queue',stay:'hangars'", "tile photos")
    ge_js = one(ge_js, "PICS[k]||'formation'", "PICS[k]||'static_line'", "tile default photo")
    html = one(html, '<style id="mobile-fit">', ge_css + "\n" + ge_js + '\n<style id="mobile-fit">', "tiles")   # where Duxford has them, before the overview layout script

    # 8b. Getting there: no Fares and save money board (round 2 brief, 20:30). Shuttleworth's only transport prices
    #     are the shuttle bus (£10 return) and free parking, both already on the car parks board, and the Train to
    #     Shuttleworth page lists no fares. So the board is left out, and so is its dead "Fares" jump button.
    html = one(html, "var JUMPS = [['Ways in', '#explore'], ['Fares', '#tpFares'], ", "var JUMPS = [['Ways in', '#explore'], ", "fares jump button")

    # 9. Getting there: the train route header on the train topics, Duxford's design, with Shuttleworth facts.
    #    Times are from the site's own Train to Shuttleworth page (train-routes/shuttleworth.html): the 07:46
    #    Thameslink from London St Pancras, at Biggleswade 08:31, Saturday 14 November 2026 timetable.
    html = one(html, '<style id="op-colours">', block(dux, '<style id="trlStyle">', "</style>", "duxford train header styles") + '\n<style id="op-colours">', "train header styles")
    trl = block(dux, '<script id="trlScript-dux">', "</script>", "duxford train header script")
    start = trl.find("  var H={"); end = trl.find("  function cur()")
    assert 0 < start < end, "train header data"
    H = """  var H={
    'rail-shuttle':hero({to:'Biggleswade',board:'BIGGLESWADE',dep:'07:46',arr:'08:31',via:'From London St Pancras',
      p:'Shuttleworth runs its own shuttle bus between Biggleswade railway station and the showground at every 2027 show. It costs £10 return, and you book it when you buy your show tickets. This might work well for your family if you would rather not drive.',
      kd:[['Runs on','Every 2027 show'],['How often','Twice an hour on Saturdays'],['Get off at','Biggleswade',1],['Then','Shuttleworth shuttle bus, £10 return'],['From London','About 45 min'],['Run by','Thameslink']],
      jr:'London St Pancras to Biggleswade, then the shuttle bus. These are Saturday times from the November 2026 timetable, so check again nearer the show.',
      from:'London St Pancras',at:'Biggleswade',mid:'Thameslink, direct<br>45 min'}),
    'rail-big':hero({to:'Biggleswade',board:'BIGGLESWADE',dep:'07:46',arr:'08:31',via:'From London St Pancras',
      p:'This is the nearest station, 3 miles from Shuttleworth. Thameslink runs the trains on the line between London and Peterborough, and Great Northern adds a few peak time trains.',
      kd:[['Runs on','Every day'],['How often','Twice an hour on Saturdays'],['Get off at','Biggleswade',1],['Then','Taxi, about 10 minutes'],['From London','About 45 min'],['Run by','Thameslink']],
      jr:'London St Pancras to Biggleswade, direct. These are Saturday times from the November 2026 timetable, so check again nearer the show.',
      from:'London St Pancras',at:'Biggleswade',mid:'Thameslink, direct<br>45 min'}),
    'rail-bed':heroNT({to:'Bedford',board:'BEDFORD',via:'Thameslink and East Midlands Railway',
      p:'Bedford is 9.5 miles from Shuttleworth, about 20 minutes by taxi. It’s served by Thameslink (to London, Gatwick and Brighton) and East Midlands Railway (to London St Pancras and Corby), and I would suggest it if you’re coming from the Midlands.',
      kd:[['Distance','9.5 miles'],['Get off at','Bedford',1],['Then','Taxi, about 20 minutes'],['Run by','Thameslink, East Midlands Railway']],
      jr:'You’ll find taxis waiting at the station. It’s a good idea to allow at least 30 minutes to get back to the station after the show, longer at busy times.',
      from:'Bedford',fromNote:'Thameslink and East Midlands Railway',at:'Shuttleworth',atNote:'Old Warden, 9.5 miles',mid:'Taxi<br>about 20 minutes',
      go:'<a class="trl-go" href="https://www.nationalrail.co.uk" target="_blank" rel="noopener"><span><b>Check your train on National Rail</b><small>Times to Bedford, and the way home</small></span><i aria-hidden="true">→</i></a>'})
  };
"""
    # Bedford has no train times on the page, so its header shows the stations and legs without times (as Cosford's does)
    NT = """  function heroNT(o){
    return '<div class="trl-top"><div class="trl-hero"><div><span class="trl-tag">Train route</span><h3>Trains to <span>'+o.to+'</span></h3><p>'+o.p+'</p></div>'
      +'<div><div class="trl-board" aria-label="Destination board"><b><span>'+o.board+'</span></b><small>'+o.via+'</small></div>'+kd(o.kd)+'</div></div>'
      +'<div class="trl-jr"><div class="trl-jr-h"><b>Your journey</b><span>'+o.jr+'</span></div>'
      +'<div class="trl-line"><div class="trl-stop"><i></i><b>'+o.from+'</b><small>'+o.fromNote+'</small></div><div class="trl-mid">'+o.mid+'</div><div class="trl-stop"><i></i><b>'+o.at+'</b><small>'+o.atNote+'</small></div></div></div>'
      +(o.go||GO)+'</div>';
  }
"""
    H = NT + H
    trl = trl[:start] + H + trl[end:]
    trl = trl.replace('id="trlScript-dux"', 'id="trlScript-shuttleworth"').replace("train-to-duxford", "train-to-shuttleworth")
    trl = trl.replace("/* Train route header on the Duxford train topics", "/* Train route header on the Shuttleworth train topics, in the Duxford page's design")
    assert "duxford" not in trl.split("*/", 1)[1].lower() and "Cambridge" not in trl, "train header text"
    html = one(html, '<style id="op-colours">', trl + '\n<style id="op-colours">', "train header script")
    return html


def main():
    html = SRC.read_text(encoding="utf8")
    blobs = []

    def keep(m):
        blobs.append(m.group(0))
        return "@@BLOB%d@@" % (len(blobs) - 1)

    html = BLOB.sub(keep, html)          # keep the embedded photos out of the text edits
    html = restyle_text(html)
    html = in_duxford_template(html)

    # head: fonts, and keep the preview out of search results
    html = html.replace("</head>", FONT_LINK + "\n</head>", 1)
    html = html.replace('<meta name="viewport"', '<!-- New design. Built by previews/shuttleworth-new-design-src/build.py from live-source.html. Edit the source files, then rebuild. -->\n<meta name="viewport"', 1)

    # Some of the page's scripts work out which show they are on from the file name (shuttleworth.html).
    # This preview has a different name, so tell them the live page's path.
    n = html.count("location.pathname")
    html = html.replace("location.pathname", "(window.NZ_PATH||location.pathname)")
    html = html.replace("<head>", '<head>\n<script>window.NZ_PATH="/airshow-pages/camping-layout/shuttleworth.html";</script>', 1)
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
    # Extra photos of Jack's that the live page does not have go in img/ (none yet for Shuttleworth),
    # kept hidden and used by new-design.js.
    extra = ""
    for f in sorted((HERE / "img").glob("*.webp")):
        extra += '<img data-nzpic="%s" alt="" src="data:image/webp;base64,%s">' % (f.stem, base64.b64encode(f.read_bytes()).decode("ascii"))
    tail = '<div hidden id="nzPics">' + extra + '</div>\n' + tail
    html = html[:end] + tail + html[end:]

    html = re.sub(r"@@BLOB(\d+)@@", lambda mm: blobs[int(mm.group(1))], html)
    OUT.write_text(html, encoding="utf8")
    print("wrote", OUT.relative_to(ROOT), "%.1f MB" % (len(html.encode("utf8")) / 1e6), "with", len(blobs), "embedded images")


if __name__ == "__main__":
    main()
