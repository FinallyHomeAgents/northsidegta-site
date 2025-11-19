const GOOGLE_PLACES_API_ENDPOINT = 'https://places.googleapis.com/v1/places'
const MIN_RATING = 4.4
const MIN_REVIEWS = 40

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

function buildPhotoUrl(photoName, apiKey) {
  if (!photoName) return undefined
  const encoded = encodeURIComponent(photoName)
  return `https://places.googleapis.com/v1/${encoded}/media?maxWidthPx=800&key=${apiKey}`
}

export async function fetchSpotlightPlacesData(townSlug, townName, configs = []) {
  const apiKey = (process.env.GOOGLE_PLACES_API_KEY || '').trim()
  if (!apiKey || !Array.isArray(configs) || configs.length === 0) {
    return []
  }

  const results = []

  for (const config of configs) {
    const placeId = String(config.placeId || '').trim()
    if (!placeId) continue

    try {
      const response = await fetch(`${buildDetailsUrl(placeId)}?fields=displayName,rating,userRatingCount,editorialSummary,photos`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'displayName,rating,userRatingCount,editorialSummary,photos',
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

      if (
        rating === null ||
        userRatingsTotal === null ||
        rating < MIN_RATING ||
        userRatingsTotal < MIN_REVIEWS
      ) {
        continue
      }

      const photoReference = Array.isArray(payload?.photos) ? payload.photos[0]?.name : null

      results.push({
        placeId,
        name: payload?.displayName?.text || '',
        rating,
        userRatingsTotal,
        snippet: extractSnippet(payload),
        tags: Array.isArray(config.tags) ? config.tags : [],
        labelOverride: config.labelOverride ?? null,
        photoUrl: buildPhotoUrl(photoReference, apiKey),
        townSlug,
        townName,
        lastRefreshed: new Date().toISOString(),
      })
    } catch (error) {
      console.warn('[spotlight] error fetching place', placeId, error)
    }
  }

  return results
}
