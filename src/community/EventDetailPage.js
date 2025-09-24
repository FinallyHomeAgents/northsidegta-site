import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, CalendarPlus, ExternalLink, MapPin } from 'lucide-react'
import Navigation from '../Navigation'
import Footer from '../Footer'
import { sanitizeEvent, formatDateRange, generateIcsContent } from './eventUtils'

function splitParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function buildEventSchema(event, origin) {
  if (!event) return null
  const baseOrigin = typeof origin === 'string' && origin ? origin : 'https://www.northsidegta.ca'
  const canonical = `${baseOrigin.replace(/\/$/, '')}/community/events/${encodeURIComponent(event.slug)}`
  const start = event.startDateObj || (event.startDate ? new Date(event.startDate) : null)
  const end = event.endDateObj || start
  const image = event.image && /^https?:\/\//i.test(event.image)
    ? event.image
    : event.image
      ? `${baseOrigin.replace(/\/$/, '')}${event.image.startsWith('/') ? event.image : `/${event.image}`}`
      : undefined

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

export default function EventDetailPage() {
  const { slug: routeSlug } = useParams()
  const slug = routeSlug ? decodeURIComponent(routeSlug) : ''
  const [event, setEvent] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

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

  const schema = React.useMemo(() => buildEventSchema(event), [event])

  const pageTitle = event ? `${event.title} • NorthSide GTA Events` : 'Event Details • NorthSide GTA'
  const pageDescription =
    event?.summary ||
    (event?.description ? event.description.replace(/\s+/g, ' ').trim().slice(0, 160) : '') ||
    'Explore community events across the NorthSide GTA.'
  const canonicalUrl = event
    ? `https://www.northsidegta.ca/community/events/${encodeURIComponent(event.slug)}`
    : 'https://www.northsidegta.ca/community/events'

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

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {event?.image && <meta property="og:image" content={event.image} />}
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
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    {event.status === 'published' ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    )}
                    {event.hidden && (
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                        Hidden from listings
                      </span>
                    )}
                    {event.archived && (
                      <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        Archived
                      </span>
                    )}
                  </div>
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
    </>
  )
}
