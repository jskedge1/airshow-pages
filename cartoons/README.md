# Cartoons (house style cartoon motion design)

Two 90 second explainers in the approved house style: the "How airshow security works" video on
`claude/amazing-davinci-lvpjwe` (`airshow-security-video/`, see `.claude/skills/cartoon-motion-design/SKILL.md` there).
That means square text boxes with ticked steps, the A/B/K cartoon family, real Red Arrows, Typhoon and A400M
cut-outs (no drawn jets), the cloud curtain jet wipe between steps and the logo end card.

| Film | Folder | Steps |
|------|--------|-------|
| Join the team (volunteering for the guide) | `volunteer/` | what you can send, why join, no pressure, send a message, a quick chat, pick your role, send your work in, it goes live, a few things I ask |
| By train to the Clacton Air Show | `transport/` | plan the trip, buy your ticket, train to London (Southern), follow the signs, Circle line (not the District), Liverpool Street, train to Clacton (Greater Anglia), walk to the show, going home |

Both are 16:9 (1920x1080) and 9:16 (1080x1920), 60 fps, 84 bpm soft lo-fi bed, no voice-over.

## The original design: `transport-original/`
The first version of the train film, kept alongside the house style one at your request: rounded cards in the
site's colours, each train company's colours (Southern green, Circle line yellow, Greater Anglia red), a route map
that draws itself, moving scenery with a station-by-station strip, a five step Tube change, the Clacton walk map
and an end card with a screenshot of the Train to Clacton page. 120 bpm, 90 s. Self-contained: `lib/toon.js` is
its drawing kit; edit `film.js` directly.

## Build
`film.js` in each folder is generated. Edit the parts in `_build/`, then run `python3 _build/build.py`:
- `_build/house.js`: the approved security video's film.js, used as is for the kit, intro, outro, wipe and 9:16 layout
- `_build/extras.js`: trains, platforms, station signs, clocks, speech bubbles, photo prints, Red Arrows pass
- `_build/volunteer.js`, `_build/transport.js`: each film's copy (STEPS), extra sound hits and its nine scenes

Render with the motion-reel skill from this folder: `render.mjs --film <film> --format 16x9|9x16 --video-only`,
then `sfx.mjs <film>` and `mix.mjs <film>`. The finished videos are in `out/<film>/`.

## Facts behind the train film
From the site's own data: `train-routes-src/eastbourne-cfg.json` (Southern, about 1 hr 25 min, every 30 minutes,
hourly on Sundays), `london-links.js` (Victoria to Liverpool Street on the Circle line), `clacton-cfg.json` and
`clacton-data.json` (Greater Anglia direct every hour at about 1 hr 26 min, the 10:18 from Liverpool Street, the
10 to 15 minute walk through the town centre to the seafront, then right for the West Greensward). The Clacton
times are the November 2026 timetable, so the film says to check the summer 2027 times.
