// src/CommunityPage.js
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { CalendarDays, List, Map as MapIcon } from 'lucide-react'
import HeaderShell from './components/HeaderShell'
import Footer from './Footer'
import EventFilters from './community/EventFilters'
import EventCard from './community/EventCard'
import EventCalendar from './community/EventCalendar'
import CalendarFilterBar from './community/CalendarFilterBar'
import EventModal from './community/EventModal'
import CommunityStories from './community/CommunityStories'
import {
  buildFiltersDefaults,
  filterEvents,
  getStructuredData,
  hydrateEvents,
} from './community/eventUtils'
import DynamicMetaTags from './components/seo/DynamicMetaTags'
import { getStaticRouteMeta } from './components/seo/staticRouteMetaExports'
import { buildCommunityEventsSchema } from './lib/structuredData/communityPage'
import { getCanonicalEventUrl, toAbsoluteUrl, getSiteOrigin } from './community/shareUtils'

const EventMap = React.lazy(() => import('./community/EventMap'))
const VIEW_STORAGE_KEY = 'northside-community-view'
const monthFormatter = new Intl.DateTimeFormat('en-CA', {
  month: 'long',
  year: 'numeric',
})

function usePersistedView(initialValue) {
  const [view, setView] = React.useState(() => {
    if (typeof window === 'undefined') return initialValue
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY)
    return stored || initialValue
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(VIEW_STORAGE_KEY, view)
  }, [view])

  return [view, setView]
}

