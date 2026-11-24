//@@COPY
const STEPS = [
  { title: 'What can you send?', q: 'Your photos, video and words', b: ['Photos from the crowd line', 'Video, sent as a link', 'Reviews, tips and arrivals reports'] },
  { title: 'Why join?', q: 'Your name goes on your work', b: ['Full credit on the site, every time', 'You keep the copyright', 'Ask, and it comes off the site'] },
  { title: 'No pressure', q: "It's voluntary, with no rota", b: ['No pay, and no minimum', 'Send things in when you can', 'Want to stop? Just say'] },
  { title: 'Send a message', q: 'From the Join the Team page', b: ['Say which shows you go to', "Say what you'd like to help with", 'The message builder helps'] },
  { title: 'A quick chat', q: 'Usually by email', b: ['No forms and no interview', 'Talk about what you enjoy', 'Two photos a year is fine'] },
  { title: 'Pick your role', q: 'And the shows you go to', b: ['One role or a few', 'Stick to the shows you know', 'Local knowledge is the good stuff'] },
  { title: 'Send your work in', q: 'Through the Volunteer Hub', b: ['Up to 10 photos at a time', 'Big files as a Drive link', 'Say the show, day and spot'] },
  { title: 'It goes live', q: 'With your name on it', b: ['Jack checks it over first', "He'll ask before changing it", 'Credit when it is shared too'] },
  { title: 'A few things I ask', q: 'Keep it honest and safe', b: ['Only send your own work', 'Ask first about close ups', 'Never fly a drone at a show'] },
];
const INTRO_WORDS = ['THE BIG GUIDE', 'JOIN THE', 'TEAM'], INTRO_TAG = 'VOLUNTEER WITH THE GUIDE', INTRO_SUB = 'What you send, why join, and how';
const OUTRO_LINE = 'Come and join the team!', OUTRO_LINES = ['Come and join', 'the team!'];
const URL = 'ukairshowguide.co.uk/join-the-team';
//@@HITS
HITS.push([st(0) + 1, 'red arrows', 'whoosh', { len: 1.2, from: 300, to: 1400, gain: 0.16 }], [st(0) + 2.6, 'flash', 'click', { gain: 0.12 }]);
HITS.push([st(1) + 0.6, 'print', 'thud', { gain: 0.16 }]);
HITS.push([st(3) + 1, 'envelope', 'whoosh', { len: 0.6, from: 800, to: 2600, gain: 0.12 }], [st(3) + 3, 'inbox', 'bell', { pitch: 'C6', gain: 0.14 }]);
HITS.push([st(4) + 1.5, 'bubble', 'pop', { pitch: 'A5', gain: 0.14 }], [st(4) + 3.5, 'bubble', 'pop', { pitch: 'E5', gain: 0.14 }], [st(4) + 5.5, 'bubble', 'pop', { pitch: 'C6', gain: 0.14 }]);
for (const d of [2.5, 4.5, 6.5]) HITS.push([st(6) + d, 'photo up', 'whoosh', { len: 0.4, from: 900, to: 2400, gain: 0.08 }]);
HITS.push([st(7) + 4.6, 'live stamp', 'thud', { gain: 0.2 }]);
HITS.push([st(8) + 8, 'not allowed', 'thud', { gain: 0.2 }]);
//@@SCENES
function itemNote(c) { box(c, -40, -52, 80, 104, 0, C.white); c.fillStyle = C.gold; c.fillRect(-37, -49, 74, 16); for (let k = 0; k < 4; k++) limb(c, [[-26, -16 + k * 18], [26, -16 + k * 18]], 1, C.grey); }
function itemVideo(c) { box(c, -50, -34, 100, 68, 0, '#2B3237'); c.beginPath(); c.moveTo(-12, -18); c.lineTo(20, 0); c.lineTo(-12, 18); c.closePath(); c.fillStyle = C.white; c.fill(); circ(c, 36, -22, 7, C.red, 0); }
function itemFace(c) { circ(c, 0, 0, 40, C.skin1); ell(c, -13, -2, 5, 7, C.navy, 0); ell(c, 13, -2, 5, 7, C.navy, 0); c.beginPath(); c.arc(0, 10, 12, 0.2 * Math.PI, 0.8 * Math.PI); ink(c, 4); c.stroke(); }
function itemBarrier(c) { for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? C.white : C.red; c.fillRect(-60 + k * 24, -12, 24, 24); } ink(c, 4); c.strokeRect(-60, -12, 120, 24); box(c, -60, -12, 10, 60, 0, C.grey2, 3); box(c, 50, -12, 10, 60, 0, C.grey2, 3); }

