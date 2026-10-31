/* Site links for The Big Guide to UK Airshows.
   One file, loaded by every page, so the links between pages are kept in one place.
   To add a page: add a row to PAGES. Set live:false until the Wix page exists, so nobody lands on a 404.
   slug is the page's current address on Wix (checked live 19 Oct 2026). If a page's URL is renamed in Wix, change it here. */
(function(){
  var SITE='https://www.ukairshowguide.co.uk/';
  var FIND='air-shows-guides';
  var PAGES=[
    {key:'riat',            name:'Royal International Air Tattoo', where:'RAF Fairford, Gloucestershire', slug:'riat',                    live:true},
    {key:'raf-cosford',     name:'RAF Cosford Air Show',           where:'Shropshire',                    slug:'cosfordairshow',           live:true},
    {key:'duxford',         name:'Duxford Air Shows',              where:'IWM Duxford, Cambridgeshire',   slug:'duxfordairshows',          live:true},
    {key:'shuttleworth',    name:'Shuttleworth Air Shows',         where:'Old Warden, Bedfordshire',      slug:'shuttleworthairshows',     live:true},
    {key:'little-gransden', name:'Little Gransden Air and Car Show', where:'Cambridgeshire',              slug:'little-gransden-air-and-car-show',live:true},
    {key:'eastbourne',      name:'Eastbourne Airshow',             where:'East Sussex seafront',          slug:'eastbourneairshow',        live:true},
    {key:'clacton',         name:'Clacton Air Show',               where:'Essex seafront',                slug:'clactonairshow',           live:true},
    {key:'wales',           name:'Wales Air Show',                 where:'Swansea Bay',                   slug:'walesairshow',             live:true},
    {key:'midlands',        name:'Midlands Air Festival',          where:'Ragley Estate, Warwickshire',   slug:'midlandsairfestival',     live:true},
    {key:'hampshire',       name:'Hampshire Air Festival',         where:'Hampshire',                     slug:'copy-of-template-page-6',  live:false},
    {key:'blackpool',       name:'Blackpool Air Show',             where:'Lancashire seafront',           slug:'blackpool-air-show',      live:true},
    {key:'southport',       name:'Southport Air Show',             where:'Merseyside',                    slug:'southport-air-show',      live:true},
    {key:'ayr',             name:'International Ayr Show',         where:'Ayr seafront, South Ayrshire',  slug:'international-ayr-show',  live:true},
    {key:'headcorn',        name:'Headcorn Airshow',               where:'Headcorn Aerodrome, Kent',      slug:'headcorn-air-show',       live:false}
  ];
  var GUIDES=[
    {key:'find',        name:'Find your Air Show',          where:'Every show we cover',            slug:FIND,                          live:true},
    {key:'airshow-photography-hub', name:'Airshow Photography Hub', where:'Beginner guide, kit and photo tools', slug:'airshow-photography-hub', live:true},
    {key:'new-to-aviation-photography', name:'New to Aviation Photography', where:'Settings, kit and planning', slug:'new-to-aviation-photography', live:false},
    {key:'first',       name:'Planning your first air show', where:'Start here if you are new',     slug:'planning-your-first-airshow', live:true},
    {key:'camping',     name:'Camping at Air Shows',         where:'Campsites and what to pack',    slug:'camping-at-airshows',         live:true},
    {key:'airshow-security', name:'Airshow Security and Bag Searches', where:'What happens at the gate and how to pack', slug:'airshow-security', live:true},
    {key:'questions-and-answers', name:'Airshow Questions and Answers', where:'Straight answers, sorted by topic', slug:'airshow-questions', live:true},
    {key:'nikon-d500', name:'Nikon D500 3D Camera Guide', where:'Every button, set up for airshows', slug:'nikon-d500-guide', live:false}
  ];
  window.AIRSHOW_LINKS={site:SITE,find:SITE+FIND,pages:PAGES,guides:GUIDES};

  function here(){
    var f=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
    return f;
  }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}

  function fixLinks(){
    /* every link back to the site opens in the main window, and the old find address points at the real page */
    [].forEach.call(document.querySelectorAll('a[href*="ukairshowguide.co.uk"]'),function(a){
      var h=a.getAttribute('href');
      if(/find-your-airshow\/?$/.test(h)) a.setAttribute('href',SITE+FIND);
      if(/^https?:\/\/(www\.)?ukairshowguide\.co\.uk\/?$/.test(h) && /find your air ?show/i.test(a.textContent)) a.setAttribute('href',SITE+FIND);
      a.setAttribute('target','_top');
      a.removeAttribute('rel');
    });
  }

  function band(){
    if(document.getElementById('xl-band')) return;
    var me=here();
    var shows=PAGES.filter(function(p){return p.live && p.key!==me;});
    var guides=GUIDES.filter(function(p){return p.live && p.key!==me;});
    var css='#xl-band{background:#13293C;color:#FFFFFF;font-family:"Barlow",Arial,sans-serif;padding:56px 0 52px}'
      +'#xl-band .xl-wrap{max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:32px 48px;align-items:start}'
      +'#xl-band h2{margin:0;font-family:inherit;font-weight:700;font-size:clamp(30px,4vw,44px);line-height:1;letter-spacing:.01em;text-transform:uppercase;color:#FFFFFF}'
      +'#xl-band h2 span{color:#32B4AF}'
      +'#xl-band .xl-lede{margin:14px 0 0;font-size:16px;line-height:1.55;font-weight:500;color:#C9D6E0;max-width:34ch}'
      +'#xl-band .xl-find{display:inline-block;margin-top:20px;background:#D74949;color:#FFFFFF;font-weight:700;font-size:15px;padding:12px 18px;text-decoration:none}'
      +'#xl-band .xl-find:hover{background:#B83A3A}'
      +'#xl-band ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0;border-top:1px solid #2C4A63}'
      +'#xl-band li{border-bottom:1px solid #2C4A63}'
      +'#xl-band li a{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 4px;color:#FFFFFF;text-decoration:none;transition:background .25s ease,padding .25s ease}'
      +'#xl-band li a:hover{background:#1B3A52;padding-left:12px}'
      +'#xl-band li b{display:block;font-size:17px;font-weight:600;line-height:1.25}'
      +'#xl-band li small{display:block;font-size:14px;font-weight:500;color:#9FB4C4;margin-top:2px}'
      +'#xl-band li i{font-style:normal;color:#32B4AF;font-weight:700}'
      +'#xl-band h3{margin:28px 0 10px;text-transform:none;letter-spacing:0;font-family:inherit;font-size:18px;font-weight:600;color:#32B4AF}'
      +'#xl-band a:focus-visible{outline:3px solid #32B4AF;outline-offset:2px}'
      +'@media(max-width:820px){#xl-band .xl-wrap{grid-template-columns:minmax(0,1fr)}}'
      +'@media(max-width:640px){#xl-band{padding:40px 0}#xl-band .xl-wrap{padding:0 16px}#xl-band ul{grid-template-columns:minmax(0,1fr)}}'
      +'@media(prefers-reduced-motion:reduce){#xl-band li a{transition:none}}';
    var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
    function li(p){return '<li><a href="'+SITE+p.slug+'" target="_top"><span><b>'+esc(p.name)+'</b><small>'+esc(p.where)+'</small></span><i aria-hidden="true">&rarr;</i></a></li>';}
    var sec=document.createElement('section');
    sec.id='xl-band';sec.setAttribute('aria-label','More air shows');
    sec.innerHTML='<div class="xl-wrap"><div><h2>More air <span>shows</span></h2>'
      +'<p class="xl-lede">Planning more than one this year? Every guide follows the same layout, so you can compare travel, parking and where to watch at a glance.</p>'
      +'<a class="xl-find" href="'+SITE+FIND+'" target="_top">Find your Air Show</a></div>'
      +'<div><ul>'+shows.map(li).join('')+'</ul>'
      +(guides.length?'<h3>Visitor guides</h3><ul>'+guides.filter(function(g){return g.key!=='find';}).map(li).join('')+'</ul>':'')
      +'</div></div>';
    var anchor=document.querySelector('section.useful')||document.querySelector('footer');
    if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(sec,anchor); else document.body.appendChild(sec);
  }

  function go(){fixLinks();band();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go); else go();
})();
