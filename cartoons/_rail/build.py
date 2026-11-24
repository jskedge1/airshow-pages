"""Build rail trip cartoons in the original design from _rail/: head.part.js + routes/<film>.js + ride.part.js + body.part.js.
Also syncs each film folder's lib/toon.js, fonts, logo and aircraft cut-outs.  python3 _rail/build.py [film ...]"""
import shutil, sys, pathlib
B = pathlib.Path(__file__).parent; ROOT = B.parent
films = sys.argv[1:] or [p.stem for p in (B / 'routes').glob('*.js')]
for f in films:
    d = ROOT / f
    (d / 'lib').mkdir(parents=True, exist_ok=True); (d / 'fonts').mkdir(exist_ok=True); (d / 'assets' / 'aircraft').mkdir(parents=True, exist_ok=True)
    shutil.copy(B / 'toon.js', d / 'lib' / 'toon.js')
    src = ROOT / 'transport-original'
    if d != src:
        shutil.copy(src / 'lib' / 'motion.js', d / 'lib' / 'motion.js'); shutil.copy(src / 'index.html', d / 'index.html')
        for w in (src / 'fonts').glob('*.woff2'): shutil.copy(w, d / 'fonts' / w.name)
    for a in (ROOT / 'volunteer' / 'assets' / 'aircraft').glob('*'): shutil.copy(a, d / 'assets' / 'aircraft' / a.name)
    shutil.copy(ROOT / 'volunteer' / 'assets' / 'logo.png', d / 'assets' / 'logo.png')
    js = '\n'.join((B / p).read_text() for p in ['head.part.js', f'routes/{f}.js', 'ride.part.js', 'body.part.js'])
    (d / 'film.js').write_text(js)
    print('built', f)
