const test = require('node:test')
const assert = require('node:assert/strict')
const { Headers, Response } = require('node-fetch')

const { fetchEventPageImage } = require('../lib/events/image-scraper.js')

function createFetch(html) {
  return async () =>
    new Response(html, {
      status: 200,
      headers: new Headers({ 'content-type': 'text/html' }),
    })
}

test('fetchEventPageImage prefers og:image content', async () => {
  const html = `
    <html>
      <head>
        <meta property="og:image" content="/images/event.jpg" />
        <meta name="twitter:image" content="https://cdn.example.com/social.png" />
      </head>
      <body>
        <main>
          <img src="https://cdn.example.com/fallback.png" />
        </main>
      </body>
    </html>
  `

  const result = await fetchEventPageImage(
    { eventUrl: 'https://example.com/events/abc' },
    { fetchImpl: createFetch(html) }
  )

  assert.equal(result, 'https://example.com/images/event.jpg')
})

test('fetchEventPageImage falls back to first content image', async () => {
  const html = `
    <html>
      <body>
        <main>
          <img src="/content/photo.png" />
        </main>
      </body>
    </html>
  `

  const result = await fetchEventPageImage(
    { eventUrl: 'https://example.com/events/abc' },
    { fetchImpl: createFetch(html) }
  )

  assert.equal(result, 'https://example.com/content/photo.png')
})

test('fetchEventPageImage skips fetching when image already exists', async () => {
  const result = await fetchEventPageImage(
    { eventUrl: 'https://example.com/events/abc', image: 'https://example.com/existing.jpg' },
    {
      fetchImpl: async () => {
        throw new Error('should not fetch')
      },
    }
  )

  assert.equal(result, null)
})
