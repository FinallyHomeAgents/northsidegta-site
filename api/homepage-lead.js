const FORMSPREE_ENDPOINT = (process.env.FORMSPREE_ENDPOINT ?? '').trim()
const DEFAULT_PAGE_URL = 'https://northsidegta.ca/'
const SUCCESS_MESSAGE_HEADING = 'Thanks — we received your request.'
const SUCCESS_MESSAGE_BODY = 'We’ll reach out within 24 hours to learn more about what you’re looking for and help you compare your options in the NorthSide GTA.'

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
  let bytes = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    bytes += buffer.length
    if (bytes > 8192) throw Error('body too large')
    chunks.push(buffer)
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

function sendResponse(req, res, status, body) {
  if (wantsJson(req)) {
    res.status(status).json(body)
    return
  }

  if (body.ok) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(status).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Homepage form received | NorthSide GTA</title>
  </head>
  <body>
    <main role="main" aria-labelledby="homepage-lead-success" style="max-width:42rem;margin:4rem auto;padding:0 1.5rem;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#0f172a;">
      <h1 id="homepage-lead-success" style="font-size:1.5rem;line-height:1.3;margin:0 0 1rem;">${SUCCESS_MESSAGE_HEADING}</h1>
      <p style="margin:0 0 1.5rem;">${SUCCESS_MESSAGE_BODY}</p>
      <p><a href="/" style="color:#32610e;font-weight:600;">Return to the homepage</a></p>
    </main>
  </body>
</html>`)
    return
  }

  res.status(status).send(body.error || 'Unable to submit lead right now.')
}

export function createHomepageHandler({ guard, queueInquiry, fetchImpl = (...args) => fetch(...args) } = {}) {
return async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  let body
  try {
    body = await readBody(req)
    if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > 8192) throw Error('body')
  } catch (error) {
    sendResponse(req, res, 400, { ok: false, error: 'Invalid request body.' })
    return
  }

  if (normalizeText(body['bot-field'] || body.botField, 120)) {
    sendResponse(req, res, 200, { ok: true })
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

  const communities = new Set(['Aurora', 'Newmarket', 'East Gwillimbury', 'Georgina', 'Stouffville', 'Uxbridge', 'Scugog', 'Not sure yet'])
  const validContact = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact) || /^[+()\d .-]+$/.test(payload.contact) && payload.contact.replace(/\D/g, '').length >= 10 && payload.contact.replace(/\D/g, '').length <= 15
  if (!payload.name || !validContact || !communities.has(payload.community)) {
    sendResponse(req, res, 400, { ok: false, error: 'Please complete name, contact, and community.' })
    return
  }

  if (!FORMSPREE_ENDPOINT || !isHttpUrl(FORMSPREE_ENDPOINT)) {
    console.error('[homepage-lead] Formspree endpoint is not configured')
    sendResponse(req, res, 500, { ok: false, error: 'Lead form is not configured right now.' })
    return
  }

  let reservation
  try {
    const protect = guard || (await import('../lib/homepage-spam.mjs')).createSpamGuard()
    reservation = await protect(req, body, payload)
    if (reservation.duplicate) { sendResponse(req, res, 200, { ok: true, ...(process.env.VERCEL_ENV === 'preview' ? {preview: true} : {}) }); return }
  } catch (error) {
    if (error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter))
    sendResponse(req, res, error.status || 503, { ok: false, error: error.message || 'Please try again later.' })
    return
  }

  // Preview submissions exercise protection but never create HQ records or send mail.
  if (process.env.VERCEL_ENV === 'preview') {
    await reservation.complete().catch(() => {});
    sendResponse(req, res, 200, { ok: true, preview: true });
    return;
  }

  // Proposed capture hook: disabled until the approved rollout enables it.
  if (process.env.NORTHSIDE_HQ_CAPTURE_ENABLED === 'true') {
    try {
      const {queueHomepageInquiry} = await import('../lib/headquarters-capture.mjs')
      await (queueInquiry || queueHomepageInquiry)({...payload, submissionId: normalizeText(body.submissionId, 80)})
    } catch {
      await reservation.release().catch(() => {})
      sendResponse(req, res, 503, { ok: false, error: 'Unable to save your inquiry right now. Please try again.' })
      return
    }
  }

  try {
    const formspreeResponse = await fetchImpl(FORMSPREE_ENDPOINT, {
      signal: AbortSignal.timeout(10000),
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
      await reservation.release().catch(() => {})
      sendResponse(req, res, 502, { ok: false, error: 'Unable to send lead right now.' })
      return
    }

    await reservation.complete().catch(() => { console.warn('[homepage-lead] Duplicate receipt marker unavailable after delivery') })
    sendResponse(req, res, 200, { ok: true })
  } catch (error) {
    console.error('[homepage-lead] Formspree request failed', error)
    // An uncertain upstream timeout retains the short lease to avoid immediate double sends.
    sendResponse(req, res, 502, { ok: false, error: 'Unable to send lead right now.' })
  }
}

}
export default createHomepageHandler()