// 1. what can you send: photographing the Red Arrows
function sceneSend(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(0); ctx.save(); ctx.translate(ax, 0);
  redArrows(ctx, prog(L, 0.8, 9), -200, 1200, 170, 0.7);
  const fl = bump(L, 2.6, 0.4);
  person(ctx, 'A', { x: 260, y: GY + 60, look: 0.5, lookY: -0.7, aR: [2.3, 0.2], aL: [-0.4, -0.4], blink: blinkAt(L, 3), mouth: 0.3,
    holdR: (c) => { icon(c, 'camera', 0, -10, 0.9); if (fl > 0) { c.globalAlpha = fl; puff(c, 10, -40, 50 * fl, C.white); c.globalAlpha = 1; } } });
  const items = [['PHOTOS', 'camera', C.teal, 2.5], ['VIDEO', null, C.red, 4.5], ['REVIEWS', null, C.navy, 6.5]];
  items.forEach(([nm, ic, col, b], k) => {
    const q = pop(L, b, SPRING.bouncy); if (q <= 0) return;
    const y = 330 + k * 170;
    withT(ctx, 560, y, q, 0, () => { box(ctx, -60, -60, 120, 120, 0, C.white); if (ic) icon(ctx, ic, 0, 0, 0.9); else if (k === 1) itemVideo(ctx); else itemNote(ctx); });
    label(ctx, nm, 780, y, 54, col, C.white, q);
  });
  ctx.restore();
}
// 2. why join: your name on your photo
function sceneWhy(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(1); ctx.save(); ctx.translate(ax, 0);
  const pk = pop(L, 0.5, SPRING.bouncy);
  if (pk > 0) withT(ctx, 440, 440, pk, (1 - pk) * 0.3, () => print(ctx, 0, 0, 640, 470, -0.04, C.blue, 'PHOTO BY SAM CARTER'));
  label(ctx, 'YOUR NAME, EVERY TIME', 440, 140, 50, C.teal, C.white, pop(L, 2.5));
  label(ctx, 'YOUR COPYRIGHT', 330, 760, 46, C.navy, C.white, pop(L, 4.5));
  label(ctx, 'REMOVED IF YOU ASK', 380, 850, 46, C.red, C.white, pop(L, 6.5));
  person(ctx, 'A', { x: 850, y: GY + 70, scale: 0.9, look: -0.6, aL: [-0.6 - 1.4 * pop(L, 3), -1.2], blink: blinkAt(L, 9), mouth: 0.4 * bump(L, 3.5, 1.5) });
  ctx.restore();
}
// 3. no pressure: deckchair, empty calendar
function sceneEasy(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(2); ctx.save(); ctx.translate(ax, 0);
  sun(ctx, 140, 170, 60, u);
  // picnic blanket
  ctx.save(); ctx.beginPath(); ctx.rect(20, GY + 10, 340, 60); ctx.clip();
  for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) { ctx.fillStyle = (r + c) % 2 ? C.white : C.red; ctx.fillRect(20 + c * 30, GY + 10 + r * 30, 30, 30); }
  ctx.restore(); ink(ctx, 4); ctx.strokeRect(20, GY + 10, 340, 60);
  person(ctx, 'B', { x: 300, y: GY + 40, scale: 0.85, sit: true, look: -0.2, aL: [-2.6, 0.3], aR: [2.6, -0.3], blink: blinkAt(L, 4), mouth: 0.25 });
  person(ctx, 'K', { x: 120, y: GY + 40, scale: 0.75, sit: true, look: 0.4, aL: [-0.8, -0.4], aR: [0.8, 0.4], blink: blinkAt(L, 6), mouth: 0.3 });
  // calendar board
  const ck = pop(L, 0.6, SPRING.bouncy);
  if (ck > 0) withT(ctx, 600, 340, ck, 0, () => {
    box(ctx, -200, -190, 400, 380, 0, C.white);
    ctx.fillStyle = C.red; ctx.fillRect(-197, -187, 394, 70); text(ctx, 'THIS MONTH', 0, -137, font(46, 800, DISPLAY), C.white, 'center');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) box(ctx, -170 + c * 70, -100 + r * 70, 56, 56, 0, C.off, 3);
  });
  label(ctx, 'NO PAY', 440, 640, 50, C.navy, C.white, pop(L, 2.5));
  label(ctx, 'NO ROTA', 690, 640, 50, C.teal, C.white, pop(L, 4.5));
  label(ctx, 'STOP ANY TIME', 600, 760, 50, C.red, C.white, pop(L, 6.5));
  ctx.restore();
}
// 4. send a message: envelope to the inbox
function sceneMessage(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(3); ctx.save(); ctx.translate(ax, 0);
  person(ctx, 'A', { x: 160, y: GY + 60, scale: 0.9, look: 0.6, aR: [1.9, 0.5], blink: blinkAt(L, 11), holdR: (c) => phoneH(c, 0, -20, 0.6) });
  // inbox board
  const bx = 640, by = 420;
  box(ctx, bx - 270, by - 230, 540, 460, 0, C.white);
  ctx.fillStyle = C.navy; ctx.fillRect(bx - 267, by - 227, 534, 76); text(ctx, 'NEW MESSAGE', bx, by - 172, font(48, 800, DISPLAY), C.white, 'center');
  const rows = [['SHOWS', 'Clacton, Duxford'], ['HELP WITH', 'Photos and tips'], ['ABOUT ME', 'At shows since 2015']];
  rows.forEach(([a, b], k) => {
    const q = E.outQuint(prog(L, 2.5 + k * 2, 3.3 + k * 2)); if (q <= 0) return;
    const y = by - 90 + k * 100;
    ctx.save(); ctx.beginPath(); ctx.rect(bx - 260, y - 50, 520 * q, 90); ctx.clip();
    text(ctx, a, bx - 240, y, font(32, 800, DISPLAY), C.tealD); text(ctx, b, bx - 240, y + 40, font(36, 700, UI), C.navy);
    ctx.restore();
  });
  // the envelope flies from the phone to the board
  const p = prog(L, 0.8, 2.6);
  if (p > 0 && p < 1) { const e = E.inOutCubic(p); envelope(ctx, lerp(260, bx, e), lerp(GY - 300, by - 260, e) - Math.sin(e * Math.PI) * 200, 0.9, (1 - e) * -0.4); }
  if (L > 2.6) { const k = pop(L, 2.7, SPRING.wobbly); withT(ctx, bx + 250, by - 230, k, 0, () => { box(ctx, -36, -36, 72, 72, 0, C.red); text(ctx, '1', 0, 20, font(54, 800, DISPLAY), C.white, 'center'); }); }
  ctx.restore();
}
// 5. a quick chat
function sceneChat(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(4); ctx.save(); ctx.translate(ax, 0);
  person(ctx, 'A', { x: 230, y: GY + 60, scale: 0.92, look: 0.6, aR: [0.6, 0.6], blink: blinkAt(L, 13), mouth: 0.5 * (bump(L, 1.8, 1) + bump(L, 5.8, 1)) });
  person(ctx, 'S2', { x: 760, y: GY + 60, scale: 0.92, look: -0.6, aL: [-0.6 - 0.6 * bump(L, 3.8, 1.2), -0.6], blink: blinkAt(L, 14), mouth: 0.5 * bump(L, 3.8, 1) });
  bubbleSq(ctx, 60, 180, 420, 110, C.teal, 'HELLO!', pop(L, 1.5), true);
  bubbleSq(ctx, 480, 300, 440, 110, C.red, 'WHAT DO YOU ENJOY?', pop(L, 3.5), false);
  bubbleSq(ctx, 60, 420, 460, 110, C.navy, 'PHOTOS AT CLACTON!', pop(L, 5.5), true);
  tickSq(ctx, 830, 150, pop(L, 7.5, SPRING.wobbly) * 1.3, true);
  ctx.restore();
}
// 6. pick your role and shows
function sceneRole(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(5); ctx.save(); ctx.translate(ax, 0);
  const bk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 420, 480, bk, 0, () => {
    box(ctx, -360, -290, 720, 580, 0, '#E9D3A9');
    ctx.fillStyle = C.navy; ctx.fillRect(-357, -287, 714, 80); text(ctx, 'PICK YOUR ROLE', 0, -230, font(52, 800, DISPLAY), C.white, 'center');
  });
  const roles = [['PHOTOS', -180, -120, C.teal, 2.5], ['REVIEWS', 160, -120, C.teal, 99], ['SHOW TIPS', -170, 0, C.teal, 6.5], ['ARRIVALS', 160, 0, C.teal, 99]];
  const shows = [['CLACTON', -200, 160, C.red, 4.5], ['DUXFORD', 20, 160, C.red, 99], ['EASTBOURNE', 230, 160, C.red, 99]];
  [...roles, ...shows].forEach(([nm, dx, dy, col, b], k) => {
    const q = pop(L, 0.9 + k * 0.15, SPRING.bouncy); if (q <= 0) return;
    const picked = L >= b;
    label(ctx, nm, 420 + dx, 480 + dy, 42, picked ? col : C.white, picked ? C.white : C.navy, q);
    if (picked) tickSq(ctx, 420 + dx + 110, 480 + dy - 44, pop(L, b, SPRING.wobbly) * 0.7, true);
  });
  text(ctx, 'SHOWS', 120, 600, font(32, 800, DISPLAY), C.navy);
  person(ctx, 'K', { x: 880, y: GY + 80, look: -0.6, aL: [-2.2, -0.2], hop: Math.max(0, Math.sin(L * Math.PI)) * 20, blink: blinkAt(L, 17), mouth: 0.5 });
  ctx.restore();
}
// 7. send your work in: photos into the hub
function sceneHub(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(6); ctx.save(); ctx.translate(ax, 0);
  // hub box
  box(ctx, 470, 420, 440, 300, 0, C.white);
  ctx.fillStyle = C.teal; ctx.fillRect(473, 423, 434, 70); text(ctx, 'VOLUNTEER HUB', 690, 473, font(48, 800, DISPLAY), C.white, 'center');
  const sent = [2.5, 4.5, 6.5].filter((b) => L > b + 0.9).length;
  for (let k = 0; k < 3; k++) box(ctx, 500 + k * 136, 520, 116, 80, 0, k < sent ? '#9FD3EE' : C.off, 4);
  for (let k = 0; k < sent; k++) jet(ctx, 558 + k * 136, 560, 0.28, -0.05, k === 1 ? C.blue : C.red);
  text(ctx, sent ? `${sent} SENT` : 'READY', 690, 680, font(44, 800, DISPLAY), sent ? '#2E9E5B' : C.grey2, 'center');
  person(ctx, 'A', { x: 210, y: GY + 60, scale: 0.92, look: 0.5, lookY: -0.3, aR: [2.0, 0.6], blink: blinkAt(L, 19), holdR: (c) => phoneH(c, 0, -20, 0.6) });
  [2.5, 4.5, 6.5].forEach((b, k) => {
    const p = prog(L, b, b + 0.9); if (p <= 0 || p >= 1) return;
    const e = E.inOutCubic(p);
    withT(ctx, lerp(300, 558 + k * 136, e), lerp(GY - 380, 560, e) - Math.sin(e * Math.PI) * 220, lerp(0.5, 0.25, e), (1 - e) * 0.5, () => print(ctx, 0, 0, 400, 300, 0, k === 1 ? C.blue : C.red, null));
  });
  label(ctx, 'BIG FILES: ADD A LINK', 690, 820, 40, C.navy, C.white, pop(L, 4.5));
  ctx.restore();
}
// 8. it goes live: the page with your credit
function sceneLive(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(7); ctx.save(); ctx.translate(ax, 0);
  const bk = pop(L, 0.4, SPRING.bouncy);
  withT(ctx, 470, 430, bk, 0, () => {
    box(ctx, -400, -300, 800, 600, 0, C.white);
    ctx.fillStyle = C.sky2; ctx.fillRect(-397, -297, 794, 56);
    [C.red, C.gold, '#2E9E5B'].forEach((c, k) => box(ctx, -370 + k * 40, -282, 24, 24, 0, c, 3));
    ctx.fillStyle = C.navy; ctx.fillRect(-397, -241, 794, 80); text(ctx, 'CLACTON AIR SHOW', -370, -186, font(48, 800, DISPLAY), C.white);
    print(ctx, -70, 60, 560, 340, 0, C.red, null);
    text(ctx, 'Photo by Sam Carter', -340, 270, font(34, 700, UI), C.tealD);
    box(ctx, 250, -120, 120, 22, 0, C.off, 0); box(ctx, 250, -80, 120, 22, 0, C.off, 0); box(ctx, 250, -40, 90, 22, 0, C.off, 0);
  });
  label(ctx, 'CHECKED', 760, 300, 48, C.navy, C.white, pop(L, 2.5));
  const lk = pop(L, 4.5, SPRING.wobbly);
  if (lk > 0) withT(ctx, 740, 470, lk * 1.1, -0.15, () => { box(ctx, -110, -56, 220, 112, 0, '#2E9E5B'); text(ctx, 'LIVE', 0, 26, font(80, 800, DISPLAY), C.white, 'center'); });
  label(ctx, 'SHARED WITH CREDIT', 470, 820, 44, C.teal, C.white, pop(L, 6.5));
  person(ctx, 'K', { x: 70, y: GY + 110, scale: 0.9, hop: Math.max(0, Math.sin((L - 4.5) * Math.PI)) * 30 * (L > 4.5 ? 1 : 0), aL: [-2.6, 0], aR: [2.6, 0], mouth: 0.7, look: 0.4, blink: blinkAt(L, 21) });
  ctx.restore();
}
// 9. a few things I ask: three trays
function sceneAsk(ctx, u, L) {
  sky(ctx, u); hills(ctx); ground(ctx);
  const ax = artX(8); ctx.save(); ctx.translate(ax, 0);
  const T = [['PLEASE DO', '#2E9E5B', [(c) => ICON.camera(c), itemNote]], ['CHECK FIRST', '#E39A2D', [itemFace, itemBarrier]], ["PLEASE DON'T", C.red, [(c) => ICON.drone(c), (c) => { c.save(); c.scale(0.8, 0.8); itemVideo(c); c.restore(); }]]];
  T.forEach(([nm, col, its], k) => {
    const cx = 165 + k * 325, ty = GY - 90;
    const tk = pop(L, 0.6 + k * 0.25, SPRING.bouncy); if (tk <= 0) return;
    withT(ctx, cx, ty, tk * 1.08, 0, () => {
      ctx.beginPath(); ctx.moveTo(-140, -60); ctx.lineTo(140, -60); ctx.lineTo(118, 70); ctx.lineTo(-118, 70); ctx.closePath(); fs(ctx, col);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-128, -52, 256, 16);
    });
    label(ctx, nm, cx, ty - 470, 44, col, C.white, tk);
    its.forEach((fn, j) => {
      const d = 2.5 + k * 2 + j * 0.3, q = prog(L, d - 0.5, d); if (q <= 0) return;
      const yy = lerp(ty - 400, ty - 130 + (j % 2) * -30, E.outBounce(q));
      withT(ctx, cx - 60 + j * 120, yy, 1.1, (1 - q) * (j - 0.5) * 0.6, () => fn(ctx));
    });
  });
  const xk = pop(L, 8, SPRING.wobbly);
  if (xk > 0) withT(ctx, 815, GY - 230, xk * 1.9, 0.1, () => { ctx.globalAlpha = 0.9; tickSq(ctx, 0, 0, 1, false); ctx.globalAlpha = 1; });
  const ok = pop(L, 3.4, SPRING.wobbly); if (ok > 0) tickSq(ctx, 165, GY - 300, ok * 1.2, true);
  ctx.restore();
}
const SCENES = [sceneSend, sceneWhy, sceneEasy, sceneMessage, sceneChat, sceneRole, sceneHub, sceneLive, sceneAsk];
