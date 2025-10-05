import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ArrowLeft,
  CalendarPlus,
  ExternalLink,
  MapPin,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
} from 'lucide-react'
import Navigation from '../Navigation'
import Footer from '../Footer'
import { sanitizeEvent, formatDateRange, generateIcsContent } from './eventUtils'

const SITE_ORIGIN = 'https://northsidegta.ca'
const FALLBACK_IMAGE = '/Images/hero-desktop.jpg'

function getSiteOrigin(defaultOrigin = SITE_ORIGIN) {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return defaultOrigin
}

function normalizeWhitespace(text) {
  if (typeof text !== 'string') return ''
  return text.replace(/\s+/g, ' ').trim()
}

function splitParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function toAbsoluteUrl(path, origin = SITE_ORIGIN) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = typeof origin === 'string' && origin ? origin.replace(/\/$/, '') : SITE_ORIGIN
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

function buildEventSchema(event, origin = SITE_ORIGIN) {
  if (!event) return null
  const baseOrigin = typeof origin === 'string' && origin ? origin : SITE_ORIGIN
  const canonical = `${baseOrigin.replace(/\/$/, '')}/events/${encodeURIComponent(event.slug)}`
  const start = event.startDateObj || (event.startDate ? new Date(event.startDate) : null)
  const end = event.endDateObj || start
  const image = event.image ? toAbsoluteUrl(event.image, baseOrigin) : undefined

  const location = {
    '@type': 'Place',
    name: event.locationName || event.town || 'NorthSide GTA',
  }

  if (event.address) {
    location.address = event.address
  } else if (event.town) {
    location.address = `${event.town}, Ontario`
  }

  if (event.hasLocation) {
    location.geo = {
      '@type': 'GeoCoordinates',
      latitude: event.lat,
      longitude: event.lng,
    }
  }

  const offers = {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    url: event.eventUrl || canonical,
  }

  if (event.priceType === 'Free') {
    offers.price = 0
    offers.priceCurrency = 'CAD'
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: start ? new Date(start).toISOString() : event.startDate,
    endDate: end ? new Date(end).toISOString() : event.endDate || event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: (event.summary || event.description || '').replace(/\s+/g, ' ').trim(),
    location,
    offers,
    url: event.eventUrl || canonical,
  }

  if (image) {
    schema.image = [image]
  }

  if (event.organizerName) {
    schema.organizer = {
      '@type': 'Organization',
      name: event.organizerName,
      url: event.organizerUrl || event.eventUrl || canonical,
    }
  }

  return JSON.stringify(schema, null, 2)
}

