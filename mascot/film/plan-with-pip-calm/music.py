"""Soft lo-fi bed for "Plan it with Pip" (calm style) at 80 beats a minute, like the calm airshow cartoons: warm keys, a
gentle bass, a brushed beat, and small soft accents on the picture's own hits (hits.json, in beats).
Made from scratch here, so no licence is needed.  python3 mascot/film/plan-with-pip-calm/music.py"""
import json, os, wave
import numpy as np
here = os.path.dirname(os.path.abspath(__file__))
G = json.load(open(os.path.join(here, 'beats.json')))
SR, P, OFF = 44100, G['period'], G['offset']
DUR = json.load(open(os.path.join(here, 'film.json')))['duration']
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(3)
def sec(beat): return OFF + beat * P
def hz(n): return 440.0 * 2 ** ((n - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def add(sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    sig = sig[:N - i]; L[i:i + len(sig)] += sig * g * (1 - max(0, pan)); R[i:i + len(sig)] += sig * g * (1 + min(0, pan))
def lp(x, k): return np.convolve(x, np.ones(k) / k, mode='same')
def keys(n, d):     # warm electric piano
    t = tt(d); f = hz(n)
    s = np.sin(2*np.pi*f*t + .8*np.sin(2*np.pi*f*t)*np.exp(-3*t)) * np.exp(-2.2*t)
    return s * np.minimum(1, t/.006) * np.minimum(1, (d - t)/.08)
def bass(n, d):
    t = tt(d); f = hz(n); return np.sin(2*np.pi*f*t) * np.exp(-1.6*t) * np.minimum(1, t/.01) * np.minimum(1, (d - t)/.05)
def kick():
    t = tt(.25); return np.sin(2*np.pi*np.cumsum(40 + 60*np.exp(-25*t))/SR) * np.exp(-12*t)
def brush(d=.12):
    t = tt(d); return lp(np.diff(rng.standard_normal(len(t)), prepend=0), 3) * np.exp(-30*t) * .5
def bell(n, d=1.2):
    t = tt(d); f = hz(n); return (np.sin(2*np.pi*f*t) + .3*np.sin(2*np.pi*2.76*f*t)*np.exp(-4*t)) * np.exp(-3.5*t)
def pop(n):
    t = tt(.09); f = hz(n); return np.sin(2*np.pi*f*t) * np.exp(-28*t)
def whoosh(d):
    t = tt(d); return lp(rng.standard_normal(len(t)), 14) * np.sin(np.pi*t/d)**2
# F major, gentle: F, Am, Bb, C (two beats each chord would rush at 84 bpm, so one chord a bar of 4 beats)
CH = [(41, [65, 69, 72, 76]), (45, [64, 69, 72, 76]), (46, [65, 70, 74, 77]), (48, [64, 67, 72, 76])]
bars = int((DUR - OFF) / (4 * P)) + 1
for bar in range(bars):
    b0 = bar * 4; root, tones = CH[bar % 4]
    end = bar >= bars - 2
    for k, n in enumerate(tones): add(keys(n, 4 * P * .98), sec(b0) + k * .012, .07)
    for e, n in enumerate([tones[0], tones[2], tones[1], tones[3]]):
        if bar >= 1 and not end: add(keys(n + 12, P * .9), sec(b0 + e + .5), .035, pan=.3 if e % 2 else -.3)
    add(bass(root - 12, 4 * P * .95), sec(b0), .26)
    if 2 <= bar and not end:
        add(kick(), sec(b0), .22); add(kick(), sec(b0 + 2.5), .14)
        for e in range(4): add(brush(), sec(b0 + e + .5), .10, pan=-.2)
        add(brush(.2), sec(b0 + 1), .16); add(brush(.2), sec(b0 + 3), .16)
# picture accents, soft
NOTE = {'F5': 77, 'A5': 81, 'C5': 72, 'C6': 84, 'E6': 88, 'F6': 89}
for h in json.load(open(os.path.join(here, 'hits.json'))):
    beat, _, kind = h[0], h[1], h[2]; o = h[3] if len(h) > 3 else {}
    g = o.get('gain', .2) * .9; t = sec(beat)
    if kind == 'whoosh': add(whoosh(o.get('len', .9) * P), t - .15, g * 1.6)
    elif kind == 'bell': add(bell(NOTE.get(o.get('pitch', 'F6'), 89)), t, g * 1.2)
    else: add(pop(NOTE.get(o.get('pitch', 'C6'), 84)), t, g * 1.3)
mix = np.stack([L, R], 1)
fade = np.minimum(1, (DUR - np.arange(N) / SR) / 1.5)[:, None]
mix = np.tanh(mix * 1.2) * fade; mix = mix / np.abs(mix).max() * .85
with wave.open(os.path.join(here, 'music.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('music.wav written,', round(DUR, 1), 's')
