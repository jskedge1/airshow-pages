"""Build riat-guide/preview.html: the whole Big Guide to RIAT in one self-contained file.

Every page's <main> becomes a section switched by the category tabs (#home, #tickets ...),
with site.css, site.js and the photos inlined, so it opens anywhere: straight from disk,
as a Claude artifact, or attached to an email. The real pages are unchanged.

Run from the repo root:  python3 tools-riat-preview.py
"""
import base64, re, pathlib, collections

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'riat-guide'
PAGES = [('home', 'index.html'), ('tickets', 'tickets.html'), ('travel', 'getting-there.html'),
         ('parking', 'parking.html'), ('stay', 'camping-and-stay.html'), ('pv', 'park-and-view.html'),
         ('photo', 'photography.html'), ('planner', 'planner.html'), ('faq', 'faq.html')]


def data_uri(m):
    img = (SRC / m.group(1)).resolve()
    return 'src="data:image/webp;base64,' + base64.b64encode(img.read_bytes()).decode() + '"'


views = []
for key, name in PAGES:
    html = (SRC / name).read_text()
    main = re.search(r'<main>(.*)</main>', html, re.S).group(1)
    views.append('<div data-view="%s"%s>%s</div>' % (key, '' if key == 'home' else ' hidden', main))
body = '\n'.join(views)
body = re.sub(r'src="(\.\./camping-layout/img/[0-9a-f]+\.webp)"', data_uri, body)

ids = collections.Counter(re.findall(r'\sid="([^"]+)"', body))
dupes = [i for i, n in ids.items() if n > 1 and i != 'count']
if dupes:
    raise SystemExit('Duplicate ids across pages: %s' % dupes)

head = (SRC / 'index.html').read_text()
fonts = re.search(r'(<link rel="preconnect".*?rel="stylesheet">)\n<link rel="stylesheet" href="site.css">', head, re.S).group(1)
out = f'''<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<!-- PREVIEW, built by tools-riat-preview.py. Edit the pages in riat-guide/, not this file. -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Big Guide to RIAT, preview</title>
<meta name="robots" content="noindex">
{fonts}
<style>
{(SRC / 'site.css').read_text()}
</style>
</head>
<body data-page="home">
<div id="rg-head"></div>
<main>
{body}
</main>
<div id="rg-foot"></div>
<script>window.RG_PREVIEW=true;</script>
<script>
{(SRC / 'site.js').read_text()}
</script>
</body>
</html>
'''
(SRC / 'preview.html').write_text(out)
print('Wrote riat-guide/preview.html, %d KB' % (len(out.encode()) // 1024))
