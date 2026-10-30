/* Search in the site header (30 Oct 2026).
   Loaded on every page by the Wix custom code block "UK Airshow Guide header search".
   It waits for the custom header menu (#ukag), adds a search button to it, and opens a search bar
   that drops down under the header. Results come from search/index.js, loaded the first time
   someone opens search. Shortcut keys: / or Ctrl K to open, arrows to move, Enter to go, Esc to close. */
(function(){
  if(window.__ukagSearch) return;
  window.__ukagSearch = 1;
  var BASE = window.UKAG_SEARCH_BASE || 'https://jskedge1.github.io/airshow-pages/search/';
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>';

  var css = ''
    + '#ukag .qs{display:flex;align-items:stretch;margin-left:4px}'
    + '#ukag .qsb{display:flex;align-items:center;justify-content:center;gap:8px;height:62px;min-width:46px;padding:0 12px;border:0;background:transparent;color:#fff;cursor:pointer;font:600 14px/1 Barlow,Arial,sans-serif;transition:background-color .35s ease,color .35s ease}'
    + '#ukag .qsb svg{width:19px;height:19px;flex:none;transition:transform .45s cubic-bezier(.22,1,.36,1)}'
    + '#ukag .qsb:hover,#ukag .qsb:focus-visible,#ukag .qsb[aria-expanded="true"]{background:#32B4AF;outline:none}'
    + '#ukag .qsb:hover svg{transform:rotate(-12deg) scale(1.08)}'
    + '#ukag .qsm{display:none}'
    + '#ukag.nr .qsm{display:flex;height:62px}'
    + '#ukag.hud .qsb{color:#5FE3D6}#ukag.hud .qsb:hover,#ukag.hud .qsb[aria-expanded="true"]{background:rgba(95,227,214,.14)}'
    + '#ukqs-bg{position:fixed;inset:62px 0 0;z-index:99997;background:rgba(5,13,20,.55);opacity:0;transition:opacity .35s ease;pointer-events:none}'
    + '#ukqs-bg.o{opacity:1;pointer-events:auto}'
    + '#ukqs{position:fixed;top:62px;left:0;right:0;z-index:99998;background:#0E2131;border-top:4px solid #32B4AF;box-shadow:0 22px 50px rgba(0,0,0,.4);font-family:Barlow,Arial,sans-serif;color:#fff;clip-path:inset(0 0 100% 0);visibility:hidden;transition:clip-path .45s cubic-bezier(.22,1,.36,1),visibility 0s linear .45s;max-height:calc(100vh - 62px);overflow-y:auto;scrollbar-width:none}'
    + '#ukqs::-webkit-scrollbar{display:none}'
    + '#ukqs.o{clip-path:inset(0 0 0 0);visibility:visible;transition:clip-path .45s cubic-bezier(.22,1,.36,1),visibility 0s}'
    + '#ukqs *{box-sizing:border-box;margin:0;border-radius:0}'
    + '#ukqs .qw{max-width:1100px;margin:0 auto;padding:22px 16px 26px}'
    + '#ukqs form{display:flex;align-items:center;gap:12px;border-bottom:2px solid #32B4AF;padding-bottom:6px}'
    + '#ukqs form>svg{width:24px;height:24px;color:#32B4AF;flex:none}'
    + '#ukqs input{flex:1;min-width:0;background:transparent;border:0;outline:none;color:#fff;font:500 clamp(20px,3vw,28px)/1.2 Barlow,Arial,sans-serif;padding:8px 0;-webkit-appearance:none;appearance:none}'
    + '#ukqs input::placeholder{color:#7F98AB}'
    + '#ukqs input::-webkit-search-cancel-button{display:none}'
    + '#ukqs .qx{flex:none;background:transparent;border:2px solid rgba(255,255,255,.5);color:#fff;font:600 14px/1 Barlow,Arial,sans-serif;padding:9px 12px;cursor:pointer;transition:border-color .3s,background-color .3s}'
    + '#ukqs .qx:hover,#ukqs .qx:focus-visible{border-color:#fff;background:rgba(255,255,255,.08);outline:none}'
    + '#ukqs .qi{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:16px;font:500 15px/1.3 Barlow,Arial,sans-serif;color:#C9D6E0}'
    + '#ukqs .qi button{background:#13293C;border:1px solid #2C4A63;color:#fff;font:500 15px/1 Barlow,Arial,sans-serif;padding:8px 12px;cursor:pointer;transition:background-color .3s,border-color .3s}'
    + '#ukqs .qi button:hover,#ukqs .qi button:focus-visible{background:#32B4AF;border-color:#32B4AF;outline:none}'
    + '#ukqs .qr{list-style:none;padding:0;margin-top:14px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:28px}'
    + '#ukqs .qr li{border-bottom:1px solid #22405A;animation:ukqsIn .4s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--n) * 35ms)}'
    + '@keyframes ukqsIn{from{opacity:0;transform:translateY(6px)}}'
    + '#ukqs .qr a{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px 14px;padding:13px 10px;color:#fff;text-decoration:none;transition:background-color .25s ease,padding-left .3s ease;border-left:4px solid transparent}'
    + '#ukqs .qr a:hover,#ukqs .qr a.on{background:#13293C;border-left-color:#32B4AF;padding-left:16px}'
    + '#ukqs .qr .qg{grid-column:1;font:500 13px/1.2 Barlow,Arial,sans-serif;color:#32B4AF}'
    + '#ukqs .qr b{grid-column:1;font:600 18px/1.25 Barlow,Arial,sans-serif}'
    + '#ukqs .qr .qd{grid-column:1;font:400 15px/1.45 Barlow,Arial,sans-serif;color:#BFCFDB;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
    + '#ukqs .qr .qd em{font-style:normal;color:#fff;font-weight:500}'
    + '#ukqs .qr svg{grid-column:2;grid-row:1/span 3;width:20px;height:20px;color:#D74949;transition:transform .3s ease}'
    + '#ukqs .qr a:hover svg,#ukqs .qr a.on svg{transform:translateX(4px)}'
    + '#ukqs .qn{margin-top:16px;font:500 17px/1.5 Barlow,Arial,sans-serif;color:#C9D6E0}'
    + '#ukqs .qn a{color:#32B4AF;font-weight:600}'
    + '#ukqs [hidden]{display:none!important}'
    + '#ukqs .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}'
    + '#ukag.hud~#ukqs,#ukqs.hud{border-top-color:#5FE3D6;background:#08141F}'
    + '@media (max-width:420px){#ukag .bg span{display:none}#ukag .qsm{min-width:40px;padding:0 8px}}'
    + '@media (max-width:760px){#ukqs .qw{padding:16px 14px 20px}#ukqs .qr{grid-template-columns:minmax(0,1fr)}#ukqs .qx span{display:none}#ukqs .qx{padding:9px 10px}}'
    + '@media (prefers-reduced-motion:reduce){#ukqs,#ukqs-bg,#ukqs .qr li,#ukag .qsb svg{transition:none!important;animation:none!important}}';

  var head, panel, bg, input, list, note, ideas, live, lastFocus = null, results = [], pick = -1, loading = null;

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }

  function loadIndex(){
    if(window.UKAGSearch) return Promise.resolve();
    if(loading) return loading;
    loading = new Promise(function(done, fail){
      var s = document.createElement('script');
      s.src = BASE + 'index.js?v=' + Math.floor(Date.now() / 36e5);
      s.onload = done; s.onerror = fail;
      document.head.appendChild(s);
    });
    return loading;
  }

  function build(){
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    bg = document.createElement('div');
    bg.id = 'ukqs-bg';
    panel = document.createElement('div');
    panel.id = 'ukqs';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Search the guide');
    panel.innerHTML = '<div class="qw">'
      + '<form role="search" action="#">' + ICON
      + '<label class="sr" for="ukqs-in">Search the guide</label>'
      + '<input id="ukqs-in" type="search" autocomplete="off" spellcheck="false" placeholder="Search shows, parking, camping, camera tips" aria-controls="ukqs-list" aria-autocomplete="list">'
      + '<button class="qx" type="button"><span>Close </span>Esc</button></form>'
      + '<div class="qi"><span>Popular searches</span></div>'
      + '<p class="qn" hidden></p>'
      + '<ul class="qr" id="ukqs-list" role="listbox" aria-label="Search results"></ul>'
      + '<p class="sr" aria-live="polite"></p></div>';
    document.body.appendChild(bg);
    document.body.appendChild(panel);
    input = panel.querySelector('input');
    list = panel.querySelector('.qr');
    note = panel.querySelector('.qn');
    ideas = panel.querySelector('.qi');
    live = panel.querySelector('[aria-live]');

    ['Parking', 'Camping', 'Red Arrows', 'Trains', 'What to pack', 'Children', 'Accessible parking'].forEach(function(t){
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.addEventListener('click', function(){ input.value = t; run(); input.focus(); });
      ideas.appendChild(b);
    });

    panel.querySelector('.qx').addEventListener('click', close);
    bg.addEventListener('click', close);
    panel.querySelector('form').addEventListener('submit', function(e){
      e.preventDefault();
      var r = results[pick > -1 ? pick : 0];
      if(r) go(r.path);
    });
    input.addEventListener('input', run);
    input.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        if(!results.length) return;
        e.preventDefault();
        pick = (pick + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
        mark();
      }
    });
    panel.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ e.stopPropagation(); close(); }
      if(e.key === 'Tab'){
        var f = [].slice.call(panel.querySelectorAll('input,button,a[href]')).filter(function(x){ return x.offsetParent; });
        if(!f.length) return;
        if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
        else if(!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
      }
    });
  }

  function go(path){
    close();
    if(location.pathname + location.search === path) return;
    location.assign(path);
  }

  function mark(){
    [].forEach.call(list.querySelectorAll('a'), function(a, i){
      a.classList.toggle('on', i === pick);
      a.setAttribute('aria-selected', i === pick ? 'true' : 'false');
      if(i === pick) a.scrollIntoView({block:'nearest'});
    });
  }

  function run(){
    var q = input.value.trim();
    ideas.hidden = !!q;
    note.hidden = true;
    pick = -1;
    if(!q){ list.innerHTML = ''; results = []; live.textContent = ''; return; }
    loadIndex().then(function(){
      if(input.value.trim() !== q) return;
      results = window.UKAGSearch.find(q, 8);
      list.innerHTML = results.map(function(r, i){
        var line = r.hit ? 'On this page: <em>' + esc(r.hit) + '</em>' : esc(r.d);
        return '<li style="--n:' + i + '"><a href="' + esc(r.path) + '" role="option" aria-selected="false">'
          + '<span class="qg">' + esc(r.g) + '</span><b>' + esc(r.t) + '</b><span class="qd">' + line + '</span>' + ARROW + '</a></li>';
      }).join('');
      if(!results.length){
        note.hidden = false;
        note.innerHTML = 'I could not find anything for &ldquo;' + esc(q) + '&rdquo;. Try a show name, or a word like parking, camping or trains. You can also <a href="/air-shows-guides">see every show I cover</a>.';
      } else if(!results[0].exact){
        note.hidden = false;
        note.textContent = 'Nothing matched every word, so these are the closest pages.';
      }
      live.textContent = results.length ? results.length + ' results' : 'No results';
    }, function(){
      note.hidden = false;
      note.innerHTML = 'Search is having trouble loading. Please try again in a moment, or <a href="/air-shows-guides">see every show I cover</a>.';
    });
  }

  function open(){
    if(!panel) build();
    loadIndex();
    lastFocus = document.activeElement;
    panel.classList.toggle('hud', head.classList.contains('hud'));
    panel.classList.add('o');
    bg.classList.add('o');
    [].forEach.call(head.querySelectorAll('.qsb'), function(b){ b.setAttribute('aria-expanded', 'true'); });
    var mb = head.querySelector('.mb.o'), bgBtn = head.querySelector('.bg');
    if(mb && bgBtn) bgBtn.click();
    setTimeout(function(){ input.focus(); input.select(); }, 60);
  }

  function close(){
    if(!panel || !panel.classList.contains('o')) return;
    panel.classList.remove('o');
    bg.classList.remove('o');
    [].forEach.call(head.querySelectorAll('.qsb'), function(b){ b.setAttribute('aria-expanded', 'false'); });
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toggle(){ panel && panel.classList.contains('o') ? close() : open(); }

  function attach(){
    head = document.getElementById('ukag');
    if(!head) return false;
    if(head.querySelector('.qsb')) return true;
    var menu = head.querySelector('.m'), w = head.querySelector('.w'), burger = head.querySelector('.bg');
    if(!menu || !w) return false;
    var li = document.createElement('li');
    li.className = 'qs';
    li.innerHTML = '<button class="qsb" type="button" aria-expanded="false" aria-controls="ukqs" title="Search the guide">' + ICON + '<span class="sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Search the guide</span></button>';
    var forum = menu.querySelector('.fm') || menu.querySelector('.acct');
    menu.insertBefore(li, forum || null);
    var small = document.createElement('button');
    small.className = 'qsb qsm';
    small.type = 'button';
    small.setAttribute('aria-expanded', 'false');
    small.setAttribute('aria-controls', 'ukqs');
    small.setAttribute('aria-label', 'Search the guide');
    small.innerHTML = ICON;
    if(burger) w.insertBefore(small, burger); else w.appendChild(small);
    [].forEach.call(head.querySelectorAll('.qsb'), function(b){ b.addEventListener('click', toggle); });
    if(!panel){ var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); css = ''; }
    window.dispatchEvent(new Event('resize'));
    return true;
  }

  document.addEventListener('keydown', function(e){
    var t = e.target, typing = t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));
    if((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)){ e.preventDefault(); if(head) toggle(); return; }
    if(e.key === '/' && !typing && head){ e.preventDefault(); open(); }
  });

  /* the header is added by another script, so keep checking until it is there */
  var tries = 0;
  (function wait(){
    if(attach()) return;
    if(++tries < 80) setTimeout(wait, 150);
  })();
})();
