import fs from 'fs/promises'
import path from 'path'

const CANDIDATE_DIRECTORIES = [
  path.join(process.cwd(), 'content', 'tastehub-polls'),
  path.join(process.cwd(), 'public', 'content', 'tastehub-polls'),
]

function slugify(value, fallback = '') {
  const base = String(value || '').trim()
  if (!base) return fallback
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase()
  return value === 'live' || value === 'closed' ? value : 'draft'
}

function ensureUniqueIds(items) {
  const seen = new Map()
  return items.map((item) => {
    const desired = item.id || slugify(item.name, slugify(item.title))
    const base = desired || slugify(item.name || item.title || '')
    const safeBase = base || 'option'
    const existing = seen.get(safeBase) || 0
    const finalId = existing === 0 ? safeBase : `${safeBase}-${existing + 1}`
    seen.set(safeBase, existing + 1)
    return { ...item, id: finalId }
  })
}

async function findContentDirectory() {
  for (const candidate of CANDIDATE_DIRECTORIES) {
    try {
      const stat = await fs.stat(candidate)
      if (stat.isDirectory()) {
        return candidate
      }
    } catch (error) {
      // ignore missing directories
    }
  }
  return null
}

function parseBallotItems(rawItems = []) {
  if (!Array.isArray(rawItems)) return []
  const normalized = rawItems
    .map((item) => {
      if (!item) return null
      const source = typeof item === 'string' ? { name: item } : item
      const name = String(source.name || '').trim()
      if (!name) return null
      return {
        id: source.id ? slugify(source.id) : undefined,
        name,
        address: source.address ? String(source.address).trim() : '',
        link: source.link ? String(source.link).trim() : '',
      }
    })
    .filter(Boolean)

  return ensureUniqueIds(normalized)
}

function normalizePoll(data, { stats }) {
  const title = String(data.title || '').trim() || 'Untitled Poll'
  const slug = slugify(data.slug, slugify(title))
  const rankingKey = String(data.ranking_key || data.rankingKey || slug).trim()
  const description = String(data.description || '').trim()
  const status = normalizeStatus(data.status)
  const ballotItems = parseBallotItems(data.ballot_items)
  const createdAt = stats?.birthtime ? new Date(stats.birthtime).toISOString() : null
  const updatedAt = stats?.mtime ? new Date(stats.mtime).toISOString() : null
  const image = data.image ? String(data.image).trim() : ''
  const category = String(data.category || data.category_slug || data.categorySlug || '').trim()
  const customCategory = String(data.custom_category || data.customCategory || '').trim()
  const townArea = String(data.town_area || data.townArea || '').trim()
  const displayCategory = customCategory || category

  return {
    id: slug || rankingKey || title.toLowerCase(),
    title,
    slug,
    town: String(data.town || '').trim(),
    category,
    customCategory,
    displayCategory,
    townArea,
    status,
    description,
    rankingKey,
    featured: Boolean(data.featured),
    ballotItems,
    image,
    createdAt,
    updatedAt,
  }
}

export async function getTasteHubPolls() {
  const directory = await findContentDirectory()
  if (!directory) return []

  const files = await fs.readdir(directory)
  const entries = []

  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const filePath = path.join(directory, file)
    try {
      const raw = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(raw)
      const stats = await fs.stat(filePath)
      entries.push(normalizePoll(data, { stats }))
    } catch (error) {
      console.warn('[tastehub:getTasteHubPolls] Skipping', file, error)
    }
  }

  entries.sort((a, b) => {
    const aDate = a.updatedAt || a.createdAt || ''
    const bDate = b.updatedAt || b.createdAt || ''
    if (aDate && bDate && aDate !== bDate) {
      return aDate < bDate ? 1 : -1
    }
    return a.title.localeCompare(b.title)
  })

  return entries
}

export default getTasteHubPolls
