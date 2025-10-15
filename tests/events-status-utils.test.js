const test = require('node:test')
const assert = require('node:assert/strict')

const {
  resolveStatusForSync,
  resolveSourceType,
  normalizeStatusValue,
} = require('../lib/events/status-utils.js')

test('normalizeStatusValue keeps allowed statuses', () => {
  assert.equal(normalizeStatusValue('Published'), 'published')
  assert.equal(normalizeStatusValue('pending'), 'pending')
  assert.equal(normalizeStatusValue('ARCHIVED'), 'archived')
})

test('normalizeStatusValue strips unknown statuses', () => {
  assert.equal(normalizeStatusValue('cancelled'), '')
  assert.equal(normalizeStatusValue(''), '')
  assert.equal(normalizeStatusValue(null), '')
})

test('resolveSourceType prefers incoming source objects', () => {
  const source = resolveSourceType({}, { source: { id: 'abc' } })
  assert.equal(source, 'feed')
})

test('resolveSourceType respects manual preserved source', () => {
  const source = resolveSourceType({ source: 'manual' }, {})
  assert.equal(source, 'manual')
})

test('resolveStatusForSync auto-approves new feed events', () => {
  const status = resolveStatusForSync({ incomingEvent: { source: { id: 'abc' } } })
  assert.equal(status, 'approved')
})

test('resolveStatusForSync upgrades previously pending feed events', () => {
  const status = resolveStatusForSync({
    preservedEvent: { status: 'pending', source: 'feed' },
    incomingEvent: { source: { id: 'abc' } },
  })
  assert.equal(status, 'approved')
})

test('resolveStatusForSync keeps manual pending events pending', () => {
  const status = resolveStatusForSync({
    preservedEvent: { status: 'pending', source: 'manual' },
    incomingEvent: { source: 'manual' },
  })
  assert.equal(status, 'pending')
})

test('resolveStatusForSync preserves archived state', () => {
  const status = resolveStatusForSync({
    preservedEvent: { status: 'archived', source: 'feed' },
    incomingEvent: { source: { id: 'abc' } },
  })
  assert.equal(status, 'archived')
})