export default function CommunityPage() {
  const [rawEvents, setRawEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [filters, setFilters] = React.useState(buildFiltersDefaults)
  const [view, setView] = usePersistedView('list')
  const [selectedEvent, setSelectedEvent] = React.useState(null)
  const [highlightedSlug, setHighlightedSlug] = React.useState('')
  const [deepLinkSlug, setDeepLinkSlug] = React.useState('')
  const deepLinkResetRef = React.useRef({ slug: '', attempted: false })

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/events?scope=upcoming&status=published&includeStatus=true', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load events')
        return response.json()
      })
      .then((payload) => {
        if (cancelled) return
        setRawEvents(Array.isArray(payload.events) ? payload.events : [])
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const events = React.useMemo(() => hydrateEvents(rawEvents), [rawEvents])

  const visibleEvents = React.useMemo(
    () => events.filter((event) => !event.hidden && !event.archived),
    [events]
  )

  const featuredEvents = React.useMemo(
    () =>
      visibleEvents
        .filter((event) => event.featured && event.status === 'published')
        .slice(0, 6),
    [visibleEvents]
  )

  const { events: filteredEvents, rangeStart, rangeEnd } = React.useMemo(
    () => filterEvents(visibleEvents, filters),
    [visibleEvents, filters]
  )

  const monthlyEvents = React.useMemo(() => {
    if (!filteredEvents.length) return []

    const entries = new Map()

    for (const event of filteredEvents) {
      const occurrence = event.nextOccurrence || event.occurrences?.[0]
      const occurrenceDate = occurrence?.start instanceof Date ? occurrence.start : null

      let baseDate = occurrenceDate
      if (!baseDate && event.startDateObj instanceof Date) {
        baseDate = event.startDateObj
      }
      if (!baseDate && event.startDate) {
        const parsed = new Date(event.startDate)
        if (!Number.isNaN(parsed.getTime())) {
          baseDate = parsed
        }
      }

      if (!baseDate) continue

      const baseTime = baseDate.getTime()
      if (!Number.isFinite(baseTime)) continue

      const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`

      if (!entries.has(monthKey)) {
        entries.set(monthKey, {
          key: monthKey,
          label: monthFormatter.format(monthStart),
          monthStart,
          events: [],
        })
      }

      entries.get(monthKey).events.push({ event, sortDate: baseDate })
    }

    return Array.from(entries.values())
      .sort((a, b) => a.monthStart.getTime() - b.monthStart.getTime())
      .map((entry) => ({
        key: entry.key,
        label: entry.label,
        events: entry.events
          .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
          .map((item) => item.event),
      }))
  }, [filteredEvents])

  const structuredData = React.useMemo(() => getStructuredData(filteredEvents), [filteredEvents])

  const siteOrigin = React.useMemo(() => getSiteOrigin(), [])
  const communityEventsSchema = React.useMemo(() => {
    if (!filteredEvents.length) return null

    const eventsForSchema = filteredEvents.map((event) => {
      const start = event.nextOccurrence?.start || event.startDateObj || event.startDate
      const end = event.nextOccurrence?.end || event.endDateObj || event.endDate || start
      const imageUrl = event.image ? toAbsoluteUrl(event.image, siteOrigin) : undefined

      return {
        title: event.title,
        url: getCanonicalEventUrl(event.slug, siteOrigin),
        startDate: start instanceof Date ? start.toISOString() : start,
        endDate: end instanceof Date ? end.toISOString() : end,
        townName: event.town || event.subArea || '',
        venueName: event.locationName,
        imageUrl,
        description: event.summary || event.description || '',
      }
    })

    return buildCommunityEventsSchema({ events: eventsForSchema })
  }, [filteredEvents, siteOrigin])

  const pageDescription =
    COMMUNITY_ROUTE_META.description ||
    'Always-updated guide to NorthSide GTA events across Aurora, Uxbridge, Georgina, Stouffville, East Gwillimbury, Newmarket and Scugog.'

  const parseHashSlug = React.useCallback(() => {
    if (typeof window === 'undefined') return ''
    const { hash } = window.location
    if (!hash) return ''
    const cleaned = hash.replace(/^#/, '')
    if (!cleaned.startsWith('event-')) return ''
    return decodeURIComponent(cleaned.replace('event-', ''))
  }, [])

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleHashChange = () => {
      const slug = parseHashSlug()
      setDeepLinkSlug(slug)
    }
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [parseHashSlug])

  React.useEffect(() => {
    if (!deepLinkSlug) return
    const targetEvent = events.find((event) => event.slug === deepLinkSlug)
    if (!targetEvent) return

    if (deepLinkResetRef.current.slug !== deepLinkSlug) {
      deepLinkResetRef.current = { slug: deepLinkSlug, attempted: false }
    }

    setView('list')

    const tracker = deepLinkResetRef.current

    if (!filteredEvents.some((event) => event.slug === deepLinkSlug)) {
      if (!tracker.attempted) {
        tracker.attempted = true
        setFilters(buildFiltersDefaults())
      }
      return
    }

    setHighlightedSlug(deepLinkSlug)
    setSelectedEvent(targetEvent)

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const element = document.getElementById(`event-${deepLinkSlug}`)
        if (element && typeof element.scrollIntoView === 'function') {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    }
  }, [deepLinkSlug, events, filteredEvents, setFilters, setView])

  React.useEffect(() => {
    if (!highlightedSlug) return undefined
    if (typeof window === 'undefined') return undefined
    const timeout = window.setTimeout(() => setHighlightedSlug(''), 6000)
    return () => window.clearTimeout(timeout)
  }, [highlightedSlug])

  const handleResetFilters = () => {
    setFilters(buildFiltersDefaults())
  }

  const heroStyles = {
    backgroundImage: 'linear-gradient(135deg, rgba(15,23,42,0.75), rgba(8,47,73,0.55)), url(/Images/hero-desktop.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }

  const emptyState = (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
      No events match these filters yet.
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => setFilters({ ...filters, dateRange: 'today', customStart: '', customEnd: '' })}
          className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-slate-300 hover:text-slate-900"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setFilters({ ...filters, dateRange: 'weekend', customStart: '', customEnd: '' })}
          className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-slate-300 hover:text-slate-900"
        >
          This Weekend
        </button>
        <button
          type="button"
          onClick={() => handleResetFilters()}
          className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-slate-300 hover:text-slate-900"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )

  return (
    <>
      <DynamicMetaTags {...COMMUNITY_ROUTE_META} description={pageDescription}>
        {structuredData && (
          <script type="application/ld+json">{structuredData}</script>
        )}
      </DynamicMetaTags>
      {communityEventsSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(communityEventsSchema, null, 2)}</script>
        </Helmet>
      )}

      <HeaderShell />

      <main className="bg-slate-50">
        <section className="relative isolate overflow-hidden" style={heroStyles}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-slate-900/50 to-slate-900/30" aria-hidden="true" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center text-white">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">NorthSide Events Guide</h1>
            <p className="max-w-3xl text-lg text-slate-100">
              What’s on across the NorthSide GTA — events, festivals, family days, golf &amp; more.
            </p>
          </div>
        </section>

        {view === 'calendar' && (
          <>
            <div className="mx-auto mb-6 max-w-6xl px-4 pt-8 text-center sm:px-6">
              <p className="text-base font-medium text-slate-600 sm:text-lg">
                Discover what’s happening across the NorthSide GTA — events, markets, and more.
              </p>
            </div>
            <CalendarFilterBar
              selectedCategories={filters.categories}
              onSelectCategories={(categories) =>
                setFilters((prev) => ({ ...prev, categories }))
              }
              onClear={handleResetFilters}
            />
          </>
        )}
        {view === 'list' && (
          <CalendarFilterBar
            selectedCategories={filters.categories}
            onSelectCategories={(categories) =>
              setFilters((prev) => ({ ...prev, categories }))
            }
            onClear={handleResetFilters}
          />
        )}
        {view === 'map' && (
          <EventFilters filters={filters} onChange={setFilters} onReset={handleResetFilters} />
        )}

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">Browse events</h2>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 text-sm font-medium text-slate-600">
              {[
                { value: 'list', label: 'List', icon: List },
                { value: 'calendar', label: 'Calendar', icon: CalendarDays },
                { value: 'map', label: 'Map', icon: MapIcon },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
                    view === option.value
                      ? 'bg-brand-green text-white shadow-sm hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus-visible:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-pressed={view === option.value}
                >
                  <option.icon className="h-4 w-4" aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600 shadow-sm">
              Loading the latest events…
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
              Events are loading—check back soon.
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-12">
              {!visibleEvents.length ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
                  <p className="font-medium text-slate-800">Community events are temporarily unavailable.</p>
                  <p className="mt-2 text-slate-600">
                    Our external event feeds are not responding right now. Please check back soon or submit your own event while we reconnect.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <a
                      className="rounded-full bg-brand-green px-4 py-2 text-white shadow-sm transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)]"
                      href="/community/submit-event"
                    >
                      Submit an event
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {featuredEvents.length > 0 && (
                    <section className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold text-slate-900">Featured This Week</h3>
                        <p className="text-sm text-slate-500">
                          Highlighted picks editors love right now.
                        </p>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        {featuredEvents.map((event) => (
                          <EventCard
                            key={event.slug}
                            event={event}
                            onSelect={setSelectedEvent}
                            highlighted={highlightedSlug === event.slug}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {view === 'list' && (
                    <section className="space-y-10">
                      {monthlyEvents.length ? (
                        monthlyEvents.map((month) => (
                          <section key={month.key} className="space-y-4">
                            <div className="flex items-center gap-4">
                              <h4 className="text-lg font-semibold text-slate-900 sm:text-xl">{month.label}</h4>
                              <div className="hidden flex-1 border-t border-slate-200 sm:block" aria-hidden="true" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                              {month.events.map((event) => (
                                <EventCard
                                  key={event.slug}
                                  event={event}
                                  onSelect={setSelectedEvent}
                                  highlighted={highlightedSlug === event.slug}
                                  variant="compact"
                                />
                              ))}
                            </div>
                          </section>
                        ))
                      ) : (
                        emptyState
                      )}
                    </section>
                  )}

                  {view === 'calendar' && (
                    <section>
                      {filteredEvents.length ? (
                        <EventCalendar
                          events={filteredEvents}
                          initialMonth={rangeStart || new Date()}
                          onSelectEvent={setSelectedEvent}
                        />
                      ) : (
                        emptyState
                      )}
                    </section>
                  )}

                  {view === 'map' && (
                    <section>
                      {filteredEvents.length ? (
                        <React.Suspense fallback={null}>
                          <EventMap events={filteredEvents} onSelectEvent={setSelectedEvent} />
                        </React.Suspense>
                      ) : (
                        emptyState
                      )}
                    </section>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
            <header className="space-y-2 text-center">
              <h3 className="text-2xl font-semibold text-slate-900">Featured for NorthSide GTA</h3>
              <p className="text-sm text-slate-600">Guides, rankings, and premium ways to spotlight your community.</p>
            </header>
            <CommunityStories />
          </div>
        </section>

        <section className="bg-white py-6 text-center text-sm text-slate-600">
          Have an event to share?{' '}
          <a href="/community/submit-event" className="font-medium text-emerald-700 hover:underline">
            Submit it here
          </a>
          .
        </section>
      </main>

      <Footer />

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  )
}
const COMMUNITY_ROUTE_META = getStaticRouteMeta('/community') || {}
