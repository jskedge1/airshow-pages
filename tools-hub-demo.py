"""Builds previews/hub-login-demo.html: a working copy of my-airshow-hub.html with example data,
used by previews/airshow-hub-flow.html to try the whole visitor journey without Wix.

The interface upgrades were previewed here first and went into my-airshow-hub.html itself on
21 Oct 2026, so this file now only swaps the Wix page code for example data.
Run: python3 tools-hub-demo.py"""

src = open('my-airshow-hub.html', encoding='utf-8').read()
s = src


def rep(old, new, count=1):
    global s
    assert s.count(old) == count, ('patch anchor not found', old[:80], s.count(old))
    s = s.replace(old, new)


# ---------------------------------------------------------------------------
# Preview only: talk to the example data below instead of the Wix page code
# ---------------------------------------------------------------------------
rep('window.parent.postMessage({ source: "ukag-hub"', 'ukagDemo({ source: "ukag-hub"', 2)

# ---------------------------------------------------------------------------
# Preview only: example data and a stand in for the Wix members window
# ---------------------------------------------------------------------------
demo = r'''
<!-- Working preview only: stands in for the Wix page code with example data. Not used on the live site. -->
<script>
(function () {
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function getJ(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function putJ(k, v) { put(k, JSON.stringify(v)); }
  if (/start=out/.test(location.search)) put("ukagDemoIn", "0");
  if (/start=in/.test(location.search)) put("ukagDemoIn", "1");
  var state = { in: get("ukagDemoIn") !== "0" };
  var embedded = window.parent !== window;
  function go(page) { if (embedded) window.parent.postMessage({ ukagDemoGo: page }, "*"); }
  var nx = location.search.match(/next=(\w+)/); if (nx) window.ukagNext = nx[1];

  /* example shows: dates are examples for the preview */
  var shows = [
    ["riat", "Royal International Air Tattoo", "RIAT", "2027-07-16", "2027-07-18", "07:00"],
    ["cosford", "RAF Cosford Air Show", "Cosford", "2027-06-13", "2027-06-13", "08:00"],
    ["eastbourne", "Airbourne: Eastbourne International Airshow", "Eastbourne", "2027-08-12", "2027-08-15", "10:00"],
    ["duxford", "IWM Duxford Air Shows", "Duxford", "2027-05-22", "2027-05-23", "09:00"],
    ["shuttleworth", "Shuttleworth Air Shows", "Shuttleworth", "2027-06-06", "2027-06-06", "09:00"],
    ["clacton", "Clacton Airshow", "Clacton", "2027-08-26", "2027-08-27", "10:00"],
    ["southport", "Southport Air Show", "Southport", "2027-09-04", "2027-09-05", "10:00"],
    ["blackpool", "Blackpool Air Show", "Blackpool", "2027-08-14", "2027-08-15", "10:00"]
  ].map(function (r) { return { slug: r[0], name: r[1], shortName: r[2], link: "", dateText: new Date(r[3]).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), dateStatus: "Example", gatesOpen: r[5], start: r[3] + "T08:00:00.000Z", end: r[4] + "T18:00:00.000Z" }; });

  function trips() { return getJ("ukagDemoTrips", []); }
  function updates() { return getJ("ukagDemoUpdates", []); }
  function hub() {
    if (!state.in) return { member: null, shows: shows };
    var u = updates();
    return {
      member: { id: "demo", name: "Jack Skedge", colour: "#32B4AF", bio: "", area: get("ukagArea") || "", joined: "2026-06-01T10:00:00.000Z", badges: [{ icon: "19", label: "Shows Attended" }, { icon: "★", label: "RIAT Regular", gold: true }] },
      shows: shows, trips: trips(), mustSee: [], lineup: [], updates: u, unread: u.filter(function (x) { return !x.read; }).length, reminders: [], weather: {},
      notify: { lineup: true, mustSeeOnly: false, news: true, travel: true, social: true },
      past: [], posts: [], photos: [], following: [], groups: [], going: [], saved: [], photoOfWeek: null
    };
  }
  function addTrip(p) {
    var sh = shows.filter(function (x) { return x.slug === p.showSlug; })[0];
    if (!sh) throw new Error("Choose one of the shows in the list.");
    var t = { id: "t" + Date.now() + Math.random().toString(36).slice(2, 6), showSlug: sh.slug, showName: sh.name, start: sh.start, end: sh.end, travel: "", gatesOpen: sh.gatesOpen, budgetLimit: 0, budget: [], timeline: [], todo: [{ id: "a", t: "Book tickets", d: "Early tickets are usually cheaper", done: false }, { id: "b", t: "Plan travel", d: "Book trains early for the best fares", done: false }, { id: "c", t: "Pack ear defenders", d: "For the jets", done: false }, { id: "d", t: "Read the show rules", d: "Chairs, drones and bag rules change", done: false }], packing: { mode: "day", checked: [], extra: [] }, groupCode: "" };
    var all = trips(); all.push(t); all.sort(function (a, b) { return a.start.localeCompare(b.start); }); putJ("ukagDemoTrips", all);
    var u = updates(); u.unshift({ id: "u" + t.id, kind: "lineup", heading: sh.shortName + " line up updated", body: "Two aircraft were added to the " + sh.shortName + " line up since you saved it.", showSlug: sh.slug, link: "", read: false, created: new Date().toISOString() }); putJ("ukagDemoUpdates", u);
    return t;
  }
  function send(m) { window.postMessage(m, "*"); }
  function loginBox(mode) {
    var box = document.createElement("div");
    box.id = "demoLogin";
    box.innerHTML = '<div><span>Preview of the Wix members window</span><b>' + (mode === "signup" ? "Sign up" : "Log in") + '</b><p>On the live site this is where you ' + (mode === "signup" ? "join" : "log in") + ' with your email, Google or Facebook.</p><button type="button" class="ok">' + (mode === "signup" ? "Create my free account" : "Log in as Jack") + '</button><button type="button" class="no">Close</button></div>';
    document.body.appendChild(box);
    box.querySelector(".ok").onclick = function () {
      box.remove(); state.in = true; put("ukagDemoIn", "1"); put("ukagDemoOut", "0");
      if (mode === "signup") { putJ("ukagDemoTrips", []); putJ("ukagDemoUpdates", []); try { localStorage.removeItem("ukagA2HS"); } catch (e) {} }
      send({ source: "ukag-hub", event: "refresh" });
    };
    box.querySelector(".no").onclick = function () { box.remove(); send({ source: "ukag-hub", event: "loginCancelled" }); };
  }
  window.ukagDemo = function (m) {
    setTimeout(function () {
      var out = { source: "ukag-hub", id: m.id, ok: true, data: {} };
      try {
        if (m.action === "ready") out.data = { join: "", pageUrl: location.href, loggedOut: !state.in && get("ukagDemoOut") === "1" };
        else if (m.action === "getHub") out.data = hub();
        else if (m.action === "login" || m.action === "signup") { out.data = { prompted: true }; loginBox(m.action); }
        else if (m.action === "logout") { state.in = false; put("ukagDemoIn", "0"); put("ukagDemoOut", "1"); out.data = { loggedOut: true }; }
        else if (m.action === "addTrip") out.data = addTrip(m.payload || {});
        else if (m.action === "saveTrip") { var all = trips(); all.forEach(function (t) { if (t.id === (m.payload || {}).id) Object.assign(t, (m.payload || {}).changes || {}); }); putJ("ukagDemoTrips", all); out.data = {}; }
        else if (m.action === "markUpdatesRead") { putJ("ukagDemoUpdates", updates().map(function (u) { u.read = true; return u; })); out.data = {}; }
        else if (m.action === "go") out.data = {};
        else { out.ok = false; out.error = "This part needs the live site. The preview shows logging in, setting up and the forum."; }
      } catch (err) { out.ok = false; out.error = err.message; }
      send(out);
    }, m.action === "getHub" ? 650 : 300);
  };

  /* links that leave the hub: inside the flow preview they switch the view instead */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href") || "";
    if (!/ukairshowguide\.co\.uk/.test(h)) return;
    if (/community-forum|\/forum/.test(h)) {
      e.preventDefault();
      /* the forum lives inside the hub: logged out visitors log in first, then land in the forum */
      window.ukagNext = "forum";
      if (!state.in) { var b = document.getElementById("lgNavLogin"); if (b) b.click(); }
      else if (window.ukagShowPage) window.ukagShowPage("forum");
      return;
    }
    if (embedded) { e.preventDefault(); go(/my-airshow-hub/.test(h) ? "hub" : "home"); }
  }, true);
  /* the flow preview's header can ask the hub to log in, log out or open a page */
  function act() {
    var m = location.search.match(/act=(login|logout)/), p = location.search.match(/[?&]p=(\w+)/);
    if (!m && !p) return;
    var tries = 0, t = setInterval(function () {
      tries++;
      var app = document.getElementById("app"), guest = document.getElementById("guest");
      if (m && m[1] === "logout" && app && !app.hidden) { clearInterval(t); document.getElementById("hubLogout").click(); }
      if (m && m[1] === "login" && guest && !guest.hidden) { clearInterval(t); document.getElementById("lgNavLogin").click(); }
      if (!m && p && app && !app.hidden && window.ukagShowPage) { clearInterval(t); window.ukagShowPage(p[1]); }
      if (tries > 80) clearInterval(t);
    }, 150);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", act); else act();
})();
</script>
<style>
#demoBar{position:fixed;left:0;right:0;bottom:0;z-index:95;background:#6950A1;color:#fff;font:600 15px "Barlow",Arial,sans-serif;padding:10px 16px;text-align:center}
#demoLogin{position:fixed;inset:0;z-index:96;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.6);font-family:"Barlow",Arial,sans-serif}
#demoLogin>div{width:min(420px,100%);background:#fff;color:#13293C;padding:26px;display:grid;gap:12px}
#demoLogin span{font-size:14px;color:#41586B}
#demoLogin b{font-size:28px;font-weight:800}
#demoLogin p{font-size:16px;line-height:1.5;margin:0}
#demoLogin button{font:700 16px "Barlow",Arial,sans-serif;padding:12px 18px;border:2px solid #13293C;cursor:pointer}
#demoLogin .ok{background:#13293C;color:#fff}
#demoLogin .no{background:#fff;color:#13293C}
</style>
'''
rep('</head>', demo + '</head>')
rep('</body>', '<div id="demoBar">Working preview with example data. Try Log Out, then Log In.</div>\n<script>if (window.parent !== window) document.getElementById("demoBar").remove();</script>\n</body>')

open('previews/hub-login-demo.html', 'w', encoding='utf-8').write(s)
print('ok', len(s))
