# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy", "scipy", "soundfile"]
# ///
"""Cinematic airshow score on a film's existing beat grid (beats.json is read, never rewritten), so the
picture and its sound hits stay where they are and only the music changes.

    MOTION_REEL_SKILL=<skill> uv run _build/cinematic.py <film> --tonic D --end <beat> [--seed N] [--sections b1,b2,...]

Strings-style pads that swell, a driving string ostinato, low brass, timpani-like drums that build, cymbal
swells into each section start and a big resolve under the end card. Writes <film>/audio/music.wav.
"""
import argparse, json, os, sys
from pathlib import Path
import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(os.environ['MOTION_REEL_SKILL']) / 'scripts'))
import dsp  # noqa: E402
from dsp import SR, Bus, bass_note, crash, filt, kick, midi, note_name, pad_chord, pluck, reverb, riser, sub_drop, tvec  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('film'); ap.add_argument('--tonic', default='D'); ap.add_argument('--seed', type=int, default=5)
ap.add_argument('--end', type=float, required=True, help='beat where the end card lands (the big resolve)')
ap.add_argument('--sections', default='', help='beats where new sections start (cymbal swell into each)')
ap.add_argument('--soft', action='store_true', help='gentler drums and swells (the calm visit film)')
a = ap.parse_args()
film = Path(a.film)
grid = json.loads((film / 'beats.json').read_text())
dur = json.loads((film / 'film.json').read_text())['duration']
bpm = 60 / grid['period']; off = grid['offset']
dsp.seed(a.seed)
N = int(round((dur - off) / grid['period']))
secs = sorted(float(x) for x in a.sections.split(',') if x)

root = midi(f'{a.tonic}3')
# heroic progression, 2 bars each: I  V  vi  IV  |  I  bVII  IV  V
PROG = [(0, ''), (7, ''), (9, 'm'), (5, ''), (0, ''), (10, ''), (5, ''), (7, '')]
def chord(deg, q, octv=0):
    r = root + deg + 12 * octv; third = 3 if q == 'm' else 4
    return [note_name(r), note_name(r + 7), note_name(r + 12 + third), note_name(r + 19)]

def timp(f0=70):
    n = int(0.9 * SR); t = tvec(n)
    f = f0 * (1 + 0.25 * np.exp(-t / 0.04))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    skin = filt(dsp.rng.standard_normal(n) * np.exp(-t / 0.03), 'bandpass', (500, 1400)) * 0.25
    return np.tanh(1.5 * (body + skin))

def brass(notes, length):
    n = int(length * SR); t = tvec(n)
    x = sum(dsp.saw(dsp.hz(nt), n, phase0=dsp.rng.uniform()) + dsp.saw(dsp.hz(nt) * 1.003, n) for nt in notes)
    x = dsp.sweep_filter(x, 300 + 1400 * (1 - np.exp(-t / 0.35)), 'lowpass', 0.9)
    return x / len(notes) * dsp.adsr(n, 0.12, 0.4, 0.8, 0.3)

strings, ost, low, perc, fx = (Bus(dur, bpm) for _ in range(5))
end = a.end
for b in range(0, N, 8):                       # one chord per 2 bars (8 beats)
    deg, q = PROG[(b // 8) % len(PROG)]
    if b >= end: deg, q = 0, ''
    L = min(8, max(1, (end if b < end else N) - b)) * grid['period'] + 0.6
    lift = min(1, b / max(end * 0.5, 1))
    strings.add(pad_chord(chord(deg, q), L, (500 + 2600 * lift, 900 + 3800 * lift), attack=0.9, release=0.9, voices=5, detune=0.08), b, 0.55 + 0.25 * lift)
    if b >= 8: low.add(brass([note_name(root + deg - 12), note_name(root + deg - 5)], L), b, 0.32 + 0.18 * lift)
    low.add(bass_note(note_name(root + deg - 24), L, cutoff=300), b, 0.45)
# driving string ostinato in eighths, from bar 3 up to the end card
for b in range(8, int(end)):
    deg, q = PROG[(b // 8) % len(PROG)]
    ch = chord(deg, q, 1)
    for h in (0, 0.5):
        nt = [ch[0], ch[1], ch[2], ch[1]][int((b * 2 + h * 2) % 4)]
        ost.add(pluck([nt], length=0.18, cutoff=2400), b + h, 0.22 if h else 0.3)
# timpani: downbeats from bar 5, rolls into each section, heavier towards the end
for b in range(16, int(end), 4):
    perc.add(timp(dsp.hz(note_name(root - 12))), b, 0.5)
    perc.add(kick(soft=True), b, 0.5)
    if b % 8 == 4: perc.add(timp(dsp.hz(note_name(root - 5))), b + 1.5, 0.3)
for s in secs:
    if s < 2 or s >= N: continue
    fx.add(riser(min(2.2, 3 * grid['period'])), s - min(2.2, 3 * grid['period']) / grid['period'], 0.035)
    fx.add(filt(crash(2.2), 'lowpass', 7000), s, 0.05)
    for k in range(4): perc.add(timp(dsp.hz(note_name(root - 12 + [0, 3, 5, 7][k]))), s - 1 + k * 0.25, 0.25 + k * 0.05)
# the big resolve under the end card
fx.add(sub_drop(1.6), end, 0.4); fx.add(filt(crash(3.0), 'lowpass', 7000), end, 0.09)
strings.add(pad_chord(chord(0, '', 1), (N - end) * grid['period'] + 1, (1500, 5000), attack=0.05, release=1.2), end, 0.5)
low.add(brass([note_name(root - 12), note_name(root - 5), note_name(root)], (N - end) * grid['period'] + 1), end, 0.45)
perc.add(timp(dsp.hz(note_name(root - 12))), end, 0.7)

pg, fg = (0.3, 0.4) if a.soft else (1.0, 1.0)
mix = reverb(strings.x, 0.45, length=2.6, decay=0.9) + reverb(ost.x, 0.25) * (0.6 if a.soft else 1) + reverb(low.x, 0.25) + reverb(perc.x, 0.3, length=1.8, decay=0.6) * pg + reverb(fx.x, 0.15) * fg
n = int(dur * SR); mix = mix[:, :n]
shift = int(off * SR); mix = np.concatenate([np.zeros((2, shift)), mix[:, :n - shift]], axis=1)
fade = int(0.6 * SR); mix[:, -fade:] *= np.linspace(1, 0, fade)
mix = mix / np.max(np.abs(mix)) * 10 ** (-3 / 20)
sf.write(film / 'audio' / 'music.wav', mix.T, SR, subtype='PCM_24')
print(f'cinematic {a.tonic} major, {bpm:.1f} bpm, end card at beat {end}: -> {film}/audio/music.wav')
