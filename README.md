# Airshow pages

The live HTML pages for The Big Guide to UK Airshows (ukairshowguide.co.uk).
Each Wix HTML embed is set to "Website address" and points at one of these pages,
so a change saved here shows on the Wix site within a minute or two.

| Page | Address for Wix |
|---|---|
| Royal International Air Tattoo | https://jskedge1.github.io/airshow-pages/riat.html |
| RAF Cosford Air Show | https://jskedge1.github.io/airshow-pages/raf-cosford.html |
| Eastbourne Airshow | https://jskedge1.github.io/airshow-pages/eastbourne.html |
| Duxford Air Shows | https://jskedge1.github.io/airshow-pages/duxford.html |
| Shuttleworth Air Shows | https://jskedge1.github.io/airshow-pages/shuttleworth.html |
| Blackpool Air Show | https://jskedge1.github.io/airshow-pages/blackpool.html |
| Southport Air Show | https://jskedge1.github.io/airshow-pages/southport.html |
| International Ayr Show | https://jskedge1.github.io/airshow-pages/ayr.html |
| Little Gransden Air & Car Show | https://jskedge1.github.io/airshow-pages/little-gransden.html |
| Airshow Photography Hub (live on Wix since 19 Oct, photos in photography-hub-img/) | https://jskedge1.github.io/airshow-pages/photography-hub.html |
| Airshow Photography Hub (previous version) | https://jskedge1.github.io/airshow-pages/airshow-photography-hub.html |
| Camping at Airshows hub (live on Wix since 19 Oct, photos in camping-hub-img/) | https://jskedge1.github.io/airshow-pages/camping-hub.html |
| Show pages, camping style layout (live on Wix since 19 Oct) | https://jskedge1.github.io/airshow-pages/camping-layout/<show>.html |
| New to Aviation Photography | https://jskedge1.github.io/airshow-pages/new-to-aviation-photography.html |
| Airshow News | https://jskedge1.github.io/airshow-pages/airshow-news.html |
| UK Airshow Map (Find your Air Show page) | https://jskedge1.github.io/airshow-pages/airshow-map.html |
| Template: Featured Airshow Webpage | https://jskedge1.github.io/airshow-pages/templates/featured-airshow-webpage.html |
| Template: Airshow Feature Page | https://jskedge1.github.io/airshow-pages/templates/airshow-feature-page.html |

Rules for every page: one self-contained HTML file, Barlow, hidden scrollbar,
collapsible sections, no dashes in copy, no photo credits, images not clickable.

Every page ends with the `mobile-fit` block (between the `<!-- mobile-fit` comments, just before `</body>`).
It keeps the page inside the screen down to 320px wide, which is the width Wix gives an HTML box on phones.
Keep it when copying a template to make a new show page.

## Links between pages

`links.js` is loaded by every page. It holds the list of show pages and their addresses on
ukairshowguide.co.uk, adds the "More air shows" band above Useful links, and makes every link
back to the site open in the main window. Edit that one file to add a show or change an address.
Set `live:false` on a page until its Wix page exists.

| Show | Wix page address |
|---|---|
| Royal International Air Tattoo | /riat |
| RAF Cosford Air Show | /cosfordairshow |
| Duxford Air Shows | /duxfordairshows |
| Shuttleworth Air Shows | /shuttleworthairshows |
| Little Gransden Air and Car Show | /little-gransden-air-and-car-show |
| Eastbourne Airshow | /eastbourneairshow |
| Clacton Air Show | /clactonairshow |
| Wales Air Show | /walesairshow |
| Midlands Air Festival | /midlandsairfestival |
| Blackpool Air Show | /blackpool-air-show |
| Southport Air Show | /southport-air-show |
| International Ayr Show | /international-ayr-show |
| Hampshire Air Festival | /copy-of-template-page-6 (kept off the More air shows band) |
| Airshow Photography Hub | /airshow-photography-hub |
| UK Airshow Map | /airshow-map |
| Airshow News | /airshow-news |
| Find your Air Show | /air-shows-guides |
| Planning your first airshow | /planning-your-first-airshow |
| Camping at Airshows | /camping-at-airshows |

Addresses checked against the live site on 19 Oct 2026.
