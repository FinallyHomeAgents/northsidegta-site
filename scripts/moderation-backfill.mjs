#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const eventsDir = path.join(rootDir, 'public', 'data', 'events')

/**
 * Rule:
 * - If moderation === 'approved' -> keep published true.
 * - Else set moderation = 'pending' and published = false.
 */
async function main() {
  let changed = 0
  let scanned = 0
  try {
    const entries = await fs.readdir(eventsDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json') || entry.name === '_sync-summary.json') continue
      scanned += 1
      const filePath = path.join(eventsDir, entry.name)
      const raw = await fs.readFile(filePath, 'utf8').catch(() => '')
      if (!raw) continue
      let data
      try {
        data = JSON.parse(raw)
      } catch {
        continue
      }

      const moderation = (data.moderation || '').toLowerCase()
      const approved = moderation === 'approved'
      const desired = {
        published: approved ? true : false,
        moderation: approved ? 'approved' : 'pending',
      }

      const needsChange =
        data.published !== desired.published || (data.moderation || '') !== desired.moderation

      if (needsChange) {
        const next = { ...data, ...desired }
        await fs.writeFile(filePath, JSON.stringify(next, null, 2) + '\n', 'utf8')
        changed += 1
      }
    }
  } catch (e) {
    console.error('[moderation-backfill] failed:', e.message)
    process.exitCode = 1
    return
  }
  console.log(`[moderation-backfill] scanned=${scanned} changed=${changed}`)
}

main()
