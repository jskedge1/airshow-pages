# Sound for the UK Airshow Guide 2027 season trailer (content-trailer-2027.js, 140 bpm, 21 Nov 2026).
# The same series sound as the RAF Cosford Hollywood trailer v5 and the cinematic advert, made bigger:
#   The Battlefield (Siddharth Parashar, Epidemic Sound, 140 bpm) edited on its bar grid to the trailer's sections,
#   Mission One (Hampus Naeselius, Epidemic Sound, 140 bpm): its big hit lands on "Your summer starts here",
#   then The Battlefield's real ending under the end card.
#   Jack's new cinematic hits and stingers (Epidemic Sound, Downloads, 18 Nov 2026): one on every black card and
#   title, a build under the cold open, a downer on "46 shows", a riser into the slides and into the last card.
#   With CLIPS=clips-trailer-2027.json (on the Mac, with the Z6 footage) the real engine sound of each clip sits
#   under the music: voice band cut (no commentary), "roar": true clips louder with the music ducked.
# Files are found by name in AUDIO (a folder), ~/Downloads and Jacks Drive "Music for Videos", so it runs on the
# Mac and in a cloud session.   OUT=rv-trL [CLIPS=clips-trailer-2027.json] [AUDIO=dir] uv run --with numpy python3 score-trailer-2027.py
import json, os, re, subprocess, wave
import numpy as np
D = os.path.dirname(os.path.abspath(__file__))
OUTD = os.path.join(D, os.environ.get('OUT', 'out'))
FF = os.environ.get('FFMPEG', 'ffmpeg')
CU = json.load(open(os.path.join(OUTD, 'cues.json')))
SR = 48000
BT = 60 / 140
LIB = '/Volumes/Jacks Drive/Uk Airshow Guide/06 The Big Guide to RIAT/The Big Guide to RAIT/'
DIRS = [d for d in ([os.environ.get('AUDIO')] if os.environ.get('AUDIO') else []) + [os.path.expanduser('~/Downloads'),
        LIB + 'youtube Video/Music for Videos', LIB + 'Icloud Photos to sort out'] if d and os.path.isdir(d)]
STOP = {'es', 'designed', 'epidemic', 'sound', 'mp3', 'wav'}
toks = lambda s: [t for t in re.split(r'[^a-z0-9]+', s.lower()) if t and t not in STOP]
FILES = [(toks(f), os.path.join(r, f)) for d in DIRS for r, _, fs in os.walk(d) for f in fs if f.lower().endswith(('.mp3', '.wav')) and not f.startswith('.')]
def find(key):
    # the file whose name holds every word of the key, with the fewest other words
    k = toks(key); best = None
    for t, p in FILES:
        if all(w in t for w in k) and (best is None or len(t) < best[0]): best = (len(t), p)
    if not best: raise SystemExit(f'sound not found: {key} (looked in {DIRS})')
    return best[1]

