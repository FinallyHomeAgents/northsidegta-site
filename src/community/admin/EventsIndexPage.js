import React from 'react'
import {
  LayoutGrid,
  Table as TableIcon,
  Search,
  ArrowUpDown,
  Trash2,
  X,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'

const headingFormatter = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const monthDayFormatter = new Intl.DateTimeFormat('en-CA', {
  month: 'short',
  day: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-CA', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function isSameDay(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function startOfDay(date) {
  if (!(date instanceof Date)) return null
  const copy = new Date(date.getTime())
  copy.setHours(0, 0, 0, 0)
  return copy
}

function normalizeMeridiem(value) {
  return value.replace(/\s?(a\.m\.|p\.m\.)/gi, (match) =>
    match.toLowerCase().includes('a') ? ' AM' : ' PM'
  )
}

function formatMonthDay(date) {
  if (!(date instanceof Date)) return ''
  const base = monthDayFormatter.format(date)
  const now = new Date()
  if (date.getFullYear() !== now.getFullYear()) {
    return `${base} ${date.getFullYear()}`
  }
  return base
}

function isAllDayEvent(start, end, explicitAllDay) {
  if (explicitAllDay) return true
  if (!(start instanceof Date) || !(end instanceof Date)) return false
  const startIsMidnight =
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    start.getSeconds() === 0
  const durationMs = end.getTime() - start.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000
  return startIsMidnight && Math.abs(durationMs - oneDayMs) < 1000
}

function formatTimeRange(start, end) {
  const startText = normalizeMeridiem(timeFormatter.format(start))
  const endText = normalizeMeridiem(timeFormatter.format(end))
  const startSuffixMatch = startText.match(/\s(AM|PM)$/)
  const endSuffixMatch = endText.match(/\s(AM|PM)$/)
  if (startSuffixMatch && endSuffixMatch && startSuffixMatch[0] === endSuffixMatch[0]) {
    const startWithoutMeridiem = startText.replace(/\s(AM|PM)$/, '')
    return `${startWithoutMeridiem}–${endText}`
  }
  return `${startText}–${endText}`
}

function formatWhen(start, end, allDay) {
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    return 'Date/Time TBA'
  }
  if (allDay) {
    return 'All day'
  }
  if (end instanceof Date && !Number.isNaN(end.getTime()) && isSameDay(start, end)) {
    return `${weekdayFormatter.format(start)}, ${formatTimeRange(start, end)}`
  }
  if (end instanceof Date && !Number.isNaN(end.getTime())) {
    const startPart = `${formatMonthDay(start)}, ${normalizeMeridiem(timeFormatter.format(start))}`
    const endPart = `${formatMonthDay(end)}, ${normalizeMeridiem(timeFormatter.format(end))}`
    return `${startPart} → ${endPart}`
  }
  return `${weekdayFormatter.format(start)}, ${normalizeMeridiem(timeFormatter.format(start))}`
}

function buildDayKey(start) {
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) return 'tba'
  const year = start.getFullYear()
  const month = `${start.getMonth() + 1}`.padStart(2, '0')
  const day = `${start.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildDayLabel(start) {
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) return 'Date TBA'
  const today = startOfDay(new Date())
  const tomorrow = today ? new Date(today.getTime()) : null
  if (tomorrow) {
    tomorrow.setDate(tomorrow.getDate() + 1)
  }
  if (today && isSameDay(start, today)) return 'Today'
  if (tomorrow && isSameDay(start, tomorrow)) return 'Tomorrow'
  return headingFormatter.format(start)
}

function buildWhere(city, locationName) {
  const parts = []
  if (city) parts.push(city)
  if (locationName) parts.push(locationName)
  if (!parts.length) return 'Location TBA'
  return parts.join(' • ')
}

function isPastEvent(start, end) {
  const now = Date.now()
  if (end instanceof Date && !Number.isNaN(end.getTime())) {
    return end.getTime() < now
  }
  if (start instanceof Date && !Number.isNaN(start.getTime())) {
    return start.getTime() < now
  }
  return false
}

function normalizeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = cleanString(raw.slug || raw.id || raw.filePath || raw.__filename || '').toLowerCase()
  if (!id) return null
  const title = cleanString(raw.title) || 'Untitled Event'
  const start = parseDate(raw.startDate || raw.start)
  const end = parseDate(raw.endDate || raw.end)
  const city = cleanString(raw.city) || cleanString(raw.town) || cleanString(raw?.location?.city)
  const locationName = cleanString(raw.locationName) || cleanString(raw?.location?.name)
  const url = cleanString(raw.url) || cleanString(raw.eventUrl)
  const allDay = isAllDayEvent(start, end, Boolean(raw.allDay))
  const when = formatWhen(start, end, allDay)
  const dayKey = buildDayKey(start)
  const dayLabel = buildDayLabel(start)
  const where = buildWhere(city, locationName)
  const startMs = start instanceof Date && !Number.isNaN(start.getTime()) ? start.getTime() : null
  const searchText = `${title} ${city} ${locationName}`.toLowerCase()
  return {
    id,
    title,
    start,
    end,
    startMs,
    city,
    locationName,
    where,
    when,
    dayKey,
    dayLabel,
    url,
    searchText,
    isPast: isPastEvent(start, end),
    raw,
  }
}

function normalizeEvents(rawEvents) {
  return rawEvents
    .map((event) => normalizeEvent(event))
    .filter(Boolean)
}

function groupEvents(events) {
  const groups = []
  const lookup = new Map()
  for (const event of events) {
    const key = event.dayKey
    if (!lookup.has(key)) {
      const group = { key, label: event.dayLabel, events: [] }
      lookup.set(key, group)
      groups.push(group)
    }
    lookup.get(key).events.push(event)
  }
  return groups
}

function compareEvents(a, b, direction) {
  const aTime = typeof a.startMs === 'number' ? a.startMs : null
  const bTime = typeof b.startMs === 'number' ? b.startMs : null
  if (aTime !== null && bTime !== null && aTime !== bTime) {
    return direction === 'asc' ? aTime - bTime : bTime - aTime
  }
  if (aTime !== null && bTime === null) {
    return direction === 'asc' ? -1 : 1
  }
  if (aTime === null && bTime !== null) {
    return direction === 'asc' ? 1 : -1
  }
  return a.title.localeCompare(b.title)
}

function useEventsData() {
  const [rawEvents, setRawEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const fetchEvents = React.useCallback(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetch('/api/events?status=all', { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load events')
        }
        return response.json()
      })
      .then((payload) => {
        setRawEvents(Array.isArray(payload.events) ? payload.events : [])
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.error('[events-admin] failed to fetch events', err)
        setError('We couldn\'t load the events list. Try again in a moment.')
        setLoading(false)
      })
    return () => controller.abort()
  }, [])

  React.useEffect(() => {
    const abort = fetchEvents()
    return () => {
      abort?.()
    }
  }, [fetchEvents])

  return { rawEvents, setRawEvents, loading, error, refetch: fetchEvents }
}

function useToastQueue() {
  const [toasts, setToasts] = React.useState([])
  const timeoutsRef = React.useRef(new Map())

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timeoutId = timeoutsRef.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutsRef.current.delete(id)
    }
  }, [])

  const addToast = React.useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const next = { id, duration: 6000, ...toast }
    setToasts((prev) => [...prev, next])
    if (next.duration !== null) {
      const timeoutId = setTimeout(() => removeToast(id), next.duration)
      timeoutsRef.current.set(id, timeoutId)
    }
    return id
  }, [removeToast])

  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
      timeoutsRef.current.clear()
    }
  }, [])

  return { toasts, addToast, removeToast }
}

function EventsToolbar({
  searchTerm,
  onSearchChange,
  sortDirection,
  onSortDirectionChange,
  viewMode,
  onViewModeChange,
  selectMode,
  onToggleSelectMode,
  disableSelectToggle,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <label htmlFor="events-search" className="sr-only">
            Search events
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="events-search"
            type="search"
            placeholder="Search by title or city…"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="events-sort" className="sr-only">
            Sort events
          </label>
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <select
              id="events-sort"
              value={sortDirection}
              onChange={(event) => onSortDirectionChange(event.target.value)}
              className="h-11 appearance-none rounded-full border border-slate-200 bg-white pl-9 pr-10 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="asc">Start date · Ascending</option>
              <option value="desc">Start date · Descending</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true">
              ▾
            </span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-500">
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:text-slate-900'
              }`}
              aria-pressed={viewMode === 'cards'}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:text-slate-900'
              }`}
              aria-pressed={viewMode === 'table'}
            >
              <TableIcon className="h-4 w-4" aria-hidden="true" />
              Table
            </button>
          </div>
          <button
            type="button"
            onClick={onToggleSelectMode}
            disabled={disableSelectToggle}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              selectMode
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900'
            } ${disableSelectToggle ? 'cursor-not-allowed opacity-60' : ''}`}
            aria-pressed={selectMode}
          >
            {selectMode ? 'Done' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CardsView({ events, selectMode, selectedIds, onToggleSelect, disabled }) {
  const groups = React.useMemo(() => groupEvents(events), [events])
  if (!groups.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600">
        No events match your filters.
      </div>
    )
  }
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.key} className="space-y-4">
          <div className="sticky top-0 z-10 -mx-4 flex items-center bg-slate-50/80 px-4 py-2 backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{group.label}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {group.events.map((event) => {
              const isChecked = selectedIds.has(event.id)
              return (
                <article
                  key={event.id}
                  className={`relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow ${
                    selectMode ? 'pl-12' : ''
                  }`}
                >
                  {selectMode && (
                    <div className="absolute left-4 top-5">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        aria-label={`Select ${event.title}`}
                        checked={isChecked}
                        onChange={(e) => onToggleSelect(event.id, e.target.checked)}
                        disabled={disabled}
                      />
                    </div>
                  )}
                  <header className="space-y-1">
                    <h3 className="truncate text-base font-semibold text-slate-900" title={event.title}>
                      {event.title}
                    </h3>
                  </header>
                  <dl className="space-y-2 text-sm">
                    <div className="flex gap-3 text-slate-600">
                      <dt className="min-w-[3rem] text-xs uppercase tracking-wide text-slate-400">When</dt>
                      <dd className="flex-1 text-slate-700">{event.when}</dd>
                    </div>
                    <div className="flex gap-3 text-slate-600">
                      <dt className="min-w-[3rem] text-xs uppercase tracking-wide text-slate-400">Where</dt>
                      <dd className="flex-1 text-slate-700">{event.where}</dd>
                    </div>
                  </dl>
                  {event.url && (
                    <div>
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                      >
                        Details
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function TableView({
  events,
  selectMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  disabled,
}) {
  const visibleIds = React.useMemo(() => events.map((event) => event.id), [events])
  const allSelected =
    selectMode && visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))
  const someSelected =
    selectMode && visibleIds.some((id) => selectedIds.has(id)) && !allSelected
  const headerCheckboxRef = React.useRef(null)

  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = Boolean(someSelected)
    }
  }, [someSelected])

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">
              {selectMode ? (
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  aria-label="Select all visible events"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  disabled={disabled}
                />
              ) : null}
            </th>
            <th scope="col" className="px-4 py-3 text-slate-600">
              Event
            </th>
            <th scope="col" className="px-4 py-3 text-slate-600">
              When
            </th>
            <th scope="col" className="px-4 py-3 text-slate-600">
              Where
            </th>
            <th scope="col" className="px-4 py-3 text-right text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {events.map((event) => {
            const isChecked = selectedIds.has(event.id)
            return (
              <tr key={event.id} className="align-top">
                <td className="px-4 py-3">
                  {selectMode ? (
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      aria-label={`Select ${event.title}`}
                      checked={isChecked}
                      onChange={(ev) => onToggleSelect(event.id, ev.target.checked)}
                      disabled={disabled}
                    />
                  ) : null}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                  {event.title}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{event.when}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{event.where}</td>
                <td className="px-4 py-3 text-right">
                  {event.url ? (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      Details
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">No link</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {!events.length && (
        <div className="px-6 py-12 text-center text-sm text-slate-600">No events match your filters.</div>
      )}
    </div>
  )
}

