// src/MapHero.js
import React, { useEffect, useState } from "react";
import QuickContactCard from "./QuickContactCard";
import LiveTicker from "./components/LiveTicker";

/* ────────────────────────────────────────────────────────────
   Category labels + display order
   ──────────────────────────────────────────────────────────── */
const CATEGORY_LABELS = {
  housePrices: "House Prices",
  commuterAccess: "Commuter Access",
  localTraffic: "Local Traffic",
  golf: "Golf Courses",
  fishing: "Fishing",
  trailsNature: "Trails & Nature",
  restaurants: "Restaurants",
  localEvents: "Local Events",
};

const CATEGORY_ORDER = [
  "housePrices",
  "commuterAccess",
  "localTraffic",
  "golf",
  "fishing",
  "trailsNature",
  "restaurants",
  "localEvents",
];

/* ────────────────────────────────────────────────────────────
   Town pins (percent positions for your SVG map)
   ──────────────────────────────────────────────────────────── */
const TOWNS = [
  {
    id: "georgina",
    name: "Georgina",
    x: 50.25,
    y: 33.42,
    url: "/georgina",
    blurb: "Lake life, beaches, and room to roam.",
    ratings: {
      housePrices: 5,
      commuterAccess: 4,
      localTraffic: 4,
      golf: 4,
      fishing: 5,
      trailsNature: 4,
      restaurants: 3,
      localEvents: 4,
    },
  },
  {
    id: "east-gwillimbury",
    name: "East Gwillimbury",
    x: 40.55,
    y: 42.42,
    url: "/east-gwillimbury",
    blurb: "New builds, schools & fast 404 access.",
    ratings: {
      housePrices: 4,
      commuterAccess: 4,
      localTraffic: 3,
      golf: 4,
      fishing: 3,
      trailsNature: 4,
      restaurants: 4,
      localEvents: 4,
    },
  },
  {
    id: "newmarket",
    name: "Newmarket",
    x: 35.6,
    y: 53.58,
    url: "/newmarket",
    blurb: "Shops, dining, and GO convenience.",
    ratings: {
      housePrices: 3,
      commuterAccess: 5,
      localTraffic: 3,
      golf: 4,
      fishing: 3,
      trailsNature: 4,
      restaurants: 5,
      localEvents: 4,
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    x: 40.0,
    y: 61.42,
    url: "/aurora",
    blurb: "Mature neighbourhoods, schools, and quiet streets.",
    ratings: {
      housePrices: 3,
      commuterAccess: 5,
      localTraffic: 3,
      golf: 4,
      fishing: 2,
      trailsNature: 4,
      restaurants: 4,
      localEvents: 4,
    },
  },
  {
    id: "stouffville",
    name: "Stouffville",
    x: 48.3,
    y: 58.58,
    url: "/stouffville",
    blurb: "Family streets, parks & a lively Main Street.",
    ratings: {
      housePrices: 4,
      commuterAccess: 4,
      localTraffic: 4,
      golf: 4,
      fishing: 3,
      trailsNature: 4,
      restaurants: 4,
      localEvents: 4,
    },
  },
  {
    id: "scugog",
    name: "Scugog",
    x: 65.45,
    y: 54.67,
    url: "/scugog",
    blurb: "Port Perry heritage + lakefront sunsets.",
    ratings: {
      housePrices: 4,
      commuterAccess: 3,
      localTraffic: 4,
      golf: 4,
      fishing: 5,
      trailsNature: 4,
      restaurants: 4,
      localEvents: 5,
    },
  },
  {
    id: "uxbridge",
    name: "Uxbridge",
    x: 55.55,
    y: 52.0,
    url: "/uxbridge",
    blurb: "Trail capital vibes and small-town charm.",
    ratings: {
      housePrices: 3,
      commuterAccess: 3,
      localTraffic: 5,
      golf: 5,
      fishing: 3,
      trailsNature: 5,
      restaurants: 4,
      localEvents: 4,
    },
  },
];

/* ────────────────────────────────────────────────────────────
   Inline styles for map pins/panel polish
   ──────────────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
  @keyframes pinPulse {
    0%   { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0.40); }
    70%  { transform: translate(-50%, -50%) scale(1);    box-shadow: 0 0 0 14px rgba(16,185,129,0.00); }
    100% { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0.00); }
  }
  .pin-wrap { position:absolute; transform:translate(-50%, -50%); }
  .pin {
    position:absolute; left:50%; top:50%; transform:translate(-50%, -50%);
    width:14px; height:14px; border-radius:999px; border:2px solid #fff;
    background: radial-gradient(65% 65% at 35% 35%, #34d399 0%, #059669 60%, #047857 100%);
    animation: pinPulse 2s ease-out infinite;
  }
  .panel {
    backdrop-filter: blur(8px);
    background: rgba(255,255,255,.97);
    border: 1px solid rgba(16,185,129,.18);
    border-radius: 16px;
    box-shadow: 0 12px 28px rgba(2,44,34,.18);
  }
  `}</style>
);

/* ────────────────────────────────────────────────────────────
   Compact rating row
   ──────────────────────────────────────────────────────────── */
function RatingRow({ label, value }) {
  const v = Math.round(value || 0);
  const percent = Math.max(0, Math.min(100, (v / 5) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 pr-1 text-[12px] font-semibold text-emerald-900 md:text-[13px]">
          {label}
        </span>
        <div className="flex flex-none items-center gap-1.5">
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`h-[7px] w-[7px] rounded-full md:h-[8px] md:w-[8px] ${
                  i < v
                    ? "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_6px_rgba(16,185,129,0.45)]"
                    : "bg-emerald-100"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">{v}/5</span>
        </div>
      </div>
      <div className="h-[6px] w-full rounded-full bg-emerald-100/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MapHero
   ──────────────────────────────────────────────────────────── */
export default function MapHero({
  variant = "standalone",
  className = "",
  showQuickContact = true,
  afterTicker = null,
}) {
  const [pulsing, setPulsing] = useState(true);
  const [openId, setOpenId] = useState(null);   // touch devices
  const [hoverId, setHoverId] = useState(null); // pointer devices

  useEffect(() => {
    const t = setTimeout(() => setPulsing(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // keep the “map resize nudge” stub
  useEffect(() => {
    window.__mapboxRef = { resize: () => {} };
  }, []);

  // Detect if the device supports hover (desktop/laptop)
  const canHover =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover)").matches;

  // Active town depends on capability (NO default active)
  const activeId = canHover ? hoverId : openId;
  const activeTown = TOWNS.find((t) => t.id === activeId) || null;

  // Allow ESC to clear hover on desktop/pointer devices
  useEffect(() => {
    if (!canHover) return;
    const onEsc = (e) => e.key === "Escape" && setHoverId(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [canHover]);

  const embedded = variant !== "standalone";

  const sectionClasses = [
    embedded
      ? "relative"
      : "bg-gradient-to-b from-white to-emerald-50/40",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const containerClasses = [
    "mx-auto w-full",
    embedded ? "max-w-[1900px] px-0" : "max-w-6xl px-4",
    embedded ? "" : "pt-8",
  ]
    .filter(Boolean)
    .join(" ");

  const frameClasses = embedded
    ? "relative mx-auto w-full rounded-[36px]"
    : "relative mx-auto mt-4 rounded-2xl bg-white/70 p-3 shadow-sm border";

  return (
    <section className={sectionClasses}>
      <div className={containerClasses}>
        {/* Bordered hero box (map + inline quick-contact) */}
        <div className={frameClasses}>
          <Styles />

          {/* Map frame */}
          <div
            className="relative overflow-hidden rounded-[32px] map-hero"
            onMouseLeave={() => canHover && setHoverId(null)}
          >
            {/* Keep natural aspect ratio so pin percentages line up EXACTLY */}
            <img
              src="/Images/northside-map.svg?v=2"
              alt="NorthSide GTA map with towns"
              className="block h-auto w-full min-h-[240px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px] xl:min-h-[420px] xl:max-h-[480px]"
            />

            {/* Pins */}
            {TOWNS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="pin-wrap"
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                aria-label={t.name}
                aria-pressed={activeId === t.id}
                onMouseEnter={() => canHover && setHoverId(t.id)}
                onClick={() =>
                  !canHover && setOpenId((cur) => (cur === t.id ? null : t.id))
                }
              >
                <span
                  className="pin"
                  style={{ animationPlayState: pulsing ? "running" : "paused" }}
                />
                <span className="sr-only">{t.name}</span>
              </button>
            ))}

            {/* Desktop overlays anchored inside the green rails */}
            {embedded && (showQuickContact || canHover) ? (
              <div className="pointer-events-none absolute inset-x-0 top-4 bottom-[80px] hidden md:flex z-30">
                <div className="flex w-full items-stretch justify-between gap-4 px-4 sm:px-5 md:px-6 lg:px-7">
                  {showQuickContact ? (
                    <div className="pointer-events-auto flex w-[min(26vw,300px)] min-w-[220px] max-w-[300px]">
                      <QuickContactCard variant="overlay" className="h-full w-full" />
                    </div>
                  ) : null}

                  <div className="flex-1" />

                  {canHover ? (
                    <div className="pointer-events-auto flex w-[min(28vw,320px)] min-w-[230px] max-w-[320px]">
                      <TownInsightCard town={activeTown} className="flex h-full w-full flex-col" />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* NEW: ticker attached to bottom */}
            <LiveTicker />
          </div>

          {/* MOBILE: panel below the map with tap instructions */}
          {!canHover && (
            <div className="mt-3 md:hidden">
              <TownInsightCard town={activeTown} mode="mobile" onDismiss={() => setOpenId(null)} />
            </div>
          )}

          {/* MOBILE: quick contact below the map */}
          {embedded && showQuickContact && !canHover && (
            <div className="mt-4 md:hidden">
              <QuickContactCard variant="overlay" />
            </div>
          )}

          {afterTicker && (
            <div className="border-t border-white/12 bg-white/5 backdrop-blur-sm">
              <div className="px-3 py-4 sm:px-4 sm:py-5">
                {afterTicker}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TownInsightCard({ town, mode = "desktop", onDismiss, className = "" }) {
  const isMobile = mode === "mobile";
  const hasTown = Boolean(town);

  const containerClasses = [
    className,
    isMobile
      ? "rounded-[26px] border border-emerald-200/80 bg-white/96 shadow-xl shadow-emerald-900/10"
      : "pointer-events-auto overflow-hidden rounded-[30px] border border-emerald-200/70 bg-white/96 shadow-[0_24px_60px_rgba(2,33,24,0.18)] backdrop-blur",
  ]
    .filter(Boolean)
    .join(" ");

  const headerClasses = [
    "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 text-white",
    isMobile ? "flex-none rounded-t-[26px] px-4 py-3" : "flex-none rounded-t-[30px] px-5 py-4",
  ].join(" ");

  const bodyClasses = isMobile
    ? "space-y-4 px-4 py-4"
    : "flex-1 space-y-5 overflow-y-auto px-5 py-5";

  if (!hasTown) {
    return (
      <div className={containerClasses}>
        <div className={headerClasses}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg">
              🧭
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-100/80">
                Town insights
              </p>
              <p className="text-lg font-semibold leading-tight md:text-xl">
                Hover a town to unlock live intel.
              </p>
            </div>
          </div>
        </div>
        <div className={bodyClasses}>
          <p className="text-sm leading-relaxed text-emerald-900/80">
            Explore the map to preview pricing, commute notes, and lifestyle scores across the
            NorthSide GTA.
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-emerald-900/85">
            {TOWNS.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-emerald-100/70 bg-emerald-50/70 px-3 py-2 text-center shadow-sm"
              >
                {t.name}
              </div>
            ))}
          </div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-500/80">
            NorthSide GTA • Finally Home Agents
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
              {town.name.slice(0, 1)}
            </div>
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-100/80">
                NorthSide GTA
              </p>
              <p className="text-lg font-semibold leading-tight md:text-xl">
                {town.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isMobile && onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Close town panel"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-base text-white transition hover:bg-white/25"
              >
                ×
              </button>
            ) : null}
            <a
              href={town.url}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-white/25"
            >
              See town
            </a>
          </div>
        </div>
      </div>
      <div className={bodyClasses}>
        {town.blurb && (
          <p className="text-sm leading-relaxed text-emerald-900/85 md:text-[15px]">
            {town.blurb}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CATEGORY_ORDER.filter(
            (k) => town.ratings && town.ratings[k] != null
          ).map((k) => (
            <div
              key={k}
              className="rounded-2xl border border-emerald-100/70 bg-white/70 p-3 shadow-sm shadow-emerald-900/10"
            >
              <RatingRow label={CATEGORY_LABELS[k]} value={town.ratings[k]} />
            </div>
          ))}
        </div>

        <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-500/80">
          ★★★★★ Google reviews • Local data refreshed nightly
        </div>
      </div>
    </div>
  );
}
