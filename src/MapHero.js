// src/MapHero.js
import React, { useEffect, useRef, useState, useId, useLayoutEffect } from "react";
import { ChevronRight, Flag, Landmark, PiggyBank, Train, Users } from "lucide-react";
import { Link } from "react-router-dom";
import QuickContactCard from "./QuickContactCard";
import { guidedPaths } from "./data/guidedPaths";

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

const TOWN_LOGO_PATHS = {
  georgina: "/assets/town-logos/georgina.webp",
  "east-gwillimbury": "/assets/town-logos/east-gwillimbury.webp",
  newmarket: "/assets/town-logos/newmarket.webp",
  aurora: "/assets/town-logos/aurora.webp",
  stouffville: "/assets/town-logos/stouffville.webp",
  scugog: "/assets/town-logos/scugog.webp",
  uxbridge: "/assets/town-logos/uxbridge.webp",
};

/* ────────────────────────────────────────────────────────────
   Town pins (percent positions for your SVG map)
   ──────────────────────────────────────────────────────────── */
const TOWNS = [
  {
    id: "georgina",
    name: "Georgina",
    x: 50.25,
    y: 26.74,
    url: "/communities/georgina",
    blurb: "Lake life, beaches, and room to roam.",
    logo: TOWN_LOGO_PATHS.georgina,
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
    y: 33.94,
    url: "/communities/east-gwillimbury",
    blurb: "New builds, schools & fast 404 access.",
    logo: TOWN_LOGO_PATHS["east-gwillimbury"],
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
    y: 42.86,
    url: "/communities/newmarket",
    blurb: "Shops, dining, and GO convenience.",
    logo: TOWN_LOGO_PATHS.newmarket,
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
    y: 49.14,
    url: "/communities/aurora",
    blurb: "Mature neighbourhoods, schools, and quiet streets.",
    logo: TOWN_LOGO_PATHS.aurora,
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
    y: 46.86,
    url: "/communities/stouffville",
    blurb: "Family streets, parks & a lively Main Street.",
    logo: TOWN_LOGO_PATHS.stouffville,
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
    y: 43.74,
    url: "/communities/scugog",
    blurb: "Port Perry heritage + lakefront sunsets.",
    logo: TOWN_LOGO_PATHS.scugog,
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
    y: 41.6,
    url: "/communities/uxbridge",
    blurb: "Trail capital vibes and small-town charm.",
    logo: TOWN_LOGO_PATHS.uxbridge,
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

const PANEL_CHIPS = [
  "Pricing snapshot",
  "Commute notes",
  "School scorecards",
  "Lifestyle vibe",
];

const CATEGORY_ICONS = {
  housePrices: function HouseIcon(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M4 11.5L12 5l8 6.5" />
        <path d="M6.5 10.5V19a1 1 0 0 0 1 1H16.5a1 1 0 0 0 1-1v-8.5" />
        <path d="M10.25 20v-4.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 .75.75V20" />
      </svg>
    );
  },
  commuterAccess: function RouteIcon(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M4 19h3" />
        <path d="M17 19h3" />
        <path d="M7 19l10-14" />
        <path d="M5 7.5c0-1.38 1.12-2.5 2.5-2.5S10 6.12 10 7.5 8.88 10 7.5 10 5 8.88 5 7.5Z" />
        <path d="M14 16.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5Z" />
      </svg>
    );
  },
  localTraffic: function KeysIcon(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M7 18h10" />
        <path d="M5 15.5 9 6h6l4 9.5" />
        <path d="M9.5 13h5" />
        <path d="M10 9.5h4" />
      </svg>
    );
  },
  golf: function GolfIcon(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M10 20V4l8 3.5-8 3.5" />
        <path d="M6 20h12" />
        <path d="M10 20a2 2 0 1 0 4 0" />
      </svg>
    );
  },
  fishing: function FishingIcon(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M5 4.5v9a4.5 4.5 0 1 0 9 0v-8" />
        <path d="M20 5c-2 0-3 .75-3 2.2 0 2.3 3 3.3 3 5.3 0 1.45-1 2.5-2.5 2.5-.9 0-1.64-.42-2.06-1.04" />
        <path d="M11 8c-.72-1.1-1.95-1.75-3.25-1.75S5.22 6.9 4.5 8" />
      </svg>
    );
  },
  trailsNature: function TrailsIcon(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 3 7 9.5h3V21" />
        <path d="M12 3 17 9.5h-3V21" />
        <path d="M8.5 15c.65-.6 1.5-1 2.5-1s1.85.4 2.5 1" />
        <path d="M8.5 18.5c.65-.6 1.5-1 2.5-1s1.85.4 2.5 1" />
      </svg>
    );
  },
  restaurants: function DiningIcon(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M6 4v7" />
        <path d="M10 4v7" />
        <path d="M6 11c0 1.66 1.12 3 2.5 3S11 12.66 11 11V4" />
        <path d="M17 4c1.38 0 2.5 1.12 2.5 2.5S18.38 9 17 9h-1V20" />
      </svg>
    );
  },
  localEvents: function EventsIcon(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4.5 9h15" />
        <rect x="4.5" y="6" width="15" height="14" rx="2" />
        <path d="M9 14h2" />
        <path d="M13 14h2" />
        <path d="M9 17h2" />
      </svg>
    );
  },
};

