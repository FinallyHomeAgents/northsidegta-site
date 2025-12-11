// /api/events.js
import fs from 'fs'
import path from 'path'

const EVENTS_DIR = path.join(process.cwd(), 'public', 'data', 'events')
const PENDING_EVENTS_DIR = path.join(process.cwd(), 'public', 'data', 'events-pending')
const CACHE_MAX_AGE = 60 // seconds

function safeParseJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    console.warn('[events-api] failed to parse', filePath, error.message)
    return null
  }
}

function loadEvents(directory, defaultStatus = '') {
  if (!fs.existsSync(directory)) return []
  const files = fs
    .readdirSync(directory)
    .filter((name) => name.toLowerCase().endsWith('.json'))

  const events = []
  for (const file of files) {
    const fullPath = path.join(directory, file)
    const event = safeParseJSON(fullPath)
    if (!event || typeof event !== 'object') continue
    if (!event.slug) {
      event.slug = file.replace(/\.json$/i, '')
    }
    if (defaultStatus && typeof event.status !== 'string') {
      event.status = defaultStatus
    }
    events.push(event)
  }
  return events
}

function normalizeStatus(status) {
  if (!status) return []
  if (Array.isArray(status)) {
    return status
      .flatMap((item) => String(item).split(',').map((value) => value.trim().toLowerCase()))
      .filter(Boolean)
  }
  return String(status)
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

function withinStatuses(event, statusFilter) {
  if (!statusFilter.length) return true
  const eventStatus = typeof event.status === 'string' ? event.status.toLowerCase() : 'published'
  const normalizedStatus = eventStatus === 'approved' ? 'published' : eventStatus
  if (statusFilter.includes('all')) return true
  if (statusFilter.includes(normalizedStatus)) return true
  if (normalizedStatus === 'published' && statusFilter.includes('approved')) return true
  return false
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let events
  try {
    const liveEvents = loadEvents(EVENTS_DIR)
    const pendingEvents = loadEvents(PENDING_EVENTS_DIR, 'pending')
    const merged = new Map()

    for (const event of liveEvents) {
      merged.set(event.slug, event)
    }
    for (const event of pendingEvents) {
      if (!merged.has(event.slug)) {
        merged.set(event.slug, event)
      }
    }

    events = Array.from(merged.values())
  } catch (error) {
    console.error('[events-api] failed to load events:', error)
    res.status(500).json({ error: 'Failed to load events.' })
    return
  }

  const statusFilter = normalizeStatus(req.query?.status || 'published,pending')
  const slugParam = req.query?.slug
  const slugFilter = Array.isArray(slugParam)
    ? slugParam.map((value) => String(value).trim()).filter(Boolean)
    : typeof slugParam === 'string'
      ? [slugParam.trim()].filter(Boolean)
      : []
  const slugSet = new Set(slugFilter)
  const limitValue = Number.parseInt(req.query?.limit, 10)
  const hasLimit = Number.isFinite(limitValue) && limitValue > 0

  const filtered = events
    .filter((event) => withinStatuses(event, statusFilter))
    .filter((event) => (slugSet.size ? slugSet.has(event.slug) : true))
    .filter((event) => !event?.hidden)
    .sort((a, b) => {
      const aDate = new Date(a.startDate || 0).getTime()
      const bDate = new Date(b.startDate || 0).getTime()
      return aDate - bDate
    })

  if (slugSet.size && !filtered.length) {
    res.status(404).json({ error: 'Event not found.' })
    return
  }

  const payload = hasLimit ? filtered.slice(0, limitValue) : filtered

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', `s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate`)
  res.status(200).json({ events: payload, event: slugSet.size === 1 ? payload[0] || null : undefined })
}
