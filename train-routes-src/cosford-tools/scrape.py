import re, json, time, subprocess, html, sys
BASE = 'https://traintimes.org.uk'


def get(u):
    for k in range(3):
        r = subprocess.run(['curl', '-s', '--max-time', '30', '-A', 'Mozilla/5.0 (planning preview)', BASE + u], capture_output=True, text=True)
        if r.stdout and len(r.stdout) > 500:
            return r.stdout
        time.sleep(2)
    return ''


def journeys(frm, to, date):
    out = {}
    t = '04:30'
    for _ in range(14):
        s = get(f'/{frm}/{to}/{t}/{date}')
        new = 0
        for l in re.findall(r'class="calling_link(?:_inner)?" href="([^"]+)"', s):
            l = html.unescape(l)
            if not re.search(r'(depart=|\|)' + date, l):
                continue
            key = re.sub(r'&stage=\d+', '', l)
            if key not in out:
                out[key] = []
                new += 1
            if l not in out[key]:
                out[key].append(l)
        later = re.search(r"href=\"(/[A-Z]{3}/[A-Z]{3}/(\d\d:\d\d)/(\S+?))\">Later", s)
        if not later or later.group(3) != date or new == 0:
            break
        t = later.group(2)
        time.sleep(.4)
    return out


hub, date = sys.argv[1], sys.argv[2]
full = len(sys.argv) > 3
res = {}
for frm, to in [(hub, 'COS'), ('COS', hub)]:
    rows = []
    for key, links in journeys(frm, to, date).items():
        ops = re.findall(r'ops\[\]=([^&]+)', key)
        ga = bool(ops) and len(ops) == key.count('info[]=')
        row = {'key': key, 'ops': ops, 'ga': ga, 'stages': []}
        if full and ga:
            for l in links:
                row['stages'].append({'link': l, 'html': get(l)})
                time.sleep(.3)
        rows.append(row)
    res[f'{frm}_{to}'] = rows
json.dump(res, open(f'raw/h_{hub}_{date}{"" if full else "_list"}.json', 'w'))
print(hub, date, {k: (len(v), sum(1 for r in v if r['ga'])) for k, v in res.items()}, flush=True)
