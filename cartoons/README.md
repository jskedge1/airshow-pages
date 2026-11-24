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

## Train trip films in the original design: `_rail/`
Clacton (`transport-original/`), Cosford, Duxford, Blackpool and Wales. Rounded cards in the site's colours were made
square, the drawn jets were swapped for the real Red Arrows, Typhoon and A400M cut-outs, and the end card is the logo,
a sign-off line and the web address. Each film is one route file in `_rail/routes/<film>.js` (map points in
longitude and latitude, the legs with each train company's colours, the change steps, the walk map and the tips);
`python3 _rail/build.py [film]` writes `<film>/film.js` from `head.part.js` + the route + `ride.part.js` + `body.part.js`.
120 bpm, 90 s, 16:9 and 9:16.

| Film | From | Change | Get off | Then |
|------|------|--------|---------|------|
| `transport-original` | Eastbourne (Southern) | Circle line, Victoria to Liverpool Street | Clacton-on-Sea (Greater Anglia) | Walk to the West Greensward, 10 to 15 min |
| `cosford` | London Euston (Avanti) | Birmingham New Street, onto the hourly West Midlands Railway train | Cosford | Walk about 300 m |
| `duxford` | London Kings Cross (Great Northern, about 50 min) | none | Cambridge | Free Air Show shuttle, Station Place stand 5, about 30 min |
| `blackpool` | London Euston (Avanti) | Preston, about 20 min, onto Northern | Blackpool North | Walk down Talbot Road and the promenade to the Tower, about 15 min |
| `wales` | London Paddington (GWR, direct, about 2 hr 45) | none | Swansea | Walk through the city centre to the seafront, 20 to 25 min |

Times come from the stand in timetables in `train-routes-src/` (November 2026), so each film says to check the
summer 2027 times. The Duxford end card points at /duxfordairshows because /train-to-duxford isn't live yet.

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

## The airshow train map: `train-map/`
One film in the `_rail` design that shows the whole rail picture on a moving map of Great Britain (the `GB` outline now
includes Scotland). About 2 min 55, 120 bpm, 16:9 and 9:16.

| Part | What it shows |
|------|---------------|
| 1 The network | The eleven London stations, then the main lines out of each one in the train company's colour |
| 2 A worked example | Eastbourne to London Victoria (Southern), the Tube links from Victoria, then Liverpool Street to Clacton-on-Sea |
| 3 Every show | 15 shows: the line from London, the change, the station, and the last leg (walk, shuttle, bus or taxi) with a real aircraft cut-out |
| 4 Skip London | CrossCountry north to south, the west side, east to west, and Wales and the West |
| End card | The logo and ukairshowguide.co.uk/airshow-public-transport |

Sources: `_rail/map/gen-data.mjs` reads `journey-planner.js` (STA, LINES, SHOWS) and `london-links.js` and writes
`_rail/map/data.gen.js`. `_rail/map/film.part.js` holds the scenes; every leg is named by operator and line, and the build
stops if a station is not on the line named, so nothing on the map is invented. The last legs and times come from
`SHOWS` and the `train-routes-src/<show>-cfg.json` facts (November 2026 timetables, so the film says to check the
summer 2027 times).

Two shows are not in the site data yet, so their facts come from the organisers (checked 24 Nov 2026):
- Stow Maries Air Show, Sunday 15 August 2027 (stowmaries.org.uk/event-bookings). South Woodham Ferrers station, then a
  taxi, "10 minutes (3.5 miles)" (stowmaries.org.uk/directions-rail). Both stations are in `journey-planner.js`.
- English Riviera Airshow, Paignton, 4 to 6 June 2027 (englishriviera.co.uk). Paignton station, about a six minute walk
  (GWR and Torbay Council 2026 guidance). Paignton is not in `journey-planner.js`, so its position is set by hand in
  `EXTRA_STA` and the Newton Abbot to Paignton branch is drawn as a straight GWR line.

Build and render (the motion-reel skill was not installed in that session, so `_tools/` holds small stand-ins):
```
node _rail/map/gen-data.mjs            # only after journey-planner.js or london-links.js change
python3 _rail/build_map.py             # writes train-map/film.js and copies lib, fonts and assets
python3 _tools/beats.py train-map 120 175.5
NODE_PATH=$(npm root -g) node _tools/shots.mjs train-map 9x16 every:3.5 --sheet 5    # contact sheets
NODE_PATH=$(npm root -g) node _tools/render.mjs --film train-map --format 16x9       # and 9x16
python3 _tools/audio.py train-map --mux                                              # music, sound effects, final MP4s
```
The finished videos are `out/train-map/train-map-16x9.mp4` and `out/train-map/train-map-9x16.mp4`.

## Music: cinematic score
Every film uses a cinematic airshow score (24 Nov 2026, replacing the lo-fi and house beds): strings that swell,
a driving string ostinato, low brass, timpani that build, soft cymbal swells into each section and a big
resolve under the end card. `_build/cinematic.py` writes it on the film's existing beat grid, so the
picture and its sound effects don't move: run it, then `mix.mjs <film>` (no re-render needed).
  MOTION_REEL_SKILL=<skill> uv run _build/cinematic.py <film> --tonic D --end <end card beat> --sections <beats> [--soft]
House style films: --end 116 --sections 8,20,32,44,56,68,80,92,104. Calm visit uses --soft. Train films: the
scene start beats from their route file, --end = the end scene's beat.
