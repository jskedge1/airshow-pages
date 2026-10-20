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
| Find your Air Show (live on Wix since 19 Oct: code pasted into the top HTML embed on /air-shows-guides, photos in find-img/) | https://jskedge1.github.io/airshow-pages/find-your-airshow.html |
| YouTube (Wix page /youtube; videos come from youtube/videos.json, refreshed every hour by .github/workflows/youtube.yml and tools-youtube.py. To move a video to another show or topic, edit it in videos.json and set "fixed": true) | https://jskedge1.github.io/airshow-pages/youtube.html |
| Site map footer (goes in an HTML embed in the Wix footer, on every page; holds its own page list, so add new pages to it too; replaced the old About footer on 20 Oct 2026, whose pasted code stays at https://073f6961-6a1c-4313-a30e-a850cc8c3512.filesusr.com/html/a0546b_ef8a36c9e66a9c145f110a95db863b8a.html) | https://jskedge1.github.io/airshow-pages/footer.html |
| Show Day Live (Show Day page, every show with a running order plus the member upload bay) | https://jskedge1.github.io/airshow-pages/show-day.html |
| Show Day Live, one show (Show Day section of a feature show page, change the show at the end) | https://jskedge1.github.io/airshow-pages/show-day.html?show=eastbourne |
| Show Day Live, member's saved shows (My Airshow Hub) | https://jskedge1.github.io/airshow-pages/show-day.html?mode=hub |
| Template: Featured Airshow Webpage | https://jskedge1.github.io/airshow-pages/templates/featured-airshow-webpage.html |
| Template: Airshow Feature Page | https://jskedge1.github.io/airshow-pages/templates/airshow-feature-page.html |

Rules for every page: one self-contained HTML file, Barlow, hidden scrollbar,
collapsible sections, no dashes in copy, images not clickable. No photo credits,
except where the photographer asks for one: Chris Murgatroyd's photos on the Blackpool page carry a
"© Chris Murgatroyd" label on every photo (the `cm-credit` code in camping-layout/blackpool.html).

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

## Find your Air Show page

`find-your-airshow.html` is pasted as code into the first HTML embed on the Find your Air Show page, so the
Wix page code can send it the live show list from the Featured Air Shows collection (`{type:'fas-data', items}`).
Dates, images, filters and descriptions come from that collection; anything it does not hold (map position,
nearest station, usual month, a spare photo) is in `META` at the top of the page script.
Optional collection fields the page already reads: `newTag` (purple New tag), `updatedOn` (Updated tag text)
and `lineupNews` (lines for the Line Up News strip). Members: the page code can send
`{type:'fas-member', loggedIn, saved:[...], been:[...]}` and listen for `fas-save` / `fas-been` messages back.
After changing the file here, paste it into that embed again in the Wix editor.
