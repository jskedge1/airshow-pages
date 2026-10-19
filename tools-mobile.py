"""Phone and tablet comfort fixes for the pages shown on Wix.

Adds (or replaces) one <style id="mobile-comfort"> block just before the page's
real </head>. Desktop is untouched: every rule sits inside a phone or tablet
media query, apart from the sideways overflow guard.

Usage: python3 tools-mobile.py [files...]   (no files = every live page)
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).parent

# every page: no sideways scrolling, and form fields big enough to tap without
# iPhone zooming in on them
COMMON = """
html,body{overflow-x:clip}
@media (max-width:760px){
  input:not([type=checkbox]):not([type=radio]):not([type=range]),select,textarea{font-size:16px!important}
  select,input[type=search],input[type=text],input[type=email],input[type=number]{min-height:44px}
}
"""

# tablets: Wix Classic shows the 980px desktop page shrunk to the screen, so on a
# touch screen wider than a phone the small labels and controls get a lift
TAB = "@media (hover:none) and (pointer:coarse) and (min-width:761px){\n  %s\n}\n"
TAB_COMMON = TAB % "select{min-height:44px}\n  .flinks a{display:inline-flex;align-items:center;min-height:44px}"

SHOW_TAP = """.cg-cal button,.cg-cal a,.lu-filters button,.lu-jump a,.pl-chips button,.sf-demo-btns button,.pp-opts button,.gal-nav button,.sg-play,.fbar-group .clear,.rwhat-foot .more-link,.r-links a,.mo-t a{min-height:44px}
  .cg-cal a,.rwhat-foot .more-link,.r-links a{display:inline-flex;align-items:center;justify-content:center}
  #cgShow,#nfSort{min-height:44px}"""

SHOW = """
@media (max-width:760px){
  """ + SHOW_TAP + """
  .mapbar a,.wrap>a.home,.wrap>a:first-child{display:inline-flex;align-items:center;min-height:40px}
  .lu-note,.lu-small,.lu-code,small,.pl-sum span,.pl-copied,.pl-foot,.wx-note,.sg-best .l,.sg-legend span,.sg-key div,.sg-foot,.calc-limits,.mo-t figcaption,.wn-tag{font-size:14px}
  .sg-cell .s{font-size:13px}
}
@media (hover:none) and (pointer:coarse){
  """ + SHOW_TAP + """
}
"""

HOME = """
.fc{overflow:hidden}
@media (max-width:900px){
  .todlbl{top:16px;bottom:auto}
}
@media (max-width:760px){
  .dots button{height:24px;background:transparent}
  .dots button::before{content:"";position:absolute;left:0;right:0;top:10px;height:4px;background:rgba(255,255,255,.35)}
  .dots button.on::after{top:10px;bottom:auto;height:4px}
  .btable .brow{min-width:0;grid-template-columns:62px minmax(0,1fr) auto;column-gap:10px;row-gap:3px;padding:12px 14px}
  .btable .brow.th{display:none}
  .btable .brow .fl{white-space:normal;overflow:visible;text-overflow:clip}
  .btable .brow>:nth-child(1){font-size:16px;line-height:1.1}
  .btable .brow>:nth-child(2){font-size:17px;line-height:1.15}
  .btable .brow>:nth-child(3){grid-column:2;grid-row:2;font-size:14px}
  .btable .bst{font-size:13px;padding:5px 7px}
  .btable .brow>:nth-child(4){grid-column:3;grid-row:1/span 2;align-self:center}
  .cd{margin-left:0}
  .season::before{content:"Swipe sideways to see the whole season \\2192";display:block;font-size:15px;font-weight:600;color:var(--navy);margin-bottom:12px}
  .gscale span:nth-child(even){display:none}
  .ftag{font-size:14px}
}
"""

CALENDAR = ""  # the calendar is fixed in its own source

