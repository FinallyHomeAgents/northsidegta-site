'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { pathToFileURL } = require('node:url')
const { createRequire } = require('node:module')

const require_ = createRequire(__filename)
const handlerPath = require_.resolve('../api/events.js')

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

function writeEvent(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`)
}

test('moderation list scopes upcoming events only', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'events-api-'))
  const originalCwd = process.cwd()
  try {
    process.chdir(tmp)
    const eventsDir = path.join(tmp, 'public', 'data', 'events')

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 5)
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)

    writeEvent(path.join(eventsDir, 'future.json'), {
      slug: 'future',
      status: 'published',
      startDate: futureDate.toISOString(),
    })
    writeEvent(path.join(eventsDir, 'past.json'), {
      slug: 'past',
      status: 'published',
      startDate: pastDate.toISOString(),
    })

    const moduleUrl = `${pathToFileURL(handlerPath).href}?t=${Date.now()}`
    const { default: handler } = await import(moduleUrl)

    const res = createMockResponse()
    handler({ method: 'GET', query: { scope: 'upcoming', status: 'published' } }, res)

    assert.equal(res.statusCode, 200)
    assert.ok(Array.isArray(res.body?.events))
    const slugs = res.body.events.map((event) => event.slug)
    assert.deepEqual(slugs, ['future'])
  } finally {
    process.chdir(originalCwd)
    fs.rmSync(tmp, { recursive: true, force: true })
  }
})

test('status filters are respected for pending moderation queries', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'events-api-'))
  const originalCwd = process.cwd()
  try {
    process.chdir(tmp)
    const eventsDir = path.join(tmp, 'public', 'data', 'events')

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    writeEvent(path.join(eventsDir, 'pending-event.json'), {
      slug: 'pending-event',
      status: 'pending',
      startDate: futureDate.toISOString(),
    })
    writeEvent(path.join(eventsDir, 'published-event.json'), {
      slug: 'published-event',
      status: 'published',
      startDate: futureDate.toISOString(),
    })

    const moduleUrl = `${pathToFileURL(handlerPath).href}?t=${Date.now()}`
    const { default: handler } = await import(moduleUrl)

    const res = createMockResponse()
    handler({ method: 'GET', query: { scope: 'upcoming', status: 'pending' } }, res)

    assert.equal(res.statusCode, 200)
    const slugs = (res.body?.events || []).map((event) => event.slug)
    assert.deepEqual(slugs, ['pending-event'])
  } finally {
    process.chdir(originalCwd)
    fs.rmSync(tmp, { recursive: true, force: true })
  }
})

test('system events are excluded from api responses', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'events-api-'))
  const originalCwd = process.cwd()
  try {
    process.chdir(tmp)
    const eventsDir = path.join(tmp, 'public', 'data', 'events')

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 2)

    writeEvent(path.join(eventsDir, '_system.json'), {
      slug: '_system',
      status: 'published',
      startDate: futureDate.toISOString(),
    })
    writeEvent(path.join(eventsDir, 'community.json'), {
      slug: 'community',
      status: 'published',
      startDate: futureDate.toISOString(),
    })

    const moduleUrl = `${pathToFileURL(handlerPath).href}?t=${Date.now()}`
    const { default: handler } = await import(moduleUrl)

    const res = createMockResponse()
    handler({ method: 'GET', query: { scope: 'upcoming', status: 'published', limit: '1' } }, res)

    assert.equal(res.statusCode, 200)
    const slugs = (res.body?.events || []).map((event) => event.slug)
    assert.deepEqual(slugs, ['community'])
  } finally {
    process.chdir(originalCwd)
    fs.rmSync(tmp, { recursive: true, force: true })
  }
})
