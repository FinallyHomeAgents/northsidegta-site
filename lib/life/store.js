import { Redis } from '@upstash/redis'
const prefix = 'northside-life:v1:'
export function configured(env) {
  return Boolean(
    (env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL) &&
    (env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN)
  )
}
export async function createStore(env) {
  if (env.LIFE_LOCAL_DEV === '1' && !env.VERCEL) {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const root = path.resolve(env.LIFE_LOCAL_DATA || '.life-local')
    await fs.mkdir(root, { recursive: true })
    const locks = (globalThis.__lifeLocks ||= new Map())
    const counters = (globalThis.__lifeCounters ||= new Map())
    return {
      async get(id) {
        try {
          return JSON.parse(
            await fs.readFile(path.join(root, id + '.json'), 'utf8')
          )
        } catch (e) {
          if (e.code === 'ENOENT') return null
          throw e
        }
      },
      async set(id, data) {
        const f = path.join(root, id + '.json')
        const temp = f + '.tmp'
        await fs.writeFile(temp, JSON.stringify(data))
        await fs.rename(temp, f)
      },
      async list() {
        const names = await fs.readdir(root)
        return (
          await Promise.all(
            names
              .filter((n) => n.endsWith('.json'))
              .map((n) => this.get(n.slice(0, -5)))
          )
        )
          .filter(Boolean)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      },
      async lock(id) {
        if (locks.has(id)) return false
        locks.set(id, true)
        return true
      },
      async unlock(id) {
        locks.delete(id)
      },
      async limit(id, max, seconds) {
        const now = Date.now()
        let c = counters.get(id)
        if (!c || c.until < now) c = { n: 0, until: now + seconds * 1000 }
        c.n++
        counters.set(id, c)
        return c.n <= max
      },
    }
  }
  if (!configured(env)) throw new Error('Shared storage is not connected yet.')
  const redis = new Redis({
    url: env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL,
    token: env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN,
  })
  return {
    get: (id) => redis.get(prefix + id),
    async set(id, d) {
      const { photo, localPublishedImage, ...summary } = d
      await redis.set(prefix + id, d)
      await redis.set(prefix + 'summary:' + id, summary)
      await redis.zadd(prefix + 'index', {
        score: Date.parse(d.updatedAt),
        member: id,
      })
    },
    async list() {
      const ids = await redis.zrange(prefix + 'index', 0, 99, { rev: true })
      return ids.length
        ? (
            await redis.mget(...ids.map((id) => prefix + 'summary:' + id))
          ).filter(Boolean)
        : []
    },
    async lock(id) {
      return Boolean(
        await redis.set(prefix + 'lock:' + id, '1', { nx: true, ex: 180 })
      )
    },
    async unlock(id) {
      await redis.del(prefix + 'lock:' + id)
    },
    async limit(id, max, seconds) {
      const key = prefix + 'limit:' + id
      const n = await redis.incr(key)
      if (n === 1) await redis.expire(key, seconds)
      return n <= max
    },
  }
}
