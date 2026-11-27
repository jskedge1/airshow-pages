# Pip, Episode 7: Harry the Harrier

This episode follows Episode 6, where Major Tower invited Pip and the team to Duxford and promised a surprise
guest from another country. The guest is **Harry the Harrier**, a jump jet from the Spanish Navy (Armada Española).

The film is `final/pip-episode-07-harry-the-harrier.mp4`: 16x9, 1920x1080, 30 fps, about 7 minutes 34 seconds.
`SCRIPT.md` has every line with its time, the on-screen notes and where the facts come from.

## How it's made

It uses the same calm cartoon kit and Pip drawings as the other Pip films (`shared/`, `assets/pip/`, from
`mascot/film` on `claude/pip-brand-campaign`). Each frame is drawn from the time alone, so it renders the same every time.

- `film.js` holds the script, the characters (Harry, the Spitfire, the Hurricane, Duxford's tower and hangars) and the scenes.
  Line timings come from the script: each line stays up for 2.1 s plus 0.39 s a word.
- `music.py` makes the music and sound from scratch, so no licence is needed. That covers the bed, the Spanish guitar,
  the Harrier's roar and hover, the Merlin engines, Major Tower's radio clicks and the crowd.

```
node render.js timing      # film.json, cues.json and script-times.json from the script
python3 music.py           # music.wav
node render.js stills 95   # stills/000095.png, to check a moment
node render.js film 4      # final/…mp4, in 4 parallel chunks (Chromium and Playwright, plus ffmpeg)
```

To change a line, edit `SCRIPT` at the top of `film.js`, then run all four steps again.
