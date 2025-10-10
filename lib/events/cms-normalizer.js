const Ajv = require('ajv')
const { DateTime } = require('luxon')
const {
  EVENT_SCHEMA,
  EVENT_KEY_ORDER,
  CATEGORY_OPTIONS,
  TOWN_OPTIONS,
  BADGE_OPTIONS,
} = require('./cms-schema')

function createEventValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(EVENT_SCHEMA)
  return (data) => ({ valid: validate(data), errors: validate.errors ?? [] })
}

function normalizeCmsEvent(rawEvent) {
  if (!rawEvent || typeof rawEvent !== 'object') {
    throw new Error('Event payload must be an object')
  }

  const changes = []

  const slug = normalizeSlug(rawEvent.slug || rawEvent.id || rawEvent.title)
  if (!slug) {
    throw new Error('Missing slug')
  }
  if (slug !== rawEvent.slug) {
    changes.push('normalized slug')
  }

  const title = sanitizeText(rawEvent.title)
  if (!title) {
    throw new Error('Missing title')
  }

  const summary = normalizeSummary(rawEvent.summary, rawEvent.description, title)
  const rawSummary = sanitizeText(rawEvent.summary)
  if (rawSummary) {
    if (summary !== rawSummary) {
      changes.push('normalized summary')
    }
  } else if (summary) {
    changes.push('backfilled summary')
  }

  const description = normalizeDescription(rawEvent.description, summary)
  const hasRawDescription = rawEvent.description !== undefined && rawEvent.description !== null && String(rawEvent.description).trim() !== ''
  if (hasRawDescription) {
    const baselineDescription = normalizeDescription(rawEvent.description, rawEvent.description)
    if (description !== baselineDescription) {
      changes.push('normalized description')
    }
  } else if (description) {
    changes.push('backfilled description')
  }

  const startSource = rawEvent.startDate || rawEvent.start
  const startDate = normalizeDateTime(startSource)
  if (!startDate) {
    throw new Error('Missing valid startDate')
  }
  if (startSource && startDate !== sanitizeText(startSource)) {
    changes.push('normalized startDate')
  }

  const endSource = rawEvent.endDate || rawEvent.end
  const endDate = normalizeDateTime(endSource)
  if (endDate && endSource && endDate !== sanitizeText(endSource)) {
    changes.push('normalized endDate')
  }

  const allDay = normalizeBoolean(rawEvent.allDay)
  if (rawEvent.allDay !== undefined && allDay !== Boolean(rawEvent.allDay)) {
    changes.push('normalized allDay flag')
  }

  const useDailySchedule = normalizeBoolean(rawEvent.use_daily_schedule)
  if (rawEvent.use_daily_schedule !== undefined && useDailySchedule !== Boolean(rawEvent.use_daily_schedule)) {
    changes.push('normalized use_daily_schedule flag')
  }

  const dailySchedule = normalizeDailySchedule(rawEvent.daily_schedule)
  if (dailySchedule.changed) {
    changes.push('normalized daily_schedule')
  }

  const recurrence = sanitizeText(rawEvent.recurrence)
  if (recurrence && recurrence !== sanitizeText(rawEvent.recurrence)) {
    changes.push('normalized recurrence')
  }

  const category = normalizeCategory(rawEvent.category, rawEvent.categoryTags, rawEvent.userEventType)
  const rawCategory = decodeEntities(rawEvent.category)
  if ((rawCategory && category !== rawCategory) || (!rawCategory && category !== 'Other')) {
    changes.push('normalized category')
  }

  const town = normalizeTown(rawEvent.town, rawEvent.location?.city)
  const rawTown = sanitizeText(rawEvent.town)
  if ((rawTown && town !== rawTown) || (!rawTown && town !== 'Toronto-adjacent')) {
    changes.push('normalized town')
  }

  const locationName = normalizeLocationName(rawEvent.locationName, rawEvent.location, title)
  if (locationName !== sanitizeText(rawEvent.locationName)) {
    changes.push('normalized locationName')
  }

  const address = normalizeAddress(rawEvent.address, rawEvent.location, locationName, town)
  if (address !== sanitizeText(rawEvent.address)) {
    changes.push('normalized address')
  }

  const lat = normalizeNumber(rawEvent.lat)
  if (lat.changed) {
    changes.push('normalized lat')
  }

  const lng = normalizeNumber(rawEvent.lng)
  if (lng.changed) {
    changes.push('normalized lng')
  }

  const priceType = normalizePriceType(rawEvent.priceType)
  const rawPriceType = sanitizeText(rawEvent.priceType)
  if ((rawPriceType && priceType !== rawPriceType) || (!rawPriceType && priceType !== 'Free')) {
    changes.push('normalized priceType')
  }

  const priceNote = sanitizeText(rawEvent.priceNote || rawEvent.priceFrom)
  if (priceNote && priceNote !== sanitizeText(rawEvent.priceNote)) {
    changes.push('normalized priceNote')
  }

  const badges = normalizeBadges(rawEvent.badges, rawEvent.qaTags)
  if (badges.changed) {
    changes.push('normalized badges')
  }

  const rawImage = rawEvent.image ?? ''
  const image = sanitizeUrl(rawImage)
  if ((image && image !== rawImage) || (!image && sanitizeText(rawImage))) {
    changes.push('normalized image')
  }

  const organizerName = normalizeOrganizerName(rawEvent.organizerName)
  if (organizerName !== sanitizeText(rawEvent.organizerName)) {
    changes.push('normalized organizerName')
  }

  const rawOrganizerUrl = rawEvent.organizerUrl ?? ''
  const organizerUrl = sanitizeUrl(rawOrganizerUrl)
  if ((organizerUrl && organizerUrl !== rawOrganizerUrl) || (!organizerUrl && sanitizeText(rawOrganizerUrl))) {
    changes.push('normalized organizerUrl')
  }

  const fallbackEventUrl = rawEvent.eventUrl || rawEvent.url || rawEvent.registrationUrl || rawEvent.ticketsUrl
  const eventUrl = sanitizeUrl(fallbackEventUrl)
  if (!eventUrl) {
    throw new Error('Missing eventUrl')
  }
  if (sanitizeText(rawEvent.eventUrl)) {
    if (eventUrl !== sanitizeText(rawEvent.eventUrl)) {
      changes.push('normalized eventUrl')
    }
  } else {
    changes.push('backfilled eventUrl')
  }

  const rawIcsUrl = rawEvent.icsUrl ?? ''
  const icsUrl = sanitizeUrl(rawIcsUrl)
  if ((icsUrl && icsUrl !== rawIcsUrl) || (!icsUrl && sanitizeText(rawIcsUrl))) {
    changes.push('normalized icsUrl')
  }

  const featured = normalizeBoolean(rawEvent.featured)
  if (rawEvent.featured !== undefined && featured !== Boolean(rawEvent.featured)) {
    changes.push('normalized featured flag')
  }
  const hidden = normalizeBoolean(rawEvent.hidden)
  if (rawEvent.hidden !== undefined && hidden !== Boolean(rawEvent.hidden)) {
    changes.push('normalized hidden flag')
  }
  const archived = normalizeBoolean(rawEvent.archived)
  if (rawEvent.archived !== undefined && archived !== Boolean(rawEvent.archived)) {
    changes.push('normalized archived flag')
  }

  const status = normalizeStatus(rawEvent.status)
  const rawStatus = sanitizeText(rawEvent.status)
  if ((rawStatus && status !== rawStatus) || (!rawStatus && status !== 'pending')) {
    changes.push('normalized status')
  }

  const source = normalizeSource(rawEvent.source, rawEvent.sourceDomain)
  const rawSourceValue = typeof rawEvent.source === 'string'
    ? rawEvent.source
    : rawEvent.source
      ? 'feed'
      : rawEvent.sourceDomain
        ? 'feed'
        : ''
  if ((rawSourceValue && source !== rawSourceValue) || (!rawSourceValue && source !== 'manual')) {
    changes.push('normalized source')
  }

  const sourceRef = sanitizeText(rawEvent.sourceRef || rawEvent.id || rawEvent.source?.id)
  if (sourceRef && sourceRef !== sanitizeText(rawEvent.sourceRef)) {
    changes.push('normalized sourceRef')
  }

  const updatedSource =
    rawEvent.updatedAt ||
    rawEvent.lastSyncedAt ||
    rawEvent.approvedAt ||
    rawEvent.submittedAt ||
    rawEvent.firstSeenAt ||
    rawEvent.lastChangeAt
  const updatedAt = normalizeDateTime(updatedSource)
  if (updatedAt && updatedSource && updatedAt !== sanitizeText(updatedSource)) {
    changes.push('normalized updatedAt')
  }

  const normalized = {}
  normalized.slug = slug
  normalized.title = title
  normalized.summary = summary
  normalized.description = description
  normalized.startDate = startDate
  if (endDate) normalized.endDate = endDate
  normalized.allDay = allDay
  normalized.use_daily_schedule = useDailySchedule
  if (useDailySchedule || dailySchedule.value.length) {
    normalized.daily_schedule = dailySchedule.value
  }
  if (recurrence) normalized.recurrence = recurrence
  normalized.category = category
  normalized.town = town
  normalized.locationName = locationName
  normalized.address = address
  if (lat.value !== undefined) normalized.lat = lat.value
  if (lng.value !== undefined) normalized.lng = lng.value
  normalized.priceType = priceType
  if (priceNote) normalized.priceNote = priceNote
  if (badges.value.length) normalized.badges = badges.value
  if (image) normalized.image = image
  if (organizerName) normalized.organizerName = organizerName
  if (organizerUrl) normalized.organizerUrl = organizerUrl
  normalized.eventUrl = eventUrl
  if (icsUrl) normalized.icsUrl = icsUrl
  normalized.featured = featured
  normalized.hidden = hidden
  normalized.archived = archived
  normalized.status = status
  normalized.source = source
  if (sourceRef) normalized.sourceRef = sourceRef
  if (updatedAt) normalized.updatedAt = updatedAt

  return { event: orderKeys(normalized), changes: Array.from(new Set(changes)) }
}

