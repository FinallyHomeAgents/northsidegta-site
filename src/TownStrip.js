// src/TownStrip.js
import React from "react";

const TOWNS = [
  {
    id: "georgina",
    name: "Georgina",
    href: "/georgina",
    img: "/Images/towns/georgina.jpg",
    blurb: "Lake life & beaches.",
  },
  {
    id: "uxbridge",
    name: "Uxbridge",
    href: "/uxbridge",
    img: "/Images/towns/uxbridge.jpg",
    blurb: "Trails & small-town charm.",
  },
  {
    id: "east-gwillimbury",
    name: "East Gwillimbury",
    href: "/east-gwillimbury",
    // <-- If your actual file is named differently, the onError below will try alternates.
    img: "/Images/towns/eastgwillimbury.jpg",
    blurb: "New builds & 404 access.",
  },
  {
    id: "newmarket",
    name: "Newmarket",
    href: "/newmarket",
    img: "/Images/towns/newmarket.jpg",
    blurb: "Shops, dining, GO train.",
  },
  {
    id: "stouffville",
    name: "Stouffville",
    href: "/stouffville",
    img: "/Images/towns/stouffville.jpg",
    blurb: "Family streets & parks.",
  },
  {
    id: "aurora",
    name: "Aurora",
    href: "/aurora",
    img: "/Images/towns/aurora.jpg",
    blurb: "Schools & quiet streets.",
  },
  {
    id: "scugog",
    name: "Scugog",
    href: "/scugog",
    img: "/Images/towns/scugog.jpg",
    blurb: "Heritage & lakefront.",
  },
];

// Tries a couple of filename variants if the first img 404s.
function onImgError(e, townId) {
  const el = e.currentTarget;
  const tried = el.getAttribute("data-tried") || "0";

  // Common alternates: hyphenated, TitleCase, or with spaces removed.
  const variants = [
    el.src.replace("eastgwillimbury.jpg", "east-gwillimbury.jpg"),
    el.src.replace("eastgwillimbury.jpg", "EastGwillimbury.jpg"),
  ];

  const idx = parseInt(tried, 10);
  if (idx < variants.length) {
    el.setAttribute("data-tried", String(idx + 1));
    el.src = variants[idx];
  } else {
    // final fallback: hide broken image icon
    el.style.display = "none";
  }
}

// Small, glossy cards intended to live inside a parent "attached" box
export default function TownStrip() {
  return (
    <section aria-label="Explore NorthSide GTA Towns">
      {/* Mobile: horizontal rail; Desktop: tight 7-col grid */}
      <div className="mt-2 lg:mt-3">
        {/* Mobile scroll rail */}
        <div className="block md:hidden -mx-4 px-4">
          <div
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {TOWNS.map((t) => (
              <a
                key={t.id}
                href={t.href}
                className="snap-start shrink-0 w-48 rounded-xl border bg-white/95 shadow-sm hover:shadow-md transition-shadow"
                aria-label={`Explore ${t.name}`}
              >
                {/* No cropping: use object-contain with a fixed aspect and padding */}
                <div className="aspect-[4/3] bg-emerald-50/30 rounded-t-xl flex items-center justify-center p-2">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                    onError={(e) => onImgError(e, t.id)}
                  />
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{t.blurb}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Desktop compact grid */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-7 gap-3">
          {TOWNS.map((t) => (
            <a
              key={t.id}
              href={t.href}
              className="group rounded-xl border bg-white/95 shadow-sm hover:shadow-md transition-shadow"
              aria-label={`Explore ${t.name}`}
            >
              <div className="aspect-[4/3] bg-emerald-50/30 rounded-t-xl flex items-center justify-center p-2">
                <img
                  src={t.img}
                  alt={t.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-[1.03] transition-transform duration-200"
                  loading="lazy"
                  onError={(e) => onImgError(e, t.id)}
                />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{t.blurb}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
