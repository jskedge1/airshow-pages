//@@COPY
// Copy from getting-home.html (Getting Home From An Airshow).
const STEPS = [
  { title: 'Plan your way out', q: 'Decide before the finale', b: ['Early: before the last display', 'Late: a good while after it', 'Worst: just after the finale'] },
  { title: 'Early or late?', q: 'Two ways to beat the rush', b: ['Early for trains and tired kids', 'Late for photos and departures', 'Ear defenders for departures'] },
  { title: 'The car park', q: 'Fields empty a row at a time', b: ['Expect 30 to 90 minutes', 'Photograph where you parked', 'Snacks and water in the car'] },
  { title: 'Last trains and buses', q: 'Check them, then screenshot them', b: ['The night before and the morning', 'Save the last two departures', 'Set a start walking alarm'] },
  { title: 'Shuttles', q: 'Park and Ride and show buses', b: ['Busiest in the first half hour', 'Go before the finale, or wait', 'Ask where the last bus leaves'] },
  { title: 'Taxis', q: 'Book before the day', b: ['Ring a week or two ahead', 'Confirm on the morning', 'Meet away from the main gate'] },
  { title: 'Meeting points', q: 'Pick one for going home', b: ['Something fixed near your exit', 'Agree a time as well', 'Keep 30% phone battery'] },
  { title: 'Tired children', q: 'The walk back is the hard part', b: ['A trolley for a sleepy child', 'Keep one snack for the walk', 'Toilet stop before you leave'] },
  { title: 'Driving tired', q: 'A long day, then a long drive', b: ['A break every two hours', 'Share the driving if you can', 'Or stay nearby for the night'] },
];
const INTRO_WORDS = ['GETTING HOME', 'FROM AN', 'AIRSHOW'], INTRO_TAG = 'PLAN YOUR WAY OUT', INTRO_SUB = 'Car parks, trains, taxis and more';
const OUTRO_LINE = 'Decide before the finale!', OUTRO_LINES = ['Decide before', 'the finale!'];
const URL = 'ukairshowguide.co.uk/getting-home-from-an-airshow';
//@@HITS
HITS.push([st(0) + 0.6, 'red arrows', 'whoosh', { len: 1.2, from: 300, to: 1400, gain: 0.14 }]);
HITS.push([st(2) + 2.6, 'cars move', 'whoosh', { len: 0.8, from: 300, to: 900, gain: 0.1 }]);
HITS.push([st(3) + 6.6, 'alarm', 'bell', { pitch: 'A6', gain: 0.14 }], [st(3) + 6.9, 'alarm', 'bell', { pitch: 'A6', gain: 0.12 }]);
HITS.push([st(4) + 1, 'bus arrives', 'whoosh', { len: 1.2, from: 300, to: 900, gain: 0.12 }]);
HITS.push([st(5) + 6.6, 'taxi arrives', 'whoosh', { len: 1, from: 400, to: 1000, gain: 0.12 }]);
HITS.push([st(8) + 0.3, 'car drives', 'whoosh', { len: 1.6, from: 300, to: 900, gain: 0.1 }]);
//@@SCENES
// a side-view car: square, navy outlined
function gh_car(ctx, x, y, s, col, spin = 0, flip = false, taxi = false) {
  withT(ctx, x, y, s, 0, () => {
    if (flip) ctx.scale(-1, 1);
    ctx.beginPath(); ctx.moveTo(-150, -30); ctx.lineTo(-150, -90); ctx.lineTo(-90, -90); ctx.lineTo(-60, -150); ctx.lineTo(60, -150); ctx.lineTo(100, -90); ctx.lineTo(150, -84); ctx.lineTo(150, -30); ctx.closePath(); fs(ctx, col);
    ctx.beginPath(); ctx.moveTo(-50, -138); ctx.lineTo(-2, -138); ctx.lineTo(-2, -96); ctx.lineTo(-74, -96); ctx.closePath(); fs(ctx, '#BFE6F2', 4);
    ctx.beginPath(); ctx.moveTo(10, -138); ctx.lineTo(54, -138); ctx.lineTo(82, -96); ctx.lineTo(10, -96); ctx.closePath(); fs(ctx, '#BFE6F2', 4);
    box(ctx, 132, -78, 18, 16, 0, C.gold, 3);
    if (taxi) { box(ctx, -40, -182, 80, 32, 0, C.gold, 4); text(ctx, 'TAXI', 0, -158, font(26, 800, DISPLAY), C.navy, 'center'); }
    for (const wx of [-88, 92]) { circ(ctx, wx, -28, 30, '#2B3237'); withT(ctx, wx, -28, 1, spin, () => limb(ctx, [[-14, 0], [14, 0]], 2, C.grey)); }
  });
}
// a single-deck bus
function gh_bus(ctx, x, y, s, col, label, spin = 0) {
  withT(ctx, x, y, s, 0, () => {
    box(ctx, -320, -250, 640, 220, 0, col);
    ctx.fillStyle = C.white; ctx.fillRect(-317, -112, 634, 20);
    for (let i = 0; i < 5; i++) box(ctx, -290 + i * 104, -222, 84, 80, 0, '#BFE6F2', 4);
    box(ctx, 236, -222, 64, 170, 0, '#BFE6F2', 4);
    box(ctx, -300, -280, 300, 34, 0, '#1C2A36', 4); text(ctx, label, -150, -254, font(24, 800, DISPLAY), C.gold, 'center');
    for (const wx of [-200, 190]) { circ(ctx, wx, -28, 34, '#2B3237'); withT(ctx, wx, -28, 1, spin, () => limb(ctx, [[-16, 0], [16, 0]], 2, C.grey)); }
  });
}
function gh_battery(ctx, x, y, s, pct) {
  withT(ctx, x, y, s, 0, () => {
    box(ctx, -60, -30, 120, 60, 0, C.white); box(ctx, 60, -12, 12, 24, 0, C.navy, 3);
    ctx.fillStyle = pct > 0.25 ? '#2E9E5B' : C.red; ctx.fillRect(-52, -22, 104 * pct, 44);
    text(ctx, Math.round(pct * 100) + '%', 0, 12, font(34, 800, DISPLAY), C.navy, 'center');
  });
}
function gh_road(ctx, off) {
  ctx.fillStyle = '#5B6B78'; ctx.fillRect(-1000, GY - 30, 4000, 150);
  ink(ctx); ctx.beginPath(); ctx.moveTo(-1000, GY - 30); ctx.lineTo(3000, GY - 30); ctx.stroke();
  for (let x = -((off % 140) + 140) % 140 - 1120; x < 2100; x += 140) { ctx.fillStyle = C.white; ctx.fillRect(x, GY + 40, 70, 10); }
}

