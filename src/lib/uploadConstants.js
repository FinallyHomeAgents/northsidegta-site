export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_IMAGE_MIME_ALIASES = ['image/jpg', 'image/pjpeg', 'image/x-png']
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function toLowerString(value = '') {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

export function normalizeMimeType(mime = '') {
  return toLowerString(mime).trim()
}

export function normalizeExtension(name = '') {
  if (typeof name !== 'string') return ''
  const lower = name.toLowerCase()
  const lastDot = lower.lastIndexOf('.')
  return lastDot >= 0 ? lower.slice(lastDot) : ''
}

export function isAllowedImageMimeType(mime = '') {
  const normalized = normalizeMimeType(mime)
  return (
    ALLOWED_IMAGE_MIME_TYPES.includes(normalized) ||
    ALLOWED_IMAGE_MIME_ALIASES.includes(normalized)
  )
}

export function isAllowedImageExtension(name = '') {
  const ext = normalizeExtension(name)
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext)
}

export function isAllowedImageFile(mime = '', name = '') {
  return isAllowedImageMimeType(mime) || isAllowedImageExtension(name)
}

export function buildAcceptTypes() {
  return [
    ...ALLOWED_IMAGE_MIME_TYPES,
    ...ALLOWED_IMAGE_MIME_ALIASES,
    ...ALLOWED_IMAGE_EXTENSIONS,
  ]
}
