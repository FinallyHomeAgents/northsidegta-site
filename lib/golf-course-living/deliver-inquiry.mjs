// Proposed server-side integration only. Not installed on northsidegta.ca.
import {createHmac,createHash} from 'node:crypto';
export async function deliverInquiry({lead,url,secret,oidcToken,fetcher=fetch,now=Date.now}){
 const endpoint=new URL(url);
 if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.port||endpoint.search||endpoint.hash||endpoint.pathname!=='/api/lead-intake')throw Error('An approved HTTPS intake endpoint is required.');
 if(typeof secret!=='string'||Buffer.byteLength(secret)<32)throw Error('Server signing credential missing.');
 if(oidcToken&&endpoint.hostname!=='northside-intake-service.vercel.app')throw Error('Deployment identity may only be sent to the approved intake service.');
 const raw=JSON.stringify(lead);if(Buffer.byteLength(raw)>16000)throw Error('Inquiry exceeds size limit.');
 const timestamp=String(now());
 const signature=createHmac('sha256',secret).update(`POST\n/api/lead-intake\n${timestamp}\n`).update(raw).digest('hex');
 const response=await fetcher(endpoint.href,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json','X-Northside-Timestamp':timestamp,'X-Northside-Signature':'v1='+signature,...(oidcToken?{'x-vercel-trusted-oidc-idp-token':oidcToken}:{})},body:raw});
 if(!response.ok)throw Error('Headquarters has not acknowledged this inquiry.');
 const acknowledgment=await response.json();
 if(acknowledgment.ok!==true||acknowledgment.id!==createHash('sha256').update(lead.source+'\0'+lead.externalId).digest('hex'))throw Error('Invalid headquarters acknowledgment.');
 return acknowledgment.id;
}
// A durable outbox must save the exact envelope and stable externalId BEFORE this call.
// Only remove it after acknowledgment. Retry transient failures with backoff; quarantine
// permanent validation/conflict errors for operator review. Never generate a new ID on retry.
// Never put this helper or its credentials in a frontend bundle.
