# Email to campsite owners: RIAT camping listing

Copy everything between the lines into a new email. Send it from contactus@ukairshowguide.co.uk.
Each numbered question matches a part of the campsite page, so the reply can go straight into
`riat-camping-src/new-site.json` (the field name is in brackets after each heading in the table at the end).

---

**Subject:** Add your campsite to the RIAT camping pages, Air Tattoo 2027 at Boscombe Down

Hello,

I'm Jack Skedge, founder and managing editor of The Big Guide to UK Airshows (ukairshowguide.co.uk).

From 2027 the Royal International Air Tattoo is moving to MOD Boscombe Down, and a lot of visitors will be looking for somewhere to pitch up nearby. I'm building a set of RIAT camping pages on the guide, and I would like to add your site to them. If you are opening a campsite for the show, or you already run one in the area, I would love to hear from you. If you are still running a campsite around Fairford, I want to work with you too.

**What you get, free of charge:**

- Your own page on the RIAT camping pages, with your pitches, prices, facilities and photos
- A pin on the show map, showing your distance to the showground and how visitors get in
- A tab on the RIAT camping home page, seen by families, photographers and first timers planning their trip
- A share on our socials, to over 12,000 airshow followers

You can see what a listing looks like here (it is a sample, not a real campsite):
https://jskedge1.github.io/airshow-pages/riat-camping/sample.html

Visitors book directly with you. The guide doesn't take bookings or payments, and I will send you your page to check before it goes live.

To build your page, I just need the details below. Reply under each question, and skip anything that doesn't apply or that you haven't decided yet. I can always add it later.

**1. About your site**
- Campsite name:
- Which is closest: Boscombe Down or Fairford?
- What kind of site is it? (new field for show week, caravan park, farm site, glamping, campervans and tourers)
- One line that sums up your site:
- A few sentences in your own words: what it's like, how long you have been running, and why it's a good base for the Air Tattoo:
- Your name and role, and a short quote from you if you'd like one on the page:

**2. Where you are**
- Full address and postcode:
- what3words for the entrance (if you have it):
- Is the entrance hard to find? Any directions visitors need:

**3. Dates and stays**
- Which dates are you open for show week? (the show is Friday 16 to Sunday 18 July 2027, with arrivals earlier in the week)
- Minimum stay:
- Check in time:
- Check out time:
- Can visitors arrive late, and until what time?

**4. Pitches and prices**
For each type of pitch, please tell me the size, the price (per night or per stay), what's included (people, cars, electric) and how many you have:
- Tent pitches:
- Campervan pitches:
- Caravans and tourers:
- Electric hook up (and amps):
- Hardstanding:
- Glamping (bell tents, pods, ready pitched tents) and what's inside:
- Any extras that cost more (extra people, extra cars, dogs, showers):

**5. Facilities**
Just put yes, no or a short note next to each one:
- Flush toilets:
- Portable toilets:
- Hot showers (free or paid, and opening hours):
- Accessible toilet:
- Accessible shower:
- Washing up area:
- Drinking water taps:
- Phone charging:
- Wi-Fi:
- Chemical toilet disposal:
- Grey water disposal:
- Ice pack freezing:
- Food vans or breakfast:
- Shop or essentials:
- Bar:
- Car parked next to the tent:
- Lighting at night:
- Overnight security or staff on site:
- Barbecues allowed:
- Campfires allowed:
- Generators allowed:
- Anything else visitors should know about:

**6. Getting to the show**
- About how long is the drive to the showground?
- Is there a safe walking route? How long does it take?
- Will you run a shuttle or minibus? Times and price if you know them:
- Local taxi firms you recommend:
- Where do visitors leave their car during the day?
- Can visitors see any of the flying or the arrivals from your site?

**7. Rules and good to know**
- Quiet hours:
- Dogs (welcome or not, any charge, on leads?):
- Families and children (play area, family field?):
- Groups (largest group you take, can pitches be booked together?):
- Accessibility (ground, paths, facilities):
- Any other rules:

**8. Booking**
- Booking link:
- Phone number for bookings:
- Email for bookings:
- When do bookings open?
- Deposit or full payment?
- Cancellation policy:
- Would you like to offer anything to guide readers? (a discount code, free ice packs, early arrival, anything you like)

**9. Online**
- Your website:
- Facebook page:
- Instagram:

**10. Photos**
Please attach up to six photos, landscape if you can and at least 1600 pixels wide. A wide view of the field works best as the main photo, then pitches, facilities and anything that makes your site special. Let me know:
- Who took them, if you'd like a credit:
- That you're happy for me to use them on the guide and on our socials: yes / no

**11. Permission**
- Are you happy for these details to go on the guide and be shared on our socials? yes / no
- Who should I send your page to for checking (name and email)?

If it's easier to talk it through, just send me your number and a good time to ring, and I'll fill this in with you over the phone.

Thanks very much, and I hope to have you on the pages soon.

Jack Skedge
Founder and Managing Editor
The Big Guide to UK Airshows
contactus@ukairshowguide.co.uk
ukairshowguide.co.uk

*The guide is independent and not part of the Royal International Air Tattoo.*

---

## Short follow up (if there's no reply after a week or two)

**Subject:** Re: Add your campsite to the RIAT camping pages

Hello again,

Just following up on my email about adding your campsite to the RIAT camping pages on The Big Guide to UK Airshows. Visitors are already planning for Boscombe Down in 2027, and a free listing gets your site in front of them.

If filling in the questions is a pain, send me your website and a couple of photos and I'll make a start, then send you the page to check.

Thanks,
Jack

---

## Where each answer goes on the page

| Email question | Page section | `new-site.json` field |
|---|---|---|
| 1. Name, closest show, kind, one line, about, quote | Top of the page, About the site | `name`, `area` (`boscombe` or `fairford`), `kind`, `tagline`, `about`, `owner` |
| 2. Address, what3words | Getting to the show map box, Directions button | `address`, `postcode`, `what3words`, `lat`, `lng` (look the postcode up on a map) |
| 3. Dates and stays | Key details, the dates strip under the pitches | `dates.open`, `dates.close`, `dates.minNights`, `dates.arrive`, `dates.leave`; late arrivals in `facilities.late-arrival` |
| 4. Pitches and prices | Pitches and prices cards | `pitches` (one entry per type, `kind` is `tent`, `van`, `caravan` or `glamping`) |
| 5. Facilities | Facilities lists | `facilities` (`yes`, `no` or a short note; leave blank to hide) |
| 6. Getting to the show | Getting to the show | `toShow.driveMins`, `walk`, `shuttle`, `taxi`, `parking`; flying views in `goodToKnow` |
| 7. Rules | Good to know | `goodToKnow` (pairs of heading and answer); dogs in `facilities.dogs` |
| 8. Booking | Book section | `booking.url`, `phone`, `email`, `opens`, `deposit`, `cancellation`, `offer` |
| 9. Online | Book section buttons | `website`, `socials.facebook`, `socials.instagram` |
| 10. Photos | Header photo and gallery | `photos` (save as `riat-camping/img/<slug>-1.jpg` and so on, full https addresses) |
| 11. Permission | Not shown | Set `live` to `true` only once the owner has checked the page |
| Later, when they tell you how bookings are going | Badge on the tab, card and page | `availability`: `available`, `filling` or `full` |
