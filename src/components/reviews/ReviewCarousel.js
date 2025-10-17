import React, { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../../utils/analytics";
import "./review-carousel.css";

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

export default function ReviewCarousel({ reviews = [], disclaimer, route = "/contact" }) {
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
          route,
          action: "autoplay",
          review_index: nextIndex,
        });
        return nextIndex;
      });
    }, 6000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [normalized.length, route, showControls]);

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
        route,
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
      <div className="reviews-carousel__shell">
        <div className="reviews-carousel__accent" aria-hidden />
        <div className="reviews-carousel__inner">
          {normalized.map((review, index) => (
            <article
              key={review.id}
              className={`reviews-carousel__slide ${index === active ? "is-active" : ""}`}
              aria-hidden={index !== active}
            >
              <header className="reviews-carousel__header">
                <span className="reviews-carousel__badge">
                  <img src="/Images/google-logo.png" alt="Google reviews" loading="lazy" />
                  Google Verified
                </span>
                <span className="reviews-carousel__source">Finally Home Agents clients</span>
              </header>
              <p className="reviews-carousel__quote">{review.quote}</p>
              <div className="reviews-carousel__meta">
                <div className="reviews-carousel__rating">
                  <Stars rating={review.rating} />
                  <span>5.0 rating</span>
                </div>
                <span className="reviews-carousel__author">{review.name}</span>
                {review.date && <time className="reviews-carousel__date">{review.date}</time>}
              </div>
            </article>
          ))}

          {showControls && (
            <div className="reviews-carousel__controls" aria-hidden>
              <button
                type="button"
                onClick={() => handleMove("prev")}
                className="reviews-carousel__button"
                aria-label="Previous review"
              >
                <span aria-hidden>‹</span>
              </button>
              <button
                type="button"
                onClick={() => handleMove("next")}
                className="reviews-carousel__button"
                aria-label="Next review"
              >
                <span aria-hidden>›</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {disclaimer && <p className="reviews-carousel__disclaimer">{disclaimer}</p>}
    </section>
  );
}

function Stars({ rating }) {
  const rounded = Math.round(rating || 5);
  return (
    <span className="reviews-carousel__stars">
      {Array.from({ length: rounded }).map((_, idx) => (
        <span key={idx}>★</span>
      ))}
    </span>
  );
}
