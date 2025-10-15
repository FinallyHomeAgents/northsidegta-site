const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

function patchEnv(overrides) {
  const previous = {}
  const keys = Object.keys(overrides)
  for (const key of keys) {
    previous[key] = Object.prototype.hasOwnProperty.call(process.env, key)
      ? process.env[key]
      : undefined
    const value = overrides[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
  return () => {
    for (const key of keys) {
      const original = previous[key]
      if (original === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = original
      }
    }
  }
}

function loadSyncModule() {
  const modulePath = path.join(__dirname, '..', 'api', 'sync-now.js')
  delete require.cache[require.resolve(modulePath)]
  return require(modulePath)
}

test('triggerSync reports missing token with hint', async (t) => {
  const restoreEnv = patchEnv({
    GH_TOKEN: '',
    GITHUB_TOKEN: '',
    PERSONAL_GITHUB_TOKEN: undefined,
    GITHUB_PERSONAL_TOKEN: undefined,
    GITHUB_REPO: 'northside/site',
  })
  t.after(restoreEnv)

  const { triggerSync } = loadSyncModule()
  const result = await triggerSync()

  assert.equal(result.status, 500)
  assert.equal(result.body.ok, false)
  assert.match(result.body.hint, /GH_TOKEN/)
})

test('triggerSync fails fast when repo metadata missing', async (t) => {
  const restoreEnv = patchEnv({
    GH_TOKEN: 'abc123',
    GITHUB_TOKEN: undefined,
    GITHUB_REPO: undefined,
    GITHUB_REPO_OWNER: undefined,
    GITHUB_REPO_NAME: undefined,
    VERCEL_GIT_REPO_OWNER: undefined,
    VERCEL_GIT_REPO_SLUG: undefined,
  })
  t.after(restoreEnv)

  const { triggerSync } = loadSyncModule()
  const result = await triggerSync()

  assert.equal(result.status, 500)
  assert.equal(result.body.ok, false)
  assert.match(result.body.hint, /owner\/name/)
})

test('triggerSync dispatches using fallback env vars', async (t) => {
  const restoreEnv = patchEnv({
    GH_TOKEN: '',
    GITHUB_TOKEN: 'token-from-github',
    GITHUB_REPO: 'northsidegta/site',
    GITHUB_REF_NAME: '',
    GITHUB_HEAD_REF: '',
    GITHUB_REF: 'refs/heads/release',
    VERCEL_GIT_COMMIT_REF: '',
  })
  t.after(restoreEnv)

  const calls = []
  const originalFetch = global.fetch
  global.fetch = async (url, init = {}) => {
    calls.push({ url, init })
    return {
      status: 204,
      text: async () => '',
    }
  }
  t.after(() => {
    global.fetch = originalFetch
  })

  const { triggerSync } = loadSyncModule()
  const result = await triggerSync()

  assert.equal(result.status, 200)
  assert.equal(result.body.ok, true)
  assert.equal(result.body.ref, 'release')
  assert.equal(result.body.owner, 'northsidegta')
  assert.equal(result.body.repo, 'site')
  assert.equal(calls.length, 2)

  const workflowCall = calls[0]
  assert.ok(workflowCall.url.includes('/actions/workflows/events-sync.yml/dispatches'))
  const payload = JSON.parse(workflowCall.init.body)
  assert.equal(payload.ref, 'release')
  assert.equal(workflowCall.init.headers.Authorization, 'Bearer token-from-github')
})

test('resolveRef defaults to main when candidates empty', (t) => {
  const restoreEnv = patchEnv({
    GITHUB_REF: '',
    GITHUB_REF_NAME: '',
    GITHUB_HEAD_REF: '',
    VERCEL_GIT_COMMIT_REF: '',
  })
  t.after(restoreEnv)

  const { __internals } = loadSyncModule()
  assert.equal(__internals.resolveRef(), 'main')
})

test('resolveRef strips refs/heads prefix', (t) => {
  const restoreEnv = patchEnv({
    GITHUB_REF: 'refs/heads/feature/test',
    GITHUB_REF_NAME: '',
    GITHUB_HEAD_REF: '',
    VERCEL_GIT_COMMIT_REF: '',
  })
  t.after(restoreEnv)

  const { __internals } = loadSyncModule()
  assert.equal(__internals.resolveRef(), 'feature/test')
})
