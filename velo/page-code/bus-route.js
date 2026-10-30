// Page code for /bus-route (bus route maps).
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/bus-routes/index.html
// Its ID is html12 on the live page (made 30 Oct 2026 by copying Train to Clacton).
// The show pages link here as /bus-route?r=<route id>, for example /bus-route?r=132-duxford.
// This code swaps the embed to that route's page. With no ?r= it shows the list of every route.
// Once this page exists, set WIX_PAGE to 'bus-route' in bus-routes.js so the buttons open it.
import wixLocation from 'wix-location';

const ROUTE_BOX = '#html12';
const BASE = 'https://jskedge1.github.io/airshow-pages/bus-routes/';

$w.onReady(function () {
  const id = String(wixLocation.query.r || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  $w(ROUTE_BOX).src = BASE + (id ? id : 'index') + '.html';
});
