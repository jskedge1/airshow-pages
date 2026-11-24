// ================================================================ The airshow train map
// One continuous map of Great Britain with a camera. Every station, line and change comes from DATA
// (journey-planner.js and london-links.js, see gen-data.mjs); seg() throws if a station is not on the line named.
Object.assign(OPS, {
  lner: { c: '#CE0E2D', ink: '#FFFFFF' }, emr: { c: '#713563', ink: '#FFFFFF' }, thameslink: { c: '#E9438D', ink: '#FFFFFF' },
  c2c: { c: '#B7007C', ink: '#FFFFFF' }, chiltern: { c: '#0099C4', ink: '#FFFFFF' }, swr: { c: '#24398C', ink: '#FFFFFF' },
  se: { c: '#0B8FCF', ink: '#FFFFFF' }, xc: { c: '#660F21', ink: '#FFFFFF', line: '#8E1B33' }, tfw: { c: '#C8102E', ink: '#FFFFFF' },
  mersey: { c: '#FFD600', ink: '#13293C' }, scotrail: { c: '#1E467D', ink: '#FFFFFF' }, tpe: { c: '#1C4C9C', ink: '#FFFFFF' },
  victoria: { c: '#0098D4', ink: '#FFFFFF' }, 'tube-northern': { c: '#000000', ink: '#FFFFFF' }, bakerloo: { c: '#B36305', ink: '#FFFFFF' },
  elizabeth: { c: '#6950A1', ink: '#FFFFFF' }, 'hammersmith-city': { c: '#F3A9BB', ink: '#13293C' }, metropolitan: { c: '#9B0056', ink: '#FFFFFF' }, taxi: { c: '#13293C', ink: '#FFFFFF' }, bus: { c: '#F5B942', ink: '#13293C' },
});
const OPN = { 'Greater Anglia': 'ga', 'c2c': 'c2c', 'LNER': 'lner', 'Avanti West Coast': 'avanti', 'GWR': 'gwr', 'CrossCountry': 'xc',
  'TransPennine Express': 'tpe', 'Northern': 'northern', 'East Midlands Railway': 'emr', 'Thameslink': 'thameslink', 'Great Northern': 'gn',
  'Southern': 'southern', 'Southeastern': 'se', 'South Western Railway': 'swr', 'Chiltern Railways': 'chiltern', 'West Midlands Railway': 'wmr',
  'Transport for Wales': 'tfw', 'Merseyrail': 'mersey', 'ScotRail': 'scotrail' };
const lineCol = (k) => OPS[k].line || OPS[k].c;
const LL = (c) => { if (!DATA.STA[c]) throw new Error('no station ' + c); return [DATA.STA[c][1], DATA.STA[c][2]]; };
const NAME = (c) => DATA.STA[c][0];
const SHORT = (c) => (c === 'LBG' ? NAME(c) : NAME(c).replace(/^London /, ''));
const tk = (k) => (k === 'northern' ? 'tube-northern' : k);   // the Tube's Northern line, not the train company
// the stations from `a` to `b` along a line the site lists (operator, line name)
function seg(op, name, a, b) {
  const L = DATA.LINES.find((l) => l[0] === op && l[1] === name); if (!L) throw new Error('no line ' + op + ' / ' + name);
  const i = L[2].indexOf(a), j = L[2].indexOf(b); if (i < 0 || j < 0) throw new Error(a + ' or ' + b + ' is not on ' + name);
  const codes = i <= j ? L[2].slice(i, j + 1) : L[2].slice(j, i + 1).reverse();
  return { op: OPN[op], opName: op, codes, pts: codes.map(LL) };
}
const whole = (op, name) => { const L = DATA.LINES.find((l) => l[0] === op && l[1] === name); if (!L) throw new Error('no line ' + name); return seg(op, name, L[2][0], L[2][L[2].length - 1]); };

// ---------------------------------------------------------------- layout
const [RX, RY, RW, RH] = pick({ '16x9': [800, 60, 1024, 890], '9x16': [40, 430, 1000, 560] });
const COLX = S.x, COLW = pick({ '16x9': 664, '9x16': 858 });
const LFS = pick({ '16x9': 30, '9x16': 30 });

// ---------------------------------------------------------------- land
// The coastline is COAST (coast.gen.js, Natural Earth). uk = Great Britain, Northern Ireland and the islands; far = neighbours.
const BOXES = { uk: COAST.uk.map((r) => [Math.min(...r.map((q) => q[0])), Math.min(...r.map((q) => q[1])), Math.max(...r.map((q) => q[0])), Math.max(...r.map((q) => q[1]))]), far: null };
BOXES.far = COAST.far.map((r) => [Math.min(...r.map((q) => q[0])), Math.min(...r.map((q) => q[1])), Math.max(...r.map((q) => q[0])), Math.max(...r.map((q) => q[1]))]);
const THAMES = [[-0.215, 51.487], [-0.175, 51.483], [-0.145, 51.485], [-0.125, 51.487], [-0.12, 51.5], [-0.115, 51.508], [-0.095, 51.509], [-0.075, 51.506], [-0.055, 51.503], [-0.03, 51.506]];

