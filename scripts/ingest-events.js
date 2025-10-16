#!/usr/bin/env node

require('../lib/events/runtime')

const fs = require('fs')
const path = require('path')
const Parser = require('rss-parser')
const ical = require('node-ical')
const { RRule } = require('rrule')
const { getAdapter } = require('../lib/event-source-adapters')

const rootDir = path.resolve(__dirname, '..')
const configPath = path.join(rootDir, 'config', 'event-feeds.json')
const eventsDir = path.join(rootDir, 'public', 'data', 'events')

const DEFAULT_USER_AGENT = 'NorthSideGTA-EventBot/1.0 (+https://www.northsidegta.ca/community)'
const MIN_REQUEST_DELAY_MS = 6000
const DEFAULT_PRIORITY = 50

const parser = new Parser()
const responseCache = new Map()
const domainTimers = new Map()

const RUN_TIMESTAMP = new Date()
const MS_IN_DAY = 24 * 60 * 60 * 1000
const EXPIRED_GRACE_MS = 6 * 60 * 60 * 1000

const CLASS_KEYWORD_PATTERNS = [
  /\bclass(es)?\b/i,
  /\blesson(s)?\b/i,
  /\bcourse(s)?\b/i,
  /\bcamp(s)?\b/i,
  /\bclinic(s)?\b/i,
  /\bboot\s?camp(s)?\b/i,
  /\bprogram(s)?\b/i,
  /\bworkshop\s+series\b/i,
  /\btraining\b/i,
  /\bdrop[-\s]?in(s)?\b/i,
]

const ONGOING_HINT_PATTERNS = [
  /\bweekly\b/i,
  /\bdaily\b/i,
  /\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\bevery\s+week\b/i,
  /\bongoing\b/i,
  /\bper\s+week\b/i,
  /\b\d+\s*-?week\b/i,
  /\bmulti[-\s]?week\b/i,
  /\bsessions\b/i,
  /\b(mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays)\b/i,
]

async function main() {
  const feeds = loadConfig(configPath)
  if (!feeds.length) {
    console.log('[ingest-events] No feeds configured — exiting')
    return
  }

  ensureDir(eventsDir)

  const existing = loadExistingEvents(eventsDir)
  const summary = { created: 0, updated: 0, duplicate: 0, skipped: 0, pruned: 0, failed: 0 }

  for (const feed of feeds) {
    if (feed.enabled === false) {
      summary.skipped += 1
      continue
    }

    try {
      const items = await fetchFeed(feed)
      if (!Array.isArray(items) || !items.length) {
        continue
      }

      for (const item of items) {
        const normalized = normalizeEvent(item, feed)
        if (!normalized) {
          summary.skipped += 1
          continue
        }

        const disqualifier = getDisqualifier(normalized, RUN_TIMESTAMP)
        if (disqualifier) {
          summary.skipped += 1
          console.log(
            `[ingest-events] Skipping "${normalized.title}" (${normalized.slug}): ${disqualifier}`
          )
          continue
        }

        const result = await upsertEvent(normalized, existing, eventsDir)
        if (typeof summary[result] !== 'number') {
          summary[result] = 0
        }
        summary[result] += 1
      }
    } catch (error) {
      summary.failed += 1
      console.warn(`[ingest-events] Failed to process feed ${feed.id || feed.url}:`, error.message)
    }
  }

  summary.pruned = pruneExistingEvents(existing, eventsDir, RUN_TIMESTAMP)

  console.log(
    `[ingest-events] Created ${summary.created}, updated ${summary.updated}, duplicates ${summary.duplicate}, skipped ${summary.skipped}, pruned ${summary.pruned}, failed ${summary.failed}`
  )
}

