// Pip, Episode 7: Harry the Harrier.
// Following Episode 6, where Major Tower invited Pip and the team to Duxford and promised a surprise guest from
// another country. The guest is Harry the Harrier, a jump jet from the Spanish Navy (Armada Española). Harry hovers
// over Duxford, meets the Spitfire and the Hurricane, learns about the memorial flights, sits in on the pilots'
// briefing and flies the display. Planning notes come from the Duxford page of the guide (duxford.html).
// Same calm cartoon kit and Pip drawings as "Meet Pip" (mascot/film on claude/pip-brand-campaign), square corners.
// 16x9, about 8 minutes 15 seconds. A pure function of time: every frame is drawn from t alone.
import * as K from './shared/kit.js';
const { M, C, F } = K;
const { W, H, TAU, clamp, lerp, prog, E, SPRING, hash01 } = M;

const P = 0.75;                                   // seconds per beat (beats.json); all times below are in SECONDS
const INK = '#1F2B3A';
const NAVY = '#13293C', TEAL = '#23908C', BLUE = '#1F4E8C', RED = '#D74949';
const ES_RED = '#C60B1E', ES_YEL = '#FFC400';     // the Spanish flag
const GREY = '#8D99A6', GREY_L = '#AEB8C2', GREY_D = '#5E6874';
const CAMO_G = '#5B6E3E', CAMO_B = '#8B6B48', SKY_UNDER = '#C6CDB0';

// ---------------------------------------------------------------- the script
// Each scene: dialogue lines in order. A line is [id, who, text] (+ options); ['_', seconds] is a pause.
// A line stays up for 2.1 s + 0.39 s a word (never under 3.6 s), so a grown-up can read it aloud.
const WHO = {
  pip: { name: 'Pip', col: TEAL },
  harry: { name: 'Harry the Harrier', col: ES_RED, band: ES_YEL },
  tower: { name: 'Major Tower', col: BLUE, radio: true },
  charlie: { name: 'Charlie', col: '#E07A2E' },
  dad: { name: 'Dad', col: '#B25454' },
  spit: { name: 'Spitfire', col: CAMO_G },
  hurri: { name: 'Hurricane', col: CAMO_B },
};
const SCRIPT = [
  { id: 'title', lead: 0, tail: 0, lines: [['_', 8.5]] },
  { id: 'recap', lead: 1.2, tail: 0.6, lines: [
    ['r1', 'tower', 'Pip, you and the team are invited to Duxford!'],
    ['r2', 'tower', 'And I have a surprise guest for you... from another country!'],
    ['r3', 'pip', 'Ooh! Who could it be?'],
  ] },
  { id: 'arrive', lead: 6.5, tail: 0.6, lines: [
    ['a1', 'pip', 'Good morning, Duxford! Look, a Hurricane on a pole at the main gate!'],
    ['a2', 'charlie', 'Pip! We booked our tickets online. There are no tickets on the gate!'],
    ['a3', 'pip', "Here's how we planned today."],
    ['_', 8.0],
    ['a4', 'pip', 'Front row spot saved. Now for our surprise guest!'],
  ] },
  { id: 'radio', lead: 0.8, tail: 1.0, lines: [
    ['t1', 'tower', 'Duxford Tower to Pip. Your surprise guest is ten miles out.'],
    ['t2', 'pip', 'Ten miles? Where from?'],
    ['t3', 'tower', 'All the way from Spain! Ear defenders on, everyone. This one is LOUD.'],
  ] },
  { id: 'hover', lead: 0, tail: 0.4, lines: [
    ['_', 9.0],
    ['h1', 'cap', ''], ['_', 13.5],
    ['h2', 'charlie', 'Wow! It stopped in the sky!', { gap: 0.6 }],
    ['h3', 'pip', 'Major Tower, is that our surprise guest?'],
  ] },
  { id: 'meet', lead: 0.6, tail: 0.6, lines: [
    ['m1', 'harry', '¡Hola! I am Harry the Harrier. Hello, Pip!'],
    ['m2', 'harry', 'I fly with the Spanish Navy, the Armada Española.'],
    ['m2b', 'harry', "Spain's navy has flown Harriers since 1976."],
    ['m3', 'harry', 'My home is Rota, in the south of Spain, beside the sea.'],
    ['m4', 'harry', 'I flew over a thousand miles to be here today!'],
    ['m5', 'harry', 'At sea, I live on a big ship called the Juan Carlos I.'],
    ['m6', 'harry', "Let's learn some Spanish!"],
    ['m7', 'pip', '¡Hola, Harry! Gracias for coming!', { gap: 2.2 }],
    ['m8', 'harry', '¡Muy bien, Pip! Very good!'],
  ] },
  { id: 'how', lead: 0.6, tail: 0.8, lines: [
    ['w1', 'harry', 'Want to know my secret? I have one big engine, called the Pegasus.'],
    ['w2', 'harry', 'It blows air out of four nozzles, two on each side.'],
    ['w3', 'harry', 'Nozzles pointing back: I fly forwards, like other jets.'],
    ['w4', 'harry', 'Nozzles pointing down: I push myself up and hover!'],
    ['w5', 'harry', 'Little puffer jets in my nose, tail and wingtips keep me balanced.'],
    ['w6', 'pip', 'Like balancing a broom on your hand!'],
    ['w7', 'harry', '¡Exacto! Exactly!'],
  ] },
  { id: 'warbirds', lead: 1.2, tail: 0.4, lines: [
    ['b1', 'pip', 'Harry, come and meet two very special friends!'],
    ['b2', 'spit', "Hello! I'm a Spitfire. I first flew in 1936."],
    ['b3', 'hurri', "And I'm a Hurricane. I first flew in 1935, the year before!"],
    ['b4', 'hurri', 'Harry, did you know? Hawker built me, and Hawker began the Harrier too!'],
    ['b5', 'hurri', 'Sydney Camm designed me, and his team started work on the first jump jet.'],
    ['b6', 'harry', 'So you are like my great-great-grandad! ¡Abuelo!'],
  ] },
  { id: 'spot', lead: 0.6, tail: 0.8, lines: [
    ['s1', 'charlie', 'They look the same! How do I tell them apart?'],
    ['s2', 'pip', 'Look at the wings. The Spitfire has round, oval wings.'],
    ['s3', 'pip', 'The Hurricane has straighter wings, and a hump behind the pilot.'],
    ['s4', 'charlie', 'Oval wings, Spitfire. Hump, Hurricane. Got it!'],
  ] },
  { id: 'history', lead: 0.8, tail: 0.6, lines: [
    ['_', 13.5],
    ['y1', 'spit', 'In 1940, pilots from many countries flew us to protect Britain.'],
    ['y2', 'hurri', 'From Poland, Czechoslovakia, Canada, New Zealand and lots more.'],
    ['y3', 'harry', 'Friends from other countries. Just like me today!'],
  ] },
  { id: 'memorial', lead: 1.0, tail: 1.2, lines: [
    ['f1', 'pip', 'Why do Spitfires and Hurricanes still fly today?'],
    ['f2', 'hurri', 'To remember. The Battle of Britain Memorial Flight flies us, so no one forgets.'],
    ['_', 6.5],
    ['f3', 'harry', 'Flying to remember. That is very special.'],
    ['_', 3.5],
  ] },
  { id: 'wind', lead: 0.8, tail: 0.6, lines: [
    ['c1', 'pip', "The windsock is blowing sideways! What's a crosswind, Harry?"],
    ['c2', 'harry', 'Wind blowing across the runway, from the side.'],
    ['c3', 'spit', 'Crosswinds are tricky for me. My wheels are close together, so a gust can swing me round.'],
    ['c5', 'hurri', 'Our pilots measure the crosswind in knots. Too much, and we stay on the ground.'],
    ['_', 6.0],
    ['c6', 'pip', "Duxford's runways point east and west, so a north or south wind blows right across!"],
    ['c7', 'harry', 'When I hover, I just turn into the wind. ¡Fácil!'],
    ['c8', 'pip', "On windy days, check the show's news. Some warbirds may not fly."],
  ] },
  { id: 'brief', lead: 0.8, tail: 0.4, lines: [
    ['p1', 'harry', 'Even pilots plan! Every morning, the display pilots go to a briefing.'],
    ['_', 6.0],
    ['p2', 'pip', "That's why we stand behind the crowd line."],
    ['p3', 'harry', "And if the weather says no, we don't fly. Safety first!"],
    ['p4', 'pip', "Now let's plan YOUR day!"],
    ['_', 7.0],
  ] },
  { id: 'display', lead: 0, tail: 0.2, lines: [
    ['_', 36.5],
    ['d1', 'charlie', 'Best. Day. Ever!'],
  ] },
  { id: 'bye', lead: 0.6, tail: 0.6, lines: [
    ['e1', 'harry', '¡Gracias, Duxford! ¡Adiós, amigos!'],
    ['e2', 'tower', 'Well done, team. See you next time. Tower out.'],
    ['e3', 'pip', 'Bye, Harry! See you soon!'],
  ] },
  { id: 'end', lead: 0, tail: 0, lines: [['_', 9.5]] },
];
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const SC = {}, ORDER = [];
{
  let t = 0;
  for (const sc of SCRIPT) {
    const S = { id: sc.id, a: t, L: {} };
    let c = t + sc.lead;
    for (const ln of sc.lines) {
      if (ln[0] === '_') { c += ln[1]; continue; }
      const [id, who, text, o = {}] = ln;
      const a = c + (o.gap || 0), d = who === 'cap' ? 0 : Math.max(3.6, 2.1 + 0.39 * words(text));
      S.L[id] = { a, b: a + d, who, text };
      c = a + d + (who === 'cap' ? 0 : 0.3);
    }
    S.b = c + sc.tail; t = S.b;
    SC[sc.id] = S; ORDER.push(S);
  }
}
const DURATION = SC.end.b;
window.FILM_DURATION = DURATION;

// ---------------------------------------------------------------- small helpers (times in seconds)
const pk = (t, a, cfg = SPRING.bouncy) => K.pop(t / P, a / P, cfg);
const ez = (t, a, b, e = E.inOutCubic) => e(prog(t, a, b));
const cap = (ctx, t, a, b, str, o) => K.caption(ctx, t / P, a / P, b / P, str, o);
const rr = (ctx, x, y, w, h, col) => K.rr(ctx, x, y, w, h, 0, col);            // house rule: square corners
const circ = (ctx, x, y, r, col) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); };
const popAt = (ctx, x, y, k, fn, rot = 0) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(k, k); fn(); ctx.restore(); };
const shadowBox = (ctx, x, y, w, h, col = C.white) => { ctx.save(); ctx.globalAlpha *= 0.14; rr(ctx, x + 8, y + 12, w, h, '#000'); ctx.restore(); rr(ctx, x, y, w, h, col); };
function path(ctx, pts) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
function inked(ctx, fill, lw = 6) { ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
const pillPop = (ctx, t, a, x, y, str, o = {}) => popAt(ctx, x, y, pk(t, a), () => K.pill(ctx, 0, 0, str, { align: 'center', size: 36, ...o }));
function dust(ctx, x, y, r, k, t, col = 'rgba(214,200,170,') {
  if (k <= 0.01) return;
  for (let i = 0; i < 14; i++) {
    const a = hash01(i, 4) * Math.PI, sp = 0.4 + hash01(i, 5) * 0.6, ph = (t * sp * 0.9 + hash01(i, 6)) % 1;
    const dx = Math.cos(a) * r * (0.5 + ph), dy = -Math.sin(a) * 30 * ph;
    ctx.beginPath(); ctx.ellipse(x + dx * (i % 2 ? 1 : -1), y + dy, 30 + ph * 40, 12 + ph * 12, 0, 0, TAU);
    ctx.fillStyle = col + (0.42 * k * (1 - ph)).toFixed(3) + ')'; ctx.fill();
  }
}

// ---------------------------------------------------------------- Pip (the site's mascot drawings)
let IMGS = {};
function pip(ctx, pose, x, y, size, t, o = {}) {
  const u = t / P;
  let im = IMGS['pip_' + pose];
  if (pose === 'hello') im = IMGS['pip_hello' + (Math.floor(((u * 1.2) % 1) * 6) % 6)];
  if (pose === 'rest' && ((u + (o.seed || 0)) % 3.6) > 3.45) im = IMGS.pip_blink;
  if (!im) return;
  const s = size / 0.62, bob = o.still ? 0 : Math.sin(u * 1.6) * size * 0.015;
  ctx.save(); ctx.translate(x, y + bob);
  if (o.flip) ctx.scale(-1, 1);
  if (o.squash) ctx.scale(1 + o.squash, 1 - o.squash);
  if (o.rot) ctx.rotate(o.rot);
  ctx.drawImage(im, -s / 2, -s * 0.936, s, s);
  ctx.restore();
}
function pipFly(ctx, x, y, w, rot = 0, flip = false) { const im = IMGS.pip_fly; if (!im) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); if (flip) ctx.scale(-1, 1); ctx.drawImage(im, -w / 2, -w / 2, w, w); ctx.restore(); }