// ---------------------------------------------------------------- camera
const KX = Math.cos(52.5 * Math.PI / 180);
function fitBox([lo0, la0, lo1, la1], pad = 0.1) {
  const s = Math.min(RW / ((lo1 - lo0) * KX * (1 + 2 * pad)), RH / ((la1 - la0) * (1 + 2 * pad)));
  return { cx: (lo0 + lo1) / 2, cy: (la0 + la1) / 2, s };
}
const bbox = (pts) => [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
function boxAround(pts, minSpan, maxSpan = 99) {
  let [a, b, c, d] = bbox(pts); const cx = (a + c) / 2, cy = (b + d) / 2;
  const w = clamp((c - a) * KX, minSpan, maxSpan) / KX, h = clamp(d - b, minSpan, maxSpan);
  return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
}
const proj = (v) => ([lo, la]) => [RX + RW / 2 + (lo - v.cx) * KX * v.s, RY + RH / 2 - (la - v.cy) * v.s];
const V_GB = fitBox([-6.1, 49.95, 1.8, 58.7], 0.03), V_MAIN = fitBox([-5.8, 50.0, 1.8, 56.2], 0.04), V_LON = fitBox([-0.186, 51.487, -0.07, 51.54], 0.2);
const CAM = [{ u: -20, v: V_GB, d: 1 }];   // { u: arrive beat, v: view, d: beats the move takes }
const camTo = (u, v, d = 2) => CAM.push({ u, v, d });
function camAt(u) {
  let i = 0; for (let k = 0; k < CAM.length; k++) if (CAM[k].u - CAM[k].d <= u) i = k;
  const B = CAM[i], A = CAM[Math.max(0, i - 1)];
  const p = E.inOutCubic(prog(u, B.u - B.d, B.u));
  return { cx: lerp(A.cx ?? A.v.cx, B.v.cx, p), cy: lerp(A.v.cy, B.v.cy, p), s: Math.exp(lerp(Math.log(A.v.s), Math.log(B.v.s), p)) };
}

// ---------------------------------------------------------------- the things on the map
const LINES = [];   // { pts, op, a, b, dim (beat it turns into a thin ghost), off, thin, dash }
const DOTS = [];    // { at, a, off, r }
const GROUPS = [];  // label groups: { a, off, v, items: [{ text, at | xy(v), kind, a }], avoid: [lonlat] }
const PINS = [];    // { st (station lonlat), at (show lonlat), a, off, jet, how }
const CARDS = [];   // { a, b, edge, title, chips, rows, big }
const HEADS = [];   // { a, tag, title }
const HITS = [];
const hit = (b, name, type, o) => HITS.push(o ? [b, name, type, o] : [b, name, type]);
const dense = (pts) => pts.flatMap((p, i) => (i ? [0.25, 0.5, 0.75, 1].map((f) => [lerp(pts[i - 1][0], p[0], f), lerp(pts[i - 1][1], p[1], f)]) : [p]));
// where the show pin sits on screen: the real bearing from the station, pushed out far enough to read
function pinXY(v, st, at) {
  const pj = proj(v), a = pj(st), b = pj(at); let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1;
  const m = Math.max(d, pick({ '16x9': 120, '9x16': 110 })); return [a[0] + dx / d * m, a[1] + dy / d * m];
}

// ---------------------------------------------------------------- 0. title
const ALLSHOWS = [];   // filled below, in film order
hit(0, 'title', 'impact');

// ---------------------------------------------------------------- 1. the network
const TERMINI = ['EUS', 'KGX', 'STP', 'LST', 'FST', 'PAD', 'MYB', 'WAT', 'VIC', 'CHX', 'LBG'];
const NET = [
  { t: ['EUS'], title: 'London Euston', ops: ['Avanti West Coast'], main: 'West Coast main line', to: 'Birmingham, Manchester, Liverpool, Preston, Glasgow',
    lines: [['Avanti West Coast', 'Euston to Glasgow'], ['Avanti West Coast', 'Euston to Birmingham and Wolverhampton'], ['Avanti West Coast', 'Euston to Manchester'], ['Avanti West Coast', 'Euston to Liverpool']], lab: ['BHM', 'MAN', 'GLC'] },
  { t: ['KGX'], title: 'London Kings Cross', ops: ['LNER', 'Great Northern'], main: 'East Coast main line', to: 'Cambridge, Peterborough, Leeds, York, Newcastle, Edinburgh',
    lines: [['LNER', 'East Coast main line'], ['LNER', 'Kings Cross to Leeds'], ['Great Northern', 'Kings Cross to Cambridge']], lab: ['CBG', 'YRK', 'EDB'] },
  { t: ['STP'], title: 'London St Pancras', ops: ['East Midlands Railway', 'Thameslink', 'Southeastern'], main: 'Midland main line and High Speed 1', to: 'Bedford, Leicester, Nottingham, Sheffield, and fast trains to Kent',
    lines: [['East Midlands Railway', 'St Pancras to Sheffield'], ['East Midlands Railway', 'St Pancras to Nottingham'], ['Southeastern', 'High Speed to Ashford'], ['Thameslink', 'Brighton to Bedford']], lab: ['LEI', 'SHF', 'AFK'] },
  { t: ['LST'], title: 'London Liverpool Street', ops: ['Greater Anglia'], main: 'Great Eastern main line', to: 'Colchester, Clacton, Ipswich, Norwich, Cambridge',
    lines: [['Greater Anglia', 'Liverpool Street to Norwich'], ['Greater Anglia', 'Liverpool Street to Clacton-on-Sea'], ['Greater Anglia', 'Liverpool Street to Cambridge'], ['Greater Anglia', 'Liverpool Street to Southend Victoria']], lab: ['NRW', 'CLT'] },
  { t: ['FST'], title: 'London Fenchurch Street', ops: ['c2c'], main: 'The c2c line', to: 'Barking, Upminster, Basildon, Southend',
    lines: [['c2c', 'Fenchurch Street to Southend']], lab: ['SOC'] },
  { t: ['PAD'], title: 'London Paddington', ops: ['GWR'], main: 'Great Western main line', to: 'Reading, Oxford, Bristol, Cardiff, Swansea, Devon and Cornwall',
    lines: [['GWR', 'Paddington to Swansea'], ['GWR', 'Paddington to Bristol'], ['GWR', 'Paddington to Penzance'], ['GWR', 'Paddington to Cheltenham'], ['GWR', 'Paddington to Oxford']], lab: ['BRI', 'SWA', 'PNZ'] },
  { t: ['MYB'], title: 'London Marylebone', ops: ['Chiltern Railways'], main: 'Chiltern main line', to: 'High Wycombe, Bicester, Oxford, Banbury, Birmingham',
    lines: [['Chiltern Railways', 'Marylebone to Birmingham'], ['Chiltern Railways', 'Marylebone to Oxford']], lab: ['OXF', 'BMO'] },
  { t: ['WAT'], title: 'London Waterloo', ops: ['South Western Railway'], main: 'South Western main line', to: 'Southampton, Bournemouth, Portsmouth, Salisbury, Exeter',
    lines: [['South Western Railway', 'Waterloo to Bournemouth'], ['South Western Railway', 'Waterloo to Portsmouth'], ['South Western Railway', 'Waterloo to Exeter']], lab: ['BMH', 'SAL', 'EXD'] },
  { t: ['VIC'], title: 'London Victoria', ops: ['Southern', 'Southeastern'], main: 'Brighton main line', to: 'Gatwick Airport, Brighton, Eastbourne, and Kent to Dover',
    lines: [['Southern', 'Victoria to Eastbourne'], ['Southern', 'Victoria to Brighton'], ['Southeastern', 'Victoria to Dover']], lab: ['BTN', 'EBN', 'DVP'] },
  { t: ['CHX', 'LBG'], title: 'Charing Cross and London Bridge', ops: ['Southeastern', 'Thameslink'], main: 'South Eastern main line', to: 'Sevenoaks, Tonbridge, Headcorn, Ashford, Hastings',
    lines: [['Southeastern', 'Charing Cross to Ashford via Headcorn'], ['Southeastern', 'Charing Cross to Hastings']], lab: ['HGS', 'HCN'] },
];
const NET_A = 14, NET_L = 37, NET_STEP = 5, EX_A = NET_L + NET.length * NET_STEP + 1;
const EX_END = EX_A + 15 + 14 + 6 * 4.5 + 3 + 20;   // 98
HEADS.push({ a: NET_A, tag: '1  THE NETWORK', title: 'Eleven London stations' });
camTo(NET_A + 2.5, V_LON, 3.5);
hit(NET_A - 1, 'zoom', 'whoosh', { len: 0.8, from: 400, to: 1800 });
CARDS.push({ a: NET_A + 1.5, b: NET_L - 0.5, op: 'avanti', edge: C.teal, title: 'Which station do you need?', rows: [['LONDON HAS', 'Eleven main stations'], ['EACH ONE', 'Serves its own part of the country'], ['SO FIRST', 'Find the one for your show']] });
{
  const g = { a: NET_A, off: NET_L - 2.5, v: V_LON, items: [], avoid: [] };
  TERMINI.forEach((c, i) => {
    const a = NET_A + 3 + i * 1.3; const n = NET.find((x) => x.t.includes(c)); const first = whole(...n.lines[0]);
    DOTS.push({ at: LL(c), a, off: NET_L - 2.5, r: 15, stub: { to: first.pts[first.codes[0] === c ? 1 : 2], op: first.op } });
    g.items.push({ text: SHORT(c), at: LL(c), a });
    hit(a, 'terminus', 'pop', { pitch: ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][i % 6] });
  });
  GROUPS.push(g);
}
HEADS.push({ a: NET_L - 2, tag: '1  THE NETWORK', title: 'The main lines out of London' });
camTo(NET_L, V_MAIN, 3.5);
hit(NET_L - 3, 'zoom out', 'whoosh', { len: 0.8, from: 1800, to: 400 });
NET.forEach((n, i) => {
  const a = NET_L + i * NET_STEP;
  n.lines.forEach((l, j) => { const s = whole(...l); LINES.push({ pts: s.pts, op: s.op, a: a + 0.3 + j * 0.35, b: a + 3.4 + j * 0.35, dim: EX_A - 1, net: true }); });
  n.t.forEach((c) => DOTS.push({ at: LL(c), a, off: a + NET_STEP, r: 12 }));
  GROUPS.push({ a, off: a + NET_STEP - 0.4, v: V_MAIN, items: n.lab.map((c, j) => ({ text: SHORT(c), at: LL(c), a: a + 2.6 + j * 0.3 })), avoid: [] });
  n.lab.forEach((c) => DOTS.push({ at: LL(c), a: a + 2.6, off: a + NET_STEP - 0.4, r: 9 }));
  CARDS.push({ a: a, b: a + NET_STEP, op: OPN[n.ops[0]], edge: lineCol(OPN[n.ops[0]]), title: n.title, chips: n.ops, rows: [['MAIN LINE', n.main], ['GOES TO', n.to]] });
  hit(a + 0.3, 'line', 'whoosh', { len: 0.6, from: 500, to: 1400 + i * 120 }); hit(a, 'card', 'tick');
});

