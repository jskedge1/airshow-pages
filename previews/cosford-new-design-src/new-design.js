/* New design for the RAF Cosford Air Show page (template: the Duxford page). Fills the new header, intro and footer from the page's own
   content, so the words only live in one place, and adds the scroll and hover motion. */
(function () {
  var D = document;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function P(k) { return (k && window.PHOTO && window.PHOTO[k]) || ''; }   /* Jack's photos on the Cosford page live in window.PHOTO */
  function txt(el) { return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  D.documentElement.classList.add('nz');

  /* open a section of the guide and scroll to it (uses the page's own tab buttons) */
  function go(id) {
    var tab = D.getElementById('t-' + id), fold = D.getElementById('f-' + id);
    if (fold && !fold.classList.contains('open')) {
      var b = $('.fold-btn', fold); if (b) b.click();
    } else if (!fold && tab) { tab.click(); return; }
    if (fold) setTimeout(function () {
      var y = fold.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }, 80);
  }
  D.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-nz-go]');
    if (t) { e.preventDefault(); go(t.getAttribute('data-nz-go')); }
  });

  /* the three header buttons open their section too (on the live page they only scroll) */
  D.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('.nz-feat3 .h1x-card');
    if (c && c.getAttribute('data-sec') && D.getElementById('f-' + c.getAttribute('data-sec'))) go(c.getAttribute('data-sec'));
  });

  var NUM = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty', 'Twenty one', 'Twenty two', 'Twenty three', 'Twenty four'];
  var WORD = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };

  function fill() {
    var hero = D.getElementById('top');
    if (hero && !hero.hasAttribute('data-nz-done')) {
      hero.setAttribute('data-nz-done', '1');
      /* header photo: the page's own header photo */
      /* title, tag and breadcrumb */
      var h1 = $('h1', hero);
      if (h1) D.getElementById('nzTitle').textContent = $$('.cg-word', h1).map(txt).join(' ') || txt(h1);
      var tag = $('.h1x-tag', hero);
      if (tag) D.getElementById('nzTags').innerHTML = '<span class="nz-tagp"></span>', $('#nzTags span').textContent = txt(tag);
      var red = $('.cg-red', hero);
      if (red) D.getElementById('nzAboutH').textContent = txt(red);
      var cr = $('.cg-crumb', hero), nc = D.getElementById('nzCrumbs');
      if (cr && nc) {
        var parts = [];
        [].forEach.call(cr.childNodes, function (n) {
          if (n.nodeType === 1 && n.tagName === 'A') parts.push('<a href="' + n.getAttribute('href') + '" target="_top">' + txt(n) + '</a>');
          else if (n.nodeType === 3 && n.textContent.trim()) parts.push('<span>' + n.textContent.trim() + '</span>');
          else if (n.nodeType === 1 && txt(n) !== '/' && txt(n)) parts.push('<span>' + txt(n) + '</span>');
        });
        nc.innerHTML = parts.join('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>');
      }
      /* intro words */
      var sub = $('.cg-sub', hero);
      if (sub) D.getElementById('nzIntro').innerHTML = sub.innerHTML;
      /* key facts: boxes with a coloured top edge */
      var facts = $$('.cg-glass > div', hero), fb = D.getElementById('nzFacts');
      if (facts.length && fb) {
        fb.innerHTML = facts.map(function (d, i) {
          var k = txt($('span', d)), v = txt($('b', d));
          if (k === 'Where') { D.getElementById('nzWhere').textContent = v; D.getElementById('nzFtWhere').textContent = v; }
          if (k === 'When') { D.getElementById('nzWhen').textContent = v; D.getElementById('nzFtWhen').textContent = v; }
          return '<div class="c' + (i % 4) + '"><h3>' + k + '</h3><p>' + v + '</p></div>';
        }).join('');
      }
      /* the three big buttons sit on the bottom edge of the header photo */
      var cards = $('.h1x-cards', hero), slot = D.getElementById('nzFeat3');
      if (cards && slot) slot.appendChild(cards);
      /* last checked line */
      var chk = $('.sx-checked', hero);
      if (chk) {
        D.getElementById('nzLast').innerHTML = chk.innerHTML;
        var m = txt(chk).match(/Last checked\s+([^.]+)\./);
        if (m) { D.getElementById('nzChecked').textContent = 'Last checked ' + m[1]; D.getElementById('nzCheckedWrap').hidden = false; }
      }
    }
    /* header photo: the page's own header photo (Cosford fills it from window.PHOTO once the page has loaded) */
    var bg = hero && $('.cg-bg img', hero), nb = D.getElementById('nzHdBg');
    if (bg && nb && !nb.getAttribute('src')) { var hs = bg.currentSrc || bg.getAttribute('src') || P(bg.getAttribute('data-k')); if (hs) nb.src = hs; }
    /* offset photo beside the intro: one of the page's own photos */
    var ab = D.getElementById('nzAbImg');
    if (ab && !ab.getAttribute('src')) {
      if (P('typhoon')) { ab.src = P('typhoon'); ab.alt = (window.PHOTO_ALT && PHOTO_ALT.typhoon) || ''; }
    }
    /* the tickets notice moves under the intro */
    var slotN = D.getElementById('nzNoticeSlot'), note = $('body > .notice');
    if (slotN && note) slotN.appendChild(note);
    /* a label line above each section's big heading (the section's name, when the heading says something else) */
    $$('section.fold').forEach(function (f) {
      var h2 = $('.panel-head h2', f), t = txt($('.fold-t', f));
      if (!h2 || f.id === 'f-travel' || (h2.previousElementSibling && h2.previousElementSibling.classList.contains('nz-kick'))) return;
      var k = D.createElement('span'); k.className = 'nz-kick';
      var same = txt(h2).toLowerCase().replace(/[^a-z]/g, '') === t.toLowerCase().replace(/[^a-z]/g, '');
      k.textContent = same ? 'RAF Cosford Air Show' : t.charAt(0).toUpperCase() + t.slice(1);
      h2.parentNode.insertBefore(k, h2);
    });
    /* the strip of section links reads in sentence case, like the other labels */
    $$('nav.tabbar .tab').forEach(function (t) {
      if (t.hasAttribute('data-nz-sc')) return; t.setAttribute('data-nz-sc', '1');
      [].forEach.call(t.childNodes, function (n) {
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        var words = n.textContent.split(' ');
        n.textContent = words.map(function (w, i) {
          if (i === 0 || /^(RAF|Cosford|Museum|Midlands)/.test(w) || !w) return w;
          return w.charAt(0).toLowerCase() + w.slice(1);
        }).join(' ');
      });
    });
    $$('img[data-nz-logo]').forEach(function (i) { var l = D.getElementById('nzLogo'); if (l && !i.getAttribute('src')) i.src = l.src; });
    /* the guide band: its photo, numbers, and the page's own open all and close all buttons */
    var bb = D.getElementById('nzBandBg');
    if (bb && !bb.getAttribute('src') && P('c17')) bb.src = P('c17');
    var fbs = D.getElementById('nzFoldBtns'), grp = $('.fold-bar .grp');
    if (fbs && grp && !fbs.children.length) { fbs.appendChild(grp); }
    var nsec = $$('section.fold').length; if (nsec) D.getElementById('nzStatSec').textContent = nsec;
    /* Jack, 22 Nov 2026: one of his aircraft photos across the top of the Quick checker */
    var mc = D.getElementById('matchcheck');
    if (mc && !$('.nz-qc-ph', mc)) {
      if (P('anson')) {
        var fg = D.createElement('figure'); fg.className = 'nz-qc-ph';
        fg.innerHTML = '<img alt="" decoding="async"><figcaption><span class="nz-kick">Quick checker</span><b>Six quick questions to see if this show suits your group.</b></figcaption>';
        fg.firstChild.src = P('anson'); fg.firstChild.alt = (window.PHOTO_ALT && PHOTO_ALT.anson) || '';
        mc.insertBefore(fg, mc.firstChild);
      }
    }
    /* Jack, 22 Nov 2026: the line-up heading sits on one of his aircraft photos, like the other photo bands */
    var lb = $('#lineup .lu-band');
    if (lb && !$('.nz-lu-bg', lb)) {
      if (P('rafale')) { var li = D.createElement('img'); li.className = 'nz-lu-bg'; li.alt = ''; li.setAttribute('aria-hidden', 'true'); li.src = P('rafale'); lb.insertBefore(li, lb.firstChild); }
    }
    /* Shooting at Cosford opening: the live page has no photo beside it (Duxford's has the P-40), so one of
       Jack's photos goes there, the same way, with its own description as the caption */
    var pw = $('#photo > .wrap'), ph = pw && $(':scope > .panel-head', pw);
    if (ph && !$(':scope > figure.pic.wide', pw) && P('p47')) {
      var pf = D.createElement('figure'); pf.className = 'pic wide';
      pf.innerHTML = '<img class="photo" alt="" decoding="async"><figcaption></figcaption>';
      pf.firstChild.src = P('p47'); pf.firstChild.alt = (window.PHOTO_ALT && PHOTO_ALT.p47) || '';
      pf.lastChild.textContent = ((window.PHOTO_ALT && PHOTO_ALT.p47) || '') + '.';
      ph.parentNode.insertBefore(pf, ph.nextSibling);
    }
    /* how many sections */
    var n = $$('section.fold').length;
    if (n && NUM[n]) D.getElementById('nzCount').textContent = NUM[n];
    /* small print moves into the dark bar under the footer */
    var sp = $('footer.small-print .wrap'), ns = D.getElementById('nzSmall');
    if (sp && ns && !ns.children.length) { while (sp.firstChild) ns.appendChild(sp.firstChild); }
    var back = $('.ukbt-tab');
    if (back && back.getAttribute('href')) D.getElementById('nzBack').href = back.getAttribute('href');
  }
  fill();
  D.addEventListener('DOMContentLoaded', fill);
  window.addEventListener('load', function () { fill(); setTimeout(fill, 600); });

  /* the strip of section links: mark it stuck so it can take a shadow */
  var bar = $('nav.tabbar');
  if (bar && 'IntersectionObserver' in window) {
    var sen = D.createElement('div'); sen.style.cssText = 'height:1px;margin-bottom:-1px'; bar.parentNode.insertBefore(sen, bar);
    new IntersectionObserver(function (en) { bar.classList.toggle('nz-stuck', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }).observe(sen);
  }

  /* Jack, 22 Nov 2026: the Quick answers open and close slowly. Off for reduced motion. */
  if (!reduce && Element.prototype.animate) D.addEventListener('click', function (e) {
    var sm = e.target.closest && e.target.closest('#hpList details > summary'); if (!sm) return;
    var d = sm.parentElement; e.preventDefault(); if (d.dataset.nzAnim === '1') return;
    var EASE = 'cubic-bezier(.22,.61,.36,1)', start = d.offsetHeight; d.dataset.nzAnim = '1'; d.style.overflow = 'hidden';
    function done() { d.style.overflow = ''; d.style.height = ''; delete d.dataset.nzAnim; }
    if (d.open) {
      d.animate({ height: [start + 'px', sm.offsetHeight + 'px'] }, { duration: 620, easing: EASE }).onfinish = function () { d.open = false; done(); };
    } else {
      d.open = true; var end = d.offsetHeight;
      d.animate({ height: [start + 'px', end + 'px'] }, { duration: 720, easing: EASE }).onfinish = done;
      [].forEach.call(d.children, function (c) { if (c !== sm) c.animate({ opacity: [0, 1], transform: ['translateY(-8px)', 'none'] }, { duration: 720, easing: EASE }); });
    }
  });

  /* motion: things rise into place as you scroll. Off for reduced motion. */
  if (reduce || !('IntersectionObserver' in window)) return;
  var done = [];
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { show(x.target); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .06 });
  function show(el) { el.classList.add('nz-in'); setTimeout(function () { el.style.transitionDelay = ''; }, 1100); }
  function arm() {
    var sel = '.nz-band-tx,.nz-band-stats>div,.nz-sec-head,.nz-about>*,.nz-facts>div,.nz-feat3 .h1x-card,.nz-notice-slot .cbx,.folds>section.fold>.fold-h,.cg-next h2,.cg-next .cg-tiles>button,.useful li,.nz-ft .cols>div';
    $$(sel).forEach(function (el) {
      if (done.indexOf(el) > -1) return; done.push(el);
      var sibs = [].filter.call(el.parentNode.children, function (x) { return x.matches(sel); });
      var d = Math.min(sibs.indexOf(el), 5) * 90;
      if (el.matches('.fold-h')) d = 0;
      el.classList.add('nz-rv'); if (d) el.style.transitionDelay = d + 'ms';
      io.observe(el);
    });
  }
  arm(); window.addEventListener('load', function () { setTimeout(arm, 700); });
  /* never leave anything hidden */
  setInterval(function () {
    done.forEach(function (el) {
      if (el.classList.contains('nz-in')) return;
      var r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) show(el);
    });
  }, 1500);
})();

