import { sanitizeEventId } from '../../../lib/admin-events'
import { readJsonBody } from '../../../lib/api-helpers'
import { isGithubConfigured, updateEventStatus } from '../../../lib/github-admin.js'

function resolveId(payload) {
  if (!payload) return ''
  if (typeof payload.id === 'string') return sanitizeEventId(payload.id)
  if (typeof payload.slug === 'string') return sanitizeEventId(payload.slug)
  return ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    return
  }

  if (!isGithubConfigured()) {
    res.status(503).json({ ok: false, error: 'Publishing disabled: GitHub not configured' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message || 'Invalid request body.' })
    return
  }

  const id = resolveId(body)
  if (!id) {
    res.status(400).json({ ok: false, error: 'Provide an event id or slug.' })
    return
  }

  try {
    const result = await updateEventStatus(id, 'published')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({
      ok: true,
      status: result.status,
      previousStatus: result.previousStatus,
      prUrl: result.prUrl || null,
      changed: result.changed,
    })
  } catch (error) {
    console.error('[admin-events] publish failed', error)
    const status = error?.status && Number.isInteger(error.status) ? error.status : 500
    res.status(status).json({ ok: false, error: error?.message || 'Failed to publish event.' })
  }
}
