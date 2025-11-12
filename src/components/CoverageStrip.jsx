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

const LIST_CLASS = "coverage-strip__list";

export default function CoverageStrip({ className = "" }) {
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
        <span className="hidden md:inline text-[13px] font-semibold leading-none tracking-wide text-white/95 group-hover:text-white">
          {t.name}
        </span>
      </a>
    </li>
  );

  return (
    <div className={rootClassName}>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] md:h-[3px] bg-white/12 z-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] md:h-[3px] w-[40%] bg-gradient-to-r from-white/30 to-transparent animate-[ns-sweep_3s_ease-in-out_infinite] rounded-full" />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] md:h-[3px] w-[40%] bg-gradient-to-l from-white/30 to-transparent animate-[ns-sweep_3s_ease-in-out_infinite] rounded-full"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+18px)] md:-translate-y-[calc(50%+22px)] z-20">
        <div className="relative">
          <div className="mx-auto h-3 w-3 md:h-3.5 md:w-3.5 rounded-full bg-white ring-2 ring-[#32610E] shadow-[0_0_0_2px_rgba(255,255,255,0.25)]" />
          <div className="absolute -inset-2 rounded-full bg-white/15 blur-sm" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-3">
        <div className="flex justify-center">
          <ul className={`${LIST_CLASS} relative z-10 flex w-full items-center justify-center gap-1 overflow-x-auto md:overflow-visible py-2 [scrollbar-width:none] [-ms-overflow-style:none]`}>
            <style>{`.${LIST_CLASS}::-webkit-scrollbar{display:none}`}</style>
            {TOWNS.map(item)}
          </ul>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#3A7512]/90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#264C0B]/90" />

      <style>{`@keyframes ns-sweep{0%{opacity:.2;transform:translateX(-50%) scaleX(.4)}50%{opacity:.6}100%{opacity:.2;transform:translateX(-50%) scaleX(1)}}`}</style>
    </div>
  );
}