NEWS = """
@media (max-width:760px){
  .filters .chip,.item .go{min-height:44px}
  .crumb a,.lead-foot .more,.wrap>.back{display:inline-flex;align-items:center;min-height:44px}
  .when{white-space:normal;max-width:100%;flex-wrap:wrap}
}
@media (hover:none) and (pointer:coarse){
  .filters .chip,.item .go{min-height:44px}
}
"""

MAP = """
@media (max-width:760px){
  .nlegend .lg,.nlegend .lyr,.ndist .dch,.rb{min-height:44px}
  .ftag{font-size:14px}
}
@media (hover:none) and (pointer:coarse){
  .nlegend .lg,.nlegend .lyr,.ndist .dch,.rb{min-height:44px}
}
"""

FIND = """
@media (max-width:760px){
  .pacts .save,.pacts .linkbtn,.mode .mbtn,.sky .soundbtn{min-height:44px}
  .tag,.cdl,small{font-size:14px}
}
@media (hover:none) and (pointer:coarse){
  .pacts .save,.pacts .linkbtn,.mode .mbtn,.sky .soundbtn{min-height:44px}
}
"""

HUBS = """
@media (max-width:760px){
  .flinks a{display:inline-flex;align-items:center;min-height:44px}
}
"""

TAB_HOME = TAB % ".ftag{font-size:14px}\n  .lg{min-height:44px}"
TAB_MAP = TAB % ".ftag{font-size:14px}"
TAB_FIND = TAB % ".tag,.bname,.cdl,.ringlbl{font-size:14px}\n  small{font-size:14px!important}\n  .blip::after{content:\"\";position:absolute;inset:-7px}"

PAGES = {
    'home.html': COMMON + HOME + TAB_COMMON + TAB_HOME,
    'uk-airshow-calendar.html': COMMON,
    'airshow-news.html': COMMON + NEWS,
    'airshow-map.html': COMMON + MAP + TAB_COMMON + TAB_MAP,
    'find-your-airshow.html': COMMON + FIND + TAB_COMMON + TAB_FIND,
    'camping-hub.html': COMMON + HUBS + TAB_COMMON,
    'photography-hub.html': COMMON + HUBS + TAB_COMMON,
    'my-airshow-hub.html': COMMON,
    'new-to-aviation-photography.html': COMMON,
}
for f in sorted((ROOT / 'camping-layout').glob('*.html')):
    PAGES['camping-layout/' + f.name] = COMMON + SHOW

VIEWPORT = '<meta name="viewport" content="width=device-width, initial-scale=1">'


def head_end(h):
    """Index of the page's own </head>, never one written inside a script string."""
    body = h.find('<body')
    i = h.find('</head>')
    s0 = h.find('<script')
    if i >= 0 and (body < 0 or i < body) and (s0 < 0 or i < s0):
        return i
    # pages written without <head>: after the first stylesheet, before any script
    s = h.find('<script')
    j = h.find('</style>')
    if j < 0 or (s >= 0 and j > s):
        raise ValueError('nowhere safe to add styles')
    return j + len('</style>')


def apply(path, css):
    p = ROOT / path
    h = p.read_text(encoding='utf8')
    h = re.sub(r'\n?<style id="mobile-comfort">[\s\S]*?</style>\n?', '\n', h)
    if 'name="viewport"' not in h[:head_end(h)]:
        i = h.find('<meta charset')
        j = h.find('>', i) + 1 if i >= 0 else (h.find('<head>') + 6 if '<head>' in h else 0)
        h = h[:j] + '\n' + VIEWPORT + h[j:]
    i = head_end(h)
    h = h[:i] + '\n<style id="mobile-comfort">' + css.strip() + '\n</style>\n' + h[i:]
    p.write_text(h, encoding='utf8')
    return path


if __name__ == '__main__':
    targets = sys.argv[1:] or list(PAGES)
    for t in targets:
        print(apply(t, PAGES[t]))
