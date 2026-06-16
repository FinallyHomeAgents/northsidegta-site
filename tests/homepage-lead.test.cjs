'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')
const { createRequire } = require('node:module')
const require_ = createRequire(__filename)

async function loadHandler() {
  const moduleUrl = pathToFileURL(require_.resolve('../api/homepage-lead.js')).href
  const namespace = await import(`${moduleUrl}?t=${Date.now()}`)
  return namespace.default || namespace
}

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
