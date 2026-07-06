const test = require('node:test')
const assert = require('node:assert/strict')
const ical = require('node-ical')
const { expandIcsEvents } = require('../lib/events/ics')

async function parseIcs(content) {
  const parsed = await ical.async.parseICS(content)
  return Object.values(parsed).filter((entry) => entry && entry.type === 'VEVENT')
}

test('expands RRULE occurrences into daily schedule rows', async () => {
  const ics = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:rrule@example.com\nDTSTART:20240520T140000Z\nDTEND:20240520T160000Z\nRRULE:FREQ=DAILY;COUNT=3\nSUMMARY:Daily Event\nEND:VEVENT\nEND:VCALENDAR`
  const events = await parseIcs(ics)
  const normalized = expandIcsEvents(events, { timezone: 'America/Toronto' }, new Date('2024-05-19T12:00:00Z'))
  assert.equal(normalized.length, 1)
  const event = normalized[0]
  assert.equal(event.use_daily_schedule, true)
  assert.ok(Array.isArray(event.daily_schedule))
  assert.equal(event.daily_schedule.length, 3)
  assert.deepEqual(event.daily_schedule[0], {
    date: '2024-05-20',
    all_day: false,
    start_time: '10:00',
    end_time: '12:00',
  })
  assert.match(event.start, /^2024-05-20T10:00:00/)
  assert.match(event.end, /^2024-05-22T12:00:00/)
  assert.equal(event.rrule, 'FREQ=DAILY;COUNT=3')
})

test('splits multi-day timed spans when hours are unambiguous', async () => {
  const ics = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:span@example.com\nDTSTART:20240510T130000Z\nDTEND:20240512T210000Z\nSUMMARY:Weekend Fair\nEND:VEVENT\nEND:VCALENDAR`
  const events = await parseIcs(ics)
  const normalized = expandIcsEvents(events, { timezone: 'America/Toronto' }, new Date('2024-05-01T12:00:00Z'))
  const event = normalized[0]
  assert.equal(event.use_daily_schedule, true)
  assert.equal(event.daily_schedule.length, 3)
  assert.deepEqual(event.daily_schedule[0], {
    date: '2024-05-10',
    all_day: false,
    start_time: '09:00',
    end_time: '17:00',
  })
  assert.deepEqual(event.daily_schedule[2], {
    date: '2024-05-12',
    all_day: false,
    start_time: '09:00',
    end_time: '17:00',
  })
})

test('derives all-day entries for VALUE=DATE spans', async () => {
  const ics = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:allday@example.com\nDTSTART;VALUE=DATE:20240515\nDTEND;VALUE=DATE:20240518\nSUMMARY:Festival\nEND:VEVENT\nEND:VCALENDAR`
  const events = await parseIcs(ics)
  const normalized = expandIcsEvents(events, { timezone: 'America/Toronto' }, new Date('2024-05-10T12:00:00Z'))
  const event = normalized[0]
  assert.equal(event.use_daily_schedule, true)
  assert.equal(event.daily_schedule.length, 3)
  assert.deepEqual(event.daily_schedule[0], {
    date: '2024-05-15',
    all_day: true,
    start_time: '',
    end_time: '',
  })
  assert.deepEqual(event.daily_schedule[2], {
    date: '2024-05-17',
    all_day: true,
    start_time: '',
    end_time: '',
  })
})

test('falls back to legacy span when hours are ambiguous', async () => {
  const ics = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:ambiguous@example.com\nDTSTART:20240510T140000Z\nDTEND:20240511T140000Z\nSUMMARY:Continuous Retreat\nEND:VEVENT\nEND:VCALENDAR`
  const events = await parseIcs(ics)
  const normalized = expandIcsEvents(events, { timezone: 'America/Toronto' }, new Date('2024-05-01T00:00:00Z'))
  const event = normalized[0]
  assert.ok(!event.use_daily_schedule)
  assert.ok(!event.daily_schedule)
})
