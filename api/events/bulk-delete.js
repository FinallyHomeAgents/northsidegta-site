import fs from 'fs'
import path from 'path'

const EVENTS_DIR = path.join(process.cwd(), 'public', 'data', 'events')

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

async function readRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      const trimmed = req.body.trim()
      if (!trimmed) return {}
      try {
        return JSON.parse(trimmed)
      } catch (error) {
        throw new Error('Invalid JSON body')
      }
    }
    if (typeof req.body === 'object') {
      return req.body
    }
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (!chunks.length) return {}
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch (error) {
    throw new Error('Invalid JSON body')
  }
}

function sanitizeId(value) {
  const raw = cleanString(value)
  if (!raw) return ''
  const normalized = raw.toLowerCase()
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return ''
  }
  return normalized
}

function getEventFilePath(id) {
  return path.join(EVENTS_DIR, `${id}.json`)
}

async function deleteEventFile(id) {
  const filePath = getEventFilePath(id)
  if (!filePath.startsWith(EVENTS_DIR)) {
    throw new Error('Invalid path')
  }
  await fs.promises.unlink(filePath)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let body
  try {
    body = await readRequestBody(req)
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid request body.' })
    return
  }

  const incomingIds = Array.isArray(body?.ids) ? body.ids : []
  if (!incomingIds.length) {
    res.status(400).json({ error: 'Provide at least one event id.' })
    return
  }

  const results = []

  for (const originalId of incomingIds) {
    const safeId = sanitizeId(originalId)
    if (!safeId) {
      results.push({
        id: cleanString(originalId) || 'unknown',
        ok: false,
        message: 'Invalid event id.',
      })
      continue
    }

    try {
      await deleteEventFile(safeId)
      results.push({ id: safeId, ok: true })
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        results.push({ id: safeId, ok: true, message: 'Event already removed.' })
      } else {
        console.error('[events-bulk-delete] failed to delete', safeId, error)
        results.push({
          id: safeId,
          ok: false,
          message:
            error && error.code === 'EROFS'
              ? 'Events storage is read-only in this environment.'
              : 'Failed to delete event.',
        })
      }
    }
  }

  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'application/json')
  res.status(200).json({ results })
}
