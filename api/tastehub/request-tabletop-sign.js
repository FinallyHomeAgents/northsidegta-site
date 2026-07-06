import { Resend } from 'resend'

import { readJsonBody } from '../../lib/api-helpers'
import { getKvClient, isKvConfigured } from '../../lib/kv-admin'

const ROLE_OPTIONS = new Set(['Owner', 'Manager', 'Staff'])
const TOWN_OPTIONS = new Set([
  'Uxbridge',
  'Stouffville',
  'East Gwillimbury',
  'Newmarket',
  'Georgina',
  'Scugog',
  'Aurora',
])
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL =
  process.env.FROM_EMAIL || 'NorthSide TasteHub <no-reply@northsidegta.ca>'
const NOTIFY_EMAIL = 'contact@finallyhomeagents.com'

function normalizeText(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
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
  if (Array.isArray(header)) {
    return header[0] || 'unknown'
  }
  if (typeof header === 'string' && header.includes(',')) {
    return header.split(',')[0].trim()
  }
  if (typeof header === 'string' && header.trim()) {
    return header.trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

async function checkRateLimit(ip) {
  if (!ip || !isKvConfigured()) {
    return { allowed: true, count: 0 }
  }
  try {
    const kv = getKvClient()
    const key = `tastehub-tabletop:${ip}`
    const count = await kv.incr(key)
    if (count === 1) {
      await kv.expire(key, RATE_LIMIT_WINDOW_SECONDS)
    }
    return { allowed: count <= RATE_LIMIT_MAX, count }
  } catch (error) {
    console.warn('[tastehub/request-tabletop-sign] rate-limit check failed', error)
    return { allowed: true, count: 0 }
  }
}

function isValidEmail(value) {
  return EMAIL_REGEX.test(value || '')
}

function isValidPhone(value) {
  return String(value || '').replace(/\D/g, '').length >= 10
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

  const restaurantName = normalizeText(body.restaurantName)
  const contactName = normalizeText(body.contactName)
  const role = normalizeText(body.role)
  const email = normalizeText(body.email)
  const phone = normalizeText(body.phone)
  const town = normalizeText(body.town)
  const website = normalizeText(body.website)
  const nickname = normalizeText(body.nickname)

  if (nickname) {
    res.status(200).json({ ok: true })
    return
  }

  const ip = getClientIp(req)
  const rateLimit = await checkRateLimit(ip)
  if (!rateLimit.allowed) {
    res.status(429).json({ ok: false, error: 'Too many requests. Please try again shortly.' })
    return
  }

  if (!restaurantName || !contactName || !role || !email || !phone || !town) {
    res.status(400).json({ ok: false, error: 'Missing required fields.' })
    return
  }

  if (!ROLE_OPTIONS.has(role)) {
    res.status(400).json({ ok: false, error: 'Invalid role.' })
    return
  }

  if (!TOWN_OPTIONS.has(town)) {
    res.status(400).json({ ok: false, error: 'Invalid town.' })
    return
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ ok: false, error: 'Invalid email.' })
    return
  }

  if (!isValidPhone(phone)) {
    res.status(400).json({ ok: false, error: 'Invalid phone.' })
    return
  }

  if (!resendClient) {
    res.status(500).json({ ok: false, error: 'Email service not configured.' })
    return
  }

  const subject = `TasteHub Tabletop Sign Request — ${restaurantName}`
  const html = `
    <div style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
      <h2 style="margin-bottom:12px;">New TasteHub tabletop sign request</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;font-weight:600;">Restaurant</td><td style="padding:6px 0;">${escapeHtml(restaurantName)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Contact</td><td style="padding:6px 0;">${escapeHtml(contactName)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Role</td><td style="padding:6px 0;">${escapeHtml(role)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Email</td><td style="padding:6px 0;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Phone</td><td style="padding:6px 0;">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Town</td><td style="padding:6px 0;">${escapeHtml(town)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Website/Instagram</td><td style="padding:6px 0;">${escapeHtml(website || '—')}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">IP</td><td style="padding:6px 0;">${escapeHtml(ip)}</td></tr>
      </table>
    </div>
  `

  try {
    await resendClient.emails.send({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      subject,
      replyTo: email,
      html,
      text: [
        'New TasteHub tabletop sign request',
        `Restaurant: ${restaurantName}`,
        `Contact: ${contactName}`,
        `Role: ${role}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Town: ${town}`,
        `Website/Instagram: ${website || '—'}`,
        `IP: ${ip}`,
      ].join('\n'),
    })
  } catch (error) {
    console.error('[tastehub/request-tabletop-sign] email failed', error)
    res.status(500).json({ ok: false, error: 'Email send failed.' })
    return
  }

  res.status(200).json({ ok: true })
}
