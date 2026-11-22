"""Round 2 (Jack, 22 Nov 2026): the Ayr page built in the Duxford template.

The sections Ayr shares with Duxford are rebuilt here in Duxford's own markup, so the same layout and
CSS apply, with only Ayr's own words, facts, links and photos in them. Nothing here adds a fact that is
not already on the Ayr page. Ayr's own sections that suit the page (Seafront Information and The Ground
Show) are kept, and placed in the section order by new-design.js.

Each step checks that the text it changes is there exactly once, so a change to live-source.html that
moves things around stops the build instead of quietly doing nothing.
"""
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent


def one(html, old, new, what):
    n = html.count(old)
    assert n == 1, "%s: expected 1 match, found %d" % (what, n)
    return html.replace(old, new, 1)


def block(html, start, end, what):
    """Return (i, j) of the text from start up to and including end, checking start is there once."""
    assert html.count(start) == 1, "%s: start found %d times" % (what, html.count(start))
    i = html.index(start)
    j = html.index(end, i) + len(end)
    return i, j


def overview(html):
    # Duxford: one of Jack's photos under the intro text, and the four jump boxes below the grid, not in it.
    i, j = block(html, '      <div class="jump boxes">\n', '      </div>\n', 'overview jump boxes')
    jump = html[i:j]
    html = html[:i] + html[j:]
    html = one(html, '    </div>\n    <div class="band reveal">\n      <h3>The Festival Village</h3>',
               '    </div>\n\n' + jump.replace('      <div class="jump boxes">', '    <div class="jump boxes reveal">', 1)
               .replace('\n      ', '\n    ') + '    <div class="band reveal">\n      <h3>The Festival Village</h3>',
               'overview band')
    # the photo goes at the end of the intro column, as on Duxford (Jack's Dakota photo, its own caption from PHOTO_ALT)
    i = html.index('<div class="ov-intro reveal">')
    k = html.index('      </div>\n      <aside class="ov-side reveal">', i)
    fig = ('        <figure class="pic reveal"><img loading="lazy" decoding="async" class="photo" data-k="dakota" alt="">'
           '<figcaption>The Battle of Britain Memorial Flight Dakota ZA947 passing the crowd.</figcaption></figure>\n')
    return html[:k] + fig + html[k:]


def stay(html):
    # Duxford: a "Search everything nearby" box with the two search buttons at the top. Ayr's own
    # "Search for more places to stay" group (Booking.com, Airbnb, Destination South Ayrshire) becomes that box.
    i, j = block(html, '    <div class="stay-group reveal">\n      <h3>Search for more places to stay</h3>', '    </div>\n',
                 'stay search group')
    html = html[:i] + html[j:].lstrip('\n')
    box = ('    <div class="stay-search reveal">\n'
           '      <div><h3>Search everything nearby</h3><p>Hotels, guest houses and apartments in Ayr, homes and rooms around Ayr and the Ayrshire coast, and the area&rsquo;s official visitor listings.</p></div>\n'
           '      <div class="stay-links">\n'
           '        <a class="btn" href="https://www.booking.com/city/gb/ayr.html" target="_blank" rel="noopener">Booking.com ↗</a>\n'
           '        <a class="btn ghost-n" href="https://www.airbnb.co.uk/s/Ayr--United-Kingdom/homes" target="_blank" rel="noopener">Airbnb ↗</a>\n'
           '        <a class="btn ghost-n" href="https://destinationsouthayrshire.co.uk" target="_blank" rel="noopener">Destination South Ayrshire ↗</a>\n'
           '      </div>\n'
           '    </div>\n\n')
    return one(html, '    <div class="stay-group reveal">\n      <h3>Closest to the display</h3>',
               box + '    <div class="stay-group reveal">\n      <h3>Closest to the display</h3>', 'stay first group')


