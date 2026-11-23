# How to plan your airshow season: cartoon explainer video

`plan-your-airshow-season.mp4`: 1920x1080, 60 fps, 1 min 58 s, with a soft lo-fi music bed and sound effects.

Twelve steps, each a cartoon scene with a text box:
1. Pick your shows (base or seafront)
2. Set your budget (free or tickets)
3. Book early
4. Getting there
5. Where to stay
6. Food plan
7. Camera or just watching?
8. Pick your spot (front row = arrive early)
9. Check the weather
10. Pack the essentials
11. Know the flying times
12. Plan your exit

The film is drawn in code: `film.js` paints every frame (characters, props, text boxes, jet-wipe
transitions). The copy for every text box is the `STEPS` list at the top of `film.js`. Shot plan:
`docs/shotlist.md`.

## Rebuild

Run these from the repository root (`<skill>` is the motion-reel skill folder):

```
uv run <skill>/scripts/beats.py airshow-season-video --synth --flavor lofi --bpm 84 --mode major --tonic F --duration 118 --seed 7
node <skill>/scripts/render.mjs --film airshow-season-video --format 16x9 --video-only
node <skill>/scripts/sfx.mjs airshow-season-video
node <skill>/scripts/mix.mjs airshow-season-video
```

## Using your own music

The music is synthesized. To use a track instead, replace step 1 with
`uv run <skill>/scripts/beats.py airshow-season-video --track your-song.mp3`. That measures the
song's beat and writes a new `beats.json`. The scene timings are in beats, so they follow the new
tempo. A slower or faster song changes the length of the video.

## Saved as the "cartoon motion design" style

This video is the approved reference for the UK Airshow Guide cartoon motion design. The house
style, and how to start a new video in it, are in `.claude/skills/cartoon-motion-design/SKILL.md`.
