// Advert for the UK Airshow Guide (ukairshowguide.co.uk), glass effect house style, about 45 seconds.
// The message: everything you need for UK air shows in one place. Every claim is from the live pages:
//   home.html (every UK airshow, one easy guide; detailed show pages with parking, the line up, where to watch and the sun guide)
//   uk-airshow-calendar.html (every UK airshow date for 2027, with a map; dates added as organisers confirm them)
//   public-transport.html (train, bus or coach: every way in, where to get off and the walk to the gate)
//   camping-hub.html (choosing a pitch, packing the car, shows with camping on site)
//   photography-hub.html (settings for jets and propellers, where to stand, sun guides)
//   my-airshow-hub.html (free for everyone, no card, no catch; saved shows, countdowns, alerts and show day mode on your phone)
// Pictures match the line beside them: real site screens for the calendar, show guide, transport and hub; a camping photo from the camping guide;
// Jack's own RIAT 2025 photos where an aircraft makes the point (a jet and a propeller fighter for camera settings, a Typhoon on the flight line).
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Plan your 2027 air shows at', stepLabel: false, typeScale: true, smooth: true, pointBeats: 3.6,
  ts: { mid: 62, small: 50 },
  introBeats: 10,
  intro: [
    [0, 3.5, [['big', 'Off to an'], ['huge', '[air show?|f:jf16]', { size: 290, enter: 'slam' }]], { stagger: B / 2, exit: 'zoom' }],
    [3.5, 7, [['huge', '[Everything|f:jredarrows]', { size: 300, enter: 'slam' }], ['big', 'you need', { enter: 'slam', delay: B / 2 }], ['mid', 'in one place']], { stagger: B, exit: 'zoom', boom: true }],
    [7, 10, [['small', 'Every UK air show'], ['huge', '*one easy guide*', { enter: 'pop' }], ['mid', 'ukairshowguide.co.uk']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['The 2027|calendar', 'Find your show', [
      { lines: [['big', 'Every UK'], ['big', '*show date*'], ['mid', 'in one place'], ['small', 'With a map to see how far away']], screen: { m: ['uk-airshow-calendar', 300, 500], d: ['uk-airshow-calendar', 300, 400] } },
      { lines: [['big', 'New dates'], ['big', '*added*'], ['mid', 'as organisers confirm'], ['small', 'The rest say dates to be confirmed']], screen: { m: ['uk-airshow-calendar', 1250, 1450], d: ['uk-airshow-calendar', 1700, 1900] } },
    ]],
    ['A guide for|every show', 'Your day, planned', [
      { lines: [['big', 'Parking'], ['big', '*line up*'], ['mid', 'and where to watch']], screen: { m: ['duxford', 0, 350], d: ['duxford', 150, 250] } },
      { lines: [['big', 'A sun guide'], ['big', '*for the*'], ['big', '*crowd line*'], ['mid', 'how the light moves']], pics: ['jtyphoon2|RAF Typhoon on the flight line, RIAT 2025'] },
    ]],
    ['Getting|there', 'Leave the car at home', [
      { lines: [['big', 'By ~train~'], ['big', '~bus~ or ~coach~'], ['small', 'Where to get off and the walk in']], screen: { m: ['public-transport', 0, 350], d: ['public-transport', 400, 500] } },
      { lines: [['big', '*Camping*'], ['big', 'on site'], ['mid', 'pick a pitch, pack the car']], pics: ['c-field-sunny'] },
    ]],
    ['Photography', 'Learn it and shoot it', [
      { lines: [['big', 'Camera'], ['big', '*settings*'], ['mid', 'for jets and propellers'], ['small', 'And where to stand']], pics: ['jf16|Danish F-16, RIAT 2025', 'jp40|P-40 Kittyhawk, RIAT 2025'] },
    ]],
    ['My Airshow|Hub', 'Your own space', [
      { lines: [['big', 'Your'], ['big', '*shows*'], ['mid', 'ready on your phone'], ['small', 'Alerts and show day mode']], screen: { m: ['my-airshow-hub', 0, 0], d: ['my-airshow-hub', 0, 0] } },
      { lines: [['big', '*Free*'], ['big', 'to join'], ['mid', 'no card, no catch']] },
    ]],
  ],
  outro: [['big', 'Your summer'], ['huge', '[starts here|f:jtyphoon2]', { size: 290, enter: 'slam' }], ['mid', 'one easy guide']],
  socials: ['Instagram', 'Facebook', 'YouTube'],
};
