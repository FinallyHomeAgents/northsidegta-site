const { Buffer } = require('buffer')
const { sanitizeEventId } = require('./admin-events')

const GITHUB_API_BASE = 'https://api.github.com'
const USER_AGENT = 'northsidegta-events-admin'
const DEFAULT_SYNC_REF = 'main'

const repoInfoCache = {
  repo: null,
  defaultBranch: null,
}

function normalizeBoolean(value) {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['1', 'true', 'yes', 'on'].includes(normalized)
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  if (typeof value === 'boolean') return value
  return false
}

function parseRepoString(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const [ownerRaw, repoRaw] = trimmed.split('/')
  const owner = typeof ownerRaw === 'string' ? ownerRaw.trim() : ''
  const repo = typeof repoRaw === 'string' ? repoRaw.trim() : ''
  if (!owner || !repo) return null
  return { owner, repo }
}

function resolveRepoMetadata() {
  const repoCandidates = [
    { value: process.env.GITHUB_REPO, source: 'GITHUB_REPO' },
    { value: process.env.GITHUB_REPOSITORY, source: 'GITHUB_REPOSITORY' },
  ]

  for (const candidate of repoCandidates) {
    const parsed = parseRepoString(candidate.value)
    if (parsed) {
      return { ...parsed, source: candidate.source }
    }
  }

  const ownerCandidates = [
    { value: process.env.GITHUB_REPO_OWNER, source: 'GITHUB_REPO_OWNER' },
    { value: process.env.GITHUB_REPOSITORY_OWNER, source: 'GITHUB_REPOSITORY_OWNER' },
    { value: process.env.VERCEL_GIT_REPO_OWNER, source: 'VERCEL_GIT_REPO_OWNER' },
  ]

  const repoNameCandidates = [
    { value: process.env.GITHUB_REPO_NAME, source: 'GITHUB_REPO_NAME' },
    {
      value:
        typeof process.env.GITHUB_REPOSITORY === 'string'
          ? process.env.GITHUB_REPOSITORY.split('/')[1]
          : undefined,
      source: 'GITHUB_REPOSITORY',
    },
    { value: process.env.VERCEL_GIT_REPO_SLUG, source: 'VERCEL_GIT_REPO_SLUG' },
  ]

  const ownerEntry = ownerCandidates.find((entry) => typeof entry.value === 'string' && entry.value.trim())
  const repoEntry = repoNameCandidates.find((entry) => typeof entry.value === 'string' && entry.value.trim())

  if (ownerEntry && repoEntry) {
    return {
      owner: ownerEntry.value.trim(),
      repo: repoEntry.value.trim(),
      source: `${ownerEntry.source}+${repoEntry.source}`,
    }
  }

  return null
}

function resolveGithubToken() {
  if (typeof process.env.GITHUB_TOKEN === 'string') {
    const trimmed = process.env.GITHUB_TOKEN.trim()
    if (trimmed) {
      return { token: trimmed, source: 'GITHUB_TOKEN' }
    }
  }
  if (typeof process.env.GH_TOKEN === 'string') {
    const trimmed = process.env.GH_TOKEN.trim()
    if (trimmed) {
      return { token: trimmed, source: 'GH_TOKEN' }
    }
  }
  return { token: '', source: '' }
}

function resolveDefaultRef() {
  const refCandidates = [
    { value: process.env.GITHUB_REF_NAME, source: 'GITHUB_REF_NAME' },
    { value: process.env.VERCEL_GIT_COMMIT_REF, source: 'VERCEL_GIT_COMMIT_REF' },
  ]

  for (const candidate of refCandidates) {
    if (typeof candidate.value === 'string') {
      const trimmed = candidate.value.trim()
      if (trimmed) {
        return { ref: trimmed, source: candidate.source }
      }
    }
  }

  return { ref: DEFAULT_SYNC_REF, source: 'default' }
}

function getGithubEnvConfig() {
  const repo = resolveRepoMetadata()
  const tokenInfo = resolveGithubToken()
  if (!repo || !tokenInfo.token) {
    return null
  }
  return { ...repo, token: tokenInfo.token }
}

