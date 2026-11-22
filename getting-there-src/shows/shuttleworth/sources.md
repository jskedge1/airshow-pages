# Shuttleworth Air Shows: sources for the Getting there content

Page: camping-layout/shuttleworth.html (page says "Last checked 3 November 2026"; the calendar script SW_SHOWS says "from Shuttleworth's event pages, checked 11 October 2026"). transport-times.js DATA "shuttleworth" (checked 2026-11-15).
Official checks, 22 Nov 2026:
- https://www.shuttleworth.org/events/festival-of-flight-air-show-2027 confirms: tickets from £36, kids free, free parking, shuttle £10 return booked with tickets, out 09:00, 10:00, 11:00, 12:00, back 18:00, 19:00, 20:30, 21:30, gates 09:00 to 21:00, displays 14:00 to 18:00 and 20:00 to 21:00 (TBC), Flightline Tour £17.50 (14+), camping £27.50 a pitch a night. All match the page.
- https://www.shuttleworth.org/visit/before-you-visit/getting-here: says nothing about air show parking or the shuttle (only Biggleswade 3 miles, 10 minute taxi or 45 to 60 minute walk).

## Plan note and show days
- Tag "2027 plan": the page's parking (free, Alder Drive), shuttle and ticket details are all for 2027.
- New bold sentence added in front of the existing "Changed" note. Every word of the old note kept, link exactly as it was. I took the `<b>` off "New parking arrangements to meet Martyn's Law." so there is only one bold sentence; put it back if Jack prefers.
- nss.json days: all eight 2027 show days, Sun 9 May, Sat 29 May, Sat 26 and Sun 27 June, Sat 24 July, Sat 14 August, Sat 28 August, Sat 25 September (SW_SHOWS, Pick Your Show). The lead may want to trim these.

## Fares
- From £36 most shows, Season Premiere from £35, under 18s free except Flying Proms, Proms from £62.50, children 4 and over £22: SW_SHOWS, Pick Your Show, Quick Answers. 2027.
- Parking free, no booking, Alder Drive SG18 9DT: topic `park-main`, `#cpk`, Questions. 2027.
- Blue Badge parking free, central to the event area: topic `park-blue` (meta Cost Free), `#cpk`.
- Shuttle £10 return, booked with tickets: topic `rail-shuttle`, `#cpk`. 2027.
- Flightline Tour £17.50, 14 and over: Flightline Tours. Camping £27.50 a pitch a night: Pick Your Show Jack's tip. 2027 (confirmed on the official Festival of Flight page).
- Carers free ticket via enquiries@shuttleworth.org, random checks: topic `park-blue`, Food and facilities.
- Hangars, Swiss Garden, fun fair included at most shows: overview, Food and facilities Ground attractions.
- Train tab: St Pancras about 45 minutes every 30 minutes on Saturdays, Peterborough about 37 minutes, Sundays hourly from King's Cross: transport-times `rail-big`, `rail-shuttle` (December 2026 timetable). Railcard and under 5s: national facts.
- Bus tab: shuttle out 09:00 to 12:00 hourly at most shows (SW_SHOWS out times; Flying Proms 11:00 to 17:00 every two hours). 74 Monday to Saturday, Ickwell Green and Northill, last Saturday buses 17:37 and 18:16 in the October 2026 timetable: topic `bus-74`.
- Coach tab: 491, 777, 727, 728, 786 to Parkside, 20 minutes' walk, change at Hitchin: topic `nx-coach`.
- Parking tab: gates 09:00 (10:00 Proms), car park opening time not published, arrive about 08:00, holding queue, Hill Lane daily admission only, car clubs via groups team: How arrival works, `#cpk`, Questions.
- Taxi tab: Biggleswade about 10 minutes, Bedford about 20 minutes: topics `rail-big`, `rail-bed`, `taxi-local`.

## On the day / Getting home
- Gates 09:00 (10:00 Proms), main display from about 14:00, evening displays from about 19:00 (Wings and Wheels, Finale), 19:30 (Military, Summer) or 20:00 (Festival of Flight), gates close 18:00 (Premiere) to 22:00 (Proms), Premiere one display 14:00 to 17:30, Proms flying 18:30 to 20:00: SW_SHOWS, Pick Your Show. 2027, approximate.
- Toilets and baby changing: Food and facilities Toilets, Quick Answers. Changing Places not listed: Good To Know. Caterers and Runway Café, card preferred: Food and facilities, Help Paying. Information Pod: Help Programmes And Maps.
- Day tips: arrive 08:00 and save your pitch (How arrival works, Flightline Tours); food queues before 14:00 (Food and facilities); no display times (Help); child's ears (Good To Know Quiet Area).
- Last shuttle back 18:15 (Premiere), 21:30 (Military, Festival of Flight, Summer), 20:30 (Wings and Wheels, Finale), 22:15 (Proms): SW_SHOWS back times, 2027. Last train to St Pancras 22:30 and to King's Cross 23:53 on Saturdays: transport-times `rail-shuttle` (December 2026 timetable).
- Taxis: Village Taxis Biggleswade 01767 600300, A1 Cars 01767 700700, AT Cars 01767 600399, Bedford Fastline 01234 811811, Ezee Cabs 01234 262626; accessible notes: topics `taxi-local`, `taxi-access`. (Also on the page but left out of the box for space: Village Taxis Sandy 01767 262626, Ace Cars 01767 834041, City Cars Bedford 01234 380405.)
- Ways home and tips: shuttle return times (Help The Shuttle Bus), trains into the evening (`rail-big`), coach connection (`nx-coach`), B658 and A1 (`road-south`), wait 30 to 45 minutes (Questions), drop a pin (Help), later shuttle return (Questions), agree pick up (`taxi-local`).

## Compare Driving Options
- Show car parks free and Blue Badge parking free, both 100%. Car club display parking mentioned in the note only (no cost given). 2027.

## Train route hero (topic `rail-shuttle`)
- Board and journey: 07:46 St Pancras to Biggleswade, arrives 08:31, for the 09:00 shuttle: transport-times `rail-shuttle` (December 2026 timetable). 45 minutes worked out from those times. No calling points in the data, so the board only says "From London St Pancras".
- Link https://www.ukairshowguide.co.uk/train-to-shuttleworth: the same address the page's Train route details button uses. README line 50 says the train route page had no Wix page yet, so Jack should check /train-to-shuttleworth is live.
- Live: null. Thameslink trains through Biggleswade run to Peterborough and to London and beyond, so a destination match on "biggleswade" wouldn't work and I'm not sure enough of the right destination names.

## Gaps
- Exact 2027 display times for each show are marked TBC, and Shuttleworth doesn't publish times for each aircraft.
- Car park opening time: not published.
- Water refill points, Changing Places, first aid location, hearing support and re-entry on show days: not confirmed on the page.
- Train, coach, bus 74 and taxi fares: not on the page.
- Armed forces rate at the Military Air Show and group rates: mentioned, no price on the page.
- Bus 74 times for 2027: the page warns they will change.
