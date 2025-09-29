#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { DateTime } from 'luxon'

const require = createRequire(import.meta.url)
const Parser = require('rss-parser')
const ical = require('node-ical')
const { getAdapter } = require('../lib/event-source-adapters.js')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const configPath = path.join(rootDir, 'config', 'event-feeds.json')
const eventsDir = path.join(rootDir, 'public', 'data', 'events')
const summaryPath = path.join(eventsDir, '_sync-summary.json')

const DEFAULT_USER_AGENT = 'NorthSideGTA-EventBot/1.0 (+https://www.northsidegta.ca/community)'
const DEFAULT_PRIORITY = 50
const parser = new Parser()

async function main() {
  const feeds = await loadConfig(configPath)
  if (!feeds.length) {
    console.log('Created: 0, Updated: 0, Unchanged: 0, Errors: 0')
    console.log('SYNC_SUMMARY created=0 updated=0 unchanged=0 errors=0')
    return
  }

  await fs.mkdir(eventsDir, { recursive: true })
  const existing = await loadExistingEvents(eventsDir)
  const now = new Date()
  const summary = { created: 0, updated: 0, unchanged: 0, errors: 0 }

  for (const feed of feeds) {
    if (!feed || feed.enabled === false) continue
    try {
      const items = await fetchFeed(feed)
      if (!Array.isArray(items) || !items.length) continue

      const dedupe = new Map()

      for (const item of items) {
        try {
          const normalized = normalizeEvent(item, feed, now)
          if (!normalized) continue
          const dedupKey = buildDedupKey(normalized)
          if (dedupKey) {
            if (dedupe.has(dedupKey)) continue
            dedupe.set(dedupKey, true)
          }

          const result = await mergeEvent(normalized, existing, now)
          summary[result] = (summary[result] || 0) + 1
        } catch (error) {
          summary.errors += 1
          console.warn(`[sync-events] Failed to normalize entry for feed ${feed.id || feed.url}:`, error.message)
        }
      }
    } catch (error) {
      summary.errors += 1
      console.warn(`[sync-events] Failed to process feed ${feed.id || feed.url}:`, error.message)
    }
  }

  const totalChanged = summary.created + summary.updated + summary.errors

  if (totalChanged > 0) {
    const totalAfter = await fs
      .readdir(eventsDir)
      .then((list) =>
        list.filter((name) => name.endsWith('.json') && name !== '_sync-summary.json').length
      )
      .catch(() => 0)

    const payload = {
      lastChangeAt: DateTime.fromJSDate(now)
        .setZone('America/Toronto')
        .toISO(),
      created: summary.created,
      updated: summary.updated,
      unchanged: summary.unchanged,
      errors: summary.errors,
      totalAfter,
    }

    await fs.writeFile(summaryPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  }

  console.log(
    `Created: ${summary.created}, Updated: ${summary.updated}, Unchanged: ${summary.unchanged}, Errors: ${summary.errors}`
  )
  console.log(
    `SYNC_SUMMARY created=${summary.created} updated=${summary.updated} unchanged=${summary.unchanged} errors=${summary.errors}`
  )
}

async function loadConfig(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('[sync-events] Failed to read config:', error.message)
    }
    return []
  }
}

async function loadExistingEvents(dirPath) {
  const bySlug = new Map()
  const bySourceId = new Map()

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue
      const filePath = path.join(dirPath, entry.name)
      try {
        const raw = await fs.readFile(filePath, 'utf8')
        const data = JSON.parse(raw)
        if (!data || typeof data !== 'object') continue
        const slug = typeof data.slug === 'string' ? data.slug : entry.name.replace(/\.json$/i, '')
        const sourceId = getSourceId(data)
        bySlug.set(slug, { data, filePath })
        if (sourceId) {
          bySourceId.set(sourceId, { data, filePath })
        }
      } catch (error) {
        console.warn(`[sync-events] Failed to parse existing event ${entry.name}:`, error.message)
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('[sync-events] Failed to read events directory:', error.message)
    }
  }

  return { bySlug, bySourceId }
}

function getSourceId(event) {
  if (!event || typeof event !== 'object') return ''
  if (event.source && typeof event.source === 'object' && typeof event.source.id === 'string') {
    return event.source.id
  }
  if (typeof event.sourceRef === 'string' && event.sourceRef) return event.sourceRef
  if (typeof event.id === 'string' && event.id) return event.id
  return ''
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

  const requestInit = buildRequestInit(feed, init)
  if (accept && !requestInit.headers.Accept && !requestInit.headers.accept) {
    requestInit.headers.Accept = accept
  }

  const response = await fetch(absolute, requestInit)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.text()
}

