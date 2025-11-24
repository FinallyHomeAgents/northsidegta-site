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

test('applies the primary rating and review thresholds', async () => {
  process.env.GOOGLE_PLACES_API_KEY = 'test-key'

  const payloads = [
    {
      displayName: { text: 'Too Low Rated Park' },
      rating: 3.7,
      userRatingCount: 120,
      photos: [{ name: 'photo/low-rated' }],
      addressComponents: [
        { longText: 'Aurora', shortText: 'Aurora', types: ['locality'] },
      ],
    },
    {
      displayName: { text: 'Too Few Reviews Trail' },
      rating: 4.1,
      userRatingCount: 19,
      photos: [{ name: 'photo/few-reviews' }],
      addressComponents: [
        { longText: 'Aurora', shortText: 'Aurora', types: ['locality'] },
      ],
    },
    {
      displayName: { text: 'Passing Museum' },
      rating: 4.2,
      userRatingCount: 25,
      photos: [{ name: 'photo/passing' }],
      addressComponents: [
        { longText: 'Aurora', shortText: 'Aurora', types: ['locality'] },
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
  const items = await fetchSpotlightPlacesData(
    'aurora',
    'Aurora',
    [
      { placeId: 'place-1', tags: ['hidden_gem'] },
      { placeId: 'place-2', tags: ['photo_worthy'] },
      { placeId: 'place-3', tags: ['where_locals_go'] },
    ],
    new Map(),
  )

  assert.equal(items.length, 1)
  assert.equal(items[0].placeId, 'place-3')
})

test('fills remaining slots with fallback threshold results when needed', async () => {
  process.env.GOOGLE_PLACES_API_KEY = 'test-key'

  const payloads = [
    {
      displayName: { text: 'Ridge Trail' },
      rating: 4.6,
      userRatingCount: 80,
      photos: [{ name: 'photo/ridge' }],
      addressComponents: [
        { longText: 'Uxbridge', shortText: 'Uxbridge', types: ['locality'] },
      ],
    },
    {
      displayName: { text: 'Forest Park' },
      rating: 4.2,
      userRatingCount: 60,
      photos: [{ name: 'photo/forest' }],
      addressComponents: [
        { longText: 'Uxbridge', shortText: 'Uxbridge', types: ['locality'] },
      ],
    },
    {
      displayName: { text: 'Lakefront Lookout' },
      rating: 3.9,
      userRatingCount: 55,
      photos: [{ name: 'photo/lakefront' }],
      addressComponents: [
        { longText: 'Uxbridge', shortText: 'Uxbridge', types: ['locality'] },
      ],
    },
    {
      displayName: { text: 'Historic Village' },
      rating: 3.85,
      userRatingCount: 120,
      photos: [{ name: 'photo/village' }],
      addressComponents: [
        { longText: 'Uxbridge', shortText: 'Uxbridge', types: ['locality'] },
      ],
    },
    {
      displayName: { text: 'Harbour Boardwalk' },
      rating: 3.8,
      userRatingCount: 42,
      photos: [{ name: 'photo/boardwalk' }],
      addressComponents: [
        { longText: 'Uxbridge', shortText: 'Uxbridge', types: ['locality'] },
      ],
    },
    {
      displayName: { text: 'Under Threshold Market' },
      rating: 3.6,
      userRatingCount: 85,
      photos: [{ name: 'photo/market' }],
      addressComponents: [
        { longText: 'Uxbridge', shortText: 'Uxbridge', types: ['locality'] },
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
  const items = await fetchSpotlightPlacesData(
    'uxbridge',
    'Uxbridge',
    [
      { placeId: 'place-1', tags: ['hidden_gem'] },
      { placeId: 'place-2', tags: ['photo_worthy'] },
      { placeId: 'place-3', tags: ['where_locals_go'] },
      { placeId: 'place-4', tags: ['active_day_idea'] },
      { placeId: 'place-5', tags: ['family_day_idea'] },
      { placeId: 'place-6', tags: ['perfect_park_day'] },
    ],
    new Map(),
  )

  assert.equal(items.length, 5)
  assert.deepEqual(
    items.map((item) => item.placeId),
    ['place-1', 'place-2', 'place-3', 'place-4', 'place-5'],
  )
  assert.deepEqual(
    items.map((item) => item.rating),
    [4.6, 4.2, 3.9, 3.85, 3.8],
  )
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
