export const DEFAULT_SITE_ORIGIN = 'https://northsidegta.ca'

export function getSiteOrigin(fallback = DEFAULT_SITE_ORIGIN) {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return fallback
}

export function toAbsoluteUrl(path, origin = DEFAULT_SITE_ORIGIN) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const normalizedOrigin = (origin || DEFAULT_SITE_ORIGIN).replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedOrigin}${normalizedPath}`
}

export function formatDateForSlug(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function slugify(value) {
  if (!value) return ''
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

export function buildEventSlug(raw = {}) {
  if (raw && typeof raw.slug === 'string' && raw.slug.trim()) {
    return raw.slug.trim()
  }

  const titleSlug = slugify(raw.title)
  const townSlug = slugify(raw.town || raw.locationName || '')
  const dateSlug = formatDateForSlug(raw.startDate || raw.start || raw.begin)
  const baseParts = [dateSlug, titleSlug, townSlug].filter(Boolean)

  const base = baseParts.length > 0 ? baseParts.join('-') : titleSlug
  const fallback = raw.eventUrl || raw.sourceRef || raw.sourceName || raw.id || ''
  const candidate = slugify(base) || slugify(fallback) || ''
  return candidate
}

export async function copyTextToClipboard(text) {
  if (!text) return false
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.warn('Clipboard write failed, falling back', error)
    }
  }

  if (typeof document === 'undefined') return false

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textarea)
    return successful
  } catch (error) {
    console.warn('Unable to copy share URL', error)
    return false
  }
}

export async function shareEvent({ url, title, text }) {
  if (!url) {
    return { usedNative: false, copied: false, aborted: false }
  }

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url })
      return { usedNative: true, copied: false, aborted: false }
    } catch (error) {
      if (error?.name === 'AbortError') {
        return { usedNative: true, copied: false, aborted: true }
      }
      console.warn('Native share failed, falling back', error)
    }
  }

  const copied = await copyTextToClipboard(url)
  return { usedNative: false, copied, aborted: false }
}

export function getCanonicalEventUrl(slug, origin = getSiteOrigin()) {
  if (!slug) return ''
  const safeSlug = encodeURIComponent(slug)
  const normalizedOrigin = (origin || DEFAULT_SITE_ORIGIN).replace(/\/$/, '')
  return `${normalizedOrigin}/events/${safeSlug}`
}
