# Trailer score for the cinematic cut (cine.js), all synthesised in code, nothing downloaded.
# A low drone and heartbeat under the cold open, a string ostinato that rises shot by shot with a deep impact
# on every cut, a breath before the title card, then a driving 104 bpm section under the glass effect words,
# a last big hit for "Your summer starts here" and the house bell tune on the end card.
import json, wave, os
import numpy as np
D = os.path.dirname(os.path.abspath(__file__))
OUTD = os.path.join(D, os.environ.get('OUT', 'out'))
CU = json.load(open(os.path.join(OUTD, 'cues.json')))
DUR = CU['dur']; SR = 44100; N = int(SR * (DUR + .5)); T = np.arange(N) / SR
BPM = 104; B = 60 / BPM
rng = np.random.default_rng(5)
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
def saw(f, n, harm=14):
    x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * h * x) / h for h in range(1, harm + 1)) * .55
impacts = sorted(CU.get('impacts', [])); hits = sorted(CU.get('hits', []))
end = max(CU['scenes']) if CU['scenes'] else DUR - 5.5
cold = impacts[0] if impacts else 5 * B
glass0 = 31 * B; brk = 27 * B; fin = 62.5 * B
# intensity curve 0..1: rises through the montage, dips for the title card, full under the glass words
I = np.clip((T - cold) / (brk - cold), 0, 1) ** 1.3 * .85 + .15
I = np.where(T < cold, .12, I)
I = np.where((T >= brk) & (T < glass0), .1, I)
I = np.where(T >= glass0, .9, I); I = np.where(T >= fin, 1.0, I); I = np.where(T >= end, .5, I)
I = lp(I, int(.25 * SR))
mus = np.zeros(N)
# drone: D1 and A1, slowly beating
dr = (np.sin(2 * np.pi * hz(38) * T) + .6 * np.sin(2 * np.pi * hz(45) * 1.002 * T) + .3 * np.sin(2 * np.pi * hz(50) * T)) * .16
mus += dr * np.clip(T / 1.5, 0, 1) * np.clip((end + 1 - T) / 1.5, 0, 1)
# chord plan (minor, then lifting to the relative major for the glass section)
PRE = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]]     # Dm Bb C A
POST = [[46, 50, 53], [48, 52, 55], [50, 53, 57], [45, 49, 52]]    # Bb C Dm A
def chord(t):
    bar = int(t / (4 * B)); return (PRE if t < glass0 else POST)[bar % 4]
# string ostinato in eighths
for k in range(int(DUR / (B / 2))):
    t = k * B / 2
    if t < cold or (brk <= t < glass0 - .1) or t >= end: continue
    ch = chord(t); m = [ch[0] - 12, ch[0], ch[1] - 12, ch[0]][k % 4]
    n = int(B / 2 * SR * .95); s = lp(saw(hz(m), n), 6) * env(n, .004, .18)
    add(mus, s, t, .2 * I[min(N - 1, int(t * SR))])
# pad swells every bar
for b in range(0, int(DUR / (4 * B)) + 1):
    t = b * 4 * B
    if t < cold - .1 or (brk <= t < glass0) or t >= end: continue
    n = int(4 * B * SR)
    x = np.arange(n) / SR; sw = np.sin(np.pi * x / x[-1]) ** 1.5
    for m in chord(t):
        add(mus, lp(saw(hz(m + 12), n, 8), 20) * sw, t, .05 * I[int(t * SR)])
# drums under the glass section
kn = int(.45 * SR); kx = np.arange(kn) / SR
kick = np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-kx / .03)) / SR) * np.exp(-kx / .16)
nz = rng.standard_normal(int(3 * SR))
snare = (np.diff(nz[:int(.22 * SR)], prepend=0) * .5 + np.sin(2 * np.pi * 190 * np.arange(int(.22 * SR)) / SR) * .4) * env(int(.22 * SR), .001, .06)
hat = np.diff(np.diff(nz[:int(.05 * SR)], prepend=0), prepend=0) * env(int(.05 * SR), .002, .012) * .12
def tom(f):
    n = int(.35 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f + f * .8 * np.exp(-x / .04)) / SR) * env(n, .001, .14)