// ---------------------------------------------------------------- cartoon eyes and mouths, in Pip's style
function eye(ctx, x, y, r, o = {}) {
  if (o.blink) { ctx.beginPath(); ctx.arc(x, y + r * 0.1, r * 0.75, 0.25, Math.PI - 0.25); ctx.strokeStyle = INK; ctx.lineWidth = r * 0.32; ctx.lineCap = 'round'; ctx.stroke(); return; }
  if (o.happy) { ctx.beginPath(); ctx.arc(x, y + r * 0.35, r * 0.75, Math.PI + 0.35, TAU - 0.35); ctx.strokeStyle = INK; ctx.lineWidth = r * 0.32; ctx.lineCap = 'round'; ctx.stroke(); return; }
  const [lx, ly] = o.look || [0.3, 0];
  ctx.beginPath(); ctx.ellipse(x, y, r * 0.86, r, 0, 0, TAU); ctx.fillStyle = C.white; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = r * 0.16; ctx.stroke();
  circ(ctx, x + lx * r * 0.32, y + ly * r * 0.3, r * 0.5, INK);
  circ(ctx, x + lx * r * 0.32 + r * 0.18, y + ly * r * 0.3 - r * 0.2, r * 0.17, C.white);
}
function mouth(ctx, x, y, r, mood = 'happy') {
  ctx.strokeStyle = INK; ctx.lineWidth = r * 0.3; ctx.lineCap = 'round'; ctx.beginPath();
  if (mood === 'wow') { ctx.ellipse(x, y + r * 0.2, r * 0.42, r * 0.56, 0, 0, TAU); ctx.fillStyle = INK; ctx.fill(); return; }
  if (mood === 'grin') { ctx.arc(x, y - r * 0.4, r, 0.15, Math.PI - 0.15); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); ctx.beginPath(); ctx.arc(x, y - r * 0.4 + r * 0.55, r * 0.42, 0.3, Math.PI - 0.3); ctx.fillStyle = '#E0645A'; ctx.fill(); return; }
  if (mood === 'calm') { ctx.arc(x, y - r * 0.3, r * 0.7, 0.35, Math.PI - 0.35); ctx.stroke(); return; }
  ctx.arc(x, y - r * 0.45, r, 0.3, Math.PI - 0.3); ctx.stroke();
}
const blinkAt = (t, seed = 0) => ((t + seed) % 4.1) < 0.12;
// writing on an aircraft that reads the right way round even when the aircraft is flipped
function word(ctx, str, x, y, f, col, flip, align = 'left') {
  ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
  ctx.font = f; const w = ctx.measureText(str).width, dx = align === 'center' ? -w / 2 : flip ? -w : 0;
  M.text(ctx, str, dx, 0, f, col, 'left', align === 'center' ? 0 : 2); ctx.restore();
}

