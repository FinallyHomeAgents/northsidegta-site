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

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const entries = await fs.readdir(eventsDir, { withFileTypes: true })
  let updated = 0
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    const filePath = path.join(eventsDir, entry.name)
    const raw = await fs.readFile(filePath, 'utf8')
    let data
    try {
      data = JSON.parse(raw)
    } catch (error) {
      console.warn(`[convert] skipped ${entry.name}: invalid JSON`)
      continue
    }

    const schedule = Array.isArray(data.daily_schedule) ? data.daily_schedule : null
    if (!schedule) continue

    let changed = false
    const nextSchedule = schedule.map((item) => {
      if (!item || typeof item !== 'object') return item
      const date = typeof item.date === 'string' ? item.date : item.day || ''
      const allDay = Boolean(item.all_day ?? item.allDay)
      const start =
        typeof item.start_time === 'string'
          ? item.start_time.trim()
          : typeof item.startTime === 'string'
            ? item.startTime.trim()
            : Array.isArray(item.blocks) && item.blocks[0]?.start
              ? String(item.blocks[0].start).trim()
              : ''
      const end =
        typeof item.end_time === 'string'
          ? item.end_time.trim()
          : typeof item.endTime === 'string'
            ? item.endTime.trim()
            : Array.isArray(item.blocks) && item.blocks[0]?.end
              ? String(item.blocks[0].end).trim()
              : ''

      if (allDay) {
        if ('blocks' in item || item.start_time !== '' || item.end_time !== '') {
          changed = true
        }
        return { date, all_day: true, start_time: '', end_time: '' }
      }

      if (!start && !end) {
        if ('blocks' in item) changed = true
        return { date, all_day: false, start_time: '', end_time: '' }
      }

      if ('blocks' in item || item.start_time !== start || item.end_time !== end) {
        changed = true
      }
      return { date, all_day: false, start_time: start, end_time: end }
    })

    if (!changed) continue

    const next = { ...data, daily_schedule: nextSchedule }
    const ordered = orderKeys(next)
    if (!dryRun) {
      await fs.writeFile(filePath, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8')
    }
    updated += 1
  }

  console.log(`${dryRun ? 'Previewed' : 'Updated'} ${updated} file${updated === 1 ? '' : 's'}.`)
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
  console.error('[convert] Unhandled error', error)
  process.exit(1)
})
