import { Redis } from '@upstash/redis'
const prefix = 'northside-life:v1:'
// Walk the full index in bounded batches; admin/feed lists retain their 100-item limit.
export async function listSitemapStories(redis) {
  const stories = []
  const size = 100
  for (let start = 0; ; start += size) {
    const ids = await redis.zrange(prefix + 'index', start, start + size - 1, { rev: true })
    if (!ids.length) break
    const summaries = await redis.mget(...ids.map(id => prefix + 'summary:' + id))
    stories.push(...summaries.filter(d => d?.results?.website?.status === 'published'))
    if (ids.length < size) break
  }
  return stories
}
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
    const temporary = (globalThis.__lifeTemporary ||= new Map())
    return {
      async getPrivate(id) {
        try { return JSON.parse(await fs.readFile(path.join(root, id + '.private'), 'utf8')) }
        catch (e) { if (e.code === 'ENOENT') return null; throw e }
      },
      async setPrivate(id, data) {
        await fs.writeFile(path.join(root, id + '.private'), JSON.stringify(data), { mode: 0o600 })
      },
      async temporarySet(id, value, seconds) { temporary.set(id, { value, until: Date.now() + seconds * 1000 }) },
      async temporaryGet(id) { const item = temporary.get(id); return item && item.until > Date.now() ? item.value : null },
      async temporaryTake(id) {
        const item = temporary.get(id); temporary.delete(id)
        return item && item.until > Date.now() ? item.value : null
      },
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
      async listForSitemap() { return this.list() },
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
    getPrivate: (id) => redis.get(prefix + 'private:' + id),
    setPrivate: (id, data) => redis.set(prefix + 'private:' + id, data),
    temporarySet: (id, value, seconds) => redis.set(prefix + 'temporary:' + id, value, { ex: seconds }),
    temporaryGet: (id) => redis.get(prefix + 'temporary:' + id),
    temporaryTake: (id) => redis.getdel(prefix + 'temporary:' + id),
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
    listForSitemap: () => listSitemapStories(redis),
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
