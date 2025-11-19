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

export default function TownLiveStrip({ townSlug, townName, spotlightData }) {
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
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Live Around {townName}
        </p>
        <p className="text-[10px] text-slate-400">Updated daily</p>
      </div>
      <ul className="mt-2 space-y-2">
        {thumbnails.map((place) => {
          const label = labelMap.get(place.placeId) || townName
          const ratingLine = formatRating(place)
          return (
            <li
              key={place.placeId}
              className="flex items-center gap-3 rounded-xl bg-white/90 px-3 py-2 shadow-sm shadow-black/5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/10 text-[13px]">
                <span aria-hidden>{getIconForPlace(place)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-slate-800">{label}</p>
                <p className="truncate text-[11px] text-slate-600">{place.name}</p>
                {ratingLine && <p className="text-[10px] text-slate-500">{ratingLine}</p>}
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-1 text-[10px] text-slate-400">
        Based on Google Maps data • Non-restaurant experiences only
      </p>
    </div>
  )
}
