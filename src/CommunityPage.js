// src/CommunityPage.js
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { CalendarDays, List, Map as MapIcon } from 'lucide-react'
import Navigation from './Navigation'
import Footer from './Footer'
import EventFilters from './community/EventFilters'
import EventCard from './community/EventCard'
import EventCalendar from './community/EventCalendar'
import EventMap from './community/EventMap'
import EventModal from './community/EventModal'
import CommunityStories from './community/CommunityStories'
import {
  buildFiltersDefaults,
  filterEvents,
  getStructuredData,
  hydrateEvents,
} from './community/eventUtils'

const VIEW_STORAGE_KEY = 'northside-community-view'

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

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/events?status=published', { cache: 'no-store' })
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

  const featuredEvents = React.useMemo(
    () => events.filter((event) => event.featured && event.status === 'published').slice(0, 6),
    [events]
  )

  const { events: filteredEvents, rangeStart, rangeEnd } = React.useMemo(
    () => filterEvents(events, filters),
    [events, filters]
  )

  const structuredData = React.useMemo(() => getStructuredData(filteredEvents), [filteredEvents])

  const pageDescription =
    'Always-updated guide to NorthSide GTA events across Aurora, Uxbridge, Georgina, Stouffville, East Gwillimbury, Newmarket and Scugog.'

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
      <Helmet>
        <title>NorthSide GTA Events | What&apos;s On Across Aurora, Uxbridge &amp; Beyond</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href="https://www.northsidegta.ca/community" />
        <meta property="og:title" content="NorthSide GTA Events" />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.northsidegta.ca/community" />
        <meta property="og:image" content="/Images/hero-desktop.jpg" />
        {structuredData && (
          <script type="application/ld+json">{structuredData}</script>
        )}
      </Helmet>

      <Navigation />

      <main className="bg-slate-50">
        <section className="relative isolate overflow-hidden" style={heroStyles}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-slate-900/50 to-slate-900/30" aria-hidden="true" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center text-white">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">What’s On Across the NorthSide GTA</h1>
            <p className="max-w-3xl text-lg text-slate-100">
              Events, festivals, family days, golf &amp; more — updated often.
            </p>
          </div>
        </section>

        <EventFilters filters={filters} onChange={setFilters} onReset={handleResetFilters} />

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
                      ? 'bg-emerald-600 text-white shadow-sm'
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
                      <EventCard key={event.slug} event={event} onSelect={setSelectedEvent} />
                    ))}
                  </div>
                </section>
              )}

              {view === 'list' && (
                <section className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.slug} event={event} onSelect={setSelectedEvent} />
                    ))}
                  </div>
                  {!filteredEvents.length && emptyState}
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
                    <EventMap events={filteredEvents} onSelectEvent={setSelectedEvent} />
                  ) : (
                    emptyState
                  )}
                </section>
              )}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
            <header className="space-y-2 text-center">
              <h3 className="text-2xl font-semibold text-slate-900">Community Stories</h3>
              <p className="text-sm text-slate-600">
                Reader favourites, local guides and NorthSide happenings.
              </p>
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
