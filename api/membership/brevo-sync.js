import { buildCardLabel } from '../../lib/membership/card-label.js'
import { buildInterestFlags, normalizeInterests } from '../../lib/membership/interests.js'
import { upsertBrevoContact } from '../../lib/membership/brevo-client.js'

function isValidEmail(value) {
  return typeof value === 'string' && /.+@.+\..+/.test(value)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    return
  }

  if (!process.env.BREVO_ENABLED || process.env.BREVO_ENABLED === 'false') {
    res.status(200).json({ ok: true, skipped: true })
    return
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Invalid JSON body' })
    return
  }

  const fullName = (body.fullName || '').trim()
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const primaryTown = (body.primaryTown || '').toString().trim()
  const memberType = (body.memberType || '').toString().trim()
  const cardNumber = (body.cardNumber || '').toString().trim()
  const cardLabel = (body.cardLabel || buildCardLabel(primaryTown)).toString().trim()
  const cardUrl = typeof body.cardUrl === 'string' && body.cardUrl.trim() ? body.cardUrl.trim() : undefined
  const source = typeof body.source === 'string' && body.source.trim() ? body.source.trim() : undefined
  const interests = normalizeInterests(body.interests)
  const interestFlags = buildInterestFlags(interests)
  const complianceConfirmed = body.complianceConfirmed !== false

  if (!fullName || !isValidEmail(email) || !primaryTown || !memberType || !cardNumber) {
    res.status(400).json({ ok: false, error: 'Missing or invalid required fields.' })
    return
  }

  try {
    const result = await upsertBrevoContact({
      email,
      fullName,
      cardNumber,
      cardLabel,
      primaryTown,
      memberType,
      interests: interestFlags,
      complianceConfirmed,
      cardUrl,
      source,
      passId: cardNumber,
    })

    res.status(200).json({ ok: true, result })
  } catch (error) {
    console.error('[membership/brevo-sync] Brevo sync failed', {
      message: error?.message,
      status: error?.responseStatus,
      body: error?.responseBody,
    })
    res.status(502).json({ ok: false, error: 'Brevo sync failed' })
  }
}
