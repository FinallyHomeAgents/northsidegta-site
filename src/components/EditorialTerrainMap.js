import React, { useEffect, useMemo, useRef, useState } from "react";
import { COMMUNITIES, CONTEXT, FILTERS, getBalanceMatches } from "./editorialTerrainData";

const ROUTE = "M520 664 C528 615 535 570 540 520 C548 447 545 380 548 310 C551 250 553 187 554 122";

function MapIcon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "car") return <svg {...common}><path d="m5 17-1-5 2-5h12l2 5-1 5"/><path d="M5 12h14M7 17v2m10-2v2"/><circle cx="7" cy="14.5" r="1"/><circle cx="17" cy="14.5" r="1"/></svg>;
  if (name === "boat") return <svg {...common}><path d="m5 15 3-8 3 8m0 0V4l6 7-6 1"/><path d="M3 17c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0"/></svg>;
  if (name === "walk") return <svg {...common}><circle cx="13" cy="4" r="2"/><path d="m10 22 2-8-3-3 2-4 4 3 3 1M12 14l4 3 1 5M9 11l-4 3"/></svg>;
  if (name === "tree") return <svg {...common}><path d="m12 3-5 7h3l-5 7h14l-5-7h3zM12 17v4"/></svg>;
  if (name === "home") return <svg {...common}><path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6"/></svg>;
  if (name === "people") return <svg {...common}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c0-4 2-7 6-7s6 3 6 7M15 14c3 0 5 2 5 6"/></svg>;
  if (name === "leaf") return <svg {...common}><path d="M20 4C10 4 5 9 5 15c0 3 2 5 5 5 6 0 10-7 10-16Z"/><path d="M4 21c3-5 7-8 12-11"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="8"/></svg>;
}

