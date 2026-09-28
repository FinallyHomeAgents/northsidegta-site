const assert = require('node:assert/strict');
const test = require('node:test');
const { createHandler } = require('../lib/buying-power/handler.cjs');
test('buying-power keeps the existing production Formspree fallback on the server', async () => {
  const urls=[];
  const handler=createHandler({env:{}, getRedis:()=>({incr:async()=>1,expire:async()=>{},set:async()=>{},zadd:async()=>{}}),
    fetchImpl:async url=>{urls.push(url);return {ok:true}}});
  const res={setHeader(){},status(code){this.code=code;return this},json(body){this.body=body;return this}};
  await handler({method:'POST',headers:{},body:{leadType:'comparison',email:'test@example.com',estimatedValue:950000}},res);
  assert.equal(res.code,200);
  assert.deepEqual(urls,['https://formspree.io/f/xblkwrzj']);
  assert.equal(res.body.emailSent,false,'without Resend, UI must promise manual follow-up rather than claim email delivery');
});
