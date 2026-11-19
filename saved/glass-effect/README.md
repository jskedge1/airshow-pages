# The glass effect

The house style for every UK Airshow Guide information video (saved 17 Nov 2026). Use it for any new explainer, show guide or tips video, so they all look like one series.

Big uppercase words slam, rise and whip in on the beat over navy. Key words are filled with real photos and have a white outline. Mint highlight bars sweep in behind the important phrases, and warnings are in red. Each step opens with a red full screen card: a plain "Step 1" label in Barlow bold, then a huge title. No "of 6" count. Photos sit in white print frames beside the words. A mint story bar runs along the top, and every film ends on the same end card (below). Music and sound effects are made in code and timed to the words.

One engine, one content file per film, two formats:

| Film | Page | Steps |
|---|---|---|
| How to plan your 2027 airshow | `index-plan.html` | 8 |
| How to plan your 2027 season | `index-season.html` | 6 |
| How to plan the RAF Cosford Air Show 2027 | `index-cosford.html` | 6 |
| Blackpool Air Show 2027 | `index-blackpool.html` | 5 |
| Shuttleworth air shows 2027 | `index-shuttleworth.html` | 5 |
| Duxford air shows 2027 | `index-duxford.html` | 6 |
| Duxford air shows 2027, type scale version (60 fps) | `index-duxford2.html` | 6 |
| Camping at airshows | `index-camping.html` | 5 |
| Where to watch an airshow | `index-watch.html` | 5 |
| Airshow photography for beginners | `index-photography.html` | 5 |
| Featured air shows 2027 (not the full calendar) | `index-featured.html` | 7 |
| UK air show calendar 2027 (every show on the site) | `index-calendar.html` | 7 |
| Website walkthrough 2027 (two minutes, real pages in a phone or browser) | `index-walkthrough.html` | 8 |
| How My Airshow Hub works (landscape only, about 2.5 minutes) | `index-hub.html?fmt=land` | 8 |
| Aircraft restoration projects: an outreach film for organisations with a restoration under way (landscape only, about 2 minutes) | `index-restoration.html?fmt=land` | 7 |
| UK Airshow Guide advert, glass effect cut (about 44 seconds) | `index-advert.html` | 5 |
| UK Airshow Guide advert, cinematic cut (trailer style, about 45 seconds) | `index-advert-cine.html` | 7 |
| UK Airshow Guide advert, cinematic cut, Z6 video version (Cosford trailer look, about 45 seconds) | `index-advert-cine-video.html` | 7 |
| Starter for a new film | `index-template.html` | 1 |
| Starter for a new film in the cinematic layout | `index-cine-template.html` | 1 |

- Portrait 1080 x 1920: open the page as it is.
- Landscape 1920 x 1080: add `?fmt=land` to the address.
- Open any page in a browser to watch a live preview, for example https://jskedge1.github.io/airshow-pages/saved/glass-effect/index-cosford.html

## Type scale (use this for new films)
Set `typeScale: true` in the content file. The whole film then uses three sizes only: large (Barlow 800 uppercase, white), medium (Barlow 700, mint) and small (Assistant 600, grey). `huge` and `big` are the same large size. A line too wide for the slide wraps onto the next line instead of shrinking, and the renderer prints `PAGE WARN type scale` for anything that still does not fit. Photo filled hero words with an explicit `size` keep it. Break long phrases by hand at natural points. The project skill `.claude/skills/glass-effect-video` has the full checklist.

## Smooth and clear (use this for new films)
Set `smooth: true` in the content file. It turns the film grain off, makes the slams and zoom exits gentler, takes the overshoot and tilt out of drops, and stops the camera tilt on the step cards. Render frames with `JPGQ=98` and encode with `-crf 16` so the picture stays clean.