def days(html):
    # Duxford: four fact boxes, then the cards, then the picker (one box per question), Jack's tip, the official site link.
    i, j = block(html, '    <h3 class="fl-h">The Two Days In 2026</h3>', '    </div>\n', 'days cards')
    cards = html[i:j]
    html = html[:i] + html[j:]
    facts = ('    <div class="fl-facts"><div><span>Show days</span><b>Friday 3 and Saturday 4 September 2027</b></div>'
             '<div class="pu"><span>Friday</span><b>Evening flying</b></div>'
             '<div><span>Saturday</span><b>Afternoon flying</b></div>'
             '<div class="pu"><span>Entry</span><b>Free, no tickets</b></div></div>\n')
    html = one(html, '    <div class="wk-tool sw-tabs sw-pick">', facts + cards + '\n    <div class="wk-tool sw-tabs sw-pick">', 'days picker')
    for q in ('What sounds best?', 'How are you getting there?'):
        html = one(html, '        </div>\n        <p class="pp-l">%s</p>' % q,
                   '        </div>\n      </div>\n      <div class="wk-q">\n        <p class="pp-l">%s</p>' % q, 'days question ' + q)
    return one(html, '    <p class="note sf-src">The 2027 times haven&rsquo;t been announced yet.</p>',
               '    <div class="sp-links"><a href="https://destinationsouthayrshire.co.uk/ayrshow/" target="_blank" rel="noopener"><b>Official site</b><span>International Ayr Show official page</span></a></div>\n'
               '    <p class="note sf-src">The 2027 times haven&rsquo;t been announced yet.</p>', 'days note')


WATCH_JS = r"""
    function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
    var PIN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7z" fill="currentColor"/><circle cx="12" cy="9" r="2.6" fill="#13293C"/></svg>';
    /* Round 2: the same markup as the Duxford page's "Where to watch, on the map" (styles and tab script in ww-duxford.html) */
    var tabs=SPOTS.map(function(x,i){
      return '<button type="button" role="tab" class="ww-in" id="ww-ayr-t'+i+'" aria-controls="ww-ayr-p'+i+'" aria-selected="'+(i===0)+'" tabindex="'+(i?-1:0)+'"><span class="xd-tt-ic">'+PIN+'</span>'+esc(x.short)+'</button>';
    }).join('');
    var panes=SPOTS.map(function(x,i){
      var ll=x.ll.join(',');
      return '<div class="ww-panel ww-in" role="tabpanel" id="ww-ayr-p'+i+'" aria-labelledby="ww-ayr-t'+i+'"'+(i?' hidden':'')+'>'
        +'<div class="ww-txt"><h4>'+esc(x.name)+'</h4><p class="ww-where">'+esc(x.tag)+'</p><p>'+x.text+'</p><p>'+x.more+'</p>'
        +'<ul class="ww-facts">'+x.rows.map(function(r){return '<li><b>'+esc(r[0])+'</b>'+esc(r[1])+'</li>';}).join('')+'</ul>'
        +'<a class="ww-go" href="https://www.google.com/maps/search/?api=1&amp;query='+ll+'" target="_blank" rel="noopener"><span class="xd-tt-ic">'+PIN+'</span><span>Open in Google Maps</span><i aria-hidden="true">&rarr;</i></a></div>'
        +'<div class="ww-map"><iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map of '+esc(x.name)+'" src="https://www.google.com/maps?q='+ll+'&amp;z=16&amp;output=embed" style="border:0;width:100%;aspect-ratio:16/10"></iframe></div>'
        +'</div>';
    }).join('');
    var sec=document.createElement('section');sec.className='ww reveal';sec.id='wwMap';sec.setAttribute('aria-label','Where to watch, on the map');
    sec.innerHTML='<div class="ww-head"><div><h3>Where to watch, <em>on the map</em></h3></div><p class="note">Pick a spot and the map will show you where it is.</p></div>'
      +'<div class="sw-tabs ww-tabs"><div class="xd-tt-tabs" role="tablist" aria-label="Viewing spots">'+tabs+'</div>'+panes+'</div>';
    box.parentNode.replaceChild(sec,box);
  })();
"""


def watch(html):
    # Ayr's spots (SPOTS data, unchanged) drawn in the Duxford markup. The old board layout and its
    # "Plan my day here" buttons are left out, as the Duxford page does not have them.
    start = "    function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\"/g,'&quot;');}\n    var PIN="
    i = html.index("var box=document.getElementById('wwTabs')")
    a = html.index(start, i)
    b = html.index("  })();\n", html.index("box.addEventListener('keydown'", a)) + len("  })();\n")
    html = html[:a] + WATCH_JS.lstrip('\n') + html[b:]
    ww = (HERE / 'ww-duxford.html').read_text(encoding='utf8')
    return one(html, '<!-- =========================================================\n     ONE LONG PAGE ADD-ON',
               ww + '<!-- =========================================================\n     ONE LONG PAGE ADD-ON', 'watch styles')


