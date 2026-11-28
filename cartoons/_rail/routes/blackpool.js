// London Euston to the Blackpool Air Show: Avanti West Coast to Preston, change, Northern to Blackpool North,
// then about 15 minutes on foot down Talbot Road and along the promenade to the Tower.
// Facts: train-routes-src/blackpool-cfg.json and blackpool-data.json (07:30 Euston, Preston 09:39, 09:59, Blackpool North 10:24).
const R = {
  title: ['LONDON TO', 'BLACKPOOL'], accentFrom: 0, titleSize: 140,
  sub: 'The Blackpool Air Show by train, changing at Preston.',
  summary: 'About 3 hours, with one change at Preston.',
  chips: [['Train', 'avanti'], ['Train', 'northern'], ['Walk', 'walk']],
  map: {
    fit: [[-0.13, 51.53], [-2.71, 53.76], [-3.05, 53.82]], minSpan: 1.4,
    cities: [[-0.12, 51.51], [-2.24, 53.48], [-1.9, 52.48]],
    legs: [
      { pts: [[-0.13, 51.53], [-0.76, 52.03], [-1.25, 52.38], [-2.12, 52.8], [-2.43, 53.09], [-2.6, 53.39], [-2.63, 53.54], [-2.71, 53.76]], op: 'avanti', a: 2, b: 5 },
      { pts: [[-2.71, 53.76], [-2.9, 53.78], [-3.05, 53.82]], op: 'northern', a: 5.4, b: 7.4 },
      { pts: [[-3.05, 53.82], [-3.06, 53.815]], op: 'walk', a: 7.6, b: 8.2, dash: true },
    ],
    places: [
      { name: 'London Euston', at: [-0.13, 51.53], b: 0.4, side: 'left', dy: 44 },
      { name: 'Preston', at: [-2.71, 53.76], b: 4.8, side: 'right' },
      { name: 'Blackpool North', at: [-3.05, 53.82], b: 7.2, side: 'left', dy: -46 },
    ],
    show: [-3.08, 53.81], showAt: 9, jetSide: -1,
  },
  ticket: { from: 'LONDON EUSTON', to: 'BLACKPOOL NORTH', route: 'CHANGE: PRESTON' },
  tips: [
    ['Buy your ticket in advance', 'Trains into Blackpool get really busy on show days.'],
    ['Check for engineering work', 'It is common at weekends, so check before you travel.'],
    ['Got a Railcard?', 'It takes a third off most fares. Under 5s travel free.'],
  ],
  end: { line: 'Enjoy the Blackpool Air Show!', url: 'ukairshowguide.co.uk/train-to-blackpool' },
  scenes: [
    { type: 'map', a: 0, b: 16 },
    { type: 'before', a: 16, b: 32, push: 'left' },
    { type: 'leg', a: 32, b: 62, push: 'left', tag: 'LEG 1', title: 'London Euston to Preston', leg: {
      arrive: [32, 35], board: [35.2, 37.4], dep: 38.2, arr: 58.5, op: 'avanti', from: 'London Euston', to: 'Preston',
      zones: [[0, 'city'], [0.12, 'country'], [0.86, 'city']],
      stations: ['London Euston', 'Warrington Bank Quay', 'Wigan North Western', 'Preston'],
      chips: ['Avanti West Coast', 'About 2 hr 10 min', 'Then change trains'], chipAt: 39.5 } },
    { type: 'change', a: 62, b: 92, push: 'up', op: 'northern', tag: 'THE CHANGE', title: 'At Preston', steps: [
      { at: 62, kind: 'signs', sign: 'Departures', len: 8, title: 'Change at Preston', body: 'Off the Avanti train, then check the departure boards.' },
      { at: 71, kind: 'board', dest: 'Blackpool North', right: 'Northern', calling: 'Calling at Kirkham & Wesham, Poulton, Layton', title: 'Find the Blackpool North train', body: 'There are about four trains an hour from Preston.' },
      { at: 82, kind: 'clock', labels: ['ABOUT 20 MINUTES', 'ALLOW EXTRA TIME'], title: 'About 20 minutes to change', body: 'Trains are busy on show days, so allow extra time.' },
    ] },
    { type: 'leg', a: 92, b: 118, push: 'down', tag: 'LEG 2', title: 'Preston to Blackpool North', leg: {
      dep: 93.5, arr: 115, op: 'northern', from: 'Preston', to: 'Blackpool North',
      zones: [[0, 'city'], [0.15, 'country'], [0.88, 'city']],
      stations: ['Preston', 'Kirkham & Wesham', 'Poulton', 'Layton', 'Blackpool North'],
      chips: ['Northern', 'About 25 min', 'About four an hour'], chipAt: 95.5, note: [108, 'Check the summer 2027 times before you go'] } },
    { type: 'walk', a: 118, b: 144, push: 'left', tag: 'LAST LEG', title: 'Walk to the Tower: about 15 minutes', walk: [119, 136],
      steps: [[120, 'Out of Blackpool North'], [124, 'Down Talbot Road'], [128, 'To Talbot Square and North Pier'], [132, 'South along the promenade to the Tower']],
      map: { blocks: [0.36, 0, 1, 1], sea: 'left', seaAt: 0.22, piers: [[0.08, 0.3, 0.18, 0.035]],
        labels: [{ t: 'North Pier', at: [0.16, 0.27] }, { t: 'Talbot Road', at: [0.6, 0.3] }, { t: 'Blackpool Tower', at: [0.44, 0.84], kind: 'box' }, { t: 'Promenade', at: [0.3, 0.6] }],
        station: { at: [0.78, 0.1], label: 'Blackpool North', op: 'northern' },
        path: [[0.78, 0.16], [0.6, 0.24], [0.36, 0.34], [0.29, 0.36], [0.29, 0.7], [0.33, 0.78]],
        crowd: [0.24, 0.5, 0.05], jets: [0.6, 0.2, 0.2] } },
    { type: 'home', a: 144, b: 166, push: 'left', op: 'northern', text: 'The station fills quickly after the last display. Get something to eat in town and catch a later train, or leave before the final act if you have a connection.' },
    { type: 'end', a: 166, b: 999, push: 'up' },
  ],
};