// ---------------------------------------------------------------- 2. the worked example
const TNAME = { victoria: 'Victoria line', circle: 'Circle line', 'hammersmith-city': 'Hammersmith & City', metropolitan: 'Metropolitan line', northern: 'Northern line', bakerloo: 'Bakerloo line', elizabeth: 'Elizabeth line' };
const TB = [
  { k: 'victoria', title: 'Victoria line', pairs: [['VIC', 'EUS'], ['VIC', 'KGX']] },
  { k: 'circle', title: 'Circle line', pairs: [['VIC', 'PAD'], ['VIC', 'LST'], ['PAD', 'KGX'], ['LST', 'KGX']] },
  { k: 'northern', title: 'Northern line', pairs: [['WAT', 'EUS'], ['LBG', 'EUS'], ['LBG', 'KGX']] },
  { k: 'bakerloo', title: 'Bakerloo line', pairs: [['PAD', 'MYB'], ['WAT', 'MYB'], ['WAT', 'PAD']] },
  { k: 'elizabeth', title: 'Elizabeth line', pairs: [['PAD', 'LST']] },
  { k: 'walk', title: 'Or a short walk', walks: [['KGX', 'STP'], ['KGX', 'EUS'], ['LST', 'FST'], ['WAT', 'CHX']] },
];
const TB_STEP = 4.5;
// Tube run times checked against TfL's timetable data on 24 Nov 2026. Where london-links.js gives a shorter time
// than TfL, the film shows TfL's (london-links.js has 12, 18, 2, 9, 12, 11 and 9 for these).
const TFL = { 'VIC-PAD': 18, 'VIC-LST': 22, 'PAD-MYB': 3, 'WAT-MYB': 11, 'WAT-PAD': 14, 'LBG-EUS': 12, 'LBG-KGX': 10 };
const tmin = (x, y, m) => TFL[x + '-' + y] ?? m;
HEADS.push({ a: EX_A, tag: '2  A WORKED EXAMPLE', title: 'Eastbourne to any show' });
const V_SE = fitBox([-0.45, 50.72, 1.3, 51.9], 0.12);
camTo(EX_A + 2.5, V_SE, 3);
hit(EX_A, 'section', 'impact');
{
  const s1 = seg('Southern', 'Victoria to Eastbourne', 'EBN', 'VIC');
  const a1 = EX_A + 2.5, a2 = EX_A + 15, aT = a2 + 14, a3 = aT + TB.length * TB_STEP + 3, end = EX_END;
  LINES.push({ pts: s1.pts, op: 'southern', a: a1 + 0.5, b: a1 + 5, off: end, calls: true });
  hit(a1 + 0.5, 'train', 'whoosh', { len: 1.2, from: 400, to: 1200 });
  DOTS.push({ at: LL('EBN'), a: a1, off: end, r: 14 }, { at: LL('VIC'), a: a1 + 5, off: end, r: 14 });
  GROUPS.push({ a: a1, off: a2 - 2.6, v: V_SE, items: [{ text: 'Eastbourne', at: LL('EBN'), a: a1 }, { text: 'London Victoria', at: LL('VIC'), a: a1 + 5 }], avoid: dense(s1.pts) });
  CARDS.push({ a: EX_A + 1.5, b: a2 - 2, op: 'southern', edge: lineCol('southern'), title: '1. Train to London', chips: ['Southern'], rows: [['FROM', 'Eastbourne'], ['TO', 'London Victoria'], ['HOW LONG', 'About 1 hour 25 minutes'], ['HOW OFTEN', 'Every 30 min, hourly on Sundays']] });
  // across London: the Tube links from Victoria, as london-links.js gives them
  camTo(a2, V_LON, 3);
  hit(a2 - 2.5, 'zoom', 'whoosh', { len: 0.8, from: 400, to: 1800 });
  const TUBE = { victoria: ['victoria', 'Victoria line'], circle: ['circle', 'Circle line'] };
  const links = [['EUS', 'London Euston'], ['KGX', 'London Kings Cross'], ['PAD', 'London Paddington'], ['LST', 'London Liverpool Street']].map(([c, key]) => {
    const st = DATA.VIC[key]; if (!st || st.length !== 1) throw new Error('expected one Tube step to ' + key);
    return { c, line: TUBE[st[0].lines[0]], m: tmin('VIC', c, st[0].m), tn: st[0].to };
  });
  const g = { a: a2 - 1, off: aT - 0.7, v: V_LON, items: [{ text: 'Victoria', at: LL('VIC'), a: a2 - 1 }], avoid: [] };
  TERMINI.forEach((c) => DOTS.push({ at: LL(c), a: a2 - 1.5, off: a3 - 2.6, r: c === 'VIC' ? 15 : 9 }));
  links.forEach((l, i) => {
    const a = a2 + 1 + i * 3;
    LINES.push({ pts: [LL('VIC'), LL(l.c)], op: l.line[0], a, b: a + 1.6, off: aT - 0.5, casing: true });
    DOTS.push({ at: LL(l.c), a: a + 1.4, off: aT - 0.7, r: 15 });
    g.items.push({ text: (l.c === 'KGX' ? 'Kings Cross St Pancras' : SHORT(l.c)) + ', ' + l.m + ' min', at: LL(l.c), a: a + 1.4 });
    g.avoid.push(...dense([LL('VIC'), LL(l.c)]));
    hit(a, 'tube', 'whoosh', { len: 0.5, from: 700, to: 1600 + i * 200 }); hit(a + 1.4, 'tube stop', 'pop', { pitch: ['E5', 'G5', 'A5', 'C6'][i] });
  });
  GROUPS.push(g);
  CARDS.push({ a: a2 - 2, b: aT - 0.2, edge: OPS.victoria.c, title: '2. Cross London by Tube', chips: [['Victoria line', 'victoria'], ['Circle line', 'circle']],
    rows: links.map((l) => [(l.c === 'KGX' ? 'KINGS CROSS ST PANCRAS' : SHORT(l.c).toUpperCase()), l.line[1] + ', about ' + l.m + ' min']) });
  // every other Tube link between the main stations, line by line (london-links.js), and the planner's short walks
  HEADS.push({ a: aT, tag: '2  A WORKED EXAMPLE', title: 'Tube links between stations' });
  const tn = (c) => (c === 'KGX' ? 'Kings Cross St Pancras' : SHORT(c));
  GROUPS.push({ a: aT - 0.4, off: a3 - 2.6, v: V_LON, avoid: [], items: TERMINI.map((c, i) => ({ text: SHORT(c), at: LL(c), a: aT - 0.4 + i * 0.05 })) });
  TERMINI.forEach((c) => DOTS.push({ at: LL(c), a: aT - 0.4, off: a3 - 2.6, r: 13 }));
  TB.forEach((t, j) => {
    const a = aT + j * TB_STEP, rows = [], chips = [];
    (t.pairs || []).forEach(([x, y], i) => {
      const st = DATA.TUBE[x + '-' + y]; if (!st || st.length !== 1 || !st[0].lines.includes(t.k)) throw new Error('no single ' + t.k + ' step from ' + x + ' to ' + y);
      st[0].lines.forEach((l) => { if (!chips.some((q) => q[1] === tk(l))) chips.push([TNAME[l], tk(l)]); });
      rows.push([(st[0].from + ' to ' + st[0].to).toUpperCase(), 'About ' + tmin(x, y, st[0].m) + ' minutes' + (st[0].br ? ', ' + st[0].br + ' branch' : '')]);
      LINES.push({ pts: [LL(x), LL(y)], op: tk(t.k), a: a + 0.3 + i * 0.5, b: a + 1.6 + i * 0.5, off: a + TB_STEP - 0.3, casing: true });
      hit(a + 0.3 + i * 0.5, 'tube', 'whoosh', { len: 0.4, from: 700, to: 1500 + i * 200 });
    });
    (t.walks || []).forEach(([x, y], i) => {
      const w = DATA.WALKS.find((q) => q.a === x && q.b === y); if (!w) throw new Error('no walk ' + x + ' to ' + y);
      rows.push([(SHORT(x) + ' to ' + SHORT(y)).toUpperCase(), 'About ' + w.m + ' minutes on foot']);
      LINES.push({ pts: [LL(x), LL(y)], op: 'walk', a: a + 0.3 + i * 0.5, b: a + 1.4 + i * 0.5, off: a + TB_STEP - 0.3, dash: true });
      hit(a + 0.5 + i * 0.5, 'walk', 'tick');
    });
    if (t.walks) chips.push(['On foot', 'walk']);
    CARDS.push({ a, b: a + TB_STEP, edge: OPS[tk(t.k)].c, title: t.title, chips, rows, one: true });
    hit(a, 'card', 'pop', { pitch: ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][j] });
  });
  HEADS.push({ a: a3 - 2, tag: '2  A WORKED EXAMPLE', title: 'Eastbourne to any show' });
  LINES.push({ pts: [LL('VIC'), LL('LST')], op: 'circle', a: a3 - 2, b: a3 - 0.5, off: end, casing: true });
  // and out again: Liverpool Street to Clacton-on-Sea
  camTo(a3, V_SE, 3);
  hit(a3 - 2.5, 'zoom out', 'whoosh', { len: 0.8, from: 1800, to: 400 });
  const s3 = seg('Greater Anglia', 'Liverpool Street to Clacton-on-Sea', 'LST', 'CLT');
  LINES.push({ pts: s3.pts, op: 'ga', a: a3 + 1, b: a3 + 6, off: end, calls: true });
  hit(a3 + 1, 'train', 'whoosh', { len: 1.2, from: 400, to: 1200 });
  DOTS.push({ at: LL('CLT'), a: a3 + 6, off: end, r: 14 });
  const show = DATA.SHOWS.clacton;
  PINS.push({ st: LL('CLT'), at: show.at, a: a3 + 6.4, off: end, jet: 'hawk', v: V_SE });
  GROUPS.push({ a: a3 - 0.5, off: end - 0.4, v: V_SE, avoid: [...dense(s1.pts), ...dense(s3.pts)], items: [
    { text: 'Eastbourne', at: LL('EBN'), a: a3 - 0.5 }, { text: 'London', at: LL('VIC'), a: a3 - 0.5 }, { text: 'Clacton-on-Sea', at: LL('CLT'), a: a3 + 6 },
    { text: 'Clacton Air Show', xy: (v) => pinXY(v, LL('CLT'), show.at), a: a3 + 7.4, kind: 'show' }] });
  hit(a3 + 7.2, 'show', 'bell', { pitch: 'C6' });
  CARDS.push({ a: a3 - 2, b: end, op: 'ga', edge: lineCol('ga'), title: '3. Train out to the show', chips: ['Greater Anglia'], rows: [['FROM', 'London Liverpool Street'], ['GET OFF', 'Clacton-on-Sea, no change'], ['HOW LONG', 'About 1 hour 26 minutes'], ['THEN', 'Walk, 10 to 15 minutes']] });
}

