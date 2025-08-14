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

/* Town pins (percent positions for a 2000×1200 map) */
const TOWNS = [
  {
    id: "georgina",
    name: "Georgina",
    x: 47.35, y: 35.42, url: "/georgina",
    blurb: "Lake life, beaches, and room to roam.",
    ratings: { housePrices: 5, commuterAccess: 4, localTraffic: 4, golf: 4, fishing: 5, trailsNature: 4, restaurants: 3, localEvents: 4 },
  },
  {
    id: "east-gwillimbury",
    name: "East Gwillimbury",
    x: 38.55, y: 46.92, url: "/east-gwillimbury",
    blurb: "New builds, schools & fast 404 access.",
    ratings: { housePrices: 4, commuterAccess: 4, localTraffic: 3, golf: 4, fishing: 3, trailsNature: 4, restaurants: 4, localEvents: 4 },
  },
  {
    id: "newmarket",
    name: "Newmarket",
    x: 32.65, y: 52.08, url: "/newmarket",
    blurb: "Shops, dining, and GO convenience.",
    ratings: { housePrices: 3, commuterAccess: 5, localTraffic: 3, golf: 4, fishing: 3, trailsNature: 4, restaurants: 5, localEvents: 4 },
  },
  {
    id: "aurora",
    name: "Aurora",
    x: 34.95, y: 62.58, url: "/aurora",
    blurb: "Mature neighbourhoods, schools, and quiet streets.",
    ratings: { housePrices: 3, commuterAccess: 5, localTraffic: 3, golf: 4, fishing: 2, trailsNature: 4, restaurants: 4, localEvents: 4 },
  },
  {
    id: "stouffville",
    name: "Stouffville",
    x: 44.95, y: 60.83, url: "/stouffville",
    blurb: "Family streets, parks & a lively Main Street.",
    ratings: { housePrices: 4, commuterAccess: 4, localTraffic: 4, golf: 4, fishing: 3, trailsNature: 4, restaurants: 4, localEvents: 4 },
  },
  {
    id: "uxbridge",
    name: "Uxbridge",
    x: 52.55, y: 54.83, url: "/uxbridge",
    blurb: "Trail capital vibes and small-town charm.",
    ratings: { housePrices: 3, commuterAccess: 3, localTraffic: 5, golf: 5, fishing: 3, trailsNature: 5, restaurants: 4, localEvents: 4 },
  },
  {
    id: "scugog",
    name: "Scugog",
    x: 60.95, y: 59.17, url: "/scugog",
    blurb: "Port Perry heritage + lakefront sunsets.",
    ratings: { housePrices: 4, commuterAccess: 3, localTraffic: 4, golf: 4, fishing: 5, trailsNature: 4, restaurants: 4, localEvents: 5 },
  },
];

/* Highway 404 overlay (two segments) tuned for your map.
   xPct = horizontal center of road.
   yTopStart→yTopEnd draws ABOVE the 404 sign.
   yBotStart→yBotEnd draws BELOW the 404 sign. */
const HWY404 = {
  xPct: 42.4,      // increase to move right, decrease to move left
  yTopStart: 42.9, // upper segment start
  yTopEnd:   50.9, // upper segment end (just above sign)
  yBotStart: 57.6, // lower segment start (just below sign)
  yBotEnd:   71.8, // lower segment end
};

