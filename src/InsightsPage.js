import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import CoverageStrip from "./components/CoverageStrip";
import Footer from "./Footer";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";

const PAGE_SIZE = 12;

function clampStyle(lines) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function useInfiniteFeed(items) {
  const [count, setCount] = useState(PAGE_SIZE);
  const endRef = useRef(null);

  useEffect(() => {
    setCount(PAGE_SIZE);
  }, [items]);

  const loadMore = useCallback(() => {
    setCount((current) => {
      const next = Math.min(current + PAGE_SIZE, items.length || Number.POSITIVE_INFINITY);
      return Number.isFinite(next) ? next : current + PAGE_SIZE;
    });
  }, [items.length]);

  const visibleItems = useMemo(() => items.slice(0, count), [items, count]);
  const hasMore = count < items.length;

  useEffect(() => {
    if (!hasMore) return undefined;
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const node = endRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return { visibleItems, hasMore, endRef, loadMore };
}

function InsightsHero() {
  return (
    <section className="space-y-8">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.42em] text-emerald-600">Insights</p>
        <h1 className="text-3xl font-semibold tracking-tight text-emerald-900 sm:text-4xl">
          NorthSide GTA Insights
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Stories, market updates, and local perspectives from across the NorthSide.
        </p>
      </div>
      <figure className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[36px] border border-emerald-100 bg-white/95 shadow-[0_40px_110px_rgba(50,97,14,0.18)]">
        <img
          src="/uploads/insights-hero-finally-home-agents.jpg"
          alt="Person typing on a laptop that shows the words Community Insights, with a fireplace and coffee in the background, representing NorthSide GTA real estate insights."
          className="h-auto w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </figure>
    </section>
  );
}

function MinimalSearch({ value, onChange }) {
  return (
    <div className="mt-6 w-full max-w-xl">
      <label className="sr-only" htmlFor="insights-search">
        Search insights
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg" aria-hidden>
          🔍
        </span>
        <input
          id="insights-search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search insights..."
          className="w-full rounded-2xl border border-emerald-100 bg-white/70 py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
          type="search"
        />
      </div>
    </div>
  );
}

function InsightCard({ item }) {
  const formattedDate = formatDate(item.publishDate);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-50 bg-white shadow-sm shadow-emerald-100 transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/insights/${item.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-emerald-50">
          {item.featureImage ? (
            <img
              src={item.featureImage}
              alt={item.featureImageAlt || item.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-emerald-700/60">No image</div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 px-5 py-5">
          {formattedDate && (
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600/80">
              {formattedDate}
            </span>
          )}
          <h3
            className="text-lg font-semibold text-slate-900"
            style={clampStyle(2)}
          >
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="text-sm text-slate-600" style={clampStyle(3)}>
              {item.excerpt}
            </p>
          )}
          <span className="mt-auto inline-flex items-center text-sm font-semibold text-emerald-700">
            Read more
            <span aria-hidden className="ml-1 transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function InsightsPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/content/insights/index.json", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const json = await response.json();
        if (!cancelled) {
          setItems(Array.isArray(json) ? json : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return items;
    return items.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const excerpt = (item.excerpt || "").toLowerCase();
      return title.includes(trimmed) || excerpt.includes(trimmed);
    });
  }, [items, query]);

  const { visibleItems, hasMore, endRef, loadMore } = useInfiniteFeed(filteredItems);
  const hasResults = visibleItems.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DynamicMetaTags {...INSIGHTS_ROUTE_META} />

      <Navigation />
      <CoverageStrip mode="static" showLabels />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <InsightsHero />
        <MinimalSearch value={query} onChange={setQuery} />

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-white/80 p-4 text-sm text-rose-600 shadow">
            Unable to load insights. {error}
          </div>
        )}

        {!error && loading && (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-emerald-50 bg-white/60 p-6 shadow-sm shadow-emerald-100"
              >
                <div className="mb-4 h-40 rounded-2xl bg-emerald-100/40" />
                <div className="mb-2 h-4 w-24 rounded-full bg-emerald-100/60" />
                <div className="mb-2 h-4 w-3/4 rounded-full bg-emerald-100/60" />
                <div className="h-4 w-2/3 rounded-full bg-emerald-100/60" />
              </div>
            ))}
          </div>
        )}

        {!loading && !hasResults && (
          <div className="mt-10 rounded-3xl border border-emerald-100 bg-white/80 p-10 text-center text-sm text-slate-600 shadow-sm">
            {query ? "No insights match your search yet." : "No insights published just yet. Check back soon."}
          </div>
        )}

        {hasResults && (
          <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <InsightCard key={item.slug} item={item} />
            ))}
          </section>
        )}

        {hasResults && hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              className="rounded-full border border-brand-green/40 px-5 py-2 text-sm font-semibold text-brand-green transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
            >
              Load more
            </button>
          </div>
        )}

        <div ref={endRef} className="h-px w-full" aria-hidden />
      </main>

      <Footer />
    </div>
  );
}
const INSIGHTS_ROUTE_META = getStaticRouteMeta("/insights") || {};

