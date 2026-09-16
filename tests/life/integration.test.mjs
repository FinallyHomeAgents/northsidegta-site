import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import handler from '../../api/life.js'
const dir = await mkdtemp(path.join(os.tmpdir(), 'life-test-'))
process.env.LIFE_LOCAL_DEV = '1'
process.env.LIFE_LOCAL_DATA = dir
process.env.LIFE_SESSION_SECRET = 'isolated-integration-test-secret'
const photo =
  'data:image/jpeg;base64,' +
  Buffer.from([255, 216, 255, 224, 0, 0]).toString('base64')
async function request(action, body, cookie, extra = {}) {
  let result
  const headers = {}
  const req = {
    method: body ? 'POST' : 'GET',
    query: { action, ...extra.query },
    body,
    headers: {
      host: 'localhost',
      'x-life-request': '1',
      cookie,
      ...extra.headers,
    },
  }
  const res = {
    statusCode: 200,
    setHeader(k, v) {
      headers[k] = v
    },
    status(n) {
      this.statusCode = n
      return this
    },
    json(v) {
      result = v
    },
    send(v) {
      result = v
    },
    end(v) {
      result = v
    },
  }
  await handler(req, res)
  return { status: res.statusCode, data: result, headers }
}
test('private draft → shared access → approval → public story; retries and stale edits are safe', async () => {
  try {
    assert.equal((await request('drafts')).status, 401)
    assert.equal(
      (
        await request('login', { person: 'Matthew' }, null, {
          headers: { origin: 'https://evil.test' },
        })
      ).status,
      403
    )
    const login = await request('login', { person: 'Matthew' })
    assert.equal(login.status, 200)
    const cookie = login.headers['Set-Cookie'].split(';')[0]
    const d = {
      photo,
      place: 'Test park',
      community: 'Aurora',
      locationConfirmed: true,
      notes: 'A test only.',
      title: 'Test title',
      instagram: 'Test IG',
      facebook: 'Test FB',
      website: 'Test story',
      alt: 'Trees',
    }
    const saved = await request('save', d, cookie)
    assert.equal(saved.status, 200)
    const { id, version } = saved.data.draft
    assert.equal((await request('feed')).data.posts.length, 0)
    assert.equal(
      (await request('story', null, null, { query: { id } })).status,
      404
    )
    const landon = await request('login', { person: 'Landon' })
    const lc = landon.headers['Set-Cookie'].split(';')[0]
    assert.equal((await request('drafts', null, lc)).data.drafts.length, 1)
    assert.equal(
      (await request('save', { ...d, id, version: version - 1 }, lc)).status,
      409
    )
    assert.equal(
      (
        await request(
          'publish',
          { id, version, destination: 'website', image: photo },
          cookie
        )
      ).status,
      400
    )
    const pub = await request(
      'publish',
      { id, version, destination: 'website', approved: true, image: photo },
      cookie
    )
    assert.equal(pub.status, 200)
    assert.equal(pub.data.result.status, 'published')
    const again = await request(
      'publish',
      { id, version, destination: 'website', approved: true, image: photo },
      cookie
    )
    assert.equal(again.data.result.at, pub.data.result.at)
    assert.equal((await request('save', { ...d, id, version }, lc)).status, 409)
    const feed = await request('feed')
    assert.equal(feed.data.posts.length, 1)
    assert.equal(feed.data.posts[0].photo, undefined)
    assert.equal(feed.data.posts[0].notes, undefined)
    assert.equal(
      (await request('story', null, null, { query: { id } })).status,
      200
    )
    assert.equal(
      (
        await request(
          'publish',
          {
            id,
            version,
            destination: 'instagram_northside',
            approved: true,
            image: photo,
          },
          cookie
        )
      ).status,
      409
    )
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
