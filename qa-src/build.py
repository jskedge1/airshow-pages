"""Builds questions-and-answers.html from questions.py.

Run from this folder:  python3 build.py
The page keeps the site's usual parts: SEO block, links.js and the mobile-fit block
(copied from airshow-security.html so it always matches the other pages).
"""
import html
import json
import re
from pathlib import Path

from questions import GROUPS, POPULAR

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://www.ukairshowguide.co.uk'
WIX_PATH = '/airshow-questions'
TITLE = 'Airshow Questions and Answers | The Big Guide to UK Airshows'
DESC = ('Straight answers to the questions people ask before a UK airshow: tickets, arriving, parking, '
        'children, ear defenders, bags, dogs, food, weather, photography and camping.')

ICONS = {
    'ticket': '<path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z"/><path d="M14 4v12" stroke-dasharray="2 2"/>',
    'car': '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="13" r="1"/><circle cx="16.5" cy="13" r="1"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'family': '<circle cx="8" cy="6" r="2.5"/><circle cx="16.5" cy="9" r="2"/><path d="M4 20v-6a4 4 0 0 1 8 0v6M13.5 20v-4a3 3 0 0 1 6 0v4"/>',
    'access': '<circle cx="11" cy="4.5" r="2"/><path d="M11 8v6h6l2 5"/><path d="M8 11a6 6 0 1 0 7.5 8"/>',
    'shield': '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    'cup': '<path d="M5 8h12v5a6 6 0 0 1-12 0z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M8 3v2M11 3v2M14 3v2"/>',
    'cloud': '<path d="M7 17a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.5 1.5A3.3 3.3 0 0 1 17 17z"/><path d="M8 20l1-2M12 21l1-2M16 20l1-2"/>',
    'camera': '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    'tent': '<path d="M12 4L3 20h18z"/><path d="M12 4v16M9 20l3-6 3 6"/>',
    'jet': '<path d="M12 2l1.6 6.5L21 13v2l-7.4-2.2L13 19l2.5 2v1L12 21l-3.5 1v-1l2.5-2-.6-6.2L3 15v-2l7.4-4.5z"/>',
    'search': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
}


def icon(name, colour='#13293C', width='2'):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" '
            'stroke-linejoin="round" aria-hidden="true">%s</svg>' % (colour, width, ICONS[name]))


def e(s):
    return html.escape(s, quote=True)


def check_copy():
    """Stop the build if any copy breaks the site's writing rules."""
    bad = []
    banned = ['delve', 'tapestry', 'realm', 'harness', 'pivotal', 'multifaceted', 'robust', 'showcase',
              'fall back', 'our aim is simple', 'game changer', 'at the end of the day']
    def look(text, where):
        if re.search(r'[–—]|\w-\w| - ', text):
            bad.append('dash in %s: %s' % (where, text))
        for w in banned:
            if w in text.lower():
                bad.append('"%s" in %s' % (w, where))
    for g in GROUPS:
        for k in ('title', 'line', 'intro'):
            look(g[k], g['id'])
        for qid, q, ans, more in g['qs']:
            look(q, qid)
            for p in ans:
                look(p, qid)
    if bad:
        raise SystemExit('Copy needs fixing:\n  ' + '\n  '.join(bad))


def more_link(more):
    if not more:
        return ''
    text, path = more
    return ('<a class="more" href="%s%s" target="_top"><span class="r">More</span> in %s <span class="r">›</span></a>'
            % (SITE, path, e(text)))


