'use strict'

const dns = require('node:dns')
const { Agent, getGlobalDispatcher, setGlobalDispatcher } = require('undici')

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
    const agent = new Agent({
      keepAliveTimeout: 15_000,
      keepAliveMaxTimeout: 30_000,
      connections: 50,
      connect: {
        family: 4,
        lookup: dns.lookup,
      },
    })

    if (previous !== agent) {
      setGlobalDispatcher(agent)
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
