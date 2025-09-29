import crypto from 'crypto'

import {
  loadAllEventsFromDisk,
  filterEventsByScope,
  sortEventsByStartDate,
  sanitizeEventId,
  buildDeletionKey,
} from '../../../lib/admin-events'
import { getKvClient, isKvConfigured } from '../../../lib/kv-admin'
import { isGithubConfigured } from '../../../lib/github-admin'

const SYNC_CSRF_COOKIE = 'sync_now_csrf' // SYNC WIRING
const SYNC_TOKEN_TTL_SECONDS = 10 * 60

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  if (options.maxAge != null) parts.push(`Max-Age=${Math.floor(options.maxAge)}`)
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`)
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
  return parts.join('; ')
}

function createSyncCsrfToken() {
  const secret = process.env.SYNC_SECRET
  if (!secret) {
    return { token: '', cookie: '', hint: 'Sync is not configured — missing SYNC_SECRET.' }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const hmac = crypto.createHmac('sha256', secret).update(token).digest('hex')
  const cookieValue = `${token}.${hmac}`
  return { token, cookie: cookieValue, hint: '' }
}

function parseScopeParam(value) {
  if (Array.isArray(value)) {
    return value.length ? parseScopeParam(value[0]) : 'upcoming'
  }
  if (typeof value !== 'string') return 'upcoming'
  const normalized = value.trim().toLowerCase()
  if (normalized === 'past' || normalized === 'all') return normalized
  if (normalized === 'upcoming') return 'upcoming'
  return 'upcoming'
}

function parseIncludeDeletedParam(value) {
  if (Array.isArray(value)) {
    return value.some((entry) => parseIncludeDeletedParam(entry))
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['1', 'true', 'yes', 'on'].includes(normalized)
  }
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return false
}

function cloneEventWithMeta(event, meta) {
  if (!meta) return { ...event }
  const next = { ...event }
  next.meta = { ...(event.meta || {}), ...meta }
  return next
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let events
  try {
    events = loadAllEventsFromDisk()
  } catch (error) {
    console.error('[admin-events] failed to load events', error)
    res.status(500).json({ error: 'Failed to load events.' })
    return
  }

  const scope = parseScopeParam(req.query?.scope)
  let includeDeleted = parseIncludeDeletedParam(req.query?.includeDeleted)

  const kvAvailable = isKvConfigured()
  const githubAvailable = isGithubConfigured()
  const deletionMode = kvAvailable ? 'soft' : githubAvailable ? 'hard' : 'disabled'
  const restoreEnabled = deletionMode === 'soft'
  const publishingEnabled = githubAvailable

  if (!restoreEnabled) {
    includeDeleted = false
  }

  let deletionEnabled = false
  let deletedIds = new Set()

  if (kvAvailable) {
    deletionEnabled = true
    try {
      const kv = getKvClient()
      const descriptors = events
        .map((event) => {
          const id = sanitizeEventId(event?.slug || event?.id || event?.filePath || event?.__filename)
          if (!id) return null
          const key = buildDeletionKey(id)
          if (!key) return null
          return { id, key }
        })
        .filter(Boolean)

      if (descriptors.length) {
        const keys = descriptors.map((item) => item.key)
        const values = await kv.mget(...keys)
        values.forEach((value, index) => {
          if (value != null) {
            const descriptor = descriptors[index]
            if (descriptor?.id) {
              deletedIds.add(descriptor.id)
            }
          }
        })
      }
    } catch (error) {
      console.error('[admin-events] failed to query deletion flags', error)
      deletionEnabled = false
      deletedIds = new Set()
    }
  }

  const scoped = filterEventsByScope(events, scope)
  const filtered = scoped
    .map((event) => {
      const id = sanitizeEventId(event?.slug || event?.id || event?.filePath || event?.__filename)
      const isDeleted = deletionEnabled && id && deletedIds.has(id)
      if (isDeleted && !includeDeleted) {
        return null
      }
      if (isDeleted) {
        return cloneEventWithMeta(event, { isDeleted: true })
      }
      return { ...event }
    })
    .filter(Boolean)

  const sorted = sortEventsByStartDate(filtered, 'asc')

  const syncToken = createSyncCsrfToken() // SYNC WIRING
  if (syncToken.cookie) {
    const expires = new Date(Date.now() + SYNC_TOKEN_TTL_SECONDS * 1000)
    res.setHeader(
      'Set-Cookie',
      serializeCookie(SYNC_CSRF_COOKIE, syncToken.cookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
        maxAge: SYNC_TOKEN_TTL_SECONDS,
        expires,
      })
    )
  }

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({
    events: sorted,
    meta: {
      scope,
      includeDeleted,
      deletionEnabled: deletionMode !== 'disabled',
      deletionMode,
      restoreEnabled,
      publishingEnabled,
      syncCsrfToken: syncToken.token || '', // SYNC WIRING
      syncHint: syncToken.hint || '', // SYNC WIRING
    },
  })
}
