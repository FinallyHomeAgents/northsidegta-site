import React from 'react'
import ReactDOM from 'react-dom'
import { X, MapPin, ExternalLink, CalendarPlus, Share2 } from 'lucide-react'
import { BADGE_LABELS, formatDateRange, generateIcsContent } from './eventUtils'
import { getCanonicalEventUrl, shareEvent } from './shareUtils'

function getModalRoot() {
  if (typeof document === 'undefined') return null
  let root = document.getElementById('community-modal-root')
  if (!root) {
    root = document.createElement('div')
    root.id = 'community-modal-root'
    document.body.appendChild(root)
  }
  return root
}

function splitParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

export default function EventModal({ event, onClose }) {
  const modalRoot = getModalRoot()
  const occurrence = event?.nextOccurrence || event?.occurrences?.[0]
  const dateLabel = formatDateRange(occurrence, event?.allDay)
  const townParts = []
  if (event?.subArea) townParts.push(event.subArea)
  if (event?.town) townParts.push(event.town)
  const townLabel = townParts.join(', ') || 'NorthSide GTA'
  const sourceLabel = event?.sourceName || event?.sourceDomain || 'Source'
  const sourceTypeLabel = event?.source === 'feed' ? 'Feed' : 'Manual'
  const [shareToastVisible, setShareToastVisible] = React.useState(false)
  const shareToastTimeoutRef = React.useRef(null)

  React.useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [onClose])

  React.useEffect(() => {
    return () => {
      if (shareToastTimeoutRef.current) {
        clearTimeout(shareToastTimeoutRef.current)
      }
    }
  }, [])

  if (!modalRoot || !event) return null

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

  const mapEmbedSrc =
    typeof event.lat === 'number' && typeof event.lng === 'number'
      ? `https://www.google.com/maps?q=${event.lat},${event.lng}&z=14&output=embed`
      : event.address
        ? `https://www.google.com/maps?q=${encodeURIComponent(event.address)}&z=13&output=embed`
        : ''

  const mapLink = event.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.locationName || ''} ${event.address}`.trim()
      )}`
    : ''

  const descriptionParagraphs = splitParagraphs(event.description || event.summary || '')
  const shareUrl = event.slug ? getCanonicalEventUrl(event.slug) : event.eventUrl || ''
  const shareText = event.summary || event.title

  const showShareToast = React.useCallback(() => {
    setShareToastVisible(true)
    if (shareToastTimeoutRef.current) {
      clearTimeout(shareToastTimeoutRef.current)
    }
    shareToastTimeoutRef.current = setTimeout(() => setShareToastVisible(false), 2000)
  }, [])

  const handleShare = React.useCallback(async () => {
    if (!shareUrl) return
    const result = await shareEvent({ url: shareUrl, title: event.title, text: shareText })
    if (result.copied) {
      showShareToast()
    }
  }, [event.title, shareText, shareUrl, showShareToast])

  const modal = (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 py-10 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
        <div className="sr-only" role="status" aria-live="polite">
          {shareToastVisible ? 'Link copied to clipboard' : ''}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900"
          aria-label="Close details"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {shareToastVisible && (
          <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-emerald-600/90 px-4 py-2 text-xs font-medium text-white shadow-lg">
            Link copied
          </div>
        )}

        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="h-64 w-full rounded-t-3xl object-cover"
            loading="lazy"
          />
        )}

        <div className="space-y-6 px-6 pb-10 pt-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <span>{townLabel}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
              <span>{event.category}</span>
            </div>
            <h2 id="event-modal-title" className="text-3xl font-semibold text-slate-900">
              {event.title}
            </h2>
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
            <div className="flex flex-wrap gap-2">
              {event.priceType === 'Free' && (
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
            {event.priceNote && <p className="text-xs text-slate-500">{event.priceNote}</p>}
          </header>

          {descriptionParagraphs.length > 0 && (
            <section className="space-y-4 text-sm leading-relaxed text-slate-700">
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
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Event site
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Add to calendar
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          </button>
          {shareUrl && (
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              aria-label={`Share ${event.title}`}
            >
              Share
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {mapLink && (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Map & directions
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          </div>

          {mapEmbedSrc && (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title={`Map for ${event.title}`}
                src={mapEmbedSrc}
                loading="lazy"
                className="h-64 w-full border-0"
                allowFullScreen
              />
            </div>
          )}

          <dl className="grid gap-4 text-xs text-slate-600 sm:grid-cols-2">
            {event.organizerName && (
              <div>
                <dt className="font-semibold uppercase tracking-wide text-slate-500">Organizer</dt>
                <dd>
                  {event.organizerUrl ? (
                    <a
                      href={event.organizerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline"
                    >
                      {event.organizerName}
                    </a>
                  ) : (
                    event.organizerName
                  )}
                </dd>
              </div>
            )}
            <div>
              <dt className="font-semibold uppercase tracking-wide text-slate-500">Source</dt>
              <dd className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                {event.sourceUrl ? (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {sourceLabel}
                  </a>
                ) : (
                  <span className="font-medium text-slate-700">{sourceLabel}</span>
                )}
                {event.sourceDomain && !sourceLabel.includes(event.sourceDomain) && (
                  <span className="text-xs uppercase tracking-wide text-slate-400">{event.sourceDomain}</span>
                )}
                <span className="text-xs uppercase tracking-wide text-slate-400">{sourceTypeLabel}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modal, modalRoot)
}