// ---------------------------------------------------------------- 3. every show
// legs: [operator, line name, from, to] as the site's planner lists them; then: the last leg from SHOWS and the train pages.
const EXTRA_STA = { PGN: ['Paignton', -3.5646, 50.4347] };   // not in the site data: see the README for the source
const SH = [
  { k: 'clacton', from: 'LST', legs: [['Greater Anglia', 'Liverpool Street to Clacton-on-Sea', 'LST', 'CLT']], then: 'Walk, 10 to 15 minutes', how: 'walk', jet: 'hawk', bus: ['BUS FROM COLCHESTER', 'Central Connect 74, 74B and 76'], mode: 'Walk' },
  { k: 'stowmaries', name: 'Stow Maries Air Show', at: [0.632, 51.669], from: 'LST', legs: [['Greater Anglia', 'Liverpool Street to Southend Victoria', 'LST', 'WIC'], ['Greater Anglia', 'Wickford to Southminster', 'WIC', 'SWF']], then: 'Taxi, about 10 minutes', how: 'taxi', jet: 'typhoon', tag: 'NEW TO THE GUIDE', mode: 'Taxi' },
  { k: 'duxford', from: 'KGX', legs: [['Great Northern', 'Kings Cross to Cambridge', 'KGX', 'CBG']], then: 'Free shuttle bus, about 30 min', how: 'shuttle', jet: 'typhoon', bus: ['OR BUS 132', 'Sundays and bank holidays only'], mode: 'Free shuttle' },
  { k: 'gransden', from: 'STP', legs: [['Thameslink', 'Horsham to Peterborough', 'STP', 'SNO']], then: 'Taxi, 15 to 20 minutes', how: 'taxi', jet: 'hawk', bus: ['BUS', 'Whippet 18, but not on Sundays'], mode: 'Taxi' },
  { k: 'shuttleworth', from: 'STP', legs: [['Thameslink', 'Horsham to Peterborough', 'STP', 'BIW']], then: 'Show shuttle bus, £10 return', how: 'shuttle', jet: 'a400', bus: ['BOOK THE SHUTTLE', 'With your show tickets'], mode: 'Shuttle bus' },
  { k: 'eastbourne', from: 'VIC', legs: [['Southern', 'Victoria to Eastbourne', 'VIC', 'EBN']], then: 'Walk, 10 to 15 minutes', how: 'walk', jet: 'hawk', bus: ['OR BUS', 'Route 3 from stop R1'], mode: 'Walk' },
  { k: 'headcorn', from: 'CHX', legs: [['Southeastern', 'Charing Cross to Ashford via Headcorn', 'CHX', 'HCN']], then: 'Taxi or walk, about 1.5 miles', how: 'taxi', jet: 'typhoon', mode: 'Taxi or walk' },
  { k: 'riat', name: 'RIAT 2027, Boscombe Down', from: 'WAT', legs: [['South Western Railway', 'Waterloo to Exeter', 'WAT', 'SAL']], getOff: 'Salisbury, for now', then: 'Shuttles still to be announced', how: 'shuttle', jet: 'a400', mode: 'To be announced' },
  { k: 'riviera', name: 'English Riviera Airshow', at: [-3.5595, 50.4365], from: 'PAD', legs: [['GWR', 'Paddington to Penzance', 'PAD', 'NTA'], ['GWR', null, 'NTA', 'PGN']], change: 'Newton Abbot on some trains', then: 'Walk, about 6 minutes', how: 'walk', jet: 'hawk', tag: 'NEW TO THE GUIDE', mode: 'Walk' },
  { k: 'wales', from: 'PAD', legs: [['GWR', 'Paddington to Swansea', 'PAD', 'SWA']], then: 'Walk, 20 to 25 minutes', how: 'walk', jet: 'typhoon', bus: ['OR BUS', '3A, 2, 2A or 1 along the seafront'], mode: 'Walk or bus' },
  { k: 'cosford', from: 'EUS', legs: [['Avanti West Coast', 'Euston to Birmingham and Wolverhampton', 'EUS', 'BHM'], ['West Midlands Railway', 'Birmingham to Shrewsbury via Cosford', 'BHM', 'COS']], then: 'Walk, about 300 metres', how: 'walk', jet: 'a400', bus: ['BUS', 'None on Sundays. Take the train'], mode: 'Walk' },
  { k: 'midlands', from: 'EUS', legs: [['Avanti West Coast', 'Euston to Birmingham and Wolverhampton', 'EUS', 'BHM'], ['West Midlands Railway', 'Cross City line to Redditch', 'BHM', 'RDC']], then: 'Diamond 247 bus to Ragley Hall', how: 'bus', jet: 'hawk', bus: ['SUNDAY', 'No 247 bus, so book a taxi'], mode: 'Bus 247' },
  { k: 'southport', from: 'EUS', legs: [['Avanti West Coast', 'Euston to Glasgow', 'EUS', 'WGN'], ['Northern', 'Manchester to Southport', 'WGW', 'SOP']], change: 'Wigan (walk between stations)', then: 'Walk, 10 to 15 minutes', how: 'walk', jet: 'typhoon', bus: ['BUS FROM LIVERPOOL', 'Arriva 47 and 300'], mode: 'Walk' },
  { k: 'blackpool', from: 'EUS', legs: [['Avanti West Coast', 'Euston to Glasgow', 'EUS', 'PRE'], ['Northern', 'Manchester to Blackpool North', 'PRE', 'BPN']], then: 'Walk, about 15 min to the Tower', how: 'walk', jet: 'hawk', bus: ['TRAM STOPS OPEN', 'North Pier and Manchester Square'], mode: 'Walk' },
  { k: 'ayr', from: 'EUS', legs: [['Avanti West Coast', 'Euston to Glasgow', 'EUS', 'GLC'], ['ScotRail', 'Glasgow Central to Ayr', 'GLC', 'AYR']], then: 'Walk, about 0.6 miles', how: 'walk', jet: 'typhoon', bus: ['BUS FROM GLASGOW', 'Stagecoach X77'], mode: 'Walk' },
];
Object.entries(EXTRA_STA).forEach(([c, v]) => { DATA.STA[c] = v; });
const SH_A = EX_END, SH_STEP = 9, XC_A = SH_A + SH.length * SH_STEP;
HEADS.push({ a: SH_A, tag: '3  EVERY SHOW', title: 'From London to the gate' });
hit(SH_A, 'section', 'impact');
SH.forEach((s, i) => {
  const D = DATA.SHOWS[s.k] || {}; s.name = s.name || D.name; s.at = s.at || D.at;
  const a = SH_A + i * SH_STEP, off = a + SH_STEP;
  const legs = s.legs.map(([op, name, f, t]) => (name ? seg(op, name, f, t) : { op: OPN[op], opName: op, codes: [f, t], pts: [LL(f), LL(t)] }));
  const dest = legs[legs.length - 1].codes.slice(-1)[0]; s.dest = dest; s.st = LL(dest);
  const all = legs.flatMap((l) => l.pts);
  const vRoute = fitBox(boxAround([...all, s.at], 0.5), 0.14);
  const tail = legs[legs.length - 1].pts;
  const vEnd = fitBox(boxAround([s.st, s.at, tail[Math.max(0, tail.length - 2)]], pick({ '16x9': 0.85, '9x16': 0.6 }), 1.3), 0.12);
  camTo(a + 0.9, vRoute, 1.8); camTo(a + 4.5, vEnd, 1.5);
  const len = legs.map((l) => l.pts.slice(1).reduce((t, p, j) => t + Math.hypot((p[0] - l.pts[j][0]) * KX, p[1] - l.pts[j][1]), 0));
  const tot = len.reduce((x, y) => x + y, 0); let t0 = a + 0.7;
  const gR = { a, off: a + 3.2, v: vRoute, items: [], avoid: dense(all) }, gE = { a, off: off - 0.4, v: vEnd, items: [], avoid: dense(all) };
  const inEnd = (p) => { const [x, y] = proj(vEnd)(p); return x > RX + 60 && x < RX + RW - 60 && y > RY + 40 && y < RY + RH - 40; };
  const addLab = (c, at) => { (inEnd(LL(c)) ? gE : gR).items.push({ text: c === s.from ? NAME(c) : SHORT(c), at: LL(c), a: at }); DOTS.push({ at: LL(c), a: at, off, r: 13 }); };
  addLab(s.from, a + 0.5);
  legs.forEach((l, j) => {
    const d = Math.max(0.5, 2.6 * len[j] / tot);
    LINES.push({ pts: l.pts, op: l.op, a: t0, b: t0 + d, dim: off - 0.3, calls: true, show: true });
    t0 += d;
    if (j < legs.length - 1) { addLab(l.codes[l.codes.length - 1], t0); hit(t0, 'change', 'tick'); }
  });
  hit(a + 0.7, 'route', 'whoosh', { len: 1.2, from: 400, to: 1300 + (i % 5) * 150 });
  addLab(dest, a + 3.3);
  const lab = { text: s.name, xy: (v) => pinXY(v, s.st, s.at), a: a + 5, kind: 'show' };
  PINS.push({ st: s.st, at: s.at, a: a + 4.3, off: 9999, labOff: off - 0.4, jet: s.jet, how: s.how, v: vEnd, lab });
  gE.items.push(lab);
  gE.items.push({ text: s.mode, xy: (v) => { const q = proj(v)(s.st), r = pinXY(v, s.st, s.at); return [(q[0] + r[0]) / 2, (q[1] + r[1]) / 2]; }, a: a + 5.3, kind: 'mode' });
  hit(a + 3.3, 'station', 'pop', { pitch: 'G5' }); hit(a + 4.9, 'show', 'bell', { pitch: ['C6', 'D6', 'E6', 'G6'][i % 4] });
  GROUPS.push(gR, gE);
  const ops = [...new Set(legs.map((l) => l.opName))];
  const change = s.change || (legs.length > 1 ? NAME(legs[0].codes[legs[0].codes.length - 1]) : 'No change');
  CARDS.push({ a: a + 0.2, b: off, op: legs[legs.length - 1].op, edge: lineCol(legs[legs.length - 1].op), title: s.name, chips: ops, tag: s.tag,
    rows: [['FROM LONDON', SHORT(s.from)], ['CHANGE', change], ['GET OFF', s.getOff || NAME(dest)], ['THEN', s.then], ...(s.bus ? [s.bus] : [])] });
  ALLSHOWS.push(s);
});

