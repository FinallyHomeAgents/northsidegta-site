export function normalizeInterests(interests) {
  if (!Array.isArray(interests)) return []
  return interests.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
}

export function buildInterestFlags(interests) {
  const normalized = interests.map((interest) => interest.toLowerCase())

  return {
    events: normalized.some((interest) => interest.includes('event')),
    tasteHub: normalized.some((interest) => interest.includes('tastehub')),
    marketInsights: normalized.some((interest) => interest.includes('market')),
  }
}
