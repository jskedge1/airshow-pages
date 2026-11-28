---
name: cartoon-motion-design
description: The UK Airshow Guide "cartoon motion design" house style for explainer videos. Use when asked for a cartoon video, a motion video, an animated how-to or explainer, or "the cartoon motion design" for the UK Airshow Guide. Cartoon people and props, square text boxes with ticked steps, real Red Arrows, Typhoon and A400M cut-outs, a jet-wipe between scenes and a logo end card. The approved original is airshow-season-video/ ("How to plan your airshow season").
---

# Cartoon motion design (UK Airshow Guide)

The approved reference is `airshow-season-video/` in this repo. The user signed it off as perfect
on 23 Nov 2026. A new video in this style starts as a copy of that folder, keeps the look exactly,
and changes only the copy and the scenes.

## Start a new video

1. Copy the folder: `cp -r airshow-season-video <new-slug>`. Delete `<new-slug>/audio/*.wav` and the
   finished MP4 and poster from the copy.
2. Set `title` and `duration` in `<new-slug>/film.json`.
3. Make the music bed and beat grid. The music is synthesized soft lo-fi:
   `uv run <motion-reel skill>/scripts/beats.py <new-slug> --synth --flavor lofi --bpm 84 --mode major --tonic F --duration <s> --seed 7`.
   If the user supplies a track, use `--track file.mp3` instead.
4. In `film.js`:
   - Edit `STEPS`, one entry per step: `title`, `q` (the question line) and `b` (3 or 4 bullets).
   - Set `NSTEP` to the number of steps.
   - Write one scene function per step, list them in `SCENES`, and add their accents to `HITS`.
5. Write `docs/shotlist.md` and show it to the user before building the scenes.
6. Render and check with the motion-reel skill (`render.mjs --contact`, `--strip`, `sfx.mjs`,
   `mix.mjs`, `sync.py`), then the full render.
7. Copy `out/<slug>/final.mp4` into the folder and commit it.

## The look (keep all of this)

**Palette** (`C` in film.js):
- navy `#13293C` for outlines and headings
- teal `#32B4AF` as the accent, with `#1A8580` for the question line
- red `#D7263D`, blue `#1D63B7`, gold `#F5B942`
- sky `#DCE6EE`, grass `#9BCF86`

**Type:**
- Barlow Condensed 800 for headings and signs.
- Barlow 600/700 for body text. The font files are in `fonts/`.

**No curved borders on any box.** The user asked for this explicitly.
- Text boxes are white with square corners, a 6 px navy outline, a teal strip along the top and a
  straight offset shadow.
- Step numbers sit in square navy badges.
- Ticks sit in square teal boxes.
- Signs, labels, tags and the URL bar are all straight-edged.
- Round shapes are fine for things that really are round: heads, clocks, coins, wheels, the sun
  and clouds.

**Cartoon people** (`person()`), the same family in every video:
- A: teal top, red cap.
- B: red top, long dark hair.
- K: the kid, in a gold top.
- They have navy outlines, dot eyes that blink (seeded), and poses set by arm and leg angles.

**Aircraft are real cut-outs, never cartoon jets.** The user said cartoon planes looked too
cartoony. They are in `assets/aircraft/`, copied from the site:
- Side views: `hawk-side.webp` (Red Arrows), `typhoon-side.webp` and `a400m-side.webp`.
- Top views: `hawk-top.webp` and `typhoon-top.webp`.
- Draw them with `jet()` (body `C.red` = Hawk, `C.blue` = Typhoon, `'a400'` = A400M) or `topJet()`.
- Red Arrows trail red, white and blue smoke (`smoke()`). Give the white smoke a grey edge so it
  shows against the sky.

**Layout:**
- 16:9, 1920x1080, 60 fps.
- The art goes on one side and the text box on the other, alternating sides each step.
- The ground line is at y 905.

**Motion:**
- The intro hook moves on frame 0: the Red Arrows trio, a title that pops in glyph by glyph, and a
  square red tag.
- Each step lasts 12 beats at 84 bpm (about 8.6 s).
- The text box springs in, the question line wipes on, and a bullet ticks in every 2 beats with a
  blip.
- Between steps, a Hawk or a Typhoon tows a cloud curtain across the screen. The new scene is
  behind it.
- The end card has the Red Arrows drawing red, white and blue trails, the new logo with the swish
  round it (`assets/logo.png`, from `camping-layout/img/uk-airshow-guide-logo.webp`), one
  sign-off line and the URL bar `ukairshowguide.co.uk`. Never use the old flat logo.

**Sound:**
- Soft music.
- Each visual accent gets a gentle SFX through `HITS`, kept low: whoosh on wipes, pop on cards,
  blips on ticks.
- Master to -14 LUFS.

## Copy rules

- Each text box uses sentence case: a capital on the first word and on proper nouns only, for
  example "Pick your spot", "Red Arrows".
- Signs, labels and tags are in ALL CAPS: "BASE", "SEAFRONT", "GATES OPEN", "EXIT",
  "THE 2027 SEASON IS COMING!".
- Every bullet fits on one line, under about 700 px at Barlow 600 44 px. Measure it, and reword
  rather than wrap. Never leave a single word alone on a line.
- Use UK English, plain words, and no dashes as punctuation.
- Check every word is readable on the half-size phone sheets before rendering.
