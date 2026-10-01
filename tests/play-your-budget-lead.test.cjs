const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler, PREFIX } = require('../lib/play-your-budget/handler.cjs');
const session = require('../lib/play-your-budget/session.cjs');
function setup({ failStore = false, failNotify = false, limit = false } = {}) {
  const records = new Map(), index = [], delivered = [];
  const redis = {
    eval: async () => limit ? 21 : 1,
    get: async key => structuredClone(records.get(key)),
    set: async (key, value) => { records.set(key, structuredClone(value)); },
    mget: async (...keys) => keys.map(key => structuredClone(records.get(key))),
    zrange: async (key, start, end) => index.slice().reverse().slice(start, end + 1),
    multi() {
      const ops = [];
      return { set(key, value) { ops.push(() => records.set(key, structuredClone(value))); return this; },
        zadd(key, value) { ops.push(() => index.push(value.member)); return this; },
        async exec() { if (failStore) throw Error('offline'); ops.forEach(fn => fn()); return ['OK', 1]; } };
    },
  };
  const handler = createHandler({ getRedis: () => redis, authorize: req => req.headers.cookie === 'test-auth',
    now: () => new Date('2026-10-01T15:00:00Z'), env: { FORMSPREE_ENDPOINT: 'https://formspree.io/f/test' },
    fetchImpl: async (url, options) => {
      assert.equal(index.length, 1, 'record is indexed before notification');
      assert.ok(records.has(PREFIX + 'lead:' + index[0])); delivered.push(JSON.parse(options.body)); return { ok: !failNotify };
    } });
  const send = async ({ action = 'submit', method = action === 'list' ? 'GET' : 'POST', body = {}, auth = false, origin, offset } = {}) => {
    const res = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; this.code ||= 200; return this; } };
    await handler({ method, headers: { host: 'northsidegta.ca', cookie: auth ? 'test-auth' : '', ...(origin ? { origin } : {}) }, query: { action, offset }, body: { name: 'Test Buyer', email: 'test@example.com', consent: true, budget: 1500000, recommendedCommunity: 'Scugog', priorities: ['Privacy'], ...body } }, res);
    return res;
  };
  return { records, index, delivered, send };
}
test('match and homes records are saved before notification and retain consent and search context', async () => {
  const s = setup(); const res = await s.send({ body: { requestType: 'homes', selectedCommunities: ['Scugog', 'King', 'Bradford', 'King', 'Toronto'] } });
  assert.equal(res.code, 200); const record = s.records.get(PREFIX + 'lead:' + res.data.reference);
  assert.equal(record.stage, 'Homes requested'); assert.equal(record.contactConsent, true); assert.equal(record.status, 'New');
  assert.deepEqual(record.selectedCommunities, ['Scugog', 'King', 'Bradford']); assert.equal(record.budget, 1500000); assert.equal(record.recommendedCommunity, 'Scugog');
  assert.equal(s.delivered[0]['Requested communities'], 'Scugog, King, Bradford'); assert.equal(res.data.notificationSent, true);
});
test('match-only submission is stored with the lower-intent label', async () => {
  const s = setup(); const r = await s.send(); assert.equal(s.records.get(PREFIX + 'lead:' + r.data.reference).stage, 'Match revealed');
});
test('delivery failure preserves the accepted lead and is visible in the private CMS', async () => {
  const s = setup({ failNotify: true }); const res = await s.send(); assert.equal(res.code, 200); assert.equal(res.data.notificationSent, false);
  const list = await s.send({ action: 'list', auth: true }); assert.equal(list.data.leads[0].notificationStatus, 'failed');
});
test('storage failure rejects submission without sending a notification', async () => {
  const s = setup({ failStore: true }); assert.equal((await s.send()).code, 503); assert.equal(s.delivered.length, 0); assert.equal(s.index.length, 0);
});
test('list and follow-up changes are private; cross-origin updates cannot change a lead', async () => {
  const s = setup(); assert.equal((await s.send({ action: 'list' })).code, 401);
  const r = await s.send(); const body = { id: r.data.reference, status: 'Contacted', notes: 'Call Friday' };
  assert.equal((await s.send({ action: 'update', body })).code, 401);
  assert.equal((await s.send({ action: 'update', body, auth: true, origin: 'https://evil.example' })).code, 403);
  const updated = await s.send({ action: 'update', body, auth: true, origin: 'https://northsidegta.ca' });
  assert.equal(updated.code, 200); assert.equal(updated.data.lead.status, 'Contacted'); assert.equal(updated.data.lead.notes, 'Call Friday'); assert.equal(updated.data.lead.notificationStatus, 'sent');
});
test('invalid emails, budgets, towns, missing consent, and unsupported methods never store or deliver', async () => {
  for (const body of [{ email: 'bad' }, { budget: 10 }, { budget: 'NaN' }, { consent: false }, { requestType: 'homes', selectedCommunities: ['Toronto'] }]) {
    const s = setup(); assert.equal((await s.send({ body })).code, 400); assert.equal(s.index.length, 0); assert.equal(s.delivered.length, 0);
  }
  const s = setup(); assert.equal((await s.send({ method: 'GET' })).code, 405); assert.equal((await s.send({ body: { botField: 'spam' } })).code, 200); assert.equal(s.index.length, 0);
});
test('shared rate limit stops storage and notification', async () => {
  const s = setup({ limit: true }); const r = await s.send(); assert.equal(r.code, 429); assert.equal(r.headers['Retry-After'], '60'); assert.equal(s.index.length, 0);
});
test('CMS list paginates older records and disables caching', async () => {
  const s = setup(); for (let i = 0; i < 101; i++) { const id = String(i); s.index.push(id); s.records.set(PREFIX + 'lead:' + id, { id, stage: 'Match revealed' }); }
  const first = await s.send({ action: 'list', auth: true }); assert.equal(first.data.leads.length, 100); assert.equal(first.data.nextOffset, 100); assert.equal(first.headers['Cache-Control'], 'no-store');
  const next = await s.send({ action: 'list', auth: true, offset: 100 }); assert.equal(next.data.leads.length, 1); assert.equal(next.data.nextOffset, null);
});
test('CMS cookie is signed, expires, and cannot be forged or used with a different secret', () => {
  const env = { CMS_LOGIN_PASSWORD: 'test-secret' }, now = 1700000000000;
  const token = session.signSession(env, now), req = { headers: { cookie: `cms_leads_session=${token}` } };
  assert.equal(session.verifySession(req, env, now), true); assert.equal(session.verifySession(req, env, now + 8 * 86400000), false);
  assert.equal(session.verifySession(req, { CMS_LOGIN_PASSWORD: 'wrong' }, now), false);
  assert.equal(session.verifySession({ headers: { cookie: `cms_leads_session=${token}extra` } }, env, now), false);
  assert.match(session.cookie(token), /HttpOnly; Secure; SameSite=Strict/);
});
