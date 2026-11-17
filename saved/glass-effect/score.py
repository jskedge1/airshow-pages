# Music and sound effects for the explainer, all synthesised (nothing downloaded).
# 104 bpm pluck arpeggio, soft bass, light drums, a new key and pattern for each scene,
# bell tune on the end card. Effects follow the animation cues: paper taps when prints land,
# thumps on stamps, soft clicks on pops, swishes between scenes.
import json, wave, sys, os
import numpy as np
D = os.path.dirname(os.path.abspath(__file__))
OUTD = os.path.join(D, os.environ.get('OUT', 'out'))
CU = json.load(open(os.path.join(OUTD, 'cues.json')))
DUR = CU['dur']; SR = 44100; N = int(SR * (DUR + .3)); T = np.arange(N) / SR
rng = np.random.default_rng(7)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, at, d):
    e = np.exp(-np.arange(n) / SR / d); k = int(at * SR)
    if k: e[:k] *= np.linspace(0, 1, k)
    return e
def add(buf, sig, start, g=1.0):
    i = int(start * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i >= len(buf) or not len(sig): return
    j = min(len(buf), i + len(sig)); buf[i:j] += g * sig[:j - i]
def lp(x, k): return np.convolve(x, np.ones(k) / k, mode='same')
kn = int(.4 * SR); kx = np.arange(kn) / SR
kick = np.sin(2 * np.pi * np.cumsum(48 + 90 * np.exp(-kx / .03)) / SR) * np.exp(-kx / .14)
nz = rng.standard_normal(int(3 * SR))
clap = np.diff(nz[:int(.18 * SR)], prepend=0) * env(int(.18 * SR), .002, .045) * .45
shk = np.diff(np.diff(nz[:int(.05 * SR)], prepend=0), prepend=0) * env(int(.05 * SR), .004, .014) * .12
crash = np.diff(nz[:int(2.4 * SR)], prepend=0) * env(int(2.4 * SR), .003, .6) * .2
def tone(m, sec, harm, d, at=.002):
    n = int(sec * SR); x = np.arange(n) / SR; f = hz(m)
    s = sum(a * np.sin(2 * np.pi * f * h * x) * (np.exp(-x / dd) if dd else 1) for h, a, dd in harm)
    return s * env(n, at, d)
pluck = lambda m: tone(m, .32, [(1, 1, 0), (2, .5, .05), (3, .25, .03)], .1)
def bass(m, sec):
    n = int(sec * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * hz(m) * x) + .3 * np.sin(4 * np.pi * hz(m) * x)) * env(n, .005, .35) * np.clip((sec - x) / .05, 0, 1)
bell = lambda m: tone(m, 1.2, [(1, 1, 0), (2.0, .4, .25), (3.01, .2, .1)], .45)
marimba = lambda m: tone(m, .5, [(1, 1, 0), (4, .25, .02)], .16, .001)
def pad(m, sec):
    n = int(sec * SR); x = np.arange(n) / SR; f = hz(m)
    s = (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.004 * x) + .4 * np.sin(4 * np.pi * f * x)) / 2.4
    return s * np.clip(x / .4, 0, 1) * np.clip((sec - x) / .5, 0, 1)

BPM = 104; BEAT = 60 / BPM; BAR = 4 * BEAT
DEG = {1: [60, 64, 67], 2: [62, 65, 69], 3: [64, 67, 71], 4: [65, 69, 72], 5: [67, 71, 74], 6: [57, 60, 64]}
ROOT = {1: 36, 2: 38, 3: 40, 4: 41, 5: 43, 6: 45}
PROGS = [[1, 5, 6, 4], [6, 4, 1, 5], [1, 6, 4, 5], [4, 1, 5, 6], [2, 5, 1, 6], [1, 4, 6, 5], [6, 5, 4, 5], [4, 5, 3, 6], [1, 3, 4, 5]]
KEYS = [0, 0, -3, 2, 5, -2, 3, 0, -5, 2, 4, -1, 0]
ARPS = [[0, 1, 2, 1, 0, 1, 2, 1], [0, 2, 1, 2, 0, 2, 1, 2], [2, 1, 0, 1, 2, 1, 0, 1], [0, 1, 2, 3, 2, 1, 0, 1], [0, 3, 1, 3, 2, 3, 1, 3]]
scenes = sorted(set(CU['scenes']))
INTRO = scenes[1]; ENDC = scenes[-1]
bounds = sorted(set([0.0] + [s for s in scenes if 0 < s < DUR - 1] + [DUR + 1]))
def sect(t):
    for i in range(len(bounds) - 1):
        if t < bounds[i + 1]: return i
    return len(bounds) - 2
