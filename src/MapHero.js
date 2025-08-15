// src/MapHero.js
import React, { useEffect, useState } from "react";

/* Category labels + display order */
const CATEGORY_LABELS = {
  housePrices:   "House Prices",
  commuterAccess:"Commuter Access",
  localTraffic:  "Local Traffic",
  golf:          "Golf Courses",
  fishing:       "Fishing",
  trailsNature:  "Trails & Nature",
  restaurants:   "Restaurants",
  localEvents:   "Local Events",
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

/* Town pins (percent positions for a 2000×1200 map) + blurbs/ratings */
const TOWNS = [
  {
    id: "georgina", name: "Georgina", x: 47.35, y: 35.42, url: "/georgina",
    blurb: "Lake life, beaches, and room to roam.",
    ratings: { housePrices: 5, commuterAccess: 4, localTraffic: 4, golf: 4, fishing: 5, trailsNature: 4, restaurants: 3, localEvents: 4 },
  },
  {
    id: "east-gwillimbury", name: "East Gwillimbury", x: 38.55, y: 46.92, url: "/east-gwillimbury",
    blurb: "New builds, schools & fast 404 access.",
    ratings: { housePrices: 4, commuterAccess: 4, localTraffic: 3, golf: 4, fishing: 3, trailsNature: 4, restaurants: 4, localEvents: 4 },
  },
  {
    id: "newmarket", name: "Newmarket", x: 32.65, y: 52.08, url: "/newmarket",
    blurb: "Shops, dining, and GO convenience.",
    ratings: { housePrices: 3, commuterAccess: 5, localTraffic: 3, golf: 4, fishing: 3, trailsNature: 4, restaurants: 5, localEvents: 4 },
  },
  {
    id: "aurora", name: "Aurora", x: 34.95, y: 62.58, url: "/aurora",
    blurb: "Mature neighbourhoods, schools, and quiet streets.",
    ratings: { housePrices: 3, commuterAccess: 5, localTraffic: 3, golf: 4, fishing: 2, trailsNature: 4, restaurants: 4, localEvents: 4 },
  },
  {
    id: "stouffville", name: "Stouffville", x: 44.95, y: 60.83, url: "/stouffville",
    blurb: "Family streets, parks & a lively Main Street.",
    ratings: { housePrices: 4, commuterAccess: 4, localTraffic: 4, golf: 4, fishing: 3, trailsNature: 4, restaurants: 4, localEvents: 4 },
  },
  {
    id: "uxbridge", name: "Uxbridge", x: 52.55, y: 54.83, url: "/uxbridge",
    blurb: "Trail capital vibes and small-town charm.",
    ratings: { housePrices: 3, commuterAccess: 3, localTraffic: 5, golf: 5, fishing: 3, trailsNature: 5, restaurants: 4, localEvents: 4 },
  },
  {
    id: "scugog", name: "Scugog", x: 60.95, y: 59.17, url: "/scugog",
    blurb: "Port Perry heritage + lakefront sunsets.",
    ratings: { housePrices: 4, commuterAccess: 3, localTraffic: 4, golf: 4, fishing: 5, trailsNature: 4, restaurants: 4, localEvents: 5 },
  },
];

/* Highway 404 overlay (two segments) tuned for your map. */
const HWY404 = { xPct: 42.4, yTopStart: 42.9, yTopEnd: 50.9, yBotStart: 57.6, yBotEnd: 71.8 };

/* ---------- Styles for pins, tooltips, and the animated 404 ---------- */
const Styles = () => (
  <style>{`
    @keyframes hwyFlow { to { stroke-dashoffset: 22; } }
    @keyframes hwyGlow { 0%,100% { opacity:.35 } 50% { opacity:.75 } }
    @keyframes pinPulse {
      0% { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0.40); }
      70%{ transform: translate(-50%, -50%) scale(1);    box-shadow: 0 0 0 14px rgba(16,185,129,0.00); }
      100%{transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0.00); }
    }
    .pin-wrap { position:absolute; transform:translate(-50%,-50%); }
    .pin {
      position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
      width:14px; height:14px; border-radius:999px; border:2px solid #fff;
      background: radial-gradient(65% 65% at 35% 35%, #34d399 0%, #059669 60%, #047857 100%);
      animation:pinPulse 2s ease-out infinite;
    }
    .hwy404-line {
      stroke:#10b981; stroke-width:6; stroke-linecap:round; stroke-dasharray:16 14;
      animation:hwyFlow 1.6s linear infinite; filter:drop-shadow(0 0 6px rgba(16,185,129,.35));
    }
    .hwy404-glow { stroke:rgba(16,185,129,.35); stroke-width:14; stroke-linecap:round; filter:blur(3px); opacity:.55; animation:hwyGlow 2.8s ease-in-out infinite; }

    .tooltip {
      position:absolute; z-index:30;
      backdrop-filter: blur(8px);
      background: rgba(255,255,255,.95);
      border: 1px solid rgba(16,185,129,.15);
      border-radius: 16px;
      box-shadow: 0 12px 28px rgba(2,44,34,.18);
      transform-origin: top left;
      transition: opacity .18s ease, transform .18s ease;
    }
    .tooltip-arrow {
      position:absolute; left:14px; width:14px; height:14px; transform: rotate(45deg);
      background: rgba(255,255,255,.95);
      border-left: 1px solid rgba(16,185,129,.15);
      border-top: 1px solid rgba(16,185,129,.15);
      backdrop-filter: blur(8px);
    }
    .arrow-top { top:-8px; } .arrow-bottom { bottom:-8px; }
  `}</style>
);

export default function MapHero() {
  const [pulsing, setPulsing] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => { const t = setTimeout(() => setPulsing(false), 1200); return () => clearTimeout(t); }, []);
  useEffect(() => { window.__mapboxRef = { resize: () => {} }; }, []);
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const isMobile = typeof navigator !== "undefined" && /Mobi/i.test(navigator.userAgent);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  return (
    <section className="bg-gradient-to-b from-white to-emerald-50/40">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Explore the NorthSide GTA with Finally Home Agents
          </h1>
          <p className="mt-2 text-gray-600">Hover or tap a town to see highlights and ratings.</p>
        </div>

        {/* Bordered hero box */}
        <div className="relative mx-auto mt-6 mb-10 md:mb-12 rounded-2xl bg-white/70 p-3 shadow-sm border">
          <Styles />

          {/* 1) Map frame: image + pins + 404 (clipped) */}
          <div className="relative rounded-xl overflow-hidden">
            <img
              src="/Images/northside-map.svg"
              alt="NorthSide GTA map with towns"
              className="block w-full h-auto"
            />

            {/* Highway 404 overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
              <line x1={`${HWY404.xPct}%`} y1={`${HWY404.yTopStart}%`} x2={`${HWY404.xPct}%`} y2={`${HWY404.yTopEnd}%`} className="hwy404-glow" />
              <line x1={`${HWY404.xPct}%`} y1={`${HWY404.yTopStart}%`} x2={`${HWY404.xPct}%`} y2={`${HWY404.yTopEnd}%`} className="hwy404-line" />
              <line x1={`${HWY404.xPct}%`} y1={`${HWY404.yBotStart}%`} x2={`${HWY404.xPct}%`} y2={`${HWY404.yBotEnd}%`} className="hwy404-glow" />
              <line x1={`${HWY404.xPct}%`} y1={`${HWY404.yBotStart}%`} x2={`${HWY404.xPct}%`} y2={`${HWY404.yBotEnd}%`} className="hwy404-line" />
            </svg>

            {/* Pins (inside the clipped frame) */}
            {TOWNS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="pin-wrap"
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                aria-label={t.name}
                onClick={() => setOpenId(openId === t.id ? null : t.id)}
                onMouseEnter={() => !isMobile && setHoverId(t.id)}
                onMouseLeave={() => !isMobile && setHoverId(null)}
              >
                <span className="pin" style={{ animationPlayState: pulsing ? "running" : "paused" }} />
                <span className="sr-only">{t.name}</span>
              </button>
            ))}
          </div>

          {/* 2) Tooltip layer: positioned ABOVE the frame so cards are never clipped.
                Matches the inner padding with inset-3 (same as p-3). */}
          <div className="absolute top-3 left-3 right-3 bottom-3 rounded-xl pointer-events-none">
            {TOWNS.map((t) => {
              const active = openId === t.id || (!isMobile && hoverId === t.id);
              if (!active) return null;

              // Tooltip position (relative to the same percent grid)
              const placeAbove = t.y > 68;
              const xOffset = 1.8;
              const yOffset = 2.2;
              const tipLeft = clamp(t.x + xOffset, 2, 98);
              const tipTop  = placeAbove
                ? clamp(t.y - yOffset, 6, 98)
                : clamp(t.y + yOffset, 2, 98);

              return (
                <div
                  key={t.id}
                  className="tooltip pointer-events-auto"
                  style={{
                    left: `${tipLeft}%`,
                    top: `${tipTop}%`,
                    transform: placeAbove ? "translateY(-100%)" : "translateY(0)",
                    opacity: 1,
                  }}
                  onMouseEnter={() => !isMobile && setHoverId(t.id)}
                  onMouseLeave={() => !isMobile && setHoverId(null)}
                >
                  <div className={`tooltip-arrow ${placeAbove ? "arrow-bottom" : "arrow-top"}`} />
                  <div className="p-4 md:p-5 w-[320px] md:w-[360px]">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
                        {t.name.slice(0,1)}
                      </div>
                      <div className="text-[18px] md:text-[20px] font-extrabold tracking-tight">
                        {t.name}
                      </div>
                    </div>

                    {t.blurb && (
                      <div className="text-[14px] leading-5 text-gray-700 mt-2">
                        {t.blurb}
                      </div>
                    )}

                    {/* Ratings (5-dot scale) */}
                    {(() => {
                      const keys = CATEGORY_ORDER.filter(k => t.ratings && t.ratings[k] != null);
                      return keys.length ? (
                        <div className="mt-3 space-y-2">
                          {keys.map(k => (
                            <div key={k} className="flex items-center justify-between">
                              <span className="text-[13px] md:text-[14px] text-gray-800">
                                {CATEGORY_LABELS[k]}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ${
                                      i < Math.round(t.ratings[k]) ? "bg-emerald-600" : "bg-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-[12px] text-gray-400">Ratings coming soon</div>
                      );
                    })()}

                    <a href={t.url} className="inline-block mt-4 text-emerald-700 font-semibold hover:underline">
                      See homes →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
