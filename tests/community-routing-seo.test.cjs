process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { parse } = require('node-html-parser')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { HelmetProvider } = require('react-helmet-async')
const { MemoryRouter } = require('react-router-dom')

require.extensions['.css'] = () => {}
require.extensions['.svg'] = () => {}
require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: ['react-app'],
  ignore: [/node_modules/],
})

const root = path.resolve(__dirname, '..')
const slugs = ['georgina','east-gwillimbury','newmarket','aurora','stouffville','uxbridge','scugog']
const communityComponents = {
  georgina: 'GeorginaPage',
  'east-gwillimbury': 'EastGwillimburyPage',
  newmarket: 'NewmarketPage',
  aurora: 'AuroraPage',
  stouffville: 'StouffvillePage',
  uxbridge: 'UxbridgePage',
  scugog: 'ScugogPage',
}
const movingGuideComponents = {
  '/moving-to-georgina-from-toronto': 'MovingToGeorginaFromTorontoPage',
  '/moving-to-east-gwillimbury-from-toronto': 'MovingToEastGwillimburyFromTorontoPage',
  '/moving-to-newmarket-from-toronto': 'MovingToNewmarketFromTorontoPage',
  '/moving-to-aurora-from-toronto': 'MovingToAuroraFromTorontoPage',
  '/moving-to-stouffville-from-toronto': 'MovingToStouffvilleFromTorontoPage',
  '/moving-to-uxbridge-from-toronto': 'MovingToUxbridgeFromTorontoPage',
  '/moving-to-port-perry-scugog-from-toronto': 'MovingToPortPerryScugogFromTorontoPage',
}
const townNames = new Map([
  ['georgina','Georgina'], ['east-gwillimbury','East Gwillimbury'], ['newmarket','Newmarket'],
  ['aurora','Aurora'], ['stouffville','Stouffville'], ['uxbridge','Uxbridge'], ['scugog','Scugog'],
])
const site = 'https://northsidegta.ca'

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8') }
function redirectTarget(source, query='') {
  const config = JSON.parse(read('vercel.json'))
  const redirect = config.redirects.find((item) => item.source === source)
  assert.ok(redirect, `missing redirect for ${source}`)
  assert.equal(redirect.statusCode, 308)
  return `${redirect.destination}${query}`
}
function schemaGraphs(meta) {
  const schema = meta.schema
  const nodes = schema?.['@graph'] || [schema]
  return nodes.filter(Boolean)
}
function renderRouteComponent(route, componentName) {
  global.window = {
    location: { href: `${site}${route}`, origin: site, pathname: route, search: '', hash: '' },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  }
  global.document = { referrer: '', body: { style: {} } }

  const Component = require(path.join(root, 'src', componentName)).default
  const originalConsoleError = console.error
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('useLayoutEffect does nothing on the server')
    ) {
      return
    }
    originalConsoleError(...args)
  }

  let markup
  try {
    markup = renderToStaticMarkup(
      React.createElement(
        HelmetProvider,
        null,
        React.createElement(
          MemoryRouter,
          { initialEntries: [route] },
          React.createElement(Component),
        ),
      ),
    )
  } finally {
    console.error = originalConsoleError
  }
  return parse(markup)
}
function assertComplianceFooter(doc, route) {
  const footer = doc.querySelector('footer[role="contentinfo"]')
  assert.ok(footer, `${route} rendered without a contentinfo footer`)
  const footerText = footer.text.replace(/\s+/g, ' ').trim()
  assert.match(footerText, /Registrant information \(TRESA\)/)
  assert.match(footerText, /Real Estate Council of Ontario \(RECO\)/)
  assert.match(footerText, /Trust in Real Estate Services Act, 2002 \(TRESA\)/)
}

test('legacy slash and non-slash community routes are permanent 308 redirects that preserve queries', () => {
  for (const slug of slugs) {
    assert.equal(redirectTarget(`/${slug}`), `/communities/${slug}`)
    assert.equal(redirectTarget(`/${slug}/`), `/communities/${slug}`)
    assert.equal(redirectTarget(`/${slug}`, '?utm_source=test&x=1'), `/communities/${slug}?utm_source=test&x=1`)
    assert.equal(redirectTarget(`/${slug}/`, '?utm_source=test&x=1'), `/communities/${slug}?utm_source=test&x=1`)
  }
})

