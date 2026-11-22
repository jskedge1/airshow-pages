#!/usr/bin/env python3
"""Puts The Big Guide to RIAT live (Jack, 22 Nov 2026).

Reads the built preview in previews/big-guide-to-riat/ and writes the live copy:

    big-guide-to-riat/                 every page, with full web addresses (photos and links), no "noindex"
    camping-layout/riat.html           the home page, which is what the Wix page /riat shows
    riat.html                          the same home page, kept in step (the old address in the README table)

Pages shown on the Wix site sit inside the site's own address, so every photo and link must be a full
https://jskedge1.github.io/airshow-pages/... address (see the README). Links between the pages open at the top
of the window. Until each tab has its own Wix page, its link opens the GitHub page.

Run after the preview build:
    python3 riat-camping-src/build.py
    python3 previews/big-guide-to-riat-src/build.py
    python3 previews/big-guide-to-riat-src/golive.py

The pages it writes are built files: change the build scripts, not the output.
"""
import pathlib
import re
import shutil
from urllib.parse import urljoin

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
SRC = ROOT / "previews" / "big-guide-to-riat"
OUT = ROOT / "big-guide-to-riat"
GH = "https://jskedge1.github.io/airshow-pages/"
LIVE = GH + "big-guide-to-riat/"
HOME_COPIES = [ROOT / "camping-layout" / "riat.html", ROOT / "riat.html"]


def absolute(html, page_url):
    """Make every relative photo, background and page link a full address; links open at the top of the window."""
    def fix(m):
        attr, q, val = m.group(1), m.group(2), m.group(3)
        if re.match(r"^(?:[a-z]+:|#|//)", val):
            return m.group(0)
        return f"{attr}={q}{urljoin(page_url, val)}{q}"
    html = re.sub(r'\b(src|href)=(["\'])([^"\']+)\2', fix, html)
    html = re.sub(r"url\((['\"]?)(?![a-z]+:|//|#)([^)'\"]+)\1\)", lambda m: f"url({m.group(1)}{urljoin(page_url, m.group(2))}{m.group(1)})", html)
    # photo addresses written inside the page's scripts, such as the line-up photo list
    html = re.sub(r'"((?:\.\./)*img/[A-Za-z0-9._-]+)"', lambda m: '"' + urljoin(page_url, m.group(1)) + '"', html)
    html = html.replace('target="_self"', 'target="_top"')
    return html


def golive():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(SRC / "img", OUT / "img")
    n = 0
    for f in sorted(SRC.rglob("*.html")):
        rel = f.relative_to(SRC).as_posix()
        page_url = LIVE + rel
        h = f.read_text(encoding="utf8")
        h = re.sub(r'<!-- PREVIEW: [^>]*-->\n?', "", h)
        h = h.replace('<meta name="robots" content="noindex">\n', "").replace('<meta name="robots" content="noindex">', "")
        h = absolute(h, page_url)
        h = h.replace("<head>", "<head>\n<!-- LIVE: The Big Guide to RIAT. Built by previews/big-guide-to-riat-src/golive.py from the preview build. Edit the build scripts, not this file. -->", 1)
        dst = OUT / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(h, encoding="utf8")
        n += 1
    home = (OUT / "index.html").read_text(encoding="utf8")
    for p in HOME_COPIES:
        p.write_text(home, encoding="utf8")
    left = [str(p.relative_to(ROOT)) for p in OUT.rglob("*.html") if re.search(r'\b(?:src|href)="(?!https?:|mailto:|tel:|#|data:|\')|"(?:\.\./)*img/', p.read_text(encoding="utf8"))]
    print(f"{n} pages written to {OUT.relative_to(ROOT)}/, home copied to " + ", ".join(str(p.relative_to(ROOT)) for p in HOME_COPIES))
    if left:
        print("still has relative links:", left)


if __name__ == "__main__":
    golive()