// ---------------------------------------------------------------- 4. skip London
HEADS.push({ a: XC_A, tag: '4  SKIP LONDON', title: 'North to south, east to west' });
camTo(XC_A + 1.5, V_MAIN, 2.5);
hit(XC_A, 'section', 'impact'); hit(XC_A - 1, 'zoom out', 'whoosh', { len: 0.8, from: 1800, to: 400 });
const XC = [
  { title: 'North to south', ops: ['CrossCountry', 'West Midlands Railway'], lab: ['EDB', 'NCL', 'LDS', 'BHM', 'BRI', 'PLY'],
    lines: [['CrossCountry', 'North East to South West'], ['CrossCountry', 'Manchester to Birmingham'], ['CrossCountry', 'Birmingham to Bournemouth'], ['West Midlands Railway', 'Birmingham to Shrewsbury via Cosford', 'BHM', 'COS'], ['West Midlands Railway', 'Cross City line to Redditch', 'BHM', 'RDC']],
    rows: [['CROSSCOUNTRY', 'Edinburgh, Newcastle, Leeds, Birmingham, Bristol, Plymouth'], ['CHANGE AT BIRMINGHAM', 'For Cosford and Redditch']] },
  { title: 'Up the west side', ops: ['Avanti West Coast', 'Northern', 'Merseyrail', 'ScotRail'], lab: ['BHM', 'LVC', 'MAN', 'PRE', 'GLC'],
    lines: [['Avanti West Coast', 'Birmingham to Glasgow'], ['Northern', 'Manchester to Blackpool North'], ['Northern', 'Manchester to Southport'], ['Merseyrail', 'Northern line to Southport'], ['ScotRail', 'Glasgow Central to Ayr']],
    rows: [['PRESTON', 'Change for Blackpool North'], ['MANCHESTER OR LIVERPOOL', 'Direct trains to Southport'], ['GLASGOW CENTRAL', 'Change for Ayr']] },
  { title: 'East to west', ops: ['TransPennine Express', 'East Midlands Railway', 'CrossCountry'], lab: ['NCL', 'YRK', 'LIV', 'NRW', 'PBO', 'CBG'],
    lines: [['TransPennine Express', 'Newcastle to Liverpool'], ['East Midlands Railway', 'Norwich to Liverpool'], ['CrossCountry', 'Birmingham to Stansted Airport']],
    rows: [['NEWCASTLE, YORK, LEEDS', 'Across to Manchester and Liverpool'], ['PETERBOROUGH', 'Change for St Neots and Biggleswade'], ['CAMBRIDGE', 'The Duxford shuttle bus']] },
  { title: 'Wales and the West', ops: ['Transport for Wales', 'GWR'], lab: ['MAN', 'SHR', 'CDF', 'SWA', 'BRI', 'SAL'],
    lines: [['Transport for Wales', 'Manchester to South Wales'], ['GWR', 'Cardiff to Portsmouth'], ['Transport for Wales', 'Holyhead to Cardiff']],
    rows: [['MANCHESTER, CREWE, SHREWSBURY', 'Direct to Cardiff and Swansea'], ['CARDIFF AND BRISTOL', 'Direct to Salisbury, nearest to RIAT']] },
];
const XC_STEP = 9, END_A = XC_A + 2 + XC.length * XC_STEP;
XC.forEach((x, i) => {
  const a = XC_A + 2 + i * XC_STEP, off = a + XC_STEP;
  x.lines.forEach((l, j) => { const s = l.length > 2 ? seg(...l) : whole(...l); LINES.push({ pts: s.pts, op: s.op, a: a + 0.4 + j * 0.5, b: a + 3.6 + j * 0.5, dim: off - 0.3, xc: true }); });
  GROUPS.push({ a, off: off - 0.4, v: V_MAIN, items: x.lab.map((c, j) => ({ text: SHORT(c).replace(/ (New Street|Piccadilly|Temple Meads|Central|Waverley|Lime Street)$/, ''), at: LL(c), a: a + 1 + j * 0.5 })), avoid: [] });
  x.lab.forEach((c, j) => { DOTS.push({ at: LL(c), a: a + 1 + j * 0.5, off: off - 0.4, r: 10 }); hit(a + 1 + j * 0.5, 'hub', 'pop', { pitch: ['C5', 'E5', 'G5', 'A5', 'C6', 'E6'][j] }); });
  CARDS.push({ a, b: off, op: OPN[x.ops[0]], edge: lineCol(OPN[x.ops[0]]), title: x.title, chips: x.ops, rows: x.rows });
  hit(a + 0.4, 'lines', 'whoosh', { len: 1, from: 400, to: 1500 });
});
hit(END_A - 0.9, 'push', 'whoosh', { len: 0.4 }); hit(END_A, 'end', 'impact'); hit(END_A + 0.6, 'logo', 'bell', { pitch: 'F6' }); hit(END_A + 2.4, 'url', 'pop', { pitch: 'C6' });

// ---------------------------------------------------------------- drawing
const rectHit = (a, b, m = 0) => a[0] < b[0] + b[2] + m && a[0] + a[2] + m > b[0] && a[1] < b[1] + b[3] + m && a[1] + a[3] + m > b[1];
// choose a side for each label of a group once, in the group's own view, so nothing overlaps and nothing jumps
function placeGroup(ctx, g) {
  if (g.done) return; g.done = true;
  const pj = proj(g.v), placed = [];
  const anchors = g.items.map((it) => (it.xy ? it.xy(g.v) : pj(it.at)));
  const avoid = g.avoid.map(pj);
  g.items.forEach((it, i) => {
    ctx.font = fu(LFS, 700);
    const fs = it.kind === 'mode' ? LFS - 4 : LFS; it.fs = fs; ctx.font = fu(fs, 700);
    const w = ctx.measureText(it.text).width + fs * 1.1, h = fs * 1.7, [x, y] = anchors[i], gap = it.kind === 'show' ? 30 : it.kind === 'mode' ? 12 : 24;
    const cands = [[x + gap, y - h / 2], [x - gap - w, y - h / 2], [x - w / 2, y - gap - h], [x - w / 2, y + gap], [x + gap, y - gap - h], [x - gap - w, y - gap - h], [x + gap, y + gap], [x - gap - w, y + gap],
      [x + gap, y - gap - 2 * h], [x - gap - w, y - gap - 2 * h], [x + gap, y + gap + h], [x - gap - w, y + gap + h], [x - w / 2, y - gap - 2.2 * h], [x - w / 2, y + gap + 1.2 * h], [x + 3 * gap, y - h / 2], [x - 3 * gap - w, y - h / 2]];
    let best = null;
    cands.forEach((c, ci) => {
      const r = [c[0], c[1], w, h]; let cost = ci * 3 + (ci >= 8 ? 150 : 0);
      placed.forEach((p) => { if (rectHit(r, p, 8)) cost += 2000; });
      anchors.forEach((q, j) => { if (j !== i && rectHit(r, [q[0] - 22, q[1] - 22, 44, 44])) cost += 900; });
      avoid.forEach((q) => { if (rectHit(r, [q[0] - 9, q[1] - 9, 18, 18])) cost += 40; });
      if (r[0] < RX + 10 || r[0] + w > RX + RW - 10 || r[1] < RY + 10 || r[1] + h > RY + RH - 10) cost += 1500;
      if (!best || cost < best.cost) best = { cost, ox: c[0] - x, oy: c[1] - y, w, h };
    });
    placed.push([x + best.ox, y + best.oy, w, h]); it.p = best;
  });
}
function strokeTo(ctx, xy, p) {
  const L = xy.slice(1).map((q, i) => Math.hypot(q[0] - xy[i][0], q[1] - xy[i][1])); let left = L.reduce((s, v) => s + v, 0) * p, tip = xy[0];
  ctx.beginPath(); ctx.moveTo(xy[0][0], xy[0][1]);
  for (let i = 0; i < L.length && left > 0; i++) { const f = Math.min(1, left / (L[i] || 1)); tip = [lerp(xy[i][0], xy[i + 1][0], f), lerp(xy[i][1], xy[i + 1][1], f)]; ctx.lineTo(tip[0], tip[1]); left -= L[i]; }
  return tip;
}
const fadeOut = (u, off) => (off == null ? 1 : 1 - prog(u, off, off + 0.5));

