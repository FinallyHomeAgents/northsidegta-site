import {
  loadAllEventsFromDisk,
  filterEventsByScope,
  sortEventsByStartDate,
  sanitizeEventId,
  buildDeletionKey,
} from '../../../lib/admin-events'
import { getKvClient, isKvConfigured } from '../../../lib/kv-admin'
import { isGithubConfigured } from '../../../lib/github-admin'

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
    },
  })
}