// ---------------------------------------------------------------- Harry the Harrier
// Side on, nose to the right. (x, y) = the middle of the fuselage; about 540 units long at s = 1.
// o: noz 0..1 (0 = nozzles back, 1 = straight down), gear 0..1, thrust 0..1, mood, look, rot, flip, t,
//    puff 0..1 (the little balance jets), cut 0..1 (see-through engine), noShadow
const HARRY_FEET = 112;                            // from the middle of the fuselage down to the wheels, at s = 1
function harry(ctx, x, y, s, o = {}) {
  const t = o.t || 0, noz = o.noz ?? 0, gear = o.gear ?? 0, thrust = o.thrust ?? 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(o.flip ? -s : s, s); ctx.rotate(o.rot || 0);
  const nozA = Math.PI - noz * Math.PI / 2;
  // exhaust behind everything
  if (thrust > 0.01) for (const [nx, hot] of [[30, false], [-56, true]]) {
    ctx.save(); ctx.translate(nx, 30); ctx.rotate(nozA);
    const len = (110 + 150 * thrust) * (0.94 + 0.06 * Math.sin(t * 47 + nx));
    const g = ctx.createLinearGradient(40, 0, 40 + len, 0);
    g.addColorStop(0, hot ? `rgba(255,214,150,${0.75 * thrust})` : `rgba(235,245,252,${0.7 * thrust})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.moveTo(40, -14); ctx.lineTo(40 + len, -34); ctx.lineTo(40 + len, 34); ctx.lineTo(40, 14); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.35 * thrust})`; ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); for (let i = 0; i <= 12; i++) { const px = 50 + i * len / 12, py = (k - 1) * 12 + Math.sin(i * 1.3 + t * 30 + k) * 5; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
    ctx.restore();
  }
  // far-side outrigger and gear legs
  const leg = (gx, gy, len, r) => { if (gear <= 0.01) return; const l = len * gear; rr(ctx, gx - 6, gy, 12, l, GREY_D); ctx.beginPath(); ctx.arc(gx, gy + l + r * 0.0, r, 0, TAU); inked(ctx, '#2E343C', 5); circ(ctx, gx, gy + l, r * 0.4, '#7D8792'); };
  leg(-10, 0, 76, 13);
  // tailplane (anhedral)
  path(ctx, [[-176, 2], [-262, 24], [-276, 34], [-196, 18]]); inked(ctx, GREY_D);
  // fin with the Spanish flag across it
  path(ctx, [[-158, -30], [-226, -110], [-258, -108], [-240, -14]]); inked(ctx, GREY);
  ctx.save(); path(ctx, [[-158, -30], [-226, -110], [-258, -108], [-240, -14]]); ctx.clip();
  ctx.fillStyle = ES_RED; ctx.fillRect(-270, -104, 130, 12); ctx.fillStyle = ES_YEL; ctx.fillRect(-270, -92, 130, 22); ctx.fillStyle = ES_RED; ctx.fillRect(-270, -70, 130, 12);
  ctx.restore(); path(ctx, [[-158, -30], [-226, -110], [-258, -108], [-240, -14]]); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  // fuselage
  const body = () => { ctx.beginPath(); ctx.moveTo(266, 10); ctx.quadraticCurveTo(236, -22, 176, -34); ctx.lineTo(60, -46); ctx.lineTo(-150, -32); ctx.lineTo(-252, -16); ctx.lineTo(-266, 2); ctx.lineTo(-244, 20); ctx.lineTo(-120, 36); ctx.lineTo(120, 42); ctx.quadraticCurveTo(226, 38, 266, 10); ctx.closePath(); };
  body(); ctx.fillStyle = GREY; ctx.fill();
  ctx.save(); body(); ctx.clip(); ctx.fillStyle = GREY_L; ctx.fillRect(-300, 16, 600, 40); ctx.fillStyle = '#7C8895'; ctx.beginPath(); ctx.ellipse(250, 10, 30, 30, 0, 0, TAU); ctx.fill(); ctx.restore();
  body(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke();
  // ARMADA, as on the real aircraft
  word(ctx, 'ARMADA', -236, 11, F(19, 800), INK, o.flip);
  // roundel: red, yellow, red
  circ(ctx, -100, -8, 24, INK); circ(ctx, -100, -8, 21, ES_RED); circ(ctx, -100, -8, 14, ES_YEL); circ(ctx, -100, -8, 7, ES_RED);
  // the big intake
  ctx.beginPath(); ctx.ellipse(40, -6, 28, 36, 0, 0, TAU); inked(ctx, GREY_L, 6);
  ctx.beginPath(); ctx.ellipse(48, -6, 14, 27, 0, 0, TAU); ctx.fillStyle = '#39424D'; ctx.fill();
  // see-through engine (for the explainer)
  if (o.cut > 0.01) {
    ctx.save(); ctx.globalAlpha *= o.cut;
    rr(ctx, -70, -30, 140, 54, 'rgba(255,196,0,0.85)'); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-70, -30, 140, 54);
    for (let i = 0; i < 6; i++) { const xx = -56 + i * 22; ctx.beginPath(); ctx.moveTo(xx, -26); ctx.lineTo(xx + 8 * Math.sin(t * 20 + i), 20); ctx.strokeStyle = 'rgba(31,43,58,0.6)'; ctx.lineWidth = 4; ctx.stroke(); }
    ctx.restore();
  }
  // shoulder wing
  path(ctx, [[100, -46], [-86, -46], [-130, -36], [40, -34]]); inked(ctx, GREY_D, 5);
  // the four nozzles (two this side)
  for (const [nx, col] of [[30, '#707B87'], [-56, '#545D67']]) {
    ctx.save(); ctx.translate(nx, 30); ctx.rotate(nozA);
    ctx.beginPath(); ctx.moveTo(-4, -18); ctx.lineTo(44, -15); ctx.lineTo(44, 15); ctx.lineTo(-4, 18); ctx.closePath(); inked(ctx, col, 5);
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(4 + i * 10, -15); ctx.lineTo(4 + i * 10, 15); ctx.strokeStyle = 'rgba(31,43,58,0.45)'; ctx.lineWidth = 3; ctx.stroke(); }
    if (o.hiNoz) { ctx.strokeStyle = `rgba(255,196,0,${o.hiNoz})`; ctx.lineWidth = 8; ctx.strokeRect(-10, -24, 60, 48); }
    ctx.restore();
    circ(ctx, nx, 30, 8, INK);
  }
  // near gear
  leg(150, 40, 56, 16); leg(-110, 36, 56, 20);
  // bubble canopy with the eyes in it
  ctx.beginPath(); ctx.moveTo(62, -40); ctx.quadraticCurveTo(80, -92, 136, -94); ctx.quadraticCurveTo(192, -92, 206, -32); ctx.closePath(); inked(ctx, '#CFEAF5', 6);
  ctx.save(); ctx.globalAlpha *= 0.55; ctx.beginPath(); ctx.ellipse(110, -78, 22, 8, -0.3, 0, TAU); ctx.fillStyle = C.white; ctx.fill(); ctx.restore();
  const bl = o.blink ?? blinkAt(t, 1.7), happy = o.mood === 'happy-eyes';
  eye(ctx, 118, -58, 19, { blink: bl, happy, look: o.look || [0.5, 0] }); eye(ctx, 160, -58, 19, { blink: bl, happy, look: o.look || [0.5, 0] });
  if (o.brow) for (const ex of [118, 160]) { ctx.beginPath(); ctx.moveTo(ex - 14, -86 - o.brow * 6); ctx.lineTo(ex + 12, -84 - o.brow * 10); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); }
  // smile on the nose, and a blush
  circ(ctx, 206, 10, 11, 'rgba(235,120,110,0.45)');
  mouth(ctx, 232, 16, 15, o.mood === 'happy-eyes' ? 'grin' : (o.mood || 'happy'));
  // puffer jets: nose, tail and wingtip
  if (o.puff > 0.01) for (const [px, py, dir, ph] of [[262, 26, 1, 0], [-262, 22, 1, 0.33], [-10, -40, -1, 0.66]]) {
    const q = (t * 2.2 + ph) % 1, k = o.puff * (1 - q);
    for (let i = 0; i < 3; i++) circ(ctx, px + (i - 1) * 8 * q * 3, py + dir * (14 + q * 70 + i * 10), 9 + q * 16, `rgba(255,255,255,${(0.8 * k).toFixed(3)})`);
    circ(ctx, px, py, 9, `rgba(255,196,0,${o.puff})`);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the Spitfire and the Hurricane
// Side on, nose right; (x, y) = the wing root. s = 1 is about 400 units long. o: t, prop (0 parked .. 1 running),
// mood, look, talk, rot, flip, gear (default 1), kind 'spit' | 'hurri'
function warbird(ctx, x, y, s, o = {}) {
  const t = o.t || 0, hurri = o.kind === 'hurri', gear = o.gear ?? 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(o.flip ? -s : s, s); ctx.rotate(o.rot || 0);
  const shape = hurri
    ? () => { ctx.beginPath(); ctx.moveTo(182, -4); ctx.quadraticCurveTo(150, -34, 80, -36); ctx.lineTo(24, -42); ctx.lineTo(-62, -46); ctx.lineTo(-150, -26); ctx.lineTo(-192, -14); ctx.lineTo(-200, 4); ctx.lineTo(-150, 20); ctx.lineTo(60, 30); ctx.quadraticCurveTo(150, 28, 182, 6); ctx.closePath(); }
    : () => { ctx.beginPath(); ctx.moveTo(188, -6); ctx.quadraticCurveTo(150, -30, 90, -30); ctx.lineTo(36, -34); ctx.lineTo(-44, -34); ctx.lineTo(-140, -18); ctx.lineTo(-190, -10); ctx.lineTo(-196, 4); ctx.lineTo(-140, 14); ctx.lineTo(60, 22); ctx.quadraticCurveTo(150, 22, 188, 2); ctx.closePath(); };
  const fin = hurri ? [[-150, -26], [-172, -90], [-200, -88], [-206, -8]] : null;
  // gear
  if (gear > 0.01) {
    const l = 56 * gear; rr(ctx, 34, 18, 10, l, GREY_D); ctx.beginPath(); ctx.arc(39, 18 + l, 20, 0, TAU); inked(ctx, '#2E343C', 5); circ(ctx, 39, 18 + l, 8, '#7D8792');
    rr(ctx, -170, 10, 6, 18 * gear, GREY_D); ctx.beginPath(); ctx.arc(-167, 10 + 18 * gear + 2, 9, 0, TAU); inked(ctx, '#2E343C', 4);
  }
  // tailplane
  ctx.beginPath(); ctx.ellipse(-176, 2, 34, 7, 0, 0, TAU); inked(ctx, CAMO_G, 5);
  // fin with the red, white and blue flash
  ctx.beginPath();
  if (hurri) path(ctx, fin); else { ctx.moveTo(-140, -18); ctx.quadraticCurveTo(-160, -86, -192, -76); ctx.quadraticCurveTo(-210, -50, -196, -8); ctx.closePath(); }
  inked(ctx, CAMO_G, 6);
  ctx.save(); if (hurri) path(ctx, fin); else { ctx.beginPath(); ctx.moveTo(-140, -18); ctx.quadraticCurveTo(-160, -86, -192, -76); ctx.quadraticCurveTo(-210, -50, -196, -8); ctx.closePath(); } ctx.clip();
  ctx.fillStyle = RED; ctx.fillRect(-170, -100, 16, 90); ctx.fillStyle = C.white; ctx.fillRect(-186, -100, 16, 90); ctx.fillStyle = '#244C9A'; ctx.fillRect(-202, -100, 16, 90); ctx.restore();
  // fuselage: green and brown on top, pale underneath
  shape(); ctx.fillStyle = CAMO_G; ctx.fill();
  ctx.save(); shape(); ctx.clip();
  ctx.fillStyle = CAMO_B; for (const [bx, bw] of [[110, 60], [-10, 70], [-120, 50]]) { ctx.beginPath(); ctx.moveTo(bx, -60); ctx.quadraticCurveTo(bx + bw * 0.6, -20, bx + bw, -60); ctx.lineTo(bx + bw + 20, 0); ctx.quadraticCurveTo(bx + bw * 0.4, -6, bx - 10, 0); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = SKY_UNDER; ctx.fillRect(-260, 6, 520, 50);
  if (!hurri) { ctx.fillStyle = '#C9D6B8'; ctx.fillRect(-134, -40, 18, 80); }           // the sky band near the tail
  ctx.restore(); shape(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke();
  // exhaust stubs
  for (let i = 0; i < 3; i++) rr(ctx, 100 + i * 18, -16, 12, 8, '#3A3A40');
  // roundel (blue, white, red, with a yellow ring) and the codes
  const rx = hurri ? -92 : -76;
  circ(ctx, rx, -6, 26, INK); circ(ctx, rx, -6, 23, '#F2C230'); circ(ctx, rx, -6, 19, '#244C9A'); circ(ctx, rx, -6, 12, C.white); circ(ctx, rx, -6, 6, RED);
  if (!hurri) { word(ctx, 'Q', -40, 4, F(30, 800), '#D9D2B8', o.flip, 'center'); word(ctx, 'V', -112, 4, F(30, 800), '#D9D2B8', o.flip, 'center'); }
  // wing
  ctx.beginPath(); ctx.ellipse(hurri ? 30 : 24, hurri ? 18 : 12, hurri ? 76 : 72, 10, 0.02, 0, TAU); inked(ctx, '#4E5F34', 5);
  // spinner and propeller
  ctx.beginPath(); ctx.ellipse(hurri ? 186 : 192, 0, 18, 14, 0, -Math.PI / 2, Math.PI / 2); inked(ctx, '#2B2B33', 5);
  const px = hurri ? 200 : 206, run = o.prop ?? 0;
  if (run > 0.05) { ctx.save(); ctx.globalAlpha *= 0.28 * run; ctx.beginPath(); ctx.ellipse(px, 0, 7, 78, 0, 0, TAU); ctx.fillStyle = '#2B2B33'; ctx.fill(); ctx.restore(); const a = t * 13; for (let k = 0; k < 3; k++) { const yy = Math.cos(a + k * TAU / 3) * 76; rr(ctx, px - 3, Math.min(0, yy), 6, Math.abs(yy), `rgba(43,43,51,${0.35 * run})`); } }
  if (run < 0.95) { ctx.save(); ctx.globalAlpha *= 1 - run; rr(ctx, px - 4, -78, 8, 72, '#2B2B33'); rr(ctx, px - 4, 10, 8, 52, '#2B2B33'); rr(ctx, px - 4, -82, 8, 10, '#F2C230'); ctx.restore(); }
  // canopy with eyes
  const cx = hurri ? -18 : -6, cy = hurri ? -46 : -34;
  ctx.beginPath(); ctx.ellipse(cx, cy, 44, 26, 0, Math.PI, TAU); ctx.closePath(); inked(ctx, '#CFEAF5', 5);
  const bl = blinkAt(t, hurri ? 2.3 : 0.9), look = o.look || [0.6, 0];
  eye(ctx, cx - 14, cy - 11, 11, { blink: bl, look, happy: o.mood === 'happy-eyes' }); eye(ctx, cx + 12, cy - 11, 11, { blink: bl, look, happy: o.mood === 'happy-eyes' });
  circ(ctx, 140, 6, 9, 'rgba(235,120,110,0.45)');
  mouth(ctx, 156, 10, 11, o.mood === 'happy-eyes' ? 'grin' : (o.mood || 'happy'));
  ctx.restore();
}
const WAR_FEET = 92;                                // wing root down to the main wheels, at s = 1

// top views for the memorial flypast (seen from below, nose right)
function topLanc(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const col = '#2E3236';
  path(ctx, [[60, -230], [100, -230], [96, 230], [60, 230], [30, 120], [30, -120]]); inked(ctx, col, 5);
  for (const ey of [-150, -70, 70, 150]) { rr(ctx, 70, ey - 12, 70, 24, col); ctx.save(); ctx.globalAlpha *= 0.3; ctx.beginPath(); ctx.ellipse(146, ey, 4, 34, 0, 0, TAU); ctx.fillStyle = INK; ctx.fill(); ctx.restore(); }
  ctx.beginPath(); ctx.ellipse(0, 0, 190, 22, 0, 0, TAU); inked(ctx, col, 5);
  path(ctx, [[-150, -80], [-120, -80], [-120, 80], [-150, 80]]); inked(ctx, col, 4);
  rr(ctx, -158, -92, 44, 14, col); rr(ctx, -158, 78, 44, 14, col);
  for (const ry of [-170, 170]) { circ(ctx, 70, ry, 20, '#244C9A'); circ(ctx, 70, ry, 8, RED); }
  ctx.restore();
}
function topFighter(ctx, x, y, s, spit) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const col = SKY_UNDER;
  if (spit) { ctx.beginPath(); ctx.ellipse(10, 0, 44, 130, 0, 0, TAU); inked(ctx, col, 4); }
  else { path(ctx, [[48, -124], [-8, -130], [-20, -40], [-20, 40], [-8, 130], [48, 124], [56, 0]]); inked(ctx, col, 4); }
  ctx.beginPath(); ctx.ellipse(0, 0, 110, 15, 0, 0, TAU); inked(ctx, col, 4);
  ctx.beginPath(); ctx.ellipse(-92, 0, 14, 42, 0, 0, TAU); inked(ctx, col, 4);
  for (const ry of [-80, 80]) { circ(ctx, 10, ry, 17, '#F2C230'); circ(ctx, 10, ry, 14, '#244C9A'); circ(ctx, 10, ry, 9, C.white); circ(ctx, 10, ry, 4.5, RED); }
  ctx.save(); ctx.globalAlpha *= 0.3; ctx.beginPath(); ctx.ellipse(116, 0, 4, 40, 0, 0, TAU); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- Duxford scenery
function hangars(ctx, x0, n, y, s = 1, far = false) {
  for (let i = 0; i < n; i++) {
    const x = x0 + i * 330 * s, w = 300 * s, h = 90 * s;
    const wall = far ? '#C7B8AE' : '#A86A52', roof = far ? '#A9B3BC' : '#6A737C';
    ctx.beginPath(); ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x + w / 2, y - h - 80 * s, x + w, y - h); ctx.lineTo(x + w, y); ctx.lineTo(x, y); ctx.closePath(); ctx.fillStyle = wall; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - h + 4 * s); ctx.quadraticCurveTo(x + w / 2, y - h - 84 * s, x + w + 8 * s, y - h + 4 * s); ctx.lineTo(x + w + 8 * s, y - h + 16 * s); ctx.quadraticCurveTo(x + w / 2, y - h - 70 * s, x - 8 * s, y - h + 16 * s); ctx.closePath(); ctx.fillStyle = roof; ctx.fill();
    rr(ctx, x + 30 * s, y - h + 26 * s, w - 60 * s, h - 26 * s, far ? '#B3A69C' : '#5C3E33');
    for (let k = 1; k < 4; k++) rr(ctx, x + 30 * s + k * (w - 60 * s) / 4, y - h + 26 * s, 3 * s, h - 26 * s, far ? '#A69990' : '#4B3229');
  }
}
// Duxford's control tower (Major Tower's home). (x, y) = the bottom middle.
function tower(ctx, x, y, s = 1, t = 0, talking = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -150, -170, 300, 170, '#EFE7D4'); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(-150, -170, 300, 170);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) rr(ctx, -124 + i * 66, -150 + r * 74, 46, 46, '#4A6074');
  rr(ctx, -30, -60, 60, 60, '#3E5468');
  rr(ctx, -170, -184, 340, 16, '#D8CEB8');
  for (let i = 0; i < 12; i++) rr(ctx, -166 + i * 30, -212, 4, 28, INK);
  rr(ctx, -170, -214, 340, 6, INK);
  rr(ctx, -96, -260, 192, 76, '#CFEAF5'); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(-96, -260, 192, 76);
  for (let i = 1; i < 4; i++) rr(ctx, -96 + i * 48, -260, 4, 76, INK);
  rr(ctx, -110, -272, 220, 14, INK);
  rr(ctx, 60, -330, 6, 58, INK); circ(ctx, 63, -334, 7, RED);
  if (talking) for (let i = 0; i < 3; i++) {
    const q = (t * 1.2 + i / 3) % 1;
    ctx.beginPath(); ctx.arc(63, -334, 20 + q * 70, -1.1, -0.2); ctx.strokeStyle = `rgba(31,78,140,${(1 - q).toFixed(3)})`; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.arc(63, -334, 20 + q * 70, Math.PI + 0.2, Math.PI + 1.1); ctx.stroke();
  }
  ctx.restore();
}
function windsock(ctx, x, y, s, t) {
  rr(ctx, x - 3 * s, y - 150 * s, 6 * s, 150 * s, INK);
  const wv = Math.sin(t * 3) * 0.06;
  ctx.save(); ctx.translate(x, y - 146 * s); ctx.rotate(0.12 + wv);
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(i * 22 * s, -14 * s + i * 1.5 * s); ctx.lineTo((i + 1) * 22 * s, -12.5 * s + i * 1.5 * s); ctx.lineTo((i + 1) * 22 * s, 12.5 * s - i * 1.5 * s); ctx.lineTo(i * 22 * s, 14 * s - i * 1.5 * s); ctx.closePath(); ctx.fillStyle = i % 2 ? C.white : C.orange; ctx.fill(); }
  ctx.restore();
}
function airfield(ctx, t, o = {}) {
  const gy = o.gy ?? 640;
  K.sky(ctx, o.top, o.low); K.clouds(ctx, t / P, o.cloudY ?? 160, 4);
  hangars(ctx, o.hx ?? 120, o.hn ?? 4, gy, o.hs ?? 0.72, true);
  if (o.tower !== false) tower(ctx, o.tx ?? 1650, gy, o.ts ?? 0.55, t, o.talking);
  windsock(ctx, o.wx ?? 1460, gy + 10, 0.7, t);
  K.ground(ctx, gy);
  ctx.fillStyle = '#9CC596'; ctx.fillRect(0, gy, W, 26);
}

