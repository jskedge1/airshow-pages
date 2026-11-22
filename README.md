# Airshow pages

The live HTML pages for The Big Guide to UK Airshows (ukairshowguide.co.uk).
Each Wix HTML embed is set to "Website address" and points at one of these pages,
so a change saved here shows on the Wix site within a minute or two.
Since 30 Oct 2026 no page holds pasted code any more (only the old Template Page and the removed Hampshire page do).

| Page | Address for Wix |
|---|---|
| Royal International Air Tattoo, now The Big Guide to RIAT home page (Wix page /riat shows camping-layout/riat.html; riat.html is kept the same). Since 22 Nov 2026 both are built by `previews/big-guide-to-riat-src/golive.py`, so edit the build scripts, not these files. The old holding page is in backups/riat-holding-page-2026-11-22/ | https://jskedge1.github.io/airshow-pages/camping-layout/riat.html |
| The Big Guide to RIAT pages (What we know, Still to come, Already booked?, Camping, Aircraft line-up), live since 22 Nov 2026, no Wix pages of their own yet so their tabs open these addresses | https://jskedge1.github.io/airshow-pages/big-guide-to-riat/ |
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
| RIAT camping home page: campsite tabs, cards, show maps for Boscombe Down and Fairford, and the "List your campsite" section (no Wix page yet, planned /riat-camping; built by riat-camping-src/build.py) | https://jskedge1.github.io/airshow-pages/riat-camping/index.html |
| RIAT campsite pages, one per campsite (sample.html shows owners what a listing looks like) | https://jskedge1.github.io/airshow-pages/riat-camping/<slug>.html |
| Show pages, camping style layout (live on Wix since 19 Oct) | https://jskedge1.github.io/airshow-pages/camping-layout/<show>.html |
| New to Aviation Photography | https://jskedge1.github.io/airshow-pages/new-to-aviation-photography.html |
| Airshow News | https://jskedge1.github.io/airshow-pages/airshow-news.html |
| UK Airshow Map (Find your Air Show page) | https://jskedge1.github.io/airshow-pages/airshow-map.html |
| Find your Air Show (top HTML embed on /air-shows-guides, by website address since 30 Oct; photos in find-img/) | https://jskedge1.github.io/airshow-pages/find-your-airshow.html |
| YouTube (Wix page /youtube; videos come from youtube/videos.json, refreshed every hour by .github/workflows/youtube.yml and tools-youtube.py. To move a video to another show or topic, edit it in videos.json and set "fixed": true) | https://jskedge1.github.io/airshow-pages/youtube.html |
| Site map footer (goes in an HTML embed in the Wix footer, on every page; holds its own page list, so add new pages to it too; replaced the old About footer on 20 Oct 2026, whose pasted code stays at https://073f6961-6a1c-4313-a30e-a850cc8c3512.filesusr.com/html/a0546b_ef8a36c9e66a9c145f110a95db863b8a.html) | https://jskedge1.github.io/airshow-pages/footer.html |
| Airshow Forum (Wix page /community-forum, real member posts since 3 Nov 2026 through `forum-live.js`, page code `velo/page-code/community-forum.js` on box #html12, backend `backend/forum.web.js`). Opens with a Forum look switch: Clean (default, traders page style) or HUD. forum.html relays the looks' messages (`ukag-forum`) to the page code. Visitors' choice is remembered. | https://jskedge1.github.io/airshow-pages/forum.html |
| Airshow Forum, clean look on its own (loaded by forum.html) | https://jskedge1.github.io/airshow-pages/forum-clean.html |
| Airshow Forum, HUD look on its own (loaded by forum.html; the previous forum.html, unchanged) | https://jskedge1.github.io/airshow-pages/forum-hud.html |
| Show Day Live (Show Day page, every show with a running order plus the member upload bay) | https://jskedge1.github.io/airshow-pages/show-day.html |
| Show Day Live, one show (Show Day section of a feature show page, change the show at the end) | https://jskedge1.github.io/airshow-pages/show-day.html?show=eastbourne |
| Show Day Live, member's saved shows (My Airshow Hub) | https://jskedge1.github.io/airshow-pages/show-day.html?mode=hub |
| Airshow traders directory, the visitor side: trader finder, tips and a link to the trader plans (Wix page /airshow-traders, page code velo/page-code/airshow-traders.js; new layout live 30 Oct 2026, shown by the header element since 30 Oct 2026, so it grows with the page; messages go through #airshowAuto) | https://jskedge1.github.io/airshow-pages/traders/directory.html |
| Trader Hub, trader log in and dashboard (Wix page /trader-hub, page code velo/page-code/trader-hub.js) | https://jskedge1.github.io/airshow-pages/traders/trader-hub.html |
| Trader admin, Jack only (Wix page /trader-admin, members only, page code velo/page-code/trader-admin.js) | https://jskedge1.github.io/airshow-pages/traders/admin.html |
| Admin board, Jack only (Wix page /site-admin, members only, page code velo/page-code/site-admin.js) | https://jskedge1.github.io/airshow-pages/admin/board.html |
| Privacy, cookies and terms (Wix page /policies, linked from the footer). Six policies in one tabbed page in the original Our Policies design (banner photos in policies-img/), built from the text files in policies-src/ by tools-policies.py. The same text is in the CMS collection "UK Air Show Guide Policy's" for the /ourpolicys list page, so change both. | https://jskedge1.github.io/airshow-pages/policies.html |
| Train to Clacton, Greater Anglia train route page (Wix page /train-to-clacton, hidden from the menu; opened by the "Train route details" button in the Clacton page's By train topic; built from train-routes-src/) | https://jskedge1.github.io/airshow-pages/train-routes/clacton.html |
| Clacton by Road, road map and car park page (Wix page /clacton-by-road, hidden from the menu; opened by the "Road map and car parks" button in the Clacton page's Driving to Clacton topic; built in a Claude session from the Clacton by-road preview) | https://jskedge1.github.io/airshow-pages/road-routes/clacton.html |
| Train to Eastbourne, Southern train route page for Airbourne (Wix page /train-to-eastbourne, hidden from the menu; opened by the "Train route details" button in the Eastbourne page's Train to Eastbourne topic; built from train-routes-src/) | https://jskedge1.github.io/airshow-pages/train-routes/eastbourne.html |
| Train to Ayr, ScotRail train route page for the International Ayr Show (Wix page /train-to-ayr still to be made, then add its path to AE_GH_PAGES and a button on the Ayr page; built from train-routes-src/) | https://jskedge1.github.io/airshow-pages/train-routes/ayr.html |
| Train to Cosford, West Midlands Railway train route page with connections for the RAF Cosford Air Show (Wix page /train-to-cosford, hidden from the menu; opened by the "Train route details" button in the Cosford page's Train to Cosford topic; built from train-routes-src/) | https://jskedge1.github.io/airshow-pages/train-routes/cosford.html |
| Train to Cambridge for IWM Duxford, Greater Anglia plus every train that gets to Cambridge, with the free Air Show shuttle (no Wix page yet; planned /train-to-duxford; built from train-routes-src/) | https://jskedge1.github.io/airshow-pages/train-routes/duxford.html |
| Train to Swansea, Transport for Wales and GWR train route page for the Wales National Airshow (Wix page /train-to-swansea, hidden from the menu; opened by the "Train route details" button in the Wales page's Train to Swansea topic; built from train-routes-src/) | https://jskedge1.github.io/airshow-pages/train-routes/wales.html |
| Train to Shuttleworth, Thameslink and Great Northern train route page to Biggleswade for the Shuttleworth air shows, seventeen stations including Gatwick, East Croydon, London Bridge, Blackfriars and Farringdon, plus Greater Anglia from Ipswich, Bury St Edmunds, Norwich and Stansted Airport (in GA red), with the 2027 Shuttleworth shuttle bus times built into each journey, in Thameslink pink (no Wix page yet: opened in a new tab by the "Train route details" button in the Shuttleworth page's train and shuttle bus topics, and by the "Train route and live times" link above its train times; built in a Claude session, not from train-routes-src/) | https://jskedge1.github.io/airshow-pages/train-routes/shuttleworth.html |
| Train to Headcorn, Southeastern train route page for the Headcorn International Airshow, twelve stations across London and Kent in Southeastern blues (no Wix page yet: opened in a new tab by the "Train route details" button in the Headcorn page's Headcorn station topic; built in a Claude session, not from train-routes-src/) | https://jskedge1.github.io/airshow-pages/train-routes/headcorn.html |
| Train to RIAT (Wix page /train-to-riat, hidden from the menu). Since 5 Nov 2026 a short retired notice: RIAT moves from RAF Fairford to MOD Boscombe Down from 2027, so the Swindon, Cheltenham and Kemble plans, bus 76 and bus 77 pages now say so and link to /riat. The old Fairford pages and their train-routes-src files are in backups/riat-fairford-routes-2026-11-05/. Build new route pages once the Boscombe Down travel plan is out | https://jskedge1.github.io/airshow-pages/train-routes/riat.html |
| Airshow Questions and Answers (planning guide, Wix page /airshow-questions, added 30 Oct 2026; built from qa-src/) | https://jskedge1.github.io/airshow-pages/questions-and-answers.html |
| Airshow Security and Bag Searches (planning guide, Wix page /airshow-security, photos in security-img/) | https://jskedge1.github.io/airshow-pages/airshow-security.html |
| Nikon D500 3D Camera Guide (shown inside the Airshow Photography Hub since 30 Oct 2026: the full width "Nikon D500 3D camera guide" tile opens it in a frame on the hub's own page, `d500View()` in photography-hub.html; the page sends its height and its Back to the hub clicks to the hub with postMessage. No Wix page of its own, so links.js keeps it live:false). 3D camera built with three.js from jsDelivr, every control clickable with airshow settings, set up checklist and settings by aircraft | https://jskedge1.github.io/airshow-pages/nikon-d500.html |
| 3D camera guides (19 Nov 2026): one page with a camera picker for eleven bodies (Canon 90D, R7, R5 Mark II; Nikon D500, D7500, Z6III, Z8; Sony A6700; Fujifilm X-H2S; OM System OM-1 Mark II; Panasonic G9 II). Plain unbranded 3D bodies built from each camera's size, every control placed where it sits on the real camera, with airshow advice, a ten step set up tour per camera and settings by aircraft. Opens inside the Airshow Photography Hub from the full width tile (replacing the D500 only guide there); #camera-id or ?camera=id picks a camera. Source data and engine in this repo's history; built as one file | https://jskedge1.github.io/airshow-pages/camera-guides.html |
| Planning guide 1, Which airshow suits you? (Wix page /first-airshow-which-show) | https://jskedge1.github.io/airshow-pages/first-airshow-which-show.html |
| Planning guide 2, Getting there (Wix page /first-airshow-getting-there) | https://jskedge1.github.io/airshow-pages/first-airshow-getting-there.html |
| Planning guide 4, Where to watch (Wix page /first-airshow-where-to-watch) | https://jskedge1.github.io/airshow-pages/first-airshow-where-to-watch.html |
| Planning guide 5, On the day (Wix page /first-airshow-on-the-day) | https://jskedge1.github.io/airshow-pages/first-airshow-on-the-day.html |
| Planning guide 6, Safety and show rules (Wix page /first-airshow-safety) | https://jskedge1.github.io/airshow-pages/first-airshow-safety.html |
| Planning guide 7, What to pack (Wix page /first-airshow-what-to-pack) | https://jskedge1.github.io/airshow-pages/first-airshow-what-to-pack.html |
| Planning guide 8, Where to stay (Wix page /first-airshow-accommodation) | https://jskedge1.github.io/airshow-pages/first-airshow-accommodation.html |
| Food and Drink at Airshows (Wix page /foodanddrinkatairshows) | https://jskedge1.github.io/airshow-pages/food-and-drink.html |
| Visitor Planning Guides (Wix page /visitorplanningguides). Transport design since 3 Nov 2026: the hub for all 13 planning guides, with a route planner by who is travelling, the planning line (guide boxes grouped by stage, which collapse on phones), the show day departure board and checklist. Built with the same source as Planning your first airshow, which became the first timer guide (ticket, four stops, check before you travel) on the same day | https://jskedge1.github.io/airshow-pages/visitor-planning-guides.html |
| Photography Equipment (Wix page /photography-equipment) | https://jskedge1.github.io/airshow-pages/photography-equipment.html |
| Advertise With Us, the one hub for businesses (30 Oct 2026): trader plans ladder, founding places, trader sign up form, advert packages for businesses near the shows, enquiry form (Wix page /advertise-with-us; shown by the header element, so it grows with the page; page code velo/page-code/advertise-with-us.js answers the trader sign up form through #airshowAuto) | https://jskedge1.github.io/airshow-pages/advertise-with-us.html |
| Landing page (Wix page /coming-soon-03) | https://jskedge1.github.io/airshow-pages/landing.html |
| Groups page header (Wix page /groups, above the Wix Groups list) | https://jskedge1.github.io/airshow-pages/groups-header.html |
| Build Your Kit Calculator, four lists (photography by camera brand, camping, food and drink, tickets and travel) each with a budget calculator (Wix page /build-your-kit-calculator made 31 Oct 2026 by copying Questions and Answers, under Visitor Planning Guides in the Site Menu so it shows in the Planning Guides tab, embed html12, path added to AE_GH_PAGES; photos in kit-calculator-img/; `?list=photography`, `camping`, `food-and-drink` or `tickets-and-travel` opens a list; prices are examples to type over) | https://jskedge1.github.io/airshow-pages/kit-calculator.html |
| Public transport to UK airshows, every bus and train route page by show in tabs, with a town search (Wix page /airshow-public-transport made 30 Oct 2026 by copying Train to Clacton, in the Planning Guides menu after Getting There since 2 Nov 2026 (added to the "UK Airshow Guide header menu" custom code and the copied menus on the route pages), embed html12, path added to AE_GH_PAGES; linked from the Public transport section of Getting there and the Public transport card on Visitor Planning Guides. Since 31 Oct 2026 (evening) a square cornered journey planner layout in the style of transport websites, grouped into themed train (station departures sign with a live clock and the train route box), bus (dot matrix destination blind and every bus number button), coach (ticket) and Park and Ride (car park sign) sections, each with its own tips: planner box over the photo (show, starting town, how to travel), a board of the 12 shows, then each show's train, bus, coach and Park and Ride ways in as result cards with Journey, Times (departure board), Route maps and Tips tabs, a My travel plan panel (way in, picked times, checklist, copy and print, kept on the visitor's device), a map and the FAQs. Rebuild with `python3 public-transport-src/build.py` after changing a show page's topics; it reads them from camping-layout/<show>.html. Since 10 Nov 2026 the page wears the sign style tabbed layout from layouts-pt/ (four numbered tabs, UK zone map with airports and coming soon shows, Ways in screen, By air section from layouts-pt/air.json); build.py reapplies it, or run `python3 layouts-pt/apply_pt_layout.py`) | https://jskedge1.github.io/airshow-pages/public-transport.html |
| Plan From Your Door journey planner (7 Nov 2026), one shared script used by the Public Transport page (under the hero, with a show picker that follows the planner box) and the Getting There tab of all 12 feature show pages (`<div class="ukag-jp" data-show="clacton">`, placed above Choose a topic). Visitor types a town or postcode (postcodes.io, free, no key) and gets the likely trains, changes and companies to the show station, then the last leg, with links to National Rail for exact times, Google Maps for the bit from the front door, live departures, the train route page and the show guide. Also shows the lines into each show station and the changes from 14 big cities. Rail map, typical times and last legs live in STA, LINES and SHOWS at the top of the file; preview in previews/journey-planner/ | https://jskedge1.github.io/airshow-pages/journey-planner.js |
| Bus route maps, every route by show (Wix page /bus-route made 30 Oct 2026, hidden from the menu, embed ID html12, page code velo/page-code/bus-route.js; live since 30 Oct 2026, 2800px tall on desktop and 4700px on phones) | https://jskedge1.github.io/airshow-pages/bus-routes/index.html |
| Community, the Community section's own page: sign up and get involved intro, tabs (Every page, Sign up and plan, Chat and share, Watch, Help out, Traders and businesses, Contact) with photo tiles linking to all 12 Community pages, Start Simple Build Up steps, what a free account gets you and a Before You Join FAQ. `?tab=help` (or plan, chat, watch, biz, talk) opens a tab. Wix page /community made 3 Nov 2026 by copying Join The Team, embed comp-mw16b1zz1 by website address, path in AE_GH_PAGES. The "UK Airshow Guide header menu" custom code has ["Community Home","/community"] as the first Community item and its flag set to 1, so the Community tab opens /community (live 3 Nov 2026). The copied menu in bus-routes-src/header-block.html still has the old Community button | https://jskedge1.github.io/airshow-pages/community.html |
| My Profile, one profile for the whole account with tabs: Overview, My Log Ins (every part of the site on the one Wix account, with signed up / not joined yet / waiting), My Airshow Hub, Airshow Forum, Volunteer Hub, Trader Hub and Settings, plus edit profile and photo (saved to the forum profile, so both always match). Wix page /my-profile made 3 Nov 2026 by copying Volunteer Hub, box html1 (1920 tall), page code velo/page-code/my-profile.js, backend velo/backend/profile.web.js (reads hub, forum, team and trader records, writes only through forum.web.js). Live 3 Nov 2026 and now the header log in: the account button (My Profile, or the member's name) opens /my-profile on desktop and phone, My Profile is first in its drop down, and the separate Airshow Forum header button (.fm, F1 COMMS) was removed; Airshow Forum moved into the Community drop down. search/header-search.js places its button before .acct when .fm is missing. Opened on its own it shows an example member | https://jskedge1.github.io/airshow-pages/my-profile.html |
| Join The Team, the volunteer page: how it works, the eight roles, what you get back, a few things I ask and a message builder (Wix page /join-the-team, under Community in the menu; embed html1 by website address) | https://jskedge1.github.io/airshow-pages/join-the-team.html |
| Volunteer Hub, volunteer log in and dashboard (Wix page /volunteer-hub, under Community in the menu, page code velo/page-code/volunteer-hub.js) | https://jskedge1.github.io/airshow-pages/volunteer-hub.html |
| Team Admin, Jack only (Wix page /team-admin, hidden from the menu but listed in the Community extra paths so the menu highlights, members only, page code velo/page-code/team-admin.js) | https://jskedge1.github.io/airshow-pages/team-admin.html |
| How My Airshow Hub works and how to join (Wix page /how-my-airshow-hub-works, live 3 Nov 2026, copied from Join The Team, embed html12 by website address, path in AE_GH_PAGES, under Community in the menu as How The Hub Works; screens in join-img/) | https://jskedge1.github.io/airshow-pages/join-my-airshow-hub.html |
| How The Airshow Forum Works, a walkthrough of joining, groups, posting, Photographer's Corner, buddy board, kit swap and reports (Wix page /how-the-forum-works, live 3 Nov 2026, copied from Join The Team, embed html12 by website address, path in AE_GH_PAGES, under Community in the menu; screens in join-img/forum-*.webp, taken from forum-clean.html with example members) | https://jskedge1.github.io/airshow-pages/forum-how-it-works.html |
| Template: Featured Airshow Webpage | https://jskedge1.github.io/airshow-pages/templates/featured-airshow-webpage.html |
| Template: Airshow Feature Page | https://jskedge1.github.io/airshow-pages/templates/airshow-feature-page.html |

Rules for every page: one self-contained HTML file, Barlow, hidden scrollbar,
collapsible sections, no dashes in copy, images not clickable. No photo credits,
except where the photographer asks for one: Chris Murgatroyd's photos on the Blackpool page carry a
"© Chris Murgatroyd" label on every photo (the `cm-credit` code in camping-layout/blackpool.html).

Jack's design names and rules (22 Nov 2026, for every page from now on):
- **Clean photo tab.** This is Jack's name for the photo cards in "Keep reading" on the Duxford new design preview
  (`html.nz body section.cg-next .cg-tiles` in previews/duxford-new-design-src/new-design.css). Each card is one of Jack's photos
  filling a tall card, with a navy fade at the bottom and the text on the photo: a white title, one short line, and a
  teal "Read more →". On hover the card lifts and the photo zooms in slowly, and both are off for reduced motion. The cards are
  buttons or links, never the photo itself. Use clean photo tabs on every new page wherever a tab or link goes to
  another section or another page, where it suits. When Jack asks for "the clean look", include clean photo tabs.
- No short coloured accent lines under headings, anywhere. Jack says they look AI made.
- Option buttons (pickers, calculators): no border, slightly rounded corners, soft grey, navy when picked, and a smooth hover
  (lift, white, thin navy outline).

Every page ends with the `mobile-fit` block (between the `<!-- mobile-fit` comments, just before `</body>`).
It keeps the page inside the screen down to 320px wide, which is the width Wix gives an HTML box on phones.
Keep it when copying a template to make a new show page.

## Site search (30 Oct 2026)

Header menu fit (3 Nov 2026): a Community menu with more than 7 links becomes a wide two-column drop-down, which stuck out past the menu and made the header think the tabs did not fit, so it switched to the Menu button on every screen. Wix custom code "UK Airshow Guide header menu fit fix" (HEAD) opens wide drop-downs from the 5th tab onwards from the right (`#ukag .m>.it:nth-child(n+5)>.dd.wd{left:auto;right:0}`). Tabs now show from about 1300px wide. Keep this in mind before adding more top level tabs.

A search button sits in the header menu on every page (the magnifier between Community and Airshow Forum, and beside Menu on phones and tablets). It opens a search bar that drops down under the header. The home page has its own search bar in the photo header, under the intro. Both use the same results.

- `search/index.js` is the search itself: the page list plus the engine. Built by `python3 tools-search.py` from the `PAGES` list in that file and the headings on each page, so a search for "toilets" or "park and ride" lands on the page that covers it, with the matching heading shown under the result. Do not edit index.js by hand.
- `search/engine.js` is the matching (words that mean the same, such as rail and train, kids and children, are in `SAME`). tools-search.py joins it onto the page list.
- `search/header-search.js` adds the header button and drop down bar. It also loads `search/sticky-offset.js` (10 Nov 2026), which moves the sticky section bars on pages shown by the airshow-page element down below the fixed site header (#ukag), so they no longer slide under it, and gives jump targets room for the header. It is loaded by the Wix custom code block "UK Airshow Guide header search" (body end, every page), so changes here go live without touching Wix.
- When a new page goes live, add a row to `PAGES` in tools-search.py and run it again. Run it after big heading changes too.
- Shortcut keys in the header search: / or Ctrl K to open, arrow keys to move, Enter to open the page, Esc to close.

## Scheduled tasks (set 30 Oct 2026)

Each task has one job, so no two tasks change the same thing.
- Morning show check, daily 09:01: news (AirshowNews), show details (ShowInfo: dates, gates, flying times, prices, parking) and aircraft line-ups (AircraftParticipation; Fridays only until 28 February 2027, every day from 1 March 2027). In the 14 days before each show it also checks road closures, engineering works, strikes, extra trains, show day buses and car park changes, and fixes that show's page and transport-times.js.
- UK airshow 2027 date checker, Mondays 12:17: dates in uk-airshow-calendar.html and the FeaturedAirshows dates field.
- Weekly visitor facts check, Wednesdays 10:37: timings, tickets, costs, parking, trains, buses, taxis and accessible travel on the pages, bus route pages and the Clacton and Cosford train pages. Accommodation, food, bag rules and venue details on the first Wednesday of each month.
- Weekly debug and fix, Sundays 07:13: script errors, pages that fail to load, phone overflow, dead links and Jack's page rules. Fills AdminChecks. Never changes facts.
- Train to Eastbourne checks, 14:23 on the 12th, January to June 2027, then Mondays in July and August: the Eastbourne train page.
- RIAT confirmed aircraft check, Thursdays 12:05 from February 2027: RIAT aircraft (AircraftParticipation rows with showSlug riat and the RIAT page's own list). The Morning show check never touches RIAT aircraft.

Aircraft line-ups go live after every check (Jack, 20 Nov 2026). Whenever an aircraft check (the Morning show check's line-up job, weekly on Fridays and daily from March, or the Thursday RIAT check) adds, cancels or changes an aircraft, it publishes the Wix rows, updates the line-up built into the show page (the items in `var FALLBACK={type:"aircraftLineup",...}` in camping-layout/<show>.html, plus midlands-air-festival.html for Midlands, matched to each SW_SHOWS `event` by eventName), pushes to main, then opens the live GitHub Pages address to confirm the new aircraft are showing. The same applies when a line-up is updated by hand in a chat.
Every task adds a row to AdminLog for each change. Pull with rebase before pushing, as several tasks push to this repository.

## Train and bus times (29 Oct 2026)

`transport-times.js` holds the train and bus timetable tables for every feature show page (camping-layout/<show>.html, both Midlands versions included). Each page loads it in its head and shows the tables inside the matching Getting There topic (the topic ids, such as `rail` or `bus-74`, are the keys). Edit only the `DATA` block: one entry per show, `checked` date, then per topic a list of tables `{title, rows:[[time, service, details]], note, source:[name, url]}`. No dashes in text, 24 hour times.
Times come from official operator, Network Rail, Traveline and Bus Open Data (DfT) sources. The first set (29 Oct 2026) uses the timetables current now, so they are a guide only: summer 2027 shows fall in the May 2027 timetable, published around March 2027. The Wednesday "Weekly visitor facts check" scheduled task checks timings, tickets, costs, parking, taxis, trains and buses on the feature pages and refreshes these times, with a full timetable refresh every week from March 2027.
Still to fill: nothing major. Full audit of every public transport detail on 29 Oct 2026 (stations, operators, routes, days, stops, links, times). Times still come from the May to December 2026 and December 2026 timetables; replace them with the May 2027 timetables when published. Unconfirmed items are listed in the weekly task report.

## Bus route maps (30 Oct 2026)

Every numbered bus on the feature show pages has its own route page in `bus-routes/<number>-<show>.html` (54 routes, Wales added on 30 Oct 2026), with the list of all of them in `bus-routes/index.html`. Each page shows the roads the bus takes on a map, every stop and the times for the show days, the stop closest to the show in red, how often it runs and the walk from the stop.

Bus touches on each page: a seat moquette panel behind the destination blind, a bus lane strip with a bus that drives across once, departure times as bus tickets, the stop list header as the bus's next stop display, and a bus stop flag on the stop to get off at. The blind shows where the picked direction is going and rolls over when the direction changes (towards the show it shows the show town, or the end of the line "via" the show when the show is partway along). The whole page wears its bus company's colours (`OPCOL` in build.py: colours only, no logos): `ui` takes the place of the site navy for headings, tabs, tickets, the timetable, the stop list and the advice box, `acc` takes the place of the amber buttons, and `op1` to `op3` colour the "Run by" badge, the livery stripe, the seat moquette, the bus in the bus lane strip and the line on the map. The destination blind and the next stop display stay amber, like the real thing, and the stop for the show stays red. The blind's "via" line cycles through the main towns each direction passes, taken from each stop's locality (`python3 stops_loc.py` saves them as raw/<id>.loc.json); `dirvia` in OVERRIDE sets them by hand (132 and X77). "Your stop for the show" shows a red bus stop sign with the stop name, the stop to press the bell after, the walk and when the picked bus gets there; the same red sign marks the stop on the map. Arrow buttons scroll the departure tickets, and a red "Next" tag marks the next bus after the time now when today is the picked day.
"See every time" opens that day's full timetable for the picked direction at the main stops, laid out like the case at a bus stop, with the stop for the show in red.

On the show pages, `bus-routes.js` adds an amber "Route map" box with a "Show route details" button for each bus to the matching Getting There topic (the page calls `UKAG_BR.render(show, topicId)`, just under Map search). Which buses go in which topic is the `T` list in `bus-routes-src/make_map.py`.

While `WIX_PAGE` in `bus-routes.js` is `null`, the buttons open the route page in a new tab. To keep visitors on the site: add a Wix page at /bus-route with one HTML embed (ID html1) set to `https://jskedge1.github.io/airshow-pages/bus-routes/index.html`, paste in `velo/page-code/bus-route.js`, then set `WIX_PAGE = 'bus-route'`.

Layout (30 Oct 2026): the Airshows on a Budget page design with square corners: a cover in the company colour with the seat fabric pattern, the destination blind and a Key details box, the bus lane strip, a sticky jump bar, then Your stop for the show (red bus stop sign, bell push that lights a Bus stopping sign), Pick your bus (LED bus number screen, a bus stop departures screen, day and direction, ticket row, a Your bus panel with a planning slip, and See every time), Route map, The roads it takes, Before you travel and Keep planning.

Site menu: each route page (and the route list) starts with the same menu as the website, copied from the Wix custom code "UK Airshow Guide header menu" into `bus-routes-src/header-block.html` (links point at ukairshowguide.co.uk, the Airshow Hub button is a plain link). If the menu in Wix changes, copy it again. When a route page is shown inside the website, its own menu removes itself.

Getting There buttons: on the show pages each "Show route details" button is in its bus company's colours with the company name, square cornered, inside a white box with an amber edge.

Page layout (30 Oct 2026, final): site menu, a blue top band (destination blind, title, Plan your trip and route map buttons, the live departures screen), the key facts strip and the bus lane, then the feature page section bar (deep navy, sticky, tab widens in the company accent colour on hover and stays lit for the section in view, red reading line with a small bus in the company colours) and six folding sections like the feature pages: Plan your trip (open to start), Route map, Every time, Your stop for the show, The roads it takes, Before you go, with "1 of 6 sections open" and Open all or Close all. Template: templates/bus-route-template.html (earlier designs kept as -v2, -v3 and -v4 files).

On the bus screens (30 Oct 2026): every route page also carries `bus-routes-src/onbus-addon.html`. It swaps the printed blind and the small number screen for an amber dot matrix sign (route number, destination, then the via towns scroll underneath, slowed down on 30 Oct; it wipes across when the direction changes), restyles the departures screen in the bus company's colours with amber times, and adds an "On the bus" section under Pick your bus: the screen inside the bus for the journey picked, with play, back, next, skip to my stop and start again, the stop for the show flagged in red. "Use my location on the bus" follows the phone's GPS to show the real next stop and buzzes when the show stop is next; inside the Wix box, if the phone isn't allowed to share its location there, it offers a link to open the page full screen. After editing the add-on or rebuilding the pages, run `python3 add_onbus.py` in `bus-routes-src/` (it puts the add-on in the template and every route page, replacing any older copy). Preview: previews/bus-route-onbus/.

Live data: each page asks bustimes.org every 30 seconds for the buses out on that route right now (`vehicles.json?service=<sid>`) and their stop times (`/api/trips/<id>/`). The live buses show on the map, and when today is the picked day the departures screen counts down to the next buses using their real expected times, with minutes late or early. With no live data it counts down to the timetable. Nothing needs a key.

Timetables: collect.py fetches the timetables in force on the next Thursday to Sunday from the day it runs, and the pages say the date they were checked. Rerun the steps below every so often (or ask Claude to) to keep them current.

To rebuild after a timetable change (from `bus-routes-src/`): `python3 collect.py` gets stops, times and road lines into `raw/` (delete a route's raw file first to fetch it again), `python3 build.py` makes the pages from `templates/bus-route-template.html` (copied in as template.html), and `python3 make_map.py` remakes `bus-routes.js` and the list page. Routes are in `routes.json`, end names in `ends.json`, bus companies in `operators.json`; show points and advice are `SHOWS` in build.py.
Times use the current timetable (November 2026 dates for each show's days), so replace them with the summer 2027 timetables when they come out in the spring.
The note at the bottom of each route page names the timetable source (Bus Open Data Service through bustimes.org) and OpenStreetMap, as Jack asked on 30 Oct 2026.
No page yet (no buses on any show day in the current timetable): 1 Blackpool, 18 Little Gransden, 7A Duxford, 891 Cosford, 97 Ayr (summer only). Wales has no numbered routes on its page, so no buttons there.

## Seafront Information map and tides (27 Oct 2026)

The six seafront show pages (camping-layout/eastbourne, clacton, southport, blackpool, ayr and wales) have the "Coastal command" block at the top of Seafront Information: the `<sf-command data-show="...">` element, defined by the `seafront-command` script at the end of each page. It holds its own styles inside a shadow root, so it can't clash with the page. It shows the satellite map (camping-layout/img/sf-map-<show>.webp, imagery © Esri, Maxar, Earthstar Geographics, credit kept in the map corner), Pick Your Pitch, the 2027 show day tide chart, the beach side view, the sea wall answer, springs or neaps, the beach facts and Jack's tip. It replaced the old Pick Your Pitch and Tides And The Beach tabs; the tabs below now start at Sea Mist And Wind.
Show day tide times are worked out from a tide model checked against published tables, so they are approximate (about half an hour). Blackpool, Southport and Wales use expected dates until 2027 is confirmed: change the dates in the block's data and re-run the tide numbers when they are announced.

## AI generated guide images

`guide-img/` holds the AI generated guide images (made in Canva, 26 Oct 2026). Every one used on a page carries a caption saying what it shows, ending "AI generated for a visual look." Copies used on pages sit in that page's own image folder (first-airshow-img/, camping-hub-img/, photography-hub-img/, security-img/). The originals are in the Canva design "Blank landscape photo canvas". Added 27 Oct 2026 (pages 31 to 39 of that design): gate-queue, bag-check and wand-check (security guide), kids-cockpit, shade-seating, plus food-court and toilets (facilities boxes on the show pages, as fac-*.webp in camping-layout/img/), check-before-travel (first airshow page), and night-before, calm-visit and getting-home, saved ready for those guides when they are built. Pages 40 and 41: paying-stall and banned-items-gate, on the Paying and Banned items boxes of the historic show pages. Page 42: duxford-shuttle-minibus, in the "Duxford's own shuttle" band on the Duxford page. Page 43 (30 Oct 2026): coffee-shop, the café in the Featured Partner example advert on the Advertise With Us page. Page 44: contrail-prints-logo, the made-up logo in the trader advert example on the same page.

## Line-up photos for confirmed aircraft

Every show page's aircraft line-up puts a small photo (not clickable) beside each aircraft. A row gets a photo from the page's own photos first, then from `lineup-photos.js`, then from the built-in list in the page's `lu-lib` block.

To add a photo for a newly confirmed aircraft, do it once in `lineup-photos.js` and every feature page picks it up:
1. Find the photo in Jack's Google Drive, Mac or hard drives (Jacks Drive, T7). Use another photographer's photo only with their name as the credit (4th value), e.g. Chris Murgatroyd.
2. Save a 240 x 140 webp, cropped on the aircraft, as `camping-layout/img/lu-<type>.webp`.
3. Add a line to `window.LU_EXTRA`: pattern, photo address, alt text, credit ("" for Jack's own).

Added 27 Oct 2026: Westland Lysander (Jack's photo of the Lysander on display at Old Warden, IMG_9128 on Jacks Drive). Still needed: Hawker Fury (Midlands Air Festival), no photo found yet.

## Kit calculator link cards (31 Oct 2026)

`kit-link.js` draws a `<ukag-kit-link data-list="...">` card (shadow DOM) that opens the Build Your Kit Calculator on the matching list. It sits on the Photography Hub and Camping hub (above Where To Buy Your Kit), Food and Drink (above Your Flight Plan), Getting There and Accommodation (above Our view), Planning your first airshow (above Keep Reading) and Visitor Planning Guides (above Good to know). The home page has its own Kit Calculator tab and band (`#kit`).

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
| Wales National Airshow | /walesairshow |
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
| Airshow Security and Bag Searches | /airshow-security |
| Airshow Questions and Answers | /airshow-questions |

Addresses checked against the live site on 19 Oct 2026.

## Site-wide airshow-page element (Wix Velo file public/custom-elements/airshow-page.js)

A custom element in the site header turns every full-width guide box into normal page content, so the page
grows with the guide and scrolls like the rest of the site on phones. It converts boxes holding pasted code
and, since 30 Oct 2026, boxes pointing at the GitHub pages listed in `AE_GH_PAGES` inside that file.
`traders/directory.html` was added to `AE_GH_PAGES` on 30 Oct 2026. Edits on 30 Oct 2026: `traders/directory.html` and `advertise-with-us.html` convert whatever their box size (`anySize`), the `pagemessage` events bubble so page code hears them, and the element finds the guide again with `querySelector` if its saved reference is lost. Pages shown this way sit inside the site's own address, so image paths in them must be full `https://jskedge1.github.io/airshow-pages/...` addresses, not relative ones. The converted page only appears once the visitor scrolls or taps, because Wix starts the header element then. Pages shown this way talk to page code through the header element (#airshowAuto: `on('pagemessage')` in, `setAttribute('message', JSON)` out), not through the HTML box.
When a new full-page guide is added to Wix by website address, add its path to `AE_GH_PAGES` too,
or it will sit in a fixed-height box and won't scroll properly on phones. Changes to the element go live when the site is published.
Planning your first airshow, Airshow Security, Weather and will it fly and Headcorn were added to the list on 30 Oct 2026 (evening).
The train route pages (Clacton, Eastbourne) were added on 30 Oct 2026 late evening, after the element was changed to run neighbouring
inline scripts together (so `var CFG` from one script reaches the next) and to copy non-font stylesheets inside the guide.
The template passes the map element to Leaflet (`L.map(document.getElementById('map'), ...)`), which is needed for that. New train pages
(Cosford, Wales, RIAT) only need their path adding to `AE_GH_PAGES` once they have a Wix page.
On 2 Nov 2026 every train route page was added to `AE_GH_PAGES` (wales, ayr, headcorn, cosford, riat, riat-kemble, riat-cheltenham), saved in the editor; it goes live the next time the site is published. Until then the Swansea page sits in its 7100 px box and scrolls inside it.
If a guide cannot load (an error, or longer than 15 seconds), the element leaves the normal HTML box in place.
The full-width check compares each box with its own section as well as the window, because an iPad can zoom the page out.
The site footer box (comp-mvf3v9rt) must stay stretched to the screen: when it was a fixed 1878px it made pages 1445px wide on iPads.

## Find your Air Show page

`find-your-airshow.html` is pasted as code into the first HTML embed on the Find your Air Show page, so the
Wix page code can send it the live show list from the Featured Air Shows collection (`{type:'fas-data', items}`).
Dates, images, filters and descriptions come from that collection; anything it does not hold (map position,
nearest station, usual month, a spare photo) is in `META` at the top of the page script.
Optional collection fields the page already reads: `newTag` (purple New tag), `updatedOn` (Updated tag text)
and `lineupNews` (lines for the Line Up News strip). Members: the page code can send
`{type:'fas-member', loggedIn, saved:[...], been:[...]}` and listen for `fas-save` / `fas-been` messages back.
Since 30 Oct 2026 that embed loads this file by website address, so changes here go live on their own.
The page code messages still reach it the same way.

## Show Day Live

`show-day.html` is the show-day board: Now Flying with Next Up, Ear Defender Alert, Sky Compass, Live Radar
(standby until tracking is added), Crowd Reports, and the member upload bay underneath.
It reads the Wix collections through the page code (`velo/page-code/show-day-board.js`) and the backend
web module (`velo/backend/showday.web.js`):

- `FlyingProgrammes`: one item per show day. `showId` (riat, cosford, duxford, eastbourne, clacton, wales, midlands,
  shuttleworth, little-gransden, southport, blackpool, ayr, headcorn), `dayLabel`, `showDate`, `live`,
  and `running.acts` as a list of `{start, end, name, loud}`. Untick `live` to hide a day.
- `ProgrammeUploads`: member photos of the flying display page. Since 21 Oct 2026 every upload is checked automatically
  before it goes live: the airshow (the page must not name a different show), the date (the show is on today by
  Show Info or the featured list dates, the photo was taken today, any day named on the page is today), the location
  (the phone, asked through the page code, or the photo's own location is within a few km of the crowd line) and that
  it is a flying display page (at least 4 display times read on the phone). All four pass: status `Live` and it shows
  on the board as Flying Display From The Crowd for that show, today only. Any fail: status `Held`, never shown, kept
  for Jack. Two member flags, or the sender's own flag, set `Reported` and take it off. The `checks` field records why.
  Show days are read live from Show Info (`dateText` and the Duxford and Shuttleworth `events` list) and the
  featured list `dates`. The daily show details task and the weekly 2027 date checker (which since 21 Oct 2026 adds
  new dates to `uk-airshow-calendar.html`, FeaturedAirshows and Show Info on its own) keep these filled, so nothing
  needs adding by hand. `EXTRA_SHOW_DAYS` in `showday.web.js` is only for a one off extra day. Test page: `previews/show-day-harness.html` (add `?photo=1` to see the crowd photo).
- `CrowdReports`: members' car park, toilet and queue reports. Only the last 45 minutes show.

My Airshow Hub has a Show Day tab that loads `show-day.html?mode=hub` and passes its messages through the hub box
(`velo/page-code/my-airshow-hub-showday.js`). The hub's dark glass look is the `hud-theme` block before `</head>`
in `my-airshow-hub.html`; delete that block to go back to the white look.
Since 21 Oct 2026 the `hubEmbed` box on /my-airshow-hub loads `my-airshow-hub.html` by website address, so changes here go live on their own.
Logged-out visitors see the HUD login page (the `#guest` block, 21 Oct 2026): typing title, blue HUD login card, Pilot note, My Airshow Hub and Airshow Forum tabs, and Inside the hub (Typhoon tools, pop-out screen, phone). Its Log in and Join free buttons play `hub-img/hub-cleared.mp3`, show the tower screen, then click hidden `data-act="login"` / `data-act="signup"` buttons, so the Wix members window opens through the page code as before. The start up sound is `hub-img/hub-start-up.mp3` and the header jet is `hub-img/red-arrows-hawk.webp`. Logged-in members get a green Airshow Forum tab at the end of the hub tab bar.
The hub's photos are files in `hub-img/`. Tabs added on 21 Oct: Overview (inbound radar), Flight Briefing (wind, likely runway, hour by hour
weather from Open-Meteo, where to stand, must see slots from the Show Day running orders, camera settings), My Hangar (backend
`velo/backend/hangar.web.js`, collection `MemberHangar`; rarity comes from how many show line ups list the aircraft), My Airshow Year
(story cards) and Share A Photo in My Posts (reads the camera settings from the file and posts through the forum gallery upload).

## Airshow traders (Phase 1, 25 Oct 2026)

Small businesses list themselves on /airshow-traders, Jack checks each listing on /trader-admin, and traders keep their
own listing up to date on /trader-hub. All three pages talk to `velo/backend/traders.web.js` through their page code
(postMessage, source `ukag-traders`). Collections, admin-only like the hub ones: `Traders` (one item per business; approved
fields, plus `pending` for changes waiting for Jack, `status` pending, live, sentBack or paused) and `TraderShows`
(one item per trader per airshow; changes go live straight away). A listing sent before the trader makes an account is
linked the first time they log in with the same email. Photos upload to the Media folder /traders/<slug>.
Opened on their own (not inside Wix) the three pages show example data so the design can be checked.
Phase 2: Wix Pricing Plans (plans set up but switched off until Jack says go), show day updates, offers, messages and emails.

Wix editor setup for the traders pages (done 25 Oct 2026, saved, not published):
- /airshow-traders, /trader-hub and /trader-admin are hidden from the menu. /trader-admin is set to site members only.
- Each page has one HTML embed with ID html1, stretched full width, H 1000, Y 360, inside a section set to H 1020 (the section must be taller than the embed or the footer sits on top of it).
- Page code from velo/page-code is pasted into each page, and velo/backend/traders.web.js is the backend web module traders.web.js.
- To try it without publishing, use Test Site in the editor. Click Test Site again after each save, and add a new &v= to the address if the old layout still shows.

## Traders at this show (28 Oct 2026)

Every feature show page (camping-layout/<show>.html) has a "Traders at this show" block in Food and facilities, just
above the drop downs: `<ukag-show-traders data-show="cosford" data-name="RAF Cosford Air Show">`, drawn by `traders-block.js`
(shadow DOM, so it can't clash with the page). It shows the approved Airshow Traders listings booked for that show, food and
drink first and Headliners leading, in a sideways rail (arrows and swipe) so the page height stays the same however many
traders join. Data comes from the public feed `https://www.ukairshowguide.co.uk/_functions/showTraders?show=<id>`
(`velo/backend/http-functions.js`, which calls `getShowTraders` in `traders.web.js`). Show ids match the backend SHOWS list
(gransden.html uses little-gransden; Headcorn has no traders list yet). If the feed can't be reached or nobody has listed the
show, a short "first traders are on their way" note shows instead. Add `?tdemo=1` to a page address to check the layout with
example traders; visitors never see those.

## Volunteer team (3 Nov 2026)

Volunteers ask to join on /join-the-team, log in to /volunteer-hub to send their work, and Jack checks it on /team-admin.
The hub and admin pages talk to `velo/backend/team.web.js` through their page code (postMessage, source `ukag-team`) by way of
`team-api.js`. Opened anywhere but the Wix site, `team-api.js` answers from the example data in `team-demo.js`, so the design can
be checked, and the two pages share it in the browser (send something as Sam in the hub and it shows in the admin queue).
Logged in members who are not on the team see an Ask to join form; once Jack switches them on in Team Admin, the hub opens up.
Photos are made smaller in the browser (2000px, JPG) and upload one at a time to the Media folder /team/<member>. Video goes in as a link.
Collections, admin only for reading and writing (the backend uses suppressAuth and checks who is asking):
- `TeamVolunteers`: memberId, email, name, first, link, bio, roles (array), shows (array), status (waiting, active, paused), team (shown on Meet the team), applied (their message), joined (date)
- `TeamWork`: memberId, kind (photo, video, review, tips, arrivals, social), title, show, day (YYYY-MM-DD), status (sent, checking, live, change, removal, no, gone), page (where it went live), msg (Jack's change note), imgs (array of Wix image addresses), n, text, link, where, sentDate, decidedDate
- `TeamRequests`: title, show, kind, detail, sort (number). These show as What I need right now on every volunteer's overview.
- `TeamNotes`: who ("all" or a memberId), text
- `TeamLog`: text, at (date). Jack's main decisions also go into `AdminLog` (area Volunteers, source Team admin).
Wix editor setup: each page has one HTML embed with ID html1 set to the address in the table above, stretched full width, inside a
section taller than the embed. /team-admin is set to members only. Backend web module team.web.js from velo/backend/team.web.js.
The site footer and site search do not list these pages yet: add Join The Team and Volunteer Hub to footer.html (About) and
tools-search.py (Community) once the site has been published with the new pages.

## Admin board (30 Oct 2026)

`admin/board.html` is Jack's admin board in the Departures Board design: Departures (plans), Arrivals (sign ups),
Flight Records (weekly log), Hangar (ideas) and Gate Checks (pages), with the live UK clock, site status and
Publish and Take offline buttons. It shows on the Wix page /site-admin (hidden from the menu, members only) and talks
to `velo/backend/admin.web.js` through the page code `velo/page-code/site-admin.js` (postMessage, source `ukag-admin`).
Every request checks the Admin role. Opened on its own the page shows example data only.

Live figures come straight from the site: Members/PrivateMembersData, ForumProfiles, ForumThreads, ForumPhotos,
MemberTrips, Traders, CrowdReports, ProgrammeUploads (Held), ContactMessages and contactForm, plus forum items with reports.
The board's own collections, admin only for reading and writing:
- `AdminPlans`: title, detail, due (NOV, DEC, JAN, FEB, MAR, SPRING, WINTER, LATER), gate (area), status
  (Scheduled, Boarding, Delayed, Departed), sort, doneOn (YYYY-MM-DD), fromIdea.
- `AdminIdeas`: title, detail, area, status (standby or scheduled), votes, addedBy.
- `AdminLog`: title (what changed), logDate (YYYY-MM-DD), type (Updated, Changed, Added, Fixed, Searched, Published),
  area, source (who logged it, for example "Claude chat" or the scheduled task name), link.
- `AdminChecks`: one row per page: title, wixPath, pageUrl (file here), desktop, mobile, tablet (Clear, Check or
  Not checked), links, photos, lastChecked, nextCheck, notes, sort.
Preview Studio (30 Oct 2026): `studio/index.html` (https://jskedge1.github.io/airshow-pages/studio/) is Jack's own preview site, shown on a members only page of The Big Guide to RIAT that only his account can open, and not linked from the public site. Light site style. Views: #overview (stats, days to go for the 2027 shows, go live progress, latest changes), #live (every live page, the LIVE list in the file: add new pages there), #not-live (from `admin/unpublished.json`), #timetable and #activity (changes from the public GitHub API). Each page works in a desktop, tablet, phone or all three frame, with its change history, a go live checklist and notes (kept in the browser) and an Ask Claude for a change box.
Two more tabs (30 Oct 2026): Not Live Yet lists every page made but not on the website, from `admin/unpublished.json` (keep it in step with the Future pages and Idea pages tabs of the site pages hub). Pages with a `file` preview inside the board at desktop, tablet or phone width; pages that only exist as Claude previews (`art`) open in a new tab. Timetable shows when each scheduled check runs next and what it looks after.
Flight Records also lists every commit to this repository from the last six weeks (read from the public GitHub API in the
browser, no key needed), so page changes log themselves. Commit messages read best as "Area: what changed".

Scheduled tasks and Claude chats add a row to AdminLog whenever they change something on the site, and the Sunday
"Weekly debug and fix" task fills in AdminChecks. The Friday 14:19 weekly report is written from the same collections.

Optional secrets in the Wix Secrets Manager: `ukagApiKey` (a Wix API key with site permissions) turns on the site status,
form sign up counts and the Publish button; `ukagAccountId` (the Wix account ID) is also needed for Take offline.
Without them the board still works and those parts say so.

Wix editor setup: page /site-admin, hidden from the menu, Permissions set to members only; one HTML embed with ID html1
set to the address above, stretched full width, H 1000, inside a section taller than the embed; page code from
velo/page-code/site-admin.js; backend web module admin.web.js from velo/backend/admin.web.js.


To rebuild only some routes: in bus-routes-src, `template.html` is a copy of any built route page with its `var CFG=...;var DATA=...;` swapped for `/*DATA*/` (every route page is identical apart from that). Run `python3 collect.py <ids>`, `python3 stops_loc.py`, `python3 build.py`, then copy `out/<id>.html` into bus-routes/ and add the show to `MAP` in bus-routes.js and to bus-routes/index.html (make_map.py rewrites both from raw/, so only run it once every route's raw data is there).

## Train route page (Clacton)

`train-routes/clacton.html` is the train version of the bus route pages, in Greater Anglia colours (colours only, no logos). It covers Greater Anglia trains only, from eight hub stations (London Liverpool Street, Stratford, Chelmsford, Colchester, Ipswich, Norwich, Cambridge and Southend Victoria), to Clacton and back, Thursday and Friday, with any changes. Parts: a live departure board with an Arrivals at Clacton tab, the railway strip (stations of the picked journey, six UK four aspect signals, doors opening at each stop), the Your journey line with live times at each station, station cards, the planner, the route map along the real track, The line it takes, and Before you travel (last train home and fares for the picked station).

Live times come from the public National Rail live boards through huxley2.azurewebsites.net (national-rail-api.davwheat.dev as a spare). No key is needed. When neither answers, the board and the journey line show the timetable.

To rebuild after a change: edit `train-routes-src/template.html`, `clacton-cfg.json` (text, colours, fares) or `clacton-data.json` (stations, line shapes, journeys), then run `python3 build.py` in `train-routes-src/`. The times are the November 2026 timetable; refresh them when the summer 2027 times are out.

The page lives on the Wix page /train-to-clacton (hidden from the menu, one HTML embed set to the address above, stretched full width and 6600 tall on desktop like the other pages (the page uses its desktop layout from 980 wide), and 320 x 12300 on mobile, sized for the tallest journey (Cambridge, two changes) with the footer pinned to the bottom of the box, so shorter journeys leave a gap above the footer and nothing is ever cut off; if the page grows, measure the tallest journey again and raise both). The Clacton page (`camping-layout/clacton.html`) shows a "Train route details" button in the By train topic that opens /train-to-clacton. The "Your train" panel and "Save on your tickets" both link to the Greater Anglia website for tickets.

## SEO (30 Oct 2026)

Every page file that sits inside a Wix page carries the same title and description as that Wix page, a canonical link to its ukairshowguide.co.uk address and matching share tags, between the `<!-- seo -->` comments. That way search engines credit ukairshowguide.co.uk and not jskedge1.github.io. Templates, admin pages, hub badges and the footer are marked noindex. Bus route pages have no Wix page yet, so they keep their own address with a title and description; once the /bus-route Wix page exists, point them at it. `tools-seo.py` writes all of this; change its `W` list when a page's SEO changes in Wix, then run it.

## Redirects and tidy up (30 Oct 2026)

Redirects set in Wix (SEO Redirects API, live straight away): /photography-equipment to /airshow-photography-hub (the old page no longer exists but the menu and footer still link to it), /inquiry-services-page to /contact-us and /project-4 to the home page (both leftover Wix template pages), /copy-of-template-page-6 (the removed Hampshire page) to /air-shows-guides, /blog (empty Wix blog) to /airshow-news, /ourpolicys to /policies, and /copy-of-template-page-7 plus /littlegrandsenairandchraityshow to /little-gransden-air-and-car-show. Delete a redirect in Wix (Marketing and SEO, URL Redirect Manager) to bring the old page back.
An empty HTML box (#html2) sat over the top of /visitorplanningguides; it was deleted in the editor.
/bus-route was published on 30 Oct 2026 and WIX_PAGE in bus-routes.js is now 'bus-route', so the Show route details buttons open the route on the site.

## Train route page (Eastbourne)

Added 30 Oct 2026. Same template and features as the Clacton page, in Southern colours (green on a deep green charcoal). `train-routes-src/build.py` now builds every `<show>-cfg.json` + `<show>-data.json` pair (`python3 build.py eastbourne` for one) and keeps each page's SEO block. The template reads anything show or operator specific from the `x` and `lines` parts of the cfg, with Clacton's values as the defaults, so the Clacton page is unchanged.
- Trains: Southern into Eastbourne, plus Thameslink and Gatwick Express where they connect (live boards filter on SN, TL and GX). Ten stations: London Victoria, Clapham Junction, East Croydon, London Bridge, St Pancras, Gatwick Airport, Brighton, Hastings, Ashford International and Portsmouth & Southsea.
- All four show days, Thursday to Sunday, each with its own timetable (`days` per hub in the data; the template's `HD()` picks the day). Eastbourne is not the end of the line, so the page says when a train carries on to Hastings or Ore.
- Refreshing the times: `train-routes-src/eastbourne-tools/update.sh <Thursday date>` scrapes the four days from traintimes.org.uk, rebuilds the journeys, fares and data, and only redraws map lines if a new stretch of line appears. Then update the dates in the cfg `note` and the fares in the cfg from `fares.json`, run `python3 build.py eastbourne`, run the height check and commit.
- Wix: page /train-to-eastbourne, hidden from the menu, one HTML embed set to the address above, stretched full width on desktop and 320 wide on mobile, sized for the tallest journey (desktop about 7100, mobile about 13200; measured 30 Oct 2026). If the page grows, measure again and raise both.
- Checks booked: a full timetable and page check in January 2027, then monthly to June, then weekly through July and August up to the show (12 to 15 August 2027).

## Train route page (Cosford)

Added 30 Oct 2026. Same template as Clacton and Eastbourne, in West Midlands Railway colours (gold #E8891C and purple #3C1053 on deep purple #2A1438, no logos). The template's train door colour now follows `--op1` (Clacton unchanged).
- Trains: every journey ends on the hourly West Midlands Railway Birmingham to Shrewsbury train that stops at Cosford. Unlike Clacton and Eastbourne, connections from any operator are included where they work well (Avanti, CrossCountry, Transport for Wales, London Northwestern). Twelve stations: Birmingham New Street, Wolverhampton, Shrewsbury, Telford Central, London Euston, Manchester Piccadilly, Crewe, Stafford, Coventry, Cardiff Central, Leeds and Nottingham. Liverpool and Bristol were left out (always three trains, or no sensible morning arrival).
- Show day only (Sunday). Times are from Sunday 8 November 2026 as a stand in; in that timetable the first train reaches Cosford at 09:02. Refresh with the summer 2027 Sunday times when they are out (spring 2027).
- Refreshing: `train-routes-src/cosford-tools/` (scrape.py, journeys.py, build_data.py, fares.py, geo.py; set the date in dates.json). Map lines come from OpenStreetMap railway and train route relations listed in `rels.json` (download with the OSM API, not kept in git); station positions in `stops_osm.json`.
- Wix: page /train-to-cosford, hidden from the menu, copy of Train to Clacton, one HTML embed set to the address above, 7100 tall on desktop and 13500 on mobile (tallest measured 7032 and 13456 on 30 Oct 2026). The Cosford page (`camping-layout/cosford.html`) shows a "Train route details" button in the Train to Cosford topic.

## Train route page (Wales National Airshow, Swansea)

Rebuilt 2 Nov 2026 in the v2 layout (see "Train route pages in the Blackpool layout"), in Transport for Wales red with charcoal. Covers every main line into Swansea, with any operator where the change works (GWR, Transport for Wales, CrossCountry, South Western Railway, West Midlands Railway, Avanti West Coast); journeys that need a walk between stations are left out.
- Twenty stations: London Paddington, Reading, Swindon, Bristol Parkway, Bristol Temple Meads, Newport, Cardiff Central, Bridgend, Llanelli, Carmarthen, Milford Haven, Manchester Piccadilly, Chester, Shrewsbury, Hereford, Llandrindod (Heart of Wales line), Birmingham New Street, Gloucester, Southampton Central and Exeter St Davids. Saturday and Sunday, each with its own timetable. Journeys up to 5.5 hours are kept.
- Times are from Saturday 7 and Sunday 8 November 2026 as a stand in. Refresh with `train-routes-src/wales-tools/update.sh <Saturday date>`, then update the cfg note and fares and run `python3 build.py wales`. Map lines come from the OpenStreetMap relations in `fetch_osm.sh`; a few short stretches (North Downs line, Chester to Crewe, Worcester) are drawn station to station.
- Wix: page /train-to-swansea, hidden from the menu. The Wales page (`camping-layout/wales.html`) shows a "Train route details" button in the Train to Swansea topic.

## Train route page (RIAT, with the shuttle bus)

Retired 5 Nov 2026: RIAT moves to MOD Boscombe Down from 2027, so this page and its cfg, data and tools now live in backups/riat-fairford-routes-2026-11-05/ and train-routes/riat*.html are short notices. The shuttle bus feature stays in the template for when the Boscombe Down travel plan is out. The notes below describe the old Fairford page.

Added 30 Oct 2026. Same template, in GWR greens (#1F8A5B, gold #C9A44C, dark #0E2B24, no logos). RAF Fairford has no station, so journeys end at Swindon and the template's new shuttle bus feature covers the last leg.
- Shuttle bus feature (template, only switches on when the cfg has a `bus` block, so the other train pages are unchanged): its own road styled section "The Swindon Shuttle" after Pick your train (tarmac road, bus stop flags, a bus that drives along, an orange bus blind), a connection card worked out from the picked train (walk to Stop N, the next shuttle, arrival at the Yellow entry; or on the way home, the latest shuttle that makes the train), the full shuttle timetable as chips with the matching one picked out, a yellow dashed bus leg on the journey line, "Shuttle 09:25" or "Misses the shuttle" on every train ticket, a Shuttle row in Your train, yellow bus rows in the station list, and the bus route drawn along the roads on the map in yellow and black. Settings in `riat-cfg.json` `bus`: walk, ride, buffer, every, there, back per day, path, text.
- Eleven stations: London Paddington, Reading, Oxford, Bristol Temple Meads, Bath Spa, Cardiff Central, Newport, Cheltenham Spa, Birmingham New Street, Southampton Central and Exeter St Davids. Friday, Saturday and Sunday. Manchester was left out (no sensible Sunday journey).
- Times are from Friday 6 to Sunday 8 November 2026 as a stand in. Shuttle times are the latest RIAT published (to the show every 20 minutes 06:45 to 12:00, back from 14:00 until 18:00 Friday and 19:30 at the weekend); check them each spring. The Yellow entry pin is placed at the eastern end of the showground by eye.
- Refreshing: `train-routes-src/riat-tools/` (scrape.py, journeys.py which drops journeys with bus legs, build_data.py, fares.py, geo.py; set the dates in dates.json). `buspath.json` is the road route from the Swindon Bus Interchange to the Yellow entry (OSRM).
- Wix: page /train-to-riat, hidden from the menu, copy of Train to Clacton, one HTML embed set to the address above, 8100 tall on desktop and 15100 on mobile (tallest measured 8004 and 15018 on 30 Oct 2026). The RIAT page (`camping-layout/riat.html`) shows a "Train route details" button in the Train to Swindon and shuttle topic.
- 30 Oct 2026 (evening): now covers every day of the week (Monday to Wednesday use the Thursday timetable; shuttles only run Friday to Sunday, other days say so) and three ways in, each its own file with a "Choose your way in" bar linking them: `riat.html` (Swindon Shuttle), `riat-cheltenham.html` (train to Cheltenham Spa, taxi to the racecourse, Cheltenham Park and Ride: hourly, Friday 07:30 and 08:30, weekend 06:45 to 09:45; back Friday 17:00 and 18:00, weekend 16:30 to 19:30; about 1 hour 30 minutes) and `riat-kemble.html` (train to Kemble, taxi to the free South Cerney Fast Track, buses Friday 07:00 to 18:15 and weekend 06:15 to 19:45; the 20 minute ride is an estimate). Built from `riat-cheltenham-cfg.json`/`-data.json` with `cheltenham-tools/`, and `riat-kemble-cfg.json`/`-data.json` with `kemble-tools/`. Template additions: shuttle times per day with their own frequency (`there`/`back` keyed by day, optional third value in minutes), a taxi leg (`pre`, drawn dotted on the map), configurable wording (`word`, `short`, `jump`, `getThere`, `getBack`, `legName`, `thereHead`, `daysText`, `offDay`), `ways` for the switch bar and `defaultDay`. The Wix box is now 8600 tall on desktop and 16400 on mobile (tallest is the Kemble planner, 8403 and 16194, after its taxi firms box was added on 30 Oct 2026; firms come from the RIAT page list, `bus.taxis` in its cfg).

## Trader plans and advert prices (30 Oct 2026)

One ladder, used on Advertise With Us and in the Trader Hub. Each trader plan from Headliner up includes the advert package at the same price.

| Trader plan | Price | Includes |
|---|---|---|
| Static Display | Free | Card in the directory |
| Flypast | £19 a season (founding traders free for 2027, then £12 locked in) | Full directory card |
| Headliner | £49 a season | Guide Listing advert in one show guide |
| Display Team | £129 a season | Featured Partner advert in one show guide |
| Finale | £249 a season | Regional Partner adverts in up to three show guides |
| Show boost | £5 a show | Top of one show's trader list for the weekend |

Advert packages for businesses off the airfield: Guide Listing £49 (was Business Listing), Featured Partner £129, Regional Partner £249, Main Website Partner from £699. Every advert is labelled as an advert.
The backend (velo/backend/traders.web.js) only takes the plans free, founding, flypast and headliner from the sign up form; Display Team and Finale come through the enquiry form.

## Questions and answers page (30 Oct 2026)

`questions-and-answers.html` is the Q&A page (Wix page /airshow-questions). 59 questions in 11 topics: Planning and tickets, Getting there and parking, On the day, Families and children, Accessibility, Bags, security and show rules, Food, drink and stalls, Weather, Photography, Camping and places to stay, My Airshow Hub and this guide. Each topic is a folding section (feature page style) with Jack's short intro, a photo on a teal block, a link to the full guide, and the questions as open and close rows with a "More in ..." link to the page with the full detail, so answers stay short and don't repeat other pages.
- Edit the words in `qa-src/questions.py`, then run `python3 build.py` in `qa-src/`. The build stops if any copy has a dash or a banned word. Layout and script are in `qa-src/template.html`. Then run `python3 tools-search.py` so the site search finds the new questions.
- The search box in the header filters every answer as you type, opens the topics that match and highlights the words. Words that mean the same (kids and children, loo and toilet, dog and pet) only count when nothing matches the word as typed. "People often ask" quick links are `POPULAR` in questions.py.
- A question can be opened from the address: `?q=dogs` or `#q-dogs` (the question ids are in questions.py); `#family` opens a topic.
- Photos are Jack's own from home-img/ and first-airshow-img/, plus two AI images from guide-img/ (accessible-viewing and bag-check) with "AI generated for a visual look" captions.
- The page carries FAQ structured data for search engines, built from the same questions.

Clacton topic section redesign (31 Oct 2026): `explore-designs.js` re-lays out the page's own "Choose a topic" section (route flags, numbered line, phone pages, Getting here and Trains home tabs, transport style Getting there hero). Since 1 Nov 2026 it is on all twelve live show pages (riat, cosford, midlands, eastbourne, clacton, wales, duxford, shuttleworth, gransden, southport, blackpool, ayr). It is pasted inside each page (the Wix page loader runs a page's own scripts inside its container, and styles must sit in that container too), so after any change to `explore-designs.js` run `python3 tools-explore.py` to copy it into the pages. Topic names are matched on key words (parking, fuel, taxi, bus, train and so on) to pick each tab's colour and icon. The page still builds its own topic buttons and panel, so the bus route buttons and train box are never touched.

## Train route pages in the Blackpool layout (template-v2, 2 Nov 2026)

`train-routes-src/template-v2.html` is the train template in the layout of the Blackpool train preview (1 Nov 2026): a matt finish, the route map under the station picker, bigger day, direction and time pickers with a Show all times button, Your way in (way in card with Journey, Train times and Tips tabs, roundel steps, last way home strip, next trains board, Check before you go, Add to my plan, Show on map, Buy tickets), My travel plan (My day line and a checklist), the Full show guide button, Pay less to get there (the fare from the picked station, then the show's own cards) and Good to know (questions and the disability and buggy box). It is built by `python3 make_v2.py` from template.html plus the parts in `v2-parts/`, so fixes to template.html carry over; run make_v2.py again after changing either. A cfg picks it with `"template": "template-v2.html"`; the other train pages stay on template.html.
New cfg fields for v2: `theme.opd` (a darker shade of the company colour), `x.walkShort`, `x.walkFrom`, `x.walkTo` (Google Maps walking directions), `x.atShow`, `x.tipArrive`, `x.ptxFacts`, `x.opSites` (ticket site per company), `x.checks` (the plan checklist), `x.dayDefaults` (default train per day, there and back), `pay` ([title, text, tag, icon] with icon ticket, clock or card), `faq` ([question, answer]) and `access` ([intro, [points]]). Data trips carry `ops`, the company for each train in the journey.
Pages on v2: Eastbourne (Southern green), Ayr and Wales (Swansea).
From the Headcorn page (2 Nov 2026): the Departures and Arrivals switch and See every time are ring tabs (`v2-parts/ring-tabs.css`), and the departure tiles, planning slip and the show's timetable row take a light tint of the company colour (`v2-parts/tints.css`, cfg `theme.tint` and `theme.tintln`). The map leaves 120 px clear on the right on desktop.

## Train route page (Ayr)

Added 2 Nov 2026, in the v2 layout and ScotRail colours (#15397F with #BBC2DB, deep navy #0F2147). ScotRail trains into Ayr, plus Avanti West Coast and TransPennine Express connections at Glasgow Central. Nine stations: Glasgow Central, Paisley Gilmour Street, Edinburgh Waverley, Kilmarnock, Largs, Girvan, Stranraer, Carlisle and Preston. Two days, Friday (evening show) and Saturday, with a default train for each. Journeys that need a walk between stations (Edinburgh to Glasgow Queen Street, then walk to Central) are left out; the FAQ mentions that route. ScotRail fares are the same all day, so the Pay less card says so. Refresh with `train-routes-src/ayr-tools/update.sh <Friday date>`, then update the cfg note and fares and run `python3 build.py ayr`.
Still to do: the Wix page /train-to-ayr (copy /train-to-eastbourne and change the address), its path in AE_GH_PAGES, and the Train route details button in the Ayr page's train topic.


## Train route page (IWM Duxford, Cambridge)

Built 2 Nov 2026 in the v2 layout, in Greater Anglia red with charcoal. Every journey ends at Cambridge, where the free Air Show shuttle leaves from Station Place, stand 5 (Summer Air Show and Battle of Britain Air Show only). Greater Anglia plus any operator that gets to Cambridge with sensible changes (Great Northern, Thameslink, CrossCountry, East Midlands Railway).
- Sixteen stations: London Liverpool Street, London Kings Cross, London St Pancras, Gatwick Airport, Stevenage, Stansted Airport, Bishops Stortford, Colchester, Ipswich, Norwich, Bury St Edmunds, Ely, Kings Lynn, Peterborough, Leicester and Birmingham New Street. Saturday and Sunday. Journeys up to 4 hours are kept.
- Times are this winter's weekend timetable (7 and 8 Nov 2026) until the summer 2027 times are out; shuttle times are 2026 (every 30 minutes, 08:30 to 13:30 there, 15:30 to 18:30 back). Shuttle road line from OSRM via Trumpington Park & Ride.
- Refresh: `train-routes-src/duxford-tools/update.sh <show Saturday>`, then `python3 build.py duxford`. The Midland Main Line (Leicester via St Pancras) is drawn as straight lines.
- Still to do: the Wix page /train-to-duxford (copy /train-to-eastbourne and change the address), add it to AE_GH_PAGES, and a "Train route details" button in the Duxford page's train topic.

Bus route pages, 2 Nov 2026 (from the 74 Clacton edit copy), now on every bus page and the bus route template:
- Pick your bus is laid out like the newest train pages: numbered round steps, big Day and Direction buttons, a grid of departure times with Show all times, and Your bus as a full width band.
- Key details and the See every time / Follow this bus links are transport tabs. The links go dark company green on hover and stay green once tapped.
- The On the bus controls are option card buttons.
- The bell tip is navy (#13293C) with white writing.
- The destination blind and the Pick your bus number screen use the orange LED of the departures screen (#FFB21E, JetBrains Mono) in place of the dot matrix.

## Train route pages all on the new design (2 Nov 2026)

Clacton, Cosford and the three RIAT pages (Swindon, Cheltenham, Kemble) now build from `template-v2.html` too, so every page built from train-routes-src has the Your way in card, Pay less, Good to know and the access box. Each cfg has `pay`, `faq` and `access`, plus `opd`, `tint` and `tintln` in its theme.
- Changes made on the Clacton page on 2 Nov are on every train page, Headcorn and Shuttleworth included (they were patched directly): a red corner with a train on the operator note box, rounded corners on My advice, a faded hover on each stretch in The line it takes, and See every train as a transport tab like the Public Transport page (`#ttbtn.ttbtn` rules in `v2-parts/styles.css`).
- `x.wayIn` and `x.wayBack` ([label, heading]) replace the Walk step in the Your way in card when the way in is a shuttle or a taxi (RIAT pages, Duxford).
- The trail bar script (`trail.js`) and the winter times note are in `template.html`, so rebuilding no longer drops them. `trail.js` has rows for Ayr, Duxford, Headcorn and Shuttleworth.
- Show pages: Ayr (Train to Ayr topic) and Duxford (Train + free Air Show shuttle topic) now have the Train route details button. They open the GitHub page in a new tab until the Wix pages /train-to-ayr and /train-to-duxford exist.

## Coach options (2 Nov 2026)

Every feature show page now has a "By coach" group in Getting There, in the same design as Clacton (pink #C2255C coach steps, topic id `nx-coach`), with the connection on to the show:
Blackpool (121, 424 straight in) and Wales (507, 508, 201, 202, 111 to Swansea bus station) have direct coaches. The rest connect: RIAT (401, 444 to Swindon Fleming Way, then the Swindon Shuttle), Cosford (Birmingham Coach Station, then train), Duxford (Cambridge Parkside or Trumpington Park and Ride, then the free Air Show shuttle), Eastbourne (025 to Brighton, then the Coaster), Little Gransden (Cambridge, then 905 and taxi), Headcorn (London Victoria, then Southeastern), Midlands (Birmingham, then train to Redditch and the 247), Shuttleworth (Cambridge, train via Hitchin to Biggleswade, then the shuttle bus), Southport (Liverpool ONE, then Merseyrail), Ayr (Glasgow Buchanan, then the X77). Ayr, Southport and Midlands also have a "Coach groups" topic (id `coach`).
Service numbers come from the National Express timetables current in November 2026 (the 8xx numbers are Christmas Day only, so they are left out). Check them against the summer 2027 timetables in the spring. The topics were added by a one-off script; edit them in each page's `topics` list. The Public Transport page picks them up when `public-transport-src/build.py` is run.

## Train company colours and four new train pages (2 Nov 2026, afternoon)

- Every train page built from train-routes-src now shows each train company in its own colours, like the Shuttleworth page: station buttons, departure cards, the leg chips and journey steps, the Lines row, the next trains board, the map line (one colour per leg), the planning slip and the Buy tickets button (which opens that company's site from `x.opSites`). The page takes the colours of the company running most trains from the picked station. Set with `opColors` in each cfg (`{company name: {op1, navy, onui, opink, accink, opd, tint, tintln}}`); one colour per company across all pages (GWR is the RIAT green, Northern #1E5AA8, Thameslink #DA4290, Greater Anglia #D2232A).
- Cosford, RIAT, Cheltenham and Kemble data were scraped again so each trip records its companies (`ops`); their build_data.py now writes them.
- New pages, built from their own `<show>-tools` folders on template-v2: Blackpool (trains to Blackpool North, Northern), Southport (Merseyrail grey and yellow, Northern), Midlands Air Festival (trains to Redditch, then the Diamond 247 bus, West Midlands Railway) and Little Gransden (trains to St Neots, then a taxi, Thameslink). Wix pages /train-to-blackpool, /train-to-southport, /train-to-midlands and /train-to-little-gransden embed them and they are in `AE_GH_PAGES`.
- New cfg options: `x.busyTip` (first line of My advice), `x.wayIn`/`x.wayBack` also name the last leg chip, and Google Maps directions use transit or driving when the last part is a bus, shuttle or taxi.

## Change here card and going home tips (2 Nov 2026, evening)

- New cfg option `x.changeHere`: `{"station": "Glasgow Central", "text": [paragraphs]}`. It names the page's main change station and adds a small card in the company colours (`v2-parts/change-here.css`, code in `v2-parts/ptx.js`). In Your way in it shows in the Journey tab, with the picked train's platforms, when that train changes at the station, and otherwise in the Tips tab as a general tip (not when you start from that station). `{typ}`, `{min}` and `{max}` in the text are filled with the usual, shortest and longest change there, worked out from the timetable data, so they stay right after a refresh. Pages without it are unchanged.
- In use on Eastbourne (Brighton), Ayr (Glasgow Central), Wales (Cardiff Central) and Duxford (Ely), the busiest change station in each page's data.
- `x.busyTip` (first line of My advice) now set on Eastbourne, Ayr and Wales, and Duxford's covers going home too.

## Winter and summer timetable notice and timetable audit (2 Nov 2026, afternoon)

- Every train page now opens its "Pick your train" section with a visible card, "These are this winter's train times": train companies change timetables twice a year, summer is not the same as winter, the times are from a winter weekend, the summer 2027 times were not out when last checked, and a line saying the page keeps to the trains and changes that work well. It links to the operator and National Rail. It is in `template-v2.html` (`#tnotice`, filled by `CFG.x.checkWith` or `opName`, optional `x.tnExtra` for shuttle or bus time warnings, set on RIAT x3, Duxford and Cosford). Headcorn and Shuttleworth have the same card pasted into their pages.
- The small hint under the times table and every show page's "Train route map" box now say the times are from the winter timetable. The Public Transport page's "Are these the 2027 times?" answer explains the winter and summer difference (edit it in `public-transport-src/build.py`).
- Audit: all 13 pages built from data files were compared with the live timetable. Every journey (about 17,000) matched on departure and arrival time. The pages keep every direct train and the best one change options, and leave out late night and very early services and alternative changes. Scripts and notes are in `train-routes-src/audit-tools/`.
- Fixes from the audit: the RIAT show page now gives the official Fast Track bus hours (Friday 07:00 to 18:15, weekend 06:15 to 19:45) and the Kemble train page says the Fast Track must be booked; Headcorn shows the confirmed 2027 dates and on sale tickets; Clacton no longer states the twilight display as confirmed for 2027.
- Official source fixes (2 Nov 2026, evening): Eastbourne says the Sunday fireworks depend on sponsorship and were cancelled in 2026 (visiteastbourne.com); Wales says Afterburn began in 2026 with no 2027 plans seen (Swansea Council) and that improvement works hit the London to Swansea line that weekend; Ayr says the Friday flying ran 6.15pm to about 8.40pm in 2026 (South Ayrshire Council). Checked and left alone: RIAT Yellow entry at the eastern end and the Cheltenham Park and Ride (airtattoo.com), and the frequency and journey time claims, which match the timetable data.

## Command Centre (2 Nov 2026)

`admin/command.html` is Jack's HUD command centre for the whole site: Overview (radar, alerts, headline numbers),
Site traffic (Wix Analytics, 30 days), Airshow Hub (members, trips, must see, send a notice to every member),
Traders (founding places, queue with Approve and Send back, plans, stalls, shows), Forum (profiles, posts, groups,
reported items with Hide and Keep), All pages (every live page with desktop, phone and tablet checks, plus every
page in `admin/unpublished.json`), Plans and log, and Controls (publish, take offline, timed checks, links).
The site is at the Wix 100 page limit, so it shares the hidden, members only Wix page /site-admin with the Departures Board:
/site-admin opens the Command Centre and /site-admin?view=board opens the board. The page code `velo/page-code/site-admin.js`
points the embed html1 at the right file and routes messages (source `ukag-command` or `ukag-admin`) to `velo/backend/command.web.js`.
Plans, log, checks, ideas and publishing reuse `admin.web.js`; trader approvals reuse `traders.web.js`.
Traffic needs the `ukagApiKey` secret with Site Analytics read access. Opened on its own, the page shows a snapshot.

## London stations on every train page (3 Nov 2026)

- Every show now has a London start: Clacton (Liverpool Street, Stratford), Eastbourne (Victoria, Waterloo, Blackfriars, Farringdon, London Bridge, St Pancras and Clapham Junction), Cosford, Midlands and Blackpool (Euston, and Blackpool also Kings Cross via York), Ayr and Southport (new, London Euston with one change at Glasgow Central or Wigan), Wales and the three RIAT pages (Paddington), Duxford (Liverpool Street, Kings Cross, St Pancras), Gransden (Kings Cross), Headcorn (Charing Cross, London Bridge, Waterloo East) and Shuttleworth (London and the Thameslink stations). Little Gransden has no St Pancras or Blackfriars button, as the Sunday Thameslink trains start at Kings Cross and every other option needs a walk. Marylebone for Midlands and Cosford needs a walk between two Birmingham stations, so it is not added yet.
- Long hubs have their own ride limits in journeys.py (London Euston to Ayr 400 minutes, to Southport 300, Kings Cross to Blackpool 310); every other hub keeps the old limit.
- New cfg option `x.walkPairs` (Southport: `[["Wigan North Western","Wigan Wallgate"]]`): a short walk between two stations at a change. The line list says "Walk from A to B" instead of "0 miles" and "runs non-stop", the train steps start at the second station, and the change step says where the next train leaves from. The change card's minutes for Southport were written by hand because the template only works them out from the second day when times differ, so update that line after a timetable refresh.
- `make_v2.py` now also builds the winter timetable notice from `v2-parts/tnotice.css`, `tnotice.html` and `tnotice.js`, and the walk pair code. If you regenerate the template, nothing is lost.
- Eastbourne: late night journeys that end at Blackfriars or St Pancras instead of the hub (16 of them) are no longer shown under Victoria and London Bridge, and `eastbourne-tools/build_data.py` skips them on a refresh.

## Back to Transport tab (3 Nov 2026)

Every bus route page (`bus-routes/<id>.html`) and train route page (`train-routes/<show>.html`) has a Back to Transport tab
at the top (above the cover) and the bottom (above the small print), in the "transport tabs op1" look: grey bar, a line in the
mode colour (bus sky blue #00A6E2, train red #D74949), a white tab with a rounded top and a ring around a bus or train.
`transport-back.js` draws it; each page says which page it is with `window.UKAG_ROUTE={mode,id}` just before loading it.
`python3 tools-transport-back.py` adds both lines to any route page missing them, and both builders add them on rebuild.

Where the tab goes:
- From a show page: back to that show page with Getting there open, on the topic the visitor had picked.
- From the Public transport page: back there, on the same show.
- From anywhere else: the show's Getting there, on the topic that lists that bus or train.

How: `bus-routes.js` (loaded by every show page and the Public transport page) adds `?from=show&t=<topic>` or `?from=hub`
to a bus or train route link when it is tapped. The tab links back with `?tb=<topic>&tr=<route>&tm=<bus|train>`, and
`bus-routes.js` on the show page opens Getting there, picks the topic and scrolls to it. A note in the browser
(ukagTransportFrom, ukagTransportBack) covers the same ground when the address can't.
Bus pages sit in their own box on /bus-route, so the page code there has to pass `from` and `t` on: the updated
`velo/page-code/bus-route.js` does this, and needs pasting into the /bus-route page code in the Wix editor.
Until then bus pages send everyone to the show's Getting there.
Headcorn has its Wix page (/headcorn-air-show) and is the 13th featured show since 3 Nov 2026.

## Back tabs on the rest of the site (3 Nov 2026)

`back-tab.js` adds the same style of back tab (top and bottom, "transport tabs op1" look) to pages outside the bus and train routes, which keep `transport-back.js`. Load it at the end of a page: `<script src="https://jskedge1.github.io/airshow-pages/back-tab.js" defer></script>`. Pages are listed in `PAGES` inside the file, keyed by file path and by Wix address.
- On: all featured show pages in camping-layout/ (purple, replaces the old "Back to Find your airshow" sitebar link), the first airshow guides, Planning your first airshow, Security, Questions and answers, Food and drink and Kit calculator (purple), both forum looks (teal, Back to my hub; the HUD look gets corner brackets), New to aviation photography (navy), the traders directory and Advertise with us (green), Policies (grey). The calendar and map only show it when the visitor came from a show, Find your airshow or the hub.
- Record only (no tab, they just say where the visitor came from): home, Find your airshow, Public transport, Visitor planning guides, Photography hub, Camping hub, My Airshow Hub.
- Where it goes, in order: `?from=<source>` in the address (added to site links when tapped on a page that loads the file; bus and train route links are left to bus-routes.js), the last page tapped through from (kept on the device for 30 minutes), the referrer, then the page's default.
- Inside the live site the guide sits in the airshow-page element's shadow root (div.ae-body) and the script runs in the Wix page head, so the tabs go into that root, never the Wix page itself (fixed 3 Nov: they had landed above the site's header menu and below the footer). Pages in a fixed height Wix box are about 140px taller now, so check the bottom tab is not cut off.
- The tag is in the Q&A and Public transport templates and tools-policies.py, so rebuilding keeps it.
- No coach pages exist (coach options are topics on the show pages), and there are no separate camping guide pages yet, so those have no tab.

## Show page extras (3 Nov 2026)

Every feature show page in `camping-layout/` now has the same set of sections, in one order:
Overview, Right for you, (Story), Line-up, (Ticket day countdown), Getting there, Where to stay, Pick your day,
the show's own extras (enclosures, Park and View, museum, balloons, camping, exhibit, after show party),
Plan your day, Help on show days, The ground show (or Flightline / RAF Village), Where to watch, Seafront,
Photography, Kids' corner, Experience flights, Keep the show free, Make a postcard, Food and facilities.
Experience flights and Keep the show free only appear where the show really offers them. No history sections
were added to shows without one.

- Content for the new sections and the Good to know grid is in `extras-src/<show>.json` (written from the
  official sites on 3 Nov 2026; `notes` in each file lists things on the page that may be out of date).
- `python3 tools-extras.py [show ...]` puts it into the pages, adds the postcard, the Good to know grid
  (top of Food and facilities), the Last checked line under the key details, renames the day sections to
  Pick your day (Duxford and Shuttleworth: Pick your show), and puts the sections and tab bar in order.
  It is safe to run again after editing a JSON file.
- `show-extras.js` (loaded by every show page) styles and runs the new parts: Good to know grid, day pickers
  (`.sx-pick`, `data-sx-q`, `data-sx-score`, `.sx-res`), card filters (`data-sx-filter`), the flights filter and
  the postcard maker. Postcard photos load with crossorigin so the card can be saved inside the Wix page.
- To update a show's Good to know facts or Last checked date, edit its JSON file and rerun the tool.

## Six new planning guides on Wix (3 Nov 2026)

- Wix pages made by copying On the day (embed html10), saved in the editor, not published yet:
  /night-before-an-airshow (night-before.html), /getting-home-from-an-airshow (getting-home.html),
  /airshow-rainy-day-plan (rainy-day-plan.html), /calm-airshow-visit (calm-visit.html),
  /aircraft-spotter-cards (spotter-cards.html), /airshow-aircraft-a-to-z (aircraft-a-to-z.html).
  Each has its own SEO title and description and sits under Visitor Planning Guides in the Site Menu.
- All six paths are in `AE_GH_PAGES` (saved 3 Nov), so after publishing they grow with the page. Until then the
  boxes are fixed (3100px; the A to Z box is 4390px) and scroll inside.
- The show pages link to them from guide notes. show-extras.js (v=4) hides those notes while links.js has the guide
  at live:false, so nobody lands on a 404. After the November publish, set the six to live:true in links.js and the notes appear.

## Feature page publish, 10 Nov 2026
The 12 feature pages in `camping-layout/` (Clacton, Duxford, Cosford, Midlands, Eastbourne, Wales, Shuttleworth, Little Gransden, Southport, Blackpool, Ayr, Headcorn; RIAT unchanged) now carry the design work done through the preview artifacts: Box Tab 4 and clean info boxes, solid colour where to watch tabs, one line section menu with arrows, operator coloured train boxes and facts, the shuttle bus design, the Clacton header text, Keep reading hover with red READ, Good to know hover, checklist groups on the Cosford plan, the detailed crowd line view and aerial map, and the "Coming by train?" banner at the top of Getting There. The added styles and scripts sit at the end of each page. Images that were only in the previews are saved as `camping-layout/img/inl-*.{webp,jpg}`. The page sources from before this publish are kept in `backups/feature-src-2026-11-10/`.

## Speed, sizing and search tag pass (12 Nov 2026)
- Photos written inside page code were moved out with `tools-images.py` (now also run over the older show pages
  at the top level, both photography pages, road-routes/clacton, contact, landing, riat-moving, riat and the
  templates). They live in camping-layout/img/ as WebP files named by content, about 20 MB lighter in all.
  Photos under 3 KB (icons) stay inside the page. Run it on any new page that embeds photos.
- Every page was checked at 13 screen sizes: 280px (folding phone cover), 320px (Wix phone box), 360, 390, 430,
  Surface Duo single (540x720) and spanned (1114x720), folding phones open (600x904, 884x1104), tablet,
  landscape phone (844x390), laptop and desktop. Rules to keep:
  - Card grids use `repeat(auto-fit,minmax(min(260px,100%),1fr))`, never a bare px minimum, so a card can't
    push a narrow screen sideways. Single and two column phone grids use `minmax(0,1fr)` rather than `1fr`.
  - Long words, web addresses and emails in buttons need `min-width:0` on the flex child that holds them.
  - Sticky bars stay short on phones: the calendar filters scroll with the page under 760px wide or 600px tall,
    and the section tabs on the planning guides are one swipe row under 600px (the lit tab slides into view).
- The "Page height" sizing helpers only show when a page is opened on its own from GitHub, never on
  ukairshowguide.co.uk (pages drawn by the airshow-page element are the top window there too).
- Search tags: `tools-seo.py` is out of date. Many pages' titles and descriptions were improved by hand after its
  `W` list was written, and three pages carry noindex it would remove. Running it as it stands puts the old
  wording back, so copy the current wording into `W` first. It no longer stops on missing pages.
- `qa-src/` is behind questions-and-answers.html (the page has 60 questions, the source 59). Add the missing
  question to qa-src/questions.py before running qa-src/build.py again, or it will be lost.
- YouTube page: when a video has no large thumbnail the Latest player now drops to the standard one instead of
  showing YouTube's small grey placeholder.

## RIAT camping pages (20 Nov 2026)

A home page for campsites near MOD Boscombe Down (and those still running around Fairford), with a tab and a page for each campsite. Built from the "Campsite partners wanted" poster.

- Source: one JSON file per campsite in `riat-camping-src/sites/`. Start from `riat-camping-src/new-site.json`, save it as `sites/<slug>.json`, fill it in from the owner's reply, then run `python3 riat-camping-src/build.py`. It writes `riat-camping/index.html` and `riat-camping/<slug>.html`. Don't edit the HTML by hand.
- `"live": true` puts a campsite on the home page, in the campsite tabs and on the maps. Drafts still build their own page (with their own tab) so they can be sent to the owner to check. `area` is `boscombe` or `fairford`; distances are worked out from `lat` and `lng`.
- `sites/_sample.json` is a made-up campsite that builds `riat-camping/sample.html` with a yellow "Sample page" bar. The owner email links to it. Never set it live.
- `python3 riat-camping-src/build.py --preview <folder>` builds a copy with every site treated as live, to see the tabs and maps filled in.
- `availability` (`available`, `filling` or `full`) shows a Spaces available, Filling up or Fully booked badge on the campsite's tab, card, page and compare table row. Change it when the owner tells you, then rebuild. Blank shows no badge.
- Home page extras (20 Nov 2026): "I need" filters (tents, campervans, caravans and tourers, electric hook up, glamping, dogs, shuttle), worked out from each campsite's pitches, facilities and shuttle text, and shown only once a campsite is live; a compare table once two or more are live (the filters work on it too); a "Plan your camping trip" band linking the Camping hub, the kit calculator camping list, the RIAT page and Questions and answers (the `GUIDES` list in build.py, also on every campsite page); and the "Tell me about your campsite" form, which writes an email to contactus@ukairshowguide.co.uk for the owner to send (nothing is sent or stored by the page).
- `riat-camping-src/preview-sites/` holds two more made-up campsites (a glamping one and a Fairford one; the caravan park sample was removed on 20 Nov 2026 at Jack's request) that only `--preview` loads, so the preview shows the tabs, filters and compare table filled in. They never reach `riat-camping/`.
- Layout (20 Nov 2026, evening): redesigned in the Public transport and Duxford look. Every page opens with the "Airshow Camping" bar and the campsite strip (one tab per campsite page, with its availability dot). The home page has a photo header with the "Find your campsite" box (area, what you are bringing, I also need), then numbered colour tabs (Campsites, Compare, Show map, List your campsite) with the black ticker showing what is picked. Campsite pages have three coloured tiles under the name and five tabs (About, Pitches and prices, Facilities, Getting to the show, Book). Pitch types carry their own colours, like the train and bus colours: tents green, campervans blue, caravans and tourers purple, glamping orange. `#campsites`, `#compare`, `#map`, `#list` (home) and `#about`, `#pitches`, `#facilities`, `#getting-there`, `#book` (campsite pages) open a tab. No scroll animations, sentence case labels, photos are not links.
- Camping design (20 Nov 2026, late): the boxes stay as they are, with a camping layer on top. `camp_scene()` in build.py draws a flat campsite skyline (pines, tents, windbreaks, a campervan, a caravan, flags and a campfire): in one colour along the bottom of the home page photo header, and in full colour above the "Plan your camping trip" band on every page. The page background is canvas with faint map contour lines, each sign header has a camping icon in a white square, and the compare board numbers are pitch markers on wooden stakes.
- Simplified (20 Nov 2026, night, Jack's call): the four header info boxes, the numbered tabs and black ticker, the four "What are you bringing" picker boxes and the four coloured guide tiles are gone. Each page is one scrolling page again: clean white boxes with coloured sign headers, and one plain line of links under the header (`section_menu()`) that jumps to each box. "What are you bringing?" is a drop down, a "Showing 2 of 4 campsites" line with a clear button sits above the cards, and "Plan your camping trip" is one band of text links. The tabs and ticker described above no longer exist; `#campsites`, `#compare`, `#map`, `#list` and the campsite page ids still jump to their section.
- Camping theme (20 Nov 2026, night): the home page header now follows the Camping at Airshows hub: centred headline over the campsite photo, and a navy finder bar (where to stay, what you are bringing, I also need, Show campsites) in place of the purple box. Every white box has a striped windbreak edge along its top (`.sheet::before` and `.windbreak`), the skyline has a string of lights, and a "New to camping at an airshow?" card with one of Jack's pitch photos links to the Camping hub and the kit calculator. Campsites is headed in green and the show map in blue.
- New layout (20 Nov 2026, late night, Jack's pick): both page types were rebuilt in the layout of a reference page Jack chose (a charter site "about" page), replacing the looks described above. Overpass font, dark navy with one orange accent, small orange kickers over big headings, and photos throughout (all Jack's own from camping-hub-img/, or the campsite's). Home page order: top bar, photo header with the menu and a "List your campsite" button, the campsite strip, an offset photo with a dark stat box and the intro, the campsite photo cards with the finder row above them, the compare table, the show map on a dark band, "New to camping" with the official RIAT campsite card, a photo band with four numbered "what you get" cards for owners, the owner form on a dark panel between two photos, then the tent skyline and a dark footer with link columns. Campsite pages follow the same pattern: stat box with the distance, pitch price cards, facility lists, numbered ways to the show on a photo band, the map, a booking panel between two photos, a photo gallery and more campsites. The previous build script look is in the branch history if it is wanted back.
- Text rule (Jack, 20 Nov 2026, for every page and design): never use small text in capitals with wide letter spacing (the "kicker" label look), anywhere: not above headings, not on buttons, labels, tags or table headers. Small labels use the heading font instead: bold, normal case, normal spacing, at a readable size. build.py has no `text-transform:uppercase` or `letter-spacing` left.
- Motion (Jack, 20 Nov 2026): blocks rise into place as they scroll into view (`MOTION_JS` tags them with `.rv`, staggered), the header title fades up, and there are hover effects throughout: the numbered cards lift with the number tilting and pulsing, campsite cards and gallery photos zoom, buttons lift, text links grow an underline and arrow, price cards and footer links move. All of it is switched off for visitors who ask for reduced motion.
- Branding (Jack, 20 Nov 2026): the camping pages now carry the site branding. The UK Airshow Guide logo (`brand/ukag-header-logo.png`, the white version for dark backgrounds) sits in the photo header and the footer and links to the site home page. Colours are the brand ones in place of the orange: navy `#13293C` for dark panels, red `#D74949` for buttons, section labels and numbers (`#BF3636` where red is text on white), teal `#32B4AF` for small accents, ticks and everything on dark backgrounds, purple `#6950A1` for tags and flags. The font is Barlow, as on the rest of the site.
- Radar effect on the ring maps (Jack, 20 Nov 2026): `ring_map()` draws a faint crosshair and a teal sweep that turns once every `RADAR_SECS` seconds inside the 10 mile ring. Each campsite marker gives off a ring as the sweep passes its bearing. It is on both home page maps and the map on every campsite page, and is hidden for visitors who ask for reduced motion.
- Campsite strip (Jack, 20 Nov 2026): the row of campsite links under the photo header is a navy blue bar of tabs with white text and a thin brand blue line under it; the tab for the page you are on is brand blue (`--sky`, #00A6E2) with navy text.
- Finder (Jack, 20 Nov 2026): "Find your campsite" above the cards is a navy box with a header (icon, title, and the "Showing 2 of 3 campsites" count with its clear button), then three boxed fields: where to stay, what you are bringing, and the "I also need" ticks.
- Intro photos (Jack, 20 Nov 2026): the intro block on the home page and on each campsite page is two photos, a tall one with a smaller one overlapping its corner, and a red flag on the edge carrying the one fact (campsites listed, or miles from the airfield). It replaced the single offset photo with a navy stat box. The compare section sits on white.
- Home page opening screen (Jack, 20 Nov 2026): `home_header()` replaces the plain title header on the home page only. Tall campsite photo that zooms slowly, a red date tag, the big headline with the second line in teal, a short intro, two buttons (find a campsite, list your campsite), a countdown of days to 16 July 2027 (`COUNT_JS`, hidden once the show has started) and the tent skyline in navy along the bottom, joining the navy campsite tabs. Campsite pages keep the simpler photo header with the campsite name.
- Bigger home page (Jack, 20 Nov 2026, from the home page of the same reference site): the home page now runs: opening screen with a feature row along its bottom (a days to go tile and three link tiles); the campsite tabs; the intro with four counters under the photos (`data-count`, they count up when seen); campsites as white cards with the photo on top, six facts, spaces and price (`fleet_card()`; campsite pages still use `site_card()` for More campsites); the compare table; the official RIAT campsite beside a "Where would you like to camp?" list whose buttons set the finder's area (`data-pick`); the show maps; a "New to camping" photo band with a quote card in Jack's own words from the Camping hub; a tips mosaic of four of his photos with their Camping hub captions; three guide cards; then the owners band, the form and the footer. No testimonials or reviews are made up: every quote is Jack's own published wording.
- Tips section and quote band (Jack, 21 Nov 2026): the tips header is a navy bar with a red top edge joined to the mosaic (icon, heading, and the intro beside a teal line); each tip tile has an icon in a circle, a bold title and the tip, and a line under the mosaic links to the camping guides. The light poles tip uses Jack's own wording ("Making it bright and loud can make your pitch stand out, and it is fun too."), and the photo beside "Everything I wish someone had told me" is the bell tents one, both as he chose for the same page in The Big Guide to RIAT preview.
- Where the show is (Jack, 21 Nov 2026): "Getting to the show" on every campsite page names MOD Boscombe Down (`SHOW_AT`), including campsites around Fairford. Their pages still give the distance from RAF Fairford for where the site is, and add roughly how many miles it is to the show at Boscombe Down.
- Aircraft line-up page (Jack, 22 Nov 2026): `riat-camping/aircraft.html`, built by the same script, in the camping pages' design but with the feature pages' line-up workings: the same `aircraftLineup` data format (items with aircraftName, variant, category, airArm or operator, squadron, count, flying, staticDisplay, status Confirmed, Provisional or Cancelled, notes, days, isNew and newSince, updated and updatedNote), grouped by air force, then Civilian, then Cancelled, with totals, a key, filters (All, Military, Civilian, Flying, Static, New, Cancelled), a search box, a jump bar and the same Wix bridge (page code can post `{type:"aircraftLineup", ...}` to replace the built in list). Photos beside each aircraft come from `lineup-photos.js` (`LU_EXTRA`) first, then Jack's RIAT F-16 and Hornet, then the feature pages' built in library, which the build reads from the `lu-lib` block of `camping-layout/cosford.html` and saves as files in `riat-camping/img/lu/`. Photos are not clickable.
  - The RIAT 2027 list lives in `riat-camping-src/aircraft.json`. It is empty until RIAT announces aircraft (weekly updates usually start in February, Tiger Gathering theme). The Thursday RIAT confirmed aircraft check should add each confirmed aircraft there and rebuild, the same as it updates the feature pages' `FALLBACK` lists. Never add an aircraft RIAT has not confirmed.
  - `riat-camping-src/preview-aircraft.json` is a made-up example list (marked `preview: true`, so the page says "Example list") that only `--preview` uses.
  - It is a tab: "Aircraft line-up" sits in red in the campsite tab row on every page, and in the home page menu and footer. Once it has a Wix page, set `AIRCRAFT_WIX` and add the path to `AE_GH_PAGES`.
- More on the pages (Jack, 22 Nov 2026): the home page now has "Your RIAT 2027 week" (the six days from Park & View on Wednesday 14 to Monday 19 July, show days in navy, from the live RIAT page), an aircraft line-up band, and "Camping at RIAT, answered" (six questions, every answer from the live RIAT page or Jack's advice on it). Campsite pages get the same week, with the days the campsite is open marked (read from its open and close dates), "Six things I would check" before booking, and the aircraft band.
- Owner email: `riat-camping-src/email-to-campsites.md` (the email, a follow up, and a table of which answer goes in which JSON field).
- Owner photos go in `riat-camping/img/` as `<slug>-1.jpg` and so on, linked by full https address.
- Wix: when the home page gets a Wix page (planned /riat-camping), set `HOME_WIX` in build.py and add the path to `AE_GH_PAGES`. When a campsite gets its own Wix page, set its `wixPath`; until then its tab opens the GitHub page in a new tab. Once campsites are live, link the home page from the camping card on the RIAT page and the RIAT entry on the Camping hub.

## Duxford page in the new design (preview, 20 Nov 2026)

`previews/duxford-new-design.html` is a preview of the Duxford feature page in the new design made for the RIAT camping pages, with the same branding the camping pages now carry: the UK Airshow Guide logo in the photo header and footer, Barlow, navy for dark panels, red for buttons and label lines, teal for accents, purple and sky as second accents. It is not live and is not on any Wix page. The live page is still `camping-layout/duxford.html` and was not changed.

- Built by `python3 previews/duxford-new-design-src/build.py`. It reads the live page and adds the new look on top, so nothing is retyped: every section, script and data block (the 2027 calendar, the line-up `FALLBACK` and Wix bridge, the topic explorer, train and bus times, planner, sun guide, traders block and the rest) is carried over as it is. Run it again after the live page changes to pick the changes up. Do not edit the built file.
- `chrome.html` holds the new top bar, photo header, intro (offset photo with the dark stat box and four fact boxes), section heading and dark footer. `new-design.css` is the new look. `new-design.js` fills the new parts from the page's own words and adds the scroll and hover motion (off for reduced motion).
- The build also swaps the condensed heading font for Barlow, takes out capitals and wide letter spacing in the page's own styles (Jack's text rule), and tells the scripts that read the file name which show they are on (`NZ_PATH`), because the preview is not called `duxford.html`.
- Above the sections sits a dark photo band ("Everything you need for the day") holding the page's own Open all and Close all buttons, and the section strip is navy with a teal block on the open section (Jack's comments, 20 Nov 2026).
- The 20 collapsible sections are kept. Their bars run the full width of the page in navy with a coloured top edge (Jack, 20 Nov 2026). Getting there keeps its transport look for the topic explorer, tidied at the top: white background, the guide heading first, the rail banner below it and more room between the blocks (the small "UK Airshow Guide" strip is hidden there, as the logo is in the page header).
- To go live: Jack to approve the look, then copy the built file over `camping-layout/duxford.html`, or point the build's `OUT` at it.

## International Ayr Show in the new design (preview, 22 Nov 2026)

`previews/ayr-new-design.html` is the Ayr feature page in the Duxford new design, built from the same template as Jack's signed off Duxford preview (see `previews/NEW-DESIGN-ROLLOUT.md`). It is not live. The live page is still `camping-layout/ayr.html` and was not changed. Private preview: https://claude.ai/artifact/BNVpEjvqzcN3e6XBZoMc4D

- Built by `python3 previews/ayr-new-design-src/build.py`, a copy of the Duxford build with the Duxford only text fixes and photo swaps taken out.
- Ayr keeps Jack's photos in `window.PHOTO` (bbmf, typhoon, p47, stearman, dakota, chinook, spitfire, pitts), not in `data-pic` images, so `new-design.js` reads them from there. The intro uses the Spitfire, the guide band the Dakota, the Quick checker the P-47, the line-up heading the Chinook, Plan your day the Stearman, and the Photography opening the Typhoon (the live page has no photo there, so one is added with its own caption).
- The top bar and stat use the page's own facts: Low Green, Ayr, Friday 3 and Saturday 4 September 2027, and two show days. Ayr has no photographers' map, flightline walk, story or experience flights, so those parts of the template are left out. The Ground Show and Seafront Information come after the template order.
- One fix that Duxford does not have yet: on phones the Quick checker questions were squeezed into a narrow column. The build now gives each question the full width of its box (`.qs li > .q`). Duxford needs the same line.

## The Big Guide to RIAT (preview, 20 Nov 2026)

**Live since 22 Nov 2026 (Jack's go-ahead).** The Big Guide to RIAT replaced the RIAT holding page on the website. To publish a change: run `python3 riat-camping-src/build.py`, then `python3 previews/big-guide-to-riat-src/build.py`, then `python3 previews/big-guide-to-riat-src/golive.py`. The last one writes `big-guide-to-riat/` (every page with full web addresses, no noindex) and copies its home page over `camping-layout/riat.html` (what the Wix page /riat shows) and `riat.html`. Scheduled checks that change RIAT facts should change the build scripts and rerun these three, not edit `camping-layout/riat.html`, or the next build overwrites them. When a tab gets its own Wix page, point its links there in the build. The site home page (`home.html`) has a "The Big Guide To RIAT" section (`id="riat"`) in place of the old "RIAT is moving" box, with the key facts, a days to go count and a tile for each tab.

**Jack's rule (22 Nov 2026): The Big Guide to RIAT home page is the home for all RIAT information.** Everything relevant to RIAT is posted there. Each new RIAT topic becomes a tab in "The Big Guide to RIAT" strip, and each tab opens its own page for visitors. Every new tab and page follows this same format and template design: the top bar, the photo header with the logo and menu, the strip of tabs, sections that open with a coloured label line over a big heading, clean boxes with a coloured top edge, the photo bands, the motion, and the dark footer. To add one: add a line to `PAGES` in `previews/big-guide-to-riat-src/build.py`, write its page builder from the shared parts (`sub_header()`, `strip()`, `page()`, and `camp.sec_head()`, boxes and bands from `riat-camping-src/build.py`), add it to the home page where it fits, and rebuild. The camping pages and the aircraft line-up already sit inside it as tabs. Topics waiting for RIAT to publish details: getting there and parking, trains and buses, where to stay, where to watch, the sun guide, plan your day, accessibility, and food and facilities.

`previews/big-guide-to-riat/` is a preview of a RIAT section with its own home page and pages inside it, in the camping pages' design. It is not live and has no Wix pages. The live RIAT page (`camping-layout/riat.html`) and the camping pages (`riat-camping/`) were not changed.

- Pages: `index.html` (home), `what-we-know.html`, `still-to-come.html`, `already-booked.html`, and `camping/` (the camping home page and one page per campsite, copied from `riat-camping/` with their links pointed inside the section). Every page carries a "The Big Guide to RIAT" strip linking the pages, and the camping pages keep their own campsite strip under it.
- Built by `python3 previews/big-guide-to-riat-src/build.py`. Run `riat-camping-src/build.py` first if the camping pages have changed. The script borrows the styles, icons and motion from `riat-camping-src/build.py`, so the two always match.
- The words come from the live RIAT page (checked 15 November 2026). Nothing was added that is not on that page. Photos are Jack's (the F-16, Hornet and C-17 from `camping-layout/img/`, and the camping photos from `camping-hub-img/`), copied into `img/`.
- Camping on the home page (Jack, 22 Nov 2026): the home page also carries the official campsite with "Where would you like to camp?", the show week, the aircraft line-up band and "Camping at RIAT, answered", all drawn from `riat-camping-src/build.py` (`show_week()`, `aircraft_band()`, `faq_block()`) so they stay the same as on the camping pages. "Aircraft line-up" is a sixth part in the strip, pointing at `camping/aircraft.html`. `localise()` copies the camping photos the home page uses into `img/` and points links to the live camping pages inside the section.
- Links between the pages are relative, so the preview works anywhere. To go live each page needs its own Wix page and the links and image addresses need to be the full ones (see the note at the top of the build script).

## Feature pages in the new design (live 22 Nov 2026)

All 12 feature pages in `camping-layout/` (Duxford, Ayr, Blackpool, Clacton, Cosford, Eastbourne, Little Gransden,
Headcorn, Midlands, Shuttleworth, Southport, Wales) went live in the new design on 22 Nov 2026, at Jack's request,
using the Duxford page as the template (brief: `previews/NEW-DESIGN-ROLLOUT.md`). RIAT is unchanged.

- Each page is built by `previews/<show>-new-design-src/build.py` from `previews/<show>-new-design-src/live-source.html`
  (the page as it was before the new design) and written straight over `camping-layout/<show>.html`.
- To change the look: edit `new-design.css`, `new-design.js` or `chrome.html` in that folder and run the build.
- To change content (text, data blocks, the line-up): edit `live-source.html`, then run the build.
- The aircraft line-up job edits `var FALLBACK` in `camping-layout/<show>.html` directly. That still works on the built
  page. Before any rebuild, copy the current FALLBACK block from `camping-layout/<show>.html` into `live-source.html`
  first, or the rebuild puts the old line-up back.
- To undo the new design for a show: `cp previews/<show>-new-design-src/live-source.html camping-layout/<show>.html`.
