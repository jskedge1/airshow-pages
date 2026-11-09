/* forum-live.js (3 Nov 2026)
   Connects both Airshow Forum looks (forum-clean.html and forum-hud.html) to the real forum backend
   (Wix backend/forum.web.js). Nothing on the page is example content: every thread, reply, photo,
   group and number comes from the site.

   How the messages travel:
     look page  -> forum.html (relay) -> Wix HTML box -> page code on /community-forum -> backend
   and the replies come back the same way. Messages look like
     { source: "ukag-forum", id, action, payload }      (asking)
     { source: "ukag-forum", id, ok, data, error }      (answer)
     { source: "ukag-forum", event: "session", data }   (log in or out happened)

   Each look loads this file and calls ForumLive.start({ look: "clean" | "hud" }).
   It builds the page's <main> (sections, one shown at a time like before), fills the key details box
   and the section bar, and keeps everything in step with the member's log in. */
(function () {
  "use strict";

  var SITE = "https://www.ukairshowguide.co.uk/";
  var HUB = SITE + "my-airshow-hub";
  var SHOWDAY = SITE + "show-day-live";
  var IMG = "https://jskedge1.github.io/airshow-pages/forum-img/";

  /* groups behind the themed sections */
  var G_BUDDY = "meet-ups-and-site-feedback";
  var G_RARE = "plane-spotting-and-line-ups";
  var G_KIT = "kit-gear-and-buy-and-sell";

  var S = { member: null, groups: [], connected: false, look: "clean", feedGroup: "", btn: {} };

  /* ---------- small helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function paras(text) {
    return esc(text).split(/\n{2,}/).map(function (p) { return "<p>" + p.replace(/\n/g, "<br>") + "</p>"; }).join("");
  }
  function ago(isoDate) {
    if (!isoDate) return "";
    var s = (Date.now() - new Date(isoDate).getTime()) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) { var h = Math.floor(s / 3600); return h + (h === 1 ? " hour ago" : " hours ago"); }
    if (s < 86400 * 7) { var d = Math.floor(s / 86400); return d === 1 ? "yesterday" : d + " days ago"; }
    return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join("") || "?";
  }
  function avatar(name, colour, photo) {
    if (photo) return '<span class="fl-av"><img src="' + esc(photo) + '" alt="" loading="lazy" decoding="async"></span>';
    return '<span class="fl-av" style="background:' + esc(colour || "#32B4AF") + '">' + esc(initials(name)) + "</span>";
  }
  function groupTitle(slug) {
    var g = S.groups.filter(function (x) { return x.slug === slug; })[0];
    return g ? g.title : "";
  }
  var toastT;
  function toast(msg) {
    var t = $("#fl-toast");
    if (!t) { t = document.createElement("div"); t.id = "fl-toast"; t.className = "fl-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 4200);
  }

  /* ---------- talking to the site ---------- */
  var seq = 0, waiting = {};
  function call(action, payload) {
    return new Promise(function (resolve) {
      var id = "f" + (++seq) + "-" + Date.now().toString(36);
      var timer = setTimeout(function () {
        delete waiting[id];
        resolve({ ok: false, error: "The forum didn't answer. Please check your connection and try again.", timeout: true });
      }, 20000);
      waiting[id] = function (msg) { clearTimeout(timer); resolve(msg); };
      try {
        window.parent.postMessage({ source: "ukag-forum", id: id, action: action, payload: payload || {} }, "*");
      } catch (e) {
        clearTimeout(timer); delete waiting[id];
        resolve({ ok: false, error: "The forum couldn't connect." });
      }
    });
  }
  window.addEventListener("message", function (e) {
    var m = e.data;
    if (!m || m.source !== "ukag-forum") return;
    if (m.event === "session") { setMember(m.data && m.data.member); return; }
    if (m.id && waiting[m.id]) { var f = waiting[m.id]; delete waiting[m.id]; f(m); }
  });

  function login(mode) {
    call(mode === "signup" ? "signup" : "login").then(function (r) {
      if (!r.ok && !r.timeout) toast(r.error || "Login was cancelled.");
    });
  }
  function needMember(mode) {
    if (S.member) return true;
    login(mode);
    return false;
  }

  /* ---------- styles ---------- */
  var CSS = [
    ".fl{--fl-card:#fff;--fl-ink:#13293C;--fl-text:#26394A;--fl-mut:#5A6B78;--fl-line:#DCE3E8;--fl-acc:#32B4AF;--fl-acc-ink:#0E5F5B;--fl-pur:#6950A1;--fl-red:#D74949;--fl-soft:#F2F4F5;--fl-shadow:0 8px 22px rgba(19,41,60,.07);--fl-in:#fff}",
    ".fl.hud{--fl-card:rgba(14,33,49,.82);--fl-ink:#EAF6F8;--fl-text:#D3E3EA;--fl-mut:#93AAB8;--fl-line:rgba(50,180,175,.28);--fl-acc:#32B4AF;--fl-acc-ink:#7FE3DE;--fl-pur:#8B74D0;--fl-red:#FF6B6B;--fl-soft:rgba(255,255,255,.05);--fl-shadow:0 10px 30px rgba(0,0,0,.35);--fl-in:rgba(5,16,24,.7)}",
    ".fl-panel{background:var(--fl-card);border:1px solid var(--fl-line);box-shadow:var(--fl-shadow);color:var(--fl-text)}",
    ".fl.hud .fl-panel{-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
    ".fl-split{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:22px;align-items:start}",
    ".fl-col{display:grid;gap:14px;min-width:0}",
    ".fl-compose{padding:20px}",
    ".fl-compose h3,.fl-box h3{font:800 22px/1.1 'Barlow Condensed','Barlow',sans-serif;text-transform:uppercase;color:var(--fl-ink);margin:0 0 6px;letter-spacing:.01em}",
    ".fl-compose p.fl-lead{margin:0 0 12px;color:var(--fl-mut);font-size:15px}",
    ".fl-field{display:grid;gap:5px;margin-bottom:10px}",
    ".fl-field label{font:600 14px 'Barlow',sans-serif;color:var(--fl-acc-ink)}",
    ".fl input[type=text],.fl input[type=search],.fl select,.fl textarea{font:500 16px 'Barlow',sans-serif;color:var(--fl-ink);background:var(--fl-in);border:1px solid var(--fl-line);border-bottom:3px solid var(--fl-acc);padding:10px 12px;width:100%;box-sizing:border-box}",
    ".fl textarea{min-height:110px;resize:vertical;line-height:1.5}",
    ".fl input:focus,.fl select:focus,.fl textarea:focus{outline:3px solid var(--fl-pur);outline-offset:1px}",
    ".fl-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}",
    ".fl-count{font-size:14px;color:var(--fl-mut)}",
    ".fl-as{display:flex;align-items:center;gap:10px;font-size:15px;color:var(--fl-mut)}",
    ".fl-as b{color:var(--fl-ink)}",
    ".fl-av{flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:#fff;font:700 15px 'Barlow',sans-serif;overflow:hidden}",
    ".fl-av img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}",
    ".fl-list{display:grid;gap:10px}",
    ".fl-post{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;padding:16px 18px;cursor:pointer;text-align:left;width:100%;font:inherit;transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s,border-color .3s}",
    ".fl-post:hover,.fl-post:focus-visible{transform:translateY(-2px);border-color:var(--fl-acc)}",
    ".fl-post:focus-visible{outline:3px solid var(--fl-pur);outline-offset:2px}",
    ".fl-post h4{margin:0 0 4px;font:700 18px/1.25 'Barlow',sans-serif;color:var(--fl-ink)}",
    ".fl-post p{margin:0;font-size:15.5px;line-height:1.5;color:var(--fl-text)}",
    ".fl-meta{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin-top:8px;font-size:14px;color:var(--fl-mut)}",
    ".fl-tag{display:inline-block;font:600 13px 'Barlow',sans-serif;padding:3px 8px;background:var(--fl-soft);color:var(--fl-acc-ink);border:1px solid var(--fl-line)}",
    ".fl-tag.pin{background:var(--fl-pur);color:#fff;border-color:var(--fl-pur)}",
    ".fl-empty{padding:26px 22px;text-align:left}",
    ".fl-empty h4{margin:0 0 6px;font:800 22px/1.1 'Barlow Condensed','Barlow',sans-serif;text-transform:uppercase;color:var(--fl-ink)}",
    ".fl-empty p{margin:0 0 14px;color:var(--fl-text);font-size:16px;line-height:1.55;max-width:62ch}",
    ".fl-box{padding:18px}",
    ".fl-box p{margin:0 0 10px;font-size:15.5px;line-height:1.55}",
    ".fl-groups{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}",
    ".fl-group{padding:16px;border-top:5px solid var(--fl-acc);cursor:pointer;text-align:left;font:inherit;width:100%;transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s}",
    ".fl-group:nth-child(3n+2){border-top-color:var(--fl-pur)}.fl-group:nth-child(3n){border-top-color:var(--fl-red)}",
    ".fl-group:hover,.fl-group:focus-visible{transform:translateY(-3px)}",
    ".fl-group h4{margin:0 0 4px;font:700 18px/1.2 'Barlow',sans-serif;color:var(--fl-ink)}",
    ".fl-group p{margin:0 0 10px;font-size:15px;line-height:1.5;color:var(--fl-text)}",
    ".fl-group small{font-size:14px;color:var(--fl-mut)}",
    ".fl-filter{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}",
    ".fl-filter select{width:auto;min-width:230px}",
    ".fl-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}",
    ".fl-photo{position:relative;padding:0;border:0;cursor:pointer;background:#13293C;aspect-ratio:3/2;overflow:hidden;font:inherit}",
    ".fl-photo img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;transition:transform .8s cubic-bezier(.2,.7,.2,1)}",
    ".fl-photo:hover img{transform:scale(1.04)}",
    ".fl-photo span{position:absolute;left:0;right:0;bottom:0;padding:22px 10px 8px;background:linear-gradient(0deg,rgba(11,23,34,.85),transparent);color:#fff;font:600 14px 'Barlow',sans-serif;text-align:left}",
    ".fl-tip{border-left:4px solid var(--fl-pur);padding:12px 14px;background:var(--fl-soft);font-size:15.5px;line-height:1.55;color:var(--fl-text);margin-top:14px}",
    ".fl-tip b{color:var(--fl-ink)}",
    ".fl-modal{position:fixed;inset:0;z-index:9999;background:rgba(5,12,17,.62);display:flex;align-items:flex-start;justify-content:center;padding:4vh 14px;overflow:auto}",
    ".fl-modal[hidden]{display:none}",
    ".fl-sheet{width:min(760px,100%);padding:24px 24px 20px;position:relative}",
    ".fl-sheet h3{margin:0 40px 6px 0;font:800 28px/1.05 'Barlow Condensed','Barlow',sans-serif;text-transform:uppercase;color:var(--fl-ink)}",
    ".fl-x{position:absolute;right:12px;top:12px;width:36px;height:36px;border:1px solid var(--fl-line);background:var(--fl-soft);color:var(--fl-ink);font-size:20px;cursor:pointer}",
    ".fl-body{margin:14px 0;font-size:16.5px;line-height:1.6;color:var(--fl-text)}",
    ".fl-body p{margin:0 0 10px}",
    ".fl-acts{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 14px}",
    ".fl-act{font:600 14px 'Barlow',sans-serif;padding:7px 12px;border:1px solid var(--fl-line);background:var(--fl-soft);color:var(--fl-ink);cursor:pointer}",
    ".fl-act[aria-pressed=true]{background:var(--fl-acc);border-color:var(--fl-acc);color:#06222A}",
    ".fl-act.red{color:var(--fl-red)}",
    ".fl-comments{display:grid;gap:10px;margin:8px 0 14px}",
    ".fl-c{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;padding:12px;background:var(--fl-soft);border:1px solid var(--fl-line)}",
    ".fl-c p{margin:0;font-size:15.5px;line-height:1.5;color:var(--fl-text)}",
    ".fl-c .fl-meta{margin-top:4px}",
    ".fl-adm{display:grid;gap:8px}",
    ".fl-adm .fl-c{grid-template-columns:minmax(0,1fr) auto;align-items:center}",
    ".fl-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:14px}",
    ".fl-stats div{padding:12px;background:var(--fl-soft);border:1px solid var(--fl-line)}",
    ".fl-stats b{display:block;font:800 26px/1 'Barlow Condensed','Barlow',sans-serif;color:var(--fl-ink)}",
    ".fl-stats small{font-size:14px;color:var(--fl-mut)}",
    ".fl-note{font-size:14px;color:var(--fl-mut);margin:8px 0 0}",
    ".fl-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:10000;background:#13293C;color:#fff;padding:12px 18px;font:500 15px 'Barlow',sans-serif;max-width:calc(100% - 28px);box-shadow:0 10px 30px rgba(0,0,0,.3);border-bottom:3px solid #32B4AF}",
    ".fl-toast[hidden]{display:none}",
    ".fl-sr{position:absolute;left:-9999px}",
    "@media(max-width:900px){.fl-split{grid-template-columns:minmax(0,1fr)}.fl-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}",
    "@media(prefers-reduced-motion:reduce){.fl-post,.fl-group,.fl-photo img{transition:none}}"
  ].join("\n");

  /* ---------- section shells (each look keeps its own section heading style) ---------- */
  var SECTIONS = [
    { id: "feed", nav: "News feed", title: "News feed", grey: true,
      intro: "Every new thread from every group lands here, newest first. Pick a group, give your post a title and say what's on your mind. I would suggest a quick look through the threads before you ask, as someone may have had the same question." },
    { id: "groups", nav: "Groups", title: "Groups",
      intro: "Each group is a topic, from first timers and families to parking, camping and museums. Tap a group to see its threads. Can't see the one you want? Suggest it at the bottom and I'll take a look." },
    { id: "corner", nav: "Photographer's corner", title: "Photographer's corner", grey: true,
      intro: "Share your shots, ask for help with your settings and see how other members edit. Beginners are really welcome here, and I would suggest adding your camera settings so others can learn from them." },
    { id: "buddy", nav: "Buddy board", title: "Buddy board",
      intro: "Going on your own? Post the show and the day you're going, and find someone to meet up with, share a lift or pitch your tents next to each other." },
    { id: "rarity", nav: "Rarity log", title: "Rarity log", grey: true,
      intro: "Spotted something rare? Post it here with the show and the year, so everyone can see what turned up. A photo always helps." },
    { id: "kit", nav: "Kit swap", title: "Kit swap",
      intro: "Members selling or swapping cameras, lenses and camping kit. Payment and collection are sorted between you, so I would suggest meeting at a show or paying in a way that protects you. Please never send money by bank transfer to someone you haven't met." },
    { id: "live", nav: "Show day live", title: "Show day live", grey: true,
      intro: "On show day, members post what they can see as it happens: car parks filling up, queues, delays and what is flying. That all lives on the Show Day Live page." },
    { id: "how", nav: "How it works", title: "How it works",
      intro: "It's free to join and there are no adverts in the forum. You use the same log in as My Airshow Hub." },
    { id: "admin", nav: "Admin", title: "Admin queue", grey: true, admin: true,
      intro: "Only you and your moderators see this. Reported posts, reported photos and group suggestions wait here until you deal with them." }
  ];

  function shell(sec) {
    var head = S.look === "hud"
      ? '<div class="sh"><div><h2>' + esc(sec.title) + "</h2><p>" + esc(sec.intro) + "</p></div></div>"
      : '<div class="sec-head"><h2>' + esc(sec.title) + "</h2><p>" + esc(sec.intro) + "</p></div>";
    var cls = "sec" + (S.look === "clean" && sec.grey ? " grey" : "");
    return '<section class="' + cls + '" id="' + sec.id + '"' + (sec.admin ? " data-admin hidden" : "") + '><div class="wrap">' + head +
      '<div class="fl' + (S.look === "hud" ? " hud" : "") + '" data-mount="' + sec.id + '"></div></div></section>';
  }

  function btn(kind, label, attrs) {
    var cls = (S.btn[kind] || S.btn.main || "btn");
    return '<button type="button" class="' + cls + '" ' + (attrs || "") + ">" + label + "</button>";
  }
  function linkBtn(kind, label, href) {
    var cls = (S.btn[kind] || S.btn.main || "btn");
    return '<a class="' + cls + '" href="' + esc(href) + '" target="_top">' + label + "</a>";
  }

  /* ---------- tabs: one section at a time, so every view fits the Wix box ---------- */
  var current = "feed";
  function visibleSections() {
    return SECTIONS.filter(function (s) { return !s.admin || (S.member && S.member.isAdmin); });
  }
  function show(id, scroll) {
    var ids = visibleSections().map(function (s) { return s.id; });
    if (ids.indexOf(id) < 0) id = "feed";
    current = id;
    $$("main .sec").forEach(function (sec) {
      if (sec.id === id) sec.removeAttribute("data-off"); else sec.setAttribute("data-off", "");
    });
    $$(".jump a").forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    buildMore();
    if (scroll) {
      var t = $("#" + id);
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (id === "corner") loadGallery();
    if (id === "admin") loadAdmin();
  }
  function buildNav() {
    var nav = $(".jump .wrap") || $(".jump");
    if (!nav) return;
    nav.innerHTML = visibleSections().map(function (s) { return '<a href="#' + s.id + '">' + esc(s.nav) + "</a>"; }).join("");
  }
  function buildMore() {
    var more = $("#more");
    if (!more) return;
    more.innerHTML = "<b>More of the forum</b>" + visibleSections().filter(function (s) { return s.id !== current; })
      .map(function (s) { return '<a class="chip" href="#' + s.id + '">' + esc(s.nav) + "</a>"; }).join("");
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (SECTIONS.some(function (s) { return s.id === id; })) {
      e.preventDefault();
      show(id, true);
    } else if (id === "top") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  /* ---------- key details box ---------- */
  function setStat(key, value) {
    $$('[data-fl-stat="' + key + '"]').forEach(function (el) { el.textContent = value; });
  }
  function fillStats() {
    var threads = S.groups.reduce(function (n, g) { return n + (g.threadCount || 0); }, 0);
    setStat("groups", String(S.groups.length));
    setStat("threads", String(threads));
  }

  /* ---------- member state ---------- */
  function setMember(m) {
    S.member = m || null;
    $$("[data-fl-who]").forEach(function (el) {
      el.textContent = S.member ? "Logged in as " + S.member.name : "Not logged in";
    });
    $$("[data-fl-login]").forEach(function (el) { el.hidden = !!S.member; });
    $$("[data-fl-out]").forEach(function (el) { el.hidden = !S.member; });
    var adminSec = $("#admin");
    if (adminSec) adminSec.hidden = !(S.member && S.member.isAdmin);
    buildNav();
    renderCompose();
    show(current, false);
    if (S.member && S.look === "clean") { if (S.groups.length) boardStart(); else loadGroups().then(boardStart); }
    else boardStop();
  }

  /* ---------- feed ---------- */
  function groupOptions(selected, onlySlugs) {
    return S.groups.filter(function (g) { return !onlySlugs || onlySlugs.indexOf(g.slug) >= 0; })
      .map(function (g) { return '<option value="' + esc(g.slug) + '"' + (g.slug === selected ? " selected" : "") + ">" + esc(g.title) + "</option>"; }).join("");
  }
  function composeHtml(idp, fixedGroup, heading, lead, placeholderTitle, placeholderBody) {
    if (!S.member) {
      return '<div class="fl-panel fl-compose"><h3>' + esc(heading) + '</h3><p class="fl-lead">Log in or join free to post. It is the same log in as My Airshow Hub.</p>' +
        '<div class="fl-row" style="justify-content:flex-start">' + btn("main", "Log in to post", 'data-fl-act="login"') + btn("alt", "Join free", 'data-fl-act="signup"') + "</div></div>";
    }
    var groupField = fixedGroup
      ? '<input type="hidden" name="group" value="' + esc(fixedGroup) + '">'
      : '<div class="fl-field"><label for="' + idp + 'g">Group</label><select id="' + idp + 'g" name="group" required><option value="">Choose a group</option>' + groupOptions(S.feedGroup) + "</select></div>";
    return '<form class="fl-panel fl-compose" data-fl-compose novalidate><h3>' + esc(heading) + '</h3><p class="fl-lead">' + esc(lead) + "</p>" +
      groupField +
      '<div class="fl-field"><label for="' + idp + 't">Title</label><input type="text" id="' + idp + 't" name="title" maxlength="120" placeholder="' + esc(placeholderTitle) + '" required></div>' +
      '<div class="fl-field"><label for="' + idp + 'b">Your post</label><textarea id="' + idp + 'b" name="body" maxlength="5000" placeholder="' + esc(placeholderBody) + '" required></textarea></div>' +
      '<div class="fl-row"><span class="fl-as">' + avatar(S.member.name, S.member.colour, S.member.photo) + "<span>Posting as <b>" + esc(S.member.name) + "</b></span></span>" +
      '<button type="submit" class="' + (S.btn.main || "btn") + '">Post it</button></div></form>';
  }
  function renderCompose() {
    var spots = [
      ["feed", "flc", "", "Start a thread", "What did you see? Ask a question, share a tip or tell a story from the crowd line.", "e.g. First time at Cosford next year", "e.g. Is it worth getting there before the gates open, or does it all move quickly?"],
      ["buddy", "flb", G_BUDDY, "Post a meet up", "Say which show, which day, and what you are looking for, like a lift, a meet up or a camping neighbour.", "e.g. Going to RIAT on the Saturday, anyone want to meet up?", "e.g. Travelling from Essex by train, happy to meet at the main entrance at 9."],
      ["rarity", "flr", G_RARE, "Log a rare aircraft", "Add the aircraft, the show and the year. A photo in Photographer's corner always helps.", "e.g. Indian Air Force Su-30 at RIAT 2027", "e.g. Seen arriving on the Thursday, flew the Saturday only."],
      ["kit", "flk", G_KIT, "List an item", "Say what it is, the condition, the price or what you'd swap it for, and where you could meet.", "e.g. For sale: Nikon 200-500mm, very good condition", "e.g. Happy to meet at Duxford or Cosford. Shutter count, any marks and what's included."]
    ];
    spots.forEach(function (sp) {
      var box = $('[data-fl-compose-slot="' + sp[0] + '"]');
      if (box) box.innerHTML = composeHtml(sp[1], sp[2], sp[3], sp[4], sp[5], sp[6]);
    });
  }
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest("[data-fl-compose]");
    if (!f) return;
    e.preventDefault();
    if (!needMember()) return;
    var group = f.group.value, title = f.title.value.trim(), body = f.body.value.trim();
    if (!group) { toast("Choose a group for your thread."); return; }
    if (title.length < 4) { toast("Give your thread a title of at least 4 characters."); return; }
    if (body.length < 2) { toast("Add a few words to your post."); return; }
    var b = f.querySelector('button[type="submit"]');
    var isQ = !!(f.isQuestion && f.isQuestion.checked), pic = boardOn() && f.closest(".bd-compose") ? B.photo : null;
    if (pic && !(f.ownPhoto && f.ownPhoto.checked)) { toast("Please confirm the photo is your own."); return; }
    var label = b.textContent;
    b.disabled = true; b.textContent = pic ? "Uploading your photo" : "Posting";
    var before = pic ? uploadPhoto(pic.file, {
      title: title, category: (f.photoCat && f.photoCat.value) || CATS[0], showName: "", aircraft: "",
      camera: exifVal(f, "camera"), lens: exifVal(f, "lens"), focal: exifVal(f, "focal"), shutter: exifVal(f, "shutter"), aperture: exifVal(f, "aperture"), iso: exifVal(f, "iso"),
      description: body.slice(0, 1500), adviceWanted: false
    }, function (pct) { b.textContent = "Uploading " + pct + "%"; }) : Promise.resolve(null);
    before.then(function (photoId) {
      b.textContent = "Posting";
      var full = photoId ? body + "\n\n[[photo:" + photoId + "]]" : body;
      return call("createThread", { groupSlug: group, title: title, body: full, isQuestion: isQ, hasPhoto: !!photoId });
    }).catch(function (err) { return { ok: false, error: err.message || "The photo didn't upload. Please try again." }; }).then(function (r) {
      b.textContent = label;
      if (r.ok) { B.photo = null; if (r.data.id && B.fol.threads.indexOf(r.data.id) < 0) B.fol.threads.push(r.data.id); }
      if (r.ok && r.data && r.data.pending) {
        b.disabled = false; f.reset();
        toast(r.data.reason === "words" ? "Thanks. Your post is waiting to be checked before it goes live." : "Thanks. As it's your first post, it will show once I've checked it. That's usually within a day.");
        if (boardOn()) boardGo("group", group);
        return;
      }
      b.disabled = false;
      if (!r.ok) { toast(r.error); return; }
      f.reset();
      toast("Posted. Thanks for starting the chat.");
      var g = S.groups.filter(function (x) { return x.slug === group; })[0];
      if (g) g.threadCount = (g.threadCount || 0) + 1;
      fillStats(); renderGroups(); refreshLists();
      openThread(r.data.id);
    });
  });

  function postCard(t) {
    var g = groupTitle(t.groupSlug);
    return '<button type="button" class="fl-panel fl-post" data-fl-thread="' + esc(t.id) + '">' + avatar(t.authorName, t.authorColour, t.authorPhoto) +
      "<span><h4>" + esc(t.title) + "</h4><p>" + esc(t.preview || "") + (t.preview && t.preview.length >= 180 ? "…" : "") + "</p>" +
      '<span class="fl-meta">' + (t.pinned ? '<span class="fl-tag pin">Pinned</span>' : "") + (g ? '<span class="fl-tag">' + esc(g) + "</span>" : "") +
      "<span>" + esc(t.authorName) + "</span><span>" + esc(ago(t.lastActivity || t.created)) + "</span><span>" + (t.commentCount || 0) + (t.commentCount === 1 ? " reply" : " replies") + "</span><span>" + (t.likeCount || 0) + (t.likeCount === 1 ? " like" : " likes") + "</span>" +
      (t.locked ? "<span>Replies closed</span>" : "") + "</span></span></button>";
  }
  function emptyBox(title, text, extra) {
    return '<div class="fl-panel fl-empty"><h4>' + esc(title) + "</h4><p>" + esc(text) + "</p>" + (extra || "") + "</div>";
  }
  function loadingBox() { return '<div class="fl-panel fl-empty"><p>Loading the latest posts.</p></div>'; }
  function offlineBox(r) {
    return emptyBox("The forum couldn't load", (r && r.error) || "Please try again in a moment.",
      '<p class="fl-note">If you are reading this outside the website, <a href="' + SITE + 'community-forum" target="_top">open the forum on The Big Guide to UK Airshows</a>.</p>');
  }

  var listSpots = {};
  function threadList(mountSel, slug, emptyTitle, emptyText) {
    listSpots[mountSel] = { slug: slug, emptyTitle: emptyTitle, emptyText: emptyText };
    var box = $(mountSel);
    if (!box) return;
    box.innerHTML = loadingBox();
    call("listThreads", { groupSlug: slug || "" }).then(function (r) {
      if (!r.ok) { box.innerHTML = offlineBox(r); return; }
      var list = r.data || [];
      box.innerHTML = list.length ? '<div class="fl-list">' + list.map(postCard).join("") + "</div>"
        : emptyBox(emptyTitle, emptyText);
    });
  }
  function refreshLists() {
    Object.keys(listSpots).forEach(function (k) { var s = listSpots[k]; threadList(k, s.slug, s.emptyTitle, s.emptyText); });
  }

  function feedList() {
    var title = S.feedGroup ? groupTitle(S.feedGroup) : "";
    threadList("[data-fl-feed]", S.feedGroup,
      S.feedGroup ? "No threads in " + title + " yet" : "No threads yet",
      S.feedGroup ? "Nobody has posted in this group yet. You could be the first." : "The forum has just opened, so it's quiet for now. Start the first thread and get the chat going.");
    var c = $("[data-fl-feedcount]");
    if (c) c.textContent = S.feedGroup ? "Showing " + title : "Showing the latest threads from every group";
  }

  /* ---------- thread view ---------- */
  function modal() {
    var m = $("#fl-modal");
    if (!m) {
      m = document.createElement("div");
      m.id = "fl-modal"; m.className = "fl fl-modal" + (S.look === "hud" ? " hud" : ""); m.hidden = true;
      m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", "Thread");
      m.innerHTML = '<div class="fl-panel fl-sheet"><button type="button" class="fl-x" data-fl-close aria-label="Close">×</button><div data-fl-sheet></div></div>';
      document.body.appendChild(m);
      m.addEventListener("click", function (e) { if (e.target === m || e.target.closest("[data-fl-close]")) closeModal(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !m.hidden) closeModal(); });
    }
    return m;
  }
  var lastFocus = null;
  function openModal(html) {
    var m = modal();
    lastFocus = document.activeElement;
    $("[data-fl-sheet]", m).innerHTML = html;
    m.hidden = false;
    var x = $(".fl-x", m); if (x) x.focus();
  }
  function closeModal() {
    var m = $("#fl-modal"); if (!m) return;
    m.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  var openId = null;
  function openThread(id) {
    if (boardOn()) { if (B.view === "thread" && B.thread === id) boardGo("thread", id, true); else boardGo("thread", id); return; }
    openId = id;
    openModal("<p>Opening the thread.</p>");
    call("getThread", { threadId: id }).then(function (r) {
      if (!r.ok) { openModal("<h3>Thread not found</h3><p>" + esc(r.error) + "</p>"); return; }
      renderThread(r.data);
    });
  }
  function renderThread(d) {
    var t = d.thread, me = S.member;
    var mine = me && (me.id === t.authorId || me.isAdmin);
    var g = groupTitle(t.groupSlug);
    var replyBox = !me
      ? '<div class="fl-row" style="justify-content:flex-start">' + btn("main", "Log in to reply", 'data-fl-act="login"') + btn("alt", "Join free", 'data-fl-act="signup"') + "</div>"
      : t.locked && !me.isAdmin ? '<p class="fl-note">Replies are closed on this thread.</p>'
      : '<form data-fl-reply novalidate><label class="fl-sr" for="flReply">Your reply</label><textarea id="flReply" name="body" maxlength="2000" placeholder="Write a reply"></textarea>' +
        '<div class="fl-row" style="margin-top:8px"><span class="fl-as">' + avatar(me.name, me.colour, me.photo) + "<span>Replying as <b>" + esc(me.name) + "</b></span></span>" +
        '<button type="submit" class="' + (S.btn.main || "btn") + '">Reply</button></div></form>';
    var comments = d.comments.map(function (c) {
      var cm = me && (me.id === c.authorId || me.isAdmin);
      return '<div class="fl-c">' + avatar(c.authorName, c.authorColour, c.authorPhoto) + "<div><p>" + esc(c.body) + "</p>" +
        '<span class="fl-meta"><span>' + esc(c.authorName) + "</span><span>" + esc(ago(c.created)) + "</span>" +
        (me ? '<button type="button" class="fl-act" data-fl-report="comment" data-id="' + esc(c.id) + '">Report</button>' : "") +
        (cm ? '<button type="button" class="fl-act red" data-fl-delc="' + esc(c.id) + '">Delete</button>' : "") + "</span></div></div>";
    }).join("");
    openModal("<h3>" + esc(t.title) + "</h3>" +
      '<span class="fl-meta">' + (g ? '<span class="fl-tag">' + esc(g) + "</span>" : "") + '<span class="fl-as" style="gap:8px">' + avatar(t.authorName, t.authorColour, t.authorPhoto) + esc(t.authorName) + "</span><span>" + esc(ago(t.created)) + "</span></span>" +
      '<div class="fl-body">' + paras(t.body) + "</div>" +
      '<div class="fl-acts"><button type="button" class="fl-act" data-fl-like="' + esc(t.id) + '" aria-pressed="' + (d.liked ? "true" : "false") + '">Like · <span>' + (t.likeCount || 0) + "</span></button>" +
      (me ? '<button type="button" class="fl-act" data-fl-report="thread" data-id="' + esc(t.id) + '">Report</button>' : "") +
      (mine ? '<button type="button" class="fl-act red" data-fl-delt="' + esc(t.id) + '">Delete thread</button>' : "") + "</div>" +
      "<h4 class=\"fl-sr\">Replies</h4>" + (d.comments.length ? '<div class="fl-comments">' + comments + "</div>" : '<p class="fl-note">No replies yet.</p>') +
      replyBox);
  }
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest("[data-fl-reply]");
    if (!f) return;
    e.preventDefault();
    var body = f.body.value.trim();
    if (!body) { toast("Write something before you reply."); return; }
    var b = f.querySelector('button[type="submit"]'); b.disabled = true;
    call("addComment", { threadId: openId, body: body }).then(function (r) {
      b.disabled = false;
      if (!r.ok) { toast(r.error); return; }
      if (r.data && r.data.pending) { f.reset(); toast("Thanks. Your reply will show once it has been checked. That's usually within a day."); return; }
      if (boardOn() && B.fol.threads.indexOf(openId) < 0) B.fol.threads.push(openId);
      openThread(openId); refreshLists();
    });
  });

  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-fl-thread],[data-fl-act],[data-fl-like],[data-fl-report],[data-fl-delt],[data-fl-delc],[data-fl-group],[data-fl-photo],[data-fl-adm]");
    if (!el) return;
    if (el.hasAttribute("data-fl-thread")) { openThread(el.getAttribute("data-fl-thread")); return; }
    if (el.hasAttribute("data-fl-act")) {
      var a = el.getAttribute("data-fl-act");
      if (a === "login" || a === "signup") login(a);
      if (a === "logout") call("logout");
      if (a === "share") openShare();
      if (a === "suggest") openSuggest();
      if (a === "more-photos") loadGallery(true);
      return;
    }
    if (el.hasAttribute("data-fl-like")) {
      if (!needMember()) return;
      var tid = el.getAttribute("data-fl-like");
      el.disabled = true;
      var isPhoto = el.hasAttribute("data-photo");
      call(isPhoto ? "toggleGalleryLike" : "toggleLike", isPhoto ? { photoId: tid } : { threadId: tid }).then(function (r) {
        el.disabled = false;
        if (!r.ok) { toast(r.error); return; }
        el.setAttribute("aria-pressed", r.data.liked ? "true" : "false");
        var n = el.querySelector("span"); if (n) n.textContent = r.data.likeCount;
        if (!isPhoto) refreshLists();
      });
      return;
    }
    if (el.hasAttribute("data-fl-report")) {
      if (!needMember()) return;
      call("report", { targetType: el.getAttribute("data-fl-report"), targetId: el.getAttribute("data-id"), reason: "Reported from the forum" }).then(function (r) {
        toast(r.ok ? "Thanks. I'll take a look at it." : r.error);
        if (r.ok) { el.disabled = true; el.textContent = "Reported"; }
      });
      return;
    }
    if (el.hasAttribute("data-fl-delt")) {
      if (el.getAttribute("data-sure") !== "1") { el.setAttribute("data-sure", "1"); el.textContent = "Tap again to delete"; return; }
      call("deleteOwnPost", { targetType: "thread", targetId: el.getAttribute("data-fl-delt") }).then(function (r) {
        if (!r.ok) { toast(r.error); return; }
        closeModal(); toast("Thread deleted."); loadGroups().then(function () { if (boardOn()) boardGo("home", "", true); }); refreshLists();
      });
      return;
    }
    if (el.hasAttribute("data-fl-delc")) {
      if (el.getAttribute("data-sure") !== "1") { el.setAttribute("data-sure", "1"); el.textContent = "Tap again"; return; }
      call("deleteOwnPost", { targetType: "comment", targetId: el.getAttribute("data-fl-delc") }).then(function (r) {
        if (!r.ok) { toast(r.error); return; }
        openThread(openId); refreshLists();
      });
      return;
    }
    if (el.hasAttribute("data-fl-group") && boardOn()) { boardGo("group", el.getAttribute("data-fl-group")); return; }
    if (el.hasAttribute("data-fl-group")) {
      S.feedGroup = el.getAttribute("data-fl-group");
      var sel = $("[data-fl-feedsel]"); if (sel) sel.value = S.feedGroup;
      feedList(); renderCompose(); show("feed", true);
      return;
    }
    if (el.hasAttribute("data-fl-photo")) { openPhoto(el.getAttribute("data-fl-photo")); return; }
    if (el.hasAttribute("data-fl-adm")) { adminDo(el); }
  });

  /* ---------- groups ---------- */
  function loadGroups() {
    return call("listGroups").then(function (r) {
      if (!r.ok) {
        var gb = $("[data-fl-groups]"); if (gb) gb.innerHTML = offlineBox(r);
        return r;
      }
      S.connected = true;
      S.groups = r.data || [];
      fillStats(); renderGroups(); renderCompose();
      var sel = $("[data-fl-feedsel]");
      if (sel) sel.innerHTML = '<option value="">Every group</option>' + groupOptions(S.feedGroup);
      return r;
    });
  }
  function groupCard(g) {
    return '<button type="button" class="fl-panel fl-group" data-fl-group="' + esc(g.slug) + '"><h4>' + esc(g.title) + "</h4>" +
      (g.description ? "<p>" + esc(g.description) + "</p>" : "") +
      "<small>" + (g.threadCount || 0) + ((g.threadCount === 1) ? " thread" : " threads") + (g.lastActivity && g.threadCount ? " · last post " + esc(ago(g.lastActivity)) : "") + "</small></button>";
  }
  function renderGroups() {
    var box = $("[data-fl-groups]");
    if (box) box.innerHTML = S.groups.length
      ? '<div class="fl-groups">' + S.groups.filter(function (g) { return g.category !== "corner"; }).map(groupCard).join("") + "</div>"
      : emptyBox("No groups yet", "Groups will show here as soon as they are set up.");
    var cb = $("[data-fl-cornergroups]");
    if (cb) {
      var cg = S.groups.filter(function (g) { return g.category === "corner"; });
      cb.innerHTML = cg.length ? '<div class="fl-groups">' + cg.map(groupCard).join("") + "</div>" : "";
    }
  }
  function openSuggest() {
    if (!needMember()) return;
    openModal('<h3>Suggest a group</h3><p>Can\'t see your show or topic? Tell me what the group is for and I\'ll take a look before it goes live.</p>' +
      '<form data-fl-suggest novalidate><div class="fl-field"><label for="flSg">Group name</label><input type="text" id="flSg" name="title" maxlength="60" placeholder="e.g. Headcorn Airshow"></div>' +
      '<div class="fl-field"><label for="flSd">What it would be for</label><textarea id="flSd" name="description" maxlength="200" placeholder="e.g. Planning, parking and camping for the Headcorn show"></textarea></div>' +
      '<button type="submit" class="' + (S.btn.main || "btn") + '">Send to Jack</button></form>');
  }
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest("[data-fl-suggest]");
    if (!f) return;
    e.preventDefault();
    call("requestGroup", { title: f.title.value, description: f.description.value }).then(function (r) {
      if (!r.ok) { toast(r.error); return; }
      closeModal(); toast("Thanks. Your group idea is with me.");
    });
  });

  /* ---------- photographer's corner gallery ---------- */
  var gallery = { loaded: false, skip: 0, list: [] };
  function loadGallery(more) {
    var box = $("[data-fl-gallery]");
    if (!box) return;
    if (gallery.loaded && !more) return;
    if (!more) { gallery.skip = 0; gallery.list = []; box.innerHTML = loadingBox(); }
    call("listGallery", { skip: gallery.skip }).then(function (r) {
      if (!r.ok) { box.innerHTML = offlineBox(r); return; }
      gallery.loaded = true;
      gallery.list = gallery.list.concat(r.data.photos || []);
      gallery.skip = gallery.list.length;
      setStat("photos", String(gallery.list.length) + (r.data.more ? "+" : ""));
      if (!gallery.list.length) {
        box.innerHTML = emptyBox("No photos shared yet", "Be the first to share one. Add the show, the aircraft and your settings, and other members can learn from it.");
        return;
      }
      box.innerHTML = '<div class="fl-gallery">' + gallery.list.map(function (p) {
        return '<button type="button" class="fl-photo" data-fl-photo="' + esc(p.id) + '"><img src="' + esc(p.image) + '/v1/fill/w_520,h_347,q_80/p.jpg" alt="' + esc(p.title) + '" loading="lazy" decoding="async"><span>' + esc(p.title) + " · " + esc(p.authorName) + "</span></button>";
      }).join("") + "</div>" + (r.data.more ? '<div class="fl-row" style="margin-top:12px">' + btn("alt", "Show more photos", 'data-fl-act="more-photos"') + "</div>" : "");
    });
  }
  function openPhoto(id) {
    openModal("<p>Opening the photo.</p>");
    call("getGalleryPhoto", { photoId: id }).then(function (r) {
      if (!r.ok) { openModal("<h3>Photo not found</h3><p>" + esc(r.error) + "</p>"); return; }
      var p = r.data.photo, me = S.member;
      var set = [["Camera", p.camera], ["Lens", p.lens], ["Focal length", p.focal], ["Shutter", p.shutter], ["Aperture", p.aperture], ["ISO", p.iso], ["Show", p.showName], ["Aircraft", p.aircraft], ["Taken", p.takenOn]]
        .filter(function (x) { return x[1]; }).map(function (x) { return '<span class="fl-tag">' + esc(x[0]) + ": " + esc(x[1]) + "</span>"; }).join(" ");
      var comments = r.data.comments.map(function (c) {
        return '<div class="fl-c">' + avatar(c.authorName, c.authorColour, c.authorPhoto) + "<div><p>" + esc(c.body) + '</p><span class="fl-meta"><span>' + esc(c.authorName) + "</span><span>" + esc(ago(c.created)) + "</span></span></div></div>";
      }).join("");
      openModal("<h3>" + esc(p.title) + '</h3><span class="fl-meta"><span class="fl-tag">' + esc(p.category) + "</span>" + (p.adviceWanted ? '<span class="fl-tag pin">Advice wanted</span>' : "") + "<span>" + esc(p.authorName) + "</span><span>" + esc(ago(p.created)) + "</span></span>" +
        '<div class="fl-body"><img src="' + esc(p.image) + '/v1/fit/w_1400,h_1400,q_85/p.jpg" alt="' + esc(p.title) + '" style="width:100%;height:auto;display:block;pointer-events:none"><p style="margin-top:6px;font-size:14px;color:var(--fl-mut)">© ' + esc(p.authorName) + "</p>" + (p.description ? paras(p.description) : "") + "</div>" +
        (set ? '<div class="fl-acts">' + set + "</div>" : "") +
        '<div class="fl-acts"><button type="button" class="fl-act" data-photo data-fl-like="' + esc(p.id) + '" aria-pressed="' + (r.data.liked ? "true" : "false") + '">Like · <span>' + (p.likeCount || 0) + "</span></button>" +
        (me ? '<button type="button" class="fl-act" data-fl-report="photo" data-id="' + esc(p.id) + '">Report</button>' : "") + "</div>" +
        (comments ? '<div class="fl-comments">' + comments + "</div>" : '<p class="fl-note">No comments yet.</p>') +
        (me ? '<form data-fl-pcomment="' + esc(p.id) + '" novalidate><label class="fl-sr" for="flPc">Your comment</label><textarea id="flPc" name="body" maxlength="2000" placeholder="Say what you like about it, or offer a tip"></textarea><div class="fl-row" style="margin-top:8px"><span></span><button type="submit" class="' + (S.btn.main || "btn") + '">Comment</button></div></form>'
          : '<div class="fl-row" style="justify-content:flex-start">' + btn("main", "Log in to comment", 'data-fl-act="login"') + "</div>"));
    });
  }
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest("[data-fl-pcomment]");
    if (!f) return;
    e.preventDefault();
    var id = f.getAttribute("data-fl-pcomment");
    call("addGalleryComment", { photoId: id, body: f.body.value.trim() }).then(function (r) {
      if (!r.ok) { toast(r.error); return; }
      openPhoto(id);
    });
  });

  var CATS = ["Fast jets", "Display teams", "Warbirds and classics", "Helicopters", "Transport and tankers", "Static and ground", "Night shoots", "Arrivals and spotting"];
  function openShare() {
    if (!needMember()) return;
    openModal("<h3>Share a photo</h3><p>JPG or PNG. I'll make a copy up to 2048 pixels wide for the forum, so big files are fine.</p>" +
      '<form data-fl-share novalidate>' +
      '<div class="fl-field"><label for="flPf">Photo</label><input type="file" id="flPf" name="file" accept="image/jpeg,image/png,image/webp"></div>' +
      '<div class="fl-field"><label for="flPt">Title</label><input type="text" id="flPt" name="title" maxlength="90" placeholder="e.g. Typhoon vapour at RIAT"></div>' +
      '<div class="fl-field"><label for="flPc2">Category</label><select id="flPc2" name="category"><option value="">Choose one</option>' + CATS.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + "</select></div>" +
      '<div class="fl-field"><label for="flPs">Show</label><input type="text" id="flPs" name="showName" maxlength="80" placeholder="e.g. RAF Cosford Air Show"></div>' +
      '<div class="fl-field"><label for="flPa">Aircraft</label><input type="text" id="flPa" name="aircraft" maxlength="80"></div>' +
      '<div class="fl-row" style="gap:8px;justify-content:flex-start">' +
      '<div class="fl-field" style="flex:1 1 140px"><label for="flPcam">Camera</label><input type="text" id="flPcam" name="camera" maxlength="60"></div>' +
      '<div class="fl-field" style="flex:1 1 140px"><label for="flPl">Lens</label><input type="text" id="flPl" name="lens" maxlength="80"></div>' +
      '<div class="fl-field" style="flex:1 1 100px"><label for="flPsh">Shutter</label><input type="text" id="flPsh" name="shutter" maxlength="20" placeholder="1/1600"></div>' +
      '<div class="fl-field" style="flex:1 1 90px"><label for="flPap">Aperture</label><input type="text" id="flPap" name="aperture" maxlength="20" placeholder="f/8"></div>' +
      '<div class="fl-field" style="flex:1 1 80px"><label for="flPi">ISO</label><input type="text" id="flPi" name="iso" maxlength="12" placeholder="200"></div></div>' +
      '<div class="fl-field"><label for="flPd">About the shot</label><textarea id="flPd" name="description" maxlength="1500"></textarea></div>' +
      '<label class="fl-as" style="margin-bottom:8px"><input type="checkbox" name="adviceWanted"> I would like some advice on this one</label>' +
      '<label class="fl-as" style="margin-bottom:12px"><input type="checkbox" name="ownPhoto"> This is my own photo</label>' +
      '<div class="fl-row"><span class="fl-count" data-fl-up></span><button type="submit" class="' + (S.btn.main || "btn") + '">Share it</button></div></form>');
  }
  function exifVal(f, k) { var el = f.querySelector('[data-exif="' + k + '"]'); return el ? el.value.trim() : ""; }
  /* upload a member photo through the gallery pipeline, resolves with the new photo id */
  function uploadPhoto(file, meta, progress) {
    return toJpeg(file).then(function (j) {
      var CH = 280000, pieces = [];
      for (var i = 0; i < j.b64.length; i += CH) pieces.push(j.b64.slice(i, i + CH));
      return call("startGalleryUpload", { total: pieces.length }).then(function (r) {
        if (!r.ok) throw new Error(r.error);
        var uploadId = r.data.uploadId, n = 0;
        var next = function () {
          if (n >= pieces.length) return call("finishGalleryUpload", { uploadId: uploadId, total: pieces.length, meta: meta, ownPhoto: true, width: j.width, height: j.height });
          if (progress) progress(Math.round((n / pieces.length) * 100));
          return call("sendGalleryPiece", { uploadId: uploadId, index: n, data: pieces[n] }).then(function (pr) {
            if (!pr.ok) throw new Error(pr.error);
            n++; return next();
          });
        };
        return next();
      }).then(function (r) {
        if (!r || !r.ok) throw new Error((r && r.error) || "The upload didn't finish.");
        var d = r.data || {};
        gallery.loaded = false;
        return d.id || d.photoId || (d.photo && d.photo.id) || null;
      });
    });
  }
  function toJpeg(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, 2048 / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
        var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        var q = 0.86, out = cv.toDataURL("image/jpeg", q);
        while (out.length * 0.75 > 3300000 && q > 0.5) { q -= 0.08; out = cv.toDataURL("image/jpeg", q); }
        resolve({ b64: out.split(",")[1], width: w, height: h });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("That file doesn't look like a photo.")); };
      img.src = url;
    });
  }
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest("[data-fl-share]");
    if (!f) return;
    e.preventDefault();
    var file = f.file.files && f.file.files[0];
    if (!file) { toast("Choose a photo first."); return; }
    if (!f.ownPhoto.checked) { toast("Please confirm the photo is your own."); return; }
    var meta = {
      title: f.title.value, category: f.category.value, showName: f.showName.value, aircraft: f.aircraft.value,
      camera: f.camera.value, lens: f.lens.value, shutter: f.shutter.value, aperture: f.aperture.value, iso: f.iso.value,
      description: f.description.value, adviceWanted: f.adviceWanted.checked
    };
    if (meta.title.trim().length < 3) { toast("Give your photo a title of at least 3 characters."); return; }
    if (!meta.category) { toast("Choose a category for your photo."); return; }
    var status = $("[data-fl-up]", f), b = f.querySelector('button[type="submit"]');
    b.disabled = true; status.textContent = "Getting your photo ready";
    toJpeg(file).then(function (j) {
      var CH = 280000, pieces = [];
      for (var i = 0; i < j.b64.length; i += CH) pieces.push(j.b64.slice(i, i + CH));
      return call("startGalleryUpload", { total: pieces.length }).then(function (r) {
        if (!r.ok) throw new Error(r.error);
        var uploadId = r.data.uploadId, n = 0;
        var next = function () {
          if (n >= pieces.length) return call("finishGalleryUpload", { uploadId: uploadId, total: pieces.length, meta: meta, ownPhoto: true, width: j.width, height: j.height });
          status.textContent = "Uploading " + Math.round((n / pieces.length) * 100) + "%";
          return call("sendGalleryPiece", { uploadId: uploadId, index: n, data: pieces[n] }).then(function (pr) {
            if (!pr.ok) throw new Error(pr.error);
            n++; return next();
          });
        };
        return next();
      });
    }).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || "The upload didn't finish.");
      closeModal(); toast("Shared. Thanks for adding your photo.");
      gallery.loaded = false; loadGallery();
    }).catch(function (err) {
      b.disabled = false; status.textContent = "";
      toast(err.message || "The upload didn't finish. Please try again.");
    });
  });

  /* ---------- admin ---------- */
  function loadAdmin() {
    var box = $("[data-fl-admin]");
    if (!box || !(S.member && S.member.isAdmin)) return;
    box.innerHTML = loadingBox();
    call("adminOverview").then(function (r) {
      if (!r.ok) { box.innerHTML = offlineBox(r); return; }
      var d = r.data;
      var item = function (title, sub, acts) {
        return '<div class="fl-c"><div><p><b>' + esc(title) + '</b></p><span class="fl-meta">' + sub + "</span></div><div class=\"fl-acts\" style=\"margin:0\">" + acts + "</div></div>";
      };
      var a = function (label, action, id, red) { return '<button type="button" class="fl-act' + (red ? " red" : "") + '" data-fl-adm="' + action + '" data-id="' + esc(id) + '">' + label + "</button>"; };
      var why = function (x) { return (x.reportReasons || []).slice(-2).map(function (s) { return "<span>" + esc(s) + "</span>"; }).join(""); };
      var parts = [];
      d.pendingGroups.forEach(function (g) { parts.push(item("Group idea: " + g.title, "<span>From " + esc(g.requestedByName) + "</span><span>" + esc(g.description || "") + "</span>", a("Approve", "approveGroup", g.id) + a("Turn down", "rejectGroup", g.id, true))); });
      d.reportedThreads.forEach(function (t) { parts.push(item("Reported thread: " + t.title, "<span>" + t.reportCount + " reports</span>" + why(t), a("Open", "open", t.id) + a("Keep it", "clearThreadReports", t.id) + a("Remove", "removeThread", t.id, true))); });
      d.reportedComments.forEach(function (c) { parts.push(item("Reported reply by " + c.authorName, "<span>" + esc(c.body.slice(0, 120)) + "</span>" + why(c), a("Keep it", "clearCommentReports", c.id) + a("Remove", "removeComment", c.id, true))); });
      d.reportedPhotos.forEach(function (p) { parts.push(item("Reported photo: " + p.title, "<span>" + p.reportCount + " reports</span>" + why(p), a("Keep it", "clearGalleryReports", p.id) + a("Remove", "removeGalleryPhoto", p.id, true))); });
      box.innerHTML = '<div class="fl-stats"><div><b>' + d.counts.members + "</b><small>Members with a profile</small></div><div><b>" + d.counts.threads + "</b><small>Threads</small></div><div><b>" + d.counts.photos + "</b><small>Photos</small></div><div><b>" + d.counts.groups + "</b><small>Groups</small></div></div>" +
        (parts.length ? '<div class="fl-adm">' + parts.join("") + "</div>" : emptyBox("Nothing waiting", "No reports and no group ideas right now."));
    });
  }
  function adminDo(el) {
    var action = el.getAttribute("data-fl-adm"), id = el.getAttribute("data-id");
    if (action === "open") { openThread(id); return; }
    if (action === "removeThread" && el.getAttribute("data-sure") !== "1") { el.setAttribute("data-sure", "1"); el.textContent = "Tap again to remove"; return; }
    var payload = { action: action, id: id };
    if (action === "moveThread") { var mv = $("#bdMv"); payload.groupSlug = mv ? mv.value : ""; }
    var DONE = { pin: "Pinned to the top.", unpin: "Unpinned.", lock: "Replies closed.", unlock: "Replies reopened.", moveThread: "Thread moved.", approvePost: "Approved. It's live now.", rejectPost: "Turned down.", removeThread: "Thread removed." };
    el.disabled = true;
    call("adminAction", payload).then(function (r) {
      if (!r.ok) { el.disabled = false; toast(r.error); return; }
      toast(DONE[action] || "Done."); loadAdmin();
      loadGroups().then(function () {
        if (!boardOn()) return;
        if (B.view === "mod") boardGo("mod", "", true);
        else if (B.view === "thread") { if (action === "removeThread") boardGo("home", "", true); else boardGo("thread", B.thread, true); }
        else boardSide();
      });
      refreshLists();
    });
  }

  /* ---------- section content ---------- */
  function mount(id, html) { var m = $('[data-mount="' + id + '"]'); if (m) m.innerHTML = html; }
  function buildMain(main) {
    main.innerHTML = SECTIONS.map(shell).join("");

    mount("feed", '<div class="fl-split"><div class="fl-col"><div data-fl-compose-slot="feed"></div>' +
      '<div class="fl-filter"><label class="fl-sr" for="flFeedSel">Group</label><select id="flFeedSel" data-fl-feedsel aria-label="Show threads from"><option value="">Every group</option></select><span class="fl-count" data-fl-feedcount></span></div>' +
      '<div data-fl-feed></div></div>' +
      '<div class="fl-col"><div class="fl-panel fl-box"><h3>Your account</h3><p data-fl-who>Checking your log in</p>' +
      '<div class="fl-row" style="justify-content:flex-start" data-fl-login>' + btn("main", "Log in", 'data-fl-act="login"') + btn("alt", "Join free", 'data-fl-act="signup"') + "</div>" +
      '<div class="fl-row" style="justify-content:flex-start" data-fl-out hidden>' + linkBtn("alt", "Open My Airshow Hub", HUB) + btn("alt", "Log out", 'data-fl-act="logout"') + "</div></div>" +
      '<div class="fl-panel fl-box"><h3>Good to know</h3><p>Please credit other people\'s photos and keep it about airshows. If something doesn\'t look right, tap Report on the post and I will check it.</p><p>Posts go live straight away, so have a quick read before you press post.</p></div></div></div>');

    mount("groups", '<div data-fl-groups>' + loadingBox() + "</div>" +
      '<div class="fl-tip"><b>Can\'t see your group?</b> Suggest one and I\'ll take a look before it goes live. <button type="button" class="fl-act" data-fl-act="suggest" style="margin-left:6px">Suggest a group</button></div>');

    mount("corner", '<div class="fl-row" style="margin-bottom:12px"><span class="fl-count">Members\' own photos. Each one stays the copyright of the member who took it.</span>' + btn("main", "Share a photo", 'data-fl-act="share"') + "</div>" +
      '<div data-fl-gallery></div><h3 style="font:800 22px/1.1 \'Barlow Condensed\',\'Barlow\',sans-serif;text-transform:uppercase;margin:24px 0 10px" class="fl-h">Corner groups</h3><div data-fl-cornergroups></div>');

    mount("buddy", '<div class="fl-split"><div class="fl-col"><div data-fl-list="buddy"></div></div><div class="fl-col"><div data-fl-compose-slot="buddy"></div>' +
      '<div class="fl-tip"><b>Staying safe.</b> I would advise meeting in a busy place first, like the main entrance or a food stall, and telling someone at home who you are meeting. Keep chats on the forum until you are happy.</div></div></div>');

    mount("rarity", '<div class="fl-split"><div class="fl-col"><div data-fl-list="rarity"></div></div><div class="fl-col"><div data-fl-compose-slot="rarity"></div></div></div>');

    mount("kit", '<div class="fl-split"><div class="fl-col"><div data-fl-list="kit"></div></div><div class="fl-col"><div data-fl-compose-slot="kit"></div>' +
      '<div class="fl-tip"><b>Before you buy.</b> Ask for the shutter count and recent photos taken with it, and if you can, meet at a show and check it works before any money changes hands.</div></div></div>');

    mount("live", '<div class="fl-panel fl-empty"><h4>Show Day Live has its own page</h4><p>Running orders, what is flying now and next, and members\' car park and queue reports all sit on the Show Day Live page. It gets busy from the start of the 2027 season.</p>' +
      linkBtn("main", "Open Show Day Live", SHOWDAY) + "</div>");

    mount("how", '<div class="fl-groups">' +
      [["1", "Join free", "Create your account through My Airshow Hub. It only takes a couple of minutes, and you can add a photo later."],
       ["2", "Find your group", "Pick the group that fits your question, from first timers and families to parking, camping or photography."],
       ["3", "Post, reply and help", "Start a thread, reply to others, share your photos or post a meet up on the buddy board. Posts go live straight away."],
       ["4", "Reports are checked", "If a post is reported it goes into my admin queue, and I check every one myself before anything is removed."]]
        .map(function (s) { return '<div class="fl-panel fl-group" style="cursor:default"><h4>' + s[0] + ". " + esc(s[1]) + "</h4><p>" + esc(s[2]) + "</p></div>"; }).join("") +
      '</div><div class="fl-row" style="justify-content:flex-start;margin-top:14px" data-fl-login>' + btn("main", "Join free", 'data-fl-act="signup"') + btn("alt", "Log in", 'data-fl-act="login"') + "</div>");

    mount("admin", '<div data-fl-admin></div>');

    $$('[data-mount] .fl-h').forEach(function (h) { h.style.color = S.look === "hud" ? "#EAF6F8" : "#13293C"; });

    var sel = $("[data-fl-feedsel]");
    if (sel) sel.addEventListener("change", function () { S.feedGroup = sel.value; feedList(); renderCompose(); });
  }

  /* ---------- logged in forum board (clean look): a proper forum layout once a member is logged in ---------- */
  var CATS_ORDER = [
    ["show", "Show threads", "One thread per show. Dates, a countdown and line up updates the moment an aircraft is confirmed."],
    ["chat", "General chat", "Say hello, share show reports and catch up on the latest news."],
    ["plan", "Planning your day", "Getting there, places to stay, first visits and accessibility."],
    ["photo", "Photography and spotting", "Photography, line ups, arrivals and kit."],
    ["corner", "Photographer's Corner", "Advice, techniques, editing and the best places to shoot."]
  ];
  var B = { on: false, view: "home", group: "", thread: "", sort: "activity", all: [], allLoaded: false, q: "", fol: { threads: [], groups: [] }, photo: null, people: [] };
  function isFol(type, id) { return (B.fol[type === "group" ? "groups" : "threads"] || []).indexOf(id) >= 0; }
  function loadFollowing() {
    return call("listFollowing").then(function (r) { if (r.ok && r.data) B.fol = { threads: r.data.threads || [], groups: r.data.groups || [] }; });
  }
  function followBtn(type, id) {
    var on = isFol(type, id);
    return '<button type="button" class="bd-follow' + (on ? " on" : "") + '" data-bd-follow="' + type + '" data-id="' + esc(id) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>' + (on ? "Following" : "Follow " + type) + "</button>";
  }
  /* @mentions: highlight names in posts */
  function withMentions(html, names) {
    names = (names || []).filter(Boolean).sort(function (a, b) { return b.length - a.length; });
    names.forEach(function (n) {
      var safe = esc(n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      html = html.replace(new RegExp("@" + safe, "g"), '<span class="bd-at">@' + esc(n) + "</span>");
    });
    return html;
  }
  /* photo settings read straight from the photo file (JPEG EXIF) */
  function readExif(file) {
    return new Promise(function (resolve) {
      if (!file || !/jpe?g/i.test(file.type || "")) { resolve({}); return; }
      var fr = new FileReader();
      fr.onload = function () { try { resolve(parseExif(new DataView(fr.result))); } catch (e) { resolve({}); } };
      fr.onerror = function () { resolve({}); };
      fr.readAsArrayBuffer(file.slice(0, 196608));
    });
  }
  function parseExif(v) {
    if (v.getUint16(0) !== 0xFFD8) return {};
    var off = 2;
    while (off < v.byteLength - 4) {
      var mk = v.getUint16(off), len = v.getUint16(off + 2);
      if (mk === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) return tiff(v, off + 10);
      if ((mk & 0xFF00) !== 0xFF00) break;
      off += 2 + len;
    }
    return {};
  }
  function tiff(v, t) {
    var le = v.getUint16(t) === 0x4949, out = {};
    function u16(o) { return v.getUint16(o, le); }
    function u32(o) { return v.getUint32(o, le); }
    function str(o, n) { var s = ""; for (var i = 0; i < n; i++) { var c = v.getUint8(o + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); }
    function rat(o) { var a = u32(o), b = u32(o + 4); return b ? a / b : 0; }
    function num(type, cnt, at) {
      if (type === 5 || type === 10) return rat(at);
      if (type === 3) return cnt === 2 ? (u16(at + 2) ? u16(at) / u16(at + 2) : 0) : u16(at);
      if (type === 4) return u32(at);
      return 0;
    }
    function ifd(start, each) {
      var n = u16(start);
      for (var i = 0; i < n; i++) {
        var e = start + 2 + i * 12, tag = u16(e), type = u16(e + 2), cnt = u32(e + 4), vo = e + 8;
        var at = (type === 2 && cnt > 4) || type === 5 || type === 10 || (type === 4 && cnt > 1) ? t + u32(vo) : vo;
        each(tag, type, cnt, at);
      }
    }
    var exifPtr = 0;
    ifd(t + u32(t + 4), function (tag, type, cnt, at) {
      if (tag === 0x010F) out.make = str(at, cnt);
      if (tag === 0x0110) out.model = str(at, cnt);
      if (tag === 0x8769) exifPtr = u32(at);
    });
    if (exifPtr) ifd(t + exifPtr, function (tag, type, cnt, at) {
      var x = num(type, cnt, at);
      if (tag === 0x829A && x) out.shutter = x >= 1 ? x + "s" : "1/" + Math.round(1 / x);
      if (tag === 0x829D && x) out.aperture = "f/" + (Math.round(x * 10) / 10);
      if (tag === 0x8827 && x) out.iso = String(x);
      if (tag === 0x920A && x) out.focal = Math.round(x) + "mm";
      if (tag === 0xA434) out.lens = str(at, cnt);
    });
    var cam = (out.model || "").replace(/\b([A-Z]{4,})\b/g, function (w) { return w.charAt(0) + w.slice(1).toLowerCase(); });
    var brand = out.make ? out.make.split(" ")[0] : "";
    if (/^[A-Z]{4,}$/.test(brand)) brand = brand.charAt(0) + brand.slice(1).toLowerCase();
    if (brand && cam.toLowerCase().indexOf(brand.toLowerCase()) < 0) cam = brand + " " + cam;
    return { camera: cam.trim(), lens: out.lens || "", focal: out.focal || "", shutter: out.shutter || "", aperture: out.aperture || "", iso: out.iso || "" };
  }
  function photoFields(x) {
    x = x || {};
    var F = [["camera", "Camera", "Nikon D500"], ["lens", "Lens", "200-500mm"], ["focal", "Focal length", "500mm"], ["shutter", "Shutter", "1/1600"], ["aperture", "Aperture", "f/8"], ["iso", "ISO", "400"]];
    return '<div class="bd-exif-f">' + F.map(function (f) {
      return '<label><span>' + f[1] + '</span><input type="text" data-exif="' + f[0] + '" value="' + esc(x[f[0]] || "") + '" placeholder="' + f[2] + '" maxlength="60"></label>';
    }).join("") + "</div>";
  }
  function settingsStrip(p) {
    var set = [["Camera", p.camera], ["Lens", p.lens], ["Focal length", p.focal], ["Shutter", p.shutter], ["Aperture", p.aperture], ["ISO", p.iso]].filter(function (x) { return x[1]; });
    if (!set.length) return "";
    return '<div class="bd-set">' + set.map(function (x) { return "<span><small>" + esc(x[0]) + "</small>" + esc(x[1]) + "</span>"; }).join("") + "</div>";
  }
  function photoSlots(html) {
    var slot = '<div class="bd-pic" data-bd-pic="$1"><div class="bd-pic-wait">Loading the photo</div></div>';
    return html.replace(/<p>\s*\[\[photo:([A-Za-z0-9_-]+)\]\]\s*<\/p>/g, slot).replace(/\[\[photo:([A-Za-z0-9_-]+)\]\]/g, slot);
  }
  function fillPhotos(root) {
    $$("[data-bd-pic]", root).forEach(function (box) {
      var id = box.getAttribute("data-bd-pic");
      call("getGalleryPhoto", { photoId: id }).then(function (r) {
        if (!r.ok || !r.data || !r.data.photo) { box.innerHTML = '<div class="bd-pic-wait">This photo has been removed.</div>'; return; }
        var p = r.data.photo, src = /^data:|\.(webp|jpe?g|png)$/i.test(p.image) ? p.image : p.image + "/v1/fit/w_1400,h_1400,q_85/p.jpg";
        box.innerHTML = '<img src="' + esc(src) + '" alt="' + esc(p.title || "Photo") + '" loading="lazy" decoding="async">' +
          '<p class="bd-cr">© ' + esc(p.authorName || "") + (p.showName ? " · " + esc(p.showName) : "") + (p.aircraft ? " · " + esc(p.aircraft) : "") + "</p>" + settingsStrip(p);
      });
    });
  }

  function boardOn() { return B.on; }
  function catOf(slug) { var g = S.groups.filter(function (x) { return x.slug === slug; })[0]; return g ? (g.category || "other") : "other"; }
  function catLabel(c) { var f = CATS_ORDER.filter(function (x) { return x[0] === c; })[0]; return f ? f[1] : "More groups"; }
  function catGroups() {
    var out = CATS_ORDER.map(function (c) { return { key: c[0], title: c[1], blurb: c[2], groups: [] }; });
    var other = { key: "other", title: "More groups", blurb: "Show groups and anything else.", groups: [] };
    S.groups.slice().sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); }).forEach(function (g) {
      var box = out.filter(function (c) { return c.key === g.category; })[0] || other;
      box.groups.push(g);
    });
    if (other.groups.length) out.splice(1, 0, other);
    return out.filter(function (c) { return c.groups.length; });
  }
  function lastIn(slug) {
    return B.all.filter(function (t) { return t.groupSlug === slug; })
      .sort(function (a, b) { return String(b.lastActivity || b.created).localeCompare(String(a.lastActivity || a.created)); })[0];
  }
  function crumbs(list) {
    return '<nav class="bd-crumb" aria-label="You are here">' + list.map(function (c, i) {
      return i < list.length - 1 ? '<button type="button" data-bd-go="' + esc(c[1]) + '">' + esc(c[0]) + "</button><span aria-hidden=\"true\">›</span>" : "<b>" + esc(c[0]) + "</b>";
    }).join("") + "</nav>";
  }
  function loadAll() {
    return call("listThreads", { groupSlug: "", all: true }).then(function (r) {
      B.all = r.ok ? (r.data || []) : []; B.allLoaded = true; return B.all;
    });
  }
  function boardBuild() {
    if ($("#board")) return;
    document.body.classList.add("fl-member");
    var b = document.createElement("div"); b.id = "board";
    b.innerHTML =
      '<header class="bd-top"><div class="wrap bd-top-in">' +
        '<button type="button" class="bd-name" data-bd-go="home"><span>Airshow</span> Forum</button>' +
        '<form class="bd-search" role="search" data-bd-search><label class="fl-sr" for="bdQ">Search the forum</label><input type="search" id="bdQ" placeholder="Search threads" autocomplete="off"><button type="submit" aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></button></form>' +
        '<button type="button" class="btn btn-teal sm bd-new" data-bd-new="">+ New thread</button>' +
        '<button type="button" class="bd-dmb" data-bd-go="messages" data-bd-dm aria-label="Messages"></button>' +
        '<span class="bd-me" data-bd-me></span>' +
      "</div></header>" +
      '<div class="wrap bd-grid"><aside class="bd-side" aria-label="Forum categories"><button type="button" class="bd-cats-t" data-bd-toggle aria-expanded="false">Categories and groups</button><div class="bd-side-in" data-bd-side></div></aside>' +
      '<div class="bd-main" data-bd-main aria-live="polite"></div></div>';
    var main = $("main"); main.parentNode.insertBefore(b, main);
    var look = $("#lookSw"); if (look) $(".bd-top-in").appendChild(look);
  }
  function boardSide() {
    var side = $("[data-bd-side]"); if (!side) return;
    var me = S.member;
    var extra = [["corner", "Photo gallery"], ["buddy", "Buddy board", G_BUDDY], ["rarity", "Rarity log", G_RARE], ["kit", "Kit swap", G_KIT], ["live", "Show day live"], ["how", "How it works"]];
    var modLink = me && me.isAdmin ? '<button type="button" class="bd-home bd-modl' + (B.view === "mod" ? " on" : "") + '" data-bd-go="mod">Moderation' + (modCount(MOD.overview) ? "<small class=\"bd-mcount\">" + modCount(MOD.overview) + "</small>" : "") + "</button>" : "";
    side.innerHTML = '<button type="button" class="bd-home' + (B.view === "home" ? " on" : "") + '" data-bd-go="home">Forum home</button>' +
      '<button type="button" class="bd-home' + (B.view === "mine" ? " on" : "") + '" data-bd-go="mine">My threads</button>' +
      '<button type="button" class="bd-home' + (B.view === "following" ? " on" : "") + '" data-bd-go="following">Following<small>' + (B.fol.threads.length + B.fol.groups.length) + "</small></button>" +
      '<button type="button" class="bd-home' + (B.view === "members" ? " on" : "") + '" data-bd-go="members">Members</button>' +
      '<button type="button" class="bd-home' + (B.view === "messages" ? " on" : "") + '" data-bd-go="messages" data-bd-dmside>Messages' + (DM.unread ? '<small class="bd-mcount">' + DM.unread + "</small>" : "") + "</button>" + modLink +
      catGroups().map(function (c) {
        return '<div class="bd-cat"><h3>' + esc(c.title) + "</h3>" + c.groups.map(function (g) {
          return '<button type="button" class="bd-g' + (B.view === "group" && B.group === g.slug ? " on" : "") + '" data-bd-group="' + esc(g.slug) + '"><span>' + esc(g.title) + (isFol("group", g.slug) ? '<i class="bd-dot" title="Following"></i>' : "") + "</span><small>" + (g.threadCount || 0) + "</small></button>";
        }).join("") + "</div>";
      }).join("") +
      '<div class="bd-cat"><h3>More of the forum</h3>' + extra.map(function (x) {
        return x[2] ? '<button type="button" class="bd-g" data-bd-group="' + x[2] + '"><span>' + x[1] + "</span></button>"
          : '<button type="button" class="bd-g' + (B.view === "sec" && B.sec === x[0] ? " on" : "") + '" data-bd-sec="' + x[0] + '"><span>' + x[1] + "</span></button>";
      }).join("") + '<button type="button" class="bd-g bd-sug" data-fl-act="suggest"><span>Suggest a new group</span></button></div>';
    var mc = $("[data-bd-me]");
    if (mc && me) mc.innerHTML = avatar(me.name, me.colour, me.photo) + "<span>" + esc(me.name.split(" ")[0]) + "</span>";
    dmBadge();
  }
  function threadRow(t, showGroup) {
    var g = showGroup ? groupTitle(t.groupSlug) : "";
    return '<button type="button" class="bd-row bd-t" data-fl-thread="' + esc(t.id) + '">' +
      '<span class="bd-t-main">' + avatar(t.authorName, t.authorColour, t.authorPhoto) + '<span><b>' + (t.pinned ? '<i class="bd-pin">Pinned</i>' : "") + (t.locked ? '<i class="bd-lock">Closed</i>' : "") + (t.isQuestion ? (t.answerId ? '<i class="bd-solved">Solved</i>' : '<i class="bd-q">Question</i>') : "") + (t.hasPhoto ? '<i class="bd-ph-i">Photo</i>' : "") + esc(t.title) + "</b>" +
      "<small>Started by " + esc(t.authorName) + " · " + esc(ago(t.created)) + (g ? " · in " + esc(g) : "") + "</small></span></span>" +
      '<span class="bd-n"><b>' + (t.commentCount || 0) + "</b><small>" + ((t.commentCount === 1) ? "reply" : "replies") + "</small></span>" +
      '<span class="bd-n"><b>' + (t.likeCount || 0) + "</b><small>" + ((t.likeCount === 1) ? "like" : "likes") + "</small></span>" +
      '<span class="bd-last">' + esc(ago(t.lastActivity || t.created)) + "</span></button>";
  }
  function threadHead() {
    return '<div class="bd-row bd-head" aria-hidden="true"><span>Thread</span><span>Replies</span><span>Likes</span><span>Last activity</span></div>';
  }
  function vHome() {
    var me = S.member, total = S.groups.reduce(function (n, g) { return n + (g.threadCount || 0); }, 0);
    var latest = B.all.slice().sort(function (a, b) { return String(b.lastActivity || b.created).localeCompare(String(a.lastActivity || a.created)); }).slice(0, 5);
    return '<div class="bd-hello"><div><h1>Welcome back, ' + esc(me.name.split(" ")[0]) + "</h1><p>Pick a group to read or start a new thread. Posts go live straight away, so have a quick read before you press post.</p></div>" +
      '<div class="bd-stats"><div><b>' + S.groups.length + "</b><span>Groups</span></div><div><b>" + total + "</b><span>Threads</span></div><div><b>" + B.all.filter(function (t) { return t.authorId === me.id; }).length + "</b><span>Yours</span></div></div></div>" +
      '<section class="bd-block"><h2>Latest activity</h2>' + (latest.length ? '<div class="bd-table">' + threadHead() + latest.map(function (t) { return threadRow(t, true); }).join("") + "</div>"
        : '<div class="bd-empty"><b>It is quiet in here so far</b><p>Be one of the first to post. Most people start with a question about their next show.</p>' + '<button type="button" class="btn btn-teal sm" data-bd-new="">Start a thread</button></div>') + "</section>" +
      catGroups().map(function (c) {
        return '<section class="bd-block"><h2>' + esc(c.title) + '</h2><p class="bd-blurb">' + esc(c.blurb) + '</p><div class="bd-table">' +
          '<div class="bd-row bd-head bd-gh" aria-hidden="true"><span>Group</span><span>Threads</span><span>Latest thread</span></div>' +
          c.groups.map(function (g) {
            var l = lastIn(g.slug);
            return '<button type="button" class="bd-row bd-gr" data-bd-group="' + esc(g.slug) + '"><span class="bd-gname"><b>' + esc(g.title) + "</b><small>" + esc(g.description || "") + "</small></span>" +
              '<span class="bd-n"><b>' + (g.threadCount || 0) + "</b><small>threads</small></span>" +
              '<span class="bd-last">' + (l ? "<b>" + esc(l.title) + "</b><small>" + esc(l.authorName) + " · " + esc(ago(l.lastActivity || l.created)) + "</small>" : "<small>No threads yet. Start the first one.</small>") + "</span></button>";
          }).join("") + "</div></section>";
      }).join("");
  }
  function sortThreads(list) {
    var by = B.sort;
    return list.slice().sort(function (a, b) {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      if (by === "new") return String(b.created).localeCompare(String(a.created));
      if (by === "replies") return (b.commentCount || 0) - (a.commentCount || 0);
      return String(b.lastActivity || b.created).localeCompare(String(a.lastActivity || a.created));
    });
  }
  function sortBar() {
    return '<label class="bd-sort">Sort by <select data-bd-sort><option value="activity"' + (B.sort === "activity" ? " selected" : "") + ">Latest activity</option><option value=\"new\"" + (B.sort === "new" ? " selected" : "") + ">Newest threads</option><option value=\"replies\"" + (B.sort === "replies" ? " selected" : "") + ">Most replies</option></select></label>";
  }
  function vGroup(list) {
    var g = S.groups.filter(function (x) { return x.slug === B.group; })[0] || { title: groupTitle(B.group) || "Group", description: "" };
    return crumbs([["Forum", "home"], [catLabel(catOf(B.group)), "home"], [g.title, ""]]) +
      '<div class="bd-ghead"><div><h1>' + esc(g.title) + "</h1>" + (g.description ? "<p>" + esc(g.description) + "</p>" : "") + '</div><span class="bd-btns">' + followBtn("group", B.group) + '<button type="button" class="btn btn-teal sm" data-bd-new="' + esc(B.group) + '">+ New thread here</button></span></div>' +
      (g.show ? showCard(g.show) : "") +
      '<div class="bd-tools"><span>' + list.length + (list.length === 1 ? " thread" : " threads") + "</span>" + sortBar() + "</div>" +
      (list.length ? '<div class="bd-table">' + threadHead() + sortThreads(list).map(function (t) { return threadRow(t, false); }).join("") + "</div>"
        : '<div class="bd-empty"><b>No threads in this group yet</b><p>Start the first one. Ask a question, share a tip or tell a story from the crowd line.</p><button type="button" class="btn btn-teal sm" data-bd-new="' + esc(B.group) + '">Start a thread</button></div>');
  }
  function showCard(sh) {
    var days = sh.start ? Math.ceil((new Date(sh.start) - Date.now()) / 864e5) : null;
    return '<div class="bd-show"><div class="bd-show-l"><b>' + esc(sh.name) + "</b><span>" + esc(sh.dateText || "Date to be confirmed") + "</span>" +
      '<span class="bd-show-n">' + (sh.lineupCount ? sh.lineupCount + " aircraft confirmed so far. New ones are posted in the line up thread automatically." : "Line up updates are posted here automatically as aircraft are confirmed.") + "</span></div>" +
      (days != null && days >= 0 ? '<div class="bd-cd"><b>' + days + "</b><span>days to go</span></div>" : '<div class="bd-cd"><b>TBC</b><span>dates to come</span></div>') +
      '<div class="bd-show-b">' + (sh.link ? '<a class="btn btn-teal sm" href="' + esc(sh.link) + '" target="_top">Show guide</a>' : "") + '<a class="btn sm bd-hubbtn" href="' + esc(HUB) + '" target="_top">Save to my hub</a></div></div>';
  }
  function vList(title, lead, list, emptyT, emptyP) {
    return crumbs([["Forum", "home"], [title, ""]]) + '<div class="bd-ghead"><div><h1>' + esc(title) + "</h1><p>" + esc(lead) + "</p></div></div>" +
      '<div class="bd-tools"><span>' + list.length + (list.length === 1 ? " thread" : " threads") + "</span>" + sortBar() + "</div>" +
      (list.length ? '<div class="bd-table">' + threadHead() + sortThreads(list).map(function (t) { return threadRow(t, true); }).join("") + "</div>"
        : '<div class="bd-empty"><b>' + esc(emptyT) + "</b><p>" + esc(emptyP) + '</p><button type="button" class="btn btn-teal sm" data-bd-new="">Start a thread</button></div>');
  }
  function vCompose(fixed) {
    var me = S.member;
    var opts = catGroups().map(function (c) {
      return '<optgroup label="' + esc(c.title) + '">' + c.groups.map(function (g) { return '<option value="' + esc(g.slug) + '"' + (g.slug === fixed ? " selected" : "") + ">" + esc(g.title) + "</option>"; }).join("") + "</optgroup>";
    }).join("");
    return crumbs([["Forum", "home"], ["New thread", ""]]) +
      '<div class="bd-compose-grid"><form class="bd-compose" data-fl-compose novalidate><h1>Start a new thread</h1>' +
        '<div class="fl-field"><label for="bdG">Category</label><select id="bdG" name="group" required><option value="">Choose where it goes</option>' + opts + "</select></div>" +
        '<div class="fl-field"><label for="bdT">Title</label><input type="text" id="bdT" name="title" maxlength="120" placeholder="e.g. First time at Cosford next year, any tips?" required></div>' +
        '<div class="fl-field"><label for="bdB">Your post</label><textarea id="bdB" name="body" maxlength="5000" rows="9" placeholder="Say what is on your mind. The more detail, the better the answers." required data-bd-mention></textarea></div>' +
        '<label class="bd-qt"><input type="checkbox" name="isQuestion"><span class="bd-sw" aria-hidden="true"></span><span><b>This is a question</b><small>Once someone answers it, you can mark the best reply as the answer so the next person finds it straight away.</small></span></label>' +
        '<div class="bd-photo" data-bd-photo><button type="button" class="btn btn-navy sm" data-bd-addphoto>Add a photo</button><input type="file" accept="image/jpeg,image/png,image/webp" data-bd-file hidden><small>Your own photos only. The camera settings are read from the photo for you.</small></div>' +
        '<div class="fl-row"><span class="fl-as">' + avatar(me.name, me.colour, me.photo) + "<span>Posting as <b>" + esc(me.name) + '</b></span></span><span class="bd-btns"><button type="button" class="btn btn-navy sm" data-bd-go="back">Cancel</button><button type="submit" class="btn btn-teal sm">Post thread</button></span></div></form>' +
      '<aside class="bd-tips"><h2>Before you post</h2><ul><li>Asking something? Tick This is a question, so the best answer can be marked.</li><li>Pick the group that fits best, so the right people see it.</li><li>A clear title gets more replies. Say the show and what you want to know.</li><li>Have a quick search first, someone may have asked already.</li><li>Keep it friendly and about airshows. Credit other people\'s photos.</li></ul></aside></div>';
  }
  function vThread(d) {
    var t = d.thread, me = S.member, mine = me && (me.id === t.authorId || me.isAdmin);
    var asker = me && me.id === t.authorId;
    var names = [t.authorName].concat(d.comments.map(function (c) { return c.authorName; }));
    B.people = names.filter(function (n, i) { return n && names.indexOf(n) === i && (!me || n !== me.name); });
    var answer = t.answerId ? d.comments.filter(function (c) { return c.id === t.answerId; })[0] : null;
    function post(p, n, isOp) {
      var own = me && (me.id === p.authorId || me.isAdmin), sys = p.authorId === "system", best = !isOp && t.answerId === p.id;
      return '<article class="bd-post' + (isOp ? " op" : "") + (sys ? " sys" : "") + (best ? " best" : "") + '" id="post-' + n + '"><div class="bd-who">' +
        (sys ? '<span class="fl-av bd-bot" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 12c0-.8-.7-1.4-1.6-1.4H15L10.6 3H8.8l2.3 7.6H6.6L4.8 8.2H3.4l1 3.8-1 3.8h1.4l1.8-2.4h4.5L8.8 21h1.8l4.4-7.6h4.4c.9 0 1.6-.6 1.6-1.4z"/></svg></span><b>' + esc(p.authorName) + "</b>"
          : '<button type="button" class="bd-whob" data-bd-who="' + esc(p.authorId) + '" title="See ' + esc(p.authorName) + '\'s profile">' + avatar(p.authorName, p.authorColour, p.authorPhoto) + "<b>" + esc(p.authorName) + "</b></button>") + (sys ? "<small>Automatic update</small>" : isOp ? "<small>Started the thread</small>" : "") + "</div>" +
        '<div class="bd-body"><div class="bd-ph"><span>' + (best ? '<i class="bd-solved">Best answer</i>' : "") + esc(ago(p.created)) + '</span><span class="bd-num">#' + n + "</span></div>" +
        '<div class="fl-body">' + photoSlots(withMentions(paras(p.body), names)) + "</div>" +
        '<div class="bd-acts">' +
          (!isOp && !sys && t.isQuestion && asker ? (best ? '<button type="button" class="fl-act" data-bd-answer="">Unmark answer</button>' : '<button type="button" class="fl-act bd-mark" data-bd-answer="' + esc(p.id) + '">Mark as the answer</button>') : "") +

          (isOp ? '<button type="button" class="fl-act" data-fl-like="' + esc(t.id) + '" aria-pressed="' + (d.liked ? "true" : "false") + '">Like · <span>' + (t.likeCount || 0) + "</span></button>" : "") +
          (!t.locked || (me && me.isAdmin) ? '<button type="button" class="fl-act" data-bd-quote="' + esc(p.authorName) + '">Reply</button>' : "") +
          (me && !sys ? '<button type="button" class="fl-act" data-fl-report="' + (isOp ? "thread" : "comment") + '" data-id="' + esc(isOp ? t.id : p.id) + '">Report</button>' : "") +
          (isOp && mine ? '<button type="button" class="fl-act red" data-fl-delt="' + esc(t.id) + '">Delete thread</button>' : "") +
          (!isOp && own ? '<button type="button" class="fl-act red" data-fl-delc="' + esc(p.id) + '">Delete</button>' : "") +
        "</div></div></article>";
    }
    var reply = t.locked && !(me && me.isAdmin) ? '<p class="bd-closed">Replies are closed on this thread.</p>'
      : '<form class="bd-reply" data-fl-reply novalidate><h2>Your reply</h2><label class="fl-sr" for="flReply">Your reply</label><textarea id="flReply" name="body" maxlength="2000" rows="5" placeholder="Write a reply. Type @ to mention someone in this thread." data-bd-mention></textarea>' +
        '<div class="fl-row" style="margin-top:10px"><span class="fl-as">' + avatar(me.name, me.colour, me.photo) + "<span>Replying as <b>" + esc(me.name) + '</b></span></span><button type="submit" class="btn btn-teal sm">Post reply</button></div></form>';
    return crumbs([["Forum", "home"], [groupTitle(t.groupSlug) || "Group", "g:" + t.groupSlug], [t.title, ""]]) +
      '<div class="bd-thead"><div><h1>' + (t.isQuestion ? (t.answerId ? '<i class="bd-solved big">Solved</i>' : '<i class="bd-q big">Question</i>') : "") + esc(t.title) + '</h1><p><span class="fl-tag">' + esc(groupTitle(t.groupSlug)) + "</span> " + (d.comments.length) + (d.comments.length === 1 ? " reply" : " replies") + " · " + (t.likeCount || 0) + ((t.likeCount === 1) ? " like" : " likes") + "</p></div>" + followBtn("thread", t.id) + "</div>" +
      (me && me.isAdmin ? modTools(t) : "") +
      post(t, 1, true) +
      (answer ? '<div class="bd-ans"><b>Best answer</b><span>' + esc(answer.authorName) + " · " + esc(String(answer.body).slice(0, 140)) + (String(answer.body).length > 140 ? "…" : "") + '</span><button type="button" data-bd-jump>Jump to it</button></div>' : "") + d.comments.map(function (c, i) { return post(c, i + 2, false); }).join("") + reply;
  }
  function moveSection(id) {
    var main = $("[data-bd-main]"), sec = $("#" + id);
    if (!sec || !main) return;
    main.innerHTML = crumbs([["Forum", "home"], [(SECTIONS.filter(function (s) { return s.id === id; })[0] || {}).nav || id, ""]]);
    sec.removeAttribute("data-off"); sec.hidden = false; sec.classList.add("bd-sec");
    main.appendChild(sec);
    if (id === "corner") loadGallery();
    if (id === "admin") loadAdmin();
  }
  function parkSections() {
    var main = $("main");
    $$(".bd-sec").forEach(function (sec) { sec.classList.remove("bd-sec"); sec.setAttribute("data-off", ""); main.appendChild(sec); });
  }
  var hist = [];
  function boardGo(view, arg, noPush) {
    if (!B.on) return;
    if (!noPush) hist.push({ view: B.view, group: B.group, thread: B.thread, sec: B.sec });
    parkSections();
    B.view = view;
    if (view === "group") B.group = arg;
    if (view === "thread") B.thread = arg;
    if (view === "sec") B.sec = arg;
    var main = $("[data-bd-main]");
    var side = $(".bd-side"); if (side) side.classList.remove("open");
    var tg = $("[data-bd-toggle]"); if (tg) tg.setAttribute("aria-expanded", "false");
    boardSide();
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); }
    if (view === "sec") { moveSection(arg); return; }
    if (view === "compose") { main.innerHTML = vCompose(arg || ""); var ti = $("#bdT"); if (ti && arg) setTimeout(function () { ti.focus(); }, 60); return; }
    main.innerHTML = '<div class="bd-empty"><p>Loading.</p></div>';
    if (view === "members") { main.innerHTML = vMembers(); loadMembers(); return; }
    if (view === "messages") { main.innerHTML = vMessages(); loadChats().then(drawMessages); return; }
    if (view === "home") { loadAll().then(function () { if (B.view === "home") { main.innerHTML = vHome(); boardSide(); } }); return; }
    if (view === "mod") {
      if (!(S.member && S.member.isAdmin)) { boardGo("home", "", true); return; }
      loadMod().then(function () { if (B.view === "mod") { main.innerHTML = vMod(); boardSide(); } });
      return;
    }
    if (view === "following") {
      Promise.all([loadAll(), loadFollowing()]).then(function () {
        if (B.view !== "following") return;
        boardSide();
        var gs = B.fol.groups.map(function (sl) { return '<button type="button" class="bd-chip" data-bd-group="' + esc(sl) + '">' + esc(groupTitle(sl) || sl) + "</button>"; }).join("");
        main.innerHTML = vList("Following", "Threads you follow. New replies reach your bell, and you follow your own threads and anything you reply to automatically.", B.all.filter(function (t) { return isFol("thread", t.id); }), "You're not following any threads yet", "Tap Follow thread at the top of any thread and new replies will reach your bell.") +
          (gs ? '<div class="bd-folg"><b>Groups you follow</b><span>New threads in these groups reach your bell.</span><div>' + gs + "</div></div>" : "");
      });
      return;
    }
    if (view === "mine") { loadAll().then(function () { if (B.view === "mine") main.innerHTML = vList("My threads", "Every thread you have started, newest activity first.", B.all.filter(function (t) { return t.authorId === S.member.id; }), "You haven't started a thread yet", "When you post, your threads collect here so you can follow the replies."); }); return; }
    if (view === "search") { loadAll().then(function () { var q = B.q.toLowerCase(); main.innerHTML = vList('Search: "' + B.q + '"', "Threads with your words in the title or the opening post.", B.all.filter(function (t) { return (t.title + " " + (t.preview || "")).toLowerCase().indexOf(q) >= 0; }), "Nothing found", "Try fewer words, or start a thread and ask."); }); return; }
    if (view === "group") { call("listThreads", { groupSlug: arg }).then(function (r) { if (B.view === "group" && B.group === arg) main.innerHTML = r.ok ? vGroup(r.data || []) : offlineBox(r); }); return; }
    if (view === "thread") {
      openId = arg;
      call("getThread", { threadId: arg }).then(function (r) {
        if (B.view !== "thread") return;
        main.innerHTML = r.ok ? vThread(r.data) : '<div class="bd-empty"><b>Thread not found</b><p>' + esc(r.error || "It may have been removed.") + "</p></div>";
        if (r.ok) fillPhotos(main);
      });
    }
  }
  /* ---------- members, profile cards and private messages ---------- */
  var DM = { unread: 0, chats: [], loaded: false, timer: null };
  var MEM = { filter: "all", q: "", data: null };
  var CHAT = { id: "" };
  var IC = {
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
    min: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    msg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>'
  };
  function memberSince(d) { return d ? "Member since " + new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : ""; }
  function clock(d) { return d ? new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : ""; }
  function sameDay(a, b) { return a.toDateString() === b.toDateString(); }
  function shortTime(d) {
    if (!d) return "";
    var t = new Date(d), now = new Date(), y = new Date(now.getTime() - 86400000);
    if (sameDay(t, now)) return clock(d);
    if (sameDay(t, y)) return "Yesterday";
    if (now - t < 6 * 86400000) return t.toLocaleDateString("en-GB", { weekday: "short" });
    return t.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  function dayLabel(d) {
    var t = new Date(d), now = new Date();
    if (sameDay(t, now)) return "Today";
    if (sameDay(t, new Date(now.getTime() - 86400000))) return "Yesterday";
    return t.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  /* unread count, checked now and then while the forum is open */
  function loadChats() {
    return call("listChats").then(function (r) {
      if (r.ok && r.data) {
        DM.chats = r.data.chats || []; DM.loaded = true;
        // The chat that is open right now has been read, even if the list was fetched a moment before.
        DM.chats.forEach(function (c) { if (CHAT.loaded && c.memberId === CHAT.id) c.unread = false; });
        DM.unread = DM.chats.filter(function (c) { return c.unread; }).length;
      }
      dmBadge();
      return r;
    });
  }
  function dmBadge() {
    var b = $("[data-bd-dm]");
    if (b) b.innerHTML = IC.msg + "<span>Messages</span>" + (DM.unread ? "<i>" + DM.unread + "</i>" : "");
    var s = $("[data-bd-dmside]");
    if (s) s.innerHTML = "Messages" + (DM.unread ? '<small class="bd-mcount">' + DM.unread + "</small>" : "");
  }
  function dmPollStart() {
    dmPollStop();
    DM.timer = setInterval(function () {
      if (document.hidden) return;
      loadChats().then(function () { if (B.view === "messages") drawMessages(); });
    }, 40000);
  }
  function dmPollStop() { if (DM.timer) clearInterval(DM.timer); DM.timer = null; }

  /* the Members page */
  function memRow(c) {
    var posts = (c.threadCount || 0) + (c.commentCount || 0);
    var meta = [c.area, posts ? posts + (posts === 1 ? " post" : " posts") : ""].filter(Boolean).join(" · ") || memberSince(c.joined);
    return '<div class="bd-mem" role="listitem">' +
      '<button type="button" class="bd-mem-who" data-bd-who="' + esc(c.memberId) + '">' + avatar(c.name, c.colour, c.photo) +
        "<span><b>" + esc(c.name) + "</b><small>" + esc(meta) + "</small>" +
        (c.sharedShows.length ? "<em>Also going to " + esc(c.sharedShows.slice(0, 2).join(" and ")) + "</em>" : "") +
        (c.into.length ? '<span class="bd-tags">' + c.into.slice(0, 4).map(function (t) { return "<i>" + esc(t) + "</i>"; }).join("") + "</span>" : "") +
      "</span></button>" +
      '<span class="bd-mem-act">' +
        (c.canMessage ? '<button type="button" class="btn btn-teal sm" data-bd-chat="' + esc(c.memberId) + '">Message</button>' : "") +
        '<button type="button" class="bd-follow' + (c.following ? " on" : "") + '" data-bd-pfollow="' + esc(c.memberId) + '" aria-pressed="' + (c.following ? "true" : "false") + '">' + (c.following ? "Following" : "Follow") + "</button>" +
      "</span></div>";
  }
  function vMembers() {
    var d = MEM.data;
    var head = crumbs([["Forum", "home"], ["Members", ""]]) +
      '<div class="bd-ghead"><div><h1>Members</h1><p>Everyone who has joined the forum. Tap anyone to see their profile, follow them or send them a private message.</p></div></div>';
    if (!d) return head + '<div class="bd-empty"><p>Loading.</p></div>';
    if (d.error) return head + '<div class="bd-empty"><b>The members list didn\'t load</b><p>' + esc(d.error) + "</p></div>";
    var me = d.listed
      ? '<div class="bd-listme on"><span><b>You are on the list.</b> Other fans can find you here, and you can take yourself off whenever you like.</span><button type="button" class="fl-act" data-bd-listme="0">Take me off</button></div>'
      : '<div class="bd-listme"><span><b>You are hidden from this list.</b> Put yourself back on and fans heading to the same shows can find you and say hello.</span><button type="button" class="btn btn-teal sm" data-bd-listme="1">Show me on the list</button></div>';
    var chips = [["all", "Everyone"]].concat(d.myShows ? [["going", "Going to my shows"]] : []).concat([["following", "People I follow"]]);
    var tools = '<div class="bd-mtools"><form class="bd-msearch" data-bd-msearch role="search"><label class="fl-sr" for="bdMq">Search members</label>' +
      '<input type="search" id="bdMq" value="' + esc(MEM.q) + '" placeholder="Search by name, area or interest" autocomplete="off"><button type="submit" class="btn btn-navy sm">Search</button></form>' +
      '<div class="bd-chips">' + chips.map(function (c) {
        return '<button type="button" class="bd-chip' + (MEM.filter === c[0] ? " on" : "") + '" data-bd-mfilter="' + c[0] + '" aria-pressed="' + (MEM.filter === c[0] ? "true" : "false") + '">' + c[1] + "</button>";
      }).join("") + "</div></div>";
    var narrowed = MEM.q || MEM.filter !== "all";
    var list = d.members.length
      ? '<p class="bd-mtotal">' + d.total + (d.total === 1 ? " member" : " members") + '</p><div class="bd-mems" role="list">' + d.members.map(memRow).join("") + "</div>"
      : '<div class="bd-empty"><b>' + (narrowed ? "No one matches that" : "No other members yet") + "</b><p>" +
        (narrowed ? "Try a different word, or switch back to Everyone." : "It is quiet for now. As more fans join the forum they will show up here.") + "</p></div>";
    return head + me + tools + list;
  }
  function loadMembers() {
    return call("listMembers", { query: MEM.q, filter: MEM.filter }).then(function (r) {
      MEM.data = r.ok ? r.data : { members: [], total: 0, listed: false, myShows: 0, error: r.error || "Please try again in a moment." };
      if (B.view === "members") $("[data-bd-main]").innerHTML = vMembers();
    });
  }

  /* the Messages page */
  function vMessages() {
    var head = crumbs([["Forum", "home"], ["Messages", ""]]) +
      '<div class="bd-ghead"><div><h1>Messages</h1><p>Your private chats. Only you and the person you are talking to can read them.</p></div><button type="button" class="btn btn-teal sm" data-bd-go="members">Find members</button></div>';
    if (!DM.loaded) return head + '<div class="bd-empty"><p>Loading your chats.</p></div>';
    var list = DM.chats.length
      ? '<div class="bd-table bd-chats">' + DM.chats.map(function (c) {
          return '<button type="button" class="bd-chatrow' + (c.unread ? " new" : "") + '" data-bd-chat="' + esc(c.memberId) + '">' + avatar(c.name, c.colour, c.photo) +
            "<span><b>" + esc(c.name) + "</b><small>" + (c.lastFromMe ? "You: " : "") + esc(c.last) + '</small></span><span class="bd-cw">' + esc(shortTime(c.at)) + (c.unread ? '<i aria-label="Unread"></i>' : "") + "</span></button>";
        }).join("") + "</div>"
      : '<div class="bd-empty"><b>No messages yet</b><p>Find someone on the Members page, or tap a name on any post, then press Message. I would suggest starting with someone going to the same show as you.</p><button type="button" class="btn btn-teal sm" data-bd-go="members">Find members</button></div>';
    return head + list + '<p class="bd-mnote">You choose who can message you, or turn messages off, in the Settings tab of My Profile. If anyone makes you uneasy, block or report them from the chat and I will take a look.</p>';
  }
  function drawMessages() { var m = $("[data-bd-main]"); if (m && B.view === "messages") m.innerHTML = vMessages(); }

  /* profile cards */
  function cardKey(e) { if (e.key === "Escape") { closeCard(); var c = $("#bdChat"); if (c && !$("#bdCard")) c.focus(); } }
  function closeCard() { var w = $("#bdCard"); if (w) w.remove(); document.removeEventListener("keydown", cardKey); }
  function openCard(id) {
    if (!id || id === "system" || !needMember()) return;
    closeCard();
    var w = document.createElement("div");
    w.id = "bdCard"; w.className = "bd-cardwrap";
    w.innerHTML = '<div class="bd-card" role="dialog" aria-modal="true" aria-label="Member profile" tabindex="-1"><button type="button" class="bd-x" data-bd-cardx aria-label="Close">' + IC.x + '</button><div class="bd-card-in"><p class="bd-card-wait">Loading their profile</p></div></div>';
    document.body.appendChild(w);
    document.addEventListener("keydown", cardKey);
    $(".bd-card", w).focus();
    call("getMemberCard", { memberId: id }).then(function (r) {
      var box = $(".bd-card-in", w); if (!box || !document.body.contains(w)) return;
      box.innerHTML = r.ok ? cardHtml(r.data) : '<p class="bd-card-wait">' + esc(r.error || "That profile didn't load. Please try again.") + "</p>";
    });
  }
  function cardHtml(c) {
    var id = esc(c.memberId);
    var tags = [];
    if (c.followsYou) tags.push("Follows you");
    if (c.role === "admin" || c.role === "moderator") tags.push(c.role === "admin" ? "Guide team" : "Moderator");
    var acts = c.isMe
      ? '<p class="bd-why">This is you. Change your photo, bio and who can message you from My Profile.</p>'
      : (c.canMessage ? '<button type="button" class="btn btn-teal" data-bd-chat="' + id + '">' + (c.hasChat ? "Open chat" : "Message") + "</button>" : '<p class="bd-why">' + esc(c.why) + "</p>") +
        '<button type="button" class="bd-follow' + (c.following ? " on" : "") + '" data-bd-pfollow="' + id + '" aria-pressed="' + (c.following ? "true" : "false") + '">' + (c.following ? "Following" : "Follow") + "</button>" +
        '<button type="button" class="bd-blk" data-bd-block="' + id + '" data-on="' + (c.blockedByMe ? "1" : "0") + '">' + (c.blockedByMe ? "Unblock" : "Block") + "</button>";
    return '<div class="bd-card-top">' + avatar(c.name, c.colour, c.photo) + "<div><h2>" + esc(c.name) + "</h2><p>" + esc([c.area, memberSince(c.joined)].filter(Boolean).join(" · ")) + "</p>" +
        (tags.length ? '<div class="bd-fys">' + tags.map(function (t) { return '<span class="bd-fy">' + esc(t) + "</span>"; }).join("") + "</div>" : "") + "</div></div>" +
      '<div class="bd-card-body">' +
        (c.bio ? '<p class="bd-bio">' + esc(c.bio) + "</p>" : "") +
        (c.into.length ? '<h3>Into</h3><div class="bd-tags">' + c.into.map(function (t) { return "<i>" + esc(t) + "</i>"; }).join("") + "</div>" : "") +
        (c.going.length ? '<h3>Going to</h3><ul class="bd-going">' + c.going.slice(0, 6).map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="bd-cstats"><div><b>' + (c.threadCount || 0) + "</b><span>" + (c.threadCount === 1 ? "Thread" : "Threads") + "</span></div><div><b>" + (c.commentCount || 0) + "</b><span>" + (c.commentCount === 1 ? "Reply" : "Replies") + "</span></div></div>" +
        (c.threads.length ? '<h3>Latest threads</h3><div class="bd-cthreads">' + c.threads.map(function (t) {
          return '<button type="button" data-bd-cthread="' + esc(t.id) + '"><span>' + esc(t.title) + "</span><small>" + esc(ago(t.created)) + "</small></button>";
        }).join("") + "</div>" : "") +
      '</div><div class="bd-card-acts">' + acts + "</div>";
  }

  /* the chat box, pinned to the bottom of the screen */
  function chatEl() { return $("#bdChat"); }
  function openChat(id, preview) {
    if (!id || !needMember() || (S.member && id === S.member.id)) return;
    closeCard();
    stopChatPoll();
    CHAT = { id: id, other: preview || null, msgs: [], can: false, why: "", blocked: false, more: false, loaded: false, error: "", timer: null, sure: "" };
    var el = chatEl();
    if (!el) {
      el = document.createElement("section");
      el.id = "bdChat"; el.className = "bd-chat"; el.setAttribute("aria-label", "Private chat"); el.tabIndex = -1;
      document.body.appendChild(el);
    }
    el.classList.remove("min", "ping");
    drawChat();
    call("getChat", { memberId: id }).then(function (r) {
      if (CHAT.id !== id) return;
      if (!r.ok) { CHAT.error = r.error || "This chat didn't load. Please try again."; drawChat(); return; }
      var d = r.data || {};
      CHAT.loaded = true; CHAT.other = d.other; CHAT.msgs = d.messages || []; CHAT.can = !!d.canMessage; CHAT.why = d.why || ""; CHAT.blocked = !!d.blockedByMe; CHAT.more = !!d.more;
      drawChat(true);
      var c = DM.chats.filter(function (x) { return x.memberId === id; })[0];
      if (c && c.unread) { c.unread = false; DM.unread = Math.max(0, DM.unread - 1); dmBadge(); drawMessages(); }
      startChatPoll();
      var ta = $("#bdChatIn");
      if (ta && !matchMedia("(pointer:coarse)").matches) ta.focus();
    });
  }
  function closeChat() { stopChatPoll(); var el = chatEl(); if (el) el.remove(); CHAT = { id: "" }; }
  function bubbles() {
    var out = "", lastDay = "";
    CHAT.msgs.forEach(function (m, i) {
      var day = dayLabel(m.at);
      if (day !== lastDay) { out += '<p class="bd-day"><span>' + esc(day) + "</span></p>"; lastDay = day; }
      out += '<div class="bd-b ' + (m.mine ? "me" : "them") + (m.failed ? " fail" : "") + (m.pending ? " wait" : "") + '"><p>' + esc(m.body).replace(/\n/g, "<br>") + "</p><small>" +
        (m.pending ? "Sending" : m.failed ? 'Not sent. <button type="button" data-bd-retry="' + i + '">Try again</button>' : esc(clock(m.at))) + "</small></div>";
    });
    return out;
  }
  function chatBody() {
    var o = CHAT.other || {};
    if (CHAT.error) return '<p class="bd-chat-note">' + esc(CHAT.error) + "</p>";
    if (!CHAT.loaded) return '<p class="bd-chat-note">Loading your chat</p>';
    return (CHAT.more ? '<button type="button" class="bd-older" data-bd-older>Show earlier messages</button>' : "") +
      (CHAT.msgs.length ? bubbles() : '<p class="bd-chat-note">Say hello to ' + esc(String(o.name || "them").split(" ")[0]) + ". Messages are private between the two of you.</p>");
  }
  function drawBody(scroll) {
    var b = $("[data-bd-chatbody]"); if (!b) return;
    b.innerHTML = chatBody();
    if (scroll) b.scrollTop = b.scrollHeight;
  }
  function drawChat(scroll) {
    var el = chatEl(); if (!el) return;
    var o = CHAT.other || { name: "Loading", colour: "#32B4AF" }, id = esc(CHAT.id);
    var old = $("#bdChatIn"), draft = old ? old.value : "";
    var foot = !CHAT.loaded ? "" : CHAT.can
      ? '<form class="bd-chat-f" data-bd-send><label class="fl-sr" for="bdChatIn">Write a message to ' + esc(o.name) + '</label><textarea id="bdChatIn" rows="1" maxlength="1000" placeholder="Write a message" enterkeyhint="send"></textarea><button type="submit" class="bd-send" aria-label="Send">' + IC.send + "</button></form>"
      : '<p class="bd-chat-no">' + esc(CHAT.why) + (CHAT.blocked ? ' <button type="button" data-bd-block="' + id + '" data-on="1">Unblock</button>' : "") + "</p>";
    el.innerHTML = '<header class="bd-chat-h"><button type="button" class="bd-chat-who" data-bd-who="' + id + '">' + avatar(o.name, o.colour, o.photo) +
        "<span><b>" + esc(o.name) + "</b><small>" + esc(o.area || "Tap for their profile") + "</small></span></button>" +
        '<button type="button" class="bd-ic" data-bd-chatmenu aria-label="Chat options" aria-expanded="false">' + IC.more + "</button>" +
        '<button type="button" class="bd-ic bd-ic-min" data-bd-chatmin aria-label="Make the chat smaller">' + IC.min + "</button>" +
        '<button type="button" class="bd-ic" data-bd-chatx aria-label="Close the chat">' + IC.x + "</button></header>" +
      '<div class="bd-chat-menu" data-bd-menu hidden>' + chatMenu() + "</div>" +
      '<div class="bd-chat-b" data-bd-chatbody aria-live="polite">' + chatBody() + "</div>" + foot;
    var ta = $("#bdChatIn"); if (ta && draft) { ta.value = draft; grow(ta); }
    if (scroll) { var b = $("[data-bd-chatbody]"); b.scrollTop = b.scrollHeight; }
    fitChat();
  }
  function chatMenu() {
    if (CHAT.sure === "report") {
      return '<form class="bd-rep" data-bd-report><label for="bdRep">What is wrong with this chat?</label><textarea id="bdRep" rows="3" maxlength="300" placeholder="A few words help me sort it quickly"></textarea>' +
        '<span><button type="submit" class="btn btn-teal sm">Send report</button><button type="button" class="fl-act" data-bd-rcancel>Cancel</button></span></form>';
    }
    return '<button type="button" data-bd-block="' + esc(CHAT.id) + '" data-on="' + (CHAT.blocked ? "1" : "0") + '">' + (CHAT.blocked ? "Unblock" : CHAT.sure === "block" ? "Tap again to block them" : "Block this member") + "</button>" +
      '<button type="button" data-bd-chatreport>Report this chat</button>' +
      '<button type="button" data-bd-chathide>' + (CHAT.sure === "hide" ? "Tap again to delete it from your list" : "Delete this chat from my list") + "</button>";
  }
  function drawMenu(open) {
    var m = $("[data-bd-menu]"), b = $("[data-bd-chatmenu]"); if (!m) return;
    m.innerHTML = chatMenu();
    if (open != null) { m.hidden = !open; if (b) b.setAttribute("aria-expanded", open ? "true" : "false"); }
  }
  function grow(ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 132) + "px"; }
  function fitChat() {
    var el = chatEl(); if (!el) return;
    var vv = window.visualViewport;
    if (window.innerWidth <= 640 && vv && !el.classList.contains("min")) { el.style.height = vv.height + "px"; el.style.top = vv.offsetTop + "px"; }
    else { el.style.height = ""; el.style.top = ""; }
  }
  if (window.visualViewport) { window.visualViewport.addEventListener("resize", fitChat); window.visualViewport.addEventListener("scroll", fitChat); }
  window.addEventListener("resize", fitChat);
  function startChatPoll() { stopChatPoll(); CHAT.timer = setInterval(pollChat, 5000); }
  function stopChatPoll() { if (CHAT && CHAT.timer) clearInterval(CHAT.timer); if (CHAT) CHAT.timer = null; }
  function pollChat() {
    if (!CHAT.id || !CHAT.loaded || document.hidden) return;
    var id = CHAT.id, real = CHAT.msgs.filter(function (m) { return !m.pending && !m.failed; });
    var after = real.length ? real[real.length - 1].at : new Date(Date.now() - 3600000).toISOString();
    call("getChat", { memberId: id, after: after }).then(function (r) {
      if (CHAT.id !== id || !r.ok || !r.data) return;
      var add = (r.data.messages || []).filter(function (m) { return !CHAT.msgs.some(function (x) { return x.id === m.id; }); });
      if (!add.length) return;
      var b = $("[data-bd-chatbody]"), atEnd = !b || b.scrollHeight - b.scrollTop - b.clientHeight < 90;
      CHAT.msgs = CHAT.msgs.concat(add);
      drawBody(atEnd);
      var el = chatEl(); if (el && el.classList.contains("min")) el.classList.add("ping");
      var last = add[add.length - 1];
      noteChat(id, last.body, last.mine, last.at);
    });
  }
  function noteChat(id, body, mine, at) {
    var c = DM.chats.filter(function (x) { return x.memberId === id; })[0];
    if (!c) { var o = CHAT.other || {}; c = { memberId: id, name: o.name || "A member", colour: o.colour, photo: o.photo }; }
    DM.chats = [c].concat(DM.chats.filter(function (x) { return x !== c; }));
    c.last = body.replace(/\s+/g, " ").slice(0, 140); c.lastFromMe = !!mine; c.at = at || new Date().toISOString(); c.unread = false;
    drawMessages();
  }
  function sendNow(text, idx) {
    var m;
    if (idx == null) { m = { id: "tmp" + Date.now(), mine: true, body: text, at: new Date().toISOString(), pending: true }; CHAT.msgs.push(m); }
    else { m = CHAT.msgs[idx]; if (!m) return; m.failed = false; m.pending = true; }
    drawBody(true);
    var id = CHAT.id;
    call("sendMessage", { memberId: id, body: m.body }).then(function (r) {
      m.pending = false;
      if (r.ok && r.data) { m.id = r.data.id; m.at = r.data.at; noteChat(id, m.body, true, m.at); }
      else { m.failed = true; toast(r.error || "That message didn't send. Please try again."); }
      if (CHAT.id === id) drawBody(true);
    });
  }
  function olderMessages() {
    var first = CHAT.msgs.filter(function (m) { return !m.pending; })[0]; if (!first) return;
    var id = CHAT.id, b = $("[data-bd-chatbody]"), h = b ? b.scrollHeight : 0;
    call("getChat", { memberId: id, before: first.at }).then(function (r) {
      if (CHAT.id !== id || !r.ok) return;
      CHAT.msgs = (r.data.messages || []).concat(CHAT.msgs); CHAT.more = !!r.data.more;
      drawBody(false);
      var b2 = $("[data-bd-chatbody]"); if (b2) b2.scrollTop = b2.scrollHeight - h;
    });
  }
  function setFollow(btn, on) {
    $$('[data-bd-pfollow="' + btn.getAttribute("data-bd-pfollow") + '"]').forEach(function (x) {
      x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); x.textContent = on ? "Following" : "Follow";
    });
  }

  document.addEventListener("click", function (e) {
    if (!B.on) return;
    var t = e.target.closest && e.target.closest("[data-bd-who],[data-bd-chat],[data-bd-pfollow],[data-bd-block],[data-bd-listme],[data-bd-mfilter],[data-bd-cardx],[data-bd-cthread],[data-bd-chatx],[data-bd-chatmin],[data-bd-chatmenu],[data-bd-chatreport],[data-bd-chathide],[data-bd-older],[data-bd-retry],[data-bd-rcancel],[data-bd-rchat],[data-bd-rclear]");
    if (!t) {
      if (e.target.id === "bdCard") closeCard();
      var menu = $("[data-bd-menu]");
      if (menu && !menu.hidden && !(e.target.closest && e.target.closest("[data-bd-menu]"))) { CHAT.sure = ""; drawMenu(false); }
      var mini = e.target.closest && e.target.closest(".bd-chat.min .bd-chat-h");
      if (mini) { chatEl().classList.remove("min", "ping"); fitChat(); drawBody(true); }
      return;
    }
    e.preventDefault(); e.stopPropagation();
    var v;
    if ((v = t.getAttribute("data-bd-who")) != null) {
      var ch = chatEl();
      if (ch && ch.classList.contains("min") && ch.contains(t)) { ch.classList.remove("min", "ping"); fitChat(); drawBody(true); return; }
      openCard(v); return;
    }
    if ((v = t.getAttribute("data-bd-chat")) != null) { openChat(v, DM.chats.filter(function (x) { return x.memberId === v; })[0]); return; }
    if ((v = t.getAttribute("data-bd-cthread")) != null) { closeCard(); boardGo("thread", v); return; }
    if (t.hasAttribute("data-bd-cardx")) { closeCard(); return; }
    if ((v = t.getAttribute("data-bd-pfollow")) != null) {
      var was = t.classList.contains("on");
      setFollow(t, !was);
      call("toggleFollow", { memberId: v }).then(function (r) {
        if (!r.ok) { setFollow(t, was); toast(r.error || "That didn't work. Please try again."); return; }
        setFollow(t, !!r.data.following);
        if (MEM.data) MEM.data.members.forEach(function (c) { if (c.memberId === v) c.following = !!r.data.following; });
        toast(r.data.following ? "You are following them now. Their new posts reach your bell." : "You have stopped following them.");
      });
      return;
    }
    if ((v = t.getAttribute("data-bd-block")) != null) {
      var unblock = t.getAttribute("data-on") === "1";
      var inChat = !!(t.closest && t.closest("#bdChat"));
      if (!unblock && inChat && CHAT.sure !== "block") { CHAT.sure = "block"; drawMenu(true); return; }
      if (!unblock && !inChat && t.getAttribute("data-sure") !== "1") { t.setAttribute("data-sure", "1"); t.textContent = "Tap again to block"; return; }
      call("blockMember", { memberId: v, block: !unblock }).then(function (r) {
        if (!r.ok) { toast(r.error || "That didn't work. Please try again."); return; }
        toast(unblock ? "Unblocked. They can message you again if your settings allow it." : "Blocked. They can't message you and you won't see them on the Members page.");
        if (CHAT.id === v) { closeChat(); openChat(v); }
        if ($("#bdCard")) openCard(v);
        if (B.view === "members") loadMembers();
      });
      return;
    }
    if ((v = t.getAttribute("data-bd-listme")) != null) {
      t.disabled = true;
      call("setListing", { on: v === "1" }).then(function (r) {
        if (!r.ok) { t.disabled = false; toast(r.error || "That didn't save."); return; }
        toast(v === "1" ? "You are on the Members page now." : "You have been taken off the Members page.");
        loadMembers();
      });
      return;
    }
    if ((v = t.getAttribute("data-bd-mfilter")) != null) { MEM.filter = v; loadMembers(); return; }
    if (t.hasAttribute("data-bd-chatx")) { closeChat(); return; }
    if (t.hasAttribute("data-bd-chatmin")) { var c2 = chatEl(); c2.classList.toggle("min"); c2.classList.remove("ping"); fitChat(); if (!c2.classList.contains("min")) drawBody(true); return; }
    if (t.hasAttribute("data-bd-chatmenu")) { var m = $("[data-bd-menu]"); CHAT.sure = ""; drawMenu(m.hidden); return; }
    if (t.hasAttribute("data-bd-chatreport")) { CHAT.sure = "report"; drawMenu(true); var rp = $("#bdRep"); if (rp) rp.focus(); return; }
    if (t.hasAttribute("data-bd-rcancel")) { CHAT.sure = ""; drawMenu(false); return; }
    if (t.hasAttribute("data-bd-chathide")) {
      if (CHAT.sure !== "hide") { CHAT.sure = "hide"; drawMenu(true); return; }
      var hid = CHAT.id;
      call("hideChat", { memberId: hid }).then(function (r) {
        if (!r.ok) { toast(r.error || "That didn't work."); return; }
        DM.chats = DM.chats.filter(function (x) { return x.memberId !== hid; }); closeChat(); drawMessages();
        toast("Deleted from your list. If they message you again it will come back.");
      });
      return;
    }
    if (t.hasAttribute("data-bd-older")) { olderMessages(); return; }
    if ((v = t.getAttribute("data-bd-retry")) != null) { sendNow(null, +v); return; }
    if ((v = t.getAttribute("data-bd-rchat")) != null) { modChat(v); return; }
    if ((v = t.getAttribute("data-bd-rclear")) != null) {
      call("clearChatReport", { chatId: v }).then(function (r) {
        toast(r.ok ? "Marked as dealt with." : r.error || "That didn't work.");
        closeCard(); if (B.view === "mod") boardGo("mod", "", true);
      });
    }
  }, true);
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest("[data-bd-send],[data-bd-msearch],[data-bd-report]");
    if (!f || !B.on) return;
    e.preventDefault();
    if (f.hasAttribute("data-bd-msearch")) { MEM.q = f.querySelector("input").value.trim(); loadMembers(); return; }
    if (f.hasAttribute("data-bd-report")) {
      var why = f.querySelector("textarea").value.trim(), rid = CHAT.id;
      call("reportChat", { memberId: rid, reason: why }).then(function (r) {
        toast(r.ok ? "Thanks. I will read it and get back to you if I need to. You can block them too if you like." : r.error || "That report didn't send.");
        if (r.ok && CHAT.id === rid) { CHAT.sure = ""; drawMenu(false); }
      });
      return;
    }
    var ta = $("#bdChatIn"), text = ta ? ta.value.trim() : "";
    if (!text) return;
    ta.value = ""; grow(ta); ta.focus();
    sendNow(text);
  });
  document.addEventListener("keydown", function (e) {
    if (!e.target || e.target.id !== "bdChatIn" || e.key !== "Enter" || e.shiftKey || e.isComposing) return;
    if (matchMedia("(pointer:coarse)").matches) return;
    e.preventDefault();
    var f = e.target.form; if (f) f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  });
  document.addEventListener("input", function (e) { if (e.target && e.target.id === "bdChatIn") grow(e.target); });

  /* reported chats, for the Moderation page */
  function modChat(id) {
    var c = (MOD.chats || []).filter(function (x) { return x.id === id; })[0]; if (!c) return;
    closeCard();
    var w = document.createElement("div");
    w.id = "bdCard"; w.className = "bd-cardwrap";
    w.innerHTML = '<div class="bd-card bd-card-wide" role="dialog" aria-modal="true" aria-label="Reported chat" tabindex="-1"><button type="button" class="bd-x" data-bd-cardx aria-label="Close">' + IC.x + "</button>" +
      '<div class="bd-card-in"><div class="bd-card-body"><h2 class="bd-rh">' + esc(c.people.map(function (p) { return p.name; }).join(" and ")) + "</h2>" +
      '<p class="bd-why">Reported by ' + esc(c.reportedBy) + " " + esc(ago(c.at)) + ": " + esc(c.reason) + "</p>" +
      '<div class="bd-rlog">' + c.messages.map(function (m) { return "<p><b>" + esc(m.from) + "</b> <small>" + esc(shortTime(m.at)) + "</small><br>" + esc(m.body) + "</p>"; }).join("") + "</div></div>" +
      '<div class="bd-card-acts"><button type="button" class="btn btn-teal" data-bd-rclear="' + esc(c.id) + '">Mark as dealt with</button></div></div></div>';
    document.body.appendChild(w);
    document.addEventListener("keydown", cardKey);
    $(".bd-card", w).focus();
  }
  /* ---------- moderation (admin only) ---------- */
  var MOD = { tab: "queue", settings: null, overview: null };
  function modCount(d) {
    if (!d) return 0;
    return (MOD.chats || []).length + (d.pendingPosts || []).length + d.pendingGroups.length + d.reportedThreads.length + d.reportedComments.length + d.reportedPhotos.length;
  }
  function loadMod() {
    return Promise.all([call("adminOverview"), call("getModSettings"), call("reportedChats")]).then(function (rs) {
      MOD.chats = rs[2].ok ? (rs[2].data || []) : [];
      MOD.overview = rs[0].ok ? rs[0].data : null;
      MOD.settings = rs[1].ok && rs[1].data ? rs[1].data : { words: [], wordMode: "hold", firstPostApproval: true, holdLinks: true };
      return rs[0];
    });
  }
  function admBtn(label, action, id, red, extra) {
    return '<button type="button" class="fl-act' + (red ? " red" : "") + '" data-fl-adm="' + action + '" data-id="' + esc(id) + '"' + (extra || "") + ">" + label + "</button>";
  }
  function modItem(kind, title, sub, body, acts) {
    return '<div class="bd-mi"><span class="bd-mk bd-mk-' + kind + '">' + esc({ first: "First post", link: "New member link", thread: "Reported thread", comment: "Reported reply", chat: "Reported chat", photo: "Reported photo", group: "Group idea", word: "Held by word filter" }[kind] || kind) + "</span>" +
      "<div><b>" + esc(title) + "</b><small>" + sub + "</small>" + (body ? "<p>" + esc(body) + "</p>" : "") + '</div><div class="bd-ma">' + acts + "</div></div>";
  }
  function vMod() {
    var d = MOD.overview, st = MOD.settings || {};
    if (!d) return '<div class="bd-empty"><b>The admin tools didn\'t load</b><p>Please try again in a moment.</p></div>';
    var why = function (x) { return (x.reportReasons || []).slice(-2).map(esc).join(" · "); };
    var items = [];
    (d.pendingPosts || []).forEach(function (p) {
      items.push(modItem(p.heldFor === "words" ? "word" : p.heldFor === "links" ? "link" : "first", p.type === "comment" ? "Reply in: " + (p.threadTitle || "a thread") : p.title,
        esc(p.authorName) + " · " + esc(ago(p.created)) + (p.groupSlug ? " · " + esc(groupTitle(p.groupSlug)) : "") + (p.heldFor === "words" ? " · Matched: " + esc((p.matched || []).join(", ")) : p.heldFor === "links" ? " · Has a link" : " · New member"),
        String(p.body || "").slice(0, 220), admBtn("Approve", "approvePost", p.id) + admBtn("Turn down", "rejectPost", p.id, true)));
    });
    d.reportedThreads.forEach(function (t) { items.push(modItem("thread", t.title, t.reportCount + (t.reportCount === 1 ? " report" : " reports") + (why(t) ? " · " + why(t) : ""), "", admBtn("Open", "open", t.id) + admBtn("Keep it", "clearThreadReports", t.id) + admBtn("Remove", "removeThread", t.id, true))); });
    d.reportedComments.forEach(function (c) { items.push(modItem("comment", "Reply by " + c.authorName, why(c), String(c.body || "").slice(0, 200), admBtn("Keep it", "clearCommentReports", c.id) + admBtn("Remove", "removeComment", c.id, true))); });
    d.reportedPhotos.forEach(function (p) { items.push(modItem("photo", p.title, p.reportCount + (p.reportCount === 1 ? " report" : " reports") + (why(p) ? " · " + why(p) : ""), "", admBtn("Keep it", "clearGalleryReports", p.id) + admBtn("Remove", "removeGalleryPhoto", p.id, true))); });
    (MOD.chats || []).forEach(function (c) {
      var last = c.messages.slice(-3).map(function (m) { return m.from + ": " + m.body; }).join("  /  ");
      items.push(modItem("chat", "Chat between " + c.people.map(function (p) { return p.name; }).join(" and "), "Reported by " + esc(c.reportedBy) + " · " + esc(ago(c.at)) + (c.reason ? " · " + esc(c.reason) : ""), last.slice(0, 220),
        '<button type="button" class="fl-act" data-bd-rchat="' + esc(c.id) + '">Read the chat</button><button type="button" class="fl-act" data-bd-rclear="' + esc(c.id) + '">Dealt with</button>'));
    });
    d.pendingGroups.forEach(function (g) { items.push(modItem("group", g.title, "Suggested by " + esc(g.requestedByName), g.description || "", admBtn("Approve", "approveGroup", g.id) + admBtn("Turn down", "rejectGroup", g.id, true))); });
    var n = items.length;
    var tabs = [["queue", "Waiting for you" + (n ? " (" + n + ")" : "")], ["words", "Word filter"], ["rules", "Posting rules"]];
    var body;
    if (MOD.tab === "queue") {
      body = n ? '<div class="bd-mlist">' + items.join("") + "</div>" : '<div class="bd-empty"><b>Nothing waiting</b><p>No posts to check, no reports and no group ideas right now.</p></div>';
    } else if (MOD.tab === "words") {
      body = '<div class="bd-mbox"><h2>Blocked words and phrases</h2><p>Posts and replies with any of these are checked before they go live. Matching is not case sensitive and catches the word inside longer words too.</p>' +
        '<div class="bd-words">' + (st.words.length ? st.words.map(function (w, i) { return '<span>' + esc(w) + '<button type="button" data-bd-word-del="' + i + '" aria-label="Remove ' + esc(w) + '">×</button></span>'; }).join("") : '<em>No words added yet.</em>') + "</div>" +
        '<form class="bd-wadd" data-bd-word-add><label class="fl-sr" for="bdW">Add a word or phrase</label><input type="text" id="bdW" maxlength="40" placeholder="Add a word or phrase" autocomplete="off"><button type="submit" class="btn btn-teal sm">Add</button></form>' +
        '<h3>What happens to a match</h3><div class="bd-radio">' +
        [["hold", "Hold it for me to check", "The post waits in Waiting for you until you approve it."], ["mask", "Post it with the word starred out", "It goes live straight away, with the word shown as ****."]].map(function (o) {
          return '<label><input type="radio" name="wordMode" value="' + o[0] + '"' + (st.wordMode === o[0] ? " checked" : "") + ' data-bd-mset="wordMode"><span><b>' + o[1] + "</b><small>" + o[2] + "</small></span></label>";
        }).join("") + "</div></div>";
    } else {
      body = '<div class="bd-mbox"><h2>Posting rules</h2>' +
        '<label class="bd-qt"><input type="checkbox" data-bd-mset="firstPostApproval"' + (st.firstPostApproval ? " checked" : "") + '><span class="bd-sw" aria-hidden="true"></span><span><b>Check a new member\'s first post</b><small>Their first thread or reply waits for you. Once you approve one, everything after goes live straight away.</small></span></label>' +
        '<label class="bd-qt"><input type="checkbox" data-bd-mset="holdLinks"' + (st.holdLinks ? " checked" : "") + '><span class="bd-sw" aria-hidden="true"></span><span><b>Check links from members who joined in the last 7 days</b><small>Stops spam links slipping through. Older members can post links as normal.</small></span></label>' +
        '<p class="bd-mnote">Members whose post is waiting see a short note saying it will show once it has been checked.</p></div>';
    }
    return crumbs([["Forum", "home"], ["Moderation", ""]]) +
      '<div class="bd-ghead"><div><h1>Moderation</h1><p>Only you and your moderators see this. Pin, close or move a thread from the tools at the top of any thread.</p></div></div>' +
      '<div class="bd-mstats"><div><b>' + (d.counts.members || 0) + "</b><span>Members</span></div><div><b>" + (d.counts.threads || 0) + "</b><span>Threads</span></div><div><b>" + (d.counts.photos || 0) + "</b><span>Photos</span></div><div><b>" + n + "</b><span>Waiting for you</span></div></div>" +
      '<div class="bd-mtabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (MOD.tab === t[0]) + '" class="' + (MOD.tab === t[0] ? "on" : "") + '" data-bd-mtab="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>" + body;
  }
  function saveMod(msg) {
    return call("saveModSettings", MOD.settings).then(function (r) { toast(r.ok ? msg : r.error || "That didn't save."); });
  }
  function modTools(t) {
    var opts = catGroups().map(function (c) { return '<optgroup label="' + esc(c.title) + '">' + c.groups.map(function (g) { return '<option value="' + esc(g.slug) + '"' + (g.slug === t.groupSlug ? " selected" : "") + ">" + esc(g.title) + "</option>"; }).join("") + "</optgroup>"; }).join("");
    return '<div class="bd-modbar"><b>Moderator tools</b>' +
      admBtn(t.pinned ? "Unpin" : "Pin to the top", t.pinned ? "unpin" : "pin", t.id) +
      admBtn(t.locked ? "Reopen replies" : "Close replies", t.locked ? "unlock" : "lock", t.id) +
      '<span class="bd-move"><label class="fl-sr" for="bdMv">Move to</label><select id="bdMv">' + opts + "</select>" + admBtn("Move", "moveThread", t.id) + "</span>" +
      admBtn("Remove thread", "removeThread", t.id, true) + "</div>";
  }
  document.addEventListener("click", function (e) {
    if (!B.on) return;
    var tb = e.target.closest && e.target.closest("[data-bd-mtab]");
    if (tb) { MOD.tab = tb.getAttribute("data-bd-mtab"); $("[data-bd-main]").innerHTML = vMod(); return; }
    var wd = e.target.closest && e.target.closest("[data-bd-word-del]");
    if (wd) { var w = MOD.settings.words.splice(+wd.getAttribute("data-bd-word-del"), 1)[0]; $("[data-bd-main]").innerHTML = vMod(); saveMod("Removed " + w + "."); }
  });
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest("[data-bd-word-add]");
    if (!f) return;
    e.preventDefault();
    var v = f.querySelector("input").value.trim().toLowerCase();
    if (v.length < 2) { toast("Add at least 2 letters."); return; }
    if (MOD.settings.words.indexOf(v) >= 0) { toast("That one is already on the list."); return; }
    MOD.settings.words.push(v); $("[data-bd-main]").innerHTML = vMod(); saveMod("Added " + v + " to the filter.");
    var i = $("#bdW"); if (i) i.focus();
  });
  document.addEventListener("change", function (e) {
    var el = e.target; if (!B.on || !el.hasAttribute || !el.hasAttribute("data-bd-mset")) return;
    var k = el.getAttribute("data-bd-mset");
    MOD.settings[k] = el.type === "checkbox" ? el.checked : el.value;
    saveMod(k === "firstPostApproval" ? (el.checked ? "First posts will wait for you." : "First posts now go live straight away.") : k === "holdLinks" ? (el.checked ? "New members' links will wait for you." : "Links now go live straight away.") : "Saved.");
  });

  function boardStart() {
    if (B.on || S.look !== "clean") return;
    B.on = true;
    boardBuild();
    loadFollowing().then(boardSide);
    if (S.member && S.member.isAdmin) loadMod().then(boardSide);
    boardGo("home", "", true);
    loadChats().then(dmPollStart);
    if (!B.whereDone) {
      B.whereDone = true;
      call("where").then(function (r) {
        var w = (r.ok && r.data) || {};
        if (!B.on) return;
        if (w.chat) { boardGo("messages", "", true); openChat(w.chat); }
        else if (w.v === "messages" || w.v === "members" || w.v === "mod") boardGo(w.v, "", true);
      });
    }
  }
  function boardStop() {
    if (!B.on) return;
    B.on = false; parkSections();
    closeChat(); closeCard(); dmPollStop();
    var look = $("#lookSw"), row = $(".jumprow"); if (look && row) row.insertBefore(look, row.firstChild);
    var b = $("#board"); if (b) b.remove();
    document.body.classList.remove("fl-member");
  }
  document.addEventListener("click", function (e) {
    if (!B.on) return;
    var el = e.target.closest && e.target.closest("[data-bd-go],[data-bd-group],[data-bd-new],[data-bd-sec],[data-bd-toggle],[data-bd-quote],[data-bd-follow],[data-bd-answer],[data-bd-jump],[data-bd-addphoto],[data-bd-delphoto],[data-bd-at]");
    if (!el) { if (!(e.target.closest && e.target.closest(".bd-atlist"))) closeAt(); return; }
    if (el.hasAttribute("data-bd-follow")) {
      e.preventDefault(); e.stopPropagation();
      var type = el.getAttribute("data-bd-follow"), fid = el.getAttribute("data-id"), want = !isFol(type, fid);
      el.disabled = true;
      call("followTarget", { targetType: type, targetId: fid, follow: want }).then(function (r) {
        el.disabled = false;
        if (!r.ok) { toast(r.error || "That didn't save. Please try again."); return; }
        var list = B.fol[type === "group" ? "groups" : "threads"], i = list.indexOf(fid);
        if (want && i < 0) list.push(fid);
        if (!want && i >= 0) list.splice(i, 1);
        el.outerHTML = followBtn(type, fid); boardSide();
        toast(want ? (type === "group" ? "Following. New threads here will reach your bell." : "Following. New replies will reach your bell.") : "You've stopped following it.");
      });
      return;
    }
    if (el.hasAttribute("data-bd-answer")) {
      e.preventDefault(); e.stopPropagation();
      var cid = el.getAttribute("data-bd-answer");
      call("markAnswer", { threadId: B.thread, commentId: cid || null }).then(function (r) {
        if (!r.ok) { toast(r.error || "That didn't save. Please try again."); return; }
        toast(cid ? "Marked as the answer. Thanks, that helps the next person." : "Answer unmarked.");
        var t = B.all.filter(function (x) { return x.id === B.thread; })[0]; if (t) t.answerId = cid || "";
        boardGo("thread", B.thread, true);
      });
      return;
    }
    if (el.hasAttribute("data-bd-jump")) { e.preventDefault(); var a = $(".bd-post.best"); if (a) a.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (el.hasAttribute("data-bd-addphoto")) { e.preventDefault(); var fi = $("[data-bd-file]"); if (fi) fi.click(); return; }
    if (el.hasAttribute("data-bd-delphoto")) { e.preventDefault(); B.photo = null; drawPhotoBox(); return; }
    if (el.hasAttribute("data-bd-at")) {
      e.preventDefault(); e.stopPropagation();
      var ta = document.getElementById(el.getAttribute("data-ta")); if (!ta) return;
      var pos = ta.selectionStart, before = ta.value.slice(0, pos).replace(/@[^@\s]*$/, ""), after = ta.value.slice(pos);
      var ins = "@" + el.getAttribute("data-bd-at") + " ";
      ta.value = before + ins + after; ta.focus(); ta.setSelectionRange((before + ins).length, (before + ins).length);
      closeAt(); return;
    }

    e.preventDefault(); e.stopPropagation();
    if (el.hasAttribute("data-bd-toggle")) { var s = $(".bd-side"); var o = !s.classList.contains("open"); s.classList.toggle("open", o); el.setAttribute("aria-expanded", o ? "true" : "false"); return; }
    if (el.hasAttribute("data-bd-quote")) { var ta = $("#flReply"); if (ta) { ta.value = "@" + el.getAttribute("data-bd-quote") + " " + ta.value; ta.focus(); ta.scrollIntoView({ behavior: "smooth", block: "center" }); } return; }
    if (el.hasAttribute("data-bd-new")) { boardGo("compose", el.getAttribute("data-bd-new") || (B.view === "group" ? B.group : "")); return; }
    if (el.hasAttribute("data-bd-group")) { boardGo("group", el.getAttribute("data-bd-group")); return; }
    if (el.hasAttribute("data-bd-sec")) { boardGo("sec", el.getAttribute("data-bd-sec")); return; }
    var go = el.getAttribute("data-bd-go");
    if (go === "back") { var h = hist.pop(); if (h && h.view !== "compose") boardGo(h.view, h.view === "group" ? h.group : h.view === "thread" ? h.thread : h.sec, true); else boardGo("home", "", true); return; }
    if (go.indexOf("g:") === 0) { boardGo("group", go.slice(2)); return; }
    boardGo(go);
  }, true);
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest("[data-bd-search]");
    if (!f) return;
    e.preventDefault();
    B.q = f.querySelector("input").value.trim();
    if (B.q.length < 2) { toast("Type at least 2 letters to search."); return; }
    boardGo("search");
  });
  /* photo picked in New thread */
  function drawPhotoBox() {
    var box = $("[data-bd-photo]"); if (!box) return;
    if (!B.photo) { box.innerHTML = '<button type="button" class="btn btn-navy sm" data-bd-addphoto>Add a photo</button><input type="file" accept="image/jpeg,image/png,image/webp" data-bd-file hidden><small>Your own photos only. The camera settings are read from the photo for you.</small>'; return; }
    var x = B.photo.exif, found = ["camera", "shutter", "aperture", "iso"].filter(function (k) { return x[k]; }).length;
    box.innerHTML = '<div class="bd-pv"><img src="' + B.photo.url + '" alt="Your photo"><div><b>' + esc(B.photo.name) + "</b><small>" + (found ? "Settings read from your photo. Check them and fill any gaps." : "No settings found in this photo. Add them if you know them, it really helps others learn.") + '</small><button type="button" class="fl-act red" data-bd-delphoto>Remove photo</button></div></div>' +
      photoFields(x) + '<label class="bd-pcat"><span>Photo category</span><select name="photoCat">' + CATS.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + "</select></label>" +
      '<label class="bd-own"><input type="checkbox" name="ownPhoto"> This is my own photo. It also goes into the photo gallery.</label>';
  }
  document.addEventListener("change", function (e) {
    if (!B.on || !e.target.matches || !e.target.matches("[data-bd-file]")) return;
    var file = e.target.files && e.target.files[0]; if (!file) return;
    if (file.size > 25e6) { toast("That photo is a bit big. Please choose one under 25MB."); return; }
    readExif(file).then(function (x) { B.photo = { file: file, name: file.name, url: URL.createObjectURL(file), exif: x }; drawPhotoBox(); });
  });
  /* @mention suggestions */
  function closeAt() { var m = $(".bd-atlist"); if (m) m.remove(); }
  document.addEventListener("input", function (e) {
    if (!B.on || !e.target.matches || !e.target.matches("[data-bd-mention]")) return;
    var ta = e.target, m = ta.value.slice(0, ta.selectionStart).match(/@([^@\s]*)$/);
    closeAt();
    if (!m) return;
    var q = m[1].toLowerCase(), me = S.member ? S.member.name : "";
    var pool = (B.view === "thread" ? B.people : []).concat(B.all.map(function (t) { return t.authorName; }));
    var list = pool.filter(function (n, i) {
      return n && pool.indexOf(n) === i && n !== me && (!q || n.toLowerCase().split(" ").some(function (w) { return w.indexOf(q) === 0; }));
    }).slice(0, 6);
    if (!list.length) return;
    if (!ta.id) ta.id = "bdTa" + Date.now();
    var box = document.createElement("div"); box.className = "bd-atlist"; box.setAttribute("role", "listbox");
    box.innerHTML = "<small>Mention someone</small>" + list.map(function (n) { return '<button type="button" data-bd-at="' + esc(n) + '" data-ta="' + ta.id + '">@' + esc(n) + "</button>"; }).join("");
    ta.parentNode.style.position = "relative"; ta.parentNode.appendChild(box);
  });
  document.addEventListener("change", function (e) {
    if (!B.on || !e.target.matches || !e.target.matches("[data-bd-sort]")) return;
    B.sort = e.target.value; boardGo(B.view, B.view === "group" ? B.group : "", true);
  });


  /* ---------- start ---------- */
  function start(opts) {
    S.look = (opts && opts.look) === "hud" ? "hud" : "clean";
    S.btn = (opts && opts.buttons) || { main: "btn btn-teal", alt: "btn btn-out" };
    var st = document.createElement("style"); st.id = "forum-live-css"; st.textContent = CSS; document.head.appendChild(st);
    $$(".preview-strip,.example").forEach(function (el) { el.remove(); });

    var main = $("main");
    if (!main) { main = document.createElement("main"); document.body.appendChild(main); }
    buildMain(main);
    buildNav();
    var hash = (location.hash || "").slice(1);
    show(SECTIONS.some(function (s) { return s.id === hash; }) ? hash : "feed", false);

    loadGroups().then(function () {
      feedList();
      threadList('[data-fl-list="buddy"]', G_BUDDY, "No meet ups posted yet", "Going to a show next season? Post a meet up and see who else is heading there.");
      threadList('[data-fl-list="rarity"]', G_RARE, "Nothing logged yet", "The 2027 season hasn't started, so the log is empty for now. Log the first rare visitor when you spot one.");
      threadList('[data-fl-list="kit"]', G_KIT, "Nothing for sale or swap yet", "Got kit you no longer use? List it here for other members.");
      if (current === "corner") loadGallery();
    });
    call("getSession").then(function (r) {
      setMember(r.ok && r.data ? r.data.member : null);
      if (!r.ok) $$("[data-fl-who]").forEach(function (el) { el.textContent = "Log in to post and reply."; });
    });
  }

  window.ForumLive = { start: start };
})();