// ---------------------------------------------------------------- speech bubbles
// A square box with a straight tail and the speaker's name. (x, y) = top left; (tx, ty) = the tip of the tail.
function bubble(ctx, t, a, b, who, str, x, y, tx, ty, o = {}) {
  if (t < a || t > b) return;
  const P0 = WHO[who] || WHO.pip;
  const k = pk(t, a, SPRING.bouncy), out = E.inCubic(prog(t, b - 0.3, b));
  const sc = Math.max(0.01, k * (1 - out));
  const size = o.size || 48, f = F(size, 700), w = o.w || 600, pad = 28;
  const lines = K.wrap(ctx, str, f, w - pad * 2);
  const h = pad * 2 + 30 + lines.length * size * 1.18;
  x = clamp(x, 40, W - w - 40); y = clamp(y, 30, H - h - 30);
  const above = ty > y + h / 2;
  const cx = clamp(tx, x + 60, x + w - 60);
  ctx.save(); ctx.translate(tx, ty); ctx.scale(sc, sc); ctx.translate(-tx, -ty);
  ctx.save(); ctx.globalAlpha *= 0.14; rr(ctx, x + 6, y + 10, w, h, '#000'); ctx.restore();
  ctx.beginPath();
  if (above) { ctx.moveTo(cx - 30, y + h - 2); ctx.lineTo(tx, ty); ctx.lineTo(cx + 30, y + h - 2); }
  else { ctx.moveTo(cx - 30, y + 2); ctx.lineTo(tx, ty); ctx.lineTo(cx + 30, y + 2); }
  ctx.closePath(); ctx.fillStyle = C.white; ctx.fill();
  rr(ctx, x, y, w, h, C.white); rr(ctx, x, y, w, 10, P0.col);
  if (P0.band) rr(ctx, x, y + 10, w, 5, P0.band);
  let nx = x + pad;
  if (P0.radio) {   // a little radio: Major Tower speaks over the airwaves
    rr(ctx, nx, y + pad - 2, 30, 26, P0.col); rr(ctx, nx + 18, y + pad - 16, 4, 16, P0.col); circ(ctx, nx + 10, y + pad + 11, 5, C.white); nx += 42;
  }
  M.text(ctx, P0.name, nx, y + pad + 22, F(28, 800), P0.col);
  lines.forEach((l, i) => M.text(ctx, l, x + pad, y + pad + 30 + (i + 0.85) * size * 1.18, f, C.ink));
  ctx.restore();
}
// Draws every line of scene S whose speaker has a place in `at` (who -> [x, y, tx, ty, w?, size?]); a line can
// carry its own place in `per` (id -> same).
function talk(ctx, t, S, at, per = {}) {
  for (const [id, L] of Object.entries(S.L)) {
    if (L.who === 'cap') continue;
    const p = per[id] || at[L.who]; if (!p) continue;
    bubble(ctx, t, L.a, L.b, L.who, L.text, p[0], p[1], p[2], p[3], { w: p[4] || 600, size: p[5] || 48 });
  }
}
const speaking = (t, S, who) => Object.values(S.L).some((L) => L.who === who && t >= L.a && t <= L.b);

// a card with a coloured top band and ticked lines
function tickCard(ctx, t, x, y, w, title, band, items, a0, step, o = {}) {
  const k = pk(t, a0, SPRING.gentle); if (k <= 0) return;
  const rowH = o.rowH || 92, h = 110 + items.length * rowH + 20;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-x - w / 2, -y - h / 2);
  shadowBox(ctx, x, y, w, h); rr(ctx, x, y, w, 84, band);
  M.text(ctx, title, x + 36, y + 58, F(44, 800), C.white);
  items.forEach((it, i) => {
    const [main, sub] = Array.isArray(it) ? it : [it, null];
    const ta = a0 + 0.8 + i * step, lk = pk(t, ta, SPRING.gentle), tk = prog(t, ta + 0.3, ta + 0.8);
    if (lk <= 0) return;
    const yy = y + 110 + i * rowH;
    rr(ctx, x + 36, yy, 56, 56, band); if (tk > 0) K.tick(ctx, x + 64, yy + 28, 0.95, tk, C.white, 9);
    M.text(ctx, main, x + 120 - (1 - Math.min(1, lk)) * 30, yy + (sub ? 30 : 42), F(o.size || 42, 700), C.ink);
    if (sub) M.text(ctx, sub, x + 120 - (1 - Math.min(1, lk)) * 30, yy + 70, F(30, 500), C.greyDark);
  });
  ctx.restore();
}

// ---------------------------------------------------------------- 0: title
function sTitle(ctx, t) {
  K.sky(ctx); K.clouds(ctx, t / P, 170, 6);
  hangars(ctx, 60, 6, 860, 0.7, true); K.ground(ctx, 860);
  const q = E.outCubic(prog(t, 0.2, 3.2));
  if (t < 3.6) pipFly(ctx, lerp(-300, 1520, q), lerp(260, 470, q) - Math.sin(q * Math.PI) * 140, 360, (1 - q) * 0.25);
  else pip(ctx, 'hello', 1520, 840, 300, t, { squash: Math.exp(-6 * (t - 3.6)) * Math.cos((t - 3.6) * 12) * 0.1 });
  const k1 = pk(t, 0.8, SPRING.gentle), k2 = pk(t, 1.5, SPRING.bouncy), k3 = pk(t, 2.4, SPRING.gentle);
  if (k1 > 0) { ctx.save(); ctx.translate(150, 250); ctx.scale(k1, k1); rr(ctx, 0, -60, 330, 80, NAVY); M.text(ctx, 'EPISODE 7', 30, 0, F(48, 800), C.white, 'left', 4); ctx.restore(); }
  if (k2 > 0) { ctx.save(); ctx.translate(150, 430); ctx.scale(k2, k2); M.text(ctx, 'Harry the', 0, -10, F(120, 800), NAVY); M.text(ctx, 'Harrier', 0, 120, F(150, 800), ES_RED); ctx.restore(); }
  if (k3 > 0) M.text(ctx, 'A surprise guest at Duxford', 156 - (1 - k3) * 60, 660, F(56, 600), C.greyDark);
  // Spanish flag stripe under the title
  const fk = ez(t, 2.0, 2.8);
  rr(ctx, 156, 700, 520 * fk, 12, ES_RED); rr(ctx, 156, 712, 520 * fk, 20, ES_YEL); rr(ctx, 156, 732, 520 * fk, 12, ES_RED);
}

// ---------------------------------------------------------------- 1: last time
function sRecap(ctx, t) {
  const S = SC.recap;
  // a warm evening at the tower
  K.sky(ctx, '#F6C9A0', '#FBE7CF');
  circ(ctx, 400, 520, 120, 'rgba(255,214,140,0.8)');
  hangars(ctx, -80, 3, 760, 0.8, true);
  tower(ctx, 1180, 780, 1.1, t, speaking(t, S, 'tower'));
  K.ground(ctx, 760, '#B8C98F', '#A3B87D');
  pip(ctx, t > S.L.r3.a ? 'point' : 'rest', 1640, 1000, 280, t, { flip: true });
  // an old-film frame round it all: this is a memory
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#8A6A45'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.lineWidth = 40; ctx.strokeStyle = C.paper; ctx.strokeRect(20, 20, W - 40, H - 40);
  const kk = pk(t, S.a + 0.2, SPRING.gentle);
  if (kk > 0) { ctx.save(); ctx.translate(80, 70); ctx.scale(kk, kk); rr(ctx, 0, 0, 380, 84, NAVY); M.text(ctx, 'Last time...', 34, 58, F(50, 800), C.white); ctx.restore(); }
  talk(ctx, t, S, { tower: [520, 110, 1190, 420, 700, 50], pip: [1240, 330, 1620, 760, 520, 50] });
  cap(ctx, t, S.a + 0.5, S.b - 0.2, 'Major Tower invited Pip and the team to Duxford.', { kicker: 'Episode 6', w: 1200, size: 54 });
}

