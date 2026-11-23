import test from 'node:test';import assert from 'node:assert/strict';
import {deliveryHealth,createDeliveryHealthHandler} from '../lib/inquiry-delivery-health.mjs';
import {createDeliveryWorker} from '../api/headquarters-delivery.js';
const now=Date.parse('2026-11-23T20:00:00Z'),secret='test-only-secret-longer-than-32-characters';
const box=(pending=0,needsReview=0,age=2,due=0)=>({status:async()=>({pending,needsReview}),command:async c=>c[0]==='GET'?age===null?null:JSON.stringify({state:'ok',checkedAt:new Date(now-age*60000).toISOString()}):due?["opaque-id",String(now-due*60000)]:[]});
for(const [name,pending,review,age,due,state]of [['recent empty',0,0,2,0,'connected'],['new pending',1,0,2,1,'waiting'],['overdue',1,0,2,16,'needs_attention'],['quarantined',0,1,2,0,'needs_attention'],['stopped',0,0,16,0,'stale'],['never observed',0,0,null,0,'stale']])test(name,async()=>assert.equal((await deliveryHealth(box(pending,review,age,due),{enabled:true,now})).state,state));
test('disabled is explicit',async()=>assert.equal((await deliveryHealth(box(),{enabled:false,now})).state,'inactive'));
const response=()=>({setHeader(){},status(c){this.code=c;return this;},json(b){this.body=b;return this;}});
test('health endpoint requires existing report credential, only reads and exposes no payload',async()=>{
 let calls=0;const h=createDeliveryHealthHandler({env:{NORTHSIDE_GOLF_REPORT_SECRET:secret,NORTHSIDE_HQ_CAPTURE_ENABLED:'true'},outbox:async()=>{calls++;return box();},now:()=>now});
 const denied=response();await h({method:'GET',headers:{}},denied);assert.equal(denied.code,401);assert.equal(calls,0);
 const ok=response();await h({method:'GET',headers:{authorization:'Bearer '+secret}},ok);assert.equal(ok.code,200);assert.equal(ok.body.state,'connected');assert(!JSON.stringify(ok.body).includes('opaque-id'));
});
test('only authenticated scheduled runs record completion; manual checks cannot mimic recent scheduled success',async()=>{
 const records=[];let runs=0;const h=createDeliveryWorker({env:{CRON_SECRET:secret,NORTHSIDE_HQ_CAPTURE_ENABLED:'true'},outbox:async()=>box(),drain:async()=>{runs++;return {acknowledged:0,failed:0}},record:async(_b,r)=>records.push(r)});
 await h({method:'GET',headers:{'user-agent':'vercel-cron/1.0'}},response());assert.equal(runs,0);
 await h({method:'GET',headers:{authorization:'Bearer '+secret}},response());assert.equal(records.length,0);
 await h({method:'GET',headers:{authorization:'Bearer '+secret,'user-agent':'vercel-cron/1.0'}},response());assert.equal(records[0].state,'ok');
});
test('failed automatic run records failure and retains existing failure status',async()=>{
 const records=[];const h=createDeliveryWorker({env:{CRON_SECRET:secret,NORTHSIDE_HQ_CAPTURE_ENABLED:'true'},outbox:async()=>box(),drain:async()=>{throw Error('offline')},record:async(_b,r)=>records.push(r)});const res=response();await h({method:'GET',headers:{authorization:'Bearer '+secret,'user-agent':'vercel-cron/1.0'}},res);assert.equal(res.code,503);assert.equal(records[0].state,'failed');
});
test('previous disabled scheduled run cannot be reported healthy',async()=>{const b=box();const old=b.command;b.command=async c=>c[0]==='GET'?JSON.stringify({state:'disabled',checkedAt:new Date(now).toISOString()}):old(c);assert.equal((await deliveryHealth(b,{enabled:true,now})).state,'needs_attention');});
