'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')

const { buildInsightArticleSchema } = require('../src/lib/structuredData/insightArticle')

function getArticleNode(graph) {
  return graph.find((node) => Array.isArray(node['@type']) && node['@type'].includes('Article'))
}

function getBreadcrumb(graph) {
  return graph.find((node) => node['@type'] === 'BreadcrumbList')
}

test('insight article schema includes article, breadcrumb, and town cluster about/mentions', () => {
  const schema = buildInsightArticleSchema({
    slug: 'spotlight-on-uxbridge',
    title: 'Spotlight on Uxbridge',
    summary: 'A quick look at living in Uxbridge.',
    image: '/images/insight.jpg',
    published: '2024-01-15T00:00:00Z',
    updated: '2024-01-20T00:00:00Z',
    authorId: 'https://northsidegta.ca/#matthew-mulhall',
  })

  const json = JSON.parse(JSON.stringify(schema))
  const graph = json['@graph']

  assert.ok(Array.isArray(graph) && graph.length >= 2, 'graph should include nodes')

  const article = getArticleNode(graph)
  assert.ok(article, 'article node exists')
  assert.equal(article.headline, 'Spotlight on Uxbridge')
  assert.equal(article.description, 'A quick look at living in Uxbridge.')
  assert.equal(article.datePublished, '2024-01-15T00:00:00Z')
  assert.equal(article.author['@id'], 'https://northsidegta.ca/#matthew-mulhall')
  assert.ok(article.about?.some((node) => node['@id'] === 'https://northsidegta.ca/#uxbridge'), 'includes place about')
  assert.ok(article.mentions?.some((node) => node['@id'] === 'https://northsidegta.ca/#northside-gta'), 'mentions brand node')

  const breadcrumb = getBreadcrumb(graph)
  assert.ok(breadcrumb, 'breadcrumb list exists')
  assert.equal(breadcrumb.itemListElement?.length, 3)
})