// ---------------------------------------------------------------- 2: arriving at Duxford
function gateHurricane(ctx, x, y, s) {   // the Hurricane on a pole at the main gate
  rr(ctx, x - 10 * s, y - 260 * s, 20 * s, 260 * s, '#5E6874');
  rr(ctx, x - 70 * s, y - 20 * s, 140 * s, 20 * s, '#9AA4AE');
  warbird(ctx, x + 10 * s, y - 290 * s, 0.62 * s, { kind: 'hurri', gear: 0, rot: -0.16, mood: 'happy', look: [0.6, -0.2] });
}
function sArrive(ctx, t) {
  const S = SC.arrive, a = S.a, gy = 700;
  const fly = prog(t, a, a + 6.2);
  // the airfield from above first: the M11, the hangars and the grass
  if (fly < 1) {
    M.fill(ctx, '#A9CFA3');
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(lerp(1, 1.6, E.inCubic(fly)), lerp(1, 1.6, E.inCubic(fly))); ctx.translate(-W / 2, -H / 2);
    rr(ctx, 0, 0, W, 300, '#BFD9B7');
    rr(ctx, 160, 0, 90, H, '#8F9AA4'); for (let i = 0; i < 12; i++) rr(ctx, 202, i * 100 + ((t * 120) % 100), 6, 50, C.white);  // the M11
    for (let i = 0; i < 5; i++) { const cy = ((i * 230 + t * 160) % (H + 100)) - 50; K.rr(ctx, 176, cy, 24, 42, 0, [C.red, C.blue, C.yellow, C.white, C.teal][i]); }
    rr(ctx, 380, 520, 1500, 120, '#9BB48F');                                                   // the runway strip, grass and hard
    rr(ctx, 380, 560, 1500, 40, '#B8BFC5');
    for (let i = 0; i < 6; i++) { rr(ctx, 480 + i * 220, 330, 180, 110, '#A86A52'); rr(ctx, 480 + i * 220, 330, 180, 18, '#6A737C'); }
    rr(ctx, 1780, 360, 70, 70, '#EFE7D4');
    ctx.restore();
    K.pill(ctx, 202, 80, 'M11', { align: 'center', bg: BLUE, size: 40 });
    pipFly(ctx, lerp(-200, 2200, fly), 540 - Math.sin(fly * Math.PI) * 120, 300, 0.05);
    cap(ctx, t, a + 0.3, a + 6.2, 'IWM Duxford, near Cambridge', { kicker: 'Our airfield today', sub: 'Right beside junction 10 of the M11', w: 1100, size: 62 });
    return;
  }
  // at the main gate
  K.sky(ctx); K.clouds(ctx, t / P, 150, 4);
  hangars(ctx, 760, 4, gy, 0.72, true); tower(ctx, 1760, gy, 0.5, t);
  K.ground(ctx, gy);
  ctx.fillStyle = '#9CC596'; ctx.fillRect(0, gy, W, 26);
  gateHurricane(ctx, 300, gy + 40, 1.0);
  const land = prog(t, a + 6.2, a + 7.4);
  if (land < 1) pipFly(ctx, lerp(-150, 720, E.outCubic(land)), lerp(300, 820, E.outCubic(land)), 300, (1 - land) * 0.2);
  else pip(ctx, t > S.L.a3.a ? 'map' : 'hello', 720, 930, 260, t);
  // Charlie and Dad walk in
  const wk = ez(t, S.L.a2.a - 1.6, S.L.a2.a, E.outCubic), walk = wk < 1 ? Math.sin(t * 9) * 6 : 0;
  K.dad(ctx, lerp(2200, 1100, wk), 1010 + walk, 1.05, { mood: 'happy', blinkU: t / P, armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  K.kid(ctx, lerp(2050, 940, wk), 1010 - Math.abs(walk), 1.25, { mood: t > S.L.a2.a ? 'grin' : 'happy', blinkU: t / P, look: [-1, 0], hold: 'tablet', armL: [0.6, 1.3], armR: [0.6, 1.3] });
  pillPop(ctx, t, S.L.a1.a + 1.2, 300, gy + 90, 'The Hurricane on a pole: the accessible way in', { bg: NAVY, size: 32 });
  pillPop(ctx, t, S.L.a2.a + 2.5, 1400, 120, 'Duxford has been an airfield since 1918', { bg: BLUE, size: 38 });
  // the plan, ticked off
  const ca = S.L.a3.a + 0.6, cb = S.L.a4.a - 0.4;
  if (t > ca - 0.2 && t < cb + 0.4) {
    const out = E.inCubic(prog(t, cb - 0.2, cb + 0.4));
    ctx.save(); ctx.translate(0, out * 1100);
    tickCard(ctx, t, 470, 160, 1100, 'Plan with Pip: Duxford', TEAL, [
      ['Tickets: book online, in advance', 'There are no tickets on the gate at any Duxford show'],
      ['Parking: a permit at the two big Air Shows', 'Book it with your ticket'],
      ['No car? The free Air Show shuttle', 'From Cambridge station and Trumpington Park & Ride'],
      ['Gates open at 08:00', 'Find your spot on the crowd line first, then explore'],
    ], ca, 2.1, { rowH: 108 });
    ctx.restore();
  }
  talk(ctx, t, S, { pip: [800, 330, 760, 700, 600, 48], charlie: [1200, 240, 1000, 640, 620, 48] });
}

// ---------------------------------------------------------------- 3: Major Tower on the radio
function sRadio(ctx, t) {
  const S = SC.radio;
  airfield(ctx, t, { gy: 600, tx: 1600, ts: 0.85, wx: 1250, talking: speaking(t, S, 'tower') });
  K.fence(ctx, 800);
  K.crowd(ctx, -40, 500, 1000, 6, 0.9, 4, 1, t);
  const on = t > S.L.t3.a + 3.2;
  K.dad(ctx, 900, 1060, 1.1, { mood: on ? 'happy' : 'happy', blinkU: t / P, look: [1, -0.6], defenders: on ? K.DEF : null, armL: on ? K.POSE.relaxed : K.POSE.relaxed, armR: K.POSE.relaxed });
  K.kid(ctx, 700, 1060, 1.3, { mood: on ? 'grin' : 'wow', blinkU: t / P, look: [1, -0.6], defenders: on ? '#F08A4B' : null, armL: on ? K.POSE.ears : K.POSE.relaxed, armR: on ? K.POSE.ears : K.POSE.relaxed });
  pip(ctx, on ? 'loud' : t > S.L.t2.a ? 'point' : 'rest', 1180, 1000, 260, t);
  talk(ctx, t, S, { tower: [860, 120, 1600, 330, 640, 48], pip: [1250, 430, 1200, 760, 520, 48] });
  pillPop(ctx, t, S.L.t3.a + 3.2, 420, 640, 'Ear defenders on', { bg: K.DEF });
}

// ---------------------------------------------------------------- 4: Harry arrives and hovers
// Harry's path over the field, as a function of time (scene-local seconds). Returns { x, y, noz, thrust, rot, gear }.
function hoverPath(tl) {
  const fly = prog(tl, 1.0, 4.6);                   // fast in from the left
  const slow = prog(tl, 4.6, 9.0);                  // braking to a hover, nozzles swinging down
  let x = fly < 1 ? lerp(-500, 700, E.linear(fly)) : lerp(700, 1080, E.outCubic(slow));
  let y = 330 - (fly < 1 ? 0 : Math.sin(slow * Math.PI) * 20);
  const noz = clamp(prog(tl, 4.2, 7.6));
  let rot = fly < 1 ? -0.02 : -0.08 * Math.sin(slow * Math.PI);
  // the bow: nose down, then back up
  const bow = prog(tl, 13.5, 17.0); rot += Math.sin(bow * Math.PI) * 0.26;
  // a little sideways slide, then down onto the grass
  x += ez(tl, 17.5, 20.5) * -120;
  const down = ez(tl, 20.5, 25.5, E.inOutSine);
  y = lerp(y, 780 - HARRY_FEET * 1.05, down);
  const gear = ez(tl, 12.0, 14.0);
  const thrust = tl < 0.6 ? 0 : tl < 26.2 ? 1 : 1 - ez(tl, 26.2, 29.5);
  const hoverBob = (fly < 1 ? 0 : Math.sin(tl * 2.1) * 6 * (1 - down));
  return { x, y: y + hoverBob, noz, thrust, rot, gear, down };
}
function sHover(ctx, t) {
  const S = SC.hover, tl = t - S.a, gy = 780;
  const hp = hoverPath(tl);
  const shake = hp.thrust > 0.5 && tl > 4 && tl < 26 ? Math.sin(t * 70) * 2.5 : 0;
  ctx.save(); ctx.translate(shake, 0);
  airfield(ctx, t, { gy, hx: 200, hs: 0.6, tx: 1750, ts: 0.5, wx: 380 });
  // grass and dust blown by the jets while hovering low
  const low = hp.thrust * clamp(1 - (gy - (hp.y + HARRY_FEET)) / 380) * (hp.noz > 0.7 ? 1 : 0);
  dust(ctx, hp.x, gy + 10, 260, low, t);
  // heat shimmer under the nozzles while hovering
  if (hp.noz > 0.6 && hp.thrust > 0.2) { ctx.save(); ctx.globalAlpha = 0.25 * hp.thrust; for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let k = 0; k <= 20; k++) { const yy = hp.y + 80 + k * 16; const xx = hp.x - 90 + i * 34 + Math.sin(k * 0.8 + t * 14 + i) * 8; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.strokeStyle = C.white; ctx.lineWidth = 4; ctx.stroke(); } ctx.restore(); }
  harry(ctx, hp.x, hp.y, 1.05, { t, noz: hp.noz, thrust: hp.thrust, rot: hp.rot, gear: hp.gear, mood: tl > 26 ? 'happy-eyes' : 'happy', look: [0.2, 0.6] });
  ctx.restore();
  // the crowd in front
  K.fence(ctx, 960); K.crowd(ctx, -60, 520, 1170, 7, 0.95, 2, 1, t * 3);
  K.crowd(ctx, 1420, 1990, 1170, 6, 0.95, 8, 1, t * 3);
  const loud = tl > 3 && tl < 27;
  K.kid(ctx, 760, 1090, 1.2, { mood: tl > 26 ? 'grin' : 'wow', blinkU: t / P, look: [0.6, -1], defenders: '#F08A4B', armL: loud ? K.POSE.ears : K.POSE.up, armR: loud ? K.POSE.ears : K.POSE.up });
  pip(ctx, loud ? 'loud' : 'cheer', 1110, 1060, 220, t);
  K.loudChip(ctx, t / P, (S.a + 3) / P, { hold: 22 / P, x: W - 570, y: 50 });
  const h1 = S.L.h1.a;
  cap(ctx, t, h1 - 4.5, h1 + 4.2, 'A jet that can stop in mid-air!', { kicker: 'Here comes our guest', sub: 'A jump jet can hover, like a hummingbird.', w: 1000, x: 70, y: 470, size: 58 });
  cap(ctx, t, h1 + 4.5, h1 + 8.8, 'The Harrier bow', { sub: 'Nose down to say hello to the crowd.', w: 760, x: 70, y: 430, size: 58 });
  cap(ctx, t, h1 + 9.2, h1 + 13.3, 'Down onto the grass, straight down', { sub: 'No runway needed.', w: 880, x: 70, y: 430, size: 56 });
  talk(ctx, t, S, { charlie: [380, 330, 700, 790, 560, 50], pip: [300, 330, 1100, 850, 640, 50] });
}

// ---------------------------------------------------------------- 5: meet Harry
// a simple map: Rota to Duxford. lon/lat -> card x/y
const MAPB = { lon0: -11.5, lon1: 8.5, lat0: 35.2, lat1: 59.2 };
const GB = [[-5.7, 50.05], [-4.2, 50.35], [-3.4, 50.6], [-1.3, 50.75], [0.3, 50.8], [1.4, 51.15], [1.45, 51.4], [0.9, 51.6], [1.7, 52.6], [1.3, 53.0], [0.3, 53.4], [0.1, 53.65], [-0.2, 54.15], [-1.1, 54.6], [-1.6, 55.6], [-2.1, 56.0], [-2.5, 56.6], [-1.8, 57.6], [-3.1, 57.7], [-3.0, 58.65], [-5.0, 58.6], [-5.4, 58.0], [-5.8, 57.2], [-5.6, 56.3], [-5.0, 55.7], [-4.9, 54.85], [-3.6, 54.9], [-3.2, 54.1], [-3.0, 53.4], [-4.6, 53.3], [-4.1, 52.8], [-4.4, 52.2], [-5.2, 51.85], [-4.2, 51.65], [-3.2, 51.45], [-4.2, 51.2], [-5.0, 50.6]];
const IE = [[-6.0, 52.2], [-6.2, 53.4], [-5.9, 54.6], [-7.3, 55.35], [-8.4, 54.6], [-10.0, 53.6], [-9.9, 52.3], [-10.3, 51.7], [-8.5, 51.6], [-7.0, 52.1]];
const FR = [[1.6, 50.95], [1.6, 50.2], [0.2, 49.6], [-1.3, 49.3], [-1.9, 49.7], [-1.6, 48.65], [-3.0, 48.8], [-4.7, 48.4], [-4.3, 47.8], [-2.5, 47.3], [-2.0, 46.8], [-1.2, 46.1], [-1.25, 44.6], [-1.8, 43.4], [-1.8, 43.35], [-1.0, 43.0], [3.1, 42.45], [3.1, 43.1], [4.6, 43.4], [7.5, 43.8], [9.5, 44.2], [9.5, 51.5], [2.6, 51.1]];
const IB = [[-1.8, 43.4], [-3.8, 43.45], [-5.8, 43.6], [-8.0, 43.7], [-9.3, 43.0], [-8.9, 42.1], [-8.7, 40.6], [-9.0, 39.7], [-9.5, 38.8], [-8.8, 38.0], [-8.9, 37.0], [-7.4, 37.2], [-6.4, 36.8], [-6.2, 36.3], [-5.6, 36.0], [-4.4, 36.7], [-2.0, 36.7], [-0.7, 37.6], [0.2, 38.8], [-0.3, 39.4], [0.9, 40.7], [2.2, 41.4], [3.2, 41.9], [3.1, 42.45], [-1.0, 43.0]];
const ROTA = [-6.36, 36.62], DUX = [0.13, 52.09];
function sMeet(ctx, t) {
  const S = SC.meet;
  airfield(ctx, t, { gy: 600, hx: 40, hs: 0.62, tx: 1800, ts: 0.45, wx: 1550 });
  harry(ctx, 1240, 870 - HARRY_FEET * 1.6, 1.6, { t, gear: 1, mood: t > S.L.m8.a ? 'happy-eyes' : 'happy', look: [0.6, 0.2], flip: true });
  pip(ctx, t > S.L.m7.a && t < S.L.m7.b ? 'cheer' : t < S.L.m1.b ? 'hello' : 'rest', 330, 1010, 300, t);
  K.kid(ctx, 620, 1060, 1.1, { mood: 'happy', blinkU: t / P, look: [1, -0.4], armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  pillPop(ctx, t, S.L.m2.a + 1.2, 1240, 960, 'Spanish Navy: Armada Española', { bg: ES_RED, size: 40 });
  // the map card: Rota to Duxford
  const ma = S.L.m3.a, mb = S.L.m5.b;
  const mk = Math.min(pk(t, ma, SPRING.gentle), 1 - E.inCubic(prog(t, mb - 0.2, mb + 0.4)));
  if (mk > 0) {
    const x = 70, y = 60, w = 620, h = 720;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(mk, mk); ctx.translate(-x - w / 2, -y - h / 2);
    shadowBox(ctx, x, y, w, h, '#BFE0EE');
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const pr = ([lo, la]) => [x + (lo - MAPB.lon0) / (MAPB.lon1 - MAPB.lon0) * w, y + (MAPB.lat1 - la) / (MAPB.lat1 - MAPB.lat0) * h];
    for (const poly of [FR, IB, GB, IE]) { path(ctx, poly.map(pr)); ctx.fillStyle = poly === GB || poly === IB ? '#F4EBD6' : '#E4DCC6'; ctx.fill(); ctx.strokeStyle = '#9FB2BE'; ctx.lineWidth = 3; ctx.stroke(); }
    const [rx, ry] = pr(ROTA), [dx, dy] = pr(DUX);
    const rk = prog(t, S.L.m4.a, S.L.m4.a + 3.2);
    K.route(ctx, [[rx, ry], [rx - 40, (ry + dy) / 2 + 40], [dx, dy]], rk, ES_RED, 7, [4, 18]);
    K.pin(ctx, rx, ry, 0.5, ES_RED); K.pin(ctx, dx, dy, 0.5, TEAL);
    M.text(ctx, 'Rota, Spain', rx + 30, ry + 8, F(32, 800), INK);
    M.text(ctx, 'Duxford', dx + 26, dy + 8, F(32, 800), INK);
    if (rk > 0 && rk < 1) { const bz = (q) => [lerp(lerp(rx, rx - 40, q), lerp(rx - 40, dx, q), q), lerp(lerp(ry, (ry + dy) / 2 + 40, q), lerp((ry + dy) / 2 + 40, dy, q), q)]; const [hx, hy] = bz(rk); harry(ctx, hx, hy, 0.12, { t, thrust: 1, rot: -1.25 }); }
    ctx.restore();
    rr(ctx, x, y, w, 70, NAVY); M.text(ctx, 'From Rota to Duxford', x + 30, y + 48, F(38, 800), C.white);
    // the ship, with its ski jump
    const sk = pk(t, S.L.m5.a + 0.4);
    popAt(ctx, x + w - 170, y + h - 120, sk, () => {
      rr(ctx, -150, -40, 300, 60, '#7D8792'); ctx.beginPath(); ctx.moveTo(150, -40); ctx.quadraticCurveTo(190, -50, 200, -70); ctx.lineTo(200, 20); ctx.lineTo(150, 20); ctx.closePath(); ctx.fillStyle = '#7D8792'; ctx.fill();
      rr(ctx, -40, -100, 70, 60, '#9AA4AE'); rr(ctx, -150, -46, 340, 8, '#5E6874');
      M.text(ctx, 'L61', -120, 4, F(30, 800), C.white);
      harry(ctx, -100, -60, 0.14, { t, gear: 1 });
    });
    ctx.restore();
    pillPop(ctx, t, S.L.m5.a + 1.4, 380, 860, 'Ships like mine have a ski jump ramp for take off', { bg: NAVY, size: 32 });
  }
  // Spanish words
  const wa = S.L.m6.a + 0.6, wb = S.b;
  const wk = Math.min(pk(t, wa, SPRING.gentle), 1 - E.inCubic(prog(t, wb - 0.6, wb)));
  if (wk > 0) {
    const x = 70, y = 70, w = 640;
    const rows = [['Hola', 'Hello'], ['Gracias', 'Thank you'], ['Avión', 'Aeroplane'], ['Abuelo', 'Grandad']];
    ctx.save(); ctx.translate(x + w / 2, y + 260); ctx.scale(wk, wk); ctx.translate(-x - w / 2, -y - 260);
    shadowBox(ctx, x, y, w, 120 + rows.length * 100);
    rr(ctx, x, y, w, 26, ES_RED); rr(ctx, x, y + 26, w, 40, ES_YEL); rr(ctx, x, y + 66, w, 26, ES_RED);
    M.text(ctx, 'Spanish with Harry', x + 30, y + 58, F(40, 800), INK);
    rows.forEach(([es, en], i) => {
      const k = pk(t, wa + 0.8 + i * 0.9, SPRING.gentle); if (k <= 0) return;
      const yy = y + 160 + i * 100;
      M.text(ctx, es, x + 40 - (1 - Math.min(1, k)) * 30, yy, F(54, 800), ES_RED);
      M.text(ctx, '= ' + en, x + 330, yy, F(46, 600), INK);
    });
    ctx.restore();
  }
  talk(ctx, t, S, { harry: [900, 110, 1060, 520, 660, 50], pip: [160, 520, 330, 800, 560, 48] }, {
    m2b: [780, 110, 1060, 520, 620, 48], m3: [780, 110, 1060, 520, 620, 48], m4: [780, 110, 1060, 520, 620, 48], m5: [780, 110, 1060, 520, 620, 48],
    m6: [800, 130, 1060, 520, 560, 50], m8: [800, 130, 1060, 520, 560, 50], m7: [760, 560, 400, 760, 520, 48],
  });
}

// ---------------------------------------------------------------- 6: how a jump jet hovers
function sHow(ctx, t) {
  const S = SC.how, L = S.L;
  M.fill(ctx, BLUE);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // nozzle angle through the lesson
  let noz = 0.5;
  if (t > L.w3.a) noz = 0.5 - 0.5 * ez(t, L.w3.a, L.w3.a + 1.2);
  if (t > L.w4.a) noz = ez(t, L.w4.a, L.w4.a + 1.2);
  const cut = Math.min(ez(t, L.w1.a + 1.5, L.w1.a + 2.5), 1 - ez(t, L.w3.a - 0.5, L.w3.a));
  const rise = t > L.w4.a ? ez(t, L.w4.a + 1.0, L.w4.a + 3.5) * 70 : 0;
  const fwd = t > L.w3.a && t < L.w4.a ? Math.sin(prog(t, L.w3.a + 1, L.w4.a) * Math.PI) * 60 : 0;
  const hx = 1080 + fwd, hy = 560 - rise;
  const thrust = t > L.w3.a ? 0.85 : 0;
  const hiNoz = t > L.w2.a && t < L.w3.a ? 0.6 + 0.4 * Math.sin(t * 8) : 0;
  harry(ctx, hx, hy, 1.5, { t, noz, thrust, cut, hiNoz, puff: t > L.w5.a && t < L.w6.b ? 1 : 0, gear: t > L.w4.a ? 1 - ez(t, L.w4.a, L.w4.a + 1) : 1, look: [-0.7, 0.2] });
  // labels
  if (cut > 0.05) { ctx.save(); ctx.globalAlpha = cut; K.pill(ctx, hx - 640, hy - 190, 'Pegasus engine', { bg: ES_YEL, fg: INK, size: 38 }); K.line(ctx, [[hx - 330, hy - 180], [hx - 60, hy - 20]], ES_YEL, 5); ctx.restore(); }
  if (hiNoz > 0) { K.pill(ctx, hx - 380, hy + 220, 'Nozzles: four in all', { bg: ES_YEL, fg: INK, size: 38 }); }
  // air arrows
  const arrow = (x, y, dx, dy, col) => { K.line(ctx, [[x, y], [x + dx, y + dy]], col, 10); const a = Math.atan2(dy, dx); ctx.beginPath(); ctx.moveTo(x + dx + Math.cos(a) * 22, y + dy + Math.sin(a) * 22); ctx.lineTo(x + dx + Math.cos(a + 2.4) * 26, y + dy + Math.sin(a + 2.4) * 26); ctx.lineTo(x + dx + Math.cos(a - 2.4) * 26, y + dy + Math.sin(a - 2.4) * 26); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  if (t > L.w3.a + 0.8 && t < L.w4.a) { const q = (t * 1.5) % 1; arrow(hx - 300 - q * 60, hy + 45, -120, 0, 'rgba(255,255,255,0.8)'); arrow(hx + 460, hy - 20, 120, 0, ES_YEL); M.text(ctx, 'Forwards', hx + 470, hy - 60, F(40, 800), ES_YEL); }
  if (t > L.w4.a + 0.8 && t < L.w5.a + 1) { const q = (t * 1.5) % 1; arrow(hx + 105, hy + 160 + q * 40, 0, 110, 'rgba(255,255,255,0.8)'); arrow(hx - 75, hy + 160 + q * 40, 0, 110, 'rgba(255,255,255,0.8)'); arrow(hx + 460, hy + 20, 0, -150, ES_YEL); M.text(ctx, 'Up!', hx + 430, hy + 80, F(44, 800), ES_YEL); }
  // the step list down the left
  const steps = [['1', 'One engine', L.w1.a], ['2', 'Four nozzles', L.w2.a], ['3', 'Nozzles back: forwards', L.w3.a], ['4', 'Nozzles down: hover', L.w4.a], ['5', 'Puffer jets: balance', L.w5.a]];
  M.text(ctx, 'HOW A JUMP JET HOVERS', 70, 110, F(44, 800), C.white, 'left', 3);
  steps.forEach(([n, s, a], i) => {
    const k = pk(t, a, SPRING.gentle); if (k <= 0) return;
    const y = 160 + i * 96, on = t >= a && (i === steps.length - 1 || t < steps[i + 1][2]);
    rr(ctx, 70 - (1 - Math.min(1, k)) * 40, y, 72, 72, on ? ES_YEL : C.white); M.text(ctx, n, 106 - (1 - Math.min(1, k)) * 40, y + 52, F(44, 800), INK, 'center');
    M.text(ctx, s, 166, y + 50, F(40, 700), on ? ES_YEL : C.white);
  });
  pip(ctx, t > L.w6.a ? 'cheer' : 'point', 260, 1030, 200, t);
  talk(ctx, t, S, { harry: [700, 120, 1180, 440, 700, 48], pip: [70, 640, 260, 880, 520, 46] });
  cap(ctx, t, L.w6.a, S.b - 0.1, 'The Harrier was the world\'s first working jump jet.', { kicker: 'Good to know', sub: 'It was designed in Britain and joined the RAF in 1969.', w: 1100, x: 760, size: 50 });
}

// ---------------------------------------------------------------- 7: the Spitfire and the Hurricane
function sWarbirds(ctx, t) {
  const S = SC.warbirds, L = S.L, gy = 560;
  airfield(ctx, t, { gy, hx: 900, hs: 0.6, tower: true, tx: 1820, ts: 0.4, wx: 1660 });
  ctx.fillStyle = '#B8BFC5'; ctx.fillRect(0, gy + 26, W, 14);
  const ground = 840;
  warbird(ctx, 420, ground - WAR_FEET * 1.25, 1.25, { kind: 'spit', t, rot: -0.1, mood: speaking(t, S, 'spit') ? 'happy' : 'calm', look: [0.8, 0] });
  warbird(ctx, 1010, ground - WAR_FEET * 1.25 - 6, 1.25, { kind: 'hurri', t, rot: -0.1, mood: t > L.b6.a ? 'happy-eyes' : speaking(t, S, 'hurri') ? 'happy' : 'calm', look: [0.8, 0] });
  harry(ctx, 1620, ground - HARRY_FEET * 0.95, 0.95, { t, gear: 1, flip: true, mood: t > L.b6.a ? 'happy-eyes' : 'happy', look: [0.6, 0] });
  // people on the flightline walk
  K.crowd(ctx, 80, 1700, ground + 150, 9, 0.75, 13, 1, t);
  pip(ctx, t < L.b1.b ? 'point' : 'rest', 760, 1050, 220, t);
  K.kid(ctx, 1220, 1075, 1.0, { mood: t > L.b6.a ? 'grin' : 'happy', blinkU: t / P, look: [-1, -0.6], hold: 'camera', armL: [2.05, 2.15], armR: [2.05, 2.15] });
  if (t > L.b6.a + 1) for (let i = 0; i < 4; i++) { const q = ((t - L.b6.a) * 0.8 + i / 4) % 1; M.text(ctx, '♥', 1300 + i * 40 + Math.sin(q * 6 + i) * 20, 470 - q * 160, F(44, 800), `rgba(215,73,73,${(1 - q).toFixed(3)})`, 'center'); }
  pillPop(ctx, t, L.b2.a + 0.8, 420, 890, 'Designed by R.J. Mitchell', { bg: CAMO_G, size: 32 });
  pillPop(ctx, t, L.b5.a + 0.8, 1010, 890, 'Designed by Sydney Camm', { bg: CAMO_B, size: 32 });
  talk(ctx, t, S, { pip: [520, 520, 760, 860, 540, 46], spit: [120, 80, 430, 640, 640, 48], hurri: [640, 60, 1000, 640, 660, 48], harry: [1160, 120, 1610, 690, 640, 48] });
  cap(ctx, t, S.a + 0.4, L.b2.a - 0.2, 'The morning flightline walk', { sub: 'At the big Air Shows you can see the aircraft up close in the morning.', w: 1300, size: 56, y: H - 40 });
}

// ---------------------------------------------------------------- 7b: spot the difference
function sSpot(ctx, t) {
  const S = SC.spot, L = S.L;
  M.fill(ctx, C.paper);
  const panels = [['Spitfire', CAMO_G, true, ['Round, oval wings', 'A slim body and a long, pointed nose'], L.s2.a], ['Hurricane', CAMO_B, false, ['Straighter wings', 'A hump behind the pilot'], L.s3.a]];
  panels.forEach(([name, col, spit, facts, at], i) => {
    const x = 70 + i * 900, y = 60, w = 860, h = 640;
    const k = pk(t, S.a + 0.3 + i * 0.5, SPRING.gentle); if (k <= 0) return;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-x - w / 2, -y - h / 2);
    shadowBox(ctx, x, y, w, h); rr(ctx, x, y, w, 84, col);
    M.text(ctx, name, x + 36, y + 60, F(50, 800), C.white);
    const on = t > at && t < at + 7;
    // seen from below: the wing shape
    ctx.save(); ctx.translate(x + 230, y + 300); ctx.rotate(-Math.PI / 2);
    if (on) { ctx.save(); ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 6); ctx.beginPath(); ctx.ellipse(0, 0, 150, 170, 0, 0, TAU); ctx.fillStyle = ES_YEL; ctx.fill(); ctx.restore(); }
    topFighter(ctx, 0, 0, 1.05, spit);
    ctx.restore();
    M.text(ctx, 'From below', x + 230, y + 500, F(30, 700), C.greyDark, 'center');
    // side on
    warbird(ctx, x + 640, y + 280, 0.68, { kind: spit ? 'spit' : 'hurri', t, rot: -0.08, mood: 'happy', look: [-0.6, 0] });
    if (on && !spit) { ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 6); ctx.beginPath(); ctx.ellipse(x + 640 - 48, y + 280 - 40, 70, 36, -0.1, 0, TAU); ctx.strokeStyle = ES_YEL; ctx.lineWidth = 10; ctx.stroke(); ctx.restore(); }
    M.text(ctx, 'Side on', x + 640, y + 500, F(30, 700), C.greyDark, 'center');
    facts.forEach((f, j) => { const fk = pk(t, at + 0.6 + j * 1.2, SPRING.gentle); if (fk <= 0) return; rr(ctx, x + 36, y + 540 + j * 46 - 30, 30, 30, col); M.text(ctx, f, x + 84 - (1 - Math.min(1, fk)) * 20, y + 540 + j * 46 - 4, F(34, 700), INK); });
    ctx.restore();
  });
  K.kid(ctx, 1260, 1075, 1.0, { mood: t > L.s4.a ? 'grin' : t < L.s2.a ? 'worried' : 'happy', blinkU: t / P, look: [-1, -0.6], armL: K.POSE.relaxed, armR: t > L.s4.a ? K.POSE.up : K.POSE.relaxed });
  pip(ctx, t > L.s4.a ? 'cheer' : 'point', 250, 1060, 220, t);
  talk(ctx, t, S, { charlie: [1340, 740, 1270, 830, 540, 42], pip: [400, 735, 330, 880, 620, 42] });
  cap(ctx, t, L.s4.b - 0.4, S.b - 0.1, 'Print our spotter cards and take them with you.', { kicker: 'Spot it', w: 1100, size: 50, y: H - 30 });
}

// ---------------------------------------------------------------- 8: Duxford through time
function sHistory(ctx, t) {
  const S = SC.history, L = S.L, a = S.a;
  M.fill(ctx, C.paper);
  const items = [
    ['1918', 'Duxford opens as an RAF airfield', null, BLUE],
    ['1938', "The RAF's very first Spitfires arrive here", 'With No. 19 Squadron', CAMO_G],
    ['1940', 'The Battle of Britain', 'More Hurricanes flew in it than Spitfires', RED],
    ['1969', 'The Harrier jump jet joins the RAF', null, GREY_D],
    ['Today', 'IWM Duxford: a museum, and home to air shows', null, TEAL],
  ];
  M.text(ctx, 'Duxford through time', 90, 110, F(70, 800), NAVY);
  const x0 = 220, x1 = 1700, ly = 240;
  const lk = ez(t, a + 0.6, a + 2.0);
  rr(ctx, x0, ly - 5, (x1 - x0) * lk, 10, NAVY);
  items.forEach(([yr, txt, sub, col], i) => {
    const ta = a + 1.2 + i * 2.3, k = pk(t, ta, SPRING.bouncy); if (k <= 0) return;
    const x = lerp(x0, x1, i / (items.length - 1));
    popAt(ctx, x, ly, k, () => { rr(ctx, -70, -46, 140, 92, col); M.text(ctx, yr, 0, 16, F(44, 800), C.white, 'center'); });
    const tk = pk(t, ta + 0.4, SPRING.gentle); if (tk <= 0) return;
    const w = 330, lines = K.wrap(ctx, txt, F(34, 700), w - 20), subl = sub ? K.wrap(ctx, sub, F(26, 500), w - 20) : [];
    const yy = ly + 80 + (1 - Math.min(1, tk)) * 30;
    lines.forEach((l, j) => M.text(ctx, l, x, yy + 34 + j * 40, F(34, 700), INK, 'center'));
    subl.forEach((l, j) => M.text(ctx, l, x, yy + 44 + lines.length * 40 + j * 32, F(26, 500), C.greyDark, 'center'));
  });
  // the friends watch from below
  const ck = ez(t, L.y1.a - 1.2, L.y1.a, E.outCubic);
  if (ck > 0) {
    warbird(ctx, 300, 1180 - ck * 300, 0.9, { kind: 'spit', t, mood: speaking(t, S, 'spit') ? 'happy' : 'calm', look: [0.6, -0.4] });
    warbird(ctx, 830, 1180 - ck * 300, 0.9, { kind: 'hurri', t, mood: speaking(t, S, 'hurri') ? 'happy' : 'calm', look: [0.6, -0.4] });
    harry(ctx, 1580, 1190 - ck * 300, 0.75, { t, flip: true, mood: t > L.y3.a ? 'happy-eyes' : 'happy', look: [0.6, -0.4] });
  }
  talk(ctx, t, S, { spit: [150, 590, 300, 820, 660, 46], hurri: [620, 590, 830, 820, 680, 46], harry: [1100, 590, 1560, 820, 640, 46] });
}

// ---------------------------------------------------------------- 9: the memorial flights
function sMemorial(ctx, t) {
  const S = SC.memorial, L = S.L, a = S.a;
  K.sky(ctx, '#9FC2DA', '#F6DDBE');
  K.cloud(ctx, 300 + t * 6 % 400, 200, 1.1, '#FFFFFF', 0.6); K.cloud(ctx, 1500 - t * 4 % 300, 140, 0.8, '#FFFFFF', 0.5);
  // the flypast: the Lancaster with a Spitfire and a Hurricane, seen from below
  const fp = prog(t, L.f2.a + 0.5, L.f3.b + 2.5);
  if (fp > 0 && fp < 1) {
    const x = lerp(-500, 2400, fp), y = 330 + Math.sin(fp * 3) * 10;
    topLanc(ctx, x, y, 0.75);
    topFighter(ctx, x - 230, y - 250, 0.6, true);
    topFighter(ctx, x - 230, y + 250, 0.6, false);
  }
  // looking up together
  K.ground(ctx, 900, '#9CC596', '#8DBB8C');
  hangars(ctx, 1300, 2, 900, 0.5, true);
  K.kid(ctx, 1240, 1060, 1.1, { mood: 'calm', blinkU: t / P, look: [-0.2, -1], armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  K.dad(ctx, 1420, 1060, 1.0, { mood: 'calm', blinkU: t / P, look: [-0.2, -1], armL: K.POSE.relaxed, armR: [0.9, 0.9] });
  pip(ctx, 'rest', 1040, 1030, 190, t);
  // the memorial flight card
  tickCard(ctx, t, 70, 520, 1000, 'The Battle of Britain Memorial Flight', NAVY, [
    'An RAF flight at RAF Coningsby, Lincolnshire',
    'Flies Spitfires, Hurricanes and a Lancaster',
    'Since 1957, to remember those who served',
  ], L.f2.b - 0.2, 1.9, { rowH: 84, size: 38 });
  talk(ctx, t, S, { pip: [740, 420, 1040, 840, 560, 46], hurri: [70, 80, 400, 380, 760, 48], harry: [70, 80, 400, 380, 640, 48] });
  cap(ctx, t, L.f3.b + 0.2, S.b - 0.3, 'When a memorial flight flies over, take a quiet moment to look up.', { w: 1400, size: 54, y: H - 40 });
}

// ---------------------------------------------------------------- 9b: crosswinds
// Duxford's runways are 06/24 (pointing 060 and 240 degrees). Limits: BBMF, as given by Clive Rowley on the
// Memorial Flight Club forum (2016): baby Spitfires (Mk IIa, Mk Vb) 10 kt across; later Spitfires, Hurricanes and
// the Lancaster 15 kt; no BBMF flying in winds over 25 kt.
function sWind(ctx, t) {
  const S = SC.wind, L = S.L;
  M.fill(ctx, C.paper);
  // left: Duxford from above
  const x = 60, y = 40, w = 780, h = 560;
  const pk0 = pk(t, S.a + 0.2, SPRING.gentle);
  if (pk0 > 0) {
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(pk0, pk0); ctx.translate(-x - w / 2, -y - h / 2);
    shadowBox(ctx, x, y, w, h, '#A9CFA3');
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.ellipse(x + hash01(i, 3) * w, y + hash01(i, 4) * h, 40, 5, 0, 0, TAU); ctx.fillStyle = '#9CC596'; ctx.fill(); }
    const cx = x + w / 2, cy = y + h / 2 + 20, ang = -Math.PI / 6;           // runway 06/24: 60 degrees from north
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    rr(ctx, -360, 52, 720, 50, '#8DBB8C'); M.text(ctx, 'GRASS', 0, 87, F(26, 800), 'rgba(255,255,255,0.8)', 'center', 4);
    rr(ctx, -360, -40, 720, 76, '#7D8792');
    for (let i = 0; i < 9; i++) rr(ctx, -250 + i * 60, -4, 32, 6, C.white);
    M.text(ctx, '06', -320, 16, F(40, 800), C.white, 'center'); M.text(ctx, '24', 320, 16, F(40, 800), C.white, 'center');
    // a Spitfire on the runway: pushed sideways by the crosswind
    const drift = t > L.c3.a + 2 ? Math.sin(prog(t, L.c3.a + 2, L.c3.b) * Math.PI) : 0;
    ctx.save(); ctx.translate(-60 + (t > L.c3.a ? prog(t, L.c3.a, L.c5.b) * 120 : 0), drift * 34); ctx.rotate(drift * 0.35);
    topFighter(ctx, 0, 0, 0.34, true); ctx.restore();
    ctx.restore();
    // north arrow
    M.text(ctx, 'N', x + w - 50, y + 166, F(40, 800), INK, 'center'); ctx.beginPath(); ctx.moveTo(x + w - 50, y + 84); ctx.lineTo(x + w - 64, y + 124); ctx.lineTo(x + w - 36, y + 124); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
    // the wind: first along the runway, then from the north, straight across
    const across = ez(t, L.c2.a + 2.5, L.c2.a + 4.0);
    const wa = lerp(Math.PI - Math.PI / 6, Math.PI / 2, across);             // direction the wind blows towards
    const dx = Math.cos(wa), dy = Math.sin(wa);
    for (let i = 0; i < 7; i++) {
      const q = (t * 0.6 + i / 7) % 1, off = (i - 3) * 70;
      const sx = cx - dx * 300 + -dy * off + dx * 600 * q, sy = cy - 40 - dy * 300 + dx * off + dy * 600 * q;
      K.line(ctx, [[sx, sy], [sx + dx * 70, sy + dy * 70]], `rgba(255,255,255,${(Math.sin(q * Math.PI) * 0.9).toFixed(3)})`, 6);
    }
    ctx.restore();
    const lab = across < 0.5 ? ['Wind along the runway: good', TEAL] : ['Wind across the runway: a crosswind', RED];
    if (t > S.a + 0.8) K.pill(ctx, x + 24, y + h - 44, lab[0], { bg: lab[1], size: 34 });
    rr(ctx, x, y, w, 64, NAVY); M.text(ctx, 'Duxford from above: runway 06/24', x + 26, y + 44, F(34, 800), C.white);
    ctx.restore();
  }
  // right: the limits
  tickCard(ctx, t, 900, 40, 960, 'Crosswind limits: memorial flight', NAVY, [
    ['Early Spitfires: 10 knots across', 'The Mk II and Mk V have a small fin and rudder'],
    ['Later Spitfires, Hurricanes, Lancaster: 15', 'Knots of wind blowing across the runway'],
    ['No flying at all over 25 knots', 'However the wind is blowing'],
    ['A big airliner: about 35 knots', 'Heavier, with wheels set wide apart'],
  ], L.c5.b - 0.2, 1.6, { rowH: 106, size: 38 });
  if (t > L.c5.b + 5) pillPop(ctx, t, L.c5.b + 5, 1380, 650, '15 knots is about 17 mph: enough to sway small branches', { bg: BLUE, size: 30 });
  // the friends along the bottom
  warbird(ctx, 980, 950, 0.8, { kind: 'spit', t, rot: -0.1, mood: speaking(t, S, 'spit') ? 'happy' : 'calm', look: [-0.6, -0.3], flip: true });
  warbird(ctx, 1340, 950, 0.8, { kind: 'hurri', t, rot: -0.1, mood: speaking(t, S, 'hurri') ? 'happy' : 'calm', look: [-0.6, -0.3], flip: true });
  harry(ctx, 1720, 975 - HARRY_FEET * 0.7 + 40, 0.7, { t, gear: 1, flip: true, mood: t > L.c7.a ? 'happy-eyes' : 'happy', look: [0.6, -0.3] });
  windsock(ctx, 640, 1060, 1.0, t);
  pip(ctx, t > L.c8.a ? 'tip' : t > L.c6.a ? 'map' : 'point', 260, 1060, 220, t);
  talk(ctx, t, S, { pip: [380, 640, 330, 860, 760, 42], harry: [1060, 700, 1700, 860, 720, 42], spit: [560, 640, 960, 880, 760, 42], hurri: [800, 640, 1320, 860, 760, 42] });
}

// ---------------------------------------------------------------- 10: the pilots' briefing, and your plan
function sBrief(ctx, t) {
  const S = SC.brief, L = S.L;
  // inside a hangar
  M.fill(ctx, '#E6DCCB'); ctx.fillStyle = '#D3C6B1'; ctx.fillRect(0, 820, W, H - 820);
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(i * 280, 0); ctx.lineTo(i * 280 + 140, 120); ctx.lineTo(i * 280 + 280, 0); ctx.strokeStyle = '#C2B49C'; ctx.lineWidth = 8; ctx.stroke(); }
  // the briefing board
  const bk = pk(t, S.a + 0.4, SPRING.gentle);
  const planAt = L.p4.a + 0.4;
  const out = E.inCubic(prog(t, planAt - 0.6, planAt));
  if (bk > 0 && out < 1) {
    ctx.save(); ctx.translate(0, -out * 1100);
    tickCard(ctx, t, 70, 70, 1060, "The pilots' briefing", NAVY, [
      ['Weather', 'Is the cloud high enough? Is it too windy?'],
      ['The display line', 'Exactly where each aircraft flies'],
      ['Timings', 'Every display slot, planned to the minute'],
      ['Safety', 'The Flying Display Director is in charge'],
    ], S.a + 0.4, 2.1, { rowH: 110 });
    ctx.restore();
  }
  // Pip's tips for the day
  if (t > planAt - 0.4) {
    tickCard(ctx, t, 70, 70, 1060, "Pip's tips for your Duxford day", RED, [
      ['Ear defenders', 'A hovering Harrier is one of the loudest sounds at a show'],
      ['Water and a hat', 'The queue to get in is often in full sun'],
      ['Layers and a waterproof', 'Displays can change on the day with the weather'],
      ['Lost? Stand still', 'And find a steward'],
    ], planAt, 1.6, { rowH: 110 });
  }
  harry(ctx, 1500, 820 - HARRY_FEET * 0.9, 0.9, { t, gear: 1, flip: true, look: [0.6, 0], mood: t > L.p3.b ? 'happy' : 'happy' });
  pip(ctx, t > L.p4.a ? 'map' : t > L.p2.a ? 'point' : 'rest', 1350, 1040, 220, t);
  talk(ctx, t, S, { harry: [1150, 110, 1500, 600, 700, 46], pip: [1180, 520, 1330, 820, 600, 46] });
}

// ---------------------------------------------------------------- 11: the display
function sDisplay(ctx, t) {
  const S = SC.display, tl = t - S.a, gy = 760;
  K.sky(ctx); K.clouds(ctx, t / P, 140, 6);
  hangars(ctx, 120, 4, gy, 0.55, true); tower(ctx, 1500, gy, 0.42, t); K.ground(ctx, gy);
  // the pair: Spitfire and Hurricane, side by side
  const pq = prog(tl, 0.5, 11.5);
  if (pq > 0 && pq < 1) {
    const x = lerp(-400, 2300, pq), y = 330 + Math.sin(pq * Math.PI) * -60;
    warbird(ctx, x, y, 0.8, { kind: 'spit', t, prop: 1, gear: 0, rot: -0.05, mood: 'happy-eyes' });
    warbird(ctx, x - 330, y + 90, 0.8, { kind: 'hurri', t, prop: 1, gear: 0, rot: -0.05, mood: 'happy-eyes' });
  }
  // Harry's display: in from the right, a hover, the bow, backwards, then away
  const h0 = 12.5;
  if (tl > h0) {
    const q = tl - h0;
    const inQ = prog(q, 0, 4.0), x0 = lerp(2300, 980, E.outCubic(inQ));
    let x = x0, y = 360, noz = clamp(prog(q, 1.5, 4.0)), rot = 0;
    rot += Math.sin(prog(q, 6.5, 9.5) * Math.PI) * -0.25;                     // the bow (flipped, so negative)
    x += ez(q, 10.0, 14.5, E.inOutSine) * 260;                                // flying backwards (to the right, tail first)
    const away = prog(q, 16.0, 21.0);
    noz = away > 0 ? 1 - ez(q, 16.0, 17.2) : noz;
    x -= E.inCubic(away) * 1800; y -= E.inCubic(away) * 380; rot += away > 0 ? 0.25 * ez(q, 16.5, 18) : 0;
    y += Math.sin(q * 2.1) * 6 * (1 - away);
    harry(ctx, x, y, 0.85, { t, noz, thrust: 1, rot, flip: true, mood: 'happy-eyes' });
  }
  K.fence(ctx, 940); K.crowd(ctx, -60, 1990, 1150, 14, 0.95, 21, 1, t * 4);
  const cheer = (tl > 9 && tl < 12) || tl > 33;
  K.kid(ctx, 820, 1080 + (cheer ? -Math.abs(Math.sin(t * 9)) * 14 : 0), 1.2, { mood: 'grin', blinkU: t / P, look: [0.6, -1], defenders: '#F08A4B', armL: cheer ? K.POSE.up : K.POSE.ears, armR: cheer ? K.POSE.up : K.POSE.ears });
  pip(ctx, cheer ? 'cheer' : 'loud', 1080, 1040, 210, t);
  K.loudChip(ctx, t / P, (S.a + h0 + 1) / P, { hold: 20 / P, x: W - 570, y: 50 });
  cap(ctx, t, S.a + 1, S.a + 10.5, 'The Spitfire and the Hurricane, together', { sub: 'Listen for the growl of their Merlin engines.', w: 1100, x: 70, y: 690, size: 54 });
  cap(ctx, t, S.a + h0 + 6.2, S.a + h0 + 9.6, 'The bow', { w: 420, x: 70, y: 690, size: 58 });
  cap(ctx, t, S.a + h0 + 10.0, S.a + h0 + 15.0, 'Flying backwards!', { w: 620, x: 70, y: 690, size: 58 });
  talk(ctx, t, S, { charlie: [450, 420, 820, 790, 520, 54] });
}

// ---------------------------------------------------------------- 12: goodbye
function sBye(ctx, t) {
  const S = SC.bye, L = S.L;
  K.sky(ctx, '#F3C9A0', '#FBE7CF'); circ(ctx, 1500, 560, 110, 'rgba(255,214,140,0.85)');
  hangars(ctx, -40, 3, 760, 0.7, true); tower(ctx, 1300, 760, 0.7, t, speaking(t, S, 'tower'));
  K.ground(ctx, 760, '#B8C98F', '#A3B87D');
  // Harry rocks the wings and heads home to the south
  const q = prog(t, S.a, S.b + 1);
  harry(ctx, lerp(-300, 2300, q), 300 - Math.sin(q * Math.PI) * 40, 0.6, { t, thrust: 1, rot: Math.sin(t * 3) * 0.1, mood: 'happy-eyes' });
  K.kid(ctx, 620, 1040, 1.2, { mood: 'happy', blinkU: t / P, look: [0.6, -1], armR: [2.5 + Math.sin(t * 5) * 0.25, -0.25], armL: K.POSE.relaxed });
  K.dad(ctx, 820, 1040, 1.05, { mood: 'happy', blinkU: t / P, look: [0.6, -1], armL: K.POSE.relaxed, armR: K.POSE.relaxed });
  pip(ctx, 'hello', 380, 1000, 240, t);
  talk(ctx, t, S, { harry: [700, 380, 900, 320, 640, 50], tower: [880, 80, 1300, 420, 640, 48], pip: [120, 420, 380, 800, 520, 48] }, {
    e1: [Math.min(1300, lerp(-300, 2300, prog(L.e1.a, S.a, S.b + 1)) - 100), 400, lerp(-300, 2300, prog(L.e1.a + 1, S.a, S.b + 1)), 360, 600, 50],
  });
}

// ---------------------------------------------------------------- end card: the swoosh badge logo
function endCard(ctx, t, IMG) {
  const S = SC.end, a = S.a;
  const p = E.inOutCubic(prog(t, a - 0.9, a));
  if (p <= 0) return;
  ctx.save(); const sl = 300, x = p * (W + sl); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, 0); ctx.lineTo(x - sl, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
  M.fill(ctx, C.paper);
  const cols = ['#E8202A', '#FFFFFF', '#1D4FB7'];
  const pth = (q, k) => [lerp(-200, W + 300, q), 120 + k * 26 - Math.sin(q * Math.PI) * 70];
  cols.forEach((col, k) => {
    const q = E.inOutSine(prog(t, a - 0.3 + k * 0.08, a + 1.95 + k * 0.08));
    if (q <= 0) return;
    ctx.beginPath(); for (let s = 0; s <= 60; s++) { const pp = pth((s / 60) * q, k); s ? ctx.lineTo(pp[0], pp[1]) : ctx.moveTo(pp[0], pp[1]); }
    ctx.lineCap = 'round'; if (k === 1) { ctx.strokeStyle = '#C9D6E0'; ctx.lineWidth = 24; ctx.stroke(); } ctx.strokeStyle = col; ctx.lineWidth = 18; ctx.stroke();
    if (q < 1) { const pp = pth(q, k), p2 = pth(Math.min(1, q + 0.01), k); K.redJet(ctx, pp[0] + 60, pp[1], 0.5, Math.atan2(p2[1] - pp[1], p2[0] - pp[0])); }
  });
  const lk = pk(t, a + 1.2, SPRING.bouncy);
  if (lk > 0 && IMG.logo) { const lw = 560, lh = lw * IMG.logo.height / IMG.logo.width; ctx.save(); ctx.translate(430, 380); ctx.scale(lk, lk); ctx.rotate((1 - lk) * 0.2); ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh); ctx.restore(); }
  const tk = pk(t, a + 1.8, SPRING.gentle);
  if (tk > 0) { M.text(ctx, 'Episode 7', 150 - (1 - tk) * 80, 680, F(50, 800), C.greyDark); M.text(ctx, 'Harry the Harrier', 150 - (1 - tk) * 80, 770, F(92, 800), C.ink); }
  const sk = pk(t, a + 2.3, SPRING.gentle);
  if (sk > 0) { let xx = 154 - (1 - sk) * 80; [['Plan. ', '#23908C'], ['Inform. ', '#1F4E8C'], ['Prepare.', '#D74949']].forEach(([w, c]) => { ctx.font = F(52, 800); M.text(ctx, w, xx, 850, F(52, 800), c); xx += ctx.measureText(w).width; }); }
  const ak = pk(t, a + 2.8, SPRING.bouncy);
  if (ak > 0) M.text(ctx, 'ukairshowguide.co.uk', 154 - (1 - ak) * 80, 940, F(56, 800), '#13293C');
  const ck = pk(t, a + 0.8, SPRING.gentle);
  harry(ctx, 1450, 1010 - HARRY_FEET * 0.9 + (1 - ck) * 500, 0.9, { t, gear: 1, flip: true, mood: 'happy-eyes' });
  K.kid(ctx, 1080, 1010 + (1 - ck) * 500, 1.3, { mood: 'happy', blinkU: t / P, armR: [2.5 + Math.sin(t * 5) * 0.25, -0.25], armL: K.POSE.relaxed });
  const pq = pk(t, a + 1.8, SPRING.bouncy);
  if (pq > 0) pip(ctx, 'hello', 880, 1000, 230 * Math.min(1, pq), t);
  ctx.restore();
}

