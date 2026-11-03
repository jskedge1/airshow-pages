# Brief: new guide pages for The Big Guide to UK Airshows (3 Nov 2026)

Build ONE new self-contained page in `/home/claude/airshow-pages/` (the file name you are given). Copy the design
and structure of `/home/claude/airshow-pages/first-airshow-on-the-day.html` exactly: same head (fonts, meta,
canonical to `https://www.ukairshowguide.co.uk/<wix-slug>`, description), same photo header with breadcrumb
(Home / Planning your first airshow / <page>), purple tag, big white capitals title with a teal highlight word,
red subheading, intro with one bold key sentence, three buttons, the glass Key Details box, the tab bar of jump
links, the Open all / Close all strip, collapsible navy section bars, numbered step cards, purple tip boxes,
the floating Sections button, back-tab.js and links.js script tags, the hidden scrollbar CSS and the
`mobile-fit` block before `</body>`. Read that file first and reuse its CSS and scripts; change the content.
Do not put a "Guide X of 9" tag on it; use a purple tag such as "Planning guide".

Photos: reuse photos already on GitHub that suit each section (look in first-airshow-img/, guide-img/,
security-img/, camping-hub-img/, find-img/, camping-layout/img/). Use full `https://jskedge1.github.io/airshow-pages/...`
addresses. Photos must not be clickable. No photo credits. No AI images.

Content rules: research facts with WebSearch and WebFetch where you state anything factual (rail operator rules,
bus pass times, Met Office warnings, show policies). Keep advice general across UK airshows unless naming a
show helps, and link to the show pages on `https://www.ukairshowguide.co.uk/` (slugs: riat, cosfordairshow,
duxfordairshows, shuttleworthairshows, little-gransden-air-and-car-show, eastbourneairshow, clactonairshow,
walesairshow, midlandsairfestival, blackpool-air-show, southport-air-show, international-ayr-show,
headcorn-air-show) and the guides (planning-your-first-airshow, first-airshow-what-to-pack,
first-airshow-on-the-day, first-airshow-getting-there, airshow-public-transport, airshow-security,
foodanddrinkatairshows, camping-at-airshows). Don't repeat whole topics other guides cover: mention in a
line and link.

Jack's writing rules: first person, warm, plain English with a little aviation language, short paragraphs,
"I would advise", "I would suggest", "when I last checked", "this might work for your family", "children love
to see". Vary sentence length a lot. No dashes of any kind in text or titles (full stops, commas or "to";
times "10:00 to 17:00"). Never say where information came from. Never use delve, tapestry, realm, harness,
pivotal, multifaceted, robust, showcase, seamless, elevate, unlock, "fall back", "climb aboard", "Our aim is
simple". No "it's not X, it's Y", no forced groups of three, no brochure tone, no tidy summary at the end.
Titles: Capital At The Start Of Each Word. No small grey capital labels. Children's ears: "Your child's ears
are delicate, so try to protect them as much as possible". Weather: "Unfortunately the weather on the day
will be what it will be, so plan accordingly. If it's fresh, dress in layers to keep warm".

Check your page renders without errors at 1300px, 390px and 320px wide using Playwright
(`require('playwright')`, chromium.launch()) with no sideways scrolling. Edit only your own file. Don't
commit. Report: the file, its sections, the Wix slug you used in the canonical, and anything unconfirmed.
