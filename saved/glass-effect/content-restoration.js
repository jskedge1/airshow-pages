// Aircraft restoration projects: a landscape film for emails to aviation organisations with a restoration under way
// (planes, helicopters, jet engines, cockpits, any piece of aviation history), offering them a Restoration Projects page.
// Facts are the features of the Restoration Projects page (the Jaguar GR3A "Phoenix" preview). That page is a sample:
// its jet, people, dates and photos are made up and its photos are AI generated, so the film says so on screen and
// never presents Phoenix as a real project. The photo panels and photo filled words use real photos only.
// Landscape only: render with ?fmt=land. Screens: Z(page, x, y from, y to, zoom) on screens/restoration-full-d.jpg,
// in CSS pixels of the 1440 wide page.
const Z = (pg, cx, a, b, z) => ({ m: [pg, a, b], d: [pg, a, b], z, cx });
const R = (cx, a, b, z) => Z('restoration', cx, a, b, z);
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'It is free. Tell me about your project at', stepLabel: 'Stop', typeScale: true, smooth: true, pointBeats: 7,
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'Restoring an'], ['huge', '[aircraft?|p:cosjaguars]', { size: 300, enter: 'slam' }]], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[History|p:lancaster]', { size: 380, enter: 'slam' }], ['big', 'deserves a crowd', { enter: 'slam', delay: B / 2 }], ['small', 'Planes, helicopters, jet engines and more']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'Free help to'], ['huge', '*tell its story*', { enter: 'pop' }], ['mid', 'on the UK Airshow Guide']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['Who it|is for', 'Any piece of aviation history', [
      { lines: [['big', 'Any'], ['big', '*aircraft*'], ['mid', 'planes and helicopters'], ['small', 'Jet engines, cockpits, any part of one']], pics: ['chinook|Boeing Chinook'] },
      { lines: [['big', 'On show'], ['big', 'in a'], ['big', '*museum*'], ['mid', 'or at a hangar open day']], pics: ['dx-tornado|Panavia Tornado'] },
      { lines: [['big', 'Or back'], ['big', '*in the air*'], ['mid', 'at future air shows']], pics: ['mid-swordfish|Fairey Swordfish'] },
    ]],
    ['Its|story', 'Your own page on the site', [
      { lines: [['big', 'A page'], ['big', '*for your*'], ['big', '*project*'], ['small', 'Example page'], ['small', 'The jet and photos are a sample']], screen: R(720, 520, 600, 1.12) },
      { lines: [['big', 'The'], ['big', '*key facts*'], ['mid', 'built, served, found'], ['small', 'Where it lives and what it aims for']], screen: R(1077, 520, 660, 2.0) },
      { lines: [['big', 'Stage'], ['big', '*by stage*'], ['mid', 'a restoration gauge'], ['small', 'What is on now, and what comes next']], screen: R(720, 1055, 1055, 1.3) },
      { lines: [['big', 'Its'], ['big', '*history*'], ['mid', 'the story in full'], ['small', 'With an extract of its service record']], screen: R(720, 1400, 1560, 1.35) },
    ]],
    ['The|workshop', 'Every stage of the rebuild', [
      { lines: [['big', 'Job'], ['big', '*cards*'], ['mid', 'one for every stage'], ['small', 'Each with a photo and a short note']], screen: R(720, 2250, 3400, 1.28) },
      { lines: [['big', 'Stamped'], ['big', '*as you go*'], ['mid', 'complete or in progress'], ['small', 'So people can see how far it has come']], screen: R(720, 5150, 5400, 1.28) },
      { lines: [['big', 'Then'], ['big', '*and now*'], ['mid', 'drag to compare'], ['small', 'As it was found, and how it looks today']], screen: R(720, 6297, 6297, 1.3) },
      { lines: [['big', 'The'], ['big', '*gallery*'], ['mid', 'the rebuild in pictures'], ['small', 'On a real page, your own photos']], screen: R(720, 6915, 6915, 1.3) },
    ]],
    ['Where to|see it', 'Visits, engine runs and shows', [
      { lines: [['big', 'Fly or'], ['big', '*display?*'], ['mid', 'share the plan'], ['small', 'Flight, taxi runs or a museum display']], screen: R(720, 7420, 7480, 1.3) },
      { lines: [['big', 'Open'], ['big', '*days*'], ['mid', 'visiting the hangar'], ['small', 'Parking, toilets, step free viewing']], screen: R(720, 7640, 7660, 1.3) },
      { lines: [['big', 'Dates for'], ['big', '*the diary*'], ['mid', 'engine runs and shows']], screen: R(720, 8080, 8180, 1.28) },
      { lines: [['big', 'Plan the'], ['big', '~journey~'], ['mid', 'links to the show guide'], ['small', 'And the free journey planner']], screen: R(720, 8386, 8386, 1.3) },
    ]],
    ['The|people', 'The team behind it', [
      { lines: [['big', 'Meet'], ['big', '*the team*'], ['mid', 'owners to volunteers'], ['small', 'And the partners who help']], screen: R(720, 8760, 8820, 1.28) },
      { lines: [['big', 'In'], ['big', '*numbers*'], ['mid', 'the data plate']], screen: R(720, 9290, 9290, 1.3) },
      { lines: [['big', 'Hangar'], ['big', '*news*'], ['mid', 'a workshop diary'], ['small', 'The latest updates, newest first']], screen: R(720, 9760, 9840, 1.3) },
    ]],
    ['Support', 'Money, parts and people', [
      { lines: [['big', 'Raise'], ['big', '*funds*'], ['mid', 'an appeal with a goal'], ['small', 'Donate, sponsor a part or volunteer']], screen: R(453, 10368, 10368, 2.2) },
      { lines: [['big', 'Parts'], ['big', '*wanted*'], ['mid', 'say what you still need']], screen: R(1038, 10368, 10368, 2.3) },
      { lines: [['big', 'Visitor'], ['big', '*questions*'], ['mid', 'answered on the page']], screen: R(720, 10720, 10780, 1.35) },
    ]],
    ['Get in|touch', 'Your project could be next', [
      { lines: [['big', 'Your'], ['big', '*project*'], ['mid', 'could be next'], ['small', 'Under way now, or about to start']], screen: R(720, 12890, 12890, 1.3) },
      { lines: [['big', 'Completely'], ['big', '*free*'], ['mid', 'no cost to you'], ['small', 'A free service for restoration groups']], pics: ['dx-spitcockpit|Supermarine Spitfire'] },
      { lines: [['big', 'Just send'], ['big', '*the details*'], ['mid', 'I upload it for you'], ['small', 'Your story, photos, dates and team']], pics: ['coshurricane|Hawker Hurricane'] },
      { lines: [['big', 'Needs'], ['big', '*saving?*'], ['mid', 'tell me about it'], ['small', 'It could be the next one on the page']], screen: R(720, 12594, 12594, 1.35) },
      { lines: [['big', 'Let more'], ['big', '*people*'], ['mid', 'see it, visit it'], ['mid', 'and support it']], pics: ['hurricanes|Hawker Hurricanes'] },
    ]],
  ],
  outro: [['big', 'From the hangar'], ['huge', '[to the sky|p:spitfire]', { size: 340, enter: 'slam' }], ['big', 'Let me help'], ['mid', 'completely free']],
  socials: ['Instagram', 'Facebook', 'YouTube'],
};
