/* Team Admin. Jack's side of the Volunteer Hub, reading and writing the same team data. */
(function(){
  var T=window.TEAM,$=function(id){return document.getElementById(id);},esc=T.esc,svg=T.svg,fmt=T.fmt;
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var API=window.TEAMAPI,D={vols:{},work:[],requests:[],notes:{},log:[]};
  var COLOUR={photo:'#32B4AF',video:'#C2255C',review:'#6950A1',tips:'#D74949',arrivals:'#00A6E2',social:'#2BA84A'};
  var VC={active:'#32B4AF',paused:'#41586B',waiting:'#6950A1'};
  function toast(t){var x=$('toast');x.textContent=t;x.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){x.classList.remove('on');},3200);}
  function vol(id){return D.vols[id]||{name:'Unknown',first:'Unknown',roles:[]};}
  function find(id){return D.work.filter(function(w){return String(w.id)===String(id);})[0];}
  function err(e){toast((e&&e.message)||'Something went wrong. Please try again.');}
  function ask(action,payload,msg){return API.call(action,payload).then(function(v){D=v;render();if(msg)toast(msg);return v;}).catch(err);}
  function short(show){return show.replace(/^(Royal International Air Tattoo)$/,'RIAT').replace(/ (Air Shows|Air Show|Airshow|Air Festival|Air and Car Show)$/,'').replace(/^IWM /,'').replace(/^International /,'');}

  /* ===== tabs ===== */
  var tabs=[].slice.call(document.querySelectorAll('#tabbar [role=tab]'));
  function pickTab(p,scroll){
    tabs.forEach(function(b){var on=b.dataset.p===p;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;$('p-'+b.dataset.p).hidden=!on;});
    if(scroll){window.scrollTo({top:document.querySelector('.tabbar').offsetTop,behavior:reduce?'auto':'smooth'});}
  }
  tabs.forEach(function(b,i){
    b.addEventListener('click',function(){pickTab(b.dataset.p,true);});
    b.addEventListener('keydown',function(e){var n=null;if(e.key==='ArrowRight')n=tabs[(i+1)%tabs.length];if(e.key==='ArrowLeft')n=tabs[(i-1+tabs.length)%tabs.length];if(n){e.preventDefault();pickTab(n.dataset.p);n.focus();}});
  });
  document.querySelector('.flow .here').addEventListener('click',function(e){e.preventDefault();pickTab('queue',true);});
  if(API.LIVE)document.querySelector('.demo').hidden=true;
  $('resetDemo').addEventListener('click',function(){API.call('reset').then(function(){return ask('admin',{},'Example data reset');});});

  /* ===== header ===== */
  function renderHead(){
    var waiting=D.work.filter(function(w){return w.st==='sent'||w.st==='checking'||w.st==='removal';}).length;
    var join=Object.keys(D.vols).filter(function(k){return D.vols[k].status==='waiting';}).length;
    var active=Object.keys(D.vols).filter(function(k){return D.vols[k].status==='active';}).length;
    var live=D.work.filter(function(w){return w.st==='live';}).length;
    var ch=D.work.filter(function(w){return w.st==='change';}).length;
    $('stats').innerHTML=(waiting?'<div class="hl"><span>Waiting for you</span><b>'+waiting+'</b></div>':'<div><span>Waiting for you</span><b>0</b></div>')+
      '<div><span>Asked to join</span><b>'+join+'</b></div><div><span>Active volunteers</span><b>'+active+'</b></div><div><span>Live on the guide</span><b>'+live+'</b></div><div><span>With the volunteer</span><b>'+ch+' change asked</b></div>';
    $('qDot').hidden=!waiting;$('qDot').textContent=waiting;$('vDot').hidden=!join;$('vDot').textContent=join;
  }

  /* ===== queue ===== */
  var qKind='all',qWho='all';
  var KF=[['all','All']].concat(Object.keys(T.KIND).map(function(k){return [k,T.KIND[k]];}));
  $('qFilt').innerHTML=KF.map(function(f){return '<button type="button" data-f="'+f[0]+'" aria-pressed="'+(f[0]==='all')+'">'+f[1]+'</button>';}).join('');
  $('qFilt').addEventListener('click',function(e){var b=e.target.closest('[data-f]');if(!b)return;qKind=b.dataset.f;[].forEach.call(this.children,function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});renderQueue();});
  $('qWho').addEventListener('click',function(e){var b=e.target.closest('[data-w]');if(!b)return;qWho=b.dataset.w;renderQueue();});
  function pic(w){
    var n=w.n>1?'<span class="n">'+w.n+' files</span>':'';
    if(w.imgs&&w.imgs.length)return '<div class="pic" style="background-image:url('+w.imgs[0]+')">'+((w.k==='video'||w.video)?'<span class="play"><svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z"/></svg></span>':'')+n+'</div>';
    return '<div class="pic">'+svg(w.k)+n+'</div>';
  }
  function pageOptions(w){return T.PAGES.map(function(p){var v=p.indexOf('Show page')===0?short(w.show)+', '+p.replace('Show page, ',''):p;return '<option>'+esc(v)+'</option>';}).join('');}
  function renderQueue(){
    var ids=Object.keys(D.vols).filter(function(k){return D.work.some(function(w){return w.v===k&&(w.st==='sent'||w.st==='checking'||w.st==='removal');});});
    $('qWho').innerHTML='<button type="button" data-w="all" aria-pressed="'+(qWho==='all')+'">Everyone</button>'+ids.map(function(k){return '<button type="button" data-w="'+k+'" aria-pressed="'+(qWho===k)+'">'+esc(vol(k).first)+'</button>';}).join('');
    var list=D.work.filter(function(w){return (w.st==='sent'||w.st==='checking'||w.st==='removal')&&(qKind==='all'||w.k===qKind)&&(qWho==='all'||w.v===qWho);}).sort(function(a,b){return (b.st==='removal')-(a.st==='removal')||b.id-a.id;});
    if(!list.length){$('queue').innerHTML='<div class="empty">All caught up. Nothing waiting for you.</div>';return;}
    $('queue').innerHTML=list.map(function(w){var s=T.ST[w.st],v=vol(w.v);
      var body='<div class="who"><span class="mono">'+esc(v.first[0])+'</span><b>'+esc(v.name)+'</b><small>'+esc(v.roles.join(', '))+'</small><span class="pill" style="--pc:'+s[1]+'">'+s[0]+'</span></div>'+
        '<h4>'+esc(w.title)+'</h4><p class="meta">'+T.KIND[w.k]+', '+esc(w.show)+(w.day?', '+fmt(w.day):'')+(w.at?'. Sent '+fmt(w.at):'')+'</p>'+
        (w.where?'<p class="meta">Stood: '+esc(w.where)+'</p>':'')+
        (w.text?'<p class="txt">'+esc(w.text)+'</p>':'')+(w.link?'<p class="lk">Link: '+esc(w.link)+'</p>':'')+
        (w.st==='removal'?'<p class="txt" style="border-left:4px solid #D74949">Live on '+esc(w.page||'the guide')+'. '+esc(v.first)+' has asked for it to come down.</p>':'<p class="ok">✓ '+esc(v.first)+' ticked that this is their own work.</p>');
      var act=w.st==='removal'?
        '<label>Taking it down</label><button type="button" class="no" data-a="gone" data-id="'+w.id+'">It is off the site</button><button type="button" class="ch" data-a="keep" data-id="'+w.id+'">Talk to '+esc(v.first)+' first</button>':
        (w.st==='sent'?'<button type="button" data-a="check" data-id="'+w.id+'" style="background:#1D63B7">Mark as checking</button>':'')+
        '<label for="pg'+w.id+'">Where does it go?</label><select id="pg'+w.id+'">'+pageOptions(w)+'</select>'+
        '<button type="button" data-a="live" data-id="'+w.id+'">Put it live</button>'+
        '<button type="button" class="ch" data-a="opench" data-id="'+w.id+'">Ask for a change</button>'+
        '<div class="hidebox" id="hb'+w.id+'"><label for="ch'+w.id+'">Your note to '+esc(v.first)+'</label><textarea id="ch'+w.id+'" maxlength="400"></textarea><button type="button" class="ch" data-a="change" data-id="'+w.id+'">Send the note</button></div>'+
        '<button type="button" class="no" data-a="no" data-id="'+w.id+'">Not this time</button>';
      return '<article class="qcard" style="--sc:'+s[1]+'">'+pic(w)+'<div class="bd">'+body+'</div><div class="act">'+act+'</div></article>';}).join('');
  }
  $('queue').addEventListener('click',function(e){
    var b=e.target.closest('[data-a]');if(!b)return;var w=find(b.dataset.id);if(!w)return;var v=vol(w.v),a=b.dataset.a,id=b.dataset.id;
    if(a==='opench'){var hb=$('hb'+id);hb.classList.toggle('on');if(hb.classList.contains('on'))$('ch'+id).focus();return;}
    if(a==='check')ask('decide',{id:w.id,a:a},'Marked as checking. '+v.first+' can see that');
    if(a==='live'){var pg=$('pg'+id).value;ask('decide',{id:w.id,a:a,page:pg},'Live. '+v.first+' sees it on '+pg);}
    if(a==='change'){var t=$('ch'+id).value.trim();if(t.length<4){toast('Write a short note first');$('ch'+id).focus();return;}ask('decide',{id:w.id,a:a,note:t+' Jack'},'Note sent to '+v.first);}
    if(a==='no')ask('decide',{id:w.id,a:a},v.first+' gets a thank you note');
    if(a==='gone')ask('decide',{id:w.id,a:a},'Taken down. '+v.first+' gets told');
    if(a==='keep')ask('decide',{id:w.id,a:a},'Kept live. Drop '+v.first+' a message');
  });

  /* ===== volunteers ===== */
  function renderVols(){
    var order={waiting:0,active:1,paused:2};
    var ids=Object.keys(D.vols).sort(function(a,b){return order[D.vols[a].status]-order[D.vols[b].status];});
    $('vols').innerHTML=ids.map(function(k){var v=D.vols[k],my=D.work.filter(function(w){return w.v===k;});
      var live=my.filter(function(w){return w.st==='live';}).length,wait=my.filter(function(w){return w.st==='sent'||w.st==='checking'||w.st==='removal';}).length;
      var lbl={active:'Active',paused:'Paused',waiting:'Asked to join'}[v.status];
      var acts=v.status==='waiting'?'<button type="button" class="go" data-v="on" data-id="'+k+'">Switch them on</button><button type="button" data-v="later" data-id="'+k+'">Not right now</button>':
        (v.status==='active'?'<button type="button" data-v="pause" data-id="'+k+'">Pause</button>':'<button type="button" class="go" data-v="on" data-id="'+k+'">Switch back on</button>')+
        (wait?'<button type="button" data-v="see" data-id="'+k+'">See their '+wait+' waiting</button>':'')+'<button type="button" data-v="note" data-id="'+k+'">Write them a note</button>';
      return '<article class="vc" style="--vc:'+VC[v.status]+'"><div class="top"><span class="mono">'+esc(v.first[0])+'</span><div><h4>'+esc(v.name)+'</h4><span class="r">'+esc(v.roles.join(', '))+'</span></div><span class="pill" style="--pc:'+VC[v.status]+';margin-left:auto">'+lbl+'</span></div>'+
        (v.status==='waiting'?'<div class="ap"><b>Their message.</b> '+esc(v.applied||'')+'</div>':'<div class="nums"><div><b>'+my.length+'</b><span>Sent</span></div><div><b>'+live+'</b><span>Live</span></div><div><b>'+wait+'</b><span>Waiting</span></div></div>')+
        '<p><b>Shows:</b> '+esc(v.shows.join(', '))+'</p>'+(v.link?'<p><b>Credit link:</b> '+esc(v.link)+'</p>':'')+'<p><b>Since:</b> '+fmt(v.joined)+(v.team===false&&v.status!=='waiting'?'. Not shown on Meet the team':'')+'</p>'+
        '<div class="acts">'+acts+'</div></article>';}).join('');
  }
  $('vols').addEventListener('click',function(e){var b=e.target.closest('[data-v]');if(!b)return;var v=D.vols[b.dataset.id],a=b.dataset.v;if(!v)return;
    if(a==='on')ask('vol',{id:b.dataset.id,a:a},v.first+' can use the Volunteer Hub now');
    if(a==='pause')ask('vol',{id:b.dataset.id,a:a},v.first+' is paused. Their live work stays up');
    if(a==='later')ask('vol',{id:b.dataset.id,a:a},'Taken off the list. Remember to reply to '+v.first);
    if(a==='see'){qWho=b.dataset.id;pickTab('queue',true);renderQueue();}
    if(a==='note'){pickTab('notes',true);$('nWho').value=b.dataset.id;loadNote();$('nText').focus();}
  });

  /* ===== requests ===== */
  $('rShow').innerHTML='<option value="">Choose a show</option>'+T.SHOWS.map(function(s){return '<option>'+esc(s)+'</option>';}).join('');
  $('rK').innerHTML=Object.keys(T.KIND).map(function(k){return '<option value="'+k+'">'+T.KIND[k]+'</option>';}).join('');
  function renderReq(){
    $('reqList').innerHTML=D.requests.length?D.requests.map(function(r,i){return '<div class="rq" style="--wc:'+(COLOUR[r.k]||'#32B4AF')+'"><span class="wi">'+svg(r.k)+'</span><div><b>'+esc(r.t)+'</b><span>'+esc(r.show)+'. '+esc(r.s)+'</span></div><div style="display:flex;gap:6px">'+(i?'<button type="button" data-up="'+r.id+'" aria-label="Move up">↑</button>':'')+'<button type="button" data-done="'+r.id+'">Done</button></div></div>';}).join(''):'<p style="color:#B9C9D6;margin:0">Nothing on the list. Volunteers see a "send whatever you have" message.</p>';
  }
  $('reqForm').addEventListener('submit',function(e){e.preventDefault();var f=this,t=$('rT').value.trim(),sh=$('rShow').value,list=[];
    if(!t)list.push('say what you need');if(!sh)list.push('pick the show');
    if(list.length){$('rErr').textContent='Please '+list.join(' and ')+'.';$('rErr').classList.add('on');return;}
    $('rErr').classList.remove('on');
    ask('addReq',{t:t,show:sh,k:$('rK').value,s:$('rS').value.trim()||'Anything you have.'},'Added. The team sees it on their overview').then(function(){f.reset();});});
  $('reqList').addEventListener('click',function(e){var d=e.target.closest('[data-done]'),u=e.target.closest('[data-up]');
    if(d)ask('doneReq',{id:d.dataset.done},'Taken off the list');
    if(u)ask('upReq',{id:u.dataset.up},'Moved up');
  });

  /* ===== notes ===== */
  function fillWho(){var cur=$('nWho').value||'all';$('nWho').innerHTML='<option value="all">Everyone on the team</option>'+Object.keys(D.vols).filter(function(k){return D.vols[k].status!=='waiting';}).map(function(k){return '<option value="'+k+'">'+esc(D.vols[k].name)+'</option>';}).join('');$('nWho').value=cur;if(!$('nWho').value)$('nWho').value='all';}
  function loadNote(){$('nText').value=D.notes[$('nWho').value]||'';prevNote();$('nSaved').classList.remove('on');}
  function prevNote(){var who=$('nWho').value,own=who==='all'?'':$('nText').value.trim(),all=who==='all'?$('nText').value.trim():(D.notes.all||'');
    $('nPrev').innerHTML=(own?'<p>'+esc(own)+'</p>':'')+(all?'<p>'+(own?'<b>For everyone.</b> ':'')+esc(all)+'</p>':'')+(!own&&!all?'<p>No notes from me at the moment. Thanks for everything you send.</p>':'');}
  $('nWho').addEventListener('change',loadNote);$('nText').addEventListener('input',function(){prevNote();$('nSaved').classList.remove('on');});
  $('noteForm').addEventListener('submit',function(e){e.preventDefault();var who=$('nWho').value;
    ask('note',{who:who,text:$('nText').value.trim()}).then(function(v){if(v){$('nWho').value=who;$('nSaved').classList.add('on');}});});

  /* ===== live work and activity ===== */
  function renderLive(){
    var list=D.work.filter(function(w){return w.st==='live';}).sort(function(a,b){return b.id-a.id;});
    $('liveList').innerHTML=list.length?list.map(function(w){var v=vol(w.v);
      var p=w.imgs&&w.imgs.length?'<div class="pic" style="background-image:url('+w.imgs[0]+')"></div>':'<div class="pic txt">'+svg(w.k)+'</div>';
      return '<article class="wk" style="--sc:#0E5F5B">'+p+'<div class="bd"><div class="top"><span class="kind">'+T.KIND[w.k]+'</span><span class="pill" style="--pc:#0E5F5B">Live</span></div><h4>'+esc(w.title)+'</h4><p class="meta">'+esc(v.name)+', '+esc(w.show)+'</p><div class="msg ok">On '+esc(w.page||'the guide')+'</div><div class="acts"><button type="button" class="rm" data-down="'+w.id+'">Take it down</button></div></div></article>';}).join(''):'<div class="empty" style="grid-column:1/-1">Nothing live from the team yet.</div>';
  }
  $('liveList').addEventListener('click',function(e){var b=e.target.closest('[data-down]');if(!b)return;var w=find(b.dataset.down);if(!w)return;ask('decide',{id:w.id,a:'gone'},'Taken down. '+vol(w.v).first+' gets told');});
  function renderLog(){$('log').innerHTML=D.log.map(function(l){return '<li><time>'+T.when(l.at)+'</time><span>'+esc(l.t)+'</span></li>';}).join('')||'<li>Nothing yet.</li>';}

  function render(){renderHead();renderQueue();renderVols();renderReq();fillWho();renderLive();renderLog();}
  /* in the example, things the volunteer does in another tab arrive here straight away */
  window.addEventListener('storage',function(e){if(e.key===T.KEY)ask('admin',{},'Something new from the team');});
  API.on(function(ev){if(ev==='refresh')boot();});
  var first=true;
  function boot(){API.call('admin').then(function(v){D=v;$('locked').hidden=true;$('adminView').hidden=false;render();if(first){loadNote();first=false;}}).catch(function(e){$('locked').hidden=false;$('adminView').hidden=true;$('lockMsg').textContent=(e&&e.message)||'This page is for the site admin only.';});}
  $('lockBtn').addEventListener('click',function(){API.call('login').then(boot).catch(err);});
  boot();
})();
