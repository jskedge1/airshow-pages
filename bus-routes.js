/* Bus route maps for the feature show pages (camping-layout/<show>.html).
   Each page's "Getting there" bus topics call UKAG_BR.render(show, topicId), which adds a
   "Route maps" box with a "Show route details" button for every bus in that topic.
   The route pages themselves are bus-routes/<id>.html, built from templates/bus-route-template.html.

   WIX_PAGE: while it is null, buttons open the route page in a new tab.
   Once the Wix page /bus-route exists (HTML box loading the page named in ?r=, page code
   velo/page-code/bus-route.js), set WIX_PAGE to 'bus-route' and every button opens it on the site. */
(function(){
  var BASE = 'https://jskedge1.github.io/airshow-pages/bus-routes/';
  var SITE = 'https://www.ukairshowguide.co.uk/';
  var WIX_PAGE = null;

  /* show -> topic id -> list of [bus number, route page id] */
  var MAP = {"ayr":{"bus":[["X77","x77-ayr"],["4","4-ayr"],["42","42-ayr"],["X42","x42-ayr"],["9","9-ayr"]]},
    "blackpool":{"bus":[["61","61-blackpool"],["68","68-blackpool"],["11","11-blackpool"],["10","10-blackpool"],["14","14-blackpool"],["5C","5c-blackpool"],["42","42-blackpool"]]},
    "clacton":{"bus-colchester":[["74","74-clacton"],["74B","74b-clacton"],["76","76-clacton"]],"bus-local":[["7","7-clacton"],["9","9-clacton"],["9A","9a-clacton"],["98A","98a-clacton"],["3","3-clacton"],["2","2-clacton"],["2A","2a-clacton"],["6","6-clacton"],["6A","6a-clacton"],["4","4-clacton"],["78","78-clacton"],["74","74-clacton"],["74B","74b-clacton"],["76","76-clacton"]]},
    "duxford":{"bus-local":[["132","132-duxford"]]},
    "eastbourne":{"bus-station":[["3","3-eastbourne"]],"bus-brighton":[["12","12-eastbourne"],["12X","12x-eastbourne"],["13X","13x-eastbourne"]],"bus-beachy":[["13X","13x-eastbourne"]],"bus-east":[["99","99-eastbourne"],["25","25-eastbourne"],["28","28-eastbourne"],["12","12-eastbourne"],["12X","12x-eastbourne"],["13X","13x-eastbourne"]],"beachy-bus":[["13X","13x-eastbourne"]]},
    "headcorn":{"bus-local":[["12","12-headcorn"]]},
    "midlands":{"bus-247":[["247","247-midlands"]]},
    "riat":{"bus":[["76","76-riat"],["77","77-riat"]]},
    "shuttleworth":{"bus-74":[["74","74-shuttleworth"]]},
    "southport":{"bus-liverpool":[["47","47-southport"],["300","300-southport"],["X2","x2-southport"]],"bus-preston":[["X2","x2-southport"],["2","2-southport"],["347","347-southport"]],"bus-other":[["375","375-southport"],["385","385-southport"],["X37","x37-southport"],["37A","37a-southport"],["44","44-southport"]]}};

  function href(id){ return WIX_PAGE ? SITE + WIX_PAGE + '?r=' + id : BASE + id + '.html'; }

  function css(){
    if (document.getElementById('ukag-br-css')) return;
    var s = document.createElement('style'); s.id = 'ukag-br-css';
    s.textContent =
      '.br-box{margin:18px 0 8px;background:#F2B233;color:#13293C;border-radius:14px 14px 14px 0;padding:16px 18px 18px}' +
      '.br-box h4.br-h{margin:0!important;padding:0!important;font-family:"Barlow Condensed",sans-serif!important;font-weight:700!important;font-size:23px!important;line-height:25px!important;text-transform:none!important;letter-spacing:0!important;color:#13293C!important}' +
      '.br-box p.br-p{margin:6px 0 12px!important;font-family:"Barlow",sans-serif!important;font-weight:500!important;font-size:15px!important;line-height:22px!important;color:#13293C!important;text-transform:none!important}' +
      '.br-list{display:flex;flex-wrap:wrap;gap:8px}' +
      'a.br-btn{display:inline-flex;align-items:center;gap:10px;background:#13293C;color:#fff!important;text-decoration:none!important;border-radius:10px;padding:6px 14px 6px 6px;font-family:"Barlow",sans-serif;font-weight:600;font-size:15px;line-height:20px;text-transform:none;letter-spacing:0;transition:transform .3s cubic-bezier(.22,.61,.36,1),background .3s cubic-bezier(.22,.61,.36,1)}' +
      'a.br-btn:hover,a.br-btn:focus-visible{background:#0C1C2A;transform:translateY(-2px)}' +
      '.br-num{display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:32px;padding:0 8px;border-radius:7px;background:#F2B233;color:#13293C;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:21px;letter-spacing:.01em}' +
      'a.br-btn i{font-style:normal;transition:transform .3s cubic-bezier(.22,.61,.36,1)}' +
      'a.br-btn:hover i{transform:translateX(3px)}' +
      '@media(max-width:420px){a.br-btn{flex:1 1 100%}}';
    document.head.appendChild(s);
  }

  function render(show, topic){
    var list = (MAP[show] || {})[topic];
    if (!list || !list.length) return '';
    css();
    var tgt = WIX_PAGE ? ' target="_top"' : ' target="_blank" rel="noopener"';
    var one = list.length === 1;
    return '<div class="br-box"><h4 class="br-h">' + (one ? 'Route map for the ' + list[0][0] : 'Route maps for these buses') + '</h4>' +
      '<p class="br-p">' + (one ? 'See the roads it takes, every stop and the times, with the stop closest to the show marked.'
                   : 'Pick a bus to see the roads it takes, every stop and the times, with the stop closest to the show marked.') + '</p>' +
      '<div class="br-list">' + list.map(function(r){
        return '<a class="br-btn" href="' + href(r[1]) + '"' + tgt + '><span class="br-num">' + r[0] + '</span>Show route details <i aria-hidden="true">→</i></a>';
      }).join('') + '</div></div>';
  }

  window.UKAG_BR = { render: render, href: href, map: MAP };
})();
