import { useEffect, useRef } from "react";

function getNumericAttribute(element, name) {
  const value = element?.getAttribute(name);
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function useInstagramEmbedFit(enabled, extraDeps = []) {
  const frameRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof window === "undefined") return undefined;
    const frameEl = frameRef.current;
    if (!frameEl) return undefined;

    let rafId = 0;

    const restore = () => {
      const iframe = frameEl.querySelector("iframe");
      if (!iframe) return;
      iframe.style.transform = "";
      iframe.style.transformOrigin = "";
      iframe.style.width = "";
      iframe.style.height = "";
      iframe.style.maxWidth = "";
      iframe.style.maxHeight = "";
      iframe.style.position = "";
      iframe.style.left = "";
      iframe.style.top = "";
    };

    const applyScale = () => {
      const iframe = frameEl.querySelector("iframe");
      if (!iframe) return;

      const frameRect = frameEl.getBoundingClientRect();
      if (frameRect.width === 0 || frameRect.height === 0) return;

      const intrinsicWidth =
        getNumericAttribute(iframe, "width") || iframe.offsetWidth || iframe.scrollWidth || frameRect.width;
      const intrinsicHeight =
        getNumericAttribute(iframe, "height") || iframe.offsetHeight || iframe.scrollHeight || frameRect.height;

      if (!intrinsicWidth || !intrinsicHeight) return;

      const scale = Math.min(frameRect.width / intrinsicWidth, frameRect.height / intrinsicHeight);
      if (!Number.isFinite(scale) || scale <= 0) return;

      const scaledWidth = intrinsicWidth * scale;
      const scaledHeight = intrinsicHeight * scale;

      const transformValue = `scale(${scale})`;
      const widthValue = `${intrinsicWidth}px`;
      const heightValue = `${intrinsicHeight}px`;
      const leftValue = `${(frameRect.width - scaledWidth) / 2}px`;
      const topValue = `${(frameRect.height - scaledHeight) / 2}px`;

      if (iframe.style.transformOrigin !== "top center") {
        iframe.style.transformOrigin = "top center";
      }
      if (iframe.style.transform !== transformValue) {
        iframe.style.transform = transformValue;
      }
      if (iframe.style.width !== widthValue) {
        iframe.style.width = widthValue;
      }
      if (iframe.style.height !== heightValue) {
        iframe.style.height = heightValue;
      }
      if (iframe.style.maxWidth !== "none") {
        iframe.style.maxWidth = "none";
      }
      if (iframe.style.maxHeight !== "none") {
        iframe.style.maxHeight = "none";
      }
      if (iframe.style.position !== "absolute") {
        iframe.style.position = "absolute";
      }
      if (iframe.style.left !== leftValue) {
        iframe.style.left = leftValue;
      }
      if (iframe.style.top !== topValue) {
        iframe.style.top = topValue;
      }
    };

    const schedule = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        // allow iframe layout to settle after Instagram mutates DOM
        rafId = window.requestAnimationFrame(applyScale);
      });
    };

    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(frameEl, { childList: true, subtree: true, attributes: true });

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    resizeObserver?.observe(frameEl);

    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", schedule);
      restore();
    };
  }, [enabled, ...extraDeps]);

  return frameRef;
}
