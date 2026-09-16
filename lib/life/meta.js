import crypto from 'node:crypto'

const brands = {
  northside: { prefix: 'LIFE_NORTHSIDE', page: 'NorthSide GTA', instagram: 'northsidegta' },
  finallyhome: { prefix: 'LIFE_FINALLYHOME', page: 'Finally Home Agents', instagram: 'finallyhomeagents' },
}
const permissions = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish']
const hash = (s) => crypto.createHash('sha256').update(s || '').digest('hex')
const cookie = (req, name) => (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))?.slice(name.length + 1) || ''
const opaque = (s) => /^[a-f0-9]{64}$/.test(s || '')
function key(env) {
  if (!/^[a-f0-9]{64}$/i.test(env.LIFE_CONNECTION_KEY || '')) throw new Error('Meta connection encryption is not configured.')
  return Buffer.from(env.LIFE_CONNECTION_KEY, 'hex')
}
export function seal(data, env) {
  const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', key(env), iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map(x => x.toString('base64url')).join('.')
}
export function unseal(value, env) {
  const [iv, tag, body] = value.split('.').map(x => Buffer.from(x, 'base64url'))
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(env), iv)
  decipher.setAuthTag(tag)
  return JSON.parse(Buffer.concat([decipher.update(body), decipher.final()]).toString())
}
export function metaConfigured(env) {
  try {
    key(env)
    const url = new URL(env.LIFE_META_REDIRECT_URI)
    return Boolean(env.LIFE_META_APP_ID && env.LIFE_META_APP_SECRET && env.LIFE_META_CONFIG_ID && /^v\d+\.\d+$/.test(env.LIFE_META_GRAPH_VERSION || '') && url.protocol === 'https:' && url.pathname === '/api/life' && url.search === '?action=meta-callback' && !url.hash && !url.username && !url.password)
  } catch { return false }
}
export async function connectionEnv(env, store) {
  const encrypted = await store.getPrivate('meta-connections')
  if (!encrypted) return env
  const data = unseal(encrypted, env), result = { ...env }
  for (const [brand, d] of Object.entries(data)) {
    const b = brands[brand]
    if (!b) continue
    result[`${b.prefix}_PAGE_ID`] = d.pageId
    result[`${b.prefix}_IG_USER_ID`] = d.instagramId || ''
    result[`${b.prefix}_PAGE_ACCESS_TOKEN`] = d.token
  }
  return result
}
function setCookie(res, name, value, seconds) {
  res.setHeader('Set-Cookie', `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/api/life; Max-Age=${seconds}`)
}
function redirect(res, status) {
  res.setHeader('Location', '/life/studio/?meta=' + status)
  return res.status(303).end()
}
async function graph(env, path, token, parameters = {}) {
  const url = new URL(`https://graph.facebook.com/${env.LIFE_META_GRAPH_VERSION}/${path}`)
  for (const [k, v] of Object.entries(parameters)) url.searchParams.set(k, v)
  const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal: AbortSignal.timeout(8000) })
  const data = await response.json()
  if (!response.ok || data.error) throw new Error('Meta could not complete the connection. Check permissions and reconnect.')
  return data
}
async function pending(req, user, store, env, take = false) {
  const id = cookie(req, 'life_meta_pending')
  if (!opaque(id)) throw new Error('Meta connection expired. Connect again.')
  const encrypted = await store[take ? 'temporaryTake' : 'temporaryGet']('meta-pending:' + hash(id))
  if (!encrypted) throw new Error('Meta connection expired. Connect again.')
  const d = unseal(encrypted, env)
  if (d.user !== user || d.session !== hash(cookie(req, 'life_session'))) throw new Error('Meta connection belongs to a different studio session. Connect again.')
  return d
}
export async function metaAction(req, res, { action, query, body, user, env, store }) {
  if (!metaConfigured(env)) return res.status(503).json({ error: 'Meta login needs its one-time server setup first.' })
  if (action === 'meta-start' && req.method === 'POST') {
    // A fixed registered callback prevents host-header/open-redirect attacks.
    if ((req.headers['x-forwarded-host'] || req.headers.host) !== new URL(env.LIFE_META_REDIRECT_URI).host)
      return res.status(409).json({ error: 'Meta login is available only on the configured studio address.' })
    const state = crypto.randomBytes(32).toString('hex')
    await store.temporarySet('meta-state:' + hash(state), { user, session: hash(cookie(req, 'life_session')) }, 600)
    setCookie(res, 'life_meta_state', state, 600)
    const url = new URL(`https://www.facebook.com/${env.LIFE_META_GRAPH_VERSION}/dialog/oauth`)
    Object.entries({ client_id: env.LIFE_META_APP_ID, redirect_uri: env.LIFE_META_REDIRECT_URI, config_id: env.LIFE_META_CONFIG_ID, response_type: 'code', override_default_response_type: 'true', state }).forEach(([k,v]) => url.searchParams.set(k,v))
    return res.json({ url: url.toString() })
  }
  if (action === 'meta-callback' && req.method === 'GET') {
    res.setHeader('Referrer-Policy', 'no-referrer')
    const state = query.state
    if (!opaque(state) || state !== cookie(req, 'life_meta_state')) return redirect(res, 'expired')
    const start = await store.temporaryTake('meta-state:' + hash(state))
    setCookie(res, 'life_meta_state', '', 0)
    if (!start) return redirect(res, 'expired')
    if (query.error || typeof query.code !== 'string') return redirect(res, 'cancelled')
    try {
      const short = await graph(env, 'oauth/access_token', null, { client_id: env.LIFE_META_APP_ID, client_secret: env.LIFE_META_APP_SECRET, redirect_uri: env.LIFE_META_REDIRECT_URI, code: query.code })
      if (!short.access_token) throw new Error('Missing token')
      const long = await graph(env, 'oauth/access_token', null, { grant_type: 'fb_exchange_token', client_id: env.LIFE_META_APP_ID, client_secret: env.LIFE_META_APP_SECRET, fb_exchange_token: short.access_token })
      if (!long.access_token) throw new Error('Missing token')
      const grants = await graph(env, 'me/permissions', long.access_token)
      if (!permissions.every(p => grants.data?.some(g => g.permission === p && g.status === 'granted'))) return redirect(res, 'permissions')
      const pages = []
      let after
      for (let n = 0; n < 5; n++) {
        const response = await graph(env, 'me/accounts', long.access_token, { fields: 'id,name,access_token,tasks,instagram_business_account{id,username}', limit: '100', ...(after ? { after } : {}) })
        pages.push(...(response.data || []).filter(p => p.access_token && /^\d+$/.test(p.id) && p.tasks?.some(t => ['CREATE_CONTENT', 'MANAGE'].includes(t))))
        after = response.paging?.next && response.paging?.cursors?.after
        if (!after) break
      }
      const id = crypto.randomBytes(32).toString('hex')
      await store.temporarySet('meta-pending:' + hash(id), seal({ ...start, pages }, env), 600)
      setCookie(res, 'life_meta_pending', id, 600)
      return redirect(res, 'choose')
    } catch { return redirect(res, 'failed') }
  }
  if (action === 'meta-options' && req.method === 'GET') {
    const d = await pending(req, user, store, env)
    return res.json({ pages: d.pages.map(p => ({ id: p.id, name: p.name, instagram: p.instagram_business_account?.username || '' })) })
  }
  if (action === 'meta-save' && req.method === 'POST') {
    const d = await pending(req, user, store, env)
    const chosen = {}
    for (const [brand, b] of Object.entries(brands)) {
      if (!body[brand]) continue
      const p = d.pages.find(p => p.id === body[brand])
      if (!p) throw new Error('Meta account selection is invalid.')
      const ig = p.instagram_business_account
      if (ig && ig.username?.toLowerCase() !== b.instagram) throw new Error(`Meta account does not match @${b.instagram}. Choose its linked Page.`)
      if (!ig && p.name.toLowerCase().replace(/\s/g, '') !== b.page.toLowerCase().replace(/\s/g, '')) throw new Error(`Meta Page does not match ${b.page}.`)
      chosen[brand] = { pageId: p.id, instagramId: ig?.id || '', token: p.access_token, connectedBy: user, connectedAt: new Date().toISOString() }
    }
    if (!Object.keys(chosen).length) throw new Error('Choose at least one Meta account.')
    if (!(await store.lock('meta-connections'))) return res.status(409).json({ error: 'Another connection is being saved. Try again shortly.' })
    try {
      await pending(req, user, store, env, true)
      const old = await store.getPrivate('meta-connections')
      await store.setPrivate('meta-connections', seal({ ...(old ? unseal(old, env) : {}), ...chosen }, env))
      setCookie(res, 'life_meta_pending', '', 0)
      return res.json({ ok: true })
    } finally { await store.unlock('meta-connections') }
  }
  return res.status(405).json({ error: 'Method not allowed.' })
}
