const assert = require('node:assert/strict')
const test = require('node:test')

const USERNAME = 'admin'
const PASSWORD = 'secret'
const TOKEN = 'ghp_test_token'

process.env.CMS_LOGIN_USERNAME = USERNAME
process.env.CMS_LOGIN_PASSWORD = PASSWORD
process.env.GITHUB_TOKEN = TOKEN

let handlerPromise
function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import('../api/cms-login.js').then((mod) => mod.default)
  }
  return handlerPromise
}

function createReq({ body, method = 'POST', streamChunks } = {}) {
  return {
    method,
    body,
    async *[Symbol.asyncIterator]() {
      if (!streamChunks) return
      for (const chunk of streamChunks) {
        yield chunk
      }
    },
  }
}

function createRes() {
  return {
    statusCode: 0,
    headers: {},
    payload: undefined,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
  }
}

async function runHandler(options) {
  const handler = await getHandler()
  const req = createReq(options)
  const res = createRes()
  await handler(req, res)
  return res
}

test('accepts JSON provided as a Buffer body', async () => {
  const buffer = Buffer.from(JSON.stringify({ username: USERNAME, password: PASSWORD }))
  const res = await runHandler({ body: buffer })

  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.token, TOKEN)
})

test('accepts JSON provided as a typed array body', async () => {
  const encoder = new TextEncoder()
  const typedArray = encoder.encode(JSON.stringify({ username: USERNAME, password: PASSWORD }))
  const res = await runHandler({ body: typedArray })

  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.token, TOKEN)
})

test('falls back to reading the request stream when body is unset', async () => {
  const encoder = new TextEncoder()
  const chunk = encoder.encode(JSON.stringify({ username: USERNAME, password: PASSWORD }))
  const res = await runHandler({ body: undefined, streamChunks: [chunk] })

  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.token, TOKEN)
})

test('returns a 400 for invalid JSON payloads', async () => {
  const buffer = Buffer.from('not-json')
  const res = await runHandler({ body: buffer })

  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.error, 'Invalid JSON body')
})
