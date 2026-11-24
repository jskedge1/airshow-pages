"""Stand-in for the motion-reel sound steps (music bed, sound effects, mix), synthesized with numpy only.
  python3 _tools/audio.py <film>          writes <film>/audio/music.wav, sfx.wav, mix.wav from beats.json + out/<film>/hits.json
  python3 _tools/audio.py <film> --mux    also muxes mix.wav on to out/<film>/<film>-<format>-video.mp4 -> out/<film>/<film>-<format>.mp4
The bed is a soft 120 bpm loop (pad, bass, kick, hat, a small bell tune). Cues: impact, pop, whoosh, tick, bell."""
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

# ---- music: 4 bar loop Fmaj7, Am7, Dm7, Cmaj7 (soft and bright)
music = np.zeros(N)
CH = [['F3', 'A3', 'C4', 'E4'], ['A3', 'C4', 'E4', 'G4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']]
BASS = ['F2', 'A2', 'D2', 'C2']; TUNE = [['C5', 'E5', 'A5', 'G5'], ['E5', 'G5', 'C6', 'B5'], ['F5', 'A5', 'D6', 'C6'], ['E5', 'G5', 'B5', 'G5']]
bars = int(dur / (per * 4)) + 1
sections = max(1, bars // 8)
for b in range(bars):
    t0 = off + b * 4 * per; c = b % 4
    last = (b * 4 * per) > dur - 11   # thin out under the end card
    n = int(4 * per * SR * 1.05)
    pad = sum(tone(hz(x), n, 'tri') * 0.5 + tone(hz(x) * 2.003, n) * 0.2 for x in CH[c]) * env(n, 0.25, 2.2)
    add(music, t0, lowpass(pad, 24), 0.055)
    for k in (0, 1.5, 2.5):
        nb = int(per * 1.2 * SR); add(music, t0 + k * per, tone(hz(BASS[c]), nb) * env(nb, 0.01, 0.35), 0.22)
    if b >= 2:
        for k in range(4):
            nk = int(0.25 * SR); t = np.arange(nk) / SR
            if not last or k == 0: add(music, t0 + k * per, np.sin(2 * np.pi * (48 * t + 60 * 0.06 * (1 - np.exp(-t / 0.06)))) * np.exp(-t / 0.09), 0.3)
            nh = int(0.05 * SR)
            if not last: add(music, t0 + (k + 0.5) * per, rng.standard_normal(nh) * np.exp(-np.arange(nh) / SR / 0.012) - 0, 0.035)
    if b >= 4 and (b // 4) % 2 == 1 and not last:
        for k, nm in enumerate(TUNE[c]):
            nn = int(0.6 * SR); add(music, t0 + k * per, (tone(hz(nm), nn) + 0.3 * tone(hz(nm) * 3, nn)) * env(nn, 0.004, 0.18), 0.05)
fade = np.clip((dur - np.arange(N) / SR) / 2.5, 0, 1); music *= fade

# ---- sound effects from the film's cue list
sfx = np.zeros(N)
hits = json.loads((OUT / 'hits.json').read_text()) if (OUT / 'hits.json').exists() else []
for h in hits:
    b, _, kind = h[0], h[1], h[2]; o = h[3] if len(h) > 3 else {}
    t = off + b * per
    if t < 0: continue
    if kind == 'impact':
        n = int(0.5 * SR); tt = np.arange(n) / SR
        add(sfx, t, np.sin(2 * np.pi * (55 * tt + 90 * 0.05 * (1 - np.exp(-tt / 0.05)))) * np.exp(-tt / 0.16), 0.5)
        add(sfx, t, lowpass(rng.standard_normal(n), 6) * np.exp(-tt / 0.05), 0.12)
    elif kind == 'pop':
        f = hz(o.get('pitch', 'C6')); n = int(0.18 * SR); tt = np.arange(n) / SR
        add(sfx, t, np.sin(2 * np.pi * f * tt * (1 + 0.25 * np.exp(-tt / 0.02))) * env(n, 0.002, 0.05), 0.16)
    elif kind == 'tick':
        n = int(0.05 * SR); tt = np.arange(n) / SR
        add(sfx, t, (np.sin(2 * np.pi * 2400 * tt) + 0.5 * rng.standard_normal(n)) * np.exp(-tt / 0.008), 0.07)
    elif kind == 'bell':
        f = hz(o.get('pitch', 'C6')); n = int(1.1 * SR)
        add(sfx, t, (tone(f, n) + 0.4 * tone(f * 2.76, n) + 0.2 * tone(f * 5.4, n)) * env(n, 0.002, 0.3), 0.11)
    elif kind == 'whoosh':
        L = float(o.get('len', 0.6)); n = int(L * SR); tt = np.arange(n) / SR
        f0, f1 = float(o.get('from', 500)), float(o.get('to', 2000))
        nz = rng.standard_normal(n); f = f0 * (f1 / f0) ** (tt / L)
        # a swept band: ring modulated low-passed noise
        band = lowpass(nz, 40) * np.sin(2 * np.pi * np.cumsum(f) / SR) * 6
        add(sfx, t - L * 0.5, band * np.sin(np.pi * tt / L) ** 2, 0.1)

def write(name, x):
    (F / 'audio').mkdir(exist_ok=True)
    x = np.tanh(x * 1.1); pcm = (np.clip(x, -1, 1) * 32000).astype('<i2')
    with wave.open(str(F / 'audio' / name), 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.repeat(pcm, 2).tobytes())
n = int(dur * SR)
write('music.wav', music[:n]); write('sfx.wav', sfx[:n]); write('mix.wav', (music * 0.9 + sfx)[:n])
print('audio', dur, 's,', len(hits), 'cues')
if '--mux' in sys.argv:
    for fmt in cfg.get('formats', ['16x9']):
        v = OUT / f'{film}-{fmt}-video.mp4'
        if not v.exists(): continue
        o = OUT / f'{film}-{fmt}.mp4'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(v), '-i', str(F / 'audio' / 'mix.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(o)], check=True)
        print('wrote', o)
