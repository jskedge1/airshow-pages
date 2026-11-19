# Plan your 2027 airshow season: shot list
20 s · 132 bpm · 44 beats (1 beat = 0.455 s) · formats: 9x16 (primary), 1x1, 16x9
Music: synthesized house, D major, intro bars 1-2, drop on beat 8, resolve from beat 40 · VO: none

Look: navy ground (#13293C / #0E2131), white type, **mint #5FE3D6 as the one accent** (the colour of
"One Easy Guide" on the home page). Red appears only inside the brand's own art: the Red Hawk
cut-out, the logo swoosh and the site's red "Start planning" button. Type: Barlow Condensed 700
(display) + Barlow 600 (UI), the site's own faces. Every headline is the site's own wording.

| # | beats | time | shot | on screen (asset) | motion | out (transition) | sound (hits) |
|---|-------|------|------|-------------------|--------|------------------|--------------|
| 1 | 0-6 | 0.00-2.73 | **Hook.** "EVERY UK AIRSHOW," lands on beat 0, "ONE EASY GUIDE" (mint) on beat 2 | `art/hero-arrows-riat23.jpg` full bleed (Red Arrows, red/white/blue smoke) | photo already moving on frame 0: log push 1.0→1.12 + slight drift; words drop in from above with a heavy spring, one line per beat, slight overshoot | — | impact @0, thud @2, riser 4→6 |
| 2 | 6-8 | 2.73-3.64 | **Fly-through wipe.** The Red Hawk crosses the frame, its smoke trail paints navy across the screen | `art/red-hawk.webp` | jet moves L→R on an eased arc, trail is a thick ribbon that grows behind it and fills the frame by beat 8 | trail = wipe into shot 3 (shot 3 is already under it as it clears) | jet whoosh @6, crash @8 |
| 3 | 8-12 | 3.64-5.45 | **The dates.** Kicker "UK AIRSHOW DATES 2027", big counter "46 SHOWS CONFIRMED" ticks 0→46 | `shots/page_uk-airshow-calendar-html_viewport.png` cropped to the "Season at a glance" panel (real bar chart) | screenshot card swings up from below with a spring and a 4° tilt that settles; counter rolls over beats 8-10 | card whips left, shot 4 slides in from right (both on screen) | drop @8, ticks 8-10, whip @12 |
| 4 | 12-16 | 5.45-7.27 | **The map.** "FIND THE SHOWS NEAR YOU" | `shots/page_airshow-map-html_viewport.png`, crop on the UK map | push in (log zoom) toward the red featured-show dots; a mint ring pulses once on the real dot cluster @14 | whip up: shot 5 pushes in from below | pop @14, whip @16 |
| 5 | 16-20 | 7.27-9.09 | **Travel.** "LEAVE THE CAR AT HOME" | `shots/page_public-transport-html_viewport.png` (headline + "Plan your journey" panel) over `art/fact-train.jpg` | photo slides in at back, screenshot card lands in front a beat later (parallax, 2 layers) | hard cut on 20 | slide @16, thud @17, cut @20 |
| 6 | 20-24 | 9.09-10.91 | **Camping.** "CAMP CONFIDENTLY" | `shots/page_camping-hub-html_viewport.png` (real hero) | slow log push + vertical drift; headline type set in the film over a mint bar wipe | split wipe: frame splits vertically, shot 7 behind | swish @20, swish @24 |
| 7 | 24-28 | 10.91-12.73 | **Photography.** "SHOOT CONFIDENTLY" | `shots/page_photography-hub-html_viewport.png` (Tornado hero + "Get my settings" bar) | 2 halves of shot 6 slide apart revealing it; push toward the settings bar | crop to the runway timeline, push-through | camera shutter @26, whoosh @28 |
| 8 | 28-32 | 12.73-14.55 | **The boarding pass.** "YOUR BOARDING PASS TO THE WHOLE SEASON" | `shots/page_find-your-airshow-html_viewport.png`, the May→October runway timeline with the show cards | horizontal pan along the timeline May→October (real cards pass by) | hard cut on 32 | whoosh @28, ticks on 29,30,31 |
| 9 | 32-36 | 14.55-16.36 | **Aircraft montage, one per beat.** Typhoon, Spitfire/Hurricane, Chinook, F-35 | `art/ac-typhoon-pull.jpg`, `art/ac-hurricane.jpg`, `art/ac-chinook.jpg`, `art/ac-f35.jpg` | one cut per beat, each photo with its own 6% push in the aircraft's direction of travel; "MAY → OCTOBER" type tracks across all four | last photo's smoke/sky dissolves into navy behind the logo | hit @32, 33, 34, 35 |
| 10 | 36-44 | 16.36-20.00 | **End card** (3.6 s). Logo, "Plan your 2027 airshow, stop by stop", red "Start planning →" button, **ukairshowguide.co.uk** | `art/ukag-header-logo.png`, `art/red-hawk.webp` | Hawk flies through once more and its trail draws the logo swoosh; logo springs in @36, line @38, button + URL @39; held still from beat 40 | holds to the end | impact @36, pop @38, pop @39, resolve @40 |

Formats:
- **9x16** (primary): headlines stack 2-3 lines in the top third, inside the safe area (clear of the
  Reels/TikTok caption zone at the bottom). Screenshot cards are cropped tall: calendar crops to the
  "Season at a glance" panel only, map crops to the UK outline, travel stacks the photo above the
  "Plan your journey" card, the boarding pass pans along a tighter strip. End card stacks logo / line /
  button / URL vertically.
- **1x1**: headlines 2 lines top-left, cards fill the lower 60%; calendar shows chart + the "46 shows
  confirmed" row; same order and timing.
- **16x9**: headline left third, screenshot card right two-thirds, so more of each real page shows;
  the boarding-pass pan shows the full May→October runway; end card is logo left, line + button right.

Longest gap without a new event: beats 0-2 and 36-38 (0.9 s). Something changes every 1-4 beats.
