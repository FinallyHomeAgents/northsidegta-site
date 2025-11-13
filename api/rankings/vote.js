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

const VoteSchema = z.object({
  town: z.string().min(1),
  category: z.string().min(1),
  choice: z.string().min(1),
  turnstileToken: z.string().optional(),
  honeypot: z.string().optional().or(z.null()),
})

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

  const { town, category, choice, turnstileToken, honeypot } = parsed.data

  const normalizedTown = normalizeTown(town)
  const normalizedCategory = normalizeCategory(category)

  if (honeypot && honeypot.trim()) {
    res.status(200).json({ ok: true, ignored: true })
    return
  }

  const ip = getClientIp(req)
  const userAgent = getUserAgent(req)
  const dateKey = getDateKey()

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
    const redis = getRedisClient()
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
