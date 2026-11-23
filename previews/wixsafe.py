"""Make a built feature page's styles work inside the live site as well as on its own.

On ukairshowguide.co.uk the page is not shown in a frame: the site's airshow-page element puts it inside its own
container (div.ae-body) and rewrites the page's styles, turning `html` and `body` into `.ae-body`. A new design rule
written as `html.nz body main ...` then becomes `.ae-body.nz .ae-body main ...`, which looks for one container inside
another, so it never matches on the live site. That is why the live pages did not match the previews (the old page
header showed under "Everything you need for the day", buttons lost their style, and so on). Found 22 Nov 2026.

Writing the same rules as `body:not(.nzx):not(nzx) main ...` works in both places: on its own the page has a body,
and on the site `body` becomes `.ae-body`, which is the container itself. The two :not() parts never exclude
anything; they only keep each rule exactly as strong as `html.nz body` was (one class and two element names), so
the rules still win over the older page's own styles. The new design script always runs on these pages, so the
nz class was never doing anything else.

Rules written as `html body ...` (some older pages have them) break in the same way and become
`body:not(nzx) ...`, again exactly as strong as before.

Second problem, same cause: many of the pages' own scripts add a <style> to document.head (or document.body). On
the live site that is the Wix page's head, outside the guide's container, so those styles never reach the guide (on
Clacton, the Overview, Getting there and topic layouts all come from them). The build therefore puts a small guard
in front of the page's first script (STYLE_GUARD below). Only when the page is inside the site's airshow-page
element, it moves each of those styles (listed by id at build time) into the guide's container as soon as the site has
created it and rewrites html,
body and :root in its selectors the way the site does for the page's own styles. A placeholder with the same id stays
in the head, so scripts that check whether their style is already there still find it. On its own the guard does
nothing at all.

Frame content (<template> blocks, shown in their own documents) is left exactly as it is.
"""
import re

SAFE = 'body:not(.nzx):not(nzx)'
SAFE_PLAIN = 'body:not(nzx)'
_PLAIN = re.compile(r'(?<![\w.#-])html body\b')


def _fix(css: str) -> str:
    return _PLAIN.sub(SAFE_PLAIN, css.replace('html.nz body', SAFE))


_TEMPLATE = re.compile(r'<template\b[\s\S]*?</template>')


_STYLE_ID = re.compile(r"createElement\(\s*['\"]style['\"]\s*\)[\s\S]{0,700}?\.id\s*=\s*['\"]([\w-]+)['\"]")

STYLE_GUARD = r"""<script id="ukag-style-guard">/* see previews/wixsafe.py: on the live site, styles the page's scripts add to the
   Wix page head are moved into the guide's container, so the page looks the same as on its own */
(function(){if(window.__ukagStyleGuard)return;window.__ukagStyleGuard=1;
var IDS=__IDS__;
function root(){var D=(document.head&&document.head.ownerDocument)||document,a=D.getElementsByTagName('airshow-page');for(var i=0;i<a.length;i++){var r=a[i].shadowRoot;if(r&&r.querySelector('.ae-body'))return r;}try{var e=document.querySelector('.ae-body')||document.documentElement,g=e&&e.getRootNode&&e.getRootNode();if(g&&g.host&&g.querySelector('.ae-body'))return g;}catch(x){}return null;}
function sel(s){return s.replace(/(^|[\s,>+~(])html(\.[\w-]+)*\s+body(?![\w-])/g,'$1.ae-body').replace(/(^|[\s,>+~(])(html|body)(?![\w-])/g,'$1.ae-body').replace(/:root\b/g,':host');}
function css(t){return t.replace(/(^|[{};])([^{};@]*)\{/g,function(m,a,s){return a+sel(s)+'{';});}
var pend=[],tries=0,timer=0,AP=Node.prototype.appendChild,IB=Node.prototype.insertBefore;
function move(n,r){if(n.__ukagMoved||!n.parentNode)return;n.__ukagMoved=1;var ph=document.createElement('style');ph.id=n.id;ph.setAttribute('data-ukag-moved','');
 IB.call(n.parentNode,ph,n);n.textContent=css(n.textContent||'');AP.call(r,n);
 new MutationObserver(function(){var c=css(n.textContent||'');if(c!==n.textContent)n.textContent=c;}).observe(n,{childList:true,characterData:true,subtree:true});}
function flush(){timer=0;var r=root();if(r){while(pend.length)move(pend.shift(),r);return;}
 if(++tries<240)timer=setTimeout(flush,250);}
function wrap(proto,name,orig){proto[name]=function(n){var out=orig.apply(this,arguments);
 if(n&&n.tagName==='STYLE'&&n.id&&!n.hasAttribute('data-ukag-moved')&&IDS.indexOf(n.id)>-1&&(this===document.head||this===document.body||this===document.documentElement||(this&&this.ownerDocument===document.head.ownerDocument&&(this.tagName==='HEAD'||this.tagName==='BODY'||this.tagName==='HTML')))){pend.push(n);if(!timer)flush();}
 return out;};}
wrap(Node.prototype,'appendChild',AP);wrap(Node.prototype,'insertBefore',IB);
})();</script>"""


def _guard(html: str) -> str:
    ids = sorted(set(_STYLE_ID.findall(_TEMPLATE.sub('', html))))
    if not ids or 'id="ukag-style-guard"' in html:
        return html
    g = STYLE_GUARD.replace('__IDS__', '[' + ','.join("'" + i + "'" for i in ids) + ']')
    # before the first script, and again just inside <body> in case the site runs only the body's scripts
    i = html.find('<script')
    html = html[:i] + g + html[i:]
    blocked = [(s.start(), s.end()) for s in re.finditer(r'<script\b[\s\S]*?</script>|<template\b[\s\S]*?</template>', html)]
    for m in re.finditer(r'<body\b[^>]*>', html):
        if m.start() > i and not any(a <= m.start() < b for a, b in blocked):
            html = html[:m.end()] + g + html[m.end():]
            break
    return html


def wix_safe(html: str) -> str:
    html = _guard(html)
    out, last = [], 0
    for m in _TEMPLATE.finditer(html):
        out.append(_fix(html[last:m.start()]))
        out.append(m.group(0))
        last = m.end()
    out.append(_fix(html[last:]))
    return ''.join(out)
