const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

async function exercise(run, { upstreamOk = true } = {}) {
  const originalFetch = global.fetch;
  const originalEndpoint = process.env.FORMSPREE_ENDPOINT;
  process.env.FORMSPREE_ENDPOINT = 'https://formspree.io/f/test';
  const source = fs.readFileSync(path.join(__dirname, '../api/play-your-budget-lead.js'), 'utf8');
  const { default: handler } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const delivered = [];
  global.fetch = async (url, options) => {
    delivered.push(JSON.parse(options.body));
    return { ok: upstreamOk, status: 503, text: async () => '' };
  };
  const send = async (body = {}, method = 'POST') => {
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    await handler({ method, body: { name: 'Test Buyer', email: 'test@example.com', consent: true, budgetLabel: '$1.50M', recommendedCommunity: 'Scugog', priorities: ['Privacy'], ...body } }, res);
    return res;
  };
  try { await run({ send, delivered }); }
  finally {
    global.fetch = originalFetch;
    if (originalEndpoint === undefined) delete process.env.FORMSPREE_ENDPOINT;
    else process.env.FORMSPREE_ENDPOINT = originalEndpoint;
  }
}

test('home requests preserve the revealed match and selected towns, dropping duplicates and unsupported towns', async () => {
  await exercise(async ({ send, delivered }) => {
    const res = await send({ requestType: 'homes', selectedCommunities: ['Scugog', 'King', 'Bradford', 'King', 'Toronto', '<script>'] });
    assert.equal(res.code, 200);
    assert.equal(delivered[0]['Recommended community'], 'Scugog');
    assert.equal(delivered[0]['Requested communities'], 'Scugog, King, Bradford');
    assert.equal(delivered[0].Budget, '$1.50M');
    assert.equal(delivered[0].Priorities, 'Privacy');
    assert.match(delivered[0]._subject, /Matching homes request/);
  });
});

test('homes require a supported town while initial match requests do not', async () => {
  await exercise(async ({ send, delivered }) => {
    assert.equal((await send({ requestType: 'homes', selectedCommunities: [] })).code, 400);
    assert.equal((await send({ requestType: 'homes', selectedCommunities: ['Toronto'] })).code, 400);
    assert.equal(delivered.length, 0);
    assert.equal((await send()).code, 200);
    assert.equal(delivered[0]['Request type'], 'Community match');
  });
});

test('delivery failure returns a retryable error rather than claiming success', async () => {
  await exercise(async ({ send }) => {
    const res = await send({ requestType: 'homes', selectedCommunities: ['Scugog'] });
    assert.equal(res.code, 502);
    assert.equal(res.data.ok, false);
  }, { upstreamOk: false });
});

test('consent, honeypot and method protections apply to homes requests', async () => {
  await exercise(async ({ send, delivered }) => {
    assert.equal((await send({ requestType: 'homes', selectedCommunities: ['Scugog'], consent: false })).code, 400);
    assert.equal((await send({ botField: 'spam' })).code, 200);
    assert.equal((await send({}, 'GET')).code, 405);
    assert.equal(delivered.length, 0);
  });
});
