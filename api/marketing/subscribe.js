import { z } from 'zod'

import { readJsonBody } from '../../lib/api-helpers'
import { getRedisClient, isRedisConfigured } from '../../lib/communityRanking/kv-client'
import { getClientIp, getUserAgent, sha256 } from '../../lib/communityRanking/utils'

const SubscribeSchema = z.object({
  email: z.string().email(),
  consent: z.literal(true),
  source: z.string().min(1),
})

async function triggerEspSubscribe({ email, source }) {
  const apiKey = (process.env.ESP_API_KEY || '').trim()
  const listId = (process.env.ESP_LIST_ID || '').trim()
  const endpoint = (process.env.ESP_SUBSCRIBE_URL || '').trim()

  if (!apiKey || !listId || !endpoint) {
    console.warn('[marketing/subscribe] ESP integration not configured; skipping remote subscribe')
    return { ok: true, skipped: true }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        listId,
        source,
        doubleOptIn: true,
      }),
    })

    if (!response.ok) {
      const message = await response.text()
      console.error('[marketing/subscribe] ESP request failed', message)
      return { ok: false, error: 'esp-request-failed' }
    }

    return { ok: true }
  } catch (error) {
    console.error('[marketing/subscribe] ESP request error', error)
    return { ok: false, error: 'esp-request-error' }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  if (!isRedisConfigured()) {
    res.status(503).json({ ok: false, error: 'Consent log unavailable' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Invalid request body' })
    return
  }

  const parsed = SubscribeSchema.safeParse(body)
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: 'Invalid request payload' })
    return
  }

  const { email, source } = parsed.data
  const normalizedEmail = email.trim().toLowerCase()
  const emailHash = sha256(normalizedEmail)
  const ip = getClientIp(req)
  const userAgent = getUserAgent(req)

  const consentRecord = {
    emailSha: emailHash,
    email: normalizedEmail,
    source,
    ts: new Date().toISOString(),
    ipHash: sha256(ip || 'unknown'),
    userAgent,
  }

  try {
    const redis = getRedisClient()
    await redis.set(`consent:${emailHash}`, JSON.stringify(consentRecord))

    const espResult = await triggerEspSubscribe({ email: normalizedEmail, source })
    if (!espResult.ok) {
      res.status(502).json({ ok: false, error: espResult.error || 'esp-error' })
      return
    }

    res.status(200).json({ ok: true, subscribed: !espResult.skipped, skipped: !!espResult.skipped })
  } catch (error) {
    console.error('[marketing/subscribe] failed', error)
    res.status(500).json({ ok: false, error: 'failed-to-save' })
  }
}
