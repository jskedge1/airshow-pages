
// ---- Growing boxes (8 Nov 2026) --------------------------------------------
// Pages that must stay in a normal HTML box (My Airshow Hub, Volunteer Hub,
// My Profile, Contact, YouTube) load fit-frame.js, which posts
// { source: 'ukag-fit', h } with their real height. The box is grown to match,
// so nothing scrolls inside it and tablets and phones never get stuck.
const AE_FIT = new Map();

function aeFitBox(frame, h) {
  const comp = frame.closest('[id^="comp-"]');
  if (!comp) return;
  const px = Math.min(Math.max(Math.round(h), 300), 30000) + 'px';
  comp.style.setProperty('height', px, 'important');
  comp.style.setProperty('min-height', px, 'important');
  for (let el = frame; el && el !== comp; el = el.parentElement) {
    el.style.setProperty('height', px, 'important');
    el.style.setProperty('max-height', 'none', 'important');
  }
  frame.setAttribute('scrolling', 'no');
  const sec = comp.parentNode;
  if (sec && parseFloat(getComputedStyle(sec).marginBottom) < 0) sec.style.marginBottom = '0px';
}

function aeFitAgain() {
  AE_FIT.forEach(function (h, frame) {
    if (!frame.isConnected) { AE_FIT.delete(frame); return; }
    const comp = frame.closest('[id^="comp-"]');
    if (comp && comp.style.getPropertyValue('height') !== Math.round(h) + 'px') aeFitBox(frame, h);
  });
}

let aeFitStarted = false;
function aeStartFit() {
  if (aeFitStarted) return;
  aeFitStarted = true;
  window.addEventListener('message', function (e) {
    const d = e.data;
    if (!d || d.source !== 'ukag-fit' || !(d.h > 0)) return;
    if (e.origin !== 'https://jskedge1.github.io') return;
    const frames = document.querySelectorAll('iframe');
    for (let i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) {
        AE_FIT.set(frames[i], d.h);
        aeFitBox(frames[i], d.h);
        break;
      }
    }
  });
  let q = false;
  new MutationObserver(function () {
    if (q) return;
    q = true;
    requestAnimationFrame(function () { q = false; aeFitAgain(); });
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
}
aeStartFit();
