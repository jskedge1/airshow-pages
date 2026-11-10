  /* train-classes: the train in the rail strip is drawn as the class of train that usually works each leg,
     in that company's colours, and it changes to the next train at each change (10 Nov 2026).
     Allocation can vary on the day, so this is the type you will usually get, not a promise. */
  var TC_ELEC = { 'Blackpool North': 1, 'Preston': 1, 'Kirkham & Wesham': 1, 'Poulton-le-Fylde': 1, 'Layton': 1, 'Salwick': 1, 'Manchester Airport': 1, 'Manchester Piccadilly': 1, 'Manchester Oxford Road': 1, 'Liverpool Lime Street': 1, 'Wigan North Western': 1, 'Lancaster': 1, 'Bolton': 1, 'Chorley': 1, 'Leyland': 1, 'Crewe': 1, 'Warrington Bank Quay': 1, 'Ormskirk': 1 };
  var TC_LIV = {
    'Merseyrail': { body: '#D9DCDF', door: '#FFD200', band: '#FFD200', roof: '#A3AAB0' },
    'Northern': { body: '#262E6D', door: '#E6E7EE', band: '#7B4D9C', roof: '#9BA3AA' },
    'Avanti West Coast': { body: '#0E4351', door: '#0E4351', band: '#F26722', roof: '#7E8B90' },
    'TransPennine Express': { body: '#2C2E5E', door: '#2C2E5E', band: '#00A9B5', roof: '#8B90A8' },
    'LNER': { body: '#F3F4F5', door: '#CE0E2D', band: '#CE0E2D', roof: '#A3AAB0' },
    'Great Western Railway': { body: '#0B4A3F', door: '#0B4A3F', band: '#C8A54A', roof: '#7D8C88' },
    'CrossCountry': { body: '#C3C6C8', door: '#74214B', band: '#74214B', roof: '#8E9498' },
    'East Midlands Railway': { body: '#4A2A5E', door: '#4A2A5E', band: '#E3A64A', roof: '#8C8296' },
    'South Western Railway': { body: '#3B4450', door: '#3B4450', band: '#D52B1E', roof: '#8E959C' },
    'Southern': { body: '#F3F4F5', door: '#6CB33F', band: '#0B4F2C', roof: '#A3AAB0' },
    'Thameslink': { body: '#F3F4F5', door: '#A0237F', band: '#A0237F', roof: '#A3AAB0' },
    'Southeastern': { body: '#F3F4F5', door: '#00AFE8', band: '#0A2E5C', roof: '#A3AAB0' },
    'Chiltern Railways': { body: '#E7E9EB', door: '#1B3E8E', band: '#1B3E8E', roof: '#A3AAB0' },
    'West Midlands Railway': { body: '#F3F4F5', door: '#E3A812', band: '#4E2A84', roof: '#A3AAB0' },
    'London Northwestern Railway': { body: '#E7E9EB', door: '#00A651', band: '#3C4A54', roof: '#A3AAB0' },
    'Transport for Wales': { body: '#F3F4F5', door: '#C4122F', band: '#C4122F', roof: '#A3AAB0' },
    'Grand Central': { body: '#1E1E1E', door: '#1E1E1E', band: '#F37021', roof: '#5E6266' },
    'Hull Trains': { body: '#0B3D91', door: '#0B3D91', band: '#7AC143', roof: '#7C8BA6' },
    'ScotRail': { body: '#1C4F9C', door: '#1C4F9C', band: '#F3F4F5', roof: '#8C9AB3' },
    'c2c': { body: '#F3F4F5', door: '#B1006F', band: '#B1006F', roof: '#A3AAB0' },
    'Greater Anglia': { body: '#F3F4F5', door: '#D70428', band: '#D70428', roof: '#A3AAB0' },
    'Great Northern': { body: '#F3F4F5', door: '#1E3A8A', band: '#1E3A8A', roof: '#A3AAB0' },
    'Gatwick Express': { body: '#F3F4F5', door: '#D0003C', band: '#D0003C', roof: '#A3AAB0' },
    'London Overground': { body: '#F3F4F5', door: '#EE7623', band: '#EE7623', roof: '#A3AAB0' },
    'Elizabeth line': { body: '#F3F4F5', door: '#6950A1', band: '#6950A1', roof: '#A3AAB0' },
    'Lumo': { body: '#1F64E0', door: '#1F64E0', band: '#69D0F5', roof: '#7F95BC' },
    'Caledonian Sleeper': { body: '#1D3A3A', door: '#1D3A3A', band: '#B79A5A', roof: '#5E6A6A' }
  };
  /* nose shapes: [length of the cab end, path of the front from the roof down, cars] */
  var TC_SHAPE = {
    flat: 16, round: 24, slope: 42, point: 40, voy: 32, box: 7
  };
  var TC_ALIAS = { CC: 'c2c', GN: 'Great Northern', LE: 'Greater Anglia', SE: 'Southeastern', TL: 'Thameslink', XC: 'CrossCountry', NT: 'Northern', VT: 'Avanti West Coast', TP: 'TransPennine Express', GR: 'LNER', GW: 'Great Western Railway', EM: 'East Midlands Railway', SW: 'South Western Railway', SN: 'Southern', CH: 'Chiltern Railways', LM: 'West Midlands Railway', AW: 'Transport for Wales', GC: 'Grand Central', HT: 'Hull Trains', SR: 'ScotRail', ME: 'Merseyrail', GX: 'Gatwick Express', LO: 'London Overground', XR: 'Elizabeth line', LD: 'Lumo',
    'Grand Central Railway': 'Grand Central', 'London North Eastern Railway': 'LNER', 'GWR': 'Great Western Railway', 'TfW': 'Transport for Wales', 'Chiltern': 'Chiltern Railways' };
  function tcOp(o){ o = o || CFG.operator; return TC_ALIAS[o] || o; }
  function tcClass(l){
    var op = tcOp(l.op), a = l.from + '|' + l.to + '|' + (l.stops || []).join('|');
    function has(re){ return re.test(a); }
    var both = function(set){ return set[l.from] && set[l.to]; };
    switch (op) {
      case 'Merseyrail': return ['777', 'round', 4, 1];
      case 'Northern': return both(TC_ELEC) ? ['331', 'flat', 3, 1] : has(/Southport|Kirkby|Ormskirk|Buxton|Clitheroe|Colne|Morecambe|Heysham|Barrow|Windermere|Hexham|Whitby|Middlesbrough|Sheffield|Hull|Scarborough/) ? ['156', 'box', 2, 0] : ['195', 'flat', 3, 0];
      case 'Avanti West Coast': return has(/Chester|Holyhead|Bangor|Llandudno|Wrexham|Shrewsbury|Rhyl/) ? ['805', 'slope', 4, 0] : ['390', 'point', 4, 1];
      case 'TransPennine Express': return has(/Glasgow|Edinburgh|Carlisle|Oxenholme|Lancaster|Penrith/) ? ['397', 'flat', 4, 1] : ['802', 'slope', 4, 1];
      case 'LNER': return ['800', 'slope', 4, 1];
      case 'Great Western Railway': return has(/Paddington|Bristol|Cardiff|Swansea|Exeter|Plymouth|Penzance|Cheltenham|Worcester|Hereford/) ? ['800', 'slope', 4, 1] : ['387', 'flat', 3, 1];
      case 'CrossCountry': return ['220', 'voy', 4, 0];
      case 'East Midlands Railway': return has(/St Pancras/) ? (has(/Corby|Kettering|Luton/) && !has(/Sheffield|Nottingham|Derby/) ? ['360', 'flat', 3, 1] : ['810', 'slope', 4, 1]) : ['158', 'box', 2, 0];
      case 'South Western Railway': return has(/Weymouth|Bournemouth|Southampton|Portsmouth/) ? ['444', 'flat', 4, 1] : ['701', 'flat', 4, 1];
      case 'Southern': return ['377', 'flat', 3, 1];
      case 'Thameslink': return ['700', 'flat', 4, 1];
      case 'Southeastern': return has(/St Pancras|Ashford|Ramsgate|Faversham/) && has(/St Pancras/) ? ['395', 'slope', 3, 1] : ['375', 'flat', 3, 1];
      case 'Chiltern Railways': return ['168', 'box', 3, 0];
      case 'West Midlands Railway': return ['196', 'flat', 3, 0];
      case 'London Northwestern Railway': return ['730', 'flat', 3, 1];
      case 'Transport for Wales': return ['197', 'flat', 2, 0];
      case 'Grand Central': return ['180', 'voy', 4, 0];
      case 'Hull Trains': return ['802', 'slope', 4, 1];
      case 'ScotRail': return ['385', 'flat', 3, 1];
      case 'c2c': return ['720', 'flat', 4, 1];
      case 'Greater Anglia': return has(/Norwich/) && has(/Liverpool Street|Stratford|Colchester|Ipswich/) ? ['745', 'flat', 4, 1] : has(/Lowestoft|Felixstowe|Sheringham|Great Yarmouth|Peterborough/) || (has(/Cambridge/) && has(/Ipswich/)) ? ['755', 'round', 3, 0] : ['720', 'flat', 4, 1];
      case 'Great Northern': case 'Gatwick Express': return ['387', 'flat', 3, 1];
      case 'London Overground': return ['710', 'flat', 4, 1];
      case 'Elizabeth line': return ['345', 'flat', 4, 1];
      case 'Lumo': return ['803', 'slope', 4, 1];
    }
    return ['', 'flat', 3, 1];
  }
  function tcLiv(op){
    if (TC_LIV[op]) return TC_LIV[op];
    var c; try { c = opLine(op); } catch (e) { c = '#00A6E2'; }
    return { body: '#F3F4F5', door: c, band: c, roof: '#A3AAB0' };
  }
  function tcNose(shape, E){
    /* the front of a cab end, ending at x = E, from the roof (y 6) down to the floor (y 34) */
    var L = TC_SHAPE[shape];
    switch (shape) {
      case 'round': return 'M' + (E - L) + ' 6 C' + (E - 6) + ' 6 ' + E + ' 13 ' + E + ' 25 V34';
      case 'slope': return 'M' + (E - L) + ' 6 L' + (E - 16) + ' 11 Q' + (E - 1) + ' 17 ' + E + ' 27 V34';
      case 'point': return 'M' + (E - L) + ' 6 Q' + (E - 12) + ' 9 ' + (E - 3) + ' 22 Q' + E + ' 27 ' + E + ' 30 V34';
      case 'voy': return 'M' + (E - L) + ' 6 Q' + (E - 6) + ' 9 ' + E + ' 24 V34';
      case 'box': return 'M' + (E - L) + ' 6 Q' + E + ' 6 ' + E + ' 11 V34';
    }
    return 'M' + (E - L) + ' 6 Q' + (E - 2) + ' 8 ' + E + ' 22 V34';
  }
  function tcSvg(l){
    var c = tcClass(l), cls = c[0], shape = c[1], n = c[2], elec = c[3], v = tcLiv(tcOp(l.op));
    var L = TC_SHAPE[shape], gap = 4, cw = (296 - gap * (n - 1)) / n, out = '';
    var cars = []; for (var i = 0; i < n; i++) cars.push([2 + i * (cw + gap), 2 + i * (cw + gap) + cw]);
    var intercity = /^(390|800|802|805|810|803|220|180|222|395)$/.test(cls), dmu = shape === 'box';
    function cab(a, b){
      /* a cab car from a to b with the cab at b; the yellow panel and windscreen sit inside the nose */
      var nose = tcNose(shape, b), id = 'tcn' + Math.round(b);
      return '<clipPath id="' + id + '"><path d="M' + a + ' 6 ' + nose.replace(/^M/, 'L') + ' H' + a + ' Z"/></clipPath>' +
        '<path d="M' + a + ' 6 ' + nose.replace(/^M/, 'L') + ' H' + a + ' Z" fill="' + v.body + '"/>' +
        '<g clip-path="url(#' + id + ')"><rect x="' + (b - L * .78) + '" y="19" width="' + L + '" height="16" fill="#F4C21B"/>' +
        '<path d="M' + (b - L * .95) + ' 10 H' + (b - L * .5) + ' L' + (b + 1) + ' 20.5 H' + (b - L * .95) + ' Z" fill="#23272B"/></g>';
    }
    function doorsFor(a, b, endCab){
      var lo = a + 4, hi = b - 4 - (endCab ? L : 0), w = hi - lo, fr = intercity ? [.06, .92] : dmu ? [.12, .86] : n > 3 ? [.3, .72] : [.22, .7];
      if (intercity && endCab) fr = [.08];
      return fr.map(function(f){ var x = Math.round(lo + w * f - 5); return '<g class="door"><rect x="' + x + '" y="10" width="10" height="24" fill="#3A4046"/><rect class="lf" x="' + x + '" y="10" width="5" height="24" fill="' + v.door + '"/><rect class="rt" x="' + (x + 5) + '" y="10" width="5" height="24" fill="' + v.door + '"/></g>'; }).join('');
    }
    cars.forEach(function(ab, i){
      var a = ab[0], b = ab[1], front = i === n - 1, rear = i === 0;
      if (front) out += cab(a, b);
      else if (rear) out += '<g transform="translate(300 0) scale(-1 1)">' + cab(300 - b, 300 - a) + '</g>';
      else out += '<rect x="' + a + '" y="6" width="' + (b - a) + '" height="28" fill="' + v.body + '"/>';
      var wa = a + (rear ? L + 2 : 4), wb = b - (front ? L + 2 : 4);
      out += '<rect x="' + wa + '" y="5" width="' + (b - a - (rear || front ? L : 0) - (rear || front ? 2 : 0)) + '" height="2.5" fill="' + v.roof + '" transform="translate(' + (rear ? 0 : 0) + ' 0)"/>';
      out += '<rect x="' + wa + '" y="11" width="' + Math.max(0, wb - wa) + '" height="8" fill="#23272B"/>';
      out += '<rect x="' + wa + '" y="29.5" width="' + Math.max(0, wb - wa) + '" height="2.5" fill="' + v.band + '"/>';
      var d = doorsFor(a, b, front || rear);
      if (rear) d = '<g transform="translate(300 0) scale(-1 1)">' + doorsFor(300 - b, 300 - a, true) + '</g>';
      out += d;
      out += '<g fill="#1D2125"><circle cx="' + (a + 12) + '" cy="39" r="3.4"/><circle cx="' + (a + 21) + '" cy="39" r="3.4"/><circle cx="' + (b - 21) + '" cy="39" r="3.4"/><circle cx="' + (b - 12) + '" cy="39" r="3.4"/></g>';
    });
    out += '<rect x="2" y="34" width="296" height="3" fill="#3A3F44"/>';
    if (elec) { var px = cars[Math.floor(n / 2)][0] + cw / 2; out += '<path d="M' + (px - 8) + ' 5 L' + (px - 2) + ' 0 L' + (px + 8) + ' 0 M' + (px - 2) + ' 0 L' + (px + 2) + ' 5" stroke="#3A3F44" stroke-width="1.4" fill="none"/>'; }
    else out += '<rect x="' + (cars[0][0] + cw * .55) + '" y="3" width="10" height="3" fill="#3A3F44"/>';
    out += '<rect x="292" y="27" width="3" height="2" fill="#fff"/><rect x="5" y="27" width="3" height="2" fill="#D74949"/>';
    return { svg: '<g>' + out + '</g>', label: cls ? 'Class ' + cls + ', ' + tcOp(l.op) : tcOp(l.op) };
  }
  function tcLegs(trip){
    var ls; try { ls = legList(trip); } catch (e) { ls = [{ op: CFG.operator, from: '', to: '', stops: [] }]; }
    if (trip.legops) ls.forEach(function(l, i){ if (trip.legops[i]) l.op = trip.legops[i]; });
    return ls;
  }
  function tcDraw(tr, legs, k, swap){
    var l = legs[Math.min(k, legs.length - 1)] || { op: CFG.operator, from: '', to: '', stops: [] }, t = tcSvg(l), lab = $('rsCls');
    function put(){ tr.innerHTML = t.svg; if (lab) lab.innerHTML = '<span>Your train</span>' + esc(t.label) + (legs.length > 1 ? '<i>' + (Math.min(k, legs.length - 1) + 1) + ' of ' + legs.length + '</i>' : ''); }
    if (!swap) { put(); return; }
    tr.style.transition = 'opacity .35s ease'; tr.style.opacity = '0';
    setTimeout(function(){ put(); tr.style.opacity = '1'; }, 380);
  }
  /* train-classes, every station on the way: the strip also shows each station where you change across London (or another
     city), with the Tube or Elizabeth line train, or a walk, between them, from the Getting across London steps (london-links.js). */
  var TL_NAME = { bakerloo: 'Bakerloo', central: 'Central', circle: 'Circle', district: 'District', 'hammersmith-city': 'Hammersmith & City', jubilee: 'Jubilee', metropolitan: 'Metropolitan', northern: 'Northern', victoria: 'Victoria', 'waterloo-city': 'Waterloo & City', elizabeth: 'Elizabeth' };
  var TL_COL = { bakerloo: '#B36305', central: '#E32017', circle: '#FFD300', district: '#00782A', 'hammersmith-city': '#F3A9BB', jubilee: '#A0A5A9', metropolitan: '#9B0056', northern: '#000000', victoria: '#0098D4', 'waterloo-city': '#95CDBA', elizabeth: '#6950A1' };
  var TL_SUB = { circle: 1, district: 1, 'hammersmith-city': 1, metropolitan: 1 };
  function tcSame(a, b){
    function k(x){ return String(x || '').toLowerCase().replace(/^london /, '').replace(/ (underground|station)$/, ''); }
    var A = k(a), B = k(b);
    return A === B || (A === 'kings cross st pancras' && (B === 'kings cross' || B === 'st pancras')) || (B === 'kings cross st pancras' && (A === 'kings cross' || A === 'st pancras'));
  }
  function tcSegs(trip){
    var s = trip.s, short = {}, legs = tcLegs(trip), pts = [], segs = [];
    s.forEach(function(p){ short[p[1]] = p[5] || p[1]; });
    var LL = (window.UKAG_LL && window.UKAG_LL.links) || {};
    function add(name, seg, tube){ pts.push([0, 0, 0, 0, 0, short[name] || name.replace(/^London /, ''), tube ? 1 : 0, name]); if (seg) segs.push(seg); }
    function way(a, b){
      var st = LL[a + '|' + b];
      if (!st) { add(b, { kind: 'walk', to: b }); return; }
      st.forEach(function(x, i){
        if (x.w) {
          var dest = st[i + 1] && st[i + 1].fn ? st[i + 1].fn : b;
          if (tcSame(dest, pts[pts.length - 1][7])) return;
          add(tcSame(dest, b) ? b : dest, { kind: 'walk', to: tcSame(dest, b) ? b : dest, mins: x.m }, !tcSame(dest, b));
        } else {
          var to = tcSame(x.tn, b) ? b : x.tn;
          add(to, { kind: 'tube', lines: x.l, to: to, mins: x.m, step: x }, !tcSame(to, b));
        }
      });
      if (!tcSame(pts[pts.length - 1][7], b)) add(b, { kind: 'walk', to: b });
    }
    add(legs[0].walkedFrom || legs[0].from);
    legs.forEach(function(l, i){
      if (l.walkedFrom) way(l.walkedFrom, l.from);
      add(l.to, { kind: 'train', leg: l });
      if (l.walkedTo) way(l.to, l.walkedTo);
    });
    pts.forEach(function(p, i){ if (i && i < pts.length - 1) p[4] = CHG; });
    return { pts: pts, segs: segs };
  }
  function tubeSvg(lines){
    var ln = lines[0], col = TL_COL[ln] || '#0019A8', out = '', n = 4, gap = 3, cw = (296 - gap * (n - 1)) / n;
    if (ln === 'elizabeth') return tcSvg({ op: 'Elizabeth line', from: '', to: '', stops: [] }).svg;
    var sub = TL_SUB[ln], top = sub ? 7 : 13;
    for (var i = 0; i < n; i++) {
      var a = 2 + i * (cw + gap), b = a + cw, f = i === n - 1, r = i === 0;
      var path = 'M' + a + ' 34 V' + (top + 6) + ' Q' + a + ' ' + top + ' ' + (a + (r ? 10 : 5)) + ' ' + top + ' H' + (b - (f ? 10 : 5)) + ' Q' + b + ' ' + top + ' ' + b + ' ' + (top + 6) + ' V34 Z';
      out += '<path d="' + path + '" fill="#F3F4F5"/>';
      if (f) out += '<path d="M' + (b - 7) + ' ' + (top + 1) + ' Q' + b + ' ' + top + ' ' + b + ' ' + (top + 6) + ' V34 H' + (b - 7) + ' Z" fill="#DC241F"/><rect x="' + (b - 6) + '" y="' + (top + 4) + '" width="5" height="6" fill="#23272B"/>';
      if (r) out += '<path d="M' + (a + 7) + ' ' + (top + 1) + ' Q' + a + ' ' + top + ' ' + a + ' ' + (top + 6) + ' V34 H' + (a + 7) + ' Z" fill="#DC241F"/><rect x="' + (a + 1) + '" y="' + (top + 4) + '" width="5" height="6" fill="#23272B"/>';
      var wa = a + (r ? 10 : 4), wb = b - (f ? 10 : 4);
      out += '<rect x="' + wa + '" y="' + (top + 4) + '" width="' + (wb - wa) + '" height="7" fill="#23272B"/>';
      out += '<rect x="' + wa + '" y="' + (top + 14) + '" width="' + (wb - wa) + '" height="2" fill="' + col + '"/>';
      [.25, .68].forEach(function(fr){ var x = Math.round(wa + (wb - wa) * fr - 5); out += '<g class="door"><rect x="' + x + '" y="' + (top + 3) + '" width="10" height="' + (31 - top) + '" fill="#3A4046"/><rect class="lf" x="' + x + '" y="' + (top + 3) + '" width="5" height="' + (31 - top) + '" fill="#DC241F"/><rect class="rt" x="' + (x + 5) + '" y="' + (top + 3) + '" width="5" height="' + (31 - top) + '" fill="#DC241F"/></g>'; });
      out += '<rect x="' + a + '" y="31" width="' + cw + '" height="3" fill="#0019A8"/>';
      out += '<g fill="#1D2125"><circle cx="' + (a + 10) + '" cy="38" r="2.8"/><circle cx="' + (a + 17) + '" cy="38" r="2.8"/><circle cx="' + (b - 17) + '" cy="38" r="2.8"/><circle cx="' + (b - 10) + '" cy="38" r="2.8"/></g>';
    }
    out += '<rect x="2" y="34" width="296" height="2" fill="#3A3F44"/><rect x="292" y="' + (top + 18) + '" width="3" height="2" fill="#fff"/><rect x="5" y="' + (top + 18) + '" width="3" height="2" fill="#D74949"/>';
    return '<g>' + out + '</g>';
  }
  function walkSvg(){
    function man(x, bag){ return '<g transform="translate(' + x + ' 0)" fill="#fff"><circle cx="8" cy="9" r="4"/><path d="M5 14 H11 L12 26 H9 L8 20 L7 26 H4 Z"/><path d="M5 26 L2 37 H5 L8 28 Z M9 26 L13 37 H16 L11 26 Z"/><path d="M5 15 L1 23 L3 24 L6 18 Z M11 15 L15 22 L13 23 L10 18 Z"/>' + (bag ? '<rect x="14" y="22" width="9" height="12" rx="1.5" fill="#F4C21B"/><rect x="17" y="19" width="3" height="3" fill="none" stroke="#F4C21B" stroke-width="1.2"/><circle cx="16" cy="35" r="1.4"/><circle cx="21" cy="35" r="1.4"/>' : '') + '</g>'; }
    return '<g class="walkers">' + man(250, true) + man(276, false) + '</g>';
  }
  function tcSeg(seg){
    if (seg.kind === 'train') return tcSvg(seg.leg);
    if (seg.kind === 'tube') {
      var ln = seg.lines || [], el = ln[0] === 'elizabeth';
      var names = ln.map(function(x){ return TL_NAME[x] || x; });
      var lab = el ? 'Class 345, Elizabeth line' : (names.length > 1 ? names.slice(0, -1).join(', ') + ' or ' + names[names.length - 1] : names[0]) + ' line';
      return { svg: tubeSvg(ln), label: lab + ' to ' + String(seg.to).replace(/^London /, '') + (seg.mins ? ', about ' + seg.mins + ' min' : '') };
    }
    return { svg: walkSvg(), label: 'Walk to ' + String(seg.to).replace(/^London /, '') + (seg.mins ? ', about ' + seg.mins + ' min' : '') };
  }
  function tcDrawSeg(tr, segs, k, swap){
    var seg = segs[Math.min(k, segs.length - 1)], t = tcSeg(seg), lab = $('rsCls');
    var trains = segs.filter(function(x){ return x.kind === 'train'; }).length;
    function put(){
      tr.innerHTML = t.svg; if (!lab) return;
      lab.innerHTML = '<span>' + (seg.kind === 'walk' ? 'On foot' : seg.kind === 'tube' ? 'Across London' : 'Your train') + '</span>' + esc(t.label) + (segs.length > 1 ? '<i>' + (Math.min(k, segs.length - 1) + 1) + ' of ' + segs.length + '</i>' : '');
      /* the Tube and Elizabeth line: the next trains live from TfL (london-links.js) */
      if (seg.kind === 'tube' && seg.step && window.UKAG_LL && window.UKAG_LL.next) window.UKAG_LL.next(seg.step, function(ok, got){
        if (!ok || !got.length || !lab.isConnected) return;
        var m = got[0].m, b = document.createElement('b'); b.className = 'rs-live';
        b.textContent = 'Live: ' + (m < 1 ? 'next train due now' : 'next in ' + m + ' min');
        var old = lab.querySelector('.rs-live'); if (old) old.remove(); lab.appendChild(b);
      });
    }
    if (!swap) { put(); return; }
    tr.style.transition = 'opacity .35s ease'; tr.style.opacity = '0';
    setTimeout(function(){ put(); tr.style.opacity = '1'; }, 380);
  }
