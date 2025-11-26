'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const { buildCommunityEventsSchema } = require('../src/lib/structuredData/communityPage')
const { buildEventDetailSchema } = require('../src/lib/structuredData/eventDetail')

test('community events schema contains webpage and item list', () => {
  const schema = buildCommunityEventsSchema({
    events: [
      {
        title: 'Farmers Market',
        url: 'https://northsidegta.ca/events/farmers-market',
        startDate: '2024-08-01T14:00:00Z',
        endDate: '2024-08-01T18:00:00Z',
        townName: 'Uxbridge',
        venueName: 'Town Square',
        imageUrl: 'https://northsidegta.ca/images/market.jpg',
        description: 'Fresh produce and live music.',
      },
    ],
  })

  const json = JSON.parse(JSON.stringify(schema))
  const graph = json['@graph']

  const webPage = graph.find((node) => Array.isArray(node['@type']) && node['@type'].includes('WebPage'))
  const itemList = graph.find((node) => node['@type'] === 'ItemList')

  assert.ok(webPage, 'community webpage exists')
  assert.ok(webPage.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#northside-gta'), 'webpage about includes brand')
  assert.ok(webPage.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#uxbridge'), 'webpage about includes place')
  assert.ok(itemList, 'item list exists')
  assert.equal(itemList.numberOfItems, 1)
})

test('event detail schema includes core fields', () => {
  const schema = buildEventDetailSchema({
    slug: 'harvest-festival',
    title: 'Harvest Festival',
    description: 'Celebrate the season.',
    startDate: '2025-09-10T18:00:00-05:00',
    endDate: '2025-09-10T21:00:00-05:00',
    townName: 'Georgina',
    venueName: 'Harbourfront',
    imageUrl: 'https://northsidegta.ca/images/harvest.jpg',
    url: 'https://northsidegta.ca/events/harvest-festival',
  })

  const json = JSON.parse(JSON.stringify(schema))
  assert.equal(json['@type'], 'Event')
  assert.equal(json.name, 'Harvest Festival')
  assert.equal(json.areaServed?.['@id'], 'https://northsidegta.ca/#georgina')
  assert.equal(json.location?.['@id'], 'https://northsidegta.ca/#georgina')
  assert.equal(json.image?.[0], 'https://northsidegta.ca/images/harvest.jpg')
})
