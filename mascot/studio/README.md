# Pip Studio

Make a Pip poster or an 8 second Pip video without any design software.

- Use it here: https://claude.ai/artifact/WmDrUCKSovneAZtS6FAWLe (it saves pictures and videos to your device).
- Or open `index.html` from a web server. Opened straight from a folder, the browser blocks saving the picture.
- `node mascot/studio/render.js out.mp4 '{"format":"tall","pose":"cheer","colour":"yellow","headline":"See Pip?","sub":"It must be airshow season."}'` makes the best quality MP4 offline.
- `assets/mascot.js` is a copy of `mascot/mascot.js`. Copy it again if Pip's drawing changes.
- `assets/music.mp3` comes from `python3 mascot/film/music.py studio` (made from scratch, no licence needed).
- `examples/` holds three example videos and a screen recording of the studio being used.
