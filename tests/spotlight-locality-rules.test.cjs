'use strict'

const { test, afterEach } = require('node:test')
const assert = require('node:assert/strict')

const originalFetch = global.fetch
const originalApiKey = process.env.GOOGLE_PLACES_API_KEY

afterEach(() => {
  global.fetch = originalFetch
  if (typeof originalApiKey === 'undefined') {
    delete process.env.GOOGLE_PLACES_API_KEY
  } else {
    process.env.GOOGLE_PLACES_API_KEY = originalApiKey
  }
})

test('filters out places outside the town locality list', async () => {
  process.env.GOOGLE_PLACES_API_KEY = 'test-key'

  let fetchCalls = 0
  global.fetch = async () => {
    fetchCalls += 1
    return {
      ok: true,
      async json() {
        return {
          displayName: { text: 'Mismatch Park' },
          rating: 4.7,
          userRatingCount: 120,
          photos: [{ name: 'photo/mismatch' }],
          addressComponents: [
            { longText: 'Pickering', shortText: 'Pickering', types: ['locality'] },
          ],
        }
      },
    }
  }

  const { fetchSpotlightPlacesData } = await import('../lib/spotlight/fetchSpotlightPlacesData.js')
  const items = await fetchSpotlightPlacesData(
    'aurora',
    'Aurora',
    [{ placeId: 'place-1', tags: ['hidden_gem'] }],
    new Map(),
  )

  assert.equal(fetchCalls, 1)
  assert.equal(items.length, 0)
})

test('prevents reusing a place across different towns in one run', async () => {
  process.env.GOOGLE_PLACES_API_KEY = 'test-key'

  const payloads = [
    {
      displayName: { text: 'Shared Trail' },
      rating: 4.8,
      userRatingCount: 220,
      photos: [{ name: 'photo/shared' }],
      addressComponents: [{ longText: 'Aurora', shortText: 'Aurora', types: ['locality'] }],
    },
    {
      displayName: { text: 'Shared Trail' },
      rating: 4.8,
      userRatingCount: 220,
      photos: [{ name: 'photo/shared' }],
      addressComponents: [
        { longText: 'Newmarket', shortText: 'Newmarket', types: ['locality'] },
      ],
    },
  ]

  global.fetch = async () => {
    return {
      ok: true,
      async json() {
        return payloads.shift()
      },
    }
  }

  const { fetchSpotlightPlacesData } = await import('../lib/spotlight/fetchSpotlightPlacesData.js')
  const assignedPlaceIds = new Map()
  const configs = [{ placeId: 'shared-place', tags: ['photo_worthy'] }]

  const auroraItems = await fetchSpotlightPlacesData('aurora', 'Aurora', configs, assignedPlaceIds)
  const newmarketItems = await fetchSpotlightPlacesData(
    'newmarket',
    'Newmarket',
    configs,
    assignedPlaceIds,
  )

  assert.equal(auroraItems.length, 1)
  assert.equal(newmarketItems.length, 0)
  assert.equal(assignedPlaceIds.get('shared-place'), 'aurora')
})
