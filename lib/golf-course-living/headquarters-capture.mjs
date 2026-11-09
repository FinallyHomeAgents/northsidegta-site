import {randomUUID} from 'node:crypto';
import {InquiryOutbox} from './inquiry-outbox.mjs';
import {deliverInquiry} from './deliver-inquiry.mjs';
export function websiteOutbox(env=process.env,fetcher=fetch){
 const url=new URL(env.KV_REST_API_URL||env.UPSTASH_REDIS_REST_URL);
 const token=env.KV_REST_API_TOKEN||env.UPSTASH_REDIS_REST_TOKEN;
 if(url.protocol!=='https:'||!url.hostname.endsWith('.upstash.io')||url.username||url.password||url.port||url.search||url.hash||url.pathname!=='/'||!token)throw Error('Approved website Redis connection required.');
 return new InquiryOutbox(async command=>{
  const response=await fetcher(url.origin,{method:'POST',redirect:'error',signal:AbortSignal.timeout(5000),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(command)});
  if(!response.ok)throw Error('Outbox unavailable.');
  const data=await response.json();if(data.error)throw Error('Outbox unavailable.');return data.result;
 });
}
export async function queueHomepageInquiry(payload,{outbox,now=()=>new Date().toISOString(),id=randomUUID}={}){
 const inbox=outbox||websiteOutbox();
 let pageUrl='https://northsidegta.ca/';
 try{const u=new URL(payload.pageUrl);if(u.protocol==='https:'&&['northsidegta.ca','www.northsidegta.ca'].includes(u.hostname))pageUrl=u.origin+u.pathname;}catch{}
 return inbox.enqueue({version:1,source:'homepage',externalId:/^[a-f0-9-]{36}$/i.test(payload.submissionId||'')?payload.submissionId:id(),receivedAt:now(),name:payload.name,email:payload.contact.includes('@')?payload.contact:'',phone:payload.contact.includes('@')?'':payload.contact,message:'Selected community: '+payload.community,pageUrl,consent:{purpose:'requested-response',status:'unknown',marketing:false,evidence:'Homepage request; no separate contact-consent evidence supplied by this form.'}});
}
// To be called only by an authenticated scheduled worker after rollout approval.
export async function drainHeadquartersOutbox(env=process.env,fetcher=fetch,getToken=async()=> (await import('@vercel/oidc')).getVercelOidcToken()){
 if(env.NORTHSIDE_HQ_CAPTURE_ENABLED!=='true')return {disabled:true};
 const outbox=websiteOutbox(env,fetcher);
 const oidcToken=await getToken();
 if(!oidcToken)throw Error('Deployment identity unavailable.');
 return outbox.drain(lead=>deliverInquiry({lead,url:env.NORTHSIDE_HQ_INTAKE_URL,secret:env.NORTHSIDE_HQ_SIGNING_SECRET,oidcToken,fetcher}));
}
