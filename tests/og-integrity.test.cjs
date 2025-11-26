'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { Helmet, HelmetProvider } = require('react-helmet-async')

test('og and twitter preview tags remain present', () => {
  const helmetContext = {}

  ReactDOMServer.renderToString(
    React.createElement(
      HelmetProvider,
      { context: helmetContext },
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          Helmet,
          null,
          React.createElement('meta', { property: 'og:title', content: 'NorthSide GTA' }),
          React.createElement('meta', { property: 'og:image', content: 'https://northsidegta.ca/og.jpg' }),
          React.createElement('meta', { name: 'twitter:card', content: 'summary_large_image' }),
          React.createElement('script', { type: 'application/ld+json' }, '{}'),
        ),
      ),
    ),
  )

  const metaString = helmetContext.helmet?.meta?.toString?.() || ''
  assert.ok(metaString.includes('og:title'), 'og:title tag should be present')
  assert.ok(metaString.includes('og:image'), 'og:image tag should be present')
})
