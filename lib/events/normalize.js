const { DateTime } = require('luxon')
const { DEFAULT_TIMEZONE } = require('./constants')

function normalizeEvent({
  source,
  title,
  description,
  start,
  end,
  timezone,
  url,
  location,
  allDay,
  data = {},
}) {
  const tz = timezone || source?.timezone || DEFAULT_TIMEZONE
  const resolvedStart = resolveDateTime(start, tz)
  const resolvedEnd = resolveDateTime(end, tz)

  const isAllDay = Boolean(allDay || resolvedStart.dateOnly)
  const { startDt, endDt } = buildDateRange(resolvedStart.dt, resolvedEnd.dt, tz, isAllDay)

  return {
    source: {
      id: source?.id || source?.domain || 'unknown',
      domain: source?.domain || 'unknown',
      strategy: source?.strategy || 'unknown',
    },
    title: sanitizeText(title),
    description: sanitizeText(description),
    start: startDt ? startDt.toISO() : null,
    end: endDt ? endDt.toISO() : null,
    timezone: tz,
    allDay: isAllDay,
    canonical_url: sanitizeUrl(url),
    location: buildLocation(location),
    data,
    upsert_key: buildUpsertKey({
      domain: source?.domain,
      title,
      url,
      start: startDt,
    }),
  }
}

function resolveDateTime(value, timezone) {
  if (!value) return { dt: null, dateOnly: false }
  if (value instanceof Date) {
    return {
      dt: DateTime.fromJSDate(value, { zone: 'utc' }).setZone(timezone),
      dateOnly: false,
    }
  }

  if (DateTime.isDateTime && DateTime.isDateTime(value)) {
    return {
      dt: value.setZone(timezone),
      dateOnly: false,
    }
  }

  if (typeof value === 'string') {
    let parsed = DateTime.fromISO(value, { zone: timezone })
    if (!parsed.isValid) {
      parsed = DateTime.fromRFC2822(value, { zone: timezone })
    }
    if (!parsed.isValid && /^\d{8}$/.test(value)) {
      parsed = DateTime.fromFormat(value, 'yyyyLLdd', { zone: timezone })
      return { dt: parsed, dateOnly: true }
    }
    if (parsed.isValid) {
      return { dt: parsed, dateOnly: false }
    }
  }

  return { dt: null, dateOnly: false }
}

function buildDateRange(startDt, endDt, timezone, isAllDay) {
  if (!startDt && !endDt) {
    return { startDt: null, endDt: null }
  }

  let computedStart = startDt
  let computedEnd = endDt

  if (isAllDay) {
    if (!computedStart && computedEnd) {
      computedStart = computedEnd
    }

    if (computedStart) {
      computedStart = computedStart.setZone(timezone).startOf('day')
    }

    if (computedEnd) {
      computedEnd = computedEnd.setZone(timezone).minus({ days: 1 }).endOf('day')
    } else if (computedStart) {
      computedEnd = computedStart.endOf('day')
    }
  } else {
    if (computedStart) {
      computedStart = computedStart.setZone(timezone)
    }

    if (computedEnd) {
      computedEnd = computedEnd.setZone(timezone)
    } else if (computedStart) {
      computedEnd = computedStart.plus({ hours: 1 })
    }
  }

  return { startDt: computedStart, endDt: computedEnd }
}

function sanitizeText(value) {
  if (!value) return ''
  return String(value).trim()
}

function sanitizeUrl(value) {
  if (!value) return ''
  try {
    const url = new URL(String(value).trim())
    return url.toString()
  } catch (error) {
    return String(value).trim()
  }
}

function buildLocation(value) {
  if (!value) return {}
  if (typeof value === 'string') {
    return { name: value }
  }
  if (typeof value === 'object') {
    const result = {}
    if (value.name) result.name = sanitizeText(value.name)
    if (value.address) result.address = sanitizeText(value.address)
    if (value.city) result.city = sanitizeText(value.city)
    if (value.province) result.province = sanitizeText(value.province)
    if (value.postalCode) result.postalCode = sanitizeText(value.postalCode)
    return result
  }
  return {}
}

function buildUpsertKey({ domain, title, url, start }) {
  const domainPart = domain ? domain.toLowerCase() : 'unknown'
  const identifier = sanitizeUrl(url) || sanitizeText(title)
  const startPart = start ? start.toISO() : 'unknown-start'
  return `${domainPart}::${identifier || 'untitled'}::${startPart}`
}

module.exports = {
  normalizeEvent,
  resolveDateTime,
  buildDateRange,
  buildUpsertKey,
}