function BulkActionsBar({ count, onCancel, onDelete, disabled, deleting }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 md:top-0 md:bottom-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-emerald-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {deleting ? `Deleting ${count} event${count === 1 ? '' : 's'}…` : `${count} selected`}
            </p>
            <p className="text-xs text-slate-500">Selected events will disappear from the listings immediately.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={disabled}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete ({count})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  count,
  previewTitles,
  removeExternal,
  onToggleRemoveExternal,
  pastCount,
  deleting,
}) {
  const dialogRef = React.useRef(null)
  const previousActiveElement = React.useRef(null)

  React.useEffect(() => {
    if (!open) return undefined
    previousActiveElement.current = document.activeElement
    const node = dialogRef.current
    if (node) {
      const focusable = node.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length) {
        const first = focusable[0]
        window.requestAnimationFrame(() => {
          first.focus()
        })
      }
    }

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
      }
      if (event.key === 'Tab') {
        const focusable = node?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault()
            last.focus()
          }
        } else if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      const previous = previousActiveElement.current
      if (previous && typeof previous.focus === 'function') {
        previous.focus()
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 px-4 pb-10 pt-16 backdrop-blur sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-delete-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-full bg-rose-50 p-2 text-rose-600">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-3">
            <h2 id="bulk-delete-title" className="text-lg font-semibold text-slate-900">
              Delete {count} event{count === 1 ? '' : 's'}?
            </h2>
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-800">You\'re removing:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {previewTitles.map((title) => (
                  <li key={title}>{title}</li>
                ))}
                {count > previewTitles.length && (
                  <li className="text-slate-500">and {count - previewTitles.length} more…</li>
                )}
              </ul>
            </div>
            {pastCount > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <p>
                  {pastCount === 1
                    ? 'The selected event already happened. Deleting it will remove it from the public listings.'
                    : `${pastCount} of the selected events have already happened. Deleting them will remove them from the public listings.`}
                </p>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                checked={removeExternal}
                onChange={(event) => onToggleRemoveExternal(event.target.checked)}
                disabled={deleting}
              />
              Also remove from external sources if applicable
            </label>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? 'Deleting…' : `Delete ${count}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div className="flex w-full max-w-xl flex-col gap-3" role="status" aria-live="assertive">
        {toasts.map((toast) => {
          const tone = toast.tone || 'info'
          const palette = {
            success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            warning: 'bg-amber-50 border-amber-200 text-amber-900',
            danger: 'bg-rose-50 border-rose-200 text-rose-900',
            info: 'bg-slate-50 border-slate-200 text-slate-900',
          }[tone]
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border p-4 shadow ${palette}`}
            >
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{toast.title}</p>
                {toast.message && <p className="text-slate-600">{toast.message}</p>}
                {toast.actionLabel && toast.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.onAction()
                      onDismiss(toast.id)
                    }}
                    className="rounded-full border border-current px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function EventsIndexPage() {
  const { rawEvents, setRawEvents, loading, error, refetch } = useEventsData()
  const [viewMode, setViewMode] = React.useState('cards')
  const [sortDirection, setSortDirection] = React.useState('asc')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectMode, setSelectMode] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState(() => new Set())
  const [modalOpen, setModalOpen] = React.useState(false)
  const [removeExternal, setRemoveExternal] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const { toasts, addToast, removeToast } = useToastQueue()

  const events = React.useMemo(() => normalizeEvents(rawEvents), [rawEvents])

  const eventMap = React.useMemo(() => {
    const map = new Map()
    events.forEach((event) => map.set(event.id, event))
    return map
  }, [events])

  React.useEffect(() => {
    setSelectedIds((prev) => {
      const available = new Set(events.map((event) => event.id))
      let changed = false
      const next = new Set()
      prev.forEach((id) => {
        if (available.has(id)) {
          next.add(id)
        } else {
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [events])

  const trimmedSearch = searchTerm.trim().toLowerCase()

  const sortedEvents = React.useMemo(() => {
    const items = [...events]
    items.sort((a, b) => compareEvents(a, b, sortDirection))
    if (!trimmedSearch) return items
    return items.filter((event) => event.searchText.includes(trimmedSearch))
  }, [events, sortDirection, trimmedSearch])

  const selectedCount = selectedIds.size
  const selectedEvents = React.useMemo(
    () => Array.from(selectedIds).map((id) => eventMap.get(id)).filter(Boolean),
    [selectedIds, eventMap]
  )
  const pastSelectedCount = selectedEvents.filter((event) => event.isPast).length

  const handleToggleSelect = React.useCallback((id, checked) => {
    const safeId = cleanString(id).toLowerCase()
    if (!safeId) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(safeId)
      } else {
        next.delete(safeId)
      }
      return next
    })
  }, [])

  const handleToggleSelectAll = React.useCallback((checked, targetEvents) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        targetEvents.forEach((event) => {
          const safeId = cleanString(event.id).toLowerCase()
          if (safeId) {
            next.add(safeId)
          }
        })
      } else {
        targetEvents.forEach((event) => {
          const safeId = cleanString(event.id).toLowerCase()
          if (safeId) {
            next.delete(safeId)
          }
        })
      }
      return next
    })
  }, [])

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleCloseModal = React.useCallback(() => {
    if (deleting) return
    setModalOpen(false)
    setRemoveExternal(false)
  }, [deleting])

  const handleBulkDelete = React.useCallback(
    async (ids, removeExternalFlag) => {
      if (!ids.length) return
      setDeleting(true)
      try {
        const normalizedIds = Array.from(
          new Set(ids.map((value) => cleanString(value).toLowerCase()).filter(Boolean))
        )
        if (!normalizedIds.length) {
          setDeleting(false)
          return
        }
        const response = await fetch('/api/events/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: normalizedIds, removeExternal: Boolean(removeExternalFlag) }),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.error || 'Bulk delete failed')
        }
        const results = Array.isArray(payload.results) ? payload.results : []
        const succeeded = results
          .filter((result) => result && result.ok)
          .map((result) => cleanString(result.id).toLowerCase())
          .filter(Boolean)
        const failed = results.filter((result) => !result?.ok)

        if (succeeded.length) {
          const succeededSet = new Set(succeeded)
          setRawEvents((prev) =>
            prev.filter((event) => {
              const id = cleanString(event.slug || event.id).toLowerCase()
              return !succeededSet.has(id)
            })
          )
          setSelectedIds((prev) => {
            const next = new Set(prev)
            succeeded.forEach((id) => next.delete(id))
            return next
          })
        }

        if (!failed.length) {
          addToast({
            tone: 'success',
            title: `Deleted ${succeeded.length} event${succeeded.length === 1 ? '' : 's'}.`,
          })
          setModalOpen(false)
          setRemoveExternal(false)
          if (!selectMode) {
            clearSelection()
          }
        } else {
          const failedIds = failed
            .map((item) => cleanString(item.id).toLowerCase())
            .filter(Boolean)
          setSelectedIds(new Set(failedIds))
          setModalOpen(false)
          setRemoveExternal(false)
          addToast({
            tone: 'warning',
            title: 'Some events could not be deleted.',
            message: failed
              .slice(0, 3)
              .map((item) => item?.message || item?.id)
              .join(' • '),
            actionLabel: 'Retry failed',
            onAction: () => {
              handleBulkDelete(failedIds, removeExternalFlag)
            },
          })
        }
      } catch (error) {
        console.error('[events-admin] bulk delete failed', error)
        addToast({
          tone: 'danger',
          title: 'Delete failed',
          message: 'We could not remove those events. Please try again.',
        })
      } finally {
        setDeleting(false)
      }
    },
    [addToast, clearSelection, selectMode, setRawEvents]
  )

  const handleConfirmDelete = React.useCallback(() => {
    const ids = Array.from(selectedIds)
    if (!ids.length) return
    handleBulkDelete(ids, removeExternal)
  }, [handleBulkDelete, removeExternal, selectedIds])

  const handleOpenModal = React.useCallback(() => {
    if (!selectedCount) return
    setModalOpen(true)
  }, [selectedCount])

  const disableSelectToggle = deleting

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Community Events</h1>
            <p className="text-sm text-slate-500">Manage upcoming listings without leaving the index.</p>
          </div>
          <a
            href="/cms/#/collections/events/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            New Event
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <EventsToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectMode={selectMode}
          onToggleSelectMode={() => {
            setSelectMode((prev) => {
              if (prev) {
                clearSelection()
              }
              return !prev
            })
          }}
          disableSelectToggle={disableSelectToggle}
        />

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
              className="mt-4 rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-400 hover:text-rose-900"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && !sortedEvents.length && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600">
            No events found. Use the New Event button to add one.
          </div>
        )}

        {!loading && !error && sortedEvents.length > 0 && (
          <>
            {viewMode === 'cards' ? (
              <CardsView
                events={sortedEvents}
                selectMode={selectMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                disabled={deleting}
              />
            ) : (
              <TableView
                events={sortedEvents}
                selectMode={selectMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={(checked) => handleToggleSelectAll(checked, sortedEvents)}
                disabled={deleting}
              />
            )}
          </>
        )}
      </main>

      {selectMode && selectedCount > 0 && (
        <BulkActionsBar
          count={selectedCount}
          onCancel={() => {
            clearSelection()
            setSelectMode(false)
          }}
          onDelete={handleOpenModal}
          disabled={deleting}
          deleting={deleting}
        />
      )}

      <DeleteConfirmationModal
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        count={selectedCount}
        previewTitles={selectedEvents.slice(0, 3).map((event) => event.title)}
        removeExternal={removeExternal}
        onToggleRemoveExternal={setRemoveExternal}
        pastCount={pastSelectedCount}
        deleting={deleting}
      />

      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
