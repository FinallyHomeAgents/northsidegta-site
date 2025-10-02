const fs = require('fs')
const path = require('path')
const { CONFIG_DIR, DEFAULT_TIMEZONE } = require('./constants')

const REGISTRY_PATH = path.join(CONFIG_DIR, 'event-sources.json')
let registryCache = null
let cacheMtime = 0

function loadSourceRegistry({ domain, includeDisabled = false } = {}) {
  const stats = safeStat(REGISTRY_PATH)
  if (!registryCache || (stats && stats.mtimeMs !== cacheMtime)) {
    registryCache = parseRegistry(REGISTRY_PATH)
    cacheMtime = stats ? stats.mtimeMs : 0
  }

  if (!Array.isArray(registryCache)) return []

  let sources = registryCache
  if (domain) {
    const normalized = domain.trim().toLowerCase()
    sources = sources.filter((source) =>
      source && typeof source.domain === 'string' && source.domain.toLowerCase() === normalized
    )
  }

  if (!includeDisabled) {
    sources = sources.filter((source) => source && source.enabled !== false)
  }

  return sources.map(applyDefaults)
}

function getSourceById(id) {
  if (!id) return null
  const sources = loadSourceRegistry({ includeDisabled: true })
  return sources.find((source) => source.id === id) || null
}

function applyDefaults(source) {
  if (!source || typeof source !== 'object') return null
  const startUrls = Array.isArray(source.start_urls)
    ? source.start_urls.filter((value) => typeof value === 'string' && value.trim())
    : []

  return {
    id: source.id || source.domain,
    domain: source.domain,
    enabled: source.enabled !== false,
    strategy: source.strategy || 'html',
    start_urls: startUrls,
    timezone: source.timezone || DEFAULT_TIMEZONE,
    max_pages: Number.isFinite(source.max_pages) ? source.max_pages : undefined,
    metadata: source.metadata && typeof source.metadata === 'object' ? source.metadata : {},
  }
}

function parseRegistry(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.warn(`[events/registry] Failed to read registry: ${error.message}`)
    return []
  }
}

function safeStat(filePath) {
  try {
    return fs.statSync(filePath)
  } catch (error) {
    return null
  }
}

module.exports = {
  loadSourceRegistry,
  getSourceById,
  REGISTRY_PATH,
}
