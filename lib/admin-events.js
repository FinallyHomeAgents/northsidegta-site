import fs from 'fs'
import path from 'path'
import { DateTime } from 'luxon'

export const EVENTS_DIR = path.join(process.cwd(), 'public', 'data', 'events')
export const TORONTO_TIME_ZONE = 'America/Toronto'

function safeParseJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    console.warn('[admin-events] failed to parse', filePath, error.message)
    return null
  }
}

export function loadAllEventsFromDisk() {
  if (!fs.existsSync(EVENTS_DIR)) return []
  const files = fs
    .readdirSync(EVENTS_DIR)
    .filter((name) => name.toLowerCase().endsWith('.json'))

  const events = []
  for (const file of files) {
    const fullPath = path.join(EVENTS_DIR, file)
    const parsed = safeParseJSON(fullPath)
    if (!parsed || typeof parsed !== 'object') continue
    const event = { ...parsed }
    if (!event.slug) {
      event.slug = file.replace(/\.json$/i, '')
    }
    events.push(event)
  }
  return events
}

export function sanitizeEventId(value) {
  if (typeof value !== 'string') {
    value = value == null ? '' : String(value)
  }
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return ''
  if (!/^[a-z0-9-]+$/.test(trimmed)) return ''
  return trimmed
}

export function buildDeletionKey(id) {
  const safeId = sanitizeEventId(id)
  if (!safeId) return ''
  return `events:deleted:${safeId}`
}

export function parseEventDate(value) {
  if (!value) return null
  if (DateTime.isDateTime(value)) {
    return value.setZone(TORONTO_TIME_ZONE)
  }
  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone: TORONTO_TIME_ZONE })
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return DateTime.fromMillis(value, { zone: TORONTO_TIME_ZONE })
  }
  if (typeof value === 'string') {
    const iso = DateTime.fromISO(value, { setZone: true })
    if (iso.isValid) {
      return iso.setZone(TORONTO_TIME_ZONE)
    }
    const timestamp = Date.parse(value)
    if (Number.isFinite(timestamp)) {
      return DateTime.fromMillis(timestamp, { zone: TORONTO_TIME_ZONE })
    }
  }
  return null
}

export function getTorontoDayStart(reference) {
  if (DateTime.isDateTime(reference)) {
    return reference.setZone(TORONTO_TIME_ZONE).startOf('day')
  }
  if (reference instanceof Date) {
    return DateTime.fromJSDate(reference, { zone: TORONTO_TIME_ZONE }).startOf('day')
  }
  if (typeof reference === 'number' && Number.isFinite(reference)) {
    return DateTime.fromMillis(reference, { zone: TORONTO_TIME_ZONE }).startOf('day')
  }
  return DateTime.now().setZone(TORONTO_TIME_ZONE).startOf('day')
}

export function isEventUpcoming(event, referenceStart) {
  const startDate = parseEventDate(event?.startDate ?? event?.start)
  if (!startDate) return true
  return startDate >= referenceStart
}

export function isEventPast(event, referenceStart) {
  const startDate = parseEventDate(event?.startDate ?? event?.start)
  if (!startDate) return false
  return startDate < referenceStart
}

export function filterEventsByScope(events, scope = 'upcoming', reference) {
  const startOfToday = getTorontoDayStart(reference)
  const normalizedScope = typeof scope === 'string' ? scope.toLowerCase() : 'upcoming'

  if (normalizedScope === 'past') {
    return events.filter((event) => isEventPast(event, startOfToday))
  }

  if (normalizedScope === 'all') {
    return events.slice()
  }

  return events.filter((event) => isEventUpcoming(event, startOfToday))
}

export function sortEventsByStartDate(events, direction = 'asc') {
  const multiplier = direction === 'desc' ? -1 : 1
  return [...events].sort((a, b) => {
    const aStart = parseEventDate(a?.startDate ?? a?.start)
    const bStart = parseEventDate(b?.startDate ?? b?.start)

    if (aStart && bStart && aStart.toMillis() !== bStart.toMillis()) {
      return (aStart.toMillis() - bStart.toMillis()) * multiplier
    }

    if (aStart && !bStart) return -1 * multiplier
    if (!aStart && bStart) return 1 * multiplier

    const aTitle = typeof a?.title === 'string' ? a.title : ''
    const bTitle = typeof b?.title === 'string' ? b.title : ''
    return aTitle.localeCompare(bTitle)
  })
}
