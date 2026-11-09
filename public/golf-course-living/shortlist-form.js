const form=document.getElementById('shortlist-form'),status=document.getElementById('request-status'),button=form.querySelector('button[type=submit]');
let busy=false,attempt=null,finished=false;
function attribution(){const q=new URLSearchParams(location.search);return {referral_source:['facebook','instagram','personal','group'].includes(q.get('utm_source'))?q.get('utm_source'):'direct-or-search',placement:['page','profile','local-group','golf-group','relocation-group','reel','story','pickering-community','markham-community','york-region-community-hub','downtown-toronto-golf-club'].includes(q.get('utm_content'))?q.get('utm_content'):'unspecified'};}
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy||finished)return;
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
 const send=event=>{if(sent.has(event))return;sent.add(event);fetch('/api/golf-living-metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,id,source:a.referral_source,placement:a.placement}),keepalive:true}).catch(()=>{});};
 const visit=()=>{if(document.visibilityState==='visible')send('page_view');};document.addEventListener('visibilitychange',visit);visit();form.addEventListener('input',()=>send('form_start'),{once:true});
}
