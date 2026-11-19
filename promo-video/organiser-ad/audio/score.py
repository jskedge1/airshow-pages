# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy", "scipy", "soundfile"]
# ///
"""Bespoke cinematic score for the UK Airshow Guide organiser advert.

    MOTION_REEL_SKILL=<skill> uv run organiser-ad/audio/score.py

96 BPM, 4/4, 72 beats = 45.0 s, D minor lifting to F major for the end card.
  b0-8    hook      boom + sub, low strings Dm, ticking pluck ostinato
  b8-24   pitch     pulse kick, ostinato, strings Dm Bb F C
  b24-40  steps     toms + hats join, 8th bass, riser into b40
  b40-56  benefits  full groove: kick, clap 2/4, 16th hats, brass stabs on bar starts
  b56-64  together  drums thin to a tom build, swell into b64
  b64-72  end       impact, held F major chord, ring out
Writes music.wav + beats.json (grid measured on the drum stem).
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
import soundfile as sf


def _skill_dir():
    if os.environ.get("MOTION_REEL_SKILL"):
        return Path(os.environ["MOTION_REEL_SKILL"])
    found = sorted((Path.home() / ".claude/plugins").glob("**/skills/motion-reel/scripts/dsp.py"))
    if found:
        return found[-1].parent.parent
    sys.exit("set MOTION_REEL_SKILL to the motion-reel skill folder")


sys.path.insert(0, str(_skill_dir() / "scripts"))
import dsp  # noqa: E402
from dsp import SR, Bus, adsr, bass_note, clap, crash, filt, hat, kick, measure_beats, pad_chord, pluck, \
    reverb, riser, saw, sidechain, sub_drop, sweep_filter, tvec  # noqa: E402

HERE = Path(__file__).resolve().parent
FILM = HERE.parent
BPM = 96
BEAT = 60 / BPM
DUR = 45.0
NB = 72
N = int(SR * DUR)
dsp.seed(20271119)
rng = dsp.rng


def T(b):
    return b * BEAT


def boom(f0=55, length=2.4):
    """Cinematic hit: pitched-down body, noise slap, long tail."""
    n = int(length * SR)
    t = tvec(n)
    f = f0 + 90 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7)
    slap = filt(dsp.rng.standard_normal(n) * np.exp(-t / 0.03), "bandpass", [120, 2400]) * 0.6
    return np.tanh(2.0 * (body + slap)) * (1 - np.exp(-t / 0.002))


def tom(f0=90, length=0.6):
    n = int(length * SR)
    t = tvec(n)
    f = f0 * (1 + 0.6 * np.exp(-t / 0.04))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    x += filt(dsp.rng.standard_normal(n) * np.exp(-t / 0.015), "lowpass", 1800) * 0.35
    return np.tanh(1.6 * x)


def strings(notes, length, cutoff=(700, 1800)):
    return pad_chord(notes, length, cutoff, attack=0.7, release=0.6, voices=5, detune=0.09)


def brass(notes, length):
    n = int(length * SR)
    t = tvec(n)
    x = sum(saw(dsp.hz(nt), n, phase0=rng.uniform()) + saw(dsp.hz(nt) * 1.004, n) for nt in notes)
    x = sweep_filter(x, 500 + 2600 * np.exp(-t / 0.18) * (1 - np.exp(-t / 0.03)), "lowpass", 1.0)
    return x * adsr(n, 0.02, 0.3, 0.55, 0.25) / len(notes)


# harmony per bar (4 beats): Dm Bb F C, ending on F
CH = {
    "Dm": (["D3", "A3", "D4", "F4"], "D2"),
    "Bb": (["Bb2", "F3", "Bb3", "D4"], "Bb1"),
    "F": (["F2", "C3", "F3", "A3"], "F1"),
    "C": (["C3", "G3", "C4", "E4"], "C2"),
    "Gm": (["G2", "D3", "G3", "Bb3"], "G1"),
}
LOOP = ["Dm", "Bb", "F", "C"]


def chord_for_bar(bar):
    if bar >= 16:
        return "F"
    if bar in (14, 15):
        return ["Gm", "C"][bar - 14]
    return LOOP[bar % 4]


def main():
    drums, perc, bass, music, fx = (Bus(DUR, BPM) for _ in range(5))

    # ---- hook
    fx.add(boom(50, 3.0), 0, 0.9)
    fx.add(sub_drop(1.6, 70, 28), 0, 0.5)
    fx.add(crash(3.0), 0, 0.18)

    # strings every bar
    for bar in range(16):
        notes, _ = CH[chord_for_bar(bar)]
        bright = (700, 1500) if bar < 6 else (900, 2600) if bar < 10 else (1400, 3800)
        music.add(strings(notes, T(4) + 0.5, bright), bar * 4, 0.42 if bar < 10 else 0.38)

    # pluck ostinato (8ths), from beat 0, gets brighter
    for b2 in range(0, 2 * 64):
        beat = b2 / 2
        bar = int(beat // 4)
        if 56 <= beat < 60:
            continue
        notes, _ = CH[chord_for_bar(bar)]
        seq = [notes[2], notes[3], notes[1], notes[3]]
        nt = seq[b2 % 4]
        nt = nt[:-1] + str(int(nt[-1]) + 1)
        cut = 1400 if beat < 8 else 2200 if beat < 40 else 3200
        music.add(pluck([nt], 0.28, cut), beat, 0.16 if beat < 8 else 0.2, pan=0.3 if b2 % 2 else -0.3)

    # ---- pulse
    for b in range(8, 56):
        drums.add(kick(soft=b < 24), b, 0.55 if b < 24 else 0.9)
    for b in range(24, 56):
        drums.add(hat(), b + 0.5, 0.16, pan=0.25)
        if b % 4 == 3:
            perc.add(tom(110), b + 0.5, 0.35, pan=-0.2)
            perc.add(tom(85), b + 0.75, 0.35, pan=0.2)
    for b in range(40, 56):
        if b % 2 == 1:
            drums.add(clap(), b, 0.45)
        for s in (0.25, 0.75):
            drums.add(hat(), b + s, 0.07, pan=-0.3)

    # bass 8ths from the steps
    for b2 in range(48, 112):
        beat = b2 / 2
        _, root = CH[chord_for_bar(int(beat // 4))]
        nt = root[:-1] + str(int(root[-1]) + (1 if (b2 % 2 and beat >= 40) else 0))
        bass.add(bass_note(nt, BEAT / 2 * 0.85, 900 if beat < 40 else 1300), beat, 0.55)

    # brass stabs on bar starts in the benefits section
    for bar in range(10, 14):
        notes, _ = CH[chord_for_bar(bar)]
        music.add(brass([n[:-1] + str(int(n[-1]) + 1) for n in notes[1:]], T(1.5)), bar * 4, 0.22, pan=-0.1)

    # risers / landings at section starts
    fx.add(riser(T(4)), 36, 0.25)
    fx.add(boom(55, 2.0), 40, 0.6)
    fx.add(crash(2.0), 40, 0.2)
    fx.add(crash(0.9)[::-1] * 0.8, 24 - 0.9 / BEAT, 0.2)
    fx.add(boom(60, 1.4), 24, 0.35)

    # ---- together: tom build b56-64
    for i, b in enumerate(np.arange(56, 64, 0.5)):
        if b >= 60:
            perc.add(tom(95 + (i % 3) * 18), b, 0.25 + 0.04 * (b - 56), pan=(-0.3, 0.3)[i % 2])
        elif b % 1 == 0:
            perc.add(tom(80), b, 0.3)
    for b in np.arange(62, 64, 0.25):
        perc.add(tom(130), b, 0.2 + 0.1 * (b - 62), pan=0.15)
    drums.add(kick(), 56, 0.9)
    drums.add(kick(), 58, 0.7)
    drums.add(kick(), 60, 0.8)
    drums.add(kick(), 62, 0.8)
    fx.add(riser(T(4)), 60, 0.3)

    # ---- end card
    fx.add(boom(48, 3.5), 64, 0.95)
    fx.add(sub_drop(2.0, 70, 26), 64, 0.5)
    fx.add(crash(3.6), 64, 0.26)
    fin = pad_chord(["F2", "C3", "F3", "A3", "C4", "F4"], T(8) + 0.3, (3200, 900), attack=0.01, release=1.5, voices=5, detune=0.1)
    music.add(fin, 64, 0.6)
    music.add(brass(["A3", "C4", "F4"], T(2.5)), 64, 0.3)
    bass.add(bass_note("F1", T(3), 600), 64, 0.6)
    for k, nt in enumerate(["C6", "A5", "F5", "C6", "F6"]):
        music.add(pluck([nt], 0.6, 2600), 66 + k * 0.5, 0.12, pan=0.35 - 0.15 * k)

    kicks = [T(b) for b in range(24, 56)]
    duck = sidechain(kicks, bass.x.shape[1], 0.35, 0.12)
    bed = drums.x * 0.9 + perc.x * 0.8 + bass.x * duck * 0.8 + reverb(music.x, 0.45, length=2.4, decay=0.7) * duck + reverb(fx.x, 0.3) * 0.8
    bed = np.stack([filt(c, "highpass", 26) for c in bed])[:, :N]
    fade = int(1.2 * SR)
    bed[:, -fade:] *= np.linspace(1, 0, fade) ** 2
    bed *= 10 ** (-3 / 20) / (np.abs(bed).max() + 1e-9)
    sf.write(HERE / "music.wav", bed.T, SR, subtype="PCM_24")

    grid_src = (drums.x * 1.0 + perc.x * 0.3 + fx.x * 0.4)[:, :N].mean(axis=0).astype(np.float32)
    grid = measure_beats(grid_src, SR, BPM, n_beats=NB + 1)
    # the grid is designed; keep the measured offset only if it is tight
    if abs(grid.get("period", BEAT) - BEAT) > 0.002:
        grid["period"] = BEAT
    grid.update({
        "designed_bpm": BPM,
        "downbeats": grid["beats"][::4],
        "sections": [{"name": "hook", "beat": 0}, {"name": "pitch", "beat": 8}, {"name": "steps", "beat": 24},
                     {"name": "benefits", "beat": 40}, {"name": "together", "beat": 56}, {"name": "end", "beat": 64}],
        "source": "organiser-ad/audio/score.py, grid measured on drum + fx stems",
    })
    (FILM / "beats.json").write_text(json.dumps(grid, indent=1))
    print(f"beats: {grid['bpm']} bpm, period {grid['period']:.4f}, offset {grid['offset'] * 1000:.1f} ms, "
          f"fit rms {grid.get('fit_residual_ms')} ms")


if __name__ == "__main__":
    main()