STYLE = ['intro', 'half', 'full', 'light', 'full', 'half', 'full', 'light', 'full', 'half', 'full', 'full']
srng = np.random.default_rng(11)
MOT = [list(srng.choice([-1, 0, 1, 2, 3, 4], size=8, p=[.3, .15, .2, .15, .1, .1])) for _ in bounds]
mus = np.zeros(N)
for b in range(int(DUR / BEAT) + 1):
    t = b * BEAT; s = sect(t); k = KEYS[s % len(KEYS)]
    stl = 'full' if t >= ENDC - .05 else STYLE[s % len(STYLE)]
    bar = b // 4; fb = int(np.ceil(bounds[s] / BAR - 1e-6)); rel = bar - fb
    d = PROGS[s % len(PROGS)][rel % 4]; ch = [m + k for m in DEG[d]]; r = ROOT[d] + k; bb = b % 4
    arp = ARPS[s % len(ARPS)]
    for h in range(2):
        j = arp[(bb * 2 + h) % 8]; m = ch[0] + 12 if j == 3 else ch[j]
        add(mus, pluck(m + (12 if stl == 'light' else 0)), t + h * BEAT / 2, .1 if stl == 'light' else .13)
    if bb == 0:
        for m in ch: add(mus, pad(m, BAR * .98), t, .05 if stl in ('light', 'intro') else .03)
    if stl == 'full':
        if bb in (0, 2): add(mus, bass(r, BEAT * .9), t, .3)
        if bb == 3: add(mus, bass(r + 7, BEAT * .4), t + BEAT / 2, .14)
    elif stl in ('half', 'intro'):
        if bb == 0: add(mus, bass(r, BEAT * 1.8), t, .28)
        if bb == 2: add(mus, bass(r + 12, BEAT * .4), t + BEAT / 2, .12)
    else:
        if bb == 0: add(mus, bass(r, BEAT * 2.5), t, .22)
    if t >= .0:
        if stl == 'full':
            if bb in (0, 2) or (bb == 3 and rel % 2 == 1): add(mus, kick, t + (BEAT / 2 if bb == 3 else 0), .5)
            if bb in (1, 3): add(mus, clap, t, .45)
            for h in range(2): add(mus, shk, t + h * BEAT / 2, .8 if h else .45)
        elif stl in ('half', 'intro'):
            if bb == 0: add(mus, kick, t, .5)
            if bb == 2: add(mus, clap, t, .4)
            for h in range(2): add(mus, shk, t + h * BEAT / 2, .65 if h else .35)
        elif stl == 'light':
            if bb == 0: add(mus, kick, t, .32)
            add(mus, shk, t + BEAT / 2, .55)
    if stl in ('full', 'light', 'half') and rel % 2 == 1 and t < ENDC:
        tones = ch + [ch[0] + 12, ch[1] + 12]
        for h in range(2):
            idx = MOT[s][bb * 2 + h]
            if idx >= 0: add(mus, marimba(tones[idx] + 12), t + h * BEAT / 2, .07)
kE = KEYS[sect(ENDC) % len(KEYS)]
for i, m in enumerate([72, 76, 79, 76, 77, 76, 74, 72]): add(mus, bell(m + kE), ENDC + .3 + i * BEAT, .07)
for x in bounds[1:-1]: add(mus, crash, x, .45); add(mus, kick, x, .55)
mus *= np.minimum(1, T / .6) * np.clip((DUR - T) / 1.8, 0, 1)

sfx = np.zeros(N)
def tap():
    n = int(.09 * SR); w = lp(rng.standard_normal(n), 9) * env(n, .001, .02); x = np.arange(n) / SR
    return w * .8 + np.sin(2 * np.pi * 95 * x) * env(n, .001, .03) * .7
def thump():
    n = int(.25 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(60 + 70 * np.exp(-x / .02)) / SR) * env(n, .001, .07) + lp(rng.standard_normal(n), 5) * env(n, .001, .03) * .6
def click():
    n = int(.03 * SR); return np.diff(rng.standard_normal(n), prepend=0) * env(n, .0005, .006)
def swish(sec=.5):
    n = int(sec * SR); x = np.linspace(0, 1, n); return lp(rng.standard_normal(n), 14) * np.sin(np.pi * x) ** 2
def dedupe(ts, gap=.07):
    out = []
    for t in sorted(ts):
        if not out or t - out[-1] > gap: out.append(t)
    return out
for t in dedupe(CU['drops']): add(sfx, tap(), t + .3, .33)
for t in dedupe(CU['stamps']): add(sfx, thump(), t + .12, .62)
for t in dedupe(CU['pops'], .1): add(sfx, click(), t + .05, .35)
for t in scenes[1:]: add(sfx, swish(), t - .4, .28)
# cinema shots: a deep boom on the cut in, a rising whoosh just before it
def boom():
    n = int(1.6 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(32 + 40 * np.exp(-x / .08)) / SR) * env(n, .002, .5) + lp(rng.standard_normal(n), 40) * env(n, .002, .25) * .5
def riser(sec=.9):
    n = int(sec * SR); x = np.linspace(0, 1, n); w = rng.standard_normal(n)
    return (lp(w, 30) * (1 - x) + lp(w, 6) * x) * x ** 2.2
for a, b in CU.get('cines', []):
    add(sfx, boom(), a, .55 if a > .1 else .4)
    if a > .5: add(sfx, riser(), a - .9, .35)
mix = mus + sfx
mix = np.tanh(mix * 1.4); mix /= np.max(np.abs(mix)) + 1e-9; mix *= .89
with wave.open(os.path.join(OUTD, 'mix.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote mix.wav', DUR, 'drops', len(CU['drops']), 'stamps', len(CU['stamps']))
