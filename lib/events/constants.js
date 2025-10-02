const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '..', '..')
const CONFIG_DIR = path.join(ROOT_DIR, 'config')
const LOGS_DIR = path.join(ROOT_DIR, 'logs')

const DEFAULT_TIMEZONE = 'America/Toronto'
const DEFAULT_USER_AGENT = 'NorthSideGTA-EventBot/2.0 (+https://www.northsidegta.ca/community)'
const MAX_RESPONSE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_HTTP_RETRIES = 3
const HTTP_TIMEOUT_MS = 20000

module.exports = {
  ROOT_DIR,
  CONFIG_DIR,
  LOGS_DIR,
  DEFAULT_TIMEZONE,
  DEFAULT_USER_AGENT,
  MAX_RESPONSE_BYTES,
  MAX_HTTP_RETRIES,
  HTTP_TIMEOUT_MS,
}
