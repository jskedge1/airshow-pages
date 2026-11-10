"""On every bus route page for a show with more than one bus: a "Change bus" menu under the destination blind listing
the other buses for that show, so you can switch without going back to the list (10 Nov 2026, Jack's comment).
On the site it opens /bus-route?r=<id>; on GitHub or a preview it opens the page next to it. Safe to run again.
run: python3 bus-routes-src/add_routeswitch.py"""
import glob, os, re, json, html, collections
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
R = json.load(open('bus-routes-src/routes.json'))
info = {}
for x in R:
    f = 'bus-routes/%s.html' % x['id']
    if not os.path.exists(f): continue
    m = re.search(r'var CFG\s*=\s*(\{.*?\});\n', open(f).read(), re.S)
    c = json.loads(m.group(1)) if m else {}
    t = re.sub(r'^Bus [^,]+, ', '', c.get('title', ''))
    info[x['id']] = dict(num=x['num'], show=x['show'], ft=t, op=c.get('operator', ''), c1=c.get('theme', {}).get('op1', '#13293C'), ink=c.get('theme', {}).get('opink', '#fff'), sname=c.get('showName', ''))
G = collections.defaultdict(list)
for x in R:
    if x['id'] in info: G[x['show']].append(x['id'])
def nk(i): n = info[i]['num']; m = re.match(r'([A-Za-z]*)(\d+)([A-Za-z]*)', n); return (m.group(1).upper(), int(m.group(2)), m.group(3)) if m else (n, 0, '')
CSS = '''<style id="rs-switch">
.bsw{display:flex;align-items:stretch;gap:0;margin:-6px 0 20px;max-width:100%;width:max-content;background:#05090D;border:2px solid rgba(255,255,255,.14);position:relative;transition:border-color .25s}
.bsw:hover,.bsw:focus-within{border-color:var(--led,#F2B233)}
.bsw span{display:flex;align-items:center;gap:8px;padding:0 12px;font:700 15px/1 var(--f);color:#fff;background:rgba(255,255,255,.08);white-space:nowrap}
.bsw span i{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:22px;padding:0 4px;font:800 14px/1 var(--c,var(--f));font-style:normal;background:var(--led,#F2B233);color:#05090D}
.bsw select{appearance:none;-webkit-appearance:none;border:0;border-radius:0;background:transparent;color:#fff;font:600 15.5px/1.2 var(--f);padding:11px 46px 11px 12px;max-width:min(62vw,480px);cursor:pointer;text-overflow:ellipsis}
.bsw select option{color:#13293C;background:#fff}
.bsw::after{content:"";position:absolute;right:15px;top:50%;width:8px;height:8px;margin-top:-6px;border-right:2.5px solid var(--led,#F2B233);border-bottom:2.5px solid var(--led,#F2B233);transform:rotate(45deg);pointer-events:none}
.bsw select:focus-visible{outline:none}
@media(max-width:640px){.bsw{width:100%;flex-direction:column}.bsw span{padding:9px 10px;font-size:14px;white-space:normal}.bsw select{width:100%;max-width:none;font-size:16px;padding:12px 40px 12px 10px}.bsw::after{top:auto;bottom:18px;margin-top:0}}
</style>
'''
JS = '''<script id="rs-switch-js">(function(){
  var s = document.getElementById('bswSel'); if (!s) return;
  var site = /ukairshowguide/.test(location.hostname);
  s.addEventListener('change', function(){
    var id = s.value; if (!id) return;
    var u = site ? 'https://www.ukairshowguide.co.uk/bus-route?r=' + id : id + '.html';
    try { (site ? window.top : window).location.href = u; } catch (e) { location.href = u; }
  });
})();</script>
'''
A = '<h1 id="title"></h1>'
n = 0
for show, ids in G.items():
    if len(ids) < 2: continue
    ids = sorted(ids, key=nk)
    for me in ids:
        f = 'bus-routes/%s.html' % me; s = open(f).read()
        s = re.sub(r'<style id="rs-switch">.*?</style>\n', '', s, flags=re.S)
        s = re.sub(r'<script id="rs-switch-js">.*?</script>\n', '', s, flags=re.S)
        s = re.sub(r'<label class="bsw".*?</label>\n?', '', s, flags=re.S)
        if s.count(A) != 1: print('SKIP', f); continue
        opts = ''.join('<option value="%s"%s>%s, %s%s</option>' % (i, ' selected' if i == me else '', html.escape(info[i]['num']), html.escape(info[i]['ft']), ' (this bus)' if i == me else '') for i in ids)
        others = len(ids) - 1
        lab = ('<label class="bsw"><span><i><svg viewBox="0 0 20 16" width="18" height="14" aria-hidden="true"><rect x="1" y="1" width="18" height="11" rx="2" fill="#05090D"/><rect x="3" y="3" width="4" height="4" fill="#F2B233"/><rect x="8" y="3" width="4" height="4" fill="#F2B233"/><rect x="13" y="3" width="4" height="4" fill="#F2B233"/><circle cx="5" cy="13" r="2" fill="#05090D"/><circle cx="15" cy="13" r="2" fill="#05090D"/></svg></i>Change bus, %d more for %s</span><select id="bswSel" aria-label="Change to another bus for %s">%s</select></label>\n'
               % (others, html.escape(info[me]['sname'] or show.title()), html.escape(info[me]['sname'] or show.title()), opts))
        s = s.replace(A, lab + '      ' + A)
        s = s.replace('</head>', CSS + '</head>', 1)
        k = s.rfind('</body>'); s = s[:k] + JS + s[k:]
        open(f, 'w').write(s); n += 1
print(n, 'pages')
