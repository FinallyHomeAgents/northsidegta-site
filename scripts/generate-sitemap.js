#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')
const buildDir = path.join(rootDir, 'build')
const eventsDir = path.join(publicDir, 'data', 'events')
const collectionsDir = path.join(publicDir, 'data', 'collections')
const townsPath = path.join(rootDir, 'src', 'towns.json')
const siteConfigPath = path.join(rootDir, 'config', 'site.json')

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    console.warn(`[generate-sitemap] Failed to parse ${path.relative(rootDir, filePath)}: ${error.message}`)
    return fallback
  }
}

function loadCollections(dirPath) {
  if (!fs.existsSync(dirPath)) return []
  const entries = []
  const files = fs.readdirSync(dirPath).filter((name) => name.endsWith('.json'))
  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    try {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      const slug = typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : file.replace(/\.json$/i, '')
      if (slug) {
        entries.push(slug)
      }
    } catch (error) {
      console.warn(`[generate-sitemap] Skipping collection ${file}: ${error.message}`)
    }
  }
  return entries
}

function loadEvents(dirPath) {
  if (!fs.existsSync(dirPath)) return []
  const files = fs.readdirSync(dirPath).filter((name) => name.endsWith('.json'))
  const events = []
  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    try {
      const event = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      if (!event.slug) {
        event.slug = file.replace(/\.json$/i, '')
      }
      events.push(event)
    } catch (error) {
      console.warn(`[generate-sitemap] Skipping event ${file}: ${error.message}`)
    }
  }
  return events
}

function buildAbsoluteUrl(origin, relativePath) {
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return `${origin.replace(/\/$/, '')}${normalizedPath}`
}

function sanitizeDate(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString()
}

function writeFileIfPossible(targetPath, contents) {
  try {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, contents, 'utf8')
    return true
  } catch (error) {
    console.warn(`[generate-sitemap] Failed to write ${path.relative(rootDir, targetPath)}: ${error.message}`)
    return false
  }
}

function main() {
  const siteConfig = loadJson(siteConfigPath, {}) || {}
  const origin =
    (typeof siteConfig.siteOrigin === 'string' && siteConfig.siteOrigin.trim()) ||
    (typeof process.env.SITE_ORIGIN === 'string' && process.env.SITE_ORIGIN.trim()) ||
    'https://northsidegta.ca'
  const includeArchive = siteConfig.includeEventsArchiveInSitemap !== false

  const staticRoutes = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/buyers', changefreq: 'weekly', priority: '0.9' },
    { path: '/sellers', changefreq: 'weekly', priority: '0.9' },
    { path: '/homeanalysis', changefreq: 'monthly', priority: '0.7' },
    { path: '/communities', changefreq: 'monthly', priority: '0.8' },
    { path: '/about', changefreq: 'yearly', priority: '0.5' },
    { path: '/contact', changefreq: 'yearly', priority: '0.5' },
    { path: '/community', changefreq: 'daily', priority: '0.8' },
    { path: '/collections', changefreq: 'monthly', priority: '0.6' },
  ]

  if (includeArchive) {
    staticRoutes.push({ path: '/events/archive', changefreq: 'weekly', priority: '0.5' })
  }

  const towns = loadJson(townsPath, []) || []
  towns
    .map((town) => (typeof town === 'object' ? town.slug : null))
    .filter((slug) => typeof slug === 'string' && slug.trim())
    .forEach((slug) => {
      staticRoutes.push({ path: `/communities/${slug.trim()}`, changefreq: 'monthly', priority: '0.8' })
    })

  const collections = loadCollections(collectionsDir)
  collections.forEach((slug) => {
    staticRoutes.push({ path: `/collections/${slug}`, changefreq: 'monthly', priority: '0.6' })
  })

  const events = loadEvents(eventsDir)
  const eventEntries = events
    .filter((event) => {
      if (!event || typeof event.slug !== 'string' || !event.slug.trim()) return false
      const status = typeof event.status === 'string' ? event.status.trim().toLowerCase() : ''
      const hidden = Boolean(event.hidden)
      const archived = Boolean(event.archived) || status === 'archived'
      const publishable = status === 'published' || archived
      return publishable && !hidden
    })
    .map((event) => ({
      path: `/events/${event.slug.trim()}`,
      changefreq: 'monthly',
      priority: '0.4',
      lastmod: sanitizeDate(event.updatedAt || event.endDate || event.startDate),
    }))

  const entries = [...staticRoutes, ...eventEntries]

  const seen = new Set()
  const urlElements = entries
    .filter((entry) => {
      if (!entry || typeof entry.path !== 'string') return false
      const key = entry.path
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((entry) => {
      const parts = [
        '  <url>',
        `    <loc>${buildAbsoluteUrl(origin, entry.path)}</loc>`,
      ]
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`)
      if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`)
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`)
      parts.push('  </url>')
      return parts.join('\n')
    })

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '',
    ...urlElements,
    '',
    '</urlset>',
    '',
  ].join('\n')

  const publicTarget = path.join(publicDir, 'sitemap.xml')
  const buildTarget = path.join(buildDir, 'sitemap.xml')

  const wrotePublic = writeFileIfPossible(publicTarget, sitemap)
  let wroteBuild = false
  if (fs.existsSync(buildDir)) {
    wroteBuild = writeFileIfPossible(buildTarget, sitemap)
  }

  if (wrotePublic || wroteBuild) {
    console.log(
      `[generate-sitemap] Updated sitemap with ${urlElements.length} entries → ${path.relative(rootDir, publicTarget)}`
    )
  } else {
    process.exitCode = 1
  }
}

main()
