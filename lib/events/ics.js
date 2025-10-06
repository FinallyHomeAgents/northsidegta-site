const { DateTime } = require('luxon')

const DEFAULT_TIMEZONE = 'America/Toronto'
const RRULE_LOOKAHEAD_MONTHS = 6
const RRULE_MAX_OCCURRENCES = 120
const MAX_SCHEDULE_DAYS = 120

function expandIcsEvents(entries, feed = {}, now = new Date()) {
  if (!Array.isArray(entries) || !entries.length) return []

  const groups = new Map()

  for (const entry of entries) {
    if (!entry || entry.type !== 'VEVENT') continue
    const key = buildGroupKey(entry)
    if (!groups.has(key)) {
      groups.set(key, { base: entry, events: [] })
    }
    const group = groups.get(key)
    group.events.push(entry)
    if (!group.base || shouldPreferEntry(entry, group.base)) {
      group.base = entry
    }
  }

  const results = []
  for (const group of groups.values()) {
    const aggregated = aggregateGroup(group, feed, now)
    if (aggregated) {
      results.push(aggregated)
    }
  }

  return results
}

function aggregateGroup(group, feed, now) {
  const base = group?.base
  if (!base) return null

  const timezone = inferTimezone(base, feed)
  const allEvents = Array.isArray(group.events) && group.events.length ? group.events : [base]

  let occurrences = []
  for (const event of allEvents) {
    occurrences.push(...convertEventToOccurrences(event, timezone))
  }

  if (base.rrule) {
    occurrences.push(...expandRruleOccurrences(base, timezone, now))
  }

  if (!occurrences.length) {
    occurrences = deriveOccurrencesFromSingleSpan(base, timezone)
  }

  const deduped = dedupeOccurrences(occurrences)
  if (!deduped.length) {
    return normalizeLegacy(base)
  }

  deduped.sort((a, b) => a.start.toMillis() - b.start.toMillis())

  const scheduleMap = new Map()
  let earliest = null
  let latest = null

  for (const occurrence of deduped) {
    if (!occurrence?.start || !occurrence?.end || !occurrence.start.isValid || !occurrence.end.isValid) {
      continue
    }
    const isoDate = occurrence.start.toISODate()
    if (!isoDate) continue

    if (!earliest || occurrence.start < earliest) {
      earliest = occurrence.start
    }
    if (!latest || occurrence.end > latest) {
      latest = occurrence.end
    }

    if (!scheduleMap.has(isoDate)) {
      scheduleMap.set(isoDate, { date: isoDate, all_day: false, blocks: [] })
    }

    const entry = scheduleMap.get(isoDate)
    if (occurrence.allDay) {
      entry.all_day = true
      entry.blocks = []
      continue
    }

    if (entry.all_day) {
      continue
    }

    entry.blocks.push({
      start: occurrence.start.toFormat('HH:mm'),
      end: occurrence.end.toFormat('HH:mm'),
    })
  }

  const schedule = Array.from(scheduleMap.values())
    .map((entry) => {
      if (entry.all_day) {
        return { date: entry.date, all_day: true, blocks: [] }
      }
      const blocks = entry.blocks
        .filter((block) => block && block.start && block.end)
        .map((block) => ({ start: block.start, end: block.end }))
        .sort((a, b) => a.start.localeCompare(b.start))
      return { date: entry.date, all_day: false, blocks }
    })
    .filter((entry) => entry.all_day || entry.blocks.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (!schedule.length) {
    return normalizeLegacy(base)
  }

  const normalized = {
    ...base,
    start: earliest ? earliest.toISO() : base.start,
    end: latest ? latest.toISO() : base.end,
    use_daily_schedule: true,
    daily_schedule: schedule,
  }

  const rruleString = extractRruleString(base)
  if (rruleString) {
    normalized.rrule = rruleString
  }

  if (!normalized.summary && base.summary) {
    normalized.summary = base.summary
  }
  if (!normalized.description && base.description) {
    normalized.description = base.description
  }
  if (!normalized.url && base.url) {
    normalized.url = base.url
  }

  return normalized
}

function normalizeLegacy(base) {
  const rruleString = extractRruleString(base)
  const normalized = { ...base }
  if (rruleString) {
    normalized.rrule = rruleString
  }
  return normalized
}

function extractRruleString(event) {
  if (!event?.rrule || typeof event.rrule.toString !== 'function') return ''
  const raw = event.rrule.toString()
  if (typeof raw !== 'string') return ''
  const line = raw
    .split(/\n+/)
    .map((entry) => entry.trim())
    .find((entry) => /^RRULE:/i.test(entry))
  if (!line) return ''
  return line.replace(/^RRULE:/i, '')
}

function buildGroupKey(event) {
  if (event?.uid) return `uid:${event.uid}`
  const summary = (event?.summary || '').toLowerCase()
  const location = (event?.location || '').toLowerCase()
  const startKey = event?.start instanceof Date ? event.start.toISOString() : ''
  return `fallback:${summary}|${location}|${startKey}`
}

function shouldPreferEntry(candidate, current) {
  const candidateStart = candidate?.start instanceof Date ? candidate.start.getTime() : NaN
  const currentStart = current?.start instanceof Date ? current.start.getTime() : NaN
  if (!Number.isFinite(candidateStart)) return false
  if (!Number.isFinite(currentStart)) return true
  return candidateStart < currentStart
}

function inferTimezone(event, feed) {
  const candidates = [
    event?.rrule?.options?.tzid,
    event?.tz,
    event?.start?.tz,
    event?.end?.tz,
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value && !isUtcLike(value)) {
      return value
    }
  }

  if (typeof feed?.timezone === 'string' && feed.timezone) {
    return feed.timezone
  }

  return DEFAULT_TIMEZONE
}

