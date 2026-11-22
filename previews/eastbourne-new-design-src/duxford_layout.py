"""Round 2 (Jack, 22 Nov 2026): the Eastbourne page built in the Duxford template.

Same sections in the same order as Duxford, the same blocks and markup inside each section, and only Eastbourne's
own words, facts and photos. Old Eastbourne parts that Duxford does not have are left out (listed in LEFT_OUT),
except Seafront information, which Jack asked to keep as an extra section at the end.

Every edit is a plain text change on the page's own HTML, checked with an assert, so the build stops if the live
page changes under it. The text the visitor reads is moved, never retyped, apart from the few labels noted below.
"""
import re

# Shown in the build output and listed in the README, so Jack can ask for any of them back.
LEFT_OUT = [
    "RAF Village section (old Eastbourne section; Duxford has no such section). Its overview band stays, as Duxford has the same band.",
    "Keep Airbourne free section (old Eastbourne section). The Supporting the show answer in Food and facilities stays.",
    "Pick your day: Away from the show cards (Beachy Head, Seven Sisters, The Redoubt Fortress, The South Downs)",
    "Pick your day: The seafront after dark panel and the 2026 evenings list",
    "Food and facilities: the Comfort, Family and Camera packing lists",
    "Where to watch: the old spot board, and its Plan my day here buttons",
    "Duxford blocks with no Eastbourne facts: the 2027 calendar, How arrival works, the line-up show picker, "
    "Sun at each show, the Photographers' map, Outside the fence note, What to expect on the day photo cards, "
    "the four photo boxes under the food panel, Top ten things to take, Search everything nearby",
    "Duxford sections with no Eastbourne facts: Flightline walk, Eastbourne's story, Experience flights",
]

PIN = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7z" '
       'fill="currentColor"/><circle cx="12" cy="9" r="2.6" fill="#13293C"/></svg>')


def one(html, old, new, what):
    assert html.count(old) == 1, "%s: expected once, found %d" % (what, html.count(old))
    return html.replace(old, new, 1)


def cut(html, start, what):
    """Remove one panel section, from its opening tag to its own closing tag."""
    i = html.find(start)
    assert i >= 0, what
    j = html.find("</section>", i)
    assert html[i + 10:j].count("<section") == 0, what + ": nested section"
    j += len("</section>")
    while html[j:j + 1] == "\n":
        j += 1
    return html[:i] + html[j:]


def section(html, sid):
    """(start, end) of a panel section's own text."""
    i = html.find('<section class="panel" id="%s"' % sid)
    assert i >= 0, sid
    j = html.find("</section>", i)
    return i, j