/* Jack, 22 Nov 2026: make the aerial view in the sun guide clickable.
   Click or tap anywhere on the drawing and the sun moves to the nearest hour on its path,
   the same as pressing that hour's button below it. The sun guide's own drawing and maths are unchanged. */
(function(){
  function setup(){
    var dots=document.getElementById('planDots'),times=document.getElementById('sgTimes');
    if(!dots||!times||!dots.children.length){return false;}
    var svg=dots.ownerSVGElement,cells=times.querySelectorAll('.sg-cell');
    if(!svg||cells.length!==dots.children.length){return true;}
    var you={x:390,y:260};
    svg.classList.add('nz-sg-click');
    svg.setAttribute('aria-label','Aerial view of the airfield. Click a point on the sun path to see that time.');
    function nearest(ev){
      var pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;
      var m=svg.getScreenCTM();if(!m){return -1;}
      var p=pt.matrixTransform(m.inverse()),a=Math.atan2(p.x-you.x,you.y-p.y),best=-1,bd=9;
      [].forEach.call(dots.children,function(c,i){
        var b=Math.atan2(+c.getAttribute('cx')-you.x,you.y-+c.getAttribute('cy')),d=Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
        if(d<bd){bd=d;best=i;}
      });
      return best;
    }
    var hl=-1;
    function mark(i){
      if(i===hl){return;}
      if(hl>-1&&dots.children[hl]){dots.children[hl].classList.remove('nz-hot');}
      hl=i;if(i>-1){dots.children[i].classList.add('nz-hot');}
    }
    svg.addEventListener('mousemove',function(ev){mark(nearest(ev));});
    svg.addEventListener('mouseleave',function(){mark(-1);});
    svg.addEventListener('click',function(ev){var i=nearest(ev);if(i>-1){cells[i].click();}});
    return true;
  }
  var n=0;(function tryIt(){if(setup()||++n>40){return;}setTimeout(tryIt,250);})();
})();

