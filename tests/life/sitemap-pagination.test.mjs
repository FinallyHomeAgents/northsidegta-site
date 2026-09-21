import test from 'node:test'
import assert from 'node:assert/strict'
import { listSitemapStories } from '../../lib/life/store.js'
import { lifeSitemap } from '../../lib/life/sitemap.js'

test('sitemap keeps older published stories beyond 100 newer drafts', async () => {
  const records = Array.from({ length: 205 }, (_, n) => ({
    id: `12345678-1234-1234-1234-${String(n).padStart(12, '0')}`,
    results: n >= 100 ? { website: { status: 'published' } } : {},
  }))
  const batches = []
  const redis = {
    async zrange(key, start, end) {
      batches.push([start, end])
      return records.slice(start, end + 1).map(d => d.id)
    },
    async mget(...keys) { return keys.map(key => records.find(d => key.endsWith(d.id))) },
  }
  const stories = await listSitemapStories(redis)
  assert.equal(stories.length, 105)
  assert.deepEqual(batches, [[0, 99], [100, 199], [200, 299]])
  const xml = lifeSitemap(stories)
  assert.ok(xml.includes(records[204].id))
  assert.ok(!xml.includes(records[0].id))
})
