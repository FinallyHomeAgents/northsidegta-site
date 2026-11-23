import {timingSafeEqual} from 'node:crypto';
export const heartbeatKey='northside:hq-outbox:v1:scheduled-health';
export async function recordDeliveryHeartbeat(box,{state,acknowledged=0,failed=0,now=Date.now()}){
 await box.command(['SET',heartbeatKey,JSON.stringify({state,checkedAt:new Date(now).toISOString(),acknowledged,failed})]);
}
export async function deliveryHealth(box,{enabled,now=Date.now()}={}){
 const counts=await box.status();
 if(![counts.pending,counts.needsReview].every(v=>Number.isSafeInteger(v)&&v>=0))throw Error('Invalid queue counts');
 const raw=await box.command(['GET',heartbeatKey]);
 const heartbeat=raw?JSON.parse(raw):null;
 if(heartbeat&&(!['ok','failed','disabled'].includes(heartbeat.state)||!Number.isFinite(Date.parse(heartbeat.checkedAt))||Date.parse(heartbeat.checkedAt)>now+60000))throw Error('Invalid heartbeat');
 const due=await box.command(['ZRANGE','northside:hq-outbox:v1:due',0,0,'WITHSCORES']);
 if(!Array.isArray(due)||![0,2].includes(due.length)||(due.length&&!Number.isFinite(Number(due[1]))))throw Error('Invalid queue age');
 const overdueMinutes=due.length?Math.max(0,Math.floor((now-Number(due[1]))/60000)):0;
 const age=heartbeat?(now-Date.parse(heartbeat.checkedAt))/60000:Infinity;
 const state=!enabled?'inactive':counts.needsReview||overdueMinutes>=15||['failed','disabled'].includes(heartbeat?.state)?'needs_attention':age>=15?'stale':counts.pending?'waiting':'connected';
 return {state,...counts,overdueMinutes,lastScheduledAt:heartbeat?.checkedAt||null,lastScheduledState:heartbeat?.state||null,checkedAt:new Date(now).toISOString(),automaticIntervalMinutes:5};
}
export function createDeliveryHealthHandler({env=process.env,outbox,now=Date.now}){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false});
 const secret=env.NORTHSIDE_GOLF_REPORT_SECRET,actual=Buffer.from(req.headers.authorization||''),expected=Buffer.from('Bearer '+(secret||''));
 if(!secret||secret.length<32||actual.length!==expected.length||!timingSafeEqual(actual,expected))return res.status(401).json({ok:false});
 try{return res.status(200).json(await deliveryHealth(await outbox(env),{enabled:env.NORTHSIDE_HQ_CAPTURE_ENABLED==='true',now:now()}));}catch{return res.status(503).json({state:'unavailable'});}
};}
