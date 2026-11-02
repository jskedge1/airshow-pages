# Train page timetable audit (2 Nov 2026)

Run these when new timetables come out, to check the pages against the live timetable.

1. `python3 audit-tools/check_internal.py` checks every journey in the page data: times in order, ride length, arrival text, change times, map line gaps.
2. `python3 audit-tools/live_fetch.py` downloads the live journey lists from traintimes.org.uk for every hub, direction and date (about 700 lookups, 15 to 20 minutes, saved to /tmp/live_cache.json). Keep it to 3 workers. With 8 workers some routes came back incomplete and showed as missing trains.
3. `python3 audit-tools/compare_live.py` shows how many page journeys match the live timetable exactly. If a route shows departures missing, fetch it again on its own before believing it.
4. `python3 audit-tools/find_missing.py` lists live direct and one change trains the pages leave out, ignoring slower trains that a later, faster train beats.

On 2 Nov 2026 all 13 pages built from the data files matched exactly (about 17,000 journeys). Headcorn and Shuttleworth are built differently, so run check_internal logic on their embedded data separately.
