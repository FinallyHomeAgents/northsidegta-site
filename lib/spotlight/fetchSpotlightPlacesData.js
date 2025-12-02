const { buildPhotoUrl } = require('./photos.js')
const { isLocalityAllowedForTown } = require('./localityRules.js')

const GOOGLE_PLACES_API_ENDPOINT = 'https://places.googleapis.com/v1/places'
const PRIMARY_MIN_RATING = 4.0
const FALLBACK_MIN_RATING = 3.8
const MIN_REVIEWS = 20
const MIN_RESULTS_PER_TOWN = 5

function buildDetailsUrl(placeId) {
  const encodedId = encodeURIComponent(placeId)
  return `${GOOGLE_PLACES_API_ENDPOINT}/${encodedId}`
}

function extractSnippet(json) {
  if (json?.editorialSummary?.overview) {
    return json.editorialSummary.overview
  }
  const snippet = Array.isArray(json?.editorialSummary?.snippets)
    ? json.editorialSummary.snippets.find(Boolean)
    : null
  return snippet || undefined
}

function sortByRatingAndReviews(a, b) {
  if (b.rating !== a.rating) {
    return b.rating - a.rating
  }
  return b.userRatingsTotal - a.userRatingsTotal
}

async function fetchSpotlightPlacesData(
  townSlug,
  townName,
  configs = [],
  assignedPlaceIds = new Map(),
) {
  const apiKey = (process.env.GOOGLE_PLACES_API_KEY || '').trim()
  if (!apiKey || !Array.isArray(configs) || configs.length === 0) {
    return []
  }

  const results = []
  const fallbackCandidates = []

  for (const config of configs) {
    const placeId = String(config.placeId || '').trim()
    if (!placeId) continue

    try {
      const response = await fetch(`${buildDetailsUrl(placeId)}?fields=displayName,rating,userRatingCount,editorialSummary,photos,addressComponents`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'displayName,rating,userRatingCount,editorialSummary,photos,addressComponents',
        },
      })

      if (!response.ok) {
        console.warn('[spotlight] failed to fetch place details', placeId, response.status)
        continue
      }

      const payload = await response.json()
      const rating = typeof payload?.rating === 'number' ? payload.rating : null
      const userRatingsTotal =
        typeof payload?.userRatingCount === 'number' ? payload.userRatingCount : null

      if (assignedPlaceIds.has(placeId) && assignedPlaceIds.get(placeId) !== townSlug) {
        continue
      }

      if (rating === null || userRatingsTotal === null || userRatingsTotal < MIN_REVIEWS) {
        continue
      }

      const meetsPrimaryThreshold = rating >= PRIMARY_MIN_RATING
      const meetsFallbackThreshold = rating >= FALLBACK_MIN_RATING

      if (!meetsPrimaryThreshold && !meetsFallbackThreshold) {
        continue
      }

      if (!isLocalityAllowedForTown(payload?.addressComponents, townSlug)) {
        continue
      }

      const photoReference = Array.isArray(payload?.photos) ? payload.photos[0]?.name : null

      const spotlightItem = {
        placeId,
        name: payload?.displayName?.text || '',
        rating,
        userRatingsTotal,
        snippet: extractSnippet(payload),
        tags: Array.isArray(config.tags) ? config.tags : [],
        labelOverride: config.labelOverride ?? null,
        photoName: photoReference || null,
        photoUrl: buildPhotoUrl(photoReference),
        townSlug,
        townName,
        lastRefreshed: new Date().toISOString(),
      }

      if (meetsPrimaryThreshold) {
        results.push(spotlightItem)
        assignedPlaceIds.set(placeId, townSlug)
      } else if (meetsFallbackThreshold) {
        fallbackCandidates.push(spotlightItem)
      }
    } catch (error) {
      console.warn('[spotlight] error fetching place', placeId, error)
    }
  }

  if (results.length < MIN_RESULTS_PER_TOWN && fallbackCandidates.length) {
    const orderedFallback = [...fallbackCandidates].sort(sortByRatingAndReviews)
    for (const item of orderedFallback) {
      if (results.length >= MIN_RESULTS_PER_TOWN) {
        break
      }
      results.push(item)
      assignedPlaceIds.set(item.placeId, townSlug)
    }
  }

  return results.sort(sortByRatingAndReviews)
}

module.exports = { fetchSpotlightPlacesData }
