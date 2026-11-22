# Ayr (International Ayr Show): sources

Page = camping-layout/ayr.html (last checked line on page: 3 November 2026). TT = transport-times.js DATA "ayr" (checked 2026-10-29). Topic ids are from top_ayr.txt. No cdo/cpk (already on the page). No web fetches were needed; every figure is on the page or in TT.

## plan.json
Tag "2026 plan" (car parks, prices, trains and closures on the page are from 2026). Rewritten in the Clacton form with the confirmed 2027 dates: "The 2027 show is confirmed for Friday 3 and Saturday 4 September" (page notice "2027 dates confirmed" and Quick Answers). The rest keeps the page's existing note, ending with the spec's standard sentence ("once the 2027 details are released"; the page had "once the council releases the 2027 details").

## nss.json
Friday 3 and Saturday 4 September 2027 (page notice, Overview key details). Clock "2027 show days".

## fares.html
| Figure | Source | Year |
|---|---|---|
| Racecourse £23 Sat / £18 Fri, park and ride | #cdo, #cpk, topic `parking` | 2026 |
| Rozelle £23, Saturday only, park and ride | #cdo, #cpk, topic `parking` | 2026 |
| Seafield £28 Sat / £23 Fri, park and walk about 0.9 miles | #cdo, #cpk, topic `parking` | 2026 |
| Blue Badge car park free, 400 spaces, Blackburn Drive, no booking | #cdo, #cpk, topic `disabled` | 2026 |
| Paying on the day £7 more if spaces left; bookings not refundable; booked via Tracsis, number plate cameras | topic `parking`, Questions "Do I have to book parking?" | 2026 |
| Entry free, no tickets | Overview, Questions "Do I need a ticket?" | 2026 |
| Friday Flightline £25, Saturday Chill Out Zone £15 | Questions "Do I need a ticket?", Quick Answers | 2026 |
| Programme £5 | Quick Answers "How much is the programme?" | 2026 |
| Under 22 or over 60 with Scottish concessionary card travel free on buses | topic `bus` | 2026 |
| Family & Friends Railcard 1/3 off adults, 60% off kids; under 5s free | national rail facts allowed by spec | n/a |
| 3 trains an hour, extra carriages, queue systems at Glasgow Central and Ayr | TT `rail` "Show Saturday in 2026", Questions "Are there extra trains?" | 2026 |
| Kilmarnock to Ayr rail replacement bus | topic `rail`, TT `rail` | 2026 |
| X77 every 20 to 30 min, about an hour, Buchanan to Sandgate | topic `bus`, `nx-coach` | 2026 |
| Coach parking £30 a day, Riverside Sports Arena, booked, no overnight | topic `coach`, #cpk | 2026 |
| NX 590, 595 from London, 181 from Birmingham, Manchester, Preston | topic `nx-coach` | 2026 |
| Towing £200 | topic `closures`, #cpk | 2026 |
| Taxis: Thistle Cabs 01292 260000, Streamline 01292 880808, Johns 01292 611227; wheelchair: Streamline Taxis 01292 261010, Thistle Cabs, A to B 01292 404708, Ayr Citadel 01292 402204 | topic `taxi` | 2026 |

"Town parking" tab relabelled "Parking", as Ayr's parking is the booked event car parks, not town car parks.

## pbx.html
| Figure | Source | Year |
|---|---|---|
| Car parks open Fri 15:45, Sat 10:15; close Fri 22:00, Sat 20:00 | topic `parking`, #cpk opening times | 2026 |
| Village Fri 16:00 to 21:00, Sat 12:00 to 18:00 | Overview "The Festival Village", Pick Your Day, Ground Show | 2026 |
| Friday flying about 18:10 to 20:40; Saturday 13:30 to 17:30 | Overview, Pick Your Day, Quick Answers | 2026 |
| Toilets across site, accessible portable toilets, RADAR at the Pavilion | Facilities "Toilets", topic `disabled` | 2026 |
| Changing Places with hoist and height adjustable bench next to Low Green public toilets | Facilities Good To Know | 2026 |
| Food Village and bar; drinking water stations | Facilities "Food & drink", "Water Refill Points" | 2026 (30+ traders figure was 2025, not used) |
| Info and Welfare points; quiet space in welfare marquee by Wellington Square | Help "Lost Each Other", "Feeling Unwell", Facilities "Quiet Area" | 2026 |
| Tips: Esplanade railings, toilet before first display, no ear defenders handed out, no cash machine on site | Sample day, Ground Show "How I Would Do It" and "Jack's tip" | 2026 |
| Last train to Glasgow 23:05 Fri (arr 23:58) and Sat (arr 00:01) | TT `rail` Friday evening and Saturday tables | National Rail Table 202, 17 May to 12 Dec 2026 |
| Last X77 to Glasgow 23:40 | TT `bus` Friday and Saturday, topic `bus` | Stagecoach timetable 22 Oct 2026 to 22 Jul 2027 |
| Park and ride shuttles Fri 15:45 to 22:00, Sat 10:15 to 20:00 | TT `shuttle`, topic `shuttle` | 2026 |
| X77 evening every 30 min via Kilmarnock, about 1h 15m | topic `bus`, TT `bus` | 2026/27 timetable |
| Ways home and tips (queue at Ayr station, shuttle queues, A77 queues, torch for Friday dusk, pick up at Ayr station or Sandgate bus station, gap before coach home) | topics `rail`, `shuttle`, `car`, `closures`, `taxi`, `nx-coach`, Help "Getting Home" | 2026 |

## trl.json
Topic `rail`. Paragraph from topic `rail` text and routes. Board: TT has times to Ayr but no calling points for them (only the 2026 express, which has no time), so I used the fallback board ("Times out nearer the show"). Key details: both show days; every 30 minutes, 3 an hour on the 2026 show Saturday; Ayr; 15 to 20 minutes walk; just over 50 minutes from Glasgow; ScotRail (all topic `rail`). Journey: 10:30 Glasgow Central, arrives Ayr 11:24 (TT `rail` Saturday, normal 2026 summer timetable), 54m worked out from those. trl-go: https://www.ukairshowguide.co.uk/train-to-ayr (links.js slug map and existing page link).
Live: GLC (Glasgow Central) and AYR (Ayr), op SR (ScotRail). Confirmed in train-routes/ayr.html config (destCrs "AYR", opShort "SR", hub code "GLC").

## Gaps (for Jack to add later)
- 2027 car park prices, opening times and booking date (not out yet).
- 2027 flying, village and funfair times, and the 2027 ScotRail show timetable.
- 2027 Flightline and Chill Out Zone prices, and programme price.
- Rail fares Glasgow to Ayr (not on page): tile says "Not added yet".
- Stagecoach X77 fares (not on page): tile says "Not added yet".
- National Express coach fares to Glasgow (not on page).
- Whether Kilmarnock to Ayr engineering work affects 2027.
- Taxi fares (none published).
