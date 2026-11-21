// UK Airshow Guide: the 2027 season trailer (about 90 seconds, Hollywood trailer style, 21 Nov 2026), built by cine.js.
// What it says: the season is full of very different days out (four of Jack's 2026 shows), there are 46 shows and one
// summer, and the guide is the one place that helps you choose and plan them. Then what the guide gives you, and the close.
// Look: the RAF Cosford Hollywood trailer look (glass titles, no flash, no grain, cuts on the beat of The Battlefield,
// 140 bpm) plus bold black cards (slam: true) for the show names and the two short lines of the turn.
// Times are MUSIC beats at 140 bpm, written as M(beat); a bar is 4 beats (1.714 s). 196 beats = 84 s, then the end card.
// Footage: Jack's own Nikon Z6 clips only (no photos), listed slot by slot in clips-trailer-2027.json and built by
// make-clip-frames.py (tracking, sensor dust removal, white balance, shadow lift, denoise). Captions give the show and
// the year, never an aircraft name. Every fact is from the live pages: the calendar (46 shows confirmed, updated
// 5 Nov 2026), the home page headline ("Every UK airshow, one easy guide") and the four show guides.
const M = n => n * 104 / 140;
const SHOW = { cos: 'RAF Cosford Air Show 2026', eas: 'Eastbourne Airshow 2026', dux: 'IWM Duxford 2026', shu: 'Shuttleworth, Old Warden 2026' };
const NAME = { cos: 'RAF Cosford', eas: 'Eastbourne', dux: 'Duxford', shu: 'Shuttleworth' };
// a clip shot: v(name, beats long, show key, extra). n = frames in the folder (60 fps, make-clip-frames.py writes dur * 60 + 4)
const FR = { 1: 34, 2: 61, 4: 112, 8: 217, 12: 319 };
const v = (name, beats, show, o = {}) => Object.assign({ clip: `cine/${name}L`, clipP: `cine/${name}`, n: FR[beats], slot: `Footage<br>${NAME[show] || show}`,
  cap: beats >= 2 && SHOW[show] ? SHOW[show] : null, s: beats >= 8 ? [1.0, 1.07] : [1.03, 1.08] }, o);
