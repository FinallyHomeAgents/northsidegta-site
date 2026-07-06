#!/usr/bin/env ts-node
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'

import { TOWN_SPOTLIGHT_SEED_CONFIG, SpotlightSeedTag } from '../lib/spotlight/seedConfig'
import { searchBestPlaceForQuery } from '../lib/spotlight/googleSearch'
import { isLocalityAllowedForTown } from '../lib/spotlight/localityRules.js'

interface SpotlightFileEntry {
  place_id: string
  tags: SpotlightSeedTag[]
  label_override?: string | null
  enabled?: boolean
}

interface SpotlightFileData {
  slug: string
  name: string
  spotlight_places: SpotlightFileEntry[]
  [key: string]: unknown
}

const rootDir = path.resolve(__dirname, '..')
const spotlightDir = path.join(rootDir, 'public', 'data', 'town-spotlights')
const VALID_TAG_SET = new Set<SpotlightSeedTag>([
  'perfect_park_day',
  'family_day_idea',
  'active_day_idea',
  'hidden_gem',
  'photo_worthy',
  'where_locals_go',
])

async function readTownFile(filePath: string): Promise<SpotlightFileData | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as SpotlightFileData
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      console.warn('[spotlight-seed] failed to read', filePath, error)
    }
    return null
  }
}

function normalizeTagList(value: unknown): SpotlightSeedTag[] {
  if (!Array.isArray(value)) return []
  const tags: SpotlightSeedTag[] = []
  for (const tag of value) {
    if (typeof tag !== 'string') continue
    const trimmed = tag.trim() as SpotlightSeedTag
    if (!trimmed || !VALID_TAG_SET.has(trimmed)) continue
    tags.push(trimmed)
  }
  return tags
}

function upsertSpotlightEntry(
  entries: SpotlightFileEntry[],
  placeId: string,
  tag: SpotlightSeedTag,
): { added: boolean; updated: boolean } {
  const existing = entries.find((entry) => entry.place_id === placeId)
  if (existing) {
    const tags = new Set(normalizeTagList(existing.tags))
    if (tags.has(tag)) {
      existing.tags = Array.from(tags)
      return { added: false, updated: false }
    }
    tags.add(tag)
    existing.tags = Array.from(tags)
    if (typeof existing.enabled === 'undefined') {
      existing.enabled = true
    }
    if (typeof existing.label_override === 'undefined') {
      existing.label_override = null
    }
    return { added: false, updated: true }
  }

  entries.push({
    place_id: placeId,
    tags: [tag],
    label_override: null,
    enabled: true,
  })
  return { added: true, updated: false }
}

async function ensureDirectory(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

async function writeTownFile(filePath: string, data: SpotlightFileData) {
  await ensureDirectory(path.dirname(filePath))
  const json = `${JSON.stringify(data, null, 2)}\n`
  await fs.writeFile(filePath, json, 'utf8')
}

async function processTown() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY is required to seed spotlight data.')
    process.exitCode = 1
    return
  }

  const assignedPlaceIds = new Map<string, string>()

  for (const town of TOWN_SPOTLIGHT_SEED_CONFIG) {
    const filePath = path.join(spotlightDir, `${town.townSlug}.json`)
    const existingData = (await readTownFile(filePath)) ?? {
      slug: town.townSlug,
      name: town.townName,
      spotlight_places: [],
    }

    const entries = Array.isArray(existingData.spotlight_places)
      ? [...existingData.spotlight_places]
      : []

    for (const entry of entries) {
      const placeId = String(entry?.place_id || '').trim()
      if (placeId && !assignedPlaceIds.has(placeId)) {
        assignedPlaceIds.set(placeId, town.townSlug)
      }
    }

    let addedCount = 0
    let updatedCount = 0

    for (const queryDef of town.queries) {
      const result = await searchBestPlaceForQuery(queryDef.query)
      if (!result) {
        continue
      }

      if (!isLocalityAllowedForTown(result.addressComponents, town.townSlug)) {
        continue
      }

      const assignedTown = assignedPlaceIds.get(result.placeId)
      if (assignedTown && assignedTown !== town.townSlug) {
        continue
      }
      const { added, updated } = upsertSpotlightEntry(entries, result.placeId, queryDef.tag)
      if (added) addedCount += 1
      if (updated) updatedCount += 1

      assignedPlaceIds.set(result.placeId, town.townSlug)
    }

    if (addedCount === 0 && updatedCount === 0) {
      console.log(`[spotlight-seed] ${town.townSlug}: no changes`)
      continue
    }

    const nextData: SpotlightFileData = {
      ...existingData,
      slug: existingData.slug || town.townSlug,
      name: existingData.name || town.townName,
      spotlight_places: entries,
    }

    await writeTownFile(filePath, nextData)
    console.log(
      `[spotlight-seed] ${town.townSlug}: added ${addedCount}, updated ${updatedCount}, total ${entries.length}`,
    )
  }
}

processTown().catch((error) => {
  console.error('[spotlight-seed] unexpected failure', error)
  process.exitCode = 1
})
