// Starter for an information video in the cinematic layout (the trailer style of the advert's cinematic cut).
// Copy to content-<topic>.js, copy index-cine-template.html to index-<topic>-cine.html and point it at the new file.
// Built by cine.js on the glass effect engine: letterbox bars, full screen graded shots with slow push ins,
// huge trailer titles with impact flashes, then the glass effect words over dimmed shots, and the standard end card.
// Everything is timed in beats at 104 bpm (B seconds a beat) so score-cine.py lines up: [startBeat, endBeat, ...].
// House rules as for every glass effect film: facts only from the matching guide page, plain English, no dashes,
// 2026 details say so on screen, and every shot must match the words over it (see README, "The cinematic layout").
window.CINE = window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read my full guide at', typeScale: true, smooth: true,
  ts: { mid: 62, small: 50 },
  socials: ['Instagram', 'Facebook', 'YouTube'],
  barsAt: 0,
  // shots: full screen backgrounds.
  //   img: 'jtyphoon'   -> photos/f-jtyphoon.jpg (landscape) and photos/fp-jtyphoon.jpg (portrait)
  //   src / srcP        -> any image path, e.g. a real site screen 'screens/uk-airshow-calendar-300-400-d.jpg' (add screen: true and pos: '50% 0%')
  //   cap               -> caption: name the aircraft and the show ('RAF Typhoon, RIAT 2025'); for screens, name the page
  //   s / x / y         -> push in (scale from, to) and pan (% of the frame); dim: darken under glass words (.5 to .76)
  //   soft: true        -> no impact flash on the cut (use inside the glass section); black: true -> a black frame
  shots: [
    [0, 5, { black: true, soft: true }],                                                       // cold open
    [5, 11, { img: 'jtyphoon', cap: 'RAF Typhoon display, RIAT 2025', s: [1.04, 1.22], x: [2, -2] }],
    [11, 17, { img: 'jlancaster', cap: 'BBMF Lancaster, RIAT 2025', s: [1.0, 1.16] }],
    [17, 19, { black: true, soft: true }],
    // Step 1: a title shot, then one dimmed shot per point that matches the words
    [19, 23, { img: 'jchinook', cap: 'RAF Chinook, RIAT 2025', s: [1.02, 1.16] }],
    [23, 27.5, { img: 'japache', cap: 'AH-64E Apache, RIAT 2025', dim: .55, s: [1.0, 1.1], soft: true }],
    [27.5, 32, { src: 'screens/uk-airshow-calendar-300-400-d.jpg', srcP: 'screens/uk-airshow-calendar-300-500-m.jpg', pos: '50% 0%', screen: true, cap: 'The 2027 calendar on ukairshowguide.co.uk', dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true }],
    // closing shot under the last titles
    [32, 38, { img: 'jredarrows', cap: 'Red Arrows Hawk T1, RIAT 2025', s: [1.06, 1.24], x: [-2, 2] }],
  ],
  // titles: huge trailer words (one or two words each), or small: true for a quiet line ("Step 1", a lead in)
  titles: [
    [0.8, 4.6, 'Topic in a few words', { small: true }],
    [5.4, 10.8, 'Big'],
    [11.3, 16.8, 'idea'],
    [17.2, 19, 'Step 1', { small: true }],
    [19.3, 23, 'Step title'],
    [32.3, 35, 'Closing'],
    [35, 38, 'line'],
  ],
  // glass: the glass effect words over the dimmed shots, [startBeat, endBeat, lines, options]
  //   'huge' / 'big' large white, 'mid' mint, 'small' grey. *word* mint bar, _word_ red, ~word~ purple (travel),
  //   [WORD|f:jtyphoon] fills a word with a full size shot.
  glass: [
    [23, 27.5, [['big', 'First'], ['big', '*point*'], ['small', 'A short supporting line']]],
    [27.5, 32, [['big', 'Second'], ['big', '*point*'], ['small', 'Shot and words must match']]],
  ],
  endAt: 38,   // the end card starts here (beats)
};