function drawMap(ctx, u, IMG) {
  const v = camAt(u), pj = proj(v);
  GROUPS.forEach((g) => placeGroup(ctx, g));
  // frame shadow, sea, neighbours, then the land with a pale shore and a soft drop shadow
  ctx.fillStyle = 'rgba(14,33,49,0.18)'; ctx.fillRect(RX + 10, RY + 12, RW, RH);
  ctx.save(); ctx.beginPath(); ctx.rect(RX, RY, RW, RH); ctx.clip();
  const sg = ctx.createLinearGradient(0, RY, 0, RY + RH); sg.addColorStop(0, '#A9DBF0'); sg.addColorStop(1, '#8CCAE6');
  ctx.fillStyle = sg; ctx.fillRect(RX, RY, RW, RH);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.lineCap = 'round';   // little waves, drifting
  for (let gy = 0; gy < RH / 70 + 1; gy++) for (let gx = -1; gx < RW / 150 + 1; gx++) {
    const wx = RX + gx * 150 + (gy % 2) * 75 + ((u * 3) % 150), wy = RY + 30 + gy * 70 + Math.sin(u * 0.6 + gx + gy) * 3;
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 11, wy - 8, wx + 22, wy); ctx.quadraticCurveTo(wx + 33, wy + 8, wx + 44, wy); ctx.stroke();
  }
  const lo0 = v.cx - RW / 2 / (KX * v.s), lo1 = v.cx + RW / 2 / (KX * v.s), la0 = v.cy - RH / 2 / v.s, la1 = v.cy + RH / 2 / v.s;
  const land = (key) => { ctx.beginPath(); COAST[key].forEach((r, n) => { const b = BOXES[key][n]; if (b[2] < lo0 || b[0] > lo1 || b[3] < la0 || b[1] > la1) return;
    r.forEach((q, i) => { const [x, y] = pj(q); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }); };
  ctx.lineJoin = 'round';
  land('far'); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = '#DCE6D3'; ctx.fill();
  ctx.save(); ctx.translate(0, 9); land('uk'); ctx.fillStyle = 'rgba(19,41,60,0.16)'; ctx.fill(); ctx.restore();
  land('uk'); ctx.strokeStyle = '#F3F8E6'; ctx.lineWidth = 12; ctx.stroke();
  const lg = ctx.createLinearGradient(0, RY, 0, RY + RH); lg.addColorStop(0, '#D6ECBF'); lg.addColorStop(1, '#C4E2AC');
  ctx.fillStyle = lg; ctx.fill(); ctx.strokeStyle = '#86BE7A'; ctx.lineWidth = 2.5; ctx.stroke();
  const zl = prog(v.s, 2500, 7000);   // the Thames, once we are close to London
  if (zl > 0) { ctx.globalAlpha = zl; ctx.strokeStyle = '#9BD2EA'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); THAMES.forEach((p, i) => { const [x, y] = pj(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const WM = pick({ '16x9': 12, '9x16': 11 });
  // ghosts first, then live lines
  for (let pass = 0; pass < 2; pass++) LINES.forEach((l) => {
    if (u < l.a) return;
    const ghost = l.dim != null && u >= l.dim + 0.6;
    if ((pass === 0) !== ghost) return;
    const al = fadeOut(u, l.off); if (al <= 0) return;
    const p = E.inOutCubic(prog(u, l.a, l.b)), xy = l.pts.map(pj);
    const g = l.dim != null ? prog(u, l.dim, l.dim + 0.6) : 0;
    ctx.save(); ctx.globalAlpha = al * lerp(1, l.net ? 0.3 : 0.4, g);
    const tip = strokeTo(ctx, xy, p), w = lerp(l.net || l.xc ? WM * 0.75 : WM, 5, g);
    if (g < 1 && !l.dash) { ctx.strokeStyle = C.navy; ctx.lineWidth = w + 8 * (1 - g); ctx.stroke(); }
    if (l.dash) { ctx.setLineDash([3, 20]); ctx.strokeStyle = C.navy; ctx.lineWidth = 9; ctx.stroke(); ctx.setLineDash([]); } else { ctx.strokeStyle = lineCol(l.op); ctx.lineWidth = w; ctx.stroke(); }
    if (l.calls && g < 0.5) l.pts.forEach((q, i) => {   // every calling point the site lists
      if (!i || i === l.pts.length - 1) return; const f = i / (l.pts.length - 1); if (p < f) return; const [x, y] = xy[i];
      ctx.fillStyle = '#FFF'; ctx.fillRect(x - 4.5, y - 4.5, 9, 9);
    });
    if (l.calls && p >= 1 && g <= 0) {   // little white lights run along a finished route, towards the show
      const SL = xy.slice(1).map((q, i) => Math.hypot(q[0] - xy[i][0], q[1] - xy[i][1])), tot = SL.reduce((a, b) => a + b, 0), n = Math.max(1, Math.round(tot / 240));
      for (let k = 0; k < n; k++) { let d = (((u - l.b) * 0.22 + k / n) % 1) * tot, i = 0; while (i < SL.length - 1 && d > SL[i]) { d -= SL[i]; i++; }
        const f = SL[i] ? d / SL[i] : 0, x = lerp(xy[i][0], xy[i + 1][0], f), y = lerp(xy[i][1], xy[i + 1][1], f);
        ctx.fillStyle = '#FFF'; ctx.fillRect(x - 5, y - 5, 10, 10); }
    }
    if (p > 0 && p < 1 && !l.dash) { ctx.fillStyle = '#FFF'; ctx.fillRect(tip[0] - 11, tip[1] - 11, 22, 22); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.strokeRect(tip[0] - 11, tip[1] - 11, 22, 22); }
    ctx.restore();
  });
  // show pins: the last leg (dashed), the red square and a real aircraft
  PINS.forEach((p) => {
    if (u < p.a) return; const al = fadeOut(u, p.off); if (al <= 0) return;
    const [sx, sy] = pj(p.st); const live = u < (p.labOff ?? p.off);
    let [x, y] = pinXY(v, p.st, p.at);
    const settle = p.labOff != null ? prog(u, p.labOff, p.labOff + 0.6) : 0;   // afterwards the pin sits on its true spot
    const tr = pj(p.at); x = lerp(x, tr[0], settle); y = lerp(y, tr[1], settle);
    const k = T.pop(u, p.a + 0.6), lp = E.outCubic(prog(u, p.a, p.a + 0.8));
    ctx.save(); ctx.globalAlpha = al;
    if (settle < 1) { ctx.save(); ctx.globalAlpha = al * (1 - settle); ctx.strokeStyle = C.navy; ctx.lineWidth = 7; ctx.setLineDash([2, 16]); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(lerp(sx, x, lp), lerp(sy, y, lp)); ctx.stroke(); ctx.restore(); }
    const r = lerp(18, 9, settle);
    if (live && k > 0.9) { const ph = ((u - p.a) % 2) / 2; ctx.save(); ctx.globalAlpha = al * (1 - ph) * 0.7; ctx.strokeStyle = C.red; ctx.lineWidth = 5; const rr = 20 + ph * 34; ctx.strokeRect(x - rr, y - rr, 2 * rr, 2 * rr); ctx.restore(); }
    T.scaled(ctx, k, x, y, () => { ctx.fillStyle = C.red; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.strokeStyle = C.navy; ctx.lineWidth = lerp(5, 4, settle); ctx.strokeRect(x - r, y - r, 2 * r, 2 * r); });
    if (live && p.jet) { const jk = T.pop(u, p.a + 1.1) * (1 - settle), lp2 = p.lab && p.lab.p, lcx = lp2 ? lp2.ox + lp2.w / 2 : 100, lcy = lp2 ? lp2.oy + lp2.h / 2 : 0;
      const side = Math.abs(lcx) > 40 ? -Math.sign(lcx) : (x > RX + RW * 0.6 ? -1 : 1), jy = lcy < -30 ? 74 : -74;
      const jx = x + side * 110 + Math.sin(u * 1.5) * 8, jyy = y + jy + Math.cos(u * 1.1) * 5;
      if (jk > 0.5) { ctx.save(); ctx.lineCap = 'round'; for (let n = 0; n < 3; n++) { ctx.globalAlpha = al * (1 - settle) * (0.75 - n * 0.2); ctx.strokeStyle = '#FFF'; ctx.lineWidth = 9 - n * 2.5;
        ctx.beginPath(); ctx.moveTo(jx - side * (70 + n * 46), jyy + side * (n * 9) * 0.2 + 4 + n * 3); ctx.lineTo(jx - side * (112 + n * 46), jyy + 6 + n * 4.5); ctx.stroke(); } ctx.restore(); }
      T.scaled(ctx, jk, x, y, () => T.jet(ctx, jx, jyy, 0.5, side > 0 ? -0.18 + Math.sin(u) * 0.06 : Math.PI + 0.18, { kind: p.jet })); }
    ctx.restore();
  });
  // station squares
  DOTS.forEach((d) => {
    if (u < d.a) return; const al = fadeOut(u, d.off); if (al <= 0) return;
    const [x, y] = pj(d.at), k = T.pop(u, d.a);
    ctx.save(); ctx.globalAlpha = al;
    if (d.stub) { const q = pj(d.stub.to), dx = q[0] - x, dy = q[1] - y, m = Math.hypot(dx, dy) || 1, len = 78 * E.outCubic(prog(u, d.a + 0.2, d.a + 1));
      ctx.strokeStyle = C.navy; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx / m * len, y + dy / m * len); ctx.stroke();
      ctx.strokeStyle = lineCol(d.stub.op); ctx.lineWidth = 12; ctx.stroke(); }
    T.scaled(ctx, k, x, y, () => { ctx.fillStyle = '#FFF'; ctx.fillRect(x - d.r, y - d.r, 2 * d.r, 2 * d.r); ctx.strokeStyle = C.navy; ctx.lineWidth = d.r > 10 ? 6 : 4; ctx.strokeRect(x - d.r, y - d.r, 2 * d.r, 2 * d.r); });
    ctx.restore();
  });
  // labels
  GROUPS.forEach((g) => {
    if (u < g.a || u > g.off + 0.6) return; placeGroup(ctx, g);
    g.items.forEach((it) => {
      const k = T.pop(u, it.a, SPRING.snappy); if (k <= 0) return;
      const [x, y] = it.xy ? it.xy(v) : pj(it.at), bx = x + it.p.ox, by = y + it.p.oy;
      ctx.save(); ctx.globalAlpha = fadeOut(u, g.off);
      T.scaled(ctx, Math.min(k, 1.06), x, y, () => { ctx.fillStyle = '#FFF'; ctx.fillRect(bx - 4, by - 4, it.p.w + 8, it.p.h + 8); T.pill(ctx, it.text, bx, by + it.p.h / 2, it.fs, it.kind === 'show' ? C.red : it.kind === 'mode' ? C.amber : C.navy, it.kind === 'mode' ? C.navy : '#FFF'); });
      ctx.restore();
    });
  });
  // the opening: every show pops on to the map, and the Red Arrows cross it
  if (u < NET_A + 3) {
    const al = 1 - prog(u, NET_A, NET_A + 2);
    ctx.save(); ctx.globalAlpha = al;
    ALLSHOWS.forEach((s, i) => { const [x, y] = pj(s.at), k = T.pop(u, 2 + i * 0.55); T.scaled(ctx, k, x, y, () => { ctx.fillStyle = C.red; ctx.fillRect(x - 13, y - 13, 26, 26); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.strokeRect(x - 13, y - 13, 26, 26); }); });
    ctx.restore();
    T.redArrows(ctx, prog(u, 5, 12), RX - 300, RX + RW + 400, RY + RH * 0.3, 0.5);
  }
  ctx.restore();
  ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.strokeRect(RX, RY, RW, RH);
}
[...ALLSHOWS.keys()].forEach((i) => hit(2 + i * 0.55, 'pin', 'tick'));
hit(5, 'red arrows', 'whoosh', { len: 2.5, from: 300, to: 2400 });

// ---------------------------------------------------------------- the words
function chipRow(ctx, chips, x, y, maxW, size, measure = null) {
  let cx = x, cy = y; const h = size * 1.7;
  chips.forEach((c) => {
    const [txt, k] = Array.isArray(c) ? c : [c, OPN[c]]; (measure || ctx).font = fu(size, 700);
    const w = (measure || ctx).measureText(txt).width + size * 1.1;
    if (cx + w > x + maxW && cx > x) { cx = x; cy += h + 10; }
    if (measure) { cx += w + 12; return; }
    T.pill(ctx, txt, cx, cy, size, OPS[k].c, OPS[k].ink || '#FFF'); ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.strokeRect(cx, cy - h / 2, w, h);
    cx += w + 12;
  });
  return cy + h / 2 - y;
}
function drawCard(ctx, u, c) {
  const k = E.outCubic(prog(u, c.a, c.a + 0.6)), out = 1 - prog(u, c.b - 0.4, c.b); if (k <= 0 || out <= 0) return;
  const x = COLX, w = COLW, pad = 30, tw = w - pad * 2;
  const tS = pick({ '16x9': 62, '9x16': 58 }), lS = pick({ '16x9': 26, '9x16': 26 }), vS = pick({ '16x9': c.rows.length >= 5 ? 36 : 38, '9x16': 34 }), cS = pick({ '16x9': 28, '9x16': 27 });
  const two = P && c.rows.length > 2 && !c.one, colW = two ? (tw - 24) / 2 : tw, big = c.rows.length >= 5;
  // measure
  let ts = tS; ctx.font = fd(ts); if (P) while (ctx.measureText(c.title).width > tw && ts > 40) { ts -= 2; ctx.font = fd(ts); }
  const tl = T.wrap(ctx, c.title, fd(ts), tw), tlh = ts * 1.02;
  const rows = c.rows.map(([l, val], i) => ({ l, lines: T.wrap(ctx, val, fu(vS, 600), two && i === c.rows.length - 1 && i % 2 === 0 ? tw : colW) }));
  const rh = (r) => lS + 10 + r.lines.length * vS * 1.2 + (big ? 11 : 16);
  let rowsH = 0; if (two) for (let i = 0; i < rows.length; i += 2) rowsH += Math.max(rh(rows[i]), rows[i + 1] ? rh(rows[i + 1]) : 0); else rows.forEach((r) => { rowsH += rh(r); });
  const chipH = c.chips ? chipRow(null, c.chips, 0, 0, tw, cS, ctx) + cS * 0.85 + 18 : 0, tagH = c.tag ? 44 : 0;
  const h = 12 + 22 + tagH + tl.length * tlh + 10 + chipH + rowsH + 8;
  let hh = null; HEADS.forEach((x) => { if (c.a >= x.a - 0.6) hh = x; });
  const y = pick({ '16x9': hh ? headBox(ctx, hh).y + headBox(ctx, hh).h + 26 : 330, '9x16': 1012 });
  ctx.save(); ctx.globalAlpha = k * out; ctx.translate(0, (1 - k) * 40);
  T.card(ctx, x, y, w, h, { edge: c.edge, edgeH: 12 }); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
  let cy = y + 12 + 22;
  if (c.tag) { T.pill(ctx, c.tag, x + pad, cy + 14, 22, C.amber, C.navy); cy += tagH; }
  ctx.font = fd(ts); ctx.fillStyle = C.navy; ctx.textAlign = 'left'; tl.forEach((s, i) => ctx.fillText(s, x + pad, cy + ts * 0.82 + i * tlh)); cy += tl.length * tlh + 10;
  if (c.chips) { chipRow(ctx, c.chips, x + pad, cy + cS * 0.85, tw, cS); cy += chipH; }
  const drawRow = (r, rx, ry) => { ctx.fillStyle = c.edge; ctx.fillRect(rx, ry + lS - 17, 14, 14); ctx.font = fu(lS, 700); ctx.fillStyle = C.tealText; ctx.textAlign = 'left'; ctx.fillText(r.l, rx + 24, ry + lS); ctx.font = fu(vS, 600); ctx.fillStyle = C.navy; r.lines.forEach((s, i) => ctx.fillText(s, rx, ry + lS + 10 + vS * 0.95 + i * vS * 1.2)); };
  if (two) for (let i = 0; i < rows.length; i += 2) { drawRow(rows[i], x + pad, cy); if (rows[i + 1]) drawRow(rows[i + 1], x + pad + colW + 24, cy); cy += Math.max(rh(rows[i]), rows[i + 1] ? rh(rows[i + 1]) : 0); }
  else rows.forEach((r) => { drawRow(r, x + pad, cy); cy += rh(r); });
  ctx.restore();
}
// where the section bar sits; its height follows the title (one or two lines)
function headBox(ctx, h) {
  const ts = pick({ '16x9': 62, '9x16': 60 }), pad = pick({ '16x9': 28, '9x16': 72 });
  const x = pick({ '16x9': COLX, '9x16': 0 }), w = pick({ '16x9': COLW, '9x16': W }), y = pick({ '16x9': 60, '9x16': 236 });
  const n = P ? 1 : T.wrap(ctx, h.title, fd(ts), w - 2 * pad).length;
  const py = y + pick({ '16x9': 46, '9x16': 44 }), ty = py + pick({ '16x9': 84, '9x16': 92 });
  return { x, y, w, pad, ts, py, ty, h: ty + (n - 1) * ts * 1.04 + 34 - y };
}
function drawWords(ctx, u) {
  // the title block, then the section headers
  if (u < NET_A) {
    const o = 1 - prog(u, NET_A - 0.8, NET_A - 0.2); ctx.save(); ctx.globalAlpha = o;
    const pk = T.pop(u, 1.5); T.scaled(ctx, pk, COLX + 120, pick({ '16x9': 130, '9x16': 290 }), () => T.pill(ctx, 'Plan your airshow trip', COLX, pick({ '16x9': 130, '9x16': 290 }), 32, C.purple, '#FFF'));
    if (P) T.heading(ctx, u, -1.1, 'AIRSHOWS BY TRAIN', COLX, 410, 96, C.navy, C.red, 1);
    else { T.heading(ctx, u, -1.1, 'AIRSHOWS', COLX, 310, 150, C.navy); T.heading(ctx, u, -0.8, 'BY TRAIN', COLX, 450, 150, C.red); }
    const lk = E.outCubic(prog(u, 2, 2.8));
    if (lk > 0) { ctx.globalAlpha = o * lk; const y = pick({ '16x9': 540, '9x16': 1070 });
      T.lines(ctx, 'The map of every line, every change and the last leg to the show.', COLX, y, fu(pick({ '16x9': 42, '9x16': 44 }), 600), C.body, COLW, pick({ '16x9': 54, '9x16': 56 }));
      const ck = T.pop(u, 4); T.scaled(ctx, ck, COLX + 100, y + 170, () => { const w1 = T.pill(ctx, ALLSHOWS.length + ' airshows', COLX, y + 170, 36, C.red, '#FFF'); T.pill(ctx, '11 London stations', COLX + w1 + 14, y + 170, 36, C.navy, '#FFF'); });
    }
    ctx.restore();
  }
  let h = null; HEADS.forEach((x) => { if (u >= x.a - 0.6) h = x; });
  if (h) {
    // the section bar: a navy block with the part number, the title and four progress squares
    const nx = HEADS[HEADS.indexOf(h) + 1], o = nx ? 1 - prog(u, nx.a - 1, nx.a - 0.6) : 1;
    const k = springU(u, h.a - 0.6, SPRING.snappy), bk = E.outCubic(prog(u, NET_A - 0.6, NET_A + 0.4));
    const hb = headBox(ctx, h);
    const cur = HEADS.filter((x) => x.a - 0.6 <= u).pop(), part = Number(cur.tag[0]);
    ctx.save(); ctx.globalAlpha = bk;
    ctx.fillStyle = 'rgba(14,33,49,0.18)'; ctx.fillRect(hb.x + 8, hb.y + 10, hb.w, hb.h);
    ctx.fillStyle = C.navy; ctx.fillRect(hb.x, hb.y, hb.w, hb.h); ctx.fillStyle = C.teal; ctx.fillRect(hb.x, hb.y + hb.h - 8, hb.w, 8);
    const sq = 34, sx0 = hb.x + hb.w - hb.pad - 4 * (sq + 10) + 10;
    for (let n = 1; n <= 4; n++) { const x = sx0 + (n - 1) * (sq + 10), y = hb.py - sq / 2;
      if (n < part) { ctx.fillStyle = C.teal; ctx.fillRect(x, y, sq, sq); T.tick(ctx, x + sq / 2, y + sq / 2, sq / 2); }
      else if (n === part) { ctx.fillStyle = C.amber; ctx.fillRect(x, y, sq, sq); M.text(ctx, String(n), x + sq / 2, y + sq / 2 + 9, fu(26, 700), C.navy, 'center'); }
      else { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, sq - 3, sq - 3); M.text(ctx, String(n), x + sq / 2, y + sq / 2 + 9, fu(24, 700), 'rgba(255,255,255,0.7)', 'center'); } }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = clamp(k) * o; ctx.beginPath(); ctx.rect(hb.x, hb.y, hb.w, hb.h); ctx.clip(); ctx.translate((1 - k) * -80, 0);
    T.pill(ctx, h.tag.slice(3), hb.x + hb.pad, hb.py, 28, '#FFFFFF', C.navy);
    T.lines(ctx, h.title, hb.x + hb.pad, hb.ty, fd(hb.ts), '#FFFFFF', hb.w - 2 * hb.pad, hb.ts * 1.04);
    ctx.restore();
  }
  CARDS.forEach((c) => { if (u >= c.a && u < c.b) drawCard(ctx, u, c); });
  if (!P && u > NET_A) { const note = 'Times are a guide. Check the summer 2027 timetable.'; M.text(ctx, note, RX + RW, 1000, fu(26, 600), C.body, 'right'); }
}
const lookOf = (k) => OPS[k].look || { body: '#FFFFFF', stripe: OPS[k].c, door: OPS[k].c, roof: '#8A8C8E', nose: OPS[k].c, window: '#24323E' };
// sky and clouds behind everything, and a train in the current company's colours running along the bottom
function backdrop(ctx, u) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#D3EEF9'); g.addColorStop(pick({ '16x9': 0.5, '9x16': 0.3 }), C.light); g.addColorStop(1, C.light);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  T.clouds(ctx, u, pick({ '16x9': 4, '9x16': 4 }), 11, pick({ '16x9': 20, '9x16': 50 }), pick({ '16x9': 60, '9x16': 190 }), 5, 0.85, pick({ '16x9': 0.35, '9x16': 0.6 }), pick({ '16x9': 0.6, '9x16': 1 }));
  const ry = pick({ '16x9': 1060, '9x16': 1800 }), ts = pick({ '16x9': 0.26, '9x16': 0.5 });
  ctx.fillStyle = C.grass; ctx.fillRect(0, ry + 6, W, H - ry); ctx.fillStyle = C.grassDark; ctx.fillRect(0, ry + 6, W, 5);
  T.rails(ctx, ry + 4, '#5A6670', '#7C6A56', 0, pick({ '16x9': 0.5, '9x16': 0.8 }));
  if (u < NET_A) return;
  let c = null; CARDS.forEach((x) => { if (u >= x.a && u < x.b && x.op) c = x; });
  // one train per card, in that company's colours, crossing while the card is up
  if (c) { const ph = prog(u, c.a, c.b), len = 3 * 444 * ts; T.train(ctx, lerp(-40, W + len + 40, ph), ry, ts, 3, lookOf(c.op), u); }
}
function mapFilm(ctx, u, IMG) { backdrop(ctx, u); drawMap(ctx, u, IMG); drawWords(ctx, u); }

// ---------------------------------------------------------------- end card
const ENDC = { line: 'Find your train to every show', url: 'ukairshowguide.co.uk/airshow-public-transport', note: 'Times are a guide. Check the summer 2027 timetable before you travel.' };
function end(ctx, u, a, IMG) {
  T.sky(ctx);
  T.clouds(ctx, u, 5, 4, 80, 420, 8, 0.9);
  ctx.fillStyle = C.grass; ctx.fillRect(0, H * 0.86, W, H);
  T.redArrows(ctx, prog(u, a - 1, a + 3.5), -300, W + 400, pick({ '16x9': 130, '9x16': 300 }), 0.6);
  const lk = T.pop(u, a + 0.6);
  if (lk > 0 && IMG.logo) { const lw = pick({ '16x9': 600, '9x16': 760 }), lh = lw * IMG.logo.height / IMG.logo.width, ly = pick({ '16x9': 330, '9x16': 640 }); T.scaled(ctx, lk, W / 2, ly, () => ctx.drawImage(IMG.logo, W / 2 - lw / 2, ly - lh / 2, lw, lh)); }
  const tk = E.outQuint(prog(u, a + 1.4, a + 2.2));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * tk, H); ctx.clip();
  T.lines(ctx, ENDC.line, W / 2, pick({ '16x9': 640, '9x16': 1000 }), fd(pick({ '16x9': 84, '9x16': 92 })), C.navy, pick({ '16x9': 1600, '9x16': 860 }), pick({ '16x9': 90, '9x16': 100 }), 'center');
  ctx.restore();
  const uk = T.pop(u, a + 2.4, SPRING.snappy);
  if (uk > 0) {
    let us = 50; ctx.font = fu(us, 700); while (ctx.measureText(ENDC.url).width + 90 > pick({ '16x9': W - 80, '9x16': 980 }) && us > 28) { us -= 2; ctx.font = fu(us, 700); }
    const uw = ctx.measureText(ENDC.url).width + 90, uy = pick({ '16x9': 760, '9x16': 1250 });
    T.scaled(ctx, uk, W / 2, uy, () => { ctx.fillStyle = C.teal; ctx.fillRect(W / 2 - uw / 2, uy - 52, uw, 84); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.strokeRect(W / 2 - uw / 2, uy - 52, uw, 84); M.text(ctx, ENDC.url, W / 2, uy + 6, fu(us, 700), '#FFF', 'center'); });
  }
  const nk = E.outCubic(prog(u, a + 3.4, a + 4.2));
  if (nk > 0) { ctx.save(); ctx.globalAlpha = nk; T.lines(ctx, ENDC.note, W / 2, pick({ '16x9': 868, '9x16': 1370 }), fu(pick({ '16x9': 34, '9x16': 36 }), 600), C.navy, pick({ '16x9': 1300, '9x16': 800 }), 46, 'center'); ctx.restore(); }
  T.person(ctx, 230, pick({ '16x9': 1040, '9x16': 1720 }), pick({ '16x9': 0.75, '9x16': 0.7 }), { face: 1, pack: true, wave: 1, waveT: u * 0.4, blink: blinkAt(u), mouth: 'open' });
}

// ---------------------------------------------------------------- assembly
const SC = [{ a: -10, b: END_A, draw: null }, { a: END_A, b: 9999, push: 'up', draw: null }];
window.MAPFILM = { END_A, beats: END_A + 22, shows: ALLSHOWS.map((s) => ({ name: s.name, station: NAME(s.dest), then: s.then })) };
M.film({
  fonts: [fd(100), fu(40, 700), fu(40, 600)],
  images: { logo: 'assets/logo.png', hawk: 'assets/aircraft/hawk-side.webp', typhoon: 'assets/aircraft/typhoon-side.webp', a400: 'assets/aircraft/a400m-side.webp' },
  hits: HITS.sort((a, b) => a[0] - b[0]),
  samples: 4,
  draw(ctx, u, t, IMG) {
    T.setAircraft(IMG);
    SC[0].draw = (c, uu) => mapFilm(c, uu, IMG); SC[1].draw = (c, uu) => end(c, uu, END_A, IMG);
    T.sequence(ctx, u, SC, 0.9);
  },
});
