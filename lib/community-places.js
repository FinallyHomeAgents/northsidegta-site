import fs from 'fs'
import path from 'path'

const PLACES_DIR = path.join(process.cwd(), 'public', 'data', 'community-places')

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.warn('[community-places] Failed to read file', filePath, error)
    return null
  }
}

export function loadCommunityPlaces({ town, category, status = 'published' } = {}) {
  if (!fs.existsSync(PLACES_DIR)) {
    return []
  }

  const entries = fs
    .readdirSync(PLACES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJsonFile(path.join(PLACES_DIR, file)))
    .filter(Boolean)

  return entries.filter((entry) => {
    if (!entry) return false
    if (status && String(entry.status || '').toLowerCase() !== String(status).toLowerCase()) {
      return false
    }
    if (town && String(entry.town || '').toLowerCase() !== String(town).toLowerCase()) {
      return false
    }
    if (category && String(entry.category || '').toLowerCase() !== String(category).toLowerCase()) {
      return false
    }
    return true
  })
}

export function findPlaceBySlug(slug, options = {}) {
  const items = loadCommunityPlaces(options)
  return items.find((item) => String(item.slug || '').toLowerCase() === String(slug || '').toLowerCase())
}
