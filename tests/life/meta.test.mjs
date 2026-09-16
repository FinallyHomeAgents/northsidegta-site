import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { metaAction, metaConfigured, seal, unseal, connectionEnv } from '../../lib/life/meta.js'
import { createStore } from '../../lib/life/store.js'
const env = {
  LIFE_LOCAL_DEV: '1', LIFE_CONNECTION_KEY: 'ab'.repeat(32),
  LIFE_META_APP_ID: '123', LIFE_META_APP_SECRET: 'test-secret', LIFE_META_CONFIG_ID: '456',
  LIFE_META_GRAPH_VERSION: 'v23.0', LIFE_META_REDIRECT_URI: 'https://studio.example/api/life?action=meta-callback',
}
function call(store, action, { cookie = '', body = {}, query = {}, user = 'Matthew', method = 'POST', host = 'studio.example' } = {}) {
  const req = { method, headers: { cookie, host } }
  const result = { status: 200, headers: {} }
  const res = {
    setHeader(k,v) { result.headers[k] = v },
    status(n) { result.status = n; return this },
    json(v) { result.body = v }, end() {},
  }
  return metaAction(req, res, { action, query, body, user, env, store }).then(() => result)
}
const cookiePart = result => result.headers['Set-Cookie'].split(';')[0]
test('connection credentials are encrypted and tamper resistant; setup requires a fixed HTTPS callback', () => {
  const encrypted = seal({ token: 'private-token' }, env)
  assert.ok(!encrypted.includes('private-token'))
  assert.equal(unseal(encrypted, env).token, 'private-token')
  assert.throws(() => unseal(encrypted, { ...env, LIFE_CONNECTION_KEY: 'cd'.repeat(32) }))
  assert.equal(metaConfigured(env), true)
  assert.equal(metaConfigured({ ...env, LIFE_META_REDIRECT_URI: 'http://studio.example/api/life?action=meta-callback' }), false)
  assert.equal(metaConfigured({ ...env, LIFE_META_CONFIG_ID: '' }), true)
  const fallback = { ...env, LIFE_CONNECTION_KEY: undefined }
  assert.equal(unseal(seal({ token: 'test' }, fallback), fallback).token, 'test')
})
test('Meta login binds browser/session, consumes state, hides tokens, and saves shared credentials outside drafts', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'life-meta-'))
  const store = await createStore({ ...env, LIFE_LOCAL_DATA: dir })
  const originalFetch = globalThis.fetch
  let calls = 0
  globalThis.fetch = async url => {
    calls++
    const u = new URL(url)
    const data = u.pathname.endsWith('oauth/access_token') ? { access_token: 'user-token' } : u.pathname.endsWith('me/permissions') ? { data: ['pages_show_list','pages_read_engagement','pages_manage_posts','instagram_basic','instagram_content_publish'].map(permission => ({ permission, status: 'granted' })) } : { data: [{ id: '12345', name: 'NorthSide GTA', tasks: ['CREATE_CONTENT'], access_token: 'secret-page-token', instagram_business_account: { id: '98765', username: 'northsidegta' } }] }
    return { ok: true, json: async () => data }
  }
  try {
    assert.equal((await call(store, 'meta-start', { host: 'evil.example' })).status, 409)
    const start = await call(store, 'meta-start', { cookie: 'life_session=studio-session' })
    const state = new URL(start.body.url).searchParams.get('state')
    assert.equal(new URL(start.body.url).hostname, 'www.facebook.com')
    assert.equal(new URL(start.body.url).searchParams.has('scope'), false)
    assert.equal((await call(store, 'meta-callback', { method: 'GET', query: { state, code: 'code' } })).headers.Location, '/life/studio/?meta=expired')
    assert.equal(calls, 0)
    const done = await call(store, 'meta-callback', { method: 'GET', cookie: cookiePart(start), query: { state, code: 'code' } })
    assert.equal(done.headers.Location, '/life/studio/?meta=choose')
    const count = calls
    const replay = await call(store, 'meta-callback', { method: 'GET', cookie: cookiePart(start), query: { state, code: 'code' } })
    assert.equal(replay.headers.Location, '/life/studio/?meta=expired')
    assert.equal(calls, count)
    const pendingCookie = cookiePart(done) + '; life_session=studio-session'
    await assert.rejects(call(store, 'meta-options', { method: 'GET', cookie: cookiePart(done) + '; life_session=other-session' }), /different studio session/)
    const options = await call(store, 'meta-options', { method: 'GET', cookie: pendingCookie })
    assert.ok(!JSON.stringify(options).includes('token'))
    await assert.rejects(call(store, 'meta-save', { cookie: pendingCookie, body: { finallyhome: '12345' } }), /does not match/)
    const saved = await call(store, 'meta-save', { cookie: pendingCookie, body: { northside: '12345' } })
    assert.equal(saved.body.ok, true)
    const configured = await connectionEnv(env, store)
    assert.equal(configured.LIFE_NORTHSIDE_PAGE_ACCESS_TOKEN, 'secret-page-token')
    assert.equal(configured.LIFE_NORTHSIDE_IG_USER_ID, '98765')
    assert.deepEqual(await store.list(), [])
    assert.ok(!(await store.getPrivate('meta-connections')).includes('secret-page-token'))
    await assert.rejects(call(store, 'meta-options', { method: 'GET', cookie: pendingCookie }), /expired/)
  } finally { globalThis.fetch = originalFetch; await rm(dir, { recursive: true, force: true }) }
})
