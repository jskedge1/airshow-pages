/* UK Airshow Guide widgets. One file, twenty small tools.
   Put <div class="ukag-widget" data-widget="countdown" data-show="riat"></div> on a page and load this file once.
   Works in a normal page and inside the airshow-page element's shadow root. No dashes in copy.
   Show dates in CAL are copied from uk-airshow-calendar.html (the D list). Update both together. */
(function(){
'use strict';
var SITE='https://www.ukairshowguide.co.uk/';
var cs=document.currentScript, BASE='https://jskedge1.github.io/airshow-pages/';
if(cs&&cs.src&&/widgets\/ukag-widgets\.js/.test(cs.src)) BASE=cs.src.replace(/widgets\/ukag-widgets\.js.*$/,'');
var YEAR=2027, MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], MONL=['January','February','March','April','May','June','July','August','September','October','November','December'], DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
/* month (0 = Jan), first day, last month, last day, name, venue, county, featured, free to watch */
var CAL=/*CAL*/[[4,8,4,8,"Duxford Flying Day: VE Day","IWM Duxford","Cambridgeshire",1,0],[4,9,4,9,"Shuttleworth Season Premiere Air Show","Old Warden Aerodrome, Biggleswade","Bedfordshire",1,0],[4,29,4,29,"Shuttleworth Military Air Show","Old Warden Aerodrome, Biggleswade","Bedfordshire",1,0],[5,4,5,6,"English Riviera Airshow","Paignton Green and seafront, Torbay","Devon",0,1],[5,4,5,6,"Midlands Air Festival","Ragley Hall, Alcester","Warwickshire",1,0],[5,5,5,5,"Duxford Flying Day: D Day","IWM Duxford","Cambridgeshire",1,0],[5,12,5,12,"Abingdon (Air) Country Show","Abingdon Airfield","Oxfordshire",0,0],[5,13,5,13,"Royal Air Force Air Show","RAF Cosford","Shropshire",1,0],[5,18,5,20,"Lancaster & Morecambe Armed Forces Weekend","Morecambe Promenade","Lancashire",0,1],[5,18,5,20,"Weston Park Air International","Weston Park, near Shifnal","Staffordshire",0,0],[5,19,5,20,"Duxford Summer Air Show","IWM Duxford","Cambridgeshire",1,0],[5,26,5,26,"Scarborough Armed Forces Day","South Bay, Scarborough","North Yorkshire",0,1],[5,26,5,27,"Headcorn International Airshow","Headcorn Aerodrome","Kent",1,0],[5,26,5,27,"Shuttleworth Festival of Flight","Old Warden Aerodrome, Biggleswade","Bedfordshire",1,0],[5,26,5,27,"Heveningham Hall Country Fair & Concours","Heveningham Hall, near Halesworth","Suffolk",0,0],[6,2,6,4,"Capel Military Show","Aldhurst Farm, Capel","Surrey",0,0],[6,10,6,10,"Wallop Wheels & Wings","Army Flying Museum, Middle Wallop","Hampshire",0,0],[6,10,6,10,"Battle Proms","Burghley House, near Stamford","Cambridgeshire",0,0],[6,15,6,18,"Goodwood Festival of Speed","Goodwood Estate, Chichester","West Sussex",0,0],[6,16,6,18,"Royal International Air Tattoo","MOD Boscombe Down","Wiltshire",1,0],[6,17,6,17,"Battle Proms","Hatfield Park, Hatfield","Hertfordshire",0,0],[6,24,6,24,"Shuttleworth Summer Air Show","Old Warden Aerodrome, Biggleswade","Bedfordshire",1,0],[6,31,6,31,"Battle Proms","Highclere Castle, near Newbury","Hampshire",0,0],[6,31,7,1,"Withernsea Blue Light Weekend","South Promenade, Withernsea","East Riding of Yorkshire",0,1],[6,31,7,7,"Swanage Carnival","Swanage Bay","Dorset",0,1],[7,6,7,15,"Falmouth Week","Falmouth harbour and seafront","Cornwall",0,1],[7,12,7,15,"Airbourne: Eastbourne International Airshow","Eastbourne seafront","East Sussex",1,1],[7,13,7,15,"Bristol International Balloon Fiesta","Ashton Court Estate","Bristol",0,0],[7,14,7,14,"Duxford Flying Evening","IWM Duxford","Cambridgeshire",1,0],[7,14,7,14,"G George 1940s Weekend","Breighton Aerodrome, near Selby","East Riding of Yorkshire",0,0],[7,14,7,14,"Shuttleworth Wings & Wheels Air Show","Old Warden Aerodrome, Biggleswade","Bedfordshire",1,0],[7,14,7,15,"Sleap 1940s Weekender","Sleap Airfield, Harmer Hill","Shropshire",0,0],[7,14,7,16,"Whitby Regatta","Whitby harbour and seafront","North Yorkshire",0,1],[7,18,7,18,"Cromer Carnival Air Displays","Cromer seafront","Norfolk",0,1],[7,26,7,27,"Clacton Airshow","West Greensward, Clacton on Sea","Essex",1,1],[7,28,7,28,"Shuttleworth Flying Proms","Old Warden Aerodrome, Biggleswade","Bedfordshire",1,0],[7,28,7,30,"Military Odyssey","Kent Showground, Detling","Kent",0,0],[7,29,7,29,"Little Gransden Air & Car Show","Little Gransden Airfield","Cambridgeshire",1,0],[8,3,8,4,"International Ayr Show: Festival of Flight","Ayr seafront","South Ayrshire",1,1],[8,3,8,5,"Chatsworth Country Fair","Chatsworth House, near Bakewell","Derbyshire",0,0],[8,3,8,5,"The Victory Show","Foxlands Farm, Cosby","Leicestershire",0,0],[8,9,8,9,"Jersey International Air Display","St Aubin's Bay, St Helier","Jersey",0,1],[8,11,8,12,"Duxford Battle of Britain Air Show","IWM Duxford","Cambridgeshire",1,0],[8,17,8,19,"Goodwood Revival","Goodwood Motor Circuit, Chichester","West Sussex",0,0],[8,25,8,25,"Shuttleworth Season Finale Air Show","Old Warden Aerodrome, Biggleswade","Bedfordshire",1,0],[9,2,9,2,"Duxford Flying Finale","IWM Duxford","Cambridgeshire",1,0]];
/* featured shows: key, name, place, lat, lon, Wix slug, type, words that find its dates in CAL */
var SHOWS=[
 ['duxford','Duxford Air Shows','IWM Duxford, Cambridgeshire',52.091,0.132,'duxfordairshows','vintage','Duxford'],
 ['shuttleworth','Shuttleworth Air Shows','Old Warden, Bedfordshire',52.087,-0.318,'shuttleworthairshows','vintage','Shuttleworth'],
 ['midlands','Midlands Air Festival','Ragley Hall, Alcester',52.197,-1.898,'midlandsairfestival','family','Midlands Air Festival'],
 ['cosford','RAF Cosford Air Show','RAF Cosford, Shropshire',52.640,-2.305,'cosfordairshow','military','Royal Air Force Air Show'],
 ['headcorn','Headcorn Airshow','Headcorn Aerodrome, Kent',51.157,0.642,'headcorn-air-show','family','Headcorn'],
 ['riat','Royal International Air Tattoo','MOD Boscombe Down, Wiltshire',51.152,-1.747,'riat','military','Royal International Air Tattoo'],
 ['eastbourne','Eastbourne Airshow','Western Lawns, Eastbourne',50.763,0.287,'eastbourneairshow','seaside','Eastbourne'],
 ['clacton','Clacton Air Show','West Greensward, Clacton',51.786,1.150,'clactonairshow','seaside','Clacton'],
 ['gransden','Little Gransden Air & Car Show','Little Gransden Airfield',52.167,-0.154,'little-gransden-air-and-car-show','family','Little Gransden'],
 ['ayr','International Ayr Show','Low Green, Ayr',55.461,-4.640,'international-ayr-show','seaside','International Ayr Show'],
 ['wales','Wales National Airshow','Swansea Bay',51.613,-3.958,'walesairshow','seaside','Wales National'],
 ['blackpool','Blackpool Air Show','Central Pier, Blackpool',53.811,-3.057,'blackpool-air-show','seaside','Blackpool'],
 ['southport','Southport Air Show','Southport beach and pier',53.655,-3.015,'southport-air-show','seaside','Southport']
].map(function(a){
  var ev=CAL.filter(function(c){return c[7]&&c[4].indexOf(a[7])>=0;}).map(function(c){
    return {s:new Date(YEAR,c[0],c[1]),e:new Date(YEAR,c[2],c[3]),name:c[4]};});
  return {k:a[0],name:a[1],place:a[2],lat:a[3],lon:a[4],url:SITE+a[5],type:a[6],ev:ev};
});
function show(k){for(var i=0;i<SHOWS.length;i++)if(SHOWS[i].k===k)return SHOWS[i];return null;}
function today(){var d=new Date();d.setHours(0,0,0,0);return d;}
function nextEv(s){var t=today();for(var i=0;i<s.ev.length;i++)if(s.ev[i].e>=t)return s.ev[i];return null;}
function fmtRange(ev){var a=ev.s,b=ev.e;
  if(+a===+b)return DAYS[a.getDay()]+' '+a.getDate()+' '+MONL[a.getMonth()];
  if(a.getMonth()===b.getMonth())return a.getDate()+' to '+b.getDate()+' '+MONL[a.getMonth()];
  return a.getDate()+' '+MON[a.getMonth()]+' to '+b.getDate()+' '+MON[b.getMonth()];}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function q(s,r){return r.querySelector(s);} function qa(s,r){return [].slice.call(r.querySelectorAll(s));}
function load(k,d){try{var v=localStorage.getItem('ukw-'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function save(k,v){try{localStorage.setItem('ukw-'+k,JSON.stringify(v));}catch(e){}}
function num(v,d){v=parseFloat(v);return isFinite(v)?v:d;}
function pad(n){return (n<10?'0':'')+n;}
function showOptions(sel,all){return (all?'<option value="">'+all+'</option>':'')+SHOWS.map(function(s){return '<option value="'+s.k+'"'+(s.k===sel?' selected':'')+'>'+esc(s.name)+'</option>';}).join('');}
function frame(el,k,t,body){el.innerHTML='<div class="ukw"><div class="ukw-h"><span class="ukw-k">'+k+'</span><span class="ukw-t">'+t+'</span></div><div class="ukw-b">'+body+'</div></div>';return q('.ukw-b',el);}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
var JET='<svg viewBox="0 0 100 106" aria-hidden="true"><path fill="currentColor" d="M50 2c3 6 5 16 6 28l4 14 32 34v8L60 76l-2 14 12 10v4l-20-4-20 4v-4l12-10-2-14L8 86v-8l32-34 4-14c1-12 3-22 6-28z"/></svg>';

var W={};

/* 1 countdown */
W.countdown=function(el,o){
  var b=frame(el,'COUNTDOWN','Days To The Show','<select class="ukw-in" aria-label="Pick a show">'+showOptions(o.show)+'</select><div class="ukw-cd"></div><div class="ukw-note"></div><a class="ukw-btn" target="_top">Open the show guide</a>');
  var sel=q('select',b),box=q('.ukw-cd',b),note=q('.ukw-note',b),a=q('a',b);
  if(o.show&&show(o.show))sel.style.display='none'; else sel.value=load('cd',SHOWS[0].k);
  function tick(){var s=show(sel.value)||SHOWS[0],ev=nextEv(s);a.href=s.url;
    if(!ev){box.innerHTML='<div class="ukw-big">Date to be confirmed</div>';note.textContent=s.name+'. I add the date as soon as the organiser announces it.';return;}
    var ms=ev.s-new Date();
    if(ms<=0){box.innerHTML='<div class="ukw-big">It is show time</div>';note.textContent=ev.name+', '+fmtRange(ev);return;}
    var d=Math.floor(ms/864e5),h=Math.floor(ms/36e5)%24,m=Math.floor(ms/6e4)%60,sc=Math.floor(ms/1e3)%60;
    box.innerHTML=[[d,'Days'],[pad(h),'Hrs'],[pad(m),'Mins'],[pad(sc),'Secs']].map(function(x){return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>';}).join('');
    note.textContent=ev.name+', '+fmtRange(ev)+' '+YEAR;}
  sel.onchange=function(){save('cd',sel.value);tick();};tick();setInterval(tick,1000);
};

/* 2 nearest show */
function miles(a,b,c,d){var R=3958.8,r=Math.PI/180,x=Math.sin((c-a)*r/2),y=Math.sin((d-b)*r/2),h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y;return 2*R*Math.asin(Math.sqrt(h));}
function findPlace(pc){pc=pc.replace(/\s+/g,'');
  return fetch('https://api.postcodes.io/postcodes/'+encodeURIComponent(pc)).then(function(r){return r.json();}).then(function(j){
    if(j&&j.result)return j.result;
    return fetch('https://api.postcodes.io/outcodes/'+encodeURIComponent(pc)).then(function(r){return r.json();}).then(function(k){if(k&&k.result)return k.result;throw new Error('none');});});}
W.nearest=function(el){
  var b=frame(el,'FIND YOUR SHOW','Which Show Is Nearest?','<form class="ukw-row"><input class="ukw-in" placeholder="Your postcode" aria-label="Your postcode" maxlength="8" value="'+esc(load('pc',''))+'"><button class="ukw-btn">Find</button></form><div class="ukw-out"><p class="ukw-note">Type a postcode, or just the first half, and I will list the featured shows nearest to you.</p></div>');
  var out=q('.ukw-out',b),inp=q('input',b);
  q('form',b).onsubmit=function(e){e.preventDefault();var pc=inp.value.trim();if(!pc)return;out.innerHTML='<p class="ukw-note">Looking that up.</p>';
    findPlace(pc).then(function(p){save('pc',pc.toUpperCase());
      var list=SHOWS.map(function(s){return {s:s,m:miles(p.latitude,p.longitude,s.lat,s.lon)};}).sort(function(x,y){return x.m-y.m;}).slice(0,5);
      out.innerHTML='<ol class="ukw-list">'+list.map(function(x,i){var ev=nextEv(x.s);return '<li><span class="ukw-n">'+(i+1)+'</span><div><b>'+esc(x.s.name)+'</b><small>'+esc(x.s.place)+' &middot; '+(ev?fmtRange(ev):'Date to be confirmed')+'</small></div><div class="ukw-mi"><b>'+Math.round(x.m)+'</b> miles</div><a href="'+x.s.url+'" target="_top">Guide</a></li>';}).join('')+'</ol><p class="ukw-note">Miles are in a straight line, so the drive will be longer.</p>';
    }).catch(function(){out.innerHTML='<p class="ukw-note ukw-bad">I could not find that postcode. Check it and try again.</p>';});};
};

/* 3 weather */
var WX=[[0,'Clear','sun'],[2,'Bright spells','part'],[3,'Cloudy','cloud'],[48,'Fog','fog'],[57,'Drizzle','rain'],[67,'Rain','rain'],[77,'Snow','snow'],[82,'Showers','rain'],[86,'Snow showers','snow'],[99,'Thunder','storm']];
var ICON={sun:'<circle cx="12" cy="12" r="5" fill="#f5a623"/><g stroke="#f5a623" stroke-width="2" stroke-linecap="round"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></g>',
 part:'<circle cx="8" cy="9" r="4" fill="#f5a623"/><path d="M8 19h9a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10 2 3 3 0 0 0 1 6z" fill="#9db0be"/>',
 cloud:'<path d="M6 18h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11 2 3.5 3.5 0 0 0 0 7z" fill="#9db0be"/>',
 fog:'<g stroke="#9db0be" stroke-width="2" stroke-linecap="round"><path d="M4 8h16M6 12h14M4 16h14"/></g>',
 rain:'<path d="M6 14h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11 2 3.5 3.5 0 0 0 0 7z" fill="#9db0be"/><g stroke="#1d63b7" stroke-width="2" stroke-linecap="round"><path d="M8 17l-1 4M12 17l-1 4M16 17l-1 4"/></g>',
 snow:'<path d="M6 14h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11 2 3.5 3.5 0 0 0 0 7z" fill="#9db0be"/><g fill="#7fb8e6"><circle cx="8" cy="19" r="1.4"/><circle cx="12" cy="20" r="1.4"/><circle cx="16" cy="19" r="1.4"/></g>',
 storm:'<path d="M6 14h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11 2 3.5 3.5 0 0 0 0 7z" fill="#5a6b78"/><path d="M12 14l-3 5h3l-1 4 4-6h-3l1-3z" fill="#f5a623"/>'};
function wx(c){for(var i=0;i<WX.length;i++)if(c<=WX[i][0])return WX[i];return WX[2];}
var COMP=['N','NE','E','SE','S','SW','W','NW'];
W.weather=function(el,o){
  var b=frame(el,'WEATHER','At The Show Ground','<select class="ukw-in" aria-label="Pick a show">'+showOptions(o.show)+'</select><div class="ukw-out"></div>');
  var sel=q('select',b),out=q('.ukw-out',b);if(o.show&&show(o.show))sel.style.display='none';else sel.value=load('wx',SHOWS[0].k);
  function go(){var s=show(sel.value)||SHOWS[0];save('wx',s.k);out.innerHTML='<p class="ukw-note">Getting the forecast for '+esc(s.place)+'.</p>';
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+s.lat+'&longitude='+s.lon+'&daily=weather_code,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,uv_index_max&timezone=Europe%2FLondon&wind_speed_unit=mph&forecast_days=7')
    .then(function(r){return r.json();}).then(function(j){var d=j.daily;if(!d)throw 0;
      out.innerHTML='<div class="ukw-wx">'+d.time.map(function(t,i){var dt=new Date(t+'T12:00:00'),w=wx(d.weather_code[i]),on=s.ev.some(function(e){return dt>=e.s&&dt<=new Date(+e.e+864e5);});
        return '<div class="'+(on?'on':'')+'"><span>'+(i===0?'Today':DAYS[dt.getDay()])+'</span><svg viewBox="0 0 24 24">'+ICON[w[2]]+'</svg><b>'+Math.round(d.temperature_2m_max[i])+'&deg;</b><small>'+w[1]+'</small><small>Rain '+(d.precipitation_probability_max[i]==null?0:d.precipitation_probability_max[i])+'%</small><small>'+Math.round(d.wind_speed_10m_max[i])+' mph '+COMP[Math.round(d.wind_direction_10m_dominant[i]/45)%8]+'</small><small>UV '+Math.round(d.uv_index_max[i]||0)+'</small></div>';}).join('')+'</div><p class="ukw-note">'+esc(s.place)+'. Seven day forecast from Open Meteo'+(s.ev.length?', with show days marked in teal when they are in range.':'.')+' A forecast is only a guide, so check again the night before.</p>';
    }).catch(function(){out.innerHTML='<p class="ukw-note ukw-bad">The forecast will not load right now. Try again in a minute.</p>';});}
  sel.onchange=go;go();
};

/* 4 sun compass */
function sunPos(ms,lat,lon){var r=Math.PI/180,d=(ms-946728000000)/864e5,L=(280.46+0.9856474*d)%360,g=(357.528+0.9856003*d)*r,
  lam=(L+1.915*Math.sin(g)+0.02*Math.sin(2*g))*r,ep=(23.439-4e-7*d)*r,ra=Math.atan2(Math.cos(ep)*Math.sin(lam),Math.cos(lam)),dec=Math.asin(Math.sin(ep)*Math.sin(lam)),
  ha=((18.697374558+24.06570982441908*d)*15+lon)*r-ra,la=lat*r,
  alt=Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(ha)),az=Math.atan2(-Math.sin(ha),Math.tan(dec)*Math.cos(la)-Math.sin(la)*Math.cos(ha));
  return {alt:alt/r,az:(az/r+360)%360};}
function ukOffset(dt){try{var h=+new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'numeric',hour12:false}).format(new Date(Date.UTC(dt.getFullYear(),dt.getMonth(),dt.getDate(),12)));return h-12;}catch(e){return 1;}}
function hm(mins){mins=Math.round(mins);return pad(Math.floor(mins/60))+':'+pad(mins%60);}
W.sun=function(el,o){
  var b=frame(el,'PHOTOGRAPHY','Where Is The Sun?','<select class="ukw-in" aria-label="Pick a show">'+showOptions(o.show)+'</select><div class="ukw-sun"><svg viewBox="0 0 200 200" class="ukw-comp"></svg><div class="ukw-sunr"></div></div><label class="ukw-lab">Time of day <b class="ukw-time"></b><input type="range" min="300" max="1320" step="10" value="840"></label><p class="ukw-note"></p>');
  var sel=q('select',b),svg=q('svg',b),side=q('.ukw-sunr',b),rng=q('input',b),tm=q('.ukw-time',b),note=q('.ukw-note',b);
  if(o.show&&show(o.show))sel.style.display='none';else sel.value=load('sun',SHOWS[0].k);
  function draw(){var s=show(sel.value)||SHOWS[0],ev=nextEv(s),day=ev?ev.s:today(),off=ukOffset(day),base=Date.UTC(day.getFullYear(),day.getMonth(),day.getDate())-off*36e5,
    mins=+rng.value,p=sunPos(base+mins*6e4,s.lat,s.lon),rise=null,set=null,prev=sunPos(base,s.lat,s.lon).alt;
    for(var m=1;m<=1440;m++){var a=sunPos(base+m*6e4,s.lat,s.lon).alt;if(prev<-0.83&&a>=-0.83)rise=m;if(prev>=-0.83&&a<-0.83)set=m;prev=a;}
    var rad=(90-Math.max(p.alt,0))/90*78,x=100+rad*Math.sin(p.az*Math.PI/180),y=100-rad*Math.cos(p.az*Math.PI/180),up=p.alt>0;
    var sx=100-60*Math.sin(p.az*Math.PI/180),sy=100+60*Math.cos(p.az*Math.PI/180);
    svg.innerHTML='<circle cx="100" cy="100" r="80" fill="#f3f6f8" stroke="#c9d6e0" stroke-width="2"/><circle cx="100" cy="100" r="40" fill="none" stroke="#dce6ee"/><path d="M100 20v160M20 100h160" stroke="#dce6ee"/>'+
     '<text x="100" y="14" class="c">N</text><text x="194" y="104" class="c">E</text><text x="100" y="198" class="c">S</text><text x="6" y="104" class="c">W</text>'+
     (up?'<line x1="100" y1="100" x2="'+sx.toFixed(1)+'" y2="'+sy.toFixed(1)+'" stroke="#13293c" stroke-width="5" stroke-linecap="round" opacity=".28"/>':'')+
     '<circle cx="100" cy="100" r="5" fill="#13293c"/><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="11" fill="'+(up?'#f5a623':'#7f93a3')+'" stroke="#fff" stroke-width="2"/>';
    tm.textContent=hm(mins);
    side.innerHTML='<div><span>Sun is in the</span><b>'+(up?COMP[Math.round(p.az/45)%8]:'Set')+'</b></div><div><span>Height</span><b>'+(up?Math.round(p.alt)+'&deg;':'Below')+'</b></div><div><span>Sunrise</span><b>'+(rise==null?'None':hm(rise))+'</b></div><div><span>Sunset</span><b>'+(set==null?'None':hm(set))+'</b></div>';
    note.textContent=s.place+', '+(ev?fmtRange(ev)+' '+YEAR:'today')+'. You are the dot in the middle and the grey line is your shadow. Stand so the shadow points at the aircraft and they will be lit from the front.';}
  sel.onchange=function(){save('sun',sel.value);draw();};rng.oninput=draw;draw();
};

/* 5 leave home planner */
W.leave=function(el){
  var v=load('leave',{gate:'08:30',drive:90,queue:30,walk:15,stops:15});
  var b=frame(el,'GETTING THERE','When Should I Leave Home?','<div class="ukw-grid">'+
   '<label class="ukw-lab">I want to be through the gate by<input class="ukw-in" type="time" data-k="gate" value="'+v.gate+'"></label>'+
   '<label class="ukw-lab">Drive time in minutes<input class="ukw-in" type="number" min="0" data-k="drive" value="'+v.drive+'"></label>'+
   '<label class="ukw-lab">Queue near the show in minutes<input class="ukw-in" type="number" min="0" data-k="queue" value="'+v.queue+'"></label>'+
   '<label class="ukw-lab">Stops on the way in minutes<input class="ukw-in" type="number" min="0" data-k="stops" value="'+v.stops+'"></label>'+
   '<label class="ukw-lab">Walk from the car park in minutes<input class="ukw-in" type="number" min="0" data-k="walk" value="'+v.walk+'"></label></div><div class="ukw-res"></div><p class="ukw-note">These are your own numbers, so change them to suit your trip. I always add more queue time for the biggest shows.</p>');
  var res=q('.ukw-res',b);
  function calc(){qa('[data-k]',b).forEach(function(i){v[i.dataset.k]=i.type==='time'?i.value:num(i.value,0);});save('leave',v);
    var g=(v.gate||'08:30').split(':'),t=(+g[0])*60+(+g[1])-v.drive-v.queue-v.walk-v.stops,dayb=t<0;t=((t%1440)+1440)%1440;
    res.innerHTML='<span>Leave home at</span><b>'+hm(t)+'</b><small>'+(dayb?'That is the evening before, so think about staying nearby.':'Total journey '+Math.floor((v.drive+v.queue+v.walk+v.stops)/60)+' hr '+((v.drive+v.queue+v.walk+v.stops)%60)+' min door to gate.')+'</small>';}
  b.addEventListener('input',calc);calc();
};

/* 6 fuel cost */
W.fuel=function(el){
  var v=load('fuel',{miles:80,mpg:45,price:140,people:2});
  var b=frame(el,'BUDGET','What Will The Fuel Cost?','<div class="ukw-grid">'+
   '<label class="ukw-lab">Miles each way<input class="ukw-in" type="number" min="0" data-k="miles" value="'+v.miles+'"></label>'+
   '<label class="ukw-lab">Miles per gallon<input class="ukw-in" type="number" min="1" data-k="mpg" value="'+v.mpg+'"></label>'+
   '<label class="ukw-lab">Pence per litre<input class="ukw-in" type="number" min="0" step="0.1" data-k="price" value="'+v.price+'"></label>'+
   '<label class="ukw-lab">People in the car<input class="ukw-in" type="number" min="1" data-k="people" value="'+v.people+'"></label></div><div class="ukw-res"></div><p class="ukw-note">There and back. Type in your own car and the price at your local pump.</p>');
  var res=q('.ukw-res',b);
  function calc(){qa('[data-k]',b).forEach(function(i){v[i.dataset.k]=num(i.value,0);});save('fuel',v);
    var litres=v.mpg>0?v.miles*2/v.mpg*4.546:0,cost=litres*v.price/100,pp=cost/Math.max(1,v.people);
    res.innerHTML='<span>Fuel for the round trip</span><b>&pound;'+cost.toFixed(2)+'</b><small>'+litres.toFixed(1)+' litres, or &pound;'+pp.toFixed(2)+' each between '+Math.max(1,v.people)+'.</small>';}
  b.addEventListener('input',calc);calc();
};

/* 7 split the cost */
W.split=function(el){
  var v=load('split',{people:4,rows:[['Tickets',0],['Fuel and parking',0],['Food and drink',0],['Somewhere to stay',0]]});
  var b=frame(el,'BUDGET','Split The Cost','<div class="ukw-rows"></div><button class="ukw-link" type="button" data-a="add">Add a line</button><label class="ukw-lab ukw-inl">People sharing<input class="ukw-in" type="number" min="1" data-k="people" value="'+v.people+'"></label><div class="ukw-res"></div><p class="ukw-note">Saved on this device only, so you can come back to it.</p>');
  var rows=q('.ukw-rows',b),res=q('.ukw-res',b);
  function draw(){rows.innerHTML=v.rows.map(function(r,i){return '<div class="ukw-row"><input class="ukw-in" data-i="'+i+'" data-f="0" aria-label="What it is" value="'+esc(r[0])+'"><span class="ukw-pound">&pound;</span><input class="ukw-in ukw-sm" type="number" min="0" step="0.01" data-i="'+i+'" data-f="1" aria-label="Cost in pounds" value="'+(r[1]||'')+'" placeholder="0"><button class="ukw-x" type="button" data-del="'+i+'" aria-label="Remove this line">&times;</button></div>';}).join('');calc();}
  function calc(){var t=v.rows.reduce(function(a,r){return a+num(r[1],0);},0),p=Math.max(1,num(v.people,1));save('split',v);
    res.innerHTML='<span>Each person pays</span><b>&pound;'+(t/p).toFixed(2)+'</b><small>Total &pound;'+t.toFixed(2)+' between '+p+'.</small>';}
  b.addEventListener('input',function(e){var t=e.target;if(t.dataset.i!=null)v.rows[+t.dataset.i][+t.dataset.f]=t.dataset.f==='1'?num(t.value,0):t.value;if(t.dataset.k)v.people=num(t.value,1);calc();});
  b.addEventListener('click',function(e){var t=e.target;if(t.dataset.a==='add'){v.rows.push(['',0]);draw();}if(t.dataset.del!=null){v.rows.splice(+t.dataset.del,1);draw();}});
  draw();
};

/* 8 which show quiz */
var TYPES={military:['Military Airbases','Fast jets, display teams and huge static parks on working airfields. The biggest days of the season.'],
 seaside:['Seaside Shows','Free to watch from the beach or the prom, with the flying over the sea. Bring a chair and get there early.'],
 vintage:['Historic And Vintage','Spitfires, biplanes and warbirds at the home of historic flying. Smaller crowds and closer to the aircraft.'],
 family:['Family And Grass Roots','Relaxed, friendly shows on country estates and grass airfields, often with cars, food and fun for kids too.']};
var QUIZ=[['What do you most want to see?',[['Fast jets and noise','military'],['Spitfires and old aircraft','vintage'],['A bit of everything','family'],['Displays over the sea','seaside']]],
 ['Who is coming with you?',[['Just me and my camera','vintage'],['Friends who love aircraft','military'],['Young children','family'],['Family who are not that into planes','seaside']]],
 ['How do you feel about crowds?',[['The bigger the better','military'],['I would rather have space','vintage'],['Fine if there is room for a picnic','family'],['Happy on a busy beach','seaside']]],
 ['What about the cost?',[['I will pay for a big day','military'],['Free to watch would be ideal','seaside'],['A fair price for a relaxed day','family'],['Worth it to get close to the aircraft','vintage']]]];
W.quiz=function(el){
  var b=frame(el,'HELP CHOOSING','Which Show Suits You?','<div class="ukw-out"></div>'),out=q('.ukw-out',b),step=0,score={};
  function draw(){if(step<QUIZ.length){var Q=QUIZ[step];
    out.innerHTML='<div class="ukw-prog"><i style="width:'+(step/QUIZ.length*100)+'%"></i></div><p class="ukw-q">'+(step+1)+'. '+Q[0]+'</p><div class="ukw-opts">'+Q[1].map(function(a){return '<button type="button" class="ukw-opt" data-t="'+a[1]+'">'+a[0]+'</button>';}).join('')+'</div>';return;}
    var best=Object.keys(TYPES).sort(function(x,y){return (score[y]||0)-(score[x]||0);})[0],T=TYPES[best];
    out.innerHTML='<div class="ukw-match"><span>Your match</span><b>'+T[0]+'</b><p>'+T[1]+'</p></div><ul class="ukw-chips">'+SHOWS.filter(function(s){return s.type===best;}).map(function(s){return '<li><a href="'+s.url+'" target="_top">'+esc(s.name)+'</a></li>';}).join('')+'</ul><button type="button" class="ukw-link" data-again="1">Start again</button>';}
  out.addEventListener('click',function(e){var t=e.target;if(t.dataset.t){score[t.dataset.t]=(score[t.dataset.t]||0)+1;step++;draw();}if(t.dataset.again){step=0;score={};draw();}});draw();
};

/* 9 bingo */
var BINGO=['Smoke trail','Loop the loop','A wing walker','Parachutes','Formation of four','A biplane','A helicopter','Afterburner glow','A flypast','Ear defenders','A long lens','A picnic blanket','Ice cream queue','Someone in a flight suit','A folding chair','A wave from the pilot','Vapour off the wings','A barrel roll','A propeller aircraft','A jet aircraft','Two aircraft crossing','A commentator joke','A model aircraft stall','A dog in ear defenders'];
W.bingo=function(el){
  var st=load('bingo',null);if(!st||!st.c||st.c.length!==16)st={c:shuffle(BINGO).slice(0,16),on:[]};
  var b=frame(el,'SHOW DAY GAME','Airshow Bingo','<div class="ukw-bingo"></div><div class="ukw-res ukw-hide"></div><div class="ukw-row"><span class="ukw-note ukw-count"></span><button type="button" class="ukw-link">New card</button></div>');
  var g=q('.ukw-bingo',b),res=q('.ukw-res',b),cnt=q('.ukw-count',b);
  function lines(){var L=[],i;for(i=0;i<4;i++){L.push([i*4,i*4+1,i*4+2,i*4+3]);L.push([i,i+4,i+8,i+12]);}L.push([0,5,10,15]);L.push([3,6,9,12]);return L.filter(function(l){return l.every(function(x){return st.on.indexOf(x)>=0;});}).length;}
  function draw(){g.innerHTML=st.c.map(function(t,i){return '<button type="button" data-i="'+i+'" class="'+(st.on.indexOf(i)>=0?'on':'')+'" aria-pressed="'+(st.on.indexOf(i)>=0)+'">'+t+'</button>';}).join('');
    var n=lines();cnt.textContent=st.on.length+' of 16 spotted';res.className='ukw-res'+(n?'':' ukw-hide');res.innerHTML=st.on.length===16?'<b>Full house!</b><small>Every square spotted. What a day.</small>':'<b>Bingo!</b><small>'+n+(n===1?' line':' lines')+' complete. Keep going for a full house.</small>';save('bingo',st);}
  g.onclick=function(e){var i=e.target.dataset.i;if(i==null)return;i=+i;var k=st.on.indexOf(i);if(k>=0)st.on.splice(k,1);else st.on.push(i);draw();};
  q('.ukw-link',b).onclick=function(){st={c:shuffle(BINGO).slice(0,16),on:[]};draw();};draw();
};

/* 10 season at a glance */
W.season=function(el){
  var counts=[],m;for(m=4;m<=9;m++)counts.push([m,CAL.filter(function(c){return c[0]===m;}).length]);
  var max=Math.max.apply(null,counts.map(function(c){return c[1];}))||1,t=today(),cur=null;
  var up=CAL.filter(function(c){return new Date(YEAR,c[2],c[3])>=t;});if(up.length)cur=up[0][0];else cur=4;
  var b=frame(el,YEAR+' SEASON','The Season At A Glance','<div class="ukw-stat"><b>'+CAL.length+'</b><span>shows confirmed for '+YEAR+'</span></div><div class="ukw-bars">'+counts.map(function(c){return '<button type="button" data-m="'+c[0]+'"><em>'+c[1]+'</em><i style="height:'+Math.max(6,c[1]/max*70)+'px"></i>'+MON[c[0]]+'</button>';}).join('')+'</div><div class="ukw-out"></div><a class="ukw-btn" target="_top" href="'+SITE+'air-shows-guides">See every date</a>');
  var out=q('.ukw-out',b);
  function draw(){qa('.ukw-bars button',b).forEach(function(x){x.classList.toggle('on',+x.dataset.m===cur);});
    var list=CAL.filter(function(c){return c[0]===cur;});
    out.innerHTML='<p class="ukw-q">'+MONL[cur]+'</p><ul class="ukw-cal">'+list.map(function(c){return '<li><i>'+(c[1]===c[3]&&c[0]===c[2]?c[1]:c[1]+' to '+c[3])+'</i><div><b>'+esc(c[4])+'</b><small>'+esc(c[6])+(c[8]?' &middot; Free to watch':'')+(c[7]?' &middot; Featured guide':'')+'</small></div></li>';}).join('')+'</ul>';}
  q('.ukw-bars',b).onclick=function(e){var t=e.target.closest('button');if(t){cur=+t.dataset.m;draw();}};draw();
};

/* 11 add to calendar */
function ymd(d){return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());}
W.calendar=function(el,o){
  var evs=[];SHOWS.forEach(function(s){if(o.show&&show(o.show)&&s.k!==o.show)return;s.ev.forEach(function(e){evs.push({s:s,e:e});});});evs.sort(function(a,b){return a.e.s-b.e.s;});
  var t=today(),first=0;evs.some(function(x,i){if(x.e.e>=t){first=i;return true;}return false;});
  var b=frame(el,'SAVE THE DATE','Add A Show To My Calendar','<select class="ukw-in" aria-label="Pick a show date">'+evs.map(function(x,i){return '<option value="'+i+'"'+(i===first?' selected':'')+'>'+x.e.s.getDate()+' '+MON[x.e.s.getMonth()]+' &middot; '+esc(x.e.name)+'</option>';}).join('')+'</select><div class="ukw-res"></div><div class="ukw-row"><button type="button" class="ukw-btn" data-a="ics">Phone or Outlook</button><a class="ukw-btn ukw-alt" data-a="g" target="_blank" rel="noopener">Google Calendar</a></div><p class="ukw-note">Dates can change, so check the official show website before you book anything.</p>');
  var sel=q('select',b),res=q('.ukw-res',b),ga=q('[data-a=g]',b);
  function cur(){return evs[+sel.value];}
  function draw(){var x=cur(),end=new Date(+x.e.e+864e5+36e5);end.setHours(0,0,0,0);res.innerHTML='<span>'+esc(x.s.place)+'</span><b class="ukw-mid">'+esc(x.e.name)+'</b><small>'+fmtRange(x.e)+' '+YEAR+'</small>';
    ga.href='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(x.e.name)+'&dates='+ymd(x.e.s)+'/'+ymd(end)+'&location='+encodeURIComponent(x.s.place)+'&details='+encodeURIComponent('Plan your day: '+x.s.url);}
  q('[data-a=ics]',b).onclick=function(){var x=cur(),end=new Date(+x.e.e+864e5+36e5);end.setHours(0,0,0,0);
    var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:UK Airshow Guide','BEGIN:VEVENT','UID:'+x.s.k+ymd(x.e.s)+'@ukairshowguide.co.uk','DTSTAMP:'+ymd(new Date())+'T000000Z','DTSTART;VALUE=DATE:'+ymd(x.e.s),'DTEND;VALUE=DATE:'+ymd(end),'SUMMARY:'+x.e.name.replace(/,/g,'\\,'),'LOCATION:'+x.s.place.replace(/,/g,'\\,'),'DESCRIPTION:Plan your day: '+x.s.url,'URL:'+x.s.url,'END:VEVENT','END:VCALENDAR'].join('\r\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download=x.s.k+'-'+ymd(x.e.s)+'.ics';document.body.appendChild(a);a.click();a.remove();};
  sel.onchange=draw;if(evs.length)draw();
};

/* 12 share */
W.share=function(el,o){
  var url=o.url||(window.top===window?location.href:(document.referrer||SITE)),title=o.title||'The Big Guide to UK Airshows';if(/^file:|github\.io/.test(url))url=SITE;
  var e=encodeURIComponent,b=frame(el,'PASS IT ON','Send This Page To A Friend','<div class="ukw-share">'+(navigator.share?'<button type="button" class="ukw-btn" data-a="native">Share</button>':'')+
   '<a class="ukw-btn ukw-alt" target="_blank" rel="noopener" href="https://wa.me/?text='+e(title+' '+url)+'">WhatsApp</a><a class="ukw-btn ukw-alt" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u='+e(url)+'">Facebook</a><a class="ukw-btn ukw-alt" href="mailto:?subject='+e(title)+'&body='+e('I thought you would like this: '+url)+'">Email</a><button type="button" class="ukw-btn ukw-alt" data-a="copy">Copy link</button></div><p class="ukw-note ukw-url">'+esc(url)+'</p>');
  b.onclick=function(ev){var a=ev.target.dataset.a;if(a==='native')navigator.share({title:title,url:url}).catch(function(){});
    if(a==='copy'){var done=function(){ev.target.textContent='Copied';setTimeout(function(){ev.target.textContent='Copy link';},1600);};
      if(navigator.clipboard)navigator.clipboard.writeText(url).then(done,done);else{var t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();try{document.execCommand('copy');}catch(x){}t.remove();done();}}};
};

/* 13 call sign speller */
var NATO={A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliett',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'Xray',Y:'Yankee',Z:'Zulu',0:'Zero',1:'One',2:'Two',3:'Three',4:'Four',5:'Five',6:'Six',7:'Seven',8:'Eight',9:'Niner'};
W.callsign=function(el){
  var b=frame(el,'FOR YOUNG SPOTTERS','Say Your Name Like A Pilot','<input class="ukw-in" maxlength="14" placeholder="Type your name" aria-label="Type your name" value="'+esc(load('name',''))+'"><div class="ukw-nato"></div><p class="ukw-note">Pilots spell words out like this on the radio so nothing gets misheard over the engine noise.</p>');
  var inp=q('input',b),out=q('.ukw-nato',b);
  function draw(){var s=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,'');save('name',inp.value);
    out.innerHTML=s?s.split('').map(function(c){return '<span><b>'+c+'</b>'+NATO[c]+'</span>';}).join(''):'<span class="ukw-ghost"><b>J</b>Juliett</span><span class="ukw-ghost"><b>A</b>Alpha</span><span class="ukw-ghost"><b>C</b>Charlie</span><span class="ukw-ghost"><b>K</b>Kilo</span>';}
  inp.oninput=draw;draw();
};

/* 14 name that aircraft */
var AC=[['a10','Thunderbolt II'],['a7','Corsair II'],['apache','Apache'],['b52','Stratofortress'],['blackhawk','Black Hawk'],['canberra','Canberra'],['chinook','Chinook'],['do228','Dornier 228'],['f15ex','Eagle II'],['f35','Lightning II'],['jaguar','Jaguar'],['mirage4','Mirage IV'],['rafale','Rafale'],['tiger','Tiger'],['tornado','Tornado'],['typhoon','Typhoon'],['vulcan','Vulcan']];
W.aircraft=function(el){
  var b=frame(el,'QUIZ','Name That Aircraft','<div class="ukw-out"></div>'),out=q('.ukw-out',b),order,i,score,lock;
  function start(){order=shuffle(AC).slice(0,6);i=0;score=0;draw();}
  function draw(){lock=false;if(i>=order.length){var best=Math.max(load('acbest',0),score);save('acbest',best);
      out.innerHTML='<div class="ukw-match"><span>You scored</span><b>'+score+' out of '+order.length+'</b><p>'+(score===order.length?'Perfect. You know your aircraft.':score>=4?'Good eyes. A couple more shows and you will have them all.':'Plenty to learn, and the A to Z will help.')+' Best so far: '+best+'.</p></div><div class="ukw-row"><button type="button" class="ukw-btn" data-again="1">Play again</button><a class="ukw-btn ukw-alt" target="_top" href="'+SITE+'airshow-aircraft-a-to-z">Aircraft A To Z</a></div>';return;}
    var a=order[i],opts=shuffle([a].concat(shuffle(AC.filter(function(x){return x[0]!==a[0];})).slice(0,3)));
    out.innerHTML='<div class="ukw-prog"><i style="width:'+(i/order.length*100)+'%"></i></div><div class="ukw-pic"><img alt="An aircraft to name" src="'+BASE+'home-img/ac/'+a[0]+'.webp" draggable="false"></div><div class="ukw-opts">'+opts.map(function(x){return '<button type="button" class="ukw-opt" data-k="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>';}
  out.addEventListener('click',function(e){var t=e.target;if(t.dataset.again){start();return;}if(!t.dataset.k||lock)return;lock=true;var ok=t.dataset.k===order[i][0];if(ok)score++;
    qa('.ukw-opt',out).forEach(function(x){if(x.dataset.k===order[i][0])x.classList.add('good');else if(x===t)x.classList.add('bad');});setTimeout(function(){i++;draw();},900);});
  start();
};

/* 15 speed converter */
W.speed=function(el){
  var U=[['kn','Knots',1],['mph','Miles per hour',1.15078],['kmh','Kilometres per hour',1.852],['mach','Mach, at sea level',1/661.47]];
  var b=frame(el,'AIRCRAFT','How Fast Is That?','<div class="ukw-grid">'+U.map(function(u){return '<label class="ukw-lab">'+u[1]+'<input class="ukw-in" type="number" min="0" step="any" data-u="'+u[0]+'"></label>';}).join('')+'</div><div class="ukw-res"></div><p class="ukw-note">Commentators give speeds in knots. Type in any box and the others follow.</p>');
  var res=q('.ukw-res',b);
  function set(kn,skip){U.forEach(function(u){if(u[0]===skip)return;var v=kn*u[2];q('[data-u='+u[0]+']',b).value=u[0]==='mach'?v.toFixed(2):Math.round(v);});
    var mph=kn*1.15078;res.innerHTML='<span>That is about</span><b>'+(mph/70).toFixed(1)+' times</b><small>the motorway speed limit, or '+(mph*5280/3600).toFixed(0)+' feet every second.</small>';}
  b.addEventListener('input',function(e){var u=e.target.dataset.u;if(!u)return;var f=U.filter(function(x){return x[0]===u;})[0];set(num(e.target.value,0)/f[2],u);});
  q('[data-u=kn]',b).value=300;set(300,'kn');
};

/* 16 meet up card */
W.meetup=function(el){
  var v=load('meet',{place:'',time:'',phone:''});
  var b=frame(el,'ON THE DAY','Our Meet Up Point','<div class="ukw-edit"><label class="ukw-lab">Where we meet if we get split up<input class="ukw-in" data-k="place" maxlength="60" placeholder="By the control tower flag" value="'+esc(v.place)+'"></label><div class="ukw-grid"><label class="ukw-lab">Check in time<input class="ukw-in" type="time" data-k="time" value="'+esc(v.time)+'"></label><label class="ukw-lab">Phone number to call<input class="ukw-in" type="tel" data-k="phone" maxlength="20" value="'+esc(v.phone)+'"></label></div><button type="button" class="ukw-btn" data-a="show">Show the card</button></div><div class="ukw-card ukw-hide"></div><p class="ukw-note">Agree it when you arrive, then screenshot the card and send it to everyone. It is saved on this device only and never sent anywhere.</p>');
  var ed=q('.ukw-edit',b),card=q('.ukw-card',b);
  b.addEventListener('input',function(e){var k=e.target.dataset.k;if(k){v[k]=e.target.value;save('meet',v);}});
  b.addEventListener('click',function(e){var a=e.target.dataset.a;if(a==='show'){card.innerHTML='<span>IF WE GET SPLIT UP, MEET AT</span><b>'+esc(v.place||'Add your meeting place')+'</b>'+(v.time?'<em>Check in at '+esc(v.time)+'</em>':'')+(v.phone?'<em>Call '+esc(v.phone)+'</em>':'')+'<button type="button" class="ukw-link" data-a="edit">Change it</button>';card.classList.remove('ukw-hide');ed.classList.add('ukw-hide');}
    if(a==='edit'){card.classList.add('ukw-hide');ed.classList.remove('ukw-hide');}});
};

/* 17 latest videos */
W.videos=function(el,o){
  var b=frame(el,'YOUTUBE','Latest From The Channel','<div class="ukw-out"><p class="ukw-note">Loading the latest videos.</p></div><a class="ukw-btn" target="_top" href="'+SITE+'youtube">See every video</a>'),out=q('.ukw-out',b);
  fetch(BASE+'youtube/videos.json').then(function(r){return r.json();}).then(function(j){
    var v=(j.videos||[]).filter(function(x){return !x.short;}),mine=o.show?v.filter(function(x){return x.show===o.show||x.show===({cosford:'raf-cosford',gransden:'little-gransden'})[o.show];}):[];
    v=(mine.length?mine:v).sort(function(a,b){return a.published<b.published?1:-1;}).slice(0,3);if(!v.length)throw 0;
    out.innerHTML='<ul class="ukw-vids">'+v.map(function(x){var d=new Date(x.published+'T12:00:00');return '<li><img alt="" loading="lazy" draggable="false" src="https://i.ytimg.com/vi/'+esc(x.id)+'/mqdefault.jpg"><div><b>'+esc(String(x.title).replace(/\s[\u2013\u2014-]\s/g,', '))+'</b><small>'+d.getDate()+' '+MONL[d.getMonth()]+' '+d.getFullYear()+'</small><a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v='+esc(x.id)+'">Watch on YouTube</a></div></li>';}).join('')+'</ul>';
  }).catch(function(){out.innerHTML='<p class="ukw-note ukw-bad">The videos will not load right now.</p>';});
};

/* 18 memory card */
W.card=function(el){
  var v=load('card',{gb:64,mb:30,fps:10,sec:3,batt:1200,spare:1});
  var b=frame(el,'PHOTOGRAPHY KIT','Will My Memory Card Last?','<div class="ukw-grid">'+
   '<label class="ukw-lab">Card size in GB<input class="ukw-in" type="number" min="1" data-k="gb" value="'+v.gb+'"></label>'+
   '<label class="ukw-lab">Size of one photo in MB<input class="ukw-in" type="number" min="1" data-k="mb" value="'+v.mb+'"></label>'+
   '<label class="ukw-lab">Frames per second<input class="ukw-in" type="number" min="1" data-k="fps" value="'+v.fps+'"></label>'+
   '<label class="ukw-lab">Seconds per burst<input class="ukw-in" type="number" min="1" data-k="sec" value="'+v.sec+'"></label>'+
   '<label class="ukw-lab">Shots per battery<input class="ukw-in" type="number" min="1" data-k="batt" value="'+v.batt+'"></label>'+
   '<label class="ukw-lab">Spare batteries<input class="ukw-in" type="number" min="0" data-k="spare" value="'+v.spare+'"></label></div><div class="ukw-res"></div><p class="ukw-note">Look at a photo from your own camera for its size, and your manual for shots per battery. Burst shooting fills a card faster than you think.</p>');
  var res=q('.ukw-res',b);
  function calc(){qa('[data-k]',b).forEach(function(i){v[i.dataset.k]=num(i.value,0);});save('card',v);
    var shots=Math.floor(v.gb*1000/Math.max(1,v.mb)),per=Math.max(1,v.fps*v.sec),bat=v.batt*(1+v.spare);
    res.innerHTML='<span>This card holds about</span><b>'+shots.toLocaleString('en-GB')+' photos</b><small>That is '+Math.floor(shots/per).toLocaleString('en-GB')+' bursts of '+per+'. Your batteries are good for about '+bat.toLocaleString('en-GB')+' shots, so '+(bat<shots?'the batteries run out first.':'the card fills first.')+'</small>';}
  b.addEventListener('input',calc);calc();
};

/* 19 panning practice */
W.panning=function(el){
  var b=frame(el,'PHOTOGRAPHY GAME','Panning Practice','<div class="ukw-sky"><div class="ukw-plane">'+JET+'</div><div class="ukw-vf"><i></i></div><div class="ukw-flash"></div><div class="ukw-msg">Keep the aircraft in the frame, then shoot</div></div><div class="ukw-row"><button type="button" class="ukw-btn" data-a="go">Start</button><span class="ukw-score"></span></div><p class="ukw-note">Mouse: move to follow, click to shoot. Phone: drag to follow, lift your finger to shoot. Five passes, each one faster.</p>');
  var sky=q('.ukw-sky',b),pl=q('.ukw-plane',b),vf=q('.ukw-vf',b),msg=q('.ukw-msg',b),sc=q('.ukw-score',b),fl=q('.ukw-flash',b),btn=q('[data-a=go]',b);
  var run=false,pass=0,total=0,px=-60,fx=0,t0=0,dur=0,dir=1,raf=0,shot=false;
  sc.textContent='Best: '+load('pan',0);
  function w(){return sky.clientWidth;}
  function move(e){var r=sky.getBoundingClientRect();fx=Math.max(0,Math.min(r.width,e.clientX-r.left));vf.style.left=fx+'px';}
  function step(ts){if(!t0)t0=ts;var k=(ts-t0)/dur,W2=w();px=dir>0?-60+k*(W2+120):W2+60-k*(W2+120);
    pl.style.transform='translate('+(px-22)+'px,'+(Math.sin(k*6)*8)+'px) rotate('+(dir>0?90:-90)+'deg)';
    if(k>=1){if(!shot)result(0,'Missed it');return;}raf=requestAnimationFrame(step);}
  function next(){if(pass>=5){run=false;var best=Math.max(load('pan',0),total);save('pan',best);msg.textContent=total>=400?'Crowd line regular: '+total+' out of 500':total>=250?'Getting your eye in: '+total+' out of 500':'Keep practising: '+total+' out of 500';msg.classList.add('show');sc.textContent='Best: '+best;btn.textContent='Play again';btn.disabled=false;return;}
    pass++;shot=false;t0=0;dur=2600-pass*330;dir=pass%2?1:-1;msg.classList.remove('show');sc.textContent='Pass '+pass+' of 5 · '+total+' points';raf=requestAnimationFrame(step);}
  function result(p,txt){shot=true;cancelAnimationFrame(raf);total+=p;msg.textContent=txt+(p?': '+p:'');msg.classList.add('show');sc.textContent='Pass '+pass+' of 5 · '+total+' points';setTimeout(next,1000);}
  function shoot(){if(!run||shot)return;var d=Math.abs(px-fx),p=Math.max(0,Math.round(100-d/55*100));fl.classList.add('on');setTimeout(function(){fl.classList.remove('on');},120);
    result(p,p>=85?'Pin sharp':p>=50?'In the frame':p>0?'Just caught it':'Empty sky');}
  sky.addEventListener('pointermove',move);sky.addEventListener('pointerdown',function(e){move(e);try{sky.setPointerCapture(e.pointerId);}catch(x){}});sky.addEventListener('pointerup',function(e){move(e);shoot();});
  btn.onclick=function(){if(run)return;run=true;pass=0;total=0;btn.disabled=true;fx=w()/2;vf.style.left=fx+'px';next();};
};

/* 20 jargon buster */
var JARGON=[['Crowd line','The front edge of the public area, facing the runway or the sea. The closer you are to it, the better the view.'],
 ['Display line','The line the aircraft fly along. It is set back from the crowd to keep everyone safe.'],
 ['Static display','Aircraft parked on the ground for you to walk around and photograph up close.'],
 ['Flypast','An aircraft flying straight past the crowd without doing a full display.'],
 ['Warbird','A former military aircraft, often from the Second World War, now flown by private owners.'],
 ['Afterburner','Extra fuel burnt in the jet pipe for a burst of power. You will hear it, and feel it.'],
 ['Formation','Two or more aircraft flying close together in a set shape.'],
 ['Topside pass','A banked pass that shows the top of the aircraft to the crowd. A favourite with photographers.']];
W.jargon=function(el){
  var b=frame(el,'NEW TO AIRSHOWS','Jargon Buster','<div class="ukw-flip">'+JARGON.map(function(j){return '<button type="button" aria-expanded="false"><b>'+j[0]+'</b><span>'+j[1]+'</span><em>Tap to see what it means</em></button>';}).join('')+'</div>');
  q('.ukw-flip',b).onclick=function(e){var t=e.target.closest('button');if(!t)return;var on=t.classList.toggle('on');t.setAttribute('aria-expanded',on);};
};

/* list for the gallery and for anyone picking a widget */
var LIST=[
 ['countdown','Show Countdown','A live count to the next date for one show, or any show from a picker.',['Home','Every show page','Calendar'],'data-show="riat"'],
 ['nearest','Nearest Show Finder','A postcode in, the five closest featured shows out, with miles and dates.',['Find your Air Show','Home','Which airshow suits you'],''],
 ['weather','Show Ground Weather','Seven day forecast at the show ground, with show days marked.',['Every show page','Weather guide','Rainy Day Plan','Night Before'],'data-show="duxford"'],
 ['sun','Sun Compass','Where the sun sits through the day at each show, with your shadow as the guide.',['Photography Hub','Where to watch','Every show page'],'data-show="eastbourne"'],
 ['leave','Leave Home Planner','Works back from gate time to the minute you need to leave the house.',['Getting there','Night Before','Public transport'],''],
 ['fuel','Fuel Cost Calculator','Round trip fuel cost, split between everyone in the car.',['Airshows On A Budget','Getting there','Kit Calculator'],''],
 ['split','Split The Cost','Add up the trip and see what each person owes.',['Airshows On A Budget','Kit Calculator','Where to stay'],''],
 ['quiz','Which Show Suits You Quiz','Four questions that match a visitor to a type of show and its guides.',['Which airshow suits you','Home','Find your Air Show'],''],
 ['bingo','Airshow Bingo','A tap to tick game for the gaps between displays, saved on the phone.',['Show Day','Spotter Cards','On the day'],''],
 ['season','Season At A Glance','Every confirmed show by month, straight from the calendar.',['Home','Airshow News','Calendar'],''],
 ['calendar','Add To My Calendar','Saves a show date to a phone, Outlook or Google Calendar.',['Every show page','Calendar','My Airshow Hub'],'data-show="shuttleworth"'],
 ['share','Share This Page','WhatsApp, Facebook, email and copy link buttons for any guide.',['Every guide','Every show page','Airshow News'],''],
 ['callsign','Call Sign Speller','Type a name and see it in the pilot alphabet.',['Spotter Cards','Planning your first airshow','A Calm Airshow Visit'],''],
 ['aircraft','Name That Aircraft','A six question photo quiz using the aircraft pictures already on the site.',['Aircraft A To Z','Spotter Cards','Home'],''],
 ['speed','Speed Converter','Knots, miles per hour, kilometres per hour and Mach in one box.',['Aircraft A To Z','Questions and Answers','Spotter Cards'],''],
 ['meetup','Meet Up Point Card','A big clear card with the meeting place and a number to call.',['On the day','Safety and show rules','A Calm Airshow Visit'],''],
 ['videos','Latest Videos','The three newest videos from the channel, or from one show.',['Home','Every show page','Community'],'data-show="cosford"'],
 ['card','Memory Card Calculator','How many photos and bursts a card holds, and whether batteries run out first.',['Photography Equipment','Photography Hub','Kit Calculator'],''],
 ['panning','Panning Practice','A quick game that teaches following an aircraft before pressing the shutter.',['New to Aviation Photography','Photography Hub'],''],
 ['jargon','Jargon Buster','Eight airshow words explained on tap to flip cards.',['Planning your first airshow','Questions and Answers','Safety and show rules'],'']
].map(function(a){return {id:a[0],name:a[1],about:a[2],pages:a[3],attr:a[4]};});

var CSS=".ukw{--navy:#13293c;--deep:#0c1c2a;--teal:#32b4af;--tealk:#0e5f5b;--red:#e3212f;--mist:#dce6ee;--wash:#f3f6f8;--ink:#33444f;--mute:#5a6b78;--hf:'Barlow Condensed','Arial Narrow',sans-serif;--bf:'Barlow',Arial,sans-serif;--mf:'Share Tech Mono',monospace;font-family:var(--bf);color:var(--ink);background:#fff;border:1px solid var(--mist);border-radius:14px;overflow:hidden;max-width:560px;margin:0 auto;line-height:1.4;font-size:15px;text-align:left;box-shadow:0 1px 3px rgba(19,41,60,.08)}.ukw *{box-sizing:border-box}.ukw img{pointer-events:none;max-width:100%}.ukw-h{background:var(--navy);color:#fff;padding:12px 16px 11px;border-bottom:3px solid var(--teal);display:flex;flex-direction:column;gap:1px}.ukw-k{font-family:var(--mf);font-size:11px;letter-spacing:.16em;color:var(--teal)}.ukw-t{font-family:var(--hf);font-weight:800;font-size:25px;line-height:1.05;text-transform:uppercase;letter-spacing:.01em}.ukw-b{padding:14px 16px 16px;display:flex;flex-direction:column;gap:12px}.ukw-in{font:500 16px var(--bf);color:var(--navy);width:100%;min-width:0;padding:10px 12px;border:1.5px solid #b9c7d2;border-radius:9px;background:#fff;appearance:auto}.ukw-in:focus,.ukw button:focus-visible,.ukw a:focus-visible{outline:3px solid rgba(50,180,175,.5);outline-offset:1px;border-color:var(--teal)}.ukw-btn{font:700 15px var(--bf);background:var(--navy);color:#fff;border:0;border-radius:9px;padding:11px 16px;cursor:pointer;text-decoration:none;text-align:center;display:inline-block;white-space:nowrap}.ukw-btn:hover{background:#1c3850}.ukw-btn[disabled]{opacity:.5;cursor:default}.ukw-btn.ukw-alt{background:#fff;color:var(--navy);border:1.5px solid var(--navy)}.ukw-btn.ukw-alt:hover{background:var(--wash)}.ukw-link{font:600 14px var(--bf);background:none;border:0;color:var(--tealk);text-decoration:underline;cursor:pointer;padding:4px 0;align-self:flex-start}.ukw-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.ukw-row>.ukw-in{flex:1 1 120px}.ukw-row>.ukw-btn{flex:1 1 auto}.ukw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));gap:10px}.ukw-lab{font:600 13px var(--bf);color:var(--mute);display:flex;flex-direction:column;gap:5px;justify-content:flex-end}.ukw-inl{flex-direction:row;align-items:center;justify-content:space-between}.ukw-inl .ukw-in{width:90px}.ukw-note{font-size:13px;color:var(--mute);margin:0}.ukw-bad{color:#b93a3a;font-weight:600}.ukw-hide{display:none!important}.ukw-res{background:var(--wash);border-left:5px solid var(--teal);border-radius:9px;padding:12px 14px;display:flex;flex-direction:column}.ukw-res span{font:600 12px var(--bf);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}.ukw-res b{font-family:var(--hf);font-weight:800;font-size:40px;line-height:1.05;color:var(--navy)}.ukw-res b.ukw-mid{font-size:26px}.ukw-res small{font-size:13px;color:var(--ink)}.ukw-out{display:flex;flex-direction:column;gap:12px}.ukw-q{font-family:var(--hf);font-weight:700;font-size:22px;color:var(--navy);margin:0;line-height:1.1}.ukw-cd{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.ukw-cd div{background:var(--navy);color:#fff;border-radius:10px;padding:12px 4px 9px;text-align:center}.ukw-cd b{display:block;font-family:var(--hf);font-weight:800;font-size:clamp(30px,9vw,46px);line-height:1}.ukw-cd span{font-family:var(--mf);font-size:11px;letter-spacing:.12em;color:var(--teal);text-transform:uppercase}.ukw-big{grid-column:1/-1;font-family:var(--hf);font-weight:800;font-size:28px!important;padding:6px 0}.ukw-list,.ukw-cal,.ukw-vids,.ukw-chips{list-style:none;margin:0;padding:0}.ukw-list li{display:grid;grid-template-columns:auto 1fr auto auto;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--mist)}.ukw-n{font-family:var(--hf);font-weight:800;font-size:18px;width:28px;height:28px;border-radius:50%;background:var(--teal);color:#fff;display:grid;place-items:center}.ukw-list b{color:var(--navy);display:block;line-height:1.15}.ukw-list small{color:var(--mute);font-size:12.5px;display:block}.ukw-mi{font-size:11px;color:var(--mute);text-align:right;line-height:1}.ukw-mi b{font-family:var(--hf);font-size:24px}.ukw-list a{font:700 13px var(--bf);color:#fff;background:var(--navy);border-radius:7px;padding:6px 10px;text-decoration:none}.ukw-wx{display:grid;grid-template-columns:repeat(7,minmax(70px,1fr));gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}.ukw-wx::-webkit-scrollbar{display:none}.ukw-wx div{background:var(--wash);border-radius:10px;padding:8px 4px;text-align:center;display:flex;flex-direction:column;align-items:center;border:2px solid transparent}.ukw-wx div.on{border-color:var(--teal);background:#e6f5f4}.ukw-wx span{font:700 12px var(--bf);color:var(--navy);text-transform:uppercase;letter-spacing:.05em}.ukw-wx svg{width:34px;height:34px;margin:2px 0}.ukw-wx b{font-family:var(--hf);font-weight:800;font-size:24px;color:var(--navy);line-height:1}.ukw-wx small{font-size:10.5px;color:var(--mute);line-height:1.25}.ukw-sun{display:grid;grid-template-columns:minmax(0,200px) 1fr;gap:14px;align-items:center}.ukw-comp{width:100%;height:auto}.ukw-comp .c{font:700 12px Barlow,Arial,sans-serif;fill:#5a6b78;text-anchor:middle}.ukw-sunr{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ukw-sunr div{background:var(--wash);border-radius:9px;padding:8px 10px}.ukw-sunr span{display:block;font-size:11.5px;color:var(--mute)}.ukw-sunr b{font-family:var(--hf);font-weight:800;font-size:24px;color:var(--navy);line-height:1.1}.ukw-time{font-family:var(--mf);color:var(--navy);font-size:15px;margin-left:6px}.ukw-lab input[type=range]{width:100%;accent-color:var(--teal);height:28px}.ukw-pound{font-weight:700;color:var(--mute)}.ukw-row>.ukw-sm{flex:0 0 96px;width:96px}.ukw-x{width:34px;height:34px;border-radius:50%;border:1.5px solid #b9c7d2;background:#fff;color:var(--mute);font-size:20px;line-height:1;cursor:pointer;flex:none}.ukw-rows{display:flex;flex-direction:column;gap:8px}.ukw-rows .ukw-row{flex-wrap:nowrap}.ukw-prog{height:6px;border-radius:3px;background:var(--mist);overflow:hidden}.ukw-prog i{display:block;height:100%;background:var(--teal);transition:width .3s}.ukw-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));gap:8px}.ukw-opt{font:600 15px var(--bf);text-align:left;color:var(--navy);background:#fff;border:1.5px solid #b9c7d2;border-radius:10px;padding:12px 14px;cursor:pointer}.ukw-opt:hover{border-color:var(--teal);background:#f0faf9}.ukw-opt.good{background:#1c7f7b;border-color:#1c7f7b;color:#fff}.ukw-opt.bad{background:#b93a3a;border-color:#b93a3a;color:#fff}.ukw-match{background:linear-gradient(150deg,#13293c,#1d6f78);color:#fff;border-radius:12px;padding:16px}.ukw-match span{font-family:var(--mf);font-size:11px;letter-spacing:.16em;color:#a9dedb;text-transform:uppercase}.ukw-match b{display:block;font-family:var(--hf);font-weight:800;font-size:32px;line-height:1.05;text-transform:uppercase;margin:2px 0 6px}.ukw-match p{margin:0;font-size:14px}.ukw-chips{display:flex;flex-wrap:wrap;gap:6px}.ukw-chips a{display:block;font:600 13.5px var(--bf);color:var(--navy);border:1.5px solid var(--navy);border-radius:999px;padding:6px 12px;text-decoration:none}.ukw-chips a:hover{background:var(--navy);color:#fff}.ukw-bingo{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.ukw-bingo button{font:600 12.5px/1.15 var(--bf);min-height:66px;border:1.5px solid #b9c7d2;border-radius:9px;background:#fff;color:var(--navy);cursor:pointer;padding:4px;overflow-wrap:anywhere}.ukw-bingo button.on{background:var(--teal);border-color:var(--teal);color:#fff;text-decoration:line-through;text-decoration-thickness:1px}.ukw-count{flex:1}.ukw-stat{display:flex;align-items:baseline;gap:10px}.ukw-stat b{font-family:var(--hf);font-weight:800;font-size:54px;line-height:.9;color:var(--teal)}.ukw-stat span{font-family:var(--hf);font-weight:700;font-size:20px;text-transform:uppercase;color:var(--navy)}.ukw-bars{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;align-items:end}.ukw-bars button{font:700 12px var(--bf);color:var(--mute);background:none;border:0;border-bottom:3px solid transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;padding:0 0 5px;text-transform:uppercase}.ukw-bars em{font:normal 800 15px var(--hf);color:var(--navy)}.ukw-bars i{width:100%;max-width:46px;background:#b9c7d2;border-radius:4px 4px 0 0;display:block}.ukw-bars button.on{border-color:var(--red);color:var(--navy)}.ukw-bars button.on i{background:var(--teal)}.ukw-cal{max-height:230px;overflow-y:auto;scrollbar-width:none}.ukw-cal::-webkit-scrollbar{display:none}.ukw-cal li{display:grid;grid-template-columns:64px 1fr;gap:10px;padding:7px 0;border-bottom:1px solid var(--mist);align-items:center}.ukw-cal i{font:normal 13px var(--mf);color:#fff;background:var(--navy);border-radius:6px;padding:4px 2px;text-align:center}.ukw-cal b{display:block;color:var(--navy);line-height:1.15;font-size:14.5px}.ukw-cal small{font-size:12px;color:var(--mute)}.ukw-share{display:flex;flex-wrap:wrap;gap:8px}.ukw-share>*{flex:1 1 110px}.ukw-url{font-family:var(--mf);overflow-wrap:anywhere}.ukw-nato{display:flex;flex-wrap:wrap;gap:7px;min-height:64px}.ukw-nato span{background:var(--navy);color:#fff;border-radius:9px;padding:6px 10px 7px;font:600 12.5px var(--bf);text-align:center;min-width:62px}.ukw-nato b{display:block;font-family:var(--hf);font-weight:800;font-size:28px;line-height:1;color:var(--teal)}.ukw-nato .ukw-ghost{opacity:.3}.ukw-pic{background:linear-gradient(180deg,#cfe3f1,#eaf3f8);border-radius:12px;height:150px;display:grid;place-items:center;padding:12px}.ukw-pic img{width:min(210px,80%);max-height:110px;object-fit:contain;filter:drop-shadow(0 6px 6px rgba(19,41,60,.25))}.ukw-card{background:var(--navy);color:#fff;border-radius:12px;padding:20px 16px;text-align:center;display:flex;flex-direction:column;gap:6px;align-items:center;border:4px solid var(--teal)}.ukw-card span{font-family:var(--mf);font-size:11.5px;letter-spacing:.12em;color:var(--teal)}.ukw-card b{font-family:var(--hf);font-weight:800;font-size:clamp(30px,8vw,44px);line-height:1.02;text-transform:uppercase;overflow-wrap:anywhere}.ukw-card em{font:normal 600 18px var(--bf)}.ukw-card .ukw-link{color:#a9dedb;align-self:center}.ukw-edit{display:flex;flex-direction:column;gap:10px}.ukw-vids li{display:grid;grid-template-columns:132px 1fr;gap:12px;padding:8px 0;border-bottom:1px solid var(--mist);align-items:center}.ukw-vids img{width:132px;aspect-ratio:16/9;object-fit:cover;border-radius:8px;background:var(--mist);display:block}.ukw-vids b{display:block;color:var(--navy);line-height:1.2;font-size:14.5px}.ukw-vids small{display:block;color:var(--mute);font-size:12px;margin:2px 0}.ukw-vids a{font:700 13px var(--bf);color:var(--tealk)}.ukw-sky{position:relative;height:180px;border-radius:12px;overflow:hidden;background:linear-gradient(180deg,#5fa8d8,#bfe0f2 75%,#e8f4ea);touch-action:none;cursor:crosshair;user-select:none}.ukw-plane{position:absolute;left:0;top:64px;width:44px;height:46px;color:var(--navy);transform:translate(-80px,0);will-change:transform}.ukw-plane svg{width:100%;height:100%;display:block}.ukw-vf{position:absolute;top:34px;left:50%;width:110px;height:106px;margin-left:-55px;border:2px solid rgba(255,255,255,.9);border-radius:6px;box-shadow:0 0 0 1px rgba(19,41,60,.35);pointer-events:none}.ukw-vf i{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px;border:2px solid var(--red);border-radius:50%}.ukw-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}.ukw-flash.on{opacity:.8}.ukw-msg{position:absolute;left:8px;right:8px;bottom:8px;text-align:center;font:700 14px var(--bf);color:var(--navy);background:rgba(255,255,255,.88);border-radius:8px;padding:6px;pointer-events:none}.ukw-score{font:600 14px var(--bf);color:var(--navy);flex:2}.ukw-flip{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:8px}.ukw-flip button{text-align:left;font-family:var(--bf);border:1.5px solid #b9c7d2;border-radius:10px;background:#fff;padding:11px 13px;cursor:pointer;min-height:84px;display:flex;flex-direction:column;gap:3px;color:var(--ink)}.ukw-flip b{font-family:var(--hf);font-weight:800;font-size:21px;color:var(--navy);text-transform:uppercase;line-height:1.05}.ukw-flip span{display:none;font-size:13.5px;line-height:1.35}.ukw-flip em{font-style:normal;font-size:12.5px;color:var(--tealk);font-weight:600}.ukw-flip button.on{background:var(--navy);border-color:var(--navy);color:#fff}.ukw-flip button.on b{color:var(--teal)}.ukw-flip button.on span{display:block}.ukw-flip button.on em{display:none}@media(max-width:420px){.ukw-sun{grid-template-columns:1fr}.ukw-comp{max-width:200px;margin:0 auto}.ukw-list li{grid-template-columns:auto 1fr auto}.ukw-list a{grid-column:2/-1;justify-self:start}.ukw-vids li{grid-template-columns:104px 1fr}.ukw-vids img{width:104px}.ukw-b{padding:12px}.ukw-bingo button{font-size:11.5px}}";
function styleInto(root){var host=root.nodeType===9?root.head:root;if(!host||host.querySelector('style[data-ukw]'))return;var s=document.createElement('style');s.setAttribute('data-ukw','1');s.textContent=CSS;host.appendChild(s);
  if(!document.querySelector('link[data-ukw-font]')&&!/Barlow/.test([].map.call(document.querySelectorAll('link[href*="fonts.googleapis"]'),function(l){return l.href;}).join(' '))){var l=document.createElement('link');l.rel='stylesheet';l.setAttribute('data-ukw-font','1');l.href='https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&family=Share+Tech+Mono&display=swap';document.head.appendChild(l);}}
function mount(root){root=root||document;var els=qa('.ukag-widget:not([data-ukw-on])',root);if(!els.length)return;styleInto(root);
  els.forEach(function(el){var n=el.getAttribute('data-widget');if(!W[n])return;el.setAttribute('data-ukw-on','1');try{W[n](el,{show:el.getAttribute('data-show')||'',url:el.getAttribute('data-url')||'',title:el.getAttribute('data-title')||''});}catch(e){el.removeAttribute('data-ukw-on');if(window.console)console.error('ukag widget '+n,e);}});}
function mountAll(){mount(document);qa('airshow-page',document).forEach(function(h){if(h.shadowRoot)mount(h.shadowRoot);});}
window.UKAGWidgets={mount:mount,mountAll:mountAll,list:LIST,shows:SHOWS};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountAll);else mountAll();
setTimeout(mountAll,1500);
})();
