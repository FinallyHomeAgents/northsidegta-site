require('./runtime')

const { setTimeout: sleep } = require('timers/promises')
const { DEFAULT_USER_AGENT, MAX_RESPONSE_BYTES, MAX_HTTP_RETRIES, HTTP_TIMEOUT_MS } = require('./constants')

function buildHeaders(headers = {}, userAgent = DEFAULT_USER_AGENT) {
  const result = { ...headers }
  if (!Object.keys(result).some((key) => key.toLowerCase() === 'user-agent')) {
    result['User-Agent'] = userAgent
  }
  return result
}

async function fetchResource(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    maxRetries = MAX_HTTP_RETRIES,
    maxBytes = MAX_RESPONSE_BYTES,
    timeoutMs = HTTP_TIMEOUT_MS,
    userAgent = DEFAULT_USER_AGENT,
  } = options

  const attempts = Math.max(1, Number(maxRetries) + 1)
  const startedAt = Date.now()
  let retries = 0
  let lastError = null

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (attempt > 1) {
      retries += 1
      const backoff = Math.min(2000 * attempt, 8000)
      await sleep(backoff + Math.random() * 300)
    } else {
      await sleep(100 + Math.random() * 250)
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        method,
        body,
        headers: buildHeaders(headers, userAgent),
        redirect: options.redirect || 'follow',
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (shouldRetry(response) && attempt < attempts) {
        lastError = new Error(`HTTP ${response.status}`)
        continue
      }

      const size = evaluateSize(response, maxBytes)
      if (size === false) {
        const error = new Error('response_too_large')
        error.code = 'RESPONSE_TOO_LARGE'
        throw error
      }

      const buffer = await response.arrayBuffer().then((ab) => Buffer.from(ab))
      if (buffer.length > maxBytes) {
        const error = new Error('response_too_large')
        error.code = 'RESPONSE_TOO_LARGE'
        throw error
      }

      return {
        url: response.url || url,
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        buffer,
        retries,
        elapsedMs: Date.now() - startedAt,
      }
    } catch (error) {
      clearTimeout(timer)
      lastError = error
      if (attempt >= attempts) {
        break
      }
    }
  }

  const failure = new Error(lastError ? lastError.message : 'fetch_failed')
  failure.cause = lastError
  failure.retries = retries
  failure.elapsedMs = Date.now() - startedAt
  throw failure
}

function shouldRetry(response) {
  if (!response) return false
  if (response.status === 429) return true
  if (response.status >= 500 && response.status < 600) return true
  return false
}

function evaluateSize(response, maxBytes) {
  if (!response || typeof response.headers?.get !== 'function') return true
  const length = response.headers.get('content-length')
  if (!length) return true
  const parsed = Number(length)
  if (!Number.isFinite(parsed)) return true
  return parsed <= maxBytes
}

module.exports = {
  fetchResource,
}
