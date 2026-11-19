# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy", "scipy", "soundfile"]
# ///
"""Original score for The Big Guide to UK Airshows promo. 120 BPM, 4/4, D major, 60 bars = 120 s.

Arrangement follows the edit, so it sits quiet under the three talking slots:
  bars  0-3   hook       full groove, impact on bar 0
  bars  4-11  story 1    pad + soft pluck (talking)
  bars 12-15  reveal     lift: half-time kick, pluck, riser into bar 16
  bars 16-19  story 2    pad + soft pluck (talking), riser into bar 20
  bars 20-45  tour       full groove, second half adds a counter line
  bars 46-52  story 3    pad + soft pluck (talking), riser into bar 53
  bars 53-58  end        full groove
  bar  59     resolve    final chord under the end card

    MOTION_REEL_SKILL=<skill> uv run ukag-promo/audio/score.py
"""
import json, os, sys
from pathlib import Path
import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(os.environ["MOTION_REEL_SKILL"]) / "scripts"))
from dsp import SR, Bus, bass_note, clap, crash, hat, kick, midi, note_name, pad_chord, pluck, reverb, riser, \
    sidechain, sub_drop, measure_beats, seed  # noqa: E402

seed(7)
FILM = Path(__file__).resolve().parent.parent
BPM, DUR = 120.0, 120.0
beat = 60 / BPM
NB = int(DUR / beat)          # 240 beats
BARS = NB // 4                # 60 bars

def section(bar):
    if bar < 4: return "hook"
    if bar < 12: return "story"
    if bar < 16: return "reveal"
    if bar < 20: return "story"
    if bar < 46: return "tour"
    if bar < 53: return "story"
    if bar < 59: return "end"
    return "resolve"

root = midi("D3")
# I V vi IV  (D A Bm G), voiced close
LOOP = [(0, ""), (7, ""), (9, "m"), (5, "")]
def chord(off, q):
    r = root + off
    t = 3 if q == "m" else 4
    return [note_name(r), note_name(r + 7), note_name(r + 12 + t), note_name(r + 19)], note_name(r - 12)

drums, bass, music, fx = (Bus(DUR, BPM) for _ in range(4))
full_beats = []
for b in range(NB):
    bar = b // 4
    s = section(bar)
    notes, broot = chord(*LOOP[bar % 4])
    full = s in ("hook", "tour", "end")
    if b % 4 == 0 and s != "resolve":
        L = 4 * beat + 0.1
        cut = 2600 if full else (600, 1500)
        music.add(pad_chord(notes, L, cut, attack=0.01 if full else 0.3), b, 0.34 if full else 0.26)
    # arpeggio: 8ths, quieter in story
    if s != "resolve":
        arp = [notes[1], notes[2], notes[3], notes[2]]
        for k in (0, 1):
            n = arp[(b * 2 + k) % 4]
            n = n[:-1] + str(int(n[-1]) + 1)
            g = 0.16 if full else (0.09 if s == "story" else 0.13)
            music.add(pluck([n], 0.2, 2800 if full else 1800), b + 0.5 * k, g, pan=0.2 if k else -0.2)
    if full:
        full_beats.append(b)
        drums.add(kick(), b, 1.0)
        if b % 2 == 1: drums.add(clap(), b, 0.42, pan=0.05)
        drums.add(hat(), b + 0.5, 0.22, pan=0.25)
        if s == "tour" and bar >= 32:
            drums.add(hat(), b + 0.25, 0.07, pan=-0.3); drums.add(hat(), b + 0.75, 0.07, pan=-0.3)
        for h in (0, 0.5):
            bass.add(bass_note(broot, beat / 2 * 0.9, 1100), b + h, 0.6 if h == 0 else 0.48)
        if s == "tour" and bar >= 32 and b % 4 == 2:
            hi = [notes[2][:-1] + str(int(notes[2][-1]) + 1), notes[3][:-1] + str(int(notes[3][-1]) + 1)]
            music.add(pluck(hi, 0.5, 3600), b, 0.14, pan=0.35)
    elif s == "reveal":
        if b % 2 == 0: drums.add(kick(soft=True), b, 0.7)
        drums.add(hat(), b + 0.5, 0.12, pan=0.25)
        bass.add(bass_note(broot, beat * 1.8, 700), b, 0.4) if b % 2 == 0 else None
    elif s == "story":
        if b % 4 == 0: bass.add(bass_note(broot, beat * 3.6, 380), b, 0.3)

# landings
def land(bar, big=True):
    b0 = bar * 4
    fx.add(crash(1.6), b0, 0.26 if big else 0.16)
    fx.add(sub_drop(1.1, 78, 30), b0, 0.55 if big else 0.35)
for bar in (0, 12, 20, 53):
    land(bar)
for bar in (4, 16, 46):
    fx.add(crash(2.0), bar * 4, 0.1)
for bar in (16, 20, 53):        # risers into these
    r = riser(2 * 4 * beat)
    fx.add(r, bar * 4 - len(r) / SR / beat, 0.22)
# resolve
notes, broot = chord(0, "")
music.add(pad_chord(notes + [note_name(midi(notes[-1]) + 5)], 4 * beat + 1.2, (5000, 1400), attack=0.005, release=0.9), 236, 0.5)
drums.add(kick(), 236, 1.0); fx.add(crash(2.4), 236, 0.3); fx.add(sub_drop(1.2, 70, 30), 236, 0.5)
bass.add(bass_note(broot, 3.5, 700), 236, 0.5)

N = drums.n
duck = sidechain([i * beat for i in full_beats], drums.x.shape[1], 0.45, 0.1)
mix = drums.x + fx.x + (bass.x + reverb(music.x, 0.32)) * duck
mix = mix[:, :N]
fo = int(0.6 * SR); mix[:, -fo:] *= np.linspace(1, 0, fo) ** 2
mix *= 10 ** (-3 / 20) / (np.abs(mix).max() + 1e-9)
sf.write(FILM / "audio/music.wav", mix.T.astype(np.float32), SR)

# grid: measured on a steady click stem so quiet sections can't throw it
click = Bus(DUR, BPM)
for b in range(NB): click.add(kick(), b, 1.0)
grid = measure_beats(click.x[:, :N].mean(axis=0).astype(np.float32), SR, BPM, n_beats=NB + 1)
grid["sections"] = [{"name": n, "beat": b} for n, b in
                    [("hook", 0), ("story1", 16), ("reveal", 48), ("story2", 64), ("tour", 80), ("story3", 184), ("end", 212), ("resolve", 236)]]
grid["source"] = "score.py 120 bpm D major, grid measured on a click stem"
(FILM / "beats.json").write_text(json.dumps(grid, indent=1))
print("music.wav", mix.shape[1] / SR, "s; grid offset", grid["offset"], "period", grid["period"])