// ---------------------------------------------------------------- sound cues for music.py (seconds)
const CUES = [];
const cue = (t, kind, o = {}) => CUES.push([t, kind, o]);
// music sections
[['title', 'bright'], ['recap', 'memory'], ['arrive', 'bright'], ['radio', 'bright'], ['hover', 'tense'], ['meet', 'spain'], ['how', 'light'],
 ['warbirds', 'warm'], ['spot', 'light'], ['history', 'warm'], ['memorial', 'still'], ['wind', 'light'], ['brief', 'light'], ['display', 'bright'], ['bye', 'spain'], ['end', 'end']]
  .forEach(([id, mood]) => cue(SC[id].a, 'section', { mood }));
for (const S of ORDER) for (const L of Object.values(S.L)) if (L.who !== 'cap') cue(L.a, L.who === 'tower' ? 'radio' : 'tok', { gain: 0.12 });
{
  const H0 = SC.hover.a; cue(H0 + 0.5, 'jet', { len: 26.5, hover: [H0 + 7.0, H0 + 26.0], wind: [H0 + 26.2, H0 + 29.8] });
  cue(SC.hover.L.h2.a - 0.4, 'cheer', { len: 4 });
  const D0 = SC.display.a; cue(D0 + 0.5, 'merlin', { len: 11.5, pass: D0 + 6 });
  cue(D0 + 9.5, 'cheer', { len: 3 });
  cue(D0 + 12.5, 'jet', { len: 21, hover: [D0 + 15.5, D0 + 28.5], away: D0 + 28.5 });
  cue(D0 + 34, 'cheer', { len: 5 });
  cue(SC.bye.a, 'jet', { len: 9, far: true });
  const F0 = SC.memorial.L.f2.a + 0.5; cue(F0, 'merlin', { len: 14, pass: F0 + 7, far: true });
  cue(SC.end.a + 1.2, 'bell', { gain: 0.12 });
  cue(SC.wind.a + 0.5, 'wind', { len: SC.wind.b - SC.wind.a - 0.5 });
  cue(SC.title.a + 3.6, 'pop', { gain: 0.14 });
}

