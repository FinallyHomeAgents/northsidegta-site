import { buildCardLabel } from '../../lib/membership/card-label.js'
import { getRedisClient, isRedisConfigured } from '../../lib/membership/redis-client.js'
import { upsertBrevoContact } from '../../lib/membership/brevo-client.js'
import { buildInterestFlags, normalizeInterests } from '../../lib/membership/interests.js'

const CARD_NUMBER_KEY = 'last_membership_card_number'
const REGISTRATION_LOG_KEY = 'membership:registrations'

function isValidEmail(value) {
  return typeof value === 'string' && /.+@.+\..+/.test(value)
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
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid JSON body' })
    return
  }

  const fullName =
    (body.fullName || '').trim() || (body.firstName || '').trim() || (body.name || '').trim()
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const primaryTown = (body.primaryTown || '').toString().trim()
  const memberType = (body.memberType || '').toString().trim()
  const interests = normalizeInterests(body.interests)
  const interestFlags = buildInterestFlags(interests)
  const notUnderContract = body.notUnderContract ?? body.complianceConfirmed
  const shouldSyncBrevo = body.brevoSync !== false
  const brevoSource =
    typeof body.brevoSource === 'string' && body.brevoSource.trim() ? body.brevoSource.trim() : undefined
  const cardUrl = typeof body.cardUrl === 'string' && body.cardUrl.trim() ? body.cardUrl.trim() : undefined
  const hasValidEmail = isValidEmail(email)

  if (!fullName || !hasValidEmail || !primaryTown || !memberType || notUnderContract !== true) {
    res.status(400).json({
      success: false,
      error: 'Missing or invalid required fields.',
      missing: {
        fullName: !fullName,
        email: !hasValidEmail,
        primaryTown: !primaryTown,
        memberType: !memberType,
        notUnderContract: notUnderContract !== true,
      },
    })
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
      fullName,
      email,
      primaryTown,
      memberType,
      interests,
      notUnderContract: true,
      cardLabel,
      cardNumber,
      createdAt: new Date().toISOString(),
    }

    await Promise.all([
      redis.hset(`membership:card:${cardNumber}`, record),
      redis.lpush(REGISTRATION_LOG_KEY, JSON.stringify(record)),
    ])

    let brevoSynced = false

    if (
      shouldSyncBrevo &&
      process.env.BREVO_ENABLED !== 'false' &&
      process.env.BREVO_API_KEY &&
      process.env.BREVO_LIST_ID
    ) {
      try {
        await upsertBrevoContact({
          email,
          fullName,
          cardNumber,
          cardLabel,
          primaryTown,
          memberType,
          interests: interestFlags,
          complianceConfirmed: true,
          cardUrl,
          source: brevoSource,
          passId: cardNumber,
        })
        brevoSynced = true
      } catch (error) {
        console.error('[membership/register] Brevo sync failed', {
          message: error?.message,
          status: error?.responseStatus,
          body: error?.responseBody,
        })
      }
    }

    res.status(200).json({ success: true, cardNumber, cardLabel, fullName, brevoSynced })
  } catch (error) {
    console.error('[membership/register] failed to create membership', error)
    res.status(500).json({ success: false, error: 'Unable to create membership at this time.' })
  }
}
