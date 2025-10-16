// /api/sync-now.js
const crypto = require('node:crypto')

const {
  DEFAULT_SYNC_REF,
  getGithubEnvConfig,
  getGithubSyncCapability,
} = require('../lib/github-admin.js')

const WORKFLOW_FILE = '.github/workflows/events-sync.yml'
const DEFAULT_DISPATCH_REF = DEFAULT_SYNC_REF || 'main'
const CSRF_COOKIE = 'sync_now_csrf' // SYNC WIRING
const SUCCESS_STATUSES = new Set([200, 201, 202, 204])

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
  const statuses = [workflowStatus, repoDispatchStatus].filter((status) => typeof status === 'number' && status > 0)

  if (statuses.some((status) => status === 401 || status === 403)) {
    return 'GitHub rejected the sync — check GH_TOKEN/GITHUB_TOKEN scopes, authorize SSO, and ensure Actions: write is enabled.'
  }

  if (statuses.includes(404)) {
    return 'Workflow not found for that ref — confirm .github/workflows/events-sync.yml exists on the target branch.'
  }

  if (statuses.includes(422)) {
    return 'Workflow dispatch was rejected — ensure events-sync.yml listens for workflow_dispatch and repository_dispatch on that ref.'
  }

  return 'Sync started — check GitHub → Actions.'
}

// SYNC WIRING
async function fetchDefaultBranch(owner, repo, headers) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      method: 'GET',
      headers: { ...headers },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json().catch(() => null)
    const branch = typeof data?.default_branch === 'string' ? data.default_branch.trim() : ''
    return branch || null
  } catch (error) {
    console.warn('[sync-now] failed to resolve repository default branch', error)
    return null
  }
}

function summarizeDispatch(workflowResponse, repoDispatchResponse) {
  const workflowStatus = workflowResponse.status
  const repoDispatchStatus = repoDispatchResponse.status
  const ok =
    SUCCESS_STATUSES.has(workflowStatus) || SUCCESS_STATUSES.has(repoDispatchStatus)
  const hint = buildHintFromStatus(workflowStatus, repoDispatchStatus)

  return { workflowStatus, repoDispatchStatus, ok, hint }
}

async function performDispatch({ owner, repo, ref, headers }) {
  const workflowUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`
  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/dispatches`

  const [workflowResponse, repoDispatchResponse] = await Promise.all([
    fetch(workflowUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref }),
    }),
    fetch(dispatchUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'sync_now' }),
    }),
  ])

  return { workflowResponse, repoDispatchResponse }
}

async function triggerSync() {
  const envConfig = getGithubEnvConfig()
  const capability = getGithubSyncCapability()

  const owner = capability.owner || envConfig?.owner || ''
  const repo = capability.repo || envConfig?.repo || ''
  const ref = capability.ref || 'main'
  const token = envConfig?.token || capability.token || ''

  if (!capability.hasRepoMetadata && !(envConfig?.owner && envConfig?.repo)) {
    return {
      status: 500,
      body: {
        ok: false,
        error: 'missing repository metadata',
        hint: 'Set GITHUB_REPO (owner/repo) or configure VERCEL_GIT_REPO_OWNER + VERCEL_GIT_REPO_SLUG before running Sync now.',
        owner,
        repo,
        ref,
      },
    }
  }

  if (!token) {
    return {
      status: 502,
      body: {
        ok: false,
        error: 'missing GH_TOKEN/GITHUB_TOKEN',
        hint: 'Provide a GitHub token with repo + workflow scopes via GH_TOKEN or GITHUB_TOKEN.',
        owner,
        repo,
        ref,
      },
    }
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  let activeRef = ref

  try {
    let { workflowResponse, repoDispatchResponse } = await performDispatch({
      owner,
      repo,
      ref: activeRef,
      headers: authHeaders,
    })

    let { workflowStatus, repoDispatchStatus, ok, hint } = summarizeDispatch(
      workflowResponse,
      repoDispatchResponse
    )

    if (workflowStatus === 404) {
      const repoDefaultBranch =
        (await fetchDefaultBranch(owner, repo, authHeaders)) || DEFAULT_DISPATCH_REF
      if (repoDefaultBranch && repoDefaultBranch !== activeRef) {
        console.info(
          `[sync-now] workflow not found on ${activeRef}, retrying with ${repoDefaultBranch}`
        )
        activeRef = repoDefaultBranch
        ;({ workflowResponse, repoDispatchResponse } = await performDispatch({
          owner,
          repo,
          ref: activeRef,
          headers: authHeaders,
        }))
        ;({ workflowStatus, repoDispatchStatus, ok, hint } = summarizeDispatch(
          workflowResponse,
          repoDispatchResponse
        ))
      }
    }

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
          owner,
          repo,
          ref: activeRef,
        },
      }
    }

    return {
      status: 200,
      body: {
        ok: true,
        workflowStatus,
        repoDispatchStatus,
        owner,
        repo,
        ref: activeRef,
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
        owner,
        repo,
        ref: activeRef,
      },
    }
  }
}

async function handler(req, res) {
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

module.exports = handler
module.exports.default = module.exports
