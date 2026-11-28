// London Kings Cross to IWM Duxford: Great Northern to Cambridge, then the free Air Show shuttle from Station Place,
// stand 5 (about 30 minutes, no need to book). Facts: train-routes-src/duxford-cfg.json and duxford-data.json.
const R = {
  title: ['LONDON', 'TO DUXFORD'], accentFrom: 1,
  sub: 'IWM Duxford by train to Cambridge, then the free shuttle.',
  summary: 'About 50 minutes on the train, then 30 on the shuttle.',
  chips: [['Train', 'gn'], ['Shuttle', 'shuttle']],
  map: {
    fit: [[-0.12, 51.53], [0.137, 52.19], [0.13, 52.09]], minSpan: 1.2,
    cities: [[-0.12, 51.51], [0.12, 52.2]],
    legs: [
      { pts: [[-0.12, 51.53], [-0.19, 51.9], [-0.02, 52.05], [0.137, 52.19]], op: 'gn', a: 2, b: 5 },
      { pts: [[0.137, 52.19], [0.16, 52.14], [0.13, 52.09]], op: 'shuttle', a: 5.6, b: 7.6 },
    ],
    places: [
      { name: 'London Kings Cross', at: [-0.12, 51.53], b: 0.4, side: 'right', dy: 30 },
      { name: 'Cambridge', at: [0.137, 52.19], b: 4.6, side: 'right', dy: -50 },
      { name: 'IWM Duxford', at: [0.13, 52.09], b: 7.4, side: 'left', dy: 40 },
    ],
    show: [0.12, 52.08], showAt: 8.6, jetSide: -1,
  },
  ticket: { from: 'LONDON KINGS CROSS', to: 'CAMBRIDGE', route: 'THEN THE FREE SHUTTLE' },
  tips: [
    ['Any train to Cambridge', 'Kings Cross is quickest. Liverpool Street takes 73 to 85 minutes.'],
    ['The shuttle is free', 'It runs from Cambridge station on show days, with no need to book.'],
    ['Got a Railcard?', 'It takes a third off most fares. Under 5s travel free.'],
  ],
  end: { line: 'Enjoy the Duxford Air Show!', url: 'ukairshowguide.co.uk/duxfordairshows' },
  scenes: [
    { type: 'map', a: 0, b: 16 },
    { type: 'before', a: 16, b: 32, push: 'left' },
    { type: 'leg', a: 32, b: 72, push: 'left', tag: 'THE TRAIN', title: 'London Kings Cross to Cambridge', leg: {
      arrive: [32, 35], board: [35.2, 37.4], dep: 38.2, arr: 68.5, op: 'gn', from: 'London Kings Cross', to: 'Cambridge',
      zones: [[0, 'city'], [0.12, 'country'], [0.86, 'city']],
      stations: ['London Kings Cross', 'Cambridge South', 'Cambridge'],
      chips: ['Great Northern', 'About 50 min', 'Fast trains twice an hour'], chipAt: 39.5, note: [56, 'Thameslink too: about 70 min'] } },
    { type: 'change', a: 72, b: 114, push: 'up', op: 'shuttle', tag: 'THE SHUTTLE', title: 'Cambridge station to IWM Duxford', steps: [
      { at: 72, kind: 'signs', sign: 'Station Place', len: 9, title: 'Out to Station Place', body: 'Head out of the station to the bus interchange.' },
      { at: 84, kind: 'bus', stand: 'STAND 5', bus: 'AIR SHOW SHUTTLE', tag: 'FREE', leave: 9, title: 'Stand 5 for the free shuttle', body: 'There is no need to book. Just turn up and get on.' },
      { at: 98, kind: 'clock', labels: ['ABOUT 30 MINUTES', 'FREE', 'NO NEED TO BOOK'], title: 'About 30 minutes to Duxford', body: 'It drops you at the museum, ready for the show.' },
    ] },
    { type: 'walk', a: 114, b: 140, push: 'left', tag: 'AT DUXFORD', title: 'Off the shuttle and on to the airfield', walk: [115, 130],
      steps: [[116, 'Off the shuttle at IWM Duxford'], [120, 'Through to the airfield'], [124, 'Find your spot by the crowd line'], [128, 'Enjoy the flying!']],
      map: { blocks: null, airfield: [0.05, 0.42, 0.9, 0.52], green: [0, 0, 1, 0.36],
        labels: [{ t: 'IWM Duxford', at: [0.5, 0.92], kind: 'box' }, { t: 'Hangars', at: [0.62, 0.3] }],
        station: { at: [0.2, 0.12], label: 'Shuttle stop', op: 'shuttle' },
        path: [[0.2, 0.18], [0.24, 0.3], [0.38, 0.4], [0.5, 0.5]],
        crowd: [0.3, 0.53, 0.4], jets: [0.74, 1.1, -0.2] } },
    { type: 'home', a: 140, b: 166, push: 'left', op: 'gn', text: 'Shuttle queues back to Cambridge are longest straight after the flying. Leave before the last display, or look round the hangars and catch a later shuttle. The last one back left at 18:30 in 2026.' },
    { type: 'end', a: 166, b: 999, push: 'up' },
  ],
};
