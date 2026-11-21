#!/usr/bin/env python3
"""Builds widgets/index.html, the widget gallery, as one self-contained file.
Run after any change to widgets/ukag-widgets.js or widgets/gallery-template.html:  python3 tools-widgets.py
Also stops if any widget copy has a dash or a banned word."""
import base64, re, sys, os
here = os.path.dirname(os.path.abspath(__file__))
js = open(os.path.join(here, 'widgets/ukag-widgets.js'), encoding='utf-8').read()
tpl = open(os.path.join(here, 'widgets/gallery-template.html'), encoding='utf-8').read()
logo = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(here, 'brand/ukag-header-logo.png'), 'rb').read()).decode()
banned = ['delve', 'tapestry', 'realm', 'harness', 'pivotal', 'multifaceted', 'robust', 'showcase',
          'fall back', 'our aim is simple', 'game changer', 'at the end of the day']
bad = []
copy = re.sub(r'var CSS=".*?";\n', '', js, flags=re.S)
for s in re.findall(r"'((?:[^'\\\n]|\\.)*)'", copy):
    text = re.sub(r'<[^>]*>', ' ', s)
    if not re.search(r'[A-Za-z]{3,} [A-Za-z]{2,}', text) or re.search(r'https?:|=|\{|;|"|^[.#\[]', text):
        continue
    if re.search(r'[–—]| - ', text) or re.search(r'[A-Za-z]-[A-Za-z]', text):
        bad.append('dash: ' + text.strip()[:80])
    for w in banned:
        if w in text.lower():
            bad.append('"%s": %s' % (w, text.strip()[:80]))
if bad:
    sys.exit('Copy needs fixing:\n  ' + '\n  '.join(bad))
out = tpl.replace('@@LOGO@@', logo).replace('@@JS@@', js.replace('</script', '<\\/script'))
open(os.path.join(here, 'widgets/index.html'), 'w', encoding='utf-8').write(out)
print('widgets/index.html built, %d bytes' % len(out))