async function fetchJson(url, feed, init = {}) {
  const absolute = resolveUrl(url, feed)
  if (!absolute) return null
  const requestInit = buildRequestInit(feed, init)
  if (!requestInit.headers.Accept && !requestInit.headers.accept) {
    requestInit.headers.Accept = 'application/json, text/javascript;q=0.9, */*;q=0.1'
  }
  const response = await fetch(absolute, requestInit)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

function buildRequestInit(feed, init = {}) {
  const headers = { ...(feed?.headers || {}), ...(init.headers || {}) }
  if (!('User-Agent' in headers) && !('user-agent' in headers)) {
    headers['User-Agent'] = DEFAULT_USER_AGENT
  }
  if (feed?.referer && !('Referer' in headers) && !('referer' in headers)) {
    headers.Referer = feed.referer
  }
  return { ...init, headers }
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

function normalizeEvent(item, feed, now) {
  if (!item) return null

  const start = extractDate(item.start || item.startDate || item.start_date || item.dtstart || item.begin)
  if (!start) return null
  const end = extractDate(item.end || item.endDate || item.end_date || item.dtend) || start

  const title = cleanText(
    item.title ||
      item.summary ||
      item.name ||
      (item.description ? truncate(cleanText(item.description), 80) : '')
  )
  if (!title) return null

  const description = cleanText(item.description || item.content || item.body || item.details || '')
  const summary =
    cleanText(item.summary || item.shortDescription || item.excerpt || '') || truncate(description, 180)

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
      [item.addressLine1, item.addressLine2, item.city, item.region].filter(Boolean).join(' ') ||
      locationName
  )

  const town = cleanText(item.town || item.city || feed.town || '') || 'Toronto-adjacent'
  const subAreaRaw = cleanText(item.subArea || item.subarea || item.neighbourhood || '')
  const subArea =
    subAreaRaw && town && subAreaRaw.toLowerCase() === town.toLowerCase() ? '' : subAreaRaw

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

  const sourceRef = buildSourceRef(item, feed, start, title)
  const sourceName = cleanText(item.sourceName || feed.sourceName || '') || deriveDomain(eventUrl) || 'Feed'
  const sourceId = sourceRef || `${feed.id || slugify(title)}-${start}`

  const slugDate = formatDateForSlug(start)
  const slugBase = `${sourceName.toLowerCase()}:${sourceId}-${slugDate}`
  const slug = makeFileSafeSlug(slugBase)

  return {
    id: sourceId,
    slug,
    title,
    summary,
    description,
    startDate: start,
    endDate: end || null,
    allDay: Boolean(item.allDay || item.allday || item.isAllDay || feed.allDay),
    recurrence: typeof item.rrule === 'string' ? item.rrule : feed.recurrence || '',
    category,
    town,
    subArea,
    location: { city: town || '', venue: locationName || '' },
    locationName,
    address,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    priceType,
    priceNote,
    badges,
    qaTags,
    image: image || '',
    organizerName,
    organizerUrl,
    url: eventUrl,
    eventUrl,
    icsUrl,
    source: { name: sourceName, id: sourceId },
    sourceName,
    sourceUrl: resolveUrl(item.sourceUrl || feed.sourceUrl || eventUrl, feed),
    sourceDomain: deriveDomain(eventUrl) || cleanText(item.sourceDomain || feed.sourceDomain || ''),
    sourcePriority: Number.isFinite(feed.priority) ? feed.priority : DEFAULT_PRIORITY,
    sourceRef,
    lastSyncedAt: new Date(now).toISOString(),
  }
}

function buildSourceRef(item, feed, start, title) {
  if (item?.uid) return String(item.uid)
  if (item?.id) return String(item.id)
  if (item?.guid && item.guid._) return String(item.guid._)
  if (item?.guid) return String(item.guid)
  if (item?.url) return String(item.url)
  if (item?.link) return String(item.link)
  const dateKey = formatDateForSlug(start || '')
  const titleKey = slugify(title || '')
  if (feed?.id) return `${feed.id}-${titleKey}-${dateKey}`
  if (titleKey || dateKey) return `${titleKey || 'event'}-${dateKey}`
  return ''
}

function mergeUnique(initial = [], ...collections) {
  const set = new Set()
  for (const value of initial || []) {
    if (value) set.add(String(value))
  }
  for (const collection of collections) {
    if (!collection) continue
    for (const entry of collection) {
      if (!entry) continue
      set.add(String(entry))
    }
  }
  return Array.from(set)
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

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function formatDateForSlug(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'unknown'
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${byType.year || '0000'}${(byType.month || '00').padStart(2, '0')}${(byType.day || '00').padStart(2, '0')}`
}

function makeFileSafeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildDedupKey(event) {
  if (!event) return ''
  const title = cleanText(event.title)
  const dateKey = formatDateForSlug(event.startDate)
  if (!title || !dateKey) return ''
  const venue = cleanText(event.locationName || (event.location && event.location.venue) || '')
  return [title.toLowerCase(), dateKey, venue.toLowerCase()].filter(Boolean).join('::')
}

const KEY_ORDER = [
  'id',
  'slug',
  'title',
  'summary',
  'description',
  'startDate',
  'endDate',
  'allDay',
  'recurrence',
  'category',
  'town',
  'subArea',
  'location',
  'locationName',
  'address',
  'lat',
  'lng',
  'priceType',
  'priceNote',
  'badges',
  'qaTags',
  'image',
  'organizerName',
  'organizerUrl',
  'url',
  'eventUrl',
  'icsUrl',
  'status',
  'hidden',
  'archived',
  'notes',
  'source',
  'sourceName',
  'sourceUrl',
  'sourceDomain',
  'sourcePriority',
  'sourceRef',
  'lastSyncedAt',
  'firstSeenAt',
  'updatedAt',
]

async function mergeEvent(event, existingMaps, now) {
  const { bySlug, bySourceId } = existingMaps
  const sourceId = event.source?.id || event.sourceRef || event.id
  const existingEntry =
    bySlug.get(event.slug) ||
    (sourceId ? bySourceId.get(sourceId) : null)

  const preserved = existingEntry?.data || {}
  const isUpdate = Boolean(existingEntry)
  const status = typeof preserved.status === 'string' ? preserved.status : 'pending'
  const hidden = Boolean(preserved.hidden)
  const archived = Boolean(preserved.archived)
  const notes = preserved.notes !== undefined ? preserved.notes : ''
  const preservedFirstSeen =
    typeof preserved.firstSeenAt === 'string' && preserved.firstSeenAt ? preserved.firstSeenAt : null
  const firstSeenAt = preservedFirstSeen || (!isUpdate ? new Date(now).toISOString() : null)

  const filePath = path.join(eventsDir, `${event.slug}.json`)

  let existingContent = ''
  try {
    existingContent = await fs.readFile(filePath, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }

  const baseMerged = {
    ...preserved,
    ...event,
    status,
    hidden,
    archived,
    notes,
    ...(firstSeenAt ? { firstSeenAt } : {}),
  }

  const previousComparable = JSON.stringify(orderKeys(stripSyncTimestamps(preserved)))
  const nextComparable = JSON.stringify(orderKeys(stripSyncTimestamps(baseMerged)))

  if (previousComparable === nextComparable && (isUpdate || existingContent)) {
    const entryFilePath = existingEntry?.filePath || filePath
    const entry = existingEntry || { data: preserved, filePath: entryFilePath }
    bySlug.set(event.slug, entry)
    if (sourceId) bySourceId.set(sourceId, entry)
    return 'unchanged'
  }

  const timestamp = new Date(now).toISOString()
  const merged = {
    ...baseMerged,
    lastSyncedAt: timestamp,
    updatedAt: timestamp,
  }

  const ordered = orderKeys(merged)
  const serialized = `${JSON.stringify(ordered, null, 2)}\n`

  if (existingContent === serialized) {
    const entry = { data: merged, filePath }
    bySlug.set(event.slug, entry)
    if (sourceId) bySourceId.set(sourceId, entry)
    return 'unchanged'
  }

  await fs.writeFile(filePath, serialized, 'utf8')
  const entry = { data: merged, filePath }
  bySlug.set(event.slug, entry)
  if (sourceId) bySourceId.set(sourceId, entry)

  if (isUpdate || existingContent) return 'updated'
  return 'created'
}

function orderKeys(event) {
  const ordered = {}
  for (const key of KEY_ORDER) {
    if (event[key] !== undefined) {
      ordered[key] = event[key]
    }
  }
  for (const key of Object.keys(event)) {
    if (!(key in ordered)) {
      ordered[key] = event[key]
    }
  }
  return ordered
}

function stripSyncTimestamps(event) {
  if (!event || typeof event !== 'object') return {}
  const clone = { ...event }
  delete clone.lastSyncedAt
  delete clone.updatedAt
  return clone
}

main().catch((error) => {
  console.error('[sync-events] Fatal error', error)
  console.log('Created: 0, Updated: 0, Unchanged: 0, Errors: 1')
  console.log('SYNC_SUMMARY created=0 updated=0 unchanged=0 errors=1')
  process.exitCode = 1
})
