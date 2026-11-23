#!/usr/bin/env python3
"""Web copies and the gallery page for the poster series.
Reads png/NN-slug.png (made by render.js) and writes
  jpg/NN-slug.jpg     2480 x 3508, the full size poster for viewing and sharing
  thumbs/NN-slug.jpg  620 x 877, for the gallery
  index.html          the gallery page
Run from posters/:  python3 -I build/web.py   (needs Pillow)"""
import os, sys
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

POSTERS = [
    ('01-runway-27', 'Runway two seven', 'The 2027 season poster. Runway 27, cleared for take-off.'),
    ('02-every-way-in', 'Every way in', 'The transport map. Six ways to the show, drawn as an aircraft.'),
    ('03-airshow-chart', 'The UK airshow chart', 'Thirty shows from the guide map on one aeronautical style chart.'),
    ('04-night-before-checklist', 'Before take-off', 'The night before checklist, set as a cockpit checklist card.'),
    ('05-six-pack', 'Show day, by the instruments', 'Six flight instruments, six pieces of show day advice.'),
    ('06-perfect-day-sequence', 'The perfect day, flown', 'The eight planning stops, drawn as an aerobatic sequence.'),
    ('07-read-the-cloud', 'Read the cloud', 'How the height of the cloud decides the display you see.'),
    ('08-prop-blur', "Don't freeze the prop", 'A shutter speed chart for propellers, jets and helicopters.'),
    ('09-where-to-stand', 'Where to stand', 'A blueprint of the crowd line and where to watch from.'),
    ('10-look-up', 'Look up', 'The big one. Every UK airshow, one easy guide.'),
]

def copies():
    for d in ('jpg', 'thumbs'):
        os.makedirs(os.path.join(ROOT, d), exist_ok=True)
    for slug, _, _ in POSTERS:
        src = os.path.join(ROOT, 'png', slug + '.png')
        if not os.path.exists(src):
            print('missing', src)
            continue
        im = Image.open(src).convert('RGB')
        im.save(os.path.join(ROOT, 'jpg', slug + '.jpg'), quality=93, subsampling=0, optimize=True)
        th = im.resize((620, 877), Image.LANCZOS)
        th.save(os.path.join(ROOT, 'thumbs', slug + '.jpg'), quality=86, optimize=True)
        print(slug, '%.2f MB' % (os.path.getsize(os.path.join(ROOT, 'jpg', slug + '.jpg')) / 1e6))

CSS = """
:root{--navy:#13293C;--deep:#0B1A27;--red:#D74949;--teal:#32B4AF;--mint:#5FE3D6;--amber:#F5B942;--soft:#C9D6E0;
--f:"Barlow",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;--c:"Barlow Condensed","Barlow",Arial Narrow,sans-serif}
*{box-sizing:border-box}html,body{margin:0}
body{background:var(--deep);color:#fff;font-family:var(--f);font-size:17px;line-height:1.5;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:1500px;margin:0 auto;padding:clamp(20px,4vw,56px)}
header{display:flex;flex-wrap:wrap;gap:24px 40px;align-items:center;padding-bottom:clamp(20px,3vw,40px);border-bottom:4px solid var(--red)}
header img{width:min(300px,70vw);height:auto;display:block}
header div{flex:1 1 320px;min-width:0}
.eyebrow{font-family:var(--c);font-weight:700;font-size:16px;letter-spacing:.2em;text-transform:uppercase;color:var(--mint);margin:0 0 6px}
h1{font-family:var(--c);font-weight:800;font-style:italic;text-transform:uppercase;font-size:clamp(40px,6vw,84px);line-height:.92;margin:0 0 12px}
h1 span{color:var(--amber)}
header p.lead{margin:0;color:var(--soft);max-width:60ch}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:clamp(18px,2.4vw,34px);padding:clamp(22px,3vw,44px) 0}
.card{background:var(--navy);display:flex;flex-direction:column;min-width:0}
.card a.img{display:block;background:#07121C}
.card img{display:block;width:100%;height:auto;aspect-ratio:1240/1754}
.card .txt{padding:16px 18px 18px;display:flex;flex-direction:column;gap:6px;flex:1}
.card .no{font-family:var(--c);font-weight:700;font-size:14px;letter-spacing:.18em;color:var(--mint)}
.card h2{font-family:var(--c);font-weight:800;font-size:27px;line-height:1.05;text-transform:uppercase;margin:0}
.card p{margin:0;color:var(--soft);font-size:16px;flex:1}
.btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.btns a{font-family:var(--c);font-weight:700;font-size:16px;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;padding:9px 14px;min-width:0}
.btns a.v{background:var(--amber);color:var(--deep)}
.btns a.p{border:2px solid var(--teal);color:#fff}
.btns a:hover,.btns a:focus-visible{outline:3px solid #fff;outline-offset:2px}
footer{border-top:1px solid #24405a;padding-top:20px;color:var(--soft);font-size:15px}
"""

def gallery():
    cards = []
    for i, (slug, title, text) in enumerate(POSTERS, 1):
        if not os.path.exists(os.path.join(ROOT, 'jpg', slug + '.jpg')):
            continue
        pdf = os.path.exists(os.path.join(ROOT, 'pdf', slug + '.pdf'))
        cards.append(
            '<article class="card"><a class="img" href="jpg/%(s)s.jpg"><img src="thumbs/%(s)s.jpg" width="620" height="877" loading="lazy" alt="Poster %(n)02d, %(t)s"></a>'
            '<div class="txt"><span class="no">POSTER %(n)02d OF 10</span><h2>%(t)s</h2><p>%(d)s</p>'
            '<div class="btns"><a class="v" href="jpg/%(s)s.jpg">View poster</a>%(p)s</div></div></article>' % {
                's': slug, 'n': i, 't': title.replace('&', '&amp;'), 'd': text,
                'p': ('<a class="p" href="pdf/%s.pdf">Print file, PDF</a>' % slug) if pdf else ''})
    html = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Plan Your Airshow poster series | The Big Guide to UK Airshows</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:ital,wght@0,700;0,800;1,800&display=swap">
<style>%s</style></head>
<body><div class="wrap">
<header><img src="img/uk-airshow-guide-logo.png" width="1421" height="723" alt="UK Airshow Guide, by The Big Guide to UK Airshows">
<div><p class="eyebrow">Ten posters, A2 size</p><h1>Plan your airshow, <span>the poster series</span></h1>
<p class="lead">Ten posters for planning a brilliant airshow day, from picking a show to getting home. Open one to view it full size, or take the PDF if you want to print it.</p></div></header>
<main class="grid">
%s
</main>
<footer>Made for <a href="https://www.ukairshowguide.co.uk/">ukairshowguide.co.uk</a>. Each poster is one HTML file in this folder, so the wording can be changed and the files made again.</footer>
</div></body></html>
""" % (CSS, '\n'.join(cards))
    with open(os.path.join(ROOT, 'index.html'), 'w') as fh:
        fh.write(html)
    print('index.html with', len(cards), 'posters')

if __name__ == '__main__':
    copies()
    gallery()
