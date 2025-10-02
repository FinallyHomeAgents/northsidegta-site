const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const { parseWithStrategy } = require('../lib/events/parsers')

const fixturePath = path.join(__dirname, 'fixtures', 'sample.ics')

const source = {
  id: 'aurora-special-events',
  domain: 'aurora.ca',
  strategy: 'ics',
  timezone: 'America/Toronto',
  metadata: {},
}

test('ICS strategy normalizes events to Toronto timezone', async () => {
  const buffer = fs.readFileSync(fixturePath)
  const result = await parseWithStrategy('ics', {
    buffer,
    text: buffer.toString('utf8'),
    source,
  })

  assert.equal(result.errors.length, 0)
  assert.equal(result.events.length, 2)

  const first = result.events[0]
  assert.equal(first.title, 'Sample Event One')
  assert.equal(first.start, '2024-05-10T10:00:00.000-04:00')
  assert.equal(first.end, '2024-05-10T12:00:00.000-04:00')
  assert.equal(first.allDay, false)
  assert.equal(first.timezone, 'America/Toronto')

  const allDay = result.events.find((event) => event.allDay)
  assert.ok(allDay, 'expected all-day event to be normalized')
  assert.equal(allDay.start, '2024-05-15T00:00:00.000-04:00')
  assert.equal(allDay.end, '2024-05-15T23:59:59.999-04:00')
  assert.equal(allDay.allDay, true)
})
