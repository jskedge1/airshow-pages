#!/bin/bash
cd "$(dirname "$0")"
for d in $(python3 -c "import json;print(' '.join(x[1] for x in json.load(open('dates.json'))))"); do
  for h in LST KGX STP GTW SVG SST BIS COL IPS NRW BSE ELY KLN PBO LEI BHM; do echo "$h $d"; done
done | xargs -P 7 -n 2 sh -c 'python3 scrape.py $0 $1 full >> log.txt 2>&1'
echo DONE >> log.txt
