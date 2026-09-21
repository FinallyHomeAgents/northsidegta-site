import test from 'node:test'
import assert from 'node:assert/strict'
import { lifeSitemap } from '../../lib/life/sitemap.js'

test('Life sitemap includes only published website stories and deduplicates URLs', () => {
  const live = { id: '12345678-1234-1234-1234-123456789abc', results: { website: { status: 'published' } } }
  const xml = lifeSitemap([live, live,
    { id: '22222222-1234-1234-1234-123456789abc', results: {} },
    { id: '33333333-1234-1234-1234-123456789abc', results: { instagram: { status: 'published' } } },
    { id: '<unsafe>', results: { website: { status: 'published' } } },
  ])
  assert.ok(xml.includes('<loc>https://northsidegta.ca/life/</loc>'))
  assert.equal(xml.match(/\/life\/posts\//g).length, 1)
  assert.ok(xml.includes(live.id))
  assert.ok(!xml.includes('22222222'))
  assert.ok(!xml.includes('33333333'))
  assert.ok(!xml.includes('<unsafe>'))
})
