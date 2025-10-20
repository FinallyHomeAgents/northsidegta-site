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
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="min-w-0 pr-1 text-[12px] md:text-[13px] text-gray-800 truncate">
        {label}
      </span>
      <div className="flex-none flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-[6px] w-[6px] md:h-[7px] md:w-[7px] rounded-full ${
              i < v ? "bg-emerald-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MapHero
   ──────────────────────────────────────────────────────────── */
export default function MapHero({ variant = "standalone", className = "" }) {
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
              className="block h-auto w-full min-h-[300px] sm:min-h-[420px] md:min-h-[500px] lg:min-h-[520px]"
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

            {/* DESKTOP: right-docked info panel (only when hovering a pin) */}
            {canHover && activeTown && (
              <div className="hidden md:block">
                <div className="panel absolute top-4 right-4 w-[340px] lg:w-[360px] p-4 md:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
                        {activeTown.name.slice(0, 1)}
                      </div>
                      <div className="text-[18px] md:text-[20px] font-extrabold tracking-tight">
                        {activeTown.name}
                      </div>
                    </div>
                    <a
                      href={activeTown.url}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition"
                    >
                      See town
                    </a>
                  </div>

                  {/* Blurb */}
                  {activeTown.blurb && (
                    <p className="text-[14px] leading-5 text-gray-700 mt-2">
                      {activeTown.blurb}
                    </p>
                  )}

                  {/* Ratings grid — tighter so nothing clips */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {CATEGORY_ORDER.filter(
                      (k) =>
                        activeTown.ratings && activeTown.ratings[k] != null
                    ).map((k) => (
                      <div
                        key={k}
                        className="rounded-lg border border-emerald-100/60 px-2.5 py-1.5"
                      >
                        <RatingRow
                          label={CATEGORY_LABELS[k]}
                          value={activeTown.ratings[k]}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    ★★★★★ Google reviews • As seen on Instagram & Facebook
                  </div>
                </div>
              </div>
            )}

            {/* NEW: ticker attached to bottom */}
            <LiveTicker />
          </div>

          {/* MOBILE: panel below the map when a pin is tapped */}
          {!canHover && activeTown && (
            <div className="mt-3 panel p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
                    {activeTown.name.slice(0, 1)}
                  </div>
                  <div className="text-[18px] font-extrabold tracking-tight">
                    {activeTown.name}
                  </div>
                </div>
                <button
                  onClick={() => setOpenId(null)}
                  aria-label="Close"
                  className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              {activeTown.blurb && (
                <p className="text-[14px] leading-5 text-gray-700 mt-2">
                  {activeTown.blurb}
                </p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2">
                {CATEGORY_ORDER.filter(
                  (k) => activeTown.ratings && activeTown.ratings[k] != null
                ).map((k) => (
                  <div
                    key={k}
                    className="rounded-lg border border-emerald-100/60 px-2.5 py-1.5"
                  >
                    <RatingRow
                      label={CATEGORY_LABELS[k]}
                      value={activeTown.ratings[k]}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <a
                  href={activeTown.url}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition"
                >
                  See town
                </a>
                <span className="text-xs text-gray-500">
                  ★★★★★ Google reviews
                </span>
              </div>
            </div>
          )}

          {/* Divider + Inline Quick Contact */}
          <div className="mt-4 md:mt-5 border-t border-emerald-100 pt-4 md:pt-5">
            <QuickContactCard
              heading="Find Where You Truly Belong in the NorthSide GTA"
              subheading="Finally Home Agents will guide you beyond the listings — helping you compare communities and uncover the right fit."
              primaryLabel="START HERE"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
