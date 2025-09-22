import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateRange } from './eventUtils'

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

const monthFormatter = new Intl.DateTimeFormat('en-CA', {
  month: 'long',
  year: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
})

export default function EventCalendar({ events, initialMonth, onSelectEvent }) {
  const defaultMonth = initialMonth ? startOfMonth(initialMonth) : startOfMonth(new Date())
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth)

  React.useEffect(() => {
    if (initialMonth) {
      setCurrentMonth(startOfMonth(initialMonth))
    }
  }, [initialMonth])

  const days = React.useMemo(() => buildCalendarDays(events, currentMonth), [events, currentMonth])

  const handlePrevious = () => setCurrentMonth((prev) => addMonths(prev, -1))
  const handleNext = () => setCurrentMonth((prev) => addMonths(prev, 1))

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <button
          type="button"
          onClick={handlePrevious}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900">{monthFormatter.format(currentMonth)}</h3>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="border-r border-slate-200 py-3 last:border-r-0">
            {weekdayFormatter.format(addDays(startOfWeek(currentMonth), index))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => (
          <div
            key={day.key}
            className={`min-h-[140px] border-r border-b border-slate-200 p-3 text-left ${
              isSameMonth(day.date, currentMonth) ? 'bg-white' : 'bg-slate-50'
            }`}
          >
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{day.date.getDate()}</span>
              {day.events.length > 3 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  +{day.events.length - 3}
                </span>
              )}
            </div>
            <ul className="space-y-1">
              {day.events.slice(0, 3).map(({ event, occurrence }) => (
                <li key={occurrence.key}>
                  <button
                    type="button"
                    onClick={() => onSelectEvent?.(event)}
                    className="w-full rounded-lg bg-emerald-50 px-2 py-1 text-left text-[11px] font-medium text-emerald-800 hover:bg-emerald-100"
                  >
                    <span className="block truncate">{event.title}</span>
                    <span className="block text-[10px] font-normal text-emerald-700">
                      {formatDateRange(occurrence, event.allDay)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildCalendarDays(events, month) {
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
      key: `${cursor.toISOString()}`,
      date: new Date(cursor),
      events: dayEvents,
    })
  }

  return days
}
