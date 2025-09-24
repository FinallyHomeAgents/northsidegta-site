import { buildDeletionKey, sanitizeEventId } from '../../../lib/admin-events'
import { readJsonBody } from '../../../lib/api-helpers'
import { getKvClient, isKvConfigured } from '../../../lib/kv-admin'
import { deleteEventsFromGithub, isGithubConfigured } from '../../../lib/github-admin'

function normalizeIds(ids) {
  const incoming = Array.isArray(ids) ? ids : []
  const normalized = incoming
    .map((value) => sanitizeEventId(value))
    .filter(Boolean)
  return Array.from(new Set(normalized))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message || 'Invalid request body.' })
    return
  }

  const ids = normalizeIds(body?.ids)
  if (!ids.length) {
    res.status(400).json({ ok: false, error: 'Provide at least one event id.' })
    return
  }

  if (isKvConfigured()) {
    try {
      const kv = getKvClient()
      await Promise.all(
        ids.map(async (id) => {
          const key = buildDeletionKey(id)
          if (!key) return
          await kv.set(key, '1')
        })
      )
    } catch (error) {
      console.error('[admin-events] failed to mark deletion', error)
      res.status(500).json({ ok: false, error: 'Failed to mark events as deleted.' })
      return
    }

    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ ok: true, count: ids.length, mode: 'soft' })
    return
  }

  if (!isGithubConfigured()) {
    res.status(503).json({ ok: false, error: 'Deletion disabled: GitHub not configured' })
    return
  }

  try {
    const result = await deleteEventsFromGithub(ids)
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ ok: true, count: result.count, mode: 'hard', prUrl: result.prUrl })
  } catch (error) {
    console.error('[admin-events] hard delete failed', error)
    const status = error?.status && Number.isInteger(error.status) ? error.status : 500
    const message = error?.message || 'Failed to delete events.'
    res.status(status).json({ ok: false, error: message })
  }
}