function orderKeys(event) {
  const ordered = {}
  for (const key of EVENT_KEY_ORDER) {
    if (event[key] !== undefined) {
      ordered[key] = event[key]
    }
  }
  for (const key of Object.keys(event)) {
    if (ordered[key] === undefined) {
      ordered[key] = event[key]
    }
  }
  return ordered
}

function normalizeSlug(value) {
  const text = sanitizeText(value).toLowerCase()
  if (!text) return ''
  const slug = text
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug
}

function normalizeSummary(summary, description, title) {
  const base = sanitizeText(summary) || sanitizeText(description) || sanitizeText(title)
  return collapseWhitespace(base)
}

function normalizeDescription(description, fallback) {
  const hasDescription = description !== undefined && description !== null && String(description).trim() !== ''
  const base = hasDescription ? String(description) : sanitizeText(fallback)
  if (!base) return ''
  return String(base)
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+$/g, ''))
    .join('\n')
    .trim()
}

function normalizeDateTime(value) {
  if (!value) return null
  const candidates = Array.isArray(value) ? value : [value]
  for (const candidate of candidates) {
    if (!candidate) continue
    const text = String(candidate).trim()
    if (!text) continue
    let dt = DateTime.fromISO(text, { setZone: true })
    if (!dt.isValid) {
      dt = DateTime.fromRFC2822(text, { setZone: true })
    }
    if (!dt.isValid) {
      dt = DateTime.fromFormat(text, 'yyyy-LL-dd HH:mm:ss', { zone: 'UTC' })
    }
    if (!dt.isValid) {
      dt = DateTime.fromFormat(text, 'yyyy-LL-dd HH:mm', { zone: 'UTC' })
    }
    if (!dt.isValid) {
      dt = DateTime.fromFormat(text, 'yyyy-LL-dd', { zone: 'UTC' })
      if (dt.isValid) {
        dt = dt.startOf('day')
      }
    }
    if (dt.isValid) {
      return dt.toUTC().toFormat("yyyy-LL-dd'T'HH:mm:ss'Z'")
    }
  }
  return null
}

