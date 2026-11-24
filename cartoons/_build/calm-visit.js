//@@COPY
// Copy from calm-visit.html (A Calm Airshow Visit). Gentle sound throughout: this film is for people who find noise hard.
const STEPS = [
  { title: 'Pick a calmer show', q: 'The biggest choice you make', b: ['Vintage shows growl, not roar', 'Small shows: room to spread out', 'Seafront shows let you walk away'] },
  { title: 'Find a quieter spot', q: 'Head for the ends of the line', b: ['Fewer people, less commentary', 'Sit a few rows back by a walkway', 'Not under the speaker poles'] },
  { title: 'Protect every ear', q: 'Ear protection for all ages', b: ['Ear defenders for little ones', 'No foam earplugs in small ears', 'Put them on before the flying'] },
  { title: 'Know the loud ones', q: 'Fast jets on afterburner', b: ['Plan around the Typhoon', 'Helicopters thud, warbirds growl', 'Biplanes are the quiet end'] },
  { title: 'Spot the warning signs', q: 'Before a loud one arrives', b: ['Listen to the commentary', 'Watch the end of the runway', 'Lenses lift? Ears on'] },
  { title: 'Quiet rooms', q: 'Some shows offer a calm space', b: ['RIAT has a Wellness Room', 'Duxford has a Quiet Room', 'Not listed? Ask the show'] },
  { title: 'Sunflower lanyards', q: 'A quiet way to ask for help', b: ['Staff know you may need time', 'No diagnosis or proof needed', 'Still tell people what you need'] },
  { title: 'Early or late?', q: 'Which is harder, crowds or noise?', b: ['First hour: the calmest time', 'After lunch: no gate queue', 'Bring ear protection either way'] },
  { title: 'Your exit plan', q: 'Plan the way out first', b: ['Agree a signal for a break', 'Pick a meeting point', 'Leaving early is completely fine'] },
];
const INTRO_WORDS = ['A CALM', 'AIRSHOW', 'VISIT'], INTRO_TAG = 'NOISE AND CROWDS', INTRO_SUB = 'A calmer day out, with a plan';
const OUTRO_LINE = 'Have a calm day out!', OUTRO_LINES = ['Have a calm', 'day out!'];
const URL = 'ukairshowguide.co.uk/calm-airshow-visit';
//@@HITS
// keep everything soft: a film about noise should not be noisy
for (const h of HITS) { if (!h[3]) h[3] = {}; h[3].gain = (h[3].gain ?? 0.25) * (h[2] === 'whoosh' ? 0.45 : 0.7); }
HITS.push([st(3) + 0.6, 'typhoon pass', 'whoosh', { len: 1.4, from: 250, to: 900, gain: 0.07 }]);
HITS.push([st(4) + 7.6, 'ears on', 'blip', { pitch: 'C6', gain: 0.1 }]);
HITS.push([st(6) + 0.6, 'lanyard', 'bell', { pitch: 'E6', gain: 0.1 }]);
HITS.push([st(8) + 2.6, 'signal card', 'pop', { pitch: 'A5', gain: 0.12 }]);
//@@SCENES
// small helpers for this film (cv_ prefix)
function cv_panel(ctx, x, y, w, h, bg, draw) {
  ctx.fillStyle = 'rgba(19,41,60,0.22)'; ctx.fillRect(x + 10, y + 12, w, h);
  box(ctx, x, y, w, h, 0, C.white);
  ctx.save(); ctx.beginPath(); ctx.rect(x + 14, y + 14, w - 28, h - 28); ctx.clip();
  ctx.fillStyle = bg; ctx.fillRect(x + 14, y + 14, w - 28, h - 28); draw(x + 14, y + 14, w - 28, h - 28);
  ctx.restore(); ink(ctx, 4); ctx.strokeRect(x + 14, y + 14, w - 28, h - 28);
}
function cv_windsock(ctx, x, y, s, u) {
  withT(ctx, x, y, s, 0, () => {
    limb(ctx, [[0, 0], [0, -120]], 4, C.grey2);
    const fl = Math.sin(u * 3) * 0.08;
    for (let k = 0; k < 4; k++) { ctx.save(); ctx.translate(0, -120); ctx.rotate(fl); ctx.fillStyle = k % 2 ? C.white : '#F38B2A'; ctx.fillRect(k * 22, -12 + k * 2, 22, 24 - k * 4); ctx.restore(); }
  });
}
function cv_pram(ctx, x, y, s, L) {
  withT(ctx, x, y, s, 0, () => {
    limb(ctx, [[-90, -60], [-130, -150]], 4, C.navy);
    ctx.beginPath(); ctx.moveTo(-90, -130); ctx.lineTo(90, -130); ctx.lineTo(70, -40); ctx.lineTo(-70, -40); ctx.closePath(); fs(ctx, C.blue);
    ctx.beginPath(); ctx.moveTo(10, -130); ctx.arc(10, -130, 80, Math.PI, 1.5 * Math.PI, false); ctx.lineTo(10, -130); ctx.closePath(); fs(ctx, C.teal);
    circ(ctx, -40, -150, 26, C.skin1, 5);
    ell(ctx, -48, -152, 3.5, 5 * (blinkAt(L, 41) ? 0.15 : 1), C.navy, 0); ell(ctx, -30, -152, 3.5, 5 * (blinkAt(L, 41) ? 0.15 : 1), C.navy, 0);
    limb(ctx, [[-66, -150], [-60, -178], [-20, -178], [-14, -150]], 4, C.red); ell(ctx, -66, -148, 9, 13, C.red, 4); ell(ctx, -14, -148, 9, 13, C.red, 4);
    circ(ctx, -50, -20, 22, '#2B3237', 4); circ(ctx, 50, -20, 22, '#2B3237', 4);
  });
}
function cv_sunflower(ctx, x, y, r) {
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; circ(ctx, x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75, r * 0.42, '#FFD329', 2); }
  circ(ctx, x, y, r * 0.48, '#7A4E1E', 2);
}
function cv_lanyard(ctx, x, y, s) {
  withT(ctx, x, y, s, 0, () => {
    ctx.beginPath(); ctx.moveTo(-90, -260); ctx.lineTo(-30, 0); ctx.lineTo(30, 0); ctx.lineTo(90, -260);
    ctx.strokeStyle = C.navy; ctx.lineWidth = 46; ctx.lineJoin = 'round'; ctx.stroke(); ctx.strokeStyle = '#2E9E5B'; ctx.lineWidth = 34; ctx.stroke();
    for (const t of [0.15, 0.45, 0.75]) { cv_sunflower(ctx, lerp(-90, -30, t), lerp(-260, 0, t), 12); cv_sunflower(ctx, lerp(90, 30, t), lerp(-260, 0, t), 12); }
    box(ctx, -110, 0, 220, 160, 0, '#2E9E5B');
    cv_sunflower(ctx, -60, 60, 26); cv_sunflower(ctx, 10, 110, 22); cv_sunflower(ctx, 60, 44, 20);
  });
}
function cv_speaker(ctx, x, y, s, u, on) {
  withT(ctx, x, y, s, 0, () => {
    limb(ctx, [[0, 0], [0, -380]], 6, C.grey2);
    ctx.beginPath(); ctx.moveTo(-10, -400); ctx.lineTo(60, -440); ctx.lineTo(60, -330); ctx.lineTo(-10, -370); ctx.closePath(); fs(ctx, '#5B6B78', 5);
    if (on) for (let k = 0; k < 3; k++) { const r = 40 + k * 34 + ((u * 40) % 34); ctx.globalAlpha = 0.6 - k * 0.18; ctx.beginPath(); ctx.arc(60, -385, r, -0.6, 0.6); ink(ctx, 5); ctx.strokeStyle = C.red; ctx.stroke(); ctx.globalAlpha = 1; }
  });
}
function cv_heads(ctx, x0, x1, y, density, seed) {
  for (let x = x0; x < x1; x += 22) {
    if (hash01(Math.floor(x), seed) > density(x)) continue;
    const yy = y - hash01(Math.floor(x), seed + 3) * 40;
    circ(ctx, x, yy - 26, 13, [C.skin1, C.skin2, C.skin3][Math.floor(hash01(Math.floor(x), seed + 5) * 3)], 3);
    box(ctx, x - 14, yy - 14, 28, 26, 0, [C.red, C.teal, C.gold, C.blue, C.navy][Math.floor(hash01(Math.floor(x), seed + 7) * 5)], 3);
  }
}
function cv_card(ctx, x, y, k, str, bg = C.white, fg = C.navy) {
  if (k <= 0) return;
  withT(ctx, x, y, k, (1 - k) * 0.4, () => { box(ctx, -130, -60, 260, 120, 0, bg); text(ctx, str, 0, 18, font(46, 800, DISPLAY), fg, 'center'); });
}

