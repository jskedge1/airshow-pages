"""Questions and answers for the Q&A page (questions-and-answers.html).

Edit the text here, then run `python3 build.py` in this folder to rebuild the page.
Rules for the copy: written as Jack in first person, plain English, no dashes,
no source credits, short paragraphs. Each answer points to the page with the full
detail instead of repeating it.

Each group: id, title, line (under the title), intro (Jack's few words at the top
of the group), photo (address, alt text, caption or None; AI images must say so),
guide (name, Wix path) and the questions: (id, question, answer paragraphs, more link or None).
A more link is (link text, Wix path).
"""

IMG = 'https://jskedge1.github.io/airshow-pages/'

GROUPS = [
    {
        'id': 'plan', 'icon': 'ticket',
        'title': 'Planning and tickets',
        'line': 'Picking a show, booking and what it costs',
        'intro': "Most of the questions I get start here. Who's coming with you and how into aviation you are will answer half of them.",
        'photo': (IMG + 'home-img/day-1630.webp', 'Crowds on the shingle beach at Eastbourne watching the flying display', None),
        'guide': ('Which airshow suits you?', '/first-airshow-which-show'),
        'qs': [
            ('which-show', 'Which airshow should I go to first?', [
                "That depends on who is coming and what you are after when attending an airshow. A free seafront show like Eastbourne or Clacton is a gentle first go, because you can wander along the front and leave whenever you like.",
                "If you want fast jets and a big static display, a ticketed airfield show such as the Royal International Air Tattoo or RAF Cosford will suit you better. I made a short quiz that helps you pick.",
            ], ('Which airshow suits you?', '/first-airshow-which-show')),
            ('book-early', 'Do I need to buy tickets in advance?', [
                "For the big ticketed shows, yes. Some sell out, some don't sell on the gate at all, and advance tickets are often cheaper. Parking is usually booked at the same time.",
                "The seafront shows are free to watch, so there's nothing to book apart from a car park or a paid seat if the show offers one.",
            ], None),
            ('cost', 'How much does a day at an airshow cost?', [
                "It can vary a lot. A seafront show costs nothing to get in, so you are only paying for travel, parking and food.",
                "A big airfield show adds up quickly for a family once tickets, parking and lunch are counted. I would advise taking a picnic and booking early. That's where most of the savings are.",
            ], ('Food and drink at airshows', '/foodanddrinkatairshows')),
            ('free-vs-paid', 'Are the free seafront shows as good as the paid ones?', [
                "They are a different kind of day. You still get the Red Arrows and the RAF display teams at most of them, and a beach is a lovely spot for a family.",
                "What you usually miss is a static display, where you can get right up close to the aircraft on the ground. If that matters to you, I would suggest an airfield show.",
            ], None),
            ('lineup', 'When are the aircraft line up and flying times announced?', [
                "Line ups build over the months before a show and can change right up to the weekend. Flying times usually come out a day or two before.",
                "I keep the line up on every show page up to date. If you join My Airshow Hub you can add the aircraft you don't want to miss to your must see list and get a note when they are confirmed.",
            ], ('Find your airshow', '/air-shows-guides')),
            ('dropped-out', 'What happens if an aircraft I wanted to see drops out?', [
                "It happens more than you would think. Aircraft cancel for weather, faults or operational reasons, sometimes on the morning of the show.",
                "Most shows say in their terms that a change to the line up isn't grounds for a refund. I would never book a show for one aircraft alone, and please see the rules before you buy.",
            ], None),
            ('buy-here', 'Can I buy tickets through this website?', [
                "I'm afraid not. The guide is independent, so I can't sell, change or refund tickets. Every show page links to the official ticket site, and I would always book direct.",
            ], None),
        ],
    },
    {
        'id': 'travel', 'icon': 'car',
        'title': 'Getting there and parking',
        'line': 'Arriving, park and ride, trains and buses',
        'intro': "The drive in and the queue out can make or break the day. A bit of planning here goes a long way.",
        'photo': (IMG + 'home-img/day-07.webp', 'Cars parked in rows on a grass field car park at an airshow on a sunny morning', None),
        'guide': ('Getting to an airshow', '/first-airshow-getting-there'),
        'qs': [
            ('arrive-time', 'What time should I arrive?', [
                "Earlier than feels sensible. If you are driving, check when the car parks open and try to arrive about an hour before. The last few miles are always the slowest.",
                "For Shuttleworth at Old Warden I aim for about 08:00 rather than 09:00.",
            ], None),
            ('park-ride', 'Is park and ride worth it?', [
                "At the bigger shows it can be. You leave the car away from the busy roads and the bus takes you to the gate, and going in is usually quick.",
                "Coming home is where you wait. Everyone wants the bus at once, so expect a queue in the first half hour after the finale.",
            ], ('Getting to an airshow', '/first-airshow-getting-there')),
            ('no-car', 'Can I get to an airshow without a car?', [
                "Yes, for a lot of them. The seafront shows are easy by train, and many airfield shows have a bus from the nearest station on show days.",
                "I've put every bus and train route I cover on one page, sorted by show, and you can search it by your town.",
            ], ('Public transport to UK airshows', '/airshow-public-transport')),
            ('book-parking', 'Should I book parking in advance?', [
                "I would. Many shows sell parking with the ticket, and booked spaces are often cheaper and closer to the entrance. Some don't take payment on the day at all.",
            ], None),
            ('sat-nav', 'What should I put in my sat nav?', [
                "The postcode or what3words for your car park, not the airfield's own address. The address can take you round to the wrong side of the site, and at a big show that can cost you an hour.",
                "Every show page lists the car park postcodes and what3words.",
            ], ('Find your airshow', '/air-shows-guides')),
            ('exit-queue', 'How do I avoid the queue to leave?', [
                "My answer is to stay longer. When the flying ends, thousands of people head for the car parks at the same moment. Give it an hour and you'll drive straight out.",
                "I spend that hour on the static display and watching the aircraft taxi back in. If you have to get away quickly, park near the exit and pack up during the last display.",
            ], ('On the day', '/first-airshow-on-the-day')),
        ],
    },
    {
        'id': 'day', 'icon': 'clock',
        'title': 'On the day',
        'line': 'Arriving, where to sit, toilets and the static display',
        'intro': "This is how I run my own day, after a good few years of getting it wrong.",
        'photo': (IMG + 'home-img/day-10.webp', 'Visitors in folding chairs on the crowd line with Hurricanes parked behind the fence', None),
        'guide': ('On the day', '/first-airshow-on-the-day'),
        'qs': [
            ('first-thing', 'What should I do when I first get in?', [
                "If you want a front row seat, head there first and save your pitch with your chairs and a blanket. Your spot will still be there later.",
                "Then look around the static show, speak to the pilots, visit the trade stalls and check the food options while the queues are short.",
            ], None),
            ('best-spot', 'Where is the best place to watch?', [
                "Every ticket gets you to the crowd line, and the front row is first come, first served. I like being near the middle, as that's where the displays are aimed.",
                "Check the sun guide on the show page as well. Looking into the sun all afternoon is hard work.",
            ], ('Where to watch an airshow', '/first-airshow-where-to-watch')),
            ('enclosures', 'Are the paid seating areas worth it?', [
                "You get a seat, a bit more space and often your own toilets. The view of the flying is much the same as the free crowd line.",
                "I would consider one if someone in your group needs a seat and some shade all day.",
            ], ('Where to watch an airshow', '/first-airshow-where-to-watch')),
            ('toilets', 'When is the best time to use the toilets?', [
                "Visit the toilet before the flying display starts, as queues build once the displays begin.",
                "If you aren't waiting to see a particular display, use it as a toilet break. That's what I do.",
            ], None),
            ('inside-aircraft', 'Can I go inside the aircraft on the static display?', [
                "Some aircraft are opened up for you to take a look inside, and the crews are usually happy to chat. You can often buy exclusive merch in or outside the aircraft too, like squadron patches.",
                "Queues for the big transport aircraft grow after lunch, so I would go in the morning.",
            ], None),
            ('how-long', 'How long does an airshow last?', [
                "Gates usually open early in the morning and the flying fills most of the afternoon, often four hours or more at the big shows. Most people make a full day of it.",
                "Shuttleworth also puts on evening shows, which are a lovely way to see the old aircraft in softer light.",
            ], None),
            ('come-back', 'Can I leave and come back in?', [
                "At most airfield shows, once you are out you are out, so please see the rules before you go.",
                "Seafront shows are on public ground, so you can come and go as you like.",
            ], None),
            ('phone-signal', 'Will my phone work?', [
                "Signal often drops at the big shows, with thousands of people on the same masts. I would agree a meeting point with your group and save your tickets to your phone before you leave home.",
            ], None),
        ],
    },
    {
        'id': 'family', 'icon': 'family',
        'title': 'Families and children',
        'line': 'Noise, keeping together and keeping them busy',
        'intro': "Children love to see the Red Arrows, and an airshow can be a brilliant day for them. It's a long one though, so plan around them.",
        'photo': (IMG + 'home-img/day-15.webp', 'The Red Arrows flying in formation against a clear blue sky', None),
        'guide': ('Safety and show rules', '/first-airshow-safety'),
        'qs': [
            ('young-kids', 'Is an airshow a good day out for young children?', [
                "Yes, with a bit of planning. Getting close to the aircraft on the static display is usually the big hit, along with the display teams.",
                "For toddlers I would think about a seafront show or a shorter visit to an airfield show, and plan around naps and food.",
            ], ('Which airshow suits you?', '/first-airshow-which-show')),
            ('ear-defenders', 'Do children need ear defenders?', [
                "I would say yes. Fast jets are loud enough to hurt. Your child's ears are delicate, so try to protect them as much as possible.",
                "Baby ear defenders are cheap and light, and older children can wear an ordinary pair. Pack them where you can reach them quickly, as a jet can arrive with very little warning.",
            ], ('What to pack', '/first-airshow-what-to-pack')),
            ('separated', 'What if we get separated?', [
                "Agree a meeting point when you arrive and write your mobile number on a wristband or a note in their pocket. Most shows have a lost children point near the main entrance, so point it out to them on the way in.",
            ], ('Safety and show rules', '/first-airshow-safety')),
            ('pushchair', 'Can I bring a pushchair?', [
                "Yes. Airfields are mostly grass, so a buggy that copes with grass will make your day a lot easier.",
                "A folding trolley or wagon is handy for chairs and bags, but some shows limit them. Check the rules for your show first.",
            ], None),
            ('kids-free', 'Do children get in free?', [
                "At many ticketed shows younger children get in free or cheaper with a paying adult. The ages and limits change from show to show, so take a look at the ticket page before you book.",
            ], None),
            ('keep-busy', 'What will keep them busy between displays?', [
                "Most shows have a ground area with plenty going on. The RAF Village at shows like Eastbourne is a good one, where kids can get stickers and photos with the Red Arrows crews and find out about roles in the RAF.",
                "I would still bring a few snacks and a game for the quieter bits, and something for the car park queue at the end.",
            ], None),
        ],
    },
    {
        'id': 'access', 'icon': 'access',
        'title': 'Accessibility',
        'line': 'Parking, viewing areas, carers and getting around',
        'intro': "Every show does this a little differently, and some need you to get in touch before the day. I check each one on its show page.",
        'photo': (IMG + 'guide-img/accessible-viewing.jpg', 'A raised accessible viewing platform on an airfield crowd line with wheelchair users and their families watching a display', 'An accessible viewing area on the crowd line. AI generated for a visual look.'),
        'guide': ('Find your airshow', '/air-shows-guides'),
        'qs': [
            ('blue-badge', 'Is there disabled parking?', [
                "Most shows have Blue Badge parking closer to the gate, but the spaces are limited.",
                "Some shows want you to contact them with proof before the day, others are first come, first served. Each show page tells you which.",
            ], ('Find your airshow', '/air-shows-guides')),
            ('viewing-area', 'Are there accessible viewing areas?', [
                "Many of the bigger shows have a viewing area for wheelchair users and their carers, often with accessible toilets close by. Some need booking, so I would ask the show early as they fill up.",
            ], None),
            ('carer-ticket', 'Do carers get in free?', [
                "Many shows offer a free or cheaper carer ticket when you show proof, such as a PIP letter or an Access Card. It differs from show to show, so check the accessibility page on the show's own website before you book.",
            ], None),
            ('wheelchair-grass', 'How easy is it to get around in a wheelchair?', [
                "Airfields are big and mostly grass, and it can get rutted or muddy after rain. Some shows lay trackway on the main routes.",
                "If you can, look at the site map before you go and plan the shortest route from your car park to where you want to sit.",
            ], None),
            ('too-loud', 'What if the noise or crowds get too much?', [
                "Some shows now have a quiet area. If yours doesn't, stand well back from the display centre, as the noise drops off quite a lot with distance.",
                "Ear defenders help, and a seafront show gives you more room to step away from the crowd when you need to.",
            ], None),
        ],
    },
    {
        'id': 'rules', 'icon': 'shield',
        'title': 'Bags, security and show rules',
        'line': 'Bag searches, banned items, dogs and chairs',
        'intro': "Rules change from show to show, and some change every year. Please see the rules for your show before you go.",
        'photo': (IMG + 'guide-img/bag-check.jpg', 'A steward checking a visitor\'s rucksack at an airshow bag search table', 'A bag check at the gate. AI generated for a visual look.'),
        'guide': ('Airshow security and bag searches', '/airshow-security'),
        'qs': [
            ('bag-search', 'Will my bag be searched?', [
                "At the big ticketed shows and military bases, expect it. Smaller airfield shows may take a quick look, and seafront shows rarely check at all.",
                "I've written a guide on packing so you get through the gate quicker.",
            ], ('Airshow security and bag searches', '/airshow-security')),
            ('banned', 'What am I not allowed to bring?', [
                "Drones are banned at every show I cover, and barbecues are a no at most, even disposables. Glass, gazebos, large cool boxes and wagons are limited at some.",
                "Each show publishes its own list in the ticket terms.",
            ], ('Safety and show rules', '/first-airshow-safety')),
            ('dogs', 'Can I bring my dog?', [
                "It varies a lot. Most airfield shows only allow assistance dogs. Seafront shows are on public ground, so dogs can come along.",
                "I would think hard about it though. Fast jets are very loud and a lot of dogs hate it.",
            ], None),
            ('chairs', 'Can I bring chairs, a blanket or a windbreak?', [
                "Folding chairs and blankets are fine at most shows. If you are on the front row, a low chair keeps the view clear for the people behind you.",
                "Windbreaks, gazebos and big umbrellas are often only allowed further back, if at all.",
            ], ('Where to watch an airshow', '/first-airshow-where-to-watch')),
        ],
    },
    {
        'id': 'food', 'icon': 'cup',
        'title': 'Food, drink and stalls',
        'line': 'Picnics, prices, cash and merch',
        'intro': "Food is one of the easiest places to save money at a show, and the stalls are half the fun.",
        'photo': (IMG + 'home-img/day-11.webp', 'A green double decker bus turned into a bar, parked on the grass at an airshow', None),
        'guide': ('Food and drink at airshows', '/foodanddrinkatairshows'),
        'qs': [
            ('picnic', 'Can I take my own food and drink?', [
                "Usually, yes. A lot of people take a picnic and it saves a fair bit. Some shows limit glass and alcohol, so check before you pack.",
            ], ('Food and drink at airshows', '/foodanddrinkatairshows')),
            ('food-prices', 'What is the food like, and is it expensive?', [
                "You'll find burgers, chips, hog roasts, coffee vans and ice cream. Prices are higher than in town, and the queues are longest from midday.",
                "I eat early or late, and keep a snack back for the car park queue.",
            ], None),
            ('cash', 'Should I bring cash?', [
                "I would bring some. Most stalls take cards, but the machines can lose signal on a busy show site, and cash keeps you moving when that happens.",
            ], None),
            ('merch', 'Can I buy aviation merch at the show?', [
                "Yes, and it's one of my favourite bits. The trade stalls sell models, prints, patches and books, and some aircraft on the static display sell their own exclusive merch.",
                "I'm building a list of traders so you can see who is going to each show.",
            ], ('Airshow traders', '/airshow-traders')),
            ('water', 'Will I be able to get water?', [
                "Some shows have water refill points, but don't count on it. I would bring a refillable bottle and more than you think you'll need on a hot day, as there is very little shade on an airfield.",
            ], None),
        ],
    },
    {
        'id': 'weather', 'icon': 'cloud',
        'title': 'Weather',
        'line': 'Rain, low cloud, wind and what to wear',
        'intro': "Unfortunately the weather on the day will be what it will be, so plan accordingly. If it's fresh, dress in layers to keep warm.",
        'photo': (IMG + 'home-img/day-0830.webp', 'Visitors with umbrellas and folding chairs along a crowd line fence under a grey sky', None),
        'guide': ('Weather and will it fly?', '/first-airshow-weather'),
        'qs': [
            ('rain', 'Does the show go ahead if it rains?', [
                "Usually, yes. Light rain doesn't stop the flying, but low cloud and strong wind can change the displays or cancel some of them.",
                "Some of my best days have been the grey ones, when the jets pull vapour off their wings.",
            ], ('Weather and will it fly?', '/first-airshow-weather')),
            ('display-types', 'What is a full, rolling or flat display?', [
                "It comes down to the height of the cloud. With high cloud the pilots fly a full display with loops. When it's lower they switch to a rolling display, and when it's very low a flat display that stays fairly level.",
                "The Will It Fly tool on my weather guide shows you what each one looks like.",
            ], ('Weather and will it fly?', '/first-airshow-weather')),
            ('weather-refund', 'Will I get a refund if the flying is cut short?', [
                "That's up to each show. Some offer a refund or credit if the whole day is called off, but very few refund for changes to the programme. Read the ticket terms when you book.",
            ], None),
            ('what-to-wear', 'What should I wear?', [
                "Layers, a waterproof and comfy shoes you don't mind getting muddy. Airfields are open and windy, even on a warm day.",
                "On a sunny day you'll want sun cream, a hat and plenty to drink. The crowd line has almost no shade.",
            ], ('What to pack', '/first-airshow-what-to-pack')),
        ],
    },
    {
        'id': 'photo', 'icon': 'camera',
        'title': 'Photography',
        'line': 'Lenses, settings, phones and where to stand',
        'intro': "Photography is a big part of my own airshow days. These are the questions I get asked most on the crowd line.",
        'photo': (IMG + 'first-airshow-img/weather-vap-typhoon.webp', 'A Typhoon climbing away with afterburners lit and vapour over its wings', None),
        'guide': ('Airshow Photography Hub', '/airshow-photography-hub'),
        'qs': [
            ('lens', 'What lens do I need?', [
                "For the flying, something that reaches at least 300mm. A 100 to 400mm or a 150 to 600mm is what you'll see most along the crowd line.",
                "For the static display a standard zoom is plenty.",
            ], ('Airshow Photography Hub', '/airshow-photography-hub')),
            ('shutter', 'What shutter speed should I use?', [
                "For jets I start around 1/1000 and go faster. For propeller aircraft I slow down to about 1/160 to 1/250, so the props show a nice blur and don't look frozen.",
                "Smooth panning is the part that takes practice. Don't worry if your first few hundred shots miss.",
            ], ('Airshow Photography Hub', '/airshow-photography-hub')),
            ('phone-photos', 'Can I get good photos on my phone?', [
                "On the static display, definitely. The flying is harder, as phones struggle at long zoom.",
                "Try burst mode when the display teams come close to the crowd. You'll get more keepers than you expect.",
            ], None),
            ('photo-spot', 'Where should I stand for photos?', [
                "With the sun behind you if you can. Every featured show page has a sun guide that shows where the sun will be through the day and which side of the aircraft will be lit.",
            ], ('Find your airshow', '/air-shows-guides')),
            ('tripod', 'Should I take a tripod?', [
                "I would leave it at home. A tripod takes up a lot of room on a busy crowd line and some seating areas don't allow them. A monopod is far easier to live with.",
            ], None),
        ],
    },
    {
        'id': 'stay', 'icon': 'tent',
        'title': 'Camping and places to stay',
        'line': 'Show campsites, hotels and the night before',
        'intro': "Staying over turns a long drive into a weekend, and you beat the morning traffic.",
        'photo': (IMG + 'first-airshow-img/fc30e5fd0f44988c.webp', 'A lit up tent and gazebo with a camping table on an airshow campsite at night', None),
        'guide': ('Camping at airshows', '/camping-at-airshows'),
        'qs': [
            ('camp', 'Can I camp at an airshow?', [
                "At some, yes. A few shows have camping on site or a campsite close by. You beat the traffic, and at some you can watch the arrivals in the days before.",
                "Spaces go quickly, so book as soon as you can.",
            ], ('Camping at airshows', '/camping-at-airshows')),
            ('stay-over', 'Should I stay over the night before?', [
                "If you live more than a couple of hours away, I would think about it. An early start from somewhere nearby is far easier than a 4am drive.",
                "Book as soon as the dates are out, as places near the big shows fill up.",
            ], ('Where to stay for an airshow', '/first-airshow-accommodation')),
            ('camp-kit', 'What do I need to camp at a show?', [
                "Much the same as any campsite, plus ear plugs, as some campsites are close to the runway. My camping guide covers what to pack and the kit you can pick up second hand.",
            ], ('Camping at airshows', '/camping-at-airshows')),
        ],
    },
    {
        'id': 'guide', 'icon': 'jet',
        'title': 'My Airshow Hub and this guide',
        'line': 'Who runs it, joining the hub and getting in touch',
        'intro': "A few questions about the website itself, and how to reach me.",
        'photo': (IMG + 'home-img/day-12.webp', 'A Spitfire and a Messerschmitt Bf 109 flying together in a pairs display', None),
        'guide': ('Contact me', '/contact-us'),
        'qs': [
            ('who', 'Who runs this guide?', [
                "I do. I'm Jack, and I've been going to the Royal International Air Tattoo every year since 2006. I started this guide after making plenty of planning mistakes of my own.",
                "It's independent and isn't run by, or connected to, any airshow.",
            ], None),
            ('hub', 'What is My Airshow Hub?', [
                "It's the free members' area of the site. You can plan the shows you're going to, keep your checklists, add aircraft to your must see list and follow the show day updates.",
                "It also opens into the forum, where you can chat with other visitors.",
            ], ('My Airshow Hub', '/my-airshow-hub')),
            ('join-cost', 'Does it cost anything to join?', [
                "No, joining is free.",
            ], ('Join My Airshow Hub', '/my-airshow-hub')),
            ('ask', 'My question isn\'t here. Where can I ask?', [
                "Ask in the forum, where other visitors can help, or send me a message. I read every one, and if a question keeps coming up I'll add it to this page.",
            ], ('Send me a message', '/contact-us')),
            ('wrong', 'I spotted something out of date. How do I tell you?', [
                "Please do. Shows change parking, gates and bus routes from year to year, and I can't be at every briefing. Tell me what you found through the contact page and I'll check it.",
            ], ('Contact me', '/contact-us')),
            ('advertise', 'Can I list my business or advertise?', [
                "Yes. Traders can list their stall for free, and there are adverts for businesses near the shows, such as places to stay.",
            ], ('Advertise with us', '/advertise-with-us')),
        ],
    },
]

# Picked out in the header search box as quick links
POPULAR = ['arrive-time', 'ear-defenders', 'picnic', 'rain', 'dogs', 'exit-queue']
