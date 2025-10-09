// /api/cms-login.js
const REQUIRED_ENV_VARS = ['CMS_LOGIN_USERNAME', 'CMS_LOGIN_PASSWORD']
const TOKEN_ENV_VARS = ['CMS_GITHUB_TOKEN', 'GITHUB_TOKEN']

function getGithubToken() {
  for (const name of TOKEN_ENV_VARS) {
    const value = process.env[name]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name])
  const token = getGithubToken()

  if (!token) {
    missing.push('CMS_GITHUB_TOKEN or GITHUB_TOKEN')
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return token
}

function parseJsonString(raw) {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return {}
  try {
    return JSON.parse(trimmed)
  } catch (error) {
    throw new Error('Invalid JSON body')
  }
}

function parseJsonBuffer(buffer) {
  if (!buffer || !buffer.length) return {}
  const raw = buffer.toString('utf8')
  return parseJsonString(raw)
}

function tryParseJsonPayload(payload) {
  if (payload == null) return null

  if (typeof payload === 'string') {
    return parseJsonString(payload)
  }

  if (Buffer.isBuffer(payload)) {
    return parseJsonBuffer(payload)
  }

  if (ArrayBuffer.isView(payload)) {
    const view = payload
    const buffer = Buffer.from(view.buffer, view.byteOffset, view.byteLength)
    return parseJsonBuffer(buffer)
  }

  if (payload instanceof ArrayBuffer) {
    const buffer = Buffer.from(payload)
    return parseJsonBuffer(buffer)
  }

  if (typeof payload === 'object') {
    return payload
  }

  return null
}

async function readRequestBody(req) {
  const parsed = tryParseJsonPayload(req.body)
  if (parsed !== null) {
    return parsed
  }

  const chunks = []
  for await (const chunk of req) {
    if (!chunk) continue
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk)
    } else if (typeof chunk === 'string') {
      if (chunk) chunks.push(Buffer.from(chunk))
    } else if (ArrayBuffer.isView(chunk)) {
      const view = chunk
      chunks.push(Buffer.from(view.buffer, view.byteOffset, view.byteLength))
    } else if (chunk instanceof ArrayBuffer) {
      chunks.push(Buffer.from(chunk))
    }
  }

  if (!chunks.length) return {}

  const raw = Buffer.concat(chunks)
  return parseJsonBuffer(raw)
}

export default async function handler(req, res) {
  let token
  try {
    token = validateEnv()
  } catch (error) {
    console.error('[cms-login] configuration error:', error)
    res.status(500).json({ error: 'CMS login is not configured.' })
    return
  }

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

  const { username = '', password = '' } = body
  const expectedUser = process.env.CMS_LOGIN_USERNAME
  const expectedPass = process.env.CMS_LOGIN_PASSWORD

  if (username !== expectedUser || password !== expectedPass) {
    res.status(401).json({ error: 'Invalid username or password.' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({ token })
}