/* ---------- Styles for pins, tooltip, fade overlay, and animated 404 ---------- */
const Styles = () => (
  <style>{`
  @keyframes pinPulse {
    0%   { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0.40); }
    70%  { transform: translate(-50%, -50%) scale(1);    box-shadow: 0 0 0 14px rgba(16,185,129,0.00); }
    100% { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0.00); }
  }
  .pin-wrap   { position:absolute; transform: translate(-50%, -50%); }
  .pin-shadow { position:absolute; left:50%; top:50%; transform: translate(-50%, -50%) scale(1.2);
                width:14px; height:14px; border-radius:999px; box-shadow: 0 10px 16px rgba(4,120,87,.25); }
  .pin        {
    position:absolute; left:50%; top:50%; transform: translate(-50%, -50%);
    width:14px; height:14px; border-radius:999px; border:2px solid #fff;
    background: radial-gradient(65% 65% at 35% 35%, #34d399 0%, #059669 60%, #047857 100%);
    animation: pinPulse 2s ease-out infinite;
  }
  .tooltip {
    position:absolute; z-index:30;
    backdrop-filter: blur(8px);
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(16,185,129,.15);
    border-radius: 16px;
    box-shadow: 0 12px 28px rgba(2,44,34,.18);
    transform-origin: top left;
    transition: opacity .18s ease, transform .18s ease;
  }
  .tooltip-arrow {
    position:absolute; left:14px; width:14px; height:14px; transform: rotate(45deg);
    background: rgba(255,255,255,.92);
    border-left: 1px solid rgba(16,185,129,.15);
    border-top: 1px solid rgba(16,185,129,.15);
    backdrop-filter: blur(8px);
  }
  .arrow-top    { top:-8px; }
  .arrow-bottom { bottom:-8px; }

  /* Animated Highway 404 line + glow */
  .hwy404-line {
    stroke: #10b981;         /* emerald */
    stroke-width: 6;
    stroke-linecap: round;
    stroke-dasharray: 16 14;  /* slightly longer dashes/gaps */
    animation: hwyFlow 1.6s linear infinite;
    filter: drop-shadow(0 0 6px rgba(16,185,129,.35));
  }
  .hwy404-glow {
    stroke: rgba(16,185,129,.35);
    stroke-width: 14;
    stroke-linecap: round;
    filter: blur(3px);
    opacity: .55;
    animation: hwyGlow 2.8s ease-in-out infinite;
  }
  /* NORTHBOUND flow (positive offset) */
  @keyframes hwyFlow { to { stroke-dashoffset: 22; } }
  @keyframes hwyGlow { 0%,100% { opacity:.35 } 50% { opacity:.75 } }
  `}</style>
);

