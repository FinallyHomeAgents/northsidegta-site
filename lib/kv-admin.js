import { kv } from '@vercel/kv'

const REQUIRED_ENV_VARS = ['KV_URL', 'KV_REST_API_URL', 'KV_REST_API_TOKEN']

export function isKvConfigured() {
  return REQUIRED_ENV_VARS.every((name) => typeof process.env[name] === 'string' && process.env[name].length > 0)
}

export function getKvClient() {
  if (!isKvConfigured()) {
    throw new Error('KV not configured')
  }
  return kv
}
