// src/MapHero.js
import React, { useEffect, useState } from "react";
import QuickContactCard from "./QuickContactCard";

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
   Town pins (percent positions for your SVG map) — unchanged
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
   Local styles
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
  @keyframes ns-progress {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  `}</style>
);

/* ────────────────────────────────────────────────────────────
   Compact rating row so labels + dots always fit
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
   Premium inline SVG icons
   ──────────────────────────────────────────────────────────── */
function IconBase({ children, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
function XIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </IconBase>
  );
}
function CheckIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M20 6L9 17l-5-5" />
    </IconBase>
  );
}
/* ────────────────────────────────────────────────────────────
   LED-inspired matchup scoreboard overlay
   ──────────────────────────────────────────────────────────── */
function ComparisonBar({ className = "" }) {
  const items = [
    { left: "HIGH HOME PRICES", right: "BETTER VALUE HOMES" },
    { left: "TRAFFIC GRIDLOCK", right: "EASIER COMMUTES" },
    { left: "LIMITED SPACE", right: "MORE GREEN SPACE" },
    { left: "TIGHT LOTS", right: "ROOM TO BREATHE" },
  ];
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);

  const cur = items[i];

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-emerald-400/60 shadow-[0_22px_48px_-24px_rgba(16,185,129,0.85)] backdrop-blur-md"
        style={{
          background:
            "linear-gradient(140deg, rgba(5,19,15,0.92) 0%, rgba(6,52,38,0.94) 46%, rgba(5,84,63,0.92) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.18),transparent_68%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_55%,rgba(15,108,110,0.25)_100%)] mix-blend-screen opacity-80" />

        <div className="relative">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 md:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-100/90">
                NorthSide GTA Showdown
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-emerald-100/70">
              <span>Presented&nbsp;by</span>
              <span className="font-semibold text-emerald-50">FHA</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600/80 text-[11px] font-bold uppercase tracking-[0.24em] text-white shadow-[inset_0_0_12px_rgba(248,113,113,0.45)]">
                TOR
              </span>
              <div className="leading-tight">
                <span className="block text-[10px] uppercase tracking-[0.32em] text-white/45">
                  City
                </span>
                <span className="block text-sm font-semibold uppercase tracking-wide text-white">
                  Toronto Living
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-2 text-emerald-200/80">
              <span className="text-[10px] uppercase tracking-[0.48em]">vs</span>
              <span className="mt-1 h-1 w-8 rounded-full bg-emerald-300/80" />
            </div>

            <div className="flex items-center gap-3 text-right">
              <div className="relative flex h-9 w-9 items-center justify-center">
                <div className="absolute inset-0 rounded-xl border border-emerald-300/70 bg-emerald-500/25 shadow-[0_6px_16px_rgba(13,148,136,0.45)]" />
                <img
                  src="/Images/fha-badge.png"
                  alt="NorthSide GTA logo"
                  className="relative z-10 h-7 w-7 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="leading-tight">
                <span className="block text-[10px] uppercase tracking-[0.32em] text-emerald-100/70">
                  Region
                </span>
                <span className="block text-sm font-bold uppercase tracking-wide text-emerald-50">
                  NorthSide GTA
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-white/10 text-[12px] uppercase tracking-wide">
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-300/60 bg-rose-500/25">
                <XIcon className="h-4 w-4 text-rose-200" />
              </span>
              <p className="text-[11px] md:text-[12px] font-semibold leading-tight text-white/80">
                {cur.left}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-4 py-3 text-right md:px-6">
              <p className="text-[11px] md:text-[12px] font-bold leading-tight text-emerald-100">
                {cur.right}
              </p>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200/70 bg-emerald-500/30">
                <CheckIcon className="h-4 w-4 text-emerald-100" />
              </span>
            </div>
          </div>

          <div className="relative h-1.5 overflow-hidden border-t border-white/5 bg-white/10">
            <div
              className="absolute inset-0 origin-left"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.15) 100%)",
                animation: "ns-progress 4s linear infinite",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-emerald-200/30" />
          </div>
        </div>
      </div>
    </div>
  );
}


/* ────────────────────────────────────────────────────────────
   MapHero
   ──────────────────────────────────────────────────────────── */
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

  return (
    <section className="bg-gradient-to-b from-white to-emerald-50/40">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        {/* Bordered hero box (map + inline quick-contact) */}
        <div className="relative mx-auto mt-4 rounded-2xl bg-white/70 p-3 shadow-sm border">
          <Styles />

          {/* Map frame */}
          <div className="relative rounded-xl overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-emerald-950/25 via-emerald-900/15 to-transparent" />
            <div className="relative z-20 px-3 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
              <ComparisonBar className="w-full" />
            </div>
            <div
              className="relative z-0"
              onMouseLeave={() => canHover && setHoverId(null)}
            >
              {/* Keep natural aspect ratio so pin percentages line up EXACTLY */}
              <img
                src="/Images/northside-map.svg?v=2"
                alt="NorthSide GTA map with towns"
                className="block w-full h-auto"
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
            </div>
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

          {/* Divider + Inline Quick Contact (unchanged) */}
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
