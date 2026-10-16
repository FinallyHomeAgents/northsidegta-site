import {timingSafeEqual} from 'node:crypto';
import {websiteOutbox,drainHeadquartersOutbox} from '../lib/headquarters-capture.mjs';
export function createDeliveryWorker({env=process.env,drain=drainHeadquartersOutbox,outbox=websiteOutbox}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false});
  const secret=env.CRON_SECRET;
  const actual=Buffer.from(typeof req.headers.authorization==='string'?req.headers.authorization:'');
  const expected=Buffer.from('Bearer '+(secret||''));
  if(typeof secret!=='string'||secret.length<32||actual.length!==expected.length||!timingSafeEqual(actual,expected))return res.status(401).json({ok:false});
  if(env.NORTHSIDE_HQ_CAPTURE_ENABLED!=='true')return res.status(200).json({ok:true,disabled:true});
  try{
   const result=await drain(env);
   const queue=await outbox(env).status();
   // No names, messages, addresses or credentials in scheduler responses/logs.
   if(queue.needsReview>0)console.error('Headquarters delivery needs review:',queue.needsReview);
   return res.status(queue.needsReview>0||result.failed>0?503:200).json({ok:queue.needsReview===0&&result.failed===0,...result,queue});
  }catch{return res.status(503).json({ok:false,error:'Delivery unavailable; queued inquiries retained.'});}
 };
}
export default createDeliveryWorker();
