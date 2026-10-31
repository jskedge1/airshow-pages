# Puts the same title, description, canonical address and share tags as the Wix page into each page file here,
# so search engines credit ukairshowguide.co.uk rather than jskedge1.github.io. Rerun after changing SEO in Wix (update W below).
import json, re, html, glob, sys
W = {
 '/youtube': ("Airshow Videos | The Big Guide to UK Airshows","Airshow videos from The Big Guide to UK Airshows, with flying displays and show day advice from airshows around the UK."),
 '/first-airshow-which-show': ("Which Airshow Suits You? | The Big Guide to UK Airshows","Compare the different kinds of UK airshow, from big military shows to seaside and historic displays, and find the one that suits you and your family."),
 '/international-ayr-show': ("International Ayr Show Visitor Guide | The Big Guide to UK Airshows","Plan your day at the International Ayr Show on the South Ayrshire seafront: where to watch, getting there, parking, where to stay and photography tips."),
 '/planning-your-first-airshow': ("Planning Your First Airshow | The Big Guide to UK Airshows","New to airshows? What to expect, when to arrive, what to pack, where to sit and how to make the most of your first airshow day."),
 '/airshow-map': ("UK Airshow Map 2027 | The Big Guide to UK Airshows","See every UK airshow on one map. Find shows near you, compare dates and open a full visitor guide for each one."),
 '/show-day-live': ("Show Day Live | The Big Guide to UK Airshows","Follow a UK airshow on the day: what's flying now and next, the running order, and updates shared by visitors at the show."),
 '/first-airshow-weather': ("Airshow Weather and Will It Fly? | The Big Guide to UK Airshows","How the weather affects airshow flying, what cloud, wind and rain mean for the displays, and how to dress for a long day outdoors."),
 '/airshow-questions': ("Airshow Questions and Answers | The Big Guide to UK Airshows","Straight answers to the questions people ask before a UK airshow: tickets, arriving, parking, children, ear defenders, bags, dogs, food, weather, photography and camping."),
 '/build-your-kit-calculator': ("Build Your Kit Calculator | The Big Guide to UK Airshows","Tick the photography kit, camping kit, food and drink, tickets and travel you need for a UK airshow, set a budget for each and see what the whole trip costs."),
 '/airshow-security': ("Airshow Security and Bag Searches | The Big Guide to UK Airshows","What happens at airshow security gates, how bag searches work, what Martyn's Law may change, and how to pack your bag and trolley for a quicker queue."),
 '/coming-soon-03': ("The Big Guide to UK Airshows | Your 2027 Airshow Guide","Plan a better day at UK airshows. Independent guides to parking, travel, where to watch, aircraft line ups, photography and family advice for every major show."),
 '/first-airshow-accommodation': ("Where to Stay for an Airshow | The Big Guide to UK Airshows","Hotels, campsites and other places to stay for UK airshows, with advice on booking early and getting to the showground on the day."),
 '/contact-us': ("Contact Us | The Big Guide to UK Airshows","Get in touch with The Big Guide to UK Airshows. Questions, corrections, photos to share or interest in volunteering, we would love to hear from you."),
 '/first-airshow-on-the-day': ("Airshow Day: What to Expect | The Big Guide to UK Airshows","What happens on an airshow day, from arriving and finding your spot to the flying display, toilet breaks and getting home."),
 '/uk-airshow-calendar': ("UK Airshow Calendar 2027 | The Big Guide to UK Airshows","Every UK airshow for 2027 in one calendar, with dates, locations and links to a full planning guide for each show."),
 '/shuttleworthairshows': ("Shuttleworth Air Shows Visitor Guide | Old Warden","Plan your day at the Shuttleworth Collection air shows at Old Warden, Bedfordshire: show dates, tickets, parking, where to watch and photography tips."),
 '/visitorplanningguides': ("Airshow Visitor Planning Guides | The Big Guide to UK Airshows","Plain English guides to planning your airshow day: choosing a show, getting there, where to watch, what to pack, the weather and staying safe."),
 '/camping-at-airshows': ("Camping at Airshows | The Big Guide to UK Airshows","Camping at UK airshows made simple. Shows with on site camping, nearby campsites, what to pack, budgets and buying second hand kit."),
 '/foodanddrinkatairshows': ("Food and Drink at Airshows | The Big Guide to UK Airshows","What food and drink to expect at UK airshows, whether you can take a picnic, and tips for avoiding the lunchtime queues."),
 '/cosfordairshow': ("RAF Cosford Air Show Visitor Guide | The Big Guide to UK Airshows","Plan your visit to the RAF Cosford Air Show in Shropshire. Getting there, parking, the flying line-up, where to watch, a sun guide and photography tips."),
 '/little-gransden-air-and-car-show': ("Little Gransden Air and Car Show Guide | The Big Guide to UK Airshows","Plan your day at the Little Gransden Air and Car Show in Cambridgeshire: tickets, parking, where to watch, the aircraft and photography tips."),
 '/airshow-traders': ("Airshow Traders | The Big Guide to UK Airshows","Find small businesses trading at UK airshows: food, prints, models, clothing and kit, with the shows and dates you will find them at. Traders can list for free."),
 '/advertise-with-us': ("Advertise with Us | The Big Guide to UK Airshows","Reach UK airshow visitors and aviation fans by advertising with The Big Guide to UK Airshows."),
 '/midlandsairfestival': ("Midlands Air Festival Visitor Guide | The Big Guide to UK Airshows","Plan your visit to the Midlands Air Festival at Ragley Hall in Warwickshire: flying displays, hot air balloons, tickets, getting there, parking and photography tips."),
 '/train-to-clacton': ("Train to Clacton | The Big Guide to UK Airshows","Greater Anglia trains to Clacton on Sea for Clacton Airshow: pick your station and train, see the route map, and the walk from the station to the seafront."),
 '/train-to-riat': ("Train to RIAT | The Big Guide to UK Airshows","Trains to Swindon for the Royal International Air Tattoo, with the free Swindon Shuttle to RAF Fairford: pick your station, day and train and see which shuttle you can catch."),
 '/train-to-swansea': ("Train to Swansea | The Big Guide to UK Airshows","Trains to Swansea for the Wales Airshow: pick your station, day and train, see the route map, any changes, and the walk from Swansea station to the seafront."),
 '/train-to-cosford': ("Train to Cosford | The Big Guide to UK Airshows","Trains to Cosford for the RAF Cosford Air Show: pick your station and train, see the route map, any changes, and the short walk from Cosford station to the airfield."),
 '/train-to-eastbourne': ("Train to Eastbourne | The Big Guide to UK Airshows","Southern trains to Eastbourne for Airbourne, the Eastbourne Airshow: pick your station, day and train, see the route map, and the walk from the station to the Western Lawns."),
 '/groups': ("Airshow Groups | The Big Guide to UK Airshows","Join groups for your favourite UK airshows and topics. Share photos, swap tips and meet other visitors heading to the same show."),
 '/clactonairshow': ("Clacton Airshow Visitor Guide | The Big Guide to UK Airshows","Plan your day at Clacton Airshow on the Essex coast: where to watch along the seafront, getting there, parking and photography tips."),
 '/eastbourneairshow': ("Eastbourne Airshow Visitor Guide | The Big Guide to UK Airshows","Plan your day at Eastbourne Airshow on the East Sussex seafront: where to watch, getting there, parking, accessibility, where to stay and photography tips."),
 '/duxfordairshows': ("Duxford Air Shows Visitor Guide | IWM Duxford Airshows","Everything you need for the IWM Duxford air shows in Cambridgeshire: show dates, tickets, getting there, parking, where to watch and photography tips."),
 '/airshow-news': ("UK Airshow News | The Big Guide to UK Airshows","The latest UK airshow news in one place. Date announcements, aircraft confirmations, ticket releases and updates from official show websites."),
 '/trader-hub': ("Trader Hub | The Big Guide to UK Airshows","Log in to the Trader Hub to manage your listing in the airshow traders directory, add the shows you're trading at and keep your details up to date."),
 '/first-airshow-safety': ("Airshow Safety and Show Rules | The Big Guide to UK Airshows","Staying safe at a UK airshow and the rules most shows ask visitors to follow, explained in plain English."),
 '/blackpool-air-show': ("Blackpool Air Show Visitor Guide | The Big Guide to UK Airshows","Plan your day at Blackpool Air Show on the Lancashire seafront: where to watch, getting there, parking, the flying line-up and photography tips."),
 '/air-shows-guides': ("Find a UK Airshow | The Big Guide to UK Airshows","Browse UK airshows and open a visitor guide for each one, with dates, getting there, parking, where to watch and photography tips."),
 '/first-airshow-what-to-pack': ("What to Pack for an Airshow | The Big Guide to UK Airshows","An airshow packing list: chairs, ear defenders, sun cream, waterproofs, food, drink and the small things that make a long day easier."),
 '/southport-air-show': ("Southport Air Show Visitor Guide | The Big Guide to UK Airshows","Plan your weekend at Southport Air Show on the Merseyside coast: where to watch, getting there, parking, where to stay and photography tips."),
 '/first-airshow-where-to-watch': ("Where to Watch an Airshow | The Big Guide to UK Airshows","How to choose your spot at a UK airshow: the crowd line, show centre, seating and shade, and the best places for families and photographers."),
 '/first-airshow-getting-there': ("Getting to an Airshow | The Big Guide to UK Airshows","How to get to a UK airshow, from driving and parking to trains, buses and park and ride, with tips on when to set off and getting home."),
 '/my-airshow-hub': ("My Airshow Hub | The Big Guide to UK Airshows","Your personal airshow planner. Save shows, follow countdowns, tick off tickets and travel, and get updates when your saved shows change."),
 '/riat': ("RIAT 2027 Visitor Guide | Royal International Air Tattoo","Plan your day at the Royal International Air Tattoo, RAF Fairford, 16 to 18 July 2027. Tickets, parking, Park & Ride, where to stay, where to watch and photography tips."),
 '/headcorn-air-show': ("Headcorn Air Show Visitor Guide | Headcorn Aerodrome, Kent","Everything you need for the Headcorn air shows in Kent: show dates, tickets, getting there, parking, where to watch, where to stay and what to bring."),
 '/airshow-photography-hub': ("Airshow Photography Hub | The Big Guide to UK Airshows","Airshow photography in plain English: camera settings for jets and propellers, lenses and kit, and how to make the most of the light."),
 '': ("The Big Guide to UK Airshows | Plan Your Airshow Day","Independent guides to UK airshows. Parking, travel, where to watch, aircraft line ups, photography tips and honest advice on which show suits you and your family."),
 '/community-forum': ("Airshow Forum | The Big Guide to UK Airshows","Talk, share and plan with other UK airshow fans. Post photos, join show groups, find a buddy for show day and swap kit."),
 '/walesairshow': ("Wales Airshow Swansea Visitor Guide | The Big Guide to UK Airshows","Plan your visit to the Wales Airshow on Swansea Bay: where to watch along the seafront, getting there, parking, road closures, accessibility and photography tips."),
 '/policies': ("Policies | The Big Guide to UK Airshows","Privacy policy, cookie policy and website terms for The Big Guide to UK Airshows, an independent airshow visitor guide."),
}
SHOW = {'ayr':'/international-ayr-show','blackpool':'/blackpool-air-show','clacton':'/clactonairshow','cosford':'/cosfordairshow','duxford':'/duxfordairshows',
 'eastbourne':'/eastbourneairshow','gransden':'/little-gransden-air-and-car-show','headcorn':'/headcorn-air-show','midlands':'/midlandsairfestival','midlands-v2':'/midlandsairfestival',
 'riat':'/riat','shuttleworth':'/shuttleworthairshows','southport':'/southport-air-show','wales':'/walesairshow'}
