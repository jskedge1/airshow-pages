"""Adds the Station guide box (the pier sign design saved on 9 Nov 2026) to the train route pages,
right after "Your station for the show". Each page gets its own station from station-guide.json:
the station name board, the train company's own train (copied from the page's platform scene),
the station card, the walk card, facilities and the buttons.
Run: python3 tools-station-guide.py            (every page listed in station-guide.json)
     python3 tools-station-guide.py clacton    (one page)
build.py runs it too, so a rebuilt page keeps the box."""
import html, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
A, B = '<!-- station-guide -->', '<!-- /station-guide -->'

ICONS = {
    'step': 'M12 4h.01 M9 8h6 M12 8v5h4l2 5 M9 13a5 5 0 1 0 6 6',
    'ticket': 'M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2z M10 6v12',
    'car': 'M5 16V11l2-5h10l2 5v5 M3 16h18v3H3z M7 19v2 M17 19v2 M8 13h.01 M16 13h.01',
    'bike': 'M6 17a3 3 0 1 0 0-.01z M18 17a3 3 0 1 0 0-.01z M6 17l4-8h6l2 8 M10 9l4 8 M14 6h3',
    'staff': 'M12 4a3 3 0 1 0 0 6a3 3 0 1 0 0-6z M5 20c1-4 4-6 7-6s6 2 7 6',
    'loo': 'M7 4h.01 M17 4h.01 M5 8h4l-1 6v6 M15 8h4l1 6h-2v6',
}

CSS = """<style id="sgStyle">
.sg{background:#E4E8EB;margin-top:6px}
.sg-top{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#13293C;padding:14px 28px;flex-wrap:wrap}
.sg-top span{font-weight:700;font-size:18px;color:#fff}.sg-top em{font-style:normal;font-weight:700;font-size:16px;color:#44AED6}
.sg-red{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#D74949;padding:12px 28px;flex-wrap:wrap}
.sg-red h2{margin:0;font-weight:700;font-size:32px;line-height:1.1;color:#fff;letter-spacing:0;text-transform:none}
.sg-red span{font-size:24px;color:#fff}
.sg-plat{background:#23272B;position:relative;overflow:hidden;padding-top:64px}
.sg-board{position:absolute;right:28px;top:16px;background:#fff;border:3px solid #0B1824;padding:5px 16px 0;font-family:Barlow;font-weight:700;font-size:26px;line-height:1.1;color:#0B1824;text-transform:uppercase;z-index:2}
.sg-board i{display:block;height:7px;background:#D74949;margin:4px -16px 0}
.sg-tag{position:absolute;left:20px;top:20px;background:#D74949;color:#fff;font-weight:700;font-size:14px;padding:5px 12px;z-index:2}
.sg-train{width:42%;max-width:470px;margin-left:auto;margin-right:6%;transform:translateX(-80%);opacity:0;transition:transform 3s cubic-bezier(.15,.75,.25,1),opacity .6s ease}
.sg.in .sg-train{transform:none;opacity:1}
.sg-train svg{display:block;width:100%;height:auto}
.sg-yl{height:8px;background:#F2C500}.sg-pf{height:22px;background:#B9BEC3}
.sg-body{padding:28px;display:flex;flex-direction:column;gap:20px}
.sg-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.sg-card{background:#fff;padding:20px 22px;display:flex;flex-direction:column;gap:10px;transition:transform .25s ease,box-shadow .25s ease}
.sg-card:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(19,41,60,.14)}
.sg-card h3{margin:0;font-weight:700;font-size:24px;line-height:1.15;color:#000;text-transform:none;letter-spacing:0}
.sg-card p{margin:0;font-size:16px;line-height:1.5;color:#1C2B38}
.sg-rows{border-top:2px solid #13293C}
.sg-rows div{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #D5DBE0;font-size:15px}
.sg-rows span{color:#1C2B38}.sg-rows b{color:#13293C;text-align:right}
.sg-fb{display:flex;align-items:stretch;background:#0B1824}
.sg-fb>i{width:60px;flex:none;background:#44AED6;display:flex;align-items:center;justify-content:center}
.sg-fb>div{flex:1;display:flex;align-items:center;gap:20px;padding:10px 20px;flex-wrap:wrap}
.sg-fb b{font-weight:700;font-size:30px;color:#fff}.sg-fb span{font-weight:500;font-size:15px;line-height:1.4;color:#DCE6EE}
.sg-fac{background:#fff;padding:16px 22px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 18px;font-size:15px;line-height:1.35;color:#13293C}
.sg-fac span{display:flex;align-items:center;gap:10px}.sg-fac svg{flex:none}
.sg-fac .no{color:#9A2F2F}.sg-fac .no svg{stroke:#9A2F2F}
.sg-go{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.sg-go a{text-decoration:none;display:flex;align-items:stretch;background:#13293C;border-bottom:4px solid #32B4AF;box-shadow:0 4px 14px rgba(19,41,60,.2);min-height:62px;transition:transform .25s ease}
.sg-go a:hover{transform:translateX(4px)}
.sg-go a>i{width:54px;flex:none;background:#32B4AF;display:flex;align-items:center;justify-content:center}
.sg-go a>span{flex:1;display:flex;flex-direction:column;justify-content:center;padding:8px 16px}
.sg-go b{font-weight:700;font-size:17px;color:#fff}.sg-go small{font-size:14px;color:#B9CAD8}
.sg-go a>em{width:48px;flex:none;border-left:1px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:#fff;font-style:normal;font-size:22px}
@media (max-width:760px){.sg-cards,.sg-go{grid-template-columns:minmax(0,1fr)}.sg-fac{grid-template-columns:repeat(2,minmax(0,1fr))}
.sg-top,.sg-red,.sg-body{padding-left:16px;padding-right:16px}.sg-red h2{font-size:26px}.sg-red span{font-size:19px}
.sg-board{font-size:19px;right:14px}.sg-tag{left:12px;font-size:13px}.sg-plat{padding-top:76px}.sg-train{width:80%;margin-right:4%}}
@media (max-width:440px){.sg-fac{grid-template-columns:minmax(0,1fr)}}
@media (prefers-reduced-motion:reduce){.sg-train{transition:none;transform:none;opacity:1}.sg-card,.sg-go a{transition:none}}
</style>"""

