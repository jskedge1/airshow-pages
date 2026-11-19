// Camping at airshows. Tips from the camping guide (camping-hub). Photos and clips are from real airshow campsites.
const CAMP = { clip: 'cine/camp', clipL: 'cine/campL', n: 77 };
const PITCHES = { clip: 'cine/pitches', clipL: 'cine/pitchesL', n: 77 };
const SHELTER = { clip: 'cine/shelter', clipL: 'cine/shelterL', n: 77 };
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read my full camping guide at', stepLabel: 'Step',
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'Camping at'], ['huge', 'airshows'], ['big', '2027']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[Camp|p:c-pitch-windbreaks]', { size: 380, enter: 'slam' }], ['big', 'the weekend', { enter: 'slam', delay: B / 2 }], ['small', 'Not just the day']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'Get it right in'], ['huge', '*5 steps*', { enter: 'pop' }], ['mid', 'booking to base camp']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['Book|early', 'Popular fields go early', [
      { lines: [['big', 'Book as'], ['big', '*soon as*'], ['mid', 'the dates are announced']], bg: CAMP },
      { lines: [['big', 'Check'], ['big', 'the rules'], ['mid', 'cars, dogs, generators, barbecues'], ['small', 'Every campsite is different']], pics: ['checkin'] },
      { lines: [['big', 'Know your'], ['big', '*pitch size*'], ['mid', 'before you pack the car']], pics: ['c-field-sunny'] },
    ]],
    ['Pitch|it right', 'Pitching tips', [
      { lines: [['big', 'Narrow end'], ['big', '*into the wind*'], ['mid', 'and use every guy line']], bg: PITCHES },
      { lines: [['big', 'Pegs at'], ['huge', '45°'], ['mid', 'angled away']] },
      { lines: [['big', '_Check for_'], ['big', '_trees_'], ['small', 'In 2023 a storm brought a big tree down in a Fairford campsite']], pics: ['c-base-storm'] },
    ]],
    ['Face the|display', 'The best seat is your doorway', [
      { lines: [['big', 'Face your'], ['big', '*door*'], ['mid', 'towards the display line']], pics: ['c-pitch-spot'] },
      { lines: [['big', 'Windbreaks'], ['big', '*and a flag*'], ['mid', 'a pitch you can find in the dark']], pics: ['c-pitch-windbreaks'] },
      { lines: [['big', 'Section off'], ['big', '*car space*'], ['mid', 'early, or get boxed in']], pics: ['carrows'] },
    ]],
    ['Kit|list', 'What to pack', [
      { lines: [['big', 'Lay it'], ['big', '*all out*'], ['mid', 'at home and check it'], ['small', 'Practise pitching in the garden first']], pics: ['c-kit-laid-out'] },
      { lines: [['big', 'Wipes'], ['big', 'hand gel'], ['mid', 'and a bucket with a lid']], pics: ['c-toilet-row'] },
      { lines: [['big', 'Ice packs?'], ['mid', 'some campsites freeze them'], ['big', '*just ask*']], pics: ['c-freezer'] },
    ]],
    ['Level|up', 'Once you are hooked', [
      { lines: [['big', 'Event'], ['big', 'shelter'], ['mid', 'becomes the kitchen']], bg: SHELTER },
      { lines: [['big', 'Portable'], ['big', '*power*'], ['mid', 'a power station and solar']], pics: ['jackery'] },
      { lines: [['big', 'Raised'], ['big', 'camp beds'], ['mid', 'and lights for a proper base camp']], pics: ['c-order-beds', 'c-event-shelter-night'] },
    ]],
  ],
  outro: [['big', 'Pitch up'], ['huge', '[2027|p:c-pitch-windbreaks]', { size: 380, enter: 'slam' }], ['big', 'Book early']],
};