/* Jack, 22 Nov 2026: "In this section" in Photography as clean photo tabs (his photos, navy fade, title on the photo). */
(function(){
  var PICS={phSun:'spitfire',phCreative:'pitts',phCalc:'jaguar',phKit:'swordfish',phPack:'merlin',phCheck:'apache',phDl:'b17'};
  var ORDER=['spitfire','pitts','jaguar','swordfish','merlin','apache','b17'];
  function src(k){return (window.PHOTO&&window.PHOTO[k])||'';}
  function setup(){
    var nav=document.querySelector('#photo nav.ph-jump');if(!nav){return true;}
    var links=nav.querySelectorAll('a');if(!links.length){return true;}
    if(!src('spitfire')){return false;}
    nav.classList.add('nz-jtabs');
    [].forEach.call(links,function(a,n){
      if(a.querySelector('.nz-jt-ph')){return;}
      var id=(a.getAttribute('href')||'').replace('#',''),k=PICS[id]||ORDER[n%ORDER.length],s=src(k);
      var label=a.textContent.trim();
      a.textContent='';
      var ph=document.createElement('span');ph.className='nz-jt-ph';ph.setAttribute('aria-hidden','true');
      if(s){var im=document.createElement('img');im.src=s;im.alt='';im.decoding='async';ph.appendChild(im);}
      var tx=document.createElement('span');tx.className='nz-jt-tx';
      tx.innerHTML='<b></b><i>Go to section <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></i>';
      tx.querySelector('b').textContent=label;
      a.appendChild(ph);a.appendChild(tx);
    });
    return true;
  }
  var n=0;(function tryIt(){if(setup()||++n>40){return;}setTimeout(tryIt,250);})();
})();

