'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { pathToFileURL } = require('node:url')
const { createRequire } = require('node:module')
const require_ = createRequire(__filename)

async function loadSyncHandler() {
  // Always resolve to a file URL and use dynamic import so ESM works under CJS tests.
  const moduleUrl = pathToFileURL(require_.resolve('../api/sync-now.js')).href
  const namespace = await import(`${moduleUrl}?t=${Date.now()}`)
  return namespace.default || namespace
}

async function withEnv(overrides, fn) {
  const keys = Object.keys(overrides)
  const backup = {}
  for (const key of keys) {
    backup[key] = Object.prototype.hasOwnProperty.call(process.env, key) ? process.env[key] : undefined
    const value = overrides[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  const cleanup = () => {
    for (const key of keys) {
      const value = backup[key]
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }

  try {
    return await fn()
  } finally {
    cleanup()
  }
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value
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

function createMockResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async text() {
      if (body === undefined) return ''
      if (typeof body === 'string') return body
      return JSON.stringify(body)
    },
    async json() {
      if (body === undefined) return undefined
      if (typeof body === 'string') {
        try {
          return JSON.parse(body)
        } catch (error) {
          return undefined
        }
      }
      return body
    },
  }
}

test('sync-now handler exists and is a function', async () => {
  const handler = await loadSyncHandler()
  assert.equal(typeof handler, 'function')
})

test('sync-now rejects without CSRF', async () => {
  await withEnv({ SYNC_SECRET: 'sync-secret' }, async () => {
    const handler = await loadSyncHandler()
    const req = {
      method: 'POST',
      headers: {
        host: 'admin.local',
        origin: 'https://admin.local',
      },
    }
    const res = createMockRes()
    await handler(req, res)
    assert.equal(res.statusCode, 401)
    assert.match(res.body?.hint || '', /sync token/i)
  })
})

test('POST /api/sync-now fails fast when repository metadata is missing', async () => {
  const secret = 'sync-secret'

  await withEnv(
    {
      SYNC_SECRET: secret,
      GITHUB_REPO: undefined,
      GITHUB_REPOSITORY: undefined,
      GITHUB_REPO_OWNER: undefined,
      GITHUB_REPO_NAME: undefined,
      VERCEL_GIT_REPO_OWNER: undefined,
      VERCEL_GIT_REPO_SLUG: undefined,
      GITHUB_TOKEN: undefined,
      GH_TOKEN: undefined,
    },
    async () => {
      const handler = await loadSyncHandler()

      const csrfToken = 'csrf-token'
      const signature = crypto.createHmac('sha256', secret).update(csrfToken).digest('hex')

      const req = {
        method: 'POST',
        headers: {
          host: 'admin.local',
          origin: 'https://admin.local',
          'x-sync-csrf': csrfToken,
          cookie: `sync_now_csrf=${csrfToken}.${signature}`,
        },
      }

      const res = createMockRes()
      await handler(req, res)

      assert.equal(res.statusCode, 500)
      assert.equal(res.body?.ok, false)
      assert.equal(res.body?.error, 'missing repository metadata')
      assert.match(res.body?.hint || '', /owner|repo|token/i)
    }
  )
})

test('POST /api/sync-now retries using the default branch when workflow is missing on ref', async () => {
  const secret = 'sync-secret'
  const originalFetch = global.fetch

  try {
    await withEnv(
      {
        SYNC_SECRET: secret,
        GITHUB_REPO: 'FinallyHomeAgents/northsidegta-site',
        GITHUB_TOKEN: 'gh-token',
        VERCEL_GIT_COMMIT_REF: 'preview-branch',
      },
      async () => {
        let workflowDispatchCalls = 0
        let repoDispatchCalls = 0
        let repoInfoCalls = 0

        global.fetch = async (url, options = {}) => {
          if (
            url ===
            'https://api.github.com/repos/FinallyHomeAgents/northsidegta-site/actions/workflows/.github/workflows/events-sync.yml/dispatches'
          ) {
            workflowDispatchCalls += 1
            if (workflowDispatchCalls === 1) {
              return createMockResponse(404, { message: 'Not Found' })
            }
            return createMockResponse(204)
          }

          if (url === 'https://api.github.com/repos/FinallyHomeAgents/northsidegta-site/dispatches') {
            repoDispatchCalls += 1
            return createMockResponse(204)
          }

          if (url === 'https://api.github.com/repos/FinallyHomeAgents/northsidegta-site') {
            repoInfoCalls += 1
            return createMockResponse(200, { default_branch: 'main' })
          }

          throw new Error(`Unexpected fetch call to ${url}`)
        }

        const handler = await loadSyncHandler()

        const csrfToken = 'csrf-token'
        const signature = crypto.createHmac('sha256', secret).update(csrfToken).digest('hex')

        const req = {
          method: 'POST',
          headers: {
            host: 'admin.local',
            origin: 'https://admin.local',
            'x-sync-csrf': csrfToken,
            cookie: `sync_now_csrf=${csrfToken}.${signature}`,
          },
        }

        const res = createMockRes()
        await handler(req, res)

        assert.equal(res.statusCode, 200)
        assert.equal(res.body?.ok, true)
        assert.equal(res.body?.ref, 'main')
        assert.equal(workflowDispatchCalls, 2)
        assert.equal(repoDispatchCalls, 2)
        assert.equal(repoInfoCalls, 1)
      }
    )
  } finally {
    global.fetch = originalFetch
  }
})
