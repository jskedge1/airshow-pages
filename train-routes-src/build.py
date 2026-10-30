"""Builds train-routes/clacton.html from template.html, clacton-cfg.json (text, colours, fares) and
clacton-data.json (stations, line shapes and every Greater Anglia journey for each hub station).
Run from this folder: python3 build.py"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
page = open(os.path.join(here, 'template.html')).read()
cfg = json.load(open(os.path.join(here, 'clacton-cfg.json')))
data = open(os.path.join(here, 'clacton-data.json')).read()
page = page.replace('__CFG__', json.dumps(cfg, ensure_ascii=False)).replace('__DATA__', data)
# the shared mobile-fit block, the same one every page carries
src = open(os.path.join(here, '..', 'previews', 'bus-route-layout', '132-duxford.html')).read()
mf = src[src.index('<!-- mobile-fit'):src.index('<!-- /mobile-fit -->') + len('<!-- /mobile-fit -->')]
page = page.replace('</body>', mf + '\n</body>')
open(os.path.join(here, '..', 'train-routes', 'clacton.html'), 'w').write(page)
print('built train-routes/clacton.html')
