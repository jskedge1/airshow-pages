# The Big Guide to RIAT (thebigguidetoriat.co.uk)

Rebuilt Nov 2026 as its own site for RIAT27 at MOD Boscombe Down, separate from
The Big Guide to UK Airshows but built from this repo. Navy, teal and red started
on the RIAT guide, so they stay here, with red leading.

| Page | Wix page on thebigguidetoriat.co.uk | Address for the Wix HTML embed |
|---|---|---|
| Overview | / (home) | https://jskedge1.github.io/airshow-pages/riat-guide/index.html |
| Tickets | /tickets | https://jskedge1.github.io/airshow-pages/riat-guide/tickets.html |
| Transport | /getting-there | https://jskedge1.github.io/airshow-pages/riat-guide/getting-there.html |
| Parking | /parking | https://jskedge1.github.io/airshow-pages/riat-guide/parking.html |
| Camping and hotels | /camping-and-stay | https://jskedge1.github.io/airshow-pages/riat-guide/camping-and-stay.html |
| Park & View | /park-and-view | https://jskedge1.github.io/airshow-pages/riat-guide/park-and-view.html |
| Photography | /photography | https://jskedge1.github.io/airshow-pages/riat-guide/photography.html |
| Planning tools | /planner | https://jskedge1.github.io/airshow-pages/riat-guide/planner.html |
| FAQ and first timers | /faq | https://jskedge1.github.io/airshow-pages/riat-guide/faq.html |

- Working project on the `riat-guide-site` branch. Not merged to main, so not live yet.
- Category tab bar across the top of every page (PAGES in site.js). In-page tabs use `data-tabs`; a link to `#panel-id` opens that tab.
- Planning tools (all in site.js, each runs only if its markup is on the page): countdown (#count), saved tick lists
  (`data-store`, kept in the visitor's browser), trip cost planner (#budget), station finder (#station-tool), camera settings helper (#photo-tool).
- Facts come from RIAT's announcements and FAQs; anything from the Fairford years (RIAT26 prices, camping rules) is labelled as such.
- `site.css` styles every page. `site.js` draws the header, menu and footer, and holds the page list.
  To add a page: add a row to PAGES in site.js, then make the Wix page with that slug.
- Inside a Wix embed, links open the matching Wix page in the whole window; opened straight from
  GitHub they go file to file. If a Wix page address changes, change its slug in site.js.
- The home page replaces the old "moving" notice (`../riat-moving.html`) on the RIAT Wix site.
- Photos are shared with the UK site (`../camping-layout/img/`).
- Promotion on the UK site: `riat.html` (hero button and the "My full RIAT guide has its own home" section)
  and the sister site card in `footer.html`.