def apply(html):
    # ---------------------------------------------------------------- the sections
    # Pick your day sits where Duxford's Pick your show sits, under Duxford's id, so the same styles apply to it.
    html = one(html, '<button class="tab" role="tab" id="t-weekend" aria-controls="weekend"',
               '<button class="tab" role="tab" id="t-days" aria-controls="days"', "weekend tab")
    html = one(html, '<section class="panel" id="weekend" role="tabpanel" aria-labelledby="t-weekend"',
               '<section class="panel" id="days" role="tabpanel" aria-labelledby="t-days"', "weekend section")
    html = one(html, "DESC={weekend:", "DESC={days:", "weekend description")
    html = one(html, "weekend:P+'<rect", "days:P+'<rect", "weekend icon")
    html = one(html, "weekend:['fighter','Spitfire']", "days:['fighter','Spitfire']", "weekend fold aircraft")
    assert not re.search(r"""(id|aria-controls|aria-labelledby|data-goto)=["'](t-)?weekend["']""", html), "weekend id left"

    # Old Eastbourne sections that Duxford does not have
    for sid, label in (("village", "RAF Village"), ("support", "Keep Airbourne Free")):
        html = cut(html, '<section class="panel" id="%s"' % sid, sid)
        html = one(html, '\n      <button class="tab" role="tab" id="t-%s" aria-controls="%s" aria-selected="false" tabindex="-1">%s</button>'
                   % (sid, sid, label), "", sid + " tab")
        # links to them elsewhere keep their words, as plain text
        html = one(html, '<button type="button" class="inlink" data-goto="%s">%s</button>' % (sid, label), label, sid + " link")

    # ---------------------------------------------------------------- Overview
    # Duxford: a photo in the intro, and the Where next boxes on their own row under the intro and key details.
    m = re.search(r'(\n      <div class="jump boxes">\n(?:        <button data-goto="[a-z]+"><strong>[^<]+</strong><em>[^<]+</em></button>\n){4}      </div>)\n    </div>\n    <div class="band reveal">', html)
    assert m, "overview jump boxes"
    jump = m.group(1).replace('<div class="jump boxes">', '<div class="jump boxes reveal">').replace("\n  ", "\n")
    html = html[:m.start()] + "\n    </div>" + jump + '\n    <div class="band reveal">' + html[m.end():]
    old = "as this has always worked for me.</p>\n      </div>\n      <aside class=\"ov-side reveal\">"
    html = one(html, old, old.replace("</p>\n      </div>",
               '</p>\n        <figure class="pic reveal"><img loading="lazy" decoding="async" class="photo" data-k="beach" alt="">'
               "<figcaption>Busy shingle beach and promenade on airshow day.</figcaption></figure>\n      </div>"), "overview photo")

    # ---------------------------------------------------------------- Getting there: the topic heading above the explorer
    old = ('    <div class="wrap explore-grid">\n      <aside class="explore-side">\n        <h2>Choose a topic</h2>\n'
           '        <p>Pick a train, bus, road or parking option and I’ll show you the planning information and where it is on Google Maps.</p>\n')
    new = ('    <div class="wrap">\n      <div class="explore-head reveal">\n        <h2>Choose a topic</h2>\n'
           '        <p>Pick a train, bus, road or parking option and I’ll show you the planning information and where it is on Google Maps.</p>\n'
           '      </div>\n      <div class="explore-grid">\n      <aside class="explore-side">\n')
    html = one(html, old, new, "explore head")
    i = html.find('<section class="explore" id="explore"')
    j = html.find("</section>", i)
    assert html[j - 14:j] == "\n    </div>\n  ", "explore end"
    html = html[:j] + "  </div>\n  " + html[j:]

    # ---------------------------------------------------------------- Photography: Duxford opens with a wide photo
    old = "so I have found reach matters more here.</p>\n    </div>\n"
    html = one(html, old, old + '    <figure class="pic wide reveal"><img loading="lazy" decoding="async" class="photo" data-k="typhoon" alt="">'
               "<figcaption>RAF Typhoon climbing away in full afterburner.</figcaption></figure>\n", "photography photo")

    # ---------------------------------------------------------------- Where to watch: Duxford's tabs and spot card
    html = one(html, '<div class="ww sw-tabs reveal" id="wwTabs"></div>',
               '<section class="ww reveal" id="wwMap" aria-label="Where to watch, on the map">\n'
               '      <div class="ww-head"><div><h3>Pick your spot, <em>on the map</em></h3></div></div>\n'
               '      <div class="sw-tabs ww-tabs"></div>\n    </section>', "where to watch box")
    html = one(html, "var box=document.getElementById('wwTabs'); if(!box) return;",
               "var box=document.querySelector('#wwMap .ww-tabs'); if(!box) return;\n"
               "    var C=['#32B4AF','#00A6E2','#2BA84A','#D74949','#6950A1'],T=['#E3F5F4','#E0F3FB','#E5F5E9','#FBE8E8','#EEEAF6'];",
               "where to watch script")
    old_tab = ("return '<button type=\"button\" role=\"tab\" id=\"wwt-'+x.id+'\" aria-controls=\"wwp-'+x.id+'\" aria-selected=\"'+(i===0)+'\" "
               "tabindex=\"'+(i?-1:0)+'\" data-i=\"'+i+'\"><span class=\"xd-tt-ic\">'+PIN+'</span>'+esc(x.short)+'</button>';")
    new_tab = ("return '<button type=\"button\" role=\"tab\" class=\"ww-in\" id=\"ww-eastbourne-t'+i+'\" aria-controls=\"ww-eastbourne-p'+i+'\" "
               "aria-selected=\"'+(i===0)+'\" tabindex=\"'+(i?-1:0)+'\" data-i=\"'+i+'\" style=\"--c:'+C[i%5]+'\"><span class=\"xd-tt-ic\">'+PIN+'</span>'+esc(x.short)+'</button>';")
    html = one(html, old_tab, new_tab, "where to watch tabs")
    a = html.find("      return '<div class=\"xd-tt-board ww-board\"")
    b = html.find("    }).join('');", a)
    assert a > 0 and b > a, "where to watch boards"
    html = html[:a] + (
        "      return '<div class=\"ww-panel ww-in\" role=\"tabpanel\" id=\"ww-eastbourne-p'+i+'\" aria-labelledby=\"ww-eastbourne-t'+i+'\" "
        "style=\"--c:'+C[i%5]+';--t:'+T[i%5]+'\"'+(i?' hidden':'')+'>'\n"
        "        +'<div class=\"ww-txt\"><h4>'+esc(x.name)+'</h4><p class=\"ww-where\">'+esc(x.tag)+'</p><p>'+x.text+'</p><p>'+x.more+'</p>'\n"
        "        +'<ul class=\"ww-facts\">'+x.rows.map(function(r){return '<li><b>'+esc(r[0])+'</b>'+esc(r[1])+'</li>';}).join('')+'</ul>'\n"
        "        +'<a class=\"ww-go\" href=\"https://www.google.com/maps/search/?api=1&amp;query='+ll+'\" target=\"_blank\" rel=\"noopener\">"
        "<span class=\"xd-tt-ic\">'+PIN+'</span><span>Open in Google Maps</span><i aria-hidden=\"true\">→</i></a></div>'\n"
        "        +'<div class=\"ww-map\"><iframe loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\" title=\"Map of '+esc(x.name)+'\" "
        "src=\"https://www.google.com/maps?q='+ll+'&amp;z=16&amp;output=embed\" style=\"border:0;width:100%;aspect-ratio:16/10\"></iframe></div>'\n"
        "        +'</div>';\n") + html[b:]
    html = one(html, "box.innerHTML='<div class=\"xd-tt-tabs\" role=\"tablist\" aria-label=\"Where to watch\">'",
               "box.innerHTML='<div class=\"xd-tt-tabs\" role=\"tablist\" aria-label=\"Viewing spots\">'", "where to watch tablist")

    # ---------------------------------------------------------------- Food and facilities
    # Duxford: the Food and drink panel (photo, words and boxes), then the photo band. Eastbourne's four boxes fill them.
    i, j = section(html, "facilities")
    s = html[i:j]
    m = re.search(r'<div class="fac boxes">\n'
                  r'      <div class="reveal"><figure class="fimg">(<img [^>]+>)(<figcaption>[^<]+</figcaption>)</figure><h3>(Food &amp; drink)</h3>(<p>[^<]+</p>)</div>\n'
                  r'      <div class="reveal"><h3>(Kids&rsquo; activities)</h3><p>([^<]+)</p></div>\n'
                  r'      <div class="reveal"><figure class="fimg">(<img [^>]+>)(<figcaption>[^<]+</figcaption>)</figure><h3>(Toilets)</h3>((?:<p>[^<]+</p>)+)</div>\n'
                  r'      <div class="reveal"><h3>(The beach)</h3><p>([^<]+)</p></div>\n'
                  r'    </div>', s)
    assert m, "food and facilities boxes"
    g = m.groups()
    food = ('<div class="food reveal">\n'
            '      <figure class="food-main">%s%s</figure>\n'
            '      <div class="food-text">\n        <h3>%s</h3>\n        %s\n'
            '        <ul class="food-list">\n          <li><b>%s</b> %s</li>\n          <li><b>%s</b> %s</li>\n        </ul>\n'
            '      </div>\n    </div>\n'
            '    <div class="busbar reveal">\n'
            '      <figure class="busfig">%s%s</figure>\n'
            '      <div class="busbar-text">\n        <h3>%s</h3>\n        %s\n      </div>\n    </div>'
            % (g[0], g[1], g[2], g[3], g[4], g[5], g[10], g[11], g[6], g[7], g[8], g[9]))
    s = s[:m.start()] + food + s[m.end():]
    p = re.search(r'\n    <div class="pack boxes reveal">\n(?:      <ul>.*?</ul>\n){3}    </div>', s)
    assert p, "packing lists"
    s = s[:p.start()] + s[p.end():]
    html = html[:i] + s + html[j:]

    # ---------------------------------------------------------------- Pick your day
    # Duxford: key facts, the day cards, then the picker with one box per question, Jack's tip and the official site.
    i, j = section(html, "days")
    s = html[i:j]
    glass = re.findall(r'<div(?: class="hl")?><span>([^<]+)</span><b>([^<]+)</b></div>',
                       html[html.find('<div class="cg-glass">'):html.find('<!-- sx-checked -->')])
    assert len(glass) == 4, "hero facts"
    facts = '<div class="fl-facts">' + "".join(
        '<div%s><span>%s</span><b>%s</b></div>' % (' class="pu"' if k % 2 else "", a, b) for k, (a, b) in enumerate(glass)) + "</div>"
    tool = re.search(r'    <div class="wk-tool sw-tabs sw-pick">\n      <div class="wk-q">\n(.*?)      </div>\n'
                     r'      (<div class="wk-out" id="wkOut" aria-live="polite"></div>)\n    </div>\n', s, re.S)
    assert tool, "day picker"
    qs = re.findall(r'        (<p class="pp-l">.*?</p>\n        <div class="pp-opts xd-tt-tabs" data-wk="[a-z]+">\n.*?\n        </div>)\n',
                    tool.group(1), re.S)
    assert len(qs) == 3, "day picker questions"
    picker = ('    <div class="wk-tool sw-tabs sw-pick">\n' + "".join(
        '      <div class="wk-q">\n  %s\n      </div>\n' % q.replace("\n", "\n  ") for q in qs) +
        "      " + tool.group(2) + "\n    </div>\n")
    days = re.search(r'    <h3 class="fl-h">Which Days To Pick</h3>\n    <div class="wk-days">\n.*?\n    </div>\n', s, re.S)
    away = re.search(r'\n    <h3 class="fl-h">Away From The Show</h3>\n    <div class="sf-cards">\n.*?\n    </div>\n', s, re.S)
    eve = re.search(r'\n    <div class="wk-eve">\n.*?\n      </aside>\n    </div>\n', s, re.S)
    tip = re.search(r'\n    <div class="ns-note"><b>Jack&rsquo;s tip</b>.*?</div>\n', s, re.S)
    assert days and away and eve and tip, "pick your day blocks"
    head_end = s.find("    </div>\n", s.find('<div class="panel-head')) + len("    </div>\n")
    s = (s[:head_end] + "    " + facts + "\n" + days.group(0) + picker + tip.group(0).lstrip("\n")
         + '    <div class="sp-links"><a href="https://www.eastbourneairshow.com" target="_blank" rel="noopener"><b>Official site</b>'
         "<span>Airbourne official site</span></a></div>\n  </div>\n\n")
    html = html[:i] + s + html[j:]

    # ---------------------------------------------------------------- Getting there jump strip
    # The page has no On the day and getting home box (.pbx), so its jump button led nowhere. Dropped (22 Nov 2026),
    # so the strip reads Ways in, Fares, Questions.
    html = one(html, "var JUMPS = [['Ways in', '#explore'], ['Fares', '#tpFares'], ['On the day and getting home', '.pbx'], ['Questions', '#travel .acc']];",
               "var JUMPS = [['Ways in', '#explore'], ['Fares', '#tpFares'], ['Questions', '#travel .acc']];", "jump strip")
    assert 'class="pbx' not in html, "the page now has an On the day box: put its jump button back"

    # ---------------------------------------------------------------- Where to stay: the lists sit in one box, as on Duxford
    i, j = section(html, "stay")
    s = html[i:j]
    a = s.find('    <div class="stay-group reveal">')
    b = s.find('    <p class="stay-note">')
    assert a > 0 and b > a, "stay groups"
    s = s[:a] + '    <div id="stayGroups">\n' + s[a:b].rstrip("\n") + "\n    </div>\n\n" + s[b:]
    html = html[:i] + s + html[j:]
    return html


