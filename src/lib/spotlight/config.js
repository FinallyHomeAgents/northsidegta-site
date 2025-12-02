const SPOTLIGHT_TAGS = [
  'perfect_park_day',
  'family_day_idea',
  'active_day_idea',
  'hidden_gem',
  'photo_worthy',
  'where_locals_go',
]

const SPOTLIGHT_TAG_LABELS = {
  perfect_park_day: (townName) => `Perfect Park Day in ${townName}`,
  family_day_idea: (townName) => `Family Day Idea in ${townName}`,
  active_day_idea: (townName) => `Active Day Idea in ${townName}`,
  hidden_gem: (townName) => `Hidden Gem of ${townName}`,
  photo_worthy: (townName) => `Photo-Worthy Spot in ${townName}`,
  where_locals_go: (townName) => `Where Locals Actually Go in ${townName}`,
}

function normalizeSpotlightTagList(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((tag) => String(tag || '').trim())
    .filter((tag) => SPOTLIGHT_TAGS.includes(tag))
}

module.exports = { SPOTLIGHT_TAGS, SPOTLIGHT_TAG_LABELS, normalizeSpotlightTagList }
