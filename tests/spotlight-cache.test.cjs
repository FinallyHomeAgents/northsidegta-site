'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')
const { createRequire } = require('node:module')

const require_ = createRequire(__filename)

async function loadCacheModule() {
  const moduleUrl = pathToFileURL(require_.resolve('../lib/spotlight/cache.js')).href
  const namespace = await import(`${moduleUrl}?t=${Date.now()}`)
  return namespace
}

test('saving then loading spotlight data returns cached items when redis is unavailable', async () => {
  const cache = await loadCacheModule()
  cache.clearTownSpotlightMemoryCache()

  const sample = [
    {
      placeId: 'place-123',
      name: 'Test Cafe',
      rating: 4.8,
      userRatingsTotal: 120,
      tags: ['coffee', 'bakery'],
      photoName: 'places/abc/media',
      townSlug: 'uxbridge',
    },
  ]

  await cache.saveTownSpotlightData('uxbridge', sample)
  const loaded = await cache.loadTownSpotlightData('uxbridge')

  assert.ok(Array.isArray(loaded), 'loaded data should be an array')
  assert.equal(loaded.length, sample.length)
  assert.deepEqual(loaded[0].placeId, sample[0].placeId)
  assert.deepEqual(loaded[0].photoName, sample[0].photoName)
})
