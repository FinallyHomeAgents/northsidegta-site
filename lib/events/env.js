'use strict'

function isCi() {
  return process.env.CI === 'true'
}

function allowNetworkInCi() {
  if (!isCi()) return true
  return process.env.EVENTS_ALLOW_NETWORK === 'true' || process.env.ALLOW_EVENTS_NETWORK === 'true'
}

function networkBlockedReason() {
  if (allowNetworkInCi()) return ''
  if (!isCi()) return ''
  return 'network disabled in CI (set EVENTS_ALLOW_NETWORK=true to enable)'
}

module.exports = {
  isCi,
  allowNetworkInCi,
  networkBlockedReason,
}