/* Jack, 22 Nov 2026: photographers' map. Click a numbered spot on the map, or in the list, to see a card
   with a photo and that spot's details under the map. Photos are Jack's own; spots without one show text only. */
(function(){
  var PIC={};
  function src(k){return (window.PHOTO&&window.PHOTO[k])||'';}
  function setup(){
    var map=document.getElementById('photoMap');if(!map){return true;}
    var svg=map.querySelector('.pmap-fig svg');if(!svg){return true;}
    if(!window.PHOTO){return false;}
    var spots={};
    [].forEach.call(svg.querySelectorAll('g > g[transform^="translate"]'),function(g){
      var c=g.querySelector('circle[r="14"]'),t=g.querySelector('text');
      if(c&&t&&/^[1-9]$/.test(t.textContent.trim())){spots[t.textContent.trim()]=g;}
    });
    var items={};
    [].forEach.call(map.querySelectorAll('.pmap-list > li'),function(li){var n=li.querySelector('.n');if(n){items[n.textContent.trim()]=li;}});
    if(!Object.keys(spots).length){return true;}
    var card=document.createElement('div');card.className='nz-spot';card.setAttribute('aria-live','polite');
    card.innerHTML='<div class="nz-spot-ph"></div><div class="nz-spot-tx"><span class="nz-spot-n"></span><div><h4></h4><p></p><span class="nz-spot-k"></span></div></div>';
    var fig=map.querySelector('.pmap-fig');fig.parentElement.insertBefore(card,fig.nextSibling);
    var cur=null;
    function show(n,scroll){
      var li=items[n];if(!li){return;}
      if(cur){if(spots[cur]){spots[cur].classList.remove('nz-on');}if(items[cur]){items[cur].classList.remove('nz-on');}}
      cur=n;if(spots[n]){spots[n].classList.add('nz-on');}li.classList.add('nz-on');
      var ph=card.querySelector('.nz-spot-ph'),s=PIC[n]?src(PIC[n]):'';
      ph.innerHTML='';card.classList.toggle('nz-noph',!s);
      if(s){var im=document.createElement('img');im.src=s;im.alt='';ph.appendChild(im);}
      var col=li.classList.contains('warn')?'#D74949':(li.classList.contains('out')?'#6950A1':'#32B4AF');
      card.style.setProperty('--sc',col);
      card.querySelector('.nz-spot-n').textContent=n;
      card.querySelector('h4').textContent=li.querySelector('b').textContent;
      card.querySelector('p').innerHTML=li.querySelector('p').innerHTML;
      card.querySelector('.nz-spot-k').textContent=li.classList.contains('warn')?'Outside the fence, take care':(li.classList.contains('out')?'Outside the fence':'Inside the show');
      card.classList.remove('nz-in');void card.offsetWidth;card.classList.add('nz-in');
      if(scroll){card.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});}
    }
    Object.keys(spots).forEach(function(n){
      var g=spots[n];g.classList.add('nz-spot-pin');g.setAttribute('tabindex','0');g.setAttribute('role','button');
      g.setAttribute('aria-label','Spot '+n+', show the photo and details');
      g.addEventListener('click',function(){show(n,true);});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();show(n,true);}});
    });
    Object.keys(items).forEach(function(n){
      var li=items[n];li.classList.add('nz-spot-li');li.setAttribute('tabindex','0');
      li.addEventListener('click',function(e){if(e.target.closest('a')){return;}show(n,true);});
      li.addEventListener('keydown',function(e){if(e.key==='Enter'){show(n,true);}});
    });
    show('1',false);
    return true;
  }
  var n=0;(function tryIt(){if(setup()||++n>40){return;}setTimeout(tryIt,250);})();
})();

