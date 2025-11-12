// src/components/CoverageStrip.jsx
import React from "react";

/**
 * CoverageStrip — a slim, site-wide strip that showcases the NorthSide GTA towns.
 * Uses our existing NorthSide-style town JPGs.
 * Appears directly under the Navigation bar.
 * Each image links to its community page.
 */

const TOWNS = [
  { name: "Georgina", slug: "georgina", href: "/communities/georgina", icon: "/Images/towns/georgina.jpg" },
  { name: "East Gwillimbury", slug: "east-gwillimbury", href: "/communities/east-gwillimbury", icon: "/Images/towns/east-gwillimbury.jpg" },
  { name: "Newmarket", slug: "newmarket", href: "/communities/newmarket", icon: "/Images/towns/newmarket.jpg" },
  { name: "Aurora", slug: "aurora", href: "/communities/aurora", icon: "/Images/towns/aurora.jpg" },
  { name: "Stouffville", slug: "stouffville", href: "/communities/stouffville", icon: "/Images/towns/stouffville.jpg" },
  { name: "Uxbridge", slug: "uxbridge", href: "/communities/uxbridge", icon: "/Images/towns/uxbridge.jpg" },
  { name: "Scugog", slug: "scugog", href: "/communities/scugog", icon: "/Images/towns/scugog.jpg" },
];

function CoverageStrip({ mode = "static", showLabels = true, speed = 20, className = "" }) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const item = (t) => (
    <li key={t.slug} className="shrink-0 snap-center">
      <a
        href={t.href}
        aria-label={`Explore ${t.name}`}
        className="group flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-neutral-100 hover:shadow-sm dark:hover:bg-neutral-800"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 overflow-hidden">
          <img
            src={t.icon}
            alt={t.name}
            width={28}
            height={28}
            className="h-7 w-7 object-cover opacity-90 transition group-hover:opacity-100"
            onError={(e) => {
              const el = e.currentTarget;
              const parent = el.parentElement;
              if (parent) parent.textContent = t.name[0].toUpperCase();
              el.remove();
            }}
          />
        </span>
        {showLabels && (
          <span className="text-xs font-medium tracking-wide opacity-90 group-hover:opacity-100">
            {t.name}
          </span>
        )}
      </a>
    </li>
  );

  if (mode === "marquee") {
    return (
      <div
        className={`relative w-full border-b border-black/5 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/80 dark:border-white/10 ${className}`}
      >
        <div className="relative h-11 overflow-hidden">
          <div
            className={`flex h-11 items-center gap-2 whitespace-nowrap will-change-transform ${
              prefersReduced ? "" : "animate-[ns-marquee_linear_infinite]"
            }`}
            style={!prefersReduced ? { animationDuration: `${Math.max(10, 140 / speed)}s` } : undefined}
          >
            {[...TOWNS, ...TOWNS].map((t, i) => (
              <div key={`${t.slug}-${i}`} className="px-1">
                <a
                  href={t.href}
                  className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-neutral-100 hover:shadow-sm dark:hover:bg-neutral-800"
                >
                  <img src={t.icon} alt="" className="h-5 w-5 object-contain opacity-90 group-hover:opacity-100" />
                  {showLabels && (
                    <span className="text-xs font-medium tracking-wide opacity-90 group-hover:opacity-100">
                      {t.name}
                    </span>
                  )}
                </a>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes ns-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full border-b border-black/5 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/80 dark:border-white/10 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-3">
        <div className="flex h-11 items-center">
          <ul className="flex w-full items-center gap-1 overflow-x-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] snap-x">
            <style>{`ul::-webkit-scrollbar{display:none}`}</style>
            {TOWNS.map(item)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CoverageStrip;
