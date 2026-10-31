/* Build Your Kit Calculator link card.
   Use: <ukag-kit-link data-list="photography"></ukag-kit-link> then load this file.
   data-list: photography, camping, food-and-drink or tickets-and-travel (opens that list on the calculator page).
   Shadow DOM, so it cannot clash with the page it sits in. */
(function () {
  if (window.customElements && customElements.get('ukag-kit-link')) return;
  var PAGE = 'https://www.ukairshowguide.co.uk/build-your-kit-calculator';
  var LISTS = {
    'photography': ['Photography Kit', 'Pick your camera brand, tick the bodies, lenses and bags you need and see what it costs new.'],
    'camping': ['Camping Kit', 'Tick your tent, beds and cooking kit, set how many are camping and see the cost before you buy.'],
    'food-and-drink': ['Food And Drink', 'Set who is coming and for how many days, then see the cost of buying at the show or packing your own.'],
    'tickets-and-travel': ['Tickets And Travel', 'Add your tickets, fuel, parking and a room for the night, and see what the whole trip costs per person.']
  };
  var CSS = ':host{display:block;margin:28px 0}' +
    '*{box-sizing:border-box}' +
    'a{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px 18px;align-items:center;background:#F2F7F7;border:1px solid #CBD5DD;border-left:6px solid #32B4AF;padding:16px 20px;text-decoration:none;color:#0B1722;font:400 16px/1.5 Barlow,"Helvetica Neue",Arial,sans-serif;transition:transform .3s ease,box-shadow .3s ease}' +
    'a:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(19,41,60,.14)}' +
    'a:focus-visible{outline:3px solid #6950A1;outline-offset:2px}' +
    '.ic{width:50px;height:50px;border-radius:50%;background:#6950A1;display:grid;place-items:center}' +
    '.ic svg{width:26px;height:26px}' +
    '.tx{min-width:0}' +
    '.tg{display:inline-block;background:#13293C;color:#fff;font-weight:600;font-size:13px;padding:2px 8px;margin-bottom:4px}' +
    'b{display:block;font:800 26px/1.02 "Barlow Condensed",Barlow,"Arial Narrow",sans-serif;color:#13293C;letter-spacing:.01em}' +
    'small{display:block;color:#33475A;font-size:15px;margin-top:3px}' +
    '.go{font-weight:700;color:#D74949;white-space:nowrap}' +
    '.go::after{content:" \\2192";transition:margin .3s}' +
    'a:hover .go::after{margin-left:6px}' +
    '@media (max-width:640px){a{grid-template-columns:auto minmax(0,1fr)}.go{grid-column:2}}' +
    '@media (prefers-reduced-motion:reduce){a,.go::after{transition:none}}';
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h8"/></svg>';
  function Card() { return Reflect.construct(HTMLElement, [], Card); }
  Card.prototype = Object.create(HTMLElement.prototype);
  Card.prototype.connectedCallback = function () {
    if (this.shadowRoot) return;
    var key = this.getAttribute('data-list') || 'photography';
    var l = LISTS[key] || LISTS.photography;
    var root = this.attachShadow({mode: 'open'});
    root.innerHTML = '<style>' + CSS + '</style><a href="' + PAGE + '?list=' + key + '" target="_top"><span class="ic">' + ICON + '</span>' +
      '<span class="tx"><span class="tg">' + l[0] + ' list</span><b>Build Your Kit Calculator</b><small>' + l[1] + '</small></span>' +
      '<span class="go">Open the calculator</span></a>';
  };
  Object.setPrototypeOf(Card, HTMLElement);
  if (window.customElements) customElements.define('ukag-kit-link', Card);
})();
