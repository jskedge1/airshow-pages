# Site audit, 27 Nov 2026

A full look through the live pages of The Big Guide to UK Airshows for missing information, broken IDs,
messy content and pages that drift off the site's message. Nothing has been changed yet; this is the list to work from.

How it was checked: an automated scan of 170 pages (links, IDs, images, titles, placeholder text), then four
read-throughs: show pages, planning guides, community and business pages, and a check of the scan's results.
Each finding below was checked against the page itself.

**Good news first:** no missing images, no broken links between files, every page has a title, the policies are
all filled in, and almost all of the "missing ID" warnings are fine (the IDs are made by the page's scripts when it loads).

---

## A. Fix now (clear mistakes, no decision needed)

### Planning guides
- [x] **Planning hub is out of date.** `visitor-planning-guides.html` says "13 guides" and doesn't link the 7 guides added on 3 Nov
      (Night Before, Getting Home, Rainy Day Plan, Calm Visit, Spotter Cards, Aircraft A to Z, Airshows On A Budget).
      It also says getting home is "covered inside the getting there and public transport guides", but Getting Home is its own guide now.
- [ ] **Footer site map** (`footer.html`) is missing the same 7 guides.
- [x] **Site search** can't find 12 guides: add them to `PAGES` in `tools-search.py`, then run it.
- [x] **What you can bring contradicts itself.** `airshow-security` says glass and BBQs are "check first"; what-to-pack, safety and food-and-drink say banned.
      Safety lists drones under "depends on the show" *and* "banned at every show". Make `airshow-security` the one page for gate rules; the others give one line and a link.
- [x] **Kit calculator** intro says "Two lists" but there are four.
- [x] **Food and drink** says "a lesson I learnt the hard way this year".
- [x] **Dead ends:** photography hub, camping hub, camera guides and Show Day don't link on to the planning guides.

### Show pages (edit `previews/<show>-new-design-src/live-source.html`, then run that folder's `build.py`)
- [x] **All 12 show pages:** "Where a time or price says 2026, it's from last year's show". It's still 2026, so this should say "from the 2026 show".
- [x] **All 12 show pages:** "How it compares" footnote says "this year's dates", which should say "2027 dates". The same footnote is worded differently from page to page.
- [ ] **11 show pages:** the traders block is in the source twice, and there are two different stats-panel style blocks (the red one never shows). Delete the second traders pair and the unused red block.
- [ ] **All 12 show pages** carry a hidden copy of Cosford's "Is RAF Cosford right for you?" text (on Duxford it says "Cosford station has no step free access"). Visitors can't see it, but it's another show's text inside every page. Strip it out.
- [ ] **Clacton** key details still list "Twilight: Thursday evening" and **Wales** lists "Evening: Afterburn, Saturday", although both pages later say 2027 isn't confirmed.
- [ ] **Southport:** "(Sunday times will be confirmed closer to the show)" is left over from 2026; "TBC" is used where other pages say "to be confirmed"; the £13 price has no "(2026)" tag.
- [ ] **Midlands** notice says the line-up isn't out, but the page now lists confirmed 2027 aircraft.
- [ ] **Blackpool and Southport:** the tab says "Pick Your Show" but the section heading says "Pick Your Day".
- [ ] **Page titles:** Duxford, Headcorn and Shuttleworth don't end "| The Big Guide to UK Airshows" like the others.

### RIAT pages
- [ ] RIAT home says "Four Parts, One Guide" but has five tabs.
- [ ] The Camping card lists "Sample campsite page", which is the fake example listing made for campsite owners, not visitors.
- [ ] The aircraft page's "The static park" card repeats a sentence word for word.

### Community and business pages
- [ ] **Number of shows:** most pages say 13. `landing.html` shows 14 tiles (an "English Riviera Airshow" tile with no guide behind it);
      `advertise-with-us.html` says "Show guides 12" and leaves Headcorn out of its list and checkboxes; the My Airshow Hub launcher says "SHOWS 12".
- [ ] **Advertise page promises features that aren't built yet** (show-day updates from the stall, messages and payments in the Trader Hub). The Trader Hub itself says these arrive in 2027. Label them "coming in 2027".
- [ ] **Trader terms contradict the sales copy.** Advertise says "pay once a season, nothing to cancel"; the policies talk about plans that renew, plus a "supporter membership" that isn't offered anywhere. VAT wording differs too.
- [ ] **Forum look names:** "Clean / HUD" on one page, "Normal / HUD" on the others. Pick one.
- [ ] **Footer show names** don't match the rest of the site (e.g. "Shuttleworth Collection", "Little Gransden Air Show", "Eastbourne Air Show").
- [ ] **Admin board** uses "UK Airshow Guide"; every public page says "The Big Guide to UK Airshows".
- [ ] **Trader admin example data** uses realistic names and .co.uk emails. Switch them to example.com so they can't match a real business.

---

## B. Needs an answer from you (answered 27 Nov 2026, all done)

Answers: Wales 24 and 25 July 2027 confirmed; Cosford 13 June not confirmed and the show is now the Royal Air Force Air Show;
Duxford Americans Flying Day Fri 30 July confirmed and Flying Day tickets on sale; Southport off the free list (ticketed);
Headcorn added to the news page and comparison table; Instagram is @ukairshowguide; Dark Cam taken off the site.
**Still to do in Wix:** make the same Wales, Southport and Cosford changes in the "Featured Air Shows" CMS collection
(Find your Air Show reads it first); raise any fixed-height boxes on the planning guides (each is 160 to 300 px taller with the new previous/next bar).

Original questions:

1. **Wales 2027:** the show page and a news story say Sat 24 and Sun 25 July 2027 is confirmed. The calendar still has it as "still to announce", the news page says "2027 date TBC" and Find your Air Show has no date. Is 24 and 25 July right?
2. **Cosford 2027:** the Cosford page says "Sunday 13 June 2027, to be confirmed" and that tickets aren't on sale. The calendar and Find your Air Show show 13 June as confirmed (under the new name "Royal Air Force Air Show"). Which is right, and should the Cosford page use the new name?
3. **Duxford:** the page says The Americans Flying Day is Fri 30 July, but the calendar says it's still to announce. The calendar also says Flying Day tickets went on sale on 12 October, while the page says they "launch in 2027". Which is true?
4. **Southport:** its own page and the budget guide say £13 (under 16s free). The which-show guide and Find your Air Show say it's free, which makes the "Free Seaside Shows: 6" count wrong. Confirm it's ticketed.
5. **Headcorn** is missing from the news page (it says 12 shows) and from the "Featured shows compared" table. Add it?
6. **Instagram:** the footer links to `instagram.com/ukairshowguide`, but other pages give `@theukairshowguide`. Which handle is yours?
7. **Dark Cam (`dark-camera/`):** has no airshow content, isn't linked from anywhere, and a camera with a black screen can read as a hidden-photo tool. That clashes with the site's own "ask first before photographing people, especially children". Keep it, move it off the site, or rebrand it?

---

## C. Judgement calls (keeping the site on message and tidy)

**Off-topic or too much for the page**
- The photography hub's "Camera and equipment" guide is about 5,700 words, with gimbal models and prices for YouTube and TikTok filming, and repeats the kit calculator's price lists. It's a lot for a page pitched at beginners. Cut it to the essentials.
- [x] **Done:** moved to backups/old-photography-pages-2026-11-27/. Old photography pages were still online, with nothing linking to them: `airshow-photography-hub.html` (old hub), `new-to-aviation-photography.html`, `photography-equipment.html`, `nikon-d500.html`. Move them to `backups/`.
- RIAT home "Where it all started" is about the website's own history rather than visiting RIAT. Shorten it or move it to the bottom.
- My Airshow Hub's cockpit wording ("PILOT LOGIN AIRCREW ID", "EJECT Log Out", "AWAITING INPUT", "ENGAGE →") could confuse a family on their first visit. Keep the look and use plain words for the buttons.
- Themed extras like the home page's "Pre Flight Checks" splash, the lone "27" footer badge and the YouTube "Departures Board" add clutter.

**Repetition**
- "Your child's ears are delicate…" and the "weather will be what it will be" line each appear twice on nine pages and four times on the hub. Use each once per page, where it fits.
- Duxford repeats the dogs rule 5 times and the programme price 4 times.
- Getting home, weather, "checks before you travel" and cost calculators are each covered on several pages with slightly different advice. Give each topic one main page; the rest link to it.

**Organisation**
- [x] **Done 27 Nov 2026** (see README "Planning guides reading order"). The guides used three different reading orders ("Stop 07 of 13", a 4-stop "start here" page and the README order), and some guides have no previous or next links. Suggested single path:
  1. **Start here:** Planning your first airshow
  2. **Plan:** which show → calendar → budget → where to stay → getting there → what to pack → night before
  3. **On the day:** security → where to watch → on the day → safety → food → getting home
  4. **Extras:** weather and rainy day, calm visit, spotter cards, A to Z, photography hub, camping hub, Q&A

  Every guide gets the same previous/next bar and a link back to the hub.
- Two home pages (`home.html` and `landing.html`) have different headlines. Pick one front door.
- The site switches between "I" and "we". Pick one voice.
- Headings mix sentence case, Title Case and ALL CAPS ("MY VIEW", "Our View"). Pick one style.
- Some RIAT tips still describe RAF Fairford (1.5 m shelter limit, FRIAT enclosure, Wellness Room). Mark them "at Fairford" until the Boscombe Down plans are out.
- Show line-ups: some pages show the 2026 line-up "for reference", others say "No aircraft announced yet". Use one approach on every page.
