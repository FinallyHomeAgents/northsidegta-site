import crypto from 'node:crypto'
import {
  PEOPLE,
  DESTINATIONS,
  validateDraft,
  starterContent,
  clean,
  safeEqual,
  sessionSecret,
  signSession,
  verifySession,
  destinationReady,
  publicPost,
} from '../lib/life/core.js'
import { createStore, configured } from '../lib/life/store.js'
import { generate } from '../lib/life/generate.js'
import { prepareImage, publishDestination } from '../lib/life/publish.js'
import { publicPage } from '../lib/life/public.js'
import { connectionEnv, metaConfigured, metaAction } from '../lib/life/meta.js'
export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
  maxDuration: 60,
}
const idValid = (id) => /^[a-f0-9-]{36}$/.test(id || '')
export default async function handler(req, res) {
  let env = process.env
  const local = env.LIFE_LOCAL_DEV === '1' && !env.VERCEL
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  const query =
    req.query ||
    Object.fromEntries(new URL(req.url, 'http://localhost').searchParams)
  const action = query.action || 'session'
  try {
    const token = (req.headers.cookie || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('life_session='))
      ?.slice(13)
    const user = verifySession(token, sessionSecret(env))
    const ready = configured(env) || local
    if (user && ready && ['session', 'publish'].includes(action))
      env = await connectionEnv(env, await createStore(env))
    if (req.method === 'GET' && action === 'session')
      return res.json({
        user,
        local,
        storage: ready,
        ai: Boolean(env.OPENAI_API_KEY),
        metaLogin: Boolean(user && metaConfigured(env)),
        signInConfigured: Boolean(sessionSecret(env)),
        destinations: user
          ? DESTINATIONS.map((d) => ({
              ...d,
              ready:
                ready &&
                destinationReady(d, env) &&
                (local || Boolean(env.BLOB_READ_WRITE_TOKEN)),
            }))
          : [],
      })
    if (
      req.method === 'GET' &&
      ['feed', 'feed-page', 'story', 'image'].includes(action)
    ) {
      if (!ready) {
        if (action === 'feed') return res.json({ posts: [] })
        if (action === 'feed-page') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          return res.status(200).send(publicPage([]))
        }
        return res.status(404).json({ error: 'Not found.' })
      }
      const store = await createStore(env)
      if (action === 'image' || action === 'story') {
        if (!idValid(query.id))
          return res.status(404).json({ error: 'Not found.' })
        const d = await store.get(query.id)
        if (d?.results?.website?.status !== 'published')
          return res.status(404).json({ error: 'Not found.' })
        if (action === 'image') {
          if (!local || !d.localPublishedImage) return res.status(404).end()
          res.setHeader('Content-Type', 'image/jpeg')
          return res.end(
            Buffer.from(d.localPublishedImage.split(',')[1], 'base64')
          )
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.send(publicPage([], publicPost(d)))
      }
      const posts = (await store.list())
        .filter((d) => d.results?.website?.status === 'published')
        .map(publicPost)
      if (action === 'feed') return res.json({ posts })
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(publicPage(posts))
    }
    if (req.method !== 'GET' && req.method !== 'POST')
      return res.status(405).json({ error: 'Method not allowed.' })
    if (req.method === 'POST') {
      const origin = req.headers.origin
      const host = req.headers['x-forwarded-host'] || req.headers.host
      if (
        req.headers['x-life-request'] !== '1' ||
        (origin && new URL(origin).host !== host)
      )
        return res.status(403).json({ error: 'Request origin not allowed.' })
    }
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    if (action === 'login' && req.method === 'POST') {
      if (!ready || !sessionSecret(env))
        return res
          .status(503)
          .json({ error: 'Private sign-in is not connected yet.' })
      const store = await createStore(env)
      const ip = clean(
        req.headers['x-forwarded-for'] ||
          req.socket?.remoteAddress ||
          'unknown',
        100
      )
      if (
        !(await store.limit(
          'login:' + crypto.createHash('sha256').update(ip).digest('hex'),
          10,
          900
        ))
      )
        return res
          .status(429)
          .json({ error: 'Too many attempts. Try again in 15 minutes.' })
      if (!PEOPLE.includes(body.person))
        return res.status(400).json({ error: 'Choose Matthew or Landon.' })
      const personal = env[`LIFE_${body.person.toUpperCase()}_PASSWORD`]
      const valid =
        local ||
        (personal
          ? safeEqual(body.password, personal)
          : Boolean(
              env.CMS_LOGIN_PASSWORD &&
              env.CMS_LOGIN_USERNAME &&
              safeEqual(body.username, env.CMS_LOGIN_USERNAME) &&
              safeEqual(body.password, env.CMS_LOGIN_PASSWORD)
            ))
      if (!valid)
        return res.status(401).json({ error: 'Sign-in details do not match.' })
      res.setHeader(
        'Set-Cookie',
        `life_session=${signSession(body.person, sessionSecret(env))}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${local ? '' : '; Secure'}`
      )
      return res.json({ user: body.person })
    }
    if (action === 'meta-callback' && req.method === 'GET' && ready)
      return await metaAction(req, res, { action, query, body, user, env, store: await createStore(env) })
    if (!user) return res.status(401).json({ error: 'Sign in to continue.' })
    if (action === 'logout' && req.method === 'POST') {
      res.setHeader(
        'Set-Cookie',
        'life_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
      )
      return res.json({ ok: true })
    }
    const store = await createStore(env)
    if (action.startsWith('meta-'))
      return await metaAction(req, res, { action, query, body, user, env, store })
    if (action === 'drafts' && req.method === 'GET')
      return res.json({
        drafts: (await store.list()).map(
          ({ photo, localPublishedImage, ...d }) => d
        ),
      })
    if (action === 'draft' && req.method === 'GET') {
      if (!idValid(query.id))
        return res.status(400).json({ error: 'Invalid draft.' })
      const d = await store.get(query.id)
      if (!d) return res.status(404).json({ error: 'Draft not found.' })
      return res.json({ draft: d })
    }
    if (action === 'generate' && req.method === 'POST') {
      if (!(await store.limit('generate:' + user, 40, 3600)))
        return res
          .status(429)
          .json({ error: 'Generation limit reached. Try again later.' })
      const d = validateDraft(body)
      const content = body.starter
        ? { ...starterContent(d), generationMode: 'starter' }
        : await generate(d, env)
      return res.json({ content })
    }
    if (action === 'save' && req.method === 'POST') {
      const data = validateDraft(body)
      const id = body.id || crypto.randomUUID()
      if (!idValid(id)) return res.status(400).json({ error: 'Invalid draft.' })
      if (!(await store.lock(id)))
        return res
          .status(409)
          .json({ error: 'This draft is busy. Try again shortly.' })
      try {
        const old = await store.get(id)
        if (body.id && !old)
          return res.status(404).json({ error: 'Draft not found.' })
        if (old && Object.keys(old.results || {}).length)
          return res
            .status(409)
            .json({
              error:
                'This post has already been approved. Create a new draft to change its content.',
            })
        if (old && body.version !== old.version)
          return res
            .status(409)
            .json({
              error:
                'This draft was updated on another device. Reopen it from your library.',
            })
        const now = new Date().toISOString()
        const draft = {
          ...data,
          id,
          author: old?.author || user,
          editedBy: user,
          createdAt: old?.createdAt || now,
          updatedAt: now,
          version: (old?.version || 0) + 1,
          generationMode: body.generationMode === 'ai' ? 'ai' : 'starter',
          results: {},
        }
        await store.set(id, draft)
        return res.json({ draft })
      } finally {
        await store.unlock(id)
      }
    }
    if (action === 'publish' && req.method === 'POST') {
      if (!idValid(body.id) || body.approved !== true)
        return res.status(400).json({ error: 'Approve a saved draft first.' })
      const destination = DESTINATIONS.find((d) => d.id === body.destination)
      if (!destination)
        return res.status(400).json({ error: 'Unknown destination.' })
      if (!destinationReady(destination, env))
        return res
          .status(409)
          .json({ error: 'Connect this account before publishing.' })
      if (!(await store.lock(body.id)))
        return res
          .status(409)
          .json({
            error:
              'Publishing is already in progress. Refresh the library for status.',
          })
      try {
        const d = await store.get(body.id)
        if (!d) return res.status(404).json({ error: 'Draft not found.' })
        if (body.version !== d.version)
          return res
            .status(409)
            .json({
              error:
                'This draft changed. Review its latest version before publishing.',
            })
        if (!d.title || !d.instagram || !d.facebook || !d.website)
          return res
            .status(400)
            .json({
              error: 'Complete the title and captions before publishing.',
            })
        if (d.results[destination.id])
          return res.json({ result: d.results[destination.id], draft: d })
        d.imageUrl = await prepareImage(d, body.image, env)
        d.approvedBy = user
        d.updatedAt = new Date().toISOString()
        await store.set(d.id, d)
        const result = await publishDestination(d, destination, env, () =>
          store.set(d.id, d)
        )
        return res.json({ result, draft: d })
      } finally {
        await store.unlock(body.id)
      }
    }
    return res.status(404).json({ error: 'Unknown action.' })
  } catch (error) {
    const validation =
      /Add |Choose |Confirm |Photo |photo|draft|image|AI |Sign-in|storage|Meta|Instagram/.test(
        error.message
      )
    return res
      .status(validation ? 400 : 500)
      .json({
        error: validation
          ? error.message
          : 'Something went wrong. Your saved drafts are safe. Please try again.',
      })
  }
}
