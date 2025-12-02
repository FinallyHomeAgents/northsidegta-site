'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { createRequire } = require('node:module')

const require_ = createRequire(__filename)

async function loadHandlerModule() {
  const modulePath = require_.resolve('../api/spotlight/town.js')
  delete require_.cache[modulePath]
  return require(modulePath)
}

function createMockResponse() {
  const res = {
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
  return res
}

test('town API returns spotlight items when cache is cold but refresh data exists', async () => {
  const sampleItems = [
    {
      placeId: 'place-uxbridge-1',
      name: 'Test Uxbridge Cafe',
      rating: 4.8,
      userRatingsTotal: 140,
      tags: ['coffee'],
      photoName: 'places/test/media',
      townSlug: 'uxbridge',
      townName: 'Uxbridge',
    },
  ]

  const { loadTownSpotlights } = await loadHandlerModule()

  let savedPayload = null
  const overrides = {
    loadTownSpotlightData: async () => null,
    loadTownSpotlightConfig: async () => [
      { placeId: 'place-uxbridge-1', tags: ['coffee'], enabled: true },
    ],
    fetchSpotlightPlacesData: async () => sampleItems,
    saveTownSpotlightData: async (slug, payload) => {
      savedPayload = { slug, payload }
      return true
    },
  }

  const loadedItems = await loadTownSpotlights('uxbridge', overrides)
  assert.equal(loadedItems.length, sampleItems.length)
  assert.equal(savedPayload?.slug, 'uxbridge')
  assert.deepEqual(savedPayload?.payload, sampleItems)

  assert.equal(savedPayload?.payload?.length, sampleItems.length)
})
