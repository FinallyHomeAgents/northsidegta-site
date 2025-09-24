import { Buffer } from 'buffer'
import { sanitizeEventId } from './admin-events'

const GITHUB_API_BASE = 'https://api.github.com'
const USER_AGENT = 'northsidegta-events-admin'

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
  const [owner, repo] = trimmed.split('/')
  if (!owner || !repo) return null
  return { owner, repo }
}

export function getGithubEnvConfig() {
  const token = process.env.GITHUB_TOKEN
  const repoValue = process.env.GITHUB_REPO
  const repo = parseRepoString(repoValue)
  if (!token || !repo) {
    return null
  }
  return { ...repo, token }
}

export function isGithubConfigured() {
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

export async function fetchEventFileFromGithub(slug) {
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

export async function applyRepoChanges({ message, description, changes }) {
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

export async function updateEventStatus(slug, nextStatus) {
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

export async function deleteEventsFromGithub(slugs) {
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

