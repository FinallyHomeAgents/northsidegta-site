'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

async function loadGraphModule() {
  const mod = await import('../src/lib/structuredData/globalGraph.js')
  return {
    getGlobalGraphJson: mod.getGlobalGraphJson,
    PLACE_IDS: mod.PLACE_IDS,
  }
}

function loadGraph(getGlobalGraphJson) {
  const json = getGlobalGraphJson()
  const parsed = JSON.parse(json)
  return parsed['@graph'] || []
}

test('global graph includes core identities and reviews', async () => {
  const { getGlobalGraphJson, PLACE_IDS } = await loadGraphModule()
  const graph = loadGraph(getGlobalGraphJson)
  const ids = new Set(graph.map((node) => node['@id']))

  assert.ok(
    ids.has('https://northsidegta.ca/#finally-home-agents'),
    'Finally Home Agents should be present in global graph',
  )
  assert.ok(ids.has('https://northsidegta.ca/#website'), 'Website node should exist in global graph')
  assert.ok(
    ids.has('https://northsidegta.ca/#tastehub'),
    'TasteHub web application should be present in global graph',
  )

  const business = graph.find((node) => node['@id'] === 'https://northsidegta.ca/#finally-home-agents')
  assert.ok(Array.isArray(business?.review) && business.review.length >= 10)
  assert.equal(business?.aggregateRating?.ratingValue, '5')
})

test('global graph exposes place ids for all towns', async () => {
  const { getGlobalGraphJson, PLACE_IDS } = await loadGraphModule()
  const graph = loadGraph(getGlobalGraphJson)
  const ids = new Set(graph.map((node) => node['@id']))
  Object.values(PLACE_IDS).forEach((id) => {
    assert.ok(ids.has(id), `Place ${id} should be represented`)
  })
})
