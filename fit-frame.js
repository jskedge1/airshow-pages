/* fit-frame.js (8 Nov 2026)
   For pages that stay in a normal Wix HTML box because they talk to page code
   (My Airshow Hub, Volunteer Hub, My Profile, Contact, YouTube).
   It tells the site how tall the page really is, and the airshow-page element in
   the site header grows the box to match. Nothing scrolls inside the box, so a
   finger or mouse wheel never gets stuck on tablets and phones.
   Pinned parts (pop ups, toasts, the phone tab bar) keep using each page's own
   on screen band code, which already copes with a tall box. */
(function () {
  if (window.parent === window) return;

  var lastSent = 0;
  var timer = 0;

  function contentHeight() {
    var body = document.body;
    if (!body) return 0;
    var scrollTop = window.pageYOffset || 0;
    var bottom = 0;
    for (var i = 0; i < body.children.length; i++) {
      var el = body.children[i];
      var cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.display === 'none' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      var end = r.bottom + scrollTop + (parseFloat(cs.marginBottom) || 0);
      if (end > bottom) bottom = end;
    }
    return Math.ceil(bottom + (parseFloat(getComputedStyle(body).paddingBottom) || 0));
  }

  function send() {
    timer = 0;
    var h = contentHeight();
    if (h < 300 || Math.abs(h - lastSent) < 4) return;
    lastSent = h;
    window.parent.postMessage({ source: 'ukag-fit', h: h }, '*');
  }

  function queue() {
    if (!timer) timer = setTimeout(send, 120);
  }

  function start() {
    document.documentElement.classList.add('fit-frame');
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(queue);
      ro.observe(document.body);
      for (var i = 0; i < document.body.children.length; i++) ro.observe(document.body.children[i]);
    }
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style', 'open'] });
    window.addEventListener('resize', queue);
    window.addEventListener('load', queue);
    document.addEventListener('click', function () { setTimeout(queue, 400); }, true);
    // the site may reload its own copy of the box, so say the height again now and then
    setInterval(function () { lastSent = 0; send(); }, 4000);
    send();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
