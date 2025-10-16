#!/usr/bin/env node
import '../lib/events/runtime.js'

import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const logsDir = path.join(rootDir, 'logs')

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const steps = []

  if (options.runConnectivity) {
    const jsonPath = path.join(logsDir, `connectivity_${timestamp()}.json`)
    const args = [path.join('scripts', 'events-connectivity.mjs'), '--json', jsonPath]
    for (const feed of options.feeds) {
      args.push('--feed', feed)
    }
    steps.push({
      name: 'Connectivity probe',
      command: process.execPath,
      args,
      env: {},
    })
  }

  if (options.runAudit) {
    steps.push({
      name: 'Source audit',
      command: process.execPath,
      args: [path.join('scripts', 'events-cli.mjs'), '--audit'],
      env: {},
    })
  }

  if (options.runSync) {
    const env = {
      EVENTS_SYNC_WRITE: 'true',
    }
    if (options.feedForSync) {
      env.EVENTS_SYNC_FEED = options.feedForSync
    }
    steps.push({
      name: 'Event sync',
      command: process.execPath,
      args: [path.join('scripts', 'sync-events.mjs')],
      env,
    })
  }

  if (options.runNormalize) {
    steps.push({
      name: 'Normalization',
      command: process.execPath,
      args: [path.join('scripts', 'events-normalize.mjs')],
      env: {},
    })
  }

  if (!steps.length) {
    console.log('[events-recover] Nothing to do. Use --connectivity, --audit, or --sync to enable steps.')
    return
  }

  for (const step of steps) {
    console.log(`\n[events-recover] Running step: ${step.name}`)
    await runStep(step)
  }

  console.log('\n[events-recover] All requested steps completed.')
}

function parseArguments(args) {
  const options = {
    runConnectivity: true,
    runAudit: true,
    runSync: false,
    runNormalize: false,
    feeds: [],
    feedForSync: null,
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
    if (arg === '--connectivity-only') {
      options.runAudit = false
      options.runSync = false
      options.runNormalize = false
      continue
    }
    if (arg === '--skip-connectivity') {
      options.runConnectivity = false
      continue
    }
    if (arg === '--skip-audit') {
      options.runAudit = false
      continue
    }
    if (arg === '--sync' || arg === '--execute-sync') {
      options.runSync = true
      continue
    }
    if (arg === '--normalize') {
      options.runNormalize = true
      continue
    }
    if (arg.startsWith('--feed=')) {
      options.feeds.push(arg.split('=')[1])
      continue
    }
    if (arg === '--feed') {
      options.feeds.push(args[index + 1])
      index += 1
      continue
    }
  }

  if (options.runSync) {
    options.feedForSync = options.feeds[0] || null
    if (!options.runNormalize) {
      options.runNormalize = true
    }
  }

  return options
}

function printHelp() {
  console.log(`Usage: node scripts/events-recover.mjs [options]\n\n` +
    `Options:\n` +
    `  --connectivity-only   Only run the connectivity probe\n` +
    `  --skip-connectivity   Skip the connectivity probe\n` +
    `  --skip-audit          Skip the source audit\n` +
    `  --sync                Run the event sync with write mode enabled\n` +
    `  --normalize           Force normalization even without --sync\n` +
    `  --feed <id>           Restrict connectivity (and sync) to a specific feed\n` +
    `  -h, --help            Show this help message\n`)
}

async function runStep(step) {
  const mergedEnv = { ...process.env, ...step.env }
  await new Promise((resolve, reject) => {
    const child = spawn(step.command, step.args, {
      cwd: rootDir,
      stdio: 'inherit',
      env: mergedEnv,
    })
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${step.name || 'Step'} failed with exit code ${code}`))
      }
    })
    child.on('error', (error) => reject(error))
  })
}

function timestamp() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`
}

main().catch((error) => {
  console.error('[events-recover] Unhandled error:', error.message || error)
  process.exit(1)
})
