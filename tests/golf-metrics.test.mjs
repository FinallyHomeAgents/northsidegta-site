import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {createMetricsHandler,recordMetric,placements} from '../lib/campaign-metrics/metrics.mjs';
import {shortlistEnvelope} from '../lib/golf-shortlist/golf-shortlist.mjs';
import {normalizeWebsiteInquiry} from '../lib/golf-shortlist/website-inquiry.mjs';
const id='dba9ff8a-5226-4b59-8c9a-1cad2cd02a45';
const body={id,event:'page_view',source:'facebook',placement:'pickering-community'};
async function request(b=body,opts={}){const calls=[];const h=createMetricsHandler({env:{NORTHSIDE_GOLF_METRICS_ENABLED:opts.disabled?'false':'true'},getCommand:async()=>async c=>{calls.push(c);if(opts.fail)throw Error();return 1;}});const res={setHeader(){},status(n){this.code=n;return this;},json(b){this.body=b;}};await h({method:'POST',headers:{origin:'https://northsidegta.ca','content-type':'application/json',...opts.headers},body:b},res);return {res,calls};}
test('bounded aggregate command has no raw IDs or personal data',async()=>{const {res,calls}=await request();assert.equal(res.code,200);assert.equal(calls.length,1);assert.ok(!JSON.stringify(calls).includes(id));assert.match(calls[0].at(-1),/facebook\|pickering-community\|page_view/);});
test('disabled collection makes no writes',async()=>{const r=await request(body,{disabled:true});assert.equal(r.res.code,503);assert.equal(r.calls.length,0);});
test('rejects cross-origin, missing origin and client-forged conversions',async()=>{for(const origin of ['https://evil.example','https://northsidegta.ca.evil.example',undefined])assert.equal((await request(body,{headers:{origin}})).res.code,403);assert.equal((await request({...body,event:'inquiry_saved'})).res.code,400);});
test('rejects extra personal fields and unbounded attribution',async()=>{for(const b of [{...body,email:'x@example.com'},{...body,placement:'private text'},{...body,id:'x'},{...body,source:'unknown'}])assert.equal((await request(b)).res.code,400);});
test('storage failure is a bounded error',async()=>assert.equal((await request(body,{fail:true})).res.code,503));
test('group source survives form normalization into HQ inquiry',()=>{for(const placement of placements){const env={NORTHSIDE_GOLF_FORMSPREE_ID:'mwpborow'};const e=shortlistEnvelope({submissionId:id,name:'Example Buyer',email:'buyer@example.invalid',placement,referral_source:'facebook'},env);const n=normalizeWebsiteInquiry(e);assert.ok(n.lead.message.includes('placement: '+placement));}});
const browserCode=await readFile(new URL('../public/uxbridge-golf-living/campaign-metrics.js',import.meta.url),'utf8');
function browser({disabled=false,privacy=false,hidden=false,fail=false}={}){const calls=[],events={};const form={dataset:{metrics:disabled?'disabled':'enabled'},addEventListener:(n,f)=>events[n]=f};const doc={visibilityState:hidden?'hidden':'visible',getElementById:()=>form,addEventListener:(n,f)=>events[n]=f,removeEventListener(){}};runInNewContext(browserCode,{document:doc,navigator:{globalPrivacyControl:privacy},location:{protocol:'https:',hostname:'northsidegta.ca',search:'?utm_source=facebook&utm_content=markham-community&fbclid=SECRET'},URLSearchParams,crypto:{randomUUID:()=>id},fetch:async(u,o)=>{calls.push(JSON.parse(o.body));if(fail)throw Error();},Set});return {calls,events,doc};}
test('one page view and form start without leaking URL or form values',()=>{const h=browser();h.events.input();h.events.input();assert.equal(h.calls.length,2);assert.equal(h.calls[0].placement,'markham-community');assert.ok(!JSON.stringify(h.calls).includes('SECRET'));});
test('privacy and preview switches prevent browser events',()=>{assert.equal(browser({disabled:true}).calls.length,0);assert.equal(browser({privacy:true}).calls.length,0);});
test('background tabs count only when visible',()=>{const h=browser({hidden:true});assert.equal(h.calls.length,0);h.doc.visibilityState='visible';h.events.visibilitychange();assert.equal(h.calls.length,1);});
test('browser tracking failure never throws to the form',async()=>{const h=browser({fail:true});h.events.input();await new Promise(r=>setImmediate(r));assert.equal(h.calls.length,2);});
test('server duplicate identity is stable across retries',async()=>{const commands=[];await recordMetric(c=>commands.push(c),{...body,event:'inquiry_saved'});await recordMetric(c=>commands.push(c),{...body,event:'inquiry_saved'});assert.equal(commands[0][4],commands[1][4]);assert.match(commands[0][1],/EXISTS/);assert.match(commands[0][1],/20000/);});
import {measuredOutbox} from '../lib/campaign-metrics/metrics.mjs';
test('counts only after successful saving and does not disrupt delivery',async()=>{
 const lead={name:'Example Buyer',externalId:'mwpborow:'+id};let writes=0;
 const opts={enabled:true,source:'facebook',placement:'york-region-community-hub'};
 const failQueue=measuredOutbox({enqueue:async()=>{throw Error('queue');},command:async()=>writes++},opts);
 await assert.rejects(()=>failQueue.enqueue(lead));assert.equal(writes,0);
 const failMetrics=measuredOutbox({enqueue:async()=>({saved:true}),command:async()=>{writes++;throw Error('metrics');}},opts);
 assert.deepEqual(await failMetrics.enqueue(lead),{saved:true});assert.equal(writes,1);
});
test('marked tests and disabled conversion tracking do not count',async()=>{let writes=0;const box={enqueue:async()=>true,command:async()=>writes++};await measuredOutbox(box,{enabled:true}).enqueue({name:'NORTHSIDE GOLF TEST OCT30',externalId:id});await measuredOutbox(box).enqueue({name:'Buyer',externalId:id});assert.equal(writes,0);});
