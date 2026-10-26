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
    # key, source file, tab label, page title, intro, banner alt text, banner focus
    ("privacy", "privacy.txt", "Privacy Policy", "Privacy Policy", "What I collect, why I collect it, who else handles it and the rights you have.", "U.S. Air Force RC-135 reconnaissance jet landing over trees at RAF Fairford", "center 45%"),
    ("cookies", "cookies.txt", "Cookie Policy", "Cookie Policy", "What the site saves on your device, why, and how to say no.", "Fiat G.91 in the blue Frecce Tricolori scheme taxiing past other aircraft", "center 52%"),
    ("terms", "terms.txt", "Terms and Disclaimer", "Website Terms and Disclaimer", "Using the site, checking details before you travel and what I am responsible for.", "French Navy Atlantique patrol aircraft banking against a cloudy sky", "center 50%"),
    ("community", "community.txt", "Community Rules", "Community Rules", "How the forum, My Airshow Hub and Show Day stay friendly, useful and safe.", "Grumman Wildcat in invasion stripes parked on the flight line at Duxford", "center 55%"),
    ("copyright", "copyright.txt", "Copyright and Photos", "Copyright, Photos and Contributors", "Who owns the photos and guides, how guest photographers are credited, and how to get your work taken down.", "Apache attack helicopter hovering low over a line of trees", "center 45%"),
    ("traders", "traders.txt", "Traders and Paid Plans", "Traders and Paid Plans Terms", "Trader listings, paid plans, renewals and your right to cancel.", "Douglas Invader in USAF markings flying through broken cloud", "center 50%"),
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
        t = t.replace(phrase, f'<a href="#{key}" data-tab="{key}">{phrase}</a>', 1)
    return t


def block(par, own):
    lines = [l.strip() for l in par.split("\n") if l.strip()]
    if len(lines) == 1:
        return f"<p>{inline(lines[0], own)}</p>"
    first = lines[0]
    if len(first) < 60 and not first.endswith((".", ":", "?")) and len(lines) >= 2 and lines[1].endswith("."):
        body = "".join(f"<p>{inline(l, own)}</p>" for l in lines[1:])
        return f'<div class="sub"><h3>{html.escape(first)}</h3>{body}</div>'
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


def esc(s):
    return html.escape(s, quote=True)


def build():
    imgs, tabs, panels = [], [], []
    latest = ""
    for key, path, tab, name, intro, alt, focus in POLICIES:
        updated, first, sections = parse(key, path)
        latest = latest or updated
        imgs.append(f'<img data-tab="{key}" src="policies-img/{key}.jpg" alt="{esc(alt)}" style="object-position:{focus}" draggable="false" hidden>')
        tabs.append(f'<button class="tab" role="tab" id="tab-{key}" aria-controls="panel-{key}" aria-selected="false" data-tab="{key}" tabindex="-1">{esc(tab)}</button>')
        toc = "".join(f'<li><a href="#s-{key}-{n}" data-jump="s-{key}-{n}">{n}. {esc(title)}</a></li>' for n, title, _ in sections)
        secs = "".join(f'<section class="sec" id="s-{key}-{n}"><h2>{n}. {esc(title)}</h2>{body}</section>' for n, title, body in sections)
        rows = '<div class="row"><span>Website</span><strong>www.ukairshowguide.co.uk</strong></div>'
        if first and first != updated:
            rows += f'<div class="row"><span>First published</span><strong>{esc(first)}</strong></div>'
        rows += f'<div class="row hot"><span>Last updated</span><strong>{esc(updated)}</strong></div>'
        panels.append(f"""
<div class="panel" role="tabpanel" id="panel-{key}" aria-labelledby="tab-{key}" hidden>
  <div class="layout">
    <aside class="side">
      <div class="info">
        <div class="info-title">{esc(name)}</div>
        {rows}
        <div class="bar"><i></i></div>
      </div>
      <nav class="toc" aria-label="{esc(name)} sections">
        <div class="toc-title">In this policy</div>
        <ol>{toc}</ol>
      </nav>
    </aside>
    <article class="doc">
      <h1 class="doc-title">{esc(name)}</h1>
      <p class="doc-intro">{esc(intro)}</p>
      {secs}
      <a class="top" href="#top" data-top>Back to the top <span aria-hidden="true">&uarr;</span></a>
    </article>
  </div>
</div>""")
    page = (TEMPLATE.replace("{{IMGS}}", "\n".join(imgs)).replace("{{TABS}}", "\n".join(tabs))
            .replace("{{PANELS}}", "".join(panels)).replace("{{UPDATED}}", latest))
    OUT.write_text(page)
    print("wrote", OUT, len(page), "bytes")


TEMPLATE = r"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Our Policies | The Big Guide to UK Airshows</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{
  --navy:#13293C; --navy-d:#0E2131; --teal:#32B4AF; --teal-d:#0E5F5B; --teal-l:#BFE6E3;
  --purple:#6950A1; --red:#D74949; --line:#C6C6C6; --ink:#111; --wash:#F3F5F7;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;scrollbar-width:none;-ms-overflow-style:none;background:#fff}
