(()=>{
 const form=document.getElementById('demo');
 if(form?.dataset.metrics!=='enabled'||location.protocol!=='https:'||!['northsidegta.ca','www.northsidegta.ca'].includes(location.hostname)||navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true)return;
 const q=new URLSearchParams(location.search);
 const source=['facebook','instagram','personal','group'].includes(q.get('utm_source'))?q.get('utm_source'):'direct-or-search';
 const placement=['page','profile','local-group','golf-group','relocation-group','reel','story','pickering-community','markham-community','york-region-community-hub','downtown-toronto-golf-club'].includes(q.get('utm_content'))?q.get('utm_content'):'unspecified';
 let id;try{id=crypto.randomUUID();}catch{return;}
 const sent=new Set();
 function send(event){if(sent.has(event))return;sent.add(event);try{fetch('/api/golf-metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,source,placement,id}),keepalive:true}).catch(()=>{});}catch{}}
 function visit(){if(document.visibilityState!=='visible')return;send('page_view');document.removeEventListener('visibilitychange',visit);}
 document.addEventListener('visibilitychange',visit);visit();
 form.addEventListener('input',()=>send('form_start'),{once:true});
})();
