// Page code for /bus-route (bus route maps).
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/bus-routes/index.html
// Its ID is html12 on the live page (made 30 Oct 2026 by copying Train to Clacton).
// The show pages link here as /bus-route?r=<route id>, for example /bus-route?r=132-duxford.
// This code swaps the embed to that route's page. With no ?r= it shows the list of every route.
//
// "Use my location on the bus": phones won't share a location with the page inside the embed,
// so the embed asks this page instead. It posts {ukag:'geo-start'}; this page reads the
// location every few seconds and posts back {ukag:'geo', lat, lng, acc}. {ukag:'geo-stop'} ends it.
// If the visitor says no, it posts {ukag:'geo-error', code:1}.
import wixLocation from 'wix-location';
import wixWindowFrontend from 'wix-window-frontend';

const ROUTE_BOX = '#html12';
const BASE = 'https://jskedge1.github.io/airshow-pages/bus-routes/';
const EVERY_MS = 4000;

let following = false;
let timer = null;

$w.onReady(function () {
  const id = String(wixLocation.query.r || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  $w(ROUTE_BOX).src = BASE + (id ? id : 'index') + '.html';

  $w(ROUTE_BOX).onMessage((event) => {
    const msg = event.data || {};
    if (msg.ukag === 'geo-start') startFollowing();
    else if (msg.ukag === 'geo-stop') stopFollowing();
  });
});

function startFollowing() {
  if (following) return;
  following = true;
  readLocation();
}

function stopFollowing() {
  following = false;
  clearTimeout(timer);
}

function readLocation() {
  if (!following) return;
  wixWindowFrontend.getCurrentGeolocation()
    .then((place) => {
      if (!following) return;
      const c = place.coords || {};
      $w(ROUTE_BOX).postMessage({ ukag: 'geo', lat: c.latitude, lng: c.longitude, acc: c.accuracy });
      timer = setTimeout(readLocation, EVERY_MS);
    })
    .catch((err) => {
      if (!following) return;
      const code = err && err.code ? err.code : 1;
      if (code === 1) {
        stopFollowing();
        $w(ROUTE_BOX).postMessage({ ukag: 'geo-error', code: 1 });
      } else {
        // a slow or missed fix: keep trying
        timer = setTimeout(readLocation, EVERY_MS);
      }
    });
}
