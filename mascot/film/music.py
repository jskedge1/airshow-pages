"""Makes music.wav for the Meet Pip cartoon: a light, friendly tune at 120 beats a minute, plus
small sound effects timed to hits.json (written by render.js). Everything is synthesised here,
so there is no licence to worry about.  python3 mascot/film/music.py"""
import json, os, sys, wave
import numpy as np

FILM = sys.argv[1] if len(sys.argv) > 1 else 'promo'
SR, DUR, BEAT = 44100, {'teaser': 16.0, 'studio': 8.0, 'mystery': 16.0}.get(FILM, 66.0), 0.5
BARS = int(DUR / 2)
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
here = os.path.dirname(os.path.abspath(__file__))

def hz(n):  # MIDI note number to frequency
    return 440.0 * 2 ** ((n - 69) / 12)

def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * (1 - max(0, pan))
    R[i:i + len(sig)] += sig * gain * (1 + min(0, pan))

def tt(d): return np.arange(int(d * SR)) / SR

def pluck(n, d=0.9):   # soft marimba or ukulele
    t = tt(d); f = hz(n)
    s = np.sin(2*np.pi*f*t)*np.exp(-5*t) + .35*np.sin(2*np.pi*2*f*t)*np.exp(-9*t) + .12*np.sin(2*np.pi*4*f*t)*np.exp(-16*t)
    return s * np.minimum(1, t / .004)

def bass(n, d=0.45):
    t = tt(d); f = hz(n)
    return (np.sin(2*np.pi*f*t) + .25*np.sin(2*np.pi*2*f*t)) * np.exp(-4*t) * np.minimum(1, t/.008) * np.minimum(1, (d-t)/.03)

def whistle(n, d):
    t = tt(d); f = hz(n) * (1 + .004*np.sin(2*np.pi*5.5*t))
    env = np.minimum(1, t/.03) * np.minimum(1, (d-t)/.06)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * env

def kick():
    t = tt(.22); f = 45 + 90*np.exp(-28*t)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-14*t)

def noise(d): return rng.standard_normal(int(d*SR))
def hp(x): return np.diff(x, prepend=0)
def lp(x, k): return np.convolve(x, np.ones(k)/k, mode='same')

def snap():
    t = tt(.09); return hp(noise(.09)) * np.exp(-55*t) * .5
def shaker():
    t = tt(.05); return hp(hp(noise(.05))) * np.exp(-70*t) * .25

# ---- the tune: C, G, A minor, F, one chord per bar (2 seconds), 33 bars
CH = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]
ARP = [0, 2, 1, 2, 0, 2, 1, 2]
MEL = [  # (beat in the 4 bar phrase, note, length in beats)
    (0, 76, 1), (1, 79, 1), (2, 84, 1.5), (3.5, 79, .5),
    (4, 74, 1), (5, 79, 1), (6, 83, 1.5), (7.5, 79, .5),
    (8, 72, 1), (9, 76, 1), (10, 81, 1.5), (11.5, 76, .5),
    (12, 77, 1), (13, 81, 1), (14, 79, 2)]
MEL2 = [(0, 84, .5), (.5, 79, .5), (1, 76, 1), (2, 79, 2),
    (4, 83, .5), (4.5, 79, .5), (5, 74, 1), (6, 79, 2),
    (8, 81, .5), (8.5, 76, .5), (9, 72, 1), (10, 76, 2),
    (12, 77, 1), (13, 79, 1), (14, 84, 2)]
def level(bar):   # which parts play in each bar: (drums, melody, overall)
    if FILM == 'teaser': return (0, 0, .8) if bar < 2 else (1, 1, 1)
    if FILM == 'studio': return (0, 0, .8) if bar < 1 else (1, 1, 1)
    if bar < 3: return (0, 0, .8)            # hook: plucks only
    if 6 <= bar < 8: return (.6, 0, .9)      # "PIP stands for": space for the letter drops
    if 17 <= bar < 20: return (1, 0, .9)     # who is Pip for
    if 24 <= bar < 27: return (.4, 0, .75)   # the calm visit scene: softer
    return (1, 1, 1)