/* Jack, 22 Nov 2026: the photographers' map with more of a 3D look. The buildings get raised sides and
   a roof shade, trees are dotted round the field edges, everything casts a soft shadow, and the map sits
   at a slight tilt. The map's own content, labels and positions are unchanged. */
(function(){
  var NS='http://www.w3.org/2000/svg';
  function el(n,a){var e=document.createElementNS(NS,n);for(var k in a){e.setAttribute(k,a[k]);}return e;}
  function setup(){
    var map=document.getElementById('photoMap');if(!map){return true;}
    var svg=map.querySelector('.pmap-fig svg');if(!svg||svg.getAttribute('data-nz3d')){return true;}
    svg.setAttribute('data-nz3d','1');
    var defs=svg.querySelector('defs')||svg.insertBefore(el('defs',{}),svg.firstChild);
    var f=el('filter',{id:'nz3dSh',x:'-30%',y:'-30%',width:'160%',height:'160%'});
    f.appendChild(el('feDropShadow',{dx:'3',dy:'5',stdDeviation:'2.6','flood-color':'#0B1A27','flood-opacity':'.35'}));
    defs.appendChild(f);
    var f2=el('filter',{id:'nz3dSoft',x:'-20%',y:'-20%',width:'140%',height:'140%'});
    f2.appendChild(el('feDropShadow',{dx:'0',dy:'3',stdDeviation:'3','flood-color':'#0B1A27','flood-opacity':'.22'}));
    defs.appendChild(f2);
    var g=el('radialGradient',{id:'nz3dTree',cx:'35%',cy:'30%',r:'75%'});
    g.appendChild(el('stop',{offset:'0','stop-color':'#8DB86A'}));
    g.appendChild(el('stop',{offset:'.6','stop-color':'#5E8F45'}));
    g.appendChild(el('stop',{offset:'1','stop-color':'#3F6B30'}));
    defs.appendChild(g);
    var lg=el('linearGradient',{id:'nz3dLight',x1:'0',y1:'0',x2:'0',y2:'1'});
    lg.appendChild(el('stop',{offset:'0','stop-color':'#FFFFFF','stop-opacity':'.18'}));
    lg.appendChild(el('stop',{offset:'1','stop-color':'#0B1A27','stop-opacity':'.12'}));
    defs.appendChild(lg);

    /* buildings: a darker raised side under each roof */
    var bld=[].filter.call(svg.querySelectorAll(':scope > g'),function(x){return x.getAttribute('fill')==='#AEB6BE';})[0];
    if(bld){
      var sides=el('g',{fill:'#7D8893'});
      [].forEach.call(bld.querySelectorAll('rect'),function(r){
        var s=r.cloneNode();s.removeAttribute('stroke');
        var t=r.getAttribute('transform')||'';s.setAttribute('transform','translate(4 7) '+t);sides.appendChild(s);
        var top=r.cloneNode();top.setAttribute('fill','url(#nz3dLight)');top.removeAttribute('stroke');bld.appendChild(top);
      });
      bld.parentNode.insertBefore(sides,bld);
      sides.setAttribute('filter','url(#nz3dSh)');
    }
    /* trees round the edges of the airfield, kept clear of the labels and spots */
    var trees=[[118,300],[108,318],[132,286],[540,412],[562,398],[585,383],[606,366],[575,175],[232,456],[612,300],[620,280],[52,370],[60,392],[700,470],[715,452],[470,92],[492,82]];
    var tg=el('g',{filter:'url(#nz3dSh)'});
    trees.forEach(function(p,i){var r=7+(i%3)*2;tg.appendChild(el('circle',{cx:p[0],cy:p[1],r:r,fill:'url(#nz3dTree)'}));});
    var airfield=[].filter.call(svg.querySelectorAll(':scope > path'),function(x){return (x.getAttribute('fill')||'').indexOf('pmMow')>-1;})[0];
    if(airfield){airfield.setAttribute('filter','url(#nz3dSoft)');airfield.parentNode.insertBefore(tg,airfield.nextSibling);}
    else{svg.appendChild(tg);}
    /* the runway and the numbered spots lift off the ground */
    [].forEach.call(svg.querySelectorAll('path[stroke="#5A6570"]'),function(p){p.setAttribute('filter','url(#nz3dSoft)');});
    [].forEach.call(svg.querySelectorAll('.nz-spot-pin, g[transform^="translate"] > circle[r="14"]'),function(c){
      var p=c.closest('g[transform]');if(p){p.setAttribute('filter','url(#nz3dSh)');}
    });
    map.querySelector('.pmap-fig').classList.add('nz-3d');
    return true;
  }
  var n=0;(function tryIt(){if(setup()||++n>40){return;}setTimeout(tryIt,250);})();
})();

