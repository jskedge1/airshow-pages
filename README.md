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
| Airshow Photography Hub | https://jskedge1.github.io/airshow-pages/airshow-photography-hub.html |
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
| RAF Cosford Air Show | /copy-of-template-page-1 |
| Duxford Air Shows | /copy-of-template-page |
| Shuttleworth Air Shows | /copy-of-template-page-5 |
| Little Gransden Air and Car Show | /copy-of-template-page-7 |
| Eastbourne Airshow | /copy-of-template-page-2 |
| Clacton Air Show | /copy-of-template-page-3 |
| Wales Air Show | /copy-of-template-page-4 |
| Hampshire Air Festival | /copy-of-template-page-6 |
| Blackpool Air Show | /blackpool-air-show (page to create) |
| Southport Air Show | /southport-air-show (page to create) |
| International Ayr Show | /international-ayr-show |
| Airshow Photography Hub | /airshow-photography-hub |
| New to Aviation Photography | /new-to-aviation-photography (page to create) |
| Find your Air Show | /air-shows-guides |
