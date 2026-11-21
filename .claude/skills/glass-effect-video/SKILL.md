---
name: glass-effect-video
description: Make a UK Airshow Guide information video in "the glass effect" house style (kinetic typography explainer, portrait 1080x1920 and landscape 1920x1080). Use whenever Jack asks for an explainer, show guide, tips, featured shows or calendar video for ukairshowguide.co.uk, or says "glass effect".
---

# The glass effect information video

The design, engine and every film so far live in `saved/glass-effect/`. Read its `README.md` first.
This skill is the checklist that keeps every new film in the same house style.

## The look (keep it the same every time)
- Navy background (#0E2131) and a mint story bar along the top. No grain: set `smooth: true` in the content file for the clean, smooth look (gentle slams and zooms, no camera tilt).
- **The glass:** hero words filled with a real photo and given a white outline (`[WORD|p:photo]`), used for the intro and outro words.
- **Titles:** a red full-screen card for each step. It says "Step 1", "Step 2" in Barlow bold (never "STEP 1 OF 5"), with a huge uppercase title and a small black topic box.
- **Type scale:** set `typeScale: true` in the content file. That gives three sizes only:
  - large: Barlow 800 uppercase, white
  - medium: Barlow 700, mint
  - small: Assistant 600, grey

  Don't use extra sizes or extra fonts. A line too wide wraps instead of shrinking, so break long phrases by hand at natural points (`['big', 'Summer'], ['big', 'Air Show']`), and keep a highlighted phrase to one or two words per line.
- Mint highlight bars (`*word*`) for the key phrase, red (`_word_`) for warnings only, and purple highlight bars (`~word~`, #6950A1, the transport page colour) for travel and getting there.
- Real photos in white print frames, with a caption that names the aircraft (`'pic|Grumman Wildcat'`).
- **End card:**
  - The swish logo from the airshow trailers sits centred (`photos/logo-swish.png`).
  - The guide line and the red ukairshowguide.co.uk button sit under the logo.
  - "Follow for more tips" with the Instagram, Facebook and YouTube icons runs along the bottom.
  - No Typhoon fly-across.

## Facts (house rules)
- Every fact comes from the matching guide page in this repo (for example `duxford.html`). Never invent anything.
- If a show has no announced 2027 date, show "Date to be confirmed" and no date or month.
- Anything based on 2026 says so on screen.
- **Flying times:** write "Flying starts early afternoon" (or "late morning"), with "The programme sets the times", not a clock time.
- The black topic box on a step card never repeats a price, time or fact that the next slides show.
- Plain English, an advisory tone, and no dashes.
- Southport and Old Buckenham are left out of the featured and calendar films.

## Photos
- Use real photos only, in this order of preference:
  1. Jack's own photos.
  2. Mac's shared 2026 folders on Google Drive (Blackpool, Shuttleworth Military, Midlands, Scarborough).
  3. The real photos already on the site's guide pages.
- A photo beside a specific show, date or place must be from that show or place. If you can't confirm where or when a photo was taken, leave the slide without a picture rather than guess. No photos on road or junction slides.
- Skip any image the site marks "AI generated", and never put a personal name on a photo.
- Downloads from Drive must be under 10 MB.
- Jack's 2026 Duxford footage is on his external drive (`Jacks Drive/Duxford 2026`), which a cloud session can't reach. Ask for JPEG exports in Drive if they're needed.
- Crop to 16:9 at about 1000 px wide and save as `photos/p-<name>.jpg`.

## Build
1. Copy `content-template.js` and `index-template.html` and fill in the intro, steps and outro. Steps can hold any number of points. Use `stepLabel: false` when the step titles are months, and `pointBeats` for slides that need longer reading time.
2. For the full calendar, regenerate rather than typing: `node gen-calendar.js ../../uk-airshow-calendar.html > content-calendar.js`.
3. **Critique loop:** run at least 3 rounds before showing anything.
   - Render a still of every settled slide in both formats (`render.mjs stills`) and look at them at phone size.
   - Fix the worst three problems: wrapped orphan words, shrunk lines, wrong photo for a line, or a box that repeats a slide.
   - The renderer prints `PAGE WARN type scale` for any line that still doesn't fit. Fix every one.
4. Render frames at 60 fps with `JPGQ=98` for both formats:
   - Portrait: `FPS=60 ... render.mjs frames`
   - Landscape: add `?fmt=land` with `VW=1920 VH=1080`
5. Make the sound and encode:
   - `score.py` for music and effects.
   - Master to about -14 LUFS with the chain in the README.
   - Encode with `-framerate 60 -crf 16`, H.264 yuv420p.
6. Check each file with ffprobe (size, 60 fps, duration, audio present) and pull frames from the encoded file.
7. Then send portrait and landscape together.

## The cinematic layout
When Jack asks for the cinematic or trailer style, build it in the cinematic layout instead (README, "The cinematic layout"). Start from `content-cine-template.js` and `index-cine-template.html`.
- Every rule above still applies: the facts, plain English, the type scale and the end card.
- Each shot must match the words over it. Use a campsite for camping, and the real site screens for the calendar, transport, photography (camera settings) and Hub. Never put an aircraft behind a topic it doesn't show.
- **Use the Cosford trailer look (Jack, 19 Nov 2026):** set `titleStyle: 'glass'`, `flash: false` and `snapBpm: 140` in the content file (`grain: 0` for video). The titles are then the RAF Cosford Hollywood trailer v5 glass letters: Barlow 700 capitals cut out of black, frosted footage inside, a thin bright edge and one light sweep, a slow 4.5 % push in, two line lockups as `'Line one|line two'` (big line over a wide tracked smaller line). Put a colourful slow shot behind a full black card (`{ black: 1 }`).
- **Music:** `score-cine-music.py`, Jack's own The Battlefield (the Cosford trailer track, 140 bpm) edited on its beats, with Mission One (also 140 bpm) blended into the close and The Battlefield's real ending under the end card. Stingers lightly on the hard cuts and on the title cards. For Z6 footage, add `CLIPS=clips-<film>.json` for the real engine sound (no commentary). Master with `sh master.sh <dir>` to about -14 LUFS. Say which tracks were used.
- **Video clips:** Jack's Z6 footage goes in as clip shots (`clip`, `clipP`, `n`), built by `make-clip-frames.py` from a `clips-<film>.json` (tracking, dust, white balance, exposure, shadow lift, light denoise). Check the clip sheet for soft shots, faces looking at the camera and aircraft cut off before rendering.
- **Portrait:** render both formats; check the portrait stills at phone size (titles big and inside the width, captions and words clear of the bars, site screens use the mobile shots via `srcP`).
- **Trailers (Jack, 21 Nov 2026: high impact, big bold text, black screens, loud):** start from `content-trailer-2027.js` (README, "The 2027 season trailer"). Times are music beats, `M(beat)` at 140 bpm. Black cards (`slam: true`) carry the show names and short lines, glass lockups carry the big titles. One of Jack's cinematic hits lands on every card (`score-trailer-2027.py`). Captions give the show and year only, never an aircraft name. Video only, no photos, and use clips already used in the show trailers. A cloud session can only render the titles and sound preview (`clips=off`); the footage render happens on the Mac.
- The older look (tracked in titles with a flash, synthesised `score-cine.py` mastered with `volume=2.2dB`) is still there if a content file leaves those options out.

## Website walkthroughs
For a tour of the site, give points a `screen` (see the README section "Website screens"). Shoot real pages from jskedge1.github.io/airshow-pages with `shoot3.mjs`, hide nothing but the page height helper, never mock a screen, and keep shows that must not appear (Southport) out of the scroll range.

## Save
Copy the new content file, index page and any new photos into `saved/glass-effect/`, add a row to the README table, then commit and push to the working branch.
