"""Builds previews/hub-login-demo.html: a working copy of my-airshow-hub.html with example data,
so the Log Out, Log In, enter question and welcome back screens can be tried without Wix.
Run: python3 tools-hub-demo.py"""
src = open('my-airshow-hub.html', encoding='utf-8').read()
a = 'window.parent.postMessage({ source: "ukag-hub"'
assert src.count(a) == 2
s = src.replace(a, 'ukagDemo({ source: "ukag-hub"')

demo = r'''
<!-- Working preview only: stands in for the Wix page code with example data. Not used on the live site. -->
<script>
(function () {
  /* logged in or out is remembered, so after Log Out the hub always opens on the logged out page */
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  if (/start=out/.test(location.search)) put("ukagDemoIn", "0");
  if (/start=in/.test(location.search)) put("ukagDemoIn", "1");
  var state = { in: get("ukagDemoIn") !== "0" };
  var embedded = window.parent !== window;
  function go(page) { if (embedded) window.parent.postMessage({ ukagDemoGo: page }, "*"); }
  /* links that leave the hub: inside the flow preview they switch the view instead */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href") || "";
    if (!/ukairshowguide\.co\.uk/.test(h)) return;
    if (/community-forum|\/forum/.test(h)) {
      e.preventDefault();
      /* the forum lives inside the hub: logged out visitors are asked to log in first */
      if (!state.in) { var b = document.getElementById("lgNavLogin"); if (b) b.click(); }
      else go("forum");
      return;
    }
    if (embedded) { e.preventDefault(); go(/my-airshow-hub/.test(h) ? "hub" : "home"); }
  }, true);
  /* the flow preview's header can ask the hub to log in or out */
  function act() {
    var m = location.search.match(/act=(login|logout)/); if (!m) return;
    var tries = 0, t = setInterval(function () {
      tries++;
      var app = document.getElementById("app"), guest = document.getElementById("guest");
      if (m[1] === "logout" && app && !app.hidden) { clearInterval(t); document.getElementById("hubLogout").click(); }
      if (m[1] === "login" && guest && !guest.hidden) { clearInterval(t); document.getElementById("lgNavLogin").click(); }
      if (tries > 60) clearInterval(t);
    }, 150);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", act); else act();
  var shows = [
    { slug: "raf-cosford", name: "RAF Cosford Air Show", shortName: "Cosford", link: "", dateText: "Sunday 13 June 2027", dateStatus: "Confirmed", gatesOpen: "08:00", start: "2027-06-13T08:00:00.000Z", end: "2027-06-13T18:00:00.000Z" },
    { slug: "riat", name: "Royal International Air Tattoo", shortName: "RIAT", link: "", dateText: "16 to 18 July 2027", dateStatus: "Confirmed", gatesOpen: "07:00", start: "2027-07-16T07:00:00.000Z", end: "2027-07-18T18:00:00.000Z" }
  ];
  function hub() {
    if (!state.in) return { member: null, shows: shows };
    return {
      member: { id: "demo", name: "Jack Skedge", colour: "#32B4AF", bio: "", area: "Essex", joined: "2026-06-01T10:00:00.000Z", badges: [{ icon: "19", label: "Shows Attended" }, { icon: "★", label: "RIAT Regular", gold: true }] },
      shows: shows, trips: [], mustSee: [], lineup: [], updates: [], unread: 0, reminders: [], weather: {},
      notify: { lineup: true, mustSeeOnly: false, news: true, travel: true, social: true },
      past: [], posts: [], photos: [], following: [], groups: [], going: [], saved: [], photoOfWeek: null
    };
  }
  function send(m) { window.postMessage(m, "*"); }
  function loginBox(mode, id) {
    var box = document.createElement("div");
    box.id = "demoLogin";
    box.innerHTML = '<div><span>Preview of the Wix members window</span><b>' + (mode === "signup" ? "Sign up" : "Log in") + '</b><p>On the live site this is where you log in with your email, Google or Facebook.</p><button type="button" class="ok">' + (mode === "signup" ? "Create my free account" : "Log in as Jack") + '</button><button type="button" class="no">Close</button></div>';
    document.body.appendChild(box);
    box.querySelector(".ok").onclick = function () { box.remove(); state.in = true; put("ukagDemoIn", "1"); put("ukagDemoOut", "0"); send({ source: "ukag-hub", event: "refresh" }); };
    box.querySelector(".no").onclick = function () { box.remove(); };
  }
  window.ukagDemo = function (m) {
    setTimeout(function () {
      var out = { source: "ukag-hub", id: m.id, ok: true, data: {} };
      if (m.action === "ready") out.data = { join: "", pageUrl: location.href, loggedOut: !state.in && get("ukagDemoOut") === "1" };
      else if (m.action === "getHub") out.data = hub();
      else if (m.action === "login" || m.action === "signup") { out.data = { prompted: true }; loginBox(m.action, m.id); }
      else if (m.action === "logout") { state.in = false; put("ukagDemoIn", "0"); put("ukagDemoOut", "1"); out.data = { loggedOut: true }; }
      else if (m.action === "go") out.data = {};
      else { out.ok = false; out.error = "This part needs the live site. The preview only shows logging in and out."; }
      send(out);
    }, 350);
  };
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
assert s.count('</head>') == 1
s = s.replace('</head>', demo + '</head>', 1)
s = s.replace('</body>', '<div id="demoBar">Working preview with example data. Try Log Out, then Log In.</div>\n<script>if (window.parent !== window) document.getElementById("demoBar").remove();</script>\n</body>', 1)
open('previews/hub-login-demo.html', 'w', encoding='utf-8').write(s)
print('ok', len(s))
