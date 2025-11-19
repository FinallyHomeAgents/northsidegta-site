import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const towns = require('../../src/towns.json')
import {
  loadTownSpotlightData,
  saveTownSpotlightData,
} from '../../lib/spotlight/cache.js'
import { loadTownSpotlightConfig } from '../../lib/spotlight/loadTownSpotlightConfig.js'
import { fetchSpotlightPlacesData } from '../../lib/spotlight/fetchSpotlightPlacesData.js'
import { buildPhotoUrl, extractPhotoNameFromUrl } from '../../lib/spotlight/photos.js'

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function normalizeTownList(raw) {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    return Object.values(raw)
  }
  return []
}

function resolveTownName(slug) {
  const list = normalizeTownList(towns)
  const match = list.find((entry) => normalizeSlug(entry?.slug) === slug)
  return match?.name || slug || 'Town'
}

function normalizeSpotlightItem(item) {
  const photoName =
    typeof item?.photoName === 'string' && item.photoName
      ? item.photoName
      : extractPhotoNameFromUrl(item?.photoUrl)

  const photoUrl = photoName ? buildPhotoUrl(photoName) : undefined

  return {
    ...item,
    photoName: photoName || null,
    photoUrl,
  }
}

export async function loadTownSpotlights(slug, overrides = {}) {
  const loadData = overrides.loadTownSpotlightData || loadTownSpotlightData
  const loadConfig = overrides.loadTownSpotlightConfig || loadTownSpotlightConfig
  const fetchData = overrides.fetchSpotlightPlacesData || fetchSpotlightPlacesData
  const saveData = overrides.saveTownSpotlightData || saveTownSpotlightData

  const cached = (await loadData(slug)) || []

  if (Array.isArray(cached) && cached.length) {
    return cached
  }

  const configs = (await loadConfig(slug)) || []
  if (!configs.length) return []

  const townName = resolveTownName(slug)
  const fetched = (await fetchData(slug, townName, configs)) || []
  if (Array.isArray(fetched) && fetched.length) {
    await saveData(slug, fetched)
  }
  return fetched
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  const slugParam = Array.isArray(req.query?.slug) ? req.query.slug[0] : req.query?.slug
  const slug = normalizeSlug(slugParam)

  if (!slug) {
    res.status(400).json({ ok: false, error: 'Missing slug', items: [] })
    return
  }

  try {
    const source = await loadTownSpotlights(slug)
    const items = Array.isArray(source) ? source.map(normalizeSpotlightItem) : []
    res.status(200).json({ ok: true, items })
  } catch (error) {
    console.warn('[spotlight] failed to load cached data', slug, error)
    res.status(200).json({ ok: true, items: [] })
  }
}
