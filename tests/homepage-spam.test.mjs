import test from 'node:test';
import assert from 'node:assert/strict';
import {createFormProtection} from '../lib/homepage-spam.mjs';
const env={KV_REST_API_URL:'https://redis.invalid',KV_REST_API_TOKEN:'fake'};
const payload={name:'Jane',contact:'jane@example.invalid',community:'Aurora'};
const req={headers:{origin:'https://northsidegta.ca','x-forwarded-for':'192.0.2.1'}};
function harness({ipCount=1,contactCount=1,down=false,config=env}={}) {
 const calls=[],data=new Map();let time=1000;
 const protection=createFormProtection({env:config,now:()=>time,fetchImpl:async(url,options)=>{
  if(down) throw Error('offline');
  assert.equal(url,'https://redis.invalid');
  const c=JSON.parse(options.body);calls.push(c);let result;const key=c[3];
  if(c[0]==='SET') {result=c.includes('NX')&&data.has(c[1])?null:'OK';if(result)data.set(c[1],c[2]);}
  else if(c[0]==='GET')result=data.get(c[1])||null;
  else if(c[1].includes("'INCR'"))result=[key.includes(':attempt:')?ipCount:key.includes(':contact:')?contactCount:1,600];
  else if(c[1].includes('cjson.decode')) {const v=JSON.parse(data.get(key)||'null');result=!v||v.ip!==c[4]?0:c[5]-v.issued<1000?-1:1;if(result===1)data.delete(key);}
  else { result=data.get(key)===c[4]?1:0;if(result){if(c[1].includes("'done'"))data.set(key,'done');else data.delete(key);} }
  return {ok:true,json:async()=>({result})};
 }});
 return {...protection,calls,data,advance:(ms=1001)=>{time+=ms},async body(){const r=await protection.issue(req);time+=1001;return {formToken:r.token};}};
}
test('valid one-time form token reserves and completes without third party',async()=>{const h=harness();const r=await h.guard(req,await h.body(),payload);assert.equal(r.duplicate,false);await r.complete();assert.ok(!JSON.stringify(h.calls).includes(payload.contact));assert.ok(!JSON.stringify(h.calls).includes('192.0.2.1'));});
test('successful duplicate acknowledged using fresh token',async()=>{const h=harness();await (await h.guard(req,await h.body(),payload)).complete();assert.equal((await h.guard(req,await h.body(),payload)).duplicate,true);});
test('concurrent duplicate retryable',async()=>{const h=harness();await h.guard(req,await h.body(),payload);await assert.rejects(h.guard(req,await h.body(),payload),e=>e.status===429);});
test('missing, fabricated and replayed tokens rejected',async()=>{const h=harness();for(const body of [{},{formToken:'x'},{formToken:'a'.repeat(64)}])await assert.rejects(h.guard(req,body,payload),e=>e.status===400);const body=await h.body();await h.guard(req,body,payload);await assert.rejects(h.guard(req,body,payload),e=>e.status===400);});
test('too-fast and wrong-IP tokens rejected without consuming valid token',async()=>{const h=harness();const {token}=await h.issue(req);const body={formToken:token};await assert.rejects(h.guard(req,body,payload),e=>e.status===400);h.advance();await assert.rejects(h.guard({headers:{...req.headers,'x-forwarded-for':'192.0.2.2'}},body,payload),e=>e.status===400);assert.equal((await h.guard(req,body,payload)).duplicate,false);});
test('missing config/dependencies fail closed',async()=>{for(const h of [harness({config:{}}),harness({down:true})])await assert.rejects(h.issue(req),e=>e.status===503);});
test('cross-origin/missing origin rejected',async()=>{const h=harness();for(const origin of [undefined,'https://evil.example','https://northsidegta.ca.evil.example'])await assert.rejects(h.guard({headers:{origin}},{},payload),e=>e.status===403);assert.equal(h.calls.length,0);});
test('challenge GET accepts same-site Referer and rejects third party',async()=>{const h=harness();assert.ok((await h.issue({headers:{referer:'https://northsidegta.ca/'}})).token);await assert.rejects(h.issue({headers:{referer:'https://evil.example/'}}),e=>e.status===403);});
test('shared IP/contact rate caps',async()=>{for(const options of [{ipCount:21},{contactCount:6}]){const h=harness(options);await assert.rejects(h.guard(req,await h.body(),payload),e=>e.status===429);}});
test('release permits retry with refreshed token',async()=>{const h=harness();await (await h.guard(req,await h.body(),payload)).release();assert.equal((await h.guard(req,await h.body(),payload)).duplicate,false);});
test('preview stores isolated keys',async()=>{const h=harness({config:{...env,VERCEL_ENV:'preview',VERCEL_URL:'preview.vercel.app'}});await h.body();assert.ok(h.calls.every(c=>JSON.stringify(c).includes('homepage:preview:')));});
