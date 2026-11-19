# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy", "scipy", "soundfile"]
# ///
"""Original score for The Big Guide to UK Airshows promo. 120 BPM, 4/4, D major (D A Bm G).

The arrangement follows timeline.json (written by vo.py), so the music always matches the edit:
  quiet  cold open: wind, a distant crowd murmur, a low drone, no beat
  hook   title: full groove from an impact
  soft   talking slots: pad, soft pluck, sub notes
  lift   reveal: half-time kick, riser into the tour
  jet    aircraft interludes: full groove (the first one is the tour's drop)
  tour   feature tour: full groove, counter line in the second half
  end    full groove, resolving on the last bar
Comic timing: the music cuts out under the pause before the line marked "drop" in vo.py and comes back on the end card.
Also writes audio/jets.wav: synthesized jet passes, mixed into the SFX stem by fx.py.

    MOTION_REEL_SKILL=<skill> uv run ukag-promo/audio/score.py
"""
import json, os, sys
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy import signal

sys.path.insert(0, str(Path(os.environ["MOTION_REEL_SKILL"]) / "scripts"))
from dsp import SR, Bus, bass_note, clap, crash, hat, kick, midi, note_name, pad_chord, pluck, reverb, riser, \
    sidechain, sub_drop, measure_beats, seed  # noqa: E402

seed(7)
FILM = Path(__file__).resolve().parent.parent
TL = json.loads((FILM / "timeline.json").read_text())
DUR = float(TL["duration"])
BPM = 120.0
beat = 60 / BPM
NB = int(round(DUR / beat))
SECS = TL["sections"]
LINES = TL["lines"]

def sec_at(t):
    for s in SECS:
        if s["start"] <= t < s["end"]:
            return s
    return SECS[-1]

def B(t):            # seconds -> beat index
    return t / beat

root = midi("D3")
LOOP = [(0, ""), (7, ""), (9, "m"), (5, "")]
def chord(off, q):
    r = root + off
    t = 3 if q == "m" else 4
    return [note_name(r), note_name(r + 7), note_name(r + 12 + t), note_name(r + 19)], note_name(r - 12)

tour_start = next(s["start"] for s in SECS if s["kind"] == "jet")
tour_end = max(s["end"] for s in SECS if s["kind"] in ("tour", "jet"))
tour_mid = (tour_start + tour_end) / 2
end_sec = SECS[-1]
chair = next(l for l in LINES if l.get("mark") == "drop")
silence = (chair["start"] - 1.25, end_sec["start"])          # music out for the punchline

drums, bass, music, fx = (Bus(DUR, BPM) for _ in range(4))
full_beats = []
for b in range(NB):
    t = b * beat
    s = sec_at(t)
    k = s["kind"]
    if silence[0] <= t < silence[1]:
        continue
    bar = b // 4
    notes, broot = chord(*LOOP[bar % 4])
    last_bar = t >= DUR - 2 * 4 * beat
    full = k in ("hook", "jet", "tour", "end") and not last_bar
    if k == "quiet":
        if b % 8 == 0:
            n0, _ = chord(0, "")
            music.add(pad_chord(n0[:2], 8 * beat + 0.5, (300, 700), attack=1.2, release=1.2), b, 0.16)
        continue
    if b % 4 == 0 and not last_bar:
        L = 4 * beat + 0.1
        music.add(pad_chord(notes, L, 2600 if full else (600, 1500), attack=0.01 if full else 0.3), b, 0.34 if full else 0.26)
    if not last_bar:
        arp = [notes[1], notes[2], notes[3], notes[2]]
        for h in (0, 1):
            n = arp[(b * 2 + h) % 4]
            n = n[:-1] + str(int(n[-1]) + 1)
            g = 0.16 if full else (0.08 if k == "soft" else 0.13)
            music.add(pluck([n], 0.2, 2800 if full else 1800), b + 0.5 * h, g, pan=0.2 if h else -0.2)
    if full:
        full_beats.append(b)
        drums.add(kick(), b, 1.0)
        if b % 2 == 1: drums.add(clap(), b, 0.42, pan=0.05)
        drums.add(hat(), b + 0.5, 0.22, pan=0.25)
        if k in ("tour", "jet") and t >= tour_mid:
            drums.add(hat(), b + 0.25, 0.07, pan=-0.3); drums.add(hat(), b + 0.75, 0.07, pan=-0.3)
            if b % 4 == 2:
                hi = [n[:-1] + str(int(n[-1]) + 1) for n in notes[2:]]
                music.add(pluck(hi, 0.5, 3600), b, 0.13, pan=0.35)
        for h in (0, 0.5):
            bass.add(bass_note(broot, beat / 2 * 0.9, 1100), b + h, 0.6 if h == 0 else 0.48)
    elif k == "lift":
        if b % 2 == 0: drums.add(kick(soft=True), b, 0.7)
        drums.add(hat(), b + 0.5, 0.12, pan=0.25)
        if b % 2 == 0: bass.add(bass_note(broot, beat * 1.8, 700), b, 0.4)
    elif k == "soft":
        if b % 4 == 0: bass.add(bass_note(broot, beat * 3.6, 380), b, 0.3)

# landings and risers on section changes
for s in SECS:
    b0 = B(s["start"])
    if s["kind"] == "hook" or s is end_sec or (s["kind"] == "jet" and s["start"] == tour_start):
        fx.add(crash(1.6), b0, 0.26); fx.add(sub_drop(1.1, 78, 30), b0, 0.55)
        if b0 >= 8:
            r = riser(4 * beat)
            fx.add(r, b0 - len(r) / SR / beat, 0.2)
    elif s["kind"] == "soft":
        fx.add(crash(2.0), b0, 0.08)
