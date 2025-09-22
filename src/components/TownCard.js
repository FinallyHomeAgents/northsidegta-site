// src/components/TownCard.js
import React from "react";

const CATEGORY_LABELS = {
  housePrices: "House Prices",
  commuterAccess: "Commuter Access",
  localTraffic: "Local Traffic",
  golf: "Golf Courses",
  fishing: "Fishing",
  trailsNature: "Trails & Nature",
  restaurants: "Restaurants",
  localEvents: "Local Events",
};

const CATEGORY_ORDER = [
  "housePrices",
  "commuterAccess",
  "localTraffic",
  "golf",
  "fishing",
  "trailsNature",
  "restaurants",
  "localEvents",
];

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function Star({ fraction }) {
  const pct = clamp(fraction, 0, 1) * 100;
  return (
    <span className="relative inline-block h-4 w-4 text-emerald-500">
      <span aria-hidden className="absolute inset-0 text-slate-200">★</span>
      <span
        aria-hidden
        className="absolute inset-0 overflow-hidden text-emerald-500"
        style={{ width: `${pct}%` }}
      >
        ★
      </span>
    </span>
  );
}

function StarRating({ name, ratingValue = 0, reviewCount, attribution }) {
  const value = clamp(Number(ratingValue) || 0, 0, 5);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="flex items-center" aria-hidden>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} fraction={value - idx} />
          ))}
        </div>
        <div className="flex items-baseline gap-1 text-slate-900">
          <span className="text-sm font-semibold">{value.toFixed(1)}</span>
          {reviewCount != null && reviewCount !== "" && (
            <span className="text-xs text-slate-500">({reviewCount})</span>
          )}
        </div>
      </div>
      <span className="text-xs text-slate-500">{attribution}</span>
      <span className="sr-only">
        {name ? `${name} is rated ${value.toFixed(1)} out of 5 stars.` : `Rated ${value.toFixed(1)} out of 5 stars.`}
      </span>
    </div>
  );
}

function MetricBar({ label, value }) {
  const score = clamp(Number(value) || 0, 0, 5);
  const percent = Math.round((score / 5) * 100);
  return (
    <div className="space-y-1" key={label}>
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <div
        className="relative h-1.5 overflow-hidden rounded-full bg-slate-200/80"
        role="img"
        aria-label={`${label} score ${score} out of 5 (${percent}%)`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="sr-only">{`${label}: ${score} out of 5 (${percent}%)`}</span>
    </div>
  );
}

export default function TownCard({
  name,
  tagline,
  href,
  ratingValue,
  reviewCount,
  attribution = "Google reviews • As seen on Instagram & Facebook",
  ratings = {},
  emblem,
}) {
  const metrics = CATEGORY_ORDER.filter((key) => ratings[key] != null).map((key) => ({
    key,
    label: CATEGORY_LABELS[key] || key,
    value: ratings[key],
  }));

  const initial = name ? name.charAt(0) : "";

  return (
    <article
      className="group relative flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:transform-none focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 focus-within:ring-offset-white"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-lg font-semibold text-emerald-700 shadow-inner">
            {emblem ? (
              <img
                src={emblem}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span aria-hidden>{initial}</span>
            )}
            <span className="sr-only">{name}</span>
          </div>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{name}</h3>
            {tagline && <p className="text-sm text-slate-600">{tagline}</p>}
          </div>
        </div>
        {href && (
          <a
            href={href}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            See town
          </a>
        )}
      </div>

      <StarRating
        name={name}
        ratingValue={ratingValue}
        reviewCount={reviewCount}
        attribution={attribution}
      />

      {metrics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => (
            <MetricBar key={metric.key} label={metric.label} value={metric.value} />
          ))}
        </div>
      )}
    </article>
  );
}
