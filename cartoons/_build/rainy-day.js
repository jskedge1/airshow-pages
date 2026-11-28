//@@COPY
// Copy from rainy-day-plan.html (Rainy Day Plan): will it fly, the forecast, wear and pack, kids, indoors,
// your camera, muddy car parks and refunds.
const STEPS = [
  { title: 'Will it still fly?', q: 'Most of the time, yes', b: ['Pilots can fly in rain', 'Cloud and visibility matter most', 'Low cloud means a flat show'] },
  { title: 'Check the updates', q: 'From about 09:00 on the day', b: ["The show's Facebook or X page", 'Changes get posted there first', 'Then listen to the commentator'] },
  { title: 'Dress for it', q: 'A warm layer under a waterproof', b: ['A hood beats an umbrella', 'Waterproof trousers and wellies', 'Leave the jeans at home'] },
  { title: 'Pack the extras', q: 'On top of your normal day bag', b: ['Spare socks in a sealed bag', 'Bin bags to sit on', 'A flask of something hot'] },
  { title: 'Keep kids happy', q: 'Dry, warm and busy', b: ['A puddle suit over their clothes', 'Spotter sheets and binoculars', 'Ear defenders still matter'] },
  { title: 'Head under cover', q: 'Hangars, marquees and food areas', b: ['Museum shows are best when wet', 'Go in as a shower starts', 'Seafront? The town is your shelter'] },
  { title: 'Protect your camera', q: 'A few cheap bits of kit', b: ['A rain cover or a clear bag', 'Keep the lens hood on', 'Let it warm up slowly in the bag'] },
  { title: 'Muddy car parks', q: 'Getting out again', b: ['Park where the marshals say', 'Drive out gently in a low gear', 'Stuck? Stop and ask a marshal'] },
  { title: 'Tickets and refunds', q: 'Read the terms before you buy', b: ['Usually no refund if it opens', 'Look at ticket protection', 'Book a room you can cancel'] },
];
const INTRO_WORDS = ['YOUR AIRSHOW', 'RAINY DAY', 'PLAN'], INTRO_TAG = 'PACK FOR RAIN, GO ANYWAY', INTRO_SUB = 'Staying dry and still seeing the flying';
const OUTRO_LINE = 'Pack for rain, and go anyway!', OUTRO_LINES = ['Pack for rain,', 'and go anyway!'];
const URL = 'ukairshowguide.co.uk/airshow-rainy-day-plan';
const RD = { grey: '#AEB9C2', grey2: '#D5DCE2', cloud: '#C4CDD5', mud: '#8B6A47', mud2: '#6E5236', mac: '#F5B942', puddle: '#7FB6D6' };
//@@HITS
HITS.push([st(0) + 1, 'flat pass', 'whoosh', { len: 1.4, from: 300, to: 1400, gain: 0.16 }]);
HITS.push([st(1) + 0.6, 'phone', 'thud', { gain: 0.14 }], [st(1) + 2.6, 'post', 'blip', { pitch: 'E6', gain: 0.12 }]);
HITS.push([st(2) + 2.6, 'umbrella out', 'thud', { gain: 0.16 }]);
for (const d of [2.5, 4.5, 6.5]) HITS.push([st(3) + d, 'into the bag', 'thud', { pitch: 220, gain: 0.12 }]);
HITS.push([st(4) + 2.6, 'splash', 'whoosh', { len: 0.4, from: 2400, to: 600, gain: 0.14 }]);
HITS.push([st(5) + 0.6, 'hangar', 'thud', { gain: 0.16 }]);
HITS.push([st(6) + 2.6, 'cover on', 'whoosh', { len: 0.3, from: 900, to: 2400, gain: 0.1 }]);
HITS.push([st(7) + 1, 'car', 'whoosh', { len: 1.6, from: 200, to: 500, gain: 0.12 }]);
HITS.push([st(8) + 2.6, 'no refund', 'thud', { gain: 0.18 }]);
//@@SCENES
// ---- rainy-day helpers (rd_)
// seeded rain streaks, a pure function of u
function rd_rain(ctx, u, x0, x1, y0, y1, n = 90, seed = 3, a = 0.7) {
  ctx.save(); ctx.strokeStyle = `rgba(90,120,150,${a})`; ctx.lineWidth = 4; ctx.lineCap = 'round';
  const h = y1 - y0;
  for (let i = 0; i < n; i++) {
    const sp = 700 + hash01(i, seed + 2) * 400;
    const y = y0 + ((hash01(i, seed + 1) * h + u * sp) % h);
    const x = x0 + hash01(i, seed) * (x1 - x0) - (y - y0) * 0.18;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 38); ctx.stroke();
  }
  ctx.restore();
}
function rd_wet(ctx, u, seed = 1) { sky(ctx, u, RD.grey, RD.cloud); }
function rd_umbrella(ctx, x, y, s, col = C.navy, rot = 0) {
  withT(ctx, x, y, s, rot, () => {
    limb(ctx, [[0, 0], [0, -170], [0, -170]], 4, '#2B3237');
    ctx.beginPath(); ctx.arc(0, -170, 120, Math.PI, TAU); ctx.lineTo(-120, -170); ctx.closePath(); fs(ctx, col);
    for (const k of [-0.5, 0.5]) { ctx.beginPath(); ctx.moveTo(0, -290); ctx.quadraticCurveTo(k * 60, -230, k * 80, -170); ink(ctx, 4); ctx.stroke(); }
    limb(ctx, [[0, 0], [0, 18], [14, 24]], 3, '#2B3237');
  });
}
// hood drawn over a person's head (same maths as person(): head at y - 338 * s)
function rd_hood(ctx, x, y, scale, col, flip = false) {
  const s = scale * 1.12; const hx = x, hy = y - 338 * s;
  ctx.save(); ctx.beginPath(); ctx.arc(hx, hy, 70 * s, Math.PI * 0.92, Math.PI * 2.08); ctx.lineWidth = 24 * s + LW * 2; ctx.strokeStyle = C.navy; ctx.lineCap = 'round'; ctx.stroke();
  ctx.lineWidth = 24 * s; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
}
function rd_wellies(ctx, x, y, scale, col = '#2E7D4F') {
  const s = scale * 1.12;
  for (const side of [-1, 1]) { box(ctx, x + side * 24 * s - 22 * s, y - 80 * s, 44 * s, 80 * s, 0, col, 4); box(ctx, x + side * 24 * s - 26 * s + side * 8 * s, y - 14 * s, 52 * s, 18 * s, 0, col, 4); }
}
function rd_puddle(ctx, x, y, w, splash = 0) {
  ell(ctx, x, y, w, w * 0.18, RD.puddle, 4);
  if (splash > 0) for (let k = 0; k < 7; k++) { const a = Math.PI + (k + 0.5) / 7 * Math.PI; puff(ctx, x + Math.cos(a) * w * 0.6 * splash, y + Math.sin(a) * w * 0.7 * splash, 10 * (1 - splash * 0.5), RD.puddle, 1 - splash * 0.6); }
}
function rd_bigphone(ctx, x, y, s, lines, k) {
  withT(ctx, x, y, s, 0, () => {
    box(ctx, -170, -300, 340, 600, 26, '#2B3237');
    ctx.fillStyle = C.off; ctx.fillRect(-146, -260, 292, 520);
    ctx.fillStyle = C.blue; ctx.fillRect(-146, -260, 292, 70); text(ctx, 'SHOW UPDATE', 0, -212, font(40, 800, DISPLAY), C.white, 'center');
    lines.forEach(([str, b, col], j) => {
      const q = E.outQuint(prog(k, b, b + 0.7)); if (q <= 0) return;
      ctx.save(); ctx.beginPath(); ctx.rect(-146, -170 + j * 120, 292 * q, 110); ctx.clip();
      box(ctx, -128, -160 + j * 120, 256, 96, 0, C.white, 3);
      text(ctx, str, -110, -100 + j * 120, font(34, 800, DISPLAY), col);
      ctx.restore();
    });
  });
}
function rd_car(ctx, x, y, s, col = C.blue, spin = 0, tilt = 0) {
  withT(ctx, x, y, s, tilt, () => {
    ctx.beginPath(); ctx.moveTo(-180, -40); ctx.lineTo(-170, -100); ctx.lineTo(-90, -110); ctx.lineTo(-50, -170); ctx.lineTo(80, -170); ctx.lineTo(130, -110); ctx.lineTo(180, -100); ctx.lineTo(190, -40); ctx.closePath(); fs(ctx, col);
    box(ctx, -40, -158, 54, 44, 0, '#BFE6F2', 4); box(ctx, 24, -158, 54, 44, 0, '#BFE6F2', 4);
    for (const wx of [-110, 120]) { circ(ctx, wx, -34, 38, '#2B3237'); withT(ctx, wx, -34, 1, spin, () => limb(ctx, [[-20, 0], [20, 0]], 3, C.grey)); }
  });
}
function rd_flask(c) { box(c, -24, -60, 48, 120, 10, C.red); box(c, -20, -78, 40, 22, 4, C.navy, 4); c.fillStyle = C.white; c.fillRect(-21, -10, 42, 12); }
function rd_socks(c) { box(c, -56, -46, 112, 92, 6, 'rgba(191,230,242,0.9)', 4); for (const dx of [-22, 18]) { c.beginPath(); c.moveTo(dx - 12, -30); c.lineTo(dx + 8, -30); c.lineTo(dx + 8, 14); c.lineTo(dx + 26, 14); c.lineTo(dx + 26, 30); c.lineTo(dx - 12, 30); c.closePath(); fs(c, dx < 0 ? C.red : C.teal, 4); } }
function rd_binbag(c) { c.beginPath(); c.moveTo(-50, 50); c.quadraticCurveTo(-64, -10, -30, -40); c.lineTo(-10, -60); c.lineTo(10, -60); c.lineTo(30, -40); c.quadraticCurveTo(64, -10, 50, 50); c.closePath(); fs(c, '#2B3237'); limb(c, [[-14, -60], [0, -74], [14, -60]], 3, '#2B3237'); }
function rd_jeans(c) { c.beginPath(); c.moveTo(-40, -60); c.lineTo(40, -60); c.lineTo(46, 60); c.lineTo(10, 60); c.lineTo(0, -10); c.lineTo(-10, 60); c.lineTo(-46, 60); c.closePath(); fs(c, '#3C6AA8'); }
function rd_doc(ctx, x, y, w, h, k, L) {
  withT(ctx, x, y, k, (1 - k) * -0.15, () => {
    ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(-w / 2 + 12, -h / 2 + 14, w, h);
    box(ctx, -w / 2, -h / 2, w, h, 0, C.white);
    ctx.fillStyle = C.navy; ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, 80); text(ctx, 'TICKET TERMS', 0, -h / 2 + 58, font(48, 800, DISPLAY), C.white, 'center');
    const words = ['WEATHER', 'CANCELLATION', 'REFUNDS'];
    for (let r = 0; r < 7; r++) {
      const yy = -h / 2 + 130 + r * 52;
      const wi = r === 1 ? 0 : r === 3 ? 1 : r === 5 ? 2 : -1;
      if (wi >= 0) {
        const hk = E.outCubic(prog(L, 2.3 + wi * 2, 2.9 + wi * 2));
        ctx.font = font(34, 800, DISPLAY); const tw = ctx.measureText(words[wi]).width;
        ctx.fillStyle = C.gold; ctx.fillRect(-w / 2 + 34, yy - 30, (tw + 16) * hk, 40);
        text(ctx, words[wi], -w / 2 + 42, yy, font(34, 800, DISPLAY), C.navy);
        box(ctx, -w / 2 + 60 + tw, yy - 18, w - 120 - tw, 14, 0, C.sky2, 0);
      } else { box(ctx, -w / 2 + 34, yy - 18, w - 68 - (r % 2) * 80, 14, 0, C.sky2, 0); }
    }
  });
}