function getGithubSyncCapability() {
  const repo = resolveRepoMetadata()
  const tokenInfo = resolveGithubToken()
  const refInfo = resolveDefaultRef()

  return {
    owner: repo?.owner || '',
    repo: repo?.repo || '',
    ref: refInfo.ref,
    token: tokenInfo.token,
    hasRepoMetadata: Boolean(repo?.owner && repo?.repo),
    hasToken: Boolean(tokenInfo.token),
    sources: {
      repo: repo?.source || '',
      token: tokenInfo.source,
      ref: refInfo.source,
    },
  }
}

function isGithubConfigured() {
  return Boolean(getGithubEnvConfig())
}

function getPrMode() {
  return normalizeBoolean(process.env.EVENTS_ADMIN_USE_PR)
}

function encodeRepoPath(path) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

async function githubRequest(config, path, { method = 'GET', body, headers } = {}) {
  if (!config) {
    throw new Error('GitHub repository is not configured')
  }

  const url = `${GITHUB_API_BASE}${path}`
  const init = {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': USER_AGENT,
      Authorization: `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...headers,
    },
  }

  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
    if (!init.headers['Content-Type']) {
      init.headers['Content-Type'] = 'application/json'
    }
  }

  const response = await fetch(url, init)
  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch (error) {
      data = text
    }
  }

  if (!response.ok) {
    const error = new Error(
      data && data.message ? data.message : `GitHub request failed with ${response.status}`
    )
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

async function getRepoInfo(config) {
  if (
    repoInfoCache.repo &&
    repoInfoCache.repo.owner === config.owner &&
    repoInfoCache.repo.repo === config.repo &&
    repoInfoCache.defaultBranch
  ) {
    return repoInfoCache
  }

  const data = await githubRequest(config, `/repos/${config.owner}/${config.repo}`)
  repoInfoCache.repo = { owner: config.owner, repo: config.repo }
  repoInfoCache.defaultBranch = data?.default_branch || 'main'
  return repoInfoCache
}

async function getBranchRef(config, branch) {
  return githubRequest(config, `/repos/${config.owner}/${config.repo}/git/ref/heads/${branch}`)
}

async function getCommit(config, sha) {
  return githubRequest(config, `/repos/${config.owner}/${config.repo}/git/commits/${sha}`)
}

async function createBlob(config, content) {
  return githubRequest(config, `/repos/${config.owner}/${config.repo}/git/blobs`, {
    method: 'POST',
    body: { content, encoding: 'utf-8' },
  })
}

async function createTree(config, baseTreeSha, entries) {
  return githubRequest(config, `/repos/${config.owner}/${config.repo}/git/trees`, {
    method: 'POST',
    body: {
      base_tree: baseTreeSha,
      tree: entries,
    },
  })
}

async function createCommit(config, message, treeSha, parents) {
  return githubRequest(config, `/repos/${config.owner}/${config.repo}/git/commits`, {
    method: 'POST',
    body: {
      message,
      tree: treeSha,
      parents,
    },
  })
}

async function updateRef(config, branch, sha) {
  return githubRequest(config, `/repos/${config.owner}/${config.repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: { sha, force: false },
  })
}

async function createRef(config, branch, sha) {
  return githubRequest(config, `/repos/${config.owner}/${config.repo}/git/refs`, {
    method: 'POST',
    body: { ref: `refs/heads/${branch}`, sha },
  })
}

async function createPullRequest(config, { title, head, base, body }) {
  return githubRequest(config, `/repos/${config.owner}/${config.repo}/pulls`, {
    method: 'POST',
    body: {
      title,
      head,
      base,
      body,
    },
  })
}

function buildEventPath(slug) {
  const safeSlug = sanitizeEventId(slug)
  if (!safeSlug) return ''
  return `public/data/events/${safeSlug}.json`
}

function buildPendingEventPath(slug) {
  const safeSlug = sanitizeEventId(slug)
  if (!safeSlug) return ''
  return `public/data/events-pending/${safeSlug}.json`
}