function loadConfig(filePath) {
  if (!fs.existsSync(filePath)) return []
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return Array.isArray(raw) ? raw : []
  } catch (error) {
    console.warn('[ingest-events] Invalid config JSON:', error.message)
    return []
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function loadExistingEvents(dirPath) {
  const bySlug = new Map()
  const bySourceRef = new Map()
  const byDedupKey = new Map()

  if (!fs.existsSync(dirPath)) return { bySlug, bySourceRef, byDedupKey }

  const files = fs.readdirSync(dirPath).filter((name) => name.endsWith('.json'))
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf8'))
      if (data.slug) {
        bySlug.set(data.slug, data)
      }
      if (data.sourceRef) {
        bySourceRef.set(data.sourceRef, data)
      }
      const dedupKey = buildDedupKey(data)
      if (dedupKey) {
        const existing = byDedupKey.get(dedupKey)
        if (!existing) {
          byDedupKey.set(dedupKey, data)
        } else {
          const existingPriority = Number(existing.sourcePriority ?? DEFAULT_PRIORITY)
          const incomingPriority = Number(data.sourcePriority ?? DEFAULT_PRIORITY)
          if (incomingPriority < existingPriority) {
            byDedupKey.set(dedupKey, data)
          }
        }
      }
    } catch (error) {
      console.warn('[ingest-events] Skipping malformed event', file)
    }
  }

  return { bySlug, bySourceRef, byDedupKey }
}

async function fetchFeed(feed) {
  if (!feed) return []

  if (feed.parser) {
    const adapter = getAdapter(feed.parser)
    if (!adapter) {
      throw new Error(`Unknown adapter ${feed.parser}`)
    }
    const context = createAdapterContext(feed)
    const payload = await adapter(feed, context)
    return Array.isArray(payload) ? payload : []
  }

  const type = (feed.type || 'rss').toLowerCase()

  if (type === 'rss') {
    const xml = await fetchText(feed.url, feed, {}, 'application/rss+xml, application/xml;q=0.9, */*;q=0.1')
    if (!xml) return []
    const response = await parser.parseString(xml)
    return Array.isArray(response.items) ? response.items : []
  }

  if (type === 'json') {
    const data = await fetchJson(feed.url, feed)
    if (!data) return []
    if (Array.isArray(data)) return data
    if (Array.isArray(data.items)) return data.items
    if (Array.isArray(data.results)) return data.results
    return []
  }

  if (type === 'ics') {
    return fetchIcs(feed)
  }

  if (type === 'html') {
    const adapter = getAdapter('simpleHtmlList')
    if (!adapter) return []
    const context = createAdapterContext(feed)
    const payload = await adapter(feed, context)
    return Array.isArray(payload) ? payload : []
  }

  return []
}

async function fetchIcs(feed) {
  const text = await fetchText(feed.url, feed, {}, 'text/calendar, application/octet-stream;q=0.8, */*;q=0.1')
  if (!text) return []
  const events = await ical.async.parseICS(text)
  return Object.values(events).filter((entry) => entry && entry.type === 'VEVENT')
}

function createAdapterContext(feed) {
  return {
    now: new Date(),
    resolveUrl: (value) => resolveUrl(value, feed),
    fetchJson: (url, init = {}) => fetchJson(url, feed, init),
    fetchText: (url, init = {}, accept) => fetchText(url, feed, init, accept),
    fetchWithRateLimit: (url, init = {}) => fetchWithRateLimit(url, init, feed),
    jsonHeaders: (localFeed) => buildHeaderObject(localFeed || feed, 'json'),
    htmlHeaders: (localFeed) => buildHeaderObject(localFeed || feed, 'html'),
    cleanText,
  }
}

function buildHeaderObject(feed, mode) {
  const headers = { ...(feed?.headers || {}) }
  if (!('User-Agent' in headers) && !('user-agent' in headers)) {
    headers['User-Agent'] = DEFAULT_USER_AGENT
  }
  if (feed?.referer && !('Referer' in headers) && !('referer' in headers)) {
    headers.Referer = feed.referer
  }
  if (mode === 'json') {
    if (!('Accept' in headers) && !('accept' in headers)) {
      headers.Accept = 'application/json, text/javascript;q=0.9, */*;q=0.1'
    }
  } else if (mode === 'html') {
    if (!('Accept' in headers) && !('accept' in headers)) {
      headers.Accept = 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1'
    }
  }
  return headers
}

async function fetchText(url, feed, init = {}, accept) {
  const absolute = resolveUrl(url, feed)
  if (!absolute) return ''

  const cacheKey = `text:${absolute}`
  if (feed.cache !== false && responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)
  }

  const requestInit = { ...init, headers: { ...(init.headers || {}) } }
  if (accept && !requestInit.headers.Accept && !requestInit.headers.accept) {
    requestInit.headers.Accept = accept
  }

  const response = await fetchWithRateLimit(absolute, requestInit, feed)
  const text = await response.text()
  if (feed.cache !== false) {
    responseCache.set(cacheKey, text)
  }
  return text
}

