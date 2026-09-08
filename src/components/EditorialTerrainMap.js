import React, { useEffect, useMemo, useRef, useState } from "react";
import { COMMUNITIES, CONTEXT, FILTERS } from "./editorialTerrainData";

const ROUTE = "M520 664 C528 615 535 570 540 520 C548 447 545 380 548 310 C551 250 553 187 554 122";

export default function EditorialTerrainMap() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [entered, setEntered] = useState(false);
  const closeRef = useRef(null);
  const mapRef = useRef(null);
  const reducedMotion = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const activeTown = COMMUNITIES.find((town) => town.id === selected);
  const filter = FILTERS.find((item) => item.id === activeFilter);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntered(true);
        observer.disconnect();
      }
    }, { rootMargin: "120px", threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { if (selected) closeRef.current?.focus(); }, [selected]);

  const selectTown = (town) => {
    setSelected(town.id);
    window.gtag?.("event", "map_community_select", { community: town.name });
  };

  return (
    <section ref={mapRef} className={`terrain ${entered ? "terrain--entered" : ""} ${selected ? "terrain--selected" : ""}`} style={{ "--camera-x": `${activeTown?.camera[0] || 0}px`, "--camera-y": `${activeTown?.camera[1] || 0}px` }} aria-label="Editorial terrain map of the NorthSide GTA">
      <div className="terrain__filters" aria-label="Discover communities by lifestyle">
        {FILTERS.map((item) => <button key={item.id} type="button" aria-pressed={activeFilter === item.id} onClick={() => setActiveFilter(activeFilter === item.id ? null : item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
      </div>
      <div className="terrain__viewport">
        <svg className="terrain__map" viewBox="110 45 1060 660" role="group" aria-label="Select one of seven NorthSide GTA communities">
          <defs>
            <linearGradient id="terrain-water" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#9fc7c7"/><stop offset="1" stopColor="#c7ddda"/></linearGradient>
            <linearGradient id="terrain-land" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#284a2d"/><stop offset=".6" stopColor="#173a24"/><stop offset="1" stopColor="#0d291c"/></linearGradient>
            <pattern id="terrain-contours" width="90" height="50" patternUnits="userSpaceOnUse"><path d="M-10 42 Q20 8 55 29 T105 15" fill="none" stroke="#c6bd86" strokeOpacity=".18" strokeWidth="1"/></pattern>
            <filter id="terrain-shadow"><feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#05150c" floodOpacity=".38"/></filter>
            <filter id="terrain-glow"><feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#e3c66c" floodOpacity=".85"/></filter>
          </defs>
          <path className="terrain__water" d="M95 40H1180V142L1085 137 980 152 875 126 805 91 730 78 660 91 590 76 490 106 420 135 398 112 340 113 305 135 235 105 165 125 95 115ZM95 640 Q330 625 555 653 T1180 646V720H95Z"/>
          <text className="terrain__water-label" x="660" y="67">LAKE SIMCOE</text><text className="terrain__water-label" x="650" y="690">LAKE ONTARIO</text>
          <g className="terrain__context">{CONTEXT.map((area) => <g key={area.name}><path d={area.path}/><text x={area.label[0]} y={area.label[1]}>{area.name}</text></g>)}</g>
          <path className="terrain__base" d="M165 125L235 105 305 135 340 113 398 112 420 135 490 106 590 76 660 91 730 78 805 91 875 126 1050 148 1070 374 1140 520 1140 640 165 640Z"/>
          <path className="terrain__contours" d="M165 125L235 105 305 135 340 113 398 112 420 135 490 106 590 76 660 91 730 78 805 91 875 126 1050 148 1070 374 1140 520 1140 640 165 640Z"/>
          <g className={`terrain__regions ${hovered || selected || filter ? "has-focus" : ""}`}>
            {COMMUNITIES.map((town) => {
              const emphasized = town.id === hovered || town.id === selected || (!hovered && !selected && filter?.towns.includes(town.id));
              return <g key={town.id} className={`terrain__region ${emphasized ? "is-emphasized" : ""} ${selected === town.id ? "is-selected" : ""} ${filter && !filter.towns.includes(town.id) ? "is-filtered" : ""}`} role="button" tabIndex="0" aria-label={`Explore ${town.name}. ${town.subtitle}`} aria-pressed={selected === town.id} onPointerEnter={() => setHovered(town.id)} onPointerLeave={() => setHovered(null)} onFocus={() => setHovered(town.id)} onBlur={() => setHovered(null)} onClick={() => selectTown(town)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectTown(town); } }}>
                <path className="terrain__region-shadow" d={town.path}/><path className="terrain__region-fill" d={town.path}/><text className="terrain__town-name" x={town.label[0]} y={town.label[1]} textAnchor="middle">{town.name.includes("–") ? <><tspan x={town.label[0]} dy="-8">Whitchurch–</tspan><tspan x={town.label[0]} dy="28">Stouffville</tspan></> : town.name}</text><text className="terrain__town-sub" x={town.label[0]} y={town.label[1]+23} textAnchor="middle">{town.subtitle}</text>
              </g>;
            })}
          </g>
          <path className={`terrain__route ${entered ? "is-drawn" : ""} ${selected ? "is-active" : ""}`} d={ROUTE}/><rect className="terrain__shield" x="538" y="180" width="31" height="21" rx="5"/><text className="terrain__shield-text" x="553.5" y="195" textAnchor="middle">404</text>
          <ellipse className="terrain__lake-small" cx="1010" cy="300" rx="18" ry="54" transform="rotate(12 1010 300)"/><text className="terrain__lake-small-label" x="1010" y="298" textAnchor="middle">LAKE</text><text className="terrain__lake-small-label" x="1010" y="311" textAnchor="middle">SCUGOG</text>
          <g className="terrain__toronto"><path d="M365 640v-34h8v34m10 0v-50h9v50m14 0v-75h10v75m16 0v-45h10v45m20 0v-86h9v86m18 0v-53h10v53"/><text x="420" y="672">Toronto</text></g>
        </svg>
        <div className="terrain__status" aria-live="polite">{filter ? `${filter.label}: ${filter.towns.length} communities emphasized` : "Select a community to explore"}</div>
        {activeTown && <aside className="terrain-card" aria-label={`${activeTown.name} community details`}>
          <button ref={closeRef} className="terrain-card__close" type="button" aria-label={`Close ${activeTown.name} details`} onClick={() => { setSelected(null); mapRef.current?.querySelector(`[aria-label^="Explore ${activeTown.name}"]`)?.focus(); }}>×</button>
          <img src={activeTown.image} alt={`${activeTown.name} community`} width="420" height="190"/>
          <div className="terrain-card__body"><p className="terrain-card__eyebrow">{activeTown.subtitle}</p><h3>{activeTown.name}</h3><p>{activeTown.description}</p><p className="terrain-card__travel"><span aria-hidden="true">↗</span>{activeTown.travel}</p><a href={activeTown.url} onClick={() => window.gtag?.("event", "map_community_cta", { community: activeTown.name })}>Explore {activeTown.name} <span aria-hidden="true">→</span></a></div>
        </aside>}
      </div>
      <p className="terrain__hint">Hover, tap or use Tab to discover each community</p>
      {reducedMotion && <span className="sr-only">Map animations are disabled according to your motion preference.</span>}
    </section>
  );
}
