// How to plan your 2027 season. Dates from the UK Airshow Dates 2027 calendar (updated 5 November 2026).
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Every 2027 date on one calendar at', stepLabel: 'Step',
  introBeats: 12,
  intro: [
    [0, 4, [['huge', 'How'], ['huge', 'to plan'], ['huge', '_your_']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[2027|p:typhoon]', { size: 380, enter: 'slam' }], ['big', 'season', { enter: 'slam', delay: B / 2 }]], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['huge', '*46 shows*', { enter: 'pop' }], ['mid', 'May to October'], ['small', 'and 22 more still to name their dates']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['Start with|the dates', 'Right now, over the winter', [
      { lines: [['big', 'Season opens'], ['huge', '[8 May|p:duxford]'], ['small', 'Duxford Flying Day: VE Day']] },
      { lines: [['big', 'Biggest show'], ['huge', '[RIAT|p:c17]'], ['mid', '16 to 18 July']] },
      { lines: [['big', 'Season ends'], ['huge', '[2 Oct|p:spitfire]'], ['small', 'Duxford Flying Finale']] },
    ]],
    ['Month|by month', 'May to October', [
      { lines: [['big', 'May'], ['mid', 'Duxford and Shuttleworth open'], ['big', 'June'], ['mid', 'RAF Air Show, Cosford, 13 June']], pics: ['cosredloop'] },
      { lines: [['big', 'July'], ['mid', 'RIAT and Shuttleworth summer'], ['big', 'August'], ['mid', 'the free seaside shows']], pics: ['eastbourne'] },
      { lines: [['big', 'September'], ['mid', 'Ayr, the Victory Show, Duxford'], ['big', 'October'], ['mid', 'Duxford Flying Finale']], pics: ['wingwalker'] },
    ]],
    ['Pick your|big one', 'One main show a summer', [
      { lines: [['big', 'One'], ['big', 'big show'], ['mid', 'to build your summer around']], pics: ['stepladder'] },
      { lines: [['big', 'Plus one'], ['big', 'or two'], ['big', '*smaller ones*'], ['small', 'around it']], pics: ['hurricanes'] },
      { lines: [['big', '[Fast jets|p:costyphoon]'], ['big', '[Warbirds|p:bbmf]'], ['big', '[Seaside|p:eastbourne]'], ['small', 'Mix the types across the year']] },
    ]],
    ['Budget|the year', 'January to April', [
      { lines: [['big', 'Add it up'], ['mid', 'tickets, travel, food, extras'], ['big', '*before you book*']] },
      { lines: [['big', 'Early bird'], ['big', 'tickets'], ['big', '*save the most*']] },
      { lines: [['big', '12 shows'], ['big', 'are'], ['big', '*free to watch*'], ['small', 'Most of them by the sea']], pics: ['clactonred'] },
    ]],
    ['Book|early', 'As soon as the dates land', [
      { lines: [['big', 'Beds'], ['big', 'first'], ['mid', 'show campsites go fastest']], pics: ['flyby'] },
      { lines: [['big', 'Cosford'], ['big', '*sold out*'], ['mid', 'in 2026, nothing sold at the gate']], pics: ['cosjaguars'] },
      { lines: [['big', 'On sale'], ['big', 'dates'], ['mid', 'straight into your phone calendar']] },
    ]],
    ['Track|it all', 'All winter', [
      { lines: [['big', 'Tap'], ['big', "*I'm going*"], ['mid', 'on the 2027 calendar']] },
      { lines: [['big', '22 shows'], ['big', 'still to come'], ['big', '*remind me*'], ['small', 'The calendar flags each one when its date lands']] },
      { lines: [['big', 'My Airshow'], ['big', 'Hub'], ['mid', 'your shows and plans in one place']] },
    ]],
  ],
  outro: [['big', 'Plan your'], ['huge', '[2027|p:redarrows]', { size: 380, enter: 'slam' }], ['big', 'season']],
};