# the mystery teaser: a quiet minor-key build with a heartbeat, opening out into the main tune for the end card
CHM = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]
MYST_END = 6
for bar in range(MYST_END if FILM == 'mystery' else 0):
    t0 = bar * 4 * BEAT; root, tones = CHM[bar % 4]
    for e in range(8):
        add(pluck(tones[ARP[e]] - (12 if e % 4 == 0 else 0), 1.2), t0 + e*.25, (.10 + .015*bar), pan=.35 if e % 2 else -.35)
    add(bass(root - 12, 1.8), t0, .30)
    if bar >= 1:
        for b in (0, 2): add(kick(), t0 + b*BEAT, .42); add(kick(), t0 + b*BEAT + .22, .25)
    if bar >= 4:
        for e in range(8): add(shaker(), t0 + e*.25, .08*(1.4 if e % 2 else .7), pan=-.2)
for bar in range(MYST_END if FILM == 'mystery' else 0, BARS - 1):
    t0 = bar * 4 * BEAT; root, tones = CH[bar % 4]; dr, mel, lv = level(bar)
    for e in range(8):
        n = tones[ARP[e]] + (12 if e in (2, 6) else 0)
        add(pluck(n), t0 + e*.25, .20*lv, pan=.35 if e % 2 else -.35)
    if bar >= 1:
        add(bass(root - 12 + 12), t0, .34*lv); add(bass(root), t0 + 2*BEAT, .28*lv); add(bass(root + 7), t0 + 3.5*BEAT, .16*lv)
    if dr:
        for b in (0, 2): add(kick(), t0 + b*BEAT, .5*dr)
        for b in (1, 3): add(snap(), t0 + b*BEAT, .30*dr, pan=.1)
        for e in range(8): add(shaker(), t0 + e*.25 + .125*0, .10*dr*(1.4 if e % 2 else .7), pan=-.2)
    if mel:
        ph = (bar % 4) * 4; src = MEL2 if (bar // 4) % 2 else MEL
        for (b, n, ln) in src:
            if ph <= b < ph + 4: add(whistle(n, ln*BEAT*.92), t0 + (b - ph)*BEAT, .11)
# last bar: one held C chord
for n, g in ((36, .4), (48, .3), (60, .22), (64, .2), (67, .2), (72, .2), (84, .12)):
    add(pluck(n, 2.0) if n > 50 else bass(n, 1.9), DUR - 2, g)
add(kick(), DUR - 2, .5)

# ---- sound effects on the picture's own timings
def whoosh():
    d = .55; t = tt(d); x = lp(noise(d), 9) * np.sin(np.pi*t/d)**2
    return x * 1.4
def pop():
    t = tt(.07); f = 520 + 600*t/.07
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-30*t)
def tick():
    t = tt(.04); return np.sin(2*np.pi*1400*t) * np.exp(-80*t)
def thud():
    t = tt(.3); return np.sin(2*np.pi*(70 + 60*np.exp(-30*t))*t) * np.exp(-11*t) + hp(noise(.3))*np.exp(-90*t)*.2
def boing():
    t = tt(.5); f = 260 + 160*np.exp(-5*t)*np.cos(2*np.pi*9*t)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-6*t)
def fly():   # a little propeller buzz that passes by
    d = 1.5; t = tt(d); f = 85 + 30*t/d
    saw = 2*((np.cumsum(f)/SR) % 1) - 1
    return lp(saw, 12) * np.sin(np.pi*t/d)**1.5 * (1 + .3*np.sin(2*np.pi*22*t))
FX = {'whoosh': (whoosh, .16), 'pop': (pop, .16), 'tick': (tick, .07), 'thud': (thud, .5), 'boing': (boing, .22), 'fly': (fly, .16)}
for t, kind in json.load(open(os.path.join(here, 'hits-' + FILM + '.json'))):
    f, g = FX[kind]
    add(f(), max(0, t - (.25 if kind == 'whoosh' else 0)), g)

mix = np.stack([L, R], 1)
fade = np.minimum(1, (DUR - np.arange(N)/SR) / 1.2)[:, None]
mix = np.tanh(mix * 1.1) * fade
mix = mix / np.abs(mix).max() * .89
with wave.open(os.path.join(here, 'music-' + FILM + '.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('music.wav written, peak', round(float(np.abs(mix).max()), 3), 'rms', round(float(np.sqrt((mix**2).mean())), 3))
