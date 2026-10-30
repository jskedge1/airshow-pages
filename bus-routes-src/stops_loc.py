import json, glob, subprocess, time, os
for fn in sorted(glob.glob('raw/*.json')):
    if fn.endswith('.loc.json'): continue
    out = fn[:-5] + '.loc.json'
    if os.path.exists(out): continue
    sid = json.load(open(fn))['sid']
    url = f'https://bustimes.org/api/stops/?service={sid}&limit=1000'
    res = {}
    while url:
        d = None
        for n in range(3):
            r = subprocess.run(['curl', '-s', '-m', '60', url], capture_output=True, text=True).stdout
            try: d = json.loads(r); break
            except Exception: time.sleep(3)
        if not d: break
        for s in d['results']:
            ln = s.get('long_name') or ''
            res[s['atco_code']] = ln.split(',')[0].strip() if ',' in ln else ''
        url = d.get('next')
    json.dump(res, open(out, 'w'))
    print(fn, len(res), flush=True)
    time.sleep(.6)
