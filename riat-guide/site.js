/* The Big Guide to RIAT, shared header, tabs, footer, links and planning tools.
   Every page loads this file, so the menu, the category tabs and the footer live in one place.

   Links: opened straight from GitHub, pages link to each other by file name.
   Inside a Wix HTML embed on thebigguidetoriat.co.uk they open the matching Wix page in the
   whole window. If a Wix page address changes, change its slug here.

   Tools (each only runs if its markup is on the page):
   - [data-tabs]           in-page tabs, keyboard friendly, open from a #hash
   - #count                countdown to the show
   - [data-store] lists    tick lists remembered in this browser (packing, planning timeline)
   - #budget               trip cost planner, remembered in this browser
   - #station-tool         which station suits me
   - #photo-tool           camera settings helper */
(function(){
  var RIAT_SITE='https://www.thebigguidetoriat.co.uk/';
  var UK_SITE='https://www.ukairshowguide.co.uk/';
  var I={ /* small line icons, 24px */
    home:'<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>',
    ticket:'<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
    train:'<rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 10h14M8 20l2-4M16 20l-2-4"/><circle cx="9" cy="13" r=".6"/><circle cx="15" cy="13" r=".6"/>',
    car:'<path d="M4 16v-4l2-5h12l2 5v4z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/><path d="M4 12h16"/>',
    tent:'<path d="M12 4 2 20h20z"/><path d="M12 10l-4 10M12 10l4 10"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    camera:'<path d="M4 7h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="4"/>',
    list:'<path d="M9 6h12M9 12h12M9 18h12"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14"/><circle cx="12" cy="17" r=".7"/>'
  };
  function icon(k){return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+I[k]+'</svg>'}

  var PAGES=[
    {key:'home',    name:'Overview',       file:'index.html',            slug:'',               ic:'home'},
    {key:'tickets', name:'Tickets',        file:'tickets.html',          slug:'tickets',        ic:'ticket'},
    {key:'travel',  name:'Transport',      file:'getting-there.html',    slug:'getting-there',  ic:'train'},
    {key:'parking', name:'Parking',        file:'parking.html',          slug:'parking',        ic:'car'},
    {key:'stay',    name:'Camping & hotels', file:'camping-and-stay.html', slug:'camping-and-stay', ic:'tent'},
    {key:'pv',      name:'Park & View',    file:'park-and-view.html',    slug:'park-and-view',  ic:'eye'},
    {key:'photo',   name:'Photography',    file:'photography.html',      slug:'photography',    ic:'camera'},
    {key:'planner', name:'Planning tools', file:'planner.html',          slug:'planner',        ic:'list'},
    {key:'faq',     name:'FAQ',            file:'faq.html',              slug:'faq',            ic:'help'}
  ];
  var framed=false;try{framed=window.self!==window.top}catch(e){framed=true}
  function href(p){return framed?RIAT_SITE+p.slug:p.file}
  function attrs(p){return 'href="'+href(p)+'"'+(framed?' target="_top"':'')}
  function page(key){for(var i=0;i<PAGES.length;i++)if(PAGES[i].key===key)return PAGES[i]}
  var here=document.body.getAttribute('data-page');
  var plane='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';

  /* ---------- header and category tabs ---------- */
  var head=document.getElementById('rg-head');
  if(head){
    head.innerHTML=
      '<div class="topbar"><div class="wrap">'+
        '<span class="sis"><i class="dot" aria-hidden="true"></i>A sister site of <a href="'+UK_SITE+'" target="_top">The Big Guide to UK Airshows</a></span>'+
        '<a href="https://www.airtattoo.com/" target="_blank" rel="noopener">Official RIAT website &rarr;</a>'+
      '</div></div>'+
      '<header class="site"><div class="wrap">'+
        '<a class="brand" '+attrs(page('home'))+'><span class="mark">'+plane+'</span><span><b>The Big Guide to RIAT</b><small>MOD Boscombe Down &middot; 16&ndash;18 July 2027</small></span></a>'+
        '<a class="btn red head-cta" '+attrs(page('planner'))+'>Plan my visit</a>'+
      '</div>'+
      '<nav class="cats" aria-label="Guide sections"><div class="wrap"><ul>'+PAGES.map(function(p){
          return '<li><a '+attrs(p)+(p.key===here?' aria-current="page"':'')+'>'+icon(p.ic)+'<span>'+p.name+'</span></a></li>';
        }).join('')+'</ul></div></nav>'+
      '</header>';
    var cur=head.querySelector('.cats [aria-current]');
    if(cur&&cur.scrollIntoView){var ul=head.querySelector('.cats ul');ul.scrollLeft=cur.offsetLeft-ul.clientWidth/2+cur.clientWidth/2}
  }

  /* ---------- footer ---------- */
  var foot=document.getElementById('rg-foot');
  if(foot){
    var half=Math.ceil(PAGES.length/2);
    var li=function(list){return list.map(function(p){return '<li><a '+attrs(p)+'>'+p.name+'</a></li>'}).join('')};
    foot.innerHTML=
      '<footer class="foot"><div class="wrap"><div class="cols">'+
        '<div><h4>The Big Guide to RIAT</h4><p>An independent planning guide to the Royal International Air Tattoo, run by Jack Skedge since the Fairford days. Not connected to RIAT or the RAF Charitable Trust Enterprises. For anything about your own booking, contact RIAT directly.</p></div>'+
        '<div><h4>Plan your visit</h4><ul>'+li(PAGES.slice(0,half))+'</ul></div>'+
        '<div><h4>More</h4><ul>'+li(PAGES.slice(half))+'</ul></div>'+
        '<div><h4>Sister site</h4><ul>'+
          '<li><a href="'+UK_SITE+'" target="_top">The Big Guide to UK Airshows</a></li>'+
          '<li><a href="'+UK_SITE+'air-shows-guides" target="_top">Find your airshow</a></li>'+
          '<li><a href="https://www.facebook.com/share/19Ywfe4EcE/" target="_blank" rel="noopener">Facebook</a></li>'+
          '<li><a href="https://www.instagram.com/theukairshowguide/" target="_blank" rel="noopener">Instagram</a></li>'+
        '</ul></div>'+
      '</div><p class="small">&copy; '+new Date().getFullYear()+' The Big Guide to RIAT, part of The Big Guide to UK Airshows. Details are checked against RIAT&rsquo;s own announcements; always confirm with RIAT before you book or travel.</p></div></footer>';
  }

  /* links marked data-go="tickets" etc. point at that page */
  Array.prototype.forEach.call(document.querySelectorAll('[data-go]'),function(a){
    var p=page(a.getAttribute('data-go'));if(!p)return;
    var h=a.getAttribute('data-hash')||'';
    a.setAttribute('href',href(p)+h);if(framed)a.setAttribute('target','_top');
  });

  /* ---------- in-page tabs ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'),function(box){
    var tabs=[].slice.call(box.querySelectorAll('[role="tab"]'));
    function show(t,focus){
      tabs.forEach(function(x){
        var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;
        document.getElementById(x.getAttribute('aria-controls')).hidden=!on;
      });
      if(focus)t.focus();
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){show(t);if(history.replaceState)history.replaceState(null,'','#'+t.getAttribute('aria-controls'))});
      t.addEventListener('keydown',function(e){
        var n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;
        if(n===null)return;e.preventDefault();show(tabs[(n+tabs.length)%tabs.length],true);
      });
    });
    function fromHash(){var hit=null;tabs.forEach(function(t){if(location.hash==='#'+t.getAttribute('aria-controls'))hit=t});return hit}
    show(fromHash()||tabs[0]);
    window.addEventListener('hashchange',function(){var t=fromHash();if(t){show(t);box.scrollIntoView({behavior:'smooth',block:'start'})}});
  });

  /* ---------- countdown ---------- */
  var c=document.getElementById('count');
  if(c){
    var show=new Date('2027-07-16T00:00:00+01:00').getTime();
    var tick=function(){
      var d=Math.max(0,show-Date.now()),days=Math.floor(d/864e5),hrs=Math.floor(d/36e5)%24,mins=Math.floor(d/6e4)%60;
      c.innerHTML='<div><b>'+days+'</b><small>days</small></div><div><b>'+hrs+'</b><small>hours</small></div><div><b>'+mins+'</b><small>mins</small></div>';
    };
    tick();setInterval(tick,30000);
  }

  /* ---------- saved tick lists ---------- */
  function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem('rg-'+k)||'null');localStorage.setItem('rg-'+k,JSON.stringify(v))}catch(e){return null}}
  var keys=[];
  Array.prototype.forEach.call(document.querySelectorAll('[data-store]'),function(l){var k=l.getAttribute('data-store');if(keys.indexOf(k)<0)keys.push(k)});
  keys.forEach(function(key){
    /* one key can span several lists (the packing list is split into columns) */
    var boxes=[].slice.call(document.querySelectorAll('[data-store="'+key+'"] input[type="checkbox"]'));
    var saved=store(key)||{};
    var bar=document.querySelector('[data-progress="'+key+'"]');
    function update(){
      var done=boxes.filter(function(b){return b.checked}).length;
      if(bar)bar.innerHTML='<span class="pbar"><i style="width:'+(boxes.length?done/boxes.length*100:0)+'%"></i></span><b>'+done+' of '+boxes.length+' done</b>';
    }
    boxes.forEach(function(b,i){
      var id=b.value||String(i);b.checked=!!saved[id];
      b.addEventListener('change',function(){saved[id]=b.checked;store(key,saved);update()});
    });
    var reset=document.querySelector('[data-reset="'+key+'"]');
    if(reset)reset.addEventListener('click',function(){saved={};store(key,saved);boxes.forEach(function(b){b.checked=false});update()});
    update();
  });

  /* ---------- trip cost planner ---------- */
  var bf=document.getElementById('budget');
  if(bf){
    var rows=[].slice.call(bf.querySelectorAll('[data-row]')),out=document.getElementById('budget-total'),per=document.getElementById('budget-per');
    var people=bf.querySelector('[name="people"]');
    var bs=store('budget')||{};
    [].slice.call(bf.querySelectorAll('input')).forEach(function(inp){if(bs[inp.name]!==undefined)inp.value=bs[inp.name]});
    var gbp=function(n){return '£'+n.toFixed(2).replace(/\.00$/,'')};
    function calc(){
      var tot=0,save={};
      [].slice.call(bf.querySelectorAll('input')).forEach(function(inp){save[inp.name]=inp.value});
      store('budget',save);
      rows.forEach(function(r){
        var q=parseFloat(r.querySelector('.q').value)||0,p=parseFloat(r.querySelector('.p').value)||0,t=q*p;
        r.querySelector('.t').textContent=gbp(t);tot+=t;
      });
      out.textContent=gbp(tot);
      var n=parseFloat(people.value)||0;per.textContent=n>0?gbp(tot/n)+' each':'';
    }
    bf.addEventListener('input',calc);
    var br=document.getElementById('budget-reset');
    if(br)br.addEventListener('click',function(){store('budget',{});bf.reset();calc()});
    calc();
  }

  /* ---------- which station suits me ---------- */
  var st=document.getElementById('station-tool');
  if(st){
    var S={
      london:['Andover or Salisbury','South Western Railway runs direct from London Waterloo to both. Andover is the shorter ride; Salisbury has more trains and a bigger choice of hotels.'],
      southeast:['Andover or Salisbury','Get into London (or Clapham Junction) and change for a South Western Railway train from Waterloo. From Sussex and Hampshire you can also come along the coast to Southampton and change for Salisbury.'],
      south:['Salisbury','Direct GWR trains run from Portsmouth and Southampton to Salisbury.'],
      southwest:['Salisbury','South Western Railway runs from Exeter through Yeovil to Salisbury, and GWR from Bristol and Bath.'],
      wales:['Salisbury','GWR runs from Cardiff and Newport through Bristol and Bath to Salisbury.'],
      cotswolds:['Swindon','RIAT plans a Swindon Shuttle. GWR serves Swindon from Cheltenham, Gloucester and Kemble, and from Bristol and Reading on the main line.'],
      midlands:['Andover, Salisbury or Swindon','CrossCountry trains from Birmingham run via Reading and Basingstoke (change for Andover) to Southampton (change for Salisbury). Or come via Bristol or Reading to Swindon.'],
      north:['Andover or Salisbury','CrossCountry from Manchester, Sheffield, Leeds and the North East runs via Birmingham to Basingstoke (change for Andover) and Southampton (change for Salisbury). Via London is often just as quick.'],
      scotland:['Salisbury or Andover','Get to London (or Birmingham for CrossCountry) and follow the London or Midlands route. Flying? Southampton and Bristol airports are the nearest.']
    };
    var sel=st.querySelector('select'),res=st.querySelector('.result');
    sel.addEventListener('change',function(){
      var r=S[sel.value];
      res.innerHTML=r?'<span class="k red">Suggested</span><h3>'+r[0]+'</h3><p>'+r[1]+'</p><p class="fine">Shuttle routes and times are still to be announced, so check before you buy train tickets.</p>':'';
    });
  }

  /* ---------- photo settings helper ---------- */
  var ph=document.getElementById('photo-tool');
  if(ph){
    var P={
      jet:['Fast jets and display teams','1/1000s to 1/2000s','Shutter priority, f/8 to f/11, auto ISO','Freeze the action. Use continuous autofocus and burst mode, and pan smoothly with the aircraft. Watch for vapour on humid days in the high-g turns.'],
      prop:['Propeller aircraft','1/160s to 1/250s','Shutter priority, low ISO, stop down to f/11 to f/16 in bright sun','A slow shutter shows a full disc of prop blur, which looks far better than frozen blades. Your panning has to be smooth, so shoot plenty of frames.'],
      heli:['Helicopters','1/60s to 1/125s','Shutter priority, low ISO, an ND filter helps on bright days','Rotor blades turn slowly, so you need a slower shutter than for props to show movement. Brace yourself and keep panning through the shot.'],
      heavy:['Big transports and tankers','1/500s to 1/1000s','Aperture f/8, auto ISO','Bigger and slower, so easier to track. A wider focal length works for close passes, and you may want to step back for the whole airframe.'],
      static:['Static park and crews','Any, with good light','Aperture priority, f/8 for detail, f/2.8 to f/4 for portraits','Go early before the crowds build. A wide or standard zoom works best close to the aircraft. Always ask crews before taking portraits.']
    };
    var ps=ph.querySelector('select'),pr=ph.querySelector('.result');
    function phshow(){var r=P[ps.value];pr.innerHTML='<h3>'+r[0]+'</h3><dl class="kv"><div><dt>Shutter</dt><dd>'+r[1]+'</dd></div><div><dt>Settings</dt><dd>'+r[2]+'</dd></div></dl><p>'+r[3]+'</p>'}
    ps.addEventListener('change',phshow);phshow();
  }
})();
