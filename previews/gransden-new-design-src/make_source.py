#!/usr/bin/env python3
"""Round 2 (Jack, 22 Nov 2026): the Little Gransden page built IN the Duxford template.

Writes live-source.html: the Little Gransden page laid out section by section like the Duxford page
(previews/duxford-new-design-src/live-source.html), with only Little Gransden's own content in it.
build.py then adds the new design on top, exactly as it does for Duxford.

Content comes only from old-page.html (the Little Gransden page as it was before the new design).
Nothing is retyped from memory and no Duxford fact is copied in. Sections and blocks Duxford does not
have are taken out, and Duxford blocks Little Gransden has no facts for are left out. Both lists are in
LEFT_OUT at the bottom, printed when it runs, and in the README.

The method is the same as the Cosford round 2 build (previews/cosford-new-design-src/make_source.py).

Run:  python3 previews/gransden-new-design-src/make_source.py   (build.py runs it first anyway)
"""
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OLD = HERE / "old-page.html"                          # Little Gransden's page before the new design (content source)
DUX = ROOT / "previews" / "duxford-new-design-src" / "live-source.html"   # the template
OUT = HERE / "live-source.html"

BLOB = re.compile(r"data:(?:image|application|font)/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+")


class Page:
    def __init__(self, text):
        self.blobs = []
        self.s = BLOB.sub(self._keep, text)
        self.orig = self.s   # the page as read, for checking that every reused line is really on it

    def _keep(self, m):
        self.blobs.append(m.group(0))
        return "@@B%d@@" % (len(self.blobs) - 1)

    def add_blob(self, data):
        self.blobs.append(data)
        return "@@B%d@@" % (len(self.blobs) - 1)

    def text(self):
        return re.sub(r"@@B(\d+)@@", lambda m: self.blobs[int(m.group(1))], self.s)

    def rep(self, old, new, count=1):
        n = self.s.count(old)
        assert n == count, "expected %d, found %d: %s" % (count, n, old[:120])
        self.s = self.s.replace(old, new)

    def cut(self, start, end, new="", inclusive_end=True):
        """Replace from the unique marker start up to and including the first end after it."""
        assert self.s.count(start) == 1, "start not unique: " + start[:100]
        i = self.s.index(start)
        j = self.s.index(end, i) + (len(end) if inclusive_end else 0)
        self.s = self.s[:i] + new + self.s[j:]

    def block(self, start, end):
        i = self.s.index(start)
        return self.s[i:self.s.index(end, i) + len(end)]

    def panel(self, pid):
        """The whole <section class="panel" id=pid> ... </section>, nested sections included."""
        m = re.search(r'<section class="panel[^"]*" id="%s"' % pid, self.s)
        assert m, pid
        return self._section_from(m.start())

    def _section_from(self, start):
        depth = 0
        for t in re.finditer(r"<(/?)section\b", self.s[start:]):
            depth += -1 if t.group(1) else 1
            if depth == 0:
                end = start + self.s.index(">", start + t.start()) - start + 1
                return self.s[start:end]
        raise AssertionError(start)

    def section_by(self, opening):
        assert self.s.count(opening) == 1, opening
        return self._section_from(self.s.index(opening))

    def set_panel(self, pid, new):
        old = self.panel(pid)
        self.s = self.s.replace(old, new, 1)


def script_by_id(p, sid):
    return p.block('<script id="%s">' % sid, "</script>")


def style_by_id(p, sid):
    return p.block('<style id="%s">' % sid, "</style>")


LEFT_OUT = []


def main():
    p = Page(OLD.read_text(encoding="utf8"))
    dux = Page(DUX.read_text(encoding="utf8"))

    sections(p)
    tabs(p)
    index_words(p, dux)
    overview(p)
    travel(p)
    lineup(p)
    watch(p, dux)
    facilities(p, dux)
    tidy(p)
    port_design(p, dux)
    st = style_by_id(p, "trlStyle")
    p.rep(st, st + "\n" + p.TRL)
    no_facts()

    OUT.write_text(p.text(), encoding="utf8")
    print("wrote", OUT.relative_to(ROOT))
    print("left out (%d):" % len(LEFT_OUT))
    for x in LEFT_OUT:
        print("  -", x)


