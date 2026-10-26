"""Builds policies.html from the plain text policies in policies-src/.

Edit a .txt file in policies-src/, run `python3 tools-policies.py`, then commit.
The same text is also kept in the Wix CMS collection "UK Air Show Guide Policy's"
(the /ourpolicys list page), so paste any change there too.
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "policies-src"
OUT = ROOT / "policies.html"

POLICIES = [
    ("privacy", "privacy.txt", "Privacy Policy", "What I collect, why, who else sees it and your rights."),
    ("cookies", "cookies.txt", "Cookie Policy", "What the site saves on your device and how to say no."),
    ("terms", "terms.txt", "Website Terms and Disclaimer", "Using the site, checking before you travel and what I am responsible for."),
    ("community", "community.txt", "Community Rules", "How the forum, My Airshow Hub and Show Day stay friendly and safe."),
    ("copyright", "copyright.txt", "Copyright, Photos and Contributors", "Who owns what, sharing my work and getting your work taken down."),
    ("traders", "traders.txt", "Traders and Paid Plans Terms", "Listings, paid plans, renewals and your right to cancel."),
]

# Words that keep their capitals when a heading is put into sentence case.
KEEP = {
    "i": "I", "uk": "UK", "riat": "RIAT", "show day": "Show Day", "my airshow hub": "My Airshow Hub",
    "community rules": "Community Rules", "online safety act": "Online Safety Act",
}

# Phrases in the text that link to another policy tab.
CROSS = [
    ("Traders and Paid Plans Terms", "traders"),
    ("Copyright and Contributors page", "copyright"),
    ("Community Rules", "community"),
    ("Privacy Policy", "privacy"),
    ("Cookie Policy", "cookies"),
    ("Website Terms", "terms"),
]


def sentence(s):
    s = s.strip().lower()
    s = s[0].upper() + s[1:]
    for k, v in KEEP.items():
        s = re.sub(r"\b" + re.escape(k) + r"\b", v, s, flags=re.I)
    return s


def inline(text, own):
    t = html.escape(text, quote=False)
    t = re.sub(r"([\w.]+@[\w.]+\.[a-z]{2,})", r'<a href="mailto:\1">\1</a>', t)
    t = re.sub(r"\b(www\.[\w.]+\.(?:co\.uk|com|org))", r'<a href="https://\1" target="_blank" rel="noopener">\1</a>', t)
    t = re.sub(r"\b(ico\.org\.uk)\b", r'<a href="https://ico.org.uk" target="_blank" rel="noopener">\1</a>', t)
    t = re.sub(r"\b(0303 123 1113)\b", r'<a href="tel:03031231113">\1</a>', t)
    for phrase, key in CROSS:
        if key == own:
            continue
        t = t.replace(phrase, f'<a href="#{key}" data-go="{key}">{phrase}</a>', 1)
    return t


def block(par, own):
    lines = [l.strip() for l in par.split("\n") if l.strip()]
    if len(lines) == 1:
        return f"<p>{inline(lines[0], own)}</p>"
    first = lines[0]
    if len(first) < 60 and not first.endswith((".", ":", "?")) and len(lines) >= 2 and lines[1].endswith("."):
        body = "".join(f"<p>{inline(l, own)}</p>" for l in lines[1:])
        return f'<div class="sub"><h4>{html.escape(first)}</h4>{body}</div>'
    return "<ul>" + "".join(f"<li>{inline(l, own)}</li>" for l in lines) + "</ul>"


def parse(key, path):
    raw = (SRC / path).read_text().strip()
    head, _, rest = raw.partition("\n1. ")
    rest = "1. " + rest
    updated = re.search(r"Last updated: (.+)", head).group(1).strip()
    first = re.search(r"(?:first published|Policy first published|Terms first published|Rules first published): (.+)", head, re.I)
    parts = re.split(r"^(\d+)\. ([A-Z][A-Z0-9 ,&'?.]+)$", rest, flags=re.M)
    sections = []
    for i in range(1, len(parts), 3):
        num, title, body = parts[i], parts[i + 1], parts[i + 2]
        pars = [p for p in re.split(r"\n\s*\n", body.strip()) if p.strip()]
        sections.append((num, sentence(title), "".join(block(p, key) for p in pars)))
    return updated, first.group(1).strip() if first else "", sections


def build():
    nav, panels = [], []
    for i, (key, path, name, blurb) in enumerate(POLICIES):
        updated, first, sections = parse(key, path)
        nav.append(
            f'<button class="pick" type="button" role="tab" id="t-{key}" aria-controls="p-{key}" data-go="{key}">'
            f'<span class="n">{i + 1}</span><span class="nm">{name}</span><span class="bl">{blurb}</span></button>'
        )
        secs = []
        for j, (num, title, body) in enumerate(sections):
            open_attr = " open" if j == 0 else ""
            secs.append(
                f'<details class="sec"{open_attr}><summary><span class="sn">{num}</span>'
                f'<span class="st">{html.escape(title)}</span><span class="pm" aria-hidden="true"></span></summary>'
                f'<div class="sb">{body}</div></details>'
            )
        meta = f"Last updated {updated}" + (f". First published {first}." if first and first != updated else ".")
        panels.append(
            f'<section class="panel" role="tabpanel" id="p-{key}" aria-labelledby="t-{key}" data-key="{key}" hidden>'
            f'<header class="ph"><h2>{name}</h2><p class="meta">{meta}</p>'
            f'<div class="tools"><button type="button" class="ghost" data-all="open">Open every section</button>'
            f'<button type="button" class="ghost" data-print>Print or save as PDF</button></div></header>'
            f'{"".join(secs)}</section>'
        )
    page = TEMPLATE.replace("{{NAV}}", "".join(nav)).replace("{{PANELS}}", "".join(panels))
    OUT.write_text(page)
    print("wrote", OUT, len(page), "bytes")


TEMPLATE = r"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy, cookies and terms | The Big Guide to UK Airshows</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap" rel="stylesheet">
<style>
:root{
  --navy:#13293C; --navy-d:#0E2131; --teal:#32B4AF; --teal-d:#0E5F5B; --teal-p:#E8F6F5;
  --purple:#6950A1; --red:#D74949; --ink:#0B1620; --line:#DCE1E4; --page:#F2F4F5; --soft:#3A4A57;
  --ease:cubic-bezier(.22,.61,.36,1);
}
*{box-sizing:border-box;margin:0;padding:0}
/* hide the page scrollbar inside the Wix box; scrolling with a mouse wheel, trackpad or finger still works */
html,body{scrollbar-width:none;-ms-overflow-style:none}
html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;width:0;height:0}
html{scroll-behavior:smooth}
body{font-family:'Barlow',sans-serif;font-size:17px;line-height:1.6;color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
a{color:var(--teal-d);text-decoration:none;border-bottom:1px solid rgba(14,95,91,.35);transition:border-color .3s var(--ease),color .3s var(--ease)}
a:hover{color:var(--navy);border-color:var(--navy)}
.wrap{max-width:1200px;margin:0 auto;padding:0 28px}

/* Hero */
.hero{position:relative;background:var(--navy);color:#fff;overflow:hidden}
.hero::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,transparent,var(--teal),transparent);background-size:40% 100%;background-repeat:no-repeat;animation:sweep 8s var(--ease) infinite}
@keyframes sweep{0%{background-position:-40% 0}100%{background-position:140% 0}}
.hero-art{position:absolute;right:-60px;top:-20px;width:min(620px,62vw);height:auto;opacity:.9;pointer-events:none}
.hero-grid{position:relative;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);gap:48px;align-items:end;padding:58px 0 46px}
.crumb{font-size:15px;font-weight:500;color:#A9C2CF;margin-bottom:20px}
.crumb a{color:#A9C2CF;border-color:rgba(169,194,207,.4)}
.crumb a:hover{color:#fff;border-color:#fff}
.hero h1{font-family:'Barlow Condensed',sans-serif;font-weight:800;text-transform:uppercase;font-size:clamp(42px,6vw,78px);line-height:.92;max-width:13ch}
.hero h1 em{font-style:normal;color:var(--teal)}
.hero p{margin-top:18px;max-width:54ch;color:#D7E3EA;font-size:17.5px;line-height:1.6}
.hero p b{color:#fff;font-weight:600}
.promise{background:rgba(14,33,49,.9);border-top:4px solid var(--teal);padding:20px 22px;box-shadow:0 20px 50px rgba(0,0,0,.3)}
.promise h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;font-size:22px;letter-spacing:.01em}
.promise ul{list-style:none;margin-top:10px}
.promise li{position:relative;padding-left:22px;margin-top:8px;color:#D7E3EA;font-size:16px;line-height:1.45}
.promise li::before{content:"";position:absolute;left:0;top:.55em;width:10px;height:2px;background:var(--teal)}

/* Layout */
.body{background:var(--page);padding:40px 0 64px}
.layout{display:grid;grid-template-columns:minmax(250px,330px) minmax(0,1fr);gap:34px;align-items:start}
.side{position:sticky;top:18px}
.side h2{font-family:'Barlow Condensed',sans-serif;font-weight:800;text-transform:uppercase;font-size:26px;color:var(--navy);margin-bottom:12px}
.picks{display:flex;flex-direction:column;gap:6px}
.pick{position:relative;display:grid;align-content:start;grid-template-columns:34px 1fr;gap:2px 10px;text-align:left;background:#fff;padding:14px 16px 14px 12px;border-left:4px solid transparent;transition:border-color .35s var(--ease),transform .35s var(--ease),box-shadow .35s var(--ease)}
.pick:hover{transform:translateX(3px);box-shadow:0 6px 18px rgba(19,41,60,.08)}
.pick .n{grid-row:span 2;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:26px;line-height:1;color:var(--teal);padding-top:2px}
.pick .nm{font-weight:700;color:var(--navy);font-size:17px;line-height:1.25}
.pick .bl{font-size:14.5px;line-height:1.4;color:var(--soft)}
.pick[aria-selected="true"]{border-left-color:var(--red);box-shadow:0 10px 26px rgba(19,41,60,.12)}
.pick[aria-selected="true"] .n{color:var(--red)}
.help{margin-top:16px;background:var(--navy);color:#D7E3EA;padding:16px 18px;font-size:15.5px;line-height:1.5}
.help b{color:#fff;font-weight:600}
.help a{color:#fff;border-color:var(--teal)}

/* Reading panel */
.panel{background:#fff;padding:30px 34px 34px;animation:rise .5s var(--ease)}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ph h2{font-family:'Barlow Condensed',sans-serif;font-weight:800;text-transform:uppercase;font-size:clamp(30px,3.6vw,44px);line-height:1;color:var(--navy)}
.meta{margin-top:10px;font-weight:500;color:var(--teal-d);font-size:15.5px}
.tools{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 10px}
.ghost{padding:9px 16px;border:2px solid var(--navy);color:var(--navy);font-weight:600;font-size:15px;transition:background .3s var(--ease),color .3s var(--ease)}
.ghost:hover{background:var(--navy);color:#fff}
.sec{border-top:1px solid var(--line)}
.sec:last-child{border-bottom:1px solid var(--line)}
.sec summary{list-style:none;display:grid;grid-template-columns:38px 1fr 22px;gap:10px;align-items:center;padding:16px 2px;cursor:pointer}
.sec summary::-webkit-details-marker{display:none}
.sn{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:22px;color:var(--teal)}
.st{font-weight:700;font-size:19px;color:var(--navy);line-height:1.25}
.pm{position:relative;width:16px;height:16px;justify-self:end}
.pm::before,.pm::after{content:"";position:absolute;left:0;top:7px;width:16px;height:2px;background:var(--navy);transition:transform .35s var(--ease)}
.pm::after{transform:rotate(90deg)}
.sec[open] .pm::after{transform:rotate(0)}
.sec summary:hover .st{color:var(--teal-d)}
.sb{padding:0 0 20px 48px;max-width:76ch}
.sb p{margin-top:12px}
.sb p:first-child,.sb .sub:first-child{margin-top:0}
.sb ul{list-style:none;margin-top:12px}
.sb li{position:relative;padding-left:22px;margin-top:7px}
.sb li::before{content:"";position:absolute;left:2px;top:.72em;width:9px;height:9px;border:2px solid var(--teal);border-radius:50%}
.sub{margin-top:18px;padding-left:14px;border-left:3px solid var(--teal-p)}
.sub h4{font-weight:600;color:var(--navy);font-size:17.5px}
.sub p{margin-top:4px}

/* Phones and tablets */
@media (max-width:900px){
  .hero-grid{grid-template-columns:1fr;gap:26px;padding:44px 0 34px}
  .layout{grid-template-columns:1fr;gap:18px}
  .side{position:static}
  .picks{flex-direction:row;overflow-x:auto;scrollbar-width:none;margin:0 -28px;padding:0 28px 4px}
  .picks::-webkit-scrollbar{display:none}
  .pick{flex:0 0 230px;border-left:0;border-top:4px solid transparent}
  .pick:hover{transform:none}
  .pick[aria-selected="true"]{border-top-color:var(--red)}
  .help{display:none}
}
@media (max-width:560px){
  .wrap{padding:0 18px}
  .picks{margin:0 -18px;padding:0 18px 4px}
  .panel{padding:22px 18px 24px;margin:0 -18px}
  .sb{padding-left:0}
  .sec summary{grid-template-columns:30px 1fr 18px}
  .hero-art{opacity:.35}
}
@media print{
  .hero,.side,.tools{display:none}
  .body{background:#fff;padding:0}
  .layout{display:block}
  .panel{padding:0}
  .sec .sb{display:block}
}
</style>
</head>
<body>
<header class="hero">
  <svg class="hero-art" viewBox="0 0 620 300" fill="none" aria-hidden="true">
    <path d="M40 250 C200 230 330 170 600 40" stroke="#32B4AF" stroke-width="2" stroke-dasharray="2 10" opacity=".7"/>
    <path d="M10 280 C210 262 360 200 610 90" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="1 12" opacity=".35"/>
    <g transform="translate(470 86) rotate(-24)"><path d="M0 0 L58 -6 L70 0 L58 6 Z" fill="#D74949"/><path d="M22 -2 L4 -26 L14 -26 L38 -3 Z M22 2 L4 26 L14 26 L38 3 Z" fill="#D74949"/><path d="M0 0 L-8 -10 L-2 -10 L8 -1 Z M0 0 L-8 10 L-2 10 L8 1 Z" fill="#D74949"/></g>
  </svg>
  <div class="wrap hero-grid">
    <div>
      <div class="crumb"><a href="https://www.ukairshowguide.co.uk" target="_top">Home</a> &nbsp;/&nbsp; Privacy, cookies and terms</div>
      <h1>The small print, <em>in plain English</em></h1>
      <p>These pages explain how I run the site, what I do with your information and the rules for the forum and My Airshow Hub. I have kept them as short and clear as I can, so you can find the bit you need and get back to planning your day.</p>
    </div>
    <aside class="promise">
      <h3>My promises to you</h3>
      <ul>
        <li>Every guide is free to read without giving me any details.</li>
        <li>I never sell your information or use it for advertising.</li>
        <li>Your planning tools are private to you.</li>
        <li>You can see, change or delete your information whenever you like.</li>
      </ul>
    </aside>
  </div>
</header>
<main class="body">
  <div class="wrap layout">
    <nav class="side" aria-label="Policies">
      <h2>Choose a policy</h2>
      <div class="picks" role="tablist">{{NAV}}</div>
      <div class="help"><b>Something not right?</b> Email <a href="mailto:contactus@ukairshowguide.co.uk">contactus@ukairshowguide.co.uk</a> and I will get back to you.</div>
    </nav>
    <div class="read">{{PANELS}}</div>
  </div>
</main>
<script>
(function(){
  var keys=[].map.call(document.querySelectorAll('.panel'),function(p){return p.dataset.key});
  function show(key,scroll){
    if(keys.indexOf(key)<0)key=keys[0];
    document.querySelectorAll('.panel').forEach(function(p){p.hidden=p.dataset.key!==key});
    document.querySelectorAll('.pick').forEach(function(b){
      var on=b.dataset.go===key;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;
      if(on&&b.scrollIntoView&&window.innerWidth<=900)b.scrollIntoView({block:'nearest',inline:'center'});
    });
    try{history.replaceState(null,'','#'+key)}catch(e){}
    if(scroll){var r=document.querySelector('.read');window.scrollTo({top:r.getBoundingClientRect().top+window.scrollY-12,behavior:'smooth'})}
  }
  document.addEventListener('click',function(e){
    var go=e.target.closest('[data-go]');
    if(go){e.preventDefault();show(go.dataset.go,true);return}
    var all=e.target.closest('[data-all]');
    if(all){
      var panel=all.closest('.panel'),open=all.dataset.all==='open';
      panel.querySelectorAll('details').forEach(function(d){d.open=open});
      all.dataset.all=open?'close':'open';all.textContent=open?'Close every section':'Open every section';return}
    if(e.target.closest('[data-print]')){
      var p=e.target.closest('.panel');p.querySelectorAll('details').forEach(function(d){d.open=true});window.print()}
  });
  document.querySelector('.picks').addEventListener('keydown',function(e){
    if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'&&e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
    var cur=keys.indexOf(document.querySelector('.pick[aria-selected="true"]').dataset.go);
    var next=keys[(cur+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:keys.length-1))%keys.length];
    e.preventDefault();show(next,false);document.getElementById('t-'+next).focus();
  });
  var start=(location.hash||'').slice(1);
  try{var q=new URLSearchParams(location.search).get('policy');if(q)start=q}catch(e){}
  show(start,false);
  window.addEventListener('hashchange',function(){show(location.hash.slice(1),true)});
})();
</script>
<!-- mobile-fit: keeps every part of the page inside the screen on phones and tablets. Same block in every page and template. -->
<style id="mobile-fit">
  img,video,iframe,svg{max-width:100%}
  h1,h2,h3,h4,p,li,dd,dt,td,th,a,button,figcaption,label,summary{overflow-wrap:break-word}
  .hero-grid>*,.layout>*,.pick>*{min-width:0}
  @media (max-width:440px){.hero h1{font-size:40px}.pick{flex-basis:200px}.tools .ghost{flex:1 1 auto;text-align:center}}
  @media (pointer:coarse){.pick,.ghost,.sec summary{min-height:44px}}
</style>
<!-- mobile-fit -->
</body>
</html>
"""

if __name__ == "__main__":
    build()