test('community SEO metadata is unique, self-referencing, breadcrumbed, and non-www', async () => {
  const { getStaticRouteMeta } = await import('../src/components/seo/staticRouteMetaConfigs.mjs')
  const titles = new Set()
  const descriptions = new Set()
  for (const slug of slugs) {
    const route = `/communities/${slug}`
    const meta = getStaticRouteMeta(route)
    assert.ok(meta, `missing static meta for ${route}`)
    assert.equal(meta.canonicalUrl, `${site}${route}`)
    assert.notEqual(meta.canonicalUrl, `${site}/`)
    const ogUrl = meta.additionalMeta?.find((tag) => tag.property === 'og:url')?.content || meta.canonicalUrl
    assert.equal(ogUrl, `${site}${route}`)
    assert.ok(meta.documentTitle && !titles.has(meta.documentTitle), `duplicate title: ${meta.documentTitle}`)
    assert.ok(meta.description && !descriptions.has(meta.description), `duplicate description: ${meta.description}`)
    titles.add(meta.documentTitle)
    descriptions.add(meta.description)
    assert.doesNotMatch(JSON.stringify(meta), /https:\/\/www\.northsidegta\.ca/)

    const breadcrumb = schemaGraphs(meta).find((node) => node['@type'] === 'BreadcrumbList')
    assert.ok(breadcrumb, `missing BreadcrumbList for ${route}`)
    assert.deepEqual(breadcrumb.itemListElement.map((item) => item.item), [
      `${site}/`, `${site}/communities`, `${site}${route}`,
    ])
    assert.deepEqual(breadcrumb.itemListElement.map((item) => item.name), ['Home', 'Communities', townNames.get(slug)])
  }
})

test('React community pages keep town H1/content shell and include matching runtime SEO', () => {
  for (const [slug, pageName] of Object.entries(communityComponents)) {
    const town = townNames.get(slug)
    const source = read(`src/${pageName}.js`)
    assert.match(source, new RegExp(`<h1>Living in ${town}<\\/h1>`))
    assert.match(source, /class="page-grid"/)
    assert.match(source, /<HeaderShell \/>/)
    assert.match(source, new RegExp(`<meta property="og:url" content="${site}/communities/${slug}" \\/>`))
    assert.match(source, new RegExp(`<link rel="canonical" href="${site}/communities/${slug}" \\/>`))
    assert.doesNotMatch(source, /COMMUNITY_BREADCRUMB_SCHEMA/)
    assert.doesNotMatch(source, /https:\/\/www\.northsidegta\.ca/)
  }
})

test('community pages and moving guides render the shared TRESA/RECO compliance footer', () => {
  for (const [slug, componentName] of Object.entries(communityComponents)) {
    const route = `/communities/${slug}`
    assertComplianceFooter(renderRouteComponent(route, componentName), route)
  }
  for (const [route, componentName] of Object.entries(movingGuideComponents)) {
    assertComplianceFooter(renderRouteComponent(route, componentName), route)
  }
})

test('sitemap contains only canonical community URLs once and no www URLs', () => {
  const doc = parse(read('public/sitemap.xml'))
  const locs = doc.querySelectorAll('loc').map((loc) => loc.text.trim())
  assert.equal(new Set(locs).size, locs.length, 'duplicate sitemap URLs')
  assert.ok(locs.every((loc) => !loc.includes('://www.')), 'sitemap includes www URL')
  for (const slug of slugs) {
    assert.equal(locs.filter((loc) => loc === `${site}/communities/${slug}`).length, 1)
    assert.equal(locs.filter((loc) => loc === `${site}/${slug}`).length, 0)
  }
})

test('community internal links use canonical /communities routes', () => {
  for (const file of ['src/MapHero.js', 'src/TownStrip.js']) {
    const source = read(file)
    for (const slug of slugs) {
      assert.doesNotMatch(source, new RegExp(`["']/${slug}["']`), `${file} still links to /${slug}`)
      assert.match(source, new RegExp(`["']/communities/${slug}["']`), `${file} missing canonical link for ${slug}`)
    }
  }
})
