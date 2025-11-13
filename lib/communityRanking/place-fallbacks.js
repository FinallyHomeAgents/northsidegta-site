import { UXBRIDGE_PIZZA_OPTIONS } from '../../src/data/uxbridgePizzaOptions'

function normalizeSlug(value) {
  return String(value || '').toLowerCase()
}

export function applyCommunityPlaceFallbacks(places, { normalizedTown, normalizedCategory }) {
  const list = Array.isArray(places) ? [...places] : []

  if (normalizedTown === 'uxbridge' && normalizedCategory === 'pizza') {
    const knownSlugs = new Set(list.map((place) => normalizeSlug(place.slug)))

    for (const option of UXBRIDGE_PIZZA_OPTIONS) {
      const slug = option?.id
      if (!slug) continue

      const normalizedSlug = normalizeSlug(slug)
      if (knownSlugs.has(normalizedSlug)) continue

      list.push({
        slug,
        title: option.label,
      })
      knownSlugs.add(normalizedSlug)
    }
  }

  return list
}