for b in range(int(DUR / B) + 1):
    t = b * B; bb = b % 4
    if glass0 <= t < end - .05:
        add(mus, kick, t, .55)
        if bb in (1, 3): add(mus, snare, t, .42)
        for h in range(2): add(mus, hat, t + h * B / 2, .9 if h else .5)
    elif cold <= t < brk:
        # war drums that build through the montage
        if bb == 0: add(mus, tom(70), t, .35 + .4 * I[int(t * SR)])
        if bb == 2 and t > cold + 8 * B: add(mus, tom(90), t, .3 * I[int(t * SR)])
        if t > brk - 4 * B: add(mus, tom(110), t + B / 2, .35)
# heartbeat in the cold open
for t in np.arange(.6, cold - .3, B * 2):
    add(mus, kick, t, .35); add(mus, kick, t + .22, .22)
# bell tune on the end card
def bell(m):
    n = int(1.4 * SR); x = np.arange(n) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * x) + .4 * np.sin(4 * np.pi * f * x) * np.exp(-x / .25) + .2 * np.sin(2 * np.pi * f * 3.01 * x) * np.exp(-x / .1)) * env(n, .002, .5)
for i, m in enumerate([74, 77, 81, 79, 77, 76, 74, 81]): add(mus, bell(m), end + .3 + i * B, .07)
for m in [50, 57, 62, 65]: add(mus, lp(saw(hz(m), int(5 * SR), 8), 20) * env(int(5 * SR), .3, 2.2), end, .06)
mus *= np.minimum(1, T / .4) * np.clip((DUR - T) / 2.0, 0, 1)

sfx = np.zeros(N)
def boom(sec=2.2):
    n = int(sec * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * np.cumsum(30 + 55 * np.exp(-x / .07)) / SR) * env(n, .001, .7)
            + lp(rng.standard_normal(n), 30) * env(n, .001, .3) * .6 + np.diff(rng.standard_normal(n), prepend=0) * env(n, .001, .05) * .25)
def riser(sec=1.2):
    n = int(sec * SR); x = np.linspace(0, 1, n); w = rng.standard_normal(n)
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * x ** 2) / SR) * .15
    return ((lp(w, 40) * (1 - x) + lp(w, 5) * x) * .8 + tone) * x ** 2.4
def braam(sec=3.0):
    n = int(sec * SR); s = sum(lp(saw(hz(m), n, 10), 4) for m in (26, 38, 45, 50))
    return np.tanh(s * 1.5) * env(n, .01, 1.1)
def tick():
    n = int(.03 * SR); return np.diff(rng.standard_normal(n), prepend=0) * env(n, .0005, .006)
def thump():
    n = int(.25 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(60 + 70 * np.exp(-x / .02)) / SR) * env(n, .001, .07)
for t in impacts:
    big = t < brk and (t - cold) % (6 * B) < .05 or t >= fin - .05
    add(sfx, boom(), t, .75 if big else .45)
    if big: add(sfx, riser(), t - 1.2, .4)
add(sfx, riser(2.2), glass0 - 2.2, .55); add(sfx, braam(), glass0, .35); add(sfx, boom(3), glass0, .8)
add(sfx, braam(), fin, .3)
for t in hits:
    if glass0 + .1 < t < end - .1: add(sfx, boom(1.2), t, .3)
for t in CU.get('stamps', []): add(sfx, thump(), t + .1, .4)
for t in CU.get('pops', []): add(sfx, tick(), t + .05, .3)
add(sfx, boom(3), end + .25, .7)
mix = mus + sfx
mix = np.tanh(mix * 1.3); mix /= np.max(np.abs(mix)) + 1e-9; mix *= .89
with wave.open(os.path.join(OUTD, 'mix.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote mix.wav', round(DUR, 2), 'impacts', len(impacts), 'hits', len(hits))
