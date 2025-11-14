'use client';

// src/components/CoverageStrip.jsx
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

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
const RAIL_CLASS = "northside-town-rail";
const LABEL_CLASS = "northside-town-rail__label";

export default function CoverageStrip({ className = "" }) {
  const towns = useMemo(() => TOWNS, []);
  const rootClassName = `relative w-full bg-[#32610E] text-white ${className || ""}`.trim();
  const ulRef = useRef(null);
  const railRef = useRef(null);
  const labelRef = useRef(null);

  const updateRailLine = useCallback(() => {
    const rail = railRef.current;
    const label = labelRef.current;

    if (!rail || !label) {
      return;
    }

    const offset = label.offsetLeft + label.offsetWidth + 12;
    rail.style.setProperty("--rail-line-left", `${offset}px`);
  }, []);

  useLayoutEffect(() => {
    updateRailLine();

    const supportsResizeObserver = typeof ResizeObserver !== "undefined";
    const ro = supportsResizeObserver ? new ResizeObserver(updateRailLine) : null;

    if (ro) {
      if (railRef.current) {
        ro.observe(railRef.current);
      }
      if (labelRef.current) {
        ro.observe(labelRef.current);
      }
    }

    return () => {
      if (ro) {
        ro.disconnect();
      }
    };
  }, [updateRailLine]);

  useEffect(() => {
    updateRailLine();
    window.addEventListener("resize", updateRailLine);

    return () => {
      window.removeEventListener("resize", updateRailLine);
    };
  }, [updateRailLine]);

  const item = (t) => (
    <li key={t.slug} className="relative z-10 shrink-0">
      <a
        href={t.href}
        aria-label={`Explore ${t.name}`}
        className="group relative inline-flex items-end gap-2 rounded-full px-3 py-1 font-medium transition duration-200 hover:-translate-y-[1px] hover:bg-[#3A7512] hover:shadow-[0_10px_22px_-16px_rgba(0,0,0,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
      >
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#32610E] shadow-sm ring-2 ring-white/60 transition duration-200 md:h-9 md:w-9 group-hover:ring-white">
          <img
            src={t.icon}
            alt={`${t.name} badge`}
            width={32}
            height={32}
            className="h-full w-full rounded-full object-cover"
            onError={(e) => {
              const el = e.currentTarget;
              const p = el.parentElement;
              if (p) p.textContent = t.name[0]?.toUpperCase() || "?";
              el.remove();
            }}
          />
        </span>
        <span className="hidden pb-[1px] text-[13px] leading-none tracking-wide text-white/90 transition duration-200 group-hover:text-white md:inline">
          {t.name}
        </span>
      </a>
    </li>
  );

  return (
    <div className={rootClassName}>
      <div className="mx-auto max-w-7xl px-3 py-1.5">
        <div
          ref={railRef}
          className={`${RAIL_CLASS} relative flex w-full items-end gap-3 overflow-hidden py-1 md:gap-6`}
        >
          <span
            ref={labelRef}
            className={`${LABEL_CLASS} relative z-20 flex-shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 shadow-sm backdrop-blur-[1px] md:px-4`}
          >
            NorthSide GTA Towns
          </span>

          <ul
            ref={ulRef}
            className={`${LIST_CLASS} relative z-10 flex flex-1 items-end gap-2 overflow-x-auto pl-1 [scrollbar-width:none] [-ms-overflow-style:none] md:gap-3 md:pl-2 md:justify-between`}
          >
            {towns.map(item)}
          </ul>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#3A7512]/90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#264C0B]/90" />

      <style>{`
        .${RAIL_CLASS}{
          --rail-line-left: 140px;
        }
        .${RAIL_CLASS}::before{
          content:"";
          position:absolute;
          top:calc(50% + 3px);
          left:var(--rail-line-left);
          right:0;
          height:2px;
          background:linear-gradient(90deg,rgba(255,255,255,0.25)0%,rgba(255,255,255,0.15)45%,rgba(255,255,255,0.08)100%);
          border-radius:9999px;
          z-index:0;
        }
        @media (min-width:768px){
          .${RAIL_CLASS}::before{
            top:calc(50% + 4px);
            height:2px;
          }
        }
        .${LIST_CLASS}::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
