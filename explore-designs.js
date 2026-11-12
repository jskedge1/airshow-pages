/* Three trial redesigns of the whole "Choose a topic" section on the show pages.
   The page still builds its topic buttons (#parkList) and fills the topic panel (#parkDetail) itself,
   so every topic, bus route button, train box, time and link is the page's own. This file only lays
   them out again. The bus route buttons (.br-box) and the train box (.tr-box) are never restyled.
   window.EXPLORE_DESIGN = 'line' (A, route line), 'board' (B, departure board) or 'stop' (C, bus stop). */
(function () {
  var DESIGN = window.EXPLORE_DESIGN || 'line';
  var EASE = 'cubic-bezier(.22,.61,.36,1)';

  var MODES = {
    'Park and Ride': { short: 'Park and Ride', colour: '#2BA84A', ink: '#fff' },
    'By train': { short: 'Train', colour: '#D74949', ink: '#fff' },
    'By bus': { short: 'Bus', colour: '#00A6E2', ink: '#06283D' },
    'By road': { short: 'Road', colour: '#F2B233', ink: '#13293C' },
    'By coach': { short: 'Coach', colour: '#C2255C', ink: '#fff' },
    'Access & taxis': { short: 'Taxi', colour: '#6950A1', ink: '#fff' },
    'Parking': { short: 'Parking', colour: '#2B5DA8', ink: '#fff' },
    'Fuel': { short: 'Fuel', colour: '#E8762B', ink: '#fff' },
    'Walking': { short: 'On foot', colour: '#32B4AF', ink: '#13293C' }
  };
  /* each show names its topics its own way (Show day parking, Taxis & buses, Fuel), so match them on key words */
  var WORDS = [
    ['By coach', /coach|national express|megabus/],
    ['By train', /train|station|rail/],
    ['By bus', /tram|bus|shuttle|247/],
    ['Access & taxis', /taxi|access|blue badge/],
    ['Walking', /walk|without a car|on foot|camping/],
    ['Fuel', /fuel|petrol/],
    ['Parking', /parking|car park|gate|entrance/],
    ['By road', /road|driv|sat ?nav|motorway|postcode|what3words|address|showground|promenade|seafront|beachy|live travel|main/]
  ];
  function canon(name) {
    var n = String(name || '').toLowerCase();
    if (MODES[name]) return name;
    if (/park ?(and|&|&amp;) ?ride/.test(n)) return 'Park and Ride';
    var best = 'By road', at = Infinity;
    WORDS.forEach(function (w) { var m = n.match(w[1]); if (m && m.index < at) { at = m.index; best = w[0]; } });
    return best;
  }
  function mode(name) { return MODES[canon(name)]; }

  var ICONS = {
    'Park and Ride': '<path d="M9 17V7h4a3 3 0 0 1 0 6H9" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>',
    'By train': '<rect x="5" y="3" width="14" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 10h14M8 20l2-4M16 20l-2-4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/>',
    'By bus': '<rect x="4" y="3" width="16" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 11h16M7 17v3M17 17v3" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/>',
    'By road': '<path d="M5 16l1.5-5A2 2 0 0 1 8.4 9.5h7.2a2 2 0 0 1 1.9 1.5L19 16v3H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="8" cy="16" r="1.2" fill="currentColor"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/>',
    'By coach': '<rect x="2" y="5" width="20" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 11h20M7 5v6M12 5v6M17 5v6" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="7" cy="18.5" r="1.8" fill="currentColor"/><circle cx="17" cy="18.5" r="1.8" fill="currentColor"/>',
    'Access & taxis': '<circle cx="12" cy="4.5" r="2" fill="currentColor"/><path d="M12 7v6h5l2 6M12 10h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9.5 10.5a5 5 0 1 0 6.8 6.6" fill="none" stroke="currentColor" stroke-width="2"/>',
    'Parking': '<rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>',
    'Fuel': '<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M7 8h6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    'Walking': '<circle cx="13" cy="4" r="2" fill="currentColor"/><path d="M10 21l2.5-7 2.5 3v4M9 12l2-5 4 2 2 3M11 7l-3 3v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[canon(name)] + '</svg>'; }
  /* a see-through version of a section colour, for faded boxes and hovers */
  function soft(hex, a) {
    var h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function tint(el, hex) {
    el.style.setProperty('--c', hex);
    el.style.setProperty('--cs', soft(hex, .14));
    el.style.setProperty('--cm', soft(hex, .28));
    el.style.setProperty('--cb', soft(hex, .6));
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* ---------- shared styles ---------- */
  var CSS_BASE =
    '#explore.xd-on{padding:0!important;background:none!important}' +
    '#explore .xd-hold{display:none}' +
    '.xd{font-family:Barlow;color:#13293C}' +
    '.xd *{box-sizing:border-box}' +
    '.xd h2,.xd h3{text-transform:none!important}' +
    '.xd button{font:inherit}' +
    '.xd .xd-wrap{max-width:1200px;margin:0 auto;padding:0 24px}' +
    '.xd .xd-head h2{margin:0;font-family:Barlow;font-weight:700;font-size:clamp(34px,5vw,50px);line-height:1;letter-spacing:.005em}' +
    '.xd .xd-head p{margin:12px 0 0;max-width:60ch;font-size:17px;line-height:1.55;font-weight:500}' +
    '.xd .xd-note{font-size:15px;line-height:1.5;font-weight:500}' +
    /* topic content */
    '.xd .detail{background:none!important;color:inherit!important;padding:0!important;opacity:1}' +
    '.xd .detail.out{opacity:.2}' +
    '.xd .xd-title h3{margin:0;font-family:Barlow;font-weight:700;font-size:clamp(30px,4vw,40px);line-height:1.05;color:#13293C}' +
    '.xd .xd-title .lead{margin:12px 0 0;font-size:18px;line-height:1.6;color:#3E4045;max-width:none}' +
    '.xd .on-map{background:#EAF6FC;color:#13293C;margin-top:16px}' +
    '.xd .xd-keep{margin-top:18px;display:grid;gap:10px}' +
    '.xd .xd-keep:empty{display:none}' +
    '.xd .route li{background:#F1F4F6}' +
    '.xd .route .r-n{background:#DDE5EB;color:#13293C}' +
    '.xd .route li.r-bus .r-n{background:#32B4AF;color:#0B1A27}' +
    '.xd .route li.r-stop .r-n{background:#00A6E2;color:#0B1A27}' +
    '.xd .route li.r-coach .r-n{background:#C2255C;color:#fff}' +
    '.xd .route b{color:#13293C}' +
    '.xd .route p{color:#3E4045}' +
    '.xd .route .r-links a{color:#13293C;background:#fff;box-shadow:inset 0 0 0 1.5px #13293C}' +
    '.xd .areas div{background:#F1F4F6;color:#13293C}' +
    '.xd .areas div b{color:#13293C}' +
    '.xd .cols > div{background:#F1F4F6}' +
    '.xd .cols p{color:#3E4045}' +
    '.xd .d-warn{background:#FDECEC;color:#13293C}' +
    '.xd .detail-meta span{background:#F1F4F6}' +
    '.xd .detail-meta b{color:#13293C}' +
    '.xd .btn.ghost{color:#13293C;border-color:#13293C}' +
    '.xd .btn.ghost:hover{background:#13293C;color:#fff}' +
    '.xd .xd-step{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;margin-top:22px;padding-top:16px;border-top:2px solid #E1E9EF}' +
    '.xd .xd-step span{font-weight:500;color:#41586B}' +
    '.xd .xd-step span b{color:#13293C}' +
    '.xd .xd-step div{display:flex;gap:8px}' +
    '.xd .xd-step button{all:unset;cursor:pointer;font-weight:700;font-size:15px;padding:9px 16px;border:2px solid #13293C;color:#13293C;transition:background .25s ' + EASE + ',color .25s ' + EASE + '}' +
    '.xd .xd-step button:hover{background:#13293C;color:#fff}' +
    '.xd .xd-step button[disabled]{opacity:.35;cursor:default;background:none;color:#13293C}' +
    '.xd button:focus-visible,.xd a:focus-visible{outline:3px solid #D74949;outline-offset:2px}' +
    '.xd .mapbox{margin:0;background:#fff}' +
    '.xd .mapbox iframe{height:360px}' +
    '.xd .mapbox .map-head h3{text-transform:none}' +
    '.xd .mapbox .map-note{color:#41586B;background:#fff;margin:0;padding:12px 18px 16px}' +
    '@media(prefers-reduced-motion:reduce){.xd *{transition:none!important;animation:none!important}}';

  /* ---------- A: route line (transport map) ---------- */
  var CSS_LINE =
    '.xd-line{background:#fff}' +
    '.xd-line .xd-top{background:#13293C;color:#fff;padding:54px 0 0}' +
    '.xd-line .xd-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px 48px;align-items:end}' +
    '.xd-line .xd-head p{color:#C9DCEA}' +
    '.xd-line .xd-map-key{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0;margin-top:36px;background:#0B1A27}' +
    '.xd-line .xd-grp{padding:18px 18px 22px;border-right:1px solid #1C3850}' +
    '.xd-line .xd-grp:last-child{border-right:0}' +
    '.xd-line .xd-grp-h{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;color:#fff;margin-bottom:14px}' +
    '.xd-line .xd-roundel{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:var(--c);color:var(--i);flex:none}' +
    '.xd-line .xd-roundel svg{width:22px;height:22px}' +
    '.xd-line .xd-stops{list-style:none;margin:0;padding:0 0 0 18px;position:relative}' +
    '.xd-line .xd-stops:before{content:"";position:absolute;left:8px;top:8px;bottom:8px;width:5px;background:var(--c);border-radius:3px}' +
    '.xd-line .xd-stops li{position:relative;margin:0 0 6px}' +
    '.xd-line .xd-stop{all:unset;box-sizing:border-box;cursor:pointer;display:block;width:100%;padding:8px 10px 8px 22px;position:relative;color:#E8F1F6;transition:background .25s ' + EASE + '}' +
    '.xd-line .xd-stop:before{content:"";position:absolute;left:-15px;top:13px;width:13px;height:13px;border-radius:50%;background:#0B1A27;border:3px solid var(--c);transition:transform .25s ' + EASE + '}' +
    '.xd-line .xd-stop b{display:block;font-weight:700;font-size:16px;line-height:1.25}' +
    '.xd-line .xd-stop small{display:block;font-weight:500;font-size:14px;color:#9FB8CB;margin-top:2px}' +
    '.xd-line .xd-stop:hover{background:#13293C}' +
    '.xd-line .xd-stop[aria-current="true"]{background:#fff;color:#13293C}' +
    '.xd-line .xd-stop[aria-current="true"] small{color:#41586B}' +
    '.xd-line .xd-stop[aria-current="true"]:before{background:var(--c);transform:scale(1.25)}' +
    '.xd-line .xd-body{display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);gap:36px;padding:40px 0 70px}' +
    '.xd-line .xd-main{min-width:0}' +
    '.xd-line .xd-sec{margin-top:28px}' +
    '.xd-line .xd-sec > h4{margin:0 0 12px;padding:10px 16px;background:#13293C;color:#fff;font-weight:700;font-size:18px;border-left:6px solid var(--c,#32B4AF)}' +
    '.xd-line .xd-side{position:sticky;top:76px;align-self:start;display:grid;gap:16px}' +
    '.xd-line .xd-good{background:#EAF6FC;padding:18px 18px 4px;border-top:5px solid #00A6E2}' +
    '.xd-line .xd-good h4{margin:0 0 10px;font-weight:700;font-size:18px}' +
    '@media(max-width:1060px){.xd-line .xd-map-key{grid-template-columns:repeat(2,minmax(0,1fr))}.xd-line .xd-grp{border-bottom:1px solid #1C3850}}' +
    '@media(max-width:900px){.xd-line .xd-head{grid-template-columns:1fr}.xd-line .xd-body{grid-template-columns:minmax(0,1fr)}.xd-line .xd-side{position:static}}' +
    '@media(max-width:640px){.xd-line .xd-map-key{grid-template-columns:minmax(0,1fr)}.xd-line .xd-top{padding-top:36px}.xd .xd-wrap{padding:0 16px}}';

  /* ---------- B: departure board ---------- */
  var CSS_BOARD =
    '.xd-board{background:#13293C;color:#fff;padding:56px 0 70px}' +
    '.xd-board .xd-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:12px 40px;margin-bottom:28px}' +
    '.xd-board .xd-head p{color:#C9DCEA}' +
    '.xd-board .xd-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:24px;align-items:start}' +
    '.xd-board .xd-dep{background:#050607;border:6px solid #1C2430;position:sticky;top:76px}' +
    '.xd-board .xd-dep-h{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#0B1A27;border-bottom:3px solid #F2B233}' +
    '.xd-board .xd-dep-h b{font-family:Barlow;font-weight:700;font-size:24px;color:#F2B233;letter-spacing:.02em;text-shadow:0 0 10px rgba(242,178,51,.45)}' +
    '.xd-board .xd-clock{font-family:Barlow;font-weight:700;font-size:24px;color:#F2B233;font-variant-numeric:tabular-nums}' +
    '.xd-board .xd-row{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center;padding:12px 16px;border-bottom:1px solid #1A1F26;transition:background .25s ' + EASE + '}' +
    '.xd-board .xd-badge{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:var(--c);color:var(--i)}' +
    '.xd-board .xd-badge svg{width:22px;height:22px}' +
    '.xd-board .xd-row b{display:block;font-family:Barlow;font-weight:700;font-size:21px;color:#F2B233;letter-spacing:.02em}' +
    '.xd-board .xd-row small{display:block;font-weight:500;font-size:14px;color:#B9C4CE}' +
    '.xd-board .xd-plat{font-weight:700;font-size:14px;color:#fff;background:#1C2430;padding:4px 10px}' +
    '.xd-board .xd-row:hover{background:#111820}' +
    '.xd-board .xd-row[aria-current="true"]{background:#F2B233}' +
    '.xd-board .xd-row[aria-current="true"] b{color:#050607;text-shadow:none}' +
    '.xd-board .xd-row[aria-current="true"] small{color:#13293C}' +
    '.xd-board .xd-row[aria-current="true"] .xd-plat{background:#050607;color:#F2B233}' +
    '.xd-board .xd-card{background:#fff;color:#13293C;padding:30px 32px;border-top:6px solid var(--c,#F2B233)}' +
    '.xd-board .xd-tabs{display:flex;gap:4px;margin-top:26px;border-bottom:3px solid #13293C;overflow-x:auto;scrollbar-width:none}' +
    '.xd-board .xd-tabs::-webkit-scrollbar{display:none}' +
    '.xd-board .xd-tabs button{all:unset;cursor:pointer;flex:none;padding:11px 16px;background:#F1F4F6;font-weight:700;font-size:16px;color:#13293C;box-shadow:inset 0 -4px 0 transparent;transition:background .25s ' + EASE + '}' +
    '.xd-board .xd-tabs button:hover{background:#E3EAEF}' +
    '.xd-board .xd-tabs button[aria-selected="true"]{background:#13293C;color:#fff;box-shadow:inset 0 -4px 0 var(--c,#F2B233)}' +
    '.xd-board .xd-pane{padding-top:20px}' +
    '.xd-board .xd-pane[hidden]{display:none}' +
    '.xd-board .xd-mapcard{margin-top:24px;border-top:6px solid #00A6E2}' +
    '@media(max-width:980px){.xd-board .xd-grid{grid-template-columns:minmax(0,1fr)}.xd-board .xd-dep{position:static}}' +
    '@media(max-width:640px){.xd-board{padding:36px 0 50px}.xd-board .xd-card{padding:22px 18px}.xd .xd-wrap{padding:0 14px}}';

  /* ---------- C: bus stop ---------- */
  var CSS_STOP =
    '.xd-stopd{background:#F1F4F6}' +
    '.xd-stopd .xd-top{background:#00A6E2;color:#06283D;padding:50px 0 120px}' +
    '.xd-stopd .xd-head h2{color:#06283D}' +
    '.xd-stopd .xd-head p{color:#06283D}' +
    '.xd-stopd .xd-flags{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-top:-92px}' +
    '.xd-stopd .xd-flag{all:unset;box-sizing:border-box;cursor:pointer;background:#fff;border-radius:14px 14px 0 0;padding:18px 14px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;box-shadow:0 10px 24px rgba(6,40,61,.14);border-bottom:8px solid #13293C;transition:transform .25s ' + EASE + ',background .25s ' + EASE + '}' +
    '.xd-stopd .xd-flag:hover{transform:translateY(-3px)}' +
    '.xd-stopd .xd-ring{position:relative;width:64px;height:64px;border-radius:50%;border:9px solid var(--c);display:flex;align-items:center;justify-content:center;color:#13293C}' +
    '.xd-stopd .xd-ring svg{width:26px;height:26px;position:relative;z-index:1;background:#fff}' +
    '.xd-stopd .xd-flag b{font-weight:700;font-size:18px;text-align:center}' +
    '.xd-stopd .xd-flag small{font-weight:500;font-size:14px;color:#41586B}' +
    '.xd-stopd .xd-flag[aria-selected="true"]{background:#13293C;color:#fff;border-bottom-color:var(--c)}' +
    '.xd-stopd .xd-flag[aria-selected="true"] small{color:#C9DCEA}' +
    '.xd-stopd .xd-flag[aria-selected="true"] .xd-ring{color:#fff}' +
    '.xd-stopd .xd-flag[aria-selected="true"] .xd-ring svg{background:#13293C}' +
    '.xd-stopd .xd-blinds{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 0}' +
    '.xd-stopd .xd-blind{all:unset;box-sizing:border-box;cursor:pointer;background:#050607;color:#F2B233;padding:12px 18px;min-width:220px;border-left:6px solid var(--c);transition:background .25s ' + EASE + '}' +
    '.xd-stopd .xd-blind b{display:block;font-family:Barlow;font-weight:700;font-size:21px;letter-spacing:.02em;text-shadow:0 0 8px rgba(242,178,51,.4)}' +
    '.xd-stopd .xd-blind small{display:block;font-weight:500;font-size:14px;color:#C9D8E2}' +
    '.xd-stopd .xd-blind:hover{background:#13293C}' +
    '.xd-stopd .xd-blind[aria-current="true"]{background:#F2B233;color:#050607}' +
    '.xd-stopd .xd-blind[aria-current="true"] b{text-shadow:none}' +
    '.xd-stopd .xd-blind[aria-current="true"] small{color:#13293C}' +
    '.xd-stopd .xd-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:24px;padding:28px 0 70px;align-items:start}' +
    '.xd-stopd .xd-card{background:#fff;padding:30px 32px;border-top:6px solid var(--c,#00A6E2)}' +
    '.xd-stopd details.xd-acc{margin-top:10px;background:#fff;border:2px solid #DCE5EB}' +
    '.xd-stopd details.xd-acc > summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#13293C;color:#fff;font-weight:700;font-size:18px}' +
    '.xd-stopd details.xd-acc > summary::-webkit-details-marker{display:none}' +
    '.xd-stopd details.xd-acc > summary:after{content:"+";font-size:24px;line-height:1;color:#00A6E2}' +
    '.xd-stopd details.xd-acc[open] > summary:after{content:"\\2212"}' +
    '.xd-stopd details.xd-acc > div{padding:18px}' +
    '.xd-stopd .xd-side{position:sticky;top:76px;display:grid;gap:14px}' +
    '.xd-stopd .xd-side .mapbox{border-top:6px solid #00A6E2}' +
    '@media(max-width:1000px){.xd-stopd .xd-flags{grid-template-columns:repeat(3,minmax(0,1fr))}.xd-stopd .xd-body{grid-template-columns:minmax(0,1fr)}.xd-stopd .xd-side{position:static}}' +
    '@media(max-width:640px){.xd-stopd .xd-flags{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.xd-stopd .xd-flag{padding:14px 10px}.xd-stopd .xd-ring{width:52px;height:52px;border-width:7px}.xd-stopd .xd-blind{min-width:0;flex:1 1 100%}.xd-stopd .xd-card{padding:22px 18px}.xd .xd-wrap{padding:0 14px}}';


  /* ---------- A + C merged: bus stop flags, then the chosen way in as a route line ---------- */
  var CSS_MIX =
    '.xd-mix{background:#F1F4F6}' +
    '.xd-mix .xd-top{background:#00A6E2;color:#06283D;padding:50px 0 120px}' +
    '.xd-mix .xd-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px 48px;align-items:end}' +
    '.xd-mix .xd-head h2,.xd-mix .xd-head p{color:#06283D}' +
    '.xd-mix .xd-flags{display:grid;grid-template-columns:repeat(var(--n,5),minmax(0,1fr));gap:14px;margin-top:-92px}' +
    '.xd-mix .xd-flag{all:unset;box-sizing:border-box;cursor:pointer;background:#fff;border-radius:14px 14px 0 0;padding:18px 14px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;box-shadow:0 10px 24px rgba(6,40,61,.14);border-bottom:8px solid #13293C;transition:transform .25s ' + EASE + ',background .25s ' + EASE + '}' +
    '.xd-mix .xd-flag:hover{transform:translateY(-3px)}' +
    '.xd-mix .xd-ring{width:64px;height:64px;border-radius:50%;border:9px solid var(--c);display:flex;align-items:center;justify-content:center;color:#13293C}' +
    '.xd-mix .xd-ring svg{width:26px;height:26px}' +
    '.xd-mix .xd-flag b{font-weight:700;font-size:18px;text-align:center}' +
    '.xd-mix .xd-flag small{font-weight:500;font-size:14px;color:#41586B}' +
    '.xd-mix .xd-flag[aria-selected="true"]{background:#13293C;color:#fff;border-bottom-color:var(--c)}' +
    '.xd-mix .xd-flag[aria-selected="true"] small{color:#C9DCEA}' +
    '.xd-mix .xd-flag[aria-selected="true"] .xd-ring{color:#fff}' +
    /* the route line for the chosen way in */
    '.xd-mix .xd-line-box{margin-top:18px;background:#13293C;padding:22px 28px 26px;border-left:8px solid var(--c)}' +
    '.xd-mix .xd-line-h{display:flex;align-items:center;gap:12px;color:#fff;font-weight:700;font-size:18px;margin-bottom:18px}' +
    '.xd-mix .xd-line-h .xd-roundel{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:var(--c);color:var(--i)}' +
    '.xd-mix .xd-line-h .xd-roundel svg{width:20px;height:20px}' +
    '.xd-mix .xd-hline{list-style:none;margin:0;padding:0;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);position:relative}' +
    '.xd-mix .xd-hline:before{content:"";position:absolute;left:0;right:0;top:9px;height:6px;border-radius:3px;background:var(--c)}' +
    '.xd-mix .xd-hline li{position:relative;padding-top:30px}' +
    '.xd-mix .xd-hstop{all:unset;box-sizing:border-box;cursor:pointer;display:block;padding:10px 14px 12px;margin-right:10px;color:#E8F1F6;transition:background .25s ' + EASE + '}' +
    '.xd-mix .xd-hstop:before{content:"";position:absolute;left:14px;top:2px;width:16px;height:16px;border-radius:50%;background:#13293C;border:4px solid var(--c);transition:transform .25s ' + EASE + '}' +
    '.xd-mix .xd-hstop b{display:block;font-weight:700;font-size:17px;line-height:1.25}' +
    '.xd-mix .xd-hstop small{display:block;font-weight:500;font-size:14px;color:#9FB8CB;margin-top:3px}' +
    '.xd-mix .xd-hstop:hover{background:#1C3850}' +
    '.xd-mix .xd-hstop[aria-current="true"]{background:#fff;color:#13293C}' +
    '.xd-mix .xd-hstop[aria-current="true"] small{color:#41586B}' +
    '.xd-mix .xd-hstop[aria-current="true"]:before{background:var(--c);transform:scale(1.3)}' +
    /* topic and side column, as in A */
    '.xd-mix .xd-body{display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);gap:28px;padding:28px 0 70px;align-items:start}' +
    '.xd-mix .xd-card{background:#fff;padding:30px 32px;border-top:6px solid var(--c,#00A6E2)}' +
    '.xd-mix .xd-sec{margin-top:28px}' +
    '.xd-mix .xd-sec > h4{margin:0 0 12px;padding:10px 16px;background:#13293C;color:#fff;font-weight:700;font-size:18px;border-left:6px solid var(--c,#32B4AF)}' +
    '.xd-mix .xd-side{position:sticky;top:76px;display:grid;gap:16px}' +
    '.xd-mix .xd-side .mapbox{border-top:6px solid #00A6E2}' +
    '.xd-mix .xd-good{background:#EAF6FC;padding:18px 18px 4px;border-top:5px solid #00A6E2}' +
    '.xd-mix .xd-good h4{margin:0 0 10px;font-weight:700;font-size:18px}' +

    /* stops: clear boxes in a faded colour of the way in, so they look clickable */
    '.xd-mix .xd-hstop{background:var(--cs);box-shadow:inset 0 0 0 2px var(--cb);margin-right:12px;padding:12px 40px 14px 16px;position:relative}' +
    '.xd-mix .xd-hstop:after{content:"\\2192";position:absolute;right:14px;top:50%;transform:translateY(-50%);font-weight:700;color:var(--c);transition:transform .25s ' + EASE + '}' +
    '.xd-mix .xd-hstop:hover{background:var(--cm);transform:translateY(-2px)}' +
    '.xd-mix .xd-hstop:hover:after{transform:translate(4px,-50%)}' +
    '.xd-mix .xd-hstop[aria-current="true"]{background:#fff;box-shadow:inset 0 0 0 2px var(--c),0 6px 18px rgba(0,0,0,.25)}' +
    '.xd-mix .xd-hstop[aria-current="true"]:after{content:"\\2713"}' +
    '.xd-mix .xd-hstop{transition:background .25s ' + EASE + ',transform .25s ' + EASE + ',box-shadow .25s ' + EASE + '}' +
    '.xd-mix .xd-hstop:before{top:-27px}' +
    '.xd-mix .xd-hstop{width:calc(100% - 12px);min-height:100%}' +
    '@media(max-width:640px){.xd-mix .xd-hstop{width:100%;min-height:0}}' +
    '.xd-mix .mapbox .mapbar span{flex:1 1 auto}' +
    '.xd-mix .mapbox .mapbar a{margin-left:auto}' +
    /* the topic card: colour, hovers and a gentle entrance, still clean */
    '@keyframes xdIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
    '@keyframes xdBar{from{width:0}to{width:96px}}' +
    '.xd-mix .xd-content > *{animation:xdIn .45s ' + EASE + ' both}' +
    '.xd-mix .xd-content > *:nth-child(2){animation-delay:.06s}.xd-mix .xd-content > *:nth-child(3){animation-delay:.12s}.xd-mix .xd-content > *:nth-child(4){animation-delay:.18s}.xd-mix .xd-content > *:nth-child(n+5){animation-delay:.24s}' +
    '.xd-mix .xd-card{background:linear-gradient(180deg,var(--cs) 0,#fff 220px)}' +
    '.xd-mix .xd-title h3:after{content:"";display:block;height:6px;width:96px;margin-top:12px;background:var(--c);border-radius:3px;animation:xdBar .6s ' + EASE + ' both}' +
    '.xd-mix .on-map{background:var(--cs);box-shadow:inset 4px 0 0 var(--c)}' +
    '.xd-mix .xd-sec > h4{background:linear-gradient(90deg,#13293C 0,#13293C 70%,var(--cb) 100%)}' +
    '.xd-mix .route li{background:#fff;box-shadow:inset 0 0 0 2px #E6ECF0;transition:transform .25s ' + EASE + ',box-shadow .25s ' + EASE + '}' +
    '.xd-mix .route li:hover{transform:translateX(4px);box-shadow:inset 0 0 0 2px var(--cb),0 8px 18px rgba(19,41,60,.08)}' +
    '.xd-mix .route .r-n{background:var(--cs);color:#13293C}' +
    '.xd-mix .route li:hover .r-n{background:var(--c);color:#fff}' +
    '.xd-mix .areas div{background:#fff;box-shadow:inset 0 0 0 2px #E6ECF0;transition:background .2s ' + EASE + ',box-shadow .2s ' + EASE + '}' +
    '.xd-mix .areas div:hover{background:var(--cs);box-shadow:inset 4px 0 0 var(--c)}' +
    '.xd-mix .cols > div{background:#fff;box-shadow:inset 0 4px 0 var(--c),inset 0 0 0 2px #E6ECF0;transition:transform .25s ' + EASE + '}' +
    '.xd-mix .cols > div:hover{transform:translateY(-3px)}' +
    '.xd-mix .detail-meta span{background:var(--cs)}' +
    '.xd-mix .xd-step button{border-color:var(--c,#13293C)}' +
    '.xd-mix .xd-step button:hover{background:var(--c,#13293C);color:#fff}' +
    /* map bar as a transport tab */
    '.xd-mix .mapbox .mapbar{display:flex;flex-wrap:wrap;align-items:stretch;justify-content:space-between;gap:0;padding:0;background:#13293C;color:#fff}' +
    '.xd-mix .mapbox .mapbar span{display:flex;align-items:center;gap:10px;padding:12px 16px;font-weight:500;font-size:15px;color:#E8F1F6}' +
    '.xd-mix .mapbox .mapbar span:before{content:"";flex:none;width:14px;height:14px;border-radius:50%;border:4px solid #00A6E2;background:#fff}' +
    '.xd-mix .mapbox .mapbar a{display:flex;align-items:center;gap:8px;padding:12px 26px 12px 18px;background:#00A6E2;color:#06283D!important;font-weight:700;font-size:15px;text-decoration:none!important;clip-path:polygon(12px 0,100% 0,100% 100%,12px 100%,0 50%);transition:background .25s ' + EASE + ',padding .25s ' + EASE + '}' +
    '.xd-mix .mapbox .mapbar a:hover{background:#F2B233;padding-left:24px}' +
    '@media(prefers-reduced-motion:reduce){.xd-mix .xd-content > *,.xd-mix .xd-title h3:after{animation:none}}' +

    /* more transport touches: a destination blind over the topic, the journey drawn as a route, a bus lane */
    '.xd-mix .xd-blindbar{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 16px;background:#050607;color:#F2B233;padding:10px 16px;margin:-30px -32px 24px;border-bottom:4px solid var(--c)}' +
    '.xd-mix .xd-blindbar b{font-family:Barlow;font-weight:700;font-size:22px;letter-spacing:.03em;text-shadow:0 0 8px rgba(242,178,51,.45)}' +
    '.xd-mix .xd-blindbar span{font-weight:700;font-size:14px;color:#050607;background:var(--c);padding:4px 10px}' +
    '.xd-mix .route{position:relative}' +
    '.xd-mix .route:before{content:"";position:absolute;left:26px;top:20px;bottom:20px;width:5px;border-radius:3px;background:var(--cb)}' +
    '.xd-mix .route li{position:relative;grid-template-columns:58px 1fr;background:transparent!important;box-shadow:none!important;margin-bottom:10px}' +
    '.xd-mix .route li:hover{transform:none}' +
    '.xd-mix .route .r-n{position:relative;z-index:1;align-self:start;width:42px;height:42px;margin:12px 0 0 8px;border-radius:50%;border:5px solid var(--c);background:#fff!important;color:#13293C!important;font-size:18px;transition:background .25s ' + EASE + ',color .25s ' + EASE + ',transform .25s ' + EASE + '}' +
    '.xd-mix .route li > div{background:#fff;box-shadow:inset 0 0 0 2px #E6ECF0;padding:12px 16px;transition:box-shadow .25s ' + EASE + ',transform .25s ' + EASE + '}' +
    '.xd-mix .route li:hover > div{transform:translateX(4px);box-shadow:inset 0 0 0 2px var(--cb),0 8px 18px rgba(19,41,60,.08)}' +
    '.xd-mix .route li:hover .r-n{background:var(--c)!important;color:#fff!important;transform:scale(1.08)}' +
    '.xd-mix .xd-lane{position:relative;height:44px;margin-top:14px;background:#2E3338;overflow:hidden;border-top:3px solid #F2B233;border-bottom:3px solid #F2B233}' +
    '.xd-mix .xd-lane:before{content:"";position:absolute;left:0;right:0;top:50%;height:4px;margin-top:-2px;background:repeating-linear-gradient(90deg,#fff 0 34px,transparent 34px 64px)}' +
    '.xd-mix .xd-lane span{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-family:Barlow;font-weight:700;font-size:16px;letter-spacing:.2em;color:#fff;background:#2E3338;padding:0 10px}' +
    '@keyframes xdDrive{from{transform:translate(-120px,-50%)}to{transform:translate(1300px,-50%)}}' +
    '.xd-mix .xd-lane svg{position:absolute;left:0;top:50%;width:84px;height:30px;animation:xdDrive 22s linear infinite}' +
    '@media(prefers-reduced-motion:reduce){.xd-mix .xd-lane svg{animation:none;transform:translate(120px,-50%)}}' +
    '@media(max-width:640px){.xd-mix .xd-blindbar{margin:-22px -18px 20px}}' +
    /* the page's main sections: stops on one route line, with a gap between each */
    'main > .panel.sec{position:relative;margin-top:12px}' +
    'main > .panel.sec:before{content:"";position:absolute;z-index:2;top:-12px;height:12px;width:6px;left:calc(max(0px,(100% - 1200px) / 2) + 42px);background:#32B4AF}' +
    'main > .panel.sec:first-of-type:before{display:none}' +
    '.sec-bar{box-shadow:inset 0 -5px 0 var(--sl,#32B4AF)}' +
    '.sec-toggle .st-stop{flex:0 0 42px;height:42px;border-radius:50%;background:#fff;border:6px solid var(--sl,#32B4AF);display:flex;align-items:center;justify-content:center;font:700 16px/1 Barlow;color:#13293C;transition:background .3s ' + EASE + ',color .3s ' + EASE + ',transform .3s ' + EASE + '}' +
    '.sec-toggle:hover .st-stop{transform:scale(1.08)}' +
    '.sec-toggle[aria-expanded="true"] .st-stop{background:var(--sl,#32B4AF);color:#fff}' +
    '.sec-toggle .st-s{color:#9FD8F2!important}' +
    /* the other show pages build their section bars two other ways, so bring both in line with Clacton */
    '.sec-bar,.sec-bar.is-open{border-left:0!important;background:var(--navy)!important}' +
    '.sec-bar:hover,.sec-bar.is-open:hover{background:var(--navy-2)!important}' +
    '.sec-toggle .st-icon{display:none!important}' +
    '.sec-toggle .st-btn{background:none!important;padding:0!important;height:auto!important;gap:0!important}' +
    '.sec-toggle .st-btn span,#secCount{display:none!important}' +
    '.sec-toggle .st-btn i{width:44px!important;height:44px!important;flex:0 0 44px!important;border-radius:50%;background:var(--teal)!important;transition:background .3s ' + EASE + '}' +
    '.sec-toggle[aria-expanded="true"] .st-btn i{background:var(--purple)!important}' +
    '.folds{gap:12px!important;padding:12px 0!important;background:transparent!important}' +
    '.folds > section.fold{position:relative}' +
    '.folds > section.fold + section.fold:before{content:"";position:absolute;z-index:2;top:-12px;height:12px;width:6px;left:calc(max(0px,(100% - 1200px) / 2) + 42px);background:#32B4AF}' +
    '.fold-btn,.fold.open .fold-btn{background:var(--navy)!important;box-shadow:inset 0 -5px 0 var(--sl,#32B4AF)!important}' +
    '.fold-btn:hover,.fold.open .fold-btn:hover{background:var(--navy-2)!important}' +
    '.fold-btn .fold-ic{display:none!important}' +
    '.fold-btn .wrap{grid-template-columns:auto minmax(0,1fr) auto!important;gap:20px!important;padding-top:22px!important;padding-bottom:22px!important}' +
    '.fold-btn .st-stop{flex:0 0 42px;width:42px;height:42px;box-sizing:border-box;border-radius:50%;background:#fff;border:6px solid var(--sl,#32B4AF);display:flex;align-items:center;justify-content:center;font:700 16px/1 Barlow;color:#13293C;transition:background .3s ' + EASE + ',color .3s ' + EASE + ',transform .3s ' + EASE + '}' +
    '.fold-btn:hover .st-stop{transform:scale(1.08)}' +
    '.fold.open .fold-btn .st-stop{background:var(--sl,#32B4AF);color:#fff}' +
    '.fold .fold-btn .fold-t{font:700 clamp(24px,3vw,34px)/1.05 Barlow!important;text-transform:uppercase!important;letter-spacing:.01em!important}' +
    '.fold-d{color:#9FD8F2!important}' +
    '.fold-x span{display:none!important}' +
    '.fold-x i{width:44px!important;height:44px!important;flex:0 0 44px!important;border-radius:50%;background:var(--teal)!important;transition:background .3s ' + EASE + '}' +
    '.fold-x i::before,.fold-x i::after{background:#fff!important;width:18px!important;height:2.5px!important}' +
    '.fold.open .fold-x i{background:var(--purple)!important}' +
    '.fold-bar{background:transparent!important}' +
    '.fold-bar .wrap{justify-content:flex-end!important;padding-top:14px!important;padding-bottom:14px!important}' +
    '.fold-bar p{display:none!important}' +
    '.fold-bar button{border:0!important;background:var(--mist)!important;color:var(--navy)!important;padding:9px 14px!important;font:700 15px/20px Barlow!important}' +
    '.fold-bar button:hover{background:var(--teal-wash)!important}' +
    '@media(max-width:640px){.fold-btn .wrap{gap:12px!important;padding-top:18px!important;padding-bottom:18px!important}.fold-btn .st-stop{flex-basis:36px;width:36px;height:36px;border-width:5px;font-size:14px}.fold-x i,.sec-toggle .st-btn i{width:38px!important;height:38px!important;flex-basis:38px!important}.fold-x i::before,.fold-x i::after,.sec-toggle .st-btn i::before,.sec-toggle .st-btn i::after{width:16px!important}.sec-toggle .st-btn i::before,.sec-toggle .st-btn i::after{left:11px!important;top:18px!important}.folds > section.fold + section.fold:before{left:31px}}' +

    /* stops in a clean rail style: white service cards on a line diagram, with interchange style circles */
    '.xd-mix .xd-hline:before{height:8px;top:8px;border-radius:0}' +
    '.xd-mix .xd-hstop:before{width:18px;height:18px;top:-28px;background:#fff;border:5px solid #13293C;box-shadow:0 0 0 3px var(--c)}' +
    '.xd-mix .xd-hstop{background:#fff!important;color:#13293C;box-shadow:none!important;border-top:0;border-left:8px solid var(--c);border-radius:4px;padding:14px 86px 14px 16px;min-height:86px}' +
    '.xd-mix .xd-hstop b{font-family:Barlow;font-weight:700;font-size:18px;letter-spacing:0;color:#13293C;text-shadow:none}' +
    '.xd-mix .xd-hstop small{color:#4B5A66!important;font-size:14px}' +
    '.xd-mix .xd-hstop .xd-sl{position:absolute;right:12px;top:12px;width:auto;height:auto;border:0;border-radius:4px;background:#13293C;color:#fff;font-weight:700;font-size:12px;padding:3px 8px;white-space:nowrap}' +
    '.xd-mix .xd-hstop:after{content:"\\203A";right:12px;top:auto;bottom:10px;transform:none;width:26px;height:26px;border-radius:50%;background:#EEF2F5;color:#13293C;display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;font-weight:700}' +
    '.xd-mix .xd-hstop:hover{background:#F4F7F9!important;transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.22)!important}' +
    '.xd-mix .xd-hstop:hover:after{background:var(--c);color:#fff;transform:translateX(2px)}' +
    '.xd-mix .xd-hstop[aria-current="true"]{background:#fff!important;box-shadow:0 0 0 3px var(--c),0 10px 24px rgba(0,0,0,.28)!important}' +
    '.xd-mix .xd-hstop[aria-current="true"]:before{background:var(--c);border-color:#fff;box-shadow:0 0 0 3px #13293C;transform:scale(1.15)}' +
    '.xd-mix .xd-hstop[aria-current="true"] .xd-sl{background:var(--c);color:#fff}' +
    '.xd-mix .xd-hstop[aria-current="true"]:after{content:"\\2713";background:var(--c);color:#fff;font-size:15px}' +
    '.xd-mix .xd-hstop[aria-current="true"] b{color:#13293C}' +
    '@media(max-width:640px){.xd-mix .xd-hstop:before{top:22px;left:-33px}}' +
    /* every white link button on the page takes the Useful links look: navy, then sky blue on hover with a slide */
    '.back-top a,.stay-list a,.lu-jump a,.xd .btns .btn.ghost,.xd .route .r-links a{background:#13293C!important;color:#fff!important;border:0!important;box-shadow:none!important;text-decoration:none!important;transition:background .3s ' + EASE + ',color .3s ' + EASE + ',padding .35s ' + EASE + '!important}' +
    '.back-top a:hover,.stay-list a:hover,.lu-jump a:hover,.xd .btns .btn.ghost:hover,.xd .route .r-links a:hover{background:#00A6E2!important;color:#0B1A27!important;padding-left:22px!important}' +
    '.lu-jump a span,.lu-jump a b{color:inherit!important}' +

    /* departures board for the train and bus times */
    '.xd-jt{margin-top:6px}' +
    '.xd-jp{padding-top:18px}' +
    '.xd-jh{margin:26px 0 4px;font-family:Barlow;font-weight:700;font-size:19px;color:#13293C}' +
    '.xd-jt .xd-jp[hidden]{display:none}' +
    '.xd-tt{display:grid;gap:0}' +
    '.xd-tt-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:8px;margin:0 0 18px}' +
    '.xd-tt-link{display:flex;align-items:center;gap:12px;padding:12px 14px;background:#13293C;color:#fff!important;text-decoration:none!important;border-left:6px solid var(--c);border-radius:4px;transition:background .3s ' + EASE + ',padding .35s ' + EASE + '}' +
    '.xd-tt-link b{display:block;font-weight:700;font-size:16px}' +
    '.xd-tt-link small{display:block;font-weight:500;font-size:14px;color:#C9DCEA}' +
    '.xd-tt-link:hover{background:#00A6E2;color:#0B1A27!important;padding-left:20px}' +
    '.xd-tt-link:hover small{color:#0B1A27}' +
    /* clean journey planner style tabs and results */
    '.xd-tt-tabs{display:flex;flex-wrap:wrap;gap:6px;padding-top:6px;border-bottom:4px solid var(--c)}' +
    '.xd-tt-tabs button{all:unset;cursor:pointer;display:flex;align-items:center;gap:10px;padding:14px 20px 12px;margin-bottom:-4px;background:#EAF0F4;color:#41586B;font-weight:700;font-size:15px;line-height:1.2;border:2px solid #C9D6DF;border-bottom:0;border-radius:10px 10px 0 0;position:relative;flex:1 1 0;min-width:0;transition:background .25s ' + EASE + ',color .25s ' + EASE + ',transform .25s ' + EASE + ',border-color .25s ' + EASE + '}' +
    '.xd-tt-tabs button:hover{background:#fff;color:#13293C;border-color:var(--c);transform:translateY(-2px)}' +
    '.xd-tt-tabs button[aria-selected="true"]{background:#fff;color:#13293C;border-color:var(--c);border-top-width:5px;padding-top:12px;padding-bottom:16px;transform:translateY(-3px);box-shadow:0 -6px 14px rgba(19,41,60,.08)}' +
    '.xd-tt-tabs button[aria-selected="true"]:after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:6px;background:#fff}' +
    '.xd-tt-tabs button[aria-selected="true"] .xd-tt-ic{box-shadow:0 0 0 3px #fff,0 0 0 5px var(--c)}' +
    '.xd-tt-ic{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:var(--c);color:#fff;flex:none}' +
    '.xd-tt-ic svg{width:17px;height:17px}' +
    '.xd-tt-board{padding:10px 0 0}' +
    '.xd-tt-h{display:grid;grid-template-columns:96px minmax(0,1.3fr) minmax(0,1fr);gap:4px 18px;padding:6px 16px 8px 20px;color:#41586B;font-weight:700;font-size:13px}' +
    '.xd-tt-row{display:grid;grid-template-columns:96px minmax(0,1.3fr) minmax(0,1fr);gap:4px 18px;align-items:center;padding:14px 16px 14px 20px;margin-bottom:6px;background:#fff;border:1px solid #DCE5EB;border-left:5px solid var(--c);border-radius:4px;transition:transform .25s ' + EASE + ',box-shadow .25s ' + EASE + ',border-color .25s ' + EASE + '}' +
    '.xd-tt-row:hover{transform:translateX(3px);box-shadow:0 6px 16px rgba(19,41,60,.08);border-color:#C3D1DB;border-left-color:var(--c)}' +
    '.xd-tt-row b{font-family:Barlow;font-weight:700;font-size:22px;color:#13293C;font-variant-numeric:tabular-nums}' +
    '.xd-tt-row span{color:#13293C;font-weight:700;font-size:15px}' +
    '.xd-tt-row em{font-style:normal;color:#4B5A66;font-size:14px}' +
    '.xd-tt-note{margin:6px 0 0;padding:12px 16px;background:#F1F4F6;border-radius:4px;color:#3E4045;font-size:14px;line-height:1.5}' +
    '.xd-tt-foot{margin:10px 0 0;color:#41586B;font-size:14px;line-height:1.5}' +
    '@media(max-width:640px){.xd-tt-h{display:none}.xd-tt-row{grid-template-columns:70px minmax(0,1fr);padding:12px 14px}.xd-tt-row em{grid-column:2}.xd-tt-tabs{gap:4px}.xd-tt-tabs button{flex:1 1 100%;border-radius:8px 8px 0 0}}' +
    /* phones: the five ways in become a tab list, and each opens as its own page */
    '.xd-mix .xd-page-bar{display:none}' +
    '@media(max-width:640px){' +
      '.xd-mix .xd-flags{grid-template-columns:minmax(0,1fr)!important;gap:8px}' +
      '.xd-mix .xd-flag{flex-direction:row;justify-content:flex-start;gap:14px;border-radius:10px;border-bottom:0;border-left:8px solid var(--c);padding:12px 56px 12px 14px;position:relative;text-align:left}' +
      '.xd-mix .xd-flag:after{content:"\\203A";position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:28px;font-weight:700;color:var(--c)}' +
      '.xd-mix .xd-flag .xd-ring{width:44px;height:44px;border-width:6px;flex:none}' +
      '.xd-mix .xd-flag .xd-ring svg{width:20px;height:20px}' +
      '.xd-mix .xd-flag b{text-align:left;font-size:18px}' +
      '.xd-mix .xd-flag small{margin-left:auto;white-space:nowrap}' +
      '.xd-mix .xd-flag[aria-selected="true"]{background:#fff;color:#13293C;border-bottom-color:transparent}' +
      '.xd-mix .xd-flag[aria-selected="true"] small{color:#41586B}' +
      '.xd-mix .xd-flag[aria-selected="true"] .xd-ring{color:#13293C}' +
      '.xd-mix .xd-page{position:fixed;inset:0;z-index:9990;background:#F1F4F6;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;transform:translateX(100%);visibility:hidden;transition:transform .35s ' + EASE + ',visibility 0s .35s;padding:0 14px 40px}' +
      '.xd-mix.xd-open .xd-page{transform:none;visibility:visible;transition:transform .35s ' + EASE + ',visibility 0s}' +
      '.xd-mix .xd-page-bar{display:flex;position:sticky;top:0;z-index:3;align-items:center;gap:12px;margin:0 -14px 14px;padding:12px 14px;background:#13293C;color:#fff;border-bottom:5px solid var(--c)}' +
      '.xd-mix .xd-page-bar button{all:unset;cursor:pointer;display:flex;align-items:center;gap:6px;font-weight:700;font-size:16px;padding:8px 12px;background:#fff;color:#13293C;border-radius:6px}' +
      '.xd-mix .xd-page-bar b{font-weight:700;font-size:18px}' +
      '.xd-mix .xd-page .xd-line-box{margin-top:0}' +
      '.xd-mix .xd-page .xd-body{padding-bottom:20px}' +
    '}' +
    '@media(max-width:1000px){.xd-mix .xd-flags{grid-template-columns:repeat(3,minmax(0,1fr))}.xd-mix .xd-body{grid-template-columns:minmax(0,1fr)}.xd-mix .xd-side{position:static}.xd-mix .xd-head{grid-template-columns:1fr}}' +
    '@media(max-width:640px){.xd-mix .xd-flags{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.xd-mix .xd-flag{padding:14px 10px}.xd-mix .xd-ring{width:52px;height:52px;border-width:7px}.xd-mix .xd-card{padding:22px 18px}.xd .xd-wrap{padding:0 14px}' +
      '.xd-mix .xd-line-box{padding:18px 16px 20px}.xd-mix .xd-hline{grid-auto-flow:row;padding-left:22px}.xd-mix .xd-hline:before{left:7px;right:auto;top:6px;bottom:6px;width:6px;height:auto}' +
      '.xd-mix .xd-hline li{padding-top:0;margin-bottom:6px}.xd-mix .xd-hstop{margin-right:0;padding-left:16px;padding-right:92px}.xd-mix .xd-hstop:before{left:-22px;top:16px}}';


  /* Train and bus times as a departures board: one transport tab per timetable, then link tabs to the full route pages */
  var TRAIN_PAGE = { clactonairshow: 'train-to-clacton', cosfordairshow: 'train-to-cosford', eastbourneairshow: 'train-to-eastbourne', riat: 'train-to-riat', walesairshow: 'train-to-swansea', duxfordairshows: 'train-to-duxford', shuttleworthairshows: 'train-to-shuttleworth', 'headcorn-air-show': 'train-to-headcorn', 'international-ayr-show': 'train-to-ayr', 'blackpool-air-show': 'train-to-blackpool', 'southport-air-show': 'train-to-southport', midlandsairfestival: 'train-to-midlands', 'little-gransden-air-and-car-show': 'train-to-little-gransden' };
  function showSlug() {
    var c = document.querySelector('link[rel="canonical"]');
    var m = c && c.href.match(/ukairshowguide\.co\.uk\/([^\/?#]+)/);
    return m ? m[1] : '';
  }
  function board(ttx, colour) {
    var tables = Array.prototype.slice.call(ttx.querySelectorAll('details')).map(function (d) {
      var sum = d.querySelector('summary');
      var note = d.querySelector('.ttx-note');
      var noteText = '';
      if (note) {
        var c = note.cloneNode(true);
        Array.prototype.slice.call(c.querySelectorAll('a')).forEach(function (a) { a.remove(); });
        noteText = c.textContent.replace(/\s*Source:\s*\.?\s*$/i, '').trim();
      }
      return {
        title: sum ? sum.textContent.replace(/[−+\-]\s*$/, '').trim() : 'Times',
        rows: Array.prototype.slice.call(d.querySelectorAll('.ttx-row')).map(function (r) {
          return [(r.querySelector('b') || {}).textContent || '', (r.querySelector('span') || {}).textContent || '', (r.querySelector('em') || {}).textContent || ''];
        }),
        note: noteText
      };
    });
    var foot = ttx.querySelector('.ttx-foot');
    var wrap = document.createElement('div');
    wrap.className = 'xd-tt';
    wrap.style.setProperty('--c', colour);
    var kind = function (t) { return /coach|national express|stansted/i.test(t) ? 'coach' : /train|rail|liverpool street|greater anglia/i.test(t) ? 'train' : 'bus'; };
    wrap.innerHTML = '<div class="xd-tt-tabs" role="tablist" aria-label="Timetables">' + tables.map(function (t, i) {
      var k = kind(t.title + ' ' + t.rows.map(function (r) { return r[1]; }).join(' '));
      return '<button type="button" role="tab" data-i="' + i + '" aria-selected="' + (i === 0) + '"><span class="xd-tt-ic">' + (k === 'coach' ? icon('By coach') : k === 'train' ? icon('By train') : icon('By bus')) + '</span>' + esc(t.title) + '</button>';
    }).join('') + '</div>' + tables.map(function (t, i) {
      return '<div class="xd-tt-board" role="tabpanel"' + (i ? ' hidden' : '') + '><div class="xd-tt-h"><span>Time</span><span>Service</span><span>Details</span></div>' +
        t.rows.map(function (r) { return '<div class="xd-tt-row"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span><em>' + esc(r[2]) + '</em></div>'; }).join('') +
        (t.note ? '<p class="xd-tt-note">' + esc(t.note) + '</p>' : '') + '</div>';
    }).join('') + (foot ? '<p class="xd-tt-foot">' + esc(foot.textContent.trim()) + '</p>' : '');
    var links = '';
    var slug = showSlug(), train = TRAIN_PAGE[slug];
    /* the train route link only shows on topics whose times are trains */
    if (train && tables.some(function (t) { return kind(t.title + ' ' + t.rows.map(function (r) { return r[1]; }).join(' ')) === 'train'; })) links += '<a class="xd-tt-link" href="https://www.ukairshowguide.co.uk/' + train + '" target="_top"><span class="xd-tt-ic">' + icon('By train') + '</span><span><b>Train route and live times</b><small>Every station, platform and change</small></span></a>';
    links += '<a class="xd-tt-link" href="https://www.ukairshowguide.co.uk/airshow-public-transport" target="_top"><span class="xd-tt-ic">' + icon('By bus') + '</span><span><b>Every bus and train for this show</b><small>Route maps and where to get off</small></span></a>';
    wrap.insertAdjacentHTML('afterbegin', '<div class="xd-tt-links">' + links + '</div>');
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('.xd-tt-tabs button'); if (!b) return;
      var i = Number(b.dataset.i);
      wrap.querySelectorAll('.xd-tt-tabs button').forEach(function (x) { x.setAttribute('aria-selected', String(Number(x.dataset.i) === i)); });
      wrap.querySelectorAll('.xd-tt-board').forEach(function (bd, k) { bd.hidden = k !== i; });
    });
    ttx.replaceWith(wrap);
  }


  /* ---------- the top of the Getting there tab: quick route buttons and a key places board ---------- */
  var CSS_HERO =
    '#travel .gt-hero{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)!important;gap:40px 56px!important;align-items:start!important}' +
    '#travel .gt-hero h2 small{color:#00A6E2!important;font-family:Barlow;font-weight:700;font-size:.4em;letter-spacing:0}' +
    '#travel .gt-hero .btns{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr));gap:10px;margin-top:26px!important}' +
    '#travel .gt-hero .btns .btn{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:stretch;background:#13293C;color:#fff;min-height:64px;position:relative;border-radius:4px;overflow:visible;box-shadow:0 4px 0 rgba(19,41,60,.25);transition:transform .25s ' + EASE + ',box-shadow .25s ' + EASE + ',background .25s ' + EASE + '}' +
    '#travel .gt-hero .btns .btn:before{content:"";flex:none;width:64px;background:var(--bc,#00A6E2);border-radius:4px 0 0 4px}' +
    '#travel .gt-hero .btns .btn .xd-bi{position:absolute;left:0;top:0;bottom:0;width:64px;display:flex;align-items:center;justify-content:center;color:#fff}' +
    '#travel .gt-hero .btns .btn .xd-bi svg{width:28px;height:28px}' +
    '#travel .gt-hero .btns .btn:after{display:none!important}' +
    '#travel .gt-hero .btns .btn .xd-bp{position:absolute;left:64px;top:50%;margin-top:-12px;width:0;height:0;border-style:solid;border-width:12px 0 12px 12px;border-color:transparent transparent transparent var(--bc,#00A6E2)}' +
    '#travel .gt-hero .btns .btn .xd-bt{display:flex;flex-direction:column;justify-content:center;padding:10px 40px 10px 28px;font-weight:700;font-size:18px;line-height:1.2}' +
    '#travel .gt-hero .btns .btn .xd-bt small{font-weight:500;font-size:14px;color:#C9DCEA;margin-top:2px}' +
    '#travel .gt-hero .btns .btn .xd-ba{position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:22px;font-weight:700;color:var(--bc,#00A6E2);transition:transform .25s ' + EASE + '}' +
    '#travel .gt-hero .btns .btn:hover{transform:translateY(-3px);box-shadow:0 8px 0 rgba(19,41,60,.18);background:#1C3850}' +
    '#travel .gt-hero .btns .btn:hover .xd-ba{transform:translate(5px,-50%)}' +
    '#travel .gt-hero .btns .btn:focus-visible{outline:3px solid #D74949;outline-offset:3px}' +
    /* Clacton: the earlier route buttons (navy, coloured symbol block) with the new design's arrow and light sweep on hover */
    '#travel.xd-btn2 .gt-hero .btns .btn{overflow:hidden;transition:transform .4s ' + EASE + ',box-shadow .4s ' + EASE + ',background .4s ' + EASE + '}' +
    '#travel.xd-btn2 .gt-hero .btns .btn:after{content:""!important;display:block!important;position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.18),transparent);transform:skewX(-18deg);transition:left .7s ' + EASE + ';pointer-events:none}' +
    '#travel.xd-btn2 .gt-hero .btns .btn .xd-ba{font-size:24px;transition:transform .4s ' + EASE + '}' +
    '#travel.xd-btn2 .gt-hero .btns .btn:hover:after{left:120%}' +
    '#travel.xd-btn2 .gt-hero .btns .btn:active{transform:translateY(0) scale(.99)}' +
    '@media(prefers-reduced-motion:reduce){#travel.xd-btn2 .gt-hero .btns .btn:after{display:none!important}}' +
    /* key places board */
    '#travel .gt-facts{padding:0!important;background:none!important}' +
    '#travel .gt-facts::before{display:none!important}' +
    '#travel .gt-facts .xd-kp-h{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#050607;color:#F2B233;padding:12px 16px;border-bottom:4px solid #00A6E2;font-family:Barlow;font-weight:700;font-size:22px;letter-spacing:.03em;text-shadow:0 0 8px rgba(242,178,51,.4)}' +
    '#travel .gt-facts .xd-kp-h span{font-family:Barlow;font-weight:700;font-size:13px;letter-spacing:0;text-shadow:none;color:#06283D;background:#00A6E2;padding:3px 10px}' +
    '#travel .gt-facts dl{background:#fff!important;color:#13293C!important;padding:0!important;gap:0!important;border:2px solid #13293C;border-top:0}' +
    '#travel .gt-facts dl > div{background:#fff!important;display:grid;grid-template-columns:48px minmax(0,1fr);gap:0 14px;align-items:center;padding:12px 16px 12px 0!important;border-bottom:1px solid #E1E9EF;border-left:8px solid var(--rc,#00A6E2);transition:background .25s ' + EASE + ',padding .25s ' + EASE + '}' +
    '#travel .gt-facts dl > div:last-child{border-bottom:0}' +
    '#travel .gt-facts dl > div:hover{background:var(--rs,#EAF6FC)!important;padding-left:6px!important}' +
    '#travel .gt-facts .xd-ri{grid-row:1/3;width:40px;height:40px;margin-left:10px;border-radius:50%;background:var(--rc,#00A6E2);color:#fff;display:flex;align-items:center;justify-content:center}' +
    '#travel .gt-facts .xd-ri svg{width:22px;height:22px}' +
    '#travel .gt-facts dt{font-family:Barlow!important;font-weight:700!important;font-size:14px!important;line-height:1.2!important;letter-spacing:0!important;text-transform:none!important;color:#41586B!important}' +
    '#travel .gt-facts dd{font-family:Barlow!important;font-weight:700!important;font-size:19px!important;line-height:1.2!important;text-transform:none!important;margin-top:2px!important;color:#13293C}' +
    '@media(max-width:900px){#travel .gt-hero{grid-template-columns:minmax(0,1fr)!important}}' +
    '@media(prefers-reduced-motion:reduce){#travel .gt-hero .btns .btn,#travel .gt-facts dl > div{transition:none}}';

  function decorateHero() {
    var travel = document.getElementById('travel');
    if (!travel) return;
    var btn2 = /clacton/i.test(showSlug());
    if (btn2) travel.classList.add('xd-btn2');
    function look(label) { var k = canon(label), m = MODES[k]; return [k, m.colour, soft(m.colour, .14)]; }
    var place = (window.CG_PLACE && window.CG_PLACE.short) || '';
    var SUBS = place === 'Clacton' ? { 'park and ride': 'Leave the car, ride to the seafront', 'arriving by train': 'Direct from London and Colchester' } : {};
    Array.prototype.slice.call(travel.querySelectorAll('.gt-hero .btns .btn')).forEach(function (b) {
      if (b.querySelector('.xd-bt')) return;
      var label = b.textContent.trim(), m = look(label);
      b.style.setProperty('--bc', m[1]);
      var sub = SUBS[label.toLowerCase()] || '';
      b.innerHTML = '<span class="xd-bi">' + icon(m[0]) + '</span><span class="xd-bp" aria-hidden="true"></span><span class="xd-bt">' + esc(label) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span><span class="xd-ba" aria-hidden="true">' + (btn2 ? '&rarr;' : '&rsaquo;') + '</span>';
    });
    var facts = travel.querySelector('.gt-facts');
    if (facts && !facts.querySelector('.xd-kp-h')) {
      facts.insertAdjacentHTML('afterbegin', '<div class="xd-kp-h"><span style="background:none;color:inherit;padding:0;font-size:inherit;font-family:inherit">Key places</span>' + (place ? '<span>' + esc(place) + '</span>' : '') + '</div>');
      Array.prototype.slice.call(facts.querySelectorAll('dl > div')).forEach(function (row) {
        var dt = row.querySelector('dt'), m = look(dt ? dt.textContent.trim() : '');
        row.style.setProperty('--rc', m[1]); row.style.setProperty('--rs', m[2]);
        row.insertAdjacentHTML('afterbegin', '<span class="xd-ri" aria-hidden="true">' + icon(m[0]) + '</span>');
      });
    }
  }

  /* ---------- reading the page's own topics ---------- */
  function readGroups(pl) {
    var groups = [], cur = null;
    Array.prototype.slice.call(pl.children).forEach(function (el) {
      if (el.classList.contains('park-group')) { cur = { name: el.textContent.trim(), items: [] }; groups.push(cur); }
      else if (el.matches('button[data-id]')) {
        if (!cur) { cur = { name: 'Getting there', items: [] }; groups.push(cur); }
        var label = el.querySelector('span');
        var sm = label && label.querySelector('small');
        var title = label ? label.firstChild.textContent.trim() : el.textContent.trim();
        cur.items.push({ id: el.dataset.id, title: title, sub: sm ? sm.textContent.trim() : '', btn: el, group: cur });
      }
    });
    return groups;
  }

  /* split the page's topic panel into its parts after every fill */
  function parts(detail) {
    var out = { head: [], keep: [], journey: [], buses: [], times: [], tips: [], info: [] };
    Array.prototype.slice.call(detail.children).forEach(function (el) {
      if (el.matches('h3, .lead, .on-map')) out.head.push(el);
      else if (el.matches('.br-box, .tr-box')) out.keep.push(el);
      else if (el.matches('ol.route, ol.jx-steps')) out.journey.push(el);
      else if (el.matches('.areas')) out.buses.push(el);
      else if (el.matches('.ttx, .jx-dcard')) out.times.push(el);
      else if (el.matches('.cols, .d-warn')) out.tips.push(el);
      else out.info.push(el);
    });
    return out;
  }
  var SECTIONS = [['journey', 'Your journey'], ['buses', 'Bus routes'], ['times', 'Train and bus times'], ['tips', 'Planning tips'], ['info', 'Details and links']];
  /* the routes list has its own heading (for example Main roads into Clacton), so the section uses that */
  function secName(s, nodes) {
    if (s[0] === 'buses') {
      var h = nodes[0] && nodes[0].querySelector('h4');
      if (h) { var name = h.textContent.trim(); h.remove(); return esc(name); }
    }
    return s[1];
  }

  function start(pl) {
    var explore = document.getElementById('explore');
    var detail = document.getElementById('parkDetail');
    var grid = explore.querySelector('.explore-grid');
    var aside = explore.querySelector('.explore-side');
    var mapbox = explore.querySelector('.mapbox');
    var h2 = aside.querySelector('h2'), intro = aside.querySelector('h2 + p'), note = aside.querySelector('.side-note');
    var groups = readGroups(pl);
    /* trains first, then buses, then everything else in the page's own order */
    function rank(g) {
      var ids = g.items.map(function (it) { return it.id; }).join(' ');
      if (/train|rail/i.test(g.name) || /(^|\s)(rail|train)/.test(ids)) return 0;
      if (/bus/i.test(g.name) || /(^|\s)bus/.test(ids)) return 1;
      return 2;
    }
    groups = groups.map(function (g, i) { return { g: g, i: i, r: rank(g) }; })
      .sort(function (a, b) { return a.r - b.r || a.i - b.i; }).map(function (x) { return x.g; });
    var all = [];
    groups.forEach(function (g) { g.items.forEach(function (it) { all.push(it); }); });
    if (all[0] && all[0].btn.getAttribute('aria-pressed') !== 'true') all[0].btn.click();

    var st = document.createElement('style');
    st.textContent = CSS_BASE + ({ line: CSS_LINE, board: CSS_BOARD, stop: CSS_STOP, mix: CSS_MIX }[DESIGN]) + CSS_HERO;
    decorateHero();
    /* on the live site the guide sits inside the site's own container, so the styles go next to it, not in the page head */
    var host = explore.getRootNode && explore.getRootNode();
    if (host && host.nodeType === 11) host.appendChild(st); else document.head.appendChild(st);

    explore.classList.add('xd-on');
    var hold = document.createElement('div'); hold.className = 'xd-hold';
    var root = document.createElement('div'); root.className = 'xd ' + ({ line: 'xd-line', board: 'xd-board', stop: 'xd-stopd', mix: 'xd-mix' }[DESIGN]);
    grid.parentNode.insertBefore(root, grid);
    hold.appendChild(grid);
    explore.appendChild(hold);

    var headHTML = '<div class="xd-head"><h2>' + esc(h2 ? h2.textContent : 'Choose a topic') + '</h2><p>' + esc(intro ? intro.textContent : '') + '</p></div>';
    var noteText = note ? note.textContent.trim() : '';
    var pickers = [];
    function current() { return all.filter(function (it) { return it.btn.getAttribute('aria-pressed') === 'true'; })[0] || all[0]; }
    function choose(it) { if (it.btn.getAttribute('aria-pressed') !== 'true') it.btn.click(); }

    /* where the topic content goes */
    var content = document.createElement('div'); content.className = 'xd-content';
    var stepBar = document.createElement('div'); stepBar.className = 'xd-step';
    stepBar.innerHTML = '<span></span><div><button type="button" data-s="-1">Previous topic</button><button type="button" data-s="1">Next topic</button></div>';
    stepBar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-s]'); if (!b || b.disabled) return;
      var i = all.indexOf(current()), n = all[i + Number(b.dataset.s)];
      if (n) choose(n);
    });

    if (DESIGN === 'line') buildLine(); else if (DESIGN === 'board') buildBoard(); else if (DESIGN === 'mix') buildMix(); else buildStop();

    /* ---- A ---- */
    function buildLine() {
      var top = '<div class="xd-top"><div class="xd-wrap">' + headHTML + '<div class="xd-map-key">' + groups.map(function (g, gi) {
        var m = mode(g.name);
        return '<div class="xd-grp" style="--c:' + m.colour + ';--i:' + m.ink + '"><div class="xd-grp-h"><span class="xd-roundel">' + icon(g.name) + '</span>' + esc(g.name) + '</div><ul class="xd-stops">' +
          g.items.map(function (it) { return '<li><button type="button" class="xd-stop" data-id="' + esc(it.id) + '"><b>' + esc(it.title) + '</b>' + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</button></li>'; }).join('') +
          '</ul></div>';
      }).join('') + '</div></div></div>';
      root.innerHTML = top + '<div class="xd-wrap"><div class="xd-body"><div class="xd-main"></div><aside class="xd-side"></aside></div></div>';
      root.querySelector('.xd-main').appendChild(content);
      root.querySelector('.xd-main').appendChild(stepBar);
      var side = root.querySelector('.xd-side');
      if (mapbox) side.appendChild(mapbox);
      var good = document.createElement('div'); good.className = 'xd-good'; good.innerHTML = '<h4>Good to know</h4>';
      side.appendChild(good);
      if (noteText) { var p = document.createElement('p'); p.className = 'xd-note'; p.textContent = noteText; good.appendChild(p); }
      root.addEventListener('click', function (e) {
        var b = e.target.closest('.xd-stop'); if (!b) return;
        choose(all.filter(function (it) { return it.id === b.dataset.id; })[0]);
      });
      pickers.push(function (cur) {
        root.querySelectorAll('.xd-stop').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.id === cur.id)); });
      });
      layout = function (pt, cur) {
        var c = mode(cur.group.name).colour;
        content.style.setProperty('--c', c);
        content.innerHTML = '';
        var t = document.createElement('div'); t.className = 'xd-title'; pt.head.forEach(function (el) { t.appendChild(el); }); content.appendChild(t);
        var k = document.createElement('div'); k.className = 'xd-keep'; pt.keep.forEach(function (el) { k.appendChild(el); }); content.appendChild(k);
        SECTIONS.forEach(function (s) {
          if (s[0] === 'info' || !pt[s[0]].length) return;
          var sec = document.createElement('section'); sec.className = 'xd-sec';
          sec.innerHTML = '<h4>' + secName(s, pt[s[0]]) + '</h4>';
          pt[s[0]].forEach(function (el) { sec.appendChild(el); });
          content.appendChild(sec);
        });
        Array.prototype.slice.call(good.querySelectorAll('.xd-info')).forEach(function (el) { el.remove(); });
        var info = document.createElement('div'); info.className = 'xd-info'; pt.info.forEach(function (el) { info.appendChild(el); });
        good.appendChild(info);
      };
    }

    /* ---- B ---- */
    function buildBoard() {
      var rows = groups.map(function (g) {
        var m = mode(g.name);
        return g.items.map(function (it) {
          return '<button type="button" class="xd-row" data-id="' + esc(it.id) + '" style="--c:' + m.colour + ';--i:' + m.ink + '"><span class="xd-badge">' + icon(g.name) + '</span><span><b>' + esc(it.title) + '</b>' + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</span><span class="xd-plat">' + esc(m.short) + '</span></button>';
        }).join('');
      }).join('');
      root.innerHTML = '<div class="xd-wrap">' + headHTML + '<div class="xd-grid"><div class="xd-dep" role="list" aria-label="Ways to get there"><div class="xd-dep-h"><b>Ways to get there</b><span class="xd-clock" aria-hidden="true"></span></div>' + rows + '</div><div class="xd-right"><div class="xd-card"></div></div></div>' + (noteText ? '<p class="xd-note" style="color:#C9DCEA;margin-top:20px">' + esc(noteText) + '</p>' : '') + '</div>';
      var card = root.querySelector('.xd-card');
      card.appendChild(content); card.appendChild(stepBar);
      if (mapbox) { mapbox.classList.add('xd-mapcard'); root.querySelector('.xd-right').appendChild(mapbox); }
      var clock = root.querySelector('.xd-clock');
      function tick() { var d = new Date(); clock.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
      tick(); setInterval(tick, 20000);
      root.addEventListener('click', function (e) {
        var b = e.target.closest('.xd-row'); if (!b) return;
        choose(all.filter(function (it) { return it.id === b.dataset.id; })[0]);
      });
      pickers.push(function (cur) {
        root.querySelectorAll('.xd-row').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.id === cur.id)); });
      });
      var lastTab = '';
      layout = function (pt, cur) {
        card.style.setProperty('--c', mode(cur.group.name).colour);
        content.innerHTML = '';
        var t = document.createElement('div'); t.className = 'xd-title'; pt.head.forEach(function (el) { t.appendChild(el); }); content.appendChild(t);
        var k = document.createElement('div'); k.className = 'xd-keep'; pt.keep.forEach(function (el) { k.appendChild(el); }); content.appendChild(k);
        var tabs = document.createElement('div'); tabs.className = 'xd-tabs'; tabs.setAttribute('role', 'tablist');
        content.appendChild(tabs);
        var made = [];
        SECTIONS.forEach(function (s) {
          if (!pt[s[0]].length) return;
          var pane = document.createElement('div'); pane.className = 'xd-pane'; pane.setAttribute('role', 'tabpanel');
          pt[s[0]].forEach(function (el) { pane.appendChild(el); });
          var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = s[1];
          b.addEventListener('click', function () { pick(s[1]); });
          tabs.appendChild(b); content.appendChild(pane); made.push({ n: s[1], b: b, p: pane });
        });
        function pick(n) {
          if (!made.some(function (m) { return m.n === n; })) n = made[0].n;
          lastTab = n;
          made.forEach(function (m) { var on = m.n === n; m.p.hidden = !on; m.b.setAttribute('aria-selected', String(on)); m.b.tabIndex = on ? 0 : -1; });
        }
        if (made.length) pick(lastTab || made[0].n);
      };
    }


    /* ---- A + C ---- */
    function buildMix() {
      root.innerHTML = '<div class="xd-top"><div class="xd-wrap">' + headHTML + '</div></div><div class="xd-wrap"><div class="xd-flags" role="tablist" aria-label="Ways to get there">' +
        groups.map(function (g, gi) {
          var m = mode(g.name);
          return '<button type="button" class="xd-flag" role="tab" data-g="' + gi + '" style="--c:' + m.colour + '"><span class="xd-ring">' + icon(g.name) + '</span><b>' + esc(g.name) + '</b><small>' + g.items.length + (g.items.length === 1 ? ' option' : ' options') + '</small></button>';
        }).join('') + '</div><div class="xd-page" role="dialog" aria-modal="false" aria-label="Getting there details"><div class="xd-page-bar"><button type="button" class="xd-back">&lsaquo; Back</button><b class="xd-page-t"></b></div><div class="xd-line-box"></div><div class="xd-lane" aria-hidden="true"><span>BUS LANE</span><svg viewBox="0 0 84 30"><rect x="2" y="3" width="78" height="20" rx="4" fill="#00A6E2"/><rect x="8" y="7" width="10" height="7" fill="#E8F7FD"/><rect x="22" y="7" width="10" height="7" fill="#E8F7FD"/><rect x="36" y="7" width="10" height="7" fill="#E8F7FD"/><rect x="50" y="7" width="10" height="7" fill="#E8F7FD"/><rect x="66" y="7" width="10" height="11" fill="#E8F7FD"/><circle cx="18" cy="24" r="4" fill="#13293C"/><circle cx="64" cy="24" r="4" fill="#13293C"/></svg></div><div class="xd-body"><div class="xd-card"></div><aside class="xd-side"></aside></div></div></div>';
      /* the page's main sections become numbered stops on one line, each with its own line colour */
      var LINES = ['#32B4AF', '#00A6E2', '#F2B233', '#D74949', '#2BA84A', '#6950A1'];
      Array.prototype.slice.call(document.querySelectorAll('main > .panel.sec')).forEach(function (p, i) {
        p.style.setProperty('--sl', LINES[i % LINES.length]);
        var t = p.querySelector('.sec-toggle');
        if (t && !t.querySelector('.st-stop')) t.insertAdjacentHTML('afterbegin', '<span class="st-stop" aria-hidden="true">' + (i + 1) + '</span>');
      });
      Array.prototype.slice.call(document.querySelectorAll('.folds > section.fold')).forEach(function (f, i) {
        f.style.setProperty('--sl', LINES[i % LINES.length]);
        var w = f.querySelector('.fold-btn .wrap');
        if (w && !w.querySelector('.st-stop')) w.insertAdjacentHTML('afterbegin', '<span class="st-stop" aria-hidden="true">' + (i + 1) + '</span>');
      });
      root.querySelector('.xd-flags').style.setProperty('--n', groups.length);
      var box = root.querySelector('.xd-line-box');
      var card = root.querySelector('.xd-card');
      card.appendChild(content); card.appendChild(stepBar);
      var side = root.querySelector('.xd-side');
      if (mapbox) side.appendChild(mapbox);
      var good = document.createElement('div'); good.className = 'xd-good'; good.innerHTML = '<h4>Good to know</h4>';
      side.appendChild(good);
      if (noteText) { var p = document.createElement('p'); p.className = 'xd-note'; p.textContent = noteText; good.appendChild(p); }
      var shown = -1;
      function showGroup(gi) {
        shown = gi;
        root.querySelectorAll('.xd-flag').forEach(function (f) { f.setAttribute('aria-selected', String(Number(f.dataset.g) === gi)); });
        var g = groups[gi], m = mode(g.name);
        tint(box, m.colour); box.style.setProperty('--i', m.ink);
        box.innerHTML = '<div class="xd-line-h"><span class="xd-roundel">' + icon(g.name) + '</span>' + esc(g.name) + '</div><ol class="xd-hline">' +
          g.items.map(function (it, k) { return '<li><button type="button" class="xd-hstop" data-id="' + esc(it.id) + '"><span class="xd-sl" aria-hidden="true">Option ' + String.fromCharCode(65 + k) + '</span><b>' + esc(it.title) + '</b>' + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</button></li>'; }).join('') + '</ol>';
        mark(current());
      }
      function mark(cur) { box.querySelectorAll('.xd-hstop').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.id === cur.id)); }); }
      root.addEventListener('click', function (e) {
        var f = e.target.closest('.xd-flag');
        if (f) { var g = groups[Number(f.dataset.g)]; showGroup(Number(f.dataset.g)); if (g.items.indexOf(current()) < 0) choose(g.items[0]); openPage(g); return; }
        if (e.target.closest('.xd-back')) { closePage(); return; }
        var b = e.target.closest('.xd-hstop');
        if (b) choose(all.filter(function (it) { return it.id === b.dataset.id; })[0]);
      });
      /* on phones each way in opens as its own page, with Back to return to the list */
      var phone = window.matchMedia ? window.matchMedia('(max-width:640px)') : { matches: false };
      var page = root.querySelector('.xd-page'), lastFlag = null;
      function openPage(g) {
        if (!phone.matches) return;
        lastFlag = root.querySelector('.xd-flag[aria-selected="true"]');
        tint(page, mode(g.name).colour);
        root.querySelector('.xd-page-t').textContent = g.name;
        root.classList.add('xd-open');
        document.documentElement.style.overflow = 'hidden';
        /* start the page under the site's own header bar, so Back is never hidden behind it */
        var top = 0;
        try {
          var hd = (root.ownerDocument || document).querySelector('#SITE_HEADER, header');
          var hb = hd ? hd.getBoundingClientRect().bottom : 0;
          if (hb > 0 && hb < 160) top = Math.round(hb);
        } catch (err) { top = 0; }
        page.style.top = top + 'px';
        page.scrollTop = 0;
        setTimeout(function () { var bk = root.querySelector('.xd-back'); if (bk) bk.focus(); }, 60);
      }
      function closePage() {
        root.classList.remove('xd-open');
        document.documentElement.style.overflow = '';
        if (lastFlag) lastFlag.focus();
      }
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('xd-open')) closePage(); });
      if (phone.addEventListener) phone.addEventListener('change', function () { if (!phone.matches) closePage(); });
      root.querySelector('.xd-page-bar').addEventListener('click', function (e) { if (e.target.closest('.xd-back')) closePage(); });
      pickers.push(function (cur) { var gi = groups.indexOf(cur.group); if (gi !== shown) showGroup(gi); else mark(cur); });
      layout = function (pt, cur) {
        tint(card, mode(cur.group.name).colour);
        content.innerHTML = '';
        var blind = document.createElement('div'); blind.className = 'xd-blindbar';
        blind.innerHTML = '<b>' + esc(cur.title) + '</b><span>' + esc(mode(cur.group.name).short) + ', stop ' + (all.indexOf(cur) + 1) + ' of ' + all.length + '</span>';
        content.appendChild(blind);
        var t = document.createElement('div'); t.className = 'xd-title'; pt.head.forEach(function (el) { t.appendChild(el); }); content.appendChild(t);
        var k = document.createElement('div'); k.className = 'xd-keep'; pt.keep.forEach(function (el) { k.appendChild(el); }); content.appendChild(k);
        SECTIONS.forEach(function (s) {
          if (s[0] === 'info' || !pt[s[0]].length) return;
          var sec = document.createElement('section'); sec.className = 'xd-sec';
          sec.innerHTML = '<h4>' + secName(s, pt[s[0]]) + '</h4>';
          pt[s[0]].forEach(function (el) { sec.appendChild(el); });
          content.appendChild(sec);
        });
        Array.prototype.slice.call(good.querySelectorAll('.xd-info')).forEach(function (el) { el.remove(); });
        var info = document.createElement('div'); info.className = 'xd-info'; pt.info.forEach(function (el) { info.appendChild(el); });
        good.appendChild(info);
        Array.prototype.slice.call(content.querySelectorAll('.ttx')).forEach(function (t) { board(t, mode(cur.group.name).colour); });
        journeyTabs(content, cur);
      };
    }

    /* the journey section gets two tabs: the way there with its times, and the way home with its times */
    function journeyTabs(scope, cur) {
      var js = scope.querySelector('.xd-sec'), tt = scope.querySelector('.xd-tt');
      if (!js || !tt || js.querySelector('.xd-jt')) return;
      var btns = Array.prototype.slice.call(tt.querySelectorAll('.xd-tt-tabs button')), boards = tt.querySelectorAll('.xd-tt-board');
      var hi = -1, gi = -1;
      btns.forEach(function (b, i) { if (/home|back|return/i.test(b.textContent)) { if (hi < 0) hi = i; } else if (gi < 0) gi = i; });
      if (hi < 0 || gi < 0) return;
      var m = mode(cur.group.name), c = m.colour;
      var noun = /coach/i.test(btns[hi].textContent) ? 'Coaches' : /bus/i.test(btns[hi].textContent) ? 'Buses' : 'Trains';
      var kids = Array.prototype.slice.call(js.children).filter(function (el) { return el.tagName !== 'H4'; });
      var there = document.createElement('div'); there.className = 'xd-jp';
      kids.forEach(function (el) { there.appendChild(el); });
      var gb = boards[gi].cloneNode(true); gb.hidden = false;
      there.insertAdjacentHTML('beforeend', '<h5 class="xd-jh">Times to get there</h5>'); there.appendChild(gb);
      var home = document.createElement('div'); home.className = 'xd-jp'; home.hidden = true;
      var hb = boards[hi].cloneNode(true); hb.hidden = false;
      home.insertAdjacentHTML('beforeend', '<h5 class="xd-jh">' + noun + ' home</h5>'); home.appendChild(hb);
      var wrap = document.createElement('div'); wrap.className = 'xd-jt'; wrap.style.setProperty('--c', c);
      wrap.innerHTML = '<div class="xd-tt-tabs" role="tablist" aria-label="Getting there and home"><button type="button" role="tab" data-i="0" aria-selected="true"><span class="xd-tt-ic">' + icon(cur.group.name) + '</span>Getting here</button><button type="button" role="tab" data-i="1" aria-selected="false"><span class="xd-tt-ic">' + icon(cur.group.name) + '</span>' + noun + ' home</button></div>';
      wrap.appendChild(there); wrap.appendChild(home);
      wrap.addEventListener('click', function (e) {
        var b = e.target.closest('.xd-tt-tabs button'); if (!b) return;
        var i = Number(b.dataset.i);
        wrap.querySelectorAll('.xd-tt-tabs button').forEach(function (x) { x.setAttribute('aria-selected', String(Number(x.dataset.i) === i)); });
        there.hidden = i !== 0; home.hidden = i !== 1;
      });
      js.appendChild(wrap);
      /* the same two tables now live in the journey tabs, so take them out of the times section */
      [hi, gi].forEach(function (i) { btns[i].remove(); boards[i].remove(); });
      var left = tt.querySelectorAll('.xd-tt-tabs button'), rest = tt.querySelectorAll('.xd-tt-board');
      if (!left.length) { var tb = tt.querySelector('.xd-tt-tabs'); if (tb) tb.remove(); }
      else left.forEach(function (b, k) { b.dataset.i = k; b.setAttribute('aria-selected', String(k === 0)); rest[k].hidden = k !== 0; });
    }

    /* ---- C ---- */
    function buildStop() {
      root.innerHTML = '<div class="xd-top"><div class="xd-wrap">' + headHTML + '</div></div><div class="xd-wrap"><div class="xd-flags" role="tablist" aria-label="Ways to get there">' +
        groups.map(function (g, gi) {
          var m = mode(g.name);
          return '<button type="button" class="xd-flag" role="tab" data-g="' + gi + '" style="--c:' + m.colour + '"><span class="xd-ring">' + icon(g.name) + '</span><b>' + esc(g.name) + '</b><small>' + g.items.length + (g.items.length === 1 ? ' option' : ' options') + '</small></button>';
        }).join('') + '</div><div class="xd-blinds"></div><div class="xd-body"><div class="xd-card"></div><aside class="xd-side"></aside></div></div>';
      var blinds = root.querySelector('.xd-blinds');
      var card = root.querySelector('.xd-card');
      card.appendChild(content); card.appendChild(stepBar);
      var side = root.querySelector('.xd-side');
      if (mapbox) side.appendChild(mapbox);
      if (noteText) { var p = document.createElement('p'); p.className = 'xd-note'; p.style.cssText = 'background:#fff;padding:16px 18px;margin:0;border-left:6px solid #00A6E2'; p.textContent = noteText; side.appendChild(p); }
      var shown = -1;
      function showGroup(gi) {
        shown = gi;
        root.querySelectorAll('.xd-flag').forEach(function (f) { f.setAttribute('aria-selected', String(Number(f.dataset.g) === gi)); });
        var g = groups[gi], m = mode(g.name);
        blinds.innerHTML = g.items.map(function (it) { return '<button type="button" class="xd-blind" data-id="' + esc(it.id) + '" style="--c:' + m.colour + '"><b>' + esc(it.title) + '</b>' + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</button>'; }).join('');
        mark(current());
      }
      function mark(cur) { blinds.querySelectorAll('.xd-blind').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.id === cur.id)); }); }
      root.addEventListener('click', function (e) {
        var f = e.target.closest('.xd-flag');
        if (f) { var g = groups[Number(f.dataset.g)]; showGroup(Number(f.dataset.g)); if (g.items.indexOf(current()) < 0) choose(g.items[0]); return; }
        var b = e.target.closest('.xd-blind');
        if (b) choose(all.filter(function (it) { return it.id === b.dataset.id; })[0]);
      });
      pickers.push(function (cur) { var gi = groups.indexOf(cur.group); if (gi !== shown) showGroup(gi); else mark(cur); });
      layout = function (pt, cur) {
        card.style.setProperty('--c', mode(cur.group.name).colour);
        content.innerHTML = '';
        var t = document.createElement('div'); t.className = 'xd-title'; pt.head.forEach(function (el) { t.appendChild(el); }); content.appendChild(t);
        var k = document.createElement('div'); k.className = 'xd-keep'; pt.keep.forEach(function (el) { k.appendChild(el); }); content.appendChild(k);
        var first = true;
        SECTIONS.forEach(function (s) {
          if (!pt[s[0]].length) return;
          var d = document.createElement('details'); d.className = 'xd-acc'; if (first) d.open = true; first = false;
          d.innerHTML = '<summary>' + secName(s, pt[s[0]]) + '</summary><div></div>';
          pt[s[0]].forEach(function (el) { d.lastChild.appendChild(el); });
          content.appendChild(d);
        });
      };
    }

    var layout = layout || function () {};
    function refresh() {
      var cur = current();
      pickers.forEach(function (f) { f(cur); });
      var i = all.indexOf(cur);
      stepBar.querySelector('span').innerHTML = esc(cur.group.name) + ', <b>' + esc(cur.title) + '</b>, ' + (i + 1) + ' of ' + all.length;
      stepBar.querySelector('[data-s="-1"]').disabled = i <= 0;
      stepBar.querySelector('[data-s="1"]').disabled = i >= all.length - 1;
    }
    /* the page refills its own panel each time a topic is picked: lay it out again */
    function relayout() {
      if (!detail.children.length) return;
      var cur = current();
      layout(parts(detail), cur);
      refresh();
    }
    new MutationObserver(relayout).observe(detail, { childList: true });
    new MutationObserver(refresh).observe(pl, { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
    relayout();
    refresh();
  }

  (function wait(n) {
    var pl = document.getElementById('parkList');
    if (pl && pl.querySelector('button[data-id]') && document.getElementById('parkDetail').children.length) return start(pl);
    if (n < 100) setTimeout(function () { wait(n + 1); }, 100);
  })(0);
})();
