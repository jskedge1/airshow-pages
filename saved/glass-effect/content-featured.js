// Featured air shows 2027: the shows with a full guide on ukairshowguide.co.uk.
// Dates from the Featured Shows list and the 2027 calendar (checked 10 October 2026). No date shown where the organiser has not announced one.
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'See the full 2027 calendar at', stepLabel: false,
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'The'], ['huge', 'featured'], ['big', 'air shows 2027']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[12|p:cosredloop]', { size: 380, enter: 'slam' }], ['big', 'shows with full guides', { enter: 'slam', delay: B / 2 }], ['small', 'This is not the full calendar']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'The full calendar on the site has'], ['huge', '*66 shows*', { enter: 'pop' }], ['mid', 'month by month']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['May', 'Two seasons open', [
      { lines: [['big', 'Duxford'], ['mid', 'IWM Duxford, Cambridgeshire'], ['big', '*8 May to 2 Oct*'], ['small', 'Seven events, tickets in advance']], pics: ['dx-formation|Buchón, Spitfire and P-51 Mustang'] },
      { lines: [['big', 'Shuttleworth'], ['mid', 'Old Warden, Bedfordshire'], ['big', '*9 May to 25 Sept*'], ['small', 'Seven shows']], pics: ['sw-trainers|Hawk Trainer and Chipmunk'] },
    ]],
    ['June', 'Festival, RAF and warbirds', [
      { lines: [['big', 'Midlands'], ['mid', 'Air Festival, Ragley Hall'], ['big', '*4 to 6 June*'], ['small', 'Balloons and flying displays']], pics: ['mid-swordfish|Fairey Swordfish'] },
      { lines: [['big', 'RAF Cosford'], ['mid', 'Royal Air Force Air Show'], ['big', '*Sunday 13 June*'], ['small', 'Tickets in advance only']], pics: ['cosredloop|Red Arrows'] },
      { lines: [['big', 'Headcorn'], ['mid', 'Headcorn Aerodrome, Kent'], ['big', '*26 to 27 June*'], ['small', 'Warbirds and camping on the aerodrome']] },
    ]],
    ['July', 'The biggest show', [
      { lines: [['big', 'RIAT'], ['mid', 'Royal International Air Tattoo'], ['big', '*16 to 18 July*'], ['small', 'Moving to MOD Boscombe Down for 2027']], pics: ['typhoon'] },
    ]],
    ['August', 'Seaside and airfields', [
      { lines: [['big', 'Eastbourne'], ['mid', 'Airbourne, East Sussex'], ['big', '*12 to 15 August*'], ['small', 'Free to watch on the seafront']], pics: ['eastbourne|Eastbourne seafront'] },
      { lines: [['big', 'Clacton'], ['mid', 'Clacton seafront, Essex'], ['big', '*26 to 27 August*'], ['small', 'Free to watch']], pics: ['clactonred|Red Arrows'] },
      { lines: [['big', 'Little'], ['big', 'Gransden'], ['mid', 'Air & Car Show, Cambridgeshire'], ['big', '*Sunday 29 August*']] },
    ]],
    ['September', 'Scotland by the sea', [
      { lines: [['big', 'Ayr'], ['mid', 'International Ayr Show, Festival of Flight'], ['big', '*3 to 4 September*'], ['small', 'Free to watch on the seafront']] },
    ]],
    ['Date to be|confirmed', 'Watch this space', [
      { lines: [['big', 'Blackpool'], ['mid', 'Blackpool seafront, Lancashire'], ['big', '_Date to be confirmed_'], ['small', 'Free to watch']], pics: ['bp-wing|Aerosuperbatics Wingwalkers'] },
      { lines: [['big', 'Wales'], ['mid', 'Wales National Airshow, Swansea Bay'], ['big', '_Date to be confirmed_'], ['small', 'Free to watch']] },
    ]],
    ['Not the full|calendar', 'Every show is on the site', [
      { lines: [['big', 'These are'], ['big', 'my featured'], ['big', 'guides'], ['mid', 'each with a full planning page']] },
      { lines: [['big', '46 shows'], ['mid', 'have 2027 dates'], ['big', '*20 more*'], ['mid', 'dates to be confirmed']] },
      { lines: [['big', 'The full'], ['big', '*calendar*'], ['mid', 'is on the website']] },
    ]],
  ],
  outro: [['big', 'See every'], ['huge', '[2027|p:redarrows]', { size: 380, enter: 'slam' }], ['big', 'air show']],
};