function normalizeDailySchedule(schedule) {
  if (!Array.isArray(schedule)) {
    return { value: [], changed: false }
  }
  const normalized = []
  let changed = false
  for (const entry of schedule) {
    if (!entry || typeof entry !== 'object') continue
    const date = normalizeDate(entry.date || entry.day)
    if (!date) {
      changed = true
      continue
    }
    const allDay = Boolean(entry.all_day ?? entry.allDay)
    const startCandidate = entry.start_time ?? entry.startTime ?? entry.start ?? (Array.isArray(entry.blocks) ? entry.blocks[0]?.start : '')
    const endCandidate = entry.end_time ?? entry.endTime ?? entry.end ?? (Array.isArray(entry.blocks) ? entry.blocks[0]?.end : '')
    const rawStartText = sanitizeText(startCandidate)
    const rawEndText = sanitizeText(endCandidate)
    let start = ''
    let end = ''
    if (!allDay) {
      start = normalizeTime(startCandidate)
      end = normalizeTime(endCandidate)
      if (!start && end) {
        start = end
      }
      if (start && !end) {
        end = start
      }
    }
    if (allDay && (rawStartText || rawEndText)) {
      changed = true
    }
    if (!allDay) {
      if (rawStartText && start !== rawStartText) {
        changed = true
      }
      if (rawEndText && end !== rawEndText) {
        changed = true
      }
    }
    if (!allDay && !rawStartText && start) {
      changed = true
    }
    if (!allDay && !rawEndText && end) {
      changed = true
    }
    normalized.push({
      date,
      all_day: allDay,
      start_time: start,
      end_time: end,
    })
  }
  normalized.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.start_time.localeCompare(b.start_time)
  })
  return { value: normalized, changed }
}