async function fetchJson(url, feed, init = {}) {
  const absolute = resolveUrl(url, feed)
  if (!absolute) return null

  const cacheKey = `json:${absolute}`
  if (feed.cache !== false && responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)
  }

  const requestInit = { ...init, headers: { ...(init.headers || {}) } }
  if (!requestInit.headers.Accept && !requestInit.headers.accept) {
    requestInit.headers.Accept = 'application/json, text/javascript;q=0.9, */*;q=0.1'
  }

  const response = await fetchWithRateLimit(absolute, requestInit, feed)
  const text = await response.text()
  if (!text) return null

  let data
  try {
    data = JSON.parse(text)
  } catch (error) {
    throw new Error(`Invalid JSON response from ${absolute}`)
  }

  if (feed.cache !== false) {
    responseCache.set(cacheKey, data)
  }

  return data
}

async function fetchWithRateLimit(url, init = {}, feed) {
  const absolute = resolveUrl(url, feed)
  if (!absolute) {
    throw new Error('Invalid URL')
  }

  const requestInit = buildRequestInit(feed, init)
  const domain = getHostname(absolute)
  const now = Date.now()
  const lastCall = domainTimers.get(domain) || 0
  const minDelay = Number.isFinite(feed?.minRequestDelayMs) ? feed.minRequestDelayMs : MIN_REQUEST_DELAY_MS
  const waitMs = Math.max(0, lastCall + minDelay - now)
  if (waitMs > 0) {
    await delay(waitMs)
  }

  const response = await fetch(absolute, requestInit)
  domainTimers.set(domain, Date.now())

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response
}

function buildRequestInit(feed, init = {}) {
  const request = { ...init }
  const headers = { ...(feed?.headers || {}), ...(init.headers || {}) }

  if (!('User-Agent' in headers) && !('user-agent' in headers)) {
    headers['User-Agent'] = DEFAULT_USER_AGENT
  }
  if (feed?.referer && !('Referer' in headers) && !('referer' in headers)) {
    headers.Referer = feed.referer
  }

  request.headers = headers
  return request
}

function resolveUrl(value, feed) {
  if (!value) return ''
  const raw = String(value).trim()
  if (!raw) return ''
  try {
    if (/^https?:/i.test(raw)) return raw
    if (raw.startsWith('//')) return `https:${raw}`
    const base = feed?.baseUrl || feed?.sourceUrl || feed?.url
    if (!base) return raw
    return new URL(raw, base).toString()
  } catch (error) {
    return ''
  }
}

