/* Shared example data for the Volunteer Hub and Team Admin previews.
   Both pages load this file, so what a volunteer sends shows in the admin queue and the admin's decisions show back in the volunteer's hub.
   On the live site this is replaced by Wix members, a private Team collection and Wix Media. */
(function(){
  var src=(document.currentScript&&document.currentScript.src)||'';
  var IMG=src.replace(/team-demo\.js.*$/,'')+'join-img/';
  var KEY='ukagTeamPreview1';
  var SHOWS=['Royal International Air Tattoo','RAF Cosford Air Show','IWM Duxford Air Shows','Shuttleworth Air Shows','Little Gransden Air and Car Show','Eastbourne Airshow','Clacton Air Show','Wales National Airshow','Midlands Air Festival','Blackpool Air Show','Southport Air Show','International Ayr Show','Headcorn Airshow'];
  var ROLES=['Airshow expert','Photographer','Videographer','Blogger or reviewer','Social media helper','YouTuber, vlogger or TikToker','Plane spotting lead','Organiser liaison'];
  var ST={sent:['Sent','#6950A1'],checking:['Checking','#1D63B7'],live:['Live','#0E5F5B'],change:['Change asked','#D74949'],removal:['Removal asked','#41586B'],no:['Not this time','#41586B'],gone:['Taken down','#41586B']};
  var KIND={photo:'Photos',video:'Video',review:'Review',tips:'Show tips',arrivals:'Arrivals report',social:'Post idea'};
  var ICON={
    photo:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    video:'<rect x="3" y="6" width="13" height="12"/><path d="M16 10l5-3v10l-5-3"/>',
    review:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    tips:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    arrivals:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 12l6-6"/>',
    social:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-3.8M8.2 13l7.6 3.8"/>'
  };
  var PAGES=['Show page, Overview','Show page, Getting there and parking','Show page, Where to watch','Show page, Aircraft line up','Show page, Plan your day','Show page, Photography','Show page, Food and facilities','Airshow Photography Hub','Camping At Airshows','Airshow News','Facebook and Instagram','YouTube channel'];
  function seed(){
    return {
      v:1,
      vols:{
        sam:{id:'sam',name:'Sam Carter',first:'Sam',link:'instagram.com/samshootsjets',bio:'Eastbourne regular since I was a kid. Nikon Z6 and a lot of patience.',roles:['Photographer','Blogger or reviewer'],shows:['Eastbourne Airshow','IWM Duxford Air Shows','Royal International Air Tattoo'],status:'active',joined:'2026-08-02',team:true},
        priya:{id:'priya',name:'Priya Shah',first:'Priya',link:'',bio:'Scanner, notebook and a flask. RIAT every year.',roles:['Plane spotting lead'],shows:['Royal International Air Tattoo','RAF Cosford Air Show'],status:'active',joined:'2026-07-10',team:true},
        dan:{id:'dan',name:'Dan Hughes',first:'Dan',link:'youtube.com/@danfilmsflight',bio:'Films walk rounds and arrivals.',roles:['Videographer','YouTuber, vlogger or TikToker'],shows:['IWM Duxford Air Shows','Shuttleworth Air Shows'],status:'active',joined:'2026-09-01',team:true},
        megan:{id:'megan',name:'Megan Lloyd',first:'Megan',link:'',bio:'Swansea local, knows the seafront inside out.',roles:['Airshow expert'],shows:['Wales National Airshow','Blackpool Air Show','Southport Air Show'],status:'paused',joined:'2026-06-20',team:true},
        tom:{id:'tom',name:'Tom Reid',first:'Tom',link:'flickr.com/tomreidaviation',bio:'',roles:['Photographer'],shows:['Clacton Air Show','Eastbourne Airshow'],status:'waiting',joined:'2026-11-02',team:false,applied:'I have been shooting Clacton for six years and would love to help with the seafront pages.'}
      },
      work:[
        {id:1,v:'sam',k:'photo',title:'Typhoon on the static park',show:'Royal International Air Tattoo',day:'2026-07-18',st:'live',page:'RIAT, Where to watch',imgs:[IMG+'vh-typhoon.webp'],n:6,at:'2026-07-21'},
        {id:2,v:'sam',k:'photo',title:'Seafront walk from the station',show:'Eastbourne Airshow',day:'2026-08-14',st:'checking',imgs:[IMG+'vh-swordfish.webp'],n:9,where:'Grand Parade, walking from the station',at:'2026-10-28'},
        {id:3,v:'sam',k:'review',title:'Eastbourne Friday with the kids',show:'Eastbourne Airshow',day:'2026-08-14',st:'change',msg:'Could you add a line about how long the queue was at the Western Lawns toilets? Otherwise it is spot on. Jack',text:'We got there about 10 and parked at the station. The walk along the front took us twenty minutes with the buggy, and we found a spot on the shingle by the bandstand. The Red Arrows were the highlight for both kids.',at:'2026-10-26'},
        {id:4,v:'sam',k:'video',title:'Chinook display from the crowd line',show:'IWM Duxford Air Shows',day:'2026-09-12',st:'live',page:'Duxford, Aircraft line up',imgs:[IMG+'vh-chinook.webp'],at:'2026-09-15'},
        {id:5,v:'sam',k:'tips',title:'Duxford car park tips',show:'IWM Duxford Air Shows',day:'2026-09-12',st:'live',page:'Duxford, Getting there',text:'Arrive by 8:30 for the M11 side car park. The far end is closer to the exit.',at:'2026-09-14'},
        {id:6,v:'sam',k:'photo',title:'B-17 Sally B flypast',show:'IWM Duxford Air Shows',day:'2026-09-12',st:'sent',imgs:[IMG+'vh-b17.webp'],n:3,at:'2026-11-01'},
        {id:7,v:'priya',k:'arrivals',title:'RIAT Thursday arrivals',show:'Royal International Air Tattoo',day:'2026-07-16',st:'sent',text:'10:42 Rafale x2 landed 27. 11:15 F-35A. 13:05 Il-76 was expected but did not turn up.',at:'2026-11-02'},
        {id:8,v:'dan',k:'video',title:'Apache arrival from the north side',show:'IWM Duxford Air Shows',day:'2026-09-11',st:'sent',imgs:[IMG+'vh-apache.webp'],link:'youtube.com/watch?v=example',where:'North side, by the hard standing',at:'2026-11-03'},
        {id:9,v:'megan',k:'tips',title:'Swansea seafront parking',show:'Wales National Airshow',day:'2026-07-05',st:'removal',page:'Wales, Getting there',text:'The Civic Centre car park fills by 9. Try the park and ride at Fabian Way instead.',at:'2026-10-30'}
      ],
      next:10,
      requests:[
        {id:1,t:'Clacton car park photos',show:'Clacton Air Show',k:'photo',s:'The seafront car parks, early morning, for the Getting there section.'},
        {id:2,t:'A Duxford review from a family',show:'IWM Duxford Air Shows',k:'review',s:'How the day went with young children.'},
        {id:3,t:'RIAT Friday arrivals',show:'Royal International Air Tattoo',k:'arrivals',s:'Anything rare, with times.'}
      ],
      nextReq:4,
      notes:{
        all:'Thanks everyone for a brilliant season. Over the winter I am after photos of gates, car parks and toilets, as they help first timers more than anything.',
        sam:'Hi Sam, thanks for the Eastbourne photos last week. The seafront ones are going on the Getting there section, as they show the walk from the station really well. I have asked for one small change on your review. Have a look in My work when you get a minute.'
      },
      log:[
        {at:'2026-11-03T09:10:00',t:'Dan Hughes sent a video, Apache arrival from the north side'},
        {at:'2026-11-02T18:40:00',t:'Tom Reid asked to join the team'},
        {at:'2026-11-02T12:05:00',t:'Priya Shah sent an arrivals report, RIAT Thursday arrivals'},
        {at:'2026-10-30T20:15:00',t:'Megan Lloyd asked for Swansea seafront parking to come down'}
      ]
    };
  }
  var mem=null;
  function load(){
    try{var s=localStorage.getItem(KEY);if(s){var d=JSON.parse(s);if(d&&d.v===1)return d;}}catch(e){}
    if(!mem)mem=seed();return mem;
  }
  function save(d){mem=d;try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){
    /* storage full, usually from big photos: drop the newest thumbnails and try again */
    try{d.work.forEach(function(w){if(w.local)w.imgs=[];});localStorage.setItem(KEY,JSON.stringify(d));}catch(e2){}
  }}
  function reset(){try{localStorage.removeItem(KEY);}catch(e){}mem=null;return load();}
  function log(d,t){d.log.unshift({at:new Date().toISOString(),t:t});d.log=d.log.slice(0,60);}
  /* small thumbnail so the admin page can see an upload in the preview */
  function thumb(file){return new Promise(function(res){
    if(!file||file.type.indexOf('image')!==0){res('');return;}
    var u=URL.createObjectURL(file),im=new Image();
    im.onload=function(){try{var w=360,h=Math.round(im.height*w/im.width),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);res(c.toDataURL('image/jpeg',.7));}catch(e){res('');}URL.revokeObjectURL(u);};
    im.onerror=function(){res('');URL.revokeObjectURL(u);};im.src=u;});}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function svg(k){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(ICON[k]||'')+'</svg>';}
  function fmt(d){if(!d)return '';var x=new Date(String(d).length===10?d+'T12:00:00':d);return isNaN(x)?'':x.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});}
  function when(d){var x=new Date(d);if(isNaN(x))return '';return x.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+', '+x.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}
  window.TEAM={KEY:KEY,IMG:IMG,SHOWS:SHOWS,ROLES:ROLES,ST:ST,KIND:KIND,ICON:ICON,PAGES:PAGES,load:load,save:save,reset:reset,log:log,thumb:thumb,esc:esc,svg:svg,fmt:fmt,when:when};
})();
