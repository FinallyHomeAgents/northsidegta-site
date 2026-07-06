#!/usr/bin/env node
import '../lib/events/runtime.js'

import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const ingest = require('./ingest-events.js')
const { allowNetworkInCi, networkBlockedReason } = require('../lib/events/env.js')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const configPath = path.join(rootDir, 'config', 'event-feeds.json')
const eventsDir = path.join(rootDir, 'public', 'data', 'events')
const logsDir = path.join(rootDir, 'logs')

async function main() {
  const options = parseArguments(process.argv.slice(2))
  if (!allowNetworkInCi()) {
    console.warn(`[events-health] Skipping network checks: ${networkBlockedReason() || 'network disabled in CI'}`)
    return
  }
  const feeds = ingest.loadConfig(configPath)
  const requested = filterFeeds(feeds, options)
  if (!requested.length) {
    console.log('[events-health] No feeds matched the requested filters.')
    return
  }

  if (!options.dryRun) {
    ingest.ensureDir(eventsDir)
  }

  const registry = options.dryRun ? null : ingest.loadExistingEvents(eventsDir)
  const now = new Date()
  const records = []

  for (const feed of requested) {
    const record = initializeRecord(feed)
    if (feed.enabled === false && !options.includeDisabled) {
      record.status = 'disabled'
      record.note = feed.disabledReason || 'feed disabled in config'
      records.push(record)
      continue
    }

    try {
      const items = await ingest.fetchFeed(feed)
      record.fetched = Array.isArray(items) ? items.length : 0
      if (!Array.isArray(items) || !items.length) {
        record.status = 'empty'
        records.push(record)
        continue
      }

      const normalized = []
      for (const item of items) {
        const event = ingest.normalizeEvent(item, feed)
        if (!event) {
          record.warnings.push('dropped: missing title/date')
          continue
        }
        const disqualifier = ingest.getDisqualifier(event, now)
        if (disqualifier) {
          record.warnings.push(`skipped: ${disqualifier}`)
          continue
        }
        normalized.push(event)
      }

      record.usable = normalized.length
      record.earliest = findBoundary(normalized, 'earliest')
      record.latest = findBoundary(normalized, 'latest')

      if (!normalized.length) {
        record.status = 'filtered'
        records.push(record)
        continue
      }

      if (!options.dryRun) {
        for (const event of normalized) {
          const result = await ingest.upsertEvent(event, registry, eventsDir)
          record[result] = (record[result] || 0) + 1
          record.persistedSlugs.push(event.slug)
        }
      }

      record.status = 'healthy'
      records.push(record)
    } catch (error) {
      const classified = classifyError(error)
      record.status = classified.status
      record.note = classified.note
      records.push(record)
    }
  }

  if (!options.dryRun && registry) {
    const pruned = ingest.pruneExistingEvents(registry, eventsDir, now)
    if (pruned > 0) {
      console.log(`[events-health] Pruned ${pruned} expired event(s).`)
    }
  }

  let apiSummary = null
  if (!options.dryRun && options.checkApi) {
    apiSummary = await checkApiVisibility(records)
  }

  printTable(records, apiSummary)
  await maybePersistOutput(options, records, apiSummary)
}

function parseArguments(argv) {
  const options = {
    includeDisabled: false,
    dryRun: false,
    checkApi: true,
    feeds: new Set(),
    outputPath: null,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--feed' && argv[index + 1]) {
      options.feeds.add(argv[index + 1])
      index += 1
      continue
    }
    if (arg.startsWith('--feed=')) {
      options.feeds.add(arg.split('=')[1])
      continue
    }
    if (arg === '--include-disabled') {
      options.includeDisabled = true
      continue
    }
    if (arg === '--dry-run' || arg === '--no-write') {
      options.dryRun = true
      continue
    }
    if (arg === '--no-api') {
      options.checkApi = false
      continue
    }
    if (arg === '--json' && argv[index + 1]) {
      options.outputPath = argv[index + 1]
      index += 1
      continue
    }
    if (arg.startsWith('--json=')) {
      options.outputPath = arg.split('=')[1]
      continue
    }
  }

  if (options.outputPath && !path.isAbsolute(options.outputPath)) {
    const relative = options.outputPath.startsWith(`logs${path.sep}`)
      ? options.outputPath
      : path.join('logs', options.outputPath)
    options.outputPath = path.join(rootDir, relative)
  }

  return options
}

