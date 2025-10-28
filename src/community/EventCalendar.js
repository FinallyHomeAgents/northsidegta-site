import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateRange } from './eventUtils'

const BRAND_GREEN = '#32610E'

const monthFormatter = new Intl.DateTimeFormat('en-CA', {
  month: 'long',
  year: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
})

const longWeekdayFormatter = new Intl.DateTimeFormat('en-CA', {
  weekday: 'long',
})

const mobileDateFormatter = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const desktopDateFormatter = new Intl.DateTimeFormat('en-CA', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

const SUMMARY_LABELS = {
  Family: 'family fun',
  Festivals: 'festivals',
  Sports: 'sports',
  Golf: 'golf days',
  Markets: 'markets',
  'Arts & Culture': 'arts & culture',
  Outdoors: 'outdoor adventures',
  Other: 'community happenings',
}

const CATEGORY_STYLES = {
  Family: {
    background: 'linear-gradient(135deg, rgba(50, 97, 14, 0.18), rgba(50, 97, 14, 0.08))',
    dot: '#32610E',
  },
  Festivals: {
    background: 'linear-gradient(135deg, rgba(50, 97, 14, 0.2), rgba(255, 214, 94, 0.4))',
    dot: '#D97706',
  },
  Sports: {
    background: 'linear-gradient(135deg, rgba(50, 97, 14, 0.16), rgba(59, 130, 246, 0.25))',
    dot: '#2563EB',
  },
  Golf: {
    background: 'linear-gradient(135deg, rgba(50, 97, 14, 0.24), rgba(209, 250, 229, 0.5))',
    dot: '#10B981',
  },
  Markets: {
    background: 'linear-gradient(135deg, rgba(50, 97, 14, 0.18), rgba(245, 158, 11, 0.3))',
    dot: '#F59E0B',
  },
  'Arts & Culture': {
    background: 'linear-gradient(135deg, rgba(50, 97, 14, 0.18), rgba(192, 132, 252, 0.35))',
    dot: '#A855F7',
  },
  Outdoors: {
    background: 'linear-gradient(135deg, rgba(50, 97, 14, 0.24), rgba(134, 239, 172, 0.4))',
    dot: '#047857',
  },
  Other: {
    background: 'linear-gradient(135deg, rgba(50, 97, 14, 0.18), rgba(148, 163, 184, 0.32))',
    dot: '#475569',
  },
}

const DEFAULT_DAY_STYLE = {
  background: 'linear-gradient(135deg, rgba(50, 97, 14, 0.15), rgba(50, 97, 14, 0.05))',
  dot: BRAND_GREEN,
}

export default function EventCalendar({ events, initialMonth, onSelectEvent }) {
  const defaultMonth = initialMonth ? startOfMonth(initialMonth) : startOfMonth(new Date())
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth)
  const [selectedDayKey, setSelectedDayKey] = React.useState('')
  const [expandedMobileDay, setExpandedMobileDay] = React.useState('')

  React.useEffect(() => {
    if (initialMonth) {
      setCurrentMonth(startOfMonth(initialMonth))
    }
  }, [initialMonth])

  const monthData = React.useMemo(() => buildCalendarMonth(events, currentMonth), [events, currentMonth])

  React.useEffect(() => {
    if (!monthData?.days?.length) return
    const firstActive = monthData.days.find((day) => day.events.length > 0)
    setSelectedDayKey((previous) => {
      if (previous && monthData.days.some((day) => day.key === previous)) {
        return previous
      }
      return firstActive?.key || monthData.days[0]?.key || ''
    })
    setExpandedMobileDay(firstActive?.key || '')
  }, [monthData])

  const selectedDay = React.useMemo(
    () => monthData.days.find((day) => day.key === selectedDayKey) || monthData.days[0] || null,
    [monthData, selectedDayKey]
  )

  const activeDays = React.useMemo(() => monthData.days.filter((day) => day.events.length > 0), [monthData.days])

  const handlePrevious = () => setCurrentMonth((prev) => addMonths(prev, -1))
  const handleNext = () => setCurrentMonth((prev) => addMonths(prev, 1))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">NorthSide GTA Calendar</p>
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">{monthData.label}</h2>
          <p className="text-sm text-slate-600 md:text-base">{monthData.summary}</p>
        </div>
        <div className="hidden items-center justify-center gap-3 md:flex">
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32610E]/40"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32610E]/40"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="hidden gap-6 md:grid md:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={index}>{weekdayFormatter.format(addDays(startOfWeek(currentMonth), index))}</span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-7 gap-3">
            {monthData.days.map((day) => {
              const hasEvents = day.events.length > 0
              const isSelected = selectedDay?.key === day.key
              const style = hasEvents ? getDayStyle(day.events[0]?.event?.category) : null
              return (
                <button
                  type="button"
                  key={day.key}
                  onClick={() => setSelectedDayKey(day.key)}
                  className={`group relative flex min-h-[120px] flex-col rounded-2xl border bg-white p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32610E]/40 ${
                    hasEvents
                      ? 'border-transparent shadow-sm'
                      : 'border-dashed border-slate-200 text-slate-400 hover:border-slate-300'
                  } ${
                    isSelected ? 'ring-2 ring-offset-2 ring-[#32610E]' : ''
                  } ${
                    !day.isCurrentMonth ? 'opacity-60' : ''
                  }`}
                  style={hasEvents ? { background: style.background } : undefined}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{day.date.getDate()}</span>
                    {day.isToday && <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-[#32610E]">Today</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {day.events.slice(0, 6).map(({ event, occurrence }) => (
                      <div key={occurrence.key} className="group/calendar relative">
                        <span
                          className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-white shadow"
                          style={{ backgroundColor: getDayStyle(event.category).dot }}
                        />
                        <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-52 -translate-x-1/2 translate-y-3 rounded-2xl border border-slate-100 bg-white p-3 text-left text-xs shadow-2xl group-hover/calendar:flex">
                          {event.image && (
                            <div className="mb-2 overflow-hidden rounded-xl bg-slate-100">
                              <img src={event.image} alt={event.title} className="h-24 w-full object-contain" />
                            </div>
                          )}
                          <p className="font-semibold text-slate-900">{event.title}</p>
                          <p className="mt-1 text-[11px] font-medium text-[#32610E]">
                            {formatDateRange(occurrence, occurrence?.allDay ?? event.allDay)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {day.events.length > 6 && (
                      <span className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-full bg-white/80 px-2 text-[11px] font-semibold text-[#32610E]">
                        +{day.events.length - 6}
                      </span>
                    )}
                  </div>
                  {hasEvents && (
                    <span className="mt-auto text-[11px] font-medium uppercase tracking-wide text-[#32610E]/70">
                      {day.events.length} event{day.events.length === 1 ? '' : 's'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <aside className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          {selectedDay && selectedDay.events.length > 0 ? (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{longWeekdayFormatter.format(selectedDay.date)}</p>
                <p className="text-xl font-semibold text-slate-900">{desktopDateFormatter.format(selectedDay.date)}</p>
              </div>
              <div className="space-y-5">
                {selectedDay.events.map(({ event, occurrence }) => (
                  <button
                    key={occurrence.key}
                    type="button"
                    onClick={() => onSelectEvent?.(event)}
                    className="w-full rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32610E]/40"
                  >
                    {event.image && (
                      <div className="overflow-hidden rounded-t-2xl bg-slate-50">
                        <img src={event.image} alt={event.title} className="h-40 w-full object-contain" />
                      </div>
                    )}
                    <div className="space-y-2 p-4">
                      <span className="inline-flex items-center rounded-full bg-[#32610E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#32610E]">
                        {event.category || 'Community'}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                      <p className="text-sm font-medium text-[#32610E]">
                        {formatDateRange(occurrence, occurrence?.allDay ?? event.allDay)}
                      </p>
                      {event.locationName || event.town ? (
                        <p className="text-sm text-slate-600">{event.locationName || event.town}</p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-500">
              Select a day with events to see the details here.
            </div>
          )}
        </aside>
      </div>

      <div className="space-y-4 md:hidden">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">{monthData.label}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600">{monthData.summary}</p>
        </div>

        {activeDays.length ? (
          <div className="space-y-3">
            {activeDays.map((day) => {
              const isOpen = expandedMobileDay === day.key
              return (
                <div key={day.key} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
                  <button
                    type="button"
                    onClick={() => setExpandedMobileDay((prev) => (prev === day.key ? '' : day.key))}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    aria-expanded={isOpen}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        {weekdayFormatter.format(day.date)}
                      </p>
                      <p className="text-base font-semibold text-slate-900">
                        {mobileDateFormatter.format(day.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#32610E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#32610E]">
                        {day.events.length} event{day.events.length === 1 ? '' : 's'}
                      </span>
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#32610E]/20 text-[#32610E] transition ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      >
                        ›
                      </span>
                    </div>
                  </button>
                  <div className={`space-y-4 px-4 pb-4 ${isOpen ? 'block' : 'hidden'}`}>
                    {day.events.map(({ event, occurrence }) => (
                      <button
                        key={occurrence.key}
                        type="button"
                        onClick={() => onSelectEvent?.(event)}
                        className="w-full rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32610E]/40"
                      >
                        {event.image && (
                          <div className="overflow-hidden rounded-t-2xl bg-slate-50">
                            <img src={event.image} alt={event.title} className="h-48 w-full object-contain" />
                          </div>
                        )}
                        <div className="space-y-2 p-4">
                          <span className="inline-flex items-center rounded-full bg-[#32610E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#32610E]">
                            {event.category || 'Community'}
                          </span>
                          <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                          <p className="text-sm font-medium text-[#32610E]">
                            {formatDateRange(occurrence, occurrence?.allDay ?? event.allDay)}
                          </p>
                          {event.locationName || event.town ? (
                            <p className="text-sm text-slate-600">{event.locationName || event.town}</p>
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            No events yet for this month — check back soon.
          </div>
        )}
      </div>
    </div>
  )
}

function startOfMonth(date) {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfMonth(date) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  d.setHours(23, 59, 59, 999)
  return d
}

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() + (6 - day)
  d.setDate(diff)
  d.setHours(23, 59, 59, 999)
  return d
}

function addMonths(date, amount) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + amount)
  return d
}

function addDays(date, amount) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

function buildCalendarMonth(events, month) {
  const start = startOfWeek(startOfMonth(month))
  const end = endOfWeek(endOfMonth(month))
  const days = []

  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    const dayStart = new Date(cursor)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(cursor)
    dayEnd.setHours(23, 59, 59, 999)

    const dayEvents = []
    events.forEach((event) => {
      event.occurrences.forEach((occurrence) => {
        if (occurrence.start <= dayEnd && occurrence.end >= dayStart) {
          dayEvents.push({ event, occurrence })
        }
      })
    })

    dayEvents.sort((a, b) => a.occurrence.start - b.occurrence.start)

    days.push({
      key: cursor.toISOString(),
      date: new Date(cursor),
      events: dayEvents,
      isCurrentMonth: isSameMonth(cursor, month),
      isToday: isSameDay(new Date(), cursor),
    })
  }

  const eventCount = days.reduce((count, day) => count + day.events.length, 0)
  const categoryCounts = new Map()
  days.forEach((day) => {
    day.events.forEach(({ event }) => {
      if (!event?.category) return
      const current = categoryCounts.get(event.category) || 0
      categoryCounts.set(event.category, current + 1)
    })
  })

  const summary = buildMonthSummary(eventCount, categoryCounts)

  return {
    key: `${month.getFullYear()}-${month.getMonth() + 1}`,
    label: monthFormatter.format(month),
    summary,
    days,
  }
}

function buildMonthSummary(eventCount, categoryCounts) {
  if (!eventCount) {
    return 'No events yet — check back soon for fresh happenings.'
  }

  const sortedCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => SUMMARY_LABELS[category] || category.toLowerCase())
    .slice(0, 3)

  if (!sortedCategories.length) {
    return `${eventCount} community event${eventCount === 1 ? '' : 's'} this month.`
  }

  const categoryLine = formatCategoryLine(sortedCategories)
  return `${eventCount} community event${eventCount === 1 ? '' : 's'} this month — ${categoryLine}.`
}

function formatCategoryLine(categories) {
  if (categories.length === 1) return categories[0]
  if (categories.length === 2) return `${categories[0]} & ${categories[1]}`
  return `${categories[0]}, ${categories[1]} & ${categories[2]}`
}

function getDayStyle(category) {
  if (!category) return DEFAULT_DAY_STYLE
  return CATEGORY_STYLES[category] || DEFAULT_DAY_STYLE
}
