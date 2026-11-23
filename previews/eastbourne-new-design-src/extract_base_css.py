#!/usr/bin/env python3
"""Copies the Duxford page's own base styles for the blocks that Eastbourne now uses in the Duxford layout
(Where to watch on the map, the Food and drink panel and the photo band) into duxford-base.css, leaving out any
rule the Eastbourne page already has word for word. Run it again if the Duxford page's own styles change.

Run:  python3 previews/eastbourne-new-design-src/extract_base_css.py
"""
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
DUX = HERE.parent / "duxford-new-design-src" / "live-source.html"
EB = HERE / "live-source.html"
OUT = HERE / "duxford-base.css"

# the blocks: Where to watch on the map, Food and drink, the photo band
WANT = re.compile(r"(\.ww-head|\.ww-tabs|\.ww-panel|\.ww-txt|\.ww-where|\.ww-facts|\.ww-go|\.ww-map|\.ww-note|#wwMap\b"
                  r"|\.food\b|\.food-main|\.food-text|\.food-list|\.busbar|\.busfig)")
BLOB = re.compile(r"data:[a-z/+.-]+;base64,[A-Za-z0-9+/=]+")


def styles(path):
    h = BLOB.sub("", path.read_text(encoding="utf8"))
    return re.findall(r"<style[^>]*>(.*?)</style>", h, re.S)


def rules(css):
    """Yield (media, selector, body) for every plain rule, with the @media it sits in ('' if none)."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    i, n = 0, len(css)
    while i < n:
        j = css.find("{", i)
        if j < 0:
            return
        head = css[i:j].strip()
        if head.startswith("@media") or head.startswith("@supports"):
            depth, k = 1, j + 1
            while k < n and depth:
                depth += {"{": 1, "}": -1}.get(css[k], 0)
                k += 1
            inner = css[j + 1:k - 1]
            for _, sel, body in rules(inner):
                yield head, sel, body
            i = k
            continue
        if head.startswith("@"):
            depth, k = 1, j + 1
            while k < n and depth:
                depth += {"{": 1, "}": -1}.get(css[k], 0)
                k += 1
            i = k
            continue
        k = css.find("}", j)
        if k < 0:
            return
        yield "", head, css[j + 1:k].strip()
        i = k + 1


def main():
    eb = "\n".join(styles(EB))
    eb_rules = {(m, s, b) for m, s, b in rules(eb)}
    out, seen = [], set()
    for block in styles(DUX):
        for media, sel, body in rules(block):
            if not WANT.search(sel) or (media, sel, body) in eb_rules or (media, sel, body) in seen:
                continue
            seen.add((media, sel, body))
            rule = "%s{%s}" % (sel, body)
            out.append("%s{%s}" % (media, rule) if media else rule)
    OUT.write_text("/* Duxford page base styles for Where to watch on the map, Food and drink and the photo band.\n"
                   "   Made by extract_base_css.py from the Duxford page. Do not edit by hand. */\n" + "\n".join(out) + "\n",
                   encoding="utf8")
    print("wrote", OUT.name, len(out), "rules")


if __name__ == "__main__":
    main()