// ---------------------------------------------------------------- the cut
const SCENES = [sTitle, sRecap, sArrive, sRadio, sHover, sMeet, sHow, sWarbirds, sSpot, sHistory, sMemorial, sWind, sBrief, sDisplay, sBye];
const PUSH = 0.7;   // a sideways push between scenes, like the other Pip films
window.SCRIPT_TIMES = ORDER.map((S) => ({ id: S.id, a: +S.a.toFixed(2), b: +S.b.toFixed(2), lines: Object.fromEntries(Object.entries(S.L).map(([k, L]) => [k, [+L.a.toFixed(2), +L.b.toFixed(2), L.text]])) }));
M.film({
  fonts: K.FONTS,
  images: Object.assign({ logo: 'assets/logo.png' },
    Object.fromEntries(['rest', 'blink', 'point', 'tip', 'map', 'sun', 'loud', 'cheer', 'fly', 'photo', 'marshal', 'hello0', 'hello1', 'hello2', 'hello3', 'hello4', 'hello5'].map((k) => ['pip_' + k, 'assets/pip/' + k + '.png']))),
  hits: CUES,
  samples: 2,
  draw(ctx, u, _t, IMG) {
    IMGS = IMG;
    const t = u * P;
    let i = 0; while (i + 1 < SCENES.length && t >= ORDER[i + 1].a - PUSH) i++;
    const a = ORDER[i].a, fn = SCENES[i];
    if (i > 0 && t < a) {
      const p = E.inOutCubic(prog(t, a - PUSH, a));
      ctx.save(); ctx.translate(-p * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); SCENES[i - 1](ctx, t); ctx.restore();
      ctx.save(); ctx.translate((1 - p) * W, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); fn(ctx, t); ctx.restore();
    } else if (fn) fn(ctx, t);
    endCard(ctx, t, IMG);
  },
});
export { DURATION };
