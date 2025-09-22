#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const Parser = require('rss-parser')
const ical = require('node-ical')

const rootDir = path.resolve(__dirname, '..')
const configPath = path.join(rootDir, 'config', 'event-feeds.json')
const eventsDir = path.join(rootDir, 'public', 'data', 'events')
const parser = new Parser()

async function main() {
  const feeds = loadConfig(configPath)
  if (!feeds.length) {
    console.log('[ingest-events] No feeds configured — exiting')
    return
  }

  ensureDir(eventsDir)

  const existing = loadExistingEvents(eventsDir)
  const summary = { created: 0, updated: 0, skipped: 0, failed: 0 }

  for (const feed of feeds) {
    if (feed.enabled === false) {
      summary.skipped += 1
      continue
    }

    try {
      const items = await fetchFeed(feed)
      for (const item of items) {
        const normalized = normalizeEvent(item, feed)
        if (!normalized) {
          summary.skipped += 1
          continue
        }

        const result = await upsertEvent(normalized, existing, eventsDir)
        summary[result] += 1
      }
    } catch (error) {
      summary.failed += 1
      console.warn(`[ingest-events] Failed to process feed ${feed.id || feed.url}:`, error.message)
    }
  }

  console.log(
    `[ingest-events] Created ${summary.created}, updated ${summary.updated}, skipped ${summary.skipped}, failed ${summary.failed}`
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

  if (!fs.existsSync(dirPath)) return { bySlug, bySourceRef }

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
    } catch (error) {
      console.warn('[ingest-events] Skipping malformed event', file)
    }
  }

  return { bySlug, bySourceRef }
}

async function fetchFeed(feed) {
  if (!feed || !feed.url) return []
  const type = (feed.type || 'rss').toLowerCase()
  if (type === 'rss') {
    const response = await parser.parseURL(feed.url)
    return Array.isArray(response.items) ? response.items : []
  }
  if (type === 'json') {
    const response = await fetch(feed.url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (Array.isArray(data)) return data
    if (Array.isArray(data.items)) return data.items
    return []
  }
  if (type === 'ics') {
    const events = await ical.async.fromURL(feed.url)
    return Object.values(events).filter((entry) => entry.type === 'VEVENT')
  }
  return []
}

function normalizeEvent(item, feed) {
  if (!item) return null
  const start = extractDate(item.start || item.startDate || item.dtstart || item.begin)
  if (!start) return null
  const end = extractDate(item.end || item.endDate || item.dtend)
  const title = cleanText(item.summary || item.title || item.name)
  if (!title) return null

  const description = cleanText(item.description || item.content || item.body || '')
  const summary = truncate(cleanText(item.summary || item.title || description), 180)
  const location = item.location || item.venue || ''
  const address = cleanText(item.address || location)
  const lat = parseFloat(item.lat || item.latitude || (item.geo && item.geo.lat))
  const lng = parseFloat(item.lng || item.longitude || (item.geo && item.geo.lon))

  const slugBase = feed.slugPrefix ? `${feed.slugPrefix}-${title}` : title
  const slug = slugify(slugBase)

  const priceType = feed.priceType || (item.cost === 0 || /free/i.test(item.cost) ? 'Free' : 'Paid')

  const event = {
    title,
    slug,
    startDate: start,
    endDate: end || start,
    allDay: Boolean(item.allDay || item.allday || feed.allDay),
    recurrence: typeof item.rrule === 'string' ? item.rrule : feed.recurrence || '',
    category: feed.category || 'Other',
    town: feed.town || 'Toronto-adjacent',
    locationName: cleanText(item.locationName || item.location || feed.locationName || ''),
    address,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    priceType,
    priceNote: cleanText(item.priceNote || item.costDescription || feed.priceNote || ''),
    badges: Array.isArray(feed.badges) ? feed.badges : [],
    image: item.image?.url || item.image || feed.image || '',
    summary,
    description,
    organizerName: cleanText(item.organizer || feed.organizerName || ''),
    organizerUrl: item.organizerUrl || feed.organizerUrl || '',
    eventUrl: item.url || item.link || feed.eventUrl || feed.url,
    icsUrl: feed.type === 'ics' ? feed.url : '',
    featured: false,
    status: 'pending',
    source: 'feed',
    sourceRef: buildSourceRef(item, feed),
    updatedAt: new Date().toISOString(),
  }

  if (!event.sourceRef) {
    event.sourceRef = `${feed.id || slug}-${event.startDate}`
  }

  return event
}

function extractDate(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (value?.toJSDate) {
    return value.toJSDate().toISOString()
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
  } else if (existing.bySlug.has(targetSlug)) {
    let counter = 2
    while (existing.bySlug.has(`${targetSlug}-${counter}`)) counter += 1
    targetSlug = `${targetSlug}-${counter}`
  }

  event.slug = targetSlug

  const filePath = path.join(dirPath, `${targetSlug}.json`)
  const pretty = JSON.stringify(event, null, 2)
  fs.writeFileSync(filePath, `${pretty}\n`, 'utf8')

  existing.bySlug.set(targetSlug, event)
  existing.bySourceRef.set(event.sourceRef, event)

  return existingBySource ? 'updated' : 'created'
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function cleanText(value) {
  if (!value) return ''
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text, length) {
  if (!text) return ''
  if (text.length <= length) return text
  return `${text.slice(0, length - 1).trim()}…`
}

main().catch((error) => {
  console.error('[ingest-events] Fatal error', error)
  process.exitCode = 1
})
