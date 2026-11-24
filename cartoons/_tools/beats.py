"""Stand-in for the motion-reel beats step: writes <film>/beats.json on a fixed grid.  python3 _tools/beats.py <film> <bpm> <seconds>"""
import json, sys, pathlib
film, bpm, dur = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
per = 60 / bpm; off = 0.00197
beats = [round(off + i * per, 5) for i in range(int(dur / per) + 2)]
p = pathlib.Path(__file__).parent.parent / film
(p / 'beats.json').write_text(json.dumps({'bpm': bpm, 'period': per, 'offset': off, 'beats': beats}, indent=1))
j = p / 'film.json'
if not j.exists(): j.write_text(json.dumps({'title': film, 'duration': dur, 'formats': ['16x9', '9x16'], 'poster': dur - 4}, indent=1))
print('beats', len(beats))
