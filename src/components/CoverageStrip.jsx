// src/components/CoverageStrip.jsx
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import "../styles/townsbar.css";

const TOWNS = [
  { name: "Georgina",           slug: "georgina",           href: "/communities/georgina",           icon: "/Images/towns/georgina.jpg" },
  { name: "East Gwillimbury",   slug: "east-gwillimbury",   href: "/communities/east-gwillimbury",   icon: "/Images/towns/east-gwillimbury.jpg" },
  { name: "Newmarket",          slug: "newmarket",          href: "/communities/newmarket",          icon: "/Images/towns/newmarket.jpg" },
  { name: "Aurora",             slug: "aurora",             href: "/communities/aurora",             icon: "/Images/towns/aurora.jpg" },
  { name: "Stouffville",        slug: "stouffville",        href: "/communities/stouffville",        icon: "/Images/towns/stouffville.jpg" },
  { name: "Uxbridge",           slug: "uxbridge",           href: "/communities/uxbridge",           icon: "/Images/towns/uxbridge.jpg" },
  { name: "Scugog",             slug: "scugog",             href: "/communities/scugog",             icon: "/Images/towns/scugog.jpg" },
];

export default function CoverageStrip({ className = "" }) {
  const towns = useMemo(() => TOWNS, []);
  const rootClassName = `ns-townsbar ${className || ""}`.trim();
  const location = useLocation();
  const pathname = location?.pathname || "";

  const item = (t) => {
    const isActive = pathname === t.href || pathname.startsWith(`${t.href}/`);

    return (
      <a
        key={t.slug}
        href={t.href}
        aria-label={`Explore ${t.name}`}
        className={`ns-townchip${isActive ? " is-active" : ""}`}
      >
        <span className="ns-townchip__badge">
          <img
            src={t.icon}
            alt={`${t.name} badge`}
            width={38}
            height={38}
            className="ns-townchip__icon"
            onError={(e) => {
              const el = e.currentTarget;
              const p = el.parentElement;
              if (p) p.textContent = t.name[0]?.toUpperCase() || "?";
              el.remove();
            }}
          />
        </span>
        <span className="ns-townchip__dot" aria-hidden />
        <span className="ns-townchip__name">{t.name}</span>
      </a>
    );
  };

  return (
    <div className={rootClassName}>
      <div className="ns-townsbar__inner">
        <div className="ns-townsbar__title">
          <span className="ns-townsbar__mark" aria-hidden>
            N
          </span>
          <span className="ns-townsbar__label">NORTHSIDE GTA TOWNS</span>
        </div>
        <span className="ns-townsbar__rail" aria-hidden />
        <div className="ns-townsbar__scroller">{towns.map(item)}</div>
      </div>
    </div>
  );
}
