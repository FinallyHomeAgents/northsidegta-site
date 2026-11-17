'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')
const { createRequire } = require('node:module')
const require_ = createRequire(__filename)

async function loadHandler() {
  const moduleUrl = pathToFileURL(require_.resolve('../api/homepage-lead.js')).href
  const namespace = await import(`${moduleUrl}?t=${Date.now()}`)
  return namespace.createHomepageHandler({ guard: async () => ({ duplicate: false, release: async () => {}, complete: async () => {} }) })
}

test('enabled capture saves a copy before preserving the Formspree notification', async () => {
  await withEnv({FORMSPREE_ENDPOINT:'https://formspree.io/f/testform',NORTHSIDE_HQ_CAPTURE_ENABLED:'true',KV_REST_API_URL:'https://test.upstash.io',KV_REST_API_TOKEN:'test-only'}, async()=>{
    const originalFetch=global.fetch; const calls=[];
    global.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return {ok:true,json:async()=>({result:1})};};
    try {
      const handler=await loadHandler();const res=createMockRes();
      await handler(createPostRequest({body:{name:'TEST',contact:'test@example.invalid',community:'Aurora',submissionId:'11111111-1111-4111-8111-111111111111'}}),res);
      assert.equal(res.statusCode,200);assert.equal(calls.length,2);
      assert.equal(calls[0].url,'https://test.upstash.io');
      assert.equal(calls[0].body[0],'EVAL');
      assert.equal(calls[1].url,'https://formspree.io/f/testform');
      assert.equal(calls[1].body.Name,'TEST');
    } finally {global.fetch=originalFetch;}
  });
});

test('capture outage returns a retryable error without falsely confirming receipt', async () => {
  await withEnv({FORMSPREE_ENDPOINT:'https://formspree.io/f/testform',NORTHSIDE_HQ_CAPTURE_ENABLED:'true',KV_REST_API_URL:'https://test.upstash.io',KV_REST_API_TOKEN:'test-only'}, async()=>{
    const originalFetch=global.fetch;
    global.fetch=async()=>{throw Error('simulated outage');};
    try {const handler=await loadHandler();const res=createMockRes();await handler(createPostRequest({body:{name:'TEST',contact:'test@example.invalid',community:'Aurora'}}),res);assert.equal(res.statusCode,503);assert.equal(res.body.ok,false);}finally{global.fetch=originalFetch;}
  });
});

