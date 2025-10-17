// /api/sync-now.js
const crypto = require('node:crypto')

const {
  DEFAULT_SYNC_REF,
  getGithubEnvConfig,
  getGithubSyncCapability,
} = require('../lib/github-admin.js')

const DEFAULT_DISPATCH_REF = DEFAULT_SYNC_REF || 'main'
const CSRF_COOKIE = 'sync_now_csrf'
const SUCCESS_STATUSES = new Set([200, 201, 202, 204])

function parseCookies(header = '') {
  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const [name, ...rest] = entry.split('=')
      if (!name) return acc
      const value = rest.join('=')
      try { acc[name] = decodeURIComponent(value || '') } catch { acc[name] = value || '' }
      return acc
    }, {})
}

function timingSafeEqual(expected, received) {
  const eb = Buffer.from(expected || '')
  const rb = Buffer.from(received || '')
  if (eb.length !== rb.length) return false
  return crypto.timingSafeEqual(eb, rb)
}

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

function isSameOrigin(req) {
  const host = req.headers.host
  if (!host) return false
  const origin = req.headers.origin
  const referer = req.headers.referer
  const matchesHost = (v) => { try { return new URL(v).host === host } catch { return false } }
  if (origin && !matchesHost(origin)) return false
  if (!origin && referer && !matchesHost(referer)) return false
  if (!origin && !referer) return false
  return true
}

function buildHintFromStatus(repoDispatchStatus) {
  if (repoDispatchStatus === 401 || repoDispatchStatus === 403) {
    return 'GitHub rejected the sync — check GH_TOKEN/GITHUB_TOKEN scopes, authorize SSO, and ensure Actions: write is enabled.'
  }
  if (repoDispatchStatus === 404) {
    return 'Repository dispatch failed — confirm events-sync.yml listens for repository_dispatch: types: [sync-now].'
  }
  if (repoDispatchStatus === 422) {
    return 'Dispatch was rejected — ensure the workflow is on the default branch and repository_dispatch is enabled.'
  }
  return 'Sync started — check GitHub → Actions.'
}

async function dispatchSyncNow({ owner, repo, ref, headers }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`
  // Only repository_dispatch; avoids ref-specific 404s.
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: 'sync-now', client_payload: { ref } }),
  })
  return response
}

async function triggerSync() {
  const env = getGithubEnvConfig()
  const cap = getGithubSyncCapability()

  const owner = cap.owner || env?.owner || ''
  const repo  = cap.repo  || env?.repo  || ''
  const ref   = DEFAULT_DISPATCH_REF // always target main (or your override)
  const token = env?.token || cap.token || ''

  if (!cap.hasRepoMetadata && !(env?.owner && env?.repo)) {
    return { status: 500, body: { ok: false, error: 'missing repository metadata',
      hint: 'Set GITHUB_REPO (owner/repo) or VERCEL_GIT_REPO_OWNER + VERCEL_GIT_REPO_SLUG.', owner, repo, ref } }
  }

  if (!token) {
    return { status: 502, body: { ok: false, error: 'missing GH_TOKEN/GITHUB_TOKEN',
      hint: 'Provide a GitHub token with repo + workflow scopes via GH_TOKEN or GITHUB_TOKEN.', owner, repo, ref } }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  try {
    const resp = await dispatchSyncNow({ owner, repo, ref, headers })
    const repoDispatchStatus = resp.status
    const ok = SUCCESS_STATUSES.has(repoDispatchStatus)
    const hint = buildHintFromStatus(repoDispatchStatus)

    if (!ok) {
      const body = await resp.text().catch(() => '')
      console.warn('[sync-now] repository_dispatch failed', { repoDispatchStatus, body })
      return { status: 502, body: { ok: false, error: 'GitHub refused the sync request.', hint, repoDispatchStatus, owner, repo, ref } }
    }

    return { status: 200, body: { ok: true, repoDispatchStatus, owner, repo, ref, hint } }
  } catch (error) {
    console.error('[sync-now] unexpected error contacting GitHub', error)
    return { status: 502, body: { ok: false, error: 'Failed to reach GitHub.',
      hint: 'Network error while contacting GitHub. Try again in a moment.', owner, repo, ref } }
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.setHeader('Cache-Control', 'no-store')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')

  if (!isSameOrigin(req)) {
    res.status(401).json({ ok: false, error: 'Cross-origin request rejected.',
      hint: 'Reload the admin page and try again from the official site.' })
    return
  }

  const csrfHeader = req.headers['x-sync-csrf']
  const cookies = parseCookies(req.headers.cookie)
  const csrfCookie = cookies[CSRF_COOKIE]

  if (!verifyCsrfToken(csrfHeader, csrfCookie)) {
    res.status(401).json({ ok: false, error: 'Invalid or missing sync token.',
      hint: 'Refresh the admin page to obtain a new sync token.' })
    return
  }

  const result = await triggerSync()
  res.status(result.status).json(result.body)
}

module.exports = handler
module.exports.default = module.exports