html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;width:0;height:0}
body{font-family:'Barlow',Arial,sans-serif;font-size:16px;line-height:1.55;color:var(--ink);font-weight:400}
a{color:var(--teal-d);font-weight:500}
a:hover{color:var(--red)}

/* Header */
.head{background:var(--navy);color:#fff}
.banner{position:relative;height:clamp(200px,38vw,480px);background:var(--navy-d);overflow:hidden}
.banner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.banner img[hidden]{display:none}
.head-in{max-width:1200px;margin:0 auto;padding:40px 32px 0}
.tag{display:inline-block;background:var(--purple);color:#fff;font-weight:600;font-size:15px;padding:6px 14px;letter-spacing:.01em}
.head h1{margin:18px 0 10px;font-size:clamp(38px,6.4vw,76px);line-height:.98;font-weight:800;text-transform:uppercase;letter-spacing:.005em}
.head p{margin:0 0 30px;max-width:640px;color:#C9D6E2;font-size:18px;line-height:1.5}
.tabs{display:flex;flex-wrap:wrap;gap:0;margin-left:-0px}
.tab{appearance:none;border:0;background:transparent;color:#fff;font:600 17px/1 'Barlow',Arial,sans-serif;
  padding:18px 24px;cursor:pointer;border-radius:0;transition:padding .4s ease,background .4s ease}
.tab:hover,.tab:focus-visible{padding-left:30px;padding-right:30px;background:var(--teal);outline:none}
.tab[aria-selected="true"]{background:var(--teal);color:#fff}
.tab:focus-visible{box-shadow:inset 0 0 0 3px #fff}

/* Layout */
.wrap{max-width:1200px;margin:0 auto;padding:40px 32px 56px}
.layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:40px;align-items:start}
.side{position:sticky;top:16px}
.info{background:var(--navy-d);border-top:4px solid var(--teal);color:#fff;padding:22px 22px 20px}
.info-title{color:var(--teal);font-weight:800;font-size:20px;line-height:1.15;text-transform:uppercase;margin-bottom:14px}
.row{display:flex;justify-content:space-between;gap:14px;padding:9px 0;font-variant-numeric:tabular-nums;font-size:15px}
.row span{color:var(--teal-l)}
.row strong{color:#fff;font-weight:700;text-align:right}
.row.hot{background:transparent;margin:6px -10px 0;padding:9px 10px}
.row.hot strong{background:var(--red);padding:2px 9px}
.bar{height:3px;background:rgba(255,255,255,.14);margin-top:16px}
.bar i{display:block;height:100%;width:100%;background:var(--teal)}
.toc{margin-top:18px;background:var(--wash);border:1px solid var(--line);padding:18px 18px 12px}
.toc-title{font-weight:700;font-size:18px;color:var(--navy);margin-bottom:8px}
.toc ol{list-style:none;margin:0;padding:0;max-height:48vh;overflow:auto;scrollbar-width:none}
.toc ol::-webkit-scrollbar{display:none}
.toc li{margin:0}
.toc a{display:block;padding:6px 8px;color:var(--navy);text-decoration:none;font-weight:500;font-size:15px;line-height:1.3;
  border-left:4px solid transparent;transition:transform .25s ease,border-color .25s ease,background .25s ease}
.toc a:hover{transform:translateX(4px);border-left-color:var(--teal);color:var(--navy)}
.toc a.on{border-left-color:var(--red);background:#fff;font-weight:600}

/* Document */
.doc{min-width:0}
.doc-title{margin:0 0 6px;font-size:clamp(28px,4vw,44px);line-height:1.04;font-weight:800;color:var(--navy);text-transform:uppercase}
.doc-intro{margin:0 0 26px;font-size:18px;color:#333;max-width:680px}
.sec{background:#fff;border:1px solid var(--line);border-left:6px solid var(--navy);padding:26px 30px 14px;margin:0 0 18px;scroll-margin-top:16px}
.sec h2{margin:0 0 14px;font-size:22px;line-height:1.2;font-weight:800;color:var(--red);text-transform:uppercase;letter-spacing:.01em}
.sec h3{margin:20px 0 4px;font-size:18px;font-weight:700;color:var(--navy)}
.sec p{margin:0 0 14px;max-width:760px}
.sec ul{margin:0 0 16px;padding:0;list-style:none;max-width:760px}
.sec li{position:relative;padding:0 0 7px 22px}
.sec li::before{content:"";position:absolute;left:0;top:.62em;width:8px;height:8px;background:var(--teal)}
.top{display:inline-block;margin-top:8px;background:var(--navy);color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;transition:background .3s ease,padding .3s ease}
.top:hover{background:var(--purple);color:#fff;padding-left:26px;padding-right:26px}

#hgt{position:fixed;right:10px;bottom:10px;background:var(--purple);color:#fff;font:600 13px/1 'Barlow',Arial,sans-serif;padding:8px 10px;z-index:9;display:none}

@media (max-width:860px){
  .head-in{padding:28px 18px 0}
  .wrap{padding:24px 16px 40px}
  .layout{grid-template-columns:1fr;gap:22px}
  .side{position:static}
  .toc ol{max-height:230px}
  .tab{flex:1 1 auto;text-align:center;padding:16px 12px;font-size:16px}
  .tab:hover,.tab:focus-visible{padding-left:12px;padding-right:12px}
  .sec{padding:20px 18px 8px}
  .sec h2{font-size:19px}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}

.sub{margin:0 0 14px}
.sub h3{margin-top:0}
.doc .sec a[data-tab]{font-weight:600}
@media (min-width:861px){.tab{padding:18px 17px;font-size:16.5px}.tab:hover,.tab:focus-visible{padding-left:21px;padding-right:21px}.tabs{flex-wrap:nowrap}}
</style>
</head>
<body id="top">
<header class="head">
  <div class="banner">
{{IMGS}}
  </div>
  <div class="head-in">
    <span class="tag">Last updated {{UPDATED}}</span>
    <h1>Our policies</h1>
    <p>How I run the site, what I do with your information, and the rules for the forum, My Airshow Hub and traders, all in plain English.</p>
    <div class="tabs" role="tablist" aria-label="Policies">
{{TABS}}
    </div>
  </div>
</header>
<main class="wrap">
{{PANELS}}
</main>
<div id="hgt"></div>
<script>
(function(){
  var DEFAULT_TAB='privacy';
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  var panels=[].slice.call(document.querySelectorAll('.panel'));
  var keys=tabs.map(function(t){return t.getAttribute('data-tab')});
  var spy=null;

  function tidy(){ /* page height helper, only when opened on its own */
    try{
      if(window.top!==window.self) return;
      var h=document.getElementById('hgt');
      h.style.display='block';
      h.textContent='Page height '+document.documentElement.scrollHeight+'px';
    }catch(e){}
  }

  function observe(panel){
    if(spy) spy.disconnect();
    if(!('IntersectionObserver' in window)) return;
    var links=[].slice.call(panel.querySelectorAll('.toc a'));
    spy=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          links.forEach(function(a){a.classList.toggle('on',a.getAttribute('data-jump')===e.target.id)});
        }
      });
    },{rootMargin:'-10% 0px -75% 0px'});
    [].slice.call(panel.querySelectorAll('.sec')).forEach(function(s){spy.observe(s)});
  }

  function setTab(key,focus,noScroll){
    if(keys.indexOf(key)<0) key=DEFAULT_TAB;
    tabs.forEach(function(t){
      var on=t.getAttribute('data-tab')===key;
      t.setAttribute('aria-selected',on?'true':'false');
      t.setAttribute('tabindex',on?'0':'-1');
      if(on&&focus) t.focus();
    });
    panels.forEach(function(p){p.hidden=(p.id!=='panel-'+key)});
    [].slice.call(document.querySelectorAll('.banner img')).forEach(function(i){i.hidden=(i.getAttribute('data-tab')!==key)});
    try{ history.replaceState(null,'','#'+key); }catch(e){}
    if(!noScroll){ try{ window.scrollTo(0,0); }catch(e){} }
    observe(document.getElementById('panel-'+key));
    tidy();
  }

  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){setTab(t.getAttribute('data-tab'))});
    t.addEventListener('keydown',function(e){
      var n=null;
      if(e.key==='ArrowRight') n=(i+1)%tabs.length;
      else if(e.key==='ArrowLeft') n=(i-1+tabs.length)%tabs.length;
      else if(e.key==='Home') n=0;
      else if(e.key==='End') n=tabs.length-1;
      if(n!==null){e.preventDefault();setTab(keys[n],true)}
    });
  });

  document.addEventListener('click',function(e){
    var a=e.target.closest?e.target.closest('a'):null;
    if(!a) return;
    if(a.hasAttribute('data-tab')){e.preventDefault();setTab(a.getAttribute('data-tab'));return}
    if(a.hasAttribute('data-jump')){
      e.preventDefault();
      var el=document.getElementById(a.getAttribute('data-jump'));
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    if(a.hasAttribute('data-top')){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}
  });

  var start=(location.hash||'').replace('#','');
  setTab(keys.indexOf(start)>=0?start:DEFAULT_TAB,false,true);
  window.addEventListener('hashchange',function(){
    var h=(location.hash||'').replace('#','');
    if(keys.indexOf(h)>=0) setTab(h);
  });
  window.addEventListener('resize',tidy);
})();
</script>
<!-- mobile-fit: keeps every part of the page inside the screen on phones and tablets. Same block in every page and template. -->
<style id="mobile-fit">
  img,video,iframe{max-width:100%}
  h1,h2,h3,h4,p,li,dd,dt,td,th,a,button,figcaption,label{overflow-wrap:break-word}
  .layout>*,.row>*{min-width:0}
  @media (max-width:860px){.tab{flex:1 1 45%}}
  @media (max-width:440px){.head h1{font-size:36px}.row{flex-wrap:wrap}.row strong{text-align:left}}
  @media (pointer:coarse){.tab,.toc a{min-height:44px}}
</style>
<!-- mobile-fit -->
</body>
</html>
"""

if __name__ == "__main__":
    build()
