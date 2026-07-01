const FORMSPREE_ENDPOINT = (process.env.FORMSPREE_ENDPOINT ?? '').trim()

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

  const winningCode = normalizeText(process.env.LOCKBOX_WINNING_CODE, 5)
  const submittedCode = normalizeText(body.code, 5)
  const unlocked = Boolean(winningCode && /^\d{5}$/.test(winningCode) && submittedCode === winningCode)
  const timestamp = new Date().toISOString()

  const payload = {
    contest: 'Unlock the Prize',
    name: normalizeText(body.name, 120),
    phone: normalizeText(body.phone, 80),
    instagramHandle: normalizeText(body.instagramHandle, 80),
    code: submittedCode,
    followedFinallyHomeAgents: Boolean(body.followedFinallyHomeAgents),
    followedNorthSideGTA: Boolean(body.followedNorthSideGTA),
    result: unlocked ? 'unlocked' : 'locked',
    timestamp,
    pageUrl: normalizeText(body.pageUrl, 500),
  }

  await submitToFormspree(payload)
  res.status(200).json({ unlocked })
}
