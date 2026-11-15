/* The Big Guide to RIAT, shared header, footer and links.
   Every page loads this, so the menu and the footer live in one place.

   Links: on GitHub (straight to the file) pages link to each other by file name.
   Inside a Wix HTML embed on thebigguidetoriat.co.uk they open the matching Wix page
   in the whole window. If a Wix page address changes, change its slug here. */
(function(){
  var RIAT_SITE='https://www.thebigguidetoriat.co.uk/';
  var UK_SITE='https://www.ukairshowguide.co.uk/';
  var PAGES=[
    {key:'home',     name:'RIAT 2027',          file:'index.html',            slug:''},
    {key:'travel',   name:'Getting there',      file:'getting-there.html',    slug:'getting-there'},
    {key:'stay',     name:'Camping and hotels', file:'camping-and-stay.html', slug:'camping-and-stay'},
    {key:'faq',      name:'FAQ and first timers', file:'faq.html',            slug:'faq'}
  ];
  var framed=false;try{framed=window.self!==window.top}catch(e){framed=true}

  function href(p){return framed?RIAT_SITE+p.slug:p.file}
  function attrs(p){return 'href="'+href(p)+'"'+(framed?' target="_top"':'')}
  function page(key){for(var i=0;i<PAGES.length;i++)if(PAGES[i].key===key)return PAGES[i]}

  var here=document.body.getAttribute('data-page');
  var plane='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';

  var head=document.getElementById('rg-head');
  if(head){
    head.innerHTML=
      '<div class="topbar"><div class="wrap">'+
        '<span class="sis"><i class="dot" aria-hidden="true"></i>A sister site of <a href="'+UK_SITE+'" target="_top">The Big Guide to UK Airshows</a></span>'+
        '<a href="https://www.airtattoo.com/" target="_blank" rel="noopener">Official RIAT website &rarr;</a>'+
      '</div></div>'+
      '<header class="site"><div class="wrap">'+
        '<a class="brand" '+attrs(page('home'))+'><span class="mark">'+plane+'</span><span><b>The Big Guide to RIAT</b><small>MOD Boscombe Down 2027</small></span></a>'+
        '<button class="menu-btn" aria-expanded="false" aria-controls="rg-nav">Menu</button>'+
        '<ul class="nav" id="rg-nav">'+PAGES.map(function(p){
          return '<li><a '+attrs(p)+(p.key===here?' aria-current="page"':'')+'>'+p.name+'</a></li>';
        }).join('')+'</ul>'+
      '</div></header>';
    var btn=head.querySelector('.menu-btn'),nav=head.querySelector('.nav');
    btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
  }

  var foot=document.getElementById('rg-foot');
  if(foot){
    foot.innerHTML=
      '<footer class="foot"><div class="wrap"><div class="cols">'+
        '<div><h4>The Big Guide to RIAT</h4><p>An independent planning guide to the Royal International Air Tattoo, run by Jack Skedge since the Fairford days. Not connected to RIAT or the RAF Charitable Trust. For anything about your own booking, contact RIAT directly.</p></div>'+
        '<div><h4>This guide</h4><ul>'+PAGES.map(function(p){return '<li><a '+attrs(p)+'>'+p.name+'</a></li>'}).join('')+'</ul></div>'+
        '<div><h4>More airshows</h4><ul>'+
          '<li><a href="'+UK_SITE+'" target="_top">The Big Guide to UK Airshows</a></li>'+
          '<li><a href="'+UK_SITE+'air-shows-guides" target="_top">Find your airshow</a></li>'+
          '<li><a href="'+UK_SITE+'riat" target="_top">RIAT on the UK guide</a></li>'+
          '<li><a href="https://www.facebook.com/share/19Ywfe4EcE/" target="_blank" rel="noopener">Facebook</a></li>'+
          '<li><a href="https://www.instagram.com/theukairshowguide/" target="_blank" rel="noopener">Instagram</a></li>'+
        '</ul></div>'+
      '</div><p class="small">&copy; '+new Date().getFullYear()+' The Big Guide to RIAT, part of The Big Guide to UK Airshows. Details are checked against RIAT&rsquo;s own announcements; always confirm with RIAT before you book.</p></div></footer>';
  }

  /* any link marked data-go="travel" etc. points at that page */
  Array.prototype.forEach.call(document.querySelectorAll('[data-go]'),function(a){
    var p=page(a.getAttribute('data-go'));if(!p)return;
    a.setAttribute('href',href(p));if(framed)a.setAttribute('target','_top');
  });

  /* days to go */
  var c=document.getElementById('count');
  if(c){
    var show=new Date('2027-07-16T00:00:00+01:00').getTime();
    var tick=function(){
      var d=Math.max(0,show-Date.now()),
          days=Math.floor(d/864e5),hrs=Math.floor(d/36e5)%24,mins=Math.floor(d/6e4)%60;
      c.innerHTML='<div><b>'+days+'</b><small>days</small></div><div><b>'+hrs+'</b><small>hours</small></div><div><b>'+mins+'</b><small>mins</small></div>';
    };
    tick();setInterval(tick,30000);
  }
})();