MAP = {f'camping-layout/{k}.html': v for k, v in SHOW.items()}
MAP.update({'riat.html':'/riat','raf-cosford.html':'/cosfordairshow','eastbourne.html':'/eastbourneairshow','duxford.html':'/duxfordairshows','shuttleworth.html':'/shuttleworthairshows',
 'blackpool.html':'/blackpool-air-show','southport.html':'/southport-air-show','ayr.html':'/international-ayr-show','little-gransden.html':'/little-gransden-air-and-car-show',
 'photography-hub.html':'/airshow-photography-hub','airshow-photography-hub.html':'/airshow-photography-hub','camping-hub.html':'/camping-at-airshows',
 'airshow-news.html':'/airshow-news','airshow-map.html':'/airshow-map','find-your-airshow.html':'/air-shows-guides','youtube.html':'/youtube',
 'forum.html':'/community-forum','forum-clean.html':'/community-forum','forum-hud.html':'/community-forum','show-day.html':'/show-day-live',
 'traders/directory.html':'/airshow-traders','traders/trader-hub.html':'/trader-hub','policies.html':'/policies','train-routes/clacton.html':'/train-to-clacton','train-routes/eastbourne.html':'/train-to-eastbourne','train-routes/cosford.html':'/train-to-cosford','train-routes/wales.html':'/train-to-swansea','train-routes/riat.html':'/train-to-riat',
 'airshow-security.html':'/airshow-security','questions-and-answers.html':'/airshow-questions','kit-calculator.html':'/build-your-kit-calculator','first-airshow-which-show.html':'/first-airshow-which-show','first-airshow-getting-there.html':'/first-airshow-getting-there',
 'first-airshow-where-to-watch.html':'/first-airshow-where-to-watch','first-airshow-on-the-day.html':'/first-airshow-on-the-day','first-airshow-safety.html':'/first-airshow-safety',
 'first-airshow-what-to-pack.html':'/first-airshow-what-to-pack','first-airshow-accommodation.html':'/first-airshow-accommodation','first-airshow-weather.html':'/first-airshow-weather',
 'food-and-drink.html':'/foodanddrinkatairshows','visitor-planning-guides.html':'/visitorplanningguides','advertise-with-us.html':'/advertise-with-us',
 'landing.html':'/coming-soon-03','groups-header.html':'/groups','home.html':'','my-airshow-hub.html':'/my-airshow-hub','contact.html':'/contact-us',
 'uk-airshow-calendar.html':'/uk-airshow-calendar','planning-your-first-airshow.html':'/planning-your-first-airshow'})
