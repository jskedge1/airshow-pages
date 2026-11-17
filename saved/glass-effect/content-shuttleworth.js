// Shuttleworth air shows 2027 at Old Warden. Facts from the Shuttleworth guide page and the 2027 calendar.
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read my full Shuttleworth guide at', stepLabel: 'Step',
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'The'], ['huge', 'Shuttleworth'], ['big', 'air shows']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[Seven|p:sw-trainers]', { size: 380, enter: 'slam' }], ['big', 'shows in 2027', { enter: 'slam', delay: B / 2 }], ['small', '9 May to 25 September']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'How to plan them in'], ['huge', '*5 steps*', { enter: 'pop' }], ['mid', 'from tickets to evening flying']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['What is|Shuttleworth?', 'Old Warden, Bedfordshire', [
      { lines: [['big', 'Historic'], ['huge', '[aircraft|p:sw-trainers]'], ['mid', 'flying at Old Warden']], pics: ['sw-trainers|Hawk Trainer and Chipmunk'] },
      { lines: [['big', 'Small'], ['big', 'field'], ['big', '*close to*'], ['big', '*the aircraft*']] },
      { lines: [['big', 'Hangars'], ['mid', 'Swiss Garden, fun fair, bus rides'], ['big', '*one ticket*']], pics: ['sw-hangars'] },
    ]],
    ['Pick your|show', 'Seven dates in 2027', [
      { lines: [['big', '9 May'], ['mid', 'Premiere'], ['big', '29 May'], ['mid', 'Military']], pics: ['sw-harvard|Harvard'] },
      { lines: [['big', '26 to 27'], ['big', 'June'], ['mid', 'Festival of Flight'], ['small', 'Then 24 July Summer, 14 August Wings & Wheels']] },
      { lines: [['big', 'Flying'], ['big', '*Proms*'], ['mid', '28 August, live orchestra'], ['small', 'The Finale is on 25 September']], pics: ['sw-anson|Avro Anson'] },
    ]],
    ['Tickets', 'Tickets, parking and the train', [
      { lines: [['big', 'From'], ['huge', '£35'], ['big', '*children free*'], ['small', 'at most shows']] },
      { lines: [['big', 'Parking'], ['huge', 'free'], ['mid', 'in via Alder Drive'], ['small', 'Expect a holding queue at the entrance']] },
      { lines: [['big', 'Train?'], ['mid', 'Biggleswade, 3 miles away'], ['big', '*shuttle bus*']] },
    ]],
    ['On the|day', 'Plan your day', [
      { lines: [['big', 'Gates'], ['huge', '09:00'], ['small', '10:00 at the Flying Proms']] },
      { lines: [['big', 'Flying starts'], ['big', '*early*'], ['big', '*afternoon*'], ['small', 'The programme sets the times'], ['mid', 'walk the hangars in the morning']] },
      { lines: [['big', 'Evening'], ['big', '*displays*'], ['mid', 'sun behind the crowd']], pics: ['sw-speedsix|Miles Hawk Speed Six'] },
    ]],
    ['What you|might see', 'Photos from Old Warden', [
      { lines: [['big', 'Visiting'], ['big', '*display acts*'], ['mid', 'differ at each show']], pics: ['sw-invader|A-26B Invader', 'sw-chinook|RAF Chinook'] },
      { lines: [['big', 'Check'], ['big', 'the line up'], ['mid', 'before you choose a show']], pics: ['sw-727|2Excel Boeing 727'] },
      { lines: [['big', 'Bring'], ['mid', 'chairs and a picnic'], ['big', '*stay late*'], ['small', 'Some shows fly on into the evening']] },
    ]],
  ],
  outro: [['big', 'Plan your'], ['huge', '[Old Warden|p:sw-speedsix]', { size: 380, enter: 'slam' }], ['big', '2027']],
};