function filterFeeds(feeds, options) {
  if (!options.feeds.size) return feeds
  return feeds.filter((feed) => options.feeds.has(feed.id) || options.feeds.has(feed.url))
}

function initializeRecord(feed) {
  return {
    id: feed.id || feed.url,
    url: feed.url,
    status: 'pending',
    fetched: 0,
    usable: 0,
    created: 0,
    updated: 0,
    duplicate: 0,
    persistedSlugs: [],
    earliest: '',
    latest: '',
    warnings: [],
    note: '',
  }
}

function findBoundary(events, mode) {
  const dates = events
    .map((event) => new Date(event.startDate || event.date || event.start))
    .filter((value) => value instanceof Date && !Number.isNaN(value.getTime()))
    .map((value) => value.toISOString())
    .sort()
  if (!dates.length) return ''
  return mode === 'latest' ? dates[dates.length - 1] : dates[0]
}

function classifyError(error) {
  const code = error?.code || error?.cause?.code || ''
  const message = error?.message || String(error)
  const networkCodes = ['ENETUNREACH', 'EAI_AGAIN', 'ENOTFOUND', 'EHOSTUNREACH']
  if (code && networkCodes.includes(code)) {
    return { status: 'network-blocked', note: `${code}: ${message}` }
  }
  if (/ENETUNREACH|EAI_AGAIN|ENOTFOUND|EHOSTUNREACH/i.test(message)) {
    return { status: 'network-blocked', note: message }
  }
  return { status: 'failed', note: message }
}

async function checkApiVisibility(records) {
  const { default: handler } = await import('../api/events.js')
  const response = await invokeApi(handler, { status: 'all' })
  if (response.statusCode !== 200) {
    return { statusCode: response.statusCode, visible: 0 }
  }
  const payload = response.body?.events || []
  const slugs = new Set(payload.map((event) => event.slug).filter(Boolean))
  for (const record of records) {
    if (!record.persistedSlugs.length) continue
    const visible = record.persistedSlugs.filter((slug) => slugs.has(slug))
    if (visible.length === 0 && record.usable > 0) {
      record.warnings.push('ingested events not surfaced via /api/events')
    }
    record.apiVisible = visible.length
  }
  return { statusCode: response.statusCode, visible: slugs.size }
}

function invokeApi(handler, query = {}) {
  return new Promise((resolve) => {
    const req = { method: 'GET', query }
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) {
        this.headers[name] = value
      },
      status(code) {
        this.statusCode = code
        return this
      },
      json(body) {
        resolve({ statusCode: this.statusCode || 200, body })
      },
    }
    handler(req, res)
  })
}

function formatDate(value) {
  if (!value) return ''
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  } catch (error) {
    return ''
  }
}

function printTable(records, apiSummary) {
  const rows = records.map((record) => ({
    feed: record.id,
    status: record.status,
    fetched: record.fetched,
    usable: record.usable,
    created: record.created || 0,
    updated: record.updated || 0,
    duplicate: record.duplicate || 0,
    earliest: formatDate(record.earliest),
    latest: formatDate(record.latest),
    apiVisible: typeof record.apiVisible === 'number' ? record.apiVisible : '',
    warnings: record.warnings.join('; '),
    note: record.note,
  }))
  console.table(rows)
  if (apiSummary) {
    console.log(`[events-health] /api/events returned ${apiSummary.visible} event(s) with status code ${apiSummary.statusCode}.`)
  }
}

async function maybePersistOutput(options, records, apiSummary) {
  if (!options.outputPath) return
  const payload = { timestamp: new Date().toISOString(), records, apiSummary }
  await fs.promises.mkdir(path.dirname(options.outputPath), { recursive: true })
  await fs.promises.writeFile(options.outputPath, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`[events-health] Wrote detailed results to ${options.outputPath}`)
}

main().catch((error) => {
  console.error('[events-health] Fatal error', error)
  process.exitCode = 1
})
