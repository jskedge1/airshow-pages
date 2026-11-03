/* Volunteer Hub. Reads and writes the shared team data (team-demo.js in the preview, Wix on the live site). */
(function(){
  var T=window.TEAM,$=function(id){return document.getElementById(id);},esc=T.esc,svg=T.svg,fmt=T.fmt;
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var ME='sam',D={loggedIn:false,vols:{},work:[],requests:[],notes:{}};
  function me(){return D.vols[ME]||{name:'',first:'there',roles:[],shows:[],link:'',bio:''};}
  function mine(){return D.work.filter(function(w){return w.st!=='gone'&&w.st!=='no';});}
  function toast(t){var x=$('toast');x.textContent=t;x.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){x.classList.remove('on');},3200);}
  var COLOUR={photo:'#32B4AF',video:'#C2255C',review:'#6950A1',tips:'#D74949',arrivals:'#00A6E2',social:'#2BA84A'};

  var TYPES={
    photo:{n:'Photos',s:'Displays, static, the day',files:true,accept:'image/*',hint:'JPG or PNG photos, up to 10 at a time',link:true,where:true,text:'Captions or notes',ph:'Anything I should know. Which aircraft, the time, your settings if you are happy to share them.',
      intro:'Displays, static aircraft, queues, food stalls, the walk in. The everyday bits help visitors just as much as the jets.',
      checks:['These photos are my own','There are no close ups of children, or I have their parent\'s OK'],
      side:'<h3>What Works Best</h3><ul><li>Full size files, so I can crop for phones</li><li>A mix of flying and ground shots</li><li>Gates, car parks and toilets are gold for first timers</li></ul><div class="tip"><b>I would suggest</b> telling me roughly where you were stood. It helps me match your photo to the right part of the page.</div>'},
    video:{n:'Video',s:'Clips and walk rounds',files:false,accept:'',hint:'',link:true,where:true,text:'What is in the clip?',ph:'For example, arrivals on Friday, filmed from the north side of the runway.',
      intro:'Short clips, walk rounds, arrivals and display highlights. Paste a YouTube, Google Drive or WeTransfer link, so I get it at the quality you filmed.',
      checks:['I filmed this myself','I am happy for it to go on the guide\'s YouTube, Facebook and Instagram with my name'],
      side:'<h3>What Works Best</h3><ul><li>Landscape for YouTube, upright for short social clips</li><li>Walk rounds from the gate to the crowd line</li><li>Steady clips under two minutes</li></ul><div class="tip"><b>I would advise</b> keeping the original file. If I need a different length, I may ask for it.</div>'},
    review:{n:'Review',s:'Write up your day',files:true,accept:'image/*',hint:'Optional, add a few photos to go with it',link:false,where:false,text:'Your review',ph:'How was the day? Getting in, the flying, food, toilets, getting home. Write it like you would tell a mate.',
      intro:'An honest write up of your day. The good bits and the bits that went wrong both help.',
      checks:['These are my own words','I went to this show on the day I have picked'],
      side:'<h3>What I Look For</h3><ul><li>A few paragraphs is plenty</li><li>Arrival, the flying, food and getting home</li><li>Was it worth it for a family?</li></ul><div class="tip"><b>I would suggest</b> sending it within a week or two of the show, while it is fresh.</div>'},
    tips:{n:'Show tips',s:'Local knowledge',files:true,accept:'image/*',hint:'Optional, a photo helps',link:false,where:true,text:'Your tips',ph:'The car park that fills first, the best spot for the sun in the afternoon, the shortcut from the station.',
      intro:'The things you know from going year after year. These go straight into the show pages.',
      checks:['This is from my own visits'],
      side:'<h3>Good Tips Are</h3><ul><li>Specific, with a place or a time</li><li>From this year or last year</li><li>Things a first timer would not know</li></ul><div class="tip"><b>I would advise</b> one tip per line. It makes them easy for me to place on the page.</div>'},
    arrivals:{n:'Arrivals report',s:'Spotted and cancelled',files:true,accept:'image/*',hint:'Optional, a photo of the aircraft',link:false,where:false,text:'What did you see?',ph:'Type, serial or squadron, and the time. For example, 14:20 Rafale 4-GT landed runway 27.',
      intro:'Arrivals, departures, rare visitors and cancellations. This keeps the line ups on the show pages right.',
      checks:['I saw these myself'],
      side:'<h3>Helpful To Include</h3><ul><li>The time you saw it</li><li>Type and serial if you have it</li><li>Anything that was expected but did not turn up</li></ul><div class="tip"><b>I would much rather</b> have one report I can trust than a guess, so say if you are not sure.</div>'},
    social:{n:'Post idea',s:'For Facebook and Instagram',files:true,accept:'image/*',hint:'Optional, the photo you would use. Clips go in as a link',link:true,where:false,text:'Your idea',ph:'What the post would say, or a question you think people would answer.',
      intro:'An idea for a planning card, a show news post or a question for followers. Kirsty and Tyler see these too.',
      checks:['Any photo or clip here is my own'],
      side:'<h3>Good Posts Are</h3><ul><li>Useful before a show, like a tip or a date</li><li>Short, with one clear point</li><li>Friendly, the way the guide talks</li></ul><div class="tip"><b>Have a look</b> through our Instagram first, so you get a feel for the planning cards.</div>'}
  };

  /* ===== log in and out ===== */
  var API=window.TEAMAPI,signup=false,busy=false;
  if(!API.LIVE)$('demo').hidden=false;
  function show(view){$('outView').hidden=view!=='out';$('inView').hidden=view!=='in';}
  function err(e){toast((e&&e.message)||'Something went wrong. Please try again.');}
  function take(view){D=view;ME=view.meId||ME;route();}
  function route(){
    if(!D.loggedIn){show('out');return;}
    show('in');
    var st=D.status,joined=st==='active'||st==='paused';
    document.querySelector('.tabbar').hidden=!joined;
    $('p-join').hidden=joined;
    if(!joined){tabs.forEach(function(b){$('p-'+b.dataset.p).hidden=true;});renderJoin();renderHead();return;}
    if(!tabs.some(function(b){return !$('p-'+b.dataset.p).hidden;}))pickTab('overview');
    $('pausedNote').hidden=st!=='paused';
    $('admLink').hidden=!D.isAdmin;
    renderAll();
  }
  function boot(){return API.call('me').then(take).catch(err);}
  [].forEach.call(document.querySelectorAll('[data-login]'),function(b){b.addEventListener('click',function(){
    if(busy)return;busy=true;
    API.call('prompt',{mode:signup?'signup':'login'}).then(function(v){take(v);if(v.loggedIn)toast(API.LIVE?'Logged in':'Logged in as Sam, the example volunteer');}).catch(err).then(function(){busy=false;});
  });});
  $('logout').addEventListener('click',function(){API.call('logout').then(function(v){take(v);toast('Logged out. Your work is saved for next time.');}).catch(err);});
  $('tNew').addEventListener('click',function(){signup=true;$('tNew').setAttribute('aria-selected','true');$('tLog').setAttribute('aria-selected','false');$('logText').textContent='Already have a My Airshow Hub or forum account? Use that. If not, sign up in the members window, then tell me what you would like to help with.';});
  $('tLog').addEventListener('click',function(){signup=false;$('tLog').setAttribute('aria-selected','true');$('tNew').setAttribute('aria-selected','false');$('logText').textContent='Use the same log in as My Airshow Hub and the forum. It opens the secure members window.';});
  $('resetDemo').addEventListener('click',function(){API.call('reset').then(function(v){take(v);toast('Example data reset');});});
  API.on(function(ev){if(ev==='refresh')boot();});

  /* ===== asking to join ===== */
  function renderJoin(){
    var v=me()||{},waiting=D.status==='waiting';
    $('jTitle').textContent=waiting?'Thanks, You Are On The List':'Ask To Join The Team';
    $('jIntro').textContent=waiting?'I have your message. Once we have had a quick chat I will switch your account on, and this page opens up with everything in it.':'You are logged in, but your account is not on the team yet. Tell me what you would like to help with and I will switch you on after a quick chat.';
    $('jFields').hidden=waiting;
    if(!waiting&&!$('jRoles').children.length){
      $('jName').value=v.name||'';
      chips($('jRoles'),T.ROLES,v.roles||[]);chips($('jShows'),T.SHOWS,v.shows||[]);
    }
  }
  $('joinForm').addEventListener('submit',function(e){e.preventDefault();
    var roles=[].map.call(document.querySelectorAll('#jRoles input:checked'),function(i){return i.value;}),list=[];
    if(!$('jName').value.trim())list.push('add your name');if(!roles.length)list.push('pick at least one role');if(!$('jOk').checked)list.push('tick the guidelines box');
    if(list.length){$('jErr').textContent='Please '+list.join(', ')+'.';$('jErr').classList.add('on');return;}
    $('jErr').classList.remove('on');
    API.call('apply',{name:$('jName').value.trim(),roles:roles,shows:[].map.call(document.querySelectorAll('#jShows input:checked'),function(i){return i.value;}),message:$('jMsg').value.trim()}).then(function(v){take(v);toast('Sent. Jack will be in touch');}).catch(err);
  });

  /* ===== tabs ===== */
  var tabs=[].slice.call(document.querySelectorAll('#tabbar [role=tab]'));
  function pickTab(p,scroll){
    tabs.forEach(function(b){var on=b.dataset.p===p;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;$('p-'+b.dataset.p).hidden=!on;});
    if(scroll){var y=document.querySelector('.tabbar').offsetTop;window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});}
  }
  tabs.forEach(function(b,i){
    b.addEventListener('click',function(){pickTab(b.dataset.p,true);});
    b.addEventListener('keydown',function(e){var n=null;if(e.key==='ArrowRight')n=tabs[(i+1)%tabs.length];if(e.key==='ArrowLeft')n=tabs[(i-1+tabs.length)%tabs.length];if(n){e.preventDefault();pickTab(n.dataset.p);n.focus();}});
  });
  document.addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(g){pickTab(g.dataset.go,true);if(g.dataset.kind)pickType(g.dataset.kind);if(g.dataset.show)$('fShow').value=g.dataset.show;}});

  /* ===== header and overview ===== */
  function counts(){var c={sent:0,checking:0,live:0,change:0,removal:0};mine().forEach(function(w){if(c[w.st]!=null)c[w.st]++;});return c;}
  function renderHead(){
    var m=me();$('hello').innerHTML='Hello, <span>'+esc(m.first)+'</span>';$('av').textContent=(m.first[0]||'S').toUpperCase();
    $('myRoles').innerHTML=m.roles.map(function(r){return '<span>'+esc(r)+'</span>';}).join('');
    var c=counts(),all=mine().length;
    $('stats').innerHTML='<div><span>Sent to Jack</span><b>'+all+'</b></div><div><span>Live on the guide</span><b>'+c.live+'</b></div><div><span>Being checked</span><b>'+(c.sent+c.checking)+'</b></div>'+(c.change?'<div class="hl"><span>Change asked</span><b>'+c.change+'</b></div>':'<div><span>Change asked</span><b>0</b></div>');
    $('chDot').hidden=!c.change;$('chDot').textContent=c.change;
    var req=D.requests[0];
    $('nextRows').innerHTML=(c.change?'<div class="hl"><span>Have a look</span><b>'+c.change+' change asked</b></div>':'')+'<div><span>Your shows</span><b>'+m.shows.length+'</b></div><div><span>Next request</span><b>'+(req?esc(req.t):'None right now')+'</b></div>';
  }
  function renderOverview(){
    var mineNote=D.notes[ME],allNote=D.notes.all;
    $('noteBody').innerHTML=(mineNote?'<p>'+esc(mineNote)+'</p>':'')+(allNote?'<p>'+(mineNote?'<b>For everyone.</b> ':'')+esc(allNote)+'</p>':'')+(!mineNote&&!allNote?'<p>No notes from me at the moment. Thanks for everything you send.</p>':'');
    $('wantList').innerHTML=D.requests.length?D.requests.map(function(w){var c=COLOUR[w.k]||'#32B4AF';
      return '<div class="want" style="--wc:'+c+'"><span class="wi">'+svg(w.k)+'</span><div><b>'+esc(w.t)+'</b><span>'+esc(w.show)+'. '+esc(w.s)+'</span></div><button class="btn small" type="button" data-go="send" data-kind="'+w.k+'" data-show="'+esc(w.show)+'">I can help <span class="ar">→</span></button></div>';}).join(''):'<div class="empty">Nothing on the list right now. Send whatever you have.</div>';
    $('recentList').innerHTML=mine().slice(0,3).map(function(w){var s=T.ST[w.st];
      return '<div class="rc"><div class="th" style="'+(w.imgs&&w.imgs.length?'background-image:url('+w.imgs[0]+')':'')+'">'+(w.imgs&&w.imgs.length?'':svg(w.k))+'</div><div><b>'+esc(w.title)+'</b><span class="pill" style="--pc:'+s[1]+'">'+s[0]+'</span></div></div>';}).join('')||'<p style="margin:0;color:#41586B">Nothing sent yet.</p>';
  }

  /* ===== send something ===== */
  var typeEl=$('types'),cur='photo',files=[];
  Object.keys(TYPES).forEach(function(k){var t=TYPES[k];
    var b=document.createElement('button');b.type='button';b.className='ty';b.setAttribute('role','tab');b.dataset.k=k;b.style.setProperty('--tc',COLOUR[k]);
    b.innerHTML='<span class="ring">'+svg(k)+'</span>'+esc(t.n)+'<small>'+esc(t.s)+'</small>';
    b.addEventListener('click',function(){pickType(k);});typeEl.appendChild(b);});
  $('fShow').innerHTML='<option value="">Choose a show</option>'+T.SHOWS.map(function(s){return '<option>'+esc(s)+'</option>';}).join('');
  function pickType(k){
    cur=k;var t=TYPES[k];files=[];drawThumbs();
    [].forEach.call(typeEl.children,function(b){b.setAttribute('aria-selected',b.dataset.k===k?'true':'false');});
    $('sendForm').style.setProperty('--tc',COLOUR[k]);
    $('fTitle').textContent=t.n;$('fIntro').textContent=t.intro;
    $('fFiles').accept=t.accept;$('dropHint').textContent=t.hint;
    $('wFiles').hidden=!t.files;$('wLink').hidden=!t.link;
    $('wLink').querySelector('label').innerHTML=k==='video'?'Link to your video <small>YouTube, Google Drive or WeTransfer</small>':'Or paste a link <small>Google Drive, WeTransfer, YouTube or Instagram</small>';$('wWhere').hidden=!t.where;
    $('lText').textContent=t.text;$('fText').placeholder=t.ph;
    $('checks').innerHTML=t.checks.map(function(c){return '<label class="ck"><input type="checkbox"> '+esc(c)+'</label>';}).join('');
    $('fSide').innerHTML=t.side;$('fErr').classList.remove('on');$('sentOk').classList.remove('on');
  }
  function drawThumbs(){
    $('thumbs').innerHTML='';
    files.forEach(function(f,i){var d=document.createElement('div');
      if(f.type.indexOf('video')===0)d.innerHTML='<video src="'+f.url+'" muted playsinline></video>';else d.style.backgroundImage='url('+f.url+')';
      d.insertAdjacentHTML('beforeend','<small>'+esc(f.name)+'</small><button type="button" aria-label="Remove '+esc(f.name)+'">×</button>');
      d.querySelector('button').addEventListener('click',function(){URL.revokeObjectURL(f.url);files.splice(i,1);drawThumbs();});
      $('thumbs').appendChild(d);});
  }
  function addFiles(list){
    [].forEach.call(list,function(f){
      if(files.length>=10){toast('Up to 10 photos at a time');return;}
      if(f.type.indexOf('video')===0){toast('Video goes in as a link. Pick Video and paste it there');return;}
      if(f.type.indexOf('image')!==0){toast(f.name+' is not a photo');return;}
      if(f.size>40*1048576){toast(f.name+' is over 40 MB, add it as a link instead');return;}
      files.push({file:f,name:f.name,type:f.type||'image/heic',url:URL.createObjectURL(f)});});
    drawThumbs();
  }
  $('fFiles').addEventListener('change',function(){addFiles(this.files);this.value='';});
  var drop=$('drop');
  ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('over');});});
  ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('over');});});
  drop.addEventListener('drop',function(e){if(e.dataTransfer&&e.dataTransfer.files)addFiles(e.dataTransfer.files);});
  $('sendForm').addEventListener('submit',function(e){
    e.preventDefault();var t=TYPES[cur],err=[];
    var title=$('fTitleIn').value.trim(),show=$('fShow').value,text=$('fText').value.trim(),link=t.link?$('fLink').value.trim():'';
    if(!show)err.push('pick the show');
    if(!title)err.push('give it a title');
    if(cur==='photo'&&!files.length&&!link)err.push('add a photo or paste a link');
    if(cur==='video'&&!link)err.push('paste the link to your video');
    if(D.status==='paused')err.push('wait until your account is switched back on');
    if((cur==='review'||cur==='tips'||cur==='arrivals'||cur==='social')&&text.length<10)err.push('write a few words');
    if([].some.call(document.querySelectorAll('#checks input'),function(c){return !c.checked;}))err.push('tick the boxes at the bottom');
    if(err.length){$('fErr').textContent='Nearly there. Please '+err.join(', ')+'.';$('fErr').classList.add('on');$('fErr').scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'});return;}
    $('fErr').classList.remove('on');
    var imgFiles=files.map(function(f){return f.file;});
    var btn=this.querySelector('button[type=submit]');btn.disabled=true;
    var prog=$('upProg');prog.textContent=imgFiles.length?'Sending photo 1 of '+imgFiles.length+'...':'Sending...';
    API.uploadPhotos(imgFiles,function(n,of){prog.textContent=n<of?'Sending photo '+(n+1)+' of '+of+'...':'Nearly done...';}).then(function(urls){
      return API.call('send',{kind:cur,title:title,show:show,day:$('fDay').value,imgs:urls,n:imgFiles.length||0,text:text,link:link,where:$('fWhere').value.trim()});
    }).then(function(v){
      take(v);
      $('sentOk').innerHTML='<b>Sent.</b> Thanks '+esc(me().first)+', it is in My work now. I will have a look and let you know here when it goes live.';
      $('sentOk').classList.add('on');
      $('sendForm').reset();files.forEach(function(f){URL.revokeObjectURL(f.url);});files=[];drawThumbs();
    }).catch(function(e2){$('fErr').textContent=(e2&&e2.message)||'That did not send. Please try again.';$('fErr').classList.add('on');})
    .then(function(){btn.disabled=false;prog.textContent='';});
  });

  /* ===== my work ===== */
  var filter='all';
  var FILTS=[['all','All'],['photo','Photos'],['video','Video'],['review','Reviews'],['tips','Tips'],['arrivals','Arrivals'],['social','Post ideas']];
  $('filt').innerHTML=FILTS.map(function(f){return '<button type="button" data-f="'+f[0]+'" aria-pressed="'+(f[0]==='all')+'">'+f[1]+'</button>';}).join('');
  $('filt').addEventListener('click',function(e){var b=e.target.closest('[data-f]');if(!b)return;filter=b.dataset.f;[].forEach.call(this.children,function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});renderWork();});
  function picHtml(w){
    var badge=w.n>1?'<span class="n">'+w.n+' files</span>':'';
    if(w.imgs&&w.imgs.length)return '<div class="pic" style="background-image:url('+w.imgs[0]+')">'+(w.k==='video'?'<span class="play"><svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z"/></svg></span>':'')+badge+'</div>';
    return '<div class="pic txt">'+svg(w.k)+badge+'</div>';
  }
  function renderWork(){
    var list=mine().filter(function(w){return filter==='all'||w.k===filter;});
    if(!list.length){$('works').innerHTML='<div class="empty" style="grid-column:1/-1">Nothing here yet. <button class="btn small" type="button" data-go="send">Send something</button></div>';return;}
    $('works').innerHTML=list.map(function(w){var s=T.ST[w.st];
      var msg=w.st==='change'&&w.msg?'<div class="msg">'+esc(w.msg)+'</div>':(w.st==='live'&&w.page?'<div class="msg ok">Live on '+esc(w.page)+'</div>':(w.st==='removal'?'<div class="msg">I will take this off the site and let you know when it is done.</div>':''));
      var acts=(w.st==='change'?'<button type="button" data-fix="'+w.id+'">I have made the change</button>':'')+(w.st!=='removal'?'<button type="button" class="rm" data-rm="'+w.id+'">'+(w.st==='live'?'Ask to take it down':'Cancel this')+'</button>':'');
      return '<article class="wk" style="--sc:'+s[1]+'">'+picHtml(w)+'<div class="bd"><div class="top"><span class="kind">'+T.KIND[w.k]+'</span><span class="pill" style="--pc:'+s[1]+'">'+s[0]+'</span></div><h4>'+esc(w.title)+'</h4><p class="meta">'+esc(w.show)+(w.day?', '+fmt(w.day):'')+'</p>'+msg+'<div class="acts">'+acts+'</div></div></article>';}).join('');
  }
  $('works').addEventListener('click',function(e){
    var rm=e.target.closest('[data-rm]'),fx=e.target.closest('[data-fix]');
    if(rm){var w=D.work.filter(function(x){return String(x.id)===rm.dataset.rm;})[0];if(!w)return;
      API.call(w.st==='live'?'takeDown':'cancel',{id:w.id}).then(function(v){take(v);toast(w.st==='live'?'Asked Jack to take it down':'Cancelled');}).catch(err);}
    if(fx){API.call('fixed',{id:fx.dataset.fix}).then(function(v){take(v);toast('Thanks, Jack will have another look');}).catch(err);}
  });

  /* ===== profile ===== */
  function chips(el,list,sel){el.innerHTML=list.map(function(v){return '<label class="chip"><input type="checkbox" value="'+esc(v)+'"'+(sel.indexOf(v)>=0?' checked':'')+'><span>'+esc(v)+'</span></label>';}).join('');}
  function renderProfile(){var m=me();$('pName').value=m.name;$('pLink').value=m.link;$('pBio').value=m.bio;$('pTeam').checked=m.team!==false;chips($('pRoles'),T.ROLES,m.roles);chips($('pShows'),T.SHOWS,m.shows);credit();}
  function credit(){var n=$('pName').value.trim()||'Your name';$('cpCredit').textContent='© '+n;$('cpBy').textContent='Photo by '+n+($('pLink').value.trim()?', '+$('pLink').value.trim():'');$('cpBio').textContent=$('pBio').value.trim();}
  $('pfForm').addEventListener('input',function(){credit();$('pSaved').classList.remove('on');});
  $('pfForm').addEventListener('submit',function(e){e.preventDefault();
    var n=$('pName').value.trim();if(!n){toast('Add the name you would like on your work');$('pName').focus();return;}
    API.call('profile',{name:n,link:$('pLink').value.trim(),bio:$('pBio').value.trim(),team:$('pTeam').checked,
      roles:[].map.call(document.querySelectorAll('#pRoles input:checked'),function(i){return i.value;}),
      shows:[].map.call(document.querySelectorAll('#pShows input:checked'),function(i){return i.value;})}).then(function(v){D=v;renderHead();$('pSaved').classList.add('on');}).catch(err);});

  var profiled=false;
  function renderAll(){renderHead();renderOverview();renderWork();if(!profiled){renderProfile();profiled=true;}}
  /* in the example, admin changes made in another tab arrive here straight away */
  window.addEventListener('storage',function(e){if(e.key===T.KEY&&D.loggedIn)boot();});
  pickType('photo');boot();
})();
