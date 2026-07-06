import { Redis } from '@upstash/redis'

let cachedClient = null

function resolveConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.KV_URL ||
    ''
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.KV_REST_TOKEN ||
    ''

  if (!url || !token) {
    throw new Error('Community ranking KV is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.')
  }

  return { url, token }
}

export function getRedisClient() {
  if (cachedClient) return cachedClient
  const { url, token } = resolveConfig()
  cachedClient = new Redis({ url, token })
  return cachedClient
}

export function isRedisConfigured() {
  try {
    resolveConfig()
    return true
  } catch (error) {
    return false
  }
}
