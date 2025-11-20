import React, { useMemo } from 'react'
import { FiActivity, FiCamera, FiCompass, FiHeart, FiMapPin, FiStar, FiUsers } from 'react-icons/fi'

import { selectTownSpotlight } from '../../lib/spotlight/selectSpotlight'

const TAG_ICON_MAP = {
  perfect_park_day: FiCompass,
  family_day_idea: FiUsers,
  active_day_idea: FiActivity,
  hidden_gem: FiStar,
  photo_worthy: FiCamera,
  where_locals_go: FiMapPin,
}

function IconBadge({ icon: Icon }) {
  const Component = Icon || FiHeart
  return (
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-800 shadow-[0_6px_20px_-16px_rgba(0,0,0,0.35)]">
      <Component className="h-5 w-5" aria-hidden />
    </div>
  )
}

function getIconForPlace(place) {
  const tag = Array.isArray(place?.tags) ? place.tags[0] : null
  return TAG_ICON_MAP[tag] || FiHeart
}

function formatRating(place) {
  if (typeof place?.rating !== 'number' || typeof place?.userRatingsTotal !== 'number') {
    return null
  }
  return {
    score: place.rating.toFixed(1),
    total: place.userRatingsTotal.toLocaleString(),
  }
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
              <IconBadge icon={getIconForPlace(place)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/90">
                  {label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-emerald-950">{place.name}</p>
                {place.summary && (
                  <p className="mt-0.5 truncate text-xs text-emerald-800/80">{place.summary}</p>
                )}
                {ratingLine && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700/85">
                    <FiStar className="h-3.5 w-3.5" aria-hidden />
                    <span>{ratingLine.score}</span>
                    <span className="text-emerald-800/70">({ratingLine.total} Google reviews)</span>
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
