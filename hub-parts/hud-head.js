/* HUD header extras for My Airshow Hub (preview, 21 Oct 2026): status strip, compass tape, scanlines and corner brackets */
(function () {
  var head = document.querySelector("#app .head"); if (!head || head.querySelector(".hh-strip")) return;
  var wrap = head.querySelector(".wrap");
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; }
  head.insertBefore(el("div", "hh-scan"), head.firstChild);
  head.insertBefore(el("div", "hh-sweep"), head.firstChild);
  ["tl", "tr", "bl", "br"].forEach(function (k) { head.appendChild(el("span", "hh-br " + k)); });
  var strip = el("div", "hh-strip");
  strip.appendChild(el("b", "", "SYS 01"));
  strip.appendChild(el("span", "", "MY AIRSHOW HUB"));
  strip.appendChild(el("span", "ok", "LINK SECURE"));
  var clk = el("span", "", ""); strip.appendChild(clk);
  function tick() { clk.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()) + " UK"; }
  tick(); setInterval(tick, 1000);
  var tape = el("div", "hh-tape"), rail = el("div", "rail");
  var marks = ["N", "030", "060", "E", "120", "150", "S", "210", "240", "W", "300", "330"];
  for (var r = 0; r < 4; r++) marks.forEach(function (m) { rail.appendChild(el("span", /^[NESW]$/.test(m) ? "c" : "", m)); });
  tape.appendChild(rail);
  head.insertBefore(tape, wrap); head.insertBefore(strip, tape);
})();
