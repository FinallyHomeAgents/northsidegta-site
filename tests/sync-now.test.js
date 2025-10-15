const test = require('node:test')
const assert = require('node:assert/strict')

const ORIGINAL_ENV = { ...process.env }
const ORIGINAL_FETCH = global.fetch

function restoreEnv(key) {
  if (Object.prototype.hasOwnProperty.call(ORIGINAL_ENV, key)) {
    process.env[key] = ORIGINAL_ENV[key]
  } else {
    delete process.env[key]
  }
}

test.afterEach(() => {
  restoreEnv('GITHUB_TOKEN')
  restoreEnv('GITHUB_REPO')
  restoreEnv('GH_TOKEN')
  restoreEnv('GITHUB_REF_NAME')
  restoreEnv('VERCEL_GIT_COMMIT_REF')
  restoreEnv('EVENTS_SYNC_MODE')
  restoreEnv('EVENTS_SYNC_FEED')

  if (ORIGINAL_FETCH) {
    global.fetch = ORIGINAL_FETCH
  } else {
    delete global.fetch
  }
})

test('triggerSync sends write=true input and requires both dispatches succeed', async () => {
  process.env.GITHUB_TOKEN = 'token'
  process.env.GITHUB_REPO = 'acme/repo'
  const requests = []

  global.fetch = async (url, init = {}) => {
    requests.push({ url, init })
    return new Response(null, { status: 202 })
  }

  const { triggerSync } = await import('../api/sync-now.js')
  const result = await triggerSync()

  assert.equal(result.status, 200)
  assert.equal(result.body.ok, true)

  const workflowRequest = requests.find(
    (request) => request.url.includes('/actions/workflows/') && request.url.endsWith('/dispatches')
  )
  assert.ok(workflowRequest, 'workflow dispatch request was sent')
  const parsedBody = JSON.parse(workflowRequest.init.body)
  assert.deepEqual(parsedBody.inputs, { write: 'true' })
  assert.equal(parsedBody.ref, 'main')

  const repoDispatchRequest = requests.find(
    (request) =>
      request.url.includes('/repos/acme/repo/dispatches') && !request.url.includes('/actions/workflows/')
  )
  assert.ok(repoDispatchRequest, 'repository dispatch request was sent')
  const repoBody = JSON.parse(repoDispatchRequest.init.body)
  assert.equal(repoBody.event_type, 'sync_now')
})

test('triggerSync surfaces 4xx failure details', async () => {
  process.env.GITHUB_TOKEN = 'token'
  process.env.GITHUB_REPO = 'acme/repo'

  global.fetch = async (url) => {
    if (url.includes('/actions/workflows/')) {
      return new Response(JSON.stringify({ message: 'Validation Failed' }), { status: 422 })
    }
    return new Response(null, { status: 202 })
  }

  const { triggerSync } = await import('../api/sync-now.js')
  const result = await triggerSync()

  assert.equal(result.status, 502)
  assert.equal(result.body.ok, false)
  assert.equal(result.body.workflowStatus, 422)
  assert.equal(result.body.repoDispatchStatus, 202)
  assert.equal(result.body.workflowError, 'Validation Failed')
  assert.equal(result.body.dispatchError, '')
  assert.match(result.body.hint, /workflow inputs were invalid/i)
})
