'use strict'

const ALLOWED_STATUSES = new Set(['draft', 'pending', 'approved', 'published', 'archived'])

function normalizeStatusValue(value) {
  if (value === undefined || value === null) return ''
  const text = String(value).trim().toLowerCase()
  if (!text) return ''
  if (ALLOWED_STATUSES.has(text)) {
    return text
  }
  return ''
}

function normalizeSourceValue(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase()
    if (!text) return ''
    if (text === 'feed' || text.endsWith('feed')) return 'feed'
    if (text === 'manual' || text === 'user' || text.includes('submission')) return 'manual'
    return ''
  }
  if (typeof value === 'object') return 'feed'
  return ''
}

function resolveSourceType(preservedEvent = {}, incomingEvent = {}) {
  const incomingSource = normalizeSourceValue(incomingEvent?.source)
  if (incomingSource) return incomingSource
  const preservedSource = normalizeSourceValue(preservedEvent?.source)
  if (preservedSource) return preservedSource
  if (incomingEvent && typeof incomingEvent === 'object') {
    if (incomingEvent.sourceDomain || incomingEvent.sourceUrl) return 'feed'
  }
  if (preservedEvent && typeof preservedEvent === 'object') {
    if (preservedEvent.sourceDomain || preservedEvent.sourceUrl) return 'feed'
  }
  return 'feed'
}

function resolveStatusForSync({
  preservedEvent = {},
  incomingEvent = {},
  archived = false,
  defaultStatus = 'pending',
} = {}) {
  const preservedStatus = normalizeStatusValue(preservedEvent?.status)
  const incomingStatus = normalizeStatusValue(incomingEvent?.status)
  const defaultNormalized = normalizeStatusValue(defaultStatus) || 'pending'

  const isArchived =
    archived || preservedStatus === 'archived' || incomingStatus === 'archived' ||
    normalizeBoolean(preservedEvent?.archived) ||
    normalizeBoolean(incomingEvent?.archived)
  if (isArchived) {
    return 'archived'
  }

  if (preservedStatus && preservedStatus !== 'pending') {
    return preservedStatus
  }

  if (incomingStatus && incomingStatus !== 'pending') {
    return incomingStatus
  }

  const sourceType = resolveSourceType(preservedEvent, incomingEvent)
  if (sourceType === 'feed') {
    return 'approved'
  }

  if (preservedStatus) return preservedStatus
  if (incomingStatus) return incomingStatus

  return defaultNormalized
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true
    if (['false', '0', 'no', 'n', 'off', ''].includes(normalized)) return false
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return false
    return value !== 0
  }
  return Boolean(value)
}

module.exports = {
  resolveStatusForSync,
  resolveSourceType,
  normalizeStatusValue,
}
