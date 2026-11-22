# Round 2: every feature page built in the Duxford template, and nothing else

Jack, 22 Nov 2026: "Use the Duxford page as the template and only create each page in the Duxford template. Don't add
anything else. Each feature page must look like the Duxford page."

The first round kept each show's old page and put the new look on top, so the old sections and old layouts stayed in.
That is not what Jack wants. This round, the Duxford page is the template for structure as well as look.

## The template

- Live Duxford page: `camping-layout/duxford.html` on `main` (https://jskedge1.github.io/airshow-pages/camping-layout/duxford.html).
  It is built by `previews/duxford-new-design-src/build.py` from `previews/duxford-new-design-src/live-source.html`.
- Always start from `origin/main` (git fetch origin main). It has the go live and the Clacton parking blocks.

## What "look like the Duxford page" means (the acceptance test)

1. The same sections, in the same order, with the same section names in the bars and the tab strip:
   Overview, Getting there and parking, Photography, Aircraft line-up, Where to watch, Food and facilities,
   Pick your show, Plan your day, How the day runs, Where to stay, Flightline walk, Help on show days, Quick checker,
   What you'll see, Kids' corner, How it scores, How it compares, <Show>'s story, Experience flights, Make a postcard.
2. Inside every section, the same blocks in the same order with the same layout as Duxford (same markup and classes,
   so the same CSS applies): the same header, intro panel, boxes, cards, tabs, maps, planner, calculator, checklists,
   photo tabs, footer. Put Duxford's screenshot and yours side by side for every section at 1280 and 390 wide and
   fix every difference in layout.
3. Only the content changes: the show's own words, facts, dates, times, prices, places, photos, line-up, map points,
   train and bus topics, data blocks, all taken from that show's current page (`previews/<show>-new-design-src/live-source.html`).
   Never invent a fact, time or price. Never copy a Duxford fact into another show.
4. Nothing else. A section, block, banner or feature that the Duxford page does not have is left out, even if the old
   page had it (for example seafront information, the ground show, the old Where to watch board, extra banners).
   List every one you leave out in your summary, so Jack can ask for any back.
5. A Duxford block the show has no facts for: leave that block out and list it. Do not fill it with made up text.
6. Keep the transport items: the parking blocks (`#cpk`, and `#cdo` Compare driving options where the show has it) in
   Getting there exactly as they are on the show's current live page, and the train and bus topics.

## How to build it

Use whatever is cleanest, for example: copy Duxford's source folder, take Duxford's live-source.html as the page
skeleton, and swap in the show's content section by section (text, data blocks such as SW_SHOWS, FALLBACK, answers,
topics, STAY, TT, map points, photos). Keep it a build script with a `live-source.html` so it can be rebuilt.
Write the output to `previews/<show>-new-design.html` only. Do not write `camping-layout/` or push to main: the
parent session checks every page against Duxford and puts them live together.

## Checks before you finish

- Section ids and order identical to Duxford (`[...document.querySelectorAll('section.fold')].map(f=>f.id)`), except
  sections listed as left out for lack of facts.
- Side by side screenshots of every section with Duxford at 1280 and 390: same layout.
- 0 inline script syntax errors, no console errors except the file:// CORS ones Duxford also has, no sideways scroll
  at 390, no broken images, every interactive part works.
- Jack's rules (see NEW-DESIGN-ROLLOUT.md): no small capitals with wide spacing, no dashes in copy, sentence case
  labels, Jack's own photos only, no invented facts.

## Deliver

Commit and push to your own branch, republish your preview artifact, and finish with: the artifact link, the list of
things left out (old sections and Duxford blocks with no facts), and anything you were unsure of.

## Added 22 Nov 2026, 20:15: the three Getting there blocks on every page

Jack, in a comment on the Wales round 2 preview (Getting there): "add these to all pages", then "all of this".
Every feature page's Getting there gets all three, each filled with that show's own facts only (nothing copied
from Wales or Duxford, nothing invented):

1. Compare driving options (`#cdo`): each car park with its price bar. Already on Ayr, Blackpool, Clacton,
   Eastbourne, Midlands and Wales. Add it on the others from the show's own car park names and prices, where the
   show has more than one car park option with a price. Where the show's facts don't support it (parking free,
   included or one price), leave it out and list it.
2. The car parks board (`#cpk`) with the three boxes under it. On every show except Little Gransden (no parking
   details): keep it exactly as on the live page.
3. The dark train route header on the train topic (departure board, key details, your journey): Duxford's
   `trlStyle` and `trlScript`, filled per show from the show's own train data (a sample departure, arrival and
   operator). The Wales version is the template: `previews/wales-new-design-src/restructure.py` on
   `claude/wales-new-design` (search `trlScript-wales`); it swaps only the H data and the GO link. Where the show's
   page has no train times, show the stations and legs without times, as Cosford does, and list it.
