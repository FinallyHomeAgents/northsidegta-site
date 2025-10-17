#!/usr/bin/env node
import '../lib/events/runtime.js'

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const configPath = path.join(rootDir, 'config', 'event-feeds.json')
const logsDir = path.join(rootDir, 'logs')

const DEFAULT_TIMEOUT_MS = 12000
const DEFAULT_CONCURRENCY = 4

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const feeds = await loadFeeds(options)
  if (!feeds.length) {
    console.log('[events-connectivity] No feeds matched the requested filters.')
    return
  }

  const results = await runWithConcurrency(feeds, options.concurrency, async (feed) => {
    return probeFeed(feed, options)
  })

  const summaryRows = results.map((record) => toSummaryRow(record))
  if (summaryRows.length) {
    console.table(summaryRows)
  }

  if (options.outputPath) {
    await persistResults(options.outputPath, results)
  }

  // --- NEW SMART EXIT LOGIC ---
  const okCount = results.filter(r => r.primary?.ok === true).length
  const failCount = results.length - okCount

  // Save quick summary
  const summaryPath = path.join(rootDir, 'public/data/events/_connectivity-summary.json')
  await fs.mkdir(path.dirname(summaryPath), { recursive: true })
  await fs.writeFile(
    summaryPath,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      passed: okCount,
      failed: failCount
    }, null, 2),
    'utf8'
  )

  if (okCount === 0) {
    console.error(`[events-connectivity] ❌ All ${results.length} feeds failed connectivity checks.`)
    process.exit(1)
  } else if (failCount > 0) {
    console.warn(`[events-connectivity] ⚠️ ${failCount} feed(s) failed connectivity, ${okCount} passed. Continuing.`)
    process.exit(0)
  } else {
    console.log('[events-connectivity] ✅ All feeds responded successfully.')
    process.exit(0)
  }
}

function parseArguments(args) {
  const feeds = new Set()
  const options = {
    timeoutMs: DEFAULT_TIMEOUT_MS,
    concurrency: DEFAULT_CONCURRENCY,
    outputPath: null,
    feeds,
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
    if (arg.startsWith('--timeout=')) {
      options.timeoutMs = parseInt(arg.split('=')[1], 10) || DEFAULT_TIMEOUT_MS
      continue
    }
    if (arg === '--timeout') {
      options.timeoutMs = parseInt(args[index + 1], 10) || DEFAULT_TIMEOUT_MS
      index += 1
      continue
    }
    if (arg.startsWith('--concurrency=')) {
      options.concurrency = Math.max(1, parseInt(arg.split('=')[1], 10) || DEFAULT_CONCURRENCY)
      continue
    }
    if (arg === '--concurrency') {
      options.concurrency = Math.max(1, parseInt(args[index + 1], 10) || DEFAULT_CONCURRENCY)
      index += 1
      continue
    }
    if (arg.startsWith('--json=')) {
      options.outputPath = resolveOutputPath(arg.split('=')[1])
      continue
    }
    if (arg === '--json') {
      options.outputPath = resolveOutputPath(args[index + 1])
      index += 1
      continue
    }
    if (arg.startsWith('--feed=')) {
      feeds.add(arg.split('=')[1])
      continue
    }
    if (arg === '--feed') {
      feeds.add(args[index + 1])
      index += 1
      continue
    }
  }

  if (process.env.EVENTS_CONNECTIVITY_TIMEOUT) {
    options.timeoutMs = parseInt(process.env.EVENTS_CONNECTIVITY_TIMEOUT, 10) || options.timeoutMs
  }
  if (process.env.EVENTS_CONNECTIVITY_CONCURRENCY) {
    options.concurrency = Math.max(
      1,
      parseInt(process.env.EVENTS_CONNECTIVITY_CONCURRENCY, 10) || options.concurrency
    )
  }

  return options
}

function printHelp() {
  console.log(`Usage: node scripts/events-connectivity.mjs [options]\n\n` +
    `Options:\n` +
    `  --feed <id>           Restrict checks to a specific feed (can be repeated)\n` +
    `  --timeout <ms>        Override the per-request timeout (default ${DEFAULT_TIMEOUT_MS}ms)\n` +
    `  --concurrency <n>     Number of parallel requests (default ${DEFAULT_CONCURRENCY})\n` +
    `  --json <path>         Write the raw results to a JSON file\n` +
    `  -h, --help            Show this help message\n`)
}

function resolveOutputPath(value) {
  if (!value) return null
  if (path.isAbsolute(value)) return value
  return path.join(logsDir, value)
}

