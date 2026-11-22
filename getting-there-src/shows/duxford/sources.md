# Duxford Air Shows: sources for the Getting there content

Page: camping-layout/duxford.html (page says "Last checked 3 November 2026"; the show calendar script SW_SHOWS says "from IWM Duxford's event pages, checked 11 October 2026"). transport-times.js DATA "duxford" (checked 2026-11-15).
Official check for a parking permit price, 22 Nov 2026: https://www.iwm.org.uk/airshows/getting-here and https://www.iwm.org.uk/airshows/duxford-summer-air-show both returned HTTP 403 to WebFetch and curl, so I could not read IWM's site. The page gives no permit price either (PARKING-FIGURES.md says the same). A web search only turned up a 2016 IWM press release (£5 a car) and old blogs, which are too old to use, so the copy says plainly that I haven't found a price.

## Plan note and show days
- 2027 big Air Shows Sat 19 and Sun 20 June, Sat 11 and Sun 12 September: overview Key details, Pick Your Show, SW_SHOWS. Year 2027. nss.json uses these four big Air Show days only (the season also has Flying Days 8 May, 5 June, 30 July, Flying Evening 14 August, Flying Finale 2 October); the lead may prefer two days.
- New bold sentence added in front of the existing "Leaving" note. Every word of the old note kept, with its link exactly as it was. I took the bold off "Leaving a Duxford Air Show can take a long time." so there is one bold sentence; put the `<b>` back if Jack wants both.

## Fares
- Big Air Shows adult from £49.50, 15 and under free with a Standard Adult ticket: overview Key details, SW_SHOWS, Pick Your Show. 2026 prices.
- Programme £8 in advance, £10 on the day: Help Quick Answers, Food and facilities Programmes. Year not stated on the page (current listing).
- Flying Evening adults from £36.50, children 5 to 15 £18.25; Flying Finale adults £41.50, children 5 to 15 £20.75: SW_SHOWS. 2026 prices.
- Advance only, no tickets on the gate: notice tickets tip, Pick Your Show.
- Parking permit at the big Air Shows, booked with the ticket, spaces limited: topic `park-main`, `#cpk`, Questions. Price: not published (see above).
- Free shuttle from Cambridge station stand 5 and Trumpington Park & Ride, big Air Shows only, no booking: topics `rail-shuttle`, `bus-pr`. 2026.
- Parking free on site at the smaller events: topic `park-main` opt text ("At the smaller events parking is free on site"). Motorbikes free, visitor centre car park: `#cpk`, Questions.
- IWM members free Flying Days, 10% off Air Shows: notice tickets tip, Key details.
- Train tab: King's Cross about 50 minutes, St Pancras and Liverpool Street about 70, every 30 minutes; Whittlesford about 1 hour, at 24 and 54 past: transport-times `rail-shuttle`, `rail-whit` (Network Rail timetable 17 May to 12 December 2026). Railcard and under 5s: national facts.
- Bus tab: shuttle times 08:30 to 13:30 out, 15:30 to 18:30 back, about 20 minutes from Trumpington: topics `rail-shuttle`, `bus-pr`, DX_SHUTTLE_OUT/BACK. 2026. 132 every 2 hours Sundays and bank holidays: transport-times `bus-local` (BODS, valid 22 Oct 2026 to 22 Jul 2027). No shuttle from Cambridge North, South or Whittlesford: `rail-shuttle` warn. Limited wheelchairs, scooters, buggies: `bus-pr` warn.
- Coach tab: 491, 777, 727, 728, 786, Parkside, 20 minutes' walk, 727/728 at Trumpington: topic `nx-coach`.
- Parking tab: car parks open 07:00: `park-main`, `#cpk`. Scooters £35, manual wheelchairs £15 via Event Mobility: topic `park-blue`, Food and facilities Accessibility (year not stated).
- Taxi tab: Whittlesford about 5 min, Royston 15 to 20 min, Cambridge about 20 min, ranks at Cambridge and Royston: topics `rail-whit`, `rail-roy`, `taxi-local`.

## On the day / Getting home
- Car parks 07:00, gates and ticket scanning 08:00, flightline walk 09:15 to about 12:00, flying about 13:00 to 17:30, site closes 19:00: Key details, How arrival works, Food and facilities, How a Duxford day runs, SW_SHOWS (2027 big Air Shows). Flying Days 10:00 to 18:00 (2027, Pick Your Show), Flying Evening 17:00 to 21:30 (2026).
- Toilets, baby changing, Changing Places in Hangar 1 with Radar key: Food and facilities Toilets, Good To Know.
- Food: three museum cafés, vendors and bars at the big Air Shows: Food and facilities.
- Free water points, first aid in the Green Zone, Quiet Room and sensory backpacks: Good To Know, Help.
- Day tips: save your pitch then flightline before noon (Pick Your Show, Flightline Walk); eat early, toilet before flying (Pick Your Show, How a day runs); ear defenders, not cotton wool (Kids' Corner); no cashpoint, cash only traders (Help, Paying).
- Last services: shuttle 18:30 (2026, `rail-shuttle`, `bus-pr`); site closes 19:00 (Questions); 132 last from IWM 17:41 Sundays (transport-times `bus-local`); last trains Cambridge to Liverpool Street 22:47 and King's Cross 23:51 Saturday (transport-times `rail-shuttle`, 2026 timetable).
- Taxis: Veezu 01223 715715, CamCab 01223 704704, A1 Cabco 01223 313131, Shelford Taxis 01223 843488; Veezu accessible vehicles: topics `taxi-local`, `taxi-access`.
- Ways home and tips: shuttle back (topic `rail-shuttle`), Whittlesford return taxi (`rail-whit`), coach home slack (`nx-coach`), M11 queues and leaving tip (notice, Questions), drop a pin (Help, Finding Your Car), agree pick up (`taxi-local`), A505 westbound and B roads (`road-west`).

## Compare Driving Options
- Rows: Air Show car parks (permit, price not published), Trumpington Park & Ride (free shuttle; the page doesn't say what parking at Trumpington costs, so the cost reads "Free bus"), smaller events (free), motorbikes (free). All bars 100% as there is no price to scale against.

## Train route hero (topic `rail-shuttle`)
- Same content as the page's existing trlScript-dux hero for `rail-shuttle` (added 9 Nov), with the paragraph filled out from the topic. Board and journey: 07:54 London King's Cross to Cambridge, Great Northern, arrives 08:43 (transport-times `rail-shuttle`, 2026 Saturday); 49 minutes worked out from those times. No calling points are in the data, so the board says only "From London King's Cross".
- Link https://www.ukairshowguide.co.uk/train-to-duxford: used by the page's Train route details button and existing hero. README line 472 says the Wix page /train-to-duxford was still to do, so Jack should check it exists before this goes live.
- Live: KGX towards Cambridge and CBG back towards King's Cross, Great Northern (TOC GN). CRS codes match train-routes/duxford.html.

## Gaps
- Parking permit price for the big Air Shows: not on the page, and IWM's site blocked my fetch. Jack to add when he can see it.
- 2027 ticket prices (all events) and Flying Day prices: not out yet ("Tickets launch in 2027").
- 2027 free shuttle timetable: IWM will publish it on its getting here page.
- 2027 Flying Evening and The Americans Flying Day opening times: to be confirmed.
- Train, coach, bus 132 and taxi fares: not on the page.
- Whether parking at Trumpington Park & Ride costs anything: not on the page.