def facilities(html):
    # Duxford: a Food & drink block with a big photo, then the boxes, the traders, and the accordions.
    i, j = block(html, '    <div class="fac boxes">\n', '    </div>\n    <ukag-show-traders data-show="ayr"', 'facilities boxes')
    inner = html[i + len('    <div class="fac boxes">\n'):j - len('    </div>\n    <ukag-show-traders data-show="ayr"')]
    items = [x for x in re.split(r'\s*<div class="reveal">', inner) if x.strip()]
    assert len(items) == 4 and 'Food &amp; drink' in items[0], 'facilities: unexpected boxes'
    food = items[0]
    m = re.match(r'(<figure class="fimg">.*?</figure>)<h3>Food &amp; drink</h3>(.*)</div>\s*$', food, re.S)
    assert m, 'facilities: food box'
    fig = m.group(1).replace('<figure class="fimg">', '<figure class="food-main">', 1).replace('<img ', '<img class="photo" ', 1)
    food_html = ('    <div class="food reveal">\n      ' + fig + '\n      <div class="food-text">\n        <h3>Food &amp; drink</h3>\n        '
                 + m.group(2).strip() + '\n      </div>\n    </div>\n\n')
    rest = [items[2], items[3], items[1]]   # Toilets, Shade and seating, Kids' activities
    assert rest[2].lstrip().startswith('<h3>Kids&rsquo; activities</h3>'), 'facilities: kids box'
    # the Kids' activities box had no photo; it gets Jack's wingwalker photo, like the photos on the other boxes
    rest[2] = ('<figure class="fimg"><img data-k="stearman" alt="" loading="lazy"><figcaption>A Boeing Stearman with a wingwalker '
               'standing on top.</figcaption></figure>' + rest[2].lstrip())
    boxes = '    <div class="fac boxes reveal">\n' + ''.join('      <div>' + x.strip().rstrip() + '\n' for x in rest) + '    </div>\n'
    html = html[:i] + food_html + boxes + html[j - len('    <ukag-show-traders data-show="ayr"'):]
    # the small Comfort, Family and Camera lists are left out: the Duxford page does not have them,
    # and most of the same things are in the Bring list in Plan your day (listed as left out for Jack).
    i, j = block(html, '    <div class="pack boxes reveal">\n', '    </div>\n', 'facilities pack boxes')
    return html[:i] + html[j:]


CSS = """
/* Round 2 (Jack, 22 Nov 2026): the Duxford page's own styles for the Food & drink block and the
   "Search everything nearby" box (copied from previews/duxford-new-design-src/live-source.html) */
.food{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:var(--gap);margin-bottom:var(--gap)}
.food-main{margin:0;background:var(--mist)}
.food-main img.photo{height:auto;aspect-ratio:16/9}
.food-main figcaption,.expect figcaption{padding:12px 16px;font-family:"Barlow",sans-serif;font-weight:500;font-size:15px;line-height:22px;color:var(--navy)}
.food-text{background:var(--navy);color:#fff;padding:26px 28px}
.food-text h3{color:#fff;text-transform:none;font-size:30px;margin-bottom:8px}
.food-text p{color:#D8E3EC}
.food-list{list-style:none;display:grid;gap:4px;margin-top:14px}
.food-list li{background:rgba(255,255,255,.06);padding:10px 14px;font-size:15px;line-height:23px;color:#D8E3EC}
.food-list b{color:#fff}
.busbar{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:var(--gap);background:var(--teal-wash)}
.stay-search{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px 32px;background:var(--navy);color:#fff;padding:24px 28px;margin-bottom:8px}
.stay-search h3{color:#fff;font-size:26px}
.stay-search p{color:#D8E3EC;margin-top:4px}
.stay-links{display:flex;gap:10px;flex-wrap:wrap}
.stay-links .btn.ghost-n{background:transparent;color:#fff;border-color:#fff}
.stay-links .btn.ghost-n:hover{background:#fff;color:var(--navy)}
/* Round 2: as on the Duxford page */
html.nz body main:not(#nz0):not(#nz1):not(#nz2):not(#nz3) #facilities .food .food-text > p:first-of-type:last-child{background:none!important;border-left:0!important;padding:0!important}
html.nz body main:not(#nz0):not(#nz1):not(#nz2):not(#nz3) #facilities .fac.boxes{grid-template-columns:repeat(3,minmax(0,1fr))!important;margin-top:56px!important}
@media (max-width:820px){html.nz body main:not(#nz0):not(#nz1):not(#nz2):not(#nz3) #facilities .fac.boxes{grid-template-columns:1fr 1fr!important}}
@media (max-width:560px){html.nz body main:not(#nz0):not(#nz1):not(#nz2):not(#nz3) #facilities .fac.boxes{grid-template-columns:1fr!important}}
html.nz body #travel .gt-facts .xd-kp-h span + span{display:none!important}
"""


def apply(html):
    for step in (overview, stay, days, watch, facilities):
        html = step(html)
    return html
