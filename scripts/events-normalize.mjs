#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { normalizeCmsEvent, createEventValidator } = require('../lib/events/cms-normalizer.js')
const { fetchEventPageImage, DEFAULT_EVENT_USER_AGENT } = require('../lib/events/image-scraper.js')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const COLLECTIONS = [
  {
    name: 'events',
    directory: path.join(rootDir, 'public', 'data', 'events'),
  },
]

async function main() {
  const options = parseArguments(process.argv.slice(2))
  if (options.help) {
    printHelp()
    process.exit(0)
  }
  if (options.errors.length > 0) {
    options.errors.forEach((message) => console.error(`[events:normalize] ${message}`))
    printHelp()
    process.exit(1)
  }

  const validator = createEventValidator()
  const summary = {
    total: 0,
    changed: 0,
    unchanged: 0,
    errors: [],
    changedFiles: [],
  }

  for (const collection of COLLECTIONS) {
    await processCollection(collection, validator, options, summary)
  }

  await maybeWriteReport(options, summary)
  reportSummary(summary, options)

  if (summary.errors.length > 0) {
    process.exit(1)
  }
  if (options.check && summary.changed > 0) {
    console.error('[events:normalize] Schema check failed — run `npm run events:normalize` to apply fixes.')
    process.exit(1)
  }
}

async function processCollection(collection, validator, options, summary) {
  let entries
  try {
    entries = await fs.readdir(collection.directory, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`[events:normalize] Skipping missing directory ${relativePath(collection.directory)}`)
      return
    }
    throw error
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json') || entry.name.startsWith('_')) {
      continue
    }
    const filePath = path.join(collection.directory, entry.name)
    const relative = relativePath(filePath)
    summary.total += 1

    let raw
    try {
      raw = await fs.readFile(filePath, 'utf8')
    } catch (error) {
      summary.errors.push({ file: relative, reason: `Unable to read file (${error.message})` })
      continue
    }

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      summary.errors.push({ file: relative, reason: `Invalid JSON (${error.message})` })
      continue
    }

    let normalized
    let changeNotes = []
    try {
      if (!parsed.image) {
        const enriched = await fetchEventPageImage(parsed, { userAgent: DEFAULT_EVENT_USER_AGENT })
        if (enriched) {
          parsed.image = enriched
          changeNotes.push('enriched image')
        }
      }

      const result = normalizeCmsEvent(parsed)
      normalized = result.event
      changeNotes = [...(result.changes || []), ...changeNotes]
    } catch (error) {
      summary.errors.push({ file: relative, reason: error.message })
      continue
    }

    const validation = validator(normalized)
    if (!validation.valid) {
      summary.errors.push({
        file: relative,
        reason: 'Schema validation failed',
        details: validation.errors?.map((item) => `${item.instancePath || '/'} ${item.message || ''}`.trim()),
      })
      continue
    }

    const output = `${JSON.stringify(normalized, null, 2)}\n`
    const changed = output !== raw

    if (changed) {
      summary.changed += 1
      summary.changedFiles.push({ file: relative, changes: changeNotes })
      if (!options.check && !options.dryRun) {
        await fs.writeFile(filePath, output, 'utf8')
      }
    } else {
      summary.unchanged += 1
    }
  }
}

function parseArguments(args) {
  const options = {
    check: false,
    dryRun: false,
    help: false,
    report: null,
    errors: [],
  }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--check') {
      options.check = true
      options.dryRun = true
      continue
    }
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg.startsWith('--report=')) {
      options.report = resolveReportPath(arg.slice('--report='.length))
      continue
    }
    if (arg === '--report') {
      const next = args[index + 1]
      if (!next) {
        options.errors.push('Missing value for --report')
      } else {
        options.report = resolveReportPath(next)
        index += 1
      }
      continue
    }
    options.errors.push(`Unknown option ${arg}`)
  }
  return options
}

async function maybeWriteReport(options, summary) {
  if (!options.report) return
  const mode = options.check ? 'check' : options.dryRun ? 'dry-run' : 'write'
  const payload = {
    generatedAt: new Date().toISOString(),
    mode,
    total: summary.total,
    changed: summary.changed,
    unchanged: summary.unchanged,
    errors: summary.errors,
    changedFiles: summary.changedFiles,
  }
  await fs.mkdir(path.dirname(options.report), { recursive: true })
  await fs.writeFile(options.report, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

function reportSummary(summary, options) {
  console.log(`[events:normalize] Files scanned: ${summary.total}`)
  console.log(
    `[events:normalize] Changed: ${summary.changed} — Unchanged: ${summary.unchanged} — Errors: ${summary.errors.length}`,
  )

  if (summary.changedFiles.length > 0) {
    const limit = 20
    console.log('[events:normalize] Updated files:')
    summary.changedFiles.slice(0, limit).forEach((item) => {
      const notes = item.changes.length > 0 ? ` (${item.changes.join(', ')})` : ''
      console.log(`  • ${item.file}${notes}`)
    })
    if (summary.changedFiles.length > limit) {
      console.log(`  • …and ${summary.changedFiles.length - limit} more`)
    }
    if (options.check) {
      console.log('[events:normalize] Run `npm run events:normalize` to apply these changes.')
    }
  }

  if (summary.errors.length > 0) {
    console.error('[events:normalize] Errors encountered:')
    summary.errors.forEach((error) => {
      console.error(`  • ${error.file}: ${error.reason}`)
      if (error.details?.length) {
        error.details.forEach((detail) => console.error(`      - ${detail}`))
      }
    })
  }
}

function resolveReportPath(value) {
  return path.isAbsolute(value) ? value : path.join(rootDir, value)
}

function relativePath(targetPath) {
  return path.relative(rootDir, targetPath)
}

function printHelp() {
  console.log(`Usage: npm run events:normalize [-- --check|--dry-run|--report <file>]\n\n` +
    `Options:\n` +
    `  --check        Validate without writing; exits 1 if fixes are required\n` +
    `  --dry-run      Show what would change without writing files\n` +
    `  --report PATH  Write a JSON summary report to PATH\n` +
    `  -h, --help     Show this help message\n`)
}

main().catch((error) => {
  console.error('[events:normalize] Unexpected error:', error)
  process.exit(1)
})
