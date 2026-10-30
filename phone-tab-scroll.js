/* Phone tab scroll
   On a phone the option buttons sit above the part of the page they open, so a tap can
   change something off screen and look like nothing happened. After a tap on an option
   button (aria-pressed, aria-selected or role="tab"), this watches what the tap changes
   further down the page and, if that part is mostly out of view, scrolls down to it.
   Works inside the Wix box too: the IntersectionObserver checks against the real screen. */
(function(){
  if(window.UKAG_PHONE_TAB_SCROLL) return;
  window.UKAG_PHONE_TAB_SCROLL=true;
  if(!('MutationObserver' in window)||!('IntersectionObserver' in window)) return;

  var phone=window.matchMedia('(max-width: 767px)');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  var SKIP='.tablist,[data-no-jump],#snMenu,.sn-nav,#pageHeight';
  var WATCH_MS=520;

  function isOption(b){
    if(!b||b.matches(SKIP)||b.closest(SKIP)) return false;
    if(b.hasAttribute('aria-expanded')) return false;
    return b.hasAttribute('aria-pressed')||b.hasAttribute('aria-selected')||b.getAttribute('role')==='tab';
  }
  /* leave room for a sticky tab bar at the top, if the page has one showing */
  function topBar(){
    var h=0;
    document.querySelectorAll('.tabbar,.tabs-bar,nav,[class*="sticky"]').forEach(function(el){
      var cs=getComputedStyle(el);
      if(cs.position!=='sticky'&&cs.position!=='fixed') return;
      var r=el.getBoundingClientRect();
      if(r.top<=2&&r.bottom>0&&r.height<160) h=Math.max(h,r.bottom);
    });
    return Math.round(h)+16;
  }
  function groupOf(b){
    return b.closest('[role="tablist"],[role="group"],[role="radiogroup"],ul,ol')||b.parentElement;
  }

  document.addEventListener('click',function(e){
    if(!phone.matches) return;
    var btn=e.target.closest&&e.target.closest('button,[role="tab"]');
    if(!isOption(btn)) return;
    var group=groupOf(btn), changed=[];
    var scope=btn.closest('[role="tabpanel"],section,.panel,.ph-fold,.fold,article')||document.body;
    var mo=new MutationObserver(function(list){
      list.forEach(function(m){
        var el=m.target.nodeType===1?m.target:m.target.parentElement;
        if(el&&changed.indexOf(el)<0) changed.push(el);
      });
    });
    mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','aria-hidden']});
    setTimeout(function(){
      mo.disconnect();
      var below=btn.getBoundingClientRect().bottom-4, best=null, bestTop=Infinity;
      changed.forEach(function(el){
        if(!el.isConnected||!scope.contains(el)||group.contains(el)||el.contains(btn)) return;
        if(el.matches(SKIP)||el.closest(SKIP)) return;
        if(el.matches('button,[role="tab"]')&&isOption(el)) return;
        var r=el.getBoundingClientRect();
        if(r.height<24||r.top<below||getComputedStyle(el).position==='fixed') return;
        if(r.top<bestTop){ best=el; bestTop=r.top; }
      });
      if(!best) return;
      var io=new IntersectionObserver(function(es){
        io.disconnect();
        var x=es[0], r=x.boundingClientRect;
        var seen=x.isIntersecting?x.intersectionRect.height:0;
        if(seen>=Math.min(160,r.height*0.4)) return;
        var old=best.style.scrollMarginTop;
        best.style.scrollMarginTop=topBar()+'px';
        best.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'start'});
        setTimeout(function(){ best.style.scrollMarginTop=old; },900);
      });
      io.observe(best);
    },WATCH_MS);
  },true);
})();
