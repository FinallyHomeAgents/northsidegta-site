export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function toLowerString(value = '') {
  return typeof value === 'string' ? value.toLowerCase().trim() : ''
}

export function normalizeMimeType(mime = '') {
  return toLowerString(mime)
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
  return hasAllowedImageMimeType(mime) && hasAllowedImageExtension(name)
}

export function buildAcceptTypes() {
  return [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_IMAGE_EXTENSIONS]
}