async function loadFeeds(options) {
  const raw = await fs.readFile(configPath, 'utf8').catch(() => '[]')
  const feeds = JSON.parse(raw)
  const requested = Array.from(options.feeds).filter(Boolean)
  if (!requested.length) return feeds
  return feeds.filter((feed) => {
    if (!feed) return false
    if (requested.includes(feed.id)) return true
    if (requested.includes(feed.url)) return true
    return false
  })
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length)
  let cursor = 0

  async function runNext() {
    const current = cursor
    cursor += 1
    if (current >= items.length) return
    try {
      results[current] = await worker(items[current], current)
    } catch (error) {
      results[current] = { error: error.message || String(error) }
    }
    await runNext()
  }

  const runners = []
  const limit = Math.min(concurrency || 1, items.length || 0)
  for (let index = 0; index < limit; index += 1) {
    runners.push(runNext())
  }

  await Promise.all(runners)
  return results
}

async function probeFeed(feed, options) {
  const candidates = buildCandidateUrls(feed)
  const checks = []
  for (const candidate of candidates) {
    const result = await checkUrl(candidate.url, {
      timeoutMs: options.timeoutMs,
      method: candidate.method,
    })
    checks.push({ ...result, role: candidate.role })
    if (candidate.role === 'primary' && result.ok) break
  }

  const primary = checks.find((entry) => entry.role === 'primary') || {
    ok: false,
    status: null,
    error: 'no_primary_url',
  }

  return {
    id: feed.id || '',
    url: feed.url || '',
    name: feed.sourceName || '',
    town: feed.town || '',
    type: (feed.type || feed.parser || '').toString(),
    primary,
    checks,
  }
}

function buildCandidateUrls(feed) {
  const urls = []
  if (feed?.url) urls.push({ role: 'primary', url: resolveUrl(feed.url, feed), method: 'HEAD' })
  const fallback = feed?.html?.url || feed?.sourceUrl
  if (fallback) urls.push({ role: 'fallback', url: resolveUrl(fallback, feed), method: 'HEAD' })
  return urls.filter((entry, index, list) => {
    const key = `${entry.role}:${entry.url}`
    return list.findIndex((item) => `${item.role}:${item.url}` === key) === index
  })
}

function resolveUrl(value, feed) {
  if (!value) return ''
  if (/^https?:/i.test(value)) return value
  if (feed && feed.url && /^https?:/i.test(feed.url)) {
    try {
      const resolved = new URL(value, feed.url)
      return resolved.toString()
    } catch {
      return value
    }
  }
  return value
}

async function checkUrl(url, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : DEFAULT_TIMEOUT_MS
  const method = options.method || 'HEAD'
  const startedAt = Date.now()
  const result = {
    url,
    method,
    ok: false,
    status: null,
    elapsedMs: 0,
    error: null,
    headers: {},
  }

  if (!url) {
    result.error = 'missing_url'
    return result
  }

  const controller = createAbortController(timeoutMs)
  const init = { method, redirect: 'follow', signal: controller.signal }

  try {
    const response = await fetch(url, init)
    result.status = response.status
    result.ok = response.ok || (response.status >= 200 && response.status < 400)
    result.headers = captureHeaders(response.headers)
    result.elapsedMs = Date.now() - startedAt

    if (!result.ok && method === 'HEAD' && response.status === 405) {
      return checkUrl(url, { ...options, method: 'GET' })
    }

    if (response.body && typeof response.body.cancel === 'function') {
      try { await response.body.cancel() } catch {}
    }
  } catch (error) {
    result.ok = false
    result.status = null
    result.error = error.code || error.name || error.message || 'fetch_failed'
    result.elapsedMs = Date.now() - startedAt
    if (method === 'HEAD') return checkUrl(url, { ...options, method: 'GET' })
  } finally {
    controller.cleanup?.()
  }

  return result
}

function createAbortController(timeoutMs) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    const timeoutSignal = AbortSignal.timeout(timeoutMs)
    return { signal: timeoutSignal, cleanup: () => {} }
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return { signal: controller.signal, cleanup: () => clearTimeout(timer) }
}

function captureHeaders(headers) {
  const result = {}
  if (!headers || typeof headers.forEach !== 'function') return result
  headers.forEach((value, key) => { result[key] = value })
  return result
}

function toSummaryRow(record) {
  const primary = record.primary || {}
  return {
    feed: record.id || record.url || '(unknown)',
    town: record.town || '',
    status: primary.status ?? 'ERR',
    ok: primary.ok === true ? 'yes' : 'no',
    ms: primary.elapsedMs || 0,
    error: primary.error || '',
  }
}

async function persistResults(outputPath, results) {
  const target = outputPath.endsWith('.json') ? outputPath : `${outputPath}.json`
  await fs.mkdir(path.dirname(target), { recursive: true })
  const payload = { generatedAt: new Date().toISOString(), results }
  await fs.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`[events-connectivity] Wrote results to ${path.relative(process.cwd(), target)}`)
}

main().catch((error) => {
  console.error('[events-connectivity] Unhandled error:', error)
  process.exit(1)
})
