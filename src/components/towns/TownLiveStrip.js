import React, { useMemo } from 'react'

import { selectTownSpotlight } from '../../lib/spotlight/selectSpotlight'

const TAG_ICON_MAP = {
  perfect_park_day: '🌳',
  family_day_idea: '👨‍👩‍👧',
  active_day_idea: '🥾',
  hidden_gem: '💎',
  photo_worthy: '📷',
  where_locals_go: '⭐',
}

function getIconForPlace(place) {
  const tag = Array.isArray(place?.tags) ? place.tags[0] : null
  return TAG_ICON_MAP[tag] || '★'
}

function formatRating(place) {
  if (typeof place?.rating !== 'number' || typeof place?.userRatingsTotal !== 'number') {
    return null
  }
  return `⭐ ${place.rating.toFixed(1)} (${place.userRatingsTotal.toLocaleString()} reviews)`
}

export default function TownLiveStrip({ townSlug, townName, spotlightData, className = "mt-6" }) {
  const items = Array.isArray(spotlightData?.items) ? spotlightData.items : []
  const selection = useMemo(() => {
    return selectTownSpotlight(townSlug, townName, items)
  }, [items, townName, townSlug])

  const labelMap = useMemo(() => {
    return new Map(selection.thumbnailLabels.map((meta) => [meta.placeId, meta.label]))
  }, [selection.thumbnailLabels])

  const thumbnails = selection.thumbnails
  const hasItems = thumbnails.length > 0

  if (!hasItems) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/90">
          Live Around {townName}
        </p>
        <p className="text-[11px] font-semibold text-emerald-800">Updated daily</p>
      </div>
      <ul className="mt-5 space-y-3">
        {thumbnails.map((place) => {
          const label = labelMap.get(place.placeId) || townName
          const ratingLine = formatRating(place)
          return (
            <li
              key={place.placeId}
              className="group flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-4 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-base">
                <span aria-hidden>{getIconForPlace(place)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/90">
                  {label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-emerald-950">{place.name}</p>
                {place.summary && (
                  <p className="mt-0.5 truncate text-xs text-emerald-800/80">{place.summary}</p>
                )}
                {ratingLine && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-700/85">
                    ⭐ {place.rating.toFixed(1)}{' '}
                    <span className="text-emerald-800/70">
                      ({place.userRatingsTotal.toLocaleString()} Google reviews)
                    </span>
                  </p>
                )}
              </div>
              <span className="text-lg text-emerald-500 transition-colors duration-200 group-hover:text-emerald-700" aria-hidden>
                →
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-[11px] text-emerald-700/80">Based on Google Maps data</p>
    </div>
  )
}
