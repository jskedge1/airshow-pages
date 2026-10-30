"""Puts the "On the bus" add-on (onbus-addon.html) into the bus route template and every built route page.

The add-on gives each route page the dot matrix front sign, the departures board in the bus
company's colours and the On the bus next stop screen (ride along, or follow the phone's location).
Run from bus-routes-src/ after editing onbus-addon.html or after build.py: python3 add_onbus.py
Running it again replaces the old copy, so it never adds the add-on twice.
"""
import glob
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ADD = open(os.path.join(HERE, 'onbus-addon.html'), encoding='utf-8').read().strip()
START = '<!-- on the bus add-on'
END = '<!-- /on the bus add-on -->'
OLD = re.compile(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', re.S)


def put(path):
    s = open(path, encoding='utf-8').read()
    s = OLD.sub('', s)
    i = s.rfind('</body>')
    if i < 0:
        return False
    s = s[:i] + ADD + '\n' + s[i:]
    open(path, 'w', encoding='utf-8').write(s)
    return True


files = [os.path.join(ROOT, 'templates', 'bus-route-template.html')]
files += sorted(p for p in glob.glob(os.path.join(ROOT, 'bus-routes', '*.html')) if not p.endswith('index.html'))
done = [os.path.relpath(p, ROOT) for p in files if put(p)]
print(len(done), 'files updated')
for d in done:
    print(' ', d)