// 1. will it still fly: a flat show under low cloud
function sceneFly(ctx, u, L) {
  rd_wet(ctx, u); hills(ctx, '#A9C99A'); ground(ctx);
  const ax = artX(0); ctx.save(); ctx.translate(ax, 0);
  // low cloud layer
  for (let k = 0; k < 9; k++) cloud(ctx, -40 + k * 130 + Math.sin(u * 0.4 + k) * 10, 200 + (k % 2) * 30, 0.9, '#B9C3CC');
  // cloud base marker
  const ck = E.outCubic(prog(L, 4.3, 5));
  if (ck > 0) { ink(ctx, 4); ctx.setLineDash([16, 14]); ctx.beginPath(); ctx.moveTo(0, 290); ctx.lineTo(980 * ck, 290); ctx.stroke(); ctx.setLineDash([]); }
  // the flat pass, low and close under the cloud
  redArrows(ctx, prog(L, 0.6, 9.5), -260, 1250, 380, 0.75);
  rd_rain(ctx, u, 0, 1000, 120, GY + 120, 110, 3);
  person(ctx, 'B', { x: 560, y: GY + 70, scale: 0.85, look: -0.3, lookY: -0.7, aR: [2.6, 0.25], aL: [-0.3, -0.2], blink: blinkAt(L, 3), mouth: 0.5, holdR: (c) => rd_umbrella(c, 0, 0, 0.8, C.teal) });
  person(ctx, 'K', { x: 700, y: GY + 80, scale: 0.85, look: -0.3, lookY: -0.8, aL: [-2.6, 0], aR: [2.6, 0], mouth: 0.7, earDef: true, hop: Math.max(0, Math.sin(L * Math.PI)) * 18 });
  rd_hood(ctx, 700, GY + 80, 0.85 * 0.68, RD.mac);
  label(ctx, 'STILL FLYING', 250, 560, 52, '#2E9E5B', C.white, pop(L, 2.5));
  label(ctx, 'CLOUD BASE', 840, 330, 40, C.navy, C.white, pop(L, 4.6));
  label(ctx, 'FLAT SHOW', 250, 680, 52, C.red, C.white, pop(L, 6.5));
  ctx.restore();
}
// 2. check the updates from about 09:00
function sceneUpdates(ctx, u, L) {
  rd_wet(ctx, u); hills(ctx, '#A9C99A'); ground(ctx);
  const ax = artX(1); ctx.save(); ctx.translate(ax, 0);
  rd_rain(ctx, u, 0, 1000, 120, GY + 120, 80, 7);
  const pk = pop(L, 0.5, SPRING.bouncy);
  if (pk > 0) withT(ctx, 0, 0, 1, 0, () => rd_bigphone(ctx, 330, 500, pk * 0.95, [['FLYING STARTS 13:00', 2.4, C.navy], ['PARKING: FIELD B', 4.4, C.red], ['ENJOY THE SHOW!', 6.4, C.tealD]], L));
  const ck = pop(L, 1, SPRING.bouncy);
  if (ck > 0) withT(ctx, 690, 290, ck, 0, () => { wallClock(ctx, 0, 0, 80, 540); });
  label(ctx, '09:00', 690, 410, 48, C.navy, C.white, pop(L, 1.3));
  // a tannoy speaker on a pole
  box(ctx, 860, 330, 16, GY - 330, 0, C.grey2, 0);
  const sk = pop(L, 6.5, SPRING.bouncy);
  withT(ctx, 868, 330, 1, 0, () => { ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(-70, -60); ctx.lineTo(-70, 40); ctx.lineTo(-10, 10); ctx.closePath(); fs(ctx, C.off); });
  for (let k = 0; k < 3; k++) { const a = bump((L * 2 + k * 0.6) % 3, 1, 0.8) * sk; if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(790, 325, 30 + k * 24, Math.PI * 0.7, Math.PI * 1.3); ink(ctx, 5); ctx.stroke(); ctx.restore(); } }
  label(ctx, 'COMMENTARY', 740, 520, 44, C.teal, C.white, sk);
  person(ctx, 'S2', { x: 650, y: GY + 70, scale: 0.85, look: -0.6, aL: [-1.6, -0.6], blink: blinkAt(L, 6), holdL: (c) => phoneH(c, 0, -20, 0.5) });
  rd_hood(ctx, 650, GY + 70, 0.85, C.teal);
  ctx.restore();
}
// 3. dress for it
function sceneWear(ctx, u, L) {
  rd_wet(ctx, u); hills(ctx, '#A9C99A'); ground(ctx);
  const ax = artX(2); ctx.save(); ctx.translate(ax, 0);
  rd_rain(ctx, u, 0, 1000, 120, GY + 120, 100, 11);
  // B in a yellow waterproof, hood up, wellies
  const bx = 330, by = GY + 70, bs = 0.95;
  person(ctx, 'B', { x: bx, y: by, scale: bs, shirt: RD.mac, pants: '#33465A', look: 0.4, blink: blinkAt(L, 8), mouth: 0.3 });
  rd_hood(ctx, bx, by, bs, RD.mac);
  if (L > 4.3) rd_wellies(ctx, bx, by, bs * pop(L, 4.5, SPRING.bouncy));
  // umbrella turned away
  const uk = pop(L, 2.5, SPRING.bouncy);
  if (uk > 0) { withT(ctx, 690, 520, uk * 0.9, 0.35, () => rd_umbrella(ctx, 0, 120, 0.9, C.navy)); tickSq(ctx, 760, 330, uk * 1.1, false); }
  label(ctx, 'HOOD UP', 330, 170 + 60, 50, C.teal, C.white, pop(L, 2.7));
  label(ctx, 'WELLIES', 560, 840, 50, '#2E7D4F', C.white, pop(L, 4.6));
  const jk = pop(L, 6.5, SPRING.bouncy);
  if (jk > 0) { withT(ctx, 840, 650, jk, 0, () => rd_jeans(ctx)); tickSq(ctx, 840, 650, jk * 1.2, false); label(ctx, 'NO JEANS', 840, 790, 44, C.red, C.white, jk); }
  ctx.restore();
}
// 4. pack the extras: into the rucksack
function scenePack(ctx, u, L) {
  rd_wet(ctx, u); hills(ctx, '#A9C99A'); ground(ctx);
  const ax = artX(3); ctx.save(); ctx.translate(ax, 0);
  const bx = 330, top = 300;
  box(ctx, bx - 220, top, 440, 520, 60, C.blue);
  box(ctx, bx - 190, top + 40, 380, 440, 0, '#EAF1F6', 5);
  const its = [[rd_socks, -90, 170, 2.5], [rd_binbag, 90, 190, 4.5], [rd_flask, 0, 380, 6.5]];
  its.forEach(([fn, dx, y, b]) => { const q = prog(L, b - 0.5, b); if (q <= 0) return; withT(ctx, bx + dx, lerp(top - 260, top + y, E.outBounce(q)), 1.1, (1 - q) * 0.5, () => fn(ctx)); });
  const fo = E.outBack(prog(L, 0.4, 1.4), 1.6);
  withT(ctx, bx - 200, top + 10, 1, -fo * 0.32, () => { box(ctx, 0, -40, 400, 60, 24, C.navy); });
  label(ctx, 'SPARE SOCKS', 720, 360, 46, C.red, C.white, pop(L, 2.6));
  label(ctx, 'BIN BAGS', 720, 480, 46, C.navy, C.white, pop(L, 4.6));
  label(ctx, 'HOT FLASK', 720, 600, 46, C.teal, C.white, pop(L, 6.6));
  person(ctx, 'S2', { x: 860, y: GY + 80, scale: 0.75, look: -0.6, aL: [-0.6 - 1.4 * pop(L, 7.2), -1.2], blink: blinkAt(L, 9), mouth: 0.4 * bump(L, 7.6, 1.5) });
  rd_hood(ctx, 860, GY + 80, 0.75, C.teal);
  ctx.restore();
}
// 5. keep kids happy: puddle suit, spotter sheet, ear defenders
function sceneKids(ctx, u, L) {
  rd_wet(ctx, u); hills(ctx, '#A9C99A'); ground(ctx);
  const ax = artX(4); ctx.save(); ctx.translate(ax, 0);
  rd_rain(ctx, u, 0, 1000, 120, GY + 120, 70, 13, 0.4);
  const ph = (L * 1.3) % 2, hop = Math.max(0, Math.sin(ph * Math.PI)) * 90 * (ph < 1 ? 1 : 0);
  const splash = ph >= 1 && ph < 1.5 ? (ph - 1) * 2 : 0;
  rd_puddle(ctx, 300, GY + 90, 170, splash);
  person(ctx, 'K', { x: 300, y: GY + 80, scale: 1.25, hop, shirt: C.red, pants: C.red, aL: [-2.4, 0], aR: [2.4, 0], mouth: 0.8, look: 0.2, earDef: L > 6.3, squash: splash > 0 ? 0.06 : 0 });
  if (L > 6.3) {} // ear defenders drawn by person()
  rd_wellies(ctx, 300, GY + 80 - hop, 1.25 * 0.68, C.gold);
  label(ctx, 'PUDDLE SUIT', 300, 300, 50, C.red, C.white, pop(L, 2.5));
  // spotter sheet + binoculars
  const sk = pop(L, 4.5, SPRING.bouncy);
  if (sk > 0) withT(ctx, 740, 470, sk, 0.06, () => {
    box(ctx, -150, -190, 300, 380, 0, C.white);
    ctx.fillStyle = C.navy; ctx.fillRect(-147, -187, 294, 64); text(ctx, 'SPOTTER SHEET', 0, -142, font(38, 800, DISPLAY), C.white, 'center');
    [[C.red, 'hawk'], [C.blue, 'ty'], ['a400', 'a4']].forEach(([b], j) => { const y = -70 + j * 90; box(ctx, -120, y - 24, 48, 48, 0, j < Math.floor((L - 5) / 0.8) ? C.teal : C.white, 4); jet(ctx, 40, y, 0.5, 0, b); });
  });
  if (sk > 0) withT(ctx, 600, 740, sk, -0.2, () => itemBinos(ctx));
  label(ctx, 'EAR DEFENDERS', 300, 420, 46, C.navy, C.white, pop(L, 6.5));
  ctx.restore();
}
// 6. head under cover: a hangar with a Typhoon inside
function sceneIndoors(ctx, u, L) {
  rd_wet(ctx, u); hills(ctx, '#A9C99A'); ground(ctx);
  const ax = artX(5); ctx.save(); ctx.translate(ax, 0);
  const hk = pop(L, 0.4, SPRING.snappy);
  withT(ctx, 0, (1 - hk) * 300, 1, 0, () => {
    // hangar: straight walls, curved roof
    ctx.beginPath(); ctx.moveTo(60, GY); ctx.lineTo(60, 420); ctx.quadraticCurveTo(480, 200, 900, 420); ctx.lineTo(900, GY); ctx.closePath(); fs(ctx, '#C9D3DA');
    for (let x = 120; x < 900; x += 70) limb(ctx, [[x, 440], [x, GY - 4]], 1, '#B2BEC8');
    ctx.fillStyle = '#E9EEF2'; ctx.fillRect(250, 520, 460, GY - 520); ink(ctx); ctx.strokeRect(250, 520, 460, GY - 520);
    box(ctx, 330, 410, 300, 74, 0, C.navy); text(ctx, 'HANGAR 1', 480, 464, font(52, 800, DISPLAY), C.white, 'center');
    jet(ctx, 480, 760, 1.25, 0, C.blue);
  });
  rd_rain(ctx, u, 0, 1000, 120, GY + 120, 60, 17, 0.45);
  const wp = prog(L, 3.4, 6.4);
  ['K', 'B'].forEach((w, k) => { if (wp < 1) person(ctx, w, { x: lerp(-120 - k * 150, 380 + k * 120, E.inOutSine(wp)), y: GY + 110, scale: 0.75, walk: wp > 0 ? L * 7 + k : undefined, look: 0.6, blink: blinkAt(L, 20 + k), mouth: 0.3 }); });
  if (wp >= 1) label(ctx, 'DRY!', 480, 600, 56, '#2E9E5B', C.white, pop(L, 6.4));
  label(ctx, 'MUSEUM SHOWS', 480, 300, 48, C.teal, C.white, pop(L, 2.5) * (1 - pop(L, 4.4)));
  label(ctx, 'GO IN EARLY', 480, 300, 48, C.navy, C.white, pop(L, 4.5) * (1 - pop(L, 6.4)));
  label(ctx, 'SEAFRONT? TOWN CAFES', 480, 300, 48, C.red, C.white, pop(L, 6.5));
  ctx.restore();
}
// 7. protect your camera
function sceneCamera(ctx, u, L) {
  rd_wet(ctx, u); hills(ctx, '#A9C99A'); ground(ctx);
  const ax = artX(6); ctx.save(); ctx.translate(ax, 0);
  rd_rain(ctx, u, 0, 1000, 120, GY + 120, 90, 19);
  const ck = pop(L, 0.5, SPRING.bouncy);
  withT(ctx, 380, 520, ck * 3.2, 0, () => {
    // camera with a long lens and a lens hood
    box(ctx, -60, -40, 110, 80, 10, '#2B3237', 3);
    box(ctx, -40, -58, 40, 22, 4, '#2B3237', 3);
    box(ctx, 50, -26, 70, 52, 0, '#3B4A57', 3);
    const hk = pop(L, 4.5, SPRING.bouncy);
    if (hk > 0) { ctx.beginPath(); ctx.moveTo(120, -26); ctx.lineTo(120 + 30 * hk, -36); ctx.lineTo(120 + 30 * hk, 36); ctx.lineTo(120, 26); ctx.closePath(); fs(ctx, '#2B3237', 3); }
    circ(ctx, -6, 0, 14, '#9FD3EE', 3);
    // clear rain cover
    const rk = E.outCubic(prog(L, 2.5, 3.2));
    if (rk > 0) { ctx.save(); ctx.globalAlpha = 0.45 * rk; ctx.beginPath(); ctx.moveTo(-76, -70); ctx.quadraticCurveTo(20, -90, 112, -40); ctx.lineTo(112, 44); ctx.quadraticCurveTo(20, 70, -76, 56); ctx.closePath(); ctx.fillStyle = '#EAF6FC'; ctx.fill(); ctx.globalAlpha = rk; ink(ctx, 2); ctx.stroke(); ctx.restore(); }
  });
  label(ctx, 'RAIN COVER', 380, 250, 50, C.teal, C.white, pop(L, 2.6));
  label(ctx, 'LENS HOOD ON', 720, 720, 46, C.navy, C.white, pop(L, 4.6));
  // camera bag with silica gel, warming slowly
  const gk = pop(L, 6.5, SPRING.bouncy);
  if (gk > 0) withT(ctx, 160, 790, gk, 0, () => { box(ctx, -90, -70, 180, 120, 14, '#4A5A66'); box(ctx, -60, -40, 120, 40, 0, C.off, 3); text(ctx, 'SILICA', 0, -10, font(26, 800, DISPLAY), C.navy, 'center'); });
  label(ctx, 'WARM UP SLOWLY', 380, 880, 44, C.red, C.white, pop(L, 6.7));
  ctx.restore();
}
// 8. muddy car parks
function sceneMud(ctx, u, L) {
  rd_wet(ctx, u); hills(ctx, '#A9C99A'); ground(ctx, '#86B56F', '#6E9E59');
  const ax = artX(7); ctx.save(); ctx.translate(ax, 0);
  for (let k = 0; k < 6; k++) ell(ctx, 80 + k * 170 + hash01(k, 5) * 40, GY + 60 + (k % 2) * 60, 90, 22, RD.mud, 0);
  rd_rain(ctx, u, 0, 1000, 120, GY + 120, 70, 23, 0.45);
  // marshal waving cars on
  person(ctx, 'T', { x: 820, y: GY + 60, scale: 0.85, look: -0.6, aL: [-1.4 + Math.sin(L * 4) * 0.3, -0.2], blink: blinkAt(L, 30), mouth: 0.3 * bump(L, 7, 1) });
  // a car pulls out gently, wheels turning slowly, a little mud spray
  const cp = prog(L, 1, 10.5);
  const cx = lerp(-200, 560, E.inOutSine(cp));
  rd_car(ctx, cx, GY + 120, 0.95, C.red, L * 1.5, Math.sin(L * 3) * 0.01);
  if (cp > 0 && cp < 1) for (let k = 0; k < 5; k++) { const q = ((L * 2 + k * 0.2) % 1); puff(ctx, cx - 110 * 0.95 - q * 80, GY + 100 - Math.sin(q * Math.PI) * 50, 9, RD.mud2, 1 - q); }
  label(ctx, 'PARK WHERE TOLD', 480, 300, 48, C.navy, C.white, pop(L, 2.5));
  label(ctx, 'LOW GEAR, GENTLY', 480, 420, 48, C.teal, C.white, pop(L, 4.5));
  label(ctx, 'STUCK? ASK', 720, 540, 48, C.red, C.white, pop(L, 6.5));
  ctx.restore();
}
// 9. tickets and refunds: read the terms
function sceneRefund(ctx, u, L) {
  rd_wet(ctx, u); hills(ctx, '#A9C99A'); ground(ctx);
  const ax = artX(8); ctx.save(); ctx.translate(ax, 0);
  rd_doc(ctx, 340, 470, 520, 520, pop(L, 0.4, SPRING.bouncy), L);
  // magnifying glass follows the highlighted words
  const my = kf(L, [[2, 390], [4.4, 494], [6.4, 598], [9, 598]], E.inOutCubic);
  const mk = pop(L, 1.8);
  if (mk > 0) withT(ctx, 470, my - 20, mk, -0.4, () => { limb(ctx, [[60, 60], [130, 130]], 16, '#7A5B3A'); ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fillStyle = 'rgba(191,230,242,0.25)'; ctx.fill(); ink(ctx, 10); ctx.stroke(); });
  label(ctx, 'NO REFUND IF IT OPENS', 660, 180, 42, C.red, C.white, pop(L, 2.6));
  person(ctx, 'S2', { x: 840, y: GY + 70, scale: 0.85, look: -0.6, aL: [-1.2, -0.8], blink: blinkAt(L, 33), mouth: 0.3 });
  rd_hood(ctx, 840, GY + 70, 0.85, C.teal);
  label(ctx, 'TICKET PROTECTION', 300, 790, 44, C.teal, C.white, pop(L, 4.6));
  label(ctx, 'FREE CANCELLATION ROOM', 380, 880, 44, C.navy, C.white, pop(L, 6.6));
  ctx.restore();
}
const SCENES = [sceneFly, sceneUpdates, sceneWear, scenePack, sceneKids, sceneIndoors, sceneCamera, sceneMud, sceneRefund];
