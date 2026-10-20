"""Ways to arrive drawn as a route line, in the same family as the Display line
used for Pick your spot. Run from the repo root: python3 tools-arrive-line.py
It is safe to run again: an existing ar block is replaced."""
import re, sys, pathlib

PAGES = ['ayr', 'blackpool', 'clacton', 'cosford', 'duxford', 'eastbourne', 'gransden',
         'headcorn', 'midlands', 'riat', 'shuttleworth', 'southport', 'wales']

HOOK = ("if(window.arRender){ window.arRender(list.map(function(t){ var b=OPT_BADGE[t.id]; "
        "return {id:t.id,name:t.title,kind:t.opt[0],group:groupOf[t.id],tag:b?b[0]:'',text:t.opt[1],rows:t.meta}; }),og,ost); }\n    ")

BLOCK = r'''<!-- arrive-line: Ways to arrive drawn as a route line, matching the Display line used for Pick your spot. -->
<style id="ar-css">
#optGrid.dl{display:block!important;position:relative;padding-left:58px;margin-top:6px}
.dl.dl-ar::before{top:34px;bottom:30px}
.dl-ar .dl-pin{left:-56px;top:14px;width:42px;height:42px;border-radius:50%;background:#fff;border:2px solid #13293C;color:#13293C;transition:transform .5s cubic-bezier(.2,.8,.2,1),background .35s,color .35s}
.dl-ar .dl-pin svg{width:22px;height:22px}
.dl-ar .dl-card:hover .dl-pin{transform:translateY(-4px);background:#32B4AF;color:#fff;border-color:#32B4AF}
.dl-ar .dl-c0 .dl-pin{background:#D74949;border-color:#D74949;color:#fff}
.dl-ar .dl-cols,.dl-ar .dl-row{grid-template-columns:72px minmax(0,1.4fr) minmax(0,1fr) 150px 34px}
.dl-ar .dl-name small{display:block;font:600 13px/1.3 "Barlow",sans-serif;color:#4F6272;margin-bottom:2px;transition:color .35s .1s}
.dl-ar .dl-row:hover .dl-name small,.dl-ar .dl-row:focus-visible .dl-name small{color:#BFD3DE}
.dl-ar .dl-key{display:grid;gap:2px}
.dl-ar .dl-key b{font:700 15px/1.25 "Barlow",sans-serif;color:#13293C;transition:color .35s .1s}
.dl-ar .dl-key small{font:500 13px/1.2 "Barlow",sans-serif;color:#4F6272;transition:color .35s .1s}
.dl-ar .dl-row:hover .dl-key b,.dl-ar .dl-row:focus-visible .dl-key b{color:#fff}
.dl-ar .dl-row:hover .dl-key small,.dl-ar .dl-row:focus-visible .dl-key small{color:#BFD3DE}
.dl-ar .dl-tag:empty{visibility:hidden}
.dl-ar .dl-facts div.hl span{color:#F2B233}
@media (max-width:900px){
  .dl-ar .dl-row{grid-template-columns:58px minmax(0,1fr) 34px}
  .dl-ar .dl-row .dl-key{grid-column:2;grid-row:3}
  .dl-ar .dl-tag:empty{display:none}
}
@media (max-width:520px){#optGrid.dl{padding-left:46px}.dl-ar .dl-pin{left:-48px;width:36px;height:36px}.dl-ar .dl-pin svg{width:18px;height:18px}}
</style>
<script id="ar-js">
(function(){
  var open={};
  function e(t){return String(t==null?'':t).replace(/&(?![a-z#0-9]+;)/gi,'&amp;').replace(/</g,'&lt;');}
  function kindOf(x){
    var s=(x.id+' '+(x.group||'')+' '+(x.tag||'')+' '+(x.kind||'')).toLowerCase();
    if(/blue|disab|access/.test(x.id)||/^accessible/.test((x.tag||'').toLowerCase())) return 'access';
    if(/rail|train/.test(s)) return 'train';
    if(/taxi/.test(s)) return 'taxi';
    if(/tram|bus|taxi|shuttle|park and ride|park &amp; ride|\bpr\b/.test(s)) return 'bus';
    if(/walk/.test(s)) return 'walk';
    if(/camp/.test(s)) return 'tent';
    if(/park/.test(s)) return 'park';
    return 'car';
  }
  var PRE={taxi:'TXI',access:'ACC',train:'TRN',bus:'BUS',walk:'WLK',tent:'CMP',park:'P',car:'RD'};
  var ICON={walk:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="13" cy="4" r="2" fill="currentColor"/><path d="M10 21l2-6 3 3v3M9 11l3-3 3 3 3 1M12 8l-1 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            park:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 17V7h3a3 3 0 0 1 0 6h-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
  function icon(k){var R=window.RICON||{};return ICON[k]||R[k==='taxi'?'car':k]||R.car||'';}
  window.arRender=function(list,box,st){
    var counts={}, seen={};
    list.forEach(function(x){var p=PRE[kindOf(x)];counts[p]=(counts[p]||0)+1;});
    var top=(!st||(st.f==='all'&&st.sort==='rec'));
    var rows=list.map(function(x,i){
      var k=kindOf(x), p=PRE[k]; seen[p]=(seen[p]||0)+1;
      var code=counts[p]>1?p+seen[p]:p, c0=top&&i===0, o=open[x.id]?' dl-open':'';
      var key=(x.rows&&x.rows[0])||['',''];
      var facts=(x.tag?'<div class="hl"><span>Good to know</span><b>'+e(x.tag)+'</b></div>':'')+(x.rows||[]).map(function(r){return '<div><span>'+e(r[0])+'</span><b>'+e(r[1])+'</b></div>';}).join('');
      return '<article class="dl-card'+(c0?' dl-c0':'')+o+'" data-dl="'+e(x.id)+'"><span class="dl-pin" aria-hidden="true">'+icon(k)+'</span>'
        +'<button type="button" class="dl-row" aria-expanded="'+(!!open[x.id])+'"><span class="dl-code'+(code.length>3?' dl-long':'')+'">'+code+'</span>'
        +'<h3 class="dl-name"><small>'+e(x.kind)+'</small>'+e(x.name)+'</h3><span class="dl-tag">'+e(x.tag)+'</span>'
        +'<span class="dl-key"><b>'+e(key[1])+'</b><small>'+e(key[0])+'</small></span><span class="dl-pm" aria-hidden="true"><span>+</span></span></button>'
        +'<div class="dl-body"><div><p>'+e(x.text)+'</p></div>'+(facts?'<div class="dl-facts">'+facts+'</div>':'<div></div>')
        +'<div class="dl-foot"><button type="button" class="btn small" data-topic="'+e(x.id)+'">See on the map</button><button type="button" class="btn small outline" data-topic="'+e(x.id)+'">More information</button></div></div></article>';
    }).join('');
    box.className='dl dl-ar reveal in';
    box.innerHTML=list.length?'<div class="dl-cols" aria-hidden="true"><span>Route</span><span>Way in</span><span>Good to know</span><span>At a glance</span><span></span></div>'+rows
      :'<p class="cards-empty">Nothing matches that filter.</p>';
    if(!box.__arb){ box.__arb=1; box.addEventListener('click',function(ev){
      var b=ev.target.closest('.dl-row'); if(!b||!box.contains(b)) return;
      var card=b.closest('.dl-card'), id=card.getAttribute('data-dl'); open[id]=!open[id];
      card.classList.toggle('dl-open',!!open[id]); b.setAttribute('aria-expanded',String(!!open[id]));
      if(window.parent&&window.parent!==window){ try{ window.dispatchEvent(new Event('resize')); }catch(err){} }
    }); }
  };
  var os=document.getElementById('optSort'); if(os&&document.getElementById('optGrid')){ try{ os.dispatchEvent(new Event('change')); }catch(err){} }
})();
</script>
'''

def patch(path):
    s = path.read_text()
    # hook inside renderOpts, just before the data-topic binding on og
    anchor = "og.querySelectorAll('[data-topic]').forEach(function(b){ b.addEventListener('click',function(){ setTopic(b.dataset.topic,true);"
    if 'window.arRender' not in s:
        assert s.count(anchor) == 1, (path, s.count(anchor))
        s = s.replace(anchor, HOOK + anchor)
    s = re.sub(r'<!-- arrive-line:.*?</script>\n', '', s, flags=re.S)
    # after the Display line block (end of file)
    s = s.rstrip('\n') + '\n' + BLOCK
    path.write_text(s)

if __name__ == '__main__':
    names = sys.argv[1:] or PAGES
    for n in names:
        patch(pathlib.Path('camping-layout') / (n + '.html'))
        print('patched', n)
