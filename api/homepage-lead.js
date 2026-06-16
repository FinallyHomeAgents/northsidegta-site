const FORMSPREE_ENDPOINT = (process.env.FORMSPREE_ENDPOINT ?? '').trim()
const DEFAULT_PAGE_URL = 'https://northsidegta.ca/'

function normalizeText(value, max = 250) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, max)
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function readBody(req) {
  if (req.body) {
    if (typeof req.body === 'object') return req.body
    if (typeof req.body === 'string') return parseRawBody(req.body, req.headers['content-type'])
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (!chunks.length) return {}
  return parseRawBody(Buffer.concat(chunks).toString('utf8'), req.headers['content-type'])
}

function parseRawBody(raw, contentType = '') {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return {}

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(trimmed))
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(trimmed)
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    return Object.fromEntries(new URLSearchParams(trimmed))
  }
}

function wantsJson(req) {
  const accept = req.headers.accept || ''
  const contentType = req.headers['content-type'] || ''
  return accept.includes('application/json') || contentType.includes('application/json')
}

function sendJson(req, res, status, body) {
  if (wantsJson(req)) {
    res.status(status).json(body)
    return
  }

  res.status(status).send(body.error || 'Unable to submit lead right now.')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  let body
  try {
    body = await readBody(req)
  } catch (error) {
    sendJson(req, res, 400, { ok: false, error: 'Invalid request body.' })
    return
  }

  if (normalizeText(body['bot-field'] || body.botField, 120)) {
    sendJson(req, res, 200, { ok: true })
    return
  }

  const submittedAt = normalizeText(body.submittedAt, 80) || new Date().toISOString()
  const pageUrl = normalizeText(body.pageUrl || body.sourceUrl, 500) || DEFAULT_PAGE_URL
  const payload = {
    name: normalizeText(body.name, 120),
    contact: normalizeText(body.contact, 180),
    community: normalizeText(body.community, 120),
    source: 'Homepage form',
    pageUrl,
    submittedAt,
  }

  if (!payload.name || !payload.contact || !payload.community) {
    sendJson(req, res, 400, { ok: false, error: 'Please complete name, contact, and community.' })
    return
  }

  if (!FORMSPREE_ENDPOINT || !isHttpUrl(FORMSPREE_ENDPOINT)) {
    console.error('[homepage-lead] Formspree endpoint is not configured')
    sendJson(req, res, 500, { ok: false, error: 'Lead form is not configured right now.' })
    return
  }

  try {
    const formspreeResponse = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        Name: payload.name,
        'Phone or email': payload.contact,
        'Selected town/community': payload.community,
        Source: payload.source,
        'Page URL': payload.pageUrl,
        'Submitted date/time': payload.submittedAt,
        _subject: `Homepage Lead — ${payload.community} — ${payload.name}`,
        _gotcha: '',
      }),
    })

    if (!formspreeResponse.ok) {
      let responseText = ''
      try {
        responseText = await formspreeResponse.text()
      } catch (error) {
        console.error('[homepage-lead] failed to read Formspree error response', error)
      }
      console.error('[homepage-lead] Formspree error', formspreeResponse.status, responseText)
      sendJson(req, res, 502, { ok: false, error: 'Unable to send lead right now.' })
      return
    }

    sendJson(req, res, 200, { ok: true })
  } catch (error) {
    console.error('[homepage-lead] Formspree request failed', error)
    sendJson(req, res, 502, { ok: false, error: 'Unable to send lead right now.' })
  }
}
