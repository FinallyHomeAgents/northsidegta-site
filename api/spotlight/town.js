import { loadTownSpotlightData } from '../../lib/spotlight/cache'

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
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
    const cached = (await loadTownSpotlightData(slug)) || []
    const items = Array.isArray(cached) ? cached : []
    res.status(200).json({ ok: true, items })
  } catch (error) {
    console.warn('[spotlight] failed to load cached data', slug, error)
    res.status(200).json({ ok: true, items: [] })
  }
}
