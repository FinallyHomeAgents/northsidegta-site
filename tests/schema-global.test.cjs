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

test('global graph includes core identities without review or aggregateRating schema', async () => {
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
  assert.ok(business, 'Finally Home Agents business node should exist')
  assert.equal(business?.review, undefined)
  assert.equal(business?.aggregateRating, undefined)
})

test('global graph exposes region, places, and relationships', async () => {
  const { getGlobalGraphJson, PLACE_IDS } = await loadGraphModule()
  const graph = loadGraph(getGlobalGraphJson)
  const ids = new Set(graph.map((node) => node['@id']))

  Object.values(PLACE_IDS).forEach((id) => {
    assert.ok(ids.has(id), `Place ${id} should be represented`)
  })

  const regionNode = graph.find((node) => node['@id'] === PLACE_IDS.region)
  assert.ok(regionNode, 'Region node should exist in graph')
  assert.equal(regionNode['@type'], 'AdministrativeArea')

  const coreTownSlugs = [
    'uxbridge',
    'georgina',
    'east-gwillimbury',
    'newmarket',
    'aurora',
    'stouffville',
    'scugog',
  ]

  coreTownSlugs.forEach((slug) => {
    const node = graph.find((n) => n['@id'] === PLACE_IDS[slug])
    assert.equal(
      node?.containedInPlace?.['@id'],
      PLACE_IDS.region,
      `${slug} should link back to region`,
    )
  })

  const hamlets = [
    { slug: 'keswick', parent: 'georgina' },
    { slug: 'sutton', parent: 'georgina' },
    { slug: 'pefferlaw', parent: 'georgina' },
    { slug: 'sharon', parent: 'east-gwillimbury' },
    { slug: 'holland-landing', parent: 'east-gwillimbury' },
    { slug: 'mount-albert', parent: 'east-gwillimbury' },
    { slug: 'queensville', parent: 'east-gwillimbury' },
    { slug: 'port-perry', parent: 'scugog' },
  ]

  hamlets.forEach(({ slug, parent }) => {
    const node = graph.find((n) => n['@id'] === PLACE_IDS[slug])
    assert.equal(
      node?.containedInPlace?.['@id'],
      PLACE_IDS[parent],
      `${slug} should link to parent town`,
    )
  })

  const borderCities = ['toronto', 'markham', 'vaughan', 'richmond-hill', 'pickering', 'ajax', 'whitby']
  borderCities.forEach((slug) => {
    assert.ok(ids.has(PLACE_IDS[slug]), `${slug} should be present as border city`)
  })
})
