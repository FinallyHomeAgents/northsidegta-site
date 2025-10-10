const test = require('node:test')
const assert = require('node:assert/strict')

const { normalizeCmsEvent, createEventValidator } = require('../lib/events/cms-normalizer.js')

const validator = createEventValidator()

test('normalizeCmsEvent produces schema-compliant events', () => {
  const raw = {
    slug: 'My Custom Event!',
    title: '  My Custom Event  ',
    summary: '',
    description: 'Line one.\r\nLine two.  ',
    startDate: '2025-10-04T14:00:00.000-04:00',
    endDate: '2025-10-04T17:30:00-04:00',
    allDay: 'false',
    use_daily_schedule: 'true',
    daily_schedule: [
      {
        date: '2025/10/04',
        start_time: '9:00 am',
        end_time: '5:30 PM',
      },
    ],
    recurrence: '',
    category: 'Family-Friendly Events',
    town: 'Stouffville, ON',
    locationName: '',
    address: '',
    lat: '44.091877',
    lng: '-79.3779693',
    priceType: 'free',
    priceNote: '  Suggested donation  ',
    badges: ['family-friendly', 'Arts & Culture'],
    image: ' https://example.com/image.jpg ',
    organizerName: '[object Object]',
    organizerUrl: 'https://example.com/organizer',
    eventUrl: '',
    url: 'https://example.com/events/my-custom-event',
    featured: 'true',
    hidden: 0,
    archived: '',
    status: 'Published',
    source: 'user',
    sourceRef: '',
    updatedAt: '2025-10-01T12:34:56.789Z',
  }

  const { event, changes } = normalizeCmsEvent(raw)

  assert.equal(event.slug, 'my-custom-event')
  assert.equal(event.title, 'My Custom Event')
  assert.equal(event.summary, 'Line one. Line two.')
  assert.equal(event.description, 'Line one.\nLine two.')
  assert.equal(event.startDate, '2025-10-04T18:00:00Z')
  assert.equal(event.endDate, '2025-10-04T21:30:00Z')
  assert.equal(event.allDay, false)
  assert.equal(event.use_daily_schedule, true)
  assert.deepEqual(event.daily_schedule, [
    {
      date: '2025-10-04',
      all_day: false,
      start_time: '09:00',
      end_time: '17:30',
    },
  ])
  assert.equal(event.category, 'Family')
  assert.equal(event.town, 'Stouffville')
  assert.equal(event.locationName, 'My Custom Event')
  assert.equal(event.address, 'My Custom Event')
  assert.equal(event.priceType, 'Free')
  assert.equal(event.priceNote, 'Suggested donation')
  assert.deepEqual(event.badges, ['Family-friendly'])
  assert.equal(event.image, 'https://example.com/image.jpg')
  assert.ok(!('organizerName' in event))
  assert.equal(event.organizerUrl, 'https://example.com/organizer')
  assert.equal(event.eventUrl, 'https://example.com/events/my-custom-event')
  assert.equal(event.featured, true)
  assert.equal(event.hidden, false)
  assert.equal(event.archived, false)
  assert.equal(event.status, 'published')
  assert.equal(event.source, 'manual')
  assert.equal(event.updatedAt, '2025-10-01T12:34:56Z')

  assert.ok(changes.includes('normalized slug'))
  assert.ok(changes.includes('backfilled summary'))
  assert.ok(changes.includes('normalized startDate'))
  assert.ok(changes.includes('normalized category'))
  assert.ok(changes.includes('normalized town'))
  assert.ok(changes.includes('normalized priceType'))
  assert.ok(changes.includes('normalized status'))
  assert.ok(changes.includes('normalized source'))
  assert.ok(changes.includes('normalized allDay flag'))
  assert.ok(changes.includes('normalized daily_schedule'))
  assert.ok(changes.includes('normalized updatedAt'))

  const validation = validator(event)
  assert.equal(validation.valid, true, validation.errors && JSON.stringify(validation.errors))

  const secondPass = normalizeCmsEvent(event)
  assert.deepEqual(secondPass.event, event)
  assert.equal(secondPass.changes.length, 0)
})