JS = """<script id="sgScript">
(function(){
  var box = document.getElementById('sg'); if (!box) return;
  var src = document.getElementById('ysnose'), dst = document.getElementById('sgnose'), svg = dst && dst.parentNode;
  function copy(){
    if (!src || !dst || !src.childNodes.length) return;
    dst.innerHTML = src.innerHTML;
    try { var bb = src.getBBox(); if (bb.width) svg.setAttribute('viewBox', [bb.x - 4, bb.y - 4, bb.width + 8, bb.height + 6].join(' ')); } catch (e) {}
  }
  if (src) { new MutationObserver(copy).observe(src, { childList: true, subtree: true }); copy(); }
  var go = function(){ box.classList.add('in'); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { go(); io.disconnect(); } }); }, { threshold: .25 });
    io.observe(box);
  } else go();
})();
</script>"""


def icon(name, colour='#13293C', size=20):
    return ('<svg width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="2.2" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="%s"/></svg>') % (size, size, colour, ICONS[name])


def section(s):
    e = html.escape
    rows = ''.join('<div><span>%s</span><b>%s</b></div>' % (e(a), e(b)) for a, b in s['rows'])
    fac = ''.join('<span%s>%s%s</span>' % (' class="no"' if f.get('no') else '', icon(f['icon']), e(f['text'])) for f in s['facilities'])
    return (A + '\n<section class="s" id="station-guide"><div class="wrap">\n'
        '<div class="sg rise" id="sg">'
        '<div class="sg-top"><span>%(show)s</span><em>by The Big Guide to UK Airshows</em></div>'
        '<div class="sg-red"><h2>Station guide</h2><span>%(name)s</span></div>'
        # platform picture removed 10 Nov 2026 (Jack's comment)
        '<div class="sg-body">'
        '<div class="sg-cards">'
        '<div class="sg-card"><h3>%(name)s</h3><p>%(lead)s</p><div class="sg-rows">%(rows)s</div></div>'
        '<div class="sg-card"><h3>%(walkh)s</h3><p>%(walk)s</p><p>%(back)s</p></div>'
        '</div>'
        '<div class="sg-fb"><i>%(ficon)s</i><div><b>Facilities</b><span>%(fnote)s</span></div></div>'
        '<div class="sg-fac">%(fac)s</div>'
        '<div class="sg-go">'
        '<a href="#times"><i>%(tricon)s</i><span><b>Pick your train</b><small>%(op)s</small></span><em>&#8594;</em></a>'
        '<a href="%(nr)s" target="_blank" rel="noopener"><i>%(sticon)s</i><span><b>Full station details</b><small>Opening times, lifts and toilets</small></span><em>&#8594;</em></a>'
        '</div></div></div>\n</div></section>\n' + B) % dict(
            show=e(s['show']), name=e(s['name']), board=e(s['board']), tag=e(s['tag']), lead=e(s['lead']), rows=rows,
            walkh=e(s['walkHead']), walk=e(s['walk']), back=e(s['back']), fac=fac, fnote=e(s['facNote']), op=e(s['operator']),
            nr=e(s['nr']), ficon=icon('ticket', '#13293C', 26), tricon=icon('ticket', '#FFFFFF', 22), sticon=icon('step', '#FFFFFF', 22))


def add(page, show, guides=None):
    guides = guides or json.load(open(os.path.join(HERE, 'train-routes-src', 'station-guide.json')))
    if show not in guides or '<section class="s" id="stop">' not in page:
        return page
    if A in page:
        i, k = page.index(A), page.index(B) + len(B)
        page = page[:i].rstrip('\n') + page[k:]
    for tag in ('sgStyle', 'sgScript'):
        mark = '<%s id="%s">' % ('style' if tag == 'sgStyle' else 'script', tag)
        if mark in page:
            end = '</style>' if tag == 'sgStyle' else '</script>'
            i = page.index(mark)
            k = page.index(end, i) + len(end)
            page = page[:i] + page[k + 1 if page[k:k + 1] == '\n' else k:]
    i = page.index('<section class="s" id="stop">')
    j = page.index('</section>', i) + len('</section>')
    page = page[:j] + '\n\n' + section(guides[show]) + page[j:]
    page = page.replace('</head>', CSS + '\n</head>', 1)
    k = page.rindex('</body>')
    page = page[:k] + JS + '\n' + page[k:]
    nav = '<a href="#stop">Your station</a>'
    if nav in page and 'href="#station-guide"' not in page:
        page = page.replace(nav, nav + '\n    <a href="#station-guide">Station guide</a>', 1)
    return page


if __name__ == '__main__':
    guides = json.load(open(os.path.join(HERE, 'train-routes-src', 'station-guide.json')))
    for show in sys.argv[1:] or sorted(guides):
        f = os.path.join(HERE, 'train-routes', show + '.html')
        if not os.path.exists(f):
            continue
        p = open(f).read()
        q = add(p, show, guides)
        if q != p:
            open(f, 'w').write(q)
            print('station guide added to train-routes/' + show + '.html')
