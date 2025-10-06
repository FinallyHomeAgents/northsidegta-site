import React from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
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
import {
  copyTextToClipboard,
  getCanonicalEventUrl,
  getSiteOrigin,
  shareEvent,
  toAbsoluteUrl,
} from './shareUtils'

const SITE_ORIGIN = 'https://northsidegta.ca'
const FALLBACK_IMAGE = '/Images/hero-desktop.jpg'

const scheduleListDateFormatter = new Intl.DateTimeFormat('en-CA', {
  month: 'short',
  day: 'numeric',
})

const scheduleListWeekdayFormatter = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
})

const scheduleListTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  hour: 'numeric',
  minute: '2-digit',
})

function normalizeWhitespace(text) {
  if (typeof text !== 'string') return ''
  return text.replace(/\s+/g, ' ').trim()
}

function truncateText(text, maxLength = 200) {
  const normalized = normalizeWhitespace(text)
  if (!normalized) return ''
  if (normalized.length <= maxLength) return normalized

  const truncated = normalized.slice(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  if (lastSpaceIndex > 0) {
    return `${truncated.slice(0, lastSpaceIndex)}…`
  }

  return `${normalized.slice(0, maxLength - 1)}…`
}

function splitParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function buildEventSchema(event, origin = SITE_ORIGIN, descriptionOverride = '', occurrenceOverride = null) {
  if (!event) return null
  const baseOrigin = typeof origin === 'string' && origin ? origin : SITE_ORIGIN
  const canonical = getCanonicalEventUrl(event.slug, baseOrigin)
  const start =
    occurrenceOverride?.start || event.startDateObj || (event.startDate ? new Date(event.startDate) : null)
  const end = occurrenceOverride?.end || event.endDateObj || start
  const image = event.image
    ? toAbsoluteUrl(event.image, baseOrigin)
    : toAbsoluteUrl(FALLBACK_IMAGE, baseOrigin)
  const description = truncateText(descriptionOverride || event.summary || event.description || '', 200)

  const location = {
    '@type': 'Place',
    name: event.locationName || event.town || 'NorthSide GTA',
  }

  if (event.address || event.town || event.postalCode) {
    location.address = {
      '@type': 'PostalAddress',
      streetAddress: event.address || '',
      addressLocality: event.town || event.subArea || 'NorthSide GTA',
      addressRegion: event.addressRegion || 'ON',
      postalCode: event.postalCode || '',
      addressCountry: event.addressCountry || 'CA',
    }
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

  const attendanceMode = event.hasLocation || event.address || event.locationName
    ? 'https://schema.org/OfflineEventAttendanceMode'
    : 'https://schema.org/OnlineEventAttendanceMode'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: start ? new Date(start).toISOString() : event.startDate,
    endDate: end ? new Date(end).toISOString() : event.endDate || event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: attendanceMode,
    description,
    location,
    offers,
    url: canonical,
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

export default function EventDetailPage() {
  const { slug: routeSlug } = useParams()
  const location = useLocation()
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

  const selectedDateParam = React.useMemo(() => {
    if (!location || !location.search) return ''
    try {
      const params = new URLSearchParams(location.search)
      const value = params.get('d') || params.get('date')
      if (!value) return ''
      const trimmed = String(value).trim()
      return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : ''
    } catch (error) {
      return ''
    }
  }, [location?.search])

  const scheduleEntries = React.useMemo(() => {
    if (!event?.dailySchedule?.length) return []
    return event.dailySchedule.map((entry, index) => {
      const start =
        entry.start instanceof Date
          ? entry.start
          : entry.startIso
            ? new Date(entry.startIso)
            : null
      const end =
        entry.end instanceof Date
          ? entry.end
          : entry.endIso
            ? new Date(entry.endIso)
            : null
      const dateLabel = start ? scheduleListDateFormatter.format(start) : entry.date || ''
      const weekdayLabel = start ? scheduleListWeekdayFormatter.format(start) : ''
      const timeLabel = entry.allDay
        ? 'All day'
        : start && end
          ? `${scheduleListTimeFormatter.format(start)} – ${scheduleListTimeFormatter.format(end)}`
          : ''
      return {
        ...entry,
        start,
        end,
        dateLabel,
        weekdayLabel,
        timeLabel,
        key: entry.date || `${index}-${entry.startIso || ''}`,
      }
    })
  }, [event])

  const selectedScheduleEntry = React.useMemo(() => {
    if (!scheduleEntries.length) return null
    if (selectedDateParam) {
      const match = scheduleEntries.find((entry) => entry.date === selectedDateParam)
      if (match) return match
    }
    const now = new Date()
    const upcoming = scheduleEntries.find((entry) => entry.end && entry.end >= now)
    return upcoming || scheduleEntries[scheduleEntries.length - 1]
  }, [scheduleEntries, selectedDateParam])

  const occurrence = React.useMemo(() => {
    if (!event) return null
    if (selectedScheduleEntry?.start instanceof Date && !Number.isNaN(selectedScheduleEntry.start)) {
      const start = selectedScheduleEntry.start
      const end =
        selectedScheduleEntry.end && selectedScheduleEntry.end > start
          ? selectedScheduleEntry.end
          : start
      return {
        start,
        end,
        allDay: Boolean(selectedScheduleEntry.allDay),
        scheduleDate: selectedScheduleEntry.date || '',
      }
    }
    const start = event.startDateObj || (event.startDate ? new Date(event.startDate) : null)
    const end = event.endDateObj || start
    if (!start) return null
    return { start, end, allDay: Boolean(event.allDay) }
  }, [event, selectedScheduleEntry])

  const dateLabel = occurrence
    ? formatDateRange(occurrence, occurrence.allDay ?? event?.allDay)
    : ''

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

  const eventDescription = React.useMemo(() => {
    if (!event) return ''
    if (event.summary) return normalizeWhitespace(event.summary)
    if (event.description) return normalizeWhitespace(event.description)
    return ''
  }, [event])

  const truncatedDescription = event ? truncateText(eventDescription || '', 160) : ''
  const schema = React.useMemo(
    () => buildEventSchema(event, normalizedOrigin, truncatedDescription || eventDescription, occurrence),
    [event, eventDescription, normalizedOrigin, truncatedDescription, occurrence],
  )

  const pageTitle = event ? `${event.title} | NorthSide GTA` : 'Event Details | NorthSide GTA'
  const defaultDescription = 'Explore community events across the NorthSide GTA.'
  const scheduleShareSnippet = selectedScheduleEntry
    ? [
        selectedScheduleEntry.weekdayLabel,
        selectedScheduleEntry.dateLabel,
        selectedScheduleEntry.timeLabel,
      ]
        .filter(Boolean)
        .join(' • ')
    : ''
  const baseDescription = truncatedDescription || eventDescription || defaultDescription
  const pageDescription = scheduleShareSnippet ? `${scheduleShareSnippet}. ${baseDescription}` : baseDescription
  const canonicalUrl = event ? getCanonicalEventUrl(event.slug, normalizedOrigin) : `${normalizedOrigin}/events`
  const ogImage = event?.image
    ? toAbsoluteUrl(event.image, normalizedOrigin)
    : toAbsoluteUrl(FALLBACK_IMAGE, normalizedOrigin)
  const shareUrl = React.useMemo(() => {
    if (!event || !selectedScheduleEntry?.date) return canonicalUrl
    const separator = canonicalUrl.includes('?') ? '&' : '?'
    return `${canonicalUrl}${separator}d=${selectedScheduleEntry.date}`
  }, [canonicalUrl, event, selectedScheduleEntry])
  const shareTitle = event
    ? `${event.title}${scheduleShareSnippet ? ` — ${scheduleShareSnippet}` : ''}`
    : 'NorthSide GTA Event'
  const shareText = event ? pageDescription : 'Check out this NorthSide GTA event.'
  const emailBody = shareText ? `${shareText}\n\n${shareUrl}` : shareUrl
  const publishedTime = occurrence?.start
    ? new Date(occurrence.start).toISOString()
    : event?.startDate
      ? new Date(event.startDate).toISOString()
      : ''

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
    const result = await shareEvent({ url: shareUrl, title: shareTitle, text: shareText })
    if (result.copied) {
      showShareToast()
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
        href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(emailBody)}`,
        label: 'Email',
        icon: Mail,
      },
    ]
  }, [emailBody, event, shareTitle, shareUrl])

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="event" />
        <meta property="og:url" content={shareUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {ogImage && <meta property="og:image:alt" content={shareTitle} />}
        <meta property="og:site_name" content="NorthSide GTA" />
        {publishedTime && <meta property="article:published_time" content={publishedTime} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {ogImage && <meta name="twitter:image:alt" content={shareTitle} />}
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
                  {scheduleEntries.length > 0 && (
                    <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</h2>
                      <dl className="mt-2 space-y-2">
                        {scheduleEntries.map((entry) => {
                          const isSelected = selectedScheduleEntry?.date === entry.date
                          return (
                            <div
                              key={entry.key}
                              className={`flex flex-col gap-1 rounded-xl px-3 py-2 transition sm:flex-row sm:items-baseline sm:justify-between ${
                                isSelected ? 'bg-white shadow-sm ring-1 ring-emerald-100' : ''
                              }`}
                              aria-current={isSelected ? 'true' : undefined}
                            >
                              <dt className="text-sm font-semibold text-slate-900">
                                {entry.weekdayLabel ? `${entry.weekdayLabel}, ${entry.dateLabel}` : entry.dateLabel}
                              </dt>
                              <dd className="text-sm text-slate-600">{entry.timeLabel || 'Times TBA'}</dd>
                            </div>
                          )
                        })}
                      </dl>
                    </section>
                  )}
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
                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {label}
                          </a>
                        ))}
                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                          aria-label="Share this event"
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
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
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
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                    >
                      Event site
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleAddToCalendar}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Add to calendar
                    <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                    aria-label="Share this event"
                  >
                    Share
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {mapLink && (
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
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
