import { z } from 'zod'

import { readJsonBody } from '../../lib/api-helpers'
import { loadCommunityPlaces } from '../../lib/community-places'
import { applyCommunityPlaceFallbacks } from '../../lib/communityRanking/place-fallbacks'
import { getRedisClient, isRedisConfigured } from '../../lib/communityRanking/kv-client'
import {
  createBallotHash,
  getClientIp,
  getDateKey,
  getUserAgent,
  normalizeCategory,
  normalizeTown,
} from '../../lib/communityRanking/utils'

const TURNSTILE_VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_SECRET = (process.env.TURNSTILE_SECRET_KEY || '').trim()
const BALLOT_TTL_SECONDS = 60 * 60 * 24

const TasteHubBallotItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
})

const BaseVoteSchema = z.object({
  choice: z.string().min(1),
  turnstileToken: z.string().optional(),
  honeypot: z.string().optional().or(z.null()),
})

const CommunityVoteSchema = BaseVoteSchema.extend({
  town: z.string().min(1),
  category: z.string().min(1),
})

const TasteHubVoteSchema = BaseVoteSchema.extend({
  rankingKey: z.string().min(1),
  ballotItems: z.array(TasteHubBallotItemSchema).optional(),
})

const VoteSchema = z.union([CommunityVoteSchema, TasteHubVoteSchema])

function normalizeRankingKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '-')
}

async function verifyTurnstile(token, remoteIp) {
  if (!TURNSTILE_SECRET) {
    return { ok: true, skipped: true }
  }
  if (!token) {
    return { ok: false, error: 'missing-token' }
  }

  const params = new URLSearchParams()
  params.append('secret', TURNSTILE_SECRET)
  params.append('response', token)
  if (remoteIp) {
    params.append('remoteip', remoteIp)
  }

  const response = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
    method: 'POST',
    body: params,
  })

  if (!response.ok) {
    return { ok: false, error: 'verification-failed' }
  }

  const payload = await response.json()
  if (!payload?.success) {
    return { ok: false, error: 'invalid-token' }
  }

  return { ok: true }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  if (!isRedisConfigured()) {
    res.status(503).json({ ok: false, error: 'Leaderboard storage unavailable' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Invalid request body' })
    return
  }

  const parsed = VoteSchema.safeParse(body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Invalid request payload' })
    return
  }

  const payload = parsed.data
  const { choice, turnstileToken, honeypot } = payload

  if (honeypot && honeypot.trim()) {
    res.status(200).json({ ok: true, ignored: true })
    return
  }

  const ip = getClientIp(req)
  const userAgent = getUserAgent(req)
  const dateKey = getDateKey()

  const redis = getRedisClient()

  if ('rankingKey' in payload) {
    await handleTasteHubVote({ res, redis, payload, ip, userAgent, dateKey })
    return
  }

  const { town, category } = payload
  const normalizedTown = normalizeTown(town)
  const normalizedCategory = normalizeCategory(category)

  const captcha = await verifyTurnstile(turnstileToken, ip)
  if (!captcha.ok) {
    res.status(400).json({ ok: false, error: 'turnstile-verification-failed' })
    return
  }

  const availablePlaces = applyCommunityPlaceFallbacks(
    loadCommunityPlaces({ town, category, status: 'published' }),
    { normalizedTown, normalizedCategory }
  )
  const selected = availablePlaces.find(
    (place) => String(place.slug || '').toLowerCase() === String(choice).toLowerCase()
  )

  if (!selected) {
    res.status(400).json({ ok: false, error: 'invalid-choice' })
    return
  }

  const ballotHash = createBallotHash(ip, userAgent, dateKey)
  const ballotKey = `rank:${normalizedCategory}:${normalizedTown}:ballot:${ballotHash}`
  const scoreKey = `rank:${normalizedCategory}:${normalizedTown}:score:${selected.slug}`
  const firstKey = `rank:${normalizedCategory}:${normalizedTown}:firsts:${selected.slug}`
  const cacheKey = `rank:${normalizedCategory}:${normalizedTown}:cache`

  try {
    const alreadyVoted = await redis.exists(ballotKey)
    if (alreadyVoted) {
      res.status(429).json({ ok: false, error: 'already-voted' })
      return
    }

    await redis.incr(scoreKey)
    await redis.incr(firstKey)
    await redis.set(ballotKey, '1', { ex: BALLOT_TTL_SECONDS })
    await redis.del(cacheKey)

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[rankings/vote] failed to record vote', error)
    res.status(500).json({ ok: false, error: 'failed-to-record' })
  }
}

async function handleTasteHubVote({ res, redis, payload, ip, userAgent, dateKey }) {
  const rankingKey = normalizeRankingKey(payload.rankingKey)
  if (!rankingKey) {
    res.status(400).json({ ok: false, error: 'invalid-ranking-key' })
    return
  }

  const choiceId = String(payload.choice || '').trim().toLowerCase()
  if (!choiceId) {
    res.status(400).json({ ok: false, error: 'invalid-choice' })
    return
  }

  const ballotItems = Array.isArray(payload.ballotItems) ? payload.ballotItems : []
  const normalizedBallot = ballotItems
    .map((item) => ({
      id: String(item.id || '').trim().toLowerCase(),
    }))
    .filter((item) => item.id)

  if (normalizedBallot.length > 0) {
    const allowed = normalizedBallot.some((item) => item.id === choiceId)
    if (!allowed) {
      res.status(400).json({ ok: false, error: 'invalid-choice' })
      return
    }
  }

  const baseKey = `tastehub:${rankingKey}`
  const ballotHash = createBallotHash(ip, userAgent, dateKey)
  const ballotKey = `${baseKey}:ballot:${ballotHash}`
  const scoreKey = `${baseKey}:score:${choiceId}`
  const firstKey = `${baseKey}:firsts:${choiceId}`
  const cacheKey = `${baseKey}:cache`

  try {
    const alreadyVoted = await redis.exists(ballotKey)
    if (alreadyVoted) {
      res.status(429).json({ ok: false, error: 'already-voted' })
      return
    }

    await redis.incr(scoreKey)
    await redis.incr(firstKey)
    await redis.set(ballotKey, '1', { ex: BALLOT_TTL_SECONDS })
    await redis.del(cacheKey)

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[rankings/vote] failed to record TasteHub vote', error)
    res.status(500).json({ ok: false, error: 'failed-to-record' })
  }
}
