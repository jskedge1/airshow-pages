// Cinematic cut of the UK Airshow Guide advert (same design and facts as content-advert.js), built by cine.js.
// [startBeat, endBeat, ...] at 104 bpm. Shots are Jack's own RIAT 2025 photos (photos/f-j*.jpg landscape, fp-j*.jpg portrait)
// with slow camera moves. Captions name the aircraft. Each glass slide sits on a matching shot: real site screens for the
// calendar, transport and Hub, a show campsite for camping, the photography hub for camera settings. Swap in video clips when the Z6 footage is available.
window.CINE = window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Plan your 2027 air shows at', typeScale: true, smooth: true,
  ts: { mid: 62, small: 50 },
  socials: ['Instagram', 'Facebook', 'YouTube'],
  barsAt: 0,
  shots: [
    [0, 5, { black: true, soft: true }],
    [27, 31, { black: true, soft: true }],
    [5, 11, { img: 'jtyphoon', cap: 'RAF Typhoon display, RIAT 2025', s: [1.04, 1.22], x: [2, -2] }],
    [11, 17, { img: 'jchinook', cap: 'RAF Chinook, RIAT 2025', s: [1.02, 1.2], y: [1, -1] }],
    [17, 23, { img: 'jlancaster', cap: 'BBMF Lancaster, RIAT 2025', s: [1.0, 1.16] }],
    [23, 24, { img: 'jf16', cap: 'Danish F-16, RIAT 2025', s: [1.08, 1.16] }],
    [24, 25, { img: 'jredarrows', cap: 'Red Arrows Hawk T1, RIAT 2025', s: [1.08, 1.16] }],
    [25, 26, { img: 'jfrecce', cap: 'Frecce Tricolori MB-339, RIAT 2025', s: [1.08, 1.16] }],
    [26, 27, { img: 'jhunter', cap: 'Hawker Hunter, RIAT 2025', s: [1.08, 1.16] }],
    // the glass section: the footage dims and the words land over it
    [31, 35.5, { img: 'jtyphoon2', cap: 'RAF Typhoon, RIAT 2025', dim: .5, s: [1.0, 1.1] }],
    [35.5, 40, { src: 'screens/uk-airshow-calendar-300-400-d.jpg', srcP: 'screens/uk-airshow-calendar-300-500-m.jpg', pos: '50% 0%', screen: true, cap: 'The 2027 calendar on ukairshowguide.co.uk', dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true }],
    [40, 44.5, { img: 'japache', cap: 'AH-64E Apache, RIAT 2025', dim: .55, s: [1.0, 1.1], soft: true }],
    [44.5, 49, { src: 'screens/public-transport-400-500-d.jpg', srcP: 'screens/public-transport-0-350-m.jpg', pos: '50% 0%', screen: true, cap: 'The public transport guide', dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true }],
    [49, 53.5, { src: 'photos/l-flyby.jpg', srcP: 'cine/flyby.jpg', cap: 'A show campsite', dim: .5, s: [1.0, 1.1], soft: true }],
    [53.5, 58, { src: 'screens/photography-hub-0-100-d.jpg', srcP: 'screens/photography-hub-0-300-m.jpg', pos: '50% 0%', screen: true, cap: 'The photography hub', dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true }],
    [58, 62.5, { src: 'screens/my-airshow-hub-0-0-d.jpg', srcP: 'screens/my-airshow-hub-0-0-m.jpg', pos: '50% 0%', screen: true, cap: 'My Airshow Hub', dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true }],
    [62.5, 68.5, { img: 'jlancaster', cap: 'BBMF Lancaster, RIAT 2025', s: [1.06, 1.24], x: [-2, 2] }],
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
    [31, 35.5, [['huge', '[Everything|f:jredarrows]', { size: 260, enter: 'slam' }], ['big', 'you need', { enter: 'slam', delay: B / 2 }], ['mid', '*in one place*']], { stagger: B }],
    [35.5, 40, [['big', 'The 2027'], ['big', '*calendar*'], ['small', 'Every UK show date, with a map']]],
    [40, 44.5, [['big', 'A *guide*'], ['big', 'for every'], ['big', 'show'], ['small', 'Parking, the line up, where to watch']]],
    [44.5, 49, [['big', 'By ~train~'], ['big', '~bus~ or ~coach~'], ['small', 'Where to get off and the walk in']]],
    [49, 53.5, [['big', '*Camping*'], ['big', 'on site'], ['small', 'Pick a pitch, pack the car']]],
    [53.5, 58, [['big', 'Camera'], ['big', '*settings*'], ['small', 'For jets, propellers and where to stand']]],
    [58, 62.5, [['big', 'My Airshow'], ['big', 'Hub is *free*'], ['small', 'Save your shows, ready on your phone']]],
  ],
  endAt: 68.5,
};
