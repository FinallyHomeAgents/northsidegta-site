const form=document.getElementById('demo'),result=document.getElementById('result'),button=form.querySelector('button[type=submit]');
let busy=false,attempt=null,finished=false;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy||finished)return;
 if(form.dataset.delivery!=='enabled') {result.textContent='Your shortlist preferences are ready. This private preview sends and saves nothing. In the live version, Matthew will review your preferences and follow up personally.';return;}
 if(location.protocol!=='https:'||!['northsidegta.ca','www.northsidegta.ca'].includes(location.hostname)){result.textContent='Requests can only be sent from the approved NorthSide website.';return;}
 busy=true;button.disabled=true;result.textContent='Sending your shortlist request…';
 const fields=Object.fromEntries(new FormData(form));
 const query=new URLSearchParams(location.search);
 fields.referral_source=['facebook','instagram','personal','group'].includes(query.get('utm_source'))?query.get('utm_source'):'direct-or-search';
 fields.placement=['page','profile','local-group','golf-group','relocation-group','reel','story'].includes(query.get('utm_content'))?query.get('utm_content'):'unspecified';
 const fingerprint=JSON.stringify(fields);
 if(!attempt||attempt.fingerprint!==fingerprint)attempt={fingerprint,body:{...fields,submissionId:crypto.randomUUID()}};
 try{
  const response=await fetch('/api/golf-shortlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(attempt.body),signal:AbortSignal.timeout(15000)});
  const data=await response.json();
  if(response.ok&&data.ok===true){finished=true;result.textContent='Your request is received. Matthew will review your preferences and follow up personally.';button.textContent='Request received ✓';}
  else {result.textContent=data.error||'We could not confirm delivery. Please contact our team before submitting again.';if(response.status>=500&&response.status!==503)finished=true;}
 }catch{finished=true;result.textContent='We could not confirm delivery. Your request may have been received. Please contact our team before submitting again.';}
 finally{busy=false;button.disabled=finished;}
});
