/* Site search engine for The Big Guide to UK Airshows.
   tools-search.py joins this file onto the page list it builds, as search/index.js.
   Used by the header search (search/header-search.js) and the search bar on the home page.
   UKAGSearch.find(text, max) gives back the best pages, each with the heading on the page that matched. */
(function(){
  var PAGES = window.UKAG_SEARCH_PAGES || [];
  var SITE = 'https://www.ukairshowguide.co.uk';

  /* words people type that mean the same thing as words on the pages */
  var SAME = {
    rail:'train', trains:'train', station:'train', coach:'bus', coaches:'bus', buses:'bus',
    car:'parking', cars:'parking', park:'parking', drive:'parking', driving:'parking',
    accommodation:'stay', airbnb:'stay',
    tent:'camping', tents:'camping', campsite:'camping', caravan:'camping', motorhome:'camping', glamping:'camping',
    camera:'photography', cameras:'photography', photo:'photography', photos:'photography', lens:'photography', lenses:'photography', settings:'photography',
    kids:'children', child:'children', toddler:'children', baby:'children', family:'children', families:'children',
    wheelchair:'accessible', disabled:'accessible', disability:'accessible', access:'accessible', accessibility:'accessible', 'blue':'accessible',
    ear:'ear', defenders:'ear', noise:'ear', loud:'ear',
    tickets:'ticket', price:'ticket', prices:'ticket', cost:'ticket', costs:'ticket',
    food:'food', drink:'food', eat:'food', eating:'food', picnic:'food',
    bag:'security', bags:'security', searches:'security', banned:'security',
    rain:'weather', wet:'weather', sun:'weather', forecast:'weather',
    dates:'calendar', date:'calendar', when:'calendar', '2027':'calendar',
    map:'map', near:'map', nearby:'map',
    forum:'forum', chat:'forum', members:'hub', login:'hub', planner:'hub',
    reds:'red arrows', arrows:'red arrows',
    tattoo:'riat', fairford:'riat', airbourne:'eastbourne', swansea:'wales', warden:'shuttleworth',
    gransden:'gransden', cosford:'cosford', iwm:'duxford', ragley:'midlands'
  };
  var SKIP = {the:1,a:1,an:1,and:1,or:1,to:1,of:1,at:1,in:1,on:1,for:1,is:1,it:1,my:1,i:1,do:1,how:1,what:1,where:1,can:1,with:1,best:1,uk:1,airshow:1,airshows:1,air:1,show:1,shows:1,guide:1};

  function norm(s){ return String(s||'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim(); }
  function words(q){
    var out = [];
    norm(q).split(' ').forEach(function(w){
      if(!w || SKIP[w]) return;
      out.push({w:w, alt:SAME[w] && SAME[w] !== w ? SAME[w] : ''});
    });
    return out;
  }
  /* prefix match on whole words, so "park" finds "parking" but "art" does not find "start" */
  function has(text, w){
    if(!w) return false;
    var i = text.indexOf(w), short = w.length < 4;
    while(i > -1){
      var end = text.charAt(i + w.length);
      if((i === 0 || text.charAt(i-1) === ' ') && (!short || end === '' || end === ' ' || end === 's')) return true;
      i = text.indexOf(w, i+1);
    }
    return false;
  }

  var prepared = PAGES.map(function(p){
    return {
      p:p,
      t:norm(p.t + ' ' + (p.a||'')),
      d:norm(p.d),
      g:norm(p.g),
      h:(p.h||[]).map(function(x){ return {raw:x, n:norm(x)}; })
    };
  });

  function score(item, ws, phrase){
    var total = 0, hit = '', hitScore = 0, missed = 0;
    ws.forEach(function(o){
      var best = 0;
      [o.w, o.alt].forEach(function(w, k){
        if(!w) return;
        var weight = k ? 0.7 : 1, s = 0;
        if(has(item.t, w)) s = Math.max(s, 12);
        if(has(item.g, w)) s = Math.max(s, 5);
        if(has(item.d, w)) s = Math.max(s, 4);
        item.h.forEach(function(h){
          if(has(h.n, w)){
            s = Math.max(s, 3);
            var hs = (h.n.indexOf(phrase) > -1 ? 6 : 0) + (h.n.indexOf(w) === 0 ? 2 : 0) + (/guide|arrival|getting there/.test(h.n) ? 1 : 0) + 3 - Math.min(h.n.length, 60) / 30;
            if(k) hs = hs / 2;
            if(hs > hitScore && !has(item.t, w)){ hitScore = hs; hit = h.raw; }
          }
        });
        best = Math.max(best, s * weight);
      });
      if(!best) missed++;
      total += best;
    });
    if(phrase.length > 3 && item.t.indexOf(phrase) > -1) total += 20;
    return {s:total, missed:missed, hit:hit};
  }

  function find(q, max){
    max = max || 8;
    var ws = words(q);
    if(!ws.length) return [];
    var phrase = norm(q);
    var all = prepared.map(function(item){
      var r = score(item, ws, phrase);
      return {page:item.p, s:r.s, missed:r.missed, hit:r.hit};
    }).filter(function(r){ return r.s > 0; });
    /* pages that match every word come first; if none do, show the closest */
    var full = all.filter(function(r){ return !r.missed; });
    var list = (full.length ? full : all).sort(function(a, b){ return b.s - a.s || a.page.t.localeCompare(b.page.t); });
    return list.slice(0, max).map(function(r){
      return {t:r.page.t, u:SITE + r.page.u, path:r.page.u, g:r.page.g, d:r.page.d, hit:r.hit, exact:!r.missed};
    });
  }

  window.UKAGSearch = {find:find, pages:PAGES, site:SITE,
    ideas:['Parking','Camping','Red Arrows','Trains','What to pack','Photography settings','Children','Accessible parking']};
})();
