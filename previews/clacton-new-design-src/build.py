#!/usr/bin/env python3
"""Builds previews/clacton-new-design.html: the Clacton Airshow feature page in the new design
(the layout made for the RIAT camping pages, in the site's brand colours), using the Duxford page Jack signed off
on 22 Nov 2026 (previews/duxford-new-design-src/) as the template.

It does not retype the page. It reads the live page, camping-layout/clacton.html, and
  1. keeps the site font (Barlow) and takes out capitals and wide letter spacing,
  2. adds the new top bar, photo header, intro, section heading and footer (chrome.html),
  3. adds the new look on top of the page's own styles (new-design.css),
  4. adds a small script that fills the new parts from the page's own content (new-design.js).
Every section, script and data block of the live page is carried over untouched, so the
line-up, topic explorer, planner, train and bus times and the rest keep working.

Run:  python3 previews/clacton-new-design-src/build.py
The live page is never changed. Rebuild after the live page changes to pick the changes up.
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SRC = HERE / "live-source.html"   # the page as it was before the new design (see README)
OUT = ROOT / "camping-layout" / "clacton.html"   # the live page
DUX_SRC = ROOT / "previews" / "duxford-new-design-src" / "live-source.html"   # the Duxford template's own source

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


def cut_element(html, start, what):
    """Remove one element, from its start tag to its matching end tag (nested tags of the same name counted)."""
    i = html.find(start)
    assert i > -1 and html.count(start) == 1, "not found once: " + what
    tag = re.match(r"<([a-z0-9-]+)", start).group(1)
    pat = re.compile(r"<(/?)%s\b[^>]*>" % re.escape(tag))
    depth = 0
    for m in pat.finditer(html, i):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            j = m.end()
            return html[:i] + "<!-- round 2: %s left out, as the Duxford page has no such part -->" % what + html[j:]
    raise AssertionError("no end tag: " + what)


def round2_like_duxford(html):
    """Round 2 (Jack, 22 Nov 2026, previews/NEW-DESIGN-ROLLOUT-2.md): the page must look like the Duxford page and
    nothing else. Parts the Duxford page does not have are left out; every one is listed in LEFT_OUT and the README."""
    # sections the Duxford page does not have, and their tabs
    for sid, name in [("ground", "The Ground Show section"), ("seafront", "Seafront Information section"),
                      ("support", "Keep The Show Free section")]:
        html = cut_element(html, '<section class="panel" id="%s"' % sid, name)
        tab = re.search(r'\n\s*<button class="tab" role="tab" id="t-%s"[^>]*>[^<]*</button>' % sid, html)
        assert tab, "tab " + sid
        html = html[:tab.start()] + html[tab.end():]
    # Getting there: Duxford has no Ways in picker board, no Fares and Save money board, no On the day and Getting home box
    # The Getting there jump strip: Clacton has no On the day and Getting home box (.pbx), so that button would do
    # nothing. It is dropped, so the strip reads Ways in, Fares, Questions (as on Duxford, Southport, Wales, Cosford).
    old = "var JUMPS = [['Ways in', '#explore'], ['Fares', '#tpFares'], ['On the day and getting home', '.pbx'], ['Questions', '#travel .acc']];"
    assert html.count(old) == 1, "JUMPS not found"
    html = html.replace(old, "var JUMPS = [['Ways in', '#explore'], ['Fares', '#tpFares'], ['Questions', '#travel .acc']];", 1)
    # The Fares and Save money board stays: Jack asked for it back (comment on the Clacton preview, 22 Nov 2026, 20:24).
    # The Ways in picker board stays too (hidden, as on the live page): the Fares board's script needs it.
    html = cut_element(html, '<div class="pbx">', "On the day and Getting home box (Getting there)")
    # Food and facilities: Duxford has no Comfort, Family and Camera lists
    html = cut_element(html, '<div class="pack boxes reveal">', "Comfort, Family and Camera lists (Food and facilities)")
    # Where to stay: Duxford opens with a "Search everything nearby" box with buttons. Clacton's search links
    # (Booking.com, Airbnb, Visit Essex) move into that box, in Duxford's markup, with Clacton's own words.
    i = html.find('<div class="stay-group reveal">\n      <h3>Search for more places to stay</h3>')
    assert i > -1
    j = html.index("</div>", i) + len("</div>")
    html = html[:i] + "<!-- round 2: search links moved to the top, as on Duxford -->" + html[j:]
    box = ('<div class="stay-search reveal">\n'
           '      <div><h3>Search everything nearby</h3><p>Hotels, guest houses, apartments and holiday homes in and around Clacton, and places to stay on the Essex Sunshine Coast.</p></div>\n'
           '      <div class="stay-links">\n'
           '        <a class="btn" href="https://www.booking.com/city/gb/clacton-on-sea.html" target="_blank" rel="noopener">Booking.com ↗</a>\n'
           '        <a class="btn ghost-n" href="https://www.airbnb.co.uk/s/Clacton-on-Sea--United-Kingdom/homes" target="_blank" rel="noopener">Airbnb ↗</a>\n'
           '        <a class="btn ghost-n" href="https://www.visitessex.com" target="_blank" rel="noopener">Visit Essex ↗</a>\n'
           '      </div>\n    </div>\n    ')
    k = html.find('<div class="stay-group reveal">\n      <h3>Hotels in Clacton</h3>')
    assert k > -1
    html = html[:k] + box + html[k:]
    # Where to watch, on the map: Duxford's board in Duxford's markup, with Clacton's own spots (see ww_board.py)
    sys.path.insert(0, str(HERE))
    from ww_board import ww_like_duxford
    html = ww_like_duxford(html, DUX_SRC.read_text(encoding="utf8"))
    # Duxford's own list of shared parts it keeps hidden (the More air shows band, the journey planner, the Up close
    # band, the news feed button, the top ten list, the old explore heading), taken from its source so they match.
    dux = DUX_SRC.read_text(encoding="utf8")
    for key in ("dux-ovj-fix", "xd-head-dux"):
        m = re.search(r'<(style|script) id="%s">.*?</\1>' % key, dux, re.S)
        assert m, key
        block = m.group(0).replace('id="%s"' % key, 'id="%s-clacton"' % key) + "\n"
        # the page has no closing body tag of its own (the ones in the file sit inside scripts), so add before </html>
        end = html.rstrip()
        html = (end[:-len("</html>")] + block + "</html>\n") if end.endswith("</html>") else (html + block)
    print("round 2: parts left out:", len(re.findall(r"<!-- round 2: [^>]* left out", html)))
    return html


def main():
    html = SRC.read_text(encoding="utf8")
    blobs = []

    def keep(m):
        blobs.append(m.group(0))
        return "@@BLOB%d@@" % (len(blobs) - 1)

    html = BLOB.sub(keep, html)          # keep the embedded photos out of the text edits
    html = restyle_text(html)

    # Sections that fold. Clacton still has the older folding add-on (16 Oct 2026: .panel.sec with a .sec-toggle bar,
    # and the photography tools folded inside their section). The new design, and every later add-on, is made for the
    # newer one that Duxford has (each section in a section.fold with a .fold-btn bar, one fold-bar to open or close all).
    # So swap the older add-on for the newer one, read from the Duxford live page (never changed), using Clacton's own
    # one line section descriptions. Every section and its content stays exactly as it is.
    head = "<!-- =========================================================\n     FOLDING SECTIONS ADD-ON"
    a = html.find(head)
    assert a > -1 and html.count(head) == 1, "Clacton's folding add-on not found"
    b = html.index("</script>", a) + len("</script>")
    old_block = html[a:b]
    m_subs = re.search(r"var SUBS=(\{.*?\});\n", old_block)
    assert m_subs, "section descriptions (SUBS) not found"
    dux = DUX_SRC.read_text(encoding="utf8")
    dh = "<!-- =========================================================\n     COLLAPSIBLE SECTIONS ADD-ON"
    da = dux.find(dh)
    assert da > -1 and dux.count(dh) == 1, "Duxford's folding add-on not found"
    db = dux.index("</script>", dux.index("<script>", da)) + len("</script>")
    new_block = dux[da:db]
    new_block, nd = re.subn(r"var DESC=\{.*?\n  \};\n", lambda _m: "var DESC=" + m_subs.group(1) + ";\n", new_block, count=1, flags=re.S)
    assert nd == 1, "DESC not found in Duxford's add-on"
    assert "Duxford" not in new_block and "IWM" not in new_block, "Duxford words left in the folding add-on"
    new_block = restyle_text(new_block)
    # Clacton's other scripts open a section through window.secOpen and window.secOpenFor (from the older add-on).
    new_block += ("\n<script>/* new design: the older add-on's helpers, for the scripts that still call them */\n"
                  "(function(){function openFold(f){if(f&&!f.classList.contains('open')){var b=f.querySelector('.fold-btn');if(b)b.click();}}\n"
                  "window.secOpenFor=function(el){if(el&&el.closest)openFold(el.closest('section.fold'));};\n"
                  "window.secOpen=function(id){openFold(document.getElementById('f-'+id)||(document.getElementById(id)&&document.getElementById(id).closest('section.fold')));};})();\n"
                  "</script>")
    html = html[:a] + new_block + html[b:]
    # The hidden "Every part of this guide" index goes above the folds, as in Duxford's later version of that script,
    # not inside the Overview fold.
    old = "    var first=document.getElementById('overview');\n    if(btns.length<20||!first)"
    assert html.count(old) == 1, "txtidx-js not found"
    html = html.replace(old, "    var first=document.querySelector('main > .fold-bar')||document.querySelector('main > .folds')||document.getElementById('overview');\n    if(btns.length<20||!first)", 1)
    print("folding add-on swapped for the newer one,", len(old_block), "->", len(new_block), "characters")

    # Jack's rule, no headings in capitals: two Getting there headings on the Clacton page are typed in capitals.
    # Written in the page's usual heading case instead.
    for old, new in [('<h3 id="cdoTitle">COMPARE DRIVING OPTIONS</h3>', '<h3 id="cdoTitle">Compare Driving Options</h3>'),
                     ('<h3 id="cpkTitle">CAR PARKS IN CLACTON</h3>', '<h3 id="cpkTitle">Car Parks in Clacton</h3>')]:
        assert html.count(old) == 1, old
        html = html.replace(old, new, 1)

    html = round2_like_duxford(html)

    # head: fonts, and keep the preview out of search results
    html = html.replace("</head>", FONT_LINK + "\n</head>", 1)
    html = html.replace('<meta name="viewport"', '<!-- New design. Built by previews/clacton-new-design-src/build.py from live-source.html. Edit the source files, then rebuild. -->\n<meta name="viewport"', 1)

    # Some of the page's scripts work out which show they are on from the file name (clacton.html).
    # This preview has a different name, so tell them the live page's path.
    n = html.count("location.pathname")
    html = html.replace("location.pathname", "(window.NZ_PATH||location.pathname)")
    html = html.replace("<head>", '<head>\n<script>window.NZ_PATH="/airshow-pages/camping-layout/clacton.html";</script>', 1)
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
    # Extra photos of Jack's that the live page does not have, kept hidden and used by new-design.js.
    # None for Clacton yet: drop a .webp of Jack's into img/ and it is picked up here.
    extra = ""
    (HERE / "img").mkdir(exist_ok=True)
    for f in sorted((HERE / "img").glob("*.webp")):
        extra += '<img data-nzpic="%s" alt="" src="data:image/webp;base64,%s">' % (f.stem, base64.b64encode(f.read_bytes()).decode("ascii"))
    tail = '<div hidden id="nzPics">' + extra + '</div>\n' + tail
    html = html[:end] + tail + html[end:]

    html = re.sub(r"@@BLOB(\d+)@@", lambda mm: blobs[int(mm.group(1))], html)
    import sys as _ws_sys; _ws_sys.path.insert(0, str(ROOT / 'previews')); from wixsafe import wix_safe; html = wix_safe(html)   # so the styles also work inside the live site (see previews/wixsafe.py)
    OUT.write_text(html, encoding="utf8")
    print("wrote", OUT.relative_to(ROOT), "%.1f MB" % (len(html.encode("utf8")) / 1e6), "with", len(blobs), "embedded images")


if __name__ == "__main__":
    main()
