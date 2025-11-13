import crypto from 'crypto'

export function normalizeTown(value) {
  return normalizeKey(value)
}

export function normalizeCategory(value) {
  return normalizeKey(value)
}

export function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createBallotHash(ip, userAgent, dateKey) {
  const base = `${ip || 'unknown'}|${userAgent || 'unknown'}|${dateKey}`
  return crypto.createHash('sha256').update(base).digest('hex')
}

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex')
}

export function getClientIp(req) {
  const header = req.headers['x-forwarded-for']
  if (Array.isArray(header) && header.length > 0) {
    return header[0]
  }
  if (typeof header === 'string' && header.includes(',')) {
    return header.split(',')[0].trim()
  }
  if (typeof header === 'string' && header.trim()) {
    return header.trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

export function getUserAgent(req) {
  const ua = req.headers['user-agent']
  if (Array.isArray(ua)) {
    return ua.join(' ')
  }
  return ua || ''
}

export function getDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10)
}
