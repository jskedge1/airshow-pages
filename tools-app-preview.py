"""Builds a working preview of the Airshow Hub app (app/) that runs without the Wix site.

The app, My Airshow Hub, the Airshow Forum and Show Day Live are copied into one folder with every
https://jskedge1.github.io/airshow-pages/ address made local, and app/demo-backend.js stands in for
the Wix page code with example data (log in, trips, must see, forum posts, replies, messages, Show Day).
The only change to the hub copy is that it believes it is on the site, so it talks to the example data.

Run: python3 tools-app-preview.py [output folder]   (default: previews/app-preview, not committed)
Open index.html from the folder, or publish the folder as a Claude artifact."""
import os, re, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'previews', 'app-preview'))
GH = 'https://jskedge1.github.io/airshow-pages/'


def read(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def write(p, s):
    full = os.path.join(OUT, p)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(s)


def rep(s, old, new, count=1):
    assert s.count(old) == count, ('anchor not found', old[:70], s.count(old))
    return s.replace(old, new)


def local(s):
    return s.replace(GH, '')


if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)

# the app itself, at the top of the folder
shell = read('app/index.html')
shell = rep(shell, '<link rel="manifest" href="manifest.webmanifest">\n', '')
shell = shell.replace('"../', '"')
shell = rep(shell, '<script src="app.js"></script>', '<script src="demo-backend.js"></script>\n<script src="app.js"></script>')
shell = rep(shell, '<script src="https://jskedge1.github.io/airshow-pages/fit-frame.js" defer></script>\n', '')
write('index.html', shell)
for f in ('app.js', 'demo-backend.js'):
    shutil.copy(os.path.join(ROOT, 'app', f), os.path.join(OUT, f))
shutil.copytree(os.path.join(ROOT, 'app', 'icons'), os.path.join(OUT, 'icons'))

# the hub: talks to the example data instead of checking it is on the website
hub = read('my-airshow-hub.html')
hub = rep(hub, 'var ON_SITE = (function () {', 'var ON_SITE = true || (function () {')
write('my-airshow-hub.html', local(hub))

# the forum and show day, unchanged apart from local addresses
for f in ('forum-clean.html', 'forum-live.js', 'forum-planes.js', 'links.js', 'show-day.html', 'fit-frame.js', 'back-tab.js'):
    write(f, local(read(f)))

for d in ('hub-img', 'forum-img'):
    shutil.copytree(os.path.join(ROOT, d), os.path.join(OUT, d))

left = []
for dp, _, files in os.walk(OUT):
    for f in files:
        if f.endswith(('.html', '.js')) and GH in open(os.path.join(dp, f), encoding='utf-8').read():
            left.append(f)
print('Built', OUT, '| still pointing at GitHub:', left or 'none')
