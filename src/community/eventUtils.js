import { RRule } from 'rrule'

function slugify(value) {
  if (!value) return ''
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

export const CATEGORY_OPTIONS = [
  'Family',
  'Festivals',
  'Sports',
  'Golf',
  'Markets',
  'Arts & Culture',
  'Outdoors',
  'Other',
]

export const TOWN_OPTIONS = [
  'Aurora',
  'Uxbridge',
  'Georgina',
  'Stouffville',
  'Whitchurch-Stouffville',
  'East Gwillimbury',
  'Newmarket',
  'Scugog',
  'Toronto-adjacent',
]

export const PRICE_OPTIONS = ['Free', 'Paid']

export const BADGE_LABELS = {
  'Family-friendly': 'Family-friendly',
  Seasonal: 'Seasonal',
  Outdoors: 'Outdoors',
  'Pets OK': 'Pets OK',
  Accessible: 'Accessible',
  Ticketed: 'Ticketed',
}

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000 // 2 hours
const CALENDAR_LOOKAHEAD_MONTHS = 6
const MAX_OCCURRENCES = 120

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-CA', {
  hour: 'numeric',
  minute: '2-digit',
})

export function hydrateEvents(rawEvents = []) {
  return rawEvents
    .map((raw) => sanitizeEvent(raw))
    .filter((event) => Boolean(event && event.slug && event.title && event.startDate))
}

export function sanitizeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null
  const startDateObj = parseDate(raw.startDate)
  const endDateObj = parseDate(raw.endDate) || startDateObj
  const durationMs = getDuration(startDateObj, endDateObj)

  const initialSlug = typeof raw.slug === 'string' ? raw.slug.trim() : ''
  const slug = initialSlug || slugify(raw.title)

  const description = typeof raw.description === 'string' ? raw.description : ''
  const summary = typeof raw.summary === 'string' ? raw.summary : ''
  const locationName = typeof raw.locationName === 'string' ? raw.locationName : ''
  const address = typeof raw.address === 'string' ? raw.address : ''
  const town = typeof raw.town === 'string' ? raw.town : ''
  const subArea = typeof raw.subArea === 'string' ? raw.subArea : ''
  const sourceName = typeof raw.sourceName === 'string' ? raw.sourceName.trim() : ''
  const sourceUrl = typeof raw.sourceUrl === 'string' ? raw.sourceUrl.trim() : ''
  const sourceDomain = typeof raw.sourceDomain === 'string' ? raw.sourceDomain.trim() : ''
  const sourcePriority = Number.isFinite(raw.sourcePriority) ? raw.sourcePriority : null
  const qaTags = Array.isArray(raw.qaTags)
    ? raw.qaTags.map((tag) => String(tag).trim()).filter(Boolean)
    : []

  const status = normalizeStatus(raw.status)
  const hidden = Boolean(raw.hidden)
  const archivedFlag = Boolean(raw.archived)
  const archived = archivedFlag || status === 'archived'

  return {
    ...raw,
    title: String(raw.title || '').trim(),
    slug,
    category: String(raw.category || ''),
    town,
    subArea,
    startDate: raw.startDate,
    endDate: raw.endDate,
    startDateObj,
    endDateObj,
    durationMs,
    allDay: Boolean(raw.allDay),
    recurrence: typeof raw.recurrence === 'string' ? raw.recurrence.trim() : '',
    summary,
    description,
    locationName,
    address,
    priceType: normalizePriceType(raw.priceType),
    priceNote: typeof raw.priceNote === 'string' ? raw.priceNote.trim() : '',
    badges: Array.isArray(raw.badges) ? raw.badges.filter((badge) => BADGE_LABELS[badge]) : [],
    eventUrl: typeof raw.eventUrl === 'string' ? raw.eventUrl.trim() : '',
    organizerName: typeof raw.organizerName === 'string' ? raw.organizerName.trim() : '',
    organizerUrl: typeof raw.organizerUrl === 'string' ? raw.organizerUrl.trim() : '',
    icsUrl: typeof raw.icsUrl === 'string' ? raw.icsUrl.trim() : '',
    featured: Boolean(raw.featured),
    status,
    hidden,
    archived,
    source: normalizeSource(raw.source),
    sourceName,
    sourceUrl,
    sourceDomain,
    sourcePriority,
    sourceRef: typeof raw.sourceRef === 'string' ? raw.sourceRef.trim() : '',
    qaTags,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
    lat: typeof raw.lat === 'number' ? raw.lat : null,
    lng: typeof raw.lng === 'number' ? raw.lng : null,
    hasLocation: typeof raw.lat === 'number' && typeof raw.lng === 'number',
    searchText: buildSearchText(raw),
  }
}

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getDuration(start, end) {
  if (!(start instanceof Date) || Number.isNaN(start)) return DEFAULT_DURATION_MS
  if (!(end instanceof Date) || Number.isNaN(end)) return DEFAULT_DURATION_MS
  const diff = end.getTime() - start.getTime()
  if (!Number.isFinite(diff) || diff <= 0) {
    return DEFAULT_DURATION_MS
  }
  return diff
}

