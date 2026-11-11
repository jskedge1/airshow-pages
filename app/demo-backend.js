/* app/demo-backend.js (11 Nov 2026)
   Working preview only. Stands in for the Wix page code on /app with example data, so the whole app
   (Home, My Airshow Hub, the Airshow Forum and Show Day Live) can be tried without the website.
   It is put in front of app.js by tools-app-preview.py and is never loaded on the live site.

   app.js calls window.UKAG_BACKEND({ source, action, payload }) and gets back { ok, data, error }.
   News the page code would push (log in, log out) goes out through window.ukagAppEvent(message).
   Changes are kept on this device (localStorage) so the preview remembers what you did. */
(function () {
  "use strict";

  var KEY = "ukagAppPreview1";
  var mem = null;
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!mem) mem = seed();
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }

  var DAY = 864e5;
  function at(d) { return new Date(Date.now() + d * DAY).toISOString(); }
  function ago(mins) { return new Date(Date.now() - mins * 6e4).toISOString(); }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function fail(msg) { var e = new Error(msg); e.demo = true; throw e; }

  var ME = { id: "me", name: "Sam Taylor", colour: "#6950A1", area: "Bedford", photo: "" };
  var PEOPLE = {
    priya: { id: "priya", name: "Priya Kaur", colour: "#32B4AF", area: "Cambridge", into: ["Photography", "Warbirds"] },
    mike: { id: "mike", name: "Mike Owens", colour: "#D74949", area: "Swindon", into: ["Camping", "Fast jets"] },
    lewis: { id: "lewis", name: "Lewis Barker", colour: "#13293C", area: "Telford", into: ["Photography", "Fast jets"] },
    ellie: { id: "ellie", name: "Ellie Grant", colour: "#0E5F5B", area: "Eastbourne", into: ["Families", "Display teams"] }
  };

  var SHOWS = [
    ["duxford", "IWM Duxford Summer Air Show", "Duxford", 23.4, 24.4, "8:30am", "duxfordairshows"],
    ["shuttleworth", "Shuttleworth Season Premiere", "Shuttleworth", 39.4, 39.4, "9:00am", "shuttleworthairshows"],
    ["cosford", "RAF Cosford Air Show", "RAF Cosford", 214.4, 214.4, "8:00am", "cosfordairshow"],
    ["riat", "Royal International Air Tattoo", "RIAT", 247.3, 249.3, "7:00am", "riat"],
    ["eastbourne", "Airbourne: Eastbourne International Airshow", "Eastbourne", 273.4, 276.4, "10:00am", "eastbourneairshow"],
    ["southport", "Southport Air Show", "Southport", 296.4, 297.4, "10:00am", "southport-air-show"]
  ].map(function (r) {
    var s = at(r[3]), e = at(r[4]);
    var d1 = new Date(s), d2 = new Date(e);
    var f = function (d, y) { return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: y ? "numeric" : undefined }); };
    return { slug: r[0], name: r[1], shortName: r[2], link: "/" + r[6], dateText: r[3] === r[4] ? f(d1, true) : f(d1) + " to " + f(d2, true), dateStatus: "Example", gatesOpen: r[5], start: s, end: e };
  });
  function show(slug) { return SHOWS.filter(function (s) { return s.slug === slug; })[0]; }

  var LINEUP = {
    duxford: ["Spitfire Mk IX", "P-51D Mustang", "B-17 Sally B", "Red Arrows", "Typhoon Display", "Hurricane Mk I"],
    shuttleworth: ["Sopwith Pup", "Gloster Gladiator", "Westland Lysander", "Spitfire Mk Vc"],
    cosford: ["Red Arrows", "Typhoon Display", "Chinook", "Hawk T2", "Battle of Britain Memorial Flight"],
    riat: ["F-35A Lightning II", "Typhoon Display", "Frecce Tricolori", "Red Arrows", "Rafale Solo Display", "A400M Atlas"],
    eastbourne: ["Red Arrows", "Typhoon Display", "Chinook", "Blades"],
    southport: ["Red Arrows", "Typhoon Display", "Spitfire Mk IX"]
  };

  function newTrip(slug) {
    var s = show(slug);
    return {
      id: uid("t"), showSlug: s.slug, showName: s.name, start: s.start, end: s.end, travel: "", gatesOpen: s.gatesOpen,
      budgetLimit: 80, budget: [], timeline: [],
      todo: [
        { id: "a", t: "Book tickets", d: "Early tickets are usually cheaper", done: false },
        { id: "b", t: "Plan travel", d: "Book trains early for the best fares", done: false },
        { id: "c", t: "Pack ear defenders", d: "For the jets", done: false },
        { id: "d", t: "Read the show rules", d: "Chairs, drones and bag rules change", done: false }
      ],
      packing: { mode: "day", checked: [], extra: [] }, groupCode: ""
    };
  }

  function seed() {
    var trip = newTrip("duxford");
    trip.travel = "car"; trip.groupCode = "DX7Q";
    trip.todo[0].done = true;
    trip.budget = [{ id: "b1", label: "Tickets", amount: 42 }, { id: "b2", label: "Fuel", amount: 18 }];
    return {
      in: true,
      trips: [trip],
      mustSee: [{ id: "m1", aircraftId: "duxford-0", showSlug: "duxford", showName: trip.showName, name: "Spitfire Mk IX", status: "Confirmed" },
                { id: "m2", aircraftId: "duxford-2", showSlug: "duxford", showName: trip.showName, name: "B-17 Sally B", status: "Waiting" }],
      updates: [
        { id: "u1", kind: "lineup", heading: "Spitfire pair confirmed", body: "Two Spitfires are now listed for Duxford's afternoon display. One is on your must see list.", showSlug: "duxford", link: "", read: false, created: ago(180) },
        { id: "u2", kind: "social", heading: "Priya is going to Duxford too", body: "Someone you follow saved the same show. Say hello in the forum.", showSlug: "duxford", link: "", read: false, created: ago(1560) },
        { id: "u3", kind: "travel", heading: "Weather looks dry", body: "The first long range forecast for show day is light winds and sunny spells.", showSlug: "duxford", link: "", read: true, created: ago(4300) }
      ],
      past: [{ id: "p1", showName: "Royal International Air Tattoo", year: 2026, note: "F-35 and the Frecce", rareAircraft: "" },
             { id: "p2", showName: "Royal International Air Tattoo", year: 2025, note: "", rareAircraft: "" },
             { id: "p3", showName: "RAF Cosford Air Show", year: 2026, note: "Rainy but worth it", rareAircraft: "" }],
      notify: { lineup: true, mustSeeOnly: false, news: true, travel: true, social: true },
      seen: [{ id: "s1", key: "spitfire", name: "Spitfire Mk IX", showName: "IWM Duxford Summer Air Show", year: 2026 },
             { id: "s2", key: "typhoon", name: "Typhoon", showName: "RAF Cosford Air Show", year: 2026 },
             { id: "s3", key: "f35", name: "F-35A Lightning II", showName: "Royal International Air Tattoo", year: 2026 }],
      groups: [
        { slug: "general-airshow-chat", title: "General airshow chat", description: "Anything airshow, from line ups to the best ice cream on the crowd line.", category: "chat", sortOrder: 1 },
        { slug: "plane-spotting-and-line-ups", title: "Plane spotting and line ups", description: "Rare visitors, arrivals days and who is flying where.", category: "spotting", sortOrder: 2 },
        { slug: "photographers-corner", title: "Photographer's Corner", description: "Share your shots and camera settings.", category: "corner", sortOrder: 3 },
        { slug: "meet-ups-and-site-feedback", title: "Meet ups and buddies", description: "Find someone to go with, or meet up on the day.", category: "buddy", sortOrder: 4 },
        { slug: "kit-gear-and-buy-and-sell", title: "Kit, gear, buy and sell", description: "Lenses, scanners, chairs and swaps.", category: "kit", sortOrder: 5 }
      ],
      threads: [
        thread("d1", "general-airshow-chat", PEOPLE.priya, "Best spot for the Red Arrows at Duxford?", "First time at Duxford next month and I want the crowd line view for the Reds. Is the far end by the M11 still the place to be?", 40, { isQuestion: true, likeCount: 22 },
          [comment(PEOPLE.lewis, "Go for the middle of the crowd line near the control tower. The Reds centre their display there and you get the smoke on the break.", 35), comment(PEOPLE.mike, "Get there by 9 if you want the fence. It fills up fast on a sunny day.", 30)]),
        thread("d2", "meet-ups-and-site-feedback", PEOPLE.mike, "Meet up at RIAT 2027: who's camping?", "Starting a list for anyone in the campsite who fancies a group photo walk on the Friday arrivals day.", 300, { pinned: true, likeCount: 40 },
          [comment(PEOPLE.ellie, "Count me in! First time camping at Fairford.", 280)]),
        thread("d3", "kit-gear-and-buy-and-sell", PEOPLE.lewis, "Z8 vs D500 for fast jets", "Has anyone switched? Interested in how the tracking compares on Typhoon passes in grey skies.", 1440, { likeCount: 7 }, []),
        thread("d4", "plane-spotting-and-line-ups", PEOPLE.ellie, "Frecce confirmed for RIAT!", "Just seen it on the line up. Their first UK show in two years.", 2900, { likeCount: 31 }, [comment(PEOPLE.priya, "Brilliant, can't wait.", 2800)])
      ],
      liked: {},
      following: { threads: [], groups: [] },
      chats: { priya: [{ id: "c1", from: "priya", body: "Hi Sam, saw you're going to Duxford too. Want to meet by the tower?", at: ago(600) }] }
    };
  }
  function thread(id, group, who, title, body, minsAgo, extra, comments) {
    return Object.assign({
      id: id, groupSlug: group, title: title, body: body, preview: body.slice(0, 180), authorId: who.id, authorName: who.name, authorColour: who.colour, authorPhoto: "",
      created: ago(minsAgo), lastActivity: comments.length ? comments[comments.length - 1].created : ago(minsAgo), likeCount: 0, commentCount: comments.length,
      pinned: false, locked: false, isQuestion: false, answerId: "", comments: comments
    }, extra || {});
  }
  function comment(who, body, minsAgo) {
    return { id: uid("c"), authorId: who.id, authorName: who.name, authorColour: who.colour, authorPhoto: "", body: body, created: ago(minsAgo) };
  }
  function person(id) { return id === "me" ? ME : PEOPLE[id]; }
  function listThread(t) {
    var o = {}; for (var k in t) if (k !== "comments" && k !== "body") o[k] = t[k];
    o.commentCount = t.comments.length; return o;
  }

  /* ---------------- hub ---------------- */
  function getHub() {
    var s = load();
    if (!s.in) return { member: null, shows: SHOWS };
    var slugs = s.trips.map(function (t) { return t.showSlug; });
    var lineup = [];
    slugs.forEach(function (slug) {
      (LINEUP[slug] || []).forEach(function (n, i) {
        lineup.push({ id: slug + "-" + i, showSlug: slug, name: n, operator: "", airArm: /Red Arrows|Typhoon|Chinook|Hawk|Memorial|A400M|F-35/.test(n) ? "Royal Air Force" : "Display", squadron: "", status: i % 3 ? "Confirmed" : "Waiting", flying: true, staticDisplay: false, days: "", isNew: i === 1 });
      });
    });
    return {
      member: { id: ME.id, name: ME.name, colour: ME.colour, bio: "Airshow fan and weekend photographer.", area: ME.area, joined: "2026-03-01T10:00:00.000Z",
        badges: [{ icon: String(s.past.length), label: s.past.length === 1 ? "Show Attended" : "Shows Attended" }, { icon: "★", label: "RIAT Regular", gold: true }] },
      shows: SHOWS, trips: s.trips, mustSee: s.mustSee, lineup: lineup, updates: s.updates,
      unread: s.updates.filter(function (u) { return !u.read; }).length, reminders: [], weather: {}, notify: s.notify, past: s.past,
      posts: s.threads.filter(function (t) { return t.authorId === "me"; }).map(function (t) { return { id: t.id, title: t.title, body: t.body, groupSlug: t.groupSlug, likes: t.likeCount, comments: t.comments.length, created: t.created }; }),
      photos: [], following: [{ memberId: "priya", name: PEOPLE.priya.name, colour: PEOPLE.priya.colour, area: PEOPLE.priya.area, into: PEOPLE.priya.into }],
      groups: [], going: [], saved: [], photoOfWeek: null
    };
  }
  var HUB = {
    getHub: getHub,
    addTrip: function (p) {
      var s = load(), sh = show(p.showSlug);
      if (!sh) fail("Choose one of the shows in the list.");
      if (s.trips.some(function (t) { return t.showSlug === sh.slug; })) fail("That show is already in your hub.");
      var t = newTrip(sh.slug); s.trips.push(t); s.trips.sort(function (a, b) { return a.start.localeCompare(b.start); });
      s.updates.unshift({ id: uid("u"), kind: "lineup", heading: sh.shortName + " saved", body: "We'll tell you when the " + sh.shortName + " line up changes.", showSlug: sh.slug, link: "", read: false, created: new Date().toISOString() });
      save(); return t;
    },
    saveTrip: function (p) {
      var s = load(); s.trips.forEach(function (t) { if (t.id === p.id) Object.assign(t, p.changes || {}); }); save(); return {};
    },
    removeTrip: function (p) { var s = load(); s.trips = s.trips.filter(function (t) { return t.id !== p.id; }); save(); return { removed: true }; },
    toggleMustSee: function (p) {
      var s = load(), id = p.aircraftId, had = s.mustSee.some(function (m) { return m.aircraftId === id; });
      if (had) s.mustSee = s.mustSee.filter(function (m) { return m.aircraftId !== id; });
      else {
        var slug = String(id).split("-")[0], n = (LINEUP[slug] || [])[+String(id).split("-")[1]] || p.name || "Aircraft", sh = show(slug) || {};
        s.mustSee.push({ id: uid("m"), aircraftId: id, showSlug: slug, showName: sh.name || "", name: n, status: "Confirmed" });
      }
      save(); return { on: !had };
    },
    markUpdatesRead: function () { var s = load(); s.updates.forEach(function (u) { u.read = true; }); save(); return {}; },
    saveNotify: function (p) { var s = load(); s.notify = Object.assign(s.notify, p.notify || p); save(); return {}; },
    addPastShow: function (p) { var s = load(), x = { id: uid("p"), showName: p.showName || "Airshow", year: +p.year || new Date().getFullYear(), note: p.note || "", rareAircraft: p.rareAircraft || "" }; s.past.unshift(x); save(); return x; },
    removePastShow: function (p) { var s = load(); s.past = s.past.filter(function (x) { return x.id !== p.id; }); save(); return { removed: true }; },
    getHangar: function () {
      var s = load(), cat = {};
      Object.keys(LINEUP).forEach(function (slug) { LINEUP[slug].forEach(function (n) { var k = n.toLowerCase().replace(/[^a-z0-9]+/g, ""); cat[k] = cat[k] || { key: k, name: n, airArm: "", shows: 0, members: 3 }; cat[k].shows++; }); });
      return { catalog: Object.keys(cat).map(function (k) { return cat[k]; }), seen: s.seen, totalMembers: 128 };
    },
    addSeen: function (p) { var s = load(), x = { id: uid("s"), key: String(p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, ""), name: p.name, showName: p.showName || "", year: +p.year || new Date().getFullYear(), created: new Date().toISOString() }; if (!x.name) fail("Add the name of the aircraft."); s.seen.push(x); save(); return x; },
    removeSeen: function (p) { var s = load(); s.seen = s.seen.filter(function (x) { return x.id !== p.id; }); save(); return { removed: true }; },
    getFeed: function () {
      var s = load();
      return { pinned: [], cursor: "", items: s.threads.slice(0, 4).map(function (t) { return { kind: "thread", id: t.id, title: t.title, body: t.body, authorId: t.authorId, authorName: t.authorName, authorColour: t.authorColour, groupSlug: t.groupSlug, likes: t.likeCount, comments: t.comments.length, created: t.created }; }) };
    },
    findMembers: function () { return Object.keys(PEOPLE).map(function (k) { var p = PEOPLE[k]; return { memberId: p.id, name: p.name, colour: p.colour, area: p.area, into: p.into, following: k === "priya" }; }); },
    toggleFollow: function () { return { following: true }; },
    setGoing: function () { return {}; },
    go: function () { return {}; }
  };

  /* ---------------- forum ---------------- */
  function needIn() { if (!load().in) fail("Please log in first."); }
  function groupsOut() {
    var s = load();
    return s.groups.map(function (g) {
      var list = s.threads.filter(function (t) { return t.groupSlug === g.slug; });
      return Object.assign({}, g, { threadCount: list.length, lastActivity: list.length ? list.map(function (t) { return t.lastActivity; }).sort().pop() : "" });
    });
  }
  function findThread(id) { var t = load().threads.filter(function (x) { return x.id === id; })[0]; if (!t) fail("That thread has been removed."); return t; }
  function card(id) {
    var p = person(id) || ME, isMe = id === "me";
    return { memberId: p.id, name: p.name, colour: p.colour, photo: "", area: p.area || "", into: p.into || [], bio: isMe ? "Airshow fan and weekend photographer." : "Airshow fan.",
      badges: isMe ? ["RIAT Regular"] : [], threadCount: load().threads.filter(function (t) { return t.authorId === id; }).length, commentCount: 3, photoCount: 2, followerCount: 12, stamps: 5,
      isMe: isMe, following: id === "priya", followsYou: id === "priya", canMessage: !isMe, hasChat: !!load().chats[id], blockedByMe: false, going: ["Duxford"] };
  }
  var FORUM = {
    getSession: function () { var s = load(); return { member: s.in ? { id: ME.id, name: ME.name, colour: ME.colour, photo: "", isAdmin: false } : null }; },
    listGroups: groupsOut,
    listThreads: function (p) {
      var s = load(), list = s.threads.filter(function (t) { return !p.groupSlug || t.groupSlug === p.groupSlug; });
      return list.slice().sort(function (a, b) { return (b.pinned - a.pinned) || b.lastActivity.localeCompare(a.lastActivity); }).map(listThread);
    },
    getThread: function (p) {
      var t = findThread(p.threadId), o = listThread(t); o.body = t.body;
      return { thread: o, comments: t.comments, liked: !!load().liked[t.id] };
    },
    createThread: function (p) {
      needIn();
      var title = String(p.title || "").trim(), body = String(p.body || "").trim();
      if (title.length < 4) fail("Give your post a title."); if (!body) fail("Write something first.");
      var s = load(), t = thread(uid("t"), p.groupSlug || "general-airshow-chat", ME, title, body, 0, { isQuestion: !!p.isQuestion }, []);
      s.threads.unshift(t); save(); return { id: t.id };
    },
    addComment: function (p) {
      needIn();
      var body = String(p.body || "").trim(); if (!body) fail("Write a reply first.");
      var t = findThread(p.threadId), c = comment(ME, body, 0); t.comments.push(c); t.lastActivity = c.created; save(); return c;
    },
    toggleLike: function (p) { needIn(); var s = load(), t = findThread(p.threadId || p.id), on = !s.liked[t.id]; s.liked[t.id] = on; t.likeCount += on ? 1 : -1; save(); return { liked: on, likeCount: t.likeCount }; },
    markAnswer: function (p) { var t = findThread(p.threadId); t.answerId = p.commentId || ""; save(); return {}; },
    deleteOwnPost: function (p) {
      var s = load();
      if (p.kind === "comment" || p.commentId) s.threads.forEach(function (t) { t.comments = t.comments.filter(function (c) { return !(c.id === (p.commentId || p.id) && c.authorId === "me"); }); });
      else s.threads = s.threads.filter(function (t) { return !(t.id === (p.threadId || p.id) && t.authorId === "me"); });
      save(); return { removed: true };
    },
    report: function () { return { reported: true }; },
    where: function () { return {}; },
    listFollowing: function () { return load().following; },
    followTarget: function (p) {
      var s = load(), list = p.type === "group" ? s.following.groups : s.following.threads, i = list.indexOf(p.id);
      if (i < 0) list.push(p.id); else list.splice(i, 1); save(); return { following: i < 0 };
    },
    toggleFollow: function () { return { following: true }; },
    listMembers: function () {
      var all = Object.keys(PEOPLE).map(function (k) { return card(k); });
      return { members: all, total: all.length, listed: true, myShows: 1 };
    },
    getMemberCard: function (p) { return card(p.memberId); },
    getProfile: function (p) { return card(p.memberId || "me"); },
    listChats: function () {
      var s = load();
      return { chats: Object.keys(s.chats).map(function (id) { var m = s.chats[id], last = m[m.length - 1], p = person(id); return { memberId: id, name: p.name, colour: p.colour, photo: "", last: last.body, at: last.at, mine: last.from === "me", unread: last.from !== "me" }; }) };
    },
    getChat: function (p) {
      var s = load(), other = person(p.memberId) || PEOPLE.priya, list = s.chats[p.memberId] || [];
      if (p.after) list = list.filter(function (m) { return m.at > p.after; });
      if (p.before) list = [];
      return { other: { memberId: other.id, name: other.name, colour: other.colour, photo: "" }, messages: list.map(function (m) { return { id: m.id, mine: m.from === "me", body: m.body, at: m.at }; }), canMessage: true, more: false };
    },
    sendMessage: function (p) {
      var s = load(), m = { id: uid("c"), from: "me", body: String(p.body || ""), at: new Date().toISOString() };
      (s.chats[p.memberId] = s.chats[p.memberId] || []).push(m); save(); return { id: m.id, at: m.at };
    },
    hideChat: function () { return {}; }, reportChat: function () { return {}; }, blockMember: function () { return {}; },
    setListing: function () { return {}; }, requestGroup: function () { return { sent: true }; },
    saveMyProfile: function () { return {}; },
    listGallery: function () { return { photos: [], more: false }; }
  };

  /* ---------------- show day ---------------- */
  var SHOWDAY = {
    load: function () {
      var st = load(), date = (st.trips[0] || {}).start || new Date().toISOString();
      var acts = [["11:00", "Red Arrows", 1], ["11:30", "Spitfire pair"], ["12:00", "Typhoon Display", 1], ["12:30", "B-17 Sally B"], ["13:10", "P-51D Mustang"], ["13:40", "Hurricane Mk I"], ["14:15", "Chinook", 1], ["15:00", "Battle of Britain Memorial Flight"]]
        .map(function (r) { return { start: r[0], name: r[1], loud: !!r[2] }; });
      return {
        programmes: [{ showId: "duxford", day: "Saturday", date: date.slice(0, 10), acts: acts }],
        member: st.in ? { loggedIn: true, name: ME.name.split(" ")[0], saved: st.trips.map(function (t) { return t.showSlug; }) } : { loggedIn: false, saved: [] }
      };
    },
    reports: function () { return []; },
    report: function (p) { return { id: uid("r"), created: new Date().toISOString(), text: p.text || "" }; },
    confirm: function () { return {}; },
    upload: function () { return { pending: true }; }
  };

  /* ---------------- log in window (stands in for the Wix members window) ---------------- */
  function loginWindow(mode) {
    var old = document.getElementById("demoLogin"); if (old) old.remove();
    var w = document.createElement("div");
    w.id = "demoLogin";
    w.setAttribute("style", "position:fixed;inset:0;z-index:300;display:grid;place-items:center;background:rgba(5,12,17,.6);padding:18px");
    w.innerHTML = '<div style="background:#fff;max-width:380px;width:100%;border-top:4px solid #32B4AF;padding:22px;box-shadow:0 20px 50px rgba(0,0,0,.35);font-family:Barlow,Arial,sans-serif">' +
      '<span style="font:700 12px Barlow;letter-spacing:.12em;text-transform:uppercase;color:#6950A1">Preview of the members window</span>' +
      '<h3 style="font:800 28px/1 \'Barlow Condensed\',Arial;text-transform:uppercase;color:#13293C;margin:8px 0 6px">' + (mode === "signup" ? "Join free" : "Log in") + "</h3>" +
      '<p style="color:#5A6B78;margin:0 0 16px">On the live site this is the Wix window where members ' + (mode === "signup" ? "sign up" : "log in") + " with email, Google or Facebook.</p>" +
      '<button type="button" data-ok style="width:100%;min-height:46px;background:#32B4AF;color:#fff;border:0;font:700 16px Barlow;cursor:pointer">' + (mode === "signup" ? "Create my free account" : "Log in as Sam") + "</button>" +
      '<button type="button" data-no style="width:100%;min-height:42px;margin-top:8px;background:#fff;color:#13293C;border:2px solid #DCE3E8;font:700 15px Barlow;cursor:pointer">Close</button></div>';
    document.body.appendChild(w);
    w.querySelector("[data-ok]").onclick = function () {
      w.remove();
      var s = load(); s.in = true; save();
      sessionNews();
    };
    w.querySelector("[data-no]").onclick = function () { w.remove(); window.ukagAppEvent({ source: "ukag-hub", event: "loginCancelled" }); };
  }
  function sessionNews() {
    window.ukagAppEvent({ source: "ukag-forum", event: "session", data: FORUM.getSession() });
    window.ukagAppEvent({ source: "ukag-hub", event: "refresh" });
  }

  /* ---------------- the entry point app.js uses ---------------- */
  var TABLES = { "ukag-hub": HUB, "ukag-forum": FORUM, "ukag-showday": SHOWDAY };
  window.UKAG_BACKEND = function (m) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (m.action === "login" || m.action === "signup") { loginWindow(m.action); resolve({ ok: true, data: { prompted: true } }); return; }
        if (m.action === "logout") { var s = load(); s.in = false; save(); resolve({ ok: true, data: { loggedOut: true } }); setTimeout(sessionNews, 50); return; }
        if (m.source === "ukag-hub" && m.action === "ready") { resolve({ ok: true, data: { join: "", pageUrl: "", loggedOut: !load().in } }); return; }
        var fn = (TABLES[m.source] || {})[m.action];
        if (!fn) { resolve({ ok: false, error: "This part needs the live site. The preview covers the hub, trips, the forum, messages and Show Day." }); return; }
        try { resolve({ ok: true, data: fn(m.payload || {}) }); }
        catch (e) { resolve({ ok: false, error: e.message || "Something went wrong." }); }
      }, m.action === "getHub" ? 450 : 180);
    });
  };
  window.UKAG_PREVIEW_RESET = function () { mem = seed(); save(); sessionNews(); };
})();
