import React from 'react'
import {
  CalendarPlus,
  ExternalLink,
  MapPin,
  ArrowRight,
  Share2,
} from 'lucide-react'
import { BADGE_LABELS, formatDateRange, generateIcsContent } from './eventUtils'
import { buildEventSlug, getCanonicalEventUrl, shareEvent } from './shareUtils'

function PlaceholderImage({ variant }) {
  const isCompact = variant === 'compact'

  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 via-white to-slate-100 ${
        isCompact ? 'p-6' : 'p-8'
      }`}
    >
      <CalendarPlus className="h-8 w-8 text-slate-400" aria-hidden="true" />
    </div>
  )
}

export default function EventCard({ event, onSelect, highlighted = false, variant = 'default' }) {
  const occurrence = event.nextOccurrence || event.occurrences?.[0]
  const dateLabel = formatDateRange(occurrence, occurrence?.allDay ?? event.allDay)
  const isFree = event.priceType === 'Free'
  const townParts = []
  if (event.subArea) townParts.push(event.subArea)
  if (event.town) townParts.push(event.town)
  const townLabel = townParts.join(', ') || 'NorthSide GTA'
  const sourceLabel = event.sourceName || event.sourceDomain || 'Source'

  const handleAddToCalendar = () => {
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
  }

  const mapHref = event.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.locationName || ''} ${event.address}`.trim()
      )}`
    : ''

  const eventSlug = event.slug || buildEventSlug(event)
  const shareUrl = eventSlug ? getCanonicalEventUrl(eventSlug) : ''
  const shareText = event.summary || event.title

  const [showToast, setShowToast] = React.useState(false)
  const toastTimeoutRef = React.useRef(null)

  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const showCopiedToast = React.useCallback(() => {
    setShowToast(true)
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000)
  }, [])

  const handleShare = React.useCallback(async () => {
    if (!shareUrl) return
    const result = await shareEvent({ url: shareUrl, title: event.title, text: shareText })
    if (result.copied) {
      showCopiedToast()
    }
  }, [event.title, shareText, shareUrl, showCopiedToast])

  const hasDetailPage = Boolean(eventSlug)
  const eventSiteHref = hasDetailPage ? `/events/${encodeURIComponent(eventSlug)}` : event.eventUrl
  const eventSiteIsExternal = Boolean(event.eventUrl && !hasDetailPage)
  const EventSiteIcon = eventSiteIsExternal ? ExternalLink : ArrowRight
  const eventSiteLinkProps = eventSiteIsExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  const isCompact = variant === 'compact'

  const bodySpacing = isCompact ? 'gap-4 p-4' : 'gap-5 p-6'
  const titleSize = isCompact ? 'text-xl' : 'text-2xl'
  const summarySize = isCompact ? 'text-sm' : 'text-base'
  const footerPadding = isCompact ? 'px-4 py-3' : 'px-6 py-4'
  const detailButtonPadding = isCompact ? 'px-3 py-2' : 'px-4 py-3'
  const actionButtonPadding = isCompact ? 'px-3 py-2' : 'px-4 py-2'

  return (
    <article
      id={eventSlug ? `event-${eventSlug}` : undefined}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow duration-200 hover:shadow-xl focus-within:shadow-xl ${
        highlighted ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-slate-200'
      }`}
    >
      <div className="sr-only" role="status" aria-live="polite">
        {showToast ? 'Link copied to clipboard' : ''}
      </div>
      <div className={`flex flex-col ${bodySpacing}`}>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className={`aspect-[4/3] w-full ${isCompact ? 'p-2' : 'p-3'} flex items-center justify-center bg-slate-50`}>
            {event.image ? (
              <img
                src={event.image}
                alt={`${event.title} preview`}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            ) : (
              <PlaceholderImage variant={variant} />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <span>{townLabel}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
            <span>{event.category}</span>
          </div>
          <h3 className={`${titleSize} font-semibold tracking-tight text-slate-900`}>
            {event.title}
          </h3>
          {dateLabel && <p className="text-sm text-slate-700 sm:text-base">{dateLabel}</p>}
          {event.locationName && (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>
                {event.locationName}
                {townLabel ? ` · ${townLabel}` : ''}
              </span>
            </p>
          )}
          {event.summary && <p className={`${summarySize} leading-relaxed text-slate-600`}>{event.summary}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {isFree && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Free
            </span>
          )}
          {event.priceType === 'Mixed' && (
            <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Free & Paid options
            </span>
          )}
          {event.badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {BADGE_LABELS[badge] || badge}
            </span>
          ))}
        </div>

        {event.priceNote && (
          <p className="text-xs text-slate-500">{event.priceNote}</p>
        )}

        {(event.sourceUrl || event.sourceName || event.sourceDomain) && (
          <p className="text-xs text-slate-400">
            Source:{' '}
            {event.sourceUrl ? (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
              >
                {sourceLabel}
              </a>
            ) : (
              <span className="font-medium text-slate-500">{sourceLabel}</span>
            )}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-sm font-medium">
          {eventSiteHref && (
            <a
              href={eventSiteHref}
              {...eventSiteLinkProps}
              className={`inline-flex items-center gap-2 rounded-full border border-slate-300 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 ${actionButtonPadding}`}
            >
              Event site
              <EventSiteIcon className="h-4 w-4" aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            onClick={handleAddToCalendar}
            className={`inline-flex items-center gap-2 rounded-full border border-slate-300 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 ${actionButtonPadding}`}
          >
            Add to calendar
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          </button>

          {mapHref && (
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-full border border-slate-300 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 ${actionButtonPadding}`}
            >
              Map
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </a>
          )}

          {shareUrl && (
            <button
              type="button"
              onClick={handleShare}
              className={`inline-flex items-center gap-2 rounded-full border border-slate-300 text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${actionButtonPadding}`}
              aria-label={`Share ${event.title}`}
            >
              Share
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {showToast && (
        <div className="pointer-events-none absolute inset-x-6 top-6 rounded-xl bg-emerald-600/90 px-4 py-2 text-center text-xs font-medium text-white shadow-lg">
          Link copied
        </div>
      )}

      <div className={`border-t border-slate-200 bg-slate-50 ${footerPadding}`}>
        <button
          type="button"
          onClick={() => onSelect?.(event)}
          className={`flex w-full items-center justify-between rounded-xl bg-white text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 ${detailButtonPadding}`}
          aria-label={`View details for ${event.title}`}
        >
          View details
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
