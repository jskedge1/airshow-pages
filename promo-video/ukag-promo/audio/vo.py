"""Guide voice-over for the preview: Kokoro TTS (bm_george), placed on the edit's timeline.

    <tts-venv>/bin/python ukag-promo/audio/vo.py <kokoro.onnx> <voices.npz>

Writes ukag-promo/audio/vo.wav (48 kHz stereo) and ukag-promo/timeline.json (sections and every line's start/end in
seconds plus its on-screen text), which film.js reads so captions and cards land on the voice.
A synthetic stand-in: replace vo.wav with Jack's own recording and re-time timeline.json to match.
"""
import json, sys
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

FILM = Path(__file__).resolve().parent.parent
VOICE, SPEED, SR_OUT = "bm_george", 1.0, 48000
BEAT, GAP = 0.7, 0.26          # a "(beat)" pause, and the normal gap between lines

BAR = 2.0                       # one bar at 120 BPM: every section is a whole number of bars

# sections in order: (id, kind, lead s, tail s, min length s, [(text, pause after), ...])
# kind drives the music (score.py) and the picture (film.js).
JET, DROP = {"mark": "jet"}, {"mark": "drop"}   # the jet drowns this line out; the music stops before this one
SECTIONS = [
    ("open",   "quiet",  0.6, 0.3, 0, [
        ("Hello.", "beat"),
        ("Every year, more than four million people go to an airshow in the U K.", "gap"),
        ("That makes air displays the fourth biggest outdoor spectator event in the country, after football, music festivals, and horse racing.", "beat"),
        ("Which seems a bit harsh on the Red Arrows.", 3.0, JET),
        ("They heard that.", "gap")]),
    ("title",  "hook",   0, 0, 6, []),
    ("slot2",  "soft",   0.5, 0.4, 0, [
        ("Now, every one of those four million people has to plan.", "gap"),
        ("Which show. How to get there. Where to stay. And what the whole thing is going to cost.", "beat"),
        ("And the information is scattered across about a hundred different websites.", "beat"),
        ("Most of which disagree with each other.", "gap"),
        ("I've been going since two thousand and six, and I've got it wrong in almost every way available.", "gap"),
        ("I'm a train driver.", "beat"),
        ("Who once missed the last train home.", "gap")]),
    ("reveal", "lift",   0.4, 1.0, 8, [
        ("So I built The Big Guide to U K Airshows.", "gap"),
        ("Thirteen shows in depth, and everything you need for your twenty twenty seven season, in one place.", "gap"),
        ("As accurate and up to date as one slightly obsessive man can make it.", "gap")]),
    ("drop",   "jet",    0, 0, 2, []),
    ("map",    "tour",   0.3, 0.2, 6, [
        ("First, which show.", "gap"),
        ("This is the map. Every U K airshow I know of, colour coded by type.", 0.55),
        ("Because I'm that sort of person.", "gap")]),
    ("budget", "tour",   0.2, 0.2, 6, [
        ("Then, the bit nobody enjoys. Money.", "gap"),
        ("There's a budget calculator, the first of its kind on the airshow scene, as far as I know.", "gap"),
        ("Tickets, fuel, parking, and what a burger actually costs once you're inside the fence.", "beat"),
        ("Brace yourself.", "gap")]),
    ("jet1",   "jet",    0, 0, 2, []),
    ("buses",  "tour",   0.3, 0.2, 6, [
        ("Getting there. Train and bus guides, with fifty four bus routes mapped, stop by stop.", "gap"),
        ("I'd like to tell you that was tedious.", "beat"),
        ("It wasn't. I loved it.", "gap")]),
    ("jet2",   "jet",    0, 0, 2, []),
    ("kit",    "tour",   0.3, 0.2, 6, [
        ("Kit guides for photography and camping. What to buy, what it costs, and what to leave at home.", "gap"),
        ("And three D guides to eleven cameras, so you can learn every button.", 0.55),
        ("Even the ones nobody has ever pressed.", "gap")]),
    ("camp",   "tour",   0.2, 0.2, 6, [
        ("Campsites, pitches, and what to pack, for those who like to make a weekend of it.", "gap")]),
    ("kids",   "tour",   0.2, 0.2, 6, [
        ("Bringing children? There's a whole route through the guide for that.", "gap"),
        ("Which shows suit little ones, how to protect their ears, and printable spotter cards for the quiet bits between displays.", "beat"),
        ("There are always quiet bits.", "gap")]),
    ("jet3",   "jet",    0, 0, 2, []),
    ("forum",  "tour",   0.3, 0.3, 6, [
        ("And a forum, where you can discuss all of this.", 0.55),
        ("At length.", "gap")]),
    ("slot3",  "soft",   0.6, 0.6, 0, [
        ("It's all free, and it always will be.", "gap"),
        ("I want to help you plan your twenty twenty seven season properly, spend your money wisely, and then enjoy the bit that actually matters.", 1.5),
        ("The aeroplanes.", "gap", DROP)]),
    ("end",    "end",    4.0, 0.6, 14, [
        ("U K airshow guide dot co dot U K.", "gap"),
        ("Subscribe, if you like.", 0.25),
        ("I won't be offended if you don't.", "beat"),
        ("Much.", "gap")]),
]

