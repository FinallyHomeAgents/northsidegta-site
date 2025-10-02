const test = require('node:test')
const assert = require('node:assert/strict')
const { auditSource } = require('../lib/events/audit')

const html = `<!doctype html>
<html>
<head></head>
<body>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Mock Event",
  "startDate": "2024-06-01T18:00:00-04:00",
  "endDate": "2024-06-01T20:00:00-04:00",
  "url": "https://example.com/events/mock"
}
</script>
</body>
</html>`

const source = {
  id: 'example-events',
  domain: 'example.com',
  strategy: 'jsonld',
  start_urls: ['https://example.com/events'],
  timezone: 'America/Toronto',
  metadata: {},
}

test('auditSource returns structured diagnostics', async () => {
  const fetcher = async () => ({
    url: 'https://example.com/events',
    status: 200,
    ok: true,
    headers: { 'content-type': 'text/html' },
    buffer: Buffer.from(html),
    retries: 0,
    elapsedMs: 42,
  })

  const robotsEvaluator = async () => ({ allowed: true, source: 'mock' })

  const record = await auditSource(source, { fetcher, robotsEvaluator })

  assert.equal(record.domain, 'example.com')
  assert.equal(record.strategy, 'jsonld')
  assert.equal(record.audit.fetches.length, 1)
  assert.equal(record.audit.fetches[0].status, 200)
  assert.equal(record.audit.parse.events_found, 1)
  assert.deepEqual(record.audit.parse.errors, [])
  assert.equal(record.audit.failure_category, null)
  assert.equal(record.audit.robots.allowed, true)
  assert.ok(record.audit.elapsed_ms >= 0)
  assert.ok(record.audit.features.jsonld)
})
