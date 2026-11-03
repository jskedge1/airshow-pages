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
    var b = f.querySelector('button[type="submit"]'); b.disabled = true; b.textContent = "Posting";
    call("createThread", { groupSlug: group, title: title, body: body }).then(function (r) {
      b.disabled = false; b.textContent = "Post it";
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
        closeModal(); toast("Thread deleted."); loadGroups(); refreshLists();
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
    el.disabled = true;
    call("adminAction", { action: action, id: id }).then(function (r) {
      if (!r.ok) { el.disabled = false; toast(r.error); return; }
      toast("Done."); loadAdmin(); loadGroups(); refreshLists();
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
