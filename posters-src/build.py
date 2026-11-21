#!/usr/bin/env python3
"""Builds the social posters in posters/ (one self-contained HTML file each, 1080 x 1350).

Run:  python3 posters-src/build.py      then      node posters-src/export.js
The first writes the HTML, the second turns every poster into an image beside it.

House rules for posters: the new swish logo (white lettering on navy), no rounded corners anywhere,
real photos and cut-outs rather than drawn aircraft, no dashes in copy. Every fact on a poster comes
from a page on the site, named in the comment above it, so check that page before changing one.
posters/now-on-x.html is hand written and is not built here.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'posters')

CSS = """
:root{
  --navy:#13293C; --deep:#0E2131; --pit:#0A1826; --line:#24445E;
  --teal:#32B4AF; --red:#D74949; --purple:#6950A1;
  --ink:#FFFFFF; --soft:#C9D6E0; --mute:#9FB4C4;
  --display:"Barlow Condensed","Arial Narrow",Arial,sans-serif;
  --body:"Barlow","Segoe UI",Helvetica,Arial,sans-serif;
  color-scheme:dark;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:#081520;overflow:hidden}
.stage{position:fixed;inset:0;display:grid;place-items:center}
.poster{
  position:relative;width:1080px;height:1350px;flex:none;overflow:hidden;
  color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased;
  background:
    radial-gradient(900px 700px at 50% 40%, #1B3B55 0%, transparent 72%),
    linear-gradient(180deg, var(--deep) 0%, var(--navy) 46%, var(--deep) 100%);
}
.logo{position:absolute;left:50%;top:44px;width:300px;transform:translateX(-50%)}
.logo img{display:block;width:100%;height:auto}
.body{position:absolute;left:0;right:0;top:176px;bottom:168px;display:flex;flex-direction:column;gap:24px}
.pad{padding:0 80px}
.photo{position:relative;flex:none;height:440px;background:var(--pit);border-top:6px solid var(--red);border-bottom:6px solid var(--teal);overflow:hidden}
.photo img{display:block;width:100%;height:100%;object-fit:cover}
.tag{display:inline-block;font-family:var(--display);font-weight:700;font-size:30px;line-height:1;letter-spacing:.14em;
  text-transform:uppercase;padding:9px 16px 10px 18px;background:var(--red);color:#fff}
.tag.teal{background:var(--teal);color:var(--deep)}
.tag.purple{background:var(--purple)}
h1{margin:0;font-family:var(--display);font-weight:800;font-size:150px;line-height:.9;letter-spacing:.005em;text-transform:uppercase}
h1 em{font-style:normal;color:var(--teal)}
.lead{margin:0;font-weight:500;font-size:34px;line-height:1.28;color:var(--soft)}
.lead b{color:var(--ink);font-weight:700}
.fine{margin:0;font-weight:500;font-size:24px;line-height:1.3;color:var(--mute)}
.lab{font-family:var(--display);font-weight:700;font-size:26px;line-height:1;letter-spacing:.14em;text-transform:uppercase;color:var(--teal)}
.foot{position:absolute;left:80px;right:80px;bottom:52px;text-align:center}
.runway{display:flex;align-items:center;gap:18px;margin-bottom:24px}
.runway .keys{display:flex;gap:6px;flex:none}
.runway .keys b{display:block;width:6px;height:30px;background:rgba(255,255,255,.5)}
.runway .dash{flex:1;height:5px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.34) 0 46px,transparent 46px 78px)}
.url{font-family:var(--display);font-weight:700;font-size:34px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
"""

PAGE = """<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>{title} | UK Airshow Guide poster</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap">
<style>
/* Social poster, 1080 x 1350 (4:5 portrait). Built by posters-src/build.py, so change it there, not here. */
{css}
{extra}
</style>
</head>
<body>
<div class="stage">
<div class="poster" id="poster">
  <div class="logo"><img src="../brand/ukag-header-logo.png" alt="UK Airshow Guide"></div>
  <div class="body">
{body}
  </div>
  <div class="foot">
    <div class="runway" aria-hidden="true">
      <span class="keys"><b></b><b></b><b></b><b></b></span>
      <span class="dash"></span>
      <span class="keys"><b></b><b></b><b></b><b></b></span>
    </div>
    <div class="url">ukairshowguide.co.uk</div>
  </div>
</div>
</div>
<script>
(function(){{
  var p=document.getElementById('poster');
  function fit(){{var s=Math.min(window.innerWidth/1080,window.innerHeight/1350,1);p.style.transform=s<1?'scale('+s+')':'';}}
  window.addEventListener('resize',fit);fit();
}})();
</script>
</body>
</html>
"""

TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12.5 9.2 19 21 5.5" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="square"/></svg>'
PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4 20 12 7 20Z" fill="currentColor"/></svg>'

POSTERS = []


def poster(slug, title, extra, body):
    POSTERS.append((slug, title, extra, body))


# ---------------------------------------------------------------------------------------------
# 1. Date announced. Fact: airshow-news.html and uk-airshow-calendar.html (Sun 29 August 2027).
poster('date-little-gransden-2027', 'Little Gransden 2027 date', """
.body{align-items:center;text-align:center;justify-content:space-between;padding:26px 80px 20px}
h1{font-size:132px}
.sub{margin-top:14px;font-family:var(--display);font-weight:700;font-size:56px;line-height:1;letter-spacing:.06em;text-transform:uppercase;color:var(--teal)}
.cal{width:470px;background:#fff;color:var(--deep);box-shadow:0 26px 60px rgba(0,0,0,.5), 18px 18px 0 var(--teal)}
.cal .mo{background:var(--red);color:#fff;font-family:var(--display);font-weight:800;font-size:74px;line-height:1;letter-spacing:.1em;text-transform:uppercase;padding:20px 0 22px}
.cal .dn{font-family:var(--display);font-weight:800;font-size:330px;line-height:.86;padding-top:20px;letter-spacing:-.01em}
.cal .dw{font-family:var(--display);font-weight:700;font-size:54px;line-height:1;letter-spacing:.16em;text-transform:uppercase;padding:6px 0 30px;color:var(--navy)}
""", """
    <div><span class="tag">Date announced</span></div>
    <div>
      <h1>Little Gransden</h1>
      <div class="sub">Air &amp; Car Show 2027</div>
    </div>
    <div class="cal">
      <div class="mo">August</div>
      <div class="dn">29</div>
      <div class="dw">Sunday</div>
    </div>
    <div>
      <p class="lead"><b>Sunday 29 August 2027.</b> Little Gransden Airfield, Cambridgeshire.</p>
      <p class="fine" style="margin-top:12px">Dates can change. Check the official website before you book.</p>
    </div>
""")

# ---------------------------------------------------------------------------------------------
# 2. Line-up confirmed. Facts: midlands-air-festival.html news item dated 20 November 2026
#    (Team Raven Fri, Sat, Sun; Hawker Fury FB.11 Sat, Sun) and the calendar (4 to 6 June, Ragley Hall).
def days(on):
    return ''.join('<i class="%s">%s</i>' % ('on' if d in on else 'off', d) for d in ('Fri', 'Sat', 'Sun'))

poster('lineup-midlands-2027', 'Midlands Air Festival 2027 first aircraft', """
.body{justify-content:space-between;padding:26px 80px 20px}
h1{font-size:134px}
.where{margin-top:18px;font-family:var(--display);font-weight:700;font-size:44px;line-height:1.1;letter-spacing:.05em;text-transform:uppercase;color:var(--soft)}
.where b{color:var(--teal);font-weight:700}
.board{background:var(--pit);border:3px solid var(--line);border-top:8px solid var(--teal)}
.bhead{display:flex;justify-content:space-between;padding:16px 28px;border-bottom:3px solid var(--line)}
.row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:19px 28px 21px}
.row + .row{border-top:3px solid var(--line)}
.row .n{font-family:var(--display);font-weight:800;font-size:66px;line-height:1;text-transform:uppercase}
.row .t{margin-top:8px;font-weight:500;font-size:27px;color:var(--mute)}
.days{display:flex;gap:10px;flex:none}
.days i{display:grid;place-items:center;width:84px;height:70px;font-style:normal;font-family:var(--display);font-weight:800;font-size:34px;letter-spacing:.06em;text-transform:uppercase}
.days .on{background:var(--teal);color:var(--deep)}
.days .off{border:3px solid var(--line);color:#4F6B82}
""", """
    <div><span class="tag teal">Line-up news</span></div>
    <div>
      <h1>First aircraft <em>confirmed</em></h1>
      <div class="where">Midlands Air Festival<br>4 to 6 June 2027 <b>/</b> Ragley Hall</div>
    </div>
    <div class="board">
      <div class="bhead"><span class="lab">Flying</span><span class="lab">Days</span></div>
      <div class="row">
        <div><div class="n">Team Raven</div><div class="t">Van’s RV-8 formation aerobatic team</div></div>
        <div class="days">%s</div>
      </div>
      <div class="row">
        <div><div class="n">Hawker Fury FB.11</div><div class="t">Flying on Saturday and Sunday</div></div>
        <div class="days">%s</div>
      </div>
    </div>
    <div>
      <p class="lead">More acts are still to come. We’ll add each one as it’s announced.</p>
      <p class="fine" style="margin-top:12px">Confirmed on the festival’s official air displays page, 20 November 2026.</p>
    </div>
""" % (days(('Fri', 'Sat', 'Sun')), days(('Sat', 'Sun'))))

# ---------------------------------------------------------------------------------------------
# 3. The season at a glance. Facts: uk-airshow-calendar.html (the featured shows in its list,
#    46 confirmed, 23 still to announce). Update this list whenever the calendar changes.
SEASON = [
    ('May', [('8', 'Duxford Flying Day: VE Day'), ('9', 'Shuttleworth Season Premiere'), ('29', 'Shuttleworth Military Air Show')]),
    ('Jun', [('4 to 6', 'Midlands Air Festival'), ('5', 'Duxford Flying Day: D-Day'), ('13', 'RAF Cosford Air Show'),
             ('19 to 20', 'Duxford Summer Air Show'), ('26 to 27', 'Headcorn International Airshow'), ('26 to 27', 'Shuttleworth Festival of Flight')]),
    ('Jul', [('16 to 18', 'Royal International Air Tattoo'), ('24', 'Shuttleworth Summer Air Show')]),
    ('Aug', [('12 to 15', 'Eastbourne International Airshow'), ('14', 'Duxford Flying Evening'), ('14', 'Shuttleworth Wings &amp; Wheels'),
             ('26 to 27', 'Clacton Airshow'), ('28', 'Shuttleworth Flying Proms'), ('29', 'Little Gransden Air &amp; Car Show')]),
    ('Sep', [('3 to 4', 'Ayr Show: Festival of Flight'), ('11 to 12', 'Duxford Battle of Britain Air Show'), ('25', 'Shuttleworth Season Finale')]),
    ('Oct', [('2', 'Duxford Flying Finale')]),
]
season_rows = ''
for mo, shows in SEASON:
    season_rows += '      <div class="grp"><div class="mo">%s</div><div class="rows">%s</div></div>\n' % (
        mo, ''.join('<div class="r"><span class="d">%s</span><span class="s">%s</span></div>' % s for s in shows))

poster('season-2027', '2027 airshow dates', """
.body{justify-content:space-between;padding:20px 80px 14px}
h1{font-size:104px;white-space:nowrap}
.stats{display:flex;gap:14px;margin-top:14px}
.stats span{font-family:var(--display);font-weight:700;font-size:31px;line-height:1;letter-spacing:.08em;text-transform:uppercase;padding:10px 16px 11px}
.stats .a{background:var(--teal);color:var(--deep)}
.stats .b{border:3px solid var(--line);color:var(--soft);padding:7px 14px 8px}
.list{border-top:3px solid var(--line)}
.grp{display:flex;border-bottom:3px solid var(--line)}
.grp .mo{flex:none;width:112px;padding-top:8px;font-family:var(--display);font-weight:800;font-size:40px;line-height:1;letter-spacing:.06em;text-transform:uppercase;color:var(--red)}
.grp .rows{flex:1;padding:4px 0 5px}
.r{display:flex;align-items:baseline;line-height:1.1}
.r .d{flex:none;width:142px;font-family:var(--display);font-weight:700;font-size:28px;letter-spacing:.03em;color:var(--teal);text-transform:uppercase}
.r .s{font-weight:600;font-size:26px;white-space:nowrap}
""", """
    <div>
      <h1>2027 airshow dates</h1>
      <div class="stats"><span class="a">46 UK shows confirmed</span><span class="b">23 still to announce</span></div>
    </div>
    <div class="list">
%s    </div>
    <p class="fine">The shows we cover in full. Dates can change, so check before you book.</p>
""" % season_rows)

# ---------------------------------------------------------------------------------------------
# 4. YouTube. Facts and wording: youtube.html (handle @TheBigGuidetoUKAirShows). Photo: home-img/v2/hero.jpg.
poster('watch-on-youtube', 'Watch us on YouTube', """
.body{justify-content:space-between;padding-bottom:16px}
.photo{height:400px}
.photo img{object-position:50% 40%}
.photo:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,24,38,.1),rgba(10,24,38,.38))}
.play{position:absolute;left:50%;top:50%;z-index:2;width:176px;height:122px;margin:-61px 0 0 -88px;display:grid;place-items:center;background:var(--red);color:#fff;box-shadow:0 18px 44px rgba(0,0,0,.5)}
.play svg{width:74px;height:74px}
.bar{position:absolute;left:0;right:0;bottom:0;z-index:2;height:10px;background:rgba(255,255,255,.3)}
.bar i{display:block;width:34%;height:100%;background:var(--red)}
h1{font-size:146px;margin-top:20px}
.handle{display:inline-flex;align-items:stretch;border:3px solid var(--teal);background:rgba(14,33,49,.82);font-weight:700;font-size:44px;line-height:1}
.handle .hx{display:grid;place-items:center;width:84px;flex:none;background:var(--teal);color:var(--deep)}
.handle .hx svg{width:44px;height:44px}
.handle .hn{padding:18px 30px 21px 26px}
""", """
    <div class="photo"><img src="../home-img/v2/hero.jpg" alt=""><span class="play">%s</span><span class="bar"><i></i></span></div>
    <div class="pad">
      <span class="tag">On YouTube</span>
      <h1>Watch before <em>you go</em></h1>
    </div>
    <p class="lead pad">We film the shows we write about, so you can see the crowd line, the car parks and the campsites before you get there.</p>
    <div class="pad"><div class="handle"><span class="hx">%s</span><span class="hn">@TheBigGuidetoUKAirShows</span></div></div>
""" % (PLAY, PLAY))

# ---------------------------------------------------------------------------------------------
# 5. What to pack. Facts and wording: first-airshow-what-to-pack.html, the "Airfield show" top ten.
PACK = [
    ('Low folding chairs', 'Light to carry and kind to the people behind you'),
    ('A picnic blanket', 'Saves your pitch and gives children somewhere to sit'),
    ('Water, and more water', 'Two litres per person on a hot day'),
    ('Packed lunch and snacks', 'Saves money and queueing'),
    ('Sun cream, hat and sunglasses', 'There is no shade on the crowd line'),
    ('Waterproof jacket', 'Showers come through. The flying carries on'),
    ('Ear defenders for children', 'Fast jets are loud enough to hurt small ears'),
    ('Tickets and parking pass', 'On your phone and printed, with the battery charged'),
    ('A power bank', 'Signal drains the phone. The photos drain it faster'),
    ('A small rucksack, not a big bag', 'Quick to search at the gate and easy to carry all day'),
]
pack_rows = ''.join('      <div class="it"><span class="bx">%s</span><div><div class="t">%s</div><div class="n">%s</div></div></div>\n' % (TICK, t, n) for t, n in PACK)

poster('what-to-pack', 'What to pack for an airshow', """
.body{justify-content:space-between;padding:24px 80px 18px}
h1{font-size:150px;margin-top:20px}
.lead{margin-top:18px}
.grid{display:grid;grid-template-columns:1fr 1fr;grid-auto-flow:column;grid-template-rows:repeat(5,auto);column-gap:44px;row-gap:26px}
.it{display:flex;gap:18px;align-items:flex-start}
.bx{flex:none;display:grid;place-items:center;width:54px;height:54px;border:4px solid var(--teal);color:var(--teal);margin-top:2px;background:rgba(10,24,38,.6)}
.bx svg{width:36px;height:36px}
.it .t{font-weight:700;font-size:30px;line-height:1.14}
.it .n{margin-top:5px;font-weight:500;font-size:23px;line-height:1.24;color:var(--mute)}
""", """
    <div>
      <span class="tag teal">First airshow?</span>
      <h1>Pack these <em>ten</em></h1>
      <p class="lead">For the big airfield shows. Long walks, no shade, long days.</p>
    </div>
    <div class="grid">
%s    </div>
    <p class="fine">Everything you bring, you carry across a field and back again. Pack light.</p>
""" % pack_rows)

# ---------------------------------------------------------------------------------------------
# 6. Shutter speeds. Facts and wording: new-to-aviation-photography.html, "Key details".
#    Photo: home-img/v2/guide-photo-typhoon.jpg.
SHUTTER = [
    ('Fast jets', '1/1000', 'second and faster'),
    ('Propeller aircraft', '1/320', 'or so, then slower'),
    ('Helicopters', '1/125', 'or so, then slower'),
    ('Static aircraft', 'f/7.1 to f/11', 'in aperture priority'),
]
shutter_rows = ''.join('      <div class="sr"><span class="k">%s</span><span class="v">%s</span><span class="x">%s</span></div>\n' % r for r in SHUTTER)

poster('shutter-speeds', 'Shutter speeds to start with', """
.body{justify-content:space-between;padding-bottom:14px}
.photo{height:312px}
.photo img{object-position:50% 44%}
.vf{position:absolute;inset:26px;z-index:2}
.vf i{position:absolute;width:64px;height:64px;border:5px solid #fff}
.vf i:nth-child(1){left:0;top:0;border-right:0;border-bottom:0}
.vf i:nth-child(2){right:0;top:0;border-left:0;border-bottom:0}
.vf i:nth-child(3){left:0;bottom:0;border-right:0;border-top:0}
.vf i:nth-child(4){right:0;bottom:0;border-left:0;border-top:0}
.vf b{position:absolute;left:50%;top:50%;width:150px;height:110px;margin:-55px 0 0 -75px;border:4px solid var(--teal)}
.vf u{position:absolute;right:26px;bottom:14px;text-decoration:none;font-family:var(--display);font-weight:700;font-size:34px;letter-spacing:.1em;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6)}
h1{font-size:100px;margin-top:16px}
.tbl{border-top:3px solid var(--line)}
.sr{display:flex;align-items:baseline;gap:20px;padding:8px 0 10px;border-bottom:3px solid var(--line)}
.sr .k{flex:none;width:330px;font-family:var(--display);font-weight:700;font-size:35px;line-height:1;letter-spacing:.08em;text-transform:uppercase;color:var(--soft)}
.sr .v{font-family:var(--display);font-weight:800;font-size:60px;line-height:.95;color:var(--teal)}
.sr .x{font-weight:500;font-size:27px;color:var(--mute)}
""", """
    <div class="photo"><img src="../home-img/v2/guide-photo-typhoon.jpg" alt=""><span class="vf"><i></i><i></i><i></i><i></i><b></b><u>S&nbsp;&nbsp;1/1000</u></span></div>
    <div class="pad">
      <span class="tag">Photography tips</span>
      <h1>Shutter speeds <em>to start with</em></h1>
    </div>
    <div class="pad"><div class="tbl">
%s    </div></div>
    <p class="fine pad">Use shutter priority (S or Tv) for the flying. Starting points, not fixed rules.</p>
""" % shutter_rows)

# ---------------------------------------------------------------------------------------------
# 7. Spotter card. Facts and wording: aircraft-a-to-z.html, "BAE Hawk T1 (Red Arrows)".
#    Photos: home-img/v2/hero-arrows-riat18.jpg and the top view cut-out camping-layout/img/dl-hawk.webp.
poster('spotter-red-arrows', 'Spotter card: Red Arrows', """
.body{justify-content:space-between;padding-bottom:16px}
.photo{height:330px}
.photo img{object-position:50% 50%}
.tags{display:flex;gap:12px}
h1{font-size:150px;margin-top:16px}
.type{margin-top:10px;font-family:var(--display);font-weight:700;font-size:42px;line-height:1.1;letter-spacing:.05em;text-transform:uppercase;color:var(--teal)}
.facts{display:flex;gap:30px;align-items:center}
.facts dl{flex:1;margin:0;border-top:3px solid var(--line)}
.facts .f{padding:13px 0 15px;border-bottom:3px solid var(--line)}
.facts dt{font-family:var(--display);font-weight:700;font-size:25px;line-height:1;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
.facts dd{margin:7px 0 0;font-weight:600;font-size:28.5px;line-height:1.22}
.type b{color:var(--line)}
.plan{flex:none;width:212px}
.plan img{display:block;width:100%;height:auto;filter:drop-shadow(0 16px 20px rgba(0,0,0,.5))}
""", """
    <div class="photo"><img src="../home-img/v2/hero-arrows-riat18.jpg" alt=""></div>
    <div class="pad">
      <div class="tags"><span class="tag teal">Spotter card</span><span class="tag purple">Display team</span></div>
      <h1>Red Arrows</h1>
      <div class="type">BAE Hawk T1 <b>/</b> RAF Aerobatic Team</div>
    </div>
    <div class="pad"><div class="facts">
      <dl>
        <div class="f"><dt>Who flies it</dt><dd>The Red Arrows, from RAF Waddington.</dd></div>
        <div class="f"><dt>Look for</dt><dd>Red, white and blue smoke, and the Synchro Pair crossing head on in front of the crowd.</dd></div>
        <div class="f"><dt>Seen at</dt><dd>Ayr, Clacton, Cosford, Southport, RIAT and Duxford.</dd></div>
      </dl>
      <div class="plan"><img src="../camping-layout/img/dl-hawk.webp" alt=""></div>
    </div></div>
""")

# ---------------------------------------------------------------------------------------------
# 8. Join the team. Facts and wording: join-the-team.html.
#    Photo: camping-layout/img/3baeea0db7b2312e.webp (the Red Arrows in formation).
TEAM = [
    ('Full credit', 'Your name goes with your work, every time.'),
    ('Your work stays yours', 'Copyright stays with you.'),
    ('No minimum', 'No targets and no rota. Send things in when you can.'),
    ('Removed if you ask', 'Changed your mind? Tell us and it comes off the site.'),
]
team_cells = ''.join('      <div class="c"><div class="t">%s</div><div class="n">%s</div></div>\n' % c for c in TEAM)

poster('join-the-team', 'Join the team', """
.body{justify-content:space-between;padding-bottom:16px}
.photo{height:322px}
.photo img{object-position:50% 42%}
h1{font-size:152px;margin-top:16px;white-space:nowrap}
.lead{margin-top:14px;font-size:37px}
.cells{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.c{background:rgba(10,24,38,.7);border-left:8px solid var(--teal);padding:16px 22px 18px}
.c:nth-child(2n){border-left-color:var(--red)}
.c .t{font-family:var(--display);font-weight:800;font-size:40px;line-height:1;letter-spacing:.03em;text-transform:uppercase}
.c .n{margin-top:8px;font-weight:500;font-size:24.5px;line-height:1.24;color:var(--soft)}
""", """
    <div class="photo"><img src="../camping-layout/img/3baeea0db7b2312e.webp" alt=""></div>
    <div class="pad">
      <span class="tag">Volunteer with the guide</span>
      <h1>Join <em>the team</em></h1>
      <p class="lead">Contribute when you can. Cover what you know.</p>
    </div>
    <div class="pad"><div class="cells">
%s    </div></div>
    <p class="fine pad">It’s voluntary and unpaid. Get in touch at ukairshowguide.co.uk/join-the-team</p>
""" % team_cells)

# ---------------------------------------------------------------------------------------------
# 9. My Airshow Hub. Facts and wording: join-my-airshow-hub.html (free, about a minute, card details
#    never asked for, the example member has RIAT and Eastbourne saved). Dates: the calendar.
def trip(name, date, place, ticks):
    boxes = ''.join('<span class="tk %s"><i>%s</i>%s</span>' % ('on' if on else '', TICK if on else '', lab) for lab, on in ticks)
    return ('      <div class="trip"><div class="th"><span class="lab">Saved show</span><span class="eg">Example</span></div>'
            '<div class="tn">%s</div><div class="td">%s <b>/</b> %s</div><div class="tks">%s</div></div>\n' % (name, date, place, boxes))

poster('my-airshow-hub', 'My Airshow Hub', """
.body{justify-content:space-between;padding:18px 80px 14px}
h1{font-size:140px;margin-top:18px;white-space:nowrap}
.lead{margin-top:14px;font-size:32px}
.trips{display:grid;gap:18px}
.trip{background:var(--pit);border:3px solid var(--line);border-left:10px solid var(--teal);padding:14px 26px 18px}
.trip + .trip{border-left-color:var(--red)}
.th{display:flex;justify-content:space-between}
.eg{font-family:var(--display);font-weight:700;font-size:24px;line-height:1;letter-spacing:.14em;text-transform:uppercase;color:#5F7C93}
.tn{margin-top:8px;font-family:var(--display);font-weight:800;font-size:56px;line-height:1;text-transform:uppercase}
.td{margin-top:8px;font-weight:600;font-size:28px;color:var(--soft)}
.td b{color:var(--teal)}
.tks{display:flex;gap:26px;margin-top:12px}
.tk{display:flex;align-items:center;gap:12px;font-weight:700;font-size:28px;color:var(--mute)}
.tk i{display:grid;place-items:center;width:40px;height:40px;border:4px solid #4F6B82}
.tk.on{color:var(--ink)}
.tk.on i{border-color:var(--teal);background:var(--teal);color:var(--deep)}
.tk svg{width:26px;height:26px}
.strip{display:grid;grid-template-columns:repeat(3,1fr);border:3px solid var(--line)}
.strip > div{padding:11px 10px 13px;text-align:center}
.strip > div + div{border-left:3px solid var(--line)}
.strip .k{font-family:var(--display);font-weight:700;font-size:24px;line-height:1;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
.strip .v{margin-top:8px;font-family:var(--display);font-weight:800;font-size:35px;line-height:1;text-transform:uppercase;color:var(--teal);white-space:nowrap}
""", """
    <div>
      <span class="tag teal">Free to join</span>
      <h1>My Airshow <em>Hub</em></h1>
      <p class="lead">Every show you’re going to, in one place, with a countdown and a tick sheet for tickets, trains and parking.</p>
    </div>
    <div class="trips">
%s%s    </div>
    <div class="strip">
      <div><div class="k">Cost to join</div><div class="v">£0</div></div>
      <div><div class="k">Setting up</div><div class="v">About a minute</div></div>
      <div><div class="k">Card details</div><div class="v">Never asked for</div></div>
    </div>
""" % (trip('Royal International Air Tattoo', '16 to 18 July 2027', 'MOD Boscombe Down', (('Tickets', 1), ('Trains', 1), ('Parking', 0))),
       trip('Eastbourne Airshow', '12 to 15 August 2027', 'Eastbourne seafront', (('Tickets', 1), ('Trains', 0), ('Parking', 0)))))

# ---------------------------------------------------------------------------------------------
# 10. Free to watch. Facts: uk-airshow-calendar.html, every show flagged "Free to watch".
#     Photo: home-img/v2/band-arrows.jpg. Update this list whenever the calendar changes.
FREE = [
    ('4 to 6 Jun', 'English Riviera Airshow', 'Paignton, Devon'),
    ('18 to 20 Jun', 'Lancaster &amp; Morecambe Armed Forces Weekend', 'Lancashire'),
    ('26 Jun', 'Scarborough Armed Forces Day', 'North Yorkshire'),
    ('31 Jul to 1 Aug', 'Withernsea Blue Light Weekend', 'East Riding of Yorkshire'),
    ('31 Jul to 7 Aug', 'Swanage Carnival', 'Dorset'),
    ('6 to 15 Aug', 'Falmouth Week', 'Cornwall'),
    ('12 to 15 Aug', 'Eastbourne International Airshow', 'East Sussex'),
    ('14 to 16 Aug', 'Whitby Regatta', 'North Yorkshire'),
    ('18 Aug', 'Cromer Carnival Air Displays', 'Norfolk'),
    ('26 to 27 Aug', 'Clacton Airshow', 'Essex'),
    ('3 to 4 Sep', 'Ayr Show: Festival of Flight', 'South Ayrshire'),
    ('9 Sep', 'Jersey International Air Display', 'Jersey'),
]
free_rows = ''.join('      <div class="r"><span class="d">%s</span><span class="s">%s</span><span class="w">%s</span></div>\n' % r for r in FREE)

poster('free-to-watch-2027', 'Free to watch in 2027', """
.body{justify-content:space-between;padding-bottom:12px}
.photo{height:200px}
.photo img{object-position:50% 55%}
h1{font-size:100px;margin-top:14px;white-space:nowrap}
.list{border-top:3px solid var(--line)}
.r{display:flex;align-items:baseline;gap:16px;padding:4px 0 5px;border-bottom:2px solid var(--line);white-space:nowrap}
.r .d{flex:none;width:206px;font-family:var(--display);font-weight:700;font-size:30px;line-height:1.1;letter-spacing:.03em;text-transform:uppercase;color:var(--teal)}
.r .s{flex:1;font-weight:600;font-size:27px;line-height:1.1}
.r .w{flex:none;font-weight:500;font-size:22px;color:var(--mute)}
""", """
    <div class="photo"><img src="../home-img/v2/band-arrows.jpg" alt=""></div>
    <div class="pad">
      <span class="tag">No ticket needed</span>
      <h1>Free to watch <em>in 2027</em></h1>
    </div>
    <div class="pad"><div class="list">
%s    </div></div>
    <p class="fine pad">Some fly on selected days only. Dates can change, so check before you travel.</p>
""" % free_rows)


# =============================================================================================
# Show spotlights, one for each featured show. Facts and wording: the "Key details" and the opening
# lines of each show's own page (riat.html, raf-cosford.html and so on), read on 21 Nov 2026.
# Photos: the ones find-your-airshow.html uses for each show, or a larger one from the same show.
SHOW_CSS = """
.body{justify-content:space-between;padding-bottom:14px}
.photo{height:270px}
.tags{display:flex;gap:12px}
h1{margin-top:16px;white-space:nowrap}
.lead{margin-top:14px;font-size:32px}
.tbl{border-top:3px solid var(--line)}
.kv{display:flex;align-items:baseline;gap:18px;padding:7px 0 9px;border-bottom:3px solid var(--line)}
.kv .k{flex:none;width:170px;font-family:var(--display);font-weight:700;font-size:27px;line-height:1;letter-spacing:.14em;text-transform:uppercase;color:var(--teal)}
.kv .v{font-weight:600;font-size:29px;line-height:1.2}
"""


def show(slug, title, kind, entry, h1, size, lead, rows, photo, pos='50% 50%', fine='Details can change. Check the official website before you book.'):
    kv = ''.join('      <div class="kv"><span class="k">%s</span><span class="v">%s</span></div>\n' % r for r in rows)
    free = entry.lower().startswith('free')
    poster('show-' + slug, title, SHOW_CSS + 'h1{font-size:%dpx}\n.photo img{object-position:%s}\n' % (size, pos), """
    <div class="photo"><img src="../%s" alt=""></div>
    <div class="pad">
      <div class="tags"><span class="tag purple">%s</span><span class="tag%s">%s</span></div>
      <h1>%s</h1>
      <p class="lead">%s</p>
    </div>
    <div class="pad"><div class="tbl">
%s    </div></div>
    <p class="fine pad">%s</p>
""" % (photo, kind, ' teal' if free else '', entry, h1, lead, kv, fine))


show('riat', 'Royal International Air Tattoo 2027', 'Military', 'New home for 2027',
     'Royal International<br><em>Air Tattoo</em>', 108,
     'After more than forty years at RAF Fairford, RIAT is moving to MOD Boscombe Down in Wiltshire.',
     [('When', 'Friday 16 to Sunday 18 July 2027'), ('Where', 'MOD Boscombe Down, Wiltshire'),
      ('Tickets', 'On sale now, advance only'), ('Children', 'Under 18s free with an adult')],
     'home-img/v2/riat-hornet.jpg', '60% 50%',
     'Parking, shuttles and camping are still to be announced.')

show('cosford', 'RAF Cosford Air Show', 'Military', 'Ticket only',
     'RAF Cosford<br><em>Air Show</em>', 128,
     'The Royal Air Force’s own air show, on a working station next to the RAF Museum Midlands.',
     [('When', 'Sunday 13 June 2027, to be confirmed'), ('Where', 'RAF Cosford, Shropshire'),
      ('Entry', 'Ticket only, in advance'), ('Station', 'Cosford, under 300 m from the gate')],
     'home-img/v2/hero-arrows-cosford23.jpg', '30% 60%',
     'The 2026 show sold out in advance. Tickets for 2027 haven’t gone on sale yet.')

show('midlands', 'Midlands Air Festival', 'Festival', 'Ticketed',
     'Midlands<br><em>Air Festival</em>', 128,
     'Over 100 hot air balloons, an afternoon air display and the Friday Nightfire.',
     [('When', 'Friday 4 to Sunday 6 June 2027'), ('Where', 'Ragley Hall, Alcester'),
      ('Tickets', 'Advance only, none on the gate'), ('Parking', 'Standard parking free')],
     'find-img/thunderbolt.jpg', '50% 50%')

show('eastbourne', 'Eastbourne Airshow', 'Seafront', 'Free to watch',
     'Eastbourne<br><em>Airshow</em>', 128,
     'Four days of warbirds, jets and display teams over Eastbourne seafront.',
     [('When', 'Thursday 12 to Sunday 15 August 2027'), ('Where', 'Eastbourne seafront, East Sussex'),
      ('Entry', 'Free'), ('Station', 'Eastbourne, 10 to 15 min walk')],
     'find-img/blenheim-smoke.jpg', '50% 40%')

show('clacton', 'Clacton Airshow', 'Seafront', 'Free to watch',
     'Clacton<br><em>Airshow</em>', 128,
     'A free seaside air show on the Essex coast, with warbirds, fast jets and display teams out over the North Sea.',
     [('When', 'Thursday 26 and Friday 27 August 2027'), ('Where', 'West Greensward, Clacton-on-Sea'),
      ('Entry', 'Free'), ('Station', 'Clacton-on-Sea, about 15 min walk')],
     'find-img/pitts.jpg', '50% 28%')

# The Wales page says 24 and 25 July 2027 are confirmed, but the calendar and the news page still list
# the show as to be announced, so this poster stays with the cautious wording until they agree.
show('wales', 'Wales National Airshow', 'Seafront', 'Free to watch',
     'Wales National<br><em>Airshow</em>', 126,
     'The biggest free air show in Wales, right over Swansea Bay.',
     [('When', 'July 2027, dates to be confirmed'), ('Where', 'Swansea Bay'),
      ('Entry', 'Free'), ('Station', 'Swansea')],
     'find-img/chinook.jpg', '50% 45%')

show('duxford', 'Duxford Air Shows', 'Historic', 'Ticketed',
     'Duxford<br><em>Air Shows</em>', 128,
     'Seven flying events at IWM Duxford in 2027, from Flying Days to the two big Air Shows.',
     [('When', 'Seven events, 8 May to 2 October 2027'), ('Where', 'IWM Duxford, Cambridgeshire'),
      ('Tickets', 'Advance only, from £37.50'), ('Station', 'Cambridge, with a free Air Show shuttle')],
     'find-img/b17.jpg', '50% 45%')

show('shuttleworth', 'Shuttleworth Air Shows', 'Historic', 'Ticketed',
     'Shuttleworth<br><em>Air Shows</em>', 128,
     'Vintage aircraft flying from a grass airfield in the Bedfordshire countryside.',
     [('When', 'Seven shows, 9 May to 25 September 2027'), ('Where', 'Old Warden Aerodrome, Bedfordshire'),
      ('Tickets', 'From £35, children free at most shows'), ('Station', 'Biggleswade, 3 miles, with a shuttle bus')],
     'find-img/swordfish.jpg', '50% 22%')

show('headcorn', 'Headcorn Airshow', 'Historic', 'Ticketed',
     'Headcorn<br><em>Airshow</em>', 128,
     'Warbirds on a grass airfield in the Kent Weald, with camping on the airfield for the whole weekend.',
     [('When', 'Saturday 26 and Sunday 27 June 2027'), ('Where', 'Headcorn Aerodrome, Kent'),
      ('Tickets', 'Advance only, from £30'), ('Parking', 'Free, no booking needed')],
     'camping-layout/img/e0c95ed4bee341b0.webp', '50% 55%')

show('little-gransden', 'Little Gransden Air and Car Show', 'Airfield', 'Ticketed',
     'Little Gransden<br><em>Air &amp; Car Show</em>', 116,
     'A charity air show and car show on a grass airfield, with more than 300 classic and specialist vehicles.',
     [('When', 'Sunday 29 August 2027'), ('Where', 'Little Gransden Airfield, Cambridgeshire'),
      ('Tickets', 'Online through the official site'), ('Station', 'St Neots, then a taxi')],
     'find-img/spitfire.jpg', '50% 50%')

show('southport', 'Southport Air Show', 'Seafront', 'Ticketed',
     'Southport<br><em>Air Show</em>', 128,
     'Two days on the seafront on the August bank holiday weekend, flying over the Sefton coast since 1991.',
     [('When', '2027 dates to be confirmed'), ('Where', 'Southport seafront, Merseyside'),
      ('Entry', 'Adults £13, under 16s free (2026)'), ('Station', 'Southport, about 10 min walk')],
     'find-img/apache.jpg', '50% 40%',
     'The 2026 show ran on Saturday 29 and Sunday 30 August.')

show('blackpool', 'Blackpool Air Show', 'Seafront', 'Free to watch',
     'Blackpool<br><em>Air Show</em>', 128,
     'Free on the seafront, two days every August, with the flying out over the Irish Sea.',
     [('When', 'August 2027, dates to be confirmed'), ('Where', 'Blackpool Promenade, Lancashire'),
      ('Entry', 'Free, no tickets needed'), ('Station', 'Blackpool North, about 15 minutes’ walk')],
     'find-img/jaguar.jpg', '50% 45%',
     'In 2026 it ran on Saturday 8 and Sunday 9 August.')

show('ayr', 'International Ayr Show', 'Seafront', 'Free to watch',
     'International<br><em>Ayr Show</em>', 128,
     'Festival of Flight. A Friday evening display into the sunset over the Firth of Clyde, then a full Saturday afternoon.',
     [('When', 'Friday 3 and Saturday 4 September 2027'), ('Where', 'Low Green, Ayr, South Ayrshire'),
      ('Entry', 'Free, no tickets needed'), ('Station', 'Ayr, about 15 to 20 minutes’ walk')],
     'find-img/c17.jpg', '50% 50%')

# =============================================================================================
# More packing lists. Facts and wording: first-airshow-what-to-pack.html, the other four top tens.
PACK_CSS = [p for p in POSTERS if p[0] == 'what-to-pack'][0][2]


def pack(slug, title, tag, h1, lead, items, size=124):
    rows = ''.join('      <div class="it"><span class="bx">%s</span><div><div class="t">%s</div><div class="n">%s</div></div></div>\n' % (TICK, t, n) for t, n in items)
    poster('pack-' + slug, title, PACK_CSS + '\n.body{padding-top:16px}\nh1{font-size:%dpx;white-space:nowrap}\n.lead{font-size:30px}\n.grid{row-gap:12px}\n' % size, """
    <div>
      <span class="tag teal">%s</span>
      <h1>%s</h1>
      <p class="lead">%s</p>
    </div>
    <div class="grid">
%s    </div>
    <p class="fine">Pack the night before and leave the bags by the door.</p>
""" % (tag, h1, lead, rows))


pack('seafront', 'What to pack for a seafront airshow', 'Seaside show?', 'Seafront <em>top ten</em>',
     'For the free promenade shows such as Eastbourne, Clacton, Wales, Blackpool, Southport and Ayr.', [
    ('Layers', 'It is colder on the seafront than in town, even in August'),
    ('Windproof jacket', 'Sea breezes build through the afternoon'),
    ('Something to sit on', 'The beach is shingle at some of them. A blanket or a low chair'),
    ('Sun cream and a hat', 'Sea light burns faster than you expect'),
    ('Cash and card', 'Card machines fail when the signal goes'),
    ('Water', 'Easy to buy, but queues are long at the busy spots'),
    ('Binoculars', 'The display line is further out over the water than on an airfield'),
    ('Train times', 'Check the last train and the engineering work before you leave'),
    ('A plan for the toilets', 'Town toilets and temporary units, both busy. Know where they are'),
    ('Patience for the roads', 'The promenade closes. Arrive mid morning or take the train'),
])

pack('children', 'What to pack for an airshow with children', 'Bringing children?', 'Kids’ <em>top ten</em>',
     'Toddlers right up to teenagers. Build the day around them and everyone enjoys it.', [
    ('Ear defenders', 'The single best buy for a child at an airshow'),
    ('Snack bag', 'A bag of their favourites that lasts all day'),
    ('Refillable bottle each', 'Keeps them drinking without you buying bottles every hour'),
    ('Wipes and a small first aid kit', 'Plasters, antihistamine, their medication'),
    ('A buggy that copes with grass', 'Big wheels. Small wheels stop dead in a wet field'),
    ('Contact details on them', 'A wristband or a note with your mobile number'),
    ('Something for the quiet bits', 'A book, a colouring set, a tablet with downloads'),
    ('Spare clothes', 'Mud, ice cream and rain. Usually all three'),
    ('A small treat budget', 'Agree one bought treat and stick to it'),
    ('A meeting point agreed on arrival', 'Say it out loud and point at it'),
])

pack('photographers', 'What to pack for airshow photography', 'Bringing a camera?', 'Camera bag <em>top ten</em>',
     'The short list for photographers. The full kit guide is in the Photography Hub.', [
    ('One or two bodies', 'Two saves lens changes in the dust. One is fine for most people'),
    ('A long lens for the flying', 'Something in the 300mm to 600mm range'),
    ('A wide lens for the static', 'The one that stays on the second body'),
    ('Spare batteries and cards', 'More than you think. Cold and long days eat batteries'),
    ('Lens cloths and a blower', 'Dust, rain and fingerprints all day'),
    ('A monopod, not a tripod', 'Tripods take room on the crowd line and some shows limit them'),
    ('A bag you can carry all day', 'Sling or backpack'),
    ('The sun guide for the show', 'Know where the light is before you pick your pitch'),
    ('A small step or stool', 'Gets you over heads if you are not on the front row'),
    ('Rain cover for the camera', 'Shows still fly in drizzle'),
], 112)

pack('camping', 'What to pack for airshow camping', 'Camping weekend?', 'Camping <em>top ten</em>',
     'For shows with camping on site or nearby, including RIAT, Duxford and the Midlands Air Festival.', [
    ('Tent, pegs and a mallet', 'Hard ground in a dry summer, soft in a wet one. Bring both kinds of peg'),
    ('Sleeping mat and warm bag', 'Summer nights in a field are colder than you think'),
    ('Head torch', 'Hands free for the walk to the toilet block'),
    ('Stove, fuel and a kettle', 'Breakfast and a brew before the queue for the gate'),
    ('Cool box', 'Milk, lunch and the evening meal for two days'),
    ('Camp chairs', 'They double as your crowd line chairs'),
    ('Ear plugs', 'Campsites near airfields are noisy. So are campers'),
    ('Wet wipes and a towel', 'Showers are limited or a long walk away'),
    ('Bin bags', 'Rubbish, wet clothes and muddy boots'),
    ('Power bank or a car charger', 'No sockets in a field'),
])

# =============================================================================================
# More spotter cards. Facts and wording: aircraft-a-to-z.html. Photos: the ones that page uses.
SPOT_CSS = [p for p in POSTERS if p[0] == 'spotter-red-arrows'][0][2]


def spotter(slug, title, group, h1, kind, who, look, seen, photo, pos='50% 50%', plan=None):
    side = '\n      <div class="plan"><img src="../%s" alt=""></div>' % plan if plan else ''
    poster('spotter-' + slug, 'Spotter card: ' + title, SPOT_CSS + '\n.photo{height:296px}\n.photo img{object-position:%s}\n.facts dd{font-size:27.5px}\n' % pos, """
    <div class="photo"><img src="../%s" alt=""></div>
    <div class="pad">
      <div class="tags"><span class="tag teal">Spotter card</span><span class="tag purple">%s</span></div>
      <h1>%s</h1>
      <div class="type">%s</div>
    </div>
    <div class="pad"><div class="facts">
      <dl>
        <div class="f"><dt>Who flies it</dt><dd>%s</dd></div>
        <div class="f"><dt>Listen and look for</dt><dd>%s</dd></div>
        <div class="f"><dt>Seen at</dt><dd>%s</dd></div>
      </dl>%s
    </div></div>
""" % (photo, group, h1, kind, who, look, seen, side))


spotter('typhoon', 'Eurofighter Typhoon', 'Modern military', 'Typhoon', 'Eurofighter <b>/</b> Multirole fighter',
        'The RAF Typhoon Display Team, from 29 Squadron at RAF Coningsby.',
        'Twin afterburners on the vertical climb, and on a damp day the vapour pouring off the wings.',
        'Ayr, Blackpool, Cosford, Eastbourne, Southport, Wales and RIAT.',
        'camping-layout/img/631d94c8d1c1b002.webp', '50% 50%', 'camping-layout/img/dl-typhoon.webp')

spotter('chinook', 'Boeing Chinook', 'Helicopter', 'Chinook', 'Boeing <b>/</b> Twin rotor heavy lift helicopter',
        'The RAF Chinook Display Team from RAF Odiham, plus flypasts from the front line fleet.',
        'The famous wokka wokka of two rotors. You feel it in your chest as much as hear it.',
        'Cosford, Ayr and RIAT.',
        'camping-layout/img/3032a5373d27b445.webp')

spotter('spitfire', 'Supermarine Spitfire', 'Historic', 'Spitfire', 'Supermarine <b>/</b> Second World War fighter',
        'The Battle of Britain Memorial Flight, plus dozens of privately owned Spitfires.',
        'The elliptical wing as it turns, and the Merlin. Once you know that sound you will pick it out every time.',
        'Ayr, Blackpool, Clacton, Cosford, Eastbourne, Southport, Wales, RIAT, Duxford and Shuttleworth.',
        'camping-layout/img/efcf15b014547919.webp')


def main():
    os.makedirs(OUT, exist_ok=True)
    for slug, title, extra, body in POSTERS:
        html = PAGE.format(title=title, css=CSS.strip(), extra=extra.strip(), body=body.strip('\n'))
        with open(os.path.join(OUT, slug + '.html'), 'w', encoding='utf-8') as f:
            f.write(html)
        print('wrote posters/%s.html' % slug)


if __name__ == '__main__':
    main()
