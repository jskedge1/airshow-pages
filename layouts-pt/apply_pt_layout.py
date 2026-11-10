"""Puts the sign style tabbed layout on public-transport.html (live since 10 Nov 2026).
Safe to run again: it swaps the two blocks it added last time for fresh ones.
run: python3 layouts-pt/apply_pt_layout.py            (the live page)
     python3 layouts-pt/apply_pt_layout.py --preview  (writes public-transport-layout.html for the preview only)
public-transport-src/build.py runs this at the end, so a rebuild keeps the layout."""
import os, re, sys
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)

def layer(s):
    s = re.sub(r'<style id="px-css">.*?</style>\n?', '', s, flags=re.S)
    s = re.sub(r'<script id="px-js">.*?</script>\n?', '', s, flags=re.S)
    js = (open(here + '/pt.js', encoding='utf8').read()
          .replace('/*UKGEO*/', open(here + '/ukgeo.json', encoding='utf8').read())
          .replace('/*AIRDATA*/', open(here + '/air.json', encoding='utf8').read()))
    assert '</script' not in js.lower()
    s = s.replace('</head>', '<style id="px-css">\n' + open(here + '/pt.css', encoding='utf8').read() + '</style>\n</head>', 1)
    k = s.rfind('</body>')
    return s[:k] + '<script id="px-js">\n' + js + '</script>\n' + s[k:]

if __name__ == '__main__':
    src = open(root + '/public-transport.html', encoding='utf8').read()
    out = 'public-transport-layout.html' if '--preview' in sys.argv else 'public-transport.html'
    open(root + '/' + out, 'w', encoding='utf8').write(layer(src))
    print('layout applied to', out)
