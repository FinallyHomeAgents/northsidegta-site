import test from 'node:test';
import assert from 'node:assert/strict';
import {createWebsiteInquiryHandler,normalizeWebsiteInquiry} from '../lib/website-inquiry.mjs';
const body=()=>({source:'contact',destination:'mwpborow',submissionId:'dba9ff8a-5226-4b59-8c9a-1cad2cd02a45',pageUrl:'https://northsidegta.ca/contact?secret=omitted',fields:{name:'TEST Inquiry',email:'test@example.invalid',message:'Please call',contact_consent:'Yes'}});
function harness({queueFails=false,upstreamOk=true,enabled=true}={}){
 const sent=[],queued=[]; const res={statusCode:0,setHeader(){},status(c){this.statusCode=c;return this;},json(v){this.body=v;return this;}};
 const handler=createWebsiteInquiryHandler({env:{NORTHSIDE_HQ_FORMS_ENABLED:String(enabled)},getOutbox:async()=>({command:async()=>1,enqueue:async lead=>{if(queueFails)throw Error();queued.push(lead);}}),fetcher:async(url,opts)=>{sent.push({url,fields:JSON.parse(opts.body)});return {ok:upstreamOk};}});
 return {sent,queued,res,run:async(data=body(),headers={})=>handler({method:'POST',headers:{'content-type':'application/json',...headers},body:data},res)};
}
test('queues and forwards original fields with conservative consent',async()=>{const h=harness();await h.run();assert.equal(h.res.statusCode,200);assert.equal(h.queued.length,1);assert.deepEqual(h.sent[0].fields,body().fields);assert.equal(h.queued[0].consent.marketing,false);assert.equal(h.queued[0].pageUrl,'https://northsidegta.ca/contact');});
test('queue failure cannot report success or forward an untracked inquiry',async()=>{const h=harness({queueFails:true});await h.run();assert.equal(h.res.statusCode,503);assert.equal(h.sent.length,0);});
test('Formspree failure retains queued inquiry',async()=>{const h=harness({upstreamOk:false});await h.run();assert.equal(h.res.statusCode,502);assert.equal(h.queued.length,1);});
test('rejects unapproved destinations, origins and invalid fields',async()=>{for(const changed of [{destination:'attacker'},{pageUrl:'https://evil.example/contact'},{fields:{email:'invalid'}},{fields:{email:'test@example.invalid',password:{secret:1}}}]){const h=harness();await h.run({...body(),...changed});assert.equal(h.res.statusCode,400);assert.equal(h.sent.length,0);assert.equal(h.queued.length,0);}const h=harness();await h.run(body(),{origin:'https://evil.example'});assert.equal(h.res.statusCode,403);});
test('honeypot never queues or forwards',async()=>{const h=harness();await h.run({...body(),fields:{...body().fields,_gotcha:'bot'}});assert.equal(h.res.statusCode,200);assert.equal(h.queued.length,0);assert.equal(h.sent.length,0);});
test('maps seller, referral, split-name and contact-only forms',()=>{for(const fields of [{seller_name:'Seller',seller_email:'seller@example.invalid'},{referring_agent_name:'Agent',agent_phone:'4165550100'},{first_name:'Test',last_name:'Buyer',email:'buyer@example.invalid'},{contact:'4165550100'}]){const result=normalizeWebsiteInquiry({...body(),fields});assert.ok(result.lead.email||result.lead.phone);assert.equal(result.lead.consent.marketing,false);}});
test('reference is stable across retries',()=>{const a=normalizeWebsiteInquiry(body(),{},()=> '2026-10-16T12:00:00Z');const b=normalizeWebsiteInquiry(body(),{},()=> '2026-10-16T12:01:00Z');assert.equal(a.lead.externalId,b.lead.externalId);assert.equal(a.lead.message,b.lead.message);});
test('disabled capture preserves Formspree without queue access',async()=>{const h=harness({enabled:false,queueFails:true});await h.run();assert.equal(h.res.statusCode,200);assert.equal(h.queued.length,0);assert.equal(h.sent.length,1);});

test('browser retries preserve original payload and reference without browser storage',async()=>{
 const {readFile}=await import('node:fs/promises');
 const {webcrypto}=await import('node:crypto');
 const script=await readFile(new URL('../src/lib/submitWebsiteInquiry.js',import.meta.url),'utf8');
 const oldWindow=globalThis.window,oldFetch=globalThis.fetch;
 const requests=[];
 try {
  globalThis.window={location:{origin:'https://northsidegta.ca',pathname:'/contact'},crypto:webcrypto};
  globalThis.fetch=async(url,opts)=>{requests.push({url,body:JSON.parse(opts.body)});return {ok:true};};
  const {submitWebsiteInquiry}=await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
  for(const submitted_at of ['one','two']){
   const form=new FormData();form.set('email','test@example.invalid');form.set('submitted_at',submitted_at);
   await submitWebsiteInquiry('https://formspree.io/f/mwpborow',{body:form});
  }
  assert.equal(requests[0].url,'/api/website-inquiry');
  assert.deepEqual(requests[0].body,requests[1].body);
  await assert.rejects(submitWebsiteInquiry('https://evil.example/f/mwpborow',{body:'{}'}));
  assert.equal(requests.length,2);
 }finally{globalThis.window=oldWindow;globalThis.fetch=oldFetch;}
});
