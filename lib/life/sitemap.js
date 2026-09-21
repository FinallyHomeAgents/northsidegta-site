const ORIGIN = 'https://northsidegta.ca'
const validId = (id) => /^[a-f0-9-]{36}$/.test(id || '')

// Only website-published stories belong in the public discovery feed.
export function lifeSitemap(drafts = []) {
  const paths = ['/life/']
  for (const draft of drafts) {
    if (draft.results?.website?.status === 'published' && validId(draft.id)) {
      paths.push(`/life/posts/${draft.id}`)
    }
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...new Set(paths)].map(path => `  <url><loc>${ORIGIN}${path}</loc></url>`).join('\n') +
    '\n</urlset>\n'
}