def load(path, ss=0, dur=None, mono=False, af=None):
    cmd = [FF, '-v', 'quiet', '-ss', str(max(0, ss))]
    if dur: cmd += ['-t', str(dur)]
    cmd += ['-i', path]
    if af: cmd += ['-af', af]
    cmd += ['-ac', '1' if mono else '2', '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
    return x if mono else x.reshape(-1, 2)

DUR = CU['dur']; N = int((DUR + .5) * SR)
music = np.zeros((N, 2)); fx = np.zeros((N, 2)); eng = np.zeros((N, 2)); duck = np.ones(N)
XF = int(.03 * SR)
def place(buf, seg, at, g=1.0, fade_in=XF, fade_out=XF):
    seg = seg.copy(); n = len(seg); fi = min(fade_in, n); fo = min(fade_out, n)
    if fi: seg[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo: seg[n - fo:] *= np.linspace(1, 0, fo)[:, None]
    i = int(round(at * SR))
    if i < 0: seg = seg[-i:]; i = 0
    j = min(len(buf), i + len(seg))
    if j > i: buf[i:j] += g * seg[:j - i]

# ---- 1. The Battlefield on its bar grid: bar n starts at B0 + n * 4 * SBT (measured for the Cosford trailer)
BATTLE = find('the battlefield siddharth parashar'); MISSION = find('mission one hampus naeselius')
B0, SBT = 0.121, 0.42850
# (source bar, out beat from, out beat to)
EDIT = [
    (0, 0, 4), (2, 4, 8),        # cold open: the two quiet pulse bars, nothing big before the first shot
    (1, 8, 32),                  # big hit, space, big hit, space: "The sky", "comes alive", the 2027 title card
    (38, 32, 96),                # the hit build, 16 bars, under the four show chapters
    (26, 96, 112),               # the breakdown under "46 shows", "One summer" and "One easy guide"
    (18, 112, 144), (62, 144, 160),   # the full wall under the six slides
    (58, 160, 176),              # the climax arrives on the first cut of the montage
    (54, 176, 188),              # the dip and riser under the slow motion finale
]
END_AT, HIT_AT = 196, 188        # out beats: end card, "Your summer starts here"
for sb, b0, b1 in EDIT:
    seg = load(BATTLE, B0 + sb * 4 * SBT - XF / SR, (b1 - b0) * BT + 2 * XF / SR)
    place(music, seg, b0 * BT - XF / SR)
# one beat of near silence before the last card
i0, i1 = int((HIT_AT - 1.5) * BT * SR), int(HIT_AT * BT * SR)
music[i0:i1] *= np.linspace(1, .04, i1 - i0)[:, None]
# ---- 2. Mission One: find its big hit exactly (largest onset near bar 58) and land it on the last card
MB58 = 0.753 + 58 * 4 * 0.42855
m = load(MISSION, MB58 - 1.2, 2.4, mono=True)
hop = 240; e = np.sqrt((m[:len(m) // hop * hop].reshape(-1, hop) ** 2).mean(1)); on = np.maximum(0, np.diff(e))   # the biggest jump in level
hit = MB58 - 1.2 + (np.argmax(on) + 1) * hop / SR
seg = load(MISSION, hit, (END_AT - HIT_AT) * BT + .25)
place(music, seg, HIT_AT * BT, 1.0, fade_in=0, fade_out=int(.25 * SR))
# ---- 3. The Battlefield's real ending under the end card
seg = load(BATTLE, B0 + 120 * 4 * SBT - XF / SR, DUR - END_AT * BT + .6)
place(music, seg, END_AT * BT - XF / SR)
print(f'music: The Battlefield in {len(EDIT)} sections, Mission One hit at {hit:.2f} s on {HIT_AT * BT:.2f} s, ending from {END_AT * BT:.2f} s')

# ---- 4. the hits and stingers. (out beat, name, gain, where the beat lands in the file: 'onset' or 'peak', longest seconds kept)
FX = [
    (8,   'stinger impact dark cinematic horror',              .42, 'peak',  7),   # builds through the black open, lands on the first shot
    (8,   'impact hit big powerful cinematic shock',           .34, 'onset', 5),
    (16,  'stinger impact hit big powerful growly reverberant', .40, 'onset', 5),
    (24,  'stinger impact tonal hit 01',                        .50, 'onset', 6),   # the 2027 title card
    (32,  'impact hit big powerful cinematic mysterious variations 01', .50, 'onset', 5),   # RAF Cosford
    (48,  'stinger impact dark cinematic aggressive hit',       .55, 'onset', 5),   # Eastbourne
    (64,  'stinger impact dark cinematic thunder distortion',   .55, 'onset', 5),   # Duxford
    (80,  'stinger impact hit fury powerful big 01',            .62, 'onset', 5),   # Shuttleworth
    (96,  'stinger horn downer impact',                         .55, 'onset', 7),   # 46 shows
    (100, 'impact hit big powerful cinematic mysterious variations 02', .50, 'onset', 5),  # One summer
    (104, 'stinger impact hit powerful futuristic tonal',       .45, 'onset', 6),   # Every UK airshow, one easy guide
    (112, 'stinger eerie build up reversed elements tonal hard metal impact distorted tail', .50, 'peak', 9),  # builds under the turn, lands on the slides
    (160, 'impact hit big powerful cinematic variations 02',    .40, 'onset', 5),   # the montage
    (188, 'impact dark hit electric distored riser ultra boom', .65, 'peak',  8),   # riser into the last card
    (188, 'stinger impact tonal epic hit f',                    .60, 'onset', 7),
    (196, 'impact hit big powerful cinematic epic thunderblast', .42, 'onset', 6),  # end card
]
def envelope(x):
    w = int(.01 * SR); return np.convolve(np.abs(x).mean(1), np.ones(w) / w, 'same')
for beat, name, g, how, keep in FX:
    x = load(find(name)); env = envelope(x)
    at = (np.argmax(env) if how == 'peak' else np.argmax(env > env.max() * .25)) / SR
    x = x[:int((at + keep) * SR)]
    x = x / max(1e-6, np.abs(x).max())                      # every hit at the same peak before its gain
    place(fx, x, beat * BT - at, g, fade_in=int(.01 * SR), fade_out=int(1.5 * SR))
    print(f'FX beat {beat:3d} ({beat * BT:5.2f} s) {how} at {at:.2f} s: {os.path.basename(find(name))[:70]}')
# a light airy hit on the hard cuts that are two beats or longer (the one beat cuts ride on the music)
airy = load(find('impact airy fast')); a_on = np.argmax(envelope(airy) > envelope(airy).max() * .25) / SR
airy = airy[:int((a_on + 2.5) * SR)] / max(1e-6, np.abs(airy).max())
used = {round(b * BT, 3) for b, *_ in FX}
imp = sorted(set(round(t, 3) for t in CU.get('impacts', [])))
for t in imp:
    if any(abs(t - u) < .05 for u in used): continue
    if any(abs(t - u) < 1.5 * BT and u != t for u in imp): continue
    place(fx, airy, t - a_on, .13, fade_in=int(.005 * SR), fade_out=int(1.0 * SR))

# ---- 5. the real engine sound of each clip (Mac, with the footage)
CL = os.environ.get('CLIPS')
if CL:
    spec = json.load(open(os.path.join(D, CL)))
    by = {c['name']: c for c in spec['clips']}
    for s in CU['cine']['shots']:
        if not s['clip']: continue
        name = re.sub(r'L$', '', s['clip'].split('/')[-1])
        c = by.get(name)
        if not c or not c.get('src') or c.get('mute'): continue
        L = s['t1'] - s['t0']
        src = c['src'] if os.path.isabs(c['src']) else os.path.join(c.get('root', spec['root']), c['src'])
        rumble = c.get('sound') == 'rumble'
        af = 'highpass=f=40,lowpass=f=280' if rumble else 'highpass=f=40,equalizer=f=1100:t=h:w=3100:g=-10.5'
        a_ = load(src, c['ss'], L * c.get('speed', 1.0) + .1, af=af)
        if not len(a_): continue
        if c.get('speed', 1.0) != 1.0:                       # slow motion: stretch the sound to the shot, lower and deeper
            n2 = int(L * SR) + 1; idx = np.linspace(0, len(a_) - 1, n2)
            a_ = np.stack([np.interp(idx, np.arange(len(a_)), a_[:, k]) for k in (0, 1)], 1)
        rms = np.sqrt((a_ ** 2).mean()) + 1e-6
        target = .22 if c.get('sound') == 'roar' else .05 if c.get('sound') in ('quiet', 'rumble') else .13
        g = min(3.0, target / rms); fd = int(.06 * SR)
        place(eng, a_ * g, s['t0'], fade_in=fd, fade_out=fd)
        if c.get('sound') == 'roar':
            i, j = int(s['t0'] * SR), int(s['t1'] * SR); duck[i:j] = np.minimum(duck[i:j], .55)
        print(f'SOUND {name}: rms {rms:.3f} gain {g:.2f} {c.get("sound", "")}')
    k = int(.12 * SR); duck = np.convolve(duck, np.ones(k) / k, mode='same')

# ---- 6. fade the tail, mix and write
tail = int(1.5 * SR); end = int(DUR * SR)
for b in (music, fx): b[end - tail:end] *= np.linspace(1, 0, tail)[:, None]; b[end:] = 0
MUSIC_G = .7 if CL else 1.0
mix = (music * duck[:, None] * MUSIC_G + fx * MUSIC_G + eng)[:end]
mix /= max(1e-6, np.abs(mix).max()) / .89
with wave.open(os.path.join(OUTD, 'mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
print('wrote', os.path.join(OUTD, 'mix.wav'), f'{DUR:.2f} s')
