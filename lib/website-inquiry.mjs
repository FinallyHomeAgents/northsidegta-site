import {createHash} from 'node:crypto';
const text = v => typeof v === 'string' ? v.trim() : '';
const sources = new Set(['contact', 'quick-contact', 'listing-request']);
const defaultDestinations = ['mwpborow', 'xanbzajw', 'xblkwrzj'];
function destinations(env) {
 const configured = ['FORMSPREE_CONTACT_URL','FORMSPREE_ENDPOINT','REACT_APP_FORMSPREE_CONTACT_URL'].map(k => env[k] || '');
 const ids = ['REACT_APP_FORMSPREE_ID','REACT_APP_FORMSPREE_BUYERS_ID','REACT_APP_FORMSPREE_CONTACT_ID'].map(k => env[k]).filter(Boolean);
 for (const url of configured) { const match = /^https:\/\/formspree\.io\/f\/([a-z0-9]+)$/i.exec(url); if(match) ids.push(match[1]); }
 return new Set([...defaultDestinations, ...ids]);
}
export function normalizeWebsiteInquiry(body, env = process.env, now = () => new Date().toISOString()) {
 if (!body || !sources.has(body.source) || !destinations(env).has(body.destination) || !/^[a-f0-9-]{36}$/i.test(body.submissionId || '')) throw Error('Invalid form reference.');
 const f = body.fields;
 if (!f || typeof f !== 'object' || Array.isArray(f) || Object.keys(f).length > 80) throw Error('Invalid form fields.');
 for (const [key, value] of Object.entries(f)) {
  if (!/^[a-zA-Z0-9_ -]{1,80}$/.test(key) || !['string','number','boolean'].includes(typeof value) || String(value).length > 5000) throw Error('Invalid form field.');
 }
 if (['_gotcha','nickname','company','bot-field'].some(k => text(f[k]))) return {spam:true};
 const contact = text(f.contact);
 const name = text(f.name || f.seller_name || f.referring_agent_name) || [text(f.first_name),text(f.last_name)].filter(Boolean).join(' ');
 const email = text(f.email || f.seller_email || f.agent_email || (contact.includes('@') ? contact : ''));
 const phone = text(f.phone || f.seller_phone || f.agent_phone || (!contact.includes('@') ? contact : ''));
 if (name.length>200 || email.length>320 || phone.length>100 || (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.replace(/\D/g,'').length<10)) throw Error('Please provide a valid email or phone number.');
 const url = new URL(body.pageUrl);
 if(url.protocol!=='https:' || !['northsidegta.ca','www.northsidegta.ca'].includes(url.hostname) || url.port || url.username || url.password) throw Error('Invalid source page.');
 const pageUrl = url.origin + url.pathname;
 // Preserve useful inquiry context. Full original fields still reach Formspree.
 const excluded = /^(?:name|email|phone|first_name|last_name|seller_name|seller_phone|seller_email|agent_email|agent_phone|referring_agent_name|_replyto|_gotcha|nickname|company|utm_.*|.*url|.*timestamp|submitted_at|device|referrer|landing_page)$/i;
 const details = Object.entries(f).filter(([key,value]) => !excluded.test(key) && String(value).trim()).map(([key,value])=>`${key}: ${value}`).join('\n');
 const message = details.length > 4900 ? details.slice(0,4900)+'\n[Additional details retained in the original Formspree submission.]' : details;
 return {fields:f, destination:body.destination, lead:{version:1,source:body.source,
  externalId:body.destination+':'+body.submissionId,receivedAt:now(),name,email,phone,message,pageUrl,
  consent:{purpose:'requested-response',status:'unknown',marketing:false,evidence:'Original form consent fields retained in inquiry details. Review their wording before outreach; no marketing authorization inferred.'}}};
}
export function createWebsiteInquiryHandler({env=process.env,fetcher=fetch,getOutbox,now}={}) {
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false});}
  if(!req.headers?.['content-type']?.includes('application/json')) return res.status(415).json({ok:false});
  const origin=req.headers?.origin;
  if(origin){try{const u=new URL(origin);if(u.protocol!=='https:'||!['northsidegta.ca','www.northsidegta.ca',env.VERCEL_URL,env.VERCEL_BRANCH_URL].filter(Boolean).includes(u.hostname))return res.status(403).json({ok:false});}catch{return res.status(403).json({ok:false});}}
  let normalized;
  try {
   const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);
   if(!raw || Buffer.byteLength(raw)>24000) return res.status(413).json({ok:false});
   normalized=normalizeWebsiteInquiry(JSON.parse(raw),env,now);
  }catch{return res.status(400).json({ok:false,error:'Please check your contact details and try again.'});}
  if(normalized.spam)return res.status(200).json({ok:true});
  try {
   if(env.NORTHSIDE_HQ_FORMS_ENABLED==='true') {
    const outbox=await getOutbox();
    // Bound abuse without writing raw contact details into rate-limit keys.
    const ip=String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
    const key='northside:form-rate:'+createHash('sha256').update(ip).digest('hex');
    const count=await outbox.command(['EVAL',"local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n",1,key]);
    if(Number(count)>30){res.setHeader('Retry-After','600');return res.status(429).json({ok:false,error:'Please wait before trying again.'});}
    await outbox.enqueue(normalized.lead);
   }
  }catch{return res.status(503).json({ok:false,error:'Unable to save your inquiry. Please try again.'});}
  try{
   const response=await fetcher('https://formspree.io/f/'+normalized.destination,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(normalized.fields)});
   if(!response.ok)return res.status(502).json({ok:false,error:'Unable to send your inquiry. Please try again.'});
   return res.status(200).json({ok:true});
  }catch{return res.status(502).json({ok:false,error:'Unable to send your inquiry. Please try again.'});}
 };
}
