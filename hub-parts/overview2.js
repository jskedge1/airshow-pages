  /* ---------- Overview: cockpit layout (21 Oct 2026) ---------- */
  var O2 = { typed: false, flapsBuilt: false, lastMsg: "", celebrated: {}, radarStarted: false, blips: [] };
  var O2_REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var O2_SHOWPTS = { riat: [51.682, -1.790], cosford: [52.640, -2.306], midlands: [52.203, -1.888], eastbourne: [50.763, 0.285], clacton: [51.788, 1.155], wales: [51.615, -3.944], duxford: [52.090, 0.132], shuttleworth: [52.088, -0.320], "little-gransden": [52.167, -0.149], southport: [53.648, -3.010], blackpool: [53.810, -3.055], ayr: [55.462, -4.640] };
  var O2_AREAS = [["London and the South East", 51.507, -0.128], ["East of England", 51.95, 0.75], ["Midlands", 52.48, -1.90], ["North of England", 53.80, -1.55], ["South West", 51.45, -2.59], ["Wales", 51.48, -3.18], ["Scotland", 55.86, -4.25]];
  var O2_CODES = { riat: "FFD", cosford: "COS", midlands: "MID", eastbourne: "EBN", clacton: "CLA", wales: "SWA", duxford: "DUX", shuttleworth: "OWD", "little-gransden": "LGR", southport: "SPT", blackpool: "BPL", ayr: "AYR" };

  /* cockpit sounds, made in the browser, off until the member switches them on */
  var O2S = (function () {
    var on = false, ctx = null;
    try { on = localStorage.getItem("ukagOvSound") === "on"; } catch (e) {}
    function ac() { if (!ctx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); } if (ctx.state === "suspended") ctx.resume(); return ctx; }
    function noise(dur, f0, f1, vol, type) {
      var c = ac(); if (!c) return; var t = c.currentTime;
      var n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = b; f.type = type || "bandpass"; f.Q.value = 1.2; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); s.stop(t + dur);
    }
    function tone(f0, f1, dur, vol, type) {
      var c = ac(); if (!c) return; var t = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .05);
    }
    return {
      isOn: function () { return on; },
      set: function (v) { on = v; try { localStorage.setItem("ukagOvSound", v ? "on" : "off"); } catch (e) {} if (v) ac(); },
      click: function () { if (on) { noise(.03, 2500, 2400, .4, "highpass"); tone(1800, 900, .04, .08, "square"); } },
      radio: function () { if (on) { noise(.35, 1800, 900, .12); tone(1000, 1000, .06, .05, "sine"); } },
      jet: function () { if (on) noise(3.2, 200, 1400, .5, "lowpass"); },
      boom: function () { if (on) { tone(90, 30, 1.2, .6, "sine"); noise(1.4, 600, 60, .7, "lowpass"); } },
      taxi: function () { if (on) { tone(700, 1100, 2.4, .05, "sawtooth"); noise(2.4, 400, 900, .12, "lowpass"); } }
    };
  })();
  function o2SndUI() { $("o2Snd").setAttribute("aria-pressed", String(O2S.isOn())); $("o2SndT").textContent = O2S.isOn() ? "Cockpit sounds on" : "Cockpit sounds off"; }
  $("o2Snd").addEventListener("click", function () { O2S.set(!O2S.isOn()); o2SndUI(); O2S.click(); });
  o2SndUI();

  /* panels open from the middle as they come into view */
  var o2io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); o2io.unobserve(e.target); } }); }, { threshold: .1 }) : null;
  document.querySelectorAll(".o2-p").forEach(function (p) { if (o2io && !O2_REDUCE) o2io.observe(p); else p.classList.add("on"); });

  /* header photo leans gently with the mouse */
  if (!O2_REDUCE) document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || S.page !== "overview") return;
    var ph = $("o2Photo"); ph.style.setProperty("--px", ((e.clientX / innerWidth - .5) * -18) + "px"); ph.style.setProperty("--py", ((e.clientY / innerHeight - .5) * -10) + "px");
  });

  function o2Home() {
    var area = ""; try { area = localStorage.getItem("ukagArea") || ""; } catch (e) {}
    if (!area && S.hub && S.hub.member) area = S.hub.member.area || "";
    var a = O2_AREAS.find(function (x) { return area && (x[0].toLowerCase().indexOf(area.toLowerCase()) >= 0 || area.toLowerCase().indexOf(x[0].split(" ")[0].toLowerCase()) >= 0); });
    return a ? { name: a[0], lat: a[1], lon: a[2] } : { name: "Centre of England", lat: 52.56, lon: -1.46 };
  }
  function o2Geo(a, b) {
    var R = 3959, toR = Math.PI / 180, dLat = (b[0] - a[0]) * toR, dLon = (b[1] - a[1]) * toR;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var dist = 2 * R * Math.asin(Math.sqrt(h));
    var y = Math.sin(dLon) * Math.cos(b[0] * toR), x = Math.cos(a[0] * toR) * Math.sin(b[0] * toR) - Math.sin(a[0] * toR) * Math.cos(b[0] * toR) * Math.cos(dLon);
    return { dist: dist, brg: (Math.atan2(y, x) / toR + 360) % 360 };
  }
  function o2Next() {
    var now = Date.now();
    return (S.hub.trips || []).filter(function (t) { return t.start && new Date(t.end || t.start).getTime() + 864e5 > now; })
      .sort(function (a, b) { return a.start.localeCompare(b.start); })[0] || null;
  }
  function o2ShowFor(t) { return (S.hub.shows || []).find(function (z) { return z.slug === t.showSlug; }) || {}; }
  function o2Days(iso) { return Math.ceil((new Date(iso) - new Date()) / 864e5); }
  function o2Type(node, text, delay, cb) {
    if (O2_REDUCE || O2.typed) { node.textContent = text; if (cb) cb(); return; }
    var i = 0; setTimeout(function step() { node.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(step, 40); else if (cb) cb(); }, delay);
  }

  function renderOverview() {
    if (!S.hub || !S.hub.member || !$("o2")) return;
    var h = S.hub, next = o2Next(), home = o2Home();
    var today = next && new Date(next.start).getTime() <= Date.now() + 36e5 * 2;
    $("o2").classList.toggle("sd", !!today);

    /* sky: time of day tint, forecast and greeting */
    var hr = +new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }).format(new Date());
    var tod = hr < 5 || hr >= 21 ? ["Night flying", "No displays until morning", "linear-gradient(180deg,#0B1F3A,#13293C)", false]
      : hr < 12 ? ["Morning light", "Sun in the east", "linear-gradient(180deg,#9FD3F0,#F7D9A0)", true]
      : hr < 17 ? ["Afternoon light", "Sun in the south west", "linear-gradient(180deg,#5FA8D3,#F2D29B)", true]
      : ["Golden hour", "Sun low in the west", "linear-gradient(180deg,#E8875A,#6950A1)", true];
    $("o2Tod").textContent = tod[0]; $("o2TodS").textContent = tod[1]; $("o2Tint").style.setProperty("--tod", tod[2]);
    var w = next && h.weather ? h.weather[next.id] : null, wx = tod[3] ? "sun" : "";
    if (w) {
      wx = w.rain >= 50 ? "rain" : w.rain >= 25 ? "cloud" : (tod[3] ? "sun" : "");
      $("o2WxT").textContent = "High " + w.high + "°C, rain " + w.rain + "%";
      $("o2WxS").textContent = "Wind " + w.wind + " mph " + w.windDir + " at " + (o2ShowFor(next).shortName || next.showName);
    } else {
      $("o2WxT").textContent = next ? "Forecast on its way" : "No forecast yet";
      $("o2WxS").textContent = next ? "It arrives the week before " + (o2ShowFor(next).shortName || "your show") : "Save a show to see its weather here";
    }
    $("o2Wx").className = "o2-wx " + wx; $("o2Sky").classList.toggle("dim", wx === "rain" || wx === "cloud");
    var clk = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" }).format(new Date());
    $("o2Clock").textContent = clk;
    var greet = (today ? "Show day" : partOfDay()) + ",";
    if (!O2.typed && !O2.typing) { O2.typing = true; $("o2Greet").textContent = ""; $("o2Name").textContent = ""; o2Type($("o2Greet"), greet.toUpperCase(), 250, function () { o2Type($("o2Name"), firstName().toUpperCase(), 100, function () { O2.typed = true; O2.typing = false; }); }); }
    else if (O2.typed) { $("o2Greet").textContent = greet.toUpperCase(); $("o2Name").textContent = firstName().toUpperCase(); }
    var trips = h.trips || [], open = 0; trips.forEach(function (t) { open += (t.todo || []).filter(function (x) { return !x.done; }).length; });
    var bits = [];
    if (today) bits.push("Enjoy " + (o2ShowFor(next).shortName || "the show") + " today. I would head to the crowd line early and save your pitch.");
    else if (next) bits.push("You have " + (trips.length === 1 ? "one show" : trips.length + " shows") + " on your radar. " + next.showName + " is up first, in " + o2Days(next.start) + " days.");
    else bits.push("Your radar is clear. Save the shows you are going to and your countdowns start here.");
    if (!today && open) bits.push((open === 1 ? "One check is" : open + " checks are") + " still to sort.");
    $("o2Brief").textContent = bits.join(" ");

    o2Pass(next, home, today);
    o2Ready(next);
    o2Radio();
    o2Must();
    o2Radar(home);
    o2Runway(next);
    o2Hangar();
    o2Quick(next);
    o2Milestone(next);
  }

  /* boarding pass with the split flap countdown */
  var O2_CELLS = {};
  function o2Flaps() {
    if (O2.flapsBuilt) return; O2.flapsBuilt = true;
    var box = $("o2Flaps");
    [["d", "Days", 3], ["h", "Hours", 2], ["m", "Mins", 2], ["s", "Secs", 2]].forEach(function (u) {
      if (box.children.length) { var sp = el("span", "sep", ":"); sp.setAttribute("aria-hidden", "true"); box.appendChild(sp); }
      var unit = el("div", "unit"), row = el("div", "d"); O2_CELLS[u[0]] = [];
      for (var i = 0; i < u[2]; i++) { var f = el("div", "flap"); f.appendChild(el("span", "", "0")); row.appendChild(f); O2_CELLS[u[0]].push(f); }
      unit.appendChild(row); unit.appendChild(el("small", "", u[1])); box.appendChild(unit);
    });
  }
  function o2SetNum(key, n) {
    var cells = O2_CELLS[key]; if (!cells) return;
    var str = String(Math.max(0, n)).padStart(cells.length, "0").slice(-cells.length);
    cells.forEach(function (f, i) {
      var sp = f.firstChild; if (sp.textContent === str[i]) return;
      if (O2_REDUCE || S.page !== "overview") { sp.textContent = str[i]; return; }
      f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
      setTimeout(function () { sp.textContent = str[i]; }, 230);
    });
  }
  function ovTick() {
    var t = S.hub && S.hub.member ? o2Next() : null; if (!t) return;
    var ms = Math.max(0, new Date(t.start) - new Date());
    o2SetNum("d", Math.floor(ms / 864e5)); o2SetNum("h", Math.floor(ms / 36e5) % 24); o2SetNum("m", Math.floor(ms / 6e4) % 60); o2SetNum("s", Math.floor(ms / 1e3) % 60);
  }
  setInterval(function () { if (S.hub && S.hub.member && S.page === "overview") ovTick(); }, 1000);
  function o2Pass(next, home, today) {
    o2Flaps();
    $("o2PassEmpty").hidden = !!next; $("o2RouteBox").hidden = !next; $("o2Flaps").hidden = !next || today; $("o2Today").hidden = !today; $("o2Stub").hidden = !next;
    $("o2Home").textContent = home.name;
    if (!next) { $("o2PassT").textContent = "No show saved yet"; $("o2PassK").textContent = "BOARDING PASS"; $("o2Gate").textContent = ""; return; }
    var sh = o2ShowFor(next);
    $("o2PassK").textContent = today ? "SHOW DAY · TODAY" : "BOARDING PASS · NEXT SHOW";
    $("o2PassT").textContent = today ? "Today at " + (sh.shortName || next.showName) : next.showName;
    $("o2Gate").textContent = next.gatesOpen ? "GATES " + next.gatesOpen : "";
    $("o2Code").textContent = O2_CODES[next.showSlug] || (next.showName || "").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
    $("o2Where").textContent = sh.shortName || "";
    $("o2Date").textContent = dayStr(next.start);
    $("o2Gates").textContent = next.gatesOpen || "To be confirmed";
    $("o2Travel").textContent = next.travel || "To plan";
    ovTick();
  }

  /* readiness horizon and the pre flight switches (the trip's own to do list) */
  function o2Ready(next) {
    var box = clear($("o2Switches"));
    var todo = next ? (next.todo || []) : [];
    if (!next) { box.appendChild(el("p", "o2-mut", "Your pre flight checks appear when you save a show.")); }
    todo.slice(0, 6).forEach(function (x) {
      var b = el("button", "o2tg"); b.type = "button"; b.setAttribute("aria-pressed", String(!!x.done));
      b.appendChild(el("span", "base")); var tx = el("span"); tx.appendChild(el("b", "", x.t)); if (x.d) tx.appendChild(el("small", "", x.d)); b.appendChild(tx); b.appendChild(el("span", "led"));
      b.onclick = function () {
        x.done = !x.done; b.setAttribute("aria-pressed", String(x.done));
        S.tripId = next.id; saveTrip({ todo: next.todo });
        if (navigator.vibrate) navigator.vibrate(12); O2S.click();
        o2ReadyGauge(next, true); renderTrips();
      };
      box.appendChild(b);
    });
    if (todo.length > 6) { var more = el("button", "o2-link", "All " + todo.length + " checks in My Trips"); more.type = "button"; more.onclick = function () { S.tripId = next.id; renderAll(); showPage("trips"); }; box.appendChild(more); }
    o2ReadyGauge(next, false);
  }
  function o2ReadyGauge(next, user) {
    var todo = next ? (next.todo || []) : [], done = todo.filter(function (x) { return x.done; }).length;
    var pct = todo.length ? Math.round(done / todo.length * 100) : 0;
    $("o2Pct").textContent = pct; $("o2SwCount").textContent = todo.length ? done + " OF " + todo.length : "";
    $("o2Ball").style.transform = "translateY(" + ((100 - pct) / 100 * -34) + "px)";
    var left = todo.filter(function (x) { return !x.done; })[0];
    $("o2ReadyNext").textContent = !next ? "" : left ? "> Next: " + left.t.toLowerCase() : "> All checks complete";
    $("o2ReadyLine").textContent = !next ? "Save a show and its checks set the horizon." : pct === 100 ? "Wings level. You are cleared for " + (o2ShowFor(next).shortName || next.showName) + "." : pct >= 50 ? "Climbing nicely. A few more checks and you are ready." : "Flip the pre flight switches as you sort each part of your trip. The horizon levels out as you go.";
    $("o2Route").style.setProperty("--prog", Math.max(8, pct * .9) + "%");
    if (next && pct === 100 && user && !O2.celebrated[next.id]) { O2.celebrated[next.id] = true; o2Flypast("Cleared for " + (o2ShowFor(next).shortName || "take off")); }
  }

  /* Red Arrows flypast with red, white and blue smoke */
  function o2Flypast(text) {
    if (O2_REDUCE) { say(text); return; }
    var fp = el("div", "o2-fly"); fp.setAttribute("aria-hidden", "true");
    var fm = el("div", "fm"), pos = [[150, 80], [110, 40], [110, 120], [70, 0], [70, 160], [30, 40], [30, 120], [-10, 80], [-50, 80]], col = ["#D74949", "#E8F1F6", "#2E5BD7"];
    pos.forEach(function (p, i) {
      var sm = el("i", "sm"); sm.style.top = (p[1] + 18) + "px"; sm.style.right = (340 - p[0] - 6) + "px"; sm.style.background = "linear-gradient(270deg," + col[i % 3] + ",transparent)"; fm.appendChild(sm);
      var im = el("img"); im.src = "https://jskedge1.github.io/airshow-pages/hub-img/red-arrows-hawk.webp"; im.alt = ""; im.style.left = p[0] + "px"; im.style.top = p[1] + "px"; fm.appendChild(im);
    });
    fp.appendChild(fm); document.body.appendChild(fp);
    var c = el("div", "o2-cleared", text); document.body.appendChild(c); O2S.jet();
    setTimeout(function () { fp.remove(); c.remove(); }, 4200);
  }

  /* show radio: the latest updates arrive like air traffic messages */
  function o2Radio() {
    var box = clear($("o2Msgs")), ups = (S.hub.updates || []).slice(0, 3);
    var unread = (S.hub.updates || []).filter(function (u) { return !u.read; }).length;
    $("o2RadN").textContent = unread ? unread + " NEW" : "LIVE UPDATES";
    if (!ups.length) { box.appendChild(el("p", "o2-mut", "All quiet on the radio. I check the official show websites every day and anything new lands here.")); $("o2Freq").textContent = "HUB 01"; $("o2FreqName").textContent = "Hub control"; return; }
    var first = ups[0], sh = (S.hub.shows || []).find(function (z) { return z.slug === first.showSlug; });
    var code = sh ? (O2_CODES[sh.slug] || sh.shortName.slice(0, 3).toUpperCase()) : "HUB";
    var key = first.id || first.heading;
    var fresh = key !== O2.lastMsg; O2.lastMsg = key;
    $("o2FreqName").textContent = sh ? sh.shortName + " updates" : "Hub control";
    if (fresh && !O2_REDUCE) {
      var f = $("o2Freq"), n = 0; $("o2Wave").classList.remove("quiet"); O2S.radio();
      var spin = setInterval(function () { f.textContent = code + " " + String(Math.floor(Math.random() * 90) + 10); if (++n > 8) { clearInterval(spin); f.textContent = code + " 01"; } }, 45);
      setTimeout(function () { $("o2Wave").classList.add("quiet"); }, 2600);
    } else $("o2Freq").textContent = code + " 01";
    ups.forEach(function (u, i) {
      var d = el("div", "o2msg" + (u.kind === "lineup" ? "" : " p")), s2 = (S.hub.shows || []).find(function (z) { return z.slug === u.showSlug; });
      d.appendChild(el("small", "", ((s2 ? s2.shortName : "Hub") + " · " + (u.created ? new Date(u.created).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "")).toUpperCase()));
      var p = el("p"); d.appendChild(p); box.appendChild(d);
      var text = (u.heading || "") + (u.body ? ". " + u.body : "");
      if (i === 0 && fresh) o2Type(p, text.replace(/\.\./g, "."), 500); else p.textContent = text.replace(/\.\./g, ".");
    });
  }

  /* must see deck with tilt */
  function o2Must() {
    var box = clear($("o2Deck")), must = S.hub.mustSee || [];
    $("o2MsN").textContent = must.length ? must.length + " WATCHING" : "";
    if (!must.length) { box.appendChild(el("p", "o2-mut", "Tap Add To Must See on any aircraft in a show line up and it lands here.")); return; }
    must.slice(0, 4).forEach(function (m) {
      var c = el("div", "card"); c.appendChild(el("b", "", m.name));
      var st = m.status || "Waiting", cls = /cancel|withdrawn|not/i.test(st) ? "no" : /confirm/i.test(st) ? "ok" : "wait";
      c.appendChild(el("span", "stamp " + cls, st)); c.appendChild(el("small", "", m.showName || ""));
      c.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse" || O2_REDUCE) return;
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--ry", ((x - .5) * 10) + "deg"); c.style.setProperty("--rx", ((.5 - y) * 10) + "deg"); c.style.setProperty("--mx", (x * 100) + "%"); c.style.setProperty("--my", (y * 100) + "%");
      });
      c.addEventListener("pointerleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
      box.appendChild(c);
    });
  }

  /* show radar: featured shows plotted by real direction and distance from home */
  function o2Radar(home) {
    var g = $("o2Blips"); while (g.firstChild) g.removeChild(g.firstChild);
    var mine = (S.hub.trips || []).map(function (t) { return t.showSlug; });
    var list = (S.hub.shows || []).filter(function (s) { return O2_SHOWPTS[s.slug]; }).map(function (s) { var gpos = o2Geo([home.lat, home.lon], O2_SHOWPTS[s.slug]); return { s: s, d: gpos.dist, b: gpos.brg, mine: mine.indexOf(s.slug) >= 0 }; });
    var max = list.reduce(function (m, x) { return Math.max(m, x.d); }, 100), range = Math.ceil(max * 1.08 / 50) * 50;
    $("o2Range").textContent = "RANGE " + range + " MI"; $("o2R1").textContent = Math.round(range / 3); $("o2R2").textContent = Math.round(range * 2 / 3);
    O2.blips = [];
    list.forEach(function (x) {
      var rad = (x.b - 90) * Math.PI / 180, r = Math.max(14, x.d / range * 190), cx = 200 + Math.cos(rad) * r, cy = 200 + Math.sin(rad) * r;
      var col = x.mine ? "#5FE3D6" : "#8C77C9", grp = svg("g", { class: "blip" });
      grp.appendChild(svg("circle", { class: "ring", cx: cx.toFixed(1), cy: cy.toFixed(1), r: 6, fill: "none", stroke: col }));
      grp.appendChild(svg("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: x.mine ? 6 : 4, fill: col }));
      var left = cx < 200, t = svg("text", { x: (left ? cx - 9 : cx + 9).toFixed(1), y: (cy + 4).toFixed(1), fill: col, "text-anchor": left ? "end" : "start" });
      t.textContent = x.s.shortName; grp.appendChild(t);
      var ttl = svg("title", {}); ttl.textContent = x.s.name + ", about " + Math.round(x.d) + " miles"; grp.appendChild(ttl);
      g.appendChild(grp); O2.blips.push({ el: grp, ang: (x.b - 90 + 360) % 360 });
    });
    if (!O2.radarStarted && !O2_REDUCE) {
      O2.radarStarted = true; var t0 = performance.now();
      (function loop(now) {
        if (S.page === "overview") {
          var ang = ((now - t0) / 6000 * 360) % 360;
          O2.blips.forEach(function (b) { var diff = (ang - b.ang + 360) % 360; if (diff < 6 && !b.el.classList.contains("hit")) { b.el.classList.add("hit"); setTimeout(function () { b.el.classList.remove("hit"); }, 1400); } });
        }
        requestAnimationFrame(loop);
      })(t0);
    }
  }

  /* season runway: featured shows as runway markers, yours lit up, the jet taxis to today */
  function o2Runway(next) {
    var rw = $("o2Runway"); rw.querySelectorAll(".mk").forEach(function (m) { m.remove(); });
    var shows = (S.hub.shows || []).filter(function (s) { return s.start; });
    var mine = (S.hub.trips || []).map(function (t) { return t.showSlug; });
    var ref = next ? new Date(next.start) : shows.length ? new Date(shows.map(function (s) { return s.start; }).sort().filter(function (d) { return new Date(d) > new Date(); })[0] || shows[0].start) : new Date();
    var yr = ref.getFullYear(), s0 = new Date(yr, 4, 1).getTime(), s1 = new Date(yr, 8, 30).getTime();
    $("o2RwY").textContent = "MAY TO SEPT " + yr;
    var inSeason = shows.filter(function (s) { var t = new Date(s.start).getTime(); return t >= s0 && t <= s1; }).sort(function (a, b) { return a.start.localeCompare(b.start); });
    inSeason.forEach(function (sh, i) {
      var pct = (new Date(sh.start).getTime() - s0) / (s1 - s0) * 100, isMine = mine.indexOf(sh.slug) >= 0;
      var b = el("button", "mk " + (isMine ? "mine" : "dim")); b.type = "button"; b.style.left = pct + "%";
      var hh = [26, 50, 74][i % 3]; b.style.setProperty("--h", hh + "px"); b.style.top = (77 - hh) + "px";
      b.appendChild(el("b", "", sh.shortName)); b.appendChild(el("i")); b.appendChild(el("em"));
      b.title = sh.name + ", " + sh.dateText;
      b.onclick = function () { $("o2Rnote").textContent = sh.name + ": " + sh.dateText + ". " + (isMine ? "It is in your trips." : "Add it in My Trips to start its countdown."); };
      rw.appendChild(b);
    });
    var now = Date.now(), pos = now < s0 ? 0 : Math.min(100, (now - s0) / (s1 - s0) * 100);
    setTimeout(function () { $("o2Jet").style.left = (pos || 2) + "%"; }, 600);
    var firstMine = inSeason.filter(function (s) { return mine.indexOf(s.slug) >= 0 && new Date(s.start).getTime() > now; })[0];
    var note = $("o2Rnote"); note.textContent = "";
    if (now < s0) { note.appendChild(document.createTextNode("Holding at the threshold. ")); note.appendChild(el("b", "", o2Days(new Date(s0).toISOString()) + " days")); note.appendChild(document.createTextNode(" until the season starts" + (firstMine ? ", and " + firstMine.shortName + " is your first show." : "."))); }
    else if (now > s1) note.textContent = "That is the season wrapped. The new dates land here as soon as the shows announce them.";
    else note.textContent = firstMine ? "Rolling. " + firstMine.shortName + " is your next stop." : "The season is under way.";
    /* end of season replay for the latest year logged */
    var past = S.hub.past || [], years = past.map(function (p) { return p.year; }).filter(Boolean).sort(), last = years[years.length - 1];
    var rb = $("o2ReplayBtn"); rb.hidden = !last; if (last) { rb.textContent = "Replay my " + last + " season"; rb.onclick = function () { o2Replay(last); }; }
  }

  /* hangar: newly logged aircraft taxi in and park */
  function o2Hangar() {
    var bays = clear($("o2Bays"));
    if (!X.hangar) { $("o2HgN").textContent = ""; bays.appendChild(el("div", "bay free", "Opening the hangar doors")); return; }
    var seen = (X.hangar.seen || []).slice().sort(function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); });
    var count = uniqueSeen().length; $("o2HgN").textContent = count + " AIRCRAFT";
    var prev = -1; try { prev = +(localStorage.getItem("ukagHgCount") || -1); } catch (e) {}
    try { localStorage.setItem("ukagHgCount", String(count)); } catch (e) {}
    function bay(x, isNew) {
      var c = (X.hangar.catalog || []).find(function (z) { return z.key === x.key; }), rare = c && rarity(c) !== "Common";
      var d = el("div", "bay" + (rare ? " rare" : "") + (isNew ? " new" : ""));
      var im = el("img"); im.src = "https://jskedge1.github.io/airshow-pages/hub-img/red-arrows-hawk.webp"; im.alt = ""; d.appendChild(im);
      d.appendChild(el("b", "", x.name)); d.appendChild(el("small", "", (x.showName || "Logged") + (x.year ? " " + x.year : "") + (rare ? " · " + rarity(c) : "")));
      return d;
    }
    if (!seen.length) { bays.appendChild(el("div", "bay free", "Your first aircraft parks here")); $("o2HgLine").textContent = "Every aircraft you log taxis in and parks here."; return; }
    var arriving = prev >= 0 && count > prev && !O2_REDUCE;
    seen.slice(arriving ? 1 : 0, 4).forEach(function (x) { bays.appendChild(bay(x)); });
    $("o2HgLine").textContent = "Latest: " + seen[0].name + (seen[0].showName ? " at " + seen[0].showName : "") + ".";
    if (!arriving) return;
    var j = $("o2Taxi"); j.className = "taxijet"; j.style.left = "110%"; j.style.bottom = "12px"; j.style.transform = "rotate(-90deg)"; j.style.opacity = "";
    void j.offsetWidth; j.className = "taxijet go"; O2S.taxi();
    setTimeout(function () { j.style.left = "16%"; }, 30);
    setTimeout(function () { j.style.transform = "rotate(0deg)"; j.style.bottom = "150px"; }, 2300);
    setTimeout(function () { j.className = "taxijet"; j.style.opacity = "0"; bays.insertBefore(bay(seen[0], true), bays.firstChild); while (bays.children.length > 4) bays.removeChild(bays.lastChild); }, 3400);
  }

  /* quick launch display */
  function o2Quick(next) {
    var sh = next ? (o2ShowFor(next).shortName || next.showName) : "";
    var Q = {
      trips: ["L1 · PLAN", "My Trips", next ? "Tickets, travel, budget and your day timeline. " + sh + (next.travel ? " travel: " + next.travel + "." : " still needs your travel planned.") : "Tickets, travel, budget and your day timeline for every show you are going to."],
      showday: ["L2 · LIVE", "Show Day", "On the day, upload the flying display page from your programme and see what is flying now and next, with ear defender alerts."],
      briefing: ["L3 · BRIEF", "Flight Briefing", "Everything for your next show on one sheet: gates, weather, sun, parking and what is new on the line up."],
      forum: ["F1 · COMMS", "Airshow Forum", "Talk to other members, find a buddy for the show, share your photos and follow show day as it happens."],
      hangar: ["R2 · COLLECT", "My Hangar", "Every aircraft you have seen, collected show by show. Rare ones glow purple."],
      kit: ["R3 · PACK", "Kit And Packing", "Your packing list, with a photographer version if you are taking the camera."]
    };
    var cur = $("o2Scr").dataset.q || "trips";
    function show(k) {
      var q = Q[k]; $("o2Scr").dataset.q = k;
      document.querySelectorAll(".o2 .bz").forEach(function (x) { x.classList.toggle("on", x.dataset.q === k); });
      var s = $("o2Scr"); s.classList.remove("swap"); void s.offsetWidth; s.classList.add("swap");
      $("o2QK").textContent = q[0]; $("o2QT").textContent = q[1]; $("o2QP").textContent = q[2]; $("o2QGo").textContent = "Open " + q[1];
    }
    if (!O2.qlWired) {
      O2.qlWired = true;
      document.querySelectorAll(".o2 .bz").forEach(function (b) { b.addEventListener("mouseenter", function () { show(b.dataset.q); }); b.addEventListener("focus", function () { show(b.dataset.q); }); b.addEventListener("click", function () { show(b.dataset.q); }); });
      $("o2QGo").addEventListener("click", function () { showPage($("o2Scr").dataset.q || "trips"); });
      document.querySelectorAll("[data-o2go]").forEach(function (b) { b.addEventListener("click", function () { showPage(b.dataset.o2go); }); });
    }
    show(cur);
  }

  /* sonic boom at 100, 30 and 7 days to go, once each */
  function o2Milestone(next) {
    if (!next || O2_REDUCE) return;
    var d = o2Days(next.start);
    [100, 30, 7].forEach(function (m) {
      if (d !== m) return;
      var key = "ukagBoom-" + next.id + "-" + m, done = false; try { done = localStorage.getItem(key) === "1"; localStorage.setItem(key, "1"); } catch (e) {}
      if (done || S.page !== "overview") return;
      setTimeout(function () {
        var b = el("div", "o2-boom"); b.setAttribute("aria-hidden", "true");
        b.appendChild(el("i")); b.appendChild(el("i")); b.appendChild(el("i"));
        var t = el("b", "", m + " days to go"); t.appendChild(el("small", "", (next.showName || "").toUpperCase())); b.appendChild(t);
        document.body.appendChild(b); document.body.classList.add("o2-shake"); O2S.boom();
        if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
        setTimeout(function () { document.body.classList.remove("o2-shake"); }, 600);
        setTimeout(function () { b.remove(); }, 3200);
      }, 1600);
    });
  }

  /* end of season replay: a flight through every show logged for that year */
  var o2RpRaf = null;
  function o2Replay(year) {
    var past = (S.hub.past || []).filter(function (p) { return p.year === year; });
    var home = o2Home(), stops = [];
    past.forEach(function (p) {
      var n = (p.showName || "").toLowerCase(), hit = null;
      PICWORDS.forEach(function (w) { if (!hit && n.indexOf(w[0]) >= 0) hit = w[1]; });
      var sh = hit && (S.hub.shows || []).find(function (z) { return z.slug === hit; });
      if (hit && O2_SHOWPTS[hit]) stops.push({ name: sh ? sh.shortName : p.showName, slug: hit, pt: O2_SHOWPTS[hit], month: sh && sh.start ? new Date(sh.start).getMonth() : 6 });
    });
    stops.sort(function (a, b) { return a.month - b.month; });
    if (!stops.length) { say("I could not place those shows on the map yet."); return; }
    $("o2RpT").textContent = "YOUR " + year + " SEASON";
    var pts = [[home.lat, home.lon]].concat(stops.map(function (s) { return s.pt; }));
    var lats = pts.map(function (p) { return p[0]; }), lons = pts.map(function (p) { return p[1]; });
    var la0 = Math.min.apply(null, lats) - .4, la1 = Math.max.apply(null, lats) + .4, lo0 = Math.min.apply(null, lons) - .8, lo1 = Math.max.apply(null, lons) + .8;
    var sx = 700 / (lo1 - lo0), sy = 380 / (la1 - la0), sc = Math.min(sx, sy * 1.6);
    function xy(p) { return [50 + (p[1] - lo0) * sc + (700 - (lo1 - lo0) * sc) / 2, 420 - (p[0] - la0) * sc / 1.6 - (380 - (la1 - la0) * sc / 1.6) / 2]; }
    var P = pts.map(xy), d = "M" + P[0][0].toFixed(1) + " " + P[0][1].toFixed(1), miles = 0;
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - 40;
      d += " Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + b[0].toFixed(1) + " " + b[1].toFixed(1);
    }
    stops.forEach(function (s) { miles += o2Geo([home.lat, home.lon], s.pt).dist * 2; });
    var path = $("o2RpPath"); path.setAttribute("d", d);
    var len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    var g = $("o2RpStops"); while (g.firstChild) g.removeChild(g.firstChild);
    var homeG = svg("g", { class: "rp-stop on", transform: "translate(" + P[0][0].toFixed(1) + " " + P[0][1].toFixed(1) + ")" });
    homeG.appendChild(svg("circle", { r: 6, fill: "#F2B233" })); var ht = svg("text", { x: 12, y: 5 }); ht.textContent = "Home"; homeG.appendChild(ht); g.appendChild(homeG);
    var marks = stops.map(function (s, k) {
      var q = P[k + 1], m = svg("g", { class: "rp-stop", transform: "translate(" + q[0].toFixed(1) + " " + q[1].toFixed(1) + ")" });
      m.appendChild(svg("circle", { r: 8, fill: "#5FE3D6" })); m.appendChild(svg("circle", { r: 15, fill: "none", stroke: "#5FE3D6", "stroke-opacity": ".4" }));
      var t = svg("text", { x: 14, y: -6 }); t.textContent = s.name; m.appendChild(t);
      var dt = svg("text", { x: 14, y: 10, class: "dt" }); dt.textContent = "Stop " + (k + 1); m.appendChild(dt);
      g.appendChild(m); return m;
    });
    var st = clear($("o2RpStats")), photos = (S.hub.photos || []).filter(function (p) { return p.created && new Date(p.created).getFullYear() === year; }).length;
    [[String(stops.length), stops.length === 1 ? "Show" : "Shows"], [Math.round(miles).toLocaleString("en-GB"), "Miles travelled, about"], [String(photos), "Photos shared"], [String(X.hangar ? uniqueSeen().length : 0), "Aircraft in your hangar"]].forEach(function (x) { var dv = el("div"); dv.appendChild(el("b", "", x[0])); dv.appendChild(el("small", "", x[1])); st.appendChild(dv); });
    $("o2Replay").hidden = false; $("o2RpX").focus(); O2S.jet();
    var jet = $("o2RpJet"), dur = O2_REDUCE ? 1 : 7000, t0 = performance.now(), segs = marks.length;
    cancelAnimationFrame(o2RpRaf);
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      path.style.strokeDashoffset = len * (1 - e);
      var p = path.getPointAtLength(len * e), p2 = path.getPointAtLength(Math.min(len, len * e + 2));
      jet.setAttribute("transform", "translate(" + p.x + " " + p.y + ") rotate(" + (Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI + 90) + ")");
      marks.forEach(function (m, idx) { if (e >= (idx + 1) / segs - .02) m.classList.add("on"); });
      if (k < 1) o2RpRaf = requestAnimationFrame(step);
      else [].forEach.call(st.children, function (dv, i2) { setTimeout(function () { dv.classList.add("on"); }, i2 * 220); });
    })(t0);
  }
  $("o2RpX").addEventListener("click", function () { $("o2Replay").hidden = true; cancelAnimationFrame(o2RpRaf); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("o2Replay") && !$("o2Replay").hidden) $("o2RpX").click(); });
