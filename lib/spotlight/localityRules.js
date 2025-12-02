const localityConfig = require('../../seedConfig/towns.json')

const LOCALITY_TYPES = new Set([
  'locality',
  'postal_town',
  'sublocality',
  'administrative_area_level_3',
])

function normalizeTownSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function normalizeLocalityName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function getAllowedLocalitiesForTown(townSlug) {
  const slug = normalizeTownSlug(townSlug)
  if (!slug || !Array.isArray(localityConfig)) return []

  const match = localityConfig.find((entry) => normalizeTownSlug(entry?.slug) === slug)
  const names = Array.isArray(match?.localities) ? match.localities : []

  const normalized = names
    .map(normalizeLocalityName)
    .filter((name) => name.length)

  return Array.from(new Set(normalized))
}

function extractLocalityNames(addressComponents) {
  const names = new Set()

  if (!Array.isArray(addressComponents)) return []

  for (const component of addressComponents) {
    const types = Array.isArray(component?.types) ? component.types : []
    if (!types.some((type) => LOCALITY_TYPES.has(type))) continue

    for (const key of ['longText', 'shortText', 'name', 'text']) {
      const value = component?.[key]
      const normalized = normalizeLocalityName(value)
      if (normalized) {
        names.add(normalized)
      }
    }
  }

  return Array.from(names)
}

function isLocalityAllowedForTown(addressComponents, townSlug) {
  const allowed = getAllowedLocalitiesForTown(townSlug)
  if (!allowed.length) return true

  const placeLocalities = extractLocalityNames(addressComponents)
  return placeLocalities.some((name) => allowed.includes(name))
}

module.exports = {
  getAllowedLocalitiesForTown,
  extractLocalityNames,
  isLocalityAllowedForTown,
}
