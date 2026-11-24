//@@COPY
// Copy from night-before.html (The Night Before An Airshow).
const STEPS = [
  { title: 'Tickets and passes', q: 'Get them on your phone tonight', b: ['Save every ticket to your phone', 'Take a screenshot of each one', 'Fold a printed copy in the bag'] },
  { title: 'Travel checks', q: 'Ten minutes now saves an hour', b: ["Check the show's travel page", 'Save the car park gate postcode', 'Fuel up or charge the car'] },
  { title: 'Weather and layers', q: 'Pack for a bit worse than it says', b: ['Check the forecast and warnings', 'Lay out layers for everyone', 'Sun cream, even if it is cloudy'] },
  { title: 'Charge everything', q: 'Straight after tea', b: ['Phones, tablets and power bank', 'Camera batteries and spares', 'Pack the cables in the bag now'] },
  { title: 'Pack the bag', q: 'Lay it all out on the floor first', b: ['Things to check go on the top', 'Cash and a card for the stalls', 'Meds, plasters and a bin bag'] },
  { title: 'Food and water', q: 'Made tonight, packed in the morning', b: ['Water bottles in the fridge', 'Sandwiches and snacks made', 'Ice packs in the freezer'] },
  { title: "Kids' kit", q: 'Try it all on tonight', b: ['Ear defenders, one pair each', 'A spare set of clothes', 'Your phone number on each child'] },
  { title: 'Camera kit', q: 'Ready for the first display', b: ['Give each lens a clean', 'Reset your settings for the show', 'Rain cover and a cloth packed'] },
  { title: 'Before bed', q: 'Bag by the front door', b: ['Set two alarms', 'Agree the out of the door time', 'Take out any banned items'] },
];
const INTRO_WORDS = ['THE NIGHT BEFORE', 'YOUR', 'AIRSHOW'], INTRO_TAG = 'MY EVENING CHECKLIST', INTRO_SUB = 'So the morning is calm';
const OUTRO_LINE = 'Bag by the door, then bed!', OUTRO_LINES = ['Bag by the door,', 'then bed!'];
// the full path is too wide for the 9:16 URL bar, so the vertical cut shows the home address
const URL = PORTRAIT ? 'ukairshowguide.co.uk' : 'ukairshowguide.co.uk/night-before-an-airshow';
//@@HITS
HITS.push([st(0) + 4.6, 'screenshot', 'click', { gain: 0.14 }]);
HITS.push([st(1) + 4.6, 'pin drops', 'thud', { gain: 0.14 }]);
HITS.push([st(2) + 4.5, 'clothes land', 'thud', { pitch: 200, gain: 0.12 }]);
HITS.push([st(4) + 2.5, 'into the bag', 'whoosh', { len: 0.4, from: 900, to: 2400, gain: 0.08 }], [st(4) + 4.5, 'into the bag', 'whoosh', { len: 0.4, from: 900, to: 2400, gain: 0.08 }]);
HITS.push([st(5) + 0.5, 'fridge opens', 'whoosh', { len: 0.3, from: 600, to: 1600, gain: 0.08 }]);
HITS.push([st(6) + 2.6, 'ear defenders on', 'pop', { pitch: 'C6', gain: 0.14 }]);
HITS.push([st(7) + 4.6, 'settings', 'blip', { pitch: 'E6', gain: 0.12 }]);
for (const d of [2.5, 3.0, 3.5]) HITS.push([st(8) + d, 'alarm ring', 'blip', { pitch: 'A6', gain: 0.1 }]);
HITS.push([st(8) + 6.8, 'banned out', 'thud', { gain: 0.16 }]);
//@@SCENES
// ---- night-before helpers (nb_)
// an evening room: warm wall, skirting board, floorboards, a window with the evening sky
function nb_room(ctx, u, win = [120, 160]) {
  sfill(ctx, '#EFE6D6');
  ctx.fillStyle = '#E4D8C2'; for (let x = 0; x < G.w; x += 120) ctx.fillRect(x, 0, 60, G.gy);
  ctx.fillStyle = '#C79A6B'; ctx.fillRect(0, G.gy, G.w, G.h - G.gy);
  ctx.strokeStyle = '#B0855A'; ctx.lineWidth = 3; for (let y = G.gy + 40; y < G.h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(G.w, y); ctx.stroke(); }
  box(ctx, -10, G.gy - 30, G.w + 20, 30, 0, C.white, 4);
  ink(ctx); ctx.beginPath(); ctx.moveTo(0, G.gy); ctx.lineTo(G.w, G.gy); ctx.stroke();
  if (win) nb_window(ctx, u, win[0], win[1]);
}
function nb_window(ctx, u, x, y, w = 240, h = 220) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2B3F6B'); g.addColorStop(1, '#E59A6B');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  circ(ctx, x + w * 0.7, y + h * 0.3, 26, '#FFF3C4', 0);
  for (let k = 0; k < 5; k++) puff(ctx, x + hash01(k, 3) * w, y + hash01(k, 5) * h * 0.5, 2.5, C.white, 0.9);
  ctx.restore();
  box(ctx, x, y, w, h, 0, 'rgba(0,0,0,0)', LW); limb(ctx, [[x + w / 2, y], [x + w / 2, y + h]], 2, C.white); limb(ctx, [[x, y + h / 2], [x + w, y + h / 2]], 2, C.white);
}
function nb_table(ctx, x0, x1, top) {
  box(ctx, x0, top, x1 - x0, 30, 0, '#9C6B43'); box(ctx, x0 + 20, top + 30, 22, G.gy - top - 30, 0, '#9C6B43'); box(ctx, x1 - 42, top + 30, 22, G.gy - top - 30, 0, '#9C6B43');
}
function nb_paper(ctx, x, y, w, h, rot, fn) {
  withT(ctx, x, y, 1, rot, () => { ctx.fillStyle = 'rgba(19,41,60,0.18)'; ctx.fillRect(-w / 2 + 8, -h / 2 + 10, w, h); box(ctx, -w / 2, -h / 2, w, h, 0, C.white, 5); if (fn) fn(); });
}
function nb_bigPhone(ctx, x, y, s, fn) {
  withT(ctx, x, y, s, 0, () => { box(ctx, -110, -200, 220, 400, 22, '#2B3237'); ctx.fillStyle = C.white; ctx.fillRect(-92, -170, 184, 330); if (fn) fn(); });
}
function nb_battery(ctx, x, y, w, h, level, col = '#2E9E5B') {
  box(ctx, x, y, w, h, 0, C.white, 5); box(ctx, x + w, y + h * 0.3, 10, h * 0.4, 0, C.navy, 0);
  ctx.fillStyle = col; ctx.fillRect(x + 7, y + 7, Math.max(0, (w - 14) * level), h - 14);
}
function nb_tee(ctx, x, y, s, col) {
  withT(ctx, x, y, s, 0, () => { ctx.beginPath(); ctx.moveTo(-50, -40); ctx.lineTo(-20, -50); ctx.lineTo(20, -50); ctx.lineTo(50, -40); ctx.lineTo(62, -10); ctx.lineTo(38, -4); ctx.lineTo(38, 44); ctx.lineTo(-38, 44); ctx.lineTo(-38, -4); ctx.lineTo(-62, -10); ctx.closePath(); fs(ctx, col, 5); });
}
function nb_fold(ctx, x, y, w, col) { box(ctx, x - w / 2, y - 20, w, 40, 6, col, 5); }
function nb_coolbox(ctx, x, y, s) { withT(ctx, x, y, s, 0, () => { box(ctx, -90, -90, 180, 90, 8, C.blue); box(ctx, -96, -110, 192, 28, 6, C.white, 5); box(ctx, -30, -60, 60, 14, 0, C.white, 4); }); }
function nb_door(ctx, x) {
  box(ctx, x, GY - 520, 230, 520, 0, '#3E6E8E'); box(ctx, x + 30, GY - 480, 170, 180, 0, '#4C7FA2', 4); box(ctx, x + 30, GY - 270, 170, 200, 0, '#4C7FA2', 4);
  circ(ctx, x + 196, GY - 260, 12, C.gold, 4);
}

