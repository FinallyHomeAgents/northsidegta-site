// src/MapHero.js
import React, { useEffect, useState } from "react";
import QuickContactCard from "./QuickContactCard";

/* Category labels + display order */
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

/* Town pins (percent positions for your SVG map) */
const TOWNS = [
  {
    id: "georgina",
    name: "Georgina",
    x: 47.35,
    y: 35.42,
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
    x: 38.55,
    y: 46.92,
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
    x: 32.65,
    y: 52.08,
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
    x: 34.95,
    y: 62.58,
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
    x: 44.95,
    y: 60.83,
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
    id: "uxbridge",
    name: "Uxbridge",
    x: 52.55,
    y: 54.83,
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
  {
    id: "scugog",
    name: "Scugog",
    x: 60.95,
    y: 59.17,
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
];

/* Highway 404 overlay (two segments) tuned for your map. */
const HWY404 = {
  xPct: 42.4,
  yTopStart: 42.9,
  yTopEnd: 50.9,
  yBotStart: 57.6,
  yBotEnd: 71.8,
};

/* ---------- Styles ---------- */
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
  .hwy404-line {
    stroke:#10b981; stroke-width:6; stroke-linecap:round; stroke-dasharray:16 14;
    animation:hwyFlow 1.6s linear infinite; filter:drop-shadow(0 0 6px rgba(16,185,129,.35));
  }
  .hwy404-glow { stroke:rgba(16,185,129,.35); stroke-width:14; stroke-linecap:round; filter:blur(3px); opacity:.55; animation:hwyGlow 2.8s ease-in-out infinite; }
  @keyframes hwyFlow { to { stroke-dashoffset: 22; } }
  @keyframes hwyGlow { 0%,100% { opacity:.35 } 50% { opacity:.75 } }
  `}</style>
);

/* A small, space-efficient rating row so dots never overflow */
function RatingRow({ label, value }) {
  const v = Math.round(value || 0);
  return (
    <div className="flex items-center justify-between">
      <span className="min-w-0 pr-1 text-[12.5px] md:text-[13.5px] text-gray-800">
        {label}
      </span>
      <div className="flex-none flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-[6.5px] w-[6.5px] md:h-[8px] md:w-[8px] rounded-full ${
              i < v ? "bg-emerald-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}


export default function MapHero() {
  const [pulsing, setPulsing] = useState(true);
  const [openId, setOpenId] = useState(null);   // tap state for touch devices
  const [hoverId, setHoverId] = useState(null); // hover state for pointer devices

  useEffect(() => {
    const t = setTimeout(() => setPulsing(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // keep the “map resize nudge” stub
  useEffect(() => {
    window.__mapboxRef = { resize: () => {} };
  }, []);

  // Capability detection (reliable across iPad/Android/desktop)
  const canHover =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover)").matches;

  // Active town depends on capability
  const activeId = canHover ? hoverId : openId;
  const activeTown = TOWNS.find((t) => t.id === activeId) || null;

  // Allow ESC to clear hover on desktop/pointer devices
  useEffect(() => {
    if (!canHover) return;
    const onEsc = (e) => e.key === "Escape" && setHoverId(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [canHover]);

  return (
    <section className="bg-gradient-to-b from-white to-emerald-50/40">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        {/* Premium hero headline (unchanged) */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Discover More Than Just Listings — Discover Your Next Town
          </h1>
          <p className="mt-2 text-gray-700">
            Doing it alone is a guess. Doing it with Finally Home Agents means
            real insights, local knowledge, and the edge in finding where you
            belong.
          </p>
        </div>

        {/* Bordered hero box (map + inline quick-contact) */}
        <div className="relative mx-auto mt-6 rounded-2xl bg-white/70 p-3 shadow-sm border">
          <Styles />

          {/* Map frame */}
          <div
            className="relative rounded-xl overflow-hidden"
            onMouseLeave={() => canHover && setHoverId(null)}
          >
            {/* Keep natural aspect ratio so pin percentages line up EXACTLY */}
            <img
              src="/Images/northside-map.svg"
              alt="NorthSide GTA map with towns"
              className="block w-full h-auto"
            />

            {/* Highway 404 overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <line
                x1={`${HWY404.xPct}%`}
                y1={`${HWY404.yTopStart}%`}
                x2={`${HWY404.xPct}%`}
                y2={`${HWY404.yTopEnd}%`}
                className="hwy404-glow"
              />
              <line
                x1={`${HWY404.xPct}%`}
                y1={`${HWY404.yTopStart}%`}
                x2={`${HWY404.xPct}%`}
                y2={`${HWY404.yTopEnd}%`}
                className="hwy404-line"
              />
              <line
                x1={`${HWY404.xPct}%`}
                y1={`${HWY404.yBotStart}%`}
                x2={`${HWY404.xPct}%`}
                y2={`${HWY404.yBotEnd}%`}
                className="hwy404-glow"
              />
              <line
                x1={`${HWY404.xPct}%`}
                y1={`${HWY404.yBotStart}%`}
                x2={`${HWY404.xPct}%`}
                y2={`${HWY404.yBotEnd}%`}
                className="hwy404-line"
              />
            </svg>

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
                onClick={() => !canHover && setOpenId((cur) => (cur === t.id ? null : t.id))}
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

                  {activeTown.blurb && (
                    <p className="text-[14px] leading-5 text-gray-700 mt-2">
                      {activeTown.blurb}
                    </p>
                  )}

                  {/* Ratings grid (2 columns) */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {CATEGORY_ORDER.filter(
                      (k) => activeTown.ratings && activeTown.ratings[k] != null
                    ).map((k) => (
                      <div
                        key={k}
                        className="rounded-lg border border-emerald-100/60 px-3 py-2"
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

              <div className="mt-3 grid grid-cols-2 gap-3">
                {CATEGORY_ORDER.filter(
                  (k) => activeTown.ratings && activeTown.ratings[k] != null
                ).map((k) => (
                  <div
                    key={k}
                    className="rounded-lg border border-emerald-100/60 px-3 py-2"
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

          {/* Divider + Inline Quick Contact (kept the same) */}
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
