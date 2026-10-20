"""Refresh youtube/videos.json from The Big Guide to UK Airshows YouTube channel.
Run by .github/workflows/youtube.yml every hour. Uses only the Python standard library.
Each video is sorted into an airshow and a topic from words in its title and description."""
import json, re, sys, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path

CHANNEL_ID = "UCGt8_hVgYLr69ZfQAWOVY3w"
FEED = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
OUT = Path(__file__).parent / "youtube" / "videos.json"
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015",
      "media": "http://search.yahoo.com/mrss/"}

# keys match the show keys in links.js
SHOWS = [
    ("riat", r"\briat\b|air tattoo|fairford"),
    ("raf-cosford", r"cosford"),
    ("duxford", r"duxford"),
    ("shuttleworth", r"shuttleworth|old warden"),
    ("little-gransden", r"gransden"),
    ("eastbourne", r"eastbourne|airbourne"),
    ("clacton", r"clacton"),
    ("wales", r"wales air|swansea"),
    ("midlands", r"midlands air|ragley"),
    ("blackpool", r"blackpool"),
    ("southport", r"southport"),
    ("ayr", r"\bayr\b|ayr show"),
    ("headcorn", r"headcorn"),
]
TOPICS = [
    ("arrivals", r"arrival|departure|arrive|depart|inbound|spotting"),
    ("camping", r"camp|tent|pitch|campsite"),
    ("photo", r"photo|camera|lens|settings|shutter|nikon|canon|panning|prop blur|propeller"),
    ("planning", r"guide|plan|tips|parking|ticket|how to|first time|introduction|what to (bring|pack)|cancel"),
]

def classify(text, table, default):
    t = text.lower()
    for key, pat in table:
        if re.search(pat, t):
            return key
    return default

def main():
    req = urllib.request.Request(FEED, headers={"User-Agent": "airshow-pages/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        root = ET.fromstring(r.read())
    old = {}
    if OUT.exists():
        try:
            old = {v["id"]: v for v in json.loads(OUT.read_text())["videos"]}
        except Exception:
            old = {}
    vids = []
    for e in root.findall("a:entry", NS):
        vid = e.findtext("yt:videoId", namespaces=NS)
        title = (e.findtext("a:title", namespaces=NS) or "").strip()
        desc = (e.findtext("media:group/media:description", namespaces=NS) or "").strip()
        stats = e.find("media:group/media:community/media:statistics", NS)
        views = int(stats.get("views", 0)) if stats is not None else 0
        prev = old.get(vid, {})
        vids.append({
            "id": vid,
            "title": title,
            "published": (e.findtext("a:published", namespaces=NS) or "")[:10],
            "summary": desc.split("\n")[0][:220],
            "views": views,
            # a hand-set show or topic in videos.json is kept (set "fixed": true on that video)
            # sorted by the title only, as most descriptions mention RIAT and the channel's other videos
            "show": prev["show"] if prev.get("fixed") else classify(title, SHOWS, "all"),
            "topic": prev["topic"] if prev.get("fixed") else classify(title, TOPICS, "showday"),
            "fixed": bool(prev.get("fixed")),
            "short": "/shorts/" in (e.find("a:link", NS).get("href", "") if e.find("a:link", NS) is not None else ""),
        })
    # the feed holds the newest 15; keep older ones we already know about
    seen = {v["id"] for v in vids}
    vids += [v for v in old.values() if v["id"] not in seen]
    vids.sort(key=lambda v: v["published"], reverse=True)
    OUT.parent.mkdir(exist_ok=True)
    new = json.dumps({"channel": CHANNEL_ID, "videos": vids}, indent=1, ensure_ascii=False)
    if not OUT.exists() or OUT.read_text() != new:
        OUT.write_text(new)
        print(f"updated: {len(vids)} videos")
    else:
        print("no change")

if __name__ == "__main__":
    sys.exit(main())
