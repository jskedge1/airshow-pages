# The glass effect

The house style for every UK Airshow Guide information video (saved 17 Nov 2026). Use it for any new explainer, show guide or tips video, so they all look like one series.

Big uppercase words slam, rise and whip in on the beat over navy. Key words are filled with real photos and have a white outline. Mint highlight bars sweep in behind the important phrases, and warnings are in red. Each step opens with a red full screen card: a plain "Step 1" label in Barlow bold, then a huge title. No "of 6" count. Photos sit in white print frames beside the words. A mint story bar runs along the top, there is film grain, and every film ends on the same end card (below). Music and sound effects are made in code and timed to the words.

One engine, one content file per film, two formats:

| Film | Page | Steps |
|---|---|---|
| How to plan your 2027 airshow | `index-plan.html` | 8 |
| How to plan your 2027 season | `index-season.html` | 6 |
| How to plan the RAF Cosford Air Show 2027 | `index-cosford.html` | 6 |
| Blackpool Air Show 2027 | `index-blackpool.html` | 5 |
| Shuttleworth air shows 2027 | `index-shuttleworth.html` | 5 |
| Camping at airshows | `index-camping.html` | 5 |
| Where to watch an airshow | `index-watch.html` | 5 |
| Airshow photography for beginners | `index-photography.html` | 5 |
| Starter for a new film | `index-template.html` | 1 |

- Portrait 1080 x 1920: open the page as it is.
- Landscape 1920 x 1080: add `?fmt=land` to the address.
- Open any page in a browser to watch a live preview, for example https://jskedge1.github.io/airshow-pages/saved/glass-effect/index-cosford.html

## The end card
Every film finishes on the same card, built by `film4.js`, so there is nothing to set up for it:
- The UK Airshow Guide swish logo from the airshow trailers (`photos/logo-swish.png`, from `logo-2026-new.png`) zooms in, centred, with a soft mint glow behind it.
- Under the logo: the film's `readLine` ("Read my full camping guide at") and the red ukairshowguide.co.uk button.
- Along the bottom: "FOLLOW FOR MORE TIPS" over Instagram, Facebook and YouTube icons. Change the order or drop one with `socials: ['Instagram', 'YouTube']` in the content file.
- The Instagram handle is @ukairshowguide and the YouTube channel is @TheBigGuidetoUKAirShows. They are different, so the card names the platforms and does not show one handle for all three.

## Make a new film
1. Copy `content-template.js` to `content-<topic>.js` and `index-template.html` to `index-<topic>.html`, then point the page at the new content file.
2. Change `intro`, `stops` and `outro`. Any number of steps works, and the story bar and the "Step 1", "Step 2" labels follow the list.
3. Each step is `['Title|second line', 'When line', [three points]]`. Each point has:
   - `lines`: `[size, words]`, where size is `huge`, `big`, `mid` or `small`
   - `pics`: one or two photo panels, the file names in `photos/` without `p-` (for example `['cosjaguars']`). Add a caption after a bar to name what is in the photo: `['bp-mig|MiG-17']`
   - `bg`: a dimmed photo or clip behind the words
4. Inside the words:
   - `[WORD|p:name]` fills the word with `photos/p-name.jpg`
   - `*WORD*` puts a mint highlight bar behind it
   - `_WORD_` makes it red
5. New photos: 16:9 crops about 1000 px wide, saved as `photos/p-name.jpg`. Use real photos where you can.

## Render a video
Needs Node with Playwright, ffmpeg, and Python with numpy.
1. `sh make-frames.sh` once, to rebuild the clip frames from `clips/` (campsite pan, shelter and pitches; they are not stored in the repo).
2. Frames:
   - Portrait: `PAGE=index-cosford.html OUT=out FPS=24 node render.mjs frames`
   - Landscape: `PAGE='index-cosford.html?fmt=land' OUT=outL VW=1920 VH=1080 FPS=24 node render.mjs frames`
   - To check first, use `sheet 1` instead of `frames` for a contact sheet.
3. Music and effects: `OUT=out python3 score.py` writes `out/mix.wav`.
4. Master the sound to about -14 LUFS:
   `ffmpeg -i out/mix.wav -af "highpass=f=28,lowpass=f=14000,aformat=channel_layouts=stereo,aresample=192000,volume=5.6dB,alimiter=limit=0.7:attack=1:release=80:level=false,aresample=48000" out/mix_norm.wav`
5. Encode:
   `ffmpeg -framerate 24 -i out/frames/f%05d.jpg -i out/mix_norm.wav -vf format=yuv420p -c:v libx264 -crf 20 -c:a aac -b:a 256k -cutoff 18000 -shortest -movflags +faststart video.mp4`
   For landscape, use `outL/frames` with the same `out/mix_norm.wav`.

## House rules for information videos
- Step cards say "Step 1", "Step 2" in Barlow bold. Never "STEP 1 OF 5".
- Leave room around the words: the engine adds line spacing and padding so nothing touches or gets cropped. Keep lines short rather than shrinking the type.
- Every fact comes from the matching guide on ukairshowguide.co.uk. Nothing is made up.
- Anything based on the 2026 show, or not announced yet, says so on screen ("in 2026", "dates to be confirmed").
- Plain English, an advisory tone, and no dashes in the text.
- Real photos first, and each photo matches the line it sits beside. Caption aircraft by name. Flag any AI image.
- No personal names on photos.
- Deliver both formats: portrait for Reels, Shorts and TikTok, landscape for YouTube and the site.

## Notes
- Fonts are Barlow and Assistant, in `fonts/`.
- Colours: navy #0E2131, red #D74949, mint #5FE3D6.
- The chairs, trolley and toddler photos (`p-chairsfam`, `p-trolley`, `p-toddler`) are AI images from the image album. Every other photo is real.
- The Cosford facts in `content-cosford.js` are from the RAF Cosford guide and based on the 2026 show. Update them when the 2027 details are announced.
- The Blackpool facts are from the Blackpool guide. The 2027 dates are not announced, so times, travel and the line up are from the 2026 show and say so on screen.
- The Shuttleworth facts and the seven 2027 dates are from the Shuttleworth guide.
- The camping, where to watch and photography films use the tips from those guides on the site.
- Photos named `p-bp-*` (Blackpool) and `p-sw-*` (Old Warden) are from Mac's airshow folders. Photos named `p-c-*` are the real campsite photos from the camping guide.
