// Video version of the cinematic cut of the UK Airshow Guide advert (same words, timing and topic slides as content-advert-cine.js), built by cine.js.
// [startBeat, endBeat, ...] at 104 bpm. The aircraft shots are Jack's own Nikon Z6 4K clips from RAF Cosford 2026 and Eastbourne 2026
// (sources and in points in clips-advert.json; frames built by make-clip-frames.py into cine/v-*, not stored in git).
// Each glass slide sits on a matching shot: real site screens for the calendar, transport, photography hub and Hub,
// a show campsite for camping, the crowd on the beach for "where to watch". Captions name the aircraft and the show.
window.CINE = window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Plan your 2027 air shows at', typeScale: true, smooth: true,
  ts: { mid: 62, small: 50 },
  socials: ['Instagram', 'Facebook', 'YouTube'],
  barsAt: 0,
  // the RAF Cosford Hollywood trailer look (19 Nov 2026): glass titles cut out of black, no flash, cuts on the beats of The Battlefield (140 bpm)
  titleStyle: 'glass', flash: false, snapBpm: 140,
  grain: 0,
  shots: [
    [0, 5, { black: true, soft: true }],
    // colourful Red Arrows smoke behind the glass letters of the title card (as on the Cosford trailer)
    [27, 31, { clip: 'cine/v-redsmokeL', clipP: 'cine/v-redsmoke', n: 166, soft: true, s: [1.0, 1.04] }],
    [5, 11, { clip: 'cine/v-typhoonL', clipP: 'cine/v-typhoon', n: 217, cap: 'RAF Typhoon, RAF Cosford 2026', s: [1.0, 1.08] }],
    [11, 17, { clip: 'cine/v-chinookL', clipP: 'cine/v-chinook', n: 217, cap: 'RAF Chinook, RAF Cosford 2026', s: [1.0, 1.08] }],
    [17, 23, { clip: 'cine/v-b17L', clipP: 'cine/v-b17', n: 217, cap: 'B-17 Flying Fortress, RAF Cosford 2026', s: [1.0, 1.08] }],
    [23, 24, { clip: 'cine/v-f35L', clipP: 'cine/v-f35', n: 46, cap: 'F-35B Lightning, RAF Cosford 2026', s: [1.04, 1.08] }],
    [24, 25, { clip: 'cine/v-redloopL', clipP: 'cine/v-redloop', n: 46, cap: 'Red Arrows, RAF Cosford 2026', s: [1.04, 1.08] }],
    [25, 26, { clip: 'cine/v-dakotaL', clipP: 'cine/v-dakota', n: 46, cap: 'Douglas Dakota, Eastbourne 2026', s: [1.04, 1.08] }],
    [26, 27, { clip: 'cine/v-apacheL', clipP: 'cine/v-apache', n: 46, cap: 'AH-64E Apache, RAF Cosford 2026', s: [1.04, 1.08] }],
    // the glass section: the footage dims and the words land over it
    [31, 35.5, { clip: 'cine/v-redsL', clipP: 'cine/v-reds', n: 166, cap: 'Red Arrows, RAF Cosford 2026', dim: .5, s: [1.0, 1.06] }],
    [35.5, 40, { src: 'screens/uk-airshow-calendar-300-400-d.jpg', srcP: 'screens/uk-airshow-calendar-300-500-m.jpg', pos: '50% 0%', screen: true, cap: 'The 2027 calendar on ukairshowguide.co.uk', dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true }],
    [40, 44.5, { clip: 'cine/v-crowdL', clipP: 'cine/v-crowd', n: 166, cap: 'Watching the B-17 from the beach, Eastbourne 2026', dim: .55, s: [1.0, 1.06], soft: true }],
    [44.5, 49, { src: 'screens/public-transport-400-500-d.jpg', srcP: 'screens/public-transport-0-350-m.jpg', pos: '50% 0%', screen: true, cap: 'The public transport guide', dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true }],
    [49, 53.5, { src: 'photos/l-flyby.jpg', srcP: 'cine/flyby.jpg', cap: 'A show campsite', dim: .5, s: [1.0, 1.1], soft: true }],
    [53.5, 58, { src: 'screens/photography-hub-0-100-d.jpg', srcP: 'screens/photography-hub-0-300-m.jpg', pos: '50% 0%', screen: true, cap: 'The photography hub', dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true }],
    [58, 62.5, { src: 'screens/my-airshow-hub-0-0-d.jpg', srcP: 'screens/my-airshow-hub-0-0-m.jpg', pos: '50% 0%', screen: true, cap: 'My Airshow Hub', dim: .76, s: [1.0, 1.08], y: [0, -3], soft: true }],
    [62.5, 68.5, { clip: 'cine/v-spitfireL', clipP: 'cine/v-spitfire', n: 217, cap: 'Supermarine Spitfire, Eastbourne 2026', s: [1.02, 1.12] }],
  ],
  titles: [
    [0.8, 4.6, 'Every summer', { small: true }],
    [5.4, 10.8, 'The sky'],
    [11.3, 16.8, 'comes'],
    [17.3, 22.8, 'alive'],
    [27, 31, 'The 2027 season|is coming', { black: 1 }],
    [63.3, 68.5, 'Your summer|starts here', { black: .75 }],
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
