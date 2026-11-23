<script id="fares-board-js">
(function(){
  var root=document.querySelector('.nss:not(.tp-fares)'); if(!root) return;   /* Cosford has no Ways in picker board (Duxford has none), so this part waits for one */
  var MODE={'Park and Ride':['P+R','#2BA84A','#fff'],'By train':['Train','#D74949','#fff'],'By bus':['Bus','#00A6E2','#13293C'],'By coach':['Coach','#C2255C','#fff'],'By road':['Road','#F2B233','#13293C'],'Access & taxis':['Taxi','#6950A1','#fff']};
  function tick(){ var d=new Date(),c=root.querySelector('#nssClock'); if(c) c.textContent=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); }
  tick(); setInterval(tick,20000);
  function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function build(){
    var pl=document.getElementById('parkList'), box=root.querySelector('#nssRows');
    if(!pl||!pl.querySelector('button')) return false;
    var g=null,n=0,html='';
    [].forEach.call(pl.children,function(el){
      if(el.tagName!=='BUTTON'){ g=MODE[el.textContent.trim()]||['Info','#13293C','#fff']; return; }
      var sm=el.querySelector('small'), sub=sm?sm.textContent:'', name=el.querySelector('span')?el.querySelector('span').firstChild.textContent:el.textContent;
      n++;
      html+='<button type="button" class="nss-row" role="option" aria-selected="false" data-id="'+el.dataset.id+'" style="--c:'+g[1]+';--i:'+g[2]+'"><span class="nss-n">'+n+'</span><span class="nss-badge">'+g[0]+'</span><span class="nss-dest">'+esc(name.trim())+'</span><span class="nss-note">'+esc(sub)+'</span><span class="nss-when" aria-hidden="true">&rsaquo;</span></button>';
    });
    box.innerHTML=html;
    mark();
    return true;
  }
  function mark(){
    var pl=document.getElementById('parkList'), cur=pl&&pl.querySelector('button[aria-pressed="true"]');
    var id=cur?cur.dataset.id:null;
    root.querySelectorAll('.nss-row').forEach(function(r){ r.setAttribute('aria-selected',String(r.dataset.id===id)); });
  }
  root.addEventListener('click',function(e){
    var r=e.target.closest('.nss-row'); if(!r) return;
    var b=document.querySelector('#parkList button[data-id="'+r.dataset.id+'"]'); if(b) b.click();
    setTimeout(mark,30);
    var card=document.querySelector('#travel .xd-card');
    if(card){ setTimeout(function(){ var y=card.getBoundingClientRect().top+pageYOffset-70; window.scrollTo({top:y,behavior:'smooth'}); },60); }
  });
  var tries=0; (function wait(){ if(build()) { var pl=document.getElementById('parkList'); new MutationObserver(mark).observe(pl,{attributes:true,subtree:true,attributeFilter:['aria-pressed']}); return; } if(++tries<80) setTimeout(wait,150); })();
})();
</script>