// How My Airshow Hub works: a detailed landscape tour in the glass effect.
// Facts from join-my-airshow-hub.html. Screens are the working hub preview (previews/hub-login-demo.html)
// filled in like a member would (RIAT and Eastbourne saved), shown as the example member Alex, with Southport hidden.
// Landscape only: render with ?fmt=land. Screens: [page, scroll from, scroll to] in CSS pixels of shots/d-<page>.png.
// Z(page, x, y from, y to, zoom): the view opens on the whole page, then pushes in on the panel centred at (x, y)
// in CSS pixels of the 1440 wide page, drifting from y to y while it is on screen.
const Z = (pg, cx, a, b, z) => ({ m: [pg, a, b], d: [pg, a, b], z, cx });
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Join free at', stepLabel: 'Stop', typeScale: true, smooth: true, pointBeats: 7,
  introBeats: 12,
  intro: [
    [0, 4, [['big', 'How'], ['huge', '[My Airshow|p:redarrows]', { size: 300, enter: 'slam' }], ['big', 'Hub works']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[Free|p:typhoon]', { size: 380, enter: 'slam' }], ['big', 'for everyone', { enter: 'slam', delay: B / 2 }], ['small', 'Your whole season in one place']], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'A full tour in'], ['huge', '*8 stops*', { enter: 'pop' }], ['mid', 'joining to the drive home']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
    ['Joining', 'About a minute', [
      { lines: [['big', 'Free'], ['big', '*to join*'], ['mid', 'set up in a minute'], ['small', 'You are never asked for card details']], screen: Z('hub-join', 440, 330, 360, 1.7) },
      { lines: [['big', 'Sign in'], ['big', '*your way*'], ['mid', 'email, Google or Facebook'], ['small', 'Wix runs the sign in window, so your password stays private']], screen: Z('hub-join', 1145, 360, 400, 2.4) },
      { lines: [['big', 'One'], ['big', '*login*'], ['mid', 'hub and forum together'], ['small', 'Already on the forum? Just log in']], screen: Z('hub-join', 1145, 470, 500, 2.4) },
    ]],
    ['Overview', 'Your cockpit', [
      { lines: [['big', 'Your'], ['big', '*cockpit*'], ['mid', 'the overview tab'], ['small', 'Shows, countdowns and checks in one place']], screen: Z('hub-overview', 720, 880, 940, 1.2) },
      { lines: [['big', 'Boarding'], ['big', '*pass*'], ['mid', 'countdown to the gates'], ['small', 'Your next show sits at the top']], screen: Z('hub-overview', 475, 1300, 1350, 1.9) },
      { lines: [['big', 'Trip'], ['big', '*readiness*'], ['mid', 'levels out as you tick'], ['small', 'Like the horizon on a flight deck']], screen: Z('hub-overview', 1061, 1310, 1350, 2.3) },
      { lines: [['big', 'Show'], ['big', '*radio*'], ['mid', 'line up news as it lands']], screen: Z('hub-overview', 725, 1710, 1750, 2.4) },
      { lines: [['big', 'Season'], ['big', '*runway*'], ['mid', 'your shows on one line'], ['small', 'With a radar of the shows near you']], screen: Z('hub-overview', 860, 2150, 2200, 1.45) },
    ]],
    ['My|Trips', 'Every show you are going to', [
      { lines: [['big', 'Save a'], ['big', '*show*'], ['mid', 'it gets its own card'], ['small', 'With a countdown and a plan']], screen: Z('hub-trips', 720, 830, 880, 1.25) },
      { lines: [['big', 'Tick'], ['big', '*sheet*'], ['mid', 'tickets, trains, parking'], ['small', 'Nothing to upload, it saves as you go']], screen: Z('hub-trips', 310, 1250, 1300, 2.2) },
      { lines: [['big', 'Show'], ['big', '*updates*'], ['mid', 'changes land here first']], screen: Z('hub-trips', 1093, 1150, 1180, 2.3) },
      { lines: [['big', 'Must see'], ['big', '*aircraft*'], ['mid', 'follow the ones you want'], ['small', 'Confirmed or cancelled, the hub tells you']], screen: Z('hub-trips', 1093, 1330, 1360, 2.3) },
      { lines: [['big', 'Budget'], ['big', '*tracker*'], ['mid', 'one running total'], ['small', 'Tickets, travel, food and camping']], screen: Z('hub-trips', 315, 1600, 1640, 2.4) },
    ]],
    ['Flight|Briefing', 'The day on one screen', [
      { lines: [['big', 'Flight'], ['big', '*briefing*'], ['mid', 'for each saved show'], ['small', "Like a pilot's brief before a sortie"]], screen: Z('hub-briefing', 720, 820, 880, 1.25) },
      { lines: [['big', 'Wind and'], ['big', '*runway*'], ['mid', 'opens 16 days before'], ['small', 'The wind decides which way they take off']], screen: Z('hub-briefing', 417, 1045, 1085, 2.1) },
      { lines: [['big', 'Where'], ['big', '*to stand*'], ['mid', 'picked with the sun'], ['small', 'Display line, crowd line and you']], screen: Z('hub-briefing', 423, 1780, 1820, 2.2) },
      { lines: [['big', 'Camera'], ['big', '*settings*'], ['mid', 'fast jets to helicopters']], screen: Z('hub-briefing', 1017, 1750, 1790, 2.2) },
    ]],
    ['Show|day', 'Leave it open on your phone', [
      { lines: [['big', 'Show day'], ['big', '*mode*'], ['mid', 'flying now and next'], ['small', 'From the flying display page in your programme']], screen: Z('hub-showday', 760, 900, 930, 1.5) },
      { lines: [['big', 'Ear'], ['big', '*defender*'], ['big', '*alerts*'], ['mid', 'before the loudest jets'], ['small', 'And a check on your pre flight list']], screen: Z('hub-overview', 320, 1715, 1750, 2.6) },
      { lines: [['big', 'Updates'], ['mid', 'line up and show news'], ['small', 'Choose what you get told about']], screen: Z('hub-updates', 1091, 1010, 1040, 2.2) },
    ]],
    ['Kit and|group', 'Pack it, share it', [
      { lines: [['big', 'Kit and'], ['big', '*packing*'], ['mid', 'for how you are going'], ['small', 'The list changes with how you go']], screen: Z('hub-kit', 712, 1110, 1150, 1.5) },
      { lines: [['big', 'Tick it'], ['big', '*off*'], ['mid', 'as it goes in the bag']], screen: Z('hub-kit', 320, 1120, 1150, 2.5) },
      { lines: [['big', 'My'], ['big', '*group*'], ['mid', 'share a plan with a code'], ['small', 'Only people with your code see it']], screen: Z('hub-group', 450, 870, 900, 2.0) },
    ]],
    ['After the|show', 'Your airshow year', [
      { lines: [['big', 'My'], ['big', '*hangar*'], ['mid', 'log the aircraft you saw'], ['small', 'Common teal, rare purple, one offs red']], screen: Z('hub-hangar', 1110, 1040, 1070, 2.3) },
      { lines: [['big', 'Airshow'], ['big', '*history*'], ['mid', 'every show you went to'], ['small', 'With your notes and rare visitors']], screen: Z('hub-history', 560, 900, 940, 1.7) },
      { lines: [['big', 'Airshow'], ['big', '*year*'], ['mid', 'an end of season recap']], screen: Z('hub-year', 500, 860, 900, 1.8) },
      { lines: [['big', 'Share'], ['big', '*your year*'], ['mid', 'story cards to share'], ['small', 'Sized for Facebook and Instagram']], screen: Z('hub-year', 725, 1900, 1980, 1.45) },
    ]],
    ['Community|and privacy', 'Your plans stay yours', [
      { lines: [['big', 'Community'], ['mid', 'feed for your shows'], ['small', 'Photos and posts from people going too']], screen: Z('hub-community', 520, 880, 920, 1.8) },
      { lines: [['big', 'My'], ['big', '*posts*'], ['mid', 'your photos and albums']], screen: Z('hub-posts', 720, 900, 940, 1.6) },
      { lines: [['big', 'Private'], ['big', '*by default*'], ['mid', 'only you see your plans'], ['small', 'Free, and your details are never sold']], screen: Z('hub-overview', 720, 860, 900, 1.2) },
    ]],
  ],
  outro: [['big', 'Join'], ['huge', '[the hub|p:redarrows]', { size: 340, enter: 'slam' }], ['big', 'free']],
};
