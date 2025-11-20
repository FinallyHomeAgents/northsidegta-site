import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const towns = require('../../src/towns.json')
import { loadTownSpotlightConfig } from '../../lib/spotlight/loadTownSpotlightConfig'
import { fetchSpotlightPlacesData } from '../../lib/spotlight/fetchSpotlightPlacesData'
import { saveTownSpotlightData } from '../../lib/spotlight/cache'

function normalizeTowns(raw) {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.towns)) return raw.towns
  if (raw && typeof raw === 'object') {
    return Object.values(raw)
  }
  return []
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function getCronSecret(req) {
  const headerSecret =
    req.headers['x-cron-secret'] ||
    req.headers['x-vercel-cron-secret'] ||
    req.headers['x-northside-cron']
  if (headerSecret) {
    return Array.isArray(headerSecret) ? headerSecret[0] : headerSecret
  }
  const querySecret = Array.isArray(req.query?.secret)
    ? req.query.secret[0]
    : req.query?.secret
  return querySecret
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  const cronSecret = (process.env.SPOTLIGHT_CRON_SECRET || '').trim()
  if (cronSecret) {
    const incomingSecret = String(getCronSecret(req) || '').trim()
    if (incomingSecret !== cronSecret) {
      res.status(401).json({ ok: false, error: 'unauthorized' })
      return
    }
  }

  const summary = []
  const townsList = normalizeTowns(towns)
  const assignedPlaceIds = new Map()

  for (const entry of townsList) {
    const slug = normalizeSlug(entry?.slug)
    const name = entry?.name || slug || 'Town'
    if (!slug) continue

    const configs = await loadTownSpotlightConfig(slug)
    if (!configs.length) {
      summary.push({ slug, skipped: 'no-config' })
      continue
    }

    for (const configEntry of configs) {
      const placeId = String(configEntry?.placeId || '').trim()
      if (placeId && !assignedPlaceIds.has(placeId)) {
        assignedPlaceIds.set(placeId, slug)
      }
    }

    const data = await fetchSpotlightPlacesData(slug, name, configs, assignedPlaceIds)
    if (!data.length) {
      summary.push({ slug, skipped: 'no-results' })
      continue
    }

    await saveTownSpotlightData(slug, data)
    summary.push({ slug, count: data.length })
  }

  res.status(200).json({ ok: true, summary })
}
