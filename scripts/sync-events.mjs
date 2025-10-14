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
const { expandIcsEvents } = require('../lib/events/ics.js')
const { normalizeCmsEvent } = require('../lib/events/cms-normalizer.js')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const configPath = path.join(rootDir, 'config', 'event-feeds.json')
const eventsDir = path.join(rootDir, 'public', 'data', 'events')
const summaryPath = path.join(eventsDir, '_sync-summary.json')
const reportsDir = path.join(rootDir, 'public', 'data', 'sync-reports')
const urlUpdateLogPath = path.join(rootDir, 'logs', 'events-url-updates.log')

const DEFAULT_USER_AGENT = 'NorthSideGTA-EventBot/1.0 (+https://www.northsidegta.ca/community)'
const DEFAULT_PRIORITY = 50
const DEFAULT_TIMEOUT_MS = 15000
const DEFAULT_RETRY_ATTEMPTS = 3
const DEFAULT_RETRY_DELAY_MS = 400
const MAX_RETRY_DELAY_MS = 5000
const parser = new Parser()
const WRITE_MODE = process.env.EVENTS_SYNC_WRITE === 'true'

async function main() {
  const { feeds: loadedFeeds } = await loadConfig(configPath)
  const allFeeds = Array.isArray(loadedFeeds) ? [...loadedFeeds] : []
  const singleFeed = (process.env.EVENTS_SYNC_FEED || '').trim()
  const feeds = singleFeed
    ? allFeeds.filter((feed) => {
        if (!feed) return false
        if (typeof feed.id === 'string' && feed.id === singleFeed) return true
        if (typeof feed.url === 'string' && feed.url === singleFeed) return true
        return false
      })
    : allFeeds
  if (!feeds.length) {
    console.log('Created: 0, Updated: 0, Unchanged: 0, Errors: 0')
    console.log('SYNC_SUMMARY created=0 updated=0 unchanged=0 errors=0')
    return
  }

  if (WRITE_MODE) {
    await fs.mkdir(eventsDir, { recursive: true })
    await fs.mkdir(reportsDir, { recursive: true }).catch(() => {})
  }
  const existing = await loadExistingEvents(eventsDir)
  const now = new Date()
  const summary = { created: 0, updated: 0, unchanged: 0, errors: 0 }
  const feedReports = []
  const syncState = { configChanged: false, urlUpdates: [], fallbacks: [] }

  for (const feed of feeds) {
    if (!feed || feed.enabled === false) continue
    const feedReport = createFeedReport(feed)
    feedReports.push(feedReport)
    const startedAt = Date.now()
    feedReport.startedAt = new Date().toISOString()

    try {
      const items = await fetchFeed(feed, feedReport, syncState, now)
      const payload = Array.isArray(items) ? items : []
      feedReport.itemsFetched = payload.length
      if (!payload.length) {
        feedReport.status = feedReport.status === 'error' ? 'error' : 'empty'
        continue
      }

      const dedupe = new Map()

      for (const item of payload) {
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
          if (result in feedReport) {
            feedReport[result] += 1
          }
        } catch (error) {
          summary.errors += 1
          feedReport.errors.push(error.message || String(error))
          feedReport.status = feedReport.status === 'error' ? 'error' : 'warning'
          console.warn(
            `[sync-events] Failed to normalize entry for feed ${feed.id || feed.url}:`,
            error.message
          )
        }
      }

      if (!feedReport.status || feedReport.status === 'pending') {
        if (feedReport.errors.length) {
          feedReport.status = feedReport.created + feedReport.updated + feedReport.unchanged > 0 ? 'warning' : 'error'
        } else if (feedReport.created + feedReport.updated + feedReport.unchanged === 0) {
          feedReport.status = 'empty'
        } else {
          feedReport.status = 'ok'
        }
      }
    } catch (error) {
      summary.errors += 1
      feedReport.errors.push(error.message || String(error))
      feedReport.status = 'error'
      console.warn(`[sync-events] Failed to process feed ${feed.id || feed.url}:`, error.message)
    } finally {
      feedReport.finishedAt = new Date().toISOString()
      feedReport.durationMs = Date.now() - startedAt
    }
  }

  if (WRITE_MODE) {
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

  if (WRITE_MODE && syncState.configChanged) {
    await persistConfigUpdates(configPath, allFeeds)
    await writeUrlUpdateLog(syncState.urlUpdates)
  }

  if (WRITE_MODE) {
    await writeSyncReports(
      reportsDir,
      now,
      summary,
      feedReports,
      syncState.urlUpdates,
      syncState.fallbacks
    )
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
    return { feeds: Array.isArray(data) ? data : [], raw }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('[sync-events] Failed to read config:', error.message)
    }
    return { feeds: [], raw: '[]' }
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

async function fetchFeed(feed, feedReport, syncState, now) {
  if (!feed) return []

  try {
    if (feed.parser) {
      const adapter = getAdapter(feed.parser)
      if (!adapter) {
        throw new Error(`Unknown adapter ${feed.parser}`)
      }
      const context = createAdapterContext(feed, feedReport, syncState)
      const payload = await adapter(feed, context)
      return Array.isArray(payload) ? payload : []
    }

    const type = (feed.type || 'rss').toLowerCase()

    if (type === 'rss') {
      const xml = await fetchText(
        feed.url,
        feed,
        {},
        'application/rss+xml, application/xml;q=0.9, */*;q=0.1',
        { feedReport, state: syncState, persistResolvedUrl: true }
      )
      if (!xml) return []

      let response = null
      try {
        response = await parser.parseString(xml)
      } catch (error) {
        feedReport.errors.push(error.message || String(error))
        console.warn(`[sync-events] Failed to parse RSS feed ${feed.id || feed.url}:`, error.message)
        return []
      }

      return Array.isArray(response.items) ? response.items : []
    }

    if (type === 'json') {
      const data = await fetchJson(feed.url, feed, {}, {
        feedReport,
        state: syncState,
        persistResolvedUrl: true,
      })
      if (!data) return []
      if (Array.isArray(data)) return data
      if (Array.isArray(data.items)) return data.items
      if (Array.isArray(data.results)) return data.results
      return []
    }

    if (type === 'ics') {
      const vevents = await fetchIcs(feed, feedReport, syncState)
      return expandIcsEvents(vevents, feed, now)
    }

    if (type === 'html') {
      const adapter = getAdapter('simpleHtmlList')
      if (!adapter) return []
      const context = createAdapterContext(feed, feedReport, syncState)
      const payload = await adapter(feed, context)
      return Array.isArray(payload) ? payload : []
    }
  } catch (error) {
    feedReport.errors.push(error.message || String(error))
    feedReport.status = 'error'
    const fallback = await tryHtmlFallback(feed, feedReport, syncState)
    if (fallback.length) {
      return fallback
    }
    throw error
  }

  const fallback = await tryHtmlFallback(feed, feedReport, syncState)
  if (fallback.length) {
    return fallback
  }

  return []
}

async function fetchIcs(feed, feedReport, syncState) {
  const text = await fetchText(
    feed.url,
    feed,
    {},
    'text/calendar, application/octet-stream;q=0.8, */*;q=0.1',
    { feedReport, state: syncState, persistResolvedUrl: true }
  )
  const normalized = typeof text === 'string' ? text.trim() : ''
  if (!normalized) {
    throw new Error('ICS response was empty')
  }
  if (!/^BEGIN:VCALENDAR/i.test(normalized)) {
    throw new Error('ICS response did not contain a VCALENDAR payload')
  }

  try {
    const events = await ical.async.parseICS(normalized)
    return Object.values(events).filter((entry) => entry && entry.type === 'VEVENT')
  } catch (error) {
    const parseError = new Error(`ICS parse failed: ${error.message || error}`)
    parseError.cause = error
    throw parseError
  }
}

function createAdapterContext(feed, feedReport, syncState) {
  return {
    now: new Date(),
    resolveUrl: (value) => resolveUrl(value, feed),
    fetchJson: (url, init = {}) =>
      fetchJson(url, feed, init, { feedReport, state: syncState, persistResolvedUrl: false }),
    fetchText: (url, init = {}, accept) =>
      fetchText(url, feed, init, accept, { feedReport, state: syncState, persistResolvedUrl: false }),
    jsonHeaders: (localFeed) => buildHeaderObject(localFeed || feed, 'json'),
    htmlHeaders: (localFeed) => buildHeaderObject(localFeed || feed, 'html'),
    cleanText,
  }
}

async function tryHtmlFallback(feed, feedReport, syncState) {
  if (!feed || feed.__fallbackAttempted) return []
  feed.__fallbackAttempted = true

  const candidateUrl = feed.html?.url || feed.sourceUrl || ''
  if (!candidateUrl || resolveUrl(candidateUrl, feed) === resolveUrl(feed.url, feed)) {
    return []
  }

  const adapter = getAdapter('simpleHtmlList')
  if (!adapter) return []

  const fallbackFeed = {
    ...feed,
    type: 'html',
    url: candidateUrl,
    html: { ...(feed.html || {}), ...(feed.htmlFallback || {}) },
  }

  try {
    const context = createAdapterContext(fallbackFeed, feedReport, syncState)
    const payload = await adapter(fallbackFeed, context)
    if (Array.isArray(payload) && payload.length) {
      feedReport.fallbackUsed = true
      const resolvedFallbackUrl = resolveUrl(candidateUrl, feed)
      feedReport.fallbackUrl = resolvedFallbackUrl
      feedReport.fallbackPath = extractUrlPath(resolvedFallbackUrl) || extractUrlPath(candidateUrl)
      recordFallbackUsage(syncState, feed, resolvedFallbackUrl, feedReport.fallbackPath)
      feedReport.status = feedReport.status === 'error' ? 'warning' : feedReport.status
      return payload
    }
  } catch (error) {
    feedReport.errors.push(error.message || String(error))
  }

  return []
}

function recordFallbackUsage(state, feed, fallbackUrl, fallbackPath) {
  if (!state) return
  if (!Array.isArray(state.fallbacks)) {
    state.fallbacks = []
  }

  const entry = {
    id: feed?.id || '',
    originalUrl: feed?.url || '',
    fallbackUrl: fallbackUrl || '',
    fallbackPath: fallbackPath || '',
    usedAt: new Date().toISOString(),
  }

  const alreadyRecorded = state.fallbacks.some(
    (item) => item.id === entry.id && item.fallbackUrl === entry.fallbackUrl
  )

  if (!alreadyRecorded) {
    state.fallbacks.push(entry)
  }
}

function extractUrlPath(value) {
  if (!value) return ''
  if (typeof value !== 'string') {
    return ''
  }

  try {
    const base = value.startsWith('http://') || value.startsWith('https://') ? undefined : 'https://placeholder.local'
    const parsed = base ? new URL(value, base) : new URL(value)
    const path = parsed.pathname || ''
    const search = parsed.search || ''
    const combined = `${path}${search}`
    return combined || parsed.toString()
  } catch (error) {
    return value
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
  if (!('Accept-Language' in headers) && !('accept-language' in headers)) {
    headers['Accept-Language'] = 'en-CA,en;q=0.9'
  }
  if (!('Cache-Control' in headers) && !('cache-control' in headers)) {
    headers['Cache-Control'] = 'no-cache'
  }
  if (!('Pragma' in headers) && !('pragma' in headers)) {
    headers.Pragma = 'no-cache'
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

async function fetchText(url, feed, init = {}, accept, options = {}) {
  const absolute = resolveUrl(url, feed)
  if (!absolute) return ''

  const requestInit = buildRequestInit(feed, init)
  if (accept && !requestInit.headers.Accept && !requestInit.headers.accept) {
    requestInit.headers.Accept = accept
  }

  const attempted = new Set()
  let target = absolute

  while (target) {
    attempted.add(target)
    try {
      const response = await performFetchWithRetry(target, requestInit, feed, options)
      return response.text()
    } catch (error) {
      if (!shouldAttemptDiscovery(error, feed, options)) {
        throw error
      }
      const discovered = await attemptAutoDiscoverUrl(feed, target, error, requestInit, options)
      if (discovered && !attempted.has(discovered)) {
        target = discovered
        continue
      }
      throw error
    }
  }

  return ''
}

async function fetchJson(url, feed, init = {}, options = {}) {
  const absolute = resolveUrl(url, feed)
  if (!absolute) return null
  const requestInit = buildRequestInit(feed, init)
  if (!requestInit.headers.Accept && !requestInit.headers.accept) {
    requestInit.headers.Accept = 'application/json, text/javascript;q=0.9, */*;q=0.1'
  }

  const attempted = new Set()
  let target = absolute

  while (target) {
    attempted.add(target)
    try {
      const response = await performFetchWithRetry(target, requestInit, feed, options)
      const text = await response.text()
      if (!text) return null

      try {
        return JSON.parse(text)
      } catch (error) {
        console.warn(`[sync-events] Failed to parse JSON feed ${feed.id || feed.url}:`, error.message)
        return null
      }
    } catch (error) {
      if (!shouldAttemptDiscovery(error, feed, options)) {
        throw error
      }
      const discovered = await attemptAutoDiscoverUrl(feed, target, error, requestInit, options)
      if (discovered && !attempted.has(discovered)) {
        target = discovered
        continue
      }
      throw error
    }
  }

  return null
}

function shouldAttemptDiscovery(error, feed, options = {}) {
  if (!feed || feed.autoDiscover === false) return false
  if (options && options.allowDiscovery === false) return false
  const status = Number(error?.status || error?.response?.status)
  if (status === 404 || status === 410) return true
  if (status === 301 || status === 302 || status === 307 || status === 308) return true
  if (!Number.isFinite(status)) {
    const code = error?.code
    if (code && (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'EAI_AGAIN')) {
      return true
    }
  }
  return false
}

async function attemptAutoDiscoverUrl(feed, failingUrl, error, requestInit, options = {}) {
  const state = options.state || { urlUpdates: [] }
  const feedReport = options.feedReport
  const candidates = []

  const parsed = safeUrlParse(failingUrl)
  if (parsed) {
    const flipped = flipProtocol(parsed)
    if (flipped) {
      candidates.push({ url: flipped, hint: 'protocol-flip' })
    }
  }

  if (Array.isArray(feed?.alternateUrls)) {
    for (const candidate of feed.alternateUrls) {
      const resolved = resolveUrl(candidate, feed)
      if (resolved) {
        candidates.push({ url: resolved, hint: 'alternate' })
      }
    }
  }

  const discoveredFromSource = await discoverFromSourcePage(feed)
  if (discoveredFromSource) {
    candidates.push({ url: discoveredFromSource, hint: 'source-html' })
  }

  for (const candidate of candidates) {
    if (!candidate?.url || candidate.url === failingUrl) continue
    const probe = await probeCandidateUrl(candidate.url, feed, requestInit)
    if (!probe) continue

    persistUrlUpdate(
      feed,
      state,
      feedReport,
      failingUrl,
      probe.finalUrl,
      probe.status,
      candidate.hint || ''
    )
    return probe.finalUrl
  }

  return ''
}

function safeUrlParse(value) {
  if (!value) return null
  try {
    return new URL(value)
  } catch (error) {
    return null
  }
}

function flipProtocol(urlObj) {
  if (!urlObj) return ''
  if (urlObj.protocol === 'https:') {
    return `http:${urlObj.href.slice(urlObj.protocol.length)}`
  }
  if (urlObj.protocol === 'http:') {
    return `https:${urlObj.href.slice(urlObj.protocol.length)}`
  }
  return ''
}

async function discoverFromSourcePage(feed) {
  const sourceUrl = resolveUrl(feed?.sourceUrl || feed?.discoveryUrl, feed)
  if (!sourceUrl) return ''

  try {
    const response = await fetch(sourceUrl, {
      method: 'GET',
      headers: buildHeaderObject(feed, 'html'),
    })
    if (!response.ok) return ''
    const html = await response.text()
    const extracted = extractCalendarUrlFromHtml(html)
    return extracted ? resolveUrl(extracted, feed) : ''
  } catch (error) {
    return ''
  }
}

function extractCalendarUrlFromHtml(html) {
  if (!html) return ''
  const patterns = [
    /<link[^>]+rel=["']alternate["'][^>]+type=["']text\/calendar["'][^>]+href=["']([^"']+)["']/gi,
    /href=["']([^"']+Download\.ics[^"']*)["']/gi,
    /href=["']([^"']+\.ics[^"']*)["']/gi,
    /href=["']([^"']+ical=1[^"']*)["']/gi,
  ]

  for (const pattern of patterns) {
    pattern.lastIndex = 0
    const match = pattern.exec(html)
    if (match && match[1]) {
      return match[1]
    }
  }

  return ''
}

async function probeCandidateUrl(candidateUrl, feed, requestInit) {
  try {
    const init = {
      ...requestInit,
      headers: { ...(requestInit.headers || {}) },
      method: requestInit.method || 'GET',
      signal: undefined,
    }
    const response = await fetch(candidateUrl, init)
    if (!response.ok) {
      return null
    }
    if (response.body && typeof response.body.cancel === 'function') {
      try {
        response.body.cancel()
      } catch (error) {
        // ignore
      }
    }
    return { status: response.status, finalUrl: response.url || candidateUrl }
  } catch (error) {
    return null
  }
}

function persistUrlUpdate(feed, state, feedReport, previousUrl, nextUrl, status, hint) {
  if (!feed || !state) return false

  const normalizedNext = normalizeComparableUrl(nextUrl)
  const normalizedPrevious = normalizeComparableUrl(previousUrl || feed.url)

  if (!normalizedNext) return false
  if (urlsEqual(normalizedNext, normalizedPrevious)) return false
  if (hint === 'redirect' && feed.autoPersistRedirects === false) return false
  if (!/^https?:/i.test(normalizedNext)) return false

  const entry = {
    id: feed.id || '',
    previousUrl: normalizedPrevious || '',
    nextUrl: normalizedNext,
    status: Number.isFinite(status) ? status : 0,
    discoveredAt: new Date().toISOString(),
    hint: hint || '',
    protocolFlipped: hint === 'protocol-flip',
  }

  if (!Array.isArray(state.urlUpdates)) {
    state.urlUpdates = []
  }

  const alreadyRecorded = state.urlUpdates.some(
    (item) => urlsEqual(item.previousUrl, entry.previousUrl) && urlsEqual(item.nextUrl, entry.nextUrl)
  )
  if (!alreadyRecorded) {
    state.urlUpdates.push(entry)
  }

  feed.url = normalizedNext
  state.configChanged = true

  if (feedReport) {
    feedReport.url = normalizedNext
    feedReport.discoveredUrl = normalizedNext
    if (entry.status) {
      feedReport.discoveryStatus = entry.status
    }
    if (entry.hint) {
      feedReport.discoveryHint = entry.hint
    }
    feedReport.redirected = feedReport.redirected || hint === 'redirect'
    feedReport.lastResolvedUrl = normalizedNext
    const hop = { from: normalizedPrevious || previousUrl || '', to: normalizedNext, status: entry.status }
    if (Array.isArray(feedReport.redirectChain)) {
      feedReport.redirectChain.push(hop)
    } else {
      feedReport.redirectChain = [hop]
    }
  }

  return true
}

function normalizeComparableUrl(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed)
    url.hash = ''
    const normalized = url.toString()
    return normalized.replace(/\/+$/, '')
  } catch (error) {
    return trimmed.replace(/\s+/g, '')
  }
}

function urlsEqual(a, b) {
  if (!a && !b) return true
  if (!a || !b) return false
  return normalizeComparableUrl(a) === normalizeComparableUrl(b)
}

function captureHeaders(headers) {
  if (!headers || typeof headers.forEach !== 'function') return {}
  const result = {}
  headers.forEach((value, key) => {
    if (key in result) {
      const existing = result[key]
      if (Array.isArray(existing)) {
        existing.push(value)
      } else {
        result[key] = [existing, value]
      }
    } else {
      result[key] = value
    }
  })
  return result
}

function createFeedReport(feed) {
  return {
    id: feed?.id || '',
    name: feed?.sourceName || '',
    type: (feed?.type || '').toLowerCase() || (feed?.parser ? `adapter:${feed.parser}` : ''),
    parser: feed?.parser || '',
    town: feed?.town || '',
    category: feed?.category || '',
    url: feed?.url || '',
    status: 'pending',
    created: 0,
    updated: 0,
    unchanged: 0,
    itemsFetched: 0,
    errors: [],
    fallbackUsed: false,
    fallbackUrl: '',
    fallbackPath: '',
    discoveredUrl: '',
    discoveryStatus: 0,
    discoveryHint: '',
    redirectChain: [],
    redirected: false,
    lastResolvedUrl: '',
    lastRequestedUrl: '',
    lastStatus: 0,
    lastHeaders: {},
    lastError: '',
    durationMs: 0,
    startedAt: '',
    finishedAt: '',
  }
}

async function persistConfigUpdates(filePath, feeds) {
  if (!WRITE_MODE) return
  if (!Array.isArray(feeds) || !feeds.length) return
  const serialized = `${JSON.stringify(feeds, null, 2)}\n`
  await fs.writeFile(filePath, serialized, 'utf8')
}

async function writeUrlUpdateLog(updates = []) {
  if (!WRITE_MODE) return
  if (!Array.isArray(updates) || updates.length === 0) return
  await fs.mkdir(path.dirname(urlUpdateLogPath), { recursive: true })
  const lines = updates.map((entry) => JSON.stringify(entry))
  await fs.appendFile(urlUpdateLogPath, `${lines.join('\n')}\n`, 'utf8')
}

async function writeSyncReports(dir, now, summary, feedReports, urlUpdates, fallbacks = []) {
  if (!WRITE_MODE) return
  await fs.mkdir(dir, { recursive: true })
  const timestamp = DateTime.fromJSDate(now).setZone('America/Toronto')
  const stamp = timestamp.toFormat('yyyyLLdd-HHmmss')
  const payload = {
    generatedAt: timestamp.toISO(),
    totals: summary,
    feeds: feedReports,
    urlUpdates,
    fallbacks,
  }
  const serialized = `${JSON.stringify(payload, null, 2)}\n`
  await fs.writeFile(path.join(dir, `${stamp}.json`), serialized, 'utf8')
  await fs.writeFile(path.join(dir, 'latest.json'), serialized, 'utf8')
  const markdown = buildMarkdownReport(timestamp, summary, feedReports, urlUpdates, fallbacks)
  await fs.writeFile(path.join(dir, 'latest.md'), markdown, 'utf8')
}

function buildMarkdownReport(timestamp, summary, feedReports, urlUpdates, fallbacks = []) {
  const header = `# Events Sync Report — ${timestamp.toFormat('yyyy-LL-dd HH:mm ZZZZ')}\n\n`
  const totals = [
    `* Created: ${summary.created}`,
    `* Updated: ${summary.updated}`,
    `* Unchanged: ${summary.unchanged}`,
    `* Errors: ${summary.errors}`,
  ].join('\n')

  const updatesSection =
    Array.isArray(urlUpdates) && urlUpdates.length
      ? `\n\n## URL Updates\n\n${urlUpdates
          .map(
            (entry) =>
              `- **${entry.id || 'unknown'}**: ${entry.previousUrl} → ${entry.nextUrl} (HTTP ${entry.status}${
                entry.hint ? `, ${entry.hint}` : ''
              })`
          )
          .join('\n')}`
      : '\n\n## URL Updates\n\n- None'

  const fallbackSection =
    Array.isArray(fallbacks) && fallbacks.length
      ? `\n\n## HTML Fallbacks\n\n${fallbacks
          .map(
            (entry) =>
              `- **${entry.id || 'unknown'}**: ${entry.originalUrl || 'n/a'} ⇢ ${
                entry.fallbackPath || entry.fallbackUrl || 'n/a'
              }`
          )
          .join('\n')}`
      : '\n\n## HTML Fallbacks\n\n- None'

  const feedTableHeader =
    '\n\n## Feed Breakdown\n\n| Feed | Created | Updated | Unchanged | Items | Status | Notes |\n| --- | ---: | ---: | ---: | ---: | --- | --- |\n'

  const feedRows = feedReports
    .map((feed) => {
      const name = feed.name || feed.id || feed.url || 'Unknown'
      const status = feed.status || 'pending'
      const notes = []
      if (feed.errors.length) notes.push(`${feed.errors.length} error(s)`)
      if (feed.fallbackUsed)
        notes.push(feed.fallbackPath ? `HTML fallback → ${feed.fallbackPath}` : 'HTML fallback')
      if (feed.discoveredUrl) notes.push('URL updated')
      if (!feed.itemsFetched) notes.push('No items')
      const noteText = notes.join(', ') || '\u2014'
      return `| ${name} | ${feed.created} | ${feed.updated} | ${feed.unchanged} | ${feed.itemsFetched} | ${status} | ${noteText} |`
    })
    .join('\n')

  const renderedRows = feedRows || '| _(none)_ | 0 | 0 | 0 | 0 | — | — |'

  return `${header}${totals}${updatesSection}${fallbackSection}${feedTableHeader}${renderedRows}\n`
}

function buildRequestInit(feed, init = {}) {
  const headers = { ...(feed?.headers || {}), ...(init.headers || {}) }
  if (!('User-Agent' in headers) && !('user-agent' in headers)) {
    headers['User-Agent'] = DEFAULT_USER_AGENT
  }
  if (feed?.referer && !('Referer' in headers) && !('referer' in headers)) {
    headers.Referer = feed.referer
  }
  if (!('Accept-Language' in headers) && !('accept-language' in headers)) {
    headers['Accept-Language'] = 'en-CA,en;q=0.9'
  }
  if (!('Cache-Control' in headers) && !('cache-control' in headers)) {
    headers['Cache-Control'] = 'no-cache'
  }
  if (!('Pragma' in headers) && !('pragma' in headers)) {
    headers.Pragma = 'no-cache'
  }
  return { ...init, headers, redirect: init.redirect || 'follow' }
}

async function performFetchWithRetry(url, init, feed, options = {}) {
  const attempts = getNumericOption(feed?.retryAttempts, DEFAULT_RETRY_ATTEMPTS)
  const timeoutMs = getNumericOption(feed?.timeoutMs, DEFAULT_TIMEOUT_MS)
  const retryDelayMs = getNumericOption(feed?.retryDelayMs, DEFAULT_RETRY_DELAY_MS)

  let lastError = null
  const feedReport = options.feedReport

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const attemptInit = applyTimeoutToInit(init, timeoutMs)

    try {
      const response = await fetch(url, attemptInit.requestInit)

      if (!response.ok) {
        const finalUrl = response.url || url
        if (feedReport) {
          feedReport.lastRequestedUrl = url
          feedReport.lastResolvedUrl = finalUrl
          feedReport.lastStatus = response.status
          feedReport.lastHeaders = captureHeaders(response.headers)
          feedReport.redirected = feedReport.redirected || finalUrl !== url
        }
        const error = new Error(`HTTP ${response.status}`)
        error.status = response.status
        error.url = finalUrl
        if (attempt < attempts && shouldRetryStatus(response.status)) {
          lastError = error
          await waitWithBackoff(attempt, retryDelayMs)
          continue
        }
        throw error
      }

      const finalUrl = response.url || url

      if (feedReport) {
        feedReport.lastRequestedUrl = url
        feedReport.lastResolvedUrl = finalUrl
        feedReport.lastStatus = response.status
        feedReport.lastHeaders = captureHeaders(response.headers)
        feedReport.redirected = feedReport.redirected || finalUrl !== url
      }

      if (options.persistResolvedUrl !== false && options.state && finalUrl && feed) {
        persistUrlUpdate(feed, options.state, feedReport, feed.url || url, finalUrl, response.status, 'redirect')
      }

      return response
    } catch (error) {
      lastError = error
      if (feedReport) {
        feedReport.lastError = error.message || String(error)
      }
      if (attempt >= attempts || !shouldRetryError(error)) {
        throw error
      }
      await waitWithBackoff(attempt, retryDelayMs)
    } finally {
      attemptInit.cleanup()
    }
  }

  throw lastError || new Error('Failed to fetch resource')
}

function applyTimeoutToInit(init = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return { requestInit: { ...init }, cleanup: () => {} }
  }

  if (AbortSignal?.timeout) {
    const timeoutSignal = AbortSignal.timeout(timeoutMs)
    const requestSignal = init.signal
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal

    return {
      requestInit: { ...init, signal: requestSignal },
      cleanup: () => {},
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('Request timed out')), timeoutMs)

  if (init.signal) {
    if (init.signal.aborted) {
      controller.abort(init.signal.reason)
    } else {
      init.signal.addEventListener('abort', () => controller.abort(init.signal.reason), { once: true })
    }
  }

  const requestInit = { ...init, signal: controller.signal }

  return {
    requestInit,
    cleanup: () => clearTimeout(timer),
  }
}

function shouldRetryStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500
}

function shouldRetryError(error) {
  if (!error) return false
  if (error.name === 'AbortError') return true
  if (error.code && RETRYABLE_ERROR_CODES.has(error.code)) return true
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : ''
  if (!message) return false
  return RETRYABLE_ERROR_MESSAGES.some((token) => message.includes(token))
}

const RETRYABLE_ERROR_CODES = new Set([
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EHOSTUNREACH',
  'ENOTFOUND',
  'EAI_AGAIN',
])

const RETRYABLE_ERROR_MESSAGES = [
  'timeout',
  'timed out',
  'network request failed',
  'fetch failed',
  'socket hang up',
  'connection reset',
]

function waitWithBackoff(attempt, baseDelayMs) {
  const effectiveBase = Number.isFinite(baseDelayMs) && baseDelayMs > 0 ? baseDelayMs : DEFAULT_RETRY_DELAY_MS
  const delay = Math.min(effectiveBase * attempt + Math.random() * effectiveBase * 0.5, MAX_RETRY_DELAY_MS)
  return wait(delay)
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getNumericOption(value, fallback) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
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
  const slugParts = [slugDate, slugify(title), slugify(town || locationName || feed.town || '')]
    .filter(Boolean)
    .join('-')
  const fallbackSlugParts = [slugify(title), slugify(sourceName), slugDate, slugify(sourceId)]
    .filter(Boolean)
    .join('-')
  const slug = makeFileSafeSlug(slugParts || fallbackSlugParts || `${sourceName}-${sourceId}`)

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
    use_daily_schedule:
      Boolean(item.use_daily_schedule ?? item.useDailySchedule) ||
      (Array.isArray(item.daily_schedule || item.dailySchedule)
        ? (item.daily_schedule || item.dailySchedule).length > 0
        : false),
    daily_schedule: Array.isArray(item.daily_schedule || item.dailySchedule)
      ? (item.daily_schedule || item.dailySchedule).map((entry) => {
          const date = entry?.date || entry?.day || ''
          const allDay = Boolean(entry?.all_day ?? entry?.allDay)
          if (allDay) {
            return { date, all_day: true, start_time: '', end_time: '' }
          }
          const start =
            typeof entry?.start_time === 'string'
              ? entry.start_time.trim()
              : typeof entry?.startTime === 'string'
                ? entry.startTime.trim()
                : Array.isArray(entry?.blocks) && entry.blocks[0]?.start
                  ? String(entry.blocks[0].start).trim()
                  : ''
          const end =
            typeof entry?.end_time === 'string'
              ? entry.end_time.trim()
              : typeof entry?.endTime === 'string'
                ? entry.endTime.trim()
                : Array.isArray(entry?.blocks) && entry.blocks[0]?.end
                  ? String(entry.blocks[0].end).trim()
                  : ''
          if (start && end) {
            return { date, all_day: false, start_time: start, end_time: end }
          }
          return { date, all_day: false, start_time: '', end_time: '' }
        })
      : undefined,
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
  'use_daily_schedule',
  'daily_schedule',
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

  const mergedBadges = sanitizeTagList(mergeUnique([], preserved.badges, event.badges))
  const mergedQaTags = sanitizeTagList(mergeUnique([], preserved.qaTags, event.qaTags))

  const baseMerged = {
    ...preserved,
    ...event,
    badges: mergedBadges,
    qaTags: mergedQaTags,
    status,
    hidden,
    archived,
    notes,
    source: typeof preserved.source === 'string' ? preserved.source : 'feed',
    sourceName: cleanText(event.sourceName || preserved.sourceName || ''),
    sourceUrl: cleanText(event.sourceUrl || preserved.sourceUrl || ''),
    sourceDomain: cleanText(event.sourceDomain || preserved.sourceDomain || ''),
    sourcePriority: resolvePriority(event.sourcePriority, preserved.sourcePriority),
    ...(firstSeenAt ? { firstSeenAt } : {}),
  }

  let normalizedEvent
  try {
    const normalization = normalizeCmsEvent(baseMerged)
    normalizedEvent = normalization.event
  } catch (error) {
    const message = error && error.message ? error.message : 'unknown normalization error'
    const failure = new Error(`CMS normalization failed for ${event.slug}: ${message}`)
    failure.cause = error
    throw failure
  }

  const metadata = buildMetadata(baseMerged)
  const comparableNext = {
    ...normalizedEvent,
    ...metadata,
    ...(firstSeenAt ? { firstSeenAt } : {}),
  }

  const previousComparable = JSON.stringify(orderKeys(stripSyncTimestamps(preserved)))
  const nextComparable = JSON.stringify(orderKeys(stripSyncTimestamps(comparableNext)))

  if (previousComparable === nextComparable && (isUpdate || existingContent)) {
    const entryFilePath = existingEntry?.filePath || filePath
    const entry = existingEntry || { data: preserved, filePath: entryFilePath }
    bySlug.set(event.slug, entry)
    if (sourceId) bySourceId.set(sourceId, entry)
    return 'unchanged'
  }

  const timestamp = new Date(now).toISOString()
  const merged = {
    ...comparableNext,
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

  if (WRITE_MODE) {
    await fs.writeFile(filePath, serialized, 'utf8')
  }
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

function resolvePriority(incoming, fallback) {
  if (Number.isFinite(incoming)) return Number(incoming)
  if (Number.isFinite(fallback)) return Number(fallback)
  return DEFAULT_PRIORITY
}

function sanitizeTagList(values) {
  if (!Array.isArray(values) || values.length === 0) return []
  const seen = new Set()
  const normalized = []
  for (const value of values) {
    const text = cleanText(value)
    if (!text) continue
    if (seen.has(text)) continue
    seen.add(text)
    normalized.push(text)
  }
  return normalized
}

function buildMetadata(event) {
  const metadata = {}
  if (typeof event.notes === 'string' && event.notes.trim()) {
    metadata.notes = event.notes.trim()
  }

  if (event.sourceName) {
    metadata.sourceName = event.sourceName
  }
  if (event.sourceUrl) {
    metadata.sourceUrl = event.sourceUrl
  }
  if (event.sourceDomain) {
    metadata.sourceDomain = event.sourceDomain
  }

  if (Number.isFinite(event.sourcePriority) && event.sourcePriority !== DEFAULT_PRIORITY) {
    metadata.sourcePriority = Number(event.sourcePriority)
  }

  const qaTags = sanitizeTagList(event.qaTags)
  if (qaTags.length) {
    metadata.qaTags = qaTags
  }

  return metadata
}

main().catch((error) => {
  console.error('[sync-events] Fatal error', error)
  console.log('Created: 0, Updated: 0, Unchanged: 0, Errors: 1')
  console.log('SYNC_SUMMARY created=0 updated=0 unchanged=0 errors=1')
  process.exitCode = 1
})
