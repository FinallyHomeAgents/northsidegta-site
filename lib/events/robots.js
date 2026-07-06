const { URL } = require('url')
const { fetchResource } = require('./http-client')

const robotsCache = new Map()

async function evaluateRobots(url, options = {}) {
  try {
    const target = new URL(url)
    const origin = `${target.protocol}//${target.host}`
    const robots = await loadRobots(origin, options)
    const path = target.pathname || '/'
    return robots.check(path)
  } catch (error) {
    return { allowed: true, source: 'error', error: error.message }
  }
}

async function loadRobots(origin, options = {}) {
  if (robotsCache.has(origin)) {
    return robotsCache.get(origin)
  }

  try {
    const robotsUrl = `${origin.replace(/\/$/, '')}/robots.txt`
    const response = await fetchResource(robotsUrl, {
      ...options,
      maxRetries: 1,
      timeoutMs: 10000,
    })
    const text = response.buffer.toString('utf8')
    const parser = buildParser(text)
    robotsCache.set(origin, parser)
    return parser
  } catch (error) {
    const parser = buildParser('')
    robotsCache.set(origin, parser)
    return parser
  }
}

function buildParser(text) {
  const groups = parseRobotsText(text)
  return {
    check(pathname = '/') {
      const applicable = groups['*'] || []
      if (!applicable.length) return { allowed: true, source: 'implicit' }
      let decision = null
      for (const rule of applicable) {
        if (rule.path === '/' && rule.type === 'allow') {
          decision = { allowed: true, source: 'allow' }
          continue
        }
        if (matchesPath(pathname, rule.path)) {
          decision = { allowed: rule.type === 'allow', source: rule.type }
        }
      }
      if (!decision) {
        return { allowed: true, source: 'implicit' }
      }
      return decision
    },
  }
}

function parseRobotsText(text) {
  const groups = {}
  let currentAgents = []
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const commentIndex = line.indexOf('#')
    const cleaned = commentIndex >= 0 ? line.slice(0, commentIndex).trim() : line
    if (!cleaned) continue
    const [directiveRaw, valueRaw] = cleaned.split(':', 2)
    if (!directiveRaw || typeof valueRaw === 'undefined') continue
    const directive = directiveRaw.trim().toLowerCase()
    const value = valueRaw.trim()

    if (directive === 'user-agent') {
      currentAgents = [value.toLowerCase()]
      if (!groups[value.toLowerCase()]) {
        groups[value.toLowerCase()] = []
      }
      continue
    }

    if (directive === 'allow' || directive === 'disallow') {
      if (!currentAgents.length) {
        currentAgents = ['*']
        if (!groups['*']) groups['*'] = []
      }
      for (const agent of currentAgents) {
        if (!groups[agent]) groups[agent] = []
        groups[agent].push({ type: directive, path: value || '/' })
      }
    }
  }

  return groups
}

function matchesPath(pathname, rulePath) {
  if (!rulePath || rulePath === '/') return true
  if (pathname === rulePath) return true
  if (rulePath.endsWith('*')) {
    const prefix = rulePath.slice(0, -1)
    return pathname.startsWith(prefix)
  }
  return pathname.startsWith(rulePath)
}

module.exports = {
  evaluateRobots,
  loadRobots,
}
