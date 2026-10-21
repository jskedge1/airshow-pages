"""Builds previews/hub-login-demo.html: a working copy of my-airshow-hub.html with example data,
used by previews/airshow-hub-flow.html to try the whole visitor journey without Wix.

The PATCHES below are the interface upgrades being previewed (21 Oct 2026). They only change the
preview copy. Once Jack approves them, the same patches go into my-airshow-hub.html itself.
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
# 1. Ask "Ready to enter your hub?" only once per visit
# ---------------------------------------------------------------------------
rep('''  function askEnter() {
    fx("lock");''', '''  function askEnter() {
    var asked = false; try { asked = sessionStorage.getItem("ukagAsked") === "1"; } catch (e) {}
    if (asked) { window.ukagWB = Date.now(); window.ukagWBJoin = false; takeOff("in"); return; }
    fx("lock");''')
rep('$("lgAskY").addEventListener("click", function () { closeAsk();',
    '$("lgAskY").addEventListener("click", function () { try { sessionStorage.setItem("ukagAsked", "1"); } catch (e) {} closeAsk();')

# ---------------------------------------------------------------------------
# 2. Lighter repeat visits: quick typing, start up sound only if they left it on
# ---------------------------------------------------------------------------
rep('''  function go() { G.classList.remove("lg-go"); void G.offsetWidth; G.classList.add("lg-go"); tryIntro(); }''',
    '''  var seen = false; try { seen = localStorage.getItem("ukagHubSeen") === "1"; localStorage.setItem("ukagHubSeen", "1"); } catch (e) {}
  var savedSound = null; try { savedSound = localStorage.getItem("ukagSound"); } catch (e) {}
  if (seen) G.classList.add("lg-quick");
  function go() { G.classList.remove("lg-go"); void G.offsetWidth; G.classList.add("lg-go"); tryIntro(); }''')
rep('''  function setSound(on) { soundOn = on;''',
    '''  function setSound(on, keep) { if (!keep) { try { localStorage.setItem("ukagSound", on ? "on" : "off"); } catch (e) {} } soundOn = on;''')
rep('''  function tryIntro() {
    if (introDone) return;''', '''  function tryIntro() {
    if (introDone) return;
    if (savedSound === "off") { introDone = true; return; }
    if (seen) { setTimeout(function () { try { intro.pause(); } catch (e) {} }, 1600); }''')

# ---------------------------------------------------------------------------
# 3. No flicker: a HUD start up panel while the hub checks who you are
# ---------------------------------------------------------------------------
rep('<div id="loading" class="loading"><div class="spin"></div>Loading your hub</div>',
    '<div id="loading" class="loading hud-boot" role="status"><div class="hb-ring" aria-hidden="true"><i></i></div><b>MY AIRSHOW HUB</b><p>&gt; CHECKING YOUR PASS<span aria-hidden="true">_</span></p></div>')

# ---------------------------------------------------------------------------
# 4. Signing off with an "Oops, stay logged in" button
# ---------------------------------------------------------------------------
rep('<b>SIGNING OFF</b><p>&gt; CLOSING YOUR SESSION. SEE YOU AT THE NEXT SHOW</p><i></i></div></div>',
    '<b>SIGNING OFF</b><p>&gt; CLOSING YOUR SESSION. SEE YOU AT THE NEXT SHOW</p><i></i><button type="button" id="hubSOStay">Oops, stay logged in</button></div></div>')
rep('''    call("logout").then(finish, function (err) {
      so.hidden = true;
      say((err && err.message) || "You could not be logged out just now. Please try again.", true);
    });''', '''    var stay = $("hubSOStay"); stay.hidden = false; stay.focus();
    var timer = setTimeout(function () {
      stay.hidden = true;
      call("logout").then(finish, function (err) {
        so.hidden = true;
        say((err && err.message) || "You could not be logged out just now. Please try again.", true);
      });
    }, 2200);
    stay.onclick = function () { clearTimeout(timer); so.hidden = true; say("No problem, you are still logged in."); };''')
rep('''        load();
      }, 1700);''', '''        load();
      }, 500);''')

# ---------------------------------------------------------------------------
# 5. Forum as a hub tab, and land where you were heading after logging in
# ---------------------------------------------------------------------------
rep('<a class="hub-forum" href="https://www.ukairshowguide.co.uk/community-forum" target="_top">',
    '<a class="hub-forum" href="#forum" id="hubForumTab" role="button">')
rep('<main class="page" id="p-posts" hidden>',
    '''<main class="page" id="p-forum" hidden>
    <div class="wrap hub-forum-wrap">
      <iframe id="hubForumFrame" title="Airshow Forum" data-src="https://jskedge1.github.io/airshow-pages/forum.html" loading="lazy"></iframe>
    </div>
  </main>

  <main class="page" id="p-posts" hidden>''')
rep('["overview", "briefing", "trips", "showday", "updates", "community", "kit", "group", "hangar", "saved", "history", "year", "posts"]',
    '["overview", "briefing", "trips", "showday", "updates", "community", "kit", "group", "hangar", "saved", "history", "year", "posts", "forum"]')
rep('''    showPage("overview");
    w.classList.remove("go"); w.hidden = false;
    setTimeout(function () { w.classList.add("go"); setTimeout(function () { w.hidden = true; w.classList.remove("go"); }, 650); }, 3400);''',
    '''    var next = window.ukagNext || "overview"; window.ukagNext = null;
    showPage(next);
    w.classList.remove("go"); w.hidden = false;
    setTimeout(function () { w.classList.add("go"); setTimeout(function () { w.hidden = true; w.classList.remove("go"); afterWelcome(); }, 650); }, 3400);''')

# extra hub code: forum tab, quick hello, new member setup, home screen card, phone tab bar, friendly messages
rep('''  /* big welcome back screen after logging in''', r'''  /* ---------- interface upgrades (preview) ---------- */
  function openForum() {
    var f = $("hubForumFrame");
    if (!f.src) {
      f.src = f.dataset.src;
      /* links inside the forum that point back to the hub stay inside the hub */
      f.addEventListener("load", function () {
        var d; try { d = f.contentDocument; } catch (e) { return; }
        if (!d) return;
        d.addEventListener("click", function (e) {
          var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
          if (/my-airshow-hub/.test(a.getAttribute("href") || "")) { e.preventDefault(); showPage("overview"); }
        }, true);
      });
    }
  }
  $("hubForumTab").addEventListener("click", function (e) { e.preventDefault(); showPage("forum"); });
  window.ukagShowPage = function (p) { if (S.hub && S.hub.member) showPage(p); };

  function nextTrip() {
    var now = Date.now();
    return (S.hub && S.hub.trips || []).filter(function (t) { return t.start && new Date(t.start).getTime() > now; })
      .sort(function (a, b) { return a.start.localeCompare(b.start); })[0];
  }
  function daysTo(iso) { return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)); }

  /* returning members who are still signed in get a short hello instead of the big screen */
  function quickHello() {
    var h = $("hubHello"), t = nextTrip(), first = (S.hub.member.name || "").split(" ")[0];
    $("hubHelloT").textContent = "Welcome back, " + first;
    $("hubHelloP").textContent = t ? t.showName + " is " + daysTo(t.start) + " days away." + (S.hub.unread ? " You have " + S.hub.unread + " new update" + (S.hub.unread > 1 ? "s" : "") + "." : "")
      : "Add the shows you are going to and your countdowns start here.";
    h.hidden = false; h.classList.remove("out");
    clearTimeout(quickHello.t); quickHello.t = setTimeout(function () { h.classList.add("out"); setTimeout(function () { h.hidden = true; }, 500); }, 5200);
  }
  $("hubHelloX").addEventListener("click", function () { $("hubHello").hidden = true; });

  function afterWelcome() {
    if (window.ukagWBJoin) { window.ukagWBJoin = false; setupStart(); return; }
    homeCard();
  }

  /* new member setup: three taps so the dashboard is full from the first minute */
  var SET = { shows: [], style: "", area: "" };
  function setupStart() {
    var box = clear($("suShows"));
    (S.hub.shows || []).forEach(function (sh) {
      var b = el("button", "su-chip", sh.shortName); b.type = "button"; b.setAttribute("aria-pressed", "false");
      b.onclick = function () { var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); var i = SET.shows.indexOf(sh.slug); if (on && i < 0) SET.shows.push(sh.slug); if (!on && i >= 0) SET.shows.splice(i, 1); };
      box.appendChild(b);
    });
    setupStep(1); $("hubSetup").hidden = false;
  }
  function setupStep(n) {
    [1, 2, 3].forEach(function (k) { $("su" + k).hidden = k !== n; });
    $("suBar").style.width = (n / 3 * 100) + "%"; $("suStep").textContent = "Step " + n + " of 3";
    $("suBack").hidden = n === 1; $("suNext").textContent = n === 3 ? "Finish my hub" : "Next";
    $("hubSetup").dataset.step = n;
  }
  document.querySelectorAll("#hubSetup [data-pick]").forEach(function (b) {
    b.addEventListener("click", function () {
      var grp = b.dataset.pick; SET[grp] = b.dataset.v;
      document.querySelectorAll('#hubSetup [data-pick="' + grp + '"]').forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  });
  $("suBack").addEventListener("click", function () { setupStep(+$("hubSetup").dataset.step - 1); });
  $("suSkip").addEventListener("click", function () { $("hubSetup").hidden = true; homeCard(); });
  $("suNext").addEventListener("click", function () {
    var n = +$("hubSetup").dataset.step;
    if (n < 3) { setupStep(n + 1); return; }
    var btn = $("suNext"); btn.disabled = true; btn.textContent = "Setting up your hub";
    try { localStorage.setItem("ukagStyle", SET.style); localStorage.setItem("ukagArea", SET.area); } catch (e) {}
    var chain = Promise.resolve();
    SET.shows.forEach(function (slug) { chain = chain.then(function () { return call("addTrip", { showSlug: slug }).catch(function () {}); }); });
    chain.then(load).then(function () {
      $("hubSetup").hidden = true; btn.disabled = false;
      say(SET.shows.length ? "Your hub is ready. Your countdowns are on the dashboard." : "Your hub is ready.");
      showPage("overview"); homeCard();
    });
  });

  /* add to home screen, offered once after a member's first login */
  function homeCard() {
    var done = false; try { done = localStorage.getItem("ukagA2HS") === "1"; } catch (e) {}
    if (done) return;
    var ua = navigator.userAgent || "";
    $("a2hsP").textContent = /iPhone|iPad|iPod/.test(ua) ? "Tap the Share button, then Add to Home Screen. It opens like an app with the red jet icon."
      : /Android/.test(ua) ? "Open your browser menu, then Install app or Add to Home screen. It opens like an app with the red jet icon."
      : "On your phone, open My Airshow Hub, then choose Add to Home Screen from the browser menu. It opens like an app with the red jet icon.";
    setTimeout(function () { $("a2hs").hidden = false; }, 700);
  }
  function a2hsClose() { $("a2hs").hidden = true; try { localStorage.setItem("ukagA2HS", "1"); } catch (e) {} }
  $("a2hsOk").addEventListener("click", a2hsClose);
  $("a2hsNo").addEventListener("click", function () { $("a2hs").hidden = true; });

  /* phone tab bar, within thumb reach */
  document.querySelectorAll("#hubDock [data-dock]").forEach(function (b) {
    b.addEventListener("click", function () {
      var p = b.dataset.dock;
      if (p === "me") { $("hubMe").hidden = !$("hubMe").hidden; return; }
      $("hubMe").hidden = true; showPage(p);
    });
  });
  document.querySelectorAll("#hubMe [data-mep]").forEach(function (b) { b.addEventListener("click", function () { $("hubMe").hidden = true; showPage(b.dataset.mep); }); });
  $("hubMeOut").addEventListener("click", function () { $("hubMe").hidden = true; logOut(); });
  function dockSync(p) { document.querySelectorAll("#hubDock [data-dock]").forEach(function (b) { b.classList.toggle("on", b.dataset.dock === p || (b.dataset.dock === "me" && ["overview", "trips", "showday", "forum"].indexOf(p) < 0)); }); }

  /* friendly messages */
  window.addEventListener("offline", function () { say("You are offline. Your hub will catch up when your signal comes back.", true); });
  window.addEventListener("online", function () { say("Back online."); if (S.hub && S.hub.member) load(); });

  /* big welcome back screen after logging in''')

rep('''      if (window.ukagWB && Date.now() - window.ukagWB < 600000) { window.ukagWB = 0; welcomeBack(hub.member.name); }''',
    '''      if (window.ukagWB && Date.now() - window.ukagWB < 600000) { window.ukagWB = 0; welcomeBack(hub.member.name); }
      else if (!load.helloDone) quickHello();
      load.helloDone = true;
      document.body.classList.add("is-member");''')
rep('''      if (!hub.member) { $("guest").hidden = false; $("app").hidden = true; return; }''',
    '''      if (!hub.member) { load.helloDone = false; document.body.classList.remove("is-member"); $("guest").hidden = false; $("app").hidden = true; return; }''')
rep('''    if (p === "group") startChat(); else stopChat();''',
    '''    if (p === "group") startChat(); else stopChat();
    if (p === "forum") openForum();
    dockSync(p);''')
rep('''    if (m.event === "refresh") { load(); return; }''',
    '''    if (m.event === "refresh") { load(); return; }
    if (m.event === "loginCancelled") { say("No problem, the login window was closed. Press Log In when you are ready."); return; }''')

# ---------------------------------------------------------------------------
# markup and styles for the upgrades
# ---------------------------------------------------------------------------
EXTRA = r'''
<!-- Interface upgrades (preview, 21 Oct 2026) -->
<div class="hub-hello" id="hubHello" role="status" hidden><span class="hh-dot" aria-hidden="true"></span><div><b id="hubHelloT">Welcome back</b><p id="hubHelloP"></p></div><button type="button" id="hubHelloX" aria-label="Close">×</button></div>

<div class="hub-setup" id="hubSetup" role="dialog" aria-modal="true" aria-labelledby="suTitle" hidden>
  <div class="su-box">
    <div class="su-top"><span class="su-tag">New member setup</span><span id="suStep">Step 1 of 3</span></div>
    <i class="su-track"><em id="suBar"></em></i>
    <section id="su1"><h2 id="suTitle">WHICH SHOWS ARE YOU GOING TO?</h2><p>Pick as many as you like. Each one gets a countdown, a trip plan and line up alerts.</p><div class="su-chips" id="suShows"></div></section>
    <section id="su2" hidden><h2>HOW DO YOU LIKE YOUR AIRSHOW DAYS?</h2><p>I will put the tools that suit you first.</p><div class="su-opts">
      <button type="button" data-pick="style" data-v="family" aria-pressed="false"><b>Family day out</b><span>Kids, ear defenders, picnic spots and toilets</span></button>
      <button type="button" data-pick="style" data-v="photo" aria-pressed="false"><b>Photography</b><span>Sun position, camera settings and best spots</span></button>
      <button type="button" data-pick="style" data-v="fan" aria-pressed="false"><b>Big aviation fan</b><span>Line ups, rare aircraft and arrivals</span></button>
      <button type="button" data-pick="style" data-v="first" aria-pressed="false"><b>My first airshow</b><span>The basics, step by step</span></button>
    </div></section>
    <section id="su3" hidden><h2>WHERE ARE YOU TRAVELLING FROM?</h2><p>So travel times and the nearest shows make sense for you.</p><div class="su-chips">
      <button type="button" class="su-chip" data-pick="area" data-v="London and the South East" aria-pressed="false">London and the South East</button>
      <button type="button" class="su-chip" data-pick="area" data-v="East of England" aria-pressed="false">East of England</button>
      <button type="button" class="su-chip" data-pick="area" data-v="Midlands" aria-pressed="false">Midlands</button>
      <button type="button" class="su-chip" data-pick="area" data-v="North of England" aria-pressed="false">North of England</button>
      <button type="button" class="su-chip" data-pick="area" data-v="South West" aria-pressed="false">South West</button>
      <button type="button" class="su-chip" data-pick="area" data-v="Wales" aria-pressed="false">Wales</button>
      <button type="button" class="su-chip" data-pick="area" data-v="Scotland" aria-pressed="false">Scotland</button>
    </div></section>
    <div class="su-foot"><button type="button" class="su-skip" id="suSkip">Skip for now</button><span></span><button type="button" class="su-back" id="suBack" hidden>Back</button><button type="button" class="su-next" id="suNext">Next</button></div>
  </div>
</div>

<div class="a2hs" id="a2hs" role="dialog" aria-labelledby="a2hsT" hidden><img src="https://jskedge1.github.io/airshow-pages/hub-img/red-arrows-hawk.webp" alt=""><div><b id="a2hsT">Add My Airshow Hub to your home screen</b><p id="a2hsP"></p><div class="a2hs-b"><button type="button" id="a2hsOk">Got it</button><button type="button" id="a2hsNo">Not now</button></div></div></div>

<nav class="hub-dock" id="hubDock" aria-label="Hub">
  <button type="button" data-dock="overview" class="on"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg>Overview</button>
  <button type="button" data-dock="trips"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15l7-1 5-9h2l-2 9 5 1-1 2-5-1-4 6H8l2-6-6 1z"/></svg>Trips</button>
  <button type="button" data-dock="showday"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>Show Day</button>
  <button type="button" data-dock="forum"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>Forum</button>
  <button type="button" data-dock="me"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>Me</button>
</nav>
<div class="hub-me" id="hubMe" hidden>
  <button type="button" data-mep="briefing">Flight Briefing</button><button type="button" data-mep="updates">Updates</button><button type="button" data-mep="community">Community</button><button type="button" data-mep="kit">Kit And Packing</button><button type="button" data-mep="group">My Group</button><button type="button" data-mep="hangar">My Hangar</button><button type="button" data-mep="saved">Saved Tools</button><button type="button" data-mep="history">My Airshow History</button><button type="button" data-mep="year">My Airshow Year</button><button type="button" data-mep="posts">My Posts</button>
  <button type="button" class="me-out" id="hubMeOut">Log Out</button>
</div>

<style id="hub-upgrades">
/* quicker repeat visits */
#guest.lg-quick *{--del:0s!important;--dur:.3s!important;--d:0s!important}
/* start up panel instead of a spinner */
.hud-boot{min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;font-family:"Share Tech Mono",ui-monospace,monospace;color:#5FE3D6;background:#061019}
.hud-boot b{font-family:"Barlow Condensed","Barlow",Arial,sans-serif;font-weight:800;font-size:28px;letter-spacing:.04em;color:#fff}
.hud-boot p{margin:0;font-size:15px}
.hud-boot p span{animation:hbBlink 1s steps(2) infinite}
.hb-ring{position:relative;width:86px;height:86px;border-radius:50%;border:2px solid rgba(95,227,214,.35);overflow:hidden}
.hb-ring::before{content:"";position:absolute;inset:18px;border-radius:50%;border:1px solid rgba(95,227,214,.25)}
.hb-ring i{position:absolute;inset:0;background:conic-gradient(from 0deg,rgba(95,227,214,.55),transparent 28%);animation:hbSpin 1.4s linear infinite}
@keyframes hbSpin{to{transform:rotate(360deg)}}
@keyframes hbBlink{50%{opacity:0}}
/* signing off: stay logged in */
#hubSO button{display:block;margin-top:18px;font:700 16px "Barlow",Arial,sans-serif;background:transparent;color:#fff;border:2px solid #fff;padding:10px 18px;cursor:pointer;transition:background .25s,color .25s}
#hubSO button:hover,#hubSO button:focus-visible{background:#fff;color:#08141F;outline:none}
#hubSO i::after{animation-duration:2.2s!important}
/* forum inside the hub */
.hub-forum-wrap{padding-top:18px}
#hubForumFrame{display:block;width:100%;height:calc(100vh - 120px);min-height:560px;border:1px solid rgba(124,255,158,.45);box-shadow:inset 4px 0 0 #7CFF9E;background:#061019}
/* short hello */
.hub-hello{position:fixed;top:16px;right:16px;z-index:80;display:flex;align-items:flex-start;gap:12px;width:min(380px,calc(100% - 32px));background:rgba(8,20,31,.94);border:1px solid #5FE3D6;box-shadow:0 0 30px rgba(95,227,214,.18);padding:14px 16px;color:#fff;font-family:"Barlow",Arial,sans-serif;animation:hhIn .6s cubic-bezier(.2,.8,.2,1) both}
.hub-hello.out{opacity:0;transform:translateY(-8px);transition:opacity .4s,transform .4s}
.hub-hello b{display:block;font-weight:700;font-size:17px}
.hub-hello p{margin:3px 0 0;font-size:15px;line-height:1.45;color:#D2DFE8}
.hh-dot{flex:none;width:10px;height:10px;margin-top:6px;border-radius:50%;background:#5FE3D6;box-shadow:0 0 12px #5FE3D6}
.hub-hello button{margin-left:auto;background:transparent;border:0;color:#A9BDCB;font-size:22px;line-height:1;cursor:pointer;padding:0 2px}
@keyframes hhIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
/* new member setup */
.hub-setup{position:fixed;inset:0;z-index:92;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,13,20,.94);font-family:"Barlow",Arial,sans-serif;color:#fff}
.su-box{width:min(720px,100%);max-height:calc(100vh - 32px);overflow-y:auto;scrollbar-width:none;background:#08141F;border:1px solid #5FE3D6;box-shadow:0 0 60px rgba(95,227,214,.16);padding:26px 28px;animation:wbOpen .8s cubic-bezier(.2,.8,.2,1) both}
.su-top{display:flex;justify-content:space-between;align-items:center;gap:12px;font-family:"Share Tech Mono",ui-monospace,monospace;font-size:14px;color:#5FE3D6}
.su-tag{background:#6950A1;color:#fff;font-family:"Barlow",Arial,sans-serif;font-weight:600;padding:4px 10px}
.su-track{display:block;height:5px;background:#13293C;margin:16px 0 20px}
.su-track em{display:block;height:100%;width:33%;background:#5FE3D6;box-shadow:0 0 12px #5FE3D6;transition:width .5s cubic-bezier(.2,.8,.2,1)}
.hub-setup h2{font-family:"Barlow Condensed","Barlow",Arial,sans-serif;font-weight:800;font-size:clamp(28px,5vw,40px);line-height:1;margin:0}
.hub-setup section p{color:#D2DFE8;font-size:17px;margin:10px 0 18px}
.su-chips{display:flex;flex-wrap:wrap;gap:8px}
.su-chip{font:600 15px "Barlow",Arial,sans-serif;color:#fff;background:rgba(19,41,60,.8);border:1px solid rgba(95,227,214,.3);padding:10px 14px;cursor:pointer;transition:background .25s,border-color .25s,transform .25s}
.su-chip:hover{border-color:#5FE3D6;transform:translateY(-1px)}
.su-chip[aria-pressed="true"]{background:#32B4AF;border-color:#32B4AF;color:#061019}
.su-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.su-opts button{text-align:left;font-family:"Barlow",Arial,sans-serif;color:#fff;background:rgba(19,41,60,.8);border:1px solid rgba(95,227,214,.3);padding:14px 16px;cursor:pointer;transition:background .25s,border-color .25s}
.su-opts button b{display:block;font-size:17px}
.su-opts button span{display:block;font-size:14px;color:#A9BDCB;margin-top:4px}
.su-opts button:hover{border-color:#5FE3D6}
.su-opts button[aria-pressed="true"]{background:#13293C;border-color:#5FE3D6;box-shadow:inset 4px 0 0 #5FE3D6}
.su-foot{display:flex;align-items:center;gap:10px;margin-top:24px}
.su-foot span{flex:1}
.su-foot button{font:700 16px "Barlow",Arial,sans-serif;padding:11px 18px;cursor:pointer;border:2px solid #32B4AF}
.su-next{background:#32B4AF;color:#061019}
.su-next:disabled{opacity:.6;cursor:wait}
.su-back{background:transparent;color:#fff;border-color:#fff!important}
.su-skip{background:transparent;color:#A9BDCB;border:0!important;padding-inline:0!important;text-decoration:underline;text-underline-offset:3px}
/* add to home screen */
.a2hs{position:fixed;left:16px;right:16px;bottom:16px;z-index:85;margin:0 auto;max-width:520px;display:flex;gap:14px;align-items:flex-start;background:#08141F;border:1px solid #5FE3D6;box-shadow:0 10px 40px rgba(0,0,0,.45);padding:16px;color:#fff;font-family:"Barlow",Arial,sans-serif;animation:hhIn .6s cubic-bezier(.2,.8,.2,1) both}
.a2hs img{width:52px;height:52px;object-fit:contain;flex:none;background:#13293C;padding:6px}
.a2hs b{display:block;font-size:17px}
.a2hs p{margin:4px 0 0;font-size:15px;line-height:1.45;color:#D2DFE8}
.a2hs-b{display:flex;gap:8px;margin-top:10px}
.a2hs-b button{font:700 15px "Barlow",Arial,sans-serif;padding:8px 14px;cursor:pointer;border:2px solid #32B4AF;background:#32B4AF;color:#061019}
.a2hs-b button+button{background:transparent;color:#fff;border-color:#fff}
/* phone tab bar */
.hub-dock,.hub-me{display:none}
@media (max-width:700px){
  body.is-member .hub-dock{position:fixed;left:0;right:0;bottom:0;z-index:70;display:grid;grid-template-columns:repeat(5,1fr);background:rgba(6,16,25,.96);border-top:1px solid rgba(95,227,214,.35);padding-bottom:env(safe-area-inset-bottom,0px);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
  .hub-dock button{display:flex;flex-direction:column;align-items:center;gap:3px;min-height:58px;justify-content:center;background:transparent;border:0;color:#A9BDCB;font:600 12px "Barlow",Arial,sans-serif;cursor:pointer;transition:color .25s}
  .hub-dock svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}
  .hub-dock button.on{color:#5FE3D6}
  .hub-dock button.on svg{filter:drop-shadow(0 0 6px rgba(95,227,214,.6))}
  body.is-member .hub-me:not([hidden]){position:fixed;left:0;right:0;bottom:58px;z-index:71;display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(95,227,214,.2);border-top:1px solid #5FE3D6;animation:hhIn .35s ease both}
  .hub-me button{background:#08141F;border:0;color:#fff;font:600 15px "Barlow",Arial,sans-serif;padding:14px 16px;text-align:left;cursor:pointer}
  .hub-me .me-out{grid-column:1/-1;color:#F3B5B5}
  body.is-member{padding-bottom:70px}
  body.is-member .tabs{display:none}
  .su-opts{grid-template-columns:1fr}
  .a2hs{bottom:76px}
  #hubForumFrame{height:calc(100vh - 150px)}
}
@media (prefers-reduced-motion:reduce){.hub-hello,.su-box,.a2hs,.hub-me,.hb-ring i{animation:none!important}}
</style>
'''
rep('<!-- Signing off screen (21 Oct 2026)', EXTRA + '\n<!-- Signing off screen (21 Oct 2026)')

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
    var t = { id: "t" + Date.now() + Math.random().toString(36).slice(2, 6), showSlug: sh.slug, showName: sh.name, start: sh.start, end: sh.end, travel: "", gatesOpen: sh.gatesOpen, budgetLimit: 0, budget: [], timeline: [], todo: [], packing: { mode: "day", checked: [], extra: [] }, groupCode: "" };
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
