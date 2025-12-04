export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg', // common alias some browsers send
  'image/pjpeg', // progressive jpeg alias
  'image/x-png', // legacy png alias
]

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

export function normalizeMimeType(mime = '') {
  return String(mime).toLowerCase()
}

export function normalizeExtension(name = '') {
  const rawExt = name.includes('.') ? name.split('.').pop() : name
  return String(rawExt || '').toLowerCase()
}

export function isAllowedImageMimeType(mime = '') {
  const normalized = normalizeMimeType(mime)
  return ALLOWED_IMAGE_MIME_TYPES.includes(normalized)
}

export function isAllowedImageExtension(name = '') {
  const ext = normalizeExtension(name)
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext)
}

export function isAllowedImageFile(mime = '', name = '') {
  return isAllowedImageMimeType(mime) || isAllowedImageExtension(name)
}
