/* Sticky bars below the site header (10 Nov 2026).
   The show pages and guides are drawn straight into the Wix page by the airshow-page element,
   so their section bars (position: sticky, top: 0) now stick to the top of the browser window,
   where the fixed site header (#ukag) covers them. Scrolling up or down, the bar slid under the
   header and looked stuck there.
   This moves every sticky bar in those pages down by the header's height, and gives jump targets
   the same room, so "jump to" links land below the header too. It keeps up as the header changes
   height (phones, tablets) and as pages add parts after loading.
   Loaded on every page by search/header-search.js. */
(function(){
  if(window.__ukagSticky) return;
  window.__ukagSticky = 1;

  var lastH = -1;
  var watched = new WeakSet();
  var selCache = new WeakMap();

  function headerHeight(){
    var h = document.getElementById('ukag');
    if(!h) return 0;
    var pos = getComputedStyle(h).position;
    if(pos !== 'fixed' && pos !== 'sticky') return 0;
    var bottom = h.getBoundingClientRect().bottom;
    return bottom > 0 ? Math.round(bottom) : 0;
  }

  // a sticky bar inside its own scrolling box sticks to that box, not the window, so leave it alone
  function sticksToWindow(el){
    for(var p = el.parentElement; p; p = p.parentElement){
      var cs = getComputedStyle(p);
      if(/(auto|scroll|hidden)/.test(cs.overflowY)) return false;
    }
    return true;
  }

  function stickySelectors(root){
    var out = [];
    function walk(rules){
      for(var i = 0; i < rules.length; i++){
        var r = rules[i];
        if(r.cssRules && !r.selectorText) { walk(r.cssRules); continue; }
        if(r.style && /sticky/.test(r.style.position || '') && r.selectorText) out.push(r.selectorText);
      }
    }
    var sheets = root.styleSheets || [];
    for(var i = 0; i < sheets.length; i++){
      try { walk(sheets[i].cssRules); } catch(e) {}
    }
    out.push('[style*="sticky"]');
    return out;
  }

  function fixRoot(root, H, fresh){
    var host = root.host;
    host.style.setProperty('--ukag-head', H + 'px');
    if(!root.getElementById('ukag-sticky-css')){
      var st = document.createElement('style');
      st.id = 'ukag-sticky-css';
      // :where keeps this weaker than any scroll margin a page sets itself
      st.textContent = ':where([id]){scroll-margin-top:calc(var(--ukag-head,0px) + 66px)}';
      root.appendChild(st);
    }
    var list;
    if(fresh || !selCache.has(root)) selCache.set(root, stickySelectors(root).join(','));
    try { list = root.querySelectorAll(selCache.get(root)); } catch(e) { list = []; }
    for(var i = 0; i < list.length; i++){
      var el = list[i];
      // read the page's own top once, before this script sets one
      if(el.dataset.ukagTop === undefined){
        el.style.removeProperty('top');
        var top0 = getComputedStyle(el).top;
        el.dataset.ukagTop = top0 === 'auto' ? 'auto' : (parseFloat(top0) || 0);
      }
      // checked every time, as sections open and close and phones use other layouts
      var cs = getComputedStyle(el);
      var ok = el.dataset.ukagTop !== 'auto' && cs.position === 'sticky' && sticksToWindow(el);
      var want = ok ? (+el.dataset.ukagTop + H) + 'px' : '';
      if(el.style.getPropertyValue('top') !== want){
        if(want) el.style.setProperty('top', want, 'important');
        else el.style.removeProperty('top');
      }
    }
  }

  function run(force, fresh){
    var H = headerHeight();
    var hosts = document.querySelectorAll('airshow-page');
    var changed = force || H !== lastH;
    lastH = H;
    for(var i = 0; i < hosts.length; i++){
      var root = hosts[i].shadowRoot;
      if(!root) continue;
      if(!watched.has(root)){
        watched.add(root);
        changed = true;
        new MutationObserver(queue).observe(root, { childList: true, subtree: true });
      }
      if(changed) fixRoot(root, H, fresh);
    }
  }

  var timer = 0;
  function queue(){
    if(timer) return;
    timer = setTimeout(function(){ timer = 0; run(true); }, 300);
  }

  window.addEventListener('resize', function(){ run(false); }, { passive: true });
  var raf = 0;
  new MutationObserver(function(){
    if(raf) return;
    raf = requestAnimationFrame(function(){ raf = 0; run(false); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  // the header and the pages both arrive after this script, so check for a while as the page settles
  var n = 0;
  (function tick(){
    run(n % 5 === 0, n % 5 === 0);
    if(++n < 60) setTimeout(tick, 500);
  })();
})();
