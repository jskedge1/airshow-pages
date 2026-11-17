// Starter for a new information video in the glass effect. Copy this file to content-<topic>.js,
// copy index-template.html to index-<topic>.html and point it at the new file.
// Use only facts from the matching guide on ukairshowguide.co.uk. Mark 2026 details and dates to be confirmed on screen.
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read my full guide at', stepLabel: 'Step',
  introBeats: 12,
  // intro: three phrases on the beat grid, [startBeat, endBeat, lines, options]
  intro: [
    [0, 4, [['big', 'First line'], ['huge', 'Topic'], ['big', '2027']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[WORD|p:typhoon]', { size: 380, enter: 'slam' }], ['big', 'second line', { enter: 'slam', delay: B / 2 }], ['small', 'A short supporting line']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'How to do it in'], ['huge', '*5 steps*', { enter: 'pop' }], ['mid', 'from this to that']], { stagger: B / 2, exit: 'left' }],
  ],
  // stops: [ 'Title|second line', 'When line', [three points] ]
  stops: [
    ['Step|one', 'One short line', [
      { lines: [['big', 'Big words'], ['mid', 'a mint line'], ['small', 'A grey note']] },
      { lines: [['big', 'With a'], ['big', '*highlight*'], ['mid', 'and a photo']], pics: ['typhoon|Caption naming the aircraft'] },
      { lines: [['big', '_A warning_'], ['mid', 'in red']] },
    ]],
  ],
  outro: [['big', 'Plan your'], ['huge', '[2027|p:typhoon]', { size: 380, enter: 'slam' }], ['big', 'season']],
  // socials on the end card, in order: any of Instagram, Facebook, YouTube
  socials: ['Instagram', 'Facebook', 'YouTube'],
};
