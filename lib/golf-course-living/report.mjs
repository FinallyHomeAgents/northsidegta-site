import {timingSafeEqual} from 'node:crypto';
import {sources,placements} from './metrics.mjs';
export function createReportHandler({env=process.env,getCommand,now=()=>new Date()}={}){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(env.NORTHSIDE_GOLF_LIVING_METRICS_ENABLED!=='true')return res.status(503).json({error:'Tracking has not launched.'});
 if(req.method!=='GET')return res.status(405).json({ok:false});
 const secret=env.NORTHSIDE_GOLF_REPORT_SECRET;
 const provided=String(req.headers?.authorization||'');
 if(!secret||secret.length<32)return res.status(503).json({error:'Reporting connection unavailable.'});
 const expected='Bearer '+secret;
 if(Buffer.byteLength(provided)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(provided),Buffer.from(expected)))return res.status(401).json({error:'Unauthorized.'});
 const days=Number(new URL(req.url,'https://northsidegta.ca').searchParams.get('days')||7);
 if(![7,30].includes(days))return res.status(400).json({error:'Invalid period.'});
 try{
 const command=await getCommand(),rows=[],testRows=[];let internalTestExcluded=0;
 for(let i=0;i<days;i++){
 const date=new Date(now().getTime()-i*86400000).toISOString().slice(0,10);
 const raw=await command(['HGETALL','northside:golf-course-living-metrics:v1:'+date]);
 const pairs=Array.isArray(raw)?Array.from({length:raw.length/2},(_,j)=>[raw[2*j],raw[2*j+1]]):Object.entries(raw||{});
 for(const [key,value] of pairs){const parts=key.split('|');const [source,placement,event,audience]=parts;if(parts.length>4||(audience!==undefined&&audience!=='internal-test'))throw Error('Invalid audience');let count=Number(value);
 if(!sources.includes(source)||!placements.includes(placement)||!['page_view','form_start','inquiry_saved'].includes(event)||!Number.isSafeInteger(count)||count<0)throw Error('Invalid aggregate');
 if(audience==='internal-test'){testRows.push({date,source,placement,event,count});internalTestExcluded+=count;}else rows.push({date,source,placement,event,count});
 }
 }
 return res.status(200).json({campaign:'golf-course-living',days,timezone:'UTC',asOf:now().toISOString(),trackingStarted:env.NORTHSIDE_GOLF_LIVING_TRACKING_STARTED||null,internalTestExcluded,rows,testRows});
 }catch{return res.status(503).json({error:'Campaign totals temporarily unavailable.'});}
};}
