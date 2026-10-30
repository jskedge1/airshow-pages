// Page code for /bus-route (bus route maps).
// The page has ONE HTML embed, set to Website address:
//   https://jskedge1.github.io/airshow-pages/bus-routes/index.html
// Its ID must be html1 (click the embed, Properties panel). Change ROUTE_BOX below if it is different.
// The show pages link here as /bus-route?r=<route id>, for example /bus-route?r=132-duxford.
// This code swaps the embed to that route's page. With no ?r= it shows the list of every route.
// Once this page exists, set WIX_PAGE to 'bus-route' in bus-routes.js so the buttons open it.
import wixLocation from 'wix-location';

const ROUTE_BOX = '#html1';
const BASE = 'https://jskedge1.github.io/airshow-pages/bus-routes/';

$w.onReady(function () {
  const id = String(wixLocation.query.r || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  $w(ROUTE_BOX).src = BASE + (id ? id : 'index') + '.html';
});
