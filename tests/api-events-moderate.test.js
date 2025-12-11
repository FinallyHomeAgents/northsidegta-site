'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')
const { createRequire } = require('node:module')

const require_ = createRequire(__filename)
const handlerUrl = pathToFileURL(require_.resolve('../pages/api/events/moderate.js')).href

function createMockResponse() {
  return {
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
}

function createRequest({ method = 'POST', body = {}, query = {} } = {}) {
  return { method, body, query, headers: {} }
}

async function loadHandler() {
  const moduleUrl = `${handlerUrl}?t=${Date.now()}`
  const namespace = await import(moduleUrl)
  return namespace.default
}

async function withGithubMock(overrides, fn) {
  const original = global.__eventsModerationGithubAdmin__
  global.__eventsModerationGithubAdmin__ = overrides
  try {
    return await fn()
  } finally {
    global.__eventsModerationGithubAdmin__ = original
  }
}

test('rejects non-POST methods', async () => {
  const handler = await loadHandler()
  const res = createMockResponse()
  await handler(createRequest({ method: 'GET' }), res)
  assert.equal(res.statusCode, 405)
})

test('validates required fields', async () => {
  const handler = await loadHandler()
  const res = createMockResponse()
  await handler(createRequest({ body: { action: 'approve' } }), res)
  assert.equal(res.statusCode, 400)
})

test('returns config error when GitHub is not configured', async () => {
  await withGithubMock(
    {
      getGithubEnvConfig: () => null,
      applyRepoChanges: async () => ({}),
      buildEventPath: () => '',
      buildPendingEventPath: () => '',
      fetchEventFileFromGithub: async () => null,
      fetchPendingEventFileFromGithub: async () => null,
    },
    async () => {
      const handler = await loadHandler()
      const res = createMockResponse()
      await handler(createRequest({ body: { slug: 'sample', action: 'approve' } }), res)

      assert.equal(res.statusCode, 500)
      assert.equal(res.body?.error, 'GITHUB_CONFIG_MISSING')
    }
  )
})

test('approve action sets status to published', async () => {
  let recordedChanges = null
  await withGithubMock(
    {
      getGithubEnvConfig: () => ({ owner: 'o', repo: 'r', token: 't' }),
      fetchEventFileFromGithub: async () => ({
        path: 'public/data/events/sample.json',
        json: { slug: 'sample', status: 'pending' },
      }),
      fetchPendingEventFileFromGithub: async () => {
        const error = new Error('missing')
        error.status = 404
        throw error
      },
      applyRepoChanges: async (payload) => {
        recordedChanges = payload?.changes || null
        return { ok: true }
      },
      buildEventPath: (slug) => `public/data/events/${slug}.json`,
      buildPendingEventPath: (slug) => `public/data/events-pending/${slug}.json`,
    },
    async () => {
      const handler = await loadHandler()
      const res = createMockResponse()
      await handler(createRequest({ body: { slug: 'sample', action: 'approve' } }), res)

      if (res.statusCode !== 200) {
        // Surface the error payload to aid debugging in CI
        // eslint-disable-next-line no-console
        console.error('approve response', res)
      }
      assert.equal(res.statusCode, 200)
      assert.equal(res.body?.status, 'published')
      assert.ok(Array.isArray(recordedChanges))
      const saved = JSON.parse(recordedChanges[0].content)
      assert.equal(saved.status, 'published')
      assert.equal(saved.archived, undefined)
    }
  )
})

test('deny action archives the event', async () => {
  let recordedChanges = null
  await withGithubMock(
    {
      getGithubEnvConfig: () => ({ owner: 'o', repo: 'r', token: 't' }),
      fetchEventFileFromGithub: async () => ({
        path: 'public/data/events/sample.json',
        json: { slug: 'sample', status: 'published' },
      }),
      fetchPendingEventFileFromGithub: async () => {
        const error = new Error('missing')
        error.status = 404
        throw error
      },
      applyRepoChanges: async (payload) => {
        recordedChanges = payload?.changes || null
        return { ok: true }
      },
      buildEventPath: (slug) => `public/data/events/${slug}.json`,
      buildPendingEventPath: (slug) => `public/data/events-pending/${slug}.json`,
    },
    async () => {
      const handler = await loadHandler()
      const res = createMockResponse()
      await handler(createRequest({ body: { slug: 'sample', action: 'deny' } }), res)

      if (res.statusCode !== 200) {
        // eslint-disable-next-line no-console
        console.error('deny response', res)
      }
      assert.equal(res.statusCode, 200)
      assert.equal(res.body?.status, 'archived')
      const saved = JSON.parse(recordedChanges[0].content)
      assert.equal(saved.status, 'archived')
      assert.equal(saved.archived, true)
    }
  )
})