NOINDEX = ['admin/board.html','traders/admin.html','footer.html','hub-badge.html','hub-parts/hudx-posts.html','hub-parts/hudx.html','hub-parts/overview2.html',
 'bus-routes-src/header-block.html','bus-routes-src/index.tpl.html','train-routes-src/template.html'] + glob.glob('templates/*.html')
SITE = 'https://www.ukairshowguide.co.uk'
IMG = 'https://static.wixstatic.com/media/a0546b_e9ac2e401b564c6083fb2a13997c3349~mv2.png'
START, END = '<!-- seo: matches the Wix page on ukairshowguide.co.uk -->', '<!-- /seo -->'
OLD = re.compile(r'\s*<meta\s+(?:name|property)="(?:description|robots|og:[a-z_:]+|twitter:[a-z_:]+)"[^>]*>|\s*<link\s+rel="canonical"[^>]*>', re.I)
def esc(x): return html.escape(x, quote=True)
def block(title, desc, url, robots=None):
    L = [START]
    if robots: L.append(f'<meta name="robots" content="{robots}">')
    if desc: L.append(f'<meta name="description" content="{esc(desc)}">')
    if url:
        L.append(f'<link rel="canonical" href="{url}">')
        L += [f'<meta property="og:url" content="{url}">', f'<meta property="og:title" content="{esc(title)}">',
              f'<meta property="og:description" content="{esc(desc)}">', '<meta property="og:site_name" content="The Big Guide to UK Airshows">',
              '<meta property="og:type" content="website">', f'<meta property="og:image" content="{IMG}">', '<meta name="twitter:card" content="summary_large_image">']
    L.append(END)
    return '\n'.join(L)
