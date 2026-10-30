#!/bin/bash
# Refreshes the Eastbourne train page from the timetable.
# Usage: ./update.sh THU_DATE   e.g. ./update.sh 2027-08-12   (uses that Thursday and the Fri, Sat, Sun after it)
# Then check the output, run python3 ../build.py eastbourne, and commit.
set -e
cd "$(dirname "$0")"
D=${1:?give the Thursday date, YYYY-MM-DD}
python3 - "$D" <<'P'
import json,sys,datetime
d=datetime.date.fromisoformat(sys.argv[1]); assert d.weekday()==3, 'not a Thursday'
json.dump([[k,str(d+datetime.timedelta(i))] for i,k in enumerate(['thu','fri','sat','sun'])],open('dates.json','w'))
P
mkdir -p raw && rm -f raw/*.json
for d in $(python3 -c "import json;print(' '.join(x[1] for x in json.load(open('dates.json'))))"); do
  for h in VIC CLJ ECR LBG STP GTW BTN HGS AFK PMS; do echo "$h $d"; done
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
cp eastbourne-data.json ../eastbourne-data.json
echo "Now update fares in ../eastbourne-cfg.json from fares.json if they changed, then: cd .. && python3 build.py eastbourne"