def group_html(g, first):
    n = len(g['qs'])
    src, alt, cap = g['photo']
    fig = ('<figure class="gphoto"><img src="%s" alt="%s" loading="lazy" draggable="false">%s</figure>'
           % (src, e(alt), ('<figcaption>%s</figcaption>' % e(cap)) if cap else ''))
    qs = []
    for qid, q, ans, more in g['qs']:
        body = ''.join('<p>%s</p>' % e(p) for p in ans) + more_link(more)
        qs.append(
            '<div class="q" id="q-%s" data-q="%s">'
            '<button class="q-h" aria-expanded="false" aria-controls="a-%s"><span class="qt q-title">%s</span>'
            '<span class="qx" aria-hidden="true"></span></button>'
            '<div class="q-b" id="a-%s" role="region"><div><div class="ans">%s</div></div></div></div>'
            % (qid, qid, qid, e(q), qid, body))
    guide_text, guide_path = g['guide']
    return '''
<section class="sec%(open)s" id="%(id)s">
  <button class="sec-h" aria-expanded="%(exp)s">
    <span class="ico">%(icon)s</span>
    <span class="t"><b>%(title)s</b><small>%(line)s</small></span>
    <span class="nq">%(n)d questions</span>
    <span class="pm">%(pm)s</span>
  </button>
  <div class="sec-b"><div><div class="wrap inner">
    <div class="qa-grid">
      <aside class="side">
        <h2>%(title_caps)s</h2>
        <p class="gintro">%(intro)s</p>
        %(fig)s
        <a class="guide-link" href="%(site)s%(gpath)s" target="_top"><small>Full guide</small><b>%(gtext)s</b><i aria-hidden="true">→</i></a>
      </aside>
      <div class="qs">%(qs)s</div>
    </div>
    <div class="sec-foot"><button class="dk" data-top>Back to the sections ↑</button><button data-close>Close this section</button></div>
  </div></div></div>
</section>''' % {
        'open': ' open' if first else '', 'exp': 'true' if first else 'false', 'id': g['id'],
        'icon': icon(g['icon']), 'title': e(g['title']), 'title_caps': e(g['title'].upper()),
        'line': e(g['line']), 'n': n, 'pm': '<i>−</i><em>Close</em>' if first else '<i>+</i><em>Open</em>',
        'intro': e(g['intro']), 'fig': fig, 'site': SITE, 'gpath': guide_path, 'gtext': e(guide_text),
        'qs': ''.join(qs)}


def build():
    check_copy()
    tpl = (Path(__file__).parent / 'template.html').read_text(encoding='utf-8')
    total = sum(len(g['qs']) for g in GROUPS)
    lookup = {qid: q for g in GROUPS for qid, q, a, m in g['qs']}
    popular = ''.join('<a href="#q-%s" data-q-go="%s"><span>%s</span><i aria-hidden="true">→</i></a>'
                      % (qid, qid, e(lookup[qid])) for qid in POPULAR)
    jump = ''.join('<a href="#%s" data-go="%s">%s<sup>%d</sup></a>' % (g['id'], g['id'], e(g['title']), len(g['qs']))
                   for g in GROUPS)
    faq = {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        'mainEntity': [{'@type': 'Question', 'name': q,
                        'acceptedAnswer': {'@type': 'Answer', 'text': ' '.join(a)}}
                       for g in GROUPS for qid, q, a, m in g['qs']],
    }
    seo = '''<!-- seo: matches the Wix page on ukairshowguide.co.uk -->
<meta name="description" content="%(d)s">
<link rel="canonical" href="%(u)s">
<meta property="og:url" content="%(u)s">
<meta property="og:title" content="%(t)s">
<meta property="og:description" content="%(d)s">
<meta property="og:site_name" content="The Big Guide to UK Airshows">
<meta property="og:type" content="website">
<meta property="og:image" content="https://static.wixstatic.com/media/a0546b_e9ac2e401b564c6083fb2a13997c3349~mv2.png">
<meta name="twitter:card" content="summary_large_image">
<!-- /seo -->''' % {'d': e(DESC), 'u': SITE + WIX_PATH, 't': e(TITLE)}
    sec = (ROOT / 'airshow-security.html').read_text(encoding='utf-8')
    mf = sec[sec.index('<!-- mobile-fit'):sec.index('<!-- /mobile-fit -->') + len('<!-- /mobile-fit -->')]
    out = (tpl.replace('{{TITLE}}', e(TITLE))
              .replace('{{SEO}}', seo)
              .replace('{{FAQ}}', json.dumps(faq, ensure_ascii=False).replace('</', '<\\/'))
              .replace('{{TOTAL}}', str(total))
              .replace('{{GROUPS_N}}', str(len(GROUPS)))
              .replace('{{POPULAR}}', popular)
              .replace('{{JUMP}}', jump)
              .replace('{{SEARCH_ICON}}', icon('search', '#13293C', '2.2'))
              .replace('{{SECTIONS}}', ''.join(group_html(g, i == 0) for i, g in enumerate(GROUPS)))
              .replace('{{MOBILE_FIT}}', mf))
    (ROOT / 'questions-and-answers.html').write_text(out, encoding='utf-8')
    print('questions-and-answers.html: %d questions in %d groups, %d KB' % (total, len(GROUPS), len(out) // 1024))


if __name__ == '__main__':
    build()
