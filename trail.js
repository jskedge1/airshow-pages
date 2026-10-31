/* Link trail for pages that are not in the main menu.
   Adds a slim bar at the top of the page: where you are, the pages above it, and a few places people go next.
   One file for every page that uses it. To add a page, add a row to TRAILS and load this file at the end of the page:
   <script src="https://jskedge1.github.io/airshow-pages/trail.js" defer></script>
   Each trail is [the pages above this one], this page, [also useful]. Links are [label, slug on the site]. */
(function () {
  var SITE = "https://www.ukairshowguide.co.uk/";
  var HOME = ["Home", ""];
  var FIND = ["Find your airshow", "air-shows-guides"];
  var GUIDES = ["Visitor planning guides", "visitorplanningguides"];
  var GETTING = ["Getting there", "first-airshow-getting-there"];
  var PUBLIC = ["Public transport", "airshow-public-transport"];
  var BUSES = ["Bus routes", "bus-route"];

  function train(show, slug) {
    return {
      up: [HOME, FIND, [show, slug]],
      here: "Train route",
      hideCrumb: true,
      also: [PUBLIC, BUSES, GETTING]
    };
  }

  var TRAILS = {
    "kit-calculator": {
      up: [HOME, GUIDES],
      here: "Kit calculator",
      also: [["Camping at airshows", "camping-at-airshows"], ["Photography hub", "airshow-photography-hub"], ["Food and drink", "foodanddrinkatairshows"]]
    },
    "questions-and-answers": {
      up: [HOME, GUIDES],
      here: "Questions and answers",
      also: [["Planning your first airshow", "planning-your-first-airshow"], FIND, ["Contact us", "contact-us"]]
    },
    "policies": {
      up: [HOME],
      here: "Our policies",
      also: [["Contact us", "contact-us"], ["Questions and answers", "airshow-questions"]]
    },
    "bus-routes/index": {
      up: [HOME, PUBLIC],
      here: "Bus routes",
      also: [GETTING, FIND]
    },
    "train-routes/clacton": train("Clacton Air Show", "clactonairshow"),
    "train-routes/cosford": train("RAF Cosford Air Show", "cosfordairshow"),
    "train-routes/eastbourne": train("Eastbourne Air Show", "eastbourneairshow"),
    "train-routes/wales": train("Wales Airshow", "walesairshow"),
    "train-routes/riat": train("Royal International Air Tattoo", "riat"),
    "train-routes/riat-cheltenham": train("Royal International Air Tattoo", "riat"),
    "train-routes/riat-kemble": train("Royal International Air Tattoo", "riat")
  };

  var key = location.pathname.replace(/^.*\/airshow-pages\//, "").replace(/^\//, "").replace(/\.html$/, "");
  var t = TRAILS[key];
  if (!t || document.getElementById("ukag-trail")) return;
  /* a page with its own working trail from the page code can switch this one off */
  if (window.UKAG_NO_TRAIL) return;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function link(p) { return '<a href="' + SITE + p[1] + '" target="_top">' + esc(p[0]) + "</a>"; }

  var css =
    "#ukag-trail{background:#fff;border-bottom:3px solid #32B4AF;font-family:'Barlow',Arial,sans-serif;font-weight:500;font-size:16px;line-height:1.35;color:#13293C}" +
    "#ukag-trail .tr-in{max-width:1200px;margin:0 auto;padding:10px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 24px}" +
    "#ukag-trail ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:2px 0}" +
    "#ukag-trail li{display:flex;align-items:center}" +
    "#ukag-trail li+li:before{content:'\\203A';margin:0 9px;color:#32B4AF;font-weight:700}" +
    "#ukag-trail a{color:#1B5E8C;text-decoration:none;padding:6px 2px;border-bottom:2px solid transparent;transition:border-color .2s ease,color .2s ease}" +
    "#ukag-trail a:hover{color:#13293C;border-bottom-color:#32B4AF}" +
    "#ukag-trail a:focus-visible{outline:3px solid #D74949;outline-offset:2px}" +
    "#ukag-trail [aria-current]{color:#13293C;font-weight:600}" +
    "#ukag-trail .tr-also{display:flex;flex-wrap:wrap;align-items:center;gap:2px 16px}" +
    "#ukag-trail .tr-also span{color:#41586B}" +
    "@media(max-width:640px){#ukag-trail .tr-in{padding:6px 14px;flex-direction:column;align-items:flex-start;gap:0}#ukag-trail ol,#ukag-trail .tr-also{flex-wrap:nowrap;white-space:nowrap;overflow-x:auto;max-width:100%;scrollbar-width:none;-webkit-overflow-scrolling:touch}#ukag-trail ol::-webkit-scrollbar,#ukag-trail .tr-also::-webkit-scrollbar{display:none}#ukag-trail a{padding:10px 2px}#ukag-trail .tr-also{gap:0 16px;border-top:1px solid #E1E9EF;width:100%}}" +
    "@media(prefers-reduced-motion:reduce){#ukag-trail a{transition:none}}";

  function build() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    var nav = document.createElement("nav");
    nav.id = "ukag-trail";
    nav.setAttribute("aria-label", "Where you are on the site");
    var crumbs = t.up.map(function (p) { return "<li>" + link(p) + "</li>"; }).join("") +
      '<li><span aria-current="page">' + esc(t.here) + "</span></li>";
    var also = t.also && t.also.length
      ? '<div class="tr-also"><span>Also useful</span>' + t.also.map(link).join("") + "</div>"
      : "";
    nav.innerHTML = '<div class="tr-in"><ol>' + crumbs + "</ol>" + also + "</div>";
    document.body.insertBefore(nav, document.body.firstChild);
    /* the page's own small breadcrumb says the same thing, so this bar replaces it */
    if (t.hideCrumb) {
      var own = document.querySelectorAll("nav.crumb");
      for (var i = 0; i < own.length; i++) own[i].style.display = "none";
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
