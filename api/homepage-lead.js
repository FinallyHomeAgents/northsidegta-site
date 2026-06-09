import { Resend } from 'resend'

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const LEAD_TO_EMAIL = process.env.LEAD_TO_EMAIL || process.env.AGENT_EMAIL || 'contact@finallyhomeagents.com'
const LEAD_FROM_EMAIL =
  process.env.LEAD_FROM_EMAIL || 'NorthSide GTA <no-reply@northsidegta.ca>'
const THANK_YOU_PATH = '/thank-you?source=homepage-lead'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeText(value, max = 250) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, max)
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getClientIp(req) {
  const header = req.headers['x-forwarded-for']
  if (Array.isArray(header)) return header[0] || 'unknown'
  if (typeof header === 'string') return header.split(',')[0].trim() || 'unknown'
  return req.socket?.remoteAddress || 'unknown'
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

function sendError(req, res, status, error) {
  if (wantsJson(req)) {
    res.status(status).json({ ok: false, error })
    return
  }

  res.status(status).send(error)
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
    sendError(req, res, 400, 'Invalid request body.')
    return
  }

  if (normalizeText(body['bot-field'] || body.botField, 120)) {
    if (wantsJson(req)) {
      res.status(200).json({ ok: true })
      return
    }
    res.writeHead(303, { Location: THANK_YOU_PATH })
    res.end()
    return
  }

  const payload = {
    name: normalizeText(body.name, 120),
    contact: normalizeText(body.contact, 180),
    community: normalizeText(body.community, 120),
    sourceUrl: normalizeText(body.sourceUrl, 500),
    formName: normalizeText(body['form-name'] || body.formName || 'homepage-lead', 120),
  }

  if (!payload.name || !payload.contact || !payload.community) {
    sendError(req, res, 400, 'Please complete name, contact, and community.')
    return
  }

  const replyTo = EMAIL_REGEX.test(payload.contact) ? payload.contact : undefined
  const ip = getClientIp(req)
  const submittedAt = new Date().toISOString()

  if (!resendClient) {
    sendError(req, res, 500, 'Email service not configured.')
    return
  }

  const html = `
    <div style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
      <h2 style="margin-bottom:12px;">New Homepage Lead</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;font-weight:600;">Name</td><td style="padding:6px 0;">${escapeHtml(payload.name)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Phone or email</td><td style="padding:6px 0;">${escapeHtml(payload.contact)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Community interest</td><td style="padding:6px 0;">${escapeHtml(payload.community)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Source page</td><td style="padding:6px 0;">${escapeHtml(payload.sourceUrl || 'https://northsidegta.ca/')}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Form</td><td style="padding:6px 0;">${escapeHtml(payload.formName)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Submitted</td><td style="padding:6px 0;">${escapeHtml(submittedAt)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">IP</td><td style="padding:6px 0;">${escapeHtml(ip)}</td></tr>
      </table>
    </div>
  `

  const text = [
    'New Homepage Lead',
    `Name: ${payload.name}`,
    `Phone or email: ${payload.contact}`,
    `Community interest: ${payload.community}`,
    `Source page: ${payload.sourceUrl || 'https://northsidegta.ca/'}`,
    `Form: ${payload.formName}`,
    `Submitted: ${submittedAt}`,
    `IP: ${ip}`,
  ].join('\n')

  try {
    await resendClient.emails.send({
      from: LEAD_FROM_EMAIL,
      to: [LEAD_TO_EMAIL],
      subject: `Homepage Lead — ${payload.community} — ${payload.name}`,
      ...(replyTo ? { replyTo } : {}),
      html,
      text,
    })

    if (wantsJson(req)) {
      res.status(200).json({ ok: true })
      return
    }

    res.writeHead(303, { Location: THANK_YOU_PATH })
    res.end()
  } catch (error) {
    console.error('[homepage-lead] failed', error)
    sendError(req, res, 502, 'Unable to send lead right now.')
  }
}
