#!/usr/bin/env python3
"""Builds previews/duxford-new-design.html: the Duxford feature page in the new design
(the layout made for the RIAT camping pages, in the site's brand colours).

It does not retype the page. It reads the live page, camping-layout/duxford.html, and
  1. keeps the site font (Barlow) and takes out capitals and wide letter spacing,
  2. adds the new top bar, photo header, intro, section heading and footer (chrome.html),
  3. adds the new look on top of the page's own styles (new-design.css),
  4. adds a small script that fills the new parts from the page's own content (new-design.js).
Every section, script and data block of the live page is carried over untouched, so the
line-up, topic explorer, planner, train and bus times and the rest keep working.

Run:  python3 previews/duxford-new-design-src/build.py
The live page is never changed. Rebuild after the live page changes to pick the changes up.
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SRC = HERE / "live-source.html"   # the page as it was before the new design (see README)
OUT = ROOT / "camping-layout" / "duxford.html"   # the live page

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


def main():
    html = SRC.read_text(encoding="utf8")
    blobs = []

    def keep(m):
        blobs.append(m.group(0))
        return "@@BLOB%d@@" % (len(blobs) - 1)

    html = BLOB.sub(keep, html)          # keep the embedded photos out of the text edits
    html = restyle_text(html)

    # Duxford's story (Jack, 22 Nov 2026): facts checked against IWM, Historic England, the RAF Museum and the
    # American Air Museum. Two corrections, and more of Jack's photos.
    fixes = [
        ("19 Squadron received its first Spitfire, K9789, only the third one ever built.",
         "19 Squadron received its first Spitfire, K9789, the third production Spitfire."),
        ("In April 1943 the US Army Air Forces took over, and Duxford became Station 357, home of the 78th Fighter Group.",
         "In April 1943 the US 78th Fighter Group arrived, and on 15 June 1943 Duxford was handed over to the US Eighth Air Force as Station 357."),
        ('<figure class="pic st-pic"><img class="photo" data-k="buchon_pan" alt=""></figure>',
         '<figure class="pic st-pic"><img class="photo" data-k="buchon_front" alt="A Hispano Buchón head on, with its propeller turning, at Duxford"></figure>'),
        ("you&rsquo;re seeing it on the airfield where it all began.</p>",
         'you&rsquo;re seeing it on the airfield where it all began.</p><figure class="pic st-pic"><img class="photo" data-k="wildcat_side" alt="A Grumman Wildcat taxiing on the airfield at Duxford"></figure>'),
    ]
    # Photographers' map (Jack, 22 Nov 2026): a new spot 8 on the crowd line, for taxi shots. Jack will add a photo.
    fixes += [
        ('<g transform="translate(150 360)"><circle r="14" fill="#32B4AF" stroke="#fff" stroke-width="2"/><text y="5">4</text></g>',
         '<g transform="translate(150 360)"><circle r="14" fill="#32B4AF" stroke="#fff" stroke-width="2"/><text y="5">4</text></g>\n              <g transform="translate(212 318)"><circle r="14" fill="#32B4AF" stroke="#fff" stroke-width="2"/><text y="5">8</text></g>'),
        ('<text transform="translate(262 290) rotate(-30)"', '<text transform="translate(296 271) rotate(-30)"'),
        ("there&rsquo;s little room for a big lens.</p></div></li>\n          </ol>",
         "there&rsquo;s little room for a big lens.</p></div></li>\n            <li value=\"8\"><span class=\"n\">8</span><div><b>Crowd line, west of show centre</b><p>Along the crowd line towards the American Air Museum. From here you will be able to capture taxi shots of aircraft.</p></div></li>\n          </ol>"),
    ]
    for old, new in fixes:
        assert html.count(old) == 1, old
        html = html.replace(old, new, 1)

    # Jack, 22 Nov 2026: the photo at the top of Photography changed to a head on shot (his Hispano Buchón photo at Duxford).
    # then (later the same morning) smaller, and a different photo: the P-40 Warhawk taxiing out.
    m_new = re.search(r'data-pic="p40"[^>]*?src="(@@BLOB\d+@@)"', html) or re.search(r'src="(@@BLOB\d+@@)"[^>]*?data-pic="p40"', html)
    m_old = re.search(r'<img[^>]*data-pic="buchon_pan"[^>]*src="(@@BLOB\d+@@)"[^>]*alt="A Hispano Buch[^"]*panned with the background blurred"><figcaption>A slow shutter speed and a smooth pan give a blurred background and a full prop disc.</figcaption>', html)
    assert m_new and m_old, "photo swap: pattern not found"
    seg = m_old.group(0)
    seg2 = seg.replace(m_old.group(1), m_new.group(1)).replace('data-pic="buchon_pan"', 'data-pic="p40" data-dup="1"')
    seg2 = re.sub(r'alt="A Hispano Buch[^"]*panned with the background blurred"', 'alt="A Curtiss P-40 Warhawk with a shark mouth taxiing out at Duxford"', seg2)
    seg2 = seg2.replace('<figcaption>A slow shutter speed and a smooth pan give a blurred background and a full prop disc.</figcaption>', '<figcaption>A Curtiss P-40 Warhawk with a shark mouth taxiing out at Duxford.</figcaption>')
    html = html.replace(seg, seg2, 1)

    # Jack, 22 Nov 2026: the opening line of the overview did not read right. Name the two big shows plainly.
    old = "Duxford runs two Big two day Air Shows, the Summer Air Show in June and the Battle of Britain Air Show in September. These are the busy ones."
    new = "Duxford has two big air shows each year, and each one runs over two days. They are the Duxford Summer Air Show in June and the Duxford Battle of Britain Air Show in September. These are the busy ones."
    assert old in html
    html = html.replace(old, new, 1)

    # Jack, 22 Nov 2026: the panned Buchón in Get creative was not clear, and then not the formation photo either. Use the Spitfire cockpit close up.
    old = '<img data-k="buchon_pan" alt="" decoding="async"></span><figcaption>A Hispano Buch&oacute;n taking off, panned</figcaption>'
    new = '<img data-k="spitfire" alt="" decoding="async"></span><figcaption>A close up of a Spitfire cockpit and canopy beside a hangar</figcaption>'
    assert old in html
    html = html.replace(old, new, 1)

    # head: fonts, and keep the preview out of search results
    html = html.replace("</head>", FONT_LINK + "\n</head>", 1)
    html = html.replace('<meta name="viewport"', '<!-- New design. Built by previews/duxford-new-design-src/build.py from live-source.html. Edit the source files, then rebuild. -->\n<meta name="viewport"', 1)

    # Some of the page's scripts work out which show they are on from the file name (duxford.html).
    # This preview has a different name, so tell them the live page's path.
    n = html.count("location.pathname")
    html = html.replace("location.pathname", "(window.NZ_PATH||location.pathname)")
    html = html.replace("<head>", '<head>\n<script>window.NZ_PATH="/airshow-pages/camping-layout/duxford.html";</script>', 1)
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
    # Extra photos of Jack's that the live page does not have (Jack, 22 Nov 2026), kept hidden and used by new-design.js.
    # spot4-spitfire: Spitfire PT462 low over Duxford, for spot 4 on the photographers' map.
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
