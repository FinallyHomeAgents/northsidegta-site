import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const TOWN_AREA_DIRECTORIES = [
  path.join(process.cwd(), 'content', 'tastehub', 'town-areas'),
  path.join(process.cwd(), 'public', 'content', 'tastehub', 'town-areas'),
]

function slugify(value, fallback = '') {
  const base = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || fallback
}

async function findTownAreaDirectory() {
  for (const candidate of TOWN_AREA_DIRECTORIES) {
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

async function parseTownAreaFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')

  if (filePath.endsWith('.json')) {
    return JSON.parse(raw)
  }

  const parsed = matter(raw)
  return parsed.data || {}
}

function normalizeTownArea(data) {
  const town = String(data.town || '').trim()
  const name = String(data.name || '').trim()
  const slug = String(data.slug || '').trim() || slugify(name)

  if (!town || !name || !slug) return null

  const active = data.active === undefined ? true : data.active !== false
  const description = data.description ? String(data.description).trim() : ''

  return {
    town,
    name,
    slug,
    description,
    active,
  }
}

export async function getTastehubTownAreas() {
  const directory = await findTownAreaDirectory()
  if (!directory) return []

  const files = await fs.readdir(directory)
  const entries = []

  for (const file of files) {
    if (!file.match(/\.(json|md|mdx)$/i)) continue

    const filePath = path.join(directory, file)

    try {
      const data = await parseTownAreaFile(filePath)
      const area = normalizeTownArea(data)
      if (area) {
        entries.push(area)
      }
    } catch (error) {
      console.warn('[tastehub:getTastehubTownAreas] Skipping', file, error)
    }
  }

  const activeAreas = entries.filter((area) => area.active !== false)

  activeAreas.sort((a, b) => {
    const townCompare = a.town.localeCompare(b.town)
    if (townCompare !== 0) return townCompare
    return a.name.localeCompare(b.name)
  })

  return activeAreas
}

export async function getAreasForTown(town) {
  const all = await getTastehubTownAreas()
  const targetTown = String(town || '').trim()
  return all.filter((area) => area.town === targetTown && area.active !== false)
}

export default getTastehubTownAreas
