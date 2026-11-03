"""Adds the Back to Transport tab (transport-back.js) to every bus and train route page.
Safe to run again: pages that already have it are left alone. The two builders
(bus-routes-src/build.py and train-routes-src/build.py) add it too, so rebuilt pages keep it.
Run from the repository folder: python3 tools-transport-back.py"""
import glob, os, re

SRC = 'https://jskedge1.github.io/airshow-pages/transport-back.js'


def tag(mode, rid):
    return ('<!-- back-to-transport -->\n'
            f"<script>window.UKAG_ROUTE={{mode:'{mode}',id:'{rid}'}};</script>\n"
            f'<script src="{SRC}" defer></script>\n'
            '<!-- /back-to-transport -->\n')


def add(html, mode, rid):
    if 'transport-back.js' in html:
        return html
    i = html.rfind('</body>')
    if i < 0:
        return html + '\n' + tag(mode, rid)
    return html[:i] + tag(mode, rid) + html[i:]


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    done = 0
    for mode, folder in (('bus', 'bus-routes'), ('train', 'train-routes')):
        for f in sorted(glob.glob(os.path.join(here, folder, '*.html'))):
            rid = os.path.basename(f)[:-5]
            if rid == 'index':
                continue
            s = open(f, encoding='utf-8').read()
            t = add(s, mode, rid)
            if t != s:
                open(f, 'w', encoding='utf-8').write(t)
                done += 1
    print('added to', done, 'pages')
