import React from 'react'
import { DateTime } from 'luxon'
import { Search, ExternalLink, RefreshCw } from 'lucide-react'

const TORONTO_ZONE = 'America/Toronto'
const SYNC_SUMMARY_PATH = '/data/events/_sync-summary.json'
const CMS_SYNC_URL = '/cms#/collections/utilities/entries/sync-now'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'all', label: 'All' },
  { key: 'past', label: 'Past' },
  { key: 'archive', label: 'Archive' },
]

const STATUS_STYLES = {
  published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  draft: 'border-amber-200 bg-amber-50 text-amber-700',
  pending: 'border-sky-200 bg-sky-50 text-sky-700',
  archived: 'border-slate-200 bg-slate-100 text-slate-600',
}

const HIDDEN_STYLE = 'border-slate-200 bg-slate-100 text-slate-600'
const ARCHIVED_STYLE = 'border-slate-300 bg-slate-100 text-slate-600'

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStatus(value) {
  const normalized = clean(value).toLowerCase()
  if (!normalized) return 'draft'
  if (['draft', 'pending', 'published', 'archived'].includes(normalized)) {
    return normalized
  }
  return 'draft'
}

function formatSummaryRelativeTime(value) {
  if (!value) return ''
  const dt = DateTime.fromISO(String(value), { zone: TORONTO_ZONE })
  if (!dt.isValid) return ''
  const now = DateTime.now().setZone(TORONTO_ZONE)
  const todayStart = now.startOf('day')
  const yesterdayStart = todayStart.minus({ days: 1 })
  const fiveDaysAgo = todayStart.minus({ days: 5 })
  const timeLabel = dt.toFormat('h:mm a')

  if (dt >= todayStart && dt < todayStart.plus({ days: 1 })) {
    return `Today ${timeLabel}`
  }

  if (dt >= yesterdayStart && dt < todayStart) {
    return `Yesterday ${timeLabel}`
  }

  if (dt >= fiveDaysAgo) {
    return `${dt.toFormat('ccc')} ${timeLabel}`
  }

  return dt.toFormat('MMM d, yyyy h:mm a')
}

function formatStatusLabel(status) {
  if (!status) return 'Draft'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function parseDateTime(value) {
  if (!value) return null
  const dt = DateTime.fromISO(String(value), { zone: 'utc' })
  if (!dt.isValid) return null
  return dt.setZone(TORONTO_ZONE)
}

function formatWhen(start, end, allDay) {
  if (!start) return 'Date TBA'
  if (allDay) {
    if (end && end.hasSame(start, 'day')) {
      return `${start.toFormat('ccc, MMM d')} • All day`
    }
    if (end) {
      return `${start.toFormat('ccc, MMM d')} → ${end.toFormat('ccc, MMM d')}`
    }
    return `${start.toFormat('ccc, MMM d')} • All day`
  }
  if (end && end > start) {
    if (end.hasSame(start, 'day')) {
      return `${start.toFormat('ccc, MMM d')} • ${start.toFormat('h:mm a')} – ${end.toFormat('h:mm a')}`
    }
    return `${start.toFormat('ccc, MMM d h:mm a')} → ${end.toFormat('ccc, MMM d h:mm a')}`
  }
  return `${start.toFormat('ccc, MMM d')} • ${start.toFormat('h:mm a')}`
}

function formatWhere(city, venue) {
  const parts = []
  if (city) parts.push(city)
  if (venue) parts.push(venue)
  if (!parts.length) return 'Location TBA'
  return parts.join(' • ')
}

function buildCmsUrl(slug) {
  if (!slug) return ''
  return `/cms#/collections/events/entry/${slug}`
}

function normalizeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null
  const slug = clean(raw.slug || raw.id || raw.filePath || raw.__filename)
  if (!slug) return null

  const startDateTime = parseDateTime(raw.startDate || raw.start)
  const endDateTime = parseDateTime(raw.endDate || raw.end)
  const status = normalizeStatus(raw.status)
  const archived = Boolean(raw.archived) || status === 'archived'
  const hidden = Boolean(raw.hidden)
  const city =
    clean(raw.city) ||
    clean(raw.town) ||
    clean(raw?.location?.city) ||
    clean(raw.locationCity) ||
    ''
  const venue =
    clean(raw.locationName) ||
    clean(raw?.location?.name) ||
    clean(raw.locationVenue) ||
    ''

  const startMs = Number.isFinite(startDateTime?.toMillis())
    ? startDateTime.toMillis()
    : Number.POSITIVE_INFINITY
  const endMsCandidate = endDateTime?.toMillis()
  const endMs = Number.isFinite(endMsCandidate)
    ? endMsCandidate
    : Number.isFinite(startDateTime?.toMillis())
    ? startDateTime.toMillis()
    : Number.NEGATIVE_INFINITY

  return {
    slug,
    title: clean(raw.title) || 'Untitled event',
    status,
    statusLabel: formatStatusLabel(status),
    hidden,
    archived,
    allDay: Boolean(raw.allDay),
    startDateTime,
    endDateTime,
    whenLabel: formatWhen(startDateTime, endDateTime, Boolean(raw.allDay)),
    whereLabel: formatWhere(city, venue),
    city,
    venue,
    cmsUrl: buildCmsUrl(slug),
    searchText: `${clean(raw.title)} ${city} ${venue}`.toLowerCase(),
    startMs,
    endMs,
  }
}

