import React, { useMemo } from 'react'

import { selectTownSpotlight } from '../../lib/spotlight/selectSpotlight'

export default function TownHeroSpotlight({ townSlug, townName, spotlightData }) {
  const items = Array.isArray(spotlightData?.items) ? spotlightData.items : []
  const loaded = Boolean(spotlightData?.loaded)
  const { hero, heroLabel } = useMemo(() => {
    return selectTownSpotlight(townSlug, townName, items)
  }, [items, townName, townSlug])

  if (!loaded || !hero || !heroLabel) {
    return null
  }

  const ratingLine =
    typeof hero.rating === 'number' && typeof hero.userRatingsTotal === 'number'
      ? `⭐ ${hero.rating.toFixed(1)} (${hero.userRatingsTotal.toLocaleString()} Google reviews)`
      : null

  return (
    <div className="pointer-events-auto w-full max-w-xs rounded-2xl bg-white/90 p-4 shadow-lg shadow-black/10 backdrop-blur-md">
      <style>{`
        @keyframes spotlightPulse {
          0% { opacity: 1; }
          50% { opacity: 0.35; }
          100% { opacity: 1; }
        }
      `}</style>
      <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-green animate-[spotlightPulse_1.4s_ease-out_infinite] motion-reduce:animate-none" />
        NorthSide GTA Local Spotlight
      </p>
      <div className="mt-2 space-y-1 text-slate-900">
        <p className="text-xs font-medium text-slate-600">Updated daily</p>
        <h3 className="text-sm font-semibold text-slate-900">{heroLabel}</h3>
        <p className="text-base font-semibold">{hero.name}</p>
        {ratingLine && <p className="text-[11px] text-slate-600">{ratingLine}</p>}
        {hero.snippet && (
          <p className="text-[11px] text-slate-600">“{hero.snippet}”</p>
        )}
      </div>
      {hero.photoUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/70">
          <img
            src={hero.photoUrl}
            alt="Spotlight location preview"
            className="h-32 w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <p className="mt-2 text-[10px] text-slate-500">Based on Google Maps data</p>
    </div>
  )
}
