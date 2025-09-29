// /api/sync-now.js
import crypto from 'crypto'

const OWNER = process.env.GITHUB_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER
const REPO = process.env.GITHUB_REPO_NAME || process.env.VERCEL_GIT_REPO_SLUG
const WORKFLOW_FILE = 'events-sync.yml'
const CSRF_COOKIE = 'sync_now_csrf' // SYNC WIRING
const DEFAULT_REF =
  process.env.GITHUB_REF_NAME || process.env.VERCEL_GIT_COMMIT_REF || 'main' // SYNC WIRING

// SYNC WIRING
function parseCookies(header = '') {
  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const [name, ...rest] = entry.split('=')
      if (!name) return acc
      const value = rest.join('=')
      try {
        acc[name] = decodeURIComponent(value || '')
      } catch (_) {
        acc[name] = value || ''
      }
      return acc
    }, {})
}

// SYNC WIRING
function timingSafeEqual(expected, received) {
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(received)
  if (expectedBuffer.length !== receivedBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

// SYNC WIRING
function verifyCsrfToken(csrfToken, cookieValue) {
  if (!csrfToken || !cookieValue) return false
  const secret = process.env.SYNC_SECRET
  if (!secret) return false

  const [cookieToken, cookieSignature] = cookieValue.split('.')
  if (!cookieToken || !cookieSignature) return false
  if (cookieToken !== csrfToken) return false

  const expectedSignature = crypto.createHmac('sha256', secret).update(cookieToken).digest('hex')
  return timingSafeEqual(expectedSignature, cookieSignature)
}

// SYNC WIRING
function isSameOrigin(req) {
  const host = req.headers.host
  if (!host) return false
  const origin = req.headers.origin
  const referer = req.headers.referer

  const matchesHost = (value) => {
    try {
      const url = new URL(value)
      return url.host === host
    } catch (_) {
      return false
    }
  }

  if (origin && !matchesHost(origin)) {
    return false
  }

  if (!origin && referer && !matchesHost(referer)) {
    return false
  }

  if (!origin && !referer) {
    return false
  }

  return true
}

// SYNC WIRING
function buildHintFromStatus(workflowStatus, repoDispatchStatus) {
  if (workflowStatus === 403 || repoDispatchStatus === 403) {
    return 'GitHub rejected the sync — ensure GH_TOKEN has Actions: write and repo Actions permissions allow workflow_dispatch.'
  }
  if (workflowStatus === 404) {
    return 'Workflow not found. Confirm events-sync.yml exists on the default branch.'
  }
  return 'Sync started — check GitHub → Actions.'
}

// SYNC WIRING
async function triggerSync() {
  const token = process.env.GH_TOKEN
  if (!token) {
    return {
      status: 500,
      body: { ok: false, error: 'Missing GH_TOKEN environment variable.', hint: 'Set GH_TOKEN with Actions: Read & Write access.' },
    }
  }

  if (!OWNER || !REPO) {
    return {
      status: 500,
      body: { ok: false, error: 'Missing repository metadata.', hint: 'Ensure repository owner/name env vars are available.' },
    }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }

  const workflowUrl = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`
  const dispatchUrl = `https://api.github.com/repos/${OWNER}/${REPO}/dispatches`

  try {
    const [workflowResponse, repoDispatchResponse] = await Promise.all([
      fetch(workflowUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ref: DEFAULT_REF }),
      }),
      fetch(dispatchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ event_type: 'sync_now' }),
      }),
    ])

    const workflowStatus = workflowResponse.status
    const repoDispatchStatus = repoDispatchResponse.status

    const successStatuses = new Set([200, 201, 202, 204])
    const ok = successStatuses.has(workflowStatus) || successStatuses.has(repoDispatchStatus)

    const hint = buildHintFromStatus(workflowStatus, repoDispatchStatus)

    if (!ok) {
      const workflowError = await workflowResponse.text().catch(() => '')
      const dispatchError = await repoDispatchResponse.text().catch(() => '')
      console.warn('[sync-now] GitHub dispatch failed', {
        workflowStatus,
        repoDispatchStatus,
        workflowError,
        dispatchError,
      })
      return {
        status: 502,
        body: {
          ok: false,
          error: 'GitHub refused the sync request.',
          hint,
          workflowStatus,
          repoDispatchStatus,
          owner: OWNER,
          repo: REPO,
          ref: DEFAULT_REF,
        },
      }
    }

    return {
      status: 200,
      body: {
        ok: true,
        workflowStatus,
        repoDispatchStatus,
        owner: OWNER,
        repo: REPO,
        ref: DEFAULT_REF,
        hint,
      },
    }
  } catch (error) {
    console.error('[sync-now] unexpected error contacting GitHub', error)
    return {
      status: 502,
      body: {
        ok: false,
        error: 'Failed to reach GitHub.',
        hint: 'Network error while contacting GitHub. Try again in a moment.',
      },
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.setHeader('Cache-Control', 'no-store') // SYNC WIRING
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  res.setHeader('Cache-Control', 'no-store') // SYNC WIRING

  if (!isSameOrigin(req)) {
    res.status(401).json({ ok: false, error: 'Cross-origin request rejected.', hint: 'Reload the admin page and try again from the official site.' })
    return
  }

  const csrfHeader = req.headers['x-sync-csrf']
  const cookies = parseCookies(req.headers.cookie)
  const csrfCookie = cookies[CSRF_COOKIE]

  if (!verifyCsrfToken(csrfHeader, csrfCookie)) {
    res.status(401).json({ ok: false, error: 'Invalid or missing sync token.', hint: 'Refresh the admin page to obtain a new sync token.' })
    return
  }

  const result = await triggerSync()
  res.status(result.status).json(result.body)
}