function isUtcLike(value) {
  const normalized = String(value || '').trim().toUpperCase()
  return normalized === 'UTC' || normalized === 'ETC/UTC' || normalized === 'GMT'
}

function convertEventToOccurrences(event, timezone) {
  if (!event) return []
  const allDay = isAllDayEvent(event)
  const start = toDateTime(event.start, timezone, { allDay })
  const end = toDateTime(event.end, timezone, { isEnd: true, allDay })
  return buildOccurrencesFromRange(start, end, allDay)
}

function expandRruleOccurrences(event, timezone, now) {
  const rule = event?.rrule
  if (!rule) return []

  const baseAllDay = isAllDayEvent(event)
  const durationMs = computeDurationMs(event, timezone, baseAllDay)

  const windowStart = DateTime.fromJSDate(now instanceof Date ? now : new Date())
    .setZone(timezone || DEFAULT_TIMEZONE)
    .startOf('day')
    .minus({ days: 1 })
  const windowEnd = windowStart.plus({ months: RRULE_LOOKAHEAD_MONTHS })

  let between = []
  try {
    between = rule.between(windowStart.toJSDate(), windowEnd.toJSDate(), true) || []
  } catch (error) {
    return []
  }

  const exdates = new Set()
  if (event?.exdate && typeof event.exdate === 'object') {
    for (const value of Object.values(event.exdate)) {
      const dt = toDateTime(value, timezone, { allDay: baseAllDay })
      if (dt) exdates.add(dt.toISODate())
    }
  }

  const overrides = new Map()
  if (event?.recurrences && typeof event.recurrences === 'object') {
    for (const value of Object.values(event.recurrences)) {
      if (!value) continue
      const overrideAllDay = isAllDayEvent(value) || baseAllDay
      const overrideStart =
        toDateTime(value.start || value.dtstart || value.recurrenceid, timezone, { allDay: overrideAllDay }) ||
        toDateTime(value.recurrenceid, timezone, { allDay: overrideAllDay })
      if (overrideStart) {
        overrides.set(overrideStart.toISODate(), { data: value, allDay: overrideAllDay })
      }
    }
  }

  const occurrences = []
  for (const occurrenceDate of between) {
    if (!(occurrenceDate instanceof Date) || occurrences.length >= RRULE_MAX_OCCURRENCES) break
    const start = DateTime.fromJSDate(occurrenceDate).setZone(timezone || DEFAULT_TIMEZONE)
    if (!start.isValid) continue
    const dateKey = start.toISODate()
    if (exdates.has(dateKey)) continue

    if (overrides.has(dateKey)) {
      const { data: override, allDay: overrideAllDay } = overrides.get(dateKey)
      const overrideStart =
        toDateTime(override.start || override.dtstart || occurrenceDate, timezone, { allDay: overrideAllDay }) || start
      const overrideEnd =
        toDateTime(override.end || override.dtend, timezone, { isEnd: true, allDay: overrideAllDay }) ||
        (durationMs > 0 ? overrideStart.plus({ milliseconds: durationMs }) : null)
      occurrences.push(...buildOccurrencesFromRange(overrideStart, overrideEnd, overrideAllDay))
    } else {
      const end = durationMs > 0 ? start.plus({ milliseconds: durationMs }) : null
      occurrences.push(...buildOccurrencesFromRange(start, end, baseAllDay))
    }

    if (occurrences.length >= RRULE_MAX_OCCURRENCES) break
  }

  return occurrences
}