function normalizeEvent(item, feed) {
  if (!item) return null

  const start = extractDate(item.start || item.startDate || item.start_date || item.dtstart || item.begin)
  if (!start) return null
  const end = extractDate(item.end || item.endDate || item.end_date || item.dtend)

  const title = cleanText(
    item.title ||
      item.summary ||
      item.name ||
      (item.description ? truncate(cleanText(item.description), 80) : '')
  )
  if (!title) return null

  const description = cleanText(item.description || item.content || item.body || item.details || '')
  const summary = cleanText(item.summary || item.shortDescription || item.excerpt || '') || truncate(description, 180)

  const slugBase = feed.slugPrefix ? `${feed.slugPrefix}-${title}` : title
  const slug = slugify(slugBase)

  const eventUrl =
    resolveUrl(item.eventUrl || item.url || item.link, feed) ||
    resolveUrl(feed.eventUrl, feed) ||
    resolveUrl(feed.sourceUrl, feed) ||
    resolveUrl(feed.url, feed)

  const icsUrl = item.icsUrl
    ? resolveUrl(item.icsUrl, feed)
    : feed.type === 'ics'
      ? resolveUrl(feed.url, feed)
      : ''

  const lat = parseFloat(item.lat || item.latitude || (item.geo && (item.geo.lat || item.geo.latitude)))
  const lng = parseFloat(item.lng || item.longitude || (item.geo && (item.geo.lng || item.geo.lon || item.geo.longitude)))

  const locationName = cleanText(
    item.locationName || item.location || item.venue || item.place || feed.locationName || ''
  )

  const address = cleanText(
    item.address ||
      item.address1 ||
      item.address_1 ||
      item.fullAddress ||
      [item.addressLine1, item.addressLine2, item.city, item.region]
        .filter(Boolean)
        .join(' ') ||
      locationName
  )

  const town = cleanText(item.town || item.city || feed.town || '')
  const subAreaRaw = cleanText(item.subArea || item.subarea || item.neighbourhood || '')
  const subArea =
    subAreaRaw && town && subAreaRaw.toLowerCase() === town.toLowerCase() ? '' : subAreaRaw

  const slugBase = feed.slugPrefix ? `${feed.slugPrefix}-${title}` : title
  const slugDate = formatDateForSlug(start)
  const slugParts = [slugDate, feed.slugPrefix ? slugify(feed.slugPrefix) : '', slugify(title), slugify(town)]
    .filter(Boolean)
    .join('-')
  const fallbackSlugParts = [slugify(title), slugify(town), slugDate, slugify(feed.id || '')]
    .filter(Boolean)
    .join('-')
  const slug =
    slugify(slugParts) || slugify(fallbackSlugParts) || slugify(`${slugBase}-${slugDate}`) || slugify(slugBase)

  const sourceInfo = resolveSourceInfo(item, feed, eventUrl)

  const badges = mergeUnique(
    [],
    Array.isArray(feed.badges) ? feed.badges : [],
    Array.isArray(item.badges) ? item.badges : []
  )

  const qaTags = mergeUnique(
    [],
    Array.isArray(feed.qaTags) ? feed.qaTags : [],
    Array.isArray(item.qaTags) ? item.qaTags : []
  )

  const priceNote = cleanText(
    item.priceNote ||
      item.costDescription ||
      (typeof item.cost === 'string' ? item.cost : '') ||
      feed.priceNote ||
      ''
  )

  const priceType =
    item.priceType ||
    feed.priceType ||
    (item.cost === 0 || /free/i.test(String(item.cost || '')) ? 'Free' : feed.priceType || 'Paid')

  const organizerName = cleanText(item.organizerName || item.organizer || feed.organizerName || '')
  const organizerUrl = resolveUrl(item.organizerUrl || feed.organizerUrl || '', feed)

  const image =
    resolveUrl(
      (item.image && (item.image.url || item.image.src || item.image)) ||
        item.featuredImage ||
        item.featured_image ||
        '',
      feed
    ) || (feed.image ? resolveUrl(feed.image, feed) : '')

  let category = ''
  if (typeof item.category === 'string' && item.category) {
    category = item.category
  } else if (Array.isArray(item.categories)) {
    const primaryCategory = item.categories.find((entry) => entry && (entry.name || entry.title))
    if (primaryCategory) {
      category = primaryCategory.name || primaryCategory.title || ''
    }
  }
  if (!category && feed.category) {
    category = feed.category
  }
  category = cleanText(category) || 'Other'

  const event = {
    title,
    slug,
    startDate: start,
    endDate: end || start,
    allDay: Boolean(item.allDay || item.allday || item.isAllDay || feed.allDay),
    recurrence: typeof item.rrule === 'string' ? item.rrule : feed.recurrence || '',
    category: category || 'Other',
    town: town || 'Toronto-adjacent',
    subArea,
    locationName,
    address,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    priceType,
    priceNote,
    badges,
    qaTags,
    image: image || '',
    summary,
    description,
    organizerName,
    organizerUrl,
    eventUrl,
    icsUrl,
    featured: false,
    status: 'pending',
    source: 'feed',
    sourceName: sourceInfo.name,
    sourceUrl: sourceInfo.url,
    sourceDomain: sourceInfo.domain,
    sourcePriority: Number.isFinite(feed.priority) ? feed.priority : DEFAULT_PRIORITY,
    sourceRef: buildSourceRef(item, feed),
    updatedAt: new Date().toISOString(),
  }

  if (!event.sourceRef) {
    event.sourceRef = `${feed.id || slug}-${event.startDate}`
  }

  return event
}

function resolveSourceInfo(item, feed, fallbackUrl) {
  const rawUrl = item.sourceUrl || feed.sourceUrl || fallbackUrl || feed.url || ''
  const url = resolveUrl(rawUrl, feed)
  const domain = cleanText(item.sourceDomain || feed.sourceDomain || deriveDomain(url) || deriveDomain(feed.url))
  const name = cleanText(item.sourceName || feed.sourceName || (domain || feed.organizerName || ''))
  return {
    url,
    domain,
    name: name || domain || 'Feed',
  }
}