async function copyTextToClipboard(text) {
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

export default function EventDetailPage() {
  const { slug: routeSlug } = useParams()
  const slug = routeSlug ? decodeURIComponent(routeSlug) : ''
  const [event, setEvent] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [shareToastVisible, setShareToastVisible] = React.useState(false)
  const toastTimeoutRef = React.useRef(null)

  React.useEffect(() => {
    if (!slug) {
      setError('not-found')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    fetch(`/data/events/${encodeURIComponent(slug)}.json`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('not-found')
          }
          throw new Error('failed')
        }
        return response.json()
      })
      .then((payload) => {
        if (cancelled) return
        const sanitized = sanitizeEvent(payload)
        if (!sanitized) {
          setError('not-found')
        } else {
          setEvent(sanitized)
        }
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message === 'not-found' ? 'not-found' : 'failed')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const occurrence = React.useMemo(() => {
    if (!event) return null
    const start = event.startDateObj || (event.startDate ? new Date(event.startDate) : null)
    const end = event.endDateObj || start
    if (!start) return null
    return { start, end }
  }, [event])

  const dateLabel = occurrence ? formatDateRange(occurrence, event?.allDay) : ''

  const descriptionParagraphs = React.useMemo(() => splitParagraphs(event?.description || ''), [event])
  const summaryParagraphs = React.useMemo(
    () => (event?.summary ? splitParagraphs(event.summary) : []),
    [event]
  )

  const townParts = []
  if (event?.subArea) townParts.push(event.subArea)
  if (event?.town) townParts.push(event.town)
  const townLabel = townParts.join(', ')

  const mapEmbedSrc = React.useMemo(() => {
    if (!event) return ''
    if (typeof event.lat === 'number' && typeof event.lng === 'number') {
      return `https://www.google.com/maps?q=${event.lat},${event.lng}&z=14&output=embed`
    }
    if (event.address) {
      return `https://www.google.com/maps?q=${encodeURIComponent(event.address)}&z=13&output=embed`
    }
    return ''
  }, [event])

  const mapLink = React.useMemo(() => {
    if (!event) return ''
    if (event.address) {
      const label = `${event.locationName || ''} ${event.address}`.trim()
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`
    }
    return ''
  }, [event])

  const siteOrigin = React.useMemo(() => getSiteOrigin(), [])
  const normalizedOrigin = React.useMemo(
    () => (typeof siteOrigin === 'string' && siteOrigin ? siteOrigin.replace(/\/$/, '') : SITE_ORIGIN),
    [siteOrigin]
  )

  const schema = React.useMemo(() => buildEventSchema(event, normalizedOrigin), [event, normalizedOrigin])

  const eventDescription = React.useMemo(() => {
    if (!event) return ''
    if (event.summary) return normalizeWhitespace(event.summary)
    if (event.description) return normalizeWhitespace(event.description)
    return ''
  }, [event])

  const pageTitle = event ? `${event.title} • NorthSide GTA Events` : 'Event Details • NorthSide GTA'
  const defaultDescription = 'Explore community events across the NorthSide GTA.'
  const pageDescription = eventDescription || defaultDescription
  const canonicalUrl = event
    ? `${normalizedOrigin}/events/${encodeURIComponent(event.slug)}`
    : `${normalizedOrigin}/events`
  const ogImage = event?.image
    ? toAbsoluteUrl(event.image, normalizedOrigin)
    : toAbsoluteUrl(FALLBACK_IMAGE, normalizedOrigin)
  const shareUrl = canonicalUrl
  const shareTitle = event ? event.title : 'NorthSide GTA Event'
  const shareText = eventDescription || 'Check out this NorthSide GTA event.'

  const handleAddToCalendar = React.useCallback(() => {
    if (!event) return
    if (event.icsUrl) {
      window.open(event.icsUrl, '_blank', 'noopener')
      return
    }
    const ics = generateIcsContent(event, occurrence)
    if (!ics) return
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${event.slug || 'northside-event'}.ics`
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }, [event, occurrence])

  const showShareToast = React.useCallback(() => {
    setShareToastVisible(true)
    if (toastTimeoutRef.current && typeof window !== 'undefined') {
      window.clearTimeout(toastTimeoutRef.current)
    }
    if (typeof window !== 'undefined') {
      toastTimeoutRef.current = window.setTimeout(() => setShareToastVisible(false), 2000)
    }
  }, [])

  const handleShare = React.useCallback(async () => {
    const copied = await copyTextToClipboard(shareUrl)
    if (copied) {
      showShareToast()
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.warn('Share aborted', error)
        }
      }
    }
  }, [shareText, shareTitle, shareUrl, showShareToast])

  const shareLinks = React.useMemo(() => {
    if (!shareUrl || !event) return []
    return [
      {
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        label: 'Facebook',
        icon: Facebook,
      },
      {
        href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
        label: 'X (Twitter)',
        icon: Twitter,
      },
      {
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        label: 'LinkedIn',
        icon: Linkedin,
      },
      {
        href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
        label: 'Email',
        icon: Mail,
      },
    ]
  }, [event, shareText, shareTitle, shareUrl])

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {ogImage && <meta property="og:image:alt" content={shareTitle} />}
        <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {event?.hidden && <meta name="robots" content="noindex" />}
        {schema && <script type="application/ld+json">{schema}</script>}
      </Helmet>

      <Navigation />

      <main className="bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <Link to="/community" className="font-semibold text-slate-700 hover:text-slate-900">
                Back to events
              </Link>
            </div>
            {loading && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-600">
                Loading event details…
              </div>
            )}
            {!loading && error === 'not-found' && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600">
                We couldn’t find this event. It may have been removed or renamed.
              </div>
            )}
            {!loading && error === 'failed' && (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-5 py-6 text-sm text-amber-700">
                The event details are unavailable right now. Please try again in a moment.
              </div>
            )}
            {!loading && !error && event && (
              <article className="space-y-8">
                {event.image && (
                  <img
                    src={event.image}
                    alt={`${event.title} hero`}
                    className="h-72 w-full rounded-3xl object-cover"
                    loading="lazy"
                  />
                )}
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    {townLabel && <span>{townLabel}</span>}
                    {townLabel && event.category && (
                      <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                    )}
                    {event.category && <span>{event.category}</span>}
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{event.title}</h1>
                  {dateLabel && <p className="text-base text-slate-700">{dateLabel}</p>}
                  {event.locationName && (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {event.locationName}
                        {event.address ? ` · ${event.address}` : ''}
                        {!event.address && townLabel ? ` · ${townLabel}` : ''}
                      </span>
                    </p>
                  )}
                  {event.priceNote && <p className="text-xs text-slate-500">{event.priceNote}</p>}
                  {summaryParagraphs.length > 0 && (
                    <div className="space-y-3 text-sm text-slate-600">
                      {summaryParagraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                  {shareLinks.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Share this event
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm font-medium">
                        {shareLinks.map(({ href, label, icon: Icon }) => (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {label}
                          </a>
                        ))}
                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                        >
                          Share
                          <Share2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const copied = await copyTextToClipboard(shareUrl)
                            if (copied) showShareToast()
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                        >
                          Copy link
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {descriptionParagraphs.length > 0 && (
                  <section className="space-y-4 text-base leading-relaxed text-slate-700">
                    {descriptionParagraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </section>
                )}

                <div className="flex flex-wrap gap-3 text-sm font-medium">
                  {event.eventUrl && (
                    <a
                      href={event.eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                    >
                      Event site
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleAddToCalendar}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                  >
                    Add to calendar
                    <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {mapLink && (
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                    >
                      Map & directions
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                </div>

                {mapEmbedSrc && (
                  <div className="overflow-hidden rounded-3xl border border-slate-200">
                    <iframe
                      title="Map preview"
                      src={mapEmbedSrc}
                      width="100%"
                      height="320"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                )}

                {(event.organizerName || event.organizerUrl || event.sourceName || event.sourceUrl) && (
                  <div className="space-y-2 rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
                    {event.organizerName && (
                      <p>
                        Organizer:{' '}
                        {event.organizerUrl ? (
                          <a
                            href={event.organizerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-slate-700 hover:text-slate-900"
                          >
                            {event.organizerName}
                          </a>
                        ) : (
                          <span className="font-medium text-slate-700">{event.organizerName}</span>
                        )}
                      </p>
                    )}
                    {(event.sourceName || event.sourceUrl) && (
                      <p className="text-xs text-slate-500">
                        Source:{' '}
                        {event.sourceUrl ? (
                          <a
                            href={event.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-slate-600 hover:text-slate-900"
                          >
                            {event.sourceName || event.sourceUrl}
                          </a>
                        ) : (
                          <span className="font-medium text-slate-600">{event.sourceName}</span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </article>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <div className="sr-only" role="status" aria-live="polite">
        {shareToastVisible ? 'Link copied to clipboard' : ''}
      </div>

      {shareToastVisible && (
        <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-full bg-emerald-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-lg">
          Link copied
        </div>
      )}
    </>
  )
}