# ---------------------------------------------------------------------------------------------
# 1. Sections Duxford does not have: Show your car or stall, The after show party, The ground show.
def sections(p):
    for pid, name in (("exhibit", "Show your car or stall"), ("party", "The after show party"), ("ground", "The ground show")):
        p.set_panel(pid, "")
        LEFT_OUT.append("Section: " + name + " (Duxford has no such section)")
    # the links to them from the other sections
    p.rep(' Take a look at <button type="button" class="inlink" data-goto="exhibit">Show Your Car Or Stall</button>.', "")
    p.rep(' Take a look at <button type="button" class="inlink" data-goto="party">The After Show Party</button>.', "")
    assert ' Fancy putting yours in? Take a look at <button type="button" class="inlink" data-goto="exhibit">' not in p.s   # it was in The ground show
    assert 'data-goto="exhibit"' not in p.s and 'data-goto="party"' not in p.s and 'data-goto="ground"' not in p.s
    # their script (it only drives the car show form and the party planner)
    old = script_by_id(p, "gransden-js")
    assert "exOpts" in old and "ptOpts" in old
    p.rep(old, "")


# 2. The tab strip: Duxford's names and order, without the sections Little Gransden has no facts for.
TABS = [("overview", "Overview"), ("matchcheck", "Quick checker"), ("travel", "Getting there &amp; parking"),
        ("scores", "How it scores"), ("compare", "How it compares"), ("lineup", "Aircraft line-up"),
        ("whatyousee", "What you'll see"), ("stay", "Where to stay"), ("timeline", "Plan your day"),
        ("dayruns", "How the day runs"), ("help", "Help On Show Days"), ("watch", "Where to watch"),
        ("photo", "Photography"), ("kids", "Kids' Corner"), ("postcard", "Make A Postcard"),
        ("facilities", "Food &amp; facilities")]


def tabs(p):
    i = p.s.index('<div class="tablist" role="tablist">')
    j = p.s.index("</div>", i)
    rows = []
    for n, (tid, name) in enumerate(TABS):
        rows.append('      <button class="tab" role="tab" id="t-%s" aria-controls="%s" aria-selected="%s"%s>%s</button>'
                    % (tid, tid, "true" if n == 0 else "false", "" if n == 0 else ' tabindex="-1"', name))
    p.s = p.s[:i] + '<div class="tablist" role="tablist">\n' + "\n".join(rows) + "\n    " + p.s[j:]


# 3. The words under each name in the guide index. The old copy still had Clacton's words in it (the
#    seafront, the beach, Thursday or Friday), so this takes Duxford's script and puts in wording that only
#    names what each Little Gransden section holds.
def index_words(p, dux):
    d = script_by_id(dux, "ind-js")
    D = ("var D={overview:'The show at a glance',matchcheck:'Six quick questions to see if it suits you',"
         "travel:'Trains, buses, roads and parking',scores:'How Little Gransden rates for families and enthusiasts',"
         "compare:'How it stacks up against other UK shows',lineup:'Confirmed aircraft and display teams',"
         "whatyousee:'What the flying looks like from the crowd line',stay:'Hotels and campsites nearby',"
         "timeline:'Your day planner and the weather',dayruns:'How a show day runs, hour by hour',"
         "help:'First aid, lost children and stewards',watch:'The best spots along the crowd line',"
         "photo:'Camera settings and where to stand',kids:'Things the children will love',"
         "postcard:'Make a postcard from your day',facilities:'Food, toilets and access'};")
    d2 = re.sub(r"var D=\{.*?\};", lambda m: D, d, count=1, flags=re.S)
    assert d2 != d
    p.rep(script_by_id(p, "ind-js"), d2)


# 4. Overview: on Duxford the Latest news comes last in the Overview, after the intro, the calendar,
#    Where next and the museum box. On the old Gransden page it came first.
def overview(p):
    ov = p.panel("overview")
    k = ov.index('id="airshowNews"')
    start = ov.rindex("\n\n    <!-- =====", 0, k)   # the news block's own comment, then its style
    assert "AIRSHOW NEWS FEED" in ov[start:k]
    # the news block ends with its own script
    k = ov.index('id="airshowNews"')
    s_end = ov.index("</script>", k) + len("</script>")
    news = ov[start:s_end]
    rest = ov[:start] + ov[s_end:]
    # put it at the end of the panel's wrap (before the wrap's closing div)
    end = rest.rindex("\n  </div>\n</section>")
    p.set_panel("overview", rest[:end] + news + rest[end:])


