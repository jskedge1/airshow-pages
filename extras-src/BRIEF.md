# Brief: missing sections and Good to know facts for the feature show pages (3 Nov 2026)

You are helping Jack Skedge, founder of The Big Guide to UK Airshows (ukairshowguide.co.uk). Every featured show
page should offer the same kinds of sections where they suit that show. Your job, for the show(s) you are given:

1. Research the official sources for the show (official website, its FAQ, accessibility, visitor information
   and terms pages, the organiser's council or company pages). Use WebSearch and WebFetch. Prefer 2027 details;
   if 2027 isn't published, use the 2026 details and say "in 2026" in the text.
2. Read the existing page `/home/claude/airshow-pages/camping-layout/<show>.html` (large file: extract its text
   with python and BeautifulSoup, skipping script and style) so you reuse what it already says, never contradict
   it, and don't repeat whole topics already covered. Where another section covers something well, mention it
   in a line and point to it with an inline jump link (see vocabulary below).
3. Write ONE file: `/home/claude/airshow-pages/extras-src/<show>.json` in the format below. Do not edit any other
   file. Do not commit or push.

## The JSON file

```json
{
  "show": "clacton",
  "lastChecked": "3 November 2026",
  "gtk": [ { "title": "Pushchairs and buggies", "ans": "Welcome", "state": "yes", "text": "..." } ],
  "sections": {
    "days":    { "tab": "Pick your day", "html": "..." },
    "ground":  { "tab": "The ground show", "html": "..." },
    "flights": { "tab": "Experience flights", "html": "..." },
    "support": { "tab": "Keep the show free", "html": "..." }
  },
  "skipped": { "flights": "why it was left out" },
  "notes": "anything Jack should know, e.g. something on the current page that looks out of date, with the official link"
}
```

### gtk: the Good to know grid (exactly 12 tiles, in this order, these titles)

1. Pushchairs and buggies
2. Dogs
3. Your own food and drink (include whether alcohol can be brought in)
4. Gazebos, windbreaks and chairs
5. Water refill points
6. Changing Places toilet
7. Carers' tickets
8. Hearing support (hearing loops, BSL, deaf visitors)
9. Quiet area (a calm or sensory space)
10. Re-entry (can you leave and come back)
11. First aid and lost children
12. If it rains

`ans` is 1 to 4 words (e.g. "Welcome", "Not allowed", "Free carer ticket", "Not confirmed yet").
`state`: `yes` (allowed or available), `no` (not allowed or not available), `check` (not confirmed, or depends).
`text`: one or two short sentences in Jack's voice with the practical detail. If the official sources don't say,
use ans "Not confirmed yet", state "check", and say what you would do (e.g. "I would ask the show before you go").
Never guess a fact. For seafront shows, re-entry is usually simply "Free to come and go" because it's a public
seafront, and that is fine to say when the show is unfenced.

### sections: only the ones your assignment lists, and only if they genuinely suit the show

Each `html` is the inside of the section: start with the panel head, then the content. Don't include the
`<section>` tag or the outer `<div class="wrap">`; the build adds those.

- **days, "Pick your day"** (multi day shows): help a visitor choose which day to go, with a small picker
  (vocabulary below), a row of day boxes with what happens on each day, and a Jack's tip. Duxford and
  Shuttleworth run several separate shows a season, so theirs is **"Pick your show"**: help choose which of the
  2027 events suits you (tab "Pick your show", h2 "Pick Your <span class=\"sky\">Show</span>").
- **ground, "The ground show"**: what there is to do on the ground before and between the flying: static
  aircraft, the RAF Village or military villages where they attend, trader stalls, arena or stage acts, funfair,
  simulators, careers stands. Mention that some aircraft are opened up so you can take a look inside, and that
  you can buy exclusive merch in or outside the aircraft (when the show has static aircraft). Advise doing the
  ground show early or while saving your pitch is covered (see arrival advice below).
- **flights, "Experience flights"**: only if pleasure, helicopter, warbird or balloon flights are actually
  offered at or from the show site (on show days or on other days). Otherwise leave it out and say why in
  `skipped`. Never list a company you can't confirm.
- **support, "Keep the show free"**: only for free shows that actively ask for donations, programme sales,
  bucket collections, volunteers or sponsors. Otherwise leave it out and say why in `skipped`.

## HTML vocabulary (these styles already exist on every show page; use only these)

Panel head (always first):
```html
<div class="panel-head reveal"><div><h2>Pick Your <span class="sky">Day</span></h2></div><p>Intro paragraph, 2 to 4 sentences, Jack's voice.</p></div>
```
Facts row (up to 4 boxes; `pu` makes one purple):
```html
<div class="fl-facts"><div><span>Cost</span><b>Included in entry</b></div><div class="pu"><span>When</span><b>From 10:00</b></div></div>
```
Sub heading: `<h3 class="fl-h">Things To See</h3>` (Capital At The Start Of Each Word)
Numbered steps:
```html
<ol class="fl-steps"><li><div><b>Save your pitch first</b><span>One or two sentences.</span></div></li></ol>
```
Day boxes (up to 4 per row; `pu` purple):
```html
<div class="wk-days"><div><b>Saturday</b><span>What happens, times.</span></div><div class="pu"><b>Sunday</b><span>...</span></div></div>
```
Picker for Pick your day. Every question group needs `data-sx-q`; each answer button carries scores for the days
(`data-sx-score="sat:2 sun:1"`); one answer per group has `class="on"`. Write one result card per day key; the
best scoring card shows. Keys must match the `data-sx-day` values.
```html
<div class="wk-tool sx-pick">
  <div class="wk-q">
    <p class="pp-l">Who&rsquo;s coming?</p>
    <div class="pp-opts" data-sx-q="who">
      <button type="button" class="on" data-sx-score="sat:2">Young children</button>
      <button type="button" data-sx-score="sun:2">Just adults</button>
    </div>
  </div>
  <div class="wk-out" aria-live="polite">
    <div class="wk-day sx-res" data-sx-day="sat"><h4>I Would Pick The Saturday</h4><ol><li><span>Why</span>...</li><li><span>Good to know</span>...</li><li class="ev"><span>Getting there</span>...</li></ol></div>
    <div class="wk-day sx-res" data-sx-day="sun" hidden><h4>I Would Pick The Sunday</h4><ol>...</ol></div>
  </div>
</div>
```
Cards with an optional filter (use a unique grid id, e.g. `groundGrid`, `supportGrid`):
```html
<div class="pp-opts" data-sx-filter="groundGrid"><button type="button" class="on" data-v="all">Show me everything</button><button type="button" data-v="kids">For the kids</button></div>
<div class="sp-grid" id="groundGrid">
  <article class="sp-card" data-t="kids"><span class="sp-price">Free</span><h4>Title In Capitals At Each Word</h4><p>One to three sentences.</p></article>
</div>
```
Experience flight cards (copy this pattern; chips filter by data-tags):
```html
<div class="xf-pick"><p class="xf-q">What are you looking for?</p>
  <div class="xf-chips" role="group" aria-label="Filter the flights"><button type="button" class="on" data-xf="all" aria-pressed="true">Show me everything</button><button type="button" data-xf="family" aria-pressed="false">A flight with the kids</button></div>
  <p class="xf-count" id="xfCount" aria-live="polite"></p></div>
<div class="xf-grid">
  <article class="xf-card" data-tags="family"><header><span class="xf-op">Company name</span><h3>Aircraft or flight</h3></header><p>...</p><dl><div><dt>Price</dt><dd>From £99 (2026)</dd></div><div><dt>Age</dt><dd>...</dd></div></dl></article>
</div>
<p class="xf-empty" id="xfEmpty" hidden>Nothing matches that just now, so you could try another option.</p>
```
Glass box (a dark box with label and value rows; `hl` makes one row red):
```html
<aside class="sf-glass"><h4>Good To Know</h4><div class="sf-rows"><div><span>Entry</span><b>Free</b></div><div class="hl"><span>Collections</span><b>Both days</b></div></div></aside>
```
Jack's tip: `<div class="ns-note"><b>Jack&rsquo;s tip</b>Text.</div>`
Official links (fine to include; these are the only place to name a website):
```html
<div class="sp-links"><a href="https://..." target="_blank" rel="noopener"><b>Official site</b><span>What they'll find there</span></a></div>
```
Small print at the end: `<p class="note sf-src">Times and prices may change for 2027.</p>`
Jump to another section of the same page: `<button type="button" class="inlink" data-goto="facilities">food and facilities</button>`
(section ids: overview, right, lineup, travel, stay, timeline, help, watch, photo, kids, facilities, plus seafront on seafront shows).
Use `&rsquo;` for apostrophes and `&pound;` for pounds inside html strings, or plain characters; the file must be valid JSON.

## Jack's writing rules (follow all of them)

- First person, warm and personal advice, as Jack: "I would advise", "I would suggest", "this may work for you",
  "when I last checked", "I see others do this", "children love to see". Plain English with a little aviation language.
  Short paragraphs. A slight edge of opinion is good. Vary sentence length a lot.
- No dashes of any kind in text or titles (no en dash, em dash or spaced hyphen). Use full stops, commas or "to".
  Times are written "10:00 to 17:00".
- Never say where information came from in the text ("from the council", "according to the official site").
- Never use: delve, tapestry, realm, harness, pivotal, multifaceted, robust, showcase, seamless, elevate, unlock,
  game changer, at the end of the day, perfect storm, tip of the iceberg, "fall back", "Our aim is simple",
  "climb aboard", "what nobody talks about", "what most people miss". No "it's not X, it's Y" sentences, no forced
  groups of three, no brochure tone, no tidy three point summary at the end.
- Titles and h4 headings: Capital At The Start Of Each Word. No small grey capital labels.
- Arrival advice where it fits: if you want a front row seat, head there first and save your pitch, then look round
  the static show, speak to the pilots, visit the trade stalls and check the food; visit the toilet before the
  flying starts; if you aren't waiting for a particular display, use it as a toilet break.
- Children's ears: "Your child's ears are delicate, so try to protect them as much as possible" when ear
  defenders come up.
- Weather: "Unfortunately the weather on the day will be what it will be, so plan accordingly. If it's fresh,
  dress in layers to keep warm" (use this in the "If it rains" tile).
- IWM Duxford: the Land Warfare hall no longer exists; never mention it or its tanks.
- UK spelling. Be accurate: every fact must come from a source you read today. If unsure, leave it out.

When you finish, reply with a short summary: which sections you wrote, which you skipped and why, and anything
on the current page you think is out of date (with the official link).
