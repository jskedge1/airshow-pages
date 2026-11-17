// Airshow photography for beginners. Facts from the new to aviation photography guide.
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read my full photography guide at', stepLabel: 'Step',
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'Airshow'], ['huge', 'photos'], ['big', 'for beginners']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[Sharp|p:typhoon]', { size: 380, enter: 'slam' }], ['big', 'shots first', { enter: 'slam', delay: B / 2 }], ['small', 'Then experiment']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'Get started in'], ['huge', '*5 steps*', { enter: 'pop' }], ['mid', 'settings, kit and light']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['Camera|mode', 'Settings to start with', [
      { lines: [['big', 'Shutter'], ['big', '*priority*'], ['mid', 'S or Tv on the dial']] },
      { lines: [['big', 'Safe, sharp'], ['big', '*shot first*'], ['mid', 'then experiment']], pics: ['redarrows'] },
      { lines: [['big', 'Static?'], ['mid', 'aperture priority'], ['big', 'f/7.1 to f/11']], pics: ['tstatic'] },
    ]],
    ['Shutter|speeds', 'Starting points, not rules', [
      { lines: [['big', 'Fast jets'], ['huge', '1/1000'], ['mid', 'and faster']], pics: ['typhoon|Typhoon'] },
      { lines: [['big', 'Propellers'], ['huge', '1/320'], ['mid', 'then slower']], pics: ['spitfire|Spitfire'] },
      { lines: [['big', 'Helicopters'], ['huge', '1/125'], ['mid', 'then slower']], pics: ['chinook|Chinook'] },
    ]],
    ['Your|kit', 'What to buy first', [
      { lines: [['big', 'Spend on'], ['big', '*the lens*'], ['mid', 'before the camera']] },
      { lines: [['big', '70 to 300mm'], ['mid', 'then a 150 to 600mm zoom'], ['small', 'once you are hooked']], pics: ['c17'] },
      { lines: [['big', 'At least'], ['huge', '6 fps'], ['small', 'If your budget means 3 fps, that is fine']] },
    ]],
    ['Before|you go', 'Cards, batteries, practice', [
      { lines: [['big', 'Two'], ['big', '*64GB*'], ['big', 'cards'], ['mid', 'and a spare battery']] },
      { lines: [['big', 'ISO'], ['mid', '1200 or below'], ['small', 'Keeps the files clean']] },
      { lines: [['big', 'Practise'], ['big', '*panning*'], ['mid', 'on cars and trains']], pics: ['train'] },
    ]],
    ['On the|day', 'Light and position', [
      { lines: [['big', 'Sun'], ['big', '*behind you*'], ['mid', 'lights the aircraft']], pics: ['harvard'] },
      { lines: [['big', 'Follow'], ['mid', 'the aircraft, short bursts']], pics: ['lancaster'] },
      { lines: [['big', 'Ladders?'], ['mid', 'check the show rules first'], ['small', 'Tripods too']], pics: ['stepladder'] },
    ]],
  ],
  outro: [['big', 'Shoot your'], ['huge', '[best|p:redarrows]', { size: 380, enter: 'slam' }], ['big', 'season yet']],
};
