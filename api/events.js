// /api/events.js
import fs from 'fs'
import path from 'path'

const EVENTS_DIR = path.join(process.cwd(), 'public', 'data', 'events')
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

function loadEvents() {
  if (!fs.existsSync(EVENTS_DIR)) return []
  const files = fs
    .readdirSync(EVENTS_DIR)
    .filter((name) => name.toLowerCase().endsWith('.json'))

  const events = []
  for (const file of files) {
    const fullPath = path.join(EVENTS_DIR, file)
    const event = safeParseJSON(fullPath)
    if (!event || typeof event !== 'object') continue
    if (!event.slug) {
      event.slug = file.replace(/\.json$/i, '')
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
  if (statusFilter.includes('all')) return true
  return statusFilter.includes(eventStatus)
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let events
  try {
    events = loadEvents()
  } catch (error) {
    console.error('[events-api] failed to load events:', error)
    res.status(500).json({ error: 'Failed to load events.' })
    return
  }

  const statusFilter = normalizeStatus(req.query?.status || 'published')
  const limitValue = Number.parseInt(req.query?.limit, 10)
  const hasLimit = Number.isFinite(limitValue) && limitValue > 0

  const filtered = events
    .filter((event) => withinStatuses(event, statusFilter))
    .sort((a, b) => {
      const aDate = new Date(a.startDate || 0).getTime()
      const bDate = new Date(b.startDate || 0).getTime()
      return aDate - bDate
    })

  const payload = hasLimit ? filtered.slice(0, limitValue) : filtered

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', `s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate`)
  res.status(200).json({ events: payload })
}
