const GOOGLE_PLACES_SEARCH_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText'
const MIN_RATING = 4.4
const MIN_REVIEWS = 40
const REQUEST_TIMEOUT_MS = 8000

interface PlacesSearchResponse {
  places?: Array<{
    id?: string
    displayName?: { text?: string | null } | null
    rating?: number | null
    userRatingCount?: number | null
  }>
}

export interface SpotlightSearchResult {
  placeId: string
  name: string
  rating: number
  userRatingsTotal: number
}

function pickBestCandidate(places: Required<SpotlightSearchResult>[]): SpotlightSearchResult | null {
  if (!places.length) return null
  const sorted = [...places].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating
    }
    return b.userRatingsTotal - a.userRatingsTotal
  })
  return sorted[0] ?? null
}

export async function searchBestPlaceForQuery(
  query: string,
): Promise<SpotlightSearchResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const textQuery = query?.trim()
  if (!apiKey || !textQuery) {
    return null
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(GOOGLE_PLACES_SEARCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount',
      },
      body: JSON.stringify({ textQuery }),
      signal: controller.signal,
    })

    if (!response.ok) {
      console.warn('[spotlight-seed] Google Places search failed', response.status, response.statusText)
      return null
    }

    const data = (await response.json()) as PlacesSearchResponse
    const candidates: SpotlightSearchResult[] = []

    for (const place of data.places || []) {
      const rating = typeof place.rating === 'number' ? place.rating : null
      const reviews = typeof place.userRatingCount === 'number' ? place.userRatingCount : null
      const id = place.id?.trim()
      const name = place.displayName?.text?.trim()
      if (!id || !name || rating === null || reviews === null) {
        continue
      }
      if (rating < MIN_RATING || reviews < MIN_REVIEWS) {
        continue
      }
      candidates.push({ placeId: id, name, rating, userRatingsTotal: reviews })
    }

    return pickBestCandidate(candidates)
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      console.warn('[spotlight-seed] Google Places search timed out for query:', textQuery)
    } else {
      console.warn('[spotlight-seed] Google Places search error for query:', textQuery, error)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}
