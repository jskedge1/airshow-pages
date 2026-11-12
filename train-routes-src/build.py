"""Builds train-routes/<show>.html from template.html, <show>-cfg.json (text, colours, fares) and
<show>-data.json (stations, line shapes and every journey for each hub station).
Run from this folder: python3 build.py            (builds every show)
                      python3 build.py eastbourne (builds one)"""
import json, os, sys, glob, importlib
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
_tb = importlib.import_module('tools-transport-back')
_sg = importlib.import_module('tools-station-guide')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import station_fixes
here = os.path.dirname(os.path.abspath(__file__))
shows = sys.argv[1:] or sorted(os.path.basename(f)[:-9] for f in glob.glob(os.path.join(here, '*-cfg.json')))
src = open(os.path.join(here, '..', 'previews', 'bus-route-layout', '132-duxford.html')).read()
mf = src[src.index('<!-- mobile-fit'):src.index('<!-- /mobile-fit -->') + len('<!-- /mobile-fit -->')]
for show in shows:
    cfg = json.load(open(os.path.join(here, show + '-cfg.json')))
    page = open(os.path.join(here, cfg.get('template', 'template.html'))).read()
    data = json.load(open(os.path.join(here, show + '-data.json')))
    station_fixes.fix(data)  # stations the scraped data puts in the wrong place (station_fixes.py)
    data = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    page = page.replace('__CFG__', json.dumps(cfg, ensure_ascii=False)).replace('__DATA__', data)
    page = page.replace('<title>Train to Clacton | The Big Guide to UK Airshows</title>', '<title>' + cfg['title'].replace('Trains', 'Train') + ' | The Big Guide to UK Airshows</title>')
    page = page.replace('</body>', mf + '\n</body>')
    out = os.path.join(here, '..', 'train-routes', show + '.html')
    # keep the page's own SEO block (written by tools-seo.py) rather than the template's noindex one
    A, B = '<!-- seo: matches the Wix page on ukairshowguide.co.uk -->', '<!-- /seo -->'
    if os.path.exists(out):
        old = open(out).read()
        if A in old and A in page and ('canonical' in old[old.index(A):old.index(B)] or 'name="description"' in old[old.index(A):old.index(B)]):
            page = page[:page.index(A)] + old[old.index(A):old.index(B)] + page[page.index(B):]
    page = _tb.add(page, 'train', show)  # Back to Transport tab (transport-back.js)
    page = _sg.add(page, show)  # Station guide box (tools-station-guide.py)
    open(out, 'w').write(page)
    print('built train-routes/' + show + '.html')
