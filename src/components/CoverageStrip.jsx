// src/components/CoverageStrip.jsx
import React from "react";

const TOWNS = [
  { name: "Georgina",           slug: "georgina",           href: "/communities/georgina",           icon: "/Images/towns/georgina.jpg" },
  { name: "East Gwillimbury",   slug: "east-gwillimbury",   href: "/communities/east-gwillimbury",   icon: "/Images/towns/east-gwillimbury.jpg" },
  { name: "Newmarket",          slug: "newmarket",          href: "/communities/newmarket",          icon: "/Images/towns/newmarket.jpg" },
  { name: "Aurora",             slug: "aurora",             href: "/communities/aurora",             icon: "/Images/towns/aurora.jpg" },
  { name: "Stouffville",        slug: "stouffville",        href: "/communities/stouffville",        icon: "/Images/towns/stouffville.jpg" },
  { name: "Uxbridge",           slug: "uxbridge",           href: "/communities/uxbridge",           icon: "/Images/towns/uxbridge.jpg" },
  { name: "Scugog",             slug: "scugog",             href: "/communities/scugog",             icon: "/Images/towns/scugog.jpg" },
];

const RAIL_CLASS = "coverage-strip__rail";

export default function CoverageStrip({ showLabels = true, className = "" }) {
  const rootClassName = `relative w-full bg-[#32610E] text-white ${className || ""}`.trim();

  const item = (t) => (
    <li key={t.slug} className="shrink-0">
      <a
        href={t.href}
        aria-label={`Explore ${t.name}`}
        className="group inline-flex items-center gap-2 rounded-xl px-3 py-1.5 transition hover:bg-[#3A7512] hover:shadow-sm"
      >
        <span className="inline-flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/95 ring-1 ring-black/10 overflow-hidden">
          <img
            src={t.icon}
            alt={`${t.name} badge`}
            width={32}
            height={32}
            className="h-full w-full object-cover"
            onError={(e) => {
              const el = e.currentTarget;
              const p = el.parentElement;
              if (p) p.textContent = t.name[0]?.toUpperCase() || "?";
              el.remove();
            }}
          />
        </span>
        {showLabels && (
          <span className="hidden md:inline text-[13px] font-semibold leading-none tracking-wide text-white/95 group-hover:text-white">
            {t.name}
          </span>
        )}
      </a>
    </li>
  );

  return (
    <div className={rootClassName}>
      <div className="mx-auto max-w-7xl px-3">
        <div className="flex flex-col items-center gap-1 py-1.5">
          {/* Compact centered NorthSide badge */}
          <div className="flex h-9 items-center justify-center">
            <a href="/" aria-label="NorthSide GTA" className="inline-flex items-center gap-2">
              <img
                src="/Images/brand/northside-mark.svg"
                alt=""
                width={18}
                height={18}
                className="h-4 w-4 md:h-[18px] md:w-[18px]"
                onError={(e) => {
                  e.currentTarget.remove();
                }}
              />
              <span className="text-[11px] md:text-xs font-bold tracking-wide uppercase text-white/90">
                NorthSide GTA
              </span>
            </a>
          </div>

          <ul className={`${RAIL_CLASS} flex w-full items-center justify-center gap-1 overflow-x-auto md:overflow-visible py-1 [scrollbar-width:none] [-ms-overflow-style:none]`}>
            <style>{`.${RAIL_CLASS}::-webkit-scrollbar{display:none}`}</style>
            {TOWNS.map(item)}
          </ul>
        </div>
      </div>
      {/* subtle top+bottom separators for depth */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#3A7512]/90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#264C0B]/90" />
    </div>
  );
}
