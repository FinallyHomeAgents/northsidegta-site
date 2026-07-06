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

async function dispatchWorkflow({ owner, repo, ref, headers }) {
  const workflowId = '.github/workflows/events-sync.yml'
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref }),
  })
  return response
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

async function fetchDefaultBranch({ owner, repo, headers }) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      method: 'GET',
      headers,
    })
    if (!response.ok) {
      return null
    }
    const data = await response.json().catch(() => null)
    if (data && typeof data.default_branch === 'string' && data.default_branch.trim()) {
      return data.default_branch.trim()
    }
  } catch (error) {
    console.warn('[sync-now] failed to fetch repository metadata for default branch', error)
  }
  return null
}

async function triggerSync() {
  const env = getGithubEnvConfig()
  const cap = getGithubSyncCapability()

  const owner = cap.owner || env?.owner || ''
  const repo  = cap.repo  || env?.repo  || ''
  const token = env?.token || cap.token || ''
  const initialRef = cap.ref && cap.ref.trim() ? cap.ref.trim() : ''
  const attemptedRefs = new Set()

  if (!cap.hasRepoMetadata && !(env?.owner && env?.repo)) {
    return { status: 500, body: { ok: false, error: 'missing repository metadata',
      hint: 'Set GITHUB_REPO (owner/repo) or VERCEL_GIT_REPO_OWNER + VERCEL_GIT_REPO_SLUG.', owner, repo, ref: initialRef || DEFAULT_DISPATCH_REF } }
  }

  if (!token) {
    return { status: 502, body: { ok: false, error: 'missing GH_TOKEN/GITHUB_TOKEN',
      hint: 'Provide a GitHub token with repo + workflow scopes via GH_TOKEN or GITHUB_TOKEN.', owner, repo, ref: initialRef || DEFAULT_DISPATCH_REF } }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  async function attemptDispatch(ref) {
    if (!ref || attemptedRefs.has(ref)) return null
    attemptedRefs.add(ref)

    let workflowResponse
    try {
      workflowResponse = await dispatchWorkflow({ owner, repo, ref, headers })
    } catch (error) {
      console.error('[sync-now] workflow dispatch failed', { ref }, error)
      workflowResponse = { status: 0, text: async () => '' }
    }

    let repoResponse
    try {
      repoResponse = await dispatchSyncNow({ owner, repo, ref, headers })
    } catch (error) {
      console.error('[sync-now] repository dispatch failed', { ref }, error)
      repoResponse = { status: 0, text: async () => '' }
    }

    return {
      ref,
      workflowResponse,
      repoResponse,
      workflowStatus: workflowResponse.status,
      repoStatus: repoResponse.status,
    }
  }

  async function resolveFallbackRef(currentRef) {
    const fetchedDefault = await fetchDefaultBranch({ owner, repo, headers })
    if (fetchedDefault && fetchedDefault !== currentRef) {
      return fetchedDefault
    }
    if (DEFAULT_DISPATCH_REF && DEFAULT_DISPATCH_REF !== currentRef) {
      return DEFAULT_DISPATCH_REF
    }
    return null
  }

  try {
    let result = await attemptDispatch(initialRef || DEFAULT_DISPATCH_REF)

    if (result && result.workflowStatus === 404) {
      const fallbackRef = await resolveFallbackRef(result.ref)
      if (fallbackRef) {
        result = await attemptDispatch(fallbackRef) || result
      }
    } else if (!result || !SUCCESS_STATUSES.has(result.repoStatus)) {
      const fallbackRef = await resolveFallbackRef(result?.ref)
      if (fallbackRef) {
        const fallbackResult = await attemptDispatch(fallbackRef)
        if (fallbackResult) {
          result = fallbackResult
        }
      }
    }

    if (!result) {
      return { status: 502, body: { ok: false, error: 'GitHub refused the sync request.', hint: buildHintFromStatus(0), repoDispatchStatus: 0, owner, repo, ref: initialRef || DEFAULT_DISPATCH_REF } }
    }

    const repoDispatchStatus = result.repoStatus || 0
    const hint = buildHintFromStatus(repoDispatchStatus)

    if (!SUCCESS_STATUSES.has(repoDispatchStatus)) {
      const body = await result.repoResponse.text().catch(() => '')
      console.warn('[sync-now] repository_dispatch failed', { repoDispatchStatus, body })
      return { status: 502, body: { ok: false, error: 'GitHub refused the sync request.', hint, repoDispatchStatus, owner, repo, ref: result.ref } }
    }

    return { status: 200, body: { ok: true, repoDispatchStatus, owner, repo, ref: result.ref, hint } }
  } catch (error) {
    console.error('[sync-now] unexpected error contacting GitHub', error)
    return { status: 502, body: { ok: false, error: 'Failed to reach GitHub.',
      hint: 'Network error while contacting GitHub. Try again in a moment.', owner, repo, ref: initialRef || DEFAULT_DISPATCH_REF } }
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
