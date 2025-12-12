import { readJsonBody } from '../../lib/api-helpers.js'
import { buildCardLabel } from '../../lib/membership/card-label.js'
import { getRedisClient, isRedisConfigured } from '../../lib/membership/redis-client.js'

const CARD_NUMBER_KEY = 'last_membership_card_number'
const REGISTRATION_LOG_KEY = 'membership:registrations'

function isValidEmail(value) {
  return typeof value === 'string' && /.+@.+\..+/.test(value)
}

function normalizeInterests(interests) {
  if (!Array.isArray(interests)) return []
  return interests.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ success: false, error: 'Method Not Allowed' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    res.status(400).json({ success: false, error: error?.message || 'Invalid JSON body' })
    return
  }

  const {
    firstName,
    email,
    primaryTown,
    memberType,
    interests = [],
    complianceConfirmed,
  } = body || {}

  if (!complianceConfirmed) {
    res.status(400).json({ success: false, error: 'Compliance confirmation is required.' })
    return
  }

  if (!firstName || !primaryTown || !memberType || !isValidEmail(email)) {
    res.status(400).json({ success: false, error: 'Missing or invalid required fields.' })
    return
  }

  if (!isRedisConfigured()) {
    res.status(500).json({ success: false, error: 'Membership storage is not configured.' })
    return
  }

  const redis = getRedisClient()

  try {
    const nextNumber = await redis.incr(CARD_NUMBER_KEY)
    const cardNumber = String(nextNumber).padStart(8, '0')
    const cardLabel = buildCardLabel(primaryTown)

    const record = {
      firstName: firstName.toString().trim(),
      email: email.toString().trim().toLowerCase(),
      primaryTown: primaryTown.toString(),
      memberType: memberType.toString(),
      interests: normalizeInterests(interests),
      cardLabel,
      cardNumber,
      createdAt: new Date().toISOString(),
    }

    await Promise.all([
      redis.hset(`membership:card:${cardNumber}`, record),
      redis.lpush(REGISTRATION_LOG_KEY, JSON.stringify(record)),
    ])

    res.status(200).json({ success: true, cardNumber, cardLabel })
  } catch (error) {
    console.error('[membership/register] failed to create membership', error)
    res.status(500).json({ success: false, error: 'Unable to create membership at this time.' })
  }
}
