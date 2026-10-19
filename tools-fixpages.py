"""Site-wide fixes for pages shown on Wix through the airshow-page loader.

1. The loader rewrites `html` and `body` in CSS to `.ae-body`, so `html body .x`
   becomes `.ae-body .ae-body .x` and never matches. Use `body .x` instead.
2. Light green bands become light navy, and the alternate bands keep the contour lines.
3. Links back into the site use the real Wix page addresses.
"""
import re, sys, pathlib

LIGHT_NAVY = '#E9EEF5'      # band background, a light tint of navy #13293C
LIGHT_NAVY_2 = '#DFE6F0'    # slightly deeper tint, replaces the teal wash boxes

SLUGS = {
    'copy-of-template-page-1': 'cosfordairshow',
    'copy-of-template-page-2': 'eastbourneairshow',
    'copy-of-template-page-3': 'clactonairshow',
    'copy-of-template-page-4': 'walesairshow',
    'copy-of-template-page-5': 'shuttleworthairshows',
    'copy-of-template-page-7': 'little-gransden-air-and-car-show',
    'copy-of-template-page': 'duxfordairshows',
    'general-6-1': 'camping-at-airshows',
    'general-6': 'planning-your-first-airshow',
    'find-your-airshow': 'air-shows-guides',
}

def fix(h):
    n = {}
    # 1. selectors the loader cannot match
    h, n['html body'] = re.subn(r'(?<![\w-])html body(?=[\s.:#\[>+~)])', 'body', h)
    # 2. light green to light navy, contours kept on alternate bands
    h, n['even band'] = re.subn(r'(body \.fold:nth-child\(even\) \.panel\{)background:var\(--pale\)',
                                r'\1background-color:var(--pale)', h)
    h, n['pale'] = re.subn(r'#F2F7F7', LIGHT_NAVY, h, flags=re.I)
    h, n['teal wash'] = re.subn(r'#E6F5F4', LIGHT_NAVY_2, h, flags=re.I)
    # 3. site addresses
    c = 0
    for old, new in sorted(SLUGS.items(), key=lambda kv: -len(kv[0])):
        h, k = re.subn(r"(ukairshowguide\.co\.uk/|')" + re.escape(old) + r"(?=['\"/#?]|$)", r'\g<1>' + new, h)
        c += k
    n['slugs'] = c
    return h, n

if __name__ == '__main__':
    for p in sys.argv[1:]:
        f = pathlib.Path(p)
        h, n = fix(f.read_text(encoding='utf8'))
        f.write_text(h, encoding='utf8')
        print(p, n)