/* ────────────────────────────────────────────────────────────
   Inline styles for map pins/panel polish
   ──────────────────────────────────────────────────────────── */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const Styles = () => (
  <style>{`
  @keyframes pinPulse {
    0%   { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(50,97,14,0.35); }
    70%  { transform: translate(-50%, -50%) scale(1);    box-shadow: 0 0 0 14px rgba(50,97,14,0.00); }
    100% { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(50,97,14,0.00); }
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
    background: radial-gradient(65% 65% at 35% 35%, #32610E 0%, #28520C 60%, #22440A 100%);
    animation: pinPulse 2s ease-out infinite;
  }
  /* ===== Desktop Hero Layout — 20 | 60 | 20 ===== */
  .hero-shell {
    --hero-map-h: clamp(640px, 66vh, 820px);
    --hero-panels-h: var(--hero-map-h);

    display: grid;
    grid-template-columns: 20% 60% 20%;
    align-items: stretch;
    gap: 0;
    margin: 0;
    padding: 0;
    position: relative;
    border-radius: 28px;
    overflow: hidden;
    min-height: var(--hero-panels-h);
    width: 100%;
  }

  /* handle layouts where one or both panels are hidden */
  .hero-shell.no-left {
    grid-template-columns: 60% 20%;
  }
  .hero-shell.no-left .hero-core {
    grid-column: 1;
  }
  .hero-shell.no-left .panel-right {
    grid-column: 2;
  }
  .hero-shell.no-right {
    grid-template-columns: 20% 60%;
  }
  .hero-shell.no-right .hero-core {
    grid-column: 2;
  }
  .hero-shell.no-right .panel-left {
    grid-column: 1;
  }
  .hero-shell.no-panels {
    grid-template-columns: 1fr;
  }
  .hero-shell.no-panels .hero-core {
    grid-column: 1;
  }

  /* column placement */
  .panel-left  { grid-column: 1; }
  .hero-core   { grid-column: 2; }
  .panel-right { grid-column: 3; }

  /* ===== Hero (center) ===== */
  .hero-core {
    min-height: var(--hero-panels-h);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
  .hero-core-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    flex: 1 1 auto;
    gap: 0;
  }
  .hero-map-frame {
    position: relative;
    flex: 1 1 auto;
    min-height: var(--hero-map-h);
    display: flex;
    align-items: flex-start;
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

  /* ===== Panels ===== */
  .panel {
    min-height: var(--hero-panels-h);
    max-height: var(--hero-panels-h);
    margin: 0;
    padding: 26px 22px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow-x: hidden;
    overflow-y: auto;
    background: linear-gradient(180deg, rgba(6,34,16,0.86) 0%, rgba(6,34,16,0.76) 100%);
    color: #F4FFF1;
    box-shadow: inset 1px 0 0 rgba(255,255,255,0.06), inset -1px 0 0 rgba(0,0,0,0.12);
  }
  .panel.panel-right {
    justify-content: flex-start;
    padding-top: 0;
    padding-bottom: 0;
  }
  .panel.panel-right > * {
    height: 100%;
  }
  .panel > * {
    width: 100%;
  }

  /* Typography (compact & legible) */
  .panel h1, .panel h2 {
    font-size: clamp(22px, 2vw, 28px);
    line-height: 1.15;
    margin-bottom: 10px;
    color: #F4FFF1;
  }
  .panel h3, .panel h4,
  .panel p, .panel li, .panel small,
  .panel label {
    color: #F4FFF1;
  }
  .panel p {
    font-size: 15px;
    line-height: 1.45;
    max-width: 38ch;
    margin: 0 0 12px 0;
  }
  .panel ul {
    margin: 12px 0 0;
  }
  .panel li {
    margin: 6px 0;
  }

  /* Compact insights grid */
  .insights-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .insights-grid .chip {
    font-size: 14px;
    padding: 8px 10px;
    border-radius: 12px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.14);
    color: #F4FFF1;
    text-align: center;
  }

  /* Prevent external padding/margins */
  .hero-shell,
  .hero-core,
  .panel,
  .panel > * {
    box-sizing: border-box;
  }

  /* ===== TICKER: stacked below the map ===== */
  .hero-ticker-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
  }
  .hero-ticker-content > * {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
  }

  /* Ensure overlay pieces stay above */
  .hero-shell * { z-index: 0; }
  .panel, .hero-core { z-index: 1; }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 1200px) {
    .hero-shell {
      --hero-map-h: clamp(560px, 60vh, 760px);
      --hero-panels-h: var(--hero-map-h);
      grid-template-columns: 24% 52% 24%;
    }
    .hero-shell.no-left {
      grid-template-columns: 52% 24%;
    }
    .hero-shell.no-right {
      grid-template-columns: 24% 52%;
    }
    .panel {
      padding: 22px 20px;
    }
  }
  @media (max-width: 980px) {
    .hero-frame {
      display: flex;
      flex-direction: column;
    }
    .hero-shell {
      --hero-map-h: auto;
      --hero-panels-h: auto;
      display: contents;
    }
    .hero-core {
      order: 1;
      display: contents;
      min-height: auto;
    }
    .hero-core-inner {
      display: contents;
    }
    .hero-map-frame {
      order: 1;
      min-height: auto;
      width: 100%;
      margin: 0;
      border-radius: 32px;
      overflow: hidden;
    }
    .panel {
      min-height: auto;
      height: auto;
      max-height: none;
      padding: 20px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .panel-left {
      order: 2;
      margin-top: 0;
      overflow: visible;
      max-height: none;
    }
    .hero-after {
      order: 3;
      margin-top: 16px;
    }
    .hero-ticker-content {
      order: 4;
      margin-top: 20px;
    }
    .panel-right {
      order: 5;
      margin-top: 20px;
      overflow-y: auto;
    }
    .panel.panel-right > * {
      height: auto;
    }
    .mobile-accordion {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .mobile-accordion-region {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.35s ease;
    }
    .mobile-accordion-region.open {
      max-height: 70vh;
    }
    .mobile-accordion-content {
      max-height: 70vh;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .panel-right .panel-summary {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .hero-shell .pin-wrap,
    .hero-map-frame .pin-wrap {
      display: none;
    }
  }
  `}</style>
);