export default function MapHero() {
  const [openId, setOpenId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [pulsing, setPulsing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPulsing(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Close on ESC
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

        {/* Map container */}
        <div className="relative mx-auto mt-6 rounded-2xl bg-white/70 p-3 shadow-sm border">
          {/* No overflow-hidden here—tooltips may extend past the image */}
          <div className="relative">
            <Styles />

            {/* dim/zoom when a card is open */}
            <div className="relative">
              <img
                src="/Images/northside-map.svg"
                alt="NorthSide GTA map with towns"
                className={`w-full h-auto block rounded-xl transition-transform duration-300 ${openId ? "scale-[1.01]" : ""}`}
              />
              <div
                className={`absolute inset-0 rounded-xl transition-colors duration-300 pointer-events-none ${openId ? "bg-emerald-900/10" : "bg-transparent"}`}
              />
            </div>

            {/* ---------- Highway 404 overlay (two segments) + car dots ---------- */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
              {/* Upper glow */}
              <line
                x1={`${HWY404.xPct}%`} y1={`${HWY404.yTopStart}%`}
                x2={`${HWY404.xPct}%`} y2={`${HWY404.yTopEnd}%`}
                className="hwy404-glow"
              />
              {/* Upper moving dash (northbound) */}
              <line
                x1={`${HWY404.xPct}%`} y1={`${HWY404.yTopStart}%`}
                x2={`${HWY404.xPct}%`} y2={`${HWY404.yTopEnd}%`}
                className="hwy404-line"
              />

              {/* Lower glow */}
              <line
                x1={`${HWY404.xPct}%`} y1={`${HWY404.yBotStart}%`}
                x2={`${HWY404.xPct}%`} y2={`${HWY404.yBotEnd}%`}
                className="hwy404-glow"
              />
              {/* Lower moving dash */}
              <line
                x1={`${HWY404.xPct}%`} y1={`${HWY404.yBotStart}%`}
                x2={`${HWY404.xPct}%`} y2={`${HWY404.yBotEnd}%`}
                className="hwy404-line"
              />

              {/* ====== “Car” dots (northbound) ====== */}
              {/* Each "car" is 2 circles (emerald outer + white center) with SMIL animate on cy */}
              {/* Upper segment cars */}
              <g>
                {/* Car A */}
                <circle r="3.2" cx={`${HWY404.xPct}%`} cy={`${HWY404.yTopEnd}%`} fill="#10b981">
                  <animate attributeName="cy" from={`${HWY404.yTopEnd}%`} to={`${HWY404.yTopStart}%`} dur="2.2s" begin="0s" repeatCount="indefinite" />
                </circle>
                <circle r="1.4" cx={`${HWY404.xPct}%`} cy={`${HWY404.yTopEnd}%`} fill="#ffffff">
                  <animate attributeName="cy" from={`${HWY404.yTopEnd}%`} to={`${HWY404.yTopStart}%`} dur="2.2s" begin="0s" repeatCount="indefinite" />
                </circle>
              </g>
              <g>
                {/* Car B (staggered) */}
                <circle r="3.2" cx={`${HWY404.xPct}%`} cy={`${HWY404.yTopEnd}%`} fill="#10b981">
                  <animate attributeName="cy" from={`${HWY404.yTopEnd}%`} to={`${HWY404.yTopStart}%`} dur="2.6s" begin="0.7s" repeatCount="indefinite" />
                </circle>
                <circle r="1.4" cx={`${HWY404.xPct}%`} cy={`${HWY404.yTopEnd}%`} fill="#ffffff">
                  <animate attributeName="cy" from={`${HWY404.yTopEnd}%`} to={`${HWY404.yTopStart}%`} dur="2.6s" begin="0.7s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Lower segment cars */}
              <g>
                {/* Car C */}
                <circle r="3.2" cx={`${HWY404.xPct}%`} cy={`${HWY404.yBotEnd}%`} fill="#10b981">
                  <animate attributeName="cy" from={`${HWY404.yBotEnd}%`} to={`${HWY404.yBotStart}%`} dur="2.0s" begin="0.3s" repeatCount="indefinite" />
                </circle>
                <circle r="1.4" cx={`${HWY404.xPct}%`} cy={`${HWY404.yBotEnd}%`} fill="#ffffff">
                  <animate attributeName="cy" from={`${HWY404.yBotEnd}%`} to={`${HWY404.yBotStart}%`} dur="2.0s" begin="0.3s" repeatCount="indefinite" />
                </circle>
              </g>
              <g>
                {/* Car D (staggered) */}
                <circle r="3.2" cx={`${HWY404.xPct}%`} cy={`${HWY404.yBotEnd}%`} fill="#10b981">
                  <animate attributeName="cy" from={`${HWY404.yBotEnd}%`} to={`${HWY404.yBotStart}%`} dur="2.4s" begin="1s" repeatCount="indefinite" />
                </circle>
                <circle r="1.4" cx={`${HWY404.xPct}%`} cy={`${HWY404.yBotEnd}%`} fill="#ffffff">
                  <animate attributeName="cy" from={`${HWY404.yBotEnd}%`} to={`${HWY404.yBotStart}%`} dur="2.4s" begin="1s" repeatCount="indefinite" />
                </circle>
              </g>
            </svg>

            {/* Pins + tooltips */}
            {TOWNS.map((t) => {
              const active = openId === t.id || (!isMobile && hoverId === t.id);

              // Flip above for lower-half pins; clamp to keep card in-bounds
              const placeAbove = t.y > 68;
              const xOffset = 1.8;
              const yOffset = 2.2;

              const tipLeft = clamp(t.x + xOffset, 2, 98);
              const tipTop  = placeAbove
                ? clamp(t.y - yOffset, 6, 98)   // anchor bottom to pin
                : clamp(t.y + yOffset, 2, 98);  // anchor top to pin

              return (
                <div key={t.id}>
                  <button
                    type="button"
                    className="pin-wrap"
                    style={{ left: `${t.x}%`, top: `${t.y}%` }}
                    aria-label={t.name}
                    onClick={() => setOpenId(openId === t.id ? null : t.id)}
                    onMouseEnter={() => !isMobile && setHoverId(t.id)}
                    onMouseLeave={() => !isMobile && setHoverId(null)}
                  >
                    <span className="pin-shadow" aria-hidden />
                    <span
                      className="pin"
                      aria-hidden
                      style={{ animationPlayState: pulsing ? "running" : "paused" }}
                    />
                    <span className="sr-only">{t.name}</span>
                  </button>

                  {active && (
                    <div
                      className="tooltip"
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

                        {/* Rating rows (5-dot scale) */}
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
                                          i < Math.round(t.ratings[k])
                                            ? "bg-emerald-600"
                                            : "bg-gray-300"
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

                        <a
                          href={t.url}
                          className="inline-block mt-4 text-emerald-700 font-semibold hover:underline"
                        >
                          See homes →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Under-map list for accessibility/SEO */}
        <div className="mx-auto mt-6 max-w-6xl text-center">
          <p className="text-xs text-gray-500">
            Prefer a list? Explore:{" "}
            {TOWNS.map((t, i) => (
              <a key={t.id} href={t.url} className="text-emerald-700 hover:underline">
                {t.name}
                {i < TOWNS.length - 1 ? ", " : ""}
              </a>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
