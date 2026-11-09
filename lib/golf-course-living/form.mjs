import {createWebsiteInquiryHandler} from './website-inquiry.mjs';
import {sources,placements} from './metrics.mjs';
export const canonical='https://northsidegta.ca/golf-course-living/';
export function golfLivingEnvelope(body,env){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['submissionId','name','email','town','otherTown','home','budget','preferences','unrepresented','company','referral_source','placement'].includes(k)))throw Error('Invalid request');
 const value=(key,max)=>{const v=body[key]??'';if(typeof v!=='string'||v.length>max)throw Error('Invalid field');return v.trim();};
 const name=value('name',100),email=value('email',200);if(!name||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||body.unrepresented!==true)throw Error('Contact details and representation confirmation required');
 const fields={name,email,budget:value('budget',100),preferences:value('preferences',1500),company:value('company',100)};
 for(const [key,options] of Object.entries({town:['Open to all three','Uxbridge','Aurora','Stouffville','Other','Unsure'],home:['Open to suggestions','Bungalow','Detached home','Townhome','Rural property'],referral_source:sources,placement:placements})){
 const v=value(key,100)||(['referral_source','placement'].includes(key)?options.at(-1):'');if(!options.includes(v))throw Error('Invalid choice');fields[key]=v;
 }
 fields.otherTown=fields.town==='Other'?value('otherTown',100):'';
 const destination=env.NORTHSIDE_GOLF_FORMSPREE_ID;if(!/^[a-z0-9]+$/.test(destination||''))throw Error('Destination missing');
 return {source:'listing-request',destination,submissionId:body.submissionId,pageUrl:canonical,fields:{...fields,request_type:'Golf & Home Shortlist — three-town guide',community:fields.town==='Other'?fields.otherTown||'Other town':fields.town,campaign:'golf-course-living',representation_confirmation:'Not currently represented by another brokerage for this property search',contact_consent:'Please respond to my shortlist request. No marketing subscription requested.'}};
}
export function createGolfLivingHandler({env=process.env,...deps}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({ok:false});
 if(env.NORTHSIDE_GOLF_LIVING_FORM_ENABLED!=='true'||env.NORTHSIDE_HQ_FORMS_ENABLED!=='true')return res.status(503).json({ok:false,error:'This shortlist is not accepting requests yet.'});
 if(!['https://northsidegta.ca','https://www.northsidegta.ca'].includes(req.headers?.origin))return res.status(403).json({ok:false});
 if(!req.headers?.['content-type']?.includes('application/json'))return res.status(415).json({ok:false});
 let envelope;try{const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(Buffer.byteLength(raw)>8000)return res.status(413).json({ok:false});envelope=golfLivingEnvelope(JSON.parse(raw),env);}catch{return res.status(400).json({ok:false,error:'Please check your details and confirmation.'});}
 return createWebsiteInquiryHandler({env:{...env,REACT_APP_FORMSPREE_BUYERS_ID:env.NORTHSIDE_GOLF_FORMSPREE_ID},...deps})({...req,method:req.method,headers:req.headers,socket:req.socket,body:envelope},res);
};}
