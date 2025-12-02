function buildPhotoUrl(photoName) {
  if (!photoName) return undefined
  const encoded = encodeURIComponent(photoName)
  return `/api/spotlight/photo?photo=${encoded}`
}

function extractPhotoNameFromUrl(url) {
  if (typeof url !== 'string' || !url) return null
  const match = url.match(/places\.googleapis\.com\/v1\/([^/]+)\/media/i)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

module.exports = { buildPhotoUrl, extractPhotoNameFromUrl }
