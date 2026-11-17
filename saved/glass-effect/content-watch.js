// Where to watch at your first airshow. Facts from the where to watch guide.
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read my full where to watch guide at', stepLabel: 'Step',
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'Where to'], ['huge', 'watch'], ['big', 'an airshow']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[Spot|p:displayline]', { size: 380, enter: 'slam' }], ['big', 'decides your day', { enter: 'slam', delay: B / 2 }], ['small', 'And your photos']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'Pick it in'], ['huge', '*5 steps*', { enter: 'pop' }], ['mid', 'crowd line to enclosures']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['The crowd|line', 'Free with your ticket', [
      { lines: [['big', 'Front row'], ['big', '*first come*'], ['mid', 'first served']], pics: ['displayline'] },
      { lines: [['big', 'Save it'], ['mid', 'with chairs and a blanket'], ['big', 'then explore']], pics: ['chairs'] },
      { lines: [['big', 'Toilets'], ['big', '*first*'], ['mid', 'then a hat and sun cream'], ['small', 'Shade is rare on an airfield']], pics: ['loos'] },
    ]],
    ['Centre or|the ends?', 'Where you stand matters', [
      { lines: [['big', 'Centre'], ['mid', 'opposite display centre'], ['big', '*main passes*']], pics: ['queue'] },
      { lines: [['big', 'The ends'], ['mid', 'taxiing, take offs, landings']], pics: ['lancaster'] },
      { lines: [['big', 'Ladders?'], ['mid', 'check each show\'s rules']], pics: ['ladders'] },
    ]],
    ['Seafront|shows', 'Beach, cliffs or high ground', [
      { lines: [['big', 'Beach'], ['big', '*closest*'], ['mid', 'to the display']], pics: ['eastbourne|Eastbourne seafront'] },
      { lines: [['big', 'Cliffs'], ['mid', 'and higher ground'], ['big', '*whole view*']], pics: ['eastprom'] },
      { lines: [['big', 'Bring a'], ['big', 'low folding'], ['big', 'chair']] },
    ]],
    ['Pay for|a seat?', 'The paid options', [
      { lines: [['big', 'Enclosures'], ['mid', 'reserved seat, private toilets'], ['big', '_can double_'], ['big', '_the cost_']] },
      { lines: [['big', 'Photographers'], ['big', '*enclosures*'], ['mid', 'at RIAT and Cosford']], pics: ['stepladder'] },
      { lines: [['big', 'Park and'], ['big', '*View*'], ['mid', 'cheaper, on the approaches'], ['small', 'At RIAT, with a different view']], pics: ['c17'] },
    ]],
    ['Mind the|sun', 'Pick your spot by the light', [
      { lines: [['big', 'Sun behind'], ['big', '*you*'], ['mid', 'lights the aircraft']], pics: ['redarrows'] },
      { lines: [['big', 'Sun in'], ['big', 'front'], ['mid', 'gives you silhouettes']], pics: ['sun'] },
      { lines: [['big', '_Never stop_'], ['big', '_on verges_'], ['mid', 'use a proper viewpoint']] },
    ]],
  ],
  outro: [['big', 'Find your'], ['huge', '[spot|p:displayline]', { size: 380, enter: 'slam' }], ['big', 'in 2027']],
};
