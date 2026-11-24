"""Stand-in for the motion-reel sound steps (music bed, sound effects, mix), synthesized with numpy only.
  python3 _tools/audio.py <film>          writes <film>/audio/music.wav, sfx.wav, mix.wav from beats.json + out/<film>/hits.json
  python3 _tools/audio.py <film> --mux    also muxes mix.wav on to out/<film>/<film>-<format>-video.mp4 -> out/<film>/<film>-<format>.mp4
The bed is calm and has no drums: a slow pad, a soft bass and a sparse felt piano in D major, with a little reverb.
Cues (impact, pop, whoosh, tick, bell) are soft, tuned to the music and thinned out; there are no noise swooshes."""
import json, sys, wave, pathlib, subprocess
import numpy as np
SR = 44100
film = sys.argv[1]; ROOT = pathlib.Path(__file__).parent.parent; F = ROOT / film; OUT = ROOT / 'out' / film
grid = json.loads((F / 'beats.json').read_text()); cfg = json.loads((F / 'film.json').read_text())
per, off, dur = grid['period'], grid['offset'], float(cfg['duration'])
N = int((dur + 1.5) * SR); rng = np.random.default_rng(7)
NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def hz(name): return 440 * 2 ** ((NOTE[name[:-1]] + 12 * (int(name[-1]) - 4) - 9) / 12)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def add(buf, t, x, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += g * x
def tone(f, n, shape='sine'):
    t = np.arange(n) / SR
    if shape == 'tri': return 2 * np.abs(2 * ((t * f) % 1) - 1) - 1
    return np.sin(2 * np.pi * f * t)
def lowpass(x, k):
    y = np.empty_like(x); a = 0.0
    c = np.cumsum(np.concatenate([np.zeros(k), x])); return (c[k:] - c[:-k]) / k

# ---- music: a calm, warm bed in D major. No drums: a slow pad, a soft bass and a sparse felt-piano line that
# never repeats exactly (seeded), so it sits behind the pictures instead of looping on top of them.
def stereo(n): return np.zeros((n, 2))
def addst(buf, t, x, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += g * l * x; buf[i:i + len(x), 1] += g * r * x
def reverb(x, secs=2.2, mix=0.3, seed=3):
    r = np.random.default_rng(seed); n = int(secs * SR); t = np.arange(n) / SR
    out = np.empty_like(x); size = 1 << int(np.ceil(np.log2(len(x) + n)))
    for ch in range(2):
        ir = r.standard_normal(n) * np.exp(-t / (secs / 5)); ir = lowpass(ir, 10); ir /= np.sqrt((ir ** 2).sum())
        out[:, ch] = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[: len(x)]
    return x * (1 - mix * 0.4) + out * mix
music = stereo(N); keys = stereo(N)
# two bars (4 s) a chord, an eight chord cycle
CH = [['D3', 'F#3', 'A3', 'E4'], ['B2', 'D3', 'F#3', 'A3'], ['G2', 'B2', 'D3', 'F#3'], ['A2', 'C#3', 'E3', 'A3'],
      ['F#2', 'A2', 'D3', 'F#3'], ['G2', 'B2', 'D3', 'G3'], ['E2', 'G2', 'B2', 'E3'], ['A2', 'C#3', 'E3', 'G3']]
PENT = ['D', 'E', 'F#', 'A', 'B']
span = 8 * per; steps = int(dur / span) + 1
for b in range(steps):
    t0 = off + b * span; ch = CH[b % 8]; n = int(span * SR * 1.6); t = np.arange(n) / SR
    env_pad = np.minimum(1, t / 1.6) * np.minimum(1, np.maximum(0, (span * 1.6 - t) / 2.2))
    for k, nm in enumerate(ch):
        f = hz(nm)
        for det, pan in ((-0.0025, -0.6), (0.0025, 0.6)):
            v = (np.sin(2 * np.pi * f * (1 + det) * t) + 0.3 * np.sin(2 * np.pi * 2 * f * (1 + det) * t + 0.3 * np.sin(2 * np.pi * 0.2 * t))) * env_pad
            addst(music, t0, v, 0.03 if k else 0.036, pan)
    nb = int(span * SR); tb = np.arange(nb) / SR   # one long, soft bass note
    addst(music, t0, np.sin(2 * np.pi * hz(ch[0]) / (2 if hz(ch[0]) > 110 else 1) * tb) * np.minimum(1, tb / 0.08) * np.exp(-tb / 2.4), 0.11)
    if b == 0: continue
    # felt piano: three or four gentle notes a chord, chosen from the chord and the pentatonic, different every time
    slots = [0, 2, 3, 5, 6]; r2 = np.random.default_rng(100 + b)
    for sl in sorted(r2.choice(slots, size=3 + (b % 2), replace=False)):
        pool = [x[:-1] for x in ch[1:]] + [PENT[int(r2.integers(0, 5))]]
        nm = pool[int(r2.integers(0, len(pool)))] + str(4 + int(r2.integers(0, 2)))
        f = hz(nm); nn = int(2.4 * SR); tn = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * f * tn) + 0.35 * np.sin(2 * np.pi * 2 * f * tn) * np.exp(-tn / 0.25) + 0.1 * np.sin(2 * np.pi * 3 * f * tn) * np.exp(-tn / 0.12)) * np.minimum(1, tn / 0.012) * np.exp(-tn / 0.7)
        addst(keys, t0 + sl * per + float(r2.uniform(0, 0.02)), v, 0.065 * float(r2.uniform(0.7, 1.0)), float(r2.uniform(-0.5, 0.5)))
