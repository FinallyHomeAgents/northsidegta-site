import { Resend } from 'resend'

import { readJsonBody } from '../lib/api-helpers'
import { getKvClient, isKvConfigured } from '../lib/kv-admin'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_MAX = 8
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60
const TIME_REGEX = /^([01]\d|2[0-3]):(00|30)$/

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const LEAD_TO_EMAIL = process.env.LEAD_TO_EMAIL || 'contact@finallyhomeagents.com'
const LEAD_FROM_EMAIL =
  process.env.LEAD_FROM_EMAIL || 'Finally Home Agents <no-reply@northsidegta.ca>'

function normalizeText(value, max = 250) {
  if (typeof value !== 'string') return ''
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.slice(0, max)
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

function formatDateTime(date, time) {
  const [hour, minute] = time.split(':').map((part) => Number(part))
  const local = new Date(`${date}T00:00:00`)
  local.setHours(hour, minute, 0, 0)
  return local.toLocaleString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parsed >= today
}

function isValidTime(value) {
  if (!TIME_REGEX.test(value)) return false
  const [hour, minute] = value.split(':').map((part) => Number(part))
  if (hour < 9 || hour > 21) return false
  if (hour === 21 && minute !== 0) return false
  return true
}

async function checkRateLimit(ip) {
  if (!ip || !isKvConfigured()) {
    return { allowed: true, count: 0 }
  }

  try {
    const kv = getKvClient()
    const key = `coffee-request:${ip}`
    const count = await kv.incr(key)
    if (count === 1) {
      await kv.expire(key, RATE_LIMIT_WINDOW_SECONDS)
    }
    return { allowed: count <= RATE_LIMIT_MAX, count }
  } catch (error) {
    console.warn('[coffee-request] rate-limit check failed', error)
    return { allowed: true, count: 0 }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Invalid JSON body' })
    return
  }

  const payload = {
    fullName: normalizeText(body.fullName, 120),
    phone: normalizeText(body.phone, 40),
    email: normalizeText(body.email, 160),
    address1: normalizeText(body.address1, 160),
    address2: normalizeText(body.address2, 160),
    city: normalizeText(body.city, 120),
    postalCode: normalizeText(body.postalCode, 40),
    notes: normalizeText(body.notes, 2000),
    requestedDate: normalizeText(body.requestedDate, 10),
    requestedTime: normalizeText(body.requestedTime, 5),
    sourceUrl: normalizeText(body.sourceUrl, 500),
    website: normalizeText(body.website, 120),
  }

  if (payload.website) {
    res.status(200).json({ ok: true })
    return
  }

  const ip = getClientIp(req)
  const rateLimit = await checkRateLimit(ip)
  if (!rateLimit.allowed) {
    res.status(429).json({ ok: false, error: 'Too many requests. Please try again shortly.' })
    return
  }

  if (
    !payload.fullName
    || !payload.phone
    || !payload.email
    || !payload.address1
    || !payload.city
    || !payload.postalCode
    || !payload.requestedDate
    || !payload.requestedTime
  ) {
    res.status(400).json({ ok: false, error: 'Missing required fields.' })
    return
  }

  if (!EMAIL_REGEX.test(payload.email)) {
    res.status(400).json({ ok: false, error: 'Invalid email.' })
    return
  }

  if (payload.phone.replace(/\D/g, '').length < 10) {
    res.status(400).json({ ok: false, error: 'Invalid phone number.' })
    return
  }

  if (!isValidDate(payload.requestedDate)) {
    res.status(400).json({ ok: false, error: 'Please select a future date.' })
    return
  }

  if (!isValidTime(payload.requestedTime)) {
    res.status(400).json({ ok: false, error: 'Please select a valid time between 9:00 AM and 9:00 PM.' })
    return
  }

  if (!resendClient) {
    res.status(500).json({ ok: false, error: 'Email service not configured.' })
    return
  }

  const subject = `Coffee Request (Pending) — ${payload.fullName} — ${payload.requestedDate} ${payload.requestedTime}`
  const prettyTime = formatDateTime(payload.requestedDate, payload.requestedTime)
  const fullAddress = [payload.address1, payload.address2, payload.city, payload.postalCode]
    .filter(Boolean)
    .join(', ')

  const html = `
    <div style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
      <h2 style="margin-bottom:12px;">New Coffee Request (Pending)</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;font-weight:600;">Requested date/time</td><td style="padding:6px 0;">${escapeHtml(prettyTime)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Name</td><td style="padding:6px 0;">${escapeHtml(payload.fullName)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Phone</td><td style="padding:6px 0;">${escapeHtml(payload.phone)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Email</td><td style="padding:6px 0;">${escapeHtml(payload.email)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Address</td><td style="padding:6px 0;">${escapeHtml(fullAddress)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Notes</td><td style="padding:6px 0;">${escapeHtml(payload.notes || '—')}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Source page</td><td style="padding:6px 0;">${escapeHtml(payload.sourceUrl || 'https://northsidegta.ca/coffee')}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">IP</td><td style="padding:6px 0;">${escapeHtml(ip)}</td></tr>
      </table>
    </div>
  `

  try {
    await resendClient.emails.send({
      from: LEAD_FROM_EMAIL,
      to: [LEAD_TO_EMAIL],
      subject,
      replyTo: payload.email,
      html,
      text: [
        'New Coffee Request (Pending)',
        `Requested date/time: ${prettyTime}`,
        `Name: ${payload.fullName}`,
        `Phone: ${payload.phone}`,
        `Email: ${payload.email}`,
        `Address: ${fullAddress}`,
        `Notes: ${payload.notes || '—'}`,
        `Source page: ${payload.sourceUrl || 'https://northsidegta.ca/coffee'}`,
        `IP: ${ip}`,
      ].join('\n'),
    })
  } catch (error) {
    console.error('[coffee-request] email send failed', error)
    res.status(500).json({ ok: false, error: 'Email send failed.' })
    return
  }

  res.status(200).json({ ok: true })
}
