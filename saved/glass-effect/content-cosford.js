// How to plan the RAF Cosford Air Show 2027. Facts from the RAF Cosford guide page (based on the 2026 show).
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read my full Cosford guide at', stepLabel: 'Step',
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'The RAF'], ['huge', 'Cosford'], ['big', 'Air Show']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[13 June|p:cosredloop]', { size: 380, enter: 'slam' }], ['big', 'Sunday, 2027', { enter: 'slam', delay: B / 2 }], ['small', 'Date to be confirmed']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'How to plan it in'], ['huge', '*6 steps*', { enter: 'pop' }], ['mid', 'tickets to the drive home']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['What is|Cosford?', "The RAF's own air show", [
      { lines: [['big', 'Run by'], ['huge', '[the RAF|p:cosredhawk]'], ['mid', 'on a working RAF station']] },
      { lines: [['big', '[Red Arrows|p:cosredloop]'], ['big', '[Typhoon|p:costyphoon]'], ['big', '[BBMF|p:bbmf]'], ['small', 'Plus the Falcons and visiting warbirds in 2026']] },
      { lines: [['big', 'Static park'], ['mid', 'hangars, STEM and the RAF Museum'], ['big', '*one ticket*']], pics: ['cosjaguars'] },
    ]],
    ['Tickets', 'Ticket only, in advance', [
      { lines: [['big', 'Ticket'], ['big', 'only'], ['big', '*in advance*'], ['small', 'Nothing is sold at the gate']] },
      { lines: [['big', 'Sold out'], ['mid', 'in 2026'], ['big', '_buy on day one_']], pics: ['coschinook'] },
      { lines: [['huge', '£44'], ['mid', 'in 2026'], ['big', '*under 16s free*'], ['small', 'Parking is included']] },
    ]],
    ['Getting|there', 'M54, A41 or the train', [
      { lines: [['big', 'Train'], ['mid', 'to Cosford station'], ['big', '*under 300 m*'], ['small', 'from the gate']] },
      { lines: [['big', 'Driving?'], ['big', '*parking*'], ['big', 'included'], ['small', 'Satnav TF11 8UP, then follow the signs']] },
      { lines: [['big', 'Blue Badge?'], ['mid', 'disabled car park by the showground'], ['big', '_first come,_'], ['big', '_first served_'], ['small', 'Cosford station has no step free access']] },
    ]],
    ['On the|day', 'Gates 08:00 to 19:00', [
      { lines: [['big', 'Gates'], ['huge', '08:00'], ['mid', 'arrive as they open, walk the static']], pics: ['coschinookstatic'] },
      { lines: [['big', 'Flying'], ['huge', '11:30'], ['small', 'About when it started in 2026'], ['mid', 'toilet stop before it starts']] },
      { lines: [['big', 'Bring'], ['mid', 'folding chairs, blankets, food'], ['big', '*and cash*'], ['small', 'Card machines can lose signal']] },
    ]],
    ['Where to|watch', 'Crowd line faces south south east', [
      { lines: [['big', 'Aim for'], ['big', '*the centre*'], ['small', 'In front of the commentary box']], pics: ['coshurricane'] },
      { lines: [['big', 'Into the'], ['huge', '[sun|p:sun]'], ['mid', 'around the middle of the day']] },
      { lines: [['big', '300 to'], ['big', '500mm'], ['mid', 'is plenty, displays are close in']], pics: ['cosf35'] },
    ]],
    ['Getting|home', 'Flying ends about 17:30', [
      { lines: [['big', 'Give the'], ['big', 'car parks'], ['big', '*an hour*'], ['small', 'to clear after the flying']] },
      { lines: [['big', 'Last walk'], ['mid', 'round the static park'], ['big', '*eat while*'], ['big', '*queues drop*']], pics: ['costyphoonstatic'] },
      { lines: [['big', 'Showground'], ['big', 'open until'], ['huge', '19:00'], ['small', '2026 times, check before you go']] },
    ]],
  ],
  outro: [['big', 'Plan your'], ['huge', '[Cosford|p:cosredloop]', { size: 380, enter: 'slam' }], ['big', '2027']],
};
