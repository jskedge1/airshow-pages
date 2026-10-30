"""Build search/index.js, the site search used by the header and the home page.

Run:  python3 tools-search.py

PAGES below lists every live Wix page that search can find: its Wix address, the file in this
repository it is built from (None for Wix-only pages), the group shown in the results, a short
line (None takes the page's own description), and extra words people might type (a). The headings on each page are read
from its file, so a search for "toilets" or "park and ride" lands on the page that covers it.
Add a row when a new page goes live, then run this again. search/engine.js is joined on the end.
"""
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).parent

SHOWS = 'Air shows'
PLAN = 'Planning guides'
PHOTO = 'Photography'
STAY = 'Camping and places to stay'
TRAVEL = 'Travel routes'
COMMUNITY = 'Community'
TOOLS = 'Calendar and tools'
SITE = 'About the guide'

PAGES = [
    # path, file, group, title, line, extra words
    ('/riat', 'camping-layout/riat.html', SHOWS, 'Royal International Air Tattoo', None, 'RIAT Fairford tattoo Gloucestershire July military'),
    ('/cosfordairshow', 'camping-layout/cosford.html', SHOWS, 'RAF Cosford Air Show', None, 'Cosford Shropshire RAF Museum June'),
    ('/midlandsairfestival', 'camping-layout/midlands.html', SHOWS, 'Midlands Air Festival', None, 'Ragley Warwickshire balloons Alcester'),
    ('/eastbourneairshow', 'camping-layout/eastbourne.html', SHOWS, 'Eastbourne Airshow', None, 'Airbourne Eastbourne Sussex seafront beach free'),
    ('/clactonairshow', 'camping-layout/clacton.html', SHOWS, 'Clacton Air Show', None, 'Clacton Essex seafront beach free Tendring'),
    ('/walesairshow', 'camping-layout/wales.html', SHOWS, 'Wales Airshow', None, 'Swansea Wales seafront beach free'),
    ('/duxfordairshows', 'camping-layout/duxford.html', SHOWS, 'Duxford Air Shows', None, 'IWM Duxford Cambridgeshire Spitfire warbirds Imperial War Museum'),
    ('/headcorn-air-show', 'camping-layout/headcorn.html', SHOWS, 'Headcorn Air Show', None, 'Headcorn Kent Lashenden aerodrome'),
    ('/shuttleworthairshows', 'camping-layout/shuttleworth.html', SHOWS, 'Shuttleworth Air Shows', None, 'Shuttleworth Old Warden Bedfordshire vintage evening'),
    ('/little-gransden-air-and-car-show', 'camping-layout/gransden.html', SHOWS, 'Little Gransden Air and Car Show', None, 'Gransden Cambridgeshire cars charity'),
    ('/southport-air-show', 'camping-layout/southport.html', SHOWS, 'Southport Air Show', None, 'Southport Merseyside seafront beach free'),
    ('/blackpool-air-show', 'camping-layout/blackpool.html', SHOWS, 'Blackpool Air Show', None, 'Blackpool Lancashire seafront promenade free'),
    ('/international-ayr-show', 'camping-layout/ayr.html', SHOWS, 'International Ayr Show', None, 'Ayr Scotland Ayrshire seafront free Festival of Flight'),

    ('/air-shows-guides', 'find-your-airshow.html', SHOWS, 'Find Your Airshow', 'Every show I cover in one place, so you can compare them.', 'find choose compare list all shows featured'),
    ('/uk-airshow-calendar', 'uk-airshow-calendar.html', TOOLS, 'UK Airshow Calendar 2027', 'Every UK airshow date for the 2027 season.', 'calendar dates 2027 season when'),
    ('/airshow-map', 'airshow-map.html', TOOLS, 'UK Airshow Map', 'Find the shows near you on a map.', 'map near me nearby location'),
    ('/airshow-news', 'airshow-news.html', TOOLS, 'Airshow News', 'The latest updates from the shows, checked every day.', 'news updates latest announcements'),

    ('/visitorplanningguides', 'visitor-planning-guides.html', PLAN, 'Visitor Planning Guides', 'All my planning guides in one place.', 'planning guides advice'),
    ('/planning-your-first-airshow', 'planning-your-first-airshow.html', PLAN, 'Planning Your First Airshow', 'Start here if you have never been to an airshow before.', 'first time beginner new start'),
    ('/first-airshow-which-show', 'first-airshow-which-show.html', PLAN, 'Which Airshow Suits You?', 'Seafront or airfield, big or small. How to pick the right show for you.', 'which choose suits pick'),
    ('/first-airshow-getting-there', 'first-airshow-getting-there.html', PLAN, 'Getting To An Airshow', 'Driving, parking, park and ride, trains and buses.', 'getting there parking park and ride travel train bus taxi'),
    ('/first-airshow-where-to-watch', 'first-airshow-where-to-watch.html', PLAN, 'Where To Watch An Airshow', 'Crowd line, enclosures and the best spots to sit.', 'where to watch crowd line seats enclosure view'),
    ('/first-airshow-what-to-pack', 'first-airshow-what-to-pack.html', PLAN, 'What To Pack For An Airshow', 'My packing list, from chairs to ear defenders.', 'pack packing list bring chairs ear defenders'),
    ('/airshow-security', 'airshow-security.html', PLAN, 'Airshow Security And Bag Searches', 'What happens at the gate and how to pack for quicker checks.', 'security bag search gate banned items'),
    ('/airshow-questions', 'questions-and-answers.html', PLAN, 'Airshow Questions And Answers', 'Straight answers to the questions people ask most, sorted by topic.', 'questions answers faq q&a ask help'),
    ('/foodanddrinkatairshows', 'food-and-drink.html', PLAN, 'Food And Drink At Airshows', 'What to eat, what it costs and whether to take a picnic.', 'food drink picnic eat'),

    ('/airshow-photography-hub', 'photography-hub.html', PHOTO, 'Airshow Photography Hub', 'Camera settings, kit and photo tools for airshows.', 'photography camera settings lens shutter speed kit'),

    ('/camping-at-airshows', 'camping-hub.html', STAY, 'Camping At Airshows', 'Campsites near the shows and what to take.', 'camping campsite tent caravan motorhome'),
    ('/first-airshow-accommodation', 'first-airshow-accommodation.html', STAY, 'Where To Stay For An Airshow', 'Hotels, B&Bs and when to book.', 'accommodation hotel stay overnight book'),

    ('/bus-route', 'bus-routes/index.html', TRAVEL, 'Bus Route Maps', 'Every bus to the shows, with the roads it takes and where to get off.', 'bus buses route map timetable stop'),
    ('/airshow-public-transport', 'public-transport.html', TRAVEL, 'Public Transport To UK Airshows', 'Every bus and train route page, sorted by show, with a town search.', 'public transport bus train route town no car'),
    ('/train-to-swansea', 'train-routes/wales.html', TRAVEL, 'Train To Swansea', 'Transport for Wales and GWR trains to Swansea for the Wales Airshow.', 'train rail Swansea Wales GWR Transport for Wales station'),
    ('/train-to-clacton', 'train-routes/clacton.html', TRAVEL, 'Train To Clacton', 'Greater Anglia trains to Clacton for the air show.', 'train rail Clacton Greater Anglia station'),
    ('/train-to-eastbourne', 'train-routes/eastbourne.html', TRAVEL, 'Train To Eastbourne', 'Southern trains to Eastbourne for Airbourne.', 'train rail Eastbourne Southern station Airbourne'),
    ('/train-to-cosford', 'train-routes/cosford.html', TRAVEL, 'Train To Cosford', 'West Midlands Railway trains to Cosford for the air show.', 'train rail Cosford West Midlands Railway station'),

    ('/my-airshow-hub', 'my-airshow-hub.html', COMMUNITY, 'My Airshow Hub', 'Log in to plan your shows, save aircraft and follow show day updates.', 'hub log in login sign up members planner checklist account'),
    ('/my-airshow-hub?p=forum', 'forum-clean.html', COMMUNITY, 'Airshow Forum', 'Ask questions and chat with other visitors.', 'forum chat questions members community'),
    ('/groups', 'groups-header.html', COMMUNITY, 'Airshow Groups', 'A group for every show.', 'groups community'),
    ('/youtube', 'youtube.html', COMMUNITY, 'Airshow Videos', 'My airshow videos, sorted by show.', 'youtube videos watch'),
    ('/airshow-traders', 'traders/directory.html', COMMUNITY, 'Airshow Traders', 'Small businesses you can find at the shows.', 'traders stalls shop merch businesses'),

    ('/', None, SITE, 'Home', 'The front page of the guide.', 'home start'),
    ('/meettheteam', None, SITE, 'Meet The Team', 'Who is behind the guide.', 'team about Jack'),
    ('/contact-us', 'contact.html', SITE, 'Contact Us', 'Get in touch with a question or a correction.', 'contact email message'),
    ('/advertise-with-us', None, SITE, 'Advertise With Us', 'Advertising for businesses and shows.', 'advertise advertising sponsor organisers'),
    ('/policies', 'policies.html', SITE, 'Privacy, Cookies And Terms', 'How the site uses your data, plus the terms.', 'privacy cookies terms policy copyright'),
]

