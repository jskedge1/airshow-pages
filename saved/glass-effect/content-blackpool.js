// Blackpool Air Show 2027. Facts from the Blackpool guide page. Times, travel and acts are from the 2026 show.
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read my full Blackpool guide at', stepLabel: 'Step',
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'Blackpool'], ['huge', 'Air Show'], ['big', '2027']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[FREE|p:bp-typhoon]', { size: 380, enter: 'slam' }], ['big', 'to watch', { enter: 'slam', delay: B / 2 }], ['small', 'No tickets and no gates']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'How to plan it in'], ['huge', '*5 steps*', { enter: 'pop' }], ['mid', 'the train to the fish and chips']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['What is|Blackpool?', 'Free, on the seafront', [
      { lines: [['big', 'Over the'], ['big', 'Irish Sea'], ['mid', 'between North Pier and Central Pier']], pics: ['bp-typhoon|RAF Typhoon'] },
      { lines: [['big', 'Flying since'], ['huge', '1909'], ['small', 'Over 350,000 people expected in 2026']] },
      { lines: [['big', 'August'], ['huge', '2027'], ['mid', 'dates to be confirmed'], ['small', 'In 2026 it was Sat 8 and Sun 9 August']] },
    ]],
    ['Who|flew?', 'The 2026 line up', [
      { lines: [['big', '[Typhoon|p:bp-typhoon]'], ['big', '[BBMF|p:bp-bbmf]'], ['mid', 'the RAF in 2026']], pics: ['bp-bbmf|BBMF Hurricane'] },
      { lines: [['big', 'MiG-17'], ['mid', 'its first UK display'], ['small', 'Plus US warbirds in 2026']], pics: ['bp-mig|MiG-17'] },
      { lines: [['big', 'Red Arrows?'], ['mid', 'they usually headline'], ['big', '_not in 2026_'], ['small', 'They were on a North America tour']] },
    ]],
    ['Getting|there', 'Train, car or tram', [
      { lines: [['big', 'Train'], ['mid', 'to Blackpool North'], ['big', '*15 minutes*'], ['small', 'walk to the Tower']] },
      { lines: [['big', 'Driving?'], ['mid', 'paid council car parks'], ['big', '_prom closed_'], ['small', '10:30 to 19:00 in 2026']] },
      { lines: [['big', 'Trams'], ['mid', 'run in two sections'], ['big', '*no stop*'], ['small', 'at the Tower or Central Pier in 2026']] },
    ]],
    ['On the|day', 'Plan your day', [
      { lines: [['big', 'Village'], ['huge', '11:00'], ['mid', 'Tower Festival Headland'], ['small', 'Open 11:00 to 18:00 in 2026']] },
      { lines: [['big', 'Flying starts'], ['big', '*early*'], ['big', '*afternoon*'], ['small', 'The programme sets the times'], ['mid', 'show radio on DAB']], pics: ['bp-wing|Aerosuperbatics Wingwalkers', 'bp-raven|Team Raven'] },
      { lines: [['big', 'North Pier'], ['mid', 'charges on show days'], ['big', '_no own food_'], ['small', 'Bags are searched']] },
    ]],
    ['Where to|watch', 'Between the piers', [
      { lines: [['big', 'On the'], ['big', '*sand?*'], ['mid', 'watch the tide'], ['small', 'A big high tide reaches the sea wall']] },
      { lines: [['big', '400 to'], ['big', '600mm'], ['mid', 'into the sun later on']], pics: ['bp-pitts|Jet Pitts'] },
      { lines: [['big', 'Home?'], ['mid', 'fish and chips first'], ['big', '*let it clear*'], ['small', 'then a later train home']] },
    ]],
  ],
  outro: [['big', 'Plan your'], ['huge', '[Blackpool|p:bp-wing]', { size: 380, enter: 'slam' }], ['big', '2027']],
};