function extractDate(value) {
  if (!value) return ''
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString()
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return ''
    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
    if (/^\d{8}T\d{6}Z?$/.test(trimmed)) {
      const iso = trimmed.endsWith('Z') ? trimmed : `${trimmed}Z`
      const fallback = new Date(iso)
      if (!Number.isNaN(fallback.getTime())) {
        return fallback.toISOString()
      }
    }
  }
  if (value?.toJSDate) {
    const jsDate = value.toJSDate()
    if (jsDate instanceof Date && !Number.isNaN(jsDate.getTime())) {
      return jsDate.toISOString()
    }
  }
  return ''
}

function buildSourceRef(item, feed) {
  if (item.uid) return String(item.uid)
  if (item.id) return String(item.id)
  if (item.guid && item.guid._) return String(item.guid._)
  if (item.guid) return String(item.guid)
  if (item['@id']) return String(item['@id'])
  return `${feed.id || feed.url}-${cleanText(item.title || item.summary || 'event')}`
}

async function upsertEvent(event, existing, dirPath) {
  let targetSlug = event.slug
  const existingBySource = existing.bySourceRef.get(event.sourceRef)

  if (existingBySource) {
    targetSlug = existingBySource.slug || targetSlug
    event.status = existingBySource.status === 'archived' ? 'archived' : 'pending'
    event.featured = Boolean(existingBySource.featured)
  }

  const dedupKey = buildDedupKey(event)
  const existingByDedup = dedupKey ? existing.byDedupKey.get(dedupKey) : null

  if (existingByDedup && (!existingBySource || existingBySource.slug !== existingByDedup.slug)) {
    const existingPriority = Number(existingByDedup.sourcePriority ?? DEFAULT_PRIORITY)
    const incomingPriority = Number(event.sourcePriority ?? DEFAULT_PRIORITY)

    if (incomingPriority < existingPriority) {
      targetSlug = existingByDedup.slug || targetSlug
    } else {
      console.log(`[ingest-events] Duplicate detected "${event.title}" — keeping ${existingByDedup.slug}`)
      return 'duplicate'
    }
  } else if (!existingBySource && existing.bySlug.has(targetSlug)) {
    let counter = 2
    while (existing.bySlug.has(`${targetSlug}-${counter}`)) counter += 1
    targetSlug = `${targetSlug}-${counter}`
  }

  event.slug = targetSlug

  const filePath = path.join(dirPath, `${targetSlug}.json`)
  fs.writeFileSync(filePath, `${JSON.stringify(event, null, 2)}\n`, 'utf8')

  existing.bySlug.set(targetSlug, event)
  existing.bySourceRef.set(event.sourceRef, event)
  if (dedupKey) {
    const current = existing.byDedupKey.get(dedupKey)
    if (!current) {
      existing.byDedupKey.set(dedupKey, event)
    } else {
      const currentPriority = Number(current.sourcePriority ?? DEFAULT_PRIORITY)
      const incomingPriority = Number(event.sourcePriority ?? DEFAULT_PRIORITY)
      if (incomingPriority <= currentPriority) {
        existing.byDedupKey.set(dedupKey, event)
      }
    }
  }

  return existingBySource ? 'updated' : 'created'
}

function buildDedupKey(event) {
  if (!event) return ''
  const title = cleanText(event.title)
  const dateKey = toDateKey(event.startDate)
  if (!title || !dateKey) return ''
  const venue = cleanText(event.locationName || event.address)
  const town = cleanText(event.town)
  return [title.toLowerCase(), dateKey, venue.toLowerCase(), town.toLowerCase()]
    .filter(Boolean)
    .join('::')
}

