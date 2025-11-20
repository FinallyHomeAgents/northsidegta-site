// src/TownPage.js
import React from "react";
import { useParams, Link } from "react-router-dom";
import townsData from "./towns.json";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import QuickContactCard from "./QuickContactCard";
import TownStrip from "./TownStrip";
import TownPageLayout from "./components/towns/TownPageLayout";
import {
  FiTrendingUp,
  FiClock,
  FiMapPin,
  FiFlag,
  FiAnchor,
  FiFeather,
  FiCoffee,
  FiCalendar,
  FiUsers,
  FiBriefcase,
  FiActivity,
  FiHome,
  FiMap,
} from "react-icons/fi";

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

const RATING_ICONS = {
  housePrices: FiTrendingUp,
  commuterAccess: FiClock,
  localTraffic: FiMapPin,
  golf: FiFlag,
  fishing: FiAnchor,
  trailsNature: FiFeather,
  restaurants: FiCoffee,
  localEvents: FiCalendar,
};

const GENERIC_ICON_MAP = {
  leaf: FiFeather,
  users: FiUsers,
  map: FiMap,
  family: FiUsers,
  briefcase: FiBriefcase,
  activity: FiActivity,
  home: FiHome,
};

function DotRow({ value = 0 }) {
  const v = Math.round(value);
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            i < v ? "bg-brand-green" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function normalizeTowns(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.towns)) {
    return data.towns;
  }

  if (data && typeof data === "object") {
    return Object.values(data);
  }

  return [];
}

