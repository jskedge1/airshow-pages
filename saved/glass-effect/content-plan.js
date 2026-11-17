// How to plan your 2027 airshow: the eight stops. Wording from the Plan your 2027 airshow page.
const CAMP = { clip: 'cine/camp', clipL: 'cine/campL', n: 77 };
window.FILM = {
  url: 'ukairshowguide.co.uk', readLine: 'Read every stop in full at', stepWord: 'STOP',
  introBeats: 12,
  intro: [
    [0, 4, [['huge', 'How'], ['huge', 'to plan'], ['huge', '_your_']], { stagger: B / 2, exit: 'zoom' }],
    [4, 8.5, [['huge', '[2027|p:typhoon]', { size: 380, enter: 'slam' }], ['big', 'airshow', { enter: 'slam', delay: B / 2 }]], { stagger: B, exit: 'zoom', boom: true }],
    [8.5, 12, [['small', 'Planned in'], ['huge', '*8 stops*', { enter: 'pop' }], ['mid', 'winter to the walk home']], { stagger: B / 2, exit: 'left' }],
  ],
  stops: [
  ['Pick your|shows', 'November to February', [
    { lines: [['small', 'Lock in the big dates first'], ['huge', '[RIAT|p:c17]', { enter: 'slam' }], ['mid', '16 to 18 July']] },
    { lines: [['big', 'Seaside'], ['big', 'shows'], ['mid', 'confirm over the winter'], ['big', '*be patient*']] },
    { lines: [['big', '[Fast jets|p:typhoon]'], ['big', '[Warbirds|p:lancaster]'], ['big', '[Seaside|p:eastbourne]'], ['small', 'Match the show to you']] },
  ]],
  ['Budget|and book', 'January to April', [
    { lines: [['big', 'Early bird'], ['big', 'tickets'], ['big', '*save the most*']] },
    { lines: [['big', 'Book your'], ['big', 'bed first'], ['mid', 'show campsites go fastest']], bg: CAMP },
    { lines: [['big', 'Car park'], ['big', 'passes'], ['big', '*sell out*'], ['small', 'Buy them with your ticket']], pics: ['carrows'] },
  ]],
  ['Plan the|journey', 'Spring, once you have tickets', [
    { lines: [['huge', '[Train|p:train]', { enter: 'slam' }], ['big', '+ shuttle bus'], ['mid', 'beats the car queue']] },
    { lines: [['big', 'Park'], ['big', 'and ride'], ['mid', 'a short walk, but'], ['big', '_a queue after_'], ['big', '_the finale_']], pics: ['carqueue'] },
    { lines: [['big', 'Driving?'], ['big', '*pre book*'], ['big', 'parking'], ['small', 'Follow the route the show sends you']], pics: ['bluecarpark'] },
  ]],
  ['Pack|the kit', 'The week before', [
    { lines: [['big', 'Low'], ['big', 'chairs'], ['mid', 'never block the row behind']], pics: ['chairsfam', 'trolley'] },
    { lines: [['big', 'Sun cream'], ['big', '_and_'], ['big', 'waterproof'], ['small', 'You will often need both']], pics: ['umbrellas'] },
    { lines: [['big', 'Ear', { enter: 'slam' }], ['big', 'defenders.', { enter: 'slam' }], ['big', 'Power bank.', { enter: 'slam' }], ['big', 'Packed lunch.', { enter: 'slam' }]], pics: ['toddler'] },
  ]],
  ['The night|before', 'The evening before the show', [
    { lines: [['big', 'Check the'], ['huge', '[forecast|p:lancaster]'], ['mid', 'and the show news']] },
    { lines: [['big', 'Tickets'], ['mid', 'saved on your phone'], ['big', '*and printed*']], pics: ['pvcheckin'] },
    { lines: [['big', 'Charge'], ['big', 'everything'], ['mid', 'bag by the door'], ['big', '_keys on top_']], pics: ['jackery'] },
  ]],
  ['Arrive|early', 'Show day morning', [
    { lines: [['huge', '[An hour|p:earlycar]'], ['big', 'before'], ['big', 'the gates'], ['big', '*open*']] },
    { lines: [['big', 'Toilets.'], ['big', 'Meeting'], ['big', 'point.'], ['big', '_Your pitch._'], ['small', 'Find them first']], pics: ['loos'] },
    { lines: [['big', 'Walk the'], ['huge', '[static|p:tstatic]'], ['mid', 'while the crews are free to chat']] },
  ]],
  ['Find your|spot', 'Before the flying starts', [
    { lines: [['big', 'Aim for'], ['big', 'the'], ['big', '*centre*'], ['small', 'In front of the commentary box']], pics: ['displayline'] },
    { lines: [['big', 'Check'], ['big', 'the'], ['huge', '[sun|p:sun]'], ['mid', 'or every jet is a silhouette']] },
    { lines: [['big', 'Enclosures'], ['mid', 'a seat, some shade'], ['big', '*short*'], ['big', '*queues*']], bg: { img: 'c:stepladder', imgL: 'l:stepladder', bright: .45 } },
  ]],
  ['Get|home', 'After the finale', [
    { lines: [['big', 'Leaving'], ['big', 'early?'], ['mid', 'go before the finale'], ['big', '*beat the car park*']], pics: ['showlate'] },
    { lines: [['big', 'Staying'], ['big', 'late?'], ['mid', 'keep food back'], ['big', '_let it clear_']], bg: { img: 'c:flyby', imgL: 'l:flyby', bright: .5 } },
    { lines: [['big', 'On the'], ['big', 'train?'], ['mid', 'check the last shuttle'], ['big', '*before the day*']], pics: ['train2'] },
  ]],
  ],
  outro: [['big', 'Plan your'], ['huge', '[2027|p:redarrows]', { size: 380, enter: 'slam' }], ['big', 'airshow']],
};
