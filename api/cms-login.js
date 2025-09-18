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

async function readRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      if (!req.body.trim()) return {}
      try {
        return JSON.parse(req.body)
      } catch (error) {
        throw new Error('Invalid JSON body')
      }
    }
    if (typeof req.body === 'object') {
      return req.body
    }
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (!chunks.length) return {}

  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch (error) {
    throw new Error('Invalid JSON body')
  }
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
