import {createWebsiteInquiryHandler} from './website-inquiry.mjs';
const choices={homeType:['Open to ideas','Detached','Townhome','Condo','Bungalow','Country property'],course:['No preference yet','Mill Run','Wooden Sticks','Another course'],timing:['Just exploring','Within 6 months','6–12 months','Later']};
export function shortlistEnvelope(body,env){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['submissionId','name','email','budget','homeType','course','timing','priorities','company','referral_source','placement'].includes(k)))throw Error('Invalid request');
 const value=(key,max)=>{const v=body[key]??'';if(typeof v!=='string'||v.length>max)throw Error('Invalid field');return v.trim();};
 const name=value('name',100),email=value('email',200);
 if(!name||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Contact details required');
 const fields={name,email,budget:value('budget',100),priorities:value('priorities',1500),company:value('company',100)};
 for(const [key,options]of Object.entries(choices)){const v=value(key,100)||options[0];if(!options.includes(v))throw Error('Invalid choice');fields[key]=v;}
 for(const [key,options]of Object.entries({referral_source:['facebook','instagram','personal','group','direct-or-search'],placement:['page','profile','local-group','golf-group','relocation-group','reel','story','pickering-community','markham-community','york-region-community-hub','downtown-toronto-golf-club','unspecified']})){const v=value(key,50)||options.at(-1);if(!options.includes(v))throw Error('Invalid attribution');fields[key]=v;}
 const destination=env.NORTHSIDE_GOLF_FORMSPREE_ID;
 if(!/^[a-z0-9]+$/.test(destination||''))throw Error('Destination missing');
 return {source:'listing-request',destination,submissionId:body.submissionId,pageUrl:'https://northsidegta.ca/uxbridge-golf-living/',fields:{...fields,request_type:'Personalized Uxbridge Golf & Home Shortlist',community:'Uxbridge',preferred_responder:'Matthew Mulhall',contact_consent:'Please respond to my shortlist request. No marketing subscription requested.'}};
}
export function createGolfShortlistHandler({env=process.env,...deps}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({ok:false});
  if(env.NORTHSIDE_GOLF_SHORTLIST_ENABLED!=='true'||env.NORTHSIDE_HQ_FORMS_ENABLED!=='true')return res.status(503).json({ok:false,error:'This shortlist form is not accepting requests yet.'});
  if(!req.headers?.['content-type']?.includes('application/json'))return res.status(415).json({ok:false});
  let envelope;
  try{const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(Buffer.byteLength(raw)>8000)return res.status(413).json({ok:false});envelope=shortlistEnvelope(JSON.parse(raw),env);}catch{return res.status(400).json({ok:false,error:'Please check your details.'});}
  return createWebsiteInquiryHandler({env:{...env,REACT_APP_FORMSPREE_BUYERS_ID:env.NORTHSIDE_GOLF_FORMSPREE_ID},...deps})({method:req.method,headers:req.headers,socket:req.socket,body:envelope},res);
 };
}
