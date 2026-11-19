// Plan your 2027 airshow in 5 steps, plus 2 bonus steps. Wording from the Plan your 2027 airshow page and the
// first airshow guides (tickets, places to stay, getting there, what to pack, the night before, on the day).
// Real photos only: no AI images in this film.
const CAMP = { clip: 'cine/camp', clipL: 'cine/campL', n: 77 };
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Every step in full at', stepLabel: 'Step', typeScale: true, smooth: true,
  introBeats: 12,
  intro: [
    [0, 4, [['huge', 'How'], ['huge', 'to plan'], ['huge', '_your_']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[2027|p:jredarrows]', { size: 380, enter: 'slam' }], ['big', 'airshow', { enter: 'slam', delay: B / 2 }], ['small', 'Start planning this winter']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'Sorted in'], ['huge', '*5 steps*', { enter: 'pop' }], ['mid', 'plus 2 bonus tips']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['Pick your|airshow', 'November to February', [
      { lines: [['small', 'Lock in the big dates first'], ['huge', '[RIAT|p:jtyphoon]', { enter: 'slam' }], ['mid', '16 to 18 July 2027']] },
      { lines: [['big', '[Fast jets|p:typhoon]'], ['big', '[Warbirds|p:lancaster]'], ['big', '[Seaside|p:eastbourne]'], ['small', 'Pick the kind of day you want']] },
      { lines: [['big', 'Seaside'], ['big', 'shows'], ['mid', 'often confirm over the winter'], ['big', '*be patient*']], pics: ['eastprom'] },
    ]],
    ['Book your|tickets', 'As soon as they go on sale', [
      { lines: [['big', 'Early bird'], ['big', 'tickets'], ['big', '*save the most*'], ['small', 'Prices rise as the day gets closer']] },
      { lines: [['big', 'Car park'], ['big', 'passes'], ['big', '_sell out_'], ['small', 'Buy them with your ticket']], pics: ['carrows'] },
      { lines: [['big', 'Free seafront'], ['big', 'show?'], ['mid', 'no ticket needed'], ['small', 'Paid seats can still be worth it']], pics: ['eastbourne'] },
    ]],
    ['Book your|stay', 'Travelling down?', [
      { lines: [['big', 'Show'], ['big', 'campsites'], ['big', '*go first*'], ['mid', 'book the day they open']], bg: CAMP },
      { lines: [['big', 'Hotels'], ['big', 'B&amp;Bs'], ['big', 'and inns'], ['mid', 'near the big shows fill months ahead']] },
      { lines: [['big', 'Book with'], ['big', '*free*'], ['mid', 'cancellation'], ['small', 'In case your plans change']], pics: ['c-pitch-windbreaks'] },
    ]],
    ['Plan your|route', 'Spring, once you have tickets', [
      { lines: [['huge', '[Train|p:train]', { enter: 'slam' }], ['big', '~+ shuttle bus~'], ['mid', 'check the last train home']] },
      { lines: [['big', 'Driving?'], ['big', '~pre book~'], ['big', 'parking'], ['small', 'Follow the show route, not the sat nav']], pics: ['bluecarpark'] },
      { lines: [['big', 'Park'], ['big', 'and ride?'], ['big', '_queues_'], ['mid', 'for the bus after the finale']], pics: ['carqueue'] },
    ]],
    ['Build your|kit', 'The week before', [
      { lines: [['big', 'Folding'], ['big', 'chairs'], ['mid', 'and a small table'], ['small', 'Low chairs never block the row behind']], pics: ['chairs'] },
      { lines: [['big', 'Flask.', { enter: 'slam' }], ['big', 'Picnic.', { enter: 'slam' }], ['big', 'Water.', { enter: 'slam' }], ['small', 'Skip the food queues']] },
      { lines: [['big', 'Sun cream.', { enter: 'slam' }], ['big', 'Hats.', { enter: 'slam' }], ['mid', 'and sunglasses'], ['small', 'An airfield has no shade']], pics: ['sun'] },
      { lines: [['big', 'Check the'], ['huge', '[forecast|p:lancaster]'], ['mid', 'rain due? waterproofs on top'], ['big', '*sun cream*'], ['small', 'Pack it anyway. You often need both']] },
      { lines: [['big', 'Binoculars'], ['mid', 'if you need them'], ['big', 'Ear defenders'], ['big', 'Power bank']] },
    ]],
    ['The night|before', 'The evening before the show', [
      { lines: [['big', 'Tickets'], ['mid', 'saved on your phone'], ['big', '*and printed*'], ['small', 'Signal at the gate is often poor']], pics: ['pvcheckin'] },
      { lines: [['big', 'Charge'], ['big', 'everything'], ['mid', 'bag by the door'], ['big', '_keys on top_']], pics: ['jackery'] },
    ], { label: 'Bonus' }],
    ['Show|day', 'As the gates open', [
      { lines: [['big', 'Arrive'], ['huge', '[early|p:earlycar]'], ['mid', 'shorter queues, the pick of the crowd line']] },
      { lines: [['big', 'Toilets.'], ['big', 'Meeting'], ['big', 'point.'], ['small', 'Find them first']], pics: ['loos'] },
      { lines: [['big', 'Walk the'], ['huge', '[static|p:tstatic]'], ['mid', 'before the flying starts']] },
      { lines: [['big', 'Aim for'], ['big', 'the'], ['big', '*centre*'], ['small', 'The display is flown to the middle']], pics: ['displayline'] },
    ], { label: 'Bonus' }],
  ],
  outro: [['big', 'Plan your'], ['huge', '[2027|p:jredarrows]', { size: 380, enter: 'slam' }], ['big', 'airshow']],
  socials: ['Instagram', 'Facebook', 'YouTube'],
};
