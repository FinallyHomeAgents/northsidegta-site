import fs from 'node:fs/promises'
import path from 'node:path'

import { normalizeSpotlightTagList } from '../../src/lib/spotlight/config.js'

const SPOTLIGHT_DIR = path.join(process.cwd(), 'public', 'data', 'town-spotlights')

async function readTownFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      console.warn('[spotlight] unable to read spotlight file', filePath, error)
    }
    return null
  }
}

export async function loadTownSpotlightConfig(townSlug) {
  const slug = String(townSlug || '')
    .trim()
    .toLowerCase()
  if (!slug) return []

  const filePath = path.join(SPOTLIGHT_DIR, `${slug}.json`)
  const data = await readTownFile(filePath)
  const list =
    (Array.isArray(data?.spotlight_places) && data.spotlight_places) ||
    (Array.isArray(data?.spotlightPlaces) && data.spotlightPlaces) ||
    []

  return list
    .filter((entry) => entry && (entry.place_id || entry.placeId))
    .map((entry) => ({
      placeId: String(entry.place_id || entry.placeId || '').trim(),
      tags: normalizeSpotlightTagList(entry.tags),
      labelOverride: entry.label_override ?? entry.labelOverride ?? null,
      enabled: entry.enabled !== false,
    }))
    .filter((entry) => entry.placeId && entry.enabled !== false)
}
