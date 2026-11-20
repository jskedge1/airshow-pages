/* New design for the Duxford page. Fills the new header, intro and footer from the page's own
   content, so the words only live in one place, and adds the scroll and hover motion. */
(function () {
  var D = document;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
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
      var bg = $('.cg-bg img', hero), nb = D.getElementById('nzHdBg');
      if (bg && nb) { nb.src = bg.currentSrc || bg.src; }
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
          if (/^20\d\d$/.test(k)) {
            D.getElementById('nzWhen').textContent = v + ' ' + k; D.getElementById('nzFtWhen').textContent = v + ' ' + k;
            var w = WORD[(v.split(' ')[0] || '').toLowerCase()]; if (w) D.getElementById('nzStatN').textContent = w;
            $('.nz-stat span').textContent = 'events at Duxford in ' + k;
          }
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
    /* offset photo beside the intro: one of the page's own photos */
    var ab = D.getElementById('nzAbImg');
    if (ab && !ab.getAttribute('src')) {
      var pic = $('img[data-pic="wildcat_side"]:not([data-dup])') || $('img[data-pic="formation"]:not([data-dup])');
      if (pic && pic.getAttribute('src')) { ab.src = pic.getAttribute('src'); ab.alt = pic.getAttribute('alt') || ''; }
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
      k.textContent = same ? 'Duxford Air Shows' : t.charAt(0).toUpperCase() + t.slice(1);
      h2.parentNode.insertBefore(k, h2);
    });
    /* the strip of section links reads in sentence case, like the other labels */
    $$('nav.tabbar .tab').forEach(function (t) {
      if (t.hasAttribute('data-nz-sc')) return; t.setAttribute('data-nz-sc', '1');
      [].forEach.call(t.childNodes, function (n) {
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        var words = n.textContent.split(' ');
        n.textContent = words.map(function (w, i) {
          if (i === 0 || w.indexOf('Duxford') === 0 || !w) return w;
          return w.charAt(0).toLowerCase() + w.slice(1);
        }).join(' ');
      });
    });
    $$('img[data-nz-logo]').forEach(function (i) { var l = D.getElementById('nzLogo'); if (l && !i.getAttribute('src')) i.src = l.src; });
    /* the guide band: its photo, numbers, and the page's own open all and close all buttons */
    var bb = D.getElementById('nzBandBg');
    if (bb && !bb.getAttribute('src')) { var bp = $('img[data-pic="buchon_pan"]:not([data-dup])') || $('img[data-pic="p40"]:not([data-dup])') || $('img[data-pic="formation"]:not([data-dup])'); if (bp && bp.getAttribute('src')) bb.src = bp.getAttribute('src'); }
    var fbs = D.getElementById('nzFoldBtns'), grp = $('.fold-bar .grp');
    if (fbs && grp && !fbs.children.length) { fbs.appendChild(grp); }
    var nsec = $$('section.fold').length; if (nsec) D.getElementById('nzStatSec').textContent = nsec;
    D.getElementById('nzStatEv').textContent = D.getElementById('nzStatN').textContent;
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