# resolve on the last two bars
nb_last = NB - 8
notes, broot = chord(0, "")
music.add(pad_chord(notes + [note_name(midi(notes[-1]) + 5)], 8 * beat + 1.0, (5000, 1200), attack=0.005, release=1.5), nb_last, 0.42)
drums.add(kick(), nb_last, 1.0); fx.add(crash(2.6), nb_last, 0.28); bass.add(bass_note(broot, 4.0, 600), nb_last, 0.45)

N = int(SR * DUR)
duck = sidechain([i * beat for i in full_beats], drums.x.shape[1], 0.45, 0.1)
mix = drums.x + fx.x + (bass.x + reverb(music.x, 0.32)) * duck
mix = mix[:, :N]

# field ambience under the cold open: wind (slow filtered noise) + distant crowd murmur
rng = np.random.default_rng(3)
o_end = SECS[0]["end"]
n_amb = int((o_end + 1.5) * SR)
wind = signal.sosfilt(signal.butter(2, [120, 900], "bandpass", fs=SR, output="sos"), rng.standard_normal((2, n_amb)))
gust = 0.6 + 0.4 * np.sin(np.linspace(0, 2 * np.pi * 0.17 * n_amb / SR, n_amb) + np.array([[0], [1.3]]))
crowd = signal.sosfilt(signal.butter(4, [250, 1800], "bandpass", fs=SR, output="sos"), rng.standard_normal((2, n_amb)))
crowd *= 0.5 + 0.5 * np.abs(signal.sosfilt(signal.butter(1, 3, fs=SR, output="sos"), rng.standard_normal((2, n_amb))) * 6).clip(0, 1)
amb = wind * gust * 0.05 + crowd * 0.012
env = np.ones(n_amb); f = int(0.8 * SR); env[:f] = np.linspace(0, 1, f); env[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
mix[:, :n_amb] += amb * env

fo = int(0.8 * SR); mix[:, -fo:] *= np.linspace(1, 0, fo) ** 2
mix *= 10 ** (-3 / 20) / (np.abs(mix).max() + 1e-9)
sf.write(FILM / "audio/music.wav", mix.T.astype(np.float32), SR)

# ---------------------------------------------------------------- jet passes (separate stem)
def jet_pass(length=4.0, peak_at=0.55, big=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    tc = length * peak_at
    x = rng.standard_normal(n)
    # distance envelope: approach, loud overhead, recede (longer tail)
    d = np.where(t < tc, (tc - t) / tc, (t - tc) / (length - tc) * 0.8)
    amp = 1 / (0.08 + 4 * d ** 2)
    amp /= amp.max()
    out = np.zeros(n)
    # roar: lowpass swept from high (approaching) to low (receding): the doppler drop
    for f0, g in ((900, 1.0), (300, 0.9), (90, 0.8)):
        fc = f0 * np.where(t < tc, 1.6, 0.55) ** np.clip(np.abs(t - tc) / 1.2, 0, 1)
        blk = 512
        y = np.zeros(n)
        for i in range(0, n, blk):
            sos = signal.butter(2, min(fc[i], SR / 2 - 100), "lowpass", fs=SR, output="sos")
            y[i:i + blk] = signal.sosfilt(sos, x[i:i + blk])
        out += g * y / (np.abs(y).max() + 1e-9)
    # turbine whine on approach
    whine = np.sin(2 * np.pi * np.cumsum(np.where(t < tc, 2400, 1500) * (1 + 0.02 * np.sin(t * 7))) / SR)
    out += 0.12 * whine * np.clip(1 - t / tc, 0, 1) ** 0.5
    out *= amp
    pan = np.clip((t - tc) / (length * 0.5), -1, 1)           # left to right
    st = np.stack([out * np.sqrt((1 - pan) / 2), out * np.sqrt((1 + pan) / 2)])
    return big * st / (np.abs(st).max() + 1e-9)

jets = np.zeros((2, N + SR * 5))
def put(sig, t):
    i = int(t * SR); m = min(sig.shape[1], jets.shape[1] - i); jets[:, i:i + m] += sig[:, :m]
# the gag: the jet drowns him out after the line marked "jet" in vo.py
here = next(l for l in LINES if l.get("mark") == "jet")
put(jet_pass(4.2, 0.45, 1.0), here["end"] - 0.5)
for s in SECS:
    if s["kind"] == "jet":
        put(jet_pass(3.2, 0.5, 0.55), s["start"] - 1.1)
title = next(s for s in SECS if s["kind"] == "hook")
put(jet_pass(3.0, 0.5, 0.45), title["start"] - 0.9)
jets = jets[:, :N]
sf.write(FILM / "audio/jets.wav", (jets.T * 0.7).astype(np.float32), SR)

# ---------------------------------------------------------------- grid
click = Bus(DUR, BPM)
for b in range(NB): click.add(kick(), b, 1.0)
grid = measure_beats(click.x[:, :N].mean(axis=0).astype(np.float32), SR, BPM, n_beats=NB + 1)
grid["sections"] = [{"name": s["id"], "beat": round(B(s["start"]))} for s in SECS]
grid["source"] = "score.py 120 bpm D major, sections from timeline.json, grid measured on a click stem"
(FILM / "beats.json").write_text(json.dumps(grid, indent=1))
print(f"music.wav {N / SR:.1f} s, jets.wav; grid offset {grid['offset']} period {grid['period']}")