async function withEnv(overrides, fn) {
  const backup = {}
  for (const [key, value] of Object.entries(overrides)) {
    backup[key] = Object.prototype.hasOwnProperty.call(process.env, key) ? process.env[key] : undefined
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  try {
    return await fn()
  } finally {
    for (const [key, value] of Object.entries(backup)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value
      return this
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
    send(payload) {
      this.body = payload
      return this
    },
  }
}

function createPostRequest({ body, accept = '', contentType = 'application/json' }) {
  return {
    method: 'POST',
    headers: {
      accept,
      'content-type': contentType,
    },
    body,
  }
}

test('homepage lead returns JSON success for JavaScript submissions', async () => {
  await withEnv({ FORMSPREE_ENDPOINT: 'https://formspree.io/f/testform' }, async () => {
    const originalFetch = global.fetch
    global.fetch = async () => ({ ok: true, status: 200, text: async () => '' })

    try {
      const handler = await loadHandler()
      const res = createMockRes()
      await handler(
        createPostRequest({
          accept: 'application/json',
          body: { name: 'Jane Buyer', contact: 'jane@example.com', community: 'Aurora' },
        }),
        res
      )

      assert.equal(res.statusCode, 200)
      assert.deepEqual(res.body, { ok: true })
    } finally {
      global.fetch = originalFetch
    }
  })
})

test('homepage lead returns accessible success HTML for native form submissions', async () => {
  await withEnv({ FORMSPREE_ENDPOINT: 'https://formspree.io/f/testform' }, async () => {
    const originalFetch = global.fetch
    global.fetch = async () => ({ ok: true, status: 200, text: async () => '' })

    try {
      const handler = await loadHandler()
      const res = createMockRes()
      await handler(
        createPostRequest({
          contentType: 'application/x-www-form-urlencoded',
          body: 'name=Jane+Buyer&contact=4165551212&community=Aurora',
        }),
        res
      )

      assert.equal(res.statusCode, 200)
      assert.equal(res.headers['Content-Type'], 'text/html; charset=utf-8')
      assert.match(res.body, /Thanks — we received your request\./)
      assert.match(res.body, /We’ll reach out within 24 hours/)
      assert.doesNotMatch(res.body, /Unable to submit lead right now\./)
    } finally {
      global.fetch = originalFetch
    }
  })
})

test('homepage lead returns clear non-JSON errors when Formspree fails', async () => {
  await withEnv({ FORMSPREE_ENDPOINT: 'https://formspree.io/f/testform' }, async () => {
    const originalFetch = global.fetch
    global.fetch = async () => ({ ok: false, status: 500, text: async () => 'bad gateway' })

    try {
      const handler = await loadHandler()
      const res = createMockRes()
      await handler(
        createPostRequest({
          contentType: 'application/x-www-form-urlencoded',
          body: 'name=Jane+Buyer&contact=4165551212&community=Aurora',
        }),
        res
      )

      assert.equal(res.statusCode, 502)
      assert.equal(res.body, 'Unable to send lead right now.')
    } finally {
      global.fetch = originalFetch
    }
  })
})

test('guard rejection never forwards or saves a lead', async () => {
  await withEnv({FORMSPREE_ENDPOINT:'https://formspree.io/f/testform'},async()=>{
    const ns=await import(pathToFileURL(require_.resolve('../api/homepage-lead.js')).href+'?guard-test');
    let calls=0;
    const handler=ns.createHomepageHandler({guard:async()=>{throw Object.assign(Error('retry'),{status:429,retryAfter:60})},fetchImpl:async()=>{calls++;}});
    const res=createMockRes();await handler(createPostRequest({body:{name:'Jane',contact:'jane@example.invalid',community:'Aurora'}}),res);
    assert.equal(res.statusCode,429);assert.equal(res.headers['Retry-After'],'60');assert.equal(calls,0);
  });
});
test('accepted duplicate does not forward again',async()=>{
  await withEnv({FORMSPREE_ENDPOINT:'https://formspree.io/f/testform'},async()=>{
    const ns=await import(pathToFileURL(require_.resolve('../api/homepage-lead.js')).href+'?duplicate-test');let calls=0;
    const handler=ns.createHomepageHandler({guard:async()=>({duplicate:true}),fetchImpl:async()=>{calls++;}});
    const res=createMockRes();await handler(createPostRequest({body:{name:'Jane',contact:'jane@example.invalid',community:'Aurora'}}),res);
    assert.equal(res.statusCode,200);assert.equal(calls,0);
  });
});
test('invalid contact, community and oversized bodies never reach guard',async()=>{
  const ns=await import(pathToFileURL(require_.resolve('../api/homepage-lead.js')).href+'?invalid-test');let calls=0;
  const handler=ns.createHomepageHandler({guard:async()=>{calls++;}});
  for(const extra of [{contact:'nonsense'},{community:'invalid'},{extra:'x'.repeat(9000)}]){
    const res=createMockRes();await handler(createPostRequest({body:{name:'Jane',contact:'jane@example.invalid',community:'Aurora',...extra}}),res);assert.equal(res.statusCode,400);
  }assert.equal(calls,0);
});

test('real default guard blocks a tokenless request before HQ/Formspree',async()=>{
 await withEnv({FORMSPREE_ENDPOINT:'https://formspree.io/f/testform',KV_REST_API_URL:'https://redis.invalid',KV_REST_API_TOKEN:'fake',NORTHSIDE_HQ_CAPTURE_ENABLED:'true'},async()=>{
  const original=global.fetch;const calls=[];
  global.fetch=async(url)=>{calls.push(url);assert.equal(url,'https://redis.invalid');return {ok:true,json:async()=>({result:[1,600]})};};
  try{
   const ns=await import(pathToFileURL(require_.resolve('../api/homepage-lead.js')).href+'?real-guard');const res=createMockRes();
   const request=createPostRequest({body:{name:'Jane',contact:'jane@example.invalid',community:'Aurora'}});request.headers.origin='https://northsidegta.ca';
   await ns.default(request,res);assert.equal(res.statusCode,400);assert.equal(calls.length,1);
  }finally{global.fetch=original;}
 });
});

test('preview validates protection but never saves HQ or sends notification',async()=>{
 await withEnv({FORMSPREE_ENDPOINT:'https://formspree.io/f/testform',VERCEL_ENV:'preview',NORTHSIDE_HQ_CAPTURE_ENABLED:'true'},async()=>{
  const ns=await import(pathToFileURL(require_.resolve('../api/homepage-lead.js')).href+'?preview');let calls=0,completed=0;
  const handler=ns.createHomepageHandler({guard:async()=>({duplicate:false,complete:async()=>{completed++}}),queueInquiry:async()=>{calls++},fetchImpl:async()=>{calls++}});
  const res=createMockRes();await handler(createPostRequest({body:{name:'TEST',contact:'test@example.invalid',community:'Aurora'}}),res);
  assert.deepEqual(res.body,{ok:true,preview:true});assert.equal(calls,0);assert.equal(completed,1);
 });
});
