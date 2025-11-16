import test from 'node:test'
import assert from 'node:assert/strict'

const { default: handler } = await import('../pages/api/tastehub/smart-list.js')

function createMockReqRes({ method = 'POST', body = {} } = {}) {
  const req = { method, body }

  const res = {
    statusCode: 200,
    headers: {},
    body: null,
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
  }

  return { req, res }
}

function withMockedEnv(key, value) {
  const previous = process.env[key]
  process.env[key] = value
  return () => {
    process.env[key] = previous
  }
}

test('Smart List API returns restaurants when provided town and category', async () => {
  const restoreEnv = withMockedEnv('GOOGLE_PLACES_API_KEY', 'FAKE_TEST_KEY')
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({
    json: async () => ({
      status: 'OK',
      results: [
        {
          name: 'Dragon Wok Aurora',
          formatted_address: '123 Main St, Aurora, ON',
          place_id: 'abc123',
        },
      ],
    }),
  })

  const { req, res } = createMockReqRes({
    body: { town: 'Aurora', category: 'Chinese food', limit: 10 },
  })

  await handler(req, res)

  assert.equal(res.statusCode, 200)
  assert.ok(Array.isArray(res.body?.restaurants))
  assert.equal(res.body.restaurants.length, 1)
  assert.equal(res.body.restaurants[0].name, 'Dragon Wok Aurora')
  assert.match(res.body.restaurants[0].link, /place_id:abc123/)

  globalThis.fetch = originalFetch
  restoreEnv()
})


test('Smart List API returns 400 when required fields are missing', async () => {
  const restoreEnv = withMockedEnv('GOOGLE_PLACES_API_KEY', 'FAKE_TEST_KEY')
  const { req, res } = createMockReqRes({
    body: { town: '', category: '' },
  })

  await handler(req, res)

  assert.equal(res.statusCode, 400)
  assert.equal(res.body?.error, 'town and category are required')

  restoreEnv()
})


test('Smart List API rejects non-POST methods', async () => {
  const restoreEnv = withMockedEnv('GOOGLE_PLACES_API_KEY', 'FAKE_TEST_KEY')
  const { req, res } = createMockReqRes({ method: 'GET' })

  await handler(req, res)

  assert.equal(res.statusCode, 405)
  assert.deepEqual(res.headers?.Allow, ['POST'])
  assert.equal(res.body?.error, 'Method Not Allowed')

  restoreEnv()
})

test('Smart List API exposes Google error status and message', async () => {
  const restoreEnv = withMockedEnv('GOOGLE_PLACES_API_KEY', 'FAKE_TEST_KEY')
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({
    json: async () => ({
      status: 'REQUEST_DENIED',
      error_message: 'API keys with referer restrictions cannot be used with this API.',
    }),
  })

  const { req, res } = createMockReqRes({
    body: { town: 'Uxbridge', category: 'Pizza' },
  })

  await handler(req, res)

  assert.equal(res.statusCode, 502)
  assert.equal(res.body?.error, 'Google Places error')
  assert.equal(res.body?.googleStatus, 'REQUEST_DENIED')
  assert.match(res.body?.googleMessage, /referer restrictions/)

  globalThis.fetch = originalFetch
  restoreEnv()
})
