import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const CATEGORY_DIRECTORIES = [
  path.join(process.cwd(), 'content', 'tastehub', 'categories'),
  path.join(process.cwd(), 'public', 'content', 'tastehub', 'categories'),
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

async function findCategoryDirectory() {
  for (const candidate of CATEGORY_DIRECTORIES) {
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

async function parseCategoryFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')

  if (filePath.endsWith('.json')) {
    return JSON.parse(raw)
  }

  const parsed = matter(raw)
  return parsed.data || {}
}

function normalizeCategory(data) {
  const name = String(data.name || '').trim()
  const slug = String(data.slug || '').trim() || slugify(name)

  if (!name || !slug) return null

  const active = data.active === undefined ? true : data.active !== false
  const description = data.description ? String(data.description).trim() : ''

  return {
    name,
    slug,
    description,
    active,
  }
}

export async function getTastehubCategories() {
  const directory = await findCategoryDirectory()
  if (!directory) return []

  const files = await fs.readdir(directory)
  const categories = []

  for (const file of files) {
    if (!file.match(/\.(json|md|mdx)$/i)) continue

    const filePath = path.join(directory, file)

    try {
      const data = await parseCategoryFile(filePath)
      const category = normalizeCategory(data)
      if (category) {
        categories.push(category)
      }
    } catch (error) {
      console.warn('[tastehub:getTastehubCategories] Skipping', file, error)
    }
  }

  const activeCategories = categories.filter((category) => category.active !== false)

  activeCategories.sort((a, b) => a.name.localeCompare(b.name))

  return activeCategories
}

export default getTastehubCategories
