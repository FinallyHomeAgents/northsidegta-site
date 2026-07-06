'use strict'

const dns = require('node:dns')
const {
  Agent,
  ProxyAgent,
  Dispatcher,
  getGlobalDispatcher,
  setGlobalDispatcher,
} = require('undici')

let configured = false

function configureNetworking() {
  if (configured) return

  if (typeof dns.setDefaultResultOrder === 'function') {
    try {
      dns.setDefaultResultOrder('ipv4first')
    } catch (error) {
      if (process.env.DEBUG?.includes('events-runtime')) {
        console.warn('[events:runtime] Failed to set default DNS result order:', error.message)
      }
    }
  }

  try {
    const previous = getGlobalDispatcher()
    const dispatcher = buildDispatcher()

    if (dispatcher && previous !== dispatcher) {
      setGlobalDispatcher(dispatcher)
    }
  } catch (error) {
    if (process.env.DEBUG?.includes('events-runtime')) {
      console.warn('[events:runtime] Failed to configure global dispatcher:', error.message)
    }
  }

  configured = true
}

configureNetworking()

module.exports = {
  configureNetworking,
}

function buildDispatcher() {
  const directAgent = new Agent({
    keepAliveTimeout: 15_000,
    keepAliveMaxTimeout: 30_000,
    connections: 50,
    connect: {
      family: 4,
      lookup: dns.lookup,
    },
  })

  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    process.env.ALL_PROXY ||
    process.env.all_proxy

  if (!proxyUrl) {
    return directAgent
  }

  let proxyAgent
  try {
    proxyAgent = new ProxyAgent({
      uri: proxyUrl,
      keepAliveTimeout: 15_000,
      keepAliveMaxTimeout: 30_000,
      connections: 50,
    })
  } catch (error) {
    if (process.env.DEBUG?.includes('events-runtime')) {
      console.warn('[events:runtime] Failed to configure proxy agent:', error.message)
    }
    return directAgent
  }

  const noProxy = process.env.NO_PROXY || process.env.no_proxy
  if (!noProxy) {
    return proxyAgent
  }

  return new SelectiveProxyAgent({ proxyAgent, directAgent, noProxy })
}

class SelectiveProxyAgent extends Dispatcher {
  constructor({ proxyAgent, directAgent, noProxy }) {
    super()
    this.proxyAgent = proxyAgent
    this.directAgent = directAgent
    this.rules = parseNoProxy(noProxy)
  }

  dispatch(options, handler) {
    const target = extractHostname(options?.origin)
    if (target && shouldBypassProxy(target, this.rules)) {
      return this.directAgent.dispatch(options, handler)
    }
    return this.proxyAgent.dispatch(options, handler)
  }

  close() {
    return Promise.allSettled([this.proxyAgent.close(), this.directAgent.close()]).then(() => undefined)
  }

  destroy(err) {
    return Promise.allSettled([this.proxyAgent.destroy(err), this.directAgent.destroy(err)]).then(
      () => undefined
    )
  }
}

function parseNoProxy(value) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function shouldBypassProxy(hostname, rules) {
  if (!rules || !rules.length) return false

  const host = hostname.toLowerCase()

  return rules.some((rule) => {
    const normalized = rule.toLowerCase()
    if (normalized === '*') return true

    const [ruleHost, rulePort] = normalized.split(':')
    const [hostOnly, hostPort] = host.split(':')

    if (rulePort && rulePort !== hostPort) {
      return false
    }

    if (ruleHost.startsWith('.')) {
      const suffix = ruleHost.slice(1)
      return hostOnly === suffix || hostOnly.endsWith(`.${suffix}`)
    }

    return hostOnly === ruleHost
  })
}

function extractHostname(origin) {
  if (!origin) return ''
  try {
    if (typeof origin === 'string') {
      const parsed = new URL(origin)
      return parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname
    }
    if (typeof origin === 'object') {
      const protocol = origin.protocol || 'https:'
      const hostname = origin.hostname || origin.host || origin.servername
      if (hostname) {
        const port = origin.port ? `:${origin.port}` : ''
        return `${hostname}${port}`
      }
      if (origin.path) {
        return new URL(origin.path, `${protocol}//dummy`).hostname
      }
    }
  } catch (error) {
    if (process.env.DEBUG?.includes('events-runtime')) {
      console.warn('[events:runtime] Failed to parse origin hostname:', error.message)
    }
  }
  return ''
}
