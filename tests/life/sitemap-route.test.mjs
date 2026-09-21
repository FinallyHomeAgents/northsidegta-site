import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import handler from '../../api/life.js'
import missingCollections from '../../api/collections-index.js'

test('public sitemap route exposes published URLs without private draft fields', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'life-sitemap-'))
  const keys = ['LIFE_LOCAL_DEV', 'LIFE_LOCAL_DATA', 'VERCEL']
  const before = Object.fromEntries(keys.map(k => [k, process.env[k]]))
  try {
    process.env.LIFE_LOCAL_DEV = '1'; process.env.LIFE_LOCAL_DATA = dir; delete process.env.VERCEL
    const id = '12345678-1234-1234-1234-123456789abc'
    await fs.writeFile(path.join(dir, id + '.json'), JSON.stringify({ id, title: 'Private draft title', results: { website: { status: 'published' } } }))
    const res = { headers: {}, setHeader(k,v) { this.headers[k]=v }, status(n) { this.code=n; return this }, send(v) { this.body=v }, json(v) { this.body=v } }
    await handler({ method: 'GET', headers: {}, query: { action: 'sitemap' } }, res)
    assert.equal(res.code, 200)
    assert.match(res.headers['Content-Type'], /application\/xml/)
    assert.ok(res.body.includes('/life/posts/' + id))
    assert.ok(!res.body.includes('Private draft title'))
  } finally {
    for (const k of keys) { if (before[k] === undefined) delete process.env[k]; else process.env[k] = before[k] }
    await fs.rm(dir, { recursive: true, force: true })
  }
})
test('unused collections overview returns a real 404', () => {
  const res = { setHeader() {}, status(n) { this.code=n; return this }, send(v) { this.body=v } }
  missingCollections({}, res)
  assert.equal(res.code, 404)
  assert.match(res.body, /Explore communities/)
})
