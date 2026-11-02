#!/bin/bash
# Refreshes the St Neots (Little Gransden) train page from the timetable.
# Usage: ./update.sh SUN_DATE   e.g. ./update.sh 2027-08-29   (give the show Sunday)
# Then check the output, run python3 ../build.py gransden, and commit.
set -e
cd "$(dirname "$0")"
D=${1:?give the Sunday date, YYYY-MM-DD}
python3 - "$D" <<'P'
import json,sys,datetime
d=datetime.date.fromisoformat(sys.argv[1]); assert d.weekday()==6, 'not a Sunday'
json.dump([['sun',str(d)]],open('dates.json','w'))
P
mkdir -p raw && rm -f raw/*.json
for d in $(python3 -c "import json;print(' '.join(x[1] for x in json.load(open('dates.json'))))"); do
  for h in KGX GTW SVG PBO CBG BTN LDS YRK NRW; do echo "$h $d"; done
done | xargs -P 6 -n 2 sh -c 'python3 scrape.py $0 $1 full'
python3 journeys.py
# map lines: only rebuild if a journey uses a stretch of line not already drawn (needs the OSM relations, see README)
python3 - <<'P'
import json
g=json.load(open('geo.json')); pairs=json.load(open('pairs.json')); names=json.load(open('allnames.json'))
miss=[p for p in pairs if p[0]+'|'+p[1] not in g['seg'] and p[1]+'|'+p[0] not in g['seg']]
newst=[n for n in names if n not in g['snap']]
print('stretches not drawn yet:',len(miss),miss[:10]); print('new stations:',newst)
open('NEEDS_GEO','w').write('yes' if miss or newst else '')
P
if [ -s NEEDS_GEO ]; then ./fetch_osm.sh && python3 geo.py; fi
python3 fares.py
python3 build_data.py
cp gransden-data.json ../gransden-data.json
echo "Now update fares in ../gransden-cfg.json from fares.json if they changed, then: cd .. && python3 build.py gransden"
