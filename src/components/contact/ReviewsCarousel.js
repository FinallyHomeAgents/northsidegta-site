import React, { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../../utils/analytics";

function normalizeReview(review, index) {
  if (!review) return null;
  return {
    id: review.id || `${index}`,
    name: review.name || review.reviewer || "Client",
    rating: Number(review.rating || 5),
    quote: review.quote || review.text || "",
    date: review.date || "",
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

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 5);
    return Array.from({ length: rounded }).map((_, idx) => (
      <span key={idx}>★</span>
    ));
  };

  return (
    <section className="space-y-4 reviews-carousel" aria-live="polite">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
        <div className="grid gap-4 p-6 sm:p-8">
          {normalized.map((review, index) => (
            <article
              key={review.id}
              className={`transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0 pointer-events-none absolute"}`}
              aria-hidden={index !== active}
            >
              <header className="flex items-center gap-3 text-slate-700">
                <img
                  src="/Images/google-logo.png"
                  alt="Google"
                  className="h-6 w-6 object-contain"
                  loading="lazy"
                />
                <p className="text-sm font-semibold tracking-wide uppercase text-slate-400">
                  Real clients
                </p>
              </header>
              <p className="mt-4 text-lg text-slate-900 italic">{review.quote}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <strong className="text-base text-slate-900">
                  {review.name}
                </strong>
                <span aria-hidden="true">•</span>
                <span className="flex items-center gap-1 text-amber-500" aria-label={`${review.rating || 5} star review`}>
                  {renderStars(review.rating)}
                </span>
                {review.date && <time className="text-xs text-slate-400">{review.date}</time>}
              </div>
            </article>
          ))}
        </div>
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => handleMove("prev")}
              className="rounded-full bg-white/90 px-3 py-2 shadow focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Previous review"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => handleMove("next")}
              className="rounded-full bg-white/90 px-3 py-2 shadow focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Next review"
            >
              ›
            </button>
          </div>
        )}
      </div>
      {disclaimer && (
        <p className="text-xs text-slate-400 text-center">{disclaimer}</p>
      )}
    </section>
  );
}
