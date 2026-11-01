"""Puts explore-designs.js inside each show page, so the Wix page loader runs it with the page.
Run after any change to explore-designs.js: python3 tools-explore.py"""
import re

PAGES = ['riat', 'cosford', 'midlands', 'eastbourne', 'clacton', 'wales', 'duxford',
         'shuttleworth', 'gransden', 'southport', 'blackpool', 'ayr']
ANCHOR = '<script src="https://jskedge1.github.io/airshow-pages/showday-band.js" defer></script>\n'

js = open('explore-designs.js', encoding='utf8').read()
block = "<script>window.EXPLORE_DESIGN='mix';</script>\n<script id=\"explore-designs-js\">\n" + js + "\n</script>\n"

for name in PAGES:
    path = 'camping-layout/%s.html' % name
    page = open(path, encoding='utf8').read()
    if 'id="explore-designs-js"' in page:
        start = page.index("<script>window.EXPLORE_DESIGN='mix';</script>")
        end = page.index('</script>', page.index('id="explore-designs-js"')) + len('</script>\n')
        page = page[:start] + block + page[end:]
    else:
        assert page.count(ANCHOR) == 1, path
        page = page.replace(ANCHOR, ANCHOR + block)
    open(path, 'w', encoding='utf8').write(page)
    print('updated', path)
