#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const eventsDir = path.join(rootDir, 'public', 'data', 'events')

const KEY_ORDER = [
  'id',
  'slug',
  'title',
  'summary',
  'description',
  'startDate',
  'endDate',
  'allDay',
  'use_daily_schedule',
  'daily_schedule',
  'recurrence',
  'category',
  'town',
  'subArea',
  'location',
  'locationName',
  'address',
  'lat',
  'lng',
  'priceType',
  'priceNote',
  'badges',
  'qaTags',
  'image',
  'organizerName',
  'organizerUrl',
  'url',
  'eventUrl',
  'icsUrl',
  'status',
  'hidden',
  'archived',
  'notes',
  'source',
  'sourceName',
  'sourceUrl',
  'sourceDomain',
  'sourcePriority',
  'sourceRef',
  'lastSyncedAt',
  'firstSeenAt',
  'updatedAt',
]

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_DERIVED_DAYS = 90

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  let updated = 0
  let skipped = 0

  const entries = await fs.readdir(eventsDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    const filePath = path.join(eventsDir, entry.name)
    const raw = await fs.readFile(filePath, 'utf8')
    let data
    try {
      data = JSON.parse(raw)
    } catch (error) {
      console.warn(`[backfill] Skipping ${entry.name}: invalid JSON`)
      skipped += 1
      continue
    }

    if (Array.isArray(data.daily_schedule) && data.daily_schedule.length) {
      skipped += 1
      continue
    }
    if (data.use_daily_schedule) {
      skipped += 1
      continue
    }
    if (typeof data.recurrence === 'string' && data.recurrence.trim()) {
      skipped += 1
      continue
    }

    const proposal = deriveDailySchedule(data)
    if (!proposal.length) {
      skipped += 1
      continue
    }

    const next = {
      ...data,
      daily_schedule: proposal,
      use_daily_schedule: true,
    }
    const ordered = orderKeys(next)

    if (!dryRun) {
      await fs.writeFile(filePath, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8')
    }
    updated += 1
  }

  console.log(`${dryRun ? 'Previewed' : 'Updated'} ${updated} event${updated === 1 ? '' : 's'}. Skipped ${skipped}.`)
}

function deriveDailySchedule(event) {
  const start = parseDate(event?.startDate)
  const end = parseDate(event?.endDate) || start
  if (!start || !end) return []
  if (end <= start) return []

  const startMidnight = start.getHours() === 0 && start.getMinutes() === 0
  const endMidnight = end.getHours() === 0 && end.getMinutes() === 0

  const treatAsAllDay = Boolean(event?.allDay) || (startMidnight && endMidnight)
  if (!treatAsAllDay) return []

  const firstDay = toStartOfDay(start)
  const lastDay = toStartOfDay(end)
  if (!firstDay || !lastDay || lastDay < firstDay) return []

  const results = []
  let cursor = new Date(firstDay)
  let days = 0
  while (cursor <= lastDay && days < MAX_DERIVED_DAYS) {
    const iso = toIsoDate(cursor)
    results.push({
      date: iso,
      all_day: true,
      start_time: '',
      end_time: '',
    })
    cursor = new Date(cursor.getTime() + DAY_MS)
    days += 1
  }

  return results
}

function parseDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function toStartOfDay(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  copy.setHours(0, 0, 0, 0)
  return copy
}

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function orderKeys(event) {
  const ordered = {}
  for (const key of KEY_ORDER) {
    if (event[key] !== undefined) {
      ordered[key] = event[key]
    }
  }
  for (const key of Object.keys(event)) {
    if (!(key in ordered)) {
      ordered[key] = event[key]
    }
  }
  return ordered
}

main().catch((error) => {
  console.error('[backfill] Unhandled error', error)
  process.exit(1)
})