## The end card
Every film finishes on the same card, built by `film4.js`, so there is nothing to set up for it:
- The UK Airshow Guide swish logo from the airshow trailers (`photos/logo-swish.png`, from `logo-2026-new.png`) zooms in, centred, with a soft mint glow behind it.
- Under the logo: the film's `readLine` ("Read my full camping guide at") and the red ukairshowguide.co.uk button.
- Along the bottom: "FOLLOW FOR MORE TIPS" over Instagram, Facebook and YouTube icons. Change the order or drop one with `socials: ['Instagram', 'YouTube']` in the content file.
- The Instagram handle is @ukairshowguide and the YouTube channel is @TheBigGuidetoUKAirShows. They are different, so the card names the platforms and does not show one handle for all three.

## Make a new film
1. Copy `content-template.js` to `content-<topic>.js` and `index-template.html` to `index-<topic>.html`, then point the page at the new content file.
2. Change `intro`, `stops` and `outro`. Any number of steps works, and each step can hold any number of points; the story bar and the "Step 1", "Step 2" labels follow the list.
   - `stepLabel: false` hides the Step label (the featured and calendar films use months as titles).
   - `pointBeats` sets how long each point stays up (default 4.5 beats; the calendar uses 9 so the lists can be read).
   - A point's `o: { uniform: true }` gives every line of the same size the same type size, for lists.
3. Each step is `['Title|second line', 'When line', [three points]]`. Each point has:
   - `lines`: `[size, words]`, where size is `huge`, `big`, `mid` or `small`
   - `pics`: one or two photo panels, the file names in `photos/` without `p-` (for example `['cosjaguars']`). Add a caption after a bar to name what is in the photo: `['bp-mig|MiG-17']`
   - `bg`: a dimmed photo or clip behind the words
