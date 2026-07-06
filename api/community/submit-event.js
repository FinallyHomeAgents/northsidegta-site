import fs from 'fs'
import path from 'path'

import { DateTime } from 'luxon'
import { Resend } from 'resend'

import { readJsonBody } from '../../lib/api-helpers'
import { sanitizeEventId } from '../../lib/admin-events'
import { getKvClient, isKvConfigured } from '../../lib/kv-admin'
import {
  createPendingEventFile,
  isGithubConfigured,
} from '../../lib/github-admin.js'

const TORONTO_ZONE = 'America/Toronto'
const MAX_DURATION_DAYS = 14
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_EVENT_TYPES = new Set([
  'Community',
  'Sports',
  'Family',
  'Arts & Culture',
  'Education',
  'Business/Networking',
  'Charity',
  'Other',
])
const CITY_OPTIONS = new Set([
  'Georgina',
  'East Gwillimbury',
  'Aurora',
  'Stouffville',
  'Uxbridge',
  'Scugog',
  'Newmarket',
  'Nearby/Other (North of Toronto)',
])
const AUDIENCE_OPTIONS = new Set(['All ages', 'Kids', 'Teens', 'Adults', 'Seniors', 'Families'])
const CATEGORY_OPTIONS = new Set([
  'Community',
  'Sports',
  'Family',
  'Arts & Culture',
  'Education',
  'Business/Networking',
  'Charity',
  'Other',
  'Fall',
  'Winter',
  'Spring',
  'Summer',
  'Holiday',
])

const PENDING_DIR = path.join(process.cwd(), 'public', 'data', 'events-pending')
const EVENTS_DIR = path.join(process.cwd(), 'public', 'data', 'events')

const TURNSTILE_SECRET = (process.env.TURNSTILE_SECRET_KEY || '').trim()
const HCAPTCHA_SECRET = (process.env.HCAPTCHA_SECRET_KEY || '').trim()

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL =
  process.env.FROM_EMAIL || 'NorthSide GTA Community <no-reply@northsidegta.ca>'
const REVIEW_EMAIL = 'contact@finallyhomeagents.com'
const SLACK_WEBHOOK = (process.env.SLACK_WEBHOOK_URL || '').trim()

function normalizeText(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function stripHtml(value) {
  if (!value) return ''
  return String(value).replace(/<[^>]*>/g, '')
}

function hasEmoji(value) {
  if (!value) return false
  return /\p{Extended_Pictographic}/u.test(value)
}

function isHttpsUrl(value) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch (error) {
    return false
  }
}

function slugify(value) {
  const base = (value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'community-event'
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
    const key = `submit-event:${ip}`
    const count = await kv.incr(key)
    if (count === 1) {
      await kv.expire(key, RATE_LIMIT_WINDOW_SECONDS)
    }
    return { allowed: count <= RATE_LIMIT_MAX, count }
  } catch (error) {
    console.warn('[submit-event] rate-limit check failed', error)
    return { allowed: true, count: 0 }
  }
}

async function verifyCaptcha({ provider, token, remoteIp }) {
  if (!provider) return { ok: true }
  if (!token) return { ok: false, error: 'captcha-token-missing' }

  try {
    if (provider === 'turnstile' && TURNSTILE_SECRET) {
      const params = new URLSearchParams()
      params.append('secret', TURNSTILE_SECRET)
      params.append('response', token)
      if (remoteIp) params.append('remoteip', remoteIp)
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: params,
      })
      const result = await response.json()
      if (!result?.success) {
        return { ok: false, error: 'captcha-invalid' }
      }
      return { ok: true }
    }

    if (provider === 'hcaptcha' && HCAPTCHA_SECRET) {
      const params = new URLSearchParams()
      params.append('secret', HCAPTCHA_SECRET)
      params.append('response', token)
      if (remoteIp) params.append('remoteip', remoteIp)
      const response = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        body: params,
      })
      const result = await response.json()
      if (!result?.success) {
        return { ok: false, error: 'captcha-invalid' }
      }
      return { ok: true }
    }

    return { ok: true }
  } catch (error) {
    console.warn('[submit-event] captcha verification failed', error)
    return { ok: false, error: 'captcha-error' }
  }
}

