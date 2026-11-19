# Sound for the cinematic advert cuts with Jack's own music (19 Nov 2026), the same series sound as the
# RAF Cosford Hollywood trailer v5:
#   The Battlefield (Siddharth Parashar, Epidemic Sound, 140 bpm), edited on its beat grid like the Cosford trailer,
#   blended with Mission One (Hampus Naeselius, Epidemic Sound, also 140 bpm): its big hit lands on "Your summer starts here",
#   then The Battlefield's real ending plays under the end card.
#   Impact stingers from Jack's library on the hard cuts (light) and the two title cards.
#   With CLIPS=clips-advert.json (the Z6 video cut) the real engine sound of each clip sits under the music:
#   voice band cut (no commentary), levelled, big passes as "roar" shots with the music ducked.
# The content file must use snapBpm: 140 so every cut is on the beat. Needs ffmpeg and numpy.
#   OUT=rv-civL [CLIPS=clips-advert.json] uv run --with numpy python3 score-cine-music.py   ->  <OUT>/mix.wav
import json, os, subprocess
import numpy as np
D = os.path.dirname(os.path.abspath(__file__))
OUTD = os.path.join(D, os.environ.get('OUT', 'out'))
FF = os.environ.get('FFMPEG', 'ffmpeg')
CU = json.load(open(os.path.join(OUTD, 'cues.json')))
SR = 48000
LIB = '/Volumes/Jacks Drive/Uk Airshow Guide/06 The Big Guide to RIAT/The Big Guide to RAIT/'
BATTLE = LIB + 'Icloud Photos to sort out/ES_The Battlefield - Siddharth Parashar.mp3'
MISSION = LIB + 'youtube Video/Music for Videos/ES_Mission One - Hampus Naeselius.mp3'
FXD = LIB + 'youtube Video/Music for Videos/'
BOOM = FXD + 'ES_Designed, Stinger, Impact, Hit, Deep, Boom, Thud - Epidemic Sound.mp3'
CLEAN = FXD + 'ES_Cinematic Hit, Impact, Absolute Clean 04 - Epidemic Sound.mp3'
BT = 60 / 140                      # out beat (the content snaps to this)
B0, SBT = 0.121, 0.42850           # The Battlefield grid (as in the Cosford trailer music.py): bar n at B0 + n * 4 * SBT
# (source bar of The Battlefield, out beat start, out beat end): pulse intro, hit build under the hero shots, the climax
# under the one beat cuts, the breakdown under the black title card, the full wall under the glass slides, build 2 into the close
EDIT = [(14, 0, 7), (38, 7, 31), (58, 31, 36), (26, 36, 42), (18, 42, 74), (48, 74, 84)]
MISSION_BAR58 = (0.753 + 58 * 4 * 0.42855)   # Mission One's big hit (bar 58 of its grid), refined on the onset below
MISSION_AT = (84, 92)              # out beats: "Your summer starts here"
END_SRC_BAR = 120                  # The Battlefield's real ending, from out beat 92 (the end card)

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

# 1. The Battlefield, edited on beats
for sb, b0, b1 in EDIT:
    src = B0 + sb * 4 * SBT
    seg = load(BATTLE, src - XF / SR, (b1 - b0) * BT + 2 * XF / SR)
    place(music, seg, b0 * BT - XF / SR)
# 2. Mission One: find its hit exactly (largest onset near bar 58), land it on out beat 84
m = load(MISSION, MISSION_BAR58 - 1.2, 2.4, mono=True)
hop = 240; e = np.sqrt((m[:len(m) // hop * hop].reshape(-1, hop) ** 2).mean(1)); on = np.maximum(0, np.diff(np.log(e + 1e-4)))
hit = MISSION_BAR58 - 1.2 + (np.argmax(on) + 1) * hop / SR
a, b = MISSION_AT
seg = load(MISSION, hit - 2 * BT, (b - a + 2) * BT + XF / SR)
# a two beat lead in under the end of The Battlefield build, then the hit on the beat
seg[:int(2 * BT * SR)] *= np.linspace(0, .7, int(2 * BT * SR))[:, None]
place(music, seg, (a - 2) * BT, fade_in=0)
music[int(a * BT * SR) - XF:int(a * BT * SR)] *= np.linspace(1, .3, XF)[:, None]   # The Battlefield steps aside on the hit
# 3. The Battlefield's real ending under the end card
endt = B0 + END_SRC_BAR * 4 * SBT
seg = load(BATTLE, endt - XF / SR, DUR - 92 * BT + .6)
place(music, seg, 92 * BT - XF / SR)
print(f'music: Battlefield {len(EDIT)} sections, Mission One hit at {hit:.2f} s -> {a * BT:.2f} s, ending -> {92 * BT:.2f} s')

# 4. stingers: light booms on the hard cuts, a clean hit on each title card and the end card
boom = load(BOOM); clean = load(CLEAN)
imp = sorted(set(round(t, 3) for t in CU.get('impacts', [])))
for t in imp:
    one_beat = any(abs(t - u) < 1.5 * BT and u != t for u in imp)
    place(fx, boom, t, .16 if one_beat else .3, fade_in=0)
for t in (36 * BT, 84 * BT, 92 * BT):
    place(fx, clean, t, .45, fade_in=0)

# 5. the real engine sound of each clip (Z6 video cut)
CL = os.environ.get('CLIPS')
if CL:
    spec = json.load(open(os.path.join(D, CL)))
    by = {c['name']: c for c in spec['clips']}
    ROAR = {'v-typhoon', 'v-chinook', 'v-f35', 'v-apache'}
    QUIET = {'v-reds', 'v-crowd', 'v-redsmoke'}     # under the glass words and title cards
    for s in CU['cine']['shots']:
        if not s['clip']: continue
        name = s['clip'].split('/')[-1].rstrip('L')
        c = by.get(name)
        if not c: continue
        L = s['t1'] - s['t0']
        rumble = name == 'v-crowd'
        af = 'highpass=f=40,lowpass=f=280' if rumble else 'highpass=f=40,equalizer=f=1100:t=h:w=3100:g=-10.5'
        a_ = load(os.path.join(spec['root'], c['src']), c['ss'], L + .1, af=af)
        if not len(a_): continue
        rms = np.sqrt((a_ ** 2).mean()) + 1e-6
        target = .22 if name in ROAR else .05 if name in QUIET else .13
        g = min(3.0, target / rms)
        fd = int(.06 * SR)
        place(eng, a_ * g, s['t0'], fade_in=fd, fade_out=fd)
        if name in ROAR:
            i, j = int(s['t0'] * SR), int(s['t1'] * SR)
            duck[i:j] = np.minimum(duck[i:j], .55)
        print(f'SOUND {name}: rms {rms:.3f} gain {g:.2f}{" roar" if name in ROAR else ""}{" rumble only" if rumble else ""}')
    k = int(.12 * SR); duck = np.convolve(duck, np.ones(k) / k, mode='same')

# 6. fade the tail, mix and write
tail = int(1.5 * SR); end = int(DUR * SR)
music[end - tail:end] *= np.linspace(1, 0, tail)[:, None]; music[end:] = 0
MUSIC_G = .65 if CL else 1.0     # the music sits lower when the real engine sound is under it
mix = music * duck[:, None] * MUSIC_G + fx * MUSIC_G + eng
mix = mix[:int(DUR * SR)]
mix /= max(1e-6, np.abs(mix).max()) / .89
import wave
with wave.open(os.path.join(OUTD, 'mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
print('wrote', os.path.join(OUTD, 'mix.wav'), f'{DUR:.2f} s')
