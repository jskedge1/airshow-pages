#!/usr/bin/env python3
"""Show page extras (3 Nov 2026).

Brings every feature show page in camping-layout/ to the same set of sections, in the same order:
  - adds the sections written in extras-src/<show>.json (Pick your day, The ground show,
    Experience flights, Keep the show free) where the show doesn't already have one
  - adds Make a postcard to pages without one, using the page's own photos
  - adds the Good to know grid at the top of Food and facilities
  - adds the Last checked line under the key details
  - names the day sections "Pick your day" (Duxford and Shuttleworth: "Pick your show")
  - puts the sections and the tab bar in the standard order
  - loads show-extras.js, which styles and runs the new parts

Safe to run again: everything it adds is marked and replaced on the next run.
Usage: python3 tools-extras.py [show ...]   (no shows = all of them)
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SHOWS = ['ayr', 'blackpool', 'clacton', 'cosford', 'duxford', 'eastbourne', 'gransden', 'headcorn',
         'midlands', 'riat', 'shuttleworth', 'southport', 'wales']
GH = 'https://jskedge1.github.io/airshow-pages/'

# the standard order; show specific extras sit together after Pick your day
ORDER = ['overview', 'right', 'story', 'lineup', 'ready', 'travel', 'stay', 'days', 'weekend',
         'enclosures', 'parkview', 'museum', 'balloons', 'camping', 'exhibit', 'party',
         'timeline', 'help', 'ground', 'flightline', 'village', 'watch', 'seafront',
         'photo', 'kids', 'flights', 'support', 'postcard', 'facilities']

TABS = {'days': 'Pick Your Day', 'ground': 'The Ground Show', 'flights': 'Experience Flights',
        'support': 'Keep The Show Free', 'postcard': 'Make A Postcard'}
DESC = {'days': 'Which day suits you, and what happens on each one',
        'ground': 'Static aircraft, stalls and things to do on the ground',
        'flights': 'Fly yourself, on show day or another day',
        'support': 'Easy ways to give a little back and keep the show free',
        'postcard': 'Turn one of my photos into a postcard to share'}
MULTI_SHOW = {'duxford', 'shuttleworth'}

PLACE = {
    'ayr': ('Ayr', 'International Ayr Show 2027'), 'blackpool': ('Blackpool', 'Blackpool Air Show 2027'),
    'clacton': ('Clacton', 'Clacton Airshow 2027'), 'cosford': ('Cosford', 'RAF Cosford Air Show 2027'),
    'duxford': ('Duxford', 'Duxford Air Shows 2027'), 'eastbourne': ('Eastbourne', 'Airbourne 2027'),
    'gransden': ('Little Gransden', 'Little Gransden Air and Car Show 2027'),
    'headcorn': ('Headcorn', 'Headcorn Airshow 2027'), 'midlands': ('Ragley', 'Midlands Air Festival 2027'),
    'riat': ('RIAT', 'Royal International Air Tattoo 2027'), 'shuttleworth': ('Old Warden', 'Shuttleworth Air Shows 2027'),
    'southport': ('Southport', 'Southport Air Show 2027'), 'wales': ('Swansea Bay', 'Wales Airshow 2027'),
}
# photos for the postcard, from each page's own library
PC_PICS = {
    'ayr': ['bbmf', 'typhoon', 'p47', 'spitfire', 'pitts'],
    'blackpool': ['bbmf', 'typhoon', 'mig17', 'spitfire', 'wingwalkers', 'raven'],
    'clacton': ['redarrows', 'formation', 'dakota', 'spitfire', 'tracker', 'p40'],
    'cosford': ['typhoon', 'chinook', 'b17', 'rafale', 'c17', 'bbmf'],
    'eastbourne': ['formation', 'b17side', 'typhoon', 'spitfire', 'dakota', 'beachy'],
    'gransden': ['biplanes', 'hurricanes', 'invader', 'spitfire', 'spartan', 'cars_row'],
    'riat': ['f16dk', 'hornet', 'rafale', 'typhoon', 'c17', 'formation'],
    'southport': ['formation', 'typhoon', 'spitfire', 'dakota'],
    'wales': ['chinook', 'typhoon', 'wildcat', 'formation', 'spitfire', 'dakota'],
}


def esc(s):
    return html.escape(s, quote=True)


def title_case(s):
    return ' '.join(w[:1].upper() + w[1:] for w in s.split(' '))


def match_close(t, start, tag):
    """index just after the tag that closes the element opening at start"""
    pat = re.compile(r'<(/?)%s\b' % tag)
    depth = 0
    for m in pat.finditer(t, start):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return t.index('>', m.start()) + 1
    raise ValueError('no close for ' + tag)


def panels_of(t):
    out = []
    for m in re.finditer(r'<section class="panel[^"]*" id="([a-z0-9-]+)"', t):
        out.append((m.group(1), m.start(), match_close(t, m.start(), 'section')))
    # keep only top level panels
    top = []
    for p in out:
        if not top or p[1] >= top[-1][2]:
            top.append(p)
    return top


def panel(pid, inner, mark=True):
    return ('<section class="panel" id="%s" role="tabpanel" aria-labelledby="t-%s" hidden%s>\n'
            '  <div class="wrap">\n%s\n  </div>\n\n</section>') % (pid, pid, ' data-sx="1"' if mark else '', inner.strip())


def photo_lib(t):
    lib = {}
    m = re.search(r'window\.PHOTO=(\{.*?\});', t, re.S)
    if m:
        urls = json.loads(m.group(1))
        alts = {}
        a = re.search(r'window\.PHOTO_ALT=(\{.*?\});', t, re.S)
        if a:
            try:
                alts = json.loads(a.group(1))
            except ValueError:
                alts = {}
        for k, u in urls.items():
            lib[k] = (u, alts.get(k, ''))
    for m in re.finditer(r'<img[^>]*data-pic="([a-z0-9_]+)"[^>]*>', t):
        tag = m.group(0)
        src = re.search(r'src="([^"]+)"', tag)
        alt = re.search(r'alt="([^"]*)"', tag)
        if src and m.group(1) not in lib:
            lib[m.group(1)] = (src.group(1), alt.group(1) if alt else '')
    return lib


def postcard_html(show, t):
    place, event = PLACE[show]
    lib = photo_lib(t)
    btns = ''
    for k in PC_PICS.get(show, []):
        if k in lib:
            u, a = lib[k]
            btns += '<button type="button" aria-label="%s"><img src="%s" alt="%s" crossorigin="anonymous" loading="lazy" decoding="async"></button>' % (esc(a or k.replace('_', ' ')), esc(u), esc(a or k.replace('_', ' ')))
    return '''    <div class="panel-head reveal">
      <div><h2>Make A <span class="sky">Postcard</span></h2></div>
      <p>Been to %s, or counting down to your first visit? You can make your own postcard from one of my photos and share it with your friends and family. Just pick a photo and a style, add your name and a message, and it&rsquo;s ready to go.</p>
    </div>
    <div class="pc-grid">
      <div class="pc-ctl">
        <p class="pp-l">Pick a photo</p>
        <div class="pc-pics">%s</div>
        <p class="pp-l">Pick a style</p>
        <div class="pp-opts">
          <button type="button" class="on" data-pcs="glass">Glass panel</button>
          <button type="button" data-pcs="band">Navy band</button>
          <button type="button" data-pcs="stamp">Stamp</button>
        </div>
        <p class="pp-l">Make it yours</p>
        <div class="pc-in">
          <label>Your name<input type="text" class="pc-name" maxlength="30" placeholder="For example, Sam and the kids" autocomplete="off"></label>
          <label>Your message<input type="text" class="pc-text" maxlength="60" value="Wish you were here!" autocomplete="off"></label>
          <label>Which show<select class="pc-show"></select></label>
        </div>
      </div>
      <div class="pc-out">
        <canvas width="1500" height="1000" aria-label="Your postcard preview" role="img"></canvas>
        <div class="pc-act">
          <button type="button" class="pc-save">Save Postcard</button>
          <button type="button" class="alt pc-share">Share It</button>
        </div>
        <p class="pc-msg" aria-live="polite"></p>
      </div>
    </div>
    <div class="ns-note"><b>Share it with me</b>I&rsquo;d love to see your postcards. If you post one, tag The Big Guide to UK Airshows on Facebook or Instagram so I can see where it ends up.</div>''' % (esc(place), btns)


def gtk_html(data, short):
    rows = ''
    for g in data['gtk']:
        cls = {'yes': '', 'no': ' class="no"', 'check': ' class="check"'}.get(g.get('state', 'check'), ' class="check"')
        rows += '<article%s><h4>%s</h4><span class="sx-ans">%s</span><p>%s</p></article>' % (
            cls, esc(title_case(g['title'])), esc(g['ans']), g['text'])
    return ('<!-- sx-gtk --><h3 class="sx-gtk-h">Good To Know</h3>'
            '<p class="sx-gtk-p">The quick answers I get asked most about %s. I last checked these on %s, so I would still look at the show&rsquo;s own rules before you go.</p>'
            '<div class="sx-gtk">%s</div><!-- /sx-gtk -->') % (esc(short), esc(data['lastChecked']), rows)


def build(show):
    path = os.path.join(ROOT, 'camping-layout', show + '.html')
    t = open(path, encoding='utf-8').read()
    src = os.path.join(ROOT, 'extras-src', show + '.json')
    data = json.load(open(src, encoding='utf-8')) if os.path.exists(src) else None
    place, event = PLACE[show]
    log = []

    ps = panels_of(t)
    ids = [p[0] for p in ps]
    has = set(ids)

    # 1. the new sections
    new = {}
    if data:
        for key, sec in (data.get('sections') or {}).items():
            pid = key
            if key == 'days' and ('weekend' in has or ('days' in has and 'data-sx="1"' not in t[ps[ids.index('days')][1]:ps[ids.index('days')][2]])):
                log.append('days already there, kept')
                continue
            if key == 'ground' and ({'flightline', 'village'} & has):
                log.append('ground show already there, kept')
                continue
            if key in ('flights', 'support') and key in has and 'data-sx="1"' not in t[ps[ids.index(key)][1]:ps[ids.index(key)][2]]:
                log.append(key + ' already there, kept')
                continue
            new[pid] = panel(pid, sec['html'])
            log.append('added ' + pid)
    if 'postcard' not in has or 'data-sx-postcard' in t:
        new['postcard'] = panel('postcard', postcard_html(show, t)).replace('<section class="panel" id="postcard"', '<section class="panel" id="postcard" data-sx-postcard', 1)
        log.append('postcard')

    # 2. cut the panel block out, rebuild in order
    start, end = ps[0][1], ps[-1][2]
    blocks = {}
    for i, (pid, a, b) in enumerate(ps):
        gap = t[ps[i - 1][2]:a].strip() if i else ''
        if gap and not gap.startswith('<!--'):
            log.append('kept text before ' + pid)
        blocks[pid] = (gap + '\n' if gap else '') + t[a:b]
    blocks.update(new)

    # Good to know at the top of Food and facilities
    if data and data.get('gtk'):
        f = blocks['facilities']
        f = re.sub(r'<!-- sx-gtk -->.*?<!-- /sx-gtk -->', '', f, flags=re.S)
        h = f.index('<div class="panel-head')
        h = match_close(f, h, 'div')
        f = f[:h] + '\n    ' + gtk_html(data, event.replace(' 2027', '')) + '\n    ' + f[h:].lstrip()
        blocks['facilities'] = f
        log.append('good to know')

    # links to the planning guides that help on every show
    SITE = 'https://www.ukairshowguide.co.uk/'
    notes = {
        'timeline': ('<div class="ns-note"><b>The night before</b>I&rsquo;ve made a tick list for the evening before any airshow: tickets, travel, charging, the bag and the alarms. '
                     '<a href="%snight-before-an-airshow" target="_top">Open the night before checklist</a>, and you can print it or tick it off on your phone.</div>') % SITE,
        'help': ('<div class="ns-note"><b>More help</b>If the forecast looks grim, have a look at my <a href="%sairshow-rainy-day-plan" target="_top">rainy day plan</a>. '
                 'If you or someone in your group finds noise and crowds hard, my <a href="%scalm-airshow-visit" target="_top">calm visit guide</a> may help. '
                 'And for the end of the day, there&rsquo;s <a href="%sgetting-home-from-an-airshow" target="_top">getting home from an airshow</a>.</div>') % (SITE, SITE, SITE),
    }
    for pid, note in notes.items():
        if pid in blocks:
            f = re.sub(r'\n?\s*<!-- sx-nb -->.*?<!-- /sx-nb -->', '', blocks[pid], flags=re.S)
            h = match_close(f, f.index('<div class="panel-head'), 'div')
            blocks[pid] = f[:h] + '\n    <!-- sx-nb -->' + note + '<!-- /sx-nb -->' + f[h:]

    # one name for the day sections
    day_name = 'Pick Your Show' if show in MULTI_SHOW else 'Pick Your Day'
    for pid in ('days', 'weekend'):
        if pid in blocks:
            word = 'Show' if show in MULTI_SHOW else 'Day'
            blocks[pid] = re.sub(r'<h2>.*?</h2>', '<h2>Pick Your <span class="sky">%s</span></h2>' % word, blocks[pid], count=1, flags=re.S)

    def rank(pid):
        return ORDER.index(pid) if pid in ORDER else ORDER.index('facilities') - 0.5
    order = sorted(blocks, key=lambda p: (rank(p), (ids.index(p) if p in ids else 99)))
    t = t[:start] + '\n\n'.join(blocks[p].rstrip() for p in order) + '\n' + t[end:]

    # 3. the tab bar, in the same order
    m = re.search(r'(<div class="tablist" role="tablist">)(.*?)(\n\s*</div>)', t, re.S)
    btns = {}
    for b in re.finditer(r'<button class="tab"[^>]*id="t-([a-z0-9-]+)"[^>]*>(.*?)</button>', m.group(2)):
        btns[b.group(1)] = b.group(0)
    for pid in order:
        if pid not in btns:
            btns[pid] = '<button class="tab" role="tab" id="t-%s" aria-controls="%s" aria-selected="false" tabindex="-1">%s</button>' % (pid, pid, TABS.get(pid, pid.title()))
    for pid in ('days', 'weekend'):
        if pid in btns:
            btns[pid] = re.sub(r'>[^<]*</button>', '>%s</button>' % day_name, btns[pid])
    indent = re.search(r'\n(\s*)<button', m.group(2)).group(1)
    tl = ''.join('\n' + indent + btns[p] for p in order)
    t = t[:m.start(2)] + tl + t[m.end(2):]

    # 4. section bar descriptions
    dm = re.search(r'var (DESC|SUBS)=\{', t)
    if dm:
        a = dm.end()
        b = t.index('};', a) if dm.group(1) == 'DESC' else t.index('};', a)
        body = t[a:b]
        add = dict(DESC)
        add['days'] = add['weekend'] = 'Which of the 2027 shows suits you' if show in MULTI_SHOW else DESC['days']
        for k, v in add.items():
            if k not in order:
                continue
            body = re.sub(r'(^|[,{\s])%s\s*:\s*("[^"]*"|\'[^\']*\')\s*,?' % k, r'\1', body)
            body = ("%s:'%s'," % (k, v.replace("'", "\\'"))) + body
        t = t[:a] + body + t[b:]

    # 5. Last checked under the key details
    if data and data.get('lastChecked'):
        t = re.sub(r'<!-- sx-checked -->.*?<!-- /sx-checked -->', '', t, flags=re.S)
        g = t.index('<div class="cg-glass">')
        g = match_close(t, g, 'div')
        line = ('<!-- sx-checked --><p class="sx-checked"><b>Last checked</b> %s. Where a time or price says 2026, '
                'it&rsquo;s from last year&rsquo;s show until the 2027 details are out.</p><!-- /sx-checked -->') % esc(data['lastChecked'])
        t = t[:g] + line + t[g:]

    # postcard photos must be loaded as shareable so the finished card can be saved
    pm = re.search(r'<div class="pc-pics" id="pcPics">.*?</div>', t, re.S)
    if pm:
        fixed = re.sub(r'<img (?!crossorigin)', '<img crossorigin="anonymous" ', pm.group(0))
        t = t[:pm.start()] + fixed + t[pm.end():]

    # 6. load show-extras.js
    t = re.sub(r'<!-- sx-js -->.*?<!-- /sx-js -->\n?', '', t, flags=re.S)
    conf = {'place': place, 'greet': 'Greetings From ' + place, 'msg': 'Wish you were here!', 'slug': show, 'year': '2027', 'shows': [event]}
    tag = '<!-- sx-js --><script>window.SX_PC=%s;</script><script src="%sshow-extras.js?v=4" defer></script><!-- /sx-js -->\n' % (json.dumps(conf), GH)
    i = t.rindex('</body>') if '</body>' in t else len(t)
    bt = t.find('<script src="%sback-tab.js"' % GH)
    i = bt if bt > -1 else i
    t = t[:i] + tag + t[i:]

    open(path, 'w', encoding='utf-8').write(t)
    print(show.ljust(13), ', '.join(log), '| order:', ' '.join(order))


if __name__ == '__main__':
    for s in (sys.argv[1:] or SHOWS):
        build(s)
