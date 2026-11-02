#!/bin/bash
# Downloads the OpenStreetMap train route relations the map lines are drawn along (about 8 MB, not kept in git).
cd "$(dirname "$0")" && mkdir -p osm
for r in 20140651 2579566 20140640 20140646 20140642 20140648 20140650 20068405 6346231 6354621 6415810 20636243 20063605 20140645; do
  curl -s --max-time 120 -A ukairshowguide-train-pages -o osm/r$r.xml https://api.openstreetmap.org/api/0.6/relation/$r/full; sleep 1
done
