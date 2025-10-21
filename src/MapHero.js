// src/MapHero.js
import React, { useEffect, useRef, useState } from "react";
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
  .pin-wrap {
    position:absolute;
    left: calc(var(--map-offset-x, 0px) + var(--map-width, 0px) * var(--pin-x, 0));
    top: calc(var(--map-offset-y, 0px) + var(--map-height, 0px) * var(--pin-y, 0));
    transform:translate(-50%, -50%);
  }
  .pin {
    position:absolute; left:50%; top:50%; transform:translate(-50%, -50%);
    width:14px; height:14px; border-radius:999px; border:2px solid #fff;
    background: radial-gradient(65% 65% at 35% 35%, #34d399 0%, #059669 60%, #047857 100%);
    animation: pinPulse 2s ease-out infinite;
  }
  /* ===== LAYOUT: exact 18% | 64% | 18%, no gaps ===== */
  .hero-shell {
    /* one height variable for hero + panels */
    --heroH: clamp(520px, 58vh, 680px);

    display: grid;
    grid-template-columns: 18% 64% 18%;
    align-items: stretch;     /* panels match hero height */
    gap: 0;                   /* no gap between columns */
    position: relative;
    border-radius: 28px;
    overflow: hidden;         /* keeps everything inside rounded frame */
    min-height: var(--heroH);
  }

  /* handle layouts where one or both panels are hidden */
  .hero-shell.no-left {
    grid-template-columns: 64% 18%;
  }
  .hero-shell.no-left .hero-core {
    grid-column: 1;
  }
  .hero-shell.no-left .panel-right {
    grid-column: 2;
  }
  .hero-shell.no-right {
    grid-template-columns: 18% 64%;
  }
  .hero-shell.no-right .hero-core {
    grid-column: 2;
  }
  .hero-shell.no-panels {
    grid-template-columns: 1fr;
  }
  .hero-shell.no-panels .hero-core {
    grid-column: 1;
  }

  /* columns */
  .panel-left  { grid-column: 1; }
  .hero-core   { grid-column: 2; }
  .panel-right { grid-column: 3; }

  /* ===== HERO (center) must not crop and must be centered ===== */
  .hero-core {
    height: var(--heroH);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;                /* kill any default margins */
    padding: 0;               /* flush against panels */
    overflow: hidden;
  }
  .hero-core-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }
  .hero-map-frame {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    overflow: hidden;
  }

  /* Whatever renders the map/image */
  .hero-core img,
  .hero-core canvas,
  .hero-core video,
  .hero-core .map-root {
    max-height: 100%;         /* fill the available height */
    max-width: 100%;          /* but never overflow width */
    width: auto;              /* keeps aspect ratio */
    height: auto;             /* keeps aspect ratio */
    object-fit: contain;      /* no cropping */
    display: block;
  }

  /* ===== PANELS (same height as hero, no outer gaps) ===== */
  .panel {
    height: var(--heroH);
    margin: 0;                /* ensure no external margins */
    padding: 24px 22px;       /* internal breathing room is fine */
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: linear-gradient(180deg, rgba(6,34,16,.84) 0%, rgba(6,34,16,.74) 100%);
    color: #F4FFF1;
    box-shadow: inset 1px 0 0 rgba(255,255,255,0.06), inset -1px 0 0 rgba(0,0,0,0.12);
    overflow: auto;
  }
  .panel > * {
    width: 100%;
  }

  /* Text legibility + brevity */
  .panel h1, .panel h2, .panel h3,
  .panel p, .panel li, .panel small,
  .panel label { color: #F4FFF1; }
  .panel p { max-width: 36ch; line-height: 1.45; }
  .panel ul { margin: 12px 0 0; }
  .panel li { margin: 6px 0; }

  /* ===== TICKER: flush to bottom of hero ===== */
  .hero-ticker {
    grid-column: 1 / -1;
    align-self: end;
    margin-top: 0;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .hero-shell + .hero-ticker {
    margin-top: 0;            /* no gap between hero and ticker */
  }

  /* Ensure overlay pieces stay above */
  .hero-shell * { z-index: 0; }
  .panel, .hero-core { z-index: 1; }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 1200px) {
    .hero-shell {
      --heroH: clamp(480px, 54vh, 640px);
      grid-template-columns: 22% 56% 22%;
    }
    .hero-shell.no-left {
      grid-template-columns: 56% 22%;
    }
    .hero-shell.no-right {
      grid-template-columns: 22% 56%;
    }
    .panel {
      padding: 20px;
    }
  }
  @media (max-width: 980px) {
    .hero-shell {
      grid-template-columns: 1fr;
      --heroH: clamp(420px, 52vh, 580px);
    }
    .panel-left, .hero-core, .panel-right {
      grid-column: 1;
    }
    .panel {
      height: auto;
      padding: 20px;
    }
    .hero-core {
      height: var(--heroH);
    }
  }
  `}</style>
);

/* ────────────────────────────────────────────────────────────
   Compact rating row
   ──────────────────────────────────────────────────────────── */
function RatingRow({ label, value, tone = "emerald" }) {
  const v = Math.round(value || 0);
  const percent = Math.max(0, Math.min(100, (v / 5) * 100));
  const isPanel = tone === "panel";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`min-w-0 pr-1 text-[12px] font-semibold md:text-[13px] ${
            isPanel ? "text-emerald-50" : "text-emerald-900"
          }`}
        >
          {label}
        </span>
        <div className="flex flex-none items-center gap-1.5">
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`h-[7px] w-[7px] rounded-full md:h-[8px] md:w-[8px] ${
                  i < v
                    ? isPanel
                      ? "bg-gradient-to-br from-emerald-200 via-emerald-300 to-teal-200 shadow-[0_0_8px_rgba(94,234,212,0.45)]"
                      : "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_6px_rgba(16,185,129,0.45)]"
                    : isPanel
                    ? "bg-white/18"
                    : "bg-emerald-100"
                }`}
              />
            ))}
          </div>
          <span
            className={`text-[11px] font-semibold ${
              isPanel ? "text-emerald-100" : "text-emerald-600"
            }`}
          >
            {v}/5
          </span>
        </div>
      </div>
      <div
        className={`h-[6px] w-full rounded-full ${
          isPanel ? "bg-white/12" : "bg-emerald-100/80"
        }`}
      >
        <div
          className={`h-full rounded-full ${
            isPanel
              ? "bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(94,234,212,0.45)]"
              : "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
          }`}
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
  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const [mapMetrics, setMapMetrics] = useState({
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const t = setTimeout(() => setPulsing(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // keep the “map resize nudge” stub
  useEffect(() => {
    window.__mapboxRef = { resize: () => {} };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const frameEl = frameRef.current;
    const imageEl = imageRef.current;

    if (!frameEl || !imageEl) {
      return undefined;
    }

    let animationFrame = null;

    const updateMetrics = () => {
      if (!frameRef.current || !imageRef.current) {
        return;
      }

      const frameRect = frameRef.current.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();

      if (!imageRect.width || !imageRect.height) {
        return;
      }

      const next = {
        offsetX: imageRect.left - frameRect.left,
        offsetY: imageRect.top - frameRect.top,
        width: imageRect.width,
        height: imageRect.height,
      };

      setMapMetrics((prev) => {
        const delta =
          Math.abs(prev.offsetX - next.offsetX) +
          Math.abs(prev.offsetY - next.offsetY) +
          Math.abs(prev.width - next.width) +
          Math.abs(prev.height - next.height);

        if (delta < 0.5) {
          return prev;
        }

        return next;
      });
    };

    const scheduleUpdate = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      animationFrame = requestAnimationFrame(updateMetrics);
    };

    const handleResize = () => scheduleUpdate();

    const handleLoad = () => scheduleUpdate();

    if (imageEl.complete) {
      scheduleUpdate();
    } else {
      imageEl.addEventListener("load", handleLoad, { once: false });
    }

    window.addEventListener("resize", handleResize);

    let resizeObserver = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(frameEl);
      resizeObserver.observe(imageEl);
    }

    scheduleUpdate();

    return () => {
      window.removeEventListener("resize", handleResize);
      imageEl.removeEventListener("load", handleLoad);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
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

  const heroShellClasses = [
    "hero-shell",
    !embedded ? "no-panels" : "",
    embedded && !showQuickContact ? "no-left" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const insightMode = canHover ? "desktop" : "mobile";

  return (
    <section className={sectionClasses}>
      <div className={containerClasses}>
        {/* Bordered hero box (map + inline quick-contact) */}
        <div className={frameClasses}>
          <Styles />
          {embedded ? (
            <div className={heroShellClasses}>
              {showQuickContact ? (
                <aside className="panel panel-left">
                  <QuickContactCard
                    variant="overlay"
                    className="h-full"
                  />
                </aside>
              ) : null}

              <div className="hero-core">
                <div className="hero-core-inner">
                  <div
                    ref={frameRef}
                    className="hero-map-frame map-hero"
                    style={{
                      "--map-offset-x": `${mapMetrics.offsetX}px`,
                      "--map-offset-y": `${mapMetrics.offsetY}px`,
                      "--map-width": `${mapMetrics.width}px`,
                      "--map-height": `${mapMetrics.height}px`,
                    }}
                    onMouseLeave={() => canHover && setHoverId(null)}
                  >
                    <img
                      ref={imageRef}
                      src="/Images/northside-map.svg?v=2"
                      alt="NorthSide GTA map with towns"
                      className="block"
                    />

                    {(mapMetrics.width > 0 && mapMetrics.height > 0
                      ? TOWNS
                      : []
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="pin-wrap"
                        style={{ "--pin-x": t.x / 100, "--pin-y": t.y / 100 }}
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
                  </div>

                  <LiveTicker />
                </div>
              </div>

              <aside className="panel panel-right">
                <TownInsightCard
                  town={activeTown}
                  mode={insightMode}
                  onDismiss={() => setOpenId(null)}
                  className="flex h-full flex-col"
                  appearance="panel"
                />
              </aside>
            </div>
          ) : (
            <div
              className="relative overflow-hidden rounded-[32px] map-hero"
              onMouseLeave={() => canHover && setHoverId(null)}
            >
              <img
                src="/Images/northside-map.svg?v=2"
                alt="NorthSide GTA map with towns"
                className="block h-auto w-full"
              />

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

              <LiveTicker />
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

function TownInsightCard({
  town,
  mode = "desktop",
  onDismiss,
  className = "",
  appearance = "default",
}) {
  const isMobile = mode === "mobile";
  const isPanel = appearance === "panel";
  const hasTown = Boolean(town);

  const containerClasses = [
    className,
    isPanel
      ? isMobile
        ? "flex flex-col overflow-hidden rounded-[26px] border border-white/12 bg-emerald-950/75 shadow-[0_24px_60px_rgba(2,15,10,0.45)] backdrop-blur-xl"
        : "pointer-events-auto flex h-full flex-col overflow-hidden rounded-[30px] border border-white/12 bg-emerald-950/65 shadow-[0_32px_90px_rgba(2,15,10,0.5)] backdrop-blur-xl"
      : isMobile
      ? "rounded-[26px] border border-emerald-200/80 bg-white/96 shadow-xl shadow-emerald-900/10"
      : "pointer-events-auto overflow-hidden rounded-[30px] border border-emerald-200/70 bg-white/96 shadow-[0_24px_60px_rgba(2,33,24,0.18)] backdrop-blur",
  ]
    .filter(Boolean)
    .join(" ");

  const headerClasses = [
    isPanel
      ? isMobile
        ? "flex-none border-b border-white/12 bg-white/10 px-4 py-3 text-white"
        : "flex-none border-b border-white/10 bg-white/8 px-5 py-4 text-white"
      : isMobile
      ? "flex-none rounded-t-[26px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 px-4 py-3 text-white"
      : "flex-none rounded-t-[30px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 px-5 py-4 text-white",
  ].join(" ");

  const bodyClasses = [
    isPanel
      ? isMobile
        ? "space-y-4 px-4 py-4 text-emerald-50/90"
        : "flex-1 space-y-5 overflow-y-auto px-5 py-5 text-emerald-50/90"
      : isMobile
      ? "space-y-4 px-4 py-4"
      : "flex-1 space-y-5 overflow-y-auto px-5 py-5",
  ].join(" ");

  if (!hasTown) {
    return (
      <div className={containerClasses}>
        <div className={headerClasses}>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                isPanel ? "bg-white/15" : "bg-white/20"
              }`}
            >
              🧭
            </div>
            <div>
              <p
                className={`text-[11px] uppercase tracking-[0.32em] ${
                  isPanel ? "text-emerald-100/70" : "text-emerald-100/80"
                }`}
              >
                Town insights
              </p>
              <p className="text-lg font-semibold leading-tight md:text-xl">
                Hover a town to unlock live intel.
              </p>
            </div>
          </div>
        </div>
        <div className={bodyClasses}>
          <p
            className={`text-sm leading-relaxed ${
              isPanel ? "text-emerald-50/85" : "text-emerald-900/80"
            }`}
          >
            Explore the map to preview pricing, commute notes, and lifestyle scores across the
            NorthSide GTA.
          </p>
          <div
            className={`grid grid-cols-2 gap-2 text-sm font-semibold ${
              isPanel ? "text-emerald-50/95" : "text-emerald-900/85"
            }`}
          >
            {TOWNS.map((t) => (
              <div
                key={t.id}
                className={`rounded-xl px-3 py-2 text-center shadow-sm ${
                  isPanel
                    ? "border border-white/14 bg-white/10 shadow-black/30"
                    : "border border-emerald-100/70 bg-emerald-50/70"
                }`}
              >
                {t.name}
              </div>
            ))}
          </div>
          <p
            className={`text-[11px] uppercase tracking-[0.28em] ${
              isPanel ? "text-emerald-100/70" : "text-emerald-500/80"
            }`}
          >
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
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                isPanel ? "bg-white/15" : "bg-white/20"
              }`}
            >
              {town.name.slice(0, 1)}
            </div>
            <div className="text-left">
              <p
                className={`text-[11px] uppercase tracking-[0.32em] ${
                  isPanel ? "text-emerald-100/70" : "text-emerald-100/80"
                }`}
              >
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
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-base transition ${
                  isPanel
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                ×
              </button>
            ) : null}
            <a
              href={town.url}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] transition ${
                isPanel
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              See town
            </a>
          </div>
        </div>
      </div>
      <div className={bodyClasses}>
        {town.blurb && (
          <p
            className={`text-sm leading-relaxed md:text-[15px] ${
              isPanel ? "text-emerald-50/90" : "text-emerald-900/85"
            }`}
          >
            {town.blurb}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CATEGORY_ORDER.filter(
            (k) => town.ratings && town.ratings[k] != null
          ).map((k) => (
            <div
              key={k}
              className={`rounded-2xl p-3 shadow-sm ${
                isPanel
                  ? "border border-white/14 bg-white/8 shadow-black/30"
                  : "border border-emerald-100/70 bg-white/70 shadow-emerald-900/10"
              }`}
            >
              <RatingRow
                label={CATEGORY_LABELS[k]}
                value={town.ratings[k]}
                tone={isPanel ? "panel" : "emerald"}
              />
            </div>
          ))}
        </div>

        <div
          className={`text-[11px] uppercase tracking-[0.28em] ${
            isPanel ? "text-emerald-100/70" : "text-emerald-500/80"
          }`}
        >
          ★★★★★ Google reviews • Local data refreshed nightly
        </div>
      </div>
    </div>
  );
}
