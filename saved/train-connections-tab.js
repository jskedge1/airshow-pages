/* SAVED DESIGN, not on the page: "Train connections" tab (Clacton travel topic, 9 Nov 2026).
   Bold table: navy city blocks, named train company badges with arrows, bold change station,
   pale blue journey time box with clock, red Times buttons, phone card layout.
   To bring it back: set SHOW_TRAIN_CONN = true in topic-fastrans.js (it already holds this code),
   or load this file after poster-boxes.html and transport-pier.js. */
(function () {
  if (document.getElementById('tcSavedCss')) return;
  var css = [
    '#travel #explore .tp-tc table{background:#FFFFFF!important;box-shadow:0 10px 26px rgba(19,41,60,.10)!important}',
    '#travel #explore .tp-tc thead{background:#13293C!important;border:0!important}',
    '#travel #explore .tp-tc th{color:#FFFFFF!important;font:700 15px/1.2 Barlow,sans-serif!important;padding:14px 18px!important}',
    '#travel #explore .tp-tc tr{grid-template-columns:170px minmax(0,1fr) 160px 96px!important}',
    '#travel #explore .tp-tc tbody tr{border-top:1px solid #DCE3E8!important;background:#FFFFFF!important}',
    '#travel #explore .tp-tc tbody tr:nth-child(even){background:#F5F8FA!important}',
    '#travel #explore .tp-tc tbody tr:hover{background:#E3F1F8!important}',
    '#travel #explore .tp-tc td{padding:16px 14px!important}',
    '#travel #explore .tp-tc td:first-child{background:#13293C!important;border-left:8px solid #44AED6!important}',
    '#travel #explore .tp-tc td:first-child b{color:#FFFFFF!important;font:800 24px/1.05 "Barlow Condensed","Barlow",sans-serif!important;text-transform:uppercase;letter-spacing:.02em}',
    '#travel #explore .tp-tc td:first-child small{color:#9ED6EC!important;font-size:13px!important;margin-top:4px}',
    '#travel #explore .tp-tc td:nth-child(2){color:#13293C!important;font-size:16px!important;line-height:24px!important}',
    '#travel #explore .tp-tc td:nth-child(2) b{font-weight:700}',
    '#travel #explore .tp-tc .jq-dots{display:none!important}',
    '.tc-ops{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}',
    '.tc-ops span{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--c);color:#FFFFFF;font:700 13px/1.2 Barlow,sans-serif}',
    '.tc-ops span+span:before{content:"";}',
    '.tc-ops em{font-style:normal;color:#13293C;font-weight:700;align-self:center}',
    '#travel #explore .tp-tc td.jq-hm{display:flex!important;flex-direction:column;justify-content:center}',
    '.tc-time{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;background:#E3F1F8;border-left:4px solid #44AED6;padding:8px 10px;white-space:nowrap;font:800 18px/1.1 "Barlow Condensed","Barlow",sans-serif;color:#13293C}',
    '.tc-time svg{width:16px;height:16px;flex:none}',
    '#travel #explore .tp-tc td:last-child a{background:#D74949!important;color:#FFFFFF!important;font:700 15px Barlow,sans-serif!important;padding:12px 10px!important;white-space:nowrap;text-align:center;text-decoration:none!important;transition:background .25s ease}',
    '#travel #explore .tp-tc td:last-child a:hover{background:#13293C!important}',
    '@media(max-width:900px){#travel #explore .tp-tc tr{grid-template-columns:minmax(0,1fr) auto!important}#travel #explore .tp-tc thead{display:none!important}#travel #explore .tp-tc td:first-child{grid-column:1/-1}#travel #explore .tp-tc td:nth-child(2){grid-column:1/-1}#travel #explore .tp-tc td{padding:12px 14px!important}}',
  ].join('\n');
  var st = document.createElement('style'); st.id = 'tcSavedCss'; st.textContent = css; document.head.appendChild(st);
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function trainTable() {
    var t = document.querySelector('#tpTrainConn table'); if (!t || t.dataset.tc) return; t.dataset.tc = '1';
    var CLK = '<svg viewBox="0 0 24 24" fill="none" stroke="#13293C" stroke-width="2.4" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
    [].forEach.call(t.querySelectorAll('tbody tr'), function (tr) {
      var td = tr.children[1], dots = td && td.querySelector('.jq-dots'); if (!dots) return;
      var ops = [].map.call(dots.querySelectorAll('i'), function (i) { return '<span style="--c:' + (i.style.getPropertyValue('--c') || '#13293C') + '">' + esc(i.title) + '</span>'; });
      var box = document.createElement('div'); box.className = 'tc-ops'; box.innerHTML = ops.join('<em aria-hidden="true">&rarr;</em>');
      td.insertBefore(box, td.firstChild);
      [].forEach.call(td.childNodes, function (n) {
        if (n.nodeType === 3 && /^\s*(Direct|Change at)/.test(n.nodeValue)) {
          var m = n.nodeValue.match(/^\s*(Direct|Change at [^,]+)(.*)$/);
          if (m) { var w = document.createElement('span'); w.innerHTML = '<b>' + esc(m[1]) + '</b>' + esc(m[2]); td.replaceChild(w, n); }
        }
      });
      var tm = tr.children[2]; if (tm && !tm.querySelector('.tc-time')) tm.innerHTML = '<span class="tc-time">' + CLK + esc(tm.textContent.replace(/^About\s*/i, '').trim()) + '</span>';
    });
  }

  var n = 0; (function wait() { if (document.querySelector('#tpTrainConn table')) trainTable(); else if (++n < 60) setTimeout(wait, 200); })();
})();
