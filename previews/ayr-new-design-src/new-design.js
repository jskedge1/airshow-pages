/* New design for the International Ayr Show page. Fills the new header, intro and footer from the page's own
   content, so the words only live in one place, and adds the scroll and hover motion. */
(function () {
  var D = document;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function txt(el) { return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  /* Jack's photos on this page live in window.PHOTO, keyed by name */
  function pic(k) { return (k && window.PHOTO && window.PHOTO[k]) || ''; }
  function alt(k) { return (window.PHOTO_ALT && window.PHOTO_ALT[k]) || ''; }
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
    /* header photo: the page's own header photo (on this page it is filled in from window.PHOTO) */
    var bg = $('#top .cg-bg img'), nb = D.getElementById('nzHdBg');
    if (bg && nb && !nb.getAttribute('src')) { var hs = bg.getAttribute('src') || pic(bg.getAttribute('data-k')); if (hs) nb.src = hs; }
    /* offset photo beside the intro: one of the page's own photos */
    var ab = D.getElementById('nzAbImg');
    if (ab && !ab.getAttribute('src')) {
      if (pic('spitfire')) { ab.src = pic('spitfire'); ab.alt = alt('spitfire'); }
    }
    /* Photography opening: the heading panel sits beside one of Jack's photos, as on the Duxford page.
       The live page has no photo there, so one of the page's own photos is added, with its own caption. */
    var phh = $('#photo > .wrap > .panel-head');
    if (phh && !$('#photo > .wrap > figure.pic.wide') && pic('typhoon')) {
      var pf = D.createElement('figure'); pf.className = 'pic wide nz-phop';
      pf.innerHTML = '<img class="photo" alt="" decoding="async"><figcaption></figcaption>';
      pf.firstChild.src = pic('typhoon'); pf.firstChild.alt = alt('typhoon');
      pf.lastChild.textContent = alt('typhoon') + '.';
      phh.parentNode.insertBefore(pf, phh.nextSibling);
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
      k.textContent = same ? 'International Ayr Show' : t.charAt(0).toUpperCase() + t.slice(1);
      h2.parentNode.insertBefore(k, h2);
    });
    /* the strip of section links reads in sentence case, like the other labels */
    $$('nav.tabbar .tab').forEach(function (t) {
      if (t.hasAttribute('data-nz-sc')) return; t.setAttribute('data-nz-sc', '1');
      [].forEach.call(t.childNodes, function (n) {
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        var words = n.textContent.split(' ');
        n.textContent = words.map(function (w, i) {
          if (i === 0 || w.indexOf('Ayr') === 0 || !w) return w;
          return w.charAt(0).toLowerCase() + w.slice(1);
        }).join(' ');
      });
    });
    $$('img[data-nz-logo]').forEach(function (i) { var l = D.getElementById('nzLogo'); if (l && !i.getAttribute('src')) i.src = l.src; });
    /* the guide band: its photo, numbers, and the page's own open all and close all buttons */
    var bb = D.getElementById('nzBandBg');
    if (bb && !bb.getAttribute('src') && pic('dakota')) bb.src = pic('dakota');
    var fbs = D.getElementById('nzFoldBtns'), grp = $('.fold-bar .grp');
    if (fbs && grp && !fbs.children.length) { fbs.appendChild(grp); }
    var nsec = $$('section.fold').length; if (nsec) D.getElementById('nzStatSec').textContent = nsec;
    D.getElementById('nzStatEv').textContent = D.getElementById('nzStatN').textContent;
    /* Jack, 22 Nov 2026: one of his aircraft photos across the top of the Quick checker */
    var mc = D.getElementById('matchcheck');
    if (mc && !$('.nz-qc-ph', mc)) {
      if (pic('p47')) {
        var fg = D.createElement('figure'); fg.className = 'nz-qc-ph';
        fg.innerHTML = '<img alt="" decoding="async"><figcaption><span class="nz-kick">Quick checker</span><b>Six quick questions to see if this show suits your group.</b></figcaption>';
        fg.firstChild.src = pic('p47'); fg.firstChild.alt = alt('p47');
        mc.insertBefore(fg, mc.firstChild);
      }
    }
    /* Jack, 22 Nov 2026: the line-up heading sits on one of his aircraft photos, like the other photo bands */
    var lb = $('#lineup .lu-band');
    if (lb && !$('.nz-lu-bg', lb)) {
      if (pic('chinook')) { var li = D.createElement('img'); li.className = 'nz-lu-bg'; li.alt = ''; li.setAttribute('aria-hidden', 'true'); li.src = pic('chinook'); lb.insertBefore(li, lb.firstChild); }
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
    var you={x:492,y:262};
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
  var PICS={phSun:'spitfire',phCreative:'pitts',phCalc:'typhoon',phKit:'stearman',phPack:'dakota',phCheck:'chinook',phDl:'bbmf'};
  var ORDER=['spitfire','pitts','typhoon','stearman','dakota','chinook','bbmf','p47'];
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

/* Jack, 22 Nov 2026: section order. The sections named here come first, in this order, and the rest keep
   their order after them. The section tab bar follows the same order. Add a name here to move another. */
(function(){
  /* the same order as the Duxford page. This page has no flightline walk, story or experience flights; the ground show and seafront information follow on after */
  var FIRST=['overview','travel','photo','lineup','watch','facilities','days','timeline','dayruns','stay','flightline','help','matchcheck','whatyousee','kids','scores','compare','story','flights','postcard'];
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
  function go(){var p=document.getElementById('planner');var s=window.PHOTO&&window.PHOTO.stearman;
    if(!p||!s){return false;}p.style.setProperty('--nz-plimg','url("'+s+'")');return true;}
  var n=0;(function t(){if(go()||++n>40){return;}setTimeout(t,250);})();
})();
