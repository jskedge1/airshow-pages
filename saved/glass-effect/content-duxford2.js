// Duxford air shows 2027, fixed type scale version (one large, one medium, one small size).
// Duxford air shows 2027 at IWM Duxford. Facts from the Duxford guide page (2027 calendar checked 11 October 2026).
// Photos are the real Duxford photos used on that guide.
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read my full Duxford guide at', stepLabel: 'Step', typeScale: true, smooth: true,
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'The'], ['huge', '[Duxford|p:dx-formation]', { size: 340, enter: 'slam' }], ['big', 'air shows']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[Seven|p:dx-formation]', { size: 380, enter: 'slam' }], ['big', 'events', { enter: 'slam', delay: B / 2 }], ['big', 'in 2027', { enter: 'slam', delay: B / 2 }], ['small', 'May to October']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'How to plan them in'], ['huge', '*6 steps*', { enter: 'pop' }], ['mid', 'tickets to the drive home']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['What is|Duxford?', 'IWM Duxford, Cambridgeshire', [
      { lines: [['big', 'A real'], ['big', 'Battle of'], ['big', 'Britain'], ['mid', 'airfield, south of Cambridge']], pics: ['dx-formation|Buchón, Spitfire and P-51 Mustang'] },
      { lines: [['big', 'Europe\'s'], ['big', '*largest*'], ['mid', 'collection of airworthy'], ['mid', 'historic aircraft']], pics: ['dx-p40|Curtiss P-40 Warhawk'] },
      { lines: [['big', 'Museum'], ['big', 'hangars'], ['big', '*included*'], ['small', 'Plus the American Air Museum']], pics: ['dx-tornado|Tornado GR4 in the hangars'] },
    ]],
    ['Pick your|show', 'Seven events in 2027', [
      { lines: [['big', 'Summer'], ['big', 'Air Show'], ['mid', '19 and 20 June']] },
      { lines: [['big', 'Battle of'], ['big', 'Britain'], ['mid', 'Air Show'], ['mid', '11 and 12 September']] },
      { lines: [['big', 'Flying'], ['big', '*Days*'], ['mid', 'plus an Evening and a Finale'], ['small', 'Smaller and calmer, same aircraft']] },
    ]],
    ['Tickets', 'Prices and how to book', [
      { lines: [['big', 'Advance'], ['big', '*only*'], ['mid', 'no tickets on the gate'], ['small', 'At any Duxford show']] },
      { lines: [['big', 'From'], ['huge', '£51'], ['mid', 'at the two Big Air Shows'], ['small', 'Children 15 and under go free']] },
      { lines: [['big', 'IWM'], ['big', 'members'], ['big', '*free*'], ['mid', 'at the Flying Days'], ['small', 'And 10% off the Air Shows']] },
    ]],
    ['Getting|there', 'Car, train or shuttle', [
      { lines: [['big', 'M11'], ['big', '~junction 10~'], ['mid', 'then follow the event signs'], ['small', 'Not the sat nav']] },
      { lines: [['big', 'Parking'], ['big', '~permit~'], ['mid', 'booked with your ticket'], ['small', 'At the two Big Air Shows']] },
      { lines: [['big', 'Free'], ['big', '~shuttle~'], ['mid', 'from Cambridge station'], ['small', 'And Trumpington Park & Ride']] },
    ]],
    ['On the|day', 'Plan your day', [
      { lines: [['big', 'Arrive'], ['big', '*early*'], ['mid', 'car parks open at 07:00'], ['small', 'IWM recommends arriving before 11:00']], pics: ['dx-queue'] },
      { lines: [['big', 'Flying starts'], ['big', '*early*'], ['big', '*afternoon*'], ['small', 'The programme sets the times'], ['mid', 'hangars in the morning']] },
      { lines: [['big', 'West end'], ['mid', 'the Tank Bank'], ['big', '*taxiing*'], ['big', '*close*']], pics: ['dx-wildcat2|Wildcat taxiing'] },
    ]],
    ['Getting|home', 'After the flying', [
      { lines: [['big', 'Leaving'], ['big', '_takes time_'], ['mid', 'queues back to the M11']] },
      { lines: [['big', 'Stay on'], ['mid', 'hangars, food and the static'], ['big', '*let it*'], ['big', '*clear*'], ['small', 'Open until 19:00 at the Big Air Shows']], pics: ['dx-spitcockpit|Spitfire'] },
      { lines: [['big', 'Last'], ['big', 'shuttle'], ['huge', '18:30'], ['small', 'Check before you travel']] },
    ]],
  ],
  outro: [['big', 'Plan your'], ['huge', '[Duxford|p:dx-formation]', { size: 380, enter: 'slam' }], ['big', '2027']],
};
