/* app/app.js (11 Nov 2026)
   The Airshow Hub app: one screen with five tabs (Home, Hub, Forum, Show Day, More).

   Hub, Forum and Show Day are the site's own pages (my-airshow-hub.html, forum-clean.html and
   show-day.html?mode=hub) in frames, so they look and work exactly as they do on the website.
   Those pages talk to Wix page code with postMessage ({source:"ukag-hub" | "ukag-forum" |
   "ukag-showday", id, action, payload}). This file passes each message up to the page code on the
   Wix page /app (velo/page-code/app.js) and hands the answer back to the frame that asked, the same
   way forum.html relays for the forum. Session news from the page code goes to every frame.

   The Home tab is drawn here from the same backend: getHub (hub.web.js) for the member, their next
   trip, updates and the coming shows, and listThreads (forum.web.js) for the latest forum posts.

   Opened outside the website nothing can answer, so the logged out screens show. Add ?demo=1 to
   fill the Home tab with an example member so the design can be checked. */
(function () {
  "use strict";

  var SITE = "https://www.ukairshowguide.co.uk/";
  var Q = new URLSearchParams(location.search);
  /* the working preview (tools-app-preview.py) puts an example backend in front of this file */
  var BACKEND = typeof window.UKAG_BACKEND === "function" ? window.UKAG_BACKEND : null;
  var DEMO = Q.get("demo") === "1" && !BACKEND;
  var SOURCES = { "ukag-hub": 1, "ukag-forum": 1, "ukag-showday": 1 };

  /* Inside the Wix page? Same test the hub uses. */
  var IN_WIX = (function () {
    if (window.parent === window) return false;
    var where = "";
    try { if (location.ancestorOrigins && location.ancestorOrigins.length) where = Array.prototype.join.call(location.ancestorOrigins, " "); } catch (e) {}
    if (!where) { try { where = document.referrer || ""; } catch (e) {} }
    if (!where) return true;
    return /ukairshowguide\.co\.uk|ukairshowguide\.uk|wixsite\.com|wixstudio\.|editor\.wix\.com|wix\.com|filesusr\.com|parastorage\.com/.test(where);
  })();

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(name) { return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase(); }
  function first(name) { return String(name || "").split(/\s+/)[0] || "there"; }
  function avatar(name, colour, photo, cls) {
    return '<span class="av' + (cls ? " " + cls : "") + '" style="background:' + esc(colour || "#32B4AF") + '">' +
      (photo ? '<img src="' + esc(photo) + '" alt="">' : esc(initials(name))) + "</span>";
  }
  function ago(iso) {
    if (!iso) return "";
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) { var h = Math.floor(s / 3600); return h + (h === 1 ? " hour ago" : " hours ago"); }
    if (s < 604800) { var d = Math.floor(s / 86400); return d === 1 ? "yesterday" : d + " days ago"; }
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  function dayStr(iso) {
    if (!iso) return "Date to be confirmed";
    return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
  }
  function greeting() {
    var h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }

  var toastT;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 4200);
  }

  /* ---------- talking to the page code ---------- */
  var seq = 0, mine = {}, asked = {};
  var FRAMES = { hub: $("#f-hub"), forum: $("#f-forum"), showday: $("#f-showday") };

  function frameFor(win) {
    for (var k in FRAMES) if (FRAMES[k].contentWindow === win) return k;
    return null;
  }
  function toFrames(m) {
    for (var k in FRAMES) { var f = FRAMES[k]; if (f.src) { try { f.contentWindow.postMessage(m, "*"); } catch (e) {} } }
  }
  function up(m) { window.parent.postMessage(m, "*"); }

  /* the app's own questions (Home tab) */
  function ask(source, action, payload) {
    if (BACKEND) return BACKEND({ source: source, action: action, payload: payload || {} });
    if (DEMO) return Promise.resolve(demo(source, action));
    if (!IN_WIX) return Promise.resolve({ ok: false, outside: true, error: "Open the app on the website to log in." });
    return new Promise(function (resolve) {
      var id = "app" + (++seq) + "-" + Date.now().toString(36);
      var key = source + "|" + id;
      var timer = setTimeout(function () {
        delete mine[key];
        resolve({ ok: false, timeout: true, error: "The site didn't answer. Please check your connection and try again." });
      }, 20000);
      mine[key] = function (m) { clearTimeout(timer); resolve(m); };
      up({ source: source, id: id, action: action, payload: payload || {} });
    });
  }

  window.addEventListener("message", function (e) {
    var m = e.data;
    if (!m || typeof m !== "object") return;

    /* a page in a frame saying how tall it is (the three pages use fit-frame.js, as in their boxes on the site) */
    if (m.source === "ukag-fit" && m.h > 0) {
      var which = frameFor(e.source);
      if (which) FRAMES[which].style.height = Math.ceil(m.h) + "px";
      return;
    }

    /* from the page code on /app */
    if (m.source === "ukag-app" && e.source === window.parent) {
      if (m.event === "tab" && m.tab) go(m.tab, { sub: m.sub });
      if (m.event === "viewport" && m.h > 200) { S.vh = m.h; sizeHub(); }
      return;
    }

    if (!SOURCES[m.source]) return;
    var from = frameFor(e.source);

    /* a frame asking */
    if (from && m.action) {
      if (m.source === "ukag-hub" && m.action === "go" && m.payload && handleGo(m.payload)) {
        e.source.postMessage({ source: m.source, id: m.id, ok: true, data: { done: true } }, "*");
        return;
      }
      if (BACKEND) {
        var asker = e.source;
        BACKEND(m).then(function (r) { try { asker.postMessage({ source: m.source, id: m.id, ok: r.ok, data: r.data, error: r.error }, "*"); } catch (x) {} });
        return;
      }
      if (!IN_WIX) {
        e.source.postMessage({ source: m.source, id: m.id, ok: false, error: "This only works in the app on the website. Open ukairshowguide.co.uk/app to log in." }, "*");
        return;
      }
      asked[m.source + "|" + m.id] = e.source;
      up(m);
      return;
    }

    /* the page code answering, or telling everyone something */
    if (e.source === window.parent) {
      var key = m.source + "|" + m.id;
      if (m.id && mine[key]) { var f = mine[key]; delete mine[key]; f(m); return; }
      if (m.id && asked[key]) { var w = asked[key]; delete asked[key]; try { w.postMessage(m, "*"); } catch (x) {} return; }
      if (m.event) news(m);
    }
  });

  /* news from the page code (or the preview's example backend): log in, log out, refresh */
  function news(m) {
    toFrames(m);
    if (m.source === "ukag-forum" && m.event === "session") setForumMember(m.data && m.data.member);
    if ((m.source === "ukag-forum" && m.event === "session") || (m.source === "ukag-hub" && m.event === "refresh")) reloadHomeSoon();
  }
  window.ukagAppEvent = news;

  /* the hub asks to go somewhere: keep forum and show day inside the app */
  function handleGo(p) {
    var page = p.page || "";
    if (page === "forum" || page === "showday") { go(page); return true; }
    if (page === "members" || page === "messages" || page === "chat") {
      go("forum");
      forumView(page === "members" ? "members" : "messages");
      return true;
    }
    if (page && /^(overview|briefing|trips|updates|community|kit|group|hangar|saved|history|year|posts)$/.test(page)) { go("hub", { sub: page }); return true; }
    return false; /* a page on the site: the page code opens it */
  }

  /* ---------- state ---------- */
  var S = { tab: "home", member: null, forumMember: null, hub: null, threads: null, vh: 0, ticking: 0 };

  /* ---------- tabs ---------- */
  var TITLES = { home: "Home", hub: "My Airshow Hub", forum: "Airshow Forum", showday: "Show Day Live", more: "More" };
  function go(tab, opts) {
    opts = opts || {};
    if (!TITLES[tab]) tab = "home";
    var changed = tab !== S.tab;
    S.tab = tab;
    $$(".screen").forEach(function (s) { s.classList.toggle("off", s.id !== "s-" + tab); });
    for (var k in FRAMES) FRAMES[k].classList.toggle("off", k !== tab);
    $$(".tabs button").forEach(function (b) {
      var on = b.dataset.tab === tab;
      b.classList.toggle("on", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    $("#title").textContent = TITLES[tab];
    if (FRAMES[tab]) loadFrame(tab, function () { if (tab === "hub" && opts.sub) hubPage(opts.sub); });
    if (changed) {
      window.scrollTo(0, 0);
      if (IN_WIX) up({ source: "ukag-app", action: "top" });
      store.set("ukagAppTab", tab);
    }
    tick();
  }
  $$("[data-tab]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      go(b.dataset.tab, { sub: b.dataset.hub });
    });
  });

  function loadFrame(tab, cb) {
    var f = FRAMES[tab];
    if (f.src) { if (f.dataset.ready) cb && cb(); else f.addEventListener("load", function () { cb && cb(); }, { once: true }); return; }
    if (tab === "hub") sizeHub();
    else f.style.height = "760px";
    f.addEventListener("load", function () {
      f.dataset.ready = "1";
      if (tab === "hub") hubTweaks();
      if (tab === "forum") forumTweaks();
      cb && cb();
    }, { once: true });
    f.src = f.dataset.src;
  }

  /* Until the hub says how tall it is, give it one screen's height. */
  function sizeHub() {
    var bar = $(".bar").offsetHeight, tabs = $(".tabs").offsetHeight;
    var screenH = S.vh || (IN_WIX ? Math.min(window.screen && screen.availHeight || 800, 900) : window.innerHeight);
    FRAMES.hub.style.height = Math.max(480, screenH - bar - tabs) + "px";
  }

  function hubDoc() { try { return FRAMES.hub.contentDocument; } catch (e) { return null; } }
  function hubTweaks() {
    var d = hubDoc(); if (!d || d.__app) return; d.__app = true;
    var st = d.createElement("style");
    st.id = "in-app";
    /* The app has its own tab bar at the bottom, so the hub's phone tab bar moves to the top of the hub
       and drops the Show Day and Forum buttons (they are app tabs). The hub's own install prompt goes too. */
    st.textContent =
      ".a2hs{display:none!important}" +
      "@media (max-width:700px){" +
      "body.is-member .hub-dock{top:var(--vt,0px)!important;bottom:auto!important;grid-template-columns:repeat(3,1fr)!important;border-top:0!important;border-bottom:1px solid rgba(95,227,214,.35);padding-bottom:0!important}" +
      "body.is-member .hub-dock button{min-height:48px!important;flex-direction:row!important;gap:7px!important;font-size:13.5px!important}" +
      ".hub-dock [data-dock=showday],.hub-dock [data-dock=forum]{display:none!important}" +
      "body.is-member .hub-me:not([hidden]){top:calc(var(--vt,0px) + 48px)!important;bottom:auto!important}" +
      "body.is-member{padding-bottom:0!important;padding-top:48px!important}}";
    d.head.appendChild(st);
    d.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest('[data-dock="forum"],[data-p="forum"],[data-dock="showday"]');
      if (!t) return;
      e.preventDefault(); e.stopPropagation();
      go(t.dataset.dock === "showday" ? "showday" : "forum");
    }, true);
  }
  function hubPage(p) {
    var w; try { w = FRAMES.hub.contentWindow; } catch (e) {}
    if (!w) return;
    var tries = 0;
    (function attempt() {
      try { if (w.ukagShowPage && S.member) { w.ukagShowPage(p); return; } } catch (e) { return; }
      if (++tries < 20) setTimeout(attempt, 400);
    })();
  }

  function forumDoc() { try { return FRAMES.forum.contentDocument; } catch (e) { return null; } }
  function forumTweaks() {
    var d = forumDoc(); if (!d) return;
    var st = d.createElement("style");
    st.textContent = '.ukbt,.btns a[href*="my-airshow-hub"],.hub-cta a[href*="my-airshow-hub"]{display:none!important}';
    d.head.appendChild(st);
    d.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (a && /my-airshow-hub/.test(a.getAttribute("href") || "")) { e.preventDefault(); e.stopPropagation(); go("hub"); }
    }, true);
  }
  function forumView(view) {
    loadFrame("forum", function () {
      var tries = 0;
      (function attempt() {
        var d = forumDoc(), b = d && d.querySelector('[data-bd-go="' + view + '"]');
        if (b) { b.click(); return; }
        if (++tries < 20) setTimeout(attempt, 400);
      })();
    });
  }
  function openThread(id) {
    go("forum");
    loadFrame("forum", function () {
      var tries = 0;
      (function attempt() {
        var d = forumDoc(), b = d && d.querySelector('[data-fl-thread="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
        if (b) { b.click(); return; }
        if (++tries < 25) setTimeout(attempt, 400);
      })();
    });
  }

  /* ---------- account ---------- */
  function login(mode) {
    if (!IN_WIX && !DEMO && !BACKEND) { outsideSheet(); return; }
    if (DEMO) { toast("Example only: log in works in the app on the website."); return; }
    ask("ukag-forum", mode === "signup" ? "signup" : "login").then(function (r) {
      if (!r.ok && !r.timeout) toast(r.error || "Log in was cancelled.");
    });
  }
  function logout() {
    closeSheet();
    if (!IN_WIX && !BACKEND) return;
    ask("ukag-forum", "logout").then(function () { toast("You have logged out. See you at the next show."); });
  }
  $$("[data-login]").forEach(function (b) { b.addEventListener("click", function () { login(b.dataset.login); }); });
  $("#moreOut").addEventListener("click", logout);
  $("#who").addEventListener("click", function () {
    if (!S.member) { login("login"); return; }
    var m = S.member, fm = S.forumMember || {};
    sheet(
      '<div style="display:flex;gap:14px;align-items:center">' + avatar(m.name, m.colour || fm.colour, fm.photo, "big") +
      '<div><h3 id="sheetH">' + esc(m.name) + "</h3><p>" + esc(m.area || "Airshow fan") + "</p></div></div>" +
      '<div class="btns"><a class="btn btn-teal" href="' + SITE + 'my-profile" target="_top">My Profile</a>' +
      '<button type="button" class="btn btn-ghost" data-s-tab="hub">My Airshow Hub</button>' +
      '<button type="button" class="btn btn-ghost" data-s-out>Log out</button></div>'
    );
  });

  function setWho() {
    var m = S.member, b = $("#who");
    if (m) {
      var fm = S.forumMember || {};
      b.innerHTML = "<span>" + esc(first(m.name)) + "</span>" + avatar(m.name, m.colour || fm.colour, fm.photo);
      b.setAttribute("aria-label", "Account: " + m.name);
    } else {
      b.innerHTML = '<span>Log in</span><span class="ping"></span>';
      b.setAttribute("aria-label", "Log in");
    }
    $("#moreOut").hidden = !m;
  }
  function setForumMember(fm) {
    S.forumMember = fm || null;
    if (!fm) { S.member = null; }
    else if (!S.member) { S.member = { name: fm.name, colour: fm.colour }; }
    setWho();
  }

  /* ---------- sheet ---------- */
  function sheet(html) {
    $("#sheetBody").innerHTML = html;
    $("#scrim").classList.add("on"); $("#sheet").classList.add("on");
    var b = $("#sheet button, #sheet a"); if (b) b.focus();
  }
  function closeSheet() { $("#scrim").classList.remove("on"); $("#sheet").classList.remove("on"); }
  $("#scrim").addEventListener("click", closeSheet);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });
  $("#sheet").addEventListener("click", function (e) {
    var t = e.target.closest("[data-s-tab],[data-s-out],[data-s-close],[data-s-install]");
    if (!t) return;
    if (t.hasAttribute("data-s-out")) { logout(); return; }
    if (t.hasAttribute("data-s-install")) { closeSheet(); promptInstall(); return; }
    closeSheet();
    if (t.dataset.sTab) go(t.dataset.sTab);
  });
  function outsideSheet() {
    sheet('<h3 id="sheetH">Log in on the website</h3><p>Your hub, the forum and Show Day use your UK Airshow Guide account, so the app logs you in when it is opened from the website.</p>' +
      '<div class="btns"><a class="btn btn-teal" href="' + SITE + 'app" target="_top">Open the app on the website</a><button type="button" class="btn btn-ghost" data-s-close>Not now</button></div>');
  }

  /* ---------- install ---------- */
  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; showInstall(); });
  function standalone() {
    try { return matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch (e) { return false; }
  }
  function showInstall() {
    $("#installSec").hidden = standalone() || store.get("ukagAppInstallHide") === "1" || Q.get("source") === "app";
  }
  function promptInstall() {
    if (deferred) { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; }); return; }
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    sheet('<h3 id="sheetH">Add the app to your phone</h3>' + (ios
      ? "<p>On iPhone or iPad, in Safari:</p><ol><li>Tap the Share button (the square with the arrow).</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>. The Airshow Hub icon appears with your other apps.</li></ol>"
      : "<p>On Android, in Chrome:</p><ol><li>Tap the menu (the three dots, top right).</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li><li>Tap <b>Install</b>. The Airshow Hub icon appears with your other apps.</li></ol>") +
      '<p>Do this on the app page, <b>ukairshowguide.co.uk/app</b>, so it opens straight into the app.</p><div class="btns"><button type="button" class="btn btn-teal" data-s-close>Got it</button></div>');
  }
  $("#installBtn").addEventListener("click", promptInstall);
  $("#moreInstall").addEventListener("click", promptInstall);
  $("#installLater").addEventListener("click", function () { store.set("ukagAppInstallHide", "1"); $("#installSec").hidden = true; });

  /* ---------- home ---------- */
  var reloadT;
  function reloadHomeSoon() { clearTimeout(reloadT); reloadT = setTimeout(loadHome, 300); }

  function loadHome() {
    return Promise.all([ask("ukag-hub", "getHub"), ask("ukag-forum", "listThreads", { groupSlug: "" }), ask("ukag-forum", "getSession")]).then(function (res) {
      var h = res[0], t = res[1], sess = res[2];
      if (sess.ok && sess.data) S.forumMember = sess.data.member || null;
      S.hub = h.ok ? (h.data || {}) : { member: null, shows: [] };
      S.member = S.hub.member || (S.forumMember ? { name: S.forumMember.name, colour: S.forumMember.colour } : null);
      S.threads = t.ok ? (t.data || []) : null;
      setWho();
      drawHero(); drawNext(); drawUpdates(); drawShows(); drawThreads(t);
      showInstall();
      tick();
    });
  }

  function drawHero() {
    var m = S.member, hub = S.hub || {};
    if (m) {
      var trips = (hub.trips || []).length, must = (hub.mustSee || []).length;
      $("#heroTag").textContent = "Welcome back";
      $("#heroH").innerHTML = esc(greeting()) + ", <span>" + esc(first(m.name)) + "</span>";
      $("#heroP").textContent = trips
        ? trips + (trips === 1 ? " show" : " shows") + " in your hub" + (must ? " and " + must + " must see " + (must === 1 ? "aircraft" : "aircraft") + " on your list." : ".")
        : "Your hub is ready. Save a show to start the countdown, plan your trip and see who else is going.";
      var badges = m.badges || [];
      $("#heroBadges").innerHTML = badges.map(function (b) { return '<span class="badge"><i>' + esc(b.icon) + "</i>" + esc(b.label) + "</span>"; }).join("");
      $("#heroBadges").hidden = !badges.length;
      $("#heroBtns").innerHTML = '<button type="button" class="btn btn-teal" data-go-tab="hub">Open my hub</button><button type="button" class="btn btn-line" data-go-tab="forum">Forum</button>';
    } else {
      $("#heroTag").textContent = "Your airshow year";
      $("#heroH").innerHTML = "Your airshows, <span>in your pocket</span>";
      $("#heroP").textContent = "Plan your trips, count down to the show, chat with other airshow fans and follow the day live, all from one app. Free to join.";
      $("#heroBadges").hidden = true;
      $("#heroBtns").innerHTML = '<button type="button" class="btn btn-teal" data-login="login">Log in</button><button type="button" class="btn btn-line" data-login="signup">Join free</button>';
    }
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-go-tab],[data-login],[data-thread]");
    if (!t || t.closest(".tabs") || t.closest("#sheet")) return;
    if (t.dataset.goTab) go(t.dataset.goTab, { sub: t.dataset.hub });
    else if (t.dataset.thread) openThread(t.dataset.thread);
    else if (t.dataset.login && !t.__bound) login(t.dataset.login);
  });
  $$("[data-login]").forEach(function (b) { b.__bound = true; });

  function upcomingShows() {
    var now = Date.now();
    return ((S.hub && S.hub.shows) || []).filter(function (s) { return s.start && new Date(s.end || s.start).getTime() > now - 86400000; })
      .sort(function (a, b) { return a.start.localeCompare(b.start); });
  }
  function nextTarget() {
    var trips = (S.hub && S.hub.trips) || [];
    var t = trips.filter(function (x) { return x.start; }).sort(function (a, b) { return a.start.localeCompare(b.start); })[0];
    if (t) return { kind: "trip", name: t.showName, start: t.start, end: t.end, gates: t.gatesOpen, travel: t.travel, group: t.groupCode };
    var s = upcomingShows()[0];
    if (s) return { kind: "show", name: s.name, start: s.start, end: s.end, gates: s.gatesOpen, link: s.link, dateText: s.dateText };
    return null;
  }
  function drawNext() {
    var n = nextTarget(), box = $("#next");
    if (!n) { box.hidden = true; return; }
    box.hidden = false;
    var facts = [];
    if (n.gates) facts.push("Gates open " + n.gates);
    if (n.travel) facts.push("Travelling by " + n.travel);
    if (n.group) facts.push("Group code " + n.group);
    box.innerHTML =
      '<div class="lbl">' + (n.kind === "trip" ? "Your next show" : "Next UK airshow") + "</div>" +
      "<h4>" + esc(n.name) + '</h4><div class="when">' + esc(n.dateText && n.kind === "show" ? n.dateText : dayStr(n.start)) + "</div>" +
      '<div class="count" data-count="' + esc(n.start) + '"><div><b data-u="d">0</b><span>Days</span></div><div><b data-u="h">0</b><span>Hours</span></div><div><b data-u="m">0</b><span>Mins</span></div><div><b data-u="s">0</b><span>Secs</span></div></div>' +
      (facts.length ? '<div class="facts">' + facts.map(function (f) { return "<span>" + esc(f) + "</span>"; }).join("") + "</div>" : "") +
      '<div class="btns">' + (n.kind === "trip"
        ? '<button type="button" class="btn btn-navy sm" data-go-tab="hub" data-hub="trips">Plan this trip</button><button type="button" class="btn btn-ghost sm" data-go-tab="showday">Show Day Live</button>'
        : (S.member ? '<button type="button" class="btn btn-navy sm" data-go-tab="hub" data-hub="trips">Save a show</button>' : '<button type="button" class="btn btn-navy sm" data-login="signup">Join free to save it</button>') +
          (n.link ? '<a class="btn btn-ghost sm" href="' + esc(/^https?:/.test(n.link) ? n.link : SITE + n.link.replace(/^\//, "")) + '" target="_top">Show guide</a>' : "")) +
      "</div>";
  }

  function tick() {
    var c = $("[data-count]");
    if (!c || S.tab !== "home") { if (S.ticking) { clearInterval(S.ticking); S.ticking = 0; } return; }
    function draw() {
      var ms = new Date(c.dataset.count).getTime() - Date.now();
      if (!(ms > 0)) { c.innerHTML = '<div style="grid-column:1/-1"><b>Show day</b><span>Have a great time</span></div>'; clearInterval(S.ticking); S.ticking = 0; return; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
      var u = { d: d, h: h, m: m, s: s };
      $$("[data-u]", c).forEach(function (b) { b.textContent = u[b.dataset.u]; });
    }
    draw();
    if (!S.ticking) S.ticking = setInterval(function () { if (document.hidden) return; var x = $("[data-count]"); if (!x || S.tab !== "home") { clearInterval(S.ticking); S.ticking = 0; return; } c = x; draw(); }, 1000);
  }

  function drawUpdates() {
    var hub = S.hub || {}, list = (hub.updates || []).slice(0, 3), unread = hub.unread || 0;
    var badge = $("#hubBadge");
    badge.textContent = unread > 9 ? "9+" : String(unread);
    badge.hidden = !unread;
    $("#updSec").hidden = !S.member || !list.length;
    $("#updList").innerHTML = list.map(function (u) {
      return '<button type="button" class="item" data-go-tab="hub" data-hub="updates"><span class="dot' + (u.read ? "" : " new") + '"><svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></svg></span>' +
        "<span><h5>" + esc(u.heading || "Update") + "</h5><p>" + esc(u.body) + '</p><span class="meta">' + (u.read ? "" : '<span class="chip t">New</span>') + "<span>" + esc(ago(u.created)) + "</span></span></span></button>";
    }).join("");
  }

  function drawShows() {
    var shows = upcomingShows().slice(0, 10);
    $("#showsSec").hidden = !shows.length;
    $("#showsRail").innerHTML = shows.map(function (s) {
      var days = Math.ceil((new Date(s.start).getTime() - Date.now()) / 864e5);
      var href = s.link ? (/^https?:/.test(s.link) ? s.link : SITE + s.link.replace(/^\//, "")) : SITE + "uk-airshow-calendar";
      return '<a class="show" href="' + esc(href) + '" target="_top"><b>' + esc(s.shortName || s.name) + "</b><span>" + esc(s.dateText) + "</span>" +
        (days > 0 ? "<em>" + days + "<small>" + (days === 1 ? "day" : "days") + " to go</small></em>" : "<em>On now</em>") + "</a>";
    }).join("");
  }

  function drawThreads(r) {
    var box = $("#threads");
    if (!r.ok) {
      box.innerHTML = '<div class="card empty"><b>The forum is on the website</b>' + esc(r.outside ? "Open the app at ukairshowguide.co.uk/app to read the latest posts." : (r.error || "Please try again in a moment.")) + "</div>";
      return;
    }
    var list = (r.data || []).slice(0, 5);
    if (!list.length) { box.innerHTML = '<div class="card empty"><b>No posts yet</b>Be the first to start a conversation.</div>'; return; }
    box.innerHTML = list.map(function (t) {
      return '<button type="button" class="item" data-thread="' + esc(t.id) + '">' + avatar(t.authorName, t.authorColour, t.authorPhoto) +
        "<span><h5>" + esc(t.title) + "</h5><p>" + esc(t.preview || "") + '</p><span class="meta">' + (t.pinned ? '<span class="chip p">Pinned</span>' : "") +
        "<span>" + esc(t.authorName) + "</span><span>" + esc(ago(t.lastActivity || t.created)) + "</span><span>" + (t.commentCount || 0) + ((t.commentCount === 1) ? " reply" : " replies") + "</span></span></span></button>";
    }).join("");
  }

  /* ---------- example data (?demo=1 only) ---------- */
  function demo(source, action) {
    var day = 864e5, now = Date.now();
    function at(d) { return new Date(now + d * day).toISOString(); }
    if (source === "ukag-hub" && action === "getHub") {
      return { ok: true, data: {
        member: { id: "demo", name: "Sam Taylor", colour: "#6950A1", area: "Bedford", badges: [{ icon: "6", label: "Shows Attended" }, { icon: "★", label: "RIAT Regular", gold: true }, { icon: "◎", label: "Photographer" }] },
        trips: [{ id: "t1", showSlug: "duxford", showName: "Duxford Summer Air Show", start: at(23.4), end: at(24.4), gatesOpen: "8:30am", travel: "car", groupCode: "DX7Q" }],
        mustSee: [{ id: "m1" }, { id: "m2" }, { id: "m3" }],
        unread: 2,
        updates: [
          { id: "u1", heading: "Spitfire pair confirmed", body: "Two Spitfires are now listed for Duxford's afternoon display. They are on your must see list.", read: false, created: new Date(now - 3 * 36e5).toISOString() },
          { id: "u2", heading: "Alex is going to Duxford too", body: "Someone you follow saved the same show. Say hello in the forum.", read: false, created: new Date(now - 26 * 36e5).toISOString() },
          { id: "u3", heading: "Weather looks dry", body: "The first long range forecast for show day is light winds and sunny spells.", read: true, created: new Date(now - 3 * day).toISOString() }
        ],
        shows: [
          { slug: "duxford", name: "Duxford Summer Air Show", shortName: "Duxford Summer", dateText: "Sat 5 Dec", start: at(23.4), end: at(24.4), link: "/duxfordairshows" },
          { slug: "shuttleworth", name: "Shuttleworth Season Premiere", shortName: "Shuttleworth", dateText: "Sun 20 Dec", start: at(39), end: at(39.5), link: "/shuttleworthairshows" },
          { slug: "cosford", name: "RAF Cosford Air Show", shortName: "RAF Cosford", dateText: "Sun 13 Jun 2027", start: at(214), end: at(214.5), link: "/cosfordairshow" },
          { slug: "riat", name: "Royal International Air Tattoo", shortName: "RIAT", dateText: "16 to 18 Jul 2027", start: at(247), end: at(249), link: "/riat" }
        ]
      } };
    }
    if (source === "ukag-forum" && action === "listThreads") {
      return { ok: true, data: [
        { id: "d1", title: "Best spot for the Red Arrows at Duxford?", preview: "First time at Duxford next month and I want the crowd line view for the Reds. Is the far end by the M11 still the place to be?", authorName: "Priya K", authorColour: "#32B4AF", commentCount: 14, likeCount: 22, lastActivity: new Date(now - 40 * 6e4).toISOString(), pinned: false },
        { id: "d2", title: "Meet up at RIAT 2027: who's camping?", preview: "Starting a list for anyone in the campsite who fancies a group photo walk on the Friday arrivals day.", authorName: "Mike O", authorColour: "#D74949", commentCount: 31, likeCount: 40, lastActivity: new Date(now - 5 * 36e5).toISOString(), pinned: true },
        { id: "d3", title: "Nikon Z8 vs D500 for fast jets", preview: "Has anyone switched? Interested in how the tracking compares on Typhoon passes in grey skies.", authorName: "Lewis B", authorColour: "#6950A1", commentCount: 9, likeCount: 7, lastActivity: new Date(now - day).toISOString() }
      ] };
    }
    return { ok: false, error: "Example only." };
  }

  /* ---------- start ---------- */
  if (!navigator.onLine) { var o = $("#offline"); o.hidden = false; o.textContent = "You are offline. Your hub and the forum will update when you are back online."; }
  window.addEventListener("online", function () { $("#offline").hidden = true; loadHome(); });
  window.addEventListener("offline", function () { var o = $("#offline"); o.hidden = false; o.textContent = "You are offline. Your hub and the forum will update when you are back online."; });
  if (BACKEND) {
    var pv = $("#offline"); pv.hidden = false;
    pv.innerHTML = 'Working preview with example data. Nothing here reaches the live site. <a href="#" id="pvReset">Start again</a>';
    $("#pvReset").addEventListener("click", function (e) { e.preventDefault(); if (window.UKAG_PREVIEW_RESET) window.UKAG_PREVIEW_RESET(); toast("The preview has been reset."); });
  } else if (!IN_WIX && !DEMO) {
    var off = $("#offline"); off.hidden = false;
    off.innerHTML = 'You are viewing the app outside the website, so log in is off. <a href="' + SITE + 'app" target="_top">Open it at ukairshowguide.co.uk/app</a>';
  }

  var startTab = Q.get("tab") || (Q.get("source") === "app" ? store.get("ukagAppTab") : "") || "home";
  var splash = $("#splash");
  var seenSplash = false;
  try { seenSplash = sessionStorage.getItem("ukagAppSplash") === "1"; sessionStorage.setItem("ukagAppSplash", "1"); } catch (e) {}
  function hideSplash() { splash.classList.add("gone"); setTimeout(function () { splash.remove(); }, 700); }
  if (seenSplash) hideSplash();
  var minSplash = new Promise(function (r) { setTimeout(r, seenSplash ? 0 : 1300); });

  setWho();
  go(startTab);
  if (IN_WIX) up({ source: "ukag-app", action: "ready" });
  Promise.race([Promise.all([loadHome(), minSplash]), new Promise(function (r) { setTimeout(r, 4500); })]).then(hideSplash);

  if ("serviceWorker" in navigator && /github\.io$/.test(location.hostname) && window.parent === window) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