def trim(a, sr, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx): return a
    a0, a1 = max(0, idx[0] - int(0.02 * sr)), min(len(a), idx[-1] + int(0.06 * sr))
    return a[a0:a1]

def main():
    k = Kokoro(sys.argv[1], sys.argv[2])
    clips, secs, lines, t0 = [], [], [], 0.0
    for sid, kind, lead, tail, mn, items in SECTIONS:
        t = t0 + lead
        for item in items:
            text, pause = item[0], item[1]
            a, sr = k.create(text, voice=VOICE, speed=SPEED, lang="en-gb")
            a = trim(a.astype(np.float64), sr)
            x = np.interp(np.arange(0, len(a) * SR_OUT / sr) * sr / SR_OUT, np.arange(len(a)), a)
            d = len(x) / SR_OUT
            clips.append((t, x))
            lines.append({"section": sid, "text": text, "start": round(t, 3), "end": round(t + d, 3), **(item[2] if len(item) > 2 else {})})
            t += d + (BEAT if pause == "beat" else GAP if pause == "gap" else float(pause))
        used = (lines[-1]["end"] - t0 + tail) if items else 0
        length = max(mn, np.ceil(used / BAR - 1e-6) * BAR)
        secs.append({"id": sid, "kind": kind, "start": round(t0, 3), "end": round(t0 + length, 3)})
        print(f"{sid:7s} {kind:6s} {t0:6.1f} -> {t0 + length:6.1f}  ({length:.0f} s, voice uses {used:.1f})")
        t0 += length
    dur = t0
    out = np.zeros(int(dur * SR_OUT) + SR_OUT)
    for t, x in clips:
        i0 = int(t * SR_OUT); out[i0:i0 + len(x)] += x
    out = out[: int(dur * SR_OUT)]
    out *= 10 ** (-3 / 20) / (np.abs(out).max() + 1e-9)
    sf.write(FILM / "audio/vo.wav", np.stack([out, out], 1).astype(np.float32), SR_OUT)
    (FILM / "timeline.json").write_text(json.dumps({"voice": f"Kokoro {VOICE} (guide voice)", "duration": dur,
                                                    "sections": secs, "lines": lines}, indent=1))
    cfg = json.loads((FILM / "film.json").read_text()); cfg["duration"] = dur; cfg["poster"] = round(dur - 6, 2)
    (FILM / "film.json").write_text(json.dumps(cfg, indent=1) + "\n")
    print(f"total {dur:.0f} s ({int(dur // 60)}:{int(dur % 60):02d})")

main()
