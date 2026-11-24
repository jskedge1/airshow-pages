"""Build the airshow train map film (train-map/) from _rail/head.part.js + map/data.gen.js + map/film.part.js.
Run `node _rail/map/gen-data.mjs` first if journey-planner.js or london-links.js changed.  python3 _rail/build_map.py"""
import shutil, pathlib, json
B = pathlib.Path(__file__).parent; ROOT = B.parent
d = ROOT / 'train-map'; src = ROOT / 'transport-original'
(d / 'lib').mkdir(parents=True, exist_ok=True); (d / 'fonts').mkdir(exist_ok=True); (d / 'assets' / 'aircraft').mkdir(parents=True, exist_ok=True)
shutil.copy(B / 'toon.js', d / 'lib' / 'toon.js'); shutil.copy(src / 'lib' / 'motion.js', d / 'lib' / 'motion.js')
(d / 'index.html').write_text((src / 'index.html').read_text().replace('By train to the Clacton Air Show', 'Airshows by train: the map'))
for w in (src / 'fonts').glob('*.woff2'): shutil.copy(w, d / 'fonts' / w.name)
for a in (ROOT / 'volunteer' / 'assets' / 'aircraft').glob('*'): shutil.copy(a, d / 'assets' / 'aircraft' / a.name)
shutil.copy(ROOT / 'volunteer' / 'assets' / 'logo.png', d / 'assets' / 'logo.png')
head = (B / 'head.part.js').read_text().replace('routes/<film>.js + ride.part.js + body.part.js', 'map/data.gen.js + map/coast.gen.js + map/film.part.js (build_map.py)')
(d / 'film.js').write_text('\n'.join([head, (B / 'map' / 'data.gen.js').read_text(), (B / 'map' / 'coast.gen.js').read_text(), (B / 'map' / 'film.part.js').read_text()]))
print('built train-map')
