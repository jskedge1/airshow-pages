/* One way in for the Volunteer Hub and Team Admin pages.
   Inside ukairshowguide.co.uk every request goes to the Wix page code (velo/page-code/volunteer-hub.js or team-admin.js)
   by postMessage, source "ukag-team", and on to velo/backend/team.web.js.
   Opened anywhere else (GitHub, a Claude preview) it answers from the example data in team-demo.js, so the design can be checked.
   Both ways answer with the same shapes:
     me    -> {loggedIn, isAdmin, status: none|waiting|active|paused, meId, vols:{[meId]:vol}, work:[mine], requests, notes:{[meId], all}}
     admin -> {isAdmin, vols:{id:vol}, work:[all], requests, notes:{all, id}, log:[{at,t}]} */
(function(){
  var T=window.TEAM,SOURCE='ukag-team';
  var host='';try{host=document.referrer+' '+(location.ancestorOrigins?[].join.call(location.ancestorOrigins,' '):'');}catch(e){}
  var LIVE=window.parent!==window&&/ukairshowguide|wixsite|wixstudio|editorx|wix\.com|filesusr/i.test(host);
  var waiting={},seq=0,listeners=[];
  window.addEventListener('message',function(e){
    var m=e.data;if(!m||m.source!==SOURCE)return;
    if(m.event){listeners.forEach(function(f){f(m.event);});return;}
    var p=waiting[m.id];if(!p)return;delete waiting[m.id];
    if(m.ok)p.resolve(m.data);else p.reject(new Error(m.error||'Something went wrong. Please try again.'));
  });
  function live(action,payload){
    return new Promise(function(resolve,reject){
      var id='t'+(++seq);waiting[id]={resolve:resolve,reject:reject};
      try{window.parent.postMessage({source:SOURCE,id:id,action:action,payload:payload||{}},'*');}catch(e){}
      var wait=action==='prompt'||action==='login'?600000:(action==='upload'?120000:30000);
      setTimeout(function(){if(waiting[id]){delete waiting[id];reject(new Error('The page could not reach the site. Please refresh and try again.'));}},wait);
    });
  }

  /* ---------- example data answers ---------- */
  var ME='sam',demoIn=false;
  function copy(o){return JSON.parse(JSON.stringify(o));}
  function find(D,id){return D.work.filter(function(w){return String(w.id)===String(id);})[0];}
  function meView(D){
    var v=D.vols[ME],vols={};vols[ME]=v;
    var notes={all:D.notes.all||''};notes[ME]=D.notes[ME]||'';
    return copy({loggedIn:demoIn,isAdmin:true,status:v?v.status:'none',meId:ME,vols:vols,
      work:D.work.filter(function(w){return w.v===ME&&w.st!=='gone'&&w.st!=='no';}).sort(function(a,b){return b.id-a.id;}),
      requests:D.requests,notes:notes});
  }
  function adminView(D){return copy({isAdmin:true,vols:D.vols,work:D.work,requests:D.requests,notes:D.notes,log:D.log});}
  function demo(action,p){
    p=p||{};var D=T.load(),v=D.vols[ME];
    function done(view){T.save(D);return Promise.resolve(view==='admin'?adminView(D):meView(D));}
    switch(action){
      case 'me':return Promise.resolve(meView(D));
      case 'prompt':case 'login':demoIn=true;return Promise.resolve(meView(D));
      case 'logout':demoIn=false;return Promise.resolve(meView(D));
      case 'reset':D=T.reset();return Promise.resolve(meView(D));
      case 'apply':v.status='waiting';v.applied=p.message||'';v.roles=p.roles||v.roles;v.shows=p.shows||v.shows;T.log(D,v.name+' asked to join the team');return done();
      case 'upload':return Promise.resolve({url:p.thumb||''});
      case 'send':
        if(!v||v.status!=='active')return Promise.reject(new Error('Your account is paused at the moment, so sending is switched off.'));
        var w={id:D.next++,v:ME,k:p.kind,title:p.title,show:p.show,day:p.day,st:'sent',imgs:(p.imgs||[]).slice(0,2),local:true,n:p.n||undefined,text:p.text,link:p.link,where:p.where,at:new Date().toISOString()};
        D.work.push(w);T.log(D,v.name+' sent '+T.KIND[p.kind].toLowerCase()+', '+p.title);return done();
      case 'cancel':var c=find(D,p.id);if(c&&c.v===ME){D.work.splice(D.work.indexOf(c),1);T.log(D,v.name+' cancelled '+c.title);}return done();
      case 'takeDown':var t=find(D,p.id);if(t&&t.v===ME){t.st='removal';T.log(D,v.name+' asked for '+t.title+' to come down');}return done();
      case 'fixed':var f=find(D,p.id);if(f&&f.v===ME){f.st='checking';f.msg='';T.log(D,v.name+' made the change on '+f.title);}return done();
      case 'profile':['name','link','bio','roles','shows','team'].forEach(function(k){if(p[k]!=null)v[k]=p[k];});v.first=String(v.name).split(' ')[0];T.log(D,v.name+' updated their profile');return done();
      /* admin */
      case 'admin':return Promise.resolve(adminView(D));
      case 'decide':
        var x=find(D,p.id);if(!x)return done('admin');var who=D.vols[x.v]||{name:'A volunteer'};
        if(p.a==='check'){x.st='checking';T.log(D,'Checking '+x.title+' from '+who.name);}
        if(p.a==='live'){x.st='live';x.page=p.page||'the guide';x.msg='';T.log(D,'Put live: '+x.title+' from '+who.name+', on '+x.page);}
        if(p.a==='change'){x.st='change';x.msg=p.note;T.log(D,'Asked '+who.name+' for a change on '+x.title);}
        if(p.a==='no'){x.st='no';T.log(D,'Not this time: '+x.title+' from '+who.name);}
        if(p.a==='gone'){x.st='gone';T.log(D,'Taken down: '+x.title+' from '+who.name);}
        if(p.a==='keep'){x.st='live';T.log(D,'Kept '+x.title+' live for now, talking to '+who.name);}
        return done('admin');
      case 'vol':
        var vv=D.vols[p.id];if(!vv)return done('admin');
        if(p.a==='on'){vv.status='active';T.log(D,vv.name+' switched on as a volunteer');}
        if(p.a==='pause'){vv.status='paused';T.log(D,vv.name+' paused');}
        if(p.a==='later'){delete D.vols[p.id];T.log(D,vv.name+' not added for now');}
        return done('admin');
      case 'addReq':D.requests.push({id:D.nextReq++,t:p.t,show:p.show,k:p.k,s:p.s});T.log(D,'New request: '+p.t);return done('admin');
      case 'doneReq':var r=D.requests.filter(function(q){return String(q.id)===String(p.id);})[0];if(r){D.requests.splice(D.requests.indexOf(r),1);T.log(D,'Request done: '+r.t);}return done('admin');
      case 'upReq':var ids=D.requests.map(function(q){return String(q.id);}),i=ids.indexOf(String(p.id));if(i>0){var q=D.requests.splice(i,1)[0];D.requests.splice(i-1,0,q);}return done('admin');
      case 'note':if(p.text)D.notes[p.who]=p.text;else delete D.notes[p.who];T.log(D,(p.text?'Note saved for ':'Note cleared for ')+(p.who==='all'?'everyone':(D.vols[p.who]||{name:'a volunteer'}).name));return done('admin');
    }
    return Promise.reject(new Error('Unknown request.'));
  }

  /* photos are made smaller in the browser before they go up, so each one fits through the site */
  function shrink(file,max,q){return new Promise(function(res){
    var u=URL.createObjectURL(file),im=new Image();
    im.onload=function(){try{var s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',q));}catch(e){res('');}URL.revokeObjectURL(u);};
    im.onerror=function(){res('');URL.revokeObjectURL(u);};im.src=u;});}

  window.TEAMAPI={
    LIVE:LIVE,
    call:function(action,payload){return LIVE?live(action,payload):demo(action,payload);},
    on:function(f){listeners.push(f);},
    /* returns a list of Wix Media addresses, or small thumbnails in the example */
    uploadPhotos:function(files,onEach){
      var out=[],chain=Promise.resolve();
      files.forEach(function(f,i){chain=chain.then(function(){
        return (LIVE?shrink(f,2000,.86):shrink(f,360,.7)).then(function(d){
          if(!d)throw new Error(f.name+' could not be read. HEIC photos from iPhones may need saving as JPG first.');
          return LIVE?live('upload',{dataUrl:d,name:f.name}):{url:d};
        }).then(function(r){out.push(r.url);if(onEach)onEach(i+1,files.length);});
      });});
      return chain.then(function(){return out;});
    }
  };
})();
