import { z } from 'zod'

import { loadCommunityPlaces } from '../../lib/community-places'
import { applyCommunityPlaceFallbacks } from '../../lib/communityRanking/place-fallbacks'
import { getRedisClient, isRedisConfigured } from '../../lib/communityRanking/kv-client'
import { normalizeCategory, normalizeTown } from '../../lib/communityRanking/utils'

const QuerySchema = z.object({
  town: z.string().min(1),
  category: z.string().min(1),
})

function normalizeRankingKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '-')
}

function parseBallotParam(rawBallot) {
  if (!rawBallot) return []
  const payload = Array.isArray(rawBallot) ? rawBallot[0] : rawBallot
  if (typeof payload !== 'string' || !payload.trim()) return []

  try {
    const parsed = JSON.parse(payload)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => {
        if (!item) return null
        const id = String(item.id || item.slug || '').trim().toLowerCase()
        const title = String(item.title || item.name || '').trim()
        if (!id) return null
        return { id, title: title || id }
      })
      .filter(Boolean)
  } catch (error) {
    console.warn('[rankings/leaderboard] Failed to parse ballot param', error)
    return []
  }
}

const CACHE_TTL_SECONDS = 600

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  if (!isRedisConfigured()) {
    res.status(503).json({ ok: false, error: 'Leaderboard storage unavailable' })
    return
  }

  const rawRankingKey = Array.isArray(req.query.rankingKey)
    ? req.query.rankingKey[0]
    : req.query.rankingKey
  const rankingKey = normalizeRankingKey(rawRankingKey)

  if (rankingKey) {
    await handleRankingKeyLeaderboard({ req, res, rankingKey, rawRankingKey })
    return
  }

  const parsed = QuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Invalid query parameters' })
    return
  }

  const { town, category } = parsed.data
  const normalizedTown = normalizeTown(town)
  const normalizedCategory = normalizeCategory(category)
  const cacheKey = `rank:${normalizedCategory}:${normalizedTown}:cache`

  try {
    const redis = getRedisClient()
    const cached = await redis.get(cacheKey)
    if (cached) {
      const payload = typeof cached === 'string' ? JSON.parse(cached) : cached
      res.status(200).json(payload)
      return
    }

    const places = applyCommunityPlaceFallbacks(
      loadCommunityPlaces({ town, category, status: 'published' }),
      { normalizedTown, normalizedCategory }
    )
    const pipeline = redis.pipeline()
    const keyPairs = []

    for (const place of places) {
      const scoreKey = `rank:${normalizedCategory}:${normalizedTown}:score:${place.slug}`
      const firstKey = `rank:${normalizedCategory}:${normalizedTown}:firsts:${place.slug}`
      pipeline.get(scoreKey)
      pipeline.get(firstKey)
      keyPairs.push({ slug: place.slug, title: place.title })
    }

    const results = keyPairs.length ? await pipeline.exec() : []
    const items = []

    for (let index = 0; index < keyPairs.length; index++) {
      const scoreResult = results[index * 2]
      const firstResult = results[index * 2 + 1]
      const scoreValue = Number(scoreResult ?? 0) || 0
      const firstValue = Number(firstResult ?? 0) || 0
      items.push({
        slug: keyPairs[index].slug,
        title: keyPairs[index].title,
        score: scoreValue,
        firsts: firstValue,
      })
    }

    const totalBallots = items.reduce((sum, item) => sum + item.score, 0)

    items.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.firsts !== a.firsts) return b.firsts - a.firsts
      return a.title.localeCompare(b.title)
    })

    const payload = {
      town,
      category,
      normalizedTown,
      normalizedCategory,
      updatedAt: new Date().toISOString(),
      totalBallots,
      items,
    }

    await redis.set(cacheKey, JSON.stringify(payload), { ex: CACHE_TTL_SECONDS })

    res.status(200).json(payload)
  } catch (error) {
    console.error('[rankings/leaderboard] failed', error)
    res.status(500).json({ ok: false, error: 'failed-to-load' })
  }
}

async function handleRankingKeyLeaderboard({ req, res, rankingKey, rawRankingKey }) {
  const redis = getRedisClient()
  const cacheKey = `tastehub:${rankingKey}:cache`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      const payload = typeof cached === 'string' ? JSON.parse(cached) : cached
      res.status(200).json(payload)
      return
    }

    const ballot = parseBallotParam(req.query.ballot)
    const candidates = [...ballot]
    const seen = new Set(candidates.map((item) => item.id))
    const scorePrefix = `tastehub:${rankingKey}:score:`
    const firstPrefix = `tastehub:${rankingKey}:firsts:`

    try {
      for await (const key of redis.scanIterator({ match: `${scorePrefix}*` })) {
        const keyString = typeof key === 'string' ? key : String(key)
        const candidateId = keyString.slice(scorePrefix.length)
        if (!candidateId || seen.has(candidateId)) continue
        seen.add(candidateId)
        candidates.push({ id: candidateId, title: candidateId })
      }
    } catch (error) {
      console.warn('[rankings/leaderboard] scanIterator failed', error)
    }

    const pipeline = redis.pipeline()
    for (const candidate of candidates) {
      pipeline.get(`${scorePrefix}${candidate.id}`)
      pipeline.get(`${firstPrefix}${candidate.id}`)
    }

    const results = candidates.length ? await pipeline.exec() : []
    const items = []

    for (let index = 0; index < candidates.length; index++) {
      const scoreResult = results[index * 2]
      const firstResult = results[index * 2 + 1]
      const scoreValue = Number(scoreResult ?? 0) || 0
      const firstValue = Number(firstResult ?? 0) || 0
      const candidate = candidates[index]
      items.push({
        id: candidate.id,
        slug: candidate.id,
        title: candidate.title || candidate.id,
        score: scoreValue,
        firsts: firstValue,
      })
    }

    const totalBallots = items.reduce((sum, item) => sum + item.score, 0)

    items.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.firsts !== a.firsts) return b.firsts - a.firsts
      return a.title.localeCompare(b.title)
    })

    const payload = {
      rankingKey: rawRankingKey || rankingKey,
      normalizedRankingKey: rankingKey,
      updatedAt: new Date().toISOString(),
      totalBallots,
      items,
    }

    await redis.set(cacheKey, JSON.stringify(payload), { ex: CACHE_TTL_SECONDS })
    res.status(200).json(payload)
  } catch (error) {
    console.error('[rankings/leaderboard] failed for rankingKey', rankingKey, error)
    res.status(500).json({ ok: false, error: 'failed-to-load' })
  }
}