function normalizeDate(value) {
  if (!value) return null
  const text = String(value).trim()
  if (!text) return null
  const formats = ['yyyy-LL-dd', 'LL/dd/yyyy', 'yyyy/MM/dd']
  for (const format of formats) {
    const dt = DateTime.fromFormat(text, format, { zone: 'UTC' })
    if (dt.isValid) {
      return dt.toFormat('yyyy-LL-dd')
    }
  }
  const iso = DateTime.fromISO(text, { zone: 'UTC' })
  if (iso.isValid) {
    return iso.toFormat('yyyy-LL-dd')
  }
  return null
}

function normalizeTime(value) {
  if (value == null) return ''
  const text = String(value).trim()
  if (!text) return ''
  const formats = ['HH:mm', 'H:mm', 'h:mm a', 'hh:mm a', 'h:mmA', 'hh:mmA']
  for (const format of formats) {
    const dt = DateTime.fromFormat(text, format)
    if (dt.isValid) {
      return dt.toFormat('HH:mm')
    }
  }
  const iso = DateTime.fromISO(text)
  if (iso.isValid) {
    return iso.toFormat('HH:mm')
  }
  return ''
}

function normalizeCategory(category, categoryTags = [], userType) {
  const candidates = [decodeEntities(category), ...(Array.isArray(categoryTags) ? categoryTags : []), userType]
  for (const candidate of candidates) {
    const normalized = mapCategory(candidate)
    if (normalized) return normalized
  }
  return 'Other'
}

function mapCategory(value) {
  const text = decodeEntities(value)
  if (!text) return null
  const normalized = text.toLowerCase()
  const lookup = {
    'arts & culture': 'Arts & Culture',
    'cultural & heritage events': 'Arts & Culture',
    'festivals': 'Festivals',
    'sports': 'Sports',
    'markets': 'Markets',
    'family': 'Family',
    'family-friendly events': 'Family',
    'family-friendly': 'Family',
    'golf': 'Golf',
    'outdoors': 'Outdoors',
    'agritourism & rural experiences': 'Outdoors',
    'business & networking': 'Other',
    'business/networking': 'Other',
    'business': 'Other',
    'community': 'Other',
    'education': 'Other',
    'charity': 'Other',
    'entertainment': 'Other',
    'other': 'Other',
  }
  const mapped = lookup[normalized]
  if (mapped && CATEGORY_OPTIONS.includes(mapped)) {
    return mapped
  }
  if (CATEGORY_OPTIONS.includes(capitalize(text))) {
    return capitalize(text)
  }
  return null
}

function normalizeTown(town, fallbackTown) {
  const candidates = [town, fallbackTown]
  for (const candidate of candidates) {
    const normalized = mapTown(candidate)
    if (normalized) return normalized
  }
  return 'Toronto-adjacent'
}

function mapTown(value) {
  const text = sanitizeText(value)
  if (!text) return null
  const normalized = text.toLowerCase()
  const lookup = {
    aurora: 'Aurora',
    uxbridge: 'Uxbridge',
    georgina: 'Georgina',
    stouffville: 'Stouffville',
    'stouffville, on': 'Stouffville',
    'whitchurch stoufville': 'Stouffville',
    'whitchurch-stouffville': 'Stouffville',
    stoufville: 'Stouffville',
    'east gwillimbury': 'East Gwillimbury',
    newmarket: 'Newmarket',
    scugog: 'Scugog',
    'toronto-adjacent': 'Toronto-adjacent',
    'toronto adjacent': 'Toronto-adjacent',
  }
  const mapped = lookup[normalized]
  if (mapped) return mapped
  const capitalized = capitalize(text)
  if (TOWN_OPTIONS.includes(capitalized)) {
    return capitalized
  }
  return null
}

