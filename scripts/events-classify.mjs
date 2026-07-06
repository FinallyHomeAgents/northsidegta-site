#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const feedsPath = path.join(rootDir, 'config', 'event-feeds.json')
const sourcesPath = path.join(rootDir, 'config', 'event-sources.json')

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function parseArgs(argv) {
  const options = {
    input: path.join(rootDir, 'logs', 'events-health.json'),
    apply: false,
    staleDays: 365,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if ((arg === '--input' || arg === '--file') && argv[index + 1]) {
      options.input = path.resolve(argv[index + 1])
      index += 1
      continue
    }
    if (arg.startsWith('--input=')) {
      options.input = path.resolve(arg.split('=')[1])
      continue
    }
    if (arg === '--apply') {
      options.apply = true
      continue
    }
    if (arg === '--stale-days' && argv[index + 1]) {
      options.staleDays = Number.parseInt(argv[index + 1], 10) || options.staleDays
      index += 1
      continue
    }
    if (arg.startsWith('--stale-days=')) {
      options.staleDays = Number.parseInt(arg.split('=')[1], 10) || options.staleDays
      continue
    }
  }

  return options
}

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function classifyRecord(record, options, now = new Date()) {
  const earliest = parseDate(record.earliest)
  const latest = parseDate(record.latest)
  const daysOld = latest ? (now - latest) / (1000 * 60 * 60 * 24) : Infinity
  const staleThreshold = options.staleDays
  const base = {
    id: record.id,
    status: record.status,
    fetched: record.fetched || 0,
    usable: record.usable || 0,
    earliest: earliest ? earliest.toISOString() : '',
    latest: latest ? latest.toISOString() : '',
    note: record.note || '',
    warnings: record.warnings || [],
  }

  if (record.status === 'disabled') {
    return { ...base, health: 'disabled', reason: record.note || 'feed disabled in config' }
  }

  if (record.status === 'network-blocked') {
    return { ...base, health: 'warning', reason: record.note || 'network blocked; rerun with connectivity' }
  }

  if (record.status === 'failed') {
    return { ...base, health: 'broken', reason: record.note || 'fetch/parse failed' }
  }

  if (record.usable > 0) {
    if (Number.isFinite(daysOld) && daysOld > staleThreshold) {
      return { ...base, health: 'warning', reason: `events stale (> ${staleThreshold}d)` }
    }
    return { ...base, health: 'healthy', reason: '' }
  }

  if (record.status === 'filtered') {
    return { ...base, health: 'warning', reason: 'events filtered out by rules' }
  }

  return { ...base, health: 'warning', reason: record.note || 'no usable events parsed' }
}

function classifyAll(records, options) {
  const groups = { healthy: [], warning: [], broken: [], disabled: [] }
  const now = new Date()
  for (const record of records) {
    const classified = classifyRecord(record, options, now)
    groups[classified.health].push(classified)
  }
  return groups
}

function applyClassification(groups, options) {
  const feeds = loadJson(feedsPath)
  const sources = loadJson(sourcesPath)

  const classificationById = {}
  for (const [health, entries] of Object.entries(groups)) {
    for (const entry of entries) {
      classificationById[entry.id] = { health, entry }
    }
  }

  let changed = false
  for (const feed of feeds) {
    const classified = classificationById[feed.id]
    if (!classified) continue
    const { health, entry } = classified
    if (health === 'broken' && entry.reason && !entry.reason.includes('network')) {
      if (feed.enabled !== false) changed = true
      feed.enabled = false
      feed.disabledReason = entry.reason
    }
    feed.healthStatus = health
    if (entry.reason) feed.healthNote = entry.reason
  }

  for (const source of sources) {
    const classified = classificationById[source.id]
    if (!classified) continue
    const { health, entry } = classified
    if (health === 'broken' && entry.reason && !entry.reason.includes('network')) {
      if (source.enabled !== false) changed = true
      source.enabled = false
      source.disabledReason = entry.reason
    }
    source.healthStatus = health
    if (entry.reason) source.healthNote = entry.reason
  }

  if (changed) {
    saveJson(feedsPath, feeds)
    saveJson(sourcesPath, sources)
    console.log('[events-classify] Updated config files based on classification.')
  } else {
    saveJson(feedsPath, feeds)
    saveJson(sourcesPath, sources)
    console.log('[events-classify] Recorded health notes without disabling additional feeds.')
  }
}

function printSummary(groups) {
  const order = ['healthy', 'warning', 'broken', 'disabled']
  for (const key of order) {
    const entries = groups[key]
    if (!entries.length) continue
    console.log(`\n${key.toUpperCase()} (${entries.length})`)
    for (const entry of entries) {
      const range = entry.earliest && entry.latest ? `${entry.earliest.split('T')[0]} → ${entry.latest.split('T')[0]}` : 'n/a'
      const warningText = entry.reason || entry.note || ''
      console.log(`- ${entry.id}: usable=${entry.usable}, fetched=${entry.fetched}, range=${range}${warningText ? ` — ${warningText}` : ''}`)
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  if (!fs.existsSync(options.input)) {
    console.error(`[events-classify] Health snapshot not found at ${options.input}`)
    process.exit(1)
  }

  const snapshot = loadJson(options.input)
  const records = snapshot.records || []
  if (!records.length) {
    console.error('[events-classify] No records in health snapshot; rerun events:health with connectivity.')
    process.exit(1)
  }

  const groups = classifyAll(records, options)
  printSummary(groups)

  if (options.apply) {
    applyClassification(groups, options)
  }
}

main()
