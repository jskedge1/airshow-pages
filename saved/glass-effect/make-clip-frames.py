# Builds the video clip frame folders for cine.js shots ({ clip: 'cine/<name>L', clipP: 'cine/<name>', n }).
# Source: Jack's own Nikon Z6 4K clips on Jacks Drive (listed in clips-<film>.json). The frames are not stored in git.
# For each clip it runs the cinematic trailer clean up: tracks the aircraft and keeps it centred (a smoothed crop that
# also steadies the shot), removes sensor dust spots on plain sky, matches white balance on near neutral sky,
# sets exposure and lifts the shadows so undersides keep detail, light denoise (no grain), then writes 60 fps JPEGs:
# 1920 x 1080 for landscape (cine/<name>L/0001.jpg) and a 1080 x 1920 crop around the aircraft for portrait (cine/<name>/).
# Run from this folder (needs ffmpeg and numpy):  uv run --with numpy python3 make-clip-frames.py clips-advert.json [name ...]
import json, os, subprocess, sys
import numpy as np
D = os.path.dirname(os.path.abspath(__file__))
FF = os.environ.get('FFMPEG', 'ffmpeg')
spec = json.load(open(os.path.join(D, sys.argv[1])))
only = set(sys.argv[2:])
ROOT = spec['root']
W, H = 3840, 2160

def box(a, r):
    # box blur (2r+1) with edge clamp, via cumulative sums, on 2D float arrays
    p = np.pad(a, ((r + 1, r), (r + 1, r)), mode='edge').astype(np.float64)
    c = p.cumsum(0).cumsum(1)
    k = 2 * r + 1
    return ((c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)).astype(np.float32)

def frames(src, ss, dur, vf, w, h, ch):
    cmd = [FF, '-v', 'quiet', '-ss', str(ss), '-t', str(dur), '-i', src, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'gray' if ch == 1 else 'rgb24', '-']
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = w * h * ch
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(h, w, ch) if ch > 1 else np.frombuffer(b, np.uint8).reshape(h, w)
    p.wait()

def smooth(v, k):
    if k < 2: return v
    pad = np.pad(v, (k, k), mode='edge')
    for _ in range(2): pad = np.convolve(pad, np.ones(2 * k + 1) / (2 * k + 1), mode='same')
    return pad[k:-k]