function TownGlyph({ className = "" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M4 14.4 15.64 5.2a1.5 1.5 0 0 1 1.72 0L28 14.4V27a1 1 0 0 1-1 1h-6.75a.75.75 0 0 1-.75-.75V21h-7v6.25a.75.75 0 0 1-.75.75H5a1 1 0 0 1-1-1z"
        fill="currentColor"
        fillOpacity="0.92"
      />
      <path
        d="M2.75 15.1a1 1 0 0 1 .25-1.39l12-8.7a1 1 0 0 1 1.2 0l12 8.7a1 1 0 1 1-1.14 1.64L16 7.22 3.94 15.65a1 1 0 0 1-1.19-.55z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Compact rating row
   ──────────────────────────────────────────────────────────── */
function RatingRow({ label, value, tone = "emerald", icon: Icon }) {
  const v = Math.round(value || 0);
  const percent = Math.max(0, Math.min(100, (v / 5) * 100));
  const isPanelDesktop = tone === "panel-desktop";
  const isPanelMobile = tone === "panel-mobile";
  const isPanel = isPanelDesktop || isPanelMobile;

  const labelColor = isPanelDesktop
    ? "text-emerald-50/95"
    : isPanelMobile
    ? "text-emerald-50"
    : "text-emerald-900";

  const iconHaloClass = isPanelDesktop
    ? "border-white/15 bg-emerald-500/15 text-emerald-100 shadow-[0_4px_12px_rgba(34,68,10,0.45)]"
    : isPanelMobile
    ? "border-white/25 bg-white/15 text-emerald-50 shadow-[0_3px_10px_rgba(50,97,14,0.4)]"
    : "border-emerald-200/80 bg-emerald-50 text-emerald-600 shadow-[0_4px_10px_rgba(50,97,14,0.18)]";

  const filledDotClass = isPanelDesktop
    ? "bg-gradient-to-br from-emerald-200 via-emerald-300 to-amber-200/90"
    : isPanelMobile
    ? "bg-gradient-to-br from-emerald-200 via-emerald-300 to-amber-200 shadow-[0_0_8px_rgba(94,234,212,0.45)]"
    : "bg-gradient-to-br from-emerald-400 via-emerald-500 to-amber-300 shadow-[0_0_8px_rgba(50,97,14,0.38)]";

  const emptyDotClass = isPanelDesktop
    ? "bg-emerald-900/45"
    : isPanelMobile
    ? "bg-white/18"
    : "bg-emerald-100";

  const scoreColor = isPanelDesktop
    ? "text-emerald-50/90"
    : isPanelMobile
    ? "text-emerald-100"
    : "text-emerald-600";

  const trackColor = isPanelDesktop
    ? "bg-emerald-900/40"
    : isPanelMobile
    ? "bg-white/12"
    : "bg-emerald-100/80";

  const fillColor = isPanelDesktop
    ? "bg-gradient-to-r from-emerald-200 via-emerald-300 to-amber-200"
    : isPanelMobile
    ? "bg-gradient-to-r from-emerald-300 via-emerald-400 to-amber-200 shadow-[0_0_12px_rgba(94,234,212,0.45)]"
    : "bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-300 shadow-[0_0_12px_rgba(50,97,14,0.3)]";

  const rowLayoutClasses = isPanelDesktop
    ? "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"
    : "flex items-center justify-between gap-2";
  const labelContainerClasses = "flex min-w-0 items-center gap-2";
  const labelTextClasses = `block min-w-0 pr-1 text-left text-[12px] font-semibold md:text-[13px] ${labelColor} ${
    isPanelDesktop ? "leading-tight whitespace-normal" : ""
  }`;
  const ratingContainerClasses = `flex flex-none shrink-0 items-center gap-1.5 ${
    isPanelDesktop ? "justify-self-end" : ""
  }`;

  return (
    <div className="space-y-2">
      <div className={rowLayoutClasses}>
        <div className={labelContainerClasses}>
          {Icon ? (
            <span
              className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border ${iconHaloClass}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          ) : null}
          <span
            className={labelTextClasses}
            style={isPanelDesktop ? { wordBreak: "keep-all" } : undefined}
          >
            {label}
          </span>
        </div>
        <div className={ratingContainerClasses}>
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`h-[7px] w-[7px] rounded-full md:h-[8px] md:w-[8px] ${
                  i < v ? filledDotClass : emptyDotClass
                }`}
              />
            ))}
          </div>
          <span
            className={`text-[11px] font-semibold ${scoreColor}`}
          >
            {v}/5
          </span>
        </div>
      </div>
      <div className={`h-[6px] w-full rounded-full ${trackColor}`}>
        <div
          className={`h-full rounded-full ${fillColor}`}
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
  tickerSlot,
}) {
  const [pulsing, setPulsing] = useState(true);
  const [openId, setOpenId] = useState(null); // touch devices
  const [hoverId, setHoverId] = useState(null); // pointer devices
  const [selectedId, setSelectedId] = useState(null); // desktop sticky selection
  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const heroCoreRef = useRef(null);
  const [heroCoreHeight, setHeroCoreHeight] = useState(0);
  const [mapMetrics, setMapMetrics] = useState({
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
  });
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileMatchOpen, setMobileMatchOpen] = useState(false);
  const accordionRegionId = `${useId()}-match-panel`;
  const embedded = variant !== "standalone";
  const heroFullHeight = Math.max(heroCoreHeight, mapMetrics.height);

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

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const element = heroCoreRef.current;

    if (!element) {
      return undefined;
    }

    let animationFrame = null;

    const updateHeight = () => {
      if (!heroCoreRef.current) {
        return;
      }

      const rect = heroCoreRef.current.getBoundingClientRect();
      const nextHeight = rect.height;

      setHeroCoreHeight((prev) => {
        if (Math.abs(prev - nextHeight) < 0.5) {
          return prev;
        }

        return nextHeight;
      });
    };

    const scheduleUpdate = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(updateHeight);
    };

    scheduleUpdate();

    let resizeObserver = null;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(element);
    } else {
      window.addEventListener("resize", scheduleUpdate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", scheduleUpdate);
      }
    };
  }, [embedded, isMobileViewport]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mq = window.matchMedia("(max-width: 980px)");

    const handleChange = (event) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mq.matches);

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }

    mq.addListener(handleChange);
    return () => mq.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (!isMobileViewport) {
      setMobileMatchOpen(false);
    }
  }, [isMobileViewport]);

  useEffect(() => {
    if (isMobileViewport) {
      setSelectedId(null);
    }
  }, [isMobileViewport]);

  // Detect if the device supports hover (desktop/laptop)
  const canHover =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover)").matches;

  const isDesktopViewport = !isMobileViewport;

  const desktopActiveId = hoverId || selectedId || null;

  const activeId = isDesktopViewport
    ? canHover
      ? desktopActiveId
      : openId
    : canHover
    ? hoverId
    : openId;

  // Allow ESC to clear hover on desktop/pointer devices
  useEffect(() => {
    if (!canHover) return;
    const onEsc = (e) => e.key === "Escape" && setHoverId(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [canHover]);

  const handleMobileAccordionToggle = () => {
    setMobileMatchOpen((prev) => !prev);
  };

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
    ? "hero-frame relative mx-auto w-full rounded-[36px]"
    : "hero-frame relative mx-auto mt-4 rounded-2xl bg-white/70 p-3 shadow-sm border";

  const heroShellClasses = [
    "hero-shell",
    !embedded ? "no-panels" : "",
    embedded && !showQuickContact ? "no-left" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const heroShellDynamicStyle = {};

  if (mapMetrics.height > 0) {
    heroShellDynamicStyle["--hero-map-h"] = `${mapMetrics.height}px`;
  }

  const heroPanelsHeight = heroFullHeight > 0 ? heroFullHeight : 0;

  if (heroPanelsHeight > 0) {
    heroShellDynamicStyle["--hero-panels-h"] = `${Math.round(
      heroPanelsHeight
    )}px`;
  }

  const heroShellStyle =
    Object.keys(heroShellDynamicStyle).length > 0
      ? heroShellDynamicStyle
      : undefined;

  const resolvedTicker =
    typeof tickerSlot === "undefined" ? null : tickerSlot || null;
  const decoratedTicker =
    resolvedTicker &&
    React.isValidElement(resolvedTicker) &&
    resolvedTicker.type !== React.Fragment
      ? React.cloneElement(resolvedTicker, {
          className: [
            "hero-ticker-content",
            resolvedTicker.props.className || "",
          ]
            .filter(Boolean)
            .join(" "),
        })
      : resolvedTicker;
  const showTicker = Boolean(decoratedTicker);
  const mapFrameClassName = [
    "hero-map-frame",
  ]
    .filter(Boolean)
    .join(" ");
  const mobileMapClassName = [
    "hero-map-frame",
    "relative overflow-hidden rounded-[32px]",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id="northside-map" className={sectionClasses}>
      <div className={containerClasses}>
        {/* Bordered hero box (map + inline quick-contact) */}
        <div className={frameClasses}>
          <Styles />
          {embedded ? (
            <>
              <div className={heroShellClasses} style={heroShellStyle}>
                {showQuickContact ? (
                  <aside
                    className={`panel panel-left${
                      isMobileViewport ? " mobile-accordion-panel" : ""
                    }`}
                >
                  {isMobileViewport ? (
                    <div className="mobile-accordion">
                      <div className="flex flex-col gap-3 text-left text-white">
                        <span className="inline-flex w-fit items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/80">
                          Full-Service Guidance
                        </span>
                        <h3 className="text-[20px] font-semibold leading-tight">
                          Your NorthSide GTA Match
                        </h3>
                        <p className="text-sm text-white/80">
                          A guided approach tailored to how you want to live.
                        </p>
                        <button
                          type="button"
                          className="mobile-accordion-trigger inline-flex w-full items-center justify-center rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_4px_12px_rgba(50,97,14,0.35)] transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:ring-offset-2 focus:ring-offset-emerald-950"
                          aria-expanded={mobileMatchOpen}
                          aria-controls={accordionRegionId}
                          onClick={handleMobileAccordionToggle}
                        >
                          {mobileMatchOpen ? "Hide options" : "Start"}
                        </button>
                      </div>
                      <div
                        id={accordionRegionId}
                        className={`mobile-accordion-region${mobileMatchOpen ? " open" : ""}`}
                        aria-hidden={!mobileMatchOpen}
                      >
                        <div className="mobile-accordion-content pt-3">
                          <GuidedPathList variant="mobile" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <QuickContactCard
                      variant="overlay"
                      className="h-full"
                    />
                  )}
                </aside>
              ) : null}

              <div className="hero-core">
                <div className="hero-core-inner" ref={heroCoreRef}>
                  <div
                    ref={frameRef}
                    className={mapFrameClassName}
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
                      src="/Images/hero2000x1500.svg"
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
                        onClick={() => {
                          if (!isMobileViewport && canHover) {
                            setSelectedId(t.id);
                          } else {
                            setOpenId((cur) => (cur === t.id ? null : t.id));
                          }
                        }}
                      >
                        <span
                          className="pin"
                          style={{ animationPlayState: pulsing ? "running" : "paused" }}
                        />
                        <span className="sr-only">{t.name}</span>
                      </button>
                    ))}
                  </div>
                  {showTicker ? decoratedTicker : null}
                </div>
              </div>

              <aside className="panel panel-right">
                <FullServiceGuidancePanel className="flex h-full flex-col" />
              </aside>
            </div>
            </>
          ) : (
            <>
              <div
                className={mobileMapClassName}
                onMouseLeave={() => canHover && setHoverId(null)}
              >
                <img
                  src="/Images/hero2000x1500.svg"
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
                    onClick={() => {
                      if (!isMobileViewport && canHover) {
                        setSelectedId(t.id);
                      } else {
                        setOpenId((cur) => (cur === t.id ? null : t.id));
                      }
                    }}
                  >
                    <span
                      className="pin"
                      style={{
                        animationPlayState: pulsing ? "running" : "paused",
                      }}
                    />
                    <span className="sr-only">{t.name}</span>
                  </button>
                ))}
              </div>
              {showTicker ? decoratedTicker : null}
            </>
          )}

          {afterTicker && (
            <div className="hero-after border-t border-white/12 bg-white/5 backdrop-blur-sm">
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

const GUIDED_PATH_ICONS = {
  flag: Flag,
  landmark: Landmark,
  users: Users,
  train: Train,
  "piggy-bank": PiggyBank,
};

function GuidedPathList({ variant = "panel" }) {
  const isMobile = variant === "mobile";
  const listClasses = isMobile ? "space-y-3" : "space-y-3";
  const itemBase = [
    "group relative flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
    isMobile
      ? "border-white/15 bg-white/10 text-white"
      : "border-white/12 bg-white/5 text-emerald-50",
    "hover:-translate-y-0.5 hover:border-emerald-200/50 hover:bg-white/12 hover:shadow-[0_12px_30px_rgba(10,32,18,0.35)]",
    "active:translate-y-0 active:bg-white/15 active:shadow-[0_8px_18px_rgba(10,32,18,0.28)]",
    "after:absolute after:left-4 after:right-4 after:-bottom-1.5 after:h-px after:bg-white/10 after:opacity-70 last:after:hidden",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/70 focus-visible:ring-offset-2",
    isMobile ? "focus-visible:ring-offset-emerald-950" : "focus-visible:ring-offset-emerald-950",
  ].join(" ");
  const iconWrap = [
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors duration-200",
    isMobile
      ? "border-white/30 bg-white/12 group-hover:border-white/50 group-hover:bg-white/18"
      : "border-white/25 bg-white/10 group-hover:border-emerald-100/60 group-hover:bg-white/15",
  ].join(" ");
  const titleClasses = "text-sm font-semibold";
  const descriptionClasses = isMobile
    ? "text-xs text-white/70"
    : "text-xs text-emerald-100/70";
  const chevronClasses = isMobile
    ? "ml-auto mt-1 text-white/70"
    : "ml-auto mt-1 text-emerald-100/70 opacity-0 transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:opacity-80";

  return (
    <div className={listClasses}>
      {guidedPaths.map((path) => {
        const Icon = GUIDED_PATH_ICONS[path.iconKey] || Flag;
        return (
          <Link key={path.slug} to={`/guided/${path.slug}`} className={itemBase}>
            <span className={iconWrap}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className={titleClasses}>{path.title}</span>
              <span className={`mt-1 block ${descriptionClasses}`}>
                {path.description}
              </span>
            </span>
            <span className={chevronClasses} aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function FullServiceGuidancePanel({ className = "" }) {
  const containerClasses = [
    className,
    "pointer-events-auto flex h-full flex-col overflow-hidden rounded-[30px] border border-emerald-900/45 shadow-[0_30px_96px_rgba(24,47,10,0.55)] backdrop-blur-xl",
  ]
    .filter(Boolean)
    .join(" ");
  const headerClasses =
    "flex-none border-b border-emerald-200/20 bg-white/5 px-5 py-4 text-emerald-50";
  const bodyClasses =
    "flex-1 space-y-4 overflow-y-auto px-5 py-5 text-emerald-50/92";
  const panelSurfaceStyles = {
    backgroundImage:
      "radial-gradient(140% 140% at 15% 20%, rgba(44,113,73,0.32) 0%, rgba(6,27,16,0.96) 52%, rgba(3,18,11,0.98) 100%)",
    backgroundColor: "#04190e",
  };

  return (
    <div className={containerClasses} style={panelSurfaceStyles}>
      <div className={headerClasses}>
        <span className="inline-flex w-fit items-center justify-center rounded-full border border-white/35 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-50/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
          Full-Service Guidance
        </span>
        <h3 className="mt-3 text-lg font-semibold leading-tight text-emerald-50 md:text-xl">
          Find Your Place in the NorthSide GTA
        </h3>
        <p className="mt-2 text-sm text-emerald-100/80">
          Choose a lifestyle and let us narrow it down for you.
        </p>
      </div>
      <div className={bodyClasses}>
        <GuidedPathList />
      </div>
    </div>
  );
}

function TownInsightCard({
  town,
  mode = "desktop",
  onDismiss,
  className = "",
  appearance = "default",
  isActive = false,
}) {
  const isMobile = mode === "mobile";
  const isPanel = appearance === "panel";
  const isDesktopPanel = isPanel && !isMobile;
  const hasTown = Boolean(town);

  const containerClasses = [
    className,
    isDesktopPanel
      ? `pointer-events-auto flex h-full flex-col overflow-hidden rounded-[30px] border transition-colors duration-300 backdrop-blur-xl ${
          isActive
            ? "border-emerald-300/60 shadow-[0_36px_110px_rgba(34,68,10,0.5)]"
            : "border-emerald-900/45 shadow-[0_30px_96px_rgba(24,47,10,0.55)]"
        }`
      : isPanel
      ? "flex flex-col overflow-hidden rounded-[26px] border border-white/12 bg-emerald-950/75 shadow-[0_24px_60px_rgba(18,36,12,0.45)] backdrop-blur-xl"
      : isMobile
      ? "rounded-[26px] border border-emerald-200/80 bg-white/96 shadow-xl shadow-emerald-900/10"
      : "pointer-events-auto overflow-hidden rounded-[30px] border border-emerald-200/70 bg-white/96 shadow-[0_24px_60px_rgba(233,24,0.18)] backdrop-blur",
  ]
    .filter(Boolean)
    .join(" ");

  const headerClasses = isDesktopPanel
    ? `flex-none border-b border-emerald-200/20 px-5 py-4 text-emerald-50 transition-colors duration-300 ${
        isActive ? "bg-white/10" : "bg-white/5"
      }`
    : isPanel
    ? isMobile
      ? "flex-none border-b border-white/12 bg-white/10 px-4 py-3 text-white"
      : "flex-none border-b border-white/10 bg-white/8 px-5 py-4 text-white"
    : isMobile
    ? "flex-none rounded-t-[26px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 px-4 py-3 text-white"
    : "flex-none rounded-t-[30px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 px-5 py-4 text-white";

  const bodyClasses = isDesktopPanel
    ? "flex-1 space-y-5 overflow-y-auto px-5 py-5 text-emerald-50/92 transition-opacity duration-300"
    : isPanel
    ? isMobile
      ? "space-y-4 px-4 py-4 text-emerald-50/90"
      : "flex-1 space-y-5 overflow-y-auto px-5 py-5 text-emerald-50/90"
    : isMobile
    ? "space-y-4 px-4 py-4"
    : "flex-1 space-y-5 overflow-y-auto px-5 py-5";

  const panelSurfaceStyles = isDesktopPanel
    ? {
        backgroundImage:
          "radial-gradient(140% 140% at 15% 20%, rgba(44,113,73,0.32) 0%, rgba(6,27,16,0.96) 52%, rgba(3,18,11,0.98) 100%)",
        backgroundColor: "#04190e",
      }
    : undefined;

  if (!hasTown) {
    const placeholderAvatarClasses = `flex h-10 w-10 items-center justify-center rounded-full text-lg ${
      isDesktopPanel
        ? "bg-white/10 text-emerald-50 ring-1 ring-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
        : isPanel
        ? "bg-white/15"
        : "bg-white/20"
    }`;
    const placeholderSubtitleClasses = `text-[11px] uppercase ${
      isDesktopPanel
        ? "tracking-[0.38em] text-emerald-100/70"
        : isPanel
        ? "tracking-[0.32em] text-emerald-100/70"
        : "tracking-[0.32em] text-emerald-100/80"
    }`;
    const placeholderTitleClasses = isDesktopPanel
      ? "text-lg font-semibold leading-tight text-emerald-50 md:text-xl"
      : "text-lg font-semibold leading-tight md:text-xl";
    const placeholderBodyClasses = `text-sm ${
      isDesktopPanel
        ? "panel-summary md:truncate text-emerald-50/90"
        : isPanel
        ? "panel-summary md:truncate text-emerald-50/85"
        : "truncate text-emerald-900/80"
    }`;
    const placeholderChipWrapperClasses = isPanel
      ? "insights-grid text-sm font-semibold text-emerald-50/95"
      : "grid grid-cols-2 gap-2 text-sm font-semibold text-emerald-900/85";
    const placeholderChipClasses = isPanel
      ? `chip${isDesktopPanel ? " ring-1 ring-white/15 backdrop-blur-sm" : ""}`
      : "rounded-xl px-3 py-2 text-center shadow-sm border border-emerald-100/70 bg-emerald-50/70";
    const placeholderFooterClasses = `text-[11px] uppercase tracking-[0.28em] ${
      isDesktopPanel
        ? "text-emerald-100/75"
        : isPanel
        ? "text-emerald-100/70"
        : "text-emerald-500/80"
    }`;

    return (
      <div className={containerClasses} style={panelSurfaceStyles}>
        <div className={headerClasses}>
          <div className="flex items-center gap-3">
            <div className={placeholderAvatarClasses}>
              {isDesktopPanel ? (
                <TownGlyph className="h-5 w-5 text-emerald-100/85" />
              ) : (
                "🧭"
              )}
            </div>
            <div>
              <p className={placeholderSubtitleClasses}>Town insights</p>
              <p className={placeholderTitleClasses}>
                Preview prices, commute, schools, and lifestyle.
              </p>
            </div>
          </div>
        </div>
        <div className={bodyClasses}>
          <p className={placeholderBodyClasses}>
            Hover or click a town to unlock nightly intel.
          </p>
          <div className={placeholderChipWrapperClasses}>
            {PANEL_CHIPS.map((label) => (
              <div key={label} className={placeholderChipClasses}>
                {label}
              </div>
            ))}
          </div>
          <p className={placeholderFooterClasses}>
            NorthSide GTA • Insights refreshed nightly
          </p>
        </div>
      </div>
    );
  }

  const avatarClasses = `flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
    isDesktopPanel
      ? isActive
        ? "bg-white/15 text-emerald-50 ring-2 ring-emerald-200/60 shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
        : "bg-white/12 text-emerald-100/85 ring-1 ring-white/20"
      : isPanel
      ? "bg-white/15"
      : "bg-white/20"
  }`;
  const headerSubtitleClasses = `text-[11px] uppercase ${
    isDesktopPanel
      ? "tracking-[0.38em] text-emerald-100/70"
      : isPanel
      ? "tracking-[0.32em] text-emerald-100/70"
      : "tracking-[0.32em] text-emerald-100/80"
  }`;
  const townNameClasses = isDesktopPanel
    ? "text-lg font-semibold leading-tight tracking-[0.02em] text-emerald-50 md:text-xl"
    : "text-lg font-semibold leading-tight md:text-xl";
  const summaryClasses = isDesktopPanel
    ? "panel-summary md:truncate text-sm md:text-[15px] text-emerald-50/90"
    : isPanel
    ? "panel-summary md:truncate text-sm md:text-[15px] text-emerald-50/90"
    : "truncate text-sm md:text-[15px] text-emerald-900/85";
  const townLogo =
    town?.logo || (town?.id ? TOWN_LOGO_PATHS[town.id] : undefined);
  const metricCardVariant = isDesktopPanel
    ? "border border-emerald-400/20 bg-emerald-950/35 shadow-[0_18px_48px_rgba(3,22,14,0.45)] backdrop-blur-sm"
    : isPanel
    ? "border border-white/14 bg-white/8 shadow-black/30"
    : "border border-emerald-100/70 bg-white/70 shadow-emerald-900/10";
  const footerClasses = `text-[11px] uppercase tracking-[0.28em] ${
    isDesktopPanel
      ? "text-emerald-100/75"
      : isPanel
      ? "text-emerald-100/70"
      : "text-emerald-500/80"
  }`;
  const seeTownButtonClasses = `inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] transition ${
    isDesktopPanel
      ? "bg-white/10 text-emerald-50/90 hover:bg-white/15"
      : "bg-white/15 text-white hover:bg-white/25"
  }`;
  const seeTownBadgeClasses = `inline-flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold uppercase tracking-[0.12em] transition ${
    isDesktopPanel
      ? "bg-white/10 text-emerald-50/90 ring-1 ring-inset ring-white/30 hover:bg-white/15 hover:ring-white/45"
      : "bg-white/15 text-white"
  }`;

  return (
    <div className={containerClasses} style={panelSurfaceStyles}>
      <div className={headerClasses}>
        {isDesktopPanel ? (
          <div className="flex items-center gap-3">
            <div className={avatarClasses}>{town.name.slice(0, 1)}</div>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="min-w-0 text-left">
                <p className={headerSubtitleClasses}>NorthSide GTA</p>
                <div className="flex min-w-0 items-center gap-2">
                  {townLogo ? (
                    <span className="flex h-6 w-6 flex-none items-center justify-center overflow-hidden rounded-full border border-white/20 bg-emerald-500/20 shadow-[0_6px_16px_rgba(34,68,10,0.45)]">
                      <img
                        src={townLogo}
                        alt={`${town.name} emblem`}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  ) : (
                    <TownGlyph className="h-5 w-5 text-emerald-100/85" />
                  )}
                  <p className={`${townNameClasses} min-w-0 truncate`}>{town.name}</p>
                </div>
              </div>
            </div>
            <a
              href={town.url}
              className={`${seeTownBadgeClasses} shrink-0`}
              aria-label={`See town details for ${town.name}`}
              title={`See town details for ${town.name}`}
            >
              {town.name.slice(0, 1)}
            </a>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={avatarClasses}>{town.name.slice(0, 1)}</div>
              <div className="text-left">
                <p className={headerSubtitleClasses}>NorthSide GTA</p>
                {isDesktopPanel ? (
                  <div className="flex items-center gap-2">
                    {townLogo ? (
                      <span className="flex h-6 w-6 flex-none items-center justify-center overflow-hidden rounded-full border border-white/20 bg-emerald-500/20 shadow-[0_6px_16px_rgba(34,68,10,0.45)]">
                        <img
                          src={townLogo}
                          alt={`${town.name} emblem`}
                          className="h-full w-full object-cover"
                        />
                      </span>
                    ) : (
                      <TownGlyph className="h-5 w-5 text-emerald-100/85" />
                    )}
                    <p className={townNameClasses}>{town.name}</p>
                  </div>
                ) : (
                  <p className={townNameClasses}>{town.name}</p>
                )}
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
              <a href={town.url} className={seeTownButtonClasses}>
                See town
              </a>
            </div>
          </div>
        )}
      </div>
      <div className={bodyClasses}>
        {town.blurb && (
          <p className={summaryClasses}>
            {town.blurb}
          </p>
        )}

        <div
          className={`grid grid-cols-1 gap-3 ${
            isPanel ? "" : "sm:grid-cols-2"
          }`}
        >
          {CATEGORY_ORDER.filter(
            (k) => town.ratings && town.ratings[k] != null
          ).map((k) => (
            <div
              key={k}
              className={`rounded-2xl p-3 shadow-sm ${metricCardVariant}`}
            >
              <RatingRow
                label={CATEGORY_LABELS[k]}
                value={town.ratings[k]}
                tone={isPanel ? (isMobile ? "panel-mobile" : "panel-desktop") : "emerald"}
                icon={CATEGORY_ICONS[k]}
              />
            </div>
          ))}
        </div>

        <div className={footerClasses}>
          ★★★★★ Google reviews • Local data refreshed nightly
        </div>
      </div>
    </div>
  );
}