export default function TownPage() {
  const params = useParams();
  const paramSlug = (params.slug || params["*"] || "").toLowerCase();

  const towns = normalizeTowns(townsData);

  const town =
    towns.find((t) => (t.slug || "").toLowerCase() === paramSlug) ||
    towns.find(
      (t) =>
        `/${(t.slug || "").toLowerCase()}` ===
        window.location.pathname.toLowerCase()
    );

  if (!town) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderShell />
        <main className="flex-1 px-4 py-16 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-2">Town not found</h1>
          <p className="text-gray-600 mb-6">
            The page you’re looking for doesn’t exist yet.
          </p>
          <Link
            to="/"
            className="inline-block rounded bg-brand-green px-4 py-2 text-white transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
          >
            Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const slug = (town.slug || "").toLowerCase();
  const isUxbridge = slug === "uxbridge";

  if (town.hero && town.snapshot) {
    const ratingDescriptions = town.ratingDescriptions || {};
    const ratings = CATEGORY_ORDER.filter((k) => town.ratings?.[k] != null).map((key) => ({
      label: CATEGORY_LABELS[key] || key,
      score: town.ratings[key],
      description: ratingDescriptions[key],
      icon: RATING_ICONS[key],
    }));

    const mapIcon = (iconKey) => GENERIC_ICON_MAP[iconKey] || null;

    const lifestyleHighlights = Array.isArray(town.lifestyleHighlights)
      ? town.lifestyleHighlights.map((item) => ({
          ...item,
          icon: mapIcon(item?.icon),
        }))
      : [];

    const audiences = Array.isArray(town.audiences)
      ? town.audiences.map((item) => ({
          ...item,
          icon: mapIcon(item?.icon),
        }))
      : [];

    return (
      <div className="bg-white text-gray-900 min-h-screen overflow-x-hidden">
        <HeaderShell />
        <TownPageLayout
          townName={town.name}
          townSlug={slug}
          hero={town.hero}
          snapshot={town.snapshot}
          livingIntro={town.livingIntro}
          ratings={ratings}
          ratingScaleMax={5}
          lifestyleHighlights={lifestyleHighlights}
          audiences={audiences}
          neighbourhoods={town.neighbourhoods || []}
          faqs={town.faqs || []}
          cta={town.cta}
          summary={town.summary}
          guide={
            town.pdf
              ? {
                  href: town.pdf,
                  label: `Download ${town.name} Guide (PDF)`,
                }
              : null
          }
        />
        {isUxbridge && (
          <section className="mx-auto mt-10 max-w-5xl px-4">
            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">TasteHub Spotlight</p>
                  <h3 className="text-xl font-semibold text-emerald-900">Vote on the Best Pizza in Uxbridge</h3>
                  <p className="text-sm text-slate-600">
                    Join NorthSide TasteHub and help crown Uxbridge’s top slice. Cast your ballot and watch the leaderboard update live.
                  </p>
                </div>
                <Link
                  to="/tastehub/best-pizza-uxbridge"
                  className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
                >
                  Open Poll →
                </Link>
              </div>
            </div>
          </section>
        )}
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <TownStrip />
        </section>
        <Footer />
      </div>
    );
  }

  return (
    // Keep horizontal overflow hidden at the page level to prevent accidental widening.
    <div className="bg-white text-gray-900 min-h-screen overflow-x-hidden">
      <HeaderShell />

      {/* Hero */}
      <section className="relative isolate">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8">
          <div className="rounded-2xl border bg-white/70 shadow-sm overflow-hidden">
            <div className="relative">
              {/* Banner image (optional) */}
              {town.heroImage ? (
                <img
                  src={town.heroImage}
                  alt={`${town.name} banner`}
                  className="w-full h-56 md:h-72 object-cover"
                />
              ) : (
                <div className="w-full h-56 md:h-72 bg-gradient-to-br from-emerald-50 via-white to-emerald-50" />
              )}

              {/* Title overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                <div className="inline-block rounded-xl bg-white/90 backdrop-blur px-4 py-2 shadow">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {town.name}
                  </h1>
                </div>
              </div>
            </div>

            {/* Summary + download + MATCH card */}
            <div className="p-5 md:p-6 space-y-4">
            {town.summary && (
              <p className="text-gray-700 text-base md:text-lg">
                {town.summary}
              </p>
            )}

              <div className="flex flex-wrap items-center gap-3">
                {town.pdf && (
                  <a
                    href={town.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition"
                  >
                    Download {town.name} Guide (PDF)
                  </a>
                )}
              </div>

              {/* Your NorthSide GTA Match — lives inside the hero box */}
              <div className="pt-2">
                <QuickContactCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page body */}
      <main className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT column: Highlights, Ratings, Commute */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Highlights */}
            {Array.isArray(town.highlights) && town.highlights.length > 0 && (
              <section className="rounded-2xl border bg-white/80 shadow-sm p-5 md:p-6">
                <h2 className="text-xl font-semibold mb-3">Why {town.name}</h2>
                <ul className="grid sm:grid-cols-2 gap-2 list-disc pl-5 text-gray-800">
                  {town.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Ratings — MOBILE-FRIENDLY */}
            {town.ratings && (
              <section className="rounded-2xl border bg-white/80 shadow-sm p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-3">
                  Town Ratings
                </h2>

                {/* Mobile: clean vertical list; md+: two-column grid */}
                <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
                  {CATEGORY_ORDER.filter((k) => town.ratings[k] != null).map(
                    (k) => (
                      <div
                        key={k}
                        className="
                          flex items-center justify-between
                          rounded-lg border border-gray-200
                          px-3 py-3 md:py-2
                        "
                      >
                        <span className="text-sm md:text-base text-gray-800 pr-3 break-words">
                          {CATEGORY_LABELS[k]}
                        </span>
                        <DotRow value={town.ratings[k]} />
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Commute */}
            {town.commute && (
              <section className="rounded-2xl border bg-white/80 shadow-sm p-5 md:p-6">
                <h2 className="text-xl font-semibold mb-2">Commute</h2>
                <p className="text-gray-700">
                  Fastest route to <strong>404 &amp; Steeles</strong>:{" "}
                  <span className="font-semibold">
                    {town.commute.to404SteelesMinutes} minutes
                  </span>{" "}
                  (typical light-traffic estimate).
                </p>
              </section>
            )}

            {/* Town strip to navigate others — full-bleed scroller on mobile */}
            <section className="pt-2">
              {/* This wrapper creates its own horizontal scroll area (like Home). */}
              <div className="-mx-4 px-4 overflow-x-auto overscroll-x-contain">
                <div className="min-w-0">
                  <TownStrip />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT column intentionally empty now (card moved above) */}
          <aside className="space-y-6" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
