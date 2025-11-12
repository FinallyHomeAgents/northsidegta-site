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

export default function CoverageStrip({ showLabels = true, className = "" }) {
  const item = (t) => (
    <li key={t.slug} className="shrink-0 snap-center">
      <a
        href={t.href}
        aria-label={`Explore ${t.name}`}
        className="group flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-[#3A7512] hover:shadow-sm"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 ring-1 ring-black/10 overflow-hidden">
          <img
            src={t.icon}
            alt={t.name}
            width={28}
            height={28}
            className="h-7 w-7 object-cover opacity-95 transition group-hover:opacity-100"
            onError={(e) => {
              const el = e.currentTarget;
              const p = el.parentElement;
              if (p) p.textContent = t.name[0]?.toUpperCase() || "?";
              el.remove();
            }}
          />
        </span>
        {showLabels && (
          <span className="text-xs font-semibold tracking-wide text-white/95 group-hover:text-white">
            {t.name}
          </span>
        )}
      </a>
    </li>
  );

  return (
    <div className={`relative w-full bg-[#32610E] text-white ${className}`}>
      <div className="mx-auto max-w-7xl px-3">
        <div className="flex h-11 items-center">
          <ul className="flex w-full items-center gap-1 overflow-x-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] snap-x">
            <style>{`ul::-webkit-scrollbar{display:none}`}</style>
            {TOWNS.map(item)}
          </ul>
        </div>
      </div>
      {/* subtle top+bottom separators for depth */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#3A7512]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#264C0B]" />
    </div>
  );
}
