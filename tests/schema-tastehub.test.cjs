'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const { buildTasteHubPageSchema } = require('../src/lib/structuredData/tasteHubPage')

function loadTasteHubPollModule() {
  const mod = require('../src/lib/structuredData/tasteHubPoll.js')
  return { buildTasteHubPollSchema: mod.buildTasteHubPollSchema }
}

test('tastehub page schema emits webpage and breadcrumb', () => {
  const schema = buildTasteHubPageSchema()
  const json = JSON.parse(JSON.stringify(schema))
  const graph = json['@graph']

  const webPage = graph.find((node) => Array.isArray(node['@type']) && node['@type'].includes('WebPage'))
  const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList')

  assert.ok(webPage, 'webpage node exists')
  assert.equal(webPage.name.includes('TasteHub'), true)
  assert.ok(webPage.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#tastehub'), 'about references TasteHub id')
  assert.ok(webPage.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#northside-gta'), 'about references brand')
  assert.ok(webPage.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#northside-gta-region'), 'about references region')
  assert.ok(webPage.mentions?.some((node) => node['@id'] === 'https://northsidegta.ca/#tastehub'), 'mentions include TasteHub')
  assert.ok(breadcrumb, 'breadcrumb exists')
})

test('tastehub poll schema includes ranking list', async () => {
  const { buildTasteHubPollSchema } = await loadTasteHubPollModule()

  const schema = buildTasteHubPollSchema({
    slug: 'best-pizza-uxbridge',
    title: 'Best Pizza in Uxbridge',
    description: 'Community pizza showdown.',
    image: '/seo/pizza.jpg',
    townSlug: 'uxbridge',
    townName: 'Uxbridge',
    items: [
      { name: 'Slice House' },
      { name: 'Crust Corner' },
    ],
  })

  const json = JSON.parse(JSON.stringify(schema))
  const graph = json['@graph']
  const itemList = graph.find((node) => node['@type'] === 'ItemList')
  const pollPage = graph.find((node) => Array.isArray(node['@type']) && node['@type'].includes('WebPage'))

  assert.ok(itemList, 'item list exists')
  assert.equal(itemList.numberOfItems, 2)
  assert.equal(itemList.itemListElement?.[0]?.position, 1)
  assert.ok(pollPage.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#uxbridge'), 'poll about includes town id')
  assert.ok(pollPage.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#tastehub'), 'poll about includes tastehub id')
  assert.ok(pollPage.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#northside-gta-region'), 'poll about includes region')
  assert.ok(pollPage.mentions?.some((node) => node['@id'] === 'https://northsidegta.ca/#northside-gta-region'), 'poll mentions region')
})