function normalizePriceType(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (raw === 'Free' || raw === 'Paid' || raw === 'Mixed') return raw
  return 'Paid'
}

function normalizeStatus(value) {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : 'pending'
  switch (raw) {
    case 'draft':
    case 'pending':
    case 'approved':
    case 'published':
    case 'archived':
      return raw
    default:
      return 'pending'
  }
}

function normalizeSource(value) {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : 'manual'
  return raw === 'feed' ? 'feed' : 'manual'
}

function buildSearchText(raw) {
  const parts = []
  ;['title', 'summary', 'description', 'locationName', 'address', 'town', 'subArea', 'category', 'priceNote', 'sourceName', 'sourceDomain'].forEach((key) => {
    if (typeof raw[key] === 'string') parts.push(raw[key])
  })
  if (Array.isArray(raw.badges)) parts.push(raw.badges.join(' '))
  if (Array.isArray(raw.qaTags)) parts.push(raw.qaTags.join(' '))
  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function formatDateRange(occurrence, allDay) {
  if (!occurrence || !occurrence.start) return ''
  const dateLabel = dateFormatter.format(occurrence.start)
  if (allDay) {
    if (isMultiDay(occurrence)) {
      return `${dateLabel} – ${dateFormatter.format(occurrence.end)}`
    }
    return `${dateLabel} • All day`
  }
  const startTime = timeFormatter.format(occurrence.start)
  const endTime = occurrence.end ? timeFormatter.format(occurrence.end) : ''
  if (isMultiDay(occurrence)) {
    return `${dateLabel} ${startTime} → ${dateFormatter.format(occurrence.end)} ${endTime}`.trim()
  }
  return `${dateLabel} • ${startTime}${endTime ? ` – ${endTime}` : ''}`
}

function isMultiDay(occurrence) {
  if (!occurrence?.start || !occurrence?.end) return false
  const startMarker =
    occurrence.start.getFullYear() * 10000 +
    (occurrence.start.getMonth() + 1) * 100 +
    occurrence.start.getDate()
  const endMarker =
    occurrence.end.getFullYear() * 10000 +
    (occurrence.end.getMonth() + 1) * 100 +
    occurrence.end.getDate()
  return startMarker !== endMarker
}

export function computeFiltersRange(filters, now = new Date()) {
  const baseStart = filters?.showPast ? null : startOfDay(now)
  const defaultEnd = addMonths(now, CALENDAR_LOOKAHEAD_MONTHS)

  switch (filters?.dateRange) {
    case 'today': {
      const start = startOfDay(now)
      return { rangeStart: start, rangeEnd: endOfDay(now) }
    }
    case 'weekend': {
      const { start, end } = getWeekendRange(now)
      return { rangeStart: start, rangeEnd: end }
    }
    case 'month': {
      const start = startOfMonth(now)
      const end = endOfMonth(now)
      return { rangeStart: start, rangeEnd: end }
    }
    case 'custom': {
      const start = parseDate(filters?.customStart)
      const end = parseDate(filters?.customEnd)
      const rangeStart = start ? startOfDay(start) : baseStart
      const rangeEnd = end ? endOfDay(end) : defaultEnd
      return ensureChronological(rangeStart, rangeEnd)
    }
    default:
      return ensureChronological(baseStart, defaultEnd)
  }
}

function ensureChronological(start, end) {
  if (start && end && start > end) {
    return { rangeStart: end, rangeEnd: start }
  }
  return { rangeStart: start || null, rangeEnd: end || null }
}

function startOfDay(date) {
  if (!(date instanceof Date)) return null
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date) {
  if (!(date instanceof Date)) return null
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function addDays(date, amount) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

function addMonths(date, months) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function startOfMonth(date) {
  const d = new Date(date)
  d.setDate(1)
  return startOfDay(d)
}

function endOfMonth(date) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  return endOfDay(d)
}

function getWeekendRange(now) {
  const day = now.getDay()
  if (day === 5) {
    const start = startOfDay(now)
    return { rangeStart: start, rangeEnd: endOfDay(addDays(start, 2)) }
  }
  if (day === 6) {
    const friday = addDays(now, -1)
    return { rangeStart: startOfDay(friday), rangeEnd: endOfDay(now) }
  }
  if (day === 0) {
    const friday = addDays(now, -2)
    return { rangeStart: startOfDay(friday), rangeEnd: endOfDay(now) }
  }
  const daysUntilFriday = (5 - day + 7) % 7
  const friday = addDays(now, daysUntilFriday || 7)
  return { rangeStart: startOfDay(friday), rangeEnd: endOfDay(addDays(friday, 2)) }
}

export function getEventOccurrences(event, rangeStart, rangeEnd) {
  if (!event?.startDateObj) return []
  const occurrences = []
  const duration = event.durationMs || DEFAULT_DURATION_MS
  const safeRangeStart = rangeStart ? addDays(rangeStart, -2) : addDays(event.startDateObj, -2)
  const safeRangeEnd = rangeEnd || addMonths(event.startDateObj, CALENDAR_LOOKAHEAD_MONTHS)

  const pushOccurrence = (startDate) => {
    if (!(startDate instanceof Date) || Number.isNaN(startDate)) return
    const endDate = new Date(startDate.getTime() + duration)
    occurrences.push({
      start: startDate,
      end: endDate,
      key: `${event.slug}-${startDate.toISOString()}`,
    })
  }

  pushOccurrence(event.startDateObj)

  if (event.recurrence) {
    try {
      const rruleOptions = RRule.parseString(event.recurrence)
      rruleOptions.dtstart = event.startDateObj
      const rule = new RRule(rruleOptions)
      const between = rule.between(safeRangeStart, safeRangeEnd, true)
      for (const occurrence of between) {
        if (occurrences.length >= MAX_OCCURRENCES) break
        if (!occurrence) continue
        if (occurrence.getTime() === event.startDateObj.getTime()) continue
        pushOccurrence(occurrence)
      }
    } catch (error) {
      console.warn('[eventUtils] failed to parse recurrence', event.slug, error.message)
    }
  }

  return occurrences.sort((a, b) => a.start.getTime() - b.start.getTime())
}

function occurrenceMatchesRange(occurrence, rangeStart, rangeEnd, now, showPast) {
  if (!occurrence?.start || !occurrence?.end) return false
  if (!showPast && occurrence.end < now) return false
  if (rangeStart && occurrence.end < rangeStart) return false
  if (rangeEnd && occurrence.start > rangeEnd) return false
  return true
}

function matchesSearch(event, searchQuery) {
  if (!searchQuery) return true
  return event.searchText.includes(searchQuery)
}

function matchesCategory(event, categories) {
  if (!categories.size) return true
  return categories.has(event.category)
}

function matchesTown(event, towns) {
  if (!towns.size) return true
  return towns.has(event.town)
}

function matchesPrice(event, prices) {
  if (!prices.size) return true
  if (prices.has('Free') && prices.has('Paid')) return true
  if (prices.has('Free')) return event.priceType === 'Free'
  if (prices.has('Paid')) return event.priceType === 'Paid' || event.priceType === 'Mixed'
  return true
}

export function filterEvents(events, filters) {
  const now = new Date()
  const searchQuery = (filters?.search || '').trim().toLowerCase()
  const categories = new Set(filters?.categories || [])
  const towns = new Set(filters?.towns || [])
  const prices = new Set(filters?.price || [])
  const { rangeStart, rangeEnd } = computeFiltersRange(filters, now)

  const results = []

  for (const event of events) {
    if (!matchesSearch(event, searchQuery)) continue
    if (!matchesCategory(event, categories)) continue
    if (!matchesTown(event, towns)) continue
    if (!matchesPrice(event, prices)) continue

    const occurrences = getEventOccurrences(event, rangeStart, rangeEnd)
    const relevant = occurrences.filter((occ) =>
      occurrenceMatchesRange(occ, rangeStart, rangeEnd, now, Boolean(filters?.showPast))
    )

    if (!relevant.length) continue

    const nextOccurrence = findNextOccurrence(relevant, filters?.showPast ? null : now)

    results.push({
      ...event,
      occurrences: relevant,
      nextOccurrence,
    })
  }

  results.sort((a, b) => {
    const aTime = a.nextOccurrence?.start?.getTime() ?? Infinity
    const bTime = b.nextOccurrence?.start?.getTime() ?? Infinity
    return aTime - bTime
  })

  return { events: results, rangeStart, rangeEnd }
}

function findNextOccurrence(occurrences, now) {
  if (!occurrences.length) return null
  if (!now) return occurrences[0]
  const upcoming = occurrences.find((occ) => occ.end >= now)
  return upcoming || occurrences[occurrences.length - 1]
}

export function getStructuredData(events, origin) {
  if (!Array.isArray(events) || !events.length) return null
  const siteOrigin = typeof origin === 'string' && origin ? origin : getWindowOrigin()
  const limited = events.slice(0, 10)

  const jsonld = limited.map((event) => buildEventSchema(event, siteOrigin))
  return JSON.stringify(jsonld, null, 2)
}

function buildEventSchema(event, origin) {
  const occurrence = event.nextOccurrence || event.occurrences?.[0]
  const start = occurrence?.start || event.startDateObj
  const end = occurrence?.end || event.endDateObj || occurrence?.start
  const image = absoluteUrl(origin, event.image)
  const url = absoluteUrl(origin, `/events/${encodeURIComponent(event.slug)}`)
  const eventUrl = event.eventUrl || url

  const location = {
    '@type': 'Place',
    name: event.locationName || event.town || 'NorthSide GTA',
    address: event.address || `${event.town}, Ontario`,
  }
  if (event.hasLocation) {
    location.geo = {
      '@type': 'GeoCoordinates',
      latitude: event.lat,
      longitude: event.lng,
    }
  }

  const organizer = event.organizerName
    ? {
        '@type': 'Organization',
        name: event.organizerName,
        url: event.organizerUrl || event.eventUrl || url,
      }
    : undefined

  const offer = {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    url: event.eventUrl || url,
  }
  if (event.priceType === 'Free') {
    offer.price = 0
    offer.priceCurrency = 'CAD'
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: start ? start.toISOString() : event.startDate,
    endDate: end ? end.toISOString() : event.endDate || event.startDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    image: image ? [image] : undefined,
    description: truncateText(event.summary || event.description, 200),
    location,
    organizer,
    offers: offer,
    url: eventUrl,
  }
}

function getWindowOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://northsidegta.ca'
}

