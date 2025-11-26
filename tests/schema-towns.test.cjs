'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const { buildTownPageSchema } = require('../src/lib/structuredData/townPage')

test('town page schema includes webpage and breadcrumb', () => {
  const schema = buildTownPageSchema({
    slug: 'uxbridge',
    name: 'Uxbridge',
    url: 'https://northsidegta.ca/uxbridge',
    heroImage: '/images/uxbridge.jpg',
    description: 'Discover Uxbridge living.',
  })

  const json = JSON.parse(JSON.stringify(schema))
  const graph = json['@graph']

  assert.ok(Array.isArray(graph), 'graph exists')
  const webPage = graph.find((node) => Array.isArray(node['@type']) && node['@type'].includes('WebPage'))
  const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList')
  const faq = graph.find((node) => node['@type'] === 'FAQPage')

  assert.ok(webPage, 'webpage node present')
  assert.equal(webPage.name, 'Living in Uxbridge | NorthSide GTA Real Estate Guide')
  assert.ok(webPage.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#northside-gta'), 'webpage includes brand about')
  assert.ok(breadcrumb, 'breadcrumb present')
  assert.equal(breadcrumb.itemListElement?.[2]?.name, 'Uxbridge')
  assert.ok(faq, 'faq page exists when town faq entries present')
  assert.ok(faq.mainEntity?.length > 0, 'faq has entries')
})
