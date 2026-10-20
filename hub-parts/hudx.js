  /* ================= HUD extras: Overview, Flight Briefing, My Hangar, My Airshow Year, photo sharing ================= */
  var X = { hangar: null, hangarLoading: false, hgFilter: "all", hgSel: null, bfTrip: null, wx: {}, prog: {}, year: null, photo: null, cards: [] };
  var RUNWAYS = { riat: 90, cosford: 60, duxford: 60, shuttleworth: 30, "little-gransden": 100, headcorn: 100 };
  var GEOX = {
    riat: [51.682, -1.790, 0], cosford: [52.640, -2.306, null], duxford: [52.090, 0.132, 180], eastbourne: [50.766, 0.290, 165],
    clacton: [51.788, 1.155, 135], wales: [51.605, -3.960, 180], midlands: [52.198, -1.888, null], shuttleworth: [52.087, -0.318, null],
    "little-gransden": [52.165, -0.153, null], southport: [53.653, -3.010, 285], blackpool: [53.816, -3.056, 270], ayr: [55.462, -4.636, 270],
    headcorn: [51.157, 0.646, null]
  };
  var POINT_NAMES = { riat: "Fairford", cosford: "Cosford", duxford: "Duxford", eastbourne: "Eastbourne", clacton: "Clacton", wales: "Swansea", midlands: "Ragley", shuttleworth: "Old Warden", "little-gransden": "Little Gransden", southport: "Southport", blackpool: "Blackpool", ayr: "Ayr", headcorn: "Headcorn" };
  var COMPASS = ["north", "north east", "east", "south east", "south", "south west", "west", "north west"];
  var SHORT = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  var PHOTO_CATS = ["Fast jets", "Display teams", "Warbirds and classics", "Helicopters", "Transport and tankers", "Static and ground", "Night shoots", "Arrivals and spotting"];
  function svg(tag, attrs) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function slugFor(name) {
    var n = (name || "").toLowerCase();
    var s = (S.hub.shows || []).find(function (x) { return x.name.toLowerCase() === n || (x.shortName || "").toLowerCase() === n; });
    if (s) return s.slug;
    var words = [["tattoo", "riat"], ["riat", "riat"], ["fairford", "riat"], ["cosford", "cosford"], ["duxford", "duxford"], ["eastbourne", "eastbourne"], ["airbourne", "eastbourne"], ["clacton", "clacton"], ["wales", "wales"], ["swansea", "wales"], ["midlands", "midlands"], ["ragley", "midlands"], ["shuttleworth", "shuttleworth"], ["old warden", "shuttleworth"], ["gransden", "little-gransden"], ["southport", "southport"], ["blackpool", "blackpool"], ["ayr", "ayr"], ["headcorn", "headcorn"]];
    for (var i = 0; i < words.length; i++) if (n.indexOf(words[i][0]) >= 0) return words[i][1];
    return "";
  }
  function daysTo(iso) { return iso ? Math.ceil((new Date(iso) - new Date()) / 864e5) : null; }
  function firstName() { return ((S.hub.member && S.hub.member.name) || "").split(" ")[0] || "there"; }
  function partOfDay() { var h = +new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }).format(new Date()); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }
  function isoDay(iso) { return iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "Europe/London" }) : ""; }
  function sunAt(ds, hour, lat, lon) {
    var p = ds.split("-").map(Number), rad = Math.PI / 180;
    var offset = 0; try { offset = (+new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }).format(new Date(ds + "T12:00:00Z")) - 12) * 60; } catch (e) {}
    var ms = Date.UTC(p[0], p[1] - 1, p[2]) + hour * 36e5 - offset * 6e4;
    var d = (ms - Date.UTC(2000, 0, 1, 12)) / 864e5;
    var g = (357.529 + 0.98560028 * d) * rad, q = 280.459 + 0.98564736 * d;
    var L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad, ec = (23.439 - 0.00000036 * d) * rad;
    var ra = Math.atan2(Math.cos(ec) * Math.sin(L), Math.cos(L)), dec = Math.asin(Math.sin(ec) * Math.sin(L));
    var gmst = ((18.697374558 + 24.06570982441908 * d) % 24) * 15 * rad;
    var ha = gmst + lon * rad - ra, la = lat * rad;
    var alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha));
    var az = Math.atan2(-Math.sin(ha), Math.tan(dec) * Math.cos(la) - Math.sin(la) * Math.cos(ha));
    return { az: ((az / rad) + 360) % 360, alt: alt / rad };
  }
  function angDiff(a, b) { return Math.abs(((a - b + 540) % 360) - 180); }
  function dirWord(deg) { return COMPASS[Math.round(deg / 45) % 8]; }

  /* Show Day running orders, asked for through the page code (same messages the Show Day board uses) */
  var sdSeq = 0, sdWait = {};
  function showDayCall(action, payload) {
    return new Promise(function (resolve) {
      var id = "hx" + (++sdSeq);
      sdWait[id] = resolve;
      window.parent.postMessage({ source: "ukag-showday", id: id, action: action, payload: payload || {} }, "*");
      setTimeout(function () { if (sdWait[id]) { delete sdWait[id]; resolve(null); } }, 15000);
    });
  }
  window.addEventListener("message", function (e) {
    var m = e.data; if (!m || m.source !== "ukag-showday" || !m.id || !sdWait[m.id]) return;
    var r = sdWait[m.id]; delete sdWait[m.id]; r(m.ok ? m.data : null);
  });

  function renderHudx() {
    if (!S.hub || !S.hub.member) return;
    renderOverview();
    if (S.page === "briefing") renderBriefing();
    if (S.page === "hangar" || S.page === "year" || S.page === "overview") loadHangar();
    if (S.page === "year") renderYear();
    renderPhotoShare();
  }

  /* ---------- Overview ---------- */
  function renderOverview() {
    var h = S.hub, trips = h.trips || [];
    $("ovGreet").textContent = partOfDay() + ", " + firstName();
    var open = 0; trips.forEach(function (t) { open += (t.todo || []).filter(function (x) { return !x.done; }).length; });
    var lineup = (h.updates || []).filter(function (u) { return u.kind === "lineup" && !u.read; }).length;
    var bits = [];
    bits.push(trips.length ? "You have " + (trips.length === 1 ? "one show" : trips.length + " shows") + " on your radar." : "Your radar is clear. Add a show in My Trips and it appears here.");
    if (open) bits.push((open === 1 ? "One thing" : open + " things") + " on your trip lists still need sorting.");
    if (lineup) bits.push("The line up changed " + (lineup === 1 ? "once" : lineup + " times") + " while you were away.");
    $("ovSum").textContent = bits.join(" ");
    var seenCount = X.hangar ? uniqueSeen().length : "…";
    var next = trips[0];
    var st = clear($("ovStats"));
    [[pad(trips.length), "Shows saved"], [seenCount, "Aircraft in my hangar"], [pad((h.mustSee || []).length), "Must see aircraft"], [next ? "18:00" : "…", next ? "Briefing arrives the night before" : "Briefing waits for a show"]].forEach(function (x) {
      var d = el("div"); d.appendChild(el("b", "", String(x[0]))); d.appendChild(el("span", "", x[1])); st.appendChild(d);
    });
    $("ovShow").textContent = next ? next.showName : "No show saved yet";
    $("ovNextTag").textContent = next ? dayStr(next.start) : "Saved show";
    var rows = clear($("ovRows"));
    function row(k, v, hot) { var r = el("div", "row" + (hot ? " hot" : "")); r.appendChild(el("span", "", k)); r.appendChild(el("b", "", v)); rows.appendChild(r); }
    if (next) {
      row("Gates open", next.gatesOpen || "To be confirmed");
      row("Travel", next.travel || "Not planned yet", !next.travel);
      var todo = (next.todo || []).find(function (x) { return !x.done; });
      if (todo) row("Still to do", todo.t, true);
      $("ovProg").style.width = readiness(next) + "%";
    }
    renderRadar(trips);
    var up = clear($("ovUpdates"));
    var list = (h.updates || []).slice(0, 3);
    if (!list.length) up.appendChild(el("div", "empty", "Nothing new yet. I check the official sites every day."));
    list.forEach(function (u) { up.appendChild(upRow(u)); });
    var mb = el("button", "link", "All updates"); mb.onclick = function () { showPage("updates"); }; up.appendChild(mb);
    var mu = clear($("ovMust")); var must = h.mustSee || [];
    $("ovMustTag").textContent = must.length ? must.filter(function (m) { return /confirm/i.test(m.status); }).length + " confirmed" : "";
    if (!must.length) mu.appendChild(el("div", "empty", "Tap Add To Must See on any aircraft in My Trips."));
    must.slice(0, 6).forEach(function (m) {
      var r = el("div", "ov-must"); r.appendChild(el("b", "", m.name)); r.appendChild(el("span", "", m.showName || ""));
      r.appendChild(el("em", "st" + statusClass(m.status), m.status || "Waiting")); mu.appendChild(r);
    });
    ovTick();
  }
  function renderRadar(trips) {
    var g = $("radarBlips"); while (g.firstChild) g.removeChild(g.firstChild);
    var ul = clear($("ovBlips"));
    if (!trips.length) { ul.appendChild(el("li", "", "No shows inbound yet.")); return; }
    trips.slice(0, 8).forEach(function (t, i) {
      var d = daysTo(t.start);
      var r = d === null ? 140 : d <= 30 ? 35 * d / 30 : d <= 90 ? 35 + 35 * (d - 30) / 60 : d <= 180 ? 70 + 35 * (d - 90) / 90 : Math.min(140, 105 + 35 * (d - 180) / 185);
      r = Math.max(10, r);
      var a = (i * 137.5 + 20) * Math.PI / 180;
      var x = 150 + r * Math.cos(a), y = 150 + r * Math.sin(a);
      var col = i === 0 ? "#D74949" : i % 2 ? "#5FE3DC" : "#9C86D8";
      g.appendChild(svg("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: 9, fill: col, opacity: ".18", class: "blip-ring" }));
      g.appendChild(svg("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: 4, fill: col }));
      var tx = svg("text", { x: (x + 8).toFixed(1), y: (y - 6).toFixed(1), fill: "#E8F1F6", "font-size": "10", "font-family": "Barlow, sans-serif", "font-weight": "600" });
      tx.textContent = (t.showName || "").split(/[ ,]/)[0]; g.appendChild(tx);
      var li = el("li"); var sw = el("i"); sw.style.background = col; li.appendChild(sw);
      li.appendChild(el("b", "", t.showName)); li.appendChild(el("span", "", d === null ? "Date to be confirmed" : d <= 0 ? "Today" : d + (d === 1 ? " day" : " days")));
      li.onclick = function () { S.tripId = t.id; renderAll(); showPage("trips"); };
      ul.appendChild(li);
    });
  }
  function ovTick() {
    var t = S.hub && S.hub.trips && S.hub.trips[0]; if (!t || !$("ovDays")) return;
    var ms = t.start ? Math.max(0, new Date(t.start) - new Date()) : 0;
    $("ovDays").textContent = Math.floor(ms / 864e5);
    $("ovClock").textContent = pad(Math.floor(ms % 864e5 / 36e5)) + ":" + pad(Math.floor(ms % 36e5 / 6e4)) + ":" + pad(Math.floor(ms % 6e4 / 1e3));
  }
  setInterval(function () { if (S.hub && S.hub.member && S.page === "overview") ovTick(); }, 1000);

  /* ---------- Flight Briefing ---------- */
  function bfTrip() { var trips = S.hub.trips || []; return trips.find(function (t) { return t.id === X.bfTrip; }) || trips[0]; }
  function renderBriefing() {
    var trips = S.hub.trips || [];
    $("bfNone").hidden = !!trips.length; $("bfBody").hidden = !trips.length;
    var pick = clear($("bfTrips"));
    if (!trips.length) return;
    var t = bfTrip(); X.bfTrip = t.id;
    trips.forEach(function (x) { var b = el("button", x.id === t.id ? "on" : "", x.showName); b.onclick = function () { X.bfTrip = x.id; renderBriefing(); }; pick.appendChild(b); });
    var slug = t.showSlug || slugFor(t.showName), geo = GEOX[slug], d = daysTo(t.start), ds = isoDay(t.start);
    $("bfShow").textContent = t.showName + (t.start ? ", " + dayStr(t.start) : "");
    $("bfIssued").textContent = d === null ? "The briefing fills in once the date is confirmed." : d > 1 ? "Full briefing issued at 18:00 the night before. " + (d <= 16 ? "This is an early look at the forecast." : "The forecast opens 16 days before.") : d >= 0 ? "Issued for tomorrow. Have a great day." : "This show has finished.";
    renderBfWind(t, slug, geo, ds, d);
    renderBfSpot(slug, geo, ds);
    renderBfSlots(t, slug);
    var td = clear($("bfTodo")); var left = (t.todo || []).filter(function (x) { return !x.done; });
    $("bfTodoTag").textContent = left.length ? left.length + " left" : "All done";
    if (!left.length) td.appendChild(el("div", "empty", "Everything on your list is ticked off. I would advise packing the night before and leaving the bag by the door."));
    left.slice(0, 6).forEach(function (x) { var r = el("div", "ov-must"); r.appendChild(el("b", "", x.t)); td.appendChild(r); });
    renderBfCam(t);
  }
  function renderBfWind(t, slug, geo, ds, d) {
    var rw = RUNWAYS[slug];
    var g = $("bfRunway"); while (g.firstChild) g.removeChild(g.firstChild);
    var line = rw != null ? rw : (geo && geo[2] != null ? (geo[2] + 90) % 360 : null);
    if (line != null) {
      var a = line * Math.PI / 180, dx = Math.sin(a) * 70, dy = -Math.cos(a) * 70;
      g.appendChild(svg("line", { x1: (110 - dx).toFixed(1), y1: (110 - dy).toFixed(1), x2: (110 + dx).toFixed(1), y2: (110 + dy).toFixed(1), stroke: rw != null ? "#E8F1F6" : "#32B4AF", "stroke-width": rw != null ? 10 : 3, "stroke-dasharray": rw != null ? "" : "8 6", opacity: rw != null ? ".85" : "1" }));
      if (rw != null) {
        [[line, -1], [(line + 180) % 360, 1]].forEach(function (e) {
          var p = e[1] * 54, tx = svg("text", { x: (110 + Math.sin(a) * p).toFixed(1), y: (114 - Math.cos(a) * p).toFixed(1), "text-anchor": "middle", "font-size": "10", "font-family": "JetBrains Mono, monospace", fill: "#061019", "font-weight": "700" });
          tx.textContent = pad(Math.round(e[0] / 10) || 36); g.appendChild(tx);
        });
      }
    }
    var rows = clear($("bfWindRows")), tip = $("bfWindTip"), ar = $("bfArrow"); while (ar.firstChild) ar.removeChild(ar.firstChild);
    function row(k, v) { var r = el("div", "row"); r.appendChild(el("span", "", k)); r.appendChild(el("b", "", v)); rows.appendChild(r); }
    var hours = clear($("bfHours"));
    $("bfLight").textContent = "";
    if (!geo || d === null || d > 16 || d < -1) {
      $("bfWindTag").textContent = "Opens 16 days before";
      row(rw != null ? "Runway" : "Display line", rw != null ? pad(Math.round(rw / 10)) + "/" + pad(Math.round(((rw + 180) % 360) / 10)) : line != null ? "Runs " + dirWord(line) + " to " + dirWord((line + 180) % 360) : "Being added");
      tip.textContent = "The wind decides which way the display aircraft take off. I'll show the likely runway and the hour by hour forecast here once the forecast covers the show day.";
      hours.appendChild(el("div", "empty", "The hour by hour forecast opens here 16 days before the show."));
      return;
    }
    var key = slug + ds;
    if (!X.wx[key]) {
      X.wx[key] = "loading";
      $("bfWindTag").textContent = "Loading";
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + geo[0] + "&longitude=" + geo[1] + "&hourly=temperature_2m,precipitation_probability,cloud_cover_low,wind_speed_10m,wind_direction_10m,weather_code&wind_speed_unit=mph&timezone=Europe%2FLondon&start_date=" + ds + "&end_date=" + ds;
      fetch(url).then(function (r) { return r.json(); }).then(function (j) { X.wx[key] = j.hourly || "none"; if (S.page === "briefing") renderBriefing(); })
        .catch(function () { X.wx[key] = "none"; if (S.page === "briefing") renderBriefing(); });
      return;
    }
    var w = X.wx[key];
    if (w === "loading") return;
    if (w === "none" || !w.time) { $("bfWindTag").textContent = "Forecast not reachable"; hours.appendChild(el("div", "empty", "The forecast couldn't load just now. Try again in a little while.")); return; }
    var mid = w.time.findIndex(function (x) { return /T14:/.test(x); }); if (mid < 0) mid = 12;
    var wdir = w.wind_direction_10m[mid], wspd = Math.round(w.wind_speed_10m[mid]);
    $("bfWindTag").textContent = wspd + " mph from the " + dirWord(wdir);
    var wa = wdir * Math.PI / 180, ax = Math.sin(wa), ay = -Math.cos(wa);
    ar.appendChild(svg("line", { x1: (110 + ax * 100).toFixed(1), y1: (110 + ay * 100).toFixed(1), x2: (110 + ax * 30).toFixed(1), y2: (110 + ay * 30).toFixed(1), stroke: "#D74949", "stroke-width": 4, "stroke-linecap": "round" }));
    var tipX = 110 + ax * 30, tipY = 110 + ay * 30, px = -ay * 7, py = ax * 7;
    ar.appendChild(svg("path", { d: "M" + (tipX - ax * 2).toFixed(1) + " " + (tipY - ay * 2).toFixed(1) + " L" + (tipX + ax * 12 + px).toFixed(1) + " " + (tipY + ay * 12 + py).toFixed(1) + " L" + (tipX + ax * 12 - px).toFixed(1) + " " + (tipY + ay * 12 - py).toFixed(1) + " Z", fill: "#D74949" }));
    row("Wind", wspd + " mph from the " + dirWord(wdir));
    if (rw != null) {
      var into = angDiff(wdir, rw) <= angDiff(wdir, (rw + 180) % 360) ? rw : (rw + 180) % 360;
      row("Likely runway", pad(Math.round(into / 10) || 36));
      row("Take off towards", "The " + dirWord(into));
      tip.textContent = wspd < 5 ? "Very light winds, so either runway could be used. Keep an ear on the commentary." : "Aircraft take off into the wind, so I would expect departures towards the " + dirWord(into) + ". If you want take off shots, I would suggest heading to the " + dirWord((into + 180) % 360) + " end of the crowd line early.";
    } else {
      row("Display line", line != null ? "Runs " + dirWord(line) + " to " + dirWord((line + 180) % 360) : "Being added");
      tip.textContent = wspd >= 20 ? "A breezy day on the front. I would advise a windproof layer and holding on to hats near the crowd line." : "Light winds should keep the smoke trails tidy for the display teams.";
    }
    row("Low cloud", Math.round(w.cloud_cover_low[mid]) + "%");
    for (var i = 9; i <= 18; i++) {
      var idx = w.time.findIndex(function (x) { return x.slice(11, 13) === pad(i); }); if (idx < 0) continue;
      var c = el("div", "bf-hour"); c.appendChild(el("b", "", pad(i) + ":00"));
      c.appendChild(el("strong", "", Math.round(w.temperature_2m[idx]) + "°"));
      c.appendChild(el("span", "", skyWord(w.weather_code[idx], w.cloud_cover_low[idx])));
      c.appendChild(el("em", w.precipitation_probability[idx] >= 40 ? "wet" : "", w.precipitation_probability[idx] + "% rain"));
      hours.appendChild(c);
    }
    var wet = w.precipitation_probability.slice(9, 19).filter(function (x) { return x >= 50; }).length;
    $("bfLight").textContent = wet ? "Showers look likely for about " + wet + (wet === 1 ? " hour" : " hours") + " of the flying. I would pack a light waterproof and a cover for the camera." : "Mostly dry through the flying. Sun cream and a hat are worth packing, as there is little shade on a crowd line.";
  }
  function skyWord(code, low) { if (code >= 95) return "Thunder"; if (code >= 80) return "Showers"; if (code >= 61) return "Rain"; if (code >= 51) return "Drizzle"; if (code >= 45) return "Fog"; if (low > 70 || code === 3) return "Cloudy"; if (low > 30 || code === 2) return "Some cloud"; return "Sunny"; }
  function renderBfSpot(slug, geo, ds) {
    var s = $("bfSpot"); while (s.firstChild) s.removeChild(s.firstChild);
    var tip = $("bfSpotTip");
    s.appendChild(svg("rect", { x: 0, y: 0, width: 320, height: 190, fill: "rgba(6,16,25,.4)" }));
    s.appendChild(svg("line", { x1: 20, y1: 60, x2: 300, y2: 60, stroke: "#32B4AF", "stroke-width": 3, "stroke-dasharray": "10 7" }));
    s.appendChild(svg("line", { x1: 20, y1: 132, x2: 300, y2: 132, stroke: "#E8F1F6", "stroke-width": 2 }));
    function lab(x, y, t, c) { var e = svg("text", { x: x, y: y, fill: c || "#A9BDCB", "font-size": 11, "font-family": "Barlow, sans-serif", "font-weight": 600 }); e.textContent = t; s.appendChild(e); }
    lab(22, 52, "Display line", "#5FE3DC"); lab(22, 150, "Crowd line", "#E8F1F6");
    if (!geo || geo[2] == null || !ds) {
      lab(22, 176, "The crowd line for this show is still being mapped");
      tip.textContent = "Arrive early if you want a front row spot. Save your pitch first, then go and look round the static aircraft and the stalls.";
      return;
    }
    var face = geo[2];
    var picks = [11, 14, 17].map(function (h) { return { h: h, sun: sunAt(ds, h, geo[0], geo[1]) }; });
    picks.forEach(function (p, i) {
      var rel = ((p.sun.az - face + 540) % 360) - 180;
      var x = 160 + Math.max(-130, Math.min(130, rel * 1.1));
      var y = Math.abs(rel) > 90 ? 170 : 24;
      s.appendChild(svg("circle", { cx: x.toFixed(1), cy: y, r: 9, fill: "#F2B84B", opacity: (0.45 + i * 0.25).toFixed(2) }));
      lab((x - 14).toFixed(1), y === 24 ? 44 : 186, pad(p.h) + ":00", "#F2B84B");
    });
    s.appendChild(svg("circle", { cx: 160, cy: 118, r: 7, fill: "#D74949" }));
    lab(170, 122, "You", "#FFFFFF");
    var afternoon = picks[1].sun, rel = angDiff(afternoon.az, face);
    tip.textContent = rel < 60 ? "In the afternoon the sun sits over the display line, so you will be looking into it. I would bring sunglasses, and for photos I would suggest the morning or standing further along the line." :
      rel > 120 ? "The sun is behind you for most of the afternoon, which is ideal for watching and for photos. I would suggest heading to the middle of the crowd line." :
      "The sun moves across your side through the afternoon. I would suggest standing towards the " + (((afternoon.az - face + 360) % 360) < 180 ? "left" : "right") + " end of the crowd line to keep it more behind you.";
  }
  function renderBfSlots(t, slug) {
    var box = clear($("bfSlots"));
    var must = (S.hub.mustSee || []).filter(function (m) { return m.showSlug === slug || m.showName === t.showName; });
    $("bfSlotTag").textContent = must.length ? must.length + " on your list" : "";
    if (!must.length) { box.appendChild(el("div", "empty", "Add aircraft to your must see list in My Trips and their slots show here.")); return; }
    var key = slug + "prog";
    if (X.prog[key] === undefined && slug) {
      X.prog[key] = null;
      showDayCall("load", { show: slug }).then(function (r) { X.prog[key] = (r && r.programmes) || []; if (S.page === "briefing") renderBriefing(); });
    }
    var acts = [];
    (X.prog[key] || []).forEach(function (p) { ((p.running && p.running.acts) || []).forEach(function (a) { acts.push({ day: p.dayLabel, start: a.start, name: a.name, loud: a.loud }); }); });
    must.forEach(function (m) {
      var words = m.name.toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; });
      var hit = acts.find(function (a) { var n = a.name.toLowerCase(); return words.some(function (w) { return n.indexOf(w) >= 0; }); });
      var r = el("div", "bf-slot");
      r.appendChild(el("code", "", hit ? hit.start : "--:--"));
      var d = el("div"); d.appendChild(el("b", "", m.name)); d.appendChild(el("span", "", hit ? hit.day + (hit.loud ? ". Loud, ear defenders on." : "") : "Time comes from the official programme once it is in.")); r.appendChild(d);
      r.appendChild(el("em", "st" + statusClass(m.status), m.status || "Waiting"));
      box.appendChild(r);
    });
  }
  function renderBfCam(t) {
    var box = clear($("bfCam"));
    var wx = X.wx[(t.showSlug || slugFor(t.showName)) + isoDay(t.start)];
    var dull = wx && wx.cloud_cover_low ? wx.cloud_cover_low.slice(11, 17).reduce(function (a, b) { return a + b; }, 0) / 6 > 60 : false;
    [["Fast jets", "1/1600", "f/8", dull ? "ISO 400" : "ISO 200", "Freeze the action and keep the jet sharp."], ["Propeller aircraft", dull ? "1/160" : "1/200", "f/11", dull ? "ISO 100" : "ISO 64", "Slow enough to show a full blur in the prop."], ["Helicopters", "1/125", "f/11", "ISO 100", "Keeps a little blur in the rotor blades."], ["Display teams", "1/1000", "f/8", dull ? "ISO 400" : "ISO 200", "Leave space in the frame for the smoke."]].forEach(function (c) {
      var r = el("div", "bf-cam"); var d = el("div"); d.appendChild(el("b", "", c[0])); d.appendChild(el("span", "", c[4])); r.appendChild(d);
      var v = el("code", "", c[1] + "  " + c[2] + "  " + c[3]); r.appendChild(v); box.appendChild(r);
    });
    box.appendChild(el("p", "bf-tip", dull ? "Low cloud is forecast, so I have nudged the ISO up. Check your exposure on the first few shots." : "Bright skies fool the meter, so I would suggest adding a little exposure compensation, about plus two thirds."));
  }

  /* ---------- My Hangar ---------- */
  function loadHangar(force) {
    if ((X.hangar && !force) || X.hangarLoading) { if (X.hangar) { renderHangar(); } return; }
    X.hangarLoading = true;
    call("getHangar").then(function (h) { X.hangar = h; X.hangarLoading = false; renderHangar(); renderOverview(); if (S.page === "year") renderYear(); })
      .catch(function (e) { X.hangarLoading = false; var c = clear($("hgCards")); c.appendChild(el("div", "empty", (e && e.message) || "Your hangar couldn't load.")); });
  }
  function rarity(c) { return c.shows >= 3 ? "Common" : c.shows === 2 ? "Rare" : "One off"; }
  function uniqueSeen() { var s = {}; (X.hangar ? X.hangar.seen : []).forEach(function (x) { s[x.key] = 1; }); return Object.keys(s); }
  function renderHangar() {
    if (!X.hangar) return;
    var h = X.hangar, mine = {}, shows = {};
    h.seen.forEach(function (x) { (mine[x.key] = mine[x.key] || []).push(x); if (x.showName) shows[x.showName + x.year] = 1; });
    var cat = h.catalog.slice().sort(function (a, b) { return (mine[b.key] ? 1 : 0) - (mine[a.key] ? 1 : 0) || a.shows - b.shows || a.name.localeCompare(b.name); });
    var got = cat.filter(function (c) { return mine[c.key]; });
    var st = clear($("hgStats"));
    [[got.length + " / " + cat.length, "Aircraft collected"], [got.filter(function (c) { return rarity(c) === "Rare"; }).length, "Rare catches"], [got.filter(function (c) { return rarity(c) === "One off"; }).length, "One offs"], [Math.max(Object.keys(shows).length, S.hub.past.length), "Shows logged"]].forEach(function (x) {
      var d = el("div"); d.appendChild(el("b", "", String(x[0]))); d.appendChild(el("span", "", x[1])); st.appendChild(d);
    });
    var f = clear($("hgFilters"));
    [["all", "All"], ["mine", "Collected"], ["Rare", "Rare"], ["One off", "One offs"], ["todo", "Still to catch"]].forEach(function (x) {
      var b = el("button", X.hgFilter === x[0] ? "on" : "", x[1]); b.onclick = function () { X.hgFilter = x[0]; renderHangar(); }; f.appendChild(b);
    });
    var q = ($("hgFind").value || "").toLowerCase().trim();
    var list = cat.filter(function (c) {
      if (q && c.name.toLowerCase().indexOf(q) < 0) return false;
      if (X.hgFilter === "mine") return !!mine[c.key];
      if (X.hgFilter === "todo") return !mine[c.key];
      if (X.hgFilter === "Rare" || X.hgFilter === "One off") return rarity(c) === X.hgFilter;
      return true;
    });
    var box = clear($("hgCards"));
    if (!list.length) box.appendChild(el("div", "empty", cat.length ? "Nothing matches that yet." : "The aircraft list fills up as the line ups are announced. You can add one yourself on the right."));
    list.slice(0, 160).forEach(function (c) {
      var r = rarity(c), b = el("button", "hg-card r-" + r.replace(" ", "") + (mine[c.key] ? " got" : "") + (X.hgSel === c.key ? " sel" : ""));
      b.appendChild(el("small", "", r)); b.appendChild(el("b", "", c.name));
      b.appendChild(el("span", "", mine[c.key] ? "Seen " + mine[c.key].length + (mine[c.key].length === 1 ? " time" : " times") : c.airArm || "Not caught yet"));
      b.onclick = function () { X.hgSel = c.key; renderHangar(); if (window.innerWidth < 860) $("hgDetail").scrollIntoView({ behavior: "smooth", block: "start" }); };
      box.appendChild(b);
    });
    var dl = clear($("hgShows")); var names = {};
    S.hub.shows.forEach(function (s) { names[s.name] = 1; }); S.hub.past.forEach(function (p) { names[p.showName] = 1; });
    Object.keys(names).forEach(function (n) { dl.appendChild(new Option(n)); });
    if (!$("hgYear").value) $("hgYear").value = new Date().getFullYear();
    $("hgYear").max = new Date().getFullYear() + 1;
    var sel = cat.find(function (c) { return c.key === X.hgSel; });
    $("hgName").textContent = sel ? sel.name : "Pick an aircraft";
    $("hgRarity").textContent = sel ? rarity(sel) : "";
    $("hgForm").hidden = !sel;
    var rows = clear($("hgRows")), log = clear($("hgLog"));
    if (!sel) { rows.appendChild(el("p", "bf-tip", "Tap any card to log where you saw it. Rare means it is on two show line ups, and a one off is on just one.")); return; }
    var m = (mine[sel.key] || []).slice().sort(function (a, b) { return (a.year || 0) - (b.year || 0); });
    function row(k, v) { var r = el("div", "row"); r.appendChild(el("span", "", k)); r.appendChild(el("b", "", v)); rows.appendChild(r); }
    row("First seen", m.length ? [m[0].showName, m[0].year].filter(Boolean).join(" ") : "Not yet");
    row("Times seen", String(m.length));
    row("Members who have it", h.totalMembers ? sel.members + " of " + h.totalMembers : String(sel.members));
    row("On line ups", sel.shows ? sel.shows + (sel.shows === 1 ? " show" : " shows") : "Added by members");
    m.forEach(function (x) {
      var li = el("li"); li.appendChild(el("span", "", [x.showName || "Somewhere special", x.year].filter(Boolean).join(", ")));
      var rm = el("button", "rm", "×"); rm.setAttribute("aria-label", "Remove this sighting");
      rm.onclick = function () { call("removeSeen", { id: x.id }).then(function () { h.seen = h.seen.filter(function (y) { return y.id !== x.id; }); renderHangar(); renderOverview(); }).catch(oops); };
      li.appendChild(rm); log.appendChild(li);
    });
  }
  $("hgFind").addEventListener("input", function () { renderHangar(); });
  $("hgForm").addEventListener("submit", function (e) {
    e.preventDefault(); if (!X.hangar) return;
    var sel = X.hangar.catalog.find(function (c) { return c.key === X.hgSel; }); if (!sel) return;
    call("addSeen", { name: sel.name, showName: $("hgShow").value, year: $("hgYear").value }).then(function (x) {
      if (!X.hangar.seen.some(function (y) { return y.id === x.id; })) { X.hangar.seen.push(x); sel.members = Math.max(sel.members, 1); }
      say(sel.name + " is in your hangar"); renderHangar(); renderOverview();
    }).catch(oops);
  });
  $("hgOwnForm").addEventListener("submit", function (e) {
    e.preventDefault(); if (!X.hangar) return;
    var name = $("hgOwn").value.trim(); if (name.length < 2) return;
    call("addSeen", { name: name, showName: $("hgShow").value, year: $("hgYear").value || new Date().getFullYear() }).then(function (x) {
      X.hangar.seen.push(x);
      if (!X.hangar.catalog.some(function (c) { return c.key === x.key; })) X.hangar.catalog.push({ key: x.key, name: x.name, airArm: "", shows: 0, members: 1 });
      X.hgSel = x.key; $("hgOwn").value = ""; say(x.name + " is in your hangar"); renderHangar(); renderOverview();
    }).catch(oops);
  });

  /* ---------- My Airshow Year ---------- */
  function yearsAvailable() {
    var ys = {}; S.hub.past.forEach(function (p) { ys[p.year] = 1; });
    (X.hangar ? X.hangar.seen : []).forEach(function (x) { if (x.year) ys[x.year] = 1; });
    S.hub.photos.forEach(function (p) { if (p.created) ys[new Date(p.created).getFullYear()] = 1; });
    var list = Object.keys(ys).map(Number).sort(function (a, b) { return b - a; });
    return list.length ? list : [new Date().getFullYear()];
  }
  function renderYear() {
    var years = yearsAvailable();
    if (!X.year || years.indexOf(X.year) < 0) X.year = years[0];
    var y = X.year, pick = clear($("yrPick"));
    years.forEach(function (v) { var b = el("button", v === y ? "on" : "", String(v)); b.onclick = function () { X.year = v; renderYear(); }; pick.appendChild(b); });
    $("yrNum").textContent = y;
    var shows = S.hub.past.filter(function (p) { return p.year === y; });
    var seen = (X.hangar ? X.hangar.seen : []).filter(function (x) { return x.year === y; });
    var photos = S.hub.photos.filter(function (p) { return p.created && new Date(p.created).getFullYear() === y; });
    var likes = photos.reduce(function (a, p) { return a + (p.likes || 0); }, 0) + S.hub.posts.filter(function (p) { return p.created && new Date(p.created).getFullYear() === y; }).reduce(function (a, p) { return a + (p.likes || 0); }, 0);
    var types = {}; seen.forEach(function (x) { types[x.key] = types[x.key] || { name: x.name, n: 0 }; types[x.key].n++; });
    var rare = 0; if (X.hangar) Object.keys(types).forEach(function (k) { var c = X.hangar.catalog.find(function (z) { return z.key === k; }); if (c && rarity(c) !== "Common") rare++; });
    $("yrLine").textContent = shows.length ? "What a season, " + firstName() + ". Here is everything you saw, everywhere you went, and the shot everyone liked. Share it with your friends before next season starts." : "Log the shows you went to in My Airshow History and the aircraft in My Hangar, and your season recap builds itself here.";
    var st = clear($("yrStats"));
    [[shows.length, "Shows"], [Object.keys(types).length, "Aircraft types"], [rare, "Rare catches"], [photos.length + " · " + likes, "Photos and likes"]].forEach(function (x) { var d = el("div"); d.appendChild(el("b", "", String(x[0]))); d.appendChild(el("span", "", x[1])); st.appendChild(d); });
    var top = Object.keys(types).map(function (k) { return types[k]; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
    var tb = clear($("yrTop"));
    if (!top.length) tb.appendChild(el("div", "empty", "Tap I Saw It on aircraft in My Hangar to fill this in."));
    top.forEach(function (a, i) { var r = el("div", "yr-top"); r.appendChild(el("code", "", pad(i + 1))); r.appendChild(el("b", "", a.name)); r.appendChild(el("em", "", "×" + a.n)); tb.appendChild(r); });
    renderYearMap(shows);
    var best = photos.slice().sort(function (a, b) { return (b.likes || 0) - (a.likes || 0); })[0];
    X.photo = best || null;
    var pb = clear($("yrPhoto"));
    if (!best) pb.appendChild(el("div", "empty", "Share a photo in My Posts and your most liked one shows here."));
    else {
      var img = el("img", "yr-best"); img.src = imgSrc(best.image, 900, 600); img.alt = best.title; img.loading = "lazy"; img.onerror = function () { img.onerror = null; img.src = best.image; }; pb.appendChild(img);
      pb.appendChild(el("b", "", best.title));
      pb.appendChild(el("span", "yr-meta", [best.likes + " likes", best.comments + " comments", best.shutter, best.aperture].filter(Boolean).join(" · ")));
    }
    buildCards(y, shows, types, top, best);
  }
  function renderYearMap(shows) {
    var s = $("yrMap"); while (s.firstChild) s.removeChild(s.firstChild);
    var pts = [];
    shows.forEach(function (p) { var sl = slugFor(p.showName), g = GEOX[sl]; if (g && !pts.some(function (q) { return q.sl === sl; })) pts.push({ sl: sl, lat: g[0], lon: g[1], name: POINT_NAMES[sl] || p.showName }); });
    function xy(lat, lon) { return [(lon + 6) / 8 * 260 + 20, (56.2 - lat) / 6.2 * 330 + 25]; }
    for (var i = 0; i < 6; i++) { s.appendChild(svg("line", { x1: 20, y1: 25 + i * 66, x2: 280, y2: 25 + i * 66, stroke: "rgba(95,227,220,.12)" })); }
    for (var j = 0; j < 5; j++) { s.appendChild(svg("line", { x1: 20 + j * 65, y1: 25, x2: 20 + j * 65, y2: 355, stroke: "rgba(95,227,220,.12)" })); }
    if (pts.length > 1) { var d = pts.map(function (p, k) { var c = xy(p.lat, p.lon); return (k ? "L" : "M") + c[0].toFixed(1) + " " + c[1].toFixed(1); }).join(" "); s.appendChild(svg("path", { d: d, fill: "none", stroke: "#9C86D8", "stroke-width": 2, "stroke-dasharray": "5 5" })); }
    pts.forEach(function (p) { var c = xy(p.lat, p.lon); s.appendChild(svg("circle", { cx: c[0].toFixed(1), cy: c[1].toFixed(1), r: 6, fill: "#D74949" })); var t = svg("text", { x: (c[0] + 9).toFixed(1), y: (c[1] + 4).toFixed(1), fill: "#E8F1F6", "font-size": 12, "font-family": "Barlow, sans-serif", "font-weight": 600 }); t.textContent = p.name; s.appendChild(t); });
    if (!pts.length) { var t = svg("text", { x: 150, y: 190, "text-anchor": "middle", fill: "#A9BDCB", "font-size": 13, "font-family": "Barlow, sans-serif" }); t.textContent = "Your shows appear here"; s.appendChild(t); }
    $("yrMapTag").textContent = pts.length ? pts.length + (pts.length === 1 ? " place" : " places") : "";
    $("yrMapTip").textContent = pts.length > 1 ? "From " + pts[0].name + " to " + pts[pts.length - 1].name + ". The further north you go, the higher the dot." : "";
  }
  function buildCards(y, shows, types, top, best) {
    var box = clear($("yrCards")); X.cards = [];
    var specs = [
      { kicker: "My airshow year", big: String(shows.length), line: shows.length === 1 ? "show in " + y : "shows in " + y, sub: Object.keys(types).length + " aircraft types seen" },
      { kicker: "Most seen aircraft", big: top[0] ? "×" + top[0].n : "0", line: top[0] ? top[0].name : "Fill in My Hangar", sub: top.slice(1, 3).map(function (a) { return a.name; }).join(" and ") },
      { kicker: "Where I went", big: String(new Set(shows.map(function (p) { return slugFor(p.showName) || p.showName; })).size), line: "different shows", sub: shows.slice(0, 4).map(function (p) { return p.showName; }).join(", ") }
    ];
    specs.forEach(function (c, i) {
      var cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1920;
      var g = cv.getContext("2d");
      var bg = g.createLinearGradient(0, 0, 1080, 1920); bg.addColorStop(0, "#061019"); bg.addColorStop(1, i === 1 ? "#2A1F4A" : "#0C3A3E"); g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
      g.strokeStyle = "rgba(95,227,220,.10)"; g.lineWidth = 2; for (var k = 0; k < 1920; k += 80) { g.beginPath(); g.moveTo(0, k); g.lineTo(1080, k); g.stroke(); } for (var m = 0; m < 1080; m += 80) { g.beginPath(); g.moveTo(m, 0); g.lineTo(m, 1920); g.stroke(); }
      g.strokeStyle = "#5FE3DC"; g.lineWidth = 8; [[60, 60, 1], [1020, 1860, -1]].forEach(function (q) { g.beginPath(); g.moveTo(q[0], q[1] + 90 * q[2]); g.lineTo(q[0], q[1]); g.lineTo(q[0] + 90 * q[2], q[1]); g.stroke(); });
      g.fillStyle = "#5FE3DC"; g.font = "600 52px Barlow, Arial, sans-serif"; g.fillText(c.kicker, 100, 260);
      g.fillStyle = "#FFFFFF"; g.font = "800 360px 'Barlow Condensed', Barlow, Arial, sans-serif"; g.fillText(c.big, 90, 760);
      g.fillStyle = "#E8F1F6"; g.font = "700 86px Barlow, Arial, sans-serif"; wrapText(g, c.line, 100, 900, 880, 100);
      g.fillStyle = "#A9BDCB"; g.font = "500 50px Barlow, Arial, sans-serif"; wrapText(g, c.sub || "", 100, 1150, 880, 66);
      g.fillStyle = "#D74949"; g.fillRect(100, 1660, 120, 10);
      g.fillStyle = "#FFFFFF"; g.font = "700 50px Barlow, Arial, sans-serif"; g.fillText("UK Airshow Guide", 100, 1760);
      g.fillStyle = "#A9BDCB"; g.font = "500 40px Barlow, Arial, sans-serif"; g.fillText("ukairshowguide.co.uk  ·  " + y, 100, 1820);
      var url = cv.toDataURL("image/png"); X.cards.push(url);
      var im = el("img", "yr-card"); im.src = url; im.alt = c.kicker + ": " + c.big + " " + c.line; box.appendChild(im);
    });
  }
  function wrapText(g, text, x, y, max, lh) {
    var words = String(text).split(" "), line = "", n = 0;
    words.forEach(function (w) { var t = line ? line + " " + w : w; if (g.measureText(t).width > max && line) { g.fillText(line, x, y + n * lh); n++; line = w; } else line = t; });
    if (line && n < 4) g.fillText(line, x, y + n * lh);
  }
  function cardFiles() { return X.cards.map(function (u, i) { var b = atob(u.split(",")[1]), a = new Uint8Array(b.length); for (var k = 0; k < b.length; k++) a[k] = b.charCodeAt(k); return new File([a], "my-airshow-year-" + X.year + "-" + (i + 1) + ".png", { type: "image/png" }); }); }
  $("yrShare").addEventListener("click", function () {
    var files = cardFiles();
    if (navigator.canShare && navigator.canShare({ files: files })) navigator.share({ files: files, title: "My Airshow Year " + X.year, text: "My airshow year, from ukairshowguide.co.uk" }).catch(function () {});
    else say("Sharing isn't available here, so I would suggest Save The Images and posting them from your phone.");
  });
  $("yrSave").addEventListener("click", function () {
    X.cards.forEach(function (u, i) { var a = document.createElement("a"); a.href = u; a.download = "my-airshow-year-" + X.year + "-" + (i + 1) + ".png"; document.body.appendChild(a); a.click(); a.remove(); });
    say("Saving your three story cards. On a phone you can press and hold a card instead.");
  });

  /* ---------- Share a photo, with camera settings read from the file ---------- */
  var PS = { file: null, jpeg: null, w: 0, h: 0 };
  function renderPhotoShare() {
    var sel = $("psShowSel"); if (sel.options.length) return;
    sel.appendChild(new Option("Pick a show", ""));
    S.hub.shows.forEach(function (x) { sel.appendChild(new Option(x.name, x.name)); });
    var cat = $("psCat"); cat.appendChild(new Option("Pick a category", ""));
    PHOTO_CATS.forEach(function (c) { cat.appendChild(new Option(c, c)); });
  }
  function readExif(buf) {
    var v = new DataView(buf), out = {};
    if (v.getUint16(0) !== 0xFFD8) return out;
    var o = 2;
    while (o < v.byteLength - 4) {
      var mk = v.getUint16(o); if ((mk & 0xFF00) !== 0xFF00) break;
      var len = v.getUint16(o + 2);
      if (mk === 0xFFE1 && v.getUint32(o + 4) === 0x45786966) { parseTiff(v, o + 10, out); break; }
      o += 2 + len;
    }
    return out;
  }
  function parseTiff(v, t, out) {
    var le = v.getUint16(t) === 0x4949;
    function u16(p) { return v.getUint16(p, le); } function u32(p) { return v.getUint32(p, le); }
    function str(p, n) { var s = ""; for (var i = 0; i < n; i++) { var c = v.getUint8(p + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); }
    function val(e) {
      var type = u16(e + 2), n = u32(e + 4), size = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8][type] * n, p = size > 4 ? t + u32(e + 8) : e + 8;
      if (type === 2) return str(p, n);
      if (type === 3) return u16(p);
      if (type === 4) return u32(p);
      if (type === 5 || type === 10) { var a = u32(p), b = u32(p + 4); return b ? [a, b] : null; }
      return null;
    }
    function ifd(p, tags) { var n = u16(p); for (var i = 0; i < n; i++) { var e = p + 2 + i * 12, tag = u16(e); if (tags[tag]) tags[tag](val(e)); } }
    var exifPtr = 0;
    ifd(t + u32(t + 4), { 0x010F: function (x) { out.make = x; }, 0x0110: function (x) { out.model = x; }, 0x8769: function (x) { exifPtr = x; } });
    if (exifPtr) ifd(t + exifPtr, {
      0x829A: function (x) { if (x) out.shutter = x[0] / x[1] >= 1 ? (x[0] / x[1]).toFixed(1).replace(/\.0$/, "") + "s" : "1/" + Math.round(x[1] / x[0]); },
      0x829D: function (x) { if (x) out.aperture = "f/" + (Math.round(x[0] / x[1] * 10) / 10); },
      0x8827: function (x) { if (x) out.iso = String(x); },
      0x920A: function (x) { if (x) out.focal = Math.round(x[0] / x[1]) + "mm"; },
      0xA434: function (x) { if (x) out.lens = x; },
      0x9003: function (x) { if (x) out.taken = x.slice(0, 10).replace(/:/g, "-"); }
    });
  }
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var sc = Math.min(1, 2048 / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * sc), h = Math.round(img.naturalHeight * sc);
        var c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
        var q = 0.9, d = c.toDataURL("image/jpeg", q); while (d.length * 0.75 > 3300000 && q > 0.5) { q -= 0.1; d = c.toDataURL("image/jpeg", q); }
        resolve({ data: d, w: w, h: h });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("That photo couldn't be opened. JPG straight from the camera works best.")); };
      img.src = url;
    });
  }
  $("psFile").addEventListener("change", function () {
    var f = this.files && this.files[0]; if (!f) return;
    PS.file = f; $("psExif").hidden = false; $("psRead").textContent = "Reading camera settings";
    ["psShutter", "psAperture", "psIso", "psFocal", "psCamera", "psLens"].forEach(function (id) { $(id).value = ""; });
    f.slice(0, 262144).arrayBuffer().then(function (buf) {
      var x = {}; try { x = readExif(buf); } catch (e) { x = {}; }
      $("psShutter").value = x.shutter || ""; $("psAperture").value = x.aperture || ""; $("psIso").value = x.iso || ""; $("psFocal").value = x.focal || "";
      $("psCamera").value = x.model ? (x.make && x.model.toLowerCase().indexOf(x.make.toLowerCase().split(" ")[0]) < 0 ? x.make + " " : "") + x.model : "";
      $("psLens").value = x.lens || ""; PS.taken = x.taken || "";
      var got = [x.shutter, x.aperture, x.iso && "ISO " + x.iso, x.focal].filter(Boolean);
      $("psRead").textContent = got.length ? "Read from the file: " + got.join(", ") + ". You can change any of them." : "No camera settings in this file, often the case after editing or messaging apps. You can type them in.";
    });
    shrink(f).then(function (r) { PS.jpeg = r.data; PS.w = r.w; PS.h = r.h; var p = $("psPrev"); p.src = r.data; p.hidden = false; $("psDropText").hidden = true; }).catch(oops);
  });
  $("psReset").addEventListener("click", function () { PS = { file: null, jpeg: null }; $("psForm").reset(); $("psExif").hidden = true; $("psPrev").hidden = true; $("psDropText").hidden = false; });
  $("psForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!PS.jpeg) return say("Add a photo first.", true);
    if (!$("psCat").value) return say("Pick a category for your photo.", true);
    if (!$("psOwn").checked) return say("Please confirm the photo is your own.", true);
    var b64 = PS.jpeg.split(",")[1], size = 290000, parts = [];
    for (var i = 0; i < b64.length; i += size) parts.push(b64.slice(i, i + size));
    var go = $("psGo"); go.disabled = true; go.textContent = "Uploading";
    var meta = { title: $("psTitle").value, category: $("psCat").value, showName: $("psShowSel").value, aircraft: $("psAircraft").value, camera: $("psCamera").value, lens: $("psLens").value, focal: $("psFocal").value, shutter: $("psShutter").value, aperture: $("psAperture").value, iso: $("psIso").value.replace(/^iso\s*/i, ""), takenOn: PS.taken || "" };
    call("startGalleryUpload", { total: parts.length }).then(function (r) {
      var chain = Promise.resolve();
      parts.forEach(function (p, i) { chain = chain.then(function () { go.textContent = "Uploading " + Math.round(100 * (i + 1) / parts.length) + "%"; return call("sendGalleryPiece", { uploadId: r.uploadId, index: i, data: p }); }); });
      return chain.then(function () { return call("finishGalleryUpload", { uploadId: r.uploadId, total: parts.length, meta: meta, ownPhoto: true, width: PS.w, height: PS.h }); });
    }).then(function () {
      say("Your photo is posted"); $("psReset").click(); return load();
    }).catch(oops).then(function () { go.disabled = false; go.textContent = "Post My Photo"; });
  });

  document.querySelectorAll("[data-go-p]").forEach(function (b) { b.addEventListener("click", function () { showPage(b.dataset.goP); }); });