function normalizeLocationName(name, location, title) {
  const candidates = [name, location?.name, location?.venue, title]
  for (const candidate of candidates) {
    const text = sanitizeText(candidate)
    if (text && text !== '[object Object]') {
      return text
    }
  }
  return 'TBD'
}

function normalizeAddress(address, location, fallbackName, fallbackTown) {
  const candidates = [address, location?.address, location?.venue]
  for (const candidate of candidates) {
    const text = sanitizeText(candidate)
    if (text && text !== '[object Object]') {
      return text
    }
  }
  if (fallbackName) return fallbackName
  if (fallbackTown) return fallbackTown
  return 'See event website for details'
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === '') {
    return { value: undefined, changed: false }
  }
  const number = Number(value)
  if (Number.isFinite(number)) {
    return { value: number, changed: number !== value }
  }
  return { value: undefined, changed: true }
}

function normalizePriceType(value) {
  const text = sanitizeText(value)
  if (['Free', 'Paid', 'Mixed'].includes(text)) {
    return text
  }
  return 'Free'
}

function normalizeBadges(badges, qaTags) {
  const collected = new Set()
  const originalNormalized = []
  if (Array.isArray(badges)) {
    for (const badge of badges) {
      const normalized = mapBadge(badge)
      if (normalized) {
        collected.add(normalized)
        originalNormalized.push(normalized)
      } else if (sanitizeText(badge)) {
        originalNormalized.push(null)
      }
    }
  }
  if (Array.isArray(qaTags)) {
    for (const tag of qaTags) {
      const normalized = mapBadge(tag)
      if (normalized) collected.add(normalized)
    }
  }
  const normalizedList = Array.from(collected).sort()
  const originalList = originalNormalized.filter((item) => item)
  const originalSet = new Set(originalList)
  const hadInvalidOriginal = originalNormalized.includes(null)
  const changedFromBadges =
    normalizedList.length !== originalList.length ||
    normalizedList.some((item) => !originalSet.has(item)) ||
    originalList.some((item) => !normalizedList.includes(item)) ||
    hadInvalidOriginal
  const addedFromQa = Array.isArray(qaTags)
    ? qaTags.some((tag) => {
        const normalized = mapBadge(tag)
        return normalized && !originalSet.has(normalized)
      })
    : false
  return { value: normalizedList, changed: changedFromBadges || addedFromQa }
}

function mapBadge(value) {
  const text = sanitizeText(value)
  if (!text) return null
  const lower = text.toLowerCase()
  const matched = BADGE_OPTIONS.find((option) => option.toLowerCase() === lower)
  if (matched) return matched
  if (lower === 'arts & culture') return null
  return null
}

function normalizeOrganizerName(value) {
  const text = sanitizeText(value)
  if (!text || text === '[object Object]') {
    return ''
  }
  return text
}

function normalizeStatus(value) {
  const text = sanitizeText(value).toLowerCase()
  const allowed = ['draft', 'pending', 'approved', 'published', 'archived']
  const match = allowed.find((item) => item === text)
  return match || 'pending'
}

function normalizeSource(source, sourceDomain) {
  if (typeof source === 'string') {
    if (source === 'user' || source === 'manual') return 'manual'
    if (source === 'feed') return 'feed'
  }
  if (source && typeof source === 'object') {
    return 'feed'
  }
  if (sourceDomain) {
    return 'feed'
  }
  return 'manual'
}

function sanitizeText(value) {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value.trim()
  return String(value).trim()
}

function sanitizeUrl(value) {
  const text = sanitizeText(value)
  if (!text) return ''
  return text
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true
    if (['false', '0', 'no', 'n', 'off', ''].includes(normalized)) return false
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return false
    return value !== 0
  }
  return Boolean(value)
}

function collapseWhitespace(value) {
  return value.replace(/[\s\u00A0]+/g, ' ').trim()
}

function capitalize(value) {
  if (!value) return ''
  return value
    .toString()
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function decodeEntities(value) {
  if (!value) return ''
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
}

module.exports = {
  createEventValidator,
  normalizeCmsEvent,
  orderKeys,
  normalizeSlug,
  normalizeDateTime,
}
