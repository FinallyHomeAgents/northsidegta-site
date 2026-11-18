import {createHash} from 'node:crypto';
export const events=['page_view','form_start','lead_confirmed','preview_complete'];
export function prefix(env=process.env){return 'northside:toronto-movers:v1:'+(env.VERCEL_ENV==='production'?'production': 'preview:'+createHash('sha256').update(env.VERCEL_URL||'local').digest('hex').slice(0,16))+':';}
const script=`
if redis.call('EXISTS',KEYS[1])==1 then return 0 end
if tonumber(redis.call('GET',KEYS[3]) or '0')>=20000 then return -1 end
redis.call('SET',KEYS[1],'1','EX',7776000)
redis.call('HINCRBY',KEYS[2],ARGV[1],1);redis.call('EXPIRE',KEYS[2],7776000)
redis.call('INCR',KEYS[3]);redis.call('EXPIRE',KEYS[3],172800)
return 1`;
export async function record({event,id}, {env=process.env,command,now=()=>new Date()}={}){
 if(!events.includes(event)||!/^[-a-f0-9]{36}$/i.test(id||''))throw Error('Invalid metric');
 if(env.VERCEL_ENV==='production'&&env.TORONTO_MOVERS_LIVE_ENABLED!=='true')return 0;
 if(event==='lead_confirmed'&&env.VERCEL_ENV!=='production')return 0;
 const p=prefix(env),day=now().toISOString().slice(0,10),hash=createHash('sha256').update(event+':'+id).digest('hex');
 if(!command){const {websiteOutbox}=await import('./headquarters-capture.mjs');const db=websiteOutbox(env);command=c=>db.command(c);}
 const result=await command(['EVAL',script,3,p+'seen:'+hash,p+day,p+'limit:'+day,event]);
 if(env.VERCEL_ENV==='production')console.info(JSON.stringify({metric:'toronto_movers',event,recorded:result===1,duplicate:result===0}));
 return result;
}
export function createMetricsHandler({env=process.env,measure=record}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({ok:false});
 const origins=['https://northsidegta.ca','https://www.northsidegta.ca',...(env.VERCEL_ENV==='preview'&&env.VERCEL_URL?['https://'+env.VERCEL_URL]:[])];
 if(!origins.includes(req.headers?.origin))return res.status(403).json({ok:false});
 if(!req.headers?.['content-type']?.includes('application/json'))return res.status(415).json({ok:false});
 let b;try{const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(!raw||Buffer.byteLength(raw)>200)throw Error();b=JSON.parse(raw);if(!b||Object.keys(b).some(k=>!['event','id'].includes(k))||!['page_view','form_start'].includes(b.event)||!/^[-a-f0-9]{36}$/i.test(b.id||''))throw Error();}catch{return res.status(400).json({ok:false});}
 try{const n=await measure(b,{env});return res.status(n===-1?429:200).json({ok:n!==-1});}catch{return res.status(503).json({ok:false});}
};}
