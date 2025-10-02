#!/usr/bin/env node
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { runAudit } = require('../lib/events/audit.js')

async function main() {
  const options = parseArguments(process.argv.slice(2))

  if (options.help || (!options.audit && !options.mode)) {
    printHelp()
    process.exit(options.help ? 0 : 1)
  }

  if (options.audit || options.mode === 'audit') {
    await runAudit({ domain: options.domain })
    return
  }

  console.error('[events-cli] Unknown mode — use --audit')
  process.exit(1)
}

function parseArguments(args) {
  const options = { audit: false, domain: null, help: false }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      break
    }
    if (arg === '--audit' || arg === 'audit') {
      options.audit = true
      continue
    }
    if (arg.startsWith('--domain=')) {
      options.domain = arg.split('=')[1]
      continue
    }
    if (arg === '--domain') {
      options.domain = args[index + 1]
      index += 1
      continue
    }
    if (arg.startsWith('--mode=')) {
      options.mode = arg.split('=')[1]
      continue
    }
  }
  return options
}

function printHelp() {
  console.log(`Usage: node scripts/events-cli.mjs [options]\n\n` +
    `Options:\n` +
    `  --audit             Run audit mode for all configured sources\n` +
    `  --domain=<domain>   Restrict the audit to a specific source domain\n` +
    `  -h, --help          Show this help message\n`)
}

main().catch((error) => {
  console.error('[events-cli] Unhandled error:', error)
  process.exit(1)
})