// 1. plan your way out: the end of the day on a timeline
function scenePlanOut(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(0); ctx.save(); ctx.translate(ax, 0);
  redArrows(ctx, prog(L, 0.4, 10), -260, 1200, 230, 0.6);
  // timeline board
  const bk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 470, 560, bk, 0, () => {
    box(ctx, -420, -150, 840, 300, 0, C.white);
    ctx.fillStyle = C.navy; ctx.fillRect(-417, -147, 834, 64); text(ctx, 'THE END OF THE DAY', 0, -100, font(42, 800, DISPLAY), C.white, 'center');
    limb(ctx, [[-360, 30], [360, 30]], 6, C.sky2);
    [[-300, 'LAST DISPLAY'], [0, 'FINALE'], [300, '+1 HOUR']].forEach(([x, nm]) => { box(ctx, x - 10, 10, 20, 40, 0, C.navy, 0); text(ctx, nm, x, 100, font(30, 800, DISPLAY), C.navy, 'center'); });
  });
  label(ctx, 'EARLY', 170, 340, 44, '#2E9E5B', C.white, pop(L, 2.5));
  label(ctx, 'LATE', 770, 340, 44, C.teal, C.white, pop(L, 4.5));
  label(ctx, 'WORST', 520, 340, 44, C.red, C.white, pop(L, 6.5));
  person(ctx, 'A', { x: 120, y: GY + 110, scale: 0.7, look: 0.5, lookY: -0.7, aR: [2.3, 0.2], blink: blinkAt(L, 3), mouth: 0.4 });
  ctx.restore();
}
// 2. early or late: tired family heads out, a photographer stays for departures
function sceneEarlyLate(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(1); ctx.save(); ctx.translate(ax, 0);
  // runway and a Typhoon taxiing back
  ctx.fillStyle = '#8D9CA8'; ctx.fillRect(-100, GY - 90, 1200, 46);
  jet(ctx, lerp(1100, 640, E.inOutSine(prog(L, 4, 10))), GY - 150, 1.2, 0, C.blue, true);
  // exit sign and the family walking towards it
  box(ctx, 90, 380, 16, GY - 380, 0, C.grey2, 0);
  sign(ctx, 'EXIT', 98, 380, 52, '#2E9E5B', C.white, null, 1);
  const wp = prog(L, 2.4, 9);
  person(ctx, 'B', { x: lerp(420, 150, E.inOutSine(wp)), y: GY + 90, scale: 0.75, flip: true, walk: wp > 0 && wp < 1 ? L * 7 : undefined, look: -0.6, blink: blinkAt(L, 4) });
  person(ctx, 'K', { x: lerp(300, 40, E.inOutSine(wp)), y: GY + 100, scale: 0.75, flip: true, walk: wp > 0 && wp < 1 ? L * 7 + 1 : undefined, look: -0.6, blink: true, mouth: 0.6 * bump(L, 3, 1) });
  // the photographer, ear defenders on
  person(ctx, 'A', { x: 760, y: GY + 110, scale: 0.85, look: 0.4, earDef: L > 6, aR: [1.7, 0.4], blink: blinkAt(L, 5), holdR: (c) => icon(c, 'camera', 0, -10, 0.8) });
  label(ctx, 'LEAVE EARLY', 230, 260, 48, '#2E9E5B', C.white, pop(L, 2.5));
  label(ctx, 'STAY LATE', 720, 260, 48, C.teal, C.white, pop(L, 4.5));
  label(ctx, 'EAR DEFENDERS', 720, 370, 44, C.red, C.white, pop(L, 6.5));
  ctx.restore();
}
// 3. the car park empties a row at a time
function sceneCarPark(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(2); ctx.save(); ctx.translate(ax, 0);
  const cols = [C.red, C.blue, C.gold, C.teal, '#8C9BAA', C.white];
  // back row stands still, front row moves off
  for (let i = 0; i < 4; i++) gh_car(ctx, 140 + i * 230, GY - 40, 0.62, cols[i], 0);
  const go = prog(L, 2.4, 9);
  for (let i = 0; i < 3; i++) gh_car(ctx, 200 + i * 300 + E.inCubic(go) * 1100, GY + 90, 0.8, cols[i + 3], L * 5 * (go > 0 ? 1 : 0));
  // row marker
  box(ctx, 860, 330, 14, GY - 330 - 60, 0, C.grey2, 0);
  sign(ctx, 'ROW C', 866, 330, 52, C.gold, C.navy, null, pop(L, 4.3));
  // marshal waving cars out
  person(ctx, 'S', { x: 80, y: GY + 120, scale: 0.75, look: 0.5, aR: [1.6 + Math.sin(L * 5) * 0.4, 0.3], blink: blinkAt(L, 6) });
  label(ctx, '30 TO 90 MIN', 480, 300, 52, C.navy, C.white, pop(L, 2.5));
  const ph = pop(L, 4.5, SPRING.bouncy);
  if (ph > 0) withT(ctx, 640, 470, ph, 0.1, () => { phoneH(ctx, 0, 0, 0.9, C.gold); text(ctx, 'ROW C', 0, 8, font(20, 800, DISPLAY), C.navy, 'center'); });
  const wk = pop(L, 6.5, SPRING.bouncy);
  if (wk > 0) { icon(ctx, 'water', 300, 470 - (1 - wk) * 60, 1.1); icon(ctx, 'sandwich', 400, 480 - (1 - wk) * 60, 1); }
  ctx.restore();
}
// 4. last trains and buses: the screenshot and the alarm
function sceneTrains(ctx, u, L) {
  tiles(ctx);
  const ax = artX(3); ctx.save(); ctx.translate(ax, 0);
  sign(ctx, 'STATION', 480, 260, 56, C.navy, C.white, C.red, 1);
  // the phone with the screenshot
  const pk = pop(L, 0.6, SPRING.bouncy);
  withT(ctx, 300, 560, pk, -0.05, () => {
    box(ctx, -150, -260, 300, 520, 20, '#2B3237'); ctx.fillStyle = C.white; ctx.fillRect(-128, -230, 256, 460);
    ctx.fillStyle = C.navy; ctx.fillRect(-128, -230, 256, 64); text(ctx, 'LAST TRAINS', 0, -186, font(36, 800, DISPLAY), C.white, 'center');
    const rows = [['19:40', 'Last but one'], ['20:40', 'Last train']];
    rows.forEach(([t, d], k) => { const q = E.outQuint(prog(L, 4.4 + k * 0.4, 5 + k * 0.4)); if (q <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(-128, -140 + k * 110, 256 * q, 100); ctx.clip(); text(ctx, t, -100, -86 + k * 110, font(48, 800, DISPLAY), C.navy); text(ctx, d, -100, -48 + k * 110, font(26, 700, UI), C.tealD); ctx.restore(); });
    const flash = bump(L, 5.2, 0.3); if (flash > 0) { ctx.globalAlpha = flash; ctx.fillStyle = C.white; ctx.fillRect(-128, -230, 256, 460); ctx.globalAlpha = 1; }
  });
  label(ctx, 'CHECK TWICE', 690, 370, 44, C.teal, C.white, pop(L, 2.5));
  label(ctx, 'SCREENSHOT', 690, 470, 44, C.navy, C.white, pop(L, 4.5));
  const ak = pop(L, 6.5, SPRING.wobbly);
  if (ak > 0) withT(ctx, 700, 620, ak, Math.sin(L * 30) * 0.08 * bump(L, 7, 1.5), () => { wallClock(ctx, 0, 0, 80, 10); box(ctx, -70, -110, 40, 26, 0, C.red, 4); box(ctx, 30, -110, 40, 26, 0, C.red, 4); });
  label(ctx, 'START WALKING', 700, 790, 44, C.red, C.white, pop(L, 6.9));
  ctx.restore();
}
// 5. shuttles and Park and Ride
function sceneShuttle(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(4); ctx.save(); ctx.translate(ax, 0);
  // bus stop
  box(ctx, 870, 380, 14, GY - 380, 0, C.grey2, 0);
  sign(ctx, 'PARK AND RIDE', 760, 380, 46, C.blue, C.white, null, 1);
  const arr = E.outCubic(prog(L, 0.4, 2.6));
  gh_bus(ctx, lerp(-500, 420, arr), GY - 40, 0.95, C.teal, 'CAR PARK', (1 - arr) * 20);
  // the queue
  const Q = [['S2', 520], ['B', 630], ['K', 720], ['A', 820]];
  Q.forEach(([w, x], k) => person(ctx, w, { x, y: GY + 110, scale: 0.68, flip: true, look: -0.6, blink: blinkAt(L, 10 + k), mouth: w === 'A' ? 0.5 * bump(L, 4.8, 1) : 0.1, ...(w === 'B' && L > 6.6 ? { shirt: C.navy } : {}) }));
  label(ctx, 'BEFORE THE FINALE', 300, 230, 46, '#2E9E5B', C.white, pop(L, 2.5));
  bubbleSq(ctx, 520, 480, 340, 100, C.navy, 'LAST BUS?', pop(L, 4.5), false);
  label(ctx, 'LAYER UP', 600, 230, 46, C.red, C.white, pop(L, 6.5) * 1);
  ctx.restore();
}
// 6. taxis: book, confirm, meet away from the gate
function sceneTaxi(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(5); ctx.save(); ctx.translate(ax, 0);
  // a quiet pub as the pickup point
  box(ctx, 520, GY - 330, 400, 330, 0, '#E9D3A9');
  ctx.beginPath(); ctx.moveTo(500, GY - 330); ctx.lineTo(720, GY - 450); ctx.lineTo(940, GY - 330); ctx.closePath(); fs(ctx, C.red);
  box(ctx, 680, GY - 150, 80, 150, 0, '#7A5B3A');
  for (const wx of [560, 800]) box(ctx, wx, GY - 260, 80, 70, 0, '#BFE6F2', 4);
    sign(ctx, 'THE RED LION', 720, GY - 380 + 150, 40, C.navy, C.white, null, 1);
  // A on the phone
  person(ctx, 'A', { x: 200, y: GY + 100, scale: 0.85, look: 0.5, aR: [2.8, 0.6], blink: blinkAt(L, 12), mouth: 0.5 * (bump(L, 2.8, 1) + bump(L, 4.8, 1)), holdR: (c) => phoneH(c, 0, -10, 0.45) });
  label(ctx, 'BOOKED', 300, 260, 50, C.navy, C.white, pop(L, 2.5));
  label(ctx, 'CONFIRMED', 300, 370, 50, '#2E9E5B', C.white, pop(L, 4.5));
  const tp = E.outCubic(prog(L, 6.4, 8.6));
  gh_car(ctx, lerp(-300, 460, tp), GY + 110, 0.8, C.white, (1 - tp) * 20, false, true);
  label(ctx, 'AWAY FROM THE GATE', 300, 480, 42, C.teal, C.white, pop(L, 6.8));
  ctx.restore();
}
// 7. meeting points and phone battery
function sceneMeet(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(6); ctx.save(); ctx.translate(ax, 0);
  jet(ctx, 480, GY - 190, 2.2, 0, 'a400');
  box(ctx, 470, 300, 14, GY - 300, 0, C.grey2, 0);
  sign(ctx, 'MEET HERE 18:15', 477, 300, 50, C.gold, C.navy, null, pop(L, 2.5));
  const cp = E.inOutSine(prog(L, 4, 8));
  person(ctx, 'B', { x: lerp(-100, 330, cp), y: GY + 110, scale: 0.75, walk: cp > 0 && cp < 1 ? L * 7 : undefined, look: 0.5, blink: blinkAt(L, 14) });
  person(ctx, 'K', { x: lerp(-220, 220, cp), y: GY + 120, scale: 0.75, walk: cp > 0 && cp < 1 ? L * 7 + 1 : undefined, look: 0.5, blink: blinkAt(L, 15), mouth: 0.5 });
  person(ctx, 'A', { x: lerp(1100, 640, cp), y: GY + 110, scale: 0.75, flip: true, walk: cp > 0 && cp < 1 ? L * 7 + 2 : undefined, look: -0.5, blink: blinkAt(L, 16), aL: cp >= 1 ? [-2.4, 0] : [-0.2, -0.2] });
  label(ctx, '18:15', 800, 260, 52, C.navy, C.white, pop(L, 4.5));
  const bk = pop(L, 6.5, SPRING.bouncy);
  if (bk > 0) withT(ctx, 800, 400, bk, 0, () => gh_battery(ctx, 0, 0, 1.4, 0.3 + 0.0 * L));
  ctx.restore();
}
// 8. tired children: trolley, snack, toilets
function sceneKids(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(7); ctx.save(); ctx.translate(ax, 0);
  // toilets block on the way out
  box(ctx, 680, GY - 300, 260, 300, 0, C.white);
  ctx.fillStyle = C.blue; ctx.fillRect(683, GY - 297, 254, 56); text(ctx, 'TOILETS', 810, GY - 255, font(40, 800, DISPLAY), C.white, 'center');
  box(ctx, 720, GY - 220, 70, 220, 0, C.blue, 4); box(ctx, 830, GY - 220, 70, 220, 0, C.blue, 4);
  // B pulls a trolley with K asleep in it
  const wp = E.inOutSine(prog(L, 1, 9));
  const bx = lerp(-60, 470, wp), walking = wp > 0 && wp < 1;
  const tx = bx - 280;
  person(ctx, 'B', { x: bx, y: GY + 110, scale: 0.8, walk: walking ? L * 6 : undefined, look: 0.4, aL: [-1.0, -0.3], blink: blinkAt(L, 18), holdR: (c) => (L > 4.5 ? icon(c, 'sandwich2', 0, -10, 1.4) : null), aR: L > 4.5 ? [1.5, 0.4] : [0.2, 0.2] });
  limb(ctx, [[tx + 120, GY + 10], [bx - 60, GY - 120]], 3, C.navy);
  person(ctx, 'K', { x: tx, y: GY - 20, scale: 0.6, sit: true, flip: true, blink: true, mouth: 0, tilt: 0.35, aL: [-0.3, -0.4], aR: [0.3, 0.4] });
  box(ctx, tx - 140, GY - 60, 280, 90, 0, C.red);
  for (const wx of [tx - 90, tx + 90]) circ(ctx, wx, GY + 50, 30, '#2B3237');
  const z = pop(L, 2.6);
  if (z > 0) { ctx.globalAlpha = Math.min(1, z); text(ctx, 'Z', tx + 70, GY - 230 - Math.sin(L * 2) * 10, font(56, 800, DISPLAY), C.navy); text(ctx, 'z', tx + 110, GY - 280 - Math.sin(L * 2 + 1) * 10, font(40, 800, DISPLAY), C.navy); ctx.globalAlpha = 1; }
  label(ctx, 'TROLLEY', 250, 260, 50, C.red, C.white, pop(L, 2.5));
  label(ctx, 'ONE SNACK KEPT BACK', 360, 370, 44, C.gold, C.navy, pop(L, 4.5));
  label(ctx, 'LAST STOP', 810, 230, 46, C.blue, C.white, pop(L, 6.5));
  ctx.restore();
}
// 9. driving tired: services, share the wheel
function sceneDrive(ctx, u, L) {
  sky(ctx, u, '#F6D7B6', '#FBE7D6'); hills(ctx); ground(ctx);
  const ax = artX(8); ctx.save(); ctx.translate(ax, 0);
  sun(ctx, 780, 300, 60, u, false);
  gh_road(ctx, L * 160);
  // motorway services sign
  box(ctx, 600, 400, 14, GY - 30 - 400, 0, C.grey2, 0); box(ctx, 840, 400, 14, GY - 30 - 400, 0, C.grey2, 0);
  const sk = pop(L, 2.5, SPRING.bouncy);
  withT(ctx, 727, 400, sk, 0, () => {
    box(ctx, -180, -110, 360, 180, 0, C.blue);
    text(ctx, 'SERVICES', 0, -46, font(54, 800, DISPLAY), C.white, 'center');
    text(ctx, '1 MILE', 0, 30, font(54, 800, DISPLAY), C.white, 'center');
  });
  gh_car(ctx, 300 + Math.sin(L * 2) * 6, GY + 60, 0.95, C.teal, L * 8);
  // two heads in the car
  circ(ctx, 270, GY - 60, 18, C.skin1, 3); circ(ctx, 330, GY - 60, 18, C.skin2, 3);
  label(ctx, 'EVERY 2 HOURS', 300, 230, 46, C.navy, C.white, pop(L, 2.7));
  label(ctx, 'SWAP DRIVERS', 300, 340, 46, C.teal, C.white, pop(L, 4.5));
  label(ctx, 'OR STAY THE NIGHT', 300, 450, 44, C.red, C.white, pop(L, 6.5));
  ctx.restore();
}
const SCENES = [scenePlanOut, sceneEarlyLate, sceneCarPark, sceneTrains, sceneShuttle, sceneTaxi, sceneMeet, sceneKids, sceneDrive];