function toDateKey(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function formatDateForSlug(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  const day = `${date.getUTCDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function cleanText(value) {
  if (!value) return ''
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text, length) {
  if (!text) return ''
  if (text.length <= length) return text
  return `${text.slice(0, length - 1).trim()}…`
}

function deriveDomain(url) {
  if (!url) return ''
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch (error) {
    return ''
  }
}

function mergeUnique(initial = [], ...collections) {
  const set = new Set()
  initial.filter(Boolean).forEach((value) => set.add(String(value)))
  for (const collection of collections) {
    if (!collection) continue
    for (const item of collection) {
      if (!item) continue
      set.add(String(item))
    }
  }
  return Array.from(set)
}

function pruneExistingEvents(registry, dirPath, now = RUN_TIMESTAMP) {
  if (!registry || !dirPath || !registry.bySlug) return 0
  let removed = 0
  const entries = Array.from(registry.bySlug.entries())

  for (const [slug, event] of entries) {
    const disqualifier = getDisqualifier(event, now)
    if (!disqualifier) continue

    const filePath = path.join(dirPath, `${slug}.json`)
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      registry.bySlug.delete(slug)
      if (event?.sourceRef) {
        registry.bySourceRef.delete(event.sourceRef)
      }
      const dedupKey = buildDedupKey(event)
      if (dedupKey) {
        registry.byDedupKey.delete(dedupKey)
      }
      removed += 1
      console.log(`[ingest-events] Pruned ${slug}: ${disqualifier}`)
    } catch (error) {
      console.warn(`[ingest-events] Failed to prune ${slug}: ${error.message}`)
    }
  }

  return removed
}

function getDisqualifier(event, now = RUN_TIMESTAMP, options = {}) {
  if (!event || typeof event !== 'object') return 'invalid event payload'

  const { gracePeriodMs = EXPIRED_GRACE_MS, respectManual = true } = options

  const tagSet = new Set(
    Array.isArray(event.qaTags)
      ? event.qaTags.map((tag) => String(tag).toLowerCase()).filter(Boolean)
      : []
  )

  if (respectManual && (isManualEvent(event) || tagSet.has('editorial'))) {
    return null
  }

  if (
    tagSet.has('always-include') ||
    tagSet.has('allow-recurring') ||
    tagSet.has('allowrecurring') ||
    tagSet.has('keep-recurring')
  ) {
    return null
  }

  const start = parseDateValue(event.startDate)
  if (!start) return 'missing start date'
  const end = parseDateValue(event.endDate) || start
  const text = buildEventText(event)
  const nextRecurrenceStart = getNextRecurrenceStart(event, now)
  const endWithGrace = new Date(end.getTime() + gracePeriodMs)

  if (!nextRecurrenceStart && endWithGrace.getTime() < now.getTime()) {
    return 'event has already ended'
  }

  if (!text || isMarketEvent(event, text)) {
    return null
  }

  const hasClass = hasClassKeyword(text)
  if (!hasClass) {
    return null
  }

  const recurrence = typeof event.recurrence === 'string' ? event.recurrence.toUpperCase() : ''

  if (/FREQ=(DAILY|WEEKLY)/.test(recurrence)) {
    return 'recurring program excluded'
  }

  if (hasOngoingHint(text)) {
    return 'ongoing program excluded'
  }

  if (nextRecurrenceStart && /FREQ=(MONTHLY|YEARLY)/.test(recurrence) && hasOngoingHint(text)) {
    return 'ongoing program excluded'
  }

  const durationDays = Math.ceil(Math.max(0, end.getTime() - start.getTime()) / MS_IN_DAY)
  if (durationDays >= 7) {
    return 'multi-week program excluded'
  }

  return null
}

function parseDateValue(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isManualEvent(event) {
  return event?.source === 'manual'
}

function isMarketEvent(event, text) {
  if (event?.category === 'Markets') return true
  const label = typeof text === 'string' ? text : buildEventText(event)
  return /market|bazaar/.test(label || '')
}

function buildEventText(event) {
  const parts = []
  if (event?.title) parts.push(String(event.title))
  if (event?.summary) parts.push(String(event.summary))
  if (event?.description) parts.push(String(event.description))
  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function hasClassKeyword(text) {
  if (!text) return false
  return CLASS_KEYWORD_PATTERNS.some((pattern) => pattern.test(text))
}

function hasOngoingHint(text) {
  if (!text) return false
  return ONGOING_HINT_PATTERNS.some((pattern) => pattern.test(text))
}

function getNextRecurrenceStart(event, now) {
  if (!event?.recurrence) return null
  const start = parseDateValue(event.startDate)
  if (!start) return null
  try {
    const options = RRule.parseString(event.recurrence)
    options.dtstart = start
    const rule = new RRule(options)
    return rule.after(now, true)
  } catch (error) {
    return null
  }
}

function getHostname(url) {
  try {
    return new URL(url).hostname
  } catch (error) {
    return 'unknown'
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((error) => {
  console.error('[ingest-events] Fatal error', error)
  process.exitCode = 1
})