async function validateImageUrl(url) {
  if (!url) return { ok: true }
  if (!isHttpsUrl(url)) {
    return { ok: false, error: 'Image URL must use https://' }
  }
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { Accept: 'image/*' },
    })
    if (response.status === 405 || response.status === 403) {
      const fallback = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0', Accept: 'image/*' },
      })
      if (!fallback.ok) {
        return { ok: false, error: 'Image URL could not be verified.' }
      }
      const type = fallback.headers.get('content-type') || ''
      if (!type.toLowerCase().startsWith('image/')) {
        return { ok: false, error: 'Image URL must point to an image file.' }
      }
      return { ok: true }
    }

    if (!response.ok) {
      return { ok: false, error: 'Image URL could not be verified.' }
    }

    const type = response.headers.get('content-type') || ''
    if (!type.toLowerCase().startsWith('image/')) {
      return { ok: false, error: 'Image URL must point to an image file.' }
    }

    const length = response.headers.get('content-length')
    const size = length ? Number(length) : 0
    if (Number.isFinite(size) && size > MAX_IMAGE_BYTES) {
      return { ok: false, error: 'Image must be 5MB or smaller.' }
    }

    return { ok: true }
  } catch (error) {
    console.warn('[submit-event] image HEAD failed', error)
    return { ok: false, error: 'Image URL could not be verified.' }
  }
}

function formatScheduleLabel(date) {
  const parsed = DateTime.fromISO(date || '', { zone: TORONTO_ZONE })
  return parsed.isValid ? parsed.toFormat('ccc, MMM d') : date
}

function validateDailyScheduleInput(payload, startDate, endDate) {
  const wantsSchedule = Boolean(payload.useDailySchedule ?? payload.use_daily_schedule)
  const rawSchedule = Array.isArray(payload.daily_schedule) ? payload.daily_schedule : []
  if (!wantsSchedule && !rawSchedule.length) {
    return { ok: true, schedule: [], derivedStart: startDate, derivedEnd: endDate }
  }

  if (!startDate?.isValid || !endDate?.isValid || endDate <= startDate) {
    return { ok: false, error: 'Set valid start and end times before using the daily schedule.' }
  }

  if (!rawSchedule.length) {
    return { ok: false, error: 'Provide at least one day in the daily schedule.' }
  }

  const dates = []
  let cursor = startDate.startOf('day')
  const last = endDate.startOf('day')
  let steps = 0
  while (cursor <= last && steps <= MAX_DURATION_DAYS) {
    dates.push(cursor.toISODate())
    cursor = cursor.plus({ days: 1 })
    steps += 1
  }

  if (!dates.length) {
    return { ok: false, error: 'Unable to derive the daily schedule range.' }
  }

  const scheduleMap = new Map()
  rawSchedule.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return
    const date = typeof entry.date === 'string' ? entry.date.trim() : ''
    if (!date) return
    scheduleMap.set(date, entry)
  })

  const sanitized = []
  let earliest = null
  let latest = null

  for (const date of dates) {
    const source = scheduleMap.get(date)
    const label = formatScheduleLabel(date)
    if (!source) {
      return { ok: false, error: `Add hours for ${label}.` }
    }

    const allDay = Boolean(source.all_day ?? source.allDay)
    if (allDay) {
      sanitized.push({ date, all_day: true, start_time: '', end_time: '' })
      const dayStart = DateTime.fromISO(`${date}T00:00`, { zone: TORONTO_ZONE })
      const dayEnd = DateTime.fromISO(`${date}T23:59`, { zone: TORONTO_ZONE })
      if (!earliest || dayStart < earliest) earliest = dayStart
      if (!latest || dayEnd > latest) latest = dayEnd
      continue
    }

    const startText =
      typeof source.start_time === 'string'
        ? source.start_time.trim()
        : typeof source.startTime === 'string'
          ? source.startTime.trim()
          : Array.isArray(source.blocks) && source.blocks[0]?.start
            ? String(source.blocks[0].start).trim()
            : ''
    const endText =
      typeof source.end_time === 'string'
        ? source.end_time.trim()
        : typeof source.endTime === 'string'
          ? source.endTime.trim()
          : Array.isArray(source.blocks) && source.blocks[0]?.end
            ? String(source.blocks[0].end).trim()
            : ''

    if (!startText || !endText) {
      return { ok: false, error: `Complete the time range for ${label}.` }
    }
    if (!/^\d{2}:\d{2}$/.test(startText) || !/^\d{2}:\d{2}$/.test(endText)) {
      return { ok: false, error: `Use HH:MM format for times on ${label}.` }
    }

    const startTime = DateTime.fromISO(`${date}T${startText}`, { zone: TORONTO_ZONE })
    const endTime = DateTime.fromISO(`${date}T${endText}`, { zone: TORONTO_ZONE })
    if (!startTime.isValid || !endTime.isValid) {
      return { ok: false, error: `Enter valid times for ${label}.` }
    }
    if (endTime <= startTime) {
      return { ok: false, error: `End time must be after the start time on ${label}.` }
    }

    if (!earliest || startTime < earliest) earliest = startTime
    if (!latest || endTime > latest) latest = endTime

    sanitized.push({
      date,
      all_day: false,
      start_time: startText,
      end_time: endText,
    })
  }

  const derivedStart = earliest ?? startDate
  const derivedEnd = latest ?? endDate

  return { ok: true, schedule: sanitized, derivedStart, derivedEnd }
}

function validateSubmission(payload) {
  const errors = {}
  const data = {}

  data.title = normalizeText(payload.title)
  if (!data.title || data.title.length < 3 || data.title.length > 80) {
    errors.title = 'Event Title must be 3–80 characters.'
  } else {
    const letters = data.title.replace(/[^A-Za-z]/g, '')
    if (letters && letters === letters.toUpperCase()) {
      errors.title = 'Avoid using all caps in the title.'
    }
  }

  data.organizerName = normalizeText(payload.organizerName)
  if (!data.organizerName || data.organizerName.length < 2 || data.organizerName.length > 80) {
    errors.organizerName = 'Organizer Name must be 2–80 characters.'
  }

  data.organizerEmail = normalizeText(payload.organizerEmail)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.organizerEmail)) {
    errors.organizerEmail = 'Provide a valid organizer email.'
  }

  data.eventType = normalizeText(payload.eventType)
  if (!ALLOWED_EVENT_TYPES.has(data.eventType)) {
    errors.eventType = 'Pick an event type from the list.'
  }

  data.shortDescription = stripHtml(payload.shortDescription || '').trim()
  if (!data.shortDescription || data.shortDescription.length < 10 || data.shortDescription.length > 200) {
    errors.shortDescription = 'Short description must be 10–200 characters.'
  } else if (hasEmoji(data.shortDescription)) {
    errors.shortDescription = 'Remove emojis from the short description.'
  }

  data.fullDescription = stripHtml(payload.fullDescription || '').trim()
  if (data.fullDescription.length > 4000) {
    errors.fullDescription = 'Full description can be up to 4,000 characters.'
  }

  const start = DateTime.fromISO(payload.startDate || '', { zone: TORONTO_ZONE })
  const end = DateTime.fromISO(payload.endDate || '', { zone: TORONTO_ZONE })

  if (!start.isValid) {
    errors.startDate = 'Provide a valid start date and time.'
  } else {
    const now = DateTime.now().setZone(TORONTO_ZONE).minus({ minutes: 10 })
    if (start < now) {
      errors.startDate = 'Start time must be in the future.'
    }
  }

  if (!end.isValid) {
    errors.endDate = 'Provide a valid end date and time.'
  } else if (start.isValid) {
    if (end <= start) {
      errors.endDate = 'End time must be after the start time.'
    } else if (end.diff(start, 'days').days > MAX_DURATION_DAYS) {
      errors.endDate = 'Event duration must be shorter than 14 days.'
    }
  }

  data.startDate = start
  data.endDate = end

  data.venueName = normalizeText(payload.venueName)
  if (!data.venueName || data.venueName.length < 2 || data.venueName.length > 80) {
    errors.venueName = 'Venue Name must be 2–80 characters.'
  }

  data.streetAddress = normalizeText(payload.streetAddress)
  if (!data.streetAddress) {
    errors.streetAddress = 'Provide the street address.'
  }

  data.city = normalizeText(payload.city)
  if (!CITY_OPTIONS.has(data.city)) {
    errors.city = 'Choose a supported city or town.'
  }

  data.postalCode = normalizeText(payload.postalCode)
  if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(data.postalCode)) {
    errors.postalCode = 'Use the Canadian format A1A 1A1.'
  }

  data.costType = payload.costType === 'Paid' ? 'Paid' : 'Free'
  if (data.costType === 'Paid') {
    data.priceFrom = normalizeText(payload.priceFrom)
    if (!/^\d+(\.\d{1,2})?$/.test(data.priceFrom || '')) {
      errors.priceFrom = 'Tickets need a numeric price.'
    }
    data.ticketsUrl = normalizeText(payload.ticketsUrl)
    if (data.ticketsUrl && !isHttpsUrl(data.ticketsUrl)) {
      errors.ticketsUrl = 'Tickets URL must start with https://'
    }
    data.paymentDetails = normalizeText(payload.paymentDetails)
    if (!data.paymentDetails) {
      errors.paymentDetails = 'Share how guests should pay for this event.'
    }
    if (data.paymentDetails && data.paymentDetails.length > 200) {
      errors.paymentDetails = 'Payment details should be 200 characters or fewer.'
    }
  } else {
    data.priceFrom = ''
    data.ticketsUrl = ''
    data.paymentDetails = ''
  }

  data.registrationUrl = normalizeText(payload.registrationUrl)
  if (data.registrationUrl && !isHttpsUrl(data.registrationUrl)) {
    errors.registrationUrl = 'Registration URL must start with https://'
  }

  const imageUrl = normalizeText(payload.imageUrl)
  data.imageUrl = imageUrl

  data.useDailySchedule = false
  data.dailySchedule = []

  const scheduleResult = validateDailyScheduleInput(payload, start, end)
  if (!scheduleResult.ok) {
    errors.dailySchedule = scheduleResult.error
  } else {
    data.useDailySchedule = scheduleResult.schedule.length > 0
    data.dailySchedule = scheduleResult.schedule
    if (scheduleResult.derivedStart?.isValid) {
      data.startDate = scheduleResult.derivedStart
    }
    if (scheduleResult.derivedEnd?.isValid) {
      data.endDate = scheduleResult.derivedEnd
    }
  }

  const rawAudience = Array.isArray(payload.audienceTags) ? payload.audienceTags : []
  data.audienceTags = rawAudience
    .map((tag) => normalizeText(tag))
    .filter((tag) => AUDIENCE_OPTIONS.has(tag))
    .slice(0, 3)
  if (rawAudience.length > 3) {
    errors.audienceTags = 'Choose up to three audience tags.'
  }

  const rawCategories = Array.isArray(payload.categoryTags) ? payload.categoryTags : []
  data.categoryTags = rawCategories
    .map((tag) => normalizeText(tag))
    .filter((tag) => CATEGORY_OPTIONS.has(tag))
    .slice(0, 4)
  if (rawCategories.length > 4) {
    errors.categoryTags = 'Choose up to four category tags.'
  }

  data.contactConsent = Boolean(payload.contactConsent)
  if (!data.contactConsent) {
    errors.contactConsent = 'Consent is required before submitting.'
  }

  data.honeypot = typeof payload.honeypot === 'string' ? payload.honeypot.trim() : ''

  return { data, errors }
}

function buildFilePath(dir, slug) {
  return path.join(dir, `${slug}.json`)
}

function fileExists(dir, slug) {
  try {
    fs.accessSync(buildFilePath(dir, slug), fs.constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

async function ensureUniqueSlug(baseSlug, startDate) {
  const datePrefix = startDate.setZone(TORONTO_ZONE).toFormat('yyyy-LL-dd')
  let slug = sanitizeEventId(`${datePrefix}-${slugify(baseSlug)}`)
  if (!slug) {
    slug = `${datePrefix}-community-event`
  }
  let attempt = 1
  while (fileExists(PENDING_DIR, slug) || fileExists(EVENTS_DIR, slug)) {
    attempt += 1
    const candidate = `${slug}-${attempt}`
    const safe = sanitizeEventId(candidate)
    if (!safe) {
      continue
    }
    if (!fileExists(PENDING_DIR, safe) && !fileExists(EVENTS_DIR, safe)) {
      slug = safe
      break
    }
  }
  return slug
}

async function sendEmailNotification(event) {
  if (!resendClient) return
  try {
    const start = DateTime.fromISO(event.startDate, { zone: TORONTO_ZONE })
    const end = DateTime.fromISO(event.endDate, { zone: TORONTO_ZONE })
    const lines = [
      `<strong>${escapeHtml(event.title)}</strong>`,
      `${escapeHtml(start.isValid ? start.toFormat('ccc, MMM d h:mm a') : '')} → ${escapeHtml(
        end.isValid ? end.toFormat('ccc, MMM d h:mm a') : ''
      )}`,
      `${escapeHtml(event.locationName)} • ${escapeHtml(event.town)}`,
      `Cost: ${event.priceType === 'Paid' ? `Paid${event.priceFrom ? ` — from $${escapeHtml(event.priceFrom)}` : ''}` : 'Free'}`,
    ]

    const details = [`<p>${lines.join('<br/>')}</p>`]
    if (event.ticketsUrl) {
      details.push(`<p>Tickets: <a href="${escapeHtml(event.ticketsUrl)}">${escapeHtml(event.ticketsUrl)}</a></p>`)
    }
    if (event.paymentDetails) {
      details.push(`<p>Payment: ${escapeHtml(event.paymentDetails)}</p>`)
    }
    if (event.registrationUrl) {
      details.push(
        `<p>Registration: <a href="${escapeHtml(event.registrationUrl)}">${escapeHtml(event.registrationUrl)}</a></p>`
      )
    }
    if (event.image) {
      details.push(`<p><img src="${escapeHtml(event.image)}" alt="Event image" style="max-width:100%;border-radius:16px;"/></p>`)
    }
    details.push(
      `<p>Organizer: ${escapeHtml(event.organizerName)} (${escapeHtml(
        event.organizerEmail
      )})</p>`
    )
    details.push(
      `<p>CMS Entry: <a href="${escapeHtml(
        `/cms#/collections/pending-events/entry/${event.slug}`
      )}">Open pending submission</a></p>`
    )

    await resendClient.emails.send({
      from: FROM_EMAIL,
      to: REVIEW_EMAIL,
      subject: `New community event submission: ${event.title}`,
      html: `<div style="font-family:'Blinker',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;color:#0f172a;">${details.join(
        ''
      )}</div>`,
    })
  } catch (error) {
    console.warn('[submit-event] email notification failed', error)
  }
}

async function sendSlackNotification(event) {
  if (!SLACK_WEBHOOK) return
  try {
    const start = DateTime.fromISO(event.startDate, { zone: TORONTO_ZONE })
    const end = DateTime.fromISO(event.endDate, { zone: TORONTO_ZONE })
    const costFields = [
      { type: 'mrkdwn', text: `*Cost:* ${event.priceType}${event.priceFrom ? ` from $${event.priceFrom}` : ''}` },
      { type: 'mrkdwn', text: `*Organizer:* ${event.organizerName}` },
    ]

    if (event.paymentDetails) {
      costFields.push({ type: 'mrkdwn', text: `*Payment:* ${event.paymentDetails}` })
    }

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*New community submission: ${event.title}*\n${start.isValid ? start.toFormat('ccc, MMM d h:mm a') : ''} → ${
            end.isValid ? end.toFormat('ccc, MMM d h:mm a') : ''
          }\n${event.locationName} • ${event.town}`,
        },
      },
      {
        type: 'section',
        fields: costFields,
      },
    ]

    const linkLines = []
    if (event.registrationUrl) {
      linkLines.push(`<${event.registrationUrl}|Registration / Info>`)
    }
    if (event.ticketsUrl) {
      linkLines.push(`<${event.ticketsUrl}|Tickets>`)
    }
    linkLines.push(`<https://northsidegta.ca/cms#/collections/pending-events/entry/${event.slug}|Review in CMS>`)

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: linkLines.join('\n'),
      },
    })

    const body = {
      text: `New community submission: ${event.title}`,
      blocks,
    }
    await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (error) {
    console.warn('[submit-event] slack notification failed', error)
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    return
  }

  if (!isGithubConfigured()) {
    res.status(503).json({ ok: false, error: 'Submissions temporarily unavailable.' })
    return
  }

  let payload
  try {
    payload = await readJsonBody(req)
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Invalid JSON body.' })
    return
  }

  const ip = getClientIp(req)

  if (typeof payload.honeypot === 'string' && payload.honeypot.trim()) {
    res.status(200).json({ ok: true, saved: false, message: 'Thank you! We will review your event shortly.' })
    return
  }

  const captchaResult = await verifyCaptcha({
    provider: typeof payload.captchaProvider === 'string' ? payload.captchaProvider : '',
    token: typeof payload.captchaToken === 'string' ? payload.captchaToken : '',
    remoteIp: ip,
  })
  if (!captchaResult.ok) {
    res.status(400).json({ ok: false, error: 'Captcha verification failed.', errors: { captchaToken: 'Captcha verification failed. Please try again.' } })
    return
  }

  const { data, errors } = validateSubmission(payload)
  const imageCheck = await validateImageUrl(data.imageUrl)
  if (!imageCheck.ok) {
    errors.imageUrl = imageCheck.error
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ ok: false, error: 'Validation failed.', errors })
    return
  }

  const rateLimit = await checkRateLimit(ip)
  if (!rateLimit.allowed) {
    res.status(200).json({ ok: true, saved: false, message: 'Thank you! We will review your event shortly.' })
    return
  }

  ensureDirectory(PENDING_DIR)

  const slug = await ensureUniqueSlug(data.title, data.startDate)

  const pendingEvent = {
    title: data.title,
    slug,
    status: 'pending',
    startDate: data.startDate.toUTC().toISO(),
    endDate: data.endDate.toUTC().toISO(),
    allDay: false,
    recurrence: '',
    userEventType: data.eventType,
    category: '',
    categoryTags: data.categoryTags,
    audienceTags: data.audienceTags,
    town: data.city,
    locationName: data.venueName,
    address: data.streetAddress,
    postalCode: data.postalCode,
    priceType: data.costType,
    priceFrom: data.priceFrom || '',
    priceNote: data.costType === 'Paid' && data.priceFrom ? `From $${data.priceFrom}` : '',
    paymentDetails: data.paymentDetails || '',
    ticketsUrl: data.ticketsUrl || '',
    registrationUrl: data.registrationUrl || '',
    image: data.imageUrl || '',
    summary: data.shortDescription,
    description: data.fullDescription || data.shortDescription,
    organizerName: data.organizerName,
    organizerEmail: data.organizerEmail,
    eventUrl: data.registrationUrl || data.ticketsUrl || '',
    source: 'user',
    sourceName: data.organizerName,
    submittedAt: DateTime.now().setZone(TORONTO_ZONE).toUTC().toISO(),
    contactConsent: data.contactConsent,
    use_daily_schedule: data.useDailySchedule,
    daily_schedule: data.useDailySchedule ? data.dailySchedule : [],
    moderation: {
      ip,
      submittedVia: 'public-form',
    },
  }

  const fileContent = `${JSON.stringify(pendingEvent, null, 2)}\n`

  try {
    await createPendingEventFile(slug, fileContent)
  } catch (error) {
    console.error('[submit-event] failed to write pending file', error)
    res.status(500).json({ ok: false, error: 'Failed to save your submission. Please try again later.' })
    return
  }

  await Promise.allSettled([sendEmailNotification(pendingEvent), sendSlackNotification(pendingEvent)])

  res.status(200).json({
    ok: true,
    saved: true,
    message: 'Thanks! Your event has been submitted for review.',
    event: {
      title: pendingEvent.title,
      slug: pendingEvent.slug,
      startDate: pendingEvent.startDate,
      endDate: pendingEvent.endDate,
      venueName: pendingEvent.locationName,
      town: pendingEvent.town,
      costType: pendingEvent.priceType,
      priceFrom: pendingEvent.priceFrom,
      categoryTags: pendingEvent.categoryTags,
      image: pendingEvent.image,
      organizerName: pendingEvent.organizerName,
      organizerEmail: pendingEvent.organizerEmail,
      ticketsUrl: pendingEvent.ticketsUrl,
      registrationUrl: pendingEvent.registrationUrl,
      daily_schedule: pendingEvent.daily_schedule,
      useDailySchedule: pendingEvent.use_daily_schedule,
    },
  })
}
