const fs = require('fs')
const path = require('path')
const { loadSourceRegistry } = require('./registry')
const { fetchResource } = require('./http-client')
const { evaluateRobots } = require('./robots')
const { parseWithStrategy } = require('./parsers')
const { LOGS_DIR } = require('./constants')
const { allowNetworkInCi, networkBlockedReason } = require('./env')

async function runAudit(options = {}) {
  const {
    domain,
    logDir = LOGS_DIR,
    now = new Date(),
    fetcher = fetchResource,
    robotsEvaluator = evaluateRobots,
  } = options
  const sources = loadSourceRegistry({ domain })
  if (!sources.length) {
    console.log('[events:audit] No sources matched the filters.')
    return null
  }

  fs.mkdirSync(logDir, { recursive: true })
  const timestamp = formatTimestamp(now)
  const filePath = path.join(logDir, `audit_${timestamp}.jsonl`)
  const stream = fs.createWriteStream(filePath, { flags: 'a' })

  const summaryRows = []
  for (const source of sources) {
    const record = await auditSource(source, { fetcher, robotsEvaluator })
    stream.write(`${JSON.stringify(record)}\n`)
    summaryRows.push(buildSummaryRow(record))
  }

  stream.end()

  if (summaryRows.length) {
    console.table(summaryRows)
  }

  console.log(`[events:audit] Wrote ${summaryRows.length} records to ${path.relative(process.cwd(), filePath)}`)
  return { filePath, records: summaryRows }
}

async function auditSource(source, context = {}) {
  const { fetcher = fetchResource, robotsEvaluator = evaluateRobots } = context
  const startedAt = Date.now()
  const result = {
    id: source.id,
    domain: source.domain,
    strategy: source.strategy,
    timestamp: new Date().toISOString(),
    start_urls: source.start_urls,
    timezone: source.timezone,
    metadata: source.metadata,
    audit: {
      fetches: [],
      robots: null,
      features: {
        ics: false,
        rss: false,
        jsonld: false,
        json: false,
      },
      parse: {
        events_found: 0,
        errors: [],
      },
      failure_category: null,
      retries: 0,
      elapsed_ms: 0,
    },
  }

  const firstUrl = Array.isArray(source.start_urls) ? source.start_urls[0] : null
  if (!firstUrl) {
    result.audit.failure_category = 'content_empty'
    result.audit.elapsed_ms = Date.now() - startedAt
    return result
  }

  if (source.enabled === false) {
    result.audit.failure_category = 'disabled'
    result.audit.fetches.push({
      url: firstUrl,
      status: null,
      ok: false,
      retries: 0,
      elapsed_ms: 0,
      error: 'source disabled',
    })
    result.audit.elapsed_ms = Date.now() - startedAt
    return result
  }

  if (!allowNetworkInCi()) {
    result.audit.failure_category = 'ci_offline'
    result.audit.fetches.push({
      url: firstUrl,
      status: null,
      ok: false,
      retries: 0,
      elapsed_ms: 0,
      error: networkBlockedReason(),
    })
    result.audit.elapsed_ms = Date.now() - startedAt
    return result
  }

  const robotsInfo = await robotsEvaluator(firstUrl).catch((error) => ({
    allowed: true,
    source: 'error',
    error: error.message,
  }))
  result.audit.robots = robotsInfo

  if (!robotsInfo.allowed) {
    result.audit.failure_category = 'robots'
    result.audit.elapsed_ms = Date.now() - startedAt
    return result
  }

  let fetchResponse
  try {
    fetchResponse = await fetcher(firstUrl)
    result.audit.fetches.push({
      url: fetchResponse.url,
      status: fetchResponse.status,
      ok: fetchResponse.ok,
      retries: fetchResponse.retries,
      elapsed_ms: fetchResponse.elapsedMs,
      size: fetchResponse.buffer.length,
      content_type: headerValue(fetchResponse.headers, 'content-type'),
    })
    result.audit.retries = fetchResponse.retries
  } catch (error) {
    result.audit.fetches.push({
      url: firstUrl,
      status: null,
      ok: false,
      retries: error.retries || 0,
      elapsed_ms: error.elapsedMs || 0,
      error: error.message,
    })
    result.audit.failure_category = deriveFailureCategory({ error })
    result.audit.elapsed_ms = Date.now() - startedAt
    return result
  }

  const { buffer, headers } = fetchResponse
  const text = buffer.toString('utf8')
  const contentType = headerValue(headers, 'content-type') || ''

  result.audit.features.ics = /text\/calendar/i.test(contentType) || /BEGIN:VCALENDAR/i.test(text)
  result.audit.features.rss = /application\/rss\+xml|application\/atom\+xml|xml/i.test(contentType) && /<(rss|feed)[^>]*>/i.test(text)
  result.audit.features.jsonld = /application\/ld\+json/i.test(text) || /<script[^>]+application\/ld\+json/i.test(text)
  result.audit.features.json = /application\/json/i.test(contentType)

  const parseResult = await parseWithStrategy(source.strategy, {
    buffer,
    text,
    source,
  })
  result.audit.parse.events_found = Array.isArray(parseResult.events) ? parseResult.events.length : 0
  result.audit.parse.errors = Array.isArray(parseResult.errors) ? parseResult.errors : []

  if (!fetchResponse.ok) {
    result.audit.failure_category = deriveFailureCategory({ status: fetchResponse.status })
  } else if (result.audit.parse.events_found === 0) {
    if (result.audit.parse.errors.length) {
      result.audit.failure_category = deriveFailureCategory({ errors: result.audit.parse.errors })
    } else {
      result.audit.failure_category = 'content_empty'
    }
  }

  result.audit.elapsed_ms = Date.now() - startedAt
  return result
}

function deriveFailureCategory({ status, errors = [], error }) {
  if (error) {
    if (error.code === 'CI_OFFLINE') return 'ci_offline'
    if (/response_too_large/i.test(error.message)) return 'blocked'
    if (/fetch failed|ENOTFOUND|EAI_AGAIN|ECONN|ETIMEDOUT/i.test(error.message)) return 'http'
    return 'unknown'
  }
  if (status) {
    if (status === 403 || status === 401) return 'blocked'
    if (status >= 400 && status < 600) return 'http'
  }
  if (errors.length) {
    if (errors.some((message) => /date/i.test(message))) return 'date_parse'
    if (errors.some((message) => /selector/i.test(message))) return 'selector_miss'
    if (errors.some((message) => /json_parse/i.test(message))) return 'content_empty'
    return 'unknown'
  }
  return null
}

function headerValue(headers, name) {
  if (!headers) return ''
  const target = name.toLowerCase()
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return value
  }
  return ''
}

function buildSummaryRow(record) {
  return {
    domain: record.domain,
    strategy: record.strategy,
    events: record.audit.parse.events_found,
    failure: record.audit.failure_category || 'ok',
    retries: record.audit.retries,
    ms: record.audit.elapsed_ms,
  }
}

function formatTimestamp(date) {
  const pad = (value) => String(value).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}${month}${day}_${hours}${minutes}`
}

module.exports = {
  runAudit,
  auditSource,
}
