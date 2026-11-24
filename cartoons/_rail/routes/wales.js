// London Paddington to the Wales National Airshow, Swansea: Great Western Railway direct (about 2 hours 45),
// then 20 to 25 minutes on foot through the city centre to the seafront by the Civic Centre.
// Facts: train-routes-src/wales-cfg.json and wales-data.json (07:48 Paddington, Swansea 10:30).
const R = {
  title: ['LONDON', 'TO SWANSEA'], accentFrom: 1,
  sub: 'The Wales National Airshow by train, direct from Paddington.',
  summary: 'About 2 hours 45 on the train, then a 20 minute walk.',
  chips: [['Train', 'gwr'], ['Walk', 'walk']],
  map: {
    fit: [[-0.18, 51.52], [-3.94, 51.63]], minSpan: 1.3,
    cities: [[-0.12, 51.51], [-2.59, 51.45], [-3.18, 51.48]],
    legs: [
      { pts: [[-0.18, 51.52], [-0.97, 51.46], [-1.79, 51.57], [-2.54, 51.51], [-3.0, 51.59], [-3.18, 51.48], [-3.58, 51.51], [-3.78, 51.59], [-3.94, 51.63]], op: 'gwr', a: 2, b: 6.6 },
      { pts: [[-3.94, 51.63], [-3.96, 51.61]], op: 'walk', a: 7, b: 7.8, dash: true },
    ],
    places: [
      { name: 'London Paddington', at: [-0.18, 51.52], b: 0.4, side: 'left', dy: 50 },
      { name: 'Cardiff', at: [-3.18, 51.48], b: 5.4, side: 'right', dy: 50 },
      { name: 'Swansea', at: [-3.94, 51.63], b: 6.8, side: 'right', dy: -46 },
    ],
    show: [-3.97, 51.6], showAt: 8.4, jetSide: 1,
  },
  ticket: { from: 'LONDON PADDINGTON', to: 'SWANSEA', route: 'DIRECT: NO CHANGE' },
  tips: [
    ['Check the times for your day', 'Look up your trains for the show weekend before you set off.'],
    ['Staying for the evening?', 'If the Afterburn evening show returns, check the last train first.'],
    ['Got a Railcard?', 'It takes a third off most fares. Under 5s travel free.'],
  ],
  end: { line: 'Enjoy the Wales National Airshow!', url: 'ukairshowguide.co.uk/train-to-swansea' },
  scenes: [
    { type: 'map', a: 0, b: 16 },
    { type: 'before', a: 16, b: 32, push: 'left' },
    { type: 'change', a: 32, b: 56, push: 'left', op: 'gwr', tag: 'THE START', title: 'At London Paddington', steps: [
      { at: 32, kind: 'board', dest: 'Swansea', right: 'Direct', calling: 'Calling at Reading, Swindon, Bristol Parkway, Newport, Cardiff...', title: 'Start at London Paddington', body: 'There is a direct train to Swansea most hours.' },
      { at: 44, kind: 'clock', labels: ['NO CHANGE', 'ABOUT 2 HR 45 MIN'], title: 'No change on the way', body: 'Sit back: it is about 2 hours 45 minutes to Swansea.' },
    ] },
    { type: 'leg', a: 56, b: 116, push: 'up', tag: 'THE TRAIN', title: 'London Paddington to Swansea', leg: {
      arrive: [56, 59], board: [59.2, 61.4], dep: 62.2, arr: 112.5, op: 'gwr', from: 'London Paddington', to: 'Swansea',
      zones: [[0, 'city'], [0.08, 'country'], [0.4, 'river'], [0.46, 'country'], [0.54, 'city'], [0.6, 'country'], [0.76, 'sea'], [0.86, 'country'], [0.95, 'city']],
      stations: ['London Paddington', 'Reading', 'Swindon', 'Bristol Parkway', 'Newport', 'Cardiff', 'Bridgend', 'Port Talbot', 'Neath', 'Swansea'],
      chips: ['Great Western Railway', 'Direct, no change', 'About 2 hr 45 min'], chipAt: 63.5, note: [96, 'Check the summer 2027 times before you go'] } },
    { type: 'walk', a: 116, b: 142, push: 'left', tag: 'LAST LEG', title: 'Walk to the seafront: 20 to 25 minutes', walk: [117, 134],
      steps: [[118, 'Out of Swansea station'], [122, 'Down through the city centre'], [126, 'Oystermouth Road is closed on show days'], [130, 'The seafront by the Civic Centre']],
      map: { blocks: [0, 0, 1, 0.6], green: [0, 0.6, 1, 0.08], sea: 'bottom', seaAt: 0.8,
        labels: [{ t: 'City centre', at: [0.56, 0.4] }, { t: 'Oystermouth Road', at: [0.62, 0.66] }, { t: 'Civic Centre', at: [0.24, 0.7], kind: 'box' }],
        station: { at: [0.62, 0.06], label: 'Swansea station', op: 'gwr' },
        path: [[0.62, 0.12], [0.6, 0.3], [0.5, 0.5], [0.4, 0.64], [0.3, 0.72]],
        crowd: [0.06, 0.755, 0.5], jets: [0.9, 1.1, -0.2] } },
    { type: 'home', a: 142, b: 166, push: 'left', op: 'gwr', text: 'Trains back to London, Cardiff and Bristol get very busy straight after the flying. Leave a little early, or stay in town for something to eat and catch a later train.' },
    { type: 'end', a: 166, b: 999, push: 'up' },
  ],
};
