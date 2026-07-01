const FORMSPREE_ENDPOINT = (process.env.FORMSPREE_ENDPOINT ?? '').trim()
const WINDOW_MS = 10 * 60 * 1000
const MAX_IP_ATTEMPTS = 5
const ipAttempts = new Map()
const codeAttempts = new Map()

// This temporary contest uses in-memory throttling. Durable storage would be
// needed for production-critical abuse prevention across serverless instances.
function pruneAttempts(store, now) {
  for (const [key, attempts] of store.entries()) {
    const freshAttempts = attempts.filter((timestamp) => now - timestamp < WINDOW_MS)
    if (freshAttempts.length) store.set(key, freshAttempts)
    else store.delete(key)
  }
}

function isThrottled(store, key, limit, now) {
  pruneAttempts(store, now)
  const attempts = store.get(key) || []
  if (attempts.length >= limit) return true
  attempts.push(now)
  store.set(key, attempts)
  return false
}

function normalizeText(value, max = 250) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, max)
}

function getClientIp(req) {
  const forwardedFor = normalizeText(req.headers['x-forwarded-for'], 500)
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return normalizeText(req.headers['x-real-ip'], 100) || req.socket?.remoteAddress || 'unknown'
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
    if (typeof req.body === 'string') return JSON.parse(req.body || '{}')
  }

  const chunks = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

async function submitToFormspree(payload) {
  if (!FORMSPREE_ENDPOINT || !isHttpUrl(FORMSPREE_ENDPOINT)) return

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }
  } catch {
    // Lead capture must never block the lockbox result.
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ unlocked: false })
    return
  }

  let body = {}
  try {
    body = await readBody(req)
  } catch {
    res.status(400).json({ unlocked: false })
    return
  }

  const submittedCode = normalizeText(body.code, 20)
  const validSubmittedCode = /^\d{5}$/.test(submittedCode)
  const timestamp = new Date().toISOString()
  const basePayload = {
    contest: 'Unlock the Prize',
    prize: 'Entry into the 2026 Finally Home Fall Scramble',
    name: normalizeText(body.name, 120),
    phone: normalizeText(body.phone, 80),
    instagramHandle: normalizeText(body.instagramHandle, 80),
    code: submittedCode,
    followedFinallyHomeAgents: Boolean(body.followedFinallyHomeAgents),
    followedNorthSideGTA: Boolean(body.followedNorthSideGTA),
    timestamp,
    pageUrl: normalizeText(body.pageUrl, 500),
  }

  if (!validSubmittedCode) {
    await submitToFormspree({ ...basePayload, result: 'locked' })
    res.status(200).json({ unlocked: false })
    return
  }

  const now = Date.now()
  const clientIp = getClientIp(req)
  const throttled =
    isThrottled(ipAttempts, clientIp, MAX_IP_ATTEMPTS, now) ||
    isThrottled(codeAttempts, submittedCode, 1, now)

  if (throttled) {
    await submitToFormspree({ ...basePayload, result: 'locked' })
    res.status(429).json({ error: 'Too many attempts. Please try again later.' })
    return
  }

  const winningCode = normalizeText(process.env.LOCKBOX_WINNING_CODE, 20)
  const unlocked = Boolean(/^\d{5}$/.test(winningCode) && submittedCode === winningCode)

  await submitToFormspree({ ...basePayload, result: unlocked ? 'unlocked' : 'locked' })
  res.status(200).json({ unlocked })
}