# 5. Getting there: Duxford's arrival block is three steps and a note. The old page had a second row of
#    two photos under it. Duxford's parking block (#cpk) is Duxford's own parking facts; Little Gransden's
#    live page has no parking block, so there is none here.
def travel(p):
    m = re.search(r'\n      <div class="arrive-grid reveal" style="margin-top:28px">.*?\n      </div>', p.s, re.S)
    assert m and m.group(0).count("<figure") == 2
    p.rep(m.group(0), "")
    LEFT_OUT.append("Getting there, How arrival works: the second row of two photos, Show day parking and Through the gate (Duxford's arrival block is three steps and a note)")
    # Key places heading: plain, as on Duxford (Duxford has no place tag beside it)
    p.rep("'<div class=\"xd-kp-h\"><span style=\"background:none;color:inherit;padding:0;font-size:inherit;font-family:inherit\">Key places</span>' + (place ? '<span>' + esc(place) + '</span>' : '') + '</div>'",
          "'<div class=\"xd-kp-h\"><span style=\"background:none;color:inherit;padding:0;font-size:inherit;font-family:inherit\">Key places</span></div>'")
    train_header(p)
    # Jack, 22 Nov 2026 (rollout brief, 20:15 and 20:30): every page gets Compare driving options (#cdo), the car parks
    # board (#cpk) and the Fares and save money board (#tpFares), each from the show's own facts. Little Gransden has
    # one car park on site with no price, and no transport fares on its page, so none of the three fits. The jump strip's
    # Fares button and its On the day and getting home button point at blocks the page does not have (.pbx is not on
    # Duxford either), so they go rather than stay as dead buttons.
    p.rep("var JUMPS = [['Ways in', '#explore'], ['Fares', '#tpFares'], ['On the day and getting home', '.pbx'], ['Questions', '#travel .acc']];",
          "var JUMPS = [['Ways in', '#explore'], ['Questions', '#travel .acc']];")
    LEFT_OUT.append("Getting there: Compare driving options (one car park on site, with no price on the page)")
    LEFT_OUT.append("Getting there: the Fares and save money board and its hidden Ways in board (no train, bus, taxi, coach or parking prices on the page)")
    LEFT_OUT.append("Getting there: the Fares and the On the day and getting home buttons in the jump strip (both pointed at blocks the page does not have)")
    LEFT_OUT.append("Getting there: Duxford's parking block (permits, car parks and opening times). Little Gransden's live page has no parking block, and its parking is covered in the topics")