function useEventsData() {
  const [events, setEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const fetchEvents = React.useCallback(() => {
    setLoading(true)
    setError('')
    fetch('/api/admin/events?scope=all', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load events')
        return response.json()
      })
      .then((payload) => {
        const rawEvents = Array.isArray(payload?.events) ? payload.events : []
        const normalized = rawEvents.map(normalizeEvent).filter(Boolean)
        setEvents(normalized)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[events-admin] failed to fetch events', err)
        setError('We could not load the events list. Try again in a moment.')
        setLoading(false)
      })
  }, [])

  React.useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

function useSyncSummary() {
  const [summary, setSummary] = React.useState(null)

  React.useEffect(() => {
    let cancelled = false

    fetch(SYNC_SUMMARY_PATH, { cache: 'no-store' })
      .then((response) => {
        if (response.status === 404) {
          return null
        }
        if (!response.ok) {
          throw new Error('Failed to load summary')
        }
        return response.json()
      })
      .then((data) => {
        if (cancelled) return
        if (data && typeof data === 'object') {
          setSummary(data)
        } else {
          setSummary(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return summary
}

function SyncSummaryBanner({ summary }) {
  if (!summary) return null

  const created = Number(summary.created) || 0
  const updated = Number(summary.updated) || 0
  const errors = Number(summary.errors) || 0
  const relative = formatSummaryRelativeTime(summary.lastChangeAt)

  if (!relative) return null

  const hasChanges = created > 0 || updated > 0
  const statusText = hasChanges
    ? `+${created} new, ${updated} updated`
    : 'no new events'
  const errorText = errors > 0 ? `, ${errors} errors` : ''

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="font-medium">
          Last change: {relative} — {statusText}
          {errorText}
        </p>
        <a
          href={CMS_SYNC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 transition hover:text-emerald-900"
        >
          Sync now
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}

function sortByStartAsc(a, b) {
  if (a.startMs !== b.startMs) return a.startMs - b.startMs
  return a.title.localeCompare(b.title)
}

function sortByStartDesc(a, b) {
  if (a.startMs !== b.startMs) return b.startMs - a.startMs
  return a.title.localeCompare(b.title)
}

function sortPastDesc(a, b) {
  if (a.endMs !== b.endMs) return b.endMs - a.endMs
  if (a.startMs !== b.startMs) return b.startMs - a.startMs
  return a.title.localeCompare(b.title)
}

function groupUpcomingEvents(events, todayStart, tomorrowStart) {
  const dayAfterTomorrow = tomorrowStart.plus({ days: 1 })
  const groups = [
    { key: 'today', label: 'TODAY', events: [] },
    { key: 'tomorrow', label: 'TOMORROW', events: [] },
    { key: 'later', label: 'LATER', events: [] },
  ]

  events.forEach((event) => {
    const start = event.startDateTime
    if (start && start >= todayStart && start < tomorrowStart) {
      groups[0].events.push(event)
    } else if (start && start >= tomorrowStart && start < dayAfterTomorrow) {
      groups[1].events.push(event)
    } else {
      groups[2].events.push(event)
    }
  })

  return groups.filter((group) => group.events.length > 0)
}

function useSelectedSet() {
  const [selectedIds, setSelectedIds] = React.useState(() => new Set())

  const toggle = React.useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clear = React.useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const setAll = React.useCallback((ids) => {
    setSelectedIds(new Set(ids))
  }, [])

  return { selectedIds, toggle, clear, setAll }
}

function EventTable({
  events,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) {
  if (!events.length) {
    return null
  }

  const allIds = events.map((event) => event.slug)
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id))

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="w-12 px-4 py-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll(event.target.checked, allIds)}
                />
                <span className="sr-only">Select all</span>
              </label>
            </th>
            <th className="px-4 py-3">Event</th>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Where</th>
            <th className="px-4 py-3 text-right">CMS Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {events.map((event) => {
            const statusClass = STATUS_STYLES[event.status] || STATUS_STYLES.draft
            return (
              <tr key={event.slug} className="align-top">
                <td className="px-4 py-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                      checked={selectedIds.has(event.slug)}
                      onChange={() => onToggleSelect(event.slug)}
                    />
                    <span className="sr-only">Select {event.title}</span>
                  </label>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">{event.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${statusClass}`}>
                          {event.statusLabel}
                        </span>
                        {event.hidden && (
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${HIDDEN_STYLE}`}>
                            Hidden
                          </span>
                        )}
                        {event.archived && (
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${ARCHIVED_STYLE}`}>
                            Archived
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                      <a
                        href={event.cmsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 transition hover:border-slate-300 hover:text-slate-900"
                        title="Open the event in Decap CMS"
                      >
                        Open in CMS
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                      <a
                        href={event.cmsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1 text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-900"
                        title="In CMS, set Status to Published and click Publish"
                      >
                        Publish in CMS
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                      <a
                        href={event.cmsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-3 py-1 text-sky-700 transition hover:border-sky-300 hover:text-sky-900"
                        title="In CMS, change Status to Draft or Pending and click Publish"
                      >
                        Unpublish in CMS
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                      <a
                        href={event.cmsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        title="In CMS, tick ‘Hide from public lists & sitemap’ then click Publish"
                      >
                        Toggle Hide in CMS
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-sm text-slate-600">{event.whenLabel}</td>
                <td className="px-4 py-4 align-top text-sm text-slate-600">{event.whereLabel}</td>
                <td className="px-4 py-4 align-top text-right text-xs text-slate-500">
                  <span className="block">Entry ID</span>
                  <span className="font-mono text-slate-700">{event.slug}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function EventsIndexPage() {
  const { events, loading, error, refetch } = useEventsData()
  const syncSummary = useSyncSummary()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('upcoming')
  const [showHidden, setShowHidden] = React.useState(false)
  const { selectedIds, toggle, clear, setAll } = useSelectedSet()

  const normalizedSearch = searchTerm.trim().toLowerCase()

  React.useEffect(() => {
    if (!events.length || selectedIds.size === 0) return
    const availableIds = new Set(events.map((event) => event.slug))
    const stale = [...selectedIds].filter((id) => !availableIds.has(id))
    if (stale.length) {
      const next = [...selectedIds].filter((id) => availableIds.has(id))
      setAll(next)
    }
  }, [events, selectedIds, setAll])

  const viewState = React.useMemo(() => {
    const now = DateTime.now().setZone(TORONTO_ZONE)
    const todayStart = now.startOf('day')
    const tomorrowStart = todayStart.plus({ days: 1 })

    const base = events.filter((event) => {
      if (activeTab === 'archive') {
        if (!event.archived) return false
        if (event.hidden) return false
        return true
      }

      if (!showHidden && event.hidden) {
        return false
      }

      if (activeTab === 'upcoming') {
        if (event.archived) return false
        if (!event.startDateTime) return false
        return event.startDateTime >= todayStart
      }

      if (activeTab === 'past') {
        const comparison = event.endDateTime || event.startDateTime
        if (!comparison) return false
        return comparison < todayStart
      }

      return true
    })

    const searched = normalizedSearch
      ? base.filter((event) => event.searchText.includes(normalizedSearch))
      : base

    let sorted
    if (activeTab === 'past') {
      sorted = [...searched].sort(sortPastDesc)
    } else if (activeTab === 'upcoming') {
      sorted = [...searched].sort(sortByStartAsc)
    } else if (activeTab === 'archive') {
      sorted = [...searched].sort(sortByStartDesc)
    } else {
      sorted = [...searched].sort(sortByStartAsc)
    }

    const groups = activeTab === 'upcoming' ? groupUpcomingEvents(sorted, todayStart, tomorrowStart) : null

    return { sorted, groups, todayStart, tomorrowStart }
  }, [events, activeTab, showHidden, normalizedSearch])

  const visibleEvents = viewState.sorted
  const selectedEvents = React.useMemo(
    () => events.filter((event) => selectedIds.has(event.slug)),
    [events, selectedIds]
  )
  const selectedCount = selectedEvents.length

  const handleToggleSelectAll = React.useCallback(
    (checked, ids) => {
      if (checked) {
        const merged = new Set(selectedIds)
        ids.forEach((id) => merged.add(id))
        setAll(merged)
      } else {
        const next = new Set(selectedIds)
        ids.forEach((id) => next.delete(id))
        setAll(next)
      }
    },
    [selectedIds, setAll]
  )

  const handleSelectAllVisible = React.useCallback(() => {
    if (!visibleEvents.length) {
      clear()
      return
    }
    const allIds = visibleEvents.map((event) => event.slug)
    const everySelected = allIds.every((id) => selectedIds.has(id))
    if (everySelected) {
      const next = new Set(selectedIds)
      allIds.forEach((id) => next.delete(id))
      setAll(next)
    } else {
      const next = new Set(selectedIds)
      allIds.forEach((id) => next.add(id))
      setAll(next)
    }
  }, [visibleEvents, selectedIds, setAll, clear])

  const handleOpenSelected = React.useCallback(() => {
    if (!selectedEvents.length) return
    selectedEvents.forEach((event, index) => {
      const delay = index * 40
      setTimeout(() => {
        window.open(event.cmsUrl, '_blank', 'noopener,noreferrer')
      }, delay)
    })
  }, [selectedEvents])

  const handleOpenSelectedToHide = React.useCallback(() => {
    if (!selectedEvents.length) return
    selectedEvents.forEach((event, index) => {
      const delay = index * 40
      setTimeout(() => {
        window.open(event.cmsUrl, '_blank', 'noopener,noreferrer')
      }, delay)
    })
  }, [selectedEvents])

  const hasResults = !loading && !error && visibleEvents.length > 0

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Events Moderation</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Review upcoming, past, and archived events without configuring any APIs. Search by title or city, then open entries in
                Decap CMS to publish, unpublish, hide, or update details.
              </p>
            </div>
            {!syncSummary && (
              <a
                href={CMS_SYNC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-900"
              >
                Sync now
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 flex max-w-6xl flex-col gap-6 px-4">
        <SyncSummaryBanner summary={syncSummary} />
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label htmlFor="events-search" className="sr-only">
                Search events
              </label>
              <input
                id="events-search"
                type="search"
                placeholder="Search by title or city…"
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={showHidden}
                onChange={(event) => setShowHidden(event.target.checked)}
              />
              Show hidden events
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-emerald-600 text-white shadow'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600 shadow-sm">
            Loading events…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-800">
            <p>{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-400 hover:text-rose-900"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {!loading && !error && !visibleEvents.length && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600 shadow-sm">
            No events match this view yet. Try another tab, adjust your search, or tick “Show hidden events.”
          </div>
        )}

        {hasResults && activeTab === 'upcoming' && viewState.groups && (
          <div className="space-y-6">
            {viewState.groups.map((group) => (
              <section key={group.key} className="space-y-3">
                <h2 className="px-1 text-xs font-semibold tracking-[0.2em] text-slate-500">{group.label}</h2>
                <EventTable
                  events={group.events}
                  selectedIds={selectedIds}
                  onToggleSelect={toggle}
                  onToggleSelectAll={handleToggleSelectAll}
                />
              </section>
            ))}
          </div>
        )}

        {hasResults && activeTab !== 'upcoming' && (
          <EventTable
            events={visibleEvents}
            selectedIds={selectedIds}
            onToggleSelect={toggle}
            onToggleSelectAll={handleToggleSelectAll}
          />
        )}

        {selectedCount > 0 && (
          <div className="sticky bottom-6 rounded-3xl border border-emerald-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedCount} selected</p>
                <p className="text-xs text-slate-600">Open the selected entries in CMS to publish, unpublish, or hide.</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-medium">
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Toggle select all in view
                </button>
                <button
                  type="button"
                  onClick={handleOpenSelected}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-900"
                  title="Open each selected entry in a new CMS tab to publish"
                >
                  Open selected to Publish in CMS
                </button>
                <button
                  type="button"
                  onClick={handleOpenSelectedToHide}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  title="Open each selected entry in a new CMS tab to hide"
                >
                  Open selected to Hide in CMS
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                >
                  Clear selection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
