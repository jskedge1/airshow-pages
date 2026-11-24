"""Stand-in for the motion-reel sound steps (music bed, sound effects, mix), synthesized with numpy only.
  python3 _tools/audio.py <film>          writes <film>/audio/music.wav, sfx.wav, mix.wav from beats.json + out/<film>/hits.json
  python3 _tools/audio.py <film> --mux    also muxes mix.wav on to out/<film>/<film>-<format>-video.mp4 -> out/<film>/<film>-<format>.mp4
The bed is one soft piano playing slow broken major chords (C, F, C, G), nothing else.
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

# ---- music: calm and simple.
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
hits = json.loads((OUT / 'hits.json').read_text()) if (OUT / 'hits.json').exists() else []
# Scenes, from the film's own cue list: each one gets its own instruments over the same chords, so the film does
# not sound the same all the way through.  title -> piano -> marimba -> strings and glockenspiel -> guitar -> all together
marks = [0.0] + [off + h[0] * per for h in hits if h[1] in ('zoom', 'section', 'end')][:1] + [off + h[0] * per for h in hits if h[1] == 'section'] + [off + h[0] * per for h in hits if h[1] == 'end']
SCENES = ['title', 'piano', 'marimba', 'strings', 'guitar', 'finale']
def scene(t):
    k = 0
    for i, m in enumerate(marks):
        if t >= m - 0.05: k = i
    return SCENES[min(k, len(SCENES) - 1)]
def felt(f, secs=2.4):
    n = int(secs * SR); tn = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tn) + 0.35 * np.sin(2 * np.pi * 2 * f * tn) * np.exp(-tn / 0.25) + 0.1 * np.sin(2 * np.pi * 3 * f * tn) * np.exp(-tn / 0.12)) * np.minimum(1, tn / 0.012) * np.exp(-tn / 0.7)
def marimba(f, secs=0.8):
    n = int(secs * SR); tn = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tn) + 0.4 * np.sin(2 * np.pi * 4 * f * tn) * np.exp(-tn / 0.03)) * np.minimum(1, tn / 0.003) * np.exp(-tn / 0.16)
def glock(f, secs=1.6):
    n = int(secs * SR); tn = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tn) + 0.3 * np.sin(2 * np.pi * 2.76 * f * tn) * np.exp(-tn / 0.15) + 0.12 * np.sin(2 * np.pi * 5.4 * f * tn) * np.exp(-tn / 0.06)) * np.minimum(1, tn / 0.003) * np.exp(-tn / 0.45)
def pluck(f, secs=1.8, seed=1):   # a soft plucked string (Karplus-Strong)
    n = int(secs * SR); pd = max(2, int(round(SR / f))); buf = lowpass(np.random.default_rng(seed).uniform(-1, 1, pd + 4), 4)[:pd]; out = np.empty(n)
    for i in range(0, n, pd):
        m = min(pd, n - i); out[i:i + m] = buf[:m]; buf = 0.497 * (buf + np.roll(buf, -1))
    tn = np.arange(n) / SR; return out * np.minimum(1, tn / 0.004) * np.minimum(1, (secs - tn) / 0.2)
def strings(f, secs):   # a slow, soft bowed note
    n = int(secs * SR); tn = np.arange(n) / SR; v = sum(np.sin(2 * np.pi * f * k * tn * (1 + 0.002 * np.sin(2 * np.pi * 5 * tn))) / k ** 1.6 for k in (1, 2, 3, 4))
    return v * np.minimum(1, tn / 0.9) * np.minimum(1, np.maximum(0, (secs - tn) / 1.2))
# One soft piano, nothing else: no pad, no bass, no strings, no drums. Four second bars, major chords only
# (C, F, C, G), a low note then a slow broken chord. The shape of the broken chord changes a little from scene
# to scene so the film does not sound identical throughout, but it is always the same quiet instrument.
music = stereo(N)
PENT = ['C', 'D', 'E', 'G', 'A']
CH = [['C', 'E', 'G'], ['F', 'A', 'C'], ['C', 'E', 'G'], ['G', 'B', 'D'], ['C', 'E', 'G'], ['F', 'A', 'C'], ['G', 'B', 'D'], ['C', 'E', 'G']]
ROOT_OCT = {'C': 3, 'F': 3, 'G': 3}
SHAPES = {   # (beat in the bar, chord tone, octave); a bar is eight beats
    'title':   [(0, 0, 4), (4, 2, 4)],
    'piano':   [(0, 0, 4), (2, 2, 4), (4, 1, 4), (6, 2, 4)],
    'marimba': [(0, 0, 4), (2, 1, 4), (3, 2, 4), (5, 1, 4), (6, 0, 5)],
    'strings': [(0, 2, 4), (2, 0, 5), (4, 1, 4), (6, 2, 4)],
    'guitar':  [(0, 0, 4), (1, 1, 4), (2, 2, 4), (4, 0, 5), (6, 2, 4)],
    'finale':  [(0, 0, 4), (2, 2, 4), (4, 0, 5)],
}
span = 8 * per; steps = int(dur / span) + 1
for b in range(steps):
    t0 = off + b * span; ch = CH[b % 8]; sc = scene(t0 + 0.1); r2 = np.random.default_rng(100 + b)
    if t0 > dur - 3: break
    addst(music, t0, felt(hz(ch[0] + str(ROOT_OCT[ch[0]])), 3.2), 0.085, -0.15)          # the low note
    for bt, tone, octv in SHAPES[sc]:
        if bt == 0: continue
        nm = ch[tone]; o2 = octv + (1 if NOTE[nm] < NOTE[ch[0]] else 0)                  # keep the chord rising, not jumping down
        addst(music, t0 + bt * per + float(r2.uniform(0, 0.015)), felt(hz(nm + str(o2)), 2.6), 0.06 * float(r2.uniform(0.8, 1.0)), 0.25 * (-1) ** bt)
music = reverb(music, 1.6, 0.16)
fade = np.clip((dur - np.arange(N) / SR) / 3.5, 0, 1); music *= fade[:, None]

# ---- sound effects: soft, tuned to the music, and far fewer of them. No noise swooshes: a drawn line is a
# quiet two note kalimba figure, a camera move is a low, breathy swell you barely notice.
sfx = stereo(N)
def tuned(name, octave=None):   # nearest note of C major pentatonic
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
    voice = {'title': kalimba, 'piano': kalimba, 'marimba': marimba, 'strings': glock, 'guitar': lambda f, secs=0.8: pluck(f, 1.0, idx), 'finale': glock}[scene(t)]   # each scene has its own little voice
    if kind == 'impact':
        n = int(0.6 * SR); tt = np.arange(n) / SR
        addst(sfx, t, np.sin(2 * np.pi * (62 * tt + 30 * 0.08 * (1 - np.exp(-tt / 0.08)))) * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.2), 0.05)
    elif kind == 'pop':
        addst(sfx, t, voice(tuned(o.get('pitch', 'A4'), 4), 0.7), 0.045, pan)
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
            nz = rng.standard_normal(n); addst(sfx, t - 0.5, (lowpass(nz, 40) - lowpass(nz, 160)) * np.sin(np.pi * tt / 1.4) ** 2, 0.04)
        else:          # a line being drawn: two soft notes going up
            f = tuned(['C4', 'E4', 'G4', 'A4', 'D4'][idx % 5], 4)
            addst(sfx, t, voice(f, 0.6), 0.032, pan); addst(sfx, t + 0.16, voice(f * 1.5, 0.7), 0.028, -pan)
sfx = reverb(sfx, 1.6, 0.22, seed=9)

def write(name, x):
    (F / 'audio').mkdir(exist_ok=True)
    x = np.tanh(x * 3.4); pcm = (np.clip(x, -1, 1) * 30000).astype('<i2')
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
