# Blackpool: sources

Page = camping-layout/blackpool.html (last checked line on page: 3 November 2026). TT = transport-times.js DATA "blackpool" (checked 2026-10-29). Topic ids are from top_blackpool.txt. No cdo/cpk (already on the page).

## plan.json
Kept the page's existing 2026 plan notice word for word (it is already in the year sentence format). Tag "2026 plan": the dates, closures, trams, buses and parking on the page are all from 2026.

## nss.json
Saturday 8 and Sunday 9 August: 2026 show dates (page notice and Quick Answers "When are the 2027 dates?"). 2027 dates not announced, so clock = "2026 show days".

## fares.html
| Figure | Source | Year |
|---|---|---|
| Entry free, no tickets | Overview key details, Questions "Do I need a ticket?" | 2026 |
| North Pier £5 | Where to watch, "Out on North Pier" ("North Pier charged £5 in 2026") | 2026 |
| 12 hours: Central £14.50, Talbot Road £14.50, South £11.40, Bloomfield Road £11.40 | #cdo, #cpk, topic `parking` | checked October 2026 |
| 6 hours: £9.30 (Central, Bonny Street, Talbot Road), £7.20 (South, Bloomfield Road) | #cpk, topic `parking` | October 2026 |
| Prices may differ on event days | #cdo note, topic `parking` | October 2026 |
| No park and ride found | Questions "Is there a park and ride?" | 2026 |
| Blue Badge 3 hours free with a clock, not at Talbot Road | topic `disabled`, #cdo note | 2026 |
| Height limits about 1.9 to 2 m in multi storeys | topic `car` | 2026 |
| Children free on Blackpool Transport buses in August | topic `tram`, Kids' Corner | 2026 |
| Family Saver and Duo tickets available | topic `tram` (no prices on page) | 2026 |
| Family & Friends Railcard 1/3 off adults, 60% off kids; under 5s free | national rail facts allowed by spec | n/a |
| Avanti: one direct a day from Euston weekdays and Sundays, none Saturdays | topic `rail` | 2026 |
| NX 121 and 424 routes, coach station on Central Drive | topic `nx-coach` | 2026 |
| Blacktax 01253 596596 (app), C Cabs 01253 292929 (most wheelchair taxis) | topic `taxi` | 2026 |

## pbx.html
| Figure | Source | Year |
|---|---|---|
| Promenade closed 10:30 to 19:00 | topic `closures`, #cpk, travel intro | 2026 |
| Village 11:00 to 18:00 | Overview key details, Ground Show | 2026 |
| Flying about 14:00 to 17:40, same both days | Overview, sample day, "How a Blackpool day runs" | 2026 |
| Toilets incl. Undercroft at North Pier, 08:00 to 20:00 summer, RADAR | Facilities "Toilets", topic `disabled` | 2026 |
| Changing Places: Holiday Inn Talbot Road, Solaris Centre, Harrowside, 08:00 to 20:00 summer | topic `disabled`, Facilities Accessibility | 2026 |
| Food: village stalls, cafes, chip shops, pubs | Facilities intro | 2026 |
| Event first aiders, stewards/police point you | Facilities "First Aid And Lost Children" | 2026 |
| Tips: sea wall railings, Undercroft busy, Typhoon ear defenders, beach cleared North Pier to Central Pier | Sample day, Ground Show, Help, Quick Answers | 2026 |
| Last train to Manchester Sat 23:07 / Sun 22:24 | TT `rail` | Northern timetable 17 May to 12 Dec 2026 |
| Last train to Liverpool Sat 22:20 / Sun 22:02 | TT `rail` | same |
| Last train to Preston Sat 23:07 / Sun 23:11 | TT `rail` | same |
| Last 61 to Preston Sat 23:15 / Sun 19:27 | TT `bus` | LCC timetable checked 29 Oct 2026 |
| 424 to London about 22:00; 121 about 19:55 | topic `nx-coach` ("when I last checked") | 2026 check |
| Taxi firms, C Cabs most wheelchair taxis, Blacktax a few, pick up near Blackpool North or Talbot Road | topic `taxi`, `closures` | 2026 |
| Ways home advice (later train, tram queues, M55 queues for an hour) | topics `rail`, `tram`, `bus`, `car` | 2026 |
| Village open until 18:00, beats the M55 queue | Ground Show "Jack's tip" | 2026 |

## trl.json
Topic `rail`. Paragraph from topic `rail` text and route rows. Board: TT has real times but no calling points for the trains to Blackpool, so I used the fallback board (station name + "Times out nearer the show"). Key details: both show days (TT has Saturday and Sunday tables); every 30 min from Manchester on Saturday (TT: 09:02, 09:33, 10:02 then every 30 min); Blackpool North; about 15 minutes walk (topic `rail`); about 1h 20m from Manchester (topic `rail`); Northern. Journey: 09:02 Manchester Piccadilly, arrives Blackpool North 10:24 (TT `rail` Saturday, 2026 summer timetable), 1h 22m worked out from those. trl-go: https://www.ukairshowguide.co.uk/train-to-blackpool (links.js slug map and existing page link).
Live: MAN (Manchester Piccadilly) and BPN (Blackpool North), op NT (Northern). BPN confirmed as destCrs in train-routes/blackpool.html; MAN appears there as a hub.

## Not used
Blackpool Transport tram and bus fare prices: blackpooltransport.com returned 403 to WebFetch and curl on 22 November 2026 (pages tried: /blackpool-transport-sets-out-airshow-plans and /new-bus-and-tram-fare-structure-continues-offer-value-money). Search snippets gave conflicting prices (adult day £6.60 vs £3.50, Family Saver £10 vs £15), so I left them out. A Coastal Radio copy of the 2026 airshow plans article (coastalradiodab.co.uk, 6 August 2026, checked 22 Nov 2026) mentions Family Saver and Duo but gives no prices.

## Gaps (for Jack to add later)
- 2027 dates, flying times, village times, closures and tram plan (not announced).
- Rail fares to Blackpool North (not on page): tile says "Not added yet".
- Tram and bus fares (Family Saver, Duo, day tickets): not on page and operator site blocked.
- National Express coach fares (not on page).
- Whether kids go free on buses again in August 2027.
- Taxi fares (none published).
- Train departure with calling points for the hero board once the May 2027 timetable is out.
