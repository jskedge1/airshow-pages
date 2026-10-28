/* Traders at this show
   The Big Guide to UK Airshows. Loaded by every feature show page and drawn inside the Food and facilities section:
     <ukag-show-traders data-show="cosford"></ukag-show-traders>
   Listings come from the Airshow Traders directory (Wix collections Traders and TraderShows) through the public feed
   https://www.ukairshowguide.co.uk/_functions/showTraders?show=<id>  (velo/backend/http-functions.js).
   Only approved, live listings booked for that show are sent. Food and drink comes first, Headliners lead each group.
   Add ?tdemo=1 to a page address to see the layout filled with example traders (never shown to visitors otherwise). */
(function () {
  if (customElements.get('ukag-show-traders')) return;

  var FEED = 'https://www.ukairshowguide.co.uk/_functions/showTraders?show=';
  var DIRECTORY = 'https://www.ukairshowguide.co.uk/airshow-traders';

  var CATS = {
    food: { name: 'Food and drink', col: '#D74949', icon: '<path d="M5 3v8a3 3 0 0 0 6 0V3M8 3v18M17 3c-2 0-3 2.5-3 6s1.3 4 3 4v8"/>' },
    art: { name: 'Art and prints', col: '#6950A1', icon: '<rect x="3" y="4" width="18" height="16"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/>' },
    models: { name: 'Models and toys', col: '#32B4AF', icon: '<path d="M2 13l9-2 3-7h2l-1 7 7 1v2l-7 1 1 5h-2l-3-5-9-1z"/>' },
    clothing: { name: 'Clothing and patches', col: '#13293C', icon: '<path d="M8 3l-5 3 2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z"/>' },
    kit: { name: 'Camera and show kit', col: '#1E3A34', icon: '<rect x="3" y="7" width="18" height="13"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13.5" r="3.5"/>' },
    family: { name: 'Family fun', col: '#0E5F5B', icon: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>' }
  };
  var ORDER = ['food', 'family', 'kit', 'models', 'art', 'clothing'];

  // Example traders for checking the layout only (?tdemo=1). Fictional businesses.
  var DEMO = [
    { name: 'Hangar Brew Co.', town: 'Saffron Walden, Cambridgeshire', cat: 'food', headliner: true,
      about: 'Speciality coffee and hot chocolate from a converted 1970s Citroën van. We open the hatch before the gates do, so early arrivals get the first cup.',
      offer: 'Free refill if you bring your own cup', web: 'hangarbrew.co.uk', dates: 'Sat and Sun', pitch: 'Next to the main food village, by the flag line',
      tags: { diet: ['Vegetarian', 'Vegan', 'Dairy free'], pay: ['Card', 'Contactless'], about: ['Independent'] } },
    { name: 'Flightline Grill', town: 'Clacton on Sea, Essex', cat: 'food',
      about: 'Locally reared beef burgers and halloumi wraps cooked over charcoal. Family run for twenty years.',
      web: 'instagram.com/flightlinegrill', dates: 'Sat and Sun', pitch: 'Food village, row B',
      tags: { diet: ['Vegetarian', 'Gluten free'], pay: ['Cash', 'Card'], about: ['Family run'] } },
    { name: 'Tailwind Fudge Kitchen', town: 'Lytham St Annes, Lancashire', cat: 'food', founding: true,
      about: 'Handmade fudge in small batches, with a different flavour named after an aircraft at every show.',
      web: 'tailwindfudge.co.uk', dates: 'Sun only', pitch: '',
      tags: { diet: ['Vegetarian'], pay: ['Cash', 'Contactless'], about: ['Independent'] } },
    { name: 'Crowdline Outdoor', town: 'Swindon, Wiltshire', cat: 'kit',
      about: 'Folding chairs, windbreaks, ponchos and children’s ear defenders. If you have forgotten something at home, this is usually where you will find it.',
      offer: 'Kids ear defenders at half price on Sunday', web: 'crowdlineoutdoor.co.uk', dates: 'Sat and Sun', pitch: 'Trade village, near the main entrance',
      tags: { pay: ['Card', 'Apple Pay and Google Pay'] } },
    { name: 'Little Aviators', town: 'Bedford, Bedfordshire', cat: 'family',
      about: 'Face painting, pilot wings and a cardboard cockpit for photos, a good stop for younger children between flypasts.',
      web: 'facebook.com/littleaviatorsuk', dates: 'Sat and Sun', pitch: '', tags: { about: ['Family run'] } }
  ];

  var CSS = '' +
    ':host{display:block;margin:34px 0 8px;font-family:"Barlow",system-ui,sans-serif;color:#0B0B0B;--navy:#13293C;--teal:#32B4AF;--teal-ink:#0E5F5B;--red:#D74949;--purple:#6950A1;--mist:#F2F4F5;--line:#D9DEE2;--muted:#5A6873;--ease:cubic-bezier(.22,.61,.36,1)}' +
    '*{box-sizing:border-box}' +
    '.wrap{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,2.2fr);gap:0;background:var(--mist);border:1px solid var(--line)}' +
    '.side{align-self:stretch;background:var(--navy);color:#fff;padding:30px 26px 28px;position:relative;overflow:hidden}' +
    '.side:after{content:"";position:absolute;left:26px;right:26px;bottom:0;height:4px;background:var(--teal)}' +
    '.tag{display:inline-block;background:var(--purple);color:#fff;font-weight:600;font-size:14px;line-height:1;padding:7px 10px;margin:0 0 16px}' +
    'h2{font-family:"Barlow Condensed","Barlow",sans-serif;font-weight:700;font-size:34px;line-height:.98;letter-spacing:.01em;text-transform:uppercase;margin:0 0 14px}' +
    'h2 em{font-style:normal;color:var(--teal)}' +
    '.side p{font-size:16px;line-height:1.55;color:#DCE6EE;margin:0 0 14px}' +
    '.count{display:flex;align-items:baseline;gap:10px;margin:20px 0 22px;padding:14px 0 0;border-top:1px solid rgba(255,255,255,.16)}' +
    '.count b{font-family:"Barlow Condensed","Barlow",sans-serif;font-size:46px;line-height:1;color:#fff}' +
    '.count span{font-weight:500;font-size:15px;color:#BFD0DC}' +
    '.side a{display:inline-flex;align-items:center;gap:8px;color:#fff;font-weight:600;font-size:15px;text-decoration:none;border-bottom:2px solid var(--teal);padding-bottom:3px;margin:0 0 12px;transition:gap .3s var(--ease)}' +
    '.side a:hover,.side a:focus-visible{gap:13px;outline:none}' +
    '.side a.red{border-color:var(--red)}' +
    '.main{padding:24px 24px 26px;min-width:0}' +
    '.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}' +
    '.chip{font:600 15px/1 "Barlow",sans-serif;padding:10px 14px;background:#fff;color:var(--navy);border:1px solid var(--line);cursor:pointer;transition:background .25s var(--ease),color .25s var(--ease),border-color .25s var(--ease)}' +
    '.chip:hover{border-color:var(--teal)}' +
    '.chip[aria-pressed="true"]{background:var(--teal);border-color:var(--teal);color:#fff}' +
    '.chip:focus-visible{outline:2px solid var(--navy);outline-offset:2px}' +
    '.rail{position:relative}' +
    '.grid{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:2px 2px 8px;scrollbar-width:none;overscroll-behavior-x:contain}' +
    '.grid::-webkit-scrollbar{display:none}' +
    '.nav{display:flex;align-items:center;gap:8px;margin:12px 0 0}' +
    '.nav button{width:42px;height:42px;display:grid;place-items:center;background:var(--navy);color:#fff;border:0;cursor:pointer;font:600 20px/1 "Barlow",sans-serif;transition:background .25s var(--ease)}' +
    '.nav button:hover,.nav button:focus-visible{background:var(--teal);outline:none}' +
    '.nav button[disabled]{background:#AEB8C0;cursor:default}' +
    '.nav span{font-weight:500;font-size:15px;color:var(--muted);margin-left:6px}' +
    '.card{flex:0 0 340px;scroll-snap-align:start;display:grid;grid-template-columns:46px minmax(0,1fr);grid-template-rows:1fr auto;background:#fff;border:1px solid var(--line);opacity:0;transform:translateY(10px);transition:opacity .5s var(--ease),transform .5s var(--ease),box-shadow .3s var(--ease)}' +
    '.card.in{opacity:1;transform:none}' +
    '.card:hover{box-shadow:0 10px 24px rgba(19,41,60,.12);transform:translateY(-2px)}' +
    '.card.head{flex-basis:560px;grid-template-columns:46px minmax(0,1.3fr) minmax(0,1fr);grid-template-rows:1fr}' +
    '.strip{grid-row:1/-1;display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px 0;color:#fff}' +
    '.ico{width:30px;height:30px;border-radius:50%;background:#fff;display:grid;place-items:center}' +
    '.ico svg{width:17px;height:17px}' +
    '.vert{writing-mode:vertical-rl;transform:rotate(180deg);font-weight:600;font-size:13px;letter-spacing:.02em;white-space:nowrap}' +
    '.body{padding:16px 18px 16px;min-width:0}' +
    '.top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}' +
    'h3{font-family:"Barlow Condensed","Barlow",sans-serif;font-weight:700;font-size:23px;line-height:1.05;text-transform:uppercase;color:var(--navy);margin:0}' +
    '.town{font-weight:500;font-size:14px;color:var(--muted);margin-top:4px}' +
    '.badge{flex:none;font-weight:600;font-size:13px;line-height:1;padding:6px 8px;color:#fff;background:var(--purple)}' +
    '.badge.hl{background:var(--red)}' +
    '.badge.ind{background:transparent;color:var(--teal-ink);border:1px solid var(--teal)}' +
    '.pics{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:12px 0 0}' +
    '.pics img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none}' +
    '.about{font-size:15.5px;line-height:1.5;margin:10px 0 0}' +
    '.tags{display:flex;flex-wrap:wrap;gap:5px;margin:10px 0 0;padding:0;list-style:none}' +
    '.tags li{font-weight:500;font-size:13px;padding:4px 7px;background:#E7F4F3;color:var(--teal-ink)}' +
    '.tags li.pay{background:var(--mist);color:var(--navy)}' +
    '.offer{margin:12px 0 0;padding:9px 11px;border-left:4px solid var(--purple);background:#F1EEF7;font-size:15px;line-height:1.4}' +
    '.offer b{display:block;font-weight:600;color:var(--purple);font-size:14px}' +
    '.where{padding:16px 18px;border-top:1px solid var(--line);grid-column:2}' +
    '.card.head .where{grid-column:3;border-top:0;border-left:1px solid var(--line);background:#FBFCFC}' +
    '.where dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:15px;line-height:1.35}' +
    '.where dt{font-weight:600;color:var(--teal-ink)}' +
    '.where dd{margin:0;font-weight:500;color:var(--navy)}' +
    '.where dd.cx{color:var(--red)}' +
    '.go{display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-weight:600;font-size:15px;color:var(--navy);text-decoration:none;border-bottom:2px solid var(--red);padding-bottom:2px;transition:gap .3s var(--ease)}' +
    '.go:hover,.go:focus-visible{gap:11px;outline:none}' +
    '.go span{color:var(--red)}' +
    '.empty{background:#fff;border:1px solid var(--line);border-left:4px solid var(--purple);padding:20px 22px}' +
    '.empty h3{font-size:22px;margin:0 0 6px}' +
    '.empty p{margin:0;font-size:15.5px;line-height:1.55}' +
    '.empty a{color:var(--navy);font-weight:600}' +
    '.note{margin:14px 0 0;font-size:14px;line-height:1.5;color:var(--muted)}' +
    '.demo{grid-column:1/-1;background:var(--purple);color:#fff;font-weight:600;font-size:14px;padding:8px 14px}' +
    '@media (max-width:900px){.wrap{grid-template-columns:1fr}.side{padding:24px 20px 22px}.side:after{left:20px;right:20px}.count{margin:14px 0 16px}.main{padding:18px 14px 20px}.card.head{flex-basis:340px;grid-template-columns:46px minmax(0,1fr);grid-template-rows:1fr auto}.card.head .where{grid-column:2;border-left:0;border-top:1px solid var(--line);background:#fff}}' +
    '@media (max-width:640px){.card,.card.head{flex-basis:84%}h2{font-size:30px}.card{grid-template-columns:38px minmax(0,1fr)}.card.head{grid-template-columns:38px minmax(0,1fr)}.ico{width:26px;height:26px}.body,.where{padding:14px}}' +
    '@media (prefers-reduced-motion:reduce){.card{opacity:1;transform:none;transition:none}.card:hover{transform:none}.side a,.go{transition:none}}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function href(w) { return w ? (/^https?:\/\//.test(w) ? w : 'https://' + w) : ''; }
  function imgUrl(u) { var m = /^wix:image:\/\/v1\/([^/]+)/.exec(u || ''); return m ? 'https://static.wixstatic.com/media/' + m[1] : u; }
  function inWix() { try { return window.parent !== window; } catch (e) { return true; } }

  function cardHTML(t) {
    var c = CATS[t.cat] || CATS.food;
    var tags = t.tags || {};
    var badge = t.headliner ? '<span class="badge hl">Headliner</span>' : t.founding ? '<span class="badge">Founding trader</span>' :
      ((tags.about || []).indexOf('Independent') > -1 ? '<span class="badge ind">Independent</span>' : '');
    var pics = (t.photos || []).slice(0, 3);
    var chips = (tags.diet || []).map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') +
      (tags.pay || []).map(function (p) { return '<li class="pay">' + esc(p) + '</li>'; }).join('');
    var link = href(t.web);
    var where = '<dl><dt>Days</dt><dd' + (t.cancelled ? ' class="cx">Not attending this year' : '>' + esc(t.dates || 'Show days')) + '</dd>' +
      (t.pitch && !t.cancelled ? '<dt>Pitch</dt><dd>' + esc(t.pitch) + '</dd>' : '') + '</dl>' +
      (link ? '<a class="go" href="' + esc(link) + '" target="_blank" rel="noopener">Visit their page <span>→</span></a>' : '');
    return '<article class="card' + (t.headliner ? ' head' : '') + '" data-cat="' + esc(t.cat) + '">' +
      '<div class="strip" style="background:' + c.col + '"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="' + c.col + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">' + c.icon + '</svg></span><span class="vert">' + esc(c.name) + '</span></div>' +
      '<div class="body"><div class="top"><div><h3>' + esc(t.name) + '</h3><div class="town">' + esc(t.town) + '</div></div>' + badge + '</div>' +
      (pics.length ? '<div class="pics">' + pics.map(function (u) { return '<img src="' + esc(imgUrl(u)) + '" alt="" loading="lazy" draggable="false">'; }).join('') + '</div>' : '') +
      '<p class="about">' + esc(t.about) + '</p>' +
      (chips ? '<ul class="tags" aria-label="Dietary and payment options">' + chips + '</ul>' : '') +
      (t.offer ? '<div class="offer"><b>Show day offer</b>' + esc(t.offer) + '</div>' : '') +
      '</div><div class="where">' + where + '</div></article>';
  }

  function sortList(list) {
    return list.slice().sort(function (a, b) {
      return (ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat)) || (Number(!!b.headliner) - Number(!!a.headliner)) || String(a.name).localeCompare(String(b.name));
    });
  }

  class ShowTraders extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      this.show = this.getAttribute('data-show') || '';
      this.showName = this.getAttribute('data-name') || 'this show';
      this.root = this.attachShadow({ mode: 'open' });
      this.filter = 'all';
      this.demo = /[?&]tdemo=1/.test(location.search);
      this.paint(null);
      this.load();
    }
    load() {
      var self = this;
      if (this.demo) { setTimeout(function () { self.paint(DEMO); }, 200); return; }
      fetch(FEED + encodeURIComponent(this.show), { mode: 'cors', credentials: 'omit' })
        .then(function (r) { if (!r.ok) throw new Error('feed'); return r.json(); })
        .then(function (d) { self.paint((d && d.traders) || []); })
        .catch(function () { self.paint([]); });
    }
    paint(list) {
      var loading = list === null;
      var all = loading ? [] : sortList(list);
      var food = all.filter(function (t) { return t.cat === 'food'; }).length;
      var others = all.length - food;
      var self = this;
      var shown = all.filter(function (t) { return self.filter === 'all' || (self.filter === 'food' ? t.cat === 'food' : t.cat !== 'food'); });
      var target = inWix() ? '_top' : '_blank';
      var body;
      if (loading) body = '<div class="empty"><h3>Checking who is trading</h3><p>One moment while I load the traders booked for ' + esc(this.showName) + '.</p></div>';
      else if (!all.length) body = '<div class="empty"><h3>The first traders are on their way</h3><p>Food vans and stalls add themselves to my traders directory once they have booked a pitch, and I check every listing before it goes up. When I last checked, nobody had listed ' + esc(this.showName) + ' yet, so take a look again closer to the show. In the meantime, the food stalls on site are still worth a look when you arrive.</p></div>';
      else body = (food && others ? '<div class="chips" role="group" aria-label="Show traders by type">' +
          '<button type="button" class="chip" data-f="all" aria-pressed="' + (this.filter === 'all') + '">Everyone (' + all.length + ')</button>' +
          '<button type="button" class="chip" data-f="food" aria-pressed="' + (this.filter === 'food') + '">Food and drink (' + food + ')</button>' +
          '<button type="button" class="chip" data-f="other" aria-pressed="' + (this.filter === 'other') + '">Stalls and shops (' + others + ')</button></div>' : '') +
        '<div class="rail"><div class="grid" tabindex="0" aria-label="Traders, scroll sideways for more">' + shown.map(cardHTML).join('') + '</div>' +
        (shown.length > 1 ? '<div class="nav"><button type="button" class="prev" aria-label="Previous traders">\u2190</button><button type="button" class="next" aria-label="More traders">\u2192</button><span>Swipe or use the arrows to see more</span></div>' : '') + '</div>' +
        '<p class="note">Traders add their own details and I check them before they go live. Menus, prices and pitches can change on the day, so please see the stall itself if you have an allergy.</p>';

      this.root.innerHTML = '<style>' + CSS + '</style><section class="wrap" aria-label="Traders at ' + esc(this.showName) + '">' +
        (this.demo ? '<div class="demo">Layout check: these are example traders, not real bookings</div>' : '') +
        '<div class="side"><span class="tag">Food vans and stalls</span><h2>Traders at <em>this show</em></h2>' +
        (all.length || loading ? '<p>These are the food trailers and stalls who have told me they are booked for ' + esc(this.showName) + '. I would suggest having a look before you go, so you know where to head for a coffee or a proper lunch.</p>' : '<p>Once food trailers and stalls tell me they are booked for ' + esc(this.showName) + ', they will show up here, so you know where to head for a coffee or a proper lunch.</p>') +
        (loading || !all.length ? '' : '<div class="count"><b>' + all.length + '</b><span>' + (all.length === 1 ? 'trader listed' : 'traders listed') + '</span></div>') +
        '<a href="' + DIRECTORY + '" target="' + target + '">See every airshow trader <span>→</span></a><br>' +
        '<a class="red" href="' + DIRECTORY + '#list" target="' + target + '">Trading here? List your stall free <span>→</span></a></div>' +
        '<div class="main">' + body + '</div></section>';

      this.root.querySelectorAll('.chip').forEach(function (b) {
        b.addEventListener('click', function () { self.filter = b.getAttribute('data-f'); self.paint(list); });
      });
      var grid = this.root.querySelector('.grid'), prev = this.root.querySelector('.prev'), next = this.root.querySelector('.next');
      if (grid && prev) {
        var step = function () { var c = grid.querySelector('.card'); return c ? c.getBoundingClientRect().width + 14 : 300; };
        var sync = function () { prev.disabled = grid.scrollLeft < 4; next.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 4; };
        prev.addEventListener('click', function () { grid.scrollBy({ left: -step(), behavior: 'smooth' }); });
        next.addEventListener('click', function () { grid.scrollBy({ left: step(), behavior: 'smooth' }); });
        grid.addEventListener('scroll', sync, { passive: true }); setTimeout(sync, 60);
      }
      var cards = this.root.querySelectorAll('.card');
      if (!('IntersectionObserver' in window)) { cards.forEach(function (c) { c.classList.add('in'); }); return; }
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0 });
      cards.forEach(function (c, i) { c.style.transitionDelay = (Math.min(i, 5) * 70) + 'ms'; io.observe(c); setTimeout(function () { c.style.transitionDelay = ''; }, 900); });
    }
  }
  customElements.define('ukag-show-traders', ShowTraders);
})();
