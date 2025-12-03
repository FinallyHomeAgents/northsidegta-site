import siteSeo from '../components/seo/__generatedSiteSeo.json'

function normalizePath(path) {
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

export function getSeoImageForPath(path) {
  const normalizedPath = normalizePath(path)
  if (!normalizedPath) return undefined

  const entry = siteSeo[normalizedPath]
  if (!entry || typeof entry !== 'object') return undefined

  return entry.seo_image || entry.seoImage || undefined
}
