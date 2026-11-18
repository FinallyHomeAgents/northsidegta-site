import {record} from '../lib/toronto-movers-metrics.mjs';
// Reuses the existing NorthSide protection and website inquiry delivery modules.
// No delivery is possible without BOTH production environment and explicit launch flag.
export function createMoveHandler({env=process.env,guard,deliver,measure=record,now=()=>new Date().toISOString()}={}) {
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false});}
  if(!req.headers?.['content-type']?.includes('application/json'))return res.status(415).json({ok:false});
  const live=env.VERCEL_ENV==='production'&&env.TORONTO_MOVERS_LIVE_ENABLED==='true';
  let b;
  try{const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(!raw||Buffer.byteLength(raw)>8192)return res.status(413).json({ok:false});b=JSON.parse(raw);if(!b||Array.isArray(b)||typeof b!=='object')throw Error();}catch{return res.status(400).json({ok:false,error:'Please check your details.'});}
  if(b['bot-field'])return res.status(200).json({ok:true,preview:!live});
  const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
  const name=clean(b.name,100),email=clean(b.email,254),phone=clean(b.phone,40),needs=clean(b.needs,1500);
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||b.consent!==true||!(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(b.submissionId||''))||(phone&&(!/^[+\d().\s-]+$/.test(phone)||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15)))return res.status(400).json({ok:false,error:'Enter your name, a valid email and optional phone, and confirm contact consent.'});
  let reservation;
  try{const protect=guard||(await import('../lib/homepage-spam.mjs')).createSpamGuard();reservation=await protect(req,b,{name,contact:email,community:'Toronto Movers Move Analysis'});if(reservation.duplicate)return res.status(200).json({ok:true,preview:!live});}
  catch(e){if(e.retryAfter)res.setHeader('Retry-After',String(e.retryAfter));return res.status(e.status||503).json({ok:false,error:e.message||'Please try again later.'});}
  if(!live){await measure({event:'preview_complete',id:b.submissionId},{env}).catch(()=>{});await reservation.release().catch(()=>{});return res.status(200).json({ok:true,preview:true});}
  const configured=env.FORMSPREE_CONTACT_URL||env.REACT_APP_FORMSPREE_CONTACT_URL;
  const destination=configured?(/^https:\/\/formspree\.io\/f\/([a-z0-9]+)$/i.exec(configured)||[])[1]:(env.REACT_APP_FORMSPREE_CONTACT_ID||'mwpborow');
  if(!destination){await reservation.release().catch(()=>{});return res.status(503).json({ok:false,error:'The form is temporarily unavailable.'});}
  const fields={name,email,phone,needs,request:'NorthSide Move Analysis',response_time:'Within two business days',consent:true,consent_text:'I’d like Matthew or Landon to contact me about my move.',submitted_at:now(),marketing_consent:false,_subject:'Toronto Movers — Move Analysis',_replyto:email};
  const mapped={method:req.method,headers:req.headers,socket:req.socket,body:{destination,source:'contact',pageUrl:'https://northsidegta.ca/toronto-movers',submissionId:b.submissionId,fields}};
  // Keep delivery routing and HQ behavior governed by the existing website settings.
  try{
   const send=deliver||(await import('./website-inquiry.js')).default;
   let status=200,result;
   const capture={setHeader:(...args)=>res.setHeader(...args),status(code){status=code;return this;},json(body){result=body;return this;}};
   await send(mapped,capture);
   if(result?.ok){await reservation.complete().catch(()=>{});await measure({event:'lead_confirmed',id:b.submissionId},{env}).catch(()=>{});}else{await reservation.release().catch(()=>{});}
   return res.status(status).json(result||{ok:false,error:'Please contact our team before trying again.'});
  }catch{return res.status(502).json({ok:false,error:'Delivery could not be confirmed. Please contact our team before retrying.'});}
 };
}
export default createMoveHandler();
