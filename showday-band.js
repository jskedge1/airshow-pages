/* Show Day Live band for the show pages (camping-layout/<show>.html).
   Adds a band above the More air shows band (or the Useful links / footer) with a button that opens
   the Show Day Live page on this show: running order, ear defender alerts, sky compass and crowd reports.
   The Wix page is /show-day-live and reads ?show=<id>. */
(function(){
  var SITE='https://www.ukairshowguide.co.uk/';
  var SHOWS={
    'riat':['riat','Royal International Air Tattoo'],
    'cosford':['cosford','RAF Cosford Air Show'],
    'raf-cosford':['cosford','RAF Cosford Air Show'],
    'duxford':['duxford','Duxford Air Shows'],
    'shuttleworth':['shuttleworth','Shuttleworth Air Shows'],
    'gransden':['little-gransden','Little Gransden Air and Car Show'],
    'little-gransden':['little-gransden','Little Gransden Air and Car Show'],
    'eastbourne':['eastbourne','Eastbourne Airshow'],
    'clacton':['clacton','Clacton Air Show'],
    'wales':['wales','Wales Air Show'],
    'midlands':['midlands','Midlands Air Festival'],
    'blackpool':['blackpool','Blackpool Air Show'],
    'southport':['southport','Southport Air Show'],
    'ayr':['ayr','International Ayr Show'],
    'headcorn':['headcorn','Headcorn Airshow']
  };
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  /* Switched off until the Wix page /show-day-live exists, so the button never leads to a missing page.
     Set to true once that page is on the site. */
  var SHOW_DAY_LIVE_READY=false;
  function go(){
    if(!SHOW_DAY_LIVE_READY) return;
    var file=(location.pathname.split('/').pop()||'').replace(/\.html$/,'').replace(/-v\d+$/,'');
    var s=SHOWS[file];
    if(!s||document.getElementById('sd-band')) return;
    var css='#sd-band{position:relative;overflow:hidden;background:#061019;background-image:radial-gradient(900px 400px at 85% 0,rgba(50,180,175,.22),transparent 60%),linear-gradient(rgba(95,227,220,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(95,227,220,.05) 1px,transparent 1px);background-size:auto,40px 40px,40px 40px;color:#E8F1F6;font-family:"Barlow",Arial,sans-serif;padding:48px 0}'
      +'#sd-band .sd-wrap{max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:24px 48px;align-items:center}'
      +'#sd-band h2{margin:0;font-weight:700;font-size:clamp(30px,4vw,44px);line-height:1;text-transform:uppercase;color:#FFFFFF}'
      +'#sd-band h2 span{color:#32B4AF}'
      +'#sd-band p{margin:12px 0 0;font-size:16px;line-height:1.55;font-weight:500;color:#C9D8E2;max-width:56ch}'
      +'#sd-band ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}'
      +'#sd-band li{border:1px solid rgba(95,227,220,.25);background:rgba(22,52,74,.5);padding:10px 12px;font-weight:600;font-size:15px;color:#E8F1F6}'
      +'#sd-band a.sd-go{display:inline-block;margin-top:20px;background:#32B4AF;color:#061019;font-weight:700;font-size:15px;padding:12px 18px;text-decoration:none;transition:background .25s ease}'
      +'#sd-band a.sd-go:hover{background:#5FE3DC}'
      +'#sd-band a:focus-visible{outline:3px solid #5FE3DC;outline-offset:2px}'
      +'@media(max-width:820px){#sd-band .sd-wrap{grid-template-columns:minmax(0,1fr)}}'
      +'@media(max-width:640px){#sd-band{padding:36px 0}#sd-band .sd-wrap{padding:0 16px}#sd-band ul{grid-template-columns:minmax(0,1fr)}}'
      +'@media(prefers-reduced-motion:reduce){#sd-band a.sd-go{transition:none}}';
    var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
    var sec=document.createElement('section');
    sec.id='sd-band';sec.setAttribute('aria-label','Show Day Live');
    sec.innerHTML='<div class="sd-wrap"><div><h2>Show Day <span>Live</span></h2>'
      +'<p>On the day of '+esc(s[1])+', keep this open on your phone. It shows what is flying now and next, warns you ten minutes before the loud jets, and has a sky compass and crowd reports from members on site.</p>'
      +'<a class="sd-go" href="'+SITE+'show-day-live?show='+s[0]+'" target="_top">Open Show Day Live</a></div>'
      +'<ul><li>Now flying and next up</li><li>Ear defender alerts</li><li>Sky compass and the sun</li><li>Crowd reports</li></ul></div>';
    var anchor=document.getElementById('xl-band')||document.querySelector('section.useful')||document.querySelector('footer');
    if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(sec,anchor); else document.body.appendChild(sec);
  }
  /* wait a moment so the More air shows band from links.js is in place first */
  function start(){setTimeout(go,50);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();

/* Every show page loads this file, so it also brings in the phone tab scroll helper
   (phone-tab-scroll.js): on phones, tapping an option scrolls down to what it opened. */
(function(){
  if(window.UKAG_PHONE_TAB_SCROLL) return;
  var s=document.createElement('script');
  s.src='https://jskedge1.github.io/airshow-pages/phone-tab-scroll.js';
  s.async=true;
  document.head.appendChild(s);
})();
