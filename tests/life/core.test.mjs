import test from 'node:test'
import assert from 'node:assert/strict'
import {
  signSession,
  verifySession,
  validateDraft,
  publicPost,
  destinationReady,
  DESTINATIONS,
} from '../../lib/life/core.js'
import { publicPage } from '../../lib/life/public.js'
import { publishDestination } from '../../lib/life/publish.js'
const photo =
  'data:image/jpeg;base64,' +
  Buffer.from([255, 216, 255, 224, 0, 0]).toString('base64')
test('sessions reject tampering, wrong secrets, and expiry', () => {
  const t = signSession('Matthew', 'secret', 1000)
  assert.equal(verifySession(t, 'secret', 2000), 'Matthew')
  assert.equal(verifySession(t + 'x', 'secret', 2000), null)
  assert.equal(verifySession(t, 'other', 2000), null)
  assert.equal(verifySession(t, 'secret', 1000 + 8 * 86400000), null)
  assert.equal(verifySession(t, '', 2000), null)
})
test('location confirmation and photo type are required server-side', () => {
  const d = {
    place: 'Park',
    community: 'Aurora',
    photo,
    locationConfirmed: true,
  }
  assert.equal(validateDraft(d).place, 'Park')
  assert.throws(() => validateDraft({ ...d, locationConfirmed: false }))
  assert.throws(() =>
    validateDraft({ ...d, photo: 'data:image/svg+xml;base64,abc' })
  )
  assert.throws(() => validateDraft({ ...d, community: 'unknown' }))
})
test('public posts never expose original photos or internal draft metadata', () => {
  const d = {
    id: 'abc',
    photo: 'private',
    notes: 'private',
    results: { website: { at: 'today' } },
    imageUrl: 'approved.jpg',
  }
  const p = publicPost(d)
  assert.equal(p.photo, undefined)
  assert.equal(p.notes, undefined)
  assert.equal(p.image, 'approved.jpg')
})
test('public HTML escapes user content', () => {
  const html = publicPage([], {
    id: 'abc',
    title: '<script>alert(1)</script>',
    website: '<img src=x onerror=x>',
    place: 'test',
    community: 'Aurora',
    image: 'https://example.test/a.jpg',
    alt: '" onerror="x',
  })
  assert.ok(!html.includes('<script>alert'))
  assert.ok(html.includes('&lt;script&gt;'))
  assert.ok(html.includes('&lt;img'))
})
test('social destinations stay disconnected without all required credentials', () => {
  const d = DESTINATIONS.find((d) => d.id === 'instagram_northside')
  assert.equal(destinationReady(d, {}), false)
  assert.equal(
    destinationReady(d, {
      LIFE_NORTHSIDE_IG_USER_ID: '1',
      LIFE_NORTHSIDE_PAGE_ACCESS_TOKEN: 'token',
    }),
    false
  )
})
test('published or uncertain destinations are not submitted twice', async () => {
  const d = { results: { facebook_northside: { status: 'needs_review' } } }
  let saved = 0
  const result = await publishDestination(
    d,
    DESTINATIONS.find((d) => d.id === 'facebook_northside'),
    {
      LIFE_NORTHSIDE_PAGE_ID: '1',
      LIFE_NORTHSIDE_PAGE_ACCESS_TOKEN: 'x',
      LIFE_META_GRAPH_VERSION: 'v23.0',
      BLOB_READ_WRITE_TOKEN: 'x',
    },
    () => saved++
  )
  assert.equal(result.status, 'needs_review')
  assert.equal(saved, 0)
})
