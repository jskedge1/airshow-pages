// Cinematic cut of the UK Airshow Guide advert (same design and facts as content-advert.js), built by cine.js.
// [startBeat, endBeat, ...] at 104 bpm. Shots are real 2026 photos (photos/f-*.jpg landscape, fp-*.jpg portrait),
// from Blackpool, Shuttleworth Military and the Midlands Air Festival (Mac's 2026 folders). Captions name the aircraft.
// No video clips from 2026 shows were on Drive yet, so the footage is still photos with slow camera moves.
window.CINE = window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Plan your 2027 air shows at', typeScale: true, smooth: true,
  ts: { mid: 62, small: 50 },
  socials: ['Instagram', 'Facebook', 'YouTube'],
  barsAt: 0,
  shots: [
    [0, 5, { black: true, soft: true }],
    [27, 31, { black: true, soft: true }],
    [5, 11, { img: 'typhoon', cap: 'RAF Typhoon, Blackpool Air Show 2026', s: [1.04, 1.22], x: [2, -2] }],
    [11, 17, { img: 'chinook', cap: 'RAF Chinook, Shuttleworth Military Air Show 2026', s: [1.02, 1.2], y: [1, -1] }],
    [17, 23, { img: 'bbmf', cap: 'BBMF Dakota and Hurricane, Blackpool Air Show 2026', capP: 'BBMF Dakota, Blackpool Air Show 2026', s: [1.0, 1.16], o: '45% 30%' }],
    [23, 24, { img: 'mig', cap: 'MiG-17, Midlands Air Festival 2026', s: [1.08, 1.16] }],
    [24, 25, { img: 'raven', cap: 'Team Raven, Blackpool Air Show 2026', s: [1.08, 1.16] }],
    [25, 26, { img: 'reddevils', cap: 'Red Devils parachute team, Blackpool Air Show 2026', s: [1.08, 1.16] }],
    [26, 27, { img: 'bronco', cap: 'OV-10 Bronco, Midlands Air Festival 2026', s: [1.08, 1.16] }],
    // the glass section: the footage dims and the words land over it
    [31, 35.5, { img: 'typhoon2', cap: 'RAF Typhoon, Blackpool Air Show 2026', dim: .5, s: [1.0, 1.1] }],
    [35.5, 40, { img: 'raven', cap: 'Team Raven, Blackpool Air Show 2026', dim: .55, s: [1.0, 1.1], soft: true }],
    [40, 44.5, { img: 'invader', cap: 'Douglas A-26 Invader, Shuttleworth Military Air Show 2026', dim: .55, s: [1.0, 1.1], soft: true }],
    [49, 53.5, { img: 'bronco', cap: 'OV-10 Bronco, Midlands Air Festival 2026', dim: .6, s: [1.0, 1.1], soft: true }],
    [53.5, 58, { img: 'mig', cap: 'MiG-17, Midlands Air Festival 2026', dim: .55, s: [1.0, 1.1], soft: true }],
    [58, 62.5, { img: 'hawk', cap: 'BAE Hawk T1, Blackpool Air Show 2026', dim: .55, s: [1.0, 1.1], soft: true }],
    [62.5, 68.5, { img: 'typhoon2', imgP: 'typhoon', cap: 'RAF Typhoon, Blackpool Air Show 2026', s: [1.06, 1.24], x: [-2, 2] }],
  ],
  titles: [
    [0.8, 4.6, 'Every summer', { small: true }],
    [5.4, 10.8, 'The sky'],
    [11.3, 16.8, 'comes'],
    [17.3, 22.8, 'alive'],
    [27.3, 29.4, 'The 2027 season', { small: true }],
    [29, 31, 'is coming'],
    [62.8, 65.5, 'Your summer'],
    [65.5, 68.5, 'starts here'],
  ],
  glass: [
    [31, 35.5, [['huge', '[Everything|f:reddevils]', { size: 260, enter: 'slam' }], ['big', 'you need', { enter: 'slam', delay: B / 2 }], ['mid', '*in one place*']], { stagger: B }],
    [35.5, 40, [['big', 'The 2027'], ['big', '*calendar*'], ['small', 'Every UK show date, with a map']]],
    [40, 44.5, [['big', 'A *guide*'], ['big', 'for every'], ['big', 'show'], ['small', 'Parking, the line up, where to watch']]],
    [44.5, 49, [['big', 'By ~train~'], ['big', '~bus~ or ~coach~'], ['small', 'Where to get off and the walk in']]],
    [49, 53.5, [['big', '*Camping*'], ['big', 'on site'], ['small', 'Pick a pitch, pack the car']]],
    [53.5, 58, [['big', 'Camera'], ['big', '*settings*'], ['small', 'For jets, propellers and where to stand']]],
    [58, 62.5, [['big', 'My Airshow'], ['big', 'Hub is *free*'], ['small', 'Save your shows, ready on your phone']]],
  ],
  endAt: 68.5,
};
