#!/bin/bash
# Downloads the OpenStreetMap train route relations the Blackpool map lines are drawn along (not kept in git).
cd "$(dirname "$0")" && mkdir -p osm
for r in 1853698 8309560 6375712 6384191 6346231 6346029 6345556 6386362 6386361 11313847 8279866 5144932 7521764 5144931 3367456 6345557; do
  [ -s osm/r$r.xml ] && grep -q "</osm>" osm/r$r.xml && continue
  curl -s --max-time 240 -A ukairshowguide-train-pages -o osm/r$r.xml https://api.openstreetmap.org/api/0.6/relation/$r/full; sleep 8
done
