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
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 translate-y-2 rounded-[32px] bg-gradient-to-b from-brand-green/35 via-brand-green/10 to-transparent blur-3xl opacity-70"
      />
      <aside className="pointer-events-auto flex w-full max-w-xs flex-col gap-4 rounded-[28px] border border-emerald-50/70 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,32,12,0.35)] backdrop-blur-sm transition-transform transition-shadow duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(15,32,12,0.45)]">
        <style>{`
          @keyframes spotlightPulse {
            0% { opacity: 1; }
            50% { opacity: 0.35; }
            100% { opacity: 1; }
          }
        `}</style>
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700/95">
          NORTHSIDE GTA LOCAL SPOTLIGHT
        </p>
        <div className="flex flex-col gap-2 text-slate-900">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-100 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400/70 animate-pulse" />
              <span className="m-auto h-1.5 w-1.5 rounded-full bg-emerald-700" />
            </span>
            Updated daily
          </span>
          <h3 className="text-sm font-semibold text-emerald-900/90">{heroLabel}</h3>
          <p className="text-lg font-semibold text-emerald-950 sm:text-xl">{hero.name}</p>
          {ratingLine && <p className="text-[12px] text-emerald-800/85">{ratingLine}</p>}
          {hero.snippet && (
            <p className="text-[12px] text-emerald-800/80">“{hero.snippet}”</p>
          )}
        </div>
        {hero.photoUrl && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-emerald-50/80 bg-emerald-900/5">
            <div className="relative aspect-[4/3] w-full">
              <img
                src={hero.photoUrl}
                alt="Spotlight location preview"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 will-change-transform hover:scale-[1.03]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
              />
            </div>
          </div>
        )}
        <p className="text-[11px] text-emerald-800/80">Based on Google Maps data</p>
      </aside>
    </div>
  )
}
