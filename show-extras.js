/* Show page extras (3 Nov 2026). Loaded by every feature show page.
   Shared styles and behaviour for the sections every show can have:
   Good to know grid, Last checked line, Pick your day picker, card filters,
   experience flight filters and the postcard maker.
   Content lives in each page; this file only styles it and makes it work. */
(function(){
  var GROUPS = {
    pc: { test: '.pc-grid{', css: "/* ===== postcard maker ===== */\n.pc-grid{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.4fr);gap:30px;align-items:start}.pc-ctl .pp-l{margin-top:18px}.pc-ctl .pp-l:first-child{margin-top:0}.pc-pics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.pc-pics button{position:relative;padding:0;border:0;cursor:pointer;aspect-ratio:3/2;overflow:hidden;background:#13293C;outline-offset:2px;transition:transform .3s}.pc-pics button:hover{transform:translateY(-2px)}.pc-pics img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}.pc-pics button.on{box-shadow:0 0 0 3px #32B4AF}.pc-pics button.on::after{content:\"\";position:absolute;right:6px;top:6px;width:20px;height:20px;border-radius:50%;background:#32B4AF url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M5 10l3 3 7-7' fill='none' stroke='%23fff' stroke-width='2.6'/%3E%3C/svg%3E\") center/14px no-repeat}.pc-in{display:grid;gap:10px}.pc-in label{display:flex;flex-direction:column;gap:5px;font-weight:700;font-size:15px;color:#0E5F5B}.pc-in input,.pc-in select{font:500 17px Barlow;padding:11px 12px;border:1px solid #CBD5DD;border-bottom:3px solid #32B4AF;background:#fff;color:#0B1722}.pc-in input:focus,.pc-in select:focus{outline:3px solid #6950A1;outline-offset:1px}.pc-out{position:sticky;top:76px}.pc-out canvas{display:block;width:100%;height:auto;box-shadow:0 24px 50px rgba(19,41,60,.3);background:#13293C}.pc-act{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.pc-act button{font:700 17px Barlow;padding:14px 20px;border:0;cursor:pointer;color:#fff;background:#D74949;transition:transform .3s,background .3s}.pc-act button.alt{background:#32B4AF}.pc-act button:hover{transform:translateY(-2px)}.pc-msg{margin:10px 0 0;font-size:15px;color:#33475A;min-height:1.5em}@media(max-width:900px){.pc-grid{grid-template-columns:minmax(0,1fr)}.pc-out{position:static;order:-1}}" },
    sp: { test: '.sp-grid{', css: "/* ===== keep airbourne free ===== */\n.sp-top{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,1fr);gap:30px;align-items:start;margin-bottom:22px}.sp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;grid-auto-flow:row dense}.sp-card{position:relative;background:#fff;border:1px solid #CBD5DD;padding:20px 20px 18px;transition:transform .4s cubic-bezier(.2,.7,.2,1),box-shadow .4s,opacity .45s,filter .45s}.sp-card::before{content:\"\";position:absolute;left:0;top:0;height:4px;width:0;background:#32B4AF;transition:width .5s}.sp-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(19,41,60,.16)}.sp-card:hover::before{width:100%}.sp-price{display:inline-block;background:#6950A1;color:#fff;font-weight:700;font-size:15px;padding:5px 11px}.sp-card h4{font:700 26px/1 Barlow!important;color:#13293C;margin:12px 0 8px;letter-spacing:.005em!important}.sp-card p{margin:0;font-size:16px;line-height:1.6}.sp-vol{grid-column:span 3;background:#13293C;border-color:#13293C}.sp-vol h4{color:#32B4AF}.sp-vol p{color:#DCE6EE;max-width:80ch}.sp-vol .sp-price{background:#32B4AF}.sp-card.off{opacity:.22;filter:grayscale(1);transform:scale(.97)}.sp-card.hit{box-shadow:0 0 0 3px #32B4AF,0 14px 30px rgba(19,41,60,.16)}.sp-links{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.sp-links a{display:block;text-decoration:none;color:#fff;background:#13293C;padding:14px 18px;border-left:5px solid #32B4AF;transition:padding .35s,background .35s}.sp-links a:hover{padding-left:26px;background:#1C3850}.sp-links b{display:block;font-size:19px}.sp-links b::after{content:\" \\2197\";color:#32B4AF}.sp-links span{display:block;font-size:15px;color:#B9C9D6;margin-top:2px}@media(max-width:900px){.sp-top{grid-template-columns:minmax(0,1fr)}.sp-grid{grid-template-columns:1fr 1fr}.sp-vol{grid-column:span 2}}@media(max-width:560px){.sp-grid,.sp-links{grid-template-columns:minmax(0,1fr)}.sp-vol{grid-column:auto}}@media(prefers-reduced-motion:reduce){.sp-card{transition:none}}" },
    wk: { test: '.wk-tool{', css: "/* ===== make a weekend of it ===== */\n.wk-tool{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.4fr);gap:30px;align-items:start}.wk-out{display:grid;gap:10px}.wk-day{background:rgba(14,33,49,.95);color:#fff;border-top:4px solid #32B4AF;padding:16px 18px;animation:sfIn .45s cubic-bezier(.2,.7,.2,1) both}.wk-day:nth-child(2){animation-delay:.08s}.wk-day:nth-child(3){animation-delay:.16s}.wk-day:nth-child(4){animation-delay:.24s}.wk-day h4{font:700 26px/1 Barlow!important;color:#32B4AF;margin:0 0 10px;letter-spacing:.005em!important}.wk-day ol{list-style:none;margin:0;padding:0;display:grid;gap:4px}.wk-day li{display:grid;grid-template-columns:96px minmax(0,1fr);gap:12px;background:rgba(255,255,255,.07);padding:9px 11px;font-size:15px;line-height:1.45}.wk-day li span{color:#8FDCD8;font-weight:700}.wk-day li.ev{background:rgba(105,80,161,.55)}.wk-days{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.wk-days div{background:#32B4AF;color:#0B1520;padding:16px 18px;box-shadow:0 8px 20px rgba(19,41,60,.12);transition:transform .3s}.wk-days div:hover{transform:translateY(-3px)}.wk-days div.pu{background:#6950A1;color:#fff}.wk-days b{display:block;font:700 26px/1 Barlow;color:#fff;margin-bottom:6px}.wk-days span{font-size:15px;line-height:1.5}.wk-eve{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,1fr);gap:30px;align-items:center;margin-top:40px;background:#13293C;color:#fff;padding:28px}.wk-eve h3{font:700 clamp(28px,3vw,38px)/1 Barlow!important;color:#fff;margin:10px 0 10px;letter-spacing:.005em!important}.wk-eve p{color:#DCE6EE;font-size:17px;line-height:1.65;margin:0}.wk-eve .sf-glass{background:rgba(255,255,255,.06)}@media(max-width:900px){.wk-tool,.wk-eve{grid-template-columns:minmax(0,1fr)}.wk-days{grid-template-columns:1fr 1fr}}@media(max-width:520px){.wk-days{grid-template-columns:1fr}.wk-day li{grid-template-columns:1fr;gap:2px}.wk-eve{padding:22px 16px}}@media(prefers-reduced-motion:reduce){.wk-day{animation:none}}" },
    sf: { test: '.sf-glass{', css: ".sf-glass{background:rgba(14,33,49,.92);color:#fff;border-top:4px solid #32B4AF;box-shadow:0 18px 40px rgba(19,41,60,.25);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);padding:18px 18px 16px}.sf-glass h4{font:700 22px/1 Barlow!important;color:#32B4AF;margin:0 0 10px;letter-spacing:.005em!important}.sf-rows{display:grid;gap:4px}.sf-rows div{display:flex;justify-content:space-between;align-items:baseline;gap:14px;background:rgba(255,255,255,.07);padding:9px 11px;font-size:15px}.sf-rows span{color:#8FDCD8;font-weight:500;white-space:nowrap}.sf-rows b{text-align:right;font-weight:700}.sf-rows div.hl{background:rgba(215,73,73,.92)}.sf-rows div.hl span{color:#fff}" }
  };
  var SX = [
    '.sx-checked{margin:14px 0 0;font:500 15px/1.45 Barlow;color:#C9D6E0}',
    '.sx-checked b{color:#32B4AF;font-weight:700}',
    '.sx-gtk-h{font:700 26px/1.05 Barlow;color:#13293C;margin:0 0 6px;text-transform:uppercase;letter-spacing:.01em}',
    '.sx-gtk-p{margin:0 0 16px;font-size:16px;line-height:1.55;color:#33424F;max-width:70ch}',
    '.sx-gtk{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(230px,100%),1fr));gap:12px;margin:0 0 34px}',
    '.sx-gtk article{background:#fff;border:1px solid #DCE3E8;border-top:5px solid #32B4AF;padding:14px 16px 16px;box-shadow:0 6px 18px rgba(19,41,60,.06);transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s}',
    '.sx-gtk article:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(19,41,60,.12)}',
    '.sx-gtk article.no{border-top-color:#D74949}.sx-gtk article.check{border-top-color:#6950A1}',
    '.sx-gtk h4{margin:0 0 4px;font:700 17px/1.25 Barlow;color:#13293C}',
    '.sx-gtk .sx-ans{display:inline-block;margin:0 0 8px;padding:3px 9px;font:700 14px/1.3 Barlow;background:#E3F4F3;color:#0E5F5B}',
    '.sx-gtk article.no .sx-ans{background:#FBEBEB;color:#A33434}.sx-gtk article.check .sx-ans{background:#EFEDFF;color:#4E3A86}',
    '.sx-gtk p{margin:0;font-size:15px;line-height:1.5;color:#33424F}',
    '.sx-res[hidden]{display:none!important}',
    '@media(max-width:640px){.sx-gtk{grid-template-columns:minmax(0,1fr)}.sx-gtk-h{font-size:23px}}',
    '@media(prefers-reduced-motion:reduce){.sx-gtk article{transition:none}}',
    /* easier reading outdoors: nothing on a phone smaller than 14px apart from compact table codes */
    '@media(max-width:700px){small,figcaption,.lu-note,.lu-small,.sg-foot,.xd-sl,.ph,.l,i.dark,.cg-sub small{font-size:14px!important;line-height:1.4!important}}'
  ].join('');

  function inject(R){
    var have = [].map.call(R.querySelectorAll('style'), function(s){ return s.textContent; }).join('').replace(/\s+/g,'');
    var css = SX;
    Object.keys(GROUPS).forEach(function(k){ if(have.indexOf(GROUPS[k].test) < 0) css += GROUPS[k].css; });
    var st = document.createElement('style'); st.id = 'show-extras-css'; st.textContent = css; (R === document ? document.head : R).appendChild(st);
  }

  /* Pick your day: each answer adds points to days, the best scoring day's card shows */
  function picker(R){
    [].forEach.call(R.querySelectorAll('.sx-pick'), function(box){
      var groups = [].slice.call(box.querySelectorAll('[data-sx-q]'));
      var res = [].slice.call(box.querySelectorAll('.sx-res'));
      if(!res.length) return;
      function run(){
        var score = {};
        res.forEach(function(r){ score[r.getAttribute('data-sx-day')] = 0; });
        groups.forEach(function(g){
          var b = g.querySelector('button.on') || g.querySelector('button'); if(!b) return;
          (b.getAttribute('data-sx-score') || '').split(/\s+/).forEach(function(p){
            var kv = p.split(':'); if(kv[0] in score) score[kv[0]] += (+kv[1] || 0);
          });
        });
        var best = res[0], bs = -1;
        res.forEach(function(r){ var s = score[r.getAttribute('data-sx-day')]; if(s > bs){ bs = s; best = r; } });
        res.forEach(function(r){ r.hidden = r !== best; });
      }
      groups.forEach(function(g){
        [].forEach.call(g.querySelectorAll('button'), function(b){
          b.addEventListener('click', function(){
            [].forEach.call(g.querySelectorAll('button'), function(x){ x.classList.toggle('on', x === b); });
            run();
          });
        });
      });
      run();
    });
  }

  /* Card filters: buttons in [data-sx-filter="gridId"] highlight cards whose data-t holds the value */
  function filters(R){
    [].forEach.call(R.querySelectorAll('[data-sx-filter]'), function(pick){
      var grid = R.getElementById(pick.getAttribute('data-sx-filter')); if(!grid) return;
      var cards = [].slice.call(grid.children);
      [].forEach.call(pick.querySelectorAll('button'), function(b){
        b.addEventListener('click', function(){
          var v = b.getAttribute('data-v');
          [].forEach.call(pick.querySelectorAll('button'), function(x){ x.classList.toggle('on', x === b); });
          cards.forEach(function(c){
            var hit = v === 'all' || (' ' + (c.getAttribute('data-t') || '') + ' ').indexOf(' ' + v + ' ') > -1;
            c.classList.toggle('off', !hit); c.classList.toggle('hit', hit && v !== 'all');
          });
        });
      });
    });
  }

  /* Experience flights filter, for pages that don't already have one */
  function flights(R){
    if(R.getElementById('flights-js') || R.querySelector('[data-xf][data-sx-bound]')) return;
    var chips = [].slice.call(R.querySelectorAll('[data-xf]')); if(!chips.length) return;
    chips.forEach(function(b){ b.setAttribute('data-sx-bound', '1'); });
    var cards = [].slice.call(R.querySelectorAll('.xf-card')), cnt = R.getElementById('xfCount'), empty = R.getElementById('xfEmpty');
    var place = (window.SX_PC && window.SX_PC.place) || 'the show';
    function pick(k){
      var n = 0;
      cards.forEach(function(c){
        var hit = k === 'all' || (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + k + ' ') > -1;
        if(hit) n++;
        c.classList.toggle('xf-off', !hit); c.classList.toggle('xf-match', hit && k !== 'all');
      });
      chips.forEach(function(b){ var on = b.getAttribute('data-xf') === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      if(cnt) cnt.textContent = k === 'all' ? (cards.length === 1 ? '1 way to fly at ' + place : cards.length + ' ways to fly at ' + place) : (n === 1 ? '1 flight fits that' : n + ' flights fit that');
      if(empty) empty.hidden = n > 0;
    }
    chips.forEach(function(b){ b.addEventListener('click', function(){ pick(b.getAttribute('data-xf')); }); });
    pick('all');
  }

  /* Postcard maker, for sections marked data-sx-postcard */
  function postcard(R){
    var sec = R.querySelector('[data-sx-postcard]'); if(!sec) return;
    var cv = sec.querySelector('canvas'); if(!cv) return;
    var cx = cv.getContext('2d'), P = window.SX_PC || {};
    var state = { pic: null, style: 'glass', name: '', msg: P.msg || 'Wish you were here!', show: '' };
    var pics = [].slice.call(sec.querySelectorAll('.pc-pics button'));
    var JET = new Path2D('M23 8c0-.6-.9-1-2-1.1L14.5 6.4 10 .8H8l2.4 5.6-5 .3L3.4 4H2l1 4-1 4h1.4l2-2.7 5 .3L8 15.2h2l4.5-5.6 6.5-.5C22.1 9 23 8.6 23 8z');
    var sel = sec.querySelector('.pc-show');
    if(sel){ sel.innerHTML = (P.shows || [P.place]).map(function(s){ return '<option>' + s + '</option>'; }).join(''); state.show = sel.value; }
    function cover(img, x, y, w, h){ var r = Math.max(w / img.naturalWidth, h / img.naturalHeight), iw = img.naturalWidth * r, ih = img.naturalHeight * r; cx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); }
    function logo(x, y, s, col){
      cx.font = '700 40px Barlow'; var tw = cx.measureText('UK AIRSHOW GUIDE').width; x = Math.min(x, cv.width - 50 - tw);
      cx.fillStyle = col || '#fff'; cx.textBaseline = 'alphabetic';
      cx.fillText('UK AIRSHOW GUIDE', x, y + s * 8 - 2);
      cx.font = '500 22px Barlow'; cx.globalAlpha = .85; cx.fillText('Big Guide to UK Airshows', x, y + s * 8 + 26); cx.globalAlpha = 1;
    }
    function wrap(t, x, y, maxW, lh){ var w = t.split(' '), line = '', n = 0; for(var i = 0; i < w.length; i++){ var test = line ? line + ' ' + w[i] : w[i]; if(cx.measureText(test).width > maxW && line){ cx.fillText(line, x, y + n * lh); line = w[i]; n++; } else line = test; } cx.fillText(line, x, y + n * lh); }
    function fit(t, maxW, size, weight, fam){ do { cx.font = weight + ' ' + size + 'px ' + fam; size -= 2; } while(cx.measureText(t).width > maxW && size > 20); }
    function draw(){
      var W = cv.width, H = cv.height, img = state.pic && state.pic.querySelector('img');
      var greet = (P.greet || 'Greetings').toUpperCase();
      cx.clearRect(0, 0, W, H); cx.textBaseline = 'alphabetic';
      var sub = [state.name ? 'From ' + state.name : '', state.show].filter(Boolean).join('  |  ');
      if(state.style === 'band'){
        if(img && img.complete) cover(img, 0, 0, W, H * 0.7);
        cx.fillStyle = '#13293C'; cx.fillRect(0, H * 0.7, W, H * 0.3); cx.fillStyle = '#32B4AF'; cx.fillRect(0, H * 0.7, W, 10);
        cx.fillStyle = '#D74949'; fit(greet, W - 660, 92, '800', 'Barlow'); cx.fillText(greet, 60, H * 0.7 + 110);
        cx.fillStyle = '#fff'; cx.font = '700 58px Barlow'; wrap(state.msg, 60, H * 0.7 + 185, W * 0.62, 58);
        cx.fillStyle = '#8FDCD8'; cx.font = '700 30px Barlow'; cx.fillText(sub, 60, H - 36);
        logo(W - 470, H * 0.7 + 110, 4);
      } else if(state.style === 'stamp'){
        if(img && img.complete) cover(img, 0, 0, W, H);
        var g = cx.createLinearGradient(0, 0, 0, H * 0.5); g.addColorStop(0, 'rgba(14,33,49,.7)'); g.addColorStop(1, 'rgba(14,33,49,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H * 0.5);
        cx.fillStyle = '#fff'; cx.shadowColor = 'rgba(0,0,0,.45)'; cx.shadowBlur = 18; cx.font = '700 96px Barlow'; wrap(state.msg, 64, 140, W * 0.62, 92); cx.shadowBlur = 0;
        var sx = W - 300, sy = 50; cx.fillStyle = '#6950A1'; cx.fillRect(sx, sy, 240, 280);
        cx.strokeStyle = '#fff'; cx.lineWidth = 6; cx.setLineDash([14, 10]); cx.strokeRect(sx + 14, sy + 14, 212, 252); cx.setLineDash([]);
        
        cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.font = '700 64px Barlow'; cx.fillText(P.year || '2027', sx + 120, sy + 162); cx.textAlign = 'left';
        cx.fillStyle = 'rgba(14,33,49,.85)'; cx.fillRect(0, H - 110, W, 110); cx.fillStyle = '#32B4AF'; cx.fillRect(0, H - 110, W, 6);
        cx.fillStyle = '#fff'; cx.font = '700 34px Barlow'; cx.fillText(sub || P.place, 50, H - 44);
        logo(W - 470, H - 90, 4);
      } else {
        if(img && img.complete) cover(img, 0, 0, W, H);
        var pw = W * 0.56, ph = H * 0.4, px = 50, py = H - ph - 50;
        cx.fillStyle = 'rgba(14,33,49,.78)'; cx.fillRect(px, py, pw, ph); cx.fillStyle = '#32B4AF'; cx.fillRect(px, py, pw, 10);
        cx.fillStyle = '#fff'; fit(greet, pw - 80, 88, '800', 'Barlow'); cx.fillText(greet, px + 40, py + 120);
        cx.fillStyle = '#8FDCD8'; cx.font = '700 54px Barlow'; wrap(state.msg, px + 40, py + 190, pw - 80, 54);
        cx.fillStyle = '#DCE6EE'; cx.font = '700 28px Barlow'; cx.fillText(sub, px + 40, py + ph - 36);
        cx.fillStyle = 'rgba(14,33,49,.78)'; cx.fillRect(W - 470, H - 150, 420, 100); logo(W - 450, H - 136, 4);
      }
    }
    pics.forEach(function(b){ b.addEventListener('click', function(){ state.pic = b; pics.forEach(function(x){ x.classList.toggle('on', x === b); }); draw(); }); });
    var styles = [].slice.call(sec.querySelectorAll('[data-pcs]'));
    styles.forEach(function(b){ b.addEventListener('click', function(){ state.style = b.getAttribute('data-pcs'); styles.forEach(function(x){ x.classList.toggle('on', x === b); }); draw(); }); });
    var nm = sec.querySelector('.pc-name'), tx = sec.querySelector('.pc-text'), note = sec.querySelector('.pc-msg');
    if(nm) nm.addEventListener('input', function(e){ state.name = e.target.value.trim(); draw(); });
    if(tx) tx.addEventListener('input', function(e){ state.msg = e.target.value.trim() || P.msg || 'Wish you were here!'; draw(); });
    if(sel) sel.addEventListener('change', function(){ state.show = sel.value; draw(); });
    function file(){ return (P.slug || 'airshow') + '-postcard.jpg'; }
    var save = sec.querySelector('.pc-save'), share = sec.querySelector('.pc-share');
    if(save) save.addEventListener('click', function(){
      try { var a = document.createElement('a'); a.href = cv.toDataURL('image/jpeg', .92); a.download = file(); document.body.appendChild(a); a.click(); a.remove(); note.textContent = 'Saved. Check your downloads.'; }
      catch(e){ note.textContent = 'Saving isn’t available here. Press and hold the postcard to save it instead.'; }
    });
    if(share) share.addEventListener('click', function(){
      var done = function(b){
        if(b && navigator.canShare){ var f = new File([b], file(), { type: 'image/jpeg' });
          if(navigator.canShare({ files: [f] })){ navigator.share({ files: [f], title: 'My ' + (P.place || 'airshow') + ' postcard', text: 'Made with The Big Guide to UK Airshows' }).catch(function(){}); return; } }
        note.textContent = 'Sharing isn’t available on this device. Save the postcard, then post it from your photos.';
      };
      try { cv.toBlob(done, 'image/jpeg', .92); } catch(e){ done(null); }
    });
    function start(){ if(!state.pic && pics[0]){ state.pic = pics[0]; pics[0].classList.add('on'); } draw(); }
    pics.forEach(function(b){ var im = b.querySelector('img'); im.addEventListener('load', function(){ if(state.pic === b) draw(); }); });
    var loads = pics.map(function(b){ var im = b.querySelector('img'); return new Promise(function(res){ if(im.complete && im.naturalWidth) res(); else { im.addEventListener('load', res); setTimeout(res, 1500); } }); });
    var fonts = document.fonts ? Promise.all(['800 60px "Barlow"', '700 40px Barlow', '600 20px Barlow'].map(function(f){ return document.fonts.load(f).catch(function(){}); })) : Promise.resolve();
    Promise.all(loads.concat([fonts])).then(start); start();
  }

  /* Inside the Wix site the guide lives in the airshow-page element's shadow root, so styles and
     behaviour go wherever the guide actually is: that root, or the page itself when opened on its own. */
  var ME = document.currentScript;
  /* guide notes: hide a note while the guide it links to has no live Wix page yet (links.js live:false) */
  var WAITING = []; /* the six new guides went live on 3 Nov 2026; add a slug here to hide notes for a guide that is not published yet */
  function gate(R){
    var wait = {};
    WAITING.forEach(function(s){ wait[s] = 1; });
    var L = window.AIRSHOW_LINKS;
    if(L && L.guides) L.guides.forEach(function(g){ if(g.live) delete wait[g.slug]; else wait[g.slug] = 1; });
    [].forEach.call(R.querySelectorAll('.ns-note'), function(n){
      var hide = false;
      [].forEach.call(n.querySelectorAll('a[href]'), function(a){
        var m = (a.getAttribute('href') || '').match(/^https?:\/\/(?:www\.)?ukairshowguide\.co\.uk\/([^\/?#]+)/);
        if(m && wait[m[1]]) hide = true;
      });
      if(hide){ n.style.display = 'none'; n.setAttribute('data-sx-gated', '1'); }
      else if(n.hasAttribute('data-sx-gated')){ n.style.display = ''; n.removeAttribute('data-sx-gated'); }
    });
  }
  function roots(){
    var out = [];
    var mine = ME && ME.getRootNode ? ME.getRootNode() : null;
    if(mine && mine !== document && mine.querySelector) out.push(mine);
    [].forEach.call(document.querySelectorAll('airshow-page'), function(e){ if(e.shadowRoot && out.indexOf(e.shadowRoot) < 0) out.push(e.shadowRoot); });
    out.push(document);
    return out.filter(function(r){ return r.querySelector('.sx-gtk, [data-sx-postcard], .sx-pick, .sx-checked, .ns-note'); });
  }
  function run(R){
    gate(R);
    if(R.__sxDone) return; R.__sxDone = true;
    inject(R); picker(R); filters(R); flights(R); postcard(R);
  }
  var tries = 0;
  function go(){
    var rs = roots();
    rs.forEach(run);
    if(!rs.length && tries++ < 40) setTimeout(go, 250);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  window.addEventListener('load', function(){ roots().forEach(gate); });
  setTimeout(function(){ roots().forEach(gate); }, 3000);
})();
