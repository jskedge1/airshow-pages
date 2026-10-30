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
  var WIX_PAGE = 'bus-route';

  /* show -> topic id -> list of [bus number, route page id, bus company colours, bus company] */
  var MAP = /*MAP*/;

  function href(id){ return WIX_PAGE ? SITE + WIX_PAGE + '?r=' + id : BASE + id + '.html'; }

  function css(){
    if (document.getElementById('ukag-br-css')) return;
    var s = document.createElement('style'); s.id = 'ukag-br-css';
    s.textContent =
      '.br-box{margin:18px 0 8px;background:#fff;color:#13293C;border-left:5px solid #F2B233;padding:16px 18px 18px;border-radius:0}' +
      '.br-box h4.br-h{margin:0!important;padding:0!important;font-family:"Barlow Condensed",sans-serif!important;font-weight:800!important;font-size:24px!important;line-height:26px!important;text-transform:uppercase!important;letter-spacing:0!important;color:#13293C!important}' +
      '.br-box p.br-p{margin:6px 0 12px!important;font-family:"Barlow",sans-serif!important;font-weight:500!important;font-size:15px!important;line-height:22px!important;color:#4E5D68!important;text-transform:none!important}' +
      '.br-list{display:flex;flex-wrap:wrap;gap:8px}' +
      'a.br-btn{display:inline-flex;align-items:stretch;background:var(--b1,#13293C);color:var(--bi,#fff)!important;text-decoration:none!important;border-radius:0;font-family:"Barlow",sans-serif;font-weight:600;font-size:15px;line-height:20px;text-transform:none;letter-spacing:0;transition:transform .3s cubic-bezier(.22,.61,.36,1),filter .3s cubic-bezier(.22,.61,.36,1)}' +
      'a.br-btn:hover,a.br-btn:focus-visible{transform:translateY(-2px);filter:brightness(1.08)}' +
      '.br-num{display:inline-flex;align-items:center;justify-content:center;min-width:52px;padding:0 10px;background:#050607;color:#F2B233;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:22px;letter-spacing:.01em;text-shadow:0 0 8px rgba(242,178,51,.45)}' +
      '.br-txt{display:flex;flex-direction:column;justify-content:center;padding:7px 12px;border-bottom:4px solid var(--b2,#F2B233)}' +
      '.br-txt small{font-weight:500;font-size:12.5px;line-height:15px;opacity:.85}' +
      'a.br-btn i{font-style:normal;display:flex;align-items:center;padding:0 12px 0 2px;border-bottom:4px solid var(--b2,#F2B233);transition:transform .3s cubic-bezier(.22,.61,.36,1)}' +
      'a.br-btn:hover i{transform:translateX(3px)}' +
      '@media(max-width:420px){a.br-btn{flex:1 1 100%}.br-txt{flex:1}}';
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
        var c = r[2] || {};
        var style = ' style="--b1:' + (c.op1 || '#13293C') + ';--bi:' + (c.opink || '#fff') + ';--b2:' + (c.op2 || '#F2B233') + '"';
        return '<a class="br-btn" href="' + href(r[1]) + '"' + tgt + style + '><span class="br-num">' + r[0] + '</span><span class="br-txt">Show route details' + (r[3] ? '<small>Run by ' + r[3] + '</small>' : '') + '</span><i aria-hidden="true">→</i></a>';
      }).join('') + '</div></div>';
  }

  window.UKAG_BR = { render: render, href: href, map: MAP };
})();
