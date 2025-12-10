import React, { useMemo } from "react";

import { selectTownSpotlight } from "../../lib/spotlight/selectSpotlight";

export default function TownHeroSpotlight({ townSlug, townName, spotlightData }) {
  const items = Array.isArray(spotlightData?.items) ? spotlightData.items : [];
  const loaded = Boolean(spotlightData?.loaded);
  const { hero, heroLabel } = useMemo(() => {
    return selectTownSpotlight(townSlug, townName, items);
  }, [items, townName, townSlug]);

  if (!loaded || !hero || !heroLabel) {
    return null;
  }

  const ratingLine =
    typeof hero.rating === "number" && typeof hero.userRatingsTotal === "number"
      ? `⭐ ${hero.rating.toFixed(1)} (${hero.userRatingsTotal.toLocaleString()} Google reviews)`
      : null;

  return (
    <aside className="pointer-events-auto w-full max-w-xs rounded-3xl border border-emerald-100 bg-[#f7fbf5] p-4 shadow-lg sm:max-w-sm sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-800">
        NorthSide GTA Local Spotlight
      </p>
      <div className="mt-3 flex max-h-[360px] flex-col space-y-2 overflow-hidden text-sm leading-relaxed text-emerald-900">
        <div className="flex flex-1 flex-col space-y-2 overflow-y-auto pr-1">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-pulse rounded-full bg-emerald-400/70" />
              <span className="m-auto h-1.5 w-1.5 rounded-full bg-emerald-700" />
            </span>
            Updated daily
          </span>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-emerald-800/90">
            {heroLabel}
          </h3>
          <p className="text-base font-semibold text-emerald-950 sm:text-lg">{hero.name}</p>
          {ratingLine && <p className="text-[11px] text-emerald-800/85">{ratingLine}</p>}
          {hero.snippet && <p className="text-[11px] text-emerald-800/80">“{hero.snippet}”</p>}
          {hero.photoUrl && (
            <div className="mt-2 overflow-hidden rounded-2xl border border-emerald-50 bg-white">
              <div className="relative aspect-[4/3] w-full">
                <img
                  src={hero.photoUrl}
                  alt="Spotlight location preview"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
          <p className="text-[11px] text-emerald-800/80">Based on Google Maps data</p>
        </div>
      </div>
    </aside>
  );
}
