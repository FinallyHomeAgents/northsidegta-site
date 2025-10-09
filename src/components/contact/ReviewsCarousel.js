import React, { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../../utils/analytics";

function normalizeReview(review, index) {
  if (!review) return null;
  const displayName = review.shortName || review.name || review.reviewer || "Client";
  return {
    id: review.id || `${index}`,
    name: displayName,
    rating: Number(review.rating || 5),
    quote: review.quote || review.text || "",
    date: review.date || "",
    fullName: review.name || review.reviewer || displayName,
  };
}

export default function ReviewsCarousel({ reviews = [], disclaimer }) {
  const normalized = useMemo(
    () => reviews.map(normalizeReview).filter((item) => item && item.quote),
    [reviews]
  );

  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const showControls = normalized.length > 1;

  useEffect(() => {
    if (typeof window === "undefined" || !showControls) return undefined;
    timerRef.current = window.setInterval(() => {
      setActive((prev) => {
        const nextIndex = (prev + 1) % normalized.length;
        trackEvent("review_carousel_interaction", {
          route: "/contact",
          action: "autoplay",
          review_index: nextIndex,
        });
        return nextIndex;
      });
    }, 6000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [normalized.length, showControls]);

  const handleMove = (direction) => {
    if (!showControls) return;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActive((prev) => {
      const next = direction === "next" ? prev + 1 : prev - 1;
      const normalizedIndex = (next + normalized.length) % normalized.length;
      trackEvent("review_carousel_interaction", {
        route: "/contact",
        action: direction,
        review_index: normalizedIndex,
      });
      return normalizedIndex;
    });
  };

  if (normalized.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 reviews-carousel" aria-live="polite">
      <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-white/80 p-1 shadow-xl shadow-emerald-900/5 backdrop-blur">
        <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" aria-hidden />
        <div className="relative rounded-[28px] bg-white p-6 sm:p-10">
          {normalized.map((review, index) => (
            <article
              key={review.id}
              className={`transition-all duration-700 ${
                index === active
                  ? "relative opacity-100"
                  : "pointer-events-none absolute inset-0 opacity-0"
              }`}
              aria-hidden={index !== active}
            >
              <header className="flex flex-wrap items-center gap-3 text-emerald-700">
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
                  <img
                    src="/Images/google-logo.png"
                    alt="Google reviews"
                    className="h-4 w-4 object-contain"
                    loading="lazy"
                  />
                  Google Verified
                </div>
                <span className="text-xs text-emerald-500">NorthSide GTA clients</span>
              </header>
              <p className="mt-6 text-lg leading-relaxed text-emerald-950 sm:text-xl">
                {review.quote}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-emerald-700">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                  <Stars rating={review.rating} />
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700/80">
                    5.0 rating
                  </span>
                </div>
                <span className="font-semibold text-emerald-900">{review.name}</span>
                {review.date && (
                  <time className="text-xs uppercase tracking-[0.2em] text-emerald-500/80">
                    {review.date}
                  </time>
                )}
              </div>
            </article>
          ))}

          {showControls && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
              <button
                type="button"
                onClick={() => handleMove("prev")}
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white/90 text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Previous review"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => handleMove("next")}
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white/90 text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Next review"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
      {disclaimer && (
        <p className="text-xs text-center uppercase tracking-[0.3em] text-emerald-500/80">
          {disclaimer}
        </p>
      )}
    </section>
  );
}

function Stars({ rating }) {
  const rounded = Math.round(rating || 5);
  return (
    <span className="flex items-center gap-0.5 text-[#FBBC05]">
      {Array.from({ length: rounded }).map((_, idx) => (
        <span key={idx}>★</span>
      ))}
    </span>
  );
}
