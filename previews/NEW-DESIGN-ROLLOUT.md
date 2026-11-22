# Rolling the new Duxford design out to every feature page

Jack (owner of The Big Guide to UK Airshows, ukairshowguide.co.uk) signed off the layout of the Duxford page in the
new design on 22 Nov 2026 and wants **this exact layout on every feature page**, kept clean, in the new template.
One session builds one show. This file is the brief for each of those sessions.

## The template

- Duxford source: `previews/duxford-new-design-src/` (`build.py`, `chrome.html`, `new-design.css`, `new-design.js`, `img/`).
- Duxford output: `previews/duxford-new-design.html` (built, never edited by hand).
- Live preview Jack reviewed: https://claude.ai/artifact/XyqEcKSmgMCWer4SRBnhRv
- The build reads the live page `camping-layout/<show>.html`, keeps every section, script and data block, and adds the
  new chrome, CSS and JS on top. Read `build.py` top to bottom before starting: it explains each step.

## What to do for your show

1. Copy `previews/duxford-new-design-src/` to `previews/<show>-new-design-src/`.
2. In your copy of `build.py`: point `SRC` at `camping-layout/<show>.html`, `OUT` at `previews/<show>-new-design.html`,
   and `NZ_PATH` at `/airshow-pages/camping-layout/<show>.html`.
3. Remove the Duxford only text fixes in `build.py` (the overview wording, the Duxford's story corrections, spot 8 on
   the Duxford photographers' map, the Duxford photo swaps). Keep the generic parts. If a replacement's text is not in
   your page, it must not run (the asserts will tell you).
4. In `chrome.html` and `new-design.js`, swap the Duxford specific words (IWM Duxford, Duxford Air Shows, the about
   heading, the stat text, photo keys such as `p40`, `buchon_pan`, `formation`, `spitfire`, `wildcat_front`) for your
   show's own words and the photo keys your page has (`grep -o 'data-pic="[a-z_0-9]*"' camping-layout/<show>.html | sort -u`).
   Use only the page's own facts. Never invent facts, times or prices.
5. The section order Jack chose (in `new-design.js`, `var FIRST=[...]`): Overview, Getting there and parking,
   Photography, Aircraft line-up, Where to watch, Food and facilities, Pick your show, Plan your day, How the day runs,
   Where to stay, Flightline walk, Help on show days, Quick checker, What you'll see, Kids' corner, How it scores,
   How it compares, Your show's story, Experience flights, Make a postcard. Use the section ids your page has
   (`grep -o 'id="f-[a-z]*"'`, or the folds built at run time); skip any it does not have, keep any extras after.
6. Build, check, fix until it looks like the Duxford preview section by section.
7. Publish as a NEW private artifact titled "<Show name>, new design preview" (`publish_files` with the built HTML as
   `index.html`). Commit and push to your own branch. Add a short note to `README.md` under the Duxford note.

## Fixes added after the first pages (22 Nov 2026, all twelve built pages have them)

- Quick checker on phones: the template hides the step number, which left each question squeezed into the 44px number
  column at 390 wide. `build.py` (FRAME_CHECK) now carries the fix under the `.qs li .sn` line: the question spans the box,
  and the number's connector line goes. It is in the Duxford source, so a fresh copy already has it.
- Key places: some live pages put a show name tag beside the "Key places" heading in Getting there. Duxford has none, so
  add this to your `new-design.css` if your page has one:
  `html.nz body main:not(#nz0):not(#nz1) #travel .xd-kp-h > span + span{display:none!important}`
- Check the quick checker at 390 wide: each question should fill its box, not sit in a thin column.

## Checks before you publish (all of them)

- `python3 build.py` runs with no assert errors.
- Every inline script parses (0 syntax errors), and every text chunk of the live page is present in the new page.
- Playwright: open every section at 1280 and at 390 wide. No console errors except file:// CORS ones the live page
  also has, no sideways scroll at 390, interactive parts work (line-up, topic explorer, planner, sun guide, calculator,
  checklists, map spots).
- Compare each section with the Duxford preview at 1280 and fix anything that does not match.

## Jack's rules (every page)

- Never small text in capitals with wide letter spacing ("kicker" look). Labels in sentence case.
- No dashes in paragraphs or titles (use full stops, commas or "to"). No numbered labels like "01 / Overview".
- No short coloured accent lines under headings.
- Buttons: square, no rounded corners, no coloured dots, plain light grey, navy when picked, smooth hover.
- Short fact lists as boxes: light background with a coloured top edge.
- "Clean photo tab": Jack's photo filling a tall card, navy fade, white title, one line, teal "Read more →".
  Use these wherever a tab or link goes to another section or page, where it suits.
- Animation and hover effects, switched off for reduced motion.
- Photos: Jack's own only, never clickable, never a credit with his name, never cropped where he asked for the whole photo.
- Plain English in Jack's voice ("I would advise", "I would suggest").
- Pages show inside Wix: image addresses full `https://jskedge1.github.io/airshow-pages/...` or embedded, links to
  site pages `target="_top"` with `https://www.ukairshowguide.co.uk/...`.

## Do not

- Do not edit `camping-layout/*.html`, root show pages, or anything under `previews/duxford-new-design*`.
- Do not push to main. Do not open a pull request.
- Do not publish to a shared or public artifact; it starts private and Jack shares it himself.
