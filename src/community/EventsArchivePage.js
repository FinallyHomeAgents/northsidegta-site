import React from 'react'
import { Helmet } from 'react-helmet-async'
import { DateTime } from 'luxon'
import { CalendarDays, ExternalLink, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import HeaderShell from '../components/HeaderShell'
import Footer from '../Footer'
import { hydrateEvents, formatDateRange } from './eventUtils'

const TORONTO_ZONE = 'America/Toronto'

function getArchiveCandidates(events) {
  const todayStart = DateTime.now().setZone(TORONTO_ZONE).startOf('day')

  return events
    .map((event) => {
      if (!event || event.hidden) return null
      const archivedFlag = Boolean(event.archived)
      const endDate = event.endDateObj || event.startDateObj
      const endDateTime = endDate ? DateTime.fromJSDate(endDate).setZone(TORONTO_ZONE) : null
      const isPast = endDateTime ? endDateTime < todayStart : false
      if (!archivedFlag && !isPast) return null

      const sortValue = endDateTime ? endDateTime.toMillis() : 0
      return {
        ...event,
        archiveType: archivedFlag ? 'archived' : 'past',
        _sortValue: sortValue,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b._sortValue - a._sortValue)
    .map(({ _sortValue, ...event }) => event)
}

function buildDateLabel(event) {
  const occurrence = {
    start: event.startDateObj || (event.startDate ? new Date(event.startDate) : null),
    end: event.endDateObj || event.startDateObj || (event.startDate ? new Date(event.startDate) : null),
  }
  if (!occurrence.start) return ''
  return formatDateRange(occurrence, event.allDay)
}

function ArchiveEventCard({ event }) {
  const dateLabel = buildDateLabel(event)
  const townParts = []
  if (event.subArea) townParts.push(event.subArea)
  if (event.town) townParts.push(event.town)
  const townLabel = townParts.join(', ')

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
          {townLabel && <span>{townLabel}</span>}
          {townLabel && event.category && (
            <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
          )}
          {event.category && <span>{event.category}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold text-slate-900">
            <Link to={`/events/${event.slug}`} className="hover:text-emerald-700">
              {event.title}
            </Link>
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              event.archiveType === 'archived'
                ? 'border border-slate-300 bg-slate-100 text-slate-700'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {event.archiveType === 'archived' ? 'Archived' : 'Past Event'}
          </span>
        </div>
        {dateLabel && (
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            <span>{dateLabel}</span>
          </p>
        )}
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
        {event.summary && <p className="text-sm leading-relaxed text-slate-600">{event.summary}</p>}
      </div>

      <div className="mt-auto flex flex-wrap gap-3 text-sm font-medium">
        <Link
          to={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          View details
        </Link>
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
      </div>
    </article>
  )
}

export default function EventsArchivePage() {
  const [rawEvents, setRawEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    fetch('/api/events?status=all&scope=all&includeStatus=true', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('failed')
        return response.json()
      })
      .then((payload) => {
        if (cancelled) return
        setRawEvents(Array.isArray(payload.events) ? payload.events : [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[events-archive] failed to load events', err)
        setError('failed')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const events = React.useMemo(() => hydrateEvents(rawEvents), [rawEvents])
  const archiveEvents = React.useMemo(() => getArchiveCandidates(events), [events])

  const pageDescription =
    'Browse the archive of past community events across Aurora, Uxbridge, Georgina, Stouffville, East Gwillimbury, Newmarket and Scugog.'

  return (
    <>
      <Helmet>
        <title>Past Events Archive • NorthSide GTA</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href="https://northsidegta.ca/events/archive" />
        <meta property="og:title" content="Past Events Archive" />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      <HeaderShell />

      <main className="bg-slate-50">
        <section className="bg-slate-900 py-16 text-white">
          <div className="mx-auto max-w-4xl space-y-4 px-4 text-center">
            <h1 className="text-4xl font-semibold tracking-tight">Past Events Archive</h1>
            <p className="text-base text-slate-200">
              Catch up on recently wrapped and archived happenings across the NorthSide GTA.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl space-y-8 px-4 py-12">
          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600 shadow-sm">
              Loading the archive…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center text-sm text-amber-700">
              We couldn’t load the archive right now. Please try again soon.
            </div>
          )}

          {!loading && !error && archiveEvents.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600 shadow-sm">
              Recently published events will appear here once they wrap up.
            </div>
          )}

          {!loading && !error && archiveEvents.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {archiveEvents.map((event) => (
                <ArchiveEventCard key={event.slug} event={event} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
