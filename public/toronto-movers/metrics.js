// Aggregate measurement only: no field values, URLs, cookies or persistent visitor IDs.
(()=>{
 if(navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;
 const id=crypto.randomUUID(),sent=new Set();
 function send(event){if(sent.has(event))return;sent.add(event);try{fetch('/api/toronto-movers-metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,id}),keepalive:true}).catch(()=>{});}catch{}}
 function visit(){if(document.visibilityState!=='visible')return;send('page_view');document.removeEventListener('visibilitychange',visit);}
 document.addEventListener('visibilitychange',visit);visit();
 document.querySelector('#move-form').addEventListener('input',()=>send('form_start'),{once:true});
})();
