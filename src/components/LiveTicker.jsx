// src/components/LiveTicker.jsx
import React, { useRef, useEffect, useMemo } from "react";
import "../styles/ticker.css";
import { TICKER_ITEMS } from "../data/tickerItems";

export default function LiveTicker({
  items = TICKER_ITEMS,
  speedPxPerSec = 90,
  speedPxPerSecMobile = 70,
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const spanRef = useRef(null);

  const content = useMemo(() => items.join("  •  ") + "  •  ", [items]);

  useEffect(() => {
    const container = containerRef.current;
    const span = spanRef.current;
    const track = trackRef.current;
    if (!container || !span || !track) return;

    const apply = () => {
      const prefersReduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        track.style.animation = "none";
        track.style.removeProperty("--crawl-duration");
        return;
      }

      const mobile =
        window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

      // one span width is the loop distance
      const spanWidth = span.scrollWidth;
      const speed = mobile ? speedPxPerSecMobile : speedPxPerSec;
      const duration = (container.offsetWidth + spanWidth) / Math.max(speed, 1);

      track.style.setProperty("--crawl-duration", `${duration}s`);
    };

    const ro = new ResizeObserver(apply);
    ro.observe(container);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(apply).catch(() => {});
    }
    apply();

    return () => ro.disconnect();
  }, [content, speedPxPerSec, speedPxPerSecMobile]);

  return (
    <div className="ns-ticker-frame" role="region" aria-label="NorthSide Live updates">
      <div className="ns-ticker-bar" ref={containerRef} aria-live="polite">
        <div className="ns-ticker-track" ref={trackRef}>
          {/* two identical spans → seamless loop */}
          <span className="ns-ticker-text" ref={spanRef}>{content}</span>
          <span className="ns-ticker-text" aria-hidden="true">{content}</span>
        </div>
      </div>
    </div>
  );
}
