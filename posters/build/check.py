#!/usr/bin/env python3
"""House rules check for the poster series. Run from posters/:  python3 -I build/check.py
For every NN-*.html it checks: the one allowed logo and nothing from /brand, the sign-off
(address and series tag), no em or en dashes in the wording, the three type families only,
and that editable text (data-live) sits directly inside the slide."""
import glob, os, re, sys
from html.parser import HTMLParser

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
LOGO = 'img/uk-airshow-guide-logo.png'
OK_FAMS = {'barlow', 'barlow-condensed', 'ibm-plex-mono', 'barlow condensed', 'ibm plex mono',
           'arial', 'arial narrow', 'sans-serif', 'monospace', 'ui-monospace', 'system-ui', 'inherit'}

class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack, self.logos, self.imgs, self.live_bad, self.live, self.text = [], [], [], [], 0, []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('style', 'script', 'title'):
            self.skip += 1
        if tag in ('img', 'image'):
            src = a.get('src') or a.get('href') or a.get('xlink:href') or ''
            self.imgs.append(src[:80])
            if 'logo' in (a.get('class') or '') or LOGO in src:
                self.logos.append(src)
        if 'data-live' in a:
            self.live += 1
            parent = self.stack[-1] if self.stack else ('', '')
            if 'slide' not in parent[1].split():
                self.live_bad.append((tag, a.get('class', '')))
        if tag not in ('img', 'br', 'meta', 'link', 'input', 'hr', 'path', 'rect', 'circle', 'line', 'polygon', 'polyline', 'ellipse', 'stop', 'use', 'image', 'feTurbulence', 'feturbulence', 'fecolormatrix', 'fecomposite', 'feblend', 'fegaussianblur', 'feoffset', 'feflood', 'femergenode', 'fefunca', 'fefuncr', 'fefuncg', 'fefuncb', 'fedisplacementmap', 'animate'):
            self.stack.append((tag, a.get('class') or ''))
    def handle_startendtag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('img', 'image'):
            src = a.get('src') or a.get('href') or a.get('xlink:href') or ''
            self.imgs.append(src[:80])
            if 'logo' in (a.get('class') or '') or LOGO in src:
                self.logos.append(src)
    def handle_endtag(self, tag):
        if tag in ('style', 'script', 'title'):
            self.skip -= 1
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break
    def handle_data(self, d):
        if not self.skip and d.strip():
            self.text.append(d)

bad = 0
files = sorted(glob.glob(os.path.join(ROOT, '[0-9][0-9]-*.html')))
for f in files:
    s = open(f, encoding='utf-8').read()
    p = P(); p.feed(s)
    probs = []
    if len(p.logos) != 1 or p.logos[0] != LOGO:
        probs.append('logo: expected exactly one %s, found %r' % (LOGO, p.logos))
    if '/brand/' in s or 'brand/' in ''.join(p.imgs):
        probs.append('uses something from /brand')
    others = [i for i in p.imgs if i and i != LOGO and not i.startswith('data:')]
    if others:
        probs.append('other images: %r' % others)
    txt = ' '.join(p.text)
    for ch, nm in (('—', 'em dash'), ('–', 'en dash')):
        if ch in txt:
            i = txt.index(ch); probs.append('%s in wording: ...%s...' % (nm, txt[max(0, i - 30):i + 30]))
    if 'ukairshowguide.co.uk' not in txt:
        probs.append('address missing')
    if not re.search(r'series\s+\d\d\s*/\s*10', txt, re.I):
        probs.append('series tag missing')
    if p.live_bad:
        probs.append('data-live not a direct child of .slide: %r' % p.live_bad[:4])
    fams = set(m.strip().strip('"\'').lower() for grp in re.findall(r'font-family\s*[:=]\s*["\']?([^;"}<>]+)', s) for m in grp.split(',') if 'var(' not in m)
    extra = sorted(x for x in fams if x and x not in OK_FAMS)
    if extra:
        probs.append('other type families: %r' % extra)
    if 'width:1240px' not in s and 'kit.css' not in s:
        probs.append('slide size not found')
    print('%-34s live text %3d  %s' % (os.path.basename(f), p.live, 'OK' if not probs else ''))
    for x in probs:
        bad += 1; print('    ! ' + x)
print('%d posters checked, %d problems' % (len(files), bad))
sys.exit(1 if bad else 0)
