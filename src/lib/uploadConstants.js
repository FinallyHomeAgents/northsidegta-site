export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function toLowerString(value = '') {
  return typeof value === 'string' ? value.toLowerCase().trim() : ''
}

export function normalizeMimeType(mime = '') {
  const lower = toLowerString(mime)
  return lower.includes(';') ? lower.split(';')[0].trim() : lower
}

export function normalizeExtension(name = '') {
  if (typeof name !== 'string') return ''
  const lower = name.toLowerCase()
  const lastDot = lower.lastIndexOf('.')
  return lastDot >= 0 ? lower.slice(lastDot) : ''
}

export function hasAllowedImageMimeType(mime = '') {
  const normalized = normalizeMimeType(mime)
  return ALLOWED_IMAGE_MIME_TYPES.includes(normalized)
}

export function hasAllowedImageExtension(name = '') {
  const ext = normalizeExtension(name)
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext)
}

export function isAllowedImageFile(mime = '', name = '') {
  const normalizedMime = normalizeMimeType(mime)
  const hasAllowedMime = hasAllowedImageMimeType(normalizedMime)
  const hasAllowedExt = hasAllowedImageExtension(name)
  // Allow a missing/unknown mime if the extension is allowed to better tolerate
  // environments that omit mime metadata while still blocking unexpected paths.
  return hasAllowedExt && (hasAllowedMime || !normalizedMime)
}

export function validateAllowedImageFile({ mime = '', name = '' } = {}) {
  const normalizedMime = normalizeMimeType(mime)
  const hasAllowedMime = hasAllowedImageMimeType(normalizedMime)
  const hasAllowedExt = hasAllowedImageExtension(name)

  if (!name) {
    return { ok: false, error: 'No file name provided', hasAllowedMime, hasAllowedExt }
  }

  const ok = isAllowedImageFile(normalizedMime, name)
  return { ok, error: ok ? '' : 'Upload a JPG, PNG, or WebP image.', hasAllowedMime, hasAllowedExt }
}

export function buildAcceptTypes() {
  return [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_IMAGE_EXTENSIONS]
}
