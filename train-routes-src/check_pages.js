// Opens a built train page at both Wix widths, clicks through every station, day, direction and train,
// and reports errors, any "undefined"/"NaN" text, and the tallest page height (plus room for live tags).
// Usage: node check_pages.js eastbourne     (needs Playwright, which the cloud workspace has)
const {chromium}=require('playwright');const path=require('path');
const show=process.argv[2]||'eastbourne';const file='file://'+path.resolve(__dirname,'..','train-routes',show+'.html');
(async()=>{const b=await chromium.launch();
for (const w of [980,320]){const p=await b.newPage({viewport:{width:w,height:900},isMobile:w<700});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/huxley|davwheat/,r=>r.abort());
await p.goto(file,{waitUntil:'load'});await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{const out=[];const sl=ms=>new Promise(r=>setTimeout(r,ms));const bad=[];
 const hubs=document.querySelectorAll('#hub button').length, days=document.querySelectorAll('#day button').length;
 for(let h=0;h<hubs;h++){document.querySelectorAll('#hub button')[h].click();await sl(40);
  for(let dy=0;dy<days;dy++){document.querySelectorAll('#day button')[dy].click();await sl(40);
  for(let d=0;d<2;d++){document.querySelectorAll('#dir button')[d].click();await sl(40);
   const n=document.querySelectorAll('#board .dep').length; if(!n) bad.push(['no trains',h,dy,d]);
   for(let k=0;k<n;k++){document.querySelectorAll('#board .dep')[k].click();await sl(8);
    const t=document.body.innerText; if(/undefined|NaN|null/.test(t)) bad.push(['bad text',h,dy,d,k,(t.match(/.{30}(undefined|NaN|null).{30}/)||[''])[0]]);
    const extra=document.querySelectorAll('.jl-node').length*(innerWidth<700?30:34);
    out.push([document.body.scrollHeight+extra,h,dy,d,k]);}}}}
 out.sort((a,b)=>b[0]-a[0]);return {tallest:out[0],journeys:out.length,problems:bad.slice(0,10)};});
console.log('width',w,JSON.stringify(r),'script errors',JSON.stringify(errs.slice(0,3)));await p.close();}
await b.close();})();
