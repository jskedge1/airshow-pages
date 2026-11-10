"""Puts layout A (the four numbered tabs: Plan your train, Your journey, Your station, Tickets and tips) on the template and
every built train page. Jack picked layout A on 10 Nov 2026. Safe to run again: it replaces its own blocks.
Run from anywhere: python3 train-routes-src/layouts/apply_layout_a.py"""
import glob, os, re
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.abspath(here + '/../..')
css, js = open(here + '/lx.css').read(), open(here + '/lx.js').read()
A = '<style id="lx-css">\n' + css + '</style>\n'
B = '<script id="lx-mode">window.LX_MODE="a";</script>\n<script id="lx-js">\n' + js + '</script>\n'
for f in [root + '/train-routes-src/template-v2.html'] + sorted(glob.glob(root + '/train-routes/*.html')):
    if '-layout-' in f: continue
    s = open(f).read()
    if 'id="times"' not in s or '<main' not in s: print('skip', os.path.basename(f)); continue
    s = re.sub(r'<style id="lx-css">.*?</style>\n', '', s, flags=re.S)
    s = re.sub(r'<script id="lx-mode">.*?</script>\n<script id="lx-js">.*?</script>\n', '', s, flags=re.S)
    s = s.replace('</head>', A + '</head>', 1)
    k = s.rfind('</body>'); s = s[:k] + B + s[k:]
    open(f, 'w').write(s); print('ok', os.path.basename(f))
