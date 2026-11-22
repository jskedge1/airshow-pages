"""Make a built feature page's styles work inside the live site as well as on its own.

On ukairshowguide.co.uk the page is not shown in a frame: the site's airshow-page element puts it inside its own
container (div.ae-body) and rewrites the page's styles, turning `html` and `body` into `.ae-body`. A new design rule
written as `html.nz body main ...` then becomes `.ae-body.nz .ae-body main ...`, which looks for one container inside
another, so it never matches on the live site. That is why the live pages did not match the previews (the old page
header showed under "Everything you need for the day", buttons lost their style, and so on). Found 22 Nov 2026.

Writing the same rules as `body:not(.nzx):not(nzx) main ...` works in both places: on its own the page has a body,
and on the site `body` becomes `.ae-body`, which is the container itself. The two :not() parts never exclude
anything; they only keep each rule exactly as strong as `html.nz body` was (one class and two element names), so
the rules still win over the older page's own styles. The new design script always runs on these pages, so the
nz class was never doing anything else.

Rules written as `html body ...` (some older pages have them) break in the same way and become
`body:not(nzx) ...`, again exactly as strong as before.

Frame content (<template> blocks, shown in their own documents) is left exactly as it is.
"""
import re

SAFE = 'body:not(.nzx):not(nzx)'
SAFE_PLAIN = 'body:not(nzx)'
_PLAIN = re.compile(r'(?<![\w.#-])html body\b')


def _fix(css: str) -> str:
    return _PLAIN.sub(SAFE_PLAIN, css.replace('html.nz body', SAFE))


_TEMPLATE = re.compile(r'<template\b[\s\S]*?</template>')


def wix_safe(html: str) -> str:
    out, last = [], 0
    for m in _TEMPLATE.finditer(html):
        out.append(_fix(html[last:m.start()]))
        out.append(m.group(0))
        last = m.end()
    out.append(_fix(html[last:]))
    return ''.join(out)
