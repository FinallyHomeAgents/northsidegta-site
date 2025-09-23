import React from 'react'
import { Search } from 'lucide-react'
import { CATEGORY_OPTIONS, PRICE_OPTIONS, TOWN_OPTIONS } from './eventUtils'
import './EventFilters.css'
import './filters.compact.css'

const DATE_RANGES = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
]

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setPrefers(media.matches)
    handler()
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  return prefers
}

function toggleValue(list, value) {
  const set = new Set(list)
  if (set.has(value)) {
    set.delete(value)
  } else {
    set.add(value)
  }
  return Array.from(set)
}

const FILTERS_OPEN_STORAGE_KEY = 'communityFiltersOpen'

export default function EventFilters({ filters, onChange, onReset }) {
  const [isOpen, setIsOpen] = React.useState(() => {
    if (typeof window === 'undefined') return false
    const stored = window.sessionStorage.getItem(FILTERS_OPEN_STORAGE_KEY)
    return stored === 'true'
  })
  const prefersReducedMotion = usePrefersReducedMotion()
  const interactiveClass = prefersReducedMotion ? '' : 'transition'
  const searchInputRef = React.useRef(null)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem(FILTERS_OPEN_STORAGE_KEY, isOpen ? 'true' : 'false')
  }, [isOpen])

  const focusSearch = React.useCallback(() => {
    setIsOpen(true)
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        searchInputRef.current?.focus()
      })
    } else {
      searchInputRef.current?.focus()
    }
  }, [])

  const toggleOpen = React.useCallback(() => {
    setIsOpen((value) => !value)
  }, [])

  const activeCount = React.useMemo(() => {
    let count = 0
    if (filters.search?.trim()) count += 1
    if (filters.dateRange && filters.dateRange !== 'upcoming') {
      count += 1
      if (filters.dateRange === 'custom') {
        if (filters.customStart) count += 1
        if (filters.customEnd) count += 1
      }
    }
    count += filters.categories?.length || 0
    count += filters.towns?.length || 0
    count += filters.price?.length || 0
    if (filters.showPast) count += 1
    return count
  }, [filters])

  const setFilter = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div id="community-filters" className="w-full">
        <div className="filters-toolbar">
          <button className="btn-icon" type="button" aria-label="Search" onClick={focusSearch}>
            🔍
          </button>
          <div className="toolbar-summary">
            <span className="summary-label">Filters</span>
            <span className="summary-count" aria-live="polite">
              ({activeCount})
            </span>
          </div>
          <div className="toolbar-actions">
            <button
              className="btn-link"
              type="button"
              onClick={toggleOpen}
              aria-expanded={isOpen}
              aria-controls="filters-panel"
            >
              {isOpen ? 'Collapse' : 'Expand'}
            </button>
            <button className="btn-link danger" type="button" onClick={() => onReset?.()}>
              Reset
            </button>
          </div>
        </div>

        <div
          id="filters-panel"
          className={`filters-panel ${isOpen ? 'open' : 'collapsed'}`}
          aria-hidden={!isOpen}
        >
          <div className="community-filters">
            <div className="community-filters__header">
              <label className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 filters-search">
                <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span className="sr-only">Search events</span>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search events"
                  className="w-full border-none bg-transparent text-sm outline-none"
                  value={filters.search}
                  onChange={(event) => setFilter('search', event.target.value)}
                />
              </label>
            </div>

            <div className="community-filters__grid">
              <fieldset className="community-filters__fieldset">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date range
                </legend>
                <div className="community-filters__chip-list flex flex-wrap gap-2">
                  {DATE_RANGES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFilter('dateRange', option.value)}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${interactiveClass} ${
                        filters.dateRange === option.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {filters.dateRange === 'custom' && (
                  <div className="community-filters__custom-range flex flex-col gap-2 sm:flex-row">
                    <label className="flex flex-col text-xs text-slate-500">
                      From
                      <input
                        type="date"
                        className="mt-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                        value={filters.customStart}
                        onChange={(event) => setFilter('customStart', event.target.value)}
                      />
                    </label>
                    <label className="flex flex-col text-xs text-slate-500">
                      To
                      <input
                        type="date"
                        className="mt-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                        value={filters.customEnd}
                        onChange={(event) => setFilter('customEnd', event.target.value)}
                      />
                    </label>
                  </div>
                )}
              </fieldset>

              <fieldset className="community-filters__fieldset">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </legend>
                <div className="community-filters__chip-list flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFilter('categories', toggleValue(filters.categories, category))}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${interactiveClass} ${
                        filters.categories.includes(category)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="community-filters__fieldset">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Town / Area
                </legend>
                <div className="community-filters__chip-list flex flex-wrap gap-2">
                  {TOWN_OPTIONS.map((town) => (
                    <button
                      key={town}
                      type="button"
                      onClick={() => setFilter('towns', toggleValue(filters.towns, town))}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${interactiveClass} ${
                        filters.towns.includes(town)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {town}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="community-filters__fieldset">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </legend>
                <div className="community-filters__chip-list flex flex-wrap gap-2">
                  {PRICE_OPTIONS.map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setFilter('price', toggleValue(filters.price, price))}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${interactiveClass} ${
                        filters.price.includes(price)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
                <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={filters.showPast}
                    onChange={(event) => setFilter('showPast', event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Show past events
                </label>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