def transport(html, dux, fares):
    """Getting there, the three blocks on every page (round 2 brief, 22 Nov 2026, 20:15 and 20:30).
    Compare driving options (#cdo) and the car parks board (#cpk) are already on the Eastbourne page and stay as they are.
    Added here: the Fares and Save money board (fares.html, the Clacton board with Eastbourne's own 2026 prices) and
    Duxford's dark train route header on the train topic, filled with Eastbourne's own train facts."""
    # ---- Fares and Save money board, with the hidden Ways in board its script needs. The page's own transport script
    #      moves it after Choose a topic, and its Fares jump button points at it.
    for fact in ("£5 adult day, £2.50 child, £12 family", "£40 booked ahead, £45 on the day", "£22 booked ahead, £27 on the day",
                 "adult £5, under 16s £3, or a family ticket for £10", "Concessionary passes weren’t accepted on it.",
                 "On the day each one cost £5 more, and a booking fee applies when you book ahead.",
                 "Booking ahead saved £5 per car in 2026, and the price included a souvenir programme and pin badge while stocks lasted.",
                 "Motorbikes can park free on street at right angles to the kerb.", "it doesn’t cost a penny to watch",
                 "Stagecoach buses in the Eastbourne Dayrider zone"):
        assert fact in html, "fares fact: " + fact
    html = one(html, '\n\n  <div class="wrap"><section class="cdo reveal" id="cdo"',
               "\n\n" + fares + '\n\n  <div class="wrap"><section class="cdo reveal" id="cdo"', "fares board")

    # ---- Duxford's train route header (trlStyle and its script), as on the Wales page, with Eastbourne's own train facts:
    #      the Train to Eastbourne topic and the first Saturday train in the page's train times (07:24 from London Victoria).
    flat = re.sub(r"\s+", " ", html)
    for fact in ('"07:24",       "London Victoria to Eastbourne",       "Southern, arrives 08:49 (08:51 Thursday and Friday)"',
                 '"Every 30 min",       "From London Victoria and Brighton",       "About 1 hour 25 minutes from Victoria, 40 minutes from Brighton"',
                 "{id:'rail',name:'Train to Eastbourne'",
                 "Eastbourne station is in the town centre. Southern runs direct trains from London Victoria, Gatwick Airport, Lewes and Hastings, and from Brighton, some with a change at Lewes.",
                 "It’s around 10 to 15 minutes on foot.", "From the National Rail timetable valid 17 May to 12 December 2026.",
                 "https://www.ukairshowguide.co.uk/train-to-eastbourne"):
        assert re.sub(r"\s+", " ", fact) in flat, "train fact: " + fact[:60]
    ta = dux.index('<style id="trlStyle">')
    tz = dux.index("</style>", ta) + len("</style>")
    sa = dux.index('<script id="trlScript-dux">')
    sz = dux.index("</script>", sa) + len("</script>")
    trl = dux[sa:sz]
    h0 = trl.index("  var H={")
    h1 = trl.index("  function cur()")
    eb_h = ("  var H={\n"
            "    'rail':hero({to:'Eastbourne',board:'EASTBOURNE',dep:'07:24',arr:'08:49',via:'From London Victoria',\n"
            "      p:'Eastbourne station is in the town centre. Southern runs direct trains from London Victoria, Gatwick Airport, Lewes and Hastings, and from Brighton, some with a change at Lewes.',\n"
            "      kd:[['How often','Every 30 minutes from London Victoria and Brighton'],['Get off at','Eastbourne',1],['Then','Walk to the Western Lawns, 10 to 15 min'],['From London','About 1 hour 25 minutes'],['Run by','Southern']],\n"
            "      jr:'London Victoria to Eastbourne. These are Saturday times from the 2026 timetable, so check again nearer the show.',\n"
            "      from:'London Victoria',at:'Eastbourne',mid:'Southern<br>1h 25m'})\n"
            "  };\n")
    trl = trl[:h0] + eb_h + trl[h1:]
    trl = trl.replace('<script id="trlScript-dux">', '<script id="trlScript-eastbourne">', 1)
    trl = trl.replace("/* Train route header on the Duxford train topics, the same design as the Clacton train topic (9 Nov) */",
                      "/* Train route header on the train topic, the Duxford design, with the Eastbourne train facts */", 1)
    trl = one(trl, "https://www.ukairshowguide.co.uk/train-to-duxford", "https://www.ukairshowguide.co.uk/train-to-eastbourne", "train link")
    html = one(html, '<style id="jx-css-dux">', dux[ta:tz] + "\n" + trl + "\n" + '<style id="jx-css-dux">', "train route header")
    return html
