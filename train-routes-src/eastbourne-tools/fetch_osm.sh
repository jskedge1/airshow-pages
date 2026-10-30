#!/bin/bash
# Downloads the OpenStreetMap train route relations the map lines are drawn along (about 8 MB, not kept in git).
cd "$(dirname "$0")" && mkdir -p osm
for r in 174288 9967465 20979229 9967462 9967678 9967741 172464 20979023 12787997 173240 3 6421539 17541294 6424000 8624682 9967152 9967464; do
  curl -s --max-time 120 -A ukairshowguide-train-pages -o osm/r$r.xml https://api.openstreetmap.org/api/0.6/relation/$r/full; sleep 1
done