function deriveOccurrencesFromSingleSpan(event, timezone) {
  if (!event) return []
  const allDay = isAllDayEvent(event)
  if (allDay) return []
  const start = toDateTime(event.start, timezone, { allDay })
  const end = toDateTime(event.end, timezone, { isEnd: true, allDay })
  if (!start || !end || !start.isValid || !end.isValid) return []
  if (!start.startOf('day').equals(end.startOf('day'))) {
    return splitTimedRange(start, end)
  }
  return []
}

function dedupeOccurrences(occurrences) {
  const byDate = new Map()
  for (const occurrence of occurrences) {
    if (!occurrence?.start || !occurrence.start.isValid) continue
    const key = occurrence.start.toISODate()
    if (!key) continue
    if (!byDate.has(key) || occurrence.start < byDate.get(key).start) {
      byDate.set(key, occurrence)
    }
  }
  return Array.from(byDate.values())
}

function buildOccurrencesFromRange(start, end, allDay) {
  if (!start || !start.isValid) return []

  if (allDay) {
    const dayStart = start.startOf('day')
    const exclusiveEnd = end && end.isValid ? end.startOf('day') : dayStart.plus({ days: 1 })
    const occurrences = []
    let cursor = dayStart
    let count = 0
    while (cursor < exclusiveEnd && count < MAX_SCHEDULE_DAYS) {
      occurrences.push({
        start: cursor,
        end: cursor.endOf('day'),
        allDay: true,
      })
      cursor = cursor.plus({ days: 1 })
      count += 1
    }
    if (!occurrences.length) {
      occurrences.push({
        start: dayStart,
        end: dayStart.endOf('day'),
        allDay: true,
      })
    }
    return occurrences
  }

  if (!end || !end.isValid || end <= start) {
    return []
  }

  if (start.hasSame(end, 'day')) {
    return [
      {
        start,
        end,
        allDay: false,
      },
    ]
  }

  return splitTimedRange(start, end)
}

function splitTimedRange(start, end) {
  if (!start || !end || !start.isValid || !end.isValid) return []
  if (end <= start) return []

  const startMinutes = start.hour * 60 + start.minute
  const endMinutes = end.hour * 60 + end.minute
  if (endMinutes <= startMinutes) return []

  const occurrences = []
  let cursor = start.startOf('day')
  const finalDay = end.startOf('day')
  let count = 0
  while (cursor <= finalDay && count < MAX_SCHEDULE_DAYS) {
    const dayStart = cursor.set({
      hour: start.hour,
      minute: start.minute,
      second: 0,
      millisecond: 0,
    })
    const dayEnd = cursor.set({
      hour: end.hour,
      minute: end.minute,
      second: 0,
      millisecond: 0,
    })
    if (!dayEnd.isValid || dayEnd <= dayStart) {
      return []
    }
    occurrences.push({
      start: dayStart,
      end: dayEnd,
      allDay: false,
    })
    cursor = cursor.plus({ days: 1 })
    count += 1
  }

  return occurrences
}

function computeDurationMs(event, timezone, allDay) {
  const start = toDateTime(event?.start, timezone, { allDay })
  const end = toDateTime(event?.end, timezone, { isEnd: true, allDay })
  if (!start || !end || !start.isValid || !end.isValid || end <= start) return 0
  return end.diff(start, 'milliseconds').milliseconds
}

function isAllDayEvent(event) {
  if (!event) return false
  if (event.datetype === 'date') return true
  if (event.start?.dateOnly || event.end?.dateOnly) return true
  if (event.params && typeof event.params === 'object') {
    if (Array.isArray(event.params) && event.params.includes('VALUE=DATE')) return true
    if (event.params.VALUE === 'DATE') return true
  }
  return false
}

function toDateTime(raw, timezone, options = {}) {
  if (!raw) return null
  const zone = timezone || DEFAULT_TIMEZONE

  if (raw instanceof Date) {
    if (raw.dateOnly) {
      const year = raw.getUTCFullYear()
      const month = raw.getUTCMonth() + 1
      const day = raw.getUTCDate()
      const dateOnly = DateTime.fromObject({ year, month, day }, { zone })
      return options.isEnd ? dateOnly.startOf('day') : dateOnly.startOf('day')
    }
    const base = DateTime.fromJSDate(raw, { zone: 'utc' })
    const dt = base.setZone(zone)
    if (options.allDay) {
      return options.isEnd ? dt.startOf('day') : dt.startOf('day')
    }
    return dt
  }

  if (raw?.toJSDate) {
    const jsDate = raw.toJSDate()
    if (jsDate instanceof Date) {
      return toDateTime(jsDate, timezone, options)
    }
  }

  return null
}

module.exports = {
  expandIcsEvents,
  _private: {
    inferTimezone,
    convertEventToOccurrences,
    expandRruleOccurrences,
    buildOccurrencesFromRange,
    splitTimedRange,
    isAllDayEvent,
    toDateTime,
  },
}
