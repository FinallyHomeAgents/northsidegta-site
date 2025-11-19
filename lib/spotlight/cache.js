import { getRedisClient, isRedisConfigured } from '../communityRanking/kv-client'

const KEY_PREFIX = 'spotlight:town:'
const TTL_SECONDS = 60 * 60 * 24 * 14

export async function saveTownSpotlightData(townSlug, items = []) {
  if (!isRedisConfigured()) {
    return false
  }
  const slug = String(townSlug || '')
    .trim()
    .toLowerCase()
  if (!slug) return false

  try {
    const redis = getRedisClient()
    await redis.set(`${KEY_PREFIX}${slug}`, JSON.stringify(items), { ex: TTL_SECONDS })
    return true
  } catch (error) {
    console.warn('[spotlight] failed to persist spotlight cache', slug, error)
    return false
  }
}

export async function loadTownSpotlightData(townSlug) {
  if (!isRedisConfigured()) {
    return null
  }
  const slug = String(townSlug || '')
    .trim()
    .toLowerCase()
  if (!slug) return null

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
    return JSON.parse(text)
  } catch (error) {
    console.warn('[spotlight] failed to read spotlight cache', townSlug, error)
    return null
  }
}
