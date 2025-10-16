const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')

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
      const modulePath = require.resolve('../api/sync-now.js')
      delete require.cache[modulePath]
      const handler = require(modulePath)

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
    }
  )
})
