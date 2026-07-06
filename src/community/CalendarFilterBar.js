import React from 'react'
import { CATEGORY_OPTIONS } from './eventUtils'

const BRAND_GREEN = '#32610E'
const CHIP_ICONS = {
  All: '✨',
  Family: '👨\u200d👩\u200d👧',
  Sports: '🏌️',
  Festivals: '🎉',
  Markets: '🛍️',
  'Arts & Culture': '🎨',
  Golf: '⛳',
  Outdoors: '🌲',
  Other: '🤝',
}

const LABEL_OVERRIDES = {
  'Arts & Culture': 'Arts',
  Other: 'Community',
}

const DEFAULT_CHIPS = [{ value: 'all', label: 'All', icon: CHIP_ICONS.All }]

const CHIP_LABELS = CATEGORY_OPTIONS.map((category) => ({
  value: category,
  label: LABEL_OVERRIDES[category] || category,
  icon: CHIP_ICONS[category] || '•',
}))

const CHIP_ORDER = [...DEFAULT_CHIPS, ...CHIP_LABELS]

export default function CalendarFilterBar({
  selectedCategories = [],
  onSelectCategories,
  onClear,
}) {
  const isAllSelected = !selectedCategories?.length

  const handleSelect = (value) => {
    if (value === 'all') {
      onSelectCategories?.([])
      return
    }

    if (selectedCategories?.includes(value)) {
      onSelectCategories?.(selectedCategories.filter((item) => item !== value))
      return
    }

    onSelectCategories?.([value])
  }

  return (
    <div className="sticky top-24 z-20 mx-auto mb-8 w-full max-w-6xl px-4 sm:px-6">
      <div className="rounded-3xl bg-white/90 p-3 shadow-lg backdrop-blur md:p-4">
        <div className="flex items-center justify-between gap-3 pb-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Browse by category
          </h3>
          <button
            type="button"
            className="hidden text-xs font-medium text-slate-500 hover:text-slate-700 md:inline-flex"
            onClick={() => {
              onSelectCategories?.([])
              onClear?.()
            }}
          >
            Clear filters
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CHIP_ORDER.map((chip) => {
            const selected = chip.value === 'all' ? isAllSelected : selectedCategories?.includes(chip.value)
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => handleSelect(chip.value)}
                className={`group inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  selected
                    ? 'shadow-sm focus-visible:ring-[#32610E]'
                    : 'border border-[#CCCCCC] bg-white text-[#333333] hover:border-[#32610E]/70 hover:text-[#32610E] focus-visible:ring-[#32610E]/40'
                }`}
                style={
                  selected
                    ? {
                        background: BRAND_GREEN,
                        color: '#FFFFFF',
                        borderColor: BRAND_GREEN,
                      }
                    : undefined
                }
                aria-pressed={selected}
              >
                <span aria-hidden="true" className="text-base">
                  {chip.icon}
                </span>
                {chip.label}
              </button>
            )
          })}
          {!isAllSelected && (
            <button
              type="button"
              onClick={() => {
                onSelectCategories?.([])
                onClear?.()
              }}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#CCCCCC] bg-white px-4 py-2 text-sm font-medium text-[#333333] transition hover:border-[#32610E]/70 hover:text-[#32610E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32610E]/40 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">🔄</span>
              Show all
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
