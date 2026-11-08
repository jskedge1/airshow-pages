/* fit-frame.js (8 Nov 2026)
   For pages that stay in a normal Wix HTML box because they talk to page code
   (My Airshow Hub, Volunteer Hub, My Profile, Contact, YouTube, Groups, the forum,
   Trader Hub, Show Day Live, bus routes, policies).
   It tells the site how tall the page really is, and the airshow-page element in
   the site header grows the box to match. Nothing scrolls inside the box, so a
   finger or mouse wheel never gets stuck on tablets and phones.

   Once the box is tall, anything pinned to the screen (pop ups, toasts, chat box,
   the forum look switch) would sit at the top or bottom of the whole box, off the
   visitor's screen. So the page tracks which band of the box is on screen
   (--vt top, --vh height, --vb gap below) and the pinned parts use that band.
   My Airshow Hub has its own band code (html.in-box), which is left alone.

   A page that holds the real page in an inner frame (forum.html) passes the
   inner frame's height on up. */
(function () {
  if (window.parent === window) return;

  var root = document.documentElement;
  var lastSent = 0;
  var timer = 0;
  var childH = new Map();

  function visibleFrame(f) {
    if (!f.isConnected) return false;
    var cs = getComputedStyle(f);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && !f.classList.contains('off');
  }

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
    bottom = Math.ceil(bottom + (parseFloat(getComputedStyle(body).paddingBottom) || 0));
    childH.forEach(function (h, f) {
      if (!f.isConnected) { childH.delete(f); return; }
      if (visibleFrame(f) && h > bottom) bottom = h;
    });
    return bottom;
  }

  function send() {
    timer = 0;
    var h = contentHeight();
    if (h < 300 || Math.abs(h - lastSent) < 4) return;
    lastSent = h;
    window.parent.postMessage({ source: 'ukag-fit', h: h }, '*');
  }

  function queue() {
    if (!timer) timer = setTimeout(function () { markPins(); send(); }, 120);
  }

  // an inner frame on this page reporting its own height
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.source !== 'ukag-fit' || !(d.h > 0)) return;
    var frames = document.getElementsByTagName('iframe');
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) {
        childH.set(frames[i], d.h);
        frames[i].style.setProperty('height', d.h + 'px', 'important');
        lastSent = 0;
        queue();
        return;
      }
    }
  });

  // ---- on screen band ------------------------------------------------------
  // only parts that really are pinned to the screen get moved; a normal block that
  // happens to share a class name (a "hint" box, say) is left alone
  var PIN_BOTTOM = '.toast,.fl-toast,.bd-chat,.look,.hint';
  var PIN_FULL = '.bd-cardwrap,.fl-modal,.dlg,#ukagx,#fromHub';
  var PIN_TOP = '#ukag';
  var BAND_CSS =
    'html.ff-band .ff-pin-b{margin-bottom:var(--vb,0px)!important}' +
    'html.ff-band .bd-chat.ff-pin-b{max-height:calc(var(--vh,100vh) - 24px)!important}' +
    'html.ff-band .ff-pin-f{top:var(--vt,0px)!important;bottom:auto!important;height:var(--vh,100%)!important;overflow-y:auto}' +
    'html.ff-band .ff-pin-t{margin-top:var(--vt,0px)!important}' +
    'html.ff-band .vis-strip{position:fixed;left:0;width:1px;height:20px;pointer-events:none;visibility:hidden}';

  function markPins() {
    if (!root.classList.contains('ff-band')) return;
    [[PIN_BOTTOM, 'ff-pin-b'], [PIN_FULL, 'ff-pin-f'], [PIN_TOP, 'ff-pin-t']].forEach(function (p) {
      var list = document.querySelectorAll(p[0]);
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        if (el.classList.contains(p[1])) continue;
        if (getComputedStyle(el).position === 'fixed') el.classList.add(p[1]);
      }
    });
  }

  function startBand() {
    if (root.classList.contains('in-box') || !('IntersectionObserver' in window)) return;
    var st = document.createElement('style');
    st.id = 'fit-frame-band';
    st.textContent = BAND_CSS;
    document.head.appendChild(st);
    root.classList.add('ff-band');
    var STEP = 20, seen = {}, strips = [], io = null, raf = 0, lastH = 0;
    function apply() {
      raf = 0;
      var top = Infinity, bot = -Infinity;
      for (var k in seen) { var r = seen[k]; if (r) { if (r[0] < top) top = r[0]; if (r[1] > bot) bot = r[1]; } }
      var H = window.innerHeight;
      if (top === Infinity) { top = 0; bot = Math.min(H, 700); }
      top = Math.max(0, Math.round(top)); bot = Math.min(H, Math.round(bot));
      if (bot - top < 120) { bot = Math.min(H, top + 120); top = Math.max(0, bot - 120); }
      root.style.setProperty('--vt', top + 'px');
      root.style.setProperty('--vh', (bot - top) + 'px');
      root.style.setProperty('--vb', (H - bot) + 'px');
    }
    function build() {
      lastH = window.innerHeight;
      if (io) io.disconnect();
      strips.forEach(function (s) { s.remove(); });
      strips = []; seen = {};
      var th = [];
      for (var t = 0; t <= 20; t++) th.push(t / 20);
      io = new IntersectionObserver(function (list) {
        list.forEach(function (e) {
          var r = e.intersectionRect;
          seen[e.target.dataset.i] = e.isIntersecting && r.height > 0 ? [r.top, r.bottom] : null;
        });
        if (!raf) raf = requestAnimationFrame(apply);
      }, { threshold: th });
      var n = Math.ceil(window.innerHeight / STEP);
      for (var i = 0; i < n; i++) {
        var s = document.createElement('div');
        s.className = 'vis-strip';
        s.setAttribute('aria-hidden', 'true');
        s.dataset.i = i;
        s.style.top = (i * STEP) + 'px';
        document.body.appendChild(s);
        strips.push(s);
        io.observe(s);
      }
    }
    // the box only grows a moment after load, so rebuild when the height changes a lot
    window.addEventListener('resize', function () { if (Math.abs(window.innerHeight - lastH) > 40) build(); });
    build();
    markPins();
  }

  function start() {
    root.classList.add('fit-frame');
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
    startBand();
    send();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