4. Inside the words:
   - `[WORD|p:name]` fills the word with `photos/p-name.jpg`
   - `*WORD*` puts a mint highlight bar behind it
   - `_WORD_` makes it red
   - `~WORD~` puts a purple highlight bar behind it (white text). Purple (#6950A1) is the transport page colour: use it for travel and getting there (trains, shuttles, parking, roads).
5. New photos: 16:9 crops about 1000 px wide, saved as `photos/p-name.jpg`. Use real photos where you can.

## Render a video
Needs Node with Playwright, ffmpeg, and Python with numpy.
1. `sh make-frames.sh` once, to rebuild the clip frames from `clips/` (campsite pan, shelter and pitches; they are not stored in the repo).
2. Frames:
   - Portrait: `PAGE=index-cosford.html OUT=out FPS=60 node render.mjs frames`
   - Landscape: `PAGE='index-cosford.html?fmt=land' OUT=outL VW=1920 VH=1080 FPS=60 node render.mjs frames`
   - 60 fps is the standard from the Duxford type scale version on (older films were 24 fps).
   - To check first, use `sheet 1` instead of `frames` for a contact sheet.
3. Music and effects: `OUT=out python3 score.py` writes `out/mix.wav`.
4. Master the sound to about -14 LUFS:
   `ffmpeg -i out/mix.wav -af "highpass=f=28,lowpass=f=14000,aformat=channel_layouts=stereo,aresample=192000,volume=5.6dB,alimiter=limit=0.7:attack=1:release=80:level=false,aresample=48000" out/mix_norm.wav`
5. Encode:
   `ffmpeg -framerate 60 -i out/frames/f%05d.jpg -i out/mix_norm.wav -vf format=yuv420p -c:v libx264 -crf 20 -c:a aac -b:a 256k -cutoff 18000 -shortest -movflags +faststart video.mp4`
   For landscape, use `outL/frames` with the same `out/mix_norm.wav`.

## The cinematic layout (information films)
A second layout for information videos and adverts, saved from the advert's cinematic cut (19 Nov 2026). It uses the same engine, words, colours, type scale and end card as the glass effect, with a trailer look:
- Black letterbox bars, and full screen graded shots with a slow push in and a small kick on each cut.
- Huge trailer titles that track in from wide letter spacing, with a white impact flash on each hard cut. Small titles ("Step 1", a lead in) fade in quietly.
- The glass effect words land over the shots, which dim behind them.
- The standard end card (`endCard()` in `film4.js`).
- The score is `score-cine.py`: a drone and heartbeat, a rising string ostinato with an impact on every cut, and a driving section under the words.

Make one:
1. Copy `content-cine-template.js` to `content-<topic>.js` and `index-cine-template.html` to `index-<topic>-cine.html`, and point the page at the new file.
2. Fill in `shots`, `titles` and `glass`, all in beats at 104 bpm. Shots can be Jack's photos (`img: 'jtyphoon'` uses `photos/f-` and `fp-`), any image path (`src`, `srcP`), or a real site screen (`screen: true`, softened so the words read).
3. **Every shot must match the words over it.** Camping goes over a show campsite (`l-flyby`, `cine/flyby`), and the calendar, transport, photography (camera settings) and Hub over their real pages in `screens/`. Aircraft shots go behind general lines only, never behind a topic they don't show. Captions name the aircraft and the show, or the page.
4. Render as usual, then make the sound with `OUT=<dir> python3 score-cine.py`. Master with the README chain using `volume=2.2dB` (not 5.6dB) for this score, and encode with `-crf 16`.

**The Cosford trailer look (use this for new cinematic films, 19 Nov 2026).** Jack asked for the cinematic films to match the RAF Cosford Hollywood trailer v5 (Jacks Drive, `08 Videos and Adverts/Trailers/Cosford Hollywood trailer/Cosford-Hollywood-Trailer-2min-v5.mp4`), so they feel like one series. Set these in the content file:
- `titleStyle: 'glass'`: the trailer titles become the Cosford glass letters. Barlow 700 capitals cut out of black, so the footage shows through the letters, frosted (blur and colour lift) with a faint top lit body, a thin bright edge and one slow light sweep. The footage dims over about 0.75 s, the letters fade in over about 1 s, and the lockup pushes in 4.5 %. No glow. `'Line one|line two'` gives the Cosford two line lockup: a big first line (212 px, 22 px tracking at 1920 wide) over a smaller wide tracked line (124 px, 64 px tracking). In portrait the first line splits onto two big lines when it would otherwise shrink, and the second line is tracked tighter. `{ black: 1 }` makes a full black title card (put a colourful slow shot behind it, as Cosford does); the default `.55` keeps the shot visible. Small lead in titles stay plain Barlow 700.
- `flash: false`: no white flash on the cuts (the Cosford trailer has none).
- `snapBpm: 140`: every cut, title and slide snaps to the beat grid of The Battlefield (140 bpm), while the content keeps its beat numbers at 104 bpm.
- `grain: 0` for video footage (Jack's rule: denoise, never grain).
- Music: `score-cine-music.py` instead of `score-cine.py`. It edits Jack's own **The Battlefield** (Siddharth Parashar, Epidemic Sound, the Cosford trailer track) on its beat grid: pulse intro, hit build under the hero shots, the climax under the one beat cuts, the breakdown under the black title card, the full wall under the glass slides, build 2 into the close. **Mission One** (Hampus Naeselius, Epidemic Sound, also 140 bpm, from Jack's new music in Downloads, copied to `Music for Videos`) blends in for the close: a two beat lead in, then its big hit lands on "Your summer starts here". The Battlefield's real ending plays under the end card. Jack's impact stingers go lightly on the hard cuts and on the title cards and end card. With `CLIPS=clips-<film>.json` the real engine sound of each clip sits under the music (voice band cut, no commentary; big passes as roar shots with the music ducked). Edit the `EDIT` list at the top of the script for a new film.
- Master with `sh master.sh <dir>` (about -14 LUFS, true peak under -1 dBFS), encode at 60 fps with `-crf 16`.

**Video clips in cine.js.** A shot can be a video clip: `{ clip: 'cine/<name>L', clipP: 'cine/<name>', n }` is a folder of 60 fps frames (`0001.jpg` on), shown frame by frame with the same grade, push in, dim and caption. Build the folders from Jack's Z6 4K clips with `uv run --with numpy python3 make-clip-frames.py clips-<film>.json` (needs ffmpeg). The JSON lists each clip's source on Jacks Drive, in point, length, zoom (`cw`) and slow motion (`speed`). The script runs the cinematic trailer clean up: it tracks the aircraft and keeps it centred (which also steadies the shot), removes sensor dust on plain sky, matches white balance on neutral sky, sets exposure and lifts the shadows, and lightly denoises. It writes 1920 x 1080 frames and a 1080 x 1920 crop around the aircraft. The frames are not stored in git (`cine/v-*` is ignored), so run it again after cloning. `render.mjs` waits for each clip frame to load (`window.SETTLE`). Set `CHROME=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` to render with an installed Chrome.

## House rules for information videos
- Step cards say "Step 1", "Step 2" in Barlow bold. Never "STEP 1 OF 5".
- The small black box on a step card names the topic ("Plan your day", "Tickets, parking and the train"). It never repeats a price, time or fact that the slides after it show.
- Flying times: say "flying starts early afternoon" (or "late morning"), not a clock time. The show's programme sets the exact times.
- Leave room around the words: the engine adds line spacing and padding so nothing touches or gets cropped. Keep lines short rather than shrinking the type.
- Every fact comes from the matching guide on ukairshowguide.co.uk. Nothing is made up.
- Anything based on the 2026 show, or not announced yet, says so on screen ("in 2026", "dates to be confirmed").
- Plain English, an advisory tone, and no dashes in the text.
- Real photos first, and each photo matches the line it sits beside. Caption aircraft by name. Flag any AI image.
- No personal names on photos.
- Deliver both formats: portrait for Reels, Shorts and TikTok, landscape for YouTube and the site.

## Website screens (the walkthrough)
A point can show a real page of the site: `screen: { m: ['home', 0, 250], d: ['home', 0, 300] }` gives the page, and the scroll from and to in CSS pixels, for the phone (m, portrait) and desktop (d, landscape) shots. The page sits in a phone or a browser window that tilts in, then scrolls smoothly to the part being described, with the words above or beside it.
1. Shoot the pages: `node shoot3.mjs m home duxford` and `node shoot3.mjs d home duxford` (it scrolls a normal window down the page and stitches each screenful, because very tall full page shots come out blank).
2. Crop each screen to `screens/<page>-<from>-<to>-m.jpg` and `-d.jpg` (the crops for the walkthrough are in `screens/`).
3. Keep anything you don't want shown (for example Southport) outside the scroll range.

Zoom mode, used for the hub film: `screen: Z(page, x, y from, y to, zoom)` loads the whole page (`screens/<page>-full-d.jpg`), opens on the full width and pushes in on the panel centred at (x, y), drifting from y to y. Use it when the detail matters.
The hub screens come from the working preview `previews/hub-login-demo.html`, filled in like a member by `hubcap.mjs`: RIAT and Eastbourne saved, a few ticks, shown as the example member Alex (the name the hub's own explainer uses), the preview banner hidden and the Southport labels hidden. History, Hangar and Group need the live site, so they show as a new member sees them.

The hub's own Show Day tab only says "Loading the running orders" in the preview, because running orders come from the live site. So the Show Day slides use `screens/hub-showday2-full-d.jpg`, shot by `showdaycap.mjs` from `previews/show-day-harness.html` (the Show Day panel in hub mode, no test photo). It shows the preview clock, the running order notice, the sky compass, live radar, crowd reports and the programme upload. No running order with act names and times exists anywhere yet, so the film never shows one: don't make one up.

End card items stay on until the very end (`t1: 1e6`). They used to stop at 99 seconds, which blanked the end card on anything longer.

## The calendar film
`content-calendar.js` is generated from the live calendar page, so names and dates always match the site:
`node gen-calendar.js ../../uk-airshow-calendar.html > content-calendar.js`
Shows with no 2027 date are listed under "Date to be confirmed" with no date or month. Southport and Old Buckenham are left out of the videos on request (the `SKIP` line in `gen-calendar.js`), and Southport is not in the featured film. Run it again whenever the calendar changes, then re-render.

## Notes
- Fonts are Barlow and Assistant, in `fonts/`.
- Colours: navy #0E2131, red #D74949, mint #5FE3D6, purple #6950A1 (from the transport page, for travel).
- The chairs, trolley and toddler photos (`p-chairsfam`, `p-trolley`, `p-toddler`) are AI images from the image album. Every other photo is real.
- The Cosford facts in `content-cosford.js` are from the RAF Cosford guide and based on the 2026 show. Update them when the 2027 details are announced.
- The Blackpool facts are from the Blackpool guide. The 2027 dates are not announced, so times, travel and the line up are from the 2026 show and say so on screen.
- The Shuttleworth facts and the seven 2027 dates are from the Shuttleworth guide.
- The Duxford facts are from the Duxford guide (2027 calendar checked 11 October 2026). Photos named `p-dx-*` are the real Duxford photos from that guide.
- The camping, where to watch and photography films use the tips from those guides on the site.
- Photos named `p-bp-*` (Blackpool) and `p-sw-*` (Old Warden) are from Mac's airshow folders. Photos named `p-c-*` are the real campsite photos from the camping guide.

## The restoration projects film
`content-restoration.js` is a landscape film to attach to emails to aviation organisations that have a restoration under way (planes, helicopters, jet engines, cockpits, any piece of aviation history). It offers them a Restoration Projects page on the site and tours what that page gives them, room by room: the story, the workshop job cards, the gallery, fly or display, where to see it, the team, support and visitor questions.
- The screens are the Restoration Projects preview page (Jaguar GR3A "Phoenix"), shot at 1440 wide into `screens/restoration-full-d.jpg` and used in zoom mode. That page is a sample: its jet, people, dates and photos are made up and its photos are AI generated. The film says "Example page" and "The jet and photos are a sample" on screen, and never presents Phoenix as a real project. Reshoot the screen when a real project page exists.
- The photo panels and photo filled words are real photos only (Jaguars at Cosford, Chinook, Tornado, Swordfish, Lancaster, Spitfire, Hurricanes).
- Two files are delivered: the 60 fps master, and an email copy (1280 x 720, 30 fps) small enough to attach.

## The advert (two cuts)
An advert for the whole site: everything you need for UK air shows in one place. Every claim is from the live pages (home, the 2027 calendar, public transport, camping, photography and My Airshow Hub, "free for everyone, no card, no catch").
- `content-advert.js` is the glass effect cut: red title cards (no Step label), photo prints, real site screens, the standard end card.
- `content-advert-cine.js` is the cinematic cut, built by `cine.js` on the same engine: letterbox bars, full screen graded shots with slow big push ins, huge trailer titles with impact flashes, then the glass effect words landing over the dimmed shots, and the same end card (`endCard()` in `film4.js`). Its score is `score-cine.py` (drone and heartbeat, a rising string ostinato with an impact on every cut, a driving section under the words). Render it like any film, but make the sound with `OUT=... python3 score-cine.py`.
- Shots and photos are Jack's own RIAT 2025 photos (`photos/f-j*.jpg` landscape 2400 wide, `fp-j*.jpg` portrait crops, `p-j*.jpg` print panels), from Drive, Air Shows, RIAT 2025. The display pilot's name on the Typhoon is blurred. Captions name the aircraft and the show.
- `content-advert-cine-video.js` (`index-advert-cine-video.html`) is the **Z6 video version** of the cinematic cut: the same words, timing and topic slides, with the aircraft shots swapped for Jack's own Nikon Z6 clips from RAF Cosford 2026 (Typhoon, Chinook, B-17, F-35B hover, Red Arrows, Apache) and Eastbourne 2026 (BBMF Dakota, Spitfire, the crowd on the beach watching the B-17). Sources and in points are in `clips-advert.json`; build the frames with `make-clip-frames.py` first. Captions name the aircraft and the show.
- Both cinematic cuts use the Cosford trailer look and music (see "The cinematic layout"): glass titles, no flash, cuts on the beat, `score-cine-music.py` (with `CLIPS=clips-advert.json` for the video version, which adds the engine sound). Render to `rv-civL` / `rv-civP` (video) and `rv-ciL2` / `rv-ciP2` (photos), one mix per cut for both formats.
- Finished files: Jacks Drive, `Uk Airshow Guide/08 Videos and Adverts/Adverts/Cinematic advert/` (landscape and portrait of both cuts, with contact sheets).
