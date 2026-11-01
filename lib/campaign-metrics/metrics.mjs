import {createHash} from 'node:crypto';
export const placements=['page','profile','local-group','golf-group','relocation-group','reel','story','pickering-community','markham-community','york-region-community-hub','downtown-toronto-golf-club','unspecified'];
export const sources=['facebook','instagram','personal','group','direct-or-search'];
// Aggregate counts only. No contacts, URLs, IP addresses or persistent visitor IDs.
export const counterScript=`
local n=tonumber(redis.call('GET',KEYS[1]) or '0')
if n>=20000 then return -1 end
if redis.call('EXISTS',KEYS[2])==1 then return 0 end
redis.call('SET',KEYS[2],'1','EX',172800)
redis.call('INCR',KEYS[1]);redis.call('EXPIRE',KEYS[1],172800)
redis.call('HINCRBY',KEYS[3],ARGV[1],1);redis.call('EXPIRE',KEYS[3],7776000)
return 1`;
export async function recordMetric(command,{event,source,placement,id},now=new Date()){
 if(!['page_view','form_start','inquiry_saved'].includes(event)||!sources.includes(source)||!placements.includes(placement)||typeof id!=='string'||id.length>120||!id)throw Error('Invalid metric');
 const day=now.toISOString().slice(0,10),prefix='northside:golf-metrics:v1:';
 const digest=createHash('sha256').update(event+':'+id).digest('hex');
 return command(['EVAL',counterScript,3,prefix+'limit:'+day,prefix+'seen:'+digest,prefix+day,[source,placement,event].join('|')]);
}
export function createMetricsHandler({env=process.env,getCommand,now=()=>new Date()}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({ok:false});
 if(env.NORTHSIDE_GOLF_METRICS_ENABLED!=='true')return res.status(503).json({ok:false});
 if(!['https://northsidegta.ca','https://www.northsidegta.ca'].includes(req.headers?.origin))return res.status(403).json({ok:false});
 if(!req.headers?.['content-type']?.includes('application/json'))return res.status(415).json({ok:false});
 let b;
 try{const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(!raw||Buffer.byteLength(raw)>400)return res.status(413).json({ok:false});b=JSON.parse(raw);
 if(!b||Object.keys(b).some(k=>!['event','source','placement','id'].includes(k))||!['page_view','form_start'].includes(b.event)||!sources.includes(b.source)||!placements.includes(b.placement)||!/^[-a-f0-9]{36}$/i.test(b.id||''))throw Error();
 }catch{return res.status(400).json({ok:false});}
 try{const result=await recordMetric(await getCommand(),b,now());return res.status(result===-1?429:200).json({ok:result!==-1});}catch{return res.status(503).json({ok:false});}
};}
export function measuredOutbox(outbox,{enabled=false,source='direct-or-search',placement='unspecified'}={}){
 return {command:c=>outbox.command(c),enqueue:async lead=>{
 const saved=await outbox.enqueue(lead);
 if(enabled&&!/^(?:NORTHSIDE\b.*\bTEST\b|TEST\b)/i.test(lead.name||'')){
 try{await recordMetric(c=>outbox.command(c),{event:'inquiry_saved',source,placement,id:lead.externalId});}catch{/* Inquiry delivery takes priority over measurement. */}
 }return saved;
 }};
}