def apply(fn, title, desc, url, robots=None):
    s = open(fn, encoding='utf-8').read()
    s = re.sub(r'\n?' + re.escape(START) + r'.*?' + re.escape(END), '', s, flags=re.S)
    h = s.lower().find('</head>')
    sc = s.lower().find('<script')
    if sc >= 0 and h > sc: h = -1
    if h < 0:
        m = re.search(r'</title>', s)
        if not m: return 'fragment, skipped'
        h = m.end()
    head, rest = s[:h], s[h:]
    head = re.sub(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', '', head, flags=re.S)
    head = OLD.sub('', head)
    if title:
        if re.search(r'<title>.*?</title>', head, re.S): head = re.sub(r'<title>.*?</title>', lambda m: f'<title>{esc(title)}</title>', head, count=1, flags=re.S)
        else: head = head.rstrip() + f'\n<title>{esc(title)}</title>\n'
    head = head.rstrip() + '\n' + block(title, desc, url, robots) + '\n'
    open(fn, 'w', encoding='utf-8').write(head + rest)
    return 'ok'
done = {}
for fn, path in MAP.items():
    t, d = W[path]; done[fn] = apply(fn, t, d, SITE + path if path else SITE + '/')
for fn in NOINDEX:
    s = open(fn).read(); m = re.search(r'<title>(.*?)</title>', s[:max(s.lower().find('</head>'), 0) or len(s)], re.S)
    done[fn] = apply(fn, html.unescape(m.group(1)) if m else None, None, None, robots='noindex, nofollow')
# bus route pages: shown on the Wix page /bus-route?r=<id> (live 30 Oct 2026)
for fn in sorted(glob.glob('bus-routes/*.html')):
    s = open(fn).read()
    if fn.endswith('index.html'):
        t = 'Bus Route Maps for UK Airshows | The Big Guide to UK Airshows'
        d = 'Route maps for every bus to the UK airshows we cover, with the roads each bus takes, every stop, the times on show days and the closest stop to the show.'
    else:
        c = json.loads(re.search(r'var CFG=(\{.*?\});\nvar DATA', s, re.S).group(1))
        t = f'{c["title"]} for the {c["showName"]} | The Big Guide to UK Airshows'
        d = f'The {c["num"]} bus to the {c["showName"]}: the roads it takes, every stop, times on show days and the closest stop to the show. Run by {c["operator"]}.'
    rid = fn.split('/')[-1][:-5]
    done[fn] = apply(fn, t, d, SITE + '/bus-route' + ('' if rid == 'index' else '?r=' + rid))
bad = {k: v for k, v in done.items() if v != 'ok'}
print(len(done), 'files', bad)