async function fetchEventFileFromGithub(slug) {
  const config = getGithubEnvConfig()
  if (!config) {
    throw new Error('GitHub repository is not configured')
  }

  const path = buildEventPath(slug)
  if (!path) {
    const error = new Error('Invalid event id')
    error.status = 400
    throw error
  }

  const { defaultBranch } = await getRepoInfo(config)
  const encodedPath = encodeRepoPath(path)
  const data = await githubRequest(
    config,
    `/repos/${config.owner}/${config.repo}/contents/${encodedPath}?ref=${encodeURIComponent(defaultBranch)}`
  )

  if (!data || typeof data.content !== 'string') {
    const error = new Error('Event content missing')
    error.status = 500
    throw error
  }

  const buffer = Buffer.from(data.content, data.encoding === 'base64' ? 'base64' : 'utf8')
  const text = buffer.toString('utf8')
  let json = null
  try {
    json = JSON.parse(text)
  } catch (error) {
    const parseError = new Error('Failed to parse event JSON from repository')
    parseError.status = 500
    throw parseError
  }

  return {
    path,
    json,
    text,
    sha: data.sha,
    defaultBranch,
    config,
  }
}

async function createPendingEventFile(slug, content) {
  const path = buildPendingEventPath(slug)
  if (!path) {
    const error = new Error('Invalid event id')
    error.status = 400
    throw error
  }

  const message = `chore(events): add pending submission ${slug}`
  const description = 'Community event submitted via public form.'
  await applyRepoChanges({
    message,
    description,
    changes: [{ path, content }],
  })
}

async function fetchFileFromGithub(path) {
  const config = getGithubEnvConfig()
  if (!config) {
    throw new Error('GitHub repository is not configured')
  }

  const { defaultBranch } = await getRepoInfo(config)
  const encodedPath = encodeRepoPath(path)
  const data = await githubRequest(
    config,
    `/repos/${config.owner}/${config.repo}/contents/${encodedPath}?ref=${encodeURIComponent(defaultBranch)}`
  )

  if (!data || typeof data.content !== 'string') {
    const error = new Error('Content missing from repository response')
    error.status = 500
    throw error
  }

  const buffer = Buffer.from(data.content, data.encoding === 'base64' ? 'base64' : 'utf8')
  const text = buffer.toString('utf8')
  let json = null
  try {
    json = JSON.parse(text)
  } catch (error) {
    const parseError = new Error('Failed to parse JSON from repository')
    parseError.status = 500
    throw parseError
  }

  return {
    path,
    json,
    text,
    sha: data.sha,
    defaultBranch,
    config,
  }
}

async function fetchPendingEventFileFromGithub(slug) {
  const path = buildPendingEventPath(slug)
  if (!path) {
    const error = new Error('Invalid event id')
    error.status = 400
    throw error
  }
  return fetchFileFromGithub(path)
}

async function approvePendingEvent(slug, updates = {}) {
  const pending = await fetchPendingEventFileFromGithub(slug)
  const livePath = buildEventPath(slug)
  if (!livePath) {
    const error = new Error('Invalid event id')
    error.status = 400
    throw error
  }

  const nowIso = new Date().toISOString()
  const next = {
    ...pending.json,
    status: 'approved',
    moderation: {
      ...(pending.json?.moderation || {}),
      approvedAt: nowIso,
    },
    approvedAt: nowIso,
    ...updates,
  }

  const content = `${JSON.stringify(next, null, 2)}\n`

  const message = `chore(events): approve submission ${slug}`
  const description = 'Move pending community submission into live events.'

  const result = await applyRepoChanges({
    message,
    description,
    changes: [
      { path: pending.path, delete: true },
      { path: livePath, content },
    ],
  })

  return { ...result, status: next.status }
}