// 1. tickets and passes
function sceneTickets(ctx, u, L) {
  nb_room(ctx, u, [700, 140]);
  const ax = artX(0); ctx.save(); ctx.translate(ax, 0);
  const pk = pop(L, 0.5, SPRING.bouncy);
  if (pk > 0) withT(ctx, 470, 470, pk, 0, () => nb_bigPhone(ctx, 0, 0, 1, () => {
    ctx.fillStyle = C.navy; ctx.fillRect(-92, -170, 184, 50); text(ctx, 'E-TICKET', 0, -134, font(32, 800, DISPLAY), C.white, 'center');
    qr(ctx, -60, -100, 120, 9); text(ctx, 'SHOW DAY', 0, 100, font(28, 700, UI), C.navy, 'center');
    const fl = bump(L, 4.6, 0.35); if (fl > 0) { ctx.globalAlpha = fl; ctx.fillStyle = C.white; ctx.fillRect(-92, -170, 184, 330); ctx.globalAlpha = 1; }
  }));
  label(ctx, 'SAVED', 300, 260, 46, '#2E9E5B', C.white, pop(L, 2.5));
  // screenshot thumbnail pops off the phone
  const sk = pop(L, 4.8, SPRING.bouncy);
  if (sk > 0) withT(ctx, 700, 380, sk * 0.55, 0.12, () => nb_bigPhone(ctx, 0, 0, 1, () => { qr(ctx, -60, -100, 120, 9); }));
  label(ctx, 'SCREENSHOT', 740, 560, 42, C.teal, C.white, pop(L, 4.6));
  // the printed copy folds into the bag
  const pr = prog(L, 6.6, 8.2);
  rucksack(ctx, 760, GY + 40, 1, C.blue);
  if (L > 6.3) {
    const e = E.inOutCubic(pr);
    nb_paper(ctx, lerp(260, 760, e), lerp(300, GY - 80, e) - Math.sin(e * Math.PI) * 120, 150 * (1 - 0.4 * e), 190 * (1 - 0.6 * e), (1 - e) * -0.3 + e * 0.2, () => { if (e < 0.7) qr(ctx, -40, -50, 80, 9); });
  }
  label(ctx, 'PRINTED COPY', 760, 720, 42, C.navy, C.white, pop(L, 8.3));
  person(ctx, 'A', { x: 170, y: GY + 70, scale: 0.9, look: 0.6, aR: [1.3, 0.6], blink: blinkAt(L, 3), holdR: (c) => phoneH(c, 0, -20, 0.55) });
  ctx.restore();
}
// 2. travel checks
function sceneTravel(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(1); ctx.save(); ctx.translate(ax, 0);
  // map pinned to the wall
  const mk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 400, 420, mk, -0.02, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.18)'; ctx.fillRect(-300 + 10, -230 + 12, 600, 460);
    box(ctx, -300, -230, 600, 460, 0, '#CFE8B8');
    ctx.fillStyle = '#9FD3EE'; ctx.fillRect(-297, 150, 594, 77);
    limb(ctx, [[-240, 170], [-120, 60], [20, 40], [150, -60], [210, -150]], 10, C.gold);
    limb(ctx, [[-260, -200], [-60, -20], [150, -60]], 6, C.white);
    text(ctx, 'AIRFIELD', 120, -170, font(34, 800, DISPLAY), C.navy);
    box(ctx, 120, -160, 120, 70, 0, '#B6C4CE', 4);
  });
  label(ctx, 'TRAVEL PAGE', 420, 720, 44, C.navy, C.white, pop(L, 2.5));
  // pin on the car park gate, not the airfield
  const pk = prog(L, 4.3, 4.6);
  if (pk > 0) { const py = lerp(150, 360, E.outBounce(pk)); withT(ctx, 550, py, 1, 0, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-20, -40); ctx.arc(0, -50, 24, Math.PI * 0.8, Math.PI * 2.2); ctx.closePath(); fs(ctx, C.red); circ(ctx, 0, -50, 9, C.white, 0); }); }
  label(ctx, 'CAR PARK GATE', 590, 815, 42, C.red, C.white, pop(L, 4.8));
  // fuel pump
  const fk = pop(L, 6.5, SPRING.bouncy);
  if (fk > 0) withT(ctx, 840, GY - 140, fk, 0, () => {
    box(ctx, -60, -150, 120, 290, 0, C.red); box(ctx, -40, -120, 80, 60, 0, '#BFE6F2', 4);
    text(ctx, 'FUEL', 0, 10, font(36, 800, DISPLAY), C.white, 'center');
    limb(ctx, [[60, -60], [90, -40], [90, 60]], 5, C.navy);
  });
  person(ctx, 'A', { x: 120, y: GY + 70, scale: 0.85, look: 0.6, aR: [2.2, 0.2], blink: blinkAt(L, 5), mouth: 0.3 * bump(L, 4.7, 1.2) });
  ctx.restore();
}
// 3. weather and layers
function sceneWeather(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(2); ctx.save(); ctx.translate(ax, 0);
  // TV with the forecast
  const tk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 300, 340, tk, 0, () => {
    box(ctx, -240, -150, 480, 300, 0, '#1C2A36'); ctx.fillStyle = '#7CC6E6'; ctx.fillRect(-222, -132, 444, 264);
    sun(ctx, -80, -20, 46, u, false); cloud(ctx, 30, 10, 0.9);
    box(ctx, 90, 70, 120, 46, 0, C.gold, 4); text(ctx, 'YELLOW', 150, 104, font(30, 800, DISPLAY), C.navy, 'center');
    box(ctx, -20, 150, 40, 40, 0, '#2B3237', 0); box(ctx, -100, 186, 200, 16, 0, '#2B3237', 0);
  });
  label(ctx, 'FORECAST', 300, 540, 44, C.navy, C.white, pop(L, 2.5));
  // sofa with three piles: T shirt, fleece, waterproof each
  box(ctx, 80, GY - 230, 780, 90, 20, '#6B8FB0'); box(ctx, 60, GY - 150, 820, 120, 20, '#7FA3C3'); box(ctx, 60, GY - 30, 40, 30, 0, C.navy, 4); box(ctx, 840, GY - 30, 40, 30, 0, C.navy, 4);
  const piles = [[220, [C.teal, C.navy, C.red]], [470, [C.red, C.grey2, C.blue]], [720, [C.gold, C.teal, C.navy]]];
  piles.forEach(([px, cols], k) => {
    const d = prog(L, 4.3 + k * 0.3, 4.9 + k * 0.3); if (d <= 0) return;
    const yy = lerp(GY - 500, 0, E.outBounce(d));
    nb_fold(ctx, px, GY - 166 + yy, 170, cols[2]); nb_fold(ctx, px, GY - 206 + yy, 150, cols[1]); nb_tee(ctx, px, GY - 262 + yy, 0.8, cols[0]);
  });
  label(ctx, 'LAYERS', 640, 560, 44, C.teal, C.white, pop(L, 4.7));
  const ck = pop(L, 6.5, SPRING.bouncy);
  if (ck > 0) withT(ctx, 760, 300, ck * 1.3, 0.15, () => itemCream(ctx));
  label(ctx, 'EVEN IF CLOUDY', 740, 440, 40, '#F38B2A', C.white, pop(L, 6.7));
  ctx.restore();
}
// 4. charge everything
function sceneCharge(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(3); ctx.save(); ctx.translate(ax, 0);
  nb_table(ctx, 60, 920, GY - 300);
  // socket strip on the wall
  box(ctx, 380, GY - 120, 260, 50, 0, C.white); for (let k = 0; k < 4; k++) box(ctx, 400 + k * 60, GY - 110, 36, 30, 0, C.off, 3);
  const items = [
    [2.5, 140, (c, lv) => { phoneH(c, 0, -40, 0.7); nb_battery(c, -40, -150, 80, 34, lv); }],
    [2.5, 310, (c, lv) => { box(c, -60, -70, 120, 70, 10, '#2B3237'); nb_battery(c, -40, -150, 80, 34, lv); }],
    [4.5, 480, (c, lv) => { box(c, -36, -90, 72, 90, 6, '#2B3237'); box(c, -24, -110, 48, 22, 0, C.grey2, 4); nb_battery(c, -40, -170, 80, 34, lv); }],
    [4.5, 640, (c, lv) => { box(c, -36, -90, 72, 90, 6, '#2B3237'); box(c, -24, -110, 48, 22, 0, C.grey2, 4); nb_battery(c, -40, -170, 80, 34, lv); }],
  ];
  items.forEach(([b, x, fn], k) => {
    const q = pop(L, b + (k % 2) * 0.3, SPRING.bouncy); if (q <= 0) return;
    const lv = clamp(prog(L, b + 0.5, b + 6));
    limb(ctx, [[x, GY - 310], [x + 20, GY - 200], [420 + k * 60, GY - 110]], 3, C.navy);
    withT(ctx, x, GY - 300, q * 1.3, 0, () => fn(ctx, lv));
  });
  label(ctx, 'STRAIGHT AFTER TEA', 470, 330, 46, C.navy, C.white, pop(L, 1));
  // cables go into the bag
  rucksack(ctx, 820, GY - 300, 0.9, C.red);
  const cp = prog(L, 6.6, 7.8);
  if (cp > 0 && cp < 1) { const e = E.inOutCubic(cp); withT(ctx, lerp(560, 820, e), lerp(GY - 520, GY - 380, e) - Math.sin(e * Math.PI) * 120, 1, e * 3, () => { ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.arc(0, 0, 18, 0, TAU); ink(ctx, 8); ctx.stroke(); }); }
  label(ctx, 'CABLES IN THE BAG', 700, 430, 40, C.teal, C.white, pop(L, 7.6));
  ctx.restore();
}
// 5. pack the bag
function scenePack(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(4); ctx.save(); ctx.translate(ax, 0);
  // laid out on the floor
  withT(ctx, 140, GY + 60, 1.8, 0, () => itemChair(ctx));
  box(ctx, 250, GY + 30, 200, 60, 0, C.red, 5); for (let k = 0; k < 4; k++) { ctx.fillStyle = C.white; ctx.fillRect(262 + k * 48, GY + 36, 22, 48); }
  nb_coolbox(ctx, 850, GY + 110, 1.3);
  // the bag in the middle, things fly in on top
  rucksack(ctx, 600, GY + 110, 1.6, C.blue);
  const fly = [[2.5, 'camera', 330, 620, GY - 160], [4.5, 'cash', 420, 560, GY - 150], [6.5, 'meds', 760, 650, GY - 140]];
  fly.forEach(([b, it, x0, x1, y1], k) => {
    const p = prog(L, b - 0.2, b + 0.8); if (p <= 0) return;
    const e = E.inOutCubic(p);
    const x = lerp(x0, x1, e), y = lerp(560, y1, e) - Math.sin(e * Math.PI) * 140;
    if (it === 'cash') withT(ctx, x, y, 1, 0, () => itemCash(ctx)); else icon(ctx, it, x, y, 1.3);
  });
  label(ctx, 'ON TOP FOR THE SEARCH', 560, 260, 42, C.navy, C.white, pop(L, 2.7));
  label(ctx, 'CASH AND A CARD', 560, 360, 42, '#2E9E5B', C.white, pop(L, 4.7));
  label(ctx, 'MEDS AND PLASTERS', 560, 460, 42, C.red, C.white, pop(L, 6.7));
  ctx.restore();
}
// 6. food and water
function sceneFood(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(5); ctx.save(); ctx.translate(ax, 0);
  // fridge freezer
  const fx = 120, fw = 300;
  box(ctx, fx, GY - 700, fw, 700, 0, C.white);
  limb(ctx, [[fx, GY - 480], [fx + fw, GY - 480]], 1, C.navy);
  ctx.fillStyle = '#E3F3FA'; ctx.fillRect(fx + 20, GY - 680, fw - 40, 180); ctx.fillRect(fx + 20, GY - 460, fw - 40, 440);
  limb(ctx, [[fx + 20, GY - 240], [fx + fw - 20, GY - 240]], 1, C.grey);
  // bottles on the fridge shelf
  for (let k = 0; k < 3; k++) { const q = pop(L, 2.5 + k * 0.25); if (q > 0) withT(ctx, fx + 70 + k * 80, GY - 320, q * 0.8, 0, () => itemWater(ctx)); }
  // ice packs in the freezer
  for (let k = 0; k < 3; k++) { const q = pop(L, 6.5 + k * 0.25); if (q > 0) withT(ctx, fx + 70 + k * 80, GY - 600, q, 0, () => box(ctx, -32, -40, 64, 80, 6, '#7FC4E8', 4)); }
  // door swings open
  const op = E.outBack(prog(L, 0.4, 1.2)) * (1 - E.inCubic(prog(L, 10.5, 11.4)));
  const dw = fw * (1 - op * 0.85);
  box(ctx, fx + fw - dw, GY - 700, dw, 700, 0, C.off); if (dw > 40) box(ctx, fx + fw - dw + 16, GY - 560, 14, 140, 0, C.grey2, 3);
  // sandwiches and snacks on the side
  nb_table(ctx, 500, 920, GY - 260);
  for (let k = 0; k < 3; k++) { const q = pop(L, 4.5 + k * 0.25); if (q > 0) icon(ctx, k === 2 ? 'box' : 'sandwich', 580 + k * 130, GY - 310 - (k % 2) * 10, q * 1.3); }
  nb_coolbox(ctx, 760, GY + 90, 1.1);
  const nk = pop(L, 7.2, SPRING.wobbly);
  if (nk > 0) nb_paper(ctx, 760, GY - 40, 200 * nk, 70 * nk, -0.08, () => { if (nk > 0.6) text(ctx, 'ICE PACKS!', 0, 12, font(36, 800, DISPLAY), C.red, 'center'); });
  label(ctx, 'IN THE FRIDGE', 690, 330, 44, C.navy, C.white, pop(L, 2.7));
  ctx.restore();
}
// 7. kids' kit
function sceneKids(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(6); ctx.save(); ctx.translate(ax, 0);
  const on = L > 2.6;
  const ek = pop(L, 2.2, SPRING.bouncy);
  if (!on && ek > 0) withT(ctx, 400, 360 - ek * 60, ek, 0, () => itemEar(ctx));
  person(ctx, 'K', { x: 400, y: GY + 90, scale: 1.05, earDef: on, look: 0.2, aL: on ? [-2.4, -0.6] : [-0.2, -0.2], aR: on ? [2.4, 0.6] : [0.2, 0.2], mouth: on ? 0.6 : 0.2, blink: blinkAt(L, 8), hop: on ? Math.max(0, Math.sin((L - 2.6) * Math.PI)) * 20 * (L < 5 ? 1 : 0) : 0 });
  person(ctx, 'B', { x: 160, y: GY + 70, scale: 0.92, look: 0.6, aR: [1.2, 0.5], blink: blinkAt(L, 9), mouth: 0.3 * bump(L, 3, 1) });
  label(ctx, 'ONE PAIR EACH', 400, 270, 44, C.red, C.white, pop(L, 2.8));
  // spare clothes rolled in a carrier bag
  const ck = pop(L, 4.5, SPRING.bouncy);
  if (ck > 0) withT(ctx, 780, GY - 40, ck, 0, () => { ctx.beginPath(); ctx.moveTo(-80, -100); ctx.lineTo(80, -100); ctx.lineTo(70, 60); ctx.lineTo(-70, 60); ctx.closePath(); fs(ctx, C.white); limb(ctx, [[-50, -100], [-30, -150], [30, -150], [50, -100]], 4, C.white); nb_fold(ctx, -20, -40, 90, C.teal); nb_fold(ctx, 20, 0, 90, C.gold); });
  label(ctx, 'SPARE CLOTHES', 780, GY - 230, 40, C.teal, C.white, pop(L, 4.7));
  // phone number wristband
  const wk = pop(L, 6.5, SPRING.bouncy);
  if (wk > 0) withT(ctx, 640, 400, wk, -0.06, () => { box(ctx, -190, -40, 380, 80, 0, C.gold); text(ctx, 'MUM: 07700 900123', 0, 14, font(36, 800, DISPLAY), C.navy, 'center'); circ(ctx, -160, 0, 10, C.white, 3); circ(ctx, 160, 0, 10, C.white, 3); });
  label(ctx, 'YOUR NUMBER ON EACH CHILD', 600, 520, 38, C.navy, C.white, pop(L, 6.9));
  ctx.restore();
}
// 8. camera kit
function sceneCamera(ctx, u, L) {
  nb_room(ctx, u, null);
  const ax = artX(7); ctx.save(); ctx.translate(ax, 0);
  nb_table(ctx, 60, 920, GY - 260);
  const ck = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 330, GY - 440, ck * 3.2, 0, () => ICON.camera(ctx));
  // a cloth wipes the lens
  if (L > 2.3 && L < 4.3) { const wx = Math.sin((L - 2.3) * Math.PI * 3) * 40; withT(ctx, 340 + wx, GY - 410, 1, 0.2, () => box(ctx, -40, -30, 80, 60, 6, C.gold, 4)); }
  const sh = bump(L, 4.2, 0.4); if (sh > 0) { ctx.globalAlpha = sh; puff(ctx, 370, GY - 450, 30, C.white); ctx.globalAlpha = 1; }
  label(ctx, 'CLEAN LENS', 330, 290, 44, C.navy, C.white, pop(L, 2.5));
  // settings card
  const sk = pop(L, 4.5, SPRING.bouncy);
  if (sk > 0) withT(ctx, 720, 330, sk, 0.03, () => {
    box(ctx, -170, -150, 340, 300, 0, '#1C2A36');
    [['SHUTTER', '1/1000'], ['FOCUS', 'AF-C'], ['BURST', 'HIGH']].forEach(([a, b], k) => {
      const rk = E.outQuint(prog(L, 4.6 + k * 0.3, 5.2 + k * 0.3));
      ctx.globalAlpha = rk; text(ctx, a, -140, -70 + k * 80, font(34, 800, DISPLAY), C.white); text(ctx, b, 140, -70 + k * 80, font(34, 800, DISPLAY), C.gold, 'right'); ctx.globalAlpha = 1;
    });
  });
  const rk = pop(L, 6.5, SPRING.bouncy);
  if (rk > 0) withT(ctx, 720, GY - 340, rk * 1.4, 0, () => { ctx.beginPath(); ctx.moveTo(-110, 30); ctx.quadraticCurveTo(-90, -70, 0, -70); ctx.quadraticCurveTo(90, -70, 110, 30); ctx.closePath(); fs(ctx, '#9FD3EE'); limb(ctx, [[-60, 0], [-60, -40]], 1, C.white); });
  label(ctx, 'RAIN COVER', 720, 610, 42, C.teal, C.white, pop(L, 6.8));
  ctx.restore();
}
// 9. before bed
function sceneBed(ctx, u, L) {
  nb_room(ctx, u, [80, 120]);
  const ax = artX(8); ctx.save(); ctx.translate(ax, 0);
  // the front door with the bag and keys by it
  nb_door(ctx, 680);
  // two alarms: phone and a clock
  nb_table(ctx, 80, 440, GY - 260);
  const ring = (L > 2.4 && L < 3.8) ? Math.sin(L * 60) * 0.12 : 0;
  const a1 = pop(L, 2.4, SPRING.bouncy), a2 = pop(L, 2.8, SPRING.bouncy);
  if (a1 > 0) withT(ctx, 180, GY - 320, a1, ring, () => { wallClock(ctx, 0, 0, 52, 30); circ(ctx, -40, -46, 16, C.red, 4); circ(ctx, 40, -46, 16, C.red, 4); });
  if (a2 > 0) withT(ctx, 340, GY - 330, a2, -ring, () => phoneH(ctx, 0, 0, 0.6, C.gold));
  label(ctx, 'TWO ALARMS', 260, 440, 44, C.red, C.white, pop(L, 2.6));
  // the leave time on a note
  const nk = pop(L, 4.5, SPRING.wobbly);
  if (nk > 0) nb_paper(ctx, 440, 330, 300 * nk, 150 * nk, 0.05, () => { if (nk > 0.6) { text(ctx, 'OUT OF THE DOOR', 0, -14, font(32, 800, DISPLAY), C.navy, 'center'); text(ctx, '06:30', 0, 42, font(52, 800, DISPLAY), C.red, 'center'); } });
  // banned items come out of the bag
  rucksack(ctx, 600, GY + 70, 1.1, C.blue);
  [['knife', 6.6, -1], ['drone', 6.9, 1]].forEach(([it, b, dir]) => {
    const p = prog(L, b, b + 0.9); if (p <= 0) return;
    const x = 600 + dir * p * 160, y = GY - 120 - Math.sin(p * Math.PI) * 220 + p * 40;
    icon(ctx, it, x, y, 0.9, p * dir);
    if (p >= 1) tickSq(ctx, x, y - 60, pop(L, b + 0.9, SPRING.wobbly) * 0.8, false);
  });
  icon(ctx, 'keys', 800, GY + 40, 1.2);
  person(ctx, 'A', { x: 470, y: GY + 80, scale: 0.85, look: 0.4, aL: [-2.6 * bump(L, 9.5, 1.5), -0.3], blink: blinkAt(L, 12) || (L > 9 && L < 10.6), mouth: 0.8 * bump(L, 9.8, 0.8) });
  label(ctx, 'BAG BY THE DOOR', 790, 330, 40, C.teal, C.white, pop(L, 8.6));
  ctx.restore();
}
const SCENES = [sceneTickets, sceneTravel, sceneWeather, sceneCharge, scenePack, sceneFood, sceneKids, sceneCamera, sceneBed];
