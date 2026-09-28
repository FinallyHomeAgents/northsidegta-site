const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../lib/buying-power/handler.cjs');
const { comparisonRows } = require('../src/lib/buyingPower.cjs');
function setup({ failStore = false, failNotify = false, failEmail = false, limit = false } = {}) {
  const records = new Map(); const calls = [];
  const redis = { incr: async () => limit ? 11 : 1, expire: async () => {},
    set: async (key, record) => { if (failStore) throw Error('offline'); records.set(key, structuredClone(record)); }, zadd: async () => {} };
  const handler = createHandler({ getRedis: () => redis, now: () => new Date('2026-09-28T15:00:00Z'),
    env: { RESEND_API_KEY: 'test', FORMSPREE_ENDPOINT: 'https://formspree.io/f/test' },
    fetchImpl: async (url, options) => { calls.push({ url, payload: JSON.parse(options.body) }); return { ok: url.includes('resend') ? !failEmail : !failNotify }; } });
  return { records, calls, async send(body = {}, method = 'POST') {
    const res = { headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(code) { this.code=code; return this; }, json(body) { this.body=body; return this; } };
    await handler({ method, headers: { 'x-forwarded-for': '127.0.0.1' }, body: { email: 'test@example.com', leadType: 'comparison', estimatedValue: 950000, ...body } }, res);
    return res;
  } };
}
test('comparison saves all seven server-derived rows, source, owner and deadline before sending', async () => {
  const s = setup(); const res = await s.send({ comparison: [{ average: 1 }], communities: ['aurora','bogus'], attribution: { utm_source: 'facebook' } });
  assert.equal(res.code,200); assert.equal(res.body.emailSent,true);
  const record=[...s.records.values()][0];
  assert.equal(record.comparison.length,7); assert.equal(record.owner,'Matthew Mulhall');
  assert.equal(record.followUpDueAt,'2026-09-29T15:00:00.000Z');
  assert.deepEqual(record.communities,['aurora']); assert.equal(record.attribution.utm_source,'facebook');
  assert.equal(record.marketingConsent,false); assert.equal(s.calls.length,2);
  assert.match(s.calls[1].payload.text,/Mortgage balances/);
});
test('valuation requires name, address and explicit contact consent', async () => {
  const s=setup(); assert.equal((await s.send({ leadType:'valuation' })).code,400);
  assert.equal(s.calls.length,0);
  assert.equal((await s.send({ leadType:'valuation', name:'Test', address:'Test address', contactConsent:true })).code,200);
});
test('phone/text preference requires a usable phone; no phone needed for comparison', async () => {
  const s=setup(); assert.equal((await s.send({ contactPreference:'text' })).code,400);
  assert.equal((await s.send()).code,200);
});
test('invalid email and out-of-range or non-finite values never save or deliver', async () => {
  for (const body of [{email:'bad'}, {estimatedValue:0}, {estimatedValue:3000001}, {estimatedValue:'NaN'}, {leadType:'spam'}]) {
    const s=setup(); assert.equal((await s.send(body)).code,400); assert.equal(s.records.size,0); assert.equal(s.calls.length,0);
  }
});
test('storage failure returns error and does not send any email', async () => {
  const s=setup({failStore:true}); assert.equal((await s.send()).code,503); assert.equal(s.calls.length,0);
});
test('email failure preserves lead and reports delayed delivery honestly', async () => {
  const s=setup({failEmail:true}); const res=await s.send(); assert.equal(res.code,200); assert.equal(res.body.emailSent,false);
  assert.equal([...s.records.values()][0].emailStatus,'failed');
});
test('agent notification failure remains recoverable in the saved record', async () => {
  const s=setup({failNotify:true}); assert.equal((await s.send()).code,200);
  assert.equal([...s.records.values()][0].notificationStatus,'failed');
});
test('rate limit stops submission before storage and delivery', async () => {
  const s=setup({limit:true}); const res=await s.send(); assert.equal(res.code,429); assert.equal(s.calls.length,0); assert.equal(s.records.size,0);
});
test('honeypot and wrong method never send', async () => {
  const s=setup(); await s.send({nickname:'bot'}); assert.equal((await s.send({},'GET')).code,405); assert.equal(s.calls.length,0);
});
test('percentage below average uses average as denominator', () => {
  const [row]=comparisonRows({municipalities:{test:{name:'Test',byType:{all:{avg:1000000}}}}},500000);
  assert.equal(row.percent,-50); assert.equal(row.difference,-500000);
});
test('tracking emits one GA4 event and a Meta lead without personal information', async () => {
  const {trackBuyingPower} = await import('../src/lib/buyingPowerTracking.js');
  const events=[]; const target={gtag:(...args)=>events.push(args),fbq:(...args)=>events.push(args)};
  trackBuyingPower('generate_lead',{lead_type:'comparison',email:'private@example.com',address:'private',pageUrl:'private'},target);
  assert.equal(events.length,2); assert.equal(events[0][1],'generate_lead'); assert.equal(events[1][1],'Lead');
  assert.doesNotMatch(JSON.stringify(events),/private/); assert.equal(target.dataLayer,undefined);
});