export default function EditorialTerrainMap() {
  const [activeFilter, setActiveFilter] = useState("commute");
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState("georgina");
  const [entered, setEntered] = useState(false);
  const [balance, setBalance] = useState(58);
  const [balanceActive, setBalanceActive] = useState(false);
  const closeRef = useRef(null);
  const mapRef = useRef(null);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const activeTown = COMMUNITIES.find((town) => town.id === selected);
  const filter = FILTERS.find((item) => item.id === activeFilter);
  const balanceMatches = useMemo(() => getBalanceMatches(balance), [balance]);
  const balanceMatchIds = balanceMatches.map((town) => town.id);

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

  useEffect(() => {
    if (selected && document.activeElement?.classList.contains("terrain__region")) {
      closeRef.current?.focus();
    }
  }, [selected]);

  const selectTown = (town) => {
    setSelected(town.id);
    window.gtag?.("event", "map_community_select", { community: town.name });
  };

  const closeTown = () => {
    const townName = activeTown?.name;
    setSelected(null);
    requestAnimationFrame(() => {
      if (townName) mapRef.current?.querySelector(`[data-town-name="${townName}"]`)?.focus();
    });
  };

  const updateBalance = (event) => {
    const nextBalance = Number(event.target.value);
    const [closestTown] = getBalanceMatches(nextBalance, 1);
    setBalance(nextBalance);
    setBalanceActive(true);
    setActiveFilter(null);
    setSelected(closestTown.id);
  };

  return (
    <section
      ref={mapRef}
      className={`terrain ${entered ? "terrain--entered" : ""} ${selected ? "terrain--selected" : ""} ${balanceActive ? "terrain--balance-active" : ""}`}
      aria-label="Interactive aerial map of the NorthSide GTA"
    >
      <div className="terrain__filters" aria-label="Discover communities by lifestyle">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={activeFilter === item.id}
            onClick={() => {
              setBalanceActive(false);
              setActiveFilter(activeFilter === item.id ? null : item.id);
            }}
          >
            <MapIcon name={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="terrain__viewport">
        <svg className="terrain__map" viewBox="110 45 1060 660" role="group" aria-label="Select one of seven NorthSide GTA communities">
          <defs>
            <filter id="terrain-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ffe083" floodOpacity=".95"/>
            </filter>
            <filter id="terrain-pin-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffc55d" floodOpacity=".9"/>
            </filter>
          </defs>

          <text className="terrain__water-label" x="650" y="68">LAKE SIMCOE</text>
          <text className="terrain__water-label" x="650" y="691">LAKE ONTARIO</text>

          <g className="terrain__context">
            {CONTEXT.map((area) => (
              <g key={area.name}>
                <path d={area.path}/>
                <circle className="terrain__place-dot" cx={area.dot[0]} cy={area.dot[1]} r="4"/>
                <text x={area.label[0]} y={area.label[1]}>{area.name}</text>
              </g>
            ))}
          </g>

          <g className={`terrain__regions ${hovered || selected || filter ? "has-focus" : ""}`}>
            {COMMUNITIES.map((town) => {
              const balanceMatch = balanceActive && balanceMatchIds.includes(town.id);
              const emphasized = town.id === hovered || town.id === selected || (!hovered && (filter?.towns.includes(town.id) || balanceMatch));
              const splitName = town.name.includes("–");
              return (
                <g
                  key={town.id}
                  className={`terrain__region ${emphasized ? "is-emphasized" : ""} ${selected === town.id ? "is-selected" : ""} ${balanceMatch ? "is-balance-match" : ""} ${filter && !filter.towns.includes(town.id) ? "is-filtered" : ""}`}
                  role="button"
                  tabIndex="0"
                  data-town-name={town.name}
                  aria-label={`Explore ${town.name}. ${town.subtitle}`}
                  aria-pressed={selected === town.id}
                  onPointerEnter={() => setHovered(town.id)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(town.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => selectTown(town)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectTown(town);
                    }
                  }}
                >
                  <path className="terrain__region-shadow" d={town.path}/>
                  <path className="terrain__region-fill" d={town.path}/>
                  <circle className="terrain__place-dot terrain__place-dot--town" cx={town.dot[0]} cy={town.dot[1]} r="4.5"/>
                  <text className="terrain__town-name" x={town.label[0]} y={town.label[1]} textAnchor="middle">
                    {splitName ? (
                      <><tspan x={town.label[0]} dy="-8">Whitchurch–</tspan><tspan x={town.label[0]} dy="27">Stouffville</tspan></>
                    ) : town.name}
                  </text>
                  <text className="terrain__town-sub" x={town.label[0]} y={town.label[1] + (splitName ? 53 : 23)} textAnchor="middle">{town.subtitle}</text>
                </g>
              );
            })}
          </g>

          <path className={`terrain__route ${entered ? "is-drawn" : ""}`} d={ROUTE}/>
          <rect className="terrain__shield" x="538" y="180" width="31" height="21" rx="5"/>
          <text className="terrain__shield-text" x="553.5" y="195" textAnchor="middle">404</text>
          <text className="terrain__lake-small-label" x="1014" y="294" textAnchor="middle">LAKE</text>
          <text className="terrain__lake-small-label" x="1014" y="307" textAnchor="middle">SCUGOG</text>
          <g className="terrain__toronto"><circle cx="522" cy="644" r="5"/><text x="543" y="651">Toronto</text></g>
        </svg>

        <div className="terrain__compass" aria-hidden="true"><span>N</span><i/><b/></div>
        <div className="terrain__scale" aria-hidden="true"><span>0</span><span>10</span><span>15 km</span><i/></div>

        <label className="terrain-balance">
          <span className="terrain-balance__city" aria-hidden="true">▥</span>
          <span>Closer to Toronto</span>
          <input type="range" min="0" max="100" value={balance} onChange={updateBalance} aria-label="Balance proximity to Toronto with space and nature" aria-describedby="terrain-balance-status"/>
          <span>More space + nature</span>
          <span className="terrain-balance__nature" aria-hidden="true">▲</span>
        </label>

        <p id="terrain-balance-status" className="sr-only" aria-live="polite">
          {balanceActive
            ? `${balanceMatches[0].name} is the closest match, followed by ${balanceMatches[1].name}.`
            : "Move the slider to highlight communities that best match your preferred balance."}
        </p>

        <p className="sr-only" aria-live="polite">
          {filter ? `${filter.label}: ${filter.towns.length} communities emphasized.` : "All communities shown."}
        </p>

        {activeTown && (
          <aside className="terrain-card" aria-label={`${activeTown.name} community details`}>
            <button ref={closeRef} className="terrain-card__close" type="button" aria-label={`Close ${activeTown.name} details`} onClick={closeTown}>×</button>
            <div className="terrain-card__heading">
              <h3>{activeTown.name}</h3>
              <p>{activeTown.subtitle}</p>
            </div>
            <img src={activeTown.image} alt={`${activeTown.name} community`} width="420" height="190"/>
            <div className="terrain-card__body">
              <div className="terrain-card__travel">
                <div><strong>{activeTown.travel}</strong><span>to Downtown Toronto</span></div>
                <div className="terrain-card__gauge" aria-label={`${activeTown.commuteScore} out of 100 commute score`} style={{ "--score": `${activeTown.commuteScore * 1.8}deg` }}><MapIcon name="car" size={22}/></div>
              </div>
              <ul>
                {activeTown.highlights.map((highlight) => (
                  <li key={highlight.title}>
                    <span><MapIcon name={highlight.icon} size={18}/></span>
                    <div><strong>{highlight.title}</strong><small>{highlight.detail}</small></div>
                  </li>
                ))}
              </ul>
              <a href={activeTown.url} onClick={() => window.gtag?.("event", "map_community_cta", { community: activeTown.name })}>Explore {activeTown.name} <span aria-hidden="true">→</span></a>
            </div>
          </aside>
        )}
      </div>
      {reducedMotion && <span className="sr-only">Map animations are disabled according to your motion preference.</span>}
    </section>
  );
}
