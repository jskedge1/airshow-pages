"""Move photos that are written inside a page's code out into hosted image files.

A photo stored inside the HTML has to download in full before anything on the
page can show, and it cannot be cached between pages. This finds every
embedded photo (data:image/jpeg, png, webp or gif), resizes it to at most
1800px wide, saves it as a WebP file in camping-layout/img/ named after its
content (so the same photo on two pages is one file), and points the page at
the GitHub Pages copy instead.

Photos below the first two on a page also get loading="lazy" so a phone only
downloads them when the reader scrolls near them.

Usage: python3 tools-images.py [files...]   (no files = every show page)
"""
import base64, hashlib, io, pathlib, re, sys
from PIL import Image

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / 'camping-layout' / 'img'
BASE = 'https://jskedge1.github.io/airshow-pages/camping-layout/img/'
MAX_W = 1800
DATA = re.compile(r'data:image/(jpeg|jpg|png|webp|gif);base64,([A-Za-z0-9+/=]+)')


def save(raw):
    name = hashlib.sha1(raw).hexdigest()[:16] + '.webp'
    dest = OUT / name
    if not dest.exists():
        im = Image.open(io.BytesIO(raw))
        im.load()
        if getattr(im, 'is_animated', False):
            # keep animations as they are
            name = name[:-5] + '.' + (im.format or 'gif').lower()
            dest = OUT / name
            dest.write_bytes(raw)
            return name
        if im.mode not in ('RGB', 'RGBA'):
            im = im.convert('RGBA' if 'A' in im.getbands() or im.mode == 'P' else 'RGB')
        if im.width > MAX_W:
            im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        im.save(dest, 'WEBP', quality=80, method=6)
    return name


def lazy(h):
    count = 0

    def add(m):
        nonlocal count
        tag = m.group(0)
        if 'camping-layout/img/' not in tag:
            return tag
        count += 1
        if count <= 2 or 'loading=' in tag:
            return tag
        return tag[:4] + ' loading="lazy" decoding="async"' + tag[4:]
    return re.sub(r'<img\b[^>]*>', add, h)


def apply(path):
    p = ROOT / path
    h = p.read_text(encoding='utf8')
    before = len(h)
    h = DATA.sub(lambda m: BASE + save(base64.b64decode(m.group(2))), h)
    h = lazy(h)
    p.write_text(h, encoding='utf8')
    return path, before, len(h)


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    targets = sys.argv[1:] or sorted('camping-layout/' + f.name for f in (ROOT / 'camping-layout').glob('*.html'))
    for t in targets:
        print('%s %d -> %d' % apply(t))
