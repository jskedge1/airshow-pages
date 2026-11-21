// A two minute walkthrough of ukairshowguide.co.uk in the glass effect, with the real pages in a phone
// (portrait) or a browser window (landscape) that tilt in and scroll. Screens: m = phone, d = desktop,
// [page, scroll from, scroll to] in CSS pixels. Ranges are chosen so Southport stays out of shot.
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Start planning at', stepLabel: 'Stop', typeScale: true, smooth: true, pointBeats: 6.75,
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'Take the tour'], ['huge', '[UK Airshow|p:redarrows]', { size: 300, enter: 'slam' }], ['big', 'Guide']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[2027|p:typhoon]', { size: 380, enter: 'slam' }], ['big', 'in one place', { enter: 'slam', delay: B / 2 }], ['small', 'ukairshowguide.co.uk']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'Your season in'], ['huge', '*8 stops*', { enter: 'pop' }], ['mid', 'start to finish']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['Home|page', 'Where it all starts', [
      { lines: [['big', 'Every UK'], ['big', '*airshow*'], ['mid', 'one easy guide']], screen: { m: ['home', 0, 250], d: ['home', 0, 300] } },
      { lines: [['big', 'Days'], ['big', '*to go*'], ['mid', 'to the next big show'], ['small', 'Duxford, Saturday 8 May 2027']], screen: { m: ['home', 450, 700], d: ['home', 0, 150] } },
      { lines: [['big', 'Handy'], ['big', '*tools*'], ['mid', 'kit lists and budgets'], ['small', 'Calculators that do the sums for you']], screen: { m: ['home', 4800, 5900], d: ['home', 2200, 2600] } },
    ]],
    ['Find your|airshow', 'Featured shows', [
      { lines: [['big', 'Pick a'], ['big', '*show*'], ['mid', 'filter by type'], ['small', 'Military, seaside, historic and more']], screen: { m: ['find-your-airshow', 0, 0], d: ['find-your-airshow', 1600, 2300] } },
      { lines: [['big', 'Make it a'], ['big', '*weekend*'], ['mid', 'shows close together']], screen: { m: ['find-your-airshow', 1500, 1700], d: ['find-your-airshow', 1000, 1100] } },
      { lines: [['big', 'Boarding'], ['big', '*passes*'], ['mid', 'days to go, miles away']], screen: { m: ['find-your-airshow', 3100, 3500], d: ['find-your-airshow', 1700, 2100] } },
    ]],
    ['The 2027|calendar', 'Every show, month by month', [
      { lines: [['big', 'Season'], ['big', '*at a*'], ['big', '*glance*'], ['mid', 'what is confirmed']], screen: { m: ['uk-airshow-calendar', 300, 500], d: ['uk-airshow-calendar', 0, 0] } },
      { lines: [['big', 'Search'], ['big', 'and *filter*'], ['mid', 'by county, type or month']], screen: { m: ['uk-airshow-calendar', 1250, 1450], d: ['uk-airshow-calendar', 300, 400] } },
      { lines: [['big', "I'm *going*"], ['mid', 'add it to your calendar']], screen: { m: ['uk-airshow-calendar', 2550, 2800], d: ['uk-airshow-calendar', 1700, 1900] } },
    ]],
    ['Show|guides', 'A full guide for each show', [
      { lines: [['big', 'Duxford'], ['mid', 'for every featured show']], screen: { m: ['duxford', 0, 350], d: ['duxford', 0, 0] } },
      { lines: [['big', 'Key'], ['big', '*details*'], ['mid', 'dates, tickets and parking']], screen: { m: ['duxford', 900, 1200], d: ['duxford', 150, 250] } },
      { lines: [['big', 'Day by'], ['big', '*day*'], ['mid', 'times and prices']], screen: { m: ['duxford', 3900, 4400], d: ['duxford', 1900, 2100] } },
    ]],
    ['Getting|there', 'Train, bus or coach', [
      { lines: [['big', 'Plan the'], ['big', '~journey~'], ['mid', 'from home to the gate']], screen: { m: ['public-transport', 0, 350], d: ['public-transport', 0, 0] } },
      { lines: [['big', 'Every'], ['big', '~route~'], ['mid', 'on one map']], screen: { m: ['public-transport', 1500, 1900], d: ['public-transport', 400, 500] } },
    ]],
    ['Camping', 'Pitch up for the weekend', [
      { lines: [['big', 'Camping'], ['big', '*guides*'], ['mid', 'from years of camping']], screen: { m: ['camping-hub', 0, 300], d: ['camping-hub', 0, 100] } },
      { lines: [['big', 'Packing'], ['big', '*list*'], ['mid', 'built for your trip']], screen: { m: ['camping-hub', 250, 350], d: ['camping-hub', 400, 500] } },
      { lines: [['big', 'Every'], ['big', '*guide*'], ['mid', 'where to camp to luxury']], screen: { m: ['camping-hub', 2000, 3600], d: ['camping-hub', 1600, 2000] } },
    ]],
    ['Photography', 'Settings, kit and spots', [
      { lines: [['big', 'Better'], ['big', '*photos*'], ['mid', 'first timers welcome']], screen: { m: ['photography-hub', 0, 300], d: ['photography-hub', 0, 100] } },
      { lines: [['big', 'Settings'], ['big', '*made easy*'], ['mid', 'by aircraft and light']], screen: { m: ['photography-hub', 330, 450], d: ['photography-hub', 450, 550] } },
      { lines: [['big', 'Guides'], ['mid', 'camera, settings and spots']], screen: { m: ['photography-hub', 2900, 4300], d: ['photography-hub', 1700, 2300] } },
    ]],
    ['My Airshow|Hub', 'Free for everyone', [
      { lines: [['big', 'Your'], ['big', '*cockpit*'], ['mid', 'saved shows and plans'], ['small', 'Log in with email, Google or Facebook']], screen: { m: ['my-airshow-hub', 0, 0], d: ['my-airshow-hub', 0, 0] } },
      { lines: [['big', 'Plan'], ['big', '*your day*'], ['mid', 'all of it on your phone']], screen: { m: ['home', 2000, 2200], d: ['home', 600, 800] } },
    ]],
  ],
  outro: [['big', 'Plan your'], ['huge', '[2027|p:redarrows]', { size: 380, enter: 'slam' }], ['big', 'season']],
};