function absoluteUrl(origin, value) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  const normalized = value.startsWith('/') ? value : `/${value}`
  return `${origin.replace(/\/$/, '')}${normalized}`
}

function truncateText(text, length) {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= length) return clean
  return `${clean.slice(0, length - 1).trim()}…`
}

export function generateIcsContent(event, occurrence) {
  const occ = occurrence || event.nextOccurrence || event.occurrences?.[0]
  const start = occ?.start || event.startDateObj
  const end = occ?.end || event.endDateObj || start
  if (!start) return ''

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NorthSide GTA//Community Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.slug || cryptoSafeId() }@northsidegta.ca`,
    `DTSTAMP:${formatAsUtc(new Date())}`,
    `DTSTART:${formatDateForIcs(start, event.allDay)}`,
    `DTEND:${formatDateForIcs(end, event.allDay)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ]

  if (event.locationName || event.address) {
    const location = [event.locationName, event.address].filter(Boolean).join(', ')
    lines.push(`LOCATION:${escapeIcsText(location)}`)
  }
  if (event.summary) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.summary)}`)
  } else if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`)
  }
  if (event.eventUrl) {
    lines.push(`URL:${escapeIcsText(event.eventUrl)}`)
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

function formatAsUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function formatDateForIcs(date, allDay) {
  if (allDay) {
    const y = date.getUTCFullYear()
    const m = String(date.getUTCMonth() + 1).padStart(2, '0')
    const d = String(date.getUTCDate()).padStart(2, '0')
    return `${y}${m}${d}`
  }
  return formatAsUtc(date)
}

function escapeIcsText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\n+/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function cryptoSafeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export function buildFiltersDefaults() {
  return {
    search: '',
    dateRange: 'upcoming',
    customStart: '',
    customEnd: '',
    categories: [],
    towns: [],
    price: [],
    showPast: false,
  }
}
