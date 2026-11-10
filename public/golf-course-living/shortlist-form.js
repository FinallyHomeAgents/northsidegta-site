const form=document.getElementById('shortlist-form'),status=document.getElementById('request-status'),button=form.querySelector('button[type=submit]');
let busy=false,attempt=null,finished=false;
// A fixed vocabulary prevents raw URLs or personal data entering aggregate counters.
const knownPlacements=['page', 'profile', 'local-group', 'golf-group', 'relocation-group', 'reel', 'story', 'pickering-community', 'markham-community', 'york-region-community-hub', 'downtown-toronto-golf-club', 'reel-v17-bio', 'toronto-regional-small-business', 'toronto-business-owners', 'local-business-toronto', 'big-buy-sell-gta', 'ontario-business-marketing','small-business-toronto','gta-business-community','north-york-gta-community','golf-lovers-toronto-gta','fun-things-toronto'];
function attribution(){
 const q=new URLSearchParams(location.search),source=q.get('utm_source');
 const term=q.get('utm_term'),content=q.get('utm_content');
 return {referral_source:['facebook','instagram','personal','group'].includes(source)?source:'direct-or-search',placement:source==='facebook'&&knownPlacements.includes(term)?term:knownPlacements.includes(content)?content:'unspecified'};
}
const testParameter=new URLSearchParams(location.search).get('northside_test');
let testMode=testParameter==='1';
try{if(testParameter==='1')sessionStorage.setItem('northside-golf-test','1');if(testParameter==='0')sessionStorage.removeItem('northside-golf-test');testMode=sessionStorage.getItem('northside-golf-test')==='1';}catch{}
if(testMode){
 const notice=document.createElement('aside');notice.setAttribute('role','status');notice.style.cssText='position:sticky;top:0;z-index:9999;padding:12px;background:#fff2bf;color:#172b23;text-align:center;font:16px sans-serif';
 notice.append('Internal test mode — visits and form starts are separated. No inquiry will be sent. ');
 const exit=document.createElement('a'),url=new URL(location.href);url.searchParams.set('northside_test','0');exit.href=url.href;exit.textContent='Exit test mode';notice.append(exit);document.body.prepend(notice);
}
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy||finished)return;if(testMode){status.textContent='Internal test only. No inquiry was sent.';return;}
 if(form.dataset.delivery!=='enabled'){status.textContent='Private launch rehearsal. Nothing was sent or saved.';return;}
 if(location.protocol!=='https:'||!['northsidegta.ca','www.northsidegta.ca'].includes(location.hostname)){status.textContent='Requests can only be sent from NorthSide GTA.';return;}
 const fields={...Object.fromEntries(new FormData(form)),...attribution(),unrepresented:form.elements.unrepresented.checked};
 if(fields.town!=='Other')fields.otherTown='';
 const fingerprint=JSON.stringify(fields);if(!attempt||attempt.fingerprint!==fingerprint)attempt={fingerprint,body:{...fields,submissionId:crypto.randomUUID()}};
 busy=true;button.disabled=true;status.textContent='Sending your shortlist request…';
 try{const response=await fetch('/api/golf-living-shortlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(attempt.body),signal:AbortSignal.timeout(15000)});const data=await response.json();
 if(response.ok&&data.ok){finished=true;status.textContent='Your request is received. Our team will review your preferences and follow up personally.';button.textContent='Request received ✓';}
 else{status.textContent=data.error||'Delivery is not confirmed. Please contact our team before submitting again.';if(response.status>=500&&response.status!==503)finished=true;}
 }catch{finished=true;status.textContent='Delivery is not confirmed. Please contact our team before submitting again.';}finally{busy=false;button.disabled=finished;}
});
if(form.dataset.metrics==='enabled'&&location.protocol==='https:'&&['northsidegta.ca','www.northsidegta.ca'].includes(location.hostname)&&navigator.doNotTrack!=='1'&&navigator.globalPrivacyControl!==true){
 const id=crypto.randomUUID(),sent=new Set(),a=attribution();
 const send=event=>{if(sent.has(event))return;sent.add(event);fetch('/api/golf-living-metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,id,source:a.referral_source,placement:a.placement,audience:testMode?'internal-test':'visitor'}),keepalive:true}).catch(()=>{});};
 const visit=()=>{if(document.visibilityState==='visible')send('page_view');};document.addEventListener('visibilitychange',visit);visit();form.addEventListener('input',()=>send('form_start'),{once:true});
}