/* Jack, 22 Nov 2026: section order. The sections named here come first, in this order, and the rest keep
   their order after them. The section tab bar follows the same order. Add a name here to move another. */
(function(){
  /* Cosford has no Pick your show, Flightline walk, story or Experience flights sections. Its extras
     (Ticket day countdown, RAF Museum Midlands, The ground show) keep their order after these. */
  var FIRST=['overview','travel','photo','lineup','watch','facilities','timeline','dayruns','stay','help','matchcheck','whatyousee','kids','scores','compare','postcard'];
  function run(){
    var folds=[].slice.call(document.querySelectorAll('section.fold'));
    if(!folds.length){return false;}
    var box=folds[0].parentElement,anchor=folds[0];
    FIRST.forEach(function(id){var f=document.getElementById('f-'+id);if(f&&f.parentElement===box){box.insertBefore(f,anchor);}});
    folds=[].slice.call(box.querySelectorAll(':scope > section.fold'));
    FIRST.slice().reverse().forEach(function(id){var f=document.getElementById('f-'+id);if(f){box.insertBefore(f,box.querySelector(':scope > section.fold'));}});
    [].forEach.call(box.querySelectorAll(':scope > section.fold'),function(f,i){var n=f.querySelector('.st-stop,.fold-n');if(n){n.textContent=String(i+1);}});
    var t=document.querySelector('#t-overview');
    if(t){var list=t.parentElement;
      FIRST.slice().reverse().forEach(function(id){var b=document.getElementById('t-'+id);if(b&&b.parentElement===list){list.insertBefore(b,list.firstElementChild);}});
    }
    return true;
  }
  if(!run()){document.addEventListener('DOMContentLoaded',run);}
})();

/* Plan your day: Jack's photo behind the plan's title band (Jack, 22 Nov 2026) */
(function(){
  function go(){var p=document.getElementById('planner');var s=window.PHOTO&&window.PHOTO.chinook;
    if(!p||!s){return false;}p.style.setProperty('--nz-plimg','url("'+s+'")');return true;}
  var n=0;(function t(){if(go()||++n>40){return;}setTimeout(t,250);})();
})();
