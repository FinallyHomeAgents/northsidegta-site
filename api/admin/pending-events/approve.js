import { sanitizeEventId } from '../../../lib/admin-events'
import { readJsonBody } from '../../../lib/api-helpers'
import { approvePendingEvent, isGithubConfigured } from '../../../lib/github-admin.js'

function resolveId(body) {
  if (!body) return ''
  if (typeof body.slug === 'string') return sanitizeEventId(body.slug)
  if (typeof body.id === 'string') return sanitizeEventId(body.id)
  return ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    return
  }

  if (!isGithubConfigured()) {
    res.status(503).json({ ok: false, error: 'Approval unavailable: GitHub not configured.' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Invalid JSON body.' })
    return
  }

  const id = resolveId(body)
  if (!id) {
    res.status(400).json({ ok: false, error: 'Provide a pending event id.' })
    return
  }

  try {
    const result = await approvePendingEvent(id)
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ ok: true, status: result.status, prUrl: result.prUrl || null })
  } catch (error) {
    console.error('[pending-events] approval failed', error)
    const status = error?.status && Number.isInteger(error.status) ? error.status : 500
    res.status(status).json({ ok: false, error: error?.message || 'Failed to approve submission.' })
  }
}
