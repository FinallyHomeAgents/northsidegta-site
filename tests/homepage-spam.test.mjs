import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpamGuard} from '../lib/homepage-spam.mjs';
const env={TURNSTILE_SECRET_KEY:'fake',KV_REST_API_URL:'https://redis.invalid',KV_REST_API_TOKEN:'fake'};
const payload={name:'Jane',contact:'jane@example.invalid',community:'Aurora'};
const req={headers:{origin:'https://northsidegta.ca','x-forwarded-for':'192.0.2.1'}};
function harness({verification={success:true,hostname:'northsidegta.ca',action:'homepage_lead'},ipCount=1,contactCount=1,state=null,down=false}={}) {
 const calls=[]; let stored=state;
 const guard=createSpamGuard({env,fetchImpl:async(url,options)=>{
  if(down) throw Error('offline');
  if(url.includes('cloudflare')) return {ok:true,json:async()=>verification};
  const c=JSON.parse(options.body);calls.push(c);let result;
  if(c[0]==='SET') {result=stored===null?'OK':null;if(result)stored=c[2];}
  else if(c[0]==='GET')result=stored;
  else if(c[1].includes("'INCR'"))result=[c[3].includes(':attempt:')?ipCount:contactCount,600];
  else { if(c[1].includes("'done'")) stored='done'; else stored=null;result=1; }
  return {ok:true,json:async()=>({result})};
 }});return {guard,calls};
}
const body={turnstileToken:'token'};
test('valid token reserves and completes, hashing contact and IP',async()=>{const h=harness();const r=await h.guard(req,body,payload);assert.equal(r.duplicate,false);await r.complete();assert.ok(!JSON.stringify(h.calls).includes(payload.contact));assert.ok(!JSON.stringify(h.calls).includes('192.0.2.1'));});
test('successful duplicate is acknowledged without new reservation',async()=>{assert.equal((await harness({state:'done'}).guard(req,body,payload)).duplicate,true);});
test('concurrent submission is retryable, not falsely acknowledged',async()=>{await assert.rejects(harness({state:'other-worker'}).guard(req,body,payload),e=>e.status===429);});
test('missing, wrong host, wrong action, expired tokens fail',async()=>{await assert.rejects(harness().guard(req,{},payload),e=>e.status===400);for(const verification of [{success:false},{success:true,hostname:'evil.example',action:'homepage_lead'},{success:true,hostname:'northsidegta.ca',action:'vote'}])await assert.rejects(harness({verification}).guard(req,body,payload),e=>e.status===400);});
test('missing config and dependencies fail closed',async()=>{await assert.rejects(createSpamGuard({env:{}})(req,body,payload),e=>e.status===503);await assert.rejects(harness({down:true}).guard(req,body,payload),e=>e.status===503);});
test('cross-origin and missing origin rejected before calls',async()=>{const h=harness();for(const origin of [undefined,'https://evil.example','https://northsidegta.ca.evil.example'])await assert.rejects(h.guard({headers:{origin}},body,payload),e=>e.status===403);assert.equal(h.calls.length,0);});
test('shared limits enforce IP and contact caps',async()=>{await assert.rejects(harness({ipCount:21}).guard(req,body,payload),e=>e.status===429&&e.retryAfter>0);await assert.rejects(harness({contactCount:6}).guard(req,body,payload),e=>e.status===429);});
test('release permits retry after known delivery failure',async()=>{const h=harness();await (await h.guard(req,body,payload)).release();assert.equal((await h.guard(req,body,payload)).duplicate,false);});
