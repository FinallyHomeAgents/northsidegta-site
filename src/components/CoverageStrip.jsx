'use client';

// src/components/CoverageStrip.jsx
import React, { useMemo } from "react";

const TOWNS = [
  { name: "Georgina",           slug: "georgina",           href: "/communities/georgina",           icon: "/assets/town-logos/georgina.webp" },
  { name: "East Gwillimbury",   slug: "east-gwillimbury",   href: "/communities/east-gwillimbury",   icon: "/assets/town-logos/east-gwillimbury.webp" },
  { name: "Newmarket",          slug: "newmarket",          href: "/communities/newmarket",          icon: "/assets/town-logos/newmarket.webp" },
  { name: "Aurora",             slug: "aurora",             href: "/communities/aurora",             icon: "/assets/town-logos/aurora.webp" },
  { name: "Stouffville",        slug: "stouffville",        href: "/communities/stouffville",        icon: "/assets/town-logos/stouffville.webp" },
  { name: "Uxbridge",           slug: "uxbridge",           href: "/communities/uxbridge",           icon: "/assets/town-logos/uxbridge.webp" },
  { name: "Scugog",             slug: "scugog",             href: "/communities/scugog",             icon: "/assets/town-logos/scugog.webp" },
];

const LIST_CLASS = "coverage-strip__list";

export default function CoverageStrip({ className = "" }) {
  const towns = useMemo(() => TOWNS, []);
  const rootClassName = `relative w-full border-b border-emerald-100/80 bg-[#f8faf5] text-slate-700 ${className || ""}`.trim();

  return (
    <div className={rootClassName} aria-label="NorthSide GTA town shortcuts">
      <div className="mx-auto max-w-7xl px-3 py-1 sm:px-6 lg:px-8">
        <div className="flex w-full items-center gap-2 overflow-hidden">
          <span className="hidden flex-shrink-0 rounded-full border border-emerald-100 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-green/80 shadow-sm sm:inline-flex">
            Towns
          </span>

          <ul className={`${LIST_CLASS} flex flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] md:justify-between`}>
            {towns.map((town) => (
              <li key={town.slug} className="shrink-0">
                <a
                  href={town.href}
                  aria-label={`Explore ${town.name}`}
                  className="group inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-slate-600 transition duration-150 hover:bg-white hover:text-brand-green hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green/70 md:px-2.5"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-emerald-100 transition duration-150 group-hover:ring-emerald-200 md:h-7 md:w-7">
                    <img
                      src={town.icon}
                      alt=""
                      width={28}
                      height={28}
                      className="h-full w-full rounded-full object-contain p-0.5"
                      loading="lazy"
                    />
                  </span>
                  <span className="hidden whitespace-nowrap md:inline">{town.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .${LIST_CLASS}::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