const screen = (d, m, cap) => ({ src: `screens/${d}`, srcP: `screens/${m}`, pos: '50% 0%', screen: true, cap, dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true });
// the four show chapters: a black card with the name (4 beats), then four shots (4, 4, 2, 2 beats)
const chapter = (b, k) => [
  [M(b + 4), M(b + 8), v(`v-${k}1`, 4, k)], [M(b + 8), M(b + 12), v(`v-${k}2`, 4, k)],
  [M(b + 12), M(b + 14), v(`v-${k}3`, 2, k)], [M(b + 14), M(b + 16), v(`v-${k}4`, 2, k)],
];
const ORDER = ['cos', 'eas', 'dux', 'shu'];
window.CINE = window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Plan your 2027 air shows at', typeScale: true, smooth: true,
  ts: { mid: 62, small: 50 },
  socials: ['Instagram', 'Facebook', 'YouTube'],
  barsAt: 0,
  titleStyle: 'glass', flash: false, snapBpm: 140, grain: 0,
  shots: [
    // cold open: black, then two slow motion hero shots under "The sky comes alive"
    [M(0), M(8), { black: true, soft: true }],
    [M(8), M(16), v('v-open1', 8, 'cos')],
    [M(16), M(24), v('v-open2', 8, 'eas')],
    // colourful smoke inside the glass letters of the full black title card (as on the Cosford trailer)
    [M(24), M(32), v('v-smoke', 8, 'cos', { cap: null, soft: true, s: [1.0, 1.04] })],
    ...chapter(32, 'cos'), ...chapter(48, 'eas'), ...chapter(64, 'dux'), ...chapter(80, 'shu'),
    // the turn: two black cards (96 to 104), then the crowd looking up behind the answer
    [M(104), M(112), v('v-turn', 8, 'eas', { slot: 'Footage<br>The crowd looking up', soft: true })],
    // what the guide gives you: each slide sits on a matching picture (real site screens, and the crowd for where to watch)
    [M(112), M(120), screen('uk-airshow-calendar-300-400-d.jpg', 'uk-airshow-calendar-300-500-m.jpg', 'The 2027 calendar on ukairshowguide.co.uk')],
    [M(120), M(128), screen('duxford-0-0-d.jpg', 'duxford-0-350-m.jpg', 'The Duxford guide on ukairshowguide.co.uk')],
    [M(128), M(136), screen('public-transport-400-500-d.jpg', 'public-transport-0-350-m.jpg', 'The public transport guide')],
    [M(136), M(144), v('v-watch', 8, 'eas', { slot: 'Footage<br>The crowd line', dim: .55, s: [1.0, 1.06], soft: true })],
    [M(144), M(152), screen('photography-hub-0-100-d.jpg', 'photography-hub-0-300-m.jpg', 'The photography hub')],
    [M(152), M(160), screen('my-airshow-hub-0-0-d.jpg', 'my-airshow-hub-0-0-m.jpg', 'My Airshow Hub')],
    // the climax: four two beat cuts, then eight one beat cuts, one show after another
    ...[0, 1, 2, 3].map(i => [M(160 + 2 * i), M(162 + 2 * i), v(`v-m${i + 1}`, 2, ORDER[i], { cap: null })]),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => [M(168 + i), M(169 + i), v(`v-m${i + 5}`, 1, ORDER[i % 4], { cap: null })]),
    // one long slow motion shot under "Plan your 2027 season", then the smoke inside the letters of the last card
    [M(176), M(188), v('v-finale', 12, 'cos', { slot: 'Footage<br>The slow motion finale', s: [1.0, 1.1] })],
    [M(188), M(196), v('v-smoke', 8, 'cos', { cap: null, soft: true, s: [1.04, 1.0] })],
  ],
  titles: [
    [M(1.5), M(7.6), 'Every summer', { small: true }],
    [M(8.4), M(15.8), 'The sky'],
    [M(16.4), M(23.8), 'comes alive'],
    [M(24), M(32), 'The 2027 season|is coming', { black: 1 }],
    [M(32), M(36), 'RAF Cosford|Air base show · Shropshire', { slam: true }],
    [M(48), M(52), 'Eastbourne|Seafront displays · East Sussex', { slam: true }],
    [M(64), M(68), 'Duxford|Historic aviation · Cambridgeshire', { slam: true }],
    [M(80), M(84), 'Shuttleworth|Vintage aircraft · Bedfordshire', { slam: true }],
    [M(96), M(100), '46 shows|Confirmed for 2027 so far', { slam: true }],
    [M(100), M(104), 'One summer', { slam: true }],
    [M(104.3), M(111.8), 'Every UK airshow|One easy guide', { black: .8 }],
    [M(177), M(187.6), 'Plan your|2027 season', { black: .5 }],
    [M(188), M(196), 'Your summer|starts here', { black: 1 }],
  ],
  glass: [
    [M(112), M(120), [['big', 'The 2027'], ['big', '*calendar*'], ['small', 'Every UK show date, with a map']]],
    [M(120), M(128), [['big', 'A *guide*'], ['big', 'for every show'], ['small', 'Where to park and what is flying']]],
    [M(128), M(136), [['big', 'By ~train~'], ['big', '~bus~ or ~coach~'], ['small', 'Where to get off and the walk in']]],
    [M(136), M(144), [['big', '*Where*'], ['big', 'to watch'], ['small', 'And where the sun will be']]],
    [M(144), M(152), [['big', 'Camera'], ['big', '*settings*'], ['small', 'For jets and propeller aircraft']]],
    [M(152), M(160), [['big', 'My Airshow'], ['big', 'Hub is *free*'], ['small', 'Save your shows, ready on your phone']]],
  ],
  endAt: M(196),
};