# headings that turn up on most pages and would only add noise to the results
NOISE = re.compile(r'^(useful links|our view|my view|key details|quick answers|back to|contents|on this page|more air shows|visitor guides)$', re.I)


def meta(file):
    soup = BeautifulSoup((ROOT / file).read_text(encoding='utf-8'), 'html.parser')
    m = soup.find('meta', attrs={'name': 'description'})
    return m.get('content', '').strip() if m else ''


def headings(file):
    if not file:
        return []
    path = ROOT / file
    if not path.exists():
        print('  missing file', file)
        return []
    html = path.read_text(encoding='utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    # titles held in page scripts (the photography and camping hubs build their guide cards from these)
    scripted = []
    for sc in soup.find_all('script'):
        scripted += re.findall(r"\b(?:t|title|name|h)\s*:\s*'([A-Z][^'<>]{3,60})'", sc.get_text())
    for t in soup(['script', 'style', 'noscript', 'svg']):
        t.decompose()
    titled = soup.find_all(class_=re.compile(r'(title|head)$'))
    seen, out = set(), []
    for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'summary']) + titled + scripted:
        raw = h if isinstance(h, str) else h.get_text(' ', strip=True)
        text = re.sub(r'\s+', ' ', raw).strip(' :')
        if not text or len(text) > 70 or len(text) < 3 or NOISE.match(text):
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(text)
    return out[:150]


def main():
    rows = []
    for path, file, group, title, line, extra in PAGES:
        h = headings(file)
        if line is None:
            line = meta(file)
        rows.append({'u': path, 't': title, 'g': group, 'd': line, 'a': extra, 'h': h})
        print(f'{title}: {len(h)} headings')
    data = json.dumps(rows, ensure_ascii=False, separators=(',', ':'))
    engine = (ROOT / 'search' / 'engine.js').read_text(encoding='utf-8')
    out = ('/* Built by tools-search.py from the pages in this repository. Do not edit by hand. */\n'
           'window.UKAG_SEARCH_PAGES=' + data + ';\n' + engine)
    (ROOT / 'search' / 'index.js').write_text(out, encoding='utf-8')
    print('search/index.js', len(out), 'bytes,', len(rows), 'pages')


if __name__ == '__main__':
    main()
