import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {deliverInquiry} from '../lib/deliver-inquiry.mjs';
import {drainHeadquartersOutbox} from '../lib/headquarters-capture.mjs';
import {createDeliveryWorker} from '../api/headquarters-delivery.js';
const lead={source:'homepage',externalId:'test'};
const secret='test-signing-secret-at-least-32-characters';
test('sender authenticates only to the configured intake host and validates acknowledgement',async()=>{
 let sent;
 const id=createHash('sha256').update('homepage\0test').digest('hex');
 const fetcher=async(url,options)=>{sent={url,options};return {ok:true,json:async()=>({ok:true,id})};};
 await deliverInquiry({lead,url:'https://northside-intake-service.vercel.app/api/lead-intake',secret,oidcToken:'test-only-token',fetcher});
 assert.equal(sent.options.headers['x-vercel-trusted-oidc-idp-token'],'test-only-token');
 assert.match(sent.options.headers['X-Northside-Signature'],/^v1=[a-f0-9]{64}$/);
 assert.equal(sent.options.redirect,'error');
 await assert.rejects(deliverInquiry({lead,url:'https://other.example/api/lead-intake',secret,oidcToken:'test-only-token',fetcher}),/approved intake/);
 await assert.rejects(deliverInquiry({lead,url:'https://northside-intake-service.vercel.app/api/lead-intake',secret,fetcher:async()=>({ok:true,json:async()=>({ok:true,id:'wrong'})})}),/acknowledgment/);
});
test('missing workload identity does not consume or remove queued inquiries',async()=>{
 let fetched=false;
 await assert.rejects(drainHeadquartersOutbox({NORTHSIDE_HQ_CAPTURE_ENABLED:'true',KV_REST_API_URL:'https://test.upstash.io',KV_REST_API_TOKEN:'test-only'},async()=>{fetched=true;},async()=>null),/identity/);
 assert.equal(fetched,false);
});
test('disabled delivery needs no storage or credentials',async()=>{
 assert.deepEqual(await drainHeadquartersOutbox({}),{disabled:true});
});
const response=()=>({code:0,body:null,setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;}});
test('worker blocks unauthenticated requests and reports quarantined deliveries as failures',async()=>{
 let runs=0;const env={CRON_SECRET:secret,NORTHSIDE_HQ_CAPTURE_ENABLED:'true'};
 const handler=createDeliveryWorker({env,drain:async()=>{runs++;return {acknowledged:0,failed:0};},outbox:()=>({status:async()=>({pending:0,needsReview:1})})});
 const denied=response();await handler({method:'GET',headers:{}},denied);assert.equal(denied.code,401);assert.equal(runs,0);
 const accepted=response();await handler({method:'GET',headers:{authorization:'Bearer '+secret}},accepted);assert.equal(accepted.code,503);assert.equal(accepted.body.ok,false);
});
