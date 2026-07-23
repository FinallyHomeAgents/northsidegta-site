// src/TownStrip.js
import React, { useEffect, useMemo, useRef } from "react";

/**
 * Final order (Closest → Furthest) from your snapshot:
 * Aurora (23), Newmarket (25), Stouffville (26), East Gwillimbury (27),
 * Georgina/Keswick (33), Uxbridge (37), Scugog/Port Perry (40)
 */
const CLOSEST_TO_FURTHEST = [
  "aurora",
  "newmarket",
  "stouffville",
  "east-gwillimbury",
  "georgina",
  "uxbridge",
  "scugog",
];

const TOWNS = [
  { id: "georgina",         name: "Georgina",         href: "/communities/georgina",         img: "/assets/town-logos/georgina.webp",        blurb: "Lake life & beaches." },
  { id: "uxbridge",         name: "Uxbridge",         href: "/communities/uxbridge",         img: "/assets/town-logos/uxbridge.webp",        blurb: "Trails & small-town charm." },
  { id: "east-gwillimbury", name: "East Gwillimbury", href: "/communities/east-gwillimbury", img: "/assets/town-logos/east-gwillimbury.webp", blurb: "New builds & 404 access." },
  { id: "newmarket",        name: "Newmarket",        href: "/communities/newmarket",        img: "/assets/town-logos/newmarket.webp",       blurb: "Shops, dining, GO train." },
  { id: "stouffville",      name: "Stouffville",      href: "/communities/stouffville",      img: "/assets/town-logos/stouffville.webp",     blurb: "Family streets & parks." },
  { id: "aurora",           name: "Aurora",           href: "/communities/aurora",           img: "/assets/town-logos/aurora.webp",          blurb: "Schools & quiet streets." },
  { id: "scugog",           name: "Scugog",           href: "/communities/scugog",           img: "/assets/town-logos/scugog.webp",          blurb: "Heritage & lakefront." },
];

function onImgError(e, townId) {
  const el = e.currentTarget;
  const tried = parseInt(el.getAttribute("data-tried") || "0", 10);
  const base = `/assets/town-logos/${townId}`;
  const variants = [`${base}.webp`, `${base}.png`];
  if (tried < variants.length) { el.setAttribute("data-tried", String(tried + 1)); el.src = variants[tried]; }
  else { el.style.display = "none"; }
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function TownStrip({ id }) {
  const ordered = useMemo(() => {
    const map = new Map(TOWNS.map((t) => [t.id, t]));
    return CLOSEST_TO_FURTHEST.map((id) => map.get(id)).filter(Boolean);
  }, []);

  const railRef = useRef(null);

  // Ensure the rail starts perfectly aligned (no partial card on first load)
  useEffect(() => {
    if (!railRef.current) return;
    railRef.current.scrollTo({ left: 0, behavior: "auto" });
  }, []);

  const scrollByAmount = (px) => railRef.current?.scrollBy({ left: px, behavior: "smooth" });

  return (
    <section id={id} aria-label="Closest to Toronto → Furthest">
      {/* Ribbon (text tweak requested) */}
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 text-white shadow">
          <span className="text-[10px] font-semibold tracking-wide uppercase opacity-90">
            Closest to Toronto → Furthest
          </span>
          <span className="hidden sm:inline text-[10px] opacity-85">
            (fastest route to 404 &amp; Steeles)
          </span>
        </div>

        {/* Arrow controls (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount(-240)}
            className="h-8 w-8 rounded-full border bg-white/90 hover:bg-white shadow-sm hover:shadow transition flex items-center justify-center"
            aria-label="Scroll left"
            title="Scroll left"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(240)}
            className="h-8 w-8 rounded-full border bg-white/90 hover:bg-white shadow-sm hover:shadow transition flex items-center justify-center"
            aria-label="Scroll right"
            title="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      {/* Scroll container — smaller cards + padding guards so nothing is clipped */}
      <div className="relative">
        {/* Subtle fades on edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white/90 to-transparent rounded-l-2xl" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white/90 to-transparent rounded-r-2xl" />

        <div
          ref={railRef}
          className="flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth no-scrollbar px-2"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollPaddingLeft: "12px",
            scrollPaddingRight: "12px",
          }}
        >
          {/* Left spacer prevents first card from appearing clipped under the fade */}
          <div className="shrink-0 w-1" aria-hidden />

          {ordered.map((t, idx) => (
            <a
              key={t.id}
              href={t.href}
              className="snap-start shrink-0 w-[130px] md:w-[150px] group"
              aria-label={`Explore ${t.name}`}
            >
              <div className="h-full rounded-2xl border border-white/60 bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-black/5 overflow-hidden transition group-hover:shadow-lg group-hover:-translate-y-0.5">
                {/* Image area (smaller heights) */}
                <div className="aspect-[4/3] bg-emerald-50/50 flex items-center justify-center">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-16 md:h-20 object-contain drop-shadow-sm transition-transform group-hover:scale-[1.02]"
                    loading="lazy"
                    onError={(e) => onImgError(e, t.id)}
                  />
                </div>

                {/* Body */}
                <div className="p-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-[12px] font-semibold text-gray-900">{t.name}</h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold tracking-wide">
                      {ordinal(idx + 1)}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-600 leading-4">{t.blurb}</p>
                </div>
              </div>
            </a>
          ))}

          {/* Right spacer prevents last card from being clipped */}
          <div className="shrink-0 w-1" aria-hidden />
        </div>
      </div>
    </section>
  );
}
