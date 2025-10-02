import test from 'node:test'
import assert from 'node:assert/strict'

import admin from '../admin-events.js';
const { filterEventsByScope } = admin;

const reference = new Date('2025-05-10T16:00:00.000Z')

const events = [
  { slug: 'upcoming-today', startDate: '2025-05-10T14:00:00.000Z' },
  { slug: 'past-yesterday', startDate: '2025-05-09T20:00:00.000Z' },
  { slug: 'upcoming-tomorrow', startDate: '2025-05-11T15:00:00.000Z' },
  { slug: 'midnight-today', startDate: '2025-05-10T04:00:00.000Z' },
]

test('upcoming scope returns events starting today or later in Toronto time', () => {
  const result = filterEventsByScope(events, 'upcoming', reference)
  const slugs = result.map((event) => event.slug).sort()
  assert.deepEqual(slugs, ['midnight-today', 'upcoming-today', 'upcoming-tomorrow'].sort())
})

test('past scope returns events before today in Toronto time', () => {
  const result = filterEventsByScope(events, 'past', reference)
  const slugs = result.map((event) => event.slug)
  assert.deepEqual(slugs, ['past-yesterday'])
})

test('all scope includes every event', () => {
  const result = filterEventsByScope(events, 'all', reference)
  const slugs = result.map((event) => event.slug).sort()
  assert.deepEqual(slugs, ['midnight-today', 'past-yesterday', 'upcoming-today', 'upcoming-tomorrow'].sort())
})

test('default scope falls back to upcoming', () => {
  const result = filterEventsByScope(events, undefined, reference)
  const slugs = result.map((event) => event.slug).sort()
  assert.deepEqual(slugs, ['midnight-today', 'upcoming-today', 'upcoming-tomorrow'].sort())
})