for c in spec['clips']:
    name = c['name']
    if only and name not in only: continue
    if not c.get('src'):
        print(f"{name}: NO SOURCE YET, pick a clip for this slot ({c.get('pick', '')})", flush=True); continue
    src = c['src'] if os.path.isabs(c['src']) else os.path.join(c.get('root', ROOT), c['src'])
    fps = c['fps']; speed = c.get('speed', 1.0)
    span = c['dur'] * speed + 0.25                       # source seconds used
    cw = c.get('cw', 1920); chh = round(cw * 9 / 16)
    # 1. track the aircraft (dark shape against the sky) on small frames
    lw, lh = 480, 270
    small = list(frames(src, c['ss'], span, f'scale={lw}:{lh}', lw, lh, 1))
    n = len(small)
    cx = np.full(n, c.get('cx', .5)); cy = np.full(n, c.get('cy', .5))
    if c.get('track', True):
        px, py, last = [], [], (c.get('cx', .5), c.get('cy', .5))
        ys, xs = np.mgrid[0:lh, 0:lw]
        for g in small:
            g = g.astype(np.float32)
            wgt = np.clip(box(g, 20) - g - c.get('thr', 10), 0, None)
            wgt[:int(lh * .04)] = 0; wgt[-int(lh * c.get('floor', .04)):] = 0
            s = wgt.sum()
            if s > 40: last = ((wgt * xs).sum() / s / lw, (wgt * ys).sum() / s / lh)
            px.append(last[0]); py.append(last[1])
        k = int(fps * c.get('smooth', .5))
        cx = smooth(np.array(px), k) + c.get('dx', 0); cy = smooth(np.array(py), k) + c.get('dy', 0)
    # 2. dust map: marks that stay dark on the same sensor pixels, on plain sky, small and soft (never the aircraft)
    med = np.median(np.stack(small[::max(1, n // 15)]).astype(np.float32), 0)
    sc = W / lw
    dust = []
    if c.get('dust', True):
        full = [g.astype(np.float32) for g in frames(src, c['ss'], span, f"select='not(mod(n\\,{max(1, n // 12)}))',format=gray", W, H, 1)]
        fm = np.median(np.stack(full), 0)
        res = box(fm, 24) - fm
        flat = np.abs(box(fm, 6) - box(fm, 24)) < 6           # plain sky only
        cand = (res > c.get('dthr', 3.5)) & (res < 40) & flat
        # leave a wide box round the aircraft path alone
        ax0, ax1 = (cx.min() - .12) * W, (cx.max() + .12) * W; ay0, ay1 = (cy.min() - .14) * H, (cy.max() + .14) * H
        ys_, xs_ = np.nonzero(cand[::4, ::4])
        pts = [(x * 4, y * 4) for x, y in zip(xs_, ys_) if not (ax0 < x * 4 < ax1 and ay0 < y * 4 < ay1)]
        # group points into spots, keep the small ones
        grid = {}
        for x, y in pts: grid.setdefault((x // 48, y // 48), []).append((x, y))
        for k_, v in grid.items():
            if len(v) <= 30:
                xs2 = [p[0] for p in v]; ys2 = [p[1] for p in v]
                dust.append((max(0, min(xs2) - 20), max(0, min(ys2) - 20), min(W, max(xs2) + 24), min(H, max(ys2) + 24)))
        dmask = np.zeros((H, W), bool)
        for x0, y0, x1, y1 in dust:
            sub = cand[y0:y1, x0:x1]
            dmask[y0:y1, x0:x1] |= box(sub.astype(np.float32), 3) > 0.01
    # 3. colour: neutral sky to the same white (max +/- 12 %), exposure toward the target, shadow lift
    rgbm = next(frames(src, c['ss'] + span / 2, 0.2, 'null', W, H, 3)).astype(np.float32) / 255
    mx, mn = rgbm.max(2), rgbm.min(2)
    neu = (mx - mn < .08) & (mx > .35) & (mx < .97)
    gains = np.ones(3)
    if neu.sum() > 5000:
        m = rgbm[neu].mean(0); gains = np.clip(m.mean() / m, .88, 1.12)
    lum = (rgbm * gains).mean(2)
    sky = np.percentile(lum, 60)
    ev = np.clip(c.get('target', .74) / max(sky, .05), .85, 1.35) * 2 ** c.get('ev', 0)
    lift = c.get('lift', .6)
    print(f'{name}: {n} source frames, dust spots {len(dust)}, gains {np.round(gains, 3)}, exposure x{ev:.2f}', flush=True)
    # 4. writers: landscape and portrait, slowed if asked, 60 fps, light denoise
    outs = []
    pw = round(min(H, cw) * 9 / 16); ph = min(H, cw)
    for sub, (ow, oh), (iw, ih) in ((f"{name}L", (1920, 1080), (cw, chh)), (name, (1080, 1920), (pw, ph))):
        od = os.path.join(D, 'cine', sub); os.makedirs(od, exist_ok=True)
        for f in os.listdir(od):
            if os.path.exists(os.path.join(od, f)): os.remove(os.path.join(od, f))   # ._ files on exFAT go with their file
        vf = f"setpts=PTS/{speed},fps=60,scale={ow}:{oh}:flags=lanczos,hqdn3d=1.5:1.5:3:3"
        p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{iw}x{ih}', '-r', str(fps), '-i', '-',
                              '-vf', vf, '-frames:v', str(int(c['dur'] * 60) + 4), '-q:v', '2', '-start_number', '1', os.path.join(od, '%04d.jpg')], stdin=subprocess.PIPE)
        outs.append((p, iw, ih))
    for i, fr in enumerate(frames(src, c['ss'], span, 'null', W, H, 3)):
        if i >= n: break
        fx, fy = cx[min(i, n - 1)] * W, cy[min(i, n - 1)] * H
        x0 = int(np.clip(fx - cw / 2, 0, W - cw)); y0 = int(np.clip(fy - chh / 2, 0, H - chh))
        px0 = int(np.clip(fx - pw / 2, 0, W - pw)); py0 = int(np.clip(fy - ph / 2, 0, H - ph))
        bx0, by0 = min(x0, px0), min(y0, py0); bx1, by1 = max(x0 + cw, px0 + pw), max(y0 + chh, py0 + ph)
        a = fr[by0:by1, bx0:bx1].astype(np.float32) / 255
        if dust:
            m = dmask[by0:by1, bx0:bx1]
            if m.any():
                wgt = (~m).astype(np.float32)
                den = box(wgt, 14) + 1e-4
                for k in range(3):
                    fill = box(a[..., k] * wgt, 14) / den
                    a[..., k] = np.where(m, fill, a[..., k])
        a = a * gains * ev
        a = np.clip(a, 0, 1)
        a = a + lift * a * (1 - a) ** 3                       # lift shadows and lower mids, keep highlights
        a = (np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)
        try:   # a writer stops once it has all the frames it needs
            outs[0][0].stdin.write(np.ascontiguousarray(a[y0 - by0:y0 - by0 + chh, x0 - bx0:x0 - bx0 + cw]).tobytes())
            outs[1][0].stdin.write(np.ascontiguousarray(a[py0 - by0:py0 - by0 + ph, px0 - bx0:px0 - bx0 + pw]).tobytes())
        except BrokenPipeError: break
    for p, _, _ in outs:
        try: p.stdin.close()
        except BrokenPipeError: pass
        p.wait()
    nl = len([f for f in os.listdir(os.path.join(D, 'cine', name + 'L')) if not f.startswith('.')])
    print(f'{name}: {nl} frames at 60 fps (need {int(c["dur"] * 60) + 2})', flush=True)
