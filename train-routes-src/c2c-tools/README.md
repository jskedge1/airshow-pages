# c2c stations on the train pages (6 Nov 2026)

Adds eight c2c starting stations (Shoeburyness, Southend Central, Leigh-on-Sea, Benfleet, Basildon, Grays, Upminster, Barking)
to every show's train page, with the c2c train into London and the connection on from there.

1. `python3 scrape.py` downloads the journeys from traintimes.org.uk for every show in `shows.json` (about 30 minutes for the lists,
   then the calling points of the journeys worth keeping, about 25 minutes). `python3 alt.py` retries any thin station and day a week later.
2. `python3 build_c2c.py` adds the c2c hubs to each `<show>-data.json` (and to the DATA block in train-routes/headcorn.html and shuttleworth.html).
   Changes across London are only kept when `WAYS` has the words for them (Underground or walk, both directions).
   Southend Central also takes the same c2c trains from the Shoeburyness list, as traintimes sends most Southend journeys via Southend Victoria.
   Clacton leaves Southend Central out on purpose: Southend Victoria is quicker and is already on that page.
3. `python3 cfg_c2c.py` adds the ways across (x.walkPairs, both directions), c2c colours, live board codes, the line name and the wording to each cfg.
4. `python3 patch_template.py` adds the c2c parts to template-v2.html (safe to run again); `python3 patch_bespoke.py` does the same for Headcorn and Shuttleworth.
5. `cd .. && python3 build.py <show>` for the ten cfg pages.

RIAT is left out while the show moves to Boscombe Down.
