#!/bin/bash
# Downloads the OpenStreetMap train route relations the Swansea map lines are drawn along (not kept in git).
cd "$(dirname "$0")" && mkdir -p osm
for r in 287180 2832312 20293456 20655746 20655744 20655927 165541 167583 9837231 18463270 20636914 20675710 6396489 9818982 13311799 125414 20189881 20302095 183757 9786303; do
  curl -s --max-time 240 -A ukairshowguide-train-pages -o osm/r$r.xml https://api.openstreetmap.org/api/0.6/relation/$r/full; sleep 8
done
