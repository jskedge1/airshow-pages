// London Euston to the RAF Cosford Air Show (Sunday): Avanti West Coast to Birmingham New Street, change,
// West Midlands Railway to Cosford, then about 300 metres on foot. Facts: train-routes-src/cosford-cfg.json and
// cosford-data.json (e.g. the 11:52 from Euston, Birmingham 13:26, change 30 min, 13:56, Cosford 14:32).
const R = {
  title: ['LONDON', 'TO COSFORD'], accentFrom: 1,
  sub: 'The RAF Cosford Air Show by train, changing at Birmingham.',
  summary: 'About 2 hours 40, with one change.',
  chips: [['Train', 'avanti'], ['Train', 'wmr'], ['Walk', 'walk']],
  map: {
    fit: [[-0.13, 51.53], [-1.9, 52.48], [-2.3, 52.64]], minSpan: 1.6,
    cities: [[-0.12, 51.51], [-1.9, 52.48]],
    legs: [
      { pts: [[-0.13, 51.53], [-0.76, 52.03], [-1.25, 52.38], [-1.51, 52.4], [-1.9, 52.48]], op: 'avanti', a: 2, b: 4.6 },
      { pts: [[-1.9, 52.48], [-2.12, 52.59], [-2.3, 52.64]], op: 'wmr', a: 5, b: 7.6 },
      { pts: [[-2.3, 52.64], [-2.31, 52.635]], op: 'walk', a: 7.8, b: 8.4, dash: true },
    ],
    places: [
      { name: 'London Euston', at: [-0.13, 51.53], b: 0.4, side: 'left', dy: 44 },
      { name: 'Birmingham', at: [-1.9, 52.48], b: 4.4, side: 'right' },
      { name: 'Cosford', at: [-2.3, 52.64], b: 7.4, side: 'left', dy: -46 },
    ],
    show: [-2.31, 52.63], showAt: 9, jetSide: 1,
  },
  ticket: { from: 'LONDON EUSTON', to: 'COSFORD', route: 'CHANGE: BIRMINGHAM NEW STREET' },
  tips: [
    ['Plan around the Cosford train', 'Only one train an hour stops at Cosford each way on a Sunday.'],
    ['Check for Sunday works', 'Engineering works around Birmingham and Wolverhampton are common.'],
    ['No step free access at Cosford', 'The platforms have steps, so plan ahead if you need help.'],
  ],
  end: { line: 'Enjoy the RAF Cosford Air Show!', url: 'ukairshowguide.co.uk/train-to-cosford' },
  scenes: [
    { type: 'map', a: 0, b: 16 },
    { type: 'before', a: 16, b: 32, push: 'left' },
    { type: 'leg', a: 32, b: 62, push: 'left', tag: 'LEG 1', title: 'London Euston to Birmingham New Street', leg: {
      arrive: [32, 35], board: [35.2, 37.4], dep: 38.2, arr: 58.5, op: 'avanti', from: 'London Euston', to: 'Birmingham New Street', plane: 0.82,
      zones: [[0, 'city'], [0.14, 'country'], [0.86, 'city']],
      stations: ['London Euston', 'Watford Junction', 'Milton Keynes', 'Rugby', 'Coventry', 'Birmingham Intl', 'Birmingham New Street'],
      chips: ['Avanti West Coast', 'About 1 hr 35 min', 'Then change trains'], chipAt: 39.5 } },
    { type: 'change', a: 62, b: 96, push: 'up', op: 'wmr', tag: 'THE CHANGE', title: 'At Birmingham New Street', steps: [
      { at: 62, kind: 'signs', sign: 'Departures', len: 8, title: 'Off at Birmingham New Street', body: 'Head up to the concourse and find the departure boards.' },
      { at: 72, kind: 'board', dest: 'Shrewsbury', right: 'Hourly', calling: 'Calling at Galton Bridge, Wolverhampton, Codsall, Cosford...', title: 'Find the Shrewsbury train', body: 'West Midlands Railway, calling at Wolverhampton, then Cosford.' },
      { at: 84, kind: 'clock', labels: ['ONE TRAIN AN HOUR', 'ALLOW FOR THE WAIT'], title: 'Plan around the Cosford train', body: 'Miss it by a minute and it can be nearly an hour.' },
    ] },
    { type: 'leg', a: 96, b: 124, push: 'down', tag: 'LEG 2', title: 'Birmingham New Street to Cosford', leg: {
      dep: 97.5, arr: 121, op: 'wmr', from: 'Birmingham New Street', to: 'Cosford',
      zones: [[0, 'city'], [0.4, 'country']],
      stations: ['Birmingham New Street', 'Galton Bridge', 'Wolverhampton', 'Bilbrook', 'Codsall', 'Albrighton', 'Cosford'],
      chips: ['West Midlands Railway', 'About 35 min', 'One train an hour'], chipAt: 99.5, note: [114, 'Check the summer 2027 times before you go'] } },
    { type: 'walk', a: 124, b: 148, push: 'left', tag: 'LAST LEG', title: 'Walk to the show: about 300 metres', walk: [125, 139],
      steps: [[126, 'Out at Cosford station'], [130, 'About 300 metres to the airfield'], [134, 'Staff and signs on show day'], [138, 'The RAF Cosford Air Show!']],
      map: { blocks: null, airfield: [0.05, 0.38, 0.9, 0.58], green: [0, 0, 1, 0.3],
        labels: [{ t: 'RAF Cosford', at: [0.5, 0.92], kind: 'box' }, { t: 'Show entrance', at: [0.36, 0.33] }, { t: 'Railway', at: [0.82, 0.13] }],
        station: { at: [0.22, 0.12], label: 'Cosford station', op: 'wmr' },
        path: [[0.22, 0.18], [0.24, 0.3], [0.36, 0.4], [0.5, 0.52]],
        crowd: [0.3, 0.55, 0.4], jets: [0.75, 1.1, -0.2] } },
    { type: 'home', a: 148, b: 166, push: 'left', op: 'wmr', text: 'Only one train an hour each way, and the station gets very busy after the flying. Leave during a display you are less bothered about, or stay for the stalls and some food.' },
    { type: 'end', a: 166, b: 999, push: 'up' },
  ],
};
