const { parse } = require('node-html-parser')

const DEFAULT_EVENT_USER_AGENT =
  'NorthSideGTA-EventBot/1.0 (+https://www.northsidegta.ca/community)'

function resolveImageUrl(value, baseUrl) {
  if (!value) return null
  const trimmed = String(value).trim()
  if (!trimmed || /^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) {
    return null
  }
  try {
    const resolved = new URL(trimmed, baseUrl)
    if (!/^https?:$/i.test(resolved.protocol)) {
      return null
    }
    return resolved.toString()
  } catch (error) {
    return null
  }
}

function extractImageFromHtml(html, baseUrl) {
  if (!html) return null
  const root = parse(html)
  if (!root || typeof root.querySelector !== 'function') return null

  const candidates = []
  const og = root.querySelector('meta[property="og:image"]')
  if (og?.getAttribute('content')) {
    candidates.push(og.getAttribute('content'))
  }
  const twitter = root.querySelector('meta[name="twitter:image"]')
  if (twitter?.getAttribute('content')) {
    candidates.push(twitter.getAttribute('content'))
  }

  const mainImage = root.querySelector('main img') || root.querySelector('[role="main"] img')
  if (mainImage?.getAttribute('src')) {
    candidates.push(mainImage.getAttribute('src'))
  }

  const firstImage = root.querySelector('img')
  if (firstImage?.getAttribute('src')) {
    candidates.push(firstImage.getAttribute('src'))
  }

  for (const candidate of candidates) {
    const resolved = resolveImageUrl(candidate, baseUrl)
    if (resolved) return resolved
  }

  return null
}

async function fetchEventPageImage(event, options = {}) {
  if (!event || typeof event !== 'object') return null
  if (event.image) return null

  const eventUrl = event.eventUrl || event.url
  if (!eventUrl) return null

  const fetchImpl = options.fetchImpl || global.fetch
  if (typeof fetchImpl !== 'function') return null

  const userAgent = options.userAgent || DEFAULT_EVENT_USER_AGENT
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 10000

  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null

  try {
    const response = await fetchImpl(eventUrl, {
      headers: userAgent ? { 'User-Agent': userAgent } : {},
      signal: controller?.signal,
    })
    if (!response || !response.ok) return null

    const contentType = response.headers?.get?.('content-type') || ''
    if (contentType && !/text\/html/i.test(contentType)) {
      return null
    }

    const html = await response.text()
    return extractImageFromHtml(html, eventUrl)
  } catch (error) {
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}

module.exports = {
  DEFAULT_EVENT_USER_AGENT,
  fetchEventPageImage,
}
