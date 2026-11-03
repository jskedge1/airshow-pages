#!/bin/bash
# Downloads the OpenStreetMap train route relations the Southport map lines are drawn along (not kept in git).
cd "$(dirname "$0")" && mkdir -p osm
for r in 6346231 6345557 6345556 14097264 14095865 14095307 287849 12381940 12381889 2883009 6375712 7521764 20686441 6346054 20684478 10850917 5144931 14094029 289384 20306415 14164228 289382 289383 11313847 5144930; do
  [ -s osm/r$r.xml ] && grep -q "<relation" osm/r$r.xml && continue
  for try in 1 2 3; do
    curl -s --max-time 240 -A ukairshowguide-train-pages -o osm/r$r.xml https://api.openstreetmap.org/api/0.6/relation/$r/full
    grep -q "<relation" osm/r$r.xml && break; sleep 30
  done; sleep 8
done
echo FETCHED