music = reverb(music + keys, 2.4, 0.32)
fade = np.clip((dur - np.arange(N) / SR) / 3.5, 0, 1) * np.clip(np.arange(N) / SR / 1.5, 0, 1); music *= fade[:, None]

# ---- sound effects: soft, tuned to the music, and far fewer of them. No noise swooshes: a drawn line is a
# quiet two note kalimba figure, a camera move is a low, breathy swell you barely notice.
sfx = stereo(N)
hits = json.loads((OUT / 'hits.json').read_text()) if (OUT / 'hits.json').exists() else []
def tuned(name, octave=None):   # nearest note of D major pentatonic
    semis = [NOTE[x] for x in PENT]; n0 = NOTE[name[:-1]]; best = min(semis, key=lambda q: min((q - n0) % 12, (n0 - q) % 12))
    return hz(PENT[semis.index(best)] + str(octave if octave is not None else min(5, int(name[-1]))))
def kalimba(f, secs=0.9):
    n = int(secs * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 3.0 * f * t) * np.exp(-t / 0.06)) * np.minimum(1, t / 0.004) * np.exp(-t / 0.22)
last = {}
for idx, h in enumerate(hits):
    b, name, kind = h[0], h[1], h[2]; o = h[3] if len(h) > 3 else {}
    t = off + b * per
    if t < 0: continue
    if kind in last and t - last[kind] < 0.35: continue   # never a run of the same sound
    last[kind] = t; pan = ((idx * 37) % 9 - 4) / 8
    if kind == 'impact':
        n = int(0.6 * SR); tt = np.arange(n) / SR
        addst(sfx, t, np.sin(2 * np.pi * (62 * tt + 30 * 0.08 * (1 - np.exp(-tt / 0.08)))) * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.2), 0.16)
    elif kind == 'pop':
        addst(sfx, t, kalimba(tuned(o.get('pitch', 'A4'), 4), 0.7), 0.045, pan)
    elif kind == 'tick':
        n = int(0.06 * SR); tt = np.arange(n) / SR
        addst(sfx, t, np.sin(2 * np.pi * 880 * tt) * np.minimum(1, tt / 0.002) * np.exp(-tt / 0.012), 0.022, pan)
    elif kind == 'bell':
        f = tuned(o.get('pitch', 'D5'), 5); n = int(1.4 * SR); tt = np.arange(n) / SR
        addst(sfx, t, (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.2)) * np.minimum(1, tt / 0.005) * np.exp(-tt / 0.45), 0.045, pan)
    elif kind == 'whoosh':
        L = float(o.get('len', 0.6))
        if L >= 0.8:   # camera move: a low breath
            n = int(1.4 * SR); tt = np.arange(n) / SR
            nz = rng.standard_normal(n); addst(sfx, t - 0.5, (lowpass(nz, 40) - lowpass(nz, 160)) * np.sin(np.pi * tt / 1.4) ** 2, 0.1)
        else:          # a line being drawn: two soft notes going up
            f = tuned(['D4', 'E4', 'A4', 'B4', 'F#4'][idx % 5], 4)
            addst(sfx, t, kalimba(f, 0.6), 0.032, pan); addst(sfx, t + 0.16, kalimba(f * 1.5, 0.7), 0.028, -pan)
sfx = reverb(sfx, 1.6, 0.22, seed=9)

def write(name, x):
    (F / 'audio').mkdir(exist_ok=True)
    x = np.tanh(x * 1.6) / 1.0; pcm = (np.clip(x, -1, 1) * 30000).astype('<i2')
    with wave.open(str(F / 'audio' / name), 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
n = int(dur * SR)
write('music.wav', music[:n]); write('sfx.wav', sfx[:n]); write('mix.wav', (music + sfx)[:n])
print('audio', dur, 's,', len(hits), 'cues')
if '--mux' in sys.argv:
    for fmt in cfg.get('formats', ['16x9']):
        v = OUT / f'{film}-{fmt}-video.mp4'
        if not v.exists(): continue
        o = OUT / f'{film}-{fmt}.mp4'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(v), '-i', str(F / 'audio' / 'mix.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(o)], check=True)
        print('wrote', o)
