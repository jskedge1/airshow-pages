"""Gives every feature page the same Getting there section as Clacton (Jack, 22 Nov 2026).

Clacton's parts, top to bottom: heading and intro, Key places board, Coming by train banner, plan note,
numbered step tabs (Ways in, Fares, On the day and getting home, Questions), Compare driving options
(#cdo), Car parks (#cpk), the Choose a topic explorer (#explore, with the Ways in screen and the train
route hero in the main train topic), Fares (#tpFares), the On the day and Getting home boxes (.pbx)
and Questions (.acc). The step tabs, banner, key places and explorer look are drawn by scripts the pages
already share (transport-pier-js, railban-js, explore-designs-js and the rest).

Markup, styles and scripts come from Clacton and live in getting-there-src/parts/. Each show's own words
and figures live in getting-there-src/shows/<show>/ (plan.json, fares.html, pbx.html, trl.json,
nss.json, and cdo.html / cpk.html where the page had none). Sources for every figure are in
getting-there-src/shows/<show>/sources.md and PARKING-FIGURES.md.

Run: python3 tools-getting-there.py [show ...]   (no names = all). Safe to run again: it replaces what
it added before (marked with <!-- gt:... --> comments).
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'getting-there-src')
PAGES = ['cosford', 'midlands', 'eastbourne', 'wales', 'duxford', 'shuttleworth', 'gransden',
         'headcorn', 'southport', 'blackpool', 'ayr']


def part(name):
    return open(os.path.join(SRC, 'parts', name), encoding='utf8').read()


def show_file(show, name):
    p = os.path.join(SRC, 'shows', show, name)
    return open(p, encoding='utf8').read() if os.path.exists(p) else None


def block(page, tag, key):
    """(start, end) of <tag id="key">...</tag>."""
    m = re.search(r'<%s id="%s">.*?</%s>' % (tag, re.escape(key), tag), page, re.S)
    return (m.start(), m.end()) if m else None


def put_block(page, tag, key, body):
    """Swap the body of <tag id="key"> for the shared version."""
    se = block(page, tag, key)
    assert se, key
    return page[:se[0]] + '<%s id="%s">%s</%s>' % (tag, key, body, tag) + page[se[1]:]


def marked(name, html):
    return '<!-- gt:%s -->\n%s\n<!-- /gt:%s -->' % (name, html.strip('\n'), name)


def drop_marked(page, name):
    return re.sub(r'\n<!-- gt:%s -->.*?<!-- /gt:%s -->\n' % (name, name), '', page, flags=re.S)


def insert(text, j, name, html):
    """Put a marked block at j; drop_marked takes exactly this back out."""
    return text[:j] + '\n' + marked(name, html) + '\n' + text[j:]


def travel_span(page):
    a = page.index('id="travel"')
    a = page.rindex('<section', 0, a)
    b = page.index('<div style="height:88px"></div>\n</section>', a)
    return a, b


SHARED = json.load(open(os.path.join(SRC, 'parts', 'shared-blocks.json'), encoding='utf8'))


def build(show):
    path = os.path.join(ROOT, 'camping-layout', show + '.html')
    page = open(path, encoding='utf8').read()
    before = page

    # 1. shared add-ons: the same version on every page
    for key, (tag, body) in SHARED.items():
        page = put_block(page, tag, key, body)

    # 2. take out what an earlier run added
    for n in ('pbx', 'nss', 'cdo', 'cpk', 'trl'):
        page = drop_marked(page, n)

    a, b = travel_span(page)
    tr = page[a:b]

    # 3. plan note, in Clacton's form
    plan = json.loads(show_file(show, 'plan.json'))
    tr, n = re.subn(r'<div class="notice gt-status"><div class="wrap"><span class="tag">[^<]*</span><span>.*?</span></div></div>',
                    lambda m: '<div class="notice gt-status"><div class="wrap"><span class="tag">%s</span><span>%s</span></div></div>'
                    % (plan['tag'], plan['html']), tr, count=1, flags=re.S)
    assert n == 1, show + ' notice'

    # 4. How arrival works: after the Clacton parts, with the On the day boxes it belongs with
    arrive = re.search(r'\n  <section class="arrive".*?\n  </section>\n', tr, re.S)
    if arrive and arrive.start() > tr.index('<section class="explore"'):
        arrive = None  # moved on an earlier run
    if arrive:
        tr = tr[:arrive.start()] + '\n' + tr[arrive.end():]

    # 5. On the day and Getting home boxes, the Ways in screen and Fares: same place as on Clacton
    nss = json.loads(show_file(show, 'nss.json'))
    ways = part('nss-ways.html')
    plane = re.search(r'<svg viewBox="0 0 24 24" aria-hidden="true">.*?</svg>', ways).group(0)
    days = ''.join('<div class="nss-day">%s%s%s</div>\n' % (d, plane, dt) for d, dt in nss['days'])
    ways = re.sub(r'(<div class="nss-days">\n).*?(<div class="nss-clock">)', lambda m: m.group(1) + days + m.group(2), ways, flags=re.S)
    ways = ways.replace('<small>2027 show days</small>', '<small>%s</small>' % nss['clock'])
    name = nss.get('name') or re.search(r'<div class="pbx-band"><b>(.*?)</b>', show_file(show, 'pbx.html')).group(1)
    ways = ways.replace('<small>Clacton Airshow, ', '<small>%s, ' % name)
    pbx = part('pbx-style.html') + show_file(show, 'pbx.html').strip() + '\n' + part('pbx-script.html')
    nssb = part('nss-style.html') + ways + show_file(show, 'fares.html').strip() + '\n' + part('nss-script.html')
    i = tr.index('<div class="notice gt-status">')
    i = tr.index('\n', i) + 1
    tr = insert(tr, i, 'nss', nssb)
    tr = insert(tr, i, 'pbx', pbx)

    # 6. Compare driving options and car parks, where the page had none
    cdo = show_file(show, 'cdo.html')
    if cdo and 'id="cdo"' not in tr:
        html = ('<div class="wrap"><section class="cdo reveal" id="cdo" aria-labelledby="cdoTitle">\n' + part('cdo-style.html') + '\n'
                + cdo.strip() + '\n' + part('cdo-script.html') + '\n</section></div>')
        j = tr.index('<div class="wrap"><section class="cpk') if 'id="cpk"' in tr else tr.index('<section class="explore"')
        tr = insert(tr, j, 'cdo', html)
    cpk = show_file(show, 'cpk.html')
    if cpk and 'id="cpk"' not in tr:
        html = ('<div class="wrap"><section class="cpk reveal" id="cpk" aria-labelledby="cpkTitle">\n' + part('cpk-style.html') + '\n'
                + cpk.strip() + '\n</section></div>')
        j = tr.index('<section class="explore"')
        tr = insert(tr, j, 'cpk', html)

    # 7. explorer in Clacton's markup: the heading and intro sit at the top of the side column
    head = re.search(r'<section class="explore" id="explore"([^>]*)>\s*<div class="wrap">\s*<div class="explore-head reveal">\s*<h2>[^<]*</h2>\s*(<p>.*?</p>)\s*</div>\s*<div class="explore-grid">\s*<aside class="explore-side">', tr, re.S)
    if head:
        tr = (tr[:head.start()] + '<section class="explore" id="explore"%s>\n    <div class="wrap explore-grid">\n      <aside class="explore-side">\n        <h2>Choose a topic</h2>\n        %s'
              % (head.group(1), head.group(2)) + tr[head.end():])
        k = tr.index('</section>', tr.index('id="explore"'))
        # one wrapper fewer: drop the extra closing div before </section>
        seg = tr[:k]
        cut = seg.rstrip().rfind('</div>')
        tr = seg[:cut] + seg[cut + 6:].lstrip('\n') + tr[k:]
    if arrive:
        j = tr.index('</section>', tr.index('id="explore"')) + len('</section>')
        tr = tr[:j] + '\n\n' + arrive.group(0).strip('\n') + '\n' + tr[j:]

    page = page[:a] + tr + page[b:]

    # 8. train route hero (and live times) for the page's main train topic, as on Clacton
    trl = json.loads(show_file(show, 'trl.json'))
    tid = trl['topic']
    js = part('trlScript.html')
    js = re.sub(r"var HERO='.*?';\n", lambda m: 'var HERO=' + json.dumps(trl['hero'], ensure_ascii=False) + ';\n', js, flags=re.S)
    js = js.replace("b.dataset.id==='rail'", 'b.dataset.id===%s' % json.dumps(tid))
    own = drop_marked(page, 'trl')
    if 'id="trlStyle"' in own and '<script id="trlScript' in own:
        blocks = ''  # the page already has its own train route heroes in this design (Duxford)
    else:
        blocks = part('trlStyle.html') + '\n' + js
    if trl.get('live'):
        lj = part('ttLiveScript.html')
        q = ','.join("{crs:'%s',want:/%s/i,op:'%s'}" % (x['crs'], x['want'], x['op']) for x in trl['live'])
        lj = re.sub(r"var Q=\[.*?\];", 'var Q=[%s];' % q, lj, flags=re.S)
        lj = lj.replace("s.operatorCode==='LE'", 's.operatorCode===q.op')
        lj = lj.replace('var q=Q[i],c=cache[q.crs];', 'var q=Q[i];if(!q)return;var c=cache[q.crs];')
        lj = lj.replace("rail.dataset.id!=='rail'", 'rail.dataset.id!==%s' % json.dumps(tid))
        lj = re.sub(r'/\* Live Greater Anglia times.*?\*/', '/* Live times for the train boards, from the public National Rail live departure boards. Only trains already on the live boards get a badge. */', lj, flags=re.S)
        blocks += ('\n' if blocks else '') + part('ttLiveStyle.html') + '\n' + lj
    j = page.index('</script>', page.index('<script id="topic-fastrans-js">')) + len('</script>')
    if blocks:
        page = insert(page, j, 'trl', blocks)

    if page != before:
        open(path, 'w', encoding='utf8').write(page)
        print('updated', show)


def shared_only(show):
    path = os.path.join(ROOT, 'camping-layout', show + '.html')
    page = before = open(path, encoding='utf8').read()
    for key, (tag, body) in SHARED.items():
        page = put_block(page, tag, key, body)
    if page != before:
        open(path, 'w', encoding='utf8').write(page)
        print('updated', show, '(shared add-ons only)')


if __name__ == '__main__':
    for s in (sys.argv[1:] or PAGES + ['clacton']):
        shared_only(s) if s == 'clacton' else build(s)