async function applyRepoChanges({ message, description, changes }) {
  if (!Array.isArray(changes) || !changes.length) {
    throw new Error('No repository changes provided')
  }

  const config = getGithubEnvConfig()
  if (!config) {
    throw new Error('GitHub repository is not configured')
  }

  const { defaultBranch } = await getRepoInfo(config)
  const ref = await getBranchRef(config, defaultBranch)
  const baseCommitSha = ref?.object?.sha
  if (!baseCommitSha) {
    throw new Error('Failed to resolve default branch reference')
  }

  const baseCommit = await getCommit(config, baseCommitSha)
  const baseTreeSha = baseCommit?.tree?.sha
  if (!baseTreeSha) {
    throw new Error('Failed to resolve base tree for commit')
  }

  const treeEntries = []
  for (const change of changes) {
    if (!change || typeof change.path !== 'string') {
      throw new Error('Invalid repository change entry')
    }
    if (change.delete) {
      treeEntries.push({ path: change.path, mode: '100644', type: 'blob', sha: null })
      continue
    }
    if (typeof change.content !== 'string') {
      throw new Error('Repository change is missing content')
    }
    const blob = await createBlob(config, change.content)
    treeEntries.push({ path: change.path, mode: '100644', type: 'blob', sha: blob.sha })
  }

  const tree = await createTree(config, baseTreeSha, treeEntries)
  const commit = await createCommit(config, message, tree.sha, [baseCommitSha])

  const prMode = getPrMode()
  let branch = defaultBranch
  let prUrl = null

  if (prMode) {
    branch = `events-admin/${Date.now().toString(36)}`
    await createRef(config, branch, commit.sha)
    const prTitle = message
    const prBodyParts = []
    prBodyParts.push('Automated change generated by Events Admin.')
    if (description) {
      prBodyParts.push('', description)
    }
    const pr = await createPullRequest(config, {
      title: prTitle,
      head: branch,
      base: defaultBranch,
      body: prBodyParts.join('\n'),
    })
    prUrl = pr?.html_url || null
  } else {
    await updateRef(config, defaultBranch, commit.sha)
  }

  return {
    commitSha: commit.sha,
    branch,
    defaultBranch,
    prUrl,
    prMode,
  }
}

async function updateEventStatus(slug, nextStatus) {
  const file = await fetchEventFileFromGithub(slug)
  const currentStatus = typeof file.json?.status === 'string' ? file.json.status : ''
  const normalizedStatus = typeof nextStatus === 'string' ? nextStatus.trim() : ''
  if (!normalizedStatus) {
    const error = new Error('Status value is required')
    error.status = 400
    throw error
  }

  if (currentStatus === normalizedStatus) {
    return { changed: false, status: currentStatus }
  }

  const updated = { ...file.json, status: normalizedStatus }
  const content = `${JSON.stringify(updated, null, 2)}\n`
  const message = `chore(events-admin): ${normalizedStatus === 'published' ? 'publish' : 'unpublish'} ${slug}`
  const description = `Status updated from ${currentStatus || 'unspecified'} to ${normalizedStatus}.`
  const result = await applyRepoChanges({
    message,
    description,
    changes: [{ path: file.path, content }],
  })

  return {
    changed: true,
    status: normalizedStatus,
    previousStatus: currentStatus,
    ...result,
  }
}

async function deleteEventsFromGithub(slugs) {
  const unique = Array.from(
    new Set(
      (Array.isArray(slugs) ? slugs : [])
        .map((value) => sanitizeEventId(value))
        .filter(Boolean)
    )
  )
  if (!unique.length) {
    throw new Error('Provide at least one event id')
  }

  const files = await Promise.all(
    unique.map(async (slug) => {
      try {
        const file = await fetchEventFileFromGithub(slug)
        return { slug, ...file }
      } catch (error) {
        error.slug = slug
        throw error
      }
    })
  )

  const titles = files
    .map((file) => {
      const title = file.json && typeof file.json.title === 'string' ? file.json.title : ''
      if (title) {
        return `${file.slug} — ${title}`
      }
      return file.slug
    })

  const message =
    files.length === 1
      ? `chore(events-admin): delete ${files[0].slug}`
      : `chore(events-admin): delete ${files.length} events`

  const descriptionLines = titles.map((entry) => `- ${entry}`)
  const description = descriptionLines.length ? descriptionLines.join('\n') : undefined

  const result = await applyRepoChanges({
    message,
    description,
    changes: files.map((file) => ({ path: file.path, delete: true })),
  })

  return {
    count: files.length,
    message,
    ...result,
  }
}

module.exports = {
  DEFAULT_SYNC_REF,
  getGithubEnvConfig,
  getGithubSyncCapability,
  isGithubConfigured,
  fetchEventFileFromGithub,
  createPendingEventFile,
  fetchPendingEventFileFromGithub,
  approvePendingEvent,
  applyRepoChanges,
  updateEventStatus,
  buildEventPath,
  buildPendingEventPath,
  deleteEventsFromGithub,
}

module.exports.default = module.exports

