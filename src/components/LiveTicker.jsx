import React, { useEffect, useMemo, useRef } from "react";
import "../styles/ticker.css";
import { TICKER_ITEMS } from "../data/tickerItems";

function addMqlListener(mql, handler) {
  if (!mql) return () => {};
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }
  if (typeof mql.addListener === "function") {
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }
  return () => {};
}

export default function LiveTicker({
  items = TICKER_ITEMS,
  speedPxPerSec = 90,
  speedPxPerSecMobile = 70,
}) {
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const content = useMemo(() => items.join("  •  ") + "  •  ", [items]);
  const duplicated = useMemo(() => content + content, [content]);

  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const mobileQuery =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
        ? window.matchMedia("(max-width: 768px)")
        : null;

    let frameId;

    const applyDuration = () => {
      if (!trackRef.current || !containerRef.current) return;

      if (prefersReduced && prefersReduced.matches) {
        trackRef.current.style.animation = "none";
        trackRef.current.style.removeProperty("--crawl-duration");
        return;
      }

      trackRef.current.style.removeProperty("animation");
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = trackRef.current.scrollWidth / 2;
      const speed = mobileQuery && mobileQuery.matches ? speedPxPerSecMobile : speedPxPerSec;
      const duration = (containerWidth + textWidth) / (speed || 1);
      trackRef.current.style.setProperty("--crawl-duration", `${duration}s`);
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(applyDuration);
    };

    requestUpdate();

    const cleanups = [];
    if (prefersReduced) {
      const handler = () => requestUpdate();
      cleanups.push(addMqlListener(prefersReduced, handler));
    }
    if (mobileQuery) {
      const handler = () => requestUpdate();
      cleanups.push(addMqlListener(mobileQuery, handler));
    }

    const resizeHandler = () => requestUpdate();
    window.addEventListener("resize", resizeHandler);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeHandler);
      cleanups.forEach((fn) => fn());
    };
  }, [content, speedPxPerSec, speedPxPerSecMobile]);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const pause = () => {
      track.style.animationPlayState = "paused";
    };
    const resume = () => {
      track.style.animationPlayState = "";
    };

    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", resume);
    container.addEventListener("touchcancel", resume);

    return () => {
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
      container.removeEventListener("touchcancel", resume);
    };
  }, []);

  return (
    <div
      className="ns-ticker-frame"
      role="region"
      aria-label="NorthSide Live updates"
      tabIndex={0}
    >
      <div className="ns-ticker-bar" ref={containerRef} aria-live="polite">
        <div className="ns-ticker-track" ref={trackRef}>
          <span className="ns-ticker-text">{duplicated}</span>
        </div>
      </div>
    </div>
  );
}
