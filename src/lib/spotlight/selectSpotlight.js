const { SPOTLIGHT_TAG_LABELS } = require('./config.js')

function seededRandom(seed) {
  const text = String(seed || '')
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return (hash >>> 0) / 2 ** 32
}

function resolveLabel(place, townName) {
  if (!place) return null
  if (place.labelOverride) {
    return String(place.labelOverride)
  }
  const primaryTag = Array.isArray(place.tags) ? place.tags[0] : null
  if (primaryTag && typeof SPOTLIGHT_TAG_LABELS[primaryTag] === 'function') {
    return SPOTLIGHT_TAG_LABELS[primaryTag](townName)
  }
  return `Live Local Spotlight in ${townName}`
}

function selectTownSpotlight(townSlug, townName, rawItems = []) {
  const slug = String(townSlug || '').toLowerCase()
  const items = Array.isArray(rawItems)
    ? rawItems.filter((item) => item && item.placeId)
    : []

  if (!items.length) {
    return { hero: null, thumbnails: [], heroLabel: null, thumbnailLabels: [] }
  }

  const today = new Date().toISOString().slice(0, 10)
  const baseSeed = `${slug || 'town'}-${today}`

  const shuffled = [...items].sort((a, b) => {
    const diff =
      seededRandom(`${baseSeed}-${a.placeId}`) - seededRandom(`${baseSeed}-${b.placeId}`)
    if (diff === 0) {
      return String(a.placeId).localeCompare(String(b.placeId))
    }
    return diff
  })

  const hero = shuffled[0] || null
  let thumbnails = shuffled.slice(1, 4)
  if (!thumbnails.length && hero) {
    thumbnails = [hero]
  }

  const heroLabel = hero ? resolveLabel(hero, townName) : null
  const thumbnailLabels = thumbnails.map((place) => ({
    placeId: place.placeId,
    label: resolveLabel(place, townName),
  }))

  return { hero, thumbnails, heroLabel, thumbnailLabels }
}

module.exports = { selectTownSpotlight }
