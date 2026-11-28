//@@COPY
// Facts from the site's own data: train-routes-src/eastbourne-cfg.json, clacton-cfg.json, clacton-data.json,
// journey-planner.js (Victoria to Eastbourne) and london-links.js (Victoria to Liverpool Street, Circle line).
const STEPS = [
  { title: 'Plan the trip', q: 'Eastbourne to Clacton by train', b: ['Train to London Victoria', 'Tube to Liverpool Street', 'Train to Clacton, then walk'] },
  { title: 'Buy your ticket', q: 'Eastbourne to Clacton-on-Sea', b: ['One ticket, routed via London', 'It usually covers the Tube', 'A Railcard saves a third'] },
  { title: 'Train to London', q: 'Southern, from Eastbourne', b: ['About 1 hour 25 minutes', 'Every 30 minutes (hourly Sundays)', 'Get off at London Victoria'] },
  { title: 'Follow the signs', q: 'For the Underground', b: ['They start on the platform', 'Then through the ticket gates', 'Use your ticket or contactless'] },
  { title: 'Circle line', q: 'Eastbound, towards Tower Hill', b: ['Not the District line', '11 stops, about 20 minutes', 'Get off at Liverpool Street'] },
  { title: 'Liverpool Street', q: 'Follow the National Rail signs', b: ['Find Clacton-on-Sea on the board', 'Allow 45 minutes for the change', 'Grab a drink for the train'] },
  { title: 'Train to Clacton', q: 'Greater Anglia, direct', b: ['A train every hour', 'About 1 hour 26 minutes', 'Check the summer 2027 times'] },
  { title: 'Walk to the show', q: '10 to 15 minutes on foot', b: ['Down through the town centre', 'Turn right at the seafront', 'On to the West Greensward'] },
  { title: 'Going home', q: 'The trains fill up fast', b: ['Busiest straight after the flying', 'Leave a little early', 'Or eat in town and go later'] },
];
const INTRO_WORDS = ['EASTBOURNE TO', 'CLACTON', 'BY TRAIN'], INTRO_TAG = 'CHANGING IN LONDON', INTRO_SUB = 'Train, Tube, train and a short walk';
const OUTRO_LINE = 'Enjoy the Clacton Air Show!', OUTRO_LINES = ['Enjoy the', 'Clacton Air Show!'];
const URL = 'ukairshowguide.co.uk/train-to-clacton';
const COL = { southern: '#7AB929', circle: '#FFD329', district: '#00782A', ga: '#D2232A', walk: C.teal };
//@@HITS
for (const d of [2.5, 4.5, 6.5]) HITS.push([st(0) + d - 0.1, 'route draws', 'whoosh', { len: 0.5, from: 600, to: 2000, gain: 0.08 }]);
HITS.push([st(2) + 0.5, 'train arrives', 'whoosh', { len: 1.4, from: 300, to: 900, gain: 0.14 }], [st(2) + 7.4, 'train leaves', 'whoosh', { len: 1.6, from: 400, to: 1200, gain: 0.14 }]);
HITS.push([st(3) + 3.6, 'gates open', 'click', { gain: 0.14 }], [st(3) + 6.6, 'tap', 'blip', { pitch: 'E6', gain: 0.14 }]);
HITS.push([st(4) + 2.6, 'not district', 'thud', { gain: 0.18 }], [st(4) + 5, 'tube arrives', 'whoosh', { len: 1.2, from: 300, to: 1000, gain: 0.14 }]);
HITS.push([st(5) + 0.6, 'board', 'thud', { gain: 0.16 }]);
HITS.push([st(6) + 0.3, 'train passes', 'whoosh', { len: 2.4, from: 300, to: 1100, gain: 0.14 }]);
HITS.push([st(7) + 6.6, 'red arrows', 'whoosh', { len: 1.4, from: 300, to: 1600, gain: 0.18 }]);
HITS.push([st(8) + 2.6, 'busy', 'thud', { gain: 0.16 }]);
//@@SCENES
// 1. plan the trip: the route map
const MP = { EBN: [0.47, 0.86], VIC: [0.35, 0.44], LST: [0.41, 0.4], COL: [0.71, 0.25], CLT: [0.79, 0.31], SEA: [0.81, 0.35] };
const SEAPOLY = [[1, 0], [0.86, 0], [0.84, 0.16], [0.83, 0.3], [0.8, 0.38], [0.7, 0.42], [0.6, 0.46], [0.66, 0.5], [0.78, 0.52], [0.86, 0.56],
  [0.9, 0.64], [0.88, 0.74], [0.76, 0.82], [0.62, 0.86], [0.52, 0.895], [0.36, 0.9], [0.2, 0.92], [0, 0.93], [0, 1], [1, 1]];
