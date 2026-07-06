import { getRedisClient, isRedisConfigured } from '../communityRanking/kv-client.js'

const KEY_PREFIX = 'spotlight:town:'
const TTL_SECONDS = 60 * 60 * 24 * 14

const memoryCache = new Map()

function normalizeSlug(townSlug) {
  return String(townSlug || '')
    .trim()
    .toLowerCase()
}

function readFromMemory(slug) {
  if (!memoryCache.has(slug)) return null
  return memoryCache.get(slug)
}

function writeToMemory(slug, items) {
  const payload = Array.isArray(items) ? items : []
  memoryCache.set(slug, payload)
  return payload
}

export async function saveTownSpotlightData(townSlug, items = []) {
  const slug = normalizeSlug(townSlug)
  if (!slug) return false

  writeToMemory(slug, items)

  if (!isRedisConfigured()) {
    return true
  }
  try {
    const redis = getRedisClient()
    await redis.set(`${KEY_PREFIX}${slug}`, JSON.stringify(items), { ex: TTL_SECONDS })
    return true
  } catch (error) {
    console.warn('[spotlight] failed to persist spotlight cache', slug, error)
    return true
  }
}

export async function loadTownSpotlightData(townSlug) {
  const slug = normalizeSlug(townSlug)
  if (!slug) return null

  const memoized = readFromMemory(slug)
  if (memoized !== null) return memoized

  if (!isRedisConfigured()) {
    return null
  }

  try {
    const redis = getRedisClient()
    const raw = await redis.get(`${KEY_PREFIX}${slug}`)
    if (!raw) return null
    const text =
      typeof raw === 'string'
        ? raw
        : Buffer.isBuffer(raw)
          ? raw.toString('utf8')
          : String(raw)
    const parsed = JSON.parse(text)
    writeToMemory(slug, parsed)
    return parsed
  } catch (error) {
    console.warn('[spotlight] failed to read spotlight cache', townSlug, error)
    return null
  }
}

// Testing helper to ensure isolated state between runs
export function clearTownSpotlightMemoryCache() {
  memoryCache.clear()
}