# The train route header on the three train topics, as on Duxford's (same markup and styles, the trlStyle block
# is ported in port_design), with Little Gransden's own facts. The Gransden page gives no example train times, so
# the board and the journey line show the station and the leg without times, rather than made up ones.
TRL_JS = r"""<script id="trlScript-gra">
/* Train route header on the Little Gransden train topics, the same design as Duxford's (Jack, 22 Nov 2026).
   Every fact is from the Little Gransden topics themselves. No example times: the page doesn't give any. */
(function(){
  var GO='<a class="trl-go" href="https://www.ukairshowguide.co.uk/train-to-little-gransden" target="_top"><span><b>See every train and live times</b><small>Your station, platforms, changes and the way home</small></span><i aria-hidden="true">→</i></a>';
  function kd(rows){return '<div class="trl-kd"><h4>Key details</h4>'+rows.map(function(r){return '<div'+(r[2]?' class="hl"':'')+'><span>'+r[0]+'</span><b>'+r[1]+'</b></div>';}).join('')+'</div>';}
  function hero(o){
    return '<div class="trl-top"><div class="trl-hero"><div><span class="trl-tag">Train route</span><h3>Trains to <span>'+o.to+'</span></h3><p>'+o.p+'</p></div>'
      +'<div><div class="trl-board" aria-label="Destination board"><b><span>'+o.board+'</span></b><small>'+o.via+'</small></div>'+kd(o.kd)+'</div></div>'
      +'<div class="trl-jr"><div class="trl-jr-h"><b>Your journey</b><span>'+o.jr+'</span></div>'
      +'<div class="trl-line"><div class="trl-stop"><i></i><b>'+o.from+'</b><small>'+o.fromNote+'</small></div><div class="trl-mid">'+o.mid+'</div><div class="trl-stop"><i></i><b>'+o.at+'</b><small>'+o.atNote+'</small></div></div></div>'
      +GO+'</div>';
  }
  var H={
    'rail-stneots':hero({to:'St Neots',board:'ST NEOTS',via:'Thameslink, one of the nearest stations',
      p:'St Neots is one of the two nearest stations, on the Thameslink line between London, Stevenage and Peterborough. It’s about 9 miles by road from the airfield, and there’s no show shuttle, so I’d take a taxi from here.',
      kd:[['Run by','Thameslink'],['Get off at','St Neots',1],['Then','Taxi, about 15 to 20 minutes, book ahead'],['Bus','No useful Sunday service']],
      jr:'I couldn’t find 2027 Sunday train times yet, and timetables change. I would check National Rail for your journey home before you travel, and book your return taxi to match.',
      from:'St Neots',fromNote:'Thameslink',at:'The airfield',atNote:'Rural taxis are limited, so book ahead',mid:'Taxi<br>about 15 to 20 minutes'}),
    'rail-sandy':hero({to:'Sandy',board:'SANDY',via:'Thameslink, from London',
      p:'Sandy is also on the Thameslink line from London, a little further south. It’s about 8 miles from the airfield, so I would take a taxi from here too.',
      kd:[['Run by','Thameslink'],['Get off at','Sandy',1],['Then','Taxi, about 20 minutes'],['To the airfield','About 8 miles']],
      jr:'It’s a good idea to check the time of your train home on National Rail before you set off.',
      from:'Sandy',fromNote:'Thameslink',at:'The airfield',atNote:'About 8 miles',mid:'Taxi<br>about 20 minutes'}),
    'rail-cam':hero({to:'Cambridge',board:'CAMBRIDGE',via:'Many operators, further away',
      p:'Cambridge has the most trains, with Greater Anglia, Thameslink, Great Northern and CrossCountry services, but it’s about 15 miles from the airfield. A taxi takes around 30 minutes.',
      kd:[['Run by','Greater Anglia, Thameslink, Great Northern, CrossCountry'],['Get off at','Cambridge',1],['Then','Taxi, around 30 minutes'],['To the airfield','About 15 miles']],
      jr:'This may work for you if you’re coming from Norwich, Ipswich, Birmingham or Stansted Airport. I’d allow extra time for the taxi back, as the A428 can be busy.',
      from:'Cambridge',fromNote:'The most connections',at:'The airfield',atNote:'About 15 miles',mid:'Taxi<br>around 30 minutes'})
  };
  function cur(){var b=document.querySelector('#parkList button[aria-pressed="true"]');return b?b.dataset.id:'';}
  function apply(){
    var c=document.querySelector('#explore .xd-content'); if(!c) return;
    var id=cur(), h=H[id], t=c.querySelector(':scope > .trl-top');
    if(h){
      c.classList.add('trl');
      if(!t||t.getAttribute('data-id')!==id){
        if(t) t.remove();
        var w=document.createElement('div'); w.innerHTML=h; var top=w.firstChild; top.setAttribute('data-id',id);
        var tabs=c.querySelector(':scope > .ft-tabs');
        if(tabs) c.insertBefore(top,tabs); else c.insertBefore(top,c.firstChild);
        if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){c.classList.add('in-view');io.disconnect();}});},{threshold:.2});io.observe(top);} else c.classList.add('in-view');
      }
    } else { c.classList.remove('trl','in-view'); if(t) t.remove(); }
  }
  var busy=false;
  function sched(){ if(busy) return; busy=true; setTimeout(function(){busy=false;apply();},60); }
  var tries=0;(function wait(){var ex=document.getElementById('explore');if(ex){new MutationObserver(sched).observe(ex,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-pressed']});apply();return;} if(++tries<80) setTimeout(wait,150);})();
})();
</script>"""
TRL_FACTS = ["St Neots is one of the two nearest stations, on the Thameslink line between London, Stevenage and Peterborough. It’s about 9 miles by road from the airfield, and there’s no show shuttle, so I’d take a taxi from here.",
             "['Taxi','About 15 to 20 minutes, book ahead'],['Bus','No useful Sunday service']",
             "I couldn’t find 2027 Sunday train times yet, and timetables change. I would check National Rail for your journey home before you travel, and book your return taxi to match.",
             "Rural taxis are limited on show days, so I’d book both journeys before the day.",
             "Sandy is also on the Thameslink line from London, a little further south. It’s about 8 miles from the airfield, so I would take a taxi from here too.",
             "A taxi from Sandy takes about 20 minutes.", "It’s a good idea to check the time of your train home on National Rail before you set off.",
             "Cambridge has the most trains, with Greater Anglia, Thameslink, Great Northern and CrossCountry services, but it’s about 15 miles from the airfield. A taxi takes around 30 minutes.",
             "This may work for you if you’re coming from Norwich, Ipswich, Birmingham or Stansted Airport.", "I’d allow extra time for the taxi back, as the A428 can be busy.",
             "'The most connections, but a longer taxi ride.'", "ukairshowguide.co.uk/train-to-little-gransden"]


