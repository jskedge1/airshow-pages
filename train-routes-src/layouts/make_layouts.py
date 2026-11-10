"""Builds the two preview layouts of a train page: <page>-layout-a.html (tabs) and <page>-layout-b.html (long page).
usage: python3 make_layouts.py <built page.html> <out dir>      Preview only, not linked from the site."""
import sys, os
src, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
css, js = open(here + '/lx.css').read(), open(here + '/lx.js').read()
s = open(src).read()
base = os.path.basename(src)[:-5]
for m in 'ab':
    t = s.replace('</head>', '<style id="lx-css">\n' + css + '</style>\n</head>', 1)
    k = t.rfind('</body>')
    t = t[:k] + '<script>window.LX_MODE="' + m + '";</script>\n<script id="lx-js">\n' + js + '</script>\n' + t[k:]
    open(os.path.join(out, base + '-layout-' + m + '.html'), 'w').write(t)
    print(base + '-layout-' + m + '.html')
