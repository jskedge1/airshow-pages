"""Music and sound for Pip, Episode 7: Harry the Harrier. Made from scratch here, so no licence is needed.
Reads film.json (length) and cues.json (written by `node render.js timing`): section moods, speech-bubble pops,
Major Tower's radio clicks, the Harrier's roar and hover, the Merlin engines, the crowd. Writes music.wav.
    python3 music.py
The bed is the same soft lo-fi as the other Pip films (80 beats a minute), with a Spanish guitar for Harry,
a still, drum-free stretch for the memorial flight, and the music ducking under the aircraft."""
import json, os, wave
import numpy as np

here = os.path.dirname(os.path.abspath(__file__))
DUR = json.load(open(os.path.join(here, 'film.json')))['duration']
CUES = json.load(open(os.path.join(here, 'cues.json')))
SR, P = 44100, 0.75
N = int(SR * (DUR + 0.5))
ML, MR = np.zeros(N), np.zeros(N)      # music
SL, SR_ = np.zeros(N), np.zeros(N)     # sound effects
rng = np.random.default_rng(7)

def hz(n): return 440.0 * 2 ** ((n - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def add(bufs, sig, t, g=1.0, pan=0.0):
    L, R = bufs; i = int(t * SR)
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[:N - i]
    if np.ndim(pan) == 0: pl, pr = 1 - max(0, pan), 1 + min(0, pan)
    else: pan = pan[:len(sig)]; pl, pr = 1 - np.maximum(0, pan), 1 + np.minimum(0, pan)
    L[i:i + len(sig)] += sig * g * pl; R[i:i + len(sig)] += sig * g * pr
MUS, SFX = (ML, MR), (SL, SR_)

def shaped_noise(n, lo, hi, tilt=0.0):
    """white noise filtered in the frequency domain to lo..hi Hz, with a gentle tilt (dB per octave)"""
    X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    edge = lambda x, a, w: np.clip((x - a) / w, 0, 1)
    m = edge(f, lo * 0.7, lo * 0.3 + 1) * (1 - edge(f, hi, hi * 0.5))
    if tilt: m *= (np.maximum(f, 20) / 1000.0) ** (tilt / 6.0)
    y = np.fft.irfft(X * m, n); return y / (np.abs(y).max() + 1e-9)

# ---------------------------------------------------------------- instruments
def keys(n, d):
    t = tt(d); f = hz(n)
    s = np.sin(2*np.pi*f*t + .8*np.sin(2*np.pi*f*t)*np.exp(-3*t)) * np.exp(-2.2*t)
    return s * np.minimum(1, t/.006) * np.minimum(1, (d - t)/.08)
def pad(n, d):
    t = tt(d); f = hz(n)
    s = sum(np.sin(2*np.pi*f*k*t + k) / k**1.6 for k in (1, 2, 3)) * (1 + .15*np.sin(2*np.pi*.3*t))
    return s * np.minimum(1, t/.8) * np.minimum(1, (d - t)/.8) * .5
def bass(n, d):
    t = tt(d); f = hz(n); return np.sin(2*np.pi*f*t) * np.exp(-1.6*t) * np.minimum(1, t/.01) * np.minimum(1, (d - t)/.05)
def guitar(n, d=1.6):   # a nylon string pluck, additive
    t = tt(d); f = hz(n); s = np.zeros(len(t))
    for k in range(1, 9): s += np.sin(2*np.pi*f*k*t) * (1/k**1.1) * np.exp(-t*(1.8 + .9*k))
    return s * np.minimum(1, t/.003) * .6
def pluck(n, d=.5):
    t = tt(d); f = hz(n); return (np.sin(2*np.pi*f*t) + .3*np.sin(4*np.pi*f*t)) * np.exp(-9*t) * np.minimum(1, t/.002)
def kick():
    t = tt(.25); return np.sin(2*np.pi*np.cumsum(40 + 60*np.exp(-25*t))/SR) * np.exp(-12*t)
def brush(d=.12):
    t = tt(d); return shaped_noise(len(t), 2000, 12000) * np.exp(-30*t) * .5
def clap():
    t = tt(.12); return shaped_noise(len(t), 900, 6000) * np.exp(-38*t) * (1 + .6*np.exp(-200*(t-.012)**2*1e3))
def bell(n, d=1.4):
    t = tt(d); f = hz(n); return (np.sin(2*np.pi*f*t) + .3*np.sin(2*np.pi*2.76*f*t)*np.exp(-4*t)) * np.exp(-3*t)
def tok(n):
    t = tt(.09); f = hz(n); return np.sin(2*np.pi*f*t) * np.exp(-30*t)

# ---------------------------------------------------------------- the bed, section by section
PROG = {   # (bass root, chord tones) per bar of 4 beats
    'bright': [(41, [65, 69, 72, 76]), (45, [64, 69, 72, 76]), (46, [65, 70, 74, 77]), (48, [64, 67, 72, 76])],
    'memory': [(41, [65, 69, 72, 76]), (38, [62, 65, 69, 72]), (46, [65, 70, 74, 77]), (48, [64, 67, 72, 76])],
    'tense':  [(38, [62, 65, 69]), (46, [62, 65, 70]), (48, [64, 67, 72]), (45, [61, 64, 69])],
    'spain':  [(45, [64, 69, 72]), (43, [62, 67, 71]), (41, [60, 65, 69]), (40, [59, 64, 68])],
    'light':  [(48, [64, 67, 72, 76]), (43, [62, 67, 71, 74]), (45, [64, 69, 72, 76]), (41, [65, 69, 72, 77])],
    'warm':   [(46, [62, 65, 70, 74]), (43, [62, 67, 70, 74]), (39, [63, 67, 70, 74]), (41, [63, 65, 69, 72])],
    'still':  [(38, [62, 65, 69]), (46, [62, 65, 70]), (41, [60, 65, 69]), (48, [60, 64, 67])],
    'end':    [(41, [65, 69, 72, 77]), (46, [65, 70, 74, 77]), (48, [64, 67, 72, 76]), (41, [65, 69, 72, 77])],
}
secs = [(c[0], c[2]['mood']) for c in CUES if c[1] == 'section'] + [(DUR, None)]
BAR = 4 * P
for (a, mood), (b, _) in zip(secs, secs[1:]):
    sec = np.zeros((2, int((b - a + 2) * SR))); seg = (sec[0], sec[1])
    def put(sig, t, g=1.0, pan=0.0):
        i = int(t * SR); sig = sig[:max(0, sec.shape[1] - i)]
        seg[0][i:i + len(sig)] += sig * g * (1 - max(0, pan)); seg[1][i:i + len(sig)] += sig * g * (1 + min(0, pan))
    bars = int(np.ceil((b - a) / BAR)) + 1
    for bar in range(bars):
        t0 = bar * BAR; root, tones = PROG[mood][bar % 4]
        drums = mood in ('bright', 'light', 'warm', 'end', 'spain') and bar >= 1
        if mood == 'spain':
            for e in range(8):       # guitar arpeggio in eighths, with palmas on the off-beats
                n = [tones[0], tones[1], tones[2], tones[1] + 12, tones[2], tones[1], tones[0] + 12, tones[2]][e]
                put(guitar(n), t0 + e * P / 2 + (0.006 if e % 2 else 0), .13 if e % 2 else .17, pan=-.25 if e % 2 else .2)
            put(guitar(tones[0] - 12, 2.8), t0, .2)
            put(bass(root - 12, BAR * .95), t0, .22)
            if drums:
                for e in (1, 3): put(clap(), t0 + e * P, .16, pan=.3)
                put(kick(), t0, .16)
        elif mood == 'still':
            for n in tones: put(pad(n, BAR * 1.02), t0, .07)
            put(pad(root - 12, BAR * 1.02), t0, .09)
            if bar % 2 == 0: put(bell(tones[-1] + 12), t0 + 2 * P, .05, pan=.3)
        elif mood in ('tense', 'memory'):
            for n in tones: put(pad(n, BAR * 1.02), t0, .06)
            put(bass(root - 12, BAR * .95), t0, .16)
            if mood == 'memory':
                for e, n in enumerate([tones[0], tones[2], tones[1], tones[-1]]): put(keys(n + 12, P * .9), t0 + e * P + P / 2, .03, pan=.3 if e % 2 else -.3)
        else:
            for k, n in enumerate(tones): put(keys(n, BAR * .98), t0 + k * .012, .07)
            for e, n in enumerate([tones[0], tones[2], tones[1], tones[-1]]):
                if bar >= 1: put((pluck if mood == 'light' else keys)(n + 12, P * .9), t0 + e * P + P / 2, .045 if mood == 'light' else .035, pan=.3 if e % 2 else -.3)
            put(bass(root - 12, BAR * .95), t0, .26)
            if drums:
                put(kick(), t0, .22); put(kick(), t0 + 2.5 * P, .13)
                for e in range(4): put(brush(), t0 + e * P + P / 2, .09, pan=-.2)
                put(brush(.2), t0 + P, .15); put(brush(.2), t0 + 3 * P, .15)
    # gentle fades at the edges of each section so the moods cross over
    n = int((b - a) * SR) + int(.6 * SR); n = min(n, sec.shape[1])
    env = np.ones(n); fi, fo = int(.5 * SR), int(.9 * SR)
    env[:fi] = np.linspace(0, 1, fi); env[n - fo:] = np.linspace(1, 0, fo)
    i = int(a * SR); m = min(n, N - i); ML[i:i + m] += sec[0][:m] * env[:m]; MR[i:i + m] += sec[1][:m] * env[:m]

# ---------------------------------------------------------------- sound effects
def jet(t0, o):
    """the Harrier: arrives fast from the left, hovers (a steady roar with a high whine), lands and winds down"""
    d = o['len']; n = int(d * SR); t = np.arange(n) / SR
    roar = shaped_noise(n, 60, 5000, tilt=-3)
    rumble = shaped_noise(n, 25, 180)
    hiss = shaped_noise(n, 2500, 9000)
    h0, h1 = (o['hover'] if 'hover' in o else (t0 + d, t0 + d))
    lt = t + t0
    env = np.clip((lt - t0) / 3.5, 0, 1) ** 1.6                          # the approach swells
    env = np.where(lt > h0, 1.0, env)
    if 'wind' in o: w0, w1 = o['wind']; env *= np.where(lt > w0, np.clip(1 - (lt - w0) / (w1 - w0), 0, 1) ** 1.5, 1)
    if 'away' in o: env *= np.where(lt > o['away'], np.clip(1 - (lt - o['away']) / 4.5, 0, 1), 1)
    env *= np.minimum(1, (d - t) / .6)
    pitch = 1 + .08 * np.clip((lt - t0) / 4, 0, 1)
    if 'wind' in o: pitch *= np.where(lt > o['wind'][0], np.clip(1 - .55 * (lt - o['wind'][0]) / 3.5, .4, 1), 1)
    whine_f = 1900 * pitch * (1 + .004 * np.sin(2 * np.pi * 5 * t))
    whine = np.sin(2 * np.pi * np.cumsum(whine_f) / SR) * .25 + np.sin(2 * np.pi * np.cumsum(whine_f * .5) / SR) * .15
    flutter = 1 + .12 * np.sin(2 * np.pi * .7 * t) * (lt > h0)
    sig = (roar * .55 + rumble * .5 + hiss * .18 + whine * .5) * env * flutter
    pan = np.clip(-1 + 2 * np.clip((lt - t0) / 6, 0, 1) * .65, -.8, .4)
    g = .35 if o.get('far') else .75
    add(SFX, sig, t0, g, pan)
def merlin(t0, o):
    """a pair of Merlin engines: a deep growl with a pitch drop as they pass"""
    d = o['len']; n = int(d * SR); t = np.arange(n) / SR; lt = t + t0
    k = np.clip((lt - o['pass']) / 2.5, -3, 3)
    dop = 1 + .05 * -np.tanh(k)
    f = 88 * dop
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = sum(np.sin(ph * h) / h for h in range(1, 14))
    rough = 1 + .35 * np.sin(2 * np.pi * 11 * t + .5 * np.sin(2 * np.pi * 3 * t))
    growl = saw * rough * .35 + shaped_noise(n, 40, 900) * .5
    env = np.exp(-(lt - o['pass']) ** 2 / (2 * (d / 4.5) ** 2)) * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5)
    pan = np.tanh((lt - o['pass']) / 3) * .7
    add(SFX, growl * env, t0, .35 if o.get('far') else .6, pan)
def cheer(t0, o):
    d = o['len']; n = int(d * SR); t = np.arange(n) / SR
    crowd = shaped_noise(n, 400, 3000) * (1 + .3 * np.sin(2 * np.pi * 1.3 * t))
    env = np.minimum(1, t / .5) * np.clip((d - t) / (d * .6), 0, 1)
    add(SFX, crowd * env, t0, .13, 0)
    c = clap()
    for i in range(int(d * 70)):
        tc = rng.uniform(0, d * .85); add(SFX, c * rng.uniform(.4, 1), t0 + tc, .05 * np.minimum(1, tc / .5), rng.uniform(-.8, .8))
def radio(t0, o):
    sq = shaped_noise(int(.14 * SR), 900, 3500) * np.exp(-np.arange(int(.14 * SR)) / SR * 18)
    add(SFX, sq, t0 - .2, .12, .3)
    bp = tt(.07); add(SFX, np.sin(2 * np.pi * 1150 * bp) * np.minimum(1, (0.07 - bp) / .01), t0 - .04, .07, .3)

def wind(t0, o):
    """gusts of wind under the crosswind scene, soft"""
    d = o['len']; n = int(d * SR); t = np.arange(n) / SR
    g = shaped_noise(n, 150, 1800, tilt=-3) * (0.55 + 0.45 * np.sin(2 * np.pi * .23 * t) ** 2)
    add(SFX, g * np.minimum(1, t / 2) * np.minimum(1, (d - t) / 2), t0, .07, np.sin(2 * np.pi * .05 * t) * .5)

for t0, kind, o in CUES:
    if kind == 'jet': jet(t0, o)
    elif kind == 'merlin': merlin(t0, o)
    elif kind == 'cheer': cheer(t0, o)
    elif kind == 'wind': wind(t0, o)
    elif kind == 'radio': radio(t0, o)
    elif kind == 'tok': add(MUS, tok(79), t0, o.get('gain', .12) * .9, .1)
    elif kind == 'pop': add(MUS, tok(74), t0, o.get('gain', .14), 0)
    elif kind == 'bell': add(MUS, bell(86), t0, o.get('gain', .12), 0)

# ---------------------------------------------------------------- mix: the music ducks under the aircraft
lvl = np.sqrt(np.convolve(SL ** 2 + SR_ ** 2, np.ones(4410) / 4410, mode='same'))
lvl = np.convolve(lvl, np.ones(22050) / 22050, mode='same')
duck = 1 - .7 * np.clip(lvl / (lvl.max() * .5 + 1e-9), 0, 1)
L = ML * duck + SL; R = MR * duck + SR_
mix = np.stack([L, R], 1)
fade = np.minimum(1, (DUR - np.arange(N) / SR) / 2.0).clip(0, 1)[:, None]
mix = np.tanh(mix * 1.1) * fade; mix = mix / np.abs(mix).max() * .89
with wave.open(os.path.join(here, 'music.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('music.wav written,', round(DUR, 1), 's')