def train_header(p):
    for t in TRL_FACTS:
        assert t in p.orig, t
    for tid in ("{id:'rail-stneots',", "{id:'rail-sandy',", "{id:'rail-cam',"):
        assert tid in p.orig, tid
    p.TRL = TRL_JS   # added after trlStyle once that is ported (port_design)
    LEFT_OUT.append("Getting there, train topics: the example departure time on the route board and the leave and arrive times on the journey line (the Little Gransden page has no example train times)")


# 6. Aircraft line-up: Duxford has no "What flew in 2026" list under the line-up.
def lineup(p):
    sec = p.section_by('<section class="lg-past" aria-labelledby="lgPastH">')
    p.rep(sec, "")
    p.cut('<style id="lg-past-css">', "</style>")
    old = "When I last checked, no aircraft had been announced for 2027. I'll add each one here as soon as it's confirmed, and in the meantime you can take a look at what flew in 2026 below."
    p.rep(old, "When I last checked, no aircraft had been announced for 2027. I'll add each one here as soon as it's confirmed.")
    LEFT_OUT.append("Aircraft line-up: the What flew in 2026 list (15 aircraft and teams) under the 2027 line-up. Duxford has no past line-up list")


# 7. Where to watch: Duxford's section, with its heading and the photographers' map (moved here from
#    Photography, where the old page had it, as on Duxford). Duxford's map tabs need a Google map and the
#    place of each spot, which the Little Gransden page does not have, so they are left out.
def watch(p, dux):
    pm = p.section_by('<section class="pmap reveal" id="photoMap"')
    # the map's own style block sits just before it
    i = p.s.index(pm)
    st_start = p.s.rindex("<style>", 0, i)
    pre = p.s[st_start:i]
    assert pre.rstrip().endswith("</style>") and ".pmap" in pre, "photo map style not found"
    p.s = p.s[:st_start] + p.s[i + len(pm):]
    head_a = "The crowd line runs along the north side of the runway, so you face roughly south across the grass."
    head_b = "The organisers ask everyone to watch from inside the showground, as the fields around the airfield aren&rsquo;t safe during the flying, so every spot here is inside the show."
    assert head_a in p.orig and head_b in p.orig
    panel = ('<section class="panel" id="watch" role="tabpanel" aria-labelledby="t-watch" hidden>\n'
             '  <div class="wrap">\n'
             '    <div class="panel-head reveal">\n'
             '      <div><h2>Pick your <span class="sky">spot</span></h2></div>\n'
             '      <p>' + head_a + ' ' + head_b[0].upper() + head_b[1:] + '</p>\n'
             '    </div>\n\n'
             '    ' + pre.strip() + '\n    ' + pm + '\n'
             '  </div>\n'
             '</section>\n\n')
    anchor = p.s.index('<section class="panel" id="photo"')
    p.s = p.s[:anchor] + panel + p.s[anchor:]
    # Duxford shows the map drawing full width with its key. The old Gransden page hid its drawing (pmap-nomap-css);
    # it is Gransden's own map of its own spots, so it shows here as on Duxford. Flagged for Jack in the README.
    p.cut('<style id="pmap-nomap-css">', "</style>")
    LEFT_OUT.append("Where to watch: Duxford's spot tabs with a Google map for each spot (the Little Gransden page has no map or location for its spots)")
    LEFT_OUT.append("Where to watch: Duxford's photo at the end of the section (hidden on Duxford too)")