// 1. pick a calmer show: three kinds of show
function sceneShow(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(0); ctx.save(); ctx.translate(ax, 0);
  const P = [
    ['GENTLER', '#2E9E5B', 2.5, (x, y, w, h) => { ctx.fillStyle = C.grass; ctx.fillRect(x, y + h * 0.72, w, h); cv_windsock(ctx, x + w * 0.75, y + h * 0.78, 0.9, u); cloud(ctx, x + w * 0.3, y + h * 0.3, 0.45); }],
    ['ROOM TO MOVE', C.teal, 4.5, (x, y, w, h) => { ctx.fillStyle = C.sea; ctx.fillRect(x, y + h * 0.55, w, h); ctx.fillStyle = C.sand; ctx.fillRect(x, y + h * 0.8, w, h); cloud(ctx, x + w * 0.6, y + h * 0.25, 0.4); }],
    ['LOUDEST', C.red, 6.5, (x, y, w, h) => { ctx.fillStyle = C.grass; ctx.fillRect(x, y + h * 0.78, w, h); jet(ctx, x + w * 0.5, y + h * 0.45, 0.75, -0.15, C.blue); }],
  ];
  P.forEach(([nm, col, b, draw], k) => {
    const q = pop(L, 0.5 + k * 0.25, SPRING.bouncy); if (q <= 0) return;
    const x = 30 + k * 315, y = 250;
    withT(ctx, x + 140, y + 130, q, 0, () => { ctx.translate(-(x + 140), -(y + 130)); cv_panel(ctx, x, y, 280, 260, '#9FD3EE', draw); });
    label(ctx, nm, x + 140, y + 320, 40, col, C.white, pop(L, b));
  });
  person(ctx, 'A', { x: 330, y: GY + 80, scale: 0.72, look: 0.3, lookY: -0.5, blink: blinkAt(L, 2), aR: [1.9 * pop(L, 2.6), 0.2] });
  person(ctx, 'K', { x: 470, y: GY + 90, scale: 0.72, look: 0.2, lookY: -0.5, blink: blinkAt(L, 3), earDef: true, mouth: 0.3 });
  ctx.restore();
}
// 2. find a quieter spot: busy middle, quiet end
function sceneSpot(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(1); ctx.save(); ctx.translate(ax, 0);
  cv_speaker(ctx, 260, GY - 20, 1, u, L > 6.3);
  cv_heads(ctx, 0, 980, GY - 10, (x) => clamp(1.05 - Math.abs(x - 260) / 420, 0.08, 1), 11);
  for (let x = 10; x < 980; x += 60) box(ctx, x - 5, GY - 10, 10, 70, 0, x % 120 < 60 ? C.white : C.red, 3);
  limb(ctx, [[0, GY + 10], [980, GY + 10]], 3, C.navy);
  label(ctx, 'BUSY MIDDLE', 260, 330, 44, C.red, C.white, pop(L, 2.5));
  label(ctx, 'QUIETER END', 760, 330, 44, C.teal, C.white, pop(L, 2.9));
  // a few rows back, by a walkway
  const wk = pop(L, 4.5, SPRING.snappy);
  if (wk > 0) { ctx.globalAlpha = Math.min(1, wk); ctx.fillStyle = '#D9D4C7'; ctx.fillRect(620, GY + 30, 60, 200); ctx.globalAlpha = 1; }
  person(ctx, 'B', { x: 760, y: GY + 110, scale: 0.7, sit: true, look: -0.3, lookY: -0.5, blink: blinkAt(L, 5), mouth: 0.2 });
  person(ctx, 'K', { x: 880, y: GY + 110, scale: 0.65, sit: true, look: -0.3, lookY: -0.5, blink: blinkAt(L, 6), earDef: true });
  tickSq(ctx, 900, 450, pop(L, 3.2, SPRING.wobbly), true);
  label(ctx, 'NOT UNDER THE SPEAKERS', 430, 450, 40, C.navy, C.white, pop(L, 6.5));
  ctx.restore();
}
// 3. protect every ear: baby, child, adult
function sceneEars(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(2); ctx.save(); ctx.translate(ax, 0);
  const on = (b) => L >= b;
  cv_pram(ctx, 170, GY + 60, 1.1, L);
  person(ctx, 'K', { x: 440, y: GY + 80, scale: 0.85, look: 0.2, blink: blinkAt(L, 8), earDef: on(2.6), mouth: on(2.6) ? 0.4 : 0.1, aL: [-0.4 - 2 * bump(L, 2.6, 0.8), -0.4], aR: [0.4 + 2 * bump(L, 2.6, 0.8), 0.4] });
  person(ctx, 'B', { x: 720, y: GY + 70, scale: 0.92, look: -0.3, blink: blinkAt(L, 9), earDef: on(6.6), aL: [-0.4 - 2 * bump(L, 6.6, 0.8), -0.4], aR: [0.4 + 2 * bump(L, 6.6, 0.8), 0.4] });
  label(ctx, 'BABIES', 160, 640, 40, C.teal, C.white, pop(L, 1));
  label(ctx, 'CHILDREN', 440, 540, 40, C.teal, C.white, pop(L, 1.3));
  label(ctx, 'GROWN UPS', 740, 470, 40, C.teal, C.white, pop(L, 1.6));
  // foam earplug, not for small ears
  const fk = pop(L, 4.5, SPRING.bouncy);
  if (fk > 0) withT(ctx, 300, 250, fk, 0, () => { box(ctx, -150, -70, 300, 140, 0, C.white); ell(ctx, -60, 0, 34, 22, '#F7B267', 5); ell(ctx, 10, 0, 34, 22, '#F7B267', 5); tickSq(ctx, 95, 0, 0.9, false); });
  label(ctx, 'NOT FOR SMALL EARS', 300, 360, 36, C.red, C.white, pop(L, 4.8));
  ctx.restore();
}
// 4. know the loud ones: a loudness chart
function sceneLoud(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(3); ctx.save(); ctx.translate(ax, 0);
  const bk = pop(L, 0.3, SPRING.bouncy);
  const R = [['FAST JETS', 1, C.red, 2.5], ['HELICOPTERS', 0.8, '#F38B2A', 4.5], ['RED ARROWS', 0.66, C.gold, 4.9], ['WARBIRDS', 0.52, C.teal, 5.3], ['BIPLANES', 0.24, '#2E9E5B', 6.5]];
  withT(ctx, 470, 500, bk, 0, () => {
    box(ctx, -420, -300, 840, 600, 0, C.white);
    ctx.fillStyle = C.navy; ctx.fillRect(-417, -297, 834, 80); text(ctx, 'ROUGHLY HOW LOUD', 0, -240, font(50, 800, DISPLAY), C.white, 'center');
    R.forEach(([nm, v, col, b], k) => {
      const y = -170 + k * 96;
      text(ctx, nm, -390, y + 16, font(38, 800, DISPLAY), C.navy);
      box(ctx, -130, y - 28, 520, 56, 0, C.off, 4);
      const g = E.outCubic(prog(L, b, b + 0.8)) * v;
      if (g > 0.01) box(ctx, -130, y - 28, 520 * g, 56, 0, col, 4);
    });
  });
  // a Typhoon pass at the top, small and above the chart
  const tp = prog(L, 0.6, 4.2);
  if (tp > 0 && tp < 1) jet(ctx, lerp(-200, 1180, tp), 170 - Math.sin(tp * Math.PI) * 30, 0.6, -0.05, C.blue);
  ctx.restore();
}
// 5. spot the warning signs
function sceneSigns(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(4); ctx.save(); ctx.translate(ax, 0);
  // runway with a Typhoon waiting at the end
  ctx.fillStyle = '#8D9CA8'; ctx.fillRect(-100, GY - 70, 1200, 46);
  for (let x = -100; x < 1100; x += 120) { ctx.fillStyle = C.white; ctx.fillRect(x, GY - 50, 60, 6); }
  const roll = E.inCubic(prog(L, 8.5, 11.5));
  jet(ctx, 820 - roll * 1200, GY - 120 - roll * 40, 0.95, roll * -0.1, C.blue, true);
  // commentary box
  box(ctx, 40, 330, 260, 170, 0, C.white); ctx.fillStyle = C.navy; ctx.fillRect(43, 333, 254, 50); text(ctx, 'COMMENTARY', 170, 370, font(34, 800, DISPLAY), C.white, 'center');
  box(ctx, 160, 500, 20, GY - 570, 0, C.grey2, 0);
  cv_speaker(ctx, 320, 500, 0.35, u, L > 2.4 && L < 4.4);
  // photographer: lens lifts
  const lift = E.outBack(prog(L, 6.4, 7.0));
  person(ctx, 'S2', { x: 520, y: GY + 90, scale: 0.8, look: 0.5, lookY: -0.6 * lift, blink: blinkAt(L, 12), aR: [1.2 + 0.9 * lift, 0.2],
    holdR: (c) => withT(c, 0, 0, 1, -0.6 * lift, () => { box(c, -30, -26, 60, 52, 6, '#2B3237', 4); box(c, 24, -16, 110, 32, 4, '#E7EDF2', 4); }) });
  // A puts ear defenders on after the cues
  person(ctx, 'A', { x: 250, y: GY + 100, scale: 0.8, look: 0.5, blink: blinkAt(L, 13), earDef: L >= 7.6, aL: [-0.3 - 2.1 * bump(L, 7.6, 0.8), -0.3], aR: [0.3 + 2.1 * bump(L, 7.6, 0.8), 0.3] });
  label(ctx, 'LISTEN', 170, 270, 44, C.navy, C.white, pop(L, 2.5));
  label(ctx, 'WATCH THE RUNWAY', 760, 560, 40, C.blue, C.white, pop(L, 4.5));
  label(ctx, 'LENSES UP', 560, 330, 44, C.teal, C.white, pop(L, 6.5));
  label(ctx, 'EARS ON', 250, 600, 44, C.red, C.white, pop(L, 7.6));
  ctx.restore();
}
// 6. quiet rooms
function sceneQuiet(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(5); ctx.save(); ctx.translate(ax, 0);
  tent(ctx, 120, 760, GY - 420, [300, 580]);
  sign(ctx, 'QUIET ROOM', 440, GY - 330, 54, C.teal, C.white, null, pop(L, 0.6));
  person(ctx, 'B', { x: 380, y: GY + 20, scale: 0.68, sit: true, look: 0.3, blink: blinkAt(L, 14), mouth: 0.15, aR: [0.9, 0.9] });
  person(ctx, 'K', { x: 520, y: GY + 20, scale: 0.6, sit: true, look: -0.3, blink: blinkAt(L, 15), earDef: true, mouth: 0.25 });
  label(ctx, 'RIAT: WELLNESS ROOM', 440, 230, 40, C.navy, C.white, pop(L, 2.5));
  label(ctx, 'DUXFORD: QUIET ROOM', 440, 320, 40, C.navy, C.white, pop(L, 4.5));
  label(ctx, 'NOT LISTED? ASK', 840, 620, 36, C.red, C.white, pop(L, 6.5));
  person(ctx, 'S', { x: 870, y: GY + 90, scale: 0.75, look: -0.6, blink: blinkAt(L, 16), aL: [-0.5 - 1.2 * pop(L, 6.7), -0.8] });
  ctx.restore();
}
// 7. sunflower lanyards
function sceneSunflower(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(6); ctx.save(); ctx.translate(ax, 0);
  const lk = pop(L, 0.5, SPRING.bouncy);
  if (lk > 0) withT(ctx, 230, 470, lk, (1 - lk) * -0.4, () => cv_lanyard(ctx, 0, 0, 1));
  label(ctx, 'HIDDEN DISABILITIES', 240, 240, 34, '#2E9E5B', C.white, pop(L, 0.9));
  person(ctx, 'A', { x: 520, y: GY + 80, scale: 0.85, look: 0.5, blink: blinkAt(L, 17), mouth: 0.3 * bump(L, 6.6, 1.5) });
  // a little lanyard on A
  ctx.save(); ctx.translate(520, GY + 80); ctx.scale(0.85 * 1.12, 0.85 * 1.12);
  limb(ctx, [[-26, -272], [-6, -205], [6, -205], [26, -272]], 4, '#2E9E5B'); box(ctx, -16, -210, 32, 26, 0, '#2E9E5B', 3); cv_sunflower(ctx, 0, -197, 6);
  ctx.restore();
  person(ctx, 'T', { x: 820, y: GY + 80, scale: 0.85, look: -0.6, blink: blinkAt(L, 18), aL: [-0.6 - 1.4 * pop(L, 2.8), -1.2], mouth: 0.3 * bump(L, 3, 1.2) });
  label(ctx, 'MORE TIME', 820, 300, 42, C.teal, C.white, pop(L, 2.5));
  label(ctx, 'NO PROOF NEEDED', 700, 400, 42, C.navy, C.white, pop(L, 4.5));
  label(ctx, 'SAY WHAT HELPS', 560, 500, 42, C.red, C.white, pop(L, 6.5));
  ctx.restore();
}
// 8. early or late
function sceneTime(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(7); ctx.save(); ctx.translate(ax, 0);
  // split: morning (quiet) | afternoon (busier)
  ink(ctx, 4); ctx.setLineDash([16, 14]); ctx.beginPath(); ctx.moveTo(490, 200); ctx.lineTo(490, 1080); ctx.stroke(); ctx.setLineDash([]);
  const c1 = pop(L, 0.6), c2 = pop(L, 1.0);
  if (c1 > 0) withT(ctx, 245, 400, c1, 0, () => wallClock(ctx, 0, 0, 80, 0));
  if (c2 > 0) withT(ctx, 735, 400, c2, 0, () => wallClock(ctx, 0, 0, 80, 13 * 60 + 30));
  sign(ctx, 'EARLY', 245, 270, 44, C.white, C.navy, null, c1);
  sign(ctx, 'LATE', 735, 270, 44, C.white, C.navy, null, c2);
  // morning: one family, room everywhere; afternoon: queue gone, crowd on the line
  person(ctx, 'B', { x: 180, y: GY + 90, scale: 0.7, look: 0.4, blink: blinkAt(L, 19), mouth: 0.2 });
  person(ctx, 'K', { x: 310, y: GY + 100, scale: 0.62, look: 0.4, blink: blinkAt(L, 20), earDef: true });
  cv_heads(ctx, 520, 980, GY + 10, () => 0.8, 21);
  person(ctx, 'A', { x: 740, y: GY + 110, scale: 0.7, look: -0.4, blink: blinkAt(L, 22), earDef: L >= 6.6, aL: [-0.3 - 2.1 * bump(L, 6.6, 0.8), -0.3], aR: [0.3 + 2.1 * bump(L, 6.6, 0.8), 0.3] });
  label(ctx, 'CALMEST HOUR', 245, 540, 40, C.teal, C.white, pop(L, 2.5));
  label(ctx, 'NO GATE QUEUE', 735, 540, 40, C.navy, C.white, pop(L, 4.5));
  label(ctx, 'EARS ON ANYWAY', 735, 620, 40, C.red, C.white, pop(L, 6.5));
  ctx.restore();
}
// 9. your exit plan: signal, meeting point, leave early
function sceneExit(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(8); ctx.save(); ctx.translate(ax, 0);
  jet(ctx, 660, GY - 75, 2.0, 0, 'a400');
  label(ctx, 'MEET HERE', 660, 640, 50, C.teal, C.white, pop(L, 4.5));
  tickSq(ctx, 830, 640, pop(L, 4.8, SPRING.wobbly), true);
  person(ctx, 'B', { x: 110, y: GY + 100, scale: 0.85, look: 0.4, blink: blinkAt(L, 24), mouth: 0.3 * bump(L, 3, 1.4), aL: [-0.4, -0.3] });
  person(ctx, 'K', { x: 290, y: GY + 110, scale: 0.85, look: -0.3, blink: blinkAt(L, 25), earDef: true, aR: [2.3 * pop(L, 2.5), 0.2],
    holdR: L >= 2.5 ? (c) => { box(c, -120, -170, 240, 150, 0, C.white, 6); text(c, 'BREAK', 0, -70, font(72, 800, DISPLAY), C.red, 'center'); } : undefined });
  label(ctx, 'A SIGNAL', 290, 420, 44, C.red, C.white, pop(L, 2.7));
  label(ctx, 'LEAVING EARLY IS FINE', 520, 330, 44, C.navy, C.white, pop(L, 6.5));
  ctx.restore();
}
const SCENES = [sceneShow, sceneSpot, sceneEars, sceneLoud, sceneSigns, sceneQuiet, sceneSunflower, sceneTime, sceneExit];
