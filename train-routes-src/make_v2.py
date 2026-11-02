"""Builds template-v2.html: the train route template in the Blackpool layout (1 Nov 2026).
template.html plus the Blackpool page's parts: the matt refresh, the route map under the station picker,
bigger day, direction and time pickers, Your way in (way in card, ring tabs, roundel steps, last way home,
station board), My travel plan, Full show guide button, Pay less to get there and Good to know.
Everything show or operator specific comes from the cfg (theme, x, pay, faq, access).
The Blackpool parts are kept in v2-parts/ (taken from the Blackpool preview, colours swapped for theme variables).
Run: python3 make_v2.py   then   python3 build.py <show>"""
import os, re
here = os.path.dirname(os.path.abspath(__file__))
P = lambda f: open(os.path.join(here, 'v2-parts', f)).read()
t = open(os.path.join(here, 'template.html')).read()
def R(a, b, n=1):
    global t
    assert t.count(a) == n, (t.count(a), a[:80])
    t = t.replace(a, b)

# styles: after the main style block
i = t.index('</style>') + len('</style>')
t = t[:i] + '\n' + P('styles.css') + t[i:]

# theme: a darker shade of the company colour for button edges
R("['op1', 'op2', 'op3', 'opink', 'accink', 'onui']", "['op1', 'op2', 'op3', 'opink', 'accink', 'onui', 'opd']")
t = t.replace('<style id="refresh">', '<style id="refresh">\n:root{--opd:#13293C}', 1)

# a different default train for each day, when the show runs at different times (Ayr: Friday evening, Saturday afternoon)
R("var tr = DIR().trips, want = dir === 0 ? CFG.defaultThere : CFG.defaultBack;", "var dd = (CFG.x && CFG.x.dayDefaults || {})[D().key], tr = DIR().trips, want = dd ? dd[dir] : dir === 0 ? CFG.defaultThere : CFG.defaultBack;")

# jump links
R('    <a href="#route">Route map</a>\n    <a href="#roads">The line it takes</a>\n    <a href="#travel">Before you travel</a>\n',
  '    <a href="#way">Your way in</a>\n    <a href="#route">Route map</a>\n    <a href="#roads">The line it takes</a>\n    <a href="#travel">Before you travel</a>\n    <a href="#pay">Pay less</a>\n    <a href="#know">Good to know</a>\n')

# the route map moves inside Pick your train, under the station picker
a = t.index('<section class="s" id="route">'); b = t.index('</section>', a) + len('</section>')
route = t[a:b]; t = t[:a] + t[b:]
stage = route[route.index('    <div class="stage rise" id="stage">'):route.rindex('  </div>\n</section>')]
planner_start = t.index('    <div class="planner rise">')
planner_end = t.index('    <div class="ttbar">')
planner = t[planner_start:planner_end]
hubrow = re.search(r'        <div class="row full" id="hubrow">.*?</div></div>\n', planner).group(0)
rest = planner.replace(hubrow, '').replace('<div class="planner rise">', '<div class="planner pickctl">').replace('<div class="pin">', '<div class="pin" style="counter-reset:pk 2">', 1)
new = ('    <div class="pickcard rise"><div class="planner hubbox"><div class="pin">' + hubrow.strip() + '</div></div></div>\n'
       '    <div class="routein" id="route"><div class="pin" style="counter-reset:pk 1"><div class="row full"><div class="lb">Route map<small>Every station on the train you picked. Tap a station in the list to find it on the map. The red sign is where you get off for the show.</small></div>\n'
       + stage + '    </div></div></div>\n' + rest)
t = t[:planner_start] + new + t[planner_end:]

# Your way in after Pick your train (and the shuttle section, if any); Pay less and Good to know after Before you travel
a = t.index('<section class="s" id="roads">')
t = t[:a] + P('way.html') + '\n' + t[a:]
a = t.index('<section class="s">', t.index('<section class="s" id="travel">'))
t = t[:a] + P('pay-know.html') + '\n' + t[a:]

# script: the way in card, travel plan, pay and FAQ code, then draw() calls it
R('  idx = pickDefault();\n  render();\n', P('ptx.js') + '\n  idx = pickDefault();\n  render();\n')
R('    jline(trip);\n    setBlind(trip.big, trip.dest, blindLines(trip));', '    jline(trip);\n    ptxRender(trip);\n    setBlind(trip.big, trip.dest, blindLines(trip));')
# the board shows the trains around the picked one, with a button for every time
t = t.replace('</body>', P('board-more.html') + '\n</body>')
open(os.path.join(here, 'template-v2.html'), 'w').write(t)
print('built template-v2.html', len(t))