function scenePlan(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(0); ctx.save(); ctx.translate(ax, 0);
  const bx = 70, by = 130, bw = 700, bh = 720;
  const bk = pop(L, 0.3, SPRING.bouncy);
  withT(ctx, bx + bw / 2, by + bh / 2, bk, (1 - bk) * -0.1, () => {
    ctx.translate(-(bx + bw / 2), -(by + bh / 2));
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(bx + 12, by + 14, bw, bh);
    box(ctx, bx, by, bw, bh, 0, '#CFE8B8');
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    ctx.beginPath(); SEAPOLY.forEach(([x, y], i) => (i ? ctx.lineTo(bx + x * bw, by + y * bh) : ctx.moveTo(bx + x * bw, by + y * bh))); ctx.closePath(); ctx.fillStyle = '#9FD3EE'; ctx.fill();
    ctx.restore(); ink(ctx); ctx.strokeRect(bx, by, bw, bh);
    const mp = (k) => [bx + MP[k][0] * bw, by + MP[k][1] * bh];
    const legs = [[['EBN', 'VIC'], COL.southern, 2.0, 3.2, 0], [['VIC', 'LST'], COL.circle, 4.0, 4.8, 0], [['LST', 'COL', 'CLT'], COL.ga, 6.0, 7.4, 0], [['CLT', 'SEA'], COL.walk, 7.4, 8.0, 1]];
    legs.forEach(([pts, col, a, b, dash]) => {
      const p = E.inOutCubic(prog(L, a, b)); if (p <= 0) return;
      const xy = pts.map(mp); const seg = xy.slice(1).map((q, i) => Math.hypot(q[0] - xy[i][0], q[1] - xy[i][1])); let left = seg.reduce((s, v) => s + v, 0) * p;
      ctx.beginPath(); ctx.moveTo(xy[0][0], xy[0][1]);
      for (let i = 0; i < seg.length && left > 0; i++) { const f = Math.min(1, left / seg[i]); ctx.lineTo(lerp(xy[i][0], xy[i + 1][0], f), lerp(xy[i][1], xy[i + 1][1], f)); left -= seg[i]; }
      ctx.lineCap = 'round'; ctx.strokeStyle = C.navy; ctx.lineWidth = 26; if (!dash) ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 16; if (dash) ctx.setLineDash([4, 24]); ctx.stroke(); ctx.setLineDash([]);
    });
    [['EBN', 'EASTBOURNE', 0.8, 0, 70], ['VIC', 'LONDON', 2.6, -40, -60], ['CLT', 'CLACTON', 6.8, -40, -70]].forEach(([k, nm, b, dx, dy]) => {
      const q = pop(L, b); if (q <= 0) return; const [x, y] = mp(k);
      withT(ctx, x, y, q, 0, () => box(ctx, -16, -16, 32, 32, 0, C.white, 5));
      label(ctx, nm, x + dx, y + dy, 40, C.navy, C.white, q);
    });
  });
  person(ctx, 'A', { x: 870, y: GY + 70, scale: 0.85, look: -0.6, aL: [-1.9, -0.3], blink: blinkAt(L, 3), holdR: (c) => rucksack(c, 0, 50, 0.4) });
  ctx.restore();
}
// 2. buy your ticket
function sceneTicket(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(1); ctx.save(); ctx.translate(ax, 0);
  const tk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 440, 380, tk, -0.05 + (1 - tk) * 0.3, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-340 + 12, -200 + 14, 680, 400);
    box(ctx, -340, -200, 680, 400, 0, '#FFF6DE');
    ctx.fillStyle = C.gold; ctx.fillRect(-337, -197, 674, 72); text(ctx, 'TRAIN TICKET', -310, -144, font(46, 800, DISPLAY), C.navy);
    text(ctx, 'FROM', -310, -70, font(28, 700, UI), C.grey2); text(ctx, 'EASTBOURNE', -310, -20, font(62, 800, DISPLAY), C.navy);
    text(ctx, 'TO', -310, 46, font(28, 700, UI), C.grey2); text(ctx, 'CLACTON-ON-SEA', -310, 96, font(62, 800, DISPLAY), C.navy);
    text(ctx, 'ROUTE: VIA LONDON', -310, 160, font(32, 800, DISPLAY), C.red);
    ink(ctx, 4); ctx.setLineDash([12, 12]); ctx.beginPath(); ctx.moveTo(190, -110); ctx.lineTo(190, 180); ctx.stroke(); ctx.setLineDash([]);
    jet(ctx, 265, 40, 0.5, -1.3, C.red);
  });
  label(ctx, 'TUBE ACROSS LONDON', 440, 680, 44, C.navy, C.white, pop(L, 4.5));
  const rk = pop(L, 6.5, SPRING.bouncy);
  if (rk > 0) withT(ctx, 230, 800, rk, 0.06, () => { box(ctx, -150, -60, 300, 120, 0, C.teal); text(ctx, 'RAILCARD', 0, -6, font(44, 800, DISPLAY), C.white, 'center'); text(ctx, 'A THIRD OFF', 0, 40, font(30, 800, DISPLAY), C.navy, 'center'); });
  person(ctx, 'B', { x: 820, y: GY + 70, scale: 0.9, look: -0.6, aL: [-1.4, -0.6], blink: blinkAt(L, 5), mouth: 0.3 * bump(L, 4.5, 1.5), holdL: (c) => phoneH(c, 0, -20, 0.55) });
  ctx.restore();
}
// 3. Southern train to Victoria
function sceneSouthern(ctx, u, L) {
  sky(ctx, u); hills(ctx);
  const ax = artX(2); ctx.save(); ctx.translate(ax, 0);
  // canopy
  for (const x of [80, 480, 880]) box(ctx, x - 9, 130, 18, GY - 140, 0, '#2E5E12', 0);
  box(ctx, -40, 100, 1060, 46, 0, '#2E5E12');
  sign(ctx, 'EASTBOURNE', 480, 220, 60, C.white, C.navy, COL.southern, 1);
  rails(ctx, GY - 22, -100, 1100);
  // arrives (decelerating), waits, leaves
  const arr = E.outCubic(prog(L, 0.3, 3)), dep = E.inCubic(prog(L, 7.4, 11));
  const tx = lerp(-80, 900, arr) + dep * 1900;
  trainH(ctx, tx, GY - 22, 0.95, 2, LIVERY.southern, (1 - arr + dep) * 20);
  platform(ctx, GY + 30);
  // A walks to the door and steps on
  const wp = prog(L, 3.4, 5.4);
  if (L < 5.6) person(ctx, 'A', { x: lerp(60, 520, E.inOutSine(wp)), y: GY + 110 - (L > 5.2 ? (L - 5.2) * 150 : 0), scale: 0.85, walk: wp > 0 && wp < 1 ? L * 7 : undefined, look: 0.6, blink: blinkAt(L, 7), holdR: (c) => rucksack(c, 0, 50, 0.4), aL: [-Math.sin(L * 7) * 0.4 * (wp > 0 && wp < 1 ? 1 : 0), -0.3] });
  label(ctx, 'SOUTHERN', 220, 360, 48, COL.southern, '#13210F', pop(L, 2.5) * (1 - prog(L, 10.5, 11)));
  label(ctx, '1 HR 25 MIN', 480, 360, 48, C.navy, C.white, pop(L, 4.5) * (1 - prog(L, 10.5, 11)));
  label(ctx, 'TO LONDON VICTORIA', 520, 460, 48, C.white, C.navy, pop(L, 6.5) * (1 - prog(L, 10.5, 11)));
  ctx.restore();
}
// 4. follow the signs: Underground, gates
function sceneGates(ctx, u, L) {
  tiles(ctx);
  const ax = artX(3); ctx.save(); ctx.translate(ax, 0);
  // hanging sign
  limb(ctx, [[260, 0], [260, 250]], 2, C.grey2); limb(ctx, [[700, 0], [700, 250]], 2, C.grey2);
  const sk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 480, 310, sk, 0, () => { box(ctx, -300, -64, 600, 128, 0, C.navy); text(ctx, 'UNDERGROUND', -260, 24, font(66, 800, DISPLAY), C.white); arrowR(ctx, 230, 0, 1.4, COL.circle); });
  // gates
  const open = E.outBack(prog(L, 3.6, 4.2), 1.4) * (1 - prog(L, 6.8, 7.2)) + E.outBack(prog(L, 7.2, 7.8)) * (1 - prog(L, 10, 10.5));
  for (let g = 0; g < 3; g++) {
    const gx = 400 + g * 220;
    box(ctx, gx - 110, GY - 170, 44, 170, 0, '#5B6B78'); box(ctx, gx + 66, GY - 170, 44, 170, 0, '#5B6B78');
    ctx.fillStyle = g === 1 ? '#2EC26A' : C.grey; ctx.fillRect(gx - 102, GY - 160, 28, 10);
    const pw = 62 * (1 - (g === 1 ? clamp(open) : 0));
    if (pw > 2) { box(ctx, gx - 66, GY - 120, pw, 56, 0, C.red, 4); box(ctx, gx + 66 - pw, GY - 120, pw, 56, 0, C.red, 4); }
  }
  // A walks up, through; B follows and taps a card
  const a1 = prog(L, 0.8, 3.2), a2 = prog(L, 4, 6.6);
  const axp = lerp(-60, 520, E.inOutSine(a1)) + E.inOutSine(a2) * 600;
  const aw = (a1 > 0 && a1 < 1) || (a2 > 0 && a2 < 1);
  person(ctx, 'A', { x: axp, y: GY + 80, scale: 0.85, walk: aw ? L * 7 : undefined, look: 0.6, blink: blinkAt(L, 9), aR: a1 >= 1 && a2 <= 0 ? [1.5, 0.3] : [0.2, 0.2], holdR: a1 >= 1 && a2 <= 0 ? (c) => { box(c, -30, -20, 60, 40, 0, '#FFF6DE', 4); } : undefined, holdL: (c) => rucksack(c, 0, 50, 0.4) });
  const b1 = prog(L, 5, 7), b2 = prog(L, 7.6, 10);
  const bxp = lerp(-160, 520, E.inOutSine(b1)) + E.inOutSine(b2) * 600;
  const bw = (b1 > 0 && b1 < 1) || (b2 > 0 && b2 < 1);
  if (L > 5) person(ctx, 'B', { x: bxp, y: GY + 90, scale: 0.85, walk: bw ? L * 7 : undefined, look: 0.6, blink: blinkAt(L, 10), aR: b1 >= 1 && b2 <= 0 ? [1.5, 0.3] : [0.2, 0.2], holdR: b1 >= 1 && b2 <= 0 ? (c) => { box(c, -30, -20, 60, 40, 0, C.blue, 4); } : undefined });
  label(ctx, 'TICKET OR CONTACTLESS', 480, 500, 44, C.teal, C.white, pop(L, 6.6) * (1 - prog(L, 11, 11.5)));
  ctx.restore();
}
// 5. Circle line, not the District line
function sceneCircle(ctx, u, L) {
  tiles(ctx, '#F1EFE6');
  const ax = artX(4); ctx.save(); ctx.translate(ax, 0);
  // tunnel mouth
  ctx.fillStyle = '#2B3237'; ctx.fillRect(-100, 480, 1200, GY - 480);
  sign(ctx, 'CIRCLE LINE', 380, 250, 70, C.white, C.navy, COL.circle, pop(L, 0.5), 'EASTBOUND TO TOWER HILL');
  tickSq(ctx, 800, 250, pop(L, 1.2, SPRING.wobbly) * 1.2, true);
  ctx.save(); ctx.globalAlpha = 0.95; sign(ctx, 'DISTRICT LINE', 380, 400, 50, C.white, C.grey2, COL.district, pop(L, 2.5)); ctx.restore();
  tickSq(ctx, 720, 400, pop(L, 2.7, SPRING.wobbly), false);
  rails(ctx, GY - 22, -100, 1100);
  const arr = E.outCubic(prog(L, 4.6, 6.6)), dep = E.inCubic(prog(L, 9, 11.5));
  trainH(ctx, lerp(-60, 1000, arr) + dep * 1900, GY - 22, 0.9, 2, LIVERY.tube, (1 - arr + dep) * 20);
  platform(ctx, GY + 30);
  person(ctx, 'A', { x: 180, y: GY + 110, scale: 0.85, look: 0.4, lookY: -0.5, aR: [2.2 * pop(L, 1), 0.2], blink: blinkAt(L, 12), holdL: (c) => rucksack(c, 0, 50, 0.4), mouth: 0.4 * bump(L, 1.5, 1) });
  label(ctx, '11 STOPS', 620, 560, 50, C.navy, C.white, pop(L, 4.5) * (1 - prog(L, 8.6, 9)));
  label(ctx, 'OFF AT LIVERPOOL STREET', 560, 560, 44, C.red, C.white, pop(L, 9) * 1);
  ctx.restore();
}
// 6. Liverpool Street: the departure board
function sceneLST(ctx, u, L) {
  tiles(ctx);
  const ax = artX(5); ctx.save(); ctx.translate(ax, 0);
  const bk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 480, 370, bk, 0, () => {
    box(ctx, -400, -170, 800, 340, 0, '#111518');
    const amber = '#FFB400';
    text(ctx, 'DEPARTURES', -360, -100, font(40, 800, DISPLAY), '#C98F00');
    const rk = E.outQuint(prog(L, 2.4, 3.2));
    ctx.save(); ctx.beginPath(); ctx.rect(-380, -70, 760 * rk, 220); ctx.clip();
    text(ctx, '10:18', -360, -6, font(66, 800, DISPLAY), amber); text(ctx, 'CLACTON-ON-SEA', -190, -6, font(66, 800, DISPLAY), amber);
    text(ctx, 'Stratford, Shenfield, Chelmsford, Colchester', -360, 54, font(32, 600, UI), '#E6A500');
    text(ctx, 'On time', -360, 120, font(36, 700, UI), '#7CD67C');
    ctx.restore();
  });
  const ck = pop(L, 4.5, SPRING.bouncy);
  if (ck > 0) withT(ctx, 180, 680, ck, 0, () => wallClock(ctx, 0, 0, 80, (L * 3) % 60 + 20));
  label(ctx, '45 MIN', 180, 805, 50, C.navy, C.white, pop(L, 4.8));
  const wp = prog(L, 6.4, 11);
  person(ctx, 'A', { x: lerp(400, 1100, E.inOutSine(wp)), y: GY + 80, scale: 0.85, walk: wp > 0 && wp < 1 ? L * 7 : undefined, look: 0.6, blink: blinkAt(L, 14), aR: [1.1, 0.8], holdR: (c) => { box(c, -18, -40, 36, 50, 4, C.white, 4); c.fillStyle = C.red; c.fillRect(-15, -20, 30, 12); }, holdL: (c) => rucksack(c, 0, 50, 0.4) });
  person(ctx, 'B', { x: lerp(560, 1260, E.inOutSine(wp)), y: GY + 90, scale: 0.85, walk: wp > 0 && wp < 1 ? L * 7 + 1 : undefined, look: 0.6, blink: blinkAt(L, 15), mouth: 0.4 * bump(L, 7, 1) });
  ctx.restore();
}
// 7. Greater Anglia to Clacton, through Essex
function sceneGA(ctx, u, L) {
  sky(ctx, u);
  const ax = artX(6); ctx.save(); ctx.translate(ax, 0);
  ctx.fillStyle = C.sea; ctx.fillRect(-100, GY - 200, 1200, 90);
  for (let k = 0; k < 8; k++) { const wx = ((k * 150 + L * 40) % 1100) - 60; limb(ctx, [[wx, GY - 160], [wx + 40, GY - 160]], 2, '#8CC8E6'); }
  ctx.fillStyle = '#B6DAA6'; ctx.fillRect(-100, GY - 110, 1200, 120);
  for (let k = 0; k < 7; k++) { const tx = ((k * 190 - L * 60) % 1330 + 1330) % 1330 - 160; box(ctx, tx - 8, GY - 150, 16, 50, 0, '#8C6E54', 3); circ(ctx, tx, GY - 170, 44, C.grass2); }
  ground(ctx);
  rails(ctx, GY + 60, -100, 1100);
  const p = prog(L, 0.2, 11.6);
  trainH(ctx, lerp(-150, 2300, p), GY + 60, 0.85, 3, LIVERY.ga, L * 3);
  label(ctx, 'GREATER ANGLIA', 480, 300, 52, COL.ga, C.white, pop(L, 0.8));
  label(ctx, 'EVERY HOUR', 300, 410, 48, C.white, C.navy, pop(L, 2.5));
  label(ctx, '1 HR 26 MIN', 660, 410, 48, C.navy, C.white, pop(L, 4.5));
  label(ctx, 'CHECK 2027 TIMES', 480, 520, 48, C.gold, C.navy, pop(L, 6.5));
  ctx.restore();
}
// 8. walk to the seafront and the West Greensward
function sceneWalk(ctx, u, L) {
  sky(ctx, u);
  const ax = artX(7); ctx.save(); ctx.translate(ax, 0);
  ctx.fillStyle = C.sea; ctx.fillRect(-100, GY - 260, 1200, 200);
  for (let k = 0; k < 9; k++) { const wx = ((k * 130 + L * 30) % 1100) - 60; ctx.beginPath(); ctx.arc(wx, GY - 200 + (k % 2) * 60, 14, Math.PI, TAU); ink(ctx, 4); ctx.strokeStyle = C.white; ctx.stroke(); }
  ctx.fillStyle = C.sand; ctx.fillRect(-100, GY - 60, 1200, 60);
  // the pier, off to the east (left of frame when facing the sea we turn right, so the pier is behind us)
  ground(ctx);
  // crowd line along the Greensward once there
  if (L > 6.4) for (let k = 0; k < 9; k++) { const bx = 560 + k * 52; box(ctx, bx - 6, GY - 10, 12, 60, 0, k % 2 ? C.red : C.white, 3); }
  redArrows(ctx, prog(L, 6.6, 12), -260, 1200, 230, 0.6);
  // fingerpost
  box(ctx, 470, 300, 18, GY - 300, 0, '#7A5B3A');
  const fp = [['TOWN CENTRE', 360, 2.4, -1], ['SEAFRONT', 450, 4.4, 1], ['WEST GREENSWARD', 540, 6.4, 1]];
  fp.forEach(([nm, y, b, dir]) => {
    const q = pop(L, b, SPRING.bouncy); if (q <= 0) return;
    ctx.font = font(40, 800, DISPLAY); const w = ctx.measureText(nm).width + 80;
    withT(ctx, 479, y, 1, (1 - q) * dir * 0.6, () => {
      ctx.beginPath(); if (dir > 0) { ctx.moveTo(0, -32); ctx.lineTo(w, -32); ctx.lineTo(w + 34, 0); ctx.lineTo(w, 32); ctx.lineTo(0, 32); } else { ctx.moveTo(0, -32); ctx.lineTo(-w, -32); ctx.lineTo(-w - 34, 0); ctx.lineTo(-w, 32); ctx.lineTo(0, 32); }
      ctx.closePath(); fs(ctx, dir > 0 ? C.teal : C.navy, 5);
      text(ctx, nm, dir > 0 ? 24 : -w + 18, 14, font(40, 800, DISPLAY), C.white);
    });
  });
  const wp = prog(L, 0.8, 6);
  ['K', 'B', 'A'].forEach((w, k) => person(ctx, w, { x: lerp(-180 - k * 140, 520 + k * 140, E.inOutSine(wp)) + (L > 6 ? 0 : 0), y: GY + 110, scale: 0.8, walk: wp > 0 && wp < 1 ? L * 7 + k : undefined,
    look: wp < 1 ? 0.6 : -0.3, lookY: L > 6.6 ? -0.7 : 0, aL: L > 7 ? [-2.4 + Math.sin(L * 5 + k) * 0.3, 0] : [-0.2, -0.2], mouth: L > 7 ? 0.6 : 0.2, blink: blinkAt(L, 20 + k) }));
  ctx.restore();
}
// 9. going home: a busy platform at sunset
function sceneHome(ctx, u, L) {
  sky(ctx, u, '#F6C9A0', '#FBE3CE');
  const ax = artX(8); ctx.save(); ctx.translate(ax, 0);
  sun(ctx, 820, 260, 70, u, false);
  for (const x of [80, 480, 880]) box(ctx, x - 9, 130, 18, GY - 140, 0, '#9E1A20', 0);
  box(ctx, -40, 100, 1060, 46, 0, '#9E1A20');
  sign(ctx, 'CLACTON-ON-SEA', 480, 220, 56, C.white, C.navy, COL.ga, 1);
  rails(ctx, GY - 22, -100, 1100);
  trainH(ctx, 960, GY - 22, 0.95, 2, LIVERY.ga, 0);
  // faces at every window: a full train
  for (let c = 0; c < 2; c++) for (let i = 0; i < (c === 0 ? 3 : 4); i++) { const wx = 960 + (-c * 436 - 420 + 70 + i * 82 + 28) * 0.95, wy = GY - 22 - 150 * 0.95; circ(ctx, wx, wy + 6, 15, [C.skin1, C.skin2, C.skin3][(c + i) % 3], 3); }
  platform(ctx, GY + 30);
  const Q = [['S2', 80], ['B', 230], ['A', 380], ['K', 500], ['S', 640]];
  Q.forEach(([w, x], k) => person(ctx, w, { x, y: GY + 110, scale: 0.72, look: 0.6, blink: blinkAt(L, 30 + k), mouth: 0.15 }));
  label(ctx, 'BUSY!', 300, 380, 60, C.red, C.white, pop(L, 2.5));
  const ck = pop(L, 4.5);
  if (ck > 0) withT(ctx, 640, 400, ck, 0, () => { wallClock(ctx, 0, 0, 70, 40); });
  label(ctx, 'LEAVE EARLY', 640, 520, 44, C.navy, C.white, pop(L, 4.7));
  label(ctx, 'OR EAT IN TOWN', 340, 520, 44, C.teal, C.white, pop(L, 6.5));
  ctx.restore();
}
const SCENES = [scenePlan, sceneTicket, sceneSouthern, sceneGates, sceneCircle, sceneLST, sceneGA, sceneWalk, sceneHome];
