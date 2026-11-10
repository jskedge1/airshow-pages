# Main UK stations on the train pages (10 Nov 2026)

Adds about forty main stations and city termini (every London terminus, Birmingham, Bristol, Cardiff, Edinburgh, Newcastle, Norwich and so on)
to a show's train page, in a "From across the UK" group above the c2c stations. Built on the c2c tools.

1. Set the show and dates in `shows.json`, then `python3 scrape.py <show>` (about 30 minutes) and `python3 legs_for.py <show>`.
2. `python3 build_hubs.py <show>` adds the hubs to `../<show>-data.json` (any old "uk" group is replaced, so it is safe to run again).
   London termini other than Euston start with the walk or Underground across to Euston (or Kings Cross), stored as `walkStart` / `walkEnd` on each trip,
   which template-v2.html shows in the journey line. Glasgow Queen Street does the same to Glasgow Central.
   Stretches of line not drawn on any page are drawn straight between stations. Station positions come from stations.json when no page has them.
3. Add the new walkPairs, crs codes and wording to the cfg (done by hand for Blackpool), then `cd .. && python3 build.py <show>`.