# 8. Food and facilities: Duxford's four fact boxes each have an illustration. Little Gransden's fourth box,
#    Not allowed, had none, so it takes Duxford's banned items illustration (AI made, no place in it, already
#    used the same way on the other show pages). Duxford's shuttle bar is Duxford's own site shuttle.
def facilities(p, dux):
    f = p.panel("facilities")
    m = re.search(r'<div><h3>Not allowed</h3>', f)
    assert m, "Not allowed box"
    alt = "A steward at the gate explaining to a family that their gazebo and stepladder need to go back to the car"
    dm = re.search(r'<figure class="fimg"><img src="(@@B\d+@@)" alt="%s"' % re.escape(alt), dux.s)
    assert dm
    b = p.add_blob(dux.blobs[int(dm.group(1)[3:-2])])
    fig = ('<figure class="fimg"><img src="' + b + '" alt="' + alt + '" loading="lazy"><figcaption>'
           'Anything on the banned list goes back to the car, so I would check it before you leave home. AI generated for a visual look.'
           '</figcaption></figure>')
    p.set_panel("facilities", f.replace(m.group(0), '<div>' + fig + '<h3>Not Allowed</h3>', 1))
    LEFT_OUT.append("Food and facilities: Duxford's own shuttle bar (Little Gransden has no site shuttle)")


# 9. Small parts of the old page that Duxford does not have.
def tidy(p):
    # the arrows on the section strip (Duxford's strip has none)
    p.cut('<style id="tab-slider">', "</style>")
    p.cut('<script id="tab-slider-js">', "</script>")
    # the strip wrapping onto two lines on wide screens (Duxford's stays on one line)
    p.rep("@media (min-width:900px) and (hover:hover){\n  .tabbar .tablist{flex-wrap:wrap;overflow:visible;justify-content:center;row-gap:0}\n}\n", "")


# 10. Duxford's own design blocks (styles and small scripts with no Duxford facts in them) that the old
#     Gransden page did not have. Each goes in after the nearest block the two pages share, so the styles
#     apply in the same order as on Duxford.
PORT = [
    ("style", "glass-effect"),
    ("script", "glass-effect-js"),
    ("style", "txtidx-css"), ("style", "txtidx2-css"), ("style", "txtidx3-css"), ("script", "txtidx-js"),
    ("style", "trlStyle"),
]
# Duxford photo keys in the ported scripts, swapped for Jack's Little Gransden photos
PORT_KEYS = {"glass-effect-js": [("lineup:'buchon_front',travel:'parking1',stay:'wildcat_side'",
                                  "lineup:'invader',travel:'carpark',stay:'campsite'")]}


def _blocks(s):
    out = []
    for m in re.finditer(r"<(script|style)([^>]*)>(.*?)</\1>", s, re.S):
        idm = re.search(r'id="([^"]+)"', m.group(2))
        out.append((m.group(1), idm.group(1) if idm else None, m.group(3), m.start(), m.end()))
    return out


def port_design(p, dux):
    for kind, key in PORT:
        db = _blocks(dux.s)
        hit = [b for b in db if b[0] == kind and (b[1] == key or (b[1] is None and b[2].lstrip().startswith(key.lstrip())))]
        assert len(hit) == 1, (key, len(hit))
        b = hit[0]
        whole = dux.s[b[3]:b[4]]
        assert "@@B" not in whole, key
        for a, c in PORT_KEYS.get(b[1] or "", []):
            assert whole.count(a) == 1, a
            whole = whole.replace(a, c)
        cb = _blocks(p.s)
        sig = lambda x: (x[0], x[1] or re.sub(r"\s+", " ", x[2].strip())[:70])
        have = {}
        for x in cb:
            have.setdefault(sig(x), x)
        at = None
        for x in reversed([y for y in db if y[3] < b[3]]):
            if sig(x) in have and len(x[2]) > 200:
                at = have[sig(x)][4]
                break
        assert at is not None, key
        p.s = p.s[:at] + "\n" + whole + p.s[at:]


# 11. Duxford sections and blocks with no Little Gransden facts, left out rather than made up.
def no_facts():
    LEFT_OUT.extend([
        "Section: Duxford's story (the Little Gransden page has no history of the airfield)",
        "Section: Pick your show (Little Gransden is one show on one day)",
        "Section: Flightline walk (the Little Gransden page has no flightline walk)",
        "Section: Experience flights (the Little Gransden page has no experience flights)",
        "Photography: the Sun guide and Sun at each show (the Little Gransden page has no sun guide; the sun's path is in the photographers' map notes)",
    ])


if __name__ == "__main__":
    main()
