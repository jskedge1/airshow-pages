# Brief: fix the out of date facts on the show pages (3 Nov 2026)

Earlier today each show was researched against its official sources. The findings are in the `notes` field of
`/home/claude/airshow-pages/extras-src/<show>.json`. Your job is to correct the show page
`/home/claude/airshow-pages/camping-layout/<show>.html` so it matches the official information.

How to work:
1. Read the show's `notes`. For each point, open the official link given (WebFetch) to confirm it is still true today.
   If a source can't be reached, use the note as written. Never invent a fact.
2. Find every place on the page that says the out of date thing (the page is large; search it with python or grep,
   and remember text can sit inside HTML and inside JavaScript strings such as quick answer lists).
3. Edit the page in place with small, targeted edits. Change the wording, a time, a price or a list item.
   Add a short line where something is missing (for example lost children wristbands in Help on show days).
   Remove or reword advice that is now wrong (for example suggesting the beach when it is closed).
4. Do NOT touch anything between `<!-- sx-gtk -->` and `<!-- /sx-gtk -->`, between `<!-- sx-checked -->` and
   `<!-- /sx-checked -->`, between `<!-- sx-js -->` and `<!-- /sx-js -->`, or inside any `<section ... data-sx="1">`
   or `data-sx-postcard` section. Those are built from `extras-src/<show>.json`. If one of those needs the same
   fix, edit the matching text in `extras-src/<show>.json` instead (keep it valid JSON), and say so in your report.
5. Keep the HTML valid and the layout unchanged. Don't rename sections, ids or classes. Don't remove bus route
   buttons or the bus display tabs.
6. When you finish, check the file still has the same number of `<section class="panel` blocks as before and that
   `python3 -c "import html.parser,sys; html.parser.HTMLParser().feed(open(sys.argv[1]).read())" <file>` runs.
   Do not commit or push. Edit only your own show files.
7. Decisions to leave for Jack (don't change, just report): renaming a show before its official site uses the new
   name; anything where official sources contradict each other and neither is clearly newer.

Writing rules (Jack's): first person, warm and plain, short paragraphs, "I would advise", "I would suggest",
"when I last checked". No dashes of any kind in text or titles (use full stops, commas or "to"; times as
"10:00 to 17:00"). Never say where information came from ("from the council", "according to"). Never use delve,
tapestry, realm, harness, pivotal, multifaceted, robust, showcase, "fall back", "climb aboard". No "it's not X,
it's Y". UK spelling. Titles with a Capital At The Start Of Each Word. Never mention IWM Duxford's Land Warfare hall.

Report back briefly: each fix you made (where and what), anything you left for Jack and why.
