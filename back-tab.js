/* Back tab for The Big Guide to UK Airshows (3 Nov 2026).
   A tab at the top and bottom of a page that takes the visitor back to the page they came from,
   in the "transport tabs op1" look (grey bar, white tab with a rounded top, ring icon in the page colour).
   The forum's HUD look gets a HUD version with corner brackets.

   Load it at the end of a page:
   <script src="https://jskedge1.github.io/airshow-pages/back-tab.js" defer></script>

   How it knows where the visitor came from, in order:
   1. ?from=<source> in the page address (added to links when they are clicked on a page that loads this file)
   2. the last page they clicked through from, kept on their device for 30 minutes
   3. the browser's referrer, when it is a page on ukairshowguide.co.uk
   If none of those is a page this tab is allowed to return to, it uses the page's own default.

   Pages are listed in PAGES below, keyed by their file path here and by their Wix address.
   A page with tab:false only records itself as a source (hubs and lists that do not need a back tab).
   Bus and train route pages use transport-back.js instead. */
(function () {
  if (window.__ukagBackTab) return;
  window.__ukagBackTab = true;
  /* inside a Wix page (the airshow-page element) the guide sits in its own container, so the tabs go there */
  var ME = document.currentScript;

  var SITE = "https://www.ukairshowguide.co.uk/";
  var STORE = "ukag-back-from";
  var FRESH = 30 * 60 * 1000;

  /* ---------- where a visitor can come from ---------- */
  var SHOWS = {
    riat: ["Royal International Air Tattoo", "riat"],
    cosford: ["RAF Cosford Air Show", "cosfordairshow"],
    duxford: ["IWM Duxford Air Shows", "duxfordairshows"],
    shuttleworth: ["Shuttleworth Air Shows", "shuttleworthairshows"],
    gransden: ["Little Gransden Air and Car Show", "little-gransden-air-and-car-show"],
    eastbourne: ["Eastbourne Airshow", "eastbourneairshow"],
    clacton: ["Clacton Air Show", "clactonairshow"],
    wales: ["Wales National Airshow", "walesairshow"],
    midlands: ["Midlands Air Festival", "midlandsairfestival"],
    blackpool: ["Blackpool Air Show", "blackpool-air-show"],
    southport: ["Southport Air Show", "southport-air-show"],
    ayr: ["International Ayr Show", "international-ayr-show"],
    headcorn: ["Headcorn Airshow", "headcorn-air-show"]
  };
  var SRC = {
    home: ["Home", "The Big Guide to UK Airshows", ""],
    find: ["Find your airshow", "All the featured shows", "air-shows-guides"],
    calendar: ["Airshow calendar", "UK airshow dates", "uk-airshow-calendar"],
    map: ["Airshow map", "Every show on the map", "airshow-map"],
    pt: ["Public transport", "Public transport to UK airshows", "airshow-public-transport"],
    buses: ["Bus routes", "Every bus route by show", "bus-route"],
    vpg: ["Planning guides", "All my visitor planning guides", "visitorplanningguides"],
    first: ["Planning your first airshow", "Start here if it is your first show", "planning-your-first-airshow"],
    photohub: ["Photography Hub", "All my photography guides", "airshow-photography-hub"],
    camphub: ["Camping Hub", "All my camping guides", "camping-at-airshows"],
    hub: ["my hub", "My Airshow Hub", "my-airshow-hub"],
    forum: ["the forum", "Airshow forum", "community-forum"],
    faq: ["Questions and answers", "Airshow questions and answers", "airshow-questions"],
    traders: ["Airshow traders", "Traders directory", "airshow-traders"]
  };
  Object.keys(SHOWS).forEach(function (k) {
    SRC["show-" + k] = [SHOWS[k][0], SHOWS[k][0] + " guide", SHOWS[k][1]];
  });
  var SLUG2SRC = {};
  Object.keys(SRC).forEach(function (k) { SLUG2SRC[SRC[k][2]] = k; });

  /* ---------- the pages ---------- */
  var C = { bus: "#00A6E2", train: "#D74949", guide: "#6950A1", show: "#6950A1", forum: "#32B4AF",
    photo: "#13293C", cal: "#00A6E2", trade: "#2BA84A", pol: "#6B7C89" };
  var ANY_SHOW = ["show-*"];
  var PAGES = {};
  function add(keys, cfg) { keys.forEach(function (k) { PAGES[k] = cfg; }); }

  /* record only: hubs and lists */
  add(["home", ""], { me: "home", tab: false });
  add(["find-your-airshow", "air-shows-guides"], { me: "find", tab: false });
  add(["public-transport", "airshow-public-transport"], { me: "pt", tab: false });
  add(["visitor-planning-guides", "visitorplanningguides"], { me: "vpg", tab: false });
  add(["photography-hub", "airshow-photography-hub"], { me: "photohub", tab: false });
  add(["camping-hub", "camping-at-airshows"], { me: "camphub", tab: false });
  add(["my-airshow-hub"], { me: "hub", tab: false });

  /* featured show pages */
  var SHOWFILES = { riat: "riat", cosford: "cosford", duxford: "duxford", shuttleworth: "shuttleworth",
    gransden: "gransden", eastbourne: "eastbourne", clacton: "clacton", wales: "wales", midlands: "midlands",
    "midlands-v2": "midlands", blackpool: "blackpool", southport: "southport", ayr: "ayr", headcorn: "headcorn" };
  Object.keys(SHOWFILES).forEach(function (f) {
    var s = SHOWFILES[f];
    add(["camping-layout/" + f, SHOWS[s][1]], { me: "show-" + s, colour: C.show, kind: "show",
      allow: ["find", "calendar", "map", "hub"], def: "find" });
  });

  /* bus and train route pages have their own Back to Transport tab (transport-back.js) */

  /* planning guides */
  var FIRST = ["which-show", "getting-there", "where-to-watch", "on-the-day", "safety", "what-to-pack", "accommodation", "weather"];
  FIRST.forEach(function (g) {
    add(["first-airshow-" + g], { colour: C.guide, kind: "guide",
      allow: ANY_SHOW.concat(["first", "vpg", "hub", "find", "pt", "faq"]), def: "vpg" });
  });
  add(["planning-your-first-airshow"], { me: "first", colour: C.guide, kind: "guide",
    allow: ANY_SHOW.concat(["vpg", "hub", "find", "faq"]), def: "vpg" });
  add(["airshow-security", "questions-and-answers", "airshow-questions", "food-and-drink", "foodanddrinkatairshows",
    "kit-calculator", "build-your-kit-calculator", "airshows-on-a-budget"], { colour: C.guide, kind: "guide",
    allow: ANY_SHOW.concat(["vpg", "first", "hub", "find", "photohub", "camphub", "pt", "faq"]), def: "vpg" });
  PAGES["questions-and-answers"] = PAGES["airshow-questions"] = { me: "faq", colour: C.guide, kind: "guide",
    allow: ANY_SHOW.concat(["vpg", "first", "hub", "find", "photohub", "camphub", "pt"]), def: "vpg" };

  /* forum: clean and HUD looks */
  add(["forum-clean", "community-forum"], { me: "forum", colour: C.forum, kind: "forum",
    allow: ["hub"].concat(ANY_SHOW, ["find", "home"]), def: "hub" });
  add(["forum-hud"], { me: "forum", colour: C.forum, kind: "forum", hud: true,
    allow: ["hub"].concat(ANY_SHOW, ["find", "home"]), def: "hub" });

  /* photography guides */
  add(["new-to-aviation-photography"], { colour: C.photo, kind: "guide",
    allow: ["photohub"].concat(ANY_SHOW, ["vpg"]), def: "photohub" });

  /* calendar and map: only shown when the visitor came from a show or a list */
  add(["uk-airshow-calendar"], { me: "calendar", colour: C.cal, kind: "list",
    allow: ANY_SHOW.concat(["find", "hub", "map"]), def: null });
  add(["airshow-map"], { me: "map", colour: C.cal, kind: "list",
    allow: ANY_SHOW.concat(["find", "hub", "calendar"]), def: null });

  /* traders and partner pages */
  add(["traders/directory", "airshow-traders"], { me: "traders", colour: C.trade, kind: "list",
    allow: ANY_SHOW.concat(["vpg", "find", "hub", "home"]), def: "home" });
  add(["advertise-with-us"], { colour: C.trade, kind: "list",
    allow: ANY_SHOW.concat(["traders", "vpg", "find", "hub", "home"]), def: "home" });

  /* meet the team */
  add(["meet-the-team", "meettheteam"], { colour: C.forum, kind: "list", allow: ["*"], def: "home" });

  /* policies */
  add(["policies"], { colour: C.pol, kind: "list", allow: ["*"], def: "home" });

  /* ---------- which page is this ---------- */
  function pageKey() {
    var p = location.pathname;
    if (/airshow-pages\//.test(p)) return p.replace(/^.*\/airshow-pages\//, "").replace(/\.html$/, "");
    return p.replace(/^\//, "").replace(/\/$/, "");
  }
  var key = pageKey();
  var cfg = PAGES[key];
  if (!cfg) return;

  /* ---------- remember where a visitor clicks through from ---------- */
  function store(k) {
    var v = JSON.stringify({ k: k, t: Date.now() });
    try { localStorage.setItem(STORE, v); } catch (e) {}
    try { sessionStorage.setItem(STORE, v); } catch (e) {}
  }
  function stored() {
    var raw = null;
    try { raw = sessionStorage.getItem(STORE); } catch (e) {}
    if (!raw) { try { raw = localStorage.getItem(STORE); } catch (e) {} }
    try { var o = JSON.parse(raw); if (o && o.k && Date.now() - o.t < FRESH) return o.k; } catch (e) {}
    return null;
  }
  if (cfg.me) {
    document.addEventListener("click", function (e) {
      var t0 = e.composedPath ? e.composedPath()[0] : e.target;
      var a = t0 && t0.closest ? t0.closest("a[href]") : null;
      if (!a || a.closest(".ukbt")) return;
      var h = a.getAttribute("href") || "";
      var isSite = /^https?:\/\/(www\.)?ukairshowguide\.co\.uk/i.test(h);
      var isGh = /jskedge1\.github\.io\/airshow-pages/i.test(h);
      if (!isSite && !isGh) return;
      /* bus and train route links are handled by bus-routes.js and transport-back.js */
      if (/bus-route|train-to-|bus-routes\/|train-routes\//i.test(h)) return;
      store(cfg.me);
      if (isSite && !/[?&]from=/.test(h)) {
        var parts = h.split("#");
        parts[0] += (parts[0].indexOf("?") > -1 ? "&" : "?") + "from=" + encodeURIComponent(cfg.me);
        a.setAttribute("href", parts.join("#"));
      }
    }, true);
  }
  if (cfg.tab === false) return;

  /* ---------- work out where the tab goes ---------- */
  var showKey = cfg.show || null;
  var showName = null, showUrl = null;
  if (cfg.bus && window.CFG && CFG.showName) {
    showName = CFG.showName; showUrl = CFG.showUrl;
    Object.keys(SHOWS).forEach(function (k) { if (showUrl && showUrl.replace(/\/$/, "").split("/").pop() === SHOWS[k][1]) showKey = k; });
  }
  if (showKey && !showName) { showName = SHOWS[showKey][0]; showUrl = SITE + SHOWS[showKey][1]; }

  function allowed(src) {
    if (!src || !SRC[src]) return false;
    if (cfg.me && src === cfg.me) return false;
    var a = cfg.allow || [];
    if (a.indexOf("*") > -1) return true;
    if (a.indexOf(src) > -1) return true;
    if (/^show-/.test(src)) {
      if (a.indexOf("show-*") > -1) return true;
      if (a.indexOf("show") > -1 && showKey && src === "show-" + showKey) return true;
    }
    return false;
  }
  function fromQuery() { var m = location.search.match(/[?&]from=([a-z0-9-]+)/i); return m ? m[1] : null; }
  function fromReferrer() {
    try {
      var r = document.referrer;
      if (!/ukairshowguide\.co\.uk/i.test(r)) return null;
      var slug = new URL(r).pathname.replace(/^\//, "").replace(/\/$/, "");
      return SLUG2SRC.hasOwnProperty(slug) ? SLUG2SRC[slug] : null;
    } catch (e) { return null; }
  }
  var src = [fromQuery(), stored(), fromReferrer()].filter(allowed)[0] || null;
  if (!src) {
    if (cfg.def === "show" && showKey) src = "show-" + showKey;
    else if (cfg.def) src = cfg.def;
  }
  if (!src || !SRC[src]) return;

  var label, sub, url;
  if (src === "show-" + showKey && showName) { url = showUrl; sub = showName + " guide"; label = showName; }
  else { label = SRC[src][0]; sub = SRC[src][1]; url = SITE + SRC[src][2]; }
  if (cfg.kind === "transport" && (/^show-/.test(src) || src === "pt")) {
    sub = (/^show-/.test(src) ? label + ", Getting there" : SRC.pt[1]);
    label = "Transport";
  }
  label = "Back to " + label;

  /* ---------- draw it ---------- */
  var col = cfg.colour;
  var css =
    ".ukbt{--ukbt:" + col + ";font-family:'Barlow',Arial,sans-serif;background:#F1F4F6;display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;padding:12px max(18px,calc((100% - 1200px)/2)) 0;border-bottom:3px solid var(--ukbt);position:relative;z-index:5;box-sizing:border-box;width:100%}" +
    ".ukbt *{box-sizing:border-box}" +
    ".ukbt.ukbt-b{border-bottom:0;border-top:3px solid var(--ukbt);padding-top:0;padding-bottom:12px;align-items:flex-start}" +
    ".ukbt a.ukbt-tab{display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:#13293C;background:#fff;border:1px solid #D7DEE3;border-bottom:none;border-radius:12px 12px 0 0;padding:11px 20px 11px 12px;position:relative;top:3px;cursor:pointer;transition:background .25s ease,color .25s ease,box-shadow .25s ease;max-width:100%}" +
    ".ukbt.ukbt-b a.ukbt-tab{border:1px solid #D7DEE3;border-top:none;border-radius:0 0 12px 12px;top:-3px}" +
    ".ukbt .ukbt-ring{width:34px;height:34px;border-radius:50%;border:3px solid var(--ukbt);display:grid;place-items:center;flex:none;transition:background .25s ease}" +
    ".ukbt .ukbt-ring svg{width:16px;height:16px;stroke:var(--ukbt);fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;transition:transform .25s ease}" +
    ".ukbt .ukbt-t{display:flex;flex-direction:column;line-height:1.2;min-width:0}" +
    ".ukbt .ukbt-t b{font-weight:700;font-size:17px}" +
    ".ukbt .ukbt-t span{font-weight:500;font-size:14px;color:#4A5B68;transition:color .25s ease}" +
    ".ukbt a.ukbt-tab:hover,.ukbt a.ukbt-tab:focus-visible{background:var(--ukbt);color:#fff;box-shadow:0 6px 16px rgba(19,41,60,.22);outline:none}" +
    ".ukbt a.ukbt-tab:hover .ukbt-t span,.ukbt a.ukbt-tab:focus-visible .ukbt-t span{color:#fff}" +
    ".ukbt a.ukbt-tab:hover .ukbt-ring,.ukbt a.ukbt-tab:focus-visible .ukbt-ring{background:#fff}" +
    ".ukbt a.ukbt-tab:hover .ukbt-ring svg{transform:translateX(-2px)}" +
    ".ukbt .ukbt-crumb{margin-left:auto;padding-bottom:12px;font-size:15px;font-weight:500;color:#4A5B68}" +
    ".ukbt .ukbt-crumb a{color:#13293C;text-decoration:none;border-bottom:2px solid transparent;transition:border-color .2s ease}" +
    ".ukbt .ukbt-crumb a:hover{border-bottom-color:var(--ukbt)}" +
    /* HUD look */
    ".ukbt.ukbt-hud{background:#07131D;border-bottom:2px solid rgba(50,180,175,.55)}" +
    ".ukbt.ukbt-hud.ukbt-b{border-top:2px solid rgba(50,180,175,.55);border-bottom:0}" +
    ".ukbt.ukbt-hud a.ukbt-tab{background:rgba(50,180,175,.08);color:#DFF6F5;border-color:rgba(50,180,175,.45)}" +
    ".ukbt.ukbt-hud a.ukbt-tab:before,.ukbt.ukbt-hud a.ukbt-tab:after{content:'';position:absolute;width:10px;height:10px;border:2px solid #32B4AF;transition:all .3s ease}" +
    ".ukbt.ukbt-hud a.ukbt-tab:before{left:-4px;top:-4px;border-right:0;border-bottom:0}" +
    ".ukbt.ukbt-hud a.ukbt-tab:after{right:-4px;top:-4px;border-left:0;border-bottom:0}" +
    ".ukbt.ukbt-hud.ukbt-b a.ukbt-tab:before{top:auto;bottom:-4px;border-top:0;border-bottom:2px solid #32B4AF}" +
    ".ukbt.ukbt-hud.ukbt-b a.ukbt-tab:after{top:auto;bottom:-4px;border-top:0;border-bottom:2px solid #32B4AF}" +
    ".ukbt.ukbt-hud .ukbt-t span{color:#8FB7BF}" +
    ".ukbt.ukbt-hud .ukbt-ring{border-color:#32B4AF;box-shadow:0 0 12px rgba(50,180,175,.45)}" +
    ".ukbt.ukbt-hud .ukbt-ring svg{stroke:#32B4AF}" +
    ".ukbt.ukbt-hud a.ukbt-tab:hover,.ukbt.ukbt-hud a.ukbt-tab:focus-visible{background:rgba(50,180,175,.22);color:#fff;box-shadow:0 0 22px rgba(50,180,175,.35)}" +
    ".ukbt.ukbt-hud a.ukbt-tab:hover:before{left:-8px}.ukbt.ukbt-hud a.ukbt-tab:hover:after{right:-8px}" +
    ".ukbt.ukbt-hud a.ukbt-tab:hover .ukbt-ring,.ukbt.ukbt-hud a.ukbt-tab:focus-visible .ukbt-ring{background:#32B4AF}" +
    ".ukbt.ukbt-hud a.ukbt-tab:hover .ukbt-ring svg,.ukbt.ukbt-hud a.ukbt-tab:focus-visible .ukbt-ring svg{stroke:#07131D;stroke-width:3}" +
    ".ukbt.ukbt-hud .ukbt-crumb{color:#8FB7BF}.ukbt.ukbt-hud .ukbt-crumb a{color:#DFF6F5}" +
    "@media(max-width:640px){.ukbt{padding-left:12px;padding-right:12px}.ukbt a.ukbt-tab{width:100%}.ukbt .ukbt-crumb{display:none}}" +
    "@media(prefers-reduced-motion:reduce){.ukbt *{transition:none!important}}";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  var arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  function bar(bottom, crumb) {
    var n = document.createElement("nav");
    n.className = "ukbt" + (bottom ? " ukbt-b" : "") + (cfg.hud ? " ukbt-hud" : "");
    n.setAttribute("aria-label", bottom ? "Go back, bottom of page" : "Go back");
    n.innerHTML = '<a class="ukbt-tab" href="' + esc(url) + '" target="_top"><span class="ukbt-ring">' + arrow +
      '</span><span class="ukbt-t"><b>' + esc(label) + "</b><span>" + esc(sub) + "</span></span></a>" +
      (crumb ? '<span class="ukbt-crumb">' + crumb + "</span>" : "");
    return n;
  }

  /* Where the guide lives. Opened on its own (GitHub, or inside a Wix HTML box) it is this document.
     On the live site the airshow-page element puts it in a shadow root (div.ae-body), and this
     script runs in the Wix page's head, so the tabs must go into that root and never into the
     Wix page itself, or they end up above the site's header menu and below the footer. */
  var ONSITE = /ukairshowguide\.co\.uk$/i.test(location.hostname);
  function guideRoot() {
    var mine = ME && ME.getRootNode ? ME.getRootNode() : null;
    if (mine && mine !== document && mine.querySelector) return mine;
    var hosts = document.querySelectorAll("airshow-page");
    for (var i = 0; i < hosts.length; i++) {
      var r = hosts[i].shadowRoot;
      if (r && r.querySelector(".ae-body")) return r;
    }
    return ONSITE ? null : document;
  }

  function build(R) {
    if (R.querySelector(".ukbt")) return;
    var box = R === document ? document.body : (R.querySelector(".ae-body") || R);
    if (R === document && ME && ME.parentNode && ME.parentNode.nodeType === 1 &&
        ME.parentNode !== document.head && ME.parentNode !== document.documentElement) box = ME.parentNode;
    var st = document.createElement("style");
    st.id = "ukbt-style";
    st.textContent = css;
    if (R === document) (document.head || document.body).appendChild(st);
    else R.insertBefore(st, R.firstChild);

    var top;
    var sitebar = box.querySelector("nav.sitebar");
    if (cfg.kind === "show" && sitebar) {
      /* the show pages had a plain Back to Find your airshow link: the tab takes its place */
      top = bar(false, '<a href="' + SITE + '" target="_top">The Big Guide to UK Airshows</a>');
      sitebar.parentNode.insertBefore(top, sitebar);
      sitebar.style.display = "none";
    } else {
      top = bar(false, "");
      var trail = R.getElementById ? R.getElementById("ukag-trail") : R.querySelector("#ukag-trail");
      if (trail && trail.parentNode && box.contains(trail)) trail.parentNode.insertBefore(top, trail.nextSibling);
      else box.insertBefore(top, box.firstChild);
    }
    box.appendChild(bar(true, ""));
    try { window.dispatchEvent(new Event("resize")); } catch (e) {}
  }

  var tries = 0;
  function go() {
    var R = guideRoot();
    if (R) { build(R); return; }
    if (tries++ < 60) setTimeout(go, 250);
  }

  /* wait a moment so the trail bar (trail.js) is in place first */
  function start() { setTimeout(go, 60); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
